// Renders Population & Demographics (#/demographics):
// Dual-era Age-Sex Population Pyramid (2025 vs 2000 overlay), structural aging shifts,
// capital vs regional median age comparison, and natural increase vs overseas migration.

import {
  AGE_COHORTS,
  BROAD_AGE_GROUPS,
  CAPITAL_VS_REGIONAL_AGE,
  DEMOGRAPHIC_HEADLINES,
  GROWTH_COMPONENTS,
} from '../data/demographics.js';
import { bindChartHover, renderHorizontalBarsSvg, renderMultiLineChartSvg } from '../lib/charts.js';
import { escapeHtml } from '../lib/format.js';

const demoState = {
  show2000Overlay: true,
};

function renderPyramidSvg(showOverlay) {
  const width = 560;
  const rowH = 19;
  const pad = { top: 28, right: 24, bottom: 28, left: 24 };
  const center = width / 2;
  const labelGap = 24;
  const halfBar = (width - pad.left - pad.right) / 2 - labelGap;
  const height = pad.top + pad.bottom + AGE_COHORTS.length * rowH;
  const maxPct = 4.4;

  let svg = `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Australia Age-Sex Population Pyramid 2025 compared with 2000">`;

  // Headers
  svg += `<text x="${center - labelGap - 6}" y="16" text-anchor="end" font-size="11.5" font-weight="700" fill="#0e5a5c">← Male (% of pop.)</text>`;
  svg += `<text x="${center + labelGap + 6}" y="16" text-anchor="start" font-size="11.5" font-weight="700" fill="#c4512d">Female (% of pop.) →</text>`;

  // Vertical scale lines (1%, 2%, 3%, 4%)
  [1, 2, 3, 4].forEach((p) => {
    const dx = (p / maxPct) * halfBar;
    const xl = center - labelGap - dx;
    const xr = center + labelGap + dx;
    svg += `<line x1="${xl.toFixed(1)}" y1="${pad.top}" x2="${xl.toFixed(1)}" y2="${height - pad.bottom}" stroke="#e6e2d8" stroke-dasharray="2,3"></line>`;
    svg += `<line x1="${xr.toFixed(1)}" y1="${pad.top}" x2="${xr.toFixed(1)}" y2="${height - pad.bottom}" stroke="#e6e2d8" stroke-dasharray="2,3"></line>`;
    svg += `<text x="${xl.toFixed(1)}" y="${height - 8}" text-anchor="middle" font-size="10.5" fill="#647482">${p}%</text>`;
    svg += `<text x="${xr.toFixed(1)}" y="${height - 8}" text-anchor="middle" font-size="10.5" fill="#647482">${p}%</text>`;
  });

  AGE_COHORTS.forEach((c, idx) => {
    const y = pad.top + idx * rowH;
    const mw = (c.m25 / maxPct) * halfBar;
    const fw = (c.f25 / maxPct) * halfBar;

    // 2025 filled bars
    svg += `<rect x="${(center - labelGap - mw).toFixed(1)}" y="${y + 2}" width="${mw.toFixed(1)}" height="${rowH - 4}" rx="2" fill="#0e5a5c" fill-opacity="0.86"></rect>`;
    svg += `<rect x="${(center + labelGap).toFixed(1)}" y="${y + 2}" width="${fw.toFixed(1)}" height="${rowH - 4}" rx="2" fill="#c4512d" fill-opacity="0.86"></rect>`;

    // Optional 2000 reference outline
    if (showOverlay) {
      const mw00 = (c.m00 / maxPct) * halfBar;
      const fw00 = (c.f00 / maxPct) * halfBar;
      svg += `<rect x="${(center - labelGap - mw00).toFixed(1)}" y="${y + 2}" width="${mw00.toFixed(1)}" height="${rowH - 4}" fill="none" stroke="#14212b" stroke-width="1.3" stroke-dasharray="2,2"></rect>`;
      svg += `<rect x="${(center + labelGap).toFixed(1)}" y="${y + 2}" width="${fw00.toFixed(1)}" height="${rowH - 4}" fill="none" stroke="#14212b" stroke-width="1.3" stroke-dasharray="2,2"></rect>`;
    }

    svg += `<text x="${center}" y="${y + 13.5}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#243440">${c.band}</text>`;
    svg += `<rect class="pyr-hit" data-idx="${idx}" x="${pad.left}" y="${y}" width="${width - pad.left - pad.right}" height="${rowH}" fill="transparent" style="cursor:pointer"></rect>`;
  });

  svg += `</svg>`;
  return svg;
}

export function renderDemographicsView(root) {
  root.innerHTML = `
    <section class="page-hero">
      <div>
        <div class="page-kicker">Population Structure · ABS 3101.0 · ABS 3301.0 · AIHW</div>
        <h1 class="page-title">Demographics &amp; Population Structure</h1>
        <p class="page-lead">How rising longevity, lower fertility (1.50), and working-age overseas migration are reshaping Australia’s age distribution from 2000 to 2025.</p>
      </div>
      <div class="hero-actions">
        <a class="btn btn-primary" href="#/indicator/population">ERP Time Series</a>
        <a class="btn" href="#/indicator/migration">Migration Data</a>
      </div>
    </section>

    <div class="summary-strip">
      ${DEMOGRAPHIC_HEADLINES.map((h) => `
        <div class="summary-box" style="background:#ffffff">
          <div class="summary-box-label">${escapeHtml(h.label)}</div>
          <div class="summary-box-val num">${escapeHtml(h.value)}</div>
          <div class="summary-box-note">${escapeHtml(h.note)}</div>
        </div>
      `).join('')}
    </div>

    <section class="two-col">
      <article class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Age-Sex Population Pyramid (2025 vs 2000)</h2>
            <div class="card-sub">Five-year cohorts as share of national population · ABS ERP</div>
          </div>
          <button type="button" class="btn btn-sm" id="pyr-toggle-2000">${demoState.show2000Overlay ? 'Hide 2000 Overlay' : 'Show 2000 Overlay'}</button>
        </div>
        <div class="chart-legend">
          <span class="legend-item"><span class="legend-swatch" style="background:#0e5a5c"></span>Male 2025</span>
          <span class="legend-item"><span class="legend-swatch" style="background:#c4512d"></span>Female 2025</span>
          <span class="legend-item"><span class="legend-swatch" style="background:#14212b"></span>2000 Benchmark (dashed)</span>
        </div>
        <div id="pyr-stage"></div>
        <div class="chart-readout" id="pyr-readout"></div>
      </article>

      <div class="side-stack">
        <article class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Capital Cities vs Regional Australia: Median Age</h2>
              <div class="card-sub">Years · ABS Regional Population by Age &amp; Sex, 2024–25</div>
            </div>
          </div>
          ${renderHorizontalBarsSvg(CAPITAL_VS_REGIONAL_AGE, {
            width: 520,
            suffix: ' yrs',
            decimals: 1,
            maxVal: 46,
            highlightTop: false,
            ariaLabel: 'Median age across Australian capital cities and regions',
          })}
        </article>

        <article class="card">
          <div class="card-header" style="margin-bottom:6px">
            <div>
              <h2 class="card-title">Structural Shift by Broad Age Band</h2>
              <div class="card-sub">Share of resident population, 2000 vs 2025 (%)</div>
            </div>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr><th>Cohort</th><th class="num">2000</th><th class="num">2025</th><th class="num">Shift</th></tr>
              </thead>
              <tbody>
                ${BROAD_AGE_GROUPS.map((g) => {
                  const shift = g.pct2025 - g.pct2000;
                  return `<tr>
                    <td><strong>${escapeHtml(g.label)}</strong><div style="font-size:11px;color:#647482">${escapeHtml(g.note)}</div></td>
                    <td class="num">${g.pct2000.toFixed(1)}%</td>
                    <td class="num"><strong>${g.pct2025.toFixed(1)}%</strong></td>
                    <td class="num" style="color:${shift >= 0 ? '#0e5a5c' : '#c4512d'};font-weight:700">${shift >= 0 ? '+' : ''}${shift.toFixed(1)} pp</td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>

    <article class="card">
      <div class="card-header">
        <div>
          <h2 class="card-title">Components of Population Growth: Migration vs Natural Increase (2015–2025)</h2>
          <div class="card-sub">Thousands of residents per financial year · ABS Cat. 3101.0 &amp; 3412.0</div>
        </div>
      </div>
      <div class="chart-legend">
        <span class="legend-item"><span class="legend-swatch" style="background:#0e5a5c"></span>Net Overseas Migration (k)</span>
        <span class="legend-item"><span class="legend-swatch" style="background:#b68420"></span>Natural Increase (Births − Deaths, k)</span>
      </div>
      <div class="chart-stage" id="demo-growth-stage"></div>
      <div class="chart-readout" id="demo-growth-readout"></div>
    </article>
  `;

  const paintPyramid = () => {
    const stage = root.querySelector('#pyr-stage');
    const readout = root.querySelector('#pyr-readout');
    stage.innerHTML = renderPyramidSvg(demoState.show2000Overlay);

    const showCohort = (idx) => {
      const c = AGE_COHORTS[idx];
      const tot25 = (c.m25 + c.f25).toFixed(2);
      const tot00 = (c.m00 + c.f00).toFixed(2);
      readout.innerHTML = `<strong>Age ${c.band}</strong><span class="num">2025: <strong>${tot25}%</strong> (M ${c.m25.toFixed(2)}% / F ${c.f25.toFixed(2)}%) · 2000: ${tot00}%</span>`;
    };
    showCohort(11); // Default highlight 30-34 working-age peak

    stage.querySelectorAll('.pyr-hit').forEach((hit) => {
      hit.addEventListener('mouseenter', () => showCohort(Number(hit.dataset.idx)));
      hit.addEventListener('click', () => showCohort(Number(hit.dataset.idx)));
    });
  };

  root.querySelector('#pyr-toggle-2000').addEventListener('click', (e) => {
    demoState.show2000Overlay = !demoState.show2000Overlay;
    e.currentTarget.textContent = demoState.show2000Overlay ? 'Hide 2000 Overlay' : 'Show 2000 Overlay';
    paintPyramid();
  });

  const growthCfg = {
    years: GROWTH_COMPONENTS.years,
    width: 1120,
    height: 225,
    ySuffix: 'k',
    zeroLine: true,
    annotations: [
      { year: 2021, label: 'Border Closure (-85k)' },
      { year: 2023, label: 'Reopening Peak (+536k)' },
    ],
    series: [
      { name: 'Net Overseas Migration', color: '#0e5a5c', decimals: 0, values: GROWTH_COMPONENTS.migration },
      { name: 'Natural Increase', color: '#b68420', decimals: 0, dashed: true, values: GROWTH_COMPONENTS.natural },
    ],
    ariaLabel: 'Net overseas migration versus natural population increase',
  };
  const gStage = root.querySelector('#demo-growth-stage');
  gStage.innerHTML = renderMultiLineChartSvg(growthCfg);
  bindChartHover(gStage, root.querySelector('#demo-growth-readout'), growthCfg);

  paintPyramid();
}
