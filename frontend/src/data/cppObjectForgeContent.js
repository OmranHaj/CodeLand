const cppObjectForgeContent = {
  id: "cpp-object-forge",

  title: "Object Forge",

  subtitle: "Build programs from objects",

  world: "C++ Core",

  description:
    "Learn how C++ classes turn data and behavior into reusable objects using constructors, methods, access control, encapsulation, inheritance, polymorphism, and composition.",

  execution: {
    mode: "backend-runner",
    enabled: false,
    language: "cpp",
  },

  lessons: [
    {
      id: "cpp-oop-classes",
      title: "Classes & Objects",
      subtitle: "Create your own types",
      difficulty: "BEGINNER",
      estimatedMinutes: 11,
      xp: 130,

      blocks: [
        {
          id: "classes-text",
          type: "text",
          title: "A class describes what an object can store and do",
          content:
            "A class is a blueprint for a custom type. An object is a real instance created from that blueprint.",
        },
        {
          id: "classes-code",
          type: "code",
          code: `class Robot {
public:
  int energy = 100;
};

Robot helper;
std::cout << helper.energy;`,
        },
        {
          id: "classes-tip",
          type: "tip",
          content:
            "Class names usually begin with a capital letter so they stand out from ordinary variables.",
        },
      ],

      mission: {
        title: "Forge Your First Object",
        instructions:
          "Create a class named Player with a public int member named level, then create one Player object and print its level.",

        starterCode: `#include <iostream>

// Create Player here

int main() {
  // Create an object and print its level

  return 0;
}`,

        hints: [
          "Start with class Player.",
          "Add public: before level.",
          "Create an object such as Player hero;",
        ],

        validation: [
          {
            type: "cppClassExists",
            className: "Player",
          },
          {
            type: "cppClassMemberExists",
            className: "Player",
            member: "level",
          },
          {
            type: "cppObjectCreated",
            className: "Player",
          },
        ],
      },
    },

    {
      id: "cpp-oop-members",
      title: "Data Members & Methods",
      subtitle: "Give objects state and behavior",
      difficulty: "BEGINNER",
      estimatedMinutes: 12,
      xp: 140,

      blocks: [
        {
          id: "members-text",
          type: "text",
          title: "Objects can combine data with functions",
          content:
            "Variables declared inside a class describe object state. Functions declared inside a class are methods that define object behavior.",
        },
        {
          id: "members-code",
          type: "code",
          code: `class Drone {
public:
  int power = 50;

  void boost() {
    power += 10;
  }
};`,
        },
        {
          id: "members-tip",
          type: "tip",
          content:
            "Methods can read and change the members belonging to the same object.",
        },
      ],

      mission: {
        title: "Add Forge Behavior",
        instructions:
          "Create a class named Bot with an int energy member and a method named recharge that increases energy.",

        starterCode: `#include <iostream>

// Build Bot here

int main() {
  Bot bot;
  bot.recharge();

  return 0;
}`,

        hints: [
          "Put energy and recharge inside Bot.",
          "Make them public for this exercise.",
          "Increase energy inside recharge.",
        ],

        validation: [
          {
            type: "cppClassExists",
            className: "Bot",
          },
          {
            type: "cppClassMethodExists",
            className: "Bot",
            method: "recharge",
          },
        ],
      },
    },

    {
      id: "cpp-oop-constructors",
      title: "Constructors",
      subtitle: "Initialize objects when they are created",
      difficulty: "BEGINNER",
      estimatedMinutes: 12,
      xp: 150,

      blocks: [
        {
          id: "constructors-text",
          type: "text",
          title: "Constructors prepare new objects",
          content:
            "A constructor has the same name as its class and runs automatically when an object is created.",
        },
        {
          id: "constructors-code",
          type: "code",
          code: `class Player {
public:
  int score;

  Player(int startScore) {
    score = startScore;
  }
};

Player hero(200);`,
        },
        {
          id: "constructors-tip",
          type: "tip",
          content:
            "Constructors are useful for guaranteeing that new objects begin with valid data.",
        },
      ],

      mission: {
        title: "Ignite the Constructor",
        instructions:
          "Create a class named Reactor with a constructor that receives an int and stores it in a member named power.",

        starterCode: `#include <iostream>

// Build Reactor here

int main() {
  Reactor core(75);
  return 0;
}`,

        hints: [
          "Add an int member named power.",
          "The constructor must be named Reactor.",
          "Give the constructor one int parameter.",
        ],

        validation: [
          {
            type: "cppConstructorExists",
            className: "Reactor",
          },
          {
            type: "cppConstructorParameterCount",
            className: "Reactor",
            count: 1,
          },
        ],
      },
    },

    {
      id: "cpp-oop-access",
      title: "Public & Private",
      subtitle: "Control access to object data",
      difficulty: "INTERMEDIATE",
      estimatedMinutes: 12,
      xp: 160,

      blocks: [
        {
          id: "access-text",
          type: "text",
          title: "Access specifiers protect implementation details",
          content:
            "public members can be used from outside the class. private members are hidden from outside code and can only be accessed by the class itself or trusted mechanisms.",
        },
        {
          id: "access-code",
          type: "code",
          code: `class Vault {
private:
  int code = 1234;

public:
  int getCode() {
    return code;
  }
};`,
        },
        {
          id: "access-tip",
          type: "tip",
          content:
            "Keeping internal data private helps prevent outside code from putting an object into an invalid state.",
        },
      ],

      mission: {
        title: "Seal the Data Chamber",
        instructions:
          "Create a class named Account with a private int balance and a public method that returns the balance.",

        starterCode: `#include <iostream>

// Build Account here

int main() {
  Account account;
  return 0;
}`,

        hints: [
          "Put balance under private:.",
          "Create a public getter method.",
          "The getter should return balance.",
        ],

        validation: [
          {
            type: "cppPrivateMemberExists",
            className: "Account",
            member: "balance",
          },
          {
            type: "cppPublicMethodExists",
            className: "Account",
          },
        ],
      },
    },

    {
      id: "cpp-oop-encapsulation",
      title: "Encapsulation",
      subtitle: "Protect state behind methods",
      difficulty: "INTERMEDIATE",
      estimatedMinutes: 13,
      xp: 170,

      blocks: [
        {
          id: "encapsulation-text",
          type: "text",
          title: "Objects should control how their data changes",
          content:
            "Encapsulation keeps object state behind a clear interface. Instead of changing private data directly, outside code calls methods that enforce rules.",
        },
        {
          id: "encapsulation-code",
          type: "code",
          code: `class EnergyCell {
private:
  int energy = 0;

public:
  void charge(int amount) {
    if (amount > 0) {
      energy += amount;
    }
  }

  int getEnergy() {
    return energy;
  }
};`,
        },
        {
          id: "encapsulation-tip",
          type: "tip",
          content:
            "A good public interface exposes what other code needs without exposing every implementation detail.",
        },
      ],

      mission: {
        title: "Protect Forge Energy",
        instructions:
          "Create a class named Shield with private strength and public methods to increase and read it.",

        starterCode: `#include <iostream>

// Build Shield here

int main() {
  Shield shield;
  return 0;
}`,

        hints: [
          "Keep strength private.",
          "Use one public method to increase strength.",
          "Use another public method to return strength.",
        ],

        validation: [
          {
            type: "cppEncapsulatedMember",
            className: "Shield",
            member: "strength",
          },
          {
            type: "cppMinimumClassMethodCount",
            className: "Shield",
            minimum: 2,
          },
        ],
      },
    },

    {
      id: "cpp-oop-inheritance",
      title: "Inheritance",
      subtitle: "Build specialized classes",
      difficulty: "INTERMEDIATE",
      estimatedMinutes: 14,
      xp: 180,

      blocks: [
        {
          id: "inheritance-text",
          type: "text",
          title: "Derived classes can reuse a base class",
          content:
            "Inheritance lets one class build on another. A derived class can reuse accessible members from its base class and add specialized behavior.",
        },
        {
          id: "inheritance-code",
          type: "code",
          code: `class Machine {
public:
  void start() {
    std::cout << "Starting";
  }
};

class Drone : public Machine {
};`,
        },
        {
          id: "inheritance-tip",
          type: "tip",
          content:
            "Use inheritance when the relationship truly represents an 'is-a' concept, not simply to reuse code.",
        },
      ],

      mission: {
        title: "Forge a Specialized Unit",
        instructions:
          "Create a base class named Unit and a class named Scout that publicly inherits from Unit.",

        starterCode: `#include <iostream>

// Create Unit and Scout here

int main() {
  Scout scout;
  return 0;
}`,

        hints: [
          "Define Unit first.",
          "Use class Scout : public Unit.",
          "Add at least one public method to Unit.",
        ],

        validation: [
          {
            type: "cppClassInheritance",
            derivedClass: "Scout",
            baseClass: "Unit",
            access: "public",
          },
        ],
      },
    },

    {
      id: "cpp-oop-polymorphism",
      title: "Virtual Methods & Polymorphism",
      subtitle: "Let objects respond differently",
      difficulty: "INTERMEDIATE",
      estimatedMinutes: 15,
      xp: 190,

      blocks: [
        {
          id: "polymorphism-text",
          type: "text",
          title: "Virtual methods enable runtime behavior changes",
          content:
            "A virtual method in a base class can be overridden by derived classes. Calling through a base reference or pointer can then run the derived implementation.",
        },
        {
          id: "polymorphism-code",
          type: "code",
          code: `class Unit {
public:
  virtual void move() {
    std::cout << "Unit moving";
  }
};

class Flyer : public Unit {
public:
  void move() override {
    std::cout << "Flyer moving";
  }
};`,
        },
        {
          id: "polymorphism-tip",
          type: "tip",
          content:
            "Use override in derived classes so the compiler can verify that you are actually overriding a virtual base method.",
        },
      ],

      mission: {
        title: "Override the Core Command",
        instructions:
          "Create a virtual method named status in a base class Device and override it in a derived class Sensor.",

        starterCode: `#include <iostream>

// Build Device and Sensor here

int main() {
  return 0;
}`,

        hints: [
          "Mark Device::status as virtual.",
          "Inherit Sensor publicly from Device.",
          "Use override on Sensor::status.",
        ],

        validation: [
          {
            type: "cppVirtualMethodExists",
            className: "Device",
            method: "status",
          },
          {
            type: "cppOverrideExists",
            className: "Sensor",
            method: "status",
          },
        ],
      },
    },

    {
      id: "cpp-oop-composition",
      title: "Composition",
      subtitle: "Build objects from other objects",
      difficulty: "INTERMEDIATE",
      estimatedMinutes: 14,
      xp: 180,

      blocks: [
        {
          id: "composition-text",
          type: "text",
          title: "Objects can contain other objects",
          content:
            "Composition models a 'has-a' relationship. A larger object can contain smaller objects as members and coordinate their behavior.",
        },
        {
          id: "composition-code",
          type: "code",
          code: `class Engine {
public:
  int power = 100;
};

class Vehicle {
public:
  Engine engine;
};`,
        },
        {
          id: "composition-tip",
          type: "tip",
          content:
            "Composition is often preferable to inheritance when one type simply uses or owns another type.",
        },
      ],

      mission: {
        title: "Assemble the Forge",
        instructions:
          "Create a class named Core and a class named Robot that contains a Core member.",

        starterCode: `#include <iostream>

// Build Core and Robot here

int main() {
  Robot robot;
  return 0;
}`,

        hints: [
          "Define Core before Robot.",
          "Inside Robot, declare a Core member.",
          "This models Robot has-a Core.",
        ],

        validation: [
          {
            type: "cppCompositionExists",
            ownerClass: "Robot",
            memberClass: "Core",
          },
        ],
      },
    },

    {
      id: "cpp-oop-design",
      title: "Designing Good Objects",
      subtitle: "Give every class one clear job",
      difficulty: "INTERMEDIATE",
      estimatedMinutes: 15,
      xp: 200,

      blocks: [
        {
          id: "design-text",
          type: "text",
          title: "Good class design keeps responsibilities focused",
          content:
            "A class is easier to understand when its data and methods belong to one clear responsibility. Keep interfaces small, protect invariants, and prefer composition when it better models the relationship.",
        },
        {
          id: "design-code",
          type: "code",
          code: `class ScoreTracker {
private:
  int score = 0;

public:
  void add(int amount) {
    if (amount > 0) {
      score += amount;
    }
  }

  int value() const {
    return score;
  }
};`,
        },
        {
          id: "design-tip",
          type: "tip",
          content:
            "Classes are not just containers for variables. They should protect useful rules and present a clear interface.",
        },
      ],

      mission: {
        title: "Design a Clean Object",
        instructions:
          "Create a class named Inventory with private itemCount and public methods to add items and read the current count.",

        starterCode: `#include <iostream>

// Build Inventory here

int main() {
  Inventory inventory;
  return 0;
}`,

        hints: [
          "Keep itemCount private.",
          "Use a method to add positive amounts.",
          "Use a getter to read the value.",
        ],

        validation: [
          {
            type: "cppPrivateMemberExists",
            className: "Inventory",
            member: "itemCount",
          },
          {
            type: "cppMinimumClassMethodCount",
            className: "Inventory",
            minimum: 2,
          },
        ],
      },
    },
  ],

  challenges: [
    {
      id: "cpp-oop-challenge-player",
      title: "Player Class",
      subtitle: "Build a complete object",
      difficulty: "CHALLENGE",
      estimatedMinutes: 16,
      xp: 260,

      description:
        "Create a Player class with private state, a constructor, public methods, and controlled access to its data.",

      starterCode: `#include <iostream>
#include <string>

int main() {
  // Build and use Player

  return 0;
}`,

      hints: [
        "Give Player at least two private data members.",
        "Initialize them through a constructor.",
        "Expose useful public methods instead of direct access.",
      ],

      validation: [
        {
          type: "cppClassExists",
          className: "Player",
        },
        {
          type: "cppConstructorExists",
          className: "Player",
        },
        {
          type: "cppHasPrivateMembers",
          className: "Player",
        },
      ],
    },

    {
      id: "cpp-oop-challenge-inheritance",
      title: "Unit Hierarchy",
      subtitle: "Reuse a base design",
      difficulty: "CHALLENGE",
      estimatedMinutes: 18,
      xp: 300,

      description:
        "Build a base Unit class and at least one specialized derived class that adds or overrides behavior.",

      starterCode: `#include <iostream>

int main() {
  // Build a small Unit hierarchy

  return 0;
}`,

      hints: [
        "Start with a useful base class.",
        "Derive another class publicly.",
        "Add specialized behavior to the derived class.",
      ],

      validation: [
        {
          type: "cppHasInheritance",
        },
        {
          type: "cppMinimumClassCount",
          minimum: 2,
        },
      ],
    },

    {
      id: "cpp-oop-challenge-polymorphism",
      title: "Polymorphic Command",
      subtitle: "Override runtime behavior",
      difficulty: "CHALLENGE",
      estimatedMinutes: 19,
      xp: 330,

      description:
        "Create a virtual method in a base class and override it in multiple derived classes.",

      starterCode: `#include <iostream>

int main() {
  // Build a polymorphic command system

  return 0;
}`,

      hints: [
        "Create one virtual base method.",
        "Use override in derived classes.",
        "Give the derived implementations different output.",
      ],

      validation: [
        {
          type: "cppHasVirtualMethod",
        },
        {
          type: "cppMinimumOverrideCount",
          minimum: 2,
        },
      ],
    },

    {
      id: "cpp-oop-challenge-composition",
      title: "Robot Assembly",
      subtitle: "Combine multiple objects",
      difficulty: "CHALLENGE",
      estimatedMinutes: 19,
      xp: 340,

      description:
        "Build a Robot class from smaller component classes using composition instead of inheritance.",

      starterCode: `#include <iostream>

int main() {
  // Assemble Robot from component objects

  return 0;
}`,

      hints: [
        "Create at least two component classes.",
        "Store component objects inside Robot.",
        "Give Robot a method that uses its components.",
      ],

      validation: [
        {
          type: "cppMinimumClassCount",
          minimum: 3,
        },
        {
          type: "cppHasComposition",
        },
      ],
    },

    {
      id: "cpp-oop-challenge-forge",
      title: "Object Forge System",
      subtitle: "Bring the forge online",
      difficulty: "FINAL CHALLENGE",
      estimatedMinutes: 26,
      xp: 460,

      description:
        "Build a small object-oriented console system using classes, private state, constructors, methods, inheritance or composition, and a clean public interface.",

      starterCode: `#include <iostream>
#include <string>

int main() {
  // Build the Object Forge System

  return 0;
}`,

      hints: [
        "Create several focused classes instead of one giant class.",
        "Protect internal data with private members.",
        "Use constructors and public methods to keep objects valid.",
        "Include either inheritance with overriding or meaningful composition.",
      ],

      validation: [
        {
          type: "cppMinimumClassCount",
          minimum: 3,
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
          type: "cppHasInheritanceOrComposition",
        },
        {
          type: "cppMinimumOutputStatements",
          minimum: 2,
        },
      ],
    },
  ],
};

export default cppObjectForgeContent;
