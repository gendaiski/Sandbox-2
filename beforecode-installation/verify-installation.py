"""Exercise the packaged original CLI; writes only to a fresh output directory."""
import json
import pathlib
import subprocess
import sys

cli = pathlib.Path(sys.argv[1]).resolve()
root = pathlib.Path(sys.argv[2]).resolve()
root.mkdir(parents=True, exist_ok=False)
transcript = []

def run(folder, *args):
    result = subprocess.run(['node', str(cli), *args], cwd=folder, text=True, capture_output=True, check=True)
    transcript.append({'cwd': str(folder.relative_to(root)), 'args': args, 'stdout': result.stdout, 'stderr': result.stderr})
    return result.stdout

types = ['small', 'portfolio', 'saas', 'crm', 'ecommerce', 'mobile', 'ai-agent', 'opensource']
for kind in types:
    folder = root / 'types' / kind
    folder.mkdir(parents=True)
    run(folder, 'init', '--type', kind, '--name', 'Installation ' + kind)
    assert 'Readiness: 100%' in run(folder, 'check')
    run(folder, 'score')
    run(folder, 'handoff')
    assert (folder / 'AGENTS.md').is_file()
    assert (folder / 'docs/ai-handoff.md').is_file()
    run(folder, 'doctor')
    first = sorted((folder / 'docs').glob('*.md'))[0]
    first.write_text('User edit: preserve this content.\n')
    run(folder, 'init', '--type', kind)
    assert first.read_text() == 'User edit: preserve this content.\n'
    run(folder, 'init', '--type', kind, '--force')
    assert first.read_text() != 'User edit: preserve this content.\n'

folder = root / 'dry-run'
folder.mkdir()
run(folder, 'start', '--idea', 'A simple project planner', '--dry-run')
assert not list(folder.iterdir())

folder = root / 'templates'
folder.mkdir()
templates = ['api-documentation', 'build-plan', 'business-requirements', 'database-schema', 'decision-record', 'deployment-plan', 'implementation-plan', 'permission-matrix', 'prd', 'project-brief', 'qa-test-plan', 'release-scope', 'research-report', 'srs', 'trd', 'ui-system', 'ux-flows']
for template in templates:
    run(folder, 'add', template)
    assert (folder / 'docs' / (template + '.md')).stat().st_size > 0

cases = [
    ('client-portal', 'saas', 'Client Portal', 'A secure client portal for a small legal practice.', 'Clients,Case managers', 'Upload documents,Track case milestones,Request updates'),
    ('agency-crm', 'crm', 'Agency CRM', 'A CRM that tracks inquiries and follow-up tasks for a creative agency.', 'Sales staff,Account managers', 'Capture leads,Assign follow-ups,Track deal stages'),
    ('research-agent', 'ai-agent', 'Research Agent', 'A research agent that gathers sources and drafts summaries for human approval.', 'Researchers,Editors', 'Collect sources,Compare evidence,Draft summaries,Approve output')
]
for slug, kind, name, idea, users, features in cases:
    folder = root / 'cases' / slug
    folder.mkdir(parents=True)
    (folder / 'idea.md').write_text(idea + '\n')
    run(folder, 'start', '--from', 'idea.md', '--type', kind, '--name', name, '--users', users, '--features', features)
    context = (folder / 'docs/00-project-context.md').read_text()
    assert name in context and idea in context
    assert 'TBD' in context  # Unknown requirements stay explicit.
    assert 'Readiness: 100%' in run(folder, 'check')
    run(folder, 'score')
    run(folder, 'handoff')
    doctor = run(folder, 'doctor')
    assert 'Docs needing attention:' in doctor

(root / 'transcript.json').write_text(json.dumps(transcript, indent=2) + '\n')
print('PASS: 8 project types; 17 templates; check/score/doctor/handoff; overwrite protection; explicit force; dry-run; 3 context-first cases.')
