// Prints Izwi's model catalog as JSON for the Izwi page:
//   cd interactive/data/izwi_catalog && CARGO_TARGET_DIR=/tmp/izcat cargo run -q --release > ../izwi_models.json
use izwi_model_catalog::ModelVariant;
fn main() {
    let rows: Vec<serde_json::Value> = ModelVariant::all().iter().map(|v| {
        let kind = if v.is_tokenizer() { "tokenizer" } else if v.is_diarization() { "diarization" } else if v.is_forced_aligner() { "aligner" }
            else if v.is_audio_chat() { "audio chat" } else if v.is_asr() { "asr" } else if v.is_chat() { "chat" } else if v.is_tts() { "tts" } else { "other" };
        serde_json::json!({
            "id": serde_json::to_value(v).unwrap(), "name": v.display_name(), "repo": v.repo_id(), "kind": kind,
            "bytes": v.estimated_size(), "memGb": v.memory_required_gb(), "license": v.license_label(), "quantized": v.is_quantized(), "gguf": v.is_gguf(),
            "enabled": v.is_enabled(), "streams": v.streams_on_its_tts_route(), "sampleRate": v.tts_output_sample_rate_hint(), "maxSeconds": v.tts_max_output_seconds_hint(),
            "translation": v.supports_asr_translation(), "speakers": v.supports_speaker_attributed_asr(),
        })
    }).collect();
    println!("{}", serde_json::to_string(&rows).unwrap());
}
