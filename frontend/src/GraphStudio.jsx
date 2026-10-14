import React, { useEffect, useMemo, useState } from 'react';
import {
  createBellmanFordSteps,
  createBfsSteps,
  createDfsSteps,
  createDisjointSetUnionSteps,
  createDijkstraSteps,
  createGraphCycleDetectionSteps,
  createGraphTraversalSteps,
  createKruskalSteps,
  createPrimSteps,
  createTopologicalSortSteps,
  getBfsCode,
  getDijkstraCode,
  getDfsCode,
  getGraphCycleDetectionCode,
  parseCycleGraphInput,
  parseBfsGraphInput,
  parseWeightedGraphInput,
  parseGraphInput,
  reconstructDijkstraPath,
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
    title: 'Graph Types and Representations',
    concept: 'Graphs may be directed or undirected, and weighted or unweighted. An adjacency matrix stores every possible connection, while an adjacency list keeps only each node’s neighbors.',
    realLife: 'One-way streets are directed edges, two-way friendships are undirected edges, and route distances are weights. Adjacency lists are common for sparse networks; matrices suit dense graphs.',
    complexity: 'Adjacency lists use O(V + E) space; adjacency matrices use O(V²). Traversing either representation takes O(V + E) with an adjacency list or O(V²) with a matrix.',
  },
  'graph-bfs': {
    title: 'Breadth-First Search (BFS)',
    concept: 'BFS explores a graph level by level. It removes the oldest node from a queue, then adds each undiscovered neighbor to the back.',
    realLife: 'BFS is useful for finding the nearest friend, shortest path in an unweighted graph, or nearest layer in a network.',
    complexity: 'Time is O(V + E); the queue, visited set, and traversal order use O(V) space.',
    practice: 'Why does BFS use a queue?',
  },
  'graph-dfs': {
    title: 'Depth-First Search (DFS)',
    concept: 'DFS follows one branch as far as it can using a stack. When a node has no unvisited neighbors, DFS backtracks to the previous node.',
    realLife: 'DFS is used for cycle checks, connectivity tests, and path discovery.',
    complexity: 'With neighbors in a stable order, DFS visits each vertex and edge in O(V + E) time and uses O(V) auxiliary space. Sorting neighbors adds preprocessing cost.',
  },
  'graph-cycle-detection': {
    title: 'Graph Cycle Detection',
    concept: 'DFS detects cycles differently by graph type: undirected graphs track each node’s parent; directed graphs check whether an edge returns to the active recursion stack.',
    realLife: 'Cycle checks catch circular prerequisites, dependency loops, and routes that return to an earlier location.',
    complexity: 'DFS cycle detection takes O(V + E) time and O(V) space across all components.',
  },
  dijkstra: {
    title: "Dijkstra's Shortest Path Algorithm",
    concept: 'Dijkstra repeatedly finalizes the unvisited node with the smallest known distance, then checks whether its edges can improve neighboring distances.',
    realLife: 'Navigation apps and network routing use weighted shortest paths to find the least-cost route.',
    complexity: 'This minimum-selection implementation takes O(V² + E) time and O(V + E) space. Edge weights must be non-negative.',
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
  dijkstra: 'A: B(4), C(2); B: A(4), C(1), D(5); C: A(2), B(1), D(8); D: B(5), C(8)',
  'bellman-ford': 'A: B; B: C; C: D',
  'topological-sort': 'Math: Algebra; Algebra: Physics; Physics: Literature; Literature: ',
  prim: 'A: B, C; B: A, C; C: A, B',
  kruskal: 'A: B, C; B: A, C; C: A, B',
  'disjoint-set-union': 'A: B; B: C; D: E',
};

function formatGraphDistance(distance) {
  return Number.isFinite(distance) ? String(distance) : 'Infinity';
}

function GraphDiagram({ nodes, edges, highlight, currentNode, activeEdge, cycleEdge, treeEdges = [], visited, preciseHighlights = false, directed = false, weighted = false, visitedLabel = 'discovered' }) {
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
      {directed && (
        <defs>
          <marker id="graph-arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
            <path d="M 0 0 L 8 4 L 0 8 z" fill="#64748b" />
          </marker>
          <marker id="graph-active-arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
            <path d="M 0 0 L 8 4 L 0 8 z" fill="#ef4444" />
          </marker>
        </defs>
      )}
      {edges.map(([from, to, weight], index) => {
        const start = positions[from];
        const end = positions[to];
        const isActiveEdge = activeEdge && (activeEdge[0] === from && activeEdge[1] === to || (!directed && activeEdge[0] === to && activeEdge[1] === from));
        const isCycleEdge = cycleEdge && (cycleEdge[0] === from && cycleEdge[1] === to || (!directed && cycleEdge[0] === to && cycleEdge[1] === from));
        const isTreeEdge = treeEdges.some(([treeFrom, treeTo]) => treeFrom === from && treeTo === to || (!directed && treeFrom === to && treeTo === from));
        const isHighlighted = preciseHighlights
          ? isCycleEdge || isActiveEdge || isTreeEdge
          : highlight?.includes(from) || highlight?.includes(to) || currentNode === from || currentNode === to;
        const stroke = isCycleEdge ? '#ef4444' : isActiveEdge ? '#f59e0b' : isTreeEdge ? '#16a34a' : isHighlighted ? '#f59e0b' : '#94a3b8';
        if (from === to) {
          return (
            <g key={`${from}-${to}-${index}`}>
              <path data-active={isActiveEdge ? 'true' : undefined} data-cycle={isCycleEdge ? 'true' : undefined} d={`M ${start.x - 14} ${start.y - 20} C ${start.x - 54} ${start.y - 70}, ${start.x + 54} ${start.y - 70}, ${start.x + 14} ${start.y - 20}`} fill="none" stroke={stroke} strokeWidth={isHighlighted ? 4 : 2} markerEnd={directed ? `url(#${isCycleEdge ? 'graph-active-arrowhead' : 'graph-arrowhead'})` : undefined} />
              {weighted && <text x={start.x} y={start.y - 45} textAnchor="middle" fontSize="12" fontWeight="700" fill="#334155" stroke="white" strokeWidth="4" paintOrder="stroke">{weight}</text>}
            </g>
          );
        }
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.hypot(dx, dy) || 1;
        const inset = directed ? 30 : 0;
        const x1 = start.x + (dx / length) * inset;
        const y1 = start.y + (dy / length) * inset;
        const x2 = end.x - (dx / length) * inset;
        const y2 = end.y - (dy / length) * inset;
        return (
          <g key={`${from}-${to}-${index}`}>
            <line data-active={isActiveEdge ? 'true' : undefined} data-cycle={isCycleEdge ? 'true' : undefined} data-tree={isTreeEdge ? 'true' : undefined} x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={isHighlighted ? (preciseHighlights ? 4 : 3) : 2} markerEnd={directed ? `url(#${isCycleEdge ? 'graph-active-arrowhead' : 'graph-arrowhead'})` : undefined} />
            {weighted && <text x={(start.x + end.x) / 2} y={(start.y + end.y) / 2 - 7} textAnchor="middle" fontSize="12" fontWeight="700" fill="#334155" stroke="white" strokeWidth="4" paintOrder="stroke">{weight}</text>}
          </g>
        );
      })}
      {nodes.map((node) => {
        const point = positions[node];
        const active = currentNode === node;
        const hasVisited = preciseHighlights && visited?.includes(node);
        return (
          <g key={node} aria-label={`Node ${node}${active ? ', current node' : hasVisited ? `, ${visitedLabel}` : ''}`}>
            <circle cx={point.x} cy={point.y} r={28} fill={active ? '#fef3c7' : hasVisited ? '#dbeafe' : '#eff6ff'} stroke={active ? '#f59e0b' : hasVisited ? '#2563eb' : '#60a5fa'} strokeWidth={active ? 3 : 2} />
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
  const [startNode, setStartNode] = useState('A');
  const [dfsStartNode, setDfsStartNode] = useState('A');
  const [cycleDirected, setCycleDirected] = useState(false);
  const [dijkstraStartNode, setDijkstraStartNode] = useState('A');
  const [dijkstraDestination, setDijkstraDestination] = useState('D');
  const [dijkstraDirected, setDijkstraDirected] = useState(false);
  const [language, setLanguage] = useState('python');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [inputError, setInputError] = useState('');

  const parsedTraversalGraph = useMemo(() => {
    if (lessonId !== 'graph-bfs' && lessonId !== 'graph-dfs' && lessonId !== 'graph-cycle-detection') return null;
    try {
      return {
        graph: lessonId === 'graph-cycle-detection'
          ? parseCycleGraphInput(inputText, cycleDirected)
          : parseBfsGraphInput(inputText),
        error: '',
      };
    } catch (error) {
      return { graph: null, error: error instanceof Error ? error.message : 'Unable to parse this graph.' };
    }
  }, [cycleDirected, inputText, lessonId]);
  const parsedWeightedGraph = useMemo(() => {
    if (lessonId !== 'dijkstra') return null;
    try {
      return { graph: parseWeightedGraphInput(inputText, dijkstraDirected), error: '' };
    } catch (error) {
      return { graph: null, error: error instanceof Error ? error.message : 'Unable to parse this weighted graph.' };
    }
  }, [dijkstraDirected, inputText, lessonId]);
  const graph = useMemo(() => {
    if (lessonId === 'graph-bfs' || lessonId === 'graph-dfs' || lessonId === 'graph-cycle-detection') return parsedTraversalGraph?.graph ?? { nodes: [], edges: [] };
    if (lessonId === 'dijkstra') return parsedWeightedGraph?.graph ?? { nodes: [], edges: [] };
    return parseGraphInput(inputText);
  }, [inputText, lessonId, parsedTraversalGraph, parsedWeightedGraph]);
  const nodes = useMemo(() => lessonId === 'graph-bfs' || lessonId === 'graph-dfs' || lessonId === 'graph-cycle-detection' || lessonId === 'dijkstra' ? graph.nodes : Object.keys(graph), [graph, lessonId]);
  const edges = useMemo(() => lessonId === 'graph-bfs' || lessonId === 'graph-dfs' || lessonId === 'graph-cycle-detection' || lessonId === 'dijkstra'
    ? graph.edges
    : Object.entries(graph).flatMap(([from, neighbors]) => neighbors.map((to) => [from, to])), [graph, lessonId]);

  useEffect(() => {
    if (!isPlaying || !trace.length) return undefined;
    if (currentStep >= trace.length - 1) {
      setIsPlaying(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setCurrentStep((step) => step + 1), 900 / speed);
    return () => window.clearTimeout(timer);
  }, [currentStep, isPlaying, speed, trace]);

  const updateInput = (update) => {
    update();
    setTrace([]);
    setCurrentStep(0);
    setIsPlaying(false);
    setInputError('');
  };

  const runVisualization = () => {
    let nextTrace = [];
    try {
      switch (lessonId) {
        case 'graph-bfs':
          nextTrace = createBfsSteps(inputText, startNode);
          break;
        case 'graph-dfs':
          nextTrace = createDfsSteps(inputText, dfsStartNode);
          break;
        case 'graph-cycle-detection':
          nextTrace = createGraphCycleDetectionSteps(inputText, cycleDirected);
          break;
        case 'dijkstra':
          nextTrace = createDijkstraSteps(inputText, dijkstraStartNode, dijkstraDirected);
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
      setIsPlaying(false);
      setInputError('');
    } catch (error) {
      setTrace([]);
      setCurrentStep(0);
      setIsPlaying(false);
      setInputError(error instanceof Error ? error.message : 'Unable to generate this graph trace.');
    }
  };

  const step = trace[currentStep] ?? null;
  const nextStep = () => { setIsPlaying(false); setCurrentStep((value) => Math.min(value + 1, Math.max(trace.length - 1, 0))); };
  const prevStep = () => { setIsPlaying(false); setCurrentStep((value) => Math.max(value - 1, 0)); };
  const bfsSource = lessonId === 'graph-bfs' ? getBfsCode(language) : null;
  const bfsSourceLines = bfsSource?.code.split('\n') ?? [];
  const dfsSource = lessonId === 'graph-dfs' ? getDfsCode(language) : null;
  const dfsSourceLines = dfsSource?.code.split('\n') ?? [];
  const cycleSource = lessonId === 'graph-cycle-detection' ? getGraphCycleDetectionCode(cycleDirected, language) : null;
  const cycleSourceLines = cycleSource?.code.split('\n') ?? [];
  const dijkstraSource = lessonId === 'dijkstra' ? getDijkstraCode(language) : null;
  const dijkstraSourceLines = dijkstraSource?.code.split('\n') ?? [];
  const dijkstraFinalStep = trace.at(-1);
  const dijkstraPath = dijkstraFinalStep?.complete && dijkstraDestination
    ? reconstructDijkstraPath(dijkstraFinalStep.result.previous, dijkstraStartNode.trim(), dijkstraDestination)
    : [];
  const dijkstraPathCost = dijkstraPath.length ? dijkstraFinalStep.result.distances[dijkstraDestination] : Number.POSITIVE_INFINITY;

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
          <label htmlFor="graph-input" className="mb-1 block text-sm font-medium text-slate-700">
            {lessonId === 'dijkstra' ? 'Weighted graph input (node: neighbor(weight), ...; ...)' : 'Graph input (node: neighbors; ...)'}
          </label>
          <textarea
            id="graph-input"
            value={inputText}
            onChange={(event) => updateInput(() => setInputText(event.target.value))}
            rows={5}
            aria-invalid={(lessonId === 'graph-bfs' || lessonId === 'graph-dfs' || lessonId === 'graph-cycle-detection') && Boolean(parsedTraversalGraph?.error) || lessonId === 'dijkstra' && Boolean(parsedWeightedGraph?.error)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
          />
          {lessonId === 'dijkstra' && (
            <>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <label htmlFor="dijkstra-start-node" className="grid gap-1 text-sm font-medium text-slate-700">
                  Starting node
                  <input
                    id="dijkstra-start-node"
                    value={dijkstraStartNode}
                    onChange={(event) => updateInput(() => setDijkstraStartNode(event.target.value))}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    placeholder="A"
                  />
                </label>
                <label htmlFor="dijkstra-graph-mode" className="grid gap-1 text-sm font-medium text-slate-700">
                  Graph type
                  <select
                    id="dijkstra-graph-mode"
                    value={dijkstraDirected ? 'directed' : 'undirected'}
                    onChange={(event) => updateInput(() => setDijkstraDirected(event.target.value === 'directed'))}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                  >
                    <option value="undirected">Undirected</option>
                    <option value="directed">Directed</option>
                  </select>
                </label>
              </div>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <label htmlFor="dijkstra-destination" className="grid gap-1 text-sm font-medium text-slate-700">
                  Destination for path
                  <select
                    id="dijkstra-destination"
                    value={nodes.includes(dijkstraDestination) ? dijkstraDestination : ''}
                    onChange={(event) => setDijkstraDestination(event.target.value)}
                    disabled={!nodes.length}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 disabled:opacity-50"
                  >
                    <option value="">Select destination</option>
                    {nodes.map((node) => <option key={node} value={node}>{node}</option>)}
                  </select>
                </label>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Use a non-negative weight in parentheses, including 0. {dijkstraDirected ? 'Edges point only from each node to its listed neighbors.' : 'Edges are two-way; list each node and its neighbors.'}
              </p>
            </>
          )}
          {lessonId === 'graph-cycle-detection' && (
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <label htmlFor="cycle-graph-mode" className="grid gap-1 text-sm font-medium text-slate-700">
                Graph type
                <select
                  id="cycle-graph-mode"
                  value={cycleDirected ? 'directed' : 'undirected'}
                  onChange={(event) => updateInput(() => setCycleDirected(event.target.value === 'directed'))}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                >
                  <option value="undirected">Undirected</option>
                  <option value="directed">Directed</option>
                </select>
              </label>
              <p className="text-xs text-slate-500">{cycleDirected ? 'Edges point only from each node to its listed neighbors.' : 'Edges are two-way; list each node and its neighbors.'} Empty graph input is allowed and reports no cycle.</p>
            </div>
          )}
          {lessonId === 'graph-bfs' && (
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <label htmlFor="bfs-start-node" className="grid gap-1 text-sm font-medium text-slate-700">
                Starting node
                <input
                  id="bfs-start-node"
                  value={startNode}
                  onChange={(event) => updateInput(() => setStartNode(event.target.value))}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                  placeholder="A"
                />
              </label>
              <p className="text-xs text-slate-500">List every node; use an empty neighbor list for an isolated node (for example, X:).</p>
            </div>
          )}
          {lessonId === 'graph-dfs' && (
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <label htmlFor="dfs-start-node" className="grid gap-1 text-sm font-medium text-slate-700">
                Starting node
                <input
                  id="dfs-start-node"
                  value={dfsStartNode}
                  onChange={(event) => updateInput(() => setDfsStartNode(event.target.value))}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                  placeholder="A"
                />
              </label>
              <p className="text-xs text-slate-500">List every node; use an empty neighbor list for an isolated node (for example, X:).</p>
            </div>
          )}
          {lessonId === 'dijkstra' && (
            <p className="mt-3 text-xs text-slate-500">Example: A: B(4), C(2); B: A(4), D(5); C: A(2), D(1); D:</p>
          )}
          <div className="mt-3 flex gap-3">
            <button type="button" onClick={runVisualization} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">{lessonId === 'graph-bfs' ? 'Run BFS' : lessonId === 'graph-dfs' ? 'Run DFS' : lessonId === 'dijkstra' ? 'Run Dijkstra' : 'Run trace'}</button>
            {lessonId !== 'graph-bfs' && lessonId !== 'graph-dfs' && lessonId !== 'graph-cycle-detection' && lessonId !== 'dijkstra' && (
              <>
                <button type="button" onClick={prevStep} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">Previous</button>
                <button type="button" onClick={nextStep} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">Next</button>
              </>
            )}
          </div>
          {inputError && <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{inputError}</p>}
        </div>
      </section>

      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Graph visualization</h3>
          <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Step {trace.length ? currentStep + 1 : 0} / {trace.length || 0}</span>
        </div>
        {lessonId === 'graph-bfs' && (
          <div className="mb-3 flex flex-wrap gap-3 text-sm">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2"><span className="text-slate-500">Queue (front → back):</span>{' '}<span className="font-semibold">{step?.queue.join(' → ') || '∅'}</span></div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2"><span className="text-slate-500">Discovered:</span>{' '}<span className="font-semibold">{step?.visited.join(' → ') || '—'}</span></div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2"><span className="text-slate-500">BFS traversal order:</span>{' '}<span className="font-semibold">{step?.traversalOrder.join(' → ') || '—'}</span></div>
            {step?.disconnected.length > 0 && <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800"><span className="font-medium">Not reachable from start:</span>{' '}{step.disconnected.join(', ')}</div>}
          </div>
        )}
        {lessonId === 'graph-dfs' && (
          <div className="mb-3 flex flex-wrap gap-3 text-sm">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2"><span className="text-slate-500">DFS stack (bottom → top):</span>{' '}<span className="font-semibold">{step?.stack.join(' → ') || '∅'}</span></div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2"><span className="text-slate-500">Visited:</span>{' '}<span className="font-semibold">{step?.visited.join(' → ') || '—'}</span></div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2"><span className="text-slate-500">DFS traversal order:</span>{' '}<span className="font-semibold">{step?.traversalOrder.join(' → ') || '—'}</span></div>
            {step?.lineId === 'complete' && step.disconnected.length > 0 && <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800"><span className="font-medium">Not reachable from start:</span>{' '}{step.disconnected.join(', ')}</div>}
          </div>
        )}
        {lessonId === 'graph-cycle-detection' && (
          <div className="mb-3 flex flex-wrap gap-3 text-sm">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2"><span className="text-slate-500">{cycleDirected ? 'Recursion stack:' : 'DFS stack:'}</span>{' '}<span className="font-semibold">{step?.stack.join(' → ') || '∅'}</span></div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2"><span className="text-slate-500">Visited nodes:</span>{' '}<span className="font-semibold">{step?.visited.join(' → ') || '—'}</span></div>
            {step && <div className={`rounded-lg border px-3 py-2 font-semibold ${step.cycle ? 'border-red-200 bg-red-50 text-red-800' : 'border-slate-200 bg-white text-slate-700'}`}>{step.cycle ? 'Cycle Detected' : step.complete ? 'No Cycle Detected' : 'Checking for a cycle…'}</div>}
          </div>
        )}
        {lessonId === 'dijkstra' && step && (
          <div className="mb-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <h4 className="border-b border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800">Shortest known distances</h4>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-2">Node</th><th className="px-3 py-2">Distance from {dijkstraStartNode.trim() || 'source'}</th><th className="px-3 py-2">State</th></tr></thead>
                <tbody>
                  {nodes.map((node) => (
                    <tr key={node} className={`border-t border-slate-100 ${node === step.currentNode ? 'bg-amber-50' : ''}`}>
                      <th scope="row" className="px-3 py-2 font-semibold text-slate-800">{node}</th>
                      <td className="px-3 py-2 font-mono">{formatGraphDistance(step.distances[node])}</td>
                      <td className="px-3 py-2 text-slate-600">{step.finalized.includes(node) ? 'Finalized' : step.distances[node] === Number.POSITIVE_INFINITY ? step.complete ? 'Unreachable' : 'Infinity' : 'Tentative'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid content-start gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
                <div className="text-xs uppercase tracking-wide text-slate-500">Minimum-distance selection (node: distance)</div>
                <div className="mt-1 font-semibold text-slate-800">{step.priorityQueue.map(({ node, distance }) => `${node}: ${formatGraphDistance(distance)}`).join(' · ') || 'No reachable unvisited nodes'}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
                <div className="text-xs uppercase tracking-wide text-slate-500">Finalized nodes</div>
                <div className="mt-1 font-semibold text-slate-800">{step.finalized.join(' → ') || '—'}</div>
              </div>
              {step.calculation && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <div className="text-xs font-semibold uppercase tracking-wide">Distance check</div>
                <div className="mt-1 font-mono">{step.calculation.currentDistance} + {step.calculation.weight} = {step.calculation.candidateDistance}</div>
                <div className="mt-1">Current best for {step.calculation.to}: {formatGraphDistance(step.calculation.knownDistance)}</div>
              </div>}
              {step.complete && step.unreachable.length > 0 && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Unreachable from {dijkstraStartNode}: {step.unreachable.join(', ')}</div>}
              {step.complete && dijkstraDestination && (
                <div className={`rounded-xl border p-3 text-sm ${dijkstraPath.length ? 'border-green-200 bg-green-50 text-green-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
                  <div className="font-semibold">Shortest path to {dijkstraDestination}</div>
                  {dijkstraPath.length
                    ? <div className="mt-1">Path: <span className="font-mono font-semibold">{dijkstraPath.join(' → ')}</span><br />Total cost: <span className="font-semibold">{formatGraphDistance(dijkstraPathCost)}</span></div>
                    : <div className="mt-1">No path from {dijkstraStartNode} to {dijkstraDestination}. Distance: Infinity.</div>}
                </div>
              )}
            </div>
          </div>
        )}
        <GraphDiagram
          nodes={nodes}
          edges={edges}
          highlight={step?.visited ?? []}
          currentNode={step?.currentNode ?? step?.node ?? null}
          activeEdge={step?.edge}
          cycleEdge={step?.cycleEdge}
          treeEdges={lessonId === 'dijkstra' ? step?.shortestPathEdges ?? [] : []}
          visited={step?.visited}
          preciseHighlights={lessonId === 'graph-bfs' || lessonId === 'graph-dfs' || lessonId === 'graph-cycle-detection' || lessonId === 'dijkstra'}
          visitedLabel={lessonId === 'dijkstra' ? 'finalized' : 'discovered'}
          directed={lessonId === 'graph-cycle-detection' && cycleDirected || lessonId === 'dijkstra' && dijkstraDirected}
          weighted={lessonId === 'dijkstra'}
        />
        {step && <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{step.operation}</div>}
        {lessonId === 'graph-bfs' && step && <p className="mt-2 rounded-xl bg-blue-50 p-3 text-sm leading-5 text-blue-900">{step.explanation}</p>}
        {lessonId === 'graph-cycle-detection' && step && <p className={`mt-2 rounded-xl p-3 text-sm leading-5 ${step.cycleEdge ? 'bg-red-50 text-red-900' : 'bg-blue-50 text-blue-900'}`}>{step.explanation}</p>}
        {lessonId === 'dijkstra' && step && <p className="mt-2 rounded-xl bg-blue-50 p-3 text-sm leading-5 text-blue-900">{step.explanation}</p>}
        {lessonId === 'graph-bfs' && (
          <div className="mt-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <h4 className="font-semibold text-slate-800">BFS source code</h4>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                Language
                <select value={language} onChange={(event) => setLanguage(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5">
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>
              </label>
            </div>
            <pre className="overflow-x-auto rounded-xl bg-slate-900 p-3 text-xs text-slate-100">
              <code>{bfsSourceLines.map((line, index) => (
                <span key={`${index}-${line}`} className={`block whitespace-pre rounded px-2 py-1 ${step?.lineId === bfsSource.lineIds[index + 1] ? 'bg-blue-500/40 text-white' : ''}`}>{line || ' '}</span>
              ))}</code>
            </pre>
          </div>
        )}
        {lessonId === 'graph-dfs' && step && <p className="mt-2 rounded-xl bg-blue-50 p-3 text-sm leading-5 text-blue-900">{step.explanation}</p>}
        {lessonId === 'graph-dfs' && (
          <div className="mt-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <h4 className="font-semibold text-slate-800">DFS source code</h4>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                Language
                <select value={language} onChange={(event) => setLanguage(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5">
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>
              </label>
            </div>
            <pre className="overflow-x-auto rounded-xl bg-slate-900 p-3 text-xs text-slate-100">
              <code>{dfsSourceLines.map((line, index) => (
                <span key={`${index}-${line}`} className={`block whitespace-pre rounded px-2 py-1 ${step?.lineId === dfsSource.lineIds[index + 1] ? 'bg-blue-500/40 text-white' : ''}`}>{line || ' '}</span>
              ))}</code>
            </pre>
          </div>
        )}
        {lessonId === 'graph-cycle-detection' && (
          <div className="mt-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <h4 className="font-semibold text-slate-800">Cycle detection source code</h4>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                Language
                <select value={language} onChange={(event) => setLanguage(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5">
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>
              </label>
            </div>
            <pre className="overflow-x-auto rounded-xl bg-slate-900 p-3 text-xs text-slate-100">
              <code>{cycleSourceLines.map((line, index) => (
                <span key={`${index}-${line}`} className={`block whitespace-pre rounded px-2 py-1 ${step?.lineId === cycleSource.lineIds[index + 1] ? 'bg-blue-500/40 text-white' : ''}`}>{line || ' '}</span>
              ))}</code>
            </pre>
          </div>
        )}
        {lessonId === 'dijkstra' && (
          <div className="mt-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <h4 className="font-semibold text-slate-800">Dijkstra source code</h4>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                Language
                <select value={language} onChange={(event) => setLanguage(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5">
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>
              </label>
            </div>
            <pre className="overflow-x-auto rounded-xl bg-slate-900 p-3 text-xs text-slate-100">
              <code>{dijkstraSourceLines.map((line, index) => (
                <span key={`${index}-${line}`} className={`block whitespace-pre rounded px-2 py-1 ${step?.lineId === dijkstraSource.lineIds[index + 1] ? 'bg-blue-500/40 text-white' : ''}`}>{line || ' '}</span>
              ))}</code>
            </pre>
          </div>
        )}
      </section>
      {(lessonId === 'graph-bfs' || lessonId === 'graph-dfs' || lessonId === 'graph-cycle-detection' || lessonId === 'dijkstra') && (
        <section className="card p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <button type="button" disabled={!trace.length || isPlaying} onClick={() => { if (currentStep >= trace.length - 1) setCurrentStep(0); setIsPlaying(true); }} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white enabled:hover:bg-blue-500 disabled:opacity-50">Play</button>
            <button type="button" disabled={!isPlaying} onClick={() => setIsPlaying(false)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50">Pause</button>
            <button type="button" disabled={!trace.length || currentStep >= trace.length - 1} onClick={nextStep} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50">Next</button>
            <button type="button" disabled={!trace.length || currentStep <= 0} onClick={prevStep} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50">Previous</button>
            <button type="button" disabled={!trace.length} onClick={() => { setIsPlaying(false); setCurrentStep(0); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50">Reset</button>
            <label className="ml-auto flex items-center gap-2 text-sm text-slate-600">
              Speed
              <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm">
                <option value={0.5}>0.5x</option><option value={1}>1x</option><option value={1.5}>1.5x</option><option value={2}>2x</option>
              </select>
            </label>
          </div>
          <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
            <div className="font-semibold">{trace.length ? `Step ${currentStep + 1} / ${trace.length}` : lessonId === 'graph-dfs' ? 'Enter a graph and starting node, then run DFS.' : lessonId === 'graph-cycle-detection' ? 'Enter a graph and select its type, then check for cycles.' : lessonId === 'dijkstra' ? 'Enter a weighted graph and source, then run Dijkstra.' : 'Enter a graph and starting node, then run BFS.'}</div>
            <p className="mt-1">{step?.explanation ?? (lessonId === 'graph-dfs' ? 'Each step updates the graph, DFS stack, visited set, traversal order, and highlighted code line.' : lessonId === 'graph-cycle-detection' ? 'Each step updates the current component, DFS recursion stack, visited set, and highlighted source line.' : lessonId === 'dijkstra' ? 'Each step updates tentative distances, minimum selection, finalized nodes, and the shortest-path tree.' : 'Each step updates the graph, queue, discovered set, traversal order, and highlighted code line.')}</p>
          </div>
        </section>
      )}
    </div>
  );
}
