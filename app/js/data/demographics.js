// Demographic cohorts (2000 vs 2025), migration vs natural increase, and urban/regional aging.
// Sources: ABS Estimated Resident Population (Cat. 3101.0), Births (3301.0), Life Tables & AIHW.

export const DEMOGRAPHIC_HEADLINES = [
  { label: 'Total Population', value: '27.61M', note: '30 Jun 2025 · ABS 3101.0' },
  { label: 'National Median Age', value: '38.4 yrs', note: 'Up from 35.4 yrs in 2000' },
  { label: 'Total Fertility Rate', value: '1.50', note: '299,903 births · ABS 2025' },
  { label: 'Life Expectancy', value: '83.0 yrs', note: '81.1 M / 85.1 F · AIHW' },
];

// Shares (%) of total national population by 5-year age group and sex (sums to ~100% per year).
export const AGE_COHORTS = [
  { band: '85+',   m25: 0.92, f25: 1.46, m00: 0.42, f00: 0.91 },
  { band: '80–84', m25: 1.16, f25: 1.38, m00: 0.64, f00: 1.02 },
  { band: '75–79', m25: 1.74, f25: 1.92, m00: 1.08, f00: 1.44 },
  { band: '70–74', m25: 2.18, f25: 2.34, m00: 1.54, f00: 1.76 },
  { band: '65–69', m25: 2.52, f25: 2.66, m00: 1.81, f00: 1.92 },
  { band: '60–64', m25: 2.79, f25: 2.91, m00: 2.15, f00: 2.16 },
  { band: '55–59', m25: 2.86, f25: 2.96, m00: 2.62, f00: 2.56 },
  { band: '50–54', m25: 3.16, f25: 3.24, m00: 3.31, f00: 3.22 },
  { band: '45–49', m25: 3.04, f25: 3.10, m00: 3.55, f00: 3.54 },
  { band: '40–44', m25: 3.51, f25: 3.54, m00: 3.82, f00: 3.84 },
  { band: '35–39', m25: 3.74, f25: 3.76, m00: 3.92, f00: 3.94 },
  { band: '30–34', m25: 3.89, f25: 3.86, m00: 3.78, f00: 3.79 },
  { band: '25–29', m25: 3.68, f25: 3.58, m00: 3.86, f00: 3.81 },
  { band: '20–24', m25: 3.32, f25: 3.14, m00: 3.49, f00: 3.38 },
  { band: '15–19', m25: 3.02, f25: 2.86, m00: 3.58, f00: 3.42 },
  { band: '10–14', m25: 3.06, f25: 2.90, m00: 3.59, f00: 3.42 },
  { band: '5–9',   m25: 2.95, f25: 2.80, m00: 3.58, f00: 3.41 },
  { band: '0–4',   m25: 2.74, f25: 2.61, m00: 3.42, f00: 3.25 },
];

export const BROAD_AGE_GROUPS = [
  { label: '0–14 (Children)', pct2000: 20.7, pct2025: 17.1, note: 'Declining share as TFR fell to 1.50' },
  { label: '15–24 (Youth)', pct2000: 13.9, pct2025: 12.3, note: 'Supported by international students' },
  { label: '25–44 (Core Working)', pct2000: 30.7, pct2025: 29.6, note: 'Bolstered by skilled migration inflows' },
  { label: '45–64 (Mature Working)', pct2000: 23.1, pct2025: 23.9, note: 'Higher workforce retention past 60' },
  { label: '65+ (Older Australians)', pct2000: 12.4, pct2025: 17.9, note: 'Fastest-expanding structural cohort' },
];

export const CAPITAL_VS_REGIONAL_AGE = [
  { label: 'Darwin (NT)', value: 34.7, sub: 'Youngest capital', color: '#0e5a5c' },
  { label: 'Canberra (ACT)', value: 35.8, sub: 'Public & uni hub', color: '#0e5a5c' },
  { label: 'Brisbane (QLD)', value: 36.2, sub: 'Fast growth', color: '#0e5a5c' },
  { label: 'Melbourne (VIC)', value: 36.6, sub: 'Migration hub', color: '#0e5a5c' },
  { label: 'All Capital Cities', value: 37.0, sub: '68% of pop.', color: '#26547c' },
  { label: 'Sydney (NSW)', value: 37.4, sub: 'Largest city', color: '#26547c' },
  { label: 'Australia National', value: 38.4, sub: 'National median', color: '#b68420' },
  { label: 'Hobart (TAS)', value: 39.7, sub: 'Oldest capital', color: '#c4512d' },
  { label: 'Rest of Australia', value: 42.1, sub: 'Regional/rural', color: '#c4512d' },
];

export const GROWTH_COMPONENTS = {
  years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
  natural: [148, 151, 148, 154, 140, 136, 138, 131, 111, 106, 109],
  migration: [184, 206, 263, 238, 241, 193, -85, 204, 536, 446, 380],
};
