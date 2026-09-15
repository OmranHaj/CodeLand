const cppLogicGatesContent = {
  id: "cpp-logic-gates",

  title: "Logic Gates",

  subtitle: "Make decisions",

  world: "C++ Core",

  description:
    "Learn how C++ makes decisions using comparisons, booleans, branches, switch statements, logical operators, and loops.",

  execution: {
    mode: "backend-runner",
    enabled: false,
    language: "cpp",
  },

  lessons: [
    {
      id: "cpp-logic-comparisons",
      title: "Comparison Operators",
      subtitle: "Compare values",
      difficulty: "BEGINNER",
      estimatedMinutes: 9,
      xp: 110,

      blocks: [
        {
          id: "comparisons-intro",
          type: "text",
          title: "Programs can compare data",
          content:
            "Comparison operators let C++ ask questions about values. Expressions using ==, !=, <, >, <=, and >= produce true or false.",
        },
        {
          id: "comparisons-example",
          type: "code",
          code: `int score = 90;

bool passed = score >= 70;
bool perfect = score == 100;`,
        },
        {
          id: "comparisons-tip",
          type: "tip",
          content:
            "Use == to compare values. A single = assigns a value instead of comparing it.",
        },
      ],

      mission: {
        title: "Check the Score",
        instructions:
          "Create a bool named passed that checks whether score is greater than or equal to 70.",

        starterCode: `#include <iostream>

int main() {
  int score = 82;

  // Create passed here

  std::cout << passed;
  return 0;
}`,

        hints: [
          "The result of a comparison can be stored in a bool.",
          "Use the >= operator.",
          "Compare score with 70.",
        ],

        validation: [
          {
            type: "cppBooleanExpression",
            variable: "passed",
            expressionContains: ["score", ">=", "70"],
          },
        ],
      },
    },

    {
      id: "cpp-logic-booleans",
      title: "Boolean Values",
      subtitle: "Work with true and false",
      difficulty: "BEGINNER",
      estimatedMinutes: 8,
      xp: 100,

      blocks: [
        {
          id: "booleans-intro",
          type: "text",
          title: "bool stores one of two states",
          content:
            "A bool can store true or false. Boolean values are the foundation of decisions, conditions, and control flow in C++.",
        },
        {
          id: "booleans-example",
          type: "code",
          code: `bool engineOnline = true;
bool accessDenied = false;`,
        },
        {
          id: "booleans-tip",
          type: "tip",
          content:
            "Boolean variables are easier to understand when their names read like questions or states.",
        },
      ],

      mission: {
        title: "Activate the Gate",
        instructions: "Create a bool named gateOpen and set it to true.",

        starterCode: `#include <iostream>

int main() {
  // Create gateOpen

  std::cout << gateOpen;
  return 0;
}`,

        hints: [
          "Use the bool type.",
          "The variable name is gateOpen.",
          "Assign the value true.",
        ],

        validation: [
          {
            type: "cppBooleanEquals",
            variable: "gateOpen",
            value: true,
          },
        ],
      },
    },

    {
      id: "cpp-logic-if",
      title: "if Statements",
      subtitle: "Run code only when needed",
      difficulty: "BEGINNER",
      estimatedMinutes: 10,
      xp: 120,

      blocks: [
        {
          id: "if-intro",
          type: "text",
          title: "if creates a decision gate",
          content:
            "An if statement runs its block only when the condition inside the parentheses evaluates to true.",
        },
        {
          id: "if-example",
          type: "code",
          code: `int energy = 85;

if (energy >= 50) {
  std::cout << "Engine ready";
}`,
        },
        {
          id: "if-tip",
          type: "tip",
          content:
            "Keep the condition inside parentheses and the controlled statements inside braces.",
        },
      ],

      mission: {
        title: "Authorize Entry",
        instructions: 'If level is at least 5, print "Access granted".',

        starterCode: `#include <iostream>

int main() {
  int level = 7;

  // Add the decision gate

  return 0;
}`,

        hints: [
          "Use an if statement.",
          "Compare level with 5 using >=.",
          'Print "Access granted" inside the block.',
        ],

        validation: [
          {
            type: "cppHasIfCondition",
            expressionContains: ["level", ">=", "5"],
          },
          {
            type: "cppOutputContains",
            value: "Access granted",
          },
        ],
      },
    },

    {
      id: "cpp-logic-if-else",
      title: "if / else",
      subtitle: "Choose between two paths",
      difficulty: "BEGINNER",
      estimatedMinutes: 10,
      xp: 120,

      blocks: [
        {
          id: "if-else-intro",
          type: "text",
          title: "else handles the opposite path",
          content:
            "Use else when you want one block to run when a condition is true and another block to run when it is false.",
        },
        {
          id: "if-else-example",
          type: "code",
          code: `if (battery > 20) {
  std::cout << "Continue";
} else {
  std::cout << "Recharge";
}`,
        },
        {
          id: "if-else-tip",
          type: "tip",
          content:
            "Only one branch of an if / else pair runs during a single decision.",
        },
      ],

      mission: {
        title: "Battery Decision",
        instructions:
          'Print "Online" when battery is at least 30, otherwise print "Recharge".',

        starterCode: `#include <iostream>

int main() {
  int battery = 24;

  // Add if / else

  return 0;
}`,

        hints: [
          "Compare battery with 30.",
          'The if branch prints "Online".',
          'The else branch prints "Recharge".',
        ],

        validation: [
          {
            type: "cppHasIfElse",
          },
          {
            type: "cppOutputContains",
            value: "Recharge",
          },
        ],
      },
    },

    {
      id: "cpp-logic-else-if",
      title: "else if Chains",
      subtitle: "Handle multiple conditions",
      difficulty: "BEGINNER",
      estimatedMinutes: 11,
      xp: 130,

      blocks: [
        {
          id: "else-if-intro",
          type: "text",
          title: "More than two outcomes",
          content:
            "An else if chain lets your program test several conditions in order and stop at the first matching branch.",
        },
        {
          id: "else-if-example",
          type: "code",
          code: `if (score >= 90) {
  std::cout << "A";
} else if (score >= 75) {
  std::cout << "B";
} else {
  std::cout << "C";
}`,
        },
        {
          id: "else-if-tip",
          type: "tip",
          content:
            "Put the most specific or highest-priority conditions first.",
        },
      ],

      mission: {
        title: "Rank the Pilot",
        instructions:
          "Print A for scores 90+, B for scores 75+, and C for everything else.",

        starterCode: `#include <iostream>

int main() {
  int score = 81;

  // Build the ranking chain

  return 0;
}`,

        hints: [
          "Start with score >= 90.",
          "Use else if for score >= 75.",
          "Finish with else.",
        ],

        validation: [
          {
            type: "cppHasElseIfChain",
            minimumBranches: 3,
          },
          {
            type: "cppOutputContains",
            value: "B",
          },
        ],
      },
    },

    {
      id: "cpp-logic-operators",
      title: "Logical Operators",
      subtitle: "Combine conditions",
      difficulty: "BEGINNER",
      estimatedMinutes: 11,
      xp: 140,

      blocks: [
        {
          id: "logical-intro",
          type: "text",
          title: "Combine multiple questions",
          content:
            "Use && when both conditions must be true, || when either condition can be true, and ! to invert a boolean condition.",
        },
        {
          id: "logical-example",
          type: "code",
          code: `if (hasKey && energy > 50) {
  std::cout << "Door open";
}

if (!systemLocked) {
  std::cout << "Ready";
}`,
        },
        {
          id: "logical-tip",
          type: "tip",
          content:
            "Parentheses can make complex conditions easier to read even when they are not strictly required.",
        },
      ],

      mission: {
        title: "Secure Access",
        instructions:
          'Print "Authorized" only when hasBadge is true and clearance is at least 3.',

        starterCode: `#include <iostream>

int main() {
  bool hasBadge = true;
  int clearance = 4;

  // Combine both conditions

  return 0;
}`,

        hints: [
          "Use && to require both conditions.",
          "Check hasBadge directly.",
          "Compare clearance with 3.",
        ],

        validation: [
          {
            type: "cppUsesLogicalOperator",
            operator: "&&",
          },
          {
            type: "cppOutputContains",
            value: "Authorized",
          },
        ],
      },
    },

    {
      id: "cpp-logic-switch",
      title: "switch Statements",
      subtitle: "Route exact values",
      difficulty: "BEGINNER",
      estimatedMinutes: 12,
      xp: 140,

      blocks: [
        {
          id: "switch-intro",
          type: "text",
          title: "switch is useful for exact choices",
          content:
            "A switch statement compares one value against several case labels. break prevents execution from falling through into the next case.",
        },
        {
          id: "switch-example",
          type: "code",
          code: `switch (mode) {
  case 1:
    std::cout << "Explore";
    break;

  case 2:
    std::cout << "Build";
    break;

  default:
    std::cout << "Unknown";
}`,
        },
        {
          id: "switch-tip",
          type: "tip",
          content:
            "Use switch when you are matching one value against several exact options.",
        },
      ],

      mission: {
        title: "Select Reactor Mode",
        instructions:
          'Use switch so mode 1 prints "Idle", mode 2 prints "Active", and all other values print "Unknown".',

        starterCode: `#include <iostream>

int main() {
  int mode = 2;

  // Build the switch

  return 0;
}`,

        hints: [
          "Switch on mode.",
          "Add case 1 and case 2.",
          "Use break after each case and finish with default.",
        ],

        validation: [
          {
            type: "cppHasSwitch",
            variable: "mode",
          },
          {
            type: "cppHasSwitchCases",
            minimum: 2,
          },
          {
            type: "cppOutputContains",
            value: "Active",
          },
        ],
      },
    },

    {
      id: "cpp-logic-loops",
      title: "Loops & Control Flow",
      subtitle: "Repeat decisions",
      difficulty: "BEGINNER",
      estimatedMinutes: 13,
      xp: 150,

      blocks: [
        {
          id: "loops-intro",
          type: "text",
          title: "Repeat work while conditions change",
          content:
            "for and while loops repeat blocks of code. Conditions decide whether another iteration should run, while break and continue can change the normal flow.",
        },
        {
          id: "loops-example",
          type: "code",
          code: `for (int i = 1; i <= 3; i++) {
  std::cout << i << "\\n";
}

int energy = 3;

while (energy > 0) {
  energy--;
}`,
        },
        {
          id: "loops-tip",
          type: "tip",
          content:
            "Always make sure a while loop can eventually change its condition, otherwise it may run forever.",
        },
      ],

      mission: {
        title: "Run the Gate Sequence",
        instructions: "Use a for loop to print the numbers 1 through 5.",

        starterCode: `#include <iostream>

int main() {
  // Build the loop

  return 0;
}`,

        hints: [
          "Start an int counter at 1.",
          "Continue while the counter is <= 5.",
          "Increase the counter after every iteration.",
        ],

        validation: [
          {
            type: "cppHasForLoop",
          },
          {
            type: "cppLoopRange",
            start: 1,
            end: 5,
          },
        ],
      },
    },
  ],

  challenges: [
    {
      id: "cpp-logic-challenge-age",
      title: "Age Access Check",
      subtitle: "Build a simple access gate",
      difficulty: "CHALLENGE",
      estimatedMinutes: 14,
      xp: 220,

      description:
        "Read or store an age and print whether the user is allowed to enter based on a minimum age rule.",

      starterCode: `#include <iostream>

int main() {
  int age = 17;

  // Decide whether access is allowed

  return 0;
}`,

      hints: [
        "Use an if / else statement.",
        "Choose 18 as the minimum age.",
        "Print a clear message for both outcomes.",
      ],

      validation: [
        {
          type: "cppHasIfElse",
        },
        {
          type: "cppHasComparisonOperator",
        },
      ],
    },

    {
      id: "cpp-logic-challenge-score",
      title: "Score Classifier",
      subtitle: "Build a multi-path decision",
      difficulty: "CHALLENGE",
      estimatedMinutes: 16,
      xp: 250,

      description:
        "Classify a numeric score into several result bands using an if / else if / else chain.",

      starterCode: `#include <iostream>

int main() {
  int score = 88;

  // Classify the score

  return 0;
}`,

      hints: [
        "Use at least three branches.",
        "Test higher score ranges first.",
        "Always include a final else.",
      ],

      validation: [
        {
          type: "cppHasElseIfChain",
          minimumBranches: 3,
        },
      ],
    },

    {
      id: "cpp-logic-challenge-login",
      title: "Login Gate",
      subtitle: "Combine boolean conditions",
      difficulty: "CHALLENGE",
      estimatedMinutes: 17,
      xp: 280,

      description:
        "Use multiple boolean conditions and logical operators to decide whether a simulated user can enter a secure system.",

      starterCode: `#include <iostream>

int main() {
  bool passwordCorrect = true;
  bool accountActive = true;
  int clearance = 2;

  // Build the login gate

  return 0;
}`,

      hints: [
        "Use && to combine required conditions.",
        "You can combine more than two conditions.",
        "Print a success and failure message.",
      ],

      validation: [
        {
          type: "cppUsesLogicalOperator",
          operator: "&&",
        },
        {
          type: "cppHasIfElse",
        },
      ],
    },

    {
      id: "cpp-logic-challenge-control",
      title: "Logic Control System",
      subtitle: "Bring the gates online",
      difficulty: "FINAL CHALLENGE",
      estimatedMinutes: 22,
      xp: 380,

      description:
        "Build a console control system that uses comparisons, boolean logic, branching, switch routing, and a loop to manage several system states.",

      starterCode: `#include <iostream>

int main() {
  bool systemOnline = true;
  int clearance = 4;
  int mode = 2;

  // Build the Logic Control System

  return 0;
}`,

      hints: [
        "Use at least one if / else decision.",
        "Combine conditions with a logical operator.",
        "Use a switch for mode routing and a loop for repeated output.",
      ],

      validation: [
        {
          type: "cppHasIfElse",
        },
        {
          type: "cppUsesAnyLogicalOperator",
        },
        {
          type: "cppHasSwitch",
          variable: "mode",
        },
        {
          type: "cppHasLoop",
        },
        {
          type: "cppMinimumOutputStatements",
          minimum: 2,
        },
      ],
    },
  ],
};

export default cppLogicGatesContent;
