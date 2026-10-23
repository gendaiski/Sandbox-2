"""Build the offline-capable Onboarding System UI from the authoritative tracker."""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TRACKER = ROOT / "native/batch-2026-10-23/INSTALLATION_TRACKER.md"
QUEUE = ROOT / "native/PENDING-BATCH-19.md"
TEMPLATE = ROOT / "scripts/templates/onboarding-system.html"
OUTPUT = ROOT / "showcase/onboarding-system/index.html"


def read_queue():
    entries = re.findall(r"^(\d{2})\. `([^`]+)`$", QUEUE.read_text(), re.M)
    assert len(entries) == 41, f"Expected 41 ordered queue entries, got {len(entries)}"
    assert [int(number) for number, _ in entries] == list(range(1, 42))
    assert len({repository.lower() for _, repository in entries}) == len(entries)
    return entries


def read_tracker():
    records = []
    for line in TRACKER.read_text().splitlines():
        match = re.match(
            r"\| (\d{2}) \| \[([^]]+)\]\((https://github\.com/[^)]+)\) \| "
            r"([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|",
            line,
        )
        if not match:
            continue
        number, repository, url, status, description, website, official, report = (
            value.strip() for value in match.groups()
        )
        assert url == f"https://github.com/{repository}", repository
        assert status in {
            "QUEUED", "INVESTIGATING", "IN PROGRESS", "COMPLETE",
            "PARTIAL", "BLOCKED", "UNAVAILABLE",
        }, (repository, status)
        records.append({
            "number": int(number),
            "repository": repository,
            "github": url,
            "status": status,
            "description": description,
            "listedWebsite": website,
            "officialWebsite": official,
            "report": report,
        })
    return records


def main():
    queue = read_queue()
    records = read_tracker()
    assert len(records) == len(queue), "Queue and tracker lengths differ"
    for (number, repository), record in zip(queue, records):
        assert (int(number), repository) == (record["number"], record["repository"]), (
            number, repository, record
        )
    data = json.dumps(records, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    page = TEMPLATE.read_text().replace("__QUEUE_DATA__", data)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(page)
    print(f"Built Onboarding System with {len(records)} tracked repositories")


if __name__ == "__main__":
    main()
