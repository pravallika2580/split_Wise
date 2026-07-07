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

  [els.catFilter, els.memberFilter, els.dateFrom, els.dateTo].forEach(el =>
    el.addEventListener('change', render));

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
  CATEGORIES.forEach(c => {
    catFilter.insertAdjacentHTML('beforeend',
      `<option value="${c.name}">${c.icon} ${c.name}</option>`);
  });
  MEMBERS.forEach(m => {
    memberFilter.insertAdjacentHTML('beforeend', `<option value="${m}">${m}</option>`);
  });
};

// Keep only expenses that match every active filter.
const applyReportFilters = (list, { catFilter, memberFilter, dateFrom, dateTo }) =>
  list.filter(e => {
    if (catFilter.value && e.category !== catFilter.value) return false;
    // Member filter matches "involved in this expense" — either paid or shared.
    if (memberFilter.value && !(e.paidBy === memberFilter.value
                              || e.sharedBy.includes(memberFilter.value))) return false;
    if (dateFrom.value && e.date < dateFrom.value) return false;
    if (dateTo.value   && e.date > dateTo.value)   return false;
    return true;
  });

const renderReports = (els, chartRefs) => {
  const filtered = applyReportFilters(loadExpenses(), els);

  els.total.textContent = formatMoney(filtered.reduce((s, e) => s + Number(e.amount), 0));

  const catAgg    = aggregateByCategory(filtered);
  const memberAgg = aggregateByMember(filtered);

  els.catGrid.innerHTML    = CATEGORIES.map(c => categoryReportCard(c, catAgg[c.name])).join('');
  els.memberGrid.innerHTML = MEMBERS.map(m => memberReportCard(m, memberAgg[m])).join('');

  renderCharts(els, catAgg, memberAgg, chartRefs);
};

const aggregateByCategory = (list) => {
  const agg = Object.fromEntries(CATEGORIES.map(c => [c.name, { total: 0, count: 0 }]));
  list.forEach(e => {
    if (!agg[e.category]) agg[e.category] = { total: 0, count: 0 };
    agg[e.category].total += Number(e.amount);
    agg[e.category].count += 1;
  });
  return agg;
};

const aggregateByMember = (list) => {
  const agg = Object.fromEntries(MEMBERS.map(m => [m, { paid: 0, count: 0, share: 0 }]));
  list.forEach(e => {
    agg[e.paidBy].paid  += Number(e.amount);
    agg[e.paidBy].count += 1;
    const s = Number(e.amount) / e.sharedBy.length;
    e.sharedBy.forEach(m => { agg[m].share += s; });
  });
  return agg;
};

const categoryReportCard = (c, { total, count }) => `
  <div class="report-card" style="--cat-color:${c.color}">
    <div class="card-head">
      <span class="cat-icon" style="background:${c.color}22">${c.icon}</span>
      <span class="card-title">${c.name}</span>
    </div>
    <div class="stat-row"><span>Total Expense</span><strong>${formatMoney(total)}</strong></div>
    <div class="stat-row"><span>Number of Expenses</span><strong>${count}</strong></div>
  </div>
`;

const memberReportCard = (m, a) => `
  <div class="report-card member-card">
    <div class="card-head">
      <span class="avatar">${m[0]}</span>
      <span class="card-title">${m}</span>
    </div>
    <div class="stat-row"><span>Total Paid</span><strong>${formatMoney(a.paid)}</strong></div>
    <div class="stat-row"><span>Expenses Paid</span><strong>${a.count}</strong></div>
    <div class="stat-row"><span>Total Shared</span><strong>${formatMoney(a.share)}</strong></div>
  </div>
`;

const renderCharts = ({ pieCanvas, barCanvas }, catAgg, memberAgg, chartRefs) => {
  // Skip charts entirely when Chart.js isn't loaded (CDN unreachable / offline).
  if (typeof Chart === 'undefined') return;

  const catLabels = CATEGORIES.map(c => c.name);
  const catData   = CATEGORIES.map(c => catAgg[c.name].total);
  const catColors = CATEGORIES.map(c => c.color);

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
      scales: { y: { beginAtZero: true, ticks: { callback: (v) => '₹' + v } } }
    }
  });
};

document.addEventListener('DOMContentLoaded', initReportsPage);
