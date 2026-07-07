/* Read/write helpers for the expenses list persisted in localStorage.
 * Every mutating helper fires EVENT_EXPENSES_UPDATED so any open page can
 * re-render itself against the fresh list. */

const loadExpenses = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    // Corrupted JSON in storage should degrade to an empty list, not throw
    // and break the whole page.
    return [];
  }
};

const saveExpenses = (list) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVENT_EXPENSES_UPDATED));
};

const getExpenseById = (id) => loadExpenses().find(expense => expense.id === id) || null;

const addExpense = (expense) => {
  const list = loadExpenses();
  // Random tail on top of the timestamp keeps two expenses added in the
  // same millisecond from ending up with identical ids.
  const id = Date.now() + Math.floor(Math.random() * 1000);
  list.push({ id, ...expense });
  saveExpenses(list);
  return id;
};

const updateExpense = (id, updates) => {
  const list = loadExpenses().map(expense => expense.id === id ? { ...expense, ...updates } : expense);
  saveExpenses(list);
};

const deleteExpense = (id) => {
  const list = loadExpenses().filter(expense => expense.id !== id);
  saveExpenses(list);
};

const clearAllExpenses = () => saveExpenses([]);

// Seed the six sample expenses, timestamping each with today's date so the
// dashboard shows something the moment a fresh user clicks "Load Sample".
const loadSampleData = () => {
  const today = todayISO();
  const list = loadExpenses();
  SAMPLE_EXPENSES.forEach((sampleExpense, index) => {
    list.push({ id: Date.now() + index, ...sampleExpense, date: today });
  });
  saveExpenses(list);
};
