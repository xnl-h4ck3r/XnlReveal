console.log("%c🤘Xnl Reveal:%c Content script loaded", "color: #00ff00; font-weight: bold", "color: inherit");

// Helper function to log to devtools panel
function logToDevtools(message, type = "info") {
  // Send message to background script (which will handle storage and forwarding)
  // No callback needed - we don't use the response and it causes "port closed" errors
  chrome.runtime.sendMessage({
    action: "logToDevtools",
    message: message,
    logType: type,
  });
}

// Define status message constant
const REFLECTION_STATUS_MESSAGE = "Xnl Reveal is getting reflections. If there's a large number of params, this can take a while. Wait until this message disappears if you want the results.";

// Create a status bar element
const statusBar = document.createElement("div");
statusBar.textContent = REFLECTION_STATUS_MESSAGE;
statusBar.style.backgroundColor = "red";
statusBar.style.color = "white";
statusBar.style.position = "fixed";
statusBar.style.top = "0";
statusBar.style.left = "0";
statusBar.style.right = "0";
statusBar.style.padding = "10px";
statusBar.style.textAlign = "center";
statusBar.style.zIndex = "9999";

// Define a global constant for ignored src strings
const IGNORED_STRINGS = "googletagmanager|doubleclick|google-analytics";

// Default english "stop word" list
const DEFAULT_STOP_WORDS =
  "a,aboard,about,above,across,after,afterwards,again,against,all,almost,alone,along,already,also,although,always,am,amid,among,amongst,an,and,another,any,anyhow,anyone,anything,anyway,anywhere,are,around,as,at,back,be,became,because,become,becomes,becoming,been,before,beforehand,behind,being,below,beneath,beside,besides,between,beyond,both,bottom,but,by,can,cannot,cant,con,concerning,considering,could,couldnt,cry,de,describe,despite,do,done,down,due,during,each,eg,eight,either,eleven,else,elsewhere,empty,enough,etc,even,ever,every,everyone,everything,everywhere,except,few,fifteen,fifty,fill,find,fire,first,five,for,former,formerly,forty,found,four,from,full,further,get,give,go,had,has,hasnt,have,he,hence,her,here,hereafter,hereby,herein,hereupon,hers,herself,him,himself,his,how,however,hundred,i,ie,if,in,inc,indeed,inside,interest,into,is,it,its,itself,keep,last,latter,latterly,least,less,like,ltd,made,many,may,me,meanwhile,might,mill,mine,more,moreover,most,mostly,move,much,must,my,myself,name,namely,near,neither,never,nevertheless,next,nine,no,nobody,none,noone,nor,not,nothing,now,nowhere,of,off,often,on,once,one,only,onto,or,other,others,otherwise,our,ours,ourselves,out,outside,over,own,part,past,per,perhaps,please,put,rather,re,regarding,round,same,see,seem,seemed,seeming,seems,serious,several,she,should,show,side,since,sincere,six,sixty,so,some,somehow,someone,something,sometime,sometimes,somewhere,still,such,take,ten,than,that,the,their,them,themselves,then,thence,there,thereafter,thereby,therefore,therein,thereupon,these,they,thick,thin,third,this,those,though,three,through,throughout,thru,thus,to,together,too,top,toward,towards,twelve,twenty,two,un,under,underneath,until,unto,up,upon,us,very,via,want,was,wasnt,we,well,went,were,weve,what,whatever,when,whence,whenever,where,whereafter,whereas,whereby,wherein,whereupon,wherever,whether,which,while,whilst,whither,whoever,whole,whom,whose,why,will,with,within,without,would,yet,you,youll,your,youre,yours,yourself,yourselves,youve";

// Website blacklist
const BLACKLIST = new Set([
  "web.archive.org",
  "webcache.googleusercontent.com",
  "en.fofa.info",
]);

// Sus Parameters from @jhaddix, @G0LDEN_infosec and @ryancbarnett
const SUS_CMDI = new Set([
  "execute",
  "dir",
  "daemon",
  "cli",
  "log",
  "cmd",
  "download",
  "ip",
  "upload",
  "message",
  "input_file",
  "format",
  "expression",
  "data",
  "bsh",
  "bash",
  "shell",
  "command",
  "range",
  "sort",
  "host",
  "exec",
  "code",
]);
const SUS_DEBUG = new Set([
  "test",
  "reset",
  "config",
  "shell",
  "admin",
  "exec",
  "load",
  "cfg",
  "dbg",
  "edit",
  "root",
  "create",
  "access",
  "disable",
  "alter",
  "make",
  "grant",
  "adm",
  "toggle",
  "execute",
  "clone",
  "delete",
  "enable",
  "rename",
  "debug",
  "modify",
  "stacktrace",
]);
const SUS_FILEINC = new Set([
  "root",
  "directory",
  "path",
  "style",
  "folder",
  "default-language",
  "url",
  "platform",
  "textdomain",
  "document",
  "template",
  "pg",
  "php_path",
  "doc",
  "type",
  "lang",
  "token",
  "name",
  "pdf",
  "file",
  "etc",
  "api",
  "app",
  "resource-type",
  "controller",
  "filename",
  "page",
  "f",
  "view",
  "input_file",
]);
const SUS_IDOR = new Set([
  "count",
  "key",
  "user",
  "id",
  "extended_data",
  "uid2",
  "group",
  "team_id",
  "data-id",
  "no",
  "username",
  "email",
  "account",
  "doc",
  "uuid",
  "profile",
  "number",
  "user_id",
  "edit",
  "report",
  "order",
]);
const SUS_OPENREDIRECT = new Set([
  "u",
  "redirect_uri",
  "failed",
  "r",
  "referer",
  "return_url",
  "redirect_url",
  "prejoin_data",
  "continue",
  "redir",
  "return_to",
  "origin",
  "redirect_to",
  "next",
]);
const SUS_SQLI = new Set([
  "process",
  "string",
  "id",
  "referer",
  "password",
  "pwd",
  "field",
  "view",
  "sleep",
  "column",
  "log",
  "token",
  "sel",
  "select",
  "sort",
  "from",
  "search",
  "update",
  "pub_group_id",
  "row",
  "results",
  "role",
  "table",
  "multi_layer_map_list",
  "order",
  "filter",
  "params",
  "user",
  "fetch",
  "limit",
  "keyword",
  "email",
  "query",
  "c",
  "name",
  "where",
  "number",
  "phone_number",
  "delete",
  "report",
  "q",
  "sql",
]);
const SUS_SSRF = new Set([
  "sector_identifier_uri",
  "request_uris",
  "logo_uri",
  "jwks_uri",
  "start",
  "path",
  "domain",
  "source",
  "url",
  "site",
  "view",
  "template",
  "page",
  "show",
  "val",
  "dest",
  "metadata",
  "out",
  "feed",
  "navigation",
  "image_host",
  "uri",
  "next",
  "continue",
  "host",
  "window",
  "dir",
  "reference",
  "filename",
  "html",
  "to",
  "return",
  "open",
  "port",
  "stop",
  "validate",
  "resturl",
  "callback",
  "name",
  "data",
  "ip",
  "redirect",
  "target",
  "referer",
]);
const SUS_SSTI = new Set([
  "preview",
  "activity",
  "id",
  "name",
  "content",
  "view",
  "template",
  "redirect",
]);
const SUS_XSS = new Set([
  "path",
  "admin",
  "class",
  "atb",
  "redirect_uri",
  "other",
  "utm_source",
  "currency",
  "dir",
  "title",
  "endpoint",
  "return_url",
  "users",
  "cookie",
  "state",
  "callback",
  "militarybranch",
  "e",
  "referer",
  "password",
  "author",
  "body",
  "status",
  "utm_campaign",
  "value",
  "text",
  "search",
  "flaw",
  "vote",
  "pathname",
  "params",
  "user",
  "t",
  "utm_medium",
  "q",
  "email",
  "what",
  "file",
  "data-original",
  "description",
  "subject",
  "action",
  "u",
  "nickname",
  "color",
  "language_id",
  "auth",
  "samlresponse",
  "return",
  "readyfunction",
  "where",
  "tags",
  "cvo_sid1",
  "target",
  "format",
  "back",
  "term",
  "r",
  "id",
  "url",
  "view",
  "username",
  "sequel",
  "type",
  "city",
  "src",
  "p",
  "label",
  "ctx",
  "style",
  "html",
  "ad_type",
  "s",
  "issues",
  "query",
  "c",
  "shop",
  "redirect",
  "page",
  "prefv1",
  "destination",
  "mode",
  "data",
  "error",
  "editor",
  "wysiwyg",
  "widget",
  "msg",
]);

// Additional Sus Parameters
const SUS_MASSASSIGNMENT = new Set([
  "user",
  "profile",
  "role",
  "settings",
  "data",
  "attributes",
  "post",
  "comment",
  "order",
  "product",
  "form_fields",
  "request",
]);

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "dynamicScopeMenuItem") {
    dynamicScopeMenuItem(message.scopeAction, message.scopeHost);
  }
  if (message.action === "showWaybackEndpoints") {
    showWaybackEndpoints();
  }
  if (message.action === "showHiddenElements") {
    showHiddenElements();
  }
  if (message.action === "enableDisabledElements") {
    enableDisabledElements();
  }
  if (message.action === "showGoogleCache") {
    showGoogleCache();
  }
  if (message.action === "showFofaSearch") {
    showFofaSearch();
  }
  if (message.action === "createWordList") {
    createWordList();
  }
});

function htmlEntities(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Function to add or remove a host to the scope list
function dynamicScopeMenuItem(action, host) {
  // Get the current scopeItems from storage
  chrome.storage.sync.get(["scopeItems"], (result) => {
    const scopeItems = result.scopeItems || [];

    if (action === "Add") {
      // Add the host to scopeItems if it's not already in the list
      if (!scopeItems.includes(host)) {
        scopeItems.push(host);
      }
    } else if (action === "Remove") {
      // Remove the host from scopeItems if it exists
      const index = scopeItems.indexOf(host);
      if (index !== -1) {
        scopeItems.splice(index, 1);
      }
    }

    // Save the updated scopeItems back to storage
    chrome.storage.sync.set({ scopeItems }, () => {
      if (chrome.runtime.lastError) {
        console.error(
          "%c🤘Xnl Reveal:%c Error saving scopeItems:",
          "color: #00ff00; font-weight: bold",
          "color: inherit",
          chrome.runtime.lastError
        );
      } else {
        logToDevtools(
          `Xnl Reveal: Scope - successfully ${
            action === "Add" ? "added" : "removed"
          } ${host}.`
        );
      }
    });
  });
  // Send a message to the background script to request tab information to update the menu
  chrome.runtime.sendMessage({ action: "getTabInfo" });
}

// Function to show all wayback endpoints for the domain in a separate window
function showWaybackEndpoints() {
  try {
    var currentURL = encodeURIComponent(
      window.location.hostname.replace(/^www\./, "")
    );
    // Don't log when opening Wayback in new tab
    // logToDevtools(`Xnl Reveal: Wayback location ${currentURL}`);
    var newURL =
      "https://web.archive.org/cdx/search/cdx?url=*." +
      currentURL +
      "&fl=original&collapse=urlkey&filter=!mimetype:warc/revisit|text/css|image/jpeg|image/jpg|image/png|image/svg.xml|image/gif|image/tiff|image/webp|image/bmp|image/vnd|image/x-icon|image/vnd.microsoft.icon|font/ttf|font/woff|font/woff2|font/x-woff2|font/x-woff|font/otf|audio/mpeg|audio/wav|audio/webm|audio/aac|audio/ogg|audio/wav|audio/webm|video/mp4|video/mpeg|video/webm|video/ogg|video/mp2t|video/webm|video/x-msvideo|video/x-flv|application/font-woff|application/font-woff2|application/x-font-woff|application/x-font-woff2|application/vnd.ms-fontobject|application/font-sfnt|application/vnd.android.package-archive|binary/octet-stream|application/octet-stream|application/pdf|application/x-font-ttf|application/x-font-otf|video/webm|video/3gpp|application/font-ttf|audio/mp3|audio/x-wav|image/pjpeg|audio/basic|application/font-otf&filter=!statuscode:404|301|302&page=";

    // open the window
    var newWindow = window.open(newURL, "_blank");
  } catch (error) {
    console.error(
      "%c🤘Xnl Reveal:%c Error in showWaybackEndpoints:",
      "color: #00ff00; font-weight: bold",
      "color: inherit",
      error
    );
  }
}

// Function to open google chached version of the page in a separate window
function showGoogleCache() {
  try {
    var newURL =
      "https://webcache.googleusercontent.com/search?q=cache:" +
      window.location;

    // open the window
    var newWindow = window.open(newURL, "_blank");
  } catch (error) {
    console.error(
      "%c🤘Xnl Reveal:%c Error in showGoogleCache:",
      "color: #00ff00; font-weight: bold",
      "color: inherit",
      error
    );
  }
}

// Function to get the root domain from a hostname
function rootDomain(hostname) {
  let parts = hostname.split(".");
  if (parts.length <= 2) return hostname;

  parts = parts.slice(-3);
  if (["co", "com"].indexOf(parts[1]) > -1) return parts.join(".");

  return parts.slice(-2).join(".");
}

// Function to open FOFA search for domain in a separate window
function showFofaSearch() {
  try {
    // Get the current root domain
    domain = rootDomain(window.location.hostname);

    // Get the base64 encoded and URL encoded version of the domain
    base64Domain = encodeURIComponent(btoa("domain=" + domain));

    var newURL = "https://en.fofa.info/result?qbase64=" + base64Domain;

    // open the window
    var newWindow = window.open(newURL, "_blank");
  } catch (error) {
    console.error(
      "%c🤘Xnl Reveal:%c Error in showFofaSearch:",
      "color: #00ff00; font-weight: bold",
      "color: inherit",
      error
    );
  }
}

// Function to open a separate tab with a word list based on the current tab contents
function createWordList() {
  try {
    // Convert stop words string to a Set
    const stopWords = new Set(DEFAULT_STOP_WORDS.split(","));

    // Extract the words from the current page
    let words = document.documentElement.innerText.match(/[a-zA-Z_\-]+/g);
    words = words.map((word) => {
      // Remove leading '-' from words
      if (word.startsWith("-")) {
        word = word.substring(1);
      }
      return word;
    });
    const filteredWords = [...new Set(words)]
      .filter((word) => word.length > 1 && !stopWords.has(word.toLowerCase()))
      .sort();
    const wordListText = filteredWords.join("\n");
    const originalUrl = window.location.href;
    const truncatedUrl =
      originalUrl.length > 50
        ? originalUrl.substring(0, 50) + "..."
        : originalUrl;

    // Get the URL of the CSS file and the image
    const cssUrl = chrome.runtime.getURL("xnl.css");
    const imageUrl = chrome.runtime.getURL("images/codemain.jpg");

    // Create HTML content with the original URL, CSS link, and word list inside a textarea
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Xnl Reveal: Word List</title>
        <style>
          @import url('${cssUrl}');
          html, body {
            height: 100%;
            margin: 0;
            display: flex;
            flex-direction: column;
          }
          body {
            background-image: url('${imageUrl}');
          }
          .body-wrapper {
            flex: 1;
            display: flex;
            flex-direction: column;
          }
          .popup-main {
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 20px;
          }
          .container {
            flex: 1;
            display: flex;
            flex-direction: column;
          }
          .container textarea {
            width: 100%;
            height: 100%;
            box-sizing: border-box; /* Ensures padding and border are included in the width */
            flex: 1;
          }
        </style>
      </head>
      <body>
        <div class="body-wrapper">
          <main class="popup-main">
            <h1 class="options-heading">Xnl Reveal: Word List</h1>
            <h2 title="${originalUrl}">Source: <a href="${originalUrl}" target="_blank">${truncatedUrl}</a></h2>
            <div class="container options">
              <textarea readonly>${wordListText}</textarea>
            </div>
          </main>
        </div>
      </body>
      </html>
    `;

    // Open a new tab
    const newTab = window.open();

    // Write the HTML content into the new tab
    newTab.document.open();
    newTab.document.write(htmlContent);
    newTab.document.close();
  } catch (error) {
    console.error(
      "%c🤘Xnl Reveal:%c Error in createWordList:",
      "color: #00ff00; font-weight: bold",
      "color: inherit",
      error
    );
  }
}

// Function to enable disabled elements
function enableDisabledElements() {
  try {
    document
      .querySelectorAll(
        ':not(img):not(span):not(div)[disabled],:not(img):not(span):not(div)[disabled=""]'
      )
      .forEach((e) => {
        // Check if the element should be ignored based on the 'src' attribute
        const src = e.getAttribute("src");
        if (!src || !new RegExp(IGNORED_STRINGS, "i").test(src)) {
          e.disabled = false;
          e.style.cssText = "border-color: blue; border-width: 3px";
          const d = document.createElement("div");
          const elementType = e.getAttribute("type") || e.tagName;
          const elementName = e.getAttribute("name") || e.getAttribute("id");
          d.innerHTML = `<span style="color: blue;">Disabled ${htmlEntities(
            elementType
          )} [${htmlEntities(elementName)}]  </span>`;
          e.parentNode.insertBefore(d, e).appendChild(e);
        }
      });
  } catch (error) {
    console.error(
      "%c🤘Xnl Reveal:%c Error in enableDisabledElements:",
      "color: #00ff00; font-weight: bold",
      "color: inherit",
      error
    );
  }
}

// Function to show hidden elements
function showHiddenElements() {
  try {
    document
      .querySelectorAll(
        ":not(img):not(span):not(div)[type=hidden],:not(img):not(span):not(div)[hidden]"
      )
      .forEach((e) => {
        // Check if the element should be ignored based on the 'src' attribute
        const src = e.getAttribute("src");
        if (!src || !new RegExp(IGNORED_STRINGS).test(src)) {
          e.type = "text";
          e.style.cssText = "border-color: red; border-width: 3px";
          const d = document.createElement("div");
          const elementType = e.getAttribute("type") || e.tagName;
          const elementName = e.getAttribute("name") || e.getAttribute("id");
          d.innerHTML = `<span style="color: red;">Hidden ${htmlEntities(
            elementType
          )} [${htmlEntities(elementName)}]  </span>`;
          e.parentNode.insertBefore(d, e).appendChild(e);
        }
      });
  } catch (error) {
    console.error(
      "%c🤘Xnl Reveal:%c Error in showHiddenElements (hidden):",
      "color: #00ff00; font-weight: bold",
      "color: inherit",
      error
    );
  }
  try {
    document
      .querySelectorAll(':not(img):not(span):not(div)[style*="display: none;"]')
      .forEach((e) => {
        // Check if the element should be ignored based on the 'src' attribute
        const src = e.getAttribute("src");
        if (!src || !new RegExp(IGNORED_STRINGS).test(src)) {
          e.type = "text";
          e.style.cssText = "border-color: red; border-width: 3px";
          e.style.display = "block";
          const d = document.createElement("div");
          const elementType = e.getAttribute("type") || e.tagName;
          const elementName = e.getAttribute("name") || e.getAttribute("id");
          d.innerHTML = `<span style="color: red;">Hidden ${htmlEntities(
            elementType
          )} [${htmlEntities(elementName)}]  </span>`;
          e.parentNode.insertBefore(d, e).appendChild(e);
        }
      });
  } catch (error) {
    console.error(
      "%c🤘Xnl Reveal:%c Error in showHiddenElements (display none):",
      "color: #00ff00; font-weight: bold",
      "color: inherit",
      error
    );
  }
  try {
    document
      .querySelectorAll(
        ':not(img):not(span):not(div)[style*="visibility: hidden;"]'
      )
      .forEach((e) => {
        // Check if the element should be ignored based on the 'src' attribute
        const src = e.getAttribute("src");
        if (!src || !new RegExp(IGNORED_STRINGS).test(src)) {
          e.type = "text";
          e.style.cssText = "border-color: red; border-width: 3px";
          e.style.visibility = "visible";
          const d = document.createElement("div");
          const elementType = e.getAttribute("type") || e.tagName;
          const elementName = e.getAttribute("name") || e.getAttribute("id");
          d.innerHTML = `<span style="color: red;">Hidden ${htmlEntities(
            elementType
          )} [${htmlEntities(elementName)}]  </span>`;
          e.parentNode.insertBefore(d, e).appendChild(e);
        }
      });
  } catch (error) {
    console.error(
      "%c🤘Xnl Reveal:%c Error in showHiddenElements (visibility hidden):",
      "color: #00ff00; font-weight: bold",
      "color: inherit",
      error
    );
  }
}

// Read the user's random string and extension state from storage
chrome.storage.sync.get(
  [
    "canaryToken",
    "checkSpecialChars",
    "showAlerts",
    "copyToClipboard",
    "paramBlacklist",
    "checkDelay",
    "waybackRegex",
    "extensionDisabled",
    "reflectionsDisabled",
    "waybackDisabled",
    "hiddenDisabled",
    "disabledDisabled",
  ],
  (result) => {
    if (result.extensionDisabled === undefined) {
      chrome.storage.sync.set({ ["extensionDisabled"]: "true" });
      extensionDisabled = "true";
    } else {
      extensionDisabled = result.extensionDisabled || "true";
    }
    if (result.reflectionsDisabled === undefined) {
      chrome.storage.sync.set({ ["reflectionsDisabled"]: "true" });
      reflectionsDisabled = "true";
    } else {
      reflectionsDisabled = result.reflectionsDisabled || "true";
    }
    if (result.waybackDisabled === undefined) {
      chrome.storage.sync.set({ ["waybackDisabled"]: "true" });
      waybackDisabled = "true";
    } else {
      waybackDisabled = result.waybackDisabled || "true";
    }
    if (result.hiddenDisabled === undefined) {
      chrome.storage.sync.set({ ["hiddenDisabled"]: "true" });
      hiddenDisabled = "true";
    } else {
      hiddenDisabled = result.hiddenDisabled || "true";
    }
    if (result.disabledDisabled === undefined) {
      chrome.storage.sync.set({ ["disabledDisabled"]: "true" });
      disabledDisabled = "true";
    } else {
      disabledDisabled = result.disabledDisabled || "true";
    }
    if (result.canaryToken === undefined) {
      chrome.storage.sync.set({ ["canaryToken"]: "xnlreveal" });
      canaryToken = "xnlreveal";
    } else {
      canaryToken = result.canaryToken || "xnlreveal";
    }
    if (result.checkSpecialChars === undefined) {
      chrome.storage.sync.set({ ["checkSpecialChars"]: false });
      checkSpecialChars = false;
    } else {
      checkSpecialChars = result.checkSpecialChars;
    }
    if (result.showAlerts === undefined) {
      chrome.storage.sync.set({ ["showAlerts"]: true });
      showAlerts = true;
    } else {
      showAlerts = result.showAlerts;
    }
    if (result.copyToClipboard === undefined) {
      chrome.storage.sync.set({ ["copyToClipboard"]: false });
      copyToClipboard = false;
    } else {
      copyToClipboard = result.copyToClipboard;
    }
    if (result.paramBlacklist === undefined) {
      chrome.storage.sync.set({ ["paramBlacklist"]: "" });
      paramBlacklist = "";
    } else {
      paramBlacklist = result.paramBlacklist || "";
    }
    if (result.checkDelay === undefined) {
      chrome.storage.sync.set({ ["checkDelay"]: "2" });
      checkDelay = "2";
    } else {
      checkDelay = result.checkDelay || "2";
    }
    if (result.waybackRegex === undefined) {
      chrome.storage.sync.set({ ["waybackRegex"]: "" });
      waybackRegex = "";
    } else {
      waybackRegex = result.waybackRegex || "";
    }

    function writeWaybackEndpoints() {
      try {
        // Get the current location without schema and query string
        currentLocation = location.host + location.pathname;
        if (!currentLocation.endsWith("/")) {
          currentLocation += "/";
        }
        console.log(
          "%c🤘Xnl Reveal:%c Checking Wayback for:",
          "color: #00ff00; font-weight: bold",
          "color: inherit",
          currentLocation
        );
        // Check if this URL has already been used to check wayback
        chrome.storage.local.get(
          ["wayback://" + currentLocation],
          ({ ["wayback://" + currentLocation]: waybackPath }) => {
            if (!waybackPath) {
              console.log(
                "%c🤘Xnl Reveal:%c New location, fetching Wayback data for:",
                "color: #00ff00; font-weight: bold",
                "color: inherit",
                currentLocation
              );

              // Mark this location as being fetched immediately to prevent duplicate requests
              const visitedMarker = {
                ["wayback://" + currentLocation]: true,
              };
              chrome.storage.local.set(visitedMarker);

              // Send request - background script handles queuing
              const fetchingLocation = currentLocation;

              console.log(
                "%c🤘Xnl Reveal:%c Sending fetchWaybackData to background for:",
                "color: #00ff00; font-weight: bold",
                "color: inherit",
                fetchingLocation
              );

              chrome.runtime.sendMessage(
                {
                  action: "fetchWaybackData",
                  location: fetchingLocation,
                },
                (response) => {
                  if (chrome.runtime.lastError) {
                    console.error(
                      "%c🤘Xnl Reveal:%c Error for",
                      "color: #00ff00; font-weight: bold",
                      "color: inherit",
                      fetchingLocation,
                      ":",
                      chrome.runtime.lastError.message
                    );
                    return;
                  }

                  if (!response) {
                    console.error(
                      "%c🤘Xnl Reveal:%c No response for",
                      "color: #00ff00; font-weight: bold",
                      "color: inherit",
                      fetchingLocation
                    );
                    return;
                  }

                  console.log(
                    "%c🤘Xnl Reveal:%c Received Wayback response for",
                    "color: #00ff00; font-weight: bold",
                    "color: inherit",
                    fetchingLocation
                  );

                  const { waybackData, error, statusCode, url, timeout } =
                    response;

                  if (error) {
                    // Handle the error if there's one - don't mark as visited on error
                    if (timeout) {
                      logToDevtools(
                        `Xnl Reveal: Wayback Endpoints for ${url}\nError: ${error}`,
                        "error"
                      );
                    } else {
                      logToDevtools(
                        `Xnl Reveal: Wayback Endpoints for ${url}\nError: ${error}`,
                        "error"
                      );
                    }
                  } else if (statusCode !== 200) {
                    // Handle non-200 status codes - don't mark as visited on error
                    logToDevtools(
                      `Xnl Reveal: Wayback Endpoints for ${url}\nError: Received HTTP ${statusCode} response from Wayback Machine`,
                      "warn"
                    );
                  } else {
                    // Success - already marked as visited at the start of the request
                    // Send all wayback data to DevTools (panel will handle truncation)
                    const allLines = waybackData.split("\n");

                    if (waybackRegex != "") {
                      // Process only lines that match the regex
                      const jsLines = waybackData
                        .split("\n")
                        .filter((line) =>
                          new RegExp(waybackRegex, "i").test(line.trim())
                        );
                      // Process the response if not blank
                      if (jsLines.join("\n").trim() != "") {
                        logToDevtools(
                          `Xnl Reveal: Wayback Endpoints for ${url}\n${jsLines
                            .join("\n")
                            .trim()}`,
                          "wayback"
                        );
                      } else {
                        logToDevtools(
                          `Xnl Reveal: Wayback Endpoints for ${url}\nNo endpoints found matching regex: ${waybackRegex}`,
                          "wayback"
                        );
                      }
                    } else {
                      if (waybackData.trim() != "") {
                        logToDevtools(
                          `Xnl Reveal: Wayback Endpoints for ${url}\n${waybackData.trim()}`,
                          "wayback"
                        );
                      } else {
                        logToDevtools(
                          `Xnl Reveal: Wayback Endpoints for ${url}\nNo endpoints found`,
                          "wayback"
                        );
                      }
                    }
                  }
                }
              );
            } else {
              console.log(
                "%c🤘Xnl Reveal:%c Location " +
                  currentLocation +
                  " already checked on wayback archive.",
                "color: #00ff00; font-weight: bold",
                "color: inherit"
              );
            }
          }
        );
      } catch (error) {
        // Handle other errors here
        console.error(
          "%c🤘Xnl Reveal:%c An error occurred:",
          "color: #00ff00; font-weight: bold",
          "color: inherit",
          error
        );
      }
    }

    function isHostInScope(callback) {
      // Send a message to the background script to request tab information
      chrome.runtime.sendMessage({ action: "getTabInfo" }, function (response) {
        if (response.error) {
          console.error(
            "%c🤘Xnl Reveal:%c An error occurred while querying tabs:",
            "color: #00ff00; font-weight: bold",
            "color: inherit",
            response.error
          );
          callback(false); // Return false when there's an error
          return;
        }

        const currentHost = response.currentHost;

        // Ignore blacklisted websites
        if (BLACKLIST.has(location.host)) {
          callback(false);
          return;
        }

        try {
          // Get the scope type from storage
          chrome.storage.sync.get(["scopeType"], (scopeResult) => {
            const scopeType = scopeResult.scopeType || "whitelist"; // Default to "whitelist" if not set

            // Get the scope items from storage
            chrome.storage.sync.get(["scopeItems"], (itemsResult) => {
              const scopeItems = itemsResult.scopeItems || [];

              // If scopeItems is empty, behavior depends on scope type
              if (scopeItems.length === 0) {
                // Empty whitelist = process nothing, Empty blacklist = process everything
                const result = scopeType === "blacklist";
                if (!result && scopeType === "whitelist") {
                  console.log(
                    "%c🤘Xnl Reveal:%c Whitelist is empty - not processing any sites. Add domains to the whitelist in Options, or switch to Blacklist mode.",
                    "color: #00ff00; font-weight: bold",
                    "color: inherit"
                  );
                }
                callback(result);
                return;
              }
              // Check if any scope items match the current host
              const isMatch = scopeItems.some((item) =>
                currentHost.includes(item)
              );

              // Determine the result based on scope type
              let result;
              if (scopeType === "whitelist") {
                result = isMatch;
              } else if (scopeType === "blacklist") {
                result = !isMatch;
              }

              // Use the callback to handle the result
              callback(result);
            });
          });
        } catch (error) {
          console.error(
            "%c🤘Xnl Reveal:%c An error occurred while accessing Chrome storage:",
            "color: #00ff00; font-weight: bold",
            "color: inherit",
            error
          );
          callback(false); // Return false when there's an error
        }
      });
    }

    // Function to replace parameter values with replacement arg in the URL
    function replaceParameterValues(url, replacement) {
      const urlObject = new URL(url);
      const params = urlObject.searchParams;
      for (const key of params.keys()) {
        params.set(key, replacement);
      }
      return urlObject.toString();
    }

    // Function to copy test to the users clipboard
    function copyToClipboardAsync(text) {
      navigator.clipboard
        .writeText(text)
        .then(() => {})
        .catch((error) => {
          console.error(
            `🤘Xnl Reveal: Error copying to clipboard (${error}). Check that the site has permissions to access the clipboard in the browser`
          );
        });
    }

    function runAfterPageLoad() {
      try {
        chrome.runtime.sendMessage({ action: "getTabInfo" });

        if (
          extensionDisabled === "false" &&
          (hiddenDisabled === "false" ||
            disabledDisabled === "false" ||
            reflectionsDisabled === "false" ||
            waybackDisabled === "false")
        ) {
          isHostInScope((inScope) => {
            if (inScope) {
              if (waybackDisabled === "false") writeWaybackEndpoints();
              if (hiddenDisabled === "false") showHiddenElements();
              if (disabledDisabled === "false") enableDisabledElements();

              if (reflectionsDisabled === "false") {
                const params = new URLSearchParams(window.location.search);
                const reflectedParameters = [];
                let successfulRequests = 0;
                let paramIndex = 0;
                
                // First, calculate the actual number of non-blacklisted params
                const blacklistArray = paramBlacklist
                  .split(",")
                  .map((param) => param.trim());
                let totalParams = 0;
                params.forEach((value, key) => {
                  if (
                    !((blacklistArray.length === 1 && blacklistArray[0] === key) ||
                    blacklistArray.includes(key))
                  ) {
                    totalParams++;
                  }
                });

                params.forEach((value, key) => {
                  let specialChars = "";
                  if (
                    (blacklistArray.length === 1 &&
                      blacklistArray[0] === key) ||
                    blacklistArray.includes(key)
                  ) {
                    return; // Skip blacklisted params
                  }
                  
                  paramIndex++; // Increment only for non-blacklisted params
                  const currentParamNumber = paramIndex; // Capture the index for this specific param

                  const performFetch = (withSpecialChars) => {
                    const modifiedParams = new URLSearchParams(params);
                    if (withSpecialChars && checkSpecialChars) {
                      modifiedParams.set(key, canaryToken + `"'<xnl`);
                    } else {
                      modifiedParams.set(key, canaryToken);
                    }
                    const modifiedURL = `${window.location.origin}${window.location.pathname}?${modifiedParams}`;
                    const modifiedURLForStorage = replaceParameterValues(
                      window.location.href,
                      canaryToken
                    );

                    chrome.storage.local.get(
                      [modifiedURLForStorage, key],
                      ({
                        [modifiedURLForStorage]: urlData,
                        [key]: paramData,
                      }) => {
                        if (!urlData || !paramData) {
                          statusBar.textContent = REFLECTION_STATUS_MESSAGE;
                          document.body.appendChild(statusBar);

                          const timeoutPromise = new Promise(
                            (resolve, reject) => {
                              const timeoutError = new Error(
                                `Xnl Reveal: Fetch timed out checking param "${key}" for URL: ${modifiedURL}`
                              );
                              setTimeout(() => reject(timeoutError), 30000);
                            }
                          );
                          // Don't log fetching messages
                          // logToDevtools(`Xnl Reveal: Fetching ${modifiedURL}`);

                          Promise.race([fetch(modifiedURL), timeoutPromise])
                            .then((response) => {
                              if (response instanceof Error) {
                                console.error(
                                  "%c🤘Xnl Reveal:%c Fetch error:",
                                  "color: #00ff00; font-weight: bold",
                                  "color: inherit",
                                  response
                                );
                              } else {
                                if (!response.ok) {
                                  console.warn(
                                    `🤘Xnl Reveal: Non-2xx Response (${response.status}) for ${modifiedURL}`
                                  );
                                }
                                let contentType =
                                  response.headers.get("content-type") ||
                                  "text/html";

                                if (
                                  contentType.includes("text/html") &&
                                  !contentType.includes("charset=")
                                ) {
                                  return response.text().then((text) => {
                                    charsetXSS =
                                      !text.includes("<meta charset=") &&
                                      !text.includes("text/html; charset=");
                                    return text;
                                  });
                                } else {
                                  charsetXSS = false;
                                  return response.text();
                                }
                              }
                            })
                            .then((text) => {
                              if (checkSpecialChars && withSpecialChars) {
                                const canaryRegex = new RegExp(
                                  canaryToken + `.*?(['"<])xnl`
                                );
                                const match = canaryRegex.exec(text);

                                if (match) {
                                  const afterCanary = match[0];
                                  if (afterCanary.includes("'"))
                                    specialChars += "'";
                                  if (afterCanary.includes('"'))
                                    specialChars += '"';
                                  if (afterCanary.includes("<"))
                                    specialChars += "<";

                                  reflectedParameters.push({
                                    key,
                                    specialChars,
                                  });
                                } else {
                                  // Retry without special characters
                                  performFetch(false);
                                  return;
                                }
                              }

                              if (specialChars === "") {
                                if (text.includes(canaryToken)) {
                                  reflectedParameters.push({
                                    key,
                                    specialChars,
                                  });
                                }
                              }

                              const alertData = {
                                [modifiedURLForStorage]: true,
                                [key]: true,
                              };
                              chrome.storage.local.set(alertData);
                              successfulRequests++;

                              if (successfulRequests === totalParams) {
                                if (reflectedParameters.length > 0) {
                                  processReflectedParameters(
                                    reflectedParameters,
                                    charsetXSS
                                  );
                                }
                                statusBar.remove();
                              }
                            })
                            .catch((error) => {
                              console.error(
                                "%c🤘Xnl Reveal:%c Fetch error: " +
                                  error.message,
                                "color: #00ff00; font-weight: bold",
                                "color: inherit"
                              );
                              successfulRequests++;
                              if (successfulRequests === totalParams) {
                                statusBar.remove();
                              }
                            });
                        }
                      }
                    );
                  };

                  performFetch(true);
                });
              }
            }
          });
        }
      } catch (error) {
        console.error(
          "%c🤘Xnl Reveal:%c An error occurred:",
          "color: #00ff00; font-weight: bold",
          "color: inherit",
          error
        );
        statusBar.remove();
      }
    }

    // Function to process reflected parameters
    function processReflectedParameters(reflectedParameters, charsetXSS) {
      const displayedParameters = [];
      let susParams = false;

      // Check if any reflected parameters appear in SUS parameter lists and whether to include special characters
      reflectedParameters.forEach(({ key, specialChars }) => {
        param = key;

        susTypes = "";
        susTypes += SUS_CMDI.has(param) ? "CMDi | " : "";
        susTypes += SUS_DEBUG.has(param) ? "DEBUG | " : "";
        susTypes += SUS_FILEINC.has(param) ? "LFI/RFI | " : "";
        susTypes += SUS_IDOR.has(param) ? "IDOR | " : "";
        susTypes += SUS_OPENREDIRECT.has(param) ? "OR | " : "";
        susTypes += SUS_SQLI.has(param) ? "SQLi | " : "";
        susTypes += SUS_SSRF.has(param) ? "SSRF | " : "";
        susTypes += SUS_SSTI.has(param) ? "SSTI | " : "";
        susTypes += SUS_XSS.has(param) ? "XSS | " : "";
        susTypes += SUS_MASSASSIGNMENT.has(param) ? "MASS-ASSIGN | " : "";

        // Include special characters that were reflected
        if (specialChars != "") {
          const spacedSpecialChars = specialChars
            .toString()
            .split("")
            .join(" ");
          param = param + " (plus special chars " + spacedSpecialChars + ")";
        }

        if (susTypes != "") {
          displayedParameters.push(param + " [" + susTypes.slice(0, -3) + "]");
          susParams = true;
        } else {
          displayedParameters.push(param);
        }
      });

      let charsetWarning = charsetXSS
        ? "CHARSET IS NOT SPECIFIED IN RESPONSE!\n"
        : "";

      reflectionConsoleMsg = `Xnl Reveal: Reflection found in URL ${
        window.location.href
      }\n${charsetWarning}\nReflected Parameters: ${displayedParameters.join(
        ", "
      )}`;
      reflectionAlertMsg = `Xnl Reveal:\n${charsetWarning}\nReflection found in URL ${
        window.location.href
      }\n\nReflected Parameters: ${displayedParameters.join(", ")}`;
      // Send a message to background.js to update the icon badge with the number of parameters found
      chrome.runtime.sendMessage({
        action: "updateBadge",
        number: reflectedParameters.length,
        sus: susParams,
      });

      // Write the info to the devtools panel
      logToDevtools(reflectionConsoleMsg);

      // Copy the info to the clipboard if required
      if (copyToClipboard) {
        copyToClipboardAsync(reflectionConsoleMsg);
      }

      // Display an alert with the parameter names that reflect
      if (showAlerts) {
        alert(reflectionAlertMsg);
      }

      return reflectionConsoleMsg;
    }

    // Use the window.onload event to trigger your code after the page has loaded.
    if (window.onload) {
      const existingOnLoad = window.onload;
      window.onload = function () {
        existingOnLoad();
        runAfterPageLoad();
      };
    } else {
      window.onload = runAfterPageLoad;
    }

    // Check if the window.onload event has already fired
    if (document.readyState === "complete") {
      // If it has, call the function immediately
      runAfterPageLoad();
    } else {
      // If it hasn't, add an event listener for the DOMContentLoaded event
      document.addEventListener("DOMContentLoaded", runAfterPageLoad);

      // Send a message to the background script to remove the scope menu
      chrome.runtime.sendMessage({ action: "removeScopeMenu" });
    }

    // Listen for URL changes (for SPAs that use client-side routing)
    let lastUrl = location.href;
    let urlChangeTimeout;
    let initialLoadComplete = false;

    // Mark initial load as complete after a short delay
    setTimeout(() => {
      initialLoadComplete = true;
    }, 2000);

    // Function to handle URL changes
    function handleUrlChange() {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        console.log(
          "%c🤘Xnl Reveal:%c URL changed to",
          "color: #00ff00; font-weight: bold",
          "color: inherit",
          url
        );

        // Don't trigger on initial load - runAfterPageLoad will handle it
        if (!initialLoadComplete) {
          console.log(
            "%c🤘Xnl Reveal:%c Skipping URL change handler - initial load not complete",
            "color: #00ff00; font-weight: bold",
            "color: inherit"
          );
          return;
        }

        // Debounce: Clear previous timeout and set a new one
        clearTimeout(urlChangeTimeout);
        urlChangeTimeout = setTimeout(() => {
          isHostInScope((inScope) => {
            if (inScope) {
              // Trigger wayback check on URL change
              if (waybackDisabled === "false") {
                console.log(
                  "%c🤘Xnl Reveal:%c Calling writeWaybackEndpoints for new URL",
                  "color: #00ff00; font-weight: bold",
                  "color: inherit"
                );
                writeWaybackEndpoints();
              }

              // Check for reflections if the new URL has parameters
              if (reflectionsDisabled === "false") {
                const params = new URLSearchParams(window.location.search);
                if (params.size > 0) {
                  console.log(
                    "%c🤘Xnl Reveal:%c New URL has parameters, checking for reflections",
                    "color: #00ff00; font-weight: bold",
                    "color: inherit"
                  );
                  // Re-run the reflection check logic
                  const reflectedParameters = [];
                  let successfulRequests = 0;
                  const totalParams = params.size;
                  let paramIndex = 0;

                  params.forEach((value, key) => {
                    paramIndex++; // Increment for each param (whether blacklisted or not)
                    const currentParamNumber = paramIndex; // Capture the index for this specific param
                    let specialChars = "";
                    const blacklistArray = paramBlacklist
                      .split(",")
                      .map((param) => param.trim());
                    if (
                      (blacklistArray.length === 1 &&
                        blacklistArray[0] === key) ||
                      blacklistArray.includes(key)
                    ) {
                      successfulRequests++;
                      return;
                    }

                    const performFetch = (withSpecialChars) => {
                      const modifiedParams = new URLSearchParams(params);
                      if (withSpecialChars && checkSpecialChars) {
                        modifiedParams.set(key, canaryToken + `"'<xnl`);
                      } else {
                        modifiedParams.set(key, canaryToken);
                      }
                      const modifiedURL = `${window.location.origin}${window.location.pathname}?${modifiedParams}`;
                      const modifiedURLForStorage = replaceParameterValues(
                        window.location.href,
                        canaryToken
                      );

                      chrome.storage.local.get(
                        [modifiedURLForStorage, key],
                        ({
                          [modifiedURLForStorage]: urlData,
                          [key]: paramData,
                        }) => {
                          if (!urlData || !paramData) {
                            statusBar.textContent = REFLECTION_STATUS_MESSAGE;
                            document.body.appendChild(statusBar);

                            const timeoutPromise = new Promise(
                              (resolve, reject) => {
                                const timeoutError = new Error(
                                  `Xnl Reveal: Fetch timed out checking param "${key}" for URL: ${modifiedURL}`
                                );
                                setTimeout(() => reject(timeoutError), 30000);
                              }
                            );
                            // Don't log fetching messages
                            // logToDevtools(`Xnl Reveal: Fetching ${modifiedURL}`);

                            Promise.race([fetch(modifiedURL), timeoutPromise])
                              .then((response) => {
                                if (response instanceof Error) {
                                  console.error(
                                    "%c🤘Xnl Reveal:%c Fetch error:",
                                    "color: #00ff00; font-weight: bold",
                                    "color: inherit",
                                    response
                                  );
                                } else {
                                  if (!response.ok) {
                                    console.warn(
                                      `🤘Xnl Reveal: Non-2xx Response (${response.status}) for ${modifiedURL}`
                                    );
                                  }
                                  let contentType =
                                    response.headers.get("content-type") ||
                                    "text/html";

                                  if (
                                    contentType.includes("text/html") &&
                                    !contentType.includes("charset=")
                                  ) {
                                    return response.text().then((text) => {
                                      charsetXSS =
                                        !text.includes("<meta charset=") &&
                                        !text.includes("text/html; charset=");
                                      return text;
                                    });
                                  } else {
                                    charsetXSS = false;
                                    return response.text();
                                  }
                                }
                              })
                              .then((text) => {
                                if (checkSpecialChars && withSpecialChars) {
                                  const canaryRegex = new RegExp(
                                    canaryToken + `.*?(['"<])xnl`
                                  );
                                  const match = canaryRegex.exec(text);

                                  if (match) {
                                    const afterCanary = match[0];
                                    if (afterCanary.includes("'"))
                                      specialChars += "'";
                                    if (afterCanary.includes('"'))
                                      specialChars += '"';
                                    if (afterCanary.includes("<"))
                                      specialChars += "<";

                                    reflectedParameters.push({
                                      key,
                                      specialChars,
                                    });
                                  } else {
                                    // Retry without special characters
                                    performFetch(false);
                                    return;
                                  }
                                }

                                if (specialChars === "") {
                                  if (text.includes(canaryToken)) {
                                    reflectedParameters.push({
                                      key,
                                      specialChars,
                                    });
                                  }
                                }

                                const alertData = {
                                  [modifiedURLForStorage]: true,
                                  [key]: true,
                                };
                                chrome.storage.local.set(alertData);
                                successfulRequests++;

                                if (successfulRequests === params.size) {
                                  if (reflectedParameters.length > 0) {
                                    processReflectedParameters(
                                      reflectedParameters,
                                      charsetXSS
                                    );
                                  }
                                  statusBar.remove();
                                }
                              })
                              .catch((error) => {
                                console.error(
                                  "%c🤘Xnl Reveal:%c Fetch error: " +
                                    error.message,
                                  "color: #00ff00; font-weight: bold",
                                  "color: inherit"
                                );
                                successfulRequests++;
                                if (successfulRequests === params.size) {
                                  statusBar.remove();
                                }
                              });
                          }
                        }
                      );
                    };

                    performFetch(true);
                  });
                }
              }
            }
          });
        }, 500); // Wait 500ms after URL stops changing
      }
    }

    // Watch for DOM mutations (catches some SPA navigation)
    new MutationObserver(handleUrlChange).observe(document, {
      subtree: true,
      childList: true,
    });

    // Listen for popstate events (browser back/forward buttons)
    window.addEventListener("popstate", handleUrlChange);

    // Intercept pushState and replaceState (most common SPA navigation method)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function () {
      originalPushState.apply(this, arguments);
      handleUrlChange();
    };

    history.replaceState = function () {
      originalReplaceState.apply(this, arguments);
      handleUrlChange();
    };

    // Check if the extension is enabled and an option is selected. This will run again after the delay to catch dynamic content
    try {
      if (
        extensionDisabled === "false" &&
        (hiddenDisabled === "false" || disabledDisabled === "false")
      ) {
        // Call isHostInScope with a callback to handle the result
        isHostInScope((inScope) => {
          if (inScope) {
            setTimeout(() => {
              // Show hidden fields if the option is checked
              if (hiddenDisabled === "false") {
                showHiddenElements();
              }
              // Enable disabled fields if the option is checked
              if (disabledDisabled === "false") {
                enableDisabledElements();
              }
            }, Number(checkDelay) * 1000);
          }
        });
      }
    } catch (error) {
      // Handle other errors here
      console.error(
        "%c🤘Xnl Reveal:%c An error occurred:",
        "color: #00ff00; font-weight: bold",
        "color: inherit",
        error
      );
    }
  }
);
