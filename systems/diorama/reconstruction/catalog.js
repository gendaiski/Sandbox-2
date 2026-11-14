export const designs = [
  {id:'pool', title:'The afternoon pool', category:'Everyday scenes', tag:'26 second loop', description:'Sunlit water, a diving sequence and little moments around the pool.', image:'pool'},
  {id:'bank', title:'The bank job', category:'Story scenes', tag:'48 second loop', description:'A quiet street becomes a getaway. Cars, arrivals and a police response.', image:'bank'},
  {id:'arena', title:'Dust Kings', category:'Action & vehicles', tag:'38 second loop', description:'Monster trucks, a stadium crowd and a dirt-ramp jump.', image:'arena'},
  {id:'battle', title:'Creature battle', category:'Battle worlds', tag:'46 second loop', description:'The original reconstructed battle choreography, ready to scrub and explore.', image:'battle'},
  {id:'game', title:'Pokémon Battle', category:'Battle worlds', tag:'Playable · New', description:'Choose Pikachu or Charizard. Attack, guard and heal against a local opponent.', image:'game'}
];
const key = 'diorama.studio.variations.v1';
export const defaultSettings = id => ({scene: id, title: designs.find(d=>d.id===id)?.title || 'My diorama', light:'daylight', quality:'pixel', background:'#ffffff', speed:'1'});
export function validateDesign(value) {
  if (!value || typeof value !== 'object' || !designs.some(d=>d.id===value.scene)) throw Error('Choose a valid Diorama scene.');
  if (typeof value.title !== 'string' || !value.title.trim() || value.title.length > 80) throw Error('A title must contain 1–80 characters.');
  if (!['daylight','golden','moonlight'].includes(value.light) || !['pixel','smooth'].includes(value.quality) || !/^#[a-f0-9]{6}$/i.test(value.background) || !['0.5','1','2'].includes(String(value.speed))) throw Error('This design has unsupported studio settings.');
  return {scene:value.scene,title:value.title.trim(),light:value.light,quality:value.quality,background:value.background,speed:String(value.speed)};
}
export function loadDesigns() {try {const values = JSON.parse(localStorage.getItem(key) || '[]');return values.filter(v=>{try {validateDesign(v);return typeof v.id==='string'}catch{return false}}).slice(0,100);} catch {return []}}
export function saveDesign(settings) {const list=loadDesigns();if(list.length>=100)throw Error('Your library has 100 variations. Remove one before saving another.');const entry={...validateDesign(settings),id:crypto.randomUUID?.()||Date.now().toString(36),created:new Date().toISOString()};localStorage.setItem(key,JSON.stringify([...list,entry]));return entry;}
export function removeDesign(id) {localStorage.setItem(key, JSON.stringify(loadDesigns().filter(v=>v.id!==id)));}
