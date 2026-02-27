import { useState, useRef } from 'react'
import { IconCalendarSidebar, IconPlus, IconReplenishment, IconReorder, IconRebalancing, IconChevronDown, IconList, IconCalendarNote, IconTruck, IconTrendUp, IconLightbulb, IconEdit, IconClose, IconChevronDownSelect } from '../components/icons'

const SAMPLE_CALENDAR_ENTRY = {
  id: 'entry-1',
  type: 'replenishment',
  title: 'Replenishment',
  startDate: new Date(2026, 1, 2),
  endDate: new Date(2026, 1, 4),
  module: 'Replenishment Module',
  from: 'Warehouse A',
  to: 'Store B',
  time: '09:00 AM PST',
  frequency: 'Weekly · Mon, Wed, Fri',
  transferUnits: 100,
  availableToSend: 150,
  tripType: 'Truck',
  recommendedUnits: 120,
  revenueIncrease: 500,
  reasons: ['High demand', 'Low inventory'],
}
const SAMPLE_CALENDAR_ENTRY_REORDER = {
  id: 'entry-2',
  type: 'reorder',
  title: 'Reorder',
  startDate: new Date(2026, 1, 15),
  endDate: new Date(2026, 1, 17),
  module: 'Reorder Module',
  from: 'Distribution Center',
  to: 'Store C',
  time: '10:00 AM PST',
  frequency: 'Weekly · Tue, Thu',
  transferUnits: 80,
  availableToSend: 120,
  tripType: 'Van',
  recommendedUnits: 90,
  revenueIncrease: 320,
  reasons: ['Stock level below threshold', 'Seasonal demand'],
}
const SAMPLE_CALENDAR_ENTRY_REBALANCING_1 = {
  id: 'entry-3',
  type: 'rebalancing',
  title: 'Rebalancing',
  startDate: new Date(2026, 1, 9),
  endDate: new Date(2026, 1, 9),
  module: 'Rebalancing Module',
  from: 'Store A',
  to: 'Store B',
  time: '08:00 AM PST',
  frequency: 'Weekly · Mon',
  transferUnits: 50,
  availableToSend: 200,
  tripType: 'Truck',
  recommendedUnits: 55,
  revenueIncrease: 180,
  reasons: ['Inventory imbalance', 'Regional demand shift'],
}
const SAMPLE_CALENDAR_ENTRY_REBALANCING_2 = {
  id: 'entry-4',
  type: 'rebalancing',
  title: 'Rebalancing',
  startDate: new Date(2026, 1, 20),
  endDate: new Date(2026, 1, 21),
  module: 'Rebalancing Module',
  from: 'Warehouse B',
  to: 'Store D',
  time: '02:00 PM PST',
  frequency: 'Bi-weekly · Thu',
  transferUnits: 120,
  availableToSend: 300,
  tripType: 'Truck',
  recommendedUnits: 130,
  revenueIncrease: 420,
  reasons: ['Overstock at origin', 'Understock at destination'],
}
const SAMPLE_CALENDAR_ENTRY_REBALANCING_3 = {
  id: 'entry-5',
  type: 'rebalancing',
  title: 'Rebalancing',
  startDate: new Date(2026, 1, 26),
  endDate: new Date(2026, 1, 27),
  module: 'Rebalancing Module',
  from: 'Distribution Center',
  to: 'Store A',
  time: '11:00 AM PST',
  frequency: 'Monthly',
  transferUnits: 200,
  availableToSend: 500,
  tripType: 'Truck',
  recommendedUnits: 220,
  revenueIncrease: 650,
  reasons: ['End of month rebalance', 'Forecast adjustment'],
}
const CALENDAR_ENTRIES = [
  SAMPLE_CALENDAR_ENTRY,
  SAMPLE_CALENDAR_ENTRY_REORDER,
  SAMPLE_CALENDAR_ENTRY_REBALANCING_1,
  SAMPLE_CALENDAR_ENTRY_REBALANCING_2,
  SAMPLE_CALENDAR_ENTRY_REBALANCING_3,
]

/* Optimiser page – Figma 174:2696 (Optimiser-Concepts) */
const DEFAULT_DRAWER_FORM = {
  module: '',
  modules: [],
  name: '',
  sending: '',
  receiving: '',
  repeats: 'biweekly',
  time: '',
  timeZone: 'gmt+1',
  endsOn: '',
  notify: '',
}
const MODULE_OPTIONS = [
  { id: 'replenishment', label: 'Replenishment' },
  { id: 'reorder', label: 'Reorder' },
  { id: 'rebalancing', label: 'Rebalancing' },
]

export default function OptimiserPage({ onAddJob }) {
  const [scheduleDrawerOpen, setScheduleDrawerOpen] = useState(false)
  const [editingScheduleEntry, setEditingScheduleEntry] = useState(null)
  const [drawerForm, setDrawerForm] = useState(DEFAULT_DRAWER_FORM)
  const [scheduleDrawerDays, setScheduleDrawerDays] = useState(() => ({ Wed: true, Sat: true }))
  const [moduleDropdownOpen, setModuleDropdownOpen] = useState(false)
  const [entryReviewStatus, setEntryReviewStatus] = useState(() => ({
    'entry-1': 'upcoming',   // Replenishment
    'entry-2': 'in review', // Reorder
    'entry-3': 'submitted', // Rebalancing (Feb 9)
    'entry-4': 'in review', // Rebalancing (Feb 20–21)
    'entry-5': 'upcoming',  // Rebalancing (Feb 26–27)
  }))
  const setReviewStatus = (entryId, status) => setEntryReviewStatus((prev) => ({ ...prev, [entryId]: status }))
  const [activeTypeFilter, setActiveTypeFilter] = useState('all')
  const [pinnedHoverEntryId, setPinnedHoverEntryId] = useState(null)
  const [pinnedHoverCellKey, setPinnedHoverCellKey] = useState(null)
  const [hoveredEntryId, setHoveredEntryId] = useState(null)
  const [hoveredCellKey, setHoveredCellKey] = useState(null)
  const hoverLeaveTimeoutRef = useRef(null)
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const toggleScheduleDay = (day) => setScheduleDrawerDays((prev) => ({ ...prev, [day]: !prev[day] }))
  const typeFilters = [
    { id: 'all', label: 'All', icon: null },
    { id: 'replenishment', label: 'Replenishment', icon: 'replenishment' },
    { id: 'reorder', label: 'Reorder', icon: 'reorder' },
    { id: 'rebalancing', label: 'Rebalancing', icon: 'rebalancing' },
  ]
  const [activeViewOption, setActiveViewOption] = useState('month')
  const [viewDate, setViewDate] = useState(() => new Date(2026, 1, 1)) // Feb 2026
  const [eventDatePickerOpen, setEventDatePickerOpen] = useState(false)
  const [eventDateSelected, setEventDateSelected] = useState(() => new Date(2026, 1, 26))
  const [eventDatePickerViewDate, setEventDatePickerViewDate] = useState(() => new Date(2026, 1, 1))
  const [selectedReviewStatuses, setSelectedReviewStatuses] = useState([])
  const [reviewStatusDropdownOpen, setReviewStatusDropdownOpen] = useState(false)
  const reviewStatusFilterOptions = [
    { id: 'in review', label: 'In review' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'submitted', label: 'Submitted' },
  ]
  const toggleReviewStatusFilter = (id) => {
    setSelectedReviewStatuses((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }
  const viewOptions = [
    { id: 'list', label: 'List', icon: 'list' },
    { id: 'week', label: 'Week', icon: 'week' },
    { id: 'month', label: 'Month', icon: 'month' },
  ]
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const getMonday = (d) => {
    const x = new Date(d)
    x.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    return x
  }
  const monthGrid = (() => {
    const y = viewDate.getFullYear()
    const m = viewDate.getMonth()
    const first = new Date(y, m, 1)
    const last = new Date(y, m + 1, 0)
    const start = getMonday(first)
    const weeks = []
    let d = new Date(start)
    while (weeks.length < 6) {
      const row = []
      for (let i = 0; i < 7; i++) {
        row.push(d.getMonth() === m ? d.getDate() : null)
        d.setDate(d.getDate() + 1)
      }
      weeks.push(row)
      if (d > last) break
    }
    return weeks
  })()
  const weekRow = (() => {
    const mon = getMonday(new Date(viewDate))
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mon)
      d.setDate(mon.getDate() + i)
      return d
    })
  })()
  const listMonthDates = (() => {
    const y = viewDate.getFullYear()
    const m = viewDate.getMonth()
    const last = new Date(y, m + 1, 0).getDate()
    return Array.from({ length: last }, (_, i) => i + 1)
  })()
  const viewTitle = activeViewOption === 'month' || activeViewOption === 'list'
    ? `${monthNames[viewDate.getMonth()]} ${viewDate.getFullYear()}`
    : (() => {
        const mon = weekRow[0]
        const sun = weekRow[6]
        return `Week of ${mon.getDate()} ${monthNames[mon.getMonth()]} – ${sun.getDate()} ${monthNames[sun.getMonth()]} ${sun.getFullYear()}`
      })()
  const goPrev = () => {
    if (activeViewOption === 'week') {
      setViewDate((d) => { const x = new Date(d); x.setDate(d.getDate() - 7); return x })
    } else {
      setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
    }
  }
  const goNext = () => {
    if (activeViewOption === 'week') {
      setViewDate((d) => { const x = new Date(d); x.setDate(d.getDate() + 7); return x })
    } else {
      setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
    }
  }
  const getCellDate = (ri, ci) => {
    const y = viewDate.getFullYear()
    const m = viewDate.getMonth()
    const start = getMonday(new Date(y, m, 1))
    const d = new Date(start)
    d.setDate(start.getDate() + ri * 7 + ci)
    return d
  }
  const entryMatchesCell = (ri, ci, entry) => {
    const cellDate = getCellDate(ri, ci)
    return cellDate >= entry.startDate && cellDate <= entry.endDate && cellDate.getMonth() === entry.startDate.getMonth()
  }
  const getEntriesForCell = (ri, ci) => CALENDAR_ENTRIES.filter((e) => entryMatchesCell(ri, ci, e))
  const openDrawerForEdit = (entry) => {
    const e = entry || SAMPLE_CALENDAR_ENTRY
    setPinnedHoverEntryId(null)
    setEditingScheduleEntry(e)
    setDrawerForm({
      module: e.type || 'replenishment',
      modules: e.type ? [e.type] : [],
      name: e.title,
      sending: e.from,
      receiving: e.to,
      repeats: 'weekly',
      time: e.time.replace(/\s+PST$/, ''),
      timeZone: 'pst',
      endsOn: `${monthNames[e.endDate.getMonth()]} ${e.endDate.getDate()}, ${e.endDate.getFullYear()}`,
      notify: '',
    })
    setScheduleDrawerDays({ Mon: true, Tue: false, Wed: true, Thu: false, Fri: true, Sat: false, Sun: false })
    setScheduleDrawerOpen(true)
  }
  const closeDrawer = () => {
    setScheduleDrawerOpen(false)
    setEditingScheduleEntry(null)
    setModuleDropdownOpen(false)
  }
  const toggleModule = (id) => {
    setDrawerForm((f) => ({
      ...f,
      modules: f.modules.includes(id) ? f.modules.filter((m) => m !== id) : [...f.modules, id],
    }))
  }
  const eventDatePickerGrid = (() => {
    const y = eventDatePickerViewDate.getFullYear()
    const m = eventDatePickerViewDate.getMonth()
    const first = new Date(y, m, 1)
    const last = new Date(y, m + 1, 0)
    const start = getMonday(first)
    const rows = []
    let d = new Date(start)
    for (let row = 0; row < 6; row++) {
      const cells = []
      for (let col = 0; col < 7; col++) {
        cells.push({ date: d.getDate(), month: d.getMonth(), fullDate: new Date(d) })
        d.setDate(d.getDate() + 1)
      }
      rows.push(cells)
    }
    return rows
  })()
  const isSameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  const eventDatePickerPrevMonth = () => setEventDatePickerViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const eventDatePickerNextMonth = () => setEventDatePickerViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  return (
    <div className="flex flex-col gap-6">
      {pinnedHoverEntryId && (
        <div role="presentation" className="fixed inset-0 z-40" onClick={() => { setPinnedHoverEntryId(null); setPinnedHoverCellKey(null) }} aria-hidden />
      )}
      <div className="flex flex-col gap-6" data-name="Optimiser" data-node-id="174:2696">
        <div className="bg-[#f3f4f6] border border-[#ebf3ff] rounded-[14px] p-6 flex flex-col gap-5" data-name="Calendar container" data-node-id="174:2767">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <IconCalendarSidebar className="text-[#22272f] size-6 shrink-0" />
            <div>
              <p className="text-[16px] font-medium text-[#0a0a0a] leading-tight">Optimiser Schedule & jobs</p>
              <p className="text-[14px] font-normal text-[#4b535c]">Perform all job and schedule actions for all your upcoming inventory</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onAddJob?.() }}
            className="h-10 px-4 rounded-[4px] bg-[#0267ff] text-white text-[16px] font-medium flex items-center gap-2 shrink-0"
          >
            <IconPlus />
            Add Job
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingScheduleEntry(null)
              setDrawerForm(DEFAULT_DRAWER_FORM)
              setScheduleDrawerDays({ Wed: true, Sat: true })
              setScheduleDrawerOpen(true)
            }}
            className="h-10 px-4 rounded-[4px] bg-[#0267ff] text-white text-[16px] font-medium flex items-center gap-2 shrink-0"
          >
            <IconPlus />
            Add Schedule
          </button>
        </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="bg-white border border-[#e9eaeb] flex gap-[var(--spacing-s,8px)] items-center p-[var(--spacing-xxs,4px)] rounded-[var(--border-radius-s,4px)] shrink-0 h-12" data-name="segment-control" data-node-id="202:3165">
            {typeFilters.map((f) => {
              const isActive = activeTypeFilter === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveTypeFilter(f.id)}
                  className={`flex gap-[var(--spacing-xs,6px)] items-center justify-center max-h-[32px] p-[var(--spacing-s,8px)] rounded-[2px] shrink-0 text-[14px] text-center whitespace-nowrap ${isActive ? 'bg-[#f8f8f8] font-medium text-[#0a0a0a]' : 'font-normal text-[#4b535c]'}`}
                  data-name="Segment element"
                >
                  {f.icon === 'replenishment' && <IconReplenishment className="text-[#22272f] size-4 shrink-0" aria-hidden />}
                  {f.icon === 'reorder' && <IconReorder className="text-[#22272f] size-4 shrink-0" aria-hidden />}
                  {f.icon === 'rebalancing' && <IconRebalancing className="text-[#22272f] size-4 shrink-0" aria-hidden />}
                  <span>{f.label}</span>
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-2 ml-auto shrink-0">
          <div className="flex items-center gap-2 relative" data-name="Review status multiselect" data-node-id="12771:5757">
            <button
              type="button"
              onClick={() => { setReviewStatusDropdownOpen((o) => !o); setEventDatePickerOpen(false) }}
              className={`flex items-center justify-between gap-2 h-12 px-4 py-3 rounded-[4px] bg-white text-[16px] font-medium text-left shrink-0 min-w-[160px] border ${reviewStatusDropdownOpen ? 'border-[#0267ff]' : 'border-[#e9eaeb]'}`}
            >
              <span className={selectedReviewStatuses.length === 0 ? 'text-[#0a0a0a]' : 'text-[#0a0a0a]'}>
                Review status
                {selectedReviewStatuses.length > 0 && (
                  <span className="text-[#4b535c] font-normal">
                    {' · '}
                    {selectedReviewStatuses.length === reviewStatusFilterOptions.length
                      ? 'Upcoming, In review, Submitted'
                      : reviewStatusFilterOptions.filter((o) => selectedReviewStatuses.includes(o.id)).map((o) => o.label).join(', ')}
                  </span>
                )}
              </span>
              <IconChevronDown className="text-[#22272f] size-4 shrink-0" aria-hidden />
            </button>
            {reviewStatusDropdownOpen && (
              <>
                <div role="presentation" className="fixed inset-0 z-40" onClick={() => setReviewStatusDropdownOpen(false)} aria-hidden />
                <div
                  className="absolute left-0 top-full mt-1 z-50 w-full min-w-[200px] bg-white border border-[#e9eaeb] rounded-[4px] p-2 shadow-[0px_8px_25px_0px_rgba(0,0,0,0.12)]"
                  data-name="Dropdown list"
                  data-node-id="12771:5850"
                >
                  {reviewStatusFilterOptions.map((opt) => {
                    const selected = selectedReviewStatuses.includes(opt.id)
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleReviewStatusFilter(opt.id)}
                        className="w-full flex gap-2 items-center p-3 rounded-[3px] text-left hover:bg-[#f8f8f8] focus:bg-[#f8f8f8]"
                        data-name="Dropdown item"
                      >
                        <span className="flex items-center justify-center shrink-0 size-6">
                          <span className={`flex items-center justify-center rounded-[4px] size-5 border-2 ${selected ? 'bg-[#0267ff] border-[#0267ff]' : 'bg-white border-[#e5e7eb]'}`}>
                            {selected && (
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white"><path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            )}
                          </span>
                        </span>
                        <span className="flex-1 text-[12px] font-medium text-[#0a0a0a] leading-normal">{opt.label}</span>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 relative">
            <button
              type="button"
              onClick={() => { setEventDatePickerOpen((o) => !o); setEventDatePickerViewDate(eventDateSelected || new Date(2026, 1, 1)); setReviewStatusDropdownOpen(false) }}
              className="flex items-center gap-[var(--spacing-s,8px)] h-12 px-[var(--spacing-l,16px)] py-[var(--spacing-m,12px)] rounded-[var(--border-radius-s,4px)] bg-white border border-[#e9eaeb] text-[16px] font-medium text-[#0a0a0a] shrink-0"
              data-name="Button"
              data-node-id="202:3228"
            >
              <IconCalendarSidebar className="text-[#22272f] size-4 shrink-0" aria-hidden data-name="icon" data-node-id="I202:3228;12027:34152" />
              <span data-node-id="I202:3228;12027:34153">Event Date</span>
            </button>
            {eventDatePickerOpen && (
              <>
                <div role="presentation" className="fixed inset-0 z-40" onClick={() => setEventDatePickerOpen(false)} aria-hidden />
                <div className="absolute left-0 top-full mt-2 z-50 w-[336px] bg-white border border-[#e9eaeb] rounded-[4px] p-4 flex flex-col gap-3 shadow-lg" data-name="Datepicker" data-node-id="2360:105506">
                  <div className="flex items-center justify-between p-1">
                    <button type="button" onClick={eventDatePickerPrevMonth} className="flex items-center justify-center h-10 w-10 rounded-[4px] text-[#0a0a0a] hover:bg-[#f3f4f6]" aria-label="Previous month">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                    <p className="text-[18px] font-medium text-[#0a0a0a] leading-none">
                      {monthNames[eventDatePickerViewDate.getMonth()]}, {eventDatePickerViewDate.getFullYear()}
                    </p>
                    <button type="button" onClick={eventDatePickerNextMonth} className="flex items-center justify-center h-10 w-10 rounded-[4px] text-[#0a0a0a] hover:bg-[#f3f4f6]" aria-label="Next month">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  </div>
                  <div className="flex flex-col gap-0">
                    <div className="grid grid-cols-7">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((wd) => (
                        <div key={wd} className="size-12 flex items-center justify-center text-[14px] font-medium text-[#4b535c]">
                          {wd}
                        </div>
                      ))}
                    </div>
                    {eventDatePickerGrid.map((row, ri) => (
                      <div key={ri} className="grid grid-cols-7">
                        {row.map((cell, ci) => {
                          const inMonth = cell.month === eventDatePickerViewDate.getMonth()
                          const selected = isSameDay(cell.fullDate, eventDateSelected)
                          return (
                            <div key={`${ri}-${ci}`} className="size-12 flex items-center justify-center p-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEventDateSelected(cell.fullDate)
                                  setViewDate(new Date(cell.fullDate.getFullYear(), cell.fullDate.getMonth(), 1))
                                  setEventDatePickerOpen(false)
                                }}
                                className={`size-10 flex items-center justify-center rounded-[2px] text-[14px] ${selected ? 'bg-[#0267ff] text-white font-bold' : inMonth ? 'text-[#0a0a0a] hover:bg-[#f3f4f6]' : 'text-[#4b535c] opacity-50 hover:bg-[#f3f4f6]'}`}
                              >
                                {cell.date}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
            <div className="bg-white border border-[#e9eaeb] flex gap-[var(--spacing-s,8px)] items-center p-[var(--spacing-xxs,4px)] rounded-[var(--border-radius-s,4px)] shrink-0 h-12" data-name="segment-control" data-node-id="203:1343">
              {viewOptions.map((v) => {
                const isActive = activeViewOption === v.id
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setActiveViewOption(v.id)}
                    className={`flex gap-[var(--spacing-xs,6px)] items-center justify-center max-h-[32px] p-[var(--spacing-s,8px)] rounded-[2px] shrink-0 text-[14px] text-center whitespace-nowrap ${isActive ? 'bg-[#f8f8f8] font-medium text-[#0a0a0a]' : 'font-normal text-[#4b535c]'}`}
                    data-name="Segment element"
                  >
                    {v.icon === 'list' && <IconList className="text-[#22272f] size-4 shrink-0" aria-hidden />}
                    {v.icon === 'week' && <IconCalendarNote className="text-[#22272f] size-4 shrink-0" aria-hidden />}
                    {v.icon === 'month' && <IconCalendarSidebar className="text-[#22272f] size-4 shrink-0" aria-hidden />}
                    <span>{v.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4 h-7">
            <button type="button" onClick={goPrev} className="rounded size-7 flex items-center justify-center text-[#0a0a0a] hover:bg-[#f3f4f6]" aria-label={activeViewOption === 'week' ? 'Previous week' : 'Previous month'}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <h2 className="text-[20px] font-semibold text-[#0a0a0a] tracking-tight">{viewTitle}</h2>
            <button type="button" onClick={goNext} className="rounded size-7 flex items-center justify-center text-[#0a0a0a] hover:bg-[#f3f4f6]" aria-label={activeViewOption === 'week' ? 'Next week' : 'Next month'}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
          {activeViewOption === 'month' && (
            <div className="border border-[#e5e7eb] rounded-[10px] overflow-visible relative">
              <div className="grid grid-cols-7 bg-[#f3f4f6] border-b border-[#e5e7eb]">
                {weekDays.map((day) => (
                  <div key={day} className="py-3 text-center text-[14px] font-medium text-[#364153] border-r border-[#e5e7eb] last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {monthGrid.map((row, ri) =>
                  row.map((date, ci) => {
                    const rawCellEntries = date !== null ? getEntriesForCell(ri, ci) : []
                    const byReview =
                      selectedReviewStatuses.length === 0
                        ? rawCellEntries
                        : rawCellEntries.filter((e) =>
                            selectedReviewStatuses.includes(entryReviewStatus[e.id] || 'upcoming')
                          )
                    const cellEntries = activeTypeFilter === 'all'
                      ? byReview
                      : byReview.filter((e) => e.type === activeTypeFilter)
                    const cellDate = getCellDate(ri, ci)
                    const isEventDate = eventDateSelected && isSameDay(cellDate, eventDateSelected)
                    const cellKey = `${ri}-${ci}`
                    return (
                      <div
                        key={`${ri}-${ci}`}
                        className={`min-h-[80px] p-2 border-b border-[#e5e7eb] text-[14px] text-[#0a0a0a] ${ci < 6 ? 'border-r' : ''} ${date === null ? 'text-[#9ca3af]' : ''} ${cellEntries.length > 0 ? 'cursor-pointer' : ''} ${isEventDate ? 'bg-[#ebf3ff] ring-2 ring-inset ring-[#0267ff]' : 'bg-white'}`}
                      >
                        {date ?? ''}
                        {cellEntries.map((entry) => {
                          const Icon = entry.type === 'reorder' ? IconReorder : entry.type === 'rebalancing' ? IconRebalancing : IconReplenishment
                          const reviewStatus = entryReviewStatus[entry.id] || 'upcoming'
                          const reviewLabel = reviewStatus === 'in review' ? 'In review' : reviewStatus === 'submitted' ? 'Submitted' : 'Upcoming'
                          const isPopoverOpen = (pinnedHoverEntryId === entry.id && pinnedHoverCellKey === cellKey) || (hoveredEntryId === entry.id && hoveredCellKey === cellKey && !pinnedHoverEntryId)
                          const clearHoverLater = () => {
                            if (hoverLeaveTimeoutRef.current) clearTimeout(hoverLeaveTimeoutRef.current)
                            hoverLeaveTimeoutRef.current = setTimeout(() => { setHoveredEntryId(null); setHoveredCellKey(null) }, 150)
                          }
                          const setHovered = () => {
                            if (hoverLeaveTimeoutRef.current) {
                              clearTimeout(hoverLeaveTimeoutRef.current)
                              hoverLeaveTimeoutRef.current = null
                            }
                            setHoveredEntryId(entry.id)
                            setHoveredCellKey(cellKey)
                          }
                          return (
                            <div key={entry.id} className="relative group mt-1 w-fit">
                              <div
                                className={`px-2 py-1 rounded-[var(--Border-radius-m,6px)] border border-[var(--tokens-stroke-or-resting,#e9eaeb)] flex flex-col gap-1 w-fit shrink-0 cursor-pointer ${reviewStatus === 'in review' ? 'bg-[var(--tokens-destructive-50,#FFEAEA)]' : reviewStatus === 'submitted' ? 'bg-[var(--tokens-success-50,#E4F4EF)]' : 'bg-[var(--tokens-warning-50,#FFF6E5)]'}`}
                                onClick={() => {
                                  if (pinnedHoverEntryId === entry.id && pinnedHoverCellKey === cellKey) {
                                    setPinnedHoverEntryId(null)
                                    setPinnedHoverCellKey(null)
                                  } else {
                                    setPinnedHoverEntryId(entry.id)
                                    setPinnedHoverCellKey(cellKey)
                                  }
                                }}
                                onMouseEnter={setHovered}
                                onMouseLeave={clearHoverLater}
                              >
                                <div className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--Tokens-Foreground,#00050A)]">
                                  <Icon className="size-3.5 shrink-0" aria-hidden />
                                  {entry.title}
                                </div>
                                <div className="flex items-center gap-[5px]">
                                  <span className="text-[12px] text-[#4b535c] leading-normal">Review</span>
                                  <span className="bg-white border border-[#bfd9ff] px-1 py-0.5 rounded-[5px] text-[12px] text-[#0a0a0a] leading-normal shrink-0">{reviewLabel}</span>
                                </div>
                              </div>
                              <div
                                role="dialog"
                                aria-label="Schedule details"
                                className={`absolute left-[100%] top-0 ml-2 w-[320px] rounded-[12px] bg-white border border-[#e9eaeb] shadow-lg overflow-hidden z-50 transition-opacity ${isPopoverOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                                onMouseEnter={setHovered}
                                onMouseLeave={clearHoverLater}
                              >
                                <div className="p-4 flex flex-col gap-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="flex items-center justify-center w-8 h-8 rounded-[8px] bg-[#ebf3ff] text-[#0267ff]">
                                        <Icon className="size-4" />
                                      </span>
                                      <div>
                                        <p className="text-[14px] font-semibold text-[#0a0a0a]">{entry.title}</p>
                                        <p className="text-[12px] text-[#4b535c]">
                                          {monthNames[entry.startDate.getMonth()]} {entry.startDate.getDate()} – {entry.endDate.getDate()}, {entry.endDate.getFullYear()}
                                        </p>
                                      </div>
                                    </div>
                                    <button type="button" onClick={() => openDrawerForEdit(entry)} className="shrink-0 h-8 px-3 rounded-[4px] text-[13px] font-medium text-[#0267ff] hover:bg-[#ebf3ff]">
                                      Edit schedule
                                    </button>
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                    <p className="text-[12px] font-medium text-[#4b535c]">Review status</p>
                                    <p className="text-[14px] font-medium text-[#0a0a0a]">{reviewLabel}</p>
                                  </div>
                                  <div className="h-px bg-[#e9eaeb]" />
                                  <div className="flex items-center gap-2 text-[13px] text-[#0a0a0a]">
                                    <span className="text-[#4b535c]">{entry.from}</span>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[#4b535c]"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    <span className="text-[#4b535c]">{entry.to}</span>
                                  </div>
                                  <p className="text-[13px] text-[#4b535c]">{entry.time}</p>
                                  <div className="h-px bg-[#e9eaeb]" />
                                  <div className="flex justify-between text-[13px]">
                                    <span className="text-[#4b535c]">Transfer units</span>
                                    <span className="text-[#0a0a0a] font-medium">{entry.transferUnits}</span>
                                  </div>
                                  <div className="flex justify-between text-[13px]">
                                    <span className="text-[#4b535c]">Available to send</span>
                                    <span className="text-[#0a0a0a] font-medium">{entry.availableToSend}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-[#4b535c]">Trip type</span>
                                    <span className="text-[#0a0a0a] font-medium flex items-center gap-1"><IconTruck className="size-3.5" /> {entry.tripType}</span>
                                  </div>
                                  <div className="h-px bg-[#e9eaeb]" />
                                  <div className="rounded-[8px] bg-[#eff6ff] p-3 flex flex-col gap-2">
                                    <div className="flex justify-between items-center text-[13px]">
                                      <span className="text-[#4b535c]">Recommended units</span>
                                      <span className="text-[#0a0a0a] font-medium flex items-center gap-1"><IconTrendUp className="size-3.5" /> {entry.recommendedUnits}</span>
                                    </div>
                                    <div className="flex justify-between text-[13px]">
                                      <span className="text-[#4b535c]">Revenue increase</span>
                                      <span className="font-medium text-[#059669]">${entry.revenueIncrease}</span>
                                    </div>
                                  </div>
                                  <div className="h-px bg-[#e9eaeb]" />
                                  <div className="flex items-start gap-2">
                                    <IconLightbulb className="size-4 text-[#4b535c] shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-[13px] font-medium text-[#0a0a0a]">Recommendation reasons</p>
                                      <ul className="mt-1 text-[13px] text-[#4b535c] list-disc list-inside">
                                        {entry.reasons.map((r) => (
                                          <li key={r}>{r}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => openDrawerForEdit(entry)}
                                    className="w-full h-10 px-4 rounded-[4px] bg-[#0267ff] text-white text-[16px] font-medium flex items-center justify-center gap-2 shrink-0"
                                  >
                                    <IconEdit />
                                    Edit Job
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
          {activeViewOption === 'week' && (
            <div className="border border-[#e5e7eb] rounded-[10px] overflow-hidden">
              <div className="grid grid-cols-7 bg-[#f3f4f6] border-b border-[#e5e7eb]">
                {weekDays.map((day) => (
                  <div key={day} className="py-3 text-center text-[14px] font-medium text-[#364153] border-r border-[#e5e7eb] last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {weekRow.map((d, i) => (
                  <div key={i} className="min-h-[80px] p-2 border-r border-[#e5e7eb] bg-white text-[14px] text-[#0a0a0a] last:border-r-0">
                    {d.getDate()}
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeViewOption === 'list' && (
            <div className="border border-[#e5e7eb] rounded-[10px] overflow-hidden">
              <div className="bg-[#f3f4f6] border-b border-[#e5e7eb] py-3 px-4 text-[14px] font-medium text-[#364153]">
                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()} – list
              </div>
              <div className="divide-y divide-[#e5e7eb] bg-white">
                {listMonthDates.length === 0 ? (
                  <div className="py-8 px-4 text-[14px] text-[#4b535c] text-center">No schedules</div>
                ) : (
                  listMonthDates.map((date) => (
                    <div key={date} className="flex items-center gap-4 min-h-[48px] px-4 py-2 text-[14px] text-[#0a0a0a]">
                      <span className="font-medium w-8">{date}</span>
                      <span className="text-[#4b535c]">{monthNames[viewDate.getMonth()].slice(0, 3)}</span>
                      <span className="text-[#4b535c] flex-1">No schedule</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {scheduleDrawerOpen && (
        <>
          <div role="presentation" className="fixed inset-0 bg-black/50 z-40" onClick={closeDrawer} aria-hidden />
          <div className="fixed right-0 top-0 bottom-0 w-[800px] bg-white shadow-xl z-50 flex flex-col" role="dialog" aria-modal aria-labelledby="add-schedule-title" data-name={editingScheduleEntry ? 'Edit schedule' : 'Add Schedule'} data-node-id="214:2622">
            <header className="flex items-center justify-between shrink-0 h-14 px-6 border-b border-[#e9eaeb]">
              <h2 id="add-schedule-title" className="text-[18px] font-semibold text-[#0a0a0a]">{editingScheduleEntry ? 'Edit schedule' : 'Add Schedule'}</h2>
              <button type="button" onClick={closeDrawer} className="p-2 -mr-2 text-[#4b535c] hover:bg-[#f3f4f6] rounded-[4px]" aria-label="Close">
                <IconClose />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              <section className="flex flex-col gap-2">
                <p className="text-[14px] font-medium text-[#0a0a0a]">Choose module to create schedule <span className="font-normal text-[#4b535c]">Make a selection</span></p>
                <label className="text-[14px] font-normal text-[#4b535c]">Module</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setModuleDropdownOpen((o) => !o)}
                    className={`w-full h-10 flex items-center justify-between gap-2 px-3 rounded-[4px] border bg-white text-[14px] text-left ${moduleDropdownOpen ? 'border-[#0267ff]' : 'border-[#e9eaeb]'}`}
                    data-name="Input multiple select"
                    data-node-id="12770:4659"
                  >
                    <span className={drawerForm.modules.length === 0 ? 'text-[#4b535c]' : 'text-[#0a0a0a]'}>
                      {drawerForm.modules.length === 0
                        ? 'Select'
                        : drawerForm.modules.map((id) => MODULE_OPTIONS.find((o) => o.id === id)?.label).filter(Boolean).join(', ')}
                    </span>
                    <IconChevronDownSelect />
                  </button>
                  {moduleDropdownOpen && (
                    <>
                      <div role="presentation" className="fixed inset-0 z-[60]" onClick={() => setModuleDropdownOpen(false)} aria-hidden />
                      <div
                        className="absolute left-0 top-full mt-1 z-[70] w-full min-w-[200px] bg-white border border-[#e9eaeb] rounded-[4px] p-2 shadow-[0px_8px_25px_0px_rgba(0,0,0,0.12)]"
                        data-name="Dropdown list"
                        data-node-id="12771:5850"
                      >
                        {MODULE_OPTIONS.map((opt) => {
                          const selected = drawerForm.modules.includes(opt.id)
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => toggleModule(opt.id)}
                              className="w-full flex gap-2 items-center p-3 rounded-[3px] text-left hover:bg-[#f8f8f8] focus:bg-[#f8f8f8]"
                              data-name="Dropdown item"
                              data-node-id="12771:5851"
                            >
                              <span className="flex items-center justify-center shrink-0 size-6">
                                <span className={`flex items-center justify-center rounded-[4px] size-5 border-2 ${selected ? 'bg-[#0267ff] border-[#0267ff]' : 'bg-white border-[#e5e7eb]'}`}>
                                  {selected && (
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white"><path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                  )}
                                </span>
                              </span>
                              <span className="flex-1 text-[12px] font-medium text-[#0a0a0a] leading-normal">{opt.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              </section>
              <section className="flex flex-col gap-2">
                <p className="text-[14px] font-medium text-[#0a0a0a]">Give your schedule a name:</p>
                <label className="text-[14px] font-normal text-[#4b535c]">Name schedule</label>
                <input type="text" placeholder="Placeholder" value={drawerForm.name} onChange={(ev) => setDrawerForm((f) => ({ ...f, name: ev.target.value }))} className="w-full h-10 px-3 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#0a0a0a] placeholder:text-[#4b535c]" />
                <p className="text-[12px] font-normal text-[#4b535c]">If not assigned, name will be given automatically</p>
              </section>
              <section className="flex flex-col gap-2">
                <p className="text-[14px] font-medium text-[#0a0a0a]">Scheduling Dates <span className="font-normal text-[#4b535c]">Make a selection</span></p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[14px] font-normal text-[#4b535c]">Sending location</label>
                    <div className="relative">
                      <select value={drawerForm.sending} onChange={(ev) => setDrawerForm((f) => ({ ...f, sending: ev.target.value }))} className="w-full h-10 pl-3 pr-9 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#0a0a0a] appearance-none">
                        <option value="">Select</option>
                        <option value="Warehouse A">Warehouse A</option>
                        <option value="Warehouse B">Warehouse B</option>
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b535c] pointer-events-none"><IconChevronDownSelect /></span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[14px] font-normal text-[#4b535c]">Receiving location</label>
                    <div className="relative">
                      <select value={drawerForm.receiving} onChange={(ev) => setDrawerForm((f) => ({ ...f, receiving: ev.target.value }))} className="w-full h-10 pl-3 pr-9 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#0a0a0a] appearance-none">
                        <option value="">Select</option>
                        <option value="Store A">Store A</option>
                        <option value="Store B">Store B</option>
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b535c] pointer-events-none"><IconChevronDownSelect /></span>
                    </div>
                  </div>
                </div>
              </section>
              <section className="flex flex-col gap-2">
                <p className="text-[14px] font-medium text-[#0a0a0a]">Schedule:</p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex flex-col gap-1 min-w-[140px]">
                    <label className="text-[14px] font-normal text-[#4b535c]">Repeats</label>
                    <div className="relative">
                      <select value={drawerForm.repeats} onChange={(ev) => setDrawerForm((f) => ({ ...f, repeats: ev.target.value }))} className="w-full h-10 pl-3 pr-9 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#0a0a0a] appearance-none">
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly (Every 2 weeks)</option>
                        <option value="monthly">Monthly</option>
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b535c] pointer-events-none"><IconChevronDownSelect /></span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 min-w-[100px]">
                    <label className="text-[14px] font-normal text-[#4b535c]">Time</label>
                    <div className="relative">
                      <select value={drawerForm.time} onChange={(ev) => setDrawerForm((f) => ({ ...f, time: ev.target.value }))} className="w-full h-10 pl-3 pr-9 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#0a0a0a] appearance-none">
                        <option value="">Select time</option>
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b535c] pointer-events-none"><IconChevronDownSelect /></span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 min-w-[160px]">
                    <label className="text-[14px] font-normal text-[#4b535c]">Time zone</label>
                    <div className="relative">
                      <select value={drawerForm.timeZone} onChange={(ev) => setDrawerForm((f) => ({ ...f, timeZone: ev.target.value }))} className="w-full h-10 pl-3 pr-9 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#0a0a0a] appearance-none">
                        <option value="pst">PST</option>
                        <option value="gmt+1">(GMT +1) Central Europe</option>
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b535c] pointer-events-none"><IconChevronDownSelect /></span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[14px] font-normal text-[#4b535c]">Day selection</label>
                  <div className="flex gap-2 flex-wrap">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                      const selected = scheduleDrawerDays[day]
                      return (
                        <button key={day} type="button" onClick={() => toggleScheduleDay(day)} className={`h-9 px-3 rounded-[4px] border text-[14px] font-normal shrink-0 ${selected ? 'border-[#0267ff] bg-[#ebf3ff] text-[#0267ff]' : 'border-[#e9eaeb] bg-white text-[#4b535c] hover:bg-[#f3f4f6]'}`}>
                          {day}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </section>
              <section className="flex flex-col gap-2">
                <label className="text-[14px] font-normal text-[#4b535c]">Ends on</label>
                <div className="relative">
                  <input type="text" placeholder="Select date" value={drawerForm.endsOn} onChange={(ev) => setDrawerForm((f) => ({ ...f, endsOn: ev.target.value }))} className="w-full h-10 pl-3 pr-10 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#0a0a0a] placeholder:text-[#4b535c]" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b535c] pointer-events-none"><IconCalendarSidebar className="size-4" /></span>
                </div>
                <p className="text-[12px] font-normal text-[#4b535c]">If left empty, rebalancing will be repeating indefinitely</p>
              </section>
              <section className="flex flex-col gap-2">
                <p className="text-[14px] font-medium text-[#0a0a0a]">Notify users:</p>
                <input type="text" placeholder="Enter user emails" value={drawerForm.notify} onChange={(ev) => setDrawerForm((f) => ({ ...f, notify: ev.target.value }))} className="w-full h-10 px-3 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#0a0a0a] placeholder:text-[#4b535c]" />
              </section>
            </div>
            <footer className="flex items-center justify-end gap-3 shrink-0 p-6 border-t border-[#e9eaeb]">
              <button type="button" onClick={closeDrawer} className="h-10 px-4 rounded-[4px] text-[16px] font-medium text-[#0a0a0a] hover:bg-[#f3f4f6]">
                Cancel
              </button>
              <button type="button" className="h-10 px-4 rounded-[4px] bg-[#0267ff] text-white text-[16px] font-medium">
                {editingScheduleEntry ? 'Save changes' : 'Add Schedule'}
              </button>
            </footer>
          </div>
        </>
      )}
    </div>
  )
}
