# Project structure

LoadFinder/
├── app/
│   ├── src/main/
│   │   ├── java/com/loadfinder/app/
│   │   │   ├── data/exchange/       # exchange adapters
│   │   │   ├── data/repository/     # unified data access
│   │   │   ├── di/                  # Hilt DI
│   │   │   ├── domain/model/        # business models
│   │   │   ├── domain/usecase/      # scoring + bidding rules
│   │   │   ├── domain/util/         # geo calculations
│   │   │   ├── location/            # GPS foreground service
│   │   │   ├── ui/                  # Compose UI + ViewModel
│   │   │   ├── LoadFinderApp.kt
│   │   │   └── MainActivity.kt
│   │   └── res/values/styles.xml
│   └── build.gradle.kts
├── build.gradle.kts
├── settings.gradle.kts
└── README.md
