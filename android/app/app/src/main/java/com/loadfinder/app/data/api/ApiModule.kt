package com.loadfinder.app.data.api

import com.loadfinder.app.BuildConfig
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import kotlinx.serialization.json.Json
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object ApiModule {
    @Provides @Singleton
    fun backendApi(authInterceptor: ApiAuthInterceptor): BackendApi {
        val contentType = "application/json".toMediaType()
        val client = okhttp3.OkHttpClient.Builder()
            .addInterceptor(authInterceptor as Interceptor)
            .build()
        val configuredBaseUrl = BuildConfig.LOADFINDER_BASE_URL
            .trim()
            .ifEmpty { "http://10.0.2.2:8080/" }
            .let { if (it.endsWith("/")) it else "$it/" }

        return Retrofit.Builder()
            .baseUrl(configuredBaseUrl)
            .client(client)
            .addConverterFactory(Json { ignoreUnknownKeys = true }.asConverterFactory(contentType))
            .build()
            .create(BackendApi::class.java)
    }
}
