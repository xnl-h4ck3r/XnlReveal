const enableExtensionCheckbox = document.getElementById("enableExtension");
const enableAlertsCheckbox = document.getElementById("enableAlerts");
const enableWaybackCheckbox = document.getElementById("enableWayback");
const enableHiddenCheckbox = document.getElementById("enableHidden");
const enableHiddenButton = document.getElementById("enableHiddenButton");
const enableDisabledCheckbox = document.getElementById("enableDisabled");
const enableDisabledButton = document.getElementById("enableDisabledButton");

// Load the current enabled state from storage
chrome.storage.sync.get(["extensionEnabled"], (result) => {
  const extensionEnabled = result.extensionEnabled || false;
  enableExtensionCheckbox.checked = extensionEnabled;

  // Disable the options checkbox if extensionEnabled is false
  enableAlertsCheckbox.disabled = !extensionEnabled;
  enableWaybackCheckbox.disabled = !extensionEnabled;
  enableHiddenCheckbox.disabled = !extensionEnabled;
  enableDisabledCheckbox.disabled = !extensionEnabled;
  enableHiddenButton.disabled = !extensionEnabled;
  enableDisabledButton.disabled = !extensionEnabled;
});
chrome.storage.sync.get(["alertsEnabled"], (result) => {
  const alertsEnabled = result.alertsEnabled || false;
  enableAlertsCheckbox.checked = alertsEnabled;
});
chrome.storage.sync.get(["waybackEnabled"], (result) => {
  const waybackEnabled = result.waybackEnabled || false;
  enableWaybackCheckbox.checked = waybackEnabled;
});
chrome.storage.sync.get(["hiddenEnabled"], (result) => {
  const hiddenEnabled = result.hiddenEnabled || false;
  enableHiddenCheckbox.checked = hiddenEnabled;
});
chrome.storage.sync.get(["disabledEnabled"], (result) => {
  const disabledEnabled = result.disabledEnabled || false;
  enableDisabledCheckbox.checked = disabledEnabled;
});

// Toggle the extension's show alerts state when the checkbox is changed
enableAlertsCheckbox.addEventListener("change", () => {
  const alertsEnabled = enableAlertsCheckbox.checked;
  const setting = { ["alertsEnabled"]: alertsEnabled };
  chrome.storage.sync.set(setting);
});

// Toggle the extension's show wayback state when the checkbox is changed
enableWaybackCheckbox.addEventListener("change", () => {
  const waybackEnabled = enableWaybackCheckbox.checked;
  const setting = { ["waybackEnabled"]: waybackEnabled };
  chrome.storage.sync.set(setting);
});

// Toggle the extension's show hidden state when the checkbox is changed
enableHiddenCheckbox.addEventListener("change", () => {
  const hiddenEnabled = enableHiddenCheckbox.checked;
  const setting = { ["hiddenEnabled"]: hiddenEnabled };
  chrome.storage.sync.set(setting);

  // Reload the active tab to apply changes immediately
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.reload(tabs[0].id);
    }
  });
});

// Toggle the extension's show disabled state when the checkbox is changed
enableDisabledCheckbox.addEventListener("change", () => {
  const disabledEnabled = enableDisabledCheckbox.checked;
  const setting = { ["disabledEnabled"]: disabledEnabled };
  chrome.storage.sync.set(setting);

  // Reload the active tab to apply changes immediately
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.reload(tabs[0].id);
    }
  });
});

// Toggle the extension's enabled state when the checkbox is changed
enableExtensionCheckbox.addEventListener("change", () => {
  const extensionEnabled = enableExtensionCheckbox.checked;
  const setting = { ["extensionEnabled"]: extensionEnabled };
  chrome.storage.sync.set(setting);

  // Disable the other options if extensionEnabled is false
  enableAlertsCheckbox.disabled = !extensionEnabled;
  enableWaybackCheckbox.disabled = !extensionEnabled;
  enableHiddenCheckbox.disabled = !extensionEnabled;
  enableDisabledCheckbox.disabled = !extensionEnabled;
  enableHiddenButton.disabled = !extensionEnabled;
  enableDisabledButton.disabled = !extensionEnabled;

  // Reload the active tab to apply changes immediately if necessary
  if (
    enableAlertsCheckbox.checked ||
    enableHiddenCheckbox.checked ||
    enableDisabledCheckbox.checked
  ) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.reload(tabs[0].id);
      }
    });
  }
});

// Add a click event listener to run Enable Hidden now
enableHiddenButton.addEventListener("click", () => {
  // Inject a content script to the active tab when the button is clicked
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      // Execute the showHiddenElements function in the content script
      chrome.tabs.sendMessage(tabs[0].id, { action: "showHiddenElements" });
    }
  });
});

// Add a click event listener to run Enable Disabled now
enableDisabledButton.addEventListener("click", () => {
  // Inject a content script to the active tab when the button is clicked
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      // Execute the showHiddenElements function in the content script
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "enableDisabledElements",
      });
    }
  });
});
