<center><img src="https://github.com/xnl-h4ck3r/XnlReveal/blob/main/images/title.png"></center>

## About - v4.1

This is a **Chrome/Firefox Extension** that can do the following:

- For hosts that are in scope:
  - Show an alert for any query parameters that are reflected (and identify "sus" parameters).
  - Optionally check if the characters `'`,`"` and `<` are reflected without being encoded.
  - Write details of reflected parameters to the browser DevTools `Xnl Reveal` tab.
  - Copy details of reflected parameters to the users clipboard.
  - Show the Wayback Archive endpoints (up to 1000) for the path visited (in the browser DevTools `Xnl Reveal` tab).
  - Show any hidden elements on the page.
  - Enable any disabled elements on the page.
- Provide a context menu (regardless if extension is active or host is in scope) to:
  - Open a new tab to show Wayback endpoints for the current domain.
  - Show any hidden elements on the page (even if the extension isn't enabled to do automatically).
  - Enable any disabled element on the page (even if the extension isn't enabled to do automatically).
  - Open a new tab to show the Google Cache version of the current page.
  - Open a new tab to show the [FOFA](https://en.fofa.info/) search results for the current domain.
  - Create a word list from the contents of a page in a new tab (currently only Chrome version only)
  - Add/Remove the current domain to the whitelist/blacklist.
- Visually indicate if the **Wayback CDX Server API** is not available (regardless if extension is active).

The ability to show an alert for reflected parameters was inspired by a comment by [@renniepak](https://x.com/renniepak) on Episode 42 of the [Critical Thinking - Bug Bounty Podcast](https://www.criticalthinkingpodcast.io/episode-42-renniepak-interview-intigriti-lhe-recap/) where he mentioned he had his own browser extension that let him know about any reflections.

The number of reflected parameters found is shown by a green badge on the extension icon. However, if any of the reflected parameter names are in a categories described in the ["sus" parameters research by @Jhaddix and @G0LDEN_infosec](https://github.com/g0ldencybersec/sus_params) then the badge will be red. If there are any "sus" parameters, then the categories will also be shown in the output to the DevTools `Xnl Reveal` tab, alert box and clipboard, e.g. `boringParameter, query [XSS], path [LFI/RFI | SSRF | XSS]` (this is the same as the "sus" parameters identification in my [GAP Burp Extension](https://github.com/xnl-h4ck3r/GAP-Burp-Extension)).

The ability to show hidden elements, and enable disabled elements, was inspired by this [Tweet by Critical Thinking - Bug Bounty Podcast](https://x.com/ctbbpodcast/status/1717151268622233614?s=20) and I initially created as browser bookmarks.

The extension icon is normally shown with a black background <img src="chrome/images/icon16.png">, but if the icon appears with a red background <img src="chrome/images/iconnoway16.png">, then it indicates that the **Wayback CDX Server API** is probably unavailable. Even if the main features are disabled, the extension will check the status of the API every 10 minutes.<br>
**IMPORTANT: When using tools like `waymore`, `waybackurls` or `gau` to get URLs from the Wayback archive, it uses the CDX Server API. If the API is down, you will not be getting any data from the Wayback Machine, only other sources. Also, only `waymore` would let you know that there was a problem.**

## Installing

Clone this repo to your machine and then follow the instructions below, depending on whether you want install on a Chrome or Firefox browser:

### Chrome

1. Open the Extension Manager in Chrome by following:
   Kebab menu(three vertical dots) -> Extensions -> Manage Extensions

2. If the developer mode is not turned on, turn it on by clicking the toggle in the top right corner.

3. Now click on **Load unpacked** button on the top left

4. Go the directory where you have `Xnl Reveal` folder and select it.

5. The extension is now loaded. You can click on the extension icon in the toolbar, and then the pin icon to pin `Xnl Reveal` to your toolbar.

### Firefox

**IMPORTANT: With Firefox extensions, you will need to load it each time you open Firefox. Unfortunately I cannot add to the Firefox store to prevent this because it must be Manifest v3 to do that. Xnl Reveal has to use Manifest v2 (unless someone else can figure it out, because I couldn't) which has less security restrictions allowing it to work.**

1. Go to `about:debugging` in a new browser tab.

2. Click on the **This Firefox** heading on the left of the page.

3. Click the **Load Temporary Add-on...** button under the **Temporary Extensions** heading.

4. Navigate to the `Firefox` folder from the downloaded repo and select any file, and then click **Open**.

5. The extension is now loaded. You can click on the extension icon in the toolbar, then click the Settings cog icon, and select **Pin to Toolbar**.

## Settings

### Options Page

- **Chrome**: If you right click the `Xnl Reveal` logo in the toolbar and select **Options**, you will be taken to the Options page.
- **Firefox**: If you right click the `Xnl Reveal` logo in the toolbar and select **Manage Extension**, then click the **Options** tab to see the Options page.

<center><img src="https://github.com/xnl-h4ck3r/XnlReveal/blob/main/images/options.png"></center>

You have the following options:

- `Canary token` - When requests are made to test for reflection of query parameters, this is the value of the parameter that is used and checked for.
- `Check for reflection of ' " <` - When requests are made to test for reflection of query parameters, the string `'",xnl` is appended to the end of the `Canary token`. If any of these characters reflect without being encoded, then this will also be reported. If passing those characters cause the `Canary token` not to be reflected at all (maybe a WAF blocks the `<`), then another request will be made just with the `Canary token`.
- `Show alert box for reflections` - If this is selected, and `Show query parameter reflections` is selected on the Popup menu (see below) then a browser alert box will be displayed with details of any query parameters that reflect.
- `Copy reflection text to clipboard` - If this is selected, and `Show query parameter reflections` is selected on the Popup menu (see below), when parameter reflections are found, the details are put in the users clipboard as-well as written to the DevTools `Xnl Reveal` tab (and on an alert box if requested). This means that as soon as you see an alert box or details in the DevTools tab, you can go to your notes and paste the details straight away. **IMPORTANT: The browser may ask for the sites permission to interact with the clipboard. You need to accept this to use this functionality.**
- `Param blacklist` - This is a comma separated list of parameter names (e.g. `param1,param2`) that you do not want to replace with the canary token to check if it reflects. This can be used when testing certain parameters causes problems, e.g. logging you out.
- `Check delay` - When a page is loaded, depending on settings, the extension will try to show hidden elements and enable disabled elements. However, sometimes parts of the page are loaded dynamically and they aren't in the original response. THe extension will try to show and enable again after this delay (in seconds) after the page has initially loaded.
- `Wayback RegEx` - If the setting to write Wayback archive endpoints has been selected, then only wayback endpoints that match the entered RegEx will be displayed in the DevTools tab. If the field is left blank, then upto 1000 Wayback endpoints are returned. **IMPORTANT: Any RegEx entered will be treated as case insensitive**
- `Extension Scope` options:
  - `Whitelist` or `Blacklist` - This determines which sites will results in parameter reflection checks and/or wayback endpoint retrieval. Depending on which option is chosen, a host either must contain or not contain the entered word to be processed.
  - `Host match word to add` - Enter a word that exists in the host name (or a full hostname) that you want to either whitelist or blacklist, and click the **Add** button to add to the scope list. For example, if you only want to run on Redbull pages, just add `redbull` and set as a whitelist.
  - `Add` - Add a entered word to the scope list.
  - `Remove selected` - Remove the selected word(s) from the scope list.
  - `Clear all` - Remove all words from the scope list.
- `Save` - If any options are changed, click this button to save them for future use.
- `Clear Saved URLs/Params` - If the extension is looking for reflected query parameters, then you don't want to keep getting alerted for the same URL/Parameter combinations, so those that have been reported are stored to prevent this. However, if you want to remove the memory of those, you can click this button to remove them. Similarly, we don't want to keep passing the same requests to the Wayback archive, so those are also stored, but can be cleared if this button is pressed.

### Popup Menu

If you click the `Xnl Reveal` logo in the toolbar, you will see a popup menu.

<center><img src="https://github.com/xnl-h4ck3r/XnlReveal/blob/main/images/popup.png"></center>

You have the following settings:

- `ENABLE REVEAL` - If this is not checked then the extension will do nothing. If checked then it will take certain actions on web pages visited (if they are in scope), depending on the other options set.
- `Show query parameter reflections` - If this is checked, then when a web page is visited that has any query parameters, a background request is made for each parameter, replacing each in turn with the **Canary token** from the Options page. If the token is found for any of the parameters in the response, then an message is written to the DevTools `Xnl Reveal` tab giving you the URL and all the parameters on that page that were reflected. If the options are selected, these details can also be shown in a browser alert box and copied to the users clipboard. The extension will also show a badge with the number of reflections found.<br>
  The browser alert box, and DevTools tab message, will also show the message `CHARSET IS NOT SPECIFIED IN RESPONSE!` if the charset is not explicitly set for an HTML page. This can mean XSS could be easier with a trick explained in [this blog](https://www.sonarsource.com/blog/encoding-differentials-why-charset-matters/).<br>
  **NOTE: If there are many parameters, it can take some time to send all the requests and wait for the responses. A red status bar is displayed at the top of the page to let you know to wait. Also, if the page is dynamic, then these may not be found in the initial response and reported.**
- `Write Wayback endpoints to DevTools` - If this is checked, then for each location/path visited in the browser, up to 1000 endpoints will be retrieved from the Wayback archive and written to the DevTools `Xnl Reveal` tab. Once a location/path has been sent to the Wayback API it will not be sent again, unless the `Clear Saved URLs/Params` has been clicked.
- `Show hidden elements` - If this is checked, then any elements (excluding `img`,`span` and `div`) that are hidden will be shown. They will be shown with a red border and a label in red that gives some detail. Sometimes, if the page is dynamic, the elements may not be shown.
- `Enable disabled elements` - If this is checked, then any elements (excluding `img`,`span` and `div`) that are hidden will be shown. They will be shown with a red border and a label in red that gives some detail. Sometimes, if the page is dynamic, the elements may not be shown. You can always click the **Run Now** button to change the current loaded page.

## Context Menu

If you right click on a webpage, you will get the browser context menu, e.g. if you are on `example.com` you'll see this and have Whitelist selected in the **Options**, you'll see this:

<center><img src="https://github.com/xnl-h4ck3r/XnlReveal/blob/main/images/context.png"></center>

These options are available even if the `ENABLE REVEAL` option in the **Popup Menu** is not selected. There are 3 options you can choose from:

- `Get wayback endpoints` - If this is clicked, a new tab will be opened that will contain Wayback archive endpoints for the domain of the window it is clicked on. This isn't affected by any other settings and can be run even if the extension isn't enabled.
- `Show hidden elements` - This will show all hidden elements on the current page, in the same way as the `Show hidden elements` does, but the extension doesn't need to be enabled.
- `Enable disabled elements` - This will enable all disabled elements on the current page, in the same way as the `Enable disabled elements` does, but the extension doesn't need to be enabled.
- `Show Google cache version` - If this is clicked, a new tab will be opened that will open the Google Cache version of the current page. Even if a website is no longer available, Google will have a copy stored in its archives, and you can still access the cached page.
- `Show FOFA domain search` - If this is clicked, a new tab will be opened with [FOFA](https://en.fofa.info/) showing the search results for `domain="{TARGET}"`, where `{TARGET}` is the domain of the active tab.
- `Create word list` **CHROME ONLY AT THE MOMENT** - If this is clicked, a word list will be created from the contents of the page and displayed in a new tab.
- `{Add|Remove} {HOST} {from|to} {whitelist|blacklist}` - Depending on whether the host name of the current tab is in teh scope list already, and whether the option of whitelist or blacklist is selected, you will will get a menu item to add/remove it. For example, if you are on https://www.redbull.com/gb-en/ and you have `Blacklist` selected on the **Options** page, and `redbull.com` is not in the scope list, you will see the context menu item of `Add redbull.com to blacklist`. **IMPORTANT: If the menu item does not show the correct host, you may need to refresh the tab**.

## DevTools Tab

Messages about parameter reflections and wayback endpoints were previously written to the console, but now they will be written to a separate tab in the browsers DevTools. From here you can:

- `Filter messages...` - Enter any text to do real-time filtering of messages, making it easier to find specific reflections or Wayback results among the stored messages.
- `Copy All Messages` - Copy all messages to the clipboard so you can paste into your notes!
- `Clear Messages and Cache` - Clear all the messages from the tab and local storage. It will also clear what wayback endpoints have been searched for previously.

<center><img src="https://github.com/xnl-h4ck3r/XnlReveal/blob/main/images/tab.png"></center>

## Important

This browser extension isn't going to be perfect!<br>
Sometimes the change of code can break a page. If you get a problem, unselected a certain setting in the popup menu will reload the page and it may be okay again, and you'll just not be able to check.<br>
There may also be some Errors that are shown in the **Manage extension** page in certain situations.
If you manually run an option from the context menu and nothing happens, you may need to refresh the page you are trying to run the option on and try again.

## TODO

- Improve the UI more.
- Add the `Create word list` option to Firefox version.
- Allow the user to alter the Wayback API URL that gets called so exclusions can be edited.
- Look at registering the extension so you don't need to reload each time in Firefox.
- Try to fix the intermittent error of `Error copying to clipboard (NotAllowedError: Document is not focused.)`
- Check for reflection of the parameter values in the original response, without making any extra requests. Also allow a blacklist of values not to report as reflections, e.g. `true`,`false`,`1`, etc. as there will be a lot of false positives.

## Issues

If you come across any problems at all, or have ideas for improvements, please feel free to raise an issue on Github. If there is a problem, it will be useful if you can provide the exact URL you were on, and any console errors.
<br><br>
Good luck and good hunting!
If you really love the tool (or any others), or they helped you find an awesome bounty, consider [BUYING ME A COFFEE!](https://ko-fi.com/xnlh4ck3r) ☕ (I could use the caffeine!)

🤘 /XNL-h4ck3r
