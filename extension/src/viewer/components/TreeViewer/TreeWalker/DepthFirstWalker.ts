export type DepthFirstWalker<Node> = () => Generator<Node>;
export type LevelWalker<Node> = (parent?: Node) => Generator<Node>;

export function depthFirstWalker<Node>(
  levelWalker: LevelWalker<Node>,
): DepthFirstWalker<Node> {
  return () => iterDepthFirst(levelWalker);
}

export function* iterDepthFirst<Node>(
  levelWalker: LevelWalker<Node>,
): Generator<Node> {
  // Start from root level
  const stack = [levelWalker()];

  // Depth first traversal
  while (stack.length) {
    const level = stack[stack.length - 1].next();

    // This level of the tree was fully walked
    if (level.done) {
      stack.pop();
      continue;
    }

    const node = level.value;

    yield node;

    stack.push(levelWalker(node));
  }
}
