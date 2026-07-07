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
  const html = CATEGORIES.map(cat => {
    const list = grouped[cat.name];
    if (!list || list.length === 0) return '';
    const catTotal = list.reduce((s, e) => s + Number(e.amount), 0);
    overall += catTotal;
    return categoryCard(cat, list, catTotal);
  }).join('');

  wrap.innerHTML = html || `<div class="panel"><p class="empty">${MESSAGES.emptyNoMatch}</p></div>`;
  totalEl.textContent = formatMoney(overall);
};

const groupByCategory = (expenses) => {
  const grouped = {};
  expenses.forEach(e => {
    (grouped[e.category] ||= []).push(e);
  });
  return grouped;
};

const categoryCard = (cat, list, catTotal) => `
  <details class="category-card" open style="--cat-color:${cat.color}">
    <summary>
      <span class="cat-title">
        <span class="cat-icon" style="background:${cat.color}22">${cat.icon}</span>
        ${cat.name}
        <span class="count">(${list.length})</span>
      </span>
      <span class="cat-total">${formatMoney(catTotal)}</span>
    </summary>
    <div class="category-body">
      ${list.map(e => expenseCard(cat, e)).join('')}
      <div class="cat-total-row">${cat.name} Total <strong>${formatMoney(catTotal)}</strong></div>
    </div>
  </details>
`;

const expenseCard = (cat, e) => {
  const share = Number(e.amount) / e.sharedBy.length;
  const debts = e.sharedBy
    .filter(m => m !== e.paidBy)
    .map(m => `<li><strong>${escapeHtml(m)}</strong> → <strong>${escapeHtml(e.paidBy)}</strong> : <span class="pay-amt">${formatMoney(share)}</span></li>`)
    .join('');

  return `
    <article class="expense-card" style="border-left-color:${cat.color}">
      <h4>${escapeHtml(e.name)}</h4>
      <dl class="expense-meta">
        <div><dt>Amount</dt><dd>${formatMoney(e.amount)}</dd></div>
        <div><dt>Paid By</dt><dd>${escapeHtml(e.paidBy)}</dd></div>
        <div><dt>Date</dt><dd>${formatDate(e.date)}</dd></div>
      </dl>
      <div class="members-row">
        <span class="label">Members:</span>
        ${e.sharedBy.map(m => `<span class="chip">${escapeHtml(m)}</span>`).join('')}
      </div>
      <div class="share-box" style="background:${cat.color}15;color:${cat.color}">
        <span>Share Per Person</span>
        <strong>${formatMoney(share)}</strong>
      </div>
      ${debts ? `
        <div class="owes-block">
          <h5>Who Owes Whom</h5>
          <ul>${debts}</ul>
        </div>
      ` : `<p class="muted small">${escapeHtml(e.paidBy)} covered their own share — nobody owes anyone.</p>`}
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
