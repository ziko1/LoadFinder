# LoadFinder — пам'ять проєкту

## 2026-10-11 — GitHub / Codemagic

- Репозиторій `ziko1/LoadFinder`, публічний; Android Kotlin/Compose + Node.js/TypeScript. Нативного iOS source у перевіреному дереві немає.
- Канонічний roadmap: `ROADMAP.md`; `docs/ROADMAP-v3.md` — історичний. Окремий PROJECT_MEMORY.md створено, AGENTS.md у повному дереві не знайдено.
- База: `docs/current-readiness-20261008`, SHA `3d079c316336cc7b5153007e227e58e73fe4297e`, PR #3. CI-кандидат `9ed250fbf89c3b3a09946b862b73dcb322a26fb4`, PR #4.
- Усі компоненти лишаються на GitHub Ubuntu; Codemagic не підключений. Push лише main, PR без нових path-обмежень; focused Android APK/backend workflows — вручну. Канонічні тести, emulator, DB/Redis та signed release збережені.
- Перевірки: YAML/trigger configuration і структурна незмінність test/build commands, service definitions та signed release — PASS. Запуски 38160764878, 38160764962, 38160764870, 38160764983 заблоковані до runner assignment; 5 jobs, runner_id=0, steps=[]. Поточні тести NOT RUN, runtime readiness BLOCKED.
- Evidence: `evidence/ci-balance-20261011.json`; інструкція: `docs/CI_BUDGET_UK.md`. Фінансові дані облікового запису в репозиторії не записуються.
- Наступне: відновити доступність GitHub Actions, перевірити поточний exact SHA, виконати погоджений review/merge залежних PR. Deployment, release signing, live OIDC/Trans.eu/FCM/GPS та device acceptance мають окремі gates із roadmap.
- Документаційний коміт після CI-кандидата змінює лише docs/evidence; не вважається новим runtime PASS.
