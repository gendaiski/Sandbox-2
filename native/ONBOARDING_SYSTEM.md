# Onboarding System

The [ordered 50-repository list](PENDING-BATCH-19.md), [working queue](batch-2026-10-23/QUEUE.md), [installation tracker](batch-2026-10-23/INSTALLATION_TRACKER.md), and [handover checkpoint](batch-2026-10-23/BATCH_HANDOVER.md) belong to this system. The old numbered-list filename is kept for existing links; the list is now named **Onboarding System**.

The [interactive Onboarding System UI](../showcase/onboarding-system/index.html) is generated from the ordered list and tracker with `python3 scripts/build_onboarding_system.py`. It opens as a local HTML page or on GitHub Pages and uses the Sandbox-2 detailed-inventory format: Repo Category, GitHub About description, official website, source, setup/download, verification, status, report, and review action. It supports search, batch and [Engineering Collection](batch-2026-10-23/ENGINEERING_COLLECTION.md) filters, repository details, CSV export, and a light/dark button. The [Sandbox-2 showcase](../showcase/index.html) links to it from the header, categorized sidebar, and a dedicated feature panel. Status labels reflect the tracker; the UI does not run the queued repositories.

This is a deferred work queue. It does not represent completed installations or a background job. The current Sandbox-2 local Docker setup must be handed over before this queue begins.
