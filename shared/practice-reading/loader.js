(async () => {
  const p = new URLSearchParams(location.search);
  const unit = p.get("unit");
  const fail = msg => document.body.innerHTML =
    `<main style="max-width:760px;margin:70px auto;padding:28px;font-family:system-ui">
    <div style="border:1px solid #f0c47c;background:#fff8e8;border-radius:18px;padding:24px">
    <h2>Không tải được Reading Practice</h2><p>${msg}</p><a href="../../">← Trang chủ</a></div></main>`;
  if (!unit || !/^[a-z0-9-]+$/i.test(unit)) return fail("URL chưa có Unit hợp lệ.");
  const load = src => new Promise((ok,no)=>{
    const s=document.createElement("script"); s.src=src; s.async=false;
    s.onload=ok; s.onerror=()=>no(new Error("Không tải được "+src)); document.body.appendChild(s);
  });
  try {
    await load(`../../units/${unit}/data.js?v=${Date.now()}`);
    if (!window.PRACTICE_DATA) throw new Error("Không tìm thấy PRACTICE_DATA.");
    await load("./app.js?v=1");
  } catch(e) { console.error(e); fail(e.message); }
})();