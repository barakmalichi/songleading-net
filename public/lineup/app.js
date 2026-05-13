const categories = [
  { name: "Services", color: "#5b92ff" },
  { name: "Song Session", color: "#7c8cff" },
  { name: "Other", color: "#a5adb2" },
];

const majorKeys = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const minorKeys = majorKeys.map((key) => `${key}m`);
const keys = [...majorKeys, ...minorKeys];
const capoOptions = ["", "Capo 1", "Capo 2", "Capo 3", "Capo 4", "Capo 5", "Capo 6", "Capo 7"];
const storageKey = "show-lineup-builder-state";
const cloudAuthStorageKey = "songleading-auth-session:v1";
const studioStorageKey = "lyric-slide-studio:v1";
const themeStorageKey = "show-lineup-builder-theme";
const skinStorageKey = "show-lineup-builder-skin";
const bankWidthStorageKey = "show-lineup-builder-bank-width";
const appVersion = 7;

let importedSharedLineup = false;
let state = safeLoadState();
let activeCategory = "All";
let bangersOnly = false;
let searchTerm = "";
let sortAsc = true;
let openRowId = null;
let draggedLineupId = null;
let draggedBankSongId = null;
let quickAddRows = [];
let sidePanelMode = "library";

const els = {
  appShell: document.querySelector(".app-shell"),
  bankPanel: document.querySelector(".bank-panel"),
  panelResizer: document.querySelector("#panelResizer"),
  showName: document.querySelector("#showName"),
  showDate: document.querySelector("#showDate"),
  savedShowsDetails: document.querySelector("#savedShowsDetails"),
  savedShowsList: document.querySelector("#savedShowsList"),
  savedShowsCurrent: document.querySelector("#savedShowsCurrent"),
  showsTabButton: document.querySelector("#showsTabButton"),
  sidePanelTitle: document.querySelector("#sidePanelTitle"),
  libraryView: document.querySelector("#libraryView"),
  showsView: document.querySelector("#showsView"),
  headerMenu: document.querySelector("#headerMenu"),
  newShowButton: document.querySelector("#newShowButton"),
  duplicateShowButton: document.querySelector("#duplicateShowButton"),
  deleteShowButton: document.querySelector("#deleteShowButton"),
  lineupRows: document.querySelector("#lineupRows"),
  addNoteButton: document.querySelector("#addNoteButton"),
  saveLineupButton: document.querySelector("#saveLineupButton"),
  renameShowButton: document.querySelector("#renameShowButton"),
  exportButton: document.querySelector("#exportButton"),
  shareButton: document.querySelector("#shareButton"),
  settingsMenuButton: document.querySelector("#settingsMenuButton"),
  accountMenuButton: document.querySelector("#accountMenuButton"),
  categoryFilters: document.querySelector("#categoryFilters"),
  songBankList: document.querySelector("#songBankList"),
  songSearch: document.querySelector("#songSearch"),
  closeBankButton: document.querySelector("#closeBankButton"),
  themeToggle: document.querySelector("#themeToggle"),
  sortButton: document.querySelector("#sortButton"),
  quickAddButton: document.querySelector("#quickAddButton"),
  newSongButton: document.querySelector("#newSongButton"),
  songDialog: document.querySelector("#songDialog"),
  songForm: document.querySelector("#songForm"),
  saveSongButton: document.querySelector("#saveSongButton"),
  dialogMode: document.querySelector("#dialogMode"),
  dialogTitle: document.querySelector("#dialogTitle"),
  songId: document.querySelector("#songId"),
  songTitle: document.querySelector("#songTitle"),
  songCategory: document.querySelector("#songCategory"),
  songCategoryButtons: document.querySelector("#songCategoryButtons"),
  songKey: document.querySelector("#songKey"),
  songCapo: document.querySelector("#songCapo"),
  songDuration: document.querySelector("#songDuration"),
  songHebrew: document.querySelector("#songHebrew"),
  songCredits: document.querySelector("#songCredits"),
  songTags: document.querySelector("#songTags"),
  songTagSuggestions: document.querySelector("#songTagSuggestions"),
  songNotes: document.querySelector("#songNotes"),
  deleteSongButton: document.querySelector("#deleteSongButton"),
  quickAddDialog: document.querySelector("#quickAddDialog"),
  quickAddForm: document.querySelector("#quickAddForm"),
  quickAddText: document.querySelector("#quickAddText"),
  quickPastePanel: document.querySelector("#quickPastePanel"),
  toggleQuickPasteButton: document.querySelector("#toggleQuickPasteButton"),
  parseQuickAddButton: document.querySelector("#parseQuickAddButton"),
  addQuickRowButton: document.querySelector("#addQuickRowButton"),
  quickAddRows: document.querySelector("#quickAddRows"),
  noteDialog: document.querySelector("#noteDialog"),
  noteForm: document.querySelector("#noteForm"),
  noteDialogMode: document.querySelector("#noteDialogMode"),
  noteDialogTitle: document.querySelector("#noteDialogTitle"),
  noteId: document.querySelector("#noteId"),
  noteText: document.querySelector("#noteText"),
  deleteNoteButton: document.querySelector("#deleteNoteButton"),
  showNotesDialog: document.querySelector("#showNotesDialog"),
  showNotesForm: document.querySelector("#showNotesForm"),
  showNotesText: document.querySelector("#showNotesText"),
  teamDialog: document.querySelector("#teamDialog"),
  teamForm: document.querySelector("#teamForm"),
  teamText: document.querySelector("#teamText"),
  settingsDialog: document.querySelector("#settingsDialog"),
  skinChoiceGrid: document.querySelector("#skinChoiceGrid"),
  settingsThemeButton: document.querySelector("#settingsThemeButton"),
  settingsThemeText: document.querySelector("#settingsThemeText"),
  settingsBackupButton: document.querySelector("#settingsBackupButton"),
  settingsRestoreButton: document.querySelector("#settingsRestoreButton"),
  accountDialog: document.querySelector("#accountDialog"),
  accountForm: document.querySelector("#accountForm"),
  accountDialogTitle: document.querySelector("#accountDialogTitle"),
  accountSignedOut: document.querySelector("#accountSignedOut"),
  accountSignedIn: document.querySelector("#accountSignedIn"),
  accountEmail: document.querySelector("#accountEmail"),
  accountPassword: document.querySelector("#accountPassword"),
  accountCreateButton: document.querySelector("#accountCreateButton"),
  accountEmailLabel: document.querySelector("#accountEmailLabel"),
  accountSaveCloudButton: document.querySelector("#accountSaveCloudButton"),
  accountLoadCloudButton: document.querySelector("#accountLoadCloudButton"),
  accountSignOutButton: document.querySelector("#accountSignOutButton"),
  accountSyncMessage: document.querySelector("#accountSyncMessage"),
  exportDialog: document.querySelector("#exportDialog"),
  exportPreview: document.querySelector("#exportPreview"),
  exportCreditsToggle: document.querySelector("#exportCreditsToggle"),
  exportRealKeyToggle: document.querySelector("#exportRealKeyToggle"),
  exportFitToggle: document.querySelector("#exportFitToggle"),
  exportOrientationInputs: document.querySelectorAll("input[name='exportOrientation']"),
  exportFontSizeInputs: document.querySelectorAll("input[name='exportFontSize']"),
  exportSpacingInputs: document.querySelectorAll("input[name='exportSpacing']"),
  exportColumnInputs: document.querySelectorAll("input[name='exportColumns']"),
  exportPdfButton: document.querySelector("#exportPdfButton"),
  exportPrintButton: document.querySelector("#exportPrintButton"),
  exportDocButton: document.querySelector("#exportDocButton"),
  exportLineupFileButton: document.querySelector("#exportLineupFileButton"),
  exportDownloadReady: document.querySelector("#exportDownloadReady"),
  shareDialog: document.querySelector("#shareDialog"),
  shareLink: document.querySelector("#shareLink"),
  copyShareButton: document.querySelector("#copyShareButton"),
  downloadLineupFileButton: document.querySelector("#downloadLineupFileButton"),
  openLineupFileButton: document.querySelector("#openLineupFileButton"),
  lineupFileInput: document.querySelector("#lineupFileInput"),
  downloadBackupButton: document.querySelector("#downloadBackupButton"),
  openBackupButton: document.querySelector("#openBackupButton"),
  backupFileInput: document.querySelector("#backupFileInput"),
  toast: document.querySelector("#toast"),
};

function createEmptyState() {
  return normalizeState({
    version: appVersion,
    show: {
      name: "Current Show",
      date: new Date().toISOString().slice(0, 10),
      notes: "",
      team: "",
    },
    songs: [],
    lineup: [],
  });
}

function safeLoadState() {
  try {
    return loadState();
  } catch (error) {
    console.error("Saved lineup data could not be loaded.", error);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    return createEmptyState();
  }
}

function loadState() {
  const shared = getSharedStateFromHash();
  if (shared) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(shared));
    } catch {}
    return shared;
  }

  let saved = null;
  try {
    saved = localStorage.getItem(storageKey);
  } catch {
    saved = null;
  }

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (!parsed || typeof parsed !== "object") throw new Error("Saved data was empty.");
      return normalizeState(parsed);
    } catch (error) {
      console.error("Saved lineup data was reset.", error);
      try {
        localStorage.removeItem(storageKey);
      } catch {}
    }
  }

  return createEmptyState();
}

function normalizeState(parsed) {
  parsed = parsed && typeof parsed === "object" ? parsed : {};
  const fallbackShow = parsed.show || {
    name: "Current Show",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
    team: "",
  };
  const songs = Array.isArray(parsed.songs)
    ? parsed.songs.map((song) => ({
        ...song,
        category: normalizeCategoryName(song.category),
        banger: Boolean(song.banger),
        hebrew: Object.prototype.hasOwnProperty.call(song, "hebrew") ? Boolean(song.hebrew) : hasHebrewLetters(song.title),
        tags: normalizeTags(song.tags || song.tagString || ""),
      }))
    : [];
  const legacyLineup = Array.isArray(parsed.lineup)
    ? parsed.lineup.map(normalizeLineupItem)
    : [];
  const shows = Array.isArray(parsed.shows) && parsed.shows.length
    ? parsed.shows.map((show) => ({
        id: show.id || makeId("show"),
        name: show.name || show.show?.name || "Current Show",
        date: show.date || show.show?.date || new Date().toISOString().slice(0, 10),
        notes: show.notes || show.show?.notes || "",
        team: show.team || show.show?.team || "",
        lineup: Array.isArray(show.lineup)
          ? show.lineup.map(normalizeLineupItem)
          : [],
      }))
    : [{
        id: parsed.activeShowId || makeId("show"),
        name: fallbackShow.name || "Current Show",
        date: fallbackShow.date || new Date().toISOString().slice(0, 10),
        notes: fallbackShow.notes || "",
        team: fallbackShow.team || "",
        lineup: legacyLineup,
      }];

  const activeShowId = shows.some((show) => show.id === parsed.activeShowId)
    ? parsed.activeShowId
    : shows[0].id;
  const activeShow = shows.find((show) => show.id === activeShowId) || shows[0];

  return {
    version: appVersion,
    activeShowId,
    shows,
    show: { name: activeShow.name, date: activeShow.date, notes: activeShow.notes || "", team: activeShow.team || "" },
    songs,
    lineup: activeShow.lineup,
  };
}

function normalizeLineupItem(item) {
  const next = item?.type ? { ...item } : { ...item, type: "song" };
  if (next.type === "song") {
    next.slidesStatus = next.slidesStatus || "no-slides";
    next.slideSongId = next.slideSongId || "";
    next.slideFlowId = next.slideFlowId || "";
  }
  return next;
}

function getSharedStateFromHash() {
  const match = window.location.hash.match(/lineup=([^&]+)/);
  if (!match) return null;

  try {
    const parsed = JSON.parse(decodeShareData(match[1]));
    const shared = normalizeState(parsed);
    importedSharedLineup = true;
    return shared;
  } catch {
    return null;
  }
}

function saveState() {
  syncActiveShowFromFields();
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    console.warn("Lineup could not be stored locally.", error);
  }
  queueLineupCloudSave();
}

function getCloudSession() {
  try {
    const raw = localStorage.getItem(cloudAuthStorageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.access_token ? parsed : null;
  } catch {
    return null;
  }
}

function setCloudSession(session) {
  try {
    if (!session) {
      localStorage.removeItem(cloudAuthStorageKey);
      return;
    }
    localStorage.setItem(cloudAuthStorageKey, JSON.stringify(session));
  } catch {}
}

async function cloudRequest(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || data.msg || "Cloud sync failed.");
  return data;
}

async function getValidCloudSession() {
  const session = getCloudSession();
  if (!session) return null;
  const expiry = session.expires_at ? session.expires_at * 1000 : 0;
  if (!expiry || expiry > Date.now() + 60_000 || !session.refresh_token) return session;
  const refreshed = await cloudRequest("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  });
  setCloudSession(refreshed);
  return refreshed;
}

async function saveCurrentWorkspaceToCloud() {
  const session = await getValidCloudSession();
  if (!session) throw new Error("Please sign in first.");
  let studioData;
  try {
    const rawStudio = localStorage.getItem(studioStorageKey);
    studioData = rawStudio ? JSON.parse(rawStudio) : undefined;
  } catch {
    studioData = undefined;
  }
  return cloudRequest("/api/workspace", {
    method: "POST",
    headers: { authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ lineupState: state, studioData }),
  });
}

async function loadCloudWorkspaceToDevice() {
  const session = await getValidCloudSession();
  if (!session) throw new Error("Please sign in first.");
  const workspace = await cloudRequest("/api/workspace", {
    headers: { authorization: `Bearer ${session.access_token}` },
  });
  if (workspace.lineupState) {
    state = normalizeState(workspace.lineupState);
    localStorage.setItem(storageKey, JSON.stringify(state));
  }
  if (workspace.studioData) {
    localStorage.setItem(studioStorageKey, JSON.stringify(workspace.studioData));
  }
  render();
  return workspace;
}

let lineupCloudTimer = null;

function queueLineupCloudSave() {
  if (!getCloudSession()) return;
  window.clearTimeout(lineupCloudTimer);
  lineupCloudTimer = window.setTimeout(() => {
    saveCurrentWorkspaceToCloud().catch((error) => {
      console.warn("Lineup cloud sync failed.", error);
    });
  }, 900);
}

function updateAccountDialog(message = "") {
  const session = getCloudSession();
  if (els.accountSignedOut) els.accountSignedOut.hidden = Boolean(session);
  if (els.accountSignedIn) els.accountSignedIn.hidden = !session;
  if (els.accountDialogTitle) els.accountDialogTitle.textContent = session ? "Sync" : "Sign in";
  if (els.accountEmailLabel) {
    els.accountEmailLabel.textContent = session?.user?.email || els.accountEmail?.value || "Signed in";
  }
  if (els.accountSyncMessage) els.accountSyncMessage.textContent = message;
}

function openAccountDialog() {
  const session = getCloudSession();
  if (session?.user?.email && els.accountEmail) els.accountEmail.value = session.user.email;
  if (els.accountPassword) els.accountPassword.value = "";
  updateAccountDialog();
  openDialog(els.accountDialog);
}

async function signInFromAccountDialog(event) {
  event.preventDefault();
  updateAccountDialog("Signing in...");
  try {
    const session = await cloudRequest("/api/auth/sign-in", {
      method: "POST",
      body: JSON.stringify({
        email: els.accountEmail.value.trim(),
        password: els.accountPassword.value,
      }),
    });
    if (!session?.access_token) throw new Error("Could not sign in.");
    setCloudSession(session);
    await saveCurrentWorkspaceToCloud();
    updateAccountDialog("Signed in. This device was saved to your account.");
  } catch (error) {
    updateAccountDialog(error instanceof Error ? error.message : "Could not sign in.");
  }
}

async function createAccountFromDialog() {
  updateAccountDialog("Creating account...");
  try {
    const session = await cloudRequest("/api/auth/sign-up", {
      method: "POST",
      body: JSON.stringify({
        email: els.accountEmail.value.trim(),
        password: els.accountPassword.value,
      }),
    });
    if (!session?.access_token) {
      setCloudSession(null);
      updateAccountDialog("Account created. Check your email, then sign in.");
      return;
    }
    setCloudSession(session);
    await saveCurrentWorkspaceToCloud();
    updateAccountDialog("Account created. This device was saved to your account.");
  } catch (error) {
    updateAccountDialog(error instanceof Error ? error.message : "Could not create account.");
  }
}

function activeShow() {
  return state.shows.find((show) => show.id === state.activeShowId) || state.shows[0];
}

function syncActiveShowFromFields() {
  if (!state.shows?.length) return;
  const show = activeShow();
  show.name = state.show.name;
  show.date = state.show.date;
  show.notes = state.show.notes || "";
  show.team = state.show.team || "";
  show.lineup = state.lineup;
}

function commitShowMetaFromFields() {
  state.show.name = els.showName.value.trim() || "Current Show";
  state.show.date = els.showDate.value || state.show.date;
}

function normalizeCategoryName(name) {
  if (name === "Session") return "Song Session";
  if (name === "Special") return "Other";
  if (name === "Services" || name === "Song Session" || name === "Other") return name;
  return "Other";
}

function categoryFor(name) {
  const normalized = normalizeCategoryName(name);
  return categories.find((category) => category.name === normalized) || categories[categories.length - 1];
}

function hasHebrewLetters(value) {
  return /[\u0590-\u05FF]/.test(String(value || ""));
}

function parseLibrarySearch(value) {
  const tokens = String(value || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
  const hebrewTokens = new Set(["he", "#he", "hebrew", "#hebrew"]);
  const hebrewOnly = tokens.some((token) => hebrewTokens.has(token));
  return {
    hebrewOnly,
    text: tokens.filter((token) => !hebrewTokens.has(token)).join(" "),
  };
}

function normalizeTags(value) {
  const rawTags = Array.isArray(value) ? value : String(value || "").split(/[,#]/);
  const seen = new Set();
  return rawTags
    .map((tag) => String(tag).trim().replace(/^#/, ""))
    .filter(Boolean)
    .filter((tag) => {
      const key = tag.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 12);
}

function tagString(tags) {
  return normalizeTags(tags).join(", ");
}

function slidesStatusLabel(status) {
  if (status === "slides-ready") return "slides ready";
  if (status === "needs-review") return "needs review";
  return "no slides";
}

function slidesStatusClass(status) {
  if (status === "slides-ready") return "ready";
  if (status === "needs-review") return "review";
  return "empty";
}

function slidesButtonClass(itemOrSong) {
  const status = itemOrSong?.slidesStatus || "no-slides";
  const hasSlides = Boolean(itemOrSong?.slideSongId || itemOrSong?.slideFlowId || status === "slides-ready");
  if (status === "needs-review") return "review";
  return hasSlides ? "ready" : "empty";
}

function slidesButtonTitle(itemOrSong) {
  const status = itemOrSong?.slidesStatus || "no-slides";
  if (status === "slides-ready") return "Slides ready";
  if (status === "needs-review") return "Slides need review";
  return "No slides yet";
}

function openSlidesForLineup(lineupId) {
  const item = state.lineup.find((candidate) => candidate.id === lineupId);
  if (!item || item.type !== "song") return;
  saveState();
  const path = `/lineups/${encodeURIComponent(state.activeShowId)}/songs/${encodeURIComponent(item.id)}/slides`;
  if (window.top && window.top !== window) {
    window.top.location.href = path;
  } else {
    window.location.href = path;
  }
}

function openSlidesForBankSong(songId) {
  const item = addSongToLineup(songId, false);
  if (!item) return;
  openSlidesForLineup(item.id);
}

function tagSuggestions(excludeSongId = "") {
  const stats = new Map();
  state.songs.forEach((song, songIndex) => {
    if (song.id === excludeSongId) return;
    normalizeTags(song.tags).forEach((tag) => {
      const key = tag.toLowerCase();
      const existing = stats.get(key) || { tag, count: 0, last: -1 };
      existing.count += 1;
      existing.last = Math.max(existing.last, songIndex);
      stats.set(key, existing);
    });
  });
  return Array.from(stats.values())
    .sort((a, b) => b.count - a.count || b.last - a.last || a.tag.localeCompare(b.tag))
    .slice(0, 8)
    .map((entry) => entry.tag);
}

function renderTagSuggestions(excludeSongId = "") {
  if (!els.songTagSuggestions) return;
  const current = new Set(normalizeTags(els.songTags.value).map((tag) => tag.toLowerCase()));
  const suggestions = tagSuggestions(excludeSongId).filter((tag) => !current.has(tag.toLowerCase()));
  els.songTagSuggestions.innerHTML = suggestions.length
    ? suggestions.map((tag) => `<button class="tag-suggestion" type="button" data-tag-suggestion="${escapeHtml(tag)}">#${escapeHtml(tag)}</button>`).join("")
    : "";
}

function addTagSuggestion(tag) {
  const tags = normalizeTags(els.songTags.value);
  if (!tags.some((candidate) => candidate.toLowerCase() === tag.toLowerCase())) {
    tags.push(tag);
  }
  els.songTags.value = tagString(tags);
  renderTagSuggestions(els.songId.value);
}

function flameIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 14.5A4.5 4.5 0 0 0 13 19a5 5 0 0 0 5-5c0-3.2-2-5.6-4.3-8.2L12 4l-.3 2.4c-.2 1.6-1.2 2.8-2.4 3.7A5.2 5.2 0 0 0 7 14c0 1 .3 1.9 1 2.7"/></svg>`;
}

function openDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
    dialog.open = true;
  }
}

function closeDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.close === "function") {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
    dialog.open = false;
  }
}

function closestFromEvent(event, selector) {
  const target = event.target;
  if (target?.closest) return target.closest(selector);
  return target?.parentElement?.closest?.(selector) || null;
}

function render() {
  els.showName.value = state.show.name || "Current Show";
  els.showDate.value = state.show.date;
  renderSavedShows();
  renderFilters();
  renderLineup();
  renderSongBank();
}

function renderSavedShows() {
  if (els.savedShowsCurrent) {
    els.savedShowsCurrent.textContent = `${state.show.name || "Current Show"} · ${formatExportDate(state.show.date)}`;
  }
  const shows = Array.isArray(state.shows) && state.shows.length
    ? state.shows
    : normalizeState(state).shows;
  if (!Array.isArray(state.shows) || !state.shows.length) {
    state = normalizeState({ ...state, shows });
  }
  els.savedShowsList.innerHTML = shows
    .map((show) => `
      <button class="saved-show-chip ${show.id === state.activeShowId ? "active" : ""}" data-show-id="${show.id}">
        <span>${escapeHtml(show.name)}</span>
        <small>${escapeHtml(formatExportDate(show.date))}</small>
      </button>
    `)
    .join("");
}

function setSidePanelMode(mode) {
  sidePanelMode = mode === "shows" ? "shows" : "library";
  els.appShell.classList.remove("bank-collapsed");
  els.bankPanel?.classList.toggle("shows-mode", sidePanelMode === "shows");
  els.bankPanel?.setAttribute("aria-label", sidePanelMode === "shows" ? "Saved shows" : "Song bank");
  if (els.sidePanelTitle) els.sidePanelTitle.textContent = sidePanelMode === "shows" ? "Shows" : "Library";
  if (els.libraryView) els.libraryView.hidden = sidePanelMode !== "library";
  if (els.showsView) els.showsView.hidden = sidePanelMode !== "shows";
  if (els.newSongButton) els.newSongButton.hidden = sidePanelMode !== "library";
  if (els.quickAddButton) els.quickAddButton.hidden = sidePanelMode !== "library";
  els.showsTabButton?.classList.toggle("active", sidePanelMode === "shows");
}

function isMobileLayout() {
  return window.matchMedia("(max-width: 760px)").matches;
}

function openMobileLibraryDrawer() {
  if (!isMobileLayout() || !els.appShell.classList.contains("bank-collapsed")) return;
  setSidePanelMode(sidePanelMode);
}

function applyTheme(theme) {
  const nextTheme = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem(themeStorageKey, nextTheme);
  const light = nextTheme === "light";
  els.themeToggle.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
  els.themeToggle.title = light ? "Switch to dark mode" : "Switch to light mode";
}

function applySkin(skin) {
  const nextSkin = ["simple", "premium", "playful"].includes(skin) ? skin : "simple";
  document.documentElement.dataset.skin = nextSkin;
  localStorage.setItem(skinStorageKey, nextSkin);
  updateSkinChoices();
}

function toggleTheme() {
  applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
  toast(`${document.documentElement.dataset.theme === "light" ? "Light" : "Dark"} mode enabled.`);
}

function renderFilters() {
  const allFilters = [{ name: "All", color: "#5b92ff" }, ...categories];
  els.categoryFilters.innerHTML = `
    <div class="filter-group" aria-label="Song type filters">
      <div class="filter-options">
        ${allFilters
          .map((category) => {
            const active = category.name === activeCategory ? "active" : "";
            return `<button class="filter-chip ${active}" data-category="${category.name}" style="--chip-color:${category.color}">${category.name}</button>`;
          })
          .join("")}
        <button class="banger-filter ${bangersOnly ? "active" : ""}" type="button" data-banger-filter aria-label="Show only bangers" title="Show only bangers">
          ${flameIcon()}
        </button>
      </div>
    </div>
  `;
}

function renderLineup() {
  if (!state.lineup.length) {
    els.lineupRows.innerHTML = `
      <div class="empty-state">
        <div>
          <strong>Build your lineup here.</strong>
          Drag songs from the bank, or double-click a song to add it to the end.
        </div>
      </div>
    `;
    return;
  }

  els.lineupRows.innerHTML = state.lineup
    .map((item, index) => {
      if (item.type === "note") return renderNoteRow(item, index);
      const song = state.songs.find((candidate) => candidate.id === item.songId);
      if (!song) return "";
      const category = categoryFor(song.category);
      return `
        <article class="lineup-row song-row ${draggedLineupId === item.id ? "dragging" : ""}" style="--category-color:${category.color}" data-lineup-id="${item.id}">
          <div class="drag-handle" role="button" tabindex="0" aria-label="Drag to reorder" title="Drag to reorder">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01"/></svg>
          </div>
          <div class="song-number">${index + 1}</div>
          <div class="song-title-wrap">
            <div class="song-text">
              <div class="song-name">${escapeHtml(song.title)}</div>
              <div class="subline">
                ${song.banger ? `<span class="banger-mark inline" title="Banger">${flameIcon()}</span>` : ""}
                ${normalizeCategoryName(song.category)}${song.duration ? ` / ${song.duration}` : ""}
              </div>
            </div>
          </div>
          <label class="line-song-note">
            <input value="${escapeHtml(item.note || "")}" maxlength="80" placeholder="-" onchange="setLineupNote('${item.id}', this.value)" aria-label="Notes for ${escapeHtml(song.title)}" title="Song note" />
          </label>
          <div class="capo-cell">
            <select class="capo-select" data-action="capo" data-lineup-id="${item.id}" onchange="setLineupCapo('${item.id}', this.value)" aria-label="Capo for ${escapeHtml(song.title)}">
              ${capoOptions.map((option) => `<option value="${option}" ${option === item.capo ? "selected" : ""}>${option || "-"}</option>`).join("")}
            </select>
          </div>
          <div class="key-cell">
            <select class="key-select" data-action="key" data-lineup-id="${item.id}" onchange="setLineupKey('${item.id}', this.value)" aria-label="Key for ${escapeHtml(song.title)}">
              ${keys.map((key) => `<option value="${key}" ${key === (item.key || song.key) ? "selected" : ""}>${key}</option>`).join("")}
            </select>
          </div>
          <button class="slides-status-button ${slidesButtonClass(item)}" data-action="slides" data-lineup-id="${item.id}" onclick="handleLineupAction('slides', '${item.id}', '${song.id}')" aria-label="Slides for ${escapeHtml(song.title)}: ${slidesButtonTitle(item)}" title="${slidesButtonTitle(item)}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v12H4z"/><path d="M8 21h8"/><path d="M12 17v4"/><path d="M8 9h8M8 13h5"/></svg>
          </button>
          <button class="ready-toggle ${item.ready ? "ready" : ""}" data-action="ready" data-lineup-id="${item.id}" onclick="handleLineupAction('ready', '${item.id}', '')" aria-label="Toggle ready">
            ${item.ready ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>' : ""}
          </button>
          <div class="row-icon-actions">
            <button class="icon-action" data-action="info" data-song-id="${song.id}" onclick="handleLineupAction('info', '${item.id}', '${song.id}')" aria-label="Edit ${escapeHtml(song.title)}" title="Edit song">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
            </button>
            <button class="icon-action danger" data-action="remove" data-lineup-id="${item.id}" onclick="handleLineupAction('remove', '${item.id}', '')" aria-label="Remove ${escapeHtml(song.title)}" title="Remove">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderNoteRow(item, index) {
  return `
    <article class="lineup-row note-row ${draggedLineupId === item.id ? "dragging" : ""}" data-lineup-id="${item.id}">
      <div class="drag-handle" role="button" tabindex="0" aria-label="Drag to reorder" title="Drag to reorder">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01"/></svg>
      </div>
      <div class="song-number">${index + 1}</div>
      <div class="song-text">
        <div class="note-title">Note</div>
        <div class="note-text">${escapeHtml(item.text)}</div>
      </div>
      <div class="note-inline-actions">
        <button class="icon-action" data-action="edit-note" data-lineup-id="${item.id}" onclick="handleLineupAction('edit-note', '${item.id}', '')" aria-label="Edit note" title="Edit note">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
        </button>
        <button class="icon-action danger" data-action="remove" data-lineup-id="${item.id}" onclick="handleLineupAction('remove', '${item.id}', '')" aria-label="Remove note" title="Remove">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
        </button>
      </div>
    </article>
  `;
}

function renderSongBank() {
  const librarySearch = parseLibrarySearch(searchTerm);
  const filtered = state.songs
    .filter((song) => activeCategory === "All" || normalizeCategoryName(song.category) === activeCategory)
    .filter((song) => !bangersOnly || song.banger)
    .filter((song) => !librarySearch.hebrewOnly || song.hebrew)
    .filter((song) => {
      const haystack = `${song.title} ${normalizeCategoryName(song.category)} ${tagString(song.tags)}`.toLowerCase();
      return !librarySearch.text || haystack.includes(librarySearch.text);
    })
    .sort((a, b) => sortAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title));

  if (!filtered.length) {
    const emptyCopy = state.songs.length
      ? "No songs match this view."
      : "<strong>Your song bank is empty.</strong>Create your first song.";
    els.songBankList.innerHTML = `<div class="empty-state"><div>${emptyCopy}</div></div>`;
    return;
  }

  els.songBankList.innerHTML = filtered
    .map((song) => {
      const category = categoryFor(song.category);
      return `
        <article class="bank-song ${draggedBankSongId === song.id ? "dragging" : ""}" style="--category-color:${category.color}" data-song-id="${song.id}">
          <button class="bank-add-button" type="button" data-action="add-bank" data-song-id="${song.id}" aria-label="Add ${escapeHtml(song.title)} to lineup">
            <span class="bank-song-main">
              <span class="song-name">${escapeHtml(song.title)}</span>
              ${song.hebrew ? `<span class="hebrew-badge" title="Contains Hebrew">He</span>` : ""}
              ${normalizeTags(song.tags).length ? `<span class="bank-tags">${normalizeTags(song.tags).slice(0, 3).map((tag) => `#${escapeHtml(tag)}`).join(" ")}</span>` : ""}
            </span>
          </button>
          <span class="bank-meta">${song.key}</span>
          <button class="banger-toggle ${song.banger ? "active" : ""}" data-action="toggle-banger" data-song-id="${song.id}" aria-label="${song.banger ? "Remove banger mark" : "Mark as banger"}" title="${song.banger ? "Remove banger mark" : "Mark as banger"}">
            ${flameIcon()}
          </button>
          <button class="slides-status-button bank-slides-button ${slidesButtonClass(song)}" data-action="slides" data-song-id="${song.id}" aria-label="Slides for ${escapeHtml(song.title)}: ${slidesButtonTitle(song)}" title="${slidesButtonTitle(song)}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v12H4z"/><path d="M8 21h8"/><path d="M12 17v4"/><path d="M8 9h8M8 13h5"/></svg>
          </button>
          <button class="more-button" data-action="edit-bank" data-song-id="${song.id}" aria-label="Edit ${escapeHtml(song.title)}">...</button>
        </article>
      `;
    })
    .join("");
}

function populateFormOptions() {
  els.songCategoryButtons.innerHTML = categories
    .map((category) => `
      <button class="category-choice-button" type="button" data-song-category="${category.name}" style="--chip-color:${category.color}" role="radio" aria-checked="false">
        ${category.name}
      </button>
    `)
    .join("");
  els.songKey.innerHTML = keys.map((key) => `<option value="${key}">${key}</option>`).join("");
  els.songCapo.innerHTML = capoOptions.map((capo) => `<option value="${capo}">${capo || "None"}</option>`).join("");
}

function setSongCategoryChoice(categoryName) {
  const category = normalizeCategoryName(categoryName);
  els.songCategory.value = category;
  els.songCategoryButtons.querySelectorAll("[data-song-category]").forEach((button) => {
    const active = button.dataset.songCategory === category;
    button.classList.toggle("active", active);
    button.setAttribute("aria-checked", String(active));
  });
}

function openSongDialog(song = null) {
  els.songForm.reset();
  els.songId.value = song?.id || "";
  els.dialogMode.textContent = song ? "Edit" : "New";
  els.dialogTitle.textContent = song ? "Edit Song" : "Create New Song";
  els.deleteSongButton.hidden = !song;
  els.songTitle.value = song?.title || "";
  setSongCategoryChoice(song?.category || "Services");
  els.songKey.value = song?.key || "C";
  els.songCapo.value = song?.capo || "";
  els.songDuration.value = song?.duration || "";
  els.songHebrew.checked = song ? Boolean(song.hebrew) : false;
  els.songCredits.value = song?.credits || "";
  els.songTags.value = tagString(song?.tags || []);
  els.songNotes.value = song?.notes || "";
  renderTagSuggestions(song?.id || "");
  openDialog(els.songDialog);
  setTimeout(() => els.songTitle.focus(), 50);
}

function upsertSong(event) {
  event.preventDefault();
  const song = {
    id: els.songId.value || makeId("song"),
    title: els.songTitle.value.trim(),
    category: normalizeCategoryName(els.songCategory.value),
    key: els.songKey.value,
    capo: els.songCapo.value,
    duration: els.songDuration.value.trim(),
    banger: state.songs.find((candidate) => candidate.id === els.songId.value)?.banger || false,
    hebrew: els.songHebrew.checked,
    credits: els.songCredits.value.trim(),
    tags: normalizeTags(els.songTags.value),
    notes: els.songNotes.value.trim(),
  };

  if (!song.title) return;
  const existingIndex = state.songs.findIndex((candidate) => candidate.id === song.id);
  if (existingIndex >= 0) {
    state.songs[existingIndex] = song;
    state.lineup = state.lineup.map((item) => item.songId === song.id ? { ...item, capo: item.capo || song.capo } : item);
    toast("Song updated.");
  } else {
    state.songs.push(song);
    toast("Song saved to the bank.");
  }

  saveState();
  closeDialog(els.songDialog);
  render();
}

function saveSongFromDialog(event) {
  event?.preventDefault?.();

  try {
    const title = els.songTitle.value.trim();
    const duration = els.songDuration.value.trim();

    if (!title) {
      els.songTitle.focus();
      toast("Add a song title first.");
      return false;
    }

    if (duration && !/^[0-9]{1,2}:[0-5][0-9]$/.test(duration)) {
      els.songDuration.focus();
      toast("Duration should look like 4:20, or leave it blank.");
      return false;
    }

    upsertSong({ preventDefault() {} });
    return true;
  } catch (error) {
    console.error("Song could not be saved.", error);
    toast("Song could not be saved. Refresh once and try again.");
    return false;
  }
}

function saveNoteFromDialog(event) {
  event?.preventDefault?.();
  try {
    if (!els.noteText.value.trim()) {
      els.noteText.focus();
      toast("Add note text first.");
      return false;
    }
    saveNote({ preventDefault() {} });
    return true;
  } catch (error) {
    console.error("Note could not be saved.", error);
    toast("Note could not be saved. Refresh once and try again.");
    return false;
  }
}

function importQuickSongsFromDialog(event) {
  event?.preventDefault?.();
  try {
    importQuickSongs({ preventDefault() {} });
    return true;
  } catch (error) {
    console.error("Quick add could not import songs.", error);
    toast("Quick add could not import songs. Refresh once and try again.");
    return false;
  }
}

function openQuickAddDialog() {
  els.quickAddText.value = "";
  els.quickPastePanel.hidden = true;
  quickAddRows = Array.from({ length: 4 }, () => makeQuickAddRow());
  renderQuickAddRows();
  openDialog(els.quickAddDialog);
  setTimeout(() => {
    const firstTitle = els.quickAddRows.querySelector("[data-quick-title]");
    if (firstTitle) firstTitle.focus();
  }, 50);
}

function makeQuickAddRow(title = "", category = activeCategory === "All" ? "Services" : activeCategory, credits = "", banger = false) {
  return {
    id: makeId("quick"),
    title,
    category: normalizeCategoryName(category),
    credits,
    banger,
    checked: true,
  };
}

function parseQuickAddText() {
  const lines = els.quickAddText.value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  quickAddRows = lines.length
    ? lines.map((line) => makeQuickAddRow(line))
    : [makeQuickAddRow()];
  renderQuickAddRows();
}

function renderQuickAddRows() {
  els.quickAddRows.innerHTML = quickAddRows
    .map((row) => `
      <div class="quick-add-row" data-quick-id="${row.id}">
        <input type="checkbox" data-quick-check ${row.checked ? "checked" : ""} aria-label="Import ${escapeHtml(row.title || "song")}" />
        <input data-quick-title value="${escapeHtml(row.title)}" maxlength="70" placeholder="Song title" />
        <select data-quick-category aria-label="Category">
          ${categories.map((category) => `<option value="${category.name}" ${category.name === row.category ? "selected" : ""}>${category.name}</option>`).join("")}
        </select>
        <input data-quick-credits value="${escapeHtml(row.credits)}" maxlength="120" placeholder="Credits" />
        <button class="quick-banger-toggle ${row.banger ? "active" : ""}" type="button" data-quick-banger aria-label="${row.banger ? "Remove banger mark" : "Mark as banger"}" title="${row.banger ? "Remove banger mark" : "Mark as banger"}">
          ${flameIcon()}
        </button>
      </div>
    `)
    .join("");
}

function updateQuickRowFromControl(control) {
  const rowEl = control.closest("[data-quick-id]");
  if (!rowEl) return;
  const row = quickAddRows.find((candidate) => candidate.id === rowEl.dataset.quickId);
  if (!row) return;
  if (control.matches("[data-quick-check]")) row.checked = control.checked;
  if (control.matches("[data-quick-title]")) row.title = control.value;
  if (control.matches("[data-quick-category]")) row.category = normalizeCategoryName(control.value);
  if (control.matches("[data-quick-credits]")) row.credits = control.value;
  if (control.matches("[data-quick-banger]")) row.banger = !row.banger;
}

function addQuickRow() {
  els.quickAddRows.querySelectorAll("input, select").forEach(updateQuickRowFromControl);
  quickAddRows.push(makeQuickAddRow());
  renderQuickAddRows();
  const titleInputs = els.quickAddRows.querySelectorAll("[data-quick-title]");
  titleInputs[titleInputs.length - 1]?.focus();
}

function importQuickSongs(event) {
  event.preventDefault();
  els.quickAddRows.querySelectorAll("input, select").forEach(updateQuickRowFromControl);
  const songs = quickAddRows
    .filter((row) => row.checked && row.title.trim())
    .map((row) => ({
      id: makeId("song"),
      title: row.title.trim(),
      category: normalizeCategoryName(row.category),
      key: "C",
      capo: "",
      duration: "",
      banger: Boolean(row.banger),
      hebrew: hasHebrewLetters(row.title),
      credits: row.credits.trim(),
      notes: "",
    }));

  if (!songs.length) {
    toast("Choose at least one song to import.");
    return;
  }

  state.songs.push(...songs);
  saveState();
  closeDialog(els.quickAddDialog);
  render();
  toast(`${songs.length} song${songs.length === 1 ? "" : "s"} imported.`);
}

function deleteSong() {
  const id = els.songId.value;
  if (!id) return;
  const song = state.songs.find((candidate) => candidate.id === id);
  const confirmed = window.confirm(`Delete "${song.title}" from the song bank and lineups?`);
  if (!confirmed) return;
  state.songs = state.songs.filter((candidate) => candidate.id !== id);
  state.lineup = state.lineup.filter((item) => item.songId !== id);
  saveState();
  closeDialog(els.songDialog);
  render();
  toast("Song deleted.");
}

function addSongToLineup(songId, showMessage = true, insertAt = null) {
  const song = state.songs.find((candidate) => candidate.id === songId);
  if (!song) return;
  const lineupItem = {
    id: makeId("lineup"),
    type: "song",
    songId,
    capo: song.capo,
    key: song.key,
    ready: false,
    note: "",
    slidesStatus: song.slideSongId ? "slides-ready" : "no-slides",
    slideSongId: song.slideSongId || "",
    slideFlowId: song.slideFlowId || "",
  };
  if (Number.isInteger(insertAt) && insertAt >= 0 && insertAt <= state.lineup.length) {
    state.lineup.splice(insertAt, 0, lineupItem);
  } else {
    state.lineup.push(lineupItem);
  }
  saveState();
  renderLineup();
  if (showMessage) toast(`Added "${song.title}" to the lineup.`);
  return lineupItem;
}

function openNoteDialog(item = null) {
  els.noteForm.reset();
  els.noteId.value = item?.id || "";
  els.noteText.value = item?.text || "";
  els.noteDialogMode.textContent = item ? "Edit" : "Lineup";
  els.noteDialogTitle.textContent = item ? "Edit Note" : "Add Note";
  els.deleteNoteButton.hidden = !item;
  openDialog(els.noteDialog);
  setTimeout(() => els.noteText.focus(), 50);
}

function saveNote(event) {
  event.preventDefault();
  const text = els.noteText.value.trim();
  if (!text) return;

  const existing = state.lineup.find((item) => item.id === els.noteId.value);
  if (existing) {
    existing.text = text;
    toast("Note updated.");
  } else {
    state.lineup.push({ id: makeId("lineup"), type: "note", text });
    toast("Note added to lineup.");
  }

  saveState();
  closeDialog(els.noteDialog);
  renderLineup();
}

function deleteNote() {
  const id = els.noteId.value;
  state.lineup = state.lineup.filter((item) => item.id !== id);
  saveState();
  closeDialog(els.noteDialog);
  renderLineup();
  toast("Note removed.");
}

function openShowNotesDialog() {
  els.showNotesText.value = state.show.notes || "";
  openDialog(els.showNotesDialog);
  setTimeout(() => els.showNotesText.focus(), 50);
}

function saveShowNotes(event) {
  event.preventDefault();
  state.show.notes = els.showNotesText.value.trim();
  saveState();
  closeDialog(els.showNotesDialog);
  toast(state.show.notes ? "Show notes saved." : "Show notes cleared.");
}

function openTeamDialog() {
  els.teamText.value = state.show.team || "";
  openDialog(els.teamDialog);
  setTimeout(() => els.teamText.focus(), 50);
}

function saveTeam(event) {
  event.preventDefault();
  state.show.team = els.teamText.value.trim();
  saveState();
  closeDialog(els.teamDialog);
  toast(state.show.team ? "Team list saved." : "Team list cleared.");
}

function updateSettingsDialog() {
  if (!els.settingsThemeText) return;
  const light = document.documentElement.dataset.theme === "light";
  els.settingsThemeText.textContent = light ? "Switch to dark mode" : "Switch to light mode";
  updateSkinChoices();
}

function updateSkinChoices() {
  if (!els.skinChoiceGrid) return;
  const activeSkin = document.documentElement.dataset.skin || "simple";
  els.skinChoiceGrid.querySelectorAll("[data-skin-choice]").forEach((button) => {
    const active = button.dataset.skinChoice === activeSkin;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function openSettingsDialog() {
  updateSettingsDialog();
  openDialog(els.settingsDialog);
}

function switchShow(showId) {
  syncActiveShowFromFields();
  const show = state.shows.find((candidate) => candidate.id === showId);
  if (!show) return;
  state.activeShowId = show.id;
  state.show = { name: show.name, date: show.date, notes: show.notes || "", team: show.team || "" };
  state.lineup = show.lineup;
  saveState();
  render();
  toast(`Opened ${show.name}.`);
}

function createNewShow() {
  syncActiveShowFromFields();
  const show = {
    id: makeId("show"),
    name: "New Show",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
    team: "",
    lineup: [],
  };
  state.shows.unshift(show);
  state.activeShowId = show.id;
  state.show = { name: show.name, date: show.date, notes: show.notes, team: show.team };
  state.lineup = show.lineup;
  saveState();
  render();
  els.showName.focus();
  els.showName.select();
  toast("New show created.");
}

function duplicateCurrentShow() {
  syncActiveShowFromFields();
  const current = activeShow();
  const copy = {
    id: makeId("show"),
    name: `${current.name} Copy`,
    date: current.date,
    notes: current.notes || "",
    team: current.team || "",
    lineup: JSON.parse(JSON.stringify(current.lineup || [])),
  };
  state.shows.unshift(copy);
  state.activeShowId = copy.id;
  state.show = { name: copy.name, date: copy.date, notes: copy.notes, team: copy.team };
  state.lineup = copy.lineup;
  saveState();
  render();
  toast("Show duplicated.");
}

function deleteCurrentShow() {
  if (state.shows.length <= 1) {
    toast("Keep at least one show.");
    return;
  }
  const current = activeShow();
  if (!window.confirm(`Delete "${current.name}"?`)) return;
  state.shows = state.shows.filter((show) => show.id !== current.id);
  const next = state.shows[0];
  state.activeShowId = next.id;
  state.show = { name: next.name, date: next.date, notes: next.notes || "", team: next.team || "" };
  state.lineup = next.lineup;
  saveState();
  render();
  toast("Show deleted.");
}

function setRailActive(button) {
  document.querySelectorAll(".rail-button").forEach((candidate) => candidate.classList.remove("active"));
  button.classList.add("active");
}

function getExportItems() {
  return state.lineup
    .map((item, index) => {
      if (item.type === "note") {
        return {
          type: "note",
          number: index + 1,
          title: item.text,
          key: "",
          capo: "",
        };
      }

      const song = state.songs.find((candidate) => candidate.id === item.songId);
      if (!song) return null;
      return {
        type: "song",
        number: index + 1,
        title: song.title,
        key: item.key || song.key,
        capo: item.capo || "",
        credits: song.credits || "",
        note: item.note || "",
      };
    })
    .filter(Boolean);
}

function openExportPreview() {
  const exportItems = getExportItems();
  if (!exportItems.length) {
    toast("Add songs or notes before exporting.");
    return;
  }

  els.exportCreditsToggle.checked = false;
  if (els.exportRealKeyToggle) els.exportRealKeyToggle.checked = false;
  hideDownloadReady();
  setExportOrientation("portrait");
  renderExportPreview(exportItems);
  openDialog(els.exportDialog);
}

function renderExportPreview(items = getExportItems()) {
  els.exportPreview.innerHTML = buildPreviewHtml(
    items,
    els.exportCreditsToggle.checked,
    getExportRealKey(),
    getExportOrientation(),
    getExportFontSize(),
    getExportSpacing(),
    getExportColumnMode(),
    getExportFitPage(),
  );
}

function exportLineup(format) {
  const exportItems = getExportItems();
  if (!exportItems.length) {
    toast("Add songs or notes before exporting.");
    return null;
  }

  if (format === "pdf") {
    try {
      const pdfBlob = buildPdfBlob(
        exportItems,
        els.exportCreditsToggle.checked,
        getExportRealKey(),
        getExportOrientation(),
        getExportFontSize(),
        getExportSpacing(),
        getExportColumnMode(),
        getExportFitPage(),
      );
      if (!pdfBlob.size) throw new Error("PDF was empty.");
      return {
        blob: pdfBlob,
        fileName: `${safeFileName(state.show.name || "lineup")}.pdf`,
        message: "PDF is ready.",
      };
    } catch (error) {
      console.error(error);
      toast("Could not create the PDF.");
    }
    return null;
  }

  if (format === "print") {
    printExportHtml(buildPrintImageHtml(
      exportItems,
      els.exportCreditsToggle.checked,
      getExportRealKey(),
      getExportOrientation(),
      getExportFontSize(),
      getExportSpacing(),
      getExportColumnMode(),
      getExportFitPage(),
    ));
    return null;
  }

  const html = buildExportHtml(
    exportItems,
    els.exportCreditsToggle.checked,
    getExportRealKey(),
    getExportOrientation(),
    getExportFontSize(),
    getExportSpacing(),
    getExportColumnMode(),
    getExportFitPage(),
  );
  const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
  return {
    blob,
    fileName: `${safeFileName(state.show.name || "lineup")}.doc`,
    message: "DOC is ready.",
  };
}

function downloadBlob(blob, fileName, message = "File is ready.") {
  if (!blob?.size) {
    toast("Could not create the file.");
    return;
  }
  const readyLink = showDownloadReady(blob, fileName, message);
  const directLink = document.createElement("a");
  directLink.href = readyLink.href;
  directLink.download = fileName;
  directLink.rel = "noopener";
  directLink.style.display = "none";
  document.body.append(directLink);
  directLink.click();
  setTimeout(() => directLink.remove(), 1000);
  toast(`${message} If it did not download, press the ready link.`);
}

function prepareDownloadLink(link, blob, fileName, message = "File is ready.") {
  if (!blob?.size) {
    link.href = "#";
    link.removeAttribute("download");
    toast("Could not create the file.");
    return false;
  }

  const previousUrl = link.dataset.url;
  if (previousUrl) URL.revokeObjectURL(previousUrl);
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = fileName;
  link.dataset.url = url;
  showDownloadReady(url, fileName, message);
  toast(message);
  return true;
}

function prepareExportDownload(event, format) {
  event.preventDefault();
  const result = format === "lineup" ? buildLineupDownload() : exportLineup(format);
  if (!result) return;
  downloadBlob(result.blob, result.fileName, result.message);
}

function prepareExportAnchor(event, format) {
  const link = event.currentTarget;
  const result = format === "lineup" ? buildLineupDownload() : exportLineup(format);
  if (!result) {
    event.preventDefault();
    return;
  }

  const previousUrl = link.dataset.url;
  if (previousUrl) URL.revokeObjectURL(previousUrl);
  const url = URL.createObjectURL(result.blob);
  link.href = url;
  link.download = result.fileName;
  link.dataset.url = url;
  showDownloadReady(url, result.fileName, result.message);
  toast(result.message);
}

function saveDataUrlFile(dataUrl, fileName, message = "File is ready.") {
  const readyLink = showDownloadReady(dataUrl, fileName, message);
  readyLink.click();
  toast(`${message} If it did not download, press the ready link.`);
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result || "")));
    reader.addEventListener("error", () => reject(reader.error || new Error("Could not prepare file.")));
    reader.readAsDataURL(blob);
  });
}

async function saveExportBlob(blob, fileName, message = "File is ready.") {
  if (!blob?.size) {
    toast("Could not create the file.");
    return;
  }
  saveDataUrlFile(await blobToDataUrl(blob), fileName, message);
}

function showDownloadReady(blobOrUrl, fileName, message) {
  const url = typeof blobOrUrl === "string" ? blobOrUrl : URL.createObjectURL(blobOrUrl);
  const previousUrl = els.exportDownloadReady?.dataset.url;
  if (previousUrl) URL.revokeObjectURL(previousUrl);
  if (!url.startsWith("data:")) els.exportDownloadReady.dataset.url = url;
  els.exportDownloadReady.hidden = false;
  els.exportDownloadReady.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <a href="${url}" download="${escapeHtml(fileName)}">${escapeHtml(fileName)}</a>
  `;
  return els.exportDownloadReady.querySelector("a");
}

function hideDownloadReady() {
  if (!els.exportDownloadReady) return;
  const previousUrl = els.exportDownloadReady.dataset.url;
  if (previousUrl) URL.revokeObjectURL(previousUrl);
  els.exportDownloadReady.hidden = true;
  els.exportDownloadReady.innerHTML = "";
  delete els.exportDownloadReady.dataset.url;
}

function printExportHtml(html) {
  let frame = document.querySelector("#exportPrintFrame");
  if (!frame) {
    frame = document.createElement("iframe");
    frame.id = "exportPrintFrame";
    frame.title = "Lineup export print frame";
    frame.setAttribute("aria-hidden", "true");
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "0";
    frame.style.height = "0";
    frame.style.border = "0";
    frame.style.opacity = "0";
    frame.style.pointerEvents = "none";
    document.body.append(frame);
  }

  const frameWindow = frame.contentWindow;
  const frameDocument = frame.contentDocument || frameWindow?.document;
  if (!frameWindow || !frameDocument) {
    toast("Could not prepare the export.");
    return;
  }

  frameDocument.open();
  frameDocument.write(html);
  frameDocument.close();

  frameWindow.onafterprint = () => {
    setTimeout(() => frame.remove(), 500);
  };

  toast("Print dialog opened.");
  window.setTimeout(() => {
    try {
      frameWindow.focus();
      frameWindow.print();
    } catch {
      toast("Could not open the print dialog.");
    }
  }, 80);
}

function exportPageForOrientation(orientation) {
  return orientation === "landscape" ? { width: 842, height: 595 } : { width: 595, height: 842 };
}

function buildExportCanvas(items, includeCredits, includeRealKey, orientation, fontMode, spacingMode, columnMode, fitPage, scale = 2) {
  const metrics = exportLayoutMetrics(items, orientation, fontMode, spacingMode, columnMode, fitPage);
  const page = exportPageForOrientation(orientation);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(page.width * scale);
  canvas.height = Math.round(page.height * scale);
  const context = canvas.getContext("2d");
  context.scale(scale, scale);
  drawPdfCanvas(context, page, items, includeCredits, includeRealKey, orientation, metrics);
  return { canvas, page };
}

function buildPdfBlob(items, includeCredits, includeRealKey, orientation, fontMode, spacingMode, columnMode, fitPage) {
  const { canvas, page } = buildExportCanvas(items, includeCredits, includeRealKey, orientation, fontMode, spacingMode, columnMode, fitPage, 2);
  const imageBytes = imageBytesFromDataUrl(canvas.toDataURL("image/jpeg", 0.94));
  return makeImagePdf(imageBytes, canvas.width, canvas.height, page.width, page.height);
}

function buildExportImageDataUrl(items, includeCredits, includeRealKey, orientation, fontMode, spacingMode, columnMode, fitPage) {
  const { canvas } = buildExportCanvas(items, includeCredits, includeRealKey, orientation, fontMode, spacingMode, columnMode, fitPage, 1.5);
  return canvas.toDataURL("image/png");
}

function buildPrintImageHtml(items, includeCredits, includeRealKey, orientation, fontMode, spacingMode, columnMode, fitPage) {
  const imageUrl = buildExportImageDataUrl(items, includeCredits, includeRealKey, orientation, fontMode, spacingMode, columnMode, fitPage);
  return `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${escapeHtml(state.show.name || "Lineup")}</title>
        <style>
          @page { size: ${orientation}; margin: 0; }
          html, body { width: 100%; height: 100%; margin: 0; background: #fff; }
          body { display: grid; place-items: center; }
          img { display: block; width: 100vw; height: 100vh; object-fit: contain; }
        </style>
      </head>
      <body>
        <img src="${imageUrl}" alt="${escapeHtml(state.show.name || "Lineup")}">
      </body>
    </html>`;
}

function imageBytesFromDataUrl(dataUrl) {
  const base64 = String(dataUrl || "").split(",")[1];
  if (!base64) throw new Error("Could not render PDF image.");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function drawPdfCanvas(context, page, items, includeCredits, includeRealKey, orientation, metrics) {
  const margin = orientation === "landscape" ? 34 : 40;
  const columnGap = metrics.columns > 1 ? 18 : 0;
  const columnWidth = (page.width - margin * 2 - columnGap * (metrics.columns - 1)) / metrics.columns;
  const rowsPerColumn = Math.ceil(items.length / metrics.columns);
  const exportDate = formatExportDate(state.show.date);
  const titleSize = orientation === "landscape" ? 34 : 30;
  const labelY = margin + 58;
  const lineStartY = labelY + 24;

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, page.width, page.height);
  context.fillStyle = "#111111";
  context.textBaseline = "alphabetic";
  context.font = `800 ${titleSize}px Arial, Helvetica, sans-serif`;
  context.fillText(state.show.name || "Lineup", margin, margin + titleSize);
  context.font = "800 18px Arial, Helvetica, sans-serif";
  context.textAlign = "right";
  context.fillText(exportDate, page.width - margin, margin + titleSize - 2);
  context.textAlign = "left";
  context.strokeStyle = "#111111";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(margin, margin + titleSize + 16);
  context.lineTo(page.width - margin, margin + titleSize + 16);
  context.stroke();

  for (let column = 0; column < metrics.columns; column += 1) {
    const x = margin + column * (columnWidth + columnGap);
    drawPdfLabels(context, x, labelY, columnWidth, includeRealKey);
    const columnItems = items.slice(column * rowsPerColumn, (column + 1) * rowsPerColumn);
    let y = lineStartY;
    columnItems.forEach((item) => {
      drawPdfLine(context, item, x, y, columnWidth, metrics, includeCredits, includeRealKey, orientation);
      y += item.type === "note" ? metrics.noteRowHeight : metrics.rowHeight;
    });
  }
}

function drawPdfLabels(context, x, y, width, includeRealKey) {
  const keyWidth = 36;
  const capoWidth = 46;
  const numberWidth = 42;
  const realKeyWidth = includeRealKey ? 44 : 0;
  context.save();
  context.font = "900 11px Arial, Helvetica, sans-serif";
  context.fillStyle = "#444444";
  context.textTransform = "uppercase";
  context.fillText("SONG", x + numberWidth + 6, y);
  context.textAlign = "center";
  context.fillText("CAPO", x + width - realKeyWidth - keyWidth - capoWidth / 2, y);
  context.fillText("KEY", x + width - realKeyWidth - keyWidth / 2, y);
  if (includeRealKey) context.fillText("REAL", x + width - realKeyWidth / 2, y);
  context.strokeStyle = "#111111";
  context.lineWidth = 1.7;
  context.beginPath();
  context.moveTo(x, y + 10);
  context.lineTo(x + width, y + 10);
  context.stroke();
  context.restore();
}

function drawPdfLine(context, item, x, y, width, metrics, includeCredits, includeRealKey, orientation) {
  const keyWidth = 36;
  const capoWidth = 46;
  const numberWidth = 42;
  const realKeyWidth = includeRealKey ? 44 : 0;
  const lineHeight = item.type === "note" ? metrics.noteRowHeight : metrics.rowHeight;
  const mainY = y + lineHeight * 0.55;
  const titleX = x + numberWidth + 6;
  const titleWidth = width - numberWidth - capoWidth - keyWidth - realKeyWidth - 12;
  context.save();
  context.strokeStyle = "#222222";
  context.lineWidth = 1.45;

  if (item.type === "note") {
    context.fillStyle = "#f3f0e8";
    context.fillRect(x, y, width, lineHeight);
    context.fillStyle = "#6a4a00";
    context.font = `700 ${Math.max(15, metrics.fontSize - 8)}px Arial, Helvetica, sans-serif`;
    context.fillText("✎", x + 8, mainY);
    context.font = `italic 800 ${Math.max(17, metrics.fontSize - 5)}px Arial, Helvetica, sans-serif`;
    fitCanvasText(context, shortenTitle(item.title, metrics.columns, orientation), titleX, mainY, width - numberWidth - 12);
  } else {
    context.fillStyle = "#111111";
    context.font = `800 ${metrics.fontSize}px Arial, Helvetica, sans-serif`;
    context.textAlign = "right";
    context.fillText(item.number, x + numberWidth - 8, mainY);
    context.textAlign = "left";
    const note = item.note || "";
    const noteWidth = note ? Math.min(titleWidth * 0.34, Math.max(70, context.measureText(note).width + 10)) : 0;
    fitCanvasText(context, shortenTitle(item.title, metrics.columns, orientation), titleX, mainY, titleWidth - noteWidth - 6);
    if (note) {
      context.fillStyle = "#6a4a00";
      context.font = `italic 800 ${noteFontSize(metrics.fontSize, note)}px Arial, Helvetica, sans-serif`;
      fitCanvasText(context, note, titleX + titleWidth - noteWidth, mainY, noteWidth);
      context.fillStyle = "#111111";
    }
    if (includeCredits && item.credits) {
      context.fillStyle = "#555555";
      context.font = `700 ${Math.max(10, Math.floor(metrics.fontSize * 0.42))}px Arial, Helvetica, sans-serif`;
      fitCanvasText(context, item.credits, titleX, mainY + Math.max(11, metrics.fontSize * 0.36), titleWidth);
    }
    context.font = `800 ${metrics.fontSize}px Arial, Helvetica, sans-serif`;
    context.fillStyle = "#333333";
    context.textAlign = "center";
    context.fillText(formatExportCapo(item.capo), x + width - realKeyWidth - keyWidth - capoWidth / 2, mainY);
    context.fillText(item.key, x + width - realKeyWidth - keyWidth / 2, mainY);
    if (includeRealKey) {
      context.font = `800 ${Math.max(12, Math.floor(metrics.fontSize * 0.58))}px Arial, Helvetica, sans-serif`;
      context.fillText(formatRealKey(item.key, item.capo), x + width - realKeyWidth / 2, mainY);
    }
  }

  context.beginPath();
  context.moveTo(x, y + lineHeight);
  context.lineTo(x + width, y + lineHeight);
  context.stroke();
  context.restore();
}

function noteFontSize(fontSize, note) {
  if (note.length > 48) return Math.max(9, Math.floor(fontSize * 0.35));
  if (note.length > 30) return Math.max(10, Math.floor(fontSize * 0.42));
  if (note.length > 16) return Math.max(11, Math.floor(fontSize * 0.48));
  return Math.max(12, Math.floor(fontSize * 0.55));
}

function fitCanvasText(context, text, x, y, maxWidth) {
  const value = String(text || "");
  if (context.measureText(value).width <= maxWidth) {
    context.fillText(value, x, y);
    return;
  }
  let shortened = value;
  while (shortened.length > 1 && context.measureText(`${shortened}…`).width > maxWidth) {
    shortened = shortened.slice(0, -1).trimEnd();
  }
  context.fillText(`${shortened || value.slice(0, 1)}…`, x, y);
}

function makeImagePdf(imageBytes, imageWidth, imageHeight, pageWidth, pageHeight) {
  const content = `q ${pageWidth} 0 0 ${pageHeight} 0 0 cm /Im0 Do Q`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
    {
      head: `<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`,
      bytes: imageBytes,
      tail: "\nendstream",
    },
    `<< /Length ${textBytes(content).length} >>\nstream\n${content}\nendstream`,
  ];
  return buildPdfBytes(objects);
}

function buildPdfBytes(objects) {
  const chunks = [textBytes("%PDF-1.4\n")];
  const offsets = [0];
  let length = chunks[0].length;

  objects.forEach((object, index) => {
    offsets.push(length);
    const prefix = textBytes(`${index + 1} 0 obj\n`);
    chunks.push(prefix);
    length += prefix.length;
    if (typeof object === "string") {
      const body = textBytes(`${object}\n`);
      chunks.push(body);
      length += body.length;
    } else {
      const head = textBytes(object.head);
      const tail = textBytes(object.tail + "\n");
      chunks.push(head, object.bytes, tail);
      length += head.length + object.bytes.length + tail.length;
    }
    const suffix = textBytes("endobj\n");
    chunks.push(suffix);
    length += suffix.length;
  });

  const xrefOffset = length;
  const xrefLines = ["xref", `0 ${objects.length + 1}`, "0000000000 65535 f "];
  offsets.slice(1).forEach((offset) => {
    xrefLines.push(`${String(offset).padStart(10, "0")} 00000 n `);
  });
  xrefLines.push("trailer", `<< /Size ${objects.length + 1} /Root 1 0 R >>`, "startxref", String(xrefOffset), "%%EOF");
  chunks.push(textBytes(`${xrefLines.join("\n")}\n`));
  return new Blob(chunks, { type: "application/pdf" });
}

function textBytes(text) {
  return new TextEncoder().encode(text);
}

function getExportOrientation() {
  return document.querySelector("input[name='exportOrientation']:checked")?.value || "portrait";
}

function setExportOrientation(orientation) {
  els.exportOrientationInputs.forEach((input) => {
    input.checked = input.value === orientation;
  });
}

function getExportFontSize() {
  return document.querySelector("input[name='exportFontSize']:checked")?.value || "auto";
}

function getExportSpacing() {
  return document.querySelector("input[name='exportSpacing']:checked")?.value || "normal";
}

function getExportColumnMode() {
  return document.querySelector("input[name='exportColumns']:checked")?.value || "auto";
}

function getExportFitPage() {
  return Boolean(els.exportFitToggle?.checked);
}

function getExportRealKey() {
  return Boolean(els.exportRealKeyToggle?.checked);
}

function capoNumber(value) {
  const match = /(\d+)/.exec(value || "");
  return match ? Number(match[1]) : 0;
}

function formatRealKey(key, capo) {
  const realKey = transposeKey(key, capoNumber(capo));
  return realKey ? `(${realKey})` : "";
}

function transposeKey(key, semitones) {
  const match = /^([A-G](?:#|b)?)(m?)$/.exec(String(key || "").trim());
  if (!match) return key || "";

  const root = match[1];
  const minor = match[2] || "";
  const flatKeys = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
  const keyIndexes = {
    C: 0,
    "B#": 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    Fb: 4,
    "E#": 5,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11,
    Cb: 11,
  };
  const index = keyIndexes[root];
  if (index === undefined) return key || "";
  return `${flatKeys[(index + semitones) % 12]}${minor}`;
}

function columnCountFor(items, orientation, columnMode = "auto") {
  if (columnMode === "1" || columnMode === "2") return Number(columnMode);
  if (orientation === "landscape") return items.length > 12 ? 2 : 1;
  return items.length > 16 ? 2 : 1;
}

function exportLayoutMetrics(items, orientation, fontMode, spacingMode, columnMode, fitPage) {
  const columns = columnCountFor(items, orientation, columnMode);
  const spacingBase = { tight: 39, normal: 47, open: 56 }[spacingMode] || 47;
  let fontSize = exportFontSize(items, orientation, fontMode);
  let rowHeight = spacingBase;

  if (fitPage) {
    const usableHeight = orientation === "landscape" ? 390 : 610;
    const rowsPerColumn = Math.ceil(items.length / columns);
    const targetHeight = Math.floor(usableHeight / Math.max(rowsPerColumn, 1));
    rowHeight = Math.max(spacingBase, Math.min(78, targetHeight));
    if (fontMode === "auto") fontSize = Math.min(orientation === "landscape" ? 37 : 34, fontSize + 2);
  }

  return {
    columns,
    fontSize,
    rowHeight,
    noteRowHeight: Math.max(30, rowHeight - 4),
    creditGap: Math.round(Math.max(-1, Math.min(8, (rowHeight - 47) * 0.25 - 1))),
  };
}

function buildPreviewHtml(items, includeCredits, includeRealKey, orientation, fontMode, spacingMode, columnMode, fitPage) {
  const imageUrl = buildExportImageDataUrl(items, includeCredits, includeRealKey, orientation, fontMode, spacingMode, columnMode, fitPage);
  return `
    <section class="export-sheet-preview image-preview ${orientation}">
      <img src="${imageUrl}" alt="Export preview" />
    </section>
  `;
}

function previewLineHtml(item, includeCredits, columns, orientation) {
  if (item.type === "note") {
    return `
      <div class="export-sheet-line note">
        <span class="number note-symbol">✎</span>
        <span class="title">${escapeHtml(shortenTitle(item.title))}</span>
      </div>
    `;
  }
  const noteClass = exportNoteClass(item.note);

  return `
    <div class="export-sheet-line">
      <span class="number">${item.number}</span>
      <span class="title">
        <span class="title-main">
          <span class="song-title-export">${escapeHtml(shortenTitle(item.title, columns, orientation))}</span>
          ${item.note ? `<span class="line-note-export ${noteClass}">${escapeHtml(item.note)}</span>` : ""}
        </span>
        ${includeCredits && item.credits ? `<span class="credits">${escapeHtml(item.credits)}</span>` : ""}
      </span>
      <span class="capo">${escapeHtml(formatExportCapo(item.capo))}</span>
      <span class="key">${escapeHtml(item.key)}</span>
    </div>
  `;
}

function exportFontSize(items, orientation, fontMode) {
  if (fontMode === "xl") return orientation === "landscape" ? 34 : 30;
  if (fontMode === "large") return orientation === "landscape" ? 28 : 24;
  if (fontMode === "medium") return orientation === "landscape" ? 23 : 20;
  if (fontMode === "small") return orientation === "landscape" ? 18 : 16;
  return Math.max(18, Math.min(orientation === "landscape" ? 34 : 30, Math.floor((orientation === "landscape" ? 42 : 37) - items.length * 0.55)));
}

function buildExportHtml(items, includeCredits, includeRealKey, orientation, fontMode, spacingMode, columnMode, fitPage) {
  const metrics = exportLayoutMetrics(items, orientation, fontMode, spacingMode, columnMode, fitPage);
  const columns = metrics.columns;
  const fontSize = metrics.fontSize;
  const exportDate = formatExportDate(state.show.date);
  const chartColumns = includeRealKey
    ? "42px minmax(0, 1fr) 50px 42px 48px"
    : "42px minmax(0, 1fr) 50px 42px";
  const rows = items
    .map((item) => item.type === "note" ? `
      <tr class="note">
        <td class="number note-symbol">✎</td>
        <td class="title" colspan="${includeRealKey ? 4 : 3}">${escapeHtml(shortenTitle(item.title))}</td>
      </tr>
    ` : `
      <tr>
        <td class="number">${item.number}</td>
        <td class="title">
          <div class="title-main">
            <span class="song-title-export">${escapeHtml(shortenTitle(item.title, columns, orientation))}</span>
            ${item.note ? `<span class="line-note-export ${exportNoteClass(item.note)}">${escapeHtml(item.note)}</span>` : ""}
          </div>
          ${includeCredits && item.credits ? `<div class="credits">${escapeHtml(item.credits)}</div>` : ""}
        </td>
        <td class="capo">${escapeHtml(formatExportCapo(item.capo))}</td>
        <td class="key">${escapeHtml(item.key)}</td>
        ${includeRealKey ? `<td class="real-key">${escapeHtml(formatRealKey(item.key, item.capo))}</td>` : ""}
      </tr>
    `)
    .join("");

  return `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${escapeHtml(state.show.name || "Lineup")}</title>
        <style>
          @page { size: ${orientation}; margin: 0.34in; }
          * { box-sizing: border-box; }
          body { margin: 0; color: #111; background: #fff; font-family: Arial, Helvetica, sans-serif; }
          .sheet { width: 100%; height: 100vh; display: flex; flex-direction: column; gap: 8px; }
          header { display: flex; align-items: flex-end; justify-content: space-between; border-bottom: 2px solid #111; padding-bottom: 7px; }
          h1 { margin: 0; font-size: ${orientation === "landscape" ? 34 : 30}px; line-height: 1; }
          .date { font-size: 20px; font-weight: 700; }
          .chart-labels { display: grid; grid-template-columns: ${chartColumns}; margin-top: 4px; border-bottom: 2px solid #111; color: #444; text-transform: uppercase; font-size: 12px; font-weight: 900; letter-spacing: 0.03em; }
          .chart-labels span { padding: 2px 7px 5px; text-align: center; }
          .chart-labels span:nth-child(2) { text-align: left; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; column-count: ${columns}; }
          tbody { display: block; column-count: ${columns}; column-gap: 22px; }
          tr { display: grid; grid-template-columns: ${chartColumns}; break-inside: avoid; align-items: center; border-bottom: 1.5px solid #222; min-height: ${metrics.rowHeight}px; }
          tr.note { grid-template-columns: 42px minmax(0, 1fr); background: #f3f0e8; }
          td { padding: 1px 7px; font-size: ${fontSize}px; line-height: 1.02; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          tr.note td { font-style: italic; font-size: ${Math.max(16, fontSize - 4)}px; }
          td.title { display: flex; flex-direction: column; justify-content: center; overflow: visible; }
          .title-main { display: flex; align-items: baseline; gap: 10px; min-width: 0; line-height: 1.04; }
          .song-title-export { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .title-main, .credits, .line-note-export { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .credits { display: block; margin-top: ${metrics.creditGap}px; color: #555; font-size: ${Math.max(9, Math.floor(fontSize * 0.42))}px; line-height: 0.95; font-weight: 700; }
          .line-note-export { display: inline-block; flex: 0 1 auto; color: #6a4a00; font-weight: 700; font-style: italic; }
          .note-size-short { font-size: ${Math.max(12, Math.floor(fontSize * 0.55))}px; }
          .note-size-medium { font-size: ${Math.max(11, Math.floor(fontSize * 0.48))}px; }
          .note-size-long { font-size: ${Math.max(10, Math.floor(fontSize * 0.42))}px; }
          .note-size-xlong { font-size: ${Math.max(9, Math.floor(fontSize * 0.35))}px; }
          .number, .capo, .key, .real-key { text-align: center; }
          .number { padding-left: 2px; padding-right: 8px; font-size: 0.82em; overflow: visible; text-align: right; text-overflow: clip; }
          .capo, .key { color: #333; }
          .real-key { color: #444; font-size: ${Math.max(11, Math.floor(fontSize * 0.58))}px; }
          @media print { .sheet { height: auto; } }
        </style>
      </head>
      <body>
        <section class="sheet">
          <header>
            <h1>${escapeHtml(state.show.name || "Lineup")}</h1>
            <div class="date">${escapeHtml(exportDate)}</div>
          </header>
          <div class="chart-labels"><span></span><span>Song</span><span>Capo</span><span>Key</span>${includeRealKey ? "<span>Real</span>" : ""}</div>
          <table><tbody>${rows}</tbody></table>
        </section>
      </body>
    </html>`;
}

function formatExportCapo(value) {
  return (value || "").replace("Capo ", "");
}

function exportNoteClass(value) {
  const length = (value || "").length;
  if (length > 48) return "note-size-xlong";
  if (length > 30) return "note-size-long";
  if (length > 16) return "note-size-medium";
  return "note-size-short";
}

function formatExportDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (!match) return value || "";
  return `${match[3]}/${match[2]}/${match[1]}`;
}

function shortenTitle(title, columns = 1, orientation = "portrait") {
  const cleaned = removeLowValueTitleWords(title)
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\b(feat\.?|featuring|acoustic|live|version|radio edit|remastered|official)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const maxLength = columns > 1
    ? (orientation === "landscape" ? 28 : 24)
    : (orientation === "landscape" ? 44 : 38);
  if (cleaned.length <= maxLength) return cleaned;
  const clipped = cleaned.slice(0, Math.max(8, maxLength - 1)).trimEnd();
  return `${clipped || cleaned.slice(0, maxLength - 1)}…`;
}

function removeLowValueTitleWords(title) {
  const value = String(title || "").trim();
  const withoutParentheses = value.replace(/\s*\([^)]*\)/g, "");
  const lighter = withoutParentheses
    .replace(/\b(the|a|an)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return lighter || withoutParentheses || value;
}

function safeFileName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "lineup";
}

function makeId(prefix) {
  if (window.crypto?.randomUUID) return `${prefix}-${window.crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function moveLineupItem(id, direction) {
  const index = state.lineup.findIndex((item) => item.id === id);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= state.lineup.length) return;
  const [item] = state.lineup.splice(index, 1);
  state.lineup.splice(nextIndex, 0, item);
  saveState();
  renderLineup();
}

function moveLineupItemTo(id, targetIndex) {
  const fromIndex = state.lineup.findIndex((item) => item.id === id);
  if (fromIndex < 0) return;
  const [item] = state.lineup.splice(fromIndex, 1);
  const adjustedIndex = fromIndex < targetIndex ? targetIndex - 1 : targetIndex;
  state.lineup.splice(Math.max(0, Math.min(adjustedIndex, state.lineup.length)), 0, item);
  saveState();
  renderLineup();
}

function lineupDropIndexFromEvent(event) {
  const row = event.target.closest(".lineup-row");
  if (!row) return state.lineup.length;
  const rowIndex = state.lineup.findIndex((item) => item.id === row.dataset.lineupId);
  if (rowIndex < 0) return state.lineup.length;
  const rect = row.getBoundingClientRect();
  return rowIndex + (event.clientY > rect.top + rect.height / 2 ? 1 : 0);
}

function clearLineupDropPreview() {
  els.lineupRows.classList.remove("drop-ready", "drop-at-end");
  els.lineupRows.querySelectorAll(".drop-before, .drop-after").forEach((row) => {
    row.classList.remove("drop-before", "drop-after");
  });
}

function updateLineupDropPreview(event) {
  clearLineupDropPreview();
  els.lineupRows.classList.add("drop-ready");
  const row = event.target.closest(".lineup-row");
  if (!row || !els.lineupRows.contains(row)) {
    els.lineupRows.classList.add("drop-at-end");
    return;
  }
  if (draggedLineupId && row.dataset.lineupId === draggedLineupId) return;
  const rect = row.getBoundingClientRect();
  row.classList.add(event.clientY > rect.top + rect.height / 2 ? "drop-after" : "drop-before");
}

function lineupDropIndexFromPoint(x, y) {
  if (!els.lineupRows) return state.lineup.length;
  const target = document.elementFromPoint(x, y);
  if (!target || !els.lineupRows.contains(target)) return state.lineup.length;
  const row = target.closest?.(".lineup-row");
  if (!row || !els.lineupRows.contains(row)) return state.lineup.length;
  const rowIndex = state.lineup.findIndex((item) => item.id === row.dataset.lineupId);
  if (rowIndex < 0) return state.lineup.length;
  const rect = row.getBoundingClientRect();
  return rowIndex + (y > rect.top + rect.height / 2 ? 1 : 0);
}

function updateLineupDropPreviewFromPoint(x, y) {
  clearLineupDropPreview();
  if (!els.lineupRows) return;
  const target = document.elementFromPoint(x, y);
  if (!target || !els.lineupRows.contains(target)) return;
  els.lineupRows.classList.add("drop-ready");
  const row = target.closest?.(".lineup-row");
  if (!row || !els.lineupRows.contains(row)) {
    els.lineupRows.classList.add("drop-at-end");
    return;
  }
  if (draggedLineupId && row.dataset.lineupId === draggedLineupId) return;
  const rect = row.getBoundingClientRect();
  row.classList.add(y > rect.top + rect.height / 2 ? "drop-after" : "drop-before");
}

function setLineupCapo(lineupId, value) {
  const item = state.lineup.find((candidate) => candidate.id === lineupId);
  if (!item) return;
  item.capo = value;
  saveState();
  renderLineup();
}

function setLineupKey(lineupId, value) {
  const item = state.lineup.find((candidate) => candidate.id === lineupId);
  if (!item) return;
  item.key = value;
  saveState();
  renderLineup();
}

function setLineupNote(lineupId, value) {
  const item = state.lineup.find((candidate) => candidate.id === lineupId);
  if (!item) return;
  item.note = value.trim();
  saveState();
}

function toggleSongBanger(songId) {
  const song = state.songs.find((candidate) => candidate.id === songId);
  if (!song) return;
  song.banger = !song.banger;
  saveState();
  renderLineup();
  renderSongBank();
}

function encodeShareData(data) {
  const json = encodeURIComponent(JSON.stringify(data));
  return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeShareData(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return decodeURIComponent(atob(base64));
}

async function shareLineup() {
  const shareUrl = buildShareUrl();
  els.shareLink.value = shareUrl;
  openDialog(els.shareDialog);
  els.shareLink.focus();
  els.shareLink.select();
  await copyShareLink();
}

function buildShareUrl() {
  return `${window.location.href.split("#")[0]}#lineup=${encodeShareData(buildLineupPayload())}`;
}

function buildLineupPayload() {
  commitShowMetaFromFields();
  syncActiveShowFromFields();
  return {
    fileType: "show-lineup-builder",
    version: appVersion,
    exportedAt: new Date().toISOString(),
    show: state.show,
    songs: state.songs,
    lineup: state.lineup,
  };
}

function buildBackupPayload() {
  commitShowMetaFromFields();
  syncActiveShowFromFields();
  return {
    fileType: "show-lineup-builder-backup",
    version: appVersion,
    exportedAt: new Date().toISOString(),
    activeShowId: state.activeShowId,
    show: state.show,
    songs: state.songs,
    lineup: state.lineup,
    shows: state.shows,
  };
}

function downloadLineupFile() {
  const result = buildLineupDownload();
  if (result) downloadBlob(result.blob, result.fileName, result.message);
}

function buildLineupDownload() {
  const blob = new Blob([JSON.stringify(buildLineupPayload(), null, 2)], { type: "application/json" });
  return {
    blob,
    fileName: `${safeFileName(state.show.name || "lineup")}.lineup`,
    message: "Lineup file is ready.",
  };
}

function downloadBackupFile() {
  const blob = new Blob([JSON.stringify(buildBackupPayload(), null, 2)], { type: "application/json" });
  downloadBlob(blob, `${safeFileName(state.show.name || "lineup")}-backup.lineupbackup`, "Full backup is ready.");
}

function openLineupFile() {
  els.lineupFileInput.click();
}

function openBackupFile() {
  els.backupFileInput.click();
}

function importLineupFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const imported = normalizeState(JSON.parse(String(reader.result || "{}")));
      state = imported;
      saveState();
      closeDialog(els.shareDialog);
      render();
      toast("Lineup file opened and saved here.");
    } catch {
      toast("That lineup file could not be opened.");
    }
  });
  reader.readAsText(file);
}

function importBackupFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      state = normalizeState(JSON.parse(String(reader.result || "{}")));
      saveState();
      if (els.shareDialog.open) closeDialog(els.shareDialog);
      if (els.settingsDialog.open) closeDialog(els.settingsDialog);
      render();
      toast("Backup restored.");
    } catch {
      toast("That backup file could not be opened.");
    }
  });
  reader.readAsText(file);
}

async function copyShareLink() {
  try {
    await navigator.clipboard.writeText(els.shareLink.value);
    toast("Share link copied. Open it in this app on another computer.");
  } catch {
    toast("Share link ready to copy.");
  }
}

function handleLineupAction(action, lineupId, songId) {
  const item = state.lineup.find((candidate) => candidate.id === lineupId);

  if (action === "slides" && item) {
    openSlidesForLineup(lineupId);
    return;
  }

  if (action === "ready" && item) {
    item.ready = !item.ready;
    saveState();
    renderLineup();
  }

  if (action === "info") {
    const song = state.songs.find((candidate) => candidate.id === songId);
    openSongDialog(song);
  }

  if (action === "edit-note" && item) openNoteDialog(item);

  if (action === "remove") {
    removeLineupItem(lineupId);
  }
}

function removeLineupItem(lineupId) {
  state.lineup = state.lineup.filter((candidate) => candidate.id !== lineupId);
  openRowId = null;
  saveState();
  renderLineup();
  toast("Item removed from lineup.");
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]);
}

let toastTimer;
function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2200);
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setBankWidth(width) {
  const shellRect = els.appShell.getBoundingClientRect();
  const maxWidth = Math.max(280, shellRect.width - 96 - 10 - 460);
  const nextWidth = clampNumber(Math.round(width), 260, Math.min(560, maxWidth));
  els.appShell.style.setProperty("--bank-width", `${nextWidth}px`);
  localStorage.setItem(bankWidthStorageKey, String(nextWidth));
}

function restoreBankWidth() {
  const savedWidth = Number(localStorage.getItem(bankWidthStorageKey));
  if (Number.isFinite(savedWidth) && savedWidth > 0) setBankWidth(savedWidth);
}

function bindPanelResize() {
  if (!els.panelResizer) return;
  let bankLeft = 0;
  let frame = null;

  const stopResize = () => {
    els.appShell.classList.remove("resizing-panels");
    document.body.classList.remove("resizing-panels");
    window.removeEventListener("pointermove", resizePanel);
    window.removeEventListener("pointerup", stopResize);
    window.removeEventListener("pointercancel", stopResize);
  };

  const resizePanel = (event) => {
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      setBankWidth(event.clientX - bankLeft);
    });
  };

  els.panelResizer.addEventListener("pointerdown", (event) => {
    if (els.appShell.classList.contains("bank-collapsed")) return;
    event.preventDefault();
    bankLeft = document.querySelector(".bank-panel").getBoundingClientRect().left;
    els.appShell.classList.add("resizing-panels");
    document.body.classList.add("resizing-panels");
    els.panelResizer.setPointerCapture?.(event.pointerId);
    window.addEventListener("pointermove", resizePanel);
    window.addEventListener("pointerup", stopResize);
    window.addEventListener("pointercancel", stopResize);
  });

  window.addEventListener("resize", () => {
    const currentWidth = Number(localStorage.getItem(bankWidthStorageKey));
    if (Number.isFinite(currentWidth) && currentWidth > 0) setBankWidth(currentWidth);
  });
}

function bindEvents() {
  els.categoryFilters.addEventListener("click", (event) => {
    const bangerButton = event.target.closest("[data-banger-filter]");
    if (bangerButton) {
      bangersOnly = !bangersOnly;
      render();
      return;
    }
    const button = event.target.closest("[data-category]");
    if (!button) return;
    activeCategory = button.dataset.category;
    render();
  });

  els.songSearch.addEventListener("input", (event) => {
    searchTerm = event.target.value;
    renderSongBank();
  });

  els.closeBankButton.addEventListener("click", () => {
    els.appShell.classList.add("bank-collapsed");
    sidePanelMode = "library";
    els.bankPanel?.classList.remove("shows-mode");
    if (els.sidePanelTitle) els.sidePanelTitle.textContent = "Library";
    if (els.libraryView) els.libraryView.hidden = false;
    if (els.showsView) els.showsView.hidden = true;
    if (els.newSongButton) els.newSongButton.hidden = false;
    if (els.quickAddButton) els.quickAddButton.hidden = false;
    els.showsTabButton?.classList.remove("active");
    toast("Side panel hidden.");
  });

  els.bankPanel?.addEventListener("click", (event) => {
    if (!els.appShell.classList.contains("bank-collapsed")) return;
    if (event.target.closest("button, input, select, textarea")) return;
    openMobileLibraryDrawer();
  });

  els.themeToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleTheme();
  });

  els.sortButton.addEventListener("click", () => {
    sortAsc = !sortAsc;
    renderSongBank();
    toast(sortAsc ? "Song bank sorted A to Z." : "Song bank sorted Z to A.");
  });

  els.newSongButton.addEventListener("click", () => openSongDialog());
  els.quickAddButton.addEventListener("click", () => openQuickAddDialog());
  els.songTitle.addEventListener("input", () => {
    if (hasHebrewLetters(els.songTitle.value)) els.songHebrew.checked = true;
  });
  els.songCategoryButtons.addEventListener("click", (event) => {
    const button = event.target.closest("[data-song-category]");
    if (!button) return;
    setSongCategoryChoice(button.dataset.songCategory);
  });
  els.songTags.addEventListener("input", () => renderTagSuggestions(els.songId.value));
  els.songTagSuggestions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tag-suggestion]");
    if (!button) return;
    addTagSuggestion(button.dataset.tagSuggestion);
  });
  els.toggleQuickPasteButton.addEventListener("click", () => {
    els.quickPastePanel.hidden = !els.quickPastePanel.hidden;
    if (!els.quickPastePanel.hidden) els.quickAddText.focus();
  });
  els.parseQuickAddButton.addEventListener("click", parseQuickAddText);
  els.addQuickRowButton.addEventListener("click", addQuickRow);
  els.quickAddRows.addEventListener("input", (event) => updateQuickRowFromControl(event.target));
  els.quickAddRows.addEventListener("change", (event) => updateQuickRowFromControl(event.target));
  els.quickAddRows.addEventListener("click", (event) => {
    const bangerButton = event.target.closest("[data-quick-banger]");
    if (!bangerButton) return;
    updateQuickRowFromControl(bangerButton);
    renderQuickAddRows();
  });
  els.quickAddForm.addEventListener("submit", importQuickSongs);
  els.addNoteButton.addEventListener("click", () => openNoteDialog());
  els.saveSongButton.addEventListener("click", saveSongFromDialog);
  els.showNotesForm.addEventListener("submit", saveShowNotes);
  els.teamForm.addEventListener("submit", saveTeam);
  els.settingsThemeButton.addEventListener("click", () => {
    toggleTheme();
    updateSettingsDialog();
  });
  els.skinChoiceGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-skin-choice]");
    if (!button) return;
    applySkin(button.dataset.skinChoice);
    toast(`${button.querySelector("strong")?.textContent || "Skin"} skin enabled.`);
  });
  els.settingsBackupButton.addEventListener("click", downloadBackupFile);
  els.settingsRestoreButton.addEventListener("click", openBackupFile);

  els.savedShowsList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-show-id]");
    if (!button) return;
    if (els.savedShowsDetails) els.savedShowsDetails.open = false;
    switchShow(button.dataset.showId);
  });

  els.showsTabButton.addEventListener("click", () => {
    setSidePanelMode(sidePanelMode === "shows" ? "library" : "shows");
  });

  els.newShowButton.addEventListener("click", () => {
    if (els.savedShowsDetails) els.savedShowsDetails.open = false;
    createNewShow();
    setSidePanelMode("shows");
  });
  els.duplicateShowButton.addEventListener("click", () => {
    if (els.savedShowsDetails) els.savedShowsDetails.open = false;
    duplicateCurrentShow();
    setSidePanelMode("shows");
  });
  els.deleteShowButton.addEventListener("click", () => {
    if (els.savedShowsDetails) els.savedShowsDetails.open = false;
    deleteCurrentShow();
    setSidePanelMode("shows");
  });

  els.saveLineupButton.addEventListener("click", () => {
    commitShowMetaFromFields();
    els.showName.value = state.show.name;
    saveState();
    toast("Lineup saved on this device.");
  });

  els.renameShowButton.addEventListener("click", () => {
    els.headerMenu.open = false;
    els.showName.focus();
    els.showName.select();
  });

  els.shareButton.addEventListener("click", () => {
    els.headerMenu.open = false;
    shareLineup();
  });
  els.settingsMenuButton.addEventListener("click", () => {
    els.headerMenu.open = false;
    openSettingsDialog();
  });
  els.accountMenuButton?.addEventListener("click", () => {
    els.headerMenu.open = false;
    openAccountDialog();
  });
  els.accountForm?.addEventListener("submit", signInFromAccountDialog);
  els.accountCreateButton?.addEventListener("click", createAccountFromDialog);
  els.accountSaveCloudButton?.addEventListener("click", async () => {
    updateAccountDialog("Saving...");
    try {
      await saveCurrentWorkspaceToCloud();
      updateAccountDialog("Saved this device to your account.");
    } catch (error) {
      updateAccountDialog(error instanceof Error ? error.message : "Could not save to cloud.");
    }
  });
  els.accountLoadCloudButton?.addEventListener("click", async () => {
    updateAccountDialog("Loading...");
    try {
      await loadCloudWorkspaceToDevice();
      updateAccountDialog("Cloud workspace loaded on this device.");
    } catch (error) {
      updateAccountDialog(error instanceof Error ? error.message : "Could not load cloud workspace.");
    }
  });
  els.accountSignOutButton?.addEventListener("click", () => {
    setCloudSession(null);
    updateAccountDialog("Signed out.");
  });
  els.copyShareButton.addEventListener("click", copyShareLink);
  els.downloadLineupFileButton.addEventListener("click", downloadLineupFile);
  els.openLineupFileButton.addEventListener("click", openLineupFile);
  els.downloadBackupButton.addEventListener("click", downloadBackupFile);
  els.openBackupButton.addEventListener("click", openBackupFile);
  els.lineupFileInput.addEventListener("change", (event) => {
    importLineupFile(event.target.files?.[0]);
    event.target.value = "";
  });
  els.backupFileInput.addEventListener("change", (event) => {
    importBackupFile(event.target.files?.[0]);
    event.target.value = "";
  });

  els.exportButton.addEventListener("click", (event) => {
    event.preventDefault();
    els.headerMenu.open = false;
    commitShowMetaFromFields();
    openExportPreview();
  });

  document.addEventListener("click", (event) => {
    if (!els.headerMenu?.open || els.headerMenu.contains(event.target)) return;
    els.headerMenu.open = false;
  });

  document.addEventListener("click", (event) => {
    if (!els.savedShowsDetails?.open || els.savedShowsDetails.contains(event.target)) return;
    els.savedShowsDetails.open = false;
  });

  const rail = document.querySelector(".rail");
  if (rail) {
    rail.addEventListener("click", (event) => {
      if (event.target.closest("#savedShowsDetails")) return;
      const button = event.target.closest(".rail-button");
      if (!button) return;
      setRailActive(button);
      const label = button.getAttribute("aria-label");
      if (label === "Lineups") {
        document.querySelector(".show-panel").scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  els.showName.addEventListener("change", (event) => {
    state.show.name = event.target.value.trim() || "Current Show";
    els.showName.value = state.show.name;
    saveState();
    renderSavedShows();
  });

  els.showName.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      els.showName.blur();
    }
  });

  els.showDate.addEventListener("change", (event) => {
    state.show.date = event.target.value;
    saveState();
    renderSavedShows();
  });

  els.songBankList.addEventListener("click", (event) => {
    const actionEl = event.target.closest("[data-action]");
    if (!actionEl) return;
    const songId = actionEl.dataset.songId;
    if (actionEl.dataset.action === "add-bank") {
      addSongToLineup(songId, true);
      return;
    }
    if (actionEl.dataset.action === "toggle-banger") {
      toggleSongBanger(songId);
      return;
    }
    if (actionEl.dataset.action === "slides") {
      openSlidesForBankSong(songId);
      return;
    }
    if (actionEl.dataset.action === "edit-bank") {
      const song = state.songs.find((candidate) => candidate.id === songId);
      openSongDialog(song);
    }
  });

  els.songBankList.addEventListener("dblclick", (event) => {
    if (event.target.closest("[data-action='toggle-banger'], [data-action='edit-bank'], [data-action='slides']")) return;
    const row = event.target.closest(".bank-song");
    if (!row) return;
    addSongToLineup(row.dataset.songId, true);
  });

  els.lineupRows.addEventListener("dblclick", (event) => {
    if (event.target.closest("button, input, select, textarea")) return;
    const row = event.target.closest(".lineup-row.song-row");
    if (!row) return;
    removeLineupItem(row.dataset.lineupId);
  });

  els.songBankList.addEventListener("dragstart", (event) => {
    const row = event.target.closest(".bank-song");
    if (!row) return;
    draggedBankSongId = row.dataset.songId;
    row.classList.add("dragging");
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("text/song-id", draggedBankSongId);
    event.dataTransfer.setData("text/plain", draggedBankSongId);
  });

  els.songBankList.addEventListener("dragend", () => {
    draggedBankSongId = null;
    document.querySelectorAll(".bank-song.dragging").forEach((row) => row.classList.remove("dragging"));
    clearLineupDropPreview();
  });

  els.lineupRows.addEventListener("dragstart", (event) => {
    const row = event.target.closest(".lineup-row");
    if (!row) return;
    if (event.target.closest("button, input, select, textarea")) {
      event.preventDefault();
      return;
    }
    draggedLineupId = row.dataset.lineupId;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/lineup-id", draggedLineupId);
    row.classList.add("dragging");
  });

  els.lineupRows.addEventListener("dragover", (event) => {
    const isBankSong = Array.from(event.dataTransfer.types || []).includes("text/song-id") || Boolean(draggedBankSongId);
    if (isBankSong) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
      updateLineupDropPreview(event);
      return;
    }

    if (!draggedLineupId) return;
    event.preventDefault();
    const row = event.target.closest(".lineup-row");
    if (!row) {
      event.dataTransfer.dropEffect = "move";
      updateLineupDropPreview(event);
      return;
    }
    if (row.dataset.lineupId !== draggedLineupId) {
      event.dataTransfer.dropEffect = "move";
      updateLineupDropPreview(event);
    }
  });

  els.lineupRows.addEventListener("dragleave", (event) => {
    if (!els.lineupRows.contains(event.relatedTarget)) {
      clearLineupDropPreview();
    }
  });

  els.lineupRows.addEventListener("drop", (event) => {
    const songId = event.dataTransfer.getData("text/song-id") || draggedBankSongId;
    const insertAt = lineupDropIndexFromEvent(event);
    if (songId) {
      event.preventDefault();
      addSongToLineup(songId, true, insertAt < 0 ? state.lineup.length : insertAt);
      draggedBankSongId = null;
      clearLineupDropPreview();
      return;
    }
    if (!draggedLineupId) return;
    event.preventDefault();
    moveLineupItemTo(draggedLineupId, insertAt < 0 ? state.lineup.length : insertAt);
    draggedLineupId = null;
    clearLineupDropPreview();
  });

  els.lineupRows.addEventListener("dragend", () => {
    draggedLineupId = null;
    clearLineupDropPreview();
    renderLineup();
  });

  els.songForm.addEventListener("submit", upsertSong);
  els.deleteSongButton.addEventListener("click", deleteSong);
  els.noteForm.addEventListener("submit", saveNote);
  els.deleteNoteButton.addEventListener("click", deleteNote);
  els.exportPdfButton.addEventListener("click", (event) => prepareExportAnchor(event, "pdf"));
  els.exportPrintButton.addEventListener("click", () => exportLineup("print"));
  els.exportDocButton.addEventListener("click", (event) => prepareExportAnchor(event, "doc"));
  els.exportLineupFileButton.addEventListener("click", (event) => prepareExportAnchor(event, "lineup"));
  els.exportCreditsToggle.addEventListener("change", () => renderExportPreview());
  els.exportRealKeyToggle.addEventListener("change", () => renderExportPreview());
  els.exportOrientationInputs.forEach((input) => {
    input.addEventListener("change", () => renderExportPreview());
  });
  els.exportFontSizeInputs.forEach((input) => {
    input.addEventListener("change", () => renderExportPreview());
  });
  els.exportSpacingInputs.forEach((input) => {
    input.addEventListener("change", () => renderExportPreview());
  });
  els.exportColumnInputs.forEach((input) => {
    input.addEventListener("change", () => renderExportPreview());
  });
  els.exportFitToggle.addEventListener("change", () => renderExportPreview());
  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => {
      const dialog = button.closest("dialog");
      closeDialog(dialog);
    });
  });
}

function bindCoreFallbackEvents() {
  const bind = (element, eventName, handler) => {
    if (!element || element.dataset.fallbackBound) return;
    element.dataset.fallbackBound = "true";
    element.addEventListener(eventName, handler);
  };

  bind(els.newSongButton, "click", () => openSongDialog());
  bind(els.quickAddButton, "click", openQuickAddDialog);
  bind(els.addNoteButton, "click", () => openNoteDialog());
  bind(els.saveLineupButton, "click", () => {
    commitShowMetaFromFields();
    saveState();
    toast("Lineup saved on this device.");
  });
  bind(els.exportButton, "click", (event) => {
    event.preventDefault();
    commitShowMetaFromFields();
    openExportPreview();
  });
  bind(els.showsTabButton, "click", () => {
    setSidePanelMode(sidePanelMode === "shows" ? "library" : "shows");
  });
  bind(els.themeToggle, "click", toggleTheme);
}

function bindPointerDragFallback() {
  if (document.body.dataset.pointerDragBound) return;
  document.body.dataset.pointerDragBound = "true";
  let drag = null;
  let suppressNextClick = false;

  const stopPointerDrag = () => {
    document.body.classList.remove("is-pointer-dragging");
    document.querySelectorAll(".dragging").forEach((row) => row.classList.remove("dragging"));
    draggedBankSongId = null;
    draggedLineupId = null;
    drag = null;
    clearLineupDropPreview();
    window.setTimeout(() => {
      suppressNextClick = false;
      delete document.body.dataset.suppressDragClick;
    }, 180);
  };

  document.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    const blockedControl = event.target.closest?.("input, select, textarea, [data-close-dialog], dialog");
    if (blockedControl) return;
    const blockedButton = event.target.closest?.("[data-action='toggle-banger'], [data-action='edit-bank'], [data-action='slides'], .more-button, .icon-action, .ready-toggle");
    if (blockedButton) return;

    const bankRow = event.target.closest?.(".bank-song");
    if (bankRow) {
      drag = {
        type: "bank",
        id: bankRow.dataset.songId,
        startX: event.clientX,
        startY: event.clientY,
        row: bankRow,
        pointerId: event.pointerId,
        active: false,
      };
      bankRow.setPointerCapture?.(event.pointerId);
      return;
    }

    const lineupRow = event.target.closest?.(".lineup-row");
    if (lineupRow) {
      drag = {
        type: "lineup",
        id: lineupRow.dataset.lineupId,
        startX: event.clientX,
        startY: event.clientY,
        row: lineupRow,
        pointerId: event.pointerId,
        active: false,
      };
      lineupRow.setPointerCapture?.(event.pointerId);
    }
  }, true);

  document.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
    if (!drag.active && distance < 7) return;
    if (!drag.active) {
      drag.active = true;
      suppressNextClick = true;
      document.body.dataset.suppressDragClick = "true";
      document.body.classList.add("is-pointer-dragging");
      drag.row?.classList.add("dragging");
      if (drag.type === "bank") draggedBankSongId = drag.id;
      if (drag.type === "lineup") draggedLineupId = drag.id;
    }
    event.preventDefault();
    updateLineupDropPreviewFromPoint(event.clientX, event.clientY);
  }, { capture: true, passive: false });

  document.addEventListener("pointerup", (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const wasActive = drag.active;
    const droppedInLineup = Boolean(document.elementFromPoint(event.clientX, event.clientY)?.closest?.("#lineupRows"));
    const insertAt = lineupDropIndexFromPoint(event.clientX, event.clientY);
    if (wasActive && droppedInLineup) {
      event.preventDefault();
      if (drag.type === "bank") {
        addSongToLineup(drag.id, true, insertAt);
      } else {
        moveLineupItemTo(drag.id, insertAt);
      }
    }
    stopPointerDrag();
  }, true);

  document.addEventListener("pointercancel", stopPointerDrag, true);

  document.addEventListener("click", (event) => {
    if (!suppressNextClick) return;
    suppressNextClick = false;
    delete document.body.dataset.suppressDragClick;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
  }, true);
}

function bindEmergencyButtonDelegates() {
  if (document.body.dataset.emergencyButtonsBound) return;
  document.body.dataset.emergencyButtonsBound = "true";

  document.addEventListener(
    "click",
    (event) => {
      if (document.body.dataset.suppressDragClick) {
        delete document.body.dataset.suppressDragClick;
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();
        return;
      }

      const control = closestFromEvent(
        event,
        "button, a, [data-show-id]"
      );
      if (!control) return;

      const handled = () => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();
      };

      if (control.id === "newSongButton") {
        handled();
        populateFormOptions();
        openSongDialog();
        return;
      }

      if (control.id === "quickAddButton") {
        handled();
        openQuickAddDialog();
        return;
      }

      if (control.id === "addNoteButton") {
        handled();
        openNoteDialog();
        return;
      }

      if (control.id === "saveLineupButton") {
        handled();
        commitShowMetaFromFields();
        saveState();
        toast("Lineup saved on this device.");
        return;
      }

      if (control.id === "exportButton") {
        handled();
        commitShowMetaFromFields();
        openExportPreview();
        return;
      }

      if (control.id === "showsTabButton") {
        handled();
        setSidePanelMode(sidePanelMode === "shows" ? "library" : "shows");
        return;
      }

      if (control.id === "themeToggle") {
        handled();
        toggleTheme();
        return;
      }

      if (control.id === "sortButton") {
        handled();
        sortAsc = !sortAsc;
        renderSongBank();
        toast(sortAsc ? "Song bank sorted A to Z." : "Song bank sorted Z to A.");
        return;
      }

      if (control.id === "closeBankButton") {
        handled();
        els.appShell.classList.add("bank-collapsed");
        sidePanelMode = "library";
        toast("Side panel hidden.");
        return;
      }

      if (control.id === "renameShowButton") {
        handled();
        els.headerMenu.open = false;
        els.showName.focus();
        els.showName.select();
        return;
      }

      if (control.id === "shareButton") {
        handled();
        els.headerMenu.open = false;
        shareLineup();
        return;
      }

      if (control.id === "settingsMenuButton") {
        handled();
        els.headerMenu.open = false;
        openSettingsDialog();
        return;
      }

      if (control.id === "saveSongButton") {
        handled();
        saveSongFromDialog(event);
        return;
      }

      if (control.id === "deleteSongButton") {
        handled();
        deleteSong();
        return;
      }

      if (control.id === "saveNoteButton") {
        handled();
        saveNoteFromDialog(event);
        return;
      }

      if (control.id === "deleteNoteButton") {
        handled();
        deleteNote();
        return;
      }

      if (control.matches("[data-close-dialog]")) {
        handled();
        const dialog = control.closest("dialog");
        closeDialog(dialog);
        return;
      }

      if (control.matches("[data-song-category]")) {
        handled();
        setSongCategoryChoice(control.dataset.songCategory);
        return;
      }

      if (control.matches("[data-tag-suggestion]")) {
        handled();
        addTagSuggestion(control.dataset.tagSuggestion);
        return;
      }

      if (control.matches("[data-category]")) {
        handled();
        activeCategory = control.dataset.category;
        render();
        return;
      }

      if (control.matches("[data-banger-filter]")) {
        handled();
        bangersOnly = !bangersOnly;
        render();
        return;
      }

      if (control.matches("[data-show-id]")) {
        handled();
        switchShow(control.dataset.showId);
        return;
      }

      if (control.id === "newShowButton") {
        handled();
        createNewShow();
        setSidePanelMode("shows");
        return;
      }

      if (control.id === "duplicateShowButton") {
        handled();
        duplicateCurrentShow();
        setSidePanelMode("shows");
        return;
      }

      if (control.id === "deleteShowButton") {
        handled();
        deleteCurrentShow();
        setSidePanelMode("shows");
        return;
      }

      if (control.id === "toggleQuickPasteButton") {
        handled();
        els.quickPastePanel.hidden = !els.quickPastePanel.hidden;
        if (!els.quickPastePanel.hidden) els.quickAddText.focus();
        return;
      }

      if (control.id === "parseQuickAddButton") {
        handled();
        parseQuickAddText();
        return;
      }

      if (control.id === "addQuickRowButton") {
        handled();
        addQuickRow();
        return;
      }

      if (control.matches("[data-quick-banger]")) {
        handled();
        updateQuickRowFromControl(control);
        renderQuickAddRows();
        return;
      }

      if (control.matches("[data-action]")) {
        handled();
        const action = control.dataset.action;
        const songId = control.dataset.songId;
        const lineupId = control.dataset.lineupId;

        if (action === "add-bank") {
          addSongToLineup(songId, true);
          return;
        }

        if (action === "toggle-banger") {
          toggleSongBanger(songId);
          return;
        }

        if (action === "edit-bank") {
          openSongDialog(state.songs.find((song) => song.id === songId));
          return;
        }

        if (action === "slides" && !lineupId) {
          openSlidesForBankSong(songId);
          return;
        }

        if (["ready", "info", "remove", "edit-note", "slides"].includes(action)) {
          handleLineupAction(action, lineupId, songId || "");
          return;
        }
      }

      if (control.id === "settingsThemeButton") {
        handled();
        toggleTheme();
        updateSettingsDialog();
        return;
      }

      if (control.matches("[data-skin-choice]")) {
        handled();
        applySkin(control.dataset.skinChoice);
        toast(`${control.querySelector("strong")?.textContent || "Skin"} skin enabled.`);
        return;
      }

      if (control.id === "settingsBackupButton" || control.id === "downloadBackupButton") {
        handled();
        downloadBackupFile();
        return;
      }

      if (control.id === "settingsRestoreButton" || control.id === "openBackupButton") {
        handled();
        openBackupFile();
        return;
      }

      if (control.id === "downloadLineupFileButton") {
        handled();
        downloadLineupFile();
        return;
      }

      if (control.id === "openLineupFileButton") {
        handled();
        openLineupFile();
        return;
      }

      if (control.id === "copyShareButton") {
        handled();
        copyShareLink();
        return;
      }

      if (control.id === "exportPdfButton") {
        prepareExportAnchor({ currentTarget: control, preventDefault: () => event.preventDefault() }, "pdf");
        return;
      }

      if (control.id === "exportDocButton") {
        prepareExportAnchor({ currentTarget: control, preventDefault: () => event.preventDefault() }, "doc");
        return;
      }

      if (control.id === "exportLineupFileButton") {
        prepareExportAnchor({ currentTarget: control, preventDefault: () => event.preventDefault() }, "lineup");
        return;
      }

      if (control.id === "exportPrintButton") {
        handled();
        exportLineup("print");
      }
    },
    true
  );

  document.addEventListener(
    "change",
    (event) => {
      if (!els.exportDialog?.open || !els.exportDialog.contains(event.target)) return;
      if (!event.target.matches("input[name='exportOrientation'], input[name='exportFontSize'], input[name='exportSpacing'], input[name='exportColumns'], #exportCreditsToggle, #exportRealKeyToggle, #exportFitToggle")) return;
      renderExportPreview();
    },
    true
  );

  document.addEventListener(
    "submit",
    (event) => {
      if (![els.songForm, els.quickAddForm, els.noteForm, els.showNotesForm, els.teamForm].includes(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();

      if (event.target === els.songForm) {
        saveSongFromDialog(event);
        return;
      }

      if (event.target === els.quickAddForm) {
        importQuickSongsFromDialog(event);
        return;
      }

      if (event.target === els.noteForm) {
        saveNoteFromDialog(event);
        return;
      }

      if (event.target === els.showNotesForm) {
        saveShowNotes(event);
        return;
      }

      if (event.target === els.teamForm) {
        saveTeam(event);
      }
    },
    true
  );
}

window.handleLineupAction = handleLineupAction;
window.setLineupCapo = setLineupCapo;
window.setLineupKey = setLineupKey;
window.setLineupNote = setLineupNote;
window.saveSongFromDialog = saveSongFromDialog;
window.closeDialog = closeDialog;

function startApp() {
  bindEmergencyButtonDelegates();
  bindCoreFallbackEvents();
  bindPointerDragFallback();

  try {
    populateFormOptions();
    restoreBankWidth();
    try {
      bindEvents();
    } catch (error) {
      console.error("Some controls could not be wired.", error);
      bindCoreFallbackEvents();
    }
    bindPanelResize();
    render();
    applyTheme(localStorage.getItem(themeStorageKey) || "dark");
    applySkin(localStorage.getItem(skinStorageKey) || "simple");

    if (importedSharedLineup) {
      toast("Shared lineup opened and saved here.");
      history.replaceState(null, "", window.location.href.split("#")[0]);
    }
  } catch (error) {
    console.error("Could not start the lineup app.", error);
    bindCoreFallbackEvents();
    document.body.classList.add("app-start-error");
    toast("Something blocked the app from starting. Refresh once, and if it stays stuck tell me.");
  }
}

startApp();
