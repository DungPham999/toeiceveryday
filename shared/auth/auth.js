(function () {

  const AUTH_KEY = "toeic-everyday-auth";

  // Dán mã SHA-256 của mật khẩu hiện tại vào đây
  const PASSWORD_HASH =
    "2b9739ac3f069e8cd93a972da4d7db564ec4d1fd9a7b482c0d1b8635b0ed5666";


  function isAuthenticated() {

    return localStorage.getItem(AUTH_KEY)
      === PASSWORD_HASH;

  }


  if (!isAuthenticated()) {

    // Ghi nhớ trang học viên đang muốn vào
    const currentUrl =
      window.location.pathname +
      window.location.search +
      window.location.hash;

    sessionStorage.setItem(
      "toeic-return-url",
      currentUrl
    );


    // Repo GitHub Pages của bạn nằm tại /toeiceveryday/
    const base =
      "/toeiceveryday/";


    // Chuyển sang trang nhập mật khẩu
    window.location.replace(
      base + "login.html"
    );

  }

  window.logoutToeic = function () {

  localStorage.removeItem(
    "toeic-everyday-auth"
  );

  sessionStorage.removeItem(
    "toeic-return-url"
  );

  window.location.replace(
    "/toeiceveryday/login.html"
  );

};
  
})();
