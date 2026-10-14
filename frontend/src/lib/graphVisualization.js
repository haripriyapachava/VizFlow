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

function compareNodeLabels(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function parseBfsGraphInput(input) {
  if (typeof input !== 'string' || !input.trim()) {
    throw new Error('Enter graph entries in the form A: B, C; B: A; C: .');
  }

  const adjacency = new Map();
  const declaredNodes = new Set();
  const entries = input.split(';');
  entries.forEach((entry, index) => {
    const cleaned = entry.trim();
    if (!cleaned && index === entries.length - 1) return;
    if (!cleaned) {
      throw new Error('Separate graph entries with one semicolon and give each node a neighbor list, such as A: B, C.');
    }
    const separator = cleaned.indexOf(':');
    if (separator < 1 || separator !== cleaned.lastIndexOf(':')) {
      throw new Error(`Graph entry "${cleaned}" must contain one colon, such as A: B, C.`);
    }

    const node = cleaned.slice(0, separator).trim();
    const neighborText = cleaned.slice(separator + 1).trim();
    if (!node || /[;,]/.test(node)) {
      throw new Error('Node labels must be non-empty and cannot contain commas, semicolons, or colons.');
    }
    if (declaredNodes.has(node)) {
      throw new Error(`Node "${node}" is declared more than once.`);
    }
    declaredNodes.add(node);
    if (!adjacency.has(node)) adjacency.set(node, new Set());

    if (!neighborText) return;
    const neighbors = neighborText.split(',').map((neighbor) => neighbor.trim());
    if (neighbors.some((neighbor) => !neighbor || /[;:]/.test(neighbor))) {
      throw new Error(`The neighbor list for "${node}" contains an invalid node label.`);
    }
    neighbors.forEach((neighbor) => {
      if (!adjacency.has(neighbor)) adjacency.set(neighbor, new Set());
      adjacency.get(node).add(neighbor);
      adjacency.get(neighbor).add(node);
    });
  });

  const nodes = [...adjacency.keys()];
  const edges = [];
  const edgeKeys = new Set();
  for (const node of nodes) {
    for (const neighbor of adjacency.get(node)) {
      const [from, to] = compareNodeLabels(node, neighbor) <= 0 ? [node, neighbor] : [neighbor, node];
      const key = `${from}\u0000${to}`;
      if (!edgeKeys.has(key)) {
        edgeKeys.add(key);
        edges.push([from, to]);
      }
    }
    adjacency.set(node, [...adjacency.get(node)].sort(compareNodeLabels));
  }

  return { nodes, adjacency, edges };
}

export function createBfsSteps(input, startNode) {
  const graph = parseBfsGraphInput(input);
  const start = typeof startNode === 'string' ? startNode.trim() : '';
  if (!start) throw new Error('Enter a starting node for BFS.');
  if (!graph.adjacency.has(start)) throw new Error(`Starting node "${start}" is not in the graph.`);

  const steps = [];
  const queue = [start];
  const discovered = new Set([start]);
  const traversalOrder = [];
  const record = (operation, explanation, currentNode = null, lineId = 'initialize', edge = null) => {
    steps.push({
      step: steps.length + 1,
      operation,
      explanation,
      currentNode,
      edge,
      queue: [...queue],
      visited: [...discovered],
      traversalOrder: [...traversalOrder],
      disconnected: graph.nodes.filter((node) => !discovered.has(node)),
      lineId,
      nodes: [...graph.nodes],
      edges: graph.edges.map((item) => [...item]),
    });
  };

  record(`Start BFS at ${start}.`, `Put ${start} in the queue first. We mark a node as discovered when it enters the queue so it cannot be added twice.`, start, 'enqueue');
  while (queue.length > 0) {
    const current = queue.shift();
    record(`Remove ${current} from the front of the queue.`, `Take ${current} from the front of the queue. It is the next node to visit.`, current, 'dequeue');
    traversalOrder.push(current);
    record(`Visit ${current}.`, `Add ${current} to the traversal order.`, current, 'visit');

    for (const neighbor of graph.adjacency.get(current)) {
      record(`Explore edge ${current} → ${neighbor}.`, `Check the connection from ${current} to ${neighbor}. Neighbors are checked in alphabetical order for predictable results.`, current, 'explore-edge', [current, neighbor]);
      if (discovered.has(neighbor)) {
        record(`${neighbor} is already discovered.`, `Do not add ${neighbor} again; it is already in the queue or has been visited.`, current, 'check-visited', [current, neighbor]);
      } else {
        discovered.add(neighbor);
        queue.push(neighbor);
        record(`Enqueue ${neighbor}.`, `Mark ${neighbor} as discovered and add it to the back of the queue.`, current, 'enqueue-neighbor', [current, neighbor]);
      }
    }
  }

  const disconnected = graph.nodes.filter((node) => !discovered.has(node));
  record(
    disconnected.length
      ? `BFS complete. The reachable traversal order is ${traversalOrder.join(', ')}.`
      : `BFS complete. The traversal order is ${traversalOrder.join(', ')}.`,
    disconnected.length
      ? `The queue is empty. Nodes ${disconnected.join(', ')} are disconnected from ${start}, so this BFS did not visit them.`
      : 'The queue is empty and every node reachable from the start has been visited.',
    null,
    'complete',
  );
  return steps;
}

export function createDfsSteps(input, startNode) {
  const graph = parseBfsGraphInput(input);
  const start = typeof startNode === 'string' ? startNode.trim() : '';
  if (!start) throw new Error('Enter a starting node for DFS.');
  if (!graph.adjacency.has(start)) throw new Error(`Starting node "${start}" is not in the graph.`);

  const steps = [];
  const visited = new Set([start]);
  const traversalOrder = [start];
  const stack = [{ node: start, neighbors: graph.adjacency.get(start), nextIndex: 0 }];
  const record = (operation, explanation, lineId, currentNode = null, edge = null) => {
    steps.push({
      step: steps.length + 1,
      operation,
      explanation,
      currentNode,
      edge,
      stack: stack.map((frame) => frame.node),
      visited: [...visited],
      traversalOrder: [...traversalOrder],
      disconnected: graph.nodes.filter((node) => !visited.has(node)),
      lineId,
      nodes: [...graph.nodes],
      edges: graph.edges.map((item) => [...item]),
    });
  };

  record(`Start DFS at ${start}.`, `Mark ${start} visited and push it onto the stack. DFS always explores the alphabetically first unvisited neighbor.`, 'initialize', start);
  while (stack.length > 0) {
    const frame = stack[stack.length - 1];
    const neighbor = frame.neighbors[frame.nextIndex];
    if (neighbor === undefined) {
      stack.pop();
      record(
        `Backtrack from ${frame.node}.`,
        `There are no unvisited neighbors left from ${frame.node}. Pop it from the stack and return to the previous node.`,
        'backtrack',
        stack.at(-1)?.node ?? null,
      );
      continue;
    }

    frame.nextIndex += 1;
    record(`Explore edge ${frame.node} → ${neighbor}.`, `Check the edge from ${frame.node} to ${neighbor}. Neighbors are checked in alphabetical order for predictable results.`, 'explore-edge', frame.node, [frame.node, neighbor]);
    if (visited.has(neighbor)) {
      record(`Skip ${neighbor}; it is already visited.`, `This neighbor was visited earlier, so skipping it prevents revisiting nodes and safely handles cycles.`, 'check-visited', frame.node, [frame.node, neighbor]);
      continue;
    }

    visited.add(neighbor);
    traversalOrder.push(neighbor);
    stack.push({ node: neighbor, neighbors: graph.adjacency.get(neighbor), nextIndex: 0 });
    record(`Visit ${neighbor} and push it onto the stack.`, `Mark ${neighbor} visited, add it to the traversal order, and continue deeper from it before returning to ${frame.node}.`, 'visit-and-push', neighbor, [frame.node, neighbor]);
  }

  const disconnected = graph.nodes.filter((node) => !visited.has(node));
  record(
    disconnected.length
      ? `DFS complete. The reachable traversal order is ${traversalOrder.join(', ')}.`
      : `DFS complete. The traversal order is ${traversalOrder.join(', ')}.`,
    disconnected.length
      ? `The stack is empty. Nodes ${disconnected.join(', ')} are disconnected from ${start}, so this DFS did not visit them.`
      : 'The stack is empty and every node reachable from the start has been visited.',
    'complete',
  );
  return steps;
}

const bfsCode = {
  python: {
    code: [
      'from collections import deque',
      '',
      'def bfs(graph, start):',
      '    queue = deque([start])',
      '    visited = {start}',
      '    order = []',
      '    while queue:',
      '        node = queue.popleft()',
      '        order.append(node)',
      '        for neighbor in sorted(graph[node]):',
      '            if neighbor not in visited:',
      '                visited.add(neighbor)',
      '                queue.append(neighbor)',
      '    return order',
    ].join('\n'),
    lineIds: [null, 'import', null, 'initialize', 'enqueue', 'mark-visited', 'initialize-order', 'while', 'dequeue', 'visit', 'explore-edge', 'check-visited', 'mark-visited', 'enqueue-neighbor', 'complete'],
  },
  java: {
    code: [
      'List<String> bfs(Map<String, List<String>> graph, String start) {',
      '    Queue<String> queue = new ArrayDeque<>();',
      '    Set<String> visited = new HashSet<>();',
      '    List<String> order = new ArrayList<>();',
      '    queue.add(start);',
      '    visited.add(start);',
      '    while (!queue.isEmpty()) {',
      '        String node = queue.remove();',
      '        order.add(node);',
      '        for (String neighbor : sorted(graph.get(node))) {',
      '            if (!visited.contains(neighbor)) {',
      '                visited.add(neighbor);',
      '                queue.add(neighbor);',
      '            }',
      '        }',
      '    }',
      '    return order;',
      '}',
    ].join('\n'),
    lineIds: [null, 'initialize', 'initialize', 'initialize', 'initialize-order', 'enqueue', 'mark-visited', 'while', 'dequeue', 'visit', 'explore-edge', 'check-visited', 'mark-visited', 'enqueue-neighbor', null, null, 'complete', null, null],
  },
};

export function getBfsCode(language = 'python') {
  return bfsCode[language] ?? bfsCode.python;
}

const dfsCode = {
  python: {
    code: [
      'def dfs(graph, start):',
      '    visited = {start}',
      '    order = [start]',
      '    stack = [(start, iter(sorted(graph[start])))]',
      '    while stack:',
      '        node, neighbors = stack[-1]',
      '        neighbor = next(neighbors, None)',
      '        if neighbor is None:',
      '            stack.pop()',
      '            continue',
      '        if neighbor not in visited:',
      '            visited.add(neighbor)',
      '            order.append(neighbor)',
      '            stack.append((neighbor, iter(sorted(graph[neighbor]))))',
      '    return order',
    ].join('\n'),
    lineIds: [null, 'initialize', 'mark-visited', 'visit', 'initialize-stack', 'while', 'current-frame', 'explore-edge', 'check-exhausted', 'backtrack', 'continue', 'check-visited', 'mark-visited', 'visit', 'visit-and-push', 'complete'],
  },
  java: {
    code: [
      'List<String> dfs(Map<String, List<String>> graph, String start) {',
      '    Set<String> visited = new HashSet<>();',
      '    List<String> order = new ArrayList<>();',
      '    Deque<Iterator<String>> stack = new ArrayDeque<>();',
      '    visited.add(start);',
      '    order.add(start);',
      '    stack.push(sorted(graph.get(start)).iterator());',
      '    while (!stack.isEmpty()) {',
      '        Iterator<String> neighbors = stack.peek();',
      '        if (!neighbors.hasNext()) {',
      '            stack.pop();',
      '            continue;',
      '        }',
      '        String neighbor = neighbors.next();',
      '        if (!visited.contains(neighbor)) {',
      '            visited.add(neighbor);',
      '            order.add(neighbor);',
      '            stack.push(sorted(graph.get(neighbor)).iterator());',
      '        }',
      '    }',
      '    return order;',
      '}',
    ].join('\n'),
    lineIds: [null, null, 'initialize', 'initialize-order', 'initialize-stack', 'mark-visited', 'visit', 'initialize-stack', 'while', 'current-frame', 'check-exhausted', 'backtrack', 'continue', null, 'explore-edge', 'check-visited', 'mark-visited', 'visit', 'visit-and-push', null, 'complete', null, null],
  },
};

export function getDfsCode(language = 'python') {
  return dfsCode[language] ?? dfsCode.python;
}

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

export function parseCycleGraphInput(input, directed = false) {
  if (typeof input !== 'string' || !input.trim()) return { nodes: [], adjacency: new Map(), edges: [] };
  const adjacency = new Map();
  const declaredNodes = new Set();
  const entries = input.split(';');
  entries.forEach((entry, index) => {
    const cleaned = entry.trim();
    if (!cleaned && index === entries.length - 1) return;
    if (!cleaned) throw new Error('Separate graph entries with one semicolon, such as A: B, C; B: A.');
    const separator = cleaned.indexOf(':');
    if (separator < 1 || separator !== cleaned.lastIndexOf(':')) {
      throw new Error(`Graph entry "${cleaned}" must contain one colon, such as A: B, C.`);
    }
    const node = cleaned.slice(0, separator).trim();
    const neighborText = cleaned.slice(separator + 1).trim();
    if (!node || /[;,]/.test(node)) throw new Error('Node labels must be non-empty and cannot contain commas, semicolons, or colons.');
    if (declaredNodes.has(node)) throw new Error(`Node "${node}" is declared more than once.`);
    declaredNodes.add(node);
    if (!adjacency.has(node)) adjacency.set(node, new Set());
    if (!neighborText) return;
    const neighbors = neighborText.split(',').map((neighbor) => neighbor.trim());
    if (neighbors.some((neighbor) => !neighbor || /[;:]/.test(neighbor))) {
      throw new Error(`The neighbor list for "${node}" contains an invalid node label.`);
    }
    for (const neighbor of neighbors) {
      if (!adjacency.has(neighbor)) adjacency.set(neighbor, new Set());
      adjacency.get(node).add(neighbor);
      if (!directed) adjacency.get(neighbor).add(node);
    }
  });

  const nodes = [...adjacency.keys()];
  nodes.forEach((node) => adjacency.set(node, [...adjacency.get(node)].sort(compareNodeLabels)));
  const edges = [];
  const seenEdges = new Set();
  for (const node of nodes) {
    for (const neighbor of adjacency.get(node)) {
      const [from, to] = directed || compareNodeLabels(node, neighbor) < 0 ? [node, neighbor] : [neighbor, node];
      const key = `${from}\u0000${to}`;
      if (!seenEdges.has(key)) {
        seenEdges.add(key);
        edges.push([from, to]);
      }
    }
  }
  return { nodes, adjacency, edges };
}

export function parseWeightedGraphInput(input, directed = false) {
  if (typeof input !== 'string' || !input.trim()) {
    throw new Error('Enter weighted graph entries such as A: B(4), C(2); B: A(4); C:.');
  }
  const adjacency = new Map();
  const declaredNodes = new Set();
  const entries = input.split(';');
  const pendingEdges = [];

  entries.forEach((entry, index) => {
    const cleaned = entry.trim();
    if (!cleaned && index === entries.length - 1) return;
    if (!cleaned) throw new Error('Separate weighted graph entries with semicolons, such as A: B(4); B: A(4).');
    const separator = cleaned.indexOf(':');
    if (separator < 1 || separator !== cleaned.lastIndexOf(':')) {
      throw new Error(`Graph entry "${cleaned}" must contain one colon, such as A: B(4), C(2).`);
    }
    const node = cleaned.slice(0, separator).trim();
    const neighborText = cleaned.slice(separator + 1).trim();
    if (!node || /[;,():]/.test(node)) throw new Error('Node labels cannot be empty or contain commas, semicolons, colons, or parentheses.');
    if (declaredNodes.has(node)) throw new Error(`Node "${node}" is declared more than once.`);
    declaredNodes.add(node);
    if (!adjacency.has(node)) adjacency.set(node, new Map());
    if (!neighborText) return;

    const neighbors = neighborText.split(',');
    for (const rawNeighbor of neighbors) {
      const match = rawNeighbor.trim().match(/^([^(),;:]+?)\s*\(\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)\s*\)$/i);
      if (!match) {
        throw new Error(`Invalid weighted edge "${rawNeighbor.trim()}". Use the format Neighbor(weight), for example B(3) or C(0).`);
      }
      const neighbor = match[1].trim();
      const weight = Number(match[2]);
      if (!neighbor || !Number.isFinite(weight)) {
        throw new Error(`Edge weight in "${rawNeighbor.trim()}" must be a finite number.`);
      }
      if (weight < 0) throw new Error(`Negative edge weight ${weight} on ${node} → ${neighbor} is not allowed by Dijkstra's algorithm.`);
      if (!adjacency.has(neighbor)) adjacency.set(neighbor, new Map());
      pendingEdges.push([node, neighbor, weight]);
    }
  });

  const setWeight = (from, to, weight) => {
    const existing = adjacency.get(from).get(to);
    if (existing !== undefined && existing !== weight) {
      throw new Error(`Conflicting weights were provided for edge ${from} → ${to}.`);
    }
    adjacency.get(from).set(to, weight);
  };
  for (const [from, to, weight] of pendingEdges) {
    setWeight(from, to, weight);
    if (!directed) setWeight(to, from, weight);
  }

  const nodes = [...adjacency.keys()];
  nodes.forEach((node) => {
    adjacency.set(node, new Map([...adjacency.get(node).entries()].sort(([left], [right]) => compareNodeLabels(left, right))));
  });
  const edges = [];
  const seenEdges = new Set();
  for (const node of nodes) {
    for (const [neighbor, weight] of adjacency.get(node)) {
      const [from, to] = directed || compareNodeLabels(node, neighbor) <= 0 ? [node, neighbor] : [neighbor, node];
      const key = `${from}\u0000${to}`;
      if (seenEdges.has(key)) continue;
      seenEdges.add(key);
      edges.push([from, to, weight]);
    }
  }
  return { nodes, adjacency, edges };
}

const dijkstraCode = {
  python: {
    code: [
      'def dijkstra(graph, source):',
      '    distances = {node: inf for node in graph}',
      '    distances[source] = 0',
      '    previous = {}',
      '    visited = set()',
      '    while True:',
      '        candidates = [(distances[n], n) for n in graph if n not in visited and distances[n] < inf]',
      '        if not candidates:',
      '            break',
      '        distance, node = min(candidates)',
      '        visited.add(node)',
      '        for neighbor, weight in sorted(graph[node].items()):',
      '            if neighbor in visited:',
      '                continue',
      '            candidate = distances[node] + weight',
      '            if candidate < distances[neighbor]:',
      '                distances[neighbor] = candidate',
      '                previous[neighbor] = node',
      '    return distances, previous',
    ].join('\n'),
    lineIds: [null, 'initialize', 'initialize-distances', 'initialize-source', 'initialize-previous', 'initialize-visited', 'select-loop', 'build-queue', 'check-unreachable', 'break-unreachable', 'select-minimum', 'finalize', 'explore-edge', 'skip-finalized', null, 'calculate', 'relax-check', 'update-distance', 'update-previous', 'complete'],
  },
  java: {
    code: [
      'Result dijkstra(Graph graph, Node source) {',
      '    Map<Node, Double> distance = new HashMap<>();',
      '    Map<Node, Node> previous = new HashMap<>();',
      '    Set<Node> visited = new HashSet<>();',
      '    for (Node node : graph.nodes()) distance.put(node, Double.POSITIVE_INFINITY);',
      '    distance.put(source, 0.0);',
      '    while (true) {',
      '        Node node = unvisitedNodeWithSmallestDistance(distance, visited);',
      '        if (node == null || distance.get(node) == Double.POSITIVE_INFINITY) break;',
      '        visited.add(node);',
      '        for (Edge edge : sorted(node.outgoingEdges())) {',
      '            Node neighbor = edge.destination();',
      '            if (visited.contains(neighbor)) continue;',
      '            double candidate = distance.get(node) + edge.weight();',
      '            if (candidate < distance.get(neighbor)) {',
      '                distance.put(neighbor, candidate);',
      '                previous.put(neighbor, node);',
      '            }',
      '        }',
      '    }',
      '    return new Result(distance, previous);',
      '}',
    ].join('\n'),
    lineIds: [null, 'initialize', 'initialize-map', 'initialize-previous', 'initialize-visited', 'initialize-distances', 'initialize-source', 'select-loop', 'select-minimum', 'check-unreachable', 'finalize', 'explore-edge', null, 'skip-finalized', 'calculate', 'relax-check', 'update-distance', 'update-previous', null, null, null, 'complete', null],
  },
};

export function getDijkstraCode(language = 'python') {
  return dijkstraCode[language] ?? dijkstraCode.python;
}

export function reconstructDijkstraPath(previous, start, destination) {
  if (typeof start !== 'string' || typeof destination !== 'string' || !start || !destination) return [];
  const path = [];
  const seen = new Set();
  let current = destination;
  while (current !== undefined && current !== null && !seen.has(current)) {
    path.push(current);
    if (current === start) return path.reverse();
    seen.add(current);
    current = previous?.[current];
  }
  return [];
}

const cycleCode = {
  undirected: {
    python: {
      code: [
        'def has_cycle(graph):',
        '    visited = set()',
        '    def dfs(node, parent):',
        '        visited.add(node)',
        '        for neighbor in sorted(graph[node]):',
        '            if neighbor == parent:',
        '                continue',
        '            if neighbor in visited:',
        '                return True',
        '            if dfs(neighbor, node):',
        '                return True',
        '        return False',
        '    for node in sorted(graph):',
        '        if node not in visited and dfs(node, None):',
        '            return True',
        '    return False',
      ].join('\n'),
      lineIds: [null, 'initialize', 'initialize', null, 'visit-node', 'explore-edge', 'check-parent', 'skip-parent', 'check-visited', 'cycle-detected', 'recurse', 'cycle-propagate', 'backtrack', 'check-component', 'start-component', 'cycle-result', 'no-cycle'],
    },
    java: {
      code: [
        'boolean hasCycle(Graph graph) {',
        '    Set<Node> visited = new HashSet<>();',
        '    for (Node node : sorted(graph.nodes())) {',
        '        if (!visited.contains(node) && dfs(node, null, visited)) return true;',
        '    }',
        '    return false;',
        '}',
        'boolean dfs(Node node, Node parent, Set<Node> visited) {',
        '    visited.add(node);',
        '    for (Node neighbor : sorted(node.neighbors())) {',
        '        if (neighbor == parent) continue;',
        '        if (visited.contains(neighbor)) return true;',
        '        if (dfs(neighbor, node, visited)) return true;',
        '    }',
        '    return false;',
        '}',
      ].join('\n'),
      lineIds: [null, null, 'initialize', 'check-component', 'start-component', null, 'no-cycle', null, null, 'visit-node', 'explore-edge', 'skip-parent', 'cycle-detected', 'recurse', null, 'backtrack', null],
    },
  },
  directed: {
    python: {
      code: [
        'def has_cycle(graph):',
        '    visited = set()',
        '    active = set()',
        '    def dfs(node):',
        '        visited.add(node)',
        '        active.add(node)',
        '        for neighbor in sorted(graph[node]):',
        '            if neighbor in active:',
        '                return True',
        '            if neighbor not in visited and dfs(neighbor):',
        '                return True',
        '        active.remove(node)',
        '        return False',
        '    for node in sorted(graph):',
        '        if node not in visited and dfs(node):',
        '            return True',
        '    return False',
      ].join('\n'),
      lineIds: [null, 'initialize', 'initialize', 'initialize-stack', null, 'visit-node', 'push-active', 'explore-edge', 'check-active', 'cycle-detected', 'recurse', 'cycle-propagate', 'backtrack', null, 'check-component', 'start-component', 'cycle-result', 'no-cycle'],
    },
    java: {
      code: [
        'boolean hasCycle(Graph graph) {',
        '    Set<Node> visited = new HashSet<>();',
        '    Set<Node> active = new HashSet<>();',
        '    for (Node node : sorted(graph.nodes())) {',
        '        if (!visited.contains(node) && dfs(node, visited, active)) return true;',
        '    }',
        '    return false;',
        '}',
        'boolean dfs(Node node, Set<Node> visited, Set<Node> active) {',
        '    visited.add(node);',
        '    active.add(node);',
        '    for (Node neighbor : sorted(node.neighbors())) {',
        '        if (active.contains(neighbor)) return true;',
        '        if (!visited.contains(neighbor) && dfs(neighbor, visited, active)) return true;',
        '    }',
        '    active.remove(node);',
        '    return false;',
        '}',
      ].join('\n'),
      lineIds: [null, 'initialize', 'initialize-stack', 'check-component', 'start-component', null, 'no-cycle', null, null, 'visit-node', 'push-active', 'explore-edge', 'check-active', 'cycle-detected', 'recurse', null, 'backtrack', null, null],
    },
  },
};

export function getGraphCycleDetectionCode(directed = false, language = 'python') {
  const variant = directed ? 'directed' : 'undirected';
  return cycleCode[variant][language] ?? cycleCode[variant].python;
}

export function createGraphCycleDetectionSteps(input, directed = false) {
  const graph = parseCycleGraphInput(input, directed);
  const steps = [];
  const visited = new Set();
  const active = new Set();
  const parent = new Map();
  const callStack = [];
  let cycleEdge = null;
  let foundCycle = false;

  const record = (operation, explanation, lineId, currentNode = null, edge = null, extra = {}) => {
    steps.push({
      step: steps.length + 1,
      operation,
      explanation,
      currentNode,
      edge,
      cycleEdge: cycleEdge ? [...cycleEdge] : null,
      visited: [...visited],
      active: [...active],
      stack: [...callStack],
      parent: Object.fromEntries(parent),
      cycle: foundCycle,
      result: foundCycle,
      disconnected: graph.nodes.filter((node) => !visited.has(node)),
      nodes: [...graph.nodes],
      edges: graph.edges.map((item) => [...item]),
      lineId,
      ...extra,
    });
  };

  if (graph.nodes.length === 0) {
    record('No Cycle Detected', 'The graph is empty, so there are no edges that can form a cycle.', 'no-cycle', null, null, { complete: true });
    return steps;
  }

  const visit = (node, previous = null) => {
    visited.add(node);
    active.add(node);
    callStack.push(node);
    if (!directed && previous !== null) parent.set(node, previous);
    record(`Visit ${node}.`, `Mark ${node} visited and add it to the ${directed ? 'recursion' : 'DFS'} stack.`, 'visit-node', node);

    for (const neighbor of graph.adjacency.get(node)) {
      const edge = [node, neighbor];
      record(`Explore edge ${node} → ${neighbor}.`, `Check the edge from ${node} to ${neighbor}. Neighbors are explored in alphabetical order.`, 'explore-edge', node, edge);

      if (!directed && neighbor === previous) {
        record(`Skip the parent edge ${node} — ${neighbor}.`, `This is the edge back to ${node}'s parent, so it is not a cycle in an undirected graph.`, 'skip-parent', node, edge);
        continue;
      }

      if (directed ? active.has(neighbor) : visited.has(neighbor)) {
        foundCycle = true;
        cycleEdge = edge;
        record(`Cycle Detected: edge ${node} → ${neighbor} closes a cycle.`, directed
          ? `${neighbor} is already in the current recursion stack. This back edge returns to an ancestor and confirms a directed cycle.`
          : `${neighbor} was already visited and is not ${node}'s parent. This edge connects two visited parts and confirms an undirected cycle.`,
        'cycle-detected', node, edge);
        return true;
      }

      if (!visited.has(neighbor)) {
        if (!directed) parent.set(neighbor, node);
        record(`Follow edge ${node} → ${neighbor}.`, `The neighbor ${neighbor} has not been visited, so DFS continues from it.`, 'recurse', node, edge);
        if (visit(neighbor, node)) return true;
      }
    }

    active.delete(node);
    callStack.pop();
    record(`Backtrack from ${node}.`, `All neighbors of ${node} have been checked. Remove it from the ${directed ? 'recursion' : 'DFS'} stack and return to its parent.`, 'backtrack', callStack.at(-1) ?? node);
    return false;
  };

  for (const node of [...graph.nodes].sort(compareNodeLabels)) {
    if (visited.has(node)) continue;
    record(`Start a new component at ${node}.`, `This node has not been visited from earlier components, so start a DFS here.`, 'start-component', node);
    if (visit(node)) break;
  }

  record(foundCycle ? 'Cycle Detected' : 'No Cycle Detected', foundCycle
    ? `DFS found a cycle${cycleEdge ? ` confirmed by edge ${cycleEdge[0]} → ${cycleEdge[1]}` : ''}.`
    : 'Every connected component was checked, and no cycle was found.',
  foundCycle ? 'cycle-result' : 'no-cycle', null, cycleEdge, { complete: true });
  return steps;
}

export function createDijkstraSteps(input, start = 'A', directed = false) {
  const graph = parseWeightedGraphInput(input, directed);
  if (!graph.nodes.length) throw new Error('Enter at least one node before running Dijkstra.');
  const source = typeof start === 'string' ? start.trim() : '';
  if (!source) throw new Error('Enter a starting node for Dijkstra.');
  if (!graph.adjacency.has(source)) throw new Error(`Starting node "${source}" is not in the graph.`);

  const steps = [];
  const distances = Object.fromEntries(graph.nodes.map((node) => [node, Number.POSITIVE_INFINITY]));
  const previous = new Map();
  const finalized = new Set();
  distances[source] = 0;

  const priorityQueue = () => graph.nodes
    .filter((node) => !finalized.has(node) && Number.isFinite(distances[node]))
    .map((node) => ({ node, distance: distances[node] }))
    .sort((left, right) => left.distance - right.distance || compareNodeLabels(left.node, right.node));
  const shortestPathEdges = () => [...previous.entries()].map(([node, parent]) => [parent, node]);
  const record = (operation, explanation, lineId, currentNode = null, edge = null, calculation = null, extra = {}) => {
    steps.push({
      step: steps.length + 1,
      operation,
      explanation,
      lineId,
      currentNode,
      edge,
      calculation,
      distances: { ...distances },
      previous: Object.fromEntries(previous),
      visited: [...finalized],
      finalized: [...finalized],
      priorityQueue: priorityQueue().map((entry) => ({ ...entry })),
      shortestPathEdges: shortestPathEdges(),
      nodes: [...graph.nodes],
      edges: graph.edges.map((item) => [...item]),
      ...extra,
    });
  };

  record(
    `Initialize distances from ${source}.`,
    `Set the source ${source} to distance 0. Every other node starts at Infinity because no route to it has been found yet.`,
    'initialize-distances',
    source,
  );
  record(`Set distance of ${source} to 0.`, `The distance from the source to itself is 0. The other nodes remain at Infinity.`, 'initialize-source', source);

  while (true) {
    const candidates = priorityQueue();
    if (!candidates.length) {
      const unreachable = graph.nodes.filter((node) => !finalized.has(node));
      if (unreachable.length) {
        record(
          `No reachable unvisited nodes remain: ${unreachable.join(', ')}.`,
          `The minimum-distance selection has no finite candidates. ${unreachable.join(', ')} cannot be reached from ${source}, so their distances stay Infinity.`,
          'unreachable',
          null,
          null,
          null,
          { unreachable },
        );
      }
      break;
    }

    const current = candidates[0].node;
    record(
      `Select ${current} with the smallest tentative distance ${distances[current]}.`,
      `Among unvisited nodes with a known route, ${current} has the smallest distance (${distances[current]}). Dijkstra can now finalize it.`,
      'select-minimum',
      current,
    );
    finalized.add(current);
    record(`${current} is finalized at distance ${distances[current]}.`, `No later route can improve ${current}: all remaining paths must pass through a node with at least this distance and non-negative edges.`,
      'finalize', current);

    for (const [neighbor, weight] of graph.adjacency.get(current)) {
      const candidateDistance = distances[current] + weight;
      const calculation = {
        from: current,
        to: neighbor,
        currentDistance: distances[current],
        weight,
        candidateDistance,
        knownDistance: distances[neighbor],
      };
      record(
        `Check edge ${current} → ${neighbor} with weight ${weight}.`,
        `Try going to ${neighbor} through ${current}: ${distances[current]} + ${weight} = ${candidateDistance}. Its current best distance is ${Number.isFinite(distances[neighbor]) ? distances[neighbor] : 'Infinity'}.`,
        'explore-edge',
        current,
        [current, neighbor],
        calculation,
      );
      if (finalized.has(neighbor)) {
        record(`${neighbor} is already finalized.`, `This node already has its shortest distance, so this edge cannot change it.`, 'skip-finalized', current, [current, neighbor], calculation);
        continue;
      }
      if (candidateDistance < distances[neighbor]) {
        distances[neighbor] = candidateDistance;
        previous.set(neighbor, current);
        record(
          `Update ${neighbor} to distance ${candidateDistance}.`,
          `${candidateDistance} is shorter than the previous distance. Store it as the new best distance and remember ${current} as the previous node on that route.`,
          'update-distance',
          current,
          [current, neighbor],
          { ...calculation, knownDistance: calculation.knownDistance, updatedDistance: candidateDistance },
        );
        record(`Set previous node of ${neighbor} to ${current}.`, `This predecessor link lets us reconstruct the shortest route to ${neighbor}.`, 'update-previous', current, [current, neighbor], calculation);
      } else {
        record(
          `Keep the current distance for ${neighbor}.`,
          `${candidateDistance} is not shorter than the current best (${Number.isFinite(distances[neighbor]) ? distances[neighbor] : 'Infinity'}), so no update is needed.`,
          'relax-check',
          current,
          [current, neighbor],
          calculation,
        );
      }
    }
  }

  const unreachable = graph.nodes.filter((node) => !finalized.has(node));
  record(
    'Dijkstra complete.',
    unreachable.length
      ? `Shortest distances from ${source} are ready. ${unreachable.join(', ')} are unreachable and remain at Infinity.`
      : `Shortest distances from ${source} are ready for every node.`,
    'complete',
    null,
    null,
    null,
    { complete: true, unreachable, result: { distances: { ...distances }, previous: Object.fromEntries(previous), unreachable, shortestPathEdges: shortestPathEdges() } },
  );
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
