const { tabs, contextMenus, storage, runtime } = browser;

let contextMenuWayback = {
  id: "showWaybackEndpoints",
  title: "Get Wayback endpoints",
  contexts: ["all"],
};

let contextMenuHidden = {
  id: "showHiddenElements",
  title: "Show hidden elements",
  contexts: ["all"],
};

let contextMenuDisabled = {
  id: "enableDisabledElements",
  title: "Enable disabled elements",
  contexts: ["all"],
};

// Check if the context menu items already exist
browser.contextMenus.removeAll(() => {
  // Create context menu items after removing any existing ones
  browser.contextMenus.create(contextMenuWayback);
  browser.contextMenus.create(contextMenuHidden);
  browser.contextMenus.create(contextMenuDisabled);
});

browser.contextMenus.onClicked.addListener(function (clickData) {
  // Find the active tab
  tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    if (tabs[0]) {
      // Execute the action for the context menu
      browser.tabs.sendMessage(tabs[0].id, { action: clickData.menuItemId });
    }
  });
});

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // Check if the background is ready before processing messages
  if (request.action === "fetchWaybackData") {
    const currentURL = request.location; // Get the current URL from the content script

    // Construct the URL for fetching Wayback Machine data
    const newURL = `https://web.archive.org/cdx/search/cdx?url=${currentURL}*&fl=original&collapse=urlkey&filter=!mimetype:warc/revisit|text/css|image/jpeg|image/jpg|image/png|image/svg.xml|image/gif|image/tiff|image/webp|image/bmp|image/vnd|image/x-icon|image/vnd.microsoft.icon|font/ttf|font/woff|font/woff2|font/x-woff2|font/x-woff|font/otf|audio/mpeg|audio/wav|audio/webm|audio/aac|audio/ogg|audio/wav|audio/webm|video/mp4|video/mpeg|video/webm|video/ogg|video/mp2t|video/webm|video/x-msvideo|video/x-flv|application/font-woff|application/font-woff2|application/x-font-woff|application/x-font-woff2|application/vnd.ms-fontobject|application/font-sfnt|application/vnd.android.package-archive|binary/octet-stream|application/octet-stream|application/pdf|application/x-font-ttf|application/x-font-otf|video/webm|video/3gpp|application/font-ttf|audio/mp3|audio/x-wav|image/pjpeg|audio/basic|application/font-otf&filter=!statuscode:404|301|302`;

    // Make the cross-origin request from the background script
    fetch(newURL)
      .then((response) => response.text())
      .then((data) => {
        // Process the Wayback data here
        sendResponse({ waybackData: data });
      })
      .catch((error) => {
        // Handle any errors
        sendResponse({ error: error.message });
      });

    // Return true to indicate that we will use sendResponse asynchronously
    return true;
  }
  return true;
});

browser.runtime.onInstalled.addListener(() => {
  // Set defaults on installation
  browser.storage.sync.set({ canaryToken: "xnlreveal" });
  browser.storage.sync.set({ checkDelay: "2" });
  browser.storage.sync.set({ waybackRegex: "" });
});
