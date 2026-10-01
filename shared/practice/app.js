(()=>{
const D=window.PRACTICE_DATA,$=id=>document.getElementById(id), audio=$("audio"),canvas=$("waveform"),ctx=canvas.getContext("2d");
const exercises=[];(D.sections||[]).forEach(s=>(s.exercises||[]).forEach(e=>exercises.push({...e,_section:s.label})));
if(!exercises.length)throw new Error("Unit chưa có Exercise.");
const parts=[...new Set(exercises.map(e=>+e.part))].sort((a,b)=>a-b);
const base=D.storageKey||"toeic-practice",K={a:base+"-answers",c:base+"-checked",m:base+"-marked",w:base+"-p7-width"};
const load=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}};
let answers=load(K.a,{}),checked=new Set(load(K.c,[])),marked=new Set(load(K.m,[])),p7width=+localStorage.getItem(K.w)||52;
let part=parts[0],exIndex=0,itemIndex=0,focus=null,currentEx,currentItem,speedIndex=1;const speeds=[.75,1,1.25];
$("unitTitle").textContent=D.title||"Practice Unit";$("paletteKicker").textContent=(D.title||"Practice Unit").toUpperCase();

const exs=p=>exercises.filter(e=>+e.part===+p), nq=(q,i=0)=>({...q,n:q.number??q.n??i+1});
function items(e){
 const p=+e.part;
 if(p===5) return [{id:(e.id||"p5")+"-all",questions:(e.questions||[]).map(nq),wholeExercise:true}];
 if([1,2].includes(p)) return (e.questions||[]).map((q,i)=>({id:`${e.id||"ex"}-q-${q.number??i+1}`,start:q.start,end:q.end,image:q.image,graphic:q.graphic,script:q.script,questions:[nq(q,i)]}));
 if((e.sets||[]).length) return e.sets.map((s,i)=>({...s,id:s.id||`${e.id||"ex"}-set-${i+1}`,questions:(s.questions||[]).map(nq)}));
 return [{id:(e.id||"ex")+"-set",passageHtml:e.passageHtml,script:e.script,questions:(e.questions||[]).map(nq)}];
}
const all=[];exercises.forEach(e=>items(e).forEach(it=>it.questions.forEach(q=>all.push({e,it,q}))));
const answered=q=>Object.prototype.hasOwnProperty.call(answers,q.n);
const itemDone=it=>it.questions.every(answered);
const qChecked=(q,it,e)=>[1,2,5].includes(+e.part)?answered(q):checked.has(it.id);
const correct=(q,it,e)=>qChecked(q,it,e)&&answers[q.n]===q.answer, wrong=(q,it,e)=>qChecked(q,it,e)&&answers[q.n]!==q.answer;
const esc=s=>String(s??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
function save(){localStorage.setItem(K.a,JSON.stringify(answers));localStorage.setItem(K.c,JSON.stringify([...checked]));localStorage.setItem(K.m,JSON.stringify([...marked]));progress();palette()}
function tabs(){
 $("partTabs").innerHTML="";parts.forEach(p=>{let b=document.createElement("button");b.textContent=`Part ${p}`;b.classList.toggle("active",p===part);b.onclick=()=>{part=p;exIndex=0;itemIndex=0;focus=null;render()};$("partTabs").appendChild(b)});
 $("exerciseTabs").innerHTML="";exs(part).forEach((e,i)=>{let b=document.createElement("button");b.textContent=e.label||`Exercise ${i+1}`;b.classList.toggle("active",i===exIndex);b.onclick=()=>{exIndex=i;itemIndex=0;focus=null;render()};$("exerciseTabs").appendChild(b)})
}
function render(){
 currentEx=exs(part)[exIndex]||exs(part)[0];const list=items(currentEx);if(itemIndex>=list.length)itemIndex=0;currentItem=list[itemIndex];
 focus=currentItem.questions.some(q=>q.n===focus)?focus:currentItem.questions[0]?.n;
 $("partBadge").textContent=`Part ${part}`;$("groupLabel").textContent=currentEx.label||`Exercise ${exIndex+1}`;
 tabs();layoutMode();source();questions();dots();palette();
 $("prevBtn").disabled=itemIndex===0&&exIndex===0&&parts.indexOf(part)===0;
 if(part!==5)window.scrollTo({top:0,behavior:"smooth"});
}
function layoutMode(){
 const m=$("mainLayout"),sp=$("splitter"),src=$("sourcePanel"),nav=$("navRow");
 m.className="layout";sp.classList.add("hidden");src.classList.remove("hidden");nav.classList.remove("hidden");
 if(part===5){m.classList.add("part5");src.classList.add("hidden")}
 else if(part===7){m.classList.add("part7");sp.classList.remove("hidden");m.style.setProperty("--left",p7width+"%")}
 else m.style.removeProperty("--left");
}
function source(){
 $("visualWrap").innerHTML="";$("passageWrap").classList.add("hidden");$("audioCard").classList.add("hidden");$("scriptBox").classList.add("hidden");
 if(part<=4){
   $("audioCard").classList.remove("hidden");
   const src=currentItem.image||currentItem.graphic;if(src){const im=document.createElement("img");im.src=src;im.alt="TOEIC visual";$("visualWrap").appendChild(im)}
   if(currentEx.audio&&audio.getAttribute("src")!==currentEx.audio)audio.src=currentEx.audio;
   const b=bounds();if(audio.readyState>=1)audio.currentTime=b.start;$("duration").textContent=fmt(Math.max(0,b.end-b.start));drawWave();
   if(([1,2].includes(part)&&currentItem.questions.every(answered))||([3,4].includes(part)&&checked.has(currentItem.id)))showScript();
 } else if([6,7].includes(part)){
   $("passageWrap").classList.remove("hidden");$("passageHtml").innerHTML=currentItem.passageHtml||currentEx.passageHtml||"<p>Passage unavailable.</p>";
 }
}
function questions(){
 const area=$("questionArea");area.innerHTML="";
 currentItem.questions.forEach(q=>{
   const qc=qChecked(q,currentItem,currentEx),card=document.createElement("div");card.className="question-card";card.id="q-"+q.n;if(q.n===focus)card.classList.add("focused");
   const top=document.createElement("div");top.className="q-title-row";
   const title=document.createElement("div");title.className="q-title";
   title.textContent=q.prompt?`${q.n}. ${q.prompt}`:`${q.n}. Select the best answer.`;
   const star=document.createElement("button");star.className=`mark-btn ${marked.has(q.n)?"marked":""}`;star.textContent=marked.has(q.n)?"★":"☆";star.onclick=()=>{marked.has(q.n)?marked.delete(q.n):marked.add(q.n);focus=q.n;save();questions()};
   top.append(title,star);card.appendChild(top);
   const choices=document.createElement("div");choices.className="choices";
   (q.choices||[]).forEach((c,i)=>{const b=document.createElement("button");b.className="choice";
     if(!qc&&answers[q.n]===i)b.classList.add("selected");
     if(qc){b.classList.add("locked");if(i===q.answer)b.classList.add("correct");if(i===answers[q.n]&&i!==q.answer)b.classList.add("wrong")}
     const hide=[1,2].includes(part)&&!qc;
     b.innerHTML=`<span class="radio"></span><span class="${hide?"hidden-choice":""}"><b>(${String.fromCharCode(65+i)})</b>${hide?"":" "+esc(c)}</span>`;
     b.onclick=()=>choose(q,i);choices.appendChild(b)});
   card.appendChild(choices);
   if(qc&&q.explanation){let e=document.createElement("div");e.className="explanation";e.innerHTML=`<b>Explanation:</b> ${esc(q.explanation)}`;card.appendChild(e)}
   area.appendChild(card)
 });
 if([3,4,6,7].includes(part)&&!checked.has(currentItem.id)){
   const w=document.createElement("div");w.className="check-wrap";const b=document.createElement("button");b.className="check-btn";b.disabled=!itemDone(currentItem);b.textContent=itemDone(currentItem)?"Check":`Chọn đủ ${currentItem.questions.length} câu để Check`;
   b.onclick=()=>{if(itemDone(currentItem)){checked.add(currentItem.id);save();questions();source();dots()}};w.appendChild(b);area.appendChild(w)
 }
}
function choose(q,i){
 if(qChecked(q,currentItem,currentEx))return;answers[q.n]=i;focus=q.n;
 // Parts 1,2,5 check immediately. Parts 3,4,6,7 wait for Check.
 save();questions();if([1,2].includes(part))source();dots()
}
function showScript(){
 const s=currentItem.script||currentEx.script;if(!s)return;$("scriptBox").classList.remove("hidden");$("scriptLines").innerHTML=(Array.isArray(s)?s:[s]).map(x=>`<div class="script-line">${esc(x)}</div>`).join("")
}
function dots(){
 $("dots").innerHTML="";if(part===5)return;
 items(currentEx).forEach((it,i)=>{let d=document.createElement("span");d.className="dot";if(i===itemIndex)d.classList.add("active");let done=[1,2].includes(part)?it.questions.every(answered):checked.has(it.id);if(done)d.classList.add("done");$("dots").appendChild(d)})
}
function progress(){const n=Object.keys(answers).length,t=all.length;$("progressText").textContent=`${n} / ${t} answered`;$("progressBar").style.width=`${t?n/t*100:0}%`}
function palette(){
 let c=0,w=0;all.forEach(x=>{if(correct(x.q,x.it,x.e))c++;else if(wrong(x.q,x.it,x.e))w++});$("correctCount").textContent=c;$("wrongCount").textContent=w;$("todoCount").textContent=all.length-c-w;
 const box=$("paletteSections");box.innerHTML="";
 parts.forEach(p=>{let sec=document.createElement("section");sec.className="palette-section";sec.innerHTML=`<h3>Part ${p}</h3>`;
   exs(p).forEach((e,ei)=>{let lab=document.createElement("div");lab.className="palette-exercise";lab.textContent=e.label||`Exercise ${ei+1}`;sec.appendChild(lab);let grid=document.createElement("div");grid.className="palette-grid";
     items(e).forEach((it,ii)=>it.questions.forEach(q=>{let b=document.createElement("button");b.className="palette-tile";b.textContent=q.n;if(correct(q,it,e))b.classList.add("correct");else if(wrong(q,it,e))b.classList.add("wrong");else b.classList.add("todo");if(marked.has(q.n))b.classList.add("marked");
       b.onclick=()=>{part=p;exIndex=ei;itemIndex=ii;focus=q.n;closePalette();render();setTimeout(()=>document.getElementById("q-"+q.n)?.scrollIntoView({behavior:"smooth",block:"center"}),80)};grid.appendChild(b)}));sec.appendChild(grid)});box.appendChild(sec)})
}
function move(dir){
 const es=exs(part),list=items(currentEx);
 if(part===5){if(dir>0&&exIndex<es.length-1){exIndex++;itemIndex=0}else if(dir<0&&exIndex>0){exIndex--;itemIndex=0}else return}
 else if(dir>0){if(itemIndex<list.length-1)itemIndex++;else if(exIndex<es.length-1){exIndex++;itemIndex=0}else{let pi=parts.indexOf(part);if(pi<parts.length-1){part=parts[pi+1];exIndex=0;itemIndex=0}else return}}
 else{if(itemIndex>0)itemIndex--;else if(exIndex>0){exIndex--;itemIndex=items(es[exIndex]).length-1}else{let pi=parts.indexOf(part);if(pi>0){part=parts[pi-1];let pe=exs(part);exIndex=pe.length-1;itemIndex=items(pe[exIndex]).length-1}else return}}
 focus=null;render()
}
$("prevBtn").onclick=()=>move(-1);$("nextBtn").onclick=()=>move(1);
const openPalette=()=>{$("paletteOverlay").classList.remove("hidden");palette()},closePalette=()=>$("paletteOverlay").classList.add("hidden");
$("paletteBtn").onclick=openPalette;$("paletteClose").onclick=closePalette;$("paletteOverlay").onclick=e=>{if(e.target===$("paletteOverlay"))closePalette()};
$("resetBtn").onclick=()=>{if(!confirm("Bạn có chắc muốn làm lại toàn bộ Practice Unit?"))return;answers={};checked=new Set();marked=new Set();[K.a,K.c,K.m].forEach(k=>localStorage.removeItem(k));part=parts[0];exIndex=0;itemIndex=0;focus=null;progress();render()};

// Audio
function fmt(s){if(!isFinite(s))return"00:00";return`${String(Math.floor(s/60)).padStart(2,"0")}:${String(Math.floor(s%60)).padStart(2,"0")}`}
function bounds(){let st=+(currentItem?.start??0),en=currentItem?.end==null?(audio.duration||st):+currentItem.end;return{start:st,end:en}}
function drawWave(){if(!currentItem||part>4)return;const r=canvas.getBoundingClientRect(),w=r.width||500,h=82;ctx.clearRect(0,0,w,h);let peaks=currentItem.peaks||Array.from({length:85},(_,i)=>.18+.62*Math.abs(Math.sin(i*.71))*Math.abs(Math.cos(i*.17)));let b=bounds(),pr=Math.max(0,Math.min(1,(audio.currentTime-b.start)/Math.max(.01,b.end-b.start))),gap=3,bw=Math.max(2,(w-(peaks.length-1)*gap)/peaks.length),mid=h/2;peaks.forEach((v,i)=>{let x=i*(bw+gap),bh=Math.max(7,v*(h-12));ctx.fillStyle=i/peaks.length<=pr?"#d97706":"#d5c5b1";ctx.fillRect(x,mid-bh/2,bw,bh)})}
$("playBtn").onclick=()=>{let b=bounds();if(audio.paused){if(audio.currentTime<b.start||audio.currentTime>=b.end-.05)audio.currentTime=b.start;audio.play()}else audio.pause()};
audio.onplay=()=>$("playBtn").textContent="❚❚";audio.onpause=()=>$("playBtn").textContent="▶";
audio.onloadedmetadata=()=>{let b=bounds();$("duration").textContent=fmt(b.end-b.start);drawWave()};
audio.ontimeupdate=()=>{let b=bounds();if(audio.currentTime>=b.end){audio.pause();audio.currentTime=b.end}$("currentTime").textContent=fmt(Math.max(0,audio.currentTime-b.start));drawWave()};
$("back3").onclick=()=>{let b=bounds();audio.currentTime=Math.max(b.start,audio.currentTime-3)};$("back5").onclick=()=>{let b=bounds();audio.currentTime=Math.max(b.start,audio.currentTime-5)};
$("speedBtn").onclick=()=>{speedIndex=(speedIndex+1)%speeds.length;audio.playbackRate=speeds[speedIndex];$("speedBtn").textContent=speeds[speedIndex]+"x"};
canvas.onclick=e=>{let r=canvas.getBoundingClientRect(),b=bounds(),f=(e.clientX-r.left)/r.width;audio.currentTime=b.start+Math.max(0,Math.min(1,f))*(b.end-b.start)};

// Part 7 resizable split
let dragging=false;
$("splitter").addEventListener("mousedown",e=>{dragging=true;document.body.classList.add("resizing");e.preventDefault()});
addEventListener("mousemove",e=>{if(!dragging||part!==7)return;let r=$("mainLayout").getBoundingClientRect(),pct=(e.clientX-r.left)/r.width*100;p7width=Math.max(30,Math.min(70,pct));$("mainLayout").style.setProperty("--left",p7width+"%")});
addEventListener("mouseup",()=>{if(dragging){dragging=false;document.body.classList.remove("resizing");localStorage.setItem(K.w,p7width)}});

addEventListener("keydown",e=>{if(e.key==="Escape")closePalette();if(["1","2","3","4"].includes(e.key)&&part!==5){let q=currentItem?.questions.find(x=>!answered(x));if(q)choose(q,+e.key-1)}});
progress();render();
})();