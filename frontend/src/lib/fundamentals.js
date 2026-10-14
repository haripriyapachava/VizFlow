export const fundamentalsLessonIds = ['intro-dsa', 'adt', 'complexity', 'big-o'];

export const fundamentalsLessons = {
  'intro-dsa': {
    title: 'Introduction to Data Structures and Algorithms',
    concept: 'A data structure organizes information; an algorithm is a repeatable set of steps that works with that information.',
    realLife: 'A contacts app stores people in a structure and uses search/sort algorithms to find and order them.',
    complexity: 'The right structure can make common operations faster or simpler.',
    quiz: {
      question: 'Which statement best describes an algorithm?',
      options: ['A way to organize stored values', 'A finite sequence of steps to solve a problem', 'A type of computer memory'],
      answer: 1,
      explanation: 'An algorithm is a defined set of steps that transforms input into a result.',
    },
    practice: {
      question: 'In the maximum-finding demo, what do you do when the current value is smaller than the maximum so far?',
      options: ['Replace the maximum anyway', 'Keep the current maximum', 'Stop scanning the array'],
      answer: 1,
      explanation: 'A smaller value does not change the largest value observed so far.',
    },
  },
  adt: {
    title: 'Abstract Data Types',
    concept: 'An ADT describes what operations a collection supports and what those operations mean—not how the collection is stored.',
    realLife: 'A queue at a ticket counter defines join-at-the-back and serve-from-the-front regardless of how the queue is implemented.',
    complexity: 'Operation costs depend on the chosen implementation, not only the ADT name.',
    quiz: {
      question: 'What does an ADT specify?',
      options: ['The allowed operations and their behavior', 'The exact memory addresses of values', 'Only the programming language'],
      answer: 0,
      explanation: 'An ADT is a logical contract; arrays, linked lists, and other structures can implement it.',
    },
    practice: {
      question: 'Which operation removes the oldest item from a queue?',
      options: ['Dequeue from the front', 'Pop from the top', 'Peek at the rear'],
      answer: 0,
      explanation: 'A queue removes the earliest enqueued item from its front.',
    },
  },
  complexity: {
    title: 'Time and Space Complexity',
    concept: 'Complexity describes how resource use grows as input size n grows. It counts growth, not exact seconds.',
    realLife: 'Finding a name in an unsorted contact list may require checking more entries as the list grows.',
    complexity: 'Time counts basic operations; auxiliary space counts extra memory beyond the input.',
    quiz: {
      question: 'Linear search checks an unsorted array for a value at the last position. How does its work grow?',
      options: ['Constant, O(1)', 'Linear, O(n)', 'Quadratic, O(n²)'],
      answer: 1,
      explanation: 'In the worst case, it checks each of the n elements once.',
    },
    practice: {
      question: 'An algorithm stores only a few fixed variables while scanning n inputs. What is its auxiliary space?',
      options: ['O(1)', 'O(n)', 'O(n²)'],
      answer: 0,
      explanation: 'A fixed number of extra variables is constant auxiliary space.',
    },
  },
  'big-o': {
    title: 'Big O, Big Omega, and Big Theta',
    concept: 'Asymptotic notations describe mathematical bounds on a function after ignoring constant factors and smaller terms.',
    realLife: 'A speed limit is an upper bound on speed; a guaranteed minimum service rate is a lower bound. Neither describes the actual speed by itself.',
    complexity: 'O is an upper bound, Ω a lower bound, and Θ a tight bound when both bounds hold.',
    quiz: {
      question: 'What does Big O describe?',
      options: ['An asymptotic upper bound on a function', 'Always the best-case running time', 'An exact operation count'],
      answer: 0,
      explanation: 'Big O is an upper bound. Whether the function models a best, average, or worst case is a separate choice.',
    },
    practice: {
      question: 'If f(n) is both O(n) and Ω(n), which tight bound describes it?',
      options: ['Θ(n)', 'O(n²)', 'Ω(1) only'],
      answer: 0,
      explanation: 'Matching asymptotic upper and lower bounds establish a tight Θ(n) bound.',
    },
  },
};

export const complexityOptions = [
  { id: 'constant', label: 'Constant — O(1)', formula: '1', explanation: 'The number of operations stays roughly the same as n grows.', example: 'Read the first item in an array.' },
  { id: 'logarithmic', label: 'Logarithmic — O(log n)', formula: 'log₂(n)', explanation: 'Each step cuts the remaining search space by a fixed fraction.', example: 'Binary search in a sorted array.' },
  { id: 'linear', label: 'Linear — O(n)', formula: 'n', explanation: 'The work grows in proportion to the number of input items.', example: 'Scan every value once.' },
  { id: 'linearithmic', label: 'Linearithmic — O(n log n)', formula: 'n log₂(n)', explanation: 'There are about log n levels, each doing about n work.', example: 'Merge sort.' },
  { id: 'quadratic', label: 'Quadratic — O(n²)', formula: 'n²', explanation: 'Two nested passes can do about n work for each of n items.', example: 'Compare every pair of items.' },
];

export function estimateOperationCount(complexityId, inputSize) {
  if (!Number.isSafeInteger(inputSize) || inputSize < 1) {
    throw new Error('Input size must be a positive integer.');
  }
  const estimates = {
    constant: 1,
    logarithmic: Math.ceil(Math.log2(inputSize + 1)),
    linear: inputSize,
    linearithmic: Math.ceil(inputSize * Math.log2(inputSize + 1)),
    quadratic: inputSize ** 2,
  };
  const result = estimates[complexityId];
  if (result === undefined) throw new Error('Choose a supported complexity class.');
  return result;
}

export function getComplexityDemoState(complexityId, inputSize, completedOperations) {
  const totalOperations = estimateOperationCount(complexityId, inputSize);
  if (!Number.isSafeInteger(completedOperations) || completedOperations < 0) {
    throw new Error('Completed operations must be a non-negative integer.');
  }
  const operations = Math.min(completedOperations, totalOperations);
  if (operations === 0) return { operations, totalOperations, done: false, index: null, low: null, high: null, outer: null, inner: null };
  if (complexityId === 'constant') {
    return { operations, totalOperations, done: true, index: 0, low: null, high: null, outer: null, inner: null };
  }
  if (complexityId === 'logarithmic') {
    let low = 0;
    let high = inputSize - 1;
    let index = null;
    let done = false;
    for (let iteration = 0; iteration < operations && low <= high; iteration += 1) {
      index = Math.floor((low + high) / 2);
      if (index === inputSize - 1) {
        done = true;
        break;
      }
      low = index + 1;
    }
    return { operations, totalOperations, done, index, low, high, outer: null, inner: null };
  }
  if (complexityId === 'linear') {
    return { operations, totalOperations, done: operations === totalOperations, index: operations - 1, low: null, high: null, outer: null, inner: null };
  }
  if (complexityId === 'linearithmic') {
    return {
      operations,
      totalOperations,
      done: operations === totalOperations,
      index: (operations - 1) % inputSize,
      low: null,
      high: null,
      outer: Math.floor((operations - 1) / inputSize),
      inner: null,
    };
  }
  if (complexityId === 'quadratic') {
    return {
      operations,
      totalOperations,
      done: operations === totalOperations,
      index: null,
      low: null,
      high: null,
      outer: Math.floor((operations - 1) / inputSize),
      inner: (operations - 1) % inputSize,
    };
  }
  throw new Error('Choose a supported complexity class.');
}

export function createMaximumSearchSteps(values) {
  if (!Array.isArray(values) || values.length === 0 || values.some((value) => !Number.isFinite(value))) {
    throw new Error('Provide at least one finite number.');
  }
  let maximum = values[0];
  return values.map((value, index) => {
    const previousMaximum = maximum;
    if (value > maximum) maximum = value;
    return {
      index,
      value,
      previousMaximum,
      maximum,
      isNewMaximum: value > previousMaximum,
      explanation: value > previousMaximum
        ? `${value} is larger than ${previousMaximum}, so it becomes the maximum seen so far.`
        : `${value} is not larger than ${maximum}; keep the current maximum.`,
    };
  });
}

export function calculateGrowth(functionId, n) {
  if (!Number.isFinite(n) || n < 1) throw new Error('Input size must be at least 1.');
  const funcs = {
    one: () => 1,
    log: () => Math.log2(n),
    n: () => n,
    nlogn: () => n * Math.log2(n),
    n2: () => n ** 2,
  };
  if (!funcs[functionId]) throw new Error('Choose a supported growth function.');
  return funcs[functionId]();
}

export function createGrowthSeries(maxN = 24) {
  if (!Number.isSafeInteger(maxN) || maxN < 1) throw new Error('Maximum n must be a positive integer.');
  return Array.from({ length: maxN }, (_, index) => {
    const n = index + 1;
    return {
      size: n,
      one: calculateGrowth('one', n),
      log: calculateGrowth('log', n),
      n: calculateGrowth('n', n),
      nlogn: calculateGrowth('nlogn', n),
      n2: calculateGrowth('n2', n),
    };
  });
}

export function getBoundExample(boundType, n) {
  if (!Number.isSafeInteger(n) || n < 1) throw new Error('n₀ must be a positive integer.');
  const fn = 3 * n + 2;
  if (boundType === 'O') {
    return { fn, bound: 5 * n, notation: 'O(n)', constant: 'c = 5', threshold: 'n₀ = 1', holds: fn <= 5 * n };
  }
  if (boundType === 'Omega') {
    return { fn, bound: 3 * n, notation: 'Ω(n)', constant: 'c = 3', threshold: 'n₀ = 1', holds: fn >= 3 * n };
  }
  if (boundType === 'Theta') {
    return { fn, lower: 3 * n, bound: 5 * n, notation: 'Θ(n)', constant: 'c₁ = 3, c₂ = 5', threshold: 'n₀ = 1', holds: 3 * n <= fn && fn <= 5 * n };
  }
  throw new Error('Choose O, Omega, or Theta.');
}

export function getCurveComparison(first, second, n) {
  const firstValue = calculateGrowth(first, n);
  const secondValue = calculateGrowth(second, n);
  return {
    firstValue,
    secondValue,
    faster: firstValue < secondValue ? first : secondValue < firstValue ? second : 'equal',
  };
}

export function applyADTOperation(adt, operation, values, input, second = '') {
  if (!Array.isArray(values) || values.some((value) => typeof value !== 'string')) {
    throw new Error('ADT contents must be an array of strings.');
  }
  const target = input.trim();
  const replacement = second.trim();
  const index = values.indexOf(target);
  const unchanged = (message) => ({ values, message });
  if (adt === 'Stack' && operation === 'Push') {
    return target ? { values: [...values, target], message: `Push adds ${target} to the top of the stack.` } : unchanged('Enter a value before pushing it.');
  }
  if (adt === 'Stack' && operation === 'Pop') {
    return values.length
      ? { values: values.slice(0, -1), message: `Pop removes ${values.at(-1)} from the top.` }
      : unchanged('Pop cannot remove from an empty stack.');
  }
  if (adt === 'Stack' && operation === 'Peek') return unchanged(`Peek reads ${values.at(-1) ?? 'nothing; the stack is empty'} without removing it.`);
  if (adt === 'Stack' && operation === 'IsEmpty') return unchanged(`IsEmpty returns ${values.length === 0}.`);
  if (adt === 'Queue' && operation === 'Enqueue') {
    return target ? { values: [...values, target], message: `Enqueue adds ${target} at the rear of the queue.` } : unchanged('Enter a value before enqueueing it.');
  }
  if (adt === 'Queue' && operation === 'Dequeue') {
    return values.length
      ? { values: values.slice(1), message: `Dequeue removes ${values[0]} from the front.` }
      : unchanged('Dequeue cannot remove from an empty queue.');
  }
  if (adt === 'Queue' && operation === 'Front') return unchanged(`Front reads ${values[0] ?? 'nothing; the queue is empty'} without removing it.`);
  if (adt === 'Queue' && operation === 'IsEmpty') return unchanged(`IsEmpty returns ${values.length === 0}.`);
  if (adt === 'List' && operation === 'Insert') {
    return target ? { values: [...values, target], message: `Insert adds ${target} to the end of the list.` } : unchanged('Enter a value before inserting it.');
  }
  if (adt === 'List' && operation === 'Delete') {
    return index < 0
      ? unchanged(`${target || 'That value'} is not present, so nothing changed.`)
      : { values: [...values.slice(0, index), ...values.slice(index + 1)], message: `Delete removes ${target} from the list.` };
  }
  if (adt === 'List' && operation === 'Search') return unchanged(`Search ${target}: ${index >= 0 ? `found at position ${index}` : 'not found'}.`);
  if (adt === 'List' && operation === 'Update') {
    return index < 0
      ? unchanged(`${target || 'That value'} is not present, so nothing changed.`)
      : { values: values.map((value, valueIndex) => valueIndex === index ? replacement : value), message: `Update replaces ${target} with ${replacement}.` };
  }
  if (adt === 'Set' && operation === 'Add') {
    if (!target) return unchanged('Enter a value before adding it.');
    if (values.includes(target)) return unchanged(`${target} is already in the set; sets contain unique values.`);
    return { values: [...values, target], message: `Add inserts ${target} into the set.` };
  }
  if (adt === 'Set' && operation === 'Remove') return { values: values.filter((value) => value !== target), message: `Remove deletes ${target} from the set if present.` };
  if (adt === 'Set' && operation === 'Contains') return unchanged(`Contains ${target}: ${values.includes(target)}.`);
  if (adt === 'Map' && operation === 'Put') {
    if (!target) return unchanged('Enter a key before using Put.');
    const entry = `${target}:${replacement}`;
    return values.some((value) => value.startsWith(`${target}:`))
      ? { values: values.map((value) => value.startsWith(`${target}:`) ? entry : value), message: `Put updates the value stored for key ${target}.` }
      : { values: [...values, entry], message: `Put stores the value for key ${target}.` };
  }
  if (adt === 'Map' && operation === 'Get') {
    const entry = values.find((value) => value.startsWith(`${target}:`));
    return unchanged(`Get ${target}: ${entry ? `found value ${entry.slice(target.length + 1)}` : 'key not found'}.`);
  }
  if (adt === 'Map' && operation === 'Remove') {
    return { values: values.filter((value) => !value.startsWith(`${target}:`)), message: `Remove deletes the entry for key ${target} if present.` };
  }
  throw new Error(`Unsupported ${adt} operation: ${operation}.`);
}
