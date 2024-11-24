export function afterHeadAvailable(callback: () => void) {
  if (document.head) {
    callback();
    return;
  }

  const observer = new MutationObserver((_mutations, observer) => {
    if (document.head) {
      observer.disconnect();
      callback();
    }
  });
  observer.observe(document, { childList: true, subtree: true });
}

export function afterDocumentLoaded(callback: () => void) {
  if (document.readyState === "complete") {
    callback();
    return;
  }

  window.addEventListener("load", callback);
}
