// Compact first-load dataset for the National Overview and global quick search.
// Full historical tables, regional geography, and demographic cohorts are lazy-loaded on demand.

export const EDITION_META = {
  country: 'Australia',
  edition: '2025–26 Statistical Compendium',
  updated: '2026-Q1 Reference Cut',
  agencies: ['ABS', 'RBA', 'DCCEEW', 'AIHW'],
};

export const HEADLINE_KPIS = [
  {
    id: 'population',
    label: 'Population (ERP)',
    value: '27.61M',
    delta: '+1.6% YoY',
    deltaTone: 'up',
    cardTone: 'teal',
    source: 'ABS ERP · Jun 2025',
    spark: [25.69, 25.69, 26.01, 26.64, 27.20, 27.61],
    sparkColor: '#0e5a5c',
    route: '#/indicator/population',
  },
  {
    id: 'gdp',
    label: 'Real GDP Growth',
    value: '+1.4%',
    delta: 'A$2.74T nom.',
    deltaTone: 'up',
    cardTone: 'slate',
    source: 'ABS Nat. Accts · 2025',
    spark: [-0.1, 2.0, 4.3, 3.6, 1.4, 1.4],
    sparkColor: '#26547c',
    route: '#/indicator/gdp',
  },
  {
    id: 'cpi',
    label: 'CPI Inflation',
    value: '3.4%',
    delta: 'Target 2–3%',
    deltaTone: 'warn',
    cardTone: 'ochre',
    source: 'ABS 6401.0 · 2024–25',
    spark: [1.2, 3.2, 7.1, 5.8, 3.4, 3.4],
    sparkColor: '#c4512d',
    route: '#/indicator/cpi',
  },
  {
    id: 'unemployment',
    label: 'Unemployment',
    value: '4.2%',
    delta: 'Part. 67.1%',
    deltaTone: 'neutral',
    cardTone: 'slate',
    source: 'ABS 6202.0 · 2025',
    spark: [6.4, 5.0, 3.7, 3.7, 4.0, 4.2],
    sparkColor: '#26547c',
    route: '#/indicator/unemployment',
  },
  {
    id: 'wpi',
    label: 'Wage Price Index',
    value: '+3.4%',
    delta: 'Annual WPI',
    deltaTone: 'up',
    cardTone: 'teal',
    source: 'ABS 6345.0 · 2025',
    spark: [1.4, 2.3, 3.3, 4.2, 3.5, 3.4],
    sparkColor: '#0e5a5c',
    route: '#/indicator/wpi',
  },
  {
    id: 'renewables',
    label: 'Renewable Power',
    value: '42.0%',
    delta: '+2.6 pp YoY',
    deltaTone: 'up',
    cardTone: 'green',
    source: 'DCCEEW / AEMO · 2025',
    spark: [27.7, 31.8, 35.9, 39.4, 39.8, 42.0],
    sparkColor: '#146c43',
    route: '#/indicator/renewables',
  },
];

export const OVERVIEW_YEARS = [
  2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009,
  2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019,
  2020, 2021, 2022, 2023, 2024, 2025,
];

export const OVERVIEW_CHARTS = {
  inflation: {
    id: 'inflation',
    tabLabel: 'Inflation vs Cash Rate',
    title: 'Consumer Price Inflation & RBA Cash Rate Target',
    source: 'ABS Consumer Price Index (Cat. 6401.0) · Reserve Bank of Australia (F1), 2000–2025',
    indicatorId: 'cpi',
    ySuffix: '%',
    targetBand: { min: 2, max: 3, label: 'RBA Target Band (2–3%)', fill: '#0e5a5c' },
    annotations: [
      { year: 2008, label: 'GFC 2008' },
      { year: 2020, label: 'COVID-19' },
      { year: 2022, label: 'CPI Peak 7.1%' },
    ],
    series: [
      {
        name: 'Headline CPI YoY',
        color: '#c4512d',
        decimals: 1,
        values: [5.1, 4.6, 3.0, 2.8, 2.4, 2.7, 3.7, 2.5, 4.7, 1.8, 3.1, 3.6, 1.8, 2.4, 2.5, 1.5, 1.4, 2.0, 1.9, 1.7, 1.2, 3.2, 7.1, 5.8, 3.4, 3.4],
      },
      {
        name: 'RBA Cash Rate (Dec)',
        color: '#0e5a5c',
        decimals: 2,
        dashed: true,
        values: [6.25, 4.25, 4.75, 5.25, 5.25, 5.50, 6.25, 6.75, 4.25, 3.75, 4.75, 4.25, 3.00, 2.50, 2.50, 2.00, 1.50, 1.50, 1.50, 0.75, 0.10, 0.10, 3.10, 4.35, 4.35, 3.60],
      },
    ],
  },
  growth: {
    id: 'growth',
    tabLabel: 'GDP & Unemployment',
    title: 'Real GDP Annual Growth & National Unemployment Rate',
    source: 'ABS National Accounts (Cat. 5206.0) · ABS Labour Force (Cat. 6202.0), 2000–2025',
    indicatorId: 'gdp',
    ySuffix: '%',
    zeroLine: true,
    annotations: [
      { year: 2020, label: 'Pandemic Shock' },
      { year: 2022, label: 'Rebound +4.3%' },
    ],
    series: [
      {
        name: 'Real GDP Growth',
        color: '#26547c',
        decimals: 1,
        values: [3.9, 2.0, 4.0, 3.1, 4.2, 3.2, 2.8, 3.8, 3.6, 1.9, 2.2, 2.4, 3.9, 2.6, 2.6, 2.2, 2.8, 2.3, 2.9, 2.2, -0.1, 2.0, 4.3, 3.6, 1.4, 1.4],
      },
      {
        name: 'Unemployment Rate',
        color: '#c4512d',
        decimals: 1,
        dashed: true,
        values: [6.3, 6.8, 6.4, 5.9, 5.4, 5.0, 4.8, 4.4, 4.2, 5.6, 5.2, 5.1, 5.2, 5.7, 6.1, 6.1, 5.7, 5.6, 5.3, 5.1, 6.4, 5.0, 3.7, 3.7, 4.0, 4.2],
      },
    ],
  },
  wages: {
    id: 'wages',
    tabLabel: 'Wages vs CPI',
    title: 'Wage Price Index Growth vs Consumer Price Inflation',
    source: 'ABS Wage Price Index (Cat. 6345.0) · ABS CPI (Cat. 6401.0), 2005–2025',
    indicatorId: 'wpi',
    startIndex: 5,
    ySuffix: '%',
    annotations: [
      { year: 2022, label: 'Real Wage Squeeze' },
      { year: 2024, label: 'Real Wage Parity' },
    ],
    series: [
      {
        name: 'Wage Price Index YoY',
        color: '#0e5a5c',
        decimals: 1,
        values: [null, null, null, null, null, 4.1, 4.0, 4.1, 4.2, 3.4, 3.6, 3.7, 3.6, 2.8, 2.6, 2.3, 2.0, 2.0, 2.2, 2.3, 1.4, 2.3, 3.3, 4.2, 3.5, 3.4],
      },
      {
        name: 'Headline CPI YoY',
        color: '#c4512d',
        decimals: 1,
        dashed: true,
        values: [null, null, null, null, null, 2.7, 3.7, 2.5, 4.7, 1.8, 3.1, 3.6, 1.8, 2.4, 2.5, 1.5, 1.4, 2.0, 1.9, 1.7, 1.2, 3.2, 7.1, 5.8, 3.4, 3.4],
      },
    ],
  },
  energy: {
    id: 'energy',
    tabLabel: 'Clean Energy',
    title: 'Renewable Share of Total Australian Electricity Generation',
    source: 'DCCEEW Australian Energy Statistics · AEMO NEM & WEM Reports, 2010–2025',
    indicatorId: 'renewables',
    startIndex: 10,
    ySuffix: '%',
    annotations: [
      { year: 2018, label: 'Solar Surge' },
      { year: 2025, label: '42.0% Grid Share' },
    ],
    series: [
      {
        name: 'Renewables Share (%)',
        color: '#146c43',
        decimals: 1,
        values: [null, null, null, null, null, null, null, null, null, null, 9.6, 10.6, 12.1, 14.8, 13.5, 14.0, 16.9, 16.4, 20.4, 24.0, 27.7, 31.8, 35.9, 39.4, 39.8, 42.0],
      },
    ],
  },
};

// Chain-linked annual CPI index (Base 2000 = 100.0) derived directly from official ABS annual rates.
export const CPI_INDEX_BY_YEAR = {
  2000: 100.0, 2001: 104.6, 2002: 107.7, 2003: 110.8, 2004: 113.4,
  2005: 116.5, 2006: 120.8, 2007: 123.8, 2008: 129.6, 2009: 132.0,
  2010: 136.1, 2011: 141.0, 2012: 143.5, 2013: 146.9, 2014: 150.6,
  2015: 152.9, 2016: 155.0, 2017: 158.1, 2018: 161.1, 2019: 163.9,
  2020: 165.8, 2021: 171.1, 2022: 183.3, 2023: 193.9, 2024: 200.5,
  2025: 207.3,
};

export const LATEST_BULLETINS = [
  {
    code: 'ABS 3101.0',
    date: 'Dec 2025',
    title: 'National, State and Territory Population reaches 27.61M',
    route: '#/indicator/population',
  },
  {
    code: 'ABS 6401.0',
    date: 'Jan 2026',
    title: 'Consumer Price Index: Housing (+5.7%) leads basket inflation',
    route: '#/indicator/cpi',
  },
  {
    code: 'RBA F1',
    date: 'Dec 2025',
    title: 'Monetary Policy: Cash rate target lowered to 3.60%',
    route: '#/indicator/cash-rate',
  },
  {
    code: 'DCCEEW 2025',
    date: 'Feb 2026',
    title: 'Renewable generation climbs to 42.0% of grid output',
    route: '#/indicator/renewables',
  },
];

export const TOPIC_DIRECTORY = [
  { name: 'Economy & GDP', stat: '+1.4% real · A$2.74T', route: '#/indicator/gdp' },
  { name: 'Prices & CPI', stat: '3.4% YoY · 11 groups', route: '#/indicator/cpi' },
  { name: 'Labour & Wages', stat: '4.2% unemp · +3.4% WPI', route: '#/indicator/unemployment' },
  { name: 'States & Housing', stat: '8 jurisdictions mapped', route: '#/regions' },
  { name: 'Demographics', stat: 'Median age 38.4 yrs', route: '#/demographics' },
  { name: 'Energy & Trade', stat: '42% clean · +A$6.9B bal', route: '#/indicator/renewables' },
];

export const SEARCH_INDEX = [
  { title: 'Consumer Price Index (CPI)', meta: 'Prices · ABS 6401.0 · 2024–25', val: '3.4%', route: '#/indicator/cpi', terms: 'cpi inflation prices cost of living basket housing food' },
  { title: 'Real Gross Domestic Product (GDP)', meta: 'Economy · ABS 5206.0 · 2025', val: '+1.4%', route: '#/indicator/gdp', terms: 'gdp economy growth national accounts output' },
  { title: 'Unemployment & Participation Rate', meta: 'Labour · ABS 6202.0 · 2025', val: '4.2%', route: '#/indicator/unemployment', terms: 'unemployment jobs labour force participation employment' },
  { title: 'Wage Price Index (WPI)', meta: 'Labour · ABS 6345.0 · 2025', val: '+3.4%', route: '#/indicator/wpi', terms: 'wages salary earnings wpi income pay' },
  { title: 'RBA Cash Rate Target', meta: 'Monetary · RBA F1 · 2025', val: '3.60%', route: '#/indicator/cash-rate', terms: 'rba cash rate interest rates monetary policy reserve bank' },
  { title: 'Estimated Resident Population', meta: 'Demographics · ABS 3101.0 · 2025', val: '27.61M', route: '#/indicator/population', terms: 'population erp residents people growth' },
  { title: 'Renewable Electricity Share', meta: 'Energy · DCCEEW / AEMO · 2025', val: '42.0%', route: '#/indicator/renewables', terms: 'renewables solar wind clean energy electricity grid' },
  { title: 'International Trade Balance', meta: 'Trade · ABS 5368.0 · 2025', val: '+A$6.9B', route: '#/indicator/trade', terms: 'trade exports imports surplus iron ore lng' },
  { title: 'Mean Residential Dwelling Value', meta: 'Housing · ABS 6432.0 · 2025', val: 'A$1.02M', route: '#/indicator/dwellings', terms: 'housing dwelling home price real estate property' },
  { title: 'Total Fertility Rate & Births', meta: 'Demographics · ABS 3301.0 · 2025', val: '1.50', route: '#/indicator/fertility', terms: 'fertility births babies tfr demographic' },
  { title: 'Life Expectancy at Birth', meta: 'Health · ABS / AIHW · 2024', val: '83.0 yrs', route: '#/indicator/life-expectancy', terms: 'life expectancy longevity health mortality' },
  { title: 'Net Overseas Migration', meta: 'Demographics · ABS 3412.0 · 2025', val: '+380k', route: '#/indicator/migration', terms: 'migration immigration overseas natural increase' },
  { title: 'New South Wales (NSW)', meta: 'State · Sydney · 8.67M pop', val: 'GSP +0.9%', route: '#/regions?code=NSW', terms: 'nsw new south wales sydney state region' },
  { title: 'Victoria (VIC)', meta: 'State · Melbourne · 7.15M pop', val: 'GSP +1.1%', route: '#/regions?code=VIC', terms: 'vic victoria melbourne state region' },
  { title: 'Queensland (QLD)', meta: 'State · Brisbane · 5.74M pop', val: 'GSP +2.2%', route: '#/regions?code=QLD', terms: 'qld queensland brisbane state region' },
  { title: 'Western Australia (WA)', meta: 'State · Perth · 3.10M pop', val: 'GSP +1.3%', route: '#/regions?code=WA', terms: 'wa western australia perth mining state region' },
  { title: 'South Australia (SA)', meta: 'State · Adelaide · 1.92M pop', val: 'GSP +1.0%', route: '#/regions?code=SA', terms: 'sa south australia adelaide state region' },
  { title: 'Tasmania (TAS)', meta: 'State · Hobart · 581k pop', val: 'GSP +1.0%', route: '#/regions?code=TAS', terms: 'tas tasmania hobart state region' },
  { title: 'Australian Capital Territory (ACT)', meta: 'Territory · Canberra · 490k pop', val: 'GSP +3.5%', route: '#/regions?code=ACT', terms: 'act canberra capital territory region' },
  { title: 'Northern Territory (NT)', meta: 'Territory · Darwin · 269k pop', val: 'GSP +1.0%', route: '#/regions?code=NT', terms: 'nt northern territory darwin region' },
  { title: 'Population Pyramid & Age Cohorts', meta: 'Demographics · 2000 vs 2025', val: '38.4 yrs', route: '#/demographics', terms: 'pyramid age sex cohorts aging elderly median age' },
  { title: 'Inflation & Wage Benchmark Tools', meta: 'Calculators · ABS CPI 2000–2025', val: '3 tools', route: '#/tools', terms: 'calculator inflation purchasing power wage benchmark compare' },
  { title: 'Statistical Releases & Methodology', meta: 'Catalog · Official Bulletins', val: '12 bulletins', route: '#/releases', terms: 'releases calendar methodology glossary sources definitions' },
];
