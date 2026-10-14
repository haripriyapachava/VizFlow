import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createBstValidationSteps,
  createTreeTraversalSteps,
  getBstValidationCode,
  getTreeLayout,
  getTreeTraversalCode,
  parseBinaryTreeLevelOrder,
} from './treeVisualization.js';

const balancedTreeInput = '50, 30, 70, 20, 40, 60, 80';

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
