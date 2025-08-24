import { SearchMatchHandler } from "@/viewer/components/RenderedText";
import { RefCurrent } from "@/viewer/hooks";
import { SearchNavigation } from "@/viewer/state";
import { NodeId, TreeHandler } from "./Tree";

export type NavigationOffset = {
  rows?: number;
  pages?: number;
};

export enum NodePart {
  Key = "key",
  Value = "value",
}

export interface TreeNavigatorNodeHandler {
  focus(): void;
  blur(): void;
  listenOnFocus(callback: () => void): void;
  getMatchHandler(
    part: NodePart,
    index: number,
  ): SearchMatchHandler | undefined;
}

export type SearchNavigationCallback = (navigation: SearchNavigation) => void;

type FlattenedSearchMatch = {
  nodeId: NodeId;
  nodePart: NodePart;
  index: number;
};

export class TreeNavigator {
  private tree: RefCurrent<TreeHandler>;
  private treeElem: RefCurrent<HTMLElement>;

  // Nodes navigation
  private handlerById: Map<NodeId, TreeNavigatorNodeHandler> = new Map();
  private lastFocused?: NodeId;

  // Search navigation
  private searchMatches: FlattenedSearchMatch[] = [];
  private searchIndex: Nullable<number> = null;
  private onSearchNavigation?: SearchNavigationCallback;

  constructor(
    tree: RefCurrent<TreeHandler>,
    treeElem: RefCurrent<HTMLElement>,
  ) {
    this.tree = tree;
    this.treeElem = treeElem;
  }

  // Nodes lifecycle

  public onNodeShown(id: NodeId, handler: TreeNavigatorNodeHandler) {
    this.handlerById.set(id, handler);

    // Listen to external focus event (e.g. by mouse click)
    handler.listenOnFocus(() => (this.lastFocused = id));

    // Handle pending navigation
    if (id === this.lastFocused) {
      this.tryFocusCurrent();
    }

    // Handle previous search match selection
    const searchNodeId = this.searchMatches[this.searchIndex ?? -1]?.nodeId;
    if (id === searchNodeId) {
      this.trySelectCurrentSearchMatch();
    }
  }

  public onNodeHidden(id: NodeId) {
    // return focus to parent to avoid inconsistencies
    if (id === this.lastFocused) {
      this.tryBlurCurrent();
      this.treeElem?.focus();
    }

    this.handlerById.delete(id);
  }

  public resize(id: NodeId, height: number) {
    this.tree?.resize(id, height);
  }

  // Openness

  public toggleOpen(id: NodeId) {
    this.tree?.setOpen(id, !this.tree?.isOpen(id));
  }

  public open(id: NodeId) {
    this.tree?.setOpen(id, true);
  }

  public close(id: NodeId) {
    if (this.tree?.isOpen(id)) {
      this.tree?.setOpen(id, false);
      return;
    }

    // if already closed and it has a parent, then close the parent
    const parentId = this.tree?.get(id).parent?.id;
    if (parentId !== undefined) {
      this.goto(parentId);
      this.close(parentId);
    }
  }

  // Nodes navigation

  public gotoOffset(id: NodeId, { rows, pages }: NavigationOffset) {
    const index = this.tree?.indexById(id);
    if (index !== undefined) {
      const target = index + (rows ?? 0) + (pages ?? 0) * this.pageRows();
      this.gotoIndex(target);
    }
  }

  public gotoFirst() {
    this.gotoIndex(0);
  }

  public gotoLast() {
    if (!this.tree?.length()) return;
    this.gotoIndex(this.tree.length() - 1);
  }

  public getCurrentId(): NodeId | undefined {
    if (this.lastFocused !== undefined) {
      return this.lastFocused;
    }

    if (this.tree?.length()) {
      return this.tree.getByIndex(0).id;
    }
  }

  public goto(id: NodeId) {
    // manually mark the node as focused, because
    // the target html element could be outside the virtual list
    this.lastFocused = id;

    this.tree?.scrollTo(id);
    this.tryFocusCurrent();
  }

  private tryFocusCurrent() {
    if (this.lastFocused === undefined) return;
    this.handlerById.get(this.lastFocused)?.focus();
  }

  private tryBlurCurrent() {
    if (this.lastFocused === undefined) return;
    this.handlerById.get(this.lastFocused)?.blur();
    this.lastFocused = undefined;
  }

  private gotoIndex(index: number) {
    if (!this.tree?.length()) return;
    index = Math.max(0, Math.min(index, this.tree.length() - 1));
    const id = this.tree.getByIndex(index).id;
    this.goto(id);
  }

  private pageRows(): number {
    if (!this.tree?.length()) return 0;
    const pageHeight = this.treeElem?.clientHeight;
    const itemHeight = this.tree.getHeight(this.tree.getByIndex(0).id);
    return pageHeight && itemHeight ? Math.ceil(pageHeight / itemHeight) : 1;
  }

  // Search navigation

  public enableSearchNavigation(callback: SearchNavigationCallback) {
    if (!this.tree) return;
    this.onSearchNavigation = callback;
    this.searchMatches = flattenSearchMatches(this.tree);

    if (this.searchMatches.length) {
      this.goToSearchIndex(0);
    } else {
      this.notifySearchNavigation();
    }
  }

  public goToPreviousSearchMatch() {
    if (!this.searchMatches.length) return;
    const previous = (this.searchIndex || this.searchMatches.length) - 1;
    this.goToSearchIndex(previous);
  }

  public goToNextSearchMatch() {
    if (!this.searchMatches.length) return;
    const next = ((this.searchIndex ?? -1) + 1) % this.searchMatches.length;
    this.goToSearchIndex(next);
  }

  private goToSearchIndex(index: number) {
    // Deselect previous match
    if (this.searchIndex !== null) {
      this.getSearchHandler(this.searchIndex)?.setSelected(false);
    }

    // Update current index
    this.searchIndex = index;

    // Blur the current node if it was focused
    this.tryBlurCurrent();

    // Go to the next node
    const nodeId = this.searchMatches[index]!.nodeId;
    this.tree?.scrollTo(nodeId, "center");

    // Select the match inside the node
    this.trySelectCurrentSearchMatch();

    // Notify the change
    this.notifySearchNavigation();
  }

  private trySelectCurrentSearchMatch() {
    if (this.searchIndex === null) return;
    const handler = this.getSearchHandler(this.searchIndex);
    handler?.setSelected(true);
  }

  private getSearchHandler(index: number): SearchMatchHandler | undefined {
    const match = this.searchMatches[index];
    if (!match) return undefined;
    return this.handlerById
      .get(match.nodeId)
      ?.getMatchHandler(match.nodePart, match.index);
  }

  private notifySearchNavigation() {
    if (this.onSearchNavigation) {
      this.onSearchNavigation({
        currentIndex: this.searchIndex,
        totalCount: this.searchMatches.length,
      });
    }
  }
}

function flattenSearchMatches(tree: TreeHandler): FlattenedSearchMatch[] {
  return tree
    .iterAll()
    .flatMap((node) => {
      if (!node.searchMatch) return [];

      return [
        ...node.searchMatch.keyMatches.map((_match, index) => ({
          nodeId: node.id,
          nodePart: NodePart.Key,
          index,
        })),
        ...node.searchMatch.valueMatches.map((_match, index) => ({
          nodeId: node.id,
          nodePart: NodePart.Value,
          index,
        })),
      ];
    })
    .toArray();
}
