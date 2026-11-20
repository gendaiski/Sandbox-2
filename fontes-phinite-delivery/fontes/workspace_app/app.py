"""Research HTTP API and durable SQLite workspace for a local/container install.

Cloud research uses the same API; /api/records is served by private Vercel Blob.
Only user notes and source references are persisted, never fetched legal texts.
"""
import asyncio
import dataclasses
import inspect
import json
import os
import re
import secrets
import sqlite3
import time
import typing
from pathlib import Path

os.environ.setdefault("FONTES_NO_UPDATE_CHECK", "1")
from pydantic import ConfigDict, ValidationError, create_model
from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.routing import Route, Mount
from starlette.staticfiles import StaticFiles
from world_legal_mcp import registry, server

TOOLS = {name: getattr(server, name) for name in (
    "list_jurisdictions", "search_caselaw", "get_decision", "search_legislation",
    "get_legislation_toc", "get_legislation_provision", "get_legislation_text")}
MODELS = {}
for name, fn in TOOLS.items():
    hints = typing.get_type_hints(fn)
    fields = {p.name: (hints.get(p.name, typing.Any), ... if p.default is inspect.Parameter.empty else p.default)
              for p in inspect.signature(fn).parameters.values()}
    MODELS[name] = create_model(name, __config__=ConfigDict(extra="forbid"), **fields)

def response(data, status=200):
    return JSONResponse(data, status_code=status, headers={"Cache-Control": "no-store", "X-Content-Type-Options": "nosniff"})

async def health(request):
    js = registry.available()
    return response({"ok": not registry._broken, "version": "0.1.1", "jurisdictions": len(js),
                     "research_tools": len(TOOLS), "broken_adapters": registry._broken,
                     "storage": "private-cloud-documents" if os.getenv("VERCEL") else "sqlite"})

async def catalog(request):
    return response({"jurisdictions": [{"code":j.code, "name":j.name, "languages":j.languages,
        "supported":j.supported(), "notes":j.notes, "gaps":j.gaps,
        "caselaw_filters":j.caselaw_filters, "legislation_filters":j.legislation_filters,
        "samples":j.samples, "sources":[dataclasses.asdict(s) for s in j.sources]} for j in registry.available()],
        "tools":{k:MODELS[k].model_json_schema() for k in TOOLS}})

async def schema(request):
    """Public structural metadata only. Never return tokens, owners or other visitors' records."""
    return response({
        "active_storage": "cloud" if os.getenv("VERCEL") else "sqlite",
        "sqlite": {"table": "notes", "columns": [
            {"name":"id", "type":"TEXT", "constraint":"PRIMARY KEY"},
            {"name":"owner", "type":"TEXT", "constraint":"NOT NULL"},
            {"name":"created", "type":"INTEGER", "constraint":"NOT NULL"},
            {"name":"data", "type":"TEXT", "constraint":"NOT NULL · JSON payload"}],
            "indexes":[{"name":"notes_owner", "columns":["owner"]}], "foreign_keys":[]},
        "cloud": {"store":"Private Vercel Blob", "path":"research/{anonymous-session}/{note-id}.json",
            "fields":[["id","string"],["created","number"],["title","string"],["note","string"],
                      ["url","string"],["jurisdiction","string"],["matter","string"]]},
        "payload_fields":[["title","string · max 180"],["note","string · max 6000"],
                          ["url","HTTP(S) source link"],["jurisdiction","code · max 40"],["matter","string · max 120"]],
        "relationships": {"jurisdiction":"Logical match by code, not an enforced database foreign key",
                           "source":"Stored URL reference; source text is fetched live, not stored"},
        "no_corpus": True})

async def research(request: Request):
    try:
        raw = await request.body()
        if len(raw)>16000:
            return response({"error":"Request too large"},413)
        body=json.loads(raw)
        name=body.get("tool")
        if name not in TOOLS:
            return response({"error":"Unknown research tool"},400)
        args=MODELS[name].model_validate(body.get("arguments",{})).model_dump()
        for key,maximum in (("limit",50),("page",100),("max_chars",120000),("offset",10000000)):
            if key in args and not (0 if key=="offset" else 1)<=args[key]<=maximum:
                return response({"error":f"{key} must be between {0 if key=='offset' else 1} and {maximum}"},400)
        if any(isinstance(v,str) and len(v)>4000 for v in args.values()):
            return response({"error":"Input exceeds 4,000 characters"},400)
        start=time.monotonic()
        result=await asyncio.wait_for(TOOLS[name](**args),timeout=90)
        return response({"markdown":result,"tool":name,"seconds":round(time.monotonic()-start,2),"live":True})
    except (ValidationError,ValueError,TypeError,AttributeError) as exc:
        return response({"error":str(exc)[:1500]},400)
    except TimeoutError:
        return response({"error":"The source did not respond within 90 seconds. Try again or open its official website."},504)
    except Exception:
        return response({"error":"The source adapter failed. Try another source or report the issue using the upstream MCP client."},502)

def database():
    path=Path(os.getenv("FONTES_DB_PATH","data/research.sqlite3"))
    path.parent.mkdir(parents=True,exist_ok=True)
    db=sqlite3.connect(path)
    db.execute("PRAGMA journal_mode=WAL")
    db.execute("CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY, owner TEXT NOT NULL, created INTEGER NOT NULL, data TEXT NOT NULL)")
    db.execute("CREATE INDEX IF NOT EXISTS notes_owner ON notes(owner)")
    return db

def validate_note(data):
    if not isinstance(data,dict):raise ValueError("Expected a note object")
    note={k:str(data.get(k,""))[:n] for k,n in (("title",180),("note",6000),("url",1500),("jurisdiction",40),("matter",120))}
    if not note["title"].strip():raise ValueError("Give this research note a title")
    if note["url"] and not re.match(r"^https?://",note["url"]):raise ValueError("Source URL must use HTTPS or HTTP")
    return note

async def records(request):
    owner=request.cookies.get("fontes_session","")
    fresh=not re.fullmatch(r"[0-9a-f]{64}",owner)
    if fresh:owner=secrets.token_hex(32)
    if request.method!="GET":
        origin=request.headers.get("origin")
        if origin and origin.rstrip("/")!=str(request.base_url).rstrip("/"):
            return response({"error":"Cross-origin writes are not allowed"},403)
        if request.headers.get("x-fontes-workspace")!="1":
            return response({"error":"Workspace header required"},403)
    try:
        with database() as db:
            if request.method=="GET":
                rows=db.execute("SELECT id,created,data FROM notes WHERE owner=? ORDER BY created DESC",(owner,)).fetchall()
                out={"records":[dict(json.loads(d),id=i,created=c) for i,c,d in rows],"storage":"SQLite database"}
            elif request.method=="POST":
                raw=await request.body()
                if len(raw)>10000:return response({"error":"Note is too large"},413)
                note=validate_note(json.loads(raw))
                count=db.execute("SELECT COUNT(*) FROM notes WHERE owner=?",(owner,)).fetchone()[0]
                if count>=100:return response({"error":"100 saved notes reached. Export and remove notes before adding more."},409)
                ident=secrets.token_hex(16);created=int(time.time()*1000)
                db.execute("INSERT INTO notes VALUES (?,?,?,?)",(ident,owner,created,json.dumps(note)))
                out={"record":dict(note,id=ident,created=created)}
            else:
                ident=request.query_params.get("id","")
                db.execute("DELETE FROM notes WHERE id=? AND owner=?",(ident,owner))
                out={"ok":True}
        r=response(out)
        if fresh:r.set_cookie("fontes_session",owner,max_age=31536000,httponly=True,secure=request.url.scheme=="https",samesite="strict")
        return r
    except (ValueError,json.JSONDecodeError) as exc:
        return response({"error":str(exc)},400)

app=Starlette(routes=[Route("/api/health",health),Route("/api/catalog",catalog),Route("/api/schema",schema),
    Route("/api/research",research,methods=["POST"]),Route("/api/records",records,methods=["GET","POST","DELETE"]),
    Mount("/",app=StaticFiles(directory=Path(__file__).parent/"static",html=True))])
