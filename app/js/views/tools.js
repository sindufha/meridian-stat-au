// Renders Interactive Statistical Calculators & Two-Series Comparison Lab (#/tools):
// 1. Australian Inflation & Purchasing Power Calculator (2000-2025)
// 2. Earnings & Housing Affordability Benchmark by State/Territory
// 3. Multi-Series Comparison Lab (Index Base=100 + live Pearson correlation r + CSV export)

import { INDICATORS, INDICATOR_MAP } from '../data/indicators.js';
import { CPI_INDEX_BY_YEAR } from '../data/overview.js';
import { NATIONAL_BENCHMARKS, REGION_MAP, REGIONS } from '../data/regions.js';
import { bindChartHover, renderMultiLineChartSvg } from '../lib/charts.js';
import { escapeHtml, exportRowsToCsv, formatCurrencyAUD } from '../lib/format.js';

function pearsonR(xs, ys) {
  const n = xs.length;
  if (n < 3) return null;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    const a = xs[i] - mx;
    const b = ys[i] - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  const den = Math.sqrt(dx * dy);
  return den === 0 ? 0 : num / den;
}

export function renderToolsView(root) {
  const years = Object.keys(CPI_INDEX_BY_YEAR).map(Number);

  root.innerHTML = `
    <section class="page-hero">
      <div>
        <div class="page-kicker">Interactive Statistical Workbench · Offline Computation</div>
        <h1 class="page-title">Calculators &amp; Series Comparison Lab</h1>
        <p class="page-lead">Apply official ABS price indices, state earnings benchmarks, and multi-indicator correlations directly to personal budgets, policy analysis, or research.</p>
      </div>
    </section>

    <section class="two-col">
      <article class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">1. Inflation &amp; Purchasing Power Calculator</h2>
            <div class="card-sub">Chain-linked ABS Consumer Price Index (Cat. 6401.0, 2000–2025)</div>
          </div>
        </div>
        <div class="mini-calc-grid">
          <div>
            <label class="field-label" for="tool-amt">Starting Amount (A$)</label>
            <input class="field-input num" id="tool-amt" type="number" min="1" step="100" value="50000">
          </div>
          <div>
            <label class="field-label" for="tool-from">Start Year</label>
            <select class="field-select num" id="tool-from">
              ${years.map((y) => `<option value="${y}" ${y === 2010 ? 'selected' : ''}>${y}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="field-label" for="tool-to">Target Year</label>
            <select class="field-select num" id="tool-to">
              ${years.map((y) => `<option value="${y}" ${y === 2025 ? 'selected' : ''}>${y}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="calc-result-box" id="tool-cpi-result" style="margin-bottom:10px"></div>
        <div class="chart-stage" id="tool-cpi-chart"></div>
      </article>

      <article class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">2. Earnings &amp; Housing Affordability Benchmark</h2>
            <div class="card-sub">Compare annual income against ABS state median earnings &amp; dwelling prices (2025)</div>
          </div>
        </div>
        <div class="mini-calc-grid" style="grid-template-columns:1.2fr 1.2fr">
          <div>
            <label class="field-label" for="bench-income">Annual Gross Income (A$)</label>
            <input class="field-input num" id="bench-income" type="number" min="10000" step="5000" value="95000">
          </div>
          <div>
            <label class="field-label" for="bench-state">State / Territory</label>
            <select class="field-select" id="bench-state">
              ${REGIONS.map((r) => `<option value="${r.code}" ${r.code === 'NSW' ? 'selected' : ''}>${escapeHtml(r.name)} (${r.code})</option>`).join('')}
            </select>
          </div>
        </div>
        <div id="bench-output"></div>
      </article>
    </section>

    <article class="card">
      <div class="card-header">
        <div>
          <h2 class="card-title">3. Two-Indicator Comparison Lab (Normalized Index, Base = 100)</h2>
          <div class="card-sub">Aligns any two national indicators across their overlapping years and computes Pearson correlation (r)</div>
        </div>
        <button type="button" class="btn btn-sm" id="cmp-export-csv">Export Comparison CSV</button>
      </div>
      <div class="chart-toolbar">
        <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center">
          <div>
            <label class="field-label" for="cmp-a">Series A (Teal)</label>
            <select class="field-select" id="cmp-a">
              ${INDICATORS.map((i) => `<option value="${i.id}" ${i.id === 'wpi' ? 'selected' : ''}>${escapeHtml(i.shortTitle)} (${escapeHtml(i.code)})</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="field-label" for="cmp-b">Series B (Ochre)</label>
            <select class="field-select" id="cmp-b">
              ${INDICATORS.map((i) => `<option value="${i.id}" ${i.id === 'cpi' ? 'selected' : ''}>${escapeHtml(i.shortTitle)} (${escapeHtml(i.code)})</option>`).join('')}
            </select>
          </div>
        </div>
        <div id="cmp-corr-badge" class="delta-badge delta-neutral num"></div>
      </div>
      <div class="chart-stage" id="cmp-chart-stage"></div>
      <div class="chart-readout" id="cmp-chart-readout"></div>
    </article>
  `;

  // 1. Inflation calculator
  const paintInflation = () => {
    const amt = Math.max(1, Number(root.querySelector('#tool-amt').value) || 1);
    const y1 = Number(root.querySelector('#tool-from').value);
    const y2 = Number(root.querySelector('#tool-to').value);
    const i1 = CPI_INDEX_BY_YEAR[y1];
    const i2 = CPI_INDEX_BY_YEAR[y2];
    const equiv = amt * (i2 / i1);
    const cum = ((i2 / i1) - 1) * 100;
    const span = Math.abs(y2 - y1) || 1;
    const cagr = (Math.pow(i2 / i1, 1 / span) - 1) * 100;

    root.querySelector('#tool-cpi-result').innerHTML = `
      <div>
        <div style="font-size:11.5px;color:#43525e">Equivalent purchasing power in <strong>${y2}</strong></div>
        <div class="calc-result-main num">${formatCurrencyAUD(equiv, 0)}</div>
      </div>
      <div class="calc-result-meta num">
        <div><strong>${cum >= 0 ? '+' : ''}${cum.toFixed(1)}%</strong> total price shift</div>
        <div>${cagr >= 0 ? '+' : ''}${cagr.toFixed(2)}% compound annual</div>
      </div>
    `;

    const lo = Math.min(y1, y2);
    const hi = Math.max(y1, y2);
    const pathYears = years.filter((y) => y >= lo && y <= hi);
    const baseIdx = CPI_INDEX_BY_YEAR[lo];
    const traj = pathYears.map((y) => Math.round(amt * (CPI_INDEX_BY_YEAR[y] / baseIdx)));
    root.querySelector('#tool-cpi-chart').innerHTML = renderMultiLineChartSvg({
      years: pathYears.length >= 2 ? pathYears : [lo, lo + 1 > 2025 ? 2025 : lo + 1],
      series: [{ name: 'CPI Equivalent (A$)', color: '#0e5a5c', decimals: 0, values: traj.length >= 2 ? traj : [amt, amt] }],
      width: 520,
      height: 175,
      yPrefix: 'A$',
      ySuffix: '',
      ariaLabel: 'Purchasing power trajectory over time',
    });
  };

  // 2. Earnings & Housing benchmark
  const paintBenchmark = () => {
    const income = Math.max(10000, Number(root.querySelector('#bench-income').value) || 10000);
    const code = root.querySelector('#bench-state').value;
    const reg = REGION_MAP[code] || REGIONS[0];
    const weekly = income / 52;
    const stateAnnualMedian = reg.medianWeeklyAud * 52;
    const natAnnualMedian = NATIONAL_BENCHMARKS.medianWeeklyAud * 52;
    const ratioState = (income / stateAnnualMedian) * 100;
    const ratioNat = (income / natAnnualMedian) * 100;
    const priceToIncome = (reg.meanDwellingK * 1000) / income;

    // Approximate national gross personal income percentile bracket (ABS Characteristics of Employment)
    let band = 'Bottom 25% of earners';
    if (income >= 180000) band = 'Top 5% of Australian earners';
    else if (income >= 135000) band = 'Top 15% of Australian earners';
    else if (income >= 100000) band = 'Top 30% of Australian earners';
    else if (income >= 73300) band = 'Above national median (50th–70th pct)';
    else if (income >= 50000) band = '25th–50th percentile nationally';

    root.querySelector('#bench-output').innerHTML = `
      <div class="calc-result-box" style="margin-bottom:12px">
        <div>
          <div style="font-size:11.5px;color:#43525e">Weekly Equivalent · ${escapeHtml(reg.name)}</div>
          <div class="calc-result-main num">${formatCurrencyAUD(weekly, 0)} / wk</div>
        </div>
        <div class="calc-result-meta">
          <div><strong>${escapeHtml(band)}</strong></div>
          <div class="num">${ratioState.toFixed(0)}% of ${reg.code} median · ${ratioNat.toFixed(0)}% of AU median</div>
        </div>
      </div>

      <div class="summary-strip" style="grid-template-columns:repeat(3,minmax(0,1fr));margin-bottom:10px">
        <div class="summary-box">
          <div class="summary-box-label">${reg.code} Median Annual</div>
          <div class="summary-box-val num">${formatCurrencyAUD(stateAnnualMedian, 0)}</div>
          <div class="summary-box-note">A$${reg.medianWeeklyAud}/wk</div>
        </div>
        <div class="summary-box">
          <div class="summary-box-label">${reg.code} Mean Dwelling</div>
          <div class="summary-box-val num">A$${reg.meanDwellingK.toLocaleString('en-AU')}k</div>
          <div class="summary-box-note">ABS 6432.0</div>
        </div>
        <div class="summary-box">
          <div class="summary-box-label">Price-to-Income</div>
          <div class="summary-box-val num" style="color:${priceToIncome > 10 ? '#c4512d' : '#0e5a5c'}">${priceToIncome.toFixed(1)}×</div>
          <div class="summary-box-note">${priceToIncome > 10 ? 'Severely stretched' : priceToIncome > 7 ? 'Elevated ratio' : 'Moderate ratio'}</div>
        </div>
      </div>

      <div class="method-box">
        <strong>Actionable context for ${escapeHtml(reg.name)}:</strong> At ${formatCurrencyAUD(income, 0)}/yr, a typical ${reg.code} dwelling (A$${reg.meanDwellingK}k) equals <strong>${priceToIncome.toFixed(1)}×</strong> gross single income (or ${(priceToIncome / 1.7).toFixed(1)}× for a 1.7-earner household). A 20% deposit equals <strong>${formatCurrencyAUD(reg.meanDwellingK * 200, 0)}</strong>.
      </div>
    `;
  };

  // 3. Comparison lab
  let latestComparison = null;
  const paintCompare = () => {
    const a = INDICATOR_MAP[root.querySelector('#cmp-a').value] || INDICATORS[0];
    const b = INDICATOR_MAP[root.querySelector('#cmp-b').value] || INDICATORS[1];

    const bMap = new Map(b.years.map((yr, idx) => [yr, b.values[idx]]));
    const commonYears = [];
    const rawA = [];
    const rawB = [];
    a.years.forEach((yr, idx) => {
      if (bMap.has(yr)) {
        commonYears.push(yr);
        rawA.push(a.values[idx]);
        rawB.push(bMap.get(yr));
      }
    });

    const baseA = Math.abs(rawA[0]) > 0.01 ? rawA[0] : 1;
    const baseB = Math.abs(rawB[0]) > 0.01 ? rawB[0] : 1;
    const idxA = rawA.map((v) => (v / baseA) * 100);
    const idxB = rawB.map((v) => (v / baseB) * 100);
    const r = pearsonR(rawA, rawB);

    const badge = root.querySelector('#cmp-corr-badge');
    badge.textContent = r === null ? 'Insufficient overlap' : `Pearson r = ${r >= 0 ? '+' : ''}${r.toFixed(2)} (${commonYears[0]}–${commonYears[commonYears.length - 1]}, n=${commonYears.length})`;

    const cfg = {
      years: commonYears,
      width: 1100,
      height: 230,
      ySuffix: '',
      series: [
        { name: `${a.shortTitle} (Index ${commonYears[0]}=100)`, color: '#0e5a5c', decimals: 1, values: idxA },
        { name: `${b.shortTitle} (Index ${commonYears[0]}=100)`, color: '#c4512d', decimals: 1, dashed: true, values: idxB },
      ],
      ariaLabel: `Normalized comparison of ${a.shortTitle} and ${b.shortTitle}`,
    };

    latestComparison = { a, b, commonYears, rawA, rawB, idxA, idxB };
    const stage = root.querySelector('#cmp-chart-stage');
    stage.innerHTML = renderMultiLineChartSvg(cfg);
    bindChartHover(stage, root.querySelector('#cmp-chart-readout'), cfg);
  };

  ['#tool-amt', '#tool-from', '#tool-to'].forEach((s) => {
    root.querySelector(s).addEventListener('input', paintInflation);
    root.querySelector(s).addEventListener('change', paintInflation);
  });
  ['#bench-income', '#bench-state'].forEach((s) => {
    root.querySelector(s).addEventListener('input', paintBenchmark);
    root.querySelector(s).addEventListener('change', paintBenchmark);
  });
  ['#cmp-a', '#cmp-b'].forEach((s) => {
    root.querySelector(s).addEventListener('change', paintCompare);
  });

  root.querySelector('#cmp-export-csv').addEventListener('click', () => {
    if (!latestComparison) return;
    const { a, b, commonYears, rawA, rawB, idxA, idxB } = latestComparison;
    exportRowsToCsv(`meridian-compare-${a.id}-vs-${b.id}.csv`, [
      { key: 'year', label: 'Year' },
      { key: 'rawA', label: `${a.shortTitle} (Raw)` },
      { key: 'idxA', label: `${a.shortTitle} (Base=100)` },
      { key: 'rawB', label: `${b.shortTitle} (Raw)` },
      { key: 'idxB', label: `${b.shortTitle} (Base=100)` },
    ], commonYears.map((yr, i) => ({
      year: yr,
      rawA: rawA[i],
      idxA: idxA[i].toFixed(2),
      rawB: rawB[i],
      idxB: idxB[i].toFixed(2),
    })));
  });

  paintInflation();
  paintBenchmark();
  paintCompare();
}
