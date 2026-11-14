# osgEarth — Native Explorer Library

Public library: https://osgearth-library-gendaiski.vercel.app/

Unified Worlds Library: https://diorama-studio-gendaiski.vercel.app/#osgearth-library

Download: https://osgearth-library-gendaiski.vercel.app/downloads/osgearth-installation.zip

Published native preview expires **14 November 2026, 05:54 UTC**. The catalogue and downloads remain available afterward.

Original upstream: https://github.com/pelicanmapping/osgearth

Pinned revision: `16de96a16b10bce7f2167897826998060edc49f0` (master, inspected 14 November 2026).

This package installs the original C++/OpenGL application and provides a searchable HTML library and browser display transport. It does **not** recreate the native viewer in JavaScript or substitute a screenshot for the application.

## Inventory

- All **94** original `.earth` map examples.
- All **526** original files in `data/`, including GIS data, original artwork, textures and models.
- All **63** application source folders, with runtime executable availability reported separately.
- All **2,580** upstream repository files listed with pinned source links.
- All **8** original README showcase images, labelled as upstream reference artwork.
- ImGui viewer, headless/simple viewer, tools, examples, tests, procedural, Prestige and legacy nodekits requested in the native build.

The complete original repository is fetched at its pinned revision during the Docker build. Original source, licences, notices and artwork remain in `/opt/osgearth/source`. Downloading the launcher ZIP therefore downloads the launcher and library; its first Docker build fetches the complete original project and native dependencies.

## Windows / Mac: launch the original application

1. Start Docker Desktop, using Linux containers.
2. Extract the installation ZIP.
3. On Windows, run `Start-Windows.ps1`; on Mac, run `Start-Mac.command`.
4. Open http://localhost:4288 . Choose a map and click **Launch original ImGui viewer**.

Or use a terminal in this folder:

```
docker compose up --build -d
```

The initial native compilation takes time. The interface, terrain rendering, menu panels, mouse controls and artwork are from the original application. The browser forwards display and input using noVNC. Only the display service is published, bound to localhost by default; the VNC port is internal.

To stop:

```
docker compose down
```

To inspect the native application:

```
docker compose exec osgearth osgearth_version --caps
docker compose exec osgearth osgearth_tests
```

The tests create temporary fixtures. Run them from a writable copy of the tests directory, with `DISPLAY=:99`, `OSG_FILE_PATH=/opt/osgearth/source/data:/opt/osgearth/source/tests` and the installation libraries/plugins on the search path. A run from the read-only mounted source fails fixture creation.

`runtime/prepare_source.py` applies one GCC two-phase lookup compatibility fix in `ExpressionTests.cpp`: it declares the existing `evaluateExpression` overload before instantiating the template. No rendering code or example artwork is changed.

## Online library and shared session

The public HTML library is a separate static deployment. Its `web/runtime-config.js` identifies the native session endpoint. The evaluation session is temporary and shared: opening a map changes the native viewer for everyone using that session. When that runtime stops, the library, original assets, source links and installation download remain available; the UI displays an explicit unavailable-state and setup path.

A static host such as Vercel cannot execute this native OpenGL application. Permanent shared access requires an always-running container host with sufficient CPU/RAM, disk and an appropriate GPU or software renderer. No paid server is created by this package.

## External requirements and limits

The catalogue traces local `.earth` includes so inherited online providers are classified correctly. Every example stays visible even when it requires additional setup.

- Provider-specific examples may require API keys, current service URLs or externally hosted data. Keys belong in private local/container settings, never the repository.
- Triton and SilverLining integrations require their separate commercial SDKs/licences; those SDKs are not bundled or simulated.
- Cesium Native and Slughorn are optional external build dependencies. Their source/example entries are included; they are not reported as installed simply because an example file exists.
- Some examples intentionally exercise errors or reference resources outside the repository. Their requirements and actual native log are available on their page.
- The evaluation renderer uses Mesa software rendering where a physical GPU is unavailable. Advanced GPU features and very large datasets can be slower or unsupported; inspect native capabilities and the layer diagnostics.
- Upstream examples may contain service URLs that no longer work. Original files are preserved; a failed online layer is reported rather than silently replaced with unrelated artwork.

## Empty-page audit

All 689 library routes are checked for meaningful content, with source or diagnostic information on unsupported asset types. Missing backend connectivity produces an actionable error instead of an empty iframe. Native exit status and logs are visible below the viewer. This verifies the library itself; it does not claim every external provider or optional SDK is working.

The existing Worlds Library was separately audited: all 85 information routes were nonempty and all five Diorama/Pokémon renderers produced live geometry. Its two city maps and original controls were previously verified in browser regression tests.

## Build the static library

```
python3 -m pip install Pillow
python3 inventory.py /path/to/pinned/osgearth
python3 build_web.py
```

The build copies the exact original browser-readable artwork, creates `/osgearth-library.html` and packages the Docker launcher. The downloadable launcher omits duplicate artwork: the runtime serves the exact files from the pinned upstream data directory after installation.

## Licensing

Original osgEarth code: MIT, Copyright © 2026 Pelican Mapping. See `LICENSE.txt` and the original source's embedded notices. Original data/artwork and online providers retain their respective licences and attributions. OpenSceneGraph, GDAL, noVNC and dependency copyright notices remain in the installed package. noVNC is MPL-2.0; see `web/NOVNC-COPYRIGHT.txt` and the retained noVNC source.

## Verified build and limitations

The full selected CMake build and installation succeeded. There are 49 installed osgEarth executables. The original ImGui globe was rendered and controlled through noVNC in Chromium. All 94 sample launches are recorded in `verification/native-scenes.json`; a running process alone does not establish that all layers rendered. The gallery labels visible blank views, exited processes and provider errors.

The complete upstream test run crashed in `glTF converts channels and factors to shared PBR materials`. A follow-up run excluding that crashing case completed with 204 passed and 10 failed cases as reported by the runner; this is not a fully passing upstream suite. Failures and software-rendering limitations are retained in the verification logs.

The hosted native connection is a non-persistent Vercel Sandbox relay with a 45-minute platform limit. It exposes only this isolated viewer’s allowlisted launch API and browser display. No permanent cloud server has been provisioned. The public HTML library and installation package remain available when this evaluation session ends.

Disk caching is disabled by default for this browser evaluation to prevent unbounded terrain downloads filling its system disk. Set `OSGEARTH_ENABLE_DISK_CACHE=1` in Compose only when you provide sufficient disk space. The initial cache-related failures were rechecked with caching disabled.

The bundled `world_countries.mbtiles` uses SQLite WAL mode. On read-only source mounts, SQLite cannot create its sidecar files. The launcher stages byte-identical copies of this one example and database in `/tmp/osgearth-sqlite-example` so SQLite can operate normally. The original repository files are retained unchanged.

The launch catalogue follows upstream instructions: the template map uses the `.template` pseudoloader; skyview examples run `osgearth_skyview`; custom filters run `osgearth_featurefilter`; day/night adds `--sky`. The remaining examples use the original ImGui viewer.

Final scene audit: 74 scenes captured without reported native warnings; 4 captured with warnings; 4 native crashes; 2 credential-dependent; 4 require unshipped developer-local datasets; 5 show only their base scene pending optional SDKs; 1 is an intentional error test. These categories describe this runtime, not a claim that every layer/function was exhaustively tested.

The portable HTML embeds the catalogue, styles and navigation. Its document and search were browser-tested with all HTTPS requests blocked. This managed browser blocks direct `file://` navigation, so that exact opening path could not be tested here; rendering the downloaded document was verified. Original media and the native renderer remain separate resources.
