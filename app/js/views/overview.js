// Renders the National Overview landing view (#/).
// Displays 6 headline KPI cards with sparklines, interactive macroeconomic chart,
// quick purchasing-power calculator, latest bulletins, and statistical topic links.

import {
  CPI_INDEX_BY_YEAR,
  HEADLINE_KPIS,
  LATEST_BULLETINS,
  OVERVIEW_CHARTS,
  OVERVIEW_YEARS,
  TOPIC_DIRECTORY,
} from '../data/overview.js';
import { bindChartHover, renderMultiLineChartSvg, renderSparklineSvg } from '../lib/charts.js';
import { escapeHtml, exportRowsToCsv, formatCurrencyAUD } from '../lib/format.js';

const state = {
  activeChartId: 'inflation',
  range: 'all',
  calcAmount: 1000,
  calcFrom: 2015,
  calcTo: 2025,
};

function renderKpiCards() {
  return HEADLINE_KPIS.map((kpi) => `
    <a class="kpi-card tone-${kpi.cardTone}" href="${kpi.route}">
      <div class="kpi-top">
        <span class="kpi-label">${escapeHtml(kpi.label)}</span>
        <span class="delta-badge delta-${kpi.deltaTone}">${escapeHtml(kpi.delta)}</span>
      </div>
      <div class="kpi-main">
        <span class="kpi-value">${escapeHtml(kpi.value)}</span>
        ${renderSparklineSvg(kpi.spark, kpi.sparkColor)}
      </div>
      <div class="kpi-footer">
        <span class="kpi-source">${escapeHtml(kpi.source)}</span>
        <span>Explore →</span>
      </div>
    </a>
  `).join('');
}

function getSlicedChartConfig() {
  const chart = OVERVIEW_CHARTS[state.activeChartId] || OVERVIEW_CHARTS.inflation;
  const minStart = chart.startIndex ?? 0;
  let start = minStart;
  if (state.range === '10y') start = Math.max(minStart, OVERVIEW_YEARS.length - 11);
  if (state.range === '15y') start = Math.max(minStart, OVERVIEW_YEARS.length - 16);

  return {
    ...chart,
    years: OVERVIEW_YEARS.slice(start),
    series: chart.series.map((s) => ({ ...s, values: s.values.slice(start) })),
  };
}

function computeQuickInflation(amount, fromYear, toYear) {
  const idxFrom = CPI_INDEX_BY_YEAR[fromYear] || 100;
  const idxTo = CPI_INDEX_BY_YEAR[toYear] || 207.3;
  const adjusted = amount * (idxTo / idxFrom);
  const pctChange = ((idxTo / idxFrom) - 1) * 100;
  const span = Math.abs(toYear - fromYear) || 1;
  const cagr = (Math.pow(idxTo / idxFrom, 1 / span) - 1) * 100;
  return { adjusted, pctChange, cagr };
}

export function renderOverviewView(root) {
  const cpiYears = Object.keys(CPI_INDEX_BY_YEAR).map(Number);

  root.innerHTML = `
    <section class="page-hero">
      <div>
        <div class="page-kicker">National Statistical Summary · Commonwealth of Australia</div>
        <h1 class="page-title">Australia at a Glance, 2025–26</h1>
        <p class="page-lead">Verified macroeconomic, price, labour, demographic, regional, and clean-energy accounts — every figure tied to its primary Australian agency and reference year.</p>
      </div>
      <div class="hero-actions">
        <a class="btn btn-primary" href="#/regions">8-State Atlas</a>
        <a class="btn" href="#/indicator/cpi">CPI Explorer</a>
        <a class="btn" href="#/tools">Calculators</a>
      </div>
    </section>

    <section class="kpi-grid" aria-label="Headline national statistics">
      ${renderKpiCards()}
    </section>

    <section class="overview-split">
      <article class="card" id="overview-chart-card">
        <div class="card-header">
          <div>
            <h2 class="card-title" id="ov-chart-title"></h2>
            <div class="card-sub" id="ov-chart-source"></div>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button type="button" class="btn btn-sm" id="ov-export-csv">Export CSV</button>
            <a class="btn btn-sm btn-primary" id="ov-open-series" href="#/indicator/cpi">Full series →</a>
          </div>
        </div>

        <div class="chart-toolbar">
          <div class="pill-group" role="tablist" aria-label="Headline indicator chart">
            ${Object.values(OVERVIEW_CHARTS).map((c) => `
              <button type="button" role="tab" class="pill-btn ${c.id === state.activeChartId ? 'is-active' : ''}" data-chart="${c.id}" aria-selected="${c.id === state.activeChartId}">${escapeHtml(c.tabLabel)}</button>
            `).join('')}
          </div>
          <div class="pill-group" aria-label="Time range">
            <button type="button" class="pill-btn ${state.range === '10y' ? 'is-active' : ''}" data-range="10y">10Y</button>
            <button type="button" class="pill-btn ${state.range === '15y' ? 'is-active' : ''}" data-range="15y">15Y</button>
            <button type="button" class="pill-btn ${state.range === 'all' ? 'is-active' : ''}" data-range="all">All</button>
          </div>
        </div>

        <div class="chart-legend" id="ov-chart-legend"></div>
        <div class="chart-stage" id="ov-chart-stage"></div>
        <div class="chart-readout" id="ov-chart-readout"></div>
      </article>

      <aside class="side-stack">
        <article class="card">
          <div class="card-header" style="margin-bottom:8px">
            <div>
              <h2 class="card-title">Purchasing Power Calculator</h2>
              <div class="card-sub">ABS CPI chain-linked index (2000–2025)</div>
            </div>
            <a class="btn btn-sm" href="#/tools">More →</a>
          </div>
          <div class="mini-calc-grid">
            <div>
              <label class="field-label" for="ov-calc-amt">Amount (A$)</label>
              <input class="field-input num" id="ov-calc-amt" type="number" min="1" step="50" value="${state.calcAmount}">
            </div>
            <div>
              <label class="field-label" for="ov-calc-from">From</label>
              <select class="field-select num" id="ov-calc-from">
                ${cpiYears.map((y) => `<option value="${y}" ${y === state.calcFrom ? 'selected' : ''}>${y}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="field-label" for="ov-calc-to">To</label>
              <select class="field-select num" id="ov-calc-to">
                ${cpiYears.map((y) => `<option value="${y}" ${y === state.calcTo ? 'selected' : ''}>${y}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="calc-result-box" id="ov-calc-output" aria-live="polite"></div>
        </article>

        <article class="card" style="flex:1">
          <div class="card-header" style="margin-bottom:6px">
            <div>
              <h2 class="card-title">Latest Official Releases</h2>
              <div class="card-sub">Verified primary agency publications</div>
            </div>
            <a class="btn btn-sm" href="#/releases">Calendar →</a>
          </div>
          <ul class="bulletin-list">
            ${LATEST_BULLETINS.map((b) => `
              <li class="bulletin-item">
                <div>
                  <a class="bulletin-link" href="${b.route}">${escapeHtml(b.title)}</a>
                  <span class="bulletin-meta">${escapeHtml(b.date)}</span>
                </div>
                <span class="code-chip">${escapeHtml(b.code)}</span>
              </li>
            `).join('')}
          </ul>
        </article>
      </aside>
    </section>

    <section aria-label="Statistical domains">
      <div class="card-header" style="margin-bottom:8px">
        <h2 class="card-title">Browse by Statistical Domain</h2>
        <a href="#/indicators" style="font-size:12.5px;font-weight:600">View all 12 indicators →</a>
      </div>
      <div class="topic-grid">
        ${TOPIC_DIRECTORY.map((t) => `
          <a class="topic-tile" href="${t.route}">
            <span class="topic-name">${escapeHtml(t.name)}</span>
            <span class="topic-stat num">${escapeHtml(t.stat)}</span>
          </a>
        `).join('')}
      </div>
    </section>
  `;

  const paintChart = () => {
    const cfg = getSlicedChartConfig();
    root.querySelector('#ov-chart-title').textContent = cfg.title;
    root.querySelector('#ov-chart-source').textContent = cfg.source;
    root.querySelector('#ov-open-series').setAttribute('href', `#/indicator/${cfg.indicatorId}`);

    const legendEl = root.querySelector('#ov-chart-legend');
    legendEl.innerHTML = cfg.series.map((s) => `
      <span class="legend-item"><span class="legend-swatch" style="background:${s.color}"></span>${escapeHtml(s.name)}</span>
    `).join('') + (cfg.targetBand ? `<span class="legend-item"><span class="legend-band" style="background:${cfg.targetBand.fill};opacity:0.22"></span>${escapeHtml(cfg.targetBand.label)}</span>` : '');

    const stage = root.querySelector('#ov-chart-stage');
    const readout = root.querySelector('#ov-chart-readout');
    stage.innerHTML = renderMultiLineChartSvg({ ...cfg, width: 740, height: 196, ariaLabel: cfg.title });
    bindChartHover(stage, readout, cfg);
  };

  const paintQuickCalc = () => {
    const amt = Math.max(0, Number(root.querySelector('#ov-calc-amt').value) || 0);
    const fromY = Number(root.querySelector('#ov-calc-from').value);
    const toY = Number(root.querySelector('#ov-calc-to').value);
    state.calcAmount = amt;
    state.calcFrom = fromY;
    state.calcTo = toY;

    const { adjusted, pctChange, cagr } = computeQuickInflation(amt, fromY, toY);
    const sign = pctChange >= 0 ? '+' : '';
    root.querySelector('#ov-calc-output').innerHTML = `
      <div>
        <div style="font-size:11px;color:#43525e;font-weight:600">${formatCurrencyAUD(amt, 0)} in ${fromY} equals (${toY})</div>
        <div class="calc-result-main num">${formatCurrencyAUD(adjusted, 0)}</div>
      </div>
      <div class="calc-result-meta num">
        <div><strong>${sign}${pctChange.toFixed(1)}%</strong> cumulative</div>
        <div>${cagr >= 0 ? '+' : ''}${cagr.toFixed(2)}% / yr avg</div>
      </div>
    `;
  };

  root.querySelectorAll('[data-chart]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.activeChartId = btn.dataset.chart;
      root.querySelectorAll('[data-chart]').forEach((b) => {
        const active = b.dataset.chart === state.activeChartId;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', String(active));
      });
      paintChart();
    });
  });

  root.querySelectorAll('[data-range]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.range = btn.dataset.range;
      root.querySelectorAll('[data-range]').forEach((b) => b.classList.toggle('is-active', b.dataset.range === state.range));
      paintChart();
    });
  });

  root.querySelector('#ov-export-csv').addEventListener('click', () => {
    const cfg = getSlicedChartConfig();
    const cols = [{ key: 'year', label: 'Year' }, ...cfg.series.map((s, idx) => ({ key: `s${idx}`, label: s.name }))];
    const rows = cfg.years.map((yr, i) => {
      const row = { year: yr };
      cfg.series.forEach((s, idx) => { row[`s${idx}`] = s.values[i] ?? ''; });
      return row;
    });
    exportRowsToCsv(`meridian-${cfg.id}-${state.range}.csv`, cols, rows);
  });

  ['#ov-calc-amt', '#ov-calc-from', '#ov-calc-to'].forEach((sel) => {
    root.querySelector(sel).addEventListener('input', paintQuickCalc);
    root.querySelector(sel).addEventListener('change', paintQuickCalc);
  });

  paintChart();
  paintQuickCalc();
}
