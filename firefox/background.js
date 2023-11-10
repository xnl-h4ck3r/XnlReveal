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

let scopeContextMenuAction = "";
let scopeContextMenuHost = "";

// Remove the dynamic menu for adding/removing to scope
function removeContextMenu() {
  browser.contextMenus.remove("dynamicScopeMenuItem", () => {
    if (browser.runtime.lastError) {
      //Do nothing
    }
  });
}

// Function to create the dynamic context menu item
function createDynamicContextMenu(currentHost) {
  // Get the scopeType and scopeItems from storage
  browser.storage.sync.get(["scopeType", "scopeItems"], (result) => {
    const scopeType = result.scopeType || "whitelist";
    const scopeItems = result.scopeItems || [];

    // Check if the current host is in the scopeItems
    const scopeHost = scopeItems.includes(currentHost);

    // Define the context menu title based on scopeType and host inclusion
    const contextMenuTitle = scopeHost
      ? `Remove ${currentHost} from ${scopeType}`
      : `Add ${currentHost} to ${scopeType}`;

    // Define your dynamic context menu item here
    let dynamicContextMenuItem = {
      id: "dynamicScopeMenuItem",
      title: contextMenuTitle,
      contexts: ["all"],
    };

    // Assign the scope action and host to global variables
    scopeContextMenuAction = scopeHost ? "Remove" : "Add";
    scopeContextMenuHost = currentHost;

    // Remove the existing scope context menu item
    removeContextMenu();

    browser.contextMenus.create(dynamicContextMenuItem, () => {
      if (browser.runtime.lastError) {
        //Do nothing
      }
    });
  });
}

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
      browser.tabs.sendMessage(tabs[0].id, {
        action: clickData.menuItemId,
        scopeAction: scopeContextMenuAction,
        scopeHost: scopeContextMenuHost,
      });
    }
  });
});

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "removeScopeMenu") {
    // Remove the existing scope context menu item
    removeContextMenu();
  }
  if (request.action === "getTabInfo") {
    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (browser.runtime.lastError) {
        console.error(
          "Xnl Reveal: An error occurred while querying tabs:",
          browser.runtime.lastError
        );
        sendResponse({ error: browser.runtime.lastError });
        return;
      }

      if (tabs && tabs[0]) {
        const currentHost = new URL(tabs[0].url).host;

        // Handle the tab information and send it back to the content script
        sendResponse({ currentHost });

        // Create the dynamic menu to add/remove the host to the white/black list
        // Only create if the current scope has a dot in it (e.g. ignore things like chrome://extensions and about:addons)
        if (currentHost.includes(".")) {
          createDynamicContextMenu(currentHost.replace(/^www\./, ""));
        }
      } else {
        console.error("Xnl Reveal: No active tab found");
        sendResponse({ error: "Xnl Reveal: No active tab found" });
      }
    });

    // Indicate that you will respond asynchronously
    return true;
  }
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
