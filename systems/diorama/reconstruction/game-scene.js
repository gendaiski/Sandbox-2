import {T,kit,mesh,cylinder,ring} from './common.js';
import {battleScene} from './battle.js';
export function gameScene() {
  const scene = battleScene(), a = scene.actors;
  const paint=kit();
  cylinder(scene.root,paint('#e8dfbc'),1.3,.015,0,.12,0,1.3,48);
  const emblem=mesh(scene.root,new T.CircleGeometry(1.3,48,0,Math.PI),paint('#b85e46'),0,.133,0);emblem.rotation.x=-Math.PI/2;
  ring(scene.root,paint('#473e33'),1.3,.025,0,.14,0);
  cylinder(scene.root,paint('#473e33'),.27,.018,0,.14,0,.27,24);
  cylinder(scene.root,paint('#eee3bc'),.17,.018,0,.16,0,.17,24);
  ring(scene.root,paint('#cab05c'),1.1,.022,-2.4,.125,.4);
  ring(scene.root,paint('#bc7656'),1.65,.022,2.2,.125,-.2);
  function animate(t) {
    scene.animate(10); // Scenery and both rigs, without the film's scripted fight.
    const d = a.dragon, m = a.mouse;
    d.root.visible = m.root.visible = true;
    d.root.scale.setScalar(1);
    d.body.rotation.set(0, 0, 0); m.body.rotation.set(0, 0, 0);
    d.head.rotation.x = Math.sin(t * 1.6) * .045;
    d.wings.forEach((w,i) => w.rotation.z = (i ? 1 : -1) * (.13 + Math.sin(t * 2) * .12));
    m.root.position.y = .08 + Math.abs(Math.sin(t * 2)) * .045;
    m.tail.rotation.z = Math.sin(t * 2.8) * .1;
    d.fire.scale.setScalar(.6 + Math.sin(t * 14) * .05);
    a.lightning.visible = a.flames.visible = a.flash.visible = a.ball.visible = a.recall.visible = false;
    const event = result.event, age = result.age;
    if (event && age < 1.2) {
      const pulse = Math.sin(Math.min(1, age / 1.2) * Math.PI);
      const actor = event.actor === 'pikachu' ? m : d;
      const other = event.actor === 'pikachu' ? d : m;
      if (event.move === 'attack') {
        if (event.actor === 'pikachu') {a.lightning.visible = age > .2 && age < .95; a.lightning.scale.y = .85 + Math.sin(t * 48) * .15;}
        else {a.flames.visible = age > .2 && age < .95; for (const o of a.flames.children) {const k = (age * 2 + o.userData.i / 22) % 1; o.position.set(1.7 - k * 4, 2.4 - k * 1.4 + Math.sin(o.userData.i * 2.3) * k * .35, .3 + Math.cos(o.userData.i) * k * .3); o.rotation.z = Math.PI / 2; o.scale.setScalar(.5 + k * .8);}}
        actor.body.rotation.x = -.17 * pulse; other.body.rotation.z = .25 * pulse;
      } else if (event.move === 'quick') {
        actor.root.position.x += (event.actor === 'pikachu' ? 3.2 : -3.2) * pulse;
        actor.root.position.y += pulse * .45; other.body.rotation.z = pulse * .2;
      } else if (event.move === 'guard') actor.body.rotation.x = .22 * pulse;
      else if (event.move === 'heal') {a.flash.visible = true; a.flash.position.copy(actor.root.position); a.flash.position.y = .9; a.flash.scale.setScalar(.5 + pulse * .6);}
    }
    if (result.outcome) {
      const loser = result.outcome.loser === 'pikachu' ? m : d;
      loser.body.rotation.z = 1.2;
    }
    scene.root.updateMatrixWorld(true);
  }
  const result = {...scene, animate, title: 'Pokémon Battle', reference: null, duration: 3600, event: null, age: 0, outcome: null,
    phase: () => 'Playable battle', inventory: [...scene.inventory, 'turn-based-battle'], camera: {target: [0, 1.3, 0], extent: 26}};
  return result;
}
