const canaryTokenInput = document.getElementById("canaryTokenInput");
const copyToClipboardInput = document.getElementById("copyToClipboardInput");
const checkDelayInput = document.getElementById("checkDelayInput");
const waybackRegexInput = document.getElementById("waybackRegexInput");
const saveCanaryTokenButton = document.getElementById("saveButton");
const clearStorageButton = document.getElementById("clearStorageButton");
const clearStorageMessage = document.getElementById("clearStorageMessage");

const scopeTypeWhiteRadio = document.getElementById("scopeTypeWhite");
const scopeTypeBlackRadio = document.getElementById("scopeTypeBlack");
const newScopeInput = document.getElementById("newScope");
const addScopeButton = document.getElementById("addScopeButton");
const scopeListSelect = document.getElementById("scopeList");
const removeSelectedScopeButton = document.getElementById(
  "removeSelectedScope"
);
const clearAllScopeButton = document.getElementById("clearAllScope");

document.addEventListener("DOMContentLoaded", function () {
  const checkDelayInput = document.getElementById("checkDelayInput");

  checkDelayInput.addEventListener("input", function (e) {
    // Allow only numeric characters (0-9)
    this.value = this.value.replace(/[^0-9]/g, "");
  });
});

// Load the user's options
chrome.storage.sync.get(["canaryToken"], (result) => {
  canaryTokenInput.value = result.canaryToken || "xnlreveal";
});
chrome.storage.sync.get(["copyToClipboard"], (result) => {
  copyToClipboardInput.checked = result.copyToClipboard || false;
});
chrome.storage.sync.get(["checkDelay"], (result) => {
  checkDelayInput.value = result.checkDelay || "2";
});
chrome.storage.sync.get(["waybackRegex"], (result) => {
  waybackRegexInput.value = result.waybackRegex || "";
});
chrome.storage.sync.get(["scopeItems"], (result) => {
  const savedScope = result.scopeItems || [];
  savedScope.forEach((item) => {
    let newOption = new Option(item, item);
    scopeListSelect.add(newOption, undefined);
  });
});

// Function to retrieve the selected radio button value from Chrome storage
chrome.storage.sync.get(["scopeType"], (result) => {
  const selectedValue = result.scopeType || "whitelist";
  if (selectedValue === "whitelist") {
    scopeTypeWhiteRadio.checked = true;
    scopeTypeBlackRadio.checked = false;
  } else if (selectedValue === "blacklist") {
    scopeTypeBlackRadio.checked = true;
    scopeTypeWhiteRadio.checked = false;
  }
});

// Add event listeners to the radio buttons
scopeTypeWhiteRadio.addEventListener("change", function () {
  if (scopeTypeWhiteRadio.checked) {
    scopeTypeBlackRadio.checked = false; // Uncheck the other radio button
  }
});
scopeTypeBlackRadio.addEventListener("change", function () {
  if (scopeTypeBlackRadio.checked) {
    scopeTypeWhiteRadio.checked = false; // Uncheck the other radio button
  }
});

// Add a click event listener to add something to the scope
addScopeButton.addEventListener("click", (e) => {
  e.preventDefault(); // Prevent the default form submission behavior
  if (newScopeInput.value != "") {
    let newOption = new Option(newScopeInput.value, newScopeInput.value);
    scopeListSelect.add(newOption, undefined);
    // Set the size attribute to 6 to keep a fixed size
    scopeListSelect.size = 6;
  }
  newScopeInput.value = "";
});

// Add a click event listener to remove something from the scope
removeSelectedScopeButton.addEventListener("click", (e) => {
  e.preventDefault(); // Prevent the default form submission behavior
  const selectedOptions = Array.from(scopeListSelect.selectedOptions);
  selectedOptions.forEach((option) => {
    scopeListSelect.remove(option.index);
  });
  // Set the size attribute to 6 to keep a fixed size
  scopeListSelect.size = 6;
});

// Add a click event listener to clear all items from the scope
clearAllScopeButton.addEventListener("click", (e) => {
  e.preventDefault(); // Prevent the default form submission behavior
  while (scopeListSelect.options.length > 0) {
    scopeListSelect.remove(0); // Remove the first option until the list is empty
  }
  // Set the size attribute to 6 to keep a fixed size
  scopeListSelect.size = 6;
});

// Function to display a message
function showMessage(message) {
  clearStorageMessage.textContent = message;
  setTimeout(() => {
    clearStorageMessage.innerHTML = "&nbsp;";
  }, 2000); // Clear the message after 2 seconds
}

// Save the options when the "Save" button is clicked
saveButton.addEventListener("click", (e) => {
  e.preventDefault(); // Prevent the form from actually submitting

  let canaryToken = canaryTokenInput.value;
  const copyToClipboard = copyToClipboardInput.checked;
  const checkDelay = checkDelayInput.value;
  let waybackRegex = waybackRegexInput.value;

  // Check if canaryToken is blank and reset it to "xnlreveal"
  if (!canaryToken) {
    canaryToken = "xnlreveal";
    canaryTokenInput.value = canaryToken;
  }

  // Check if waybackregex is blank and reset it to ""
  if (!waybackRegex) {
    waybackRegex = "";
    waybackRegexInput.value = waybackRegex;
  }

  // Save all options
  chrome.storage.sync.set({ canaryToken });
  chrome.storage.sync.set({ copyToClipboard });
  chrome.storage.sync.set({ checkDelay });
  chrome.storage.sync.set({ waybackRegex });
  if (scopeTypeWhiteRadio.checked) {
    chrome.storage.sync.set({ scopeType: "whitelist" });
  } else {
    chrome.storage.sync.set({ scopeType: "blacklist" });
  }
  const scopeItems = Array.from(scopeListSelect.options).map(
    (option) => option.value
  );
  chrome.storage.sync.set({ scopeItems });

  showMessage("Options successfully saved!");
});

// Add a click event listener to clear the local storage
clearStorageButton.addEventListener("click", () => {
  // Clear the chrome.storage.local data
  chrome.storage.local.clear(() => {
    showMessage("Local storage successfully cleared!");
  });
});
