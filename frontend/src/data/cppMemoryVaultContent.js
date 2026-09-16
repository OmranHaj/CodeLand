const cppMemoryVaultContent = {
  id: "cpp-memory-vault",

  title: "Memory Vault",

  subtitle: "Understand what happens underneath",

  world: "C++ Core",

  description:
    "Explore memory addresses, references, pointers, stack and heap concepts, dynamic memory, nullptr, and safer ownership patterns in C++.",

  execution: {
    mode: "backend-runner",
    enabled: false,
    language: "cpp",
  },

  lessons: [
    {
      id: "cpp-memory-addresses",
      title: "Memory Addresses",
      subtitle: "See where data lives",
      difficulty: "BEGINNER",
      estimatedMinutes: 10,
      xp: 120,

      blocks: [
        {
          id: "memory-addresses-text",
          type: "text",
          title: "Every stored value has an address",
          content:
            "When a variable exists in memory, C++ can tell you its address. The address-of operator & lets you inspect where that variable is stored.",
        },
        {
          id: "memory-addresses-code",
          type: "code",
          code: `int score = 95;

std::cout << score << "\\n";
std::cout << &score;`,
        },
        {
          id: "memory-addresses-tip",
          type: "tip",
          content:
            "The exact address can change between program runs. What matters is understanding that the variable has a location in memory.",
        },
      ],

      mission: {
        title: "Locate the Energy Cell",
        instructions:
          "Create an int named energy with the value 80 and print both its value and its address.",

        starterCode: `#include <iostream>

int main() {
  // Create energy and inspect its address

  return 0;
}`,

        hints: [
          "Create int energy = 80.",
          "Print energy first.",
          "Use &energy to access its address.",
        ],

        validation: [
          {
            type: "cppVariableEquals",
            variable: "energy",
            value: 80,
          },
          {
            type: "cppUsesAddressOf",
            variable: "energy",
          },
        ],
      },
    },

    {
      id: "cpp-memory-references",
      title: "References",
      subtitle: "Create another name for a value",
      difficulty: "BEGINNER",
      estimatedMinutes: 11,
      xp: 130,

      blocks: [
        {
          id: "references-text",
          type: "text",
          title: "A reference aliases an existing variable",
          content:
            "A reference gives an existing variable another name. Changes made through the reference affect the original value because both names refer to the same data.",
        },
        {
          id: "references-code",
          type: "code",
          code: `int power = 40;
int& powerRef = power;

powerRef = 75;

std::cout << power;`,
        },
        {
          id: "references-tip",
          type: "tip",
          content:
            "A reference should be initialized when it is created. After that, it stays bound to the same object.",
        },
      ],

      mission: {
        title: "Link a Reference",
        instructions:
          "Create a reference named scoreRef that refers to score, then use it to change score to 100.",

        starterCode: `#include <iostream>

int main() {
  int score = 25;

  // Create scoreRef and update score

  std::cout << score;
  return 0;
}`,

        hints: [
          "Use int& scoreRef = score.",
          "Assign 100 through scoreRef.",
          "Printing score should now show 100.",
        ],

        validation: [
          {
            type: "cppReferenceExists",
            variable: "scoreRef",
            target: "score",
          },
          {
            type: "cppOutputContains",
            value: "100",
          },
        ],
      },
    },

    {
      id: "cpp-memory-pointers",
      title: "Pointers",
      subtitle: "Store memory addresses",
      difficulty: "INTERMEDIATE",
      estimatedMinutes: 12,
      xp: 150,

      blocks: [
        {
          id: "pointers-text",
          type: "text",
          title: "Pointers store addresses",
          content:
            "A pointer is a variable whose value is a memory address. Use * in the declaration to create a pointer and & to give it the address of another variable.",
        },
        {
          id: "pointers-code",
          type: "code",
          code: `int lives = 3;
int* livesPtr = &lives;

std::cout << livesPtr;`,
        },
        {
          id: "pointers-tip",
          type: "tip",
          content:
            "The pointer stores an address. The pointed-to value is accessed separately by dereferencing the pointer.",
        },
      ],

      mission: {
        title: "Create a Memory Pointer",
        instructions:
          "Create an int pointer named levelPtr that stores the address of level.",

        starterCode: `#include <iostream>

int main() {
  int level = 7;

  // Create levelPtr

  return 0;
}`,

        hints: [
          "Use int* as the pointer type.",
          "Name it levelPtr.",
          "Assign &level.",
        ],

        validation: [
          {
            type: "cppPointerExists",
            variable: "levelPtr",
            target: "level",
          },
        ],
      },
    },

    {
      id: "cpp-memory-dereference",
      title: "Dereferencing",
      subtitle: "Read and change pointed-to values",
      difficulty: "INTERMEDIATE",
      estimatedMinutes: 12,
      xp: 150,

      blocks: [
        {
          id: "dereference-text",
          type: "text",
          title: "Dereferencing follows the address",
          content:
            "Using * with a pointer expression accesses the value stored at the pointed-to address. You can read that value or assign a new one.",
        },
        {
          id: "dereference-code",
          type: "code",
          code: `int health = 50;
int* healthPtr = &health;

*healthPtr = 90;

std::cout << health;`,
        },
        {
          id: "dereference-tip",
          type: "tip",
          content:
            "The * symbol has different roles depending on context: it declares a pointer and it also dereferences a pointer.",
        },
      ],

      mission: {
        title: "Modify Through the Pointer",
        instructions:
          "Use pointsPtr to change points from 20 to 45, then print points.",

        starterCode: `#include <iostream>

int main() {
  int points = 20;
  int* pointsPtr = &points;

  // Update points through pointsPtr

  std::cout << points;
  return 0;
}`,

        hints: [
          "Dereference pointsPtr with *pointsPtr.",
          "Assign 45 through the pointer.",
          "The original points variable should change.",
        ],

        validation: [
          {
            type: "cppPointerDereferenced",
            variable: "pointsPtr",
          },
          {
            type: "cppOutputContains",
            value: "45",
          },
        ],
      },
    },

    {
      id: "cpp-memory-nullptr",
      title: "nullptr & Pointer Safety",
      subtitle: "Represent no valid target",
      difficulty: "INTERMEDIATE",
      estimatedMinutes: 11,
      xp: 150,

      blocks: [
        {
          id: "nullptr-text",
          type: "text",
          title: "nullptr means the pointer points nowhere",
          content:
            "A pointer that does not currently refer to a valid object should be initialized to nullptr. Always check before dereferencing when a pointer may be null.",
        },
        {
          id: "nullptr-code",
          type: "code",
          code: `int* target = nullptr;

if (target != nullptr) {
  std::cout << *target;
}`,
        },
        {
          id: "nullptr-tip",
          type: "tip",
          content:
            "Never dereference nullptr. Checking first prevents invalid memory access.",
        },
      ],

      mission: {
        title: "Secure the Pointer",
        instructions:
          "Create an int pointer named target initialized to nullptr and check it before printing a pointed-to value.",

        starterCode: `#include <iostream>

int main() {
  // Create a safe null pointer

  return 0;
}`,

        hints: [
          "Use int* target = nullptr.",
          "Use an if condition before dereferencing.",
          "Compare target with nullptr.",
        ],

        validation: [
          {
            type: "cppPointerInitializedNull",
            variable: "target",
          },
          {
            type: "cppNullCheckExists",
            variable: "target",
          },
        ],
      },
    },

    {
      id: "cpp-memory-stack-heap",
      title: "Stack vs Heap",
      subtitle: "Understand two important memory regions",
      difficulty: "INTERMEDIATE",
      estimatedMinutes: 13,
      xp: 170,

      blocks: [
        {
          id: "stack-heap-text",
          type: "text",
          title: "Different lifetimes use different memory",
          content:
            "Local variables are commonly associated with automatic storage and are cleaned up when their scope ends. Dynamically allocated objects can outlive a block until their ownership releases them.",
        },
        {
          id: "stack-heap-code",
          type: "code",
          code: `void demo() {
  int localValue = 10;

  int* dynamicValue = new int(20);
  delete dynamicValue;
}`,
        },
        {
          id: "stack-heap-tip",
          type: "tip",
          content:
            "Modern C++ usually prefers automatic objects and standard containers. Manual dynamic allocation is important to understand, but should be used carefully.",
        },
      ],

      mission: {
        title: "Compare Two Lifetimes",
        instructions:
          "Create one normal local int and one dynamically allocated int pointer, then clean up the dynamic value.",

        starterCode: `#include <iostream>

int main() {
  // Create local and dynamic values

  return 0;
}`,

        hints: [
          "Create a normal int first.",
          "Use new int(...) for the dynamic value.",
          "Use delete before the program ends.",
        ],

        validation: [
          {
            type: "cppUsesNew",
          },
          {
            type: "cppUsesDelete",
          },
        ],
      },
    },

    {
      id: "cpp-memory-dynamic",
      title: "Dynamic Memory",
      subtitle: "Allocate and release intentionally",
      difficulty: "INTERMEDIATE",
      estimatedMinutes: 14,
      xp: 180,

      blocks: [
        {
          id: "dynamic-memory-text",
          type: "text",
          title: "new creates dynamic storage",
          content:
            "The new operator allocates an object dynamically and returns a pointer to it. When manually using new, the matching delete operation is required to release that allocation.",
        },
        {
          id: "dynamic-memory-code",
          type: "code",
          code: `int* value = new int(64);

std::cout << *value;

delete value;
value = nullptr;`,
        },
        {
          id: "dynamic-memory-tip",
          type: "tip",
          content:
            "After delete, setting the pointer to nullptr can make accidental reuse easier to detect. In modern application code, prefer RAII and smart ownership tools when possible.",
        },
      ],

      mission: {
        title: "Open and Close a Memory Cell",
        instructions:
          "Allocate an int with value 120, print it through the pointer, delete it, then set the pointer to nullptr.",

        starterCode: `#include <iostream>

int main() {
  // Allocate, use, release, and clear the pointer

  return 0;
}`,

        hints: [
          "Use new int(120).",
          "Dereference the pointer when printing.",
          "Delete it and then assign nullptr.",
        ],

        validation: [
          {
            type: "cppUsesNew",
            value: 120,
          },
          {
            type: "cppUsesDelete",
          },
          {
            type: "cppPointerAssignedNullAfterDelete",
          },
        ],
      },
    },

    {
      id: "cpp-memory-ownership",
      title: "Memory Discipline",
      subtitle: "Prefer clear ownership",
      difficulty: "INTERMEDIATE",
      estimatedMinutes: 14,
      xp: 190,

      blocks: [
        {
          id: "memory-discipline-text",
          type: "text",
          title: "Good C++ design makes ownership obvious",
          content:
            "Memory safety becomes easier when every resource has a clear owner. Prefer local objects, std::string, std::vector, and RAII-style types that clean themselves up automatically.",
        },
        {
          id: "memory-discipline-code",
          type: "code",
          code: `#include <vector>

std::vector<int> scores = {10, 20, 30};

scores.push_back(40);`,
        },
        {
          id: "memory-discipline-tip",
          type: "tip",
          content:
            "Understanding raw pointers is essential, but modern C++ often lets you avoid manual new/delete by using standard library types with automatic cleanup.",
        },
      ],

      mission: {
        title: "Choose Safer Storage",
        instructions:
          "Create a std::vector<int> named values, add one value with push_back, and print the vector size.",

        starterCode: `#include <iostream>
#include <vector>

int main() {
  // Use automatic resource management

  return 0;
}`,

        hints: [
          "Create std::vector<int> values.",
          "Use values.push_back(...).",
          "Print values.size().",
        ],

        validation: [
          {
            type: "cppVectorExists",
            variable: "values",
          },
          {
            type: "cppUsesPushBack",
            variable: "values",
          },
          {
            type: "cppUsesSize",
            variable: "values",
          },
        ],
      },
    },
  ],

  challenges: [
    {
      id: "cpp-memory-challenge-reference",
      title: "Reference Upgrade",
      subtitle: "Modify data without copying",
      difficulty: "CHALLENGE",
      estimatedMinutes: 15,
      xp: 240,

      description:
        "Write a function that accepts an int by reference and increases the original value.",

      starterCode: `#include <iostream>

int main() {
  int power = 50;

  // Build and use a reference-based upgrade function

  return 0;
}`,

      hints: [
        "Use an int& parameter.",
        "Modify the parameter inside the function.",
        "Print power after the call to prove the original changed.",
      ],

      validation: [
        {
          type: "cppFunctionHasReferenceParameter",
        },
        {
          type: "cppFunctionCalledFromMain",
        },
      ],
    },

    {
      id: "cpp-memory-challenge-pointer",
      title: "Pointer Repair",
      subtitle: "Modify data through an address",
      difficulty: "CHALLENGE",
      estimatedMinutes: 16,
      xp: 270,

      description:
        "Create a pointer to an existing variable and repair its value by dereferencing the pointer.",

      starterCode: `#include <iostream>

int main() {
  int integrity = 25;

  // Repair integrity through a pointer

  return 0;
}`,

      hints: [
        "Create a pointer to integrity.",
        "Dereference the pointer to update the original value.",
        "Print integrity after the change.",
      ],

      validation: [
        {
          type: "cppPointerExists",
          target: "integrity",
        },
        {
          type: "cppPointerDereferenced",
        },
      ],
    },

    {
      id: "cpp-memory-challenge-safe",
      title: "Safe Target Scanner",
      subtitle: "Guard pointer access",
      difficulty: "CHALLENGE",
      estimatedMinutes: 17,
      xp: 300,

      description:
        "Create a nullable pointer workflow that checks for nullptr before accessing the pointed-to value.",

      starterCode: `#include <iostream>

int main() {
  int* target = nullptr;

  // Build safe pointer access

  return 0;
}`,

      hints: [
        "Never dereference target before checking it.",
        "Use an if condition with nullptr.",
        "Print a fallback message when no target exists.",
      ],

      validation: [
        {
          type: "cppNullCheckExists",
          variable: "target",
        },
        {
          type: "cppHasIfElse",
        },
      ],
    },

    {
      id: "cpp-memory-challenge-dynamic",
      title: "Dynamic Energy Cell",
      subtitle: "Manage a manual allocation",
      difficulty: "CHALLENGE",
      estimatedMinutes: 18,
      xp: 330,

      description:
        "Allocate a dynamic integer, update and print it through a pointer, then correctly release the allocation.",

      starterCode: `#include <iostream>

int main() {
  // Manage one dynamic energy cell

  return 0;
}`,

      hints: [
        "Use new to allocate the int.",
        "Use *pointer to access the value.",
        "Match new with delete.",
      ],

      validation: [
        {
          type: "cppUsesNew",
        },
        {
          type: "cppPointerDereferenced",
        },
        {
          type: "cppUsesDelete",
        },
      ],
    },

    {
      id: "cpp-memory-challenge-vault",
      title: "Memory Vault System",
      subtitle: "Stabilize the vault",
      difficulty: "FINAL CHALLENGE",
      estimatedMinutes: 24,
      xp: 430,

      description:
        "Build a console memory lab that demonstrates references, pointers, safe nullptr checks, dynamic memory cleanup, and one automatically managed collection.",

      starterCode: `#include <iostream>
#include <vector>

int main() {
  // Build the Memory Vault System

  return 0;
}`,

      hints: [
        "Demonstrate at least one reference and one pointer.",
        "Include a nullptr safety check.",
        "If you use new, match it with delete, and include a std::vector for automatic storage management.",
      ],

      validation: [
        {
          type: "cppHasReference",
        },
        {
          type: "cppHasPointer",
        },
        {
          type: "cppNullCheckExists",
        },
        {
          type: "cppUsesDelete",
        },
        {
          type: "cppHasVector",
        },
        {
          type: "cppMinimumOutputStatements",
          minimum: 2,
        },
      ],
    },
  ],
};

export default cppMemoryVaultContent;
