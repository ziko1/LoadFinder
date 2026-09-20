package com.loadfinder.app.auth

import android.content.Context
import android.content.Intent
import android.net.Uri
import com.loadfinder.app.BuildConfig
import com.loadfinder.app.data.api.ApiAuthStore
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import net.openid.appauth.*
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

@Singleton
class OidcSession @Inject constructor(
    @ApplicationContext context: Context,
    private val store: ApiAuthStore
) {
    private val service by lazy { AuthorizationService(context) }
    private val lock = Mutex()
    private fun readState() = store.getAuthState()?.let { runCatching { AuthState.jsonDeserialize(it) }.getOrNull() }
    private val _signedIn = MutableStateFlow(readState()?.isAuthorized == true)
    val signedIn = _signedIn.asStateFlow()
    fun subject(): String? = runCatching {
        val token = readState()?.accessToken ?: return null
        val claims = String(android.util.Base64.decode(token.split('.')[1], android.util.Base64.URL_SAFE), Charsets.UTF_8)
        org.json.JSONObject(claims).optString("sub").takeIf { it.isNotBlank() }
    }.getOrNull()
    val configured get() = BuildConfig.OIDC_ISSUER.startsWith("https://") && BuildConfig.OIDC_CLIENT_ID.isNotBlank()

    suspend fun loginIntent(): Intent = withContext(Dispatchers.Main) {
        check(configured) { "Цю збірку ще не підключено до сервера входу." }
        val configuration = suspendCancellableCoroutine<AuthorizationServiceConfiguration> { c ->
            AuthorizationServiceConfiguration.fetchFromIssuer(Uri.parse(BuildConfig.OIDC_ISSUER)) { value, error ->
                if(c.isActive) {
                    if(value != null) c.resume(value)
                    else c.resumeWithException(error ?: IllegalStateException("Не вдалося відкрити вхід"))
                }
            }
        }
        val request = AuthorizationRequest.Builder(configuration, BuildConfig.OIDC_CLIENT_ID,
            ResponseTypeValues.CODE, Uri.parse("com.loadfinder.app:/oauth2redirect"))
            .setScope(BuildConfig.OIDC_SCOPES).build() // AppAuth generates state, nonce and PKCE.
        service.getAuthorizationRequestIntent(request)
    }

    suspend fun completeLogin(intent: Intent?) = lock.withLock {
        requireNotNull(intent) { "Вхід скасовано" }
        val response = AuthorizationResponse.fromIntent(intent)
        val error = AuthorizationException.fromIntent(intent)
        if(response == null) throw error ?: IllegalStateException("Вхід скасовано")
        val state = AuthState(response, error)
        val token = withContext(Dispatchers.Main) {
            suspendCancellableCoroutine<TokenResponse> { c ->
                service.performTokenRequest(response.createTokenExchangeRequest()) { value, failure ->
                    if(c.isActive) {
                        if(value != null) c.resume(value)
                        else c.resumeWithException(failure ?: IllegalStateException("Не вдалося завершити вхід"))
                    }
                }
            }
        }
        state.update(token, null)
        check(state.isAuthorized && !state.accessToken.isNullOrBlank()) { "Сервер не надав доступ до API" }
        store.setAuthState(state.jsonSerializeString())
        store.setToken(state.accessToken)
        _signedIn.value = true
    }

    suspend fun accessToken(): String? = lock.withLock {
        val state = readState() ?: return@withLock null
        try {
            val token = withContext(Dispatchers.Main) {
                suspendCancellableCoroutine<String> { c ->
                    state.performActionWithFreshTokens(service) { access, _, error ->
                        if(c.isActive) {
                            if(access != null) c.resume(access)
                            else c.resumeWithException(error ?: IllegalStateException("Потрібно увійти повторно"))
                        }
                    }
                }
            }
            store.setAuthState(state.jsonSerializeString())
            store.setToken(token)
            token
        } catch(e: AuthorizationException) {
            if(e.type == AuthorizationException.TYPE_OAUTH_TOKEN_ERROR) { store.clear(); _signedIn.value = false }
            throw java.io.IOException("Не вдалося оновити вхід", e)
        }
    }

    suspend fun logout() = lock.withLock { store.clear(); _signedIn.value = false }
}
