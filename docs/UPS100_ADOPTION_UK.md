# UPS-100 — performance adoption for ziko1/LoadFinder

Date: 2026-10-15. Status: SPEC CANDIDATE / NOT MEASURED / NOT MERGED. Product class: mobile.
Public-safe requirements are included in AGENTS.md; the separate owner-managed UPS-100 is canonical.

Project-local budget: docs/UPS100_BUDGET.json. All journeys are DISCOVERY TASKS, not claims about implemented screens, endpoints, deployment, or live metrics.

Required acceptance: UI A/B p95 <=100 ms from real action to meaningful paint; Web field (if applicable) INP p75 <=200 ms, LCP p75 <=2500 ms, CLS p75 <=0.1 (separate mobile/desktop, with internal goals 100 ms / 1800 ms / 0.05); simple C1 backend p95 <=100 ms, p99 <=250 ms server-side only. Mobile startup/frame/battery and external network/AI/GPS/media require scenario-specific budgets and evidence, not 100ms end-to-end guarantees.

Record p50/p75/p95/p99/max, error rates, trace/source, device/network/cache, exact SHA, before/after, concurrency, accessibility, security, tenant isolation, cost and rollback. Run controlled staging/isolated tests, not heavy live load. Without measurements keep UNKNOWN.

The VPS daily passive UPS-100 controller knows this product in its registry; unless source/telemetry is connected, it correctly returns UNKNOWN. No automatic merge or live deployment is implied by this branch.