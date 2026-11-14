import {FIGHTERS, newBattle, takeTurn, enemyIntent} from './battle-engine.js';
const $ = id => document.getElementById(id);
export function createBattleController(getScene) {
  let state = null, queue = [], elapsed = 0, busy = false, active = false, log = [];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let tally; try {tally=JSON.parse(localStorage.getItem('diorama.battles')||'{"wins":0,"losses":0}');} catch {tally={wins:0,losses:0};}
  if (!Number.isFinite(tally?.wins)||!Number.isFinite(tally?.losses)) tally={wins:0,losses:0};
  function addLog(text) {log.push(text);const li=document.createElement('li');li.textContent=text;$('battle-log').append(li);$('battle-message').textContent=text;}
  function paint() {
    const player=state?.player||$('fighter').value, enemy=player==='pikachu'?'charizard':'pikachu';
    for (const [side,id,hp] of [['player',player,state?.hp??FIGHTERS[player].hp],['enemy',enemy,state?.enemyHp??FIGHTERS[enemy].hp]]) {
      $(side+'-name').textContent=FIGHTERS[id].name;$(side+'-type').textContent=FIGHTERS[id].type;$(side+'-hp').textContent=hp+' / '+FIGHTERS[id].hp;
      $(side+'-bar').max=FIGHTERS[id].hp;$(side+'-bar').value=hp;
    }
    $('battle-turn').textContent=state?'Turn '+state.turn:'Choose your partner';
    $('attack-name').textContent=FIGHTERS[player].attack;$('quick-name').textContent=FIGHTERS[player].quick;
    $('attack-pp').textContent=(state?.pp??6)+' / 6 PP';$('heal-pp').textContent=(state?.potions??2)+' potions';
    $('intent').textContent=state&&!state.result?'Opponent preparing: '+enemyIntent(state).name:'Local opponent · no account needed';
    for (const b of document.querySelectorAll('[data-move]')) b.disabled=!state||!!state.result||busy||(b.dataset.move==='attack'&&!state.pp)||(b.dataset.move==='heal'&&(!state.potions||state.hp===FIGHTERS[player].hp));
    $('fighter').disabled=$('difficulty').disabled=!!state&&!state.result;
    $('start-battle').textContent=state?'New battle':'Start battle';
    $('battle-score').textContent=tally.wins+' wins · '+tally.losses+' losses on this browser';
    $('battle-result').hidden=!state?.result;
    if(state?.result)$('result-title').textContent=state.result==='win'?'You won!':state.result==='loss'?'A brave battle. Try again.':'A draw after 60 turns.';
  }
  function reset() {state=null;queue=[];busy=false;log=[];$('battle-log').replaceChildren();const s=getScene();if(s?.id==='game'){s.event=null;s.outcome=null;} $('battle-message').textContent='Choose a partner, then start. Strong attacks arrive every third turn: guard to absorb them.';paint();}
  function finish() {busy=false;getScene().event=null;if(state.result){if(state.result==='win')tally.wins++;if(state.result==='loss')tally.losses++;try{localStorage.setItem('diorama.battles',JSON.stringify(tally))}catch{}getScene().outcome=state.result==='draw'?null:{loser:state.result==='win'?state.enemy:state.player};addLog(state.result==='win'?'Victory in '+state.turn+' turns!':state.result==='loss'?'Your partner fainted. Start a new battle to try another strategy.':'The battle ended in a draw.');}paint();}
  function next() {const event=queue.shift();if(!event){finish();return;}state=event.state;getScene().event=event;getScene().age=0;elapsed=0;addLog(event.text);paint();}
  function move(id) {if(!active||busy||!state||state.result)return;try{const turn=takeTurn(state,id);queue=turn.events;busy=true;next();}catch(e){$('battle-message').textContent=e.message;}}
  $('start-battle').onclick=()=>{if(state){reset();return;}reset();state=newBattle($('fighter').value,$('difficulty').value);addLog('Battle begins. You control '+FIGHTERS[state.player].name+'.');paint();};
  $('fighter').onchange=paint;
  for(const b of document.querySelectorAll('[data-move]'))b.onclick=()=>move(b.dataset.move);
  $('battle-rules').onclick=()=>$('rules-dialog').showModal();$('close-rules').onclick=()=>$('rules-dialog').close();
  return {setActive(value){active=value;reset();},tick(dt){if(!active||!busy)return;elapsed+=dt;getScene().age=elapsed;if(elapsed>=(reduced?.12:1.2))next();},get state(){return state},get busy(){return busy},move,paint};
}
