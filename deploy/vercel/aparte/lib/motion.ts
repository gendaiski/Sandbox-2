/**
 * À placer dans <head> : active les états de départ seulement si le
 * navigateur exécute du JavaScript et accepte les animations. Filet de
 * sécurité : sans réveil du composant au bout de 4 s, tout redevient visible.
 */
export const motionBootScript = `(function(){try{var d=document.documentElement;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;d.setAttribute("data-motion","");setTimeout(function(){if(d.getAttribute("data-motion")!=="ready")d.removeAttribute("data-motion")},4000)}catch(e){}})()`
