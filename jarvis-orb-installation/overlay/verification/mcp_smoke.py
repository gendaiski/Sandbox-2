"""Exercise all original tools over MCP and verify WebSocket events and persistence."""
import asyncio
import json
import os
import re
import sys
import tempfile
from pathlib import Path
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
import websockets

async def run():
    with tempfile.TemporaryDirectory(prefix='jarvis-mcp-check-') as directory:
        params = StdioServerParameters(command=sys.executable, args=['-m', 'jarvis_brain.mcp_server'], env={**os.environ, 'JARVIS_BRAIN_DIR': directory, 'JARVIS_WS_PORT': '19321'})
        async def call(session, name, args):
            result = await session.call_tool(name, args)
            assert not result.isError, result
            text = '\n'.join(item.text for item in result.content if hasattr(item, 'text'))
            assert not text.startswith('Error:'), text
            return text
        async with stdio_client(params) as (reader, writer):
            async with ClientSession(reader, writer) as session:
                await session.initialize()
                assert len((await session.list_tools()).tools) == 7
                saved = await call(session, 'memory_save', {'content': 'InstallationDecision SQLite persistence', 'memory_type': 'semantic'})
                memory_id = re.search(r'Saved memory (\S+)', saved).group(1)
                async with websockets.connect('ws://localhost:19321') as ws:
                    found = await call(session, 'memory_search', {'query': 'InstallationDecision'})
                    assert 'SQLite' in found
                    assert json.loads(await asyncio.wait_for(ws.recv(), 5))['type'] == 'search'
                await call(session, 'memory_verify', {'memory_id': memory_id})
                project = await call(session, 'entity_create', {'entity_type': 'project', 'name': 'Installation project', 'state': '{"status":"planned"}'})
                person = await call(session, 'entity_create', {'entity_type': 'person', 'name': 'Evaluation owner'})
                project_id = re.search(r'Entity ([^:]+):', project).group(1)
                person_id = re.search(r'Entity ([^:]+):', person).group(1)
                await call(session, 'entity_update', {'entity_id': project_id, 'new_state': '{"status":"verified"}', 'reason': 'Installation check'})
                assert 'verified' in await call(session, 'entity_query', {'name': 'Installation project'})
                await call(session, 'entity_relate', {'subject_id': person_id, 'predicate': 'owns', 'object_id': project_id})
        assert (Path(directory) / 'brain.db').exists()
        async with stdio_client(params) as (reader, writer):
            async with ClientSession(reader, writer) as session:
                await session.initialize()
                assert 'SQLite' in await call(session, 'memory_search', {'query': 'InstallationDecision'})
                assert 'verified' in await call(session, 'entity_query', {'name': 'Installation project'})
        print('PASS seven MCP tools, real WebSocket event, and SQLite persistence across process restart')

asyncio.run(run())
