"use strict"

// Regex for matching script-containing URLs or POSTdata
const XSS_REGEX = /(<(\s|\+)*\/?(\s|\+)*script.*>|javascript\:)/i

function hasXSS(details) {
  // decodeURIComponent converts percent-encoded URI back
  // to regular text to be matched with the regex
  if (decodeURIComponent(details.url).match(XSS_REGEX)) {
    return true;
  }
  // not all requests have a formdata-type body, only parse
  // the body for those which have one
  if (details.requestBody && details.requestBody.formData) {
    let formData = details.requestBody.formData;
    // iterate through the keys
    for(let key in formData) {
      if (key.match(XSS_REGEX)) {
        return true;
      }
      // iterate through the values
      // (each key can have multiple values, hence we nest loops)
      for(let val of formData[key]) {
        if (val.match(XSS_REGEX)) {
          return true;
        }
      }
    }
  }
}
function handleRequest(details) {
  if (hasXSS(details)) {
    // throw up a simple notification
    chrome.notifications.create({
      "type": "basic",
      "title": "Request Blocked",
      "message": "Possible XSS blocked from:\n" + details.url,
      "iconUrl": "alert-sign.jpg"
    });

    // cancel the request
    return {cancel: true};
  }
  // do nothing, request is fine
}

// Attach `handleRequest` as a handler for webrequests for all
// URLs, with the ability to block and inspect the request body
chrome.webRequest
      .onBeforeRequest
      .addListener(handleRequest,
                   {urls: ["<all_urls>"]},
                   ["blocking", "requestBody"]);
