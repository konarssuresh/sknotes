/* global window, Router, Store, Screens, Editor, Icons, Review, Theme, Brand, Auth */
(function () {
  var appEl = document.getElementById("app");
  var currentRoute = null;
  var backPath = "#/";

  function navItem(href, label, icon, current) {
    return (
      '<a href="' +
      href +
      '" class="bottom-nav__item" aria-current="' +
      (current ? "page" : "false") +
      '">' +
      icon +
      "<span>" +
      label +
      "</span></a>"
    );
  }

  function sidebarLink(href, label, icon, current) {
    return (
      '<a href="' +
      href +
      '" class="sidebar__link" aria-current="' +
      (current ? "page" : "false") +
      '">' +
      icon +
      label +
      "</a>"
    );
  }

  function shell(route) {
    var name = route.name;
    var cur =
      name === "home"
        ? "home"
        : name === "notes" || name === "editor"
          ? "notes"
          : name === "settings"
            ? "settings"
            : "";

    return (
      '<div class="app__body">' +
      '<aside class="sidebar" aria-label="Main">' +
      '<div class="sidebar__brand">' +
      Brand.logoFull(32) +
      "</div>" +
      '<button type="button" class="btn btn--primary sidebar__create" id="sidebar-create">New note</button>' +
      '<nav class="sidebar__nav">' +
      sidebarLink("#/", "Home", Icons.home, name === "home") +
      sidebarLink(
        "#/notes",
        "Notes",
        Icons.notes,
        name === "notes" || (name === "editor" && !route.params.embed)
      ) +
      '<div class="sidebar__divider"></div>' +
      '<div class="sidebar__label">Library</div>' +
      sidebarLink("#/tags", "Tags", Icons.tag, name === "tags") +
      sidebarLink("#/archive", "Archive", Icons.archive, name === "archive") +
      sidebarLink(
        "#/trash",
        "Trash",
        Icons.trash,
        name === "trash" || name === "trashPreview"
      ) +
      "</nav>" +
      sidebarLink(
        "#/settings",
        "Settings",
        Icons.settings,
        name === "settings"
      ) +
      "</aside>" +
      '<div class="main-wrap">' +
      '<main id="main-content" tabindex="-1"></main>' +
      '<nav class="bottom-nav" aria-label="Main">' +
      navItem("#/", "Home", Icons.home, cur === "home") +
      '<div class="bottom-nav__create-wrap"><button type="button" class="bottom-nav__create" id="nav-create" aria-label="Create note">' +
      Icons.plus +
      "</button></div>" +
      navItem("#/notes", "Notes", Icons.notes, cur === "notes") +
      navItem("#/settings", "Settings", Icons.settings, cur === "settings") +
      "</nav></div></div>"
    );
  }

  function isSplitNotes() {
    return (
      window.innerWidth >= 1024 &&
      (currentRoute.name === "notes" || currentRoute.name === "editor")
    );
  }

  function getBackPath() {
    return backPath.replace("#", "") || "/";
  }

  function onNoteSelect(id) {
    Router.navigate("/editor/" + id);
  }

  function renderMain(route) {
    currentRoute = route;
    var main = document.getElementById("main-content");
    if (!main) return;

    if (route.name === "home") {
      backPath = "#/";
      main.innerHTML = Screens.renderHome();
      Screens.bindHome(main);
      return;
    }

    if (route.name === "notes") {
      backPath = "#/";
      if (isSplitNotes()) {
        var splitId = Store.getState().splitNoteId;
        main.innerHTML =
          '<div class="split split--active">' +
          '<div class="split__list" id="split-list">' +
          Screens.renderNotes() +
          "</div>" +
          '<div class="split__detail" id="split-detail"></div></div>';
        Screens.bindNotes(main);
        if (splitId && Store.getNote(splitId)) {
          Editor.mountEditor(
            document.getElementById("split-detail"),
            splitId,
            true
          );
        }
      } else {
        main.innerHTML = Screens.renderNotes();
        Screens.bindNotes(main);
      }
      return;
    }

    if (route.name === "editor") {
      backPath = "#/notes";
      var id = route.params.id;
      if (isSplitNotes()) {
        Store.setSplitNoteId(id);
        main.innerHTML =
          '<div class="split split--active">' +
          '<div class="split__list" id="split-list">' +
          Screens.renderNotes() +
          "</div>" +
          '<div class="split__detail" id="split-detail"></div></div>';
        Screens.bindNotes(main);
        Editor.mountEditor(document.getElementById("split-detail"), id, true);
      } else {
        main.innerHTML = '<div id="editor-mount"></div>';
        Editor.mountEditor(document.getElementById("editor-mount"), id, false);
      }
      return;
    }

    if (route.name === "tags") {
      backPath = "#/";
      main.innerHTML = Screens.renderTags();
      Screens.bindTags(main);
      return;
    }

    if (route.name === "archive") {
      backPath = "#/";
      main.innerHTML = Screens.renderArchive();
      Screens.bindArchive(main);
      return;
    }

    if (route.name === "trash") {
      backPath = "#/";
      main.innerHTML = Screens.renderTrash();
      Screens.bindTrash(main);
      return;
    }

    if (route.name === "trashPreview") {
      backPath = "#/trash";
      main.innerHTML = Screens.renderTrashPreview(route.params.id);
      Screens.bindTrashPreview(main, route.params.id);
      return;
    }

    if (route.name === "settings") {
      backPath = "#/";
      main.innerHTML = Screens.renderSettings();
      Screens.bindSettings(main);
      return;
    }
  }

  function renderAuth(route) {
    if (route.name === "login") {
      appEl.innerHTML = Auth.renderLogin();
      Auth.bindLogin(appEl);
      return;
    }
    if (route.name === "signup") {
      appEl.innerHTML = Auth.renderSignup();
      Auth.bindSignup(appEl);
      return;
    }
    if (route.name === "forgotPassword") {
      appEl.innerHTML = Auth.renderForgotPassword();
      Auth.bindForgotPassword(appEl);
      return;
    }
  }

  function render() {
    var route = Router.parse();
    if (
      route.name === "login" ||
      route.name === "signup" ||
      route.name === "forgotPassword"
    ) {
      renderAuth(route);
      return;
    }
    appEl.innerHTML = shell(route);
    var create = document.getElementById("sidebar-create");
    if (create) {
      create.addEventListener("click", function () {
        Editor.initNewNote();
      });
    }
    var navCreate = document.getElementById("nav-create");
    if (navCreate) {
      navCreate.addEventListener("click", function () {
        Editor.initNewNote();
      });
    }
    renderMain(route);
  }

  window.App = {
    render: render,
    getBackPath: getBackPath,
    isSplitNotes: isSplitNotes,
    onNoteSelect: onNoteSelect,
  };

  Review.mount();
  Router.onChange(function () {
    render();
  });

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 150);
  });

  if (!window.location.hash) window.location.hash = "#/";
  Router.setAllowedHash(window.location.hash);
  Router.emit();
})();
