# JavaScript Concepts Explanation

A plain-language reference to every JavaScript concept used in this project.
For each concept you'll find: **what it is**, **why it's used**, **where it
appears in this project** (with file paths), a **short example**, and a
**beginner-friendly** paragraph.

---

## `const`

**What it is** — A way to declare a variable whose reference never changes
after it's first set.

**Why it's used** — It signals intent (this value shouldn't be reassigned)
and helps the JavaScript engine catch accidental overwrites.

**Where in this project** — Every module opens with `const` declarations
for its top-level helpers and constants. `js/constants.js` is entirely
`const` (`MEMBERS`, `CATEGORIES`, `MESSAGES`, `STORAGE_KEY`, and so on).

**Example (from `js/constants.js`)**
```js
const MEMBERS = ['Hari', 'Kavya', 'Pravallika', 'Mukesh', 'Rahul'];
```

**Beginner-friendly** — Think of `const` as sticking a label on a box.
You can still open the box and change what's inside (like adding an item
to an array), but you can't relabel the box to point at a different box.

---

## `let`

**What it is** — A way to declare a variable whose value is expected to
change over time.

**Why it's used** — When you actually need to reassign the variable (e.g.,
a running flag or a filtered list you keep replacing), `let` says so.

**Where in this project** — Loop counters and mutable flags. Used in
`js/balance.js` for the `for` loop counters, in `js/expenses.js`
inside `validateExpense` for the `ok` flag, and in `js/split.js` for the
running `overall` total.

**Example (from `js/expenses.js`)**
```js
let ok = true;
if (!name) { showError('name', MESSAGES.errNameRequired); ok = false; }
```

**Beginner-friendly** — `let` is a box you'll swap the contents of later.
Prefer `const` by default, reach for `let` only when you know you'll
reassign the variable.

---

## Arrow Functions

**What it is** — A shorter syntax for writing functions, using `=>`.

**Why it's used** — They're concise, and they don't have their own `this`,
which avoids a whole class of bugs in event handlers and array callbacks.

**Where in this project** — Almost every function in the project is an
arrow function. See `formatMoney` in `js/utils.js`, `mountNav` in
`js/app.js`, or every callback passed to `addEventListener`, `map`,
`filter`, and `forEach`.

**Example (from `js/utils.js`)**
```js
const formatMoney = (n) =>
  '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
```

**Beginner-friendly** — An arrow function is the compact way to say
"take these inputs, return this output." `(x) => x * 2` reads as
"given x, give me x times two."

---

## Template Literals

**What it is** — Strings wrapped in backticks (`` ` ``) that can embed
values with `${…}` and span multiple lines.

**Why it's used** — Much cleaner than glueing strings together with `+`.
Perfect for building HTML fragments.

**Where in this project** — Every place we build HTML strings for
`innerHTML`. See `mountNav` in `js/app.js`, `expenseRow` in
`js/expenses.js`, and `categoryCard` in `js/split.js`.

**Example (from `js/expenses.js`)**
```js
`<a class="btn-sm btn-edit" href="add-expense.html?edit=${e.id}">Edit</a>`
```

**Beginner-friendly** — A template literal is a string with holes in it.
The holes are filled with the values you put inside `${…}`. Like a
mail-merge letter with `${name}` replaced by "Kavya."

---

## Destructuring

**What it is** — Syntax that pulls values out of an object or array into
named variables in one line.

**Why it's used** — Turns `payload.name`, `payload.amount`, `payload.paidBy`,
… into a short one-liner.

**Where in this project** — `validateExpense` in `js/expenses.js` receives
its argument by destructuring, and `applyReportFilters` in `js/reports.js`
destructures the filter elements object.

**Example (from `js/expenses.js`)**
```js
const validateExpense = ({ name, amount, paidBy, category, date, sharedBy }) => {
  // Inside the function we can use `name`, `amount`, etc. directly.
};
```

**Beginner-friendly** — Destructuring is like opening a labelled box and
grabbing exactly the items you want by name, in one motion.

---

## Spread Operator (`...`)

**What it is** — Three dots used to "unpack" an array or object into
another one, or turn a `NodeList` into a real array.

**Why it's used** — To make copies without shared references, to add fields
to an existing object, and to turn `querySelectorAll` results into arrays
we can `.map` over.

**Where in this project** — `addExpense` in `js/storage.js` spreads the
expense payload into a new object with an `id`. `handleSubmit` in
`js/expenses.js` spreads a `NodeList` of checkboxes into an array.

**Example (from `js/storage.js`)**
```js
list.push({ id, ...expense });
```

**Example (from `js/expenses.js`)**
```js
sharedBy: [...document.querySelectorAll('input[name="shared"]:checked')]
             .map(el => el.value);
```

**Beginner-friendly** — Spread is a "pour it out" operator. Whatever was
in the container gets poured into the new one, item by item.

---

## Optional Chaining (`?.`)

**What it is** — A way to safely read a property that might not exist,
returning `undefined` instead of throwing an error.

**Why it's used** — Some elements only exist on certain pages
(`sample-btn`, `cancel-edit-btn`, `chartRefs.pie`). Optional chaining
lets us call a method on them only if they're actually there.

**Where in this project** — `initAddExpensePage` in `js/expenses.js` uses
it on the optional buttons. `renderCharts` in `js/reports.js` uses it to
destroy the previous chart instance only if one exists.

**Example (from `js/reports.js`)**
```js
chartRefs.pie?.destroy();
```

**Beginner-friendly** — Reading `a?.b?.c` is like walking down a hallway
carefully — if any door is closed, you stop instead of walking into a
wall.

---

## Nullish Coalescing (`??`)

**What it is** — An operator that returns its right-hand value only when
the left-hand value is `null` or `undefined`.

**Why it's used** — Provides a default without falling for `0` or `""`
being "falsy" the way `||` does.

**Where in this project** — `escapeHtml` in `js/utils.js` uses it to
coerce `null`/`undefined` to an empty string before running string
replacements.

**Example (from `js/utils.js`)**
```js
const escapeHtml = (s) => String(s ?? '')
  .replaceAll('&', '&amp;')
  // …
```

**Beginner-friendly** — `??` reads as "if this is missing, use that."
`age ?? 18` gives 18 only if `age` is `null` or `undefined`, not if it's
zero.

---

## Arrays

**What it is** — Ordered lists of values, written with square brackets.

**Why it's used** — The whole app revolves around an array of expenses.
Members, categories, sort options, and sample data are all arrays.

**Where in this project** — `MEMBERS`, `CATEGORIES`, `SORT_OPTIONS`, and
`SAMPLE_EXPENSES` in `js/constants.js`. The expenses list persisted in
localStorage is an array of expense objects.

**Example (from `js/constants.js`)**
```js
const MEMBERS = ['Hari', 'Kavya', 'Pravallika', 'Mukesh', 'Rahul'];
```

**Beginner-friendly** — An array is a line of numbered lockers. Locker
0 holds the first thing, locker 1 holds the second, and so on.

---

## Objects

**What it is** — A bundle of labelled values, written with curly braces.

**Why it's used** — Every expense is an object: it has a `name`, an
`amount`, a `paidBy`, and so on. Categories are objects because each one
carries a name, an icon, and a color.

**Where in this project** — Every expense stored, `MESSAGES` in
`js/constants.js`, `NAV_ITEMS`, chart configuration options.

**Example (from `js/storage.js`)**
```js
{
  id: 1720252831234,
  name: 'Pizza',
  amount: 900,
  paidBy: 'Hari',
  category: 'Food',
  sharedBy: ['Hari', 'Kavya', 'Pravallika'],
  date: '2026-07-07'
}
```

**Beginner-friendly** — An object is a labelled box of drawers. Each
drawer has a name (like `name`, `amount`) and holds one value. You open
a drawer with `expense.amount`.

---

## `map()`

**What it is** — An array method that runs a function on every item and
returns a new array of the results.

**Why it's used** — To transform one list into another list of the same
length — turn every member name into a `<li>` string, every expense into
a table row, every category into a chart segment.

**Where in this project** — Almost every rendering function. See
`categoryCard` in `js/split.js` (`list.map(e => expenseCard(cat, e))`) and
`computeBalances` in `js/balance.js` (`MEMBERS.map(m => ({ … }))`).

**Example (from `js/expenses.js`)**
```js
const rows = list.map(expenseRow).join('');
```

**Beginner-friendly** — `map` is a factory conveyor belt. Items come in,
each one gets transformed by the machine, transformed items come out. Same
number in as out.

---

## `filter()`

**What it is** — An array method that keeps only the items that pass a
test, returning a shorter (or equal-length) new array.

**Why it's used** — To trim the expenses list to just the ones matching
the current search / category / date filters.

**Where in this project** — `applyFilters` in `js/expenses.js`,
`applyReportFilters` in `js/reports.js`, and inside `expenseCard` in
`js/split.js` to keep only members who owe the payer.

**Example (from `js/split.js`)**
```js
const debts = e.sharedBy.filter(m => m !== e.paidBy);
```

**Beginner-friendly** — `filter` is a sieve. You dump items in, only the
ones that match your rule come through.

---

## `reduce()`

**What it is** — An array method that boils a list down to a single value
by carrying an accumulator across items.

**Why it's used** — For totals: total group expense, total per category,
total per member.

**Where in this project** — `renderSplitPage` in `js/split.js` uses it
to compute each category total. `renderReports` in `js/reports.js` uses
it for the total-group figure.

**Example (from `js/split.js`)**
```js
const catTotal = list.reduce((s, e) => s + Number(e.amount), 0);
```

**Beginner-friendly** — `reduce` is a running total. Start with `0`, add
each item's amount to it, end up with the final sum.

---

## `find()`

**What it is** — An array method that returns the first item matching a
test, or `undefined` if nothing matches.

**Why it's used** — To look up a category record by name, or an expense
by its id.

**Where in this project** — `getCategoryInfo` in `js/utils.js`,
`getExpenseById` in `js/storage.js`.

**Example (from `js/utils.js`)**
```js
const getCategoryInfo = (name) => CATEGORIES.find(c => c.name === name);
```

**Beginner-friendly** — `find` walks the list and stops at the first item
that matches. Perfect when you know at most one match exists.

---

## `forEach()`

**What it is** — An array method that runs a function on every item,
returning nothing.

**Why it's used** — When we're causing a side effect for each item (like
adding an `<option>` to a `<select>`, or bumping a running total), rather
than building a new list.

**Where in this project** — Populating dropdowns and checkboxes,
accumulating per-member totals in `computeBalances` (`js/balance.js`).

**Example (from `js/expenses.js`)**
```js
MEMBERS.forEach(m => {
  paidBy.insertAdjacentHTML('beforeend', `<option value="${m}">${m}</option>`);
});
```

**Beginner-friendly** — `forEach` is "do this for every item." No new
list, no return value — just perform the action.

---

## `Object.fromEntries()`

**What it is** — Turns a list of `[key, value]` pairs into an object.

**Why it's used** — To build a "starting-at-zero" totals object for every
member in one line, without a manual loop.

**Where in this project** — `computeBalances` and `computeDebts` in
`js/balance.js`; `aggregateByCategory` and `aggregateByMember` in
`js/reports.js`.

**Example (from `js/balance.js`)**
```js
const paid = Object.fromEntries(MEMBERS.map(m => [m, 0]));
// { Hari: 0, Kavya: 0, Pravallika: 0, Mukesh: 0, Rahul: 0 }
```

**Beginner-friendly** — Flip a list of little pairs into one big
labelled box. Each pair `[label, value]` becomes a drawer in the box.

---

## Event Listeners

**What it is** — Registering a function to run when a specific event
happens on a DOM element (click, submit, change, input, storage, …).

**Why it's used** — This is how the app reacts to the user. Clicks on
buttons, typing in inputs, changing dropdowns — all handled via listeners.

**Where in this project** — Every interactive page: submit on the form,
change on the filters, click on delete buttons, and the cross-tab
`storage` listener plus in-page `expenses-updated` listener that ties
saves and renders together.

**Example (from `js/app.js`)**
```js
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) {
    window.dispatchEvent(new CustomEvent(EVENT_EXPENSES_UPDATED));
  }
});
```

**Beginner-friendly** — An event listener is a doorbell. You wire it up
once. Whenever someone rings (that event happens), your function runs.

---

## DOM Manipulation

**What it is** — Reading from and writing to the live document tree the
browser paints on screen.

**Why it's used** — There's no framework. Every dropdown option, every
row of the expenses table, and every chart is built by directly
modifying the DOM.

**Where in this project** — `mountNav` builds the top bar with
`createElement` + `innerHTML`; `renderExpensesTable` swaps out the table
body's `innerHTML`; `populateFormOptions` uses `insertAdjacentHTML` to
append `<option>` and checkbox elements.

**Example (from `js/reports.js`)**
```js
els.catGrid.innerHTML = CATEGORIES
  .map(c => categoryReportCard(c, catAgg[c.name]))
  .join('');
```

**Beginner-friendly** — DOM manipulation is stage crew work: you're
rearranging the props on stage while the audience (the user) is watching.

---

## `try` / `catch`

**What it is** — Syntax for running code that might throw an error and
handling the error gracefully instead of crashing the whole page.

**Why it's used** — `JSON.parse` throws on malformed input. If the
expenses key in `localStorage` ever holds corrupt JSON, we want to
recover with an empty list rather than break every page.

**Where in this project** — `loadExpenses` in `js/storage.js`.

**Example (from `js/storage.js`)**
```js
const loadExpenses = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
```

**Beginner-friendly** — `try` says "attempt this." `catch` says "if
anything explodes, run this instead." Together they let the rest of the
app keep working even when one thing goes wrong.

---

## Functions

**What it is** — Reusable named blocks of code that take inputs and
usually return a result.

**Why it's used** — To break the app into small, single-purpose pieces
you can name and test. Every render step is its own function, every
computation is its own function.

**Where in this project** — Everywhere. `computeBalances` in
`js/balance.js`, `applyFilters` in `js/expenses.js`, `groupByCategory` in
`js/split.js`, and dozens more.

**Example (from `js/utils.js`)**
```js
const todayISO = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};
```

**Beginner-friendly** — A function is a recipe: give it ingredients
(arguments), it follows the steps, it hands you a dish (return value).
The same recipe can be reused with different ingredients.

---

## Loops (`for`)

**What it is** — The classic C-style loop that runs a block of code while
a condition is true.

**Why it's used** — When array methods like `map`/`filter` don't fit
cleanly. `computeDebts` in `js/balance.js` walks every pair of members
using two nested indexed loops — pairwise iteration reads more clearly as
a plain `for` than as a chained `map`.

**Where in this project** — Nested `for` loops in `computeDebts`
(`js/balance.js`).

**Example (from `js/balance.js`)**
```js
for (let i = 0; i < MEMBERS.length; i++) {
  for (let j = i + 1; j < MEMBERS.length; j++) {
    const a = MEMBERS[i], b = MEMBERS[j];
    // …compare owes[a][b] vs owes[b][a]…
  }
}
```

**Beginner-friendly** — A `for` loop is a checklist counter: start at 0,
tick each item off, stop when the counter hits the end.

---

## Concepts explicitly not used

These appear on the standard checklist but the project genuinely didn't
need them, so following the "don't force it" rule they were left out:

- **`some()` / `every()`** — no place where we needed a single yes/no
  answer across a whole list.
- **`Object.keys()`, `Object.values()`, `Object.entries()`** — where we
  looped over "one item per member/category," we already had the
  canonical `MEMBERS` / `CATEGORIES` arrays and iterated those.
- **Async / Await, Promises** — every operation in this app is
  synchronous: reads and writes go straight to `localStorage`, and Chart.js
  renders inline. There's no network work to await.
- **Rest operator (`...args`)** — no function needs to accept a variable
  number of trailing arguments.

If a future feature needs any of these (say, syncing to a backend), the
concept can be added where it genuinely fits.
