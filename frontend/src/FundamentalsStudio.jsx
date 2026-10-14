import React, { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  applyADTOperation,
  complexityOptions,
  createGrowthSeries,
  createMaximumSearchSteps,
  fundamentalsLessonIds,
  fundamentalsLessons,
  getBoundExample,
  getComplexityDemoState,
  getCurveComparison,
  estimateOperationCount,
} from './lib/fundamentals';

const growthLines = [
  { id: 'one', label: '1', color: '#64748b' },
  { id: 'log', label: 'log₂ n', color: '#0ea5e9' },
  { id: 'n', label: 'n', color: '#16a34a' },
  { id: 'nlogn', label: 'n log₂ n', color: '#f59e0b' },
  { id: 'n2', label: 'n²', color: '#e11d48' },
];
const maximumSteps = createMaximumSearchSteps([4, 8, 2, 9, 5]);
const lessonCode = {
  python: `def find_max(values):
    largest = values[0]
    for value in values:
        if value > largest:
            largest = value
    return largest`,
  java: `int findMax(int[] values) {
    int largest = values[0];
    for (int value : values) {
        if (value > largest) {
            largest = value;
        }
    }
    return largest;
}`,
};

function Panel({ title, children, className = '' }) {
  return <section className={`card p-5 ${className}`}><h3 className="mb-4 text-lg font-semibold text-slate-800">{title}</h3>{children}</section>;
}

function Quiz({ lessonId, onCorrect }) {
  const quiz = fundamentalsLessons[lessonId].quiz;
  const [choice, setChoice] = useState(null);
  const correct = choice === quiz.answer;
  return (
    <Panel title="Quick learning check">
      <p className="font-medium text-slate-800">{quiz.question}</p>
      <div className="mt-3 grid gap-2">
        {quiz.options.map((option, index) => (
          <button key={option} type="button" onClick={() => { setChoice(index); if (index === quiz.answer) onCorrect(); }}
            className={`rounded-lg border p-3 text-left text-sm ${choice === index ? (correct ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-rose-300 bg-rose-50 text-rose-800') : 'border-slate-200 hover:bg-slate-50'}`}>
            {option}
          </button>
        ))}
      </div>
      {choice !== null && <p aria-live="polite" className={`mt-3 text-sm ${correct ? 'text-emerald-700' : 'text-rose-700'}`}>{correct ? `Correct! ${quiz.explanation}` : 'Not quite. Try again.'}</p>}
    </Panel>
  );
}

function PracticeQuestion({ lessonId }) {
  const practice = fundamentalsLessons[lessonId].practice;
  const [choice, setChoice] = useState(null);
  const correct = choice === practice.answer;
  return (
    <Panel title="Try a practice question">
      <p className="font-medium text-slate-800">{practice.question}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {practice.options.map((option, index) => <button key={option} onClick={() => setChoice(index)} className={`rounded-lg border px-3 py-2 text-sm ${choice === index ? (correct ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-rose-300 bg-rose-50 text-rose-800') : 'border-slate-200 hover:bg-slate-50'}`}>{option}</button>)}
      </div>
      {choice !== null && <p aria-live="polite" className={`mt-3 text-sm ${correct ? 'text-emerald-700' : 'text-rose-700'}`}>{correct ? `Correct! ${practice.explanation}` : 'Try another answer.'}</p>}
    </Panel>
  );
}

function LessonOverview({ lessonId }) {
  const lesson = fundamentalsLessons[lessonId];
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[['Core idea', lesson.concept], ['Real-life connection', lesson.realLife], ['Remember', lesson.complexity]].map(([title, text]) => (
        <div key={title} className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
        </div>
      ))}
    </div>
  );
}

function ArrayDiagram({ values, activeIndex }) {
  return <div className="flex flex-wrap gap-2" aria-label="Array visualization">{values.map((value, index) => (
    <div key={`${index}-${value}`} className={`min-w-14 rounded-lg border px-3 py-2 text-center ${(Array.isArray(activeIndex) ? activeIndex.includes(index) : activeIndex === index) ? 'border-amber-400 bg-amber-100 ring-2 ring-amber-300' : 'border-slate-300 bg-white'}`}>
      <div className="text-xs text-slate-500">index {index}</div><div className="text-lg font-bold text-slate-800">{value}</div>
    </div>
  ))}</div>;
}

function StructureDemo({ kind, values, setValues, onInteraction }) {
  const addValue = () => { setValues((previous) => [...previous, previous.length + 1]); onInteraction(); };
  const removeValue = (fromEnd) => {
    setValues((previous) => {
      if (!previous.length) return previous;
      return fromEnd ? previous.slice(0, -1) : previous.slice(1);
    });
    onInteraction();
  };
  if (kind === 'array') return <><ArrayDiagram values={values} /><button className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white" onClick={addValue}>Append value</button></>;
  if (kind === 'linked-list') return <div className="flex flex-wrap items-center gap-2">{values.map((value, index) => <React.Fragment key={`${index}-${value}`}><span className="rounded-full border-2 border-blue-300 bg-blue-50 px-4 py-3 font-semibold">{value}</span>{index < values.length - 1 && <span aria-label="next pointer" className="text-xl text-blue-600">→</span>}</React.Fragment>)}</div>;
  if (kind === 'stack') return <div className="flex items-end gap-5"><div className="flex min-h-44 w-32 flex-col-reverse items-stretch justify-start rounded-b-xl border-x-4 border-b-4 border-slate-400 p-2">{values.map((value, index) => <div key={`${index}-${value}`} className="mb-1 rounded border border-blue-300 bg-blue-100 p-2 text-center font-semibold">{value}</div>)}</div><div className="space-y-2"><button className="block rounded-lg bg-blue-600 px-4 py-2 text-sm text-white" onClick={addValue}>PUSH</button><button className="block rounded-lg border px-4 py-2 text-sm" onClick={() => removeValue(true)}>POP</button><p className="text-xs text-slate-500">TOP ↑</p></div></div>;
  if (kind === 'queue') return <div><div className="mb-2 flex justify-between text-xs font-semibold text-slate-500"><span>FRONT ←</span><span>→ REAR</span></div><div className="flex min-h-12 flex-wrap gap-2">{values.map((value, index) => <span key={`${index}-${value}`} className="rounded border border-indigo-300 bg-indigo-50 px-4 py-2">{value}</span>)}</div><div className="mt-3 flex gap-2"><button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white" onClick={addValue}>ENQUEUE</button><button className="rounded-lg border px-4 py-2 text-sm" onClick={() => removeValue(false)}>DEQUEUE</button></div></div>;
  if (kind === 'tree') return <div className="flex flex-col items-center gap-5 py-3"><span className="rounded-full border-2 border-emerald-400 bg-emerald-50 px-4 py-2">{values[0] ?? 1}</span><span className="text-xl text-slate-400">↙　↘</span><div className="flex gap-12"><span className="rounded-full border px-4 py-2">{values[1] ?? 2}</span><span className="rounded-full border px-4 py-2">{values[2] ?? 3}</span></div><p className="text-xs text-slate-500">One parent can connect to child nodes.</p></div>;
  return <div><div className="flex flex-wrap items-center gap-5">{values.slice(0, 4).map((value, index) => <div key={`${index}-${value}`} className="flex items-center gap-2"><span className="grid h-12 w-12 place-items-center rounded-full border-2 border-violet-300 bg-violet-50 font-semibold">{value}</span>{index < 3 && <span className="text-violet-500">—</span>}</div>)}</div><p className="mt-3 text-xs text-slate-500">Vertices and edges can represent flexible relationships.</p></div>;
}

function IntroductionLesson({ onInteraction }) {
  const structures = [
    ['array', 'Array', 'A numbered row; like lockers, each position has an index.', 'Read, update, append'],
    ['linked-list', 'Linked List', 'Each node stores a value and a link to the next node.', 'Insert, delete, traverse'],
    ['stack', 'Stack', 'The last item added is the first removed (LIFO), like a stack of plates.', 'Push, pop, peek'],
    ['queue', 'Queue', 'The first item added is the first removed (FIFO), like a checkout line.', 'Enqueue, dequeue, front'],
    ['tree', 'Tree', 'A hierarchy of parent and child nodes, like folders.', 'Search, insert, traverse'],
    ['graph', 'Graph', 'Vertices connected by edges, like cities connected by roads.', 'Add vertex, add edge, traverse'],
  ];
  const [kind, setKind] = useState('array');
  const [values, setValues] = useState([10, 20, 30]);
  const [step, setStep] = useState(-1);
  const [language, setLanguage] = useState('python');
  const code = lessonCode[language];
  const active = maximumSteps[step] ?? null;
  const choose = (next) => { setKind(next); onInteraction(); };
  return <div className="space-y-5">
    <Panel title="Explore a data structure">
      <div className="mb-4 flex flex-wrap gap-2">{structures.map(([id, label]) => <button key={id} onClick={() => choose(id)} className={`rounded-full px-3 py-2 text-sm ${kind === id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>{label}</button>)}</div>
      <div className="min-h-32 rounded-xl bg-slate-50 p-4"><StructureDemo kind={kind} values={values} setValues={setValues} onInteraction={onInteraction} /></div>
      <p className="mt-3 text-sm text-slate-600">{structures.find(([id]) => id === kind)?.[2]}</p>
      <p className="mt-1 text-xs text-slate-500">Common operations: {structures.find(([id]) => id === kind)?.[3]}</p>
    </Panel>
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel title="Algorithm in action: find the maximum">
        <ArrayDiagram values={[4, 8, 2, 9, 5]} activeIndex={active?.index} />
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => { setStep(-1); onInteraction(); }} className="rounded-lg border px-4 py-2 text-sm">Reset</button>
          <button onClick={() => { setStep((previous) => Math.min(previous + 1, maximumSteps.length - 1)); onInteraction(); }} disabled={step >= maximumSteps.length - 1} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50">{step < 0 ? 'Start' : 'Next comparison'}</button>
        </div>
        <p aria-live="polite" className="mt-3 min-h-10 text-sm text-slate-700">{active ? `Step ${step + 1}: ${active.explanation} Maximum so far: ${active.maximum}.` : 'Compare each value with the largest value seen so far.'}</p>
        {step === maximumSteps.length - 1 && <p className="font-semibold text-emerald-700">Finished: maximum = {active.maximum}</p>}
      </Panel>
      <Panel title={`${language === 'python' ? 'Python' : 'Java'} example`}>
        <div className="mb-2 flex gap-2"><button onClick={() => setLanguage(language === 'python' ? 'java' : 'python')} className="rounded-lg border px-3 py-1.5 text-xs">Show {language === 'python' ? 'Java' : 'Python'}</button><span className="self-center text-xs uppercase text-slate-500">{language} reference</span></div>
        <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm leading-6 text-slate-100"><code>{code.split('\n').map((line, index) => <span key={`${index}-${line}`} className={`block ${active && [2, 3, 4].includes(index) ? 'rounded bg-amber-400/20 text-amber-200' : ''}`}>{String(index + 1).padStart(2, ' ')}  {line}</span>)}</code></pre>
        <p className="mt-3 text-xs text-slate-500">The trace above is generated by the lesson’s JavaScript logic; this code is a reference implementation.</p>
      </Panel>
    </div>
    <Panel title="Types of data structures">
      <div className="grid gap-3 sm:grid-cols-2"><p className="rounded-lg bg-slate-50 p-3 text-sm"><strong>Linear:</strong> elements form a sequence (array, list, stack, queue).</p><p className="rounded-lg bg-slate-50 p-3 text-sm"><strong>Non-linear:</strong> elements form hierarchies or networks (tree, graph).</p><p className="rounded-lg bg-slate-50 p-3 text-sm"><strong>Static:</strong> size is fixed or chosen up front (fixed-size array).</p><p className="rounded-lg bg-slate-50 p-3 text-sm"><strong>Dynamic:</strong> size can change as needed (linked list, dynamic array).</p></div>
      <p className="mt-3 text-sm text-slate-600">DSA helps organize data and solve tasks in search engines, maps, operating systems, social networks, and everyday apps.</p>
    </Panel>
  </div>;
}

const adtOperations = {
  Stack: ['Push', 'Pop', 'Peek', 'IsEmpty'],
  Queue: ['Enqueue', 'Dequeue', 'Front', 'IsEmpty'],
  List: ['Insert', 'Delete', 'Search', 'Update'],
  Set: ['Add', 'Remove', 'Contains'],
  Map: ['Put', 'Get', 'Remove'],
};

function ADTLesson({ onInteraction }) {
  const [adt, setAdt] = useState('Stack');
  const [values, setValues] = useState(['A', 'B']);
  const [input, setInput] = useState('C');
  const [second, setSecond] = useState('Z');
  const [message, setMessage] = useState('Choose an operation to see the ADT contract in action.');
  const implementation = { Stack: 'Array-backed stack', Queue: 'Circular array queue', List: 'Dynamic array list', Set: 'Hash set', Map: 'Hash map' };
  const switchADT = (next) => {
    setAdt(next);
    setValues(next === 'Queue' ? ['A', 'B'] : next === 'Stack' ? ['A', 'B'] : []);
    setMessage(`${next} ADT selected. Its operations are independent of its implementation.`);
  };
  const run = (operation) => {
    const result = applyADTOperation(adt, operation, values, input, second);
    setValues(result.values);
    setMessage(result.message);
    onInteraction();
  };
  return <div className="space-y-5">
    <Panel title="Choose an ADT">
      <div className="flex flex-wrap gap-2">{Object.keys(adtOperations).map((name) => <button key={name} onClick={() => switchADT(name)} className={`rounded-full px-4 py-2 text-sm ${adt === name ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>{name} ADT</button>)}</div>
      <div className="mt-4 rounded-lg bg-indigo-50 p-4 text-sm text-indigo-900"><strong>Contract:</strong> {adt} defines its operations and their meaning. <strong>Example implementation:</strong> {implementation[adt]}. A different implementation can honor the same contract.</div>
    </Panel>
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel title={`${adt} simulator`}>
        <div className="mb-3 grid gap-2 sm:grid-cols-2"><label className="text-sm text-slate-600">Value or key<input aria-label="Value or key" value={input} onChange={(event) => setInput(event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-slate-900" /></label>{(adt === 'Map' || adt === 'List') && <label className="text-sm text-slate-600">{adt === 'Map' ? 'Value' : 'Replacement'}<input aria-label={adt === 'Map' ? 'Value' : 'Replacement'} value={second} onChange={(event) => setSecond(event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-slate-900" /></label>}</div>
        <div className="flex flex-wrap gap-2">{adtOperations[adt].map((operation) => <button key={operation} onClick={() => run(operation)} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700">{operation}</button>)}</div>
        <div className="mt-4 min-h-20 rounded-lg bg-slate-50 p-3"><p className="text-xs font-semibold uppercase text-slate-500">Current contents</p><div className="mt-2 flex flex-wrap gap-2">{values.length ? values.map((value, index) => <span key={`${index}-${value}`} className="pointer-marker rounded-lg border border-indigo-200 bg-white px-3 py-1.5 font-mono text-sm">{value}</span>) : <span className="text-sm text-slate-500">[] (empty)</span>}</div><p aria-live="polite" className="mt-2 text-sm text-slate-600">{message}</p></div>
      </Panel>
      <Panel title="Operations are the interface">
        <p className="text-sm leading-6 text-slate-600">A caller asks the ADT to do something using its named operations. It does not need to know whether values live in an array, linked nodes, or a hash table.</p>
        <div className="mt-4 grid gap-3"><div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3"><strong className="text-sm">Logical behavior</strong><p className="mt-1 text-sm text-slate-600">{adtOperations[adt].join(' · ')}</p></div><div className="rounded-lg border border-slate-200 p-3"><strong className="text-sm">One possible implementation</strong><p className="mt-1 text-sm text-slate-600">{implementation[adt]}</p></div></div>
      </Panel>
    </div>
  </div>;
}

function ComplexityLesson({ onInteraction }) {
  const [complexity, setComplexity] = useState('linear');
  const [n, setN] = useState(8);
  const [searchStep, setSearchStep] = useState(-1);
  const [demoStep, setDemoStep] = useState(0);
  const [memoryView, setMemoryView] = useState('linear');
  const [language, setLanguage] = useState('python');
  const series = useMemo(() => createGrowthSeries(24), []);
  const selected = complexityOptions.find((item) => item.id === complexity);
  const demo = getComplexityDemoState(complexity, n, demoStep);
  const comparisons = [4, 8, 2, 9, 5];
  const memoryInput = Array.from({ length: n }, (_, index) => index + 1);
  const extraSlots = memoryView === 'linear'
    ? ['target', 'index']
    : memoryInput.map((_, index) => memoryView === 'array' ? `copy ${index + 1}` : `call ${index + 1}`);
  const searchFinished = searchStep >= comparisons.indexOf(9);
  const searchIndex = searchStep >= 0 ? searchStep : -1;
  const searchNext = () => {
    if (searchFinished) return;
    const next = searchStep + 1;
    setSearchStep(next);
    onInteraction();
  };
  return <div className="space-y-5">
    <Panel title="Explore growth as input size changes">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(240px,0.8fr)]">
        <div><label className="block text-sm font-medium text-slate-700">Growth class<select value={complexity} onChange={(event) => { setComplexity(event.target.value); setDemoStep(0); }} className="mt-1 w-full rounded-lg border bg-white px-3 py-2">{complexityOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
          <label className="mt-4 block text-sm font-medium text-slate-700">Input size, n = {n}<input type="range" min="1" max="24" value={n} onChange={(event) => { setN(Number(event.target.value)); setDemoStep(0); }} className="mt-2 w-full" /></label>
          <p className="mt-3 text-sm text-slate-600">{selected.explanation} Example: {selected.example}</p>
          <div className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">Estimated operations: <strong>{estimateOperationCount(complexity, n).toLocaleString()}</strong> (a representative growth estimate, not an exact runtime)</div>
          <div className="mt-4 rounded-lg border border-slate-200 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-sm text-slate-800">Representative algorithm</strong><span className="text-xs text-slate-500">{demo.operations} / {demo.totalOperations} operations</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${(demo.operations / demo.totalOperations) * 100}%` }} /></div>
            <div className="mt-3 max-h-36 overflow-y-auto"><ArrayDiagram values={Array.from({ length: n }, (_, index) => index + 1)} activeIndex={complexity === 'quadratic' && demo.outer !== null ? [demo.outer, demo.inner] : demo.index} /></div>
            <p aria-live="polite" className="mt-2 min-h-10 text-xs leading-5 text-slate-600">
              {demo.operations === 0 ? `Ready to demonstrate ${selected.example.toLowerCase()}` :
                complexity === 'constant' ? 'Read one fixed position; input size does not add more work.' :
                  complexity === 'logarithmic' ? `Binary search checks middle index ${demo.index}; the remaining range starts at ${demo.low}.` :
                    complexity === 'linear' ? `Scan item index ${demo.index}; one more input item is checked.` :
                      complexity === 'linearithmic' ? `Merge-sort style work: operation ${demo.operations} in merge level ${demo.outer + 1}, item ${demo.index}.` :
                        `Nested pair loop: compare row ${demo.outer}, column ${demo.inner}.`}
              {demo.done && ' Demonstration complete.'}
            </p>
            <div className="mt-2 flex gap-2"><button onClick={() => setDemoStep(0)} className="rounded-lg border px-3 py-1.5 text-xs">Reset demo</button><button onClick={() => { setDemoStep((previous) => Math.min(previous + 1, demo.totalOperations)); onInteraction(); }} disabled={demo.done} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white disabled:opacity-50">Run one operation</button></div>
          </div>
        </div>
        <div className="h-60 min-w-0"><ResponsiveContainer width="100%" height="100%"><LineChart data={series}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="size" label={{ value: 'Input size n', position: 'insideBottom', offset: -2 }} /><YAxis /><Tooltip /><Line type="monotone" dataKey={complexity} stroke="#2563eb" strokeWidth={3} dot={false} /><ReferenceLine x={n} stroke="#64748b" strokeDasharray="4 4" /></LineChart></ResponsiveContainer></div>
      </div>
    </Panel>
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel title="Linear search: target 9">
        <ArrayDiagram values={comparisons} activeIndex={searchIndex} />
        <div className="mt-3 flex flex-wrap gap-2"><button onClick={() => setSearchStep(-1)} className="rounded-lg border px-4 py-2 text-sm">Reset</button><button onClick={searchNext} disabled={searchFinished} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50">{searchFinished ? 'Found target' : 'Check next value'}</button></div>
        <p aria-live="polite" className="mt-3 text-sm text-slate-600">{searchStep < 0 ? 'Check one value at a time until the target is found.' : comparisons[searchStep] === 9 ? `Found 9 at index ${searchStep} in ${searchStep + 1} comparisons.` : `${comparisons[searchStep]} is not 9; continue to the next value.`}</p>
        <p className="mt-2 text-xs text-slate-500">Worst case is O(n), because the target can be last or absent and every element may be compared.</p>
      </Panel>
      <Panel title="Space complexity and memory">
        <label className="text-sm font-medium text-slate-700">Example<select value={memoryView} onChange={(event) => setMemoryView(event.target.value)} className="ml-2 rounded-lg border bg-white px-2 py-1"><option value="linear">Linear search</option><option value="array">Array copy</option><option value="recursive">Recursive calls</option></select></label>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3"><strong className="text-xs uppercase text-blue-800">Input (not auxiliary)</strong><div className="mt-2 flex flex-wrap gap-1">{memoryInput.map((value) => <span key={value} className="rounded border border-blue-200 bg-white px-2 py-1 text-xs">{value}</span>)}</div><p className="mt-2 text-xs text-slate-500">{n} stored input values</p></div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3"><strong className="text-xs uppercase text-amber-800">Extra memory</strong><div className="mt-2 flex flex-wrap gap-1">{extraSlots.map((box) => <span key={box} className="rounded border border-amber-300 bg-white px-2 py-1 text-xs">{box}</span>)}</div></div>
        </div>
        <p className="mt-3 text-sm text-slate-600">{memoryView === 'linear' ? 'Linear search uses a fixed number of temporary variables: O(1) auxiliary space.' : memoryView === 'array' ? 'A copied array needs n additional cells: O(n) auxiliary space.' : 'Recursive calls keep frames on the call stack; depth n means O(n) auxiliary space.'}</p>
        <p className="mt-2 text-xs text-slate-500">Total space includes the input; auxiliary space counts only extra memory used by the algorithm.</p>
      </Panel>
    </div>
    <Panel title="Best, average, and worst cases">
      <div className="grid gap-3 sm:grid-cols-3">{[['Best', 'Fewest operations for any input of size n.'], ['Average', 'Expected operations under a stated input distribution.'], ['Worst', 'Most operations for any input of size n.']].map(([label, description]) => <div key={label} className="rounded-lg bg-slate-50 p-3"><strong>{label} case</strong><p className="mt-1 text-sm text-slate-600">{description}</p></div>)}</div>
      <div className="mt-4"><button onClick={() => setLanguage(language === 'python' ? 'java' : 'python')} className="mb-2 rounded-lg border px-3 py-2 text-sm">Show {language === 'python' ? 'Java' : 'Python'}</button><pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm leading-6 text-slate-100">{language === 'python' ? 'for value in values:\n    if value == target:\n        return True\nreturn False' : 'for (int value : values) {\n    if (value == target) return true;\n}\nreturn false;'}</pre></div>
    </Panel>
  </div>;
}

function AsymptoticLesson({ onInteraction }) {
  const [visible, setVisible] = useState(['one', 'log', 'n', 'nlogn', 'n2']);
  const [boundType, setBoundType] = useState('O');
  const [n, setN] = useState(4);
  const [first, setFirst] = useState('n');
  const [second, setSecond] = useState('n2');
  const series = useMemo(() => createGrowthSeries(24), []);
  const example = getBoundExample(boundType, n);
  const comparison = getCurveComparison(first, second, n);
  const toggle = (id) => { setVisible((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]); onInteraction(); };
  const label = (id) => growthLines.find((item) => item.id === id)?.label ?? id;
  return <div className="space-y-5">
    <Panel title="Compare common growth functions">
      <div className="mb-3 flex flex-wrap gap-2">{growthLines.map((line) => <label key={line.id} className="flex items-center gap-2 rounded-full border px-3 py-2 text-sm"><input type="checkbox" checked={visible.includes(line.id)} onChange={() => toggle(line.id)} /><span style={{ color: line.color }}>{line.label}</span></label>)}</div>
      <div className="h-80 min-w-0"><ResponsiveContainer width="100%" height="100%"><LineChart data={series}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="size" label={{ value: 'Input size (n)', position: 'insideBottom', offset: -2 }} /><YAxis label={{ value: 'Operations (relative)', angle: -90, position: 'insideLeft' }} /><Tooltip /><Legend />{growthLines.filter((line) => visible.includes(line.id)).map((line) => <Line key={line.id} type="monotone" dataKey={line.id} name={line.label} stroke={line.color} dot={false} strokeWidth={2} />)}</LineChart></ResponsiveContainer></div>
    </Panel>
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel title="See what a bound means">
        <label className="text-sm font-medium text-slate-700">Bound type<select value={boundType} onChange={(event) => { setBoundType(event.target.value); onInteraction(); }} className="ml-2 rounded-lg border bg-white px-3 py-2"><option value="O">Big O — upper bound</option><option value="Omega">Big Omega — lower bound</option><option value="Theta">Big Theta — tight bound</option></select></label>
        <label className="mt-4 block text-sm text-slate-700">Evaluate at n = {n}<input type="range" min="1" max="20" value={n} onChange={(event) => { setN(Number(event.target.value)); onInteraction(); }} className="mt-2 w-full" /></label>
        <div className="mt-3 rounded-lg bg-violet-50 p-4 text-sm text-violet-950"><p>Function: f(n) = 3n + 2 = <strong>{example.fn}</strong></p><p className="mt-1">{boundType === 'Theta' ? `Lower: ${example.lower} ≤ f(n) ≤ upper: ${example.bound}` : `Bound function: ${example.bound}`}</p><p className="mt-1">Witness: {example.constant}; threshold: {example.threshold}. Bound holds here: <strong>{example.holds ? 'yes' : 'no'}</strong></p></div>
        <p className="mt-3 text-sm text-slate-600">{boundType === 'O' ? 'For n ≥ 1, 3n + 2 ≤ 5n: the function is at most a constant multiple of n.' : boundType === 'Omega' ? 'For n ≥ 1, 3n + 2 ≥ 3n: the function is at least a constant multiple of n.' : 'For n ≥ 1, 3n ≤ 3n + 2 ≤ 5n: both bounds hold, so the function grows tightly as n.'}</p>
      </Panel>
      <Panel title="Compare two growth rates">
        <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm text-slate-700">First<select value={first} onChange={(event) => { setFirst(event.target.value); onInteraction(); }} className="mt-1 w-full rounded-lg border bg-white px-2 py-2">{growthLines.map((line) => <option key={line.id} value={line.id}>{line.label}</option>)}</select></label><label className="text-sm text-slate-700">Second<select value={second} onChange={(event) => { setSecond(event.target.value); onInteraction(); }} className="mt-1 w-full rounded-lg border bg-white px-2 py-2">{growthLines.map((line) => <option key={line.id} value={line.id}>{line.label}</option>)}</select></label></div>
        <label className="mt-4 block text-sm text-slate-700">Input size n = {n}<input type="range" min="1" max="20" value={n} onChange={(event) => { setN(Number(event.target.value)); onInteraction(); }} className="mt-2 w-full" /></label>
        <div className="mt-3 rounded-lg bg-slate-50 p-4 text-sm"><p>{label(first)}: <strong>{comparison.firstValue.toFixed(2)}</strong> estimated operations</p><p>{label(second)}: <strong>{comparison.secondValue.toFixed(2)}</strong> estimated operations</p><p className="mt-2">{comparison.faster === 'equal' ? 'These functions match at this input size.' : `${label(comparison.faster)} is smaller at this input size.`} Constant factors can affect smaller inputs; asymptotic growth describes behavior as n becomes large.</p></div>
      </Panel>
    </div>
  </div>;
}

export default function FundamentalsStudio({ lessonId, completed, onComplete }) {
  const lesson = fundamentalsLessons[lessonId];
  const [interactionDone, setInteractionDone] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const markInteraction = () => setInteractionDone(true);
  const handleCorrect = () => setQuizPassed(true);
  const ready = interactionDone && quizPassed;
  useEffect(() => {
    if (ready && !completed && onComplete) onComplete(lessonId);
  }, [completed, lessonId, onComplete, ready]);
  if (!lesson || !fundamentalsLessonIds.includes(lessonId)) return null;
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.18em] text-indigo-600">DSA fundamentals studio</p><h2 className="mt-2 text-2xl font-bold text-slate-900">{lesson.title}</h2></div>{completed && <span className="badge bg-emerald-100 text-emerald-700">Completed</span>}</div>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">Use the visualization, perform an operation or advance the demonstration, then answer the learning check correctly to complete this lesson.</p>
        <div className="mt-5"><LessonOverview lessonId={lessonId} /></div>
      </div>
      {lessonId === 'intro-dsa' && <IntroductionLesson onInteraction={markInteraction} />}
      {lessonId === 'adt' && <ADTLesson onInteraction={markInteraction} />}
      {lessonId === 'complexity' && <ComplexityLesson onInteraction={markInteraction} />}
      {lessonId === 'big-o' && <AsymptoticLesson onInteraction={markInteraction} />}
      <PracticeQuestion key={`practice-${lessonId}`} lessonId={lessonId} />
      <Quiz key={lessonId} lessonId={lessonId} onCorrect={handleCorrect} />
      {ready && !completed && <div role="status" className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">Lesson completed. Your progress is saved locally for this student account.</div>}
    </div>
  );
}
