/* Small pure helpers used across the app: category lookups, number and
 * date formatting, HTML escaping, and URL query parsing. */

// Look up the full category record by name.  Falls back to the last entry
// (Others) if a category is missing so the UI never crashes on stray data.
const getCategoryInfo  = (name) =>
  CATEGORIES.find(c => c.name === name) || CATEGORIES[CATEGORIES.length - 1];

const getCategoryIcon  = (name) => getCategoryInfo(name).icon;
const getCategoryColor = (name) => getCategoryInfo(name).color;

// Money formatter using Indian numbering ("1,00,000") with the rupee prefix.
const formatMoney = (n) =>
  '₹' + Number(n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

// Human-friendly date ("6 Jul 2026") from an ISO YYYY-MM-DD string.
const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Today in YYYY-MM-DD, suitable for prefilling <input type="date">.
const todayISO = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Escape user-supplied strings before dropping them into innerHTML to
// prevent HTML/script injection from expense names or member labels.
const escapeHtml = (s) => String(s ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const getQueryParam = (key) => new URLSearchParams(window.location.search).get(key);
