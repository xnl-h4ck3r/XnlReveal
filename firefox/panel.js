// Configuration constants
const MAX_STORED_MESSAGES = 1000; // Maximum messages to keep in storage and memory
const STORAGE_POLL_INTERVAL_MS = 500; // How often to check storage for new messages

const messagesDiv = document.getElementById("messages");
const clearBtn = document.getElementById("clearBtn");
const copyAllBtn = document.getElementById("copyAllBtn");
const searchInput = document.getElementById("searchInput");

console.log("Panel.js loaded");

const tabId = browser.devtools.inspectedWindow.tabId;
console.log("Panel tab ID:", tabId);

// Store all messages for copying (limited to MAX_STORED_MESSAGES)
const allMessages = [];
const displayedMessages = new Set(); // Track displayed messages to prevent duplicates
let currentFilter = ""; // Track current search filter

// Function to format timestamp from milliseconds
function formatTimestamp(timestampMs) {
  const date = new Date(timestampMs);
  return date.toLocaleTimeString('en-US', { hour12: false });
}

// Function to format timestamp for current time
function getTimestamp() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour12: false });
}

// Function to add a message to the panel
function addMessage(type, text, timestampMs) {
  console.log("Adding message to panel:", type, text.substring(0, 100) + "...");
  
  // Use provided timestamp or current time
  const timestamp = timestampMs ? formatTimestamp(timestampMs) : getTimestamp();
  const actualTimestampMs = timestampMs || Date.now();
  
  // Create unique key to prevent duplicates
  const messageKey = `${actualTimestampMs}-${text}`;
  if (displayedMessages.has(messageKey)) {
    console.log("Duplicate message detected, skipping:", messageKey);
    return;
  }
  displayedMessages.add(messageKey);
  
  // Store message for copying at the beginning (newest first)
  allMessages.unshift({ timestamp, type, text });
  
  // Enforce memory limit - keep only MAX_STORED_MESSAGES
  if (allMessages.length > MAX_STORED_MESSAGES) {
    const removed = allMessages.splice(MAX_STORED_MESSAGES);
    console.log(`Trimmed ${removed.length} old messages from memory`);
  }
  
  const messageElement = document.createElement("div");
  messageElement.classList.add("message");

  if (type === "error") {
    messageElement.classList.add("error");
  } else if (type === "warn") {
    messageElement.classList.add("warn");
  } else if (type === "wayback") {
    messageElement.classList.add("wayback");
  } else {
    messageElement.classList.add("info");
  }

  const timestamp_span = document.createElement("span");
  timestamp_span.classList.add("timestamp");
  timestamp_span.textContent = `[${timestamp}]`;
  
  const text_span = document.createElement("span");
  
  // Limit display to first 10 lines initially, with expandable button
  const lines = text.split('\n');
  const MAX_LINES = 10;
  
  if (lines.length > MAX_LINES) {
    const truncatedText = lines.slice(0, MAX_LINES).join('\n');
    const remainingLines = lines.length - MAX_LINES;
    
    text_span.textContent = truncatedText + '\n';
    
    // Add "Show More" button
    const showMoreBtn = document.createElement("button");
    showMoreBtn.textContent = `▼ Show ${remainingLines} more lines`;
    showMoreBtn.style.cssText = "display: block; margin-top: 5px; padding: 3px 8px; background: #3e3e42; color: #4ec9b0; border: 1px solid #4ec9b0; cursor: pointer; font-size: 12px;";
    showMoreBtn.onclick = function() {
      if (text_span.textContent === truncatedText + '\n') {
        text_span.textContent = text;
        showMoreBtn.textContent = `▲ Show less`;
      } else {
        text_span.textContent = truncatedText + '\n';
        showMoreBtn.textContent = `▼ Show ${remainingLines} more lines`;
      }
    };
    
    messageElement.appendChild(timestamp_span);
    messageElement.appendChild(text_span);
    messageElement.appendChild(showMoreBtn);
  } else {
    text_span.textContent = text;
    messageElement.appendChild(timestamp_span);
    messageElement.appendChild(text_span);
  }
  
  // Prepend instead of append (newest first)
  messagesDiv.insertBefore(messageElement, messagesDiv.firstChild);
}

// Listen for messages from background script via long-lived connection
const backgroundPageConnection = browser.runtime.connect({
  name: "devtools-page",
});

let receivedViaPort = false;

backgroundPageConnection.onMessage.addListener(function (message) {
  console.log("Panel received message from background:", message);
  if (message.type && message.text) {
    receivedViaPort = true;
    addMessage(message.type, message.text, message.timestamp);
  }
});

// Also poll storage for messages (fallback if service worker is terminated)
let lastMessageId = 0;
let loadedFromStorage = false;

// Load existing messages from storage on startup
try {
  browser.storage.local.get(['xnlreveal_all_messages'], (result) => {
    if (browser.runtime.lastError) {
      console.log("Error loading initial messages:", browser.runtime.lastError.message);
      loadedFromStorage = true; // Mark as loaded to allow polling
      return;
    }
    const messages = result['xnlreveal_all_messages'] || [];
    console.log("Loading", messages.length, "messages from storage on startup");
    messages.forEach(msg => {
      addMessage(msg.type, msg.text, msg.timestamp);
    });
    lastMessageId = messages.length;
    loadedFromStorage = true;
  });
} catch (error) {
  console.log("Error loading initial messages:", error);
  loadedFromStorage = true; // Mark as loaded to allow polling
}

function checkForMessages() {
  // Check if extension context is still valid
  if (!browser.runtime?.id) {
    console.log("Extension context invalidated, stopping message checks");
    return;
  }
  
  // Only poll storage if we haven't received messages via port
  if (receivedViaPort) {
    console.log("Skipping storage poll - receiving via port connection");
    return;
  }
  
  // Don't poll storage if we haven't loaded initial messages yet
  if (!loadedFromStorage) {
    return;
  }
  
  try {
    browser.storage.local.get(['xnlreveal_all_messages'], (result) => {
      if (browser.runtime.lastError) {
        console.log("Storage access error (context may be invalidated):", browser.runtime.lastError.message);
        return;
      }
      
      const messages = result['xnlreveal_all_messages'] || [];
      console.log("Checking storage, found", messages.length, "messages, lastMessageId:", lastMessageId);
      if (messages.length > lastMessageId) {
        console.log("New messages found:", messages.length - lastMessageId);
        for (let i = lastMessageId; i < messages.length; i++) {
          const msg = messages[i];
          addMessage(msg.type, msg.text, msg.timestamp);
        }
        lastMessageId = messages.length;
      }
    });
  } catch (error) {
    console.log("Error checking messages (extension context may be invalidated):", error);
  }
}

// Poll every STORAGE_POLL_INTERVAL_MS for new messages
setInterval(checkForMessages, STORAGE_POLL_INTERVAL_MS);

// Check immediately on load
checkForMessages();

// Clear messages button handler
clearBtn.addEventListener("click", function() {
  // Clear all stored messages and wayback cache
  try {
    browser.storage.local.get(null, function(items) {
      if (browser.runtime.lastError) {
        console.log("Error getting storage items:", browser.runtime.lastError.message);
        return;
      }
      
      const keysToRemove = ['xnlreveal_all_messages'];
      
      // Find all wayback:// keys
      for (const key in items) {
        if (key.startsWith('wayback://')) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all found keys
      browser.storage.local.remove(keysToRemove, function() {
        if (browser.runtime.lastError) {
          console.log("Error removing storage items:", browser.runtime.lastError.message);
          return;
        }
        console.log("Cleared messages and wayback cache:", keysToRemove.length, "items");
        
        // Now clear the display AFTER storage is cleared
        messagesDiv.innerHTML = "";
        allMessages.length = 0; // Clear the array
        displayedMessages.clear(); // Clear the set
        lastMessageId = 0;
        
        // Add a confirmation message (use correct function signature)
        addMessage(
          "info",
          "Xnl Reveal: Messages and cache cleared. If new messages don't appear, close and reopen this DevTools panel.",
          Date.now()
        );
      });
    });
  } catch (error) {
    console.log("Error clearing storage:", error);
  }
});

// Copy all messages button handler
copyAllBtn.addEventListener("click", function() {
  if (allMessages.length === 0) {
    return;
  }
  
  // Format all messages as text with blank lines between them
  const textToCopy = allMessages.map(msg => {
    return `[${msg.timestamp}] ${msg.text}`;
  }).join('\n\n');  // Double newline for blank line between messages
  
  // Copy to clipboard using execCommand (works in devtools panels)
  const textarea = document.createElement('textarea');
  textarea.value = textToCopy;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      // Briefly change button text to show success
      const originalText = copyAllBtn.textContent;
      copyAllBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyAllBtn.textContent = originalText;
      }, 1000);
    } else {
      throw new Error('Copy command failed');
    }
  } catch (err) {
    console.error('Failed to copy:', err);
    copyAllBtn.textContent = 'Copy Failed';
    setTimeout(() => {
      copyAllBtn.textContent = 'Copy All Messages';
    }, 1000);
  } finally {
    document.body.removeChild(textarea);
  }
});

// Search/Filter functionality
searchInput.addEventListener("input", function() {
  currentFilter = this.value.toLowerCase().trim();
  filterMessages();
});

function filterMessages() {
  const messages = messagesDiv.querySelectorAll(".message");
  messages.forEach(message => {
    if (!currentFilter) {
      message.style.display = "";
    } else {
      const text = message.textContent.toLowerCase();
      message.style.display = text.includes(currentFilter) ? "" : "none";
    }
  });
}

// Send a message to the background script to indicate that the panel is ready
backgroundPageConnection.postMessage({ name: "panel-ready", tabId: tabId });
console.log("Sent panel-ready message for tab:", tabId);

// Don't add initialization message
// setTimeout(() => {
//   addMessage("info", "Xnl Reveal panel initialized and ready for messages");
// }, 100);