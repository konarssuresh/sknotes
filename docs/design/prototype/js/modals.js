/* global window */
(function () {
  var root = null;

  function isMobile() {
    return window.innerWidth < 768;
  }

  function close() {
    if (root) root.innerHTML = "";
  }

  function confirm(options) {
    return new Promise(function (resolve) {
      root = document.getElementById("overlay-root");
      var mobile = isMobile();
      var overlay = document.createElement("div");
      overlay.className = mobile ? "overlay" : "overlay overlay--dialog";
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) {
          close();
          resolve(false);
        }
      });

      var panel = document.createElement("div");
      panel.className = mobile ? "sheet" : "dialog";
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-modal", "true");
      panel.setAttribute("aria-labelledby", "modal-title");

      if (mobile) {
        var handle = document.createElement("div");
        handle.className = "sheet__handle";
        panel.appendChild(handle);
      }

      var title = document.createElement("h2");
      title.id = "modal-title";
      title.className = "text-title";
      title.textContent = options.title || "Confirm";
      panel.appendChild(title);

      if (options.message) {
        var msg = document.createElement("p");
        msg.className = "text-body-sm text-muted";
        msg.style.marginTop = "8px";
        msg.textContent = options.message;
        panel.appendChild(msg);
      }

      var actions = document.createElement("div");
      actions.className = "modal-actions";

      var cancel = document.createElement("button");
      cancel.type = "button";
      cancel.className = "btn btn--secondary";
      cancel.textContent = options.cancelLabel || "Cancel";
      cancel.addEventListener("click", function () {
        close();
        resolve(false);
      });

      var ok = document.createElement("button");
      ok.type = "button";
      ok.className = options.destructive
        ? "btn btn--destructive"
        : "btn btn--primary";
      ok.textContent = options.confirmLabel || "OK";
      ok.addEventListener("click", function () {
        close();
        resolve(true);
      });

      actions.appendChild(cancel);
      actions.appendChild(ok);
      panel.appendChild(actions);
      overlay.appendChild(panel);
      root.appendChild(overlay);
      cancel.focus();
    });
  }

  function sheet(options) {
    return new Promise(function (resolve) {
      root = document.getElementById("overlay-root");
      var mobile = isMobile();
      var overlay = document.createElement("div");
      overlay.className = mobile ? "overlay" : "overlay overlay--dialog";

      var panel = document.createElement("div");
      panel.className = mobile ? "sheet" : "dialog";
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-modal", "true");

      if (mobile) {
        var handle = document.createElement("div");
        handle.className = "sheet__handle";
        panel.appendChild(handle);
      }

      if (options.title) {
        var title = document.createElement("h2");
        title.className = "text-title";
        title.textContent = options.title;
        panel.appendChild(title);
      }

      if (options.content) {
        panel.appendChild(options.content);
      }

      if (options.onClose) {
        overlay.addEventListener("click", function (e) {
          if (e.target === overlay) {
            close();
            options.onClose();
            resolve(null);
          }
        });
      }

      overlay.appendChild(panel);
      root.appendChild(overlay);
      resolve(panel);
    });
  }

  function promptInput(title, defaultValue) {
    return new Promise(function (resolve) {
      var wrap = document.createElement("div");
      wrap.style.marginTop = "12px";
      var input = document.createElement("input");
      input.className = "input";
      input.type = "text";
      input.value = defaultValue || "";
      wrap.appendChild(input);

      sheet({ title: title, content: wrap, onClose: function () {} }).then(
        function (panel) {
          if (!panel) {
            resolve(null);
            return;
          }
          var actions = document.createElement("div");
          actions.className = "modal-actions";
          var cancel = document.createElement("button");
          cancel.className = "btn btn--secondary";
          cancel.textContent = "Cancel";
          var ok = document.createElement("button");
          ok.className = "btn btn--primary";
          ok.textContent = "Save";
          cancel.onclick = function () {
            close();
            resolve(null);
          };
          ok.onclick = function () {
            close();
            resolve(input.value);
          };
          actions.appendChild(cancel);
          actions.appendChild(ok);
          panel.appendChild(actions);
          input.focus();
        }
      );
    });
  }

  function toast(message) {
    var t = document.getElementById("toast-root");
    t.innerHTML =
      '<div class="toast" role="status">' + escapeHtml(message) + "</div>";
    setTimeout(function () {
      t.innerHTML = "";
    }, 4000);
  }

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  window.Modals = {
    confirm: confirm,
    sheet: sheet,
    promptInput: promptInput,
    close: close,
    toast: toast,
    escapeHtml: escapeHtml,
  };
})();
