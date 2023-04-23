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
