import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createBfsSteps,
  createDijkstraSteps,
  createDfsSteps,
  createGraphCycleDetectionSteps,
  getBfsCode,
  getDijkstraCode,
  getDfsCode,
  getGraphCycleDetectionCode,
  parseBfsGraphInput,
  parseCycleGraphInput,
  parseWeightedGraphInput,
  reconstructDijkstraPath,
} from './graphVisualization.js';

test('BFS visits neighbors in alphabetical order and returns its traversal order', () => {
  const steps = createBfsSteps('A: C, B; B: D; C: D; D:', 'A');
  const result = steps.at(-1);

  assert.deepEqual(result.traversalOrder, ['A', 'B', 'C', 'D']);
  assert.deepEqual(result.visited, ['A', 'B', 'C', 'D']);
  assert.deepEqual(result.queue, []);
  assert.deepEqual(steps.filter((step) => step.lineId === 'explore-edge').map((step) => step.edge), [
    ['A', 'B'], ['A', 'C'], ['B', 'A'], ['B', 'D'], ['C', 'A'], ['C', 'D'], ['D', 'B'], ['D', 'C'],
  ]);
});

test('BFS snapshots show queue operations and mark nodes discovered before enqueueing', () => {
  const steps = createBfsSteps('A: C, B; B:; C:', 'A');
  const enqueueB = steps.find((step) => step.operation === 'Enqueue B.');
  const dequeueA = steps.find((step) => step.operation === 'Remove A from the front of the queue.');
  const finalStep = steps.at(-1);

  assert.deepEqual(dequeueA.queue, []);
  assert.deepEqual(enqueueB.queue, ['B']);
  assert.deepEqual(enqueueB.visited, ['A', 'B']);
  assert.deepEqual(finalStep.traversalOrder, ['A', 'B', 'C']);
  assert.equal(steps.some((step) => step.lineId === 'check-visited' && step.edge?.[0] === 'B' && step.edge?.[1] === 'A'), true);
});

test('BFS safely limits traversal to the start component and reports isolated nodes', () => {
  const steps = createBfsSteps('A: B; B:; X:; Y:', 'A');
  const finalStep = steps.at(-1);

  assert.deepEqual(finalStep.traversalOrder, ['A', 'B']);
  assert.deepEqual(finalStep.disconnected, ['X', 'Y']);
  assert.match(finalStep.explanation, /X, Y are disconnected from A/);

  const isolatedStart = createBfsSteps('A:; B: C; C:', 'A').at(-1);
  assert.deepEqual(isolatedStart.traversalOrder, ['A']);
  assert.deepEqual(isolatedStart.disconnected, ['B', 'C']);
});

test('BFS graph parser rejects malformed entries and duplicate declarations', () => {
  for (const input of ['', 'A B', 'A: B,,C', 'A: B;;B:', 'A:; A:']) {
    assert.throws(() => parseBfsGraphInput(input), Error, `rejects ${JSON.stringify(input)}`);
  }
  assert.throws(() => createBfsSteps('A: B; B:', ''), /starting node/i);
  assert.throws(() => createBfsSteps('A: B; B:', 'Z'), /not in the graph/i);
});

test('BFS handles forward-declared nodes and maps trace lines to Python and Java code', () => {
  const graph = parseBfsGraphInput('A: B; B:; X:');
  assert.deepEqual(graph.nodes, ['A', 'B', 'X']);
  assert.deepEqual(graph.adjacency.get('A'), ['B']);

  const steps = createBfsSteps('A: B; B:', 'A');
  for (const language of ['python', 'java']) {
    const source = getBfsCode(language);
    const lines = source.code.split('\n');
    assert.equal(source.lineIds.length, lines.length + 1);
    for (const step of steps) {
      const line = source.lineIds.indexOf(step.lineId);
      assert.ok(line > 0, `${language} maps ${step.lineId}`);
      assert.ok(lines[line - 1].trim(), `${language} maps to non-empty source`);
    }
  }
});

test('DFS follows depth-first order with deterministic alphabetic neighbors', () => {
  const steps = createDfsSteps('A: C, B; B: D, E; C: F; D:; E:; F:', 'A');
  const result = steps.at(-1);

  assert.deepEqual(result.traversalOrder, ['A', 'B', 'D', 'E', 'C', 'F']);
  assert.deepEqual(result.visited, ['A', 'B', 'D', 'E', 'C', 'F']);
  assert.deepEqual(result.stack, []);
  assert.deepEqual(steps.filter((step) => step.lineId === 'explore-edge').map((step) => step.edge).slice(0, 4), [
    ['A', 'B'], ['B', 'A'], ['B', 'D'], ['D', 'B'],
  ]);
});

test('DFS records backtracking after exhausting a node and restores the parent stack', () => {
  const steps = createDfsSteps('A: B; B: C; C:', 'A');
  const backtracks = steps.filter((step) => step.lineId === 'backtrack');

  assert.deepEqual(backtracks.map((step) => step.operation), ['Backtrack from C.', 'Backtrack from B.', 'Backtrack from A.']);
  assert.deepEqual(backtracks.map((step) => step.stack), [['A', 'B'], ['A'], []]);
  assert.equal(backtracks[0].currentNode, 'B');
  assert.equal(backtracks[1].currentNode, 'A');
});

test('DFS handles cycles without revisiting nodes', () => {
  const steps = createDfsSteps('A: B, C; B: C; C: A', 'A');
  const result = steps.at(-1);
  const repeatedEdges = steps.filter((step) => step.lineId === 'check-visited');

  assert.deepEqual(result.traversalOrder, ['A', 'B', 'C']);
  assert.deepEqual(result.visited, ['A', 'B', 'C']);
  assert.ok(repeatedEdges.length > 0);
  assert.ok(repeatedEdges.every((step) => step.stack.length > 0));
});

test('DFS reports disconnected and isolated nodes outside the start component', () => {
  const steps = createDfsSteps('A: B; B:; X:; Y:', 'A');
  const result = steps.at(-1);

  assert.deepEqual(result.traversalOrder, ['A', 'B']);
  assert.deepEqual(result.disconnected, ['X', 'Y']);
  assert.match(result.explanation, /X, Y are disconnected from A/);

  const isolatedStart = createDfsSteps('A:; B: C; C:', 'A').at(-1);
  assert.deepEqual(isolatedStart.traversalOrder, ['A']);
  assert.deepEqual(isolatedStart.disconnected, ['B', 'C']);
});

test('DFS rejects invalid graph and starting-node inputs and maps code lines', () => {
  for (const input of ['', 'A B', 'A: B,,C', 'A:; A:']) {
    assert.throws(() => createDfsSteps(input, 'A'), Error, `rejects ${JSON.stringify(input)}`);
  }
  assert.throws(() => createDfsSteps('A: B; B:', ''), /starting node/i);
  assert.throws(() => createDfsSteps('A: B; B:', 'Z'), /not in the graph/i);

  const steps = createDfsSteps('A: B; B:', 'A');
  for (const language of ['python', 'java']) {
    const source = getDfsCode(language);
    const lines = source.code.split('\n');
    assert.equal(source.lineIds.length, lines.length + 1);
    for (const step of steps) {
      const line = source.lineIds.indexOf(step.lineId);
      assert.ok(line > 0, `${language} maps ${step.lineId}`);
      assert.equal(source.lineIds.filter((lineId) => lineId === step.lineId).length, 1, `${language} highlights one line for ${step.lineId}`);
      assert.ok(lines[line - 1].trim(), `${language} maps to non-empty source`);
    }
  }
});

test('undirected cycle detection finds cycles using parent tracking', () => {
  const steps = createGraphCycleDetectionSteps('A: B, C; B: C; C:', false);
  const cycle = steps.find((step) => step.cycleEdge);

  assert.equal(steps.at(-1).operation, 'Cycle Detected');
  assert.deepEqual(cycle.cycleEdge, ['C', 'A']);
  assert.equal(cycle.lineId, 'cycle-detected');
  assert.ok(steps.some((step) => step.lineId === 'skip-parent'));
});

test('undirected cycle detection reports no cycle for trees and self-free isolated components', () => {
  const steps = createGraphCycleDetectionSteps('A: B, C; B: D; C:; D:; X:', false);

  assert.equal(steps.at(-1).operation, 'No Cycle Detected');
  assert.equal(steps.at(-1).result, false);
  assert.deepEqual(steps.at(-1).visited, ['A', 'B', 'D', 'C', 'X']);
  assert.ok(steps.some((step) => step.operation === 'Start a new component at X.'));
});

test('directed cycle detection uses the active recursion stack', () => {
  const steps = createGraphCycleDetectionSteps('A: B; B: C; C: A', true);
  const cycle = steps.find((step) => step.cycleEdge);

  assert.equal(steps.at(-1).operation, 'Cycle Detected');
  assert.deepEqual(cycle.cycleEdge, ['C', 'A']);
  assert.deepEqual(cycle.stack, ['A', 'B', 'C']);
  assert.equal(cycle.lineId, 'cycle-detected');
});

test('directed cycle detection ignores previously visited nodes outside the active path', () => {
  const steps = createGraphCycleDetectionSteps('A: B, C; B:; C: B', true);

  assert.equal(steps.at(-1).operation, 'No Cycle Detected');
  assert.equal(steps.at(-1).result, false);
  assert.deepEqual(steps.at(-1).visited, ['A', 'B', 'C']);
});

test('cycle detection checks disconnected components and finds a later cycle', () => {
  const steps = createGraphCycleDetectionSteps('A: B; B:; X: Y; Y: Z; Z: X', false);

  assert.equal(steps.at(-1).operation, 'Cycle Detected');
  assert.deepEqual(steps.at(-1).cycleEdge, ['Z', 'X']);
  assert.ok(steps.some((step) => step.operation === 'Start a new component at X.'));
});

test('cycle detection handles self-loops and empty graphs', () => {
  for (const directed of [false, true]) {
    const steps = createGraphCycleDetectionSteps('Solo: Solo', directed);
    assert.equal(steps.at(-1).operation, 'Cycle Detected');
    assert.deepEqual(steps.at(-1).cycleEdge, ['Solo', 'Solo']);
  }
  const empty = createGraphCycleDetectionSteps('', false);
  assert.equal(empty.at(-1).operation, 'No Cycle Detected');
  assert.deepEqual(empty.at(-1).nodes, []);
});

test('cycle graph parser preserves directed edges and rejects malformed inputs', () => {
  const directed = parseCycleGraphInput('A: B; B:', true);
  assert.deepEqual(directed.edges, [['A', 'B']]);
  assert.deepEqual(directed.adjacency.get('B'), []);
  const undirected = parseCycleGraphInput('A: B; B:', false);
  assert.deepEqual(undirected.edges, [['A', 'B']]);
  assert.deepEqual(undirected.adjacency.get('B'), ['A']);

  for (const input of ['A B', 'A: B,,C', 'A:; A:', 'A: B;;B:']) {
    assert.throws(() => createGraphCycleDetectionSteps(input), Error, `rejects ${JSON.stringify(input)}`);
  }
});

test('cycle detection steps map to one Python or Java source line for both graph types', () => {
  for (const directed of [false, true]) {
    const steps = createGraphCycleDetectionSteps('A: B; B:; X:', directed);
    for (const language of ['python', 'java']) {
      const source = getGraphCycleDetectionCode(directed, language);
      const lines = source.code.split('\n');
      assert.equal(source.lineIds.length, lines.length + 1);
      for (const step of steps) {
        const line = source.lineIds.indexOf(step.lineId);
        assert.ok(line > 0, `${directed ? 'directed' : 'undirected'} ${language} maps ${step.lineId}`);
        assert.equal(source.lineIds.filter((lineId) => lineId === step.lineId).length, 1);
        assert.ok(lines[line - 1].trim());
      }
    }
  }
});

test('Dijkstra initializes source to zero and finds input-driven weighted shortest distances', () => {
  const steps = createDijkstraSteps('A: B(4), C(1); B: A(4), C(2), D(1); C: A(1), B(2), D(4); D: B(1), C(4)', 'A');
  const initialized = steps[0];
  const result = steps.at(-1).result;

  assert.equal(initialized.distances.A, 0);
  assert.equal(initialized.distances.B, Number.POSITIVE_INFINITY);
  assert.equal(initialized.distances.C, Number.POSITIVE_INFINITY);
  assert.deepEqual(result.distances, { A: 0, B: 3, C: 1, D: 4 });
  assert.deepEqual(steps.at(-1).visited, ['A', 'C', 'B', 'D']);
  assert.deepEqual(steps.at(-1).unreachable, []);
});

test('Dijkstra reconstructs selected paths and reports the total path cost', () => {
  const steps = createDijkstraSteps('A: B(4), C(1); B: A(4), C(2), D(1); C: A(1), B(2), D(4); D: B(1), C(4)', 'A');
  const result = steps.at(-1).result;

  assert.deepEqual(reconstructDijkstraPath(result.previous, 'A', 'D'), ['A', 'C', 'B', 'D']);
  assert.equal(result.distances.D, 4);
  assert.deepEqual(result.shortestPathEdges, [['C', 'B'], ['A', 'C'], ['B', 'D']]);
  assert.deepEqual(reconstructDijkstraPath(result.previous, 'A', 'A'), ['A']);
  assert.deepEqual(reconstructDijkstraPath(result.previous, 'A', 'Missing'), []);
});

test('Dijkstra handles directed edges without adding reverse connections', () => {
  const graph = parseWeightedGraphInput('A: B(2); B: C(3); C:', true);
  const steps = createDijkstraSteps('A: B(2); B: C(3); C:', 'C', true);

  assert.deepEqual(graph.edges, [['A', 'B', 2], ['B', 'C', 3]]);
  assert.deepEqual(graph.adjacency.get('C'), new Map());
  assert.deepEqual(steps.at(-1).result.distances, { A: Number.POSITIVE_INFINITY, B: Number.POSITIVE_INFINITY, C: 0 });
  assert.deepEqual(steps.at(-1).unreachable, ['A', 'B']);
});

test('Dijkstra reports unreachable nodes and keeps their distances at Infinity', () => {
  const steps = createDijkstraSteps('A: B(2); B:; X:; Y:', 'A');
  const result = steps.at(-1).result;

  assert.equal(result.distances.A, 0);
  assert.equal(result.distances.B, 2);
  assert.equal(result.distances.X, Number.POSITIVE_INFINITY);
  assert.deepEqual(result.unreachable, ['X', 'Y']);
  assert.deepEqual(reconstructDijkstraPath(result.previous, 'A', 'X'), []);
});

test('Dijkstra supports zero-weight edges without treating them as missing', () => {
  const steps = createDijkstraSteps('A: B(0), C(2); B: A(0), C(1); C: A(2), B(1)', 'A');
  const result = steps.at(-1).result;

  assert.equal(result.distances.B, 0);
  assert.equal(result.distances.C, 1);
  assert.deepEqual(reconstructDijkstraPath(result.previous, 'A', 'C'), ['A', 'B', 'C']);
});

test('Dijkstra rejects negative weights, malformed edges, conflicts, and invalid sources', () => {
  assert.throws(() => createDijkstraSteps('A: B(-1); B:', 'A'), /Negative edge weight -1/);
  for (const input of ['', 'A: B; B:', 'A: B(NaN); B:', 'A: B(1); A:;']) {
    assert.throws(() => createDijkstraSteps(input, 'A'), Error, `rejects ${JSON.stringify(input)}`);
  }
  assert.throws(() => createDijkstraSteps('A: B(1); B: A(2)', 'A'), /Conflicting weights/);
  assert.throws(() => createDijkstraSteps('A: B(2); B:', ''), /starting node/i);
  assert.throws(() => createDijkstraSteps('A: B(2); B:', 'Z'), /not in the graph/i);
});

test('Dijkstra snapshots expose edge calculations, minimum selection, and code mappings', () => {
  const steps = createDijkstraSteps('A: B(3), C(1); B: C(1); C:', 'A');
  const calculation = steps.find((step) => step.lineId === 'explore-edge' && step.calculation?.to === 'C');
  const relaxation = steps.find((step) => step.lineId === 'update-distance' && step.calculation?.to === 'C');

  assert.deepEqual(calculation.calculation, { from: 'A', to: 'C', currentDistance: 0, weight: 1, candidateDistance: 1, knownDistance: Number.POSITIVE_INFINITY });
  assert.equal(relaxation.distances.C, 1);
  assert.deepEqual(steps[2].priorityQueue[0], { node: 'A', distance: 0 });

  for (const language of ['python', 'java']) {
    const source = getDijkstraCode(language);
    const lines = source.code.split('\n');
    assert.equal(source.lineIds.length, lines.length + 1);
    for (const step of steps) {
      const line = source.lineIds.indexOf(step.lineId);
      assert.ok(line > 0, `${language} maps ${step.lineId}`);
      assert.equal(source.lineIds.filter((lineId) => lineId === step.lineId).length, 1, `${language} uniquely maps ${step.lineId}`);
      assert.ok(lines[line - 1].trim());
    }
  }
});
