import { useState } from 'react'
import { IconArrowRight, IconChevronDown, IconInfo, IconStar, IconLock, IconBulb, IconShare, IconEllipsisVertical } from '../components/icons'

const DATA_HEALTH_TABS = [
  'File validations',
  'Ingested data validations',
  'Dimension attributes',
  'Distribution flow',
  'Inventory reliability',
]

const FILTER_PILLS = [
  { label: 'Customer new demo', active: true },
  { label: 'File dimensional / transaction (Select)', active: false },
  { label: 'File data type (Select)', active: false },
  { label: 'File received at (Select)', active: false },
]

const KPI_CARDS = [
  {
    title: 'File processed - completed',
    sub: '% of files that were successfully processed out of total files uploaded',
    date: '24/02/2026',
    value: '100.00%',
    comparison: 'vs 17/02/2026 (0)',
    sparkline: [85, 90, 92, 95, 98, 99, 100],
    sparklineColor: '#22c55e',
  },
  {
    title: 'Failed validations',
    sub: '% of files that failed validation rules',
    date: '24/02/2026',
    value: '50.00%',
    comparison: 'vs 17/02/2026',
    sparkline: [30, 40, 35, 45, 48, 52, 50],
    sparklineColor: '#eab308',
  },
  {
    title: 'Daily file upload',
    sub: 'Number of files uploaded in the day',
    date: '24/02/2026',
    value: '4',
    comparison: 'vs 17/02/2026',
    sparkline: [2, 3, 2, 4, 3, 5, 4],
    sparklineColor: '#a855f7',
  },
  {
    title: 'Daily failed runs % vs monthly average',
    sub: 'How today\'s failed run rate compares to the monthly average',
    date: '24/02/2026',
    value: '33.33%',
    comparison: 'vs 17/02/2026',
    comparisonDelta: '+133.33%',
    sparkline: [10, 15, 20, 18, 25, 30, 33],
    sparklineColor: '#f97316',
  },
]

const FILE_VALIDATIONS_ROWS = [
  { customer: 'New Demo', dataType: 'warehouse', receivedAt: '24/02/2026 21:38', processingStatus: 'completed', failedValidations: 0, rowCount: '21.16K', fileSize: '1 MB', uploadId: 'a7f2b3c4-d5e6-4f7a-8b9c...', distinctDates: '2026-02-15,2026-02-16' },
  { customer: 'New Demo', dataType: 'inventory', receivedAt: '24/02/2026 18:22', processingStatus: 'failed', failedValidations: 3, rowCount: '0', fileSize: '19 MB', uploadId: 'b8e3c4d5-e6f7-5a8b-9c0d...', distinctDates: '[Null]' },
  { customer: 'New Demo', dataType: 'sales', receivedAt: '17/02/2026 12:51', processingStatus: 'completed', failedValidations: 0, rowCount: '311.28K', fileSize: '699 KB', uploadId: 'c9d4e5f6-a7b8-6c9d-0e1f...', distinctDates: '2026-02-10,2026-02-11' },
  { customer: 'New Demo', dataType: 'production', receivedAt: '17/02/2026 09:15', processingStatus: 'failed', failedValidations: 2, rowCount: '0', fileSize: '1 B', uploadId: 'd0e5f6a7-b8c9-7d0e-1f2a...', distinctDates: '[Null]' },
  { customer: 'New Demo', dataType: 'warehouse', receivedAt: '16/12/2025 14:30', processingStatus: 'completed', failedValidations: 0, rowCount: '5.8M', fileSize: '350 MB', uploadId: 'e1f6a7b8-c9d0-8e1f-2a3b...', distinctDates: '2025-12-01,2025-12-15' },
  { customer: 'New Demo', dataType: 'inventory', receivedAt: '16/12/2025 11:00', processingStatus: 'completed', failedValidations: 0, rowCount: '1.34M', fileSize: '12 MB', uploadId: 'f2a7b8c9-d0e1-9f2a-3b4c...', distinctDates: '2025-12-10' },
]

const FAIL_VALIDATION_ROWS = [
  { customer: 'New Demo', dataType: 'inventory', runDatetime: '24/02/2026 21:41:37', fields: 'on_hand_qty', rule: 'Field is at least 0', status: 'fail', failures: '5.44K', runId: '1098113', failuresPct: '1.75%', rowCount: '311.28K' },
  { customer: 'New Demo', dataType: 'warehouse', runDatetime: '24/02/2026 21:41:37', fields: 'in_warehouse_value', rule: 'Data volume must be within expected range', status: 'fail', failures: '105.25K', runId: '1098113', failuresPct: '15.06%', rowCount: '698.5K' },
  { customer: 'New Demo', dataType: 'product', runDatetime: '24/02/2026 21:38:12', fields: 'color_id', rule: 'Field cannot be null', status: 'fail', failures: '1', runId: '1052443', failuresPct: '0.00%', rowCount: '966' },
  { customer: 'New Demo', dataType: 'inventory', runDatetime: '24/02/2026 21:38:12', fields: '(Empty)', rule: 'Field must be unique', status: 'fail', failures: '12.2K', runId: '1052443', failuresPct: '3.91%', rowCount: '311.28K' },
  { customer: 'New Demo', dataType: 'warehouse', runDatetime: '17/02/2026 12:51:00', fields: 'on_hand_qty', rule: 'Field is at least 0', status: 'fail', failures: '2.1K', runId: '1041122', failuresPct: '0.30%', rowCount: '5.8M' },
  { customer: 'New Demo', dataType: 'sales', runDatetime: '17/02/2026 09:15:22', fields: 'unit_price', rule: 'Field must be numeric', status: 'fail', failures: '89', runId: '1039987', failuresPct: '2.84%', rowCount: '3.13K' },
  { customer: 'New Demo', dataType: 'product', runDatetime: '16/12/2025 14:30:00', fields: 'brand_id', rule: 'Field cannot be null', status: 'fail', failures: '156', runId: '981234', failuresPct: '0.01%', rowCount: '1.34M' },
]

const FILE_VALIDATIONS_SAMPLE_ROWS = [
  { id: 1, colorDesc: '', colorId: '', value: '2025-08-28', date: '' },
  { id: 2, colorDesc: '', colorId: '', value: '2025-11-04', date: '' },
  { id: 3, colorDesc: '', colorId: '', value: '2025-08-08', date: '' },
  { id: 4, colorDesc: '', colorId: '', value: '2025-07-15', date: '' },
  { id: 5, colorDesc: '', colorId: '', value: '2026-02-08', date: '' },
  { id: 6, colorDesc: '', colorId: '', value: '', date: '' },
  { id: 7, colorDesc: '', colorId: '', value: '2025-09-12', date: '' },
  { id: 8, colorDesc: '', colorId: '', value: '', date: '' },
  { id: 9, colorDesc: '', colorId: '', value: '2025-12-01', date: '' },
  { id: 10, colorDesc: '', colorId: '', value: '', date: '' },
  { id: 11, colorDesc: '', colorId: '', value: '2026-01-15', date: '' },
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
    </button>
  )
}

function Sparkline({ data, stroke = '#155dfc' }) {
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
      <polyline fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  )
}

function DataHealthKPICard({ title, sub, date, value, comparison, comparisonDelta, sparkline, sparklineColor }) {
  return (
    <div className="bg-white rounded-[14px] border border-[#e5e7eb] p-6 flex flex-col gap-2">
      <div className="text-sm font-medium text-[#4a5565]">{title}</div>
      <div className="text-xs text-[#6a7282]">{sub}</div>
      <div className="text-xs text-[#6a7282]">{date}</div>
      <div className="text-[28px] font-normal tracking-tight text-[#0a0a0a]">{value}</div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-[#6a7282]">{comparison}</span>
        {comparisonDelta && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
              <path d="M6 9V3M6 3L3 6M6 3l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {comparisonDelta}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <Sparkline data={sparkline} stroke={sparklineColor} />
        <span className="text-xs text-[#6a7282] whitespace-nowrap">As expected</span>
      </div>
      <button type="button" className="text-sm font-medium text-[#155dfc] hover:underline text-left mt-1">
        Analyse change
      </button>
    </div>
  )
}

export default function DataHealthPage() {
  const [activeTab, setActiveTab] = useState('File validations')

  return (
    <div className="bg-[#f5f5f5] min-h-full">
      {/* Header - white bar */}
      <header className="w-[calc(100%+4rem)] min-w-0 -ml-8 bg-white border-b border-[#e5e7eb]">
        <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-4">
          <div className="flex items-center gap-2">
            <IconCheckGreen />
            <h1 className="text-xl font-medium text-[#0a0a0a]">Data health</h1>
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
            {DATA_HEALTH_TABS.map((tab) => (
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
            <button type="button" className="h-10 px-4 rounded-lg border border-[#e5e7eb] bg-[#155dfc] text-white text-sm font-medium flex items-center gap-2 hover:bg-[#1447e6] shrink-0">
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
        <div className="flex flex-wrap items-center gap-2">
          {FILTER_PILLS.map((pill) => (
            <FilterPill key={pill.label} label={pill.label} active={pill.active} />
          ))}
          <button type="button" className="p-2 rounded text-[#6a7282] hover:bg-[#f5f5f5]" aria-label="More filters">
            <IconArrowRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Info cards + Today uploads */}
      <div className="pt-6 grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
        <section className="bg-white rounded-[14px] border border-[#e5e7eb] p-6">
          <h2 className="text-lg font-medium text-[#0a0a0a] mb-3">File validations</h2>
          <p className="text-sm text-[#4a5565] leading-relaxed mb-4">
            This tab monitors the health of uploaded files across customers and file types. It highlights whether files are being processed successfully, if validation rules are failing, and provides drill-down details and samples for troubleshooting errors.
          </p>
          <ul className="space-y-2 text-sm text-[#4a5565]">
            <li>
              Start with <button type="button" className="font-semibold text-[#0a0a0a] hover:text-[#155dfc] hover:underline">File validations</button> to see if files are processed successfully.
            </li>
            <li>
              Drill into <button type="button" className="font-semibold text-[#0a0a0a] hover:text-[#155dfc] hover:underline">Fail validation details</button> for failed files to see which rules and fields broke (filtering on Upload ID).
            </li>
          </ul>
        </section>

        <section className="bg-white rounded-[14px] border border-[#e5e7eb] p-6 flex flex-col">
          <h2 className="text-lg font-medium text-[#0a0a0a] mb-1">Today uploads</h2>
          <p className="text-sm text-[#6a7282] mb-3">Files ingested on the...</p>
          <div className="text-[40px] font-normal tracking-tight text-[#0a0a0a]">0</div>
        </section>
      </div>

      {/* Main KPIs - alerting notification */}
      <section className="pt-6">
        <div className="bg-white rounded-[14px] border border-[#e5e7eb] p-6">
          <h2 className="text-lg font-medium text-[#0a0a0a] mb-6">Main KPIs - alerting notification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {KPI_CARDS.map((card) => (
              <DataHealthKPICard
                key={card.title}
                title={card.title}
                sub={card.sub}
                date={card.date}
                value={card.value}
                comparison={card.comparison}
                comparisonDelta={card.comparisonDelta}
                sparkline={card.sparkline}
                sparklineColor={card.sparklineColor}
              />
            ))}
          </div>
        </div>
      </section>

      {/* File validations table */}
      <section className="pt-6">
        <div className="bg-white rounded-[14px] border border-[#e5e7eb] overflow-hidden">
          <div className="p-6 border-b border-[#e5e7eb]">
            <h2 className="text-lg font-medium text-[#0a0a0a] mb-2">File validations</h2>
            <p className="text-sm text-[#6a7282] leading-relaxed">
              Shows file upload validations by customer and data type. Each row represents a file uploaded and its validation outcome. Use this table to identify which files were processed, their size, when they were received, and whether validation passed or failed.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f5f5f5] border-b border-[#e5e7eb]">
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Data type</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">
                    Received at <IconChevronDown className="inline-block size-4 ml-0.5" />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Processing status</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Failed validations</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Row count</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">File size</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Upload ID</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Distinct dates</th>
                </tr>
              </thead>
              <tbody>
                {FILE_VALIDATIONS_ROWS.map((row, i) => (
                  <tr key={i} className="border-b border-[#e5e7eb] hover:bg-[#f9fafb]">
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.customer}</td>
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.dataType}</td>
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.receivedAt}</td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-sm font-medium ${row.processingStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {row.processingStatus}
                      </span>
                    </td>
                    <td className={`py-2.5 px-4 text-right font-medium ${row.failedValidations > 0 ? 'text-red-600' : 'text-[#0a0a0a]'}`}>{row.failedValidations}</td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.rowCount}</td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.fileSize}</td>
                    <td className="py-2.5 px-4 text-[#0a0a0a] truncate max-w-[140px]" title={row.uploadId}>{row.uploadId}</td>
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.distinctDates}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#f5f5f5] font-medium border-t-2 border-[#e5e7eb]">
                  <td colSpan={3} className="py-3 px-4">
                    <span className="text-xs text-[#6a7282] block">UNIQUE COUNT</span>
                    <span className="text-base font-medium text-[#0a0a0a]">1</span>
                  </td>
                  <td colSpan={2} className="py-3 px-4">
                    <span className="text-xs text-[#6a7282] block">UNIQUE COUNT</span>
                    <span className="text-base font-medium text-[#0a0a0a]">10</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-xs text-[#6a7282] block">TIME PERIOD</span>
                    <span className="text-base font-medium text-[#0a0a0a]">16/12/2025...</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-xs text-[#6a7282] block">TOTAL</span>
                    <span className="text-base font-medium text-[#0a0a0a]">139.58M</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-[#6a7282] block">UNIQUE COUNT</span>
                    <span className="text-base font-medium text-[#0a0a0a]">2</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-[#6a7282] block">TOTAL</span>
                    <span className="text-base font-medium text-[#0a0a0a]">55</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-[#e5e7eb] text-xs text-[#6a7282]">
            Showing 50 of 50 rows
          </div>
        </div>
      </section>

      {/* Fail validation details table */}
      <section className="pt-6">
        <div className="bg-white rounded-[14px] border border-[#e5e7eb] overflow-hidden">
          <div className="p-6 border-b border-[#e5e7eb] flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-[#0a0a0a] mb-2">Fail validation details</h2>
              <p className="text-sm text-[#6a7282] leading-relaxed max-w-2xl">
                Lists detailed validation errors for each file run. Each row corresponds to a specific validation rule that failed for a given data type. Use this table to understand which fields and rules are causing issues.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button type="button" className="h-10 px-4 rounded-lg border border-[#e5e7eb] bg-white text-[#4a5565] text-sm font-medium hover:bg-[#f5f5f5]">
                Explore
              </button>
              <button type="button" className="size-10 rounded-lg flex items-center justify-center text-[#4a5565] hover:bg-[#f5f5f5]" aria-label="More options">
                <IconEllipsisVertical className="size-5" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f5f5f5] border-b border-[#e5e7eb]">
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Data type</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">
                    Run datetime <IconChevronDown className="inline-block size-4 ml-0.5" />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Fields</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Rule</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Failures</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Run ID</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565] bg-blue-50">Failures %</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Row count</th>
                </tr>
              </thead>
              <tbody>
                {FAIL_VALIDATION_ROWS.map((row, i) => (
                  <tr key={i} className={`border-b border-[#e5e7eb] hover:bg-[#f9fafb] ${i % 2 === 1 ? 'bg-[#fafafa]' : ''}`}>
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.customer}</td>
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.dataType}</td>
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.runDatetime}</td>
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.fields}</td>
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.rule}</td>
                    <td className="py-2.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-sm font-medium bg-red-100 text-red-800">
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.failures}</td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.runId}</td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a] bg-blue-50">{row.failuresPct}</td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.rowCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-[#e5e7eb] text-xs text-[#6a7282]">
            Showing 55 of 56 rows
          </div>
        </div>
      </section>

      {/* File validations - sample */}
      <section className="pt-6">
        <div className="bg-white rounded-[14px] border border-[#e5e7eb] overflow-hidden">
          <div className="p-6 border-b border-[#e5e7eb]">
            <h2 className="text-lg font-medium text-[#0a0a0a] mb-2">File validations - sample</h2>
            <p className="text-sm text-[#6a7282] leading-relaxed">
              Shows a 10-row sample of actual records that failed validation checks for a specific run. This is used to view the raw data values that triggered the errors.
            </p>
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-[320px]">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#f5f5f5] border-b border-[#e5e7eb]">
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565] sticky left-0 z-10 bg-[#f5f5f5] min-w-[120px] border-r border-[#e5e7eb]">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565] sticky left-[120px] z-10 bg-[#f5f5f5] min-w-[100px] border-r border-[#e5e7eb]">Data type</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565] sticky left-[220px] z-10 bg-[#f5f5f5] min-w-[120px] border-r border-[#e5e7eb]">Fields</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565] min-w-[60px]">Id</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565] min-w-[100px]">color_desc</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565] min-w-[80px]">color_id</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565] min-w-[100px]">Value</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565] min-w-[100px]">date</th>
                </tr>
              </thead>
              <tbody>
                {FILE_VALIDATIONS_SAMPLE_ROWS.map((row, i) => (
                  <tr key={row.id} className={`border-b border-[#e5e7eb] hover:bg-[#f9fafb] ${i % 2 === 1 ? 'bg-[#fafafa]' : 'bg-white'}`}>
                    <td className={`py-2.5 px-4 text-[#0a0a0a] sticky left-0 z-[1] border-r border-[#e5e7eb] ${i % 2 === 1 ? 'bg-[#fafafa]' : 'bg-white'}`}>New Demo</td>
                    <td className={`py-2.5 px-4 text-[#0a0a0a] sticky left-[120px] z-[1] border-r border-[#e5e7eb] ${i % 2 === 1 ? 'bg-[#fafafa]' : 'bg-white'}`}>Inventory</td>
                    <td className={`py-2.5 px-4 text-[#0a0a0a] sticky left-[220px] z-[1] border-r border-[#e5e7eb] ${i % 2 === 1 ? 'bg-[#fafafa]' : 'bg-white'}`}>on_hand_qty</td>
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.id}</td>
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.colorDesc}</td>
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.colorId}</td>
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.value}</td>
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-[#e5e7eb] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1">
              <button type="button" className="size-8 rounded flex items-center justify-center text-[#6a7282] hover:bg-[#f5f5f5] disabled:opacity-50" aria-label="First page">
                &laquo;
              </button>
              <button type="button" className="size-8 rounded flex items-center justify-center text-[#6a7282] hover:bg-[#f5f5f5] disabled:opacity-50" aria-label="Previous page">
                &lsaquo;
              </button>
              <span className="px-3 py-1 text-sm text-[#4a5565]">Page 1 of 1</span>
              <button type="button" className="size-8 rounded flex items-center justify-center text-[#6a7282] hover:bg-[#f5f5f5] disabled:opacity-50" aria-label="Next page">
                &rsaquo;
              </button>
              <button type="button" className="size-8 rounded flex items-center justify-center text-[#6a7282] hover:bg-[#f5f5f5] disabled:opacity-50" aria-label="Last page">
                &raquo;
              </button>
            </div>
            <div className="text-xs text-[#6a7282]">
              Showing 1-11 of 11 items
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
