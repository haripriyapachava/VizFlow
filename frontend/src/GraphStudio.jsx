import React, { useMemo, useState } from 'react';
import {
  createBellmanFordSteps,
  createDisjointSetUnionSteps,
  createDijkstraSteps,
  createGraphCycleDetectionSteps,
  createGraphTraversalSteps,
  createKruskalSteps,
  createPrimSteps,
  createTopologicalSortSteps,
  parseGraphInput,
} from './lib/graphVisualization';

const lessonContent = {
  'graph-introduction': {
    title: 'Introduction to Graphs',
    concept: 'A graph models relationships between objects using nodes and edges.',
    realLife: 'A social network or road map is a graph where people or cities connect through links.',
    complexity: 'Storage is O(V + E); visiting every node and edge is O(V + E).',
  },
  'graph-directions': {
    title: 'Directed and Undirected Graphs',
    concept: 'An undirected graph has two-way links, while a directed graph follows a single direction.',
    realLife: 'A one-way street map is a directed graph, but a friendship graph is typically undirected.',
    complexity: 'Traversal still runs in O(V + E) because each edge is examined once.',
  },
  'graph-weights': {
    title: 'Weighted and Unweighted Graphs',
    concept: 'Weighted graphs attach a cost to each link, which matters for shortest paths and route planning.',
    realLife: 'Travel distance, latency, or shipping cost are common graph weights.',
    complexity: 'The same traversal is O(V + E), but shortest-path algorithms also account for edge costs.',
  },
  'graph-representations': {
    title: 'Adjacency Matrix and Adjacency List',
    concept: 'A matrix stores every possible connection, while an adjacency list keeps only the neighbors of each node.',
    realLife: 'Large sparse graphs are often stored as adjacency lists to save space.',
    complexity: 'An adjacency list is O(V + E) space; a matrix is O(V²) space.',
  },
  'graph-bfs': {
    title: 'Breadth-First Search (BFS)',
    concept: 'BFS explores nodes level by level using a queue.',
    realLife: 'BFS is useful for finding the nearest friend, shortest path in an unweighted graph, or nearest layer in a network.',
    complexity: 'Time and space are O(V + E).',
  },
  'graph-dfs': {
    title: 'Depth-First Search (DFS)',
    concept: 'DFS explores as far as possible along one branch before backtracking.',
    realLife: 'DFS is used for cycle checks, connectivity tests, and path discovery.',
    complexity: 'Time and space are O(V + E).',
  },
  'graph-cycle-detection': {
    title: 'Graph Cycle Detection',
    concept: 'A cycle appears when a traversal reaches a node already in the recursion stack or seen set.',
    realLife: 'This matters for dependency graphs, scheduling, and avoiding infinite loops in state transitions.',
    complexity: 'Cycle detection runs in O(V + E).',
  },
  dijkstra: {
    title: "Dijkstra's Algorithm",
    concept: 'Dijkstra repeatedly picks the lowest known distance and relaxes neighbors.',
    realLife: 'It finds the shortest route in traffic or network routing while discounts are non-negative.',
    complexity: 'With a priority queue it runs in O((V + E) log V).',
  },
  'bellman-ford': {
    title: 'Bellman-Ford Algorithm',
    concept: 'Bellman-Ford repeats edge relaxations to compute shortest paths and detect negative-weight cycles.',
    realLife: 'It is useful in routing systems that allow negative costs or where a single pass is not enough.',
    complexity: 'It runs in O(VE).',
  },
  'topological-sort': {
    title: 'Topological Sorting',
    concept: 'A topological order ensures every dependency appears before the task that depends on it.',
    realLife: 'Course prerequisites and build ordering are classic topological sort examples.',
    complexity: 'Topological sorting runs in O(V + E).',
  },
  prim: {
    title: "Prim's Algorithm",
    concept: 'Prim grows a minimum spanning tree by always choosing the lightest edge connecting the tree to an unseen vertex.',
    realLife: 'It helps design efficient network or infrastructure layouts.',
    complexity: 'Using a priority queue, it runs in O((V + E) log V).',
  },
  kruskal: {
    title: "Kruskal's Algorithm",
    concept: 'Kruskal sorts edges by weight and greedily picks the next safe edge that does not create a cycle.',
    realLife: 'It is common in circuit layout and spanning-tree network design.',
    complexity: 'Sorting edges dominates the runtime at O(E log E).',
  },
  'disjoint-set-union': {
    title: 'Disjoint Set Union',
    concept: 'Union-find keeps track of connected components and merges them efficiently with path compression and unions by rank.',
    realLife: 'It supports network connectivity checks and Kruskal’s algorithm.',
    complexity: 'Each operation is nearly constant time on average: inverse Ackermann behavior.',
  },
};

const graphPresets = {
  'graph-introduction': 'A: B, C; B: A, D; C: A, D; D: B, C',
  'graph-bfs': 'A: B, C; B: A, D; C: A, D; D: B, C',
  'graph-dfs': 'A: B, C; B: A, D; C: A, D; D: B, C',
  'graph-cycle-detection': 'A: B; B: C; C: A',
  dijkstra: 'A: B, C; B: D; C: D; D: ',
  'bellman-ford': 'A: B; B: C; C: D',
  'topological-sort': 'Math: Algebra; Algebra: Physics; Physics: Literature; Literature: ',
  prim: 'A: B, C; B: A, C; C: A, B',
  kruskal: 'A: B, C; B: A, C; C: A, B',
  'disjoint-set-union': 'A: B; B: C; D: E',
};

function GraphDiagram({ nodes, edges, highlight, currentNode }) {
  const positions = {};
  const centerX = 160;
  const centerY = 120;
  const angleStep = (2 * Math.PI) / Math.max(nodes.length, 1);
  nodes.forEach((node, index) => {
    const angle = -Math.PI / 2 + index * angleStep;
    positions[node] = {
      x: centerX + Math.cos(angle) * 120,
      y: centerY + Math.sin(angle) * 80,
    };
  });

  return (
    <svg className="h-[300px] w-full" viewBox="0 0 420 260" role="img" aria-label="Graph diagram">
      {edges.map(([from, to], index) => {
        const start = positions[from];
        const end = positions[to];
        const isHighlighted = highlight?.includes(from) || highlight?.includes(to) || currentNode === from || currentNode === to;
        return <line key={`${from}-${to}-${index}`} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={isHighlighted ? '#f59e0b' : '#94a3b8'} strokeWidth={isHighlighted ? 3 : 2} />;
      })}
      {nodes.map((node) => {
        const point = positions[node];
        const active = currentNode === node;
        return (
          <g key={node}>
            <circle cx={point.x} cy={point.y} r={28} fill={active ? '#fef3c7' : '#eff6ff'} stroke={active ? '#f59e0b' : '#60a5fa'} strokeWidth={active ? 3 : 2} />
            <text x={point.x} y={point.y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="#0f172a">{node}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function GraphStudio({ lessonId }) {
  const content = lessonContent[lessonId] ?? lessonContent['graph-introduction'];
  const [inputText, setInputText] = useState(graphPresets[lessonId] ?? 'A: B, C; B: A, D; C: A, D; D: B, C');
  const [trace, setTrace] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  const graph = useMemo(() => parseGraphInput(inputText), [inputText]);
  const nodes = useMemo(() => Object.keys(graph), [graph]);
  const edges = useMemo(() => Object.entries(graph).flatMap(([from, neighbors]) => neighbors.map((to) => [from, to])), [graph]);

  const runVisualization = () => {
    let nextTrace = [];
    switch (lessonId) {
      case 'graph-bfs':
        nextTrace = createGraphTraversalSteps(inputText, 'bfs');
        break;
      case 'graph-dfs':
        nextTrace = createGraphTraversalSteps(inputText, 'dfs');
        break;
      case 'graph-cycle-detection':
        nextTrace = createGraphCycleDetectionSteps(inputText);
        break;
      case 'dijkstra':
        nextTrace = createDijkstraSteps(inputText, 'A');
        break;
      case 'bellman-ford':
        nextTrace = createBellmanFordSteps(inputText, 'A');
        break;
      case 'topological-sort':
        nextTrace = createTopologicalSortSteps(inputText);
        break;
      case 'prim':
        nextTrace = createPrimSteps(inputText);
        break;
      case 'kruskal':
        nextTrace = createKruskalSteps(inputText);
        break;
      case 'disjoint-set-union':
        nextTrace = createDisjointSetUnionSteps(inputText);
        break;
      default:
        nextTrace = createGraphTraversalSteps(inputText, 'bfs');
        break;
    }
    setTrace(nextTrace);
    setCurrentStep(0);
  };

  const step = trace[currentStep] ?? null;
  const nextStep = () => setCurrentStep((value) => Math.min(value + 1, Math.max(trace.length - 1, 0)));
  const prevStep = () => setCurrentStep((value) => Math.max(value - 1, 0));

  return (
    <div className="space-y-5">
      <section className="card p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-blue-600">Graph learning studio · Interactive</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">{content.title}</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[['Definition', content.concept], ['Real-world link', content.realLife], ['Complexity', content.complexity]].map(([label, text]) => (
            <div key={label} className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
              <h3 className="font-semibold text-slate-800">{label}</h3>
              <p className="mt-1 text-sm leading-5 text-slate-600">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <label htmlFor="graph-input" className="mb-1 block text-sm font-medium text-slate-700">Graph input (node: neighbors; ...)</label>
          <textarea id="graph-input" value={inputText} onChange={(event) => setInputText(event.target.value)} rows={5} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800" />
          <div className="mt-3 flex gap-3">
            <button type="button" onClick={runVisualization} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">Run trace</button>
            <button type="button" onClick={prevStep} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">Previous</button>
            <button type="button" onClick={nextStep} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">Next</button>
          </div>
        </div>
      </section>

      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Graph visualization</h3>
          <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Step {trace.length ? currentStep + 1 : 0} / {trace.length || 0}</span>
        </div>
        <GraphDiagram nodes={nodes} edges={edges} highlight={step?.visited ?? []} currentNode={step?.currentNode ?? step?.node ?? null} />
        {step && <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{step.operation}</div>}
      </section>
    </div>
  );
}
