// Official Statistical Release Calendar, Methodological Glossary, and Primary Agencies.

export const RELEASE_CALENDAR = [
  { date: '2026-02-26', agency: 'ABS', code: 'ABS 6401.0', domain: 'Prices', title: 'Consumer Price Index, Australia — Annual Basket Re-Weighting', period: '2024–25 / Q4', route: '#/indicator/cpi' },
  { date: '2026-02-18', agency: 'ABS', code: 'ABS 6345.0', domain: 'Labour', title: 'Wage Price Index, Australia — Private & Public Sector Pay', period: 'Q4 2025', route: '#/indicator/wpi' },
  { date: '2026-02-12', agency: 'DCCEEW', code: 'AES 2025', domain: 'Energy & Trade', title: 'Australian Energy Statistics — Renewable Share Hits 42%', period: 'CY 2025', route: '#/indicator/renewables' },
  { date: '2026-01-29', agency: 'ABS', code: 'ABS 5368.0', domain: 'Energy & Trade', title: 'International Trade: Goods and Services Annual Balance', period: 'CY 2025', route: '#/indicator/trade' },
  { date: '2026-01-22', agency: 'ABS', code: 'ABS 6202.0', domain: 'Labour', title: 'Labour Force, Australia — Participation & Unemployment', period: 'Dec 2025', route: '#/indicator/unemployment' },
  { date: '2025-12-18', agency: 'ABS', code: 'ABS 3101.0', domain: 'Demographics', title: 'National, State and Territory Population (27.61M ERP)', period: 'Jun 2025', route: '#/indicator/population' },
  { date: '2025-12-11', agency: 'RBA', code: 'RBA Table F1', domain: 'Economy', title: 'Statement on Monetary Policy — Cash Rate at 3.60%', period: 'Dec 2025', route: '#/indicator/cash-rate' },
  { date: '2025-12-04', agency: 'ABS', code: 'ABS 5206.0', domain: 'Economy', title: 'Australian National Accounts: National Income & Expenditure', period: 'FY 2024–25', route: '#/indicator/gdp' },
  { date: '2025-11-28', agency: 'ABS', code: 'ABS 5220.0', domain: 'Economy', title: 'Australian National Accounts: State Accounts (GSP)', period: 'FY 2024–25', route: '#/regions' },
  { date: '2025-11-19', agency: 'ABS', code: 'ABS 6432.0', domain: 'Housing', title: 'Total Value of Dwellings — Eight Capital Cities & States', period: 'Q3 2025', route: '#/indicator/dwellings' },
  { date: '2025-10-24', agency: 'ABS', code: 'ABS 3301.0', domain: 'Demographics', title: 'Births, Australia — Total Fertility Rate & Regional Births', period: 'CY 2025', route: '#/indicator/fertility' },
  { date: '2025-10-09', agency: 'AIHW', code: 'ABS / AIHW', domain: 'Demographics', title: 'National Life Tables & Mortality Trends (83.0 Years)', period: '2022–2024', route: '#/indicator/life-expectancy' },
];

export const GLOSSARY_TERMS = [
  {
    term: 'Chain Volume Measure (Real GDP / GSP)',
    agency: 'ABS 5206.0',
    definition: 'Adjusts current-price economic output using annually chained price deflators so growth rates capture pure changes in the real volume of goods and services produced.',
  },
  {
    term: 'Trimmed Mean vs Headline CPI',
    agency: 'ABS 6401.0 / RBA',
    definition: 'Headline CPI reflects all 87 expenditure classes across Australia’s eight capital cities; Trimmed Mean strips the 15% largest and 15% smallest price movements to expose underlying inflation.',
  },
  {
    term: 'ILO Unemployment & Underemployment',
    agency: 'ABS 6202.0',
    definition: 'Unemployed persons are aged 15+, not working, actively seeking work, and available to start. Underemployed persons are employed part-time or full-time who want and are available for additional hours.',
  },
  {
    term: 'Wage Price Index (WPI)',
    agency: 'ABS 6345.0',
    definition: 'Tracks quarterly changes in hourly pay rates (excluding bonuses) across a constant sample of matched jobs so compositional workforce shifts do not distort measured wage inflation.',
  },
  {
    term: 'Estimated Resident Population (ERP)',
    agency: 'ABS 3101.0',
    definition: 'Australia’s official population count anchored to the five-yearly Census and updated quarterly for natural increase (births minus deaths) and Net Overseas Migration (12/16-month rule).',
  },
  {
    term: 'Renewable Electricity Share',
    agency: 'DCCEEW / AEMO',
    definition: 'Combined generation from wind, utility-scale solar, distributed rooftop solar PV, hydro, and bioenergy as a percentage of total electricity produced across Australia’s grids.',
  },
];
