# VizFlow`r`n`r`nVizFlow is an interactive DSA learning platform that simplifies complex algorithms through step-by-step visualizations. It covers arrays, linked lists, trees, graphs, sorting, searching, and more. With synchronized code execution, custom inputs, and progress tracking, VizFlow helps students learn DSA effectively and improve problem-solving skills.`r`n`r`nVizFlow is an interactive visual learning and analytics platform for data structures and algorithms.

## Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: FastAPI
- Visualization: JavaScript execution traces generated from student-provided input
- Data: In-memory demo curriculum and authentication for local development

## Quick start

### Frontend
```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

### Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Demo credentials
- Student: aanya@vizflow.edu / demo123
- Faculty: meera@vizflow.edu / demo123

## Current status
- React/Vite frontend and FastAPI demo backend run locally; the backend health and demo student login endpoints were verified.
- The frontend catalogue has five modules, including new Trees and Graphs sections. The four DSA Fundamentals lessons (Introduction to DSA, ADTs, Time/Space Complexity, and asymptotic notation) open interactive studios with practice questions, quizzes, visual examples, and local per-student completion flags.
- Phase 1 of the Trees module is interactive: tree introductions and binary-tree diagrams accept custom level-order input; BST lessons validate inherited ordering bounds; and preorder, inorder, postorder, and level-order traversals produce step-by-step traces, recursion-stack or queue state, Python/Java line highlighting, presets, and playback controls.
- BST insertion/deletion/search, standalone level-order lessons, AVL trees, heaps, tries, and all graph algorithm studios remain Coming Soon. Their catalogue entries open an honest status page rather than claiming an unfinished visualization is interactive.
- Tested input-driven traces cover Bubble Sort, Binary Search, Linear Search, Selection Sort, Insertion Sort, singly/doubly linked-list search, Floyd Cycle Detection, ten Two Pointers patterns, and three Sliding Window patterns.
- Two Pointers includes sorted Two Sum, array/string reversal, palindrome checking, remove duplicates, move zeroes, Container With Most Water, merge sorted arrays, Three Sum, and fast/slow middle-finding. Sliding Window includes fixed-size maximum sum, minimum-size sum for positive integers, and longest substring without repeating characters.
- Cycle Detection animates each slow and fast pointer hop over an SVG-linked list, supports cyclic and non-cyclic custom lists (including duplicate node values), and can separately trace the cycle entrance after the first meeting.
- The reusable JavaScript trace engine drives the visualization; Python and Java are displayed as equivalent, line-mapped reference implementations and are not executed directly. The studio includes custom inputs, presets, pointer/window state, explanations, variable tracking, learning checks, and playback controls.
- Catalogue statuses distinguish `Interactive`, `In Development`, and `Coming Soon`; the presence of a lesson card does not imply the full DSA curriculum is implemented. Fundamentals completion is saved in browser localStorage and is separate from the existing dashboards.
- Student/faculty dashboards still use sample data. Database models exist, but authentication, learner progress beyond the fundamentals local flag, quiz results, and active-time events are not persisted to the backend or authorization-protected.
- See [IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md) for the full lesson-by-lesson status and remaining work.

### Visualization tests
From the `frontend` directory, run `npm test` to validate algorithm results, edge cases, trace comparisons and mutations, source-line mappings, input parsing, search behavior, tree construction/traversals/BST validation, ADT operations, and fundamentals complexity examples.

## Notes
The project is intentionally built as a local MVP with demo data to demonstrate the learning experience and analytics workflow.


