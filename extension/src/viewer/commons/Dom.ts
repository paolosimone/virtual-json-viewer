// html element must be focusable
export function selectAllText(elem: HTMLElement) {
  const range = document.createRange();
  range.selectNode(elem);

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

export function deselectAllText() {
  window.getSelection()?.removeAllRanges();
}

export function isActiveElementEditable(): boolean {
  const activeElement = document.activeElement;
  if (!activeElement) return false;

  const tagName = activeElement.tagName.toLowerCase();
  if (tagName === "input" || tagName === "textarea") {
    return true;
  }

  const contentEditable = activeElement.getAttribute("contenteditable");
  return contentEditable === "true" || contentEditable === "";
}
