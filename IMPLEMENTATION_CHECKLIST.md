# VizFlow Implementation Checklist

This is the audited baseline for the curriculum in the master implementation prompt. Status describes implementation completeness, not a student's completion:

- `[ ] Missing` means the lesson is not currently present as a usable lesson.
- `[~] Incomplete` means only part of its requested teaching, execution, visualization, assessment, persistence, or test coverage exists.
- `[x] Implemented` is reserved for a lesson that meets its applicable acceptance criteria and has passing tests.

At the initial audit, Bubble Sort and Binary Search had input-driven execution traces, code-line maps, playback, basic lesson content, and tests. Linear Search, Selection Sort, and Insertion Sort had also been added with traces and tests. These remain **incomplete** against the full acceptance criteria, including durable progress and comprehensive lesson sections. Do not infer student completion from these implementation marks.

## Phase 1 delivery status

- [~] Cycle Detection: Floyd's algorithm now traces each SLOW step and both FAST hops with stable node IDs, draws next-pointer arrows and cycle links, detects the first meeting, and supports a separate Find Cycle Start phase. Custom values, no-cycle/cycle toggle, target-node selection, random examples, Python/Java mappings, and input validation are included. Phase 2 remains an additional O(n) scan with O(1) space. The UI catalogue marks the tested trace Interactive; durable progress and broad assessment remain unfinished.
- [~] Two Pointers: ten input-driven patterns now have selectable presets, custom input, step-by-step state and movement explanations, pointer/value/decision displays, playback controls, mapped Python/Java source, and pattern-specific learning checks. Automated tests cover outputs, boundaries, invalid inputs, and source mappings. Full persisted progress and broader practice/assessment workflows remain unfinished.
- [~] Sliding Window: fixed-size maximum sum, minimum-size sum for positive integers, and longest substring without repeating characters are selectable and traced from input. The visualization shows the window, outgoing/incoming values, boundaries, current/max sum or current/best length, decisions, playback, mapped code, and a learning check. Full persisted progress and broader lesson assessment remain unfinished.
- Validation after Phase 1: `frontend/npm test` passes 13 tests; `frontend/npm run build` passes. Browser smoke check confirmed the Two Sum example `[1, 2, 3, 4, 6, 8]`, target `10`, advances through `1 + 8 = 9`, moves LEFT, and displays `Pair found: 2 + 8 = 10`.
- Cycle Detection validation: `frontend/npm test` passes 16 tests including empty/singleton/self-cycle/two-node/head/middle/no-cycle/long/duplicate-value cases, exact hop states, cycle-start detection, and source-line maps; `frontend/npm run build` passes.
- This completes the requested Phase 1 algorithm functionality, not the overall curriculum or all cross-cutting learning/progress requirements.

## Trees and Graphs implementation phases

### Phase 1: Binary trees, BST fundamentals, and traversals

- [x] Introduction to Trees: custom level-order input, hierarchical node/edge diagram, definition, real-life example, complexity, practice question, and quiz.
- [x] Binary Trees: visualizes complete and sparse binary trees; traces accept missing-child markers and explain the two-child limit.
- [x] Binary Search Trees: validates every node against inherited ancestor bounds, highlights the offending node, and provides valid/invalid presets. Search, insertion, and deletion are not included in this phase.
- [x] Preorder, inorder, and postorder traversal: generates input-dependent recursion traces with the call stack, visited order, current-node highlighting, mapped Python/Java code, and playback controls.
- [~] Level-order traversal: queue-based trace and source mappings are selectable in the traversal studio; a dedicated standalone lesson is still Coming Soon.
- [ ] BST insertion, deletion, and searching; AVL trees; heaps; tries.
- [ ] Graph lessons and graph algorithms (Phases 3 and 4).
- Validation: `frontend/npm test` passes all 28 tests, including tree parsing, all four traversal orders, empty/sparse/single trees, BST ancestor-bound checks, and Python/Java source mappings. `frontend/npm run build` succeeds; Vite reports the existing large-bundle advisory. Browser smoke checks confirmed login, traversal playback with current-node and source-line highlighting, and the Coming Soon graph-lesson page.

## DSA Fundamentals delivery status

- [x] Introduction to DSA: interactive array, linked-list, stack, queue, tree, and graph examples; linear/non-linear and static/dynamic comparisons; generated maximum-search steps; Python/Java reference code; practice question and quiz.
- [x] Abstract Data Types: stateful Stack, Queue, List, Set, and Map simulators; operations are separated from example implementations; empty states, duplicate Set values, map keys, practice, and quiz are handled.
- [x] Time and Space Complexity: selectable O(1), O(log n), O(n), O(n log n), and O(n²) growth demonstrations; adjustable input size and operation estimates; representative algorithm steps; linear search; best/average/worst cases; and input/auxiliary/call-stack memory illustrations.
- [x] Big O, Big Omega, and Big Theta: toggleable growth-function chart, concrete constants and n₀ demonstrations, input-size comparison, practice, and quiz. Notations are presented as function bounds, not as synonyms for best/worst cases.
- [x] Completion is earned by a lesson interaction and a correct quiz answer; completion status is stored in browser localStorage per student account. No learning-time values are synthesized or changed. The existing dashboard metrics remain sample data.
- Validation after fundamentals delivery: `frontend/npm test` passes 23 tests; `frontend/npm run build` passes with the existing large-bundle-size advisory. Editor diagnostics report no errors. Browser smoke checks confirmed sign-in, curriculum routing, the Introduction maximum trace, the Complexity operation trace, Big O bound output, and ADT simulator rendering.

## Initial audit findings (historical)

- Existing stack: React 18, Vite, Tailwind, Node's built-in test runner; FastAPI, Pydantic, SQLAlchemy, SQLite dependencies.
- Frontend curriculum contains 11 lessons in 3 modules; backend curriculum data is separately hardcoded and has 5 lessons in 2 modules.
- At that audit only Bubble Sort and Binary Search had execution traces. Unsupported lessons are disabled in the catalogue.
- Curriculum previously hardcoded four lessons as completed. Those values were removed; catalogue badges now report `Interactive` or `In development` instead of student progress.
- Existing database file contains schema declarations only. Backend login is an in-memory demo and no persistence, authorization, or session tracking is wired into routes.
- `frontend/npm test`: 7 passed. `frontend/npm run build`: passed.
- Backend health/login endpoint check initially found no service listening; after starting the demo backend, health returned `ok` and demo student login succeeded.
- Browser smoke checks: demo sign-in, lesson selection, generated Selection Sort trace, and custom Linear Search input `[2, 2, 5]` with target `5` returning index `2`.
- `npm audit --omit=dev`: 0 production dependency vulnerabilities. The install output reported advisories in the full dependency tree; review those before deployment.

## Shared engine and learning studio

- [~] Custom input, algorithm-specific validation, mapped source code, and playback for the existing traces, two-pointer patterns, and sliding-window patterns.
- [~] Synchronized execution traces, code highlighting, and variable inspectors for implemented array algorithms and linked-list searches.
- [~] Previous, next, play, pause, reset, and speed controls for implemented traces.
- [~] Add edge-case tests for the Phase 1 algorithms; extend reusable trace/property checks to every implemented algorithm.
- [ ] Add custom-input diagram support for appropriate non-array structures.
- [ ] Add searchable/filterable catalogue and truthful implementation/progress statuses.
- [~] Add local learning-check questions with answer feedback for Two Pointers and Sliding Window; general practice and persisted assessment history remain unfinished.

## Module 1: DSA Fundamentals and Complexity

- [x] Introduction to Data Structures and Algorithms
- [x] Data structures versus algorithms
- [x] Abstract Data Types
- [ ] Primitive and non-primitive data structures
- [x] Linear and non-linear data structures
- [x] Static and dynamic data structures
- [x] Basic algorithm design and analysis
- [x] Time complexity
- [x] Space complexity
- [x] Big O notation
- [x] Big Omega notation
- [x] Big Theta notation
- [x] Best, average, and worst cases
- [~] Constant, logarithmic, linear, linearithmic, and quadratic growth; exponential growth remains outstanding
- [ ] Amortized analysis
- [ ] Recurrence relations
- [ ] Recursion trees
- [ ] Master Theorem
- [ ] Iterative versus recursive algorithms
- [ ] Trade-offs between time and space

## Module 2: Arrays

- [ ] Array fundamentals and memory representation
- [ ] Traversal
- [ ] Access, insertion, deletion, and updating
- [~] Linear Search (input-driven trace, Java/Python source mappings, custom target, and tests; full lesson assessment and persisted progress still incomplete)
- [~] Reverse an array (Two Pointers studio; full curriculum lesson sections/progress remain unfinished)
- [ ] Minimum and maximum
- [ ] Second-largest element
- [~] Remove duplicates from a sorted array (Two Pointers studio)
- [ ] Array rotation
- [~] Move Zeroes (Two Pointers studio)
- [~] Two Sum in a sorted array (Two Pointers studio)
- [~] Container With Most Water (Two Pointers studio)
- [~] Three Sum (Two Pointers studio)
- [~] Two-pointer technique (10 interactive patterns; full curriculum lesson sections/progress remain unfinished)
- [~] Sliding window (fixed and variable-size patterns; full curriculum lesson sections/progress remain unfinished)
- [ ] Prefix sums and suffix sums
- [ ] Difference arrays
- [ ] Kadane's algorithm
- [ ] Maximum subarray sum
- [ ] Majority element
- [~] Merge sorted arrays (Two Pointers studio)
- [ ] Missing and duplicate elements
- [ ] Subarray generation
- [ ] Subarray sum problems
- [ ] Matrix representation
- [ ] Matrix traversal
- [ ] Matrix transpose
- [ ] Matrix rotation
- [ ] Spiral traversal
- [ ] Binary Search on an answer
- [~] Bubble Sort (currently filed under Arrays and Strings in the existing catalogue)
- [~] Binary Search (currently filed under Arrays and Strings in the existing catalogue)

## Module 3: Strings

- [ ] String representation
- [ ] Character traversal
- [~] String reversal (Two Pointers studio)
- [~] Palindrome checking (Two Pointers studio)
- [ ] Character frequency
- [ ] Anagram detection
- [ ] Longest common prefix
- [ ] Substring searching
- [ ] String compression
- [~] Longest substring without repeating characters (Sliding Window studio)
- [ ] KMP algorithm
- [ ] Rabin–Karp algorithm
- [ ] Z Algorithm
- [ ] Rolling hash
- [ ] Manacher's algorithm
- [ ] String matching patterns
- [ ] Common prefix and suffix problems

## Module 4: Searching

- [~] Linear Search (input-driven trace, Java/Python source mappings, custom target, and tests; full lesson assessment and persisted progress still incomplete)
- [~] Binary Search
- [ ] Recursive Binary Search
- [ ] First occurrence
- [ ] Last occurrence
- [ ] Lower bound
- [ ] Upper bound
- [ ] Search insertion position
- [ ] Search in rotated sorted arrays
- [ ] Search in two-dimensional matrices
- [ ] Integer square root
- [ ] Binary Search on an answer
- [ ] Exponential Search
- [ ] Interpolation Search
- [ ] Jump Search
- [ ] Ternary Search

## Module 5: Sorting

- [~] Bubble Sort
- [~] Selection Sort (dynamic trace, Java/Python mappings, variables, and tests; full progress/quiz integration remains incomplete)
- [~] Insertion Sort (dynamic trace, Java/Python mappings, variables, and tests; full progress/quiz integration remains incomplete)
- [ ] Merge Sort
- [ ] Quick Sort
- [ ] Heap Sort
- [ ] Counting Sort
- [ ] Radix Sort
- [ ] Bucket Sort
- [ ] Shell Sort
- [ ] Sorting stability
- [ ] In-place versus out-of-place sorting
- [ ] Comparison versus non-comparison sorting
- [ ] Custom comparator concepts
- [ ] Sorting algorithm comparison mode

## Module 6: Linked Lists

- [ ] Singly linked lists
- [ ] Doubly linked lists
- [ ] Circular linked lists
- [ ] Traversal
- [ ] Search
- [ ] Insertion at the beginning
- [ ] Insertion at the end
- [ ] Insertion at a specified position
- [ ] Deletion by value
- [ ] Deletion by position
- [ ] Reverse iteratively
- [ ] Reverse recursively
- [ ] Find the middle node
- [~] Cycle detection using Floyd's algorithm (input-driven trace, distinct meeting and cycle-start phases, SVG links, Python/Java mappings, and edge-case tests; lesson progress persistence remains unfinished)
- [ ] Find the starting point of a cycle
- [ ] Merge two sorted linked lists
- [ ] Remove the Nth node from the end
- [ ] Intersection of linked lists
- [ ] Palindrome linked list
- [ ] Reverse nodes in groups
- [ ] Flatten multilevel linked lists

## Module 7: Stacks

- [ ] Stack fundamentals
- [ ] Array-based stack
- [ ] Linked-list-based stack
- [ ] Push, pop, and peek
- [ ] Overflow and underflow
- [ ] Balanced parentheses
- [ ] Infix, postfix, and prefix notation
- [ ] Infix-to-postfix conversion
- [ ] Infix-to-prefix conversion
- [ ] Postfix evaluation
- [ ] Prefix evaluation
- [ ] Next Greater Element
- [ ] Previous Greater Element
- [ ] Monotonic stack
- [ ] Stock Span
- [ ] Largest Rectangle in a Histogram
- [ ] Min Stack
- [ ] Stack-based expression problems

## Module 8: Queues and Deques

- [ ] Queue fundamentals
- [ ] Array-based queue
- [ ] Linked-list-based queue
- [ ] Enqueue and dequeue
- [ ] Circular Queue
- [ ] Deque
- [ ] Priority Queue
- [ ] Queue using stacks
- [ ] Stack using queues
- [ ] Monotonic Queue
- [ ] Sliding Window Maximum
- [ ] First non-repeating character in a stream
- [ ] Queue applications

## Module 9: Hashing

- [ ] Hash functions
- [ ] Hash tables
- [ ] Hash Maps and Hash Sets
- [ ] Collision handling
- [ ] Separate chaining
- [ ] Open addressing
- [ ] Linear probing
- [ ] Quadratic probing
- [ ] Double hashing
- [ ] Frequency maps
- [ ] Duplicate detection
- [ ] Two Sum using hashing
- [ ] Group Anagrams
- [ ] Longest consecutive sequence
- [ ] Subarray sum using prefix-sum hashing

## Module 10: Trees

- [x] Tree terminology and representation (interactive tree diagram and custom level-order input)
- [x] Binary Trees
- [x] Binary Search Trees (ordering validation only)
- [ ] Insertion
- [ ] Searching
- [ ] Deletion
- [x] Preorder traversal
- [x] Inorder traversal
- [x] Postorder traversal
- [~] Level-order traversal (available as a trace in the traversal studio; standalone lesson is not implemented)
- [ ] Iterative traversals
- [ ] Height and depth
- [ ] Count nodes and leaf nodes
- [ ] Diameter of a tree
- [ ] Balanced-tree checking
- [ ] Lowest Common Ancestor
- [ ] Path-sum problems
- [ ] Boundary traversal
- [ ] Vertical-order traversal
- [ ] Serialize and deserialize trees
- [ ] Construct a tree from traversal sequences
- [ ] Binary Tree views

## Module 11: Advanced Trees and Heaps

- [ ] Min-Heap
- [ ] Max-Heap
- [ ] Heap insertion
- [ ] Heap deletion
- [ ] Heapify
- [ ] Heap Sort
- [ ] Priority Queue implementation
- [ ] AVL Trees
- [ ] AVL rotations
- [ ] Red-Black Trees
- [ ] Tries
- [ ] Trie insertion, deletion, and prefix search
- [ ] Segment Trees
- [ ] Segment Tree queries and updates
- [ ] Lazy propagation
- [ ] Fenwick Trees / Binary Indexed Trees
- [ ] Sparse Tables
- [ ] B-Trees and B+ Trees
- [ ] Order-statistics trees

## Module 12: Graphs

- [ ] Graph terminology
- [ ] Directed and undirected graphs
- [ ] Weighted and unweighted graphs
- [ ] Adjacency matrices
- [ ] Adjacency lists
- [ ] Edge-list representation
- [ ] BFS
- [ ] DFS
- [ ] Connected components
- [ ] Cycle detection in directed graphs
- [ ] Cycle detection in undirected graphs
- [ ] Bipartite graph checking
- [ ] Topological sorting
- [ ] Kahn's algorithm
- [ ] Strongly Connected Components
- [ ] Kosaraju's algorithm
- [ ] Tarjan's algorithm
- [ ] Bridges and articulation points
- [ ] Dijkstra's algorithm
- [ ] Bellman–Ford algorithm
- [ ] Floyd–Warshall algorithm
- [ ] Prim's algorithm
- [ ] Kruskal's algorithm
- [ ] Disjoint Set Union
- [ ] Shortest paths in DAGs
- [ ] Multi-source BFS
- [ ] Grid traversal
- [ ] Flood Fill
- [ ] Number of Islands
- [ ] A* search
- [ ] Eulerian paths and circuits
- [ ] Network-flow fundamentals
- [ ] Interactive graph creation (vertices, weighted edges, start and target)

## Module 13: Recursion and Backtracking

- [ ] Recursion fundamentals
- [ ] Base cases
- [ ] Recursive cases
- [ ] Call stack
- [ ] Factorial
- [ ] Fibonacci
- [ ] Recursive Binary Search
- [ ] Recursion trees
- [ ] Subsets
- [ ] Subsequences
- [ ] Permutations
- [ ] Combinations
- [ ] Combination Sum
- [ ] N-Queens
- [ ] Sudoku Solver
- [ ] Rat in a Maze
- [ ] Word Search
- [ ] Generate Parentheses
- [ ] Backtracking and pruning

## Module 14: Divide and Conquer

- [ ] Divide-and-conquer principles
- [ ] Merge Sort
- [ ] Quick Sort
- [ ] Binary Search
- [ ] Inversion Count
- [ ] Closest Pair of Points
- [ ] Strassen's Matrix Multiplication
- [ ] Recurrence trees
- [ ] Master Theorem

## Module 15: Greedy Algorithms

- [ ] Greedy-choice property
- [ ] Activity Selection
- [ ] Interval Scheduling
- [ ] Fractional Knapsack
- [ ] Job Sequencing with Deadlines
- [ ] Minimum Number of Platforms
- [ ] Huffman Coding
- [ ] Meeting Rooms
- [ ] Interval merging
- [ ] Gas Station
- [ ] Jump Game
- [ ] Greedy versus Dynamic Programming

## Module 16: Dynamic Programming

- [ ] Dynamic Programming fundamentals
- [ ] Memoization
- [ ] Tabulation
- [ ] State definitions
- [ ] State transitions
- [ ] Fibonacci
- [ ] Climbing Stairs
- [ ] House Robber
- [ ] Coin Change
- [ ] 0/1 Knapsack
- [ ] Unbounded Knapsack
- [ ] Subset Sum
- [ ] Partition Equal Subset Sum
- [ ] Longest Common Subsequence
- [ ] Longest Common Substring
- [ ] Longest Increasing Subsequence
- [ ] Edit Distance
- [ ] Matrix Chain Multiplication
- [ ] Grid Unique Paths
- [ ] Minimum Path Sum
- [ ] Palindromic Subsequence
- [ ] DP on strings
- [ ] DP on trees
- [ ] DP on graphs
- [ ] Bitmask DP
- [ ] Space optimization

## Module 17: Bit Manipulation

- [ ] Binary number representation
- [ ] AND, OR, XOR, and NOT
- [ ] Left and right shifts
- [ ] Odd/even checking
- [ ] Set, clear, and toggle bits
- [ ] Check whether a bit is set
- [ ] Count set bits
- [ ] Brian Kernighan's algorithm
- [ ] Power of two
- [ ] XOR-based unique-element problems
- [ ] Bit masks
- [ ] Subsets using bit masks
- [ ] Common bit manipulation tricks

## Module 18: Mathematical Algorithms

- [ ] GCD and LCM
- [ ] Euclidean algorithm
- [ ] Prime checking
- [ ] Sieve of Eratosthenes
- [ ] Prime factorization
- [ ] Modular arithmetic
- [ ] Fast exponentiation
- [ ] Modular exponentiation
- [ ] Combinations and permutations
- [ ] Number-theory problem patterns
- [ ] Integer overflow
- [ ] Greatest Common Divisor applications

## Module 19: Disjoint Set Union

- [ ] Make Set
- [ ] Find
- [ ] Union
- [ ] Union by rank
- [ ] Union by size
- [ ] Path compression
- [ ] Connected components
- [ ] Cycle detection
- [ ] Kruskal's Minimum Spanning Tree
- [ ] Dynamic connectivity

## Module 20: Advanced Problem-Solving Patterns

- [ ] Two Pointers
- [ ] Sliding Window
- [~] Fast and Slow Pointers (array middle-finding trace; linked-list cycle detection is still unfinished)
- [ ] Prefix Sums
- [ ] Difference Arrays
- [ ] Monotonic Stacks
- [ ] Monotonic Queues
- [ ] Binary Search on Answer
- [ ] Sweep Line
- [ ] Interval Techniques
- [ ] Top-K Problems
- [ ] Meet in the Middle
- [ ] Offline Queries
- [ ] Coordinate Compression
- [ ] Bitmask Techniques

## Module 21: Algorithm Comparison and Practice

- [ ] Sorting algorithm comparison
- [ ] Searching algorithm comparison
- [ ] Graph traversal comparison
- [ ] Greedy versus Dynamic Programming
- [ ] Recursive versus iterative implementations
- [ ] Time and space complexity comparison
- [ ] Operation-count visualization
- [ ] Input-size growth comparisons
- [ ] Best, average, and worst-case analysis
- [ ] Stability and in-place comparisons
- [ ] Practice problem collections
- [ ] Mixed-topic assessments

## Cross-cutting acceptance work

- [ ] Java and Python code, line mappings, and trace semantics match for each applicable algorithm.
- [ ] Correct structure-specific visualizations (never generic arrays for non-array structures).
- [ ] Safe input limits and validation for every interactive lesson.
- [ ] Edge-case, trace-state, source-line, playback, and visualization consistency tests for every implemented algorithm.
- [ ] Per-student persistent progress and quiz/practice history.
- [ ] Active-time tracking with visibility, inactivity, pause/resume, and duplicate-event handling.
- [ ] Authenticated student isolation and faculty authorization for analytics.
- [ ] Faculty and student dashboards use persisted, genuine activity data rather than fabricated metrics.
- [ ] Final navigation, responsive behavior, accessibility, build, API, and automated test audit.
