import { useEffect, useRef, useState, useLayoutEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Camera,
  Eye,
  Layers,
  Cpu,
  Zap,
} from "lucide-react";
import gsap from "gsap";
import Cpp3DStage from "../CppWorld/Cpp3DStage";
import Cpp3DCameraRig from "../CppWorld/Cpp3DCameraRig";
import styles from "./CppLessonAnimation.module.css";

/* ====================================================== */
/* C++ SIMULATION PHASES DATA METADATA                    */
/* ====================================================== */
const CPP_PHASES_DATA = {
  // Syntax Core
  "cpp-intro": {
    title: "C++ Compilation & Execution Core",
    accent: "#06b6d4",
    phases: [
      {
        phaseTitle: "1. Source Code Creation",
        text: "Source File Created: Developer writes high-level C++ code in 'main.cpp'. Contains #include <iostream> and main().",
        subtext: "Computers cannot execute text directly; it must be translated into raw machine instructions.",
        registers: { File: "main.cpp", Language: "C++20", Status: "Source Text Ready" },
      },
      {
        phaseTitle: "2. Preprocessing & Libraries",
        text: "Preprocessor Invocation: The preprocessor copies declarations from <iostream> directly into the translation unit.",
        subtext: "Header files supply standard input and output tools like std::cout.",
        registers: { Stage: "Preprocessed", Directives: "#include", Output: "main.ii" },
      },
      {
        phaseTitle: "3. Compiler Core & AST Analysis",
        text: "Compiler Translation: The compiler lexes and parses source code into an Abstract Syntax Tree (AST), checking syntax rules.",
        subtext: "Every semicolon and bracket is verified for 100% strict grammatical correctness.",
        registers: { Compiler: "g++ / clang", Syntax: "Verified ✓", Errors: 0 },
      },
      {
        phaseTitle: "4. Object Code Generation",
        text: "Assembly to Machine Code: The compiler converts the AST into architecture-specific binary object code (main.o).",
        subtext: "Human-readable code has now become binary zeroes and ones!",
        registers: { ObjectFile: "main.o", Architecture: "x86_64", Status: "Compiled" },
      },
      {
        phaseTitle: "5. Linker Resolution",
        text: "Linker Step: Resolves references to external standard library symbols and combines them into an executable binary (main.exe).",
        subtext: "The linker hooks your code to the operating system's runtime libraries.",
        registers: { Linker: "ld", Target: "main.exe", Executable: "Ready ✓" },
      },
      {
        phaseTitle: "6. CPU Execution & Output",
        text: "Runtime Execution: Operating system loads main.exe into RAM. The CPU executes main() and prints 'Welcome to C++'!",
        subtext: "Blazing fast native speed with zero virtual machine overhead!",
        registers: { Process: "PID 4102", ExitCode: 0, Output: "Welcome to C++" },
      },
    ],
  },
  "cpp-syntax-welcome": {
    title: "Welcome to C++ System Architecture",
    accent: "#06b6d4",
    phases: [
      {
        phaseTitle: "1. High Performance Language",
        text: "Direct Hardware Access: C++ provides zero-cost abstractions with near-assembly performance.",
        subtext: "Used worldwide in game engines, browsers, operating systems, and high-frequency trading.",
        registers: { Paradigm: "Multi-Paradigm", Performance: "Direct Hardware", Memory: "Deterministic" },
      },
      {
        phaseTitle: "2. Compilation Pipeline",
        text: "Native Machine Code: C++ compiles directly to CPU binary instructions without an interpreter or bytecode VM.",
        subtext: "No garbage collection pauses, granting microsecond predictability.",
        registers: { Execution: "Native x86_64", Latency: "Sub-microsecond", Overhead: "Zero" },
      },
      {
        phaseTitle: "3. Modern C++ Standard",
        text: "C++20 Modules & Concepts: Modern C++ is clean, expressive, type-safe, and lightning fast.",
        subtext: "Combines powerful high-level abstractions with the lowest-level control.",
        registers: { Standard: "C++20 / C++23", Safety: "Strong Static Typing", Status: "Core Primed ✓" },
      },
    ],
  },
  "cpp-program-flow": {
    title: "Program Construction & Control Flow",
    accent: "#3b82f6",
    phases: [
      {
        phaseTitle: "1. Include Standard Library",
        text: "Library Inclusion: #include <iostream> loads the input/output stream declarations into the program.",
        subtext: "Always included at the top of the file so std::cout is known to the compiler.",
        registers: { Header: "<iostream>", Symbols: "std::cout, std::cin" },
      },
      {
        phaseTitle: "2. Entry Point: main()",
        text: "Program Entry Point: Execution begins strictly at the start of int main().",
        subtext: "Every executable C++ program worldwide must have exactly one main() function.",
        registers: { Entry: "main()", ReturnType: "int", StackFrame: "Allocated" },
      },
      {
        phaseTitle: "3. Sequential Statements",
        text: "Instruction Execution: The CPU executes statements top-to-bottom inside the function body { ... }.",
        subtext: "Statements end with semicolons (;) to clearly separate operations.",
        registers: { Instruction: "std::cout", Flow: "Sequential", Line: 4 },
      },
      {
        phaseTitle: "4. Return Statement & Exit Code",
        text: "Graceful Exit: return 0; terminates main() and reports exit code 0 to the operating system.",
        subtext: "An exit code of 0 universally means 'Program executed with zero errors'.",
        registers: { ReturnCode: 0, Status: "Program Finished Successfully" },
      },
    ],
  },
  "cpp-syntax-first-program": {
    title: "First Program Construction",
    accent: "#3b82f6",
    phases: [
      {
        phaseTitle: "1. Preprocessor Directives",
        text: "#include <iostream> instructs the preprocessor to include standard IO stream definitions.",
        subtext: "Directives begin with '#' and are processed before compiler syntax checking.",
        registers: { Directive: "#include", Target: "<iostream>", Status: "Resolved" },
      },
      {
        phaseTitle: "2. Function Signature",
        text: "int main() defines the standard entry point. 'int' means an integer exit code is returned.",
        subtext: "Execution starts here and finishes when the closing bracket or return is reached.",
        registers: { Entry: "main()", Signature: "int main()", Stack: "Initialized" },
      },
      {
        phaseTitle: "3. Console Output",
        text: "std::cout << 'Hello CodeLand' << std::endl; inserts characters into the console stream.",
        subtext: "std::endl writes a newline and flushes the output buffer immediately.",
        registers: { Stream: "std::cout", Buffer: "Flushed", Output: "Hello CodeLand" },
      },
      {
        phaseTitle: "4. Termination Code",
        text: "return 0; hands control back to the operating system with status code 0 (Success).",
        subtext: "Operating systems inspect this exit code to confirm error-free execution.",
        registers: { ExitCode: 0, State: "Terminated Gracefully ✓" },
      },
    ],
  },
  "cpp-main-function": {
    title: "CPU Execution Engine & Call Stack",
    accent: "#8b5cf6",
    phases: [
      {
        phaseTitle: "1. CPU Reset & Boot",
        text: "CPU Core Ready: Registers cleared, instruction pointer EIP loaded with entry point address 0x00401000.",
        subtext: "The microprocessor is primed to execute the very first machine cycle.",
        registers: { CPU: "Ready", EIP: "0x00401000", Mode: "Kernel to User" },
      },
      {
        phaseTitle: "2. Call main()",
        text: "Function Call: Operating system invokes main(). Instruction pointer advances to function prologue.",
        subtext: "The call instruction pushes the return address onto the CPU stack.",
        registers: { Call: "CALL main()", EIP: "0x00401004", RSP: "0x7FFF00" },
      },
      {
        phaseTitle: "3. Stack Frame Allocation",
        text: "Stack Frame Setup: Memory is reserved in the Call Stack for local variables inside main().",
        subtext: "Stack allocation is instantaneous: just adjusting the stack pointer register!",
        registers: { Frame: "main() Stack", BasePointer: "RBP", StackDepth: 1 },
      },
      {
        phaseTitle: "4. Instruction Step-Through",
        text: "Line Execution: CPU executes statements line-by-line, updating internal registers and cache.",
        subtext: "High-speed hardware pipelines process millions of operations per second.",
        registers: { Execution: "Line by Line", ALU: "Active", CacheHit: "L1 Data" },
      },
      {
        phaseTitle: "5. Clean Exit Code",
        text: "Clean Exit: EAX register set to 0. Stack frame collapsed and control returned to OS.",
        subtext: "All local stack variables are automatically cleaned up in zero time.",
        registers: { EAX: 0, StackFrame: "Destroyed", Return: "Exit Code 0" },
      },
    ],
  },
  "cpp-syntax-main": {
    title: "The Main Entry Point",
    accent: "#8b5cf6",
    phases: [
      {
        phaseTitle: "1. The Universal Entry Point",
        text: "int main() is the single guaranteed starting point for any C++ executable.",
        subtext: "No matter how large the codebase, execution always starts here.",
        registers: { Symbol: "_main", Scope: "Global", Entry: "0x00401000" },
      },
      {
        phaseTitle: "2. Argument Support",
        text: "Can take command line arguments: int main(int argc, char* argv[]).",
        subtext: "argc counts the parameters, and argv provides the string values.",
        registers: { "argc": 1, "argv[0]": "./main", Args: "Loaded" },
      },
      {
        phaseTitle: "3. Return Code Protocol",
        text: "Returning 0 signals success; any non-zero value signals an error code to the OS.",
        subtext: "Bash or PowerShell can inspect this via $? or $LASTEXITCODE.",
        registers: { ReturnCode: 0, Result: "Success (0)" },
      },
    ],
  },
  "cpp-output": {
    title: "Output Stream Engine (std::cout)",
    accent: "#10b981",
    phases: [
      {
        phaseTitle: "1. Memory Source Data",
        text: "Source String: The text 'Hello' is stored as a string literal in read-only memory.",
        subtext: "Characters are stored as contiguous ASCII bytes terminated with a null byte ('\\0').",
        registers: { String: "'Hello'", Bytes: 5, Memory: "ROData" },
      },
      {
        phaseTitle: "2. Stream Insertion Operator <<",
        text: "Stream Insertion: The << operator pumps characters from memory into the std::cout stream.",
        subtext: "The << operator acts like a pipeline pointing data into the output stream.",
        registers: { Operator: "<<", Stream: "std::cout", Action: "Insert" },
      },
      {
        phaseTitle: "3. Stream Buffer Accumulation",
        text: "Buffering: Characters are collected in an in-memory buffer before being written to the console.",
        subtext: "Buffering minimizes slow operating system system-calls (syscalls).",
        registers: { Buffer: "['H','e','l','l','o']", BufferState: "Filling" },
      },
      {
        phaseTitle: "4. Terminal Display Flush",
        text: "Buffer Flush: The stream flushes the buffer to the terminal screen. 'Hello' appears instantly!",
        subtext: "std::endl or newline '\\n' triggers an immediate buffer flush.",
        registers: { Terminal: "Console", Flushed: "Hello", Status: "Printed ✓" },
      },
    ],
  },
  "cpp-syntax-cout": {
    title: "Console Output Streams",
    accent: "#10b981",
    phases: [
      {
        phaseTitle: "1. Namespace std",
        text: "std::cout lives inside namespace std (Standard Library).",
        subtext: "Namespaces prevent naming collisions between different libraries.",
        registers: { Namespace: "std", Stream: "cout", Type: "ostream" },
      },
      {
        phaseTitle: "2. Chaining Operator <<",
        text: "Multiple items can be chained: std::cout << 'A: ' << a << ' B: ' << b;",
        subtext: "The << operator returns a reference to std::cout, allowing left-to-right chaining.",
        registers: { Chaining: "Enabled", Direction: "Left to Right", Stream: "Active" },
      },
      {
        phaseTitle: "3. std::endl vs '\\n'",
        text: "std::endl inserts a newline AND forces an expensive flush. '\\n' is faster in loops.",
        subtext: "In high-performance C++, '\\n' is preferred for high-volume logging.",
        registers: { Char: "'\\n'", Flush: "Manual/Buffer", Performance: "High Speed ✓" },
      },
    ],
  },
  "cpp-comments": {
    title: "Compiler Tokenizer & Comment Filter",
    accent: "#0284c7",
    phases: [
      {
        phaseTitle: "1. Token Stream Ingestion",
        text: "Source Token Stream: Source code containing both executable statements and comments is read.",
        subtext: "Comments exist strictly for human programmers; the computer doesn't need them.",
        registers: { Stream: "// Developer Note\\nstd::cout...", Status: "Reading" },
      },
      {
        phaseTitle: "2. Comment Detection",
        text: "Lexical Filter: The compiler scanner identifies comment markers // and /* */.",
        subtext: "Everything following // until the end of the line is tagged as a comment.",
        registers: { Token: "COMMENT", Marker: "//", Action: "Bypass" },
      },
      {
        phaseTitle: "3. Clean Machine Code Emission",
        text: "Pruning & Compilation: Comments are stripped out completely. Only executable code is compiled!",
        subtext: "Comments have 0% impact on program size, speed, or runtime memory.",
        registers: { OutputSize: "Clean", Overhead: "0 Bytes", SpeedImpact: "0%" },
      },
    ],
  },
  "cpp-syntax-comments": {
    title: "Code Documentation & Comments",
    accent: "#0284c7",
    phases: [
      {
        phaseTitle: "1. Single-Line Comments //",
        text: "Double slashes // comment out the remainder of the line for notes or quick tests.",
        subtext: "Ideal for short explanations of non-obvious algorithms.",
        registers: { Type: "Single Line", Syntax: "// Note", Stripped: "At Compile Time" },
      },
      {
        phaseTitle: "2. Multi-Line Comments /* */",
        text: "/* ... */ spans across multiple lines for documentation headers.",
        subtext: "Cannot be nested inside other /* */ blocks.",
        registers: { Type: "Multi Line", Syntax: "/* ... */", Status: "Pruned" },
      },
      {
        phaseTitle: "3. Zero Overhead Guarantee",
        text: "Comments produce zero binary bytes in the final executable.",
        subtext: "Feel free to write detailed comments without worrying about performance!",
        registers: { BinarySize: "+0 bytes", RuntimeCost: "0 ns", Readability: "+100%" },
      },
    ],
  },
  "cpp-semicolon": {
    title: "Syntax Repair & Statement Terminator",
    accent: "#f59e0b",
    phases: [
      {
        phaseTitle: "1. Missing Terminator Detected",
        text: "Syntax Error: The compiler encounters std::cout << 'Ready' without a trailing semicolon (;).",
        subtext: "C++ statements require a semicolon (;) to mark where each instruction ends.",
        registers: { Error: "expected ';' before end of line", Line: 3, State: "Build Failed ✕" },
      },
      {
        phaseTitle: "2. Semicolon Placement",
        text: "Syntax Repair: A semicolon (;) is placed at the end of the statement: std::cout << 'Ready';",
        subtext: "Like a period at the end of a sentence in English, the semicolon closes the statement.",
        registers: { Terminator: ";", Status: "Statement Terminated" },
      },
      {
        phaseTitle: "3. Build Success!",
        text: "Successful Compilation: The compiler verifies statement boundaries and emits clean machine code!",
        subtext: "The golden rule of C++: almost every statement must end with a semicolon!",
        registers: { Build: "SUCCESS ✓", ExitCode: 0, Status: "Executable Created" },
      },
    ],
  },
  "cpp-syntax-statements": {
    title: "Statements & Expressions",
    accent: "#f59e0b",
    phases: [
      {
        phaseTitle: "1. Statement Terminator (;)",
        text: "In C++, whitespace and newlines are ignored by the compiler; the semicolon (;) defines statement bounds.",
        subtext: "This allows multi-line formatting without syntax ambiguity.",
        registers: { Delimiter: ";", Whitespace: "Ignored", Grammar: "Explicit" },
      },
      {
        phaseTitle: "2. Compound Statements { }",
        text: "Curly braces { } group multiple statements into a single block with its own scope.",
        subtext: "Variables declared inside { } are destroyed when leaving the block.",
        registers: { Block: "{ ... }", Scope: "Local", Lifetime: "Automatic" },
      },
      {
        phaseTitle: "3. Clean Execution Flow",
        text: "The compiler sequentially translates statements into a deterministic pipeline of machine instructions.",
        subtext: "Deterministic execution is the core foundation of C++ reliability.",
        registers: { Flow: "Deterministic", Sequence: "Linear", Status: "Verified ✓" },
      },
    ],
  },

  // Data Circuits
  "cpp-data-variables": {
    title: "Variables & Memory Allocation",
    accent: "#10b981",
    phases: [
      {
        phaseTitle: "1. Type Declaration",
        text: "Choosing a Type: int declares a 32-bit integer, allocating 4 contiguous bytes in physical RAM.",
        subtext: "C++ is strongly typed: every variable must declare its type at compile time.",
        registers: { Type: "int", Variable: "score", Bytes: "4 Bytes" },
      },
      {
        phaseTitle: "2. Hardware Address Assignment",
        text: "Memory Slot: Operating system allocates address 0x7FFF00 on the CPU stack frame.",
        subtext: "The address-of operator (&score) reveals this exact hardware RAM location.",
        registers: { Address: "0x7FFF00", Segment: "Stack", Scope: "Local" },
      },
      {
        phaseTitle: "3. Value Initialization",
        text: "Value Stored: Initial value 250 is written in binary into memory cell 0x7FFF00.",
        subtext: "Uninitialized variables contain garbage memory; always initialize your variables!",
        registers: { Value: 250, Binary: "00000000 00000000 00000000 11111010", Status: "Initialized ✓" },
      },
    ],
  },
  "cpp-data-numeric-types": {
    title: "Numeric Data Types & Precision",
    accent: "#06b6d4",
    phases: [
      {
        phaseTitle: "1. int (4 Bytes)",
        text: "32-bit signed integer storing whole numbers from -2,147,483,648 to +2,147,483,647.",
        subtext: "Optimal register size for modern 32-bit and 64-bit microprocessors.",
        registers: { Type: "int", Size: "4 Bytes", Range: "±2.1 Billion", Value: 1024 },
      },
      {
        phaseTitle: "2. float (4 Bytes) & double (8 Bytes)",
        text: "Floating-Point: double provides 64-bit IEEE 754 precision with 15-17 significant decimal digits.",
        subtext: "Always prefer double over float unless GPU or game memory bandwidth demands otherwise.",
        registers: { Type: "double", Size: "8 Bytes", Precision: "15-17 Digits", Value: 3.14159265 },
      },
      {
        phaseTitle: "3. char (1 Byte)",
        text: "8-bit byte storing ASCII characters or small integers from -128 to +127.",
        subtext: "Characters are enclosed in single quotes like 'A', mapped to ASCII code 65.",
        registers: { Type: "char", Size: "1 Byte", ASCII: 65, Glyph: "'A'" },
      },
    ],
  },
  "cpp-data-text": {
    title: "Text Representation (char & std::string)",
    accent: "#8b5cf6",
    phases: [
      {
        phaseTitle: "1. Primitive char (1 Byte)",
        text: "char stores a single ASCII symbol in 8 bits. 'A' is stored as binary 01000001 (65).",
        subtext: "Lightweight and instantaneous, but can only store one character.",
        registers: { Type: "char", Size: "1 Byte", Char: "'A'", ASCII: 65 },
      },
      {
        phaseTitle: "2. Modern std::string",
        text: "std::string dynamically manages sequences of characters on the heap or in local SSO buffer.",
        subtext: "Supports concatenation (+), length checks (.size()), and bounds access.",
        registers: { Type: "std::string", Length: 8, Value: "\"CodeLand\"", SSO: "Active" },
      },
      {
        phaseTitle: "3. Null Terminator '\\0'",
        text: "C-style string compatibility: characters are stored contiguously ending with a null byte '\\0'.",
        subtext: "The null terminator tells functions where the text ends.",
        registers: { EndMarker: "'\\0'", Contiguous: "Yes", Safe: "Managed by std::string" },
      },
    ],
  },
  "cpp-data-constants": {
    title: "Constants & Memory Protection",
    accent: "#f59e0b",
    phases: [
      {
        phaseTitle: "1. The const Keyword",
        text: "Declaring const int MAX_LEVEL = 99 marks the variable as strictly read-only.",
        subtext: "The compiler places it in protected memory or optimizes it into immediate machine code.",
        registers: { Keyword: "const", Identifier: "MAX_LEVEL", Value: 99 },
      },
      {
        phaseTitle: "2. Read-Only Protection Shield",
        text: "Compile-Time Guard: Any subsequent assignment (MAX_LEVEL = 100) triggers a compiler error.",
        subtext: "Prevents accidental bugs and allows aggressive compiler optimizations.",
        registers: { Mutability: "READ-ONLY", Shield: "Active 🔒", Security: "Hardware Locked" },
      },
      {
        phaseTitle: "3. Zero Runtime Overhead",
        text: "The compiler directly inlines the constant value 99 into CPU instruction registers.",
        subtext: "No memory lookup is required at runtime!",
        registers: { Optimization: "Immediate Constant", Register: "EAX = 99", Cost: "0 ns" },
      },
    ],
  },
  "cpp-data-operators": {
    title: "Arithmetic & Bitwise Operators",
    accent: "#3b82f6",
    phases: [
      {
        phaseTitle: "1. Arithmetic Engine (+, -, *, /, %)",
        text: "Hardware ALU executes basic mathematical operations in a single CPU clock cycle.",
        subtext: "Integer division (7 / 2) truncates to 3; modulo (7 % 2) yields the remainder 1.",
        registers: { Operation: "7 + 3", ALU: "ADD", Result: 10 },
      },
      {
        phaseTitle: "2. Compound Assignment (+=, -=, *=)",
        text: "x += 5 modifies x in-place without duplicating the variable evaluation.",
        subtext: "Equivalent to x = x + 5, translating to a direct ADD [memory], 5 instruction.",
        registers: { Operator: "+=", Target: "x", Delta: "+5", Updated: "15" },
      },
      {
        phaseTitle: "3. Pre vs Post Increment (++x vs x++)",
        text: "++x increments first then yields the new value; x++ yields the old value then increments.",
        subtext: "In C++, prefer ++x because it avoids temporary copies.",
        registers: { PreIncrement: "++x (Faster)", TemporaryCopy: "None", Register: "EAX" },
      },
    ],
  },
  "cpp-data-input": {
    title: "Console Input Stream (std::cin)",
    accent: "#a855f7",
    phases: [
      {
        phaseTitle: "1. Extraction Operator >>",
        text: "Keyboard Stream: std::cin >> score extracts typed characters from the standard input buffer.",
        subtext: "The >> arrows point rightward towards the variable receiving the data.",
        registers: { Stream: "std::cin", Operator: ">>", Target: "score" },
      },
      {
        phaseTitle: "2. Automatic Type Conversion",
        text: "Parsing: std::cin automatically parses string keystrokes '42' into binary integer 42.",
        subtext: "If you type a decimal into an int, only the integer portion is read.",
        registers: { RawInput: "\"42\"", ParsedType: "int", Value: 42 },
      },
      {
        phaseTitle: "3. Memory Slot Populated",
        text: "Destination Updated: Value 42 is stored in variable memory slot 0x7FFF00.",
        subtext: "The program halts and waits for user input before resuming execution.",
        registers: { Variable: "score", Value: 42, Status: "Ready for Computation ✓" },
      },
    ],
  },
  "cpp-data-conversion": {
    title: "Type Conversion & Static Cast",
    accent: "#ec4899",
    phases: [
      {
        phaseTitle: "1. Implicit Promotion",
        text: "Widening Conversion: Assigning an int (4 bytes) to a double (8 bytes) happens automatically without data loss.",
        subtext: "The compiler promotes the integer to a floating-point representation.",
        registers: { Source: "int (4B)", Target: "double (8B)", Loss: "0%" },
      },
      {
        phaseTitle: "2. Narrowing & Truncation Hazard",
        text: "Narrowing Conversion: Assigning double 3.99 to an int truncates the decimal part to 3 (NOT rounded to 4!).",
        subtext: "Always watch out for precision loss when converting floating points to integers.",
        registers: { Original: 3.99, Truncated: 3, DecimalLost: 0.99 },
      },
      {
        phaseTitle: "3. Explicit static_cast<type>",
        text: "Modern C++ Cast: static_cast<double>(score) explicitly tells the compiler and other developers your intent.",
        subtext: "Avoid dangerous C-style casts (double)x; prefer static_cast<type>(x).",
        registers: { Cast: "static_cast<double>", Safety: "Verified at Compile Time ✓" },
      },
    ],
  },

  // Logic Gates
  "cpp-logic-comparisons": {
    title: "Relational Comparison Operators",
    accent: "#10b981",
    phases: [
      {
        phaseTitle: "1. Relational Operators (==, !=, <, >)",
        text: "Evaluation: CPU compares two operands and returns a boolean value: true (1) or false (0).",
        subtext: "Caution: == is comparison, while = is assignment!",
        registers: { Comparison: "score == 100", Result: "true", Flag: "ZF = 1" },
      },
      {
        phaseTitle: "2. Numeric Equality & Precision",
        text: "Integer equality is exact; never compare doubles directly with == due to rounding epsilon.",
        subtext: "Use std::abs(a - b) < 1e-9 for floating-point comparisons.",
        registers: { Accuracy: "Exact (Integers)", CPU_ALU: "CMP", Latency: "1 Cycle" },
      },
      {
        phaseTitle: "3. Boolean Flag Emission",
        text: "Hardware Flag: The CPU ALU sets the Zero Flag (ZF) or Sign Flag (SF) to drive branch instructions.",
        subtext: "These flags determine which assembly jump instruction (JE, JNE, JL, JG) executes.",
        registers: { Flags: "ZF=1, CF=0", Branch: "Take True Fork ✓" },
      },
    ],
  },
  "cpp-logic-booleans": {
    title: "Boolean Data Type & Truth Tables",
    accent: "#06b6d4",
    phases: [
      {
        phaseTitle: "1. The bool Data Type",
        text: "Stores binary truth: exactly true or false, occupying 1 physical byte in memory.",
        subtext: "Even though 1 bit is needed, modern CPUs address memory in 1-byte minimum chunks.",
        registers: { Type: "bool", Size: "1 Byte", Value: "true (1)" },
      },
      {
        phaseTitle: "2. Truth Evaluation",
        text: "In C++, 0 evaluates to false, and any non-zero value evaluates to true.",
        subtext: "bool isAlive = (hp > 0); cleanly abstracts survival state.",
        registers: { Condition: "hp > 0", Boolean: "true", State: "Alive" },
      },
      {
        phaseTitle: "3. std::boolalpha Output",
        text: "Printing booleans outputs 1 or 0 by default. Use std::cout << std::boolalpha to print 'true' or 'false'.",
        subtext: "Makes console logs readable and human-friendly.",
        registers: { Stream: "std::boolalpha", Display: "\"true\" ✓" },
      },
    ],
  },
  "cpp-logic-if": {
    title: "Conditional Branching (if Statement)",
    accent: "#6366f1",
    phases: [
      {
        phaseTitle: "1. Condition Evaluation",
        text: "Evaluating if (score > 100): CPU evaluates the inner expression to true or false.",
        subtext: "If the expression evaluates to true, the block inside { ... } executes.",
        registers: { Condition: "score > 100", Value: "120 > 100", Result: "true" },
      },
      {
        phaseTitle: "2. Branch Gateway",
        text: "Execution Fork: The CPU instruction pointer jumps into the conditional block.",
        subtext: "If false, the entire block is bypassed in zero time via a hardware jump (JMP).",
        registers: { Branch: "ENTER_BLOCK", IP: "0x00401020", Status: "Executing" },
      },
      {
        phaseTitle: "3. Instruction Execution",
        text: "Statements inside { } execute sequentially and control continues after the block.",
        subtext: "All local variables created inside the if-block are destroyed when exiting.",
        registers: { Output: "\"Winner!\"", Exit: "0x00401050", Status: "Completed ✓" },
      },
    ],
  },
  "cpp-logic-if-else": {
    title: "Binary Decision Fork (if / else)",
    accent: "#8b5cf6",
    phases: [
      {
        phaseTitle: "1. Dual Pathway Architecture",
        text: "Guaranteed Single Path: Exactly one branch will execute; the other is completely bypassed.",
        subtext: "If condition is true, execute IF branch; otherwise, execute ELSE branch.",
        registers: { Paths: 2, Selected: "TRUE Branch", Alternative: "Bypassed" },
      },
      {
        phaseTitle: "2. Machine Jump Instruction",
        text: "Assembly Translation: CPU uses conditional jump (JNE). If true, it falls through; if false, it jumps to else label.",
        subtext: "Branch prediction hardware speculatively executes likely paths for maximum speed.",
        registers: { Assembly: "CMP, JNE else_label", Prediction: "Hit ✓" },
      },
      {
        phaseTitle: "3. Convergence Point",
        text: "Both paths converge after their respective blocks to resume normal program flow.",
        subtext: "Ensures clean stack frame maintenance and zero memory leaks.",
        registers: { State: "Converged", ProgramFlow: "Resumed ✓" },
      },
    ],
  },
  "cpp-logic-else-if": {
    title: "Multi-Branch Decision Cascade (else if)",
    accent: "#3b82f6",
    phases: [
      {
        phaseTitle: "1. Sequential Evaluation",
        text: "Cascade Ladder: Checks conditions top-to-bottom: if -> else if -> else.",
        subtext: "The moment ONE condition evaluates to true, all remaining branches are skipped!",
        registers: { Step: "Check if (grade >= 90)", Match: "False", Next: "else if (>= 80)" },
      },
      {
        phaseTitle: "2. Matching Branch Execution",
        text: "Match Found: The second branch evaluates to true. Its block executes immediately.",
        subtext: "Subsequent else if and else blocks are never evaluated.",
        registers: { ActiveBranch: "Grade B (>= 80)", Action: "Execute", Remaining: "Skipped" },
      },
      {
        phaseTitle: "3. Default Fallback (else)",
        text: "Safety Net: The final else catches any scenario where no preceding condition was met.",
        subtext: "Always include a fallback else to prevent unhandled edge cases.",
        registers: { Fallback: "Catch-All", Coverage: "100% of Cases Handled ✓" },
      },
    ],
  },
  "cpp-logic-operators": {
    title: "Logical Operators & Short-Circuiting",
    accent: "#06b6d4",
    phases: [
      {
        phaseTitle: "1. Logical AND (&&)",
        text: "Both must be true: (hasKey && doorUnlocked). If the first is false, the second is NEVER evaluated!",
        subtext: "Short-circuit evaluation prevents crashes like (ptr != nullptr && ptr->val > 0).",
        registers: { Operator: "&&", Left: "true", Right: "true", Combined: "true" },
      },
      {
        phaseTitle: "2. Logical OR (||)",
        text: "At least one true: (isAdmin || isOwner). If the first is true, the second is skipped!",
        subtext: "Short-circuiting saves CPU cycles on complex function calls.",
        registers: { Operator: "||", Left: "true", Right: "[Skipped]", Combined: "true" },
      },
      {
        phaseTitle: "3. Logical NOT (!)",
        text: "Inversion: !isGameOver inverts true to false, and false to true.",
        subtext: "Useful for toggling states and checking negative conditions.",
        registers: { Operator: "!", Input: "false", Inverted: "true ✓" },
      },
    ],
  },
  "cpp-logic-switch": {
    title: "Jump Table Router (switch / case)",
    accent: "#f59e0b",
    phases: [
      {
        phaseTitle: "1. Integral Key Matching",
        text: "switch(val) evaluates an integer or enum expression and jumps directly to the matching case.",
        subtext: "Much faster than 10 nested else-ifs because the compiler generates a direct Jump Table O(1)!",
        registers: { Key: "val", Value: 2, Target: "case 2:" },
      },
      {
        phaseTitle: "2. The Crucial break Statement",
        text: "break terminates the switch block. Omitting break causes fall-through into subsequent cases!",
        subtext: "Always write break unless intentional fall-through is desired.",
        registers: { Terminator: "break;", Action: "Exit switch", Fallthrough: "Prevented" },
      },
      {
        phaseTitle: "3. default Fallback",
        text: "If no case matches, execution routes to default:.",
        subtext: "Guarantees robust error handling for unexpected input values.",
        registers: { Default: "Handled", Route: "Direct Jump ✓" },
      },
    ],
  },
  "cpp-logic-loops": {
    title: "Iteration Engines (for & while Loops)",
    accent: "#10b981",
    phases: [
      {
        phaseTitle: "1. Loop Initialization",
        text: "for (int i = 0; i < 5; ++i): Loop counter 'i' is allocated in register with initial value 0.",
        subtext: "Initialization runs exactly once at the beginning.",
        registers: { Counter: "i", Value: 0, Limit: 5 },
      },
      {
        phaseTitle: "2. Condition Check & Body Execution",
        text: "Condition Test: Is i < 5? Yes (0 < 5 is true). The loop body executes.",
        subtext: "If condition were false, the loop would terminate immediately.",
        registers: { Test: "0 < 5", Condition: "true", Step: "Execute Body" },
      },
      {
        phaseTitle: "3. Counter Increment & Repeat",
        text: "Step: ++i increments i to 1. The condition is re-checked, repeating until i == 5.",
        subtext: "Loop completes 5 cycles with zero memory leaks!",
        registers: { Increment: "++i", NextValue: 1, Status: "Iterating ✓" },
      },
    ],
  },

  // Function Engine
  "cpp-functions-intro": {
    title: "Function Engine & Modular Architecture",
    accent: "#3b82f6",
    phases: [
      {
        phaseTitle: "1. Code Modularization",
        text: "Functions package reusable logic into callable units, preventing repetitive copy-paste code.",
        subtext: "Improves maintainability, testability, and compiler optimization opportunities.",
        registers: { Concept: "Subroutine", Reusability: "High", Overhead: "Zero (Inlineable)" },
      },
      {
        phaseTitle: "2. Call & Return Semantics",
        text: "When a function is called, the CPU pushes parameters and return address onto the call stack.",
        subtext: "On completion, control jumps back to the caller instruction pointer.",
        registers: { Call: "CALL printScore()", ReturnAddr: "0x00401045", Frame: "Pushed" },
      },
      {
        phaseTitle: "3. Stack Unwinding",
        text: "Stack Cleanup: Local variables inside the function are automatically freed in zero time.",
        subtext: "Guarantees clean memory management for every function call.",
        registers: { Stack: "Unwound", Registers: "Restored", Status: "Ready ✓" },
      },
    ],
  },
  "cpp-functions-create": {
    title: "Function Anatomy & Declaration",
    accent: "#6366f1",
    phases: [
      {
        phaseTitle: "1. Return Type",
        text: "Specifies what type of value the function sends back (e.g. void, int, double, bool).",
        subtext: "void means the function does not return any value.",
        registers: { ReturnType: "void", FunctionName: "greetUser", Parameters: "None" },
      },
      {
        phaseTitle: "2. Function Body { ... }",
        text: "Encapsulates instructions inside braces. Creates an isolated local scope for variables.",
        subtext: "Variables inside cannot be seen or corrupted by outside code.",
        registers: { Body: "{ ... }", Scope: "Local", Isolation: "100%" },
      },
      {
        phaseTitle: "3. Invocation",
        text: "Calling greetUser(); executes the function from main() and resumes seamlessly.",
        subtext: "Can be invoked thousands of times with negligible overhead.",
        registers: { Call: "greetUser()", Status: "Executed Successfully ✓" },
      },
    ],
  },
  "cpp-functions-parameters": {
    title: "Parameter Passing & Call Stack",
    accent: "#10b981",
    phases: [
      {
        phaseTitle: "1. Formal Parameters",
        text: "void showScore(int points): 'points' is a formal parameter waiting for an argument.",
        subtext: "Acts as a placeholder variable initialized when the function is called.",
        registers: { Parameter: "int points", Location: "Stack Frame", Addr: "0x7FFF20" },
      },
      {
        phaseTitle: "2. Argument Ingestion",
        text: "showScore(250): Value 250 is copied into the points memory slot.",
        subtext: "In x86_64 ABI, the first 4-6 parameters are passed directly in high-speed CPU registers!",
        registers: { Argument: 250, Register: "RDI / ECX", Speed: "Instantaneous" },
      },
      {
        phaseTitle: "3. Function Computation",
        text: "The function reads 'points' and executes its logic with the passed value.",
        subtext: "Cleanly decouples function logic from caller data.",
        registers: { Received: 250, Output: "Points: 250", Status: "Complete ✓" },
      },
    ],
  },
  "cpp-functions-multiple-parameters": {
    title: "Multi-Parameter Management",
    accent: "#06b6d4",
    phases: [
      {
        phaseTitle: "1. Parameter Ordering",
        text: "int add(int a, int b): Arguments are mapped strictly by position from left to right.",
        subtext: "add(10, 20) assigns a = 10 and b = 20.",
        registers: { Arg1: "a = 10", Arg2: "b = 20", Count: 2 },
      },
      {
        phaseTitle: "2. Calling Convention",
        text: "Registers RDI and RSI hold the arguments, avoiding slow RAM access entirely.",
        subtext: "Standard FastCall / System V AMD64 ABI convention.",
        registers: { RDI: 10, RSI: 20, MemoryLookup: "Bypassed" },
      },
      {
        phaseTitle: "3. Computation & Return",
        text: "ALU computes a + b = 30 and places result in RAX register.",
        subtext: "Caller retrieves the answer in zero CPU cycles.",
        registers: { Calculation: "10 + 20", RAX: 30, Result: "30 ✓" },
      },
    ],
  },
  "cpp-functions-return-values": {
    title: "Return Values & Register Transfer",
    accent: "#8b5cf6",
    phases: [
      {
        phaseTitle: "1. The return Keyword",
        text: "return result; immediately terminates the function and passes the value back to the caller.",
        subtext: "Any code placed after return in the same block is unreachable.",
        registers: { Keyword: "return", Value: 42, Target: "Caller" },
      },
      {
        phaseTitle: "2. CPU Register EAX / RAX",
        text: "Hardware Return: The return value is loaded into the primary accumulator register (RAX).",
        subtext: "Caller immediately reads RAX to store the result in its own variable.",
        registers: { Register: "RAX", Loaded: 42, Speed: "Zero Copy" },
      },
      {
        phaseTitle: "3. Assignment to Caller Variable",
        text: "int finalScore = calculate(); finalScore now holds 42 in its local memory slot.",
        subtext: "Allows expressive, functional composition of algorithms.",
        registers: { Target: "finalScore", Value: 42, Status: "Returned ✓" },
      },
    ],
  },
  "cpp-functions-scope": {
    title: "Variable Scope & Lifetime (RAII)",
    accent: "#f59e0b",
    phases: [
      {
        phaseTitle: "1. Local Scope Isolation",
        text: "Variables declared inside a function only exist while that function is executing.",
        subtext: "They are invisible to other functions, preventing accidental variable corruption.",
        registers: { Variable: "localVal", Scope: "Function Only", Lifetime: "Automatic" },
      },
      {
        phaseTitle: "2. Stack Frame Allocation",
        text: "Stack pointer RSP decrements to allocate local variable memory.",
        subtext: "Extremely fast: takes 1 CPU instruction.",
        registers: { StackPointer: "RSP - 16", Frame: "Active", Addr: "0x7FFF18" },
      },
      {
        phaseTitle: "3. Automatic Destruction",
        text: "When function finishes, RSP increments back. Local variables vanish instantly!",
        subtext: "RAII: Resource Acquisition Is Initialization guarantees zero memory leaks.",
        registers: { Cleanup: "Instantaneous", MemoryFreed: "16 Bytes", Status: "Destroyed ✓" },
      },
    ],
  },
  "cpp-functions-overloading": {
    title: "Function Overloading & Name Mangling",
    accent: "#ec4899",
    phases: [
      {
        phaseTitle: "1. Multiple Functions, Same Name",
        text: "You can define print(int x) and print(double x) in the same program.",
        subtext: "The compiler distinguishes them by their parameter count and types (signature).",
        registers: { Name: "print", Signatures: "int vs double", Conflict: "None" },
      },
      {
        phaseTitle: "2. Compiler Name Mangling",
        text: "Internally, the compiler renames them: _Z5printi (for int) and _Z5printd (for double).",
        subtext: "Enables type-safe linking at compile time with zero runtime penalty.",
        registers: { Symbol1: "_Z5printi", Symbol2: "_Z5printd", Stage: "Compile-Time" },
      },
      {
        phaseTitle: "3. Compile-Time Dispatch",
        text: "Calling print(3.14) directly links to the double version with 0 runtime branching.",
        subtext: "Static polymorphism at its finest!",
        registers: { Dispatched: "print(double)", Overhead: "0 ns", Result: "Optimal ✓" },
      },
    ],
  },

  // Array Matrix
  "cpp-arrays-intro": {
    title: "Contiguous Array Memory Block",
    accent: "#06b6d4",
    phases: [
      {
        phaseTitle: "1. Contiguous Allocation",
        text: "int arr[5] reserves 5 sequential integers (20 contiguous bytes) in RAM.",
        subtext: "Unlike linked lists, array elements sit directly next to each other in physical memory.",
        registers: { ElementCount: 5, Type: "int (4B)", TotalSize: "20 Bytes" },
      },
      {
        phaseTitle: "2. Memory Cache Friendliness",
        text: "Hardware Prefetching: Because elements are adjacent, the CPU preloads them into L1 cache.",
        subtext: "Arrays are the fastest data structure in computer science for sequential access.",
        registers: { CacheLine: "64 Bytes", CacheHit: "100%", Latency: "1-2 ns" },
      },
      {
        phaseTitle: "3. Base Memory Address",
        text: "The array name 'arr' decays into a pointer to the first element (&arr[0]).",
        subtext: "Base address is 0x1000; all other elements are computed relative to this base.",
        registers: { BaseAddress: "0x1000", "&arr[0]": "0x1000", Status: "Allocated ✓" },
      },
    ],
  },
  "cpp-arrays-indexing": {
    title: "Zero-Based Indexing & Address Arithmetic",
    accent: "#3b82f6",
    phases: [
      {
        phaseTitle: "1. Zero-Based Indexing",
        text: "Indices run from 0 to N-1: arr[0], arr[1], arr[2], arr[3], arr[4].",
        subtext: "The index represents the offset (distance) from the start of the array.",
        registers: { "arr[0]": 10, "arr[1]": 25, "arr[2]": 42, "arr[3]": 68, "arr[4]": 99 },
      },
      {
        phaseTitle: "2. Address Calculation Formula",
        text: "Address(arr[i]) = BaseAddress + (i * sizeof(type)).",
        subtext: "For arr[2]: 0x1000 + (2 * 4 bytes) = 0x1008. Computed in a single CPU cycle!",
        registers: { Formula: "0x1000 + 2*4", Address: "0x1008", Value: 42 },
      },
      {
        phaseTitle: "3. O(1) Constant Time Access",
        text: "Direct Hardware Jump: Accessing arr[0] or arr[999999] takes the exact same microsecond time.",
        subtext: "Zero scanning required: instant mathematical indexing.",
        registers: { Complexity: "O(1)", Latency: "1 Cycle", Status: "Instant Access ✓" },
      },
    ],
  },
  "cpp-arrays-loops": {
    title: "Array Traversal with Loops",
    accent: "#10b981",
    phases: [
      {
        phaseTitle: "1. Loop Index Pointer",
        text: "for (int i = 0; i < 5; ++i) traverses through every element sequentially.",
        subtext: "The loop variable i serves as both loop counter and array index.",
        registers: { Loop: "i = 0 to 4", CurrentIndex: "i", Element: "arr[i]" },
      },
      {
        phaseTitle: "2. Iterative Value Inspection",
        text: "The CPU reads each memory slot: arr[0]=10, arr[1]=25, arr[2]=42, arr[3]=68, arr[4]=99.",
        subtext: "High-speed SIMD vectorization can even process 4 to 8 elements simultaneously!",
        registers: { SIMD: "AVX2 Enabled", Bandwidth: "High Speed", Status: "Scanning" },
      },
      {
        phaseTitle: "3. Safe Termination",
        text: "Loop terminates when i reaches 5, never accessing invalid memory beyond bounds.",
        subtext: "Always ensure your loop boundary condition is strictly i < size.",
        registers: { FinalIndex: 4, Termination: "i == 5", MemorySafety: "Guaranteed ✓" },
      },
    ],
  },
  "cpp-arrays-range-loops": {
    title: "Range-Based for Loops (C++11)",
    accent: "#8b5cf6",
    phases: [
      {
        phaseTitle: "1. Clean Modern Syntax",
        text: "for (const auto& item : arr) eliminates index variables, off-by-one errors, and boilerplate.",
        subtext: "Introduced in C++11 to provide Python-like elegance with native C++ speed.",
        registers: { Syntax: "for (auto& item : arr)", OffByOneHazard: "Eliminated" },
      },
      {
        phaseTitle: "2. Reference Semantics (const auto&)",
        text: "Using & avoids expensive copying of array elements; 'const' guarantees read-only safety.",
        subtext: "Zero bytes copied, maximum performance.",
        registers: { Copy: "0 Bytes (Reference)", Safety: "const Protected", Overhead: "0 ns" },
      },
      {
        phaseTitle: "3. Direct Iterator Pipeline",
        text: "Under the hood, the compiler translates this to std::begin(arr) and std::end(arr) pointers.",
        subtext: "Pure compile-time sugar with zero runtime penalty.",
        registers: { Begin: "&arr[0]", End: "&arr[5]", Status: "Optimal Traversal ✓" },
      },
    ],
  },
  "cpp-arrays-strings": {
    title: "C-Strings vs std::string",
    accent: "#f59e0b",
    phases: [
      {
        phaseTitle: "1. C-Style Character Arrays (char str[])",
        text: "char name[] = 'CodeLand' stores characters in contiguous bytes ending with null byte '\\0'.",
        subtext: "Fixed size, manual memory management, susceptible to buffer overflows if mishandled.",
        registers: { Type: "char[]", Terminator: "'\\0'", BufferSize: "9 Bytes" },
      },
      {
        phaseTitle: "2. Buffer Overflow Vulnerability",
        text: "Writing beyond the array boundary corrupts adjacent memory slots in the stack!",
        subtext: "Never use unsafe C functions like gets() or strcpy(); use modern std::string.",
        registers: { Hazard: "Buffer Overflow", Security: "High Risk in C-Strings" },
      },
      {
        phaseTitle: "3. Modern std::string Upgrade",
        text: "std::string dynamically resizes, handles its own memory allocation, and protects memory safety.",
        subtext: "The golden standard for text manipulation in modern C++.",
        registers: { Type: "std::string", Safety: "100% Safe", Status: "Recommended ✓" },
      },
    ],
  },
  "cpp-arrays-multidimensional": {
    title: "Multidimensional Arrays (2D Matrices)",
    accent: "#06b6d4",
    phases: [
      {
        phaseTitle: "1. 2D Matrix Grid: int grid[3][3]",
        text: "Conceptual 2D table with 3 rows and 3 columns (9 total cells).",
        subtext: "Used extensively in game boards, image processing, and linear algebra.",
        registers: { Rows: 3, Columns: 3, TotalCells: 9, Type: "int" },
      },
      {
        phaseTitle: "2. Row-Major Memory Flattening",
        text: "Physical Reality: RAM is 1-dimensional! C++ stores row 0, followed by row 1, then row 2.",
        subtext: "Formula: Offset = (row * num_cols) + col. Hardware accesses it contiguously!",
        registers: { Layout: "Row-Major", OffsetCalc: "row * 3 + col", Cache: "Optimized" },
      },
      {
        phaseTitle: "3. Nested Loop Traversal",
        text: "Outer loop iterates rows, inner loop iterates columns: grid[row][col].",
        subtext: "Always iterate rows in outer loop and columns in inner loop for cache speed!",
        registers: { Access: "grid[r][c]", Performance: "Cache-Friendly ✓" },
      },
    ],
  },
  "cpp-arrays-aggregate": {
    title: "Array Aggregate Algorithms (Sum, Min, Max)",
    accent: "#ec4899",
    phases: [
      {
        phaseTitle: "1. Accumulator Pattern",
        text: "int sum = 0; Loop adds each element: sum += arr[i].",
        subtext: "The accumulator variable aggregates results across all array elements.",
        registers: { Accumulator: "sum", Initial: 0, Step: "+= arr[i]" },
      },
      {
        phaseTitle: "2. Extremum Search (Min / Max)",
        text: "Track highest value: if (arr[i] > maxVal) maxVal = arr[i];",
        subtext: "Always initialize maxVal with arr[0], never with an arbitrary number like 0!",
        registers: { MaxTracker: "maxVal", CurrentMax: 99, Comparer: ">" },
      },
      {
        phaseTitle: "3. Standard Algorithms (<numeric> & <algorithm>)",
        text: "Modern C++ provides std::accumulate and std::min_element to do this in one clean line.",
        subtext: "Leverages compiler optimizations and hardware vectorization.",
        registers: { STL: "std::accumulate", Result: "Calculated at Native Speed ✓" },
      },
    ],
  },

  // Memory Vault
  "cpp-memory-addresses": {
    title: "Physical RAM Architecture & Address Operator (&)",
    accent: "#06b6d4",
    phases: [
      {
        phaseTitle: "1. Hexadecimal Hardware Addressing",
        text: "Every single byte in computer RAM has a unique physical memory address in hexadecimal (e.g. 0x7FFF00).",
        subtext: "C++ allows you to inspect and interact directly with these hardware addresses.",
        registers: { Architecture: "64-bit Address Space", Format: "Hexadecimal (0x...)", BusWidth: "64 bits" },
      },
      {
        phaseTitle: "2. The Address-Of Operator (&)",
        text: "&score extracts the exact memory location where variable 'score' is stored in RAM.",
        subtext: "std::cout << &score prints the memory pointer address directly to console.",
        registers: { Operator: "&", Target: "score", MemoryLocation: "0x7FFF00" },
      },
      {
        phaseTitle: "3. Memory Alignment",
        text: "Types are aligned to memory boundaries: 4-byte ints start at addresses divisible by 4.",
        subtext: "Alignment enables the CPU memory controller to read data in a single memory bus cycle.",
        registers: { Alignment: "4-byte boundary", Efficiency: "Single Cycle Read ✓" },
      },
    ],
  },
  "cpp-memory-references": {
    title: "C++ References (&) - Memory Aliasing",
    accent: "#10b981",
    phases: [
      {
        phaseTitle: "1. What is a Reference?",
        text: "int& ref = score; creates an alias (another name) for an existing memory slot.",
        subtext: "A reference is NOT a new variable; it shares the exact same memory address as score!",
        registers: { Original: "score", Reference: "ref", SharedAddress: "0x7FFF00" },
      },
      {
        phaseTitle: "2. Zero Overhead Mutation",
        text: "Modifying ref = 50 immediately changes score to 50 with zero copying overhead.",
        subtext: "Under the hood, references are implemented as constant pointers with cleaner syntax.",
        registers: { Action: "ref = 50", Result: "score is now 50", MemoryCopies: 0 },
      },
      {
        phaseTitle: "3. Rules of References",
        text: "Must be initialized when declared; cannot be null; cannot be reseated to point to something else.",
        subtext: "Safer and cleaner than raw pointers for function parameter passing.",
        registers: { Nullable: "Never", Reseatable: "No", Safety: "High ✓" },
      },
    ],
  },
  "cpp-memory-pointers": {
    title: "Raw Pointers (Type* ptr)",
    accent: "#8b5cf6",
    phases: [
      {
        phaseTitle: "1. Pointer Declaration",
        text: "int* ptr = &score; declares a pointer variable that stores the memory address of score.",
        subtext: "On a 64-bit OS, all pointers occupy 8 bytes of memory regardless of data type.",
        registers: { Pointer: "ptr", HoldsAddress: "0x7FFF00", PointerSize: "8 Bytes" },
      },
      {
        phaseTitle: "2. Address Indirection",
        text: "Pointers act as laser guides pointing directly to other memory locations in RAM.",
        subtext: "Unlike references, pointers can change what they point to at runtime!",
        registers: { Source: "ptr", Target: "&score", IndirectionLevel: 1 },
      },
      {
        phaseTitle: "3. Flexibility & Power",
        text: "Pointers enable dynamic memory allocation, polymophic data structures, and hardware driver access.",
        subtext: "The defining super-power of C and C++ programming.",
        registers: { Capability: "Direct RAM Control", Status: "Active Laser Guide ✓" },
      },
    ],
  },
  "cpp-memory-dereference": {
    title: "Dereference Operator (*ptr)",
    accent: "#ec4899",
    phases: [
      {
        phaseTitle: "1. Following the Pointer (*ptr)",
        text: "Dereferencing *ptr accesses the value stored at the address ptr points to.",
        subtext: "If ptr holds 0x7FFF00, *ptr reads or writes the value inside 0x7FFF00.",
        registers: { Pointer: "ptr (0x7FFF00)", Dereference: "*ptr", ReadValue: 42 },
      },
      {
        phaseTitle: "2. Modifying Target Memory",
        text: "*ptr = 99 changes the target variable score to 99 remotely through the pointer!",
        subtext: "Direct memory modification across different functions and scopes.",
        registers: { Action: "*ptr = 99", TargetVal: "score = 99", Addr: "0x7FFF00" },
      },
      {
        phaseTitle: "3. The Asterisk Dual Meaning",
        text: "In declaration (int* p), * means 'is a pointer'. In expression (*p), * means 'dereference'.",
        subtext: "Keep this distinction clear to master C++ pointer mechanics.",
        registers: { Declaration: "int* (Type)", Expression: "*p (Dereference) ✓" },
      },
    ],
  },
  "cpp-memory-nullptr": {
    title: "Null Pointers & Safety (nullptr)",
    accent: "#f59e0b",
    phases: [
      {
        phaseTitle: "1. The Null Pointer Hazard",
        text: "Uninitialized pointers contain random garbage addresses. Dereferencing them causes a Segmentation Fault crash!",
        subtext: "Always initialize pointers to nullptr if they don't have a valid target yet.",
        registers: { Pointer: "int* ptr = nullptr", Address: "0x00000000", State: "Null" },
      },
      {
        phaseTitle: "2. Modern nullptr vs NULL",
        text: "C++11 nullptr is strongly typed (std::nullptr_t), avoiding ambiguity with integer 0 (NULL).",
        subtext: "Prevents subtle function overloading bugs where NULL was treated as integer 0.",
        registers: { Type: "std::nullptr_t", Safe: "Yes", C_NULL: "Deprecated" },
      },
      {
        phaseTitle: "3. Defensive Pointer Checking",
        text: "Always verify before dereferencing: if (ptr != nullptr) { *ptr = 10; }",
        subtext: "Guarantees 100% crash-free pointer interactions in production code.",
        registers: { Check: "ptr != nullptr", CrashPrevented: "Yes ✓" },
      },
    ],
  },
  "cpp-memory-stack-heap": {
    title: "Call Stack vs Free Store Heap",
    accent: "#3b82f6",
    phases: [
      {
        phaseTitle: "1. The Fast Call Stack",
        text: "Stack Memory: Extremely fast, LIFO structure, managed automatically by the CPU.",
        subtext: "Variables are allocated instantly and freed when their enclosing scope ends.",
        registers: { Segment: "Stack", Speed: "Sub-nanosecond", Management: "Automatic" },
      },
      {
        phaseTitle: "2. The Free Store (Heap)",
        text: "Heap Memory: Massive dynamic memory pool for large objects and data whose lifetime extends beyond functions.",
        subtext: "Requires explicit allocation and manual deallocation to avoid memory leaks.",
        registers: { Segment: "Heap", Capacity: "Gigabytes", Management: "Manual / RAII" },
      },
      {
        phaseTitle: "3. Architectural Tradeoffs",
        text: "Stack has limited size (typically 1-8 MB); Heap has access to all available system RAM.",
        subtext: "Stack overflow occurs if you put gigantic arrays on the stack; use the heap for big data.",
        registers: { StackLimit: "~8 MB", HeapLimit: "Physical RAM", Choice: "Balanced ✓" },
      },
    ],
  },
  "cpp-memory-dynamic": {
    title: "Dynamic Allocation (new & delete)",
    accent: "#10b981",
    phases: [
      {
        phaseTitle: "1. The new Operator",
        text: "int* p = new int(100); requests 4 bytes from the operating system heap and returns its address.",
        subtext: "The allocated memory persists even after the function returns!",
        registers: { Request: "new int(100)", HeapAddress: "0x008A2040", Value: 100 },
      },
      {
        phaseTitle: "2. The delete Operator",
        text: "delete p; releases the heap memory back to the operating system.",
        subtext: "Failure to call delete causes a memory leak that consumes RAM over time.",
        registers: { Command: "delete p", HeapStatus: "Freed", LeakPrevented: "Yes" },
      },
      {
        phaseTitle: "3. Dangling Pointer Neutralization",
        text: "After delete p, set p = nullptr immediately so it doesn't point to freed memory.",
        subtext: "Prevents dangerous 'use-after-free' security vulnerabilities.",
        registers: { Cleanup: "p = nullptr", Safety: "100% Protected ✓" },
      },
    ],
  },
  "cpp-memory-ownership": {
    title: "Memory Ownership & Smart Pointers Preview",
    accent: "#6366f1",
    phases: [
      {
        phaseTitle: "1. Memory Leaks & Double-Free",
        text: "Losing a pointer without calling delete creates an orphaned memory leak.",
        subtext: "Calling delete twice on the same pointer causes undefined behavior and crashes.",
        registers: { Risk1: "Memory Leak", Risk2: "Double Free", Solution: "RAII" },
      },
      {
        phaseTitle: "2. RAII Principle",
        text: "Resource Acquisition Is Initialization: bind heap memory to a stack object's lifetime.",
        subtext: "When the stack object destructs, its destructor automatically calls delete!",
        registers: { Principle: "RAII", Destructor: "Auto-Deletes", Leaks: "0%" },
      },
      {
        phaseTitle: "3. Modern Smart Pointers (std::unique_ptr)",
        text: "std::unique_ptr<int> auto-deletes when it goes out of scope with zero runtime overhead.",
        subtext: "Modern C++ guidelines: never use raw 'new' or 'delete'; use std::make_unique.",
        registers: { Modern: "std::unique_ptr", Overhead: "0 ns", Safety: "Guaranteed ✓" },
      },
    ],
  },

  // Object Forge (OOP)
  "cpp-oop-classes": {
    title: "OOP Class Blueprints & Instantiation",
    accent: "#06b6d4",
    phases: [
      {
        phaseTitle: "1. Class Blueprint Architecture",
        text: "A class defines a user-defined type bundling member variables (state) and member functions (behavior).",
        subtext: "Like an architectural blueprint from which real buildings (objects) are constructed.",
        registers: { Class: "Player", Attributes: "score, name", Methods: "play(), attack()" },
      },
      {
        phaseTitle: "2. Object Instantiation",
        text: "Player p1; instantiates a physical object in memory, allocating space for all its member variables.",
        subtext: "Each instance maintains its own distinct copy of member variables.",
        registers: { Instance: "p1", Addr: "0x7FFF30", MemorySize: "32 Bytes" },
      },
      {
        phaseTitle: "3. Dot Operator Member Access",
        text: "p1.score = 100; p1.play(); interacts directly with the instance's state and methods.",
        subtext: "Encapsulates complex logic into clean, intuitive object interfaces.",
        registers: { Access: "p1.score", Value: 100, Invocation: "p1.play() ✓" },
      },
    ],
  },
  "cpp-oop-members": {
    title: "Data Members & Methods",
    accent: "#3b82f6",
    phases: [
      {
        phaseTitle: "1. Data Members (State)",
        text: "Variables inside the class define the attributes of every object (e.g. int health, double speed).",
        subtext: "Stored contiguously inside each object's memory layout.",
        registers: { "int health": 100, "double speed": 5.5, Layout: "Contiguous" },
      },
      {
        phaseTitle: "2. Member Functions (Behavior)",
        text: "Functions inside the class manipulate the object's data members directly.",
        subtext: "They receive an implicit pointer to the current object called 'this'.",
        registers: { Method: "takeDamage(int dmg)", Target: "health -= dmg" },
      },
      {
        phaseTitle: "3. The 'this' Pointer",
        text: "Inside member functions, 'this' is a pointer holding the address of the invoking instance.",
        subtext: "Enables disambiguation between parameter names and member variables (this->health).",
        registers: { Pointer: "this", PointsTo: "&p1", Addr: "0x7FFF30 ✓" },
      },
    ],
  },
  "cpp-oop-constructors": {
    title: "Constructors & Member Initialization Lists",
    accent: "#10b981",
    phases: [
      {
        phaseTitle: "1. Automatic Initialization",
        text: "A constructor is a special function with the same name as the class and no return type.",
        subtext: "Called automatically when an object is instantiated to ensure valid initial state.",
        registers: { Constructor: "Player(string n)", Invoked: "Automatically", ReturnType: "None" },
      },
      {
        phaseTitle: "2. Member Initialization List",
        text: "Player(string n) : name(n), score(0) initializes members directly before constructor body runs.",
        subtext: "Significantly faster than assigning values inside { ... } because it avoids default initialization.",
        registers: { List: ": name(n), score(0)", Performance: "Direct Init", Copies: 0 },
      },
      {
        phaseTitle: "3. Default & Parameterized Constructors",
        text: "Classes can provide multiple overloaded constructors to support different initialization methods.",
        subtext: "Guarantees that no object is ever created in an uninitialized, broken state.",
        registers: { Overloads: "Default + Custom", ObjectState: "Valid from Birth ✓" },
      },
    ],
  },
  "cpp-oop-access": {
    title: "Access Specifiers (public vs private)",
    accent: "#8b5cf6",
    phases: [
      {
        phaseTitle: "1. private Members (Internal Hidden State)",
        text: "private members can only be accessed by code inside the class itself.",
        subtext: "External code (like main()) is strictly blocked from reading or writing private members.",
        registers: { Specifier: "private", Target: "int health", Accessibility: "Class Only" },
      },
      {
        phaseTitle: "2. public Members (Public Interface)",
        text: "public members define the outward-facing contract that outside code is permitted to call.",
        subtext: "Typically consists of methods that validate operations before modifying private state.",
        registers: { Specifier: "public", Target: "takeDamage(), getHealth()", Accessibility: "Universal" },
      },
      {
        phaseTitle: "3. protected Specifier",
        text: "protected members are accessible within the class and its derived (child) subclasses.",
        subtext: "Balances encapsulation with inheritance flexibility.",
        registers: { Specifier: "protected", Subclasses: "Permitted ✓" },
      },
    ],
  },
  "cpp-oop-encapsulation": {
    title: "Encapsulation, Getters & Setters",
    accent: "#f59e0b",
    phases: [
      {
        phaseTitle: "1. Data Hiding Principle",
        text: "Never make member variables public; keep them private and provide getters and setters.",
        subtext: "Prevents external code from setting illegal states like health = -999.",
        registers: { Principle: "Encapsulation", PrivateData: "int health", Protection: "Active" },
      },
      {
        phaseTitle: "2. Setter Validation Guard",
        text: "void setHealth(int h) { if (h >= 0) health = h; } intercepts and validates changes.",
        subtext: "Enforces business logic invariants at runtime.",
        registers: { Setter: "setHealth(h)", Invariant: "h >= 0", InvalidValues: "Blocked ✕" },
      },
      {
        phaseTitle: "3. Const Getters",
        text: "int getHealth() const { return health; } marked const guarantees it does not mutate the object.",
        subtext: "Enables calling getters on const object instances.",
        registers: { Getter: "getHealth() const", Mutation: "Forbidden", Safety: "100% ✓" },
      },
    ],
  },
  "cpp-oop-inheritance": {
    title: "Class Inheritance Hierarchy",
    accent: "#06b6d4",
    phases: [
      {
        phaseTitle: "1. Base Class (Parent)",
        text: "class Entity defines foundational attributes: int id, int x, int y, and void move().",
        subtext: "Common attributes are defined once in the base class to prevent code duplication.",
        registers: { BaseClass: "Entity", SharedAttributes: "id, x, y", Method: "move()" },
      },
      {
        phaseTitle: "2. Derived Class: class Player : public Entity",
        text: "Player inherits all public and protected members of Entity and adds its own: int score, void attack().",
        subtext: "'is-a' relationship: a Player IS AN Entity.",
        registers: { DerivedClass: "Player", Inherited: "id, x, y", Extended: "score, attack()" },
      },
      {
        phaseTitle: "3. Memory Layout of Inheritance",
        text: "The derived object contains the base class memory sub-object at offset 0, followed by new fields.",
        subtext: "Allows pointers of type Entity* to seamlessly point to Player instances with zero conversion cost!",
        registers: { SubObject: "Entity (Offset 0)", Extension: "Player (Offset +16)", Polymorphic: "Yes ✓" },
      },
    ],
  },
  "cpp-oop-polymorphism": {
    title: "Polymorphism & Virtual Functions (vtable)",
    accent: "#ec4899",
    phases: [
      {
        phaseTitle: "1. The virtual Keyword",
        text: "virtual void attack() enables dynamic dispatch: the derived class implementation executes even via base pointer!",
        subtext: "Without 'virtual', C++ defaults to static compile-time binding (faster, but non-polymorphic).",
        registers: { Keyword: "virtual", Binding: "Dynamic / Runtime", Flexibility: "Maximum" },
      },
      {
        phaseTitle: "2. Virtual Method Table (vtable)",
        text: "The compiler injects an invisible vptr into each object pointing to a table of function pointers (vtable).",
        subtext: "At runtime, the CPU looks up the exact derived function in the vtable in 1 indirection step.",
        registers: { Component: "vptr -> vtable", Lookup: "O(1) Table Jump", Indirections: 1 },
      },
      {
        phaseTitle: "3. Universal Collection Handling",
        text: "std::vector<Entity*> can hold Players, Monsters, and NPCs, invoking their unique attack() methods polymorphically.",
        subtext: "The foundation of game engines and extensible software architectures.",
        registers: { Pattern: "Entity* -> attack()", Dispatch: "Resolved at Runtime ✓" },
      },
    ],
  },
  "cpp-oop-composition": {
    title: "Composition ('Has-A') Architecture",
    accent: "#3b82f6",
    phases: [
      {
        phaseTitle: "1. 'Has-A' vs 'Is-A'",
        text: "Composition builds complex classes by embedding smaller component classes as members.",
        subtext: "A Car HAS AN Engine; a Player HAS AN Inventory. Preferred over deep inheritance hierarchies.",
        registers: { Pattern: "Composition", Relationship: "Has-A", Coupling: "Loose" },
      },
      {
        phaseTitle: "2. Component Encapsulation",
        text: "class Player contains Inventory inv; Engine eng;. Components are managed independently.",
        subtext: "Makes testing and swapping subsystems effortless.",
        registers: { Components: "Inventory, Engine", Reusability: "High" },
      },
      {
        phaseTitle: "3. Automatic Lifecycle Cascade",
        text: "When Player is destroyed, all embedded component objects are destructed automatically in reverse order.",
        subtext: "Zero manual cleanup required; pure RAII bliss.",
        registers: { Destruction: "Automatic Cascade", Leaks: "0% ✓" },
      },
    ],
  },
  "cpp-oop-design": {
    title: "Modern OOP Design Patterns & Clean Code",
    accent: "#10b981",
    phases: [
      {
        phaseTitle: "1. Single Responsibility Principle",
        text: "Each class should have one reason to change. Separate data models from rendering and networking.",
        subtext: "Keeps code modular, readable, and easy to refactor.",
        registers: { Principle: "SRP", Cohesion: "High", Coupling: "Low" },
      },
      {
        phaseTitle: "2. Interface Segregation",
        text: "Define pure abstract classes (interfaces) with '= 0' virtual functions to enforce contracts.",
        subtext: "virtual void update() = 0; forces derived classes to provide an implementation.",
        registers: { Interface: "Pure Virtual (= 0)", Contract: "Strictly Enforced" },
      },
      {
        phaseTitle: "3. Robust System Design",
        text: "Combining encapsulation, composition, and polymorphic interfaces yields rock-solid enterprise C++.",
        subtext: "Scales gracefully to millions of lines of code.",
        registers: { Architecture: "Robust & Extensible", Status: "Production Ready ✓" },
      },
    ],
  },

  // STL Command
  "cpp-stl-intro": {
    title: "Standard Template Library (STL) Overview",
    accent: "#06b6d4",
    phases: [
      {
        phaseTitle: "1. The Trinity of STL",
        text: "Containers (data storage) + Iterators (navigation bridges) + Algorithms (data processing).",
        subtext: "Generic programming paradigm: write once with templates, works with any data type!",
        registers: { Pillars: "Containers + Iterators + Algorithms", Generics: "Templates" },
      },
      {
        phaseTitle: "2. Header Inclusions (<vector>, <algorithm>)",
        text: "Standard headers provide industrial-grade data structures optimized by world-class compiler engineers.",
        subtext: "Never reinvent the wheel when the STL provides battle-tested implementations.",
        registers: { Headers: "<vector>, <map>, <algorithm>", Quality: "Industrial Grade" },
      },
      {
        phaseTitle: "3. Zero-Cost Abstraction",
        text: "STL templates compile down to raw pointers and assembly instructions identical to handcrafted C code.",
        subtext: "High-level expressive syntax with zero runtime performance penalty.",
        registers: { Overhead: "0 ns", Optimization: "Fully Inlined ✓" },
      },
    ],
  },
  "cpp-stl-vector": {
    title: "std::vector Dynamic Array & Capacity Doubling",
    accent: "#10b981",
    phases: [
      {
        phaseTitle: "1. Contiguous Dynamic Array",
        text: "std::vector<int> v stores elements contiguously on the heap while managing dynamic resizing.",
        subtext: "Supports O(1) random indexing like raw arrays, but grows automatically as items are added!",
        registers: { Container: "std::vector", Memory: "Heap Contiguous", Indexing: "O(1)" },
      },
      {
        phaseTitle: "2. push_back() & Capacity Doubling",
        text: "When size exceeds capacity, vector allocates a new buffer of 2x capacity and moves elements.",
        subtext: "Amortized O(1) insertion time: resizing happens exponentially less often as size increases.",
        registers: { Method: "push_back()", OldCap: 2, NewCap: 4, AmortizedCost: "O(1)" },
      },
      {
        phaseTitle: "3. size() vs capacity()",
        text: "size() is how many elements are currently stored; capacity() is how many slots are reserved.",
        subtext: "Use v.reserve(N) if you know the item count in advance to eliminate all reallocations!",
        registers: { "size()": 3, "capacity()": 4, Optimization: "reserve() Recommended ✓" },
      },
    ],
  },
  "cpp-stl-strings": {
    title: "std::string Dynamic Container & SSO",
    accent: "#8b5cf6",
    phases: [
      {
        phaseTitle: "1. Small String Optimization (SSO)",
        text: "Short strings (under 15-22 chars) are stored directly inside the stack object without allocating heap memory!",
        subtext: "Zero heap allocations for most common strings, giving enormous speedups.",
        registers: { Optimization: "SSO Active", Storage: "Stack Buffer", HeapAllocation: "None" },
      },
      {
        phaseTitle: "2. Rich Member Methods",
        text: "Provides .length(), .substr(), .find(), .replace(), and operator+ concatenation.",
        subtext: "No more risky manual null-terminator bookkeeping.",
        registers: { Methods: "substr, find, append", Safety: "Automatic Bounds Checked" },
      },
      {
        phaseTitle: "3. String Views (std::string_view)",
        text: "C++17 string_view provides non-owning read-only views of text with zero copying.",
        subtext: "Ideal for passing string parameters into high-speed functions.",
        registers: { Modern: "std::string_view", CopyCost: "0 Bytes", Status: "Optimal ✓" },
      },
    ],
  },
  "cpp-stl-map": {
    title: "std::map Associative Container (Red-Black Tree)",
    accent: "#06b6d4",
    phases: [
      {
        phaseTitle: "1. Key-Value Storage",
        text: "std::map<string, int> stores unique key-value pairs sorted automatically by key.",
        subtext: "Accessing inventory['health_potion'] returns the associated integer value.",
        registers: { Container: "std::map", KeyType: "string", ValueType: "int" },
      },
      {
        phaseTitle: "2. Self-Balancing Red-Black Binary Tree",
        text: "Under the hood, std::map is implemented as a balanced Red-Black Binary Search Tree.",
        subtext: "Search, insertion, and deletion all execute in guaranteed O(log N) logarithmic time.",
        registers: { Structure: "Red-Black Tree", SearchComplexity: "O(log N)", Sorted: "Always" },
      },
      {
        phaseTitle: "3. std::unordered_map Alternative",
        text: "Need O(1) average lookup? Use std::unordered_map which uses a Hash Table instead of a Tree!",
        subtext: "Choose std::map for sorted order; choose std::unordered_map for raw speed.",
        registers: { Alternative: "std::unordered_map", HashComplexity: "O(1) Avg ✓" },
      },
    ],
  },
  "cpp-stl-set": {
    title: "std::set Unique Sorted Collections",
    accent: "#f59e0b",
    phases: [
      {
        phaseTitle: "1. Unique Keys Only",
        text: "std::set<int> automatically rejects duplicate values upon insertion.",
        subtext: "If you insert 10, 20, 10, the set will only contain {10, 20}.",
        registers: { Container: "std::set", Uniqueness: "Enforced", Duplicates: "Rejected" },
      },
      {
        phaseTitle: "2. Sorted Invariant",
        text: "Elements are kept in strictly ascending order at all times.",
        subtext: "Traversing the set with an iterator yields items in sorted order automatically.",
        registers: { Invariant: "Sorted Ascending", Order: "Automatic", Time: "O(log N)" },
      },
      {
        phaseTitle: "3. Fast Membership Testing",
        text: "set.contains(x) or set.find(x) checks if an item exists in O(log N) time.",
        subtext: "Much faster than scanning an unsorted array O(N).",
        registers: { Method: "contains()", Speed: "O(log N) ✓" },
      },
    ],
  },
  "cpp-stl-stack-queue": {
    title: "Container Adapters (std::stack & std::queue)",
    accent: "#3b82f6",
    phases: [
      {
        phaseTitle: "1. std::stack (LIFO)",
        text: "Last-In, First-Out: push() onto top, pop() from top. Like a stack of plates.",
        subtext: "Essential for undo history, parsing parentheses, and depth-first search (DFS).",
        registers: { Adapter: "std::stack", Discipline: "LIFO", Top: "Active Element" },
      },
      {
        phaseTitle: "2. std::queue (FIFO)",
        text: "First-In, First-Out: push() onto back, pop() from front. Like a grocery checkout line.",
        subtext: "Essential for task scheduling, message queues, and breadth-first search (BFS).",
        registers: { Adapter: "std::queue", Discipline: "FIFO", Front: "Next to Serve" },
      },
      {
        phaseTitle: "3. Restricted Interface Safety",
        text: "Adapters intentionally restrict random access (no [i]) to enforce strict order safety.",
        subtext: "Guarantees algorithmic correctness by preventing illegal indexing.",
        registers: { Safety: "Enforced Discipline", BugsPrevented: "100% ✓" },
      },
    ],
  },
  "cpp-stl-iterators": {
    title: "Iterators: Generalized Pointers",
    accent: "#10b981",
    phases: [
      {
        phaseTitle: "1. The Iterator Concept",
        text: "An iterator is an object that behaves like a pointer, pointing to an element inside any container.",
        subtext: "Unifies access across vectors, lists, sets, and maps using identical syntax (*it, ++it).",
        registers: { Concept: "Iterator", Dereference: "*it", Advance: "++it" },
      },
      {
        phaseTitle: "2. begin() and end() Half-Open Range [begin, end)",
        text: "v.begin() points to the first element; v.end() points ONE PAST the last element.",
        subtext: "The half-open range idiom prevents off-by-one errors across the entire standard library.",
        registers: { "begin()": "&v[0]", "end()": "Past Last Element", Range: "[begin, end)" },
      },
      {
        phaseTitle: "3. Bridging Containers & Algorithms",
        text: "Iterators allow algorithms like std::sort(v.begin(), v.end()) to operate on any container.",
        subtext: "Pure decoupled generic architecture.",
        registers: { Decoupled: "Yes", Interoperability: "Universal ✓" },
      },
    ],
  },
  "cpp-stl-algorithms": {
    title: "Standard Algorithms (<algorithm> Header)",
    accent: "#ec4899",
    phases: [
      {
        phaseTitle: "1. Native std::sort",
        text: "std::sort(v.begin(), v.end()) runs Introsort (QuickSort + HeapSort + InsertionSort hybrid) in O(N log N).",
        subtext: "Blazingly fast, heavily optimized with branch prediction and SIMD.",
        registers: { Algorithm: "std::sort", Complexity: "O(N log N)", Implementation: "Introsort" },
      },
      {
        phaseTitle: "2. std::find & std::count",
        text: "std::find locates an element in O(N); std::binary_search finds in sorted data in O(log N).",
        subtext: "Expressive declarative code that is easier to read and maintain than raw loops.",
        registers: { Find: "std::find", BinarySearch: "O(log N)", Readability: "+100%" },
      },
      {
        phaseTitle: "3. Modern C++20 Ranges (<ranges>)",
        text: "std::ranges::sort(v); allows passing the container directly without explicit iterators!",
        subtext: "Supports composable pipeline views: v | std::views::filter(...) | std::views::transform(...).",
        registers: { Modern: "C++20 Ranges", Syntax: "Pipelined Views", Status: "State of the Art ✓" },
      },
    ],
  },

  // Final System
  "cpp-final-architecture": {
    title: "Complete C++ System Architecture",
    accent: "#06b6d4",
    phases: [
      {
        phaseTitle: "1. Subsystem Integration",
        text: "Linking CPU Execution Core, Memory Vault, Logic Gate Engine, and STL Container Matrix into a unified system.",
        subtext: "All 4 pillars operate in harmonious synchrony with zero runtime friction.",
        registers: { CPU: "Online", Memory: "Deterministic", STL: "Integrated", Logic: "Active" },
      },
      {
        phaseTitle: "2. End-to-End Execution Flow",
        text: "High-level source code compiles to native machine instructions, achieving microsecond-level predictability.",
        subtext: "Direct hardware control with zero garbage-collection pauses or virtual machine layers.",
        registers: { Latency: "< 1 µs", NativeSpeed: "100%", Architecture: "x86_64 Clean" },
      },
      {
        phaseTitle: "3. The C++ Master Developer",
        text: "You have mastered variables, control flow, functions, contiguous arrays, pointers, OOP, and the STL!",
        subtext: "Equipped to build game engines, high-performance distributed systems, and native software.",
        registers: { Level: "Master C++ Engineer", Status: "Core Primed & Certified ✓" },
      },
    ],
  },
  "cpp-final-system-build": {
    title: "Production Build & Compiler Optimization (-O3)",
    accent: "#10b981",
    phases: [
      {
        phaseTitle: "1. Multi-File Compilation & Build Systems",
        text: "Large systems split code into headers (.hpp) and translation units (.cpp), orchestrated by CMake.",
        subtext: "Headers declare interfaces; source files implement behavior; the linker combines them into one binary.",
        registers: { BuildSystem: "CMake / Ninja", Units: "Multi-File", Linker: "lld / ld" },
      },
      {
        phaseTitle: "2. Compiler Optimization Flags (-O2 / -O3)",
        text: "Flags -O3 enable loop unrolling, function inlining, SIMD vectorization, and dead-code elimination.",
        subtext: "Can speed up execution by 500% to 2000% compared to debug builds!",
        registers: { Flags: "-O3 -march=native -DNDEBUG", SIMD: "AVX2/AVX512", Speedup: "5x - 20x" },
      },
      {
        phaseTitle: "3. Deployed Binary Executable",
        text: "The final standalone binary is created, ready for deployment to servers, games, or embedded hardware.",
        subtext: "Maximum performance, minimum footprint, absolute control.",
        registers: { Binary: "SystemCore.exe", Status: "Deployed Successfully ✓" },
      },
    ],
  },

  default: {
    title: "C++ Memory & Variable Circuits",
    accent: "#06b6d4",
    phases: [
      {
        phaseTitle: "1. Variable Declaration & Memory Allocation",
        text: "RAM Allocation: Memory slots are reserved for variables based on their data types.",
        subtext: "int takes 4 bytes, double takes 8 bytes, and char takes 1 byte in physical memory.",
        registers: { "int score": "4 Bytes", "double energy": "8 Bytes", "char rank": "1 Byte" },
      },
      {
        phaseTitle: "2. Memory Addresses Assigned",
        text: "Hardware Addressing: Each variable receives a unique hardware memory address in RAM (e.g. 0x7FFF00).",
        subtext: "The address-of operator (&score) reveals the exact hardware memory location.",
        registers: { "&score": "0x7FFF00", "&energy": "0x7FFF04", "&rank": "0x7FFF0C" },
      },
      {
        phaseTitle: "3. Value Initialization",
        text: "Value Storage: Initial values are written into the memory cells in binary format.",
        subtext: "Variables can now be read and modified with instantaneous O(1) memory speed!",
        registers: { score: 250, energy: 87.5, rank: "'A'", Status: "Initialized" },
      },
    ],
  },
};

export default function CppLessonAnimation({ type = "cpp-intro", lesson }) {
  const resolvedType = type || lesson?.animation || lesson?.id || "cpp-variables";
  const meta =
    CPP_PHASES_DATA[resolvedType] ||
    CPP_PHASES_DATA[lesson?.id] ||
    CPP_PHASES_DATA[lesson?.animation] ||
    CPP_PHASES_DATA.default;
  const phases = meta.phases;
  const accent = meta.accent;

  const [currentPhase, setCurrentPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [cameraMode, setCameraMode] = useState("cinematic"); // 'cinematic' | 'orbit' | 'top'

  const containerRef = useRef(null);
  const phaseData = phases[currentPhase] || phases[0];

  // Reset when type changes
  useEffect(() => {
    setCurrentPhase(0);
    setIsPlaying(false);
  }, [type]);

  // Autoplay loop
  useEffect(() => {
    if (!isPlaying) return;
    const intervalTime = 2800 / speed;
    const timer = setInterval(() => {
      setCurrentPhase((prev) => {
        if (prev >= phases.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, phases.length, speed]);

  // GSAP animation triggered on phase change
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".cpp-beacon-active",
        { scale: 0.6, opacity: 0.3 },
        { scale: 1.3, opacity: 1, duration: 0.45, yoyo: true, repeat: 1, ease: "power2.out" }
      );

      gsap.fromTo(
        ".cpp-text-anim",
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }
      );

      gsap.fromTo(
        ".cpp-register-anim",
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, stagger: 0.05, ease: "back.out(2)" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [currentPhase, type]);

  const handleNext = () => {
    if (currentPhase < phases.length - 1) {
      setCurrentPhase((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPhase > 0) {
      setCurrentPhase((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentPhase(0);
  };

  const registers = phaseData.registers || {};

  return (
    <div className={styles.visualizerRoot} ref={containerRef}>
      {/* Header & Controls */}
      <div className={styles.visHeader}>
        <div className={styles.visHeaderLeft}>
          <div className={styles.visTag} style={{ borderColor: accent, color: accent }}>
            <Sparkles size={13} />
            <span>3D C++ RUNTIME ENGINE</span>
          </div>

          {/* Camera Mode Toggles */}
          <div className={styles.cameraModes}>
            <button
              type="button"
              className={`${styles.camBtn} ${cameraMode === "cinematic" ? styles.camBtnActive : ""}`}
              onClick={() => setCameraMode("cinematic")}
              title="Cinematic Director View"
            >
              <Camera size={13} />
              <span>Cinematic</span>
            </button>
            <button
              type="button"
              className={`${styles.camBtn} ${cameraMode === "orbit" ? styles.camBtnActive : ""}`}
              onClick={() => setCameraMode("orbit")}
              title="Free 3D Orbit View"
            >
              <Eye size={13} />
              <span>3D Orbit</span>
            </button>
            <button
              type="button"
              className={`${styles.camBtn} ${cameraMode === "top" ? styles.camBtnActive : ""}`}
              onClick={() => setCameraMode("top")}
              title="Top View"
            >
              <Layers size={13} />
              <span>Top View</span>
            </button>
          </div>
        </div>

        {/* Simulation Controls */}
        <div className={styles.visControls}>
          <button
            type="button"
            className={`${styles.btnControl} ${styles.btnPlay}`}
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? "Pause simulation" : "Simulate"}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? "Pause" : "Simulate"}</span>
          </button>

          <button
            type="button"
            className={styles.btnControl}
            onClick={handlePrev}
            disabled={currentPhase === 0}
            aria-label="Previous step"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            className={styles.btnControl}
            onClick={handleNext}
            disabled={currentPhase === phases.length - 1}
            aria-label="Next step"
          >
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            className={styles.btnControl}
            onClick={handleReset}
            aria-label="Reset simulation"
          >
            <RotateCcw size={14} />
          </button>

          {/* Speed Controls */}
          <div className={styles.speedSelector}>
            {[0.5, 1, 2, 4].map((s) => (
              <button
                key={s}
                type="button"
                className={`${styles.speedBtn} ${speed === s ? styles.speedBtnActive : ""}`}
                onClick={() => setSpeed(s)}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3D Canvas Stage */}
      <div className={styles.stageCanvas3D}>
        <Canvas
          dpr={[0.9, 1.5]}
          camera={{ position: [0, 3.8, 7.8], fov: 42, near: 0.1, far: 80 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <Suspense fallback={null}>
            <Cpp3DCameraRig
              type={resolvedType}
              currentPhase={currentPhase}
              cameraMode={cameraMode}
            />
            <Cpp3DStage type={resolvedType} phase={currentPhase} />
          </Suspense>
        </Canvas>

        {/* Floating In-Scene Orbit Guide Badge */}
        {cameraMode === "orbit" && (
          <div className={styles.orbitGuideBadge}>
            <Eye size={12} />
            <span>Click & Drag to rotate in 3D · Scroll to Zoom</span>
          </div>
        )}
      </div>

      {/* Timeline Scrubber */}
      <div className={styles.timelineScrubber}>
        <div className={styles.timelineTrack}>
          <div
            className={styles.timelineFill}
            style={{
              width: `${(currentPhase / Math.max(phases.length - 1, 1)) * 100}%`,
              background: `linear-gradient(90deg, #0284c7, ${accent})`,
            }}
          />
          {phases.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`${styles.timelineDot} ${idx <= currentPhase ? styles.timelineDotActive : ""}`}
              style={{ left: `${(idx / Math.max(phases.length - 1, 1)) * 100}%` }}
              onClick={() => setCurrentPhase(idx)}
              title={`Jump to Phase ${idx + 1}`}
            />
          ))}
        </div>
        <div className={styles.timelineLabel}>
          <span>Phase {currentPhase + 1} / {phases.length}</span>
        </div>
      </div>

      {/* Live Registers & Hardware Deck */}
      {Object.keys(registers).length > 0 && (
        <div className={styles.registerDeck}>
          <div className={styles.registerDeckHeader}>
            <Cpu size={13} color={accent} />
            <span>C++ RUNTIME & COMPILER REGISTERS</span>
          </div>
          <div className={styles.registerRow}>
            {Object.entries(registers).map(([key, value]) => (
              <div key={key} className={`${styles.registerBadge} cpp-register-anim`}>
                <span className={styles.registerKey}>{key}:</span>
                <span className={styles.registerVal} style={{ color: accent }}>
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step Narrative Box */}
      <div className={styles.narrativeBox} style={{ borderLeftColor: accent }}>
        <div
          className={`${styles.stepBeacon} cpp-beacon-active`}
          style={{ background: accent, boxShadow: `0 0 16px ${accent}` }}
        />
        <div className="cpp-text-anim" style={{ flex: 1, minWidth: 0 }}>
          <div className={styles.narrativeHeader}>
            <span className={styles.stepBadge} style={{ borderColor: accent, color: accent }}>
              STEP {currentPhase + 1} / {phases.length}
            </span>
            {phaseData.phaseTitle && (
              <span className={styles.phaseTitle}>
                {phaseData.phaseTitle.replace(/^\d+\.\s*/, "")}
              </span>
            )}
          </div>
          <p className={styles.narrativeText}>
            {phaseData.text || "Initializing C++ runtime..."}
          </p>
          {phaseData.subtext && (
            <div className={styles.insightCard}>
              <Sparkles size={15} className={styles.insightIcon} />
              <div className={styles.insightContent}>
                <strong>Core Insight:</strong> {phaseData.subtext}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
