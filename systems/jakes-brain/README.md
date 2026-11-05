# Jake's Brain

[jake17007/jakes-brain](https://github.com/jake17007/jakes-brain) is Jake's personal app. It has a home screen of 24 small apps: Notes, Tasks, Groceries, Workout, Food, Calendar, Jakestagram, JakeTube, JakeGPT, Habits, Files, Weather, Reminders, Reels, Deals, People, Saved, Voice Memos, Focus, Day Log, Bots, Graph, Server and Settings. They run on one Node server with no npm dependencies, storing data in SQLite.

```bash
systems/jakes-brain/setup.sh            # Node 24, plus a config for this machine
systems/jakes-brain/setup.sh --voice    # also faster-whisper, so Voice Memos transcribe
./start.sh jakes-brain                  # http://localhost:4800 (in a codespace: Ports → 4800)
python3 systems/jakes-brain/test_jakes_brain.py -v
```

**What this install changes:**
- **Config:** the repo's `server/config.json` describes Jake's own PC: his folders, his systemd services, his ffmpeg. As the repo's `SPEC.md` does for local runs, `setup.sh` writes `runtime/config.json` for this machine instead:
  - Files and JakeTube browse `runtime/files` and `runtime/videos`. The videos folder starts with two short test videos.
  - There are no services to watch.
  - All data (the SQLite database and uploads) lives in `runtime/data`. Nothing of Jake's is read or reached.
- **Network:** the server binds to localhost only, as the repo's own notes require. Its Claude connector and phone gateway listen on 127.0.0.1:4801 and are not exposed.

**What needs more:**
- **JakeGPT** needs [Ollama](https://ollama.com) with a model pulled. Set `JAKESDATA_GPT_MODEL` before `setup.sh` to pick the default model.
- **Weather** needs internet access.
- **Voice Memos** needs `--voice`.
- **Reels and Bots** read Jake's own trackers, so they stay empty here.

**Licence:** the repo has no licence, so its code isn't copied into Sandbox-2 and its interface isn't republished as a page. It is cloned into `vendor/` and run here for you.

**Never push to the upstream repo.** Its `main` and `claude/*` branches deploy straight to Jake's PC.
