package com.loadfinder.app.auth

import android.content.Context
import android.content.Intent
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.loadfinder.app.data.api.BackendApi
import com.loadfinder.app.notifications.PushRegistration
import com.loadfinder.app.worker.AutoSearchScheduler
import com.loadfinder.app.worker.AutoSearchResultStore
import com.loadfinder.app.location.LocationForegroundService
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch

@HiltViewModel
class SessionViewModel @Inject constructor(
    val session: OidcSession,
    private val api: BackendApi,
    private val push: PushRegistration,
    private val results: AutoSearchResultStore,
    @ApplicationContext private val context: Context
) : ViewModel() {
    val busy = MutableStateFlow(false)
    val message = MutableStateFlow<String?>(null)
    val connection = MutableStateFlow("Підключення не перевірено")
    fun login(launch: (Intent) -> Unit) = action { launch(session.loginIntent()) }
    fun complete(intent: Intent?) = action { session.completeLogin(intent); push.schedule(); refreshConnection() }
    fun refreshConnection() = action {
        val status = api.exchangeStatus()
        connection.value = if(status.connected) "Trans.eu підключено" else if(status.configured) "Підключіть обліковий запис Trans.eu" else "Trans.eu ще не налаштовано на сервері"
    }
    fun connect(open: (String) -> Unit) = action { open(api.connectExchange().url) }
    fun logout() = action {
        AutoSearchScheduler.cancel(context)
        context.stopService(Intent(context, LocationForegroundService::class.java))
        runCatching { push.unregister() }
        session.logout()
        results.save(emptyList())
        context.getSystemService(android.app.NotificationManager::class.java).cancelAll()
        message.value = null
    }
    fun registerPush() = push.schedule()
    private fun action(block: suspend () -> Unit) {
        viewModelScope.launch {
            busy.value = true; message.value = null
            try { block() }
            catch(e: kotlinx.coroutines.CancellationException) { throw e }
            catch(e: Exception) { message.value = e.message ?: "Не вдалося виконати дію. Спробуйте ще раз." }
            finally { busy.value = false }
        }
    }
}
