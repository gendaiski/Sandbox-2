import pytest
from starlette.testclient import TestClient
from workspace_app.app import app

@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv('FONTES_DB_PATH',str(tmp_path/'research.sqlite3'))
    with TestClient(app) as c: yield c

HEADERS={'X-Fontes-Workspace':'1'}

def test_registry_and_tools(client):
    health=client.get('/api/health').json()
    assert health['jurisdictions']==124 and health['broken_adapters']=={}
    cat=client.get('/api/catalog').json()
    assert len(cat['tools'])==7
    assert 'get_legislation_provision' in cat['tools']
    assert any(j['code']=='gb' for j in cat['jurisdictions'])

def test_unknown_arguments_and_tool_rejected(client):
    assert client.post('/api/research',json={'tool':'report_bug','arguments':{}}).status_code==400
    r=client.post('/api/research',json={'tool':'search_caselaw','arguments':{'jurisdiction':'gb','year':2025}})
    assert r.status_code==400 and 'Extra inputs' in r.json()['error']
    assert client.post('/api/research',json={'tool':'search_caselaw','arguments':{'jurisdiction':'gb','limit':9999}}).status_code==400

def test_source_permissions_preserved(client):
    r=client.post('/api/research',json={'tool':'list_jurisdictions','arguments':{'query':'gb'}})
    assert r.status_code==200 and 'United Kingdom' in r.json()['markdown']

def test_notes_persist_and_are_isolated(client):
    client.get('/api/records')
    r=client.post('/api/records',headers=HEADERS,json={'title':'Test matter','note':'Own analysis','url':'https://example.org/'})
    assert r.status_code==200
    ident=r.json()['record']['id']
    assert client.get('/api/records').json()['records'][0]['id']==ident
    with TestClient(app) as other:
        assert other.get('/api/records').json()['records']==[]
        other.delete('/api/records?id='+ident,headers=HEADERS)
    assert len(client.get('/api/records').json()['records'])==1
    client.delete('/api/records?id='+ident,headers=HEADERS)
    assert client.get('/api/records').json()['records']==[]

def test_note_validation_and_cross_origin_write(client):
    assert client.post('/api/records',json={'title':'x'}).status_code==403
    assert client.post('/api/records',headers={**HEADERS,'Origin':'https://evil.example'},json={'title':'x'}).status_code==403
    assert client.post('/api/records',headers=HEADERS,json={'title':'x','url':'javascript:alert(1)'}).status_code==400
    assert client.post('/api/records',headers=HEADERS,json={'title':''}).status_code==400
