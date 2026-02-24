import { useState } from 'react'

// Simple inline icons (no external assets)
const IconChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
/* Search icon – inside search box (Figma 116:1577): dark grey outline magnifying glass */
const IconSearch = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden>
    <circle cx="9" cy="9" r="5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M14 14l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
/* Notification icon – Figma 115:945: bell outline + 8px red dot top-right */
const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden>
    <path d="M10 3.5a3.5 3.5 0 00-3.5 3.5v2.2c0 .35-.12.7-.32.95L4.5 13v1.2c0 .4.3.8.8.8h9.4c.5 0 .8-.4.8-.8V13l-1.68-2.85a2.5 2.5 0 01-.32-.95V7a3.5 3.5 0 00-3.5-3.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 15.2a2 2 0 004 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M9.5 14.2v.8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
  </svg>
)
const NotificationButton = () => (
  <button type="button" className="relative rounded-[10px] w-9 h-9 flex items-center justify-center hover:bg-gray-100 shrink-0" aria-label="Notifications">
    <span className="absolute left-2 top-2 text-[#4a5565]">
      <IconBell />
    </span>
    <span className="absolute left-6 top-1 w-2 h-2 rounded-full bg-[#fb2c36]" aria-hidden />
  </button>
)
const IconCalendar = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <rect x="2" y="4" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 8h16M6 2v4M14 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)
const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconSparkles = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M10 2l1.2 3.6 3.8.2-2.8 2.4 1 3.6L10 10.4l-2.2 2.4 1-3.6L6 5.8l3.8-.2L10 2z" fill="currentColor" />
    <path d="M16 12l.6 1.8 1.9.1-1.4 1.2.5 1.8-1.6-1.2-1.6 1.2.5-1.8-1.4-1.2 1.9-.1.6-1.8z" fill="currentColor" />
    <path d="M4 14l.5 1.5 1.5.1-1.1 1 .4 1.5-1.3-1-1.3 1 .4-1.5-1.1-1 1.5-.1.5-1.5z" fill="currentColor" />
  </svg>
)
const IconWarning = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
    <path d="M6 1l5 9H1L6 1z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.2" />
    <path d="M6 4v3M6 8v1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
  </svg>
)
const IconClock = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M6 4v2l2 2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
  </svg>
)
const IconTrendUp = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M3 14l5-5 4 4 6-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 8h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconLocation = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M10 2C6.7 2 4 4.7 4 8c0 4.5 6 10 6 10s6-5.5 6-10c0-3.3-2.7-6-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)
const IconTag = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M2 6l6-4 10 10-6 6-10-10v-2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="6" cy="6" r="1" fill="currentColor" />
  </svg>
)
const IconShield = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M12 2L4 5v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V5l-8-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
  </svg>
)
const IconPound = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M7 20h10M7 4h2c2.2 0 4 1.8 4 4s-1.8 4-4 4H7M13 4h2c2.2 0 4 1.8 4 4v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconChart = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M3 17l5-5 4 4 6-8 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// Sidebar icons – Autone Design System 2.0 (12299:63282), inactive #22272f
const IconGrid = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <rect x="4" y="4" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="14" y="4" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="4" y="14" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="14" y="14" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)
const IconReplenishment = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M4 10v9a2 2 0 002 2h12a2 2 0 002-2V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M4 10l8-6 8 6M12 4v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="9" y="14" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)
const IconReorder = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M9 9h6M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const IconRebalancing = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M21 12a9 9 0 11-9-9c2.5 0 4.5 1 6 2.5L21 8M21 3v5h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconBuy = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 6h18M16 10a4 4 0 11-8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const IconLightbulb = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M9 21h6M12 3a6 6 0 014 10.5v.5a2 2 0 01-2 2h-4a2 2 0 01-2-2v-.5A6 6 0 0112 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 18h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const IconGridDots = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
    {[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => (
      <circle key={`${r}-${c}`} cx={5 + c * 7} cy={5 + r * 7} r="2" fill="currentColor" />
    )))}
  </svg>
)
const IconCalendarSidebar = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const IconGears = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const IconTeam = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="15" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 20c0-2.6 1.8-4.8 4.2-5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const IconClockSidebar = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const IconChat = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M21 11.5a8.5 8.5 0 01-8.5 8.5H6l-4 4v-4.5A8.5 8.5 0 1112.5 3a8.5 8.5 0 018.5 8.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
)
const IconDollar = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 6v12M9 9h3a1.5 1.5 0 110 3H9M15 12h-3a1.5 1.5 0 100 3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconFlagUK = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <rect x="2" y="4" width="20" height="14" rx="1.5" fill="#012169" stroke="currentColor" strokeWidth="0.5" />
    <path d="M2 4L24 16M24 4L2 16M12 4v16M2 12h20" stroke="#fff" strokeWidth="1.2" />
    <path d="M2 4l4 3-4 3 4 3-4 3M22 16l-4-3 4-3-4-3 4-3M12 4v4M12 16v4M2 12h4M18 12h4" stroke="#C8102E" strokeWidth="0.8" />
  </svg>
)
const IconChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconCollapse = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden>
    <path d="M12 5l-5 5 5 5M7 5l-5 5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* Logo from Figma 145-914: 24px icon + wordmark, gap 6px. Assets use dark fill; invert for white on sidebar. */
function AutoneLogo({ className = '' }) {
  return (
    <div className={`flex items-center gap-[6px] h-6 [&_img]:invert ${className}`} data-name="autone-logo">
      <img src="/logo-icon.svg" alt="" className="w-6 h-6 shrink-0 block" aria-hidden />
      <img src="/logo-wordmark.svg" alt="autone" className="h-[24px] w-[112px] shrink-0 block" />
    </div>
  )
}

/* Top bar – Autone Design System 12301:65728 */
const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden>
    <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconExternalLink = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden>
    <path d="M6 3H4a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V6M11 2h3v3M7 9l6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconUpload = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden>
    <path d="M8 11V2M8 2l3 3M8 2L5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

function TopBar({ title = 'Team', subtitle = 'Manage permissions and invites throughout your team', primaryButtonLabel = 'Next', primaryButtonHref = '#', onPrimaryClick }) {
  return (
    <header className="bg-[#12171e] flex items-center justify-between p-6 shrink-0" data-name="Top bar" data-node-id="12301:65733">
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <h1 className="font-sans text-2xl font-medium text-white leading-tight">{title}</h1>
        {subtitle && (
          <p className="font-sans text-sm font-normal text-[#878d94] leading-tight">{subtitle}</p>
        )}
      </div>
      <div className="flex flex-1 gap-1.5 items-center justify-end min-w-0 shrink-0">
        {primaryButtonLabel && (
          onPrimaryClick
            ? (
                <button type="button" onClick={onPrimaryClick} className="bg-[#0267ff] flex items-center justify-center h-12 px-4 rounded-[4px] text-base font-medium text-white hover:bg-[#0252cc] shrink-0">
                  {primaryButtonLabel}
                </button>
              )
            : (
                <a href={primaryButtonHref} className="bg-[#0267ff] flex items-center justify-center h-12 px-4 rounded-[4px] text-base font-medium text-white hover:bg-[#0252cc] shrink-0">
                  {primaryButtonLabel}
                </a>
              )
        )}
      </div>
    </header>
  )
}

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
  { type: 'high', title: 'Low stock alert - winter jackets', badge: '12% remaining', body: 'SKU #WJ-2024 is at 12% stock level in Northeast region' },
  { type: 'high', title: 'Declining sales - London flagship', badge: '-18% WoW', body: 'Week-over-week sales down 18% compared to last month' },
  { type: 'high', title: 'High return rate - summer dresses', badge: '24% returns', body: 'Return rate of 24% detected for SKU #SD-1245' },
]

const RECOMMENDATIONS = [
  { title: 'Increase order - athletic wear', confidence: '94% confident', body: 'Based on current sell-through rate, increase next order by 35%', impact: '+£45K potential revenue' },
  { title: 'Redistribute inventory - accessories', confidence: '88% confident', body: 'Move 450 units from Manchester to Birmingham for better turnover', impact: '+22% faster sell-through' },
  { title: 'Markdown opportunity - spring collection', confidence: '91% confident', body: 'Apply 20% discount to clear slow-moving spring items before season end', impact: '£28K inventory clearance' },
]

const VALUE_CARDS = [
  { value: '127', unit: 'incidents', title: 'Stockouts avoided', body: 'Prevented out-of-stock situations this month', icon: IconShield, bg: 'bg-blue-50', iconBg: 'bg-blue-100' },
  { value: '£248K', unit: 'saved', title: 'Cost savings', body: 'Avoided stockouts and overstock situations', icon: IconPound, bg: 'bg-green-50', iconBg: 'bg-green-100' },
  { value: '43%', unit: 'increase', title: 'Margin improvements', body: 'Enhanced profitability through optimized pricing', icon: IconChart, bg: 'bg-purple-50', iconBg: 'bg-purple-100' },
]

function EventCard({ route, units, time, category, priority }) {
  const styles = {
    critical: 'bg-red-50 border-l-4 border-red-500 text-red-900',
    high: 'bg-amber-50 border-l-4 border-amber-500 text-amber-900',
    medium: 'bg-yellow-50 border-l-4 border-yellow-400 text-yellow-900',
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

export default function App() {
  const [assignee, setAssignee] = useState({})

  return (
    <div className="min-h-screen bg-[#f9fafb] flex text-[#0a0a0a]">
      {/* Sidebar – Figma Single Solver Concepts 145:911 */}
      <aside className="w-[220px] shrink-0 bg-[#12171e] flex flex-col py-8 px-4">
        <div className="relative flex items-center justify-between px-4 py-2 min-h-[40px]">
          <AutoneLogo />
          <button type="button" className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded text-white/70 hover:text-white hover:bg-white/10" aria-label="Collapse sidebar">
            <IconCollapse />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-1.5 mt-8">
          <button type="button" className="h-10 flex items-center gap-3 px-4 rounded-[4px] bg-[#0267ff] text-left text-sm font-medium text-white shrink-0">
            <IconGrid className="text-white" />
            <span>Control Panel</span>
          </button>
          <button type="button" className="h-10 flex items-center gap-3 px-4 rounded-[4px] text-left text-sm font-normal text-white hover:bg-white/5">
            <IconBuy className="text-[#22272f]" />
            <span>Buying</span>
          </button>
          <button type="button" className="h-10 flex items-center gap-3 px-4 rounded-[4px] text-left text-sm font-normal text-white hover:bg-white/5">
            <IconLightbulb className="text-[#22272f]" />
            <span>Insights</span>
            <IconChevronDown className="ml-auto text-[#22272f]" />
          </button>

          <div className="my-2 h-px bg-white/10 w-full" role="separator" />

          <button type="button" className="h-10 flex items-center gap-3 px-4 rounded-[4px] text-left text-sm font-normal text-white hover:bg-white/5">
            <IconGridDots className="text-[#22272f]" />
            <span>Assortment</span>
          </button>
          <button type="button" className="h-10 flex items-center gap-3 px-4 rounded-[4px] text-left text-sm font-normal text-white hover:bg-white/5">
            <IconCalendarSidebar className="text-[#22272f]" />
            <span>Events</span>
          </button>
          <button type="button" className="h-10 flex items-center gap-3 px-4 rounded-[4px] text-left text-sm font-normal text-white hover:bg-white/5">
            <IconGears className="text-[#22272f]" />
            <span>Parameters</span>
          </button>
          <button type="button" className="h-10 flex items-center gap-3 px-4 rounded-[4px] text-left text-sm font-normal text-white hover:bg-white/5">
            <IconTeam className="text-[#22272f]" />
            <span>Team</span>
          </button>
        </nav>

        <div className="flex flex-col gap-1.5 shrink-0">
          <button type="button" className="h-10 flex items-center gap-3 px-4 rounded-[4px] text-left text-sm font-normal text-white hover:bg-white/5">
            <IconClockSidebar className="text-emerald-400" />
            <span className="flex-1">Data age</span>
            <span className="text-sm font-medium text-emerald-400">12h</span>
            <IconChevronRight className="text-[#22272f]" />
          </button>
          <div className="h-px bg-white/10 w-full" role="separator" />
          <button type="button" className="h-10 flex items-center gap-3 px-4 rounded-[4px] text-left text-sm font-normal text-white hover:bg-white/5">
            <IconChat className="text-[#22272f]" />
            <span>Chat with us</span>
          </button>
          <button type="button" className="h-10 flex items-center gap-3 px-4 rounded-[4px] text-left text-sm font-normal text-white hover:bg-white/5">
            <IconDollar className="text-[#22272f]" />
            <span>Currency</span>
          </button>
          <button type="button" className="h-10 flex items-center gap-3 px-4 rounded-[4px] text-left text-sm font-normal text-white hover:bg-white/5">
            <IconFlagUK className="text-[#22272f]" />
            <span>English</span>
          </button>
          <button type="button" className="w-full flex items-center gap-2 pr-4 py-2 rounded-[8px] text-left hover:bg-white/5 shadow-[0px_8px_25px_0px_rgba(0,0,0,0.08)]">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-medium shrink-0">
              CM
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-medium text-white truncate">Charles Morenno</p>
              <p className="text-[10px] text-[#878d94] truncate">charlesmorenno@gmail.com</p>
            </div>
            <IconChevronRight className="text-[#22272f] shrink-0" />
          </button>
        </div>
      </aside>

      {/* Right column: top bar + main content (aligned with sidebar) */}
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar
          title="Control Panel"
          subtitle="Control Panel for managing all of your inventory and scheduling needs."
          primaryButtonLabel="Next"
          primaryButtonHref="#"
        />

        {/* Main */}
        <main className="flex-1 min-w-0 pl-8 pr-8 pb-12">
        {/* Page header – welcome/date; filters, search, actions */}
        <header className="bg-white border-b border-[#e5e7eb] pt-6 pb-4 -mx-8 px-8">
          <div className="flex flex-wrap items-center gap-3">
            <div className="shrink-0 mr-2">
              <h1 className="text-xl font-semibold text-[#0a0a0a] leading-tight">Welcome back, Tamir</h1>
              <p className="text-sm text-[#6a7282]">Monday, February 23, 2026</p>
            </div>
            <span className="text-sm text-[#4a5565] shrink-0">Filter views by</span>
            {['All products', 'All locations', 'All user types'].map((label) => (
              <button key={label} type="button" className="h-10 shrink-0 bg-[#f3f3f5] rounded-lg pl-3 pr-3 flex items-center justify-between gap-2 text-sm text-[#0a0a0a] min-w-[100px]">
                <span className="truncate">{label}</span>
                <IconChevronDown className="shrink-0" />
              </button>
            ))}
            <div className="flex items-center shrink-0 w-[280px] sm:w-[325px] h-[42px] rounded-[10px] border border-[#d1d5dc] bg-white overflow-hidden">
              <span className="pl-3 flex items-center justify-center text-[#4a5565] shrink-0" aria-hidden>
                <IconSearch />
              </span>
              <input type="text" placeholder="Search insights..." className="flex-1 min-w-0 h-full pl-2 pr-4 bg-transparent border-0 text-base text-[#0a0a0a] placeholder:text-[#0a0a0a]/50 tracking-[-0.01em] outline-none" />
            </div>
            <NotificationButton />
            <div className="w-9 h-9 shrink-0 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-base font-medium">T</div>
          </div>
        </header>

        <div className="pt-6 space-y-6">
          {/* AI Assistant card */}
          <section className="rounded-[14px] border border-[#e9d4ff] bg-gradient-to-br from-[#faf5ff] to-[#eff6ff] p-6 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-9 h-9 rounded-lg bg-[#9810fa] flex items-center justify-center text-white">
                <IconSparkles />
              </div>
              <h2 className="text-lg text-[#0a0a0a]">How can we help today?</h2>
              <span className="text-xs text-white bg-[#9810fa] px-2 py-1 rounded-full">AI assistant</span>
            </div>
            <div className="relative">
              <input type="text" placeholder="Ask anything about your inventory, sales, or recommendations..." className="w-full h-12 pl-4 pr-12 rounded-lg border border-[#d1d5dc] bg-white text-base placeholder:text-[#0a0a0a]/50" />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#9810fa] flex items-center justify-center text-white">
                <IconArrowRight />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-[#4a5565] mr-1">Quick actions:</span>
              {['Show me inventory alerts', 'What are my top performing products?', 'Analyze sales trends', 'Optimize my stock levels'].map((label) => (
                <button key={label} type="button" className="px-4 py-1.5 rounded-full border border-[#e9d4ff] bg-white text-[#8200db] text-sm hover:bg-[#faf5ff]">
                  {label}
                </button>
              ))}
            </div>
          </section>

          {/* Inventory schedule */}
          <section className="bg-white border border-[#e5e7eb] rounded-[14px] p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <IconCalendar className="text-[#4a5565]" />
                <div>
                  <h2 className="text-lg text-[#0a0a0a]">Inventory schedule</h2>
                  <p className="text-sm text-[#6a7282]">Time-critical inventory movements this week</p>
                </div>
              </div>
              <button type="button" className="shrink-0 h-10 px-4 rounded-lg bg-[#155dfc] text-white text-sm font-medium flex items-center gap-2">
                <IconPlus />
                Add exceptional event
              </button>
            </div>
            <div className="flex items-center gap-4 pb-3 mb-4 border-b border-[#e5e7eb] text-sm text-[#4a5565]">
              <span>Priority:</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#ff6467]" /> Critical</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#ff8904]" /> High</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#fdc700]" /> Medium</span>
            </div>
            <div className="grid grid-cols-7 gap-3">
              {WEEK_DAYS.map((d) => (
                <div key={`${d.day}-${d.date}`} className={`rounded-lg border min-h-[200px] flex flex-col ${d.today ? 'bg-[#eff6ff] border-[#8ec5ff]' : 'bg-[#f9fafb] border-[#e5e7eb]'}`}>
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

          {/* Two columns: Alerts + Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Needs your attention */}
            <section className="bg-white border border-[#e5e7eb] rounded-[14px] p-6">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg text-[#0a0a0a]">Needs your attention / What happened while you were away</h2>
                  <span className="text-xs bg-red-100 text-[#c10007] px-2 py-1 rounded-full">4 items</span>
                </div>
                <button type="button" className="text-sm text-[#155dfc] flex items-center gap-1">See all - inbox? <IconArrowRight /></button>
              </div>
              <div className="space-y-3">
                {ALERTS.map((alert, i) => (
                  <div key={i} className={`rounded-lg border-2 p-4 flex gap-3 ${alert.type === 'critical' ? 'bg-red-50 border-red-500' : 'border-[#e5e7eb]'}`}>
                    <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${alert.type === 'critical' ? 'bg-red-600 text-white' : alert.type === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100'}`}>
                      <IconWarning />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <h3 className="text-sm font-medium text-[#0a0a0a]">{alert.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${alert.type === 'critical' ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-800'}`}>{alert.badge}</span>
                      </div>
                      <p className="text-sm text-[#4a5565] mt-1">{alert.body}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <select value={assignee[i] ?? 'Unassigned'} onChange={(e) => setAssignee((s) => ({ ...s, [i]: e.target.value }))} className="text-sm rounded-lg border border-[#e5e7eb] bg-[#f3f3f5] px-3 py-1.5">
                          <option>Unassigned</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* autone recommendations */}
            <section className="rounded-[14px] border border-[#bedbff] bg-gradient-to-br from-[#eff6ff] to-[#eef2ff] p-6">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg text-[#0a0a0a]">autone recommendations</h2>
                  <span className="text-xs bg-[#155dfc] text-white px-2 py-1 rounded-full">AI-powered</span>
                </div>
                <button type="button" className="text-sm text-[#155dfc] flex items-center gap-1">See all <IconArrowRight /></button>
              </div>
              <div className="space-y-3">
                {RECOMMENDATIONS.map((rec, i) => (
                  <div key={i} className="bg-white border border-[#bedbff] rounded-lg p-4 flex gap-3">
                    <div className="shrink-0 w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-[#155dfc]">
                      {i === 0 && <IconTrendUp />}
                      {i === 1 && <IconLocation />}
                      {i === 2 && <IconTag />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <h3 className="text-sm font-medium text-[#0a0a0a]">{rec.title}</h3>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded shrink-0">{rec.confidence}</span>
                      </div>
                      <p className="text-sm text-[#4a5565] mt-1">{rec.body}</p>
                      <p className="text-sm text-[#1447e6] mt-1">{rec.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Surfacing autone value */}
          <section className="bg-white border border-[#e5e7eb] rounded-[14px] p-6">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
              <div>
                <h2 className="text-lg text-[#0a0a0a]">Surfacing autone value</h2>
                <p className="text-sm text-[#6a7282]">Impact of using autone</p>
              </div>
              <button type="button" className="text-sm text-[#155dfc] flex items-center gap-1">See all <IconArrowRight /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {VALUE_CARDS.map((card, i) => (
                <div key={i} className={`rounded-lg border border-[#e5e7eb] p-6 relative overflow-hidden ${card.bg}`}>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-[#0a0a0a] ${card.iconBg}`}>
                    <card.icon />
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-normal tracking-tight text-[#0a0a0a]">{card.value}</span>
                    <span className="text-sm text-[#4a5565]">{card.unit}</span>
                  </div>
                  <h3 className="text-sm font-medium text-[#364153] mt-1">{card.title}</h3>
                  <p className="text-sm text-[#4a5565] mt-2">{card.body}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
        </main>
      </div>
    </div>
  )
}
