/**
 * Background script that detects json requests.
 * It's queried by the content script on every page load.
 *
 * Credits: https://github.com/bhollis/jsonview
 */

const jsonContentType = /^application\/([a-z]+\+)?json($|;)/;

const jsonUrls = new Set<string>();

function isRedirect(status: number): boolean {
  return status >= 300 && status < 400;
}

function isJsonFile(url: string): boolean {
  return url.startsWith("file://") && url.endsWith(".json");
}

function detectJsonRequest(event: chrome.webRequest.WebResponseHeadersDetails) {
  if (!event.responseHeaders || isRedirect(event.statusCode)) {
    return;
  }

  for (const header of event.responseHeaders) {
    if (
      header.name.toLowerCase() === "content-type" &&
      header.value &&
      jsonContentType.test(header.value)
    ) {
      jsonUrls.add(event.url);
    }
  }

  return { responseHeaders: event.responseHeaders };
}

chrome.webRequest.onHeadersReceived.addListener(
  detectJsonRequest,
  { urls: ["<all_urls>"], types: ["main_frame"] },
  ["blocking", "responseHeaders"]
);

chrome.runtime.onMessage.addListener(
  (
    _message: any,
    sender: { url?: string },
    sendResponse: (response: boolean) => void
  ) => {
    if (sender.url === undefined) {
      sendResponse(false);
      return;
    }
    sendResponse(isJsonFile(sender.url) || jsonUrls.has(sender.url));
    jsonUrls.delete(sender.url);
  }
);

export {};
