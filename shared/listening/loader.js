(async () => {
  /*
   * TOEIC EVERYDAY — Shared Listening Loader
   *
   * URL ví dụ:
   * listening.html?test=ets2024-t1
   * listening.html?test=ets2024-t2
   */

  const params = new URLSearchParams(window.location.search);

  // Nếu URL không ghi test thì mặc định Test 1
  const testId = params.get("test") || "ets2024-t1";

  // Chỉ cho phép dạng tên an toàn
  if (!/^[a-z0-9-]+$/i.test(testId)) {
    showError("Tên bộ đề không hợp lệ.");
    return;
  }

  // reading/listening.html nằm trong:
  // shared/listening/
  //
  // data nằm trong:
  // tests/ets2024-t1/listening/
  const testBase = `../../tests/${testId}/listening/`;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");

      script.src = src;
      script.async = false;

      script.onload = () => resolve(src);

      script.onerror = () => {
        reject(
          new Error(`Không tải được file: ${src}`)
        );
      };

      document.body.appendChild(script);
    });
  }

  function fixAssetPath(path) {
    if (!path || typeof path !== "string") {
      return path;
    }

    // URL tuyệt đối hoặc data URL thì giữ nguyên
    if (
      path.startsWith("http://") ||
      path.startsWith("https://") ||
      path.startsWith("data:") ||
      path.startsWith("/")
    ) {
      return path;
    }

    /*
     * Data cũ đang dùng:
     * assets/audio/Test_01.mp3
     * assets/images/q1.jpg
     *
     * Ta đổi thành:
     * ../../tests/ets2024-t1/listening/assets/...
     */
    if (path.startsWith("assets/")) {
      return testBase + path;
    }

    return path;
  }

  function normalizeTestData() {
    if (!Array.isArray(window.TEST_DATA)) {
      throw new Error(
        "TEST_DATA không tồn tại hoặc data.js không đúng định dạng."
      );
    }

    window.TEST_DATA.forEach(item => {

      // Audio
      if (item.audio) {
        item.audio = fixAssetPath(item.audio);
      }

      // Part 1 image
      if (item.image) {
        item.image = fixAssetPath(item.image);
      }

      // Part 3 / Part 4 graphic
      if (item.graphic) {
        item.graphic = fixAssetPath(item.graphic);
      }

    });
  }

  function normalizeConfig() {
    if (!window.TEST_CONFIG) {
      window.TEST_CONFIG = {};
    }

    /*
     * Vì listening.html hiện nằm ở:
     * shared/listening/
     *
     * ../../ sẽ quay về root:
     * toeiceveryday/
     */
    window.TEST_CONFIG.homeUrl = "../../";

    /*
     * Nếu config.js cũ chưa có storageKey,
     * loader tự tạo theo testId.
     *
     * ets2024-t1 → ets2024-t1
     * ets2024-t2 → ets2024-t2
     */
    if (!window.TEST_CONFIG.storageKey) {
      window.TEST_CONFIG.storageKey = testId;
    }
  }

  function showError(message) {
    document.body.innerHTML = `
      <main style="
        max-width:760px;
        margin:70px auto;
        padding:28px;
        font-family:system-ui,-apple-system,sans-serif;
      ">
        <div style="
          border:1px solid #f0c47c;
          background:#fff8e8;
          border-radius:18px;
          padding:24px;
        ">
          <h2 style="
            margin-top:0;
            color:#8d4c00;
          ">
            Không tải được bài Listening
          </h2>

          <p style="
            line-height:1.6;
            color:#665548;
          ">
            ${message}
          </p>

          <p style="
            line-height:1.6;
            color:#665548;
          ">
            Bộ đề đang yêu cầu:
            <strong>${testId}</strong>
          </p>

          <a href="../../"
             style="
               color:#d97706;
               font-weight:700;
             ">
            ← Về trang chủ
          </a>
        </div>
      </main>
    `;
  }

  try {

    /*
     * PHẢI tải đúng thứ tự.
     *
     * 1. config
     * 2. timestamp
     * 3. data
     * 4. sửa đường dẫn assets
     * 5. app
     */

    await loadScript(
      testBase + "config.js"
    );

    await loadScript(
      testBase + "audio-times.js"
    );

    await loadScript(
      testBase + "data.js"
    );

    normalizeConfig();

    normalizeTestData();

    /*
     * app.js dùng chung chỉ được chạy SAU
     * khi config/data/audio-times đã sẵn sàng.
     */
    await loadScript("./app.js");

  } catch (error) {

    console.error(
      "TOEIC Listening Loader Error:",
      error
    );

    showError(
      error.message ||
      "Có lỗi khi tải dữ liệu bộ đề."
    );
  }

})();
