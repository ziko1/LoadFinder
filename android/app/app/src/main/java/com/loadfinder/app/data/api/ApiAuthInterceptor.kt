package com.loadfinder.app.data.api

import android.content.Context
import android.util.Base64
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ApiAuthInterceptor @Inject constructor(
    private val authStore: ApiAuthStore
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val token = authStore.getToken()
        val request = chain.request().newBuilder()
            .apply { if (!token.isNullOrBlank()) header("Authorization", "Bearer $token") }
            .build()
        return chain.proceed(request)
    }
}

@Singleton
class ApiAuthStore @Inject constructor(
    @dagger.hilt.android.qualifiers.ApplicationContext private val context: Context
) {
    private val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun setToken(value: String?) {
        val clean = value?.trim()?.takeIf { it.isNotEmpty() }
        if (clean == null) {
            prefs.edit().remove(KEY_TOKEN).remove(KEY_IV).apply()
            return
        }
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, key())
        val ciphertext = cipher.doFinal(clean.toByteArray(Charsets.UTF_8))
        prefs.edit()
            .putString(KEY_TOKEN, Base64.encodeToString(ciphertext, Base64.NO_WRAP))
            .putString(KEY_IV, Base64.encodeToString(cipher.iv, Base64.NO_WRAP))
            .apply()
    }

    fun getToken(): String? {
        val encoded = prefs.getString(KEY_TOKEN, null) ?: return null
        val ivEncoded = prefs.getString(KEY_IV, null) ?: return null
        return runCatching {
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(
                Cipher.DECRYPT_MODE,
                key(),
                GCMParameterSpec(128, Base64.decode(ivEncoded, Base64.NO_WRAP))
            )
            String(cipher.doFinal(Base64.decode(encoded, Base64.NO_WRAP)), Charsets.UTF_8)
        }.getOrNull()?.trim()?.takeIf { it.isNotEmpty() }
    }

    fun clear() {
        prefs.edit().remove(KEY_TOKEN).remove(KEY_IV).apply()
    }

    private fun key(): SecretKey {
        val ks = KeyStore.getInstance(ANDROID_KEYSTORE).apply { load(null) }
        val existing = ks.getKey(KEY_ALIAS, null) as? SecretKey
        if (existing != null) return existing
        val generator = KeyGenerator.getInstance("AES", ANDROID_KEYSTORE)
        generator.init(
            android.security.keystore.KeyGenParameterSpec.Builder(
                KEY_ALIAS,
                android.security.keystore.KeyProperties.PURPOSE_ENCRYPT or
                    android.security.keystore.KeyProperties.PURPOSE_DECRYPT
            )
                .setBlockModes(android.security.keystore.KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(android.security.keystore.KeyProperties.ENCRYPTION_PADDING_NONE)
                .setUserAuthenticationRequired(false)
                .build()
        )
        return generator.generateKey()
    }

    companion object {
        private const val PREFS = "loadfinder_auth"
        private const val KEY_TOKEN = "bearer_token"
        private const val KEY_IV = "bearer_iv"
        private const val KEY_ALIAS = "loadfinder_api_auth"
        private const val ANDROID_KEYSTORE = "AndroidKeyStore"
    }
}
