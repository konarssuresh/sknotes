/* global window, SEED_NOTES */
(function () {
  function cloneNotes() {
    return SEED_NOTES.map(function (n) {
      return Object.assign({}, n, { tags: n.tags.slice() });
    });
  }

  var state = {
    notes: cloneNotes(),
    standaloneTags: [],
    draft: null,
    tagFilter: null,
    notesSearch: "",
    archiveSearch: "",
    homePinsExpanded: false,
    focusNotesSearch: false,
    splitNoteId: null,
  };

  function normalizeTagName(name) {
    return (name || "").trim().toLowerCase();
  }

  function sortNotes(list) {
    return list.slice().sort(function (a, b) {
      if (b.updatedAt !== a.updatedAt) return b.updatedAt - a.updatedAt;
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    });
  }

  function activeNotes() {
    return state.notes.filter(function (n) {
      return !n.trashed && !n.archived;
    });
  }

  function archivedNotes() {
    return state.notes.filter(function (n) {
      return n.archived && !n.trashed;
    });
  }

  function trashedNotes() {
    return state.notes.filter(function (n) {
      return n.trashed;
    });
  }

  function getNote(id) {
    if (state.draft && state.draft.id === id) {
      return state.draft;
    }
    return state.notes.find(function (n) {
      return n.id === id;
    });
  }

  function isDraftId(id) {
    return !!(state.draft && state.draft.id === id);
  }

  function beginDraft() {
    state.draft = {
      id: "draft-" + Date.now(),
      title: "",
      bodyHtml: "",
      bodyText: "",
      tags: [],
      pinned: false,
      archived: false,
      trashed: false,
      updatedAt: Date.now(),
    };
    return state.draft;
  }

  function discardDraft() {
    state.draft = null;
  }

  function commitDraft(id, patch) {
    if (!state.draft || state.draft.id !== id) return null;
    var note = Object.assign({}, state.draft, patch, { updatedAt: Date.now() });
    state.notes.push(note);
    state.draft = null;
    return note;
  }

  function hasDraft() {
    return !!state.draft;
  }

  function displayTitle(note) {
    var t = (note.title || "").trim();
    return t || "Untitled";
  }

  function matchesSearch(note, q) {
    if (!q) return true;
    var lower = q.toLowerCase();
    if (displayTitle(note).toLowerCase().indexOf(lower) >= 0) return true;
    if ((note.bodyText || "").toLowerCase().indexOf(lower) >= 0) return true;
    for (var i = 0; i < note.tags.length; i++) {
      if (note.tags[i].toLowerCase().indexOf(lower) >= 0) return true;
    }
    return false;
  }

  function filterNotes(list, q, tag) {
    var out = list;
    if (tag) {
      out = out.filter(function (n) {
        return n.tags.indexOf(tag) >= 0;
      });
    }
    if (q) {
      out = out.filter(function (n) {
        return matchesSearch(n, q);
      });
    }
    return sortNotes(out);
  }

  function pinnedNotes() {
    return sortNotes(
      activeNotes().filter(function (n) {
        return n.pinned;
      })
    );
  }

  function recentNotes(limit) {
    return sortNotes(activeNotes()).slice(0, limit || 10);
  }

  function tagCounts() {
    var counts = {};
    state.notes.forEach(function (n) {
      if (n.trashed) return;
      n.tags.forEach(function (t) {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return counts;
  }

  function allTagsSorted() {
    var counts = tagCounts();
    state.standaloneTags.forEach(function (t) {
      if (counts[t] === undefined) counts[t] = 0;
    });
    return Object.keys(counts)
      .sort(function (a, b) {
        return a.localeCompare(b);
      })
      .map(function (name) {
        return { name: name, count: counts[name] };
      });
  }

  function frequentTags(limit) {
    var counts = tagCounts();
    state.standaloneTags.forEach(function (t) {
      if (counts[t] === undefined) counts[t] = 0;
    });
    return Object.keys(counts)
      .sort(function (a, b) {
        return counts[b] - counts[a];
      })
      .slice(0, limit || 8);
  }

  function createNote() {
    return beginDraft();
  }

  function updateNote(id, patch) {
    if (state.draft && state.draft.id === id) {
      Object.assign(state.draft, patch, { updatedAt: Date.now() });
      return state.draft;
    }
    var note = state.notes.find(function (n) {
      return n.id === id;
    });
    if (!note) return null;
    Object.assign(note, patch, { updatedAt: Date.now() });
    return note;
  }

  function deleteNoteForever(id) {
    if (state.draft && state.draft.id === id) {
      state.draft = null;
      return;
    }
    state.notes = state.notes.filter(function (n) {
      return n.id !== id;
    });
  }

  function renameTag(oldName, newName) {
    oldName = normalizeTagName(oldName);
    newName = normalizeTagName(newName);
    if (!newName || newName === oldName) return;
    state.standaloneTags = state.standaloneTags.map(function (t) {
      return t === oldName ? newName : t;
    });
    state.notes.forEach(function (n) {
      var i = n.tags.indexOf(oldName);
      if (i >= 0) {
        n.tags.splice(i, 1);
        if (n.tags.indexOf(newName) < 0) n.tags.push(newName);
      }
    });
    if (state.tagFilter === oldName) state.tagFilter = newName;
  }

  function deleteTag(name) {
    name = normalizeTagName(name);
    state.standaloneTags = state.standaloneTags.filter(function (t) {
      return t !== name;
    });
    state.notes.forEach(function (n) {
      n.tags = n.tags.filter(function (t) {
        return t !== name;
      });
    });
    if (state.tagFilter === name) state.tagFilter = null;
  }

  function addTagToNote(noteId, tag) {
    tag = normalizeTagName(tag);
    if (!tag) return;
    var note = getNote(noteId);
    if (!note || note.tags.indexOf(tag) >= 0) return;
    note.tags.push(tag);
    note.updatedAt = Date.now();
    if (state.standaloneTags.indexOf(tag) < 0 && tagCounts()[tag] === 1) {
      /* tag now used on a note; standalone entry optional duplicate — remove from standalone if was 0-count */
    }
    state.standaloneTags = state.standaloneTags.filter(function (t) {
      return t !== tag;
    });
  }

  function removeTagFromNote(noteId, tag) {
    var note = getNote(noteId);
    if (!note) return;
    note.tags = note.tags.filter(function (t) {
      return t !== tag;
    });
    note.updatedAt = Date.now();
  }

  function relativeTime(ts) {
    var diff = Date.now() - ts;
    var mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return mins + "m ago";
    var hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + "h ago";
    var days = Math.floor(hrs / 24);
    if (days < 7) return days + "d ago";
    return new Date(ts).toLocaleDateString();
  }

  function resetToSeed() {
    state.notes = cloneNotes();
    state.standaloneTags = [];
    state.draft = null;
    state.tagFilter = null;
    state.homePinsExpanded = false;
  }

  function clearAllNotes() {
    state.notes = [];
    state.standaloneTags = [];
    state.draft = null;
  }

  function tagExists(name) {
    name = normalizeTagName(name);
    if (!name) return false;
    if (state.standaloneTags.indexOf(name) >= 0) return true;
    var found = false;
    state.notes.forEach(function (n) {
      if (n.trashed) return;
      if (n.tags.indexOf(name) >= 0) found = true;
    });
    return found;
  }

  function createStandaloneTag(name) {
    name = normalizeTagName(name);
    if (!name) return false;
    if (tagExists(name)) return true;
    state.standaloneTags.push(name);
    state.standaloneTags.sort();
    return true;
  }

  window.Store = {
    getState: function () {
      return state;
    },
    activeNotes: activeNotes,
    archivedNotes: archivedNotes,
    trashedNotes: trashedNotes,
    getNote: getNote,
    displayTitle: displayTitle,
    sortNotes: sortNotes,
    filterNotes: filterNotes,
    pinnedNotes: pinnedNotes,
    recentNotes: recentNotes,
    tagCounts: tagCounts,
    allTagsSorted: allTagsSorted,
    frequentTags: frequentTags,
    createNote: createNote,
    updateNote: updateNote,
    deleteNoteForever: deleteNoteForever,
    renameTag: renameTag,
    deleteTag: deleteTag,
    addTagToNote: addTagToNote,
    removeTagFromNote: removeTagFromNote,
    relativeTime: relativeTime,
    resetToSeed: resetToSeed,
    clearAllNotes: clearAllNotes,
    setTagFilter: function (t) {
      state.tagFilter = t;
    },
    setNotesSearch: function (q) {
      state.notesSearch = q;
    },
    setArchiveSearch: function (q) {
      state.archiveSearch = q;
    },
    setHomePinsExpanded: function (v) {
      state.homePinsExpanded = v;
    },
    setFocusNotesSearch: function (v) {
      state.focusNotesSearch = v;
    },
    setSplitNoteId: function (id) {
      state.splitNoteId = id;
    },
    normalizeTagName: normalizeTagName,
    createStandaloneTag: createStandaloneTag,
    beginDraft: beginDraft,
    discardDraft: discardDraft,
    commitDraft: commitDraft,
    isDraftId: isDraftId,
    hasDraft: hasDraft,
  };
})();
