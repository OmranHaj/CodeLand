const cppArrayMatrixContent = {
  id: "cpp-array-matrix",

  title: "Array Matrix",

  subtitle: "Organize collections",

  world: "C++ Core",

  description:
    "Learn how C++ stores groups of values using arrays, strings, multidimensional collections, loops, indexing, and safe iteration patterns.",

  execution: {
    mode: "backend-runner",
    enabled: false,
    language: "cpp",
  },

  lessons: [
    {
      id: "cpp-arrays-intro",
      title: "What Is an Array?",
      subtitle: "Store multiple values together",
      difficulty: "BEGINNER",
      estimatedMinutes: 9,
      xp: 110,

      blocks: [
        {
          id: "arrays-intro-text",
          type: "text",
          title: "Arrays group values of the same type",
          content:
            "An array stores several values under one variable name. Every item has an index, and C++ array indexes begin at 0.",
        },
        {
          id: "arrays-intro-code",
          type: "code",
          code: `int scores[4] = {90, 82, 76, 100};

std::cout << scores[0];`,
        },
        {
          id: "arrays-intro-tip",
          type: "tip",
          content:
            "For an array with 4 items, the valid indexes are 0, 1, 2, and 3.",
        },
      ],

      mission: {
        title: "Create the First Matrix",
        instructions:
          "Create an int array named levels containing 2, 4, 6, and 8, then print the first value.",

        starterCode: `#include <iostream>

int main() {
  // Create levels here

  return 0;
}`,

        hints: [
          "Use int levels[4].",
          "Initialize the four values inside braces.",
          "Print levels[0].",
        ],

        validation: [
          {
            type: "cppArrayExists",
            variable: "levels",
            valueType: "int",
            minimumSize: 4,
          },
          {
            type: "cppOutputContains",
            value: "2",
          },
        ],
      },
    },

    {
      id: "cpp-arrays-indexing",
      title: "Indexing Arrays",
      subtitle: "Access exact positions",
      difficulty: "BEGINNER",
      estimatedMinutes: 10,
      xp: 120,

      blocks: [
        {
          id: "array-index-text",
          type: "text",
          title: "Indexes select individual items",
          content:
            "Use square brackets after the array name to read or replace a value at a specific position.",
        },
        {
          id: "array-index-code",
          type: "code",
          code: `int energy[3] = {25, 50, 75};

energy[1] = 60;

std::cout << energy[1];`,
        },
        {
          id: "array-index-tip",
          type: "tip",
          content:
            "Accessing an index outside the array bounds is unsafe and can cause unpredictable behavior.",
        },
      ],

      mission: {
        title: "Repair a Matrix Cell",
        instructions: "Change the second item of values to 99 and print it.",

        starterCode: `#include <iostream>

int main() {
  int values[4] = {10, 20, 30, 40};

  // Change the second value

  return 0;
}`,

        hints: [
          "The second item has index 1.",
          "Assign 99 to values[1].",
          "Print values[1].",
        ],

        validation: [
          {
            type: "cppArrayIndexAssignment",
            variable: "values",
            index: 1,
            value: 99,
          },
          {
            type: "cppOutputContains",
            value: "99",
          },
        ],
      },
    },

    {
      id: "cpp-arrays-loops",
      title: "Looping Through Arrays",
      subtitle: "Process every item",
      difficulty: "BEGINNER",
      estimatedMinutes: 11,
      xp: 130,

      blocks: [
        {
          id: "array-loops-text",
          type: "text",
          title: "Loops and arrays work together",
          content:
            "A for loop can move through array indexes one by one so the same logic can process every element.",
        },
        {
          id: "array-loops-code",
          type: "code",
          code: `int scores[3] = {8, 9, 10};

for (int i = 0; i < 3; i++) {
  std::cout << scores[i] << "\\n";
}`,
        },
        {
          id: "array-loops-tip",
          type: "tip",
          content:
            "The loop condition should stop before the index reaches the array size.",
        },
      ],

      mission: {
        title: "Scan Every Cell",
        instructions:
          "Use a for loop to print every value in the numbers array.",

        starterCode: `#include <iostream>

int main() {
  int numbers[5] = {3, 6, 9, 12, 15};

  // Loop through the array

  return 0;
}`,

        hints: [
          "Start i at 0.",
          "Continue while i < 5.",
          "Print numbers[i] inside the loop.",
        ],

        validation: [
          {
            type: "cppHasForLoop",
          },
          {
            type: "cppArrayIndexedInLoop",
            variable: "numbers",
          },
        ],
      },
    },

    {
      id: "cpp-arrays-range-loops",
      title: "Range-Based Loops",
      subtitle: "Iterate more cleanly",
      difficulty: "BEGINNER",
      estimatedMinutes: 10,
      xp: 130,

      blocks: [
        {
          id: "range-loop-text",
          type: "text",
          title: "Range-based for loops read collections directly",
          content:
            "Modern C++ lets you loop over each value in an array without manually managing an index.",
        },
        {
          id: "range-loop-code",
          type: "code",
          code: `int levels[4] = {1, 2, 3, 4};

for (int level : levels) {
  std::cout << level << "\\n";
}`,
        },
        {
          id: "range-loop-tip",
          type: "tip",
          content:
            "Use a range-based loop when you only need each value and do not need its index.",
        },
      ],

      mission: {
        title: "Activate Clean Iteration",
        instructions:
          "Use a range-based for loop to print every value in the powers array.",

        starterCode: `#include <iostream>

int main() {
  int powers[4] = {20, 40, 60, 80};

  // Use a range-based loop

  return 0;
}`,

        hints: [
          "Use syntax like for (int value : powers).",
          "Print value inside the loop.",
          "You do not need an index variable.",
        ],

        validation: [
          {
            type: "cppHasRangeForLoop",
            variable: "powers",
          },
        ],
      },
    },

    {
      id: "cpp-arrays-strings",
      title: "Strings as Collections",
      subtitle: "Work with text character by character",
      difficulty: "BEGINNER",
      estimatedMinutes: 11,
      xp: 140,

      blocks: [
        {
          id: "strings-collection-text",
          type: "text",
          title: "A string is a sequence of characters",
          content:
            "std::string supports indexing and iteration, which means you can inspect or process individual characters just like collection data.",
        },
        {
          id: "strings-collection-code",
          type: "code",
          code: `std::string code = "CORE";

std::cout << code[0];

for (char letter : code) {
  std::cout << letter << "\\n";
}`,
        },
        {
          id: "strings-collection-tip",
          type: "tip",
          content:
            "std::string provides useful functions such as size() for discovering how many characters it contains.",
        },
      ],

      mission: {
        title: "Scan a Code String",
        instructions:
          'Create a string named code with the value "MATRIX" and print each character using a loop.',

        starterCode: `#include <iostream>
#include <string>

int main() {
  // Create and scan code

  return 0;
}`,

        hints: [
          "Use std::string.",
          'Assign "MATRIX".',
          "A range-based for loop can iterate through chars.",
        ],

        validation: [
          {
            type: "cppStringVariableEquals",
            variable: "code",
            value: "MATRIX",
          },
          {
            type: "cppStringIterated",
            variable: "code",
          },
        ],
      },
    },

    {
      id: "cpp-arrays-multidimensional",
      title: "2D Arrays",
      subtitle: "Build rows and columns",
      difficulty: "INTERMEDIATE",
      estimatedMinutes: 13,
      xp: 160,

      blocks: [
        {
          id: "2d-array-text",
          type: "text",
          title: "Two-dimensional arrays form a matrix",
          content:
            "A 2D array stores values in rows and columns. Access an item with two indexes: the row first and the column second.",
        },
        {
          id: "2d-array-code",
          type: "code",
          code: `int grid[2][3] = {
  {1, 2, 3},
  {4, 5, 6}
};

std::cout << grid[1][2];`,
        },
        {
          id: "2d-array-tip",
          type: "tip",
          content:
            "Nested loops are commonly used to process every row and column in a 2D array.",
        },
      ],

      mission: {
        title: "Build a Data Grid",
        instructions:
          "Create a 2x2 int grid containing 1, 2, 3, 4 and print the bottom-right value.",

        starterCode: `#include <iostream>

int main() {
  // Create a 2x2 grid

  return 0;
}`,

        hints: [
          "Use int grid[2][2].",
          "The bottom-right location is grid[1][1].",
          "Print that value.",
        ],

        validation: [
          {
            type: "cppTwoDimensionalArrayExists",
            variable: "grid",
            rows: 2,
            columns: 2,
          },
          {
            type: "cppOutputContains",
            value: "4",
          },
        ],
      },
    },

    {
      id: "cpp-arrays-aggregate",
      title: "Array Calculations",
      subtitle: "Turn collections into results",
      difficulty: "INTERMEDIATE",
      estimatedMinutes: 13,
      xp: 170,

      blocks: [
        {
          id: "aggregate-text",
          type: "text",
          title: "Collections become powerful when you calculate with them",
          content:
            "Loops can combine array values to calculate totals, averages, minimums, maximums, and other useful results.",
        },
        {
          id: "aggregate-code",
          type: "code",
          code: `int values[4] = {4, 8, 12, 16};
int total = 0;

for (int value : values) {
  total += value;
}`,
        },
        {
          id: "aggregate-tip",
          type: "tip",
          content:
            "Initialize accumulator variables before the loop so each iteration can update the running result.",
        },
      ],

      mission: {
        title: "Calculate Matrix Energy",
        instructions:
          "Calculate the total of every item in energy and print the result.",

        starterCode: `#include <iostream>

int main() {
  int energy[5] = {10, 20, 30, 40, 50};
  int total = 0;

  // Calculate total energy

  return 0;
}`,

        hints: [
          "Loop through energy.",
          "Add every value to total.",
          "Print total after the loop.",
        ],

        validation: [
          {
            type: "cppArrayAccumulator",
            array: "energy",
            accumulator: "total",
          },
          {
            type: "cppOutputContains",
            value: "150",
          },
        ],
      },
    },
  ],

  challenges: [
    {
      id: "cpp-arrays-challenge-highest",
      title: "Highest Score Scanner",
      subtitle: "Find the strongest value",
      difficulty: "CHALLENGE",
      estimatedMinutes: 15,
      xp: 230,

      description:
        "Scan an array of scores and determine the highest value using a loop and a comparison.",

      starterCode: `#include <iostream>

int main() {
  int scores[6] = {42, 91, 68, 100, 77, 84};

  // Find the highest score

  return 0;
}`,

      hints: [
        "Start with one array value as the current highest.",
        "Loop through the remaining values.",
        "Replace highest when you find a larger score.",
      ],

      validation: [
        {
          type: "cppArrayIndexedInLoop",
          variable: "scores",
        },
        {
          type: "cppHasComparisonOperator",
        },
        {
          type: "cppOutputContains",
          value: "100",
        },
      ],
    },

    {
      id: "cpp-arrays-challenge-average",
      title: "Average Calculator",
      subtitle: "Aggregate collection data",
      difficulty: "CHALLENGE",
      estimatedMinutes: 16,
      xp: 260,

      description:
        "Calculate the total and average of several values stored in an array, preserving decimal precision.",

      starterCode: `#include <iostream>

int main() {
  int values[5] = {10, 20, 30, 40, 50};

  // Calculate the average

  return 0;
}`,

      hints: [
        "First calculate the total.",
        "Convert to double before dividing if necessary.",
        "Divide by the number of items.",
      ],

      validation: [
        {
          type: "cppArrayAccumulator",
          array: "values",
        },
        {
          type: "cppHasDivisionExpression",
        },
      ],
    },

    {
      id: "cpp-arrays-challenge-grid",
      title: "Grid Scanner",
      subtitle: "Process a 2D matrix",
      difficulty: "CHALLENGE",
      estimatedMinutes: 18,
      xp: 300,

      description:
        "Use nested loops to scan a 2D array and print or calculate with every cell.",

      starterCode: `#include <iostream>

int main() {
  int grid[3][3] = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
  };

  // Scan the grid

  return 0;
}`,

      hints: [
        "Use one loop for rows.",
        "Use another loop for columns.",
        "Access each cell with grid[row][column].",
      ],

      validation: [
        {
          type: "cppHasNestedLoops",
        },
        {
          type: "cppTwoDimensionalArrayIndexed",
          variable: "grid",
        },
      ],
    },

    {
      id: "cpp-arrays-challenge-matrix",
      title: "Array Matrix System",
      subtitle: "Bring the matrix online",
      difficulty: "FINAL CHALLENGE",
      estimatedMinutes: 22,
      xp: 400,

      description:
        "Build a console data system using arrays, loops, string processing, a 2D matrix, and collection calculations.",

      starterCode: `#include <iostream>
#include <string>

int main() {
  // Build the Array Matrix System

  return 0;
}`,

      hints: [
        "Use at least one standard array and one 2D array.",
        "Process collection data with loops.",
        "Include a string and calculate at least one result from stored values.",
      ],

      validation: [
        {
          type: "cppHasArray",
        },
        {
          type: "cppHasTwoDimensionalArray",
        },
        {
          type: "cppHasLoop",
        },
        {
          type: "cppHasString",
        },
        {
          type: "cppHasCollectionCalculation",
        },
        {
          type: "cppMinimumOutputStatements",
          minimum: 2,
        },
      ],
    },
  ],
};

export default cppArrayMatrixContent;
