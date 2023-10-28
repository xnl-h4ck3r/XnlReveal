chrome.runtime.onInstalled.addListener(() => {
  // Set defaults on installation
  chrome.storage.sync.set({ canaryToken: "xnlreveal" });
  chrome.storage.sync.set({ checkDelay: "2" });
});
