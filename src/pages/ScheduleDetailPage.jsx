import { useState } from 'react'
import { IconSearch, IconChevronDown, IconShare, IconDocument } from '../components/icons'

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

export default function ScheduleDetailPage() {
  const [activeTab, setActiveTab] = useState('trips')

  return (
    <div className="pt-6 flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[20px] md:text-[24px] font-medium text-[#0a0a0a]">
              Europe monthly rebal
            </h1>
            <span className="text-[13px] text-[#4b535c]">
              Created: 24/02/2026
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

      <div className="flex flex-col gap-4">
        <div className="border-b border-[#e5e7eb]">
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
                    <th className="text-left py-3 px-3 font-medium text-[#0a0a0a]">Transfers</th>
                    <th className="text-left py-3 px-3 font-medium text-[#0a0a0a]">Revenue increase</th>
                    <th className="text-left py-3 px-3 font-medium text-[#0a0a0a]">Recommended transfers</th>
                    <th className="text-left py-3 px-3 font-medium text-[#0a0a0a]">Products</th>
                  </tr>
                  <tr className="border-b border-[#e5e7eb]">
                    <th className="py-2 px-3" />
                    <th className="py-2 px-3 text-[12px] font-normal text-[#4b535c]" />
                    <th className="py-2 px-3 text-[12px] font-normal text-[#4b535c]" />
                    <th className="py-2 px-3 text-[12px] font-normal text-[#4b535c]">2,110 units</th>
                    <th className="py-2 px-3 text-[12px] font-normal text-[#4b535c]">€489.5K</th>
                    <th className="py-2 px-3 text-[12px] font-normal text-[#4b535c]">2,132 units</th>
                    <th className="py-2 px-3 text-[12px] font-normal text-[#4b535c]">N/A</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      id: 1,
                      from: 'Miramas',
                      fromCode: 'MRS01',
                      to: 'Romans',
                      toCode: 'ROM02',
                      transfers: '180',
                      revenue: '€52.4K',
                      recommended: '192',
                      products: 18,
                    },
                    {
                      id: 2,
                      from: 'Troyes',
                      fromCode: 'TRY03',
                      to: 'Grenoble',
                      toCode: 'GRE04',
                      transfers: '164',
                      revenue: '€41.7K',
                      recommended: '176',
                      products: 14,
                    },
                    {
                      id: 3,
                      from: 'Cannes',
                      fromCode: 'CAN05',
                      to: 'Nice',
                      toCode: 'NCE06',
                      transfers: '192',
                      revenue: '€38.2K',
                      recommended: '200',
                      products: 12,
                    },
                    {
                      id: 4,
                      from: 'Miramas',
                      fromCode: 'MRS01',
                      to: 'Toulon',
                      toCode: 'TLN07',
                      transfers: '175',
                      revenue: '€36.9K',
                      recommended: '188',
                      products: 9,
                    },
                    {
                      id: 5,
                      from: 'Grenoble',
                      fromCode: 'GRE04',
                      to: 'Cannes',
                      toCode: 'CAN05',
                      transfers: '162',
                      revenue: '€34.1K',
                      recommended: '170',
                      products: 11,
                    },
                    {
                      id: 6,
                      from: 'Romans',
                      fromCode: 'ROM02',
                      to: 'Troyes',
                      toCode: 'TRY03',
                      transfers: '148',
                      revenue: '€29.8K',
                      recommended: '159',
                      products: 10,
                    },
                    {
                      id: 7,
                      from: 'Troyes',
                      fromCode: 'TRY03',
                      to: 'Cannes',
                      toCode: 'CAN05',
                      transfers: '136',
                      revenue: '€27.5K',
                      recommended: '144',
                      products: 8,
                    },
                    {
                      id: 8,
                      from: 'Nice',
                      fromCode: 'NCE06',
                      to: 'Grenoble',
                      toCode: 'GRE04',
                      transfers: '142',
                      revenue: '€26.3K',
                      recommended: '151',
                      products: 7,
                    },
                    {
                      id: 9,
                      from: 'Cannes',
                      fromCode: 'CAN05',
                      to: 'Romans',
                      toCode: 'ROM02',
                      transfers: '128',
                      revenue: '€24.7K',
                      recommended: '136',
                      products: 6,
                    },
                    {
                      id: 10,
                      from: 'Toulon',
                      fromCode: 'TLN07',
                      to: 'Miramas',
                      toCode: 'MRS01',
                      transfers: '120',
                      revenue: '€22.4K',
                      recommended: '129',
                      products: 5,
                    },
                    {
                      id: 11,
                      from: 'Grenoble',
                      fromCode: 'GRE04',
                      to: 'Romans',
                      toCode: 'ROM02',
                      transfers: '138',
                      revenue: '€21.3K',
                      recommended: '145',
                      products: 6,
                    },
                    {
                      id: 12,
                      from: 'Nice',
                      fromCode: 'NCE06',
                      to: 'Toulon',
                      toCode: 'TLN07',
                      transfers: '112',
                      revenue: '€18.7K',
                      recommended: '120',
                      products: 4,
                    },
                  ].map((row) => (
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
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#eff6ff] text-[11px] text-[#1d4ed8]">
                              MDQ
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#f3e8ff] text-[11px] text-[#6b21a8]">
                              VIS
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#ecfdf3] text-[11px] text-[#166534]">
                              REV
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 align-top">
                        <span className="text-[#0a0a0a]">{row.products}</span>
                      </td>
                    </tr>
                  ))}
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

