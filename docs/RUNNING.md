# Запуск LoadFinder

Поточний робочий контур: Android → API LoadFinder → офіційний API Trans.eu.
Код та збірка не створюють облікові записи зовнішніх сервісів. Без налаштованого
OIDC застосунок показує екран налаштування входу, без підключення Trans.eu пошук
повертає помилку. Демонстраційні вантажі за замовчуванням вимкнені.

## Конфігурація

| Компонент | Що потрібно |
|---|---|
| Сервер | HTTPS-домен і сервер із Docker Compose, PostgreSQL/PostGIS та Redis |
| Вхід | OIDC issuer, JWKS URL, API audience, public Android client ID; RS256 access tokens з `sub`, `exp`, `iss`, `aud` |
| Android redirect | Зареєструвати `com.loadfinder.app:/oauth2redirect`; Authorization Code + PKCE, без client secret у застосунку |
| Trans.eu | Client ID, client secret, API key та погоджені права на freight proposals / negotiation |
| Trans.eu redirect | `https://<API_DOMAIN>/v1/exchanges/trans-eu/callback`, точно як у реєстрації Trans.eu |
| Карта | Android Google Maps key з обмеженням за package `com.loadfinder.app` і SHA сертифіката |
| Push | Firebase Android `google-services.json` та Firebase Admin credentials для цього ж Firebase-проєкту |
| Підпис | Власний Android keystore, alias і паролі; потрібні лише для release |

Приклади змінних: `deploy/.env.example`, `backend/.env.example`,
`android/gradle.properties.example`. Секрети не додавайте в git.

## Сервер

1. Створіть локальний `deploy/.env` за прикладом і заповніть значення.
2. Запустіть:

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml up -d --build
docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml logs migrate api worker
curl --fail http://127.0.0.1:8080/health
```

Міграції виконуються окремим сервісом до запуску API/worker. Канонічні файли —
`backend/migrations/*.sql`; `backend/sql/` містить історичні схеми і більше
не монтується в initdb. Повторний запуск перевіряє SHA-256 уже застосованих
міграцій і не виконує їх заново. Несумісна стара схема зупиняє міграцію без
видалення даних: спершу зробіть backup і перенесіть її окремо.

Для FCM додайте `FIREBASE_ADMIN_FILE=/absolute/path/service-account.json`
до локального середовища і використайте обидва Compose-файли:

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml -f deploy/docker-compose.firebase.yml up -d --build
```

Додатковий файл монтує credentials лише в worker. Без FCM налаштувань невідправлене
сповіщення залишається з помилкою; запис у журнал не вважається доставкою.
API слухає `127.0.0.1:8080`; налаштуйте HTTPS reverse proxy перед підключенням телефона.
Резервні копії PostgreSQL і тест відновлення виконуйте у своєму середовищі.

## Android

Нестандартне розміщення модуля збережено: Gradle `:app` знаходиться в
`android/app/app` і заданий у `settings.gradle.kts`.

Значення з `android/gradle.properties.example` внесіть у
`~/.gradle/gradle.properties`. Покладіть Firebase Android файл у
`android/app/app/google-services.json` (він ігнорується git).

```bash
cd android
./gradlew :app:assembleDebug :app:testDebugUnitTest
./gradlew :app:connectedDebugAndroidTest
```

APK: `android/app/app/build/outputs/apk/debug/app-debug.apk`.
CI також публікує `loadfinder-debug-apk` у **LoadFinder Android Build**.
Це debug APK; він не містить чужих production credentials.

Для release задайте `LOADFINDER_KEYSTORE`, `LOADFINDER_STORE_PASSWORD`,
`LOADFINDER_KEY_ALIAS`, `LOADFINDER_KEY_PASSWORD` у середовищі та виконайте:

```bash
./gradlew :app:assembleRelease :app:bundleRelease
```

Release перевіряє HTTPS, OIDC, Maps, Firebase і підпис перед збіркою.
Альтернатива — ручний GitHub workflow **Signed Android release**:
в environment `production` додайте variables `LOADFINDER_BASE_URL`,
`OIDC_ISSUER`, `OIDC_CLIENT_ID`; secrets `MAPS_API_KEY`,
`GOOGLE_SERVICES_JSON`, `ANDROID_KEYSTORE_BASE64`, `ANDROID_STORE_PASSWORD`,
`ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`. Workflow створює APK/AAB,
але не публікує їх у Google Play.

## Перевірка зі справжнім обліковим записом

1. Увійдіть через браузер; перевірте повторний запуск і оновлення access token.
2. В «Обліковому записі» підключіть Trans.eu та перевірте статус після повернення.
3. Дозвольте геолокацію, запустіть пошук; змініть фільтри й перевірте результати.
4. Відкрийте вантаж, карту і зовнішню навігацію.
5. Дозвольте сповіщення та запустіть Auto Search. Android виконує фоновий пошук
   через WorkManager (періодичний інтервал не менше 15 хвилин; ОС може відкладати
   роботу). Live GPS використовується для оновлення позиції.
6. Перевірте push із тестовим вантажем, відкриття деталей натисканням та відсутність
   сповіщень після виходу. Android Auto Search і серверний worker — окремі режими;
   застосунок наразі запускає клієнтський режим. Серверний режим керується
   автентифікованими `/v17` endpoints і потребує регулярного надсилання позиції.
7. Пропозиція ціни та прийняття вантажу мають окреме підтвердження. Перевіряйте
   реальну договірну дію тільки з явно погодженим тестовим вантажем.

Пошук Trans.eu обмежений п'ятьма сторінками (до 150 доступних користувачу
пропозицій за запит). Лінія на карті з'єднує координати; дорожній маршрут
будує зовнішній навігатор. Вхідні Trans.eu webhooks вимкнені до узгодження
перевірки автентичності з провайдером. Інші біржі не підключені.

Офіційні контракти:
[Trans.eu OAuth](https://www.trans.eu/api/general-information/authorization-process/),
[AppAuth Android](https://github.com/openid/AppAuth-Android),
[Firebase Admin](https://firebase.google.com/docs/admin/setup).
