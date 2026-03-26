import { useState } from 'react'
import { Plus, Clock, ChevronRight, CircleDashed, Check } from 'lucide-react'

const GOAL_TABS = ['All', 'Active', 'Scheduled', 'Completed', 'Last run']

const GOAL_CARDS = [
  {
    id: '1',
    title: 'Reduce stockouts',
    badge: { label: 'Priority', tone: 'amber' },
    metrics: [
      { label: '+851K revenue', emphasis: true },
      { label: '+1,512 · −5% stockouts', sub: true },
    ],
    created: '24/04/2024',
  },
  {
    id: '2',
    title: 'Increase revenue',
    badge: { label: 'Driving', tone: 'blue' },
    metrics: [
      { label: '€630K revenue', emphasis: true },
      { label: '+3.8% · +7% last month', sub: true },
    ],
    created: '22/04/2024',
  },
  {
    id: '3',
    title: 'Reduce overstock',
    badge: null,
    icon: 'circle',
    metrics: [{ label: '9d avg +2 turnover time', emphasis: true }],
    created: '20/04/2024',
  },
]

const FEED_ITEMS = [
  {
    id: 'f1',
    title: 'Transfer 250 units of SKU 8130 from Paris to Berlin',
    body: 'Restock Tiergarten store to prevent sellouts.',
    badges: ['High Impact / Urgent', 'Reduce stockouts'],
    revenue: '+€40.2K revenue',
    stock: '−96 stockouts',
    approved: false,
  },
  {
    id: 'f2',
    title: 'Rebalance 180 units — Manchester → Leeds',
    body: 'Clear slow movers ahead of the seasonal transition.',
    badges: ['High Impact / Urgent'],
    revenue: '+€12.8K revenue',
    stock: '−42 overstock',
    approved: false,
  },
  {
    id: 'f3',
    title: 'Increase reorder for SKU 4412 — London flagship',
    body: 'Demand spike detected; align safety stock with forecast.',
    badges: ['Automated', 'Auto-approve'],
    revenue: '+€8.1K revenue',
    stock: '−18 stockouts',
    approved: true,
  },
]

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 text-left"
    >
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-emerald-500' : 'bg-[#d1d5db]'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </span>
      <span className="text-[13px] text-[#0a0a0a]">{label}</span>
    </button>
  )
}

export default function InventoryGoalsPage({ onCreateGoal = () => {} }) {
  const [goalTab, setGoalTab] = useState('All')
  const [autoApprove, setAutoApprove] = useState(true)
  const [selectAll, setSelectAll] = useState(false)

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-medium text-[#0a0a0a]">Inventory Goals</h2>
          <nav className="flex flex-wrap items-center gap-6 border-b border-[#e5e7eb]" aria-label="Goal filters">
            {GOAL_TABS.map((tab) => {
              const active = goalTab === tab
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setGoalTab(tab)}
                  className={`relative pb-3 text-[14px] transition-colors ${
                    active
                      ? 'font-medium text-[#0267ff] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-[#0267ff]'
                      : 'font-normal text-[#6b7280] hover:text-[#0a0a0a]'
                  }`}
                >
                  {tab}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {GOAL_CARDS.map((card) => (
            <div
              key={card.id}
              className="flex min-h-[200px] flex-col rounded-[3.42px] border border-[#EAEAEA] bg-white p-4 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.04)]"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="text-[15px] font-medium leading-snug text-[#0a0a0a]">{card.title}</h3>
                {card.badge && (
                  <span
                    className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      card.badge.tone === 'amber'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-[#eff6ff] text-[#1d4ed8]'
                    }`}
                  >
                    {card.badge.label}
                    <ChevronRight className="size-3" strokeWidth={2} aria-hidden />
                  </span>
                )}
                {card.icon === 'circle' && (
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#EAEAEA] text-[#6b7280]">
                    <CircleDashed className="size-4" strokeWidth={1.5} aria-hidden />
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                {card.metrics.map((m, i) => (
                  <p
                    key={i}
                    className={`text-[13px] leading-snug ${m.emphasis ? 'font-medium text-[#0a0a0a]' : 'text-[#6b7280]'}`}
                  >
                    {m.label}
                  </p>
                ))}
              </div>
              <div className="mt-4 flex flex-col gap-2 border-t border-[#f3f4f6] pt-3">
                <p className="text-[12px] text-[#9ca3af]">Created {card.created}</p>
                <button
                  type="button"
                  className="inline-flex w-fit items-center gap-0.5 text-[13px] font-medium text-[#0267ff] hover:underline"
                >
                  View details
                  <ChevronRight className="size-3.5" strokeWidth={2} aria-hidden />
                </button>
              </div>
            </div>
          ))}

          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-[3.42px] border border-dashed border-[#d1d5db] bg-white p-6">
            <button
              type="button"
              onClick={onCreateGoal}
              className="inline-flex items-center gap-1.5 text-[15px] font-medium text-[#0267ff] transition-colors hover:text-[#0252cc]"
            >
              <Plus className="size-5" strokeWidth={2} aria-hidden />
              Create goal
              <ChevronRight className="size-4" strokeWidth={2} aria-hidden />
            </button>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-[#0a0a0a]">Decision Feed</h2>

        <div className="flex flex-col gap-4 border-b border-[#e5e7eb] pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-[#0a0a0a]">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={(e) => setSelectAll(e.target.checked)}
                className="size-4 rounded border-[#d1d5db] text-[#0267ff] focus:ring-[#0267ff]"
              />
              Select all
            </label>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0267ff] px-3 py-1 text-[12px] font-medium text-white">
              <Plus className="size-3.5" strokeWidth={2.5} aria-hidden />
              High Impact
            </span>
            <span className="inline-flex items-center rounded-full bg-[#f3f4f6] px-3 py-1 text-[12px] font-medium text-[#374151]">
              Urgent
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#f3f4f6] px-3 py-1 text-[12px] font-medium text-[#374151]">
              <span className="inline-block size-3.5 rounded-sm border border-[#ccc]" aria-hidden />
              Automated
            </span>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-[4px] text-[#6b7280] hover:bg-[#f3f4f6] lg:ml-1"
              aria-label="Sort by time"
            >
              <Clock className="size-4" strokeWidth={1.75} aria-hidden />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Toggle checked={autoApprove} onChange={setAutoApprove} label="Auto-approve low risk" />
            <button
              type="button"
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-[4px] bg-[#0267ff] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#0252cc]"
            >
              Approve all
            </button>
          </div>
        </div>

        <div className="flex flex-col rounded-[3.42px] border border-[#EAEAEA] bg-white">
          {FEED_ITEMS.map((item, index) => (
            <div
              key={item.id}
              className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-4 ${
                index < FEED_ITEMS.length - 1 ? 'border-b border-[#f3f4f6]' : ''
              }`}
            >
              <div className="flex min-w-0 flex-1 gap-3">
                <input
                  type="checkbox"
                  className="mt-1 size-4 shrink-0 rounded border-[#d1d5db] text-[#0267ff] focus:ring-[#0267ff]"
                  aria-label={`Select ${item.title}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-[#0a0a0a]">{item.title}</p>
                  <p className="mt-1 text-[13px] text-[#6b7280]">
                    {item.body}{' '}
                    <button type="button" className="font-medium text-[#0267ff] hover:underline">
                      View details
                    </button>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full px-2 py-0.5 text-[11px] font-medium bg-purple-50 text-purple-800">
                      AI recommendation
                    </span>
                    {item.badges.map((b) => (
                      <span
                        key={b}
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          b.startsWith('High Impact')
                            ? 'bg-amber-50 text-amber-900'
                            : b === 'Reduce stockouts'
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-[#f3f4f6] text-[#4b5563]'
                        }`}
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2 sm:min-w-[200px]">
                <p className="text-right text-[13px] font-medium text-[#08A16A]">{item.revenue}</p>
                <p className="text-right text-[12px] text-[#6b7280]">{item.stock}</p>
                <button
                  type="button"
                  disabled={item.approved}
                  className={`inline-flex h-9 min-w-[96px] items-center justify-center gap-1 rounded-[4px] px-4 text-[13px] font-medium transition-colors ${
                    item.approved
                      ? 'cursor-default bg-emerald-600 text-white'
                      : 'bg-[#0267ff] text-white hover:bg-[#0252cc]'
                  }`}
                >
                  {item.approved ? (
                    <>
                      <Check className="size-4" strokeWidth={2.5} aria-hidden />
                      Approved
                    </>
                  ) : (
                    'Approve'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="inline-flex w-fit items-center gap-0.5 text-[13px] font-medium text-[#0267ff] hover:underline"
        >
          Show 52 more
          <ChevronRight className="size-3.5" strokeWidth={2} aria-hidden />
        </button>
      </section>
    </div>
  )
}
