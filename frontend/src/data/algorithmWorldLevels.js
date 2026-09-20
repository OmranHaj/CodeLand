/* ====================================================== */
/* ALGORITHM & DATA STRUCTURES 3D WORLD - LEVEL METADATA  */
/* ====================================================== */

export const ALGO_WORLD_CAMERA = {
  overviewPosition: [0, 12, 26],
  overviewTarget: [0, 1.8, -2.5],
};

export const ALGO_SECTORS = [
  {
    id: "algo-arrays",
    code: "ARR",
    order: "01",
    title: "Arrays & Dynamic Vectors",
    subtitle: "Contiguous Memory & Direct Indexing",
    description:
      "Explore memory allocation, instant O(1) random access, dynamic resizing amortized analysis, and dual-pointer algorithmic patterns.",
    accent: "#10b981", // Emerald
    secondaryAccent: "#34d399",
    glowColor: "rgba(16, 185, 129, 0.55)",
    position: [0, 0.6, 4.8],
    cameraPosition: [0, 4.5, 11.2],
    cameraTarget: [0, 1.2, 4.8],
    complexity: { time: "O(1) Access", space: "O(N)" },
    lessons: [
      {
        id: "arr-traversal",
        title: "Contiguous Memory & Indexing",
        subtitle: "How CPU caches and pointer offsets deliver O(1) speed",
        analogyTitle: "Numbered School Lockers 🏫",
        analogyDescription:
          "Imagine a long hallway lined with school lockers numbered from 0 to 5, placed right next to each other with no gaps! If you want to open locker #3, you don't need to check lockers 0, 1, and 2 first; you walk straight to locker #3 and open it in one second! That's instantaneous O(1) random access.",
        concept:
          "An array occupies a continuous block of memory addresses. Because every element has the same byte size, the memory address of index i is calculated instantly via: Address(i) = BaseAddress + (i * ElementSize). This makes random access instantaneous O(1), but insertions and deletions require shifting remaining elements O(N).",
        timeComplexity: "O(1) Access · O(N) Search & Insert",
        spaceComplexity: "O(N) Total Space",
        visualizerType: "array",
        demoData: [12, 28, 45, 67, 89, 94],
        steps: [
          {
            activeIdx: 0,
            stepTitle: "1. Memory Track Allocation",
            text: "Memory Track Allocation: Array base address established at 0x7F00. Elements stored contiguously with 4-byte spacing.",
            subtext: "Locker [0] is located at the front entrance of the corridor.",
            state: "access",
            registers: { Base: "0x7F00", Index: 0, Offset: "0 B", Address: "0x7F00", Value: 12 },
          },
          {
            activeIdx: 0,
            stepTitle: "2. Base Address O(1) Access",
            text: "Base Address Access: Address = 0x7F00 + (0 * 4) = 0x7F00. Value = 12 loaded into CPU L1 Cache in 1 cycle!",
            subtext: "Instant random access: no iteration over prior elements is needed.",
            state: "access",
            registers: { Base: "0x7F00", Index: 0, Offset: "0 B", Address: "0x7F00", Value: 12 },
          },
          {
            activeIdx: 1,
            stepTitle: "3. Sequential Stride",
            text: "Scanning Pointer: Next element at 0x7F00 + (1 * 4) = 0x7F04. Value = 28 loaded directly.",
            subtext: "Notice each element is exactly 4 bytes away in physical RAM.",
            state: "access",
            registers: { Base: "0x7F00", Index: 1, Offset: "4 B", Address: "0x7F04", Value: 28 },
          },
          {
            activeIdx: 2,
            stepTitle: "4. Direct Hardware Offset Jump",
            text: "Direct Offset Jump: Index 2 at 0x7F00 + (2 * 4) = 0x7F08. Value = 45 read in exactly 1 clock cycle!",
            subtext: "The CPU calculates the exact memory hardware address in a single multiplication.",
            state: "access",
            registers: { Base: "0x7F00", Index: 2, Offset: "8 B", Address: "0x7F08", Value: 45 },
          },
          {
            activeIdx: 3,
            stepTitle: "5. CPU Cache Line Hit",
            text: "Sequential Stride: Index 3 at 0x7F0C -> 67. The hardware prefetcher already loaded it into L1 Cache!",
            subtext: "Contiguous memory layouts maximize CPU cache performance.",
            state: "access",
            registers: { Base: "0x7F00", Index: 3, Offset: "12 B", Address: "0x7F0C", Value: 67 },
          },
          {
            activeIdx: 4,
            stepTitle: "6. Mid-Array Direct Lookup",
            text: "Instantaneous Lookup: Index 4 at 0x7F00 + (4 * 4) = 0x7F10 -> 89. Zero loops or searches!",
            subtext: "Even if there were 10,000,000 items, arr[4] takes the exact same fraction of a nanosecond.",
            state: "access",
            registers: { Base: "0x7F00", Index: 4, Offset: "16 B", Address: "0x7F10", Value: 89 },
          },
          {
            activeIdx: 5,
            stepTitle: "7. Boundary Check & Final Element",
            text: "Boundary Verification: Index 5 at 0x7F14 -> 94. Final element verified before memory bound.",
            subtext: "Attempting to access index 6 would trigger an out-of-bounds memory segmentation fault.",
            state: "access",
            registers: { Base: "0x7F00", Index: 5, Offset: "20 B", Address: "0x7F14", Value: 94 },
          },
          {
            activeIdx: 5,
            stepTitle: "8. Algorithmic Invariant Payoff",
            text: "Algorithmic Invariant: Regardless of array size (6 or 60,000,000 elements), random access is strictly O(1) constant time!",
            subtext: "Mastering array indexing is the foundation of all high-performance software.",
            state: "success",
            registers: { Base: "0x7F00", Size: 6, Complexity: "O(1)", Status: "Mastered" },
          },
        ],
        cppCode: `// C++: Contiguous Memory & Direct Indexing O(1)
#include <iostream>
#include <vector>

int getElement(const std::vector<int>& arr, int index) {
    // Direct hardware address jump: Base + index * sizeof(int)
    if (index >= 0 && index < static_cast<int>(arr.size())) {
        return arr[index]; // O(1) Instant Access!
    }
    throw std::out_of_range("Index out of memory bounds");
}

int main() {
    std::vector<int> lockers = {12, 28, 45, 67, 89, 94};
    std::cout << "Locker 2: " << getElement(lockers, 2) << std::endl; // 45
    return 0;
}`,
        starterCode: `// Write a C++ function that accesses the locker element at the given index
#include <vector>

int accessLocker(const std::vector<int>& lockers, int index) {
    // Write direct access code here:
    return lockers[index];
}`,
        expectedResult: "45",
        testInput: "index = 2 on [12, 28, 45, 67, 89, 94]",
        question: "Why is accessing an array element by its index an O(1) constant-time operation?",
        options: [
          "The CPU calculates the exact hardware address using a direct formula in a single step",
          "The computer checks each locker one by one until it finds the number",
          "Arrays store elements in a binary search tree in memory"
        ],
        answer: 0,
        explanation: "Because array elements are stored contiguously in memory, the CPU computes the hardware address instantly via (Base Address + Index * Element Size), with no iteration required."
      },
      {
        id: "arr-two-pointers",
        title: "Two Pointers Technique",
        subtitle: "Converging indices to solve problems in linear O(N) time",
        analogyTitle: "Pincer Movement from Both Ends 🎯",
        analogyDescription:
          "Imagine two friends standing on opposite ends of a bridge filled with numbers sorted from smallest to largest. One starts on the far left, the other on the far right. They add their numbers: if the sum is too small, the left friend steps forward to pick a larger number. If the sum is too large, the right friend steps inward to pick a smaller number. They find the target sum in a single pass without searching every pair!",
        concept:
          "The Two Pointers pattern utilizes two index variables—typically starting at the opposite ends of a sorted array—and moves them inward based on comparison logic. This avoids nested loops, dropping time complexity from O(N^2) down to O(N).",
        timeComplexity: "O(N) Linear Time",
        spaceComplexity: "O(1) Auxiliary Space",
        visualizerType: "two-pointers",
        demoData: [2, 7, 11, 15, 19, 23],
        targetSum: 26,
        steps: [
          {
            left: 0,
            right: 5,
            sum: 25,
            stepTitle: "1. Pointer Initialization",
            text: "Pointer Setup: Left pointer L=0 (val 2), Right pointer R=5 (val 23). Target sum = 26.",
            subtext: "Left starts at minimum element; Right starts at maximum element.",
            state: "compare",
            registers: { L: 0, R: 5, "arr[L]": 2, "arr[R]": 23, Sum: 25, Target: 26 },
          },
          {
            left: 0,
            right: 5,
            sum: 25,
            stepTitle: "2. Evaluate Sum #1",
            text: "Comparison: arr[0] + arr[5] = 2 + 23 = 25. Since 25 < 26 (Target), the sum is too small!",
            subtext: "To increase the sum in a sorted array, we must move the Left pointer forward.",
            state: "compare",
            registers: { L: 0, R: 5, Sum: 25, Action: "L++ (Need larger sum)" },
          },
          {
            left: 1,
            right: 5,
            sum: 30,
            stepTitle: "3. Advance Left Pointer",
            text: "Advance Left: L moves from 0 to 1. Now arr[L] = 7, arr[R] = 23.",
            subtext: "By moving L, we safely pruned element 2 from ever needing to be checked again.",
            state: "compare",
            registers: { L: 1, R: 5, "arr[L]": 7, "arr[R]": 23, Sum: 30, Target: 26 },
          },
          {
            left: 1,
            right: 5,
            sum: 30,
            stepTitle: "4. Evaluate Sum #2",
            text: "Comparison: arr[1] + arr[5] = 7 + 23 = 30. Since 30 > 26 (Target), the sum is now too large!",
            subtext: "To decrease the sum, we must decrement the Right pointer inward.",
            state: "compare",
            registers: { L: 1, R: 5, Sum: 30, Action: "R-- (Need smaller sum)" },
          },
          {
            left: 1,
            right: 4,
            sum: 26,
            stepTitle: "5. Decrement Right Pointer",
            text: "Decrement Right: R moves from 5 to 4. Now arr[L] = 7, arr[R] = 19.",
            subtext: "Element 23 is safely eliminated because pairing it with any valid L gave > 26.",
            state: "compare",
            registers: { L: 1, R: 4, "arr[L]": 7, "arr[R]": 19, Sum: 26, Target: 26 },
          },
          {
            left: 1,
            right: 4,
            sum: 26,
            stepTitle: "6. Evaluate Sum #3 - Target Match!",
            text: "Match Found!: arr[1] + arr[4] = 7 + 19 = 26 == Target! Exact match discovered!",
            subtext: "Pointers have successfully pinpointed the solution pair.",
            state: "match",
            registers: { L: 1, R: 4, Sum: 26, Target: 26, Status: "MATCH FOUND!" },
          },
          {
            left: 1,
            right: 4,
            sum: 26,
            stepTitle: "7. Lock in Solution Pair",
            text: "Locking In Solution: Indices [1, 4] with values (7, 19) produce the target sum 26.",
            subtext: "Returns true or indices {1, 4} to the caller.",
            state: "match",
            registers: { Solution: "{1, 4}", Values: "(7, 19)", Target: 26 },
          },
          {
            left: 1,
            right: 4,
            sum: 26,
            stepTitle: "8. Complexity Payoff",
            text: "Complexity Victory: Found in just 3 comparisons! Brute force would have checked 15 pairs. O(N) linear time achieved!",
            subtext: "Two Pointers is one of the most celebrated algorithmic optimizations in computer science.",
            state: "success",
            registers: { Comparisons: 3, BruteForce: 15, Complexity: "O(N)" },
          },
        ],
        cppCode: `// C++: Two Pointers Technique in Sorted Array O(N)
#include <iostream>
#include <vector>

bool twoSumSorted(const std::vector<int>& arr, int target, int& outL, int& outR) {
    int left = 0;
    int right = arr.size() - 1;

    while (left < right) {
        int currentSum = arr[left] + arr[right];
        if (currentSum == target) {
            outL = left;
            outR = right;
            return true; // Match found in O(N)!
        } else if (currentSum < target) {
            left++;  // Need larger sum -> advance left
        } else {
            right--; // Need smaller sum -> decrement right
        }
    }
    return false;
}`,
        starterCode: `// Complete the two-pointers function to find if two numbers add up to target
#include <vector>

bool findPair(const std::vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    while (left < right) {
        int sum = arr[left] + arr[right];
        if (sum == target) return true;
        if (sum < target) left++;
        else right--;
    }
    return false;
}`,
        expectedResult: "true",
        testInput: "target = 26 on [2, 7, 11, 15, 19, 23]",
        question: "In a sorted array, if the sum of arr[left] + arr[right] is less than the target, which pointer should move?",
        options: [
          "Move the left pointer rightward (left++) to pick a larger number",
          "Move the right pointer leftward (right--) to pick a smaller number",
          "Reset both pointers back to zero"
        ],
        answer: 0,
        explanation: "Since the array is sorted, incrementing the left pointer selects a larger number, which increases the total sum toward the target."
      }
    ]
  },
  {
    id: "algo-linked-lists",
    code: "LST",
    order: "02",
    title: "Linked Lists & Pointers",
    subtitle: "Dynamic Memory Nodes & Pointer Manipulation",
    description:
      "Understand node references, pointer rewiring, singly and doubly linked structures, and the fast-slow pointer algorithm.",
    accent: "#06b6d4", // Cyan
    secondaryAccent: "#67e8f9",
    glowColor: "rgba(6, 182, 212, 0.55)",
    position: [-6.4, 1.4, 1.2],
    cameraPosition: [-6.4, 5.2, 7.8],
    cameraTarget: [-6.4, 1.6, 1.2],
    complexity: { time: "O(1) Insert/Del", space: "O(N)" },
    lessons: [
      {
        id: "lst-nodes",
        title: "Singly Linked List & Node Linking",
        subtitle: "Scattered heap memory chained together by pointers",
        analogyTitle: "The Magic Connected Train Cars 🚂",
        analogyDescription:
          "Imagine a train where each car can be parked at a different station across town! How does the train stay together? Every car holds a signpost (pointer) pointing to the next car's location. If you want to attach a new car to the front of the train, you don't need to move the entire train; you simply hook the new car's signpost to the current first car in one step O(1)!",
        concept:
          "Unlike arrays, linked list nodes do not need to be contiguous in memory. Each node holds its data payload and a pointer/reference to the 'next' node in the sequence. Inserting at the head is a blazing fast O(1) operation.",
        timeComplexity: "O(1) Prepend · O(N) Traversal",
        spaceComplexity: "O(N) Dynamic Memory",
        visualizerType: "linked-list",
        demoData: [10, 20, 30, 40],
        steps: [
          {
            activeIdx: 0,
            stepTitle: "1. Head Pointer Initialization",
            text: "Head Pointer Reference: Head pointer references Node(10) residing in heap memory at address 0x7F01.",
            subtext: "The head pointer is the only entry point into the entire chain.",
            state: "node",
            registers: { Head: "0x7F01", Curr: "0x7F01", Val: 10, Next: "0x7F18" },
          },
          {
            activeIdx: 0,
            stepTitle: "2. Inspecting Node Payload",
            text: "Reading Node 1: Payload = 10. Pointer member 'next' stores address 0x7F18.",
            subtext: "Notice nodes are scattered across memory; only the pointer maintains the link!",
            state: "node",
            registers: { Addr: "0x7F01", Data: 10, NextPtr: "0x7F18" },
          },
          {
            activeIdx: 1,
            stepTitle: "3. Dereference to Node 2",
            text: "Pointer Dereference: Follow pointer (0x7F01->next) to arrive at Node(20) at address 0x7F18.",
            subtext: "The CPU follows the 64-bit pointer address across the memory bus.",
            state: "traverse",
            registers: { Addr: "0x7F18", Data: 20, NextPtr: "0x7F34" },
          },
          {
            activeIdx: 1,
            stepTitle: "4. Reading Node 2 Payload",
            text: "Inspecting Node 2: Value = 20. Its 'next' pointer holds address 0x7F34.",
            subtext: "Each node acts as an independent station with a signpost.",
            state: "node",
            registers: { Addr: "0x7F18", Data: 20, NextPtr: "0x7F34" },
          },
          {
            activeIdx: 2,
            stepTitle: "5. Dereference to Node 3",
            text: "Pointer Dereference: Follow pointer (0x7F18->next) to arrive at Node(30) at address 0x7F34.",
            subtext: "Traversal requires hopping node by node; O(1) random index access is impossible.",
            state: "traverse",
            registers: { Addr: "0x7F34", Data: 30, NextPtr: "0x7F50" },
          },
          {
            activeIdx: 2,
            stepTitle: "6. Reading Node 3 Payload",
            text: "Inspecting Node 3: Value = 30. Its 'next' pointer holds address 0x7F50.",
            subtext: "3 hops completed so far in O(N) time.",
            state: "node",
            registers: { Addr: "0x7F34", Data: 30, NextPtr: "0x7F50" },
          },
          {
            activeIdx: 3,
            stepTitle: "7. Reaching Terminal Node",
            text: "Arrive at Node(40): Address 0x7F50. Value = 40. Its 'next' pointer points to nullptr (0x0).",
            subtext: "nullptr signals that this is the final tail element of the list.",
            state: "end",
            registers: { Addr: "0x7F50", Data: 40, NextPtr: "nullptr" },
          },
          {
            activeIdx: 3,
            stepTitle: "8. Traversal Complete & O(1) Prepend",
            text: "Traversal Complete: All 4 nodes visited in O(N) time. Inserting at head takes O(1) with zero shifts!",
            subtext: "Unlike arrays, you can prepend new elements instantly without moving existing items.",
            state: "success",
            registers: { Status: "Finished", TotalNodes: 4, PrependComplexity: "O(1)" },
          },
        ],
        cppCode: `// C++: Singly Linked List Node & Prepend O(1)
#include <iostream>

struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};

ListNode* prepend(ListNode* head, int newVal) {
    // O(1) instant prepend - no memory shifts needed!
    ListNode* newNode = new ListNode(newVal);
    newNode->next = head;
    return newNode; // New head of the list
}`,
        starterCode: `// Complete the prepend function to add a node at the head of a linked list
struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};

ListNode* pushFront(ListNode* head, int val) {
    ListNode* node = new ListNode(val);
    node->next = head;
    return node;
}`,
        expectedResult: "New head points to previous head",
        testInput: "prepend(5) to [10, 20, 30]",
        question: "What is the primary advantage of a Linked List over a fixed Array when inserting elements at the beginning?",
        options: [
          "No elements need to be shifted in memory; only pointer references are updated in O(1)",
          "Linked lists use less memory per element than arrays",
          "Linked lists provide O(1) random index access"
        ],
        answer: 0,
        explanation: "In an array, inserting at the start forces all subsequent elements to shift rightward O(N). In a linked list, you only rewire the new node's next pointer in O(1)."
      },
      {
        id: "lst-reverse",
        title: "Reversing a Linked List",
        subtitle: "The three-pointer dance: prev, curr, and next",
        analogyTitle: "Reversing One-Way Street Signs 🔄",
        analogyDescription:
          "Imagine arrows pointing forward: A -> B -> C -> D. We want to turn the arrows backwards to become A <- B <- C <- D without losing any node along the way! We use three pointers: one for the previous node, one for the current node, and a temporary pointer to hold the next node before we break the link.",
        concept:
          "Reversing a singly linked list in-place requires redirecting every node's next pointer backwards. To prevent losing reference to the remainder of the list, we store next, redirect curr->next = prev, and advance prev and curr forward.",
        timeComplexity: "O(N) Single Pass",
        spaceComplexity: "O(1) In-Place Space",
        visualizerType: "linked-list-reverse",
        demoData: [1, 2, 3, 4],
        steps: [
          {
            prev: null,
            curr: 1,
            next: 2,
            stepTitle: "1. Three-Pointer Setup",
            text: "Pointer Setup: prev = nullptr, curr = Node(1). Guard pointer nextTemp will hold Node(2).",
            subtext: "We must never change curr->next until we save nextTemp!",
            state: "rewire",
            registers: { prev: "nullptr", curr: "1", nextTemp: "2" },
          },
          {
            prev: 1,
            curr: 2,
            next: 3,
            stepTitle: "2. Reverse Node 1 Pointer",
            text: "Rewire Node 1: Point 1->next = nullptr. Node 1 is now the tail. Advance prev=1, curr=2.",
            subtext: "First link reversed! Now save nextTemp = Node(3).",
            state: "rewire",
            registers: { "1->next": "nullptr", prev: "1", curr: "2", nextTemp: "3" },
          },
          {
            prev: 2,
            curr: 3,
            next: 4,
            stepTitle: "3. Reverse Node 2 Pointer",
            text: "Rewire Node 2: Point 2->next = 1. Arrow now points backwards! Advance prev=2, curr=3.",
            subtext: "Chain so far: 2 -> 1 -> nullptr. Now save nextTemp = Node(4).",
            state: "rewire",
            registers: { "2->next": "1", prev: "2", curr: "3", nextTemp: "4" },
          },
          {
            prev: 3,
            curr: 4,
            next: null,
            stepTitle: "4. Reverse Node 3 Pointer",
            text: "Rewire Node 3: Point 3->next = 2. Advance prev=3, curr=4. nextTemp becomes nullptr.",
            subtext: "Chain so far: 3 -> 2 -> 1 -> nullptr.",
            state: "rewire",
            registers: { "3->next": "2", prev: "3", curr: "4", nextTemp: "nullptr" },
          },
          {
            prev: 4,
            curr: null,
            next: null,
            stepTitle: "5. Reverse Node 4 Pointer",
            text: "Rewire Node 4: Point 4->next = 3. Final arrow reversed! Advance prev=4, curr=nullptr.",
            subtext: "All 4 pointers are now reversed.",
            state: "rewire",
            registers: { "4->next": "3", prev: "4", curr: "nullptr" },
          },
          {
            prev: 4,
            curr: null,
            next: null,
            stepTitle: "6. Null Termination Detection",
            text: "Loop Termination: curr reached nullptr. The traversal is finished.",
            subtext: "Pointer 'prev' now securely references the brand new head: Node(4)!",
            state: "success",
            registers: { NewHead: "prev (Node 4)", curr: "nullptr" },
          },
          {
            prev: 4,
            curr: null,
            next: null,
            stepTitle: "7. Return New Head",
            text: "Return New Head: Function returns prev (Node 4). Full chain is now [4 -> 3 -> 2 -> 1 -> nullptr].",
            subtext: "Zero additional heap memory was allocated.",
            state: "success",
            registers: { Result: "[4, 3, 2, 1]", Space: "O(1) In-Place" },
          },
          {
            prev: 4,
            curr: null,
            next: null,
            stepTitle: "8. Algorithmic Masterclass",
            text: "In-Place Perfection: Reversal executed in a single pass O(N) time with O(1) auxiliary space!",
            subtext: "A favorite interview question worldwide mastered in 3D!",
            state: "success",
            registers: { TimeComplexity: "O(N)", SpaceComplexity: "O(1)" },
          },
        ],
        cppCode: `// C++: Reverse Singly Linked List In-Place O(N)
ListNode* reverseList(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* curr = head;

    while (curr != nullptr) {
        ListNode* nextTemp = curr->next; // Guard the rest of the list
        curr->next = prev;              // Reverse the pointer arrow
        prev = curr;                    // Move prev forward
        curr = nextTemp;                // Move curr forward
    }
    return prev; // New head of reversed list
}`,
        starterCode: `// Complete the linked list reversal algorithm in C++
ListNode* reverse(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* curr = head;
    while (curr) {
        ListNode* nxt = curr->next;
        curr->next = prev;
        prev = curr;
        curr = nxt;
    }
    return prev;
}`,
        expectedResult: "[4, 3, 2, 1]",
        testInput: "reverse([1, 2, 3, 4])",
        question: "Why must we store 'curr->next' in a temporary variable before executing 'curr->next = prev'?",
        options: [
          "Because changing curr->next severs the link, and without saving it we lose access to the rest of the list",
          "To verify that the value is not negative",
          "To allocate new heap memory"
        ],
        answer: 0,
        explanation: "Once curr->next is pointed to prev, the original connection to the next node is broken. Storing it in nextTemp beforehand ensures we can continue traversing."
      }
    ]
  },
  {
    id: "algo-stacks-queues",
    code: "STK",
    order: "03",
    title: "Stacks & Queues",
    subtitle: "LIFO vs FIFO Buffers & Call-Stack Architecture",
    description:
      "Master Last-In-First-Out and First-In-First-Out data structures, compiler call-stack mechanics, and balanced symbol verification.",
    accent: "#8b5cf6", // Royal Violet
    secondaryAccent: "#a78bfa",
    glowColor: "rgba(139, 92, 246, 0.55)",
    position: [6.4, 1.4, 1.2],
    cameraPosition: [6.4, 5.2, 7.8],
    cameraTarget: [6.4, 1.6, 1.2],
    complexity: { time: "O(1) Push/Pop", space: "O(N)" },
    lessons: [
      {
        id: "stk-lifo",
        title: "Stack (LIFO) & Balanced Parentheses",
        subtitle: "Last-In-First-Out mechanism used by compilers and undo engines",
        analogyTitle: "The Cafeteria Tray Stack 🥞",
        analogyDescription:
          "Imagine a stack of cafeteria trays or pancakes. When a clean tray is added, it goes on top. When someone takes a tray, they take the top one—the last one placed! That's a Stack (LIFO: Last-In, First-Out). It's used in undo buttons, browser back buttons, and compiler bracket matchers.",
        concept:
          "A Stack permits additions and removals only at the 'top' (LIFO: Last In, First Out). The classic application is validating nested brackets: opening symbols '(', '[', '{' are pushed onto the stack.",
        timeComplexity: "O(1) Push & Pop · O(N) Validation",
        spaceComplexity: "O(N) Stack Space",
        visualizerType: "stack",
        demoData: ["(", "[", "]", ")"],
        steps: [
          {
            op: "idle",
            item: "",
            stack: [],
            stepTitle: "1. Initialize Quantum LIFO Chamber",
            text: "Stack Chamber Initialized: Quantum LIFO Buffer is empty. Pointer TOP points to base (depth 0).",
            subtext: "Expression to evaluate: '( [ ] )'",
            state: "idle",
            registers: { Depth: 0, TOP: "nullptr", Status: "Empty Stack" },
          },
          {
            op: "push",
            item: "(",
            stack: ["("],
            stepTitle: "2. Push Symbol '('",
            text: "Encounter '(': Opening bracket detected! Push onto stack. TOP is now '('. Depth = 1.",
            subtext: "O(1) Push: Elements drop directly into the top of the chamber.",
            state: "push",
            registers: { Operation: "PUSH '('", TOP: "'('", Depth: 1 },
          },
          {
            op: "push",
            item: "[",
            stack: ["(", "["],
            stepTitle: "3. Push Symbol '['",
            text: "Encounter '[': Nested opening bracket! Push onto stack. TOP is now '['. Depth = 2.",
            subtext: "LIFO order ensures the most recent opening bracket must be matched first.",
            state: "push",
            registers: { Operation: "PUSH '['", TOP: "'['", Depth: 2 },
          },
          {
            op: "compare",
            item: "]",
            stack: ["(", "["],
            stepTitle: "4. Read Closing Symbol ']'",
            text: "Encounter ']': Closing bracket detected! Inspect current TOP symbol: '['.",
            subtext: "Does ']' match TOP '['? Yes! Square bracket matches square bracket.",
            state: "compare",
            registers: { Symbol: "']'", TOP: "'['", Match: "TRUE" },
          },
          {
            op: "pop",
            item: "]",
            stack: ["("],
            stepTitle: "5. Pop Symbol '['",
            text: "Pop Match: '[' popped from stack! Discarded successfully. TOP returns to '('. Depth = 1.",
            subtext: "O(1) Pop: Chamber top element lifts out instantaneously.",
            state: "pop",
            registers: { Operation: "POP", NewTOP: "'('", Depth: 1 },
          },
          {
            op: "compare",
            item: ")",
            stack: ["("],
            stepTitle: "6. Read Closing Symbol ')'",
            text: "Encounter ')': Closing bracket detected! Inspect current TOP symbol: '('.",
            subtext: "Does ')' match TOP '('? Yes! Parenthesis matches parenthesis.",
            state: "compare",
            registers: { Symbol: "')'", TOP: "'('", Match: "TRUE" },
          },
          {
            op: "pop",
            item: ")",
            stack: [],
            stepTitle: "7. Pop Symbol '('",
            text: "Pop Match: '(' popped from stack! Buffer is now completely empty. Depth = 0.",
            subtext: "All opened brackets have been matched in strictly correct nested order.",
            state: "pop",
            registers: { Operation: "POP", NewTOP: "nullptr", Depth: 0 },
          },
          {
            op: "success",
            item: "",
            stack: [],
            stepTitle: "8. Validation Verified",
            text: "Expression Valid: End of string reached and stack is empty! Valid nesting verified in O(N) time!",
            subtext: "If any unmatched bracket remained or top mismatched, it would be marked invalid.",
            state: "success",
            registers: { Expression: "VALID", TimeComplexity: "O(N)", SpaceComplexity: "O(N)" },
          },
        ],
        cppCode: `// C++: Balanced Parentheses with std::stack O(N)
#include <iostream>
#include <stack>
#include <string>

bool isValid(const std::string& s) {
    std::stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') {
            st.push(c); // O(1) Push
        } else {
            if (st.empty()) return false;
            char top = st.top();
            if ((c == ')' && top != '(') ||
                (c == ']' && top != '[') ||
                (c == '}' && top != '{')) {
                return false;
            }
            st.pop(); // O(1) Pop
        }
    }
    return st.empty();
}`,
        starterCode: `// Complete the balanced parentheses checker in C++
#include <stack>
#include <string>

bool checkParentheses(std::string s) {
    std::stack<char> st;
    for (char c : s) {
        if (c == '(') st.push(c);
        else if (c == ')') {
            if (st.empty()) return false;
            st.pop();
        }
    }
    return st.empty();
}`,
        expectedResult: "true",
        testInput: "'(())'",
        question: "If the input string is '([)]', why does the stack algorithm report it as invalid?",
        options: [
          "Because ')' is processed when the top of the stack is '[', violating proper nesting order",
          "Because stacks cannot process square brackets",
          "Because the string has an odd number of characters"
        ],
        answer: 0,
        explanation: "A stack enforces strict nesting. The most recently opened bracket '[' must be closed with ']' before any outer bracket can be closed."
      }
    ]
  },
  {
    id: "algo-sorting-searching",
    code: "SRT",
    order: "04",
    title: "Sorting & Searching",
    subtitle: "Divide & Conquer, Logarithmic Search & Partitions",
    description:
      "Visualize logarithmic binary search O(log N), comparison sorts, and divide-and-conquer powerhouses: Quick Sort and Merge Sort.",
    accent: "#f59e0b", // Amber Gold
    secondaryAccent: "#fbbf24",
    glowColor: "rgba(245, 158, 11, 0.55)",
    position: [-8.2, 2.2, -4.2],
    cameraPosition: [-8.2, 6.2, 2.8],
    cameraTarget: [-8.2, 2.2, -4.2],
    complexity: { time: "O(N log N)", space: "O(log N)" },
    lessons: [
      {
        id: "srt-binary-search",
        title: "Binary Search: O(log N) Efficiency",
        subtitle: "Halving the search space at every single decision step",
        analogyTitle: "The Magic Book Page Guessing Game 📖",
        analogyDescription:
          "Imagine a 1,000-page book and you are searching for page 750. Would you flip pages 1, 2, 3 one by one? Never! You open the book right in the middle at page 500. Since 750 is higher, you instantly discard the entire first half and repeat the process on the remaining half! In less than 10 steps, you can pinpoint any page!",
        concept:
          "Binary Search locates a target in a sorted collection by comparing it with the midpoint. If target < mid, the entire right half is eliminated; if target > mid, the left half is eliminated.",
        timeComplexity: "O(log N) Logarithmic Time",
        spaceComplexity: "O(1) Iterative Space",
        visualizerType: "binary-search",
        demoData: [3, 9, 14, 22, 38, 51, 64, 77, 85, 99],
        target: 64,
        steps: [
          {
            low: 0,
            high: 9,
            mid: 4,
            midVal: 38,
            stepTitle: "1. Establish Search Range",
            text: "Range Initialization: 10 sorted elements. Low = 0 (val 3), High = 9 (val 99). Target = 64.",
            subtext: "Entire array is currently candidate search space.",
            registers: { Low: 0, High: 9, Target: 64, SpaceSize: 10 },
          },
          {
            low: 0,
            high: 9,
            mid: 4,
            midVal: 38,
            stepTitle: "2. Calculate Midpoint #1",
            text: "Midpoint Calculation: mid = Low + (High - Low)/2 = 0 + 4 = 4. arr[4] = 38.",
            subtext: "Using Low + (High - Low)/2 avoids 32-bit integer overflow.",
            registers: { Low: 0, High: 9, Mid: 4, "arr[Mid]": 38, Target: 64 },
          },
          {
            low: 0,
            high: 9,
            mid: 4,
            midVal: 38,
            stepTitle: "3. Comparison #1: 64 > 38",
            text: "Comparison: Is 64 == 38? No. 64 > 38! Because the array is sorted, 64 cannot exist in [0..4].",
            subtext: "We can discard the entire left half with 100% mathematical certainty!",
            registers: { Comparison: "64 > 38", Action: "Discard Left Half [0..4]" },
          },
          {
            low: 5,
            high: 9,
            mid: 7,
            midVal: 77,
            stepTitle: "4. Prune Range & Calculate Midpoint #2",
            text: "Prune Left: Set Low = mid + 1 = 5. New range is [5..9]. Mid = 5 + (9 - 5)/2 = 7. arr[7] = 77.",
            subtext: "Search space cut in half from 10 to 5 elements!",
            registers: { Low: 5, High: 9, Mid: 7, "arr[Mid]": 77, Target: 64 },
          },
          {
            low: 5,
            high: 9,
            mid: 7,
            midVal: 77,
            stepTitle: "5. Comparison #2: 64 < 77",
            text: "Comparison: Is 64 == 77? No. 64 < 77! Target is smaller, so discard the right half [7..9].",
            subtext: "Set High = mid - 1 = 6. Only 2 candidate elements remain!",
            registers: { Comparison: "64 < 77", Action: "Discard Right Half [7..9]" },
          },
          {
            low: 5,
            high: 6,
            mid: 6,
            midVal: 64,
            stepTitle: "6. Calculate Midpoint #3",
            text: "Narrowed Range: Low = 5, High = 6. Mid = 5 + (6 - 5)/2 = 5 or 6. Checking index 6: arr[6] = 64.",
            subtext: "Only 2 candidate elements remained.",
            registers: { Low: 5, High: 6, Mid: 6, "arr[Mid]": 64, Target: 64 },
          },
          {
            low: 5,
            high: 6,
            mid: 6,
            midVal: 64,
            stepTitle: "7. Target Acquired!",
            text: "Match Discovered!: arr[6] == 64! Target found in index 6 after only 3 comparisons!",
            subtext: "Linear search would have required 7 comparisons.",
            registers: { Index: 6, Target: 64, Comparisons: 3, Status: "FOUND!" },
          },
          {
            low: 6,
            high: 6,
            mid: 6,
            midVal: 64,
            stepTitle: "8. Logarithmic O(log N) Superpower",
            text: "Logarithmic Power: In an array of 1,000,000 items, Binary Search finds any item in only 20 steps! O(log N) efficiency.",
            subtext: "Every comparison cuts the remaining search space by 50%.",
            registers: { TimeComplexity: "O(log N)", Max1MSteps: 20 },
          },
        ],
        cppCode: `// C++: Logarithmic Binary Search O(log N)
#include <iostream>
#include <vector>

int binarySearch(const std::vector<int>& arr, int target) {
    int low = 0;
    int high = arr.size() - 1;

    while (low <= high) {
        int mid = low + (high - low) / 2; // Prevents overflow

        if (arr[mid] == target) {
            return mid; // Target found!
        } else if (arr[mid] < target) {
            low = mid + 1;  // Discard left half
        } else {
            high = mid - 1; // Discard right half
        }
    }
    return -1; // Not found
}`,
        starterCode: `// Write Binary Search in C++
#include <vector>

int findIndex(const std::vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
        expectedResult: "6",
        testInput: "target = 64 on [3, 9, 14, 22, 38, 51, 64, 77, 85, 99]",
        question: "What is the maximum number of comparisons Binary Search needs to find an item in a sorted list of 1,024 elements?",
        options: [
          "10 comparisons (since 2^10 = 1,024)",
          "512 comparisons",
          "1,024 comparisons"
        ],
        answer: 0,
        explanation: "Because the search space is cut in half at every step, log2(1024) = 10 comparisons is the theoretical maximum."
      }
    ]
  },
  {
    id: "algo-trees",
    code: "TRE",
    order: "05",
    title: "Binary Trees & BST",
    subtitle: "Hierarchical Traversal & Binary Search Invariant",
    description:
      "Construct recursive tree topologies, master DFS traversals (In-order, Pre-order, Post-order), and exploit the BST ordering invariant.",
    accent: "#14b8a6", // Teal/Aquamarine
    secondaryAccent: "#2dd4bf",
    glowColor: "rgba(20, 184, 166, 0.55)",
    position: [8.2, 2.2, -4.2],
    cameraPosition: [8.2, 6.2, 2.8],
    cameraTarget: [8.2, 2.2, -4.2],
    complexity: { time: "O(log N) BST", space: "O(H) Height" },
    lessons: [
      {
        id: "tre-structure-bst",
        title: "Binary Search Tree (BST) Invariant",
        subtitle: "Left subtree is strictly smaller; right subtree is strictly greater",
        analogyTitle: "The Video Game Skill Tree 🌳",
        analogyDescription:
          "Imagine a skill tree in your favorite RPG, branching out from a starting skill. The golden rule of a Binary Search Tree (BST): anything smaller than a node goes down the left branch, and anything larger goes down the right branch! This allows you to find any skill at lightning speed by comparing at each split.",
        concept:
          "In a Binary Search Tree, every node satisfies the invariant: all nodes in its left subtree have keys smaller than its own key, and all nodes in its right subtree have keys greater.",
        timeComplexity: "O(log N) Balanced · O(N) Skewed",
        spaceComplexity: "O(H) Recursion Stack",
        visualizerType: "binary-tree",
        demoTree: {
          val: 50,
          left: { val: 30, left: { val: 20 }, right: { val: 40 } },
          right: { val: 70, left: { val: 60 }, right: { val: 80 } }
        },
        targetVal: 60,
        steps: [
          {
            current: 50,
            stepTitle: "1. Invariant & Target Setup",
            text: "BST Invariant Setup: Left < Node < Right. Search target = 60. Start inspection at Root Node(50).",
            subtext: "Every node splits the remaining search path into two branches.",
            registers: { Current: 50, Target: 60, Level: 0 },
          },
          {
            current: 50,
            stepTitle: "2. Compare at Root: 60 > 50",
            text: "Root Comparison: 60 > 50. By BST rule, 60 MUST reside in the RIGHT subtree!",
            subtext: "The entire left subtree (values 30, 20, 40) is pruned instantly without visiting!",
            registers: { Comparison: "60 > 50", Action: "Descend RIGHT child", PrunedSubtree: "Left (30, 20, 40)" },
          },
          {
            current: 70,
            stepTitle: "3. Descend to Right Child",
            text: "Branch Transition: Travel down energy conduit to Node(70). Level 1 reached.",
            subtext: "We are now at the root of the right subtree.",
            registers: { Current: 70, Target: 60, Level: 1 },
          },
          {
            current: 70,
            stepTitle: "4. Compare at Node 70: 60 < 70",
            text: "Node 70 Comparison: 60 < 70. By BST rule, 60 MUST reside in the LEFT subtree of 70!",
            subtext: "Node 80 and its entire right branch are pruned instantly!",
            registers: { Comparison: "60 < 70", Action: "Descend LEFT child", PrunedSubtree: "Right (80)" },
          },
          {
            current: 60,
            stepTitle: "5. Descend to Left Child",
            text: "Branch Transition: Travel down energy conduit to Node(60). Level 2 reached.",
            subtext: "Arrive at candidate node.",
            registers: { Current: 60, Target: 60, Level: 2 },
          },
          {
            current: 60,
            stepTitle: "6. Match Found!",
            text: "Match Discovered!: Node(60) == Target 60! Node acquired in only 2 branch transitions!",
            subtext: "Found in O(H) height steps where H = 2.",
            registers: { Target: 60, Node: 60, Status: "TARGET ACQUIRED!" },
          },
          {
            current: 60,
            stepTitle: "7. In-Order Traversal Invariant",
            text: "In-Order Property: In-order traversal (Left, Root, Right) of this BST produces sorted numbers: [20, 30, 40, 50, 60, 70, 80].",
            subtext: "BSTs naturally maintain sorted ordering at all times.",
            registers: { InOrder: "[20, 30, 40, 50, 60, 70, 80]" },
          },
          {
            current: 60,
            stepTitle: "8. Tree Complexity Overview",
            text: "Complexity Overview: Search, Insert, and Delete operate in O(log N) time on balanced trees! Height H = log2(N).",
            subtext: "Self-balancing trees (AVL, Red-Black) prevent degradation into linear O(N) chains.",
            registers: { TimeComplexity: "O(log N)", SpaceComplexity: "O(H)" },
          },
        ],
        cppCode: `// C++: Binary Search Tree (BST) Search O(log N)
struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

TreeNode* searchBST(TreeNode* root, int val) {
    if (root == nullptr || root->val == val) {
        return root; // Found or empty
    }
    if (val < root->val) {
        return searchBST(root->left, val);  // Search left subtree
    }
    return searchBST(root->right, val);     // Search right subtree
}`,
        starterCode: `// Complete search in a Binary Search Tree in C++
TreeNode* findInBST(TreeNode* root, int key) {
    if (!root || root->val == key) return root;
    if (key < root->val) return findInBST(root->left, key);
    return findInBST(root->right, key);
}`,
        expectedResult: "TreeNode(60)",
        testInput: "search(60) on BST with root 50",
        question: "Which tree traversal of a valid Binary Search Tree visits values in strictly sorted ascending order?",
        options: [
          "In-Order Traversal (Left, Root, Right)",
          "Pre-Order Traversal (Root, Left, Right)",
          "Post-Order Traversal (Left, Right, Root)"
        ],
        answer: 0,
        explanation: "In-order traversal visits all smaller elements in the left subtree first, then the current node, then the larger elements in the right subtree, producing naturally sorted order."
      }
    ]
  },
  {
    id: "algo-hash-tables",
    code: "HSH",
    order: "06",
    title: "Hash Tables & Maps",
    subtitle: "Hash Functions, Collisions & O(1) Lookup",
    description:
      "Transform arbitrary keys into integer bucket indices using cryptographic and mathematical hash functions to achieve amortized O(1) lookups.",
    accent: "#ec4899", // Quantum Magenta
    secondaryAccent: "#f472b6",
    glowColor: "rgba(236, 72, 153, 0.55)",
    position: [-4.4, 3.4, -9.0],
    cameraPosition: [-4.4, 7.2, -1.8],
    cameraTarget: [-4.4, 3.4, -9.0],
    complexity: { time: "O(1) Amortized", space: "O(N)" },
    lessons: [
      {
        id: "hsh-lookup-chaining",
        title: "Hash Functions & O(1) Dictionary Lookups",
        subtitle: "How hash maps turn words into instant memory locations",
        analogyTitle: "The Instant Magic Cubbyhole 🗝️",
        analogyDescription:
          "Imagine a magic sorting machine: you give it any word or name, and it runs a quick formula to tell you the exact shelf number where it belongs! You walk directly to that shelf in a fraction of a second instead of searching through every shelf. That is how Hash Functions and dictionaries provide instant O(1) lookups.",
        concept:
          "A Hash Table maps keys to values. It runs the key through a hash function: hash(key) % capacity to determine the storage bucket index.",
        timeComplexity: "O(1) Average · O(N) Worst Case",
        spaceComplexity: "O(N) Bucket Array",
        visualizerType: "hash-table",
        steps: [
          {
            key: "user:neo",
            hash: 104,
            bucket: 4,
            stepTitle: "1. Hash Key 'user:neo'",
            text: "Hash Engine: Compute hash('user:neo') = 104. Modulo 5 buckets: 104 % 5 = Index 4.",
            subtext: "The hash function maps arbitrary text into a compact integer bucket index.",
            registers: { Key: "'user:neo'", Hash: 104, Formula: "104 % 5", Bucket: 4 },
          },
          {
            key: "user:neo",
            hash: 104,
            bucket: 4,
            stepTitle: "2. Store in Bucket 4",
            text: "Insert Value: Store pair ['user:neo' -> 'Thomas'] into Bucket 4 in O(1) time.",
            subtext: "Bucket 4 now holds its first key-value entry.",
            registers: { Bucket: 4, Entry: "['user:neo' -> 'Thomas']", Status: "Stored" },
          },
          {
            key: "user:trinity",
            hash: 72,
            bucket: 2,
            stepTitle: "3. Hash Key 'user:trinity'",
            text: "Hash Engine: Compute hash('user:trinity') = 72. Modulo 5: 72 % 5 = Index 2.",
            subtext: "Independent key hashes to a completely separate bucket.",
            registers: { Key: "'user:trinity'", Hash: 72, Formula: "72 % 5", Bucket: 2 },
          },
          {
            key: "user:trinity",
            hash: 72,
            bucket: 2,
            stepTitle: "4. Store in Bucket 2",
            text: "Insert Value: Store pair ['user:trinity' -> 'Captain'] into Bucket 2 in O(1) time.",
            subtext: "No collision; bucket 2 was empty.",
            registers: { Bucket: 2, Entry: "['user:trinity' -> 'Captain']", Status: "Stored" },
          },
          {
            key: "user:morpheus",
            hash: 84,
            bucket: 4,
            stepTitle: "5. Hash Collision Detected!",
            text: "Collision Event!: hash('user:morpheus') % 5 = Index 4! Bucket 4 already holds 'user:neo'.",
            subtext: "Collisions are natural when infinite keys map into finite array buckets.",
            registers: { Key: "'user:morpheus'", Bucket: 4, Status: "COLLISION!" },
          },
          {
            key: "user:morpheus",
            hash: 84,
            bucket: 4,
            stepTitle: "6. Chaining via Linked List",
            text: "Separate Chaining: Append ['user:morpheus' -> 'Leader'] as a linked list node in Bucket 4.",
            subtext: "Chaining ensures zero data loss during hash collisions.",
            registers: { Bucket: 4, ChainLength: 2, CollisionHandling: "Chaining" },
          },
          {
            key: "lookup",
            target: "user:neo",
            bucket: 4,
            stepTitle: "7. O(1) Lookup Query",
            text: "Lookup 'user:neo': Re-hash key -> 104 % 5 = Bucket 4. Direct jump to Bucket 4 in O(1) time!",
            subtext: "We completely skipped inspecting Buckets 0, 1, 2, and 3.",
            registers: { Query: "'user:neo'", TargetBucket: 4, Result: "'Thomas'" },
          },
          {
            key: "lookup",
            target: "user:neo",
            bucket: 4,
            stepTitle: "8. Amortized O(1) Mastery",
            text: "Mastery: Hash tables provide average O(1) search, insert, and delete operations! Modern systems rely on them everywhere.",
            subtext: "With a uniform hash function and good load factor, collisions are minimal.",
            registers: { TimeComplexity: "O(1) Avg", SpaceComplexity: "O(N)" },
          },
        ],
        cppCode: `// C++: Fast O(1) Hash Map with std::unordered_map
#include <iostream>
#include <unordered_map>
#include <vector>

std::vector<int> twoSum(const std::vector<int>& nums, int target) {
    std::unordered_map<int, int> seen; // Value -> Index map

    for (int i = 0; i < static_cast<int>(nums.size()); ++i) {
        int complement = target - nums[i];
        if (seen.find(complement) != seen.end()) {
            return {seen[complement], i}; // O(1) lookup!
        }
        seen[nums[i]] = i;
    }
    return {};
}`,
        starterCode: `// Complete Two Sum using std::unordered_map in C++
#include <unordered_map>
#include <vector>

std::vector<int> solveTwoSum(std::vector<int>& nums, int target) {
    std::unordered_map<int, int> map;
    for (int i = 0; i < nums.size(); i++) {
        int diff = target - nums[i];
        if (map.count(diff)) return {map[diff], i};
        map[nums[i]] = i;
    }
    return {};
}`,
        expectedResult: "[0, 1]",
        testInput: "nums = [2, 7, 11, 15], target = 9",
        question: "What happens when two different keys generate the exact same bucket index in a hash table?",
        options: [
          "A collision occurs, which is handled via chaining (linked lists) or open addressing",
          "The program crashes with an unrecoverable error",
          "The table automatically deletes the older item"
        ],
        answer: 0,
        explanation: "Collisions are natural in finite bucket arrays. High-performance hash maps handle them gracefully using techniques like chaining so no data is lost."
      }
    ]
  },
  {
    id: "algo-graphs",
    code: "GRP",
    order: "07",
    title: "Graphs & Network Traversal",
    subtitle: "Vertices, Edges, BFS Wavefronts & DFS Deep Search",
    description:
      "Navigate interconnected nodes, shortest path discoveries with Breadth-First Search, topological dependencies, and cycle detections.",
    accent: "#6366f1", // Indigo / Nebula
    secondaryAccent: "#818cf8",
    glowColor: "rgba(99, 102, 241, 0.55)",
    position: [4.4, 3.4, -9.0],
    cameraPosition: [4.4, 7.2, -1.8],
    cameraTarget: [4.4, 3.4, -9.0],
    complexity: { time: "O(V + E)", space: "O(V)" },
    lessons: [
      {
        id: "grp-bfs-traversal",
        title: "Breadth-First Search (BFS): Shortest Path",
        subtitle: "Concentric layer-by-layer exploration using a FIFO queue",
        analogyTitle: "Water Ripples on a Calm Lake 🌊",
        analogyDescription:
          "When you drop a pebble into a calm lake, how do the waves spread? They ripple outward in expanding concentric circles! That's exactly how Breadth-First Search (BFS) works: it explores all locations 1 step away, then 2 steps away, then 3 steps away, guaranteeing that the first time it reaches a destination, it found the shortest possible path!",
        concept:
          "BFS visits all neighbors at distance 1 before moving to distance 2. Because it explores in expanding concentric ripples, the first time it reaches a target node in an unweighted graph, it has guaranteed found the shortest possible path.",
        timeComplexity: "O(V + E) Vertices & Edges",
        spaceComplexity: "O(V) Queue & Visited Set",
        visualizerType: "graph-bfs",
        steps: [
          {
            current: "A",
            queue: ["A"],
            visited: ["A"],
            stepTitle: "1. Enqueue Source Node",
            text: "Start at Source Node A. Enqueue A and mark as visited in visited set {A}.",
            subtext: "FIFO Queue initializes layer-by-layer wavefront exploration.",
            registers: { Current: "A", Queue: "[A]", Visited: "{A}", Wavefront: 0 },
          },
          {
            current: "A",
            queue: ["B", "C"],
            visited: ["A", "B", "C"],
            stepTitle: "2. Explore Distance-1 Neighbors",
            text: "Dequeue A: Inspect unvisited neighbors of A: {B, C}. Mark visited and enqueue B and C.",
            subtext: "Concentric ripple 1 expands outwards to all immediate neighbors.",
            registers: { Dequeued: "A", Enqueued: "[B, C]", Visited: "{A, B, C}", Wavefront: 1 },
          },
          {
            current: "B",
            queue: ["C", "D"],
            visited: ["A", "B", "C", "D"],
            stepTitle: "3. Explore from Node B",
            text: "Dequeue B: Inspect unvisited neighbors of B: {D}. Mark D visited and enqueue D. Queue is now [C, D].",
            subtext: "Node B is finished. Exploration moves to remaining nodes in Layer 1.",
            registers: { Dequeued: "B", Enqueued: "[D]", Queue: "[C, D]", Visited: "{A, B, C, D}" },
          },
          {
            current: "C",
            queue: ["D", "E"],
            visited: ["A", "B", "C", "D", "E"],
            stepTitle: "4. Explore from Node C",
            text: "Dequeue C: Inspect unvisited neighbors of C: {E}. Mark E visited and enqueue E. Queue is now [D, E].",
            subtext: "All nodes at Distance 1 are now completely processed!",
            registers: { Dequeued: "C", Enqueued: "[E]", Queue: "[D, E]", Visited: "{A, B, C, D, E}" },
          },
          {
            current: "D",
            queue: ["E"],
            visited: ["A", "B", "C", "D", "E"],
            stepTitle: "5. Explore from Node D",
            text: "Dequeue D: D has no unvisited neighbors. Exploration of branch terminates. Queue: [E].",
            subtext: "Queue continues advancing to the next concentric layer.",
            registers: { Dequeued: "D", Queue: "[E]", Status: "No unvisited neighbors" },
          },
          {
            current: "E",
            queue: [],
            visited: ["A", "B", "C", "D", "E"],
            stepTitle: "6. Explore from Node E",
            text: "Dequeue E: E has no unvisited neighbors. Queue is now completely empty.",
            subtext: "All reachable vertices in the graph component have been visited.",
            registers: { Dequeued: "E", Queue: "[]", Status: "Queue Empty" },
          },
          {
            current: "E",
            queue: [],
            visited: ["A", "B", "C", "D", "E"],
            stepTitle: "7. Shortest Path Guaranteed",
            text: "Shortest Path Guarantee: Because BFS explores concentric layers, the first time any node is reached, it is guaranteed the shortest path!",
            subtext: "Used by GPS navigators and social network 'degrees of separation'.",
            registers: { ShortestPathToD: "A -> B -> D (2 hops)", ShortestPathToE: "A -> C -> E (2 hops)" },
          },
          {
            current: "E",
            queue: [],
            visited: ["A", "B", "C", "D", "E"],
            stepTitle: "8. Graph Traversal Victory",
            text: "Graph Mastery: Total time complexity O(V + E) where V=vertices and E=edges. Space complexity O(V) for the queue.",
            subtext: "BFS is the fundamental building block of network routing algorithms.",
            registers: { TimeComplexity: "O(V + E)", SpaceComplexity: "O(V)" },
          },
        ],
        cppCode: `// C++: Breadth-First Search (BFS) Shortest Path O(V + E)
#include <iostream>
#include <vector>
#include <queue>
#include <unordered_set>

void bfs(int startNode, const std::vector<std::vector<int>>& adj) {
    std::queue<int> q;
    std::unordered_set<int> visited;

    q.push(startNode);
    visited.insert(startNode);

    while (!q.empty()) {
        int curr = q.front();
        q.pop();
        std::cout << "Visiting node: " << curr << std::endl;

        for (int neighbor : adj[curr]) {
            if (visited.find(neighbor) == visited.end()) {
                visited.insert(neighbor);
                q.push(neighbor); // Enqueue next concentric layer
            }
        }
    }
}`,
        starterCode: `// Complete the BFS node count in C++
#include <queue>
#include <vector>

int countVisited(int start, const std::vector<std::vector<int>>& graph) {
    std::queue<int> q;
    std::vector<bool> visited(graph.size(), false);
    q.push(start);
    visited[start] = true;
    int count = 0;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        count++;
        for (int v : graph[u]) {
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }
    return count;
}`,
        expectedResult: "5 nodes visited",
        testInput: "5 connected nodes",
        question: "Why does BFS guarantee the shortest path in an unweighted graph?",
        options: [
          "Because it explores nodes in order of increasing distance from the start using a FIFO queue",
          "Because it sorts edges in descending order before traversal",
          "Because it always chooses the alphabetically first node"
        ],
        answer: 0,
        explanation: "By utilizing a FIFO queue, BFS finishes visiting all nodes at distance k before exploring any nodes at distance k+1, guaranteeing the shortest hop count."
      }
    ]
  },
  {
    id: "algo-dynamic-programming",
    code: "DYN",
    order: "08",
    title: "Dynamic Programming",
    subtitle: "Overlapping Subproblems & Optimal Substructure",
    description:
      "Transform exponential O(2^N) brute force recursion into blazing polynomial O(N) execution through memoization caches and bottom-up DP tables.",
    accent: "#f43f5e", // Ruby / Rose
    secondaryAccent: "#fb7185",
    glowColor: "rgba(244, 63, 94, 0.55)",
    position: [0, 4.4, -13.5],
    cameraPosition: [0, 8.8, -5.2],
    cameraTarget: [0, 4.5, -13.5],
    complexity: { time: "O(N) Tabulation", space: "O(N) Cache" },
    lessons: [
      {
        id: "dyn-fib-memo",
        title: "Memoization & The Fibonacci Lattice",
        subtitle: "Pruning repetitive recursion trees from O(2^N) down to O(N)",
        analogyTitle: "The Smart Cheat Sheet (Solve Each Problem Only Once!) 📝",
        analogyDescription:
          "If a teacher asks you: what is 1 + 1? You answer: 2. If they then ask: what is 1 + 1 + 1? You don't recount 1 + 1 from scratch! You remember that 1 + 1 is 2, and add 1 to get 3! Dynamic Programming is writing down previous answers on a smart cheat sheet so you never waste time recalculating things you already know.",
        concept:
          "Naive recursion recalculates the same subproblems repeatedly: fib(5) recalculates fib(3) twice, causing exponential O(2^N) explosion. Dynamic Programming solves each subproblem once, caches the result, and looks it up in O(1).",
        timeComplexity: "O(N) Linear Time (vs O(2^N) Brute Force)",
        spaceComplexity: "O(N) Cache / Tabulation",
        visualizerType: "dp-table",
        steps: [
          {
            i: 0,
            val: 0,
            stepTitle: "1. Base Case DP[0]",
            text: "Base Case 0: DP[0] = 0. Established as foundational ground truth.",
            subtext: "Every DP problem starts with known minimal base cases.",
            registers: { "DP[0]": 0, Subproblem: 0, Status: "Base Case" },
          },
          {
            i: 1,
            val: 1,
            stepTitle: "2. Base Case DP[1]",
            text: "Base Case 1: DP[1] = 1. Established as foundational ground truth.",
            subtext: "Now we have both predecessors needed to build subsequent answers.",
            registers: { "DP[1]": 1, Subproblem: 1, Status: "Base Case" },
          },
          {
            i: 2,
            val: 1,
            stepTitle: "3. Subproblem DP[2]",
            text: "Compute Subproblem 2: DP[2] = DP[1] + DP[0] = 1 + 0 = 1.",
            subtext: "O(1) table lookup: no re-computation of subproblems.",
            registers: { Formula: "DP[1] + DP[0]", "DP[2]": 1, Subproblem: 2 },
          },
          {
            i: 3,
            val: 2,
            stepTitle: "4. Subproblem DP[3]",
            text: "Compute Subproblem 3: DP[3] = DP[2] + DP[1] = 1 + 1 = 2.",
            subtext: "In naive recursion, fib(1) would be computed repeatedly; here it's read in 1 cycle!",
            registers: { Formula: "DP[2] + DP[1]", "DP[3]": 2, Subproblem: 3 },
          },
          {
            i: 4,
            val: 3,
            stepTitle: "5. Subproblem DP[4]",
            text: "Compute Subproblem 4: DP[4] = DP[3] + DP[2] = 2 + 1 = 3.",
            subtext: "The table continuously accumulates optimal solutions to smaller subproblems.",
            registers: { Formula: "DP[3] + DP[2]", "DP[4]": 3, Subproblem: 4 },
          },
          {
            i: 5,
            val: 5,
            stepTitle: "6. Target Subproblem DP[5]",
            text: "Final Target Reached: DP[5] = DP[4] + DP[3] = 3 + 2 = 5! Solution determined.",
            subtext: "We reached the target in strictly N additions.",
            registers: { Formula: "DP[4] + DP[3]", "DP[5]": 5, Subproblem: 5 },
          },
          {
            i: 5,
            val: 5,
            stepTitle: "7. Exponential to Linear Collapse",
            text: "Exponential Collapse: Naive recursion takes O(2^N) = 32 calls for N=5 (and over 1 trillion for N=40!). DP tabulation takes only N=5 additions!",
            subtext: "Overlapping subproblems were completely tamed.",
            registers: { NaiveCallsFor40: "> 1,000,000,000,000", DPAdditionsFor40: "40", Speedup: "> 25,000,000,000x" },
          },
          {
            i: 5,
            val: 5,
            stepTitle: "8. Optimal Substructure Mastered",
            text: "DP Victory: Solved in linear O(N) time with O(N) tabulation table (or O(1) space if keeping only 2 variables)!",
            subtext: "Dynamic Programming is the pinnacle of algorithmic elegance.",
            registers: { TimeComplexity: "O(N)", SpaceComplexity: "O(N) or O(1)" },
          },
        ],
        cppCode: `// C++: Dynamic Programming Bottom-Up Tabulation O(N)
#include <iostream>
#include <vector>

int fibonacciDP(int n) {
    if (n <= 1) return n;

    // Linear DP table avoiding exponential O(2^N) recursion
    std::vector<int> dp(n + 1);
    dp[0] = 0;
    dp[1] = 1;

    for (int i = 2; i <= n; ++i) {
        dp[i] = dp[i - 1] + dp[i - 2]; // O(1) table lookup
    }
    return dp[n];
}`,
        starterCode: `// Write Fibonacci using bottom-up tabulation in C++
#include <vector>

int fib(int n) {
    if (n <= 1) return n;
    std::vector<int> dp(n + 1);
    dp[0] = 0; dp[1] = 1;
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i-1] + dp[i-2];
    }
    return dp[n];
}`,
        expectedResult: "5",
        testInput: "n = 5",
        question: "What two core properties must a problem have to be solvable using Dynamic Programming?",
        options: [
          "Overlapping Subproblems and Optimal Substructure",
          "Linear time complexity and binary trees",
          "Keys must be stored exclusively in a hash table"
        ],
        answer: 0,
        explanation: "Dynamic programming applies when a problem can be broken down into subproblems whose solutions combine to form the overall optimum (Optimal Substructure), and those subproblems repeat many times (Overlapping Subproblems)."
      }
    ]
  }
];

/* ====================================================== */
/* PROGRESS PERSISTENCE                                   */
/* ====================================================== */

export function loadAlgoWorldProgress(userId = "guest") {
  try {
    const raw = localStorage.getItem(`codeland_algo_progress_${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return {
    completedSectors: [],
    completedLessons: [],
    xp: 0,
    lastActiveSector: "algo-arrays",
  };
}

export function saveAlgoWorldProgress(userId = "guest", progress) {
  try {
    localStorage.setItem(
      `codeland_algo_progress_${userId}`,
      JSON.stringify(progress)
    );
    window.dispatchEvent(new Event("codeland:update"));
  } catch {
    // storage not available
  }
}

export function resetAlgoWorldProgress(userId = "guest") {
  const blank = {
    completedSectors: [],
    completedLessons: [],
    xp: 0,
    lastActiveSector: "algo-arrays",
  };
  saveAlgoWorldProgress(userId, blank);
  return blank;
}
