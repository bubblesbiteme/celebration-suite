# Celebration Suite Controlled Beta Runbook

1. Deploy v1.0.1 to staging and apply migrations through `0030_BETA_VALIDATION_OPERATIONS.sql`.
2. Open `/commercial-admin.html` and provision a disposable planner or selected beta planner.
3. Open `/beta-validation.html`, choose the tenant and start a staging validation run.
4. Execute the seeded checks in order. Store evidence such as test URLs, Stripe test session IDs, screenshots references or short notes.
5. Log every defect as P0, P1 or P2. P0 means launch-blocking; P1 means significant but potentially launchable with mitigation; P2 is post-launch polish.
6. Do not promote to production while the decision is NO-GO.
7. A CONDITIONAL result requires an explicit owner decision on remaining P1 issues.
8. Open the Launch Report and print/save it for the release record.
9. Repeat a shorter production smoke validation after deployment before inviting additional planners.
