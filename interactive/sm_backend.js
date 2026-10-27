/* A stand-in for Skills Manager's Rust backend, so the app's own React UI (built
   from src/ with MemoryRouter) runs in a page. It answers the Tauri commands in
   src/lib/tauri.ts from memory: tools from tool_adapters.rs, real SKILL.md files,
   presets, a project and per-agent deployments. Nothing touches a disk; work that
   needs the network or a file picker (git installs, skills.sh, backups) returns
   the error the desktop app would show offline. SMDATA is defined before this. */
(function () {
  const VERSION = '1.43.0', now = () => Math.floor(Date.now() / 1000), home = '~';
  window.__SM_ICONS__ = SMDATA.icons;
  const INSTALLED = new Set(['claude_code', 'codex', 'cursor', 'gemini_cli', 'github_copilot', 'opencode', 'windsurf', 'cline', 'kiro', 'goose']);
  const tools = SMDATA.tools.map((t) => ({ key: t.key, display_name: t.display_name, installed: INSTALLED.has(t.key), skills_dir: `${home}/${t.dir}`, enabled: INSTALLED.has(t.key),
    is_custom: false, has_path_override: false, project_relative_skills_dir: t.project_dir || t.dir, has_project_path_override: false, category: t.category === 'lobster' ? 'lobster' : 'coding' }));
  let order = tools.map((t) => t.key);
  const tool = (k) => tools.find((t) => t.key === k);
  const t0 = now() - 86400 * 9;
  const repo = { 'skills-manager': ['https://github.com/xingkongliang/skills-manager', 'skills/'], 'claude-code-best-practice': ['https://github.com/shanraisshan/claude-code-best-practice', '.claude/skills/'] };
  const TAGS = { 'manage-skills': ['skills', 'cli'], 'weather-fetcher': ['demo'], 'weather-svg-creator': ['demo', 'svg'], 'time-skill': ['demo'], 'agent-browser': ['browser'] };
  const skills = SMDATA.skills.map((s, i) => ({
    id: `sk${i + 1}`, name: s.name, description: s.description || null, source_type: 'git', source_ref: repo[s.origin][0], source_ref_resolved: repo[s.origin][0] + '.git',
    source_subpath: repo[s.origin][1] + (s.origin === 'claude-code-best-practice' && /presentation/.test(s.name) ? 'presentation/' : '') + s.dir, source_branch: 'main', source_revision: s.revision,
    remote_revision: null, update_status: 'up_to_date', last_checked_at: now() - 3600, last_check_error: null, central_path: `${home}/.skills-manager/skills/${s.name}`, enabled: true,
    created_at: t0 + i * 3600, updated_at: t0 + i * 3600, status: 'ok', targets: [], preset_ids: [], tags: TAGS[s.name] || (/presentation/.test(s.name) ? ['presentation'] : []),
    _doc: s.content, _files: s.files }));
  const deploy = (s, k) => { if (!s.targets.some((x) => x.tool === k)) s.targets.push({ id: `${s.id}-${k}`, skill_id: s.id, tool: k, target_path: `${tool(k).skills_dir}/${s.name}`, mode: 'symlink', status: 'ok', synced_at: now() }); };
  skills.forEach((s) => deploy(s, 'claude_code'));
  skills.filter((s) => !/presentation/.test(s.name)).forEach((s) => deploy(s, 'codex'));
  deploy(skills[0], 'cursor'); deploy(skills[0], 'gemini_cli');
  const presets = [{ id: 'pr-pres', name: 'Presentations', description: 'Deck structure, styling and framing', icon: null, sort_order: 0, created_at: t0, updated_at: t0 },
    { id: 'pr-demo', name: 'Weather demo', description: 'The command, agent and skill example', icon: null, sort_order: 1, created_at: t0, updated_at: t0 }];
  const presetSkills = { 'pr-pres': skills.filter((s) => /presentation/.test(s.name)).map((s) => s.id), 'pr-demo': skills.filter((s) => /weather|time/.test(s.name)).map((s) => s.id) };
  let active = null;
  const settings = {};
  const projects = [{ id: 'pj-sandbox', name: 'Sandbox-2', path: `${home}/code/Sandbox-2`, workspace_type: 'project', linked_agent_name: null, supports_skill_toggle: true, sort_order: 0, created_at: t0, updated_at: t0 }];
  const projectSkills = { 'pj-sandbox': [
    { name: 'manage-skills', agent: 'claude_code', enabled: true, center: 'sk1', status: 'in_sync' },
    { name: 'weather-fetcher', agent: 'claude_code', enabled: true, center: null, status: 'project_only' },
    { name: 'time-skill', agent: 'codex', enabled: false, center: null, status: 'project_only' }] };
  const listeners = {}; let cbn = 0;

  const withPresets = (s) => ({ ...s, preset_ids: Object.entries(presetSkills).filter(([, ids]) => ids.includes(s.id)).map(([p]) => p), _doc: undefined, _files: undefined });
  const presetOut = (p) => ({ ...p, skill_count: (presetSkills[p.id] || []).length });
  const skill = (id) => { const s = skills.find((x) => x.id === id); if (!s) throw new Error(`Skill not found: ${id}`); return s; };
  const health = (pid) => { const h = { in_sync: 0, project_newer: 0, center_newer: 0, diverged: 0, project_only: 0 }; (projectSkills[pid] || []).forEach((x) => { h[x.status]++; }); return h; };
  const projectOut = (p) => ({ ...p, skill_count: (projectSkills[p.id] || []).length, sync_health: health(p.id) });
  const asProjectSkill = (x, base) => { const s = skills.find((k) => k.name === x.name), t = tool(x.agent);
    return { name: x.name, dir_name: x.name, relative_path: x.name, description: s ? s.description : null, path: `${base(t)}/${x.name}`, files: s ? s._files : ['SKILL.md'], enabled: x.enabled,
      agent: x.agent, agent_display_name: t.display_name, tags: s ? s.tags : [], in_center: !!x.center, sync_status: x.status, center_skill_id: x.center }; };
  const fire = (event, payload) => (listeners[event] || []).forEach((h) => { try { window['_' + h]({ event, payload, id: h }); } catch (e) { console.error(e); } });
  const offline = (what) => { throw `${what} needs the Skills Manager desktop app: this page has no network or file access.`; };

  const H = {
    get_tool_status: () => order.map(tool),
    set_tool_enabled: ({ key, enabled }) => { tool(key).enabled = enabled; },
    set_all_tools_enabled: ({ enabled }) => { tools.forEach((t) => { if (t.installed) t.enabled = enabled; }); },
    get_tool_order_cmd: () => order, set_tool_order_cmd: ({ order: o }) => { order = o.concat(order.filter((k) => !o.includes(k))); },
    get_managed_skills: () => skills.map(withPresets),
    get_skills_for_preset: ({ presetId }) => (presetSkills[presetId] || []).map((id) => withPresets(skill(id))),
    get_skill_document: ({ skillId }) => { const s = skill(skillId); return { skill_id: s.id, filename: 'SKILL.md', content: s._doc, central_path: s.central_path }; },
    get_source_skill_document: ({ skillId }) => { const s = skill(skillId); return { skill_id: s.id, filename: 'SKILL.md', content: s._doc, source_label: s.source_ref.replace('https://github.com/', ''), revision: s.source_revision }; },
    get_skill_source_diff: ({ skillId }) => { const s = skill(skillId); return { skill_id: s.id, source_label: s.source_ref.replace('https://github.com/', ''), revision: s.source_revision, entries: [] }; },
    delete_managed_skill: ({ skillId }) => { skills.splice(skills.indexOf(skill(skillId)), 1); Object.values(presetSkills).forEach((l) => { const i = l.indexOf(skillId); if (i >= 0) l.splice(i, 1); }); },
    delete_managed_skills: ({ skillIds }) => { skillIds.forEach((id) => H.delete_managed_skill({ skillId: id })); return { deleted: skillIds.length, failed: [] }; },
    check_skill_update: ({ skillId }) => { const s = skill(skillId); s.last_checked_at = now(); return withPresets(s); },
    check_all_skill_updates: () => { skills.forEach((s) => { s.last_checked_at = now(); }); },
    update_skill: ({ skillId }) => ({ skill: withPresets(skill(skillId)), content_changed: false, pending_removals: [], removal_approval: null }),
    batch_update_skills: ({ skillIds }) => ({ refreshed: 0, unchanged: skillIds.length, held_back: [], failed: [] }),
    get_all_tags: () => [...new Set(skills.flatMap((s) => s.tags))].sort(),
    set_skill_tags: ({ skillId, tags }) => { skill(skillId).tags = tags; },
    rename_tag: ({ oldName, newName }) => { skills.forEach((s) => { s.tags = s.tags.map((t) => (t === oldName ? newName : t)); }); },
    delete_tag: ({ name }) => { skills.forEach((s) => { s.tags = s.tags.filter((t) => t !== name); }); },
    sync_skill_to_tool: ({ skillId, tool: k }) => deploy(skill(skillId), k),
    unsync_skill_from_tool: ({ skillId, tool: k }) => { const s = skill(skillId); s.targets = s.targets.filter((x) => x.tool !== k); },
    get_skill_tool_toggles: ({ skillId }) => { const s = skill(skillId); return order.map(tool).filter((t) => t.installed).map((t) => ({ tool: t.key, display_name: t.display_name, installed: t.installed, globally_enabled: t.enabled, enabled: s.targets.some((x) => x.tool === t.key) })); },
    set_skill_tool_toggle: ({ skillId, tool: k, enabled }) => (enabled ? H.sync_skill_to_tool({ skillId, tool: k }) : H.unsync_skill_from_tool({ skillId, tool: k })),
    scan_local_skills: () => ({ tools_scanned: tools.filter((t) => t.installed).length, skills_found: 0, groups: [] }),
    import_all_discovered: () => {},
    get_presets: () => presets.slice().sort((a, b) => a.sort_order - b.sort_order).map(presetOut),
    get_active_preset: () => (active ? presetOut(presets.find((p) => p.id === active)) : null),
    create_preset: ({ name, description, icon }) => { const p = { id: 'pr-' + Math.random().toString(36).slice(2, 8), name, description, icon, sort_order: presets.length, created_at: now(), updated_at: now() }; presets.push(p); presetSkills[p.id] = []; return presetOut(p); },
    update_preset: ({ id, name, description, icon }) => Object.assign(presets.find((p) => p.id === id), { name, description, icon, updated_at: now() }) && undefined,
    delete_preset: ({ id }) => { presets.splice(presets.findIndex((p) => p.id === id), 1); delete presetSkills[id]; if (active === id) active = null; },
    switch_preset: ({ id }) => { active = id; },
    apply_preset_to_default: ({ id }) => { (presetSkills[id] || []).forEach((sid) => order.map(tool).filter((t) => t.enabled).forEach((t) => deploy(skill(sid), t.key))); },
    add_skill_to_preset: ({ skillId, presetId }) => { if (!presetSkills[presetId].includes(skillId)) presetSkills[presetId].push(skillId); },
    remove_skill_from_preset: ({ skillId, presetId }) => { presetSkills[presetId] = presetSkills[presetId].filter((x) => x !== skillId); },
    reorder_presets: ({ ids }) => ids.forEach((id, i) => { presets.find((p) => p.id === id).sort_order = i; }),
    get_preset_skill_order: ({ presetId }) => presetSkills[presetId] || [],
    reorder_preset_skills: ({ presetId, skillIds }) => { presetSkills[presetId] = skillIds; },
    get_projects: () => projects.map(projectOut),
    add_project: ({ path }) => { const p = { id: 'pj-' + Math.random().toString(36).slice(2, 8), name: path.split('/').filter(Boolean).pop() || path, path, workspace_type: 'project', linked_agent_name: null, supports_skill_toggle: true, sort_order: projects.length, created_at: now(), updated_at: now() }; projects.push(p); projectSkills[p.id] = []; return projectOut(p); },
    add_linked_workspace: (a) => offline('Linking a folder'),
    remove_project: ({ id }) => { projects.splice(projects.findIndex((p) => p.id === id), 1); },
    reorder_projects: ({ ids }) => ids.forEach((id, i) => { projects.find((p) => p.id === id).sort_order = i; }),
    get_project_agent_targets: () => order.map(tool).filter((t) => t.installed).map((t) => ({ key: t.key, display_name: t.display_name, enabled: t.enabled, installed: true, is_custom: false })),
    get_project_skills: ({ projectId }) => { const p = projects.find((x) => x.id === projectId); return (projectSkills[projectId] || []).map((x) => asProjectSkill(x, (t) => `${p.path}/${t.project_relative_skills_dir}`)); },
    get_project_skill_document: ({ skillRelativePath }) => { const s = skills.find((k) => k.name === skillRelativePath); return { skill_name: skillRelativePath, filename: 'SKILL.md', content: s ? s._doc : `# ${skillRelativePath}\n` }; },
    toggle_project_skill: ({ projectId, skillRelativePath, agent, enabled }) => { const x = projectSkills[projectId].find((k) => k.name === skillRelativePath && k.agent === agent); if (x) x.enabled = enabled; },
    delete_project_skill: ({ projectId, skillRelativePath, agent }) => { projectSkills[projectId] = projectSkills[projectId].filter((k) => !(k.name === skillRelativePath && k.agent === agent)); },
    import_project_skill_to_center: ({ projectId, skillRelativePath, agent }) => { const x = projectSkills[projectId].find((k) => k.name === skillRelativePath && k.agent === agent); const s = skills.find((k) => k.name === skillRelativePath); if (x && s) { x.center = s.id; x.status = 'in_sync'; } },
    export_skill_to_project: ({ skillId, projectId, agents }) => { const s = skill(skillId); (agents || ['claude_code']).forEach((a) => { if (!projectSkills[projectId].some((k) => k.name === s.name && k.agent === a)) projectSkills[projectId].push({ name: s.name, agent: a, enabled: true, center: s.id, status: 'in_sync' }); }); },
    update_project_skill_from_center: () => {}, update_project_skill_to_center: () => {},
    get_global_local_skills: ({ agent }) => skills.filter((s) => s.targets.some((x) => x.tool === agent)).map((s) => asProjectSkill({ name: s.name, agent, enabled: true, center: s.id, status: 'in_sync' }, (t) => t.skills_dir)),
    get_global_local_skill_document: ({ skillRelativePath }) => H.get_project_skill_document({ skillRelativePath }),
    delete_global_local_skill: ({ agent, skillRelativePath }) => { const s = skills.find((k) => k.name === skillRelativePath); if (s) s.targets = s.targets.filter((x) => x.tool !== agent); },
    import_global_local_skill_to_center: () => {}, update_global_local_skill_from_center: () => {},
    slugify_skill_names: ({ names }) => names.map((n) => n.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')),
    get_settings: ({ key }) => (key in settings ? settings[key] : null), set_settings: ({ key, value }) => { settings[key] = value; },
    get_central_repo_path: () => `${home}/.skills-manager`, get_central_repo_path_override: () => null, get_central_repo_pending_path: () => null, get_central_repo_warnings: () => [],
    set_central_repo_path: () => offline('Moving the library'),
    get_diagnostic_info: () => ({ app_version: VERSION, os: 'browser', os_version: navigator.userAgent.split(') ')[0].split('(')[1] || 'web', arch: 'web', central_repo_path: `${home}/.skills-manager`, central_repo_path_overridden: false }),
    check_app_update: () => ({ has_update: false, current_version: VERSION, latest_version: VERSION, release_url: 'https://github.com/xingkongliang/skills-manager/releases' }),
    update_install_blocker: () => 'This is the web model of Skills Manager; install the desktop app from GitHub Releases.',
    get_recent_log_excerpt: () => ({ log_path: `${home}/.skills-manager/logs/skills-manager.log`, excerpt: 'Running in a browser page: no log file.', line_count: 1, has_warnings: false }),
    check_last_panic: () => null, clear_last_panic: () => {}, log_startup_event: () => {},
    git_backup_status: () => ({ is_repo: false, remote_url: null, branch: null, has_changes: false, changed_skill_count: 0, ahead: 0, behind: 0, last_commit: null, last_commit_time: null, current_snapshot_tag: null, restored_from_tag: null, upstream_health: 'no_remote' }),
    git_backup_list_versions: () => [], git_backup_pending_conflicts: () => [], backup_device_name: () => 'web-browser',
    git_backup_size_report: () => ({ total_bytes: skills.reduce((a, s) => a + s._doc.length, 0), oversized: [], skill_limit_bytes: 50 * 2 ** 20, repo_warn_bytes: 500 * 2 ** 20 }),
    fetch_leaderboard: () => offline('The skills.sh marketplace'), search_skillssh: () => offline('The skills.sh marketplace'),
    install_git: () => offline('Installing from Git'), preview_git_install: () => offline('Installing from Git'), install_from_skillssh: () => offline('Installing from skills.sh'),
    install_local: () => offline('Installing from a folder'), batch_import_folder: () => offline('Importing a folder'), cancel_install: () => false,
    'plugin:app|version': () => VERSION, 'plugin:app|name': () => 'Skills Manager',
    'plugin:event|listen': ({ event, handler }) => { (listeners[event] ||= []).push(handler); return handler; },
    'plugin:event|unlisten': ({ event, eventId }) => { listeners[event] = (listeners[event] || []).filter((h) => h !== eventId); },
    'plugin:event|emit': ({ event, payload }) => fire(event, payload),
    'plugin:dialog|open': () => null, 'plugin:dialog|save': () => null, 'plugin:dialog|message': () => null, 'plugin:dialog|ask': () => false, 'plugin:dialog|confirm': () => false,
    'plugin:opener|open_url': ({ url }) => { const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.click(); },
    'plugin:clipboard-manager|write_text': ({ text }) => navigator.clipboard?.writeText(text),
    'plugin:clipboard-manager|read_text': () => '',
    'plugin:updater|check': () => null,
  };
  window.__SM_CALLS__ = [];
  // The page around this frame asks for the command log by message (the frame is sandboxed without same-origin).
  window.addEventListener('message', (e) => { if (e.data && e.data.sm === 'calls?') e.source.postMessage({ sm: 'calls', list: window.__SM_CALLS__ }, '*'); });
  window.__TAURI_INTERNALS__ = {
    metadata: { currentWindow: { label: 'main' }, currentWebview: { windowLabel: 'main', label: 'main' } },
    transformCallback(fn, once) { const id = ++cbn; window['_' + id] = (x) => { if (once) delete window['_' + id]; return fn(x); }; return id; },
    unregisterCallback(id) { delete window['_' + id]; },
    convertFileSrc: (p) => p,
    invoke(cmd, args = {}) {
      window.__SM_CALLS__.push(cmd);
      try {
        const h = H[cmd];
        if (h) return Promise.resolve(h(args || {}));
        if (cmd.startsWith('plugin:window|') || cmd.startsWith('plugin:webview|')) return Promise.resolve(null);
        if (cmd.startsWith('git_backup_') || cmd.startsWith('github_')) return Promise.reject('Backups to Git need the Skills Manager desktop app.');
        console.warn('Skills Manager web model: no handler for', cmd, args);
        return Promise.resolve(null);
      } catch (e) { return Promise.reject(typeof e === 'string' ? e : e.message); }
    },
  };
})();
