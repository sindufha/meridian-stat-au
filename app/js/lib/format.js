// Formatting, HTML escaping, and client-side CSV/JSON export helpers.

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function formatNumber(value, decimals = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return Number(value).toLocaleString('en-AU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCurrencyAUD(value, decimals = 0) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return `A$${formatNumber(value, decimals)}`;
}

export function formatSignedPct(value, decimals = 1) {
  const n = Number(value);
  if (Number.isNaN(n)) return '—';
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(decimals)}%`;
}

export function formatMetricValue(value, unit) {
  const n = Number(value);
  if (Number.isNaN(n)) return '—';
  switch (unit) {
    case 'pct':
      return `${n.toFixed(1)}%`;
    case 'pct2':
      return `${n.toFixed(2)}%`;
    case 'signed-pct':
      return formatSignedPct(n, 1);
    case 'millions':
      return `${n.toFixed(2)}M`;
    case 'thousands':
      return `${formatNumber(n, 0)}k`;
    case 'aud':
      return formatCurrencyAUD(n, 0);
    case 'aud-k':
      return `A$${formatNumber(n, 0)}k`;
    case 'aud-bn':
      return `A$${formatNumber(n, 1)}B`;
    case 'years':
      return `${n.toFixed(1)} yrs`;
    case 'rate':
      return n.toFixed(2);
    default:
      return formatNumber(n, 1);
  }
}

export function triggerFileDownload(filename, mimeType, content) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportRowsToCsv(filename, columns, rows) {
  const escapeCell = (cell) => {
    const text = String(cell ?? '');
    return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  const header = columns.map((c) => escapeCell(c.label)).join(',');
  const body = rows.map((row) => columns.map((c) => escapeCell(row[c.key])).join(',')).join('\n');
  triggerFileDownload(filename, 'text/csv;charset=utf-8', `${header}\n${body}\n`);
}
