const canaryTokenInput = document.getElementById("canaryTokenInput");
const checkDelayInput = document.getElementById("checkDelayInput");
const waybackJSOnlyInput = document.getElementById("waybackJSOnlyInput");
const saveCanaryTokenButton = document.getElementById("saveButton");
const clearStorageButton = document.getElementById("clearStorageButton");
const clearStorageMessage = document.getElementById("clearStorageMessage");

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
chrome.storage.sync.get(["checkDelay"], (result) => {
  checkDelayInput.value = result.checkDelay || "2";
});
chrome.storage.sync.get(["waybackJSOnly"], (result) => {
  waybackJSOnlyInput.checked =
    result.waybackJSOnly === undefined ? false : result.waybackJSOnly;
});

// Function to display a message
function showMessage(message) {
  clearStorageMessage.textContent = message;
  setTimeout(() => {
    clearStorageMessage.innerText = "";
  }, 2000); // Clear the message after 2 seconds
}

// Save the options when the "Save" button is clicked
saveButton.addEventListener("click", (e) => {
  e.preventDefault(); // Prevent the form from actually submitting

  let canaryToken = canaryTokenInput.value;
  const checkDelay = checkDelayInput.value;
  const waybackJSOnly = waybackJSOnlyInput.checked;

  // Check if canaryToken is blank and reset it to "xnlreveal"
  if (!canaryToken) {
    canaryToken = "xnlreveal";
    canaryTokenInput.value = canaryToken;
  }

  chrome.storage.sync.set({ canaryToken });
  chrome.storage.sync.set({ checkDelay });
  chrome.storage.sync.set({ waybackJSOnly });

  showMessage("Options successfully saved!");
});

// Add a click event listener to clear the local storage
clearStorageButton.addEventListener("click", () => {
  // Clear the chrome.storage.local data
  chrome.storage.local.clear(() => {
    showMessage("Local storage successfully cleared!");
  });
});
