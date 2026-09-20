package com.loadfinder.app.worker

/** Policy boundary for background auto-search execution. */
data class WorkerConstraints(val networkRequired: Boolean = true)
