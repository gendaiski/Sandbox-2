# Onboarding System

The [ordered 41-repository list](PENDING-BATCH-19.md), [working queue](batch-2026-10-23/QUEUE.md), [installation tracker](batch-2026-10-23/INSTALLATION_TRACKER.md), and [handover checkpoint](batch-2026-10-23/BATCH_HANDOVER.md) belong to this system. The old numbered-list filename is kept for existing links; the list is now named **Onboarding System**.

The [interactive Onboarding System UI](../showcase/onboarding-system/index.html) is generated from the ordered list and tracker with `python3 scripts/build_onboarding_system.py`. It opens as a local HTML page or on GitHub Pages and supports search, batch filters, repository details, CSV export, and a light/dark button. Its status labels reflect the tracker; it does not run the queued repositories.

This is a deferred work queue. It does not represent completed installations or a background job. The current Sandbox-2 local Docker setup must be handed over before this queue begins.
