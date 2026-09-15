const cppSyntaxCoreContent = {
  id: "cpp-syntax-core",

  title: "Syntax Core",

  subtitle: "Power up the language",

  world: "C++ Core",

  description:
    "Learn the structure of a C++ program, write your first output, understand main(), comments, statements, and the syntax rules that make the compiler happy.",

  execution: {
    mode: "backend-runner",
    enabled: false,
    language: "cpp",
  },

  lessons: [
    {
      id: "cpp-syntax-welcome",
      title: "Welcome to C++",
      subtitle: "Meet the language",
      difficulty: "BEGINNER",
      estimatedMinutes: 6,
      xp: 80,

      blocks: [
        {
          id: "welcome-what-is-cpp",
          type: "text",
          title: "What is C++?",
          content:
            "C++ is a fast, powerful programming language used in games, operating systems, robotics, browsers, graphics engines, and performance-critical software.",
        },
        {
          id: "welcome-compiler",
          type: "text",
          title: "Your code becomes a program",
          content:
            "C++ source code is compiled before it runs. The compiler reads your code, checks its syntax, and turns it into a program the computer can execute.",
        },
        {
          id: "welcome-tip",
          type: "tip",
          content:
            "A compiler is strict on purpose. Small details like semicolons and braces matter.",
        },
        {
          id: "welcome-example",
          type: "code",
          code: `#include <iostream>

int main() {
  std::cout << "Welcome to C++!";
  return 0;
}`,
        },
      ],

      mission: {
        title: "Boot the Core",
        instructions:
          'Change the message so the program prints "CodeLand C++ Core".',

        starterCode: `#include <iostream>

int main() {
  std::cout << "Welcome to C++!";
  return 0;
}`,

        hints: [
          "Look for the text between quotation marks.",
          'Replace only the message with "CodeLand C++ Core".',
          "Keep the semicolon at the end of the std::cout statement.",
        ],

        validation: [
          {
            type: "cppOutputContains",
            value: "CodeLand C++ Core",
          },
        ],
      },
    },

    {
      id: "cpp-syntax-first-program",
      title: "Your First Program",
      subtitle: "Understand the basic structure",
      difficulty: "BEGINNER",
      estimatedMinutes: 8,
      xp: 90,

      blocks: [
        {
          id: "first-program-structure",
          type: "text",
          title: "Three important pieces",
          content:
            "A beginner C++ program usually starts by including a library, defines main(), and places executable statements inside the main function.",
        },
        {
          id: "first-program-code",
          type: "code",
          code: `#include <iostream>

int main() {
  std::cout << "Hello!";
  return 0;
}`,
        },
        {
          id: "first-program-tip",
          type: "tip",
          content:
            "#include <iostream> gives your program access to standard input and output tools such as std::cout.",
        },
      ],

      mission: {
        title: "Create a First Transmission",
        instructions: 'Make the program print exactly "My first C++ program".',

        starterCode: `#include <iostream>

int main() {
  std::cout << "Replace me";
  return 0;
}`,

        hints: [
          "Edit the string inside std::cout.",
          "Keep the double quotes around your message.",
          "Do not remove the semicolon.",
        ],

        validation: [
          {
            type: "cppOutputEquals",
            value: "My first C++ program",
          },
        ],
      },
    },

    {
      id: "cpp-syntax-main",
      title: "The main() Function",
      subtitle: "Where execution begins",
      difficulty: "BEGINNER",
      estimatedMinutes: 8,
      xp: 100,

      blocks: [
        {
          id: "main-entry",
          type: "text",
          title: "The program entry point",
          content:
            "When a C++ program starts, execution begins inside main(). Statements inside its braces run from top to bottom.",
        },
        {
          id: "main-return",
          type: "text",
          title: "Returning from main",
          content:
            "return 0; traditionally signals that the program finished successfully.",
        },
        {
          id: "main-example",
          type: "code",
          code: `int main() {
  // program starts here
  return 0;
}`,
        },
      ],

      mission: {
        title: "Repair the Entry Point",
        instructions:
          "Fix the function name so this becomes a valid C++ entry point.",

        starterCode: `#include <iostream>

int start() {
  std::cout << "Core online";
  return 0;
}`,

        hints: [
          "Every normal C++ program needs a main function.",
          "Change start() to main().",
          "Keep int before the function name.",
        ],

        validation: [
          {
            type: "cppHasMainFunction",
          },
        ],
      },
    },

    {
      id: "cpp-syntax-cout",
      title: "Output with cout",
      subtitle: "Send data to the console",
      difficulty: "BEGINNER",
      estimatedMinutes: 9,
      xp: 110,

      blocks: [
        {
          id: "cout-text",
          type: "text",
          title: "std::cout",
          content:
            "std::cout writes data to the console. The << operator sends values into the output stream.",
        },
        {
          id: "cout-multiple",
          type: "code",
          code: `std::cout << "Score: " << 100;`,
        },
        {
          id: "cout-newline",
          type: "tip",
          content:
            'You can use "\\n" or std::endl when you want the next output to begin on a new line.',
        },
      ],

      mission: {
        title: "Send Two Signals",
        instructions: 'Print "C++" and "Core Online" on separate lines.',

        starterCode: `#include <iostream>

int main() {
  // Print two lines here

  return 0;
}`,

        hints: [
          "You can use two std::cout statements.",
          'Add "\\n" after the first message.',
          'Example: std::cout << "C++" << "\\n";',
        ],

        validation: [
          {
            type: "cppOutputLines",
            values: ["C++", "Core Online"],
          },
        ],
      },
    },

    {
      id: "cpp-syntax-comments",
      title: "Comments",
      subtitle: "Leave notes for humans",
      difficulty: "BEGINNER",
      estimatedMinutes: 7,
      xp: 90,

      blocks: [
        {
          id: "comments-purpose",
          type: "text",
          title: "Comments are ignored by the compiler",
          content:
            "Comments help explain code, leave reminders, or temporarily describe a section without affecting the program.",
        },
        {
          id: "comments-types",
          type: "code",
          code: `// Single-line comment

/*
  Multi-line comment
*/`,
        },
        {
          id: "comments-tip",
          type: "tip",
          content:
            "Good comments explain why something exists, not every obvious detail of what the code does.",
        },
      ],

      mission: {
        title: "Document the Reactor",
        instructions:
          "Add at least one C++ comment without removing the existing output.",

        starterCode: `#include <iostream>

int main() {
  std::cout << "Reactor ready";
  return 0;
}`,

        hints: [
          "Use // for a single-line comment.",
          "You can place a comment above std::cout.",
          "The output line should stay in the program.",
        ],

        validation: [
          {
            type: "cppHasComment",
          },
          {
            type: "cppOutputContains",
            value: "Reactor ready",
          },
        ],
      },
    },

    {
      id: "cpp-syntax-statements",
      title: "Statements & Semicolons",
      subtitle: "Finish instructions correctly",
      difficulty: "BEGINNER",
      estimatedMinutes: 9,
      xp: 120,

      blocks: [
        {
          id: "statement-rule",
          type: "text",
          title: "Statements are instructions",
          content:
            "Many C++ instructions end with a semicolon. Forgetting one is one of the most common beginner syntax errors.",
        },
        {
          id: "statement-example",
          type: "code",
          code: `std::cout << "Ready";
return 0;`,
        },
        {
          id: "statement-tip",
          type: "tip",
          content:
            "Braces do not use semicolons by themselves, but ordinary statements inside them usually do.",
        },
      ],

      mission: {
        title: "Fix the Syntax Fault",
        instructions:
          "Repair the missing semicolons so the program is ready for compilation.",

        starterCode: `#include <iostream>

int main() {
  std::cout << "Syntax fixed"
  return 0
}`,

        hints: [
          "Look at the end of the std::cout line.",
          "Look at the end of return 0.",
          "Both statements need semicolons.",
        ],

        validation: [
          {
            type: "cppStatementTerminators",
            minimum: 2,
          },
        ],
      },
    },
  ],

  challenges: [
    {
      id: "cpp-syntax-challenge-hello",
      title: "Hello CodeLand",
      subtitle: "Build a clean console program",
      difficulty: "CHALLENGE",
      estimatedMinutes: 12,
      xp: 180,

      description:
        "Build a small C++ program that introduces your journey through the C++ Core.",

      starterCode: `#include <iostream>

int main() {
  // Build your message here

  return 0;
}`,

      hints: [
        "Use std::cout.",
        'Your program should include the phrase "Hello CodeLand".',
        "Keep a valid main() function and return 0;",
      ],

      validation: [
        {
          type: "cppHasMainFunction",
        },
        {
          type: "cppOutputContains",
          value: "Hello CodeLand",
        },
      ],
    },

    {
      id: "cpp-syntax-challenge-repair",
      title: "Repair the Program",
      subtitle: "Find every syntax fault",
      difficulty: "CHALLENGE",
      estimatedMinutes: 14,
      xp: 220,

      description:
        "A damaged program entered the chamber. Repair its include, main function, output statement, and semicolons.",

      starterCode: `include <iostream>

int start() {
  std::cout << "System repaired"
  return 0
}`,

      hints: [
        "The include directive begins with #.",
        "The program entry point should be main().",
        "Two statements are missing semicolons.",
      ],

      validation: [
        {
          type: "cppHasIostreamInclude",
        },
        {
          type: "cppHasMainFunction",
        },
        {
          type: "cppOutputContains",
          value: "System repaired",
        },
        {
          type: "cppStatementTerminators",
          minimum: 2,
        },
      ],
    },

    {
      id: "cpp-syntax-challenge-console-app",
      title: "First Console App",
      subtitle: "Activate the Syntax Core",
      difficulty: "FINAL CHALLENGE",
      estimatedMinutes: 18,
      xp: 300,

      description:
        "Create a complete beginner C++ console program that includes a comment and prints three separate status messages.",

      starterCode: `#include <iostream>

int main() {
  // Build your first console app

  return 0;
}`,

      hints: [
        "Keep #include <iostream> and main().",
        "Add at least one comment.",
        "Print three separate lines using std::cout.",
      ],

      validation: [
        {
          type: "cppHasIostreamInclude",
        },
        {
          type: "cppHasMainFunction",
        },
        {
          type: "cppHasComment",
        },
        {
          type: "cppMinimumOutputStatements",
          minimum: 3,
        },
      ],
    },
  ],
};

export default cppSyntaxCoreContent;
