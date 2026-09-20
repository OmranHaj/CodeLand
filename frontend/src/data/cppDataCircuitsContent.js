const cppDataCircuitsContent = {
  id: "cpp-data-circuits",

  title: "Data Circuits",

  subtitle: "Control information",

  world: "C++ Core",

  description:
    "Learn how C++ stores information using variables, numeric types, text, constants, operators, input, and conversions.",

  execution: {
    mode: "backend-runner",
    enabled: false,
    language: "cpp",
  },

  lessons: [
    {
      id: "cpp-data-variables",
      title: "Variables",
      subtitle: "Store information in memory",
      difficulty: "BEGINNER",
      estimatedMinutes: 8,
      xp: 100,

      blocks: [
        {
          id: "variables-intro",
          type: "text",
          title: "A variable is a named storage location",
          content:
            "Variables let your program remember values. In C++, you declare a variable by choosing a type, giving it a name, and optionally assigning an initial value.",
        },
        {
          id: "variables-example",
          type: "code",
          code: `int score = 120;
double energy = 87.5;
char rank = 'A';`,
        },
        {
          id: "variables-tip",
          type: "tip",
          content:
            "Use descriptive names. score is easier to understand than a value named x.",
        },
      ],

      mission: {
        title: "Create the First Data Node",
        instructions:
          "Create an int variable named score and give it the value 250.",

        starterCode: `#include <iostream>

int main() {
  // Create score here

  std::cout << score;
  return 0;
}`,

        hints: [
          "The type should be int.",
          "The variable name should be score.",
          "Assign 250 when you declare it.",
        ],

        validation: [
          {
            type: "cppVariableEquals",
            variable: "score",
            value: 250,
          },
        ],
      },
    },

    {
      id: "cpp-data-numeric-types",
      title: "Numeric Types",
      subtitle: "Choose the right data size",
      difficulty: "BEGINNER",
      estimatedMinutes: 9,
      xp: 110,

      blocks: [
        {
          id: "numeric-types-intro",
          type: "text",
          title: "Different numbers need different types",
          content:
            "int stores whole numbers, while float and double store decimal values. Choosing an appropriate type tells C++ how the data should be represented.",
        },
        {
          id: "numeric-types-code",
          type: "code",
          code: `int lives = 3;
float speed = 4.5f;
double temperature = 21.75;`,
        },
        {
          id: "numeric-types-tip",
          type: "tip",
          content:
            "double provides more precision than float and is a common default for decimal calculations.",
        },
      ],

      mission: {
        title: "Calibrate Energy",
        instructions:
          "Create a double named energy with the value 98.75 and print it.",

        starterCode: `#include <iostream>

int main() {
  // Store the energy value

  return 0;
}`,

        hints: [
          "Use the double type.",
          "Name the variable energy.",
          "Print it with std::cout.",
        ],

        validation: [
          {
            type: "cppVariableType",
            variable: "energy",
            valueType: "double",
          },
          {
            type: "cppOutputContains",
            value: "98.75",
          },
        ],
      },
    },

    {
      id: "cpp-data-text",
      title: "Text & Characters",
      subtitle: "Store words and symbols",
      difficulty: "BEGINNER",
      estimatedMinutes: 9,
      xp: 110,

      blocks: [
        {
          id: "text-string",
          type: "text",
          title: "Strings hold text",
          content:
            "std::string stores words and sentences. A char stores one character and uses single quotes, while strings use double quotes.",
        },
        {
          id: "text-code",
          type: "code",
          code: `#include <string>

std::string pilot = "Nova";
char grade = 'A';`,
        },
        {
          id: "text-tip",
          type: "tip",
          content:
            "Use std::string when your value can contain more than one character.",
        },
      ],

      mission: {
        title: "Register a Pilot",
        instructions:
          'Create a std::string named pilot with the value "CodeLand".',

        starterCode: `#include <iostream>
#include <string>

int main() {
  // Create pilot here

  std::cout << pilot;
  return 0;
}`,

        hints: [
          "The type is std::string.",
          "The value needs double quotes.",
          'The expected value is "CodeLand".',
        ],

        validation: [
          {
            type: "cppStringVariableEquals",
            variable: "pilot",
            value: "CodeLand",
          },
        ],
      },
    },

    {
      id: "cpp-data-constants",
      title: "Constants",
      subtitle: "Protect values from change",
      difficulty: "BEGINNER",
      estimatedMinutes: 8,
      xp: 100,

      blocks: [
        {
          id: "constants-intro",
          type: "text",
          title: "Some values should stay fixed",
          content:
            "The const keyword creates a value that cannot be reassigned after initialization. Constants make intent clear and protect important configuration values.",
        },
        {
          id: "constants-code",
          type: "code",
          code: `const int MAX_LIVES = 5;
const double PI = 3.14159;`,
        },
        {
          id: "constants-tip",
          type: "tip",
          content:
            "Many teams write constant names in uppercase so they are easy to recognize.",
        },
      ],

      mission: {
        title: "Lock the Maximum Level",
        instructions:
          "Create a const int named MAX_LEVEL with the value 99.",

        starterCode: `#include <iostream>

int main() {
  // Create a protected value

  return 0;
}`,

        hints: [
          "Start the declaration with const.",
          "Use int as the type.",
          "Name it MAX_LEVEL and assign 99.",
        ],

        validation: [
          {
            type: "cppConstVariableEquals",
            variable: "MAX_LEVEL",
            value: 99,
          },
        ],
      },
    },

    {
      id: "cpp-data-operators",
      title: "Arithmetic Operators",
      subtitle: "Transform numeric data",
      difficulty: "BEGINNER",
      estimatedMinutes: 10,
      xp: 120,

      blocks: [
        {
          id: "operators-intro",
          type: "text",
          title: "C++ can calculate with your variables",
          content:
            "Use +, -, *, /, and % to perform arithmetic. Expressions can combine variables and values to produce new data.",
        },
        {
          id: "operators-code",
          type: "code",
          code: `int coins = 20;
int bonus = 5;
int total = coins + bonus;`,
        },
        {
          id: "operators-tip",
          type: "tip",
          content:
            "When both values are integers, integer division removes the decimal part. Use double when decimal precision matters.",
        },
      ],

      mission: {
        title: "Calculate Total Power",
        instructions:
          "Create power = basePower + boost and print the result.",

        starterCode: `#include <iostream>

int main() {
  int basePower = 70;
  int boost = 25;

  // Calculate total power

  return 0;
}`,

        hints: [
          "Create a new int variable named power.",
          "Add basePower and boost.",
          "Print power using std::cout.",
        ],

        validation: [
          {
            type: "cppVariableExpression",
            variable: "power",
            expressionContains: ["basePower", "+", "boost"],
          },
          {
            type: "cppOutputContains",
            value: "95",
          },
        ],
      },
    },

    {
      id: "cpp-data-input",
      title: "Input with cin",
      subtitle: "Receive data from the user",
      difficulty: "BEGINNER",
      estimatedMinutes: 11,
      xp: 130,

      blocks: [
        {
          id: "input-intro",
          type: "text",
          title: "Programs can receive information",
          content:
            "std::cin reads values from standard input. The >> operator sends the incoming value into a variable.",
        },
        {
          id: "input-code",
          type: "code",
          code: `int age;

std::cout << "Age: ";
std::cin >> age;`,
        },
        {
          id: "input-tip",
          type: "tip",
          content:
            "Declare the variable before using std::cin so C++ knows where the incoming value should be stored.",
        },
      ],

      mission: {
        title: "Open an Input Channel",
        instructions:
          "Read an integer into a variable named level using std::cin.",

        starterCode: `#include <iostream>

int main() {
  int level;

  // Read level here

  std::cout << level;
  return 0;
}`,

        hints: [
          "Use std::cin.",
          "The extraction operator is >>.",
          "Send the input into level.",
        ],

        validation: [
          {
            type: "cppUsesCinFor",
            variable: "level",
          },
        ],
      },
    },

    {
      id: "cpp-data-conversion",
      title: "Type Conversion",
      subtitle: "Move data between types",
      difficulty: "BEGINNER",
      estimatedMinutes: 10,
      xp: 130,

      blocks: [
        {
          id: "conversion-intro",
          type: "text",
          title: "Sometimes data needs another type",
          content:
            "C++ can convert values automatically in simple cases, but explicit casts make your intention clear when precision or integer division matters.",
        },
        {
          id: "conversion-code",
          type: "code",
          code: `int points = 7;
int players = 2;

double average =
  static_cast<double>(points) / players;`,
        },
        {
          id: "conversion-tip",
          type: "tip",
          content:
            "static_cast<double>(value) is a clear modern C++ way to request a numeric conversion.",
        },
      ],

      mission: {
        title: "Recover Decimal Precision",
        instructions:
          "Calculate a decimal average using static_cast<double> so 7 / 2 becomes 3.5.",

        starterCode: `#include <iostream>

int main() {
  int points = 7;
  int players = 2;

  // Create a decimal average

  return 0;
}`,

        hints: [
          "Create a double named average.",
          "Cast points to double before dividing.",
          "Print average.",
        ],

        validation: [
          {
            type: "cppUsesStaticCast",
            valueType: "double",
          },
          {
            type: "cppOutputContains",
            value: "3.5",
          },
        ],
      },
    },
  ],

  challenges: [
    {
      id: "cpp-data-challenge-profile",
      title: "Player Profile",
      subtitle: "Store mixed player data",
      difficulty: "CHALLENGE",
      estimatedMinutes: 14,
      xp: 200,

      description:
        "Build a player profile using a string, an integer, a decimal value, and a character rank, then print the stored data.",

      starterCode: `#include <iostream>
#include <string>

int main() {
  // Build the player profile

  return 0;
}`,

      hints: [
        "Use std::string for the player name.",
        "Use int for a whole-number level.",
        "Use double for a decimal score and char for a single rank.",
      ],

      validation: [
        {
          type: "cppHasVariableTypes",
          types: ["std::string", "int", "double", "char"],
        },
        {
          type: "cppMinimumOutputStatements",
          minimum: 1,
        },
      ],
    },

    {
      id: "cpp-data-challenge-converter",
      title: "Temperature Converter",
      subtitle: "Turn one value into another",
      difficulty: "CHALLENGE",
      estimatedMinutes: 16,
      xp: 230,

      description:
        "Store a Celsius temperature and calculate Fahrenheit using arithmetic with decimal values.",

      starterCode: `#include <iostream>

int main() {
  double celsius = 25.0;

  // Calculate fahrenheit

  return 0;
}`,

      hints: [
        "The formula is celsius * 9.0 / 5.0 + 32.0.",
        "Store the result in a double named fahrenheit.",
        "Print fahrenheit.",
      ],

      validation: [
        {
          type: "cppVariableExists",
          variable: "fahrenheit",
          valueType: "double",
        },
        {
          type: "cppOutputContains",
          value: "77",
        },
      ],
    },

    {
      id: "cpp-data-challenge-inventory",
      title: "Inventory Calculator",
      subtitle: "Calculate stored value",
      difficulty: "CHALLENGE",
      estimatedMinutes: 16,
      xp: 250,

      description:
        "Use quantity, price, and arithmetic to calculate the total value of an inventory item.",

      starterCode: `#include <iostream>

int main() {
  int quantity = 8;
  double price = 12.5;

  // Calculate inventory value

  return 0;
}`,

      hints: [
        "Multiply quantity by price.",
        "Store the result in a variable named total.",
        "Use a decimal type for total.",
      ],

      validation: [
        {
          type: "cppVariableExpression",
          variable: "total",
          expressionContains: ["quantity", "*", "price"],
        },
        {
          type: "cppOutputContains",
          value: "100",
        },
      ],
    },

    {
      id: "cpp-data-challenge-scanner",
      title: "Data Scanner",
      subtitle: "Activate the Data Circuits",
      difficulty: "FINAL CHALLENGE",
      estimatedMinutes: 20,
      xp: 350,

      description:
        "Build a console program that reads user data, stores multiple types, uses a constant, performs a calculation, and prints a final system report.",

      starterCode: `#include <iostream>
#include <string>

int main() {
  // Build the Data Scanner

  return 0;
}`,

      hints: [
        "Create at least one std::string, int, and double.",
        "Use const for one fixed configuration value.",
        "Use std::cin at least once and calculate a new value.",
      ],

      validation: [
        {
          type: "cppHasVariableTypes",
          types: ["std::string", "int", "double"],
        },
        {
          type: "cppHasConst",
        },
        {
          type: "cppUsesCin",
        },
        {
          type: "cppHasArithmeticExpression",
        },
        {
          type: "cppMinimumOutputStatements",
          minimum: 2,
        },
      ],
    },
  ],
};

export default cppDataCircuitsContent;