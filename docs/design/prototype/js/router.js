/* global window, Editor */
(function () {
  var listeners = [];
  var allowedHash = "#/";
  var guardInProgress = false;
  var skipGuardOnce = false;

  function parseHash(hash) {
    hash = hash || window.location.hash || "#/";
    var path = hash.replace(/^#/, "") || "/";
    var parts = path.split("/").filter(Boolean);

    if (parts.length === 0) return { name: "home", params: {} };
    if (parts[0] === "notes") return { name: "notes", params: {} };
    if (parts[0] === "editor" && parts[1])
      return { name: "editor", params: { id: parts[1] } };
    if (parts[0] === "tags") return { name: "tags", params: {} };
    if (parts[0] === "archive") return { name: "archive", params: {} };
    if (parts[0] === "trash" && parts[1])
      return { name: "trashPreview", params: { id: parts[1] } };
    if (parts[0] === "trash") return { name: "trash", params: {} };
    if (parts[0] === "settings") return { name: "settings", params: {} };
    if (parts[0] === "login") return { name: "login", params: {} };
    if (parts[0] === "signup") return { name: "signup", params: {} };
    if (parts[0] === "forgot-password")
      return { name: "forgotPassword", params: {} };
    return { name: "home", params: {} };
  }

  function parse() {
    return parseHash(window.location.hash);
  }

  function toHash(path) {
    if (!path) return "#/";
    if (path.charAt(0) === "#") return path;
    return "#" + (path.charAt(0) === "/" ? path : "/" + path);
  }

  function emit() {
    var route = parse();
    listeners.forEach(function (fn) {
      fn(route);
    });
  }

  function completeNavigation(toHash, fromHash) {
    allowedHash = toHash;
    if (Editor && Editor.onNavigateAway) {
      Editor.onNavigateAway(fromHash, toHash);
    }
    emit();
  }

  function navigate(path) {
    var hash = toHash(path);
    var fromHash = allowedHash || window.location.hash || "#/";

    if (hash === window.location.hash && hash === allowedHash) {
      emit();
      return Promise.resolve(true);
    }

    return Editor.guardNavigation(hash, fromHash).then(function (allow) {
      if (!allow) return false;
      skipGuardOnce = true;
      if (window.location.hash !== hash) {
        window.location.hash = hash;
      } else {
        completeNavigation(hash, fromHash);
        skipGuardOnce = false;
      }
      return true;
    });
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  window.addEventListener("hashchange", function () {
    if (guardInProgress) return;
    var toHash = window.location.hash || "#/";
    var fromHash = allowedHash;

    if (toHash === fromHash) {
      emit();
      return;
    }

    if (skipGuardOnce) {
      skipGuardOnce = false;
      completeNavigation(toHash, fromHash);
      return;
    }

    guardInProgress = true;
    Editor.guardNavigation(toHash, fromHash)
      .then(function (allow) {
        if (allow) {
          completeNavigation(toHash, fromHash);
        } else if (window.location.hash !== fromHash) {
          window.location.replace(fromHash || "#/");
        }
      })
      .finally(function () {
        guardInProgress = false;
      });
  });

  document.addEventListener("click", function (e) {
    var link = e.target.closest("a[href^='#']");
    if (!link) return;
    if (!link.closest("#app")) return;
    var href = link.getAttribute("href");
    if (!href || href === "#") return;
    e.preventDefault();
    navigate(href.replace(/^#/, ""));
  });

  window.Router = {
    parse: parse,
    parseHash: parseHash,
    navigate: navigate,
    onChange: onChange,
    emit: emit,
    setAllowedHash: function (h) {
      allowedHash = h || "#/";
    },
  };
})();
