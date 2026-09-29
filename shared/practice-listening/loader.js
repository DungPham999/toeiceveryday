(function () {

  const params = new URLSearchParams(window.location.search);
  const unitId = params.get("unit");

  const app = document.getElementById("practice-app");

  if (!unitId) {
    app.innerHTML = `
      <div class="practice-error">
        <h2>Không tìm thấy Practice Unit</h2>
        <p>URL chưa có mã Unit.</p>
      </div>
    `;
    return;
  }

  if (!/^[a-z0-9-]+$/.test(unitId)) {
    app.innerHTML = `
      <div class="practice-error">
        <h2>Unit không hợp lệ</h2>
      </div>
    `;
    return;
  }

  const dataScript = document.createElement("script");

  dataScript.src = `../../units/${unitId}/data.js`;

  dataScript.onload = function () {

    if (!window.PRACTICE_DATA) {
      app.innerHTML = `
        <div class="practice-error">
          <h2>Không đọc được dữ liệu</h2>
          <p>Unit ${unitId} chưa có dữ liệu hợp lệ.</p>
        </div>
      `;
      return;
    }

    const appScript = document.createElement("script");

    appScript.src = "app.js";

    document.body.appendChild(appScript);
  };

  dataScript.onerror = function () {
    app.innerHTML = `
      <div class="practice-error">
        <h2>Không tải được Practice Unit</h2>
        <p>Không tìm thấy: ${unitId}</p>
      </div>
    `;
  };

  document.body.appendChild(dataScript);

})();
