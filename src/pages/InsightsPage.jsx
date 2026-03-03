import { useState } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { IconChevronDown, IconArrowRight, IconInfo, IconStar, IconLock, IconBulb, IconShare, IconEllipsisVertical } from '../components/icons'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const HEADER_TABS = [
  'Retail',
  'Best sellers',
  'Business KPIs',
  'Assortment KPIs',
  'Data exploration',
  'Rebalance',
  'Replenishment',
  'Reorder',
]

const FILTER_ROW_1 = [
  { label: 'Customer lancel', active: false },
  { label: 'Date (Select)', active: false },
  { label: 'Department (Select)', active: false },
  { label: 'Sub department (Select)', active: false },
  { label: 'Season (Select)', active: false },
  { label: 'Gender (Select)', active: false },
  { label: 'Collection type (Select)', active: false },
  { label: 'Brand (Select)', active: false },
  { label: 'Color (Select)', active: false },
  { label: 'Product ID (Select)', active: false },
  { label: 'Product labels (Select)', active: false },
]

const FILTER_ROW_2 = [
  { label: 'Bestseller cohort (Select)', active: false },
  { label: 'Top N products (Select)', active: false },
  { label: 'Is assorted (Select)', active: false },
  { label: 'Region (Select)', active: false },
  { label: 'Country (Select)', active: false },
  { label: 'Location type (Select)', active: false },
  { label: 'Location (Select)', active: false },
  { label: 'Location attributes All selected', active: true },
  { label: 'Product attributes Product ID', active: true },
]

const FILTER_ROW_3 = [
  { label: 'Period attributes All selected', active: true },
  { label: 'Time granularity Weekly', active: true, showArrow: true },
]

const KPI_CARDS = [
  {
    title: 'Daily sales',
    value: '551',
    sub: 'Comparison vs previous period',
    period: 'Week of 23/02/2026',
    sparkline: [30, 45, 35, 55, 40, 60, 50],
  },
  {
    title: 'Sales WTD',
    value: '713',
    sub: 'Compared to last year same period',
    period: 'Week of 23/02/2026',
    sparkline: [20, 35, 50, 45, 55, 65, 70],
  },
  {
    title: 'Sales MTD',
    value: '12.79K',
    sub: 'Month to date performance',
    period: 'Feb 2026',
    sparkline: [10, 25, 40, 55, 70, 80, 85],
  },
  {
    title: 'Sales YTD',
    value: '25.65K',
    sub: 'Year to date summary',
    period: '2026',
    sparkline: [5, 15, 30, 45, 60, 75, 90],
  },
]

const SALES_TABLE_ROWS = [
  { dimension: 'Department', wtd: '2,150', wtdLy: '+162', wtdLyPct: '+0.22%', mtd: '28.5K', mtdLy: '-1,300', mtdLyPct: '-4.50%', ytd: '312K', ytdLy: '+8,200', ytdLyPct: '+2.70%' },
  { dimension: 'Product family', wtd: '1,890', wtdLy: '-189', wtdLyPct: '-10.00%', mtd: '24.2K', mtdLy: '+1,100', mtdLyPct: '+4.75%', ytd: '285K', ytdLy: '+12,400', ytdLyPct: '+4.55%' },
  { dimension: 'Apparel', wtd: '890', wtdLy: '+45', wtdLyPct: '+5.30%', mtd: '11.2K', mtdLy: '-220', mtdLyPct: '-1.93%', ytd: '134K', ytdLy: '+3,100', ytdLyPct: '+2.37%' },
  { dimension: 'Jewelry', wtd: '420', wtdLy: '-21', wtdLyPct: '-4.76%', mtd: '5.8K', mtdLy: '+180', mtdLyPct: '+3.21%', ytd: '72K', ytdLy: '+1,800', ytdLyPct: '+2.56%' },
  { dimension: 'Footwear', wtd: '580', wtdLy: '+12', wtdLyPct: '+2.11%', mtd: '6.9K', mtdLy: '-95', mtdLyPct: '-1.36%', ytd: '85K', ytdLy: '+2,200', ytdLyPct: '+2.66%' },
  { dimension: 'Homeware', wtd: '260', wtdLy: '+8', wtdLyPct: '+3.08%', mtd: '4.6K', mtdLy: '+120', mtdLyPct: '+2.67%', ytd: '21K', ytdLy: '+500', ytdLyPct: '+2.44%' },
]

const LINE_CHART_POINTS = [
  { ly: 40, ty: 35 },
  { ly: 55, ty: 60 },
  { ly: 45, ty: 50 },
  { ly: 70, ty: 75 },
  { ly: 60, ty: 65 },
  { ly: 80, ty: 85 },
  { ly: 75, ty: 90 },
]

const LOCATION_BARS = [
  { label: 'Store', value: 12.4, pct: 52 },
  { label: 'Online/Delivery', value: 11.5, pct: 48 },
]

const DEPARTMENT_BARS = [
  { label: 'Apparel', value: 8.2 },
  { label: 'Jewelry', value: 5.1 },
  { label: 'Footwear', value: 6.8 },
]

function Sparkline({ data }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 120
  const h = 32
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 4) - 2
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline fill="none" stroke="#155dfc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  )
}

function KPICard({ title, value, sub, period, sparkline }) {
  return (
    <div className="bg-white rounded-[14px] border border-[#e5e7eb] p-6 flex flex-col gap-2">
      <div className="text-sm font-medium text-[#4a5565]">{title}</div>
      <div className="text-[28px] font-normal tracking-tight text-[#0a0a0a]">{value}</div>
      <div className="text-xs text-[#6a7282]">{sub}</div>
      <div className="text-xs text-[#6a7282]">{period}</div>
      <div className="mt-auto pt-2">
        <Sparkline data={sparkline} />
      </div>
    </div>
  )
}

function PctCell({ value }) {
  const isNeg = value.startsWith('-')
  const isPos = value.startsWith('+') && parseFloat(value) !== 0
  return (
    <span className={isNeg ? 'text-red-500' : isPos ? 'text-[#1447e6]' : 'text-[#0a0a0a]'}>
      {value}
    </span>
  )
}

function SalesMap() {
  return (
    <div className="h-80 w-full">
      <ComposableMap projection="geoMercator" projectionConfig={{ scale: 120 }}>
        <ZoomableGroup center={[0, 20]}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name = geo.properties?.name || geo.properties?.admin || ''
                const highlight = ['United States of America', 'United States', 'Canada', 'China', 'Japan', 'United Kingdom', 'Germany', 'France', 'Brazil', 'Australia'].includes(name)
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={highlight ? '#ea580c' : '#f5f5f5'}
                    stroke="#e5e7eb"
                    strokeWidth={0.5}
                  />
                )
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  )
}

function FilterPill({ label, active, showArrow }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors shrink-0 ${
        active
          ? 'bg-[#4a5565] text-white'
          : 'bg-[#f3f3f5] text-[#0a0a0a] border border-[#e5e7eb] hover:bg-[#eeeeee]'
      }`}
    >
      {label}
      {active && showArrow && <IconArrowRight className="size-4 opacity-90" />}
    </button>
  )
}

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState('Business KPIs')

  return (
    <div className="bg-[#f5f5f5] min-h-full">
      {/* Header - white bar */}
      <header className="w-[calc(100%+4rem)] min-w-0 -ml-8 bg-white border-b border-[#e5e7eb]">
        <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-medium text-[#0a0a0a]">Insights</h1>
            <div className="flex items-center gap-1">
              <button type="button" className="relative group p-1.5 rounded text-[#6a7282] hover:bg-[#f5f5f5]" aria-label="Liveboard details">
                <IconInfo className="size-4" />
                <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2.5 py-1.5 text-xs font-medium text-white bg-[#12171e] rounded-[4px] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  Liveboard details
                </span>
              </button>
              <button type="button" className="relative group p-1.5 rounded text-[#6a7282] hover:bg-[#f5f5f5]" aria-label="Add to favourites">
                <IconStar className="size-4" />
                <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2.5 py-1.5 text-xs font-medium text-white bg-[#12171e] rounded-[4px] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  Add to favourites
                </span>
              </button>
              <button type="button" className="relative group p-1.5 rounded text-[#6a7282] hover:bg-[#f5f5f5]" aria-label="Request access">
                <IconLock className="size-4" />
                <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2.5 py-1.5 text-xs font-medium text-white bg-[#12171e] rounded-[4px] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  Request access
                </span>
              </button>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-6">
            {HEADER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-medium pb-1 border-b-2 transition-colors shrink-0 ${
                  activeTab === tab
                    ? 'text-[#0a0a0a] border-[#155dfc]'
                    : 'text-[#6a7282] border-transparent hover:text-[#0a0a0a]'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button type="button" className="h-10 px-4 rounded-lg border border-[#e5e7eb] bg-[#f3f3f5] text-[#4a5565] text-sm font-medium flex items-center gap-2 hover:bg-[#eeeeee] shrink-0">
              <IconBulb className="size-4" />
              All Highlights
            </button>
            <button type="button" className="size-10 rounded-lg flex items-center justify-center text-[#4a5565] hover:bg-[#f5f5f5] shrink-0" aria-label="Export">
              <IconShare className="size-5" />
            </button>
            <button type="button" className="size-10 rounded-lg flex items-center justify-center text-[#4a5565] hover:bg-[#f5f5f5] shrink-0" aria-label="More options">
              <IconEllipsisVertical className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Filter pills - 3 rows on white background */}
      <div className="w-[calc(100%+4rem)] min-w-0 -ml-8 bg-white px-8 py-4 border-b border-[#e5e7eb]">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {FILTER_ROW_1.map((pill) => (
              <FilterPill key={pill.label} label={pill.label} active={pill.active} showArrow={pill.showArrow} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTER_ROW_2.map((pill) => (
              <FilterPill key={pill.label} label={pill.label} active={pill.active} showArrow={pill.showArrow} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTER_ROW_3.map((pill) => (
              <FilterPill key={pill.label} label={pill.label} active={pill.active} showArrow={pill.showArrow} />
            ))}
          </div>
        </div>
      </div>

      <div className="pt-6 space-y-6">

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {KPI_CARDS.map((card) => (
          <KPICard key={card.title} {...card} />
        ))}
      </div>

      {/* Line chart */}
      <section className="bg-white border border-[#e5e7eb] rounded-[14px] p-6">
        <p className="text-sm text-[#6a7282] mb-4">
          Select the comparison period using &quot;Period&quot; and &quot;comparison&quot; menu.
        </p>
        <div className="flex justify-end gap-4 mb-4">
          <span className="flex items-center gap-2 text-sm text-[#4a5565]">
            <span className="w-8 h-0.5 bg-[#155dfc]" />
            LY
          </span>
          <span className="flex items-center gap-2 text-sm text-[#4a5565]">
            <span className="w-8 h-0.5 bg-[#8ec5ff]" />
            TY
          </span>
        </div>
        <div className="h-48 w-full">
          <svg viewBox="0 0 400 150" className="w-full h-full" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="#155dfc"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={LINE_CHART_POINTS.map((p, i) => `${(i / 6) * 380 + 10},${140 - (p.ly / 100) * 120}`).join(' ')}
            />
            <polyline
              fill="none"
              stroke="#8ec5ff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={LINE_CHART_POINTS.map((p, i) => `${(i / 6) * 380 + 10},${140 - (p.ty / 100) * 120}`).join(' ')}
            />
          </svg>
        </div>
        <div className="flex gap-4 mt-2 text-xs text-[#6a7282]">
          <span>Today</span>
          <span>Category [All]</span>
          <span>Daily</span>
        </div>
      </section>

      {/* Sales performance tables */}
      {[1, 2].map((n) => (
        <section key={n} className="bg-white border border-[#e5e7eb] rounded-[14px] overflow-hidden">
          <div className="p-6 border-b border-[#e5e7eb] flex items-center justify-between">
            <div>
              <h2 className="text-lg text-[#0a0a0a]">Sales performance</h2>
              <p className="text-sm text-[#6a7282]">Select the component comparison using &quot;Retail volume total&quot;</p>
            </div>
            <button type="button" className="text-sm text-[#155dfc] flex items-center gap-1">
              Legend
              <IconChevronDown className="size-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f5f5f5] border-b border-[#e5e7eb]">
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Dimension</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">WTD</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">WTD VS LY</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">WTD VS LY %</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">MTD</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">MTD VS LY</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">MTD VS LY %</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">YTD</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">YTD VS LY</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">YTD VS LY %</th>
                </tr>
              </thead>
              <tbody>
                {SALES_TABLE_ROWS.map((row) => (
                  <tr key={row.dimension} className="border-b border-[#e5e7eb] hover:bg-[#f0f0f0]">
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.dimension}</td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.wtd}</td>
                    <td className="py-2.5 px-4 text-right text-[#4a5565]">{row.wtdLy}</td>
                    <td className="py-2.5 px-4 text-right"><PctCell value={row.wtdLyPct} /></td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.mtd}</td>
                    <td className="py-2.5 px-4 text-right text-[#4a5565]">{row.mtdLy}</td>
                    <td className="py-2.5 px-4 text-right"><PctCell value={row.mtdLyPct} /></td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.ytd}</td>
                    <td className="py-2.5 px-4 text-right text-[#4a5565]">{row.ytdLy}</td>
                    <td className="py-2.5 px-4 text-right"><PctCell value={row.ytdLyPct} /></td>
                  </tr>
                ))}
                <tr className="bg-[#f5f5f5] font-medium border-b border-[#e5e7eb]">
                  <td className="py-3 px-4 text-[#0a0a0a]">TOTAL SALES</td>
                  <td className="py-3 px-4 text-right text-[#0a0a0a]">4,210</td>
                  <td className="py-3 px-4 text-right text-[#4a5565]">+215</td>
                  <td className="py-3 px-4 text-right"><PctCell value="+5.38%" /></td>
                  <td className="py-3 px-4 text-right text-[#0a0a0a]">52.1K</td>
                  <td className="py-3 px-4 text-right text-[#4a5565]">+2,100</td>
                  <td className="py-3 px-4 text-right"><PctCell value="+4.20%" /></td>
                  <td className="py-3 px-4 text-right text-[#0a0a0a]">608K</td>
                  <td className="py-3 px-4 text-right text-[#4a5565]">+28,400</td>
                  <td className="py-3 px-4 text-right"><PctCell value="+4.90%" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {/* World map */}
      <section className="bg-white border border-[#e5e7eb] rounded-[14px] overflow-hidden">
        <div className="p-6 border-b border-[#e5e7eb]">
          <h2 className="text-lg text-[#0a0a0a]">Sales YTD</h2>
        </div>
        <div className="relative">
          <div className="absolute left-4 top-4 z-10 flex flex-col gap-1">
            <button type="button" className="size-8 rounded-lg bg-white border border-[#e5e7eb] flex items-center justify-center text-[#4a5565] hover:bg-[#f0f0f0]">+</button>
            <button type="button" className="size-8 rounded-lg bg-white border border-[#e5e7eb] flex items-center justify-center text-[#4a5565] hover:bg-[#f0f0f0]">−</button>
          </div>
          <SalesMap />
          <div className="absolute right-4 bottom-4 flex items-center gap-2 text-xs text-[#6a7282]">
            <span>Low</span>
            <div className="w-24 h-2 rounded-full bg-gradient-to-r from-orange-200 via-orange-400 to-orange-700" />
            <span>High</span>
          </div>
        </div>
      </section>

      {/* Bar charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-[#e5e7eb] rounded-[14px] p-6">
          <h2 className="text-lg text-[#0a0a0a] mb-4">Sales by Location Type</h2>
          <div className="flex gap-8 items-end h-40">
            {LOCATION_BARS.map((bar) => (
              <div key={bar.label} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-sm font-medium text-[#0a0a0a]">{bar.pct}%</span>
                <div className="w-full flex justify-center">
                  <div
                    className="w-12 bg-[#155dfc] rounded-lg"
                    style={{ height: `${(bar.value / 14) * 120}px` }}
                  />
                </div>
                <span className="text-sm text-[#4a5565]">{bar.label}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="bg-white border border-[#e5e7eb] rounded-[14px] p-6">
          <h2 className="text-lg text-[#0a0a0a] mb-4">Sales by Department</h2>
          <div className="flex gap-6 items-end h-40">
            {DEPARTMENT_BARS.map((bar) => (
              <div key={bar.label} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-sm font-medium text-[#0a0a0a]">{bar.value}K</span>
                <div className="w-full flex justify-center">
                  <div
                    className="w-12 bg-[#155dfc] rounded-lg"
                    style={{ height: `${(bar.value / 9) * 120}px` }}
                  />
                </div>
                <span className="text-sm text-[#4a5565] truncate max-w-full">{bar.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
      </div>
    </div>
  )
}
