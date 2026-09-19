package com.loadfinder.app.worker

import android.content.Context
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.serialization.encodeToString
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json

@Singleton
class SeenLoadIdsStore @Inject constructor(
    @ApplicationContext context: Context
) {
    private val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    private val json = Json { ignoreUnknownKeys = true }

    @Synchronized
    fun get(): Set<String> {
        val raw = prefs.getString(KEY_IDS, null) ?: return emptySet()
        return runCatching {
            val decoded: List<String> = json.decodeFromString(raw)
            decoded
                .asSequence()
                .map(String::trim)
                .filter(String::isNotEmpty)
                .toList()
                .takeLast(MAX_IDS)
                .toSet()
        }.getOrElse { emptySet() }
    }

    @Synchronized
    fun markSeen(ids: Iterable<String>) {
        val merged = LinkedHashSet<String>(MAX_IDS)
        merged.addAll(get())
        ids.asSequence()
            .map(String::trim)
            .filter(String::isNotEmpty)
            .forEach(merged::add)
        val retained = merged.toList().takeLast(MAX_IDS)
        prefs.edit().putString(KEY_IDS, json.encodeToString(retained)).apply()
    }

    companion object {
        private const val PREFS = "auto_search_seen_load_ids"
        private const val KEY_IDS = "ids_json"
        private const val MAX_IDS = 5000
    }
}
