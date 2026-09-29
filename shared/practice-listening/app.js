(function () {

  const app = document.getElementById("practice-app");
  const data = window.PRACTICE_DATA;

  app.innerHTML = `
    <div style="
      max-width:700px;
      margin:80px auto;
      padding:40px;
      font-family:Arial,sans-serif;
      border:2px solid #f59e0b;
      border-radius:20px;
      text-align:center;
    ">

      <h1>TOEIC EVERYDAY</h1>

      <h2>Listening Practice</h2>

      <p>Practice Unit đã được tải thành công.</p>

      <p>
        <strong>Storage Key:</strong>
        ${data.storageKey || "Chưa thiết lập"}
      </p>

    </div>
  `;

})();
