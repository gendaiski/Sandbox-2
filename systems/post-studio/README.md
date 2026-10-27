# Post Studio

Paste a link to a Facebook, Instagram, X or Threads post. Post Studio then:

1. **Reads the post:** its text, who posted it, when, and every image and video in it.
2. **Saves it** in `library/<platform>/<author>-<post id>/`:
   - `post.json` and `post.md`: the text, with a link back to the original;
   - `images/` and `videos/`, kept apart, each downloadable on its own or zipped.
3. **Regenerates it:**
   - in **your voice**, learned from posts you wrote (the My voice tab), or in another voice;
   - as another format (an X thread, LinkedIn, an Instagram caption, a video script, carousel slides…) or in another language;
   - written by Claude (`ANTHROPIC_API_KEY`) or by a local model through Ollama.

   The prompt asks for an original post that carries the same ideas, not a reworded copy, and credits the author by default.
4. **Narrates it** with [Izwi](../izwi) (`./start.sh izwi`):
   - in **your own cloned voice**: upload 5 to 30 seconds of yourself reading, with the words you read and your consent;
   - or in one of Izwi's built-in voices.

```bash
systems/post-studio/setup.sh
./start.sh post-studio            # http://localhost:8097  (add izwi for narration: ./start.sh post-studio izwi)
python3 systems/post-studio/test_post_studio.py -v
```

| Platform | How it is read |
|---|---|
| X | The FxTwitter API (public, no login), then yt-dlp |
| Threads | The JSON embedded in the post page (neither yt-dlp nor gallery-dl has a Threads extractor), then its page tags |
| Instagram, Facebook | gallery-dl, then yt-dlp, then the page tags. Most posts need you signed in: export a `cookies.txt` from your browser and set its path in the Setup tab |

**Settings (environment variables):**

| Variable | What it sets |
|---|---|
| `ANTHROPIC_API_KEY` | Lets Claude do the writing |
| `POST_STUDIO_MODEL` | The Claude model, default `claude-opus-5-5` |
| `OLLAMA_URL`, `OLLAMA_MODEL` | The local model |
| `IZWI_URL` | Izwi's address, default `http://localhost:8090` |
| `POST_STUDIO_LIBRARY` | Where posts are saved |
| `POST_STUDIO_COOKIES` | Your cookies file, for Instagram and Facebook |

**Use it for posts you may save and reuse.** Keep the credit to the original author when you publish a rewrite, and clone only your own voice or one whose owner agreed. Izwi refuses to save a voice without that consent.
