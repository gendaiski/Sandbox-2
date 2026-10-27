// Write interactive/data/gev.json for the God's Eye View page: the bundled static
// layers (Natural Earth countries, TeleGeography cables and landing points, OSM
// datacenters and dams, bright stars) and the voice agent's own tool definitions
// (server/providers/openai/tools.js) for the actions this page implements.
//   node interactive/data/extract_gev.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const ROOT = new URL('../../', import.meta.url).pathname, GEV = ROOT + 'vendor/gods-eye-view/', D = GEV + 'src/data/local_data/';
const json = (p) => JSON.parse(readFileSync(D + p, 'utf8'));
const lines = (p) => readFileSync(D + p, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
const r2 = (x) => Math.round(x * 100) / 100;
// Countries: delta-encoded integers (meta.decimals = 3); keep every 3rd vertex for the page.
const C = json('natural_earth/countries.json'), scale = 10 ** C.meta.decimals;
const countries = C.features.map((f) => ({ n: f.name, iso: f.iso, p: f.polygons.map((poly) => poly.map((ring) => {
  const pts = []; let x = 0, y = 0; for (let i = 0; i < ring.length; i += 2) { x += ring[i]; y += ring[i + 1]; pts.push([x / scale, y / scale]); }
  return pts.filter((_, i) => i % 3 === 0 || i === pts.length - 1).flatMap(([a, b]) => [r2(a), r2(b)]);
})) }));
const cables = json('telegeography_submarine_cables/cable-geo.json').features.map((f) => ({ n: f.properties.name, c: f.properties.color, l: f.geometry.coordinates.map((ln) => ln.flatMap(([a, b]) => [r2(a), r2(b)])) }));
const landings = json('telegeography_submarine_cables/landing-point-geo.json').features.map((f) => [r2(f.geometry.coordinates[0]), r2(f.geometry.coordinates[1]), f.properties.name]);
const centroid = (g) => { const ring = g.type === 'Polygon' ? g.coordinates[0] : g.type === 'MultiPolygon' ? g.coordinates[0][0] : [g.coordinates]; const s = ring.reduce((a, [x, y]) => [a[0] + x, a[1] + y], [0, 0]); return [r2(s[0] / ring.length), r2(s[1] / ring.length)]; };
const datacenters = lines('datacenters/datacenters.geojsonl').map((f) => [...centroid(f.geometry), f.properties.tags?.name || '', f.properties.tags?.operator || '']);
const dams = lines('dams/dams.geojsonl').map((f) => [...centroid(f.geometry), f.properties.tags?.name || f.properties.name || '']);
const S = JSON.parse(readFileSync(D + 'sky/bright_stars.json', 'utf8'));
const stars = [];  // a flat list, one row of meta.columns (raDeg, decDeg, vmag, bv) per star
for (let i = 0; i < S.stars.length; i += S.meta.columns.length) if (S.stars[i + 2] < 5) stars.push([r2(S.stars[i]), r2(S.stars[i + 1]), r2(S.stars[i + 2])]);
const { GEV_REALTIME_TOOLS: all } = await import(GEV + 'server/providers/openai/tools.js');
const WANT = ['fly_to_location', 'adjust_camera_zoom', 'zoom_to_globe', 'set_layer_visibility', 'set_visual_style', 'get_current_view_state', 'move_camera', 'clear_annotations', 'annotate_map', 'analyst_query'];
const tools = all.filter((t) => WANT.includes(t.name)).map((t) => ({ name: t.name, description: t.description, parameters: t.parameters }));
writeFileSync(ROOT + 'interactive/data/gev.json', JSON.stringify({ countries, cables, landings, datacenters, dams, stars, tools, starsMeta: S.meta?.columns }));
console.log({ countries: countries.length, cables: cables.length, landings: landings.length, datacenters: datacenters.length, dams: dams.length, stars: stars.length, tools: tools.map((t) => t.name) });
