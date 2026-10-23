"use strict";(globalThis.webpackChunk_ember_auto_import_=globalThis.webpackChunk_ember_auto_import_||[]).push([[47517],{47517(e,t,n){n.d(t,{writeText:()=>T})
var o="text/plain";(function(){(console.warn||console.log).apply(console,arguments)}).bind("[clipboard-polyfill]")
var i,r,a,l,d,u,c,s,v="undefined"==typeof window?void 0:window,p="undefined"==typeof globalThis?void 0:globalThis,m=null!=(a=null==(i=v)?void 0:i.Promise)?a:null==(r=p)?void 0:r.Promise,f="undefined"==typeof navigator?void 0:navigator,b=null==f?void 0:f.clipboard,h=(null==(l=null==b?void 0:b.read)||l.bind(b),null==(d=null==b?void 0:b.readText)||d.bind(b),null==(u=null==b?void 0:b.write)||u.bind(b),null==(c=null==b?void 0:b.writeText)?void 0:c.bind(b)),w=(null==(s=v)||s.ClipboardItem,function(){if(!m)throw new Error("No `Promise` implementation available for `clipboard-polyfill`. Consider using: https://github.com/lgarron/clipboard-polyfill#flat-file-version-with-promise-included")
return m}()),y=v
function g(e,t,n){for(var i in e.success=!0,t){var r=t[i],a=n.clipboardData
a.setData(i,r),i===o&&a.getData(i)!==r&&(e.success=!1)}n.preventDefault()}function C(e){var t={success:!1},n=g.bind(this,t,e)
document.addEventListener("copy",n)
try{document.execCommand("copy")}finally{document.removeEventListener("copy",n)}return t.success}function x(e,t){E(e)
var n=C(t)
return D(),n}function E(e){var t=document.getSelection()
if(t){var n=document.createRange()
n.selectNodeContents(e),t.removeAllRanges(),t.addRange(n)}}function D(){var e=document.getSelection()
e&&e.removeAllRanges()}function T(e){return h?h(e).catch((()=>_(e))):_(e)}function _(e){return t=()=>w.resolve(function(e){if(!function(e){var t=o in e
if("undefined"==typeof ClipboardEvent&&void 0!==(null==y?void 0:y.clipboardData)&&void 0!==(null==y?void 0:y.clipboardData.setData)){if(!t)throw new Error("No `text/plain` value was specified.")
if(function(e){return!!y.clipboardData&&y.clipboardData.setData("Text",e)}(e[o]))return!0
throw new Error("Copying failed, possibly because the user rejected it.")}return(C(e)||navigator.userAgent.indexOf("Edge")>-1||x(document.body,e)||function(e){var t=document.createElement("div")
t.setAttribute("style","-webkit-user-select: text !important"),t.textContent="temporary element",document.body.appendChild(t)
var n=x(t,e)
return document.body.removeChild(t),n}(e)||!!function(e){var t=document.createElement("div")
t.setAttribute("style","-webkit-user-select: text !important")
var n=t
t.attachShadow&&(n=t.attachShadow({mode:"open"}))
var o=document.createElement("span")
o.innerText=e,n.appendChild(o),document.body.appendChild(t),E(o)
var i=document.execCommand("copy")
return D(),document.body.removeChild(t),i}(e[o]))&&!0}(function(e){var t={}
return t[o]=e,t}(e)))throw new Error("writeText() failed")}(e)),new w(((e,n)=>{try{e(t())}catch(e){n(e)}}))
var t}w.resolve(),w.resolve(!1)}}])
