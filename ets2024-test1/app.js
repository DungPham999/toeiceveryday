(() => {
  const data = window.TEST_DATA;
  const audio = document.getElementById('audio');
  const canvas = document.getElementById('waveform');
  const ctx = canvas.getContext('2d');
  const playBtn = document.getElementById('playBtn');
  const currentTimeEl = document.getElementById('currentTime');
  const durationEl = document.getElementById('duration');
  const questionArea = document.getElementById('questionArea');
  const visualWrap = document.getElementById('visualWrap');
  const scriptBox = document.getElementById('scriptBox');
  const scriptLines = document.getElementById('scriptLines');
  const partBadge = document.getElementById('partBadge');
  const groupLabel = document.getElementById('groupLabel');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const speedBtn = document.getElementById('speedBtn');
  const progressText = document.getElementById('progressText');
  const progressBar = document.getElementById('progressBar');
  const itemDots = document.getElementById('itemDots');
  const partButtons = [...document.querySelectorAll('.part-tabs button')];
  const paletteBtn = document.getElementById('paletteBtn');
  const resetBtn = document.getElementById('resetBtn');
  const paletteOverlay = document.getElementById('paletteOverlay');
  const paletteClose = document.getElementById('paletteClose');
  const paletteSections = document.getElementById('paletteSections');
  const correctCount = document.getElementById('correctCount');
  const wrongCount = document.getElementById('wrongCount');
  const todoCount = document.getElementById('todoCount');
  const editScriptBtn = document.getElementById('editScriptBtn');
  const exportCorrectionsBtn = document.getElementById('exportCorrectionsBtn');
  const scriptEditNote = document.getElementById('scriptEditNote');

  let part = 1;
  let indexInPart = 0;
  let currentItem = null;
  let focusQuestionNumber = null;
  let speedIndex = 1;
  let editingScript = false;
  const speeds = [0.75, 1, 1.25];

  const loadJSON = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch(e) { return fallback; }
  };

  let answers = loadJSON('ets2024-t1-answers', {});
  let checkedGroups = new Set(loadJSON('ets2024-t1-checked-groups', []));
  let marked = new Set(loadJSON('ets2024-t1-marked', []));
  let scriptOverrides = loadJSON('ets2024-t1-script-overrides', {});

  const byPart = p => data.filter(x => x.part === p);
  const allQuestions = data.flatMap(x => x.questions.map(q => ({ q, item: x })));
  const fmt = s => {
    if (!isFinite(s)) return '00:00';
    const m = Math.floor(s / 60), x = Math.floor(s % 60);
    return `${String(m).padStart(2,'0')}:${String(x).padStart(2,'0')}`;
  };

  function parseClock(v){
    if (typeof v === 'number') return v;
    const p=String(v||'0').split(':');
    if (p.length===2) return Number(p[0])*60 + Number(p[1]);
    return Number(v)||0;
  }
  function bounds(item=currentItem){
    const t=(window.AUDIO_TIMES||{})[item.id]||{start:0,end:audio.duration||0};
    return {start:parseClock(t.start), end:parseClock(t.end)};
  }
  function relTime(){ const b=bounds(); return Math.max(0,audio.currentTime-b.start); }

  function saveState(){
    localStorage.setItem('ets2024-t1-answers', JSON.stringify(answers));
    localStorage.setItem('ets2024-t1-checked-groups', JSON.stringify([...checkedGroups]));
    localStorage.setItem('ets2024-t1-marked', JSON.stringify([...marked]));
    localStorage.setItem('ets2024-t1-script-overrides', JSON.stringify(scriptOverrides));
    updateProgress();
    renderPalette();
  }

  function updateProgress(){
    const n = Object.keys(answers).length, total = allQuestions.length;
    progressText.textContent = `${n} / ${total} answered`;
    progressBar.style.width = `${total ? (n / total * 100) : 0}%`;
  }

  function isAnswered(q){ return Object.prototype.hasOwnProperty.call(answers, q.n); }
  function groupDone(item = currentItem){ return item.questions.every(isAnswered); }
  function groupChecked(item = currentItem){
    if (!item) return false;
    return item.part <= 2 ? groupDone(item) : checkedGroups.has(item.id);
  }
  function questionChecked(q, item){ return item.part <= 2 ? isAnswered(q) : checkedGroups.has(item.id); }
  function questionCorrect(q, item){ return questionChecked(q,item) && answers[q.n] === q.answer; }
  function questionWrong(q, item){ return questionChecked(q,item) && answers[q.n] !== q.answer; }

  function setPart(p){
    part = Number(p);
    indexInPart = 0;
  
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const ok = window.confirm('Bạn có chắc muốn làm lại từ đầu? Toàn bộ đáp án, kết quả đúng/sai và câu đã đánh dấu của bài Listening này sẽ được xóa.');
      if (!ok) return;
      localStorage.removeItem('ets2024-t1-answers');
      localStorage.removeItem('ets2024-t1-checked-groups');
      localStorage.removeItem('ets2024-t1-marked');
      window.location.reload();
    });
  }

  focusQuestionNumber = byPart(part)[0]?.questions[0]?.n ?? null;
    render();
  }

  function render(){
    const list = byPart(part);
    currentItem = list[indexInPart];
    if (!currentItem) return;
    if (!currentItem.questions.some(q => q.n === focusQuestionNumber)) {
      focusQuestionNumber = currentItem.questions[0].n;
    }

    editingScript = false;
    audio.pause();
    playBtn.textContent = '▶';
    if (audio.getAttribute('src') !== currentItem.audio) { audio.src = currentItem.audio; }
    audio.playbackRate = speeds[speedIndex];
    const b = bounds(currentItem);
    if (audio.readyState >= 1) audio.currentTime = b.start;
    currentTimeEl.textContent = '00:00';
    durationEl.textContent = fmt(b.end - b.start);
    partBadge.textContent = `Part ${part}`;
    groupLabel.textContent = currentItem.label;
    partButtons.forEach(b => b.classList.toggle('active', Number(b.dataset.part) === part));

    renderVisual();
    renderQuestions();
    renderScript();
    renderDots();
    renderPalette();
    drawWaveform();

    prevBtn.disabled = indexInPart === 0;
    nextBtn.textContent = indexInPart === list.length - 1 ? (part < 4 ? 'Next Part →' : 'Finished') : 'Next →';
    nextBtn.disabled = part === 4 && indexInPart === list.length - 1;
    window.scrollTo({top:0, behavior:'smooth'});
  }

  function renderVisual(){
    visualWrap.innerHTML = '';
    const src = currentItem.image || currentItem.graphic;
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = currentItem.image ? 'TOEIC Part 1 picture' : 'Question graphic';
      visualWrap.appendChild(img);
    }
  }

  function renderQuestions(){
    questionArea.innerHTML = '';
    const checked = groupChecked();

    currentItem.questions.forEach(q => {
      const selected = answers[q.n];
      const card = document.createElement('div');
      card.className = 'question-card';
      if (q.n === focusQuestionNumber) card.classList.add('focused-question');

      const titleRow = document.createElement('div');
      titleRow.className = 'q-title-row';

      const title = document.createElement('div');
      title.className = 'q-title';
      const hide = currentItem.hideBeforeAnswer && !checked;
      title.textContent = `${q.n}. ${q.prompt}`;
      if (hide && part === 2) title.classList.add('hidden-text');
      if (part === 1) title.textContent = `${q.n}. Select the best response.`;
      titleRow.appendChild(title);

      const markBtn = document.createElement('button');
      markBtn.className = `mark-btn ${marked.has(q.n) ? 'marked' : ''}`;
      markBtn.type = 'button';
      markBtn.title = marked.has(q.n) ? 'Bỏ đánh dấu' : 'Đánh dấu câu này';
      markBtn.textContent = marked.has(q.n) ? '★' : '☆';
      markBtn.onclick = () => {
        if (marked.has(q.n)) marked.delete(q.n); else marked.add(q.n);
        focusQuestionNumber = q.n;
        saveState();
        renderQuestions();
      };
      titleRow.appendChild(markBtn);
      card.appendChild(titleRow);

      const choices = document.createElement('div');
      choices.className = 'choices';
      q.choices.forEach((c,i) => {
        const btn = document.createElement('button');
        btn.className = 'choice';
        const isSelected = selected === i;

        if (!checked && isSelected) btn.classList.add('selected');
        if (checked) {
          btn.classList.add('locked');
          if (i === q.answer) btn.classList.add('correct');
          if (i === selected && i !== q.answer) btn.classList.add('wrong');
        }

        const letter = String.fromCharCode(65 + i);
        btn.innerHTML = `<span class="radio"></span><span class="choice-text ${hide ? 'hidden-text' : ''}"><span class="letter">(${letter})</span>${hide ? '' : ' ' + escapeHtml(c)}</span>`;
        btn.onclick = () => choose(q,i);
        choices.appendChild(btn);
      });
      card.appendChild(choices);
      questionArea.appendChild(card);
    });

    if (part <= 2 && !checked) {
      const hint = document.createElement('div');
      hint.className = 'hint';
      hint.textContent = 'Nghe trước. Câu hỏi/đáp án tiếng Anh sẽ hiện sau khi bạn chọn.';
      questionArea.prepend(hint);
    }

    if (part >= 3 && !checked) {
      const checkWrap = document.createElement('div');
      checkWrap.className = 'check-wrap';
      const btn = document.createElement('button');
      btn.id = 'checkGroupBtn';
      btn.className = 'check-btn';
      btn.disabled = !groupDone();
      btn.textContent = groupDone() ? 'Check' : `Chọn đủ ${currentItem.questions.length} câu để Check`;
      btn.onclick = checkCurrentGroup;
      checkWrap.appendChild(btn);
      questionArea.appendChild(checkWrap);
    }
  }

  function choose(q,i){
    if (groupChecked()) return;
    answers[q.n] = i;
    focusQuestionNumber = q.n;
    if (part <= 2) checkedGroups.add(currentItem.id);
    saveState();
    renderQuestions();
    renderScript();
    renderDots();
  }

  function checkCurrentGroup(){
    if (part < 3 || !groupDone()) return;
    checkedGroups.add(currentItem.id);
    saveState();
    renderQuestions();
    renderScript();
    renderDots();
  }

  function activeScript(){
    return scriptOverrides[currentItem.id] || currentItem.script || [];
  }

  function renderScript(){
    if (!groupChecked()) {
      scriptBox.classList.add('hidden');
      scriptLines.innerHTML = '';
      return;
    }
    scriptBox.classList.remove('hidden');
    scriptLines.innerHTML = '';
    activeScript().forEach(line => {
      const d = document.createElement('div');
      d.className = 'script-line';
      d.textContent = line;
      d.contentEditable = editingScript ? 'true' : 'false';
      d.spellcheck = true;
      scriptLines.appendChild(d);
    });
    editScriptBtn.textContent = editingScript ? '✓ Lưu sửa' : '✎ Sửa script';
    scriptEditNote.classList.toggle('hidden', !editingScript);
    exportCorrectionsBtn.disabled = Object.keys(scriptOverrides).length === 0;
  }

  editScriptBtn.onclick = () => {
    if (!groupChecked()) return;
    if (!editingScript) {
      editingScript = true;
      renderScript();
      scriptLines.querySelector('.script-line')?.focus();
      return;
    }
    const lines = [...scriptLines.querySelectorAll('.script-line')].map(x => x.textContent.trim());
    scriptOverrides[currentItem.id] = lines;
    editingScript = false;
    saveState();
    renderScript();
  };

  exportCorrectionsBtn.onclick = () => {
    const payload = {
      note: 'Script corrections exported from TOEIC Prototype v0.2',
      exportedAt: new Date().toISOString(),
      corrections: scriptOverrides
    };
    const blob = new Blob([JSON.stringify(payload,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script-corrections.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  function renderDots(){
    itemDots.innerHTML = '';
    byPart(part).forEach((it,i) => {
      const d = document.createElement('span');
      d.className = 'dot';
      if (i === indexInPart) d.classList.add('active');
      if (groupChecked(it)) d.classList.add('done');
      itemDots.appendChild(d);
    });
  }

  function openPalette(){
    renderPalette();
    paletteOverlay.classList.remove('hidden');
    paletteOverlay.setAttribute('aria-hidden','false');
    document.body.classList.add('palette-open-body');
  }
  function closePalette(){
    paletteOverlay.classList.add('hidden');
    paletteOverlay.setAttribute('aria-hidden','true');
    document.body.classList.remove('palette-open-body');
  }

  function renderPalette(){
    if (!paletteSections) return;
    let correct = 0, wrong = 0;
    allQuestions.forEach(({q,item}) => {
      if (questionCorrect(q,item)) correct++;
      else if (questionWrong(q,item)) wrong++;
    });
    correctCount.textContent = correct;
    wrongCount.textContent = wrong;
    todoCount.textContent = allQuestions.length - correct - wrong;

    paletteSections.innerHTML = '';
    [1,2,3,4].forEach(p => {
      const items = byPart(p);
      if (!items.length) return;
      const section = document.createElement('section');
      section.className = 'palette-section';
      const h = document.createElement('h3');
      const partName = p === 1 ? 'Photographs' : p === 2 ? 'Question–Response' : p === 3 ? 'Conversations' : 'Talks';
      const count = items.reduce((sum,it) => sum + it.questions.length, 0);
      h.textContent = `Part ${p} – ${partName} (${count} câu)`;
      section.appendChild(h);

      const grid = document.createElement('div');
      grid.className = 'palette-grid';
      items.forEach((it, itemIndex) => {
        it.questions.forEach(q => {
          const tile = document.createElement('button');
          tile.type = 'button';
          tile.className = 'palette-tile';
          tile.textContent = q.n;
          if (questionCorrect(q,it)) tile.classList.add('correct');
          else if (questionWrong(q,it)) tile.classList.add('wrong');
          else tile.classList.add('todo');
          if (marked.has(q.n)) tile.classList.add('marked');
          if (part === p && indexInPart === itemIndex && focusQuestionNumber === q.n) tile.classList.add('current');
          tile.onclick = () => {
            part = p;
            indexInPart = itemIndex;
            focusQuestionNumber = q.n;
            closePalette();
            render();
            setTimeout(() => document.querySelector('.focused-question')?.scrollIntoView({behavior:'smooth',block:'center'}), 120);
          };
          grid.appendChild(tile);
        });
      });
      section.appendChild(grid);
      paletteSections.appendChild(section);
    });
  }

  paletteBtn.onclick = openPalette;
  paletteClose.onclick = closePalette;
  paletteOverlay.addEventListener('click', e => { if (e.target === paletteOverlay) closePalette(); });

  function escapeHtml(s){
    return String(s).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }

  function resizeCanvas(){
    const r = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(r.width * dpr));
    canvas.height = Math.floor(88 * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    drawWaveform();
  }

  function drawWaveform(){
    if (!currentItem) return;
    const r = canvas.getBoundingClientRect();
    const w = r.width || 500, h = 88;
    ctx.clearRect(0,0,w,h);
    const peaks = currentItem.peaks || [];
    const b=bounds();
    const progress = Math.max(0, Math.min(1, (audio.currentTime-b.start) / Math.max(.01,b.end-b.start)));
    const gap = 3;
    const bw = Math.max(2, (w - (peaks.length - 1) * gap) / Math.max(peaks.length,1));
    const mid = h / 2;
    peaks.forEach((v,i) => {
      const x = i * (bw + gap);
      const bh = Math.max(8, v * (h - 14));
      ctx.fillStyle = (i / peaks.length <= progress) ? '#d97706' : '#d4c4ae';
      roundRect(ctx,x,mid-bh/2,bw,bh,Math.min(3,bw/2));
      ctx.fill();
    });
  }
  function roundRect(c,x,y,w,h,r){ c.beginPath(); c.roundRect ? c.roundRect(x,y,w,h,r) : c.rect(x,y,w,h); }

  canvas.addEventListener('click', e => {
    const r = canvas.getBoundingClientRect();
    const b=bounds();
    const frac=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));
    audio.currentTime=b.start+frac*(b.end-b.start);
    drawWaveform();
  });
  playBtn.onclick = () => { const b=bounds(); if (audio.paused) { if(audio.currentTime < b.start || audio.currentTime >= b.end-.05) audio.currentTime=b.start; audio.play(); } else audio.pause(); };
  audio.addEventListener('play', () => playBtn.textContent = '❚❚');
  audio.addEventListener('pause', () => playBtn.textContent = '▶');
  audio.addEventListener('loadedmetadata', () => { const b=bounds(); if(audio.currentTime<b.start || audio.currentTime>b.end) audio.currentTime=b.start; durationEl.textContent = fmt(b.end-b.start); drawWaveform(); });
  audio.addEventListener('timeupdate', () => { const b=bounds(); if(audio.currentTime >= b.end){ audio.pause(); audio.currentTime=b.end; } currentTimeEl.textContent = fmt(Math.max(0,audio.currentTime-b.start)); drawWaveform(); });
  document.getElementById('back3').onclick = () => { const b=bounds(); audio.currentTime = Math.max(b.start, audio.currentTime - 3); };
  document.getElementById('back5').onclick = () => { const b=bounds(); audio.currentTime = Math.max(b.start, audio.currentTime - 5); };
  speedBtn.onclick = () => {
    speedIndex = (speedIndex + 1) % speeds.length;
    audio.playbackRate = speeds[speedIndex];
    speedBtn.textContent = `${speeds[speedIndex]}x`;
  };
  prevBtn.onclick = () => {
    if (indexInPart > 0) {
      indexInPart--;
      focusQuestionNumber = byPart(part)[indexInPart].questions[0].n;
      render();
    }
  };
  nextBtn.onclick = () => {
    const list = byPart(part);
    if (indexInPart < list.length - 1) {
      indexInPart++;
      focusQuestionNumber = list[indexInPart].questions[0].n;
      render();
    } else if (part < 4) {
      part++;
      indexInPart = 0;
      focusQuestionNumber = byPart(part)[0].questions[0].n;
      render();
    }
  };
  partButtons.forEach(b => b.onclick = () => setPart(b.dataset.part));
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !paletteOverlay.classList.contains('hidden')) { closePalette(); return; }
    if (e.key === 'Control') { e.preventDefault(); playBtn.click(); return; }
    if (e.key === 'Shift') { e.preventDefault(); const b=bounds(); audio.currentTime = Math.max(b.start, audio.currentTime - 3); return; }
    if (['1','2','3','4'].includes(e.key)) {
      const q = currentItem.questions.find(x => !isAnswered(x)) || currentItem.questions.find(x => !groupChecked());
      if (q) {
        const i = Number(e.key) - 1;
        if (i < q.choices.length) choose(q,i);
      }
    }
  });

  focusQuestionNumber = byPart(part)[0]?.questions[0]?.n ?? null;
  updateProgress();
  render();
  setTimeout(resizeCanvas,50);
})();
