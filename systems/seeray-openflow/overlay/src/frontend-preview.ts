/** Browser-only transport boundary. No engine calls, host writes, keys or fabricated runs. */
type Bucket = Record<string, unknown>
type Saved = { pipelines: Bucket; generated: Bucket; roles: unknown[]; skills: Bucket; mcp: Bucket; last?: string }
const KEY = "seeray-openflow.browser-drafts.v1"
const read = (): Saved => JSON.parse(localStorage.getItem(KEY) ?? '{"pipelines":{},"generated":{},"roles":[],"skills":{},"mcp":{}}')
const persist = (data: Saved) => localStorage.setItem(KEY, JSON.stringify(data))
const response = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } })
const unavailable = () => response({ error: "Frontend preview: opencode serve is not installed. No engine, host filesystem or external service was contacted.", message: "opencode serve unavailable — frontend preview only" }, 503)
const original = window.fetch.bind(window)
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = new URL(input instanceof Request ? input.url : String(input), location.origin)
  const path = url.pathname
  if (url.origin !== location.origin) return unavailable()
  if (path.startsWith("/api/") || path.startsWith("/global") || path === "/event" || path.startsWith("/mcp")) return unavailable()
  if (!path.startsWith("/flow/api")) return original(input, init)
  const route = path.slice(9)
  const method = init?.method ?? (input instanceof Request ? input.method : "GET")
  const data = read()
  const body = typeof init?.body === "string" ? JSON.parse(init.body) : undefined
  if (route === "/context") return response({project:"Browser local drafts (no host access)",pipelines:"localStorage/pipelines",runs:"Unavailable — no execution engine",generated:"localStorage/generated",skills:"localStorage/skills",pipeline:data.last})
  if (route === "/server") return response({managed:false,running:false,url:"http://127.0.0.1:4096",command:"bun openflow.ts",reason:"Browser frontend preview — no engine or host access"})
  if (route === "/roles") { if(method === "PUT") {data.roles = body;persist(data)};return response(method === "GET" ? data.roles : {saved:true}) }
  if (route === "/runs") return response([])
  if (route === "/env") return response({present:[]})
  if (route === "/cli-keys") return response({path:"Unavailable — no host access",providers:[]})
  if (route === "/zen-models") return response({ids:[]})
  if (route === "/repackage") return response({path:"Unavailable — no engine",applied:[],available:[]})
  if (route === "/dispatch-tool") return response({path:"Unavailable — no engine",present:false,current:false,root:""})
  if (route === "/browse") return response({path:null,parent:null,entries:[]})
  if (route === "/mcp") return response(Object.values(data.mcp))
  if (route === "/skills") return response(Object.entries(data.skills).map(([name,doc])=>({name,description:(doc as {description?: string}).description,updated:Date.now()})))
  if (route === "/pipelines") return response(Object.entries(data.pipelines).map(([name,item])=>({name,id:(item as {id?: string}).id,nodes:(item as {nodes:unknown[]}).nodes.length,updated:Date.now()})))
  const parts = route.split("/").filter(Boolean).map(decodeURIComponent)
  const kind = parts[0], name = parts[1]
  if (kind === "pipelines" && name) {
    if (parts[2] === "agents") {
      if (method !== "POST") return unavailable()
      data.generated[name] = body
      persist(data)
      return response({path:"browser-local generated config (not installed)",merged:false})
    }
    if (method === "GET") return name in data.pipelines ? response(data.pipelines[name]) : response({error:"Pipeline not found"},404)
    if (method === "PUT") {
      const existing = data.pipelines[name] as {id?: string}|undefined
      if(existing && existing.id !== body.id && !url.searchParams.has("overwrite")) return response({error:"A different browser draft already has this name"},409)
      data.pipelines[name] = body;data.last=name;persist(data);return response({path:`browser-local/${name}`})
    }
    if (method === "DELETE") {delete data.pipelines[name];if(data.last===name)delete data.last;persist(data);return response({name,removed:true})}
  }
  if ((kind === "skills" || kind === "mcp") && name) {
    const bucket = data[kind]
    if(method === "GET")return name in bucket?response(bucket[name]):response({error:"Local draft not found"},404)
    if(method === "PUT") {bucket[name]={...body,folder:name,path:`browser-local/${kind}/${name}`};persist(data);return response({name,path:`browser-local/${kind}/${name}`,registered:false})}
    if(method === "DELETE"){delete bucket[name];persist(data);return response({name,removed:true})}
  }
  return unavailable()
}
