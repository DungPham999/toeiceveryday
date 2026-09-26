
(() => {
  const cfg = window.READING_CONFIG;
  const data = window.READING_DATA;
  const key = cfg.storageKey;

  const tabs = [...document.querySelectorAll('.part-tabs button')];
  const testArea = document.getElementById('testArea');
  const progressText = document.getElementById('progressText');
  const progressBar = document.getElementById('progressBar');
  const resetBtn = document.getElementById('resetBtn');
  const paletteBtn = document.getElementById('paletteBtn');
  const paletteOverlay = document.getElementById('paletteOverlay');
  const paletteClose = document.getElementById('paletteClose');
  const paletteSections = document.getElementById('paletteSections');
  const correctCount = document.getElementById('correctCount');
  const wrongCount = document.getElementById('wrongCount');
  const todoCount = document.getElementById('todoCount');

  let part = 5;
  let currentNumber = 101;

  const load = (suffix, fallback) => {
    try { return JSON.parse(localStorage.getItem(`${key}-${suffix}`) || JSON.stringify(fallback)); }
    catch { return fallback; }
  };

  let answers = load('answers', {});
  let checkedSets = new Set(load('checkedSets', []));
  let checkedSingle = new Set(load('checkedSingle', []));
  let marked = new Set(load('marked', []));

  const allQuestions = [
    ...data.part5.map(q => ({...q, setId:q.id})),
    ...data.part6.flatMap(s => s.questions.map(q => ({...q, part:6, setId:s.id}))),
    ...data.part7.flatMap(s => s.questions.map(q => ({...q, part:7, setId:s.id})))
  ];

  const save = () => {
    localStorage.setItem(`${key}-answers`, JSON.stringify(answers));
    localStorage.setItem(`${key}-checkedSets`, JSON.stringify([...checkedSets]));
    localStorage.setItem(`${key}-checkedSingle`, JSON.stringify([...checkedSingle]));
    localStorage.setItem(`${key}-marked`, JSON.stringify([...marked]));
    updateProgress();
    renderPalette();
  };

  const isChecked = q => q.part === 5 ? checkedSingle.has(q.number) : checkedSets.has(q.setId);
  const explanationText = q => {
    const fixes = window.READING_EXPLANATION_FIXES || {};
    return Object.prototype.hasOwnProperty.call(fixes, q.number)
      ? fixes[q.number]
      : (q.explanation || '');
  };
  const isCorrect = q => isChecked(q) && answers[q.number] === q.answer;
  const isWrong = q => isChecked(q) && answers[q.number] !== q.answer;

  function updateProgress(){
    const n = Object.keys(answers).length;
    progressText.textContent = `${n} / ${allQuestions.length} answered`;
    progressBar.style.width = `${n / allQuestions.length * 100}%`;
  }

  function setPart(p){
    part = Number(p);
    tabs.forEach(b => b.classList.toggle('active', Number(b.dataset.part) === part));
    const first = allQuestions.find(q => q.part === part);
    currentNumber = first?.number ?? currentNumber;
    render();
  }

  function render(){
    if(part === 5) renderPart5();
    if(part === 6) renderGroupedPart(data.part6);
    if(part === 7) renderGroupedPart(data.part7);
    renderPalette();
  }

  function makeMarkButton(number){
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mark-btn' + (marked.has(number) ? ' marked' : '');
    btn.title = marked.has(number) ? 'Bỏ đánh dấu câu này' : 'Đánh dấu câu này';
    btn.setAttribute('aria-label', btn.title);
    btn.textContent = marked.has(number) ? '★' : '☆';

    btn.onclick = e => {
      e.stopPropagation();
      if(marked.has(number)) marked.delete(number);
      else marked.add(number);
      currentNumber = number;
      save();
      render();
    };
    return btn;
  }

  function choiceButton(q, choice, i){
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'choice';
    if(answers[q.number] === i) b.classList.add('selected');

    if(isChecked(q)){
      if(i === q.answer) b.classList.add('correct');
      if(answers[q.number] === i && i !== q.answer) b.classList.add('wrong');
    }

    b.innerHTML = `<span class="radio"></span><span>(${String.fromCharCode(65+i)}) ${escapeHtml(choice)}</span>`;
   
    
    b.onclick = () => {
  if(isChecked(q)) return;

  // Ghi nhớ vị trí cuộn hiện tại của Part 6–7
  const questionsPane = document.querySelector(
    '.reading-set .set-questions'
  );

  const passagePane = document.querySelector(
    '.reading-set .passage-card'
  );

  const questionsScroll = questionsPane
    ? questionsPane.scrollTop
    : 0;

  const passageScroll = passagePane
    ? passagePane.scrollTop
    : 0;


  // Lưu đáp án
  answers[q.number] = i;
  currentNumber = q.number;

  // Part 5 vẫn chấm ngay như cũ
  if(q.part === 5) {
    checkedSingle.add(q.number);
  }

  save();
  render();


  // Part 6–7: trả về đúng vị trí đang cuộn
  if(q.part === 6 || q.part === 7) {

    requestAnimationFrame(() => {

      const newQuestionsPane = document.querySelector(
        '.reading-set .set-questions'
      );

      const newPassagePane = document.querySelector(
        '.reading-set .passage-card'
      );

      if(newQuestionsPane) {
        newQuestionsPane.scrollTop = questionsScroll;
      }

      if(newPassagePane) {
        newPassagePane.scrollTop = passageScroll;
      }

    });

  }
};



    
    
    return b;
  }

  function renderPart5(){
    testArea.innerHTML = `<div class="part5-list"></div>`;
    const list = testArea.querySelector('.part5-list');

    data.part5.forEach(q => {
      const card = document.createElement('section');
      card.className = 'q-card' + (currentNumber === q.number ? ' current' : '');
      card.id = `q-${q.number}`;
      card.innerHTML = `
        <div class="q-card-top">
          <div class="q-number">Part 5 · Question ${q.number}</div>
        </div>
        <div class="q-prompt">${escapeHtml(q.prompt)}</div>
        <div class="choices"></div>
      `;
      card.querySelector('.q-card-top').appendChild(makeMarkButton(q.number));
      const choices = card.querySelector('.choices');
      q.choices.forEach((c,i) => choices.appendChild(choiceButton({...q, part:5, setId:q.id}, c, i)));
      if(checkedSingle.has(q.number)){
        const ex = document.createElement('div');
        ex.className = 'explanation';
        ex.innerHTML = `<b>Giải thích:</b> ${escapeHtml(explanationText(q))}`;
        card.appendChild(ex);
      }
      card.onclick = () => { currentNumber = q.number; renderPalette(); };
      list.appendChild(card);
    });
  }

  function setQuestionCard(q, partNum, setId){
    const fullQ = {...q, part:partNum, setId};
    const card = document.createElement('section');
    card.className = 'q-card' + (currentNumber === q.number ? ' current' : '');
    card.id = `q-${q.number}`;
    card.innerHTML = `
      <div class="q-card-top">
        <div class="q-number">Part ${partNum} · Question ${q.number}</div>
      </div>
      ${q.prompt ? `<div class="q-prompt">${escapeHtml(q.prompt)}</div>` : ''}
      <div class="choices"></div>
    `;
    card.querySelector('.q-card-top').appendChild(makeMarkButton(q.number));
    const choices = card.querySelector('.choices');
    q.choices.forEach((c,i) => choices.appendChild(choiceButton(fullQ,c,i)));
    if(checkedSets.has(setId)){
      const details = document.createElement('details');
      details.className = 'explanation-toggle';
      details.innerHTML = `
        <summary>Explanation</summary>
        <div class="explanation-panel">${escapeHtml(explanationText(q))}</div>
      `;
      card.appendChild(details);
    }
    card.onclick = () => { currentNumber=q.number; renderPalette(); };
    return card;
  }

  function renderSet(set){
    testArea.innerHTML = `
      <div class="reading-set" id="readingSet">
        <section class="passage-card">
          <span class="passage-label">${set.label}</span>
          <h2>${escapeHtml(set.passageTitle || '')}</h2>
          <div class="passage-text">${set.passageHtml}</div>
        </section>

        <div class="column-resizer"
             id="columnResizer"
             role="separator"
             aria-orientation="vertical"
             aria-label="Kéo để thay đổi độ rộng hai cột"
             title="Kéo để chỉnh độ rộng • Nhấp đúp để đặt lại">
          <span>⋮</span>
        </div>

        <div class="set-questions"></div>
      </div>
    `;

    enableResizableColumns();

    const wrap = testArea.querySelector('.set-questions');
    set.questions.forEach(q => wrap.appendChild(setQuestionCard(q,set.part,set.id)));

    if(!checkedSets.has(set.id)){
      const check = document.createElement('div');
      check.className = 'check-wrap';
      const done = set.questions.every(q => Object.prototype.hasOwnProperty.call(answers,q.number));
      check.innerHTML = `<button class="check-btn" ${done?'':'disabled'}>${done?'Check':'Chọn đủ câu để Check'}</button>`;
      check.querySelector('button').onclick = () => {
        if(!done) return;
        checkedSets.add(set.id);
        save();
        render();
      };
      wrap.appendChild(check);
    }
  }

  function enableResizableColumns(){
    const setEl = document.getElementById('readingSet');
    const handle = document.getElementById('columnResizer');
    if(!setEl || !handle) return;

    const saved = localStorage.getItem(`${key}-passage-width`);
    if(saved && window.innerWidth > 900){
      setEl.style.setProperty('--passage-width', `${saved}px`);
    }

    let dragging = false;

    const move = clientX => {
      if(!dragging || window.innerWidth <= 900) return;
      const rect = setEl.getBoundingClientRect();
      const minLeft = 300;
      const minRight = 390;
      const reserve = 38;
      const maxLeft = Math.max(minLeft, rect.width - minRight - reserve);
      const next = Math.max(minLeft, Math.min(maxLeft, clientX - rect.left));
      setEl.style.setProperty('--passage-width', `${next}px`);
      localStorage.setItem(`${key}-passage-width`, String(Math.round(next)));
    };

    handle.addEventListener('pointerdown', e => {
      if(window.innerWidth <= 900) return;
      dragging = true;
      handle.setPointerCapture(e.pointerId);
      handle.classList.add('dragging');
      document.body.classList.add('is-resizing');
      e.preventDefault();
    });

    handle.addEventListener('pointermove', e => move(e.clientX));

    const stop = e => {
      if(!dragging) return;
      dragging = false;
      handle.classList.remove('dragging');
      document.body.classList.remove('is-resizing');
      try { handle.releasePointerCapture(e.pointerId); } catch {}
    };

    handle.addEventListener('pointerup', stop);
    handle.addEventListener('pointercancel', stop);

    handle.addEventListener('dblclick', () => {
      localStorage.removeItem(`${key}-passage-width`);
      setEl.style.removeProperty('--passage-width');
    });
  }

  function renderGroupedPart(sets){
    const currentSet = sets.find(s => s.questions.some(q => q.number === currentNumber)) || sets[0];
    renderSet(currentSet);

    // Chuyển passage/set bằng Question Palette hoặc nút Set trước / Set tiếp ở cuối.
    const setIndex = sets.findIndex(s => s.id === currentSet.id);
    const wrap = testArea.querySelector('.set-questions');

    const nav = document.createElement('div');
    nav.className = 'set-bottom-nav';
    nav.innerHTML = `
      <button type="button" class="set-nav-btn" id="prevSetBtn" ${setIndex <= 0 ? 'disabled' : ''}>
        ← Set trước
      </button>
      <span class="set-nav-status">${currentSet.label}</span>
      <button type="button" class="set-nav-btn" id="nextSetBtn" ${setIndex >= sets.length - 1 ? 'disabled' : ''}>
        Set tiếp →
      </button>
    `;
    wrap.appendChild(nav);

    const prev = nav.querySelector('#prevSetBtn');
    const next = nav.querySelector('#nextSetBtn');

    if(prev && setIndex > 0){
      prev.onclick = () => {
        const s = sets[setIndex - 1];
        currentNumber = s.questions[0].number;
        render();
      };
    }

    if(next && setIndex < sets.length - 1){
      next.onclick = () => {
        const s = sets[setIndex + 1];
        currentNumber = s.questions[0].number;
        render();
      };
    }
  }

  function renderPalette(){
    let correct=0, wrong=0;
    allQuestions.forEach(q => { if(isCorrect(q)) correct++; else if(isWrong(q)) wrong++; });
    correctCount.textContent = correct;
    wrongCount.textContent = wrong;
    todoCount.textContent = allQuestions.length - correct - wrong;
    paletteSections.innerHTML = '';

    [5,6,7].forEach(p => {
      const qs = allQuestions.filter(q => q.part===p);
      const sec = document.createElement('section');
      sec.className = 'palette-section';
      sec.innerHTML = `<h3>Part ${p}</h3><div class="palette-grid"></div>`;
      const grid = sec.querySelector('.palette-grid');

      qs.forEach(q => {
        const b = document.createElement('button');
        b.type='button';
        b.className='palette-tile';
        b.textContent=q.number;
        if(currentNumber===q.number) b.classList.add('current');
        else if(isCorrect(q)) b.classList.add('correct');
        else if(isWrong(q)) b.classList.add('wrong');
        else if(Object.prototype.hasOwnProperty.call(answers,q.number)) b.classList.add('answered');

        if(marked.has(q.number)) b.classList.add('marked');

        b.onclick = () => {
          part=p;
          tabs.forEach(x=>x.classList.toggle('active',Number(x.dataset.part)===part));
          currentNumber=q.number;
          closePalette();
          render();
          setTimeout(()=>document.getElementById(`q-${q.number}`)?.scrollIntoView({behavior:'smooth',block:'center'}),100);
        };
        grid.appendChild(b);
      });
      paletteSections.appendChild(sec);
    });
  }

  function openPalette(){ paletteOverlay.classList.remove('hidden'); paletteOverlay.setAttribute('aria-hidden','false'); }
  function closePalette(){ paletteOverlay.classList.add('hidden'); paletteOverlay.setAttribute('aria-hidden','true'); }

  paletteBtn.onclick=openPalette;
  paletteClose.onclick=closePalette;
  paletteOverlay.addEventListener('click',e=>{ if(e.target===paletteOverlay) closePalette(); });

  resetBtn.onclick = () => {
    if(!confirm('Bạn có chắc muốn làm lại toàn bộ bài Reading từ đầu?\\n\\nToàn bộ đáp án, kết quả đúng/sai và câu đã đánh dấu sẽ bị xóa.')) return;
    answers={}; checkedSets=new Set(); checkedSingle=new Set(); marked=new Set();
    localStorage.removeItem(`${key}-answers`);
    localStorage.removeItem(`${key}-checkedSets`);
    localStorage.removeItem(`${key}-checkedSingle`);
    localStorage.removeItem(`${key}-marked`);
    part=5; currentNumber=101;
    tabs.forEach(b=>b.classList.toggle('active',Number(b.dataset.part)===5));
    updateProgress(); render(); window.scrollTo({top:0,behavior:'smooth'});
  };

  tabs.forEach(b=>b.onclick=()=>setPart(b.dataset.part));
  window.addEventListener('keydown',e=>{ if(e.key==='Escape') closePalette(); });

  function escapeHtml(s){
    return String(s).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }

  updateProgress();
  render();
})();
