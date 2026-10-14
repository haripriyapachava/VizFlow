const bubblePythonCode = `def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        swapped = False
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr`;

const bubbleJavaCode = `int[] bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        boolean swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapped = true;
            }
        }
        if (!swapped) {
            break;
        }
    }
    return arr;
}`;

const binaryPythonCode = `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`;

const binaryJavaCode = `int binarySearch(int[] arr, int target) {
    int low = 0;
    int high = arr.length - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) {
            return mid;
        }
        if (arr[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return -1;
}`;

const bubbleLineIds = [
  null, null, 'initialize-length', 'outer-loop', 'reset-swapped', 'inner-loop',
  'compare', 'swap', 'mark-swapped', 'check-early-stop', 'break', 'return-result',
];
const bubbleJavaLineIds = [
  null, null, 'initialize-length', 'outer-loop', 'reset-swapped', 'inner-loop',
  'compare', 'swap', 'swap', 'swap', 'mark-swapped',
  null, null, 'check-early-stop', 'break', null, null, 'return-result', null,
];
const binaryPythonLineIds = [
  null, null, 'initialize-low', 'initialize-high', 'check-range', 'calculate-mid',
  'compare-equal', 'return-found', 'compare-less', 'move-low', null,
  'move-high', 'return-not-found',
];
const binaryJavaLineIds = [
  null, null, 'initialize-low', 'initialize-high', 'check-range', 'calculate-mid',
  'compare-equal', 'return-found', null, 'compare-less', 'move-low',
  null, 'move-high', null, null, 'return-not-found', null,
];
const linearPythonCode = `def linear_search(arr, target):
  for i, value in enumerate(arr):
    if value == target:
      return i
  return -1`;
const linearJavaCode = `int linearSearch(int[] arr, int target) {
  for (int i = 0; i < arr.length; i++) {
    if (arr[i] == target) {
      return i;
    }
  }
  return -1;
}`;
const linearPythonLineIds = [null, null, 'loop', 'compare', 'return-found', 'return-not-found'];
const linearJavaLineIds = [null, null, 'loop', 'compare', 'return-found', null, null, 'return-not-found', null];
const selectionPythonCode = `def selection_sort(arr):
  n = len(arr)
  for i in range(n):
    min_idx = i
    for j in range(i + 1, n):
      if arr[j] < arr[min_idx]:
        min_idx = j
    if min_idx != i:
      arr[i], arr[min_idx] = arr[min_idx], arr[i]
  return arr`;
const selectionJavaCode = `int[] selectionSort(int[] arr) {
  int n = arr.length;
  for (int i = 0; i < n; i++) {
    int minIndex = i;
    for (int j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }
    }
    if (minIndex != i) {
      int temp = arr[i];
      arr[i] = arr[minIndex];
      arr[minIndex] = temp;
    }
  }
  return arr;
}`;
const selectionPythonLineIds = [null, null, 'initialize-length', 'outer-loop', 'initialize-min', 'inner-loop', 'compare', 'update-min', 'check-swap', 'swap', 'return-result'];
const selectionJavaLineIds = [null, null, 'initialize-length', 'outer-loop', 'initialize-min', 'inner-loop', 'compare', 'update-min', null, null, 'check-swap', 'swap', 'swap', 'swap', null, null, 'return-result', null];
const insertionPythonCode = `def insertion_sort(arr):
  for i in range(1, len(arr)):
    key = arr[i]
    j = i - 1
    while j >= 0 and arr[j] > key:
      arr[j + 1] = arr[j]
      j -= 1
    arr[j + 1] = key
  return arr`;
const insertionJavaCode = `int[] insertionSort(int[] arr) {
  for (int i = 1; i < arr.length; i++) {
    int key = arr[i];
    int j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`;
const insertionPythonLineIds = [null, null, 'outer-loop', 'set-key', 'initialize-j', 'compare', 'shift', 'decrement-j', 'insert-key', 'return-result'];
const insertionJavaLineIds = [null, null, 'outer-loop', 'set-key', 'initialize-j', 'compare', 'shift', 'decrement-j', null, 'insert-key', null, 'return-result', null];

const pointerCodeLines = {
  'two-sum': {
    python: [['setup', 'def two_sum(arr, target):'], ['left-start', '    left, right = 0, len(arr) - 1'], ['loop', '    while left < right:'], ['sum', '        current = arr[left] + arr[right]'], ['match', '        if current == target:'], ['return', '            return [left, right]'], ['low', '        if current < target:'], ['move-left', '            left += 1'], ['move-right', '        else:'], ['right-step', '            right -= 1'], ['missing', '    return []']],
    java: [['setup', 'int[] twoSum(int[] arr, int target) {'], ['left-start', '    int left = 0, right = arr.length - 1;'], ['loop', '    while (left < right) {'], ['sum', '        int current = arr[left] + arr[right];'], ['match', '        if (current == target) {'], ['return', '            return new int[] {left, right};'], ['low', '        if (current < target) {'], ['move-left', '            left++;'], ['move-right', '        } else {'], ['right-step', '            right--;'], ['missing', '    return new int[0];'], [null, '}']],
  },
  'reverse-array': {
    python: [['setup', 'def reverse(arr):'], ['left-start', '    left, right = 0, len(arr) - 1'], ['loop', '    while left < right:'], ['swap', '        arr[left], arr[right] = arr[right], arr[left]'], ['left-step', '        left += 1'], ['right-step', '        right -= 1'], ['return', '    return arr']],
    java: [['setup', 'int[] reverse(int[] arr) {'], ['left-start', '    int left = 0, right = arr.length - 1;'], ['loop', '    while (left < right) {'], ['swap', '        int temp = arr[left]; arr[left] = arr[right]; arr[right] = temp;'], ['left-step', '        left++;'], ['right-step', '        right--;'], ['return', '    return arr;'], [null, '}']],
  },
  'reverse-string': {
    python: [['setup', 'def reverse_string(text):'], ['chars', '    chars = list(text)'], ['left-start', '    left, right = 0, len(chars) - 1'], ['loop', '    while left < right:'], ['swap', '        chars[left], chars[right] = chars[right], chars[left]'], ['left-step', '        left += 1'], ['right-step', '        right -= 1'], ['return', '    return "".join(chars)']],
    java: [['setup', 'String reverseString(String text) {'], ['chars', '    char[] chars = text.toCharArray();'], ['left-start', '    int left = 0, right = chars.length - 1;'], ['loop', '    while (left < right) {'], ['swap', '        char temp = chars[left]; chars[left] = chars[right]; chars[right] = temp;'], ['left-step', '        left++;'], ['right-step', '        right--;'], ['return', '    return new String(chars);'], [null, '}']],
  },
  palindrome: {
    python: [['setup', 'def is_palindrome(text):'], ['left-start', '    left, right = 0, len(text) - 1'], ['loop', '    while left < right:'], ['compare', '        if text[left] != text[right]:'], ['false', '            return False'], ['left-step', '        left += 1'], ['right-step', '        right -= 1'], ['true', '    return True']],
    java: [['setup', 'boolean isPalindrome(String text) {'], ['left-start', '    int left = 0, right = text.length() - 1;'], ['loop', '    while (left < right) {'], ['compare', '        if (text.charAt(left) != text.charAt(right)) {'], ['false', '            return false;'], ['left-step', '        left++;'], ['right-step', '        right--;'], ['true', '    return true;'], [null, '}']],
  },
  'remove-duplicates': {
    python: [['setup', 'def remove_duplicates(arr):'], ['empty', '    if not arr: return []'], ['slow-start', '    slow = 0'], ['loop', '    for fast in range(1, len(arr)):'], ['compare', '        if arr[fast] != arr[slow]:'], ['advance', '            slow += 1'], ['copy', '            arr[slow] = arr[fast]'], ['return', '    return arr[:slow + 1]']],
    java: [['setup', 'int[] removeDuplicates(int[] arr) {'], ['empty', '    if (arr.length == 0) return new int[0];'], ['slow-start', '    int slow = 0;'], ['loop', '    for (int fast = 1; fast < arr.length; fast++) {'], ['compare', '        if (arr[fast] != arr[slow]) {'], ['advance', '            slow++;'], ['copy', '            arr[slow] = arr[fast];'], ['return', '    return Arrays.copyOf(arr, slow + 1);'], [null, '}']],
  },
  'move-zeroes': {
    python: [['setup', 'def move_zeroes(arr):'], ['slow-start', '    slow = 0'], ['loop', '    for fast in range(len(arr)):'], ['compare', '        if arr[fast] != 0:'], ['swap', '            arr[slow], arr[fast] = arr[fast], arr[slow]'], ['advance', '            slow += 1'], ['return', '    return arr']],
    java: [['setup', 'void moveZeroes(int[] arr) {'], ['slow-start', '    int slow = 0;'], ['loop', '    for (int fast = 0; fast < arr.length; fast++) {'], ['compare', '        if (arr[fast] != 0) {'], ['swap', '            int temp = arr[slow]; arr[slow] = arr[fast]; arr[fast] = temp;'], ['advance', '            slow++;'], [null, '    }'], ['return', '}']],
  },
  'container-water': {
    python: [['setup', 'def max_area(height):'], ['left-start', '    left, right = 0, len(height) - 1'], ['best-start', '    best = 0'], ['loop', '    while left < right:'], ['area', '        area = min(height[left], height[right]) * (right - left)'], ['best', '        best = max(best, area)'], ['move-left', '        if height[left] < height[right]:'], ['left-step', '            left += 1'], ['right-step', '        else:'], ['right-move', '            right -= 1'], ['return', '    return best']],
    java: [['setup', 'int maxArea(int[] height) {'], ['left-start', '    int left = 0, right = height.length - 1;'], ['best-start', '    int best = 0;'], ['loop', '    while (left < right) {'], ['area', '        int area = Math.min(height[left], height[right]) * (right - left);'], ['best', '        best = Math.max(best, area);'], ['move-left', '        if (height[left] < height[right]) {'], ['left-step', '            left++;'], ['right-step', '        } else {'], ['right-move', '            right--;'], ['return', '    return best;'], [null, '}']],
  },
  merge: {
    python: [['setup', 'def merge(a, b):'], ['indices', '    i = j = 0'], ['result', '    result = []'], ['loop', '    while i < len(a) and j < len(b):'], ['compare', '        if a[i] <= b[j]:'], ['take-left', '            result.append(a[i]); i += 1'], ['take-right', '        else:'], ['take-right-value', '            result.append(b[j]); j += 1'], ['tails', '    result.extend(a[i:]); result.extend(b[j:])'], ['return', '    return result']],
    java: [['setup', 'int[] merge(int[] a, int[] b) {'], ['indices', '    int i = 0, j = 0;'], ['result', '    int[] out = new int[a.length + b.length]; int k = 0;'], ['loop', '    while (i < a.length && j < b.length) {'], ['compare', '        if (a[i] <= b[j]) {'], ['take-left', '            out[k++] = a[i++];'], ['take-right', '        } else {'], ['take-right-value', '            out[k++] = b[j++];'], ['tails', '    while (i < a.length) out[k++] = a[i++]; while (j < b.length) out[k++] = b[j++];'], ['return', '    return out;'], [null, '}']],
  },
  'three-sum': {
    python: [['setup', 'def three_sum(arr, target=0):'], ['sort', '    arr.sort()'], ['answers-start', '    answers = []'], ['outer', '    for i in range(len(arr) - 2):'], ['skip', '        if i and arr[i] == arr[i - 1]: continue'], ['pointers', '        left, right = i + 1, len(arr) - 1'], ['loop', '        while left < right:'], ['sum', '            total = arr[i] + arr[left] + arr[right]'], ['match', '            if total == target:'], ['found', '                answers.append([arr[i], arr[left], arr[right]])'], ['move-left', '                left += 1'], ['right-step', '                right -= 1'], ['skip-left-check', '                while left < right and arr[left] == arr[left - 1]:'], ['skip-left-move', '                    left += 1'], ['skip-right-check', '                while left < right and arr[right] == arr[right + 1]:'], ['skip-right-move', '                    right -= 1'], ['move-right', '            elif total < target:'], ['left-step', '                left += 1'], ['right-choice', '            else:'], ['right-move', '                right -= 1'], ['return', '    return answers']],
    java: [['setup', 'List<List<Integer>> threeSum(int[] arr, int target) {'], ['sort', '    Arrays.sort(arr);'], ['answers-start', '    List<List<Integer>> answers = new ArrayList<>();'], ['outer', '    for (int i = 0; i < arr.length - 2; i++) {'], ['skip', '        if (i > 0 && arr[i] == arr[i - 1]) continue;'], ['pointers', '        int left = i + 1, right = arr.length - 1;'], ['loop', '        while (left < right) {'], ['sum', '            int total = arr[i] + arr[left] + arr[right];'], ['match', '            if (total == target) {'], ['found', '                answers.add(List.of(arr[i], arr[left], arr[right]));'], ['move-left', '                left++;'], ['right-step', '                right--;'], ['skip-left-check', '                while (left < right && arr[left] == arr[left - 1]) {'], ['skip-left-move', '                    left++;'], [null, '                }'], ['skip-right-check', '                while (left < right && arr[right] == arr[right + 1]) {'], ['skip-right-move', '                    right--;'], [null, '                }'], ['move-right', '            } else if (total < target) {'], ['left-step', '                left++;'], ['right-choice', '            } else {'], ['right-move', '                right--;'], ['return', '    return answers;'], [null, '}']],
  },
  'fast-slow': {
    python: [['setup', 'def middle_value(arr):'], ['slow-start', '    slow = 0'], ['fast-start', '    fast = 0'], ['loop', '    while fast + 1 < len(arr):'], ['fast-step', '        fast += 2'], ['slow-step', '        slow += 1'], ['return', '    return slow']],
    java: [['setup', 'int middleIndex(int[] arr) {'], ['slow-start', '    int slow = 0;'], ['fast-start', '    int fast = 0;'], ['loop', '    while (fast + 1 < arr.length) {'], ['fast-step', '        fast += 2;'], ['slow-step', '        slow++;'], ['return', '    return slow;'], [null, '}']],
  },
};

function codeDefinition(lines) {
  const pythonLines = lines.python;
  const javaLines = lines.java;
  return {
    pythonCode: pythonLines.map(([, source]) => source).join('\n'),
    javaCode: javaLines.map(([, source]) => source).join('\n'),
    pythonLineIds: [null, ...pythonLines.map(([id]) => id)],
    javaLineIds: [null, ...javaLines.map(([id]) => id)],
  };
}

export const lessonLibrary = {
  'bubble-sort': {
    id: 'bubble-sort',
    title: 'Bubble Sort',
    topic: 'Arrays and Strings',
    difficulty: 'Beginner',
    summary: 'Bubble Sort repeatedly compares adjacent values and swaps them when the left value is greater than the right one.',
    concept: 'Bubble Sort repeatedly moves the largest remaining value to the end of the unsorted section.',
    terminology: [
      { label: 'Element', text: 'Each value stored in the array is an element.' },
      { label: 'Comparison', text: 'Two adjacent elements are checked to decide whether a swap is needed.' },
      { label: 'Pass', text: 'One sweep through the unsorted section is called a pass.' },
      { label: 'Swap', text: 'Two values exchange positions when they are out of order.' },
    ],
    memory: 'The sort modifies the input array in place and uses constant extra space.',
    code: bubblePythonCode,
    pythonCode: bubblePythonCode,
    javaCode: bubbleJavaCode,
    pythonLineIds: bubbleLineIds,
    javaLineIds: bubbleJavaLineIds,
    complexity: 'O(n²) time, O(1) extra space',
    bestCase: 'O(n) when the input is already sorted',
    mistakes: 'Forgetting the inner-loop bound or the early exit when a pass makes no swaps.',
    practice: 'Try arranging a different integer array in ascending order.',
    variableName: 'arr',
    defaultInput: [8, 3, 5, 1, 9],
  },
  'binary-search': {
    id: 'binary-search',
    title: 'Binary Search',
    topic: 'Arrays and Strings',
    difficulty: 'Intermediate',
    summary: 'Binary Search repeatedly eliminates half of the remaining search range.',
    concept: 'Binary Search checks the midpoint of a sorted array and discards the half that cannot contain the target.',
    terminology: [
      { label: 'Sorted array', text: 'The values must be ordered for each midpoint comparison to safely discard a half.' },
      { label: 'Low', text: 'The left boundary of the remaining search range.' },
      { label: 'Mid', text: 'The center index currently being checked.' },
      { label: 'High', text: 'The right boundary of the remaining search range.' },
    ],
    memory: 'Binary Search uses index positions and does not copy or modify the input array.',
    code: binaryPythonCode,
    pythonCode: binaryPythonCode,
    javaCode: binaryJavaCode,
    pythonLineIds: binaryPythonLineIds,
    javaLineIds: binaryJavaLineIds,
    complexity: 'O(log n) time, O(1) extra space',
    bestCase: 'O(1) when the first midpoint matches',
    mistakes: 'Searching an unsorted array or moving the wrong boundary after a comparison.',
    practice: 'Find different targets in a sorted array, including values that are absent.',
    variableName: 'arr',
    defaultInput: [2, 5, 8, 12, 16, 23, 38, 56, 72],
    defaultTarget: 23,
  },
  'linear-search': {
    id: 'linear-search',
    title: 'Linear Search',
    topic: 'Arrays and Strings',
    difficulty: 'Beginner',
    summary: 'Linear Search checks each element in order until it finds the target or reaches the end.',
    concept: 'Unlike Binary Search, Linear Search works on unsorted input. It examines values from left to right and returns the first matching index.',
    terminology: [
      { label: 'Target', text: 'The value the algorithm is trying to find.' },
      { label: 'Index', text: 'The zero-based position of an element in the array.' },
      { label: 'First match', text: 'If a value appears more than once, this implementation returns its earliest index.' },
    ],
    memory: 'The input array is read in place. The algorithm stores only the current index and target, so auxiliary space is constant.',
    code: linearPythonCode,
    pythonCode: linearPythonCode,
    javaCode: linearJavaCode,
    pythonLineIds: linearPythonLineIds,
    javaLineIds: linearJavaLineIds,
    complexity: 'O(n) time, O(1) extra space',
    bestCase: 'O(1) when the first element matches',
    mistakes: 'Assuming the array must be sorted, or continuing after the first match when the task asks for the first index.',
    practice: 'Search arrays with duplicates and absent targets; compare the number of checks.',
    variableName: 'arr',
    defaultInput: [8, 3, 5, 1, 9],
    defaultTarget: 1,
  },
  'selection-sort': {
    id: 'selection-sort',
    title: 'Selection Sort',
    topic: 'Arrays and Strings',
    difficulty: 'Beginner',
    summary: 'Selection Sort repeatedly finds the smallest value in the unsorted suffix and moves it to the next sorted position.',
    concept: 'At each index, scan the remaining unsorted values, remember the minimum index, and swap that minimum into place. The sorted prefix grows by one after each pass.',
    terminology: [
      { label: 'Sorted prefix', text: 'The left portion already placed in final order.' },
      { label: 'Minimum index', text: 'The index of the smallest value found in the current unsorted suffix.' },
      { label: 'Selection', text: 'Each pass selects one minimum value for the next sorted position.' },
    ],
    memory: 'The array is sorted in place. Selection Sort uses a constant number of index and temporary variables.',
    code: selectionPythonCode,
    pythonCode: selectionPythonCode,
    javaCode: selectionJavaCode,
    pythonLineIds: selectionPythonLineIds,
    javaLineIds: selectionJavaLineIds,
    complexity: 'O(n²) time, O(1) extra space',
    bestCase: 'O(n²), including already sorted input, because every suffix is scanned',
    mistakes: 'Resetting the minimum index incorrectly or swapping before the full suffix has been scanned.',
    practice: 'Compare the number of comparisons and swaps on sorted, reverse-sorted, and duplicate-heavy arrays.',
    variableName: 'arr',
    defaultInput: [8, 3, 5, 1, 9],
  },
  'insertion-sort': {
    id: 'insertion-sort',
    title: 'Insertion Sort',
    topic: 'Arrays and Strings',
    difficulty: 'Beginner',
    summary: 'Insertion Sort grows a sorted prefix by shifting larger values right and inserting the next key in its correct position.',
    concept: 'Take each value as a key, scan left through the sorted prefix, shift every larger value one position to the right, and place the key in the gap.',
    terminology: [
      { label: 'Key', text: 'The current value being inserted into the already sorted prefix.' },
      { label: 'Shift', text: 'Move a larger prefix value one cell right to make room for the key.' },
      { label: 'Sorted prefix', text: 'The portion to the left of the current key, maintained in sorted order.' },
    ],
    memory: 'Insertion Sort rearranges the input in place and uses constant extra space for the key and indexes.',
    code: insertionPythonCode,
    pythonCode: insertionPythonCode,
    javaCode: insertionJavaCode,
    pythonLineIds: insertionPythonLineIds,
    javaLineIds: insertionJavaLineIds,
    complexity: 'O(n²) average and worst-case time, O(1) extra space',
    bestCase: 'O(n) when the input is already sorted',
    mistakes: 'Overwriting the key before it is inserted or stopping shifts before all larger values move right.',
    practice: 'Step through an almost-sorted list and count shifts; then try reverse order.',
    variableName: 'arr',
    defaultInput: [8, 3, 5, 1, 9],
  },
  'singly-linked-list': {
    id: 'singly-linked-list',
    title: 'Singly Linked List',
    topic: 'Linked Lists',
    difficulty: 'Beginner',
    summary: 'Each node points to the next node, so traversal follows pointers instead of index access.',
    concept: 'Singly linked lists store values in nodes and use next pointers to move from head to tail.',
    terminology: [
      { label: 'Head', text: 'The first node in the list.' },
      { label: 'Current', text: 'The node being visited during traversal or search.' },
      { label: 'Next', text: 'Pointer to the following node.' },
      { label: 'NULL', text: 'The end of the list.' },
    ],
    memory: 'Nodes are allocated dynamically, and each node keeps only one next pointer.',
    code: `def search_list(head, target):\n    current = head\n    while current is not None:\n        if current.value == target:\n            return current.value\n        current = current.next\n    return -1`,
    pythonCode: `def search_list(head, target):\n    current = head\n    while current is not None:\n        if current.value == target:\n            return current.value\n        current = current.next\n    return -1`,
    javaCode: `int searchList(Node head, int target) {\n    Node current = head;\n    while (current != null) {\n        if (current.value == target) {\n            return current.value;\n        }\n        current = current.next;\n    }\n    return -1;\n}`,
    pythonLineIds: [null, 'head-pointer', 'iterate', 'compare', 'return-value', 'move-next', 'return-miss', null],
    javaLineIds: [null, 'head-pointer', 'iterate', 'compare', 'return-value', 'move-next', 'return-miss', null],
    complexity: 'O(n) time, O(1) extra space',
    bestCase: 'O(1) when the target is at the head',
    mistakes: 'Forgetting to advance current or losing the head pointer while inserting.',
    practice: 'Search for a value, then insert or delete a node at different positions.',
    variableName: 'head',
    defaultInput: [10, 20, 30, 40],
    defaultTarget: 20,
  },
  'doubly-linked-list': {
    id: 'doubly-linked-list',
    title: 'Doubly Linked List',
    topic: 'Linked Lists',
    difficulty: 'Intermediate',
    summary: 'Each node stores both prev and next links, which makes forward and backward traversal possible.',
    concept: 'A doubly linked list connects nodes in both directions, so updates can move forward or backward without losing context.',
    terminology: [
      { label: 'Prev', text: 'Pointer to the previous node.' },
      { label: 'Next', text: 'Pointer to the following node.' },
      { label: 'Head', text: 'The first node in the list.' },
      { label: 'Tail', text: 'The last node in the list.' },
    ],
    memory: 'Each node stores two references, so traversal can move either direction with O(1) pointer changes.',
    code: `def search_list(head, target):\n    current = head\n    while current is not None:\n        if current.value == target:\n            return current.value\n        current = current.next\n    return -1`,
    pythonCode: `def search_list(head, target):\n    current = head\n    while current is not None:\n        if current.value == target:\n            return current.value\n        current = current.next\n    return -1`,
    javaCode: `int searchList(Node head, int target) {\n    Node current = head;\n    while (current != null) {\n        if (current.value == target) {\n            return current.value;\n        }\n        current = current.next;\n    }\n    return -1;\n}`,
    pythonLineIds: [null, 'head-pointer', 'iterate', 'compare', 'return-value', 'move-next', 'return-miss', null],
    javaLineIds: [null, 'head-pointer', 'iterate', 'compare', 'return-value', 'move-next', 'return-miss', null],
    complexity: 'O(n) time, O(1) extra space',
    bestCase: 'O(1) when the target is at the head',
    mistakes: 'Updating prev and next in the wrong order, or forgetting to reconnect the tail pointer.',
    practice: 'Walk forward and backward through a list, checking insert and delete operations.',
    variableName: 'head',
    defaultInput: [10, 20, 30, 40],
    defaultTarget: 30,
  },
  'cycle-detection': {
    id: 'cycle-detection',
    title: 'Cycle Detection',
    topic: 'Linked Lists',
    difficulty: 'Intermediate',
    summary: 'Floyd’s Cycle Detection algorithm uses two references to find a loop without storing visited nodes.',
    concept: 'SLOW advances one link and FAST advances two. In a cycle, FAST eventually catches SLOW; if FAST reaches NULL, there is no cycle.',
    terminology: [
      { label: 'SLOW', text: 'Moves to the next node once per iteration.' },
      { label: 'FAST', text: 'Moves to the next node twice per iteration.' },
      { label: 'Meeting node', text: 'The first node where SLOW and FAST have the same node ID. It is not necessarily where the cycle starts.' },
      { label: 'Cycle start', text: 'The node where the last node’s next pointer loops back into the list.' },
    ],
    memory: 'Each node has one next pointer. Floyd’s two pointer variables use O(1) extra space; no set of visited nodes is needed.',
    pythonCode: `def has_cycle(head):
    slow = head
    fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next
        fast = fast.next
        if slow is fast:
            return True
    return False`,
    javaCode: `boolean hasCycle(Node head) {
    Node slow = head;
    Node fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next;
        fast = fast.next;
        if (slow == fast) {
            return true;
        }
    }
    return false;
}`,
    pythonLineIds: [null, null, 'initialize-slow', 'initialize-fast', 'guard', 'slow-step', 'fast-step-one', 'fast-step-two', 'compare', 'return-cycle', 'no-cycle'],
    javaLineIds: [null, null, 'initialize-slow', 'initialize-fast', 'guard', 'slow-step', 'fast-step-one', 'fast-step-two', 'compare', 'return-cycle', null, null, 'no-cycle', null],
    cycleStartPythonCode: `def find_cycle_start(head, meeting):
    from_head = head
    from_meeting = meeting
    while from_head is not from_meeting:
        from_head = from_head.next
        from_meeting = from_meeting.next
    return from_head`,
    cycleStartJavaCode: `Node findCycleStart(Node head, Node meeting) {
    Node fromHead = head;
    Node fromMeeting = meeting;
    while (fromHead != fromMeeting) {
        fromHead = fromHead.next;
        fromMeeting = fromMeeting.next;
    }
    return fromHead;
}`,
    cycleStartPythonLineIds: [null, null, 'start-from-head', 'start-from-meeting', 'start-check', 'start-head-step', 'start-meeting-step', 'start-return'],
    cycleStartJavaLineIds: [null, null, 'start-from-head', 'start-from-meeting', 'start-check', 'start-head-step', 'start-meeting-step', null, 'start-return', null],
    complexity: 'O(n) time, O(1) extra space',
    bestCase: 'O(1) when FAST and SLOW meet on their first movement.',
    mistakes: 'Comparing node values instead of node identity, or assuming the first meeting node is the cycle start.',
    practice: 'Try a self-loop, a cycle at the head, a cycle in the middle, and a list with no cycle.',
    variableName: 'head',
    defaultInput: [10, 20, 30, 40, 50],
    defaultTarget: 2,
  },
  'sliding-window': {
    id: 'sliding-window',
    title: 'Sliding Window',
    topic: 'Arrays and Strings',
    difficulty: 'Advanced',
    summary: 'The window slides across the array, reshaping one element at a time to keep the current sum up to date.',
    concept: 'Instead of recomputing the sum from scratch, subtract the outgoing number and add the incoming number as the window moves right.',
    terminology: [
      { label: 'Window', text: 'A fixed segment of consecutive elements.' },
      { label: 'Left', text: 'The index of the first element in the current window.' },
      { label: 'Right', text: 'The index of the most recently added element.' },
      { label: 'Current sum', text: 'The total of all values currently inside the window.' },
    ],
    memory: 'The technique keeps a running total and updates only the entering and leaving values, which avoids repeated full-array scans.',
    code: `def max_sum_subarray(arr, k):\n    window_sum = sum(arr[:k])\n    max_sum = window_sum\n    for right in range(k, len(arr)):\n        window_sum += arr[right] - arr[right - k]\n        max_sum = max(max_sum, window_sum)\n    return max_sum`,
    pythonCode: `def max_sum_subarray(arr, k):\n    window_sum = sum(arr[:k])\n    max_sum = window_sum\n    for right in range(k, len(arr)):\n        window_sum += arr[right] - arr[right - k]\n        max_sum = max(max_sum, window_sum)\n    return max_sum`,
    javaCode: `int maxSumSubarray(int[] arr, int k) {\n    int windowSum = 0;\n    for (int i = 0; i < k; i++) {\n        windowSum += arr[i];\n    }\n    int maxSum = windowSum;\n    for (int right = k; right < arr.length; right++) {\n        windowSum += arr[right] - arr[right - k];\n        maxSum = Math.max(maxSum, windowSum);\n    }\n    return maxSum;\n}`,
    pythonLineIds: [null, 'initial-window', 'set-max', 'slide-window', 'update-window', 'update-max', 'return-max', null],
    javaLineIds: [null, 'initial-window', 'set-max', 'slide-window', 'update-window', 'update-max', 'return-max', null],
    complexity: 'O(n) time, O(1) extra space',
    bestCase: 'O(n) because the window moves across the array once',
    mistakes: 'Subtracting the wrong element when the window shifts, or forgetting to update maxSum after the new window sum is computed.',
    practice: 'Try different window sizes and arrays with negative, duplicate, and uneven values.',
    variableName: 'arr',
    defaultInput: [2, 1, 5, 1, 3, 2],
    defaultTarget: 3,
  },
  'two-pointers': {
    id: 'two-pointers',
    title: 'Two Pointers',
    topic: 'Arrays and Strings',
    difficulty: 'Intermediate',
    summary: 'Two pointers track useful positions in an array or string and move according to what each step reveals.',
    concept: 'A pointer movement is chosen from the current values and the goal—not from a pre-recorded animation.',
    terminology: [
      { label: 'Left / slow', text: 'A pointer that moves forward through the data.' },
      { label: 'Right / fast', text: 'A second pointer that may move from the opposite end or advance faster.' },
      { label: 'Decision', text: 'The comparison that determines which pointer changes next.' },
    ],
    memory: 'Most two-pointer patterns use O(1) extra space; merge and Three Sum require output/storage or sorting.',
    complexity: 'Depends on the selected pattern; commonly O(n) time and O(1) extra space.',
    practice: 'Choose a pattern, change its input, then use Next and Previous to inspect each pointer decision.',
    variableName: 'arr',
    defaultInput: [1, 2, 3, 4, 6, 8],
    defaultTarget: 10,
  },
};

const slidingCodeLines = {
  fixed: {
    python: [['setup', 'def max_sum_subarray(arr, k):'], ['initial-window', '    window_sum = sum(arr[:k])'], ['set-max', '    max_sum = window_sum'], ['slide-window', '    for right in range(k, len(arr)):'], ['update-window', '        window_sum += arr[right] - arr[right - k]'], ['update-max', '        max_sum = max(max_sum, window_sum)'], ['return-max', '    return max_sum']],
    java: [['setup', 'int maxSumSubarray(int[] arr, int k) {'], ['initial-window', '    int windowSum = 0; for (int i = 0; i < k; i++) windowSum += arr[i];'], ['set-max', '    int maxSum = windowSum;'], ['slide-window', '    for (int right = k; right < arr.length; right++) {'], ['update-window', '        windowSum += arr[right] - arr[right - k];'], ['update-max', '        maxSum = Math.max(maxSum, windowSum);'], ['return-max', '    return maxSum;'], [null, '}']],
  },
  minimum: {
    python: [['setup', 'def min_subarray_len(target, arr):'], ['left-start', '    left = 0'], ['sum-start', '    current_sum = 0'], ['best-start', '    best = float("inf")'], ['expand', '    for right, value in enumerate(arr):'], ['add', '        current_sum += value'], ['shrink-check', '        while current_sum >= target:'], ['record', '            best = min(best, right - left + 1)'], ['remove', '            current_sum -= arr[left]'], ['move-left', '            left += 1'], ['return', '    return 0 if best == float("inf") else best']],
    java: [['setup', 'int minSubarrayLen(int target, int[] arr) {'], ['left-start', '    int left = 0;'], ['sum-start', '    int currentSum = 0;'], ['best-start', '    int best = Integer.MAX_VALUE;'], ['expand', '    for (int right = 0; right < arr.length; right++) {'], ['add', '        currentSum += arr[right];'], ['shrink-check', '        while (currentSum >= target) {'], ['record', '            best = Math.min(best, right - left + 1);'], ['remove', '            currentSum -= arr[left];'], ['move-left', '            left++;'], ['return', '    return best == Integer.MAX_VALUE ? 0 : best;'], [null, '}']],
  },
  substring: {
    python: [['setup', 'def longest_unique(text):'], ['left-start', '    left = 0'], ['seen-start', '    last_seen = {}'], ['best-start', '    best = 0'], ['expand', '    for right, char in enumerate(text):'], ['duplicate', '        if char in last_seen and last_seen[char] >= left:'], ['shrink', '            left = last_seen[char] + 1'], ['remember', '        last_seen[char] = right'], ['record', '        best = max(best, right - left + 1)'], ['return', '    return best']],
    java: [['setup', 'int longestUnique(String text) {'], ['left-start', '    int left = 0, best = 0;'], ['seen-start', '    Map<Character, Integer> lastSeen = new HashMap<>();'], ['best-start', '    for (int right = 0; right < text.length(); right++) {'], ['expand', '        char ch = text.charAt(right);'], ['duplicate', '        if (lastSeen.containsKey(ch) && lastSeen.get(ch) >= left) {'], ['shrink', '            left = lastSeen.get(ch) + 1;'], ['remember', '        lastSeen.put(ch, right);'], ['record', '        best = Math.max(best, right - left + 1);'], ['return', '    return best;'], [null, '}']],
  },
};

const pointerComplexity = {
  'two-sum': 'O(n) time, O(1) extra space',
  'reverse-array': 'O(n) time, O(1) extra space',
  'reverse-string': 'O(n) time, O(n) extra space to represent mutable characters',
  palindrome: 'O(n) time, O(1) extra space',
  'remove-duplicates': 'O(n) time, O(n) space for the returned compacted array',
  'move-zeroes': 'O(n) time, O(1) extra space',
  'container-water': 'O(n) time, O(1) extra space',
  merge: 'O(n + m) time, O(n + m) output space',
  'three-sum': 'O(n²) time after sorting, O(n) auxiliary space for sorting',
  'fast-slow': 'O(n) time, O(1) extra space',
};

const pointerLearningContent = {
  'two-sum': {
    concept: 'Start at both ends of a sorted array. A small sum means the LEFT value must grow; a large sum means the RIGHT value must shrink.',
    bestCase: 'O(1) when the first pair matches the target.',
    mistakes: 'Moving the wrong pointer or using this two-ended method on an unsorted array.',
  },
  'reverse-array': {
    concept: 'Swap the first and last values, then move both pointers toward the center until they meet.',
    bestCase: 'O(n) because each value is visited at most once.',
    mistakes: 'Continuing after the pointers meet or swapping only one side.',
  },
  'reverse-string': {
    concept: 'Treat each character as an array element and exchange characters from the outside inward.',
    bestCase: 'O(n), with a mutable character representation.',
    mistakes: 'Moving a pointer in the wrong direction or stopping before the center.',
  },
  palindrome: {
    concept: 'Compare characters at opposite ends. Any mismatch proves the text is not a palindrome.',
    bestCase: 'O(1) when the first pair of characters differs.',
    mistakes: 'Comparing adjacent characters instead of the matching positions at both ends.',
  },
  'remove-duplicates': {
    concept: 'FAST scans the sorted values; SLOW marks where the next distinct value belongs.',
    bestCase: 'O(n), scanning the array once.',
    mistakes: 'Using this adjacent-duplicate approach on unsorted data.',
  },
  'move-zeroes': {
    concept: 'FAST scans every value, while SLOW marks the next position for a non-zero value.',
    bestCase: 'O(n), scanning once while keeping non-zero values in order.',
    mistakes: 'Advancing SLOW for a zero or changing the order of non-zero values.',
  },
  'container-water': {
    concept: 'The water area depends on the shorter wall and the distance between walls. Move the shorter wall to seek a taller one.',
    bestCase: 'O(n), with one inward scan.',
    mistakes: 'Moving the taller wall, which cannot improve the limiting height while width shrinks.',
  },
  merge: {
    concept: 'Compare the first unmerged value in each sorted array and append the smaller one.',
    bestCase: 'O(n + m), visiting each value once.',
    mistakes: 'Advancing the pointer for the array whose value was not appended.',
  },
  'three-sum': {
    concept: 'Sort the values, fix one anchor, then use LEFT and RIGHT to find pairs for the remaining target.',
    bestCase: 'O(n²) after sorting.',
    mistakes: 'Repeating duplicate anchors or moving the pointer in the wrong direction.',
  },
  'fast-slow': {
    concept: 'FAST moves two positions while SLOW moves one. When FAST reaches the end, SLOW is at the middle.',
    bestCase: 'O(n), with one traversal.',
    mistakes: 'Moving FAST only one position or using an incorrect stopping condition.',
  },
};

const slidingComplexity = {
  fixed: 'O(n) time, O(1) extra space',
  minimum: 'O(n) time, O(1) extra space',
  substring: 'O(n) time, O(min(n, character set)) extra space',
};

const slidingLearningContent = {
  fixed: {
    concept: 'Keep exactly k consecutive values in the window. When it slides, subtract the outgoing value and add the incoming value.',
    bestCase: 'O(n), regardless of the fixed window length after its initial sum.',
    mistakes: 'Subtracting the wrong outgoing value or forgetting to compare each new sum with the maximum.',
  },
  minimum: {
    concept: 'Expand RIGHT until the positive-value window reaches its target. Then shrink LEFT to find the shortest valid window.',
    bestCase: 'O(n), because each pointer only moves forward.',
    mistakes: 'Applying this shrink rule to negative values, which can make a smaller window sum unpredictable.',
  },
  substring: {
    concept: 'Grow a character window with RIGHT. When a character repeats inside it, move LEFT past its previous occurrence.',
    bestCase: 'O(n), with each character processed once.',
    mistakes: 'Moving LEFT backward or shrinking past a duplicate that is already outside the window.',
  },
};

export function getLessonDefinition(lessonId = 'bubble-sort', variant) {
  const lesson = lessonLibrary[lessonId];
  if (!lesson) return null;
  if (lessonId === 'cycle-detection' && variant === 'find-start') {
    return {
      ...lesson,
      pythonCode: lesson.cycleStartPythonCode,
      javaCode: lesson.cycleStartJavaCode,
      pythonLineIds: lesson.cycleStartPythonLineIds,
      javaLineIds: lesson.cycleStartJavaLineIds,
      complexity: 'O(n) additional time, O(1) extra space',
      summary: 'After the first meeting, reset one pointer to HEAD. Move both one link at a time; their next meeting is the cycle start.',
      concept: 'The distance from HEAD to the cycle entrance equals the distance from the first meeting point to that entrance when moving around the cycle.',
    };
  }
  if (lessonId === 'two-pointers' && pointerCodeLines[variant]) {
    return {
      ...lesson,
      ...pointerLearningContent[variant],
      summary: pointerLearningContent[variant].concept,
      complexity: pointerComplexity[variant],
      ...codeDefinition(pointerCodeLines[variant]),
    };
  }
  if (lessonId === 'sliding-window' && slidingCodeLines[variant]) {
    return {
      ...lesson,
      ...slidingLearningContent[variant],
      summary: slidingLearningContent[variant].concept,
      complexity: slidingComplexity[variant],
      ...codeDefinition(slidingCodeLines[variant]),
    };
  }
  return lesson;
}

export function isAlgorithmImplemented(lessonId) {
  return Object.hasOwn(lessonLibrary, lessonId);
}

export function parseIntegerArray(value) {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      throw new Error('Enter at least one integer separated by commas.');
    }
    return value.map((item) => parseInteger(item, 'Each value'));
  }

  const text = typeof value === 'string' ? value : value == null ? '' : String(value);
  if (!text.trim()) {
    throw new Error('Enter at least one integer separated by commas.');
  }

  const tokens = text.split(',');
  const values = tokens.map((token) => {
    const trimmedToken = token.trim();
    if (!/^[+-]?\d+$/.test(trimmedToken)) {
      throw new Error('Use comma-separated whole numbers only (for example: 12, 4, -3).');
    }
    const number = Number(trimmedToken);
    if (!Number.isSafeInteger(number)) {
      throw new Error('Each value must be a safe integer.');
    }
    return number;
  });

  return values;
}

export function parseInteger(value, label = 'Target') {
  const text = typeof value === 'string' ? value : value == null ? '' : String(value);
  const trimmed = text.trim();
  if (!/^[+-]?\d+$/.test(trimmed) || !Number.isSafeInteger(Number(trimmed))) {
    throw new Error(`${label} must be a whole safe integer.`);
  }
  return Number(trimmed);
}

function validateIntegerArray(input) {
  if (!Array.isArray(input) || input.some((value) => !Number.isSafeInteger(value))) {
    throw new Error('Input must be an array of safe integers.');
  }
}

function assertSafeInteger(value, label) {
  if (!Number.isSafeInteger(value)) {
    throw new Error(`${label} exceeds the safe integer range.`);
  }
  return value;
}

function createTraceRecorder(steps, array, getMetrics) {
  return (event) => {
    steps.push({
      step: steps.length + 1,
      array: [...array],
      i: null,
      j: null,
      low: null,
      high: null,
      mid: null,
      compared: [],
      swappedIndices: [],
      ...event,
      lineIds: event.lineIds ?? [],
      metrics: getMetrics(),
    });
  };
}

export function createBubbleSortSteps(input) {
  validateIntegerArray(input);
  const array = [...input];
  const steps = [];
  let comparisons = 0;
  let swaps = 0;
  const record = createTraceRecorder(steps, array, () => ({ comparisons, swaps }));

  record({
    lineIds: ['initialize-length'],
    operation: `Initialize n = ${array.length}`,
    explanation: `The algorithm starts with ${array.length} ${array.length === 1 ? 'value' : 'values'} in the input array.`,
  });

  for (let i = 0; i < array.length - 1; i += 1) {
    let swapped = false;
    record({
      i,
      swapped,
      lineIds: ['outer-loop', 'reset-swapped', 'inner-loop'],
      operation: `Start pass ${i + 1}`,
      explanation: `Start pass ${i + 1}; swapped is false and the unsorted section ends at index ${array.length - i - 1}.`,
    });

    for (let j = 0; j < array.length - i - 1; j += 1) {
      const leftValue = array[j];
      const rightValue = array[j + 1];
      const shouldSwap = leftValue > rightValue;
      comparisons += 1;

      record({
        i,
        j,
        swapped,
        compared: [j, j + 1],
        leftValue,
        rightValue,
        comparisonResult: shouldSwap,
        lineIds: ['compare'],
        operation: `Compare ${leftValue} > ${rightValue}: ${shouldSwap}`,
        explanation: shouldSwap
          ? `${leftValue} is greater than ${rightValue}, so this adjacent pair is out of order.`
          : `${leftValue} is not greater than ${rightValue}, so this pair stays in place.`,
      });

      if (shouldSwap) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        swaps += 1;
        swapped = true;
        record({
          i,
          j,
          swapped,
          compared: [j, j + 1],
          swappedIndices: [j, j + 1],
          leftValue,
          rightValue,
          lineIds: ['swap', 'mark-swapped'],
          operation: `Swap ${leftValue} and ${rightValue}`,
          explanation: `${leftValue} and ${rightValue} exchange places; the array now records the result of this swap.`,
        });
      }
    }

    record({
      i,
      swapped,
      lineIds: ['check-early-stop'],
      operation: `Pass ${i + 1} finished; swapped = ${swapped}`,
      explanation: swapped
        ? 'At least one swap occurred, so another pass is needed.'
        : 'No swap occurred in this pass, so the array is sorted and the algorithm can stop.',
    });

    if (!swapped) {
      record({
        i,
        lineIds: ['break'],
        operation: 'Stop early',
        explanation: 'The no-swap condition is true, so the loop exits early.',
      });
      break;
    }
  }

  record({
    lineIds: ['return-result'],
    operation: `Sorted result: [${array.join(', ')}]`,
    explanation: `The algorithm returns [${array.join(', ')}].`,
    result: [...array],
    complete: true,
  });

  return steps;
}

export function createBinarySearchSteps(input, target) {
  validateIntegerArray(input);
  if (!Number.isSafeInteger(target)) {
    throw new Error('Target must be a safe integer.');
  }
  if (input.some((value, index) => index > 0 && input[index - 1] > value)) {
    throw new Error('Binary Search requires the input array to be sorted in ascending order.');
  }

  const array = [...input];
  const steps = [];
  let comparisons = 0;
  let low = 0;
  let high = array.length - 1;
  let foundIndex = -1;
  const record = createTraceRecorder(steps, array, () => ({ comparisons }));

  record({
    low,
    high,
    lineIds: ['initialize-low', 'initialize-high'],
    operation: `Initialize low = ${low}, high = ${high}`,
    explanation: `The search range begins at indexes ${low} through ${high}.`,
    target,
  });

  while (low <= high) {
    record({
      low,
      high,
      target,
      rangeCondition: true,
      lineIds: ['check-range'],
      operation: `Search range ${low} through ${high} is active`,
      explanation: `low (${low}) is less than or equal to high (${high}), so the range is not empty.`,
    });

    const mid = Math.floor((low + high) / 2);
    const midValue = array[mid];
    record({
      low,
      high,
      mid,
      target,
      midValue,
      lineIds: ['calculate-mid'],
      operation: `Calculate mid = ${mid}`,
      explanation: `The midpoint of indexes ${low} through ${high} is index ${mid}.`,
    });

    comparisons += 1;
    const matches = midValue === target;
    record({
      low,
      high,
      mid,
      target,
      midValue,
      compared: [mid],
      comparisonResult: matches,
      lineIds: ['compare-equal'],
      operation: `Compare ${midValue} === ${target}: ${matches}`,
      explanation: matches
        ? `The midpoint value ${midValue} matches the target ${target}.`
        : `The midpoint value ${midValue} does not match the target ${target}.`,
    });

    if (matches) {
      foundIndex = mid;
      record({
        low,
        high,
        mid,
        target,
        midValue,
        lineIds: ['return-found'],
        operation: `Found ${target} at index ${mid}`,
        explanation: `The algorithm returns index ${mid}.`,
        result: foundIndex,
        complete: true,
      });
      return steps;
    }

    comparisons += 1;
    const targetIsGreater = midValue < target;
    record({
      low,
      high,
      mid,
      target,
      midValue,
      compared: [mid],
      comparisonResult: targetIsGreater,
      lineIds: ['compare-less'],
      operation: `Compare ${midValue} < ${target}: ${targetIsGreater}`,
      explanation: targetIsGreater
        ? `${target} is greater than ${midValue}, so only the right half can contain it.`
        : `${target} is less than ${midValue}, so only the left half can contain it.`,
    });

    if (targetIsGreater) {
      low = mid + 1;
      record({
        low,
        high,
        mid,
        target,
        lineIds: ['move-low'],
        operation: `Move low to ${low}`,
        explanation: `Discard indexes through ${mid}; the next search begins at index ${low}.`,
      });
    } else {
      high = mid - 1;
      record({
        low,
        high,
        mid,
        target,
        lineIds: ['move-high'],
        operation: `Move high to ${high}`,
        explanation: `Discard indexes from ${mid} onward; the next search ends at index ${high}.`,
      });
    }
  }

  record({
    low,
    high,
    target,
    rangeCondition: false,
    lineIds: ['check-range', 'return-not-found'],
    operation: `${target} is not present`,
    explanation: `The search range is empty (low ${low} is greater than high ${high}), so the algorithm returns -1.`,
    result: foundIndex,
    complete: true,
  });

  return steps;
}

export function createLinearSearchSteps(input, target) {
  validateIntegerArray(input);
  if (!Number.isSafeInteger(target)) {
    throw new Error('Target must be a safe integer.');
  }

  const array = [...input];
  const steps = [];
  let comparisons = 0;
  const record = createTraceRecorder(steps, array, () => ({ comparisons }));

  for (let i = 0; i < array.length; i += 1) {
    const value = array[i];
    comparisons += 1;
    const matches = value === target;
    record({
      i,
      target,
      currentValue: value,
      compared: [i],
      comparisonResult: matches,
      lineIds: ['loop', 'compare'],
      operation: `Compare arr[${i}] = ${value} with target ${target}: ${matches}`,
      explanation: matches
        ? `${value} matches the target. Because the scan moves left to right, index ${i} is the first matching position.`
        : `${value} does not match the target, so continue to the next index.`,
    });

    if (matches) {
      record({
        i,
        target,
        currentValue: value,
        lineIds: ['return-found'],
        operation: `Found ${target} at index ${i}`,
        explanation: `Return index ${i}, the first position containing ${target}.`,
        result: i,
        complete: true,
      });
      return steps;
    }
  }

  record({
    target,
    lineIds: ['return-not-found'],
    operation: `${target} is not present`,
    explanation: `Every element was checked and none matched ${target}, so the algorithm returns -1.`,
    result: -1,
    complete: true,
  });
  return steps;
}

export function createSelectionSortSteps(input) {
  validateIntegerArray(input);
  const array = [...input];
  const steps = [];
  let comparisons = 0;
  let swaps = 0;
  const record = createTraceRecorder(steps, array, () => ({ comparisons, swaps }));

  record({ lineIds: ['initialize-length'], operation: `Initialize n = ${array.length}`, explanation: `Selection Sort will place ${array.length} values in ascending order.` });

  for (let i = 0; i < array.length; i += 1) {
    let minIndex = i;
    record({ i, minIndex, lineIds: ['outer-loop', 'initialize-min'], operation: `Start pass at index ${i}`, explanation: `Assume index ${i} is the minimum of the unsorted suffix.` });

    for (let j = i + 1; j < array.length; j += 1) {
      const currentValue = array[j];
      const minimumValue = array[minIndex];
      const isNewMinimum = currentValue < minimumValue;
      comparisons += 1;
      record({
        i, j, minIndex, compared: [j, minIndex], currentValue, minimumValue,
        comparisonResult: isNewMinimum,
        lineIds: ['inner-loop', 'compare'],
        operation: `Compare ${currentValue} < ${minimumValue}: ${isNewMinimum}`,
        explanation: isNewMinimum ? `${currentValue} is the smallest value seen in this suffix so far.` : `${currentValue} is not smaller than the current minimum ${minimumValue}.`,
      });

      if (isNewMinimum) {
        minIndex = j;
        record({ i, j, minIndex, lineIds: ['update-min'], operation: `Update minimum index to ${minIndex}`, explanation: `Remember index ${minIndex} as the new minimum candidate.` });
      }
    }

    record({ i, minIndex, lineIds: ['check-swap'], operation: minIndex === i ? 'Minimum is already in place' : `Place minimum at index ${i}`, explanation: minIndex === i ? `The value at index ${i} is already the smallest in the remaining suffix.` : `Swap the suffix minimum at index ${minIndex} into the next sorted position ${i}.` });
    if (minIndex !== i) {
      [array[i], array[minIndex]] = [array[minIndex], array[i]];
      swaps += 1;
      record({ i, minIndex, swappedIndices: [i, minIndex], lineIds: ['swap'], operation: `Swap indexes ${i} and ${minIndex}`, explanation: `The smallest remaining value is now fixed at index ${i}.` });
    }
  }

  record({ lineIds: ['return-result'], operation: `Sorted result: [${array.join(', ')}]`, explanation: `The array is sorted in ascending order: [${array.join(', ')}].`, result: [...array], complete: true });
  return steps;
}

export function createInsertionSortSteps(input) {
  validateIntegerArray(input);
  const array = [...input];
  const steps = [];
  let comparisons = 0;
  let shifts = 0;
  const record = createTraceRecorder(steps, array, () => ({ comparisons, shifts }));

  for (let i = 1; i < array.length; i += 1) {
    const key = array[i];
    let j = i - 1;
    record({ i, key, j, lineIds: ['outer-loop', 'set-key', 'initialize-j'], operation: `Take ${key} as the key`, explanation: `The prefix before index ${i} is sorted. Insert key ${key} into that prefix.` });

    while (j >= 0) {
      const currentValue = array[j];
      const shouldShift = currentValue > key;
      comparisons += 1;
      record({ i, j, key, currentValue, compared: [j], comparisonResult: shouldShift, lineIds: ['compare'], operation: `Compare ${currentValue} > ${key}: ${shouldShift}`, explanation: shouldShift ? `${currentValue} is larger than the key, so it must shift one position right.` : `${currentValue} is not larger than the key; the key belongs immediately after it.` });
      if (!shouldShift) break;

      array[j + 1] = array[j];
      shifts += 1;
      record({ i, j, key, shiftedValue: array[j + 1], compared: [j, j + 1], lineIds: ['shift'], operation: `Shift ${array[j]} from index ${j} to ${j + 1}`, explanation: `Move ${array[j]} right to open a position for key ${key}.` });
      j -= 1;
      record({ i, j, key, lineIds: ['decrement-j'], operation: `Move j to ${j}`, explanation: `Continue checking left; the key will be inserted at index ${j + 1} when shifting stops.` });
    }

    array[j + 1] = key;
    record({ i, j, key, insertedAt: j + 1, lineIds: ['insert-key'], operation: `Insert key ${key} at index ${j + 1}`, explanation: `The sorted prefix now includes key ${key} at index ${j + 1}.` });
  }

  record({ lineIds: ['return-result'], operation: `Sorted result: [${array.join(', ')}]`, explanation: `The array is sorted in ascending order: [${array.join(', ')}].`, result: [...array], complete: true });
  return steps;
}

export function createSinglyLinkedListSteps(input, target) {
  validateIntegerArray(input);
  if (!Number.isSafeInteger(target)) {
    throw new Error('Target must be a safe integer.');
  }

  const nodes = input.map((value, index) => ({
    id: index,
    value,
    nextValue: index < input.length - 1 ? input[index + 1] : null,
    prevValue: index > 0 ? input[index - 1] : null,
  }));
  const steps = [];
  const record = (event) => {
    steps.push({
      step: steps.length + 1,
      array: [...input],
      nodes: nodes.map((node) => ({ ...node })),
      headIndex: 0,
      currentIndex: null,
      target,
      ...event,
      metrics: { comparisons: steps.length },
    });
  };

  record({
    lineIds: ['head-pointer'],
    operation: 'Initialize head at index 0',
    explanation: 'The head points to the first node in the list.',
    currentIndex: 0,
  });

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    record({
      lineIds: ['iterate', 'compare'],
      currentIndex: index,
      visitValue: node.value,
      operation: `Visit node ${index} with value ${node.value}`,
      explanation: `Current is now at index ${index}. We compare ${node.value} with the target ${target}.`,
    });

    if (node.value === target) {
      record({
        lineIds: ['return-value'],
        currentIndex: index,
        result: node.value,
        complete: true,
        operation: `Found ${target} at index ${index}`,
        explanation: `The value ${target} matches the current node, so traversal stops and returns it.`,
      });
      return steps;
    }

    record({
      lineIds: ['move-next'],
      currentIndex: index,
      operation: `Move current to the next node`,
      explanation: `The current node does not match the target, so we follow the next pointer to the next node.`,
    });
  }

  record({
    lineIds: ['return-miss'],
    currentIndex: null,
    result: -1,
    complete: true,
    operation: `${target} was not found in the list`,
    explanation: 'Traversal reached the end of the list without finding the target, so the function returns -1.',
  });

  return steps;
}

export function createDoublyLinkedListSteps(input, target) {
  validateIntegerArray(input);
  if (!Number.isSafeInteger(target)) {
    throw new Error('Target must be a safe integer.');
  }

  const nodes = input.map((value, index) => ({
    id: index,
    value,
    nextValue: index < input.length - 1 ? input[index + 1] : null,
    prevValue: index > 0 ? input[index - 1] : null,
  }));
  const steps = [];

  const record = (event) => {
    steps.push({
      step: steps.length + 1,
      array: [...input],
      nodes: nodes.map((node) => ({ ...node })),
      headIndex: 0,
      currentIndex: null,
      target,
      ...event,
      metrics: { comparisons: steps.length },
    });
  };

  record({
    lineIds: ['head-pointer'],
    operation: 'Initialize head and tail',
    explanation: 'The head starts at the first node and the tail ends at the last node.',
    currentIndex: 0,
  });

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    record({
      lineIds: ['iterate', 'compare'],
      currentIndex: index,
      visitValue: node.value,
      operation: `Visit node ${index} with value ${node.value}`,
      explanation: `We check the current node and compare ${node.value} with the target ${target}.`,
    });

    if (node.value === target) {
      record({
        lineIds: ['return-value'],
        currentIndex: index,
        result: node.value,
        complete: true,
        operation: `Found ${target} at index ${index}`,
        explanation: `The node at index ${index} matches the target, so the search returns that value.`,
      });
      return steps;
    }

    record({
      lineIds: ['move-next'],
      currentIndex: index,
      operation: `Move current to the next node`,
      explanation: `This node is not the target, so we follow the next pointer toward the right.`,
    });
  }

  record({
    lineIds: ['return-miss'],
    currentIndex: null,
    result: -1,
    complete: true,
    operation: `${target} was not found in the doubly linked list`,
    explanation: 'The list ended without finding the target, so the function returns -1.',
  });

  return steps;
}

function createCycleNodes(input, cycleStartIndex) {
  return input.map((value, id) => ({
    id,
    value,
    nextId: id < input.length - 1 ? id + 1 : cycleStartIndex,
  }));
}

export function createCycleDetectionSteps(input, cycleStartIndex = null) {
  validateIntegerArray(input);
  if (cycleStartIndex !== null && (!Number.isSafeInteger(cycleStartIndex) || cycleStartIndex < 0 || cycleStartIndex >= input.length)) {
    throw new Error('Cycle start must be a valid node index, or no cycle must be selected.');
  }
  const nodes = createCycleNodes(input, cycleStartIndex);
  const steps = [];
  let slowId = nodes.length ? 0 : null;
  let fastId = nodes.length ? 0 : null;
  let iteration = 0;
  let cycleDetected = false;
  const record = (event) => {
    const previous = steps.at(-1);
    const slowNode = nodes.find((node) => node.id === slowId);
    const fastNode = nodes.find((node) => node.id === fastId);
    const fastNextNode = fastNode ? nodes.find((node) => node.id === fastNode.nextId) : null;
    const pointerChange = (label, before, after) => before === after
      ? null
      : `${label} ${after === null ? 'reached NULL' : `moved to node ${after} (value ${input[after]})`}`;
    const changes = previous
      ? [pointerChange('SLOW', previous.slowId, slowId), pointerChange('FAST', previous.fastId, fastId)].filter(Boolean)
      : ['SLOW and FAST both start at HEAD.'];
    steps.push({
      step: steps.length + 1,
      array: [...input],
      nodes: nodes.map((node) => ({ ...node })),
      headId: nodes.length ? 0 : null,
      slowId,
      fastId,
      slowNextId: slowNode?.nextId ?? null,
      fastNextId: fastNode?.nextId ?? null,
      fastNextNextId: fastNextNode?.nextId ?? null,
      iteration,
      cycleDetected,
      phase: 'detect',
      lineIds: [],
      ...event,
      change: event.change ?? (changes.length ? changes.join('; ') : event.operation),
      metrics: { iterations: iteration },
    });
  };
  const finishNoCycle = (lineIds, operation, explanation) => {
    record({
      lineIds,
      operation,
      explanation,
      decision: 'FAST reached NULL. No cycle exists.',
      complete: true,
      result: { cycleDetected: false, meetingNodeId: null, cycleStartIndex: null },
    });
    return steps;
  };

  record({
    lineIds: ['initialize-slow', 'initialize-fast'],
    operation: nodes.length ? 'Set SLOW and FAST to HEAD' : 'HEAD is NULL',
    explanation: nodes.length
      ? `Both pointer variables start at HEAD (node 0, value ${input[0]}). SLOW will move one link and FAST two links per iteration.`
      : 'An empty list has no nodes; FAST is already NULL, so there cannot be a cycle.',
    decision: nodes.length ? 'Check whether FAST can safely move two links.' : 'No cycle exists in an empty list.',
    complete: nodes.length === 0,
    result: nodes.length === 0 ? { cycleDetected: false, meetingNodeId: null, cycleStartIndex: null } : undefined,
  });
  if (!nodes.length) return steps;

  while (fastId !== null && nodes[fastId]?.nextId !== null) {
    iteration += 1;
    record({
      lineIds: ['guard'],
      operation: `Iteration ${iteration}: check FAST can move two links`,
      explanation: `FAST is at node ${fastId}; its next link exists, so both pointers can advance.`,
      decision: 'Move SLOW once and FAST twice.',
    });

    slowId = nodes[slowId].nextId;
    record({
      lineIds: ['slow-step'],
      operation: `SLOW moves to node ${slowId}`,
      explanation: `SLOW follows one next link to node ${slowId} (value ${input[slowId]}).`,
      decision: 'FAST now takes its first of two hops.',
    });

    fastId = nodes[fastId].nextId;
    record({
      lineIds: ['fast-step-one'],
      operation: `FAST hop 1 reaches node ${fastId}`,
      explanation: `FAST follows its first next link to node ${fastId} (value ${input[fastId]}).`,
      decision: 'FAST takes its second hop.',
    });

    fastId = nodes[fastId].nextId;
    record({
      lineIds: ['fast-step-two'],
      operation: fastId === null ? 'FAST hop 2 reaches NULL' : `FAST hop 2 reaches node ${fastId}`,
      explanation: fastId === null
        ? 'FAST follows the second next link and reaches NULL, which proves the list ends without a cycle.'
        : `FAST follows its second next link to node ${fastId} (value ${input[fastId]}).`,
      decision: fastId === null ? 'FAST reached NULL; stop without a cycle.' : 'Compare the node identities, not their values.',
    });
    if (fastId === null) {
      cycleDetected = false;
      return finishNoCycle(['guard', 'no-cycle'], 'FAST reached NULL — no cycle', 'FAST reached NULL on its second hop. The next pointer chain ends, so SLOW and FAST cannot meet in a loop.');
    }

    const met = slowId === fastId;
    record({
      lineIds: ['compare', ...(met ? ['return-cycle'] : [])],
      comparedIds: [slowId, fastId],
      match: met,
      decision: met ? `Cycle detected at meeting node ${slowId}.` : 'They are different nodes; continue to the next iteration.',
      operation: met ? `SLOW and FAST meet at node ${slowId}` : `Compare node ${slowId} with node ${fastId}: not the same node`,
      explanation: met
        ? `Both pointers refer to node ID ${slowId} (value ${input[slowId]}). Meeting by identity proves there is a cycle.`
        : `The node IDs differ (${slowId} and ${fastId}), even if two nodes happen to contain the same value. Continue moving.`,
      complete: met,
      ...(met ? {
        result: { cycleDetected: true, meetingNodeId: slowId, cycleStartIndex: null },
        meetingNodeId: slowId,
        cycleDetected: true,
      } : {}),
    });
    if (met) return steps;
  }

  cycleDetected = false;
  return finishNoCycle(
    ['guard', 'no-cycle'],
    'FAST cannot move two links — no cycle',
    'FAST or FAST.next is NULL. The list ends before the pointers can meet, so there is no cycle.',
  );
}

export function createCycleStartSteps(input, cycleStartIndex, meetingNodeId) {
  validateIntegerArray(input);
  if (!Number.isSafeInteger(cycleStartIndex) || cycleStartIndex < 0 || cycleStartIndex >= input.length
    || !Number.isSafeInteger(meetingNodeId) || meetingNodeId < 0 || meetingNodeId >= input.length) {
    throw new Error('A valid cycle start and first meeting node are required.');
  }
  const nodes = createCycleNodes(input, cycleStartIndex);
  if (nodes.at(-1)?.nextId === null || meetingNodeId < cycleStartIndex) {
    throw new Error('The meeting node must be inside the selected cycle.');
  }
  const steps = [];
  let fromHead = 0;
  let fromMeeting = meetingNodeId;
  let iteration = 0;
  const record = (event) => {
    const previous = steps.at(-1);
    steps.push({
      step: steps.length + 1,
      array: [...input],
      nodes: nodes.map((node) => ({ ...node })),
      headId: 0,
      slowId: fromHead,
      fastId: fromMeeting,
      slowNextId: nodes[fromHead]?.nextId ?? null,
      fastNextId: nodes[fromMeeting]?.nextId ?? null,
      iteration,
      cycleDetected: true,
      phase: 'find-start',
      lineIds: [],
      ...event,
      change: event.change ?? (previous
        ? [
            previous.slowId !== fromHead ? `HEAD pointer moved to node ${fromHead} (value ${input[fromHead]})` : null,
            previous.fastId !== fromMeeting ? `Meeting pointer moved to node ${fromMeeting} (value ${input[fromMeeting]})` : null,
          ].filter(Boolean).join('; ') || event.operation
        : 'Reset one pointer to HEAD and keep the other at the first meeting node.'),
      metrics: { iterations: iteration },
    });
  };

  record({
    lineIds: ['start-from-head', 'start-from-meeting'],
    meetingNodeId,
    operation: `Reset SLOW to HEAD; keep FAST at meeting node ${meetingNodeId}`,
    explanation: `The first meeting was at node ${meetingNodeId}, but it may not be the cycle entrance. Start one pointer at HEAD and keep the other at this meeting node.`,
    decision: 'Move both pointers one next link at a time.',
  });
  while (fromHead !== fromMeeting) {
    iteration += 1;
    if (iteration > input.length + 1) {
      throw new Error('The meeting node must be inside the selected cycle and reachable from the list head.');
    }
    record({
      lineIds: ['start-check'],
      operation: `Cycle-start search iteration ${iteration}`,
      explanation: `The pointers are at different node IDs (${fromHead} and ${fromMeeting}).`,
      decision: 'Advance the HEAD pointer one link.',
    });
    fromHead = nodes[fromHead].nextId;
    record({
      lineIds: ['start-head-step'],
      operation: `HEAD pointer moves to node ${fromHead}`,
      explanation: `This pointer advances one link from HEAD-side node to node ${fromHead}.`,
      decision: 'Advance the meeting-side pointer one link.',
    });
    fromMeeting = nodes[fromMeeting].nextId;
    record({
      lineIds: ['start-meeting-step'],
      operation: `Meeting pointer moves to node ${fromMeeting}`,
      explanation: `The meeting-side pointer also advances exactly one link to node ${fromMeeting}.`,
      decision: fromHead === fromMeeting ? 'The pointers have reached the cycle entrance.' : 'Compare node IDs; if they differ, move both again.',
    });
  }
  record({
    lineIds: ['start-check', 'start-return'],
    meetingNodeId,
    cycleStartNodeId: fromHead,
    match: true,
    operation: `Cycle starts at node ${fromHead} (value ${input[fromHead]})`,
    explanation: `The pointers now meet at node ID ${fromHead}. This is the cycle entrance, distinct from the first meeting at node ${meetingNodeId}.`,
    decision: `Cycle start is node ${fromHead}, value ${input[fromHead]}.`,
    result: { cycleDetected: true, meetingNodeId, cycleStartIndex: fromHead },
    complete: true,
  });
  return steps;
}

export function createTwoPointerSteps(pattern, input, target, secondaryInput = []) {
  const stringPattern = pattern === 'reverse-string' || pattern === 'palindrome';
  if (stringPattern && typeof input !== 'string') {
    throw new Error('This pattern expects text input.');
  }
  const values = stringPattern ? [...input] : input;
  if (!stringPattern) validateIntegerArray(values);
  if (['two-sum', 'three-sum'].includes(pattern) && !Number.isSafeInteger(target)) {
    throw new Error('Target must be a safe integer.');
  }
  if (pattern === 'two-sum' && values.some((value, index) => index > 0 && values[index - 1] > value)) {
    throw new Error('Two Sum requires values sorted in ascending order.');
  }
  if (pattern === 'remove-duplicates' && values.some((value, index) => index > 0 && values[index - 1] > value)) {
    throw new Error('Remove Duplicates requires values sorted in ascending order.');
  }
  if (pattern === 'container-water' && values.some((value) => value < 0)) {
    throw new Error('Container heights must be non-negative.');
  }
  if (pattern === 'merge') {
    validateIntegerArray(secondaryInput);
    if (values.some((value, index) => index > 0 && values[index - 1] > value)
      || secondaryInput.some((value, index) => index > 0 && secondaryInput[index - 1] > value)) {
      throw new Error('Both arrays must be sorted in ascending order.');
    }
  }
  if (!Object.hasOwn(pointerCodeLines, pattern)) {
    throw new Error('Choose a supported two-pointer pattern.');
  }

  let array = [...values];
  const steps = [];
  const record = (event) => {
    const { lineIds, operation, explanation, ...state } = event;
    steps.push({
      step: steps.length + 1,
      array: [...array],
      ...state,
      lineIds: lineIds ? (Array.isArray(lineIds) ? lineIds : [lineIds]) : [],
      operation,
      explanation,
      metrics: { operations: steps.length },
    });
  };
  const finish = (result, explanation, lineId = 'return') => {
    record({ lineIds: lineId, operation: 'Algorithm complete', explanation, result, complete: true });
    return steps;
  };

  if (pattern === 'two-sum') {
    let left = 0;
    let right = array.length - 1;
    while (left < right) {
      const sum = assertSafeInteger(array[left] + array[right], 'Two-value sum');
      const matched = sum === target;
      record({
        lineIds: ['loop', matched ? 'match' : sum < target ? 'low' : 'move-right'],
        left, right, leftValue: array[left], rightValue: array[right],
        currentSum: sum, target, compared: [left, right],
        match: matched, rejected: !matched,
        decision: matched ? 'Match found' : sum < target ? 'Sum is too small; move LEFT rightward.' : 'Sum is too large; move RIGHT leftward.',
        operation: `Compare ${array[left]} + ${array[right]} = ${sum}`,
        explanation: matched ? `${array[left]} + ${array[right]} equals the target ${target}.` : sum < target
          ? `${sum} is less than ${target}. Because the array is sorted, moving LEFT right increases the sum.`
          : `${sum} is greater than ${target}. Because the array is sorted, moving RIGHT left decreases the sum.`,
      });
      if (matched) {
        record({
          lineIds: 'return', left, right, leftValue: array[left], rightValue: array[right],
          currentSum: sum, target, match: true, compared: [left, right],
          decision: 'Matching pair found!',
          result: [left, right], complete: true, operation: `Pair found: ${array[left]} + ${array[right]} = ${target}`,
          explanation: `Pair found: ${array[left]} + ${array[right]} = ${target}.`,
        });
        return steps;
      }
      if (sum < target) {
        left += 1;
        record({
          lineIds: 'move-left', left, right, leftValue: array[left], rightValue: array[right],
          currentSum: left < right ? array[left] + array[right] : null, target,
          decision: 'LEFT moved one position forward.', operation: 'Move LEFT',
          explanation: 'The sum was too small, so move LEFT forward to try a larger value.',
        });
      } else {
        right -= 1;
        record({
          lineIds: 'right-step', left, right, leftValue: array[left], rightValue: array[right],
          currentSum: left < right ? array[left] + array[right] : null, target,
          decision: 'RIGHT moved one position backward.', operation: 'Move RIGHT',
          explanation: 'The sum was too large, so move RIGHT backward to try a smaller value.',
        });
      }
    }
    return finish([], `No pair in the sorted array adds up to ${target}.`, 'missing');
  }

  if (pattern === 'reverse-array' || pattern === 'reverse-string') {
    let left = 0;
    let right = array.length - 1;
    while (left < right) {
      record({ lineIds: 'loop', left, right, compared: [left, right], decision: 'Swap the outside values.', operation: `Swap positions ${left} and ${right}`, explanation: `The two ends are not in their final reversed positions, so exchange ${array[left]} and ${array[right]}.` });
      [array[left], array[right]] = [array[right], array[left]];
      record({ lineIds: 'swap', left, right, compared: [left, right], highlighted: [left, right], operation: 'Swap values', explanation: 'The values have exchanged places.' });
      left += 1;
      record({ lineIds: 'left-step', left, right, operation: 'Move LEFT inward', explanation: 'Move LEFT one position toward the center.' });
      right -= 1;
      record({ lineIds: 'right-step', left, right, operation: 'Move RIGHT inward', explanation: 'Move RIGHT one position toward the center.' });
    }
    return finish(stringPattern ? array.join('') : array, stringPattern ? `Reversed text: ${array.join('')}` : `Reversed array: [${array.join(', ')}]`);
  }

  if (pattern === 'palindrome') {
    let left = 0;
    let right = array.length - 1;
    while (left < right) {
      const match = array[left] === array[right];
      record({
        lineIds: ['loop', 'compare'], left, right,
        leftValue: array[left], rightValue: array[right], compared: [left, right],
        match, rejected: !match,
        decision: match ? 'Matching outer characters; move inward.' : 'Characters differ; not a palindrome.',
        operation: `Compare "${array[left]}" with "${array[right]}"`,
        explanation: match ? `The outside characters match, so move both pointers inward.` : `The outside characters differ, so "${input}" is not a palindrome.`,
      });
      if (!match) return finish(false, `"${input}" is not a palindrome.`, 'false');
      left += 1;
      record({ lineIds: 'left-step', left, right, operation: 'Move LEFT inward', explanation: 'The matching left character is checked; LEFT advances one position.' });
      right -= 1;
      record({ lineIds: 'right-step', left, right, operation: 'Move RIGHT inward', explanation: 'The matching right character is checked; RIGHT retreats one position.' });
    }
    return finish(true, `"${input}" reads the same from both ends.`, 'true');
  }

  if (pattern === 'remove-duplicates') {
    if (array.length === 0) return finish([], 'There are no values to keep.');
    let slow = 0;
    for (let fast = 1; fast < array.length; fast += 1) {
      const duplicate = array[fast] === array[slow];
      record({
        lineIds: 'compare', left: slow, right: fast,
        leftValue: array[slow], rightValue: array[fast], compared: [slow, fast],
        decision: duplicate ? 'Duplicate; keep the slow pointer where it is.' : 'New value; move slow and copy it.',
        operation: duplicate ? `Skip duplicate ${array[fast]}` : `Keep new value ${array[fast]}`,
        explanation: duplicate ? `${array[fast]} equals the last unique value, so skip it.` : `${array[fast]} differs from the last unique value; advance the write pointer and keep it.`,
      });
      if (!duplicate) {
        slow += 1;
        record({ lineIds: 'advance', left: slow, right: fast, operation: 'Advance the write pointer', explanation: 'A new unique value needs the next compacted position.' });
        array[slow] = array[fast];
        record({ lineIds: 'copy', left: slow, right: fast, highlighted: [slow], operation: `Write ${array[fast]} at index ${slow}`, explanation: 'Copy this new unique value into the next available position.' });
      }
    }
    const result = array.slice(0, slow + 1);
    return finish(result, `Unique values: [${result.join(', ')}].`);
  }

  if (pattern === 'move-zeroes') {
    let slow = 0;
    for (let fast = 0; fast < array.length; fast += 1) {
      const nonZero = array[fast] !== 0;
      record({
        lineIds: 'compare', left: slow, right: fast,
        leftValue: array[slow], rightValue: array[fast], compared: [slow, fast],
        decision: nonZero ? 'Keep this non-zero value before the zeroes.' : 'Leave this zero for the end.',
        operation: nonZero ? `Keep ${array[fast]}` : 'Skip zero',
        explanation: nonZero ? `Move the next non-zero value to the next write position (${slow}).` : `Zero stays in place for now; later non-zero values will be moved before it.`,
      });
      if (nonZero) {
        [array[slow], array[fast]] = [array[fast], array[slow]];
        record({ lineIds: 'swap', left: slow, right: fast, highlighted: [slow, fast], operation: `Place ${array[slow]} before remaining zeroes`, explanation: 'The non-zero element is now in the next stable position.' });
        slow += 1;
        record({ lineIds: 'advance', left: slow, right: fast, operation: 'Advance write pointer', explanation: 'The next non-zero value will be written one place later.' });
      }
    }
    return finish(array, `All non-zero values remain in order, followed by zeroes: [${array.join(', ')}].`);
  }

  if (pattern === 'container-water') {
    let left = 0;
    let right = array.length - 1;
    let bestArea = 0;
    let bestPair = null;
    while (left < right) {
      const area = assertSafeInteger(Math.min(array[left], array[right]) * (right - left), 'Container area');
      if (area > bestArea) {
        bestArea = area;
        bestPair = [left, right];
      }
      const moveLeft = array[left] < array[right];
      record({
        lineIds: ['area', 'best', moveLeft ? 'move-left' : 'right-step'], left, right,
        leftValue: array[left], rightValue: array[right], currentArea: area,
        bestArea, bestPair: bestPair ? [...bestPair] : null, compared: [left, right],
        decision: moveLeft ? 'LEFT wall is shorter; move LEFT inward.' : 'RIGHT wall is shorter or equal; move RIGHT inward.',
        operation: `Area = ${area}; best = ${bestArea}`,
        explanation: `Area is shorter height × width = ${Math.min(array[left], array[right])} × ${right - left} = ${area}. Move the shorter wall because keeping it cannot improve area at a smaller width.`,
      });
      if (moveLeft) left += 1;
      else right -= 1;
      record({ lineIds: moveLeft ? 'left-step' : 'right-move', left, right, bestArea, bestPair: bestPair ? [...bestPair] : null, operation: `Move ${moveLeft ? 'LEFT' : 'RIGHT'}`, explanation: `Move ${moveLeft ? 'LEFT' : 'RIGHT'} inward to search for a taller boundary.` });
    }
    return finish({ area: bestArea, indices: bestPair }, `Maximum water area is ${bestArea}${bestPair ? ` between indexes ${bestPair[0]} and ${bestPair[1]}` : ''}.`, 'return');
  }

  if (pattern === 'merge') {
    let left = 0;
    let right = 0;
    const merged = [];
    while (left < array.length && right < secondaryInput.length) {
      const takeFirst = array[left] <= secondaryInput[right];
      record({
        lineIds: takeFirst ? 'compare' : 'take-right', left, right,
        leftValue: array[left], rightValue: secondaryInput[right],
        secondaryArray: [...secondaryInput], merged: [...merged],
        compared: [left], comparedSecondary: [right], decision: takeFirst ? 'Take the smaller value from the first array.' : 'Take the smaller value from the second array.',
        operation: `Compare ${array[left]} and ${secondaryInput[right]}`,
        explanation: `Both arrays are sorted, so the smaller front value is the next value in the merged result.`,
      });
      if (takeFirst) {
        merged.push(array[left]);
        left += 1;
        record({ lineIds: 'take-left', left, right, secondaryArray: [...secondaryInput], merged: [...merged], operation: 'Take from first array', explanation: 'Append the smaller value and advance its pointer.' });
      } else {
        merged.push(secondaryInput[right]);
        right += 1;
        record({ lineIds: 'take-right-value', left, right, secondaryArray: [...secondaryInput], merged: [...merged], operation: 'Take from second array', explanation: 'Append the smaller value and advance its pointer.' });
      }
    }
    merged.push(...array.slice(left), ...secondaryInput.slice(right));
    return finish(merged, `Merged sorted result: [${merged.join(', ')}].`, 'return');
  }

  if (pattern === 'three-sum') {
    array.sort((a, b) => a - b);
    const answers = [];
    record({ lineIds: 'sort', operation: 'Sort a working copy', explanation: 'Sorting makes it possible to increase or decrease the three-value sum by moving a pointer.' });
    for (let i = 0; i < array.length - 2; i += 1) {
      record({ lineIds: 'outer', anchor: i, operation: `Choose anchor ${array[i]} at index ${i}`, explanation: 'Fix one value; LEFT and RIGHT search for the other two values.' });
      if (i > 0 && array[i] === array[i - 1]) {
        record({ lineIds: 'skip', anchor: i, operation: `Skip duplicate anchor ${array[i]}`, explanation: 'This anchor value was already used, so skip it to avoid duplicate triplets.' });
        continue;
      }
      let left = i + 1;
      let right = array.length - 1;
      record({ lineIds: 'pointers', anchor: i, left, right, operation: 'Initialize LEFT and RIGHT', explanation: 'Start the two search pointers on either side of the remaining values.' });
      while (left < right) {
        const sum = assertSafeInteger(array[i] + array[left] + array[right], 'Three-value sum');
        const triple = [i, left, right];
        record({
          lineIds: ['loop', 'sum', sum === target ? 'match' : sum < target ? 'move-right' : 'right-choice'],
          anchor: i, left, right, leftValue: array[left], rightValue: array[right],
          currentSum: sum, target, match: sum === target, rejected: sum !== target, triples: answers.map((answer) => [...answer]),
          compared: triple, decision: sum === target ? 'Triplet matches target.' : sum < target ? 'Sum too small; move LEFT right.' : 'Sum too large; move RIGHT left.',
          operation: `Check ${array[i]} + ${array[left]} + ${array[right]} = ${sum}`,
          explanation: `The sorted values let us adjust the sum: ${sum === target ? 'record this triplet and continue searching.' : sum < target ? 'increase it by moving LEFT forward.' : 'decrease it by moving RIGHT backward.'}`,
        });
        if (sum === target) {
          answers.push([array[i], array[left], array[right]]);
          record({ lineIds: 'found', anchor: i, left, right, triples: answers.map((answer) => [...answer]), operation: `Record triplet ${array[i]}, ${array[left]}, ${array[right]}`, explanation: 'Save this matching triplet before moving both pointers to look for another distinct triplet.' });
          left += 1;
          record({ lineIds: 'move-left', anchor: i, left, right, operation: 'Move LEFT forward', explanation: 'Advance LEFT to search for another distinct matching value.' });
          right -= 1;
          record({ lineIds: 'right-step', anchor: i, left, right, operation: 'Move RIGHT backward', explanation: 'Move RIGHT inward after recording the triplet.' });
          while (left < right && array[left] === array[left - 1]) {
            record({ lineIds: 'skip-left-check', anchor: i, left, right, compared: [left, left - 1], operation: `Skip repeated ${array[left]} on LEFT`, explanation: 'Skip this duplicate value so the same triplet is not returned twice.' });
            left += 1;
            record({ lineIds: 'skip-left-move', anchor: i, left, right, operation: 'Advance LEFT past duplicate', explanation: 'LEFT moves over the repeated value.' });
          }
          while (left < right && array[right] === array[right + 1]) {
            record({ lineIds: 'skip-right-check', anchor: i, left, right, compared: [right, right + 1], operation: `Skip repeated ${array[right]} on RIGHT`, explanation: 'Skip this duplicate value so the same triplet is not returned twice.' });
            right -= 1;
            record({ lineIds: 'skip-right-move', anchor: i, left, right, operation: 'Move RIGHT past duplicate', explanation: 'RIGHT moves over the repeated value.' });
          }
        } else if (sum < target) {
          left += 1;
          record({ lineIds: 'left-step', anchor: i, left, right, operation: 'Move LEFT forward', explanation: 'The sum was too small, so advance LEFT to increase it.' });
        } else {
          right -= 1;
          record({ lineIds: 'right-move', anchor: i, left, right, operation: 'Move RIGHT backward', explanation: 'The sum was too large, so move RIGHT backward to reduce it.' });
        }
      }
    }
    return finish(answers, `Found ${answers.length} unique triplet${answers.length === 1 ? '' : 's'} that sum to ${target}.`);
  }

  if (pattern === 'fast-slow') {
    let slow = 0;
    let fast = 0;
    while (fast + 1 < array.length) {
      record({
        lineIds: 'loop', left: slow, right: fast,
        leftValue: array[slow], rightValue: array[fast], compared: [slow, fast],
        decision: 'Move fast two steps and slow one step.',
        operation: `slow = ${slow}, fast = ${fast}`,
        explanation: 'Fast advances twice as quickly as slow. When fast reaches the end, slow is at the middle.',
      });
      fast += 2;
      record({ lineIds: 'fast-step', left: slow, right: fast, operation: 'Advance FAST by two', explanation: 'FAST moves two array positions in this step.' });
      slow += 1;
      record({ lineIds: 'slow-step', left: slow, right: fast, operation: 'Advance fast by 2 and slow by 1', explanation: 'Both pointers move at their own pace toward the end.' });
    }
    return finish({ middleIndex: array.length ? slow : null, middleValue: array.length ? array[slow] : null }, array.length ? `The middle is at index ${slow} with value ${array[slow]}.` : 'An empty array has no middle element.');
  }
  return finish(array, 'Algorithm complete.');
}

function createFixedWindowSteps(input, windowSize) {
  validateIntegerArray(input);
  if (!Number.isSafeInteger(windowSize) || windowSize <= 0) {
    throw new Error('Window size must be a positive integer.');
  }
  if (windowSize > input.length) {
    throw new Error('Window size cannot be larger than the array length.');
  }

  const array = [...input];
  const steps = [];
  let windowSum = 0;
  let maxSum = Number.NEGATIVE_INFINITY;

  for (let index = 0; index < windowSize; index += 1) {
    windowSum = assertSafeInteger(windowSum + array[index], 'Window sum');
  }
  maxSum = windowSum;

  steps.push({
    step: 1,
    array: [...array],
    windowStart: 0,
    windowEnd: windowSize - 1,
    left: 0,
    right: windowSize - 1,
    windowSize,
    currentSum: windowSum,
    maxSum,
    incomingIndex: null,
    outgoingIndex: null,
    lineIds: ['initial-window', 'set-max'],
    operation: `Initial window sum = ${windowSum}`,
    explanation: `The first ${windowSize}-element window is [${array.slice(0, windowSize).join(', ')}]. Its sum is ${windowSum}.`,
  });

  for (let right = windowSize; right < array.length; right += 1) {
    const outgoingIndex = right - windowSize;
    const incomingIndex = right;
    windowSum = assertSafeInteger(windowSum + array[incomingIndex] - array[outgoingIndex], 'Window sum');
    if (windowSum > maxSum) {
      maxSum = windowSum;
    }

    steps.push({
      step: steps.length + 1,
      array: [...array],
      windowStart: right - windowSize + 1,
      windowEnd: right,
      left: right - windowSize + 1,
      right,
      windowSize,
      currentSum: windowSum,
      maxSum,
      outgoingIndex,
      incomingIndex,
      lineIds: ['slide-window', 'update-window', 'update-max'],
      operation: `Slide window and update sum to ${windowSum}`,
      explanation: `Remove ${array[outgoingIndex]} and add ${array[incomingIndex]}; the new window becomes [${array.slice(right - windowSize + 1, right + 1).join(', ')}].`,
    });
  }

  steps.push({
    step: steps.length + 1,
    array: [...array],
    windowStart: array.length - windowSize,
    windowEnd: array.length - 1,
    left: array.length - windowSize,
    right: array.length - 1,
    windowSize,
    currentSum: windowSum,
    maxSum,
    incomingIndex: null,
    outgoingIndex: null,
    lineIds: ['return-max'],
    operation: `Maximum sum is ${maxSum}`,
    explanation: `The window has moved across the array and the largest sum seen is ${maxSum}.`,
    result: maxSum,
    complete: true,
  });

  return steps;
}

function createMinimumWindowSteps(input, target) {
  validateIntegerArray(input);
  if (!Number.isSafeInteger(target) || target <= 0) {
    throw new Error('Target sum must be a positive integer.');
  }
  if (input.some((value) => value <= 0)) {
    throw new Error('Minimum-size sliding window requires positive integers.');
  }
  const steps = [];
  let left = 0;
  let currentSum = 0;
  let minLength = Number.POSITIVE_INFINITY;
  for (let right = 0; right < input.length; right += 1) {
    currentSum = assertSafeInteger(currentSum + input[right], 'Window sum');
    steps.push({
      step: steps.length + 1, array: [...input], windowStart: left, windowEnd: right,
      left, right, windowSize: right - left + 1, currentSum, minLength: Number.isFinite(minLength) ? minLength : null,
      incomingIndex: right, lineIds: ['expand', 'add'],
      operation: `Add ${input[right]} to the window`,
      explanation: `Expand RIGHT to include ${input[right]}. The window sum is now ${currentSum}.`,
      decision: currentSum >= target ? `Sum reached target ${target}; shrink from LEFT.` : `Sum is below ${target}; keep expanding RIGHT.`,
    });
    while (currentSum >= target) {
      minLength = Math.min(minLength, right - left + 1);
      steps.push({
        step: steps.length + 1, array: [...input], windowStart: left, windowEnd: right,
        left, right, windowSize: right - left + 1, currentSum, minLength,
        outgoingIndex: left, lineIds: ['shrink-check', 'record', 'remove'],
        operation: `Record length ${right - left + 1} and remove ${input[left]}`,
        explanation: `The sum ${currentSum} reaches target ${target}. Save this window length, then remove the LEFT value to try a shorter window.`,
        decision: 'Shrink from LEFT because the current sum is large enough.',
      });
      currentSum = assertSafeInteger(currentSum - input[left], 'Window sum');
      left += 1;
      steps.push({
        step: steps.length + 1, array: [...input], windowStart: left, windowEnd: right,
        left, right, windowSize: Math.max(0, right - left + 1), currentSum,
        outgoingIndex: left - 1, lineIds: ['move-left'],
        operation: 'Move LEFT one position forward',
        explanation: `LEFT moves past the outgoing value; the remaining window sum is ${currentSum}.`,
        decision: currentSum >= target ? 'Still reaches the target; shrink again.' : 'Below target; expand RIGHT next.',
      });
    }
  }
  const result = Number.isFinite(minLength) ? minLength : 0;
  steps.push({
    step: steps.length + 1, array: [...input], windowStart: left, windowEnd: input.length - 1,
    left, right: input.length - 1, windowSize: 0, currentSum, minLength: result,
    lineIds: ['return'], operation: `Minimum length is ${result}`,
    explanation: result ? `The shortest qualifying window has ${result} element${result === 1 ? '' : 's'}.` : `No window reaches target ${target}.`,
    result, complete: true,
  });
  return steps;
}

function createLongestSubstringSteps(input) {
  if (typeof input !== 'string') throw new Error('Longest unique substring expects text input.');
  const array = [...input];
  const steps = [];
  const lastSeen = new Map();
  let left = 0;
  let bestLength = 0;
  let bestRange = null;
  for (let right = 0; right < array.length; right += 1) {
    const char = array[right];
    const previousIndex = lastSeen.get(char);
    if (previousIndex !== undefined && previousIndex >= left) {
      left = previousIndex + 1;
      steps.push({
        step: steps.length + 1, array: [...array], windowStart: left, windowEnd: right,
        left, right, windowSize: right - left + 1, currentSum: null, bestLength, duplicate: char,
        outgoingIndex: previousIndex, lineIds: ['duplicate', 'shrink'],
        operation: `Move LEFT past the previous "${char}"`,
        explanation: `"${char}" was already inside the current window, so move LEFT to ${left} to remove the duplicate.`,
        decision: 'Shrink just enough to make every character unique.',
      });
    } else {
      steps.push({
        step: steps.length + 1, array: [...array], windowStart: left, windowEnd: right,
        left, right, windowSize: right - left + 1, currentSum: null, bestLength,
        incomingIndex: right, lineIds: ['expand'],
        operation: `Expand RIGHT to include "${char}"`,
        explanation: `Add "${char}" to the current substring; there is no duplicate inside the window.`,
        decision: 'The window remains valid, so record its length.',
      });
    }
    lastSeen.set(char, right);
    const length = right - left + 1;
    if (length > bestLength) {
      bestLength = length;
      bestRange = [left, right];
    }
    steps.push({
      step: steps.length + 1, array: [...array], windowStart: left, windowEnd: right,
      left, right, windowSize: length, bestLength, bestRange: bestRange ? [...bestRange] : null,
      lineIds: ['record'], operation: `Longest unique window is ${bestLength}`,
      explanation: `The current unique substring has length ${length}; the best length seen is ${bestLength}.`,
      decision: 'Move RIGHT forward for the next character.',
    });
  }
  steps.push({
    step: steps.length + 1, array: [...array], windowStart: bestRange?.[0] ?? 0,
    windowEnd: bestRange?.[1] ?? -1, left: bestRange?.[0] ?? 0, right: bestRange?.[1] ?? -1,
    windowSize: bestLength, bestLength, lineIds: ['return'], operation: `Longest unique substring length is ${bestLength}`,
    explanation: `The longest substring without repeated characters has length ${bestLength}.`,
    result: bestLength, complete: true,
  });
  return steps;
}

export function createSlidingWindowSteps(input, windowSize, mode = 'fixed') {
  if (mode === 'minimum') return createMinimumWindowSteps(input, windowSize);
  if (mode === 'substring') return createLongestSubstringSteps(input);
  if (mode !== 'fixed') throw new Error('Choose a supported sliding-window pattern.');
  return createFixedWindowSteps(input, windowSize);
}

export function createLessonPlayback(lessonId, input, target, pattern, secondaryInput, options = {}) {
  if (lessonId === 'bubble-sort') {
    return createBubbleSortSteps(input);
  }
  if (lessonId === 'binary-search') {
    return createBinarySearchSteps(input, target);
  }
  if (lessonId === 'linear-search') {
    return createLinearSearchSteps(input, target);
  }
  if (lessonId === 'selection-sort') {
    return createSelectionSortSteps(input);
  }
  if (lessonId === 'insertion-sort') {
    return createInsertionSortSteps(input);
  }
  if (lessonId === 'singly-linked-list') {
    return createSinglyLinkedListSteps(input, target);
  }
  if (lessonId === 'doubly-linked-list') {
    return createDoublyLinkedListSteps(input, target);
  }
  if (lessonId === 'cycle-detection') {
    return createCycleDetectionSteps(input, options.cycleStartIndex ?? null);
  }
  if (lessonId === 'sliding-window') {
    return createSlidingWindowSteps(input, target ?? Math.min(3, input.length || 1), pattern ?? 'fixed');
  }
  if (lessonId === 'two-pointers') {
    return createTwoPointerSteps(pattern ?? 'two-sum', input, target ?? 0, secondaryInput ?? []);
  }
  return null;
}
