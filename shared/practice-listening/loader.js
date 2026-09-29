(async () => {
  const params = new URLSearchParams(window.location.search);
  const unitId = params.get("unit");

  function showError(message) {
    document.body.innerHTML = `<main style="max-width:760px;margin:70px auto;padding:28px;font-family:system-ui">
      <div style="border:1px solid #f0c47c;background:#fff8e8;border-radius:18px;padding:24px">
        <h2 style="margin-top:0;color:#8d4c00">Không tải được Practice Unit</h2>
        <p style="line-height:1.6;color:#665548">${message}</p>
        <a href="../../" style="color:#d97706;font-weight:700">← Về trang chủ</a>
      </div></main>`;
  }

  if (!unitId || !/^[a-z0-9-]+$/i.test(unitId)) {
    showError("URL chưa có Unit hợp lệ. Ví dụ: ?unit=a-lis-1");
    return;
  }

  const unitBase = `../../units/${unitId}/`;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = false;
      s.onload = () => resolve(src);
      s.onerror = () => reject(new Error(`Không tải được file: ${src}`));
      document.body.appendChild(s);
    });
  }

  function fixAssetPath(path) {
    if (!path || typeof path !== "string") return path;
    if (/^(https?:|data:|\/)/.test(path)) return path;
    if (path.startsWith("assets/")) return unitBase + path;
    return path;
  }

  function normalizeData() {
    const d = window.PRACTICE_DATA;
    if (!d || !Array.isArray(d.sections)) throw new Error("PRACTICE_DATA không đúng định dạng.");

    d.storageKey ||= `practice-${unitId}`;
    d.title ||= unitId.replace(/-/g, "_").replace(/\b\w/g, c => c.toUpperCase());

    d.sections.forEach(section => {
      (section.exercises || []).forEach(ex => {
        ex.audio = fixAssetPath(ex.audio);
        (ex.questions || []).forEach(q => {
          if (q.image) q.image = fixAssetPath(q.image);
          if (q.graphic) q.graphic = fixAssetPath(q.graphic);
        });
        (ex.sets || []).forEach(set => {
          if (set.image) set.image = fixAssetPath(set.image);
          if (set.graphic) set.graphic = fixAssetPath(set.graphic);
        });
      });
    });
  }

  try {
    await loadScript(unitBase + "data.js?v=" + Date.now());
    normalizeData();
    await loadScript("./app.js?v=2");
  } catch (e) {
    console.error("Practice Listening Loader Error:", e);
    showError(e.message || "Có lỗi khi tải dữ liệu.");
  }
})();