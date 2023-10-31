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
browser.storage.sync
  .get(["canaryToken", "checkDelay", "waybackJSOnly"])
  .then((result) => {
    canaryTokenInput.value = result.canaryToken || "xnlreveal";
    checkDelayInput.value = result.checkDelay || "2";
    waybackJSOnlyInput.checked = result.waybackJSOnly || false;
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

  browser.storage.sync
    .set({ canaryToken, checkDelay, waybackJSOnly })
    .then(() => {
      showMessage("Options successfully saved!");
    })
    .catch((error) => {
      console.error(error);
    });
});

// Add a click event listener to clear the local storage
clearStorageButton.addEventListener("click", () => {
  // Clear the browser.storage.local data
  browser.storage.local
    .clear()
    .then(() => {
      showMessage("Local storage successfully cleared!");
    })
    .catch((error) => {
      console.error(error);
    });
});
