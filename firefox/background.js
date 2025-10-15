const { tabs, contextMenus, storage, runtime } = browser;
const checkIntervalMinutes = 10;
const alarmName = "checkWaybackStatus";

// Store devtools panel connections by tab ID
const devtoolsPanels = {};

// Function to update the extension icon based on the response status
function updateIcon(responseStatus) {
  if (responseStatus === 200) {
    browser.browserAction.setIcon({
      path: {
        16: "images/icon16.png",
        48: "images/icon48.png",
        128: "images/icon128.png",
      },
    });
    browser.browserAction.setTitle({ title: "Xnl Reveal" });
  } else {
    browser.browserAction.setIcon({
      path: {
        16: "images/iconnoway16.png",
        48: "images/iconnoway48.png",
        128: "images/iconnoway128.png",
      },
    });
    browser.browserAction.setTitle({ title: "Xnl Reveal (Wayback down!)" });
  }
}

function checkWaybackStatus() {
  // Check if the Wayback CDX API is available
  fetch("https://web.archive.org/cdx/search/cdx?url=AVAILABLEORNOT")
    .then((response) => {
      updateIcon(response.status);
    })
    .catch((error) => {
      // Do nothing
    });
}

// Set up the initial alarm
browser.alarms.create(alarmName, { periodInMinutes: checkIntervalMinutes });

// Add an event listener for the alarm
browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === alarmName) {
    checkWaybackStatus();
  }
});

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

let contextMenuGoogle = {
  id: "showGoogleCache",
  title: "Show Google cache version",
  contexts: ["all"],
};

let contextMenuFofa = {
  id: "showFofaSearch",
  title: "Show FOFA domain search",
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
  browser.contextMenus.create(contextMenuGoogle);
  browser.contextMenus.create(contextMenuFofa);
  browser.contextMenus.create(contextMenuWordlist);
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
    browser.browserAction.setBadgeText({ text: "" }); // Reset the badge on the icon
    // Remove the existing scope context menu item
    removeContextMenu();
  }
  if (request.action === "logToDevtools") {
    // Forward the message to the devtools panel
    const tabId = sender.tab ? sender.tab.id : request.tabId;
    const timestamp = Date.now();
    console.log("Background received logToDevtools for tab:", tabId, "Message:", request.message);
    
    // Try to send to panel via port connection first
    const sentViaPort = sendToDevtools(tabId, request.logType || "info", request.message, timestamp);
    
    // Always write to storage for persistence across sessions
    return browser.storage.local.get(['xnlreveal_all_messages']).then((result) => {
      const messages = result['xnlreveal_all_messages'] || [];
      messages.push({ 
        type: request.logType || "info", 
        text: request.message, 
        timestamp: timestamp 
      });
      // Keep only last 1000 messages
      if (messages.length > 1000) {
        messages.shift();
      }
      return browser.storage.local.set({ 'xnlreveal_all_messages': messages });
    }).then(() => {
      return { success: true };
    }).catch((error) => {
      console.error("Error storing message:", error);
      return { success: false, error: error.message };
    });
  }
  if (request.action === "getTabInfo") {
    browser.browserAction.setBadgeText({ text: "" }); // Reset the badge on the icon

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

    // Construct the URL for fetching Wayback Machine data with limit of 5000 results
    const newURL = `https://web.archive.org/cdx/search/cdx?url=${currentURL}*&fl=original&collapse=urlkey&limit=1000&filter=!mimetype:warc/revisit|text/css|image/jpeg|image/jpg|image/png|image/svg.xml|image/gif|image/tiff|image/webp|image/bmp|image/vnd|image/x-icon|image/vnd.microsoft.icon|font/ttf|font/woff|font/woff2|font/x-woff2|font/x-woff|font/otf|audio/mpeg|audio/wav|audio/webm|audio/aac|audio/ogg|audio/wav|audio/webm|video/mp4|video/mpeg|video/webm|video/ogg|video/mp2t|video/webm|video/x-msvideo|video/x-flv|application/font-woff|application/font-woff2|application/x-font-woff|application/x-font-woff2|application/vnd.ms-fontobject|application/font-sfnt|application/vnd.android.package-archive|binary/octet-stream|application/octet-stream|application/pdf|application/x-font-ttf|application/x-font-otf|video/webm|video/3gpp|application/font-ttf|audio/mp3|audio/x-wav|image/pjpeg|audio/basic|application/font-otf&filter=!statuscode:404|301|302`;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    // Make the cross-origin request from the background script
    fetch(newURL, { signal: controller.signal })
      .then((response) => {
        clearTimeout(timeoutId);
        const statusCode = response.status; // Get the HTTP status code

        // Process the Wayback data here
        return response.text().then((data) => {
          updateIcon(statusCode); // Call updateIcon with the status code
          return { waybackData: data, statusCode: statusCode, url: currentURL };
        });
      })
      .then((result) => {
        // Continue with processing the response
        sendResponse(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        // Check if it was a timeout error
        if (error.name === 'AbortError') {
          sendResponse({ error: 'Request timeout after 60 seconds', timeout: true, url: currentURL });
        } else {
          sendResponse({ error: error.message, url: currentURL });
        }
      });

    // Return true to indicate that we will use sendResponse asynchronously
    return true;
  }
  // Set the badge on the extension icon to the number of reflected parameters found
  if (request.action === "updateBadge") {
    const num = request.number; // Get the number of reflected parameters
    const sus = request.sus; // Get whether there were "sus" parameters
    browser.browserAction.setBadgeText({ text: String(num) });
    if (sus) {
      browser.browserAction.setBadgeBackgroundColor({ color: "red" });
    } else {
      browser.browserAction.setBadgeBackgroundColor({ color: "green" });
    }
  }
  return true;
});

// Handle devtools panel connections
browser.runtime.onConnect.addListener(function (port) {
  console.log("Port connected:", port.name);
  if (port.name === "devtools-page") {
    let tabId;

    // Listen for messages from the devtools panel
    port.onMessage.addListener(function (message) {
      console.log("Message from devtools:", message);
      if (message.name === "panel-ready") {
        tabId = message.tabId;
        devtoolsPanels[tabId] = port;
        console.log("Panel registered for tab:", tabId, "Total panels:", Object.keys(devtoolsPanels).length);
      }
    });

    // Clean up when the panel disconnects
    port.onDisconnect.addListener(function () {
      console.log("Panel disconnected for tab:", tabId);
      if (tabId) {
        delete devtoolsPanels[tabId];
      }
    });
  }
});

// Function to send message to devtools panel
function sendToDevtools(tabId, type, text, timestamp) {
  console.log("sendToDevtools called for tab:", tabId, "Panels:", Object.keys(devtoolsPanels));
  if (devtoolsPanels[tabId]) {
    console.log("Sending to panel:", type, text);
    devtoolsPanels[tabId].postMessage({ type: type, text: text, timestamp: timestamp });
    return true; // Successfully sent via port
  } else {
    console.log("No panel found for tab:", tabId);
    return false; // No port connection
  }
}

browser.runtime.onInstalled.addListener(() => {
  // Set defaults on installation
  browser.storage.sync.set({ canaryToken: "xnlreveal" });
  browser.storage.sync.set({ showAlerts: true });
  browser.storage.sync.set({ copyToClipboard: false });
  browser.storage.sync.set({ paramBlacklist: "" });
  browser.storage.sync.set({ checkDelay: "2" });
  browser.storage.sync.set({ waybackRegex: "" });

  // Schedule the alarm on installation
  browser.alarms.create(alarmName, { periodInMinutes: checkIntervalMinutes });
});
