/* global window, Store, Router, Icons, Modals, Review, Editor */
(function () {
  function listStateBanner(retryFn) {
    var ov = Review.getOverrides().listState;
    if (ov === "error") {
      return (
        '<div class="banner" role="alert">' +
        "<span>Couldn't load notes</span>" +
        '<button type="button" class="btn btn--sm btn--secondary" data-retry-list>Retry</button></div>'
      );
    }
    return "";
  }

  function skeletonList(n) {
    var h = "";
    for (var i = 0; i < (n || 6); i++) {
      h += '<div class="skeleton skeleton-card"></div>';
    }
    return h;
  }

  function renderTags(tags, max) {
    max = max || 3;
    if (!tags || !tags.length) return "";
    var vis = tags.slice(0, max);
    var extra =
      tags.length > max
        ? '<span class="text-caption text-muted">+' +
          (tags.length - max) +
          "</span>"
        : "";
    return (
      '<span class="note-card__tags">' +
      vis
        .map(function (t) {
          return '<span class="tag">' + Modals.escapeHtml(t) + "</span>";
        })
        .join("") +
      extra +
      "</span>"
    );
  }

  function noteCardHtml(note, opts) {
    opts = opts || {};
    var href = opts.trash ? "#/trash/" + note.id : "#/editor/" + note.id;
    var muted = opts.muted ? " note-card--muted" : "";
    var badge = opts.archivedBadge ? '<span class="badge">Archived</span>' : "";
    return (
      '<li><button type="button" class="note-card' +
      muted +
      '" data-href="' +
      href +
      '" data-note-id="' +
      note.id +
      '">' +
      '<div class="note-card__title-row">' +
      '<span class="note-card__title text-title">' +
      Modals.escapeHtml(Store.displayTitle(note)) +
      "</span>" +
      (note.pinned && !opts.trash
        ? '<span class="pin-icon" aria-label="Pinned">' + Icons.pin + "</span>"
        : "") +
      badge +
      "</div>" +
      '<p class="note-card__preview text-body-sm text-muted">' +
      Modals.escapeHtml(note.bodyText || "") +
      "</p>" +
      '<div class="note-card__meta">' +
      renderTags(note.tags) +
      '<span class="text-caption text-muted">' +
      Store.relativeTime(note.updatedAt) +
      "</span></div></button></li>"
    );
  }

  function bindNoteCards(root, onSelect) {
    root.querySelectorAll(".note-card[data-href]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-note-id");
        var href = btn.getAttribute("data-href");
        if (onSelect) onSelect(id);
        else Router.navigate(href.replace("#", ""));
      });
    });
    var retry = root.querySelector("[data-retry-list]");
    if (retry) {
      retry.addEventListener("click", function () {
        Review.getOverrides().listState = "default";
        document.getElementById("review-list-state").value = "default";
        window.App.render();
      });
    }
  }

  function searchInput(id, value, placeholder) {
    return (
      '<div class="search-wrap" style="margin-bottom:16px">' +
      '<span class="search-wrap__icon">' +
      Icons.search +
      "</span>" +
      '<input type="search" class="input" id="' +
      id +
      '" placeholder="' +
      placeholder +
      '" value="' +
      Modals.escapeHtml(value) +
      '" autocomplete="off" />' +
      (value
        ? '<button type="button" class="btn btn--icon btn--ghost search-wrap__clear" id="' +
          id +
          '-clear" aria-label="Clear search">' +
          Icons.x +
          "</button>"
        : "") +
      "</div>"
    );
  }

  function bindSearch(id, onChange) {
    var input = document.getElementById(id);
    if (!input) return;
    var timer;
    input.addEventListener("input", function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        onChange(input.value);
      }, 300);
    });
    var clear = document.getElementById(id + "-clear");
    if (clear) {
      clear.addEventListener("click", function () {
        input.value = "";
        onChange("");
        window.App.render();
      });
    }
    if (Store.getState().focusNotesSearch && id === "notes-search") {
      setTimeout(function () {
        input.focus();
        Store.setFocusNotesSearch(false);
      }, 50);
    }
  }

  function renderHome() {
    var ov = Review.getOverrides().listState;
    if (ov === "loading") {
      return (
        '<div class="screen-content screen-content--centered">' +
        searchInput("home-search", "", "Search notes") +
        skeletonList(5) +
        "</div>"
      );
    }

    var active = Store.activeNotes();
    if (!active.length || ov === "empty") {
      return (
        '<div class="screen-content screen-content--centered">' +
        '<div class="empty-state">' +
        '<h1 class="text-display">Your notes live here</h1>' +
        '<p class="text-body-sm text-muted">Capture ideas quickly and find them when you need them.</p>' +
        '<button type="button" class="btn btn--primary" id="empty-create">Create note</button>' +
        "</div></div>"
      );
    }

    var pins = Store.pinnedNotes();
    var showPins = pins;
    var limit = 5;
    var expanded = Store.getState().homePinsExpanded;
    if (!expanded && pins.length > limit) showPins = pins.slice(0, limit);
    var seeAll =
      pins.length > limit
        ? '<button type="button" class="btn btn--ghost btn--sm" id="pins-see-all">' +
          (expanded ? "Show less" : "See all") +
          "</button>"
        : "";

    var pinSection = "";
    if (pins.length) {
      var pinHtml = showPins
        .map(function (n) {
          return (
            '<button type="button" class="pin-mini" data-href="#/editor/' +
            n.id +
            '"><span class="pin-icon">' +
            Icons.pin +
            '</span><span class="text-title">' +
            Modals.escapeHtml(Store.displayTitle(n)) +
            "</span></button>"
          );
        })
        .join("");
      pinSection =
        '<section style="margin-bottom:var(--space-section)">' +
        '<div class="section-header"><h2 class="section-label">Pinned</h2>' +
        seeAll +
        "</div>" +
        (expanded && pins.length > limit
          ? '<div class="pin-grid">' + pinHtml + "</div>"
          : '<div class="pin-scroll">' + pinHtml + "</div>") +
        "</section>";
    }

    var recent = Store.recentNotes(10)
      .map(function (n) {
        return noteCardHtml(n);
      })
      .join("");

    var freq = Store.frequentTags(8)
      .map(function (t) {
        return (
          '<button type="button" class="tag" data-tag="' +
          Modals.escapeHtml(t) +
          '">' +
          Modals.escapeHtml(t) +
          "</button>"
        );
      })
      .join("");

    return (
      listStateBanner() +
      '<div class="screen-content screen-content--centered">' +
      '<header class="screen-header" style="position:static;border:none;padding:0 0 16px">' +
      "<h1>Home</h1></header>" +
      '<button type="button" class="input search-wrap" id="home-search-btn" style="display:flex;align-items:center;gap:8px;margin-bottom:24px;text-align:left;color:var(--color-foreground-muted)">' +
      Icons.search +
      " Search notes</button>" +
      pinSection +
      '<section style="margin-bottom:var(--space-section)"><h2 class="section-label">Recent</h2><ul class="note-list">' +
      recent +
      "</ul></section>" +
      '<section style="margin-bottom:var(--space-section)"><h2 class="section-label">Frequent tags</h2><div style="display:flex;flex-wrap:wrap;gap:8px">' +
      freq +
      "</div></section>" +
      '<div class="footer-links"><a href="#/tags">Tags</a><a href="#/archive">Archive</a><a href="#/trash">Trash</a></div>' +
      "</div>"
    );
  }

  function bindHome(root) {
    var btn = root.querySelector("#home-search-btn");
    if (btn) {
      btn.addEventListener("click", function () {
        Store.setFocusNotesSearch(true);
        Router.navigate("/notes");
      });
    }
    var create = root.querySelector("#empty-create");
    if (create)
      create.addEventListener("click", function () {
        Editor.initNewNote();
      });
    var see = root.querySelector("#pins-see-all");
    if (see) {
      see.addEventListener("click", function () {
        Store.setHomePinsExpanded(!Store.getState().homePinsExpanded);
        window.App.render();
      });
    }
    root.querySelectorAll(".pin-mini[data-href]").forEach(function (b) {
      b.addEventListener("click", function () {
        Router.navigate(b.getAttribute("data-href").replace("#", ""));
      });
    });
    root.querySelectorAll("[data-tag]").forEach(function (b) {
      b.addEventListener("click", function () {
        Store.setTagFilter(b.getAttribute("data-tag"));
        Router.navigate("/notes");
      });
    });
    bindNoteCards(root);
  }

  function renderNotesList(embedded) {
    var ov = Review.getOverrides().listState;
    var st = Store.getState();
    var q = st.notesSearch;
    var tag = st.tagFilter;

    if (ov === "loading") {
      return skeletonList(8);
    }

    var list = Store.filterNotes(Store.activeNotes(), q, tag);
    var chip = tag
      ? '<div class="chip-filter"><span class="tag tag--selected">#' +
        Modals.escapeHtml(tag) +
        '</span><button type="button" class="btn btn--ghost btn--sm" id="clear-tag-filter">Clear</button></div>'
      : "";

    if (!Store.activeNotes().length && ov !== "error") {
      return (
        chip +
        '<div class="empty-state"><h2 class="text-title-lg">No notes yet</h2><p class="text-muted">Create your first note.</p><button type="button" class="btn btn--primary" id="notes-empty-create">Create note</button></div>'
      );
    }

    if (!list.length) {
      return (
        chip +
        listStateBanner() +
        '<div class="empty-state"><h2 class="text-title-lg">No matches</h2><p class="text-muted">No matches for “' +
        Modals.escapeHtml(q || tag) +
        '”.</p><button type="button" class="btn btn--secondary" id="clear-notes-search">Clear search</button></div>'
      );
    }

    return (
      listStateBanner() +
      chip +
      '<ul class="note-list">' +
      list
        .map(function (n) {
          return noteCardHtml(n);
        })
        .join("") +
      "</ul>"
    );
  }

  function renderNotes() {
    var st = Store.getState();
    return (
      '<div class="screen-content screen-content--centered">' +
      (!window.App.isSplitNotes()
        ? '<header class="screen-header" style="position:static;border:none;padding:0 0 8px"><h1>Notes</h1></header>'
        : "") +
      searchInput("notes-search", st.notesSearch, "Search notes") +
      '<div id="notes-list-inner">' +
      renderNotesList() +
      "</div></div>"
    );
  }

  function bindNotes(root) {
    bindSearch("notes-search", function (v) {
      Store.setNotesSearch(v);
      var inner = document.getElementById("notes-list-inner");
      if (inner) {
        inner.innerHTML = renderNotesList();
        bindNoteCards(inner, window.App.onNoteSelect);
      }
    });
    bindNoteCards(root, window.App.onNoteSelect);
    var c = root.querySelector("#clear-tag-filter");
    if (c)
      c.addEventListener("click", function () {
        Store.setTagFilter(null);
        window.App.render();
      });
    var cs = root.querySelector("#clear-notes-search");
    if (cs)
      cs.addEventListener("click", function () {
        Store.setNotesSearch("");
        Store.setTagFilter(null);
        window.App.render();
      });
    var ec = root.querySelector("#notes-empty-create");
    if (ec)
      ec.addEventListener("click", function () {
        Editor.initNewNote();
      });
  }

  function renderArchive() {
    var ov = Review.getOverrides().listState;
    var q = Store.getState().archiveSearch;
    if (ov === "loading") {
      return (
        '<div class="screen-content screen-content--centered">' +
        searchInput("archive-search", q, "Search archive") +
        skeletonList(6) +
        "</div>"
      );
    }
    var list = Store.filterNotes(Store.archivedNotes(), q, null);
    var body =
      !list.length && ov !== "error"
        ? '<div class="empty-state"><h2 class="text-title-lg">No archived notes</h2></div>'
        : '<ul class="note-list">' +
          list
            .map(function (n) {
              return noteCardHtml(n, { archivedBadge: true });
            })
            .join("") +
          "</ul>";
    return (
      '<div class="screen-content screen-content--centered">' +
      '<header class="screen-header" style="position:static;border:none;padding:0 0 8px"><h1>Archive</h1></header>' +
      listStateBanner() +
      searchInput("archive-search", q, "Search archive") +
      body +
      "</div>"
    );
  }

  function bindArchive(root) {
    bindSearch("archive-search", function (v) {
      Store.setArchiveSearch(v);
      window.App.render();
    });
    bindNoteCards(root);
  }

  function renderTrash() {
    var ov = Review.getOverrides().listState;
    if (ov === "loading") {
      return (
        '<div class="screen-content screen-content--centered"><h1 class="text-title-lg" style="margin-bottom:16px">Trash</h1>' +
        skeletonList(4) +
        "</div>"
      );
    }
    var list = Store.sortNotes(Store.trashedNotes());
    var body = !list.length
      ? '<div class="empty-state"><h2 class="text-title-lg">Trash is empty</h2></div>'
      : '<ul class="note-list">' +
        list
          .map(function (n) {
            return noteCardHtml(n, { trash: true, muted: true });
          })
          .join("") +
        "</ul>";
    return (
      '<div class="screen-content screen-content--centered">' +
      '<header class="screen-header" style="position:static;border:none;padding:0 0 8px"><h1>Trash</h1></header>' +
      listStateBanner() +
      body +
      "</div>"
    );
  }

  function bindTrash(root) {
    bindNoteCards(root);
  }

  function renderTrashPreview(id) {
    var note = Store.getNote(id);
    if (!note || !note.trashed) {
      return '<div class="screen-content"><p class="text-muted">Note not found.</p></div>';
    }
    return (
      '<div class="editor-screen">' +
      '<header class="screen-header">' +
      '<button type="button" class="btn btn--icon btn--ghost" id="trash-back" aria-label="Back">' +
      Icons.chevronLeft +
      "</button>" +
      "<h1>Trash</h1>" +
      '<span class="text-caption text-muted">Read-only</span></header>' +
      '<div class="trash-preview">' +
      '<h2 class="trash-preview__title">' +
      Modals.escapeHtml(Store.displayTitle(note)) +
      "</h2>" +
      '<div class="trash-preview__body">' +
      note.bodyHtml +
      "</div></div>" +
      '<div class="trash-actions">' +
      '<button type="button" class="btn btn--primary" id="trash-restore">Restore</button>' +
      '<button type="button" class="btn btn--destructive" id="trash-delete">Delete forever</button>' +
      "</div></div>"
    );
  }

  function bindTrashPreview(root, id) {
    var back = root.querySelector("#trash-back");
    if (back)
      back.addEventListener("click", function () {
        Router.navigate("/trash");
      });
    var restore = root.querySelector("#trash-restore");
    if (restore)
      restore.addEventListener("click", function () {
        Store.updateNote(id, { trashed: false });
        Router.navigate("/editor/" + id);
      });
    var del = root.querySelector("#trash-delete");
    if (del)
      del.addEventListener("click", function () {
        Modals.confirm({
          title: "Delete this note permanently?",
          message: "This can't be undone.",
          confirmLabel: "Delete",
          destructive: true,
        }).then(function (ok) {
          if (ok) {
            Store.deleteNoteForever(id);
            Router.navigate("/trash");
          }
        });
      });
  }

  function renderTags() {
    var ov = Review.getOverrides().listState;
    if (ov === "loading") {
      return (
        '<div class="screen-content screen-content--centered"><h1 style="margin-bottom:16px">Tags</h1>' +
        skeletonList(5) +
        "</div>"
      );
    }
    var tags = Store.allTagsSorted();
    if (!tags.length) {
      return (
        '<div class="screen-content screen-content--centered">' +
        '<header class="screen-header" style="position:static;border:none;padding:0 0 8px;justify-content:space-between">' +
        "<h1>Tags</h1>" +
        '<button type="button" class="btn btn--primary btn--sm" id="tags-new">New tag</button></header>' +
        '<div class="empty-state"><h2 class="text-title-lg">No tags yet</h2><button type="button" class="btn btn--primary" id="tags-new-empty">Create tag</button></div></div>'
      );
    }
    var rows = tags
      .map(function (t) {
        return (
          '<div class="tag-row">' +
          '<button type="button" class="tag-row__main" data-filter-tag="' +
          Modals.escapeHtml(t.name) +
          '"><span>' +
          Modals.escapeHtml(t.name) +
          '</span><span class="text-caption text-muted">' +
          t.count +
          "</span></button>" +
          '<button type="button" class="btn btn--icon btn--ghost" data-tag-menu="' +
          Modals.escapeHtml(t.name) +
          '" aria-label="Tag options">' +
          Icons.more +
          "</button></div>"
        );
      })
      .join("");
    return (
      '<div class="screen-content screen-content--centered">' +
      listStateBanner() +
      '<header class="screen-header" style="position:static;border:none;padding:0 0 8px;justify-content:space-between">' +
      "<h1>Tags</h1>" +
      '<button type="button" class="btn btn--primary btn--sm" id="tags-new">New tag</button></header>' +
      rows +
      "</div>"
    );
  }

  function bindTags(root) {
    function newTag() {
      Modals.promptInput("New tag", "").then(function (v) {
        if (!v) return;
        var name = v.trim().toLowerCase();
        if (!name) return;
        Store.createStandaloneTag(name);
        window.App.render();
      });
    }
    root.querySelectorAll("#tags-new, #tags-new-empty").forEach(function (b) {
      b.addEventListener("click", newTag);
    });
    root.querySelectorAll("[data-filter-tag]").forEach(function (b) {
      b.addEventListener("click", function () {
        Store.setTagFilter(b.getAttribute("data-filter-tag"));
        Router.navigate("/notes");
      });
    });
    root.querySelectorAll("[data-tag-menu]").forEach(function (b) {
      b.addEventListener("click", function () {
        var name = b.getAttribute("data-tag-menu");
        var list = document.createElement("div");
        list.className = "menu-list";
        [
          ["Rename", false],
          ["Delete", true],
          ["Filter", false],
        ].forEach(function (pair) {
          var btn = document.createElement("button");
          btn.type = "button";
          btn.className =
            "menu-list__item" + (pair[1] ? " menu-list__item--danger" : "");
          btn.textContent = pair[0];
          btn.addEventListener("click", function () {
            Modals.close();
            if (pair[0] === "Rename") {
              Modals.promptInput("Rename tag", name).then(function (v) {
                if (v) {
                  Store.renameTag(name, v);
                  window.App.render();
                }
              });
            } else if (pair[0] === "Delete") {
              var count = Store.allTagsSorted().find(function (t) {
                return t.name === name;
              });
              Modals.confirm({
                title: "Delete tag?",
                message:
                  "Remove “" +
                  name +
                  "” from " +
                  (count ? count.count : 0) +
                  " notes?",
                confirmLabel: "Delete",
                destructive: true,
              }).then(function (ok) {
                if (ok) {
                  Store.deleteTag(name);
                  window.App.render();
                }
              });
            } else {
              Store.setTagFilter(name);
              Router.navigate("/notes");
            }
          });
          list.appendChild(btn);
        });
        Modals.sheet({ title: name, content: list, onClose: function () {} });
      });
    });
  }

  function renderSettings() {
    var mode = window.Theme.getMode();
    function seg(val, label) {
      return (
        '<button type="button" class="segmented__btn" data-theme="' +
        val +
        '" aria-pressed="' +
        (mode === val ? "true" : "false") +
        '">' +
        label +
        "</button>"
      );
    }
    return (
      '<div class="screen-content screen-content--settings">' +
      '<header class="screen-header" style="position:static;border:none;padding:0 0 16px"><h1>Settings</h1></header>' +
      '<div class="settings-section"><h2>Appearance</h2><div class="segmented" role="group" aria-label="Theme">' +
      seg("light", "Light") +
      seg("dark", "Dark") +
      seg("system", "System") +
      "</div></div>" +
      '<div class="settings-section"><h2>Account</h2><a class="settings-row" href="#/login" id="settings-account">Sign in <span>' +
      Icons.chevronRight +
      "</span></a></div>" +
      '<div class="settings-section"><h2>Library</h2>' +
      '<a class="settings-row" href="#/tags">Tags ' +
      Icons.chevronRight +
      "</a>" +
      '<a class="settings-row" href="#/archive">Archive ' +
      Icons.chevronRight +
      "</a>" +
      '<a class="settings-row" href="#/trash">Trash ' +
      Icons.chevronRight +
      "</a></div>" +
      '<div class="settings-section"><button type="button" class="btn btn--secondary" id="settings-logout" style="width:100%">Log out</button></div>' +
      "</div>"
    );
  }

  function bindSettings(root) {
    root.querySelectorAll("[data-theme]").forEach(function (b) {
      b.addEventListener("click", function () {
        window.Theme.setMode(b.getAttribute("data-theme"));
        window.App.render();
      });
    });
    var out = root.querySelector("#settings-logout");
    if (out)
      out.addEventListener("click", function () {
        Modals.confirm({ title: "Log out?", confirmLabel: "Log out" }).then(
          function (ok) {
            if (ok) Modals.toast("Logged out");
          }
        );
      });
  }

  window.Screens = {
    renderHome: renderHome,
    bindHome: bindHome,
    renderNotes: renderNotes,
    bindNotes: bindNotes,
    renderNotesList: renderNotesList,
    renderArchive: renderArchive,
    bindArchive: bindArchive,
    renderTrash: renderTrash,
    bindTrash: bindTrash,
    renderTrashPreview: renderTrashPreview,
    bindTrashPreview: bindTrashPreview,
    renderTags: renderTags,
    bindTags: bindTags,
    renderSettings: renderSettings,
    bindSettings: bindSettings,
    noteCardHtml: noteCardHtml,
  };
})();
