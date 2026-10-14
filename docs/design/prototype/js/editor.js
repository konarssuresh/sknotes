/* global window, Store, Router, Modals, Icons, Review */
(function () {
  var saveTimer = null;
  var saveState = "idle";
  var saveInFlight = false;
  var lastSaveFailed = false;
  var currentNoteId = null;
  var pendingPayload = null;

  function hasMeaningfulContent(title, bodyText) {
    return (
      (title || "").trim().length > 0 || (bodyText || "").trim().length > 0
    );
  }

  function readEditorFields() {
    var titleEl = document.getElementById("editor-title");
    var bodyEl = document.getElementById("editor-body");
    if (!titleEl || !bodyEl) return null;
    return {
      titleEl: titleEl,
      bodyEl: bodyEl,
      title: titleEl.value,
      bodyText: bodyEl.innerText || "",
      bodyHtml: bodyEl.innerHTML,
    };
  }

  function ensureCommitted(noteId, fields) {
    if (!Store.isDraftId(noteId)) return true;
    if (!fields) fields = readEditorFields();
    if (!fields || !hasMeaningfulContent(fields.title, fields.bodyText))
      return false;
    Store.commitDraft(noteId, {
      title: fields.title,
      bodyHtml: fields.bodyHtml,
      bodyText: fields.bodyText,
    });
    return true;
  }

  function getSaveDisplay() {
    var ov = Review.getOverrides().saveStateOverride;
    if (ov && ov !== "auto") {
      if (ov === "saving") return { text: "Saving…", className: "save-status" };
      if (ov === "saved")
        return { text: "Saved", className: "save-status save-status--saved" };
      if (ov === "error")
        return {
          text: "Couldn't save",
          className: "save-status save-status--error",
          error: true,
        };
    }
    if (saveState === "saving")
      return { text: "Saving…", className: "save-status" };
    if (saveState === "saved")
      return { text: "Saved", className: "save-status save-status--saved" };
    if (saveState === "error")
      return {
        text: "Couldn't save",
        className: "save-status save-status--error",
        error: true,
      };
    return { text: "", className: "save-status" };
  }

  function persist(noteId, titleEl, bodyEl) {
    var fields = {
      title: titleEl.value,
      bodyText: bodyEl.innerText || "",
      bodyHtml: bodyEl.innerHTML,
      titleEl: titleEl,
      bodyEl: bodyEl,
    };
    if (!ensureCommitted(noteId, fields)) return;
    noteId = currentNoteId;

    var note = Store.getNote(noteId);
    if (!note || note.trashed) return;

    pendingPayload = {
      title: fields.title,
      bodyHtml: fields.bodyHtml,
      bodyText: fields.bodyText,
    };

    saveState = "saving";
    saveInFlight = true;
    updateStatusEl();

    var ov = Review.getOverrides().saveStateOverride;
    if (ov === "error") {
      setTimeout(function () {
        saveInFlight = false;
        saveState = "error";
        lastSaveFailed = true;
        updateStatusEl();
      }, 400);
      return;
    }

    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      Store.updateNote(noteId, pendingPayload);
      saveInFlight = false;
      lastSaveFailed = false;
      saveState = "saved";
      updateStatusEl();
      setTimeout(function () {
        if (saveState === "saved") {
          saveState = "idle";
          updateStatusEl();
        }
      }, 2000);
    }, 600);
  }

  function updateStatusEl() {
    var el = document.getElementById("save-status");
    if (!el) return;
    var d = getSaveDisplay();
    el.className = d.className;
    el.setAttribute("aria-live", "polite");
    if (d.error) {
      el.innerHTML =
        'Couldn\'t save <button type="button" class="save-status__retry" id="save-retry">Retry</button>';
      var retry = document.getElementById("save-retry");
      if (retry) {
        retry.addEventListener("click", function () {
          lastSaveFailed = false;
          var titleEl = document.getElementById("editor-title");
          var bodyEl = document.getElementById("editor-body");
          if (currentNoteId && titleEl && bodyEl)
            persist(currentNoteId, titleEl, bodyEl);
        });
      }
    } else {
      el.textContent = d.text;
    }
  }

  function clearSaveFlags() {
    saveInFlight = false;
    lastSaveFailed = false;
    saveState = "idle";
    clearTimeout(saveTimer);
  }

  function canLeaveWithoutPrompt() {
    return !saveInFlight && !lastSaveFailed;
  }

  function editorIdFromHash(hash) {
    var route = Router.parseHash(hash);
    return route.name === "editor" ? route.params.id : null;
  }

  function guardNavigation(targetHash, fromHash) {
    return new Promise(function (resolve) {
      fromHash = fromHash || window.location.hash || "#/";
      var toRoute = Router.parseHash(targetHash);
      var editingId = editorIdFromHash(fromHash);

      if (!editingId) {
        resolve(true);
        return;
      }

      var fromRoute = Router.parseHash(fromHash);
      if (
        fromRoute.name === "editor" &&
        toRoute.name === "editor" &&
        fromRoute.params.id === toRoute.params.id
      ) {
        resolve(true);
        return;
      }

      var fields = readEditorFields();

      if (
        Store.isDraftId(editingId) &&
        (!fields || !hasMeaningfulContent(fields.title, fields.bodyText))
      ) {
        resolve(true);
        return;
      }

      if (canLeaveWithoutPrompt()) {
        resolve(true);
        return;
      }

      Modals.confirm({
        title: "Leave without saving?",
        message: "Your changes may not be saved yet.",
        cancelLabel: "Stay",
        confirmLabel: "Leave",
      }).then(function (ok) {
        if (ok) clearSaveFlags();
        resolve(!!ok);
      });
    });
  }

  function onNavigateAway(fromHash, toHash) {
    clearTimeout(saveTimer);
    var editingId = editorIdFromHash(fromHash);
    var fields = readEditorFields();

    if (editingId && Store.isDraftId(editingId)) {
      if (!fields || !hasMeaningfulContent(fields.title, fields.bodyText)) {
        Store.discardDraft();
      }
    }

    clearSaveFlags();
    currentNoteId = null;
  }

  function goBack() {
    Router.navigate(window.App.getBackPath());
  }

  function exec(cmd, val) {
    document.execCommand(cmd, false, val || null);
    var bodyEl = document.getElementById("editor-body");
    var titleEl = document.getElementById("editor-title");
    if (currentNoteId && bodyEl && titleEl)
      persist(currentNoteId, titleEl, bodyEl);
  }

  function showOverflow(noteId) {
    var note = Store.getNote(noteId);
    if (!note) return;

    var list = document.createElement("div");
    list.className = "menu-list";

    function item(label, danger, fn) {
      var b = document.createElement("button");
      b.type = "button";
      b.className =
        "menu-list__item" + (danger ? " menu-list__item--danger" : "");
      b.textContent = label;
      b.addEventListener("click", function () {
        Modals.close();
        fn();
      });
      list.appendChild(b);
    }

    item(note.pinned ? "Unpin" : "Pin", false, function () {
      Store.updateNote(noteId, { pinned: !note.pinned });
      window.App.render();
    });

    item("Tags", false, function () {
      showTagsSheet(noteId);
    });

    if (note.archived) {
      item("Unarchive", false, function () {
        Store.updateNote(noteId, { archived: false });
        Modals.toast("Note unarchived");
        window.App.render();
      });
    } else {
      item("Archive", false, function () {
        Store.updateNote(noteId, { archived: true });
        Modals.toast("Note archived");
        Router.navigate("/archive");
      });
    }

    item("Move to Trash", true, function () {
      Modals.confirm({
        title: "Move to trash?",
        message: "You can restore this note from Trash.",
        confirmLabel: "Move to Trash",
      }).then(function (ok) {
        if (ok) {
          Store.updateNote(noteId, { trashed: true, archived: false });
          Router.navigate("/trash");
        }
      });
    });

    Modals.sheet({
      title: "Note actions",
      content: list,
      onClose: function () {},
    });
  }

  function showTagsSheet(noteId) {
    var note = Store.getNote(noteId);
    if (!note) return;

    var wrap = document.createElement("div");
    wrap.style.marginTop = "12px";
    var all = Store.allTagsSorted().map(function (t) {
      return t.name;
    });

    all.forEach(function (tag) {
      var row = document.createElement("label");
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.gap = "8px";
      row.style.minHeight = "44px";
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = note.tags.indexOf(tag) >= 0;
      cb.addEventListener("change", function () {
        if (cb.checked) Store.addTagToNote(noteId, tag);
        else Store.removeTagFromNote(noteId, tag);
      });
      row.appendChild(cb);
      row.appendChild(document.createTextNode(tag));
      wrap.appendChild(row);
    });

    var addRow = document.createElement("div");
    addRow.style.marginTop = "12px";
    addRow.style.display = "flex";
    addRow.style.gap = "8px";
    var inp = document.createElement("input");
    inp.className = "input";
    inp.placeholder = "New tag";
    var addBtn = document.createElement("button");
    addBtn.className = "btn btn--primary btn--sm";
    addBtn.textContent = "Add";
    addBtn.addEventListener("click", function () {
      var name = Store.normalizeTagName(inp.value);
      if (name) Store.createStandaloneTag(name);
      Store.addTagToNote(noteId, inp.value);
      inp.value = "";
      Modals.close();
      showTagsSheet(noteId);
    });
    addRow.appendChild(inp);
    addRow.appendChild(addBtn);
    wrap.appendChild(addRow);

    Modals.sheet({ title: "Tags", content: wrap, onClose: function () {} });
  }

  function showMoreFormats() {
    var list = document.createElement("div");
    list.className = "menu-list";
    [
      [
        "Heading 2",
        function () {
          exec("formatBlock", "h2");
        },
      ],
      [
        "Strikethrough",
        function () {
          exec("strikeThrough");
        },
      ],
    ].forEach(function (pair) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "menu-list__item";
      b.textContent = pair[0];
      b.addEventListener("click", function () {
        Modals.close();
        pair[1]();
      });
      list.appendChild(b);
    });
    Modals.sheet({
      title: "More formatting",
      content: list,
      onClose: function () {},
    });
  }

  function mountEditor(container, noteId, embedded) {
    currentNoteId = noteId;
    var note = Store.getNote(noteId);
    if (!note) {
      container.innerHTML = "<p class='text-muted'>Note not found.</p>";
      return;
    }
    if (note.trashed) {
      Router.navigate("/trash/" + noteId);
      return;
    }

    if (!embedded) {
      saveState = "idle";
      lastSaveFailed = false;
      saveInFlight = false;
    }

    var archived = note.archived;
    var html =
      '<div class="editor-screen">' +
      (embedded
        ? '<header class="screen-header" style="min-height:40px">' +
          '<span id="save-status" class="save-status" aria-live="polite" style="margin-left:auto"></span>' +
          '<button type="button" class="btn btn--icon btn--ghost" id="editor-overflow" aria-label="More actions">' +
          Icons.more +
          "</button></header>"
        : '<header class="screen-header">' +
          '<button type="button" class="btn btn--icon btn--ghost" id="editor-back" aria-label="Back">' +
          Icons.chevronLeft +
          "</button>" +
          '<h1 class="sr-only">Edit note</h1>' +
          '<span id="save-status" class="save-status" aria-live="polite"></span>' +
          '<button type="button" class="btn btn--icon btn--ghost" id="editor-overflow" aria-label="More actions">' +
          Icons.more +
          "</button></header>") +
      '<input type="text" class="editor-title" id="editor-title" placeholder="Title" value="' +
      Modals.escapeHtml(note.title) +
      '" />' +
      '<div class="editor-toolbar" role="toolbar" aria-label="Formatting">' +
      '<button type="button" class="btn btn--icon btn--ghost" data-cmd="bold" aria-label="Bold">' +
      Icons.bold +
      "</button>" +
      '<button type="button" class="btn btn--icon btn--ghost" data-cmd="italic" aria-label="Italic">' +
      Icons.italic +
      "</button>" +
      '<button type="button" class="btn btn--icon btn--ghost" data-cmd="insertUnorderedList" aria-label="Bullet list">' +
      Icons.list +
      "</button>" +
      '<button type="button" class="btn btn--icon btn--ghost" data-cmd="insertOrderedList" aria-label="Numbered list">' +
      Icons.listOrdered +
      "</button>" +
      '<button type="button" class="btn btn--icon btn--ghost" id="editor-link" aria-label="Link">' +
      Icons.link +
      "</button>" +
      '<button type="button" class="btn btn--ghost btn--sm" id="editor-more">More</button>' +
      (archived
        ? '<span class="badge" style="margin-left:auto">Archived</span>'
        : "") +
      "</div>" +
      '<div class="editor-body" id="editor-body" contenteditable="true" role="textbox" aria-multiline="true"></div>' +
      "</div>";

    container.innerHTML = html;

    var titleEl = document.getElementById("editor-title");
    var bodyEl = document.getElementById("editor-body");
    bodyEl.innerHTML = note.bodyHtml || "";

    if (!embedded) {
      document.getElementById("editor-back").addEventListener("click", goBack);
    }
    var overflow = document.getElementById("editor-overflow");
    if (overflow) {
      overflow.addEventListener("click", function () {
        showOverflow(noteId);
      });
    }
    updateStatusEl();

    container.querySelectorAll("[data-cmd]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        exec(btn.getAttribute("data-cmd"));
      });
    });

    document
      .getElementById("editor-link")
      .addEventListener("click", function () {
        var url = window.prompt("Enter URL");
        if (url) exec("createLink", url);
      });

    document
      .getElementById("editor-more")
      .addEventListener("click", showMoreFormats);

    function onInput() {
      persist(noteId, titleEl, bodyEl);
    }

    titleEl.addEventListener("input", onInput);
    bodyEl.addEventListener("input", onInput);

    setTimeout(function () {
      bodyEl.focus();
    }, 50);
  }

  function initNewNote() {
    if (Store.hasDraft()) {
      Router.navigate("/editor/" + Store.getState().draft.id);
      return Store.getState().draft.id;
    }
    var note = Store.beginDraft();
    Router.navigate("/editor/" + note.id);
    return note.id;
  }

  window.Editor = {
    mountEditor: mountEditor,
    initNewNote: initNewNote,
    canLeaveWithoutPrompt: canLeaveWithoutPrompt,
    goBack: goBack,
    guardNavigation: guardNavigation,
    onNavigateAway: onNavigateAway,
    getSaveDisplay: getSaveDisplay,
    resetSaveState: clearSaveFlags,
  };
})();
