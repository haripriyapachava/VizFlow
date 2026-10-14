import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyADTOperation,
  calculateGrowth,
  createGrowthSeries,
  createMaximumSearchSteps,
  estimateOperationCount,
  getComplexityDemoState,
  getBoundExample,
  getCurveComparison,
} from './fundamentals.js';

test('maximum-search trace handles negative, duplicate, and single values', () => {
  assert.deepEqual(createMaximumSearchSteps([-4, -2, -2, -9]).map((step) => step.maximum), [-4, -2, -2, -2]);
  assert.equal(createMaximumSearchSteps([7])[0].maximum, 7);
  assert.throws(() => createMaximumSearchSteps([]), /at least one/);
});

test('growth estimates match their representative functions and validate inputs', () => {
  assert.equal(estimateOperationCount('constant', 24), 1);
  assert.equal(estimateOperationCount('logarithmic', 7), 3);
  assert.equal(estimateOperationCount('linear', 7), 7);
  assert.equal(estimateOperationCount('linearithmic', 7), 21);
  assert.equal(estimateOperationCount('quadratic', 7), 49);
  assert.throws(() => estimateOperationCount('linear', 0), /positive integer/);
  assert.throws(() => estimateOperationCount('unsupported', 2), /supported/);
});

test('growth series supplies graph points and comparison values', () => {
  assert.deepEqual(createGrowthSeries(3).map(({ size }) => size), [1, 2, 3]);
  assert.equal(calculateGrowth('n2', 4), 16);
  assert.deepEqual(getCurveComparison('n', 'n2', 5), { firstValue: 5, secondValue: 25, faster: 'n' });
});

test('complexity demonstrations keep representative pointer and nested-loop state input-driven', () => {
  assert.deepEqual(getComplexityDemoState('constant', 8, 1).index, 0);
  assert.equal(getComplexityDemoState('logarithmic', 8, 4).done, true);
  assert.deepEqual(getComplexityDemoState('linear', 5, 3).index, 2);
  assert.deepEqual(getComplexityDemoState('linearithmic', 8, 9).outer, 1);
  assert.deepEqual(getComplexityDemoState('quadratic', 4, 7).inner, 2);
  assert.deepEqual(getComplexityDemoState('quadratic', 4, 7).outer, 1);
  assert.throws(() => getComplexityDemoState('linear', 3, -1), /non-negative integer/);
});

test('asymptotic examples demonstrate valid upper, lower, and tight bounds', () => {
  for (const type of ['O', 'Omega', 'Theta']) {
    for (let n = 1; n <= 20; n += 1) assert.equal(getBoundExample(type, n).holds, true);
  }
  assert.match(getBoundExample('O', 4).constant, /5/);
  assert.match(getBoundExample('Omega', 4).threshold, /1/);
});

test('stack and queue preserve their distinct removal order and empty behavior', () => {
  assert.deepEqual(applyADTOperation('Stack', 'Pop', ['A', 'B'], '').values, ['A']);
  assert.deepEqual(applyADTOperation('Queue', 'Dequeue', ['A', 'B'], '').values, ['B']);
  assert.match(applyADTOperation('Queue', 'Dequeue', [], '').message, /empty queue/);
});

test('list, set, and map implement their operations without duplicates or wrong-key matches', () => {
  assert.deepEqual(applyADTOperation('List', 'Update', ['a', 'b'], 'b', 'c').values, ['a', 'c']);
  assert.deepEqual(applyADTOperation('Set', 'Add', ['a'], 'a').values, ['a']);
  assert.match(applyADTOperation('Set', 'Add', ['a'], 'a').message, /unique/);
  assert.deepEqual(applyADTOperation('Map', 'Put', ['key:value'], 'key', 'next').values, ['key:next']);
  assert.match(applyADTOperation('Map', 'Get', ['key:value'], 'key').message, /value/);
  assert.match(applyADTOperation('Map', 'Get', ['key:value'], 'ke').message, /not found/);
  assert.deepEqual(applyADTOperation('Map', 'Remove', ['key:value', 'other:item'], 'key').values, ['other:item']);
});
