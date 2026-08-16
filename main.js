const { app, BrowserWindow, Menu, globalShortcut, ipcMain, dialog, shell, Notification } = require("electron");
const fs = require("fs/promises");
const path = require("path");
const { pathToFileURL } = require("url");
const { autoUpdater } = require("electron-updater");

let win;
let updater;
let pendingMusicPath = null;
const AUDIO_EXTENSIONS = new Set([".mp3", ".wav", ".ogg"]);
const DEFAULT_SHORTCUTS = { fullscreen: "F11", home: "F1", gallery: "F2", anniversaries: "F3", map: "F4", myplan: "F5", appearance: "F12", add: "Alt+A", easterEgg: "Alt+F1" };
let shortcuts = { ...DEFAULT_SHORTCUTS };
const shortcutsPath = () => path.join(app.getPath("userData"), "shortcuts.json");
async function loadShortcuts() { try { shortcuts = { ...DEFAULT_SHORTCUTS, ...JSON.parse(await fs.readFile(shortcutsPath(), "utf8")) }; } catch { /* Default set. */ } }
function triggerShortcut(command) { if (command === "fullscreen") return win?.setFullScreen(!win.isFullScreen()); if (command === "easterEgg") return setTimeout(() => { throw new Error("Busuioc easter egg crash"); }, 50); win?.webContents.send("shortcut:command", command); }
function registerShortcuts() { globalShortcut.unregisterAll(); for (const [command, accelerator] of Object.entries(shortcuts)) globalShortcut.register(accelerator, () => triggerShortcut(command)); }

app.setAppUserModelId("com.busuioc.app");

function ensureStartMenuShortcut() {
    if (!app.isPackaged || process.platform !== "win32") return;

    try {
        shell.writeShortcutLink(path.join(app.getPath("startMenu"), "Busuioc App.lnk"), "create", {
            target: process.execPath,
            cwd: path.dirname(process.execPath),
            description: "Busuioc App",
            icon: process.execPath,
            iconIndex: 0,
            appUserModelId: "com.busuioc.app",
        });
    } catch (error) {
        console.warn("Scurtătura din meniul Start nu a putut fi creată:", error.message);
    }
}

async function initUpdater() {
    if (!app.isPackaged) return;
    try {
        autoUpdater.autoDownload = false;
        autoUpdater.autoInstallOnAppQuit = false;
        autoUpdater.on("update-available", (info) => {
            const description = info.releaseNotes || "";
            win?.webContents.send("update:available", { version: info.version, description });
        });
        autoUpdater.on("download-progress", (progress) => win?.webContents.send("update:progress", { percent: progress.percent || 0 }));
        autoUpdater.on("update-downloaded", () => {
            win?.webContents.send("update:ready");
            // The update runs after the app closes, with no installer wizard.
            setTimeout(() => autoUpdater.quitAndInstall(true, true), 1400);
        });
        autoUpdater.on("error", (error) => console.warn("Actualizarea nu a putut fi verificată:", error.message));
        autoUpdater.checkForUpdates();
    } catch (error) { console.warn("Configurarea actualizărilor a eșuat:", error.message); }
}

function libraryPaths() {
    const root = path.join(app.getPath("userData"), "extra-images");
    return { root, media: path.join(root, "media"), metadata: path.join(root, "media.json"), galleryState: path.join(root, "gallery-state.json") };
}

function planPaths() {
    const root = path.join(app.getPath("userData"), "my-plans");
    return { root, attachments: path.join(root, "attachments"), data: path.join(root, "plans.json") };
}

function recipePaths() {
    const root = path.join(app.getPath("userData"), "recipes");
    return { root, images: path.join(root, "images") };
}

function isSupportedAudioFile(filePath) {
    return typeof filePath === "string" && AUDIO_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function audioPathFromArguments(args) {
    return args.find((value) => isSupportedAudioFile(value));
}

function musicFileDetails(filePath) {
    return { path: filePath, name: path.basename(filePath), src: pathToFileURL(filePath).href };
}

function setWindowForPage(url) {
    if (!win || !url) return;
    const isMusicPlayer = /\/music-player\.html(?:[?#]|$)/i.test(url);
    if (isMusicPlayer) {
        win.setMinimumSize(750, 750);
        win.setMaximumSize(750, 750);
        win.setSize(750, 750);
    } else {
        win.setMaximumSize(0, 0);
        win.setMinimumSize(1300, 850);
        win.setSize(1300, 850);
    }
}

function openMusicFile(filePath) {
    if (!isSupportedAudioFile(filePath)) return;
    pendingMusicPath = filePath;
    if (win) win.loadFile(path.join(__dirname, "site", "music-player.html"));
}

const initialMusicPath = audioPathFromArguments(process.argv);
if (initialMusicPath) pendingMusicPath = initialMusicPath;
if (!app.requestSingleInstanceLock()) app.quit();

app.on("second-instance", (_event, commandLine) => {
    const filePath = audioPathFromArguments(commandLine);
    if (filePath) openMusicFile(filePath);
    if (win) { win.show(); win.focus(); }
});

app.on("open-file", (event, filePath) => {
    event.preventDefault();
    if (app.isReady()) openMusicFile(filePath);
    else if (isSupportedAudioFile(filePath)) pendingMusicPath = filePath;
});

function storagePaths() {
    const root = path.join(app.getPath("userData"), "my-storage");
    return { root, files: path.join(root, "files"), metadata: path.join(root, "files.json") };
}

async function ensureStorage() {
    const paths = storagePaths();
    await fs.mkdir(paths.files, { recursive: true });
    try { await fs.access(paths.metadata); } catch { await fs.writeFile(paths.metadata, "[]", "utf8"); }
    return paths;
}

const textExtensions = new Set(["txt", "md", "js", "css", "html", "htm", "json", "xml", "csv", "log", "yml", "yaml"]);
const fileExtension = (name) => path.extname(name).slice(1).toLowerCase();

async function listStorageFiles() {
    const paths = await ensureStorage();
    const files = JSON.parse(await fs.readFile(paths.metadata, "utf8"));
    return files.map((file) => ({ ...file, src: pathToFileURL(path.join(paths.files, file.storedName)).href, editable: textExtensions.has(file.extension) }));
}

async function importStorageFiles() {
    const picked = await dialog.showOpenDialog(win, { title: "Importă fișiere în MyStorage", properties: ["openFile", "multiSelections"] });
    if (picked.canceled || !picked.filePaths.length) return { canceled: true, files: [] };
    const paths = await ensureStorage();
    const metadata = JSON.parse(await fs.readFile(paths.metadata, "utf8"));
    const imported = [];
    for (const source of picked.filePaths) {
        const name = path.basename(source), extension = fileExtension(name), storedName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const stat = await fs.stat(source);
        const file = { id: `storage_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, name, storedName, extension, size: stat.size, importedAt: new Date().toISOString() };
        await fs.copyFile(source, path.join(paths.files, storedName)); metadata.unshift(file); imported.push({ ...file, src: pathToFileURL(path.join(paths.files, storedName)).href, editable: textExtensions.has(extension) });
    }
    await fs.writeFile(paths.metadata, JSON.stringify(metadata, null, 2), "utf8");
    return { canceled: false, files: imported };
}

async function readStorageFile(_event, id) {
    const paths = await ensureStorage(), files = JSON.parse(await fs.readFile(paths.metadata, "utf8")), file = files.find((item) => item.id === id);
    if (!file) throw new Error("Fișierul nu a fost găsit.");
    if (!textExtensions.has(file.extension)) return { ...file, src: pathToFileURL(path.join(paths.files, file.storedName)).href, editable: false };
    return { ...file, editable: true, content: await fs.readFile(path.join(paths.files, file.storedName), "utf8") };
}

async function saveStorageText(_event, { id, content }) {
    const paths = await ensureStorage(), files = JSON.parse(await fs.readFile(paths.metadata, "utf8")), file = files.find((item) => item.id === id);
    if (!file || !textExtensions.has(file.extension)) throw new Error("Acest fișier nu poate fi editat.");
    await fs.writeFile(path.join(paths.files, file.storedName), String(content || ""), "utf8");
    return true;
}

async function removeStorageFile(_event, id) {
    const paths = await ensureStorage(), files = JSON.parse(await fs.readFile(paths.metadata, "utf8")), file = files.find((item) => item.id === id);
    if (!file) return true;
    await fs.rm(path.join(paths.files, file.storedName), { force: true });
    await fs.writeFile(paths.metadata, JSON.stringify(files.filter((item) => item.id !== id), null, 2), "utf8"); return true;
}

async function uninstallStorage() { const paths = storagePaths(); await fs.rm(paths.root, { recursive: true, force: true }); return true; }

async function backupStorage() {
    const paths = await ensureStorage(), files = JSON.parse(await fs.readFile(paths.metadata, "utf8"));
    const target = await dialog.showSaveDialog(win, { title: "Backup MyStorage", defaultPath: `MyStorage-backup-${new Date().toISOString().slice(0, 10)}.zip`, filters: [{ name: "Arhivă ZIP", extensions: ["zip"] }] });
    if (target.canceled || !target.filePath) return { canceled: true };
    const entries = [{ name: "files.json", data: JSON.stringify(files, null, 2) }];
    for (const file of files) entries.push({ name: `files/${file.storedName}`, data: await fs.readFile(path.join(paths.files, file.storedName)) });
    await fs.writeFile(target.filePath, makeZip(entries)); return { canceled: false };
}

const starterPlans = [{
    id: "future-home",
    title: "Casa noastră viitoare",
    type: "Proiect",
    eventDate: "",
    notes: "Un loc al nostru, construit pas cu pas.",
    attachments: [],
    tasks: [
        { id: "home-location", text: "De ales locația", done: false },
        { id: "home-budget", text: "De calculat cheltuiala", done: false },
        { id: "home-style", text: "De adunat idei pentru stilul casei", done: false },
        { id: "home-priorities", text: "De stabilit prioritățile", done: false },
    ],
}];

async function ensurePlans() {
    const paths = planPaths();
    await fs.mkdir(paths.attachments, { recursive: true });
    try { await fs.access(paths.data); } catch { await fs.writeFile(paths.data, JSON.stringify(starterPlans, null, 2), "utf8"); }
    return paths;
}

async function readPlans() {
    const paths = await ensurePlans();
    try {
        const items = JSON.parse(await fs.readFile(paths.data, "utf8"));
        if (Array.isArray(items) && items.length > 0) return items;
        return starterPlans;
    } catch { return starterPlans; }
}

function cleanPlan(plan) {
    const text = (value, max = 3000) => String(value || "").trim().slice(0, max);
    const allowedTypes = ["Călătorie", "Eveniment", "Proiect", "Aniversare", "Personalizat"];
    return {
        id: text(plan.id, 80) || `plan_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        title: text(plan.title, 120) || "Plan fără titlu",
        type: allowedTypes.includes(plan.type) ? plan.type : "Personalizat",
        eventDate: text(plan.eventDate, 30),
        notes: text(plan.notes),
        attachments: Array.isArray(plan.attachments) ? plan.attachments.map((file) => ({ name: text(file.name, 180), src: text(file.src, 1000) })).filter((file) => file.name && file.src) : [],
        tasks: Array.isArray(plan.tasks) ? plan.tasks.map((task) => ({ id: text(task.id, 80) || `task_${Math.random().toString(36).slice(2, 8)}`, text: text(task.text, 240), done: Boolean(task.done) })).filter((task) => task.text) : [],
    };
}

async function savePlans(plans) {
    const paths = await ensurePlans();
    const clean = Array.isArray(plans) ? plans.map(cleanPlan) : [];
    await fs.writeFile(paths.data, JSON.stringify(clean, null, 2), "utf8");
    return clean;
}

async function importPlanAttachment() {
    const selected = await dialog.showOpenDialog(win, { title: "Alege un fișier pentru plan", properties: ["openFile"] });
    if (selected.canceled || !selected.filePaths[0]) return { canceled: true };
    const paths = await ensurePlans();
    const original = path.basename(selected.filePaths[0]);
    const safe = original.replace(/[^a-zA-Z0-9._-]/g, "_");
    const stored = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;
    const target = path.join(paths.attachments, stored);
    await fs.copyFile(selected.filePaths[0], target);
    return { canceled: false, name: original, src: pathToFileURL(target).href };
}

async function importRecipeImage() {
    const selected = await dialog.showOpenDialog(win, {
        title: "Alege imaginea rețetei",
        properties: ["openFile"],
        filters: [{ name: "Imagini", extensions: ["jpg", "jpeg", "png", "webp", "gif"] }],
    });
    if (selected.canceled || !selected.filePaths[0]) return { canceled: true };
    const paths = recipePaths();
    await fs.mkdir(paths.images, { recursive: true });
    const original = path.basename(selected.filePaths[0]);
    const safe = original.replace(/[^a-zA-Z0-9._-]/g, "_");
    const target = path.join(paths.images, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`);
    await fs.copyFile(selected.filePaths[0], target);
    return { canceled: false, name: original, src: pathToFileURL(target).href };
}

async function maybeShowAnniversaryNotification() {
    if (!app.isPackaged || !Notification.isSupported()) return;
    const now = new Date();
    const wedding = new Date("2026-08-24T11:20:00+03:00");
    if (now.getMonth() !== wedding.getMonth() || now.getDate() !== wedding.getDate() || now.getHours() < wedding.getHours()) return;
    const stamp = now.toISOString().slice(0, 10);
    const marker = path.join(app.getPath("userData"), "anniversary-notification.json");
    try {
        const last = JSON.parse(await fs.readFile(marker, "utf8"));
        if (last.stamp === stamp) return;
    } catch { /* First notification of this anniversary day. */ }
    new Notification({ title: "Busuioc App", body: "Astăzi este aniversarea voastră. Felicitări, Adriana și Stefan!", icon: path.join(__dirname, "site", "images", "logo.png") }).show();
    await fs.writeFile(marker, JSON.stringify({ stamp }), "utf8");
}

const crcTable = Array.from({ length: 256 }, (_, index) => {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0);
    return value >>> 0;
});

function crc32(buffer) {
    let value = 0xffffffff;
    for (const byte of buffer) value = (value >>> 8) ^ crcTable[(value ^ byte) & 0xff];
    return (value ^ 0xffffffff) >>> 0;
}

function makeZip(entries) {
    let offset = 0;
    const locals = [], central = [];
    for (const entry of entries) {
        const name = Buffer.from(entry.name.replaceAll("\\", "/"));
        const data = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data);
        const crc = crc32(data);
        const local = Buffer.alloc(30 + name.length);
        local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0, 6); local.writeUInt16LE(0, 8);
        local.writeUInt32LE(crc, 14); local.writeUInt32LE(data.length, 18); local.writeUInt32LE(data.length, 22); local.writeUInt16LE(name.length, 26); local.writeUInt16LE(0, 28); name.copy(local, 30);
        locals.push(local, data);
        const header = Buffer.alloc(46 + name.length);
        header.writeUInt32LE(0x02014b50, 0); header.writeUInt16LE(20, 4); header.writeUInt16LE(20, 6); header.writeUInt16LE(0, 8); header.writeUInt16LE(0, 10);
        header.writeUInt32LE(crc, 16); header.writeUInt32LE(data.length, 20); header.writeUInt32LE(data.length, 24); header.writeUInt16LE(name.length, 28); header.writeUInt16LE(0, 30); header.writeUInt16LE(0, 32); header.writeUInt32LE(0, 38); header.writeUInt32LE(offset, 42); name.copy(header, 46);
        central.push(header); offset += local.length + data.length;
    }
    const directory = Buffer.concat(central);
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10); end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
    return Buffer.concat([...locals, directory, end]);
}

function readZip(buffer) {
    const endOffset = buffer.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
    if (endOffset < 0) throw new Error("Fișierul nu este un backup ZIP valid.");
    const count = buffer.readUInt16LE(endOffset + 10), directoryOffset = buffer.readUInt32LE(endOffset + 16);
    const entries = new Map(); let cursor = directoryOffset;
    for (let index = 0; index < count; index += 1) {
        if (buffer.readUInt32LE(cursor) !== 0x02014b50) throw new Error("Arhivă invalidă.");
        const method = buffer.readUInt16LE(cursor + 10), size = buffer.readUInt32LE(cursor + 24), nameSize = buffer.readUInt16LE(cursor + 28), extraSize = buffer.readUInt16LE(cursor + 30), commentSize = buffer.readUInt16LE(cursor + 32), localOffset = buffer.readUInt32LE(cursor + 42);
        if (method !== 0) throw new Error("Backupul folosește o compresie neacceptată.");
        const name = buffer.subarray(cursor + 46, cursor + 46 + nameSize).toString();
        if (name.includes("..") || name.startsWith("/")) throw new Error("Backup invalid.");
        const localNameSize = buffer.readUInt16LE(localOffset + 26), localExtraSize = buffer.readUInt16LE(localOffset + 28), dataStart = localOffset + 30 + localNameSize + localExtraSize;
        entries.set(name, buffer.subarray(dataStart, dataStart + size));
        cursor += 46 + nameSize + extraSize + commentSize;
    }
    return entries;
}

async function libraryFiles(paths) {
    const walk = async (folder, prefix = "") => {
        const results = [];
        for (const item of await fs.readdir(folder, { withFileTypes: true })) {
            const relative = path.posix.join(prefix, item.name);
            if (item.isDirectory()) results.push(...await walk(path.join(folder, item.name), relative));
            else results.push({ name: `extra-images/${relative}`, data: await fs.readFile(path.join(folder, item.name)) });
        }
        return results;
    };
    return walk(paths.root);
}

async function ensureLibrary() {
    const paths = libraryPaths();
    await fs.mkdir(paths.media, { recursive: true });
    try { await fs.access(paths.metadata); } catch { await fs.writeFile(paths.metadata, "[]", "utf8"); }
    return paths;
}

async function readLibrary() {
    const paths = await ensureLibrary();
    const items = JSON.parse(await fs.readFile(paths.metadata, "utf8"));
    return items.map((item) => ({ ...item, src: pathToFileURL(path.join(paths.media, item.fileName)).href }));
}

app.whenReady().then(async () => {
    ensureStartMenuShortcut();
    void maybeShowAnniversaryNotification();
    setInterval(() => void maybeShowAnniversaryNotification(), 60_000);
    ipcMain.handle("media-library:list", readLibrary);
    ipcMain.handle("media-library:get-gallery-state", async () => {
        const paths = await ensureLibrary();
        try { return JSON.parse(await fs.readFile(paths.galleryState, "utf8")); } catch { return { order: [] }; }
    });
    ipcMain.handle("media-library:save-gallery-state", async (_event, state) => {
        const paths = await ensureLibrary();
        await fs.writeFile(paths.galleryState, JSON.stringify({ order: state.order || [] }, null, 2), "utf8");
        return true;
    });
    ipcMain.handle("media-library:import", async (_event, payload) => {
        const paths = await ensureLibrary();
        const safeName = String(payload.name || "media").replace(/[^a-zA-Z0-9._-]/g, "_");
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
        await fs.writeFile(path.join(paths.media, fileName), Buffer.from(payload.bytes));
        const items = JSON.parse(await fs.readFile(paths.metadata, "utf8"));
        const item = { ...payload.metadata, fileName, id: `extra_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, isCustom: true };
        delete item.bytes;
        items.unshift(item);
        await fs.writeFile(paths.metadata, JSON.stringify(items, null, 2), "utf8");
        return { ...item, src: pathToFileURL(path.join(paths.media, fileName)).href };
    });
    ipcMain.handle("media-library:remove", async (_event, id) => {
        const paths = await ensureLibrary();
        const items = JSON.parse(await fs.readFile(paths.metadata, "utf8"));
        const found = items.find((item) => item.id === id);
        const remaining = items.filter((item) => item.id !== id);
        if (found) await fs.rm(path.join(paths.media, found.fileName), { force: true });
        await fs.writeFile(paths.metadata, JSON.stringify(remaining, null, 2), "utf8");
        return true;
    });
    ipcMain.handle("backup:create", async (_event, preferences) => {
        const paths = await ensureLibrary();
        const target = await dialog.showSaveDialog(win, {
            title: "Salvează backupul",
            defaultPath: `Busuioc-backup-${new Date().toISOString().slice(0, 10)}.zip`,
            filters: [{ name: "Backup Busuioc (ZIP)", extensions: ["zip"] }],
        });
        if (target.canceled || !target.filePath) return { canceled: true };
        const entries = [{ name: "backup.json", data: JSON.stringify({ format: "busuioc-backup", version: 1, preferences, createdAt: new Date().toISOString() }, null, 2) }, ...await libraryFiles(paths)];
        await fs.writeFile(target.filePath, makeZip(entries));
        return { canceled: false, path: target.filePath };
    });
    ipcMain.handle("backup:choose", async () => {
        const selected = await dialog.showOpenDialog(win, { title: "Alege un backup", properties: ["openFile"], filters: [{ name: "Backup ZIP", extensions: ["zip", "busuiocfile"] }] });
        if (selected.canceled || !selected.filePaths[0]) return { canceled: true };
        const entries = readZip(await fs.readFile(selected.filePaths[0]));
        const metadata = entries.get("backup.json");
        if (!metadata) throw new Error("Acesta nu este un backup Busuioc valid.");
        const backup = JSON.parse(metadata.toString("utf8"));
        if (backup.format !== "busuioc-backup") throw new Error("Acesta nu este un backup Busuioc valid.");
        return { canceled: false, path: selected.filePaths[0], createdAt: backup.createdAt, mediaCount: [...entries.keys()].filter((name) => name.startsWith("extra-images/media/")).length };
    });
    ipcMain.handle("backup:restore", async (_event, { filePath, mode }) => {
        const entries = readZip(await fs.readFile(filePath));
        const backup = JSON.parse(entries.get("backup.json").toString("utf8"));
        const paths = await ensureLibrary();
        if (mode === "overwrite") await fs.rm(paths.root, { recursive: true, force: true });
        await ensureLibrary();
        const current = JSON.parse(await fs.readFile(paths.metadata, "utf8"));
        const incoming = JSON.parse((entries.get("extra-images/media.json") || Buffer.from("[]")).toString("utf8"));
        for (const [name, data] of entries) {
            if (!name.startsWith("extra-images/media/")) continue;
            const target = path.join(paths.media, path.basename(name));
            try { await fs.access(target); } catch { await fs.writeFile(target, data); }
        }
        const merged = mode === "overwrite" ? incoming : [...current, ...incoming.filter((item) => !current.some((old) => old.id === item.id || old.fileName === item.fileName))];
        await fs.writeFile(paths.metadata, JSON.stringify(merged, null, 2), "utf8");
        const incomingState = JSON.parse((entries.get("extra-images/gallery-state.json") || Buffer.from('{"order":[]}')).toString("utf8"));
        const existingState = JSON.parse((await fs.readFile(paths.galleryState, "utf8").catch(() => Buffer.from('{"order":[]}'))).toString("utf8"));
        const order = mode === "overwrite" ? incomingState.order || [] : [...new Set([...(existingState.order || []), ...(incomingState.order || [])])];
        await fs.writeFile(paths.galleryState, JSON.stringify({ order }, null, 2), "utf8");
        return { preferences: backup.preferences || {} };
    });
    ipcMain.handle("library:reset-all", async () => {
        const paths = libraryPaths();
        await fs.rm(paths.root, { recursive: true, force: true });
        await ensureLibrary();
        setTimeout(() => app.quit(), 250);
        return true;
    });
    ipcMain.handle("plans:list", readPlans);
    ipcMain.handle("plans:save", async (_event, plans) => savePlans(plans));
    ipcMain.handle("plans:import-attachment", importPlanAttachment);
    ipcMain.handle("recipes:import-image", importRecipeImage);
    ipcMain.handle("music:choose", async () => {
        const selected = await dialog.showOpenDialog(win, {
            title: "Alege muzica",
            properties: ["openFile"],
            filters: [{ name: "Fișiere audio", extensions: ["mp3", "wav", "ogg"] }],
        });
        if (selected.canceled || !selected.filePaths[0]) return { canceled: true };
        return { canceled: false, ...musicFileDetails(selected.filePaths[0]) };
    });
    ipcMain.handle("music:get-startup-file", () => {
        if (!pendingMusicPath) return null;
        const file = musicFileDetails(pendingMusicPath);
        pendingMusicPath = null;
        return file;
    });
    ipcMain.handle("notifications:show", (_event, payload = {}) => {
        if (Notification.isSupported()) new Notification({ title: String(payload.title || "Busuioc App"), body: String(payload.body || "Notificare de test"), icon: path.join(__dirname, "site", "images", "logo.png") }).show();
        return true;
    });
    ipcMain.handle("updater:download", async () => {
        await autoUpdater.downloadUpdate();
        return true;
    });
    ipcMain.handle("cache:get-size", async () => win?.webContents.session.getCacheSize() || 0);
    ipcMain.handle("cache:clear", async () => {
        const session = win?.webContents.session;
        if (!session) return 0;
        const size = await session.getCacheSize();
        await session.clearCache();
        return size;
    });
    createWindow();
    initUpdater();
});

function createWindow() {
    Menu.setApplicationMenu(null);

    win = new BrowserWindow({
        width: 1300,
        height: 850,
        minWidth: 1300,
        minHeight: 850,
        title: "Busuioc App",

        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js")
        }
    });

    win.webContents.on("did-navigate", (_event, url) => setWindowForPage(url));
    if (pendingMusicPath) openMusicFile(pendingMusicPath);
    else win.loadFile("site/index.html");

    globalShortcut.register("F11", () => {
        win.setFullScreen(!win.isFullScreen());
    });
}

app.on("will-quit", () => {
    globalShortcut.unregisterAll();
});
