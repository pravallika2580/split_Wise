/* Shared top-bar rendered on every page + cross-tab data sync bridge. */

const mountNav = (active) => {
  const header = document.createElement('header');
  header.className = 'topbar';
  header.innerHTML = `
    <div class="topbar-inner">
      <a class="brand" href="add-expense.html">
        <span class="brand-icon">💸</span>
        <span class="brand-text">Splitwise-ish</span>
      </a>
      <button class="nav-toggle" aria-label="Toggle menu">☰</button>
      <nav class="nav-menu">
        <ul>
          ${NAV_ITEMS.map(item => `
            <li>
              <a href="${item.href}" class="${active === item.key ? 'active' : ''}">
                <span class="nav-icon">${item.icon}</span>
                <span class="nav-label">${item.label}</span>
              </a>
            </li>
          `).join('')}
        </ul>
      </nav>
    </div>
  `;
  document.body.prepend(header);

  const toggle = header.querySelector('.nav-toggle');
  const menu   = header.querySelector('.nav-menu');
  toggle.addEventListener('click', () => menu.classList.toggle('open'));

  // Auto-close the mobile menu once the user follows a link.
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => menu.classList.remove('open'));
  });
};

// Forward cross-tab localStorage changes into the in-page event so pages
// only need to listen to one thing regardless of which tab did the write.
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) {
    window.dispatchEvent(new CustomEvent(EVENT_EXPENSES_UPDATED));
  }
});
