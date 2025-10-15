const messagesDiv = document.getElementById("messages");
const clearBtn = document.getElementById("clearBtn");
const copyAllBtn = document.getElementById("copyAllBtn");

console.log("Panel.js loaded");

const tabId = browser.devtools.inspectedWindow.tabId;
console.log("Panel tab ID:", tabId);

// Store all messages for copying
const allMessages = [];
const displayedMessages = new Set(); // Track displayed messages to prevent duplicates

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
  
  // Limit display to first 100 lines for performance
  const lines = text.split('\n');
  const MAX_LINES = 100;
  
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
  receivedViaPort = true; // Mark that we're receiving via port
  if (message.type && message.text) {
    addMessage(message.type, message.text, message.timestamp);
  }
});

// Also poll storage for messages (fallback)
let lastMessageId = 0;

// Load existing messages from storage on startup
browser.storage.local.get(['xnlreveal_all_messages']).then((result) => {
  const messages = result['xnlreveal_all_messages'] || [];
  console.log("Loading", messages.length, "messages from storage on startup");
  messages.forEach(msg => {
    addMessage(msg.type, msg.text, msg.timestamp);
  });
  lastMessageId = messages.length;
});

function checkForMessages() {
  // Only poll storage if we haven't received messages via port
  if (receivedViaPort) {
    console.log("Skipping storage poll - receiving via port connection");
    return;
  }
  
  browser.storage.local.get(['xnlreveal_all_messages']).then((result) => {
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
}

// Poll every 500ms for new messages
setInterval(checkForMessages, 500);

// Check immediately on load
checkForMessages();

// Clear messages button handler
clearBtn.addEventListener("click", function() {
  messagesDiv.innerHTML = "";
  allMessages.length = 0; // Clear the array
  displayedMessages.clear(); // Clear the set
  lastMessageId = 0;
  
  // Clear all stored messages and wayback cache
  browser.storage.local.get(null).then((items) => {
    const keysToRemove = ['xnlreveal_all_messages'];
    
    // Find all wayback:// keys
    for (const key in items) {
      if (key.startsWith('wayback://')) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all found keys
    browser.storage.local.remove(keysToRemove).then(() => {
      console.log("Cleared messages and wayback cache:", keysToRemove.length, "items");
    });
  });
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

// Send a message to the background script to indicate that the panel is ready
backgroundPageConnection.postMessage({ name: "panel-ready", tabId: tabId });
console.log("Sent panel-ready message for tab:", tabId);

// Don't add initialization message
// setTimeout(() => {
//   addMessage("info", "XnlReveal panel initialized and ready for messages");
// }, 100);
