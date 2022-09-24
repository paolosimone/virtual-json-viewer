// Ensure Manifest V2 backward compatibility
const chromeAction = chrome.action ?? chrome.browserAction;

chromeAction?.onClicked?.addListener(() => {
  chrome.runtime.openOptionsPage();
});

export {};
