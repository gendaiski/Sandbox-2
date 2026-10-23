# Native installation queue

The authoritative numbered list is [PENDING-BATCH-19.md](../PENDING-BATCH-19.md), which now contains 38 unique repositories. Items 20–25 were appended on 2026-10-23. The next request contained fourteen entries: thirteen unique repositories became items 26–38, while `nocodb/nocodb` was already item 20 and was not duplicated. Preserve the numbers and process in order.

Work is **deferred** until the current Docker Desktop startup issue is handed over and the user explicitly says to resume this batch. No background execution is scheduled.

For each repository, first check previous work, read the current GitHub About section and official README, classify what it actually is, then install or prepare the supported native result. The user wants an individual report immediately after each repository is finished, including the verbatim GitHub About description and verified website links. An inventory link or screenshot is not evidence of an installed application. Follow the full criteria in the [pending-batch instructions](../PENDING-BATCH-19.md).

Use the statuses `QUEUED`, `INVESTIGATING`, `IN PROGRESS`, `COMPLETE`, `PARTIAL`, `BLOCKED`, and `UNAVAILABLE`. Record checks as `PASS`, `FAIL`, `NOT VERIFIED`, or `NOT APPLICABLE`. The [tracker](INSTALLATION_TRACKER.md) records each current result. Save individual reports under [reports/](reports/README.md) and a `START_HERE.md` for each repository once work begins.

This is a temporary Codex cloud workspace. Work done here is not an installation on the user's Windows computer. Determine the actual target machine and dependencies before starting the batch; ask only for information that cannot be discovered safely.

When builder systems are reached, label and rank the applicable builders using verified criteria. Include Puck and VvvebJs in the comparison; their ranking is not yet known. For item 38, Sim, a cloud or local service usable from Windows is sufficient; do not spend work on a desktop package.
