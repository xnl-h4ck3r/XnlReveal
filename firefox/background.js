// Configuration constants
const MAX_STORED_MESSAGES = 1000; // Maximum messages to keep in storage
const CHECK_INTERVAL_MINUTES = 10; // How often to check Wayback status
const WAYBACK_TIMEOUT_MS = 30000; // Wayback API timeout in milliseconds (30 seconds)
const ALARM_NAME = "checkWaybackStatus";

console.log("%c🤘Xnl Reveal%c Background script loaded", "color: #00ff00; font-weight: bold", "color: inherit");

const chromeTabs = browser.tabs;

// Store devtools panel connections by tab ID
const devtoolsPanels = {};

// Wayback request queue managed in background (persists across content script reloads)
let waybackQueue = [];
let isProcessingWayback = false;

// Helper to log messages to devtools from background script
function logToDevtoolsFromBackground(url, message, type = "info") {
  const timestamp = Date.now();
  const fullMessage = `Xnl Reveal: Wayback request for ${url} - ${message}`;
  
  // Store in local storage for devtools panel to pick up
  browser.storage.local.get(['xnlreveal_all_messages'], (result) => {
    const messages = result['xnlreveal_all_messages'] || [];
    messages.push({ 
      type: type, 
      text: fullMessage, 
      timestamp: timestamp 
    });
    if (messages.length > MAX_STORED_MESSAGES) {
      messages.shift();
    }
    browser.storage.local.set({ 'xnlreveal_all_messages': messages });
  });
}

function processWaybackQueue() {
  console.log("%c🤘Xnl Reveal%c Background: processWaybackQueue - isProcessing:", "color: #00ff00; font-weight: bold", "color: inherit", isProcessingWayback, "Queue length:", waybackQueue.length);
  
  if (isProcessingWayback || waybackQueue.length === 0) {
    return;
  }
  
  isProcessingWayback = true;
  const { location, sendResponse } = waybackQueue.shift();
  
  console.log("%c🤘Xnl Reveal%c Background: Processing Wayback request for:", "color: #00ff00; font-weight: bold", "color: inherit", location, "- Remaining:", waybackQueue.length);
  
  const currentURL = location;
  const newURL = `https://web.archive.org/cdx/search/cdx?url=${currentURL}*&fl=original&collapse=urlkey&limit=1000&filter=!mimetype:warc/revisit|text/css|image/jpeg|image/jpg|image/png|image/svg.xml|image/gif|image/tiff|image/webp|image/bmp|image/vnd|image/x-icon|image/vnd.microsoft.icon|font/ttf|font/woff|font/woff2|font/x-woff2|font/x-woff|font/otf|audio/mpeg|audio/wav|audio/webm|audio/aac|audio/ogg|audio/wav|audio/webm|video/mp4|video/mpeg|video/webm|video/ogg|video/mp2t|video/webm|video/x-msvideo|video/x-flv|application/font-woff|application/font-woff2|application/x-font-woff|application/x-font-woff2|application/vnd.ms-fontobject|application/font-sfnt|application/vnd.android.package-archive|binary/octet-stream|application/octet-stream|application/pdf|application/x-font-ttf|application/x-font-otf|video/webm|video/3gpp|application/font-ttf|audio/mp3|audio/x-wav|image/pjpeg|audio/basic|application/font-otf&filter=!statuscode:404|301|302`;

  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, WAYBACK_TIMEOUT_MS);

  fetch(newURL, { signal: controller.signal })
    .then((response) => {
      clearTimeout(timeoutId);
      const statusCode = response.status;
      return response.text().then((data) => {
        updateIcon(statusCode);
        return { waybackData: data, statusCode: statusCode, url: currentURL };
      });
    })
    .then((result) => {
      console.log("%c🤘Xnl Reveal%c Background: Wayback request completed for:", "color: #00ff00; font-weight: bold", "color: inherit", location);
      try {
        sendResponse(result);
      } catch (e) {
        console.log("%c🤘Xnl Reveal%c Background: Could not send response (content script terminated)", "color: #00ff00; font-weight: bold", "color: inherit");
      }
      isProcessingWayback = false;
      processWaybackQueue(); // Process next
    })
    .catch((error) => {
      clearTimeout(timeoutId);
      console.log("%c🤘Xnl Reveal%c Background: Wayback request failed for:", "color: #00ff00; font-weight: bold", "color: inherit", location, "-", error.message);
      console.log("%c🤘Xnl Reveal%c Background: Error name:", "color: #00ff00; font-weight: bold", "color: inherit", error.name, "- Timed out:", timedOut);
      
      let errorMessage;
      if (error.name === 'AbortError') {
        if (timedOut) {
          errorMessage = `Request timeout after ${WAYBACK_TIMEOUT_MS/1000} seconds (Wayback Machine took too long to respond)`;
        } else {
          errorMessage = 'Request aborted (likely due to navigation)';
        }
      } else {
        errorMessage = error.message;
      }
      
      // Log directly to DevTools storage since content script is likely gone
      console.log("%c🤘Xnl Reveal%c Background: Calling logToDevtoolsFromBackground with:", "color: #00ff00; font-weight: bold", "color: inherit", currentURL, errorMessage);
      try {
        logToDevtoolsFromBackground(currentURL, errorMessage, "warn");
        console.log("%c🤘Xnl Reveal%c Background: logToDevtoolsFromBackground completed", "color: #00ff00; font-weight: bold", "color: inherit");
      } catch(logErr) {
        console.error("%c🤘Xnl Reveal%c Background: logToDevtoolsFromBackground error:", "color: #00ff00; font-weight: bold", "color: inherit", logErr);
      }
      
      // Also try to send response in case content script is still alive
      const errorResponse = { error: errorMessage, timeout: false, url: currentURL };
      try {
        sendResponse(errorResponse);
        console.log("%c🤘Xnl Reveal%c Background: sendResponse succeeded", "color: #00ff00; font-weight: bold", "color: inherit");
      } catch (e) {
        console.log("%c🤘Xnl Reveal%c Background: sendResponse failed (expected if content script terminated):", "color: #00ff00; font-weight: bold", "color: inherit", e.message);
      }
      
      isProcessingWayback = false;
      processWaybackQueue(); // Process next
    });
}

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
browser.alarms.create(ALARM_NAME, { periodInMinutes: CHECK_INTERVAL_MINUTES });

// Add an event listener for the alarm
browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
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

let contextMenuWordlist = {
  id: "createWordList",
  title: "Create word list",
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
  chromeTabs.query({ active: true, currentWindow: true }, (tabs) => {
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
    console.log("%c🤘Xnl Reveal%c: Background received logToDevtools for tab:", "color: #00ff00; font-weight: bold", "color: inherit", tabId, "Message:", request.message);
    
    // Try to send to panel via port connection first
    const sentViaPort = sendToDevtools(tabId, request.logType || "info", request.message, timestamp);
    
    // Always write to storage for persistence across sessions
    browser.storage.local.get(['xnlreveal_all_messages'], (result) => {
      const messages = result['xnlreveal_all_messages'] || [];
      messages.push({ 
        type: request.logType || "info", 
        text: request.message, 
        timestamp: timestamp 
      });
      // Keep only last MAX_STORED_MESSAGES
      if (messages.length > MAX_STORED_MESSAGES) {
        messages.shift();
      }
      browser.storage.local.set({ 'xnlreveal_all_messages': messages });
    });
    
    // Don't return true - we're not sending an async response
    return false;
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
        // Only create if the current scope has a dot in it (e.g. ignore things like chome://extensions and about:addons)
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
    const location = request.location;
    console.log("%c🤘Xnl Reveal%c Background: Queueing Wayback request for:", "color: #00ff00; font-weight: bold", "color: inherit", location, "- Queue length:", waybackQueue.length);
    
    // Add to queue
    waybackQueue.push({ location, sendResponse });
    processWaybackQueue();
    
    // Return true to indicate async response
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
    return false; // Don't expect async response
  }
});

// Handle devtools panel connections
browser.runtime.onConnect.addListener(function (port) {
  console.log("%c🤘Xnl Reveal%c: Port connected:", "color: #00ff00; font-weight: bold", "color: inherit", port.name);
  if (port.name === "devtools-page") {
    let tabId;

    // Listen for messages from the devtools panel
    port.onMessage.addListener(function (message) {
      console.log("%c🤘Xnl Reveal%c: Message from devtools:", "color: #00ff00; font-weight: bold", "color: inherit", message);
      if (message.name === "panel-ready") {
        tabId = message.tabId;
        devtoolsPanels[tabId] = port;
        console.log("%c🤘Xnl Reveal%c: Panel registered for tab:", "color: #00ff00; font-weight: bold", "color: inherit", tabId, "Total panels:", Object.keys(devtoolsPanels).length);
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

// Auto-refresh context menu when tab is activated
browser.tabs.onActivated.addListener((activeInfo) => {
  browser.tabs.get(activeInfo.tabId, (tab) => {
    if (tab && tab.url) {
      try {
        const currentHost = new URL(tab.url).host;
        if (currentHost && currentHost.includes(".")) {
          createDynamicContextMenu(currentHost.replace(/^www\./, ""));
        }
      } catch (error) {
        // Invalid URL, ignore
      }
    }
  });
});

// Also refresh when URL changes in active tab
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && tab.active) {
    try {
      const currentHost = new URL(changeInfo.url).host;
      if (currentHost && currentHost.includes(".")) {
        createDynamicContextMenu(currentHost.replace(/^www\./, ""));
      }
    } catch (error) {
      // Invalid URL, ignore
    }
  }
});

// Function to send message to devtools panel
function sendToDevtools(tabId, type, text, timestamp) {
  console.log("%c🤘Xnl Reveal%c: sendToDevtools called for tab:", "color: #00ff00; font-weight: bold", "color: inherit", tabId, "Panels:", Object.keys(devtoolsPanels));
  if (devtoolsPanels[tabId]) {
    console.log("%c🤘Xnl Reveal%c: Sending to panel:", "color: #00ff00; font-weight: bold", "color: inherit", type, text);
    devtoolsPanels[tabId].postMessage({ type: type, text: text, timestamp: timestamp });
    return true; // Successfully sent via port
  } else {
    console.log("%c🤘Xnl Reveal%c: No panel found for tab:", "color: #00ff00; font-weight: bold", "color: inherit", tabId);
    return false; // No port connection
  }
}

browser.runtime.onInstalled.addListener(() => {
  // Set defaults on installation
  browser.storage.sync.set({ canaryToken: "xnlreveal" });
  browser.storage.sync.set({ checkSpecialChars: false });
  browser.storage.sync.set({ showAlerts: true });
  browser.storage.sync.set({ copyToClipboard: false });
  browser.storage.sync.set({ paramBlacklist: "" });
  browser.storage.sync.set({ checkDelay: "2" });
  browser.storage.sync.set({ waybackRegex: "" });
  browser.storage.sync.set({ scopeType: "" });

  // Schedule the alarm on installation
  browser.alarms.create(ALARM_NAME, { periodInMinutes: CHECK_INTERVAL_MINUTES });
  
  // Check Wayback status on install
  checkWaybackStatus();
});

// Check Wayback status on startup
checkWaybackStatus();
