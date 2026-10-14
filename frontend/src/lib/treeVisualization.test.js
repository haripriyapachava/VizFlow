import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createBstInsertionSteps,
  createBstDeletionSteps,
  createBstSearchSteps,
  createBstValidationSteps,
  createTreeTraversalSteps,
  getBstInsertionCode,
  getBstDeletionCode,
  getBstSearchCode,
  getBstValidationCode,
  getTreeLayout,
  getTreeTraversalCode,
  parseBinaryTreeLevelOrder,
} from './treeVisualization.js';

const balancedTreeInput = '50, 30, 70, 20, 40, 60, 80';

function assertDeletionSnapshotsAreValid(steps) {
  for (const step of steps) {
    const tree = step.tree;
    assert.equal(createBstValidationSteps(tree).at(-1).result.isBst, true);
    for (const node of tree.nodes) {
      if (node.left !== null) assert.equal(tree.nodes[node.left].parent, node.id);
      if (node.right !== null) assert.equal(tree.nodes[node.right].parent, node.id);
    }
  }
}

test('BST deletion removes leaves and nodes with one child while preserving valid links', () => {
  const leafSteps = createBstDeletionSteps(parseBinaryTreeLevelOrder(balancedTreeInput), 20);
  assert.equal(leafSteps.at(-1).result.deleted, true);
  assert.equal(leafSteps.at(-1).result.deletionCase, 'leaf');
  assert.deepEqual(leafSteps.at(-1).result.values, [30, 40, 50, 60, 70, 80]);
  assert.ok(leafSteps.some((step) => step.lineIds.includes('unlink-leaf')));
  assertDeletionSnapshotsAreValid(leafSteps);

  const oneChildTree = parseBinaryTreeLevelOrder('50, 30, 70, 20, #, #, #, #, 25');
  const oneChildSteps = createBstDeletionSteps(oneChildTree, 20);
  assert.equal(oneChildSteps.at(-1).result.deletionCase, 'one-child');
  assert.deepEqual(oneChildSteps.at(-1).result.values, [25, 30, 50, 70]);
  assert.ok(oneChildSteps.some((step) => step.lineIds.includes('replace-child')));
  assertDeletionSnapshotsAreValid(oneChildSteps);

  const rootOneChildSteps = createBstDeletionSteps(parseBinaryTreeLevelOrder('50, 30, #, 20'), 50);
  assert.equal(rootOneChildSteps.at(-1).tree.root.value, 30);
  assert.equal(rootOneChildSteps.at(-1).tree.root.parent, null);
  assert.deepEqual(rootOneChildSteps.at(-1).result.values, [20, 30]);
  assertDeletionSnapshotsAreValid(rootOneChildSteps);
});

test('BST deletion uses and removes the inorder successor for two-child and root cases', () => {
  for (const [treeInput, deletedValue, successorValue, expectedValues] of [
    [balancedTreeInput, 30, 40, [20, 40, 50, 60, 70, 80]],
    [balancedTreeInput, 50, 60, [20, 30, 40, 60, 70, 80]],
  ]) {
    const steps = createBstDeletionSteps(parseBinaryTreeLevelOrder(treeInput), deletedValue);
    assert.equal(steps.at(-1).result.deleted, true);
    assert.equal(steps.at(-1).result.deletionCase, 'two-children');
    assert.equal(steps.at(-1).result.successorValue, successorValue);
    assert.deepEqual(steps.at(-1).result.values, expectedValues);
    assert.ok(steps.some((step) => step.successorValue === successorValue && step.lineIds.includes('successor-found')));
    assert.ok(steps.some((step) => step.complete && step.lineIds.includes('remove-successor')));
    assertDeletionSnapshotsAreValid(steps);
  }
});

test('BST deletion reports missing or empty values safely and maps both source languages', () => {
  const missing = createBstDeletionSteps(parseBinaryTreeLevelOrder(balancedTreeInput), 99);
  assert.equal(missing.at(-1).result.deleted, false);
  assert.equal(missing.at(-1).result.comparisons, 3);
  assert.deepEqual(missing.at(-1).result.values, [20, 30, 40, 50, 60, 70, 80]);
  assert.match(missing.at(-1).operation, /Element Not Found/);

  const empty = createBstDeletionSteps(parseBinaryTreeLevelOrder('#'), 50);
  assert.equal(empty.at(-1).result.deleted, false);
  assert.deepEqual(empty.at(-1).result.values, []);
  assert.equal(empty.at(-1).result.comparisons, 0);

  assert.throws(() => createBstDeletionSteps(parseBinaryTreeLevelOrder(balancedTreeInput), 2.5), /safe integer/);
  assert.throws(() => createBstDeletionSteps(parseBinaryTreeLevelOrder('10, 12, 5'), 12), /valid BST/);

  const examples = [
    createBstDeletionSteps(parseBinaryTreeLevelOrder(balancedTreeInput), 30),
    createBstDeletionSteps(parseBinaryTreeLevelOrder(balancedTreeInput), 99),
  ];
  for (const language of ['python', 'java']) {
    const source = getBstDeletionCode(language);
    const lines = source.code.split('\n');
    assert.equal(source.lineIds.length, lines.length + 1);
    for (const step of examples.flat()) {
      for (const lineId of step.lineIds ?? []) {
        const line = source.lineIds.indexOf(lineId);
        assert.ok(line > 0, `${language} BST deletion maps ${lineId}`);
        assert.ok(lines[line - 1].trim());
      }
    }
  }
});

test('BST insertion compares along the search path and snapshots the updated tree', () => {
  const tree = parseBinaryTreeLevelOrder(balancedTreeInput);
  const steps = createBstInsertionSteps(tree, 35);
  const result = steps.at(-1);

  assert.equal(result.complete, true);
  assert.equal(result.insertedValue, 35);
  assert.deepEqual(result.tree.nodes.map((node) => node.value), [50, 30, 70, 20, 40, 60, 80, 35]);
  assert.equal(result.tree.nodes[result.tree.nodes[4].left].value, 35);
  assert.deepEqual(tree.nodes.map((node) => node.value), [50, 30, 70, 20, 40, 60, 80]);
  assert.equal(steps[0].tree.nodes.length, 7);
  assert.ok(steps.some((step) => step.operation === 'Move left from 50.' && step.direction === 'left'));
  assert.ok(steps.some((step) => step.operation === 'Move right from 30.' && step.edge?.[0] === 1));
  assert.ok(steps.some((step) => step.lineIds.includes('left-insert')));
  assert.ok(steps.every((step) => typeof step.explanation === 'string' && step.explanation.length > 0));

  for (const language of ['python', 'java']) {
    const source = getBstInsertionCode(language);
    const lines = source.code.split('\n');
    assert.equal(source.lineIds.length, lines.length + 1);
    for (const step of steps) {
      for (const lineId of step.lineIds ?? []) {
        const line = source.lineIds.indexOf(lineId);
        assert.ok(line > 0, `${language} BST insertion maps ${lineId}`);
        assert.ok(lines[line - 1].trim());
      }
    }
  }
});

test('BST insertion handles duplicates and rejects invalid inputs or a non-BST tree', () => {
  const tree = parseBinaryTreeLevelOrder(balancedTreeInput);
  const duplicate = createBstInsertionSteps(tree, 40).at(-1);
  assert.equal(duplicate.complete, true);
  assert.equal(duplicate.duplicate, true);
  assert.deepEqual(duplicate.result, [50, 30, 70, 20, 40, 60, 80]);
  assert.deepEqual(duplicate.tree.nodes.map((node) => node.value), [50, 30, 70, 20, 40, 60, 80]);

  assert.throws(() => createBstInsertionSteps(tree, 1.5), /safe integer/);
  assert.throws(() => createBstInsertionSteps(tree, Number.MAX_SAFE_INTEGER + 1), /safe integer/);
  assert.throws(() => createBstInsertionSteps(parseBinaryTreeLevelOrder('10, 12, 5'), 7), /valid BST/);
});

test('BST search reports the root-to-target path, comparisons, and mapped code lines', () => {
  const tree = parseBinaryTreeLevelOrder(balancedTreeInput);
  const found = createBstSearchSteps(tree, 40);
  assert.deepEqual(found.at(-1).result, { found: true, value: 40, nodeId: 4, path: [0, 1, 4], comparisons: 3 });
  assert.ok(found.some((step) => step.operation === 'Start searching for 40 at the root.' && step.nodeId === 0));
  assert.ok(found.some((step) => step.direction === 'left' && step.operation === 'Move left from 50.'));
  assert.ok(found.some((step) => step.direction === 'right' && step.operation === 'Move right from 30.'));
  assert.equal(found.at(-1).operation, 'Element Found: 40 is in the BST.');
  assert.ok(found.every((step) => typeof step.explanation === 'string' && step.explanation.length > 0));

  const notFound = createBstSearchSteps(tree, 65);
  assert.deepEqual(notFound.at(-1).result, { found: false, value: 65, path: [0, 2, 5], comparisons: 3 });
  assert.equal(notFound.at(-1).operation, 'Element Not Found: 65 is not in the BST.');
  assert.ok(notFound.some((step) => step.direction === 'right'));
  assert.ok(notFound.some((step) => step.direction === 'left'));

  for (const language of ['python', 'java']) {
    const source = getBstSearchCode(language);
    const lines = source.code.split('\n');
    assert.equal(source.lineIds.length, lines.length + 1);
    for (const step of [...found, ...notFound]) {
      for (const lineId of step.lineIds ?? []) {
        const line = source.lineIds.indexOf(lineId);
        assert.ok(line > 0, `${language} BST search maps ${lineId}`);
        assert.ok(lines[line - 1].trim());
      }
    }
  }
});

test('BST search handles empty trees and rejects invalid targets or a non-BST tree', () => {
  const empty = createBstSearchSteps(parseBinaryTreeLevelOrder('#'), 12);
  assert.deepEqual(empty.at(-1).result, { found: false, value: 12, path: [], comparisons: 0 });
  assert.match(empty.at(-1).operation, /Element Not Found/);
  assert.throws(() => createBstSearchSteps(parseBinaryTreeLevelOrder('10, 5, 20'), 1.25), /safe integer/);
  assert.throws(() => createBstSearchSteps(parseBinaryTreeLevelOrder('10, 12, 5'), 7), /valid BST/);
});

test('Level-order tree parser builds parent/child links, supports gaps, and rejects invalid structures', () => {
  const tree = parseBinaryTreeLevelOrder('10, 5, 20, #, 7, 15, #');
  assert.equal(tree.root.value, 10);
  assert.equal(tree.nodes[tree.root.left].value, 5);
  assert.equal(tree.nodes[tree.root.right].value, 20);
  assert.equal(tree.nodes[tree.nodes[tree.root.left].right].value, 7);
  assert.deepEqual(parseBinaryTreeLevelOrder('#').nodes, []);

  for (const invalid of ['', '1,,2', '1, x, 2', '1, #, #, 2', '#, 1', '9007199254740992']) {
    assert.throws(() => parseBinaryTreeLevelOrder(invalid));
  }
  assert.throws(() => parseBinaryTreeLevelOrder(Array.from({ length: 31 }, (_, index) => index).join(', ')), /15 nodes or fewer/);
});

test('Preorder, inorder, postorder, and level-order traces produce correct input-specific visits', () => {
  const tree = parseBinaryTreeLevelOrder(balancedTreeInput);
  const expected = {
    preorder: [50, 30, 20, 40, 70, 60, 80],
    inorder: [20, 30, 40, 50, 60, 70, 80],
    postorder: [20, 40, 30, 60, 80, 70, 50],
    'level-order': [50, 30, 70, 20, 40, 60, 80],
  };

  for (const [order, sequence] of Object.entries(expected)) {
    const steps = createTreeTraversalSteps(tree, order);
    assert.deepEqual(steps.at(-1).result, sequence);
    assert.equal(steps.at(-1).complete, true);
    assert.deepEqual(steps.at(-1).visited.map((id) => tree.nodes[id].value), sequence);
    assert.ok(steps.some((step) => step.nodeId !== null));
    if (order === 'level-order') {
      assert.ok(steps.some((step) => step.queue.length > 0));
      assert.ok(steps.some((step) => step.lineIds.includes('left-child') && step.operation.startsWith('Check left child')));
      assert.ok(steps.some((step) => step.lineIds.includes('right-child') && step.operation.startsWith('Check right child')));
      assert.equal(steps.at(-1).callStack.length, 0);
    } else {
      assert.ok(steps.some((step) => step.callStack.length > 0));
      assert.equal(steps.at(-1).callStack.length, 0);
    }

    for (const language of ['python', 'java']) {
      const source = getTreeTraversalCode(order, language);
      const lines = source.code.split('\n');
      assert.equal(source.lineIds.length, lines.length + 1);
      for (const step of steps) {
        for (const lineId of step.lineIds) {
          const line = source.lineIds.indexOf(lineId);
          assert.ok(line > 0, `${language} ${order} maps ${lineId}`);
          assert.ok(lines[line - 1].trim());
        }
      }
    }
  }
});

test('Traversal handles empty, singleton, and sparse trees', () => {
  const empty = parseBinaryTreeLevelOrder('#');
  assert.deepEqual(createTreeTraversalSteps(empty, 'inorder').at(-1).result, []);
  assert.deepEqual(createTreeTraversalSteps(empty, 'level-order').at(-1).result, []);
  const singleton = parseBinaryTreeLevelOrder('42');
  assert.deepEqual(createTreeTraversalSteps(singleton, 'preorder').at(-1).result, [42]);
  const sparse = parseBinaryTreeLevelOrder('10, 5, 20, #, 7, 15, #');
  assert.deepEqual(createTreeTraversalSteps(sparse, 'inorder').at(-1).result, [5, 7, 10, 15, 20]);
});

test('BST validation checks inherited ancestor bounds and maps both reference implementations', () => {
  const valid = createBstValidationSteps(parseBinaryTreeLevelOrder(balancedTreeInput));
  assert.deepEqual(valid.at(-1).result, { isBst: true, offendingValue: null });
  assert.ok(valid.some((step) => step.low === 30 && step.high === 50));

  const invalid = createBstValidationSteps(parseBinaryTreeLevelOrder('50, 30, 70, 20, 60, 60'));
  assert.deepEqual(invalid.at(-1).result, { isBst: false, offendingValue: 60 });
  assert.ok(invalid.some((step) => step.valid === false));

  for (const language of ['python', 'java']) {
    const source = getBstValidationCode(language);
    const lines = source.code.split('\n');
    assert.equal(source.lineIds.length, lines.length + 1);
    for (const step of [...valid, ...invalid]) {
      for (const lineId of step.lineIds) {
        const line = source.lineIds.indexOf(lineId);
        assert.ok(line > 0, `${language} BST validation maps ${lineId}`);
        assert.ok(lines[line - 1].trim());
      }
    }
  }
});

test('Tree layout positions every node and preserves child order', () => {
  const tree = parseBinaryTreeLevelOrder(balancedTreeInput);
  const { positions, height } = getTreeLayout(tree);
  assert.equal(Object.keys(positions).length, tree.nodes.length);
  assert.ok(height > positions[tree.root.id].y);
  assert.ok(positions[tree.nodes[tree.root.left].id].x < positions[tree.root.id].x);
  assert.ok(positions[tree.nodes[tree.root.right].id].x > positions[tree.root.id].x);
});
