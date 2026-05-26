const categories = [
  { name: "Services", color: "#5b92ff" },
  { name: "Song Session", color: "#7c8cff" },
];

const majorKeys = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const minorKeys = majorKeys.map((key) => `${key}m`);
const keys = [...majorKeys, ...minorKeys];
const capoOptions = ["", "Capo 1", "Capo 2", "Capo 3", "Capo 4", "Capo 5", "Capo 6", "Capo 7"];
const storageKey = "show-lineup-builder-state";
const cloudAuthStorageKey = "songleading-auth-session:v1";
const cloudSyncMetaStorageKey = "songleading-cloud-sync-meta:v1";
const guestSessionStorageKey = "songleading-guest-session:v1";
const studioStorageKey = "lyric-slide-studio:v1";
const themeStorageKey = "show-lineup-builder-theme";
const skinStorageKey = "show-lineup-builder-skin";
const accentStorageKey = "show-lineup-builder-accent";
const bankWidthStorageKey = "show-lineup-builder-bank-width";
const slidesThemePresetsStorageKey = "lineup-slides-theme-presets:v1";
const onboardingHiddenStorageKey = "lineup-onboarding-tips-hidden:v1";
const songleadingHomeUrl = "https://www.songleading.net/";
const requireAccountForApp = true;
const appVersion = 9;
const defaultShowName = "New Setlist";
const importLimits = {
  shareChars: 600000,
  lineupBytes: 2 * 1024 * 1024,
  backupBytes: 8 * 1024 * 1024,
  songs: 1200,
  shows: 300,
  lineupItems: 400,
  folders: 100,
  tags: 12,
  slides: 180,
  slideLines: 1200,
  slideLineBreaks: 300,
  sheetAttachments: 36,
  sheetPages: 200,
  sheetStrokes: 900,
  sheetPoints: 1800,
};
const safeIdPattern = /^[A-Za-z0-9:_-]{1,96}$/;
const slideStatusValues = new Set(["no-slides", "needs-review", "slides-ready"]);
const defaultSlideDesign = { theme: "default", fontSize: 56 };
const minimumSlideEditorFontSize = 14;
const maxSlideEditorFontSize = 320;
const slideEditorFitSafetyPadding = 4;
const defaultSlideExportTheme = { name: "default", image: "", presetName: "", crop: { x: 50, y: 50, zoom: 100 } };
const slideTextWeight = 700;
const pptxMimeType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
const sheetDbName = "lineup-sheet-files:v1";
const sheetDbStore = "files";
const sheetFileMaxBytes = 25 * 1024 * 1024;
const sheetMimePattern = /^(application\/pdf|image\/(?:png|jpe?g|webp|gif|bmp|heic|heif|tiff?))$/i;
const slideThemeOptions = [
  { id: "default", label: "Dark" },
  { id: "warm", label: "Warm" },
  { id: "bright", label: "Bright" },
];
const accentChoices = ["blue", "green", "yellow", "teal", "rose", "purple"];

function sanitizeSlideExportCrop(crop = {}) {
  const x = Number.isFinite(Number(crop.x)) ? clampNumber(Number(crop.x), 0, 100) : 50;
  const y = Number.isFinite(Number(crop.y)) ? clampNumber(Number(crop.y), 0, 100) : 50;
  const zoom = Number.isFinite(Number(crop.zoom)) ? clampNumber(Number(crop.zoom), 100, 180) : 100;
  return {
    x,
    y,
    zoom,
  };
}

function normalizeSlideExportTheme(theme = {}) {
  const name = ["default", "shabbat", "campfire", "bright"].includes(theme?.name) ? theme.name : defaultSlideExportTheme.name;
  return {
    name,
    image: safeImageValue(theme?.image),
    presetName: safeText(theme?.presetName, 80),
    crop: sanitizeSlideExportCrop(theme?.crop),
  };
}

function cssUrl(value = "") {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "");
}

function fullCapoLabel(value) {
  return value || "-";
}

function compactCapoLabel(value) {
  const match = /(\d+)/.exec(value || "");
  return match ? `Cp${match[1]}` : "-";
}

function renderCapoOptions(selectedValue = "", compactSelected = false) {
  return capoOptions.map((option) => {
    const label = compactSelected && option === selectedValue ? compactCapoLabel(option) : fullCapoLabel(option);
    return `<option value="${option}" ${option === selectedValue ? "selected" : ""}>${label}</option>`;
  }).join("");
}

function setCapoSelectLabels(select, compactSelected = false) {
  if (!select) return;
  Array.from(select.options || []).forEach((option) => {
    option.textContent = compactSelected && option.selected ? compactCapoLabel(option.value) : fullCapoLabel(option.value);
  });
}

function refreshCapoSelectLabels() {
  document.querySelectorAll(".capo-select").forEach((select) => {
    setCapoSelectLabels(select, document.activeElement !== select);
  });
}

let importedSharedLineup = false;
let state = safeLoadState();
let activeCategories = new Set();
let bangersOnly = false;
let hebrewOnly = false;
let libraryFiltersOpen = false;
let searchTerm = "";
let sortAsc = true;
let openRowId = null;
let draggedLineupId = null;
let draggedBankSongId = null;
let quickAddRows = [];
let sidePanelMode = "library";
let accountMode = "sign-in";
let accountScreen = "choices";
let slidePreviewOpen = false;
let activeSlidePreviewIndex = 0;
let coachStepIndex = 0;
let authGateActive = false;
let cloudWorkspaceLoadedForSession = false;
let mobileLibraryExpanded = false;
let mobileLibraryState = "middle";
let selectedSetlistIds = new Set();
let activeSetlistFolderId = "";
let setlistFolderDialogMoveSelection = false;
let setlistLongPressTimer = null;
let setlistLongPressTargetId = "";
let suppressNextSetlistClickId = "";
let activeSlidesContext = null;
let activeSlidesDraft = [];
let activeSlidesIndex = 0;
let activeSlidesDesign = { ...defaultSlideDesign };
let activeSlidesSetupMode = false;
let slidesExportPendingImage = "";
let slidesExportPreviewIndex = 0;
let presentationSlides = [];
let presentationIndex = 0;
let presentationTheme = { ...defaultSlideExportTheme };
let presentationOptions = {};
let activeSheetsLineupId = "";
let activeSheetsSongId = "";
let activeSheetsMode = "lineup";
let activeSheetId = "";
let activeSheetPageIndex = 0;
let sheetFileMode = "add";
let sheetReplaceId = "";
let sheetTool = "pen";
let sheetDrawing = null;
let sheetPreviewUrl = "";
let sheetPreviewRenderQueued = false;
let sheetDbPromise = null;
let lineupUndoStack = [];
let lineupRedoStack = [];
let activeSlidesUndoStack = [];
let activeSlidesRedoStack = [];
let pendingLineupDeleteId = "";
let pendingLineupDeleteArmedAt = 0;
let pendingLineupDeleteTimer = null;
let pendingLineupRemoveUndo = null;
let pendingLineupRemoveUndoTimer = null;
let restoringLineupHistory = false;
let restoringSlidesHistory = false;
let songDialogMode = "library";
let pendingSlideOnlyImageLineupId = "";
let cloudWorkspaceUpdatedAt = "";
let cloudSyncTimer = null;
let cloudSyncListenersBound = false;
let cloudSaveInFlight = false;
let cloudPullInFlight = false;
let localChangeRevision = 0;
let lastCloudSavedRevision = 0;

const els = {
  lineupIntro: document.querySelector("#lineupIntro"),
  appShell: document.querySelector(".app-shell"),
  showPanel: document.querySelector(".show-panel"),
  bankPanel: document.querySelector(".bank-panel"),
  bankHeader: document.querySelector(".bank-header"),
  panelResizer: document.querySelector("#panelResizer"),
  showName: document.querySelector("#showName"),
  showDate: document.querySelector("#showDate"),
  savedShowsDetails: document.querySelector("#savedShowsDetails"),
  savedShowsList: document.querySelector("#savedShowsList"),
  savedShowsCurrent: document.querySelector("#savedShowsCurrent"),
  showsTabButton: document.querySelector("#showsTabButton"),
  openLineupFileMenuButton: document.querySelector("#openLineupFileMenuButton"),
  sidePanelTitle: document.querySelector("#sidePanelTitle"),
  libraryView: document.querySelector("#libraryView"),
  showsView: document.querySelector("#showsView"),
  headerMenu: document.querySelector("#headerMenu"),
  newShowButton: document.querySelector("#newShowButton"),
  duplicateShowButton: document.querySelector("#duplicateShowButton"),
  deleteShowButton: document.querySelector("#deleteShowButton"),
  showsBackButton: document.querySelector("#showsBackButton"),
  openLineupFileSetlistsButton: document.querySelector("#openLineupFileSetlistsButton"),
  newSetlistFolderButton: document.querySelector("#newSetlistFolderButton"),
  setlistFolderFilters: document.querySelector("#setlistFolderFilters"),
  moveSetlistsFolder: document.querySelector("#moveSetlistsFolder"),
  lineupHealthBar: document.querySelector("#lineupHealthBar"),
  lineupNextSteps: document.querySelector("#lineupNextSteps"),
  lineupRows: document.querySelector("#lineupRows"),
  addNoteButton: document.querySelector("#addNoteButton"),
  toggleFiltersButton: document.querySelector("#toggleFiltersButton"),
  saveLineupButton: document.querySelector("#saveLineupButton"),
  renameShowButton: document.querySelector("#renameShowButton"),
  exportButton: document.querySelector("#exportButton"),
  exportSlidesButton: document.querySelector("#exportSlidesButton"),
  exportSlidesFromMenuButton: document.querySelector("#exportSlidesFromMenuButton"),
  slidePreviewToggle: document.querySelector("#slidePreviewToggle"),
  presentationMenuButton: document.querySelector("#presentationMenuButton"),
  slidePreviewPanel: document.querySelector("#slidePreviewPanel"),
  closeSlidePreviewButton: document.querySelector("#closeSlidePreviewButton"),
  slidePreviewStage: document.querySelector("#slidePreviewStage"),
  slidePreviewCount: document.querySelector("#slidePreviewCount"),
  prevSlidePreviewButton: document.querySelector("#prevSlidePreviewButton"),
  nextSlidePreviewButton: document.querySelector("#nextSlidePreviewButton"),
  shareButton: document.querySelector("#shareButton"),
  settingsMenuButton: document.querySelector("#settingsMenuButton"),
  accountMenuButton: document.querySelector("#accountMenuButton"),
  setlistStartDialog: document.querySelector("#setlistStartDialog"),
  homeButton: document.querySelector("#homeButton"),
  homeMenuButton: document.querySelector("#homeMenuButton"),
  startNewSetlistButton: document.querySelector("#startNewSetlistButton"),
  openExistingSetlistButton: document.querySelector("#openExistingSetlistButton"),
  coachOverlay: document.querySelector("#coachOverlay"),
  coachSpotlight: document.querySelector("#coachSpotlight"),
  coachTip: document.querySelector("#coachTip"),
  coachStep: document.querySelector("#coachStep"),
  coachTitle: document.querySelector("#coachTitle"),
  coachText: document.querySelector("#coachText"),
  dismissOnboardingButton: document.querySelector("#dismissOnboardingButton"),
  dontShowTipsButton: document.querySelector("#dontShowTipsButton"),
  categoryFilters: document.querySelector("#categoryFilters"),
  songBankList: document.querySelector("#songBankList"),
  songSearch: document.querySelector("#songSearch"),
  closeBankButton: document.querySelector("#closeBankButton"),
  themeToggle: document.querySelector("#themeToggle"),
  sortButton: document.querySelector("#sortButton"),
  quickAddButton: document.querySelector("#quickAddButton"),
  newSongButton: document.querySelector("#newSongButton"),
  oneTimeSongButton: document.querySelector("#oneTimeSongButton"),
  addSlideOnlyButton: document.querySelector("#addSlideOnlyButton"),
  slideOnlyImageInput: document.querySelector("#slideOnlyImageInput"),
  sheetFileInput: document.querySelector("#sheetFileInput"),
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
  songBanger: document.querySelector("#songBanger"),
  songCredits: document.querySelector("#songCredits"),
  songTags: document.querySelector("#songTags"),
  songTagSuggestions: document.querySelector("#songTagSuggestions"),
  songNotes: document.querySelector("#songNotes"),
  deleteSongButton: document.querySelector("#deleteSongButton"),
  addOneTimeSongButton: document.querySelector("#addOneTimeSongButton"),
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
  setlistsBackTopButton: document.querySelector("#setlistsBackTopButton"),
  setlistSelectionBar: document.querySelector("#setlistSelectionBar"),
  setlistSelectionCount: document.querySelector("#setlistSelectionCount"),
  setlistFolderDialog: document.querySelector("#setlistFolderDialog"),
  setlistFolderForm: document.querySelector("#setlistFolderForm"),
  setlistFolderDialogTitle: document.querySelector("#setlistFolderDialogTitle"),
  setlistFolderName: document.querySelector("#setlistFolderName"),
  saveSetlistFolderButton: document.querySelector("#saveSetlistFolderButton"),
  teamDialog: document.querySelector("#teamDialog"),
  teamForm: document.querySelector("#teamForm"),
  teamText: document.querySelector("#teamText"),
  sheetsDialog: document.querySelector("#sheetsDialog"),
  sheetsDialogTitle: document.querySelector("#sheetsDialogTitle"),
  addSheetButton: document.querySelector("#addSheetButton"),
  replaceSheetButton: document.querySelector("#replaceSheetButton"),
  renameSheetButton: document.querySelector("#renameSheetButton"),
  moveSheetUpButton: document.querySelector("#moveSheetUpButton"),
  moveSheetDownButton: document.querySelector("#moveSheetDownButton"),
  removeSheetButton: document.querySelector("#removeSheetButton"),
  sheetsList: document.querySelector("#sheetsList"),
  sheetsPreviewMeta: document.querySelector("#sheetsPreviewMeta"),
  prevSheetPageButton: document.querySelector("#prevSheetPageButton"),
  sheetPageLabel: document.querySelector("#sheetPageLabel"),
  nextSheetPageButton: document.querySelector("#nextSheetPageButton"),
  sheetPenButton: document.querySelector("#sheetPenButton"),
  sheetEraserButton: document.querySelector("#sheetEraserButton"),
  undoSheetMarkupButton: document.querySelector("#undoSheetMarkupButton"),
  clearSheetMarkupButton: document.querySelector("#clearSheetMarkupButton"),
  sheetsPreviewStage: document.querySelector("#sheetsPreviewStage"),
  sheetsPreviewEmpty: document.querySelector("#sheetsPreviewEmpty"),
  sheetsPreviewImage: document.querySelector("#sheetsPreviewImage"),
  sheetsPreviewPdf: document.querySelector("#sheetsPreviewPdf"),
  sheetsMarkupCanvas: document.querySelector("#sheetsMarkupCanvas"),
  settingsDialog: document.querySelector("#settingsDialog"),
  skinChoiceGrid: document.querySelector("#skinChoiceGrid"),
  accentChoiceGrid: document.querySelector("#accentChoiceGrid"),
  settingsThemeButton: document.querySelector("#settingsThemeButton"),
  settingsThemeText: document.querySelector("#settingsThemeText"),
  settingsBackupButton: document.querySelector("#settingsBackupButton"),
  settingsRestoreButton: document.querySelector("#settingsRestoreButton"),
  accountDialog: document.querySelector("#accountDialog"),
  accountForm: document.querySelector("#accountForm"),
  accountDialogTitle: document.querySelector("#accountDialogTitle"),
  accountDialogCopy: document.querySelector("#accountDialogCopy"),
  accountSignedOut: document.querySelector("#accountSignedOut"),
  accountSignedIn: document.querySelector("#accountSignedIn"),
  accountChoiceView: document.querySelector("#accountChoiceView"),
  accountCredentialView: document.querySelector("#accountCredentialView"),
  accountEmail: document.querySelector("#accountEmail"),
  accountPassword: document.querySelector("#accountPassword"),
  accountPasswordToggle: document.querySelector("#accountPasswordToggle"),
  accountNewPassword: document.querySelector("#accountNewPassword"),
  accountNewPasswordToggle: document.querySelector("#accountNewPasswordToggle"),
  accountConfirmPassword: document.querySelector("#accountConfirmPassword"),
  accountConfirmPasswordToggle: document.querySelector("#accountConfirmPasswordToggle"),
  accountChangePasswordButton: document.querySelector("#accountChangePasswordButton"),
  accountSignInModeButton: document.querySelector("#accountSignInModeButton"),
  accountSignUpModeButton: document.querySelector("#accountSignUpModeButton"),
  accountBackButton: document.querySelector("#accountBackButton"),
  accountSignupFields: document.querySelector("#accountSignupFields"),
  accountFullName: document.querySelector("#accountFullName"),
  accountPhone: document.querySelector("#accountPhone"),
  accountCountry: document.querySelector("#accountCountry"),
  accountInstrument: document.querySelector("#accountInstrument"),
  accountCommunityInstitution: document.querySelector("#accountCommunityInstitution"),
  accountUseCase: document.querySelector("#accountUseCase"),
  accountCampField: document.querySelector("#accountCampField"),
  accountCampName: document.querySelector("#accountCampName"),
  accountSynagogueField: document.querySelector("#accountSynagogueField"),
  accountSynagogueName: document.querySelector("#accountSynagogueName"),
  accountOtherUseCaseField: document.querySelector("#accountOtherUseCaseField"),
  accountOtherUseCase: document.querySelector("#accountOtherUseCase"),
  accountCreateButton: document.querySelector("#accountCreateButton"),
  accountSubmitButton: document.querySelector("#accountSubmitButton"),
  accountRecoverButton: document.querySelector("#accountRecoverButton"),
  accountGuestButton: document.querySelector("#accountGuestButton"),
  accountEmailLabel: document.querySelector("#accountEmailLabel"),
  accountProfileFullName: document.querySelector("#accountProfileFullName"),
  accountProfilePhone: document.querySelector("#accountProfilePhone"),
  accountProfileCountry: document.querySelector("#accountProfileCountry"),
  accountProfileInstrument: document.querySelector("#accountProfileInstrument"),
  accountProfileCommunityInstitution: document.querySelector("#accountProfileCommunityInstitution"),
  accountProfileUseCase: document.querySelector("#accountProfileUseCase"),
  accountProfileCampField: document.querySelector("#accountProfileCampField"),
  accountProfileCampName: document.querySelector("#accountProfileCampName"),
  accountProfileSynagogueField: document.querySelector("#accountProfileSynagogueField"),
  accountProfileSynagogueName: document.querySelector("#accountProfileSynagogueName"),
  accountProfileOtherUseCaseField: document.querySelector("#accountProfileOtherUseCaseField"),
  accountProfileOtherUseCase: document.querySelector("#accountProfileOtherUseCase"),
  accountRefreshProfileButton: document.querySelector("#accountRefreshProfileButton"),
  accountSaveProfileButton: document.querySelector("#accountSaveProfileButton"),
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
  exportTabButtons: document.querySelectorAll("[data-export-tab]"),
  exportSlidesPanel: document.querySelector("#exportSlidesPanel"),
  exportSheetsPanel: document.querySelector("#exportSheetsPanel"),
  sheetPackSelection: document.querySelector("#sheetPackSelection"),
  exportSheetPackButton: document.querySelector("#exportSheetPackButton"),
  slidesExportDialog: document.querySelector("#slidesExportDialog"),
  slidesExportForm: document.querySelector("#slidesExportForm"),
  slidesPresentButton: document.querySelector("#slidesPresentButton"),
  slidesExportImage: document.querySelector("#slidesExportImage"),
  slidesExportImageZoom: document.querySelector("#slidesExportImageZoom"),
  slidesExportImageX: document.querySelector("#slidesExportImageX"),
  slidesExportImageY: document.querySelector("#slidesExportImageY"),
  slidesExportPreview: document.querySelector("#slidesExportPreview"),
  slidesShowTitlesToggle: document.querySelector("#slidesShowTitlesToggle"),
  slidesShowCreditsToggle: document.querySelector("#slidesShowCreditsToggle"),
  slidesShowCountToggle: document.querySelector("#slidesShowCountToggle"),
  slidesExportPresetSelect: document.querySelector("#slidesExportPresetSelect"),
  saveSlidesPresetButton: document.querySelector("#saveSlidesPresetButton"),
  deleteSlidesPresetButton: document.querySelector("#deleteSlidesPresetButton"),
  clearSlidesImageButton: document.querySelector("#clearSlidesImageButton"),
  presentationDialog: document.querySelector("#presentationDialog"),
  presentationStage: document.querySelector("#presentationStage"),
  presentationSlideImage: document.querySelector("#presentationSlideImage"),
  presentationCount: document.querySelector("#presentationCount"),
  presentationPrevButton: document.querySelector("#presentationPrevButton"),
  presentationNextButton: document.querySelector("#presentationNextButton"),
  presentationFullscreenButton: document.querySelector("#presentationFullscreenButton"),
  presentationCloseButton: document.querySelector("#presentationCloseButton"),
  slidesEditorDialog: document.querySelector("#slidesEditorDialog"),
  slidesEditorBackButton: document.querySelector("#slidesEditorBackButton"),
  slidesEditorTitle: document.querySelector("#slidesEditorTitle"),
  slidesEditorStatus: document.querySelector("#slidesEditorStatus"),
  slidesSaveScopeSelect: document.querySelector("#slidesSaveScopeSelect"),
  slidesSetupView: document.querySelector("#slidesSetupView"),
  slidesWorkspaceView: document.querySelector("#slidesWorkspaceView"),
  slidesSetupTitle: document.querySelector("#slidesSetupTitle"),
  slidesFullLyrics: document.querySelector("#slidesFullLyrics"),
  slidesUseSongNotesButton: document.querySelector("#slidesUseSongNotesButton"),
  slidesCreateButton: document.querySelector("#slidesCreateButton"),
  slidesEditFullLyricsButton: document.querySelector("#slidesEditFullLyricsButton"),
  slidesEditorPreviewButton: document.querySelector("#slidesEditorPreviewButton"),
  slidesEditorPresentButton: document.querySelector("#slidesEditorPresentButton"),
  slidesEditorReadyButton: document.querySelector("#slidesEditorReadyButton"),
  slidesEditorList: document.querySelector("#slidesEditorList"),
  slidesLivePreview: document.querySelector("#slidesLivePreview"),
  slidesCurrentLabel: document.querySelector("#slidesCurrentLabel"),
  slidesCurrentText: document.querySelector("#slidesCurrentText"),
  slidesAddSlideButton: document.querySelector("#slidesAddSlideButton"),
  slidesUndoButton: document.querySelector("#slidesUndoButton"),
  slidesRedoButton: document.querySelector("#slidesRedoButton"),
  slidesMoveUpButton: document.querySelector("#slidesMoveUpButton"),
  slidesMoveDownButton: document.querySelector("#slidesMoveDownButton"),
  slidesDuplicateButton: document.querySelector("#slidesDuplicateButton"),
  slidesSplitButton: document.querySelector("#slidesSplitButton"),
  slidesSentencePreviousButton: document.querySelector("#slidesSentencePreviousButton"),
  slidesSentenceNextButton: document.querySelector("#slidesSentenceNextButton"),
  slidesJoinPreviousButton: document.querySelector("#slidesJoinPreviousButton"),
  slidesJoinNextButton: document.querySelector("#slidesJoinNextButton"),
  slidesDeleteButton: document.querySelector("#slidesDeleteButton"),
  slidesFontDownButton: document.querySelector("#slidesFontDownButton"),
  slidesFontUpButton: document.querySelector("#slidesFontUpButton"),
  slidesFitScreenButton: document.querySelector("#slidesFitScreenButton"),
  slidesFontSizeValue: document.querySelector("#slidesFontSizeValue"),
  slidesThemeButtons: document.querySelector("#slidesThemeButtons"),
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
    setlistFolders: [],
    show: {
      name: defaultShowName,
      date: new Date().toISOString().slice(0, 10),
      notes: "",
      team: "",
      slideExportTheme: defaultSlideExportTheme,
      slideExportShowTitles: false,
      slideExportShowCredits: false,
      slideExportShowCount: false,
    },
    songs: [],
    lineup: [],
  });
}


function safeText(value, maxLength = 200, fallback = "") {
  const text = String(value ?? fallback)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
  return text.slice(0, maxLength);
}

function safeId(value, prefix) {
  const text = safeText(value, 96);
  return safeIdPattern.test(text) ? text : makeId(prefix);
}

function safeOptionalId(value) {
  const text = safeText(value, 96);
  return safeIdPattern.test(text) ? text : "";
}

function safeDate(value) {
  const text = safeText(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : new Date().toISOString().slice(0, 10);
}

function safeDuration(value) {
  const text = safeText(value, 8);
  return /^[0-9]{1,2}:[0-5][0-9]$/.test(text) ? text : "";
}

function safeKey(value) {
  return keys.includes(value) ? value : "C";
}

function safeCapo(value) {
  return capoOptions.includes(value) ? value : "";
}

function safeArray(value, maxLength) {
  return Array.isArray(value) ? value.slice(0, maxLength) : [];
}

function safeSlideStatus(value) {
  return slideStatusValues.has(value) ? value : "no-slides";
}

function safeSlideSaveScope(value) {
  return value === "local" ? "local" : "global";
}

function safeImageValue(value) {
  const text = safeText(value, 1500000);
  if (!text) return "";
  if (/^data:image\/(?:png|jpe?g|webp);base64,[A-Za-z0-9+/=\s]+$/i.test(text)) return text.replace(/\s/g, "");
  if (/^https:\/\/[^\s"'<>]{1,1200}$/i.test(text)) return text;
  return "";
}

function safeSheetMimeType(value) {
  const mime = safeText(value, 80).toLowerCase();
  return sheetMimePattern.test(mime) ? mime : "";
}

function normalizeSheetPoint(point) {
  if (!Array.isArray(point) || point.length < 2) return null;
  const x = clampNumber(Number(point[0]), 0, 1);
  const y = clampNumber(Number(point[1]), 0, 1);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return [x, y];
}

function normalizeSheetStroke(stroke = {}) {
  if (!stroke || typeof stroke !== "object") return null;
  const tool = stroke.tool === "eraser" ? "eraser" : "pen";
  const points = safeArray(stroke.points, importLimits.sheetPoints).map(normalizeSheetPoint).filter(Boolean);
  if (points.length < 2) return null;
  return {
    tool,
    color: safeText(stroke.color, 16) || "#d82424",
    width: clampNumber(Number(stroke.width) || 3, 1, 18),
    points,
  };
}

function normalizeSheetAnnotations(raw = {}) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const annotations = {};
  Object.entries(raw).forEach(([page, strokes]) => {
    const pageIndex = Math.max(0, Math.floor(Number(page)));
    if (!Number.isFinite(pageIndex) || pageIndex >= importLimits.sheetPages) return;
    const normalized = safeArray(strokes, importLimits.sheetStrokes).map(normalizeSheetStroke).filter(Boolean);
    if (normalized.length) annotations[String(pageIndex)] = normalized;
  });
  return annotations;
}

function normalizeSheetAttachment(attachment = {}) {
  if (!attachment || typeof attachment !== "object") return null;
  const mimeType = safeSheetMimeType(attachment.mimeType);
  if (!mimeType) return null;
  const pageCount = mimeType === "application/pdf"
    ? clampNumber(Math.floor(Number(attachment.pageCount) || 1), 1, importLimits.sheetPages)
    : 1;
  const id = safeId(attachment.id || attachment.localKey, "sheet");
  const name = safeText(attachment.name || attachment.fileName, 120, "Sheet") || "Sheet";
  return {
    id,
    localKey: safeId(attachment.localKey || id, "sheet-file"),
    name,
    fileName: safeText(attachment.fileName || name, 160, name) || name,
    mimeType,
    size: Math.max(0, Math.floor(Number(attachment.size) || 0)),
    pageCount,
    createdAt: safeText(attachment.createdAt, 40) || new Date().toISOString(),
    updatedAt: safeText(attachment.updatedAt, 40) || new Date().toISOString(),
    annotations: normalizeSheetAnnotations(attachment.annotations),
  };
}

function normalizeSheetAttachments(attachments) {
  return safeArray(attachments, importLimits.sheetAttachments)
    .map(normalizeSheetAttachment)
    .filter(Boolean);
}

function mergeSheetAttachments(...groups) {
  const seen = new Set();
  return groups.flatMap(normalizeSheetAttachments).filter((attachment) => {
    if (seen.has(attachment.id)) return false;
    seen.add(attachment.id);
    return true;
  }).slice(0, importLimits.sheetAttachments);
}

function normalizeSong(song = {}, fallbackPrefix = "song") {
  if (!song || typeof song !== "object") return null;
  const title = safeText(song.title, 70);
  if (!title) return null;
  const songCategories = normalizeSongCategories(song.categories?.length ? song.categories : song.category);
  return {
    id: safeId(song.id, fallbackPrefix),
    title,
    category: songCategories[0] || "",
    categories: songCategories,
    key: safeKey(song.key),
    capo: safeCapo(song.capo),
    duration: safeDuration(song.duration),
    banger: Boolean(song.banger),
    hebrew: Object.prototype.hasOwnProperty.call(song, "hebrew") ? Boolean(song.hebrew) : hasHebrewLetters(title),
    credits: safeText(song.credits, 120),
    tags: normalizeTags(song.tags || song.tagString || ""),
    notes: safeText(song.notes, 5000),
    slideSongId: safeOptionalId(song.slideSongId),
    slideFlowId: safeOptionalId(song.slideFlowId),
    slidesStatus: safeSlideStatus(song.slidesStatus),
    sheetAttachments: normalizeSheetAttachments(song.sheetAttachments || song.chordAttachments),
  };
}

function normalizeSlideSection(section = {}) {
  if (!section || typeof section !== "object") return null;
  const lines = safeArray(section.lines, importLimits.slideLines)
    .map((line) => safeText(line, 180))
    .filter(Boolean);
  return {
    id: safeId(section.id, "section"),
    name: safeText(section.name, 80, "Lyrics") || "Lyrics",
    order: Number.isFinite(Number(section.order)) ? Math.max(0, Math.floor(Number(section.order))) : 0,
    hidden: Boolean(section.hidden),
    lines: lines.length ? lines : [""],
    lineBreaksAfter: safeArray(section.lineBreaksAfter, importLimits.slideLineBreaks)
      .map((index) => Math.max(0, Math.floor(Number(index))))
      .filter((index) => Number.isFinite(index)),
  };
}

function normalizeSlideFlow(flow = {}, sections = []) {
  if (!flow || typeof flow !== "object") return null;
  const sectionIds = new Set(sections.map((section) => section.id));
  const selectedSectionInstances = safeArray(flow.selectedSectionInstances, importLimits.slides)
    .map((instance) => {
      if (!instance || typeof instance !== "object") return null;
      const sectionId = safeOptionalId(instance.sectionId);
      if (!sectionIds.has(sectionId)) return null;
      return {
        id: safeId(instance.id, "flow-section"),
        sectionId,
        label: safeText(instance.label, 80, "Lyrics") || "Lyrics",
        selectedLineIndexes: safeArray(instance.selectedLineIndexes, importLimits.slideLines)
          .map((index) => Math.max(0, Math.floor(Number(index))))
          .filter((index) => Number.isFinite(index)),
      };
    })
    .filter(Boolean);
  return {
    id: safeId(flow.id, "flow"),
    name: safeText(flow.name, 80, "Default") || "Default",
    selectedSectionInstances,
    slideBreaks: safeArray(flow.slideBreaks, importLimits.slideLineBreaks)
      .map((index) => Math.max(0, Math.floor(Number(index))))
      .filter((index) => Number.isFinite(index)),
  };
}

function normalizeLocalSlideSong(slideSong = {}) {
  if (!slideSong || typeof slideSong !== "object") return null;
  const title = safeText(slideSong.title, 90, "Untitled") || "Untitled";
  const sections = safeArray(slideSong.sections, 30).map(normalizeSlideSection).filter(Boolean);
  const safeSections = sections.length ? sections : [normalizeSlideSection({ lines: [""] })];
  const savedFlows = safeArray(slideSong.savedFlows, 30).map((flow) => normalizeSlideFlow(flow, safeSections)).filter(Boolean);
  return {
    id: safeId(slideSong.id, "slide-song"),
    title,
    updatedAt: safeText(slideSong.updatedAt, 40),
    design: {
      theme: slideThemeOptions.some((option) => option.id === slideSong.design?.theme) ? slideSong.design.theme : defaultSlideDesign.theme,
      fontSize: clampNumber(Number(slideSong.design?.fontSize) || defaultSlideDesign.fontSize, minimumSlideEditorFontSize, maxSlideEditorFontSize),
    },
    sections: safeSections,
    savedFlows: savedFlows.length ? savedFlows : [normalizeSlideFlow({ selectedSectionInstances: [{ sectionId: safeSections[0].id }] }, safeSections)],
  };
}

function normalizeShowRecord(show = {}, fallbackLineup = [], songIdMap = new Map()) {
  if (!show || typeof show !== "object") return null;
  const rawLineup = Array.isArray(show.lineup) ? show.lineup : fallbackLineup;
  return {
    id: safeId(show.id || show.show?.id, "show"),
    name: safeText(show.name || show.show?.name, 90, defaultShowName) || defaultShowName,
    date: safeDate(show.date || show.show?.date),
    notes: safeText(show.notes || show.show?.notes, 5000),
    team: safeText(show.team || show.show?.team, 5000),
    slideExportTheme: normalizeSlideExportTheme(show.slideExportTheme || show.show?.slideExportTheme || {}),
    slideExportShowTitles: Boolean(show.slideExportShowTitles || show.show?.slideExportShowTitles),
    slideExportShowCredits: Boolean(show.slideExportShowCredits || show.show?.slideExportShowCredits),
    slideExportShowCount: Boolean(show.slideExportShowCount || show.show?.slideExportShowCount),
    folderId: safeOptionalId(show.folderId),
    draft: Boolean(show.draft),
    lineup: safeArray(rawLineup, importLimits.lineupItems).map((item) => normalizeLineupItem(item, songIdMap)).filter(Boolean),
  };
}

function normalizeImportedPayload(payload, expectedType = "any") {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Imported data was not a setlist file.");
  }
  const fileType = safeText(payload.fileType, 80);
  if (expectedType === "lineup" && fileType && fileType !== "show-lineup-builder") {
    throw new Error("This is not a setlist file.");
  }
  if (expectedType === "backup" && fileType && fileType !== "show-lineup-builder-backup") {
    throw new Error("This is not a full backup file.");
  }
  return normalizeState(payload);
}

function preserveCorruptLocalState(rawValue) {
  if (!rawValue) return;
  try {
    const recoveryKey = storageKey + ":recovery:" + new Date().toISOString();
    localStorage.setItem(recoveryKey, String(rawValue).slice(0, importLimits.backupBytes));
  } catch {}
}

function readImportedJsonFile(file, maxBytes, callback) {
  if (!file) return;
  if (file.size && file.size > maxBytes) {
    toast("That file is too large to open safely.");
    return;
  }
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const text = String(reader.result || "");
    if (text.length > maxBytes) {
      toast("That file is too large to open safely.");
      return;
    }
    try {
      callback(JSON.parse(text));
    } catch {
      toast("That file is not valid setlist JSON.");
    }
  });
  reader.addEventListener("error", () => toast("That file could not be read."));
  reader.readAsText(file);
}

function safeLoadState() {
  try {
    return loadState();
  } catch (error) {
    console.error("Saved lineup data could not be loaded.", error);
    try {
      const saved = localStorage.getItem(storageKey);
      preserveCorruptLocalState(saved);
      localStorage.removeItem(storageKey);
    } catch {}
    return createEmptyState();
  }
}

function loadState() {
  const shared = getSharedStateFromHash();
  if (shared) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(storageStateFrom(shared)));
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
      if (saved.length > importLimits.backupBytes) throw new Error("Saved data was too large.");
      const parsed = JSON.parse(saved);
      return normalizeImportedPayload(parsed);
    } catch (error) {
      console.error("Saved lineup data was reset.", error);
      try {
        preserveCorruptLocalState(saved);
        localStorage.removeItem(storageKey);
      } catch {}
    }
  }

  return createEmptyState();
}

function normalizeState(parsed) {
  parsed = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  const fallbackShow = parsed.show && typeof parsed.show === "object"
    ? parsed.show
    : {
        name: defaultShowName,
        date: new Date().toISOString().slice(0, 10),
        notes: "",
        team: "",
      };
  const songIdMap = new Map();
  const songs = safeArray(parsed.songs, importLimits.songs)
    .map((song) => {
      const normalized = normalizeSong(song);
      if (normalized && song && typeof song === "object") songIdMap.set(String(song.id || ""), normalized.id);
      return normalized;
    })
    .filter(Boolean);
  const legacyLineup = safeArray(parsed.lineup, importLimits.lineupItems).map((item) => normalizeLineupItem(item, songIdMap)).filter(Boolean);
  const shows = safeArray(parsed.shows, importLimits.shows).length
    ? safeArray(parsed.shows, importLimits.shows).map((show) => normalizeShowRecord(show, [], songIdMap)).filter(Boolean)
    : [normalizeShowRecord({
        id: parsed.activeShowId,
        name: fallbackShow.name,
        date: fallbackShow.date,
        notes: fallbackShow.notes,
        team: fallbackShow.team,
        slideExportTheme: fallbackShow.slideExportTheme,
        slideExportShowTitles: fallbackShow.slideExportShowTitles,
        slideExportShowCredits: fallbackShow.slideExportShowCredits,
        slideExportShowCount: fallbackShow.slideExportShowCount,
        lineup: legacyLineup,
      }, [], songIdMap)].filter(Boolean);
  if (!shows.length) {
    shows.push(normalizeShowRecord({ name: defaultShowName, lineup: [] }, [], songIdMap));
  }
  const setlistFolders = safeArray(parsed.setlistFolders, importLimits.folders)
    .map((folder) => {
      if (!folder || typeof folder !== "object") return null;
      return {
        id: safeId(folder.id, "folder"),
        name: safeText(folder.name, 80, "Folder") || "Folder",
      };
    })
    .filter(Boolean);

  const activeShowId = shows.some((show) => show.id === parsed.activeShowId)
    ? parsed.activeShowId
    : shows[0].id;
  const activeShow = shows.find((show) => show.id === activeShowId) || shows[0];

  return {
    version: appVersion,
    activeShowId,
    setlistFolders,
    shows,
    show: showStateFromShow(activeShow),
    songs,
    lineup: activeShow.lineup,
  };
}

function normalizeLineupItem(item, songIdMap = new Map()) {
  if (!item || typeof item !== "object") return null;
  if (item.type === "note") {
    const text = safeText(item.text, 500);
    if (!text) return null;
    return {
      id: safeId(item.id, "lineup"),
      type: "note",
      text,
    };
  }

  if (item.type === "slide") {
    const next = {
      id: safeId(item.id, "lineup"),
      type: "slide",
      title: safeText(item.title, 70, "Slide only") || "Slide only",
      slidesStatus: safeSlideStatus(item.slidesStatus),
      slideSongId: "",
      slideFlowId: safeOptionalId(item.slideFlowId),
      slideSaveScope: "local",
      image: safeImageValue(item.image),
      imageName: safeText(item.imageName, 90),
    };

    if (item.localSlideSong && typeof item.localSlideSong === "object") {
      const localSlideSong = normalizeLocalSlideSong(item.localSlideSong);
      if (localSlideSong) next.localSlideSong = localSlideSong;
    }

    if (next.image && next.slidesStatus === "no-slides") next.slidesStatus = "slides-ready";
    return next;
  }

  const next = {
    id: safeId(item.id, "lineup"),
    type: "song",
    songId: songIdMap.get(String(item.songId || "")) || safeOptionalId(item.songId),
    capo: safeCapo(item.capo),
    key: safeKey(item.key),
    ready: Boolean(item.ready),
    note: safeText(item.note, 80),
    slidesStatus: safeSlideStatus(item.slidesStatus),
    slideSongId: safeOptionalId(item.slideSongId),
    slideFlowId: safeOptionalId(item.slideFlowId),
    slideSaveScope: safeSlideSaveScope(item.slideSaveScope),
    sheetAttachments: normalizeSheetAttachments(item.sheetAttachments || item.chordAttachments),
  };

  if (!next.songId && item.oneTimeSong && typeof item.oneTimeSong === "object") {
    next.oneTimeSong = normalizeOneTimeSong(item.oneTimeSong);
    next.slideSaveScope = "local";
  }

  if (item.localSlideSong && typeof item.localSlideSong === "object") {
    const localSlideSong = normalizeLocalSlideSong(item.localSlideSong);
    if (localSlideSong) next.localSlideSong = localSlideSong;
  }

  if (!next.songId && !next.oneTimeSong) return null;
  return next;
}

function normalizeOneTimeSong(song = {}) {
  const normalized = normalizeSong(song, "once");
  return {
    ...(normalized || {
      id: makeId("once"),
      title: "One-time song",
      category: "",
      categories: [],
      key: "C",
      capo: "",
      duration: "",
      banger: false,
      hebrew: false,
      credits: "",
      tags: [],
      notes: "",
      slidesStatus: "no-slides",
      slideSongId: "",
      slideFlowId: "",
    }),
    oneTime: true,
  };
}

function songForLineupItem(item) {
  if (!item || item.type !== "song") return null;
  if (item.songId) return state.songs.find((candidate) => candidate.id === item.songId) || null;
  return item.oneTimeSong ? normalizeOneTimeSong(item.oneTimeSong) : null;
}

function getSharedStateFromHash() {
  const match = window.location.hash.match(/lineup=([^&]+)/);
  if (!match) return null;

  try {
    if (match[1].length > importLimits.shareChars) throw new Error("Shared setlist link was too large.");
    const parsed = JSON.parse(decodeShareData(match[1]));
    const shared = normalizeImportedPayload(parsed, "lineup");
    importedSharedLineup = true;
    return shared;
  } catch (error) {
    console.warn("Shared setlist link could not be opened.", error);
    return null;
  }
}

function saveState() {
  syncActiveShowFromFields();
  const current = activeShow();
  const currentWasUnchangedDraft = Boolean(current?.draft && isUnchangedDraftShow(current));
  if (current?.draft && !isUnchangedDraftShow(current)) current.draft = false;
  try {
    localStorage.setItem(storageKey, JSON.stringify(storageState()));
  } catch (error) {
    console.warn("Lineup could not be stored locally.", error);
  }
  localChangeRevision += 1;
  if (!currentWasUnchangedDraft) queueLineupCloudSave();
}

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function pushHistorySnapshot(stack, snapshot) {
  const serialized = JSON.stringify(snapshot);
  if (stack.length && JSON.stringify(stack[stack.length - 1]) === serialized) return;
  stack.push(snapshot);
  if (stack.length > 80) stack.shift();
}

function recordLineupUndo() {
  if (restoringLineupHistory) return;
  syncActiveShowFromFields();
  pushHistorySnapshot(lineupUndoStack, cloneData(state));
  lineupRedoStack = [];
}

function restoreLineupSnapshot(snapshot) {
  restoringLineupHistory = true;
  state = normalizeState(cloneData(snapshot));
  saveState();
  render();
  restoringLineupHistory = false;
}

function undoLineup() {
  if (!lineupUndoStack.length) {
    toast("Nothing to undo.");
    return;
  }
  syncActiveShowFromFields();
  lineupRedoStack.push(cloneData(state));
  restoreLineupSnapshot(lineupUndoStack.pop());
  toast("Undone.");
}

function redoLineup() {
  if (!lineupRedoStack.length) {
    toast("Nothing to redo.");
    return;
  }
  syncActiveShowFromFields();
  lineupUndoStack.push(cloneData(state));
  restoreLineupSnapshot(lineupRedoStack.pop());
  toast("Redone.");
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
      cloudWorkspaceLoadedForSession = false;
      stopCloudSyncLoop();
      return;
    }
    setGuestSession(false);
    localStorage.setItem(cloudAuthStorageKey, JSON.stringify(session));
    startCloudSyncLoop();
  } catch {}
}

function workspaceTimestampFromResponse(workspace) {
  return workspace?.updatedAt || workspace?.workspace?.updated_at || workspace?.workspace?.updatedAt || "";
}

function rememberCloudWorkspaceTimestamp(workspaceOrTimestamp) {
  const updatedAt = typeof workspaceOrTimestamp === "string" ? workspaceOrTimestamp : workspaceTimestampFromResponse(workspaceOrTimestamp);
  if (!updatedAt) return;
  const current = restoreCloudWorkspaceTimestamp();
  if (current && Date.parse(updatedAt) < Date.parse(current)) return;
  cloudWorkspaceUpdatedAt = updatedAt;
  try {
    localStorage.setItem(cloudSyncMetaStorageKey, JSON.stringify({ updatedAt }));
  } catch {}
}

function restoreCloudWorkspaceTimestamp() {
  if (cloudWorkspaceUpdatedAt) return cloudWorkspaceUpdatedAt;
  try {
    const raw = localStorage.getItem(cloudSyncMetaStorageKey);
    const parsed = raw ? JSON.parse(raw) : null;
    cloudWorkspaceUpdatedAt = parsed?.updatedAt || "";
  } catch {
    cloudWorkspaceUpdatedAt = "";
  }
  return cloudWorkspaceUpdatedAt;
}

function isRemoteWorkspaceNewer(updatedAt) {
  if (!updatedAt) return false;
  const current = restoreCloudWorkspaceTimestamp();
  if (!current) return true;
  return Date.parse(updatedAt) > Date.parse(current) + 250;
}

function normalizeAccountProfile(metadata = {}) {
  return {
    fullName: metadata.fullName || metadata.full_name || "",
    phone: metadata.phone || "",
    country: metadata.country || "",
    useCase: metadata.useCase || metadata.main_use_case || "",
    campName: metadata.campName || metadata.camp_name || "",
    synagogueName: metadata.synagogueName || metadata.synagogue_name || "",
    otherUseCase: metadata.otherUseCase || metadata.other_use_case || "",
    instrument: metadata.instrument || "",
    communityInstitution: metadata.communityInstitution || metadata.community_institution || "",
  };
}

function populateAccountProfile(profile = {}) {
  const normalized = normalizeAccountProfile(profile);
  if (els.accountProfileFullName) els.accountProfileFullName.value = normalized.fullName;
  if (els.accountProfilePhone) els.accountProfilePhone.value = normalized.phone;
  if (els.accountProfileCountry) els.accountProfileCountry.value = normalized.country;
  if (els.accountProfileInstrument) els.accountProfileInstrument.value = normalized.instrument;
  if (els.accountProfileCommunityInstitution) els.accountProfileCommunityInstitution.value = normalized.communityInstitution;
  if (els.accountProfileUseCase) els.accountProfileUseCase.value = normalized.useCase || "Summer camp";
  if (els.accountProfileCampName) els.accountProfileCampName.value = normalized.campName;
  if (els.accountProfileSynagogueName) els.accountProfileSynagogueName.value = normalized.synagogueName;
  if (els.accountProfileOtherUseCase) els.accountProfileOtherUseCase.value = normalized.otherUseCase;
  updateAccountProfileUseCaseFields();
}

function collectAccountSignupProfile() {
  return {
    fullName: els.accountFullName?.value.trim() || "",
    phone: els.accountPhone?.value.trim() || "",
    country: els.accountCountry?.value.trim() || "",
    useCase: els.accountUseCase?.value || "",
    campName: els.accountCampName?.value.trim() || "",
    synagogueName: els.accountSynagogueName?.value.trim() || "",
    otherUseCase: els.accountOtherUseCase?.value.trim() || "",
    instrument: els.accountInstrument?.value.trim() || "",
    communityInstitution: els.accountCommunityInstitution?.value.trim() || "",
  };
}

function collectAccountProfile() {
  return {
    fullName: els.accountProfileFullName?.value.trim() || "",
    phone: els.accountProfilePhone?.value.trim() || "",
    country: els.accountProfileCountry?.value.trim() || "",
    useCase: els.accountProfileUseCase?.value || "",
    campName: els.accountProfileCampName?.value.trim() || "",
    synagogueName: els.accountProfileSynagogueName?.value.trim() || "",
    otherUseCase: els.accountProfileOtherUseCase?.value.trim() || "",
    instrument: els.accountProfileInstrument?.value.trim() || "",
    communityInstitution: els.accountProfileCommunityInstitution?.value.trim() || "",
  };
}

function hasGuestSession() {
  try {
    return sessionStorage.getItem(guestSessionStorageKey) === "true";
  } catch {
    return false;
  }
}

function setGuestSession(active) {
  try {
    if (active) {
      sessionStorage.setItem(guestSessionStorageKey, "true");
    } else {
      sessionStorage.removeItem(guestSessionStorageKey);
    }
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
  cloudSaveInFlight = true;
  try {
    const result = await cloudRequest("/api/workspace", {
    method: "POST",
    headers: { authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ lineupState: storageState(), studioData }),
    });
    rememberCloudWorkspaceTimestamp(result);
    lastCloudSavedRevision = localChangeRevision;
    return result;
  } finally {
    cloudSaveInFlight = false;
  }
}

async function loadCloudWorkspaceToDevice(options = {}) {
  const session = await getValidCloudSession();
  if (!session) throw new Error("Please sign in first.");
  const workspace = await cloudRequest("/api/workspace", {
    headers: { authorization: `Bearer ${session.access_token}` },
  });
  rememberCloudWorkspaceTimestamp(workspace);
  if (workspace.lineupState) {
    state = normalizeState(workspace.lineupState);
    localStorage.setItem(storageKey, JSON.stringify(state));
  }
  if (workspace.studioData) {
    localStorage.setItem(studioStorageKey, JSON.stringify(workspace.studioData));
  }
  render();
  lastCloudSavedRevision = localChangeRevision;
  if (options.toastMessage) toast(options.toastMessage);
  return workspace;
}

function cloudWorkspaceHasData(workspace) {
  return Boolean(workspace?.lineupState || workspace?.studioData);
}

async function loadCloudWorkspaceOrSeedCurrent() {
  const workspace = await loadCloudWorkspaceToDevice();
  cloudWorkspaceLoadedForSession = true;
  if (!cloudWorkspaceHasData(workspace)) {
    await saveCurrentWorkspaceToCloud();
    return { seeded: true, workspace };
  }
  return { seeded: false, workspace };
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

async function refreshCloudWorkspaceIfNewer(options = {}) {
  if (!getCloudSession() || cloudPullInFlight || cloudSaveInFlight || lineupCloudTimer) return false;
  cloudPullInFlight = true;
  try {
    const session = await getValidCloudSession();
    if (!session) return false;
    const workspace = await cloudRequest("/api/workspace", {
      headers: { authorization: `Bearer ${session.access_token}` },
    });
    const updatedAt = workspaceTimestampFromResponse(workspace);
    if (!workspace.lineupState || !isRemoteWorkspaceNewer(updatedAt)) {
      rememberCloudWorkspaceTimestamp(workspace);
      return false;
    }
    if (localChangeRevision !== lastCloudSavedRevision) return false;
    state = normalizeState(workspace.lineupState);
    localStorage.setItem(storageKey, JSON.stringify(state));
    if (workspace.studioData) {
      localStorage.setItem(studioStorageKey, JSON.stringify(workspace.studioData));
    }
    rememberCloudWorkspaceTimestamp(workspace);
    lastCloudSavedRevision = localChangeRevision;
    render();
    if (options.toastMessage) toast(options.toastMessage);
    return true;
  } catch (error) {
    console.warn("Could not refresh cloud workspace.", error);
    return false;
  } finally {
    cloudPullInFlight = false;
  }
}

function startCloudSyncLoop() {
  if (!getCloudSession()) return;
  restoreCloudWorkspaceTimestamp();
  window.clearInterval(cloudSyncTimer);
  cloudSyncTimer = window.setInterval(() => {
    if (!document.hidden) refreshCloudWorkspaceIfNewer({ toastMessage: "Synced latest cloud changes." });
  }, 12_000);
  if (!cloudSyncListenersBound) {
    cloudSyncListenersBound = true;
    window.addEventListener("focus", () => refreshCloudWorkspaceIfNewer({ toastMessage: "Synced latest cloud changes." }));
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) refreshCloudWorkspaceIfNewer({ toastMessage: "Synced latest cloud changes." });
    });
  }
}

function stopCloudSyncLoop() {
  window.clearInterval(cloudSyncTimer);
  cloudSyncTimer = null;
}

function isInstalledAppShell() {
  return Boolean(window.lineupDesktop?.isDesktop || window.lineupNativeFile?.isNative);
}

function applyInstalledShellMode() {
  document.body.classList.toggle("installed-app-shell", isInstalledAppShell());
}

function openSongleadingHome(event) {
  if (!isInstalledAppShell()) return;
  event?.preventDefault?.();
  event?.stopPropagation?.();
  if (els.headerMenu) els.headerMenu.open = false;
  if (window.lineupDesktop?.openExternal) {
    window.lineupDesktop.openExternal(songleadingHomeUrl);
    return;
  }
  window.location.href = songleadingHomeUrl;
}

function updateAccountDialog(message = "") {
  const session = getCloudSession();
  const guest = hasGuestSession();
  const showingCredentials = !session && accountScreen === "credentials";
  if (els.accountSignedOut) els.accountSignedOut.hidden = Boolean(session);
  if (els.accountSignedIn) els.accountSignedIn.hidden = !session;
  if (els.accountChoiceView) els.accountChoiceView.hidden = Boolean(session) || showingCredentials;
  if (els.accountCredentialView) els.accountCredentialView.hidden = Boolean(session) || !showingCredentials;
  if (els.accountDialogTitle) {
    els.accountDialogTitle.textContent = session
      ? "Cloud"
      : showingCredentials
        ? accountMode === "sign-up" ? "Sign up" : "Sign in"
        : "Cloud";
  }
  if (els.accountDialogCopy) {
    els.accountDialogCopy.textContent = session
      ? "Your cloud workspace is active. Changes save automatically."
      : !showingCredentials
        ? "Sign in, create an account, or continue as guest to use Lineup."
        : accountMode === "sign-up"
          ? "Create an account to use Lineup and keep your work saved in the cloud."
          : "Sign in to use cloud sync, or go back to choose another option.";
  }
  if (els.accountSignupFields) els.accountSignupFields.hidden = accountMode !== "sign-up";
  if (els.accountSignInModeButton) els.accountSignInModeButton.classList.toggle("active", accountMode === "sign-in");
  if (els.accountSignUpModeButton) els.accountSignUpModeButton.classList.toggle("active", accountMode === "sign-up");
  if (els.accountCreateButton) els.accountCreateButton.hidden = accountMode !== "sign-up";
  if (els.accountSubmitButton) els.accountSubmitButton.textContent = accountMode === "sign-up" ? "Create account" : "Sign in";
  if (els.accountPassword) els.accountPassword.autocomplete = accountMode === "sign-up" ? "new-password" : "current-password";
  if (els.accountRecoverButton) els.accountRecoverButton.hidden = accountMode === "sign-up";
  updateAccountUseCaseFields();
  if (els.accountEmailLabel) {
    els.accountEmailLabel.textContent = session?.user?.email || els.accountEmail?.value || "Signed in";
  }
  if (els.accountSyncMessage) {
    els.accountSyncMessage.textContent = message || (guest ? "Guest mode is active. Work stays only in this browser." : authGateActive ? "Sign in, create an account, or continue as guest to use Lineup." : "");
  }
}

function setAccountMode(mode) {
  accountMode = mode;
  accountScreen = "credentials";
  updateAccountDialog();
  window.setTimeout(() => els.accountEmail?.focus(), 0);
}

function showAccountChoices() {
  accountScreen = "choices";
  updateAccountDialog();
}

function togglePasswordFieldVisibility(input, button) {
  if (!input || !button) return;
  const showing = input.type === "text";
  input.type = showing ? "password" : "text";
  const label = showing ? "Show password" : "Hide password";
  button.setAttribute("aria-label", label);
  button.setAttribute("aria-pressed", String(!showing));
  button.title = label;
  input.focus();
}

function resetPasswordField(input, button) {
  if (input) {
    input.value = "";
    input.type = "password";
  }
  if (button) {
    button.setAttribute("aria-label", "Show password");
    button.setAttribute("aria-pressed", "false");
    button.title = "Show password";
  }
}

function resetAccountPasswordFields() {
  resetPasswordField(els.accountPassword, els.accountPasswordToggle);
  resetPasswordField(els.accountNewPassword, els.accountNewPasswordToggle);
  resetPasswordField(els.accountConfirmPassword, els.accountConfirmPasswordToggle);
}

function toggleAccountPasswordVisibility() {
  togglePasswordFieldVisibility(els.accountPassword, els.accountPasswordToggle);
}

function updateAccountUseCaseFields() {
  const value = els.accountUseCase?.value || "";
  if (els.accountCampField) els.accountCampField.hidden = value !== "Summer camp";
  if (els.accountSynagogueField) els.accountSynagogueField.hidden = value !== "Temple / synagogue";
  if (els.accountOtherUseCaseField) els.accountOtherUseCaseField.hidden = value !== "Other";
}

function updateAccountProfileUseCaseFields() {
  const value = els.accountProfileUseCase?.value || "";
  if (els.accountProfileCampField) els.accountProfileCampField.hidden = value !== "Summer camp";
  if (els.accountProfileSynagogueField) els.accountProfileSynagogueField.hidden = value !== "Temple / synagogue";
  if (els.accountProfileOtherUseCaseField) els.accountProfileOtherUseCaseField.hidden = value !== "Other";
}

function openAccountDialog() {
  const session = getCloudSession();
  accountMode = "sign-in";
  accountScreen = session ? "credentials" : "choices";
  if (session?.user?.email && els.accountEmail) els.accountEmail.value = session.user.email;
  populateAccountProfile(session?.user?.user_metadata || {});
  resetAccountPasswordFields();
  updateAccountDialog();
  openDialog(els.accountDialog);
}

function openRequiredAccountDialog(message = "Sign in to use cloud sync, or continue as guest to save only in this browser.") {
  authGateActive = true;
  document.body.classList.add("auth-required");
  closeOnboardingTips(false);
  closeSetlistStartDialog();
  openAccountDialog();
  if (window.location.protocol === "file:") {
    updateAccountDialog("Sign-in works on the online app. You can continue as guest here, but work stays only in this browser and can be lost if browser data is cleared.");
    return;
  }
  updateAccountDialog(message);
}

async function finishRequiredAccountFlow(message = "Signed in.") {
  authGateActive = false;
  document.body.classList.remove("auth-required");
  updateAccountDialog(message);
  closeDialog(els.accountDialog);
  if (!importedSharedLineup) {
    openSetlistStartDialog();
  } else {
    maybeShowOnboardingTips();
  }
}

function continueAsGuest() {
  setGuestSession(true);
  authGateActive = false;
  document.body.classList.remove("auth-required");
  updateAccountDialog("Continuing as guest. Work is saved only in this browser on this device.");
  closeDialog(els.accountDialog);
  toast("Guest mode: saved only on this browser.");
  if (!importedSharedLineup) {
    openSetlistStartDialog();
  } else {
    maybeShowOnboardingTips();
  }
}

async function loadCloudOnceForSession() {
  if (cloudWorkspaceLoadedForSession || importedSharedLineup) return;
  try {
    await loadCloudWorkspaceOrSeedCurrent();
  } catch (error) {
    console.warn("Could not load cloud workspace automatically.", error);
  }
}

async function ensureSignedInForApp() {
  if (!requireAccountForApp) return true;
  try {
    if (window.location.protocol !== "file:") {
      const session = await getValidCloudSession();
      if (session?.access_token) {
        setCloudSession(session);
        await loadCloudOnceForSession();
        startCloudSyncLoop();
        return true;
      }
    }
  } catch (error) {
    console.warn("Account check failed.", error);
  }
  if (hasGuestSession()) return true;
  openRequiredAccountDialog();
  return false;
}

async function signInFromAccountDialog(event) {
  event.preventDefault();
  if (!getCloudSession() && accountScreen !== "credentials") {
    showAccountChoices();
    return;
  }
  if (accountMode === "sign-up") {
    await createAccountFromDialog();
    return;
  }
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
    populateAccountProfile(session.user?.user_metadata || {});
    const cloudResult = await loadCloudWorkspaceOrSeedCurrent();
    if (authGateActive) {
      await finishRequiredAccountFlow(cloudResult.seeded ? "Signed in. Your cloud workspace is ready." : "Signed in. Your cloud workspace is loaded.");
      return;
    }
    updateAccountDialog(cloudResult.seeded ? "Signed in. Your cloud workspace is ready." : "Signed in. Your cloud workspace is loaded.");
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
        profile: collectAccountSignupProfile(),
      }),
    });
    if (!session?.access_token) {
      setCloudSession(null);
      updateAccountDialog("Account created. Check your email, then sign in.");
      return;
    }
    setCloudSession(session);
    populateAccountProfile(session.user?.user_metadata || collectAccountSignupProfile());
    cloudWorkspaceLoadedForSession = true;
    await saveCurrentWorkspaceToCloud();
    if (authGateActive) {
      await finishRequiredAccountFlow("Account created. Your cloud workspace is ready.");
      return;
    }
    updateAccountDialog("Account created. This device was saved to the cloud.");
  } catch (error) {
    updateAccountDialog(error instanceof Error ? error.message : "Could not create account.");
  }
}

async function loadAccountProfileFromCloud() {
  updateAccountDialog("Loading profile...");
  try {
    const session = await getValidCloudSession();
    if (!session) throw new Error("Please sign in first.");
    const data = await cloudRequest("/api/auth/profile", {
      headers: { authorization: `Bearer ${session.access_token}` },
    });
    const user = data.user || { ...session.user, user_metadata: data.profile || {} };
    setCloudSession({ ...session, user });
    populateAccountProfile(data.profile || user.user_metadata || {});
    updateAccountDialog("Profile loaded.");
  } catch (error) {
    updateAccountDialog(error instanceof Error ? error.message : "Could not load profile.");
  }
}

async function saveAccountProfileToCloud() {
  updateAccountDialog("Saving profile...");
  try {
    const session = await getValidCloudSession();
    if (!session) throw new Error("Please sign in first.");
    const profile = collectAccountProfile();
    const data = await cloudRequest("/api/auth/profile", {
      method: "PUT",
      headers: { authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ profile }),
    });
    const user = data.user || data.session?.user || { ...session.user, user_metadata: data.profile || profile };
    setCloudSession(data.session?.access_token ? data.session : { ...session, user });
    populateAccountProfile(data.profile || user.user_metadata || profile);
    updateAccountDialog("Profile saved.");
  } catch (error) {
    updateAccountDialog(error instanceof Error ? error.message : "Could not save profile.");
  }
}

async function changeAccountPasswordFromDialog() {
  const password = els.accountNewPassword?.value || "";
  const confirmPassword = els.accountConfirmPassword?.value || "";
  if (password.length < 8) {
    updateAccountDialog("Password must be at least 8 characters.");
    els.accountNewPassword?.focus();
    return;
  }
  if (password !== confirmPassword) {
    updateAccountDialog("Passwords do not match.");
    els.accountConfirmPassword?.focus();
    return;
  }
  updateAccountDialog("Changing password...");
  try {
    const session = await getValidCloudSession();
    if (!session) throw new Error("Please sign in first.");
    const data = await cloudRequest("/api/auth/password", {
      method: "PUT",
      headers: { authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ password }),
    });
    const user = data.user || session.user;
    setCloudSession(data.session?.access_token ? data.session : { ...session, user });
    resetPasswordField(els.accountNewPassword, els.accountNewPasswordToggle);
    resetPasswordField(els.accountConfirmPassword, els.accountConfirmPasswordToggle);
    updateAccountDialog("Password changed.");
  } catch (error) {
    updateAccountDialog(error instanceof Error ? error.message : "Could not change password.");
  }
}

async function recoverPasswordFromAccountDialog() {
  updateAccountDialog("Sending recovery email...");
  try {
    await cloudRequest("/api/auth/recover", {
      method: "POST",
      body: JSON.stringify({
        email: els.accountEmail.value.trim(),
        phone: els.accountPhone?.value.trim() || "",
      }),
    });
    updateAccountDialog("Recovery email sent. SMS recovery depends on the phone provider connected to the account.");
  } catch (error) {
    updateAccountDialog(error instanceof Error ? error.message : "Could not send recovery email.");
  }
}

async function openSetlistStartDialogWhenReady() {
  if (await ensureSignedInForApp()) {
    openSetlistStartDialog();
  }
}

function activeShow() {
  return state.shows.find((show) => show.id === state.activeShowId) || state.shows[0];
}

function showStateFromShow(show = {}) {
  return {
    name: show.name || defaultShowName,
    date: show.date || new Date().toISOString().slice(0, 10),
    notes: show.notes || "",
    team: show.team || "",
    slideExportTheme: normalizeSlideExportTheme(show.slideExportTheme || {}),
    slideExportShowTitles: Boolean(show.slideExportShowTitles),
    slideExportShowCredits: Boolean(show.slideExportShowCredits),
    slideExportShowCount: Boolean(show.slideExportShowCount),
  };
}

function syncActiveShowFromFields() {
  if (!state.shows?.length) return;
  const show = activeShow();
  show.name = state.show.name;
  show.date = state.show.date;
  show.notes = state.show.notes || "";
  show.team = state.show.team || "";
  show.slideExportTheme = normalizeSlideExportTheme(state.show.slideExportTheme || {});
  show.slideExportShowTitles = Boolean(state.show.slideExportShowTitles);
  show.slideExportShowCredits = Boolean(state.show.slideExportShowCredits);
  show.slideExportShowCount = Boolean(state.show.slideExportShowCount);
  show.lineup = state.lineup;
}

function isUnchangedDraftShow(show) {
  if (!show?.draft) return false;
  return (
    (show.name || "") === defaultShowName &&
    (show.date || "") === new Date().toISOString().slice(0, 10) &&
    !(show.notes || "").trim() &&
    !(show.team || "").trim() &&
    (!Array.isArray(show.lineup) || show.lineup.length === 0)
  );
}

function storageState() {
  const shows = (state.shows || []).filter((show) => !isUnchangedDraftShow(show));
  const savedActiveShow = shows.find((show) => show.id === state.activeShowId) || shows[0] || null;
  return {
    ...state,
    activeShowId: savedActiveShow?.id || state.activeShowId,
    show: savedActiveShow
      ? {
          name: savedActiveShow.name,
          date: savedActiveShow.date,
          notes: savedActiveShow.notes || "",
          team: savedActiveShow.team || "",
          slideExportTheme: normalizeSlideExportTheme(savedActiveShow.slideExportTheme || {}),
          slideExportShowTitles: Boolean(savedActiveShow.slideExportShowTitles),
          slideExportShowCredits: Boolean(savedActiveShow.slideExportShowCredits),
          slideExportShowCount: Boolean(savedActiveShow.slideExportShowCount),
        }
      : state.show,
    shows: shows.map(({ draft, ...show }) => show),
    lineup: savedActiveShow?.lineup || state.lineup,
  };
}

function commitShowMetaFromFields() {
  state.show.name = els.showName.value.trim() || defaultShowName;
  state.show.date = els.showDate.value || state.show.date;
}

function normalizeCategoryName(name) {
  if (name === "Session") return "Song Session";
  if (name === "Special" || name === "Other") return "";
  if (!name) return "";
  if (name === "Services" || name === "Song Session") return name;
  return "";
}

function normalizeSongCategories(value) {
  const rawCategories = Array.isArray(value) ? value : String(value || "").split(/[|,]/);
  const seen = new Set();
  return rawCategories
    .map((category) => normalizeCategoryName(String(category).trim()))
    .filter(Boolean)
    .filter((category) => {
      if (seen.has(category)) return false;
      seen.add(category);
      return true;
    });
}

function songCategoryNames(song) {
  return normalizeSongCategories(song?.categories?.length ? song.categories : song?.category);
}

function categoryFor(name) {
  const normalized = normalizeSongCategories(name)[0] || "";
  return categories.find((category) => category.name === normalized) || { name: "", color: "#7b8794" };
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

function songMetaLabel(song) {
  const parts = [];
  if (song?.duration) parts.push(song.duration);
  return parts.join(" / ");
}

function slidesStatusLabel(status) {
  if (status === "slides-ready") return "slides ready";
  if (status === "needs-review") return "slides ready";
  return "no slides";
}

function slidesStatusClass(status) {
  if (status === "slides-ready") return "ready";
  if (status === "needs-review") return "ready";
  return "empty";
}

function slidesButtonClass(itemOrSong) {
  const status = itemOrSong?.slidesStatus || "no-slides";
  const hasSlides = Boolean(itemOrSong?.image || itemOrSong?.slideSongId || itemOrSong?.slideFlowId || status === "slides-ready");
  if (status === "needs-review") return hasSlides ? "ready" : "empty";
  return hasSlides ? "ready" : "empty";
}

function slidesButtonTitle(itemOrSong) {
  if (itemOrSong?.image) return "Full-screen picture slide";
  const status = itemOrSong?.slidesStatus || "no-slides";
  if (status === "slides-ready") return "Slides ready";
  if (status === "needs-review") return "Slides ready";
  return "No slides yet";
}

function lineupStats() {
  const songs = state.lineup
    .filter((item) => item.type === "song")
    .map((item) => ({
      item,
      song: songForLineupItem(item),
    }))
    .filter((entry) => entry.song);
  const notes = state.lineup.filter((item) => item.type === "note" && item.text?.trim()).length;
  const ready = songs.filter(({ item }) => item.ready).length;
  const slidesReady = songs.filter(({ item, song }) => slidesButtonClass(item) === "ready" || slidesButtonClass(song) === "ready").length;
  const noSlides = songs.filter(({ item, song }) => slidesButtonClass(item) === "empty" && slidesButtonClass(song) === "empty").length;
  const hebrew = songs.filter(({ song }) => song.hebrew).length;
  const bangers = songs.filter(({ song }) => song.banger).length;
  return {
    totalSongs: songs.length,
    notes,
    ready,
    notReady: Math.max(0, songs.length - ready),
    slidesReady,
    needsReview: 0,
    noSlides,
    hebrew,
    bangers,
  };
}

function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function renderLineupHealth() {
  const stats = lineupStats();
  if (!els.lineupNextSteps) return;
  const slideStatus = stats.noSlides
    ? stats.noSlides === 1
      ? "1 needs slides"
      : `${stats.noSlides} need slides`
    : stats.totalSongs
      ? "Slides ready"
      : "Slides empty";
  const steps = [];
  if (!stats.totalSongs) {
    steps.push({ tone: "primary", title: "Start with the song bank", text: "Add songs from the song bank, then arrange them in the setlist." });
  } else {
    if (stats.notReady) steps.push({ tone: "warning", title: stats.notReady === 1 ? "1 song is not checked ready" : `${stats.notReady} songs are not checked ready`, text: "Use the ready boxes when each song is confirmed." });
    if (stats.noSlides) steps.push({ tone: "warning", title: stats.noSlides === 1 ? "1 song needs slides" : `${stats.noSlides} songs need slides`, text: "Open the Slides button on each song and paste lyrics or review existing slides." });
    if (!steps.length) steps.push({ tone: "good", title: "Setlist is ready", text: "Everything has slides and every song is marked ready." });
  }

  els.lineupNextSteps.innerHTML = `
    <div class="lineup-summary-card">
      <div>
        <p class="eyebrow">Next steps</p>
        <h2>${escapeHtml(steps[0].title)}</h2>
        <p>${escapeHtml(steps[0].text)}</p>
      </div>
      <div class="lineup-summary-stats">
        <span>${stats.totalSongs} ${stats.totalSongs === 1 ? "song" : "songs"}</span>
        <span>${stats.bangers ? `${stats.bangers} banger${stats.bangers === 1 ? "" : "s"}` : "No bangers marked"}</span>
        <span>${stats.hebrew ? `${stats.hebrew} Hebrew song${stats.hebrew === 1 ? "" : "s"}` : "No Hebrew songs"}</span>
        <span class="${stats.noSlides || stats.needsReview ? "warning" : "good"}">${escapeHtml(slideStatus)}</span>
      </div>
    </div>
  `;
}

function lineupStartMarkSvg() {
  return `
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path class="mark-page" d="M13 8h22l6 6v26H13z" />
      <path class="mark-fold" d="M35 8v7h6" />
      <path class="mark-line" d="M19 18h10M19 25h14M19 32h8" />
      <path class="mark-note" d="M32 34V22l6-1v10" />
      <circle class="mark-dot" cx="29" cy="34" r="3" />
      <circle class="mark-dot" cx="38" cy="31" r="3" />
    </svg>
  `;
}

function renderEmptyLineupState() {
  const landscapeSideBank = isLandscapeSideBankLayout();
  if (isLibraryDrawerLayout() || landscapeSideBank) {
    return `
      <div class="empty-state lineup-start-empty mobile-start">
        <div class="lineup-start-mark brand-mark" aria-hidden="true">
          ${lineupStartMarkSvg()}
        </div>
        <strong>Start from the Song Bank</strong>
        <p>${landscapeSideBank ? "Use the Song Bank on the left to add your first song." : "Use the library below to add your first song."}</p>
        <small>First time: tap a song to add it, then drag rows to arrange the setlist.</small>
      </div>
    `;
  }
  return `
    <div class="empty-state lineup-start-empty">
      <div class="lineup-start-mark brand-mark" aria-hidden="true">
        ${lineupStartMarkSvg()}
      </div>
      <strong>Start from the Song Bank</strong>
      <p>Search the library and tap a song to add it to this setlist.</p>
    </div>
  `;
}

function openSlidesForLineup(lineupId) {
  const item = state.lineup.find((candidate) => candidate.id === lineupId);
  if (!item || item.type !== "song") return;
  saveState();
  openSlidesEditorForLineup(lineupId);
}

function openSlidesForBankSong(songId) {
  const existingItem = state.lineup.find((candidate) => candidate.type === "song" && candidate.songId === songId);
  if (existingItem) {
    openSlidesForLineup(existingItem.id);
    return;
  }
  const item = addSongToLineup(songId, false);
  if (!item) return;
  openSlidesForLineup(item.id);
}

function loadStudioData() {
  try {
    const raw = localStorage.getItem(studioStorageKey);
    const parsed = raw ? JSON.parse(raw) : null;
    return {
      songs: Array.isArray(parsed?.songs) ? parsed.songs : [],
      sessions: Array.isArray(parsed?.sessions) ? parsed.sessions : [],
    };
  } catch {
    return { songs: [], sessions: [] };
  }
}

function saveStudioData(data) {
  try {
    localStorage.setItem(studioStorageKey, JSON.stringify({
      songs: Array.isArray(data?.songs) ? data.songs : [],
      sessions: Array.isArray(data?.sessions) ? data.sessions : [],
    }));
  } catch (error) {
    console.warn("Slides could not be stored locally.", error);
  }
}

function localSlideSongForLineupItem(item) {
  return item?.slideSaveScope === "local" && item?.localSlideSong && typeof item.localSlideSong === "object"
    ? item.localSlideSong
    : null;
}

function slideOnlySongForItem(item) {
  return {
    id: `slide-only-${item?.id || makeId("slide")}`,
    title: item?.title || "Slide only",
    category: "",
    categories: [],
    key: "C",
    capo: "",
    duration: "",
    banger: false,
    hebrew: false,
    credits: "",
    tags: [],
    notes: "",
    slideSongId: "",
    slideFlowId: item?.slideFlowId || "",
    slidesStatus: item?.image ? "slides-ready" : safeSlideStatus(item?.slidesStatus),
  };
}

function findGlobalSlideSongForLineupItem(item, song, studioSongs) {
  const linkedId = item?.slideSongId || song?.slideSongId || "";
  if (linkedId) {
    const linked = studioSongs.find((candidate) => candidate.id === linkedId);
    if (linked) return linked;
  }
  return studioSongs.find((candidate) => candidate.title?.trim().toLowerCase() === song?.title?.trim().toLowerCase()) || null;
}

function findSlideSongForLineupItem(item, song, studioSongs) {
  return localSlideSongForLineupItem(item) || findGlobalSlideSongForLineupItem(item, song, studioSongs);
}

function slidesContextForLineup(lineupId) {
  const item = state.lineup.find((candidate) => candidate.id === lineupId);
  if (!item || !["song", "slide"].includes(item.type)) return null;
  const song = item.type === "slide" ? slideOnlySongForItem(item) : songForLineupItem(item);
  if (!song) return null;
  const studioData = loadStudioData();
  const scope = item.type === "slide" ? "local" : item.slideSaveScope === "local" ? "local" : "global";
  const globalSlideSong = item.type === "slide" ? null : findGlobalSlideSongForLineupItem(item, song, studioData.songs);
  const localSlideSong = localSlideSongForLineupItem(item);
  const slideSong = scope === "local" ? localSlideSong : globalSlideSong;
  return { item, song, studioData, scope, slideSong, globalSlideSong, localSlideSong };
}

function splitLyricsToSlides(text) {
  const blocks = String(text || "")
    .replace(/\r/g, "")
    .split(/\n\s*\n/g)
    .map((block) => block.split("\n").map((line) => line.trim()).filter(Boolean))
    .filter((lines) => lines.length);

  if (!blocks.length) return [];
  if (blocks.length === 1 && blocks[0].length > 4) {
    const chunks = [];
    for (let index = 0; index < blocks[0].length; index += 4) {
      chunks.push({ lines: blocks[0].slice(index, index + 4) });
    }
    return chunks;
  }
  return blocks.map((lines) => ({ lines }));
}

function normalizeSlidesDraft(slides) {
  const normalized = (Array.isArray(slides) ? slides : [])
    .map((slide) => {
      const lines = (Array.isArray(slide?.lines) ? slide.lines : String(slide?.text || "").split(/\r?\n/))
        .map((line) => String(line || "").trim())
        .filter(Boolean);
      return { lines: lines.length ? lines : [""] };
    });
  return normalized.length ? normalized : [];
}

function slidesEditorDisplayFontSize(fontSize, lines = []) {
  const rawSize = Number(fontSize) || defaultSlideDesign.fontSize;
  const previewLines = (Array.isArray(lines) ? lines : [])
    .map((line) => String(line || "").trim())
    .filter(Boolean);
  const previewArea = slidesEditorFitArea();
  const previewFit = previewLines.length
    ? bestSlidesEditorFontForLines(previewLines, previewArea.width, previewArea.height)
    : rawSize;
  if (window.matchMedia("(min-width: 761px) and (max-width: 1200px) and (orientation: landscape)").matches) {
    return Math.round(clampNumber(Math.min(rawSize, previewFit), minimumSlideEditorFontSize, 44));
  }
  return Math.round(clampNumber(Math.min(rawSize, previewFit), minimumSlideEditorFontSize, maxSlideEditorFontSize));
}

function slidesFromStudioSong(slideSong) {
  if (!slideSong) return [];
  return normalizeSlidesDraft(buildSlidesFromStudioSong(slideSong).map((slide) => ({ lines: slide.lines || [] })));
}

function slideDesignFromStudioSong(slideSong) {
  const design = slideSong?.design || {};
  const theme = slideThemeOptions.some((option) => option.id === design.theme) ? design.theme : defaultSlideDesign.theme;
  const fontSize = clampNumber(Number(design.fontSize) || defaultSlideDesign.fontSize, minimumSlideEditorFontSize, maxSlideEditorFontSize);
  return { theme, fontSize };
}

function studioSongFromSlides(song, slides, existingSlideSong = null, design = defaultSlideDesign) {
  const normalizedSlides = normalizeSlidesDraft(slides);
  const sectionId = existingSlideSong?.sections?.[0]?.id || makeId("section");
  const flowId = existingSlideSong?.savedFlows?.[0]?.id || makeId("flow");
  const lines = [];
  const lineBreaksAfter = [];

  normalizedSlides.forEach((slide, slideIndex) => {
    slide.lines.forEach((line) => lines.push(line));
    if (slideIndex < normalizedSlides.length - 1 && lines.length) {
      lineBreaksAfter.push(lines.length - 1);
    }
  });

  const safeLines = lines.length ? lines : [""];
  return {
    ...(existingSlideSong || {}),
    id: existingSlideSong?.id || makeId("slide-song"),
    title: song?.title || existingSlideSong?.title || "Untitled",
    updatedAt: new Date().toISOString(),
    design: {
      theme: slideThemeOptions.some((option) => option.id === design.theme) ? design.theme : defaultSlideDesign.theme,
      fontSize: clampNumber(Number(design.fontSize) || defaultSlideDesign.fontSize, minimumSlideEditorFontSize, maxSlideEditorFontSize),
    },
    sections: [{
      id: sectionId,
      name: "Lyrics",
      order: 0,
      hidden: false,
      lines: safeLines,
      lineBreaksAfter,
    }],
    savedFlows: [{
      id: flowId,
      name: "Default",
      selectedSectionInstances: [{
        id: "lineup-slides-flow",
        sectionId,
        label: "Lyrics",
        selectedLineIndexes: safeLines.map((_, index) => index),
      }],
      slideBreaks: [],
    }],
  };
}

function syncSlidesEditorToStorage() {
  if (!activeSlidesContext?.lineupId) return null;
  const context = slidesContextForLineup(activeSlidesContext.lineupId);
  if (!context) return null;
  const scope = activeSlidesContext.scope === "local" ? "local" : "global";
  context.item.slideSaveScope = scope;
  const existingSlideSong = scope === "local" ? context.localSlideSong : context.globalSlideSong;
  const slideSong = studioSongFromSlides(context.song, activeSlidesDraft, existingSlideSong, activeSlidesDesign);
  const flowId = slideSong.savedFlows?.[0]?.id || "";

  if (scope === "local") {
    slideSong.id = existingSlideSong?.id || `local-slide-song-${context.item.id}`;
    context.item.localSlideSong = slideSong;
    context.item.slideFlowId = flowId;
    context.item.slidesStatus = activeSlidesDraft.length ? "slides-ready" : "no-slides";
    saveState();
    renderLineup();
    renderSongBank();
    if (slidePreviewOpen) renderSlidePreview();
    return slideSong;
  }

  const nextStudioSongs = Array.isArray(context.studioData.songs) ? [...context.studioData.songs] : [];
  const existingIndex = nextStudioSongs.findIndex((candidate) => candidate.id === slideSong.id);
  if (existingIndex >= 0) nextStudioSongs[existingIndex] = slideSong;
  else nextStudioSongs.unshift(slideSong);

  saveStudioData({ ...context.studioData, songs: nextStudioSongs });

  context.item.slideSongId = slideSong.id;
  context.item.slideFlowId = flowId;
  context.song.slideSongId = slideSong.id;
  context.song.slideFlowId = flowId;
  context.item.slidesStatus = activeSlidesDraft.length ? "slides-ready" : "no-slides";
  context.song.slidesStatus = context.item.slidesStatus;
  saveState();
  renderLineup();
  renderSongBank();
  if (slidePreviewOpen) renderSlidePreview();
  return slideSong;
}

function setActiveSlidesStatus(status) {
  if (!activeSlidesContext?.lineupId) return;
  const context = slidesContextForLineup(activeSlidesContext.lineupId);
  if (!context) return;
  context.item.slidesStatus = status;
  if ((activeSlidesContext.scope || context.scope) !== "local") {
    context.song.slidesStatus = status;
  }
  saveState();
  renderLineup();
  renderSongBank();
  renderSlidesEditor(true);
}

function openSlidesEditorForLineup(lineupId) {
  const context = slidesContextForLineup(lineupId);
  if (!context) return;
  activeSlidesContext = { lineupId, songId: context.song.id, scope: context.scope };
  activeSlidesDraft = slidesFromStudioSong(context.slideSong);
  activeSlidesDesign = slideDesignFromStudioSong(context.slideSong);
  activeSlidesIndex = 0;
  activeSlidesUndoStack = [];
  activeSlidesRedoStack = [];

  if (context.scope !== "local" && context.slideSong && !context.item.slideSongId) {
    context.item.slideSongId = context.slideSong.id;
    context.item.slideFlowId = context.slideSong.savedFlows?.[0]?.id || "";
    context.item.slidesStatus = "slides-ready";
    context.song.slideSongId = context.slideSong.id;
    context.song.slideFlowId = context.item.slideFlowId;
    context.song.slidesStatus = context.item.slidesStatus;
    saveState();
    renderLineup();
    renderSongBank();
  }

  if (els.slidesFullLyrics) els.slidesFullLyrics.value = "";
  activeSlidesSetupMode = !activeSlidesDraft.length;
  if (els.slidesSaveScopeSelect) els.slidesSaveScopeSelect.value = activeSlidesContext.scope;
  renderSlidesEditor();
  openDialog(els.slidesEditorDialog);
  window.setTimeout(() => {
    if (isMobileLayout()) return;
    if (activeSlidesDraft.length) els.slidesCurrentText?.focus();
    else els.slidesFullLyrics?.focus();
  }, 50);
}

function closeSlidesEditor(showSavedToast = false) {
  if (activeSlidesContext?.lineupId && activeSlidesDraft.length) {
    syncSlidesEditorToStorage(false);
  }
  closeDialog(els.slidesEditorDialog);
  activeSlidesContext = null;
  activeSlidesDraft = [];
  activeSlidesSetupMode = false;
  activeSlidesUndoStack = [];
  activeSlidesRedoStack = [];
  if (showSavedToast) toast("Progress has been saved.");
}

function setSlidesSaveScope(scope) {
  if (!activeSlidesContext?.lineupId) return;
  const context = slidesContextForLineup(activeSlidesContext.lineupId);
  if (!context) return;
  if (context.item.type === "slide") {
    activeSlidesContext.scope = "local";
    context.item.slideSaveScope = "local";
    renderSlidesEditor(true);
    return;
  }
  const nextScope = scope === "local" ? "local" : "global";
  if (activeSlidesContext.scope === nextScope) return;
  activeSlidesContext.scope = nextScope;
  context.item.slideSaveScope = nextScope;
  syncSlidesEditorToStorage(true);
  renderSlidesEditor(true);
  toast(nextScope === "local" ? "Slide edits will stay on this setlist." : "Slide edits will update the song bank.");
}

function activeSlidesSnapshot() {
  return {
    draft: cloneData(activeSlidesDraft),
    index: activeSlidesIndex,
    design: cloneData(activeSlidesDesign),
  };
}

function recordSlidesUndo() {
  if (restoringSlidesHistory) return;
  pushHistorySnapshot(activeSlidesUndoStack, activeSlidesSnapshot());
  activeSlidesRedoStack = [];
}

function restoreSlidesSnapshot(snapshot) {
  restoringSlidesHistory = true;
  activeSlidesDraft = cloneData(snapshot.draft || []);
  activeSlidesIndex = clampNumber(Number(snapshot.index) || 0, 0, Math.max(activeSlidesDraft.length - 1, 0));
  activeSlidesDesign = { ...defaultSlideDesign, ...(snapshot.design || {}) };
  syncSlidesEditorToStorage(true);
  renderSlidesEditor();
  restoringSlidesHistory = false;
}

function undoSlidesEditor() {
  if (!activeSlidesUndoStack.length) {
    toast("Nothing to undo.");
    return;
  }
  activeSlidesRedoStack.push(activeSlidesSnapshot());
  restoreSlidesSnapshot(activeSlidesUndoStack.pop());
  toast("Slide edit undone.");
}

function redoSlidesEditor() {
  if (!activeSlidesRedoStack.length) {
    toast("Nothing to redo.");
    return;
  }
  activeSlidesUndoStack.push(activeSlidesSnapshot());
  restoreSlidesSnapshot(activeSlidesRedoStack.pop());
  toast("Slide edit redone.");
}

function renderSlidesEditor(preserveCurrentText = false) {
  const context = activeSlidesContext?.lineupId ? slidesContextForLineup(activeSlidesContext.lineupId) : null;
  if (!context) return;
  const hasSlides = activeSlidesDraft.length > 0;
  const status = context.item.slidesStatus || "no-slides";
  const statusClass = slidesStatusClass(status);
  const isSlideOnly = context.item.type === "slide";

  if (els.slidesEditorTitle) els.slidesEditorTitle.textContent = context.song.title || "Song Slides";
  if (els.slidesSetupTitle) els.slidesSetupTitle.textContent = `Create slides for "${context.song.title || "this song"}"`;
  if (els.slidesSaveScopeSelect) {
    els.slidesSaveScopeSelect.value = isSlideOnly ? "local" : activeSlidesContext?.scope || context.scope || "global";
    els.slidesSaveScopeSelect.disabled = isSlideOnly;
    els.slidesSaveScopeSelect.title = isSlideOnly ? "Slide-only items save with this setlist." : "";
  }
  if (els.slidesEditorStatus) {
    els.slidesEditorStatus.textContent = slidesStatusLabel(hasSlides ? status : "no-slides");
    els.slidesEditorStatus.className = `slides-editor-status ${statusClass}`;
  }
  const showSetupView = activeSlidesSetupMode || !hasSlides;
  if (els.slidesSetupView) els.slidesSetupView.hidden = !showSetupView;
  if (els.slidesWorkspaceView) els.slidesWorkspaceView.hidden = showSetupView || !hasSlides;
  if (els.slidesEditorPreviewButton) els.slidesEditorPreviewButton.disabled = !hasSlides;
  if (els.slidesEditorPresentButton) els.slidesEditorPresentButton.disabled = !hasSlides;
  if (els.slidesEditorReadyButton) {
    els.slidesEditorReadyButton.disabled = !hasSlides;
    els.slidesEditorReadyButton.querySelector("span").textContent = "Save";
  }
  if (els.slidesCreateButton) {
    els.slidesCreateButton.querySelector("span").textContent = hasSlides ? "Update slides" : "Create slides";
  }

  if (!hasSlides) return;

  activeSlidesDraft = normalizeSlidesDraft(activeSlidesDraft);
  activeSlidesIndex = clampNumber(activeSlidesIndex, 0, Math.max(activeSlidesDraft.length - 1, 0));
  const activeSlide = activeSlidesDraft[activeSlidesIndex] || { lines: [""] };
  const currentLines = activeSlide.lines.filter(Boolean);
  const previewLines = currentLines.length ? currentLines : ["Instrumental"];

  if (els.slidesEditorList) {
    els.slidesEditorList.innerHTML = activeSlidesDraft.map((slide, index) => {
      const lines = slide.lines.filter(Boolean);
      const preview = lines[0] || "Instrumental";
      return `
        <button class="slides-list-item ${index === activeSlidesIndex ? "active" : ""}" type="button" data-slide-index="${index}">
          <span>${index + 1}</span>
          <strong>${escapeHtml(preview)}</strong>
          <small>${lines.length || 1} line${(lines.length || 1) === 1 ? "" : "s"}</small>
        </button>
      `;
    }).join("");
  }

  if (els.slidesLivePreview) {
    els.slidesLivePreview.className = `slides-live-preview theme-${activeSlidesDesign.theme}`;
    els.slidesLivePreview.style.setProperty("--slide-editor-font-size", `${activeSlidesDesign.fontSize}px`);
    els.slidesLivePreview.style.setProperty("--slide-editor-display-font-size", `${slidesEditorDisplayFontSize(activeSlidesDesign.fontSize, previewLines)}px`);
    els.slidesLivePreview.innerHTML = `
      <div class="slides-live-lines">
        ${previewLines.slice(0, 6).map((line) => `<span>${escapeHtml(line)}</span>`).join("")}
      </div>
      <small>Created with LINEUP / Songleading.net</small>
    `;
  }

  if (els.slidesCurrentLabel) {
    els.slidesCurrentLabel.textContent = `Slide ${activeSlidesIndex + 1} lyrics`;
  }
  if (els.slidesCurrentText && (!preserveCurrentText || document.activeElement !== els.slidesCurrentText)) {
    els.slidesCurrentText.value = activeSlide.lines.join("\n");
  }
  if (els.slidesFontSizeValue) els.slidesFontSizeValue.textContent = String(activeSlidesDesign.fontSize);
  if (els.slidesThemeButtons) {
    els.slidesThemeButtons.innerHTML = slideThemeOptions.map((option) => `
      <button class="slides-theme-swatch ${option.id === activeSlidesDesign.theme ? "active" : ""} theme-${option.id}" type="button" data-slide-theme="${option.id}" role="radio" aria-checked="${option.id === activeSlidesDesign.theme}">
        <span></span>
        ${escapeHtml(option.label)}
      </button>
    `).join("");
  }

  const isFirst = activeSlidesIndex <= 0;
  const isLast = activeSlidesIndex >= activeSlidesDraft.length - 1;
  if (els.slidesUndoButton) els.slidesUndoButton.disabled = !activeSlidesUndoStack.length;
  if (els.slidesRedoButton) els.slidesRedoButton.disabled = !activeSlidesRedoStack.length;
  if (els.slidesMoveUpButton) els.slidesMoveUpButton.disabled = isFirst;
  if (els.slidesMoveDownButton) els.slidesMoveDownButton.disabled = isLast;
  if (els.slidesSplitButton) els.slidesSplitButton.disabled = !activeSlidesDraft.length;
  if (els.slidesSentencePreviousButton) els.slidesSentencePreviousButton.disabled = !activeSlidesDraft.length;
  if (els.slidesSentenceNextButton) els.slidesSentenceNextButton.disabled = !activeSlidesDraft.length;
  if (els.slidesJoinPreviousButton) els.slidesJoinPreviousButton.disabled = isFirst;
  if (els.slidesJoinNextButton) els.slidesJoinNextButton.disabled = isLast;
  if (els.slidesDeleteButton) els.slidesDeleteButton.disabled = activeSlidesDraft.length <= 1;
}

function createSlidesFromPastedLyrics() {
  const slides = splitLyricsToSlides(els.slidesFullLyrics?.value || "");
  if (!slides.length) {
    toast("Paste lyrics first.");
    els.slidesFullLyrics?.focus();
    return;
  }
  recordSlidesUndo();
  activeSlidesDraft = normalizeSlidesDraft(slides);
  activeSlidesIndex = 0;
  activeSlidesSetupMode = false;
  syncSlidesEditorToStorage(true);
  renderSlidesEditor();
  fitSlidesEditorDraftToScreen({ announce: false, record: false });
  els.slidesCurrentText?.focus();
  toast("Slides saved for this song.");
}

function slidesDraftToFullLyrics(slides = activeSlidesDraft) {
  return normalizeSlidesDraft(slides)
    .map((slide) => slide.lines.filter(Boolean).join("\n"))
    .join("\n\n");
}

function editSlidesFullLyrics() {
  if (!activeSlidesDraft.length) return;
  activeSlidesSetupMode = true;
  if (els.slidesFullLyrics) {
    els.slidesFullLyrics.value = slidesDraftToFullLyrics();
  }
  renderSlidesEditor(true);
  window.setTimeout(() => {
    els.slidesFullLyrics?.focus();
  }, 0);
}

function fillSlidesFromSongNotes() {
  const context = activeSlidesContext?.lineupId ? slidesContextForLineup(activeSlidesContext.lineupId) : null;
  const notes = context?.song?.notes || "";
  if (!notes.trim()) {
    toast("This song does not have notes to use.");
    return;
  }
  if (els.slidesFullLyrics) {
    els.slidesFullLyrics.value = notes.trim();
    els.slidesFullLyrics.focus();
  }
}

function updateCurrentSlideText() {
  if (!activeSlidesDraft.length) return;
  const lines = String(els.slidesCurrentText?.value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const nextLines = lines.length ? lines : [""];
  if (JSON.stringify(activeSlidesDraft[activeSlidesIndex]?.lines || []) === JSON.stringify(nextLines)) return;
  recordSlidesUndo();
  activeSlidesDraft[activeSlidesIndex] = { lines: nextLines };
  syncSlidesEditorToStorage(true);
  renderSlidesEditor(true);
}

function selectSlidesEditorSlide(index) {
  if (!activeSlidesDraft.length) return;
  activeSlidesIndex = clampNumber(Number(index) || 0, 0, activeSlidesDraft.length - 1);
  renderSlidesEditor();
}

function addSlidesEditorSlide() {
  const insertAt = activeSlidesDraft.length ? activeSlidesIndex + 1 : 0;
  recordSlidesUndo();
  activeSlidesDraft.splice(insertAt, 0, { lines: ["New lyric line"] });
  activeSlidesIndex = insertAt;
  syncSlidesEditorToStorage(true);
  renderSlidesEditor();
  els.slidesCurrentText?.focus();
  els.slidesCurrentText?.select();
}

function duplicateSlidesEditorSlide() {
  if (!activeSlidesDraft.length) return;
  recordSlidesUndo();
  const copy = { lines: [...activeSlidesDraft[activeSlidesIndex].lines] };
  activeSlidesDraft.splice(activeSlidesIndex + 1, 0, copy);
  activeSlidesIndex += 1;
  syncSlidesEditorToStorage(true);
  renderSlidesEditor();
}

function deleteSlidesEditorSlide() {
  if (activeSlidesDraft.length <= 1) return;
  recordSlidesUndo();
  activeSlidesDraft.splice(activeSlidesIndex, 1);
  activeSlidesIndex = Math.min(activeSlidesIndex, activeSlidesDraft.length - 1);
  syncSlidesEditorToStorage(true);
  renderSlidesEditor();
}

function moveSlidesEditorSlide(offset) {
  const nextIndex = activeSlidesIndex + offset;
  if (nextIndex < 0 || nextIndex >= activeSlidesDraft.length) return;
  recordSlidesUndo();
  const [slide] = activeSlidesDraft.splice(activeSlidesIndex, 1);
  activeSlidesDraft.splice(nextIndex, 0, slide);
  activeSlidesIndex = nextIndex;
  syncSlidesEditorToStorage(true);
  renderSlidesEditor();
}

function joinSlidesEditorSlide(direction) {
  if (!activeSlidesDraft.length) return;
  const targetIndex = direction === "previous" ? activeSlidesIndex - 1 : activeSlidesIndex + 1;
  if (targetIndex < 0 || targetIndex >= activeSlidesDraft.length) return;
  recordSlidesUndo();
  if (direction === "previous") {
    activeSlidesDraft[targetIndex].lines = [
      ...activeSlidesDraft[targetIndex].lines.filter(Boolean),
      ...activeSlidesDraft[activeSlidesIndex].lines.filter(Boolean),
    ];
    activeSlidesDraft.splice(activeSlidesIndex, 1);
    activeSlidesIndex = targetIndex;
  } else {
    activeSlidesDraft[activeSlidesIndex].lines = [
      ...activeSlidesDraft[activeSlidesIndex].lines.filter(Boolean),
      ...activeSlidesDraft[targetIndex].lines.filter(Boolean),
    ];
    activeSlidesDraft.splice(targetIndex, 1);
  }
  syncSlidesEditorToStorage(true);
  renderSlidesEditor();
}

function selectedSlideLineIndexes(text, selectionStart, selectionEnd) {
  const lines = String(text || "").split(/\r?\n/);
  const indexes = [];
  let cursor = 0;
  const hasRange = selectionEnd > selectionStart;

  lines.forEach((line, index) => {
    const lineStart = cursor;
    const lineEnd = cursor + line.length;
    const nextCursor = lineEnd + 1;
    const overlapsRange = hasRange && selectionStart < nextCursor && selectionEnd > lineStart;
    const containsCursor = !hasRange && selectionStart >= lineStart && selectionStart <= lineEnd;
    if ((overlapsRange || containsCursor) && line.trim()) indexes.push(index);
    cursor = nextCursor;
  });

  return indexes.length ? indexes : lines.map((line, index) => line.trim() ? index : -1).filter((index) => index >= 0).slice(0, 1);
}

function moveSlidesEditorLine(direction) {
  if (!activeSlidesDraft.length) return;
  const textarea = els.slidesCurrentText;
  const currentText = String(textarea?.value || activeSlidesDraft[activeSlidesIndex].lines.join("\n"));
  const rawLines = currentText.split(/\r?\n/);
  const selectionStart = textarea?.selectionStart ?? 0;
  const selectionEnd = textarea?.selectionEnd ?? selectionStart;
  const selectedIndexes = new Set(selectedSlideLineIndexes(currentText, selectionStart, selectionEnd));
  const movingLines = rawLines.filter((line, index) => selectedIndexes.has(index) && line.trim()).map((line) => line.trim());

  if (!movingLines.length) {
    toast("Place the cursor on a lyric line first.");
    return;
  }

  recordSlidesUndo();

  const remainingLines = rawLines.filter((line, index) => !selectedIndexes.has(index) && line.trim()).map((line) => line.trim());
  activeSlidesDraft[activeSlidesIndex] = { lines: remainingLines.length ? remainingLines : [""] };

  let destinationIndex;
  if (direction === "previous") {
    if (activeSlidesIndex === 0) {
      activeSlidesDraft.splice(0, 0, { lines: [] });
      activeSlidesIndex += 1;
    }
    destinationIndex = activeSlidesIndex - 1;
    activeSlidesDraft[destinationIndex].lines = [
      ...(activeSlidesDraft[destinationIndex].lines || []).filter(Boolean),
      ...movingLines,
    ];
  } else {
    if (activeSlidesIndex === activeSlidesDraft.length - 1) {
      activeSlidesDraft.splice(activeSlidesIndex + 1, 0, { lines: [] });
    }
    destinationIndex = activeSlidesIndex + 1;
    activeSlidesDraft[destinationIndex].lines = [
      ...movingLines,
      ...(activeSlidesDraft[destinationIndex].lines || []).filter(Boolean),
    ];
  }

  activeSlidesIndex = destinationIndex;
  syncSlidesEditorToStorage(true);
  renderSlidesEditor();
  els.slidesCurrentText?.focus();
  toast(direction === "previous" ? "Line moved to previous slide." : "Line moved to next slide.");
}

function splitSlidesEditorSlide() {
  if (!activeSlidesDraft.length) return;
  const currentText = String(els.slidesCurrentText?.value || activeSlidesDraft[activeSlidesIndex].lines.join("\n"));
  const selectionStart = els.slidesCurrentText?.selectionStart ?? -1;
  const selectionEnd = els.slidesCurrentText?.selectionEnd ?? selectionStart;
  let firstLines = [];
  let secondLines = [];

  if (selectionStart > 0 && selectionStart < currentText.length && selectionStart === selectionEnd) {
    firstLines = currentText.slice(0, selectionStart).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    secondLines = currentText.slice(selectionStart).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  }

  if (!firstLines.length || !secondLines.length) {
    const lines = activeSlidesDraft[activeSlidesIndex].lines.map((line) => line.trim()).filter(Boolean);
    if (lines.length < 2) {
      toast("Add another line or place the cursor where the split should happen.");
      return;
    }
    const splitAt = Math.ceil(lines.length / 2);
    firstLines = lines.slice(0, splitAt);
    secondLines = lines.slice(splitAt);
  }

  recordSlidesUndo();
  activeSlidesDraft[activeSlidesIndex] = { lines: firstLines };
  activeSlidesDraft.splice(activeSlidesIndex + 1, 0, { lines: secondLines });
  activeSlidesIndex += 1;
  syncSlidesEditorToStorage(true);
  renderSlidesEditor();
  els.slidesCurrentText?.focus();
  toast("Slide split into two.");
}

function changeSlidesEditorFont(delta) {
  const nextSize = clampNumber((Number(activeSlidesDesign.fontSize) || defaultSlideDesign.fontSize) + delta, minimumSlideEditorFontSize, maxSlideEditorFontSize);
  if (nextSize === activeSlidesDesign.fontSize) return;
  recordSlidesUndo();
  activeSlidesDesign.fontSize = nextSize;
  syncSlidesEditorToStorage(true);
  renderSlidesEditor(true);
}

function wrappedLineCount(context, text, maxWidth) {
  const value = String(text || "").trim();
  if (!value) return 1;
  const words = value.split(/\s+/).filter(Boolean);
  let lines = 1;
  let current = "";

  const appendToken = (token) => {
    const next = current ? `${current} ${token}` : token;
    if (context.measureText(next).width <= maxWidth) {
      current = next;
      return;
    }

    if (current) lines += 1;
    current = "";

    if (context.measureText(token).width <= maxWidth) {
      current = token;
      return;
    }

    let fragment = "";
    Array.from(token).forEach((character) => {
      const candidate = `${fragment}${character}`;
      if (fragment && context.measureText(candidate).width > maxWidth) {
        lines += 1;
        fragment = character;
      } else {
        fragment = candidate;
      }
    });
    current = fragment;
  };

  words.forEach(appendToken);
  return lines;
}

function slideTextFitsAtSize(lines, fontSize, availableWidth, availableHeight) {
  const canvas = slideTextFitsAtSize.canvas || (slideTextFitsAtSize.canvas = document.createElement("canvas"));
  const context = canvas.getContext("2d");
  if (!context) return true;
  context.font = `${slideTextWeight} ${fontSize}px Inter, Arial, Helvetica, sans-serif`;
  const cleanedLines = lines.map((line) => String(line || "").trim()).filter(Boolean);
  const lineCount = Math.max(1, cleanedLines.length);
  const widest = cleanedLines.reduce((max, line) => Math.max(max, context.measureText(line).width), 0);
  const lineHeight = fontSize * 1.08;
  const gapHeight = Math.max(0, lineCount - 1) * fontSize * 0.18;
  const totalHeight = lineCount * lineHeight + gapHeight;
  return widest <= availableWidth && totalHeight <= Math.max(0, availableHeight - slideEditorFitSafetyPadding);
}

function slidesEditorFitArea() {
  const preview = els.slidesLivePreview;
  const previewRect = preview?.getBoundingClientRect();
  const computed = preview ? window.getComputedStyle(preview) : null;
  const paddingX = computed ? parseFloat(computed.paddingLeft) + parseFloat(computed.paddingRight) : 96;
  const paddingY = computed ? parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom) : 96;
  const watermarkReserve = Math.max(42, Math.min(74, (previewRect?.height || 540) * 0.11));
  return {
    width: Math.max(120, (previewRect?.width || 960) - paddingX - 24),
    height: Math.max(90, (previewRect?.height || 540) - paddingY - watermarkReserve)
  };
}

function slidesOutputFitArea() {
  const width = 1920;
  const height = 1080;
  const safeTop = 32;
  const safeBottom = height - 36;
  return {
    width: width * 0.98,
    height: Math.max(220, safeBottom - safeTop)
  };
}

function bestSlidesEditorFontForLines(lines, availableWidth, availableHeight) {
  let low = minimumSlideEditorFontSize;
  let high = maxSlideEditorFontSize;
  let best = minimumSlideEditorFontSize;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if (slideTextFitsAtSize(lines, middle, availableWidth, availableHeight)) {
      best = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  return best;
}

function fitSlidesEditorDraftToScreen({ announce = true, record = true } = {}) {
  if (!activeSlidesDraft.length) return false;
  const { width, height } = slidesOutputFitArea();
  const nextSize = activeSlidesDraft.reduce((best, slide) => {
    const lines = slide?.lines?.filter(Boolean) || [""];
    return Math.min(best, bestSlidesEditorFontForLines(lines, width, height));
  }, maxSlideEditorFontSize);
  const clampedSize = Math.round(clampNumber(nextSize, minimumSlideEditorFontSize, maxSlideEditorFontSize));
  if (clampedSize === activeSlidesDesign.fontSize) return false;
  if (record) recordSlidesUndo();
  activeSlidesDesign.fontSize = clampedSize;
  syncSlidesEditorToStorage(true);
  renderSlidesEditor(true);
  if (announce) toast("Text fitted to the slide.");
  return true;
}

function fitSlidesEditorFontToScreen() {
  fitSlidesEditorDraftToScreen();
}

function setSlidesEditorTheme(theme) {
  if (!slideThemeOptions.some((option) => option.id === theme)) return;
  if (activeSlidesDesign.theme === theme) return;
  recordSlidesUndo();
  activeSlidesDesign.theme = theme;
  syncSlidesEditorToStorage(true);
  renderSlidesEditor(true);
}

function markSlidesEditorReady() {
  if (!activeSlidesDraft.length) return;
  syncSlidesEditorToStorage(false);
  setActiveSlidesStatus("slides-ready");
  toast("Slides saved.");
}

function previewSlidesEditorSet() {
  if (!activeSlidesDraft.length) return;
  syncSlidesEditorToStorage(false);
  closeSlidesEditor();
  activeSlidePreviewIndex = 0;
  setSlidePreviewOpen(true);
}

function presentSlidesEditorFullscreen() {
  if (!activeSlidesDraft.length) return;
  syncSlidesEditorToStorage(false);
  closeSlidesEditor();
  openPresentation({ requestFullscreen: true }).catch((error) => toast(error instanceof Error ? error.message : "Could not open presentation."));
}

function flattenStudioFlow(sections = [], flow = []) {
  const sortedSections = [...sections].filter((section) => !section.hidden).sort((a, b) => (a.order || 0) - (b.order || 0));
  const selectedFlow = Array.isArray(flow) && flow.length
    ? flow
    : sortedSections.map((section, index) => ({
        id: `export-instance-${index}`,
        sectionId: section.id,
        label: section.name,
        selectedLineIndexes: section.lines?.map((_, lineIndex) => lineIndex) || [],
      }));

  return selectedFlow.flatMap((instance) => {
    const section = sections.find((candidate) => candidate.id === instance.sectionId);
    if (!section) return [];
    const indexes = Array.isArray(instance.selectedLineIndexes) && instance.selectedLineIndexes.length
      ? instance.selectedLineIndexes
      : section.lines?.map((_, lineIndex) => lineIndex) || [];
    return indexes
      .filter((lineIndex) => section.lines?.[lineIndex] !== undefined)
      .map((lineIndex) => ({
        id: `${instance.id}:${lineIndex}`,
        text: section.lines[lineIndex],
        sectionName: section.name || instance.label || "",
        sectionId: section.id,
        lineIndex,
      }));
  });
}

function buildSlidesFromStudioSong(slideSong, flowId = "") {
  const sections = Array.isArray(slideSong?.sections) ? slideSong.sections : [];
  const savedFlows = Array.isArray(slideSong?.savedFlows) ? slideSong.savedFlows : [];
  const flow = savedFlows.find((candidate) => candidate.id === flowId) || savedFlows[0] || null;
  const lines = flattenStudioFlow(sections, flow?.selectedSectionInstances || []);
  const manualBreaks = Array.isArray(flow?.slideBreaks) ? flow.slideBreaks : [];
  const slides = [];
  let current = [];

  lines.forEach((line, index) => {
    const previous = lines[index - 1];
    const section = sections.find((candidate) => candidate.id === previous?.sectionId);
    const naturalBreak = Boolean(section?.lineBreaksAfter?.includes(previous?.lineIndex));
    const forcedBreak = manualBreaks.includes(line.id);
    const sectionChanged = previous && previous.sectionId !== line.sectionId;
    const textCrowded = previous && previous.text.length + line.text.length > 82;
    if (current.length && (forcedBreak || naturalBreak || current.length >= 4 || (current.length >= 2 && (sectionChanged || textCrowded)))) {
      slides.push(current);
      current = [];
    }
    current.push(line);
  });
  if (current.length) slides.push(current);

  return slides.map((slideLines, index) => ({
    id: `${slideSong.id || "song"}-${index}`,
    title: slideSong.title || "Untitled",
    section: Array.from(new Set(slideLines.map((line) => line.sectionName).filter(Boolean))).join(" / "),
    lines: slideLines.map((line) => line.text),
    design: slideDesignFromStudioSong(slideSong),
  }));
}

function buildLineupSlideDeck() {
  const studioData = loadStudioData();
  const slides = [];
  state.lineup.forEach((item, index) => {
    if (item.type === "note") {
      if (item.text?.trim()) {
        slides.push({
          kind: "note",
          title: "Note",
          lines: [item.text.trim()],
          credits: "",
          meta: `${index + 1}`,
        });
      }
      return;
    }

    if (item.type === "slide") {
      const title = item.title || "Slide only";
      if (item.image) {
        slides.push({
          kind: "image",
          title,
          image: item.image,
          lines: [],
          credits: "",
          meta: `${index + 1} · slide only`,
        });
      }

      const slideSong = localSlideSongForLineupItem(item);
      const slideOnlySlides = slideSong ? buildSlidesFromStudioSong(slideSong, item.slideFlowId) : [];
      if (slideOnlySlides.length) {
        slideOnlySlides.forEach((slide, slideIndex) => {
          slides.push({
            ...slide,
            kind: "lyrics",
            credits: "",
            meta: `${index + 1} · slide only${slide.section ? ` · ${slide.section}` : ""}${slideOnlySlides.length > 1 ? ` · ${slideIndex + 1}/${slideOnlySlides.length}` : ""}`,
          });
        });
        return;
      }

      if (!item.image) {
        slides.push({
          kind: "missing",
          title,
          lines: ["Slide only - Not on the setlist!"],
          credits: "",
          meta: `${index + 1} · slide only`,
        });
      }
      return;
    }

    const song = songForLineupItem(item);
    if (!song) return;
    const slideSong = findSlideSongForLineupItem(item, song, studioData.songs);
    const songSlides = slideSong ? buildSlidesFromStudioSong(slideSong, item.slideFlowId) : [];

    if (songSlides.length) {
      songSlides.forEach((slide, slideIndex) => {
        slides.push({
          ...slide,
          kind: "lyrics",
          credits: song.credits || "",
          meta: `${index + 1}${slide.section ? ` · ${slide.section}` : ""}${songSlides.length > 1 ? ` · ${slideIndex + 1}/${songSlides.length}` : ""}`,
        });
      });
      return;
    }

    slides.push({
      kind: "missing",
      title: song.title,
      lines: ["Slides not connected yet"],
      credits: song.credits || "",
      meta: `${index + 1}`,
    });
  });
  return slides;
}

function setSlidePreviewOpen(open) {
  slidePreviewOpen = Boolean(open);
  els.showPanel?.classList.toggle("slide-preview-open", slidePreviewOpen);
  if (els.slidePreviewPanel) {
    els.slidePreviewPanel.hidden = !slidePreviewOpen;
  }
  if (els.slidePreviewToggle) {
    els.slidePreviewToggle.classList.toggle("is-active", slidePreviewOpen);
    els.slidePreviewToggle.setAttribute("aria-pressed", String(slidePreviewOpen));
    els.slidePreviewToggle.title = slidePreviewOpen ? "Hide slide preview" : "Show slide preview";
    els.slidePreviewToggle.setAttribute("aria-label", slidePreviewOpen ? "Hide slide preview" : "Show slide preview");
  }
  if (slidePreviewOpen) renderSlidePreview();
}

function renderSlidePreview() {
  if (!els.slidePreviewStage) return;
  const slides = buildLineupSlideDeck();
  const total = slides.length;
  activeSlidePreviewIndex = Math.max(0, Math.min(activeSlidePreviewIndex, Math.max(total - 1, 0)));

  if (!total) {
    els.slidePreviewStage.innerHTML = `
      <div class="mini-slide empty">
        <strong>No slides yet</strong>
        <div class="mini-slide-lines">
          <span>Add songs to this setlist, then connect slides from the Slides button.</span>
        </div>
      </div>
    `;
    if (els.slidePreviewCount) els.slidePreviewCount.textContent = "0 / 0";
    if (els.prevSlidePreviewButton) els.prevSlidePreviewButton.disabled = true;
    if (els.nextSlidePreviewButton) els.nextSlidePreviewButton.disabled = true;
    return;
  }

  const slide = slides[activeSlidePreviewIndex];
  const kind = ["note", "missing", "image"].includes(slide.kind) ? slide.kind : "lyrics";
  const lines = Array.isArray(slide.lines) && slide.lines.length ? slide.lines : ["Instrumental"];
  const showTitle = Boolean(state.show.slideExportShowTitles);
  const design = slideDesignFromStudioSong({ design: slide.design || defaultSlideDesign });
  els.slidePreviewStage.innerHTML = `
    <div class="mini-slide ${kind} theme-${design.theme}${showTitle && kind !== "image" ? " has-title" : ""}" style="--mini-slide-font-size:${Math.max(12, Math.round(design.fontSize * 0.3))}px">
      <div class="mini-slide-meta">${escapeHtml(slide.meta || "")}</div>
      ${kind === "image" && slide.image ? `
        <div class="mini-slide-image" style="background-image:url(&quot;${cssUrl(slide.image)}&quot;)"></div>
      ` : `
        ${showTitle ? `<strong>${escapeHtml(slide.title || "Slide")}</strong>` : ""}
        <div class="mini-slide-lines">
          ${lines.slice(0, 6).map((line) => `<span>${escapeHtml(line)}</span>`).join("")}
        </div>
        <small>Created with LINEUP · Songleading.net</small>
      `}
    </div>
  `;
  if (els.slidePreviewCount) els.slidePreviewCount.textContent = `${activeSlidePreviewIndex + 1} / ${total}`;
  if (els.prevSlidePreviewButton) els.prevSlidePreviewButton.disabled = activeSlidePreviewIndex <= 0;
  if (els.nextSlidePreviewButton) els.nextSlidePreviewButton.disabled = activeSlidePreviewIndex >= total - 1;
}

function loadSlidesThemePresets() {
  try {
    const parsed = JSON.parse(localStorage.getItem(slidesThemePresetsStorageKey) || "[]");
    return Array.isArray(parsed)
      ? parsed
          .filter((preset) => preset?.id && preset?.name && preset?.image)
          .map((preset) => ({ ...preset, crop: sanitizeSlideExportCrop(preset.crop) }))
          .slice(0, 24)
      : [];
  } catch {
    return [];
  }
}

function saveSlidesThemePresets(presets) {
  localStorage.setItem(slidesThemePresetsStorageKey, JSON.stringify(presets.slice(0, 24)));
}

function selectedSlidesThemeName() {
  return document.querySelector("input[name='slidesExportTheme']:checked")?.value || "default";
}

function selectedSlidesThemePreset() {
  const presetId = els.slidesExportPresetSelect?.value || "";
  return loadSlidesThemePresets().find((preset) => preset.id === presetId) || null;
}

function selectedSlidesExportCrop() {
  return sanitizeSlideExportCrop({
    zoom: els.slidesExportImageZoom?.value,
    x: els.slidesExportImageX?.value,
    y: els.slidesExportImageY?.value,
  });
}

function applySlidesExportThemeControls(theme = {}) {
  const normalized = normalizeSlideExportTheme(theme);
  const selected = document.querySelector(`input[name='slidesExportTheme'][value='${normalized.name}']`);
  if (selected) selected.checked = true;
  if (els.slidesExportImageZoom) els.slidesExportImageZoom.value = String(normalized.crop.zoom);
  if (els.slidesExportImageX) els.slidesExportImageX.value = String(normalized.crop.x);
  if (els.slidesExportImageY) els.slidesExportImageY.value = String(normalized.crop.y);
  slidesExportPendingImage = normalized.image || "";
  setSlidesCropControlsEnabled(Boolean(normalized.image));
}

function setSlidesCropControlsEnabled(enabled) {
  [els.slidesExportImageZoom, els.slidesExportImageX, els.slidesExportImageY].forEach((input) => {
    if (!input) return;
    input.disabled = !enabled;
    input.closest("label")?.classList.toggle("is-disabled", !enabled);
  });
}

function renderSlidesPresetOptions() {
  const presets = loadSlidesThemePresets();
  if (!els.slidesExportPresetSelect) return;
  els.slidesExportPresetSelect.innerHTML = [
    `<option value="">No saved background</option>`,
    ...presets.map((preset) => `<option value="${escapeHtml(preset.id)}">${escapeHtml(preset.name)}</option>`),
  ].join("");
  if (els.deleteSlidesPresetButton) els.deleteSlidesPresetButton.disabled = !els.slidesExportPresetSelect.value;
}

function slidesThemePreviewStyle(theme = {}) {
  theme = normalizeSlideExportTheme(theme);
  if (theme.image) {
    const crop = sanitizeSlideExportCrop(theme.crop);
    return `--theme-image:url("${cssUrl(theme.image)}"); --theme-x:${crop.x}%; --theme-y:${crop.y}%; --theme-scale:${(crop.zoom / 100).toFixed(2)};`;
  }
  if (theme.name === "shabbat") {
    return "background-image: radial-gradient(ellipse at 30% 68%, rgba(245,159,64,.52), transparent 20%), radial-gradient(ellipse at 63% 68%, rgba(255,226,143,.42), transparent 18%), linear-gradient(180deg, rgba(2,5,12,.08), rgba(2,5,12,.52)), linear-gradient(145deg, #211005, #05070b 72%);";
  }
  if (theme.name === "campfire") {
    return "background-image: radial-gradient(ellipse at 48% 78%, rgba(255,177,68,.76), transparent 14%), radial-gradient(ellipse at 50% 100%, rgba(255,102,24,.48), transparent 34%), linear-gradient(180deg, #07111f 0%, #11100d 58%, #090504 100%);";
  }
  if (theme.name === "bright") {
    return "background-image: radial-gradient(circle at 18% 14%, rgba(91,146,255,.18), transparent 26%), radial-gradient(circle at 82% 10%, rgba(243,174,34,.18), transparent 24%), linear-gradient(135deg, #fffaf2, #edf7f5); color:#101827;";
  }
  return "background-image: radial-gradient(circle at 18% 12%, rgba(91,146,255,.28), transparent 34%), radial-gradient(circle at 76% 82%, rgba(18,194,170,.18), transparent 28%), linear-gradient(135deg, #07111f, #05070b);";
}

async function currentSlidesExportTheme() {
  const image = await imageInputToDataUrl(els.slidesExportImage);
  if (image) slidesExportPendingImage = image;
  const preset = selectedSlidesThemePreset();
  const saved = normalizeSlideExportTheme(state.show.slideExportTheme || {});
  const crop = selectedSlidesExportCrop();
  return {
    name: selectedSlidesThemeName(),
    image: image || preset?.image || slidesExportPendingImage || saved.image || "",
    presetName: preset?.name || saved.presetName || "",
    crop,
  };
}

async function persistCurrentSlidesExportTheme() {
  state.show.slideExportTheme = normalizeSlideExportTheme(await currentSlidesExportTheme());
  saveState();
}

async function renderSlidesExportPreview() {
  if (!els.slidesExportPreview) return;
  const theme = await currentSlidesExportTheme();
  const options = getSlidesExportOptions();
  const slides = buildLineupSlideDeck();
  const previewSlides = slides.length ? slides : [{
    kind: "missing",
    title: "No slides",
    lines: ["Add songs with slides before exporting."],
    credits: "",
    meta: "",
  }];
  slidesExportPreviewIndex = Math.max(0, Math.min(slidesExportPreviewIndex, previewSlides.length - 1));
  const canMovePrevious = slidesExportPreviewIndex > 0;
  const canMoveNext = slidesExportPreviewIndex < previewSlides.length - 1;
  setSlidesCropControlsEnabled(Boolean(theme.image));
  const canvas = await renderSlideToCanvas(previewSlides[slidesExportPreviewIndex], theme, {
    ...options,
    slideIndex: slidesExportPreviewIndex,
    slideTotal: previewSlides.length,
  });
  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
  els.slidesExportPreview.className = "slides-theme-preview rendered-slide-preview";
  els.slidesExportPreview.removeAttribute("style");
  els.slidesExportPreview.innerHTML = `
    <img class="slides-export-preview-image" src="${escapeHtml(dataUrl)}" alt="Rendered slide preview ${slidesExportPreviewIndex + 1}" />
    <div class="slides-export-preview-count" aria-live="polite">${slidesExportPreviewIndex + 1} / ${previewSlides.length}</div>
    ${previewSlides.length > 1 ? `
      <div class="slides-export-preview-nav" aria-label="Slide preview navigation">
        <button type="button" data-slide-preview-step="-1" aria-label="Previous slide" ${canMovePrevious ? "" : "disabled"}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button type="button" data-slide-preview-step="1" aria-label="Next slide" ${canMoveNext ? "" : "disabled"}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
        </button>
      </div>
    ` : ""}
  `;
}

async function renderPresentationSlide() {
  if (!els.presentationSlideImage || !presentationSlides.length) return;
  presentationIndex = Math.max(0, Math.min(presentationIndex, presentationSlides.length - 1));
  const canvas = await renderSlideToCanvas(presentationSlides[presentationIndex], presentationTheme, {
    ...presentationOptions,
    slideIndex: presentationIndex,
    slideTotal: presentationSlides.length,
  });
  els.presentationSlideImage.src = canvas.toDataURL("image/jpeg", 0.92);
  if (els.presentationCount) els.presentationCount.textContent = `${presentationIndex + 1} / ${presentationSlides.length}`;
  if (els.presentationPrevButton) els.presentationPrevButton.disabled = presentationIndex <= 0;
  if (els.presentationNextButton) els.presentationNextButton.disabled = presentationIndex >= presentationSlides.length - 1;
}

async function openPresentation(options = {}) {
  commitShowMetaFromFields();
  if (!prepareSlidesExportControls()) {
    toast("Add songs with slides before presenting.");
    return;
  }
  presentationSlides = buildLineupSlideDeck();
  presentationOptions = {
    showTitles: Boolean(state.show.slideExportShowTitles),
    showCredits: Boolean(state.show.slideExportShowCredits),
    showCount: Boolean(state.show.slideExportShowCount),
  };
  presentationIndex = 0;
  if (els.exportDialog?.open) closeDialog(els.exportDialog);
  if (els.slidesExportDialog?.open) closeDialog(els.slidesExportDialog);
  openDialog(els.presentationDialog);
  if (options.requestFullscreen) {
    const target = els.presentationStage || els.presentationDialog;
    target?.requestFullscreen?.().catch(() => toast("Fullscreen is blocked by the browser. Use the fullscreen button in the presenter."));
  }
  await persistCurrentSlidesExportTheme();
  presentationTheme = normalizeSlideExportTheme(state.show.slideExportTheme || defaultSlideExportTheme);
  await renderPresentationSlide();
}

function closePresentation() {
  if (document.fullscreenElement === els.presentationStage) {
    document.exitFullscreen?.().catch(() => {});
  }
  closeDialog(els.presentationDialog);
}

function movePresentation(step) {
  if (!els.presentationDialog?.open) return;
  presentationIndex = Math.max(0, Math.min(presentationIndex + step, presentationSlides.length - 1));
  renderPresentationSlide().catch((error) => toast(error instanceof Error ? error.message : "Could not change slide."));
}

function togglePresentationFullscreen() {
  const target = els.presentationStage || els.presentationDialog;
  if (!target) return;
  if (document.fullscreenElement) {
    document.exitFullscreen?.().catch(() => toast("Could not leave fullscreen."));
    return;
  }
  target.requestFullscreen?.().catch(() => toast("Fullscreen is blocked by the browser."));
}

async function saveCurrentSlidesPreset() {
  const image = slidesExportPendingImage || await imageInputToDataUrl(els.slidesExportImage);
  if (!image) {
    toast("Choose a background image first.");
    return;
  }
  const name = window.prompt("Theme name", "New slideshow theme");
  if (!name?.trim()) return;
  const presets = loadSlidesThemePresets();
  const preset = { id: makeId("theme"), name: name.trim(), image, crop: selectedSlidesExportCrop() };
  presets.unshift(preset);
  saveSlidesThemePresets(presets);
  renderSlidesPresetOptions();
  if (els.slidesExportPresetSelect) els.slidesExportPresetSelect.value = preset.id;
  if (els.slidesExportImage) els.slidesExportImage.value = "";
  state.show.slideExportTheme = normalizeSlideExportTheme({ ...preset, presetName: preset.name, name: selectedSlidesThemeName() });
  saveState();
  await renderSlidesExportPreview();
  toast("Slideshow theme saved.");
}

async function deleteCurrentSlidesPreset() {
  const presetId = els.slidesExportPresetSelect?.value || "";
  if (!presetId) return;
  saveSlidesThemePresets(loadSlidesThemePresets().filter((preset) => preset.id !== presetId));
  renderSlidesPresetOptions();
  await renderSlidesExportPreview();
  toast("Preset removed.");
}

async function clearSlidesExportImage() {
  slidesExportPendingImage = "";
  if (els.slidesExportImage) els.slidesExportImage.value = "";
  if (els.slidesExportPresetSelect) els.slidesExportPresetSelect.value = "";
  state.show.slideExportTheme = normalizeSlideExportTheme({ ...(state.show.slideExportTheme || {}), image: "", presetName: "" });
  saveState();
  await renderSlidesExportPreview();
  toast("Background image cleared.");
}

async function imageInputToDataUrl(input) {
  const file = input?.files?.[0];
  if (!file) return "";
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result || "")));
    reader.addEventListener("error", () => reject(reader.error || new Error("Could not read the image.")));
    reader.readAsDataURL(file);
  });
}

function getSlidesExportOptions() {
  return {
    showTitles: Boolean(els.slidesShowTitlesToggle?.checked),
    showCredits: Boolean(els.slidesShowCreditsToggle?.checked),
    showCount: Boolean(els.slidesShowCountToggle?.checked),
  };
}

function slideCanvasPalette(theme = {}, kind = "lyrics") {
  const normalized = normalizeSlideExportTheme(theme);
  const bright = normalized.name === "bright" && !normalized.image;
  return {
    ink: bright ? "#101827" : "#f8fbff",
    muted: bright ? "rgba(15, 23, 42, 0.58)" : "rgba(248, 251, 255, 0.64)",
    note: bright ? "#7c4a02" : "#ffe1a3",
    missing: bright ? "#475569" : "#c9d3e2",
    watermark: bright ? "rgba(15, 23, 42, 0.42)" : "rgba(248, 251, 255, 0.46)",
    shadow: bright || kind === "missing" ? "rgba(255, 255, 255, 0)" : "rgba(0, 0, 0, 0.52)",
  };
}

function fillSlideGradient(context, width, height, stops) {
  const gradient = context.createLinearGradient(0, 0, width, height);
  stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

function fillSlideRadial(context, width, height, x, y, radius, stops) {
  const gradient = context.createRadialGradient(width * x, height * y, 0, width * x, height * y, width * radius);
  stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

function canvasRoundRectPath(context, x, y, width, height, radius) {
  if (typeof context.roundRect === "function") {
    context.roundRect(x, y, width, height, radius);
    return;
  }
  const r = Math.min(radius, width / 2, height / 2);
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
}

function drawCanvasEllipse(context, x, y, radiusX, radiusY, color) {
  context.save();
  context.fillStyle = color;
  context.beginPath();
  context.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawCanvasFlame(context, x, y, scale = 1) {
  const drawShape = (offsetY, width, height, color) => {
    context.save();
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(x, y + offsetY - height);
    context.bezierCurveTo(x - width, y + offsetY - height * 0.48, x - width * 0.66, y + offsetY, x, y + offsetY);
    context.bezierCurveTo(x + width * 0.7, y + offsetY, x + width, y + offsetY - height * 0.5, x, y + offsetY - height);
    context.fill();
    context.restore();
  };
  drawShape(0, 30 * scale, 88 * scale, "rgba(255, 119, 34, 0.96)");
  drawShape(-4 * scale, 18 * scale, 62 * scale, "rgba(255, 218, 112, 0.94)");
  drawShape(-8 * scale, 8 * scale, 36 * scale, "rgba(255, 250, 210, 0.9)");
}

function drawShabbatCandleScene(context, width, height) {
  fillSlideGradient(context, width, height, [[0, "#160b05"], [0.58, "#06070b"], [1, "#030407"]]);
  fillSlideRadial(context, width, height, 0.5, 0.66, 0.5, [[0, "rgba(255, 163, 67, 0.24)"], [1, "rgba(255, 163, 67, 0)"]]);
  drawCanvasEllipse(context, width * 0.5, height * 0.85, width * 0.42, height * 0.12, "rgba(85, 46, 22, 0.48)");
  const candles = [width * 0.43, width * 0.57];
  candles.forEach((x, index) => {
    const candleHeight = height * (index ? 0.25 : 0.29);
    const candleWidth = width * 0.045;
    const y = height * 0.72;
    const body = context.createLinearGradient(x - candleWidth / 2, y - candleHeight, x + candleWidth / 2, y);
    body.addColorStop(0, "#fff8dc");
    body.addColorStop(0.55, "#f2d59b");
    body.addColorStop(1, "#b98743");
    context.fillStyle = body;
    context.beginPath();
    canvasRoundRectPath(context, x - candleWidth / 2, y - candleHeight, candleWidth, candleHeight, candleWidth * 0.34);
    context.fill();
    context.fillStyle = "rgba(63, 37, 17, 0.34)";
    context.fillRect(x - candleWidth * 0.05, y - candleHeight - 4, candleWidth * 0.1, 16);
    fillSlideRadial(context, width, height, x / width, (y - candleHeight - 48) / height, 0.18, [[0, "rgba(255, 218, 132, 0.52)"], [1, "rgba(255, 218, 132, 0)"]]);
    drawCanvasFlame(context, x, y - candleHeight + 2, 0.42);
  });
  fillSlideGradient(context, width, height, [[0, "rgba(2, 5, 12, 0.2)"], [0.55, "rgba(2, 5, 12, 0.18)"], [1, "rgba(2, 5, 12, 0.62)"]]);
}

function drawCampfireScene(context, width, height) {
  fillSlideGradient(context, width, height, [[0, "#061328"], [0.58, "#111118"], [1, "#090403"]]);
  fillSlideRadial(context, width, height, 0.5, 0.88, 0.48, [[0, "rgba(255, 124, 34, 0.42)"], [1, "rgba(255, 124, 34, 0)"]]);
  for (let index = 0; index < 22; index += 1) {
    const x = width * (0.2 + ((index * 37) % 60) / 100);
    const y = height * (0.18 + ((index * 23) % 52) / 100);
    drawCanvasEllipse(context, x, y, 2 + (index % 3), 2 + (index % 2), "rgba(255, 201, 104, 0.38)");
  }
  context.save();
  context.translate(width * 0.5, height * 0.82);
  context.rotate(-0.18);
  context.fillStyle = "#5a2f18";
  context.beginPath();
  canvasRoundRectPath(context, -170, 38, 340, 38, 18);
  context.fill();
  context.restore();
  context.save();
  context.translate(width * 0.5, height * 0.82);
  context.rotate(0.18);
  context.fillStyle = "#78401e";
  context.beginPath();
  canvasRoundRectPath(context, -165, 42, 330, 40, 18);
  context.fill();
  context.restore();
  drawCanvasFlame(context, width * 0.43, height * 0.82, 1.05);
  drawCanvasFlame(context, width * 0.51, height * 0.82, 1.28);
  drawCanvasFlame(context, width * 0.59, height * 0.82, 0.95);
  fillSlideGradient(context, width, height, [[0, "rgba(2, 5, 12, 0.12)"], [0.5, "rgba(2, 5, 12, 0.18)"], [1, "rgba(2, 5, 12, 0.54)"]]);
}

function drawBrightPaperScene(context, width, height, kind) {
  fillSlideGradient(context, width, height, [[0, "#fffaf2"], [1, kind === "note" ? "#fff4d6" : "#eef7f5"]]);
  fillSlideRadial(context, width, height, 0.16, 0.12, 0.34, [[0, "rgba(91, 146, 255, 0.14)"], [1, "rgba(91, 146, 255, 0)"]]);
  fillSlideRadial(context, width, height, 0.86, 0.14, 0.26, [[0, "rgba(243, 174, 34, 0.18)"], [1, "rgba(243, 174, 34, 0)"]]);
  context.save();
  context.strokeStyle = "rgba(15, 23, 42, 0.045)";
  context.lineWidth = 1;
  for (let x = width * 0.08; x < width; x += 70) {
    context.beginPath();
    context.moveTo(x, height * 0.08);
    context.lineTo(x - width * 0.16, height);
    context.stroke();
  }
  context.restore();
}

function drawPresetSlideBackground(context, width, height, theme = {}, kind = "lyrics") {
  const normalized = normalizeSlideExportTheme(theme);
  if (normalized.name === "bright") {
    drawBrightPaperScene(context, width, height, kind);
    return;
  }
  if (normalized.name === "shabbat") {
    drawShabbatCandleScene(context, width, height);
    return;
  }
  if (normalized.name === "campfire") {
    drawCampfireScene(context, width, height);
    return;
  }
  if (kind === "note") {
    fillSlideGradient(context, width, height, [[0, "#1b1205"], [1, "#050403"]]);
    fillSlideRadial(context, width, height, 0.2, 0.15, 0.34, [[0, "rgba(245, 181, 43, 0.22)"], [1, "rgba(245, 181, 43, 0)"]]);
    return;
  }
  if (kind === "missing") {
    fillSlideGradient(context, width, height, [[0, "#111820"], [1, "#050607"]]);
    fillSlideRadial(context, width, height, 0.5, 0.2, 0.36, [[0, "rgba(155, 165, 170, 0.16)"], [1, "rgba(155, 165, 170, 0)"]]);
    return;
  }
  fillSlideGradient(context, width, height, [[0, "#07111f"], [1, "#020407"]]);
  fillSlideRadial(context, width, height, 0.18, 0.12, 0.34, [[0, "rgba(91, 146, 255, 0.22)"], [1, "rgba(91, 146, 255, 0)"]]);
}

function loadImageForCanvas(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image), { once: true });
    image.addEventListener("error", () => reject(new Error("Could not load slide background image.")), { once: true });
    image.src = src;
  });
}

async function drawSlideBackground(context, width, height, theme = {}, kind = "lyrics") {
  const normalized = normalizeSlideExportTheme(theme);
  if (!normalized.image) {
    drawPresetSlideBackground(context, width, height, normalized, kind);
    return;
  }
  try {
    const image = await loadImageForCanvas(normalized.image);
    const crop = sanitizeSlideExportCrop(normalized.crop);
    const baseScale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const scale = baseScale * (crop.zoom / 100);
    const drawnWidth = image.naturalWidth * scale;
    const drawnHeight = image.naturalHeight * scale;
    const x = (width - drawnWidth) * (crop.x / 100);
    const y = (height - drawnHeight) * (crop.y / 100);
    context.fillStyle = "#05070b";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, x, y, drawnWidth, drawnHeight);
    const overlay = context.createLinearGradient(0, 0, 0, height);
    overlay.addColorStop(0, "rgba(3, 7, 18, 0.50)");
    overlay.addColorStop(1, "rgba(3, 7, 18, 0.66)");
    context.fillStyle = overlay;
    context.fillRect(0, 0, width, height);
  } catch {
    drawPresetSlideBackground(context, width, height, normalized, kind);
  }
}

async function drawFullBleedCanvasImage(context, width, height, src) {
  try {
    const image = await loadImageForCanvas(src);
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const drawnWidth = image.naturalWidth * scale;
    const drawnHeight = image.naturalHeight * scale;
    const x = (width - drawnWidth) / 2;
    const y = (height - drawnHeight) / 2;
    context.fillStyle = "#05070b";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, x, y, drawnWidth, drawnHeight);
  } catch {
    drawPresetSlideBackground(context, width, height, defaultSlideExportTheme, "missing");
  }
}

function slideCanvasFont(fontSize, italic = false) {
  return `${italic ? "italic " : ""}${slideTextWeight} ${fontSize}px Inter, Arial, Helvetica, sans-serif`;
}

function wrapCanvasLine(context, line, maxWidth) {
  const words = String(line || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const wrapped = [];
  let current = "";
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (!current || context.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      wrapped.push(current);
      current = word;
    }
  });
  if (current) wrapped.push(current);
  return wrapped;
}

function slideCanvasTextLayout(context, lines, fontSize, maxWidth, italic = false) {
  context.font = slideCanvasFont(fontSize, italic);
  const wrappedLines = lines.map((line) => String(line || "").trim()).filter(Boolean);
  const lineHeight = fontSize * 1.08;
  const gapHeight = Math.max(0, wrappedLines.length - 1) * fontSize * 0.18;
  const totalHeight = wrappedLines.length * lineHeight + gapHeight;
  const widest = wrappedLines.reduce((max, line) => Math.max(max, context.measureText(line).width), 0);
  return { wrappedLines, lineHeight, gapHeight, totalHeight, widest, fontSize };
}

function fitSlideCanvasText(context, lines, maxWidth, maxHeight, kind, maxFontSize = defaultSlideDesign.fontSize) {
  const italic = kind === "note";
  const designMax = clampNumber(Number(maxFontSize) || defaultSlideDesign.fontSize, minimumSlideEditorFontSize, maxSlideEditorFontSize);
  const maxFont = kind === "missing" ? Math.min(78, designMax) : kind === "note" ? Math.min(92, designMax) : designMax;
  const minFont = minimumSlideEditorFontSize;
  let fallback = slideCanvasTextLayout(context, lines, minFont, maxWidth, italic);
  for (let fontSize = maxFont; fontSize >= minFont; fontSize -= 2) {
    const layout = slideCanvasTextLayout(context, lines, fontSize, maxWidth, italic);
    if (layout.totalHeight <= maxHeight && layout.widest <= maxWidth) return layout;
    fallback = layout.fontSize < fallback.fontSize ? layout : fallback;
  }
  return fallback;
}

function drawCanvasFittedText(context, text, x, y, maxWidth) {
  let value = String(text || "");
  if (context.measureText(value).width <= maxWidth) {
    context.fillText(value, x, y);
    return;
  }
  while (value.length > 1 && context.measureText(`${value}...`).width > maxWidth) {
    value = value.slice(0, -1).trimEnd();
  }
  context.fillText(`${value || text.slice(0, 1)}...`, x, y);
}

function drawSlideWatermark(context, width, height, palette) {
  context.save();
  const markColor = palette.watermark;
  const right = width - 24;
  const bottom = height - 18;
  context.globalAlpha = 1;
  context.textBaseline = "alphabetic";
  context.textAlign = "right";
  context.fillStyle = markColor;
  context.font = "700 8px Inter, Arial, Helvetica, sans-serif";
  context.fillText("Created with", right, bottom - 17);

  const logoWidth = 126;
  const logoHeight = 21;
  const iconSize = 18;
  const x = right - logoWidth;
  const y = bottom - logoHeight + 1;
  context.strokeStyle = markColor;
  context.lineWidth = 0.95;
  context.beginPath();
  canvasRoundRectPath(context, x, y, iconSize, iconSize, 5);
  context.stroke();
  context.font = "700 12px Inter, Arial, Helvetica, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("♪", x + iconSize / 2, y + iconSize / 2);
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.font = "700 9.5px Inter, Arial, Helvetica, sans-serif";
  context.fillText("Songleading.net", x + 25, y + 9);
  context.font = "700 4.8px Inter, Arial, Helvetica, sans-serif";
  context.letterSpacing = "1px";
  context.fillText("BY BARAK MALICHI", x + 25, y + 17);
  context.restore();
}

async function renderSlideToCanvas(slide, theme = {}, options = {}) {
  const width = 1920;
  const height = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  const kind = ["note", "missing", "image"].includes(slide.kind) ? slide.kind : "lyrics";
  const image = kind === "image" ? safeImageValue(slide.image) : "";
  if (image) {
    await drawFullBleedCanvasImage(context, width, height, image);
    return canvas;
  }
  const palette = slideCanvasPalette(theme, kind);
  const rawLines = Array.isArray(slide.lines) && slide.lines.length ? slide.lines : ["Instrumental"];
  const lines = rawLines.map((line) => String(line || "").trim()).filter(Boolean);

  await drawSlideBackground(context, width, height, theme, kind);

  const maxWidth = width * 0.98;
  const safeTop = options.showTitles && slide.title ? 96 : 32;
  const safeBottom = height - 36;
  const maxHeight = Math.max(220, safeBottom - safeTop);
  const slideDesign = slideDesignFromStudioSong({ design: slide.design || defaultSlideDesign });
  const layout = fitSlideCanvasText(context, lines.length ? lines : ["Instrumental"], maxWidth, maxHeight, kind, slideDesign.fontSize);
  const textColor = kind === "note" ? palette.note : kind === "missing" ? palette.missing : palette.ink;
  context.save();
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = textColor;
  context.font = slideCanvasFont(layout.fontSize, kind === "note");
  context.shadowColor = palette.shadow;
  context.shadowBlur = palette.shadow === "rgba(255, 255, 255, 0)" ? 0 : 22;
  context.shadowOffsetY = palette.shadow === "rgba(255, 255, 255, 0)" ? 0 : 4;
  let y = safeTop + maxHeight / 2 - layout.totalHeight / 2 + layout.lineHeight / 2;
  layout.wrappedLines.forEach((line) => {
    context.fillText(line, width / 2, y);
    y += layout.lineHeight + layout.fontSize * 0.18;
  });
  context.restore();

  if (options.showTitles && slide.title) {
    context.save();
    context.fillStyle = palette.muted;
    context.font = "900 31px Inter, Arial, Helvetica, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "top";
    drawCanvasFittedText(context, slide.title, width / 2, 34, width * 0.72);
    context.restore();
  }

  if (options.showCount) {
    context.save();
    context.fillStyle = palette.muted;
    context.font = "900 24px Inter, Arial, Helvetica, sans-serif";
    context.textAlign = "right";
    context.textBaseline = "top";
    context.fillText(`${(options.slideIndex || 0) + 1} out of ${options.slideTotal || 1}`, width - 44, 38);
    context.restore();
  }

  if (options.showCredits && slide.credits) {
    context.save();
    context.fillStyle = palette.muted;
    context.font = "800 22px Inter, Arial, Helvetica, sans-serif";
    context.textAlign = "left";
    context.textBaseline = "bottom";
    drawCanvasFittedText(context, slide.credits, 44, height - 36, width * 0.46);
    context.restore();
  }

  context.save();
  drawSlideWatermark(context, width, height, palette);
  context.restore();

  return canvas;
}

function dataUrlToBytes(dataUrl) {
  const match = /^data:([^;]+);base64,(.*)$/.exec(String(dataUrl || ""));
  if (!match) throw new Error("Could not render slide image.");
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return { bytes, mime: match[1] };
}

async function buildSlidesPptxBlob(slides, theme = {}, options = {}) {
  const renderedSlides = slides.length ? slides : [{
    kind: "missing",
    title: "No slides",
    lines: ["Add songs with slides before exporting."],
    meta: "",
  }];
  const entries = basePptxEntries(renderedSlides.length, state.show.name || "Lineup slides");

  for (let index = 0; index < renderedSlides.length; index += 1) {
    const canvas = await renderSlideToCanvas(renderedSlides[index], theme, {
      ...options,
      slideIndex: index,
      slideTotal: renderedSlides.length,
    });
    const { bytes } = dataUrlToBytes(canvas.toDataURL("image/jpeg", 0.92));
    const slideNumber = index + 1;
    entries.push({ name: `ppt/slides/slide${slideNumber}.xml`, data: textBytes(pptxSlideXml(slideNumber)) });
    entries.push({ name: `ppt/slides/_rels/slide${slideNumber}.xml.rels`, data: textBytes(pptxSlideRelsXml(`slide${slideNumber}.jpg`)) });
    entries.push({ name: `ppt/media/slide${slideNumber}.jpg`, data: bytes });
  }

  return buildStoredZipBlob(entries, pptxMimeType);
}

function basePptxEntries(slideCount, title) {
  return [
    { name: "[Content_Types].xml", data: textBytes(pptxContentTypesXml(slideCount)) },
    { name: "_rels/.rels", data: textBytes(pptxRootRelsXml()) },
    { name: "docProps/core.xml", data: textBytes(pptxCoreXml(title)) },
    { name: "docProps/app.xml", data: textBytes(pptxAppXml(slideCount)) },
    { name: "ppt/presentation.xml", data: textBytes(pptxPresentationXml(slideCount)) },
    { name: "ppt/_rels/presentation.xml.rels", data: textBytes(pptxPresentationRelsXml(slideCount)) },
    { name: "ppt/slideMasters/slideMaster1.xml", data: textBytes(pptxSlideMasterXml()) },
    { name: "ppt/slideMasters/_rels/slideMaster1.xml.rels", data: textBytes(pptxSlideMasterRelsXml()) },
    { name: "ppt/slideLayouts/slideLayout1.xml", data: textBytes(pptxSlideLayoutXml()) },
    { name: "ppt/slideLayouts/_rels/slideLayout1.xml.rels", data: textBytes(pptxSlideLayoutRelsXml()) },
    { name: "ppt/theme/theme1.xml", data: textBytes(pptxThemeXml()) },
  ];
}

function xml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  })[char]);
}

function pptxContentTypesXml(slideCount) {
  const slideOverrides = Array.from({ length: slideCount }, (_, index) => (
    `<Override PartName="/ppt/slides/slide${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`
  )).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="jpg" ContentType="image/jpeg"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  ${slideOverrides}
</Types>`;
}

function pptxRootRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;
}

function pptxCoreXml(title) {
  const now = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${xml(title)}</dc:title>
  <dc:creator>Songleading.net</dc:creator>
  <cp:lastModifiedBy>Songleading.net</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>
</cp:coreProperties>`;
}

function pptxAppXml(slideCount) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Songleading.net</Application>
  <PresentationFormat>On-screen Show (16:9)</PresentationFormat>
  <Slides>${slideCount}</Slides>
  <ScaleCrop>false</ScaleCrop>
</Properties>`;
}

function pptxPresentationXml(slideCount) {
  const slideIds = Array.from({ length: slideCount }, (_, index) => (
    `<p:sldId id="${256 + index}" r:id="rId${index + 2}"/>`
  )).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>
  <p:sldIdLst>${slideIds}</p:sldIdLst>
  <p:sldSz cx="12192000" cy="6858000" type="wide"/>
  <p:notesSz cx="6858000" cy="9144000"/>
  <p:defaultTextStyle/>
</p:presentation>`;
}

function pptxPresentationRelsXml(slideCount) {
  const slideRels = Array.from({ length: slideCount }, (_, index) => (
    `<Relationship Id="rId${index + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${index + 1}.xml"/>`
  )).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
  ${slideRels}
</Relationships>`;
}

function pptxSlideXml(slideNumber) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      <p:pic>
        <p:nvPicPr><p:cNvPr id="2" name="Slide ${slideNumber}"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr>
        <p:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>
        <p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="12192000" cy="6858000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>
      </p:pic>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>`;
}

function pptxSlideRelsXml(imageName) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${xml(imageName)}"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`;
}

function pptxSlideMasterXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
  <p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles>
</p:sldMaster>`;
}

function pptxSlideMasterRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>`;
}

function pptxSlideLayoutXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1">
  <p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>`;
}

function pptxSlideLayoutRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`;
}

function pptxThemeXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Songleading">
  <a:themeElements>
    <a:clrScheme name="Songleading"><a:dk1><a:srgbClr val="05070B"/></a:dk1><a:lt1><a:srgbClr val="F8FBFF"/></a:lt1><a:dk2><a:srgbClr val="07111F"/></a:dk2><a:lt2><a:srgbClr val="FFFDF7"/></a:lt2><a:accent1><a:srgbClr val="5B92FF"/></a:accent1><a:accent2><a:srgbClr val="36C3A1"/></a:accent2><a:accent3><a:srgbClr val="F5B52B"/></a:accent3><a:accent4><a:srgbClr val="7C8CFF"/></a:accent4><a:accent5><a:srgbClr val="C9D3E2"/></a:accent5><a:accent6><a:srgbClr val="101827"/></a:accent6><a:hlink><a:srgbClr val="2563EB"/></a:hlink><a:folHlink><a:srgbClr val="7C3AED"/></a:folHlink></a:clrScheme>
    <a:fontScheme name="Songleading"><a:majorFont><a:latin typeface="Arial"/></a:majorFont><a:minorFont><a:latin typeface="Arial"/></a:minorFont></a:fontScheme>
    <a:fmtScheme name="Songleading"><a:fillStyleLst><a:solidFill><a:schemeClr val="accent1"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="accent1"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="dk1"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme>
  </a:themeElements>
</a:theme>`;
}

function littleEndianBytes(value, byteCount) {
  const bytes = new Uint8Array(byteCount);
  let remaining = value >>> 0;
  for (let index = 0; index < byteCount; index += 1) {
    bytes[index] = remaining & 0xff;
    remaining >>>= 8;
  }
  return bytes;
}

function zipDosTime(date = new Date()) {
  return ((date.getHours() & 0x1f) << 11) | ((date.getMinutes() & 0x3f) << 5) | ((Math.floor(date.getSeconds() / 2)) & 0x1f);
}

function zipDosDate(date = new Date()) {
  return (((date.getFullYear() - 1980) & 0x7f) << 9) | (((date.getMonth() + 1) & 0x0f) << 5) | (date.getDate() & 0x1f);
}

let zipCrcTable = null;
function crc32(bytes) {
  if (!zipCrcTable) {
    zipCrcTable = new Uint32Array(256);
    for (let index = 0; index < 256; index += 1) {
      let value = index;
      for (let bit = 0; bit < 8; bit += 1) {
        value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
      }
      zipCrcTable[index] = value >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let index = 0; index < bytes.length; index += 1) {
    crc = zipCrcTable[(crc ^ bytes[index]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function concatByteChunks(chunks) {
  const totalLength = chunks.reduce((total, chunk) => total + chunk.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;
  chunks.forEach((chunk) => {
    output.set(chunk, offset);
    offset += chunk.length;
  });
  return output;
}

function buildStoredZipBlob(entries, mimeType = "application/zip") {
  const fileChunks = [];
  const centralChunks = [];
  const now = new Date();
  let offset = 0;
  entries.forEach((entry) => {
    const nameBytes = textBytes(entry.name);
    const data = entry.data instanceof Uint8Array ? entry.data : textBytes(String(entry.data || ""));
    const crc = crc32(data);
    const localHeader = concatByteChunks([
      littleEndianBytes(0x04034b50, 4),
      littleEndianBytes(20, 2),
      littleEndianBytes(0, 2),
      littleEndianBytes(0, 2),
      littleEndianBytes(zipDosTime(now), 2),
      littleEndianBytes(zipDosDate(now), 2),
      littleEndianBytes(crc, 4),
      littleEndianBytes(data.length, 4),
      littleEndianBytes(data.length, 4),
      littleEndianBytes(nameBytes.length, 2),
      littleEndianBytes(0, 2),
      nameBytes,
    ]);
    fileChunks.push(localHeader, data);
    centralChunks.push(concatByteChunks([
      littleEndianBytes(0x02014b50, 4),
      littleEndianBytes(20, 2),
      littleEndianBytes(20, 2),
      littleEndianBytes(0, 2),
      littleEndianBytes(0, 2),
      littleEndianBytes(zipDosTime(now), 2),
      littleEndianBytes(zipDosDate(now), 2),
      littleEndianBytes(crc, 4),
      littleEndianBytes(data.length, 4),
      littleEndianBytes(data.length, 4),
      littleEndianBytes(nameBytes.length, 2),
      littleEndianBytes(0, 2),
      littleEndianBytes(0, 2),
      littleEndianBytes(0, 2),
      littleEndianBytes(0, 2),
      littleEndianBytes(0, 4),
      littleEndianBytes(offset, 4),
      nameBytes,
    ]));
    offset += localHeader.length + data.length;
  });
  const centralDirectory = concatByteChunks(centralChunks);
  const endRecord = concatByteChunks([
    littleEndianBytes(0x06054b50, 4),
    littleEndianBytes(0, 2),
    littleEndianBytes(0, 2),
    littleEndianBytes(entries.length, 2),
    littleEndianBytes(entries.length, 2),
    littleEndianBytes(centralDirectory.length, 4),
    littleEndianBytes(offset, 4),
    littleEndianBytes(0, 2),
  ]);
  return new Blob([concatByteChunks([...fileChunks, centralDirectory, endRecord])], { type: mimeType });
}

async function exportLineupSlides(theme = {}) {
  commitShowMetaFromFields();
  state.show.slideExportTheme = normalizeSlideExportTheme(theme);
  const options = getSlidesExportOptions();
  state.show.slideExportShowTitles = options.showTitles;
  state.show.slideExportShowCredits = options.showCredits;
  state.show.slideExportShowCount = options.showCount;
  saveState();
  const slides = buildLineupSlideDeck();
  const blob = await buildSlidesPptxBlob(slides, state.show.slideExportTheme, options);
  downloadBlob(blob, `${safeFileName(state.show.name || "lineup")}-slides.pptx`, "PowerPoint deck is ready.");
}

function ensureSlidesExportFormInExportDialog() {
  if (!els.exportSlidesPanel || !els.slidesExportForm) return;
  if (els.slidesExportForm.parentElement !== els.exportSlidesPanel) {
    els.exportSlidesPanel.append(els.slidesExportForm);
  }
}

function prepareSlidesExportControls() {
  if (!buildLineupSlideDeck().length) {
    return false;
  }
  ensureSlidesExportFormInExportDialog();
  if (els.slidesExportImage) els.slidesExportImage.value = "";
  if (els.slidesShowTitlesToggle) els.slidesShowTitlesToggle.checked = Boolean(state.show.slideExportShowTitles);
  if (els.slidesShowCreditsToggle) els.slidesShowCreditsToggle.checked = Boolean(state.show.slideExportShowCredits);
  if (els.slidesShowCountToggle) els.slidesShowCountToggle.checked = Boolean(state.show.slideExportShowCount);
  applySlidesExportThemeControls(state.show.slideExportTheme || defaultSlideExportTheme);
  renderSlidesPresetOptions();
  slidesExportPreviewIndex = 0;
  renderSlidesExportPreview();
  return true;
}

function openSlidesExportDialog() {
  if (!prepareSlidesExportControls()) {
    toast("Add songs before exporting slides.");
    return;
  }
  openExportPreview("slides");
}

async function submitSlidesExport(event) {
  event.preventDefault();
  try {
    await persistCurrentSlidesExportTheme();
    await exportLineupSlides(state.show.slideExportTheme);
    closeDialog(els.exportDialog);
  } catch (error) {
    toast(error instanceof Error ? error.message : "Could not export slides.");
  }
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
  window.requestAnimationFrame(() => {
    dialog.scrollTop = 0;
    dialog.querySelector("form, .export-dialog-inner, .slides-editor-shell")?.scrollTo?.({ top: 0 });
  });
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

function isEditableTarget(target) {
  return Boolean(target?.closest?.("input, textarea, select, [contenteditable='true']"));
}

function handleUndoRedoShortcut(event) {
  const modifier = event.metaKey || event.ctrlKey;
  if (!modifier || event.altKey) return;
  const key = event.key.toLowerCase();
  const redo = key === "y" || (key === "z" && event.shiftKey);
  const undo = key === "z" && !event.shiftKey;
  if (!undo && !redo) return;

  if (els.slidesEditorDialog?.open) {
    event.preventDefault();
    if (redo) redoSlidesEditor();
    else undoSlidesEditor();
    return;
  }

  if (document.querySelector("dialog[open]") && isEditableTarget(event.target)) return;
  if (isEditableTarget(event.target)) return;
  event.preventDefault();
  if (redo) redoLineup();
  else undoLineup();
}

function render() {
  els.showName.value = state.show.name || defaultShowName;
  els.showDate.value = state.show.date;
  renderSavedShows();
  renderFilters();
  renderLineup();
  renderSongBank();
  applySidePanelMode();
  if (slidePreviewOpen) renderSlidePreview();
}

function renderSavedShows() {
  if (els.savedShowsCurrent) {
    els.savedShowsCurrent.textContent = `${state.show.name || defaultShowName} · ${formatExportDate(state.show.date)}`;
  }
  const shows = Array.isArray(state.shows) && state.shows.length
    ? state.shows
    : normalizeState(state).shows;
  if (!Array.isArray(state.shows) || !state.shows.length) {
    state = normalizeState({ ...state, shows });
  }
  const visibleShows = shows.filter((show) => !isUnchangedDraftShow(show));
  const folders = Array.isArray(state.setlistFolders) ? state.setlistFolders : [];
  activeSetlistFolderId = "";
  const selectedCount = selectedSetlistIds.size;
  if (els.setlistSelectionBar) els.setlistSelectionBar.hidden = !selectedCount;
  if (els.setlistSelectionCount) els.setlistSelectionCount.textContent = `${selectedCount} selected`;
  if (els.deleteShowButton) els.deleteShowButton.disabled = !selectedCount;
  if (els.moveSetlistsFolder) {
    els.moveSetlistsFolder.innerHTML = `
      <option value="">Move selected...</option>
      <option value="__new">New folder...</option>
      <option value="__unfiled">Unfiled</option>
      ${folders.map((folder) => `<option value="${folder.id}">${escapeHtml(folder.name)}</option>`).join("")}
    `;
    els.moveSetlistsFolder.disabled = !selectedCount;
  }
  els.savedShowsList.innerHTML = visibleShows.length
    ? visibleShows
    .map((show) => `
      <article class="saved-show-chip ${show.id === state.activeShowId ? "active" : ""} ${selectedSetlistIds.has(show.id) ? "selected" : ""}" data-show-id="${show.id}" aria-selected="${selectedSetlistIds.has(show.id) ? "true" : "false"}">
        <label class="setlist-select" aria-label="Select ${escapeHtml(show.name)}">
          <input type="checkbox" data-select-show="${show.id}" ${selectedSetlistIds.has(show.id) ? "checked" : ""} />
        </label>
        <button type="button" class="saved-show-open" data-open-show="${show.id}">
          <span>${escapeHtml(show.name)}</span>
          <small>${escapeHtml(formatExportDate(show.date))}${show.folderId ? ` · ${escapeHtml(folders.find((folder) => folder.id === show.folderId)?.name || "Folder")}` : ""}</small>
        </button>
      </article>
    `)
    .join("")
    : '<div class="empty-state"><div><strong>No saved setlists yet.</strong>Change this setlist to save it.</div></div>';
}

function applySidePanelMode() {
  const showingSetlists = sidePanelMode === "shows";
  const title = showingSetlists ? "Setlists" : "Song bank";
  els.bankPanel?.classList.toggle("shows-mode", showingSetlists);
  els.bankPanel?.setAttribute("aria-label", showingSetlists ? "Saved setlists" : "Song bank");
  if (els.bankPanel) els.bankPanel.dataset.panelTitle = title;
  if (els.bankHeader) els.bankHeader.dataset.panelTitle = title;
  if (els.sidePanelTitle) els.sidePanelTitle.textContent = title;
  if (els.libraryView) els.libraryView.hidden = showingSetlists;
  if (els.showsView) els.showsView.hidden = !showingSetlists;
  if (els.newSongButton) els.newSongButton.hidden = showingSetlists;
  if (els.oneTimeSongButton) els.oneTimeSongButton.hidden = showingSetlists;
  if (els.quickAddButton) els.quickAddButton.hidden = showingSetlists;
  if (els.addSlideOnlyButton) els.addSlideOnlyButton.hidden = showingSetlists;
  if (els.addNoteButton) els.addNoteButton.hidden = showingSetlists;
  if (els.setlistsBackTopButton) els.setlistsBackTopButton.hidden = !showingSetlists;
  els.showsTabButton?.classList.toggle("active", showingSetlists);
}

function setSidePanelMode(mode) {
  sidePanelMode = mode === "shows" ? "shows" : "library";
  els.appShell.classList.remove("bank-collapsed");
  if (isLibraryDrawerLayout() && mobileLibraryState === "minimized") {
    setMobileLibraryState("middle");
    return;
  }
  applySidePanelMode();
}

function openSetlistStartDialog() {
  if (!els.setlistStartDialog || importedSharedLineup) return;
  closeSetlistStartDialog();
}

function closeSetlistStartDialog() {
  closeDialog(els.setlistStartDialog);
}

const coachSteps = [
  {
    target: () => els.newSongButton,
    title: "Add a song",
    text: "Click here to add one song to your song bank."
  },
  {
    target: () => els.quickAddButton,
    title: "Build the bank faster",
    text: "Use Quick Add when you want to paste a whole list at once."
  },
  {
    target: () => els.songBankList?.querySelector(".bank-song") || els.songSearch,
    title: "Send songs to the setlist",
    text: "Click a song or drag it into the setlist."
  },
  {
    target: () => els.exportButton,
    title: "Export from here",
    text: "PDF, DOC, setlist files, print, and slide exports all live in this menu."
  }
];

function positionCoachTip() {
  if (!els.coachOverlay || els.coachOverlay.hidden) return;
  const step = coachSteps[coachStepIndex];
  const target = step?.target?.();
  if (!target || !els.coachTip || !els.coachSpotlight) return;

  const rect = target.getBoundingClientRect();
  const padding = 10;
  els.coachSpotlight.style.left = `${Math.max(8, rect.left - padding)}px`;
  els.coachSpotlight.style.top = `${Math.max(8, rect.top - padding)}px`;
  els.coachSpotlight.style.width = `${rect.width + padding * 2}px`;
  els.coachSpotlight.style.height = `${rect.height + padding * 2}px`;

  const tipWidth = Math.min(330, window.innerWidth - 28);
  const prefersRight = rect.left + rect.width + tipWidth + 28 < window.innerWidth;
  const left = prefersRight ? rect.right + 18 : Math.max(14, Math.min(window.innerWidth - tipWidth - 14, rect.left));
  const top = prefersRight
    ? Math.max(14, Math.min(window.innerHeight - 190, rect.top - 18))
    : Math.min(window.innerHeight - 190, rect.bottom + 18);

  els.coachTip.style.width = `${tipWidth}px`;
  els.coachTip.style.left = `${left}px`;
  els.coachTip.style.top = `${Math.max(14, top)}px`;
}

function renderCoachStep() {
  const step = coachSteps[coachStepIndex];
  if (!step) return;
  if (els.coachStep) els.coachStep.textContent = `Tip ${coachStepIndex + 1} of ${coachSteps.length}`;
  if (els.coachTitle) els.coachTitle.textContent = step.title;
  if (els.coachText) els.coachText.textContent = step.text;
  if (els.dismissOnboardingButton) els.dismissOnboardingButton.textContent = coachStepIndex === coachSteps.length - 1 ? "Done" : "Next";
  window.requestAnimationFrame(positionCoachTip);
}

function maybeShowOnboardingTips() {
  if (!els.coachOverlay) return;
  if (isMobileLayout()) return;
  if (authGateActive || !getCloudSession()) return;
  if (localStorage.getItem(onboardingHiddenStorageKey) === "true") return;
  if (els.setlistStartDialog?.open) return;
  if (!els.coachOverlay.hidden) return;
  window.setTimeout(() => {
    if (!els.setlistStartDialog?.open && localStorage.getItem(onboardingHiddenStorageKey) !== "true") {
      coachStepIndex = 0;
      localStorage.setItem(onboardingHiddenStorageKey, "true");
      els.coachOverlay.hidden = false;
      document.body.classList.add("coach-active");
      renderCoachStep();
    }
  }, 420);
}

function closeOnboardingTips(keepHidden = false) {
  localStorage.setItem(onboardingHiddenStorageKey, "true");
  if (!els.coachOverlay) return;
  els.coachOverlay.hidden = true;
  document.body.classList.remove("coach-active");
}

function advanceOnboardingTips() {
  if (!els.coachOverlay || els.coachOverlay.hidden) return;
  if (coachStepIndex >= coachSteps.length - 1) {
    closeOnboardingTips(false);
    return;
  }
  coachStepIndex += 1;
  renderCoachStep();
}

function getCurrentCoachTarget() {
  const step = coachSteps[coachStepIndex];
  const target = step?.target?.();
  return target instanceof HTMLElement ? target : null;
}

function handleCoachOverlayClick(event) {
  if (!els.coachOverlay || els.coachOverlay.hidden) return;
  if (event.target.closest?.(".coach-tip")) return;

  const target = getCurrentCoachTarget();
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const padding = 14;
  const x = event.clientX;
  const y = event.clientY;
  const withinTarget =
    x >= rect.left - padding &&
    x <= rect.right + padding &&
    y >= rect.top - padding &&
    y <= rect.bottom + padding;

  if (!withinTarget) return;
  event.preventDefault();
  event.stopPropagation();
  target.click();
  window.setTimeout(advanceOnboardingTips, 80);
}

function bindOnboardingControlEvents() {
  if (document.body.dataset.coachControlsBound) return;
  document.body.dataset.coachControlsBound = "true";

  els.coachTip?.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  els.dismissOnboardingButton?.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      advanceOnboardingTips();
    },
    true
  );
  els.dontShowTipsButton?.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      closeOnboardingTips(true);
    },
    true
  );
  els.coachOverlay?.addEventListener("click", handleCoachOverlayClick);
}

function finishIntro() {
  document.body.classList.remove("intro-active");
  document.body.classList.add("intro-complete");
  if (els.lineupIntro) els.lineupIntro.hidden = true;
}

function showIntroThenStart() {
  if (isMobileLayout()) {
    finishIntro();
    ensureSignedInForApp();
    return;
  }
  if (!els.lineupIntro || importedSharedLineup) {
    finishIntro();
    if (importedSharedLineup) {
      ensureSignedInForApp().then((allowed) => {
        if (allowed) maybeShowOnboardingTips();
      });
    } else {
      ensureSignedInForApp().then((allowed) => {
        if (allowed) maybeShowOnboardingTips();
      });
    }
    return;
  }
  window.setTimeout(() => {
    els.lineupIntro.classList.add("is-leaving");
    window.setTimeout(() => {
      finishIntro();
      ensureSignedInForApp().then((allowed) => {
        if (allowed) maybeShowOnboardingTips();
      });
    }, 360);
  }, 680);
}

function isPhoneLandscapeLayout() {
  return window.matchMedia("(max-height: 520px) and (orientation: landscape) and (pointer: coarse)").matches;
}

function isMobileLayout() {
  return window.matchMedia("(max-width: 760px)").matches || isPhoneLandscapeLayout();
}

function isLandscapeSideBankLayout() {
  return isPhoneLandscapeLayout()
    || window.matchMedia("(min-width: 761px) and (max-width: 1200px) and (orientation: landscape) and (pointer: coarse)").matches;
}

function isTabletPortraitLayout() {
  return window.matchMedia("(min-width: 761px) and (max-width: 1100px) and (orientation: portrait)").matches;
}

function isLibraryDrawerLayout() {
  return (window.matchMedia("(max-width: 760px)").matches && !isPhoneLandscapeLayout()) || isTabletPortraitLayout();
}

function isTouchReorderLayout() {
  return window.matchMedia("(max-width: 1100px)").matches;
}

function setMobileLibraryExpanded(expanded) {
  mobileLibraryExpanded = Boolean(expanded) && isLibraryDrawerLayout();
  els.bankPanel?.style.removeProperty("--mobile-library-height");
  els.bankPanel?.classList.toggle("mobile-expanded", mobileLibraryExpanded);
}

function setMobileLibraryState(stateName) {
  if (!isLibraryDrawerLayout()) return;
  const nextState = ["minimized", "middle", "full"].includes(stateName) ? stateName : "middle";
  mobileLibraryState = nextState;
  mobileLibraryExpanded = nextState === "full";
  els.bankPanel?.style.removeProperty("--mobile-library-height");
  els.appShell?.classList.toggle("bank-collapsed", nextState === "minimized");
  els.bankPanel?.classList.toggle("mobile-expanded", nextState === "full");
  applySidePanelMode();
}

function openMobileLibraryDrawer(expand = false) {
  if (!isLibraryDrawerLayout()) {
    if (isLandscapeSideBankLayout()) setSidePanelMode("library");
    return;
  }
  setSidePanelMode("library");
  setMobileLibraryState(expand ? "full" : "middle");
}

function handleAddFirstSongAction() {
  if (state.songs.length) {
    openMobileLibraryDrawer(true);
    window.setTimeout(() => {
      if (isLibraryDrawerLayout()) els.songSearch?.focus({ preventScroll: true });
    }, 180);
    return;
  }
  populateFormOptions();
  openSongDialog();
}

function closeMobileLibraryDrawer() {
  if (isLibraryDrawerLayout()) {
    setMobileLibraryState("minimized");
    return;
  }
  setMobileLibraryExpanded(false);
  els.appShell.classList.add("bank-collapsed");
  applySidePanelMode();
}

function handleMobileMenuCommand(command) {
  if (command === "shows") {
    setSidePanelMode("shows");
    return;
  }
  if (command === "home") {
    openSongleadingHome();
    return;
  }
  if (command === "save") {
    commitShowMetaFromFields();
    saveState();
    toast("Setlist saved on this device.");
    return;
  }
  if (command === "export") {
    commitShowMetaFromFields();
    openExportPreview();
    return;
  }
  if (command === "slides") {
    setSlidePreviewOpen(!slidePreviewOpen);
    return;
  }
  if (command === "theme") {
    toggleTheme();
    return;
  }
}

function handleMobileControl(control, event) {
  if (!isMobileLayout() || !control) return false;
  const command = control.dataset?.mobileCommand;
  if (command) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();
    if (els.headerMenu) els.headerMenu.open = false;
    handleMobileMenuCommand(command);
    return true;
  }
  if (control.id === "homeButton") {
    return false;
  }
  return false;
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

function applyAccent(accent) {
  const nextAccent = accentChoices.includes(accent) ? accent : "blue";
  document.documentElement.dataset.accent = nextAccent;
  localStorage.setItem(accentStorageKey, nextAccent);
  updateAccentChoices();
}

function toggleTheme() {
  applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
  toast(`${document.documentElement.dataset.theme === "light" ? "Light" : "Dark"} mode enabled.`);
}

function activeLibraryFilterCount() {
  return activeCategories.size + (hebrewOnly ? 1 : 0) + (bangersOnly ? 1 : 0);
}

function updateFilterToggleButton() {
  if (!els.toggleFiltersButton) return;
  const activeCount = activeLibraryFilterCount();
  els.toggleFiltersButton.classList.toggle("active", libraryFiltersOpen || activeCount > 0);
  els.toggleFiltersButton.dataset.count = activeCount ? String(activeCount) : "";
  els.toggleFiltersButton.setAttribute("aria-expanded", String(libraryFiltersOpen));
  els.toggleFiltersButton.setAttribute("aria-label", libraryFiltersOpen ? "Hide filters" : "Show filters");
  els.toggleFiltersButton.title = libraryFiltersOpen ? "Hide filters" : "Filters";
}

function renderFilters() {
  if (!els.categoryFilters) return;
  els.categoryFilters.hidden = !libraryFiltersOpen;
  updateFilterToggleButton();
  els.categoryFilters.innerHTML = `
    <div class="filter-group" aria-label="Song type filters">
      <div class="filter-options">
        ${categories
          .map((category) => {
            const active = activeCategories.has(category.name) ? "active" : "";
            return `<button class="filter-chip ${active}" data-category="${category.name}" style="--chip-color:${category.color}">${category.name}</button>`;
          })
          .join("")}
        <button class="hebrew-filter ${hebrewOnly ? "active" : ""}" type="button" data-hebrew-filter aria-label="Show Hebrew songs" title="Show Hebrew songs">
          He
        </button>
        <button class="banger-filter ${bangersOnly ? "active" : ""}" type="button" data-banger-filter aria-label="Show only bangers" title="Show only bangers">
          ${flameIcon()}
        </button>
      </div>
    </div>
  `;
}

function toggleLibraryFilters() {
  libraryFiltersOpen = !libraryFiltersOpen;
  renderFilters();
}

function handleHomeButtonClick(event) {
  if (!isMobileLayout() || !els.homeButton) return;
  if (els.homeButton.classList.contains("address-revealed")) return;
  event.preventDefault();
  event.stopPropagation();
  els.homeButton.classList.add("address-revealed");
  els.homeButton.setAttribute("aria-label", "Open songleading.net");
  els.homeButton.title = "Tap again to open songleading.net";
}

function renderLineup() {
  els.lineupRows?.classList.toggle("is-empty", !state.lineup.length);
  if (!state.lineup.length) {
    els.lineupRows.innerHTML = renderEmptyLineupState();
    renderLineupHealth();
    return;
  }

  els.lineupRows.innerHTML = state.lineup
    .map((item, index) => {
      if (item.type === "note") return renderNoteRow(item, index);
      if (item.type === "slide") return renderSlideOnlyRow(item, index);
      const song = songForLineupItem(item);
      if (!song) return "";
      const category = categoryFor(songCategoryNames(song));
      const slideClass = slidesButtonClass(item);
      const slideTitle = slidesButtonTitle(item);
      const sheetCount = sheetAttachmentsForLineupItem(item).length;
      const sheetTitle = sheetCount ? sheetCountLabel(item) : "Add Sheets";
      const readyLabel = item.ready ? "Ready" : "Not ready";
      const metaLabel = songMetaLabel(song);
      return `
        <article class="lineup-row song-row ${draggedLineupId === item.id ? "dragging" : ""}" style="--category-color:${category.color}" data-lineup-id="${item.id}" draggable="true">
          <div class="drag-handle" role="button" tabindex="0" aria-label="Drag to reorder" title="Drag to reorder">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01"/></svg>
          </div>
          <div class="song-number">${index + 1}</div>
          <div class="song-title-wrap">
            <div class="song-text">
              <div class="song-name-line">
                <div class="song-name">${escapeHtml(song.title)}</div>
                ${song.banger ? `<span class="lineup-title-banger" title="Banger">${flameIcon()}</span>` : ""}
              </div>
              ${metaLabel ? `<div class="subline">${escapeHtml(metaLabel)}</div>` : ""}
            </div>
          </div>
          <div class="lineup-mobile-controls">
            <label class="line-song-note">
              <input value="${escapeHtml(item.note || "")}" maxlength="80" placeholder="-" data-action="note" data-lineup-id="${item.id}" aria-label="Notes for ${escapeHtml(song.title)}" title="Song note" />
            </label>
            <button class="mobile-note-button ${item.note ? "has-note" : ""}" data-action="edit-lineup-note" data-lineup-id="${item.id}" aria-label="Song note for ${escapeHtml(song.title)}" title="${item.note ? "Edit song note" : "Add song note"}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>
            </button>
            <div class="capo-cell">
              <select class="capo-select" data-action="capo" data-lineup-id="${item.id}" aria-label="Capo for ${escapeHtml(song.title)}">
                ${renderCapoOptions(item.capo || "", true)}
              </select>
            </div>
            <div class="key-cell">
              <select class="key-select" data-action="key" data-lineup-id="${item.id}" aria-label="Key for ${escapeHtml(song.title)}">
                ${keys.map((key) => `<option value="${key}" ${key === (item.key || song.key) ? "selected" : ""}>${key}</option>`).join("")}
              </select>
            </div>
            <button class="slides-status-button ${slideClass}" data-action="slides" data-lineup-id="${item.id}" aria-label="Slides for ${escapeHtml(song.title)}: ${slideTitle}" title="${slideTitle}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v12H4z"/><path d="M8 21h8"/><path d="M12 17v4"/><path d="M8 9h8M8 13h5"/></svg>
              <span>${escapeHtml(slideTitle)}</span>
            </button>
            <button class="sheets-status-button ${sheetCount ? "has-sheets" : ""}" data-action="sheets" data-lineup-id="${item.id}" aria-label="${sheetTitle} for ${escapeHtml(song.title)}" title="${sheetTitle}">
              ${sheetIcon()}
              <span>${sheetCount || ""}</span>
            </button>
            <button class="ready-toggle ${item.ready ? "ready" : ""}" data-action="ready" data-lineup-id="${item.id}" aria-label="${readyLabel} for ${escapeHtml(song.title)}" title="${readyLabel}">
              ${item.ready ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>' : ""}
              <span>${readyLabel}</span>
            </button>
          </div>
          <div class="row-icon-actions">
            <button class="icon-action" data-action="info" data-song-id="${song.id}" aria-label="Edit ${escapeHtml(song.title)}" title="Edit song">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
            </button>
            <button class="icon-action danger" data-action="remove" data-lineup-id="${item.id}" aria-label="Remove ${escapeHtml(song.title)}" title="Remove">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
            </button>
          </div>
        </article>
      `;
    })
    .join("");
  renderLineupHealth();
}

function renderSlideOnlyRow(item, index) {
  const title = item.title || "Slide only";
  const slideClass = slidesButtonClass(item);
  const slideTitle = slidesButtonTitle(item);
  const pictureTitle = item.image ? "Change picture" : "Add full-screen picture";
  return `
    <article class="lineup-row song-row slide-only-row ${draggedLineupId === item.id ? "dragging" : ""}" style="--category-color:#f3ae22" data-lineup-id="${item.id}" draggable="true">
      <div class="drag-handle" role="button" tabindex="0" aria-label="Drag to reorder" title="Drag to reorder">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01"/></svg>
      </div>
      <div class="song-number">${index + 1}</div>
      <div class="song-title-wrap">
        <div class="song-text">
          <div class="song-name-line">
            <div class="song-name">${escapeHtml(title)}</div>
          </div>
          <div class="subline slide-only-subline">Slide only - Not on the setlist!</div>
        </div>
      </div>
      <div class="lineup-mobile-controls slide-only-controls">
        <button class="slide-only-inline-image-button ${item.image ? "has-image" : ""}" data-action="slide-image" data-lineup-id="${item.id}" aria-label="${pictureTitle} for ${escapeHtml(title)}" title="${pictureTitle}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 15l3-3 3 3 2-2 3 3"/><circle cx="9" cy="9" r="1.2"/></svg>
        </button>
        <span class="slide-only-control-spacer" aria-hidden="true"></span>
        <span class="slide-only-control-spacer" aria-hidden="true"></span>
        <button class="slides-status-button ${slideClass}" data-action="slides" data-lineup-id="${item.id}" aria-label="Slides for ${escapeHtml(title)}: ${slideTitle}" title="${slideTitle}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v12H4z"/><path d="M8 21h8"/><path d="M12 17v4"/><path d="M8 9h8M8 13h5"/></svg>
          <span>${escapeHtml(slideTitle)}</span>
        </button>
        <span class="ready-toggle-placeholder" aria-hidden="true"></span>
      </div>
      <div class="row-icon-actions">
        <button class="icon-action" data-action="edit-slide-title" data-lineup-id="${item.id}" aria-label="Rename ${escapeHtml(title)}" title="Rename slide">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
        </button>
        <button class="icon-action ${item.image ? "is-active" : ""}" data-action="slide-image" data-lineup-id="${item.id}" aria-label="${pictureTitle} for ${escapeHtml(title)}" title="${pictureTitle}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 15l3-3 3 3 2-2 3 3"/><circle cx="9" cy="9" r="1.2"/></svg>
        </button>
        <button class="icon-action danger" data-action="remove" data-lineup-id="${item.id}" aria-label="Remove ${escapeHtml(title)}" title="Remove">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
        </button>
      </div>
    </article>
  `;
}

function renderNoteRow(item, index) {
  return `
    <article class="lineup-row note-row ${draggedLineupId === item.id ? "dragging" : ""}" data-lineup-id="${item.id}" draggable="true">
      <div class="drag-handle" role="button" tabindex="0" aria-label="Drag to reorder" title="Drag to reorder">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01"/></svg>
      </div>
      <div class="song-number">${index + 1}</div>
      <div class="song-text">
        <div class="note-title">Note</div>
        <div class="note-text">${escapeHtml(item.text)}</div>
      </div>
      <div class="note-inline-actions">
        <button class="icon-action" data-action="edit-note" data-lineup-id="${item.id}" aria-label="Edit note" title="Edit note">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
        </button>
        <button class="icon-action danger" data-action="remove" data-lineup-id="${item.id}" aria-label="Remove note" title="Remove">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
        </button>
      </div>
    </article>
  `;
}

function renderSongBank() {
  const librarySearch = parseLibrarySearch(searchTerm);
  const filtered = state.songs
    .filter((song) => !activeCategories.size || songCategoryNames(song).some((category) => activeCategories.has(category)))
    .filter((song) => !bangersOnly || song.banger)
    .filter((song) => !hebrewOnly || song.hebrew)
    .filter((song) => !librarySearch.hebrewOnly || song.hebrew)
    .filter((song) => {
      const haystack = `${song.title} ${songCategoryNames(song).join(" ")} ${tagString(song.tags)}`.toLowerCase();
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
      const category = categoryFor(songCategoryNames(song));
      const addedCount = state.lineup.filter((item) => item.type === "song" && item.songId === song.id).length;
      const alreadyAdded = addedCount > 0;
      const addedTitle = addedCount > 1 ? `Added ${addedCount} times to this setlist` : "Already in this setlist";
      const sheetCount = song.sheetAttachments?.length || 0;
      const sheetTitle = sheetCount ? sheetCountLabel(song) : "Add Sheets";
      return `
        <article class="bank-song ${alreadyAdded ? "is-in-lineup" : ""} ${draggedBankSongId === song.id ? "dragging" : ""}" style="--category-color:${category.color}" data-song-id="${song.id}" draggable="true" role="button" tabindex="0" aria-label="${alreadyAdded ? `${addedTitle}. Click to add again` : "Add"} ${escapeHtml(song.title)} to setlist" title="${alreadyAdded ? addedTitle : "Click to add to setlist"}">
            <span class="bank-song-main">
              ${alreadyAdded ? `<span class="bank-added-badge" title="${addedTitle}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>${addedCount > 1 ? `<span>${addedCount}</span>` : ""}</span>` : ""}
              <span class="song-name">${escapeHtml(song.title)}</span>
              ${song.hebrew ? `<span class="hebrew-badge" title="Contains Hebrew">He</span>` : ""}
              ${normalizeTags(song.tags).length ? `<span class="bank-tags">${normalizeTags(song.tags).slice(0, 3).map((tag) => `#${escapeHtml(tag)}`).join(" ")}</span>` : ""}
            </span>
          <button class="banger-toggle ${song.banger ? "active" : ""}" data-action="toggle-banger" data-song-id="${song.id}" aria-label="${song.banger ? "Remove banger mark" : "Mark as banger"}" title="${song.banger ? "Remove banger mark" : "Mark as banger"}">
            ${flameIcon()}
          </button>
          <button class="slides-status-button bank-slides-button ${slidesButtonClass(song)}" data-action="slides" data-song-id="${song.id}" aria-label="Slides for ${escapeHtml(song.title)}: ${slidesButtonTitle(song)}" title="${slidesButtonTitle(song)}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v12H4z"/><path d="M8 21h8"/><path d="M12 17v4"/><path d="M8 9h8M8 13h5"/></svg>
          </button>
          <button class="sheets-status-button bank-sheets-button ${sheetCount ? "has-sheets" : ""}" data-action="sheets" data-song-id="${song.id}" aria-label="${sheetTitle} for ${escapeHtml(song.title)}" title="${sheetTitle}">
            ${sheetIcon()}
          </button>
          <button class="icon-action bank-edit-button" data-action="edit-bank" data-song-id="${song.id}" aria-label="Edit ${escapeHtml(song.title)}" title="Edit song">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
          </button>
        </article>
      `;
    })
    .join("");
}

function populateFormOptions() {
  els.songCategoryButtons.innerHTML = categories
    .map((category) => `
      <button class="category-choice-button" type="button" data-song-category="${category.name}" style="--chip-color:${category.color}" role="checkbox" aria-checked="false">
        ${category.name}
      </button>
    `)
    .join("");
  els.songKey.innerHTML = keys.map((key) => `<option value="${key}">${key}</option>`).join("");
  els.songCapo.innerHTML = capoOptions.map((capo) => `<option value="${capo}">${capo || "None"}</option>`).join("");
}

function setSongCategoryChoice(categoryName) {
  const category = normalizeCategoryName(categoryName);
  if (!category) return;
  const selectedCategories = new Set(normalizeSongCategories(els.songCategory.value));
  if (selectedCategories.has(category)) selectedCategories.delete(category);
  else selectedCategories.add(category);
  setSongCategoryChoices([...selectedCategories]);
}

function setSongCategoryChoices(categoryNames) {
  els.songCategory.value = normalizeSongCategories(categoryNames).join("|");
  syncSongCategoryButtons();
}

function syncSongCategoryButtons() {
  const selectedCategories = new Set(normalizeSongCategories(els.songCategory.value));
  els.songCategoryButtons.querySelectorAll("[data-song-category]").forEach((button) => {
    const active = selectedCategories.has(button.dataset.songCategory);
    button.classList.toggle("active", active);
    button.setAttribute("aria-checked", String(active));
  });
}

function openSongDialog(song = null) {
  songDialogMode = "library";
  els.songForm.reset();
  els.songId.value = song?.id || "";
  els.dialogMode.textContent = song ? "Edit" : "New";
  els.dialogTitle.textContent = song ? "Edit Song" : "Create New Song";
  els.deleteSongButton.hidden = !song;
  if (els.addOneTimeSongButton) els.addOneTimeSongButton.hidden = Boolean(song);
  if (els.saveSongButton) els.saveSongButton.querySelector("span").textContent = "Save";
  els.songTitle.value = song?.title || "";
  setSongCategoryChoices(song ? songCategoryNames(song) : []);
  els.songKey.value = song?.key || "C";
  els.songCapo.value = song?.capo || "";
  els.songDuration.value = song?.duration || "";
  els.songHebrew.checked = song ? Boolean(song.hebrew) : false;
  els.songBanger.checked = song ? Boolean(song.banger) : false;
  els.songCredits.value = song?.credits || "";
  els.songTags.value = tagString(song?.tags || []);
  els.songNotes.value = song?.notes || "";
  renderTagSuggestions(song?.id || "");
  openDialog(els.songDialog);
  setTimeout(() => els.songTitle.focus(), 50);
}

function openOneTimeSongDialog(item = null) {
  songDialogMode = "one-time";
  const song = item?.oneTimeSong ? normalizeOneTimeSong(item.oneTimeSong) : null;
  els.songForm.reset();
  els.songId.value = item?.id || "";
  els.dialogMode.textContent = item ? "Setlist" : "One-time";
  els.dialogTitle.textContent = item ? "Edit One-Time Song" : "Add One-Time Song";
  els.deleteSongButton.hidden = true;
  if (els.addOneTimeSongButton) els.addOneTimeSongButton.hidden = true;
  if (els.saveSongButton) els.saveSongButton.querySelector("span").textContent = item ? "Save" : "Add";
  els.songTitle.value = song?.title || "";
  setSongCategoryChoices(song ? songCategoryNames(song) : []);
  els.songKey.value = song?.key || "C";
  els.songCapo.value = song?.capo || "";
  els.songDuration.value = song?.duration || "";
  els.songHebrew.checked = song ? Boolean(song.hebrew) : false;
  els.songBanger.checked = song ? Boolean(song.banger) : false;
  els.songCredits.value = song?.credits || "";
  els.songTags.value = tagString(song?.tags || []);
  els.songNotes.value = song?.notes || "";
  renderTagSuggestions("");
  openDialog(els.songDialog);
  setTimeout(() => els.songTitle.focus(), 50);
}

function songFromDialogFields(id = makeId("song"), existingSong = {}) {
  const selectedCategories = normalizeSongCategories(els.songCategory.value);
  return {
    ...(existingSong || {}),
    id,
    title: els.songTitle.value.trim(),
    category: selectedCategories[0] || "",
    categories: selectedCategories,
    key: els.songKey.value,
    capo: els.songCapo.value,
    duration: els.songDuration.value.trim(),
    banger: Boolean(els.songBanger.checked),
    hebrew: els.songHebrew.checked,
    credits: els.songCredits.value.trim(),
    tags: normalizeTags(els.songTags.value),
    notes: els.songNotes.value.trim(),
  };
}

function upsertSong(event) {
  event.preventDefault();
  if (songDialogMode === "one-time") {
    upsertOneTimeSongFromDialog();
    return;
  }
  const songId = els.songId.value || makeId("song");
  const existingSong = state.songs.find((candidate) => candidate.id === songId);
  const song = songFromDialogFields(songId, existingSong || {});

  if (!song.title) return;
  const existingIndex = state.songs.findIndex((candidate) => candidate.id === song.id);
  recordLineupUndo();
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

function oneTimeLineupItemFromSong(song) {
  return {
    id: makeId("lineup"),
    type: "song",
    songId: "",
    oneTimeSong: normalizeOneTimeSong(song),
    capo: song.capo,
    key: song.key,
    ready: false,
    note: "",
    slidesStatus: "no-slides",
    slideSongId: "",
    slideFlowId: "",
    slideSaveScope: "local",
  };
}

function addOneTimeSongFromDialog(event) {
  event?.preventDefault?.();
  const duration = els.songDuration.value.trim();
  if (duration && !/^[0-9]{1,2}:[0-5][0-9]$/.test(duration)) {
    els.songDuration.focus();
    toast("Duration should look like 4:20, or leave it blank.");
    return false;
  }
  const song = songFromDialogFields(makeId("once"));
  if (!song.title) {
    els.songTitle.focus();
    toast("Add a song title first.");
    return false;
  }
  recordLineupUndo();
  state.lineup.push(oneTimeLineupItemFromSong(song));
  saveState();
  closeDialog(els.songDialog);
  render();
  toast(`Added "${song.title}" to this setlist only.`);
  return true;
}

function upsertOneTimeSongFromDialog() {
  const lineupId = els.songId.value;
  const item = state.lineup.find((candidate) => candidate.id === lineupId);
  if (!item) return addOneTimeSongFromDialog();
  const previous = item.oneTimeSong || {};
  const song = normalizeOneTimeSong(songFromDialogFields(previous.id || makeId("once"), previous));
  if (!song.title) return;
  recordLineupUndo();
  item.oneTimeSong = song;
  item.songId = "";
  item.key = song.key;
  item.capo = song.capo;
  item.slideSaveScope = "local";
  saveState();
  closeDialog(els.songDialog);
  render();
  toast("One-time song updated.");
  return true;
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

function makeQuickAddRow(title = "", category = [...activeCategories][0] || "", credits = "", banger = false) {
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
        <select data-quick-category aria-label="Filter">
          <option value="" ${row.category ? "" : "selected"}>No filter</option>
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
      category: normalizeSongCategories(row.category)[0] || "",
      categories: normalizeSongCategories(row.category),
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

  recordLineupUndo();
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
  recordLineupUndo();
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
  recordLineupUndo();
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
    slideSaveScope: "global",
  };
  if (Number.isInteger(insertAt) && insertAt >= 0 && insertAt <= state.lineup.length) {
    state.lineup.splice(insertAt, 0, lineupItem);
  } else {
    state.lineup.push(lineupItem);
  }
  saveState();
  renderLineup();
  if (showMessage) toast(`Added "${song.title}" to the setlist.`);
  return lineupItem;
}

function addSlideOnlyItem() {
  const title = safeText(window.prompt("Slide title", "Slide only") || "", 70);
  if (!title) return;
  recordLineupUndo();
  const item = {
    id: makeId("lineup"),
    type: "slide",
    title,
    slidesStatus: "no-slides",
    slideSongId: "",
    slideFlowId: "",
    slideSaveScope: "local",
    image: "",
    imageName: "",
  };
  state.lineup.push(item);
  saveState();
  renderLineup();
  toast("Slide-only item added.");
  openSlidesForLineup(item.id);
}

function editSlideOnlyTitle(lineupId) {
  const item = state.lineup.find((candidate) => candidate.id === lineupId && candidate.type === "slide");
  if (!item) return;
  const title = safeText(window.prompt("Slide title", item.title || "Slide only") || "", 70);
  if (!title || title === item.title) return;
  recordLineupUndo();
  item.title = title;
  if (item.localSlideSong) item.localSlideSong.title = title;
  saveState();
  renderLineup();
  if (slidePreviewOpen) renderSlidePreview();
  toast("Slide renamed.");
}

function chooseSlideOnlyImage(lineupId) {
  const item = state.lineup.find((candidate) => candidate.id === lineupId && candidate.type === "slide");
  if (!item || !els.slideOnlyImageInput) return;
  pendingSlideOnlyImageLineupId = lineupId;
  els.slideOnlyImageInput.value = "";
  els.slideOnlyImageInput.click();
}

async function attachSlideOnlyImageFromInput() {
  if (!pendingSlideOnlyImageLineupId) return;
  const lineupId = pendingSlideOnlyImageLineupId;
  pendingSlideOnlyImageLineupId = "";
  const item = state.lineup.find((candidate) => candidate.id === lineupId && candidate.type === "slide");
  if (!item) return;

  try {
    const rawImage = await imageInputToDataUrl(els.slideOnlyImageInput);
    const image = safeImageValue(rawImage);
    if (!image) {
      toast("Use a PNG, JPG, or WebP image under 1.5 MB.");
      return;
    }
    recordLineupUndo();
    item.image = image;
    item.imageName = safeText(els.slideOnlyImageInput?.files?.[0]?.name || "", 90);
    item.slidesStatus = "slides-ready";
    item.slideSaveScope = "local";
    saveState();
    renderLineup();
    if (slidePreviewOpen) renderSlidePreview();
    toast("Full-screen picture slide added.");
  } catch (error) {
    console.error("Slide image could not be added.", error);
    toast("Could not add that picture.");
  }
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

function openLineupSongNoteDialog(item) {
  if (!item || item.type !== "song") return;
  els.noteForm.reset();
  els.noteId.value = item.id;
  els.noteText.value = item.note || "";
  els.noteDialogMode.textContent = "Song";
  els.noteDialogTitle.textContent = item.note ? "Edit Song Note" : "Add Song Note";
  els.deleteNoteButton.hidden = !item.note;
  openDialog(els.noteDialog);
  setTimeout(() => els.noteText.focus(), 50);
}

function saveNote(event) {
  event.preventDefault();
  const text = els.noteText.value.trim();
  if (!text) return;

  const existing = state.lineup.find((item) => item.id === els.noteId.value);
  recordLineupUndo();
  if (existing) {
    if (existing.type === "song") {
      existing.note = text;
      toast("Song note updated.");
    } else {
      existing.text = text;
      toast("Note updated.");
    }
  } else {
    state.lineup.push({ id: makeId("lineup"), type: "note", text });
    toast("Note added to setlist.");
  }

  saveState();
  closeDialog(els.noteDialog);
  renderLineup();
}

function deleteNote() {
  const id = els.noteId.value;
  const existing = state.lineup.find((item) => item.id === id);
  recordLineupUndo();
  if (existing?.type === "song") {
    existing.note = "";
  } else {
    state.lineup = state.lineup.filter((item) => item.id !== id);
  }
  saveState();
  closeDialog(els.noteDialog);
  renderLineup();
  toast(existing?.type === "song" ? "Song note cleared." : "Note removed.");
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
  updateAccentChoices();
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

function updateAccentChoices() {
  if (!els.accentChoiceGrid) return;
  const activeAccent = document.documentElement.dataset.accent || "blue";
  els.accentChoiceGrid.querySelectorAll("[data-accent-choice]").forEach((button) => {
    const active = button.dataset.accentChoice === activeAccent;
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
  state.show = showStateFromShow(show);
  state.lineup = show.lineup;
  saveState();
  render();
  setSidePanelMode("library");
  toast(`Opened ${show.name}.`);
}

function createNewShow() {
  syncActiveShowFromFields();
  recordLineupUndo();
  const show = {
    id: makeId("show"),
    name: defaultShowName,
    date: new Date().toISOString().slice(0, 10),
    notes: "",
    team: "",
    slideExportTheme: defaultSlideExportTheme,
    slideExportShowTitles: false,
    slideExportShowCredits: false,
    slideExportShowCount: false,
    folderId: activeSetlistFolderId && activeSetlistFolderId !== "unfiled" ? activeSetlistFolderId : "",
    draft: true,
    lineup: [],
  };
  state.shows.unshift(show);
  state.activeShowId = show.id;
  state.show = showStateFromShow(show);
  state.lineup = show.lineup;
  render();
  els.showName.focus();
  els.showName.select();
  toast("New setlist started. It will save after you change it.");
}

function duplicateCurrentShow() {
  syncActiveShowFromFields();
  const current = activeShow();
  recordLineupUndo();
  const copy = {
    id: makeId("show"),
    name: `${current.name} Copy`,
    date: current.date,
    notes: current.notes || "",
    team: current.team || "",
    slideExportTheme: normalizeSlideExportTheme(current.slideExportTheme || {}),
    slideExportShowTitles: Boolean(current.slideExportShowTitles),
    slideExportShowCredits: Boolean(current.slideExportShowCredits),
    slideExportShowCount: Boolean(current.slideExportShowCount),
    folderId: current.folderId || "",
    lineup: JSON.parse(JSON.stringify(current.lineup || [])),
  };
  state.shows.unshift(copy);
  state.activeShowId = copy.id;
  state.show = showStateFromShow(copy);
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
  recordLineupUndo();
  state.shows = state.shows.filter((show) => show.id !== current.id);
  const next = state.shows[0];
  state.activeShowId = next.id;
  state.show = showStateFromShow(next);
  state.lineup = next.lineup;
  saveState();
  render();
  toast("Show deleted.");
}

function openSetlistFolderDialog({ moveSelection = false } = {}) {
  setlistFolderDialogMoveSelection = Boolean(moveSelection);
  if (els.setlistFolderDialogTitle) {
    els.setlistFolderDialogTitle.textContent = setlistFolderDialogMoveSelection ? "New Folder for Selected" : "New Folder";
  }
  if (els.setlistFolderName) els.setlistFolderName.value = "";
  openDialog(els.setlistFolderDialog);
  window.setTimeout(() => els.setlistFolderName?.focus(), 0);
}

function createSetlistFolderFromName(name, { moveSelection = false } = {}) {
  const folderName = String(name || "").trim();
  if (!folderName) return null;
  recordLineupUndo();
  state.setlistFolders = Array.isArray(state.setlistFolders) ? state.setlistFolders : [];
  const folder = { id: makeId("folder"), name: folderName };
  state.setlistFolders.push(folder);
  if (moveSelection && selectedSetlistIds.size) {
    state.shows = state.shows.map((show) => selectedSetlistIds.has(show.id) ? { ...show, folderId: folder.id } : show);
    selectedSetlistIds = new Set();
  }
  saveState();
  renderSavedShows();
  toast(moveSelection ? "Folder created and selected setlists moved." : "Folder created.");
  return folder;
}

function createSetlistFolder() {
  openSetlistFolderDialog();
}

function saveSetlistFolderFromDialog(event) {
  event.preventDefault();
  const folder = createSetlistFolderFromName(els.setlistFolderName?.value, {
    moveSelection: setlistFolderDialogMoveSelection,
  });
  if (!folder) {
    els.setlistFolderName?.focus();
    return;
  }
  closeDialog(els.setlistFolderDialog);
}

function deleteSelectedSetlists() {
  if (!selectedSetlistIds.size) {
    toast("Press and hold a setlist to select it first.");
    return;
  }
  const nextShows = state.shows.filter((show) => !selectedSetlistIds.has(show.id));
  if (!nextShows.length) {
    toast("Keep at least one setlist.");
    return;
  }
  recordLineupUndo();
  state.shows = nextShows;
  if (!state.shows.some((show) => show.id === state.activeShowId)) {
    const next = state.shows[0];
    state.activeShowId = next.id;
    state.show = showStateFromShow(next);
    state.lineup = next.lineup;
  }
  selectedSetlistIds = new Set();
  saveState();
  render();
  toast("Selected setlists deleted.");
}

function moveSelectedSetlists(folderId) {
  if (!selectedSetlistIds.size) return;
  if (folderId === "__new") {
    openSetlistFolderDialog({ moveSelection: true });
    return;
  }
  const nextFolderId = folderId === "__unfiled" ? "" : folderId;
  recordLineupUndo();
  state.shows = state.shows.map((show) => selectedSetlistIds.has(show.id) ? { ...show, folderId: nextFolderId } : show);
  selectedSetlistIds = new Set();
  saveState();
  renderSavedShows();
  toast(nextFolderId ? "Setlists moved." : "Setlists moved to Unfiled.");
}

function toggleSetlistSelection(showId, forceSelected) {
  if (!showId) return;
  const selected = typeof forceSelected === "boolean" ? forceSelected : !selectedSetlistIds.has(showId);
  if (selected) selectedSetlistIds.add(showId);
  else selectedSetlistIds.delete(showId);
  renderSavedShows();
}

function clearSetlistLongPressTimer() {
  window.clearTimeout(setlistLongPressTimer);
  setlistLongPressTimer = null;
  setlistLongPressTargetId = "";
}

function bindSetlistLongPressSelection() {
  if (!els.savedShowsList || els.savedShowsList.dataset.longPressBound) return;
  els.savedShowsList.dataset.longPressBound = "true";
  let press = null;

  els.savedShowsList.addEventListener("pointerdown", (event) => {
    const chip = event.target.closest?.(".saved-show-chip");
    if (!chip || event.target.closest("input, select")) return;
    clearSetlistLongPressTimer();
    press = {
      pointerId: event.pointerId,
      showId: chip.dataset.showId,
      startX: event.clientX,
      startY: event.clientY,
    };
    setlistLongPressTargetId = press.showId;
    setlistLongPressTimer = window.setTimeout(() => {
      if (!press?.showId) return;
      suppressNextSetlistClickId = press.showId;
      toggleSetlistSelection(press.showId, true);
      press = null;
      setlistLongPressTimer = null;
      setlistLongPressTargetId = "";
    }, 520);
  });

  els.savedShowsList.addEventListener("pointermove", (event) => {
    if (!press || event.pointerId !== press.pointerId) return;
    if (Math.hypot(event.clientX - press.startX, event.clientY - press.startY) > 8) {
      press = null;
      clearSetlistLongPressTimer();
    }
  });

  const endPress = (event) => {
    if (press && event.pointerId === press.pointerId) press = null;
    clearSetlistLongPressTimer();
  };
  els.savedShowsList.addEventListener("pointerup", endPress);
  els.savedShowsList.addEventListener("pointercancel", endPress);
}

function setRailActive(button) {
  document.querySelectorAll(".rail-button").forEach((candidate) => candidate.classList.remove("active"));
  button.classList.add("active");
}

function getExportItems() {
  const exportItems = [];
  state.lineup.forEach((item) => {
    if (item.type === "slide") return;
    if (item.type === "note") {
      exportItems.push({
        type: "note",
        number: exportItems.length + 1,
        title: item.text,
        key: "",
        capo: "",
      });
      return;
    }

    const song = songForLineupItem(item);
    if (!song) return;
    exportItems.push({
      type: "song",
      number: exportItems.length + 1,
      title: song.title,
      key: item.key || song.key,
      capo: item.capo || "",
      credits: song.credits || "",
      note: item.note || "",
    });
  });
  return exportItems;
}

function setExportTab(tab = "setlist") {
  const selectedTab = ["setlist", "slides", "sheets"].includes(tab) ? tab : "setlist";
  const showSetlist = selectedTab === "setlist";
  const exportSettings = els.exportDialog?.querySelector(".export-settings");
  const exportActions = els.exportDialog?.querySelector(".export-actions");
  els.exportTabButtons?.forEach((button) => {
    const active = button.dataset.exportTab === selectedTab;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", active ? "true" : "false");
  });
  if (exportSettings) exportSettings.hidden = !showSetlist;
  if (els.exportPreview) els.exportPreview.hidden = !showSetlist;
  if (exportActions) exportActions.hidden = !showSetlist;
  if (els.exportSlidesPanel) els.exportSlidesPanel.hidden = selectedTab !== "slides";
  if (els.exportSheetsPanel) els.exportSheetsPanel.hidden = selectedTab !== "sheets";
  if (selectedTab === "slides") prepareSlidesExportControls();
  if (selectedTab === "sheets") renderSheetPackSelection();
}

function openExportPreview(tab = "setlist") {
  const exportItems = getExportItems();
  if (tab === "setlist" && !exportItems.length) {
    toast("Add songs or notes before exporting.");
    return;
  }
  if (tab === "slides" && !buildLineupSlideDeck().length) {
    toast("Add songs before exporting slides.");
    return;
  }

  els.exportCreditsToggle.checked = false;
  if (els.exportRealKeyToggle) els.exportRealKeyToggle.checked = false;
  hideDownloadReady();
  setExportOrientation("portrait");
  if (exportItems.length) renderExportPreview(exportItems);
  setExportTab(tab);
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

function sheetPackGroups() {
  return state.lineup
    .filter((item) => item.type === "song" && sheetAttachmentsForLineupItem(item).length)
    .map((item) => ({
      item,
      song: songForLineupItem(item),
      attachments: sheetAttachmentsForLineupItem(item),
    }))
    .filter((group) => group.song && group.attachments.length);
}

function renderSheetPackSelection() {
  if (!els.sheetPackSelection) return;
  const groups = sheetPackGroups();
  if (!groups.length) {
    els.sheetPackSelection.innerHTML = `
      <div class="empty-state">
        <div><strong>No sheets attached yet.</strong>Use the Sheets button on a song row to add photos or PDFs.</div>
      </div>
    `;
    if (els.exportSheetPackButton) els.exportSheetPackButton.disabled = true;
    return;
  }
  if (els.exportSheetPackButton) els.exportSheetPackButton.disabled = false;
  els.sheetPackSelection.innerHTML = groups.map(({ item, song, attachments }, index) => `
    <section class="sheet-pack-song" data-sheet-export-group="${item.id}">
      <label class="sheet-pack-song-title">
        <input type="checkbox" data-sheet-export-song="${item.id}" checked />
        <span>${index + 1}. ${escapeHtml(song.title)}</span>
      </label>
      <div class="sheet-pack-files">
        ${attachments.map((attachment) => `
          <label class="sheet-pack-file">
            <input type="checkbox" data-sheet-export-attachment="${attachment.id}" data-lineup-id="${item.id}" checked />
            <span>
              <strong>${escapeHtml(attachment.name)}</strong>
              <small>${attachment.mimeType === "application/pdf" ? `Whole PDF · ${attachment.pageCount || 1} page${attachment.pageCount === 1 ? "" : "s"}` : "Image"}</small>
            </span>
          </label>
        `).join("")}
      </div>
    </section>
  `).join("");
}

function selectedSheetPackEntries() {
  const checked = new Set(Array.from(els.sheetPackSelection?.querySelectorAll("[data-sheet-export-attachment]:checked") || [])
    .map((input) => `${input.dataset.lineupId}:${input.dataset.sheetExportAttachment}`));
  return sheetPackGroups().flatMap(({ item, song, attachments }) => attachments
    .filter((attachment) => checked.has(`${item.id}:${attachment.id}`))
    .map((attachment) => ({ item, song, attachment })));
}

function fitRect(contentWidth, contentHeight, box) {
  const scale = Math.min(box.width / contentWidth, box.height / contentHeight);
  const width = contentWidth * scale;
  const height = contentHeight * scale;
  return {
    x: box.x + (box.width - width) / 2,
    y: box.y + (box.height - height) / 2,
    width,
    height,
  };
}

function drawSheetPackLabel(page, label, font, PDFLib) {
  const { width, height } = page.getSize();
  page.drawRectangle({
    x: 0,
    y: height - 22,
    width,
    height: 22,
    color: PDFLib.rgb(1, 1, 1),
    opacity: 0.92,
  });
  page.drawText(safeText(label, 110), {
    x: 18,
    y: height - 15,
    size: 8,
    font,
    color: PDFLib.rgb(0.08, 0.1, 0.12),
  });
}

function drawSheetPackStrokes(page, strokes, rect, PDFLib) {
  strokes.forEach((stroke) => {
    const points = stroke.points || [];
    for (let index = 1; index < points.length; index += 1) {
      const start = points[index - 1];
      const end = points[index];
      page.drawLine({
        start: {
          x: rect.x + start[0] * rect.width,
          y: rect.y + (1 - start[1]) * rect.height,
        },
        end: {
          x: rect.x + end[0] * rect.width,
          y: rect.y + (1 - end[1]) * rect.height,
        },
        thickness: stroke.width || 3,
        color: PDFLib.rgb(0.84, 0.14, 0.14),
        opacity: 0.92,
      });
    }
  });
}

function blobToArrayBuffer(blob) {
  return blob.arrayBuffer ? blob.arrayBuffer() : new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error || new Error("Could not read file.")));
    reader.readAsArrayBuffer(blob);
  });
}

function loadImageForExport(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That image cannot be exported here. Try a JPG, PNG, or PDF."));
    };
    image.src = url;
  });
}

async function imageBlobToPngBytes(blob) {
  const image = await loadImageForExport(blob);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, image.naturalWidth || image.width);
  canvas.height = Math.max(1, image.naturalHeight || image.height);
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const pngBlob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Could not prepare image for PDF.")), "image/png");
  });
  return { bytes: await blobToArrayBuffer(pngBlob), width: canvas.width, height: canvas.height };
}

async function addImageSheetToPdf(pdf, entry, blob, font, PDFLib) {
  const page = pdf.addPage([612, 792]);
  const { bytes, width, height } = await imageBlobToPngBytes(blob);
  const embedded = await pdf.embedPng(bytes);
  const imageRect = fitRect(width, height, {
    x: 28,
    y: 28,
    width: 556,
    height: 724,
  });
  drawSheetPackLabel(page, `${entry.song.title} · ${entry.attachment.name}`, font, PDFLib);
  page.drawImage(embedded, imageRect);
  drawSheetPackStrokes(page, getSheetPageStrokes(entry.attachment, 0), imageRect, PDFLib);
}

async function addPdfSheetToPdf(pdf, entry, blob, font, PDFLib) {
  const source = await PDFLib.PDFDocument.load(await blobToArrayBuffer(blob), { ignoreEncryption: true });
  const pageIndexes = source.getPageIndices();
  const pages = await pdf.copyPages(source, pageIndexes);
  pages.forEach((page, index) => {
    pdf.addPage(page);
    const { width, height } = page.getSize();
    const label = `${entry.song.title} · ${entry.attachment.name}${pages.length > 1 ? ` · p.${index + 1}` : ""}`;
    drawSheetPackLabel(page, label, font, PDFLib);
    drawSheetPackStrokes(page, getSheetPageStrokes(entry.attachment, index), { x: 0, y: 0, width, height }, PDFLib);
  });
}

async function exportSheetPackPdf() {
  const entries = selectedSheetPackEntries();
  if (!entries.length) {
    toast("Choose at least one sheet to export.");
    return;
  }
  const PDFLib = window.PDFLib;
  if (!PDFLib?.PDFDocument) {
    toast("PDF export is still loading. Try again in a moment.");
    return;
  }
  try {
    const pdf = await PDFLib.PDFDocument.create();
    const font = await pdf.embedFont(PDFLib.StandardFonts.HelveticaBold);
    let exported = 0;
    for (const entry of entries) {
      const blob = await readSheetBlob(entry.attachment.localKey);
      if (!blob) continue;
      if (entry.attachment.mimeType === "application/pdf") {
        await addPdfSheetToPdf(pdf, entry, blob, font, PDFLib);
      } else {
        await addImageSheetToPdf(pdf, entry, blob, font, PDFLib);
      }
      exported += 1;
    }
    if (!exported) {
      toast("Those sheet files are not saved on this device.");
      return;
    }
    const bytes = await pdf.save();
    const blob = new Blob([bytes], { type: "application/pdf" });
    await downloadBlob(blob, `${safeFileName(state.show.name || "lineup")}-sheet-pack.pdf`, "Sheet pack PDF is ready.");
  } catch (error) {
    console.error(error);
    toast(error instanceof Error ? error.message : "Could not export sheet pack.");
  }
}

async function downloadBlob(blob, fileName, message = "File is ready.") {
  if (!blob?.size) {
    toast("Could not create the file.");
    return;
  }
  if (isNativeFileBridgeAvailable() && await shareBlobWithNative(blob, fileName, message)) {
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

  if (isNativeFileBridgeAvailable()) {
    event.preventDefault();
    downloadBlob(result.blob, result.fileName, result.message);
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
  if (shareDataUrlWithNative(dataUrl, fileName, message)) return;
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

function nativeFileBridge() {
  if (window.lineupNativeFile?.shareFile) return window.lineupNativeFile;
  const handler = window.webkit?.messageHandlers?.lineupNativeFile;
  if (!handler?.postMessage) return null;
  return {
    shareFile(payload) {
      handler.postMessage(payload);
      return true;
    },
  };
}

function isNativeFileBridgeAvailable() {
  return Boolean(nativeFileBridge());
}

function mimeTypeFromDataUrl(dataUrl) {
  return /^data:([^;,]+)/.exec(String(dataUrl || ""))?.[1] || "application/octet-stream";
}

function shareDataUrlWithNative(dataUrl, fileName, message = "File is ready.") {
  const bridge = nativeFileBridge();
  if (!bridge || !dataUrl) return false;
  try {
    bridge.shareFile({
      fileName,
      message,
      mimeType: mimeTypeFromDataUrl(dataUrl),
      dataUrl,
    });
    toast(`${message} Choose where to save or share it.`);
    return true;
  } catch (error) {
    console.warn("Native file share failed.", error);
    return false;
  }
}

async function shareBlobWithNative(blob, fileName, message = "File is ready.") {
  const bridge = nativeFileBridge();
  if (!bridge) return false;
  try {
    bridge.shareFile({
      fileName,
      message,
      mimeType: blob.type || "application/octet-stream",
      dataUrl: await blobToDataUrl(blob),
    });
    toast(`${message} Choose where to save or share it.`);
    return true;
  } catch (error) {
    console.warn("Native file share failed.", error);
    return false;
  }
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
  const labelY = margin + titleSize + 38;
  const lineStartY = labelY + 25;

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
  context.save();
  context.fillStyle = "#555555";
  context.font = "800 10px Arial, Helvetica, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "alphabetic";
  context.fillText("Created with LINEUP · Songleading.net", page.width / 2, page.height - 15);
  context.restore();
}

function drawPdfLabels(context, x, y, width, includeRealKey) {
  const keyWidth = 44;
  const capoWidth = 52;
  const numberWidth = 42;
  const realKeyWidth = includeRealKey ? 48 : 0;
  const controlInset = 8;
  context.save();
  context.font = "900 11px Arial, Helvetica, sans-serif";
  context.fillStyle = "#444444";
  context.textBaseline = "middle";
  context.fillText("SONG", x + numberWidth + 6, y);
  context.textAlign = "center";
  context.fillText("CAPO", x + width - controlInset - realKeyWidth - keyWidth - capoWidth / 2, y);
  context.fillText("KEY", x + width - controlInset - realKeyWidth - keyWidth / 2, y);
  if (includeRealKey) context.fillText("REAL", x + width - controlInset - realKeyWidth / 2, y);
  context.strokeStyle = "#111111";
  context.lineWidth = 1.7;
  context.beginPath();
  context.moveTo(x, y + 15);
  context.lineTo(x + width, y + 15);
  context.stroke();
  context.restore();
}

function drawPdfLine(context, item, x, y, width, metrics, includeCredits, includeRealKey, orientation) {
  const keyWidth = 44;
  const capoWidth = 52;
  const numberWidth = 42;
  const realKeyWidth = includeRealKey ? 48 : 0;
  const controlInset = 8;
  const lineHeight = item.type === "note" ? metrics.noteRowHeight : metrics.rowHeight;
  const mainY = y + lineHeight / 2;
  const titleX = x + numberWidth + 6;
  const titleWidth = width - numberWidth - capoWidth - keyWidth - realKeyWidth - controlInset - 12;
  context.save();
  context.textBaseline = "middle";
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
    const hasCredits = includeCredits && item.credits;
    const titleY = hasCredits ? mainY - Math.max(10, metrics.fontSize * 0.32) : mainY;
    const creditY = titleY + Math.max(18, metrics.fontSize * 0.78);
    const note = item.note || "";
    const noteWidth = note ? Math.min(titleWidth * 0.34, Math.max(70, context.measureText(note).width + 10)) : 0;
    fitCanvasText(context, shortenTitle(item.title, metrics.columns, orientation), titleX, titleY, titleWidth - noteWidth - 6);
    if (note) {
      context.fillStyle = "#6a4a00";
      context.font = `italic 800 ${noteFontSize(metrics.fontSize, note)}px Arial, Helvetica, sans-serif`;
      fitCanvasText(context, note, titleX + titleWidth - noteWidth, titleY, noteWidth);
      context.fillStyle = "#111111";
    }
    if (hasCredits) {
      context.fillStyle = "#555555";
      context.font = `700 ${Math.max(10, Math.floor(metrics.fontSize * 0.42))}px Arial, Helvetica, sans-serif`;
      fitCanvasText(context, item.credits, titleX, creditY, titleWidth);
    }
    context.font = `800 ${metrics.fontSize}px Arial, Helvetica, sans-serif`;
    context.fillStyle = "#333333";
    context.textAlign = "center";
    context.fillText(formatExportCapo(item.capo), x + width - controlInset - realKeyWidth - keyWidth - capoWidth / 2, mainY);
    context.fillText(item.key, x + width - controlInset - realKeyWidth - keyWidth / 2, mainY);
    if (includeRealKey) {
      context.font = `800 ${Math.max(12, Math.floor(metrics.fontSize * 0.58))}px Arial, Helvetica, sans-serif`;
      context.fillText(formatRealKey(item.key, item.capo), x + width - controlInset - realKeyWidth / 2, mainY);
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
    creditGap: Math.round(Math.max(9, Math.min(14, (rowHeight - 47) * 0.25 + 9))),
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
    ? "42px minmax(0, 1fr) 52px 44px 48px"
    : "42px minmax(0, 1fr) 52px 44px";
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
          .sheet { width: 100%; height: 100vh; display: flex; flex-direction: column; gap: 8px; padding-bottom: 18px; }
          header { display: flex; align-items: flex-end; justify-content: space-between; border-bottom: 2px solid #111; padding-bottom: 7px; }
          h1 { margin: 0; font-size: ${orientation === "landscape" ? 34 : 30}px; line-height: 1; }
          .date { font-size: 20px; font-weight: 700; }
          .chart-labels { display: grid; grid-template-columns: ${chartColumns}; align-items: center; margin-top: 5px; border-bottom: 2px solid #111; color: #444; text-transform: uppercase; font-size: 12px; line-height: 1; font-weight: 900; letter-spacing: 0.03em; }
          .chart-labels span { padding: 1px 7px 8px; text-align: center; }
          .chart-labels span:nth-child(2) { text-align: left; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; column-count: ${columns}; }
          tbody { display: block; column-count: ${columns}; column-gap: 22px; }
          tr { display: grid; grid-template-columns: ${chartColumns}; break-inside: avoid; align-items: center; border-bottom: 1.5px solid #222; min-height: ${metrics.rowHeight}px; }
          tr.note { grid-template-columns: 42px minmax(0, 1fr); background: #f3f0e8; }
          td { padding: 1px 7px; font-size: ${fontSize}px; line-height: 1.02; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          tr.note td { font-style: italic; font-size: ${Math.max(16, fontSize - 4)}px; }
          td.title { display: flex; flex-direction: column; justify-content: center; overflow: visible; align-self: stretch; }
          .title-main { display: flex; align-items: baseline; gap: 10px; min-width: 0; line-height: 1.04; }
          .song-title-export { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .title-main, .credits, .line-note-export { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .credits { display: block; margin-top: ${metrics.creditGap}px; color: #555; font-size: ${Math.max(9, Math.floor(fontSize * 0.42))}px; line-height: 1; font-weight: 700; }
          .line-note-export { display: inline-block; flex: 0 1 auto; color: #6a4a00; font-weight: 700; font-style: italic; }
          .note-size-short { font-size: ${Math.max(12, Math.floor(fontSize * 0.55))}px; }
          .note-size-medium { font-size: ${Math.max(11, Math.floor(fontSize * 0.48))}px; }
          .note-size-long { font-size: ${Math.max(10, Math.floor(fontSize * 0.42))}px; }
          .note-size-xlong { font-size: ${Math.max(9, Math.floor(fontSize * 0.35))}px; }
          .number, .capo, .key, .real-key { text-align: center; }
          .number { padding-left: 2px; padding-right: 8px; font-size: 0.82em; overflow: visible; text-align: right; text-overflow: clip; }
          .capo, .key { color: #333; }
          .real-key { color: #444; font-size: ${Math.max(11, Math.floor(fontSize * 0.58))}px; }
          .watermark { margin-top: auto; padding-top: 6px; text-align: center; color: #555; font-size: 10px; font-weight: 800; }
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
          <div class="watermark">Created with LINEUP · Songleading.net</div>
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
    ? (orientation === "landscape" ? 34 : 28)
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
  recordLineupUndo();
  const [item] = state.lineup.splice(index, 1);
  state.lineup.splice(nextIndex, 0, item);
  saveState();
  renderLineup();
}

function moveLineupItemTo(id, targetIndex) {
  const fromIndex = state.lineup.findIndex((item) => item.id === id);
  if (fromIndex < 0) return;
  recordLineupUndo();
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

function pointNearLineupRows(x, y, padding = 28) {
  if (!els.lineupRows) return false;
  const rect = els.lineupRows.getBoundingClientRect();
  return x >= rect.left - padding && x <= rect.right + padding && y >= rect.top - padding && y <= rect.bottom + padding;
}

function lineupDropIndexFromPoint(x, y) {
  if (!els.lineupRows) return state.lineup.length;
  const target = document.elementFromPoint(x, y);
  if (!target || !els.lineupRows.contains(target)) {
    if (!pointNearLineupRows(x, y)) return state.lineup.length;
    const rect = els.lineupRows.getBoundingClientRect();
    return y < rect.top + rect.height / 2 ? 0 : state.lineup.length;
  }
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
  if (!target || !els.lineupRows.contains(target)) {
    if (!pointNearLineupRows(x, y)) return;
    els.lineupRows.classList.add("drop-ready", "drop-at-end");
    return;
  }
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
  if (item.capo === value) return;
  recordLineupUndo();
  item.capo = value;
  saveState();
  renderLineup();
  refreshCapoSelectLabels();
}

function setLineupKey(lineupId, value) {
  const item = state.lineup.find((candidate) => candidate.id === lineupId);
  if (!item) return;
  if (item.key === value) return;
  recordLineupUndo();
  item.key = value;
  saveState();
  renderLineup();
}

function setLineupNote(lineupId, value) {
  const item = state.lineup.find((candidate) => candidate.id === lineupId);
  if (!item) return;
  const nextNote = value.trim();
  if ((item.note || "") === nextNote) return;
  recordLineupUndo();
  item.note = nextNote;
  saveState();
}

function toggleSongBanger(songId) {
  const song = state.songs.find((candidate) => candidate.id === songId);
  if (!song) return;
  recordLineupUndo();
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
  const token = String(value || "");
  if (token.length > importLimits.shareChars) throw new Error("Share data was too large.");
  const base64 = token.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(token.length / 4) * 4, "=");
  const decoded = decodeURIComponent(atob(base64));
  if (decoded.length > importLimits.shareChars) throw new Error("Share data was too large.");
  return decoded;
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

function storageStateFrom(sourceState) {
  const previousState = state;
  state = normalizeState(sourceState);
  const value = storageState();
  state = previousState;
  return value;
}

function buildLineupPayload() {
  commitShowMetaFromFields();
  syncActiveShowFromFields();
  const snapshot = normalizeState({
    show: state.show,
    songs: state.songs,
    lineup: state.lineup,
  });
  return {
    fileType: "show-lineup-builder",
    version: appVersion,
    exportedAt: new Date().toISOString(),
    show: snapshot.show,
    songs: snapshot.songs,
    lineup: snapshot.lineup,
  };
}

function buildBackupPayload() {
  commitShowMetaFromFields();
  syncActiveShowFromFields();
  const snapshot = normalizeState(storageState());
  return {
    fileType: "show-lineup-builder-backup",
    version: appVersion,
    exportedAt: new Date().toISOString(),
    activeShowId: snapshot.activeShowId,
    setlistFolders: snapshot.setlistFolders,
    show: snapshot.show,
    songs: snapshot.songs,
    lineup: snapshot.lineup,
    shows: snapshot.shows,
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
    message: "Setlist file is ready.",
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
  readImportedJsonFile(file, importLimits.lineupBytes, (parsed) => {
    try {
      const imported = normalizeImportedPayload(parsed, "lineup");
      state = imported;
      lineupUndoStack = [];
      lineupRedoStack = [];
      saveState();
      closeDialog(els.shareDialog);
      render();
      toast("Setlist file opened and saved on this device.");
    } catch (error) {
      console.warn("Setlist file was rejected.", error);
      toast(error instanceof Error ? error.message : "That setlist file could not be opened safely.");
    }
  });
}

function importBackupFile(file) {
  readImportedJsonFile(file, importLimits.backupBytes, (parsed) => {
    try {
      state = normalizeImportedPayload(parsed, "backup");
      lineupUndoStack = [];
      lineupRedoStack = [];
      saveState();
      if (els.shareDialog.open) closeDialog(els.shareDialog);
      if (els.settingsDialog.open) closeDialog(els.settingsDialog);
      render();
      toast("Backup restored and saved on this device.");
    } catch (error) {
      console.warn("Backup file was rejected.", error);
      toast(error instanceof Error ? error.message : "That backup file could not be opened safely.");
    }
  });
}

async function copyShareLink() {
  try {
    await navigator.clipboard.writeText(els.shareLink.value);
    toast("Share link copied. Open it in this app on another computer.");
  } catch {
    toast("Share link ready to copy.");
  }
}

function openSheetDb() {
  if (!("indexedDB" in window)) return Promise.reject(new Error("This browser cannot store sheets locally."));
  if (sheetDbPromise) return sheetDbPromise;
  sheetDbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(sheetDbName, 1);
    request.addEventListener("upgradeneeded", () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(sheetDbStore)) db.createObjectStore(sheetDbStore);
    });
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error || new Error("Could not open local sheet storage.")));
  });
  return sheetDbPromise;
}

async function readSheetBlob(localKey) {
  const db = await openSheetDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(sheetDbStore, "readonly").objectStore(sheetDbStore).get(localKey);
    request.addEventListener("success", () => resolve(request.result || null));
    request.addEventListener("error", () => reject(request.error || new Error("Could not read sheet file.")));
  });
}

async function writeSheetBlob(localKey, blob) {
  const db = await openSheetDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(sheetDbStore, "readwrite").objectStore(sheetDbStore).put(blob, localKey);
    request.addEventListener("success", () => resolve(true));
    request.addEventListener("error", () => reject(request.error || new Error("Could not save sheet file.")));
  });
}

async function deleteSheetBlob(localKey) {
  if (!localKey) return;
  try {
    const db = await openSheetDb();
    await new Promise((resolve, reject) => {
      const request = db.transaction(sheetDbStore, "readwrite").objectStore(sheetDbStore).delete(localKey);
      request.addEventListener("success", () => resolve(true));
      request.addEventListener("error", () => reject(request.error || new Error("Could not remove sheet file.")));
    });
  } catch (error) {
    console.warn("Sheet file cleanup failed.", error);
  }
}

function inferSheetMimeType(file) {
  const fileType = safeSheetMimeType(file?.type);
  if (fileType) return fileType;
  const name = String(file?.name || "").toLowerCase();
  if (name.endsWith(".pdf")) return "application/pdf";
  if (/\.(png)$/i.test(name)) return "image/png";
  if (/\.(jpe?g)$/i.test(name)) return "image/jpeg";
  if (/\.(webp)$/i.test(name)) return "image/webp";
  if (/\.(gif)$/i.test(name)) return "image/gif";
  if (/\.(bmp)$/i.test(name)) return "image/bmp";
  return "";
}

function activeSheetsItem() {
  if (activeSheetsMode === "song") {
    return state.songs.find((song) => song.id === activeSheetsSongId) || null;
  }
  return state.lineup.find((item) => item.id === activeSheetsLineupId && item.type === "song") || null;
}

function sheetAttachmentsForLineupItem(item) {
  if (!item) return [];
  if (item.songId) {
    const song = state.songs.find((candidate) => candidate.id === item.songId);
    return mergeSheetAttachments(song?.sheetAttachments, item.sheetAttachments);
  }
  return normalizeSheetAttachments(item.sheetAttachments);
}

function activeSheetAttachment() {
  const item = activeSheetsItem();
  return item?.sheetAttachments?.find((attachment) => attachment.id === activeSheetId) || item?.sheetAttachments?.[0] || null;
}

function getSheetPageStrokes(attachment, pageIndex = activeSheetPageIndex) {
  if (!attachment) return [];
  attachment.annotations = normalizeSheetAnnotations(attachment.annotations);
  const key = String(clampNumber(Math.floor(Number(pageIndex) || 0), 0, (attachment.pageCount || 1) - 1));
  attachment.annotations[key] = safeArray(attachment.annotations[key], importLimits.sheetStrokes).map(normalizeSheetStroke).filter(Boolean);
  return attachment.annotations[key];
}

function sheetCountLabel(item) {
  const count = item?.type === "song"
    ? sheetAttachmentsForLineupItem(item).length
    : item?.sheetAttachments?.length || 0;
  if (!count) return "Sheets";
  return count === 1 ? "1 Sheet" : `${count} Sheets`;
}

function sheetIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M8 13h8M8 17h5"/></svg>`;
}

function openSheetsDialog(lineupId) {
  const item = state.lineup.find((candidate) => candidate.id === lineupId && candidate.type === "song");
  if (!item) return;
  activeSheetsLineupId = lineupId;
  activeSheetsSongId = item.songId || "";
  activeSheetsMode = item.songId ? "song" : "lineup";
  if (item.songId && item.sheetAttachments?.length) {
    const song = state.songs.find((candidate) => candidate.id === item.songId);
    if (song) {
      song.sheetAttachments = mergeSheetAttachments(song.sheetAttachments, item.sheetAttachments);
      item.sheetAttachments = [];
      saveState();
    }
  }
  const target = activeSheetsItem();
  target.sheetAttachments = normalizeSheetAttachments(target.sheetAttachments);
  activeSheetId = target.sheetAttachments[0]?.id || "";
  activeSheetPageIndex = 0;
  if (els.sheetsDialogTitle) {
    const song = songForLineupItem(item);
    els.sheetsDialogTitle.textContent = `${song?.title || "Song"} Sheets`;
  }
  openDialog(els.sheetsDialog);
  renderSheetsDialog();
}

function openLibrarySheetsDialog(songId) {
  const song = state.songs.find((candidate) => candidate.id === songId);
  if (!song) return;
  activeSheetsMode = "song";
  activeSheetsSongId = song.id;
  activeSheetsLineupId = "";
  song.sheetAttachments = normalizeSheetAttachments(song.sheetAttachments);
  activeSheetId = song.sheetAttachments[0]?.id || "";
  activeSheetPageIndex = 0;
  if (els.sheetsDialogTitle) els.sheetsDialogTitle.textContent = `${song.title} Sheets`;
  openDialog(els.sheetsDialog);
  renderSheetsDialog();
}

function closeSheetsDialog() {
  if (sheetPreviewUrl) {
    URL.revokeObjectURL(sheetPreviewUrl);
    sheetPreviewUrl = "";
  }
  closeDialog(els.sheetsDialog);
  activeSheetsLineupId = "";
  activeSheetsSongId = "";
  activeSheetsMode = "lineup";
  activeSheetId = "";
  activeSheetPageIndex = 0;
}

function chooseSheetFiles(mode = "add", attachmentId = "") {
  if (!els.sheetFileInput) return;
  sheetFileMode = mode;
  sheetReplaceId = attachmentId;
  els.sheetFileInput.value = "";
  els.sheetFileInput.multiple = mode !== "replace";
  els.sheetFileInput.click();
}

async function sheetAttachmentFromFile(file) {
  const mimeType = inferSheetMimeType(file);
  if (!mimeType) throw new Error("Use a PDF or image file.");
  if (file.size > sheetFileMaxBytes) throw new Error("That sheet file is too large.");
  let pageCount = 1;
  if (mimeType === "application/pdf" && window.PDFLib?.PDFDocument) {
    try {
      const source = await window.PDFLib.PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
      pageCount = clampNumber(source.getPageCount(), 1, importLimits.sheetPages);
    } catch (error) {
      console.warn("PDF page count could not be read.", error);
      pageCount = 1;
    }
  }
  const id = makeId("sheet");
  const name = safeText(file.name.replace(/\.[^.]+$/, ""), 120, "Sheet") || "Sheet";
  return {
    id,
    localKey: id,
    name,
    fileName: safeText(file.name, 160, name) || name,
    mimeType,
    size: file.size || 0,
    pageCount,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    annotations: {},
  };
}

async function handleSheetFileInputChange(event) {
  const item = activeSheetsItem();
  const files = Array.from(event.target.files || []);
  event.target.value = "";
  if (!item || !files.length) return;
  try {
    recordLineupUndo();
    item.sheetAttachments = normalizeSheetAttachments(item.sheetAttachments);
    if (sheetFileMode === "replace") {
      const index = item.sheetAttachments.findIndex((attachment) => attachment.id === sheetReplaceId);
      if (index < 0) return;
      const previous = item.sheetAttachments[index];
      const next = await sheetAttachmentFromFile(files[0]);
      await writeSheetBlob(next.localKey, files[0]);
      item.sheetAttachments[index] = {
        ...next,
        id: previous.id,
        localKey: next.localKey,
        name: previous.name || next.name,
      };
      if (previous.localKey !== next.localKey) deleteSheetBlob(previous.localKey);
      activeSheetId = previous.id;
      activeSheetPageIndex = 0;
      toast("Sheet replaced.");
    } else {
      const nextAttachments = [];
      for (const file of files) {
        const attachment = await sheetAttachmentFromFile(file);
        await writeSheetBlob(attachment.localKey, file);
        nextAttachments.push(attachment);
      }
      item.sheetAttachments.push(...nextAttachments);
      activeSheetId = nextAttachments[0]?.id || activeSheetId;
      activeSheetPageIndex = 0;
      toast(nextAttachments.length === 1 ? "Sheet added." : "Sheets added.");
    }
    saveState();
    renderSheetsDialog();
    renderLineup();
    renderSongBank();
  } catch (error) {
    console.error(error);
    toast(error instanceof Error ? error.message : "Could not add that sheet.");
  }
}

function renameActiveSheet() {
  const attachment = activeSheetAttachment();
  if (!attachment) return;
  const nextName = safeText(window.prompt("Sheet name", attachment.name) || "", 120);
  if (!nextName) return;
  recordLineupUndo();
  attachment.name = nextName;
  attachment.updatedAt = new Date().toISOString();
  saveState();
  renderSheetsDialog();
  renderLineup();
  renderSongBank();
}

function removeActiveSheet() {
  const item = activeSheetsItem();
  const attachment = activeSheetAttachment();
  if (!item || !attachment) return;
  if (!window.confirm(`Remove "${attachment.name}" from this song?`)) return;
  recordLineupUndo();
  item.sheetAttachments = item.sheetAttachments.filter((candidate) => candidate.id !== attachment.id);
  deleteSheetBlob(attachment.localKey);
  activeSheetId = item.sheetAttachments[0]?.id || "";
  activeSheetPageIndex = 0;
  saveState();
  renderSheetsDialog();
  renderLineup();
  renderSongBank();
  toast("Sheet removed.");
}

function moveActiveSheet(direction) {
  const item = activeSheetsItem();
  if (!item) return;
  const index = item.sheetAttachments.findIndex((attachment) => attachment.id === activeSheetId);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= item.sheetAttachments.length) return;
  recordLineupUndo();
  const [attachment] = item.sheetAttachments.splice(index, 1);
  item.sheetAttachments.splice(nextIndex, 0, attachment);
  saveState();
  renderSheetsDialog();
  renderLineup();
  renderSongBank();
}

function setSheetTool(tool) {
  sheetTool = tool === "eraser" ? "eraser" : "pen";
  els.sheetPenButton?.classList.toggle("active", sheetTool === "pen");
  els.sheetEraserButton?.classList.toggle("active", sheetTool === "eraser");
}

function renderSheetsDialog() {
  const item = activeSheetsItem();
  const attachments = item?.sheetAttachments || [];
  if (!item || !els.sheetsList) return;
  if (!attachments.some((attachment) => attachment.id === activeSheetId)) {
    activeSheetId = attachments[0]?.id || "";
    activeSheetPageIndex = 0;
  }
  const active = activeSheetAttachment();
  const activeIndex = attachments.findIndex((attachment) => attachment.id === active?.id);
  els.sheetsList.innerHTML = attachments.length
    ? attachments.map((attachment, index) => `
        <button class="sheet-item ${attachment.id === activeSheetId ? "active" : ""}" type="button" data-sheet-id="${attachment.id}">
          <span class="sheet-item-name">${escapeHtml(attachment.name)}</span>
          <span class="sheet-item-meta">${attachment.mimeType === "application/pdf" ? `${attachment.pageCount || 1} page PDF` : "Image"} · ${index + 1}</span>
        </button>
      `).join("")
    : `<div class="empty-state"><div><strong>No sheets yet.</strong>Upload a photo, screenshot, or PDF for this song.</div></div>`;
  if (els.replaceSheetButton) els.replaceSheetButton.disabled = !active;
  if (els.renameSheetButton) els.renameSheetButton.disabled = !active;
  if (els.moveSheetUpButton) els.moveSheetUpButton.disabled = !active || activeIndex <= 0;
  if (els.moveSheetDownButton) els.moveSheetDownButton.disabled = !active || activeIndex < 0 || activeIndex >= attachments.length - 1;
  if (els.removeSheetButton) els.removeSheetButton.disabled = !active;
  if (els.undoSheetMarkupButton) els.undoSheetMarkupButton.disabled = !active || !getSheetPageStrokes(active).length;
  if (els.clearSheetMarkupButton) els.clearSheetMarkupButton.disabled = !active || !getSheetPageStrokes(active).length;
  activeSheetPageIndex = active ? clampNumber(activeSheetPageIndex, 0, (active.pageCount || 1) - 1) : 0;
  if (els.prevSheetPageButton) els.prevSheetPageButton.disabled = !active || active.pageCount <= 1 || activeSheetPageIndex <= 0;
  if (els.nextSheetPageButton) els.nextSheetPageButton.disabled = !active || active.pageCount <= 1 || activeSheetPageIndex >= active.pageCount - 1;
  if (els.sheetPageLabel) {
    els.sheetPageLabel.textContent = active ? `Page ${activeSheetPageIndex + 1} of ${active.pageCount || 1}` : "No sheet";
  }
  if (els.sheetsPreviewMeta) {
    els.sheetsPreviewMeta.textContent = active
      ? `${active.fileName || active.name}${active.mimeType === "application/pdf" ? ` · PDF` : ""}`
      : "Upload a photo or PDF to preview and scribble.";
  }
  setSheetTool(sheetTool);
  renderSheetPreview().catch((error) => {
    console.error(error);
    toast(error instanceof Error ? error.message : "Could not preview sheet.");
  });
}

async function renderSheetPreview() {
  if (sheetPreviewRenderQueued) return;
  sheetPreviewRenderQueued = true;
  await new Promise((resolve) => requestAnimationFrame(resolve));
  sheetPreviewRenderQueued = false;
  const attachment = activeSheetAttachment();
  if (sheetPreviewUrl) {
    URL.revokeObjectURL(sheetPreviewUrl);
    sheetPreviewUrl = "";
  }
  if (!attachment) {
    if (els.sheetsPreviewEmpty) {
      els.sheetsPreviewEmpty.hidden = false;
      els.sheetsPreviewEmpty.innerHTML = "<div><strong>No sheet selected.</strong>Upload a PDF, photo, or screenshot.</div>";
    }
    if (els.sheetsPreviewImage) {
      els.sheetsPreviewImage.hidden = true;
      els.sheetsPreviewImage.removeAttribute("src");
    }
    if (els.sheetsPreviewPdf) {
      els.sheetsPreviewPdf.hidden = true;
      els.sheetsPreviewPdf.removeAttribute("src");
    }
    resizeSheetMarkupCanvas();
    return;
  }
  const blob = await readSheetBlob(attachment.localKey);
  if (!blob) {
    if (els.sheetsPreviewEmpty) {
      els.sheetsPreviewEmpty.hidden = false;
      els.sheetsPreviewEmpty.innerHTML = "<div><strong>File not on this device.</strong>This sheet metadata is here, but the file is saved locally on another device.</div>";
    }
    if (els.sheetsPreviewImage) els.sheetsPreviewImage.hidden = true;
    if (els.sheetsPreviewPdf) els.sheetsPreviewPdf.hidden = true;
    resizeSheetMarkupCanvas();
    return;
  }
  sheetPreviewUrl = URL.createObjectURL(blob);
  if (els.sheetsPreviewEmpty) {
    els.sheetsPreviewEmpty.hidden = true;
    els.sheetsPreviewEmpty.innerHTML = "<div><strong>No sheet selected.</strong>Upload a PDF, photo, or screenshot.</div>";
  }
  if (attachment.mimeType === "application/pdf") {
    if (els.sheetsPreviewImage) {
      els.sheetsPreviewImage.hidden = true;
      els.sheetsPreviewImage.removeAttribute("src");
    }
    if (els.sheetsPreviewPdf) {
      els.sheetsPreviewPdf.hidden = false;
      els.sheetsPreviewPdf.src = `${sheetPreviewUrl}#page=${activeSheetPageIndex + 1}&toolbar=0&navpanes=0&scrollbar=0`;
    }
  } else {
    if (els.sheetsPreviewPdf) {
      els.sheetsPreviewPdf.hidden = true;
      els.sheetsPreviewPdf.removeAttribute("src");
    }
    if (els.sheetsPreviewImage) {
      els.sheetsPreviewImage.hidden = false;
      els.sheetsPreviewImage.src = sheetPreviewUrl;
      await new Promise((resolve) => {
        if (els.sheetsPreviewImage.complete) resolve();
        else els.sheetsPreviewImage.addEventListener("load", resolve, { once: true });
      });
    }
  }
  resizeSheetMarkupCanvas();
}

function resizeSheetMarkupCanvas() {
  const canvas = els.sheetsMarkupCanvas;
  const stage = els.sheetsPreviewStage;
  if (!canvas || !stage) return;
  const rect = stage.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.floor(rect.width * ratio));
  const height = Math.max(1, Math.floor(rect.height * ratio));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  drawSheetMarkupCanvas();
}

function drawSheetMarkupCanvas(extraStroke = null) {
  const canvas = els.sheetsMarkupCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(canvas.width, canvas.height);
  const strokes = activeSheetAttachment() ? getSheetPageStrokes(activeSheetAttachment()) : [];
  [...strokes, extraStroke].filter(Boolean).forEach((stroke) => drawSheetStrokeOnCanvas(ctx, stroke));
  ctx.restore();
}

function drawSheetStrokeOnCanvas(ctx, stroke) {
  if (!stroke?.points?.length) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = stroke.color || "#d82424";
  ctx.lineWidth = (stroke.width || 3) / Math.max(ctx.canvas.width, ctx.canvas.height, 1);
  ctx.beginPath();
  stroke.points.forEach(([x, y], index) => {
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.restore();
}

function sheetPointFromEvent(event) {
  const canvas = els.sheetsMarkupCanvas;
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  return [
    clampNumber((event.clientX - rect.left) / rect.width, 0, 1),
    clampNumber((event.clientY - rect.top) / rect.height, 0, 1),
  ];
}

function eraseSheetStrokesAt(point) {
  const attachment = activeSheetAttachment();
  if (!attachment || !point) return false;
  const strokes = getSheetPageStrokes(attachment);
  const before = strokes.length;
  const threshold = 0.035;
  const remaining = strokes.filter((stroke) => !stroke.points.some(([x, y]) => Math.hypot(x - point[0], y - point[1]) < threshold));
  attachment.annotations[String(activeSheetPageIndex)] = remaining;
  return remaining.length !== before;
}

function beginSheetMarkup(event) {
  if (!activeSheetAttachment()) return;
  event.preventDefault();
  const point = sheetPointFromEvent(event);
  if (!point) return;
  els.sheetsMarkupCanvas?.setPointerCapture?.(event.pointerId);
  if (sheetTool === "eraser") {
    recordLineupUndo();
    sheetDrawing = { tool: "eraser", changed: eraseSheetStrokesAt(point) };
    drawSheetMarkupCanvas();
    return;
  }
  recordLineupUndo();
  sheetDrawing = {
    tool: "pen",
    color: "#d82424",
    width: 3,
    points: [point],
  };
  drawSheetMarkupCanvas(sheetDrawing);
}

function moveSheetMarkup(event) {
  if (!sheetDrawing) return;
  event.preventDefault();
  const point = sheetPointFromEvent(event);
  if (!point) return;
  if (sheetDrawing.tool === "eraser") {
    sheetDrawing.changed = eraseSheetStrokesAt(point) || sheetDrawing.changed;
    drawSheetMarkupCanvas();
    return;
  }
  sheetDrawing.points.push(point);
  if (sheetDrawing.points.length > importLimits.sheetPoints) sheetDrawing.points.shift();
  drawSheetMarkupCanvas(sheetDrawing);
}

function finishSheetMarkup(event) {
  if (!sheetDrawing) return;
  event?.preventDefault?.();
  const attachment = activeSheetAttachment();
  if (attachment && sheetDrawing.tool === "pen") {
    const stroke = normalizeSheetStroke(sheetDrawing);
    if (stroke) getSheetPageStrokes(attachment).push(stroke);
  }
  const changed = sheetDrawing.tool === "pen" || sheetDrawing.changed;
  sheetDrawing = null;
  if (changed) {
    if (attachment) attachment.updatedAt = new Date().toISOString();
    saveState();
    renderSheetsDialog();
    renderLineup();
    renderSongBank();
  } else {
    drawSheetMarkupCanvas();
  }
}

function undoSheetMarkup() {
  const attachment = activeSheetAttachment();
  if (!attachment) return;
  const strokes = getSheetPageStrokes(attachment);
  if (!strokes.length) return;
  recordLineupUndo();
  strokes.pop();
  attachment.updatedAt = new Date().toISOString();
  saveState();
  renderSheetsDialog();
}

function clearSheetMarkup() {
  const attachment = activeSheetAttachment();
  if (!attachment || !getSheetPageStrokes(attachment).length) return;
  if (!window.confirm("Clear scribbles on this page?")) return;
  recordLineupUndo();
  attachment.annotations[String(activeSheetPageIndex)] = [];
  attachment.updatedAt = new Date().toISOString();
  saveState();
  renderSheetsDialog();
}

function handleLineupAction(action, lineupId, songId, control = null) {
  const item = state.lineup.find((candidate) => candidate.id === lineupId);

  if (action === "slides" && item) {
    openSlidesForLineup(lineupId);
    return;
  }

  if (action === "sheets" && item?.type === "song") {
    openSheetsDialog(lineupId);
    return;
  }

  if (action === "slide-image" && item?.type === "slide") {
    chooseSlideOnlyImage(lineupId);
    return;
  }

  if (action === "edit-slide-title" && item?.type === "slide") {
    editSlideOnlyTitle(lineupId);
    return;
  }

  if (action === "ready" && item) {
    recordLineupUndo();
    item.ready = !item.ready;
    saveState();
    renderLineup();
  }

  if (action === "info") {
    if (item?.oneTimeSong) {
      openOneTimeSongDialog(item);
      return;
    }
    const song = state.songs.find((candidate) => candidate.id === songId);
    openSongDialog(song);
  }

  if (action === "edit-lineup-note" && item) openLineupSongNoteDialog(item);

  if (action === "edit-note" && item) openNoteDialog(item);

  if (action === "remove") {
    if (shouldArmMobileLineupDelete(lineupId, control)) return;
    removeLineupItem(lineupId);
  }
}

function clearPendingLineupDelete() {
  if (pendingLineupDeleteTimer) window.clearTimeout(pendingLineupDeleteTimer);
  pendingLineupDeleteTimer = null;
  const activeButton = pendingLineupDeleteId
    ? Array.from(document.querySelectorAll('[data-action="remove"][data-lineup-id]'))
      .find((button) => button.dataset.lineupId === pendingLineupDeleteId)
    : null;
  if (activeButton) {
    activeButton.classList.remove("delete-armed");
    if (activeButton.dataset.originalTitle) activeButton.title = activeButton.dataset.originalTitle;
    if (activeButton.dataset.originalAriaLabel) activeButton.setAttribute("aria-label", activeButton.dataset.originalAriaLabel);
    delete activeButton.dataset.originalTitle;
    delete activeButton.dataset.originalAriaLabel;
  }
  pendingLineupDeleteId = "";
  pendingLineupDeleteArmedAt = 0;
}

function shouldArmMobileLineupDelete(lineupId, control) {
  if (!isMobileLayout() || !lineupId) return false;
  if (pendingLineupDeleteId === lineupId) {
    if (Date.now() - pendingLineupDeleteArmedAt < 450) return true;
    clearPendingLineupDelete();
    return false;
  }
  clearPendingLineupDelete();
  pendingLineupDeleteId = lineupId;
  pendingLineupDeleteArmedAt = Date.now();
  if (control) {
    control.dataset.originalTitle = control.title || "Remove";
    control.dataset.originalAriaLabel = control.getAttribute("aria-label") || "Remove";
    control.classList.add("delete-armed");
    control.title = "Tap again to remove";
    control.setAttribute("aria-label", "Tap again to remove");
  }
  pendingLineupDeleteTimer = window.setTimeout(clearPendingLineupDelete, 4200);
  toast("Tap trash again to remove.", { duration: 4200 });
  return true;
}

function removeLineupItem(lineupId) {
  const index = state.lineup.findIndex((candidate) => candidate.id === lineupId);
  const item = state.lineup[index];
  if (!item) return;
  const removedItem = cloneData(item);
  const undoShowId = state.activeShowId;
  recordLineupUndo();
  state.lineup.splice(index, 1);
  openRowId = null;
  clearPendingLineupDelete();
  saveState();
  renderLineup();
  showLineupRemoveUndo({ item: removedItem, index, showId: undoShowId });
}

function showLineupRemoveUndo(undoPayload) {
  if (pendingLineupRemoveUndoTimer) window.clearTimeout(pendingLineupRemoveUndoTimer);
  pendingLineupRemoveUndo = undoPayload;
  pendingLineupRemoveUndoTimer = window.setTimeout(() => {
    pendingLineupRemoveUndo = null;
    pendingLineupRemoveUndoTimer = null;
  }, 8000);
  toast("Item removed.", {
    actionLabel: "Undo",
    duration: 8000,
    action: restorePendingLineupRemove,
  });
}

function restorePendingLineupRemove() {
  if (!pendingLineupRemoveUndo) return;
  const { item, index, showId } = pendingLineupRemoveUndo;
  if (showId && state.activeShowId !== showId) {
    toast("Open that setlist to undo.");
    return;
  }
  if (state.lineup.some((candidate) => candidate.id === item.id)) {
    pendingLineupRemoveUndo = null;
    toast("That item is already back.");
    return;
  }
  if (pendingLineupRemoveUndoTimer) window.clearTimeout(pendingLineupRemoveUndoTimer);
  pendingLineupRemoveUndoTimer = null;
  pendingLineupRemoveUndo = null;
  recordLineupUndo();
  state.lineup.splice(clampNumber(index, 0, state.lineup.length), 0, cloneData(item));
  saveState();
  renderLineup();
  toast("Item restored.");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]);
}

let toastTimer;
function toast(message, options = {}) {
  els.toast.classList.remove("has-action");
  if (options.actionLabel && typeof options.action === "function") {
    els.toast.innerHTML = `<span>${escapeHtml(message)}</span><button type="button" data-toast-action>${escapeHtml(options.actionLabel)}</button>`;
    els.toast.classList.add("has-action");
    const actionButton = els.toast.querySelector("[data-toast-action]");
    actionButton?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      options.action();
    });
  } else {
    els.toast.textContent = message;
  }
  els.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove("show"), options.duration || 2200);
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setBankWidth(width) {
  const shellRect = els.appShell.getBoundingClientRect();
  const sideBankLayout = isLandscapeSideBankLayout();
  const minWidth = sideBankLayout ? 248 : 260;
  const resizerWidth = sideBankLayout ? 16 : 10;
  const maxWidth = sideBankLayout
    ? Math.max(minWidth, shellRect.width - resizerWidth - 260)
    : Math.max(280, shellRect.width - 96 - 10 - 460);
  const nextWidth = clampNumber(Math.round(width), minWidth, Math.min(560, maxWidth));
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
    if (els.appShell.classList.contains("bank-collapsed") && !isLandscapeSideBankLayout()) return;
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
    if (isLandscapeSideBankLayout()) els.appShell.classList.remove("bank-collapsed");
    positionCoachTip();
  });
  window.addEventListener("scroll", positionCoachTip, { passive: true });
}

function bindEvents() {
  document.addEventListener("keydown", handleUndoRedoShortcut, true);
  document.addEventListener("keydown", (event) => {
    if (!els.presentationDialog?.open) return;
    if (["ArrowRight", "PageDown", " "].includes(event.key)) {
      event.preventDefault();
      movePresentation(1);
      return;
    }
    if (["ArrowLeft", "PageUp"].includes(event.key)) {
      event.preventDefault();
      movePresentation(-1);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closePresentation();
    }
  }, true);

  els.categoryFilters.addEventListener("click", (event) => {
    const bangerButton = event.target.closest("[data-banger-filter]");
    if (bangerButton) {
      bangersOnly = !bangersOnly;
      render();
      return;
    }
    const hebrewButton = event.target.closest("[data-hebrew-filter]");
    if (hebrewButton) {
      hebrewOnly = !hebrewOnly;
      render();
      return;
    }
    const button = event.target.closest("[data-category]");
    if (!button) return;
    const category = button.dataset.category;
    if (activeCategories.has(category)) activeCategories.delete(category);
    else activeCategories.add(category);
    render();
  });

  els.songSearch.addEventListener("input", (event) => {
    searchTerm = event.target.value;
    renderSongBank();
  });

  els.closeBankButton.addEventListener("click", () => {
    closeMobileLibraryDrawer();
    toast("Side panel hidden.");
  });

  els.bankPanel?.addEventListener("click", (event) => {
    if (!els.appShell.classList.contains("bank-collapsed")) return;
    if (event.target.closest("button, input, select, textarea")) return;
    openMobileLibraryDrawer();
  });

  els.themeToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    els.headerMenu.open = false;
    toggleTheme();
  });

  els.sortButton.addEventListener("click", () => {
    sortAsc = !sortAsc;
    renderSongBank();
    toast(sortAsc ? "Song bank sorted A to Z." : "Song bank sorted Z to A.");
  });

  els.toggleFiltersButton?.addEventListener("click", toggleLibraryFilters);
  els.homeButton?.addEventListener("click", handleHomeButtonClick);
  els.homeMenuButton?.addEventListener("click", openSongleadingHome);
  els.newSongButton.addEventListener("click", () => openSongDialog());
  els.oneTimeSongButton?.addEventListener("click", () => openOneTimeSongDialog());
  els.quickAddButton.addEventListener("click", () => openQuickAddDialog());
  els.addSlideOnlyButton?.addEventListener("click", addSlideOnlyItem);
  els.slideOnlyImageInput?.addEventListener("change", attachSlideOnlyImageFromInput);
  els.sheetFileInput?.addEventListener("change", handleSheetFileInputChange);
  els.addSheetButton?.addEventListener("click", () => chooseSheetFiles("add"));
  els.replaceSheetButton?.addEventListener("click", () => {
    const attachment = activeSheetAttachment();
    if (attachment) chooseSheetFiles("replace", attachment.id);
  });
  els.renameSheetButton?.addEventListener("click", renameActiveSheet);
  els.moveSheetUpButton?.addEventListener("click", () => moveActiveSheet(-1));
  els.moveSheetDownButton?.addEventListener("click", () => moveActiveSheet(1));
  els.removeSheetButton?.addEventListener("click", removeActiveSheet);
  els.sheetsList?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-sheet-id]");
    if (!button) return;
    activeSheetId = button.dataset.sheetId;
    activeSheetPageIndex = 0;
    renderSheetsDialog();
  });
  els.prevSheetPageButton?.addEventListener("click", () => {
    activeSheetPageIndex -= 1;
    renderSheetsDialog();
  });
  els.nextSheetPageButton?.addEventListener("click", () => {
    activeSheetPageIndex += 1;
    renderSheetsDialog();
  });
  els.sheetPenButton?.addEventListener("click", () => setSheetTool("pen"));
  els.sheetEraserButton?.addEventListener("click", () => setSheetTool("eraser"));
  els.undoSheetMarkupButton?.addEventListener("click", undoSheetMarkup);
  els.clearSheetMarkupButton?.addEventListener("click", clearSheetMarkup);
  els.sheetsMarkupCanvas?.addEventListener("pointerdown", beginSheetMarkup);
  els.sheetsMarkupCanvas?.addEventListener("pointermove", moveSheetMarkup);
  els.sheetsMarkupCanvas?.addEventListener("pointerup", finishSheetMarkup);
  els.sheetsMarkupCanvas?.addEventListener("pointercancel", finishSheetMarkup);
  els.sheetsDialog?.addEventListener("close", () => {
    if (sheetPreviewUrl) {
      URL.revokeObjectURL(sheetPreviewUrl);
      sheetPreviewUrl = "";
    }
  });
  window.addEventListener("resize", resizeSheetMarkupCanvas);
  els.addOneTimeSongButton?.addEventListener("click", addOneTimeSongFromDialog);
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
  els.settingsThemeButton?.addEventListener("click", () => {
    toggleTheme();
    updateSettingsDialog();
  });
  els.skinChoiceGrid?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-skin-choice]");
    if (!button) return;
    applySkin(button.dataset.skinChoice);
    toast(`${button.querySelector("strong")?.textContent || "Skin"} skin enabled.`);
  });
  els.accentChoiceGrid?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-accent-choice]");
    if (!button) return;
    applyAccent(button.dataset.accentChoice);
    toast(`${button.textContent?.trim() || "Accent"} accent enabled.`);
  });
  els.settingsBackupButton.addEventListener("click", downloadBackupFile);
  els.settingsRestoreButton.addEventListener("click", openBackupFile);

  els.savedShowsList.addEventListener("click", (event) => {
    const chip = event.target.closest(".saved-show-chip");
    if (chip?.dataset.showId && suppressNextSetlistClickId === chip.dataset.showId) {
      suppressNextSetlistClickId = "";
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const checkbox = event.target.closest("[data-select-show]");
    if (checkbox) {
      const id = checkbox.dataset.selectShow;
      if (checkbox.checked) selectedSetlistIds.add(id);
      else selectedSetlistIds.delete(id);
      renderSavedShows();
      return;
    }
    if (selectedSetlistIds.size && chip?.dataset.showId) {
      event.preventDefault();
      toggleSetlistSelection(chip.dataset.showId);
      return;
    }
    const button = event.target.closest("[data-open-show]");
    if (!button) return;
    if (els.savedShowsDetails) els.savedShowsDetails.open = false;
    switchShow(button.dataset.openShow);
  });

  els.setlistFolderFilters?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-folder-filter]");
    if (!button) return;
    activeSetlistFolderId = button.dataset.folderFilter || "";
    selectedSetlistIds = new Set();
    renderSavedShows();
  });

  els.moveSetlistsFolder?.addEventListener("change", (event) => {
    if (!event.target.value) return;
    moveSelectedSetlists(event.target.value);
    event.target.value = "";
  });
  els.setlistsBackTopButton?.addEventListener("click", () => {
    selectedSetlistIds = new Set();
    setSidePanelMode("library");
    renderSavedShows();
  });

  els.showsTabButton.addEventListener("click", () => {
    els.headerMenu.open = false;
    setSidePanelMode(sidePanelMode === "shows" ? "library" : "shows");
  });

  els.showsBackButton?.addEventListener("click", () => {
    selectedSetlistIds = new Set();
    setSidePanelMode("library");
    renderSavedShows();
  });

  els.newShowButton.addEventListener("click", () => {
    if (els.savedShowsDetails) els.savedShowsDetails.open = false;
    createNewShow();
    setSidePanelMode("shows");
  });
  els.newSetlistFolderButton?.addEventListener("click", createSetlistFolder);
  els.setlistFolderForm?.addEventListener("submit", saveSetlistFolderFromDialog);
  els.duplicateShowButton.addEventListener("click", () => {
    if (els.savedShowsDetails) els.savedShowsDetails.open = false;
    duplicateCurrentShow();
    setSidePanelMode("shows");
  });
  els.deleteShowButton.addEventListener("click", () => {
    if (els.savedShowsDetails) els.savedShowsDetails.open = false;
    deleteSelectedSetlists();
    setSidePanelMode("shows");
  });

  els.saveLineupButton.addEventListener("click", () => {
    commitShowMetaFromFields();
    els.showName.value = state.show.name;
    saveState();
    toast("Setlist saved on this device.");
  });

  els.renameShowButton?.addEventListener("click", () => {
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
  els.accountSignInModeButton?.addEventListener("click", () => setAccountMode("sign-in"));
  els.accountSignUpModeButton?.addEventListener("click", () => setAccountMode("sign-up"));
  els.accountBackButton?.addEventListener("click", showAccountChoices);
  els.accountPasswordToggle?.addEventListener("click", toggleAccountPasswordVisibility);
  els.accountNewPasswordToggle?.addEventListener("click", () => togglePasswordFieldVisibility(els.accountNewPassword, els.accountNewPasswordToggle));
  els.accountConfirmPasswordToggle?.addEventListener("click", () => togglePasswordFieldVisibility(els.accountConfirmPassword, els.accountConfirmPasswordToggle));
  els.accountUseCase?.addEventListener("change", updateAccountUseCaseFields);
  els.accountProfileUseCase?.addEventListener("change", updateAccountProfileUseCaseFields);
  els.accountRefreshProfileButton?.addEventListener("click", loadAccountProfileFromCloud);
  els.accountSaveProfileButton?.addEventListener("click", saveAccountProfileToCloud);
  els.accountChangePasswordButton?.addEventListener("click", changeAccountPasswordFromDialog);
  els.accountCreateButton?.addEventListener("click", createAccountFromDialog);
  els.accountRecoverButton?.addEventListener("click", recoverPasswordFromAccountDialog);
  els.accountGuestButton?.addEventListener("click", continueAsGuest);
  els.accountSaveCloudButton?.addEventListener("click", async () => {
    updateAccountDialog("Saving...");
    try {
      await saveCurrentWorkspaceToCloud();
      updateAccountDialog("Saved this device to the cloud.");
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
    if (requireAccountForApp) {
      openRequiredAccountDialog("You signed out. Sign in again to use Lineup.");
    }
  });
  els.accountDialog?.addEventListener("cancel", (event) => {
    if (authGateActive && !getCloudSession() && !hasGuestSession()) {
      event.preventDefault();
    }
  });
  els.accountDialog?.addEventListener("close", () => {
    if (authGateActive && !getCloudSession() && !hasGuestSession()) {
      window.setTimeout(() => openRequiredAccountDialog(), 0);
    }
  });
  els.copyShareButton.addEventListener("click", copyShareLink);
  els.downloadLineupFileButton.addEventListener("click", downloadLineupFile);
  els.openLineupFileButton?.addEventListener("click", openLineupFile);
  els.openLineupFileMenuButton?.addEventListener("click", () => {
    if (els.headerMenu) els.headerMenu.open = false;
    openLineupFile();
  });
  els.openLineupFileSetlistsButton?.addEventListener("click", openLineupFile);
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

  els.exportSlidesButton?.addEventListener("click", (event) => {
    event.preventDefault();
    els.headerMenu.open = false;
    openSlidesExportDialog();
  });
  els.exportSlidesFromMenuButton?.addEventListener("click", (event) => {
    event.preventDefault();
    openSlidesExportDialog();
  });
  els.presentationMenuButton?.addEventListener("click", (event) => {
    event.preventDefault();
    if (els.headerMenu) els.headerMenu.open = false;
    openPresentation().catch((error) => toast(error instanceof Error ? error.message : "Could not open presentation."));
  });
  els.slidesPresentButton?.addEventListener("click", (event) => {
    event.preventDefault();
    openPresentation().catch((error) => toast(error instanceof Error ? error.message : "Could not open presentation."));
  });
  els.presentationPrevButton?.addEventListener("click", () => movePresentation(-1));
  els.presentationNextButton?.addEventListener("click", () => movePresentation(1));
  els.presentationFullscreenButton?.addEventListener("click", togglePresentationFullscreen);
  els.presentationCloseButton?.addEventListener("click", closePresentation);
  els.presentationDialog?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closePresentation();
  });
  els.slidePreviewToggle?.addEventListener("click", (event) => {
    event.preventDefault();
    els.headerMenu.open = false;
    setSlidePreviewOpen(!slidePreviewOpen);
  });
  els.closeSlidePreviewButton?.addEventListener("click", () => setSlidePreviewOpen(false));
  els.prevSlidePreviewButton?.addEventListener("click", () => {
    activeSlidePreviewIndex -= 1;
    renderSlidePreview();
  });
  els.nextSlidePreviewButton?.addEventListener("click", () => {
    activeSlidePreviewIndex += 1;
    renderSlidePreview();
  });
  els.slidesExportForm?.addEventListener("submit", submitSlidesExport);
  document.querySelectorAll("input[name='slidesExportTheme']").forEach((input) => {
    input.addEventListener("change", () => {
      renderSlidesExportPreview().then(persistCurrentSlidesExportTheme).catch((error) => toast(error instanceof Error ? error.message : "Could not update theme."));
    });
  });
  els.slidesExportImage?.addEventListener("change", async () => {
    if (els.slidesExportPresetSelect) els.slidesExportPresetSelect.value = "";
    if (els.deleteSlidesPresetButton) els.deleteSlidesPresetButton.disabled = true;
    await renderSlidesExportPreview();
    await persistCurrentSlidesExportTheme();
  });
  els.slidesExportPresetSelect?.addEventListener("change", async () => {
    if (els.slidesExportImage) els.slidesExportImage.value = "";
    if (els.deleteSlidesPresetButton) els.deleteSlidesPresetButton.disabled = !els.slidesExportPresetSelect.value;
    const preset = selectedSlidesThemePreset();
    if (preset) {
      slidesExportPendingImage = preset.image;
      if (els.slidesExportImageZoom) els.slidesExportImageZoom.value = String(sanitizeSlideExportCrop(preset.crop).zoom);
      if (els.slidesExportImageX) els.slidesExportImageX.value = String(sanitizeSlideExportCrop(preset.crop).x);
      if (els.slidesExportImageY) els.slidesExportImageY.value = String(sanitizeSlideExportCrop(preset.crop).y);
    }
    await renderSlidesExportPreview();
    await persistCurrentSlidesExportTheme();
  });
  [els.slidesExportImageZoom, els.slidesExportImageX, els.slidesExportImageY].forEach((input) => {
    input?.addEventListener("input", () => {
      renderSlidesExportPreview().then(persistCurrentSlidesExportTheme).catch((error) => toast(error instanceof Error ? error.message : "Could not update crop."));
    });
  });
  els.slidesExportPreview?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-slide-preview-step]");
    if (!button || button.disabled) return;
    slidesExportPreviewIndex += Number(button.dataset.slidePreviewStep || 0);
    renderSlidesExportPreview().catch((error) => toast(error instanceof Error ? error.message : "Could not change preview slide."));
  });
  const updateSlidesExportTextOptions = () => {
    const options = getSlidesExportOptions();
    state.show.slideExportShowTitles = options.showTitles;
    state.show.slideExportShowCredits = options.showCredits;
    state.show.slideExportShowCount = options.showCount;
    saveState();
    renderSlidesExportPreview().catch((error) => toast(error instanceof Error ? error.message : "Could not update slide option."));
    if (slidePreviewOpen) renderSlidePreview();
  };
  [els.slidesShowTitlesToggle, els.slidesShowCreditsToggle, els.slidesShowCountToggle].forEach((input) => {
    input?.addEventListener("change", updateSlidesExportTextOptions);
  });
  els.saveSlidesPresetButton?.addEventListener("click", () => {
    saveCurrentSlidesPreset().catch((error) => toast(error instanceof Error ? error.message : "Could not save preset."));
  });
  els.deleteSlidesPresetButton?.addEventListener("click", () => {
    deleteCurrentSlidesPreset().catch((error) => toast(error instanceof Error ? error.message : "Could not delete preset."));
  });
  els.clearSlidesImageButton?.addEventListener("click", () => {
    clearSlidesExportImage().catch((error) => toast(error instanceof Error ? error.message : "Could not clear image."));
  });
  els.slidesEditorBackButton?.addEventListener("click", () => closeSlidesEditor(true));
  els.slidesSaveScopeSelect?.addEventListener("change", (event) => setSlidesSaveScope(event.target.value));
  els.slidesCreateButton?.addEventListener("click", createSlidesFromPastedLyrics);
  els.slidesEditFullLyricsButton?.addEventListener("click", editSlidesFullLyrics);
  els.slidesUseSongNotesButton?.addEventListener("click", fillSlidesFromSongNotes);
  els.slidesEditorPreviewButton?.addEventListener("click", previewSlidesEditorSet);
  els.slidesEditorPresentButton?.addEventListener("click", presentSlidesEditorFullscreen);
  els.slidesEditorReadyButton?.addEventListener("click", markSlidesEditorReady);
  els.slidesAddSlideButton?.addEventListener("click", addSlidesEditorSlide);
  els.slidesUndoButton?.addEventListener("click", undoSlidesEditor);
  els.slidesRedoButton?.addEventListener("click", redoSlidesEditor);
  els.slidesDuplicateButton?.addEventListener("click", duplicateSlidesEditorSlide);
  els.slidesSplitButton?.addEventListener("click", splitSlidesEditorSlide);
  els.slidesDeleteButton?.addEventListener("click", deleteSlidesEditorSlide);
  els.slidesMoveUpButton?.addEventListener("click", () => moveSlidesEditorSlide(-1));
  els.slidesMoveDownButton?.addEventListener("click", () => moveSlidesEditorSlide(1));
  els.slidesSentencePreviousButton?.addEventListener("click", () => moveSlidesEditorLine("previous"));
  els.slidesSentenceNextButton?.addEventListener("click", () => moveSlidesEditorLine("next"));
  els.slidesJoinPreviousButton?.addEventListener("click", () => joinSlidesEditorSlide("previous"));
  els.slidesJoinNextButton?.addEventListener("click", () => joinSlidesEditorSlide("next"));
  els.slidesFontDownButton?.addEventListener("click", () => changeSlidesEditorFont(-4));
  els.slidesFontUpButton?.addEventListener("click", () => changeSlidesEditorFont(4));
  els.slidesFitScreenButton?.addEventListener("click", fitSlidesEditorFontToScreen);
  window.addEventListener("resize", () => {
    if (els.slidesEditorDialog?.open && activeSlidesDraft.length) renderSlidesEditor(true);
  }, { passive: true });
  els.slidesCurrentText?.addEventListener("input", updateCurrentSlideText);
  els.slidesEditorList?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-slide-index]");
    if (!button) return;
    selectSlidesEditorSlide(Number(button.dataset.slideIndex));
  });
  els.slidesThemeButtons?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-slide-theme]");
    if (!button) return;
    setSlidesEditorTheme(button.dataset.slideTheme);
  });
  els.slidesEditorDialog?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeSlidesEditor(true);
  });
  els.slidesEditorDialog?.addEventListener("click", (event) => {
    if (event.target !== els.slidesEditorDialog) return;
    event.preventDefault();
    closeSlidesEditor(true);
  });

  document.addEventListener("pointerdown", (event) => {
    const select = event.target.closest?.(".capo-select");
    if (select && isMobileLayout()) setCapoSelectLabels(select, false);
  }, true);

  document.addEventListener("focusin", (event) => {
    const select = event.target.closest?.(".capo-select");
    if (select && isMobileLayout()) setCapoSelectLabels(select, false);
  }, true);

  document.addEventListener("focusout", (event) => {
    const select = event.target.closest?.(".capo-select");
    if (select && isMobileLayout()) window.setTimeout(() => setCapoSelectLabels(select, true), 0);
  }, true);

  document.addEventListener("change", (event) => {
    const select = event.target.closest?.(".capo-select");
    if (select && isMobileLayout()) window.setTimeout(refreshCapoSelectLabels, 0);
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
    state.show.name = event.target.value.trim() || defaultShowName;
    els.showName.value = state.show.name;
    saveState();
    renderSavedShows();
  });

  els.showName.addEventListener("input", (event) => {
    state.show.name = event.target.value.trim() || defaultShowName;
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
    const row = event.target.closest(".bank-song");
    if (row && !event.target.closest("[data-action='toggle-banger'], [data-action='edit-bank'], [data-action='slides'], [data-action='sheets'], .more-button")) {
      event.preventDefault();
      addSongToLineup(row.dataset.songId, true);
      return;
    }
    if (!actionEl) return;
    const songId = actionEl.dataset.songId;
    if (actionEl.dataset.action === "add-bank") {
      event.preventDefault();
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
    if (actionEl.dataset.action === "sheets") {
      openLibrarySheetsDialog(songId);
      return;
    }
    if (actionEl.dataset.action === "edit-bank") {
      const song = state.songs.find((candidate) => candidate.id === songId);
      openSongDialog(song);
    }
  });

  els.songBankList.addEventListener("keydown", (event) => {
    if (!["Enter", " "].includes(event.key)) return;
    if (event.target.closest("[data-action='toggle-banger'], [data-action='edit-bank'], [data-action='slides'], [data-action='sheets'], .more-button")) return;
    const row = event.target.closest(".bank-song");
    if (!row) return;
    event.preventDefault();
    addSongToLineup(row.dataset.songId, true);
  });

  els.songBankList.addEventListener("dblclick", (event) => {
    if (!event.target.closest(".bank-song")) return;
    event.preventDefault();
  });


  els.lineupRows.addEventListener("click", (event) => {
    const actionEl = event.target.closest("[data-action]");
    if (!actionEl || !els.lineupRows.contains(actionEl)) return;
    const action = actionEl.dataset.action;
    const lineupId = actionEl.dataset.lineupId;
    const songId = actionEl.dataset.songId || "";
    if (!["ready", "info", "remove", "edit-note", "edit-lineup-note", "slides", "sheets", "edit-slide-title", "slide-image"].includes(action)) return;
    event.preventDefault();
    handleLineupAction(action, lineupId, songId, actionEl);
  });

  els.lineupRows.addEventListener("change", (event) => {
    const control = event.target.closest("[data-action][data-lineup-id]");
    if (!control || !els.lineupRows.contains(control)) return;
    const action = control.dataset.action;
    if (action === "capo") {
      setLineupCapo(control.dataset.lineupId, control.value);
      return;
    }
    if (action === "key") {
      setLineupKey(control.dataset.lineupId, control.value);
      return;
    }
    if (action === "note") {
      setLineupNote(control.dataset.lineupId, control.value);
    }
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
  els.exportTabButtons?.forEach((button) => {
    button.addEventListener("click", () => setExportTab(button.dataset.exportTab));
  });
  els.sheetPackSelection?.addEventListener("change", (event) => {
    const songInput = event.target.closest("[data-sheet-export-song]");
    if (songInput) {
      const group = songInput.closest("[data-sheet-export-group]");
      group?.querySelectorAll("[data-sheet-export-attachment]").forEach((input) => {
        input.checked = songInput.checked;
      });
      return;
    }
    const attachmentInput = event.target.closest("[data-sheet-export-attachment]");
    if (!attachmentInput) return;
    const group = attachmentInput.closest("[data-sheet-export-group]");
    const songToggle = group?.querySelector("[data-sheet-export-song]");
    if (songToggle) {
      const children = Array.from(group.querySelectorAll("[data-sheet-export-attachment]"));
      songToggle.checked = children.some((input) => input.checked);
    }
  });
  els.exportSheetPackButton?.addEventListener("click", exportSheetPackPdf);
  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => {
      const dialog = button.closest("dialog");
      closeDialog(dialog);
    });
  });
  document.querySelectorAll("dialog").forEach((dialog) => {
    if (dialog.dataset.backdropCloseBound) return;
    dialog.dataset.backdropCloseBound = "true";
    dialog.addEventListener("click", (event) => {
      if (event.defaultPrevented) return;
      if (event.target !== dialog) return;
      if (dialog === els.slidesEditorDialog) {
        event.preventDefault();
        closeSlidesEditor(true);
        return;
      }
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
  bind(els.oneTimeSongButton, "click", () => openOneTimeSongDialog());
  bind(els.quickAddButton, "click", openQuickAddDialog);
  bind(els.addSlideOnlyButton, "click", addSlideOnlyItem);
  bind(els.slideOnlyImageInput, "change", attachSlideOnlyImageFromInput);
  bind(els.addOneTimeSongButton, "click", addOneTimeSongFromDialog);
  bind(els.addNoteButton, "click", () => openNoteDialog());
  bind(els.toggleFiltersButton, "click", toggleLibraryFilters);
  bind(els.homeButton, "click", handleHomeButtonClick);
  bind(els.homeMenuButton, "click", openSongleadingHome);
  bind(els.saveLineupButton, "click", () => {
    commitShowMetaFromFields();
    saveState();
    toast("Setlist saved on this device.");
  });
  bind(els.exportButton, "click", (event) => {
    event.preventDefault();
    commitShowMetaFromFields();
    openExportPreview();
  });
  bind(els.showsTabButton, "click", () => {
    els.headerMenu.open = false;
    setSidePanelMode(sidePanelMode === "shows" ? "library" : "shows");
  });
  bind(els.startNewSetlistButton, "click", () => {
    createNewShow();
    setSidePanelMode("library");
    closeSetlistStartDialog();
    maybeShowOnboardingTips();
  });
  bind(els.openExistingSetlistButton, "click", () => {
    setSidePanelMode("shows");
    closeSetlistStartDialog();
    maybeShowOnboardingTips();
  });
  bind(els.dismissOnboardingButton, "click", advanceOnboardingTips);
  bind(els.dontShowTipsButton, "click", () => closeOnboardingTips(true));
  bind(els.themeToggle, "click", (event) => {
    event?.stopPropagation?.();
    els.headerMenu.open = false;
    toggleTheme();
  });
}

function bindPointerDragFallback() {
  if (document.body.dataset.pointerDragBound) return;
  document.body.dataset.pointerDragBound = "true";
  let drag = null;
  let suppressNextClick = false;

  const stopPointerDrag = () => {
    if (drag?.longPressTimer) window.clearTimeout(drag.longPressTimer);
    document.body.classList.remove("is-pointer-dragging");
    document.querySelectorAll(".dragging").forEach((row) => row.classList.remove("dragging"));
    document.querySelectorAll(".long-press-ready").forEach((row) => row.classList.remove("long-press-ready"));
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
    const mobile = isMobileLayout();
    const touchReorder = isTouchReorderLayout();
    const bankRow = event.target.closest?.(".bank-song");
    const lineupRow = event.target.closest?.(".lineup-row");
    const mobileDragHandle = mobile ? event.target.closest?.(".lineup-row .drag-handle") : null;
    if (mobile && !lineupRow && !bankRow) return;
    const blockedControl = event.target.closest?.("input, select, textarea, [data-close-dialog], dialog");
    if (blockedControl) return;
    const blockedButton = event.target.closest?.("button, a, summary, [role='button'], [data-action='toggle-banger'], [data-action='edit-bank'], [data-action='slides'], [data-action='sheets'], .more-button, .icon-action, .ready-toggle");
    if (blockedButton && !mobileDragHandle) return;

    if (bankRow) {
      drag = {
        type: "bank",
        id: bankRow.dataset.songId,
        startX: event.clientX,
        startY: event.clientY,
        row: bankRow,
        pointerId: event.pointerId,
        active: false,
        longPressReady: !touchReorder,
        longPressTimer: null,
      };
      if (touchReorder) {
        drag.longPressTimer = window.setTimeout(() => {
          if (!drag || drag.pointerId !== event.pointerId || drag.type !== "bank") return;
          drag.longPressReady = true;
          drag.row?.classList.add("long-press-ready");
        }, 240);
      }
      bankRow.setPointerCapture?.(event.pointerId);
      return;
    }

    if (lineupRow) {
      drag = {
        type: "lineup",
        id: lineupRow.dataset.lineupId,
        startX: event.clientX,
        startY: event.clientY,
        row: lineupRow,
        pointerId: event.pointerId,
        active: false,
        longPressReady: true,
        longPressTimer: null,
      };
      lineupRow.setPointerCapture?.(event.pointerId);
    }
  }, true);

  document.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
    if (!drag.active && drag.type === "bank" && isTouchReorderLayout() && !drag.longPressReady) {
      if (distance > 12) {
        if (drag.longPressTimer) window.clearTimeout(drag.longPressTimer);
        drag = null;
      }
      return;
    }
    if (!drag.active && distance < 7) return;
    if (!drag.active) {
      if (drag.longPressTimer) window.clearTimeout(drag.longPressTimer);
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
    const droppedInLineup =
      Boolean(document.elementFromPoint(event.clientX, event.clientY)?.closest?.("#lineupRows")) ||
      pointNearLineupRows(event.clientX, event.clientY);
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

function bindMobileLibraryDrawerDrag() {
  if (!els.bankPanel || document.body.dataset.mobileLibraryDragBound) return;
  document.body.dataset.mobileLibraryDragBound = "true";
  let drag = null;
  let suppressPanelClick = false;

  const mobileLibraryHeight = () => {
    if (els.appShell.classList.contains("bank-collapsed")) {
      return Math.max(44, Math.round(els.bankPanel.getBoundingClientRect().height || 44));
    }
    return mobileLibraryExpanded ? Math.max(0, window.innerHeight - 12) : Math.min(window.innerHeight * 0.44, 430);
  };

  const setDragHeight = (height) => {
    const minHeight = 44;
    const maxHeight = Math.max(minHeight, window.innerHeight - 12);
    const nextHeight = clampNumber(Math.round(height), minHeight, maxHeight);
    els.bankPanel.style.setProperty("--mobile-library-height", `${nextHeight}px`);
  };

  const finishDrag = (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const deltaY = event.clientY - drag.startY;
    const finalHeight = drag.startHeight - deltaY;
    const expandedCutoff = window.innerHeight * 0.68;
    const minimizedCutoff = window.innerHeight * 0.22;
    els.bankPanel.classList.remove("is-dragging");
    els.bankPanel.style.removeProperty("--mobile-library-height");
    suppressPanelClick = Boolean(drag.active);
    if (!drag.active && drag.fromHeader) {
      setMobileLibraryState(mobileLibraryState === "minimized" ? "middle" : "minimized");
    } else if (drag.fromMinimized && deltaY < -18 && finalHeight < expandedCutoff) {
      setMobileLibraryState("middle");
    } else if (finalHeight >= expandedCutoff) {
      setMobileLibraryState("full");
    } else if (finalHeight <= minimizedCutoff) {
      setMobileLibraryState("minimized");
    } else {
      setMobileLibraryState("middle");
    }
    drag = null;
    window.setTimeout(() => {
      suppressPanelClick = false;
    }, 180);
  };

  els.bankPanel.addEventListener("pointerdown", (event) => {
    if (!isLibraryDrawerLayout()) return;
    if (event.target.closest(".bank-song")) return;
    if (event.target.closest("button, input, select, textarea, a, summary")) return;
    const fromHeader = Boolean(event.target.closest(".bank-header") || event.target === els.bankPanel);
    if (!fromHeader && !event.target.closest(".side-panel-view, .song-bank-list, .category-filters, .search-row")) return;
    drag = {
      startY: event.clientY,
      startHeight: mobileLibraryHeight(),
      pointerId: event.pointerId,
      fromHeader,
      fromMinimized: mobileLibraryState === "minimized" || els.appShell.classList.contains("bank-collapsed"),
      active: false,
    };
    els.bankPanel.classList.add("is-dragging");
    els.bankPanel.setPointerCapture?.(event.pointerId);
  });

  els.bankPanel.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const deltaY = event.clientY - drag.startY;
    const activationDistance = drag.fromMinimized && deltaY < 0 ? 2 : 6;
    if (Math.abs(deltaY) < activationDistance) return;
    drag.active = true;
    event.preventDefault();
    setDragHeight(drag.startHeight - deltaY);
  }, { passive: false });

  els.bankPanel.addEventListener("pointerup", finishDrag);
  els.bankPanel.addEventListener("pointercancel", (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    els.bankPanel.classList.remove("is-dragging");
    drag = null;
  });

  els.bankPanel.addEventListener("click", (event) => {
    if (!suppressPanelClick) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    suppressPanelClick = false;
  }, true);

  window.addEventListener("resize", () => {
    if (!isLibraryDrawerLayout()) {
      setMobileLibraryExpanded(false);
      if (isLandscapeSideBankLayout()) {
        els.appShell?.classList.remove("bank-collapsed");
        applySidePanelMode();
      }
    }
  });
}

function bindMobileTapBridge() {
  if (document.body.dataset.mobileTapBridgeBound) return;
  document.body.dataset.mobileTapBridgeBound = "true";
  let tap = null;

  document.addEventListener("pointerdown", (event) => {
    if (!isMobileLayout() || event.pointerType === "mouse") return;
    const control = event.target.closest?.("button, a, [data-show-id]");
    if (!control) return;
    tap = {
      control,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };
  }, true);

  document.addEventListener("pointerup", (event) => {
    if (!tap || tap.pointerId !== event.pointerId) return;
    const distance = Math.hypot(event.clientX - tap.startX, event.clientY - tap.startY);
    const control = tap.control;
    tap = null;
    if (distance > 10) return;
    if (!control.isConnected || control.disabled || control.getAttribute("aria-disabled") === "true") return;
    if (control.closest("dialog:not([open])")) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    window.setTimeout(() => {
      if (control.isConnected) control.click();
    }, 0);
  }, true);

  document.addEventListener("pointercancel", () => {
    tap = null;
  }, true);
}

function bindMobileDeleteConfirmCancel() {
  if (document.body.dataset.mobileDeleteConfirmBound) return;
  document.body.dataset.mobileDeleteConfirmBound = "true";

  document.addEventListener("pointerdown", (event) => {
    if (!pendingLineupDeleteId) return;
    const removeButton = event.target.closest?.('[data-action="remove"][data-lineup-id]');
    if (removeButton?.dataset.lineupId === pendingLineupDeleteId) return;
    clearPendingLineupDelete();
  }, true);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") clearPendingLineupDelete();
  });
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

      if (handleMobileControl(control, event)) return;

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

      if (control.id === "oneTimeSongButton") {
        handled();
        populateFormOptions();
        openOneTimeSongDialog();
        return;
      }

      if (control.id === "quickAddButton") {
        handled();
        openQuickAddDialog();
        return;
      }

      if (control.id === "addSlideOnlyButton") {
        handled();
        addSlideOnlyItem();
        return;
      }

      if (control.id === "addNoteButton") {
        handled();
        openNoteDialog();
        return;
      }

      if (control.id === "mobileAddFirstSongButton") {
        handled();
        handleAddFirstSongAction();
        return;
      }

      if (control.id === "accountGuestButton") {
        handled();
        continueAsGuest();
        return;
      }

      if (control.id === "accountSignInModeButton") {
        handled();
        setAccountMode("sign-in");
        return;
      }

      if (control.id === "accountSignUpModeButton") {
        handled();
        setAccountMode("sign-up");
        return;
      }

      if (control.id === "accountRecoverButton") {
        handled();
        recoverPasswordFromAccountDialog();
        return;
      }

      if (control.id === "accountBackButton") {
        handled();
        showAccountChoices();
        return;
      }

      if (control.id === "accountChangePasswordButton") {
        handled();
        changeAccountPasswordFromDialog();
        return;
      }

      if (control.id === "accountSubmitButton") {
        handled();
        signInFromAccountDialog(event);
        return;
      }

      if (control.matches("[data-mobile-command]")) {
        handled();
        els.headerMenu.open = false;
        handleMobileMenuCommand(control.dataset.mobileCommand);
        return;
      }

      if (control.id === "saveLineupButton") {
        handled();
        commitShowMetaFromFields();
        saveState();
        toast("Setlist saved on this device.");
        return;
      }

      if (control.id === "exportButton") {
        handled();
        commitShowMetaFromFields();
        openExportPreview();
        return;
      }

      if (control.id === "exportSlidesButton" || control.id === "exportSlidesFromMenuButton") {
        handled();
        openSlidesExportDialog();
        return;
      }

      if (control.id === "slidesEditorBackButton") {
        handled();
        closeSlidesEditor(true);
        return;
      }

      if (control.id === "slidesCreateButton") {
        handled();
        createSlidesFromPastedLyrics();
        return;
      }

      if (control.id === "slidesEditFullLyricsButton") {
        handled();
        editSlidesFullLyrics();
        return;
      }

      if (control.id === "slidesUseSongNotesButton") {
        handled();
        fillSlidesFromSongNotes();
        return;
      }

      if (control.id === "slidesEditorPreviewButton") {
        handled();
        previewSlidesEditorSet();
        return;
      }

      if (control.id === "slidesEditorPresentButton") {
        handled();
        presentSlidesEditorFullscreen();
        return;
      }

      if (control.id === "slidesEditorReadyButton") {
        handled();
        markSlidesEditorReady();
        return;
      }

      if (control.id === "slidesAddSlideButton") {
        handled();
        addSlidesEditorSlide();
        return;
      }

      if (control.id === "slidesUndoButton") {
        handled();
        undoSlidesEditor();
        return;
      }

      if (control.id === "slidesRedoButton") {
        handled();
        redoSlidesEditor();
        return;
      }

      if (control.id === "slidesDuplicateButton") {
        handled();
        duplicateSlidesEditorSlide();
        return;
      }

      if (control.id === "slidesSplitButton") {
        handled();
        splitSlidesEditorSlide();
        return;
      }

      if (control.id === "slidesDeleteButton") {
        handled();
        deleteSlidesEditorSlide();
        return;
      }

      if (control.id === "slidesMoveUpButton") {
        handled();
        moveSlidesEditorSlide(-1);
        return;
      }

      if (control.id === "slidesMoveDownButton") {
        handled();
        moveSlidesEditorSlide(1);
        return;
      }

      if (control.id === "slidesSentencePreviousButton") {
        handled();
        moveSlidesEditorLine("previous");
        return;
      }

      if (control.id === "slidesSentenceNextButton") {
        handled();
        moveSlidesEditorLine("next");
        return;
      }

      if (control.id === "slidesJoinPreviousButton") {
        handled();
        joinSlidesEditorSlide("previous");
        return;
      }

      if (control.id === "slidesJoinNextButton") {
        handled();
        joinSlidesEditorSlide("next");
        return;
      }

      if (control.id === "slidesFontDownButton") {
        handled();
        changeSlidesEditorFont(-4);
        return;
      }

      if (control.id === "slidesFontUpButton") {
        handled();
        changeSlidesEditorFont(4);
        return;
      }

      if (control.id === "slidesFitScreenButton") {
        handled();
        fitSlidesEditorFontToScreen();
        return;
      }

      if (control.matches("[data-slide-index]")) {
        handled();
        selectSlidesEditorSlide(Number(control.dataset.slideIndex));
        return;
      }

      if (control.matches("[data-slide-theme]")) {
        handled();
        setSlidesEditorTheme(control.dataset.slideTheme);
        return;
      }

      if (control.id === "showsTabButton") {
        handled();
        els.headerMenu.open = false;
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
        closeMobileLibraryDrawer();
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

      if (control.id === "addOneTimeSongButton") {
        handled();
        addOneTimeSongFromDialog(event);
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
        const category = control.dataset.category;
        if (activeCategories.has(category)) activeCategories.delete(category);
        else activeCategories.add(category);
        render();
        return;
      }

      if (control.matches("[data-banger-filter]")) {
        handled();
        bangersOnly = !bangersOnly;
        render();
        return;
      }

      if (control.matches("[data-hebrew-filter]")) {
        handled();
        hebrewOnly = !hebrewOnly;
        render();
        return;
      }

      if (control.matches("[data-show-id]")) {
        handled();
        if (suppressNextSetlistClickId === control.dataset.showId) {
          suppressNextSetlistClickId = "";
          return;
        }
        if (selectedSetlistIds.size) {
          toggleSetlistSelection(control.dataset.showId);
          return;
        }
        switchShow(control.dataset.showId);
        return;
      }

      if (control.id === "setlistsBackTopButton") {
        handled();
        selectedSetlistIds = new Set();
        setSidePanelMode("library");
        renderSavedShows();
        return;
      }

      if (control.id === "newShowButton") {
        handled();
        createNewShow();
        setSidePanelMode("shows");
        return;
      }

      if (control.id === "newSetlistFolderButton") {
        handled();
        createSetlistFolder();
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
        deleteSelectedSetlists();
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

        if (action === "sheets" && !lineupId) {
          openLibrarySheetsDialog(songId);
          return;
        }

        if (["ready", "info", "remove", "edit-note", "edit-lineup-note", "slides", "sheets", "edit-slide-title", "slide-image"].includes(action)) {
          handleLineupAction(action, lineupId, songId || "", control);
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

      if (control.id === "openLineupFileButton" || control.id === "openLineupFileMenuButton" || control.id === "openLineupFileSetlistsButton") {
        handled();
        if (control.id === "openLineupFileMenuButton" && els.headerMenu) els.headerMenu.open = false;
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
      if (![els.songForm, els.quickAddForm, els.noteForm, els.showNotesForm, els.teamForm, els.setlistFolderForm].includes(event.target)) return;
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
        return;
      }

      if (event.target === els.setlistFolderForm) {
        saveSetlistFolderFromDialog(event);
      }
    },
    true
  );
}


function startApp() {
  applyInstalledShellMode();
  if (isMobileLayout()) {
    finishIntro();
    closeOnboardingTips(true);
    authGateActive = false;
    document.body.classList.remove("auth-required", "coach-active");
    closeDialog(els.accountDialog);
  }
  bindEmergencyButtonDelegates();
  bindCoreFallbackEvents();
  bindOnboardingControlEvents();
  bindMobileTapBridge();
  bindMobileDeleteConfirmCancel();
  bindPointerDragFallback();
  bindMobileLibraryDrawerDrag();
  bindSetlistLongPressSelection();

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
    applyAccent(localStorage.getItem(accentStorageKey) || "blue");

    if (importedSharedLineup) {
      finishIntro();
      toast("Shared setlist opened safely and saved here.");
      history.replaceState(null, "", window.location.href.split("#")[0]);
      ensureSignedInForApp().then((allowed) => {
        if (allowed && !isMobileLayout()) maybeShowOnboardingTips();
      });
    } else {
      showIntroThenStart();
    }
  } catch (error) {
    console.error("Could not start the lineup app.", error);
    finishIntro();
    bindCoreFallbackEvents();
    bindOnboardingControlEvents();
    document.body.classList.add("app-start-error");
    toast("Something blocked the app from starting. Refresh once, and if it stays stuck tell me.");
  }
}

window.addEventListener("lineup-native-ready", applyInstalledShellMode);

startApp();
