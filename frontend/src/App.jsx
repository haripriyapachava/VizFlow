import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { curriculumData, studentOverview, facultySummary } from './data/curriculum';
import FundamentalsStudio from './FundamentalsStudio';
import GraphStudio from './GraphStudio';
import TreesStudio from './TreesStudio';
import { fundamentalsLessonIds } from './lib/fundamentals';
import { graphStudioLessonIds } from './lib/graphVisualization';
import { treeStudioLessonIds } from './lib/treeVisualization';
import {
  createLessonPlayback,
  createCycleStartSteps,
  getLessonDefinition,
  isAlgorithmImplemented,
  parseInteger,
  parseIntegerArray,
} from './lib/visualizationEngine';

const twoPointerPatterns = [
  { id: 'two-sum', label: 'Two Sum (sorted array)' },
  { id: 'reverse-array', label: 'Reverse an array' },
  { id: 'reverse-string', label: 'Reverse a string' },
  { id: 'palindrome', label: 'Palindrome check' },
  { id: 'remove-duplicates', label: 'Remove duplicates (sorted)' },
  { id: 'move-zeroes', label: 'Move zeroes' },
  { id: 'container-water', label: 'Container With Most Water' },
  { id: 'merge', label: 'Merge two sorted arrays' },
  { id: 'three-sum', label: 'Three Sum' },
  { id: 'fast-slow', label: 'Fast and Slow Pointers' },
];

const slidingPatterns = [
  { id: 'fixed', label: 'Fixed-size maximum sum' },
  { id: 'minimum', label: 'Minimum-size sum (positive values)' },
  { id: 'substring', label: 'Longest unique substring' },
];

const patternExamples = {
  'two-sum': [
    { id: 'default', label: 'Find 10', values: [1, 2, 3, 4, 6, 8], target: 10 },
    { id: 'small', label: 'Small sorted array', values: [-3, 0, 4, 7], target: 1 },
  ],
  'reverse-array': [
    { id: 'default', label: 'Reverse example', values: [1, 2, 3, 4, 5] },
    { id: 'duplicates', label: 'With duplicates', values: [3, 3, 2, 1] },
  ],
  'reverse-string': [
    { id: 'default', label: 'Reverse VIZFLOW', text: 'VIZFLOW' },
    { id: 'short', label: 'Short text', text: 'code' },
  ],
  palindrome: [
    { id: 'default', label: 'Palindrome', text: 'racecar' },
    { id: 'not-palindrome', label: 'Not a palindrome', text: 'visual' },
  ],
  'remove-duplicates': [
    { id: 'default', label: 'Sorted duplicates', values: [1, 1, 2, 2, 3, 4, 4] },
    { id: 'unique', label: 'Already unique', values: [1, 2, 3, 4] },
  ],
  'move-zeroes': [
    { id: 'default', label: 'Move zeroes', values: [0, 1, 0, 3, 12] },
    { id: 'mixed', label: 'Zeroes between values', values: [4, 0, 5, 0, 0, 2] },
  ],
  'container-water': [
    { id: 'default', label: 'Classic example', values: [1, 8, 6, 2, 5, 4, 8, 3, 7] },
    { id: 'small', label: 'Small example', values: [2, 3, 4, 5, 18, 17, 6] },
  ],
  merge: [
    { id: 'default', label: 'Merge sorted arrays', values: [1, 4, 7], secondaryValues: [2, 3, 8] },
    { id: 'uneven', label: 'Uneven lengths', values: [1, 5], secondaryValues: [2, 3, 4, 9] },
  ],
  'three-sum': [
    { id: 'default', label: 'Triplets summing to zero', values: [-1, 0, 1, 2, -1, -4], target: 0 },
    { id: 'target-6', label: 'Target 6', values: [1, 2, 3, 4, 5], target: 6 },
  ],
  'fast-slow': [
    { id: 'default', label: 'Odd-length array', values: [10, 20, 30, 40, 50] },
    { id: 'even', label: 'Even-length array', values: [5, 10, 15, 20, 25, 30] },
  ],
  fixed: [
    { id: 'default', label: 'Maximum sum, k = 3', values: [2, 1, 5, 1, 3, 2], target: 3 },
    { id: 'longer', label: 'Longer example, k = 4', values: [4, 2, 1, 7, 8, 1, 2, 8, 1, 0], target: 4 },
  ],
  minimum: [
    { id: 'default', label: 'Minimum sum at least 7', values: [2, 3, 1, 2, 4, 3], target: 7 },
    { id: 'not-found', label: 'No qualifying window', values: [1, 1, 1, 1], target: 10 },
  ],
  substring: [
    { id: 'default', label: 'Repeated substring', text: 'abcabcbb' },
    { id: 'unique', label: 'All unique', text: 'vizflow' },
  ],
};

function getPatternInputText(example) {
  return example.text ?? (example.values ?? []).join(', ');
}

function getLearningCheck(algorithmId, pattern) {
  if (algorithmId === 'two-pointers') {
    const checks = {
      'two-sum': ['In a sorted array, the current sum is smaller than the target. Which pointer moves?', ['LEFT moves right', 'RIGHT moves left', 'Move both pointers'], 0],
      'reverse-array': ['Which positions are swapped first when reversing?', ['Two middle positions', 'The first and last positions', 'Two adjacent positions'], 1],
      'reverse-string': ['Where do the two pointers start when reversing text?', ['At opposite ends', 'Both at the center', 'At index 1'], 0],
      palindrome: ['What should happen after the outer characters match?', ['Stop immediately', 'Move both pointers inward', 'Move only RIGHT'], 1],
      'remove-duplicates': ['What does the slow pointer represent?', ['The next unique-value write position', 'The end of the array', 'A sortedness check'], 0],
      'move-zeroes': ['What does the fast pointer look for?', ['The next zero', 'The next non-zero value', 'The last index'], 1],
      'container-water': ['Which wall should move after measuring an area?', ['The taller wall', 'The shorter wall', 'Both walls always'], 1],
      merge: ['When merging two sorted arrays, which front value is appended?', ['The larger value', 'The smaller value', 'Always Array A'], 1],
      'three-sum': ['If a sorted three-value sum is too small, what changes?', ['Move LEFT right', 'Move RIGHT left', 'Move the anchor left'], 0],
      'fast-slow': ['How far does FAST move for every one step by SLOW?', ['One step', 'Two steps', 'Three steps'], 1],
    };
    const [question, options, correct] = checks[pattern] ?? checks['two-sum'];
    return { question, options, correct, explanation: 'Pointer movement follows the data comparison and preserves the pattern’s invariant.' };
  }
  if (algorithmId === 'sliding-window') {
    const checks = {
      fixed: ['How is a fixed-size window sum updated as it moves?', ['Recompute every value', 'Subtract outgoing and add incoming', 'Only add the incoming value'], 1],
      minimum: ['When the window sum reaches the target, why shrink from LEFT?', ['To find a shorter valid window', 'To make the sum larger', 'To sort the array'], 0],
      substring: ['What happens when RIGHT adds a repeated character inside the window?', ['Move LEFT past its prior occurrence', 'Delete the whole window', 'Move RIGHT backward'], 0],
    };
    const [question, options, correct] = checks[pattern] ?? checks.fixed;
    return { question, options, correct, explanation: 'The window changes only as much as needed to preserve the condition being measured.' };
  }
  return null;
}

function getPointerLabels(step, lessonId, arrayLength) {
  const pointers = [];

  if (step?.i !== undefined && step?.i !== null) pointers.push({ label: 'i', index: step.i });
  if (step?.j !== undefined && step?.j !== null) pointers.push({ label: 'j', index: step.j });
  if (step?.minIndex !== undefined && step?.minIndex !== null) pointers.push({ label: 'min', index: step.minIndex });
  if (step?.mid !== undefined && step?.mid !== null) pointers.push({ label: 'mid', index: step.mid });
  if (step?.low !== undefined && step?.low !== null) pointers.push({ label: 'low', index: step.low });
  if (step?.high !== undefined && step?.high !== null) pointers.push({ label: 'high', index: step.high });

  if (lessonId === 'bubble-sort' && step?.j !== undefined && step?.j !== null) {
    pointers.push({ label: 'j + 1', index: step.j + 1 });
  }

  return pointers.filter((item) => item.index >= 0 && item.index < arrayLength);
}

function getLiveVariables(step, lessonId) {
  if (!step) return [];
  const variables = [];

  if (lessonId === 'bubble-sort') {
    if (step.i !== null) variables.push({ label: 'i', value: step.i });
    if (step.j !== null) variables.push({ label: 'j', value: step.j });
    if (step.leftValue !== undefined) variables.push({ label: 'arr[j]', value: step.leftValue });
    if (step.rightValue !== undefined) variables.push({ label: 'arr[j + 1]', value: step.rightValue });
    if (step.comparisonResult !== undefined) {
      variables.push({ label: 'arr[j] > arr[j + 1]', value: String(step.comparisonResult) });
    }
    if (step.swapped !== undefined) variables.push({ label: 'swapped', value: String(step.swapped) });
  }

  if (lessonId === 'linear-search') {
    if (step.i !== null) variables.push({ label: 'i', value: step.i });
    if (step.currentValue !== undefined) variables.push({ label: 'arr[i]', value: step.currentValue });
    if (step.target !== undefined) variables.push({ label: 'target', value: step.target });
    if (step.comparisonResult !== undefined) {
      variables.push({ label: 'arr[i] === target', value: String(step.comparisonResult) });
    }
  }

  if (lessonId === 'selection-sort') {
    if (step.i !== null) variables.push({ label: 'i', value: step.i });
    if (step.j !== null) variables.push({ label: 'j', value: step.j });
    if (step.minIndex !== undefined) variables.push({ label: 'minIndex', value: step.minIndex });
    if (step.currentValue !== undefined) variables.push({ label: 'arr[j]', value: step.currentValue });
    if (step.minimumValue !== undefined) variables.push({ label: 'arr[minIndex]', value: step.minimumValue });
    if (step.comparisonResult !== undefined) variables.push({ label: 'arr[j] < arr[minIndex]', value: String(step.comparisonResult) });
  }

  if (lessonId === 'insertion-sort') {
    if (step.i !== null) variables.push({ label: 'i', value: step.i });
    if (step.j !== null) variables.push({ label: 'j', value: step.j });
    if (step.key !== undefined) variables.push({ label: 'key', value: step.key });
    if (step.currentValue !== undefined) variables.push({ label: 'arr[j]', value: step.currentValue });
    if (step.comparisonResult !== undefined) variables.push({ label: 'arr[j] > key', value: String(step.comparisonResult) });
    if (step.shiftedValue !== undefined) variables.push({ label: 'shifted value', value: step.shiftedValue });
  }

  if (lessonId === 'binary-search') {
    if (step.low !== null) variables.push({ label: 'low', value: step.low });
    if (step.mid !== null) variables.push({ label: 'mid', value: step.mid });
    if (step.high !== null) variables.push({ label: 'high', value: step.high });
    if (step.midValue !== undefined) variables.push({ label: 'arr[mid]', value: step.midValue });
    if (step.target !== undefined) variables.push({ label: 'target', value: step.target });
    if (step.comparisonResult !== undefined) {
      variables.push({ label: 'comparison result', value: String(step.comparisonResult) });
    }
  }

  if (lessonId === 'singly-linked-list' || lessonId === 'doubly-linked-list') {
    if (step.currentIndex !== undefined) variables.push({ label: 'current', value: step.currentIndex });
    if (step.target !== undefined) variables.push({ label: 'target', value: step.target });
    if (step.headIndex !== undefined) variables.push({ label: 'head', value: step.headIndex });
    if (step.visitValue !== undefined) variables.push({ label: 'value', value: step.visitValue });
    if (step.result !== undefined) variables.push({ label: 'result', value: step.result });
  }

  if (lessonId === 'cycle-detection') {
    const nodeName = (id) => {
      if (id === null || id === undefined) return 'NULL';
      const node = step.nodes?.find((item) => item.id === id);
      return node ? `node ${id} (${node.value})` : 'NULL';
    };
    variables.push(
      { label: 'slow', value: nodeName(step.slowId) },
      { label: 'fast', value: nodeName(step.fastId) },
      { label: 'slow.next', value: nodeName(step.slowNextId) },
      { label: 'fast.next', value: nodeName(step.fastNextId) },
      { label: 'fast.next.next', value: nodeName(step.fastNextNextId) },
      { label: 'iteration count', value: step.iteration ?? 0 },
      { label: 'cycle detected', value: String(step.cycleDetected ?? false) },
    );
    if (step.meetingNodeId !== undefined) variables.push({ label: 'first meeting node ID', value: step.meetingNodeId });
    if (step.cycleStartNodeId !== undefined) variables.push({ label: 'cycle start node ID', value: step.cycleStartNodeId });
  }

  if (lessonId === 'sliding-window') {
    if (step.left === undefined && step.windowStart !== undefined) variables.push({ label: 'left', value: step.windowStart });
    if (step.right === undefined && step.windowEnd !== undefined) variables.push({ label: 'right', value: step.windowEnd });
    if (step.windowSize !== undefined) variables.push({ label: 'window size', value: step.windowSize });
    if (step.currentSum !== undefined) variables.push({ label: 'window sum', value: step.currentSum });
    if (step.maxSum !== undefined) variables.push({ label: 'max sum', value: step.maxSum });
    if (step.outgoingIndex !== undefined) variables.push({ label: 'out', value: step.outgoingIndex });
    if (step.incomingIndex !== undefined) variables.push({ label: 'in', value: step.incomingIndex });
    if (step.minLength !== undefined) variables.push({ label: 'minimum length', value: step.minLength ?? '—' });
    if (step.bestLength !== undefined) variables.push({ label: 'best length', value: step.bestLength });
  }

  if (lessonId === 'two-pointers') {
    for (const key of ['left', 'right', 'anchor', 'leftValue', 'rightValue', 'currentSum', 'currentArea', 'bestArea', 'target', 'decision', 'triples', 'merged']) {
      if (step[key] !== undefined) variables.push({ label: key, value: step[key] });
    }
  }

  variables.push(
    ...Object.entries(step.metrics ?? {}).map(([label, value]) => ({
      label: label[0].toUpperCase() + label.slice(1),
      value,
    })),
  );
  return variables;
}

function StatCard({ label, value, subtext, accent = 'blue' }) {
  const palette = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    purple: 'bg-violet-50 text-violet-700 border-violet-200',
  };

  return (
    <div className={`metric border ${palette[accent]}`}>
      <div className="text-sm font-medium opacity-80">{label}</div>
      <div className="mt-3 text-3xl font-bold">{value}</div>
      <div className="mt-1 text-xs opacity-70">{subtext}</div>
    </div>
  );
}

function ModuleList({ onSelectLesson, completedLessons = [] }) {
  return (
    <div className="space-y-5">
      {curriculumData.map((module) => (
        <div key={module.id} className="card p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">{module.title}</h3>
              <p className="text-sm text-slate-500">{module.description}</p>
            </div>
            <span className="badge bg-slate-100 text-slate-700">{module.lessons.length} lessons</span>
          </div>
          <div className="lesson-grid">
            {module.lessons.map((lesson) => {
              const algorithmId = lesson.algorithm || lesson.id;
              const supported = isAlgorithmImplemented(algorithmId)
                || fundamentalsLessonIds.includes(algorithmId)
                || treeStudioLessonIds.includes(algorithmId)
                || graphStudioLessonIds.includes(algorithmId);
              const status = lesson.status ?? (supported ? 'interactive' : 'in-development');
              const selectable = supported || Boolean(lesson.status);
              return (
              <button
                key={lesson.id}
                type="button"
                disabled={!selectable}
                onClick={() => onSelectLesson({ ...lesson, algorithm: lesson.algorithm || lesson.id })}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition enabled:hover:border-blue-300 enabled:hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="badge bg-white text-slate-700">{lesson.topic}</span>
                  <div className="flex flex-wrap justify-end gap-1">
                    <span className={`badge ${status === 'interactive'
                      ? 'bg-emerald-100 text-emerald-700'
                      : status === 'in-development'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'}`}>
                      {status === 'interactive' ? 'Interactive' : status === 'in-development' ? 'In Development' : 'Coming Soon'}
                    </span>
                    {completedLessons.includes(lesson.id) && <span className="badge bg-blue-100 text-blue-700">Completed</span>}
                  </div>
                </div>
                <div className="font-semibold text-slate-800">{lesson.title}</div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{lesson.difficulty}</span>
                  <span>{lesson.duration} min</span>
                </div>
              </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ArrayDiagram({ step, lessonId }) {
  const values = step?.array ?? [];
  const pointerLabels = getPointerLabels(step, lessonId, values.length);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-500">
        <span>Live algorithm visualization</span>
        <span>arr</span>
      </div>
      <div className="overflow-x-auto pb-2">
        {values.length ? (
          <div className="flex min-w-[520px] items-stretch gap-2 pt-5">
            {values.map((value, index) => {
              const isCompared = step?.compared?.includes(index) ?? false;
              const isSwapped = step?.swappedIndices?.includes(index) ?? false;
              const isMid = step?.mid === index;
              const isLow = step?.low === index;
              const isHigh = step?.high === index;
              const labels = pointerLabels.filter((item) => item.index === index);

              return (
                <div key={`${value}-${index}`} className="flex min-w-12 flex-1 flex-col items-center">
                  <div className="mb-1 flex min-h-5 flex-wrap justify-center gap-1">
                    {labels.map((item) => (
                      <span key={`${item.label}-${item.index}`} className="rounded-full bg-slate-900 px-1.5 py-0.5 text-[9px] font-medium text-white">
                        {item.label}
                      </span>
                    ))}
                  </div>
                  <div
                    className={[
                      'flex h-16 w-full items-center justify-center rounded-xl border text-lg font-semibold transition-colors',
                      isSwapped ? 'border-emerald-500 bg-emerald-100 text-emerald-800' : isCompared ? 'border-amber-500 bg-amber-100 text-amber-800' : isMid ? 'border-violet-500 bg-violet-100 text-violet-800' : isLow || isHigh ? 'border-blue-500 bg-blue-100 text-blue-800' : 'border-slate-300 bg-white text-slate-700',
                    ].join(' ')}
                  >
                    {value}
                  </div>
                  <div className="mt-1 text-[10px] text-slate-500">{index}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            Run valid input to generate the execution visualization.
          </p>
        )}
      </div>
    </div>
  );
}

function TwoPointersDiagram({ step, pattern }) {
  const arrays = pattern === 'merge'
    ? [{ label: 'Array A', values: step?.array ?? [], pointerKey: 'left', pointerLabel: 'LEFT', pointerColor: 'text-blue-700 bg-blue-100' },
      { label: 'Array B', values: step?.secondaryArray ?? [], pointerKey: 'right', pointerLabel: 'RIGHT', pointerColor: 'text-violet-700 bg-violet-100' }]
    : [{ label: pattern === 'reverse-string' || pattern === 'palindrome' ? 'characters' : 'array', values: step?.array ?? [] }];
  const pointerRows = pattern === 'fast-slow'
    ? [{ key: 'left', label: 'SLOW', color: 'text-blue-700 bg-blue-100' }, { key: 'right', label: 'FAST', color: 'text-violet-700 bg-violet-100' }]
    : pattern === 'three-sum'
      ? [{ key: 'anchor', label: 'ANCHOR', color: 'text-amber-800 bg-amber-100' }, { key: 'left', label: 'LEFT', color: 'text-blue-700 bg-blue-100' }, { key: 'right', label: 'RIGHT', color: 'text-violet-700 bg-violet-100' }]
      : [{ key: 'left', label: 'LEFT', color: 'text-blue-700 bg-blue-100' }, { key: 'right', label: 'RIGHT', color: 'text-violet-700 bg-violet-100' }];

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-500">
        <span>Two-pointer visualization</span>
        <span>Step {step?.step ?? '—'}</span>
      </div>
      <div className="space-y-4 overflow-x-auto pb-1">
        {arrays.map((array) => (
          <div key={array.label} className="min-w-[500px]">
            {pattern === 'merge' && <div className="mb-1 text-xs font-semibold text-slate-500">{array.label}</div>}
            <div className="flex items-stretch gap-2">
              {array.values.map((value, index) => {
                const compared = pattern === 'merge'
                  ? array.label === 'Array A' ? step?.compared?.includes(index) : step?.comparedSecondary?.includes(index)
                  : step?.compared?.includes(index);
                const isLeft = (pattern !== 'merge' || array.label === 'Array A') && step?.left === index;
                const isRight = (pattern !== 'merge' || array.label === 'Array B') && step?.right === index;
                const isMatch = compared && step?.match;
                const isRejected = compared && step?.rejected;
                return (
                  <div key={`${value}-${index}`} className="flex min-w-12 flex-1 flex-col items-center">
                    <div className={[
                      'flex h-14 w-full items-center justify-center rounded-xl border-2 text-lg font-bold transition-colors duration-300',
                      isMatch ? 'border-emerald-500 bg-emerald-100 text-emerald-800'
                        : isRejected ? 'border-rose-500 bg-rose-100 text-rose-800'
                          : compared ? 'border-amber-400 bg-amber-100 text-amber-900'
                            : 'border-slate-300 bg-white text-slate-700',
                    ].join(' ')}>{value}</div>
                    <div className="mt-1 text-[10px] text-slate-500">{index}</div>
                    <div className="mt-1 flex min-h-9 flex-col items-center gap-0.5">
                      {pointerRows.filter((pointer) => {
                        if (pattern === 'merge') return (array.label === 'Array A' && pointer.key === 'left' && step?.left === index)
                          || (array.label === 'Array B' && pointer.key === 'right' && step?.right === index);
                        return step?.[pointer.key] === index;
                      }).map((pointer) => (
                        <div key={pointer.key} className={`pointer-marker flex flex-col items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold ${pointer.color}`}>
                          <span>↓</span><span>{pointer.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Left index', step?.left ?? '—'],
          ['Right index', step?.right ?? '—'],
          ['Left value', step?.leftValue ?? step?.array?.[step?.left] ?? '—'],
          ['Right value', step?.rightValue ?? step?.array?.[step?.right] ?? '—'],
          [pattern === 'container-water' ? 'Current area' : 'Current sum', step?.currentSum ?? step?.currentArea ?? '—'],
          ['Target', step?.target ?? '—'],
          ['Decision', step?.decision ?? 'Waiting for a comparison'],
          ['Step number', step?.step ?? '—'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-white p-2 text-xs text-slate-600">
            <div className="font-medium text-slate-500">{label}</div>
            <div className="mt-0.5 break-words font-semibold text-slate-800">{value}</div>
          </div>
        ))}
      </div>
      {pattern === 'merge' && step?.merged && (
        <div className="mt-3 rounded-lg bg-white p-3 text-sm text-slate-700">
          Merged output so far: <span className="font-semibold">[{step.merged.join(', ')}]</span>
        </div>
      )}
      {step?.complete && typeof step.result === 'number' && (
        <p className="mt-3 rounded-lg bg-emerald-50 p-2 text-sm font-semibold text-emerald-800">
          Pair found: {step.result}
        </p>
      )}
      {step?.explanation && <p className="mt-3 text-sm leading-5 text-slate-600">{step.explanation}</p>}
    </div>
  );
}

function LinkedListDiagram({ step, lessonId }) {
  const nodes = Array.isArray(step?.nodes) ? step.nodes : [];
  const headIndex = step?.headIndex ?? 0;
  const activeIndex = step?.currentIndex ?? null;

  if (!nodes.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
        Run valid input to generate the linked list trace.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-500">
        <span>Live linked list</span>
        <span>{lessonId === 'doubly-linked-list' ? 'DLL' : 'SLL'}</span>
      </div>
      <div className="overflow-x-auto pb-3">
        <div className="flex min-w-[640px] items-center gap-2">
          <span className="rounded-full bg-slate-900 px-2 py-1 text-xs font-medium text-white">HEAD</span>
          {nodes.map((node, index) => (
            <React.Fragment key={`${node.value}-${index}`}>
              <div
                className={[
                  'min-w-[102px] rounded-xl border-2 p-2 text-center shadow-sm',
                  index === activeIndex ? 'border-blue-500 bg-blue-100 text-blue-800' : 'border-slate-300 bg-white text-slate-700',
                  lessonId === 'doubly-linked-list' ? 'border-l-violet-400' : '',
                ].join(' ')}
              >
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{index}</div>
                {lessonId === 'doubly-linked-list' ? (
                  <div className="grid grid-cols-3 text-xs font-medium">
                    <span className="rounded bg-slate-100 px-1 py-0.5 text-slate-500">{node.prevValue ?? 'NULL'}</span>
                    <span className="rounded bg-violet-100 px-1 py-0.5 text-violet-700">{node.value}</span>
                    <span className="rounded bg-slate-100 px-1 py-0.5 text-slate-500">{node.nextValue ?? 'NULL'}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-sm font-bold">
                    <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">{node.value}</span>
                    <span className="text-xs text-slate-500">next</span>
                  </div>
                )}
              </div>
              {index < nodes.length - 1 ? (
                <div className="text-2xl text-slate-400">→</div>
              ) : (
                <div className="rounded-full border border-dashed border-slate-400 px-2 py-1 text-xs text-slate-500">NULL</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      {headIndex !== null && <div className="mt-2 text-xs text-slate-500">Head pointer: index {headIndex}</div>}
    </div>
  );
}

function CycleDetectionDiagram({ step }) {
  const nodes = step?.nodes ?? [];
  const width = Math.max(620, nodes.length * 140 + 130);
  const centerX = (id) => 90 + id * 140;
  const nodeY = 116;
  const links = nodes.map((node) => {
    if (node.nextId === null) return null;
    if (node.nextId === node.id + 1) {
      return (
        <path
          key={`edge-${node.id}`}
          d={`M ${centerX(node.id) + 40} 151 L ${centerX(node.nextId) - 42} 151`}
          className="fill-none stroke-slate-500"
          strokeWidth="2.5"
          markerEnd="url(#cycle-arrow)"
        />
      );
    }
    const tail = centerX(node.id);
    const entrance = centerX(node.nextId);
    return (
      <g key={`edge-${node.id}`}>
        <path
          d={`M ${tail + 40} 151 C ${tail + 95} 255, ${entrance + 55} 255, ${entrance} 192`}
          className="fill-none stroke-rose-500"
          strokeWidth="3"
          markerEnd="url(#cycle-arrow-loop)"
        />
        <text x={(tail + entrance) / 2} y="252" textAnchor="middle" className="fill-rose-700 text-[12px] font-semibold">next loops to node {node.nextId}</text>
      </g>
    );
  });
  const headLink = nodes.length
    ? <path d={`M 50 151 L ${centerX(0) - 42} 151`} className="fill-none stroke-slate-500" strokeWidth="2.5" markerEnd="url(#cycle-arrow)" />
    : <path d="M 50 151 L 106 151" className="fill-none stroke-slate-500" strokeWidth="2.5" markerEnd="url(#cycle-arrow)" />;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-500">
        <span>Floyd’s linked-list traversal</span>
        <span>{step?.cycleDetected ? 'Cycle detected' : step?.complete ? 'No cycle' : 'Next pointers'}</span>
      </div>
      <div className="overflow-x-auto">
        <div className="relative h-[290px]" style={{ width }}>
          <svg className="absolute inset-0 z-0 h-full" width={width} height="290" viewBox={`0 0 ${width} 290`} role="img" aria-label={nodes.at(-1)?.nextId === null ? 'Linear next-pointer links ending at NULL' : 'Linked-list next-pointer links including the cycle loop'}>
            <defs>
              <marker id="cycle-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
                <path d="M 0 0 L 10 5 L 0 10 z" className="fill-slate-500" />
              </marker>
              <marker id="cycle-arrow-loop" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
                <path d="M 0 0 L 10 5 L 0 10 z" className="fill-rose-500" />
              </marker>
            </defs>
            {headLink}
            {links}
            {nodes.length > 0 && nodes.at(-1).nextId === null && (
              <path d={`M ${centerX(nodes.length - 1) + 40} 151 L ${centerX(nodes.length - 1) + 92} 151`} className="fill-none stroke-slate-500" strokeWidth="2.5" markerEnd="url(#cycle-arrow)" />
            )}
          </svg>
          <span className="absolute left-0 top-[137px] z-10 rounded-full bg-slate-900 px-2 py-1 text-[10px] font-bold text-white">HEAD</span>
          {nodes.map((node) => {
            const isSlow = step?.slowId === node.id;
            const isFast = step?.fastId === node.id;
            const isMeeting = step?.meetingNodeId === node.id
              || (step?.match && (isSlow || isFast));
            const isCycleStart = step?.cycleStartNodeId === node.id;
            return (
              <div
                key={node.id}
                className="absolute z-10 flex w-[80px] -translate-x-1/2 flex-col items-center"
                style={{ left: centerX(node.id), top: nodeY }}
              >
                <div className={[
                  'flex h-[72px] w-[80px] flex-col items-center justify-center rounded-xl border-2 bg-white shadow-sm transition-all duration-300',
                  isCycleStart || isMeeting ? 'border-emerald-500 bg-emerald-100 text-emerald-900'
                    : isSlow && isFast ? 'border-amber-500 bg-amber-50 text-amber-900'
                      : isSlow ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : isFast ? 'border-violet-500 bg-violet-50 text-violet-900'
                          : 'border-slate-300 text-slate-700',
                ].join(' ')}>
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">ID {node.id}</span>
                  <span className="text-lg font-bold">{node.value}</span>
                </div>
                <div className="mt-1 flex min-h-[34px] flex-wrap justify-center gap-1">
                  {isSlow && <span className="pointer-marker rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white">SLOW</span>}
                  {isFast && <span className="pointer-marker rounded bg-violet-600 px-1.5 py-0.5 text-[9px] font-bold text-white">FAST</span>}
                  {isMeeting && <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white">MEET</span>}
                  {isCycleStart && <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white">CYCLE START</span>}
                </div>
              </div>
            );
          })}
          {nodes.length === 0 ? (
            <span className="absolute left-[110px] top-[136px] z-10 rounded-full border border-dashed border-slate-400 bg-white px-3 py-1 text-xs text-slate-500">NULL (empty list)</span>
          ) : nodes.at(-1).nextId === null ? (
            <span className="absolute top-[137px] z-10 rounded-full border border-dashed border-slate-400 bg-white px-2 py-1 text-[10px] font-medium text-slate-600" style={{ left: centerX(nodes.length - 1) + 100 }}>NULL</span>
          ) : null}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
        <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-700">SLOW: one hop</span>
        <span className="rounded-full bg-violet-100 px-2 py-1 text-violet-700">FAST: two hops</span>
        <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">Meeting / cycle start</span>
        {step?.meetingNodeId !== undefined && <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-800">First meeting: node {step.meetingNodeId}</span>}
      </div>
      <div className="mt-3 rounded-xl bg-white p-3 text-sm text-slate-700">
        <div>SLOW: <span className="font-semibold">{step?.slowId === null || step?.slowId === undefined ? 'NULL' : `node ${step.slowId} (${nodes[step.slowId]?.value})`}</span></div>
        <div>FAST: <span className="font-semibold">{step?.fastId === null || step?.fastId === undefined ? 'NULL' : `node ${step.fastId} (${nodes[step.fastId]?.value})`}</span></div>
        <div>Iteration: <span className="font-semibold">{step?.iteration ?? 0}</span></div>
        <div>Cycle detected: <span className="font-semibold">{String(step?.cycleDetected ?? false)}</span></div>
        {step?.decision && <div className="mt-2 border-t pt-2">{step.decision}</div>}
      </div>
    </div>
  );
}

function SlidingWindowDiagram({ step }) {
  const values = step?.array ?? [];
  const start = step?.windowStart ?? 0;
  const end = step?.windowEnd ?? Math.min(start + (step?.windowSize ?? 1) - 1, values.length - 1);
  const outgoingIndex = step?.outgoingIndex ?? null;
  const incomingIndex = step?.incomingIndex ?? null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-500">
        <span>Sliding window</span>
        <span>window size {step?.windowSize ?? '—'}</span>
      </div>
      <div className="overflow-x-auto pb-3">
        <div className="flex min-w-[520px] items-stretch gap-2 pt-3">
          {values.map((value, index) => {
            const inWindow = index >= start && index <= end;
            const isOutgoing = index === outgoingIndex;
            const isIncoming = index === incomingIndex;
            return (
              <div key={`${value}-${index}`} className="flex min-w-[52px] flex-1 flex-col items-center gap-1">
                <div className="min-h-4 text-[9px] font-bold text-blue-700">{index === step?.left ? 'LEFT' : index === step?.right ? 'RIGHT' : ''}</div>
                <div
                  className={[
                    'flex h-16 w-full items-center justify-center border text-lg font-semibold transition-colors duration-300',
                    inWindow ? 'border-y-2 border-violet-500' : 'border-slate-300',
                    inWindow && index === start ? 'rounded-l-xl border-l-2' : '',
                    inWindow && index === end ? 'rounded-r-xl border-r-2' : '',
                    isOutgoing ? 'border-red-500 bg-red-100 text-red-700' : isIncoming ? 'border-emerald-500 bg-emerald-100 text-emerald-700' : inWindow ? 'border-violet-500 bg-violet-100 text-violet-800' : 'border-slate-300 bg-white text-slate-700',
                  ].join(' ')}
                >
                  {value}
                </div>
                <div className="text-[10px] text-slate-500">{index}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
        <span className="rounded-full bg-violet-100 px-2 py-1 text-violet-700">window</span>
        <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">incoming</span>
        <span className="rounded-full bg-red-100 px-2 py-1 text-red-700">outgoing</span>
      </div>
      <div className="mt-3 rounded-xl bg-white p-3 text-sm text-slate-700">
        <div>LEFT: <span className="font-semibold">{step?.left ?? step?.windowStart ?? '—'}</span></div>
        <div>RIGHT: <span className="font-semibold">{step?.right ?? step?.windowEnd ?? '—'}</span></div>
        <div>WINDOW SIZE: <span className="font-semibold">{step?.windowSize ?? '—'}</span></div>
        <div>CURRENT SUM: <span className="font-semibold">{step?.currentSum ?? '—'}</span></div>
        <div>MAXIMUM SUM: <span className="font-semibold">{step?.maxSum ?? '—'}</span></div>
        {step?.minLength !== undefined && <div>MINIMUM LENGTH: <span className="font-semibold">{step.minLength ?? '—'}</span></div>}
        {step?.bestLength !== undefined && <div>BEST LENGTH: <span className="font-semibold">{step.bestLength}</span></div>}
        {step?.decision && <div className="mt-2 border-t pt-2">Decision: <span className="font-semibold">{step.decision}</span></div>}
      </div>
    </div>
  );
}

function LessonViewer({ lesson }) {
  const algorithmId = lesson?.algorithm || lesson?.id || 'bubble-sort';
  const initialPattern = algorithmId === 'two-pointers' ? 'two-sum' : algorithmId === 'sliding-window' ? 'fixed' : '';
  const [selectedPattern, setSelectedPattern] = useState(initialPattern);
  const [cycleEnabled, setCycleEnabled] = useState(true);
  const [cycleStartIndex, setCycleStartIndex] = useState(2);
  const [cycleStartMode, setCycleStartMode] = useState(false);
  const [cycleDetectionTraceLength, setCycleDetectionTraceLength] = useState(null);
  const lessonMeta = useMemo(
    () => getLessonDefinition(algorithmId, algorithmId === 'cycle-detection' && cycleStartMode ? 'find-start' : selectedPattern) ?? {},
    [algorithmId, cycleStartMode, selectedPattern],
  );
  const mergedLesson = { ...lesson, ...lessonMeta };
  const supported = isAlgorithmImplemented(algorithmId);
  const [inputText, setInputText] = useState((lessonMeta.defaultInput ?? []).join(', '));
  const [targetText, setTargetText] = useState(String(lessonMeta.defaultTarget ?? ''));
  const [secondaryInputText, setSecondaryInputText] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('default');
  const [inputError, setInputError] = useState('');
  const [trace, setTrace] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [language, setLanguage] = useState('python');
  const [quizChoice, setQuizChoice] = useState(null);

  useEffect(() => {
    const pattern = algorithmId === 'two-pointers' ? 'two-sum' : algorithmId === 'sliding-window' ? 'fixed' : '';
    setSelectedPattern(pattern);
    const initialPreset = pattern ? patternExamples[pattern][0] : null;
    setInputText(initialPreset ? getPatternInputText(initialPreset) : (lessonMeta.defaultInput ?? []).join(', '));
    setTargetText(String(initialPreset?.target ?? lessonMeta.defaultTarget ?? ''));
    setSecondaryInputText(initialPreset?.secondaryValues?.join(', ') ?? '');
    setCycleEnabled(true);
    setCycleStartIndex(2);
    setCycleStartMode(false);
    setCycleDetectionTraceLength(null);
    setSelectedPreset('default');
    setInputError('');
    setTrace(null);
    setCurrentStep(0);
    setIsPlaying(false);
    setQuizChoice(null);
  }, [algorithmId]);

  useEffect(() => {
    if (!isPlaying || !trace) return undefined;
    if (currentStep >= trace.length - 1) {
      setIsPlaying(false);
      return undefined;
    }

    const timer = window.setTimeout(() => setCurrentStep((step) => step + 1), 900 / speed);
    return () => window.clearTimeout(timer);
  }, [currentStep, isPlaying, speed, trace]);

  const presets = algorithmId === 'two-pointers' || algorithmId === 'sliding-window'
    ? patternExamples[selectedPattern] ?? []
    : algorithmId === 'bubble-sort'
    ? [
        { id: 'default', label: 'Default example', values: lessonMeta.defaultInput ?? [] },
        { id: 'mixed', label: 'Mixed values', values: [12, 4, 9, 2, 7, 1] },
        { id: 'duplicates', label: 'Duplicates', values: [5, 5, 2, 2] },
        { id: 'negative', label: 'Negative values', values: [-3, 0, 8, -1] },
      ]
    : algorithmId === 'binary-search'
      ? [
        { id: 'default', label: 'Default sorted example', values: lessonMeta.defaultInput ?? [], target: lessonMeta.defaultTarget },
        { id: 'small', label: 'Small sorted example', values: [-3, 0, 8, 12], target: 8 },
      ]
    : algorithmId === 'singly-linked-list' || algorithmId === 'doubly-linked-list'
      ? [
        { id: 'default', label: 'Default example', values: lessonMeta.defaultInput ?? [], target: lessonMeta.defaultTarget },
        { id: 'search', label: 'Search target', values: [5, 18, 30, 42], target: 30 },
        { id: 'mixed', label: 'Custom values', values: [7, 12, 2, 21, 9], target: 21 },
      ]
    : algorithmId === 'cycle-detection'
      ? [
        { id: 'default', label: 'Cycle starts at node 2', values: [10, 20, 30, 40, 50], cycleStartIndex: 2 },
        { id: 'no-cycle', label: 'No cycle — FAST reaches NULL', values: [10, 20, 30, 40, 50, 60], cycleStartIndex: null },
        { id: 'head-cycle', label: 'Cycle starts at HEAD', values: [10, 20, 30, 40], cycleStartIndex: 0 },
        { id: 'self-cycle', label: 'Single-node self cycle', values: [10], cycleStartIndex: 0 },
      ]
      : [
        { id: 'default', label: 'Default example', values: lessonMeta.defaultInput ?? [], target: lessonMeta.defaultTarget },
        { id: 'duplicates', label: 'Duplicates', values: [5, 5, 2, 2], target: 5 },
        { id: 'missing', label: 'Target absent', values: [4, 1, 8, 3], target: 7 },
      ];
  const steps = trace ?? [];
  const activeStep = trace?.[currentStep] ?? null;
  const languageCode = language === 'java' ? lessonMeta.javaCode ?? mergedLesson.javaCode : lessonMeta.pythonCode ?? mergedLesson.pythonCode;
  const codeLineIds = language === 'java' ? lessonMeta.javaLineIds ?? mergedLesson.javaLineIds : lessonMeta.pythonLineIds ?? mergedLesson.pythonLineIds;
  const codeLines = languageCode?.split('\n') ?? [];
  const liveVariables = getLiveVariables(activeStep, algorithmId);
  const learningCheck = getLearningCheck(algorithmId, selectedPattern);

  const invalidateTrace = () => {
    setTrace(null);
    setCurrentStep(0);
    setIsPlaying(false);
    setCycleStartMode(false);
    setCycleDetectionTraceLength(null);
    setInputError('');
  };

  const handleInputChange = (event) => {
    setInputText(event.target.value);
    setSelectedPreset('custom');
    invalidateTrace();
  };

  const handlePatternChange = (event) => {
    const pattern = event.target.value;
    setSelectedPattern(pattern);
    const firstPreset = patternExamples[pattern]?.[0];
    if (firstPreset) {
      setInputText(getPatternInputText(firstPreset));
      setTargetText(String(firstPreset.target ?? ''));
      setSecondaryInputText(firstPreset.secondaryValues?.join(', ') ?? '');
      if (firstPreset.cycleStartIndex !== undefined) {
        setCycleEnabled(firstPreset.cycleStartIndex !== null);
        setCycleStartIndex(firstPreset.cycleStartIndex ?? 0);
      }
      setSelectedPreset(firstPreset.id);
    }
    setQuizChoice(null);
    invalidateTrace();
  };

  const handlePresetChange = (event) => {
    if (event.target.value === 'custom') {
      setSelectedPreset('custom');
      invalidateTrace();
      return;
    }
    const preset = presets.find((item) => item.id === event.target.value);
    if (!preset) return;
    setSelectedPreset(preset.id);
    setInputText(getPatternInputText(preset));
    setSecondaryInputText(preset.secondaryValues?.join(', ') ?? '');
    setTargetText(String(preset.target ?? ''));
    if (preset.cycleStartIndex !== undefined) {
      setCycleEnabled(preset.cycleStartIndex !== null);
      setCycleStartIndex(preset.cycleStartIndex ?? 0);
    }
    invalidateTrace();
  };

  const resetInput = () => {
    const preset = presets[0];
    if (!preset) return;
    setInputText(getPatternInputText(preset));
    setSecondaryInputText(preset.secondaryValues?.join(', ') ?? '');
    setTargetText(String(preset.target ?? ''));
    if (preset.cycleStartIndex !== undefined) {
      setCycleEnabled(preset.cycleStartIndex !== null);
      setCycleStartIndex(preset.cycleStartIndex ?? 0);
    }
    setSelectedPreset('default');
    invalidateTrace();
  };

  const runVisualization = (event) => {
    event.preventDefault();
    setIsPlaying(false);
    setCurrentStep(0);
    setTrace(null);
    setInputError('');

    try {
      const isCycleDetection = algorithmId === 'cycle-detection';
      const isTextPattern = (algorithmId === 'two-pointers' && ['reverse-string', 'palindrome'].includes(selectedPattern))
        || (algorithmId === 'sliding-window' && selectedPattern === 'substring');
      const isMergePattern = algorithmId === 'two-pointers' && selectedPattern === 'merge';
      const input = isTextPattern
        ? inputText
        : isCycleDetection && !inputText.trim() ? []
        : isMergePattern && !inputText.trim() ? [] : parseIntegerArray(inputText);
      const needsTarget = ['binary-search', 'linear-search', 'singly-linked-list', 'doubly-linked-list'].includes(algorithmId)
        || (algorithmId === 'two-pointers' && ['two-sum', 'three-sum'].includes(selectedPattern))
        || (algorithmId === 'sliding-window' && ['fixed', 'minimum'].includes(selectedPattern));
      const target = needsTarget
        ? parseInteger(targetText, 'Target')
        : undefined;
      const secondaryInput = isMergePattern
        ? secondaryInputText.trim() ? parseIntegerArray(secondaryInputText) : []
        : undefined;
      const options = isCycleDetection
        ? { cycleStartIndex: cycleEnabled && input.length > 0 ? parseInteger(String(cycleStartIndex), 'Cycle target node ID') : null }
        : undefined;
      const generatedTrace = createLessonPlayback(algorithmId, input, target, selectedPattern, secondaryInput, options);
      if (!generatedTrace) {
        throw new Error('This algorithm does not have an execution trace yet.');
      }
      setTrace(generatedTrace);
      setCycleDetectionTraceLength(isCycleDetection ? generatedTrace.length : null);
    } catch (error) {
      setInputError(error instanceof Error ? error.message : 'Unable to generate this execution trace.');
    }
  };

  const togglePlayback = () => {
    if (!trace) return;
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    if (currentStep >= trace.length - 1) {
      if (algorithmId === 'cycle-detection' && cycleStartMode && cycleDetectionTraceLength !== null) {
        setTrace(trace.slice(0, cycleDetectionTraceLength));
        setCycleStartMode(false);
      }
      setCurrentStep(0);
    }
    setIsPlaying(true);
  };

  const moveToStep = (step) => {
    setIsPlaying(false);
    if (algorithmId === 'cycle-detection' && cycleStartMode && cycleDetectionTraceLength !== null && step < cycleDetectionTraceLength) {
      setTrace(trace.slice(0, cycleDetectionTraceLength));
      setCycleStartMode(false);
    }
    setCurrentStep(step);
  };

  const findCycleStart = () => {
    const meetingNodeId = activeStep?.meetingNodeId;
    if (!trace || !Number.isSafeInteger(meetingNodeId)) return;
    try {
      const input = parseIntegerArray(inputText);
      const cycleStartSteps = createCycleStartSteps(input, cycleStartIndex, meetingNodeId);
      const appendedSteps = cycleStartSteps.map((step, index) => ({
        ...step,
        step: trace.length + index + 1,
      }));
      setTrace([...trace, ...appendedSteps]);
      setCurrentStep(trace.length);
      setIsPlaying(false);
      setCycleStartMode(true);
      setInputError('');
    } catch (error) {
      setInputError(error instanceof Error ? error.message : 'Unable to find the cycle start.');
    }
  };

  if (!supported) {
    return (
      <div className="card p-8">
        <p className="text-xs uppercase tracking-[0.18em] text-blue-600">Visual learning studio</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">{mergedLesson.title}</h2>
        <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
          {lesson.status === 'coming-soon'
            ? 'This lesson is in the curriculum and marked Coming Soon. Its interactive visualization has not been implemented yet.'
            : 'This lesson is in development. Its algorithm execution trace and interactive visualization are not ready yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-blue-600">Visual learning studio</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{mergedLesson.title}</h2>
          </div>
        </div>

        <div className="mb-5 grid gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 md:grid-cols-2">
          <div>
            <h3 className="font-semibold text-slate-800">Beginner concept</h3>
            <p className="mt-1 text-sm leading-5 text-slate-600">{lessonMeta.concept ?? lessonMeta.summary}</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Complexity</h3>
            <p className="mt-1 text-sm leading-5 text-slate-600">{lessonMeta.complexity ?? 'See the selected pattern for its time and space complexity.'}</p>
          </div>
        </div>

        <form onSubmit={runVisualization} className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex flex-wrap items-end gap-3">
            {['two-pointers', 'sliding-window'].includes(algorithmId) && (
              <div className="w-full md:w-auto">
                <label htmlFor="pattern-select" className="mb-1 block text-sm font-medium text-slate-700">Pattern</label>
                <select id="pattern-select" value={selectedPattern} onChange={handlePatternChange} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
                  {(algorithmId === 'two-pointers' ? twoPointerPatterns : slidingPatterns).map((pattern) => (
                    <option key={pattern.id} value={pattern.id}>{pattern.label}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="min-w-[220px] flex-1">
              <label htmlFor="algorithm-input" className="mb-1 block text-sm font-medium text-slate-700">
                {algorithmId === 'cycle-detection' ? 'Node values (comma-separated)'
                  : (algorithmId === 'two-pointers' && ['reverse-string', 'palindrome'].includes(selectedPattern))
                  || (algorithmId === 'sliding-window' && selectedPattern === 'substring') ? 'Text input' : 'Integer array'}
              </label>
              <input
                id="algorithm-input"
                value={inputText}
                onChange={handleInputChange}
                placeholder={algorithmId === 'cycle-detection' ? '10, 20, 30, 40, 50'
                  : (algorithmId === 'two-pointers' && ['reverse-string', 'palindrome'].includes(selectedPattern))
                  || (algorithmId === 'sliding-window' && selectedPattern === 'substring') ? 'Enter text' : '12, 4, 9, 2, 7, 1'}
                aria-invalid={Boolean(inputError)}
                aria-describedby={inputError ? 'input-error' : undefined}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
              />
            </div>
            {algorithmId === 'cycle-detection' && (
              <>
                <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={cycleEnabled}
                    onChange={(event) => {
                      setCycleEnabled(event.target.checked);
                      invalidateTrace();
                    }}
                  />
                  Last node points back (cycle)
                </label>
                <div className="w-full md:w-auto">
                  <label htmlFor="cycle-start-node" className="mb-1 block text-sm font-medium text-slate-700">Cycle target node</label>
                  <select
                    id="cycle-start-node"
                    value={cycleStartIndex}
                    disabled={!cycleEnabled}
                    onChange={(event) => {
                      setCycleStartIndex(Number(event.target.value));
                      invalidateTrace();
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 disabled:opacity-50"
                  >
                    {inputText.split(',').map((token, index) => {
                      const value = token.trim();
                      if (!/^[+-]?\d+$/.test(value) || !Number.isSafeInteger(Number(value))) return null;
                      return <option key={index} value={index}>Node {index} (value {Number(value)})</option>;
                    })}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const values = Array.from({ length: 6 }, () => Math.floor(Math.random() * 90) + 10);
                    const start = Math.floor(Math.random() * values.length);
                    setInputText(values.join(', '));
                    setCycleEnabled(true);
                    setCycleStartIndex(start);
                    setSelectedPreset('custom');
                    invalidateTrace();
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >Generate random list</button>
              </>
            )}
            {algorithmId === 'two-pointers' && selectedPattern === 'merge' && (
              <div className="min-w-[180px] flex-1">
                <label htmlFor="secondary-array" className="mb-1 block text-sm font-medium text-slate-700">Second sorted array</label>
                <input
                  id="secondary-array"
                  value={secondaryInputText}
                  onChange={(event) => {
                    setSecondaryInputText(event.target.value);
                    setSelectedPreset('custom');
                    invalidateTrace();
                  }}
                  placeholder="2, 3, 8"
                  aria-invalid={Boolean(inputError)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                />
              </div>
            )}
            {['binary-search', 'linear-search', 'singly-linked-list', 'doubly-linked-list'].includes(algorithmId)
              || (algorithmId === 'two-pointers' && ['two-sum', 'three-sum'].includes(selectedPattern))
              || (algorithmId === 'sliding-window' && ['fixed', 'minimum'].includes(selectedPattern)) ? (
              <div className="w-32">
                <label htmlFor="algorithm-target" className="mb-1 block text-sm font-medium text-slate-700">
                  {algorithmId === 'sliding-window' && selectedPattern === 'fixed' ? 'Window size (k)'
                    : algorithmId === 'sliding-window' ? 'Target sum'
                      : 'Target'}
                </label>
                <input
                  id="algorithm-target"
                  value={targetText}
                  onChange={(event) => {
                    setTargetText(event.target.value);
                    setSelectedPreset('custom');
                    invalidateTrace();
                  }}
                  aria-invalid={Boolean(inputError)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                />
              </div>
            ) : null}
            <div>
              <label htmlFor="algorithm-preset" className="mb-1 block text-sm font-medium text-slate-700">Example preset</label>
              <select id="algorithm-preset" value={selectedPreset} onChange={handlePresetChange} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
                {presets.map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
                <option value="custom">Custom input</option>
              </select>
            </div>
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">Run / Visualize</button>
            <button type="button" onClick={resetInput} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Reset input</button>
          </div>
          {inputError && <p id="input-error" role="alert" className="text-sm font-medium text-rose-700">{inputError}</p>}
          {algorithmId === 'binary-search' && <p className="mt-2 text-xs text-slate-500">Binary Search requires values sorted in ascending order.</p>}
          {algorithmId === 'two-pointers' && ['two-sum', 'remove-duplicates', 'merge'].includes(selectedPattern) && (
            <p className="mt-2 text-xs text-slate-500">This pattern requires ascending sorted input arrays.</p>
          )}
          {algorithmId === 'sliding-window' && selectedPattern === 'minimum' && (
            <p className="mt-2 text-xs text-slate-500">This variable-size window uses positive integers so shrinking the window reduces its sum.</p>
          )}
        </form>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button type="button" disabled={!trace || currentStep === 0} onClick={() => moveToStep(Math.max(0, currentStep - 1))} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
          <button type="button" disabled={!trace} onClick={togglePlayback} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white enabled:hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50">{isPlaying ? 'Pause' : 'Play'}</button>
          <button type="button" disabled={!trace || currentStep >= steps.length - 1} onClick={() => moveToStep(Math.min(steps.length - 1, currentStep + 1))} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Next</button>
          {algorithmId === 'cycle-detection' && activeStep?.complete && activeStep?.cycleDetected && !cycleStartMode && (
            <button type="button" onClick={findCycleStart} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500">Find Cycle Start</button>
          )}
          <button type="button" disabled={!trace} onClick={() => moveToStep(0)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Reset playback</button>
          <label className="ml-auto flex items-center gap-2 text-sm text-slate-600">
            Speed
            <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
          </label>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
          <span>{trace ? `Step ${currentStep + 1} / ${steps.length}` : 'No execution trace yet'}</span>
          <span>{activeStep?.operation || 'Enter input and run the algorithm.'}</span>
        </div>

        <div className="grid gap-5 xl:grid-cols-[55%_45%]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              {algorithmId === 'cycle-detection' ? (
                <CycleDetectionDiagram step={activeStep} />
              ) : algorithmId === 'two-pointers' ? (
                <TwoPointersDiagram step={activeStep} pattern={selectedPattern} />
              ) : algorithmId === 'sliding-window' ? (
                <SlidingWindowDiagram step={activeStep} />
              ) : algorithmId === 'singly-linked-list' || algorithmId === 'doubly-linked-list' ? (
                <LinkedListDiagram step={activeStep} lessonId={algorithmId} />
              ) : (
                <ArrayDiagram step={activeStep} lessonId={algorithmId} />
              )}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Current step explanation</h3>
                <span className="badge bg-blue-100 text-blue-700">{mergedLesson.topic}</span>
              </div>
              {algorithmId === 'cycle-detection' ? (
                <div className="space-y-2 text-sm leading-5 text-slate-600">
                  <p><span className="font-semibold text-slate-700">What is happening?</span> {activeStep?.operation || 'Run the example to begin.'}</p>
                  <p><span className="font-semibold text-slate-700">Why is it happening?</span> {activeStep?.explanation || mergedLesson.summary}</p>
                  <p><span className="font-semibold text-slate-700">What changed?</span> {activeStep?.change || 'Use Next to inspect the first pointer movement.'}</p>
                </div>
              ) : (
                <div className="space-y-2 text-sm leading-5 text-slate-600">
                  <p><span className="font-semibold text-slate-700">What is happening?</span> {activeStep?.operation || 'Run the example to begin.'}</p>
                  <p><span className="font-semibold text-slate-700">Why?</span> {activeStep?.explanation || mergedLesson.summary}</p>
                  <p><span className="font-semibold text-slate-700">What changes next?</span> {activeStep?.decision || 'Use Next to inspect the next execution step.'}</p>
                </div>
              )}
              {activeStep?.complete && (
                <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                  {algorithmId === 'cycle-detection' && activeStep.result?.cycleDetected
                    ? cycleStartMode
                      ? `Cycle start found: node ${activeStep.result.cycleStartIndex} (value ${activeStep.array[activeStep.result.cycleStartIndex]}). First meeting was node ${activeStep.result.meetingNodeId}.`
                      : `Cycle Detected! Slow and Fast pointers meet at node ${activeStep.result.meetingNodeId} (value ${activeStep.array[activeStep.result.meetingNodeId]}).`
                    : algorithmId === 'cycle-detection'
                      ? 'No cycle detected — FAST reaches NULL.'
                    : algorithmId === 'two-pointers' && selectedPattern === 'two-sum' && activeStep.result?.length === 2
                    ? `Pair found: ${activeStep.leftValue} + ${activeStep.rightValue} = ${activeStep.target}`
                    : `Result: ${Array.isArray(activeStep.result) ? `[${activeStep.result.join(', ')}]` : typeof activeStep.result === 'object' && activeStep.result !== null
                      ? JSON.stringify(activeStep.result) : String(activeStep.result)}`}
                </p>
              )}
            </div>
            {learningCheck && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="font-semibold text-slate-800">Quick learning check</h3>
                <p className="mt-2 text-sm text-slate-600">{learningCheck.question}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {learningCheck.options.map((option, index) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={quizChoice === index}
                      onClick={() => setQuizChoice(index)}
                      className={[
                        'rounded-lg border px-3 py-2 text-left text-sm',
                        quizChoice === index
                          ? index === learningCheck.correct ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-rose-300 bg-rose-50 text-rose-800'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100',
                      ].join(' ')}
                    >{option}</button>
                  ))}
                </div>
                {quizChoice !== null && (
                  <p role="status" className={`mt-3 text-sm font-medium ${quizChoice === learningCheck.correct ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {quizChoice === learningCheck.correct ? 'Correct!' : 'Not quite.'} {learningCheck.explanation}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-800">Trace-mapped source code</h3>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700">
                <option value="python">Python</option>
                <option value="java">Java</option>
              </select>
            </div>
            <p className="mb-3 text-xs text-slate-500">The trace is generated by the internal algorithm; highlights map its operations to this source.</p>

            <div className="rounded-xl bg-slate-900 p-3 font-mono text-sm text-slate-100">
              {codeLines.map((line, index) => (
                <div
                  key={`${line}-${index}`}
                  className={[
                    'rounded px-2 py-1',
                    activeStep?.lineIds?.includes(codeLineIds?.[index + 1]) ? 'bg-blue-500/30 text-white' : 'text-slate-200',
                  ].join(' ')}
                >
                  <span className="mr-3 inline-block w-5 text-slate-400">{index + 1}</span>
                  {line}
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
              <div className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">Live variables</div>
              <div className="space-y-2 text-sm text-slate-700">
                {liveVariables.map((entry) => (
                  <div key={entry.label} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-2 py-1.5">
                    <span className="font-medium text-slate-700">{entry.label}</span>
                    <span className="text-right text-slate-900">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="card p-5">
          <h3 className="text-lg font-semibold text-slate-800">Concept</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">{mergedLesson.concept}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {mergedLesson.terminology?.map((term) => (
              <div key={term.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-600">{term.label}</div>
                <p className="mt-2 text-sm text-slate-600">{term.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-lg font-semibold text-slate-800">Complexity analysis</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="font-semibold text-slate-800">Time:</span> {mergedLesson.complexity}</div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="font-semibold text-slate-800">Best case:</span> {mergedLesson.bestCase}</div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="font-semibold text-slate-800">Common mistakes:</span> {mergedLesson.mistakes}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function valuesForMemory(input) {
  return input;
}

function StudentDashboard() {
  const weekly = studentOverview.weeklyMinutes;
  const maxWeek = Math.max(...weekly);

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Student portal</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Welcome back, {studentOverview.name}</h1>
          </div>
          <button type="button" className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-500">Resume latest lesson</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Estimated active time" value={`${studentOverview.totalActiveMinutes} min`} subtext="Across all tracked lessons" accent="blue" />
        <StatCard label="Today" value={`${studentOverview.todayMinutes} min`} subtext="Focused practice time" accent="green" />
        <StatCard label="Lessons complete" value={`${studentOverview.completedLessons}/${studentOverview.totalLessons}`} subtext="Progress this term" accent="amber" />
        <StatCard label="Learning streak" value={`${studentOverview.streak} days`} subtext="Consecutive study days" accent="purple" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="card p-5">
          <h2 className="text-xl font-semibold text-slate-800">Weekly learning activity</h2>
          <div className="mt-5 flex h-44 items-end gap-3">
            {weekly.map((value, index) => (
              <div key={index} className="flex flex-1 flex-col items-center justify-end gap-2">
                <div className="w-full rounded-t-xl bg-gradient-to-t from-blue-600 to-blue-300" style={{ height: `${(value / maxWeek) * 100}%` }} />
                <span className="text-xs text-slate-500">{['S', 'M', 'T', 'W', 'T', 'F', 'S'][index]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-xl font-semibold text-slate-800">Recommended next</h2>
          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <div className="text-sm uppercase tracking-[0.18em] text-indigo-600">Priority topic</div>
            <div className="mt-2 text-lg font-bold text-slate-900">Binary Search</div>
            <p className="mt-2 text-sm text-slate-600">Your recent pattern recognition score improved, and this lesson is the best next step to reinforce array search techniques.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FacultyDashboard() {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Faculty portal</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Learning overview for {facultySummary.name}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Enrolled students" value={facultySummary.classSize} subtext="Across all active cohorts" accent="blue" />
        <StatCard label="Average active time" value={`${facultySummary.averageMinutes} min`} subtext="Per student, weekly" accent="green" />
        <StatCard label="Active learners" value={`${facultySummary.activeStudents}`} subtext="Students with recent activity" accent="amber" />
        <StatCard label="Support watchlist" value="5" subtext="Low activity or unfinished lessons" accent="purple" />
      </div>

      <div className="card p-5">
        <h2 className="text-xl font-semibold text-slate-800">Topic participation</h2>
        <div className="mt-5 space-y-4">
          {facultySummary.topicActivity.map((topic) => (
            <div key={topic.name}>
              <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
                <span>{topic.name}</span>
                <span>{topic.value}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-200">
                <div className="h-2.5 rounded-full bg-indigo-500" style={{ width: `${topic.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoginPanel({ onLogin }) {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('aanya@vizflow.edu');
  const [password, setPassword] = useState('demo123');

  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin({ role, email, password });
  };

  return (
    <div className="card p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Access portal</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Sign in</h2>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-role" className="mb-1 block text-sm font-medium text-slate-700">Role</label>
          <select id="login-role" value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700">
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
          </select>
        </div>
        <div>
          <label htmlFor="login-email" className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700" />
        </div>
        <div>
          <label htmlFor="login-password" className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700" />
        </div>
        <button type="submit" className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-500">Continue</button>
      </form>
      <p className="mt-4 text-xs text-slate-500">Demo access: student email aanya@vizflow.edu / password demo123</p>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState({
    ...getLessonDefinition('bubble-sort'),
    algorithm: 'bubble-sort',
  });

  useEffect(() => {
    if (session?.role !== 'student') {
      setCompletedLessons([]);
      return;
    }
    const stored = window.localStorage.getItem(`vizflow-completed-lessons:${session.email}`);
    const allowedIds = new Set(fundamentalsLessonIds);
    const parsed = stored ? JSON.parse(stored) : [];
    setCompletedLessons(Array.isArray(parsed) ? parsed.filter((lessonId) => allowedIds.has(lessonId)) : []);
  }, [session?.email, session?.role]);

  const completeLesson = useCallback((lessonId) => {
    setCompletedLessons((current) => {
      if (current.includes(lessonId)) return current;
      return [...current, lessonId];
    });
    if (session?.email) {
      const key = `vizflow-completed-lessons:${session.email}`;
      const stored = window.localStorage.getItem(key);
      const parsed = stored ? JSON.parse(stored) : [];
      const current = Array.isArray(parsed) ? parsed : [];
      if (!current.includes(lessonId)) window.localStorage.setItem(key, JSON.stringify([...current, lessonId]));
    }
  }, [session?.email]);

  const login = ({ role, email, password }) => {
    if (role === 'student' && email === 'aanya@vizflow.edu' && password === 'demo123') {
      setSession({ role: 'student', name: studentOverview.name, email });
      return;
    }

    if (role === 'faculty' && email === 'meera@vizflow.edu' && password === 'demo123') {
      setSession({ role: 'faculty', name: facultySummary.name, email });
      return;
    }

    alert('Invalid credentials. Use the demo account details shown below.');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <div className="text-2xl font-black tracking-tight text-slate-900">VizFlow</div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Interactive DSA learning</div>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <button type="button" className="hover:text-slate-900">Curriculum</button>
            <button type="button" className="hover:text-slate-900">Lessons</button>
            <button type="button" className="hover:text-slate-900">Analytics</button>
          </nav>
          <div className="flex items-center gap-3">
            <span className="badge bg-blue-100 text-blue-700">Active learning metrics</span>
            {session ? (
              <button type="button" onClick={() => setSession(null)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Sign out</button>
            ) : (
              <span className="text-sm font-medium text-slate-500">Demo mode</span>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!session ? (
          <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
            <LoginPanel onLogin={login} />
            <div className="space-y-5">
              <div className="card p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-indigo-600">Platform overview</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">Build deeper intuition for algorithms</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  VizFlow combines structured DSA lessons, interactive visualizations, and analytics that estimate active learning time instead of raw session duration.
                </p>
              </div>
              <ModuleList
                completedLessons={completedLessons}
                onSelectLesson={(lesson) => setSelectedLesson({ ...getLessonDefinition(lesson.algorithm || lesson.id), ...lesson, algorithm: lesson.algorithm || lesson.id })}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="card p-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Signed in as</p>
                  <h2 className="text-2xl font-bold text-slate-900">{session.name}</h2>
                </div>
                <div className="badge bg-emerald-100 text-emerald-700">
                  {session.role === 'student' ? 'Student portal' : 'Faculty portal'}
                </div>
              </div>
            </div>

            {session.role === 'student' ? <StudentDashboard /> : <FacultyDashboard />}

            <div className="card p-5">
              <h2 className="text-xl font-semibold text-slate-800">DSA curriculum</h2>
              <div className="mt-5">
                <ModuleList
                  completedLessons={completedLessons}
                  onSelectLesson={(lesson) => setSelectedLesson({ ...getLessonDefinition(lesson.algorithm || lesson.id), ...lesson, algorithm: lesson.algorithm || lesson.id })}
                />
              </div>
            </div>

            {treeStudioLessonIds.includes(selectedLesson?.algorithm)
              ? <TreesStudio
                  key={selectedLesson.algorithm}
                  lessonId={selectedLesson.algorithm}
                />
              : graphStudioLessonIds.includes(selectedLesson?.algorithm)
              ? <GraphStudio
                  key={selectedLesson.algorithm}
                  lessonId={selectedLesson.algorithm}
                />
              : fundamentalsLessonIds.includes(selectedLesson?.algorithm)
              ? <FundamentalsStudio
                  key={selectedLesson.algorithm}
                  lessonId={selectedLesson.algorithm}
                  completed={completedLessons.includes(selectedLesson.algorithm)}
                  onComplete={completeLesson}
                />
              : <LessonViewer lesson={selectedLesson} />}
          </div>
        )}
      </main>
    </div>
  );
}
