# Розподіл CI LoadFinder

## Де тестуємо

**GitHub Actions / ubuntu-latest** виконує Node.js backend, Android build/unit, Android emulator та PostgreSQL/PostGIS/Redis інтеграцію. Репозиторій містить Android Kotlin/Compose і Node.js/TypeScript, без нативного iOS-проєкту. Окремий Codemagic-проєкт не підключено: автоматичні перевірки залишаються в Linux.

## Політика запуску

| Workflow | Автоматично | Вручну |
|---|---|---|
| LoadFinder CI | Кожен PR та push main; backend і Android | Повний повтор |
| Runtime integration | Кожен PR та push main; PostgreSQL/PostGIS + Redis | Повний повтор |
| Android runtime smoke | Кожен PR; push main за наявними Android path-фільтрами | Emulator smoke |
| LoadFinder Source Preflight | Кожен PR; push main за наявними source path-фільтрами | Source preflight |
| LoadFinder Android Build | Не запускається автоматично | Debug APK + unit reports |
| LoadFinder Backend CI | Не запускається автоматично | Окремий backend test/build |
| Signed Android release | Не запускається автоматично | Існуючий production environment та signing gates |

Push робочої гілки не створює другий комплект автоматичних перевірок. Створіть PR, щоб його перевірити. Новий коміт того самого PR скасовує застарілий CI run; workflows мають незалежні групи. PR-гейти не мають нових path-фільтрів, тому зміна типу файлу не залишає потрібні PR checks без запуску. Джерело preflight також перевіряється на PR.

Гранична тривалість: backend — 15 хвилин, Android build/unit — 30, database/API integration — 20, emulator — чинні 25, source preflight — 5. Debug APK, unit reports та emulator reports зберігаються 7 днів. Release workflow збережено байт у байт, включно з production environment, доступом до signing inputs та артефактами.

## Практичний порядок

1. Оновіть код у гілці й відкрийте або оновіть PR. Канонічні CI workflows уже охоплюють тестування й build; focused workflows повторно запускати не потрібно.
2. Якщо потрібен APK для ручної перевірки, окремо запустіть **LoadFinder Android Build** на потрібній гілці. Це debug artifact; release має окремий workflow.
3. Перевіряйте exact Git SHA, job steps та artifacts. Зелений source preflight не є перевіркою Android runtime.
4. Після погодженого merge main отримає власну перевірку. Ніяких cron, Codemagic push hooks або додаткових paid runners цей розподіл не додає.

## Фактичний стан 2026-10-11

CI-кандидат `9ed250fbf89c3b3a09946b862b73dcb322a26fb4`: YAML, зіставлення збережених job/test/build команд та незмінність signed release PASS. GitHub прийняв чотири потрібні PR workflows; усі п'ять jobs зупинені до виконання — `runner_id=0`, `steps=[]`. Це account execution gate провайдера, а не результат тесту чи доказ дефекту коду. Приклад: [Android job](https://github.com/ziko1/LoadFinder/actions/runs/38160764878/job/114533001971).

**Статус runtime-перевірки зміни: BLOCKED.** Після відновлення доступності Actions потрібно виконати ці workflows на точному поточному SHA. Повторні запуски до зняття account gate не робилися.

[PR #4](https://github.com/ziko1/LoadFinder/pull/4) залежить від документаційного [PR #3](https://github.com/ziko1/LoadFinder/pull/3). Main не змінено. Після погодженого merge базового PR слід змінити base цього PR на main і перевірити diff. Налаштування CI не означає готовність signed release, device/provider або production-сценаріїв.

Докази: [ci-balance-20261011.json](../evidence/ci-balance-20261011.json), поточний [roadmap](../ROADMAP.md), [пам'ять проєкту](../PROJECT_MEMORY.md).

Джерело синтаксису: [GitHub workflow triggers and concurrency](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax).
