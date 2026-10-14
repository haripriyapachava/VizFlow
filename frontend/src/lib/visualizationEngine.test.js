import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createBubbleSortSteps,
  createBinarySearchSteps,
  createCycleDetectionSteps,
  createCycleStartSteps,
  createDoublyLinkedListSteps,
  createInsertionSortSteps,
  createLessonPlayback,
  createLinearSearchSteps,
  createSelectionSortSteps,
  createSinglyLinkedListSteps,
  createSlidingWindowSteps,
  createTwoPointerSteps,
  getLessonDefinition,
  isAlgorithmImplemented,
  parseInteger,
  parseIntegerArray,
} from './visualizationEngine.js';

const bubbleCases = [
  { input: [12, 4, 9, 2, 7, 1], expected: [1, 2, 4, 7, 9, 12], comparisons: 15, swaps: 12 },
  { input: [1, 2, 3, 4], expected: [1, 2, 3, 4], comparisons: 3, swaps: 0 },
  { input: [5, 5, 2, 2], expected: [2, 2, 5, 5], comparisons: 6, swaps: 4 },
  { input: [-3, 0, 8, -1], expected: [-3, -1, 0, 8], comparisons: 6, swaps: 2 },
  { input: [42], expected: [42], comparisons: 0, swaps: 0 },
];

function assertCodeMappings(lessonId, steps, variant) {
  const lesson = getLessonDefinition(lessonId, variant);
  for (const language of ['python', 'java']) {
    const code = language === 'python' ? lesson.pythonCode : lesson.javaCode;
    const lineIds = language === 'python' ? lesson.pythonLineIds : lesson.javaLineIds;
    const lines = code.split('\n');
    assert.equal(lineIds.length, lines.length + 1, `${language} line map uses one-based indexes`);

    for (const step of steps) {
      for (const lineId of step.lineIds) {
        const sourceLine = lineIds.indexOf(lineId);
        assert.ok(sourceLine > 0, `${language} has a source line for ${lineId}`);
        assert.ok(lines[sourceLine - 1].trim(), `${language} maps ${lineId} to a real code line`);
        if (lessonId === 'bubble-sort' && lineId === 'compare') {
          assert.match(lines[sourceLine - 1], /arr\[j\]\s*>\s*arr\[j \+ 1\]/);
        }
        if (lineId === 'compare-equal') {
          assert.match(lines[sourceLine - 1], /arr\[mid\]\s*==\s*target/);
        }
        if (lineId === 'compare-less') {
          assert.match(lines[sourceLine - 1], /arr\[mid\]\s*<\s*target/);
        }
        if (lessonId === 'selection-sort' && lineId === 'compare') {
          assert.match(lines[sourceLine - 1], /arr\[j\]\s*<\s*arr\[(?:min_idx|minIndex)\]/);
        }
        if (lessonId === 'insertion-sort' && lineId === 'compare') {
          assert.match(lines[sourceLine - 1], /arr\[j\]\s*>\s*key/);
        }
      }
    }
  }
}

test('Bubble Sort generates accurate input-specific comparisons, swaps, variables, and output', () => {
  for (const { input, expected, comparisons: expectedComparisons, swaps: expectedSwaps } of bubbleCases) {
    const originalInput = [...input];
    const steps = createBubbleSortSteps(input);
    const comparisons = steps.filter((step) => step.lineIds.includes('compare'));
    const swaps = steps.filter((step) => step.swappedIndices.length > 0);
    const result = steps.at(-1);

    assert.deepEqual(result.result, expected);
    assert.deepEqual(result.array, expected);
    assert.equal(result.metrics.comparisons, comparisons.length);
    assert.equal(result.metrics.swaps, swaps.length);
    assert.equal(result.metrics.comparisons, expectedComparisons);
    assert.equal(result.metrics.swaps, expectedSwaps);
    assert.deepEqual(input, originalInput);
    assert.ok(steps.every((step) => Array.isArray(step.array) && Array.isArray(step.lineIds)));

    const replayedArray = [...input];
    for (const step of steps) {
      if (step.lineIds.includes('compare')) {
        assert.deepEqual(step.array, replayedArray);
        assert.equal(step.leftValue, replayedArray[step.j]);
        assert.equal(step.rightValue, replayedArray[step.j + 1]);
      }
      if (step.lineIds.includes('swap')) {
        [replayedArray[step.j], replayedArray[step.j + 1]] = [
          replayedArray[step.j + 1],
          replayedArray[step.j],
        ];
      }
      assert.deepEqual(step.array, replayedArray);
    }

    for (const step of comparisons) {
      assert.equal(step.comparisonResult, step.leftValue > step.rightValue);
      assert.deepEqual(step.compared, [step.j, step.j + 1]);
      assert.ok(step.i >= 0 && step.i < Math.max(input.length - 1, 1));
      assert.ok(step.j >= 0 && step.j + 1 < input.length);
      assert.match(step.operation, new RegExp(`${step.leftValue} > ${step.rightValue}: ${step.comparisonResult}`));
    }

    for (const step of swaps) {
      assert.deepEqual(step.swappedIndices, [step.j, step.j + 1]);
      assert.deepEqual(step.array.slice(step.j, step.j + 2), [step.rightValue, step.leftValue]);
    }

    assertCodeMappings('bubble-sort', steps);

    const playbackArrays = steps.map((step) => step.array);
    for (let index = playbackArrays.length - 1; index > 0; index -= 1) {
      assert.deepEqual(playbackArrays[index - 1], steps[index - 1].array);
    }
    for (let index = 0; index < playbackArrays.length; index += 1) {
      assert.deepEqual(playbackArrays[index], steps[index].array);
    }
  }
});

test('Bubble Sort parser accepts custom integers and rejects empty or malformed input', () => {
  assert.deepEqual(parseIntegerArray('12, 4, 9, 2, 7, 1'), [12, 4, 9, 2, 7, 1]);
  assert.deepEqual(parseIntegerArray('-3, 0, +8'), [-3, 0, 8]);
  for (const invalid of ['', '   ', '1,,2', '1, 2.5', 'one, 2', '9007199254740992']) {
    assert.throws(() => parseIntegerArray(invalid));
  }
  assert.equal(parseInteger('-12'), -12);
  assert.throws(() => parseInteger(''));
});

test('Binary Search finds targets and reports absent targets from sorted custom arrays', () => {
  const cases = [
    { input: [1, 3, 5, 7, 9], target: 7, expected: 3, comparisons: 3 },
    { input: [-10, -3, 0, 4, 12], target: -10, expected: 0, comparisons: 3 },
    { input: [2, 4, 6, 8], target: 5, expected: -1, comparisons: 4 },
    { input: [], target: 1, expected: -1, comparisons: 0 },
  ];

  for (const { input, target, expected, comparisons } of cases) {
    const steps = createBinarySearchSteps(input, target);
    assert.equal(steps.at(-1).result, expected);
    assert.equal(steps.at(-1).metrics.comparisons, comparisons);
    assert.deepEqual(steps.at(-1).array, input);
    for (const step of steps.filter((item) => item.midValue !== undefined)) {
      assert.ok(step.mid >= step.low && step.mid <= step.high);
      assert.equal(step.array[step.mid], step.midValue);
      assert.deepEqual(step.compared, step.operation.startsWith('Compare') ? [step.mid] : []);
    }
    assertCodeMappings('binary-search', steps);
  }

  assert.throws(() => createBinarySearchSteps([3, 1, 2], 1), /sorted in ascending order/);
});

test('Linked list and sliding window traces generate valid step-by-step playback', () => {
  const single = createSinglyLinkedListSteps([10, 20, 30, 40], 30);
  assert.equal(single.at(-1).result, 30);
  assert.ok(single.some((step) => step.operation.includes('Visit node 2')));

  const doubly = createDoublyLinkedListSteps([10, 20, 30, 40], 20);
  assert.equal(doubly.at(-1).result, 20);
  assert.ok(doubly.some((step) => step.operation.includes('Visit node 1')));

  const window = createSlidingWindowSteps([2, 1, 5, 1, 3, 2], 3);
  assert.equal(window.at(-1).result, 9);
  assert.ok(window.some((step) => step.windowStart === 0 && step.windowEnd === 2));
  assert.ok(window.some((step) => step.outgoingIndex === 0 && step.incomingIndex === 3));
});

test('Two Sum moves the correct pointer and finds input-driven pairs', () => {
  const steps = createTwoPointerSteps('two-sum', [1, 2, 3, 4, 6, 8], 10);
  const comparisons = steps.filter((step) => step.currentSum !== undefined);
  assert.equal(comparisons[0].currentSum, 9);
  assert.equal(comparisons[0].left, 0);
  assert.equal(comparisons[0].right, 5);
  assert.ok(steps.some((step) => step.lineIds.includes('move-left') && step.left === 1));
  assert.equal(steps.at(-1).operation, 'Pair found: 2 + 8 = 10');
  assert.deepEqual(steps.at(-1).result, [1, 5]);
  assertCodeMappings('two-pointers', steps, 'two-sum');

  assert.deepEqual(createTwoPointerSteps('two-sum', [1, 1, 2, 3], 100).at(-1).result, []);
  assert.deepEqual(createTwoPointerSteps('two-sum', [], 0).at(-1).result, []);
  assert.deepEqual(createTwoPointerSteps('two-sum', [4], 4).at(-1).result, []);
  assert.throws(() => createTwoPointerSteps('two-sum', [2, 1], 3), /sorted in ascending order/);
});

test('Array/string reversal and palindrome checks handle boundaries and duplicates', () => {
  const reverseArray = createTwoPointerSteps('reverse-array', [1, 2, 2, 4]);
  assert.deepEqual(reverseArray.at(-1).result, [4, 2, 2, 1]);
  assert.deepEqual(createTwoPointerSteps('reverse-array', []).at(-1).result, []);
  assert.equal(createTwoPointerSteps('reverse-string', 'VIZFLOW').at(-1).result, 'WOLFZIV');
  assert.equal(createTwoPointerSteps('reverse-string', '').at(-1).result, '');
  assert.equal(createTwoPointerSteps('palindrome', 'racecar').at(-1).result, true);
  assert.equal(createTwoPointerSteps('palindrome', 'visual').at(-1).result, false);
  assert.equal(createTwoPointerSteps('palindrome', 'a').at(-1).result, true);
  for (const [pattern, trace] of [
    ['reverse-array', reverseArray],
    ['reverse-string', createTwoPointerSteps('reverse-string', 'abba')],
    ['palindrome', createTwoPointerSteps('palindrome', 'abba')],
  ]) assertCodeMappings('two-pointers', trace, pattern);
  assert.throws(() => createTwoPointerSteps('palindrome', [1, 2]), /text input/);
});

test('In-place array pointer patterns produce correct stable results', () => {
  assert.deepEqual(createTwoPointerSteps('remove-duplicates', [1, 1, 2, 2, 3]).at(-1).result, [1, 2, 3]);
  assert.deepEqual(createTwoPointerSteps('remove-duplicates', []).at(-1).result, []);
  assert.deepEqual(createTwoPointerSteps('move-zeroes', [0, 1, 0, 3, 12]).at(-1).result, [1, 3, 12, 0, 0]);
  assert.deepEqual(createTwoPointerSteps('move-zeroes', [0, 0, 0]).at(-1).result, [0, 0, 0]);
  assert.deepEqual(createTwoPointerSteps('container-water', [1, 8, 6, 2, 5, 4, 8, 3, 7]).at(-1).result, { area: 49, indices: [1, 8] });
  assert.deepEqual(createTwoPointerSteps('container-water', [4]).at(-1).result, { area: 0, indices: null });
  for (const [pattern, input] of [
    ['remove-duplicates', [1, 1, 2, 3]],
    ['move-zeroes', [0, 1, 2]],
    ['container-water', [2, 1, 3]],
  ]) assertCodeMappings('two-pointers', createTwoPointerSteps(pattern, input), pattern);
  assert.throws(() => createTwoPointerSteps('remove-duplicates', [2, 1]), /sorted in ascending order/);
  assert.throws(() => createTwoPointerSteps('container-water', [2, -1]), /non-negative/);
});

test('Merge, Three Sum, and fast/slow traces return correct values and map source lines', () => {
  const merged = createTwoPointerSteps('merge', [1, 4, 7], undefined, [2, 3, 8]);
  assert.deepEqual(merged.at(-1).result, [1, 2, 3, 4, 7, 8]);
  assert.deepEqual(createTwoPointerSteps('merge', [], undefined, [1, 2]).at(-1).result, [1, 2]);
  const triples = createTwoPointerSteps('three-sum', [-1, 0, 1, 2, -1, -4], 0);
  assert.deepEqual(triples.at(-1).result, [[-1, -1, 2], [-1, 0, 1]]);
  assert.deepEqual(createTwoPointerSteps('three-sum', [1, 2], 0).at(-1).result, []);
  assert.deepEqual(createTwoPointerSteps('fast-slow', [10, 20, 30, 40, 50]).at(-1).result, { middleIndex: 2, middleValue: 30 });
  assert.deepEqual(createTwoPointerSteps('fast-slow', []).at(-1).result, { middleIndex: null, middleValue: null });
  for (const [pattern, trace] of [
    ['merge', merged],
    ['three-sum', triples],
    ['fast-slow', createTwoPointerSteps('fast-slow', [1, 2, 3, 4])],
  ]) assertCodeMappings('two-pointers', trace, pattern);
  assert.throws(() => createTwoPointerSteps('merge', [2, 1], undefined, [3]), /sorted in ascending order/);
  assert.deepEqual(createTwoPointerSteps('merge', [1], undefined, []).at(-1).result, [1]);
});

test('Floyd cycle detection traces both fast hops and meets at the input-driven node identity', () => {
  const steps = createCycleDetectionSteps([10, 20, 30, 40, 50], 2);
  assert.deepEqual(steps.at(-1).result, { cycleDetected: true, meetingNodeId: 3, cycleStartIndex: null });
  assert.equal(steps.at(-1).array[steps.at(-1).meetingNodeId], 40);
  assert.deepEqual(
    steps.filter((step) => step.operation.startsWith('SLOW moves')).map((step) => step.slowId),
    [1, 2, 3],
  );
  assert.deepEqual(
    steps.filter((step) => step.lineIds.includes('fast-step-one')).map((step) => step.fastId),
    [1, 3, 2],
  );
  assert.deepEqual(
    steps.filter((step) => step.lineIds.includes('fast-step-two')).map((step) => step.fastId),
    [2, 4, 3],
  );
  assert.equal(steps.filter((step) => step.lineIds.includes('fast-step-one')).length, 3);
  assert.equal(steps.filter((step) => step.lineIds.includes('fast-step-two')).length, 3);
  assertCodeMappings('cycle-detection', steps);
});

test('Floyd cycle detection handles empty, singleton, self, two-node, long, head, and no-cycle lists', () => {
  const cases = [
    { input: [], start: null, cycle: false, meeting: null },
    { input: [9], start: null, cycle: false, meeting: null },
    { input: [9], start: 0, cycle: true, meeting: 0 },
    { input: [1, 2], start: 0, cycle: true, meeting: 0 },
    { input: [1, 2, 3, 4, 5, 6], start: 0, cycle: true },
    { input: [1, 2, 3, 4, 5, 6], start: 3, cycle: true },
    { input: [1, 2, 3, 4, 5, 6], start: null, cycle: false, meeting: null },
    { input: [7, 7, 7, 7], start: null, cycle: false, meeting: null },
    { input: [7, 7, 7, 7], start: 1, cycle: true },
  ];
  for (const { input, start, cycle, meeting } of cases) {
    const trace = createCycleDetectionSteps(input, start);
    assert.equal(trace.at(-1).result.cycleDetected, cycle, `input ${input}, cycle at ${start}`);
    if (meeting !== undefined) assert.equal(trace.at(-1).result.meetingNodeId, meeting);
    assert.ok(trace.every((step) => step.nodes.every((node, index) => node.id === index)));
    if (!cycle) assert.ok(trace.some((step) => step.fastId === null || step.fastNextId === null));
  }
  const long = createCycleDetectionSteps(Array.from({ length: 200 }, (_, index) => index), 75);
  assert.equal(long.at(-1).result.cycleDetected, true);
  assert.equal(long.at(-1).nodes.at(-1).nextId, 75);
  assert.throws(() => createCycleDetectionSteps([1, 2], 2), /valid node index/);
  assert.throws(() => createCycleDetectionSteps([1, 2], -1), /valid node index/);
  assert.throws(() => createCycleDetectionSteps([1, Number.NaN], null), /safe integers/);
});

test('Find Cycle Start distinguishes the first meeting node and maps each second-phase hop', () => {
  const detection = createCycleDetectionSteps([10, 20, 30, 40, 50], 2).at(-1);
  const trace = createCycleStartSteps([10, 20, 30, 40, 50], 2, detection.meetingNodeId);
  assert.deepEqual(trace.at(-1).result, { cycleDetected: true, meetingNodeId: 3, cycleStartIndex: 2 });
  assert.equal(trace.at(-1).cycleStartNodeId, 2);
  assert.notEqual(trace.at(-1).cycleStartNodeId, trace.at(0).meetingNodeId);
  assert.equal(trace.filter((step) => step.lineIds.includes('start-head-step')).length, 2);
  assert.equal(trace.filter((step) => step.lineIds.includes('start-meeting-step')).length, 2);
  assertCodeMappings('cycle-detection', trace, 'find-start');

  for (const [input, cycleStart] of [
    [[1], 0],
    [[1, 2], 0],
    [[1, 2, 3, 4], 0],
    [[1, 2, 3, 4, 5], 2],
  ]) {
    const found = createCycleDetectionSteps(input, cycleStart).at(-1);
    const startTrace = createCycleStartSteps(input, cycleStart, found.meetingNodeId);
    assert.equal(startTrace.at(-1).result.cycleStartIndex, cycleStart);
  }
  assert.throws(() => createCycleStartSteps([1, 2, 3], 1, 0), /inside the selected cycle/);
});

test('Sliding Window supports fixed maximum, variable minimum, and unique-substring windows', () => {
  const fixed = createSlidingWindowSteps([2, 1, 5, 1, 3, 2], 3);
  assert.equal(fixed.at(-1).result, 9);
  assertCodeMappings('sliding-window', fixed, 'fixed');

  const minimum = createSlidingWindowSteps([2, 3, 1, 2, 4, 3], 7, 'minimum');
  assert.equal(minimum.at(-1).result, 2);
  assert.ok(minimum.some((step) => step.outgoingIndex !== undefined));
  assertCodeMappings('sliding-window', minimum, 'minimum');
  assert.equal(createSlidingWindowSteps([1, 1, 1], 4, 'minimum').at(-1).result, 0);
  assert.equal(createSlidingWindowSteps([], 4, 'minimum').at(-1).result, 0);
  assert.throws(() => createSlidingWindowSteps([1, 0, 2], 2, 'minimum'), /positive integers/);
  assert.throws(() => createSlidingWindowSteps([1, 2], 0, 'minimum'), /positive integer/);

  const longest = createSlidingWindowSteps('abcabcbb', undefined, 'substring');
  assert.equal(longest.at(-1).result, 3);
  assert.equal(createSlidingWindowSteps('', undefined, 'substring').at(-1).result, 0);
  assertCodeMappings('sliding-window', longest, 'substring');
  assert.throws(() => createSlidingWindowSteps([1, 2], undefined, 'substring'), /text input/);
});

test('Only algorithms with implemented traces are marked runnable', () => {
  assert.equal(isAlgorithmImplemented('bubble-sort'), true);
  assert.equal(isAlgorithmImplemented('binary-search'), true);
  assert.equal(isAlgorithmImplemented('linear-search'), true);
  assert.equal(isAlgorithmImplemented('selection-sort'), true);
  assert.equal(isAlgorithmImplemented('insertion-sort'), true);
  assert.equal(isAlgorithmImplemented('singly-linked-list'), true);
  assert.equal(isAlgorithmImplemented('doubly-linked-list'), true);
  assert.equal(isAlgorithmImplemented('cycle-detection'), true);
  assert.equal(isAlgorithmImplemented('sliding-window'), true);
  assert.ok(createLessonPlayback('singly-linked-list', [10, 20, 30], 20));
  assert.ok(createLessonPlayback('doubly-linked-list', [10, 20, 30], 20));
  assert.ok(createLessonPlayback('cycle-detection', [10, 20, 30, 40, 50], undefined, undefined, undefined, { cycleStartIndex: 2 }));
  assert.ok(createLessonPlayback('sliding-window', [2, 1, 5, 1, 3, 2], 3));
});

test('Linear Search returns the first match, traces each comparison, and handles missing targets', () => {
  const cases = [
    { input: [8, 3, 5, 1, 9], target: 1, expected: 3, comparisons: 4 },
    { input: [5, 5, 2], target: 5, expected: 0, comparisons: 1 },
    { input: [-3, 0, 8, -1], target: 7, expected: -1, comparisons: 4 },
    { input: [42], target: 42, expected: 0, comparisons: 1 },
    { input: [], target: 1, expected: -1, comparisons: 0 },
  ];

  for (const { input, target, expected, comparisons } of cases) {
    const steps = createLinearSearchSteps(input, target);
    const comparisonsTrace = steps.filter((step) => step.lineIds.includes('compare'));
    assert.equal(steps.at(-1).result, expected);
    assert.equal(steps.at(-1).metrics.comparisons, comparisons);
    assert.equal(comparisonsTrace.length, comparisons);
    assert.ok(comparisonsTrace.every((step, index) => step.i === index));
    assert.ok(comparisonsTrace.every((step) => step.array[step.i] === step.currentValue));
    assertCodeMappings('linear-search', steps);
  }

  assert.throws(() => createLinearSearchSteps([1, 2], Number.NaN), /safe integer/);
});

test('Selection Sort produces a correct trace and counts comparisons and swaps', () => {
  const cases = [
    { input: [12, 4, 9, 2, 7, 1], expected: [1, 2, 4, 7, 9, 12] },
    { input: [1, 2, 3, 4], expected: [1, 2, 3, 4] },
    { input: [5, 5, 2, 2], expected: [2, 2, 5, 5] },
    { input: [-3, 0, 8, -1], expected: [-3, -1, 0, 8] },
    { input: [42], expected: [42] },
    { input: [], expected: [] },
  ];

  for (const { input, expected } of cases) {
    const steps = createSelectionSortSteps(input);
    const result = steps.at(-1);
    assert.deepEqual(result.result, expected);
    assert.deepEqual(result.array, expected);
    assert.equal(result.metrics.comparisons, Math.max(0, (input.length * (input.length - 1)) / 2));
    assert.equal(result.metrics.swaps, steps.filter((step) => step.lineIds.includes('swap')).length);
    for (const step of steps.filter((item) => item.lineIds.includes('compare'))) {
      assert.equal(step.comparisonResult, step.currentValue < step.minimumValue);
      assert.ok(step.compared.includes(step.j));
      assert.ok(step.compared.includes(step.minIndex));
    }
    assertCodeMappings('selection-sort', steps);
  }
});

test('Insertion Sort records accurate comparisons, shifts, and final key placements', () => {
  const cases = [
    { input: [12, 4, 9, 2, 7, 1], expected: [1, 2, 4, 7, 9, 12] },
    { input: [1, 2, 3, 4], expected: [1, 2, 3, 4] },
    { input: [5, 5, 2, 2], expected: [2, 2, 5, 5] },
    { input: [-3, 0, 8, -1], expected: [-3, -1, 0, 8] },
    { input: [42], expected: [42] },
    { input: [], expected: [] },
  ];

  for (const { input, expected } of cases) {
    const steps = createInsertionSortSteps(input);
    const result = steps.at(-1);
    assert.deepEqual(result.result, expected);
    assert.deepEqual(result.array, expected);
    assert.equal(result.metrics.shifts, steps.filter((step) => step.lineIds.includes('shift')).length);
    for (const step of steps.filter((item) => item.lineIds.includes('compare'))) {
      assert.equal(step.comparisonResult, step.currentValue > step.key);
      assert.deepEqual(step.compared, [step.j]);
    }
    assertCodeMappings('insertion-sort', steps);
  }
});
