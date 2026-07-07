/* Balance Summary page: net position per member + settled "who owes whom".
 * The two computations run in isolation and are the only truly interesting
 * bit of logic in the app. */

// Per-member paid/share/balance totals across every expense.
const computeBalances = (expenses) => {
  const paid  = Object.fromEntries(MEMBERS.map(m => [m, 0]));
  const share = Object.fromEntries(MEMBERS.map(m => [m, 0]));

  expenses.forEach(expense => {
    paid[expense.paidBy] += Number(expense.amount);
    const shareAmount = Number(expense.amount) / expense.sharedBy.length;
    expense.sharedBy.forEach(member => { share[member] += shareAmount; });
  });

  return MEMBERS.map(m => ({
    member:  m,
    paid:    paid[m],
    share:   share[m],
    balance: paid[m] - share[m]
  }));
};

// Settle debts pairwise: if A owes B ₹100 and B owes A ₹40, we display
// A → B ₹60 (the difference), never two separate lines that cancel out.
const computeDebts = (expenses) => {
  const owes = Object.fromEntries(
    MEMBERS.map(a => [a, Object.fromEntries(MEMBERS.map(b => [b, 0]))])
  );

  expenses.forEach(expense => {
    const shareAmount = Number(expense.amount) / expense.sharedBy.length;
    expense.sharedBy.forEach(member => {
      if (member !== expense.paidBy) owes[member][expense.paidBy] += shareAmount;
    });
  });

  const debts = [];
  for (let memberIndex = 0; memberIndex < MEMBERS.length; memberIndex++) {
    for (let otherMemberIndex = memberIndex + 1; otherMemberIndex < MEMBERS.length; otherMemberIndex++) {
      const firstMember = MEMBERS[memberIndex], secondMember = MEMBERS[otherMemberIndex];
      const diff = owes[firstMember][secondMember] - owes[secondMember][firstMember];
      if      (diff >  BALANCE_EPSILON) debts.push({ from: firstMember, to: secondMember, amount: diff });
      else if (diff < -BALANCE_EPSILON) debts.push({ from: secondMember, to: firstMember, amount: -diff });
    }
  }
  return debts;
};

const initBalancePage = () => {
  const balancesDiv = document.getElementById('balances');
  const debtsDiv    = document.getElementById('debts');
  if (!balancesDiv || !debtsDiv) return;

  const render = () => renderBalances(balancesDiv, debtsDiv, loadExpenses());
  window.addEventListener(EVENT_EXPENSES_UPDATED, render);
  render();
};

const renderBalances = (balancesDiv, debtsDiv, expenses) => {
  if (expenses.length === 0) {
    balancesDiv.innerHTML = emptyBalances();
    debtsDiv.innerHTML    = `<p class="empty">${MESSAGES.emptyNoDebts}</p>`;
    return;
  }

  balancesDiv.innerHTML = balanceTable(computeBalances(expenses));

  const debts = computeDebts(expenses);
  debtsDiv.innerHTML = debts.length === 0
    ? `<p class="empty">${MESSAGES.emptyAllSettled}</p>`
    : debtList(debts);
};

const balanceTable = (balances) => `
  <div class="table-scroll">
    <table class="data-table">
      <thead>
        <tr><th>Member</th><th>Total Paid</th><th>Total Share</th><th>Net Balance</th></tr>
      </thead>
      <tbody>${balances.map(balanceRow).join('')}</tbody>
    </table>
  </div>
`;

const balanceRow = (balance) => {
  let cls = 'muted', sign = '';
  if      (balance.balance >  BALANCE_EPSILON) { cls = 'positive'; sign = '+'; }
  else if (balance.balance < -BALANCE_EPSILON) { cls = 'negative'; sign = '-'; }
  return `
    <tr>
      <td data-label="Member">${escapeHtml(balance.member)}</td>
      <td data-label="Paid">${formatMoney(balance.paid)}</td>
      <td data-label="Share">${formatMoney(balance.share)}</td>
      <td data-label="Balance" class="${cls}">${sign}${formatMoney(Math.abs(balance.balance))}</td>
    </tr>
  `;
};

const debtList = (debts) => `
  <ul class="debt-list">
    ${debts.map(debt => `
      <li>
        <span class="debt-from">${escapeHtml(debt.from)}</span>
        <span class="arrow">→</span>
        <span class="debt-to">${escapeHtml(debt.to)}</span>
        <span class="debt-amount">${formatMoney(debt.amount)}</span>
      </li>
    `).join('')}
  </ul>
`;

const emptyBalances = () => `
  <div class="empty-state">
    <span class="icon">⚖️</span>
    <h3>${MESSAGES.emptyNoBalancesTitle}</h3>
    <p>${MESSAGES.emptyNoBalancesBody}</p>
    <a class="btn" href="add-expense.html">Add Expense</a>
  </div>
`;

document.addEventListener('DOMContentLoaded', initBalancePage);
