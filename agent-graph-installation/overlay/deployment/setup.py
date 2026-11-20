from pathlib import Path
import secrets
root = Path(__file__).resolve().parent
path = root / '.env'
if path.exists():
    raise SystemExit('Configuration exists; keeping its credentials unchanged.')
storage = secrets.token_urlsafe(32)
values = {
    'APP_NAME': 'Agent-Graph', 'APP_VERSION': '3.0.0', 'PORT': '20050',
    'PUBLIC_API_BASE_URL': 'http://localhost:20050', 'MCP_CLIENT_PORT': '20052',
    'MCP_CLIENT_HOST': '127.0.0.1', 'MONGODB_DB': 'agent-graph',
    'JWT_SECRET_KEY': secrets.token_urlsafe(48), 'ADMIN_USERNAME': 'admin',
    'ADMIN_PASSWORD': secrets.token_urlsafe(24), 'MINIO_ACCESS_KEY': 'agentgraph',
    'MINIO_SECRET_KEY': storage, 'MINIO_ROOT_USER': 'agentgraph',
    'MINIO_ROOT_PASSWORD': storage, 'MINIO_SECURE': 'false',
    'MINIO_BUCKET_NAME': 'agent-graph', 'CORS_ORIGINS': 'http://localhost:20050',
}
path.write_text('\n'.join(f'{k}={v}' for k,v in values.items())+'\n')
path.chmod(0o600)
print('Created deployment/.env. Read ADMIN_PASSWORD there to log in; never commit it.')
