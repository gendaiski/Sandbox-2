"""Do what the repo invites: take a video's prompt and have Claude Opus 5.5 write
the animation as code, saved as one HTML file (open it in a browser).
    export ANTHROPIC_API_KEY=...
    .venv/bin/python remake.py ror-fly-880547        # a slug from data/videos.json
    .venv/bin/python remake.py --list explainer      # slugs in a category
"""
import argparse
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).parent
VIDEOS = json.loads((HERE.parents[1] / "vendor/opus-videos/data/videos.json").read_text())
SYSTEM = ("You write self-contained animations and interactive pieces as code. Answer with one complete HTML "
          "document (inline CSS and JavaScript; libraries only from a CDN such as cdnjs) that runs when opened "
          "in a browser, and nothing else.")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("slug", nargs="?")
    ap.add_argument("--list", metavar="CATEGORY", nargs="?", const="")
    ap.add_argument("--model", default="claude-opus-5-5")
    args = ap.parse_args()
    if args.list is not None:
        for v in VIDEOS:
            if args.list in v["category"]:
                print(f'{v["slug"]:32} {v["category"]:14} {v["prompt"][:70]}')
        return 0
    video = next((v for v in VIDEOS if v["slug"] == args.slug), None)
    if not video:
        print(f"unknown slug {args.slug!r}; see --list", file=sys.stderr)
        return 2

    import anthropic

    client = anthropic.Anthropic()
    with client.messages.stream(
        model=args.model,
        max_tokens=64000,
        thinking={"type": "adaptive"},
        system=SYSTEM,
        messages=[{"role": "user", "content": video["prompt"]}],
    ) as stream:
        message = stream.get_final_message()
    if message.stop_reason == "refusal":
        print("Claude declined this prompt.", file=sys.stderr)
        return 1
    text = "".join(b.text for b in message.content if b.type == "text")
    found = re.search(r"<!doctype html.*?</html>", text, re.S | re.I) or re.search(r"<html.*?</html>", text, re.S | re.I)
    if not found:
        print("No HTML document in the answer:\n" + text[:500], file=sys.stderr)
        return 1
    if message.stop_reason == "max_tokens":
        print("warning: the answer hit max_tokens; the page may be cut off", file=sys.stderr)
    out = HERE / ".remakes" / f"{video['slug']}.html"
    out.parent.mkdir(exist_ok=True)
    out.write_text(found.group(0))
    print(f"{out} ({message.usage.output_tokens} output tokens). Rebuild the site to link it: build_site.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
