export function headAvailable(): Promise<void> {
  return new Promise((resolve) => {
    if (document.head) {
      resolve();
      return;
    }

    const observer = new MutationObserver((_mutations, observer) => {
      if (document.head) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(document, { childList: true, subtree: true });
  });
}

export function documentLoaded(): Promise<void> {
  return new Promise((resolve) => {
    if (document.readyState === "complete") {
      resolve();
      return;
    }

    window.addEventListener("load", resolve as () => void);
  });
}
