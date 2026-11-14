# Diorama scene restoration: incomplete

Reviewed 14 November 2026 against upstream commit c790df5007be54cccb6c083f7743fae120c89cf4.

## Correction

The deployed `original.html` was built from `verify/water/src/main.js`. Its own source describes it as a water harness with two capsule swimmers and says “It is not a play; there is no story.” Labelling this the original scene interface was misleading. It is not the detailed Pool scene advertised in the README.

| Advertised scene | What the repository supplies | Restored as an editable scene? |
| --- | --- | --- |
| Pikachu vs Charizard | MP4, GIF, reusable creature helpers, verification notes | No |
| Dust Kings | MP4, GIF, reusable toolkit helpers | No |
| Pool | MP4, GIF, reusable rigs/water/effects; separate minimal water test | No |
| Bank Job | MP4, GIF, reusable toolkit helpers | No |

## Evidence

- README “The scenes” describes detailed people, props and choreography absent from the water harness.
- `verify/creature-battle/README.md` says the finished source lives in the project it was commissioned for, `Desktop/pokemon`.
- Full upstream Git history inspected: 22 commits; scene source paths contain the water test and climb/transfer test only. No complete showcase scene application found.
- Remote refs: only `main`; no tags. GitHub releases: none. Repository homepage field: empty.
- Reviewed the author's public repository catalogue; no separately named Pool, Bank Job, Dust Kings or creature-battle source project was found. This does not establish that unpublished source does not exist.
- Directly rendered the previously deployed `original.html` and compared it with frames from all four original MP4 files. The visual mismatch is substantial and confirmed.

## What completion requires

Either obtain the original complete scene source/assets from their author, or implement and validate explicitly labelled new reconstructions from the references. No such reconstructions are included in this delivery. The restored toolkit and passing test harnesses must not be reported as completion of those four scenes.
