import React, { useEffect, useMemo, useState } from 'react';
import {
  createAvlRotationSteps,
  createBstDeletionSteps,
  createBstInsertionSteps,
  createBstSearchSteps,
  createBstValidationSteps,
  createHeapSteps,
  createTreeHeightDepthSteps,
  createTreeTraversalSteps,
  createTrieSteps,
  getBstDeletionCode,
  getBstInsertionCode,
  getBstSearchCode,
  getBstValidationCode,
  getTreeLayout,
  getTreeTraversalCode,
  parseBinaryTreeLevelOrder,
  treeStudioLessonIds,
} from './lib/treeVisualization';

const lessonContent = {
  'tree-introduction': {
    title: 'Introduction to Trees',
    concept: 'A tree is a hierarchy of nodes connected by parent-to-child links. It has one root and no cycles.',
    realLife: 'A family tree or a folder system shows how one item can contain smaller items.',
    complexity: 'Visiting every node takes O(n) time. Recursive traversal uses O(h) call-stack space, where h is the tree height.',
    practice: ['What is the topmost node called?', ['Root', 'Leaf', 'Edge'], 0],
    quiz: ['Which statement describes a tree?', ['A hierarchy with parent-child links', 'A row of adjacent values', 'A set where every item has two parents'], 0],
  },
  'binary-trees': {
    title: 'Binary Trees',
    concept: 'A binary tree is a tree where each node has at most two children: a left child and a right child.',
    realLife: 'A yes/no decision process can branch into two choices at each question.',
    complexity: 'A traversal visits n nodes in O(n) time. Recursive DFS uses O(h) call-stack space.',
    practice: ['How many children can one binary-tree node have at most?', ['One', 'Two', 'Any number'], 1],
    quiz: ['Can a binary-tree node have only a right child?', ['Yes', 'No', 'Only at the root'], 0],
  },
  'binary-search-trees': {
    title: 'Binary Search Trees',
    concept: 'A BST is a binary tree where every value in a node’s left subtree is smaller and every value in its right subtree is larger. The rule applies to all descendants.',
    realLife: 'A dictionary index can use ordered branches to narrow where a word belongs.',
    complexity: 'Checking the BST ordering visits O(n) nodes and uses O(h) recursive stack space.',
    practice: ['For a node with value 50, where must value 30 appear?', ['In its left subtree', 'In its right subtree', 'Either side'], 0],
    quiz: ['If a node is in the right subtree of 50, what must be true?', ['It is greater than 50', 'It is smaller than 50', 'It must equal 50'], 0],
  },
  'tree-traversals': {
    title: 'Inorder, Preorder, and Postorder Traversal',
    concept: 'A traversal visits every node once. Preorder visits node-left-right, inorder visits left-node-right, and postorder visits left-right-node.',
    realLife: 'The same folder hierarchy can be listed in different orders depending on whether you record a folder before or after its contents.',
    complexity: 'Each traversal takes O(n) time. DFS uses O(h) call-stack space; level-order uses O(w) queue space, where w is the maximum width.',
    practice: ['In preorder traversal, when is the parent visited?', ['Before its children', 'Between its children', 'After its children'], 0],
    quiz: ['What is the node order for inorder traversal?', ['Node, left, right', 'Left, node, right', 'Left, right, node'], 1],
  },
  'level-order-traversal': {
    title: 'Level Order Traversal',
    concept: 'Level-order traversal visits nodes breadth-first: every node on one depth before moving deeper.',
    realLife: 'It matches how you read a branching decision tree or a company org chart by each layer.',
    complexity: 'A level-order walk is O(n) time and uses O(w) queue space where w is the widest level.',
  },
  'bst-insertion': {
    title: 'BST Insertion',
    concept: 'Insert a value by comparing it to the current node and moving left or right until a null child is reached.',
    realLife: 'Adding a new record to a sorted index or dictionary follows this same BST insertion rule.',
    complexity: 'Insertion takes O(h) time in a balanced BST and O(n) time in a degenerate tree.',
  },
  'bst-deletion': {
    title: 'BST Deletion',
    concept: 'Deleting a node from a BST requires handling leaf, one-child, and two-child cases carefully.',
    realLife: 'Removing keys from ordered dictionaries or database indexes uses the same structural rules.',
    complexity: 'Deletion is O(h); in the worst case of a skewed tree it becomes O(n).',
  },
  'bst-searching': {
    title: 'BST Searching',
    concept: 'A BST search compares the target with each node and follows left or right to prune the search space.',
    realLife: 'Searching a sorted phonebook or ordering index follows the same idea of narrowing by comparisons.',
    complexity: 'Average search time is O(log n), worst-case O(n) in a skewed tree.',
  },
  'tree-height-depth': {
    title: 'Height and Depth of Trees',
    concept: 'Depth measures how far a node is from the root, while height is the longest path from a node to a leaf.',
    realLife: 'It helps reason about recursion depth, balanced trees, and how expensive each subtree is to explore.',
    complexity: 'Computing height and depth for all nodes is O(n).',
  },
  'avl-trees': {
    title: 'AVL Trees and Rotations',
    concept: 'AVL trees keep themselves balanced by rotating subtrees whenever the height difference becomes too large.',
    realLife: 'Database indexes and search tables use balanced trees to keep operations efficient.',
    complexity: 'Balanced tree operations stay O(log n) because the tree height is bounded.',
  },
  'binary-heaps': {
    title: 'Min Heap and Max Heap',
    concept: 'A heap keeps the smallest or largest value at the root and pushes larger items downward according to heap order.',
    realLife: 'Heaps are used for priority queues, event simulation, and scheduling logic.',
    complexity: 'Heap insertion and extraction are O(log n), while peeking at the root is O(1).',
  },
  tries: {
    title: 'Trie Data Structure',
    concept: 'A trie stores strings by characters; each path from the root matches a prefix of a word.',
    realLife: 'Autocomplete and spell-check systems rely on tries to quickly find words with shared prefixes.',
    complexity: 'Insertion and lookup are O(L), where L is the word length.',
  },
};

const presets = [
  { id: 'balanced', label: 'Balanced tree', values: '50, 30, 70, 20, 40, 60, 80' },
  { id: 'sparse', label: 'Sparse tree', values: '10, 5, 20, #, 7, 15, #' },
  { id: 'single', label: 'Single node', values: '42' },
  { id: 'skewed', label: 'Left-skewed tree', values: '8, 4, #, 2, #' },
];
const bstPresets = [
  { id: 'valid', label: 'Valid BST', values: '50, 30, 70, 20, 40, 60, 80' },
  { id: 'invalid', label: 'Invalid descendant', values: '50, 30, 70, 20, 60, 60' },
  { id: 'single', label: 'Single node', values: '42' },
];
const traversalOptions = [
  { id: 'preorder', label: 'Preorder (node, left, right)' },
  { id: 'inorder', label: 'Inorder (left, node, right)' },
  { id: 'postorder', label: 'Postorder (left, right, node)' },
  { id: 'level-order', label: 'Level order (breadth first)' },
];

function TreeDiagram({ tree, step }) {
  const width = 800;
  const { positions, height } = getTreeLayout(tree, width);
  if (!tree.root) {
    return <div className="grid min-h-40 place-items-center text-sm text-slate-500">This is an empty tree.</div>;
  }
  const visited = new Set(step?.visited ?? []);
  const radius = tree.nodes.length > 10 ? 17 : 23;
  return (
    <svg className="h-auto w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Binary tree diagram">
      {tree.nodes.filter((node) => node.parent !== null).map((node) => {
        const parent = positions[node.parent];
        const child = positions[node.id];
        const isMovementEdge = step?.edge?.[0] === node.parent && step?.edge?.[1] === node.id;
        return <line key={`edge-${node.id}`} x1={parent.x} y1={parent.y} x2={child.x} y2={child.y} stroke={isMovementEdge ? '#f59e0b' : '#94a3b8'} strokeWidth={isMovementEdge ? 4 : 2} />;
      })}
      {tree.nodes.map((node) => {
        const point = positions[node.id];
        const active = step?.nodeId === node.id;
        const wasVisited = visited.has(node.id);
        return (
          <g key={node.id} aria-label={`Node ${node.value}${active ? ', current node' : ''}${wasVisited ? ', visited' : ''}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r={radius}
              fill={active ? '#fef3c7' : wasVisited ? '#d1fae5' : '#eff6ff'}
              stroke={active ? '#f59e0b' : wasVisited ? '#10b981' : '#60a5fa'}
              strokeWidth={active ? 4 : 2}
            />
            <text x={point.x} y={point.y + 5} textAnchor="middle" className="fill-slate-800" fontSize={radius > 20 ? 14 : 11} fontWeight="700">{node.value}</text>
          </g>
        );
      })}
    </svg>
  );
}

function AnswerChoices({ title, question, options, answer }) {
  const [choice, setChoice] = useState(null);
  const correct = choice === answer;
  return (
    <section className="card p-5">
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mt-2 text-sm text-slate-700">{question}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option, index) => (
          <button
            key={option}
            type="button"
            aria-pressed={choice === index}
            onClick={() => setChoice(index)}
            className={`rounded-lg border px-3 py-2 text-left text-sm ${choice === index
              ? correct ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-rose-300 bg-rose-50 text-rose-800'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            {option}
          </button>
        ))}
      </div>
      {choice !== null && <p role="status" className={`mt-3 text-sm ${correct ? 'text-emerald-700' : 'text-rose-700'}`}>{correct ? 'Correct!' : 'Not quite; try again.'}</p>}
    </section>
  );
}

export default function TreesStudio({ lessonId }) {
  const content = lessonContent[lessonId] ?? lessonContent['tree-introduction'];
  const practice = Array.isArray(content.practice) && content.practice.length >= 3
    ? content.practice
    : ['What does this tree operation prioritize?', ['The root first', 'Only leaf nodes', 'No specific order'], 0];
  const quiz = Array.isArray(content.quiz) && content.quiz.length >= 3
    ? content.quiz
    : ['Which statement best describes this tree concept?', ['It follows a hierarchical parent-child structure', 'It is always a single chain', 'It can only store one value'], 0];
  const isBstLesson = lessonId === 'binary-search-trees';
  const isTreeOperationLesson = ['level-order-traversal', 'bst-insertion', 'bst-deletion', 'bst-searching', 'tree-height-depth', 'avl-trees', 'binary-heaps', 'tries'].includes(lessonId);
  const availablePresets = isBstLesson ? bstPresets : presets;
  const [inputText, setInputText] = useState(availablePresets[0].values);
  const [insertionValue, setInsertionValue] = useState('35');
  const [searchTarget, setSearchTarget] = useState('40');
  const [deletionValue, setDeletionValue] = useState('30');
  const [selectedPreset, setSelectedPreset] = useState(availablePresets[0].id);
  const [traversal, setTraversal] = useState('inorder');
  const [language, setLanguage] = useState('python');
  const [trace, setTrace] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [inputError, setInputError] = useState('');

  const parsed = useMemo(() => {
    try {
      return { tree: parseBinaryTreeLevelOrder(inputText), error: '' };
    } catch (error) {
      return { tree: null, error: error instanceof Error ? error.message : 'Unable to parse this tree.' };
    }
  }, [inputText]);

  useEffect(() => {
    if (!isPlaying || !trace) return undefined;
    if (currentStep >= trace.length - 1) {
      setIsPlaying(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setCurrentStep((step) => step + 1), 900 / speed);
    return () => window.clearTimeout(timer);
  }, [currentStep, isPlaying, speed, trace]);

  const activeStep = trace?.[currentStep] ?? null;
  const source = useMemo(() => {
    if (lessonId === 'bst-insertion') return getBstInsertionCode(language);
    if (lessonId === 'bst-searching') return getBstSearchCode(language);
    if (lessonId === 'bst-deletion') return getBstDeletionCode(language);
    if (isBstLesson) return getBstValidationCode(language);
    return getTreeTraversalCode(traversal, language);
  }, [isBstLesson, language, lessonId, traversal]);
  const sourceLines = source.code.split('\n');

  const updateInput = (value, preset = 'custom') => {
    setInputText(value);
    setSelectedPreset(preset);
    setTrace(null);
    setCurrentStep(0);
    setIsPlaying(false);
    setInputError('');
  };

  const runVisualization = (event) => {
    event.preventDefault();
    setTrace(null);
    setCurrentStep(0);
    setIsPlaying(false);
    setInputError('');
    try {
      const tree = parseBinaryTreeLevelOrder(inputText);
      let steps = [];
      if (lessonId === 'bst-insertion') {
        const trimmedValue = insertionValue.trim();
        if (!/^[+-]?\d+$/.test(trimmedValue) || !Number.isSafeInteger(Number(trimmedValue))) {
          throw new Error('Enter a valid safe integer to insert.');
        }
        steps = createBstInsertionSteps(tree, Number(trimmedValue));
      } else if (lessonId === 'bst-searching') {
        const trimmedTarget = searchTarget.trim();
        if (!/^[+-]?\d+$/.test(trimmedTarget) || !Number.isSafeInteger(Number(trimmedTarget))) {
          throw new Error('Enter a valid safe integer to search for.');
        }
        steps = createBstSearchSteps(tree, Number(trimmedTarget));
      } else if (lessonId === 'bst-deletion') {
        const trimmedValue = deletionValue.trim();
        if (!/^[+-]?\d+$/.test(trimmedValue) || !Number.isSafeInteger(Number(trimmedValue))) {
          throw new Error('Enter a valid safe integer to delete.');
        }
        steps = createBstDeletionSteps(tree, Number(trimmedValue));
      } else if (isBstLesson) {
        steps = createBstValidationSteps(tree);
      } else if (lessonId === 'level-order-traversal') {
        steps = createTreeTraversalSteps(tree, 'level-order');
      } else if (lessonId === 'tree-height-depth') {
        steps = createTreeHeightDepthSteps(tree);
      } else if (lessonId === 'avl-trees') {
        steps = createAvlRotationSteps(tree, 25).steps;
      } else if (lessonId === 'binary-heaps') {
        steps = createHeapSteps([10, 4, 7, 2, 1, 9], 'min');
      } else if (lessonId === 'tries') {
        steps = createTrieSteps(['cat', 'car', 'cart']);
      } else {
        steps = createTreeTraversalSteps(tree, traversal);
      }
      setTrace(steps);
    } catch (error) {
      setInputError(error instanceof Error ? error.message : 'Unable to generate this tree trace.');
    }
  };

  const moveToStep = (step) => {
    setIsPlaying(false);
    setCurrentStep(step);
  };

  const displayedTree = ['bst-insertion', 'bst-deletion'].includes(lessonId) ? activeStep?.tree ?? parsed.tree : parsed.tree;
  const nodeValue = (nodeId) => nodeId === null || nodeId === undefined ? '—' : displayedTree?.nodes[nodeId]?.value ?? '—';
  const visitedValues = (activeStep?.visited ?? []).map((nodeId) => nodeValue(nodeId));
  const searchPathValues = activeStep?.pathValues ?? (activeStep?.path ?? []).map((nodeId) => nodeValue(nodeId));
  const callStackValues = (activeStep?.callStack ?? []).map((nodeId) => nodeValue(nodeId));
  const queueValues = (activeStep?.queue ?? []).map((nodeId) => nodeValue(nodeId));
  return (
    <div className="space-y-5">
      <section className="card p-6">
        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.18em] text-blue-600">Tree learning studio · Interactive</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">{content.title}</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[['Simple definition', content.concept], ['Real-life example', content.realLife], ['Time and space', content.complexity]].map(([title, text]) => (
            <div key={title} className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
              <h3 className="font-semibold text-slate-800">{title}</h3>
              <p className="mt-1 text-sm leading-5 text-slate-600">{text}</p>
            </div>
          ))}
        </div>

        <form onSubmit={runVisualization} className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[230px] flex-1">
              <label htmlFor="tree-values" className="mb-1 block text-sm font-medium text-slate-700">{['bst-insertion', 'bst-searching', 'bst-deletion'].includes(lessonId) ? 'Existing BST values (level order)' : 'Level-order node values'}</label>
              <input
                id="tree-values"
                value={inputText}
                onChange={(event) => updateInput(event.target.value)}
                placeholder="50, 30, 70, 20, 40, 60, 80"
                aria-invalid={Boolean(inputError || parsed.error)}
                aria-describedby={inputError || parsed.error ? 'tree-input-error' : 'tree-input-help'}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
              />
              <p id="tree-input-help" className="mt-1 text-xs text-slate-500">Use commas and # for a missing child. Maximum 15 nodes.</p>
            </div>
            {lessonId === 'bst-insertion' && (
              <div className="min-w-[150px]">
                <label htmlFor="bst-insert-value" className="mb-1 block text-sm font-medium text-slate-700">Number to insert</label>
                <input
                  id="bst-insert-value"
                  type="text"
                  inputMode="numeric"
                  value={insertionValue}
                  onChange={(event) => {
                    setInsertionValue(event.target.value);
                    setTrace(null);
                    setCurrentStep(0);
                    setIsPlaying(false);
                    setInputError('');
                  }}
                  aria-invalid={Boolean(inputError)}
                  aria-describedby={inputError ? 'tree-input-error' : undefined}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                />
              </div>
            )}
            {lessonId === 'bst-searching' && (
              <div className="min-w-[150px]">
                <label htmlFor="bst-search-target" className="mb-1 block text-sm font-medium text-slate-700">Target number</label>
                <input
                  id="bst-search-target"
                  type="text"
                  inputMode="numeric"
                  value={searchTarget}
                  onChange={(event) => {
                    setSearchTarget(event.target.value);
                    setTrace(null);
                    setCurrentStep(0);
                    setIsPlaying(false);
                    setInputError('');
                  }}
                  aria-invalid={Boolean(inputError)}
                  aria-describedby={inputError ? 'tree-input-error' : undefined}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                />
              </div>
            )}
            {lessonId === 'bst-deletion' && (
              <div className="min-w-[150px]">
                <label htmlFor="bst-delete-value" className="mb-1 block text-sm font-medium text-slate-700">Value to delete</label>
                <input
                  id="bst-delete-value"
                  type="text"
                  inputMode="numeric"
                  value={deletionValue}
                  onChange={(event) => {
                    setDeletionValue(event.target.value);
                    setTrace(null);
                    setCurrentStep(0);
                    setIsPlaying(false);
                    setInputError('');
                  }}
                  aria-invalid={Boolean(inputError)}
                  aria-describedby={inputError ? 'tree-input-error' : undefined}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                />
              </div>
            )}
            {!isBstLesson && (
              <div>
                <label htmlFor="tree-traversal" className="mb-1 block text-sm font-medium text-slate-700">Traversal</label>
                <select id="tree-traversal" value={traversal} onChange={(event) => { setTraversal(event.target.value); setTrace(null); setCurrentStep(0); setIsPlaying(false); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
                  {traversalOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                </select>
              </div>
            )}
            <div>
              <label htmlFor="tree-preset" className="mb-1 block text-sm font-medium text-slate-700">Example preset</label>
              <select id="tree-preset" value={selectedPreset} onChange={(event) => {
                if (event.target.value === 'custom') {
                  setSelectedPreset('custom');
                  return;
                }
                const preset = availablePresets.find((item) => item.id === event.target.value);
                if (preset) updateInput(preset.values, preset.id);
              }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
                {availablePresets.map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
                <option value="custom">Custom input</option>
              </select>
            </div>
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
              {lessonId === 'bst-insertion' ? 'Insert number' : lessonId === 'bst-searching' ? 'Search BST' : lessonId === 'bst-deletion' ? 'Delete value' : isBstLesson ? 'Validate BST' : 'Visualize traversal'}
            </button>
          </div>
          {(inputError || parsed.error) && <p id="tree-input-error" role="alert" className="mt-3 text-sm text-rose-700">{inputError || parsed.error}</p>}
        </form>
      </section>

      <section className="card p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-slate-800">{isBstLesson ? 'BST ordering check' : 'Hierarchical tree visualization'}</h3>
          <span className="text-xs text-slate-500">Current node is amber · visited nodes are green</span>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-3">
          {displayedTree ? <TreeDiagram tree={displayedTree} step={activeStep} /> : <div className="grid min-h-40 place-items-center text-sm text-rose-700">Correct the input to display the tree.</div>}
        </div>
        {activeStep?.complete && (
          <div role="status" className={`mt-3 rounded-lg px-3 py-2 text-sm font-semibold ${activeStep.duplicate || activeStep.result?.isBst === false || (lessonId === 'bst-deletion' && !activeStep.result.deleted) ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'}`}>
            {lessonId === 'bst-deletion'
              ? activeStep.result.deleted
                ? `Deleted ${activeStep.result.deletedValue}. Deletion case: ${activeStep.result.deletionCase === 'two-children' ? `two children; successor ${activeStep.result.successorValue}` : activeStep.result.deletionCase}.`
                : `Element Not Found: ${activeStep.result.value} is not in the BST.`
              : lessonId === 'bst-searching'
              ? activeStep.result.found ? 'Element Found' : 'Element Not Found'
              : lessonId === 'bst-insertion'
              ? activeStep.duplicate
                ? `Duplicate: ${activeStep.insertedValue ?? insertionValue} is already present. The BST was not changed.`
                : `Inserted ${activeStep.insertedValue} successfully. The tree now contains ${activeStep.tree.nodes.length} nodes.`
              : isBstLesson
              ? activeStep.result.isBst ? 'Valid BST: every node satisfies its ancestor bounds.' : `Not a BST: ${activeStep.result.offendingValue} violates its allowed ancestor bounds.`
              : `Traversal order: ${activeStep.result.join(' → ') || '(empty tree)'}`}
          </div>
        )}
        {lessonId === 'bst-deletion' && activeStep && (
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              <span className="text-slate-500">Search path:</span>{' '}
              <span className="font-semibold text-slate-800">{searchPathValues.join(' → ') || '(empty tree)'}</span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              <span className="text-slate-500">Comparisons:</span>{' '}
              <span className="font-semibold text-slate-800">{activeStep.comparisons}</span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              <span className="text-slate-500">Tree values:</span>{' '}
              <span className="font-semibold text-slate-800">{activeStep.result.values.join(', ') || '(empty)'}</span>
            </div>
          </div>
        )}
        {lessonId === 'bst-searching' && activeStep && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              <span className="text-slate-500">Search path:</span>{' '}
              <span className="font-semibold text-slate-800">{searchPathValues.join(' → ') || '(empty tree)'}</span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              <span className="text-slate-500">Total comparisons:</span>{' '}
              <span className="font-semibold text-slate-800">{activeStep.comparisons}</span>
            </div>
          </div>
        )}
        {lessonId === 'bst-insertion' && activeStep?.direction && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
            Move {activeStep.direction} from {activeStep.currentValue}; {activeStep.direction === 'left' ? 'the value is smaller.' : 'the value is larger.'}
          </p>
        )}
      </section>

      <section className="card p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button type="button" disabled={!trace || isPlaying} onClick={() => { if (currentStep >= trace.length - 1) setCurrentStep(0); setIsPlaying(true); }} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white enabled:hover:bg-blue-500 disabled:opacity-50">Play</button>
          <button type="button" disabled={!isPlaying} onClick={() => setIsPlaying(false)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50">Pause</button>
          <button type="button" disabled={!trace || currentStep >= trace.length - 1} onClick={() => moveToStep(currentStep + 1)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50">Next</button>
          <button type="button" disabled={!trace || currentStep <= 0} onClick={() => moveToStep(currentStep - 1)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50">Previous</button>
          <button type="button" onClick={() => { setIsPlaying(false); setCurrentStep(0); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">Reset</button>
          <label className="ml-auto flex items-center gap-2 text-sm text-slate-600">
            Speed
            <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm">
              <option value={0.5}>0.5x</option><option value={1}>1x</option><option value={1.5}>1.5x</option><option value={2}>2x</option>
            </select>
          </label>
        </div>
        <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
          <div className="font-semibold">{trace ? `Step ${currentStep + 1} / ${trace.length}` : 'Generate a trace to step through the algorithm.'}</div>
          <p className="mt-1">{activeStep?.operation ?? 'Each step synchronizes the current node, explanation, variables, and source line.'}</p>
          {activeStep && <p className="mt-1 text-slate-600">{activeStep.explanation}</p>}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="grid gap-3 sm:grid-cols-2">
            {[['Visited order', visitedValues.join(' → ') || '—'], ['Recursion stack', callStackValues.join(' → ') || '—'], ['Queue', queueValues.join(' → ') || '—'], ['Current value', nodeValue(activeStep?.nodeId)]].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
                <div className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</div>
              </div>
            ))}
            {isBstLesson && activeStep?.low !== undefined && (
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
                Allowed range: <span className="font-semibold">({activeStep.low}, {activeStep.high})</span>
              </div>
            )}
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-900 p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="font-semibold text-white">Trace-mapped source code</h3>
              <select aria-label="Source code language" value={language} onChange={(event) => setLanguage(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700">
                <option value="python">Python</option><option value="java">Java</option>
              </select>
            </div>
            <div className="overflow-x-auto font-mono text-xs text-slate-100">
              {sourceLines.map((line, index) => (
                <div key={`${index}-${line}`} className={`whitespace-pre rounded px-2 py-1 ${activeStep?.lineIds?.includes(source.lineIds[index + 1]) ? 'bg-blue-500/40 text-white' : ''}`}>
                  <span className="mr-3 inline-block w-5 text-right text-slate-400">{index + 1}</span>{line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AnswerChoices title="Practice question" question={practice[0]} options={practice[1]} answer={practice[2]} />
      <AnswerChoices title="Quick quiz" question={quiz[0]} options={quiz[1]} answer={quiz[2]} />
    </div>
  );
}

export { treeStudioLessonIds };
