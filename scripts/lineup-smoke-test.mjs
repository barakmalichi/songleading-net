import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const appPath = new URL("../public/lineup/app.js", import.meta.url);
const indexPath = new URL("../public/lineup/index.html", import.meta.url);
const appSource = fs.readFileSync(appPath, "utf8");
const indexSource = fs.readFileSync(indexPath, "utf8");

assert.equal(/ on(?:click|change)=/i.test(indexSource), false, "index.html should not contain inline click/change handlers");
assert.equal(/ on(?:click|change)=/i.test(appSource), false, "rendered templates should not contain inline click/change handlers");
assert.match(indexSource, /app\.js\?v=168/);
assert.match(indexSource, /styles\.css\?v=168/);

function fakeElement() {
  const element = {
    dataset: {},
    style: { setProperty() {}, removeProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    children: [],
    options: [],
    value: "",
    checked: false,
    hidden: false,
    open: false,
    disabled: false,
    innerHTML: "",
    textContent: "",
    addEventListener() {},
    removeEventListener() {},
    append() {},
    appendChild() {},
    remove() {},
    removeAttribute() {},
    setAttribute() {},
    getAttribute() { return ""; },
    querySelector() { return fakeElement(); },
    querySelectorAll() { return []; },
    closest() { return null; },
    focus() {},
    select() {},
    reset() {},
    showModal() { this.open = true; },
    close() { this.open = false; },
    getBoundingClientRect() { return { left: 0, right: 0, top: 0, bottom: 0, width: 320, height: 48 }; },
  };
  return element;
}

const storage = new Map();
const context = {
  console,
  Blob,
  TextEncoder,
  TextDecoder,
  URL,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  atob: (value) => Buffer.from(value, "base64").toString("binary"),
  btoa: (value) => Buffer.from(value, "binary").toString("base64"),
  document: {
    body: fakeElement(),
    documentElement: fakeElement(),
    querySelector() { return fakeElement(); },
    querySelectorAll() { return []; },
    createElement() { return fakeElement(); },
    addEventListener() {},
    removeEventListener() {},
    elementFromPoint() { return fakeElement(); },
  },
  window: {
    location: { hash: "", href: "https://www.songleading.net/lineup/", protocol: "https:" },
    crypto: { randomUUID: () => "00000000-0000-4000-8000-000000000000" },
    matchMedia: () => ({ matches: false }),
    addEventListener() {},
    removeEventListener() {},
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    requestAnimationFrame: (fn) => setTimeout(fn, 0),
    innerWidth: 1280,
    innerHeight: 720,
  },
  localStorage: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  },
  sessionStorage: {
    getItem: () => null,
    setItem() {},
    removeItem() {},
  },
  navigator: { clipboard: { writeText: async () => {} } },
  history: { replaceState() {} },
  FileReader: class {},
  Image: class {},
  fetch: async () => ({ ok: true, json: async () => ({}) }),
};
context.globalThis = context;
context.window.document = context.document;

const testSource = appSource.replace(/\nstartApp\(\);\s*$/, "") + "\n;globalThis.__lineupSmoke = { normalizeState, normalizeLineupItem, normalizeOneTimeSong, encodeShareData, decodeShareData, escapeHtml };";
vm.createContext(context);
vm.runInContext(testSource, context, { filename: "app.js" });

const malicious = {
  activeShowId: "show<script>",
  setlistFolders: [{ id: "folder<script>", name: "  Folder  " }],
  songs: [{
    id: "song<script>",
    title: "<img src=x onerror=alert(1)>",
    key: "not-a-key",
    capo: "Capo 99",
    duration: "999:99",
    credits: "x".repeat(300),
    tags: Array.from({ length: 30 }, (_, index) => "tag" + index),
    slideSongId: "slide<script>",
    slideFlowId: "flow<script>",
  }],
  lineup: [{
    id: "lineup<script>",
    type: "song",
    songId: "song<script>",
    key: "bad",
    capo: "bad",
    note: "n".repeat(200),
    slidesStatus: "evil",
  }, {
    id: "slide<script>",
    type: "slide",
    title: "Slide only",
    image: "javascript:alert(1)",
    slidesStatus: "slides-ready",
  }],
};

const normalized = context.__lineupSmoke.normalizeState(malicious);
assert.equal(normalized.songs.length, 1);
assert.equal(normalized.songs[0].key, "C");
assert.equal(normalized.songs[0].capo, "");
assert.equal(normalized.songs[0].duration, "");
assert.equal(normalized.songs[0].credits.length, 120);
assert.equal(normalized.songs[0].tags.length, 12);
assert.equal(normalized.lineup[0].slidesStatus, "no-slides");
assert.equal(normalized.lineup[1].type, "slide");
assert.equal(normalized.lineup[1].title, "Slide only");
assert.equal(normalized.lineup[1].image, "");
assert.equal(normalized.lineup[1].slideSaveScope, "local");
assert.equal(/[<>]/.test(normalized.songs[0].id), false);
assert.equal(/[<>]/.test(normalized.lineup[0].id), false);
assert.equal(context.__lineupSmoke.escapeHtml("<b>") === "&lt;b&gt;", true);

const encoded = context.__lineupSmoke.encodeShareData({
  fileType: "show-lineup-builder",
  show: { name: "Share Test" },
  songs: [{ title: "Shared Song" }],
  lineup: [{ type: "song", songId: "bad<script>" }],
});
const decoded = JSON.parse(context.__lineupSmoke.decodeShareData(encoded));
assert.equal(decoded.fileType, "show-lineup-builder");

console.log("Lineup smoke tests passed.");
