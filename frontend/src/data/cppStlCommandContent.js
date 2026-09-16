const cppStlCommandContent = {
  id: "cpp-stl-command",

  title: "STL Command Center",

  subtitle: "Master C++ standard tools",

  world: "C++ Core",

  description:
    "Learn how to use the C++ Standard Library with vectors, strings, maps, sets, stacks, queues, iterators, algorithms, and reusable container patterns.",

  execution: {
    mode: "backend-runner",
    enabled: false,
    language: "cpp",
  },

  lessons: [
    {
      id: "cpp-stl-intro",
      title: "What Is the STL?",
      subtitle: "Use powerful built-in tools",
      difficulty: "BEGINNER",
      estimatedMinutes: 10,
      xp: 130,

      blocks: [
        {
          id: "stl-intro-text",
          type: "text",
          title: "The Standard Library gives you reusable building blocks",
          content:
            "The C++ Standard Library includes containers, algorithms, iterators, strings, and utilities that solve common programming problems without rebuilding everything from scratch.",
        },
        {
          id: "stl-intro-code",
          type: "code",
          code: `#include <vector>
#include <algorithm>

std::vector<int> values = {4, 2, 9, 1};

std::sort(values.begin(), values.end());`,
        },
        {
          id: "stl-intro-tip",
          type: "tip",
          content:
            "STL commonly refers to the library's container, iterator, and algorithm style. Modern C++ standard library usage extends beyond the original STL.",
        },
      ],

      mission: {
        title: "Open the Command Center",
        instructions:
          "Create a std::vector<int> named values containing 3, 6, and 9, then print its size.",

        starterCode: `#include <iostream>
#include <vector>

int main() {
  // Create values here

  return 0;
}`,

        hints: [
          "Use std::vector<int>.",
          "Initialize it with braces.",
          "Use values.size().",
        ],

        validation: [
          {
            type: "cppVectorExists",
            variable: "values",
          },
          {
            type: "cppUsesSize",
            variable: "values",
          },
        ],
      },
    },

    {
      id: "cpp-stl-vector",
      title: "Vectors",
      subtitle: "Build dynamic collections",
      difficulty: "BEGINNER",
      estimatedMinutes: 12,
      xp: 150,

      blocks: [
        {
          id: "vector-text",
          type: "text",
          title: "std::vector grows and shrinks dynamically",
          content:
            "Unlike a fixed-size built-in array, std::vector manages a dynamic sequence of values and provides convenient operations such as push_back, pop_back, size, and indexed access.",
        },
        {
          id: "vector-code",
          type: "code",
          code: `std::vector<int> scores = {10, 20};

scores.push_back(30);
scores.push_back(40);

std::cout << scores[2];`,
        },
        {
          id: "vector-tip",
          type: "tip",
          content:
            "Prefer std::vector for many everyday dynamic sequence tasks because it manages its own memory.",
        },
      ],

      mission: {
        title: "Expand the Data Fleet",
        instructions:
          "Create a vector named powers, add two values using push_back, and print the final size.",

        starterCode: `#include <iostream>
#include <vector>

int main() {
  std::vector<int> powers;

  // Add values and print the size

  return 0;
}`,

        hints: [
          "Use powers.push_back(...).",
          "Call push_back at least twice.",
          "Print powers.size().",
        ],

        validation: [
          {
            type: "cppUsesPushBack",
            variable: "powers",
          },
          {
            type: "cppUsesSize",
            variable: "powers",
          },
        ],
      },
    },

    {
      id: "cpp-stl-strings",
      title: "String Utilities",
      subtitle: "Use standard text operations",
      difficulty: "BEGINNER",
      estimatedMinutes: 11,
      xp: 140,

      blocks: [
        {
          id: "stl-strings-text",
          type: "text",
          title: "std::string is a rich standard library type",
          content:
            "std::string provides operations for measuring, appending, searching, slicing, comparing, and iterating over text.",
        },
        {
          id: "stl-strings-code",
          type: "code",
          code: `std::string title = "Code";
title += "Land";

std::cout << title.size();`,
        },
        {
          id: "stl-strings-tip",
          type: "tip",
          content:
            "Use standard string operations instead of manually managing character buffers for ordinary text tasks.",
        },
      ],

      mission: {
        title: "Assemble a Command Name",
        instructions:
          'Create a string named command with "CORE", append "-READY", and print the result.',

        starterCode: `#include <iostream>
#include <string>

int main() {
  // Build command here

  return 0;
}`,

        hints: [
          'Start with std::string command = "CORE".',
          'Append "-READY".',
          "Print command.",
        ],

        validation: [
          {
            type: "cppStringVariableEqualsOrBuildsTo",
            variable: "command",
            value: "CORE-READY",
          },
          {
            type: "cppOutputContains",
            value: "CORE-READY",
          },
        ],
      },
    },

    {
      id: "cpp-stl-map",
      title: "Maps",
      subtitle: "Store key-value data",
      difficulty: "INTERMEDIATE",
      estimatedMinutes: 13,
      xp: 170,

      blocks: [
        {
          id: "map-text",
          type: "text",
          title: "std::map connects keys to values",
          content:
            "A map stores key-value pairs. Keys are unique, and they let you look up associated values without manually searching a parallel collection.",
        },
        {
          id: "map-code",
          type: "code",
          code: `std::map<std::string, int> scores;

scores["Nova"] = 90;
scores["Kai"] = 82;

std::cout << scores["Nova"];`,
        },
        {
          id: "map-tip",
          type: "tip",
          content:
            "std::map keeps keys ordered. Later, you can also explore std::unordered_map when hash-based lookup is a better fit.",
        },
      ],

      mission: {
        title: "Build the Player Registry",
        instructions:
          "Create a map from string to int named levels, store Alex as level 5, and print that value.",

        starterCode: `#include <iostream>
#include <map>
#include <string>

int main() {
  // Build levels here

  return 0;
}`,

        hints: [
          "Use std::map<std::string, int>.",
          'Assign levels["Alex"] = 5.',
          'Print levels["Alex"].',
        ],

        validation: [
          {
            type: "cppMapExists",
            variable: "levels",
          },
          {
            type: "cppOutputContains",
            value: "5",
          },
        ],
      },
    },

    {
      id: "cpp-stl-set",
      title: "Sets",
      subtitle: "Keep unique values",
      difficulty: "INTERMEDIATE",
      estimatedMinutes: 12,
      xp: 160,

      blocks: [
        {
          id: "set-text",
          type: "text",
          title: "std::set stores unique keys",
          content:
            "A set is useful when duplicate values should not be stored. In std::set, values are kept ordered and each key appears at most once.",
        },
        {
          id: "set-code",
          type: "code",
          code: `std::set<int> ids = {4, 2, 4, 1};

std::cout << ids.size();`,
        },
        {
          id: "set-tip",
          type: "tip",
          content:
            "Inserting a duplicate into std::set does not create a second copy.",
        },
      ],

      mission: {
        title: "Filter Unique Signals",
        instructions:
          "Create a set named signals, insert 10, 20, 10, and print the set size.",

        starterCode: `#include <iostream>
#include <set>

int main() {
  // Create signals here

  return 0;
}`,

        hints: [
          "Use std::set<int>.",
          "Insert 10, 20, and 10.",
          "The final size should show that duplicates are not stored twice.",
        ],

        validation: [
          {
            type: "cppSetExists",
            variable: "signals",
          },
          {
            type: "cppOutputContains",
            value: "2",
          },
        ],
      },
    },

    {
      id: "cpp-stl-stack-queue",
      title: "Stacks & Queues",
      subtitle: "Control processing order",
      difficulty: "INTERMEDIATE",
      estimatedMinutes: 14,
      xp: 180,

      blocks: [
        {
          id: "stack-queue-text",
          type: "text",
          title: "Different containers model different workflows",
          content:
            "std::stack follows last-in, first-out behavior. std::queue follows first-in, first-out behavior. Choosing the right structure can make program intent clearer.",
        },
        {
          id: "stack-queue-code",
          type: "code",
          code: `std::stack<int> history;
history.push(10);
history.push(20);

std::cout << history.top();

std::queue<int> tasks;
tasks.push(1);
tasks.push(2);

std::cout << tasks.front();`,
        },
        {
          id: "stack-queue-tip",
          type: "tip",
          content:
            "Use stack for undo/history-like behavior and queue for first-arrived, first-processed workflows.",
        },
      ],

      mission: {
        title: "Route Command Traffic",
        instructions:
          "Create a queue named commands, push 7 then 9, and print the front value.",

        starterCode: `#include <iostream>
#include <queue>

int main() {
  // Build commands here

  return 0;
}`,

        hints: [
          "Use std::queue<int> commands.",
          "Push 7 first.",
          "Use commands.front().",
        ],

        validation: [
          {
            type: "cppQueueExists",
            variable: "commands",
          },
          {
            type: "cppOutputContains",
            value: "7",
          },
        ],
      },
    },

    {
      id: "cpp-stl-iterators",
      title: "Iterators",
      subtitle: "Navigate standard containers",
      difficulty: "INTERMEDIATE",
      estimatedMinutes: 14,
      xp: 180,

      blocks: [
        {
          id: "iterators-text",
          type: "text",
          title: "Iterators connect containers and algorithms",
          content:
            "Iterators act like generalized positions inside containers. begin() refers to the first element and end() represents the position after the last element.",
        },
        {
          id: "iterators-code",
          type: "code",
          code: `std::vector<int> values = {2, 4, 6};

for (auto it = values.begin(); it != values.end(); ++it) {
  std::cout << *it << "\\n";
}`,
        },
        {
          id: "iterators-tip",
          type: "tip",
          content:
            "Range-based for loops are often simpler for ordinary iteration, but understanding iterators is important for using many standard algorithms.",
        },
      ],

      mission: {
        title: "Traverse the Command Buffer",
        instructions:
          "Use an iterator loop to print every value inside the data vector.",

        starterCode: `#include <iostream>
#include <vector>

int main() {
  std::vector<int> data = {5, 10, 15};

  // Traverse data using iterators

  return 0;
}`,

        hints: [
          "Start with data.begin().",
          "Continue until data.end().",
          "Dereference the iterator with *it.",
        ],

        validation: [
          {
            type: "cppUsesIteratorLoop",
            variable: "data",
          },
        ],
      },
    },

    {
      id: "cpp-stl-algorithms",
      title: "Standard Algorithms",
      subtitle: "Transform data with reusable operations",
      difficulty: "INTERMEDIATE",
      estimatedMinutes: 15,
      xp: 200,

      blocks: [
        {
          id: "algorithms-text",
          type: "text",
          title: "Algorithms separate operations from containers",
          content:
            "The <algorithm> library includes reusable operations such as sort, find, count, reverse, and more. Many algorithms work through iterator ranges.",
        },
        {
          id: "algorithms-code",
          type: "code",
          code: `std::vector<int> values = {8, 3, 6, 1};

std::sort(values.begin(), values.end());

auto found = std::find(values.begin(), values.end(), 6);`,
        },
        {
          id: "algorithms-tip",
          type: "tip",
          content:
            "Before writing a custom loop, check whether the standard library already has an algorithm that expresses the operation clearly.",
        },
      ],

      mission: {
        title: "Sort the Fleet",
        instructions:
          "Sort the values vector with std::sort, then print the first value.",

        starterCode: `#include <algorithm>
#include <iostream>
#include <vector>

int main() {
  std::vector<int> values = {9, 2, 7, 1, 5};

  // Sort values

  return 0;
}`,

        hints: [
          "Use std::sort.",
          "Pass values.begin() and values.end().",
          "Print values[0] after sorting.",
        ],

        validation: [
          {
            type: "cppUsesStdAlgorithm",
            algorithm: "sort",
          },
          {
            type: "cppOutputContains",
            value: "1",
          },
        ],
      },
    },
  ],

  challenges: [
    {
      id: "cpp-stl-challenge-vector",
      title: "Dynamic Scoreboard",
      subtitle: "Manage a growing vector",
      difficulty: "CHALLENGE",
      estimatedMinutes: 16,
      xp: 270,

      description:
        "Build a dynamic scoreboard with std::vector, add several scores, calculate a result, and print useful output.",

      starterCode: `#include <iostream>
#include <vector>

int main() {
  // Build a dynamic scoreboard

  return 0;
}`,

      hints: [
        "Use std::vector<int>.",
        "Add values with push_back.",
        "Loop over the vector to calculate a total or average.",
      ],

      validation: [
        {
          type: "cppHasVector",
        },
        {
          type: "cppUsesPushBack",
        },
        {
          type: "cppHasCollectionCalculation",
        },
      ],
    },

    {
      id: "cpp-stl-challenge-map",
      title: "Player Registry",
      subtitle: "Command key-value data",
      difficulty: "CHALLENGE",
      estimatedMinutes: 18,
      xp: 310,

      description:
        "Create a player registry using std::map and retrieve values by player name.",

      starterCode: `#include <iostream>
#include <map>
#include <string>

int main() {
  // Build the player registry

  return 0;
}`,

      hints: [
        "Use player names as keys.",
        "Store an int or score as each value.",
        "Retrieve and print at least one entry.",
      ],

      validation: [
        {
          type: "cppHasMap",
        },
        {
          type: "cppMapKeyAccessExists",
        },
      ],
    },

    {
      id: "cpp-stl-challenge-queue",
      title: "Mission Queue",
      subtitle: "Process tasks in order",
      difficulty: "CHALLENGE",
      estimatedMinutes: 18,
      xp: 320,

      description:
        "Use std::queue to process several mission IDs in first-in, first-out order.",

      starterCode: `#include <iostream>
#include <queue>

int main() {
  // Build and process the mission queue

  return 0;
}`,

      hints: [
        "Push several values.",
        "Use front() to inspect the next mission.",
        "Use pop() after processing.",
      ],

      validation: [
        {
          type: "cppHasQueue",
        },
        {
          type: "cppUsesQueueFront",
        },
        {
          type: "cppUsesQueuePop",
        },
      ],
    },

    {
      id: "cpp-stl-challenge-algorithms",
      title: "Algorithm Control",
      subtitle: "Use standard operations instead of manual loops",
      difficulty: "CHALLENGE",
      estimatedMinutes: 20,
      xp: 350,

      description:
        "Use multiple algorithms from <algorithm> to organize and search a collection.",

      starterCode: `#include <algorithm>
#include <iostream>
#include <vector>

int main() {
  std::vector<int> values = {12, 4, 19, 7, 4, 3};

  // Use standard algorithms

  return 0;
}`,

      hints: [
        "Try std::sort first.",
        "Use std::find or std::count for a second operation.",
        "Print a useful result.",
      ],

      validation: [
        {
          type: "cppMinimumStdAlgorithmCount",
          minimum: 2,
        },
      ],
    },

    {
      id: "cpp-stl-challenge-command",
      title: "STL Command System",
      subtitle: "Bring the command center online",
      difficulty: "FINAL CHALLENGE",
      estimatedMinutes: 27,
      xp: 480,

      description:
        "Build a console command system using multiple Standard Library containers and at least two standard algorithms.",

      starterCode: `#include <algorithm>
#include <iostream>
#include <map>
#include <queue>
#include <set>
#include <string>
#include <vector>

int main() {
  // Build the STL Command System

  return 0;
}`,

      hints: [
        "Use at least two different container types.",
        "Use std::vector for sequence data and another container for a different job.",
        "Include at least two standard algorithms.",
        "Print meaningful system output.",
      ],

      validation: [
        {
          type: "cppMinimumStlContainerCount",
          minimum: 2,
        },
        {
          type: "cppMinimumStdAlgorithmCount",
          minimum: 2,
        },
        {
          type: "cppHasIteratorUsage",
        },
        {
          type: "cppMinimumOutputStatements",
          minimum: 2,
        },
      ],
    },
  ],
};

export default cppStlCommandContent;
