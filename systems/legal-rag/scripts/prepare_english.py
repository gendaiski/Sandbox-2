"""Build the real English corpus and indexes, including ColBERT, on first start."""
from pathlib import Path
import shutil
from legalrag.config import AppConfig, BASE_DIR
from legalrag.retrieval.corpus_loader import load_chunks_from_dir

def main():
    cfg = AppConfig.load()
    raw = Path(cfg.paths.raw_dir)
    original = BASE_DIR / 'data' / 'raw'
    if raw.resolve() != original.resolve():
        shutil.copytree(original, raw, dirs_exist_ok=True)
    if not Path(cfg.paths.law_jsonl).exists():
        from scripts.preprocess_law import main as preprocess
        if preprocess() != 0:
            raise RuntimeError('Corpus preprocessing failed')
    chunks = [c for c in load_chunks_from_dir(cfg.paths.processed_dir, '*.jsonl') if c.lang == cfg.language]
    if not chunks:
        raise RuntimeError('No English corpus found')
    if not Path(cfg.retrieval.faiss_index_file).exists():
        from legalrag.retrieval.builders.faiss_builder import build_faiss_index
        build_faiss_index(cfg, chunks)
    if not Path(cfg.retrieval.bm25_index_file).exists():
        from legalrag.retrieval.builders.bm25_builder import build_bm25_index
        build_bm25_index(cfg, chunks)
    if not Path(cfg.paths.law_graph_jsonl).exists():
        from legalrag.retrieval.builders.graph_builder import GraphBuilder
        GraphBuilder(cfg).build_from_chunks(chunks)
    marker = Path(cfg.retrieval.colbert_index_path) / cfg.retrieval.colbert_experiment / 'indexes' / cfg.retrieval.colbert_index_name / 'metadata.json'
    if cfg.retrieval.enable_colbert and not marker.exists():
        from legalrag.retrieval.builders.colbert_builder import build_colbert_index
        build_colbert_index(cfg, chunks, override=True)

if __name__ == '__main__':
    main()
