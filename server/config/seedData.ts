import { Deck } from '../models/Deck.ts';
import { Card } from '../models/Card.ts';

export const SEED_DECKS = [
  {
    title: 'JavaScript Basics',
    description: 'Essential core concepts for frontend and full-stack technical interviews.',
    category: 'JavaScript',
    difficulty: 'Beginner' as const,
    isPublic: true,
    createdBy: null,
    cards: [
      {
        question: 'What is a closure in JavaScript, and why is it useful?',
        answer: 'A closure is the combination of a function bundled together with references to its surrounding lexical environment. It gives inner functions access to outer function variables even after the outer function has returned.',
        hint: 'Think about inner functions retaining access to outer scope variables.',
        explanation: 'Closures are foundational for data encapsulation, private variables, factory functions, and stateful function generators in JavaScript.',
        codeSnippet: 'function createCounter() {\n  let count = 0;\n  return () => ++count;\n}\nconst counter = createCounter();\ncounter(); // 1\ncounter(); // 2',
        difficulty: 'Medium' as const,
      },
      {
        question: 'What is the JavaScript Event Loop, and how does asynchronous code execute?',
        answer: 'The event loop continuously monitors the Call Stack and the Task Queue (Macro/Microtasks). When the call stack is empty, it pushes tasks from the Microtask queue (Promises) first, then Macrotasks (setTimeout, setInterval).',
        hint: 'Call Stack vs Microtask Queue vs Macrotask Queue.',
        explanation: 'JavaScript is single-threaded. Non-blocking asynchronous I/O is achieved by offloading operations to browser APIs or libuv in Node.js, queueing callbacks until the main stack clears.',
        codeSnippet: 'console.log("A");\nsetTimeout(() => console.log("B"), 0);\nPromise.resolve().then(() => console.log("C"));\nconsole.log("D");\n// Output: A -> D -> C -> B',
        difficulty: 'Hard' as const,
      },
      {
        question: 'What is the difference between "==" and "===" in JavaScript?',
        answer: '"==" is loose equality that performs implicit type coercion before comparing values, while "===" is strict equality that checks both value and type without coercion.',
        hint: 'One coerces types, the other compares type and value strictly.',
        explanation: 'Always prefer strict equality (===) to prevent unexpected type coercion bugs (e.g., 0 == "" is true, but 0 === "" is false).',
        codeSnippet: '0 == "";   // true (coerced)\n0 === "";  // false (different types)\nnull == undefined;  // true\nnull === undefined; // false',
        difficulty: 'Easy' as const,
      },
      {
        question: 'How do "var", "let", and "const" differ regarding scope and hoisting?',
        answer: '"var" is function-scoped and hoisted with an initial value of undefined. "let" and "const" are block-scoped ({}) and hoisted into a Temporal Dead Zone (TDZ) where accessing them before declaration throws a ReferenceError.',
        hint: 'Function scope vs block scope, and the Temporal Dead Zone (TDZ).',
        explanation: 'const also enforces that the identifier cannot be reassigned (though objects declared with const remain mutable unless frozen).',
        codeSnippet: 'console.log(a); // undefined\nvar a = 1;\n\nconsole.log(b); // ReferenceError: Cannot access "b" before initialization\nlet b = 2;',
        difficulty: 'Easy' as const,
      },
      {
        question: 'What is the difference between Array.prototype.map() and Array.prototype.forEach()?',
        answer: '"map()" transforms each element and returns a brand-new array of equal length without modifying the original. "forEach()" executes a callback for side effects and always returns undefined.',
        hint: 'Does it return a new array or undefined?',
        explanation: 'Use map() when you want to compute derived values or render UI elements. Use forEach() only when performing side effects like logging.',
        codeSnippet: 'const nums = [1, 2, 3];\nconst doubled = nums.map(x => x * 2); // [2, 4, 6]\nconst res = nums.forEach(x => console.log(x)); // undefined',
        difficulty: 'Easy' as const,
      },
    ],
  },
  {
    title: 'React Fundamentals',
    description: 'Component architecture, Hooks lifecycle, Virtual DOM, and state management.',
    category: 'React',
    difficulty: 'Intermediate' as const,
    isPublic: true,
    createdBy: null,
    cards: [
      {
        question: 'What is the Virtual DOM and how does React reconciliation work?',
        answer: 'The Virtual DOM is a lightweight in-memory JavaScript representation of the actual DOM. When state changes, React creates a new VDOM tree, diffs it against the previous tree using a heuristic algorithm, and computes the minimal set of real DOM updates.',
        hint: 'Lightweight in-memory tree and diffing algorithm.',
        explanation: 'Manipulating the real DOM directly is computationally expensive. Reconciliation ensures batching and minimal mutation of real DOM nodes.',
        codeSnippet: '// Conceptual:\n// Prev VDOM: <div><p>Count: 1</p></div>\n// Next VDOM: <div><p>Count: 2</p></div>\n// React updates only textContent of <p>',
        difficulty: 'Medium' as const,
      },
      {
        question: 'When should you pass an empty dependency array [] to useEffect vs omit it entirely?',
        answer: 'An empty dependency array [] runs the effect once after the component mounts and cleans up on unmount. Omitting the dependency array runs the effect after every single render cycle.',
        hint: 'Mount-only vs every-render.',
        explanation: 'Passing specific state/prop dependencies triggers the effect only when those values change between renders. Always clean up subscriptions/timers in the returned cleanup function.',
        codeSnippet: 'useEffect(() => {\n  const handler = () => console.log("resized");\n  window.addEventListener("resize", handler);\n  return () => window.removeEventListener("resize", handler);\n}, []); // runs once on mount',
        difficulty: 'Easy' as const,
      },
      {
        question: 'What is the difference between useMemo and useCallback?',
        answer: '"useMemo" memoizes the calculated result of a function execution, whereas "useCallback" memoizes the function definition itself to preserve reference equality across renders.',
        hint: 'Memoizing a computed value vs memoizing a function reference.',
        explanation: 'useCallback(fn, deps) is equivalent to useMemo(() => fn, deps). Both prevent expensive recalculations and unnecessary re-renders of memoized child components.',
        codeSnippet: 'const memoizedValue = useMemo(() => computeCostly(a, b), [a, b]);\nconst memoizedCallback = useCallback(() => doSomething(a), [a]);',
        difficulty: 'Medium' as const,
      },
      {
        question: 'Why must React keys in list rendering be unique and stable, and why avoid using array index?',
        answer: 'Keys identify which items in a list have changed, added, or removed during diffing. Using array indices can lead to incorrect state bindings and UI bugs when items are inserted, deleted, or reordered.',
        hint: 'Think about what happens when items are deleted or inserted at the beginning of the list.',
        explanation: 'Always use stable unique IDs (like database _id) so React can preserve component internal state accurately.',
        codeSnippet: '// Good:\n{items.map(item => <ItemRow key={item.id} data={item} />)}\n\n// Bad (breaks on reorder/delete):\n{items.map((item, idx) => <ItemRow key={idx} data={item} />)}',
        difficulty: 'Medium' as const,
      },
    ],
  },
  {
    title: 'SQL Basics',
    description: 'Relational data modeling, Joins, Indexing, and ACID transactions.',
    category: 'Databases',
    difficulty: 'Beginner' as const,
    isPublic: true,
    createdBy: null,
    cards: [
      {
        question: 'What is the difference between an INNER JOIN and a LEFT (OUTER) JOIN?',
        answer: 'INNER JOIN returns only rows where there is a match in both tables. LEFT JOIN returns all rows from the left table, plus matched rows from the right table (with NULLs for unmatched right-table columns).',
        hint: 'Matching rows only vs all rows from the first table.',
        explanation: 'Use INNER JOIN when data must exist on both sides (e.g. orders with valid customer IDs). Use LEFT JOIN when optional relationships exist (e.g. customers who may have 0 orders).',
        codeSnippet: 'SELECT users.name, orders.amount\nFROM users\nLEFT JOIN orders ON users.id = orders.user_id;',
        difficulty: 'Easy' as const,
      },
      {
        question: 'What do the ACID properties stand for in relational database management systems?',
        answer: 'Atomicity (all or nothing), Consistency (preserves schema constraints and invariants), Isolation (concurrent transactions execute without interference), and Durability (committed changes persist despite system crashes).',
        hint: 'A-C-I-D: All-or-nothing, Valid state, Independent, Crash-proof.',
        explanation: 'ACID guarantees reliability in mission-critical financial and transactional systems.',
        codeSnippet: 'BEGIN TRANSACTION;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT;',
        difficulty: 'Medium' as const,
      },
      {
        question: 'What is the difference between the WHERE clause and the HAVING clause?',
        answer: '"WHERE" filters individual rows before grouping occurs. "HAVING" filters aggregated groups after the GROUP BY clause has been evaluated.',
        hint: 'Row-level filtering before aggregation vs group-level filtering after aggregation.',
        explanation: 'You cannot use aggregate functions like COUNT() or AVG() inside a WHERE clause; they must be placed in HAVING.',
        codeSnippet: 'SELECT department, COUNT(*)\nFROM employees\nWHERE salary > 50000 -- row filter\nGROUP BY department\nHAVING COUNT(*) > 5; -- group filter',
        difficulty: 'Medium' as const,
      },
    ],
  },
  {
    title: 'HTML & CSS',
    description: 'Semantic markup, CSS Box Model, Flexbox, Grid, and responsive layout foundations.',
    category: 'Web Development',
    difficulty: 'Beginner' as const,
    isPublic: true,
    createdBy: null,
    cards: [
      {
        question: 'Explain the CSS Box Model components and the effect of "box-sizing: border-box".',
        answer: 'The box model consists of Content, Padding, Border, and Margin. With "content-box" (default), width only applies to content. With "border-box", width includes content, padding, and border, making responsive sizing much more predictable.',
        hint: 'Content + Padding + Border + Margin.',
        explanation: 'Modern CSS resets typically set "* { box-sizing: border-box; }" so that padding does not expand an element beyond its defined width.',
        codeSnippet: '*,\n*::before,\n*::after {\n  box-sizing: border-box;\n}',
        difficulty: 'Easy' as const,
      },
      {
        question: 'What is the difference between CSS Flexbox and CSS Grid layout models?',
        answer: 'Flexbox is one-dimensional (content-first, handles rows OR columns). CSS Grid is two-dimensional (layout-first, handles rows AND columns simultaneously).',
        hint: 'One-dimensional axis vs two-dimensional grid coordinate system.',
        explanation: 'Use Flexbox for component alignment, navbars, and linear flows. Use Grid for page structures, photo galleries, and multi-row complex dashboards.',
        codeSnippet: '/* Flex: 1D */\n.navbar { display: flex; justify-content: space-between; }\n\n/* Grid: 2D */\n.dashboard { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }',
        difficulty: 'Medium' as const,
      },
      {
        question: 'What is CSS Specificity and how does the browser resolve cascade conflicts?',
        answer: 'Specificity determines which CSS rule applies when multiple rules match the same element. It is calculated by counting: Inline styles (1000) > IDs (100) > Classes, attributes, and pseudo-classes (10) > Elements and pseudo-elements (1).',
        hint: 'Inline > ID > Class > Element.',
        explanation: '!important overrides normal specificity but should be used sparingly to avoid unmaintainable style sheets.',
        codeSnippet: '#nav .item {} /* 1 ID, 1 Class = 0,1,1,0 */\nul.menu li {} /* 1 Class, 2 Elements = 0,0,1,2 */\n/* #nav .item wins */',
        difficulty: 'Medium' as const,
      },
    ],
  },
  {
    title: 'Node.js Basics',
    description: 'Server runtime, asynchronous I/O, Event Emitter, Modules, and Streams.',
    category: 'Backend',
    difficulty: 'Intermediate' as const,
    isPublic: true,
    createdBy: null,
    cards: [
      {
        question: 'What is the Node.js Event Loop and what are its key phases in libuv?',
        answer: 'The event loop processes asynchronous operations across distinct phases: Timers (setTimeout/setInterval) -> Pending Callbacks -> Idle/Prepare -> Poll (I/O events) -> Check (setImmediate) -> Close Callbacks.',
        hint: 'libuv event loop phases: Timers, Poll, Check.',
        explanation: 'Between each phase, the microtask queue (process.nextTick and resolved Promises) is drained before advancing to the next phase.',
        codeSnippet: 'setTimeout(() => console.log("timeout"), 0);\nsetImmediate(() => console.log("immediate"));\nprocess.nextTick(() => console.log("nextTick"));\n// Output: nextTick -> timeout/immediate depending on invocation context',
        difficulty: 'Hard' as const,
      },
      {
        question: 'What are Node.js Streams and why are they preferable to fs.readFile for large files?',
        answer: 'Streams allow reading and writing data chunk-by-chunk without buffering the entire file into RAM at once. This keeps memory usage flat regardless of file size and enables piping directly to HTTP responses.',
        hint: 'Chunk-by-chunk processing vs reading entire file into memory.',
        explanation: 'fs.readFile loads the complete file into memory, causing out-of-memory crashes on multi-gigabyte files. Streams process data as chunks (typically 64KB).',
        codeSnippet: 'import fs from "fs";\nconst readStream = fs.createReadStream("bigfile.csv");\nreadStream.pipe(res); // Streams directly to client',
        difficulty: 'Medium' as const,
      },
      {
        question: 'What is the difference between CommonJS (require) and ES Modules (import)?',
        answer: 'CommonJS loads modules synchronously and evaluates at runtime. ES Modules (ESM) are statically analyzed and parsed at compile time, supporting asynchronous imports, tree-shaking, and top-level await.',
        hint: 'Synchronous runtime loading vs static compile-time loading.',
        explanation: 'Node.js supports ESM natively with "type": "module" in package.json or using the .mjs extension.',
        codeSnippet: '// CommonJS:\nconst path = require("path");\nmodule.exports = { ... };\n\n// ESM:\nimport path from "path";\nexport default { ... };',
        difficulty: 'Easy' as const,
      },
    ],
  },
];

export async function seedInitialDecks(): Promise<{ seeded: number; existing: number }> {
  let seededCount = 0;
  let existingCount = 0;

  for (const seed of SEED_DECKS) {
    const existingDeck = await Deck.findOne({ title: seed.title, createdBy: null });

    if (!existingDeck) {
      const newDeck = new Deck({
        title: seed.title,
        description: seed.description,
        category: seed.category,
        difficulty: seed.difficulty,
        isPublic: true,
        createdBy: null,
      });

      await newDeck.save();
      seededCount++;

      // Create cards for this seed deck
      for (const card of seed.cards) {
        await Card.create({
          deckId: newDeck._id,
          question: card.question,
          answer: card.answer,
          hint: card.hint,
          explanation: card.explanation,
          codeSnippet: card.codeSnippet,
          difficulty: card.difficulty,
        });
      }
    } else {
      existingCount++;
      // Check if cards exist for this deck; if not, populate them
      const cardCount = await Card.countDocuments({ deckId: existingDeck._id });
      if (cardCount === 0) {
        for (const card of seed.cards) {
          await Card.create({
            deckId: existingDeck._id,
            question: card.question,
            answer: card.answer,
            hint: card.hint,
            explanation: card.explanation,
            codeSnippet: card.codeSnippet,
            difficulty: card.difficulty,
          });
        }
      }
    }
  }

  return { seeded: seededCount, existing: existingCount };
}
