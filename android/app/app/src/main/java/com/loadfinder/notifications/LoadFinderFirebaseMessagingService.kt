package com.loadfinder.notifications

import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.loadfinder.app.auth.OidcSession
import com.loadfinder.app.notifications.LoadNotificationHelper
import com.loadfinder.app.notifications.PushRegistration
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class LoadFinderFirebaseMessagingService : FirebaseMessagingService() {
    @Inject lateinit var registration: PushRegistration
    @Inject lateinit var session: OidcSession
    override fun onNewToken(token: String) {
        if(session.signedIn.value) registration.schedule()
    }
    override fun onMessageReceived(message: RemoteMessage) {
        if(!session.signedIn.value) return
        val data = message.data
        val id = data["loadId"] ?: return
        LoadNotificationHelper.notifyLoad(this, id, data["title"] ?: "LoadFinder", data["body"] ?: "Новий вантаж")
    }
}
