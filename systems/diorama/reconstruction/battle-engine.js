// Small, deterministic local battle rules. No network or AI service required.
export const FIGHTERS = {
  pikachu: {name: 'Pikachu', hp: 120, type: 'Electric', attack: 'Thunderbolt', damage: 28, quick: 'Quick Attack', quickDamage: 17},
  charizard: {name: 'Charizard', hp: 160, type: 'Fire / Flying', attack: 'Flamethrower', damage: 31, quick: 'Slash', quickDamage: 23}
};
export function newBattle(player = 'pikachu', difficulty = 'normal') {
  if (!FIGHTERS[player] || !['easy', 'normal', 'hard'].includes(difficulty)) throw Error('Invalid battle setup');
  const enemy = player === 'pikachu' ? 'charizard' : 'pikachu';
  return {player, enemy, difficulty, hp: FIGHTERS[player].hp, enemyHp: FIGHTERS[enemy].hp, pp: 6, potions: 2, turn: 0, result: null};
}
export function enemyIntent(state) {
  const strong = (state.turn + 1) % 3 === 0;
  return {name: strong ? (state.enemy === 'charizard' ? 'Fire Blast' : 'Thunder') : FIGHTERS[state.enemy].quick, strong};
}
export function takeTurn(state, move) {
  if (state.result) throw Error('This battle has ended');
  if (!['attack', 'quick', 'guard', 'heal'].includes(move)) throw Error('Unknown move');
  if (move === 'attack' && !state.pp) throw Error('No attack PP remaining');
  if (move === 'heal' && (!state.potions || state.hp === FIGHTERS[state.player].hp)) throw Error('Potion unavailable');
  const s = {...state}, f = FIGHTERS[s.player], events = [], intent = enemyIntent(s);
  s.turn++;
  let damage = 0, text;
  if (move === 'heal') {const restored = Math.min(36, f.hp - s.hp); s.hp += restored; s.potions--; text = `${f.name} recovered ${restored} HP.`;}
  else if (move === 'guard') text = `${f.name} braces. Incoming damage reduced by 70%.`;
  else {if (move === 'attack') s.pp--; damage = move === 'attack' ? Math.round(f.damage * (s.player === 'pikachu' ? 1.25 : 1)) : f.quickDamage; s.enemyHp = Math.max(0, s.enemyHp - damage); text = `${f.name} used ${move === 'attack' ? f.attack : f.quick}: ${damage} damage.${move === 'attack' && s.player === 'pikachu' ? ' Super effective!' : ''}`;}
  if (!s.enemyHp) s.result = 'win';
  events.push({actor: s.player, move, text, state: {...s}});
  if (!s.result) {
    const scale = {easy: .7, normal: 1, hard: 1.25}[s.difficulty];
    const hit = Math.max(1, Math.round((intent.strong ? 42 : 21) * scale * (move === 'guard' ? .3 : 1)));
    s.hp = Math.max(0, s.hp - hit);
    if (!s.hp) s.result = 'loss'; else if (s.turn >= 60) s.result = 'draw';
    events.push({actor: s.enemy, move: intent.strong ? 'attack' : 'quick', text: `${FIGHTERS[s.enemy].name} used ${intent.name}: ${hit} damage.${move === 'guard' ? ' Guard absorbed the impact.' : ''}`, state: {...s}});
  }
  return {state: s, events};
}
