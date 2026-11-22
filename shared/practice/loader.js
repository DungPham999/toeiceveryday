(async () => {
  const params = new URLSearchParams(location.search);
  const unit = params.get("unit");

  const fail = message => {
    document.body.innerHTML = `
      <main style="max-width:760px;margin:70px auto;padding:28px;font-family:system-ui">
        <div style="border:1px solid #f0c47c;background:#fff8e8;border-radius:18px;padding:24px">
          <h2>Không tải được Practice Unit</h2>
          <p>${message}</p>
          <a href="../../">← Trang chủ</a>
        </div>
      </main>`;
  };

  if (!unit || !/^[a-z0-9-]+$/i.test(unit)) {
    return fail("URL chưa có Unit hợp lệ.");
  }

  const base = `../../units/${unit}/`;

  const load = src => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Không tải được " + src));
    document.body.appendChild(script);
  });

  // Explanation fixes are optional so other Practice Units continue working unchanged.
  const loadOptional = async src => {
    try {
      await load(src);
      return true;
    } catch (error) {
      console.info("[Practice] Không có file explanation-fixes.js; giữ explanation trong data.js.");
      return false;
    }
  };

  const fixAssetPath = value =>
    !value || /^(https?:|data:|\/)/.test(value)
      ? value
      : (value.startsWith("assets/") ? base + value : value);

  const applyReadingExplanationFixes = data => {
    const fixes = window.READING_EXPLANATION_FIXES || {};
    let applied = 0;

    const applyToQuestion = question => {
      const number = question.number ?? question.n;
      if (number == null) return;

      const key = String(number);
      if (Object.prototype.hasOwnProperty.call(fixes, key)) {
        question.explanation = fixes[key];
        applied += 1;
      }
    };

    (data.sections || []).forEach(section => {
      (section.exercises || []).forEach(exercise => {
        (exercise.questions || []).forEach(applyToQuestion);
        (exercise.sets || []).forEach(set => {
          (set.questions || []).forEach(applyToQuestion);
        });
      });
    });

    console.info(`[Practice] Applied ${applied} reading explanation override(s).`);
    return applied;
  };

  try {
    await load(base + "data.js?v=" + Date.now());

    const data = window.PRACTICE_DATA;
    if (!data) throw new Error("Không tìm thấy PRACTICE_DATA.");

    // Load after data.js and before app.js so the updated explanations are ready to render.
    delete window.READING_EXPLANATION_FIXES;
    await loadOptional(base + "explanation-fixes.js?v=" + Date.now());
    applyReadingExplanationFixes(data);

    (data.sections || []).forEach(section => {
      (section.exercises || []).forEach(exercise => {
        exercise.audio = fixAssetPath(exercise.audio);
        (exercise.questions || []).forEach(question => {
          question.image = fixAssetPath(question.image);
          question.graphic = fixAssetPath(question.graphic);
        });
        (exercise.sets || []).forEach(set => {
          set.image = fixAssetPath(set.image);
          set.graphic = fixAssetPath(set.graphic);
        });
      });
    });

    await load("./app.js?v=" + Date.now());
  } catch (error) {
    console.error(error);
    fail(error.message);
  }
})();
