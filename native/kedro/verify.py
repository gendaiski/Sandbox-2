"""Smoke-check Kedro-Viz against the executed original starter pipeline."""

import json
import os
from pathlib import Path
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[2]
PROJECT = Path(os.environ.get("KEDRO_PROJECT_PATH", ROOT / "native/data/kedro-projects/sandbox-pipeline"))
BASE = os.environ.get("KEDRO_URL", "http://127.0.0.1:8794").rstrip("/")


def main():
    assert (PROJECT / "data/03_primary/model_input_table.parquet").is_file()
    assert any((PROJECT / "data/06_models/regressor.pickle").rglob("regressor.pickle"))
    with urlopen(BASE, timeout=15) as response:
        assert response.status == 200
        assert b"Kedro-Viz" in response.read()
    with urlopen(BASE + "/api/main", timeout=15) as response:
        assert response.status == 200
        graph = json.load(response)
    task_count = sum(node["type"] == "task" for node in graph["nodes"])
    dataset_count = sum(node["type"] == "data" for node in graph["nodes"])
    assert task_count == 9
    assert dataset_count == 15
    assert len(graph["edges"]) > 0
    assert {item["id"] for item in graph["pipelines"]} >= {
        "__default__", "data_processing", "data_science", "reporting"
    }
    print(f"Kedro native check passed: {task_count} tasks, {dataset_count} datasets, {len(graph['edges'])} edges")


if __name__ == "__main__":
    main()
