const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("mediaLibrary", {
  list: () => ipcRenderer.invoke("media-library:list"),
  import: (payload) => ipcRenderer.invoke("media-library:import", payload),
  remove: (id) => ipcRenderer.invoke("media-library:remove", id),
  getGalleryState: () => ipcRenderer.invoke("media-library:get-gallery-state"),
  saveGalleryState: (state) => ipcRenderer.invoke("media-library:save-gallery-state", state),
  createBackup: (preferences) => ipcRenderer.invoke("backup:create", preferences),
  chooseBackup: () => ipcRenderer.invoke("backup:choose"),
  restoreBackup: (payload) => ipcRenderer.invoke("backup:restore", payload),
  resetEverything: () => ipcRenderer.invoke("library:reset-all"),
  downloadUpdate: () => ipcRenderer.invoke("updater:download"),
  listPlans: () => ipcRenderer.invoke("plans:list"),
  savePlans: (plans) => ipcRenderer.invoke("plans:save", plans),
  importPlanAttachment: () => ipcRenderer.invoke("plans:import-attachment"),
  onUpdateAvailable: (callback) => ipcRenderer.on("update:available", (_event, payload) => callback(payload)),
  onUpdateProgress: (callback) => ipcRenderer.on("update:progress", (_event, payload) => callback(payload)),
  onUpdateReady: (callback) => ipcRenderer.on("update:ready", () => callback()),
});
