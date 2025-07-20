import { TreeWalker } from "../TreeWalker";
import { NodeId, NodeState, NodeWalkId } from "./NodeState";

export type StateChangeCallback = (newState: TreeState) => void;

export class TreeState {
  private nodes: NodeState[] = [];
  private visibleNodes: NodeId[] = [];
  private onStateChange: Nullable<StateChangeCallback> = null;

  private cloneRef(): TreeState {
    const newState = new TreeState();
    newState.nodes = this.nodes;
    newState.visibleNodes = this.visibleNodes;
    newState.onStateChange = this.onStateChange;
    return newState;
  }

  private resetState() {
    this.nodes = [];
    this.visibleNodes = [];
  }

  public observeStateChange(callback: StateChangeCallback) {
    this.onStateChange = callback;
  }

  // Accessors

  public nodeByIndex(index: number): NodeState {
    return this.nodeById(this.idByIndex(index));
  }

  public nodeById(id: NodeId): NodeState {
    return this.nodes[id];
  }

  public idByIndex(index: number): NodeId {
    return this.visibleNodes[index];
  }

  public length(): number {
    return this.visibleNodes.length;
  }

  public *iter(): Generator<NodeState> {
    for (const id of this.visibleNodes) {
      yield this.nodeById(id);
    }
  }

  public lenghtAll(): number {
    return this.nodes.length;
  }

  public *iterAll(): Generator<NodeState> {
    yield* this.nodes.values();
  }

  // O(log(N))
  public indexById(id: NodeId): number {
    const arr = this.visibleNodes;
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      if (arr[mid] === id) {
        return mid; // Found
      }

      if (arr[mid] < id) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return -1; // Not found
  }

  // Initialization

  public load(treeWalker: TreeWalker) {
    // Reset state
    this.resetState();

    // Keep track of walked nodes to resolve parent relationships
    const walked = new Map<NodeWalkId, NodeId>();

    // Keep track of the last visited node in each level
    const lastSiblings = new Map<NodeId | undefined, NodeState>();

    // Depth first walk
    for (const data of treeWalker()) {
      const parent = data.parent
        ? this.nodeById(walked.get(data.parent.id)!)
        : null;

      // Build the node
      const node: NodeState = {
        id: this.nodes.length,
        walkId: data.id,
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
      this.nodes.push(node);
      const isVisible = !parent || parent.isOpen;
      if (isVisible) {
        this.visibleNodes.push(node.id);
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

      // Mark the node as walked
      walked.set(node.walkId, node.id);
    }
    this.onStateChange?.(this.cloneRef());
  }

  // Openness

  public openAll() {
    if (!this.visibleNodes.length) return;

    const allNodes: NodeId[] = [];

    const firstRoot = this.nodeById(this.visibleNodes[0]);
    for (const node of walkFromNode(firstRoot, true)) {
      allNodes.push(node.id);
      node.isOpen = !node.isLeaf;
    }

    this.visibleNodes = allNodes;
    this.onStateChange?.(this.cloneRef());
  }

  public closeAll() {
    if (!this.visibleNodes.length) return;

    const onlyRoots: NodeId[] = [];

    const firstRoot = this.nodeById(this.visibleNodes[0]);
    for (const node of walkFromNode(firstRoot, true)) {
      if (!node.parent) {
        onlyRoots.push(node.id);
      }
      node.isOpen = false;
    }

    this.visibleNodes = onlyRoots;
    this.onStateChange?.(this.cloneRef());
  }

  public setOpen(id: NodeId, open: boolean) {
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
    type SpliceArgs = [start: number, deleteCount: number, ...items: NodeId[]];

    let start = this.indexById(node.id) + 1;
    let spliceArgs: SpliceArgs = [start, 0];

    // Iterates over nodes that will become visible after opening
    const firstChild = node.children[0];
    for (const visibleChild of walkFromNode(firstChild, false)) {
      spliceArgs.push(visibleChild.id);

      // The maximum number of nodes that can be added at once with splice
      // is limited by maximum number of arguments in JavaScript, so we chunk.
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
