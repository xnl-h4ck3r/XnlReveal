## Changelog

- v4.2

  - New

    - Add a footer to the popup page giving a link to my Github page, show the version number (and show if outdated and link to download page if it is), and a link to my my Ko-fi page.

- v4.1

  - New

    - Added search/filter functionality to the DevTools panel. A search input field now allows real-time filtering of messages, making it easy to find specific reflections or Wayback results among the stored messages.
    - Added automatic context menu refresh. The context menu now automatically updates when switching tabs or when URLs change, eliminating the need for manual page refreshes to see the correct host in the add/remove scope menu item.
    - Added reflection checking on URL changes for SPAs (Single Page Applications). When the URL changes without a full page reload (common in modern web apps), the extension now automatically checks for parameter reflections if the new URL contains query parameters. This now includes comprehensive detection via DOM mutations, popstate events, and History API interception (pushState/replaceState) to catch all types of client-side navigation.

  - Changed

    - Fixed duplicate icon definitions in manifest.json files. The redundant `iconnoway` icon definitions that were being overwritten have been removed.
    - Enforced consistent memory management limits. Both in-memory message storage and local storage now respect the 1000 message limit, preventing unlimited memory growth.
    - Extracted hardcoded timeout and interval values to configuration constants at the top of files (`MAX_STORED_MESSAGES`, `CHECK_INTERVAL_MINUTES`, `WAYBACK_TIMEOUT_MS`, `STORAGE_POLL_INTERVAL_MS`) for easier maintenance. Reduced Wayback timeout from 60 to 30 seconds to improve performance and reduce memory usage when multiple requests are in flight.
    - Reduced Wayback endpoint display limit from 5000 to 10 lines to improve DevTools readability. A truncation message shows the total number of endpoints found.
    - Fixed whitelist/blacklist behavior when scope list is empty. An empty whitelist now correctly processes nothing (previously processed everything), while an empty blacklist processes everything. This makes the behavior more intuitive and secure by default. Added a console message to inform users when the whitelist is empty.
    - Fixed message channel error that prevented some parameter searches and Wayback messages from being written. The `logToDevtools` handler was incorrectly returning `true` for an async response without actually sending one, causing "message channel closed" errors. The response callback has been removed since it's not needed.
    - Fixed "Extension context invalidated" errors in DevTools panel. Added proper error handling for when the extension is reloaded while the DevTools panel is open, preventing uncaught errors from the polling interval.
    - Fixed issue where rapid navigation would cause Wayback requests to be silently dropped. The root cause was that content scripts are reloaded on navigation, losing any pending callbacks. Moved the Wayback request queue to the background script where it persists across page navigations, ensuring all requests are processed sequentially. When navigation aborts a pending request, the error is logged directly to DevTools storage so users can see what happened.
    - Improved console message formatting.

- v4.0

  - New

    - Add an XnlReveal tab in dev tools. This will show messages (most recent at the top) instead of writing them to the browser console. Up to 1000 messages will be persisted in local storage so will be available across browser sessions.
    - The parameter reflection details and wayback endpoints will be written to the Dev Tools tab instead of the console.
    - There will be a 60 second timeout for getting endpoints from wayback machine. If the timeout is reached, a suitable message will be written to the DevTools tab.
    - When getting wayback endpoints, it only get up to 1000 endpoints from for the endpoint. This is to prevent causing the browser to slow down and use too much memory and storage.
    - Show a suitable message in Dev Tools tab if the Wayback call does not return a 200 response.

  - Changed

    - Modified the Sus Params data to include additional data gathered from Akamai WAF threat research team intel - thanks to @ryancbarnett
    - Fix glitch on Options popup page when items were added or removed from the white/black list.

- v3.10

  - Changed

    - BUG FIX: Once a URL is tested, it shouldn't be tested again if everything is the same apart from parameter values. This wasn't always working, so is now fixed.

- v3.9

  - New

    - For both Chrome and Firefox, add a new Option `Check for reflection of ' " <`. If this is set to `Off` then each parameter is just tested with the canary token as before. However, if set to `On` then the string `'"<xnl` is added to the end of the canary token. A check is made whether any of the special characters `'`,`"` or `<` are reflected without being encoded, and are reported in the alert box and console. If the canary token is not reflected at all, then the special characters may have been blocked by a WAF or something, so a request is made with just the canary token if necessary.

- v3.8

- New

  - Explain in Firefox setup why it can't be added to the Firefox Add-on store, and therefore has to be reloaded every time.

- Changed

  - Correct XNL Reveal version in manifest files.

- v3.7

  - New

    - The string `CHARSET IS NOT SPECIFIED IN RESPONSE!` will be displayed in the browser message box, and in the console, if the content type of the page is `text/html` but the charset is not set on the content type, or in the body via a meta tag. This is to highlight endpoints where XSS could be easier, based on the research in the blog https://www.sonarsource.com/blog/encoding-differentials-why-charset-matters/?utm_medium=social&utm_source=twitter&utm_campaign=researc

- v3.6

  - New

    - Add a new option of `Create word list` (to Chrome version only at the moment). This will open a new tab that will display a word list generated from the tab the option was selected on.

- v3.5

  - New

    - Add a new option of `Param blacklist`. This will be a comma separated list of parameter names that you do not want to replace with the canary token to check if it reflects. This can be used when replacing certain parameters causes problems, e.g. logging you out.

- v3.4

  - New

    - When reflected parameters are checked, the badge on the icon will be red instead of green if any of the parameter names are in the categories based on ["sus" parameters research by @Jhaddix and @G0LDEN_infosec](https://github.com/g0ldencybersec/sus_params). Also, the list of parameters in the console, alert and sent to clipboard, will also include the categories in which the parameter was found, e.g `boringParameter, query [XSS], path [LFI/RFI | SSRF | XSS]`

  - Changed

    - Fixed a bug that was introduced in the last bug which was introduced in v3.1 that stopped Wayback endpoints being written to the console. Sorry!
    - Hosts `web.archive.org`, `webcache.googleusercontent.com` and `en.fofa.info` will be considered blacklisted so will not be affected by any of the selected actions themselves when launched from context menus.

- v3.3

  - New

    - Add a new option to the **Options** page for **Show alert box for reflections**. If the **Show query parameter reflections** action is checked, then this determines whether a browser alert box is shown for parameter reflections. If not,you can still have the reflections written to the console and copied to the clipboard (if required).

  - Changed

    - Fix an issue where the `Copy reflection to clipboard` field value wasn't saved correctly on the **Options** page.
    - Change the **Show query param reflections alerts** action on the **Popup** page to **Show query parameter reflections**.

- v3.2

  - New

    - Show a badge on the extension with the number of reflected parameters last found.

  - Changed

    - The check for whether the Wayback CDX Server API is up should was accidentally set to 1 minute for Firefox, but should have been 10 minutes.

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
