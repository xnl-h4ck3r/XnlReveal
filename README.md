<center><img src="https://github.com/xnl-h4ck3r/XnlReveal/blob/main/images/title.png"></center>

## About - v0.2

This is a **Chrome Extension** that can do the following:

- Show an alert for any query parameters that are reflected.
- Show the Wayback Archive endpoints for the path visited
- Show any hidden elements on the page.
- Enable any disabled elements on the page.

The first point was inspired by a comment by [@renniepak](https://x.com/renniepak) on Episode 42 of the [Critical Thinking - Bug Bounty Podcast](https://www.criticalthinkingpodcast.io/episode-42-renniepak-interview-intigriti-lhe-recap/) where he mentioned he had his own browser extension that let him know about any reflections.

The third and fourth points were inspired by this [Tweet by Critical Thinking - Bug Bounty Podcast](https://x.com/ctbbpodcast/status/1717151268622233614?s=20) and I initially created as browser bookmarks.

## Installing

1. Clone this repo to your machine.

2. Open the Extension Manager in Chrome by following:
   Kebab menu(three vertical dots) -> Extensions -> Manage Extensions

3. If the developer mode is not turned on, turn it on by clicking the toggle in the top right corner.

4. Now click on **Load unpacked** button on the top left

5. Go the directory where you have `XnlReveal` folder and select it.

6. The extension is now loaded. You can click on the extension icon in the toolbar to pin `Xnl Reveal` to your toolbar.

## Settings

### Options Page

If you right click the `Xnl Reveal` logo in the toolbar and select **Options**, you will be taken to the Options page.

<center><img src="https://github.com/xnl-h4ck3r/XnlReveal/blob/main/images/options.png"></center>

You have the following options:

- `Canary token` - When requests are made to test for reflection of query parameters, this is the value of the parameter that is used and checked for.
- `Check delay` - When a page is loaded, depending on settings, the extension will try to show hidden elements and enable disabled elements. However, sometimes parts of the page are loaded dynamically and they aren't in the original response. THe extension will try to show and enable again after this delay (in seconds) after the page has initially loaded.
- `Only write JS Wayback endpoints` - If the setting to write Wayback archive endpoints has been selected, then if this option is checked, only endpoints for JS files will be written to the browser console.
- `Save` - If any options are changed, click this button to save them for future use.
- `Clear Saved URLs/Params` - If the extension is looking for reflected query parameters, then you don't want to keep getting alerted for the same URL/Parameter combinations, so those that have been reported are stored to prevent this. However, if you want to remove the memory of those, you can click this button to remove them. Similarly, we don't want to keep passing the same requests to the Wayback archive, so those are also stored, but can be cleared if this button is pressed.

### Popup Menu

If you click the `Xnl Reveal` logo in the toolbar, you will see a popup menu.

<center><img src="https://github.com/xnl-h4ck3r/XnlReveal/blob/main/images/popup.png"></center>

You have the following settings:

- `ENABLE REVEAL` - If this is not checked then the extension will do nothing. If checked then it will take certain actions on web pages visited, depending on the other options set.
- `Show query param reflection alerts` - If this is checked, then when a web page is visited that has any query parameters, a background request is made for each parameter, replacing each n turn with the **Canary token** from the Options page. If the token is found for any of the parameters the response then an alert box is shown giving you the URL and all the parameters on that page that were reflected. These are also written to the browser console.<br>
  **NOTE: If there are many parameters, it can take some time to send all the requests and wait for the responses. A red status bar is displayed at the top of the page to let you know to wait. Also, if the page is dynamic, then these may not be found in the initial response and reported.**
- `Write Wayback endpoints to console` - If this is checked, then for each location/path visited in the browser, endpoints will be retrieved from the Wayback archive and written to the console. Once a location/path has been sent to the Wayback API it will not be sent again, unless the `Clear Saved URLs/Params` has been clicked.
- `Show hidden elements` - If this is checked, then any elements (excluding `img`,`span` and `div`) that are hidden will be shown. They will be shown with a red border and a label in red that gives some detail. Sometimes, if the page is dynamic, the elements may not be shown. You can always click the **Run Now** button to change the current loaded page.
- `Enable disabled elements` - If this is checked, then any elements (excluding `img`,`span` and `div`) that are hidden will be shown. They will be shown with a red border and a label in red that gives some detail. Sometimes, if the page is dynamic, the elements may not be shown. You can always click the **Run Now** button to change the current loaded page.

## Important

This Chrome extension isn't going to be perfect!<br>
Sometimes the change of code can break a page. If you get a problem, unselected a certain setting in the popup menu will reload the page and it may be okay again, and you'll just not be able to check.<br>
There may also be some Errors that are shown in the **Manage extension** page in certain situations.

## Issues

If you come across any problems at all, or have ideas for improvements, please feel free to raise an issue on Github. If there is a problem, it will be useful if you can provide the exact URL you were on, and any console errors.
<br><br>
Good luck and good hunting!
If you really love the tool (or any others), or they helped you find an awesome bounty, consider [BUYING ME A COFFEE!](https://ko-fi.com/xnlh4ck3r) ☕ (I could use the caffeine!)

🤘 /XNL-h4ck3r
