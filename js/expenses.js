/* Powers both the Add/Edit form (add-expense.html) and the Expenses table
 * (display-expenses.html).  Each init routine bails early if the page's
 * root element isn't present, so both routines can be loaded on both
 * pages without stepping on each other. */

/* ==================================================================== */
/*                        Add / Edit Expense form                       */
/* ==================================================================== */

const initAddExpensePage = () => {
  const form = document.getElementById('expense-form');
  if (!form) return;

  // Cache every field the form uses once; avoids repeated DOM queries on
  // every keystroke or submit.
  const els = {
    name:      document.getElementById('name'),
    amount:    document.getElementById('amount'),
    paidBy:    document.getElementById('paidBy'),
    category:  document.getElementById('category'),
    date:      document.getElementById('date'),
    members:   document.getElementById('members'),
    formTitle: document.getElementById('form-title'),
    submitBtn: document.getElementById('submit-btn'),
    sampleBtn: document.getElementById('sample-btn'),
    cancelBtn: document.getElementById('cancel-edit-btn'),
    resetBtn:  document.getElementById('reset-btn')
  };

  populateFormOptions(els);
  els.date.value = todayISO();

  // Edit mode is triggered by `?edit=<id>` in the URL; prefill the form.
  const editIdRaw = getQueryParam('edit');
  const editing = editIdRaw ? getExpenseById(Number(editIdRaw)) : null;
  if (editing) enterEditMode(els, editing);

  // Auto-tick the payer whenever the "Paid By" dropdown changes so the
  // validation rule "payer must be in sharedBy" is satisfied by default.
  els.paidBy.addEventListener('change', () => {
    const cb = els.members.querySelector(`input[value="${els.paidBy.value}"]`);
    if (cb) cb.checked = true;
    clearError('paidBy');
    clearError('shared');
  });

  // Clear per-field errors as the user types/edits the offending input.
  ['name', 'amount', 'category', 'date'].forEach(field => {
    document.getElementById(field).addEventListener('input', () => clearError(field));
  });
  els.members.addEventListener('change', () => clearError('shared'));

  form.addEventListener('submit', (event) => handleSubmit(event, els, editing));

  els.sampleBtn?.addEventListener('click', () => {
    showConfirmDialog(MESSAGES.confirmLoadSample, () => {
      loadSampleData();
      showToast(MESSAGES.toastAdded);
    });
  });

  els.cancelBtn?.addEventListener('click', () => {
    window.location.href = 'display-expenses.html';
  });

  els.resetBtn?.addEventListener('click', () => {
    // The reset event fires before the DOM values actually clear, so we
    // defer restoring the default date + wiping errors to the next tick.
    setTimeout(() => {
      els.date.value = todayISO();
      clearAllErrors();
    }, 0);
  });
};

// Fill Paid By, Category, and Members Shared from the constants.
const populateFormOptions = ({ paidBy, category, members }) => {
  MEMBERS.forEach(member => {
    paidBy.insertAdjacentHTML('beforeend', `<option value="${member}">${member}</option>`);
    members.insertAdjacentHTML('beforeend', `
      <label class="checkbox-chip">
        <input type="checkbox" name="shared" value="${member}"> ${member}
      </label>
    `);
  });

  CATEGORIES.forEach(categoryOption => {
    category.insertAdjacentHTML('beforeend',
      `<option value="${categoryOption.name}">${categoryOption.icon} ${categoryOption.name}</option>`);
  });
};

// Prefill the form with an existing expense and switch button labels.
const enterEditMode = (els, expense) => {
  els.formTitle.textContent = 'Edit Expense';
  els.submitBtn.textContent = 'Save Changes';
  els.name.value     = expense.name;
  els.amount.value   = expense.amount;
  els.paidBy.value   = expense.paidBy;
  els.category.value = expense.category;
  els.date.value     = expense.date;
  expense.sharedBy.forEach(member => {
    const checkbox = els.members.querySelector(`input[value="${member}"]`);
    if (checkbox) checkbox.checked = true;
  });
  els.cancelBtn.classList.remove('is-hidden');
  els.sampleBtn.classList.add('is-hidden');
};

// Validate, then either add or update depending on edit mode.
const handleSubmit = (event, els, editing) => {
  event.preventDefault();

  const payload = {
    name:     els.name.value.trim(),
    amount:   parseFloat(els.amount.value),
    paidBy:   els.paidBy.value,
    category: els.category.value,
    date:     els.date.value,
    sharedBy: [...document.querySelectorAll('input[name="shared"]:checked')]
                .map(checkbox => checkbox.value)
  };

  if (!validateExpense(payload)) return;

  if (editing) {
    updateExpense(editing.id, payload);
    window.location.href = 'display-expenses.html';
  } else {
    addExpense(payload);
    document.getElementById('expense-form').reset();
    els.date.value = todayISO();
    showToast(MESSAGES.toastAdded);
  }
};

// Run every validation rule.  Errors surface inline under each field.
// Returns true only if every rule passes.
const validateExpense = ({ name, amount, paidBy, category, date, sharedBy }) => {
  let ok = true;
  if (!name)                                { showError('name',     MESSAGES.errNameRequired);     ok = false; }
  if (!amount || amount <= 0)               { showError('amount',   MESSAGES.errAmountRequired);   ok = false; }
  if (!paidBy)                              { showError('paidBy',   MESSAGES.errPaidByRequired);   ok = false; }
  if (!category)                            { showError('category', MESSAGES.errCategoryRequired); ok = false; }
  if (!date)                                { showError('date',     MESSAGES.errDateRequired);     ok = false; }
  if (sharedBy.length === 0)                { showError('shared',   MESSAGES.errAtLeastOneMember); ok = false; }
  if (paidBy && !sharedBy.includes(paidBy)) { showError('shared',   MESSAGES.errPayerNotInShared); ok = false; }
  return ok;
};

/* ==================================================================== */
/*                         Display Expenses table                       */
/* ==================================================================== */

const initDisplayExpensesPage = () => {
  const tableWrap = document.getElementById('expenses-table');
  if (!tableWrap) return;

  const els = {
    search:    document.getElementById('search-input'),
    catFilter: document.getElementById('cat-filter'),
    sort:      document.getElementById('sort-select'),
    sampleBtn: document.getElementById('sample-btn'),
    clearBtn:  document.getElementById('clear-btn')
  };

  // Populate Category filter dropdown.
  CATEGORIES.forEach(categoryOption => {
    els.catFilter.insertAdjacentHTML('beforeend',
      `<option value="${categoryOption.name}">${categoryOption.icon} ${categoryOption.name}</option>`);
  });

  // Populate the Sort dropdown from the constant.
  els.sort.innerHTML = SORT_OPTIONS
    .map(option => `<option value="${option.value}">${option.label}</option>`).join('');
  els.sort.value = DEFAULT_SORT;

  const state = { q: '', cat: '', sort: DEFAULT_SORT };
  const render = () => renderExpensesTable(tableWrap, applyFilters(loadExpenses(), state));

  els.search   .addEventListener('input',  () => { state.q    = els.search.value.trim(); render(); });
  els.catFilter.addEventListener('change', () => { state.cat  = els.catFilter.value;     render(); });
  els.sort     .addEventListener('change', () => { state.sort = els.sort.value;          render(); });

  els.sampleBtn?.addEventListener('click', () => {
    showConfirmDialog(MESSAGES.confirmLoadSample, () => loadSampleData());
  });

  els.clearBtn?.addEventListener('click', () => {
    showConfirmDialog(MESSAGES.confirmClearAll, () => clearAllExpenses());
  });

  // Wire delete via event delegation so a single listener survives every
  // re-render of the table body.
  tableWrap.addEventListener('click', (clickEvent) => {
    const deleteButton = clickEvent.target.closest('.btn-delete');
    if (!deleteButton) return;
    showConfirmDialog(MESSAGES.confirmDeleteExpense, () => {
      deleteExpense(Number(deleteButton.dataset.id));
    });
  });

  window.addEventListener(EVENT_EXPENSES_UPDATED, render);
  render();
};

// Apply search, category, and sort filters to a list of expenses.
const applyFilters = (list, { q: searchQuery, cat: selectedCategory, sort }) => {
  let out = [...list];
  if (searchQuery) {
    out = out.filter(expense => (expense.paidBy || '').toLowerCase().includes(searchQuery.toLowerCase()));
  }
  if (selectedCategory) {
    out = out.filter(expense => expense.category === selectedCategory);
  }

  const comparators = {
    'date-desc':   (a, b) => (b.date || '').localeCompare(a.date || ''),
    'date-asc':    (a, b) => (a.date || '').localeCompare(b.date || ''),
    'amount-desc': (a, b) => Number(b.amount) - Number(a.amount),
    'amount-asc':  (a, b) => Number(a.amount) - Number(b.amount)
  };
  const cmp = comparators[sort];
  if (cmp) out.sort(cmp);
  return out;
};

const renderExpensesTable = (container, list) => {
  if (list.length === 0) {
    // Different empty state depending on whether the filters hid
    // everything or the dashboard is genuinely empty.
    container.innerHTML = loadExpenses().length > 0 ? emptyMatch() : emptyDashboard();
    return;
  }

  container.innerHTML = `
    <div class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>Expense</th><th>Amount</th><th>Paid By</th><th>Category</th>
            <th>Shared By</th><th>Split</th><th>Date</th><th></th>
          </tr>
        </thead>
        <tbody>${list.map(expenseRow).join('')}</tbody>
      </table>
    </div>
  `;
};

const expenseRow = (expense) => {
  const share = Number(expense.amount) / expense.sharedBy.length;
  const info = getCategoryInfo(expense.category);
  return `
    <tr>
      <td data-label="Expense">${escapeHtml(expense.name)}</td>
      <td data-label="Amount">${formatMoney(expense.amount)}</td>
      <td data-label="Paid By">${escapeHtml(expense.paidBy)}</td>
      <td data-label="Category">
        <span class="tag" style="background:${info.color}22;color:${info.color}">
          ${info.icon} ${info.name}
        </span>
      </td>
      <td data-label="Shared By">${expense.sharedBy.map(escapeHtml).join(', ')}</td>
      <td data-label="Split">${formatMoney(share)} each</td>
      <td data-label="Date">${formatDate(expense.date)}</td>
      <td data-label="Actions" class="actions-cell">
        <a class="btn-sm btn-edit" href="add-expense.html?edit=${expense.id}">Edit</a>
        <button class="btn-sm btn-delete" data-id="${expense.id}">Delete</button>
      </td>
    </tr>
  `;
};

const emptyDashboard = () => `
  <div class="empty-state">
    <span class="icon">🧾</span>
    <h3>${MESSAGES.emptyNoExpensesTitle}</h3>
    <p>${MESSAGES.emptyNoExpensesBody}</p>
    <a class="btn" href="add-expense.html">Add Expense</a>
  </div>
`;

const emptyMatch = () => `<p class="empty">${MESSAGES.emptyNoMatch}</p>`;

/* ==================================================================== */
/*                         Error + toast helpers                        */
/* ==================================================================== */

// Show an inline error under a form field.
const showError = (field, message) => {
  const errorElement = document.getElementById(`err-${field}`);
  if (errorElement) { errorElement.textContent = message; errorElement.hidden = false; }
};

const clearError = (field) => {
  const errorElement = document.getElementById(`err-${field}`);
  if (errorElement) { errorElement.textContent = ''; errorElement.hidden = true; }
};

const clearAllErrors = () =>
  document.querySelectorAll('.field-error').forEach(errorElement => { errorElement.textContent = ''; errorElement.hidden = true; });

// Create a reusable custom confirm dialog instead of the browser's default popup.
const showConfirmDialog = (message, onConfirm) => {
  let overlay = document.getElementById('custom-confirm-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'custom-confirm-overlay';
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <h3 id="confirm-title">Confirm action</h3>
        <p class="confirm-message"></p>
        <div class="confirm-actions">
          <button type="button" class="subtle confirm-cancel">Cancel</button>
          <button type="button" class="confirm-confirm">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  const messageEl = overlay.querySelector('.confirm-message');
  const cancelBtn = overlay.querySelector('.confirm-cancel');
  const confirmBtn = overlay.querySelector('.confirm-confirm');

  if (messageEl) messageEl.textContent = message;

  const close = () => {
    overlay.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    overlay.onclick = null;
    cancelBtn.onclick = null;
    confirmBtn.onclick = null;
    document.removeEventListener('keydown', handleKeydown);
  };

  const handleKeydown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      close();
      onConfirm?.();
    }
  };

  overlay.onclick = (event) => {
    if (event.target === overlay) close();
  };
  cancelBtn.onclick = () => close();
  confirmBtn.onclick = () => {
    close();
    onConfirm?.();
  };

  overlay.classList.add('is-open');
  document.body.classList.add('modal-open');
  document.addEventListener('keydown', handleKeydown);
};

// Create the toast element on first use and reuse it thereafter.
const showToast = (message) => {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), TOAST_DURATION_MS);
};

document.addEventListener('DOMContentLoaded', () => {
  initAddExpensePage();
  initDisplayExpensesPage();
});
