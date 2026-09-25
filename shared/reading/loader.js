(async () => {
  const params = new URLSearchParams(window.location.search);
  const test = params.get("test") || "ets2024-t1";

  const base = `../../tests/${test}/reading/`;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  await loadScript(base + "config.js");
  await loadScript(base + "data.js");
  await loadScript(base + "explanation-fixes.js");
  await loadScript("./app.js");
})();
