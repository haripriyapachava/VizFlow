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
  const steps = [];
  const nodes = tree.nodes.map((node) => ({ ...node }));
  const visit = (message, nodeId = null, extra = {}) => {
    steps.push({
      step: steps.length + 1,
      nodeId,
      operation: message,
      result: nodes.map((node) => node.value),
      tree: { root: nodes[0] ?? null, nodes },
      ...extra,
    });
  };

  if (!nodes.length) {
    const newRoot = { id: 0, value, left: null, right: null, parent: null, depth: 0 };
    visit(`Insert ${value} as the first root node`, 0, { complete: true, result: [value] });
    return steps;
  }

  let current = 0;
  let parent = null;
  while (current !== null && current !== undefined) {
    const node = nodes[current];
    visit(`Compare ${value} with node ${node.value}`, current, { currentValue: node.value });
    if (value < node.value) {
      if (node.left === null) {
        const newNode = { id: nodes.length, value, left: null, right: null, parent: current, depth: node.depth + 1 };
        node.left = newNode.id;
        nodes.push(newNode);
        visit(`Insert ${value} in the left subtree of ${node.value}`, newNode.id, { complete: true, result: nodes.map((entry) => entry.value) });
        return steps;
      }
      parent = current;
      current = node.left;
    } else {
      if (node.right === null) {
        const newNode = { id: nodes.length, value, left: null, right: null, parent: current, depth: node.depth + 1 };
        node.right = newNode.id;
        nodes.push(newNode);
        visit(`Insert ${value} in the right subtree of ${node.value}`, newNode.id, { complete: true, result: nodes.map((entry) => entry.value) });
        return steps;
      }
      parent = current;
      current = node.right;
    }
  }

  visit(`Tree is updated with ${value}`, parent, { complete: true, result: nodes.map((entry) => entry.value) });
  return steps;
}

export function createBstDeletionSteps(tree, value) {
  validateTree(tree);
  const steps = [];
  const nodes = tree.nodes.map((node) => ({ ...node }));
  const makeResult = () => nodes.map((node) => node.value);
  const visit = (message, nodeId = null, extra = {}) => {
    steps.push({
      step: steps.length + 1,
      nodeId,
      operation: message,
      result: makeResult(),
      tree: { root: nodes[0] ?? null, nodes },
      ...extra,
    });
  };

  if (!nodes.length) {
    visit('The tree is empty; nothing can be deleted.', null, { complete: true, result: [] });
    return steps;
  }

  const findNode = (currentId, parentId = null) => {
    if (currentId === null) return null;
    const node = nodes[currentId];
    visit(`Check node ${node.value} while searching for ${value}`, currentId, { currentValue: node.value, target: value });
    if (value === node.value) return { node, parentId, currentId };
    if (value < node.value && node.left !== null) return findNode(node.left, currentId);
    if (value > node.value && node.right !== null) return findNode(node.right, currentId);
    return null;
  };

  const target = findNode(0);
  if (!target) {
    visit(`${value} is not present in this BST.`, null, { complete: true, result: makeResult() });
    return steps;
  }

  const { currentId, parentId } = target;
  const node = nodes[currentId];
  visit(`Deleting ${node.value} from the BST`, currentId, { deletedValue: value });

  const hasLeft = node.left !== null;
  const hasRight = node.right !== null;
  if (!hasLeft && !hasRight) {
    if (parentId !== null) {
      const parent = nodes[parentId];
      if (parent.left === currentId) parent.left = null;
      else parent.right = null;
    }
    nodes.splice(currentId, 1);
    visit(`Leaf node ${node.value} is removed`, currentId, { complete: true, result: makeResult() });
    return steps;
  }

  if (hasLeft && !hasRight) {
    const child = nodes[node.left];
    if (parentId !== null) {
      const parent = nodes[parentId];
      if (parent.left === currentId) parent.left = node.left;
      else parent.right = node.left;
    } else {
      nodes[0] = { ...nodes[node.left], parent: null, depth: 0 };
    }
    visit(`Replace ${node.value} with its left child ${child.value}`, node.left, { complete: true, result: makeResult() });
    return steps;
  }

  if (!hasLeft && hasRight) {
    const child = nodes[node.right];
    if (parentId !== null) {
      const parent = nodes[parentId];
      if (parent.left === currentId) parent.left = node.right;
      else parent.right = node.right;
    } else {
      nodes[0] = { ...nodes[node.right], parent: null, depth: 0 };
    }
    visit(`Replace ${node.value} with its right child ${child.value}`, node.right, { complete: true, result: makeResult() });
    return steps;
  }

  let successor = node.right;
  let successorParent = currentId;
  while (nodes[successor] && nodes[successor].left !== null) {
    successorParent = successor;
    successor = nodes[successor].left;
  }
  const successorNode = nodes[successor];
  visit(`Use the successor ${successorNode.value} to replace ${node.value}`, successor, { target: successorNode.value });
  node.value = successorNode.value;
  if (successorParent === currentId) {
    node.right = successorNode.right;
  } else {
    nodes[successorParent].left = successorNode.right;
  }
  visit(`BST remains valid after replacing the deleted node`, currentId, { complete: true, result: makeResult() });
  return steps;
}

export function createBstSearchSteps(tree, value) {
  validateTree(tree);
  const steps = [];
  const visit = (message, nodeId = null, extra = {}) => {
    steps.push({
      step: steps.length + 1,
      nodeId,
      operation: message,
      result: { found: false, value },
      tree,
      ...extra,
    });
  };

  if (!tree.root) {
    visit('The tree is empty, so the value is not found.', null, { complete: true, result: { found: false, value } });
    return steps;
  }

  let current = tree.root.id;
  while (current !== null) {
    const node = tree.nodes[current];
    visit(`Compare ${value} against node ${node.value}`, current, { currentValue: node.value });
    if (value === node.value) {
      visit(`Found ${value} in the BST`, current, { complete: true, result: { found: true, value, nodeId: current } });
      return steps;
    }
    if (value < node.value) {
      current = node.left;
    } else {
      current = node.right;
    }
  }

  visit(`${value} was not found in this BST`, null, { complete: true, result: { found: false, value } });
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
