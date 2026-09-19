package com.loadfinder.app.di

import com.loadfinder.app.data.exchange.BackendExchangeAdapter
import com.loadfinder.app.data.exchange.ExchangeAdapter
import com.loadfinder.app.data.exchange.MockExchangeAdapter
import com.loadfinder.app.domain.usecase.MatchScoreCalculator
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    @Provides @Singleton
    fun scoreCalculator() = MatchScoreCalculator()

    @Provides @Singleton
    fun exchangeSet(
        backend: BackendExchangeAdapter,
        mock: MockExchangeAdapter
    ): Set<@JvmSuppressWildcards ExchangeAdapter> =
        if (BuildConfig.LOADFINDER_USE_MOCK) setOf(mock) else setOf(backend)
}
