package com.loadfinder.app.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.loadfinder.app.domain.model.SearchSettings

@Composable
fun SettingsScreen(settings: SearchSettings, onSave: (SearchSettings) -> Unit) {
    var draft by remember(settings) { mutableStateOf(settings) }
    var destination by remember(settings) { mutableStateOf(settings.destination.orEmpty()) }
    var saved by remember { mutableStateOf(false) }
    var expanded by remember { mutableStateOf(false) }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Налаштування пошуку", style = MaterialTheme.typography.headlineSmall)
        Text("Радіус: ${draft.radiusKm.toInt()} км")
        Slider(value = draft.radiusKm.toFloat(), onValueChange = { draft = draft.copy(radiusKm = it.toDouble()); saved = false }, valueRange = 10f..250f)
        Text("Мінімум: ${"%.2f".format(draft.minPricePerKm)} €/км")
        Slider(value = draft.minPricePerKm.toFloat(), onValueChange = { draft = draft.copy(minPricePerKm = it.toDouble()); saved = false }, valueRange = 0f..5f)
        Text("Мінімальна ціна: €${draft.minPriceEur.toInt()}")
        Slider(value = draft.minPriceEur.toFloat().coerceIn(0f,5000f), onValueChange = { draft = draft.copy(minPriceEur = it.toDouble()); saved = false }, valueRange = 0f..5000f)
        Text("Порожній пробіг до: ${draft.maxEmptyKm.toInt()} км")
        Slider(value = draft.maxEmptyKm.toFloat(), onValueChange = { draft = draft.copy(maxEmptyKm = it.toDouble()); saved = false }, valueRange = 0f..250f)
        Text("Оцінка відповідності від: ${draft.minMatchScore}%")
        Slider(value = draft.minMatchScore.toFloat(), onValueChange = { draft = draft.copy(minMatchScore = it.toInt()); saved = false }, valueRange = 0f..100f)
        Box {
            OutlinedButton(onClick = { expanded = true }) { Text("Автомобіль: ${draft.vehicleType}") }
            DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                listOf("ANY", "VAN", "BOX", "CURTAINSIDER", "REFRIGERATED").forEach { type ->
                    DropdownMenuItem(text = { Text(type) }, onClick = { draft = draft.copy(vehicleType = type); expanded = false; saved = false })
                }
            }
        }
        OutlinedTextField(value = destination, onValueChange = { destination = it; saved = false }, label = { Text("Місто доставки (необов’язково)") }, singleLine = true)
        Button(onClick = { onSave(draft.copy(destination = destination.trim().takeIf { it.isNotEmpty() })); saved = true }) { Text("Зберегти") }
        if(saved) Text("Налаштування збережено")
    }
}
