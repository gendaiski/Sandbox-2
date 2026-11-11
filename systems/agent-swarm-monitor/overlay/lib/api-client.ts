/**
 * API Client
 *
 * Reusable fetch wrapper with snake_case/camelCase transformation
 * for communicating with the backend REST API.
 */

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

function transformKeys(obj: unknown, transformer: (key: string) => string): unknown {
    if (Array.isArray(obj)) {
        return obj.map((item) => transformKeys(item, transformer));
    }
    if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
            result[transformer(key)] = transformKeys(value, transformer);
        }
        return result;
    }
    return obj;
}

export function snakeToCamelKeys<T>(obj: unknown): T {
    return transformKeys(obj, snakeToCamel) as T;
}

export function camelToSnakeKeys(obj: unknown): unknown {
    return transformKeys(obj, camelToSnake);
}

export class ApiError extends Error {
    constructor(
        public statusCode: number,
        public detail: string,
    ) {
        super(detail);
        this.name = 'ApiError';
    }
}

export class ApiTimeoutError extends Error {
    constructor(
        public url: string,
        public timeoutMs: number,
    ) {
        super(`Request to ${url} timed out after ${timeoutMs}ms`);
        this.name = 'ApiTimeoutError';
    }
}

class ApiClient {
    private baseUrl: string;
    private defaultTimeout: number = 30000; // 30 seconds
    private token: string | null = null;

    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    }

    setToken(token: string | null) {
        this.token = token;
    }

    private get authHeaders(): Record<string, string> {
        return this.token ? { Authorization: `Bearer ${this.token}` } : {};
    }

    private async fetchWithTimeout(
        url: string,
        options: RequestInit,
        timeoutMs: number = this.defaultTimeout
    ): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new ApiTimeoutError(url, timeoutMs);
            }
            throw error;
        }
    }

    private buildUrl(path: string, params?: Record<string, string>): string {
        const url = `${this.baseUrl}${path}`;
        if (!params || Object.keys(params).length === 0) return url;

        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null && value !== '') {
                searchParams.set(key, value);
            }
        }
        const qs = searchParams.toString();
        return qs ? `${url}?${qs}` : url;
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            let detail = `HTTP ${response.status}`;
            try {
                const body = await response.json();
                detail = body.detail || detail;
            } catch {
                // Use default detail
            }
            throw new ApiError(response.status, detail);
        }

        if (response.status === 204) {
            return undefined as T;
        }

        const data = await response.json();
        return snakeToCamelKeys<T>(data);
    }

    async get<T>(path: string, params?: Record<string, string>, timeoutMs?: number): Promise<T> {
        const url = this.buildUrl(path, params);
        const response = await this.fetchWithTimeout(
            url,
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', ...this.authHeaders },
            },
            timeoutMs
        );
        return this.handleResponse<T>(response);
    }

    async post<T>(path: string, body?: unknown, timeoutMs?: number): Promise<T> {
        const url = this.buildUrl(path);
        const response = await this.fetchWithTimeout(
            url,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...this.authHeaders },
                body: body ? JSON.stringify(camelToSnakeKeys(body)) : undefined,
            },
            timeoutMs
        );
        return this.handleResponse<T>(response);
    }

    async put<T>(path: string, body: unknown, timeoutMs?: number): Promise<T> {
        const url = this.buildUrl(path);
        const response = await this.fetchWithTimeout(
            url,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...this.authHeaders },
                body: JSON.stringify(camelToSnakeKeys(body)),
            },
            timeoutMs
        );
        return this.handleResponse<T>(response);
    }

    async patch<T>(path: string, body: unknown, timeoutMs?: number): Promise<T> {
        const url = this.buildUrl(path);
        const response = await this.fetchWithTimeout(
            url,
            {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...this.authHeaders },
                body: JSON.stringify(camelToSnakeKeys(body)),
            },
            timeoutMs
        );
        return this.handleResponse<T>(response);
    }

    async delete(path: string, timeoutMs?: number): Promise<void> {
        const url = this.buildUrl(path);
        const response = await this.fetchWithTimeout(
            url,
            {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', ...this.authHeaders },
            },
            timeoutMs
        );
        await this.handleResponse<void>(response);
    }

    async deleteWithBody<T>(path: string, body: unknown, timeoutMs?: number): Promise<T> {
        const url = this.buildUrl(path);
        const response = await this.fetchWithTimeout(
            url,
            {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', ...this.authHeaders },
                body: JSON.stringify(camelToSnakeKeys(body)),
            },
            timeoutMs
        );
        return this.handleResponse<T>(response);
    }
}

const draftKey='monitor-local-drafts-v1';
const read=()=>JSON.parse(localStorage.getItem(draftKey)||'{"agents":[],"swarms":[],"templates":[]}');
const save=(x:any)=>localStorage.setItem(draftKey,JSON.stringify(x));
const block=()=>{window.alert('This action needs the original backend. No agent was started and no external service was contacted.');throw new ApiError(503,'Backend required')};
const apiClient:any={setToken:()=>{},clearToken:()=>{},
 get:async(path:string)=>{
 const db=read(), parts=path.split('/').filter(Boolean),kind=parts[0];
 if(['agents','swarms','templates'].includes(kind)){
  if(parts.length===1)return {[kind]:db[kind],total:db[kind].length,limit:50,offset:0};
  if(parts.length===2){const item=db[kind].find((x:any)=>x.id===parts[1]);if(item)return item;}
 }
 if(path==='/channels')return {channels:[],total:0};
 if(path==='/team/members')return {members:[],total:0};
 if(path==='/swarm/timeline')return {events:[],totalCount:0,limit:50,offset:0};
 if(path==='/api-keys')return {keys:[],total:0};
 throw new ApiError(503,'Backend unavailable in frontend preview');
 },
 post:async(path:string,body:any)=>{
 const db=read(),kind=path.slice(1);
 if(['agents','swarms','templates'].includes(kind)){
 const item={...body,id:crypto.randomUUID(),status:'stopped',userId:'local-preview',createdAt:new Date().toISOString(),updatedAt:null,persona:body.persona||'',configuration:body.configuration||{},heartbeatEnabled:false,errorCount:0,agents:body.agents||[],agentIds:body.agentIds||[],agentCount:(body.agentIds||[]).length,errorMessage:'Local draft — backend not connected'};
 db[kind].push(item);save(db);return item;
 }return block();},
 patch:async(path:string,body:any)=>{const db=read(),[kind,id]=path.slice(1).split('/');const item=db[kind]?.find((x:any)=>x.id===id);if(!item)return block();Object.assign(item,body);save(db);return item;},
 put:async(path:string,body:any)=>apiClient.patch(path,body),
 delete:async(path:string)=>{const db=read(),[kind,id]=path.slice(1).split('/');if(!db[kind])return block();db[kind]=db[kind].filter((x:any)=>x.id!==id);save(db);},
 deleteWithBody:async()=>block()
};
export default apiClient;
