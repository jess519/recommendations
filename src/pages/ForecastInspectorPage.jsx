import { useState } from 'react'
import { ComposedChart, Bar, Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { IconChevronDown, IconStar, IconBulb, IconShare, IconEllipsisVertical } from '../components/icons'

const FORECAST_TABS = [
  'Products',
  'Locations',
  'Forecast',
  'Seasonality profiles',
  'Initial Sales Rate',
  'Config',
  'Size Profiles',
  'Forecast alert',
]

const FILTER_ROW_1 = [
  { label: 'Select view', active: false },
  { label: 'Customer lunettes pour tous', active: true },
  { label: 'Calendar date (Select)', active: false },
  { label: 'Department (Select)', active: false },
  { label: 'Sub department (Select)', active: false },
  { label: 'Gender (Select)', active: false },
  { label: 'Brand (Select)', active: false },
  { label: 'Season (Select)', active: false },
  { label: 'Event (Select)', active: false },
  { label: 'Product ID (Select)', active: false },
  { label: 'Region (Select)', active: false },
]

const FILTER_ROW_2 = [
  { label: 'Country (Select)', active: false },
  { label: 'Location ID (Select)', active: false },
  { label: 'Location (Select)', active: false },
  { label: 'Location type (Select)', active: false },
  { label: 'System is assorted (Select)', active: false },
  { label: 'Inventory available in warehouse (Select)', active: false },
  { label: 'Product attributes Sub Department', active: true },
]

const FORECAST_CHART_LEGEND = [
  { label: 'Actual sales', color: '#2563eb' },
  { label: 'Adjusted sales', color: '#7dd3fc' },
  { label: 'Drop sales', color: '#1e40af' },
  { label: 'Event', color: '#facc15' },
  { label: 'Event sales', color: '#1e40af' },
  { label: 'Expected demand', color: '#fcd34d' },
  { label: 'Forecast', color: '#7dd3fc' },
  { label: 'Lost sales', color: '#1e40af' },
  { label: 'Outage sales', color: '#7dd3fc' },
  { label: 'Peak sales', color: '#7dd3fc' },
  { label: 'Sales rate', color: '#7dd3fc' },
  { label: 'Seasonality', color: '#fcd34d' },
  { label: 'Stockout', color: '#1e40af' },
]

function generateForecastChartData() {
  const data = []
  const start = new Date(2020, 11, 28)
  for (let i = 0; i < 70; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i * 7)
    const day = String(d.getDate()).padStart(2, '0')
    const mon = d.toLocaleDateString('en', { month: 'short' })
    const yy = String(d.getFullYear()).slice(-2)
    const dateStr = `${day}-${mon}-${yy}`
    const t = i / 70
    const expectedDemand = 70000 + Math.sin(t * 4) * 5000 + (1 - t) * 3000
    const actualSales = 85000 - t * 55000 + t * t * 25000 + Math.sin(t * 6) * 8000
    const forecast = Math.max(20000, actualSales * 0.95 + (i % 7) * 600)
    const salesRate = 0.1 + t * 0.25 + Math.sin(t * 3) * 0.15
    const seasonality = 0.3 + Math.sin(t * 2 * Math.PI) * 0.4
    data.push({
      date: dateStr,
      expectedDemand: Math.round(expectedDemand),
      actualSales: Math.round(actualSales),
      forecast: Math.round(forecast),
      salesRate: Math.round(salesRate * 100) / 100,
      seasonality: Math.round(seasonality * 100) / 100,
    })
  }
  return data
}

const FORECAST_CHART_DATA = generateForecastChartData()

const SUB_DEPARTMENTS = [
  { key: 'ankleBoots', label: 'Ankle boots', color: '#2563eb' },
  { key: 'bags', label: 'Bags', color: '#eab308' },
  { key: 'ballerinas', label: 'Ballerinas', color: '#16a34a' },
  { key: 'belts', label: 'Belts', color: '#9333ea' },
  { key: 'boots', label: 'Boots', color: '#ea580c' },
  { key: 'exoticShoes', label: 'Exotic shoes', color: '#0ea5e9' },
  { key: 'home', label: 'Home', color: '#0d9488' },
  { key: 'leatherSole', label: 'Leather sole', color: '#22c55e' },
  { key: 'limitedEdition', label: 'Limited edition', color: '#facc15' },
  { key: 'loafers', label: 'Loafers', color: '#a855f7' },
  { key: 'other', label: 'Other', color: '#14b8a6' },
  { key: 'pumps', label: 'Pumps', color: '#1d4ed8' },
  { key: 'rubberSole', label: 'Rubber sole', color: '#15803d' },
  { key: 'samples', label: 'Samples', color: '#a16207' },
  { key: 'sandals', label: 'Sandals', color: '#0f766e' },
  { key: 'slg', label: 'Slg', color: '#6b21a8' },
  { key: 'slippers', label: 'Slippers', color: '#c2410c' },
  { key: 'sneakers', label: 'Sneakers', color: '#64748b' },
  { key: 'usMensShoes', label: "US men's shoes", color: '#2dd4bf' },
]

function generateForecastBySubDeptData() {
  const data = []
  for (let m = 2; m <= 12; m++) {
    const d = new Date(2026, m, 1)
    const dateStr = d.toLocaleDateString('en', { month: 'short', year: 'numeric' })
    const row = { date: dateStr, monthIdx: m }
    SUB_DEPARTMENTS.forEach(({ key }) => {
      row[key] = 0
    })
    const t = (m - 2) / 10
    row.ankleBoots = Math.round(800 + 1600 * Math.exp(-Math.pow(t - 0.4, 2) * 8) + 2000 * Math.exp(-Math.pow(t - 0.9, 2) * 6))
    row.bags = Math.round(600 + 1200 * Math.exp(-Math.pow(t - 0.4, 2) * 6) + 1400 * Math.exp(-Math.pow(t - 0.9, 2) * 5))
    row.ballerinas = Math.round(80 + 120 * Math.sin(t * 3) + (m - 4) * 15)
    row.belts = Math.round(120 + 80 * Math.sin(t * 2))
    row.boots = Math.round(200 - 50 * t + 100 * Math.sin(t * 4))
    row.exoticShoes = Math.round(150 + 80 * Math.cos(t * 5))
    row.home = Math.round(90 + 60 * Math.sin(t * 2.5))
    row.leatherSole = Math.round(180 + 100 * Math.sin(t * 3))
    row.limitedEdition = Math.round(70 + 50 * Math.cos(t * 4))
    row.loafers = Math.round(220 + 120 * Math.sin(t * 2))
    row.other = Math.round(100 + 40 * (m % 3))
    row.pumps = Math.round(250 + 150 * Math.sin(t * 1.5))
    row.rubberSole = Math.round(160 + 90 * Math.cos(t * 2))
    row.samples = Math.round(50 + 30 * (m % 2))
    row.sandals = Math.round(300 - 80 * t + 100 * Math.sin(t * 3))
    row.slg = Math.round(140 + 80 * Math.sin(t * 2.2))
    row.slippers = Math.round(110 + 70 * Math.cos(t * 3))
    row.sneakers = Math.round(190 + 100 * Math.sin(t * 1.8))
    row.usMensShoes = Math.round(130 + 60 * Math.sin(t * 2.8))
    data.push(row)
  }
  return data
}

const FORECAST_BY_SUBDEPT_DATA = generateForecastBySubDeptData()

const ADJUSTMENT_STATS = [
  { label: 'Adjusted %', value: '94.75%', barColor: 'green', barWidth: 94.75 },
  { label: 'Stockout %', value: '21.63%', barColor: 'green', barWidth: 21.63 },
  { label: 'Lost sales %', value: '2.15%', barColor: 'green', barWidth: 2.15 },
  { label: 'Outage %', value: '0.00%', barColor: 'green', barWidth: 0 },
  { label: 'Peak %', value: '7.62%', barColor: 'pink', barWidth: 7.62 },
  { label: 'Drop %', value: '0.21%', barColor: 'yellow', barWidth: 0.21 },
  { label: 'Events', value: '{Null}', barColor: null, barWidth: 0 },
  { label: 'Event sales %', value: '0.00%', barColor: 'green', barWidth: 0 },
]

function IconCheckGreen() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 text-emerald-500">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
      <path d="M6 10l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FilterPill({ label, active }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors shrink-0 ${
        active ? 'bg-[#4a5565] text-white' : 'bg-[#f3f3f5] text-[#0a0a0a] border border-[#e5e7eb] hover:bg-[#eeeeee]'
      }`}
    >
      {label}
      {label.includes('(Select)') && <IconChevronDown className="size-4 opacity-70" />}
    </button>
  )
}

function PercentBar({ value, barColor, barWidth }) {
  if (barColor === null) return null
  const colors = { green: 'bg-green-500', pink: 'bg-pink-500', yellow: 'bg-amber-400' }
  return (
    <div className="mt-1 h-1.5 w-full max-w-[80px] bg-[#e5e7eb] rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${colors[barColor] || colors.green}`}
        style={{ width: `${Math.min(barWidth, 100)}%` }}
      />
    </div>
  )
}

export default function ForecastInspectorPage() {
  const [activeTab, setActiveTab] = useState('Forecast')

  return (
    <div className="bg-[#f5f5f5] min-h-full">
      {/* Header - white bar */}
      <header className="w-[calc(100%+4rem)] min-w-0 -ml-8 bg-white border-b border-[#e5e7eb]">
        <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-4">
          <div className="flex items-center gap-2">
            <IconCheckGreen />
            <h1 className="text-xl font-medium text-[#0a0a0a]">Forecast Inspector</h1>
            <div className="flex items-center gap-1">
              <button type="button" className="p-1.5 rounded text-[#6a7282] hover:bg-[#f5f5f5]" aria-label="Add to favourites">
                <IconStar className="size-4" />
              </button>
            </div>
            <div className="w-px h-6 bg-[#e5e7eb]" />
          </div>

          <nav className="flex flex-wrap items-center gap-6">
            {FORECAST_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-medium pb-1 border-b-2 transition-colors shrink-0 ${
                  activeTab === tab ? 'text-[#0a0a0a] border-[#155dfc]' : 'text-[#6a7282] border-transparent hover:text-[#0a0a0a]'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button type="button" className="h-10 px-4 rounded-lg border border-[#e5e7eb] bg-[#f3f3f5] text-[#4a5565] text-sm font-medium flex items-center gap-2 hover:bg-[#eeeeee] shrink-0">
              <IconBulb className="size-4" />
              AI Highlights
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

      {/* Filter pills */}
      <div className="w-[calc(100%+4rem)] min-w-0 -ml-8 bg-white px-8 py-4 border-b border-[#e5e7eb]">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {FILTER_ROW_1.map((pill) => (
              <FilterPill key={pill.label} label={pill.label} active={pill.active} />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {FILTER_ROW_2.map((pill) => (
              <FilterPill key={pill.label} label={pill.label} active={pill.active} />
            ))}
          </div>
        </div>
      </div>

      {/* Content cards */}
      <div className="pt-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
          {/* Adjustment stats - left */}
          <section className="bg-white rounded-[14px] border border-[#e5e7eb] overflow-hidden">
            <div className="p-6 border-b border-[#e5e7eb]">
              <h2 className="text-lg font-medium text-[#0a0a0a]">Adjustment stats</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f5f5f5] border-b border-[#e5e7eb]">
                    <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Adjusted %</th>
                    <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Stockout %</th>
                    <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Lost sales %</th>
                    <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Outage %</th>
                    <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Peak %</th>
                    <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Drop %</th>
                    <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Events</th>
                    <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Event sales %</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#e5e7eb]">
                    {ADJUSTMENT_STATS.map((stat, i) => (
                      <td key={i} className="py-2.5 px-4">
                        <div className="text-[#0a0a0a]">{stat.value}</div>
                        <PercentBar value={stat.value} barColor={stat.barColor} barWidth={stat.barWidth} />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 border-t border-[#e5e7eb] text-xs text-[#6a7282]">
              Showing 1 of 1 row
            </div>
          </section>

          {/* Sales to forecast ratio - right */}
          <section className="bg-white rounded-[14px] border border-[#e5e7eb] p-6 flex flex-col items-center justify-center">
            <h2 className="text-lg font-medium text-[#0a0a0a] mb-4 w-full">Sales to forecast ratio</h2>
            <div className="text-[48px] font-semibold tracking-tight text-[#0a0a0a]">1.11</div>
          </section>
        </div>

        {/* Forecast vs sales */}
        <section className="bg-white rounded-[14px] border border-[#e5e7eb] overflow-hidden">
          <div className="p-6 border-b border-[#e5e7eb]">
            <h2 className="text-lg font-medium text-[#0a0a0a]">Forecast vs sales</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f5f5f5] border-b border-[#e5e7eb]">
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Products</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Sales 4w</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Forecast 4w</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">F4w vs. S4w %</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Sales 13w</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Forecast 13w</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">F13w vs. S13w %</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#e5e7eb] hover:bg-[#f9fafb]">
                  <td className="py-2.5 px-4 text-[#0a0a0a]">123.6K</td>
                  <td className="py-2.5 px-4 text-right text-[#0a0a0a]">275.43K</td>
                  <td className="py-2.5 px-4 text-right text-[#0a0a0a]">294.27K</td>
                  <td className="py-2.5 px-4 text-right text-[#0a0a0a]">6.84%</td>
                  <td className="py-2.5 px-4 text-right text-[#0a0a0a]">794.62K</td>
                  <td className="py-2.5 px-4 text-right text-[#0a0a0a]">994.46K</td>
                  <td className="py-2.5 px-4 text-right text-[#0a0a0a]">25.15%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-[#e5e7eb] text-xs text-[#6a7282]">
            Showing 1 of 1 row
          </div>
        </section>

        {/* Forecast chart */}
        <section className="bg-white rounded-[14px] border border-[#e5e7eb] overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-3">
            <h2 className="text-lg font-medium text-[#0a0a0a]">Forecast</h2>
            <div className="flex items-center gap-2">
              <button type="button" className="px-3 py-1.5 text-sm font-medium text-[#4a5565] bg-[#f3f3f5] rounded-lg border border-[#e5e7eb] hover:bg-[#eeeeee] transition-colors">
                Explore
              </button>
              <button type="button" className="p-1.5 text-[#6a7282] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] rounded-lg transition-colors" aria-label="More options">
                <IconEllipsisVertical className="size-5" />
              </button>
            </div>
          </div>
          <div className="px-6 pb-2">
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
              {FORECAST_CHART_LEGEND.map(({ label, color }) => (
                <span key={label} className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-[#6a7282]">{label}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="px-6 pb-6 overflow-x-auto">
            <div style={{ width: 1100, height: 340 }}>
                <ComposedChart
                  width={1100}
                  height={340}
                  data={FORECAST_CHART_DATA}
                  margin={{ top: 16, right: 40, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    domain={[0, 90000]}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 1.3]}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    formatter={(value, name) => [typeof value === 'number' ? value.toLocaleString() : value, name]}
                  />
                  <Bar yAxisId="left" dataKey="expectedDemand" fill="#fcd34d" barSize={8} radius={[2, 2, 0, 0]} name="Expected demand" />
                  <Bar yAxisId="left" dataKey="actualSales" fill="#7dd3fc" barSize={8} radius={[2, 2, 0, 0]} name="Actual sales" />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="forecast"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                    name="Forecast"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="salesRate"
                    stroke="#22d3ee"
                    strokeWidth={1.5}
                    dot={false}
                    strokeDasharray="4 2"
                    name="Sales rate"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="seasonality"
                    stroke="#fbbf24"
                    strokeWidth={1.5}
                    dot={false}
                    strokeDasharray="2 2"
                    name="Seasonality"
                  />
                </ComposedChart>
            </div>
          </div>
        </section>

        {/* Metrics */}
        <section className="bg-white rounded-[14px] border border-[#e5e7eb] overflow-hidden">
          <div className="p-6 border-b border-[#e5e7eb]">
            <h2 className="text-lg font-medium text-[#0a0a0a]">Metrics</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f5f5f5] border-b border-[#e5e7eb]">
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Products</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Assorted?</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">First sale</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Latest sale</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Lifetime sales</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">First store inventory</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Latest store inventory</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Latest received</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Store Inventory</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">WH Inventory</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#e5e7eb] hover:bg-[#f9fafb]">
                  <td className="py-2.5 px-4 text-[#0a0a0a]">123.6K</td>
                  <td className="py-2.5 px-4 text-[#0a0a0a]">true</td>
                  <td className="py-2.5 px-4 text-[#0a0a0a]">02/01/2021</td>
                  <td className="py-2.5 px-4 text-[#0a0a0a]">02/03/2026</td>
                  <td className="py-2.5 px-4 text-right text-[#0a0a0a]">7.8M</td>
                  <td className="py-2.5 px-4 text-[#0a0a0a]">19/11/2024</td>
                  <td className="py-2.5 px-4 text-[#0a0a0a]">02/03/2026</td>
                  <td className="py-2.5 px-4 text-[#0a0a0a]">02/03/2026</td>
                  <td className="py-2.5 px-4 text-right text-[#0a0a0a]">396.87K</td>
                  <td className="py-2.5 px-4 text-right text-[#0a0a0a]">37.86M</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-[#e5e7eb] text-xs text-[#6a7282]">
            Showing 1 of 1 row
          </div>
        </section>

        {/* Forecast by Sub Department */}
        <section className="bg-white rounded-[14px] border border-[#e5e7eb] overflow-hidden">
          <div className="p-6 border-b border-[#e5e7eb]">
            <h2 className="text-lg font-medium text-[#0a0a0a]">Forecast by Sub Department</h2>
          </div>
          <div className="p-6 overflow-x-auto">
            <div style={{ width: 900, height: 400 }}>
              <LineChart
                width={900}
                height={400}
                data={FORECAST_BY_SUBDEPT_DATA}
                margin={{ top: 16, right: 180, left: 8, bottom: 24 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={true} horizontal={true} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                  label={{ value: 'Monthly Date ↑', position: 'insideBottom', offset: -8, fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis
                  domain={[0, 3500]}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `${v / 1000}K` : v)}
                  label={{ value: 'Forecast', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#6b7280' }}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(value, name) => [value?.toLocaleString?.() ?? value, SUB_DEPARTMENTS.find((s) => s.key === name)?.label ?? name]}
                />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="top"
                  wrapperStyle={{ right: 8, top: 16, paddingLeft: 16 }}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => SUB_DEPARTMENTS.find((s) => s.key === value)?.label ?? value}
                />
                {SUB_DEPARTMENTS.map(({ key, color }) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={color}
                    strokeWidth={1.5}
                    dot={false}
                    strokeDasharray="4 3"
                    connectNulls
                  />
                ))}
              </LineChart>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
