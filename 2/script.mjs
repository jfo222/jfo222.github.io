import e from"./config.json"with{type:"json"};(()=>{let t,n,o,s,c,[r,a,i]=[0,0,0],[l,u,d]=[e.limitMin,0,0];let m={block:[],bool:0},f={block:[],bool:0},p=new AudioContext,v={circle:0,count:0,mode:0,sum:0},[b,h]=[document.body,document.head],g=window.speechSynthesis,$=async()=>{c=await navigator.wakeLock.request("screen")};function k(e,t=b){return t.querySelector(e)}function w(e,t){let n=document.createElement(e);return t&&t.append(n),n}function L(e){let t=w("div",b);t.className="error",t.textContent=`[${o.error[e]}]`}function y(t){if(!e.sound)return;let n=Object.assign({gain:.2,ramp:1,start:0,wave:"sine"},t),o=new OscillatorNode(p,{frequency:n.freq,type:n.wave}),s=new GainNode(p,{gain:n.gain});s.gain.setValueAtTime(n.gain,p.currentTime+n.start+.01),n.ramp&&s.gain.exponentialRampToValueAtTime(1e-4,p.currentTime+n.stop),o.connect(s).connect(p.destination),o.start(p.currentTime+n.start),o.stop(p.currentTime+n.stop)}function N(){let[e,t]=[0,13];for(;t<68;)y({freq:1600,start:e/100,stop:t/100}),e+=9,t+=9}function C(e,t=1){if(!g)return;let n=new SpeechSynthesisUtterance(e);n.lang=navigator.language,n.rate=1.1,n.volume=t,g.speak(n)}function E(e,t,n){let o;n&&(e.textContent=n),e.addEventListener("pointerdown",(()=>{y({freq:540,stop:.1}),e.classList.add("active"),o=1,document.addEventListener("pointerup",(()=>{e.classList.remove("active"),o=0}),{once:1})})),e.addEventListener("pointerup",(()=>{o&&(e.classList.remove("active"),o=0,t(e))}))}function x(){d=e.base+l}function T(){let n=k("#tmpl-0",h).content,o={KeyA(){A(f.bool,1)},KeyB(){b.className||(e.buttons=!e.buttons,S())},KeyL(){e.sound&&A(m.bool,2)},Space(){v.circle?K():s()}};function s(){b.className?(D(),b.removeEventListener("mousemove",O),clearTimeout(t),b.className="",q()):K()}E(k(".center",n),s),x(),b.style.setProperty("--time",e.timeStimulus/1e3+"s"),[v.mode,v.count]=[0,0],document.addEventListener("keydown",(e=>{!e.repeat&&Object.hasOwn(o,e.code)&&o[e.code]()})),b.append(n),q(),g||L(1)}function M(){[...b.childNodes].forEach((e=>{"grid"!==e.className&&e.remove()}))}function q(){let t=k("#tmpl-1",h).content.cloneNode(1);function n(t){return t&&(l>=e.limitMax?l=e.limitMin:l+=1,x()),`${o.ctrl[0]} ${l}`}function s(t){return t&&(e.sound=!e.sound),e.sound?"🔊":"🔇"}function c(t){return t&&(v.mode=!v.mode),`${o.ctrl[1]} ${v.mode?e.blocks:1}`}M(),E(k(".n",t),(e=>{e.textContent=n(1)}),n()),E(k(".speaker",t),(e=>{e.textContent=s(1)}),s()),E(k(".x",t),(e=>{e.textContent=c(1)}),c()),E(k(".help",t),(e=>{e.firstChild.nodeValue?(e.firstChild.replaceWith(w("ol")),Object.values(o.ol).forEach((t=>{w("li",e.firstChild).textContent=t}))):e.textContent="?"}),"?"),E(k(".screen",t),(()=>{document.fullscreenElement?document.exitFullscreen():b.parentNode.requestFullscreen()})),document.fullscreenEnabled||(k(".screen",t).className="none"),[v.count,v.sum]=[0,0],b.append(t)}function j(t,o){let[c,r,a,i]=[0,0,"",[]];let u=new Array(d),m=()=>t[Math.floor(Math.random()*t.length)];for(o?i=s.splice(0,e.overlap):n=[...new Array(e.base).keys()].map((e=>l+e));i.length<e.targets;)i.push(n.splice(Math.floor(Math.random()*n.length),1)[0]);for(s=i,i.sort(((e,t)=>e-t));c<e.targets;){for(r=i[c],a=m();a===u[r-2*l];)a=m();u[r-l]&&(a=u[r-l]),[u[r-l],u[r]]=[a,a],c+=1}for(c=0;c<d;){for(;!u[c];)a=m(),a!==u[c-l]&&a!==u[c+l]&&(u[c]=a);c+=1}return u}function A(e,t){A.fired&&!A.fired[t]&&(e?A[t][0]+=1:A[t][1]+=1,A.fired[t]=1)}function S(){let t=k("#tmpl-2",h).content.cloneNode(1),n=[...k(".btns",t).children];if(k("div.btns")?.remove(),b.className&&!v.circle&&(E(n[0],(()=>A(f.bool,1)),o.btns[0]),E(n[1],(()=>A(m.bool,2)),o.btns[1]),e.sound||(n[1].className="none"),b.append(t)),!b.className){let t=w("div",b);t.className="btns btns-toggle",t.textContent=`${o.btns[2]}${e.buttons?o.btns[3]:o.btns[4]}`}}function O(e){b.classList.remove("no-cursor"),clearTimeout(t),e.target===b&&(t=setTimeout((()=>b.classList.add("no-cursor")),1200))}function D(){clearTimeout(a),clearInterval(i),[...k(".grid").children].forEach((e=>e.classList.remove("visual"))),g?.cancel(),c?.release()}function F(){function t(){if(r===d)return D(),void U();let t=f.block[r],n=m.block[r],o=k(t);f.bool=t===f.block[r-l],m.bool=n===m.block[r-l],A.fired={1:0,2:0},r+=1,document.hidden||(requestAnimationFrame((()=>{o.classList.add("visual"),e.sound&&C(n)})),o.addEventListener("animationend",(()=>{o.classList.remove("visual")}),{once:1}))}a=setTimeout((()=>{t(),i=setInterval(t,e.timeRate)}),2100)}function K(){M(),[A[1],A[2],r,v.circle]=[[0,0],[0,0],0,0],delete A.fired,b.className="task",e.buttons?S():(b.classList.add("no-cursor"),b.addEventListener("mousemove",O)),u=e.sound?2*e.targets:e.targets,l+u-(e.overlapCtrl?e.overlap:0)>d?L(0):(f.block=j([".s-1",".s-2",".s-3",".s-4",".s-5",".s-6",".s-7",".s-8"]),m.block=j(o.aural,e.overlapCtrl),C(" ",0),$(),F())}function U(){let t=k("#tmpl-3",h).content.cloneNode(1),[n,s,c,r]=[A[1][0],A[1][1],A[2][0],A[2][1]],a=n+c-(s+r),i=[`${o.res[0]}: ${a>0?Math.round(a/u*100):0}%`];if(v.mode){if(v.count+=1,v.sum+=l,v.count!==e.blocks){let o=k(".circle",t),[a,i]=[e.targets-n+s,e.targets-c+r];a<e.autoUp&&(!e.sound||i<e.autoUp)?l+=1:l>e.limitMin&&(a>e.autoDown||i>e.autoDown)&&(l-=1),x(),k(".btns")?.remove(),E(o,K),o.classList.remove("none"),v.circle=1}i.push(`${o.res[1]}: ${v.count} / ${e.blocks}`,`${v.count===e.blocks?`${o.res[2]}: ${Math.round(v.sum/e.blocks)}`:`${o.res[3]}: ${l}`}${o.res[4]}`)}else i.push(`${o.res[5]}: ${n+c} / ${u}`,`${o.res[6]}: ${s+r}`);i.forEach(((e,n)=>{t.children[0].children[n].textContent=e})),document.hidden||N(),b.append(t)}document.addEventListener("touchstart",(e=>{e.preventDefault()}),{passive:0}),(async e=>{let t=await fetch(e);o=await t.json()})(`./lang/${e.lang||["en","zh"].find((e=>e===navigator.language.slice(0,2)))||"en"}.json`).then((()=>T()))})();
