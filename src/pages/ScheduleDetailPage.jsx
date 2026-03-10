import { useState } from 'react'
import { IconSearch, IconChevronDown, IconShare, IconDocument, IconClose } from '../components/icons'

function IconColumnSettings() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden>
      <path d="M4 4h3v12H4V4zm9 0h3v12h-3V4zM8 4h4v12H8V4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconSortOrder() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden>
      <path d="M6 5h8M6 10h8M6 15h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 13l2 2 2-2M18 7v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconFilterFunnel() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden>
      <path d="M2 4h16l-5 7v5l-4 2v-7L2 4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const TRIPS_OPERA = [
  {
    id: 1,
    from: 'Cannes',
    fromCode: 'A1R',
    to: 'Opéra',
    toCode: 'A1A',
    transfers: '119',
    revenue: '€23.5K',
    recommended: '119',
    products: 68,
    movementType: 'Rebalancing',
    badges: ['VIS', 'REV'],
  },
  {
    id: 2,
    from: 'G.I cap 3000',
    fromCode: 'A3E',
    to: 'Opéra',
    toCode: 'A1A',
    transfers: '35',
    revenue: '€5.73K',
    recommended: '35',
    products: 23,
    movementType: 'Rebalancing',
    badges: ['VIS', 'REV'],
  },
  {
    id: 3,
    from: 'Printemps toulon',
    fromCode: 'A5O',
    to: 'Opéra',
    toCode: 'A1A',
    transfers: '24',
    revenue: '€5.09K',
    recommended: '24',
    products: 16,
    movementType: 'Replenishment',
    badges: ['VIS', 'REV'],
  },
  {
    id: 4,
    from: 'Pr.com',
    fromCode: 'A9E',
    to: 'Opéra',
    toCode: 'A1A',
    transfers: '6',
    revenue: '€2.76K',
    recommended: '6',
    products: 2,
    movementType: 'Rebalancing',
    badges: ['REV'],
  },
  {
    id: 5,
    from: 'Bruxelles',
    fromCode: 'A2F',
    to: 'Opéra',
    toCode: 'A1A',
    transfers: '15',
    revenue: '€2.28K',
    recommended: '15',
    products: 12,
    movementType: 'Reorder',
    badges: ['VIS', 'REV'],
  },
  {
    id: 6,
    from: 'G.I annecy',
    fromCode: 'A3C',
    to: 'Opéra',
    toCode: 'A1A',
    transfers: '4',
    revenue: '€1.98K',
    recommended: '4',
    products: 4,
    movementType: 'Replenishment',
    badges: ['REV'],
  },
]

const TRIPS_OTHER = [
  {
    id: 7,
    from: 'Miramas',
    fromCode: 'MRS01',
    to: 'Romans',
    toCode: 'ROM02',
    transfers: '180',
    revenue: '€52.4K',
    recommended: '192',
    products: 18,
    movementType: 'Replenishment',
    badges: ['MDQ', 'VIS', 'REV'],
  },
  {
    id: 8,
    from: 'Troyes',
    fromCode: 'TRY03',
    to: 'Grenoble',
    toCode: 'GRE04',
    transfers: '164',
    revenue: '€41.7K',
    recommended: '176',
    products: 14,
    movementType: 'Rebalancing',
    badges: ['MDQ', 'VIS', 'REV'],
  },
  {
    id: 9,
    from: 'Cannes',
    fromCode: 'CAN05',
    to: 'Nice',
    toCode: 'NCE06',
    transfers: '192',
    revenue: '€38.2K',
    recommended: '200',
    products: 12,
    movementType: 'Reorder',
    badges: ['MDQ', 'VIS', 'REV'],
  },
  {
    id: 10,
    from: 'Miramas',
    fromCode: 'MRS01',
    to: 'Toulon',
    toCode: 'TLN07',
    transfers: '175',
    revenue: '€36.9K',
    recommended: '188',
    products: 9,
    movementType: 'Replenishment',
    badges: ['MDQ', 'VIS', 'REV'],
  },
  {
    id: 11,
    from: 'Grenoble',
    fromCode: 'GRE04',
    to: 'Cannes',
    toCode: 'CAN05',
    transfers: '162',
    revenue: '€34.1K',
    recommended: '170',
    products: 11,
    movementType: 'Rebalancing',
    badges: ['MDQ', 'VIS', 'REV'],
  },
  {
    id: 12,
    from: 'Romans',
    fromCode: 'ROM02',
    to: 'Troyes',
    toCode: 'TRY03',
    transfers: '148',
    revenue: '€29.8K',
    recommended: '159',
    products: 10,
    movementType: 'Replenishment',
    badges: ['MDQ', 'VIS', 'REV'],
  },
  {
    id: 13,
    from: 'Troyes',
    fromCode: 'TRY03',
    to: 'Cannes',
    toCode: 'CAN05',
    transfers: '136',
    revenue: '€27.5K',
    recommended: '144',
    products: 8,
    movementType: 'Rebalancing',
    badges: ['MDQ', 'VIS', 'REV'],
  },
  {
    id: 14,
    from: 'Nice',
    fromCode: 'NCE06',
    to: 'Grenoble',
    toCode: 'GRE04',
    transfers: '142',
    revenue: '€26.3K',
    recommended: '151',
    products: 7,
    movementType: 'Replenishment',
    badges: ['MDQ', 'VIS', 'REV'],
  },
  {
    id: 15,
    from: 'Cannes',
    fromCode: 'CAN05',
    to: 'Romans',
    toCode: 'ROM02',
    transfers: '128',
    revenue: '€24.7K',
    recommended: '136',
    products: 6,
    movementType: 'Rebalancing',
    badges: ['MDQ', 'VIS', 'REV'],
  },
  {
    id: 16,
    from: 'Toulon',
    fromCode: 'TLN07',
    to: 'Miramas',
    toCode: 'MRS01',
    transfers: '120',
    revenue: '€22.4K',
    recommended: '129',
    products: 5,
    movementType: 'Replenishment',
    badges: ['MDQ', 'VIS', 'REV'],
  },
  {
    id: 17,
    from: 'Grenoble',
    fromCode: 'GRE04',
    to: 'Romans',
    toCode: 'ROM02',
    transfers: '138',
    revenue: '€21.3K',
    recommended: '145',
    products: 6,
    movementType: 'Rebalancing',
    badges: ['MDQ', 'VIS', 'REV'],
  },
  {
    id: 18,
    from: 'Nice',
    fromCode: 'NCE06',
    to: 'Toulon',
    toCode: 'TLN07',
    transfers: '112',
    revenue: '€18.7K',
    recommended: '120',
    products: 4,
    movementType: 'Replenishment',
    badges: ['MDQ', 'VIS', 'REV'],
  },
]

const TRIPS_ALL = [...TRIPS_OPERA, ...TRIPS_OTHER]

const VIEW_OPTIONS = [
  'Show all recommendations',
  'Saved view: Dresses - UK & Spain',
  'Saved view: Hoodies drop',
  'Exception: Europe monthly rebal',
]

const EDITED_EXCEPTION_IDS = [3, 5]

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden>
      <path d="M13 4L6 11 3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ScheduleDetailPage() {
  const [activeTab, setActiveTab] = useState('trips')
  const [viewShowsFullDataset, setViewShowsFullDataset] = useState(false)
  const [selectedView, setSelectedView] = useState('Exception: Europe monthly rebal')
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false)
  const [approvedTrips, setApprovedTrips] = useState({})

  const tripsRows = viewShowsFullDataset ? TRIPS_ALL : TRIPS_OPERA
  const summaryTransfers = viewShowsFullDataset ? '2,000 units' : '203 units'
  const summaryRevenue = viewShowsFullDataset ? '€435.3K' : '€41.3K'
  const summaryRecommended = viewShowsFullDataset ? '2,105 units' : '203 units'

  function handleSelectView(option) {
    setSelectedView(option)
    setViewDropdownOpen(false)
    if (option === 'Show all recommendations') {
      setViewShowsFullDataset(true)
    } else if (option === 'Exception: Europe monthly rebal') {
      setViewShowsFullDataset(false)
    }
    // Saved views: Dresses - UK & Spain, Hoodies drop — leave view unchanged
  }

  const handleApproveRow = (id) => {
    setApprovedTrips((prev) => ({ ...prev, [id]: true }))
  }

  const handleApproveAllVisible = () => {
    const idsToApprove = tripsRows.filter((row) => row.to === 'Opéra').map((row) => row.id)
    if (!idsToApprove.length) return
    setApprovedTrips((prev) => {
      const next = { ...prev }
      idsToApprove.forEach((id) => {
        next[id] = true
      })
      return next
    })
  }

  return (
    <div className="pt-6 flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2 min-w-0">
          <h1 className="text-[20px] md:text-[24px] font-medium text-[#0a0a0a]">
            Europe monthly rebal
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#4b535c]">
            <span>Created: 24/02/2026</span>
            <span className="flex items-center gap-2">
              <span>Submission deadline:</span>
              <span className="px-2 py-1 rounded-full text-[12px] font-medium bg-[#fef3c7] text-[#92400e]">
                28/02/2026
              </span>
            </span>
            <button
              type="button"
              className="text-[13px] font-medium text-[#0267ff] hover:underline"
            >
              View scope
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="h-9 w-9 flex items-center justify-center rounded-[4px] border border-[#e5e7eb] bg-white text-[#4b535c] hover:bg-[#f3f4f6]"
            aria-label="Share"
          >
            <IconShare />
          </button>
          <button
            type="button"
            className="h-9 w-9 flex items-center justify-center rounded-[4px] border border-[#e5e7eb] bg-white text-[#4b535c] hover:bg-[#f3f4f6]"
            aria-label="Download"
          >
            <IconDocument />
          </button>
          <button
            type="button"
            className="h-10 px-4 rounded-[4px] bg-[#0267ff] text-white text-[14px] font-medium flex items-center gap-2 hover:bg-[#0252cc]"
          >
            Submit recommendations
          </button>
        </div>
      </header>

      <div className="rounded-[8px] border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-[14px] text-[#4b535c] flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-[#b91c1c]">12 exceptions still to approve</span>
          <span>The next scheduled recommendations are the UK weekly replenishment running on 10/03/2026.</span>
        </div>
        <button
          type="button"
          className="mt-0.5 text-[#9ca3af] hover:text-[#4b535c]"
          aria-label="Dismiss exceptions info"
        >
          <IconClose className="size-4" />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="border-b border-[#e5e7eb] flex items-center justify-between gap-4">
          <nav className="flex items-center gap-6 h-11">
            {[
              { id: 'trips', label: 'Trips' },
              { id: 'products', label: 'Products' },
              { id: 'locations', label: 'Locations' },
            ].map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-2 text-[14px] font-medium border-b-2 ${
                    isActive
                      ? 'text-[#0a0a0a] border-[#0267ff]'
                      : 'text-[#4b535c] border-transparent hover:text-[#0a0a0a]'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </nav>
          <div className="relative shrink-0 pb-2">
            <button
              type="button"
              onClick={() => setViewDropdownOpen((o) => !o)}
              className="flex items-center gap-2 h-9 px-3 rounded-[4px] border border-[#e5e7eb] bg-white text-[14px] text-[#0a0a0a] hover:bg-[#f9fafb] min-w-[180px] justify-between"
              aria-haspopup="listbox"
              aria-expanded={viewDropdownOpen}
              aria-label="Select view"
            >
              <span className="truncate">{selectedView}</span>
              <IconChevronDown className="size-4 text-[#4b535c] shrink-0" />
            </button>
            {viewDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  aria-hidden
                  onClick={() => setViewDropdownOpen(false)}
                />
                <ul
                  role="listbox"
                  className="absolute right-0 top-full z-20 mt-1 min-w-[240px] rounded-[4px] border border-[#e5e7eb] bg-white py-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                >
                  {VIEW_OPTIONS.map((option) => {
                    const isSelected = selectedView === option
                    return (
                      <li key={option} role="option" aria-selected={isSelected}>
                        <button
                          type="button"
                          onClick={() => handleSelectView(option)}
                          className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-[14px] text-[#0a0a0a] hover:bg-[#f3f4f6]"
                        >
                          <span>{option}</span>
                          {isSelected && (
                            <span className="text-[#0267ff]">
                              <IconCheck />
                            </span>
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
          </div>
        </div>

        {activeTab === 'trips' ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <select
                  className="h-10 pl-3 pr-9 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#0a0a0a] appearance-none min-w-[220px]"
                  defaultValue="stockouts"
                >
                  <option value="stockouts">Stockouts before rebalance</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b535c] pointer-events-none">
                  <IconChevronDown className="size-4" />
                </span>
              </div>
              <button
                type="button"
                className="h-10 w-10 flex items-center justify-center rounded-[4px] border border-[#e9eaeb] bg-white text-[#22272f] hover:bg-[#f3f4f6] shrink-0"
                aria-label="Column settings"
              >
                <IconColumnSettings />
              </button>
              <button
                type="button"
                className="h-10 w-10 flex items-center justify-center rounded-[4px] border border-[#e9eaeb] bg-white text-[#22272f] hover:bg-[#f3f4f6] shrink-0"
                aria-label="Sort order"
              >
                <IconSortOrder />
              </button>
              <button
                type="button"
                className="h-10 w-10 flex items-center justify-center rounded-[4px] border border-[#e9eaeb] bg-white text-[#22272f] hover:bg-[#f3f4f6] shrink-0"
                aria-label="Search"
              >
                <IconSearch className="size-4" />
              </button>
              <button
                type="button"
                className="h-10 px-4 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#22272f] hover:bg-[#f3f4f6] shrink-0 flex items-center gap-2"
              >
                <IconFilterFunnel />
                Filters
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[12px] mt-1">
              {!viewShowsFullDataset && (
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    'Receiving location: Opéra',
                    'Products: A1252810 +2',
                    'Advanced: Transfer units lower than 10',
                  ].map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f3f4f6] text-[#4b535c] border border-[#e5e7eb]"
                    >
                      <span>{label}</span>
                      <IconClose className="size-3 text-[#9ca3af]" />
                    </span>
                  ))}
                </div>
              )}
              <div className="ml-auto flex items-center gap-3">
                {!viewShowsFullDataset && (
                  <button
                    type="button"
                    onClick={() => {
                      setViewShowsFullDataset(true)
                      setSelectedView('Show all recommendations')
                    }}
                    className="text-[12px] font-medium text-[#4b535c] hover:text-[#0a0a0a]"
                  >
                    Clear filters
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleApproveAllVisible}
                  className="h-8 px-3 rounded-[4px] border border-[#e5e7eb] bg-white text-[12px] text-[#0a0a0a] hover:bg-[#f3f4f6]"
                >
                  Approve all
                </button>
              </div>
            </div>

            <div className="border border-[#e5e7eb] rounded-[10px] overflow-hidden mt-2">
              <table className="w-full text-[14px]">
                <thead className="bg-[#f8f8f8]">
                  <tr className="border-b border-[#e5e7eb]">
                    <th className="w-10 py-3 px-3">
                      <input
                        type="checkbox"
                        className="size-4 rounded border-[#d1d5db] text-[#0267ff] focus:ring-[#0267ff]"
                        aria-label="Select all trips"
                      />
                    </th>
                    <th className="text-left py-3 px-3 font-medium text-[#0a0a0a]">Sending location</th>
                    <th className="text-left py-3 px-3 font-medium text-[#0a0a0a]">Receiving location</th>
                    <th className="text-left py-3 px-3 font-medium text-[#0a0a0a]">Movement type</th>
                    <th className="text-left py-3 px-3 font-medium text-[#0a0a0a]">Transfers</th>
                    <th className="text-left py-3 px-3 font-medium text-[#0a0a0a]">Revenue increase</th>
                    <th className="text-left py-3 px-3 font-medium text-[#0a0a0a]">Recommended transfers</th>
                    <th className="text-left py-3 px-3 font-medium text-[#0a0a0a]">Products</th>
                    <th className="text-left py-3 px-3 font-medium text-[#0a0a0a]">Approval status</th>
                    <th className="py-3 px-3" />
                  </tr>
                  <tr className="border-b border-[#e5e7eb]">
                    <th className="py-2 px-3" />
                    <th className="py-2 px-3 text-[12px] font-normal text-[#4b535c]" />
                    <th className="py-2 px-3 text-[12px] font-normal text-[#4b535c]" />
                    <th className="py-2 px-3 text-[12px] font-normal text-[#4b535c]" />
                    <th className="py-2 px-3 text-[12px] font-normal text-[#4b535c]">{summaryTransfers}</th>
                    <th className="py-2 px-3 text-[12px] font-normal text-[#4b535c]">{summaryRevenue}</th>
                    <th className="py-2 px-3 text-[12px] font-normal text-[#4b535c]">{summaryRecommended}</th>
                    <th className="py-2 px-3 text-[12px] font-normal text-[#4b535c]">N/A</th>
                    <th className="py-2 px-3" />
                    <th className="py-2 px-3" />
                  </tr>
                </thead>
                <tbody>
                  {tripsRows.map((row) => {
                    const isExceptionRow = row.to === 'Opéra'
                    const isApproved = !!approvedTrips[row.id]
                    const isEdited = isExceptionRow && EDITED_EXCEPTION_IDS.includes(row.id) && !isApproved
                    const movementType = row.movementType || 'Rebalancing'
                    const movementBadgeClass =
                      movementType === 'Rebalancing'
                        ? 'bg-[#e0edff] text-[#1d4ed8]'
                        : movementType === 'Replenishment'
                          ? 'bg-[#ecfdf3] text-[#166534]'
                          : 'bg-[#f3e8ff] text-[#6b21a8]'

                    return (
                      <tr key={row.id} className="border-b border-[#e5e7eb] hover:bg-[#f9fafb]">
                        <td className="py-3 px-3 align-top">
                          <input
                            type="checkbox"
                            className="size-4 rounded border-[#d1d5db] text-[#0267ff] focus:ring-[#0267ff]"
                            aria-label={`Select trip ${row.from} to ${row.to}`}
                          />
                        </td>
                        <td className="py-3 px-3 align-top">
                          <div className="flex flex-col">
                            <span className="text-[#0a0a0a] font-medium">{row.from}</span>
                            <span className="text-[12px] text-[#4b535c]">{row.fromCode}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 align-top">
                          <div className="flex flex-col">
                            <span className="text-[#0a0a0a] font-medium">{row.to}</span>
                            <span className="text-[12px] text-[#4b535c]">{row.toCode}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 align-top">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${movementBadgeClass}`}
                          >
                            {movementType}
                          </span>
                        </td>
                        <td className="py-3 px-3 align-top">
                          <div className="flex flex-col">
                            <span className="text-[#0a0a0a]">{row.transfers}</span>
                            <span className="text-[12px] text-[#4b535c]">max 200</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 align-top">
                          <div className="flex flex-col">
                            <span className="text-[#0a0a0a]">{row.revenue}</span>
                            <span className="text-[12px] text-[#4b535c]">min €500</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 align-top">
                          <div className="flex flex-col gap-1">
                            <span className="text-[#0a0a0a]">{row.recommended}</span>
                            <span className="text-[12px] text-[#4b535c]">max 200</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {row.badges?.includes('MDQ') && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#eff6ff] text-[11px] text-[#1d4ed8]">
                                  MDQ
                                </span>
                              )}
                              {row.badges?.includes('VIS') && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#f3e8ff] text-[11px] text-[#6b21a8]">
                                  VIS
                                </span>
                              )}
                              {row.badges?.includes('REV') && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#ecfdf3] text-[11px] text-[#166534]">
                                  REV
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 align-top">
                          <span className="text-[#0a0a0a]">{row.products}</span>
                        </td>
                        <td className="py-3 px-3 align-top">
                          {isExceptionRow ? (
                            isApproved ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#ecfdf3] text-[11px] text-[#166534]">
                                Approved
                              </span>
                            ) : isEdited ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#fef3c7] text-[11px] text-[#92400e]">
                                Edited
                              </span>
                            ) : (
                              <span className="inline-block h-5" aria-hidden />
                            )
                          ) : viewShowsFullDataset ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#ecfdf3] text-[11px] text-[#166534]">
                              Approved
                            </span>
                          ) : (
                            <span className="inline-block h-5" aria-hidden />
                          )}
                        </td>
                        <td className="py-3 px-3 align-top text-right">
                          {isExceptionRow && !isApproved ? (
                            <button
                              type="button"
                              onClick={() => handleApproveRow(row.id)}
                              className="inline-flex items-center justify-center h-8 px-3 rounded-[4px] border border-[#e5e7eb] bg-white text-[12px] text-[#0a0a0a] hover:bg-[#f3f4f6]"
                            >
                              Approve
                            </button>
                          ) : !isExceptionRow && viewShowsFullDataset ? (
                            <span className="inline-flex items-center justify-center text-[#16a34a]">
                              <IconCheck />
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-[#e5e7eb] rounded-[8px] p-6 text-[14px] text-[#4b535c]">
            {activeTab === 'products' ? 'Products view coming soon.' : 'Locations view coming soon.'}
          </div>
        )}
      </div>
    </div>
  )
}

