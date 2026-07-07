/* Reports page: total-group summary, per-category and per-member breakdowns,
 * Chart.js pie + bar, plus category / member / date-range filters that drive
 * every card and chart on the page. */

const initReportsPage = () => {
  // Cache every element the page uses.
  const els = {
    total:        document.getElementById('total-group'),
    catGrid:      document.getElementById('category-grid'),
    memberGrid:   document.getElementById('member-grid'),
    catFilter:    document.getElementById('cat-filter'),
    memberFilter: document.getElementById('member-filter'),
    dateFrom:     document.getElementById('date-from'),
    dateTo:       document.getElementById('date-to'),
    resetBtn:     document.getElementById('reset-filters'),
    pieCanvas:    document.getElementById('pie-chart'),
    barCanvas:    document.getElementById('bar-chart')
  };
  if (!els.total || !els.catGrid) return;

  populateFilterOptions(els);

  // Chart.js instances survive across renders; we destroy + recreate on
  // every render so the canvas doesn't leak listeners.
  const chartRefs = { pie: null, bar: null };
  const render = () => renderReports(els, chartRefs);

  [els.catFilter, els.memberFilter, els.dateFrom, els.dateTo].forEach(inputElement =>
    inputElement.addEventListener('change', render));

  els.resetBtn.addEventListener('click', () => {
    els.catFilter.value    = '';
    els.memberFilter.value = '';
    els.dateFrom.value     = '';
    els.dateTo.value       = '';
    render();
  });

  window.addEventListener(EVENT_EXPENSES_UPDATED, render);
  render();
};

const populateFilterOptions = ({ catFilter, memberFilter }) => {
  CATEGORIES.forEach(categoryOption => {
    catFilter.insertAdjacentHTML('beforeend',
      `<option value="${categoryOption.name}">${categoryOption.icon} ${categoryOption.name}</option>`);
  });
  MEMBERS.forEach(member => {
    memberFilter.insertAdjacentHTML('beforeend', `<option value="${member}">${member}</option>`);
  });
};

// Keep only expenses that match every active filter.
const applyReportFilters = (list, { catFilter, memberFilter, dateFrom, dateTo }) =>
  list.filter(expense => {
    if (catFilter.value && expense.category !== catFilter.value) return false;
    // Member filter matches "involved in this expense" — either paid or shared.
    if (memberFilter.value && !(expense.paidBy === memberFilter.value
                              || expense.sharedBy.includes(memberFilter.value))) return false;
    if (dateFrom.value && expense.date < dateFrom.value) return false;
    if (dateTo.value   && expense.date > dateTo.value)   return false;
    return true;
  });

const renderReports = (els, chartRefs) => {
  const filtered = applyReportFilters(loadExpenses(), els);

  els.total.textContent = formatMoney(filtered.reduce((totalAmount, expense) => totalAmount + Number(expense.amount), 0));

  const catAgg    = aggregateByCategory(filtered);
  const memberAgg = aggregateByMember(filtered);

  els.catGrid.innerHTML    = CATEGORIES.map(c => categoryReportCard(c, catAgg[c.name])).join('');
  els.memberGrid.innerHTML = MEMBERS.map(m => memberReportCard(m, memberAgg[m])).join('');

  renderCharts(els, catAgg, memberAgg, chartRefs);
};

const aggregateByCategory = (list) => {
  const agg = Object.fromEntries(CATEGORIES.map(category => [category.name, { total: 0, count: 0 }]));
  list.forEach(expense => {
    if (!agg[expense.category]) agg[expense.category] = { total: 0, count: 0 };
    agg[expense.category].total += Number(expense.amount);
    agg[expense.category].count += 1;
  });
  return agg;
};

const aggregateByMember = (list) => {
  const agg = Object.fromEntries(MEMBERS.map(member => [member, { paid: 0, count: 0, share: 0 }]));
  list.forEach(expense => {
    agg[expense.paidBy].paid  += Number(expense.amount);
    agg[expense.paidBy].count += 1;
    const shareAmount = Number(expense.amount) / expense.sharedBy.length;
    expense.sharedBy.forEach(member => { agg[member].share += shareAmount; });
  });
  return agg;
};

const categoryReportCard = (category, { total, count }) => `
  <div class="report-card" style="--cat-color:${category.color}">
    <div class="card-head">
      <span class="cat-icon" style="background:${category.color}22">${category.icon}</span>
      <span class="card-title">${category.name}</span>
    </div>
    <div class="stat-row"><span>Total Expense</span><strong>${formatMoney(total)}</strong></div>
    <div class="stat-row"><span>Number of Expenses</span><strong>${count}</strong></div>
  </div>
`;

const memberReportCard = (member, stats) => `
  <div class="report-card member-card">
    <div class="card-head">
      <span class="avatar">${member[0]}</span>
      <span class="card-title">${member}</span>
    </div>
    <div class="stat-row"><span>Total Paid</span><strong>${formatMoney(stats.paid)}</strong></div>
    <div class="stat-row"><span>Expenses Paid</span><strong>${stats.count}</strong></div>
    <div class="stat-row"><span>Total Shared</span><strong>${formatMoney(stats.share)}</strong></div>
  </div>
`;

const renderCharts = ({ pieCanvas, barCanvas }, catAgg, memberAgg, chartRefs) => {
  // Skip charts entirely when Chart.js isn't loaded (CDN unreachable / offline).
  if (typeof Chart === 'undefined') return;

  const catLabels = CATEGORIES.map(category => category.name);
  const catData   = CATEGORIES.map(category => catAgg[category.name].total);
  const catColors = CATEGORIES.map(category => category.color);

  chartRefs.pie?.destroy();
  chartRefs.pie = new Chart(pieCanvas, {
    type: 'pie',
    data: {
      labels: catLabels,
      datasets: [{ data: catData, backgroundColor: catColors, borderWidth: 2, borderColor: '#fff' }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { padding: 12, font: { size: 12 } } },
        title:  { display: true, text: 'Expense by Category', font: { size: 14, weight: 'bold' } }
      }
    }
  });

  const barLabels = MEMBERS;
  const barData   = MEMBERS.map(m => memberAgg[m].paid);

  chartRefs.bar?.destroy();
  chartRefs.bar = new Chart(barCanvas, {
    type: 'bar',
    data: {
      labels: barLabels,
      datasets: [{
        label: 'Amount Paid (₹)',
        data: barData,
        backgroundColor: '#111827',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title:  { display: true, text: 'Amount Paid by Member', font: { size: 14, weight: 'bold' } }
      },
      scales: { y: { beginAtZero: true, ticks: { callback: (value) => '₹' + value } } }
    }
  });
};

document.addEventListener('DOMContentLoaded', initReportsPage);
