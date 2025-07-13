import { TreeWalker } from "../TreeWalker";
import { NodeState } from "./NodeState";

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

    // Keep track of the last visited node in each level
    const lastSiblings = new Map<string | undefined, NodeState>();

    // Keep track of parents with visible children
    const visibleParents = new Set<string>();

    // Depth first walk
    for (const data of treeWalker()) {
      const parent = data.parent ? this.nodeById(data.parent.id) : null;

      // Build the node
      const node: NodeState = {
        id: data.id,
        key: data.key,
        value: data.value,
        parent: parent,
        nesting: parent ? parent.nesting + 1 : 0,
        isOpen: data.isOpenByDefault,
        searchMatch: data.searchMatch,
        // Forward relationships will be resolved by later iterations
        isLeaf: true,
        children: [],
        sibling: null,
      };

      // Register the node in the state
      this.nodesById.set(node.id, node);
      const isVisible = !parent || visibleParents.has(parent.id);
      if (isVisible) {
        this.visibleNodes.push(node.id);

        if (node.isOpen) visibleParents.add(node.id);
      }

      // Bind child to parent
      if (parent) {
        parent.children.push(node);
        parent.isLeaf = false;
      }

      // Bind sibling
      const last = lastSiblings.get(parent?.id);
      if (last) last.sibling = node;
      lastSiblings.set(parent?.id, node);
    }
    this.onStateChange?.(this.cloneRef());
  }

  public setOpen(id: string, open: boolean) {
    const node = this.nodeById(id);

    if (node.isLeaf || node.isOpen === open) {
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
    // The maximum number of nodes that can be added at once with splice
    // is limited by maximum number of arguments in JavaScript, so we chunk.
    let start = this.indexById(node.id) + 1;
    let spliceArgs: [start: number, deleteCount: number, ...string[]] = [
      start,
      0,
    ];

    // Iterates over nodes that will become visible after opening
    const firstChild = node.children[0];
    for (const visibleChild of walkFromNode(firstChild, false)) {
      spliceArgs.push(visibleChild.id);

      if (spliceArgs.length === MAX_APPLY_ARGUMENTS) {
        Array.prototype.splice.apply(this.visibleNodes, spliceArgs);
        start += MAX_APPLY_ARGUMENTS - 2;
        spliceArgs = [start, 0];
      }
    }

    // Add the remaining nodes, if any
    Array.prototype.splice.apply(this.visibleNodes, spliceArgs);
  }

  private close(node: NodeState) {
    const nextNode = node.sibling || node.parent?.sibling;
    const nextIndex = nextNode ? this.indexById(nextNode.id) : Infinity;

    const deleteFrom = this.indexById(node.id) + 1;
    const deleteCount = nextIndex - deleteFrom;

    this.visibleNodes.splice(deleteFrom, deleteCount);
  }
}

function* walkFromNode(
  node: NodeState,
  enterClosed: boolean,
): Generator<NodeState> {
  const stack = [node];

  while (stack.length) {
    const current = stack[stack.length - 1];

    yield current;

    // Advance cursor in the current level
    if (current.sibling) {
      stack[stack.length - 1] = current.sibling;
    } else {
      stack.pop();
    }

    // Possibly enter the inner level
    if (!current.isLeaf && (current.isOpen || enterClosed)) {
      stack.push(current.children[0]);
    }
  }
}

// The actual maximum number of arguments depends on the JavaScript engine,
// this is a conservative limit according to MDN docs and practical tests.
// See e.g. https://stackoverflow.com/questions/22747068/is-there-a-max-number-of-arguments-javascript-functions-can-accept
const MAX_APPLY_ARGUMENTS = 65535;
