from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .auth import initialize_database, router as auth_router


@asynccontextmanager
async def lifespan(_app):
    initialize_database()
    yield


app = FastAPI(title='VizFlow API', version='1.0.0', lifespan=lifespan)
app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://viz-flow-n2pthei1c-haripriyapachava.vercel.app',
        'https://viz-flow.vercel.app',
    ],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

CURRICULUM = [
    {
        'id': 'module-1',
        'title': 'DSA Fundamentals',
        'description': 'Core concepts and mathematical foundations for algorithmic thinking.',
        'lessons': [
            {'id': 'intro-dsa', 'title': 'Introduction to Data Structures and Algorithms', 'difficulty': 'Beginner', 'topic': 'DSA Fundamentals', 'completed': True, 'duration': 22},
            {'id': 'adt', 'title': 'Abstract Data Types', 'difficulty': 'Beginner', 'topic': 'DSA Fundamentals', 'completed': True, 'duration': 18},
            {'id': 'complexity', 'title': 'Time and Space Complexity', 'difficulty': 'Beginner', 'topic': 'DSA Fundamentals', 'completed': False, 'duration': 24},
        ],
    },
    {
        'id': 'module-2',
        'title': 'Arrays and Strings',
        'description': 'Arrays, strings, and common patterns for search and traversal.',
        'lessons': [
            {'id': 'bubble-sort', 'title': 'Bubble Sort', 'difficulty': 'Beginner', 'topic': 'Arrays and Strings', 'completed': True, 'duration': 28, 'algorithm': 'bubble-sort'},
            {'id': 'binary-search', 'title': 'Binary Search', 'difficulty': 'Intermediate', 'topic': 'Arrays and Strings', 'completed': True, 'duration': 31, 'algorithm': 'binary-search'},
        ],
    },
]

@app.get('/api/health')
def health():
    return {'status': 'ok', 'service': 'vizflow-backend'}

@app.get('/api/curriculum')
def curriculum():
    return {'modules': CURRICULUM}

@app.get('/api/lessons/{lesson_id}')
def lesson_detail(lesson_id: str):
    lesson_map = {
        'bubble-sort': {
            'id': 'bubble-sort',
            'title': 'Bubble Sort',
            'difficulty': 'Beginner',
            'summary': 'Repeatedly compares adjacent values and swaps them when order is wrong.',
            'complexity': 'O(n²) time, O(1) space',
            'bestCase': 'O(n) when already sorted',
            'mistakes': 'Forgetting to compare adjacent pairs or not accounting for early termination.',
            'pseudocode': 'for i = 0 to n-1\n  for j = 0 to n-i-2\n    if arr[j] > arr[j+1]\n      swap(arr[j], arr[j+1])',
            'algorithm': 'bubble-sort',
        },
        'binary-search': {
            'id': 'binary-search',
            'title': 'Binary Search',
            'difficulty': 'Intermediate',
            'summary': 'Efficiently finds a target by halving the search range each step.',
            'complexity': 'O(log n) time, O(1) space',
            'bestCase': 'O(1) when the middle element matches immediately',
            'mistakes': 'Using the wrong midpoint or failing to shrink the range correctly.',
            'pseudocode': 'low = 0\nhigh = n - 1\nwhile low <= high\n  mid = (low + high) // 2\n  if arr[mid] == target\n    return mid\n  else if arr[mid] < target\n    low = mid + 1\n  else\n    high = mid - 1',
            'algorithm': 'binary-search',
        },
    }

    if lesson_id not in lesson_map:
        return {'detail': 'Lesson not found'}, 404

    return lesson_map[lesson_id]
