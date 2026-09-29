(() => {
  const D = window.PRACTICE_DATA;
  if (!D || !Array.isArray(D.sections)) throw new Error("PRACTICE_DATA missing");

  const storageBase = D.storageKey || "toeic-practice";
  const STORAGE = {
    answers: `${storageBase}-answers`,
    checked: `${storageBase}-checked`,
    marked: `${storageBase}-marked`
  };

  const $ = id => document.getElementById(id);
  const audio=$("audio"), canvas=$("waveform"), ctx=canvas.getContext("2d");
  const playBtn=$("playBtn"), currentTimeEl=$("currentTime"), durationEl=$("duration");
  const questionArea=$("questionArea"), visualWrap=$("visualWrap"), scriptBox=$("scriptBox");
  const scriptLines=$("scriptLines"), explanationBox=$("explanationBox");
  const partBadge=$("partBadge"), groupLabel=$("groupLabel"), prevBtn=$("prevBtn"), nextBtn=$("nextBtn");
  const speedBtn=$("speedBtn"), progressText=$("progressText"), progressBar=$("progressBar"), itemDots=$("itemDots");
  const partTabs=$("partTabs"), exerciseTabs=$("exerciseTabs"), paletteBtn=$("paletteBtn");
  const paletteOverlay=$("paletteOverlay"), paletteClose=$("paletteClose"), paletteSections=$("paletteSections");
  const resetBtn=$("resetBtn"), correctCount=$("correctCount"), wrongCount=$("wrongCount"), todoCount=$("todoCount");

  $("unitTitleText").textContent = D.title || "Practice Unit";
  $("paletteKicker").textContent = (D.title || "PRACTICE UNIT").toUpperCase();
  document.title = `${D.title || "Practice Unit"} · TOEIC Listening Practice`;

  const loadJSON=(k,f)=>{try{return JSON.parse(localStorage.getItem(k) || JSON.stringify(f))}catch{return f}};
  let answers=loadJSON(STORAGE.answers,{});
  let checkedGroups=new Set(loadJSON(STORAGE.checked,[]));
  let marked=new Set(loadJSON(STORAGE.marked,[]));
  let speedIndex=1; const speeds=[0.75,1,1.25];

  // Flatten sections -> exercises; each exercise can contain questions (Part 1/2) or sets (Part 3/4).
  const exercises=[];
  D.sections.forEach((section,si)=>(section.exercises||[]).forEach((ex,ei)=>{
    exercises.push({...ex, _sectionLabel:section.label||`Part ${ex.part}`, _si:si, _ei:ei});
  }));
  if(!exercises.length) throw new Error("Unit chưa có Exercise.");

  const parts=[...new Set(exercises.map(x=>Number(x.part)))].sort((a,b)=>a-b);
  let part=parts[0], exerciseIndex=0, itemIndex=0, focusQuestionNumber=null, currentExercise=null, currentItem=null;

  function itemsOf(ex){
    if(Number(ex.part)<=2){
      return (ex.questions||[]).map((q,i)=>({
        id:`${ex.id||"ex"}-q-${q.number ?? q.n ?? i+1}`,
        part:Number(ex.part), label:`Question ${q.number ?? q.n ?? i+1}`,
        start:q.start ?? 0, end:q.end,
        image:q.image, graphic:q.graphic, script:q.script||[], explanation:q.explanation,
        questions:[normalizeQ(q,i)]
      }));
    }
    return (ex.sets||[]).map((s,i)=>({
      ...s, id:s.id||`${ex.id||"ex"}-set-${i+1}`, part:Number(ex.part),
      label:s.label||`Set ${i+1}`, questions:(s.questions||[]).map(normalizeQ)
    }));
  }
  function normalizeQ(q,i=0){ return {...q, n:q.number ?? q.n ?? i+1, number:q.number ?? q.n ?? i+1}; }
  function exercisesOf(p){ return exercises.filter(x=>Number(x.part)===Number(p)); }
  function allQuestionRefs(){
    const a=[];
    exercises.forEach(ex=>itemsOf(ex).forEach(it=>it.questions.forEach(q=>a.push({q,item:it,ex}))));
    return a;
  }
  const allQuestions=allQuestionRefs();

  function saveState(){
    localStorage.setItem(STORAGE.answers,JSON.stringify(answers));
    localStorage.setItem(STORAGE.checked,JSON.stringify([...checkedGroups]));
    localStorage.setItem(STORAGE.marked,JSON.stringify([...marked]));
    updateProgress(); renderPalette();
  }
  function isAnswered(q){return Object.prototype.hasOwnProperty.call(answers,q.n)}
  function groupDone(it=currentItem){return !!it && it.questions.every(isAnswered)}
  function groupChecked(it=currentItem){return !!it && (it.part<=2 ? groupDone(it) : checkedGroups.has(it.id))}
  function questionChecked(q,it){return it.part<=2 ? isAnswered(q) : checkedGroups.has(it.id)}
  function questionCorrect(q,it){return questionChecked(q,it)&&answers[q.n]===q.answer}
  function questionWrong(q,it){return questionChecked(q,it)&&answers[q.n]!==q.answer}

  function fmt(s){if(!isFinite(s))return"00:00";const m=Math.floor(s/60),x=Math.floor(s%60);return`${String(m).padStart(2,"0")}:${String(x).padStart(2,"0")}`}
  function bounds(it=currentItem){
    let start=Number(it?.start ?? 0), end=it?.end;
    end=end==null ? (audio.duration||start) : Number(end);
    return {start,end};
  }

  function renderPartTabs(){
    partTabs.innerHTML="";
    parts.forEach(p=>{
      const b=document.createElement("button"); b.textContent=`Part ${p}`; b.dataset.part=p;
      b.classList.toggle("active",p===part);
      b.onclick=()=>{part=p;exerciseIndex=0;itemIndex=0;render()};
      partTabs.appendChild(b);
    });
  }
  function renderExerciseTabs(){
    exerciseTabs.innerHTML="";
    exercisesOf(part).forEach((ex,i)=>{
      const b=document.createElement("button"); b.textContent=ex.label||`Exercise ${i+1}`;
      b.classList.toggle("active",i===exerciseIndex);
      b.onclick=()=>{exerciseIndex=i;itemIndex=0;render()};
      exerciseTabs.appendChild(b);
    });
  }

  function render(){
    const exs=exercisesOf(part);
    if(!exs.length){part=parts[0];return render()}
    if(exerciseIndex>=exs.length) exerciseIndex=0;
    currentExercise=exs[exerciseIndex];
    const list=itemsOf(currentExercise);
    if(!list.length){
      questionArea.innerHTML='<div class="practice-empty">Exercise này chưa có câu hỏi.</div>';
      return;
    }
    if(itemIndex>=list.length)itemIndex=0;
    currentItem=list[itemIndex];
    focusQuestionNumber=currentItem.questions.some(q=>q.n===focusQuestionNumber)?focusQuestionNumber:currentItem.questions[0].n;

    audio.pause(); playBtn.textContent="▶";
    if(currentExercise.audio && audio.getAttribute("src")!==currentExercise.audio) audio.src=currentExercise.audio;
    audio.playbackRate=speeds[speedIndex];
    const b=bounds();
    if(audio.readyState>=1)audio.currentTime=b.start;
    currentTimeEl.textContent="00:00"; durationEl.textContent=fmt(Math.max(0,b.end-b.start));

    partBadge.textContent=`Part ${part}`;
    groupLabel.textContent=`${currentExercise.label||`Exercise ${exerciseIndex+1}`} · ${currentItem.label||""}`;
    renderPartTabs(); renderExerciseTabs(); renderVisual(); renderQuestions(); renderScript(); renderDots(); renderPalette(); drawWaveform();

    prevBtn.disabled=itemIndex===0 && exerciseIndex===0 && parts.indexOf(part)===0;
    nextBtn.textContent="Next →";
    window.scrollTo({top:0,behavior:"smooth"});
  }

  function renderVisual(){
    visualWrap.innerHTML="";
    const src=currentItem.image||currentItem.graphic;
    if(src){const img=document.createElement("img");img.src=src;img.alt=part===1?"TOEIC Part 1 picture":"Question graphic";visualWrap.appendChild(img)}
  }

  function renderQuestions(){
    questionArea.innerHTML="";
    const checked=groupChecked();
    if(part<=2&&!checked){
      const hint=document.createElement("div");hint.className="hint";
      hint.textContent="Nghe trước. Câu hỏi/đáp án tiếng Anh sẽ hiện sau khi bạn chọn.";
      questionArea.appendChild(hint);
    }

    currentItem.questions.forEach(q=>{
      const selected=answers[q.n], card=document.createElement("div");card.className="question-card";
      if(q.n===focusQuestionNumber)card.classList.add("focused-question");
      const row=document.createElement("div");row.className="q-title-row";
      const title=document.createElement("div");title.className="q-title";
      title.textContent=part===1?`${q.n}. Select the best response.`:`${q.n}. ${q.prompt||"Select the best response."}`;
      const mark=document.createElement("button");mark.className=`mark-btn ${marked.has(q.n)?"marked":""}`;mark.textContent=marked.has(q.n)?"★":"☆";
      mark.onclick=()=>{marked.has(q.n)?marked.delete(q.n):marked.add(q.n);focusQuestionNumber=q.n;saveState();renderQuestions()};
      row.append(title,mark);card.appendChild(row);

      const choices=document.createElement("div");choices.className="choices";
      (q.choices||[]).forEach((c,i)=>{
        const btn=document.createElement("button");btn.className="choice";
        if(!checked&&selected===i)btn.classList.add("selected");
        if(checked){btn.classList.add("locked");if(i===q.answer)btn.classList.add("correct");if(i===selected&&i!==q.answer)btn.classList.add("wrong")}
        const letter=String.fromCharCode(65+i);
        const hidden=(part<=2&&!checked);
        btn.innerHTML=`<span class="radio"></span><span class="choice-text ${hidden?"hidden-text":""}"><span class="letter">(${letter})</span>${hidden?"":" "+escapeHtml(c)}</span>`;
        btn.onclick=()=>choose(q,i);choices.appendChild(btn);
      });
      card.appendChild(choices);questionArea.appendChild(card);
    });

    if(part>=3&&!checked){
      const w=document.createElement("div");w.className="check-wrap";
      const b=document.createElement("button");b.className="check-btn";b.disabled=!groupDone();
      b.textContent=groupDone()?"Check":`Chọn đủ ${currentItem.questions.length} câu để Check`;
      b.onclick=()=>{if(groupDone()){checkedGroups.add(currentItem.id);saveState();renderQuestions();renderScript();renderDots()}};
      w.appendChild(b);questionArea.appendChild(w);
    }
  }

  function choose(q,i){
    if(groupChecked())return;
    answers[q.n]=i;focusQuestionNumber=q.n;
    if(part<=2)checkedGroups.add(currentItem.id);
    saveState();renderQuestions();renderScript();renderDots();
  }

  function renderScript(){
    if(!groupChecked()){scriptBox.classList.add("hidden");scriptLines.innerHTML="";explanationBox.innerHTML="";return}
    scriptBox.classList.remove("hidden");scriptLines.innerHTML="";
    const script=currentItem.script||[];
    (Array.isArray(script)?script:[script]).filter(Boolean).forEach(line=>{
      const d=document.createElement("div");d.className="script-line";d.textContent=line;scriptLines.appendChild(d);
    });
    const exps=currentItem.questions.map(q=>q.explanation).filter(Boolean);
    if(currentItem.explanation)exps.unshift(currentItem.explanation);
    explanationBox.innerHTML="";
    if(exps.length){explanationBox.classList.remove("hidden");explanationBox.innerHTML=`<div class="script-title">EXPLANATION</div>${exps.map(x=>`<div class="explanation-line">${escapeHtml(x)}</div>`).join("")}`}
    else explanationBox.classList.add("hidden");
  }

  function renderDots(){
    itemDots.innerHTML="";itemsOf(currentExercise).forEach((it,i)=>{
      const d=document.createElement("span");d.className="dot";if(i===itemIndex)d.classList.add("active");if(groupChecked(it))d.classList.add("done");itemDots.appendChild(d)
    })
  }

  function updateProgress(){
    const n=Object.keys(answers).length,total=allQuestions.length;
    progressText.textContent=`${n} / ${total} answered`;progressBar.style.width=`${total?n/total*100:0}%`;
  }

  function renderPalette(){
    let correct=0,wrong=0;allQuestions.forEach(({q,item})=>{if(questionCorrect(q,item))correct++;else if(questionWrong(q,item))wrong++});
    correctCount.textContent=correct;wrongCount.textContent=wrong;todoCount.textContent=allQuestions.length-correct-wrong;
    paletteSections.innerHTML="";
    parts.forEach(p=>{
      const sec=document.createElement("section");sec.className="palette-section";
      const h=document.createElement("h3");h.textContent=`Part ${p}`;sec.appendChild(h);
      exercisesOf(p).forEach((ex,exi)=>{
        const lab=document.createElement("div");lab.className="palette-exercise-label";lab.textContent=ex.label||`Exercise ${exi+1}`;sec.appendChild(lab);
        const grid=document.createElement("div");grid.className="palette-grid";
        itemsOf(ex).forEach((it,ii)=>it.questions.forEach(q=>{
          const t=document.createElement("button");t.className="palette-tile";t.textContent=q.n;
          if(questionCorrect(q,it))t.classList.add("correct");else if(questionWrong(q,it))t.classList.add("wrong");else t.classList.add("todo");
          if(marked.has(q.n))t.classList.add("marked");
          if(part===p&&exerciseIndex===exi&&itemIndex===ii&&focusQuestionNumber===q.n)t.classList.add("current");
          t.onclick=()=>{part=p;exerciseIndex=exi;itemIndex=ii;focusQuestionNumber=q.n;closePalette();render()};
          grid.appendChild(t)
        }));
        sec.appendChild(grid)
      });
      paletteSections.appendChild(sec)
    })
  }

  function openPalette(){renderPalette();paletteOverlay.classList.remove("hidden");document.body.classList.add("palette-open-body")}
  function closePalette(){paletteOverlay.classList.add("hidden");document.body.classList.remove("palette-open-body")}
  paletteBtn.onclick=openPalette;paletteClose.onclick=closePalette;paletteOverlay.onclick=e=>{if(e.target===paletteOverlay)closePalette()};

  function move(dir){
    const exs=exercisesOf(part), list=itemsOf(currentExercise);
    if(dir>0){
      if(itemIndex<list.length-1)itemIndex++;
      else if(exerciseIndex<exs.length-1){exerciseIndex++;itemIndex=0}
      else {const pi=parts.indexOf(part);if(pi<parts.length-1){part=parts[pi+1];exerciseIndex=0;itemIndex=0}else return}
    }else{
      if(itemIndex>0)itemIndex--;
      else if(exerciseIndex>0){exerciseIndex--;itemIndex=itemsOf(exs[exerciseIndex]).length-1}
      else {const pi=parts.indexOf(part);if(pi>0){part=parts[pi-1];const prev=exercisesOf(part);exerciseIndex=prev.length-1;itemIndex=itemsOf(prev[exerciseIndex]).length-1}else return}
    }
    focusQuestionNumber=null;render();
  }
  prevBtn.onclick=()=>move(-1);nextBtn.onclick=()=>move(1);

  function escapeHtml(s){return String(s).replace(/[&<>'"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]))}
  function resizeCanvas(){const r=canvas.getBoundingClientRect(),dpr=window.devicePixelRatio||1;canvas.width=Math.max(1,Math.floor(r.width*dpr));canvas.height=Math.floor(88*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);drawWaveform()}
  function drawWaveform(){
    if(!currentItem)return;const r=canvas.getBoundingClientRect(),w=r.width||500,h=88;ctx.clearRect(0,0,w,h);
    const peaks=currentItem.peaks||Array.from({length:90},(_,i)=>.2+.55*Math.abs(Math.sin(i*.73))*Math.abs(Math.cos(i*.19)));
    const b=bounds(),progress=Math.max(0,Math.min(1,(audio.currentTime-b.start)/Math.max(.01,b.end-b.start))),gap=3,bw=Math.max(2,(w-(peaks.length-1)*gap)/Math.max(peaks.length,1)),mid=h/2;
    peaks.forEach((v,i)=>{const x=i*(bw+gap),bh=Math.max(8,v*(h-14));ctx.fillStyle=(i/peaks.length<=progress)?"#d97706":"#d4c4ae";ctx.beginPath();ctx.roundRect?ctx.roundRect(x,mid-bh/2,bw,bh,Math.min(3,bw/2)):ctx.rect(x,mid-bh/2,bw,bh);ctx.fill()})
  }
  canvas.onclick=e=>{const r=canvas.getBoundingClientRect(),b=bounds(),f=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));audio.currentTime=b.start+f*(b.end-b.start);drawWaveform()};
  playBtn.onclick=()=>{const b=bounds();if(audio.paused){if(audio.currentTime<b.start||audio.currentTime>=b.end-.05)audio.currentTime=b.start;audio.play()}else audio.pause()};
  audio.onplay=()=>playBtn.textContent="❚❚";audio.onpause=()=>playBtn.textContent="▶";
  audio.onloadedmetadata=()=>{const b=bounds();if(currentItem.end==null)currentItem.end=audio.duration;if(audio.currentTime<b.start||audio.currentTime>b.end)audio.currentTime=b.start;durationEl.textContent=fmt(b.end-b.start);drawWaveform()};
  audio.ontimeupdate=()=>{const b=bounds();if(audio.currentTime>=b.end){audio.pause();audio.currentTime=b.end}currentTimeEl.textContent=fmt(Math.max(0,audio.currentTime-b.start));drawWaveform()};
  $("back3").onclick=()=>{const b=bounds();audio.currentTime=Math.max(b.start,audio.currentTime-3)};
  $("back5").onclick=()=>{const b=bounds();audio.currentTime=Math.max(b.start,audio.currentTime-5)};
  speedBtn.onclick=()=>{speedIndex=(speedIndex+1)%speeds.length;audio.playbackRate=speeds[speedIndex];speedBtn.textContent=`${speeds[speedIndex]}x`};

  resetBtn.onclick=()=>{
    if(!confirm("Bạn có chắc muốn làm lại toàn bộ Practice Unit từ đầu?"))return;
    audio.pause();answers={};checkedGroups=new Set();marked=new Set();
    Object.values(STORAGE).forEach(k=>localStorage.removeItem(k));
    part=parts[0];exerciseIndex=0;itemIndex=0;focusQuestionNumber=null;updateProgress();render();
  };

  window.addEventListener("resize",resizeCanvas);
  window.addEventListener("keydown",e=>{
    if(e.key==="Escape"&&!paletteOverlay.classList.contains("hidden"))return closePalette();
    if(e.key==="Control"){e.preventDefault();playBtn.click();return}
    if(e.key==="Shift"){e.preventDefault();const b=bounds();audio.currentTime=Math.max(b.start,audio.currentTime-3);return}
    if(["1","2","3","4"].includes(e.key)){const q=currentItem?.questions.find(x=>!isAnswered(x));if(q){const i=Number(e.key)-1;if(i<q.choices.length)choose(q,i)}}
  });

  updateProgress();render();setTimeout(resizeCanvas,50);
})();