const enableExtensionButton = document.getElementById("enableExtension");
const optionsFieldSet = document.getElementById("optionsFieldSet");
const enableReflectionsButton = document.getElementById("enableReflections");
const enableWaybackButton = document.getElementById("enableWayback");
const enableHiddenButton = document.getElementById("enableHidden");
const enableDisabledButton = document.getElementById("enableDisabled");

// Load the current enabled state from storage
browser.storage.sync.get(["extensionDisabled"], (result) => {
  const extensionDisabled = result.extensionDisabled || "true";
  enableExtensionButton.setAttribute("aria-checked", extensionDisabled);

  // Disable the options if extensionDisabled is true
  optionsFieldSet.disabled = extensionDisabled === "true";
});

browser.storage.sync.get(["reflectionsDisabled"], (result) => {
  const reflectionsDisabled = result.reflectionsDisabled || "true";
  enableReflectionsButton.setAttribute("aria-checked", reflectionsDisabled);
});
browser.storage.sync.get(["waybackDisabled"], (result) => {
  const waybackDisabled = result.waybackDisabled || "true";
  enableWaybackButton.setAttribute("aria-checked", waybackDisabled);
});
browser.storage.sync.get(["hiddenDisabled"], (result) => {
  const hiddenDisabled = result.hiddenDisabled || "true";
  enableHiddenButton.setAttribute("aria-checked", hiddenDisabled);
});
browser.storage.sync.get(["disabledDisabled"], (result) => {
  const disabledDisabled = result.disabledDisabled || "true";
  enableDisabledButton.setAttribute("aria-checked", disabledDisabled);
});

// Toggle the extension's show reflections state when the checkbox is changed
enableReflectionsButton.addEventListener("click", () => {
  // Get the current value of the aria-checked attribute
  const reflectionsDisabled = enableReflectionsButton.getAttribute("aria-checked");

  // Toggle the value (if "true", change it to "false"; if "false", change it to "true")
  const newValue = reflectionsDisabled === "true" ? "false" : "true";

  // Update the aria-checked attribute with the new value
  enableReflectionsButton.setAttribute("aria-checked", newValue);

  const setting = { ["reflectionsDisabled"]: newValue };
  browser.storage.sync.set(setting);
});

// Toggle the extension's show wayback state when the checkbox is changed
enableWaybackButton.addEventListener("click", () => {
  // Get the current value of the aria-checked attribute
  const waybackDisabled = enableWaybackButton.getAttribute("aria-checked");

  // Toggle the value (if "true", change it to "false"; if "false", change it to "true")
  const newValue = waybackDisabled === "true" ? "false" : "true";

  // Update the aria-checked attribute with the new value
  enableWaybackButton.setAttribute("aria-checked", newValue);

  const setting = { ["waybackDisabled"]: newValue };
  browser.storage.sync.set(setting);
});

// Toggle the extension's show hidden state when the checkbox is changed
enableHiddenButton.addEventListener("click", () => {
  // Get the current value of the aria-checked attribute
  const hiddenDisabled = enableHiddenButton.getAttribute("aria-checked");

  // Toggle the value (if "true", change it to "false"; if "false", change it to "true")
  const newValue = hiddenDisabled === "true" ? "false" : "true";

  // Update the aria-checked attribute with the new value
  enableHiddenButton.setAttribute("aria-checked", newValue);

  const setting = { ["hiddenDisabled"]: newValue };
  browser.storage.sync.set(setting);

  // Reload the active tab to apply changes immediately
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      browser.tabs.reload(tabs[0].id);
    }
  });
});

// Toggle the extension's show disabled state when the checkbox is changed
enableDisabledButton.addEventListener("click", () => {
  // Get the current value of the aria-checked attribute
  const disabledEnabled = enableDisabledButton.getAttribute("aria-checked");

  // Toggle the value (if "true", change it to "false"; if "false", change it to "true")
  const newValue = disabledEnabled === "true" ? "false" : "true";

  // Update the aria-checked attribute with the new value
  enableDisabledButton.setAttribute("aria-checked", newValue);

  const setting = { ["disabledDisabled"]: newValue };
  browser.storage.sync.set(setting);

  // Reload the active tab to apply changes immediately
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      browser.tabs.reload(tabs[0].id);
    }
  });
});

// Toggle the extension's enabled state when the checkbox is changed
enableExtensionButton.addEventListener("click", () => {
  // Get the current value of the aria-checked attribute
  const extensionDisabled = enableExtensionButton.getAttribute("aria-checked");

  // Toggle the value (if "true", change it to "false"; if "false", change it to "true")
  const newValue = extensionDisabled === "true" ? "false" : "true";

  // Update the aria-checked attribute with the new value
  enableExtensionButton.setAttribute("aria-checked", newValue);

  const setting = { ["extensionDisabled"]: newValue };
  browser.storage.sync.set(setting);

  // Disable the options checkbox if extensionEnabled is true
  optionsFieldSet.disabled = newValue === "true";

  // Reload the active tab to apply changes immediately if necessary
  if (
    enableReflectionsButton.getAttribute("aria-checked") === "false" ||
    enableHiddenButton.getAttribute("aria-checked") === "false" ||
    enableDisabledButton.getAttribute("aria-checked") === "false"
  ) {
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        browser.tabs.reload(tabs[0].id);
      }
    });
  }
});
