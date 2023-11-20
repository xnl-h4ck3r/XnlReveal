## Changelog

- v3.1 

  - New

    - Change the Tooltip of the extension to say `Xnl Reveal (Wayback down!)` if the Wayback CDX Server API is down, otherwise it will stay as `Xnl Reveal`
    
- v3.0

  - New

    - If the Wayback CDX Server API is not available, then the extension icon will appear with a red background instead of black to indicate it is down. It will be checked every 10 minutes and the icon updated as necessary (the extension does not need to be enabled for this functionality) and will also be checked automatically when Wayback URLs are retrieved if option **Write wayback endpoints to console** is active.
    - Add new context menu item "Show FOFA domain search". If selected, a new tab will be opened for https://en.fofa.info/ and the search `domain="{TARGET}"`, where `{TARGET}` is the domain of the active tab.

  - Changed

    - Small improvement to UI.

- v2.7

  - Changed

    - Small improvements to the UI

- v2.6

  - New

    - Add `Copy reflection text to clipboard` to the **Options** page. If it is selected, and the option to show alerts is selected, then the text written to the console when parameter reflections are found is also copied to the users clipboard.
    - Add `clipboardWrite` to the extensions permissions in the manifest file.

  - Changed

    - Fix an error in the Firefox version that caused the reflection alerts to fail with the error `TypeError: params.keys() is not iterable`.
    - Small UI improvements.

- v2.5

  - New

    - Include a new context menu item of "Show Google cache version". If selected, a new tab will be opened with the Google Cache version of the page.

- v2.4

  - Changed

    - Small UI improvement

- v2.3

  - Changed

    - When the URL and parameters are stored to ensure the user doesn't get an alert for the same reflected parameter, it would still alert of the parameter value was different. The URL now has all parameter values set to the canary token in local storage so that even if the value is different, it won't fire an alert again or write the same message to the console.
    - Don't write a blank line to the console if there were no results returned from Wayback archive.

- v2.2

  - Changed

    - Improvements to the UI

- v2.1

  - New

    - Include a context menu item to add/remove the current tabs host to the whitelist/blacklist. If the options have whitelist selected, it will say `Add example.com to whitelist` if the word `example.com` does not exist in the scope list already, otherwise it will say `Remove example.com from whitelist`. If the option of blacklist is selected in options, then it will say `blacklist` instead.

- v2.0

  - New

    - Add the ability to specify what scope **Xnl Reveal** will run for, if enabled. This adds the ability to either whitelist or blacklist certain words in the host of the current tab to determine whether to process the page or not.

- v1.2

  - New

    - Add Buy me a Coffee link to the options page.

  - Changed

    - Change the example RegEx for JS files to be followed by a `.` to maybe get `.js.map` files.

- v1.1

  - New

    - Include an external CSS file, one for Chrome and one for Firefox.

  - Changed

    - Replace the `Only write JS Wayback endpoints` option with `Wayback RegEx` and a text box to enter a regular expression. If left blank, then wayback endpoints will not be limited. If anything is entered, it will be used to limit what is returned for each page, e.g. to only return javascript files, a user could enter `\.js($|#|\?)`
    - Improve the UI of `popup.html` and `options.html`.
    - Remove the **Run Now** buttons from the popup page because these can be executed from the context menu instead.

- v1.0

  - New

    - Provide a Firefox version of the extension. A user will just be able to choose between the `chrome` folder and `firefox` folder.
    - Add instructions to the README to include installing the extension in Firefox

- v0.4

  - New

    - Some web pages don't seem to fire the `windows.onload` event so the alert functionality doesn't work. To solve this, code has been added to check if `document.readyState === "complete"` already and run `runAfterPageLoad` in that case. If it isn't already complete, also add an event listener for `DOMContentLoaded` and run `runAfterPageLoad` for that too.
    - A web page may perform other actions on `window.load` firing. If there is existing code, it will run that first before `runAfterPageLoad` to not interfere with the page processing.

  - Changed

    - Change the processing for showing reflected query parameters to ensure that timeout errors aren't raised if the fetch was successful.

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
