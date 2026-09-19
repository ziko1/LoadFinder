package com.loadfinder.app.notifications

import com.loadfinder.app.domain.model.Load

internal object NotificationCandidatePolicy {
    fun newLoads(loads: List<Load>, seenIds: Set<String>): List<Load> =
        loads.asSequence()
            .filter { it.id.isNotBlank() }
            .filter { it.id !in seenIds }
            .distinctBy { it.id }
            .toList()
}
