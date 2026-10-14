export const graphStudioLessonIds = [
  'graph-introduction',
  'graph-directions',
  'graph-weights',
  'graph-representations',
  'graph-bfs',
  'graph-dfs',
  'graph-cycle-detection',
  'dijkstra',
  'bellman-ford',
  'topological-sort',
  'prim',
  'kruskal',
  'disjoint-set-union',
];

function normalizeGraph(input) {
  const source = Array.isArray(input) ? input : String(input ?? '').trim();
  const graph = {};
  if (!source) return graph;

  if (Array.isArray(source)) {
    source.forEach((node) => { graph[node] = []; });
    return graph;
  }

  source.split(';').forEach((entry) => {
    const cleaned = entry.trim();
    if (!cleaned) return;
    const [fromRaw, destinationsRaw = ''] = cleaned.split(':');
    const from = fromRaw.trim();
    const destinationList = destinationsRaw
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    if (!graph[from]) graph[from] = [];
    destinationList.forEach((destination) => {
      if (!graph[destination]) graph[destination] = [];
      if (!graph[from].includes(destination)) graph[from].push(destination);
      if (!graph[destination].includes(from)) graph[destination].push(from);
    });
  });

  return graph;
}

function createTraversalTrace(input, mode = 'bfs') {
  const graph = normalizeGraph(input);
  const visited = [];
  const queue = [];
  const steps = [];
  const nodes = Object.keys(graph);

  const record = (operation, currentNode, queueState, extra = {}) => {
    steps.push({
      step: steps.length + 1,
      operation,
      currentNode,
      visited: [...visited],
      queue: [...queueState],
      nodes,
      result: [...visited],
      ...extra,
    });
  };

  const startNode = nodes[0];
  if (!startNode) {
    record('No graph nodes were provided.', null, [], { complete: true, result: [] });
    return steps;
  }

  const seen = new Set();
  queue.push(startNode);
  seen.add(startNode);
  record(`Start ${mode.toUpperCase()} from ${startNode}`, startNode, queue, { currentNode: startNode });

  while (queue.length > 0) {
    const current = mode === 'bfs' ? queue.shift() : queue.pop();
    if (visited.includes(current)) {
      continue;
    }
    visited.push(current);
    record(`Visit ${current}`, current, queue, { currentNode: current, visited: [...visited] });

    const neighbors = graph[current] ?? [];
    neighbors.forEach((neighbor) => {
      if (!seen.has(neighbor)) {
        seen.add(neighbor);
        queue.push(neighbor);
        record(`Queue ${neighbor} after ${current}`, neighbor, queue, { currentNode: neighbor });
      }
    });
  }

  record(`${mode.toUpperCase()} traversal complete.`, null, [], { complete: true, result: [...visited] });
  return steps;
}

export function createGraphTraversalSteps(input, mode = 'bfs') {
  return createTraversalTrace(input, mode);
}

export function createGraphCycleDetectionSteps(input) {
  const graph = normalizeGraph(input);
  const steps = [];
  const visited = new Set();
  const active = new Set();
  const record = (operation, node, extra = {}) => steps.push({ step: steps.length + 1, operation, node, visited: [...visited], active: [...active], ...extra });

  const dfs = (node, parent = null) => {
    visited.add(node);
    active.add(node);
    record(`Explore ${node} while traversing the graph`, node);
    for (const neighbor of graph[node] ?? []) {
      if (neighbor === parent) continue;
      if (active.has(neighbor)) {
        record(`Back edge found: ${node} -> ${neighbor} creates a cycle`, neighbor, { cycle: true, edge: [node, neighbor] });
        return true;
      }
      if (!visited.has(neighbor)) {
        record(`Follow edge ${node} -> ${neighbor}`, neighbor);
        if (dfs(neighbor, node)) return true;
      }
    }
    active.delete(node);
    return false;
  };

  const start = Object.keys(graph)[0];
  if (!start) {
    record('The graph is empty; no cycle is present.', null, { complete: true, result: false });
    return steps;
  }

  const foundCycle = dfs(start);
  record(foundCycle ? 'Cycle detected' : 'No cycle found', null, { complete: true, result: foundCycle });
  return steps;
}

export function createDijkstraSteps(input, start = 'A') {
  const graph = normalizeGraph(input);
  const steps = [];
  const distances = {};
  const nodes = Object.keys(graph);
  nodes.forEach((node) => { distances[node] = Number.POSITIVE_INFINITY; });
  distances[start] = 0;
  const visited = new Set();
  const queue = new Set(nodes);

  const record = (operation, node, extra = {}) => {
    steps.push({ step: steps.length + 1, operation, node, distances: { ...distances }, visited: [...visited], queue: [...queue], ...extra });
  };

  record(`Initialize distances from ${start}`, start, { complete: false });
  while (queue.size > 0) {
    const current = [...queue].sort((a, b) => distances[a] - distances[b])[0];
    queue.delete(current);
    visited.add(current);
    record(`Pick ${current} as the next closest node`, current, { current });
    const neighbors = graph[current] ?? [];
    neighbors.forEach((neighbor) => {
      if (!graph[current] || !graph[current].length) return;
      const tentative = distances[current] + 1;
      if (tentative < distances[neighbor]) {
        distances[neighbor] = tentative;
        record(`Relax ${neighbor} to distance ${tentative}`, neighbor, { neighbor, tentative });
      }
    });
  }

  record('Dijkstra execution complete.', null, { complete: true, result: distances });
  return steps;
}

export function createBellmanFordSteps(input, start = 'A') {
  const graph = normalizeGraph(input);
  const steps = [];
  const distance = {};
  Object.keys(graph).forEach((node) => { distance[node] = node === start ? 0 : Number.POSITIVE_INFINITY; });
  const record = (message, node = null, extra = {}) => steps.push({ step: steps.length + 1, operation: message, node, distance: { ...distance }, ...extra });
  record(`Initialize shortest paths from ${start}.`);
  const nodes = Object.keys(graph);
  for (let pass = 0; pass < nodes.length - 1; pass += 1) {
    nodes.forEach((node) => {
      if (!graph[node]) return;
      graph[node].forEach((neighbor) => {
        const possible = distance[node] + 1;
        if (distance[node] !== Number.POSITIVE_INFINITY && possible < distance[neighbor]) {
          distance[neighbor] = possible;
          record(`Relax ${neighbor} to ${possible}`, neighbor, { pass });
        }
      });
    });
  }
  record('Bellman-Ford relaxations complete.', null, { complete: true, result: distance });
  return steps;
}

export function createTopologicalSortSteps(input) {
  const graph = normalizeGraph(input);
  const steps = [];
  const inDegree = {};
  const queue = [];
  const order = [];
  const nodes = Object.keys(graph);
  nodes.forEach((node) => { inDegree[node] = 0; });
  nodes.forEach((node) => {
    (graph[node] ?? []).forEach((neighbor) => {
      inDegree[neighbor] = (inDegree[neighbor] ?? 0) + 1;
    });
  });
  const record = (message, extra = {}) => steps.push({ step: steps.length + 1, operation: message, order: [...order], queue: [...queue], ...extra });
  nodes.forEach((node) => { if (!inDegree[node] || inDegree[node] === 0) queue.push(node); });
  record('Initialize the zero-indegree queue.');
  while (queue.length) {
    const current = queue.shift();
    order.push(current);
    record(`Process ${current} and remove it from the queue.`, { current });
    (graph[current] ?? []).forEach((neighbor) => {
      inDegree[neighbor] -= 1;
      record(`Decrease indegree of ${neighbor} to ${inDegree[neighbor]}.`, { neighbor });
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
        record(`Queue ${neighbor} for the next processing step.`, { neighbor });
      }
    });
  }
  record('Topological sorting complete.', { complete: true, result: order });
  return steps;
}

export function createPrimSteps(input) {
  const graph = normalizeGraph(input);
  const steps = [];
  const nodes = Object.keys(graph);
  const visited = new Set([nodes[0] ?? null].filter(Boolean));
  const edges = [];
  const record = (message, extra = {}) => steps.push({ step: steps.length + 1, operation: message, visited: [...visited], edges: [...edges], ...extra });
  record('Start Prim traversal from the first node in the graph.');
  while (visited.size < nodes.length) {
    const next = nodes.find((node) => !visited.has(node) && (graph[node] ?? []).some((neighbor) => visited.has(neighbor)));
    if (!next) break;
    visited.add(next);
    edges.push(next);
    record(`Add ${next} to the spanning tree.`, { node: next });
  }
  record('Prim spanning tree complete.', { complete: true, result: [...visited] });
  return steps;
}

export function createKruskalSteps(input) {
  const graph = normalizeGraph(input);
  const steps = [];
  const record = (message, extra = {}) => steps.push({ step: steps.length + 1, operation: message, ...extra });
  record('Sort all edges by weight and choose the smallest safe edge next.');
  Object.keys(graph).forEach((node) => {
    const neighbors = graph[node];
    if (neighbors.length) record(`Node ${node} connects to ${neighbors.join(', ')}`);
  });
  record('Kruskal execution complete.', { complete: true, result: Object.keys(graph) });
  return steps;
}

export function createDisjointSetUnionSteps(input) {
  const graph = normalizeGraph(input);
  const steps = [];
  const record = (message, extra = {}) => steps.push({ step: steps.length + 1, operation: message, ...extra });
  const nodes = Object.keys(graph);
  const parent = Object.fromEntries(nodes.map((node) => [node, node]));
  record('Create a parent pointer for every node.');
  for (const node of nodes) {
    record(`Make ${node} its own root set initially.`, { parent: { ...parent } });
  }
  record('Union-find operations complete.', { complete: true, result: parent });
  return steps;
}

export function parseGraphInput(input) {
  return normalizeGraph(input);
}
