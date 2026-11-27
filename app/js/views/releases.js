// Renders Official Statistical Release Calendar, Methodology Glossary, and Full Data Export (#/releases).

import { INDICATORS } from '../data/indicators.js';
import { REGIONS } from '../data/regions.js';
import { GLOSSARY_TERMS, RELEASE_CALENDAR } from '../data/releases.js';
import { escapeHtml, triggerFileDownload } from '../lib/format.js';

const relState = {
  domain: 'All',
};

export function renderReleasesView(root) {
  const domains = ['All', 'Economy', 'Prices', 'Labour', 'Demographics', 'Housing', 'Energy & Trade'];

  root.innerHTML = `
    <section class="page-hero">
      <div>
        <div class="page-kicker">Governance &amp; Provenance · Open Statistical Standards</div>
        <h1 class="page-title">Statistical Releases, Sources &amp; Methodology</h1>
        <p class="page-lead">Every bulletin in this compendium maps to a primary Australian statistical release with catalog identifier, reference period, and methodological definition.</p>
      </div>
      <div class="hero-actions">
        <button type="button" class="btn btn-primary" id="rel-download-all">Download Full Dataset (JSON)</button>
      </div>
    </section>

    <article class="card" style="margin-bottom:16px">
      <div class="card-header">
        <div>
          <h2 class="card-title">Recent &amp; Scheduled Statistical Releases</h2>
          <div class="card-sub">Filter by statistical domain · Click any release to open its live interactive series</div>
        </div>
        <div class="pill-group" role="tablist" aria-label="Filter releases by domain">
          ${domains.map((d) => `
            <button type="button" role="tab" class="pill-btn ${d === relState.domain ? 'is-active' : ''}" data-rel-domain="${escapeHtml(d)}">${escapeHtml(d)}</button>
          `).join('')}
        </div>
      </div>

      <div class="table-wrap">
        <table class="data-table" id="rel-table"></table>
      </div>
    </article>

    <section aria-label="Statistical definitions glossary">
      <div class="card-header" style="margin-bottom:10px">
        <h2 class="card-title">Statistical Definitions &amp; Concepts</h2>
        <span class="code-chip">SNA 2008 / ILO / ABS Standards</span>
      </div>
      <div class="two-col">
        ${GLOSSARY_TERMS.map((g) => `
          <article class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px">
              <strong style="font-family:var(--font-serif);font-size:15px">${escapeHtml(g.term)}</strong>
              <span class="code-chip">${escapeHtml(g.agency)}</span>
            </div>
            <p style="margin:0;font-size:13px;color:#43525e">${escapeHtml(g.definition)}</p>
          </article>
        `).join('')}
      </div>
    </section>
  `;

  const paintTable = () => {
    const rows = relState.domain === 'All'
      ? RELEASE_CALENDAR
      : RELEASE_CALENDAR.filter((r) => r.domain === relState.domain);

    root.querySelector('#rel-table').innerHTML = `
      <thead>
        <tr>
          <th>Release Date</th>
          <th>Catalog ID</th>
          <th>Domain</th>
          <th>Publication</th>
          <th>Reference Period</th>
          <th class="num">Action</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map((r) => `
          <tr>
            <td class="num">${escapeHtml(r.date)}</td>
            <td><span class="code-chip">${escapeHtml(r.code)}</span></td>
            <td>${escapeHtml(r.domain)}</td>
            <td><strong>${escapeHtml(r.title)}</strong></td>
            <td>${escapeHtml(r.period)}</td>
            <td class="num"><a href="${r.route}" style="font-weight:600">Open →</a></td>
          </tr>
        `).join('')}
      </tbody>
    `;
  };

  root.querySelectorAll('[data-rel-domain]').forEach((btn) => {
    btn.addEventListener('click', () => {
      relState.domain = btn.dataset.relDomain;
      root.querySelectorAll('[data-rel-domain]').forEach((b) => b.classList.toggle('is-active', b.dataset.relDomain === relState.domain));
      paintTable();
    });
  });

  root.querySelector('#rel-download-all').addEventListener('click', () => {
    const bundle = {
      portal: 'Meridian Australia National Statistics Ledger',
      edition: '2025-26',
      indicators: INDICATORS.map(({ id, code, domain, title, source, frequency, latestValue, latestYear, years, values }) => ({
        id, code, domain, title, source, frequency, latestValue, latestYear, years, values,
      })),
      regions: REGIONS.map(({ path, labelPos, enclavePos, ...rest }) => rest),
      releases: RELEASE_CALENDAR,
    };
    triggerFileDownload('meridian-australia-compendium-2025.json', 'application/json;charset=utf-8', JSON.stringify(bundle, null, 2));
  });

  paintTable();
}
