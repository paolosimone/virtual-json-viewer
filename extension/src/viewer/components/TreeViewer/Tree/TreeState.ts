import { NodeData } from "./NodeData";
import { TreeLevelWalker, TreeWalker } from "./TreeWalker";

export type NodeState = {
  data: NodeData;
  parent: Nullable<NodeState>;
  children: NodeState[];
  sibling: Nullable<NodeState>;
  canOpen: boolean;
  isOpen: boolean;
};

export type StateChangeCallback = (newState: TreeState) => void;

export class TreeState {
  private nodesById: Map<string, NodeState> = new Map();
  private visibleNodes: string[] = [];
  private onStateChange: Nullable<StateChangeCallback> = null;

  private cloneRef(): TreeState {
    const newState = new TreeState();
    newState.nodesById = this.nodesById;
    newState.visibleNodes = this.visibleNodes;
    newState.onStateChange = this.onStateChange;
    return newState;
  }

  public observeStateChange(callback: StateChangeCallback) {
    this.onStateChange = callback;
  }

  public length(): number {
    return this.visibleNodes.length;
  }

  public nodeByIndex(index: number): NodeState {
    return this.nodeById(this.idByIndex(index));
  }

  public nodeById(id: string): NodeState {
    return this.nodesById.get(id)!;
  }

  public idByIndex(index: number): string {
    return this.visibleNodes[index];
  }

  // O(N)
  public indexById(id: string): number {
    return this.visibleNodes.indexOf(id);
  }

  // Builds the initial state by walking the whole tree
  public load(treeWalker: TreeWalker) {
    // Reset state
    this.nodesById.clear();
    this.visibleNodes = [];

    // Start walking the tree from root nodes
    type Level = { walker: TreeLevelWalker; last?: NodeState };
    const stack: Level[] = [{ walker: treeWalker() }];

    // Keep track of parents with visible children
    const visibleParents = new Set<string>();

    // Depth first walk
    while (stack.length) {
      const level = stack[stack.length - 1];

      const walk = level.walker.next();

      // This level of the tree was fully walked
      if (walk.done) {
        stack.pop();
        continue;
      }

      // Build the node
      const data = walk.value;
      const node = {
        data: data,
        parent: data.parent ? this.nodeById(data.parent.id) : null,
        children: [],
        sibling: null,
        canOpen: !data.isLeaf,
        isOpen: data.isOpenByDefault,
      };

      // Register the node in the state
      this.nodesById.set(node.data.id, node);
      const isVisible = !node.parent || visibleParents.has(node.parent.data.id);
      if (isVisible) {
        this.visibleNodes.push(node.data.id);

        if (node.isOpen) visibleParents.add(node.data.id);
      }

      // Bind relationships with previous nodes
      if (node.parent) {
        node.parent.children.push(node);
      }
      if (level.last) {
        level.last.sibling = node;
      }
      level.last = node;

      // If the node has children, push it to the stack
      if (node.canOpen) {
        stack.push({ walker: treeWalker(node.data) });
      }
    }
    this.onStateChange?.(this.cloneRef());
  }

  public setOpen(id: string, open: boolean) {
    const node = this.nodeById(id);

    if (!node.canOpen || node.isOpen === open) {
      return;
    }

    if (open) {
      this.open(node);
    } else {
      this.close(node);
    }

    node.isOpen = open;

    this.onStateChange?.(this.cloneRef());
  }

  private open(node: NodeState) {
    // Nodes that will become visible after opening
    const appeared: string[] = [];

    // Start walking from the opened node's children
    const stack = [node.children.values()];

    while (stack.length) {
      const walk = stack[stack.length - 1].next();

      // This level was fully walked
      if (walk.done) {
        stack.pop();
        continue;
      }

      const node = walk.value;

      appeared.push(node.data.id);

      if (node.isOpen) {
        stack.push(node.children.values());
      }
    }

    // TODO large list optimization
    const addFrom = this.indexById(node.data.id) + 1;
    this.visibleNodes.splice(addFrom, 0, ...appeared);
  }

  private close(node: NodeState) {
    const nextNode = node.sibling || node.parent?.sibling;
    const nextIndex = nextNode ? this.indexById(nextNode.data.id) : Infinity;

    const deleteFrom = this.indexById(node.data.id) + 1;
    const deleteCount = nextIndex - deleteFrom;

    this.visibleNodes.splice(deleteFrom, deleteCount);
  }
}
