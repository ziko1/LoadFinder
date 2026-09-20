package com.loadfinder.app.notifications

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.*
import com.google.firebase.messaging.FirebaseMessaging
import com.loadfinder.app.BuildConfig
import com.loadfinder.app.auth.OidcSession
import com.loadfinder.app.data.api.BackendApi
import com.loadfinder.app.data.api.PushTokenBody
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

@Singleton
class PushRegistration @Inject constructor(
    @ApplicationContext private val context: Context,
    private val api: BackendApi
) {
    private val prefs = context.getSharedPreferences("push", Context.MODE_PRIVATE)
    fun schedule() {
        if (!BuildConfig.FIREBASE_CONFIGURED) return
        WorkManager.getInstance(context).enqueueUniqueWork("push-registration", ExistingWorkPolicy.REPLACE,
            OneTimeWorkRequestBuilder<PushTokenWorker>()
                .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()).build())
    }
    suspend fun register() {
        if (!BuildConfig.FIREBASE_CONFIGURED) return
        val token = suspendCancellableCoroutine<String> { c ->
            FirebaseMessaging.getInstance().token.addOnCompleteListener { result ->
                if(c.isActive) {
                    if(result.isSuccessful) c.resume(result.result)
                    else c.resumeWithException(result.exception ?: IllegalStateException("Push registration failed"))
                }
            }
        }
        api.registerPush(PushTokenBody(token))
        prefs.edit().putString("token", token).apply()
    }
    suspend fun unregister() {
        WorkManager.getInstance(context).cancelUniqueWork("push-registration")
        prefs.getString("token", null)?.let { api.removePush(PushTokenBody(it)) }
        prefs.edit().clear().apply()
    }
}

@HiltWorker
class PushTokenWorker @AssistedInject constructor(
    @Assisted context: Context, @Assisted params: WorkerParameters,
    private val session: OidcSession, private val registration: PushRegistration
) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        if(!session.signedIn.value) return Result.success()
        return try { registration.register(); Result.success() }
        catch(e: kotlinx.coroutines.CancellationException) { throw e }
        catch(e: Exception) { if(runAttemptCount < 5) Result.retry() else Result.failure() }
    }
}
