import { JsonNode } from "./loader/JsonNode";
import { JsonWalker } from "./loader/JsonWalker";

export type NodeState = JsonNode & {
  isOpen: boolean;
  isVisible: boolean;
};

export class TreeState {
  private jsonWalker: JsonWalker;
  private nodesById: Map<string, NodeState> = new Map();
  private visibleNodes: string[] = [];

  constructor(jsonWalker: JsonWalker) {
    this.jsonWalker = jsonWalker;
    this.loadRoots();
  }

  public length(): number {
    return this.visibleNodes.length;
  }

  public idByIndex(index: number): string {
    return this.visibleNodes[index];
  }

  public nodeByIndex(index: number): NodeState {
    return this.nodesById.get(this.visibleNodes[index])!;
  }

  private loadRoots() {
    for (const root of this.jsonWalker()) {
      this.nodesById.set(root.id, {
        ...root,
        isOpen: root.isOpenByDefault,
        isVisible: true,
      });
      this.visibleNodes.push(root.id);
    }
  }
}
