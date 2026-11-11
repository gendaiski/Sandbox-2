# Pullboard — original UI and development reference

Selected release: **v0.9.3**, commit `c3c21438ebda51fc410519b23cdea68801b1bb79` (2026-10-27). Inspected 2026-11-03 in this Linux cloud workspace; Node 24.19 and Git. Upstream main was newer; it was not substituted for the stable release. No upstream core files were changed.

## Open the interface

From this repository root run `python3 -m http.server 8461 --bind 127.0.0.1`, then open <http://127.0.0.1:8461/systems/pullboard/demo/>. This is Pullboard's own `view --export` output, with native navigation, inspector, themes and event replay. It contains the actual official tour run recorded in `evidence/tour-output.txt`. `official-sample/` contains upstream's broader published sample, separately identified. Both snapshots are read-only by design; a static page cannot launch agents or change the live board.

## Full local runtime

1. Install Git and Node >=22.13, then clone this Sandbox-2 branch with `--recurse-submodules`. For an existing clone: `git submodule update --init --recursive`.
2. Run `node systems/pullboard/upstream/bin/pullboard.js --version`.
3. Run `node systems/pullboard/scripts/tour.mjs` for a disposable official scripted end-to-end tour. It prints the new project path. Each invocation deliberately creates a new throwaway project; it does not repair or overwrite an existing project.
4. To inspect an existing board, change into that Git project and run `node /absolute/path/to/upstream/bin/pullboard.js view`. Use the exact local URL printed by Pullboard; retain its documented authentication. Stop with Ctrl+C, restart the same command from the same project. Do not use `--lan` or relay linking for initial local use.
5. For your own project, read upstream README and `pullboard help init` before `init`; approval policy, lanes, gates and agent CLI configuration must match that project. Never initialize over an existing board blindly.

There is no npm dependency installation or UI build step for the pinned package. The cloud session did not install anything on your Windows PC. Upstream's tested platforms are Linux/macOS; Windows 10 is unverified here. WSL2 is a practical Linux environment if available, but its installation/system changes were not performed. External coding-agent CLIs and their credentials are separately required for autonomous model work. No paid calls, relay, host-wide mounts or external integrations were enabled.

## Persistence, backups and updates

The local board is `<git-common-dir>/pullboard/board.sqlite`, shared by the repository's worktrees. Resolve the common directory with `git rev-parse --git-common-dir`; linked worktree paths differ. Specs, doctrine and `pullboard.json` live in the project's versioned files. This delivery's tour repositories lived under `/tmp/pullboard-tour-QxlO0H/` and are ephemeral; exported evidence is preserved here.

Before repair/update stop board processes and agents; back up the entire project including the Git common directory, worktrees, uncommitted files and Pullboard configuration. When copying SQLite, stop writers first and preserve associated WAL/SHM files, or use SQLite's supported online backup API. UI exports are viewing artifacts, not complete operational backups. Credentials/relay keys need a separate encrypted backup if relay is configured; none was configured here. Restore into an isolated directory, keep the original, use the same pinned release and verify history before resuming. Review upstream release notes and migration compatibility before advancing the submodule commit; retain the old commit and pre-update data backup for rollback.

Upstream source/license remain MIT; see `UPSTREAM-LICENSE`. Authored notes/scripts are delivery additions. The exported interface and official sample retain their original source and behavior.

## Native SwiftUI front end

See [swift-native](swift-native/README.md) for the offline iPad/iPhone Xcode project, Apple-framework dependencies and native testing flows. It is an independent native adaptation with an unchanged original Web UI comparison view, not an official Swift release. Apple compilation/signing and device tests are pending.
