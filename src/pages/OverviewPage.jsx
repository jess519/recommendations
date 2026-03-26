import {
  IconArrowDownShort,
  IconSearch,
  NotificationButton,
  IconCalendar,
  IconPlus,
  IconClock,
  IconWarning,
  IconAlertOctagonal,
  IconClose,
  IconArrowRight,
  IconShield,
  IconPound,
  IconChart,
  IconTrendUp,
  IconLocation,
  IconTag,
} from '../components/icons'

const WEEK_DAYS = [
  { day: 'Mon', date: 23, today: true, events: [] },
  { day: 'Tue', date: 24, today: false, events: [{ route: 'London → Manchester', units: '450 units', time: '10:00 AM', category: 'Athletic wear', priority: 'critical' }] },
  { day: 'Wed', date: 25, today: false, events: [
    { route: 'Birmingham → Edinburgh', units: '320 units', time: '2:00 PM', category: 'Accessories', priority: 'high' },
    { route: 'Leeds → London', units: '280 units', time: '4:30 PM', category: 'Spring collection', priority: 'critical' },
  ]},
  { day: 'Thu', date: 26, today: false, events: [{ route: 'Manchester → Birmingham', units: '195 units', time: '11:00 AM', category: 'Footwear', priority: 'medium' }] },
  { day: 'Fri', date: 27, today: false, events: [{ route: 'Edinburgh → Leeds', units: '380 units', time: '9:00 AM', category: 'Winter stock', priority: 'critical' }] },
  { day: 'Sat', date: 28, today: false, events: [{ route: 'London → Birmingham', units: '520 units', time: '1:00 PM', category: 'Outerwear', priority: 'high' }] },
  { day: 'Sun', date: 1, today: false, events: [] },
]

const ALERTS = [
  { type: 'critical', title: 'Data age - critical warning', badge: '41 hours', body: 'Your data has not been updated for 41 hours. Older data can cause multiple issues across the platform.' },
  { type: 'high', title: 'Recommendation - winter jackets', badge: '12% remaining', body: 'SKU #WJ-2024 is at 12% stock level in Northeast region' },
  { type: 'high', title: 'Recommendation - London flagship', badge: '-18% WoW', body: 'Week-over-week sales down 18% compared to last month' },
  { type: 'high', title: 'High return rate - summer dresses', badge: '24% returns', body: 'Return rate of 24% detected for SKU #SD-1245' },
]

const RECOMMENDATIONS = [
  { title: 'Increase order - athletic wear', body: 'Based on the forecast, increase next order by 35%', impact: '+£45K potential revenue' },
  { title: 'Redistribute inventory - accessories', body: 'Move 450 units from Manchester to Birmingham for better turnover', impact: '+22% faster sell-through' },
  { title: 'Markdown opportunity - spring collection', body: 'Apply 20% discount to clear slow-moving spring items before season end', impact: '£28K inventory clearance' },
]

const VALUE_CARDS = [
  { value: '127', unit: 'incidents', title: 'Stockouts avoided', body: 'Prevented out-of-stock situations this month', icon: IconShield, bg: 'bg-blue-50', iconBg: 'bg-blue-100' },
  {
    value: '£248K',
    unit: 'saved',
    title: 'Cost savings',
    body: 'Avoided stockouts and overstock situations',
    icon: IconPound,
    bg: 'bg-[#e4f4ef]',
    borderClass: 'border-[#08a16a]',
    iconBg: 'bg-[#08a16a]/15 text-[#08a16a]',
    dataNodeId: '13693:314',
  },
  {
    value: '43%',
    unit: 'increase',
    title: 'Margin improvements',
    body: 'Enhanced profitability through optimized pricing',
    icon: IconChart,
    bg: 'bg-[#ede3fa]',
    borderClass: 'border-[#9166c9]',
    iconBg: 'bg-[#9166c9]/15 text-[#9166c9]',
    dataNodeId: '13693:626',
  },
]

function splitBadgeMetric(badge) {
  const t = String(badge).trim()
  const i = t.indexOf(' ')
  if (i === -1) return { head: t, tail: '' }
  return { head: t.slice(0, i), tail: t.slice(i + 1).trim() }
}

function EventCard({ route, units, time, category, priority }) {
  const styles = {
    critical: 'bg-[#E30D3C]/10 border-l-4 border-[#E30D3C] text-[#0a0a0a]',
    high: 'bg-[#F29A35]/10 border-l-4 border-[#F29A35] text-[#0a0a0a]',
    medium: 'bg-[#FFC451]/10 border-l-4 border-[#FFC451] text-[#0a0a0a]',
  }
  return (
    <div className={`rounded-lg p-2 text-xs ${styles[priority] || styles.medium}`}>
      <div className="font-medium">{route}</div>
      <div className="opacity-90">{units}</div>
      <div className="flex items-center gap-1 opacity-75">
        <IconClock />
        <span>{time}</span>
      </div>
      <div className="opacity-75">{category}</div>
    </div>
  )
}

export default function OverviewPage({ assignee = {}, setAssignee }) {
  return (
    <>
      <header className="w-[calc(100%+4rem)] min-w-0 -ml-8 bg-white border-b border-[#e5e7eb] pt-6 pb-4 px-8">
        <div className="flex flex-wrap items-center gap-3 w-full min-w-0">
          <div className="shrink-0 mr-2 min-w-0">
            <h1 className="text-xl font-medium text-[#0a0a0a] leading-tight">Welcome back, Tamir</h1>
            <p className="text-sm text-[#6a7282]">Monday, February 23, 2026</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 ml-auto min-w-0 justify-end">
            <span className="text-sm text-[#4a5565] shrink-0">Filter views by</span>
            {['All products', 'All locations', 'All user types'].map((label) => (
              <button
                key={label}
                type="button"
                className="h-10 shrink-0 min-w-[100px] rounded-[2px] border border-[#e9eaeb] bg-white px-3 flex items-center justify-between gap-2 text-sm leading-normal text-[#4b535c] hover:bg-[#fafafa] transition-colors"
                data-name="Input single select"
                data-node-id="12664:4045"
              >
                <span className="truncate text-left">{label}</span>
                <span className="text-[#0a0a0a] shrink-0 inline-flex" aria-hidden>
                  <IconArrowDownShort />
                </span>
              </button>
            ))}
            <div
              className="flex items-center shrink-0 w-[209px] h-10 rounded border border-[#e9eaeb] bg-white px-3 gap-2"
              data-name="Search"
              data-node-id="12875:6054"
            >
              <span className="text-[#0a0a0a] shrink-0 inline-flex" aria-hidden>
                <IconSearch className="w-4 h-4" />
              </span>
              <input
                type="search"
                placeholder="Search"
                className="flex-1 min-w-0 h-full bg-transparent border-0 text-sm leading-normal text-[#0a0a0a] placeholder:text-[#4b535c] outline-none"
                aria-label="Search"
              />
            </div>
            <NotificationButton />
            <div className="w-9 h-9 shrink-0 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-base font-medium">T</div>
          </div>
        </div>
      </header>

      <div className="pt-6 space-y-6">
        <section className="bg-white border border-[#e5e7eb] rounded-[14px] p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <IconCalendar className="text-[#4a5565]" />
              <div>
                <h2 className="text-lg text-[#0a0a0a]">Inventory schedule</h2>
                <p className="text-sm text-[#6a7282]">Time-critical inventory movements this week</p>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[4px] bg-[#0267ff] px-4 py-0 text-[16px] font-medium text-white transition-colors hover:bg-[#0252cc]"
              data-name="Button"
              data-node-id="12038:3318"
            >
              <span className="flex size-4 shrink-0 items-center justify-center text-white" aria-hidden>
                <IconPlus />
              </span>
              Add schedule
            </button>
          </div>
          <div className="flex items-center gap-4 pb-3 mb-4 border-b border-[#e5e7eb] text-sm text-[#4a5565]">
            <span>Priority:</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#E30D3C]" /> Critical</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#F29A35]" /> High</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#FFC451]" /> Medium</span>
          </div>
          <div className="grid grid-cols-7 gap-3">
            {WEEK_DAYS.map((d) => (
              <div key={`${d.day}-${d.date}`} className={`rounded-lg border min-h-[200px] flex flex-col ${d.today ? 'bg-[#eff6ff] border-[#8ec5ff]' : 'bg-[#f5f5f5] border-[#e5e7eb]'}`}>
                <div className="p-3 border-b border-[#d1d5dc]">
                  <p className={`text-xs ${d.today ? 'text-[#155dfc]' : 'text-[#6a7282]'}`}>{d.day}</p>
                  <p className={`text-lg font-normal ${d.today ? 'text-[#1447e6]' : 'text-[#101828]'}`}>{d.date}</p>
                  {d.today && <p className="text-xs text-[#155dfc]">Today</p>}
                </div>
                <div className="p-2 flex flex-col gap-2 flex-1">
                  {d.events.map((ev, i) => (
                    <EventCard key={i} {...ev} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white border border-[#e5e7eb] rounded-[14px] p-6">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg text-[#0a0a0a]">Needs your attention / What happened while you were away</h2>
                <span className="text-xs bg-[#E30D3C]/15 text-[#E30D3C] px-2 py-1 rounded-full">4 items</span>
              </div>
              <button type="button" className="text-sm text-[#155dfc] flex items-center gap-1">See all - inbox? <IconArrowRight /></button>
            </div>
            <div className="space-y-3">
              {ALERTS.map((alert, i) => {
                const { head: metricHead, tail: metricTail } = splitBadgeMetric(alert.badge)
                const isCritical = alert.type === 'critical'
                return (
                  <div
                    key={i}
                    className={`rounded-[6px] border p-4 flex flex-col gap-3 ${
                      isCritical ? 'border-[#E30D3C] bg-[#ffeaea]' : 'border-[#e5e7eb] bg-white'
                    }`}
                    data-name="Alerts & notifications"
                    data-node-id={isCritical ? '13693:313' : undefined}
                  >
                    <div className="flex gap-3 items-center min-w-0">
                      {isCritical ? (
                        <IconAlertOctagonal className="w-6 h-6 text-[#E30D3C] shrink-0" />
                      ) : (
                        <div className="shrink-0 w-6 h-6 rounded-md bg-[#F29A35] flex items-center justify-center text-white" aria-hidden>
                          <IconWarning />
                        </div>
                      )}
                      <div className="min-w-0 flex-1 flex flex-col gap-2">
                        <h3 className="text-lg font-medium text-[#0a0a0a] leading-normal">{alert.title}</h3>
                        <p className="text-sm text-[#4b535c] leading-normal">{alert.body}</p>
                      </div>
                      <div className="hidden sm:flex items-baseline gap-2 shrink-0 text-[#0a0a0a] whitespace-nowrap">
                        <span className="text-lg font-medium leading-normal">{metricHead}</span>
                        {metricTail ? <span className="text-sm text-[#4b535c] leading-normal">{metricTail}</span> : null}
                      </div>
                      <button
                        type="button"
                        className="shrink-0 h-10 w-10 inline-flex items-center justify-center rounded text-[#0a0a0a] hover:bg-black/[0.04] transition-colors"
                        aria-label="Dismiss alert"
                      >
                        <IconClose className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:hidden">
                      <span className="text-lg font-medium text-[#0a0a0a]">{metricHead}</span>
                      {metricTail ? <span className="text-sm text-[#4b535c]">{metricTail}</span> : null}
                    </div>
                    <div
                      className={`pt-3 border-t ${isCritical ? 'border-[#E30D3C]/25' : 'border-[#e5e7eb]'}`}
                    >
                      <select
                        value={assignee[i] ?? 'Unassigned'}
                        onChange={(e) => setAssignee((s) => ({ ...s, [i]: e.target.value }))}
                        className="text-sm rounded-lg border border-[#e5e7eb] bg-[#f3f3f5] px-3 py-1.5 w-full max-w-xs"
                      >
                        <option>Unassigned</option>
                      </select>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section
            className="flex flex-col gap-2 rounded-[5px] border-2 border-[#a234da] bg-[#fbf4fe] p-4"
            data-name="assortment"
            data-node-id="965:75229"
          >
            <div className="flex w-full flex-col gap-2">
              <div className="flex w-full items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                  <h2 className="text-base font-medium leading-normal text-[#0a0a0a]">autone recommendations</h2>
                  <span className="shrink-0 rounded-full bg-[#a234da] px-2 py-1 text-xs font-medium text-white">AI-powered</span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <button type="button" className="flex items-center gap-1 text-sm font-medium text-[#a234da]">
                    See all <IconArrowRight />
                  </button>
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-[#a234da] bg-[#fbf4fe]"
                    aria-hidden
                  />
                </div>
              </div>
              <p className="text-base leading-normal text-[#4b535c]">
                Prioritized suggestions to improve inventory performance and margin.
              </p>
            </div>
            <div className="mt-2 flex flex-col gap-3">
              {RECOMMENDATIONS.map((rec, i) => (
                <div
                  key={i}
                  className="flex gap-3 rounded-lg border border-[#a234da]/25 bg-white p-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#a234da]/10 text-[#a234da]">
                    {i === 0 && <IconTrendUp />}
                    {i === 1 && <IconLocation />}
                    {i === 2 && <IconTag />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-[#0a0a0a]">{rec.title}</h3>
                    <p className="mt-1 text-sm text-[#4b535c]">{rec.body}</p>
                    <p className="mt-1 text-sm font-medium text-[#a234da]">{rec.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="bg-white border border-[#e5e7eb] rounded-[14px] p-6">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
            <div>
              <h2 className="text-lg text-[#0a0a0a]">Surfacing autone value</h2>
              <p className="text-sm text-[#6a7282]">Impact of using autone</p>
            </div>
            <button type="button" className="text-sm text-[#155dfc] flex items-center gap-1">See all <IconArrowRight /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUE_CARDS.map((card, i) => {
              const Icon = card.icon
              return (
                <div
                  key={i}
                  className={`rounded-lg border p-6 relative overflow-hidden ${card.borderClass ?? 'border-[#e5e7eb]'} ${card.bg}`}
                  {...(card.dataNodeId ? { 'data-node-id': card.dataNodeId } : {})}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                    <Icon />
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-normal tracking-tight text-[#0a0a0a]">{card.value}</span>
                    <span className="text-sm text-[#4a5565]">{card.unit}</span>
                  </div>
                  <h3 className="text-sm font-medium text-[#364153] mt-1">{card.title}</h3>
                  <p className="text-sm text-[#4a5565] mt-2">{card.body}</p>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </>
  )
}
