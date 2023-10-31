## Changelog

- v0.4

  - New
    - Some web pages don't seem to fire the `windows.onload` event so the alert functionality doesn't work. To solve this, code has been added to check if `document.readyState === "complete"` already and run `runAfterPageLoad` in that case. If it isn't already complete, also add an event listener for `DOMContentLoaded` and run `runAfterPageLoad` for that too.
  - A web page may perform other actions on `window.load` firing. If there is existing code, it will run that first before `runAfterPageLoad` to not interfere with the page processing.

- v0.3

  - New
    - Add functionality for adding the extension to the Chrome context menu.
    - Add options to the context menu for existing `Show hidden elements` and `Enable disabled elements` options, but also add a new option of `Get Wayback endpoints`. If clicked, a new tab will be opened that displays all endpoints for the current domain.

- v0.2

  - New

    - Added the **Write Wayback endpoints to console** setting in the popup. If checked, the Wayback archive endpoints will be written to the browser console for each location+path visited. Once visited, the archive API will not be called again unless the **Clear Saved URLs/Params** is clicked.
    - Added the checkbox **Only write JS Wayback endpoints** to the extension options. If this is checked then only javascript file endpoints retrieved from the Wayback archive will be written to the console, otherwise ALL endpoints will be written.

  - Changed

    - Changed the **Clear Saved URLs/Params** to also clear the record of wayback archive endpoints visited.
    - Corrected `showHiddenElements` to ensure all `elementType` and `elementName` values were passed to the `htmlEntities` function (some were missed).
    - Remove `runAfterPageLoadOLD` function that was no longer used.

- v0.1
  - Initial release
