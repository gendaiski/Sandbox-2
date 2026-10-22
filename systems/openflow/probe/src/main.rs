//! Deserialize each workflow file with OpenFlow's `engine::Workflow`, run the
//! engine's validator, and print one JSON line per file:
//! {"file": ..., "ok": true, "layers": [[...], ...]} or {"file": ..., "ok": false, "error": ...}

use engine::graph::{execution_layers, Workflow};
use serde_json::json;
use std::process::ExitCode;

fn check(path: &str) -> serde_json::Value {
    let text = match std::fs::read_to_string(path) {
        Ok(text) => text,
        Err(e) => return json!({"file": path, "ok": false, "stage": "read", "error": e.to_string()}),
    };
    let workflow: Workflow = match serde_json::from_str(&text) {
        Ok(workflow) => workflow,
        Err(e) => return json!({"file": path, "ok": false, "stage": "parse", "error": e.to_string()}),
    };
    match execution_layers(&workflow) {
        Ok(layers) => {
            let layers: Vec<Vec<String>> = layers
                .iter()
                .map(|layer| layer.iter().map(|id| id.to_string()).collect())
                .collect();
            json!({"file": path, "ok": true, "nodes": workflow.nodes.len(), "layers": layers})
        }
        Err(e) => json!({"file": path, "ok": false, "stage": "validate", "error": e.to_string()}),
    }
}

fn main() -> ExitCode {
    let files: Vec<String> = std::env::args().skip(1).collect();
    if files.is_empty() {
        eprintln!("usage: openflow-probe <workflow.json>...");
        return ExitCode::from(2);
    }
    for file in &files {
        println!("{}", check(file));
    }
    ExitCode::SUCCESS
}
