# ziko1/LoadFinder — UPS-100 performance and quality governance

Apply to this repository only. Read README, source contracts/tests, docs/UPS100_ADOPTION_UK.md and docs/UPS100_BUDGET.json; preserve existing project work and instructions.

- For new/changed critical local user actions, real input-to-meaningful-paint p95 <=100 ms. UI event processing should be short. This internal rule does not guarantee network, geolocation, media or AI completion within 100 ms.
- For applicable Web surfaces, field Core Web Vitals: mobile/desktop INP p75 <=200 ms; LCP p75 <=2500 ms; CLS p75 <=0.1. Internal stretch goals are 100 ms, 1800 ms, 0.05.
- Simple scoped C1 server-side operations: internal p95 <=100 ms and p99 <=250 ms, after verifying route and baseline. Other APIs get separate measured SLOs.
- Android/iOS startup, smooth frames, offline/GPS/battery separately measured on real hardware where applicable.
- Every check requires exact Git SHA or artifact hash, percentile distribution, sample count, device, cache/network, source evidence, error rate, and independent security/accessibility review.
- Do not sacrifice data integrity, authentication, tenant isolation, GDPR, WCAG 2.2 AA, reliability or approved spending. No fake success states.
- UNKNOWN until real benchmarks are available; unit/mocks, test manifests, green CI or local source do not prove production performance.
- Check GitHub Actions quota before use; do not start paid CI, merge, deploy production, publish or modify active worktrees without product-specific approval.

This branch is a documentation candidate, not deployed product code.