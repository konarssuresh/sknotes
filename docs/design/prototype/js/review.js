/* global window */
(function () {
  var overrides = {
    listState: "default",
    emptyData: false,
    saveStateOverride: "auto",
  };

  function getOverrides() {
    return overrides;
  }

  function mount() {
    var root = document.getElementById("review-root");
    root.innerHTML =
      '<div class="review-panel" id="review-panel">' +
      '<button type="button" class="review-panel__toggle" id="review-toggle" aria-expanded="false">Review</button>' +
      '<div class="review-panel__body">' +
      "<strong>Prototype review</strong>" +
      '<label>List state<select id="review-list-state">' +
      '<option value="default">Default</option>' +
      '<option value="loading">Loading</option>' +
      '<option value="error">Error</option>' +
      '<option value="empty">Empty data</option>' +
      "</select></label>" +
      '<label>Editor save<select id="review-save-state">' +
      '<option value="auto">Auto (live)</option>' +
      '<option value="saving">Saving</option>' +
      '<option value="saved">Saved</option>' +
      '<option value="error">Error + Retry</option>' +
      "</select></label>" +
      '<button type="button" class="btn btn--sm btn--secondary" id="review-reset-data" style="margin-top:8px;width:100%">Reset sample data</button>' +
      "</div></div>";

    var panel = document.getElementById("review-panel");
    var toggle = document.getElementById("review-toggle");
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("review-panel--open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    document
      .getElementById("review-list-state")
      .addEventListener("change", function (e) {
        var v = e.target.value;
        overrides.listState = v === "default" ? "default" : v;
        if (v === "empty") {
          overrides.emptyData = true;
          overrides.listState = "empty";
          window.Store.clearAllNotes();
        } else {
          if (overrides.emptyData) {
            overrides.emptyData = false;
            window.Store.resetToSeed();
          }
        }
        window.App.render();
      });

    document
      .getElementById("review-save-state")
      .addEventListener("change", function (e) {
        overrides.saveStateOverride = e.target.value;
        window.App.render();
      });

    document
      .getElementById("review-reset-data")
      .addEventListener("click", function () {
        overrides.listState = "default";
        overrides.emptyData = false;
        document.getElementById("review-list-state").value = "default";
        window.Store.resetToSeed();
        window.App.render();
      });
  }

  window.Review = {
    mount: mount,
    getOverrides: getOverrides,
  };
})();
