(() => {
  const D=window.PRACTICE_DATA, $=id=>document.getElementById(id);
  const exercises=[];
  (D.sections||[]).forEach(s=>(s.exercises||[]).forEach(e=>{
    if([5,6,7].includes(Number(e.part))) exercises.push({...e,_section:s.label});
  }));
  if(!exercises.length) throw new Error("Unit này chưa có dữ liệu Reading Part 5–7.");

  const base=D.storageKey||"practice-reading";
  const K={a:`${base}-reading-answers`,c:`${base}-reading-checked`,m:`${base}-reading-marked`};
  const load=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}};
  let answers=load(K.a,{}), checked=new Set(load(K.c,[])), marked=new Set(load(K.m,[]));

  const parts=[...new Set(exercises.map(e=>Number(e.part)))].sort((a,b)=>a-b);
  let part=parts[0], exIndex=0, itemIndex=0, focus=null, currentEx=null, currentItem=null;

  $("unitTitle").textContent=D.title||"Practice Unit";
  $("paletteKicker").textContent=(D.title||"Practice Unit").toUpperCase();
  document.title=`${D.title||"Practice Unit"} · TOEIC Reading Practice`;

  const exs=p=>exercises.filter(e=>Number(e.part)===Number(p));
  const nq=(q,i=0)=>({...q,n:q.number??q.n??i+1});
  function items(e){
    if(Number(e.part)===5) return (e.questions||[]).map((q,i)=>({id:`${e.id}-q-${q.number??i+1}`,questions:[nq(q,i)]}));
    return (e.sets||[]).map((s,i)=>({...s,id:s.id||`${e.id}-set-${i+1}`,questions:(s.questions||[]).map(nq)}));
  }
  const all=[];
  exercises.forEach(e=>items(e).forEach(it=>it.questions.forEach(q=>all.push({e,it,q}))));

  const answered=q=>Object.prototype.hasOwnProperty.call(answers,q.n);
  const done=it=>it.questions.every(answered);
  const isChecked=it=>Number(currentEx?.part)===5 ? done(it) : checked.has(it.id);
  const qChecked=(q,it,e)=>Number(e.part)===5 ? answered(q) : checked.has(it.id);
  const correct=(q,it,e)=>qChecked(q,it,e)&&answers[q.n]===q.answer;
  const wrong=(q,it,e)=>qChecked(q,it,e)&&answers[q.n]!==q.answer;
  const esc=s=>String(s??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));

  function save(){
    localStorage.setItem(K.a,JSON.stringify(answers));
    localStorage.setItem(K.c,JSON.stringify([...checked]));
    localStorage.setItem(K.m,JSON.stringify([...marked]));
    progress(); palette();
  }

  function partTabs(){
    $("partTabs").innerHTML="";
    parts.forEach(p=>{const b=document.createElement("button");b.textContent=`Part ${p}`;b.classList.toggle("active",p===part);
      b.onclick=()=>{part=p;exIndex=0;itemIndex=0;focus=null;render()};$("partTabs").appendChild(b)});
  }
  function exerciseTabs(){
    $("exerciseTabs").innerHTML="";
    exs(part).forEach((e,i)=>{const b=document.createElement("button");b.textContent=e.label||`Exercise ${i+1}`;b.classList.toggle("active",i===exIndex);
      b.onclick=()=>{exIndex=i;itemIndex=0;focus=null;render()};$("exerciseTabs").appendChild(b)});
  }

  function render(){
    currentEx=exs(part)[exIndex]||exs(part)[0];
    const list=items(currentEx);
    if(itemIndex>=list.length)itemIndex=0;
    currentItem=list[itemIndex];
    focus=currentItem.questions.some(q=>q.n===focus)?focus:currentItem.questions[0].n;
    $("partBadge").textContent=`Part ${part}`;
    $("groupLabel").textContent=`${currentEx.label||`Exercise ${exIndex+1}`} · ${part===5?`Question ${focus}`:`Questions ${currentItem.questions[0].n}–${currentItem.questions.at(-1).n}`}`;
    partTabs();exerciseTabs();passage();questions();dots();palette();
    $("prevBtn").disabled=itemIndex===0&&exIndex===0&&parts.indexOf(part)===0;
    scrollTo({top:0,behavior:"smooth"});
  }

  function passage(){
    const panel=$("passagePanel");
    if(part===5){panel.classList.add("hidden");$("mainLayout").classList.add("single");return}
    panel.classList.remove("hidden");$("mainLayout").classList.remove("single");
    $("passageHtml").innerHTML=currentItem.passageHtml||"<p>Passage unavailable.</p>";
  }

  function questions(){
    const area=$("questionArea");area.innerHTML="";
    const groupChecked=part===5?done(currentItem):checked.has(currentItem.id);
    currentItem.questions.forEach(q=>{
      const card=document.createElement("div");card.className="question-card";if(q.n===focus)card.classList.add("focused");
      const top=document.createElement("div");top.className="q-title-row";
      const title=document.createElement("div");title.className="q-title";title.textContent=q.prompt?`${q.n}. ${q.prompt}`:`${q.n}. Select the best answer.`;
      const star=document.createElement("button");star.className=`mark-btn ${marked.has(q.n)?"marked":""}`;star.textContent=marked.has(q.n)?"★":"☆";
      star.onclick=()=>{marked.has(q.n)?marked.delete(q.n):marked.add(q.n);focus=q.n;save();questions()};
      top.append(title,star);card.appendChild(top);
      const choices=document.createElement("div");choices.className="choices";
      (q.choices||[]).forEach((c,i)=>{
        const b=document.createElement("button");b.className="choice";
        if(!groupChecked&&answers[q.n]===i)b.classList.add("selected");
        if(groupChecked){b.classList.add("locked");if(i===q.answer)b.classList.add("correct");if(i===answers[q.n]&&i!==q.answer)b.classList.add("wrong")}
        b.innerHTML=`<span class="radio"></span><span><b>(${String.fromCharCode(65+i)})</b> ${esc(c)}</span>`;
        b.onclick=()=>choose(q,i);choices.appendChild(b)
      });
      card.appendChild(choices);
      if(groupChecked&&q.explanation){
        const e=document.createElement("div");e.className="explanation";e.innerHTML=`<b>Explanation:</b> ${esc(q.explanation)}`;card.appendChild(e)
      }
      area.appendChild(card)
    });
    if(part>=6&&!groupChecked){
      const wrap=document.createElement("div");wrap.className="check-wrap";const b=document.createElement("button");b.className="check-btn";
      b.disabled=!done(currentItem);b.textContent=done(currentItem)?"Check":`Chọn đủ ${currentItem.questions.length} câu để Check`;
      b.onclick=()=>{if(done(currentItem)){checked.add(currentItem.id);save();questions();dots()}};
      wrap.appendChild(b);area.appendChild(wrap)
    }
  }

  function choose(q,i){
    const gc=part===5?done(currentItem):checked.has(currentItem.id);
    if(gc)return; answers[q.n]=i;focus=q.n;
    if(part===5)checked.add(currentItem.id);
    save();questions();dots()
  }

  function dots(){
    $("dots").innerHTML="";
    items(currentEx).forEach((it,i)=>{const d=document.createElement("span");d.className="dot";if(i===itemIndex)d.classList.add("active");
      const c=part===5?done(it):checked.has(it.id);if(c)d.classList.add("done");$("dots").appendChild(d)})
  }

  function progress(){
    const n=Object.keys(answers).length,t=all.length;$("progressText").textContent=`${n} / ${t} answered`;
    $("progressBar").style.width=`${t?n/t*100:0}%`
  }

  function palette(){
    let c=0,w=0;all.forEach(x=>{if(correct(x.q,x.it,x.e))c++;else if(wrong(x.q,x.it,x.e))w++});
    $("correctCount").textContent=c;$("wrongCount").textContent=w;$("todoCount").textContent=all.length-c-w;
    const box=$("paletteSections");box.innerHTML="";
    parts.forEach(p=>{
      const sec=document.createElement("section");sec.className="palette-section";sec.innerHTML=`<h3>Part ${p}</h3>`;
      exs(p).forEach((e,ei)=>{
        const lab=document.createElement("div");lab.className="palette-exercise";lab.textContent=e.label||`Exercise ${ei+1}`;sec.appendChild(lab);
        const grid=document.createElement("div");grid.className="palette-grid";
        items(e).forEach((it,ii)=>it.questions.forEach(q=>{
          const b=document.createElement("button");b.className="palette-tile";b.textContent=q.n;
          if(correct(q,it,e))b.classList.add("correct");else if(wrong(q,it,e))b.classList.add("wrong");else b.classList.add("todo");
          if(marked.has(q.n))b.classList.add("marked");
          if(part===p&&exIndex===ei&&itemIndex===ii&&focus===q.n)b.classList.add("current");
          b.onclick=()=>{part=p;exIndex=ei;itemIndex=ii;focus=q.n;closePalette();render()};grid.appendChild(b)
        }));sec.appendChild(grid)
      });box.appendChild(sec)
    })
  }

  function move(dir){
    const es=exs(part), list=items(currentEx);
    if(dir>0){
      if(itemIndex<list.length-1)itemIndex++;
      else if(exIndex<es.length-1){exIndex++;itemIndex=0}
      else {const pi=parts.indexOf(part);if(pi<parts.length-1){part=parts[pi+1];exIndex=0;itemIndex=0}else return}
    } else {
      if(itemIndex>0)itemIndex--;
      else if(exIndex>0){exIndex--;itemIndex=items(es[exIndex]).length-1}
      else {const pi=parts.indexOf(part);if(pi>0){part=parts[pi-1];const pe=exs(part);exIndex=pe.length-1;itemIndex=items(pe[exIndex]).length-1}else return}
    }
    focus=null;render()
  }

  $("prevBtn").onclick=()=>move(-1);$("nextBtn").onclick=()=>move(1);
  const openPalette=()=>{$("paletteOverlay").classList.remove("hidden");palette()};
  const closePalette=()=>$("paletteOverlay").classList.add("hidden");
  $("paletteBtn").onclick=openPalette;$("paletteClose").onclick=closePalette;
  $("paletteOverlay").onclick=e=>{if(e.target===$("paletteOverlay"))closePalette()};
  $("resetBtn").onclick=()=>{if(!confirm("Bạn có chắc muốn làm lại toàn bộ Reading Practice?"))return;
    answers={};checked=new Set();marked=new Set();Object.values(K).forEach(k=>localStorage.removeItem(k));part=parts[0];exIndex=0;itemIndex=0;focus=null;progress();render()};
  addEventListener("keydown",e=>{if(e.key==="Escape")closePalette();if(["1","2","3","4"].includes(e.key)){const q=currentItem?.questions.find(x=>!answered(x));if(q)choose(q,Number(e.key)-1)}});
  progress();render();
})();