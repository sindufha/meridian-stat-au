// Pure zero-dependency SVG chart rendering primitives for Meridian.
// Supports sparklines, multi-series line/area charts with reference bands,
// horizontal comparison bar charts, and interactive pointer inspection.

import { escapeHtml } from './format.js';

export function renderSparklineSvg(values, color = '#0e5a5c') {
  if (!values || values.length < 2) return '';
  const w = 112;
  const h = 30;
  const pad = 3;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / span) * (h - pad * 2);
    return [x, y];
  });

  const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${(w - pad).toFixed(1)},${(h - pad).toFixed(1)} L${pad},${(h - pad).toFixed(1)} Z`;
  const [lastX, lastY] = points[points.length - 1];

  return `<svg class="kpi-spark" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <path d="${areaPath}" fill="${color}" fill-opacity="0.11"></path>
    <path d="${linePath}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    <circle cx="${lastX.toFixed(1)}" cy="${lastY.toFixed(1)}" r="2.8" fill="${color}"></circle>
  </svg>`;
}

export function renderMultiLineChartSvg(config) {
  const {
    years,
    series,
    width = 740,
    height = 248,
    ySuffix = '%',
    yPrefix = '',
    targetBand = null,
    zeroLine = false,
    annotations = [],
    showAreaOnFirst = true,
  } = config;

  const allValues = series.flatMap((s) => s.values.filter((v) => v !== null && v !== undefined));
  if (targetBand) {
    allValues.push(targetBand.min, targetBand.max);
  }
  if (zeroLine) allValues.push(0);

  let yMin = Math.min(...allValues);
  let yMax = Math.max(...allValues);
  const yPad = (yMax - yMin || 1) * 0.14;
  yMin = Math.floor((yMin - yPad) * 2) / 2;
  yMax = Math.ceil((yMax + yPad) * 2) / 2;
  if (yMin === yMax) {
    yMin -= 1;
    yMax += 1;
  }

  const needsWideLeft = yPrefix.length > 0 && Math.max(Math.abs(yMin), Math.abs(yMax)) >= 1000;
  const pad = { top: 22, right: needsWideLeft ? 74 : 64, bottom: 32, left: needsWideLeft ? 68 : 48 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const xAt = (idx) => pad.left + (years.length <= 1 ? plotW / 2 : (idx / (years.length - 1)) * plotW);
  const yAt = (val) => pad.top + plotH - ((val - yMin) / (yMax - yMin)) * plotH;

  const tickCount = 5;
  const yTicks = Array.from({ length: tickCount }, (_, i) => yMin + ((yMax - yMin) * i) / (tickCount - 1));

  // Build evenly spaced X ticks without colliding with the terminal year
  const xTickIndices = [];
  const step = years.length > 20 ? 5 : years.length > 12 ? 3 : years.length > 7 ? 2 : 1;
  for (let i = 0; i < years.length; i += step) {
    xTickIndices.push(i);
  }
  const lastIdx = years.length - 1;
  if (xTickIndices[xTickIndices.length - 1] !== lastIdx) {
    if (xAt(lastIdx) - xAt(xTickIndices[xTickIndices.length - 1]) < 36 && xTickIndices.length > 1) {
      xTickIndices[xTickIndices.length - 1] = lastIdx;
    } else {
      xTickIndices.push(lastIdx);
    }
  }

  let svg = `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(config.ariaLabel || 'Statistical trend chart')}">`;

  // Reference target band (e.g. RBA 2-3% inflation target)
  if (targetBand) {
    const bandTop = yAt(targetBand.max);
    const bandBottom = yAt(targetBand.min);
    const bandH = Math.max(1, bandBottom - bandTop);
    svg += `<rect x="${pad.left}" y="${bandTop.toFixed(1)}" width="${plotW}" height="${bandH.toFixed(1)}" fill="${targetBand.fill || '#0e5a5c'}" fill-opacity="0.10"></rect>`;
    svg += `<rect x="${pad.left + 6}" y="${(bandTop + 2).toFixed(1)}" width="136" height="14" rx="3" fill="#ffffff" fill-opacity="0.82"></rect>`;
    svg += `<text x="${pad.left + 10}" y="${(bandTop + 12.5).toFixed(1)}" font-size="10" font-weight="700" fill="#0e5a5c">${escapeHtml(targetBand.label)}</text>`;
  }

  // Horizontal gridlines and Y-axis ticks
  for (const tick of yTicks) {
    const y = yAt(tick);
    const isZero = Math.abs(tick) < 0.001;
    svg += `<line x1="${pad.left}" y1="${y.toFixed(1)}" x2="${width - pad.right}" y2="${y.toFixed(1)}" stroke="${isZero ? '#99a3ab' : '#e4e0d6'}" stroke-width="${isZero ? '1.3' : '1'}" stroke-dasharray="${isZero ? '' : '3,3'}"></line>`;
    const fmtTick = Math.abs(tick) >= 1000
      ? Math.round(tick).toLocaleString('en-AU')
      : Math.abs(tick) >= 100
        ? String(Math.round(tick))
        : tick.toFixed(1);
    const label = `${yPrefix}${fmtTick}${ySuffix}`;
    svg += `<text x="${pad.left - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="#647482">${escapeHtml(label)}</text>`;
  }

  // Optional zero reference line
  if (zeroLine && yMin < 0 && yMax > 0) {
    const zy = yAt(0);
    svg += `<line x1="${pad.left}" y1="${zy.toFixed(1)}" x2="${width - pad.right}" y2="${zy.toFixed(1)}" stroke="#6e7c87" stroke-width="1.4"></line>`;
  }

  // Vertical annotations with automatic horizontal collision avoidance
  const placedNotes = [];
  for (const note of annotations) {
    const idx = years.indexOf(note.year);
    if (idx === -1) continue;
    const x = xAt(idx);
    placedNotes.push({ x, label: note.label });
  }
  placedNotes.sort((a, b) => a.x - b.x);
  placedNotes.forEach((n, i) => {
    const prev = i > 0 ? placedNotes[i - 1] : null;
    const next = i < placedNotes.length - 1 ? placedNotes[i + 1] : null;
    let anchor = 'middle';
    let textX = n.x;
    if (next && next.x - n.x < 108) {
      anchor = 'end';
      textX = n.x - 4;
    } else if (prev && n.x - prev.x < 108) {
      anchor = 'start';
      textX = n.x + 4;
    }
    textX = Math.min(width - pad.right, Math.max(pad.left + 4, textX));
    svg += `<line x1="${n.x.toFixed(1)}" y1="${pad.top}" x2="${n.x.toFixed(1)}" y2="${height - pad.bottom}" stroke="#c6bfb0" stroke-width="1" stroke-dasharray="3,3"></line>`;
    svg += `<text x="${textX.toFixed(1)}" y="${pad.top - 6}" text-anchor="${anchor}" font-size="10.2" font-weight="600" fill="#52606d">${escapeHtml(n.label)}</text>`;
  });

  // X-axis labels
  xTickIndices.forEach((idx) => {
    const x = xAt(idx);
    svg += `<text x="${x.toFixed(1)}" y="${height - 9}" text-anchor="middle" font-size="11" fill="#52606d">${years[idx]}</text>`;
  });

  // Series paths + end-of-line direct labels
  const labelYs = [];
  series.forEach((s, sIdx) => {
    const pts = [];
    s.values.forEach((v, i) => {
      if (v !== null && v !== undefined) {
        pts.push({ i, v, x: xAt(i), y: yAt(v) });
      }
    });
    if (pts.length < 2) return;

    const lineD = pts.map((p, k) => `${k === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    if (showAreaOnFirst && sIdx === 0) {
      const baseY = zeroLine && yMin < 0 && yMax > 0 ? yAt(0) : height - pad.bottom;
      const areaD = `${lineD} L${pts[pts.length - 1].x.toFixed(1)},${baseY.toFixed(1)} L${pts[0].x.toFixed(1)},${baseY.toFixed(1)} Z`;
      svg += `<path d="${areaD}" fill="${s.color}" fill-opacity="0.08"></path>`;
    }

    const dash = s.dashed ? 'stroke-dasharray="5,4"' : '';
    svg += `<path d="${lineD}" fill="none" stroke="${s.color}" stroke-width="${sIdx === 0 ? '2.6' : '2.1'}" stroke-linecap="round" stroke-linejoin="round" ${dash}></path>`;

    // Data point dots for sparse series or terminal highlight
    if (pts.length <= 14) {
      for (const p of pts) {
        svg += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="#ffffff" stroke="${s.color}" stroke-width="1.8"></circle>`;
      }
    }
    const last = pts[pts.length - 1];
    svg += `<circle cx="${last.x.toFixed(1)}" cy="${last.y.toFixed(1)}" r="4.2" fill="${s.color}" stroke="#ffffff" stroke-width="1.6"></circle>`;

    // Avoid colliding end labels
    let labelY = last.y + 4;
    for (const prevY of labelYs) {
      if (Math.abs(labelY - prevY) < 15) {
        labelY = prevY + (labelY >= prevY ? 15 : -15);
      }
    }
    labelYs.push(labelY);
    const fmtLast = Math.abs(last.v) >= 1000
      ? Math.round(last.v).toLocaleString('en-AU')
      : last.v.toFixed(s.decimals ?? 1);
    const valStr = `${yPrefix}${fmtLast}${ySuffix}`;
    svg += `<text x="${(last.x + 8).toFixed(1)}" y="${labelY.toFixed(1)}" font-size="11.5" font-weight="700" fill="${s.color}">${escapeHtml(valStr)}</text>`;
  });

  // Interactive hover targets per year column
  const colW = years.length > 1 ? plotW / (years.length - 1) : plotW;
  years.forEach((yr, idx) => {
    const x = xAt(idx) - colW / 2;
    svg += `<rect class="chart-hit" data-idx="${idx}" x="${Math.max(pad.left, x).toFixed(1)}" y="${pad.top}" width="${colW.toFixed(1)}" height="${plotH}" fill="transparent" style="cursor:crosshair"></rect>`;
  });

  svg += `<line class="chart-cursor" x1="0" y1="${pad.top}" x2="0" y2="${height - pad.bottom}" stroke="#14212b" stroke-width="1" stroke-dasharray="2,2" opacity="0"></line>`;
  svg += `</svg>`;
  return svg;
}

export function bindChartHover(stageEl, readoutEl, config) {
  const svg = stageEl.querySelector('svg');
  const cursor = stageEl.querySelector('.chart-cursor');
  if (!svg || !readoutEl) return;

  const { years, series, ySuffix = '%', yPrefix = '' } = config;
  const setIndex = (idx) => {
    const yr = years[idx];
    const parts = series.map((s) => {
      const v = s.values[idx];
      const formatted = v === null || v === undefined ? '—' : `${yPrefix}${v.toFixed(s.decimals ?? 1)}${ySuffix}`;
      return `<span class="legend-item"><span class="legend-swatch" style="background:${s.color}"></span>${escapeHtml(s.name)}: <strong class="num">${escapeHtml(formatted)}</strong></span>`;
    });
    readoutEl.innerHTML = `<strong>${yr}</strong><span style="display:flex;flex-wrap:wrap;gap:12px">${parts.join('')}</span>`;
  };

  setIndex(years.length - 1);

  stageEl.querySelectorAll('.chart-hit').forEach((hit) => {
    hit.addEventListener('mouseenter', () => {
      const idx = Number(hit.dataset.idx);
      const x = Number(hit.getAttribute('x')) + Number(hit.getAttribute('width')) / 2;
      if (cursor) {
        cursor.setAttribute('x1', x.toFixed(1));
        cursor.setAttribute('x2', x.toFixed(1));
        cursor.setAttribute('opacity', '0.55');
      }
      setIndex(idx);
    });
  });

  svg.addEventListener('mouseleave', () => {
    if (cursor) cursor.setAttribute('opacity', '0');
    setIndex(years.length - 1);
  });
}

export function renderHorizontalBarsSvg(items, options = {}) {
  const { width = 560, suffix = '%', prefix = '', maxVal = null, highlightTop = true } = options;
  const hasSub = items.some((d) => Boolean(d.sub));
  const rowH = 28;
  const pad = { top: 8, right: hasSub ? 156 : 68, bottom: 8, left: 158 };
  const height = pad.top + pad.bottom + items.length * rowH;
  const barW = width - pad.left - pad.right;
  const ceiling = maxVal ?? Math.max(...items.map((d) => Math.abs(d.value)), 1) * 1.08;

  let svg = `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(options.ariaLabel || 'Breakdown bar chart')}">`;
  items.forEach((item, i) => {
    const y = pad.top + i * rowH;
    const w = Math.max(3, (Math.abs(item.value) / ceiling) * barW);
    const fill = item.color || (highlightTop && i === 0 ? '#c4512d' : '#0e5a5c');
    svg += `<text x="${pad.left - 8}" y="${y + 17}" text-anchor="end" font-size="11.5" font-weight="${i === 0 ? '700' : '500'}" fill="#243440">${escapeHtml(item.label)}</text>`;
    svg += `<rect x="${pad.left}" y="${y + 5}" width="${barW}" height="15" rx="3" fill="#ede9df"></rect>`;
    svg += `<rect x="${pad.left}" y="${y + 5}" width="${w.toFixed(1)}" height="15" rx="3" fill="${fill}"></rect>`;
    const valText = `${prefix}${item.value.toFixed(options.decimals ?? 1)}${suffix}`;
    svg += `<text x="${(pad.left + barW + 8).toFixed(1)}" y="${y + 17}" font-size="11.5" font-weight="700" fill="#14212b">${escapeHtml(valText)}</text>`;
    if (item.sub) {
      svg += `<text x="${width - 4}" y="${y + 17}" text-anchor="end" font-size="10.2" fill="#647482">${escapeHtml(item.sub)}</text>`;
    }
  });
  svg += `</svg>`;
  return svg;
}
