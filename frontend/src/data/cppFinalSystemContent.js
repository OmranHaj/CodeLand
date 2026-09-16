const cppFinalSystemContent = {
  id: "cpp-final-system",

  title: "Final System Build",

  subtitle: "Combine everything you learned",

  world: "C++ Core",

  description:
    "Plan and build a complete C++ console system that combines functions, arrays, memory concepts, object-oriented design, STL containers, algorithms, and clean program structure.",

  execution: {
    mode: "backend-runner",
    enabled: false,
    language: "cpp",
  },

  lessons: [
    {
      id: "cpp-final-architecture",
      title: "System Architecture Briefing",
      subtitle: "Plan before you build",
      difficulty: "FINAL",
      estimatedMinutes: 18,
      xp: 300,

      blocks: [
        {
          id: "final-briefing-text",
          type: "text",
          title: "A strong final project starts with structure",
          content:
            "Before writing code, break the system into responsibilities. Decide what data belongs in classes, what logic belongs in functions, which STL containers fit the problem, and how the program will communicate through the console.",
        },
        {
          id: "final-briefing-code",
          type: "code",
          code: `// Example architecture

class Player {
private:
  std::string name;
  int score;

public:
  Player(std::string playerName)
    : name(playerName), score(0) {}

  void addScore(int amount) {
    score += amount;
  }

  int getScore() const {
    return score;
  }
};

std::vector<Player> players;`,
        },
        {
          id: "final-briefing-tip",
          type: "tip",
          content:
            "Do not force every C++ feature into the project. Use each tool where it makes the design clearer, safer, or easier to maintain.",
        },
      ],

      mission: {
        title: "Create the Build Plan",
        instructions:
          "Prepare the foundation for your final system: define at least one class, one reusable function, and one STL container before starting the full build.",

        starterCode: `#include <algorithm>
#include <iostream>
#include <map>
#include <string>
#include <vector>

// 1. Define at least one reusable class
// 2. Define at least one reusable function

int main() {
  // 3. Create at least one STL container
  // 4. Prepare your final system architecture

  return 0;
}`,

        hints: [
          "Choose one clear project idea such as a mission tracker, player management system, inventory console, or command center.",
          "Keep class responsibilities focused.",
          "Use a reusable function for logic that does not need to live inside main.",
          "Choose a container based on the data: vector for sequences, map for key-value lookup, set for unique values, or queue for ordered tasks.",
        ],

        validation: [
          {
            type: "cppHasClass",
          },
          {
            type: "cppHasFunction",
          },
          {
            type: "cppMinimumStlContainerCount",
            minimum: 1,
          },
        ],
      },
    },
  ],

  challenges: [
    {
      id: "cpp-final-system-build",
      title: "Final System Build",
      subtitle: "Bring C++ Core online",
      difficulty: "MASTER PROJECT",
      estimatedMinutes: 45,
      xp: 1200,

      description:
        "Build a complete C++ console application that demonstrates structured logic, reusable functions, object-oriented design, collection management, safe data handling, and Standard Library tools.",

      starterCode: `#include <algorithm>
#include <iostream>
#include <map>
#include <queue>
#include <set>
#include <string>
#include <vector>

// FINAL SYSTEM BUILD
//
// Build a complete console application.
//
// Suggested ideas:
// - Mission Command Center
// - Player Management System
// - Inventory & Trading Console
// - Robot Fleet Controller
// - Training Academy Manager
//
// Your system should:
// 1. Use multiple reusable functions.
// 2. Use at least one class with private state.
// 3. Use a constructor and public methods.
// 4. Use at least two STL containers.
// 5. Use at least one standard algorithm.
// 6. Include loops and conditions.
// 7. Produce clear console output.

int main() {
  // Build your final C++ system here.

  return 0;
}`,

      hints: [
        "Start with the data model before building the menu or console flow.",
        "Use private class members when outside code should not modify state directly.",
        "Break large operations into small functions.",
        "Use std::vector, std::map, std::set, std::queue, or other standard containers where they fit naturally.",
        "Use at least one algorithm such as std::sort, std::find, std::count, or std::reverse.",
        "Keep main focused on coordinating your system instead of holding every implementation detail.",
      ],

      validation: [
        {
          type: "cppMinimumFunctionCount",
          minimum: 3,
        },
        {
          type: "cppMinimumClassCount",
          minimum: 1,
        },
        {
          type: "cppHasConstructor",
        },
        {
          type: "cppHasPrivateMembers",
        },
        {
          type: "cppHasPublicMethods",
        },
        {
          type: "cppMinimumStlContainerCount",
          minimum: 2,
        },
        {
          type: "cppMinimumStdAlgorithmCount",
          minimum: 1,
        },
        {
          type: "cppHasLoop",
        },
        {
          type: "cppHasIfCondition",
        },
        {
          type: "cppMinimumOutputStatements",
          minimum: 3,
        },
      ],
    },
  ],
};

export default cppFinalSystemContent;
