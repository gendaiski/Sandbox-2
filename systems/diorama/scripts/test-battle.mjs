import assert from 'node:assert/strict';
import {newBattle,takeTurn,enemyIntent,FIGHTERS} from '../reconstruction/battle-engine.js';
import {validateDesign} from '../reconstruction/catalog.js';
for(const player of ['pikachu','charizard'])for(const difficulty of ['easy','normal','hard']){
  let s=newBattle(player,difficulty);while(!s.result){const before={...s},turn=takeTurn(s,s.pp?'attack':'quick');assert.deepEqual(s,before,'immutable battle inputs');s=turn.state;assert.ok(s.hp>=0&&s.enemyHp>=0);assert.ok(s.turn<=60);assert.equal(turn.events.at(-1).state.result,s.result);}
  assert.ok(['win','loss'].includes(s.result));assert.throws(()=>takeTurn(s,'quick'));
}
let s=newBattle();const regular=takeTurn(s,'quick').state,guarded=takeTurn(s,'guard').state;assert.ok(guarded.hp>regular.hp);assert.equal(guarded.enemyHp,160);
assert.throws(()=>takeTurn(s,'heal'));s=takeTurn(s,'quick').state;const healed=takeTurn(s,'heal').state;assert.equal(healed.potions,1);assert.ok(healed.hp<=120);assert.throws(()=>takeTurn({...s,potions:0},'heal'));assert.throws(()=>takeTurn({...s,pp:0},'attack'));assert.throws(()=>takeTurn(s,'inject'));
assert.equal(enemyIntent({...s,turn:2}).strong,true);
const win=takeTurn({...newBattle(),enemyHp:1},'quick');assert.equal(win.events.length,1);assert.equal(win.state.hp,120);assert.equal(win.state.result,'win');
const draw=takeTurn({...newBattle(),turn:59},'guard');assert.equal(draw.state.result,'draw');
assert.throws(()=>newBattle('unknown'));assert.throws(()=>newBattle('pikachu','unknown'));
const valid={scene:'game',title:'My arena',light:'golden',quality:'smooth',background:'#f6eedc',speed:'1'};assert.equal(validateDesign(valid).scene,'game');for(const invalid of [{...valid,scene:'https://x'},{...valid,background:'url(x)'},{...valid,title:''},{...valid,quality:'x'}])assert.throws(()=>validateDesign(invalid));
console.log('PASS battle rules: both fighters / three difficulties, HP, PP, healing, guard, victory, loss, draw, invalid input and design validation.');
