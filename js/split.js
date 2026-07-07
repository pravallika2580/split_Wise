/* Split Calculation page: renders every expense grouped by category with
 * per-person share and a "who owes whom" list. */

const initSplitPage = () => {
  const wrap    = document.getElementById('split-wrap');
  const totalEl = document.getElementById('overall-total');
  if (!wrap || !totalEl) return;

  const render = () => renderSplitPage(wrap, totalEl, loadExpenses());
  window.addEventListener(EVENT_EXPENSES_UPDATED, render);
  render();
};

const renderSplitPage = (wrap, totalEl, expenses) => {
  if (expenses.length === 0) {
    wrap.innerHTML = emptySplit();
    totalEl.textContent = formatMoney(0);
    return;
  }

  const grouped = groupByCategory(expenses);

  // Iterate CATEGORIES (not Object.keys) so cards render in the canonical
  // display order regardless of insertion order.
  let overall = 0;
  const html = CATEGORIES.map(category => {
    const list = grouped[category.name];
    if (!list || list.length === 0) return '';
    const catTotal = list.reduce((totalAmount, expense) => totalAmount + Number(expense.amount), 0);
    overall += catTotal;
    return categoryCard(category, list, catTotal);
  }).join('');

  wrap.innerHTML = html || `<div class="panel"><p class="empty">${MESSAGES.emptyNoMatch}</p></div>`;
  totalEl.textContent = formatMoney(overall);
};

const groupByCategory = (expenses) => {
  const grouped = {};
  expenses.forEach(expense => {
    (grouped[expense.category] ||= []).push(expense);
  });
  return grouped;
};

const categoryCard = (category, list, catTotal) => `
  <details class="category-card" open style="--cat-color:${category.color}">
    <summary>
      <span class="cat-title">
        <span class="cat-icon" style="background:${category.color}22">${category.icon}</span>
        ${category.name}
        <span class="count">(${list.length})</span>
      </span>
      <span class="cat-total">${formatMoney(catTotal)}</span>
    </summary>
    <div class="category-body">
      ${list.map(expense => expenseCard(category, expense)).join('')}
      <div class="cat-total-row">${category.name} Total <strong>${formatMoney(catTotal)}</strong></div>
    </div>
  </details>
`;

const expenseCard = (category, expense) => {
  const share = Number(expense.amount) / expense.sharedBy.length;
  const debts = expense.sharedBy
    .filter(member => member !== expense.paidBy)
    .map(member => `<li><strong>${escapeHtml(member)}</strong> → <strong>${escapeHtml(expense.paidBy)}</strong> : <span class="pay-amt">${formatMoney(share)}</span></li>`)
    .join('');

  return `
    <article class="expense-card" style="border-left-color:${category.color}">
      <h4>${escapeHtml(expense.name)}</h4>
      <dl class="expense-meta">
        <div><dt>Amount</dt><dd>${formatMoney(expense.amount)}</dd></div>
        <div><dt>Paid By</dt><dd>${escapeHtml(expense.paidBy)}</dd></div>
        <div><dt>Date</dt><dd>${formatDate(expense.date)}</dd></div>
      </dl>
      <div class="members-row">
        <span class="label">Members:</span>
        ${expense.sharedBy.map(member => `<span class="chip">${escapeHtml(member)}</span>`).join('')}
      </div>
      <div class="share-box" style="background:${category.color}15;color:${category.color}">
        <span>Share Per Person</span>
        <strong>${formatMoney(share)}</strong>
      </div>
      ${debts ? `
        <div class="owes-block">
          <h5>Who Owes Whom</h5>
          <ul>${debts}</ul>
        </div>
      ` : `<p class="muted small">${escapeHtml(expense.paidBy)} covered their own share — nobody owes anyone.</p>`}
    </article>
  `;
};

const emptySplit = () => `
  <div class="panel">
    <div class="empty-state">
      <span class="icon">🧮</span>
      <h3>${MESSAGES.emptyNoSplitsTitle}</h3>
      <p>${MESSAGES.emptyNoSplitsBody}</p>
      <a class="btn" href="add-expense.html">Add Expense</a>
    </div>
  </div>
`;

document.addEventListener('DOMContentLoaded', initSplitPage);
