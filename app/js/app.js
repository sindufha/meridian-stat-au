// Meridian entry router and global instant search controller.
// Keeps first load lean by lazily importing secondary views and datasets via literal import().

import { SEARCH_INDEX } from './data/overview.js';
import { escapeHtml } from './lib/format.js';
import { renderOverviewView } from './views/overview.js';

const mainEl = document.getElementById('main-content');
const navLinks = Array.from(document.querySelectorAll('#primary-nav a'));

function parseHashRoute() {
  const raw = (window.location.hash || '#/').replace(/^#/, '');
  const [pathPart, queryPart = ''] = raw.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  const params = new URLSearchParams(queryPart);
  return { section: segments[0] || 'overview', param: segments[1] || null, params };
}

function setActiveNav(routeKey) {
  navLinks.forEach((link) => {
    const active = link.dataset.route === routeKey;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

async function renderCurrentRoute() {
  const { section, param, params } = parseHashRoute();

  if (section === 'overview') {
    setActiveNav('overview');
    renderOverviewView(mainEl);
  } else if (section === 'indicators' || section === 'indicator') {
    setActiveNav('indicators');
    const mod = await import('./views/indicator.js');
    mod.renderIndicatorView(mainEl, param || 'cpi');
  } else if (section === 'regions') {
    setActiveNav('regions');
    const mod = await import('./views/regions.js');
    mod.renderRegionsView(mainEl, params.get('code') || 'NSW');
  } else if (section === 'demographics') {
    setActiveNav('demographics');
    const mod = await import('./views/demographics.js');
    mod.renderDemographicsView(mainEl);
  } else if (section === 'tools') {
    setActiveNav('tools');
    const mod = await import('./views/tools.js');
    mod.renderToolsView(mainEl);
  } else if (section === 'releases') {
    setActiveNav('releases');
    const mod = await import('./views/releases.js');
    mod.renderReleasesView(mainEl);
  } else {
    setActiveNav('overview');
    renderOverviewView(mainEl);
  }

  window.scrollTo({ top: 0, behavior: 'instant' });
}

function initGlobalSearch() {
  const input = document.getElementById('global-search');
  const box = document.getElementById('search-results');
  if (!input || !box) return;

  const updateResults = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      box.hidden = true;
      box.innerHTML = '';
      return;
    }
    const matches = SEARCH_INDEX.filter((item) =>
      `${item.title} ${item.meta} ${item.terms}`.toLowerCase().includes(q)
    ).slice(0, 8);

    if (!matches.length) {
      box.innerHTML = `<div class="search-item"><span class="search-item-meta">No matching indicators or jurisdictions for “${escapeHtml(q)}”.</span></div>`;
      box.hidden = false;
      return;
    }

    box.innerHTML = matches.map((m) => `
      <a class="search-item" role="option" href="${m.route}">
        <div>
          <div class="search-item-title">${escapeHtml(m.title)}</div>
          <div class="search-item-meta">${escapeHtml(m.meta)}</div>
        </div>
        <span class="search-item-val num">${escapeHtml(m.val)}</span>
      </a>
    `).join('');
    box.hidden = false;
  };

  input.addEventListener('input', updateResults);
  input.addEventListener('focus', updateResults);
  box.addEventListener('click', () => {
    box.hidden = true;
    input.value = '';
  });
  document.addEventListener('click', (evt) => {
    if (!evt.target.closest('#search-box')) box.hidden = true;
  });
  input.addEventListener('keydown', (evt) => {
    if (evt.key === 'Escape') {
      box.hidden = true;
      input.blur();
    } else if (evt.key === 'Enter') {
      const first = box.querySelector('a.search-item');
      if (first) {
        window.location.hash = first.getAttribute('href');
        box.hidden = true;
        input.value = '';
      }
    }
  });
}

window.addEventListener('hashchange', () => { renderCurrentRoute(); });
initGlobalSearch();
renderCurrentRoute();
