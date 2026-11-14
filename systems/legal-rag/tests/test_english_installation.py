from pathlib import Path
import json
import pytest
from legalrag.config import AppConfig
from legalrag.retrieval.bm25_retriever import BM25Retriever
from legalrag.retrieval.builders.bm25_builder import build_bm25_index
from legalrag.retrieval.builders.incremental_bm25_builder import IncrementalBM25Builder
from legalrag.schemas import LawChunk
from legalrag.llm.client import LLMClient


def test_english_defaults_and_model_selection(monkeypatch):
    monkeypatch.delenv('LEGALRAG_LANGUAGE', raising=False)
    cfg=AppConfig.load()
    assert cfg.language=='en'
    assert cfg.paths.law_jsonl.endswith('law_en.jsonl')
    assert cfg.pdf.ocr_lang=='eng'
    assert 'en' in cfg.retrieval.embedding_model


def test_english_bm25_matches_capitalized_query_after_ingestion(tmp_path):
    cfg=AppConfig()
    cfg.retrieval.bm25_index_file=str(tmp_path/'bm25.pkl')
    def chunk(id,text):
        return LawChunk(id=id,law_name='Test',article_no=id,article_id=id,text=text,lang='en')
    build_bm25_index(cfg,[chunk('1','Apples and oranges.'),chunk('2','Contracts and warranties.'),chunk('3','Goods and delivery.')])
    upload=tmp_path/'upload.jsonl'
    upload.write_text(chunk('4','ZephyrBond unique warranty provisions.').model_dump_json()+'\n')
    assert IncrementalBM25Builder(cfg).add_jsonl(upload)==1
    assert BM25Retriever(cfg).search('ZEPHYRBOND',1)[0][0].id=='4'


def test_english_ui_ignores_browser_locale():
    html=Path('ui/index.html').read_text()
    assert '<html lang="en">' in html
    assert "let currentLang = 'en'" in html
    assert 'class="lang-zh"' not in html
    assert 'navigator.language' not in html
    assert 'Request failed:' in html


def test_missing_provider_message_is_english():
    client=LLMClient(provider='disabled',model_name='',max_context_tokens=4096)
    text=client._degraded_response('question')['text']
    assert 'unavailable' in text
    assert not any('\u4e00'<=c<='\u9fff' for c in text)


def test_english_prompt_registry():
    d=json.loads(Path('legalrag/prompts/prompt_en.json').read_text())
    for spec in d['registry'].values():
        if isinstance(spec,dict) and 'system' in spec:
            assert spec['system'].startswith('Respond entirely in English.')


def test_retrieval_api_does_not_require_generation_key(monkeypatch):
    from fastapi.testclient import TestClient
    from legalrag.api import server
    from legalrag.routing.router import RoutingDecision
    class Pipeline:
        def retrieve(self, question, llm_override=None, top_k=None):
            return RoutingDecision(), [], 3
    monkeypatch.setattr(server, 'PIPELINE_READY', True)
    monkeypatch.setattr(server, 'pipeline', Pipeline())
    cfg=AppConfig.load();cfg.llm.provider='disabled'
    monkeypatch.setattr(server, 'CFG', cfg)
    monkeypatch.setattr(server, 'RETRIEVAL_URL', '')
    client=TestClient(server.app)
    response=client.post('/rag/retrieve',json={'question':'What is a warranty?'})
    assert response.status_code==200
    rid=response.json()['retrieval_id']
    response=client.post('/rag/answer',json={'retrieval_id':rid})
    assert response.status_code==401
    assert 'API Key required' in response.json()['detail']


def test_answer_pipeline_keeps_english_for_non_english_question():
    from legalrag.pipeline.rag_pipeline import RagPipeline
    from legalrag.schemas import TaskType, IssueType
    pipeline=object.__new__(RagPipeline)
    pipeline.cfg=AppConfig()
    d=json.loads(Path('legalrag/prompts/prompt_en.json').read_text())
    pipeline._en_registry=d.get('registry',{})
    pipeline._en_example_pool=d.get('example_pool',[])
    pipeline._en_defaults=d.get('defaults',{})
    messages=pipeline._build_messages('合同',[],TaskType.JUDGE_STYLE,IssueType.OTHER)
    assert messages[0]['content'].startswith('Respond entirely in English.')


def test_colbert_reloads_index_and_metadata_together_after_rebuild(tmp_path):
    from legalrag.retrieval.colbert_retriever import ColBERTRetriever
    from filelock import FileLock
    r=object.__new__(ColBERTRetriever)
    r.enabled=True; r.index_path=tmp_path; r._index_generation=1
    r._generation=lambda:2
    calls=[]
    r._load_meta_and_collection=lambda:calls.append('metadata')
    r._init_searcher=lambda force=False:calls.append(('index',force))
    r._search=lambda q,k:['new-index-result']
    assert r.search('new upload')==['new-index-result']
    assert calls==['metadata',('index',True)]
    r.search('second query');assert len(calls)==2
    with FileLock(str(tmp_path/'.colbert_build.lock')):
        assert r.search('during rebuild')==[]


def test_pdf_label_does_not_split_english_letter_s():
    from legalrag.ingest.ingestor import _extract_label_from_chunk
    assert _extract_label_from_chunk('Services agreement obligations')=='Services'
