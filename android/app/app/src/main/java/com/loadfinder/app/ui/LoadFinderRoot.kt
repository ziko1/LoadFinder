package com.loadfinder.app.ui

import android.content.Intent
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.loadfinder.app.BuildConfig
import com.loadfinder.app.auth.SessionViewModel
import com.loadfinder.app.domain.model.Load
import com.loadfinder.ui.RealtimeMapScreen
import com.loadfinder.ui.RoutePoint

@Composable
fun LoadFinderRoot(loadId: String?, onConsumed: () -> Unit) {
    val session: SessionViewModel = hiltViewModel()
    val vm: HomeViewModel = hiltViewModel()
    val signedIn by session.session.signedIn.collectAsState()
    val busy by session.busy.collectAsState()
    val message by session.message.collectAsState()
    val connection by session.connection.collectAsState()
    val state by vm.state.collectAsState()
    val search by vm.searchContext.collectAsState()
    val context = LocalContext.current
    val lifecycle = LocalLifecycleOwner.current
    var tab by rememberSaveable { mutableIntStateOf(0) }
    var mapLoad by remember { mutableStateOf<Load?>(null) }
    val login = rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { session.complete(it.data) }
    val notifications = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { session.registerPush() }
    LaunchedEffect(signedIn) {
        if(signedIn) { session.refreshConnection(); session.registerPush() }
        else { vm.clearSession(); mapLoad = null; tab = 0 }
    }
    LaunchedEffect(loadId, signedIn) {
        if(signedIn && loadId != null) { tab = 0; vm.openDetailsById(loadId); onConsumed() }
    }
    DisposableEffect(lifecycle, signedIn) {
        val observer = LifecycleEventObserver { _, event ->
            if(event == Lifecycle.Event.ON_RESUME && signedIn) session.refreshConnection()
        }
        lifecycle.lifecycle.addObserver(observer)
        onDispose { lifecycle.lifecycle.removeObserver(observer) }
    }
    if(!signedIn) {
        Column(Modifier.fillMaxSize().safeDrawingPadding().padding(24.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
            Text("LoadFinder", style = MaterialTheme.typography.headlineLarge)
            Text("Знаходьте вантажі поруч і переглядайте пропозиції Trans.eu.")
            if(!session.session.configured) Text("Цю збірку ще не підключено до сервера входу. Потрібна налаштована збірка від адміністратора.")
            Button(enabled = !busy && session.session.configured, onClick = { session.login(login::launch) }) { Text("Увійти") }
            if(busy) CircularProgressIndicator()
            message?.let { Text(it, color = MaterialTheme.colorScheme.error) }
        }
        return
    }
    Scaffold(
        modifier = Modifier.safeDrawingPadding(),
        bottomBar = {
            NavigationBar {
                listOf("Вантажі", "Карта", "Налаштування", "Обліковий запис").forEachIndexed { index, title ->
                    NavigationBarItem(selected = tab == index, onClick = { tab = index }, icon = { Text(listOf("☰", "⌖", "⚙", "●")[index]) }, label = { Text(title) })
                }
            }
        }
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding)) {
            when(tab) {
                0 -> HomeScreen(vm) { mapLoad = it; tab = 1 }
                1 -> Column(Modifier.fillMaxSize()) {
                    val selected = mapLoad
                    selected?.let { load ->
                        Text("${load.pickupCity} → ${load.deliveryCity}", Modifier.padding(12.dp))
                        Row {
                            listOf("До завантаження" to load.pickup, "До доставки" to load.delivery).forEach { (label, point) ->
                                TextButton(onClick = {
                                    val uri = Uri.parse("geo:${point.lat},${point.lon}?q=${point.lat},${point.lon}")
                                    runCatching { context.startActivity(Intent(Intent.ACTION_VIEW, uri)) }
                                }) { Text(label) }
                            }
                        }
                    }
                    if(BuildConfig.MAPS_CONFIGURED) {
                        RealtimeMapScreen(
                            vehicle = search?.let { RoutePoint(it.lat,it.lon,"Позиція пошуку") },
                            pickup = selected?.let { RoutePoint(it.pickup.lat,it.pickup.lon,it.pickupCity) },
                            delivery = selected?.let { RoutePoint(it.delivery.lat,it.delivery.lon,it.deliveryCity) },
                            radiusKm = state.settings.radiusKm.toFloat(),
                            onNextLoad = { tab = 0; vm.startPagedSearch() })
                    } else Text("Вбудована карта ще не налаштована. Оберіть вантаж, щоб відкрити координати у навігаторі.", Modifier.padding(20.dp))
                }
                2 -> SettingsScreen(state.settings, vm::updateSettings)
                3 -> Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("Обліковий запис", style = MaterialTheme.typography.headlineSmall)
                    Text(connection)
                    Button(enabled = !busy, onClick = {
                        session.connect { url -> context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url))) }
                    }) { Text("Підключити Trans.eu") }
                    OutlinedButton(onClick = { session.refreshConnection() }, enabled = !busy) { Text("Перевірити підключення") }
                    OutlinedButton(onClick = {
                        if(android.os.Build.VERSION.SDK_INT >= 33) notifications.launch(android.Manifest.permission.POST_NOTIFICATIONS)
                        else session.registerPush()
                    }) { Text("Увімкнути сповіщення") }
                    Text("Фоновий пошук запускається на екрані вантажів. Для роботи з поточною позицією залиште live GPS увімкненим.")
                    message?.let { Text(it, color = MaterialTheme.colorScheme.error) }
                    OutlinedButton(enabled = !busy, onClick = { vm.clearSession(); session.logout() }) { Text("Вийти") }
                }
            }
        }
    }
}
