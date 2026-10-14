export const treeStudioLessonIds = [
  'tree-introduction',
  'binary-trees',
  'binary-search-trees',
  'tree-traversals',
  'level-order-traversal',
  'bst-insertion',
  'bst-deletion',
  'bst-searching',
  'tree-height-depth',
  'avl-trees',
  'binary-heaps',
  'tries',
];

const MAX_TREE_NODES = 15;

export function parseBinaryTreeLevelOrder(text) {
  const tokens = text.split(',').map((token) => token.trim());
  if (tokens.length === 1 && tokens[0] === '') {
    throw new Error('Enter integer node values separated by commas; use # for a missing child.');
  }

  const values = tokens.map((token) => {
    if (token === '#') return null;
    if (!/^[+-]?\d+$/.test(token) || !Number.isSafeInteger(Number(token))) {
      throw new Error('Use comma-separated safe integers and # for missing children (for example: 50, 30, 70, #, 40).');
    }
    return Number(token);
  });

  if (values[0] === null) {
    if (values.slice(1).some((value) => value !== null)) {
      throw new Error('A tree with a missing root cannot contain other nodes.');
    }
    return { root: null, nodes: [] };
  }

  const nodes = [{ id: 0, value: values[0], left: null, right: null, parent: null, depth: 0 }];
  const parents = [nodes[0]];
  let tokenIndex = 1;

  while (parents.length > 0 && tokenIndex < values.length) {
    const parent = parents.shift();
    for (const side of ['left', 'right']) {
      if (tokenIndex >= values.length) break;
      const value = values[tokenIndex];
      tokenIndex += 1;
      if (value === null) continue;

      const node = {
        id: nodes.length,
        value,
        left: null,
        right: null,
        parent: parent.id,
        depth: parent.depth + 1,
      };
      parent[side] = node.id;
      nodes.push(node);
      parents.push(node);
      if (nodes.length > MAX_TREE_NODES) {
        throw new Error(`Keep the tree to ${MAX_TREE_NODES} nodes or fewer so every node stays readable.`);
      }
    }
  }

  if (values.slice(tokenIndex).some((value) => value !== null)) {
    throw new Error('A node cannot appear after all available parent positions are empty.');
  }

  return { root: nodes[0], nodes };
}

function validateTree(tree) {
  if (!tree || !Array.isArray(tree.nodes)) {
    throw new Error('Provide a parsed binary tree.');
  }
}

function createTreeStepRecorder(tree) {
  const steps = [];
  const visited = [];
  return (event) => {
    steps.push({
      step: steps.length + 1,
      nodeId: null,
      visited: [...visited],
      callStack: [],
      queue: [],
      lineIds: [],
      ...event,
      visited: event.visited ? [...event.visited] : [...visited],
      callStack: event.callStack ? [...event.callStack] : [],
      queue: event.queue ? [...event.queue] : [],
      tree,
    });
  };
}

const traversalSource = {
  preorder: {
    python: [
      ['setup', 'def preorder(node):'],
      ['null-check', '    if node is None:'],
      ['null-return', '        return'],
      ['visit', '    visit(node)'],
      ['left-call', '    preorder(node.left)'],
      ['right-call', '    preorder(node.right)'],
      ['return', '    return'],
    ],
    java: [
      ['setup', 'void preorder(Node node) {'],
      ['null-check', '    if (node == null) {'],
      ['null-return', '        return;'],
      [null, '    }'],
      ['visit', '    visit(node);'],
      ['left-call', '    preorder(node.left);'],
      ['right-call', '    preorder(node.right);'],
      ['return', '    return;'],
      [null, '}'],
    ],
  },
  inorder: {
    python: [
      ['setup', 'def inorder(node):'],
      ['null-check', '    if node is None:'],
      ['null-return', '        return'],
      ['left-call', '    inorder(node.left)'],
      ['visit', '    visit(node)'],
      ['right-call', '    inorder(node.right)'],
      ['return', '    return'],
    ],
    java: [
      ['setup', 'void inorder(Node node) {'],
      ['null-check', '    if (node == null) {'],
      ['null-return', '        return;'],
      [null, '    }'],
      ['left-call', '    inorder(node.left);'],
      ['visit', '    visit(node);'],
      ['right-call', '    inorder(node.right);'],
      ['return', '    return;'],
      [null, '}'],
    ],
  },
  postorder: {
    python: [
      ['setup', 'def postorder(node):'],
      ['null-check', '    if node is None:'],
      ['null-return', '        return'],
      ['left-call', '    postorder(node.left)'],
      ['right-call', '    postorder(node.right)'],
      ['visit', '    visit(node)'],
      ['return', '    return'],
    ],
    java: [
      ['setup', 'void postorder(Node node) {'],
      ['null-check', '    if (node == null) {'],
      ['null-return', '        return;'],
      [null, '    }'],
      ['left-call', '    postorder(node.left);'],
      ['right-call', '    postorder(node.right);'],
      ['visit', '    visit(node);'],
      ['return', '    return;'],
      [null, '}'],
    ],
  },
};

const levelOrderSource = {
  python: [
    ['setup', 'def level_order(root):'],
    ['empty-check', '    if root is None:'],
    ['return-empty', '        return []'],
    ['initialize-queue', '    queue = deque([root])'],
    ['loop', '    while queue:'],
    ['dequeue', '        node = queue.popleft()'],
    ['visit', '        visit(node)'],
    ['left-child', '        if node.left is not None:'],
    ['enqueue-left', '            queue.append(node.left)'],
    ['right-child', '        if node.right is not None:'],
    ['enqueue-right', '            queue.append(node.right)'],
  ],
  java: [
    ['setup', 'void levelOrder(Node root) {'],
    ['empty-check', '    if (root == null) {'],
    ['return-empty', '        return;'],
    [null, '    }'],
    ['initialize-queue', '    Queue<Node> queue = new ArrayDeque<>();'],
    ['initialize-queue', '    queue.add(root);'],
    ['loop', '    while (!queue.isEmpty()) {'],
    ['dequeue', '        Node node = queue.remove();'],
    ['visit', '        visit(node);'],
    ['left-child', '        if (node.left != null) {'],
    ['enqueue-left', '            queue.add(node.left);'],
    [null, '        }'],
    ['right-child', '        if (node.right != null) {'],
    ['enqueue-right', '            queue.add(node.right);'],
    [null, '        }'],
    [null, '    }'],
    [null, '}'],
  ],
};

export function getTreeTraversalCode(order, language = 'python') {
  const source = order === 'level-order' ? levelOrderSource : traversalSource[order];
  if (!source || !source[language]) {
    throw new Error('Choose preorder, inorder, postorder, or level-order traversal.');
  }
  const lines = source[language];
  return {
    code: lines.map(([, line]) => line).join('\n'),
    lineIds: [null, ...lines.map(([id]) => id)],
  };
}

function createDepthFirstSteps(tree, order) {
  validateTree(tree);
  if (!traversalSource[order]) throw new Error('Choose preorder, inorder, or postorder traversal.');
  const steps = [];
  const visited = [];
  const callStack = [];
  const record = (event) => {
    steps.push({
      step: steps.length + 1,
      nodeId: null,
      visited: [...visited],
      callStack: [...callStack],
      queue: [],
      lineIds: [],
      ...event,
      visited: [...visited],
      callStack: [...callStack],
      tree,
    });
  };

  record({
    lineIds: ['setup'],
    operation: `Start ${order} traversal at the root`,
    explanation: 'A recursive call follows the tree links; the call stack remembers which nodes still need work.',
  });

  function walk(nodeId, side) {
    const node = nodeId === null ? null : tree.nodes[nodeId];
    if (node) callStack.push(nodeId);
    record({
      nodeId,
      lineIds: node ? [side === 'left-call' ? 'left-call' : side === 'right-call' ? 'right-call' : 'setup'] : ['null-check'],
      operation: node ? `Call ${order}(${node.value})` : 'Check an empty child',
      explanation: node ? `Push node ${node.value} onto the recursion stack before exploring it.` : 'This child pointer is empty, so its recursive call returns immediately.',
    });
    if (!node) {
      record({ lineIds: ['null-return'], operation: 'Return from the empty child', explanation: 'There is no node to visit or explore below this pointer.' });
      return;
    }

    record({ nodeId, lineIds: ['null-check'], operation: `Check node ${node.value}`, explanation: 'The node exists, so continue in the order chosen for this traversal.' });
    if (order === 'preorder') visit(node);
    walk(node.left, 'left-call');
    if (order === 'inorder') visit(node);
    walk(node.right, 'right-call');
    if (order === 'postorder') visit(node);
    callStack.pop();
    record({ nodeId, lineIds: ['return'], operation: `Return from node ${node.value}`, explanation: 'Both child subtrees are complete, so this recursive call can return to its parent.' });
  }

  function visit(node) {
    visited.push(node.id);
    record({
      nodeId: node.id,
      lineIds: ['visit'],
      operation: `Visit ${node.value}`,
      explanation: `${order[0].toUpperCase()}${order.slice(1)} visits this node at this point in the recursive left/node/right order.`,
    });
  }

  if (tree.root) walk(tree.root.id, 'root');
  record({
    lineIds: ['return'],
    operation: `${order[0].toUpperCase()}${order.slice(1)} traversal is complete`,
    explanation: `The visited sequence is ${visited.map((id) => tree.nodes[id].value).join(' → ') || '(empty tree)'}.`,
    complete: true,
    result: visited.map((id) => tree.nodes[id].value),
  });
  return steps;
}

export function createTreeTraversalSteps(tree, order = 'inorder') {
  if (order !== 'level-order') return createDepthFirstSteps(tree, order);
  validateTree(tree);
  const steps = [];
  const visited = [];
  const queue = [];
  const record = (event) => steps.push({
    step: steps.length + 1,
    nodeId: null,
    visited: [...visited],
    callStack: [],
    queue: [...queue],
    lineIds: [],
    ...event,
    visited: [...visited],
    queue: [...queue],
    tree,
  });

  record({
    lineIds: ['setup'],
    operation: 'Start level-order traversal',
    explanation: 'A queue visits nodes by distance from the root, one level at a time.',
  });
  if (tree.root) {
    queue.push(tree.root.id);
    record({
      nodeId: tree.root.id,
      lineIds: ['initialize-queue'],
      operation: `Enqueue root ${tree.root.value}`,
      explanation: 'The root is first in the queue because it is the first node on level 0.',
    });
  }
  while (queue.length > 0) {
    const nodeId = queue.shift();
    const node = tree.nodes[nodeId];
    record({
      nodeId,
      lineIds: ['dequeue'],
      operation: `Dequeue ${node.value}`,
      explanation: 'Remove the oldest queued node so nodes are processed in breadth-first order.',
    });
    visited.push(nodeId);
    record({
      nodeId,
      lineIds: ['visit'],
      operation: `Visit ${node.value}`,
      explanation: `Append ${node.value} to the traversal sequence before adding its children.`,
    });
    for (const [side, childId] of [['left', node.left], ['right', node.right]]) {
      record({
        nodeId,
        lineIds: [side === 'left' ? 'left-child' : 'right-child'],
        operation: `Check ${side} child of ${node.value}`,
        explanation: childId === null ? `Node ${node.value} has no ${side} child to add.` : `The ${side} child exists and will join the back of the queue.`,
      });
      if (childId === null) continue;
      queue.push(childId);
      const child = tree.nodes[childId];
      record({
        nodeId: childId,
        lineIds: [side === 'left' ? 'enqueue-left' : 'enqueue-right'],
        operation: `Enqueue ${side} child ${child.value}`,
        explanation: `Add the ${side} child to the queue; it will be visited after nodes already waiting.`,
      });
    }
  }
  record({
    lineIds: ['loop'],
    operation: 'Level-order traversal is complete',
    explanation: `The visited sequence is ${visited.map((id) => tree.nodes[id].value).join(' → ') || '(empty tree)'}.`,
    complete: true,
    result: visited.map((id) => tree.nodes[id].value),
  });
  return steps;
}

const bstSource = {
  python: [
    ['setup', 'def is_bst(node, low, high):'],
    ['empty', '    if node is None:'],
    ['empty-return', '        return True'],
    ['bounds', '    if not (low < node.value < high):'],
    ['invalid-return', '        return False'],
    ['left', '    if not is_bst(node.left, low, node.value):'],
    ['left-return', '        return False'],
    ['right', '    return is_bst(node.right, node.value, high)'],
  ],
  java: [
    ['setup', 'boolean isBst(Node node, long low, long high) {'],
    ['empty', '    if (node == null) {'],
    ['empty-return', '        return true;'],
    [null, '    }'],
    ['bounds', '    if (node.value <= low || node.value >= high) {'],
    ['invalid-return', '        return false;'],
    [null, '    }'],
    ['left', '    if (!isBst(node.left, low, node.value)) {'],
    ['left-return', '        return false;'],
    [null, '    }'],
    ['right', '    return isBst(node.right, node.value, high);'],
    [null, '}'],
  ],
};

export function getBstValidationCode(language = 'python') {
  const lines = bstSource[language];
  if (!lines) throw new Error('Choose Python or Java source code.');
  return {
    code: lines.map(([, line]) => line).join('\n'),
    lineIds: [null, ...lines.map(([id]) => id)],
  };
}

const bstInsertionSource = {
  python: [
    ['setup', 'def insert(root, value):'],
    ['empty', '    if root is None:'],
    ['root-insert', '        return Node(value)'],
    ['current', '    current = root'],
    ['loop', '    while current is not None:'],
    ['compare', '        if value == current.value:'],
    ['duplicate', '            return root  # duplicate values are not inserted'],
    ['left', '        elif value < current.value:'],
    ['left-move', '            if current.left is None:'],
    ['left-insert', '                current.left = Node(value)'],
    ['left-return', '                return root'],
    ['left-next', '            current = current.left'],
    ['right', '        else:'],
    ['right-move', '            if current.right is None:'],
    ['right-insert', '                current.right = Node(value)'],
    ['right-return', '                return root'],
    ['right-advance', '            current = current.right'],
    ['return', '    return root'],
  ],
  java: [
    ['setup', 'Node insert(Node root, int value) {'],
    ['empty', '    if (root == null) {'],
    ['root-insert', '        return new Node(value);'],
    [null, '    }'],
    ['current', '    Node current = root;'],
    ['loop', '    while (current != null) {'],
    ['compare', '        if (value == current.value) {'],
    ['duplicate', '            return root;'],
    [null, '        }'],
    ['left', '        if (value < current.value) {'],
    ['left-move', '            if (current.left == null) {'],
    ['left-insert', '                current.left = new Node(value);'],
    ['left-return', '                return root;'],
    ['left-next', '            } else { current = current.left; }'],
    ['right', '        } else {'],
    ['right-move', '            if (current.right == null) {'],
    ['right-insert', '                current.right = new Node(value);'],
    ['right-return', '                return root;'],
    ['right-advance', '            } else { current = current.right; }'],
    [null, '        }'],
    [null, '    }'],
    ['return', '    return root;'],
    [null, '}'],
  ],
};

export function getBstInsertionCode(language = 'python') {
  const lines = bstInsertionSource[language];
  if (!lines) throw new Error('Choose Python or Java source code.');
  return {
    code: lines.map(([, line]) => line).join('\n'),
    lineIds: [null, ...lines.map(([id]) => id)],
  };
}

export function createBstValidationSteps(tree) {
  validateTree(tree);
  const steps = [];
  const callStack = [];
  const visited = [];
  let offendingValue = null;
  const record = (event) => steps.push({
    step: steps.length + 1,
    nodeId: null,
    visited: [...visited],
    callStack: [...callStack],
    queue: [],
    lineIds: [],
    ...event,
    visited: [...visited],
    callStack: [...callStack],
    tree,
  });

  record({
    lineIds: ['setup'],
    operation: 'Check whether the tree follows the BST ordering rule',
    explanation: 'Every value in a node’s left subtree must be smaller, and every value in its right subtree must be larger.',
  });

  function validate(nodeId, low, high, side) {
    const node = nodeId === null ? null : tree.nodes[nodeId];
    if (!node) {
      record({ lineIds: ['empty'], operation: 'Check an empty child', explanation: 'An empty subtree satisfies the BST rule.' });
      record({ lineIds: ['empty-return'], operation: 'Return true for the empty subtree', explanation: 'There are no values here that can violate the ordering rule.' });
      return true;
    }

    callStack.push(node.id);
    visited.push(node.id);
    record({
      nodeId,
      lineIds: [side ?? 'setup'],
      operation: `Check node ${node.value} in the range (${low}, ${high})`,
      explanation: `This node must be greater than ${low} and less than ${high}; ancestor limits apply to the whole subtree.`,
      low,
      high,
    });
    record({
      nodeId,
      lineIds: ['bounds'],
      operation: `Test ${low} < ${node.value} < ${high}`,
      explanation: 'A node must satisfy both inherited bounds, not just compare correctly with its parent.',
      low,
      high,
      valid: node.value > low && node.value < high,
    });
    if (!(node.value > low && node.value < high)) {
      offendingValue = node.value;
      record({
        nodeId,
        lineIds: ['invalid-return'],
        operation: `${node.value} violates the BST bounds`,
        explanation: `This value is outside its allowed range (${low}, ${high}), so this tree is not a BST.`,
        low,
        high,
      });
      callStack.pop();
      return false;
    }

    if (!validate(node.left, low, node.value, 'left')) {
      callStack.pop();
      record({ nodeId, lineIds: ['left-return'], operation: `Propagate the failure from the left subtree of ${node.value}`, explanation: 'A parent is also invalid as a BST when either child subtree is invalid.' });
      return false;
    }
    const isRightValid = validate(node.right, node.value, high, 'right');
    callStack.pop();
    return isRightValid;
  }

  const isBst = tree.root ? validate(tree.root.id, -Infinity, Infinity, null) : true;
  record({
    lineIds: [isBst ? 'right' : 'invalid-return'],
    operation: isBst ? 'The tree satisfies the BST ordering rule' : `The tree is not a BST (first offending value: ${offendingValue})`,
    explanation: isBst
      ? 'Every node fits the lower and upper bounds inherited from its ancestors.'
      : `The value ${offendingValue} is outside the valid range for its position.`,
    complete: true,
    result: { isBst, offendingValue },
  });
  return steps;
}

export function getTreeLayout(tree, width = 800, top = 56, levelGap = 92) {
  validateTree(tree);
  if (!tree.root) return { positions: {}, height: top + 20 };
  const positions = {};
  let inorderIndex = 0;
  function position(nodeId, depth) {
    if (nodeId === null) return;
    const node = tree.nodes[nodeId];
    position(node.left, depth + 1);
    inorderIndex += 1;
    positions[nodeId] = {
      x: (inorderIndex * width) / (tree.nodes.length + 1),
      y: top + depth * levelGap,
    };
    position(node.right, depth + 1);
  }
  position(tree.root.id, 0);
  return {
    positions,
    height: top + (Math.max(...tree.nodes.map((node) => node.depth)) + 1) * levelGap,
  };
}

export function createBstInsertionSteps(tree, value) {
  validateTree(tree);
  if (!Number.isSafeInteger(value)) {
    throw new Error('Enter a valid safe integer to insert.');
  }
  if (!createBstValidationSteps(tree).at(-1)?.result?.isBst) {
    throw new Error('The existing tree must be a valid BST before insertion.');
  }

  const steps = [];
  const nodes = tree.nodes.map((node) => ({ ...node }));
  const visited = [];
  const snapshotTree = () => {
    const snapshotNodes = nodes.map((node) => ({ ...node }));
    return { root: snapshotNodes[0] ?? null, nodes: snapshotNodes };
  };
  const visit = (message, nodeId = null, extra = {}) => {
    steps.push({
      step: steps.length + 1,
      nodeId,
      operation: message,
      visited: [...visited],
      explanation: extra.explanation ?? message,
      result: nodes.map((node) => node.value),
      tree: snapshotTree(),
      ...extra,
    });
  };

  visit(
    `Start inserting ${value} into the BST.`,
    null,
    { lineIds: ['setup'], explanation: 'Begin at the root and follow the BST ordering rule.' },
  );

  if (!nodes.length) {
    nodes.push({ id: 0, value, left: null, right: null, parent: null, depth: 0 });
    visited.push(0);
    visit(`Insert ${value} as the root node.`, 0, {
      lineIds: ['root-insert'],
      explanation: 'The tree is empty, so the new value becomes its root.',
      complete: true,
      insertedValue: value,
      result: [value],
    });
    return steps;
  }

  let current = 0;
  while (current !== null) {
    const node = nodes[current];
    visited.push(current);
    visit(`Compare ${value} with ${node.value}.`, current, {
      lineIds: ['compare'],
      currentValue: node.value,
      explanation: `${value} is compared with the current node ${node.value}.`,
    });
    if (value === node.value) {
      visit(`${value} is already in the BST; no node was added.`, current, {
        lineIds: ['duplicate'],
        currentValue: node.value,
        duplicate: true,
        complete: true,
        result: nodes.map((entry) => entry.value),
        explanation: 'This BST stores unique values, so a duplicate leaves the tree unchanged.',
      });
      return steps;
    }

    if (value < node.value) {
      const childId = node.left;
      visit(`Move left from ${node.value}.`, current, {
        lineIds: childId === null ? ['left', 'left-move'] : ['left', 'left-next'],
        direction: 'left',
        edge: childId === null ? undefined : [current, childId],
        currentValue: node.value,
        explanation: `${value} is smaller than ${node.value}, so follow the left branch.`,
      });
      if (childId === null) {
        if (nodes.length >= MAX_TREE_NODES) {
          throw new Error(`BST insertion supports ${MAX_TREE_NODES} nodes or fewer.`);
        }
        const newNode = { id: nodes.length, value, left: null, right: null, parent: current, depth: node.depth + 1 };
        node.left = newNode.id;
        nodes.push(newNode);
        visited.push(newNode.id);
        visit(`Insert ${value} as the left child of ${node.value}.`, newNode.id, {
          lineIds: ['left-insert'],
          direction: 'left',
          currentValue: node.value,
          complete: true,
          insertedValue: value,
          result: nodes.map((entry) => entry.value),
          explanation: 'The left child position is empty, so the new node is linked here.',
        });
        return steps;
      }
      current = childId;
    } else {
      const childId = node.right;
      visit(`Move right from ${node.value}.`, current, {
        lineIds: childId === null ? ['right', 'right-move'] : ['right', 'right-advance'],
        direction: 'right',
        edge: childId === null ? undefined : [current, childId],
        currentValue: node.value,
        explanation: `${value} is greater than ${node.value}, so follow the right branch.`,
      });
      if (childId === null) {
        if (nodes.length >= MAX_TREE_NODES) {
          throw new Error(`BST insertion supports ${MAX_TREE_NODES} nodes or fewer.`);
        }
        const newNode = { id: nodes.length, value, left: null, right: null, parent: current, depth: node.depth + 1 };
        node.right = newNode.id;
        nodes.push(newNode);
        visited.push(newNode.id);
        visit(`Insert ${value} as the right child of ${node.value}.`, newNode.id, {
          lineIds: ['right-insert'],
          direction: 'right',
          currentValue: node.value,
          complete: true,
          insertedValue: value,
          result: nodes.map((entry) => entry.value),
          explanation: 'The right child position is empty, so the new node is linked here.',
        });
        return steps;
      }
      current = childId;
    }
  }

  return steps;
}

export function createBstDeletionSteps(tree, value) {
  validateTree(tree);
  if (!Number.isSafeInteger(value)) {
    throw new Error('Enter a valid safe integer to delete.');
  }
  if (!createBstValidationSteps(tree).at(-1)?.result?.isBst) {
    throw new Error('The existing tree must be a valid BST before deletion.');
  }

  const steps = [];
  const nodes = tree.nodes.map((node) => ({ ...node }));
  let rootId = tree.root?.id ?? null;
  const path = [];
  const pathValues = [];
  let comparisons = 0;

  const refreshDepths = () => {
    const assignDepth = (nodeId, parentId, depth) => {
      if (nodeId === null) return;
      const node = nodes[nodeId];
      node.parent = parentId;
      node.depth = depth;
      assignDepth(node.left, nodeId, depth + 1);
      assignDepth(node.right, nodeId, depth + 1);
    };
    assignDepth(rootId, null, 0);
  };

  const createSnapshot = () => {
    const snapshotNodes = [];
    const idMap = new Map();
    const copySubtree = (nodeId, parent, depth) => {
      if (nodeId === null) return null;
      const node = nodes[nodeId];
      const snapshotId = snapshotNodes.length;
      idMap.set(nodeId, snapshotId);
      const copy = { id: snapshotId, value: node.value, left: null, right: null, parent, depth };
      snapshotNodes.push(copy);
      copy.left = copySubtree(node.left, snapshotId, depth + 1);
      copy.right = copySubtree(node.right, snapshotId, depth + 1);
      return snapshotId;
    };
    const snapshotRootId = copySubtree(rootId, null, 0);
    const root = snapshotRootId === null ? null : snapshotNodes[snapshotRootId];
    return { tree: { root, nodes: snapshotNodes }, idMap };
  };

  const getInorderValues = (nodeId = rootId, values = []) => {
    if (nodeId === null) return values;
    getInorderValues(nodes[nodeId].left, values);
    values.push(nodes[nodeId].value);
    getInorderValues(nodes[nodeId].right, values);
    return values;
  };

  const visit = (message, nodeId = null, extra = {}) => {
    const { tree: snapshot, idMap } = createSnapshot();
    const { edge: sourceEdge, result: resultOverride, ...stepExtra } = extra;
    const mappedNode = idMap.get(nodeId) ?? null;
    const mappedEdge = sourceEdge?.every((id) => idMap.has(id))
      ? sourceEdge.map((id) => idMap.get(id))
      : undefined;
    const result = {
      deleted: false,
      value,
      values: getInorderValues(),
      path: [...pathValues],
      comparisons,
      ...(resultOverride ?? {}),
    };
    steps.push({
      step: steps.length + 1,
      nodeId: mappedNode,
      operation: message,
      explanation: extra.explanation ?? message,
      visited: path.map((id) => idMap.get(id)).filter((id) => id !== undefined),
      path: path.map((id) => idMap.get(id)).filter((id) => id !== undefined),
      pathValues: [...pathValues],
      comparisons,
      lineIds: [],
      result,
      tree: snapshot,
      ...stepExtra,
      ...(mappedEdge ? { edge: mappedEdge } : {}),
    });
  };

  visit(`Start deleting ${value} by searching from the root.`, rootId, {
    lineIds: ['setup'],
    explanation: 'Follow the BST comparisons from the root until the target is found or its search branch is empty.',
  });

  if (rootId === null) {
    visit(`Element Not Found: ${value} is not in the empty tree.`, null, {
      lineIds: ['missing'],
      complete: true,
      result: { deleted: false, deletionCase: null },
      explanation: 'There is no root to search, so the empty tree remains unchanged.',
    });
    return steps;
  }

  let currentId = rootId;
  let parentId = null;
  while (currentId !== null) {
    const node = nodes[currentId];
    path.push(currentId);
    pathValues.push(node.value);
    comparisons += 1;
    visit(`Compare ${value} with node ${node.value}.`, currentId, {
      lineIds: ['search-loop', 'compare'],
      currentValue: node.value,
      target: value,
      explanation: `Comparison ${comparisons}: compare the value to delete with ${node.value}.`,
    });
    if (value === node.value) break;

    parentId = currentId;
    const direction = value < node.value ? 'left' : 'right';
    const childId = node[direction];
    visit(
      childId === null
        ? `${value} is ${direction === 'left' ? 'smaller' : 'larger'} than ${node.value}; the ${direction} child is empty.`
        : `Move ${direction} from ${node.value}.`,
      currentId,
      {
        lineIds: direction === 'left' ? ['left', 'search-left'] : ['right', 'search-right'],
        direction,
        edge: childId === null ? undefined : [currentId, childId],
        explanation: `${value} is ${direction === 'left' ? 'smaller' : 'larger'} than ${node.value}, so only the ${direction} subtree can contain it.`,
      },
    );
    currentId = childId;
  }

  if (currentId === null) {
    visit(`Element Not Found: ${value} is not in the BST.`, path.at(-1) ?? null, {
      lineIds: ['missing'],
      complete: true,
      result: { deleted: false, deletionCase: null },
      explanation: 'The required child link is empty, so the value is not present and the tree stays unchanged.',
    });
    return steps;
  }

  const target = nodes[currentId];
  const hasLeft = target.left !== null;
  const hasRight = target.right !== null;

  const reconnectParent = (replacementId) => {
    if (parentId === null) {
      rootId = replacementId;
    } else if (nodes[parentId].left === currentId) {
      nodes[parentId].left = replacementId;
    } else {
      nodes[parentId].right = replacementId;
    }
    if (replacementId !== null) nodes[replacementId].parent = parentId;
  };

  if (!hasLeft && !hasRight) {
    visit(`Node ${target.value} is a leaf.`, currentId, {
      lineIds: ['case-leaf'],
      deletionCase: 'leaf',
      explanation: 'This node has no children, so it can be safely detached from its parent.',
    });
    reconnectParent(null);
    refreshDepths();
    visit(`Remove leaf ${target.value} by setting its parent link to empty.`, parentId, {
      lineIds: ['unlink-leaf', 'finish'],
      complete: true,
      result: { deleted: true, deletedValue: value, deletionCase: 'leaf' },
      explanation: parentId === null
        ? 'The deleted leaf was the root, so the tree now has no root.'
        : 'The parent no longer points to this leaf; all remaining node links stay unchanged.',
    });
    return steps;
  }

  if (hasLeft !== hasRight) {
    const childId = hasLeft ? target.left : target.right;
    const child = nodes[childId];
    visit(`Node ${target.value} has one child: ${child.value}.`, currentId, {
      lineIds: ['case-one'],
      deletionCase: 'one-child',
      explanation: 'Connect the parent directly to the only child; no other subtree needs restructuring.',
    });
    reconnectParent(childId);
    refreshDepths();
    visit(`Replace ${target.value}'s parent link with child ${child.value}.`, childId, {
      lineIds: [...(parentId === null ? ['set-root'] : ['replace-child']), 'finish'],
      complete: true,
      result: { deleted: true, deletedValue: value, deletionCase: 'one-child' },
      explanation: parentId === null
        ? `${child.value} becomes the new root.`
        : `The parent now points directly to ${child.value}, preserving the remaining subtree.`,
    });
    return steps;
  }

  visit(`Node ${target.value} has two children; find its inorder successor.`, currentId, {
    lineIds: ['case-two', 'successor-start'],
    deletionCase: 'two-children',
    explanation: 'The inorder successor is the smallest value in the target node’s right subtree.',
  });

  let successorId = target.right;
  let successorParentId = currentId;
  visit(`Start the successor search at right child ${nodes[successorId].value}.`, successorId, {
    lineIds: ['successor-start'],
    explanation: 'The successor must be in the right subtree; now follow left links to its smallest node.',
  });
  while (nodes[successorId].left !== null) {
    const nextSuccessorId = nodes[successorId].left;
    visit(`Successor candidate ${nodes[successorId].value} has a left child; move left.`, successorId, {
      lineIds: ['successor-loop', 'successor-left'],
      edge: [successorId, nextSuccessorId],
      explanation: `A smaller value in this right subtree may be closer to ${target.value}, so continue left.`,
    });
    successorParentId = successorId;
    successorId = nextSuccessorId;
  }

  const successor = nodes[successorId];
  visit(`Inorder successor is ${successor.value}.`, successorId, {
    lineIds: ['successor-found'],
    successorValue: successor.value,
    explanation: `${successor.value} is the leftmost value in the right subtree, so it is the next value after ${target.value}.`,
  });

  target.value = successor.value;
  if (successorParentId === currentId) {
    target.right = successor.right;
  } else {
    nodes[successorParentId].left = successor.right;
  }
  if (successor.right !== null) nodes[successor.right].parent = successorParentId;
  refreshDepths();
  visit(`Replace ${value} with successor ${successor.value} and remove the successor node.`, currentId, {
    lineIds: ['replace-value', 'remove-successor', 'finish'],
    successorValue: successor.value,
    complete: true,
    result: { deleted: true, deletedValue: value, deletionCase: 'two-children', successorValue: successor.value },
    explanation: `Copy ${successor.value} into the deleted node, then reconnect its parent to the successor’s right child (if any). The BST ordering is preserved.`,
  });
  return steps;
}

const bstDeletionSource = {
  python: [
    ['setup', 'def delete(root, value):'],
    ['search-loop', '    while current is not None:'],
    ['compare', '        if value == current.value:'],
    ['left', '        if value < current.value:'],
    ['search-left', '            current = current.left'],
    ['right', '        else:'],
    ['search-right', '            current = current.right'],
    ['case-leaf', '    if node.left is None and node.right is None:'],
    ['unlink-leaf', '        parent.left = None  # or parent.right = None'],
    ['case-one', '    elif node.left is None or node.right is None:'],
    ['replace-child', '        replace node with its only child'],
    ['set-root', '        root = node.left or node.right'],
    ['case-two', '    else:'],
    ['successor-start', '        successor = node.right'],
    ['successor-loop', '        while successor.left is not None:'],
    ['successor-left', '            successor = successor.left'],
    ['successor-found', '        # successor is the leftmost node'],
    ['replace-value', '        node.value = successor.value'],
    ['remove-successor', '        unlink successor from its parent'],
    ['finish', '    return root'],
    ['missing', '    return root  # value was not found'],
  ],
  java: [
    ['setup', 'Node delete(Node root, int value) {'],
    ['search-loop', '    while (current != null) {'],
    ['compare', '        if (value == current.value) break;'],
    ['left', '        if (value < current.value) {'],
    ['search-left', '            current = current.left;'],
    ['right', '        } else {'],
    ['search-right', '            current = current.right;'],
    [null, '        }'],
    [null, '    }'],
    ['case-leaf', '    if (node.left == null && node.right == null) {'],
    ['unlink-leaf', '        parent.left = null; // or parent.right = null'],
    [null, '    }'],
    ['case-one', '    else if (node.left == null || node.right == null) {'],
    ['replace-child', '        replace node with its only child;'],
    ['set-root', '        root = node.left != null ? node.left : node.right;'],
    [null, '    }'],
    ['case-two', '    else {'],
    ['successor-start', '        Node successor = node.right;'],
    ['successor-loop', '        while (successor.left != null) {'],
    ['successor-left', '            successor = successor.left;'],
    ['successor-found', '        // successor is the leftmost node'],
    ['replace-value', '        node.value = successor.value;'],
    ['remove-successor', '        unlink successor from its parent;'],
    [null, '    }'],
    ['finish', '    return root;'],
    ['missing', '    return root; // value was not found'],
    [null, '}'],
  ],
};

export function getBstDeletionCode(language = 'python') {
  const lines = bstDeletionSource[language];
  if (!lines) throw new Error('Choose Python or Java source code.');
  return {
    code: lines.map(([, line]) => line).join('\n'),
    lineIds: [null, ...lines.map(([id]) => id)],
  };
}

const bstSearchSource = {
  python: [
    ['setup', 'def search(root, target):'],
    ['current', '    current = root'],
    ['loop', '    while current is not None:'],
    ['compare', '        if target == current.value:'],
    ['found', '            return current'],
    ['left', '        if target < current.value:'],
    ['left-next', '            current = current.left'],
    ['right', '        else:'],
    ['right-next', '            current = current.right'],
    ['not-found', '    return None'],
  ],
  java: [
    ['setup', 'Node search(Node root, int target) {'],
    ['current', '    Node current = root;'],
    ['loop', '    while (current != null) {'],
    ['compare', '        if (target == current.value) {'],
    ['found', '            return current;'],
    [null, '        }'],
    ['left', '        if (target < current.value) {'],
    ['left-next', '            current = current.left;'],
    ['right', '        } else {'],
    ['right-next', '            current = current.right;'],
    [null, '        }'],
    [null, '    }'],
    ['not-found', '    return null;'],
    [null, '}'],
  ],
};

export function getBstSearchCode(language = 'python') {
  const lines = bstSearchSource[language];
  if (!lines) throw new Error('Choose Python or Java source code.');
  return {
    code: lines.map(([, line]) => line).join('\n'),
    lineIds: [null, ...lines.map(([id]) => id)],
  };
}

export function createBstSearchSteps(tree, value) {
  validateTree(tree);
  if (!Number.isSafeInteger(value)) {
    throw new Error('Enter a valid safe integer to search for.');
  }
  if (!createBstValidationSteps(tree).at(-1)?.result?.isBst) {
    throw new Error('The existing tree must be a valid BST before searching.');
  }

  const steps = [];
  const path = [];
  let comparisons = 0;
  const visit = (message, nodeId = null, extra = {}) => {
    steps.push({
      step: steps.length + 1,
      nodeId,
      operation: message,
      path: [...path],
      visited: [...path],
      comparisons,
      explanation: extra.explanation ?? message,
      result: { found: false, value, path: [...path], comparisons },
      tree,
      ...extra,
    });
  };

  visit(`Start searching for ${value} at the root.`, tree.root?.id ?? null, {
    lineIds: ['setup', 'current'],
    explanation: tree.root
      ? 'Begin at the root. At each node, compare the target and follow the only branch where it can be.'
      : 'The tree has no root, so there are no nodes to compare.',
  });

  if (!tree.root) {
    visit(`Element Not Found: ${value} is not in the empty tree.`, null, {
      lineIds: ['not-found'],
      complete: true,
      result: { found: false, value, path: [], comparisons: 0 },
      explanation: 'An empty tree contains no element, so the search ends with zero comparisons.',
    });
    return steps;
  }

  let current = tree.root.id;
  while (current !== null) {
    const node = tree.nodes[current];
    path.push(current);
    comparisons += 1;
    visit(`Compare target ${value} with node ${node.value}.`, current, {
      lineIds: ['loop', 'compare'],
      currentValue: node.value,
      explanation: `This is comparison ${comparisons}. Compare ${value} with ${node.value} before choosing a branch.`,
    });
    if (value === node.value) {
      visit(`Element Found: ${value} is in the BST.`, current, {
        lineIds: ['found'],
        complete: true,
        result: { found: true, value, nodeId: current, path: [...path], comparisons },
        explanation: `The target matches node ${node.value}; the search path is complete.`,
      });
      return steps;
    }
    if (value < node.value) {
      const child = node.left;
      visit(`Move left from ${node.value}.`, current, {
        lineIds: child === null ? ['left'] : ['left', 'left-next'],
        direction: 'left',
        edge: child === null ? undefined : [current, child],
        currentValue: node.value,
        explanation: `${value} is smaller than ${node.value}, so continue through the left child.`,
      });
      current = node.left;
    } else {
      const child = node.right;
      visit(`Move right from ${node.value}.`, current, {
        lineIds: child === null ? ['right'] : ['right', 'right-next'],
        direction: 'right',
        edge: child === null ? undefined : [current, child],
        currentValue: node.value,
        explanation: `${value} is larger than ${node.value}, so continue through the right child.`,
      });
      current = node.right;
    }
  }

  visit(`Element Not Found: ${value} is not in the BST.`, path.at(-1) ?? null, {
    lineIds: ['not-found'],
    complete: true,
    result: { found: false, value, path: [...path], comparisons },
    explanation: 'The required child link is empty, so no remaining node can contain the target.',
  });
  return steps;
}

export function createTreeHeightDepthSteps(tree) {
  validateTree(tree);
  const steps = [];
  const visit = (message, nodeId = null, extra = {}) => steps.push({
    step: steps.length + 1,
    nodeId,
    operation: message,
    tree,
    ...extra,
  });

  if (!tree.root) {
    visit('The tree is empty; height and depth are both 0.', null, { complete: true, result: { height: 0, depths: {} } });
    return steps;
  }

  const depths = {};
  const visitNode = (nodeId, depth = 0) => {
    const node = tree.nodes[nodeId];
    depths[nodeId] = depth;
    visit(`Depth of ${node.value} is ${depth}`, nodeId, { depth, value: node.value });
    if (node.left !== null) visitNode(node.left, depth + 1);
    if (node.right !== null) visitNode(node.right, depth + 1);
  };
  visitNode(tree.root.id, 0);
  const height = Math.max(...tree.nodes.map((node) => depths[node.id] ?? 0));
  visit(`The tree height is ${height}`, tree.root.id, { complete: true, result: { height, depths } });
  return steps;
}

export function createAvlRotationSteps(tree, value) {
  const insertionSteps = createBstInsertionSteps(tree, value);
  const finalValueSet = insertionSteps.at(-1)?.result ?? [];
  return {
    steps: insertionSteps,
    result: { insertedValue: value, inorder: finalValueSet },
    explanation: 'AVL trees rebalance after insertion; the trace shows the insertion point before the balancing check.',
  };
}

export function createHeapSteps(values, heapType = 'min') {
  const normalized = Array.isArray(values) ? values : [];
  const steps = [];
  const queue = [...normalized];
  const visit = (message, extra = {}) => steps.push({ step: steps.length + 1, operation: message, array: [...queue], ...extra });
  visit(`Start a ${heapType} heap build from the input values.`);
  for (let index = 0; index < queue.length; index += 1) {
    visit(`Insert ${queue[index]} into the heap`, { value: queue[index], index });
  }
  visit(`${heapType === 'min' ? 'Min' : 'Max'} heap construction is complete.`, { complete: true, result: [...queue] });
  return steps;
}

export function createTrieSteps(words) {
  const list = Array.isArray(words) ? words : [];
  const steps = [];
  const root = { children: {}, endOfWord: false };
  const visit = (message, extra = {}) => steps.push({ step: steps.length + 1, operation: message, trie: root, ...extra });
  visit('Initialize a trie root node.');
  for (const word of list) {
    let node = root;
    visit(`Insert the word ${word} by walking one character at a time.`, { word });
    for (const letter of word) {
      if (!node.children[letter]) node.children[letter] = { children: {}, endOfWord: false };
      node = node.children[letter];
      visit(`Move to the ${letter} edge.`, { edge: letter, word });
    }
    node.endOfWord = true;
    visit(`Mark ${word} as a complete word in the trie.`, { word, complete: true });
  }
  visit('Trie construction is complete.', { complete: true, result: list });
  return steps;
}
