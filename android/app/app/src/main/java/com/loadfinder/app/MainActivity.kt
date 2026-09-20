package com.loadfinder.app

import android.os.Bundle
import androidx.compose.runtime.getValue
import androidx.compose.runtime.collectAsState
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import com.loadfinder.app.ui.HomeScreen
import com.loadfinder.app.ui.HomeViewModel
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    private val pendingLoadId = kotlinx.coroutines.flow.MutableStateFlow<String?>(null)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        pendingLoadId.value = intent.getStringExtra("loadId")
        enableEdgeToEdge()
        setContent {
            MaterialTheme {
                val id by pendingLoadId.collectAsState()
                Surface { com.loadfinder.app.ui.LoadFinderRoot(id) { pendingLoadId.value = null } }
            }
        }
    }
    override fun onNewIntent(intent: android.content.Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        pendingLoadId.value = intent.getStringExtra("loadId")
    }
}
