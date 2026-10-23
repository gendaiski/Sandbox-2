"use strict";(globalThis.webpackChunk_ember_auto_import_=globalThis.webpackChunk_ember_auto_import_||[]).push([[56463],{56463(e,t,r){r.r(t),r.d(t,{commonmarkLanguage:()=>mr,deleteMarkupBackward:()=>$r,insertNewlineContinueMarkup:()=>Qr,markdown:()=>Xr,markdownKeymap:()=>Tr,markdownLanguage:()=>gr})
var n,a=r(18020),l=r(93309),s=r(6308),o=r(65610),i=r(78150),O=r(60112)
class u{static create(e,t,r,n,a){return new u(e,t,r,n+(n<<8)+e+(t<<4)|0,a,[],[])}constructor(e,t,r,n,a,l,s){this.type=e,this.value=t,this.from=r,this.hash=n,this.end=a,this.children=l,this.positions=s,this.hashProp=[[i.uY.contextHash,n]]}addChild(e,t){e.prop(i.uY.contextHash)!=this.hash&&(e=new i.PH(e.type,e.children,e.positions,e.length,this.hashProp)),this.children.push(e),this.positions.push(t)}toTree(e,t=this.end){let r=this.children.length-1
return r>=0&&(t=Math.max(t,this.positions[r]+this.children[r].length+this.from)),new i.PH(e.types[this.type],this.children,this.positions,t-this.from).balance({makeTree:(e,t,r)=>new i.PH(i.Z6.none,e,t,r,this.hashProp)})}}!function(e){e[e.Document=1]="Document",e[e.CodeBlock=2]="CodeBlock",e[e.FencedCode=3]="FencedCode",e[e.Blockquote=4]="Blockquote",e[e.HorizontalRule=5]="HorizontalRule",e[e.BulletList=6]="BulletList",e[e.OrderedList=7]="OrderedList",e[e.ListItem=8]="ListItem",e[e.ATXHeading1=9]="ATXHeading1",e[e.ATXHeading2=10]="ATXHeading2",e[e.ATXHeading3=11]="ATXHeading3",e[e.ATXHeading4=12]="ATXHeading4",e[e.ATXHeading5=13]="ATXHeading5",e[e.ATXHeading6=14]="ATXHeading6",e[e.SetextHeading1=15]="SetextHeading1",e[e.SetextHeading2=16]="SetextHeading2",e[e.HTMLBlock=17]="HTMLBlock",e[e.LinkReference=18]="LinkReference",e[e.Paragraph=19]="Paragraph",e[e.CommentBlock=20]="CommentBlock",e[e.ProcessingInstructionBlock=21]="ProcessingInstructionBlock",e[e.Escape=22]="Escape",e[e.Entity=23]="Entity",e[e.HardBreak=24]="HardBreak",e[e.Emphasis=25]="Emphasis",e[e.StrongEmphasis=26]="StrongEmphasis",e[e.Link=27]="Link",e[e.Image=28]="Image",e[e.InlineCode=29]="InlineCode",e[e.HTMLTag=30]="HTMLTag",e[e.Comment=31]="Comment",e[e.ProcessingInstruction=32]="ProcessingInstruction",e[e.Autolink=33]="Autolink",e[e.HeaderMark=34]="HeaderMark",e[e.QuoteMark=35]="QuoteMark",e[e.ListMark=36]="ListMark",e[e.LinkMark=37]="LinkMark",e[e.EmphasisMark=38]="EmphasisMark",e[e.CodeMark=39]="CodeMark",e[e.CodeText=40]="CodeText",e[e.CodeInfo=41]="CodeInfo",e[e.LinkTitle=42]="LinkTitle",e[e.LinkLabel=43]="LinkLabel",e[e.URL=44]="URL"}(n||(n={}))
class c{constructor(e,t){this.start=e,this.content=t,this.marks=[],this.parsers=[]}}class d{constructor(){this.text="",this.baseIndent=0,this.basePos=0,this.depth=0,this.markers=[],this.pos=0,this.indent=0,this.next=-1}forward(){this.basePos>this.pos&&this.forwardInner()}forwardInner(){let e=this.skipSpace(this.basePos)
this.indent=this.countIndent(e,this.pos,this.indent),this.pos=e,this.next=e==this.text.length?-1:this.text.charCodeAt(e)}skipSpace(e){return m(this.text,e)}reset(e){for(this.text=e,this.baseIndent=this.basePos=this.pos=this.indent=0,this.forwardInner(),this.depth=1;this.markers.length;)this.markers.pop()}moveBase(e){this.basePos=e,this.baseIndent=this.countIndent(e,this.pos,this.indent)}moveBaseColumn(e){this.baseIndent=e,this.basePos=this.findColumn(e)}addMarker(e){this.markers.push(e)}countIndent(e,t=0,r=0){for(let n=t;n<e;n++)r+=9==this.text.charCodeAt(n)?4-r%4:1
return r}findColumn(e){let t=0
for(let r=0;t<this.text.length&&r<e;t++)r+=9==this.text.charCodeAt(t)?4-r%4:1
return t}scrub(){if(!this.baseIndent)return this.text
let e=""
for(let t=0;t<this.basePos;t++)e+=" "
return e+this.text.slice(this.basePos)}}function p(e,t,r){if(r.pos==r.text.length||e!=t.block&&r.indent>=t.stack[r.depth+1].value+r.baseIndent)return!0
if(r.indent>=r.baseIndent+4)return!1
let a=(e.type==n.OrderedList?Q:y)(r,t,!1)
return a>0&&(e.type!=n.BulletList||k(r,t,!1)<0)&&r.text.charCodeAt(r.pos+a-1)==e.value}const h={[n.Blockquote]:(e,t,r)=>62==r.next&&(r.markers.push(F(n.QuoteMark,t.lineStart+r.pos,t.lineStart+r.pos+1)),r.moveBase(r.pos+(f(r.text.charCodeAt(r.pos+1))?2:1)),e.end=t.lineStart+r.text.length,!0),[n.ListItem]:(e,t,r)=>!(r.indent<r.baseIndent+e.value&&r.next>-1||(r.moveBaseColumn(r.baseIndent+e.value),0)),[n.OrderedList]:p,[n.BulletList]:p,[n.Document]:()=>!0}
function f(e){return 32==e||9==e||10==e||13==e}function m(e,t=0){for(;t<e.length&&f(e.charCodeAt(t));)t++
return t}function g(e,t,r){for(;t>r&&f(e.charCodeAt(t-1));)t--
return t}function S(e){if(96!=e.next&&126!=e.next)return-1
let t=e.pos+1
for(;t<e.text.length&&e.text.charCodeAt(t)==e.next;)t++
if(t<e.pos+3)return-1
if(96==e.next)for(let r=t;r<e.text.length;r++)if(96==e.text.charCodeAt(r))return-1
return t}function b(e){return 62!=e.next?-1:32==e.text.charCodeAt(e.pos+1)?2:1}function k(e,t,r){if(42!=e.next&&45!=e.next&&95!=e.next)return-1
let n=1
for(let a=e.pos+1;a<e.text.length;a++){let t=e.text.charCodeAt(a)
if(t==e.next)n++
else if(!f(t))return-1}return r&&45==e.next&&w(e)>-1&&e.depth==t.stack.length&&t.parser.leafBlockParsers.indexOf(R.SetextHeading)>-1||n<3?-1:1}function x(e,t){for(let r=e.stack.length-1;r>=0;r--)if(e.stack[r].type==t)return!0
return!1}function y(e,t,r){return 45!=e.next&&43!=e.next&&42!=e.next||e.pos!=e.text.length-1&&!f(e.text.charCodeAt(e.pos+1))||!(!r||x(t,n.BulletList)||e.skipSpace(e.pos+2)<e.text.length)?-1:1}function Q(e,t,r){let a=e.pos,l=e.next
for(;l>=48&&l<=57;){if(a++,a==e.text.length)return-1
l=e.text.charCodeAt(a)}return a==e.pos||a>e.pos+9||46!=l&&41!=l||a<e.text.length-1&&!f(e.text.charCodeAt(a+1))||r&&!x(t,n.OrderedList)&&(e.skipSpace(a+1)==e.text.length||a>e.pos+1||49!=e.next)?-1:a+1-e.pos}function P(e){if(35!=e.next)return-1
let t=e.pos+1
for(;t<e.text.length&&35==e.text.charCodeAt(t);)t++
if(t<e.text.length&&32!=e.text.charCodeAt(t))return-1
let r=t-e.pos
return r>6?-1:r}function w(e){if(45!=e.next&&61!=e.next||e.indent>=e.baseIndent+4)return-1
let t=e.pos+1
for(;t<e.text.length&&e.text.charCodeAt(t)==e.next;)t++
let r=t
for(;t<e.text.length&&f(e.text.charCodeAt(t));)t++
return t==e.text.length?r:-1}const $=/^[ \t]*$/,T=/-->/,v=/\?>/,X=[[/^<(?:script|pre|style)(?:\s|>|$)/i,/<\/(?:script|pre|style)>/i],[/^\s*<!--/,T],[/^\s*<\?/,v],[/^\s*<![A-Z]/,/>/],[/^\s*<!\[CDATA\[/,/\]\]>/],[/^\s*<\/?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|\/?>|$)/i,$],[/^\s*(?:<\/[a-z][\w-]*\s*>|<[a-z][\w-]*(\s+[a-z:_][\w-.]*(?:\s*=\s*(?:[^\s"'=<>`]+|'[^']*'|"[^"]*"))?)*\s*>)\s*$/i,$]]
function A(e,t,r){if(60!=e.next)return-1
let n=e.text.slice(e.pos)
for(let a=0,l=X.length-(r?1:0);a<l;a++)if(X[a][0].test(n))return a
return-1}function C(e,t){let r=e.countIndent(t,e.pos,e.indent),n=e.countIndent(e.skipSpace(t),t,r)
return n>=r+5?r+1:n}function _(e,t,r){let a=e.length-1
a>=0&&e[a].to==t&&e[a].type==n.CodeText?e[a].to=r:e.push(F(n.CodeText,t,r))}const V={LinkReference:void 0,IndentedCode(e,t){let r=t.baseIndent+4
if(t.indent<r)return!1
let a=t.findColumn(r),l=e.lineStart+a,s=e.lineStart+t.text.length,o=[],i=[]
for(_(o,l,s);e.nextLine()&&t.depth>=e.stack.length;)if(t.pos==t.text.length){_(i,e.lineStart-1,e.lineStart)
for(let e of t.markers)i.push(e)}else{if(t.indent<r)break
{if(i.length){for(let e of i)e.type==n.CodeText?_(o,e.from,e.to):o.push(e)
i=[]}_(o,e.lineStart-1,e.lineStart)
for(let e of t.markers)o.push(e)
s=e.lineStart+t.text.length
let r=e.lineStart+t.findColumn(t.baseIndent+4)
r<s&&_(o,r,s)}}return i.length&&(i=i.filter((e=>e.type!=n.CodeText)),i.length&&(t.markers=i.concat(t.markers))),e.addNode(e.buffer.writeElements(o,-l).finish(n.CodeBlock,s-l),l),!0},FencedCode(e,t){let r=S(t)
if(r<0)return!1
let a=e.lineStart+t.pos,l=t.next,s=r-t.pos,o=t.skipSpace(r),i=g(t.text,t.text.length,o),O=[F(n.CodeMark,a,a+s)]
o<i&&O.push(F(n.CodeInfo,e.lineStart+o,e.lineStart+i))
for(let u=!0;e.nextLine()&&t.depth>=e.stack.length;u=!1){let r=t.pos
if(t.indent-t.baseIndent<4)for(;r<t.text.length&&t.text.charCodeAt(r)==l;)r++
if(r-t.pos>=s&&t.skipSpace(r)==t.text.length){for(let e of t.markers)O.push(e)
O.push(F(n.CodeMark,e.lineStart+t.pos,e.lineStart+r)),e.nextLine()
break}{u||_(O,e.lineStart-1,e.lineStart)
for(let e of t.markers)O.push(e)
let r=e.lineStart+t.basePos,n=e.lineStart+t.text.length
r<n&&_(O,r,n)}}return e.addNode(e.buffer.writeElements(O,-a).finish(n.FencedCode,e.prevLineEnd()-a),a),!0},Blockquote(e,t){let r=b(t)
return!(r<0)&&(e.startContext(n.Blockquote,t.pos),e.addNode(n.QuoteMark,e.lineStart+t.pos,e.lineStart+t.pos+1),t.moveBase(t.pos+r),null)},HorizontalRule(e,t){if(k(t,e,!1)<0)return!1
let r=e.lineStart+t.pos
return e.nextLine(),e.addNode(n.HorizontalRule,r),!0},BulletList(e,t){let r=y(t,e,!1)
if(r<0)return!1
e.block.type!=n.BulletList&&e.startContext(n.BulletList,t.basePos,t.next)
let a=C(t,t.pos+1)
return e.startContext(n.ListItem,t.basePos,a-t.baseIndent),e.addNode(n.ListMark,e.lineStart+t.pos,e.lineStart+t.pos+r),t.moveBaseColumn(a),null},OrderedList(e,t){let r=Q(t,e,!1)
if(r<0)return!1
e.block.type!=n.OrderedList&&e.startContext(n.OrderedList,t.basePos,t.text.charCodeAt(t.pos+r-1))
let a=C(t,t.pos+r)
return e.startContext(n.ListItem,t.basePos,a-t.baseIndent),e.addNode(n.ListMark,e.lineStart+t.pos,e.lineStart+t.pos+r),t.moveBaseColumn(a),null},ATXHeading(e,t){let r=P(t)
if(r<0)return!1
let a=t.pos,l=e.lineStart+a,s=g(t.text,t.text.length,a),o=s
for(;o>a&&t.text.charCodeAt(o-1)==t.next;)o--
o!=s&&o!=a&&f(t.text.charCodeAt(o-1))||(o=t.text.length)
let i=e.buffer.write(n.HeaderMark,0,r).writeElements(e.parser.parseInline(t.text.slice(a+r+1,o),l+r+1),-l)
o<t.text.length&&i.write(n.HeaderMark,o-a,s-a)
let O=i.finish(n.ATXHeading1-1+r,t.text.length-a)
return e.nextLine(),e.addNode(O,l),!0},HTMLBlock(e,t){let r=A(t,0,!1)
if(r<0)return!1
let a=e.lineStart+t.pos,l=X[r][1],s=[],o=l!=$
for(;!l.test(t.text)&&e.nextLine();){if(t.depth<e.stack.length){o=!1
break}for(let e of t.markers)s.push(e)}o&&e.nextLine()
let i=l==T?n.CommentBlock:l==v?n.ProcessingInstructionBlock:n.HTMLBlock,O=e.prevLineEnd()
return e.addNode(e.buffer.writeElements(s,-a).finish(i,O-a),a),!0},SetextHeading:void 0}
class L{constructor(e){this.stage=0,this.elts=[],this.pos=0,this.start=e.start,this.advance(e.content)}nextLine(e,t,r){if(-1==this.stage)return!1
let n=r.content+"\n"+t.scrub(),a=this.advance(n)
return a>-1&&a<n.length&&this.complete(e,r,a)}finish(e,t){return(2==this.stage||3==this.stage)&&m(t.content,this.pos)==t.content.length&&this.complete(e,t,t.content.length)}complete(e,t,r){return e.addLeafElement(t,F(n.LinkReference,this.start,this.start+r,this.elts)),!0}nextStage(e){return e?(this.pos=e.to-this.start,this.elts.push(e),this.stage++,!0):(!1===e&&(this.stage=-1),!1)}advance(e){for(;;){if(-1==this.stage)return-1
if(0==this.stage){if(!this.nextStage(ie(e,this.pos,this.start,!0)))return-1
if(58!=e.charCodeAt(this.pos))return this.stage=-1
this.elts.push(F(n.LinkMark,this.pos+this.start,this.pos+this.start+1)),this.pos++}else{if(1!=this.stage){if(2==this.stage){let t=m(e,this.pos),r=0
if(t>this.pos){let n=oe(e,t,this.start)
if(n){let t=E(e,n.to-this.start)
t>0&&(this.nextStage(n),r=t)}}return r||(r=E(e,this.pos)),r>0&&r<e.length?r:-1}return E(e,this.pos)}if(!this.nextStage(se(e,m(e,this.pos),this.start)))return-1}}}}function E(e,t){for(;t<e.length;t++){let r=e.charCodeAt(t)
if(10==r)break
if(!f(r))return-1}return t}class q{nextLine(e,t,r){let a=t.depth<e.stack.length?-1:w(t),l=t.next
if(a<0)return!1
let s=F(n.HeaderMark,e.lineStart+t.pos,e.lineStart+a)
return e.nextLine(),e.addLeafElement(r,F(61==l?n.SetextHeading1:n.SetextHeading2,r.start,e.prevLineEnd(),[...e.parser.parseInline(r.content,r.start),s])),!0}finish(){return!1}}const R={LinkReference:(e,t)=>91==t.content.charCodeAt(0)?new L(t):null,SetextHeading:()=>new q},Y=[(e,t)=>P(t)>=0,(e,t)=>S(t)>=0,(e,t)=>b(t)>=0,(e,t)=>y(t,e,!0)>=0,(e,t)=>Q(t,e,!0)>=0,(e,t)=>k(t,e,!0)>=0,(e,t)=>A(t,0,!0)>=0],z={text:"",end:0}
class B{constructor(e,t,r,a){this.parser=e,this.input=t,this.ranges=a,this.line=new d,this.atEnd=!1,this.reusePlaceholders=new Map,this.stoppedAt=null,this.rangeI=0,this.to=a[a.length-1].to,this.lineStart=this.absoluteLineStart=this.absoluteLineEnd=a[0].from,this.block=u.create(n.Document,0,this.lineStart,0,0),this.stack=[this.block],this.fragments=r.length?new de(r,t):null,this.readLine()}get parsedPos(){return this.absoluteLineStart}advance(){if(null!=this.stoppedAt&&this.absoluteLineStart>this.stoppedAt)return this.finish()
let{line:e}=this
for(;;){for(let t=0;;){let r=e.depth<this.stack.length?this.stack[this.stack.length-1]:null
for(;t<e.markers.length&&(!r||e.markers[t].from<r.end);){let r=e.markers[t++]
this.addNode(r.type,r.from,r.to)}if(!r)break
this.finishContext()}if(e.pos<e.text.length)break
if(!this.nextLine())return this.finish()}if(this.fragments&&this.reuseFragment(e.basePos))return null
e:for(;;){for(let t of this.parser.blockParsers)if(t){let r=t(this,e)
if(0!=r){if(1==r)return null
e.forward()
continue e}}break}let t=new c(this.lineStart+e.pos,e.text.slice(e.pos))
for(let r of this.parser.leafBlockParsers)if(r){let e=r(this,t)
e&&t.parsers.push(e)}e:for(;this.nextLine()&&e.pos!=e.text.length;){if(e.indent<e.baseIndent+4)for(let r of this.parser.endLeafBlock)if(r(this,e,t))break e
for(let r of t.parsers)if(r.nextLine(this,e,t))return null
t.content+="\n"+e.scrub()
for(let r of e.markers)t.marks.push(r)}return this.finishLeaf(t),null}stopAt(e){if(null!=this.stoppedAt&&this.stoppedAt<e)throw new RangeError("Can't move stoppedAt forward")
this.stoppedAt=e}reuseFragment(e){if(!this.fragments.moveTo(this.absoluteLineStart+e,this.absoluteLineStart)||!this.fragments.matches(this.block.hash))return!1
let t=this.fragments.takeNodes(this)
return!!t&&(this.absoluteLineStart+=t,this.lineStart=pe(this.absoluteLineStart,this.ranges),this.moveRangeI(),this.absoluteLineStart<this.to?(this.lineStart++,this.absoluteLineStart++,this.readLine()):(this.atEnd=!0,this.readLine()),!0)}get depth(){return this.stack.length}parentType(e=this.depth-1){return this.parser.nodeSet.types[this.stack[e].type]}nextLine(){return this.lineStart+=this.line.text.length,this.absoluteLineEnd>=this.to?(this.absoluteLineStart=this.absoluteLineEnd,this.atEnd=!0,this.readLine(),!1):(this.lineStart++,this.absoluteLineStart=this.absoluteLineEnd+1,this.moveRangeI(),this.readLine(),!0)}peekLine(){return this.scanLine(this.absoluteLineEnd+1).text}moveRangeI(){for(;this.rangeI<this.ranges.length-1&&this.absoluteLineStart>=this.ranges[this.rangeI].to;)this.rangeI++,this.absoluteLineStart=Math.max(this.absoluteLineStart,this.ranges[this.rangeI].from)}scanLine(e){let t=z
if(t.end=e,e>=this.to)t.text=""
else if(t.text=this.lineChunkAt(e),t.end+=t.text.length,this.ranges.length>1){let e=this.absoluteLineStart,r=this.rangeI
for(;this.ranges[r].to<t.end;){r++
let n=this.ranges[r].from,a=this.lineChunkAt(n)
t.end=n+a.length,t.text=t.text.slice(0,this.ranges[r-1].to-e)+a,e=t.end-t.text.length}}return t}readLine(){let{line:e}=this,{text:t,end:r}=this.scanLine(this.absoluteLineStart)
for(this.absoluteLineEnd=r,e.reset(t);e.depth<this.stack.length;e.depth++){let t=this.stack[e.depth],r=this.parser.skipContextMarkup[t.type]
if(!r)throw new Error("Unhandled block context "+n[t.type])
if(!r(t,this,e))break
e.forward()}}lineChunkAt(e){let t,r=this.input.chunk(e)
if(this.input.lineChunks)t="\n"==r?"":r
else{let e=r.indexOf("\n")
t=e<0?r:r.slice(0,e)}return e+t.length>this.to?t.slice(0,this.to-e):t}prevLineEnd(){return this.atEnd?this.lineStart:this.lineStart-1}startContext(e,t,r=0){this.block=u.create(e,r,this.lineStart+t,this.block.hash,this.lineStart+this.line.text.length),this.stack.push(this.block)}startComposite(e,t,r=0){this.startContext(this.parser.getNodeType(e),t,r)}addNode(e,t,r){"number"==typeof e&&(e=new i.PH(this.parser.nodeSet.types[e],G,G,(null!=r?r:this.prevLineEnd())-t)),this.block.addChild(e,t-this.block.from)}addElement(e){this.block.addChild(e.toTree(this.parser.nodeSet),e.from-this.block.from)}addLeafElement(e,t){this.addNode(this.buffer.writeElements(ue(t.children,e.marks),-t.from).finish(t.type,t.to-t.from),t.from)}finishContext(){let e=this.stack.pop(),t=this.stack[this.stack.length-1]
t.addChild(e.toTree(this.parser.nodeSet),e.from-t.from),this.block=t}finish(){for(;this.stack.length>1;)this.finishContext()
return this.addGaps(this.block.toTree(this.parser.nodeSet,this.lineStart))}addGaps(e){return this.ranges.length>1?Z(this.ranges,0,e.topNode,this.ranges[0].from,this.reusePlaceholders):e}finishLeaf(e){for(let r of e.parsers)if(r.finish(this,e))return
let t=ue(this.parser.parseInline(e.content,e.start),e.marks)
this.addNode(this.buffer.writeElements(t,-e.start).finish(n.Paragraph,e.content.length),e.start)}elt(e,t,r,n){return"string"==typeof e?F(this.parser.getNodeType(e),t,r,n):new j(e,t)}get buffer(){return new D(this.parser.nodeSet)}}function Z(e,t,r,n,a){let l=e[t].to,s=[],o=[],O=r.from+n
function u(r,a){for(;a?r>=l:r>l;){let a=e[t+1].from-l
n+=a,r+=a,t++,l=e[t].to}}for(let i=r.firstChild;i;i=i.nextSibling){u(i.from+n,!0)
let r,c=i.from+n,d=a.get(i.tree)
d?r=d:i.to+n>l?(r=Z(e,t,i,n,a),u(i.to+n,!1)):r=i.toTree(),s.push(r),o.push(c-O)}return u(r.to+n,!1),new i.PH(r.type,s,o,r.to+n-O,r.tree?r.tree.propValues:void 0)}class I extends i.iX{constructor(e,t,r,n,a,l,s,o,i){super(),this.nodeSet=e,this.blockParsers=t,this.leafBlockParsers=r,this.blockNames=n,this.endLeafBlock=a,this.skipContextMarkup=l,this.inlineParsers=s,this.inlineNames=o,this.wrappers=i,this.nodeTypes=Object.create(null)
for(let O of e.types)this.nodeTypes[O.name]=O.id}createParse(e,t,r){let n=new B(this,e,t,r)
for(let a of this.wrappers)n=a(n,e,t,r)
return n}configure(e){let t=M(e)
if(!t)return this
let{nodeSet:r,skipContextMarkup:a}=this,l=this.blockParsers.slice(),s=this.leafBlockParsers.slice(),o=this.blockNames.slice(),u=this.inlineParsers.slice(),c=this.inlineNames.slice(),d=this.endLeafBlock.slice(),p=this.wrappers
if(W(t.defineNodes)){a=Object.assign({},a)
let e,l=r.types.slice()
for(let r of t.defineNodes){let{name:t,block:s,composite:o,style:u}="string"==typeof r?{name:r}:r
if(l.some((e=>e.name==t)))continue
o&&(a[l.length]=(e,t,r)=>o(t,r,e.value))
let c=l.length,d=o?["Block","BlockContext"]:s?c>=n.ATXHeading1&&c<=n.SetextHeading2?["Block","LeafBlock","Heading"]:["Block","LeafBlock"]:void 0
l.push(i.Z6.define({id:c,name:t,props:d&&[[i.uY.group,d]]})),u&&(e||(e={}),Array.isArray(u)||u instanceof O.vw?e[t]=u:Object.assign(e,u))}r=new i.fI(l),e&&(r=r.extend((0,O.pn)(e)))}if(W(t.props)&&(r=r.extend(...t.props)),W(t.remove))for(let n of t.remove){let e=this.blockNames.indexOf(n),t=this.inlineNames.indexOf(n)
e>-1&&(l[e]=s[e]=void 0),t>-1&&(u[t]=void 0)}if(W(t.parseBlock))for(let n of t.parseBlock){let e=o.indexOf(n.name)
if(e>-1)l[e]=n.parse,s[e]=n.leaf
else{let e=n.before?U(o,n.before):n.after?U(o,n.after)+1:o.length-1
l.splice(e,0,n.parse),s.splice(e,0,n.leaf),o.splice(e,0,n.name)}n.endLeaf&&d.push(n.endLeaf)}if(W(t.parseInline))for(let n of t.parseInline){let e=c.indexOf(n.name)
if(e>-1)u[e]=n.parse
else{let e=n.before?U(c,n.before):n.after?U(c,n.after)+1:c.length-1
u.splice(e,0,n.parse),c.splice(e,0,n.name)}}return t.wrap&&(p=p.concat(t.wrap)),new I(r,l,s,o,d,a,u,c,p)}getNodeType(e){let t=this.nodeTypes[e]
if(null==t)throw new RangeError(`Unknown node type '${e}'`)
return t}parseInline(e,t){let r=new Oe(this,e,t)
e:for(let n=t;n<r.end;){let e=r.char(n)
for(let t of this.inlineParsers)if(t){let a=t(r,e,n)
if(a>=0){n=a
continue e}}n++}return r.resolveMarkers(0)}}function W(e){return null!=e&&e.length>0}function M(e){if(!Array.isArray(e))return e
if(0==e.length)return null
let t=M(e[0])
if(1==e.length)return t
let r=M(e.slice(1))
if(!r||!t)return t||r
let n=(e,t)=>(e||G).concat(t||G),a=t.wrap,l=r.wrap
return{props:n(t.props,r.props),defineNodes:n(t.defineNodes,r.defineNodes),parseBlock:n(t.parseBlock,r.parseBlock),parseInline:n(t.parseInline,r.parseInline),remove:n(t.remove,r.remove),wrap:a?l?(e,t,r,n)=>a(l(e,t,r,n),t,r,n):a:l}}function U(e,t){let r=e.indexOf(t)
if(r<0)throw new RangeError(`Position specified relative to unknown parser ${t}`)
return r}let N=[i.Z6.none]
for(let Vr,Lr=1;Vr=n[Lr];Lr++)N[Lr]=i.Z6.define({id:Lr,name:Vr,props:Lr>=n.Escape?[]:[[i.uY.group,Lr in h?["Block","BlockContext"]:["Block","LeafBlock"]]],top:"Document"==Vr})
const G=[]
class D{constructor(e){this.nodeSet=e,this.content=[],this.nodes=[]}write(e,t,r,n=0){return this.content.push(e,t,r,4+4*n),this}writeElements(e,t=0){for(let r of e)r.writeTo(this,t)
return this}finish(e,t){return i.PH.build({buffer:this.content,nodeSet:this.nodeSet,reused:this.nodes,topID:e,length:t})}}class H{constructor(e,t,r,n=G){this.type=e,this.from=t,this.to=r,this.children=n}writeTo(e,t){let r=e.content.length
e.writeElements(this.children,t),e.content.push(this.type,this.from+t,this.to+t,e.content.length+4-r)}toTree(e){return new D(e).writeElements(this.children,-this.from).finish(this.type,this.to-this.from)}}class j{constructor(e,t){this.tree=e,this.from=t}get to(){return this.from+this.tree.length}get type(){return this.tree.type.id}get children(){return G}writeTo(e,t){e.nodes.push(this.tree),e.content.push(e.nodes.length-1,this.from+t,this.to+t,-1)}toTree(){return this.tree}}function F(e,t,r,n){return new H(e,t,r,n)}const K={resolve:"Emphasis",mark:"EmphasisMark"},J={resolve:"Emphasis",mark:"EmphasisMark"},ee={},te={}
class re{constructor(e,t,r,n){this.type=e,this.from=t,this.to=r,this.side=n}}let ne=/[!"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~\xA1\u2010-\u2027]/
try{ne=new RegExp("[\\p{S}|\\p{P}]","u")}catch(e){}const ae={Escape(e,t,r){if(92!=t||r==e.end-1)return-1
let a=e.char(r+1)
for(let l=0;l<32;l++)if("!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~".charCodeAt(l)==a)return e.append(F(n.Escape,r,r+2))
return-1},Entity(e,t,r){if(38!=t)return-1
let a=/^(?:#\d+|#x[a-f\d]+|\w+);/i.exec(e.slice(r+1,r+31))
return a?e.append(F(n.Entity,r,r+1+a[0].length)):-1},InlineCode(e,t,r){if(96!=t||r&&96==e.char(r-1))return-1
let a=r+1
for(;a<e.end&&96==e.char(a);)a++
let l=a-r,s=0
for(;a<e.end;a++)if(96==e.char(a)){if(s++,s==l&&96!=e.char(a+1))return e.append(F(n.InlineCode,r,a+1,[F(n.CodeMark,r,r+l),F(n.CodeMark,a+1-l,a+1)]))}else s=0
return-1},HTMLTag(e,t,r){if(60!=t||r==e.end-1)return-1
let a=e.slice(r+1,e.end),l=/^(?:[a-z][-\w+.]+:[^\s>]+|[a-z\d.!#$%&'*+/=?^_`{|}~-]+@[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)*)>/i.exec(a)
if(l)return e.append(F(n.Autolink,r,r+1+l[0].length,[F(n.LinkMark,r,r+1),F(n.URL,r+1,r+l[0].length),F(n.LinkMark,r+l[0].length,r+1+l[0].length)]))
let s=/^!--[^>](?:-[^-]|[^-])*?-->/i.exec(a)
if(s)return e.append(F(n.Comment,r,r+1+s[0].length))
let o=/^\?[^]*?\?>/.exec(a)
if(o)return e.append(F(n.ProcessingInstruction,r,r+1+o[0].length))
let i=/^(?:![A-Z][^]*?>|!\[CDATA\[[^]*?\]\]>|\/\s*[a-zA-Z][\w-]*\s*>|\s*[a-zA-Z][\w-]*(\s+[a-zA-Z:_][\w-.:]*(?:\s*=\s*(?:[^\s"'=<>`]+|'[^']*'|"[^"]*"))?)*\s*(\/\s*)?>)/.exec(a)
return i?e.append(F(n.HTMLTag,r,r+1+i[0].length)):-1},Emphasis(e,t,r){if(95!=t&&42!=t)return-1
let n=r+1
for(;e.char(n)==t;)n++
let a=e.slice(r-1,r),l=e.slice(n,n+1),s=ne.test(a),o=ne.test(l),i=/\s|^$/.test(a),O=/\s|^$/.test(l),u=!O&&(!o||i||s),c=!i&&(!s||O||o),d=u&&(42==t||!c||s),p=c&&(42==t||!u||o)
return e.append(new re(95==t?K:J,r,n,(d?1:0)|(p?2:0)))},HardBreak(e,t,r){if(92==t&&10==e.char(r+1))return e.append(F(n.HardBreak,r,r+2))
if(32==t){let t=r+1
for(;32==e.char(t);)t++
if(10==e.char(t)&&t>=r+2)return e.append(F(n.HardBreak,r,t+1))}return-1},Link:(e,t,r)=>91==t?e.append(new re(ee,r,r+1,1)):-1,Image:(e,t,r)=>33==t&&91==e.char(r+1)?e.append(new re(te,r,r+2,1)):-1,LinkEnd(e,t,r){if(93!=t)return-1
for(let a=e.parts.length-1;a>=0;a--){let t=e.parts[a]
if(t instanceof re&&(t.type==ee||t.type==te)){if(!t.side||e.skipSpace(t.to)==r&&!/[(\[]/.test(e.slice(r+1,r+2)))return e.parts[a]=null,-1
let l=e.takeContent(a),s=e.parts[a]=le(e,l,t.type==ee?n.Link:n.Image,t.from,r+1)
if(t.type==ee)for(let t=0;t<a;t++){let r=e.parts[t]
r instanceof re&&r.type==ee&&(r.side=0)}return s.to}}return-1}}
function le(e,t,r,a,l){let{text:s}=e,o=e.char(l),i=l
if(t.unshift(F(n.LinkMark,a,a+(r==n.Image?2:1))),t.push(F(n.LinkMark,l-1,l)),40==o){let r,a=e.skipSpace(l+1),o=se(s,a-e.offset,e.offset)
o&&(a=e.skipSpace(o.to),a!=o.to&&(r=oe(s,a-e.offset,e.offset),r&&(a=e.skipSpace(r.to)))),41==e.char(a)&&(t.push(F(n.LinkMark,l,l+1)),i=a+1,o&&t.push(o),r&&t.push(r),t.push(F(n.LinkMark,a,i)))}else if(91==o){let r=ie(s,l-e.offset,e.offset,!1)
r&&(t.push(r),i=r.to)}return F(r,a,i,t)}function se(e,t,r){if(60==e.charCodeAt(t)){for(let a=t+1;a<e.length;a++){let l=e.charCodeAt(a)
if(62==l)return F(n.URL,t+r,a+1+r)
if(60==l||10==l)return!1}return null}{let a=0,l=t
for(let t=!1;l<e.length;l++){let r=e.charCodeAt(l)
if(f(r))break
if(t)t=!1
else if(40==r)a++
else if(41==r){if(!a)break
a--}else 92==r&&(t=!0)}return l>t?F(n.URL,t+r,l+r):l==e.length&&null}}function oe(e,t,r){let a=e.charCodeAt(t)
if(39!=a&&34!=a&&40!=a)return!1
let l=40==a?41:a
for(let s=t+1,o=!1;s<e.length;s++){let a=e.charCodeAt(s)
if(o)o=!1
else{if(a==l)return F(n.LinkTitle,t+r,s+1+r)
92==a&&(o=!0)}}return null}function ie(e,t,r,a){for(let l=!1,s=t+1,o=Math.min(e.length,s+999);s<o;s++){let o=e.charCodeAt(s)
if(l)l=!1
else{if(93==o)return!a&&F(n.LinkLabel,t+r,s+1+r)
if(a&&!f(o)&&(a=!1),91==o)return!1
92==o&&(l=!0)}}return null}class Oe{constructor(e,t,r){this.parser=e,this.text=t,this.offset=r,this.parts=[]}char(e){return e>=this.end?-1:this.text.charCodeAt(e-this.offset)}get end(){return this.offset+this.text.length}slice(e,t){return this.text.slice(e-this.offset,t-this.offset)}append(e){return this.parts.push(e),e.to}addDelimiter(e,t,r,n,a){return this.append(new re(e,t,r,(n?1:0)|(a?2:0)))}get hasOpenLink(){for(let e=this.parts.length-1;e>=0;e--){let t=this.parts[e]
if(t instanceof re&&(t.type==ee||t.type==te))return!0}return!1}addElement(e){return this.append(e)}resolveMarkers(e){for(let r=e;r<this.parts.length;r++){let t=this.parts[r]
if(!(t instanceof re&&t.type.resolve&&2&t.side))continue
let n,a=t.type==K||t.type==J,l=t.to-t.from,s=r-1
for(;s>=e;s--){let e=this.parts[s]
if(e instanceof re&&1&e.side&&e.type==t.type&&!(a&&(1&t.side||2&e.side)&&(e.to-e.from+l)%3==0&&((e.to-e.from)%3||l%3))){n=e
break}}if(!n)continue
let o=t.type.resolve,i=[],O=n.from,u=t.to
if(a){let e=Math.min(2,n.to-n.from,l)
O=n.to-e,u=t.from+e,o=1==e?"Emphasis":"StrongEmphasis"}n.type.mark&&i.push(this.elt(n.type.mark,O,n.to))
for(let e=s+1;e<r;e++)this.parts[e]instanceof H&&i.push(this.parts[e]),this.parts[e]=null
t.type.mark&&i.push(this.elt(t.type.mark,t.from,u))
let c=this.elt(o,O,u,i)
this.parts[s]=a&&n.from!=O?new re(n.type,n.from,O,n.side):null,(this.parts[r]=a&&t.to!=u?new re(t.type,u,t.to,t.side):null)?this.parts.splice(r,0,c):this.parts[r]=c}let t=[]
for(let r=e;r<this.parts.length;r++){let e=this.parts[r]
e instanceof H&&t.push(e)}return t}findOpeningDelimiter(e){for(let t=this.parts.length-1;t>=0;t--){let r=this.parts[t]
if(r instanceof re&&r.type==e)return t}return null}takeContent(e){let t=this.resolveMarkers(e)
return this.parts.length=e,t}skipSpace(e){return m(this.text,e-this.offset)+this.offset}elt(e,t,r,n){return"string"==typeof e?F(this.parser.getNodeType(e),t,r,n):new j(e,t)}}function ue(e,t){if(!t.length)return e
if(!e.length)return t
let r=e.slice(),n=0
for(let a of t){for(;n<r.length&&r[n].to<a.to;)n++
if(n<r.length&&r[n].from<a.from){let e=r[n]
e instanceof H&&(r[n]=new H(e.type,e.from,e.to,ue(e.children,[a])))}else r.splice(n++,0,a)}return r}const ce=[n.CodeBlock,n.ListItem,n.OrderedList,n.BulletList]
class de{constructor(e,t){this.fragments=e,this.input=t,this.i=0,this.fragment=null,this.fragmentEnd=-1,this.cursor=null,e.length&&(this.fragment=e[this.i++])}nextFragment(){this.fragment=this.i<this.fragments.length?this.fragments[this.i++]:null,this.cursor=null,this.fragmentEnd=-1}moveTo(e,t){for(;this.fragment&&this.fragment.to<=e;)this.nextFragment()
if(!this.fragment||this.fragment.from>(e?e-1:0))return!1
if(this.fragmentEnd<0){let e=this.fragment.to
for(;e>0&&"\n"!=this.input.read(e-1,e);)e--
this.fragmentEnd=e?e-1:0}let r=this.cursor
r||(r=this.cursor=this.fragment.tree.cursor(),r.firstChild())
let n=e+this.fragment.offset
for(;r.to<=n;)if(!r.parent())return!1
for(;;){if(r.from>=n)return this.fragment.from<=t
if(!r.childAfter(n))return!1}}matches(e){let t=this.cursor.tree
return t&&t.prop(i.uY.contextHash)==e}takeNodes(e){let t=this.cursor,r=this.fragment.offset,a=this.fragmentEnd-(this.fragment.openEnd?1:0),l=e.absoluteLineStart,s=l,o=e.block.children.length,O=s,u=o
for(;;){if(t.to-r>a){if(t.type.isAnonymous&&t.firstChild())continue
break}let l=pe(t.from-r,e.ranges)
if(t.to-r<=e.ranges[e.rangeI].to)e.addNode(t.tree,l)
else{let r=new i.PH(e.parser.nodeSet.types[n.Paragraph],[],[],0,e.block.hashProp)
e.reusePlaceholders.set(r,t.tree),e.addNode(r,l)}if(t.type.is("Block")&&(ce.indexOf(t.type.id)<0?(s=t.to-r,o=e.block.children.length):(s=O,o=u,O=t.to-r,u=e.block.children.length)),!t.nextSibling())break}for(;e.block.children.length>o;)e.block.children.pop(),e.block.positions.pop()
return s-l}}function pe(e,t){let r=e
for(let n=1;n<t.length;n++){let a=t[n-1].to,l=t[n].from
a<e&&(r-=l-a)}return r}const he=(0,O.pn)({"Blockquote/...":O._A.quote,HorizontalRule:O._A.contentSeparator,"ATXHeading1/... SetextHeading1/...":O._A.heading1,"ATXHeading2/... SetextHeading2/...":O._A.heading2,"ATXHeading3/...":O._A.heading3,"ATXHeading4/...":O._A.heading4,"ATXHeading5/...":O._A.heading5,"ATXHeading6/...":O._A.heading6,"Comment CommentBlock":O._A.comment,Escape:O._A.escape,Entity:O._A.character,"Emphasis/...":O._A.emphasis,"StrongEmphasis/...":O._A.strong,"Link/... Image/...":O._A.link,"OrderedList/... BulletList/...":O._A.list,"BlockQuote/...":O._A.quote,"InlineCode CodeText":O._A.monospace,"URL Autolink":O._A.url,"HeaderMark HardBreak QuoteMark ListMark LinkMark EmphasisMark CodeMark":O._A.processingInstruction,"CodeInfo LinkLabel":O._A.labelName,LinkTitle:O._A.string,Paragraph:O._A.content}),fe=new I(new i.fI(N).extend(he),Object.keys(V).map((e=>V[e])),Object.keys(V).map((e=>R[e])),Object.keys(V),Y,h,Object.keys(ae).map((e=>ae[e])),Object.keys(ae),[])
function me(e,t,r){let n=[]
for(let a=e.firstChild,l=t;;a=a.nextSibling){let e=a?a.from:r
if(e>l&&n.push({from:l,to:e}),!a)break
l=a.to}return n}const ge={resolve:"Strikethrough",mark:"StrikethroughMark"},Se={defineNodes:[{name:"Strikethrough",style:{"Strikethrough/...":O._A.strikethrough}},{name:"StrikethroughMark",style:O._A.processingInstruction}],parseInline:[{name:"Strikethrough",parse(e,t,r){if(126!=t||126!=e.char(r+1)||126==e.char(r+2))return-1
let n=e.slice(r-1,r),a=e.slice(r+2,r+3),l=/\s|^$/.test(n),s=/\s|^$/.test(a),o=ne.test(n),i=ne.test(a)
return e.addDelimiter(ge,r,r+2,!s&&(!i||l||o),!l&&(!o||s||i))},after:"Emphasis"}]}
function be(e,t,r=0,n,a=0){let l=0,s=!0,o=-1,i=-1,O=!1,u=()=>{n.push(e.elt("TableCell",a+o,a+i,e.parser.parseInline(t.slice(o,i),a+o)))}
for(let c=r;c<t.length;c++){let r=t.charCodeAt(c)
124!=r||O?(O||32!=r&&9!=r)&&(o<0&&(o=c),i=c+1):((!s||o>-1)&&l++,s=!1,n&&(o>-1&&u(),n.push(e.elt("TableDelimiter",c+a,c+a+1))),o=i=-1),O=!O&&92==r}return o>-1&&(l++,n&&u()),l}function ke(e,t){for(let r=t;r<e.length;r++){let t=e.charCodeAt(r)
if(124==t)return!0
92==t&&r++}return!1}const xe=/^\|?(\s*:?-+:?\s*\|)+(\s*:?-+:?\s*)?$/
class ye{constructor(){this.rows=null}nextLine(e,t,r){if(null==this.rows){let n
if(this.rows=!1,(45==t.next||58==t.next||124==t.next)&&xe.test(n=t.text.slice(t.pos))){let a=[]
be(e,r.content,0,a,r.start)==be(e,n,t.pos)&&(this.rows=[e.elt("TableHeader",r.start,r.start+r.content.length,a),e.elt("TableDelimiter",e.lineStart+t.pos,e.lineStart+t.text.length)])}}else if(this.rows){let r=[]
be(e,t.text,t.pos,r,e.lineStart),this.rows.push(e.elt("TableRow",e.lineStart+t.pos,e.lineStart+t.text.length,r))}return!1}finish(e,t){return!!this.rows&&(e.addLeafElement(t,e.elt("Table",t.start,t.start+t.content.length,this.rows)),!0)}}const Qe={defineNodes:[{name:"Table",block:!0},{name:"TableHeader",style:{"TableHeader/...":O._A.heading}},"TableRow",{name:"TableCell",style:O._A.content},{name:"TableDelimiter",style:O._A.processingInstruction}],parseBlock:[{name:"Table",leaf:(e,t)=>ke(t.content,0)?new ye:null,endLeaf(e,t,r){if(r.parsers.some((e=>e instanceof ye))||!ke(t.text,t.basePos))return!1
let n=e.peekLine()
return xe.test(n)&&be(e,t.text,t.basePos)==be(e,n,t.basePos)},before:"SetextHeading"}]}
class Pe{nextLine(){return!1}finish(e,t){return e.addLeafElement(t,e.elt("Task",t.start,t.start+t.content.length,[e.elt("TaskMarker",t.start,t.start+3),...e.parser.parseInline(t.content.slice(3),t.start+3)])),!0}}const we={defineNodes:[{name:"Task",block:!0,style:O._A.list},{name:"TaskMarker",style:O._A.atom}],parseBlock:[{name:"TaskList",leaf:(e,t)=>/^\[[ xX]\][ \t]/.test(t.content)&&"ListItem"==e.parentType().name?new Pe:null,after:"SetextHeading"}]},$e=/(www\.)|(https?:\/\/)|([\w.+-]{1,100}@)|(mailto:|xmpp:)/gy,Te=/[\w-]+(\.[\w-]+)+(\/[^\s<]*)?/gy,ve=/[\w-]+\.[\w-]+($|\/)/,Xe=/[\w.+-]+@[\w-]+(\.[\w.-]+)+/gy,Ae=/\/[a-zA-Z\d@.]+/gy
function Ce(e,t,r,n){let a=0
for(let l=t;l<r;l++)e[l]==n&&a++
return a}function _e(e,t){Xe.lastIndex=t
let r=Xe.exec(e)
if(!r)return-1
let n=r[0][r[0].length-1]
return"_"==n||"-"==n?-1:t+r[0].length-("."==n?1:0)}const Ve=[Qe,we,Se,{parseInline:[{name:"Autolink",parse(e,t,r){let n=r-e.offset
if(n&&/\w/.test(e.text[n-1]))return-1
$e.lastIndex=n
let a=$e.exec(e.text),l=-1
return a?(a[1]||a[2]?(l=function(e,t){Te.lastIndex=t
let r=Te.exec(e)
if(!r||ve.exec(r[0])[0].indexOf("_")>-1)return-1
let n=t+r[0].length
for(;;){let r,a=e[n-1]
if(/[?!.,:*_~]/.test(a)||")"==a&&Ce(e,t,n,")")>Ce(e,t,n,"("))n--
else{if(";"!=a||!(r=/&(?:#\d+|#x[a-f\d]+|\w+);$/.exec(e.slice(t,n))))break
n=t+r.index}}return n}(e.text,n+a[0].length),l>-1&&e.hasOpenLink&&(l=n+/([^\[\]]|\[[^\]]*\])*/.exec(e.text.slice(n,l))[0].length)):a[3]?l=_e(e.text,n):(l=_e(e.text,n+a[0].length),l>-1&&"xmpp:"==a[0]&&(Ae.lastIndex=l,a=Ae.exec(e.text),a&&(l=a.index+a[0].length))),l<0?-1:(e.addElement(e.elt("URL",r,l+e.offset)),l+e.offset)):-1}}]}]
function Le(e,t,r){return(n,a,l)=>{if(a!=e||n.char(l+1)==e)return-1
let s=[n.elt(r,l,l+1)]
for(let o=l+1;o<n.end;o++){let a=n.char(o)
if(a==e)return n.addElement(n.elt(t,l,o+1,s.concat(n.elt(r,o,o+1))))
if(92==a&&s.push(n.elt("Escape",o,2+o++)),f(a))break}return-1}}const Ee={defineNodes:[{name:"Superscript",style:O._A.special(O._A.content)},{name:"SuperscriptMark",style:O._A.processingInstruction}],parseInline:[{name:"Superscript",parse:Le(94,"Superscript","SuperscriptMark")}]},qe={defineNodes:[{name:"Subscript",style:O._A.special(O._A.content)},{name:"SubscriptMark",style:O._A.processingInstruction}],parseInline:[{name:"Subscript",parse:Le(126,"Subscript","SubscriptMark")}]},Re={defineNodes:[{name:"Emoji",style:O._A.character}],parseInline:[{name:"Emoji",parse(e,t,r){let n
return 58==t&&(n=/^[a-zA-Z_0-9]+:/.exec(e.slice(r+1,e.end)))?e.addElement(e.elt("Emoji",r,r+1+n[0].length)):-1}}]}
var Ye=r(33425)
const ze={area:!0,base:!0,br:!0,col:!0,command:!0,embed:!0,frame:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0,menuitem:!0},Be={dd:!0,li:!0,optgroup:!0,option:!0,p:!0,rp:!0,rt:!0,tbody:!0,td:!0,tfoot:!0,th:!0,tr:!0},Ze={dd:{dd:!0,dt:!0},dt:{dd:!0,dt:!0},li:{li:!0},option:{option:!0,optgroup:!0},optgroup:{optgroup:!0},p:{address:!0,article:!0,aside:!0,blockquote:!0,dir:!0,div:!0,dl:!0,fieldset:!0,footer:!0,form:!0,h1:!0,h2:!0,h3:!0,h4:!0,h5:!0,h6:!0,header:!0,hgroup:!0,hr:!0,menu:!0,nav:!0,ol:!0,p:!0,pre:!0,section:!0,table:!0,ul:!0},rp:{rp:!0,rt:!0},rt:{rp:!0,rt:!0},tbody:{tbody:!0,tfoot:!0},td:{td:!0,th:!0},tfoot:{tbody:!0},th:{td:!0,th:!0},thead:{tbody:!0,tfoot:!0},tr:{tr:!0}}
function Ie(e){return 9==e||10==e||13==e||32==e}let We=null,Me=null,Ue=0
function Ne(e,t){let r=e.pos+t
if(Ue==r&&Me==e)return We
let n=e.peek(t)
for(;Ie(n);)n=e.peek(++t)
let a=""
for(;45==(l=n)||46==l||58==l||l>=65&&l<=90||95==l||l>=97&&l<=122||l>=161;)a+=String.fromCharCode(n),n=e.peek(++t)
var l
return Me=e,Ue=r,We=a?a.toLowerCase():n==Ge||n==De?void 0:null}const Ge=63,De=33
function He(e,t){this.name=e,this.parent=t}const je=[6,10,7,8,9],Fe=new Ye.Aj({start:null,shift:(e,t,r,n)=>je.indexOf(t)>-1?new He(Ne(n,1)||"",e):e,reduce:(e,t)=>20==t&&e?e.parent:e,reuse(e,t,r,n){let a=t.type.id
return 6==a||36==a?new He(Ne(n,1)||"",e):e},strict:!1}),Ke=new Ye.Lu(((e,t)=>{if(60!=e.next)return void(e.next<0&&t.context&&e.acceptToken(57))
e.advance()
let r=47==e.next
r&&e.advance()
let n=Ne(e,0)
if(void 0===n)return
if(!n)return e.acceptToken(r?14:6)
let a=t.context?t.context.name:null
if(r){if(n==a)return e.acceptToken(11)
if(a&&Be[a])return e.acceptToken(57,-2)
if(t.dialectEnabled(0))return e.acceptToken(12)
for(let e=t.context;e;e=e.parent)if(e.name==n)return
e.acceptToken(13)}else{if("script"==n)return e.acceptToken(7)
if("style"==n)return e.acceptToken(8)
if("textarea"==n)return e.acceptToken(9)
if(ze.hasOwnProperty(n))return e.acceptToken(10)
a&&Ze[a]&&Ze[a][n]?e.acceptToken(57,-1):e.acceptToken(6)}}),{contextual:!0}),Je=new Ye.Lu((e=>{for(let t=0,r=0;;r++){if(e.next<0){r&&e.acceptToken(58)
break}if(45==e.next)t++
else{if(62==e.next&&t>=2){r>=3&&e.acceptToken(58,-2)
break}t=0}e.advance()}})),et=new Ye.Lu(((e,t)=>{if(47==e.next&&62==e.peek(1)){let r=t.dialectEnabled(1)||function(e){for(;e;e=e.parent)if("svg"==e.name||"math"==e.name)return!0
return!1}(t.context)
e.acceptToken(r?5:4,2)}else 62==e.next&&e.acceptToken(4,1)}))
function tt(e,t,r){let n=2+e.length
return new Ye.Lu((a=>{for(let l=0,s=0,o=0;;o++){if(a.next<0){o&&a.acceptToken(t)
break}if(0==l&&60==a.next||1==l&&47==a.next||l>=2&&l<n&&a.next==e.charCodeAt(l-2))l++,s++
else if(2!=l&&l!=n||!Ie(a.next)){if(l==n&&62==a.next){o>s?a.acceptToken(t,-s):a.acceptToken(r,-(s-2))
break}if((10==a.next||13==a.next)&&o){a.acceptToken(t,1)
break}l=s=0}else s++
a.advance()}}))}const rt=tt("script",54,1),nt=tt("style",55,2),at=tt("textarea",56,3),lt=(0,O.pn)({"Text RawText":O._A.content,"StartTag StartCloseTag SelfClosingEndTag EndTag":O._A.angleBracket,TagName:O._A.tagName,"MismatchedCloseTag/TagName":[O._A.tagName,O._A.invalid],AttributeName:O._A.attributeName,"AttributeValue UnquotedAttributeValue":O._A.attributeValue,Is:O._A.definitionOperator,"EntityReference CharacterReference":O._A.character,Comment:O._A.blockComment,ProcessingInst:O._A.processingInstruction,DoctypeDecl:O._A.documentMeta}),st=Ye.U1.deserialize({version:14,states:",xOVO!rOOO!WQ#tO'#CqO!]Q#tO'#CzO!bQ#tO'#C}O!gQ#tO'#DQO!lQ#tO'#DSO!qOaO'#CpO!|ObO'#CpO#XOdO'#CpO$eO!rO'#CpOOO`'#Cp'#CpO$lO$fO'#DTO$tQ#tO'#DVO$yQ#tO'#DWOOO`'#Dk'#DkOOO`'#DY'#DYQVO!rOOO%OQ&rO,59]O%ZQ&rO,59fO%fQ&rO,59iO%qQ&rO,59lO%|Q&rO,59nOOOa'#D^'#D^O&XOaO'#CxO&dOaO,59[OOOb'#D_'#D_O&lObO'#C{O&wObO,59[OOOd'#D`'#D`O'POdO'#DOO'[OdO,59[OOO`'#Da'#DaO'dO!rO,59[O'kQ#tO'#DROOO`,59[,59[OOOp'#Db'#DbO'pO$fO,59oOOO`,59o,59oO'xQ#|O,59qO'}Q#|O,59rOOO`-E7W-E7WO(SQ&rO'#CsOOQW'#DZ'#DZO(bQ&rO1G.wOOOa1G.w1G.wOOO`1G/Y1G/YO(mQ&rO1G/QOOOb1G/Q1G/QO(xQ&rO1G/TOOOd1G/T1G/TO)TQ&rO1G/WOOO`1G/W1G/WO)`Q&rO1G/YOOOa-E7[-E7[O)kQ#tO'#CyOOO`1G.v1G.vOOOb-E7]-E7]O)pQ#tO'#C|OOOd-E7^-E7^O)uQ#tO'#DPOOO`-E7_-E7_O)zQ#|O,59mOOOp-E7`-E7`OOO`1G/Z1G/ZOOO`1G/]1G/]OOO`1G/^1G/^O*PQ,UO,59_OOQW-E7X-E7XOOOa7+$c7+$cOOO`7+$t7+$tOOOb7+$l7+$lOOOd7+$o7+$oOOO`7+$r7+$rO*[Q#|O,59eO*aQ#|O,59hO*fQ#|O,59kOOO`1G/X1G/XO*kO7[O'#CvO*|OMhO'#CvOOQW1G.y1G.yOOO`1G/P1G/POOO`1G/S1G/SOOO`1G/V1G/VOOOO'#D['#D[O+_O7[O,59bOOQW,59b,59bOOOO'#D]'#D]O+pOMhO,59bOOOO-E7Y-E7YOOQW1G.|1G.|OOOO-E7Z-E7Z",stateData:",]~O!^OS~OUSOVPOWQOXROYTO[]O][O^^O`^Oa^Ob^Oc^Ox^O{_O!dZO~OfaO~OfbO~OfcO~OfdO~OfeO~O!WfOPlP!ZlP~O!XiOQoP!ZoP~O!YlORrP!ZrP~OUSOVPOWQOXROYTOZqO[]O][O^^O`^Oa^Ob^Oc^Ox^O!dZO~O!ZrO~P#dO![sO!euO~OfvO~OfwO~OS|OT}OhyO~OS!POT}OhyO~OS!ROT}OhyO~OS!TOT}OhyO~OS}OT}OhyO~O!WfOPlX!ZlX~OP!WO!Z!XO~O!XiOQoX!ZoX~OQ!ZO!Z!XO~O!YlORrX!ZrX~OR!]O!Z!XO~O!Z!XO~P#dOf!_O~O![sO!e!aO~OS!bO~OS!cO~Oi!dOSgXTgXhgX~OS!fOT!gOhyO~OS!hOT!gOhyO~OS!iOT!gOhyO~OS!jOT!gOhyO~OS!gOT!gOhyO~Of!kO~Of!lO~Of!mO~OS!nO~Ok!qO!`!oO!b!pO~OS!rO~OS!sO~OS!tO~Oa!uOb!uOc!uO!`!wO!a!uO~Oa!xOb!xOc!xO!b!wO!c!xO~Oa!uOb!uOc!uO!`!{O!a!uO~Oa!xOb!xOc!xO!b!{O!c!xO~OT~bac!dx{!d~",goto:"%p!`PPPPPPPPPPPPPPPPPPPP!a!gP!mPP!yP!|#P#S#Y#]#`#f#i#l#r#x!aP!a!aP$O$U$l$r$x%O%U%[%bPPPPPPPP%hX^OX`pXUOX`pezabcde{!O!Q!S!UR!q!dRhUR!XhXVOX`pRkVR!XkXWOX`pRnWR!XnXXOX`pQrXR!XpXYOX`pQ`ORx`Q{aQ!ObQ!QcQ!SdQ!UeZ!e{!O!Q!S!UQ!v!oR!z!vQ!y!pR!|!yQgUR!VgQjVR!YjQmWR![mQpXR!^pQtZR!`tS_O`ToXp",nodeNames:"⚠ StartCloseTag StartCloseTag StartCloseTag EndTag SelfClosingEndTag StartTag StartTag StartTag StartTag StartTag StartCloseTag StartCloseTag StartCloseTag IncompleteCloseTag Document Text EntityReference CharacterReference InvalidEntity Element OpenTag TagName Attribute AttributeName Is AttributeValue UnquotedAttributeValue ScriptText CloseTag OpenTag StyleText CloseTag OpenTag TextareaText CloseTag OpenTag CloseTag SelfClosingTag Comment ProcessingInst MismatchedCloseTag CloseTag DoctypeDecl",maxTerm:67,context:Fe,nodeProps:[["closedBy",-10,1,2,3,7,8,9,10,11,12,13,"EndTag",6,"EndTag SelfClosingEndTag",-4,21,30,33,36,"CloseTag"],["openedBy",4,"StartTag StartCloseTag",5,"StartTag",-4,29,32,35,37,"OpenTag"],["group",-9,14,17,18,19,20,39,40,41,42,"Entity",16,"Entity TextContent",-3,28,31,34,"TextContent Entity"],["isolate",-11,21,29,30,32,33,35,36,37,38,41,42,"ltr",-3,26,27,39,""]],propSources:[lt],skippedNodes:[0],repeatNodeCount:9,tokenData:"!<p!aR!YOX$qXY,QYZ,QZ[$q[]&X]^,Q^p$qpq,Qqr-_rs3_sv-_vw3}wxHYx}-_}!OH{!O!P-_!P!Q$q!Q![-_![!]Mz!]!^-_!^!_!$S!_!`!;x!`!a&X!a!c-_!c!}Mz!}#R-_#R#SMz#S#T1k#T#oMz#o#s-_#s$f$q$f%W-_%W%oMz%o%p-_%p&aMz&a&b-_&b1pMz1p4U-_4U4dMz4d4e-_4e$ISMz$IS$I`-_$I`$IbMz$Ib$Kh-_$Kh%#tMz%#t&/x-_&/x&EtMz&Et&FV-_&FV;'SMz;'S;:j!#|;:j;=`3X<%l?&r-_?&r?AhMz?Ah?BY$q?BY?MnMz?MnO$q!Z$|c`PkW!a`!cpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr$qrs&}sv$qvw+Pwx(tx!^$q!^!_*V!_!a&X!a#S$q#S#T&X#T;'S$q;'S;=`+z<%lO$q!R&bX`P!a`!cpOr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&Xq'UV`P!cpOv&}wx'kx!^&}!^!_(V!_;'S&};'S;=`(n<%lO&}P'pT`POv'kw!^'k!_;'S'k;'S;=`(P<%lO'kP(SP;=`<%l'kp([S!cpOv(Vx;'S(V;'S;=`(h<%lO(Vp(kP;=`<%l(Vq(qP;=`<%l&}a({W`P!a`Or(trs'ksv(tw!^(t!^!_)e!_;'S(t;'S;=`*P<%lO(t`)jT!a`Or)esv)ew;'S)e;'S;=`)y<%lO)e`)|P;=`<%l)ea*SP;=`<%l(t!Q*^V!a`!cpOr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!Q*vP;=`<%l*V!R*|P;=`<%l&XW+UYkWOX+PZ[+P^p+Pqr+Psw+Px!^+P!a#S+P#T;'S+P;'S;=`+t<%lO+PW+wP;=`<%l+P!Z+}P;=`<%l$q!a,]``P!a`!cp!^^OX&XXY,QYZ,QZ]&X]^,Q^p&Xpq,Qqr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&X!_-ljhS`PkW!a`!cpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx!P-_!P!Q$q!Q!^-_!^!_*V!_!a&X!a#S-_#S#T1k#T#s-_#s$f$q$f;'S-_;'S;=`3X<%l?Ah-_?Ah?BY$q?BY?Mn-_?MnO$q[/ebhSkWOX+PZ[+P^p+Pqr/^sw/^x!P/^!P!Q+P!Q!^/^!a#S/^#S#T0m#T#s/^#s$f+P$f;'S/^;'S;=`1e<%l?Ah/^?Ah?BY+P?BY?Mn/^?MnO+PS0rXhSqr0msw0mx!P0m!Q!^0m!a#s0m$f;'S0m;'S;=`1_<%l?Ah0m?BY?Mn0mS1bP;=`<%l0m[1hP;=`<%l/^!V1vchS`P!a`!cpOq&Xqr1krs&}sv1kvw0mwx(tx!P1k!P!Q&X!Q!^1k!^!_*V!_!a&X!a#s1k#s$f&X$f;'S1k;'S;=`3R<%l?Ah1k?Ah?BY&X?BY?Mn1k?MnO&X!V3UP;=`<%l1k!_3[P;=`<%l-_!Z3hV!`h`P!cpOv&}wx'kx!^&}!^!_(V!_;'S&};'S;=`(n<%lO&}!_4WihSkWc!ROX5uXZ7SZ[5u[^7S^p5uqr8trs7Sst>]tw8twx7Sx!P8t!P!Q5u!Q!]8t!]!^/^!^!a7S!a#S8t#S#T;{#T#s8t#s$f5u$f;'S8t;'S;=`>V<%l?Ah8t?Ah?BY5u?BY?Mn8t?MnO5u!Z5zbkWOX5uXZ7SZ[5u[^7S^p5uqr5urs7Sst+Ptw5uwx7Sx!]5u!]!^7w!^!a7S!a#S5u#S#T7S#T;'S5u;'S;=`8n<%lO5u!R7VVOp7Sqs7St!]7S!]!^7l!^;'S7S;'S;=`7q<%lO7S!R7qOa!R!R7tP;=`<%l7S!Z8OYkWa!ROX+PZ[+P^p+Pqr+Psw+Px!^+P!a#S+P#T;'S+P;'S;=`+t<%lO+P!Z8qP;=`<%l5u!_8{ihSkWOX5uXZ7SZ[5u[^7S^p5uqr8trs7Sst/^tw8twx7Sx!P8t!P!Q5u!Q!]8t!]!^:j!^!a7S!a#S8t#S#T;{#T#s8t#s$f5u$f;'S8t;'S;=`>V<%l?Ah8t?Ah?BY5u?BY?Mn8t?MnO5u!_:sbhSkWa!ROX+PZ[+P^p+Pqr/^sw/^x!P/^!P!Q+P!Q!^/^!a#S/^#S#T0m#T#s/^#s$f+P$f;'S/^;'S;=`1e<%l?Ah/^?Ah?BY+P?BY?Mn/^?MnO+P!V<QchSOp7Sqr;{rs7Sst0mtw;{wx7Sx!P;{!P!Q7S!Q!];{!]!^=]!^!a7S!a#s;{#s$f7S$f;'S;{;'S;=`>P<%l?Ah;{?Ah?BY7S?BY?Mn;{?MnO7S!V=dXhSa!Rqr0msw0mx!P0m!Q!^0m!a#s0m$f;'S0m;'S;=`1_<%l?Ah0m?BY?Mn0m!V>SP;=`<%l;{!_>YP;=`<%l8t!_>dhhSkWOX@OXZAYZ[@O[^AY^p@OqrBwrsAYswBwwxAYx!PBw!P!Q@O!Q!]Bw!]!^/^!^!aAY!a#SBw#S#TE{#T#sBw#s$f@O$f;'SBw;'S;=`HS<%l?AhBw?Ah?BY@O?BY?MnBw?MnO@O!Z@TakWOX@OXZAYZ[@O[^AY^p@Oqr@OrsAYsw@OwxAYx!]@O!]!^Az!^!aAY!a#S@O#S#TAY#T;'S@O;'S;=`Bq<%lO@O!RA]UOpAYq!]AY!]!^Ao!^;'SAY;'S;=`At<%lOAY!RAtOb!R!RAwP;=`<%lAY!ZBRYkWb!ROX+PZ[+P^p+Pqr+Psw+Px!^+P!a#S+P#T;'S+P;'S;=`+t<%lO+P!ZBtP;=`<%l@O!_COhhSkWOX@OXZAYZ[@O[^AY^p@OqrBwrsAYswBwwxAYx!PBw!P!Q@O!Q!]Bw!]!^Dj!^!aAY!a#SBw#S#TE{#T#sBw#s$f@O$f;'SBw;'S;=`HS<%l?AhBw?Ah?BY@O?BY?MnBw?MnO@O!_DsbhSkWb!ROX+PZ[+P^p+Pqr/^sw/^x!P/^!P!Q+P!Q!^/^!a#S/^#S#T0m#T#s/^#s$f+P$f;'S/^;'S;=`1e<%l?Ah/^?Ah?BY+P?BY?Mn/^?MnO+P!VFQbhSOpAYqrE{rsAYswE{wxAYx!PE{!P!QAY!Q!]E{!]!^GY!^!aAY!a#sE{#s$fAY$f;'SE{;'S;=`G|<%l?AhE{?Ah?BYAY?BY?MnE{?MnOAY!VGaXhSb!Rqr0msw0mx!P0m!Q!^0m!a#s0m$f;'S0m;'S;=`1_<%l?Ah0m?BY?Mn0m!VHPP;=`<%lE{!_HVP;=`<%lBw!ZHcW!bx`P!a`Or(trs'ksv(tw!^(t!^!_)e!_;'S(t;'S;=`*P<%lO(t!aIYlhS`PkW!a`!cpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx}-_}!OKQ!O!P-_!P!Q$q!Q!^-_!^!_*V!_!a&X!a#S-_#S#T1k#T#s-_#s$f$q$f;'S-_;'S;=`3X<%l?Ah-_?Ah?BY$q?BY?Mn-_?MnO$q!aK_khS`PkW!a`!cpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx!P-_!P!Q$q!Q!^-_!^!_*V!_!`&X!`!aMS!a#S-_#S#T1k#T#s-_#s$f$q$f;'S-_;'S;=`3X<%l?Ah-_?Ah?BY$q?BY?Mn-_?MnO$q!TM_X`P!a`!cp!eQOr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&X!aNZ!ZhSfQ`PkW!a`!cpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx}-_}!OMz!O!PMz!P!Q$q!Q![Mz![!]Mz!]!^-_!^!_*V!_!a&X!a!c-_!c!}Mz!}#R-_#R#SMz#S#T1k#T#oMz#o#s-_#s$f$q$f$}-_$}%OMz%O%W-_%W%oMz%o%p-_%p&aMz&a&b-_&b1pMz1p4UMz4U4dMz4d4e-_4e$ISMz$IS$I`-_$I`$IbMz$Ib$Je-_$Je$JgMz$Jg$Kh-_$Kh%#tMz%#t&/x-_&/x&EtMz&Et&FV-_&FV;'SMz;'S;:j!#|;:j;=`3X<%l?&r-_?&r?AhMz?Ah?BY$q?BY?MnMz?MnO$q!a!$PP;=`<%lMz!R!$ZY!a`!cpOq*Vqr!$yrs(Vsv*Vwx)ex!a*V!a!b!4t!b;'S*V;'S;=`*s<%lO*V!R!%Q]!a`!cpOr*Vrs(Vsv*Vwx)ex}*V}!O!%y!O!f*V!f!g!']!g#W*V#W#X!0`#X;'S*V;'S;=`*s<%lO*V!R!&QX!a`!cpOr*Vrs(Vsv*Vwx)ex}*V}!O!&m!O;'S*V;'S;=`*s<%lO*V!R!&vV!a`!cp!dPOr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!R!'dX!a`!cpOr*Vrs(Vsv*Vwx)ex!q*V!q!r!(P!r;'S*V;'S;=`*s<%lO*V!R!(WX!a`!cpOr*Vrs(Vsv*Vwx)ex!e*V!e!f!(s!f;'S*V;'S;=`*s<%lO*V!R!(zX!a`!cpOr*Vrs(Vsv*Vwx)ex!v*V!v!w!)g!w;'S*V;'S;=`*s<%lO*V!R!)nX!a`!cpOr*Vrs(Vsv*Vwx)ex!{*V!{!|!*Z!|;'S*V;'S;=`*s<%lO*V!R!*bX!a`!cpOr*Vrs(Vsv*Vwx)ex!r*V!r!s!*}!s;'S*V;'S;=`*s<%lO*V!R!+UX!a`!cpOr*Vrs(Vsv*Vwx)ex!g*V!g!h!+q!h;'S*V;'S;=`*s<%lO*V!R!+xY!a`!cpOr!+qrs!,hsv!+qvw!-Swx!.[x!`!+q!`!a!/j!a;'S!+q;'S;=`!0Y<%lO!+qq!,mV!cpOv!,hvx!-Sx!`!,h!`!a!-q!a;'S!,h;'S;=`!.U<%lO!,hP!-VTO!`!-S!`!a!-f!a;'S!-S;'S;=`!-k<%lO!-SP!-kO{PP!-nP;=`<%l!-Sq!-xS!cp{POv(Vx;'S(V;'S;=`(h<%lO(Vq!.XP;=`<%l!,ha!.aX!a`Or!.[rs!-Ssv!.[vw!-Sw!`!.[!`!a!.|!a;'S!.[;'S;=`!/d<%lO!.[a!/TT!a`{POr)esv)ew;'S)e;'S;=`)y<%lO)ea!/gP;=`<%l!.[!R!/sV!a`!cp{POr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!R!0]P;=`<%l!+q!R!0gX!a`!cpOr*Vrs(Vsv*Vwx)ex#c*V#c#d!1S#d;'S*V;'S;=`*s<%lO*V!R!1ZX!a`!cpOr*Vrs(Vsv*Vwx)ex#V*V#V#W!1v#W;'S*V;'S;=`*s<%lO*V!R!1}X!a`!cpOr*Vrs(Vsv*Vwx)ex#h*V#h#i!2j#i;'S*V;'S;=`*s<%lO*V!R!2qX!a`!cpOr*Vrs(Vsv*Vwx)ex#m*V#m#n!3^#n;'S*V;'S;=`*s<%lO*V!R!3eX!a`!cpOr*Vrs(Vsv*Vwx)ex#d*V#d#e!4Q#e;'S*V;'S;=`*s<%lO*V!R!4XX!a`!cpOr*Vrs(Vsv*Vwx)ex#X*V#X#Y!+q#Y;'S*V;'S;=`*s<%lO*V!R!4{Y!a`!cpOr!4trs!5ksv!4tvw!6Vwx!8]x!a!4t!a!b!:]!b;'S!4t;'S;=`!;r<%lO!4tq!5pV!cpOv!5kvx!6Vx!a!5k!a!b!7W!b;'S!5k;'S;=`!8V<%lO!5kP!6YTO!a!6V!a!b!6i!b;'S!6V;'S;=`!7Q<%lO!6VP!6lTO!`!6V!`!a!6{!a;'S!6V;'S;=`!7Q<%lO!6VP!7QOxPP!7TP;=`<%l!6Vq!7]V!cpOv!5kvx!6Vx!`!5k!`!a!7r!a;'S!5k;'S;=`!8V<%lO!5kq!7yS!cpxPOv(Vx;'S(V;'S;=`(h<%lO(Vq!8YP;=`<%l!5ka!8bX!a`Or!8]rs!6Vsv!8]vw!6Vw!a!8]!a!b!8}!b;'S!8];'S;=`!:V<%lO!8]a!9SX!a`Or!8]rs!6Vsv!8]vw!6Vw!`!8]!`!a!9o!a;'S!8];'S;=`!:V<%lO!8]a!9vT!a`xPOr)esv)ew;'S)e;'S;=`)y<%lO)ea!:YP;=`<%l!8]!R!:dY!a`!cpOr!4trs!5ksv!4tvw!6Vwx!8]x!`!4t!`!a!;S!a;'S!4t;'S;=`!;r<%lO!4t!R!;]V!a`!cpxPOr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!R!;uP;=`<%l!4t!V!<TXiS`P!a`!cpOr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&X",tokenizers:[rt,nt,at,et,Ke,Je,0,1,2,3,4,5],topRules:{Document:[0,15]},dialects:{noMatch:0,selfClosing:509},tokenPrec:511})
function ot(e,t){let r=Object.create(null)
for(let n of e.getChildren(23)){let e=n.getChild(24),a=n.getChild(26)||n.getChild(27)
e&&(r[t.read(e.from,e.to)]=a?26==a.type.id?t.read(a.from+1,a.to-1):t.read(a.from,a.to):"")}return r}function it(e,t){let r=e.getChild(22)
return r?t.read(r.from,r.to):" "}function Ot(e,t,r){let n
for(let a of r)if(!a.attrs||a.attrs(n||(n=ot(e.node.parent.firstChild,t))))return{parser:a.parser}
return null}function ut(e=[],t=[]){let r=[],n=[],a=[],l=[]
for(let o of e)("script"==o.tag?r:"style"==o.tag?n:"textarea"==o.tag?a:l).push(o)
let s=t.length?Object.create(null):null
for(let o of t)(s[o.name]||(s[o.name]=[])).push(o)
return(0,i.$g)(((e,t)=>{let o=e.type.id
if(28==o)return Ot(e,t,r)
if(31==o)return Ot(e,t,n)
if(34==o)return Ot(e,t,a)
if(20==o&&l.length){let r,n=e.node,a=n.firstChild,s=a&&it(a,t)
if(s)for(let e of l)if(e.tag==s&&(!e.attrs||e.attrs(r||(r=ot(a,t))))){let t=n.lastChild,r=37==t.type.id?t.from:n.to
if(r>a.to)return{parser:e.parser,overlay:[{from:a.to,to:r}]}}}if(s&&23==o){let r,n=e.node
if(r=n.firstChild){let e=s[t.read(r.from,r.to)]
if(e)for(let r of e){if(r.tagName&&r.tagName!=it(n.parent,t))continue
let e=n.lastChild
if(26==e.type.id){let t=e.from+1,n=e.lastChild,a=e.to-(n&&n.isError?0:1)
if(a>t)return{parser:r.parser,overlay:[{from:t,to:a}]}}else if(27==e.type.id)return{parser:r.parser,overlay:[{from:e.from,to:e.to}]}}}}return null}))}const ct=[9,10,11,12,13,32,133,160,5760,8192,8193,8194,8195,8196,8197,8198,8199,8200,8201,8202,8232,8233,8239,8287,12288]
function dt(e){return e>=65&&e<=90||e>=97&&e<=122||e>=161}function pt(e){return e>=48&&e<=57}const ht=new Ye.Lu(((e,t)=>{for(let r=!1,n=0,a=0;;a++){let{next:l}=e
if(dt(l)||45==l||95==l||r&&pt(l))!r&&(45!=l||a>0)&&(r=!0),n===a&&45==l&&n++,e.advance()
else{if(92!=l||10==e.peek(1)){r&&e.acceptToken(40==l?101:2==n&&t.canShift(2)?2:102)
break}e.advance(),e.next>-1&&e.advance(),r=!0}}})),ft=new Ye.Lu((e=>{if(ct.includes(e.peek(-1))){let{next:t}=e;(dt(t)||95==t||35==t||46==t||91==t||58==t&&dt(e.peek(1))||45==t||38==t)&&e.acceptToken(100)}})),mt=new Ye.Lu((e=>{if(!ct.includes(e.peek(-1))){let{next:t}=e
if(37==t&&(e.advance(),e.acceptToken(1)),dt(t)){do{e.advance()}while(dt(e.next)||pt(e.next))
e.acceptToken(1)}}})),gt=(0,O.pn)({"AtKeyword import charset namespace keyframes media supports":O._A.definitionKeyword,"from to selector":O._A.keyword,NamespaceName:O._A.namespace,KeyframeName:O._A.labelName,KeyframeRangeName:O._A.operatorKeyword,TagName:O._A.tagName,ClassName:O._A.className,PseudoClassName:O._A.constant(O._A.className),IdName:O._A.labelName,"FeatureName PropertyName":O._A.propertyName,AttributeName:O._A.attributeName,NumberLiteral:O._A.number,KeywordQuery:O._A.keyword,UnaryQueryOp:O._A.operatorKeyword,"CallTag ValueName":O._A.atom,VariableName:O._A.variableName,Callee:O._A.operatorKeyword,Unit:O._A.unit,"UniversalSelector NestingSelector":O._A.definitionOperator,MatchOp:O._A.compareOperator,"ChildOp SiblingOp, LogicOp":O._A.logicOperator,BinOp:O._A.arithmeticOperator,Important:O._A.modifier,Comment:O._A.blockComment,ColorLiteral:O._A.color,"ParenthesizedContent StringLiteral":O._A.string,":":O._A.punctuation,"PseudoOp #":O._A.derefOperator,"; ,":O._A.separator,"( )":O._A.paren,"[ ]":O._A.squareBracket,"{ }":O._A.brace}),St={__proto__:null,lang:34,"nth-child":34,"nth-last-child":34,"nth-of-type":34,"nth-last-of-type":34,dir:34,"host-context":34,url:62,"url-prefix":62,domain:62,regexp:62,selector:140},bt={__proto__:null,"@import":120,"@media":144,"@charset":148,"@namespace":152,"@keyframes":158,"@supports":170},kt={__proto__:null,not:134,only:134},xt=Ye.U1.deserialize({version:14,states:":jQYQ[OOO#_Q[OOP#fOWOOOOQP'#Cd'#CdOOQP'#Cc'#CcO#kQ[O'#CfO$_QXO'#CaO$fQ[O'#CiO$qQ[O'#DUO$vQ[O'#DXOOQP'#En'#EnO${QdO'#DhO%jQ[O'#DuO${QdO'#DwO%{Q[O'#DyO&WQ[O'#D|O&`Q[O'#ESO&nQ[O'#EUOOQS'#Em'#EmOOQS'#EX'#EXQYQ[OOO&uQXO'#CdO'jQWO'#DdO'oQWO'#EsO'zQ[O'#EsQOQWOOP(UO#tO'#C_POOO)C@])C@]OOQP'#Ch'#ChOOQP,59Q,59QO#kQ[O,59QO(aQ[O'#E]O({QWO,58{O)TQ[O,59TO$qQ[O,59pO$vQ[O,59sO(aQ[O,59vO(aQ[O,59xO(aQ[O,59yO)`Q[O'#DcOOQS,58{,58{OOQP'#Cl'#ClOOQO'#DS'#DSOOQP,59T,59TO)gQWO,59TO)lQWO,59TOOQP'#DW'#DWOOQP,59p,59pOOQO'#DY'#DYO)qQ`O,59sOOQS'#Cq'#CqO${QdO'#CrO)yQvO'#CtO+ZQtO,5:SOOQO'#Cy'#CyO)lQWO'#CxO+oQWO'#CzO+tQ[O'#DPOOQS'#Ep'#EpOOQO'#Dk'#DkO+|Q[O'#DrO,[QWO'#EtO&`Q[O'#DpO,jQWO'#DsOOQO'#Eu'#EuO)OQWO,5:aO,oQpO,5:cOOQS'#D{'#D{O,wQWO,5:eO,|Q[O,5:eOOQO'#EO'#EOO-UQWO,5:hO-ZQWO,5:nO-cQWO,5:pOOQS-E8V-E8VO-kQdO,5:OO-{Q[O'#E_O.YQWO,5;_O.YQWO,5;_POOO'#EW'#EWP.eO#tO,58yPOOO,58y,58yOOQP1G.l1G.lO/[QXO,5:wOOQO-E8Z-E8ZOOQS1G.g1G.gOOQP1G.o1G.oO)gQWO1G.oO)lQWO1G.oOOQP1G/[1G/[O/iQ`O1G/_O0SQXO1G/bO0jQXO1G/dO1QQXO1G/eO1hQWO,59}O1mQ[O'#DTO1tQdO'#CpOOQP1G/_1G/_O${QdO1G/_O1{QpO,59^OOQS,59`,59`O${QdO,59bO2TQWO1G/nOOQS,59d,59dO2YQ!bO,59fOOQS'#DQ'#DQOOQS'#EZ'#EZO2eQ[O,59kOOQS,59k,59kO2mQWO'#DkO2xQWO,5:WO2}QWO,5:^O&`Q[O,5:YO&`Q[O'#E`O3VQWO,5;`O3bQWO,5:[O(aQ[O,5:_OOQS1G/{1G/{OOQS1G/}1G/}OOQS1G0P1G0PO3sQWO1G0PO3xQdO'#EPOOQS1G0S1G0SOOQS1G0Y1G0YOOQS1G0[1G0[O4TQtO1G/jOOQO1G/j1G/jOOQO,5:y,5:yO4kQ[O,5:yOOQO-E8]-E8]O4xQWO1G0yPOOO-E8U-E8UPOOO1G.e1G.eOOQP7+$Z7+$ZOOQP7+$y7+$yO${QdO7+$yOOQS1G/i1G/iO5TQXO'#ErO5[QWO,59oO5aQtO'#EYO6XQdO'#EoO6cQWO,59[O6hQpO7+$yOOQS1G.x1G.xOOQS1G.|1G.|OOQS7+%Y7+%YOOQS1G/Q1G/QO6pQWO1G/QOOQS-E8X-E8XOOQS1G/V1G/VO${QdO1G/rOOQO1G/x1G/xOOQO1G/t1G/tO6uQWO,5:zOOQO-E8^-E8^O7TQXO1G/yOOQS7+%k7+%kO7[QYO'#CtOOQO'#ER'#ERO7gQ`O'#EQOOQO'#EQ'#EQO7rQWO'#EaO7zQdO,5:kOOQS,5:k,5:kO8VQtO'#E^O${QdO'#E^O9WQdO7+%UOOQO7+%U7+%UOOQO1G0e1G0eO9kQpO<<HeO9sQWO,5;^OOQP1G/Z1G/ZOOQS-E8W-E8WO${QdO'#E[O9{QWO,5;ZOOQT1G.v1G.vOOQP<<He<<HeOOQS7+$l7+$lO:TQdO7+%^OOQO7+%e7+%eOOQO,5:l,5:lO3{QdO'#EbO7rQWO,5:{OOQS,5:{,5:{OOQS-E8_-E8_OOQS1G0V1G0VO:[QtO,5:xOOQS-E8[-E8[OOQO<<Hp<<HpOOQPAN>PAN>PO;]QdO,5:vOOQO-E8Y-E8YOOQO<<Hx<<HxOOQO,5:|,5:|OOQO-E8`-E8`OOQS1G0g1G0g",stateData:";o~O#[OS#]QQ~OUYOXYOZTO^VO_VOrXOyWO!]aO!^ZO!j[O!l]O!n^O!q_O!w`O#YRO~OQfOUYOXYOZTO^VO_VOrXOyWO!]aO!^ZO!j[O!l]O!n^O!q_O!w`O#YeO~O#V#gP~P!ZO#]jO~O#YlO~OZnO^qO_qOrsOuoOyrO!PtO!SvO#WuO~O!UwO~P#pOa}O#XzO#YyO~O#Y!OO~O#Y!QO~OQ![Oc!TOg![Oi![Oo!YOr!ZO#X!WO#Y!SO#e!UO~Oc!^O!e!`O!h!aO#Y!]O!U#hP~Oi!fOo!YO#Y!eO~Oi!hO#Y!hO~Oc!^O!e!`O!h!aO#Y!]O~O!Z#hP~P%jOZWX^WX^!XX_WXrWXuWXyWX!PWX!SWX!UWX#WWX~O^!mO~O!Z!nO#V#gX!T#gX~O#V#gX!T#gX~P!ZO#^!qO#_!qO#`!sO~OUYOXYOZTO^VO_VOrXOyWO#YRO~OuoO!UwO~Oa!zO#XzO#YyO~O!T#gP~P!ZOc#RO~Oc#SO~Oq#TO}#UO~OP#WOchXkhX!ZhX!ehX!hhX#YhXbhXQhXghXihXohXrhXuhX!YhX#VhX#XhX#ehXqhX!ThX~Oc!^Ok#XO!e!`O!h!aO#Y!]O!Z#hP~Oc#[O~Oq#`O#Y#]O~Oc!^O!e!`O!h!aO#Y#aO~Ou#eO!c#dO!U#hX!Z#hX~Oc#hO~Ok#XO!Z#jO~O!Z#kO~Oi#lOo!YO~O!U#mO~O!UwO!c#dO~O!UwO!Z#pO~O!Y#rO!Z!Wa#V!Wa!T!Wa~P${O!Z#RX#V#RX!T#RX~P!ZO!Z!nO#V#ga!T#ga~O#^!qO#_!qO#`#xO~OZnO^qO_qOrsOyrO!PtO!SvO#WuO~Ou#Pa!U#Pab#Pa~P.pOq#zO}#{O~OZnO^qO_qOrsOyrO~Ou!Oi!P!Oi!S!Oi!U!Oi#W!Oib!Oi~P/qOu!Qi!P!Qi!S!Qi!U!Qi#W!Qib!Qi~P/qOu!Ri!P!Ri!S!Ri!U!Ri#W!Rib!Ri~P/qO!T#|O~Ob#fP~P(aOb#cP~P${Ob$TOk#XO~O!Z$VO~Ob$WOi$XOp$XO~Oq$ZO#Y#]O~O^!aXb!_X!c!_X~O^$[O~Ob$]O!c#dO~Ou#eO!U#ha!Z#ha~O!c#dOu!da!U!da!Z!dab!da~O!Z$bO~O!T$iO#Y$dO#e$cO~Ok#XOu$kO!Y$mO!Z!Wi#V!Wi!T!Wi~P${O!Z#Ra#V#Ra!T#Ra~P!ZO!Z!nO#V#gi!T#gi~Ob#fX~P#pOb$qO~Ok#XOQ!|Xb!|Xc!|Xg!|Xi!|Xo!|Xr!|Xu!|X#X!|X#Y!|X#e!|X~Ou$sOb#cX~P${Ob$uO~Ok#XOq$vO~Ob$wO~O!c#dOu#Sa!U#Sa!Z#Sa~Ob$yO~P.pOP#WOuhX!UhX~O#e$cOu!tX!U!tX~Ou${O!UwO~O!T%PO#Y$dO#e$cO~Ok#XOQ#QXc#QXg#QXi#QXo#QXr#QXu#QX!Y#QX!Z#QX#V#QX#X#QX#Y#QX#e#QX!T#QX~Ou$kO!Y%SO!Z!Wq#V!Wq!T!Wq~P${Ok#XOq%TO~OuoOb#fa~Ou$sOb#ca~Ob%WO~P${Ok#XOQ#Qac#Qag#Qai#Qao#Qar#Qau#Qa!Y#Qa!Z#Qa#V#Qa#X#Qa#Y#Qa#e#Qa!T#Qa~Ob#Oau#Oa~P${O#[p#]#ek!S#e~",goto:"-g#jPPP#kP#nP#w$WP#wP$g#wPP$mPPP$s$|$|P%`P$|P$|%z&^PPPP$|&vP&z'Q#wP'W#w'^P#wP#w#wPPP'd'y(WPP#nPP(_(_(i(_P(_P(_(_P#nP#nP#nP(l#nP(o(r(u(|#nP#nP)R)X)h)v)|*S*^*d*n*t*zPPPPPPPPPP+Q+Z+v+yP,o,r,x-RRkQ_bOPdhw!n#tkYOPdhotuvw!n#R#h#tkSOPdhotuvw!n#R#h#tQmTR!tnQ{VR!xqQ!x}Q#Z!XR#y!zq![Z]!T!m#S#U#X#q#{$Q$[$k$l$s$x%Up![Z]!T!m#S#U#X#q#{$Q$[$k$l$s$x%UU$f#m$h${R$z$eq!XZ]!T!m#S#U#X#q#{$Q$[$k$l$s$x%Up![Z]!T!m#S#U#X#q#{$Q$[$k$l$s$x%UQ!f^R#l!gT#^!Z#_Q|VR!yqQ!x|R#y!yQ!PWR!{rQ!RXR!|sQxUQ!wpQ#i!cQ#o!jQ#p!kQ$}$gR%Z$|SgPwQ!phQ#s!nR$n#tZfPhw!n#ta!b[`a!V!^!`#d#eR#b!^R!g^R!i_R#n!iS$g#m$hR%X${V$e#m$h${Q!rjR#w!rQdOShPwU!ldh#tR#t!nQ$Q#SU$r$Q$x%UQ$x$[R%U$sQ#_!ZR$Y#_Q$t$QR%V$tQpUS!vp$pR$p#}Q$l#qR%R$lQ!ogS#u!o#vR#v!pQ#f!_R$`#fQ$h#mR%O$hQ$|$gR%Y$|_cOPdhw!n#t^UOPdhw!n#tQ!uoQ!}tQ#OuQ#PvQ#}#RR$a#hR$R#SQ!VZQ!d]Q#V!TQ#q!m[$P#S$Q$[$s$x%UQ$S#UQ$U#XS$j#q$lQ$o#{R%Q$kR$O#RQiPR#QwQ!c[Q!kaR#Y!VU!_[a!VQ!j`Q#c!^Q#g!`Q$^#dR$_#e",nodeNames:"⚠ Unit VariableName Comment StyleSheet RuleSet UniversalSelector TagSelector TagName NestingSelector ClassSelector . ClassName PseudoClassSelector : :: PseudoClassName PseudoClassName ) ( ArgList ValueName ParenthesizedValue ColorLiteral NumberLiteral StringLiteral BinaryExpression BinOp CallExpression Callee CallLiteral CallTag ParenthesizedContent ] [ LineNames LineName , PseudoClassName ArgList IdSelector # IdName AttributeSelector AttributeName MatchOp ChildSelector ChildOp DescendantSelector SiblingSelector SiblingOp } { Block Declaration PropertyName Important ; ImportStatement AtKeyword import KeywordQuery FeatureQuery FeatureName BinaryQuery LogicOp UnaryQuery UnaryQueryOp ParenthesizedQuery SelectorQuery selector MediaStatement media CharsetStatement charset NamespaceStatement namespace NamespaceName KeyframesStatement keyframes KeyframeName KeyframeList KeyframeSelector KeyframeRangeName SupportsStatement supports AtRule Styles",maxTerm:117,nodeProps:[["isolate",-2,3,25,""],["openedBy",18,"(",33,"[",51,"{"],["closedBy",19,")",34,"]",52,"}"]],propSources:[gt],skippedNodes:[0,3,88],repeatNodeCount:11,tokenData:"J^~R!^OX$}X^%u^p$}pq%uqr)Xrs.Rst/utu6duv$}vw7^wx7oxy9^yz9oz{9t{|:_|}?Q}!O?c!O!P@Q!P!Q@i!Q![Ab![!]B]!]!^CX!^!_$}!_!`Cj!`!aC{!a!b$}!b!cDw!c!}$}!}#OFa#O#P$}#P#QFr#Q#R6d#R#T$}#T#UGT#U#c$}#c#dHf#d#o$}#o#pH{#p#q6d#q#rI^#r#sIo#s#y$}#y#z%u#z$f$}$f$g%u$g#BY$}#BY#BZ%u#BZ$IS$}$IS$I_%u$I_$I|$}$I|$JO%u$JO$JT$}$JT$JU%u$JU$KV$}$KV$KW%u$KW&FU$}&FU&FV%u&FV;'S$};'S;=`JW<%lO$}`%QSOy%^z;'S%^;'S;=`%o<%lO%^`%cSp`Oy%^z;'S%^;'S;=`%o<%lO%^`%rP;=`<%l%^~%zh#[~OX%^X^'f^p%^pq'fqy%^z#y%^#y#z'f#z$f%^$f$g'f$g#BY%^#BY#BZ'f#BZ$IS%^$IS$I_'f$I_$I|%^$I|$JO'f$JO$JT%^$JT$JU'f$JU$KV%^$KV$KW'f$KW&FU%^&FU&FV'f&FV;'S%^;'S;=`%o<%lO%^~'mh#[~p`OX%^X^'f^p%^pq'fqy%^z#y%^#y#z'f#z$f%^$f$g'f$g#BY%^#BY#BZ'f#BZ$IS%^$IS$I_'f$I_$I|%^$I|$JO'f$JO$JT%^$JT$JU'f$JU$KV%^$KV$KW'f$KW&FU%^&FU&FV'f&FV;'S%^;'S;=`%o<%lO%^l)[UOy%^z#]%^#]#^)n#^;'S%^;'S;=`%o<%lO%^l)sUp`Oy%^z#a%^#a#b*V#b;'S%^;'S;=`%o<%lO%^l*[Up`Oy%^z#d%^#d#e*n#e;'S%^;'S;=`%o<%lO%^l*sUp`Oy%^z#c%^#c#d+V#d;'S%^;'S;=`%o<%lO%^l+[Up`Oy%^z#f%^#f#g+n#g;'S%^;'S;=`%o<%lO%^l+sUp`Oy%^z#h%^#h#i,V#i;'S%^;'S;=`%o<%lO%^l,[Up`Oy%^z#T%^#T#U,n#U;'S%^;'S;=`%o<%lO%^l,sUp`Oy%^z#b%^#b#c-V#c;'S%^;'S;=`%o<%lO%^l-[Up`Oy%^z#h%^#h#i-n#i;'S%^;'S;=`%o<%lO%^l-uS!Y[p`Oy%^z;'S%^;'S;=`%o<%lO%^~.UWOY.RZr.Rrs.ns#O.R#O#P.s#P;'S.R;'S;=`/o<%lO.R~.sOi~~.vRO;'S.R;'S;=`/P;=`O.R~/SXOY.RZr.Rrs.ns#O.R#O#P.s#P;'S.R;'S;=`/o;=`<%l.R<%lO.R~/rP;=`<%l.Rn/zYyQOy%^z!Q%^!Q![0j![!c%^!c!i0j!i#T%^#T#Z0j#Z;'S%^;'S;=`%o<%lO%^l0oYp`Oy%^z!Q%^!Q![1_![!c%^!c!i1_!i#T%^#T#Z1_#Z;'S%^;'S;=`%o<%lO%^l1dYp`Oy%^z!Q%^!Q![2S![!c%^!c!i2S!i#T%^#T#Z2S#Z;'S%^;'S;=`%o<%lO%^l2ZYg[p`Oy%^z!Q%^!Q![2y![!c%^!c!i2y!i#T%^#T#Z2y#Z;'S%^;'S;=`%o<%lO%^l3QYg[p`Oy%^z!Q%^!Q![3p![!c%^!c!i3p!i#T%^#T#Z3p#Z;'S%^;'S;=`%o<%lO%^l3uYp`Oy%^z!Q%^!Q![4e![!c%^!c!i4e!i#T%^#T#Z4e#Z;'S%^;'S;=`%o<%lO%^l4lYg[p`Oy%^z!Q%^!Q![5[![!c%^!c!i5[!i#T%^#T#Z5[#Z;'S%^;'S;=`%o<%lO%^l5aYp`Oy%^z!Q%^!Q![6P![!c%^!c!i6P!i#T%^#T#Z6P#Z;'S%^;'S;=`%o<%lO%^l6WSg[p`Oy%^z;'S%^;'S;=`%o<%lO%^d6gUOy%^z!_%^!_!`6y!`;'S%^;'S;=`%o<%lO%^d7QS}Sp`Oy%^z;'S%^;'S;=`%o<%lO%^b7cSXQOy%^z;'S%^;'S;=`%o<%lO%^~7rWOY7oZw7owx.nx#O7o#O#P8[#P;'S7o;'S;=`9W<%lO7o~8_RO;'S7o;'S;=`8h;=`O7o~8kXOY7oZw7owx.nx#O7o#O#P8[#P;'S7o;'S;=`9W;=`<%l7o<%lO7o~9ZP;=`<%l7on9cSc^Oy%^z;'S%^;'S;=`%o<%lO%^~9tOb~n9{UUQkWOy%^z!_%^!_!`6y!`;'S%^;'S;=`%o<%lO%^n:fWkW!SQOy%^z!O%^!O!P;O!P!Q%^!Q![>T![;'S%^;'S;=`%o<%lO%^l;TUp`Oy%^z!Q%^!Q![;g![;'S%^;'S;=`%o<%lO%^l;nYp`#e[Oy%^z!Q%^!Q![;g![!g%^!g!h<^!h#X%^#X#Y<^#Y;'S%^;'S;=`%o<%lO%^l<cYp`Oy%^z{%^{|=R|}%^}!O=R!O!Q%^!Q![=j![;'S%^;'S;=`%o<%lO%^l=WUp`Oy%^z!Q%^!Q![=j![;'S%^;'S;=`%o<%lO%^l=qUp`#e[Oy%^z!Q%^!Q![=j![;'S%^;'S;=`%o<%lO%^l>[[p`#e[Oy%^z!O%^!O!P;g!P!Q%^!Q![>T![!g%^!g!h<^!h#X%^#X#Y<^#Y;'S%^;'S;=`%o<%lO%^n?VSu^Oy%^z;'S%^;'S;=`%o<%lO%^l?hWkWOy%^z!O%^!O!P;O!P!Q%^!Q![>T![;'S%^;'S;=`%o<%lO%^n@VUZQOy%^z!Q%^!Q![;g![;'S%^;'S;=`%o<%lO%^~@nTkWOy%^z{@}{;'S%^;'S;=`%o<%lO%^~AUSp`#]~Oy%^z;'S%^;'S;=`%o<%lO%^lAg[#e[Oy%^z!O%^!O!P;g!P!Q%^!Q![>T![!g%^!g!h<^!h#X%^#X#Y<^#Y;'S%^;'S;=`%o<%lO%^bBbU^QOy%^z![%^![!]Bt!];'S%^;'S;=`%o<%lO%^bB{S_Qp`Oy%^z;'S%^;'S;=`%o<%lO%^nC^S!Z^Oy%^z;'S%^;'S;=`%o<%lO%^dCoS}SOy%^z;'S%^;'S;=`%o<%lO%^bDQU!PQOy%^z!`%^!`!aDd!a;'S%^;'S;=`%o<%lO%^bDkS!PQp`Oy%^z;'S%^;'S;=`%o<%lO%^bDzWOy%^z!c%^!c!}Ed!}#T%^#T#oEd#o;'S%^;'S;=`%o<%lO%^bEk[!]Qp`Oy%^z}%^}!OEd!O!Q%^!Q![Ed![!c%^!c!}Ed!}#T%^#T#oEd#o;'S%^;'S;=`%o<%lO%^nFfSr^Oy%^z;'S%^;'S;=`%o<%lO%^nFwSq^Oy%^z;'S%^;'S;=`%o<%lO%^bGWUOy%^z#b%^#b#cGj#c;'S%^;'S;=`%o<%lO%^bGoUp`Oy%^z#W%^#W#XHR#X;'S%^;'S;=`%o<%lO%^bHYS!cQp`Oy%^z;'S%^;'S;=`%o<%lO%^bHiUOy%^z#f%^#f#gHR#g;'S%^;'S;=`%o<%lO%^fIQS!UUOy%^z;'S%^;'S;=`%o<%lO%^nIcS!T^Oy%^z;'S%^;'S;=`%o<%lO%^fItU!SQOy%^z!_%^!_!`6y!`;'S%^;'S;=`%o<%lO%^`JZP;=`<%l$}",tokenizers:[ft,mt,ht,1,2,3,4,new Ye.uC("m~RRYZ[z{a~~g~aO#_~~dP!P!Qg~lO#`~~",28,106)],topRules:{StyleSheet:[0,4],Styles:[1,87]},specialized:[{term:101,get:e=>St[e]||-1},{term:59,get:e=>bt[e]||-1},{term:102,get:e=>kt[e]||-1}],tokenPrec:1219})
let yt=null
function Qt(){if(!yt&&"object"==typeof document&&document.body){let{style:e}=document.body,t=[],r=new Set
for(let n in e)"cssText"!=n&&"cssFloat"!=n&&"string"==typeof e[n]&&(/[A-Z]/.test(n)&&(n=n.replace(/[A-Z]/g,(e=>"-"+e.toLowerCase()))),r.has(n)||(t.push(n),r.add(n)))
yt=t.sort().map((e=>({type:"property",label:e,apply:e+": "})))}return yt||[]}const Pt=["active","after","any-link","autofill","backdrop","before","checked","cue","default","defined","disabled","empty","enabled","file-selector-button","first","first-child","first-letter","first-line","first-of-type","focus","focus-visible","focus-within","fullscreen","has","host","host-context","hover","in-range","indeterminate","invalid","is","lang","last-child","last-of-type","left","link","marker","modal","not","nth-child","nth-last-child","nth-last-of-type","nth-of-type","only-child","only-of-type","optional","out-of-range","part","placeholder","placeholder-shown","read-only","read-write","required","right","root","scope","selection","slotted","target","target-text","valid","visited","where"].map((e=>({type:"class",label:e}))),wt=["above","absolute","activeborder","additive","activecaption","after-white-space","ahead","alias","all","all-scroll","alphabetic","alternate","always","antialiased","appworkspace","asterisks","attr","auto","auto-flow","avoid","avoid-column","avoid-page","avoid-region","axis-pan","background","backwards","baseline","below","bidi-override","blink","block","block-axis","bold","bolder","border","border-box","both","bottom","break","break-all","break-word","bullets","button","button-bevel","buttonface","buttonhighlight","buttonshadow","buttontext","calc","capitalize","caps-lock-indicator","caption","captiontext","caret","cell","center","checkbox","circle","cjk-decimal","clear","clip","close-quote","col-resize","collapse","color","color-burn","color-dodge","column","column-reverse","compact","condensed","contain","content","contents","content-box","context-menu","continuous","copy","counter","counters","cover","crop","cross","crosshair","currentcolor","cursive","cyclic","darken","dashed","decimal","decimal-leading-zero","default","default-button","dense","destination-atop","destination-in","destination-out","destination-over","difference","disc","discard","disclosure-closed","disclosure-open","document","dot-dash","dot-dot-dash","dotted","double","down","e-resize","ease","ease-in","ease-in-out","ease-out","element","ellipse","ellipsis","embed","end","ethiopic-abegede-gez","ethiopic-halehame-aa-er","ethiopic-halehame-gez","ew-resize","exclusion","expanded","extends","extra-condensed","extra-expanded","fantasy","fast","fill","fill-box","fixed","flat","flex","flex-end","flex-start","footnotes","forwards","from","geometricPrecision","graytext","grid","groove","hand","hard-light","help","hidden","hide","higher","highlight","highlighttext","horizontal","hsl","hsla","hue","icon","ignore","inactiveborder","inactivecaption","inactivecaptiontext","infinite","infobackground","infotext","inherit","initial","inline","inline-axis","inline-block","inline-flex","inline-grid","inline-table","inset","inside","intrinsic","invert","italic","justify","keep-all","landscape","large","larger","left","level","lighter","lighten","line-through","linear","linear-gradient","lines","list-item","listbox","listitem","local","logical","loud","lower","lower-hexadecimal","lower-latin","lower-norwegian","lowercase","ltr","luminosity","manipulation","match","matrix","matrix3d","medium","menu","menutext","message-box","middle","min-intrinsic","mix","monospace","move","multiple","multiple_mask_images","multiply","n-resize","narrower","ne-resize","nesw-resize","no-close-quote","no-drop","no-open-quote","no-repeat","none","normal","not-allowed","nowrap","ns-resize","numbers","numeric","nw-resize","nwse-resize","oblique","opacity","open-quote","optimizeLegibility","optimizeSpeed","outset","outside","outside-shape","overlay","overline","padding","padding-box","painted","page","paused","perspective","pinch-zoom","plus-darker","plus-lighter","pointer","polygon","portrait","pre","pre-line","pre-wrap","preserve-3d","progress","push-button","radial-gradient","radio","read-only","read-write","read-write-plaintext-only","rectangle","region","relative","repeat","repeating-linear-gradient","repeating-radial-gradient","repeat-x","repeat-y","reset","reverse","rgb","rgba","ridge","right","rotate","rotate3d","rotateX","rotateY","rotateZ","round","row","row-resize","row-reverse","rtl","run-in","running","s-resize","sans-serif","saturation","scale","scale3d","scaleX","scaleY","scaleZ","screen","scroll","scrollbar","scroll-position","se-resize","self-start","self-end","semi-condensed","semi-expanded","separate","serif","show","single","skew","skewX","skewY","skip-white-space","slide","slider-horizontal","slider-vertical","sliderthumb-horizontal","sliderthumb-vertical","slow","small","small-caps","small-caption","smaller","soft-light","solid","source-atop","source-in","source-out","source-over","space","space-around","space-between","space-evenly","spell-out","square","start","static","status-bar","stretch","stroke","stroke-box","sub","subpixel-antialiased","svg_masks","super","sw-resize","symbolic","symbols","system-ui","table","table-caption","table-cell","table-column","table-column-group","table-footer-group","table-header-group","table-row","table-row-group","text","text-bottom","text-top","textarea","textfield","thick","thin","threeddarkshadow","threedface","threedhighlight","threedlightshadow","threedshadow","to","top","transform","translate","translate3d","translateX","translateY","translateZ","transparent","ultra-condensed","ultra-expanded","underline","unidirectional-pan","unset","up","upper-latin","uppercase","url","var","vertical","vertical-text","view-box","visible","visibleFill","visiblePainted","visibleStroke","visual","w-resize","wait","wave","wider","window","windowframe","windowtext","words","wrap","wrap-reverse","x-large","x-small","xor","xx-large","xx-small"].map((e=>({type:"keyword",label:e}))).concat(["aliceblue","antiquewhite","aqua","aquamarine","azure","beige","bisque","black","blanchedalmond","blue","blueviolet","brown","burlywood","cadetblue","chartreuse","chocolate","coral","cornflowerblue","cornsilk","crimson","cyan","darkblue","darkcyan","darkgoldenrod","darkgray","darkgreen","darkkhaki","darkmagenta","darkolivegreen","darkorange","darkorchid","darkred","darksalmon","darkseagreen","darkslateblue","darkslategray","darkturquoise","darkviolet","deeppink","deepskyblue","dimgray","dodgerblue","firebrick","floralwhite","forestgreen","fuchsia","gainsboro","ghostwhite","gold","goldenrod","gray","grey","green","greenyellow","honeydew","hotpink","indianred","indigo","ivory","khaki","lavender","lavenderblush","lawngreen","lemonchiffon","lightblue","lightcoral","lightcyan","lightgoldenrodyellow","lightgray","lightgreen","lightpink","lightsalmon","lightseagreen","lightskyblue","lightslategray","lightsteelblue","lightyellow","lime","limegreen","linen","magenta","maroon","mediumaquamarine","mediumblue","mediumorchid","mediumpurple","mediumseagreen","mediumslateblue","mediumspringgreen","mediumturquoise","mediumvioletred","midnightblue","mintcream","mistyrose","moccasin","navajowhite","navy","oldlace","olive","olivedrab","orange","orangered","orchid","palegoldenrod","palegreen","paleturquoise","palevioletred","papayawhip","peachpuff","peru","pink","plum","powderblue","purple","rebeccapurple","red","rosybrown","royalblue","saddlebrown","salmon","sandybrown","seagreen","seashell","sienna","silver","skyblue","slateblue","slategray","snow","springgreen","steelblue","tan","teal","thistle","tomato","turquoise","violet","wheat","white","whitesmoke","yellow","yellowgreen"].map((e=>({type:"constant",label:e})))),$t=["a","abbr","address","article","aside","b","bdi","bdo","blockquote","body","br","button","canvas","caption","cite","code","col","colgroup","dd","del","details","dfn","dialog","div","dl","dt","em","figcaption","figure","footer","form","header","hgroup","h1","h2","h3","h4","h5","h6","hr","html","i","iframe","img","input","ins","kbd","label","legend","li","main","meter","nav","ol","output","p","pre","ruby","section","select","small","source","span","strong","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","tr","u","ul"].map((e=>({type:"type",label:e}))),Tt=["@charset","@color-profile","@container","@counter-style","@font-face","@font-feature-values","@font-palette-values","@import","@keyframes","@layer","@media","@namespace","@page","@position-try","@property","@scope","@starting-style","@supports","@view-transition"].map((e=>({type:"keyword",label:e}))),vt=/^(\w[\w-]*|-\w[\w-]*|)$/,Xt=/^-(-[\w-]*)?$/,At=new i.RY,Ct=["Declaration"]
function _t(e){for(let t=e;;){if(t.type.isTop)return t
if(!(t=t.parent))return e}}function Vt(e,t,r){if(t.to-t.from>4096){let n=At.get(t)
if(n)return n
let a=[],l=new Set,s=t.cursor(i.Qj.IncludeAnonymous)
if(s.firstChild())do{for(let t of Vt(e,s.node,r))l.has(t.label)||(l.add(t.label),a.push(t))}while(s.nextSibling())
return At.set(t,a),a}{let n=[],a=new Set
return t.cursor().iterate((t=>{var l
if(r(t)&&t.matchContext(Ct)&&":"==(null===(l=t.node.nextSibling)||void 0===l?void 0:l.name)){let r=e.sliceString(t.from,t.to)
a.has(r)||(a.add(r),n.push({label:r,type:"variable"}))}})),n}}const Lt=(e=>t=>{let{state:r,pos:n}=t,a=(0,s.syntaxTree)(r).resolveInner(n,-1),l=a.type.isError&&a.from==a.to-1&&"-"==r.doc.sliceString(a.from,a.to)
if("PropertyName"==a.name||(l||"TagName"==a.name)&&/^(Block|Styles)$/.test(a.resolve(a.to).name))return{from:a.from,options:Qt(),validFor:vt}
if("ValueName"==a.name)return{from:a.from,options:wt,validFor:vt}
if("PseudoClassName"==a.name)return{from:a.from,options:Pt,validFor:vt}
if(e(a)||(t.explicit||l)&&function(e,t){var r
if(("("==e.name||e.type.isError)&&(e=e.parent||e),"ArgList"!=e.name)return!1
let n=null===(r=e.parent)||void 0===r?void 0:r.firstChild
return"Callee"==(null==n?void 0:n.name)&&"var"==t.sliceString(n.from,n.to)}(a,r.doc))return{from:e(a)||l?a.from:n,options:Vt(r.doc,_t(a),e),validFor:Xt}
if("TagName"==a.name){for(let{parent:e}=a;e;e=e.parent)if("Block"==e.name)return{from:a.from,options:Qt(),validFor:vt}
return{from:a.from,options:$t,validFor:vt}}if("AtKeyword"==a.name)return{from:a.from,options:Tt,validFor:vt}
if(!t.explicit)return null
let o=a.resolve(n),i=o.childBefore(n)
return i&&":"==i.name&&"PseudoClassSelector"==o.name?{from:n,options:Pt,validFor:vt}:i&&":"==i.name&&"Declaration"==o.name||"ArgList"==o.name?{from:n,options:wt,validFor:vt}:"Block"==o.name||"Styles"==o.name?{from:n,options:Qt(),validFor:vt}:null})((e=>"VariableName"==e.name)),Et=s.LRLanguage.define({name:"css",parser:xt.configure({props:[s.indentNodeProp.add({Declaration:(0,s.continuedIndent)()}),s.foldNodeProp.add({"Block KeyframeList":s.foldInside})]}),languageData:{commentTokens:{block:{open:"/*",close:"*/"}},indentOnInput:/^\s*\}$/,wordChars:"-"}})
var qt=r(68572)
const Rt=["_blank","_self","_top","_parent"],Yt=["ascii","utf-8","utf-16","latin1","latin1"],zt=["get","post","put","delete"],Bt=["application/x-www-form-urlencoded","multipart/form-data","text/plain"],Zt=["true","false"],It={},Wt={a:{attrs:{href:null,ping:null,type:null,media:null,target:Rt,hreflang:null}},abbr:It,address:It,area:{attrs:{alt:null,coords:null,href:null,target:null,ping:null,media:null,hreflang:null,type:null,shape:["default","rect","circle","poly"]}},article:It,aside:It,audio:{attrs:{src:null,mediagroup:null,crossorigin:["anonymous","use-credentials"],preload:["none","metadata","auto"],autoplay:["autoplay"],loop:["loop"],controls:["controls"]}},b:It,base:{attrs:{href:null,target:Rt}},bdi:It,bdo:It,blockquote:{attrs:{cite:null}},body:It,br:It,button:{attrs:{form:null,formaction:null,name:null,value:null,autofocus:["autofocus"],disabled:["autofocus"],formenctype:Bt,formmethod:zt,formnovalidate:["novalidate"],formtarget:Rt,type:["submit","reset","button"]}},canvas:{attrs:{width:null,height:null}},caption:It,center:It,cite:It,code:It,col:{attrs:{span:null}},colgroup:{attrs:{span:null}},command:{attrs:{type:["command","checkbox","radio"],label:null,icon:null,radiogroup:null,command:null,title:null,disabled:["disabled"],checked:["checked"]}},data:{attrs:{value:null}},datagrid:{attrs:{disabled:["disabled"],multiple:["multiple"]}},datalist:{attrs:{data:null}},dd:It,del:{attrs:{cite:null,datetime:null}},details:{attrs:{open:["open"]}},dfn:It,div:It,dl:It,dt:It,em:It,embed:{attrs:{src:null,type:null,width:null,height:null}},eventsource:{attrs:{src:null}},fieldset:{attrs:{disabled:["disabled"],form:null,name:null}},figcaption:It,figure:It,footer:It,form:{attrs:{action:null,name:null,"accept-charset":Yt,autocomplete:["on","off"],enctype:Bt,method:zt,novalidate:["novalidate"],target:Rt}},h1:It,h2:It,h3:It,h4:It,h5:It,h6:It,head:{children:["title","base","link","style","meta","script","noscript","command"]},header:It,hgroup:It,hr:It,html:{attrs:{manifest:null}},i:It,iframe:{attrs:{src:null,srcdoc:null,name:null,width:null,height:null,sandbox:["allow-top-navigation","allow-same-origin","allow-forms","allow-scripts"],seamless:["seamless"]}},img:{attrs:{alt:null,src:null,ismap:null,usemap:null,width:null,height:null,crossorigin:["anonymous","use-credentials"]}},input:{attrs:{alt:null,dirname:null,form:null,formaction:null,height:null,list:null,max:null,maxlength:null,min:null,name:null,pattern:null,placeholder:null,size:null,src:null,step:null,value:null,width:null,accept:["audio/*","video/*","image/*"],autocomplete:["on","off"],autofocus:["autofocus"],checked:["checked"],disabled:["disabled"],formenctype:Bt,formmethod:zt,formnovalidate:["novalidate"],formtarget:Rt,multiple:["multiple"],readonly:["readonly"],required:["required"],type:["hidden","text","search","tel","url","email","password","datetime","date","month","week","time","datetime-local","number","range","color","checkbox","radio","file","submit","image","reset","button"]}},ins:{attrs:{cite:null,datetime:null}},kbd:It,keygen:{attrs:{challenge:null,form:null,name:null,autofocus:["autofocus"],disabled:["disabled"],keytype:["RSA"]}},label:{attrs:{for:null,form:null}},legend:It,li:{attrs:{value:null}},link:{attrs:{href:null,type:null,hreflang:null,media:null,sizes:["all","16x16","16x16 32x32","16x16 32x32 64x64"]}},map:{attrs:{name:null}},mark:It,menu:{attrs:{label:null,type:["list","context","toolbar"]}},meta:{attrs:{content:null,charset:Yt,name:["viewport","application-name","author","description","generator","keywords"],"http-equiv":["content-language","content-type","default-style","refresh"]}},meter:{attrs:{value:null,min:null,low:null,high:null,max:null,optimum:null}},nav:It,noscript:It,object:{attrs:{data:null,type:null,name:null,usemap:null,form:null,width:null,height:null,typemustmatch:["typemustmatch"]}},ol:{attrs:{reversed:["reversed"],start:null,type:["1","a","A","i","I"]},children:["li","script","template","ul","ol"]},optgroup:{attrs:{disabled:["disabled"],label:null}},option:{attrs:{disabled:["disabled"],label:null,selected:["selected"],value:null}},output:{attrs:{for:null,form:null,name:null}},p:It,param:{attrs:{name:null,value:null}},pre:It,progress:{attrs:{value:null,max:null}},q:{attrs:{cite:null}},rp:It,rt:It,ruby:It,samp:It,script:{attrs:{type:["text/javascript"],src:null,async:["async"],defer:["defer"],charset:Yt}},section:It,select:{attrs:{form:null,name:null,size:null,autofocus:["autofocus"],disabled:["disabled"],multiple:["multiple"]}},slot:{attrs:{name:null}},small:It,source:{attrs:{src:null,type:null,media:null}},span:It,strong:It,style:{attrs:{type:["text/css"],media:null,scoped:null}},sub:It,summary:It,sup:It,table:It,tbody:It,td:{attrs:{colspan:null,rowspan:null,headers:null}},template:It,textarea:{attrs:{dirname:null,form:null,maxlength:null,name:null,placeholder:null,rows:null,cols:null,autofocus:["autofocus"],disabled:["disabled"],readonly:["readonly"],required:["required"],wrap:["soft","hard"]}},tfoot:It,th:{attrs:{colspan:null,rowspan:null,headers:null,scope:["row","col","rowgroup","colgroup"]}},thead:It,time:{attrs:{datetime:null}},title:It,tr:It,track:{attrs:{src:null,label:null,default:null,kind:["subtitles","captions","descriptions","chapters","metadata"],srclang:null}},ul:{children:["li","script","template","ul","ol"]},var:It,video:{attrs:{src:null,poster:null,width:null,height:null,crossorigin:["anonymous","use-credentials"],preload:["auto","metadata","none"],autoplay:["autoplay"],mediagroup:["movie"],muted:["muted"],controls:["controls"]}},wbr:It},Mt={accesskey:null,class:null,contenteditable:Zt,contextmenu:null,dir:["ltr","rtl","auto"],draggable:["true","false","auto"],dropzone:["copy","move","link","string:","file:"],hidden:["hidden"],id:null,inert:["inert"],itemid:null,itemprop:null,itemref:null,itemscope:["itemscope"],itemtype:null,lang:["ar","bn","de","en-GB","en-US","es","fr","hi","id","ja","pa","pt","ru","tr","zh"],spellcheck:Zt,autocorrect:Zt,autocapitalize:Zt,style:null,tabindex:null,title:null,translate:["yes","no"],rel:["stylesheet","alternate","author","bookmark","help","license","next","nofollow","noreferrer","prefetch","prev","search","tag"],role:"alert application article banner button cell checkbox complementary contentinfo dialog document feed figure form grid gridcell heading img list listbox listitem main navigation region row rowgroup search switch tab table tabpanel textbox timer".split(" "),"aria-activedescendant":null,"aria-atomic":Zt,"aria-autocomplete":["inline","list","both","none"],"aria-busy":Zt,"aria-checked":["true","false","mixed","undefined"],"aria-controls":null,"aria-describedby":null,"aria-disabled":Zt,"aria-dropeffect":null,"aria-expanded":["true","false","undefined"],"aria-flowto":null,"aria-grabbed":["true","false","undefined"],"aria-haspopup":Zt,"aria-hidden":Zt,"aria-invalid":["true","false","grammar","spelling"],"aria-label":null,"aria-labelledby":null,"aria-level":null,"aria-live":["off","polite","assertive"],"aria-multiline":Zt,"aria-multiselectable":Zt,"aria-owns":null,"aria-posinset":null,"aria-pressed":["true","false","mixed","undefined"],"aria-readonly":Zt,"aria-relevant":null,"aria-required":Zt,"aria-selected":["true","false","undefined"],"aria-setsize":null,"aria-sort":["ascending","descending","none","other"],"aria-valuemax":null,"aria-valuemin":null,"aria-valuenow":null,"aria-valuetext":null},Ut="beforeunload copy cut dragstart dragover dragleave dragenter dragend drag paste focus blur change click load mousedown mouseenter mouseleave mouseup keydown keyup resize scroll unload".split(" ").map((e=>"on"+e))
for(let Vr of Ut)Mt[Vr]=null
class Nt{constructor(e,t){this.tags=Object.assign(Object.assign({},Wt),e),this.globalAttrs=Object.assign(Object.assign({},Mt),t),this.allTags=Object.keys(this.tags),this.globalAttrNames=Object.keys(this.globalAttrs)}}function Gt(e,t,r=e.length){if(!t)return""
let n=t.firstChild,a=n&&n.getChild("TagName")
return a?e.sliceString(a.from,Math.min(a.to,r)):""}function Dt(e,t=!1){for(;e;e=e.parent)if("Element"==e.name){if(!t)return e
t=!1}return null}function Ht(e,t,r){let n=r.tags[Gt(e,Dt(t))]
return(null==n?void 0:n.children)||r.allTags}function jt(e,t){let r=[]
for(let n=Dt(t);n&&!n.type.isTop;n=Dt(n.parent)){let a=Gt(e,n)
if(a&&"CloseTag"==n.lastChild.name)break
a&&r.indexOf(a)<0&&("EndTag"==t.name||t.from>=n.firstChild.to)&&r.push(a)}return r}Nt.default=new Nt
const Ft=/^[:\-\.\w\u00b7-\uffff]*$/
function Kt(e,t,r,n,a){let l=/\s*>/.test(e.sliceDoc(a,a+5))?"":">",s=Dt(r,!0)
return{from:n,to:a,options:Ht(e.doc,s,t).map((e=>({label:e,type:"type"}))).concat(jt(e.doc,r).map(((e,t)=>({label:"/"+e,apply:"/"+e+l,type:"type",boost:99-t})))),validFor:/^\/?[:\-\.\w\u00b7-\uffff]*$/}}function Jt(e,t,r,n){let a=/\s*>/.test(e.sliceDoc(n,n+5))?"":">"
return{from:r,to:n,options:jt(e.doc,t).map(((e,t)=>({label:e,apply:e+a,type:"type",boost:99-t}))),validFor:Ft}}function er(e,t){let{state:r,pos:n}=t,a=(0,s.syntaxTree)(r).resolveInner(n,-1),l=a.resolve(n)
for(let s,o=n;l==a&&(s=a.childBefore(o));){let e=s.lastChild
if(!e||!e.type.isError||e.from<e.to)break
l=a=s,o=e.from}return"TagName"==a.name?a.parent&&/CloseTag$/.test(a.parent.name)?Jt(r,a,a.from,n):Kt(r,e,a,a.from,n):"StartTag"==a.name?Kt(r,e,a,n,n):"StartCloseTag"==a.name||"IncompleteCloseTag"==a.name?Jt(r,a,n,n):"OpenTag"==a.name||"SelfClosingTag"==a.name||"AttributeName"==a.name?function(e,t,r,n,a){let l=Dt(r),s=l?t.tags[Gt(e.doc,l)]:null,o=s&&s.attrs?Object.keys(s.attrs):[]
return{from:n,to:a,options:(s&&!1===s.globalAttrs?o:o.length?o.concat(t.globalAttrNames):t.globalAttrNames).map((e=>({label:e,type:"property"}))),validFor:Ft}}(r,e,a,"AttributeName"==a.name?a.from:n,n):"Is"==a.name||"AttributeValue"==a.name||"UnquotedAttributeValue"==a.name?function(e,t,r,n,a){var l
let s,o=null===(l=r.parent)||void 0===l?void 0:l.getChild("AttributeName"),i=[]
if(o){let l=e.sliceDoc(o.from,o.to),O=t.globalAttrs[l]
if(!O){let n=Dt(r),a=n?t.tags[Gt(e.doc,n)]:null
O=(null==a?void 0:a.attrs)&&a.attrs[l]}if(O){let t=e.sliceDoc(n,a).toLowerCase(),r='"',l='"';/^['"]/.test(t)?(s='"'==t[0]?/^[^"]*$/:/^[^']*$/,r="",l=e.sliceDoc(a,a+1)==t[0]?"":t[0],t=t.slice(1),n++):s=/^[^\s<>='"]*$/
for(let e of O)i.push({label:e,apply:r+e+l,type:"constant"})}}return{from:n,to:a,options:i,validFor:s}}(r,e,a,"Is"==a.name?n:a.from,n):!t.explicit||"Element"!=l.name&&"Text"!=l.name&&"Document"!=l.name?null:function(e,t,r,n){let a=[],l=0
for(let s of Ht(e.doc,r,t))a.push({label:"<"+s,type:"type"})
for(let s of jt(e.doc,r))a.push({label:"</"+s+">",type:"type",boost:99-l++})
return{from:n,to:n,options:a,validFor:/^<\/?[:\-\.\w\u00b7-\uffff]*$/}}(r,e,a,n)}function tr(e){let{extraTags:t,extraGlobalAttributes:r}=e,n=r||t?new Nt(t,r):Nt.default
return e=>er(n,e)}const rr=qt.javascriptLanguage.parser.configure({top:"SingleExpression"}),nr=[{tag:"script",attrs:e=>"text/typescript"==e.type||"ts"==e.lang,parser:qt.typescriptLanguage.parser},{tag:"script",attrs:e=>"text/babel"==e.type||"text/jsx"==e.type,parser:qt.jsxLanguage.parser},{tag:"script",attrs:e=>"text/typescript-jsx"==e.type,parser:qt.tsxLanguage.parser},{tag:"script",attrs:e=>/^(importmap|speculationrules|application\/(.+\+)?json)$/i.test(e.type),parser:rr},{tag:"script",attrs:e=>!e.type||/^(?:text|application)\/(?:x-)?(?:java|ecma)script$|^module$|^$/i.test(e.type),parser:qt.javascriptLanguage.parser},{tag:"style",attrs:e=>(!e.lang||"css"==e.lang)&&(!e.type||/^(text\/)?(x-)?(stylesheet|css)$/i.test(e.type)),parser:Et.parser}],ar=[{name:"style",parser:Et.parser.configure({top:"Styles"})}].concat(Ut.map((e=>({name:e,parser:qt.javascriptLanguage.parser})))),lr=s.LRLanguage.define({name:"html",parser:st.configure({props:[s.indentNodeProp.add({Element(e){let t=/^(\s*)(<\/)?/.exec(e.textAfter)
return e.node.to<=e.pos+t[0].length?e.continue():e.lineIndent(e.node.from)+(t[2]?0:e.unit)},"OpenTag CloseTag SelfClosingTag":e=>e.column(e.node.from)+e.unit,Document(e){if(e.pos+/\s*/.exec(e.textAfter)[0].length<e.node.to)return e.continue()
let t,r=null
for(let n=e.node;;){let e=n.lastChild
if(!e||"Element"!=e.name||e.to!=n.to)break
r=n=e}return r&&(!(t=r.lastChild)||"CloseTag"!=t.name&&"SelfClosingTag"!=t.name)?e.lineIndent(r.from)+e.unit:null}}),s.foldNodeProp.add({Element(e){let t=e.firstChild,r=e.lastChild
return t&&"OpenTag"==t.name?{from:t.to,to:"CloseTag"==r.name?r.from:e.to}:null}}),s.bracketMatchingHandle.add({"OpenTag CloseTag":e=>e.getChild("TagName")})]}),languageData:{commentTokens:{block:{open:"\x3c!--",close:"--\x3e"}},indentOnInput:/^\s*<\/\w+\W$/,wordChars:"-._"}}),sr=lr.configure({wrap:ut(nr,ar)})
const or=new Set("area base br col command embed frame hr img input keygen link meta param source track wbr menuitem".split(" ")),ir=l.EditorView.inputHandler.of(((e,t,r,n,l)=>{if(e.composing||e.state.readOnly||t!=r||">"!=n&&"/"!=n||!sr.isActiveAt(e.state,t,-1))return!1
let o=l(),{state:i}=o,O=i.changeByRange((e=>{var t,r,l
let o,O=i.doc.sliceString(e.from-1,e.to)==n,{head:u}=e,c=(0,s.syntaxTree)(i).resolveInner(u,-1)
if(O&&">"==n&&"EndTag"==c.name){let n=c.parent
if("CloseTag"!=(null===(r=null===(t=n.parent)||void 0===t?void 0:t.lastChild)||void 0===r?void 0:r.name)&&(o=Gt(i.doc,n.parent,u))&&!or.has(o))return{range:e,changes:{from:u,to:u+(">"===i.doc.sliceString(u,u+1)?1:0),insert:`</${o}>`}}}else if(O&&"/"==n&&"IncompleteCloseTag"==c.name){let e=c.parent
if(c.from==u-2&&"CloseTag"!=(null===(l=e.lastChild)||void 0===l?void 0:l.name)&&(o=Gt(i.doc,e,u))&&!or.has(o)){let e=u+(">"===i.doc.sliceString(u,u+1)?1:0),t=`${o}>`
return{range:a.EditorSelection.cursor(u+t.length,-1),changes:{from:u,to:e,insert:t}}}}return{range:e}}))
return!O.changes.empty&&(e.dispatch([o,i.update(O,{userEvent:"input.complete",scrollIntoView:!0})]),!0)})),Or=(0,s.defineLanguageFacet)({commentTokens:{block:{open:"\x3c!--",close:"--\x3e"}}}),ur=new i.uY,cr=fe.configure({props:[s.foldNodeProp.add((e=>!e.is("Block")||e.is("Document")||null!=dr(e)||function(e){return"OrderedList"==e.name||"BulletList"==e.name}(e)?void 0:(e,t)=>({from:t.doc.lineAt(e.from).to,to:e.to}))),ur.add(dr),s.indentNodeProp.add({Document:()=>null}),s.languageDataProp.add({Document:Or})]})
function dr(e){let t=/^(?:ATX|Setext)Heading(\d)$/.exec(e.name)
return t?+t[1]:void 0}function pr(e,t){let r=e
for(;;){let e,n=r.nextSibling
if(!n||null!=(e=dr(n.type))&&e<=t)break
r=n}return r.to}const hr=s.foldService.of(((e,t,r)=>{for(let n=(0,s.syntaxTree)(e).resolveInner(r,-1);n&&!(n.from<t);n=n.parent){let e=n.type.prop(ur)
if(null==e)continue
let t=pr(n,e)
if(t>r)return{from:r,to:t}}return null}))
function fr(e){return new s.Language(Or,e,[hr],"markdown")}const mr=fr(cr),gr=fr(cr.configure([Ve,qe,Ee,Re,{props:[s.foldNodeProp.add({Table:(e,t)=>({from:t.doc.lineAt(e.from).to,to:e.to})})]}]))
class Sr{constructor(e,t,r,n,a,l,s){this.node=e,this.from=t,this.to=r,this.spaceBefore=n,this.spaceAfter=a,this.type=l,this.item=s}blank(e,t=!0){let r=this.spaceBefore+("Blockquote"==this.node.name?">":"")
if(null!=e){for(;r.length<e;)r+=" "
return r}for(let n=this.to-this.from-r.length-this.spaceAfter.length;n>0;n--)r+=" "
return r+(t?this.spaceAfter:"")}marker(e,t){let r="OrderedList"==this.node.name?String(+kr(this.item,e)[2]+t):""
return this.spaceBefore+r+this.type+this.spaceAfter}}function br(e,t){let r=[],n=[]
for(let a=e;a;a=a.parent){if("FencedCode"==a.name)return n
"ListItem"!=a.name&&"Blockquote"!=a.name||r.push(a)}for(let a=r.length-1;a>=0;a--){let e,l=r[a],s=t.lineAt(l.from),o=l.from-s.from
if("Blockquote"==l.name&&(e=/^ *>( ?)/.exec(s.text.slice(o))))n.push(new Sr(l,o,o+e[0].length,"",e[1],">",null))
else if("ListItem"==l.name&&"OrderedList"==l.parent.name&&(e=/^( *)\d+([.)])( *)/.exec(s.text.slice(o)))){let t=e[3],r=e[0].length
t.length>=4&&(t=t.slice(0,t.length-4),r-=4),n.push(new Sr(l.parent,o,o+r,e[1],t,e[2],l))}else if("ListItem"==l.name&&"BulletList"==l.parent.name&&(e=/^( *)([-+*])( {1,4}\[[ xX]\])?( +)/.exec(s.text.slice(o)))){let t=e[4],r=e[0].length
t.length>4&&(t=t.slice(0,t.length-4),r-=4)
let a=e[2]
e[3]&&(a+=e[3].replace(/[xX]/," ")),n.push(new Sr(l.parent,o,o+r,e[1],t,a,l))}}return n}function kr(e,t){return/^(\s*)(\d+)(?=[.)])/.exec(t.sliceString(e.from,e.from+10))}function xr(e,t,r,n=0){for(let a=-1,l=e;;){if("ListItem"==l.name){let e=kr(l,t),s=+e[2]
if(a>=0){if(s!=a+1)return
r.push({from:l.from+e[1].length,to:l.from+e[0].length,insert:String(a+2+n)})}a=s}let e=l.nextSibling
if(!e)break
l=e}}function yr(e,t){let r=/^[ \t]*/.exec(e)[0].length
if(!r||"\t"!=t.facet(s.indentUnit))return e
let n=""
for(let l=(0,a.countColumn)(e,4,r);l>0;)l>=4?(n+="\t",l-=4):(n+=" ",l--)
return n+e.slice(r)}const Qr=({state:e,dispatch:t})=>{let r=(0,s.syntaxTree)(e),{doc:n}=e,l=null,o=e.changeByRange((t=>{if(!t.empty||!gr.isActiveAt(e,t.from,-1)&&!gr.isActiveAt(e,t.from,1))return l={range:t}
let s=t.from,o=n.lineAt(s),i=br(r.resolveInner(s,-1),n)
for(;i.length&&i[i.length-1].from>s-o.from;)i.pop()
if(!i.length)return l={range:t}
let O=i[i.length-1]
if(O.to-O.spaceAfter.length>s-o.from)return l={range:t}
let u=s>=O.to-O.spaceAfter.length&&!/\S/.test(o.text.slice(O.to))
if(O.item&&u){let t=O.node.firstChild,r=O.node.getChild("ListItem","ListItem")
if(t.to>=s||r&&r.to<s||o.from>0&&!/[^\s>]/.test(n.lineAt(o.from-1).text)){let e,t=i.length>1?i[i.length-2]:null,r=""
t&&t.item?(e=o.from+t.from,r=t.marker(n,1)):e=o.from+(t?t.to:0)
let l=[{from:e,to:s,insert:r}]
return"OrderedList"==O.node.name&&xr(O.item,n,l,-2),t&&"OrderedList"==t.node.name&&xr(t.item,n,l),{range:a.EditorSelection.cursor(e+r.length),changes:l}}{let t=wr(i,e,o)
return{range:a.EditorSelection.cursor(s+t.length+1),changes:{from:o.from,insert:t+e.lineBreak}}}}if("Blockquote"==O.node.name&&u&&o.from){let r=n.lineAt(o.from-1),a=/>\s*$/.exec(r.text)
if(a&&a.index==O.from){let n=e.changes([{from:r.from+a.index,to:r.to},{from:o.from+O.from,to:o.to}])
return{range:t.map(n),changes:n}}}let c=[]
"OrderedList"==O.node.name&&xr(O.item,n,c)
let d=O.item&&O.item.from<o.from,p=""
if(!d||/^[\s\d.)\-+*>]*/.exec(o.text)[0].length>=O.to)for(let e=0,r=i.length-1;e<=r;e++)p+=e!=r||d?i[e].blank(e<r?(0,a.countColumn)(o.text,4,i[e+1].from)-p.length:null):i[e].marker(n,1)
let h=s
for(;h>o.from&&/\s/.test(o.text.charAt(h-o.from-1));)h--
return p=yr(p,e),function(e,t){if("OrderedList"!=e.name&&"BulletList"!=e.name)return!1
let r=e.firstChild,n=e.getChild("ListItem","ListItem")
if(!n)return!1
let a=t.lineAt(r.to),l=t.lineAt(n.from),s=/^[\s>]*$/.test(a.text)
return a.number+(s?0:1)<l.number}(O.node,e.doc)&&(p=wr(i,e,o)+e.lineBreak+p),c.push({from:h,to:s,insert:e.lineBreak+p}),{range:a.EditorSelection.cursor(h+p.length+1),changes:c}}))
return!l&&(t(e.update(o,{scrollIntoView:!0,userEvent:"input"})),!0)}
function Pr(e){return"QuoteMark"==e.name||"ListMark"==e.name}function wr(e,t,r){let n=""
for(let l=0,s=e.length-2;l<=s;l++)n+=e[l].blank(l<s?(0,a.countColumn)(r.text,4,e[l+1].from)-n.length:null,l<s)
return yr(n,t)}const $r=({state:e,dispatch:t})=>{let r=(0,s.syntaxTree)(e),n=null,l=e.changeByRange((t=>{let l=t.from,{doc:s}=e
if(t.empty&&gr.isActiveAt(e,t.from)){let t=s.lineAt(l),n=br(function(e,t){let r=e.resolveInner(t,-1),n=t
Pr(r)&&(n=r.from,r=r.parent)
for(let a;a=r.childBefore(n);)if(Pr(a))n=a.from
else{if("OrderedList"!=a.name&&"BulletList"!=a.name)break
r=a.lastChild,n=r.to}return r}(r,l),s)
if(n.length){let r=n[n.length-1],s=r.to-r.spaceAfter.length+(r.spaceAfter?1:0)
if(l-t.from>s&&!/\S/.test(t.text.slice(s,l-t.from)))return{range:a.EditorSelection.cursor(t.from+s),changes:{from:t.from+s,to:l}}
if(l-t.from==s&&(!r.item||t.from<=r.item.from||!/\S/.test(t.text.slice(0,r.to)))){let n=t.from+r.from
if(r.item&&r.node.from<r.item.from&&/\S/.test(t.text.slice(r.from,r.to))){let l=r.blank((0,a.countColumn)(t.text,4,r.to)-(0,a.countColumn)(t.text,4,r.from))
return n==t.from&&(l=yr(l,e)),{range:a.EditorSelection.cursor(n+l.length),changes:{from:n,to:t.from+r.to,insert:l}}}if(n<l)return{range:a.EditorSelection.cursor(n),changes:{from:n,to:l}}}}}return n={range:t}}))
return!n&&(t(e.update(l,{scrollIntoView:!0,userEvent:"delete"})),!0)},Tr=[{key:"Enter",run:Qr},{key:"Backspace",run:$r}],vr=function(e={}){let t,r=""
!1===e.matchClosingTags&&(r="noMatch"),!0===e.selfClosingTags&&(r=(r?r+" ":"")+"selfClosing"),(e.nestedLanguages&&e.nestedLanguages.length||e.nestedAttributes&&e.nestedAttributes.length)&&(t=ut((e.nestedLanguages||[]).concat(nr),(e.nestedAttributes||[]).concat(ar)))
let n=t?lr.configure({wrap:t,dialect:r}):r?sr.configure({dialect:r}):sr
return new s.LanguageSupport(n,[sr.data.of({autocomplete:tr(e)}),!1!==e.autoCloseTags?ir:[],(0,qt.javascript)().support,new s.LanguageSupport(Et,Et.data.of({autocomplete:Lt})).support])}({matchClosingTags:!1})
function Xr(e={}){let{codeLanguages:t,defaultCodeLanguage:r,addKeymap:o=!0,base:{parser:O}=mr,completeHTMLTags:u=!0,htmlTagLanguage:c=vr}=e
if(!(O instanceof I))throw new RangeError("Base parser provided to `markdown` should be a Markdown parser")
let d,p=e.extensions?[e.extensions]:[],h=[c.support]
r instanceof s.LanguageSupport?(h.push(r.support),d=r.language):r&&(d=r)
let f=t||d?(m=t,g=d,e=>{if(e&&m){let t=null
if(e=/\S*/.exec(e)[0],t="function"==typeof m?m(e):s.LanguageDescription.matchLanguageName(m,e,!0),t instanceof s.LanguageDescription)return t.support?t.support.language.parser:s.ParseContext.getSkippingParser(t.load())
if(t)return t.parser}return g?g.parser:null}):void 0
var m,g
p.push(function(e){let{codeParser:t,htmlParser:r}=e,a=(0,i.$g)(((e,a)=>{let l=e.type.id
if(!t||l!=n.CodeBlock&&l!=n.FencedCode){if(r&&(l==n.HTMLBlock||l==n.HTMLTag))return{parser:r,overlay:me(e.node,e.from,e.to)}}else{let r=""
if(l==n.FencedCode){let t=e.node.getChild(n.CodeInfo)
t&&(r=a.read(t.from,t.to))}let s=t(r)
if(s)return{parser:s,overlay:e=>e.type.id==n.CodeText}}return null}))
return{wrap:a}}({codeParser:f,htmlParser:c.language.parser})),o&&h.push(a.Prec.high(l.keymap.of(Tr)))
let S=fr(O.configure(p))
return u&&h.push(S.data.of({autocomplete:Ar})),new s.LanguageSupport(S,h)}function Ar(e){let{state:t,pos:r}=e,n=/<[:\-\.\w\u00b7-\uffff]*$/.exec(t.sliceDoc(r-25,r))
if(!n)return null
let a=(0,s.syntaxTree)(t).resolveInner(r,-1)
for(;a&&!a.type.isTop;){if("CodeBlock"==a.name||"FencedCode"==a.name||"ProcessingInstructionBlock"==a.name||"CommentBlock"==a.name||"Link"==a.name||"Image"==a.name)return null
a=a.parent}return{from:r-n[0].length,to:r,options:_r(),validFor:/^<[:\-\.\w\u00b7-\uffff]*$/}}let Cr=null
function _r(){if(Cr)return Cr
let e=(t=new o._5(a.EditorState.create({extensions:vr}),0,!0),er(Nt.default,t))
var t
return Cr=e?e.options:[]}}}])
