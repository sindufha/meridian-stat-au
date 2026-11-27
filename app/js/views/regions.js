// Renders the Interactive 8-Jurisdiction States & Territories Atlas (#/regions).
// Features a geographically projected Australia choropleth map, dynamic metric switcher,
// national benchmark delta bars, and a complete sortable 8-state matrix with CSV export.

import { NATIONAL_BENCHMARKS, REGION_MAP, REGION_METRICS, REGIONS } from '../data/regions.js';
import { escapeHtml, exportRowsToCsv, formatMetricValue } from '../lib/format.js';

const regionState = {
  selectedCode: 'NSW',
  metricKey: 'meanDwellingK',
  sortKey: 'populationM',
  sortAsc: false,
};

function colorForValue(value, min, max, palette) {
  const ratio = max === min ? 0.5 : (value - min) / (max - min);
  const idx = Math.min(palette.length - 1, Math.max(0, Math.floor(ratio * palette.length)));
  return palette[idx];
}

function textToneForColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return luma < 148 ? '#ffffff' : '#14212b';
}

function renderAustraliaMap(metric, selectedCode) {
  const vals = REGIONS.map((r) => r[metric.key]);
  const min = Math.min(...vals);
  const max = Math.max(...vals);

  let svg = `<svg class="au-map-svg" viewBox="20 18 612 486" role="img" aria-label="Choropleth map of Australia by ${escapeHtml(metric.label)}">`;

  // Subtle ocean graticule lines for cartographic clarity
  svg += `<g stroke="#e6e2d8" stroke-width="0.9" stroke-dasharray="3,4">
    <line x1="30" y1="120" x2="620" y2="120"></line>
    <line x1="30" y1="241" x2="620" y2="241"></line>
    <line x1="30" y1="362" x2="620" y2="362"></line>
    <line x1="150" y1="22" x2="150" y2="492"></line>
    <line x1="310" y1="22" x2="310" y2="492"></line>
    <line x1="470" y1="22" x2="470" y2="492"></line>
  </g>`;

  // Render mainland states + Tasmania + ACT inset
  REGIONS.forEach((reg) => {
    const fill = colorForValue(reg[metric.key], min, max, metric.palette);
    const ink = textToneForColor(fill);
    const isSel = reg.code === selectedCode;
    const valText = formatMetricValue(reg[metric.key], metric.unit);

    if (reg.isInset) {
      svg += `<line x1="${reg.enclavePos[0]}" y1="${reg.enclavePos[1]}" x2="556" y2="389" stroke="#14212b" stroke-width="1.3" stroke-dasharray="2,2"></line>`;
      svg += `<circle cx="${reg.enclavePos[0]}" cy="${reg.enclavePos[1]}" r="4.2" fill="${fill}" stroke="#14212b" stroke-width="1.5"></circle>`;
    }

    svg += `<g class="region-hit" data-region="${reg.code}" tabindex="0" role="button" aria-label="${escapeHtml(reg.name)}: ${escapeHtml(valText)}">
      <path d="${reg.path}" fill="${fill}" class="region-shape ${isSel ? 'is-selected' : ''}"></path>
      <text x="${reg.labelPos[0]}" y="${reg.labelPos[1] - 4}" text-anchor="middle" font-size="${reg.isInset ? '10.5' : '12.5'}" font-weight="800" fill="${ink}" style="pointer-events:none">${reg.code}</text>
      <text x="${reg.labelPos[0]}" y="${reg.labelPos[1] + 10}" text-anchor="middle" font-size="${reg.isInset ? '10' : '11'}" font-weight="600" fill="${ink}" style="pointer-events:none">${escapeHtml(valText)}</text>
    </g>`;
  });

  // Compact geographic caption positioned cleanly in the lower-left Indian Ocean area
  svg += `<text x="34" y="476" font-size="10.5" fill="#647482">Click any state or territory to inspect</text>`;
  svg += `<text x="34" y="491" font-size="10.2" fill="#647482">Sources: ABS &amp; DCCEEW (2025)</text>`;
  svg += `</svg>`;

  const scaleHtml = `
    <div class="map-scale">
      <span class="num">Low: <strong>${escapeHtml(formatMetricValue(min, metric.unit))}</strong></span>
      <div class="scale-swatches">
        ${metric.palette.map((c) => `<span style="background:${c}"></span>`).join('')}
      </div>
      <span class="num">High: <strong>${escapeHtml(formatMetricValue(max, metric.unit))}</strong></span>
    </div>
  `;

  return `${svg}${scaleHtml}`;
}

function renderBenchmarkBar(label, stateVal, natVal, maxCeiling, unit) {
  const pct = Math.min(100, Math.max(4, (stateVal / maxCeiling) * 100));
  const natPct = Math.min(98, Math.max(2, (natVal / maxCeiling) * 100));
  const diff = stateVal - natVal;
  const diffLabel = `${diff >= 0 ? '+' : ''}${unit === 'aud' || unit === 'aud-k' ? Math.round(diff) : diff.toFixed(1)}`;
  return `
    <div class="benchmark-row">
      <div class="benchmark-top">
        <span><strong>${escapeHtml(label)}</strong></span>
        <span class="num"><strong>${escapeHtml(formatMetricValue(stateVal, unit))}</strong> <span style="color:#647482">(Nat. ${escapeHtml(formatMetricValue(natVal, unit))}, ${diffLabel})</span></span>
      </div>
      <div class="benchmark-track">
        <div class="benchmark-fill" style="width:${pct.toFixed(1)}%"></div>
        <div class="benchmark-marker" style="left:${natPct.toFixed(1)}%" title="National Benchmark"></div>
      </div>
    </div>
  `;
}

export function renderRegionsView(root, initialCode = 'NSW') {
  if (REGION_MAP[initialCode]) regionState.selectedCode = initialCode;

  root.innerHTML = `
    <section class="page-hero">
      <div>
        <div class="page-kicker">Sub-National Accounts · All 8 States &amp; Territories</div>
        <h1 class="page-title">States &amp; Territories Statistical Atlas</h1>
        <p class="page-lead">Compare population, Gross State Product, residential dwelling values, median earnings, unemployment, and renewable grid transition across every Australian jurisdiction (ABS 3101.0, 5220.0, 6202.0, 6432.0 · 2025).</p>
      </div>
      <div class="hero-actions">
        <button type="button" class="btn" id="reg-export-csv">Export 8-State CSV</button>
        <a class="btn btn-primary" href="#/demographics">Age Pyramid</a>
      </div>
    </section>

    <div style="margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
      <div class="pill-group" id="reg-metric-pills" role="tablist" aria-label="Map indicator selector">
        ${REGION_METRICS.map((m) => `
          <button type="button" role="tab" class="pill-btn ${m.key === regionState.metricKey ? 'is-active' : ''}" data-metric="${m.key}">${escapeHtml(m.label)}</button>
        `).join('')}
      </div>
    </div>

    <section class="regions-layout">
      <article class="card">
        <div class="card-header" style="margin-bottom:4px">
          <div>
            <h2 class="card-title" id="reg-map-title"></h2>
            <div class="card-sub">All 6 states and 2 territories · Ochre vertical tick on right shows national average</div>
          </div>
          <span class="code-chip">ABS 5220.0 · 2025</span>
        </div>
        <div class="map-wrap" id="reg-map-wrap"></div>
      </article>

      <article class="card" id="reg-detail-card" style="display:flex;flex-direction:column;justify-content:space-between"></article>
    </section>

    <article class="card">
      <div class="card-header">
        <div>
          <h2 class="card-title">Complete State &amp; Territory Comparison Table (2025)</h2>
          <div class="card-sub">Click any column header to sort · Click any row to focus on the map</div>
        </div>
        <span class="code-chip">8 / 8 Jurisdictions</span>
      </div>
      <div class="table-wrap">
        <table class="data-table" id="reg-table"></table>
      </div>
    </article>
  `;

  const paintAll = () => {
    const metric = REGION_METRICS.find((m) => m.key === regionState.metricKey) || REGION_METRICS[0];
    const reg = REGION_MAP[regionState.selectedCode] || REGIONS[0];

    root.querySelector('#reg-map-title').textContent = `Australia by ${metric.label} (2025)`;
    const mapWrap = root.querySelector('#reg-map-wrap');
    mapWrap.innerHTML = renderAustraliaMap(metric, reg.code);

    mapWrap.querySelectorAll('.region-hit').forEach((el) => {
      const select = () => {
        regionState.selectedCode = el.dataset.region;
        paintAll();
      };
      el.addEventListener('click', select);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          select();
        }
      });
    });

    const detailEl = root.querySelector('#reg-detail-card');
    detailEl.innerHTML = `
      <div>
        <div class="card-header" style="margin-bottom:8px">
          <div>
            <div class="page-kicker" style="margin-bottom:0">${escapeHtml(reg.code)} · Capital: ${escapeHtml(reg.capital)}</div>
            <h2 class="card-title" style="font-size:20px">${escapeHtml(reg.name)}</h2>
          </div>
          <span class="delta-badge delta-up">${reg.popSharePct.toFixed(1)}% of AU pop.</span>
        </div>

        <p style="margin:0 0 12px;font-size:12.5px;color:#43525e">${escapeHtml(reg.highlights)}</p>

        <div class="summary-strip" style="grid-template-columns:repeat(3,minmax(0,1fr));margin-bottom:14px">
          <div class="summary-box">
            <div class="summary-box-label">Population</div>
            <div class="summary-box-val num">${reg.populationM.toFixed(2)}M</div>
            <div class="summary-box-note">+${reg.popGrowthPct.toFixed(1)}% YoY</div>
          </div>
          <div class="summary-box">
            <div class="summary-box-label">Mean Dwelling</div>
            <div class="summary-box-val num">A$${reg.meanDwellingK.toLocaleString('en-AU')}k</div>
            <div class="summary-box-note">ABS 6432.0</div>
          </div>
          <div class="summary-box">
            <div class="summary-box-label">Median Age</div>
            <div class="summary-box-val num">${reg.medianAge.toFixed(1)}</div>
            <div class="summary-box-note">Nat. 38.4 yrs</div>
          </div>
        </div>

        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#647482;margin-bottom:8px">
          Vs National Benchmark (Ochre Line)
        </div>
        ${renderBenchmarkBar('Mean Dwelling Value', reg.meanDwellingK, NATIONAL_BENCHMARKS.meanDwellingK, 1400, 'aud-k')}
        ${renderBenchmarkBar('GSP per Capita', reg.gspPerCapitaK, NATIONAL_BENCHMARKS.gspPerCapitaK, 160, 'aud-k')}
        ${renderBenchmarkBar('Median Weekly Earnings', reg.medianWeeklyAud, NATIONAL_BENCHMARKS.medianWeeklyAud, 1800, 'aud')}
        ${renderBenchmarkBar('GSP Real Growth', reg.gspGrowthPct, NATIONAL_BENCHMARKS.gspGrowthPct, 4.0, 'signed-pct')}
        ${renderBenchmarkBar('Unemployment Rate', reg.unemploymentPct, NATIONAL_BENCHMARKS.unemploymentPct, 6.0, 'pct')}
        ${renderBenchmarkBar('Renewable Electricity', reg.renewablesPct, NATIONAL_BENCHMARKS.renewablesPct, 100, 'pct')}
      </div>

      <div style="margin-top:8px;padding-top:8px;border-top:1px solid #ece8de;display:flex;justify-content:space-between;align-items:center;font-size:12px">
        <span style="color:#647482">Source: ABS 3101.0, 5220.0, 6202.0, 6432.0 (2025)</span>
        <a href="#/tools" style="font-weight:600">Test salary in ${escapeHtml(reg.code)} →</a>
      </div>
    `;

    // Sortable comparison table
    const columns = [
      { key: 'name', label: 'Jurisdiction', numeric: false },
      { key: 'populationM', label: 'Population', numeric: true, unit: 'millions' },
      { key: 'popGrowthPct', label: 'Pop. YoY', numeric: true, unit: 'signed-pct' },
      { key: 'gspGrowthPct', label: 'GSP Growth', numeric: true, unit: 'signed-pct' },
      { key: 'gspPerCapitaK', label: 'GSP / Cap', numeric: true, unit: 'aud-k' },
      { key: 'meanDwellingK', label: 'Mean Dwelling', numeric: true, unit: 'aud-k' },
      { key: 'medianWeeklyAud', label: 'Weekly Pay', numeric: true, unit: 'aud' },
      { key: 'unemploymentPct', label: 'Unemp.', numeric: true, unit: 'pct' },
      { key: 'renewablesPct', label: 'Renewables', numeric: true, unit: 'pct' },
    ];

    const sorted = [...REGIONS].sort((a, b) => {
      const av = a[regionState.sortKey];
      const bv = b[regionState.sortKey];
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
      return regionState.sortAsc ? cmp : -cmp;
    });

    const tableEl = root.querySelector('#reg-table');
    tableEl.innerHTML = `
      <thead>
        <tr>
          ${columns.map((c) => {
            const arrow = regionState.sortKey === c.key ? (regionState.sortAsc ? ' ↑' : ' ↓') : '';
            return `<th class="sortable ${c.numeric ? 'num' : ''}" data-sort="${c.key}">${escapeHtml(c.label)}${arrow}</th>`;
          }).join('')}
        </tr>
      </thead>
      <tbody>
        ${sorted.map((r) => `
          <tr class="${r.code === reg.code ? 'is-selected' : ''}" data-row-code="${r.code}" style="cursor:pointer">
            <td><strong>${escapeHtml(r.name)}</strong> <span class="code-chip">${r.code}</span></td>
            <td class="num">${r.populationM.toFixed(2)}M</td>
            <td class="num">+${r.popGrowthPct.toFixed(1)}%</td>
            <td class="num">+${r.gspGrowthPct.toFixed(1)}%</td>
            <td class="num">A$${r.gspPerCapitaK.toFixed(1)}k</td>
            <td class="num">A$${r.meanDwellingK.toLocaleString('en-AU')}k</td>
            <td class="num">A$${r.medianWeeklyAud.toLocaleString('en-AU')}</td>
            <td class="num">${r.unemploymentPct.toFixed(1)}%</td>
            <td class="num">${r.renewablesPct.toFixed(1)}%</td>
          </tr>
        `).join('')}
      </tbody>
    `;

    tableEl.querySelectorAll('th[data-sort]').forEach((th) => {
      th.addEventListener('click', () => {
        const key = th.dataset.sort;
        if (regionState.sortKey === key) regionState.sortAsc = !regionState.sortAsc;
        else {
          regionState.sortKey = key;
          regionState.sortAsc = key === 'name';
        }
        paintAll();
      });
    });

    tableEl.querySelectorAll('tr[data-row-code]').forEach((tr) => {
      tr.addEventListener('click', () => {
        regionState.selectedCode = tr.dataset.rowCode;
        paintAll();
      });
    });
  };

  root.querySelectorAll('[data-metric]').forEach((btn) => {
    btn.addEventListener('click', () => {
      regionState.metricKey = btn.dataset.metric;
      root.querySelectorAll('[data-metric]').forEach((b) => b.classList.toggle('is-active', b.dataset.metric === regionState.metricKey));
      paintAll();
    });
  });

  root.querySelector('#reg-export-csv').addEventListener('click', () => {
    exportRowsToCsv('meridian-australia-regions-2025.csv', [
      { key: 'code', label: 'Code' },
      { key: 'name', label: 'Jurisdiction' },
      { key: 'capital', label: 'Capital' },
      { key: 'populationM', label: 'Population (M)' },
      { key: 'popGrowthPct', label: 'Population Growth (%)' },
      { key: 'gspGrowthPct', label: 'GSP Growth (%)' },
      { key: 'gspPerCapitaK', label: 'GSP per Capita (A$k)' },
      { key: 'meanDwellingK', label: 'Mean Dwelling Value (A$k)' },
      { key: 'medianWeeklyAud', label: 'Median Weekly Earnings (A$)' },
      { key: 'unemploymentPct', label: 'Unemployment (%)' },
      { key: 'renewablesPct', label: 'Renewables (%)' },
    ], REGIONS);
  });

  paintAll();
}
