const cppFunctionEngineContent = {
  id: "cpp-function-engine",

  title: "Function Engine",

  subtitle: "Build reusable systems",

  world: "C++ Core",

  description:
    "Learn how to organize C++ programs with functions, parameters, return values, scope, overloading, and reusable logic.",

  execution: {
    mode: "backend-runner",
    enabled: false,
    language: "cpp",
  },

  lessons: [
    {
      id: "cpp-functions-intro",
      title: "What Is a Function?",
      subtitle: "Package reusable logic",
      difficulty: "BEGINNER",
      estimatedMinutes: 9,
      xp: 110,

      blocks: [
        {
          id: "functions-intro-text",
          type: "text",
          title: "Functions organize your program",
          content:
            "A function is a named block of code that performs a task. Functions help you avoid repetition, separate responsibilities, and make larger programs easier to understand.",
        },
        {
          id: "functions-intro-code",
          type: "code",
          code: `void greet() {
  std::cout << "Hello";
}

int main() {
  greet();
  return 0;
}`,
        },
        {
          id: "functions-intro-tip",
          type: "tip",
          content:
            "A function must be declared before it is called, unless you provide a function prototype first.",
        },
      ],

      mission: {
        title: "Start the Engine",
        instructions:
          'Create a function named activate that prints "Engine online", then call it from main.',

        starterCode: `#include <iostream>

// Create activate here

int main() {
  // Call activate here

  return 0;
}`,

        hints: [
          "The function does not need to return a value, so use void.",
          "Place std::cout inside activate.",
          "Call the function with activate();",
        ],

        validation: [
          {
            type: "cppFunctionExists",
            function: "activate",
          },
          {
            type: "cppFunctionCalled",
            function: "activate",
          },
          {
            type: "cppOutputContains",
            value: "Engine online",
          },
        ],
      },
    },

    {
      id: "cpp-functions-create",
      title: "Creating Functions",
      subtitle: "Define a reusable operation",
      difficulty: "BEGINNER",
      estimatedMinutes: 10,
      xp: 120,

      blocks: [
        {
          id: "create-function-text",
          type: "text",
          title: "A function has a return type, name, and body",
          content:
            "A function definition begins with its return type, followed by the function name, parentheses, and a body inside braces.",
        },
        {
          id: "create-function-code",
          type: "code",
          code: `void showStatus() {
  std::cout << "System ready";
}`,
        },
        {
          id: "create-function-tip",
          type: "tip",
          content:
            "Use void when a function performs an action but does not send a value back to the caller.",
        },
      ],

      mission: {
        title: "Build a Status Module",
        instructions:
          'Create a void function named showStatus that prints "Systems nominal".',

        starterCode: `#include <iostream>

// Build showStatus here

int main() {
  showStatus();
  return 0;
}`,

        hints: [
          "Start with void showStatus().",
          "Add a function body using braces.",
          "Print the exact text inside the function.",
        ],

        validation: [
          {
            type: "cppFunctionExists",
            function: "showStatus",
            returnType: "void",
          },
          {
            type: "cppOutputContains",
            value: "Systems nominal",
          },
        ],
      },
    },

    {
      id: "cpp-functions-parameters",
      title: "Parameters",
      subtitle: "Send data into functions",
      difficulty: "BEGINNER",
      estimatedMinutes: 11,
      xp: 130,

      blocks: [
        {
          id: "parameters-text",
          type: "text",
          title: "Parameters make functions flexible",
          content:
            "Parameters are variables declared inside a function's parentheses. They receive values from the function call and let one function work with different input.",
        },
        {
          id: "parameters-code",
          type: "code",
          code: `void showScore(int score) {
  std::cout << score;
}

showScore(120);`,
        },
        {
          id: "parameters-tip",
          type: "tip",
          content:
            "The value passed during the function call is called an argument.",
        },
      ],

      mission: {
        title: "Transmit Power",
        instructions:
          "Create a function named showPower with one int parameter named power and print that parameter.",

        starterCode: `#include <iostream>

// Create showPower here

int main() {
  showPower(85);
  return 0;
}`,

        hints: [
          "Use an int parameter named power.",
          "Print power inside the function.",
          "The provided call should print 85.",
        ],

        validation: [
          {
            type: "cppFunctionParameter",
            function: "showPower",
            parameter: "power",
            valueType: "int",
          },
          {
            type: "cppOutputContains",
            value: "85",
          },
        ],
      },
    },

    {
      id: "cpp-functions-multiple-parameters",
      title: "Multiple Parameters",
      subtitle: "Combine several inputs",
      difficulty: "BEGINNER",
      estimatedMinutes: 11,
      xp: 140,

      blocks: [
        {
          id: "multiple-parameters-text",
          type: "text",
          title: "Functions can receive more than one value",
          content:
            "Separate parameters with commas. Each parameter has its own type and name, and each argument is matched by position when the function is called.",
        },
        {
          id: "multiple-parameters-code",
          type: "code",
          code: `void showPlayer(std::string name, int level) {
  std::cout << name << " " << level;
}

showPlayer("Nova", 7);`,
        },
        {
          id: "multiple-parameters-tip",
          type: "tip",
          content:
            "Keep parameter order consistent between the function definition and the function call.",
        },
      ],

      mission: {
        title: "Combine Two Inputs",
        instructions:
          "Create a function named showStats that accepts score and lives as int parameters and prints both.",

        starterCode: `#include <iostream>

// Create showStats here

int main() {
  showStats(250, 3);
  return 0;
}`,

        hints: [
          "The function needs two int parameters.",
          "Name them score and lives.",
          "Print both values inside showStats.",
        ],

        validation: [
          {
            type: "cppFunctionParameterCount",
            function: "showStats",
            count: 2,
          },
          {
            type: "cppMinimumOutputStatements",
            minimum: 1,
          },
        ],
      },
    },

    {
      id: "cpp-functions-return-values",
      title: "Return Values",
      subtitle: "Send results back",
      difficulty: "BEGINNER",
      estimatedMinutes: 12,
      xp: 150,

      blocks: [
        {
          id: "return-values-text",
          type: "text",
          title: "Functions can produce values",
          content:
            "A non-void function uses return to send a result back to the caller. The returned value must match the function's declared return type.",
        },
        {
          id: "return-values-code",
          type: "code",
          code: `int add(int a, int b) {
  return a + b;
}

int total = add(4, 6);`,
        },
        {
          id: "return-values-tip",
          type: "tip",
          content:
            "Returned values can be stored in variables, printed, or used inside larger expressions.",
        },
      ],

      mission: {
        title: "Generate Bonus Power",
        instructions:
          "Create an int function named addPower that returns the sum of two int parameters.",

        starterCode: `#include <iostream>

// Create addPower here

int main() {
  int total = addPower(40, 15);
  std::cout << total;
  return 0;
}`,

        hints: [
          "The return type is int.",
          "Use two int parameters.",
          "Return their sum.",
        ],

        validation: [
          {
            type: "cppFunctionReturns",
            function: "addPower",
            returnType: "int",
          },
          {
            type: "cppReturnExpressionContains",
            function: "addPower",
            expressionContains: ["+"],
          },
          {
            type: "cppOutputContains",
            value: "55",
          },
        ],
      },
    },

    {
      id: "cpp-functions-scope",
      title: "Variable Scope",
      subtitle: "Control where data exists",
      difficulty: "BEGINNER",
      estimatedMinutes: 12,
      xp: 150,

      blocks: [
        {
          id: "scope-text",
          type: "text",
          title: "Variables belong to a scope",
          content:
            "A variable declared inside a function or block is local to that scope. It cannot be accessed everywhere in the program. Keeping data local helps reduce accidental changes.",
        },
        {
          id: "scope-code",
          type: "code",
          code: `void calculate() {
  int result = 42;
  std::cout << result;
}

// result does not exist here`,
        },
        {
          id: "scope-tip",
          type: "tip",
          content:
            "Prefer local variables when possible. Global variables can make larger programs harder to reason about.",
        },
      ],

      mission: {
        title: "Protect Local Data",
        instructions:
          "Create a function named calculateEnergy with a local int named energy set to 75, then print it inside the function.",

        starterCode: `#include <iostream>

// Build calculateEnergy here

int main() {
  calculateEnergy();
  return 0;
}`,

        hints: [
          "Declare energy inside calculateEnergy.",
          "Set energy to 75.",
          "Print energy before the function ends.",
        ],

        validation: [
          {
            type: "cppLocalVariableExists",
            function: "calculateEnergy",
            variable: "energy",
          },
          {
            type: "cppOutputContains",
            value: "75",
          },
        ],
      },
    },

    {
      id: "cpp-functions-overloading",
      title: "Function Overloading",
      subtitle: "Reuse names with different inputs",
      difficulty: "INTERMEDIATE",
      estimatedMinutes: 13,
      xp: 170,

      blocks: [
        {
          id: "overloading-text",
          type: "text",
          title: "One function name can support different parameter lists",
          content:
            "C++ can overload functions when they share the same name but have different parameter types or counts. The compiler chooses the matching version from the arguments.",
        },
        {
          id: "overloading-code",
          type: "code",
          code: `int boost(int value) {
  return value + 10;
}

double boost(double value) {
  return value + 10.5;
}`,
        },
        {
          id: "overloading-tip",
          type: "tip",
          content:
            "Changing only the return type is not enough to overload a function. The parameter list must be different.",
        },
      ],

      mission: {
        title: "Overload the Engine",
        instructions:
          "Create two functions named amplify: one accepts int and one accepts double. Each should return its input multiplied by 2.",

        starterCode: `#include <iostream>

// Create both amplify functions here

int main() {
  std::cout << amplify(6) << "\\n";
  std::cout << amplify(2.5);
  return 0;
}`,

        hints: [
          "Create one int amplify(int value).",
          "Create one double amplify(double value).",
          "Return value * 2 from each version.",
        ],

        validation: [
          {
            type: "cppFunctionOverloadCount",
            function: "amplify",
            minimum: 2,
          },
          {
            type: "cppOutputContains",
            value: "12",
          },
          {
            type: "cppOutputContains",
            value: "5",
          },
        ],
      },
    },
  ],

  challenges: [
    {
      id: "cpp-functions-challenge-greeting",
      title: "Greeting Function",
      subtitle: "Build your first reusable module",
      difficulty: "CHALLENGE",
      estimatedMinutes: 14,
      xp: 220,

      description:
        "Create a reusable greeting function that receives a name and prints a personalized console message.",

      starterCode: `#include <iostream>
#include <string>

int main() {
  // Build and call your greeting function

  return 0;
}`,

      hints: [
        "Use std::string as the parameter type.",
        "Give the function a clear name.",
        "Call it at least once from main.",
      ],

      validation: [
        {
          type: "cppHasFunctionWithParameterType",
          valueType: "std::string",
        },
        {
          type: "cppFunctionCalledFromMain",
        },
      ],
    },

    {
      id: "cpp-functions-challenge-power",
      title: "Power Calculator",
      subtitle: "Return calculated values",
      difficulty: "CHALLENGE",
      estimatedMinutes: 16,
      xp: 260,

      description:
        "Create a function that accepts base power and multiplier values, calculates the final power, and returns the result.",

      starterCode: `#include <iostream>

int main() {
  // Create and use a reusable power calculator

  return 0;
}`,

      hints: [
        "Use parameters for the inputs.",
        "Use a non-void return type.",
        "Store or print the returned result.",
      ],

      validation: [
        {
          type: "cppHasReturningFunction",
        },
        {
          type: "cppFunctionParameterCountAtLeast",
          minimum: 2,
        },
      ],
    },

    {
      id: "cpp-functions-challenge-score",
      title: "Score Analyzer",
      subtitle: "Combine functions and decisions",
      difficulty: "CHALLENGE",
      estimatedMinutes: 18,
      xp: 300,

      description:
        "Build functions that calculate a score result and classify it using reusable logic instead of placing everything inside main.",

      starterCode: `#include <iostream>

int main() {
  int score = 84;

  // Build reusable score analysis functions

  return 0;
}`,

      hints: [
        "Split the work into at least two functions.",
        "One function can return a value while another prints or classifies it.",
        "Keep main focused on coordinating the functions.",
      ],

      validation: [
        {
          type: "cppMinimumFunctionCount",
          minimum: 2,
        },
        {
          type: "cppHasReturningFunction",
        },
      ],
    },

    {
      id: "cpp-functions-challenge-engine",
      title: "Function Engine System",
      subtitle: "Bring the engine online",
      difficulty: "FINAL CHALLENGE",
      estimatedMinutes: 22,
      xp: 400,

      description:
        "Build a small console system using several reusable functions, parameters, return values, local variables, and at least one overloaded function.",

      starterCode: `#include <iostream>
#include <string>

int main() {
  // Build the Function Engine System

  return 0;
}`,

      hints: [
        "Create multiple focused functions.",
        "Use parameters and return values instead of repeating logic.",
        "Include at least one overloaded function name.",
      ],

      validation: [
        {
          type: "cppMinimumFunctionCount",
          minimum: 3,
        },
        {
          type: "cppHasReturningFunction",
        },
        {
          type: "cppHasFunctionWithParameters",
        },
        {
          type: "cppHasFunctionOverload",
        },
        {
          type: "cppMinimumOutputStatements",
          minimum: 2,
        },
      ],
    },
  ],
};

export default cppFunctionEngineContent;
