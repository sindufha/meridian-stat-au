// Renders the Indicator Catalogue and Deep-Dive Statistical Series Explorer (#/indicator/<id>).
// Supports time-range filtering, benchmark overlays, component breakdowns, sortable tables, and CSV/JSON export.

import { INDICATOR_MAP, INDICATORS } from '../data/indicators.js';
import { bindChartHover, renderHorizontalBarsSvg, renderMultiLineChartSvg } from '../lib/charts.js';
import { escapeHtml, exportRowsToCsv, formatNumber, triggerFileDownload } from '../lib/format.js';

const viewState = {
  range: 'all',
  showBenchmark: true,
  showAnnotations: true,
  sortDir: 'desc',
};

function renderSidebar(activeId) {
  const domains = ['Prices', 'Economy', 'Labour', 'Demographics', 'Housing', 'Energy & Trade'];
  return domains.map((domain) => {
    const items = INDICATORS.filter((ind) => ind.domain === domain);
    if (!items.length) return '';
    return `
      <div class="domain-group-label">${escapeHtml(domain)}</div>
      ${items.map((ind) => `
        <a class="series-nav-item ${ind.id === activeId ? 'is-active' : ''}" href="#/indicator/${ind.id}">
          <span>${escapeHtml(ind.shortTitle)}</span>
          <span class="series-nav-val">${escapeHtml(ind.latestValue)}</span>
        </a>
      `).join('')}
    `;
  }).join('');
}

function sliceSeries(ind, range) {
  const total = ind.years.length;
  let start = 0;
  if (range === '5y') start = Math.max(0, total - 6);
  else if (range === '10y') start = Math.max(0, total - 11);
  else if (range === '15y') start = Math.max(0, total - 16);

  return {
    years: ind.years.slice(start),
    values: ind.values.slice(start),
    benchmarkValues: ind.benchmarkValues ? ind.benchmarkValues.slice(start) : null,
  };
}

function formatPoint(val, ind) {
  if (val === null || val === undefined) return '—';
  const decimals = ind.unit === 'pct2' || ind.unit === 'rate' || ind.unit === 'millions' ? 2 : ind.unit === 'aud-k' || ind.unit === 'thousands' ? 0 : 1;
  return `${ind.yPrefix || ''}${formatNumber(val, decimals)}${ind.ySuffix || ''}`;
}

export function renderIndicatorView(root, indicatorId) {
  const ind = INDICATOR_MAP[indicatorId] || INDICATORS[0];

  root.innerHTML = `
    <section class="page-hero">
      <div>
        <div class="page-kicker">${escapeHtml(ind.domain)} · ${escapeHtml(ind.code)} · ${escapeHtml(ind.frequency)}</div>
        <h1 class="page-title">${escapeHtml(ind.title)}</h1>
        <p class="page-lead">${escapeHtml(ind.summary)}</p>
      </div>
      <div class="hero-actions">
        <button type="button" class="btn" id="ind-export-csv">Download CSV</button>
        <button type="button" class="btn" id="ind-export-json">Download JSON</button>
        <a class="btn btn-primary" href="#/tools">Compare Series</a>
      </div>
    </section>

    <div class="explorer-layout">
      <aside class="series-sidebar" aria-label="Statistical indicator directory">
        <div style="font-weight:700;font-size:12.5px;margin-bottom:6px;padding:0 6px;color:#14212b">12 National Indicators</div>
        ${renderSidebar(ind.id)}
      </aside>

      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="summary-strip" id="ind-summary-strip"></div>

        <article class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Historical Trend (${ind.years[0]}–${ind.latestYear})</h2>
              <div class="card-sub">${escapeHtml(ind.source)} · Reference year ${ind.latestYear}</div>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center">
              <div class="pill-group" aria-label="Time horizon">
                ${['5y', '10y', '15y', 'all'].map((r) => `
                  <button type="button" class="pill-btn ${viewState.range === r ? 'is-active' : ''}" data-ind-range="${r}">${r.toUpperCase()}</button>
                `).join('')}
              </div>
              ${ind.benchmarkValues ? `
                <button type="button" class="btn btn-sm" id="ind-toggle-bench">${viewState.showBenchmark ? 'Hide' : 'Show'} ${escapeHtml(ind.benchmarkName)}</button>
              ` : ''}
              <button type="button" class="btn btn-sm" id="ind-toggle-notes">${viewState.showAnnotations ? 'Hide' : 'Show'} Notes</button>
            </div>
          </div>

          <div class="chart-legend" id="ind-legend"></div>
          <div class="chart-stage" id="ind-chart-stage"></div>
          <div class="chart-readout" id="ind-chart-readout"></div>
        </article>

        <div class="two-col" style="margin-bottom:0">
          ${ind.breakdown ? `
            <article class="card">
              <div class="card-header">
                <div>
                  <h2 class="card-title">${escapeHtml(ind.breakdownTitle)}</h2>
                  <div class="card-sub">${escapeHtml(ind.breakdownSubtitle)}</div>
                </div>
              </div>
              ${renderHorizontalBarsSvg(ind.breakdown, {
                width: 540,
                prefix: ind.breakdownPrefix || '',
                suffix: ind.breakdownSuffix || '%',
                decimals: 1,
                ariaLabel: ind.breakdownTitle,
              })}
            </article>
          ` : ''}

          <article class="card" style="${ind.breakdown ? '' : 'grid-column:1 / -1'}">
            <div class="card-header">
              <div>
                <h2 class="card-title">Historical Observations</h2>
                <div class="card-sub">Click Year to toggle order · ${escapeHtml(ind.code)}</div>
              </div>
              <button type="button" class="btn btn-sm" id="ind-sort-btn">Order: ${viewState.sortDir === 'desc' ? 'Newest first ↓' : 'Oldest first ↑'}</button>
            </div>
            <div class="table-wrap" style="max-height:300px;overflow-y:auto">
              <table class="data-table" id="ind-table"></table>
            </div>
          </article>
        </div>

        <div class="method-box">
          <strong>Methodology &amp; Source Attribution (${escapeHtml(ind.code)}):</strong> ${escapeHtml(ind.methodology)}
          <div style="margin-top:4px;font-size:11.5px;color:#647482">Primary Agency: ${escapeHtml(ind.source)} · Frequency: ${escapeHtml(ind.frequency)} · Latest Reference Period: ${ind.latestYear}.</div>
        </div>
      </div>
    </div>
  `;

  const renderDynamic = () => {
    const sliced = sliceSeries(ind, viewState.range);
    const vals = sliced.values;
    const latest = vals[vals.length - 1];
    const prev = vals.length > 1 ? vals[vals.length - 2] : latest;
    const diff = latest - prev;
    const peak = Math.max(...vals);
    const peakYr = sliced.years[vals.indexOf(peak)];
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;

    root.querySelector('#ind-summary-strip').innerHTML = `
      <div class="summary-box">
        <div class="summary-box-label">Latest (${sliced.years[sliced.years.length - 1]})</div>
        <div class="summary-box-val num">${escapeHtml(ind.latestValue)}</div>
        <div class="summary-box-note">${escapeHtml(ind.code)}</div>
      </div>
      <div class="summary-box">
        <div class="summary-box-label">Annual Change</div>
        <div class="summary-box-val num">${diff >= 0 ? '+' : ''}${diff.toFixed(ind.unit === 'pct2' ? 2 : 1)}${escapeHtml(ind.ySuffix || '')}</div>
        <div class="summary-box-note">vs ${sliced.years[Math.max(0, sliced.years.length - 2)]}</div>
      </div>
      <div class="summary-box">
        <div class="summary-box-label">Window Peak</div>
        <div class="summary-box-val num">${escapeHtml(formatPoint(peak, ind))}</div>
        <div class="summary-box-note">Recorded in ${peakYr}</div>
      </div>
      <div class="summary-box">
        <div class="summary-box-label">Window Average</div>
        <div class="summary-box-val num">${escapeHtml(formatPoint(avg, ind))}</div>
        <div class="summary-box-note">${sliced.years[0]}–${sliced.years[sliced.years.length - 1]} mean</div>
      </div>
    `;

    const decimals = ind.unit === 'pct2' || ind.unit === 'rate' || ind.unit === 'millions' ? 2 : ind.unit === 'aud-k' || ind.unit === 'thousands' ? 0 : 1;
    const series = [{ name: ind.shortTitle, color: ind.color, decimals, values: sliced.values }];
    if (ind.benchmarkValues && viewState.showBenchmark) {
      series.push({
        name: ind.benchmarkName,
        color: ind.benchmarkColor,
        decimals: ind.id === 'cpi' ? 2 : 1,
        dashed: true,
        values: sliced.benchmarkValues,
      });
    }

    const cfg = {
      years: sliced.years,
      series,
      width: 780,
      height: 186,
      yPrefix: ind.yPrefix || '',
      ySuffix: ind.ySuffix || '',
      targetBand: ind.targetBand || null,
      zeroLine: Boolean(ind.zeroLine),
      annotations: viewState.showAnnotations ? (ind.annotations || []) : [],
      ariaLabel: ind.title,
    };

    root.querySelector('#ind-legend').innerHTML = series.map((s) => `
      <span class="legend-item"><span class="legend-swatch" style="background:${s.color}"></span>${escapeHtml(s.name)}</span>
    `).join('') + (cfg.targetBand ? `<span class="legend-item"><span class="legend-band" style="background:${cfg.targetBand.fill};opacity:0.22"></span>${escapeHtml(cfg.targetBand.label)}</span>` : '');

    const stage = root.querySelector('#ind-chart-stage');
    const readout = root.querySelector('#ind-chart-readout');
    stage.innerHTML = renderMultiLineChartSvg(cfg);
    bindChartHover(stage, readout, cfg);

    // Table rows
    const rowData = sliced.years.map((yr, i) => ({
      year: yr,
      val: sliced.values[i],
      delta: i > 0 ? sliced.values[i] - sliced.values[i - 1] : null,
      bench: sliced.benchmarkValues ? sliced.benchmarkValues[i] : null,
    }));
    if (viewState.sortDir === 'desc') rowData.reverse();

    root.querySelector('#ind-table').innerHTML = `
      <thead>
        <tr>
          <th>Year</th>
          <th class="num">${escapeHtml(ind.shortTitle)}</th>
          <th class="num">YoY Shift</th>
          ${ind.benchmarkValues ? `<th class="num">${escapeHtml(ind.benchmarkName)}</th>` : ''}
        </tr>
      </thead>
      <tbody>
        ${rowData.map((r) => `
          <tr>
            <td class="num"><strong>${r.year}</strong></td>
            <td class="num">${escapeHtml(formatPoint(r.val, ind))}</td>
            <td class="num" style="color:${r.delta === null ? '#647482' : r.delta >= 0 ? '#146c43' : '#b43425'}">
              ${r.delta === null ? '—' : `${r.delta >= 0 ? '+' : ''}${r.delta.toFixed(1)}`}
            </td>
            ${ind.benchmarkValues ? `<td class="num">${r.bench === null ? '—' : `${formatNumber(r.bench, ind.id === 'cpi' ? 2 : 1)}${escapeHtml(ind.ySuffix || '')}`}</td>` : ''}
          </tr>
        `).join('')}
      </tbody>
    `;
  };

  root.querySelectorAll('[data-ind-range]').forEach((btn) => {
    btn.addEventListener('click', () => {
      viewState.range = btn.dataset.indRange;
      root.querySelectorAll('[data-ind-range]').forEach((b) => b.classList.toggle('is-active', b.dataset.indRange === viewState.range));
      renderDynamic();
    });
  });

  const benchBtn = root.querySelector('#ind-toggle-bench');
  if (benchBtn) {
    benchBtn.addEventListener('click', () => {
      viewState.showBenchmark = !viewState.showBenchmark;
      benchBtn.textContent = `${viewState.showBenchmark ? 'Hide' : 'Show'} ${ind.benchmarkName}`;
      renderDynamic();
    });
  }

  const notesBtn = root.querySelector('#ind-toggle-notes');
  notesBtn.addEventListener('click', () => {
    viewState.showAnnotations = !viewState.showAnnotations;
    notesBtn.textContent = `${viewState.showAnnotations ? 'Hide' : 'Show'} Notes`;
    renderDynamic();
  });

  const sortBtn = root.querySelector('#ind-sort-btn');
  sortBtn.addEventListener('click', () => {
    viewState.sortDir = viewState.sortDir === 'desc' ? 'asc' : 'desc';
    sortBtn.textContent = `Order: ${viewState.sortDir === 'desc' ? 'Newest first ↓' : 'Oldest first ↑'}`;
    renderDynamic();
  });

  root.querySelector('#ind-export-csv').addEventListener('click', () => {
    const cols = [{ key: 'year', label: 'Year' }, { key: 'value', label: ind.title }];
    if (ind.benchmarkValues) cols.push({ key: 'benchmark', label: ind.benchmarkName });
    const rows = ind.years.map((yr, i) => ({
      year: yr,
      value: ind.values[i],
      benchmark: ind.benchmarkValues ? ind.benchmarkValues[i] : '',
    }));
    exportRowsToCsv(`meridian-${ind.id}.csv`, cols, rows);
  });

  root.querySelector('#ind-export-json').addEventListener('click', () => {
    const payload = {
      id: ind.id,
      code: ind.code,
      title: ind.title,
      source: ind.source,
      frequency: ind.frequency,
      observations: ind.years.map((year, i) => ({
        year,
        value: ind.values[i],
        ...(ind.benchmarkValues ? { benchmark: ind.benchmarkValues[i] } : {}),
      })),
    };
    triggerFileDownload(`meridian-${ind.id}.json`, 'application/json;charset=utf-8', JSON.stringify(payload, null, 2));
  });

  renderDynamic();
}
