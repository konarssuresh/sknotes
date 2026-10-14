/* global window */
(function () {
  var KEY = "notes-proto-theme";
  var mode = "system";

  try {
    mode = sessionStorage.getItem(KEY) || "system";
  } catch (e) {}

  function apply() {
    var dark = false;
    if (mode === "dark") dark = true;
    else if (mode === "light") dark = false;
    else dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
  }

  function setMode(m) {
    mode = m;
    try {
      sessionStorage.setItem(KEY, m);
    } catch (e) {}
    apply();
  }

  function getMode() {
    return mode;
  }

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", function () {
      if (mode === "system") apply();
    });

  window.Theme = {
    apply: apply,
    setMode: setMode,
    getMode: getMode,
  };

  apply();
})();
