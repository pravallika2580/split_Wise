/* Shared constants for the app.
 * Every reusable string, id, number, or configuration value lives here so a
 * single edit tunes the app everywhere it's used. */

/* -------- Group -------- */

// Fixed group of five members the app tracks.
const MEMBERS = ["Hari", "Kavya", "Pravallika", "Mukesh", "Rahul"];

/* -------- Categories -------- */

// Each category carries a display icon and an accent color used by tags,
// cards, and chart segments across the app.
const CATEGORIES = [
  { name: "Food", icon: "🍕", color: "#f97316" },
  { name: "Travel", icon: "🚖", color: "#3b82f6" },
  { name: "Shopping", icon: "🛍️", color: "#ec4899" },
  { name: "Entertainment", icon: "🎬", color: "#8b5cf6" },
  { name: "Bills", icon: "💡", color: "#10b981" },
  { name: "Others", icon: "📦", color: "#6b7280" },
];

// Category names extracted from CATEGORIES, useful for filter dropdowns.
const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);

/* -------- Storage & events -------- */

// localStorage key under which the expenses list is persisted.
const STORAGE_KEY = "expenses";

// Custom in-page event fired after every write to the expenses list.
// Pages that render data listen for it and refresh themselves.
const EVENT_EXPENSES_UPDATED = "expenses-updated";

/* -------- User-facing messages -------- */

// Centralised copy so a wording tweak or translation touches one file.
const MESSAGES = {
  // form validation
  errNameRequired: "Expense name is required.",
  errAmountRequired: "Amount must be greater than zero.",
  errPaidByRequired: "Please select who paid.",
  errCategoryRequired: "Please select a category.",
  errDateRequired: "Please pick a date.",
  errAtLeastOneMember: "Select at least one member.",
  errPayerNotInShared: "The payer must also be one of the selected members.",

  // confirmations
  confirmDeleteExpense: "Delete this expense? This cannot be undone.",
  confirmClearAll: "Delete ALL expenses? This cannot be undone.",
  confirmLoadSample: "Load 6 sample expenses into your dashboard?",

  // toasts
  toastAdded: "Expense added successfully.",

  // empty states
  emptyNoExpensesTitle: "No expenses yet",
  emptyNoExpensesBody:
    "Add your first shared expense to start tracking who owes whom.",
  emptyNoMatch: "No expenses match your filters.",
  emptyNoSplitsTitle: "Nothing to split",
  emptyNoSplitsBody:
    "Add an expense first and it'll show up here grouped by category.",
  emptyNoBalancesTitle: "No balances yet",
  emptyNoBalancesBody: "Balances will appear once you add expenses.",
  emptyNoDebts: "No debts to settle.",
  emptyAllSettled: "Everyone is settled up.",
};

/* -------- Numeric configuration -------- */

// Auto-dismiss delay for toast notifications (milliseconds).
const TOAST_DURATION_MS = 2200;

// Tolerance for balance comparisons — amounts divided among an odd number
// of members can leave sub-cent residues that we treat as effectively zero.
const BALANCE_EPSILON = 0.005;

/* -------- Sort options (Display Expenses) -------- */

const SORT_OPTIONS = [
  { value: "date-desc", label: "Date (Newest first)" },
  { value: "date-asc", label: "Date (Oldest first)" },
  { value: "amount-desc", label: "Amount (High to Low)" },
  { value: "amount-asc", label: "Amount (Low to High)" },
];

const DEFAULT_SORT = "date-desc";

/* -------- Sample data -------- */

// Seeded when the user clicks "Load Sample Data" on an empty dashboard.
// Names match MEMBERS so downstream calculations line up correctly.
const SAMPLE_EXPENSES = [
  {
    name: "Pizza",
    amount: 900,
    paidBy: "Hari",
    category: "Food",
    sharedBy: ["Hari", "Kavya", "Pravallika"],
  },
  {
    name: "Biryani",
    amount: 1200,
    paidBy: "Kavya",
    category: "Food",
    sharedBy: ["Hari", "Kavya", "Pravallika", "Mukesh"],
  },
  {
    name: "Burger",
    amount: 500,
    paidBy: "Pravallika",
    category: "Food",
    sharedBy: ["Kavya", "Pravallika"],
  },
  {
    name: "Movie",
    amount: 600,
    paidBy: "Kavya",
    category: "Entertainment",
    sharedBy: ["Kavya", "Pravallika"],
  },
  {
    name: "Taxi",
    amount: 400,
    paidBy: "Mukesh",
    category: "Travel",
    sharedBy: ["Mukesh", "Rahul"],
  },
  {
    name: "Bus",
    amount: 300,
    paidBy: "Rahul",
    category: "Travel",
    sharedBy: ["Mukesh", "Rahul"],
  },
];

/* -------- Navigation -------- */

const NAV_ITEMS = [
  { key: "add", href: "add-expense.html", label: "Add Expense", icon: "➕" },
  {
    key: "display",
    href: "display-expenses.html",
    label: "Expenses",
    icon: "📋",
  },
  { key: "split", href: "split-calculation.html", label: "Split", icon: "🧮" },
  {
    key: "balance",
    href: "balance-summary.html",
    label: "Balances",
    icon: "⚖️",
  },
  { key: "reports", href: "reports.html", label: "Reports", icon: "📊" },
];
