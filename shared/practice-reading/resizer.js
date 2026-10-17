(function () {

  const KEY = "practice-reading-width";

  function setupReadingColumns() {

    if (window.innerWidth <= 900) return;

    document.querySelectorAll(".layout").forEach(layout => {

      const passage =
        layout.querySelector(".passage-panel");

      const questions =
        layout.querySelector(".question-panel");

      if (!passage || !questions) return;


      /* Chiều cao phần còn lại của màn hình */
      const top =
        layout.getBoundingClientRect().top;

      const height =
        Math.max(
          420,
          window.innerHeight - top - 10
        );


      layout.style.setProperty(
        "display",
        "grid",
        "important"
      );

      layout.style.setProperty(
        "height",
        height + "px",
        "important"
      );

      layout.style.setProperty(
        "min-height",
        "0",
        "important"
      );

      layout.style.setProperty(
        "overflow",
        "hidden",
        "important"
      );


      /* Passage scroll riêng */
      passage.style.setProperty(
        "height",
        "100%",
        "important"
      );

      passage.style.setProperty(
        "min-height",
        "0",
        "important"
      );

      passage.style.setProperty(
        "min-width",
        "0",
        "important"
      );

      passage.style.setProperty(
        "overflow-y",
        "scroll",
        "important"
      );

      passage.style.setProperty(
        "overflow-x",
        "hidden",
        "important"
      );

      passage.style.setProperty(
        "border-right",
        "0",
        "important"
      );


      /* Questions scroll riêng */
      questions.style.setProperty(
        "height",
        "100%",
        "important"
      );

      questions.style.setProperty(
        "min-height",
        "0",
        "important"
      );

      questions.style.setProperty(
        "min-width",
        "0",
        "important"
      );

      questions.style.setProperty(
        "overflow-y",
        "scroll",
        "important"
      );

      questions.style.setProperty(
        "overflow-x",
        "hidden",
        "important"
      );


      /* Lấy độ rộng đã lưu */
      let width =
        parseFloat(
          localStorage.getItem(KEY)
        );

      if (
        !Number.isFinite(width) ||
        width < 25 ||
        width > 75
      ) {
        width = 50;
      }


      layout.style.setProperty(
        "grid-template-columns",
        `${width}% 10px minmax(0,1fr)`,
        "important"
      );


      /* Tạo thanh kéo */
      let bar =
        layout.querySelector(
          ":scope > .practice-column-resizer"
        );


      if (!bar) {

        bar =
          document.createElement("div");

        bar.className =
          "practice-column-resizer";


        Object.assign(
          bar.style,
          {
            width: "10px",
            height: "100%",
            background: "#eadfce",
            cursor: "col-resize",
            position: "relative",
            zIndex: "100",
            touchAction: "none"
          }
        );


        const grip =
          document.createElement("div");


        Object.assign(
          grip.style,
          {
            position: "absolute",
            top: "50%",
            left: "50%",
            transform:
              "translate(-50%,-50%)",

            width: "4px",
            height: "55px",

            borderRadius: "10px",

            background: "#d97706",

            pointerEvents: "none"
          }
        );


        bar.appendChild(grip);


        layout.insertBefore(
          bar,
          questions
        );

      }


      if (bar.dataset.ready === "1") {
        return;
      }

      bar.dataset.ready = "1";


      let dragging = false;


      bar.addEventListener(
        "pointerdown",
        event => {

          dragging = true;

          bar.setPointerCapture(
            event.pointerId
          );

          document.body.style.cursor =
            "col-resize";

          document.body.style.userSelect =
            "none";

          event.preventDefault();

        }
      );


      bar.addEventListener(
        "pointermove",
        event => {

          if (!dragging) return;


          const rect =
            layout.getBoundingClientRect();


          let percent =
            (
              (
                event.clientX -
                rect.left
              )
              /
              rect.width
            )
            * 100;


          percent =
            Math.max(
              25,
              Math.min(
                75,
                percent
              )
            );


          layout.style.setProperty(
            "grid-template-columns",
            `${percent}% 10px minmax(0,1fr)`,
            "important"
          );


          localStorage.setItem(
            KEY,
            percent.toFixed(2)
          );

        }
      );


      function stopDrag() {

        dragging = false;

        document.body.style.cursor = "";

        document.body.style.userSelect = "";

      }


      bar.addEventListener(
        "pointerup",
        stopDrag
      );

      bar.addEventListener(
        "pointercancel",
        stopDrag
      );


      /* Double click = trở về 50/50 */
      bar.addEventListener(
        "dblclick",
        () => {

          localStorage.removeItem(KEY);

          layout.style.setProperty(
            "grid-template-columns",
            "50% 10px minmax(0,1fr)",
            "important"
          );

        }
      );

    });

  }


  let waiting = false;


  function refresh() {

    if (waiting) return;

    waiting = true;


    requestAnimationFrame(() => {

      waiting = false;

      setupReadingColumns();

    });

  }


  /* app.js render Exercise/Set mới
     thì tự chạy lại */
  const observer =
    new MutationObserver(refresh);


  observer.observe(
    document.body,
    {
      childList: true,
      subtree: true
    }
  );


  window.addEventListener(
    "resize",
    refresh
  );


  window.addEventListener(
    "load",
    refresh
  );


  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      refresh
    );

  } else {

    refresh();

  }

})();
