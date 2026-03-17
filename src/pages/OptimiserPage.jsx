import { useState, useRef, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import { IconCalendarSidebar, IconPlus, IconReplenishment, IconReorder, IconRebalancing, IconChevronDown, IconList, IconCalendarNote, IconTruck, IconTrendUp, IconLightbulb, IconEdit, IconClose, IconChevronDownSelect, IconArrowLeft, IconFilterFunnel, IconSearch } from '../components/icons'

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
const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => i + 1)
const MODULE_OPTIONS = [
  { id: 'replenishment', label: 'Replenishment' },
  { id: 'reorder', label: 'Reorder' },
  { id: 'rebalancing', label: 'Rebalancing' },
]

export default function OptimiserPage({ onAddJob, openScheduleDrawer, openAddJob, resetToUpcoming, openCreateSchedulePage, resetToRecommendationsLanding, onOpenScheduleDetail }) {
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
  const [activeStatusTab, setActiveStatusTab] = useState('next')
  const [expandedExceptionsScheduleId, setExpandedExceptionsScheduleId] = useState(null)
  const [isCreateSchedulePage, setIsCreateSchedulePage] = useState(false)
  const [accordionOpen, setAccordionOpen] = useState({
    details: true,
    scope: false,
    exceptions: false,
  })
  const [scopeOption, setScopeOption] = useState('include-all')
  const [productFilterOpen, setProductFilterOpen] = useState({
    departments: false,
    subDepartments: false,
    seasons: false,
    events: false,
    productGroups: false,
  })
  const [geoFilterOpen, setGeoFilterOpen] = useState({
    locationTypes: false,
    regions: false,
    countries: false,
    locations: false,
  })
  const DEFAULT_PRODUCT_FILTER_OPEN = { departments: false, subDepartments: false, seasons: false, events: false, productGroups: false }
  const DEFAULT_GEO_FILTER_OPEN = {
    locationTypes: false,
    regions: false,
    countries: false,
    locations: false,
  }
  const DEFAULT_PRODUCT_FILTER_SELECTED = { departments: [], subDepartments: [], seasons: [], events: [], productGroups: [] }
  const DEFAULT_GEO_FILTER_SELECTED = {
    locationTypes: [], regions: [], countries: [], locations: [],
  }
  const EXCEPTION_FILTER_OPTIONS = [
    { id: 'advanced', label: 'Advanced filters', highlight: true },
    { id: 'departments', label: 'Departments', options: ['Cadeaux', 'Exotiques', 'Femme', 'Homme', 'Voyage'] },
    { id: 'subDepartments', label: 'Sub-departments', options: ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo'] },
    { id: 'seasons', label: 'Seasons', options: ['25E', '25S', '25W', '26E', '26S'] },
    { id: 'events', label: 'Events', options: ['Sale', 'New arrivals', 'Promo'] },
    { id: 'productGroups', label: 'Product groups', options: ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo'] },
    { id: 'locationTypes', label: 'Location Types', options: ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo'] },
    { id: 'regions', label: 'Regions', options: ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo'] },
    { id: 'countries', label: 'Countries', options: ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo'] },
    { id: 'locations', label: 'Locations', options: ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo'] },
  ]
  const [exceptions, setExceptions] = useState(() => [
    {
      id: 'exc-1',
      expanded: true,
      advancedRows: [{ id: 'adv-1', conditions: [{ id: 'cond-1', mainColumn: '', condition: '', value: '' }] }],
      productFilterOpen: { ...DEFAULT_PRODUCT_FILTER_OPEN },
      geoFilterOpen: { ...DEFAULT_GEO_FILTER_OPEN },
      productFilterSelected: { ...DEFAULT_PRODUCT_FILTER_SELECTED },
      geoFilterSelected: { ...DEFAULT_GEO_FILTER_SELECTED },
      filtersDropdownOpen: false,
      openFilterPopover: null,
      activeFilterTypes: [],
      filterSearchQuery: '',
    },
  ])
  const [advancedRowNextId, setAdvancedRowNextId] = useState(2)
  const [advancedConditionNextId, setAdvancedConditionNextId] = useState(2)
  const [exceptionNextId, setExceptionNextId] = useState(2)
  const [recurrenceRepeatEvery, setRecurrenceRepeatEvery] = useState(1)
  const [recurrenceRepeatUnit, setRecurrenceRepeatUnit] = useState('week')
  const [recurrenceSubmissionDayOfWeek, setRecurrenceSubmissionDayOfWeek] = useState(3)
  const [recurrenceSubmissionDayOfMonth, setRecurrenceSubmissionDayOfMonth] = useState(1)
  const [recurrenceSubmissionDateYear, setRecurrenceSubmissionDateYear] = useState('')
  const [recurrenceSubmissionTime, setRecurrenceSubmissionTime] = useState('09:00')
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
  const statusTabs = [
    { id: 'next', label: 'Next' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'failed', label: 'Failed' },
    { id: 'submitted', label: 'Submitted' },
  ]
  const nextSchedules = [
    {
      id: 'eu-monthly-rebal',
      name: 'Europe monthly rebal',
      created: '24/02/2026',
      deadline: '28/02/2026',
      status: 'Ready to review',
      exceptions: '12',
      approved: '96',
      metrics: [
        { label: 'Revenue increase', value: '€501.1K' },
        { label: 'Stockouts', value: '1,013 → 559' },
        { label: 'Recommended transfers', value: '2,308' },
        { label: 'Unique trips', value: '113' },
      ],
      exceptionsTotal: 2,
      exceptionsList: [
        { description: 'Exception 1 — Transfer units lower than 10 · Location: Opéra' },
        { description: 'Exception 2 — Product: A1252810, A12528YY, A13314YY' },
      ],
    },
    {
      id: 'uk-weekly-replen',
      name: 'UK weekly replenishment',
      created: '04/05/2026',
      deadline: '06/05/2026',
      status: 'Ready to review',
      exceptions: '5',
      approved: '42',
      metrics: [
        { label: 'Revenue increase', value: '€210.4K' },
        { label: 'Stockouts', value: '512 → 304' },
        { label: 'Recommended transfers', value: '1,120' },
        { label: 'Unique trips', value: '48' },
      ],
    },
  ]
  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split('/').map(Number)
    return new Date(year, month - 1, day)
  }
  const today = new Date(2026, 2, 5) // 05/03/2026
  const sortedNextSchedules = [...nextSchedules].sort((a, b) => {
    const da = parseDate(a.deadline)
    const db = parseDate(b.deadline)
    return Math.abs(da - today) - Math.abs(db - today)
  })
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

  useEffect(() => {
    if (!openScheduleDrawer) return
    setEditingScheduleEntry(null)
    setDrawerForm(DEFAULT_DRAWER_FORM)
    setScheduleDrawerDays({ Wed: true, Sat: true })
    setScheduleDrawerOpen(true)
  }, [openScheduleDrawer])

  useEffect(() => {
    if (!openAddJob) return
    if (onAddJob) onAddJob()
  }, [openAddJob, onAddJob])

  useEffect(() => {
    if (!resetToUpcoming) return
    setActiveStatusTab('next')
  }, [resetToUpcoming])

  useEffect(() => {
    if (!openCreateSchedulePage) return
    setIsCreateSchedulePage(true)
  }, [openCreateSchedulePage])

  useEffect(() => {
    if (!resetToRecommendationsLanding) return
    setIsCreateSchedulePage(false)
  }, [resetToRecommendationsLanding])

  const toggleAccordion = (key) => {
    setAccordionOpen({
      details: key === 'details',
      scope: key === 'scope',
      exceptions: key === 'exceptions',
    })
  }

  const toggleProductFilterRow = (key) => {
    setProductFilterOpen((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const toggleGeoFilterRow = (key) => {
    setGeoFilterOpen((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const toggleExceptionAccordion = (exceptionId) => {
    setExceptions((prev) =>
      prev.map((e) => (e.id === exceptionId ? { ...e, expanded: !e.expanded } : e))
    )
  }

  const removeException = (exceptionId) => {
    setExceptions((prev) => prev.filter((e) => e.id !== exceptionId))
  }

  const addException = () => {
    const excId = `exc-${exceptionNextId}`
    const advId = `adv-${advancedRowNextId}`
    const condId = `cond-${advancedConditionNextId}`
    setExceptionNextId((n) => n + 1)
    setAdvancedRowNextId((n) => n + 1)
    setAdvancedConditionNextId((n) => n + 1)
    setExceptions((prev) => {
      const withExpandedFalse = prev.map((e) => ({ ...e, expanded: false }))
      return [
        ...withExpandedFalse,
        {
          id: excId,
          expanded: true,
          advancedRows: [{ id: advId, conditions: [{ id: condId, mainColumn: '', condition: '', value: '' }] }],
          productFilterOpen: { ...DEFAULT_PRODUCT_FILTER_OPEN },
          geoFilterOpen: { ...DEFAULT_GEO_FILTER_OPEN },
          productFilterSelected: { ...DEFAULT_PRODUCT_FILTER_SELECTED },
          geoFilterSelected: { ...DEFAULT_GEO_FILTER_SELECTED },
          filtersDropdownOpen: false,
          openFilterPopover: null,
          activeFilterTypes: [],
          filterSearchQuery: '',
        },
      ]
    })
  }

  const toggleProductFilterRowForException = (exceptionId, key) => {
    setExceptions((prev) =>
      prev.map((e) =>
        e.id === exceptionId
          ? { ...e, productFilterOpen: { ...e.productFilterOpen, [key]: !e.productFilterOpen[key] } }
          : e
      )
    )
  }

  const toggleGeoFilterRowForException = (exceptionId, key) => {
    setExceptions((prev) =>
      prev.map((e) =>
        e.id === exceptionId ? { ...e, geoFilterOpen: { ...e.geoFilterOpen, [key]: !e.geoFilterOpen[key] } } : e
      )
    )
  }

  const addConditionToBox = (exceptionId, boxId) => {
    const condId = `cond-${advancedConditionNextId}`
    setAdvancedConditionNextId((n) => n + 1)
    setExceptions((prev) =>
      prev.map((e) =>
        e.id === exceptionId
          ? {
              ...e,
              advancedRows: e.advancedRows.map((r) =>
                r.id === boxId ? { ...r, conditions: [...r.conditions, { id: condId, mainColumn: '', condition: '', value: '' }] } : r
              ),
            }
          : e
      )
    )
  }

  const removeConditionFromBox = (exceptionId, boxId, conditionId) => {
    const condId = `cond-${advancedConditionNextId}`
    setAdvancedConditionNextId((n) => n + 1)
    setExceptions((prev) =>
      prev.map((e) => {
        if (e.id !== exceptionId) return e
        const newRows = e.advancedRows
          .map((r) => {
            if (r.id !== boxId) return r
            const newConditions = r.conditions.filter((c) => c.id !== conditionId)
            if (newConditions.length === 0) return { ...r, conditions: [{ id: condId, mainColumn: '', condition: '', value: '' }] }
            return { ...r, conditions: newConditions }
          })
        return { ...e, advancedRows: newRows }
      })
    )
  }

  const updateAdvancedApprovalCondition = (exceptionId, boxId, conditionId, field, value) => {
    setExceptions((prev) =>
      prev.map((e) =>
        e.id === exceptionId
          ? {
              ...e,
              advancedRows: e.advancedRows.map((r) =>
                r.id === boxId ? { ...r, conditions: r.conditions.map((c) => (c.id === conditionId ? { ...c, [field]: value } : c)) } : r
              ),
            }
          : e
      )
    )
  }

  const clearAdvancedForException = (exceptionId) => {
    const advId = `adv-${advancedRowNextId}`
    const condId = `cond-${advancedConditionNextId}`
    setAdvancedRowNextId((n) => n + 1)
    setAdvancedConditionNextId((n) => n + 1)
    setExceptions((prev) =>
      prev.map((e) =>
        e.id === exceptionId
          ? { ...e, advancedRows: [{ id: advId, conditions: [{ id: condId, mainColumn: '', condition: '', value: '' }] }] }
          : e
      )
    )
  }

  const clearProductFilterForException = (exceptionId) => {
    setExceptions((prev) =>
      prev.map((e) => (e.id === exceptionId ? { ...e, productFilterOpen: { ...DEFAULT_PRODUCT_FILTER_OPEN } } : e))
    )
  }

  const clearGeoFilterForException = (exceptionId) => {
    setExceptions((prev) =>
      prev.map((e) => (e.id === exceptionId ? { ...e, geoFilterOpen: { ...DEFAULT_GEO_FILTER_OPEN } } : e))
    )
  }

  const setExceptionFiltersDropdownOpen = (exceptionId, open) => {
    setExceptions((prev) =>
      prev.map((e) => (e.id === exceptionId ? { ...e, filtersDropdownOpen: open, filterSearchQuery: open ? (e.filterSearchQuery || '') : '' } : e))
    )
  }

  const setExceptionFilterSearchQuery = (exceptionId, query) => {
    setExceptions((prev) =>
      prev.map((e) => (e.id === exceptionId ? { ...e, filterSearchQuery: query } : e))
    )
  }

  const addFilterToException = (exceptionId, filterId) => {
    setExceptions((prev) =>
      prev.map((e) => {
        if (e.id !== exceptionId) return e
        const alreadyActive = e.activeFilterTypes?.includes(filterId)
        if (alreadyActive) return e
        return {
          ...e,
          filtersDropdownOpen: false,
          activeFilterTypes: [...(e.activeFilterTypes || []), filterId],
        }
      })
    )
  }

  const removeFilterFromException = (exceptionId, filterId) => {
    setExceptions((prev) =>
      prev.map((e) => {
        if (e.id !== exceptionId) return e
        const newActive = (e.activeFilterTypes || []).filter((t) => t !== filterId)
        let updates = { ...e, activeFilterTypes: newActive, openFilterPopover: e.openFilterPopover === filterId ? null : e.openFilterPopover }
        if (filterId === 'advanced') {
          const advId = `adv-${advancedRowNextId}`
          const condId = `cond-${advancedConditionNextId}`
          setAdvancedRowNextId((n) => n + 1)
          setAdvancedConditionNextId((n) => n + 1)
          updates = { ...updates, advancedRows: [{ id: advId, conditions: [{ id: condId, mainColumn: '', condition: '', value: '' }] }] }
        } else if (EXCEPTION_FILTER_OPTIONS.find((o) => o.id === filterId)) {
          const opt = EXCEPTION_FILTER_OPTIONS.find((o) => o.id === filterId)
          if (opt && ['departments', 'subDepartments', 'seasons', 'events', 'productGroups'].includes(filterId)) {
            updates = { ...updates, productFilterSelected: { ...e.productFilterSelected, [filterId]: [] } }
          } else if (opt) {
            updates = { ...updates, geoFilterSelected: { ...e.geoFilterSelected, [filterId]: [] } }
          }
        }
        return updates
      })
    )
  }

  const setExceptionOpenFilterPopover = (exceptionId, filterId) => {
    setExceptions((prev) =>
      prev.map((e) => (e.id === exceptionId ? { ...e, openFilterPopover: filterId } : e))
    )
  }

  const toggleFilterOptionForException = (exceptionId, filterId, optionValue) => {
    setExceptions((prev) =>
      prev.map((e) => {
        if (e.id !== exceptionId) return e
        const isProduct = ['departments', 'subDepartments', 'seasons', 'events', 'productGroups'].includes(filterId)
        const sel = isProduct ? (e.productFilterSelected || {}) : (e.geoFilterSelected || {})
        const key = filterId
        const arr = Array.isArray(sel[key]) ? sel[key] : []
        const has = arr.includes(optionValue)
        const newArr = has ? arr.filter((v) => v !== optionValue) : [...arr, optionValue]
        return {
          ...e,
          [isProduct ? 'productFilterSelected' : 'geoFilterSelected']: { ...sel, [key]: newArr },
        }
      })
    )
  }

  const selectAllFilterOptionsForException = (exceptionId, filterId, selectAll) => {
    const opt = EXCEPTION_FILTER_OPTIONS.find((o) => o.id === filterId)
    if (!opt?.options) return
    setExceptions((prev) =>
      prev.map((e) => {
        if (e.id !== exceptionId) return e
        const isProduct = ['departments', 'subDepartments', 'seasons', 'events', 'productGroups'].includes(filterId)
        const sel = isProduct ? (e.productFilterSelected || {}) : (e.geoFilterSelected || {})
        return {
          ...e,
          [isProduct ? 'productFilterSelected' : 'geoFilterSelected']: {
            ...sel,
            [filterId]: selectAll ? [...opt.options] : [],
          },
        }
      })
    )
  }

  const clearAllFiltersForException = (exceptionId) => {
    const advId = `adv-${advancedRowNextId}`
    const condId = `cond-${advancedConditionNextId}`
    setAdvancedRowNextId((n) => n + 1)
    setAdvancedConditionNextId((n) => n + 1)
    setExceptions((prev) =>
      prev.map((e) =>
        e.id === exceptionId
          ? {
              ...e,
              activeFilterTypes: [],
              filtersDropdownOpen: false,
              openFilterPopover: null,
              advancedRows: [{ id: advId, conditions: [{ id: condId, mainColumn: '', condition: '', value: '' }] }],
              productFilterSelected: { ...DEFAULT_PRODUCT_FILTER_SELECTED },
              geoFilterSelected: { ...DEFAULT_GEO_FILTER_SELECTED },
            }
          : e
      )
    )
  }

  const getAdvancedFilterSummary = (exc) => {
    const first = exc.advancedRows?.[0]?.conditions?.[0]
    if (!first || !first.mainColumn || !first.condition || !first.value) return null
    return `${first.mainColumn} ${first.condition.toLowerCase()} ${first.value}`
  }

  const getExceptionDisplayName = (exc) => {
    const parts = []
    const activeTypes = exc.activeFilterTypes || []
    for (const filterId of activeTypes) {
      const opt = EXCEPTION_FILTER_OPTIONS.find((o) => o.id === filterId)
      const label = opt?.label || filterId
      const isProduct = ['departments', 'subDepartments', 'seasons', 'events', 'productGroups'].includes(filterId)
      if (filterId === 'advanced') {
        const summary = getAdvancedFilterSummary(exc)
        if (summary) parts.push(summary)
      } else {
        const sel = isProduct ? (exc.productFilterSelected || {}) : (exc.geoFilterSelected || {})
        const raw = sel[filterId]
        const selected = Array.isArray(raw) ? raw : (raw != null ? [String(raw)] : [])
        if (selected.length > 0) {
          parts.push(`${label}: ${selected.join(', ')}`)
        }
      }
    }
    return parts.length > 0 ? parts.join(', ') : null
  }

  const MAIN_COLUMN_OPTIONS = [
    'L30D sales',
    'Understocks',
    'Transfer units',
    'Understocks after rebalance',
    'Overstocks',
    'Overstocks after rebalance',
    'Sales uplift',
    'Sales uplift units',
    'L7D sales',
    'Forecast sales rate',
  ]
  const CONDITION_OPTIONS = [
    'Equal to',
    'Greater than',
    'Lower than',
    'Greater than or equal to',
    'Lower than or equal to',
  ]

  if (isCreateSchedulePage) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCreateSchedulePage(false)}
            className="flex items-center justify-center w-8 h-8 rounded-[4px] text-[#0a0a0a] hover:bg-[#e5e7eb]"
            aria-label="Back to recommendations"
          >
            <IconArrowLeft className="size-5" />
          </button>
          <h1 className="text-[24px] font-medium text-[#0a0a0a] leading-[100%]">
            Create schedule
          </h1>
        </div>

        <div className="flex flex-col gap-4">
          <div className="border border-[#EAEAEA] rounded-[4px] bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion('details')}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#f8f8f8] transition-colors"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[20px] font-medium text-[#212B36] leading-[150%]">
                  Schedule details
                </span>
                <span className="text-[14px] font-normal text-[#4b535c]">
                  Configure how you want your schedule to run
                </span>
              </div>
              <IconChevronDown
                className={`size-5 text-[#4b535c] transition-transform shrink-0 ${
                  accordionOpen.details ? 'rotate-180' : ''
                }`}
              />
            </button>
            {accordionOpen.details && (
              <div className="px-5 pb-6 pt-2 flex flex-col gap-6 border-t border-[#EAEAEA]">
                <section className="flex flex-col gap-2">
                  <label className="text-[14px] font-normal text-[#000000] opacity-[0.67]">Movement type</label>
                  <div className="relative">
                    <select
                      value={drawerForm.module}
                      onChange={(ev) =>
                        setDrawerForm((f) => ({
                          ...f,
                          module: ev.target.value,
                        }))
                      }
                      className="w-full h-14 pl-4 pr-10 rounded-[4px] border border-[#EAEAEA] bg-white text-[16px] text-[#0a0a0a] appearance-none"
                    >
                      <option value="">Select</option>
                      {MODULE_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4b535c] pointer-events-none">
                      <IconChevronDownSelect />
                    </span>
                  </div>
                </section>

                <section className="flex flex-col gap-2">
                  <label className="text-[14px] font-normal text-[#000000] opacity-[0.67]">Name schedule</label>
                  <input
                    type="text"
                    placeholder="Placeholder"
                    value={drawerForm.name}
                    onChange={(ev) =>
                      setDrawerForm((f) => ({
                        ...f,
                        name: ev.target.value,
                      }))
                    }
                    className="w-full h-14 px-4 rounded-[4px] border border-[#EAEAEA] bg-white text-[16px] text-[#0a0a0a] placeholder:text-[#9CA1AE]"
                  />
                  <p className="text-[12px] font-normal text-[#4b535c]">
                    If not assigned, name will be given automatically
                  </p>
                </section>

                <section className="flex flex-col gap-4">
                  <p className="text-[14px] font-medium text-[#0a0a0a]">Scheduling Dates</p>

                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-normal text-[#000000] opacity-[0.67]">Repeat every</label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-[#EAEAEA] rounded-[4px] bg-white overflow-hidden h-12">
                        <input
                          type="number"
                          min={1}
                          value={recurrenceRepeatEvery}
                          onChange={(e) => setRecurrenceRepeatEvery(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-[80px] h-12 py-3 px-4 text-center text-[16px] text-[#0a0a0a] border-none focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <div className="flex flex-col border-l border-[#EAEAEA] shrink-0">
                          <button type="button" onClick={() => setRecurrenceRepeatEvery((v) => Math.max(1, v + 1))} className="h-6 w-7 flex items-center justify-center text-[#4b535c] hover:bg-[#f8f8f8] border-b border-[#EAEAEA]">+</button>
                          <button type="button" onClick={() => setRecurrenceRepeatEvery((v) => Math.max(1, v - 1))} className="h-6 w-7 flex items-center justify-center text-[#4b535c] hover:bg-[#f8f8f8]">−</button>
                        </div>
                      </div>
                      <div className="relative">
                        <select
                          value={recurrenceRepeatUnit}
                          onChange={(e) => setRecurrenceRepeatUnit(e.target.value)}
                          className="h-12 w-[120px] py-3 px-4 pr-10 rounded-[4px] border border-[#EAEAEA] bg-white text-[16px] text-[#0a0a0a] appearance-none"
                        >
                          <option value="day">day</option>
                          <option value="week">week</option>
                          <option value="month">month</option>
                          <option value="year">year</option>
                        </select>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4b535c] pointer-events-none">
                          <IconChevronDownSelect />
                        </span>
                      </div>
                    </div>
                  </div>

                  {recurrenceRepeatUnit === 'week' && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[14px] font-normal text-[#000000] opacity-[0.67]">Submission day</label>
                      <div className="flex gap-4">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((letter, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setRecurrenceSubmissionDayOfWeek(i)}
                            className={`size-10 rounded-full flex items-center justify-center text-[14px] font-medium shrink-0 transition-colors ${
                              recurrenceSubmissionDayOfWeek === i
                                ? 'bg-[#0267FF] text-white'
                                : 'bg-[#F8F8F8] text-[#4b535c] hover:bg-[#eee]'
                            }`}
                          >
                            {letter}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {recurrenceRepeatUnit === 'month' && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[14px] font-normal text-[#000000] opacity-[0.67]">Submission day</label>
                      <div className="relative max-w-[200px]">
                        <select
                          value={recurrenceSubmissionDayOfMonth}
                          onChange={(e) => setRecurrenceSubmissionDayOfMonth(Number(e.target.value))}
                          className="w-full h-14 pl-4 pr-10 rounded-[4px] border border-[#EAEAEA] bg-white text-[16px] text-[#0a0a0a] appearance-none"
                        >
                          {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4b535c] pointer-events-none">
                          <IconChevronDownSelect />
                        </span>
                      </div>
                    </div>
                  )}
                  {recurrenceRepeatUnit === 'year' && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[14px] font-normal text-[#000000] opacity-[0.67]">Submission day</label>
                      <input
                        type="text"
                        placeholder="e.g. Jun 10, 2026"
                        value={recurrenceSubmissionDateYear}
                        onChange={(e) => setRecurrenceSubmissionDateYear(e.target.value)}
                        className="w-full max-w-[200px] h-14 px-4 rounded-[4px] border border-[#EAEAEA] bg-white text-[16px] text-[#0a0a0a] placeholder:text-[#9CA1AE]"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-normal text-[#000000] opacity-[0.67]">Submission time</label>
                    <div className="relative max-w-[200px]">
                      <select
                        value={recurrenceSubmissionTime}
                        onChange={(e) => setRecurrenceSubmissionTime(e.target.value)}
                        className="w-full h-12 py-3 px-4 pr-10 rounded-[4px] border border-[#E9EAEB] bg-white text-[16px] text-[#0a0a0a] appearance-none"
                      >
                        {Array.from({ length: 48 }, (_, i) => {
                          const h = Math.floor(i / 2)
                          const m = (i % 2) * 30
                          const label = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
                          return <option key={label} value={label}>{label}</option>
                        })}
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4b535c] pointer-events-none">
                        <IconChevronDownSelect />
                      </span>
                    </div>
                  </div>

                  <p className="text-[14px] italic text-[#4b535c]">
                    New scheduled recommendations available every{' '}
                    {(() => {
                      const unit = recurrenceRepeatUnit === 'week' ? 'weeks' : recurrenceRepeatUnit === 'month' ? 'months' : recurrenceRepeatUnit === 'year' ? 'years' : 'days'
                      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                      const dayName = dayNames[recurrenceSubmissionDayOfWeek]
                      const timeStr = ` at ${recurrenceSubmissionTime}`
                      if (recurrenceRepeatUnit === 'week') {
                        return `${recurrenceRepeatEvery} ${recurrenceRepeatEvery === 1 ? unit.slice(0, -1) : unit} on ${dayName}${timeStr}`
                      }
                      if (recurrenceRepeatUnit === 'month') {
                        return `${recurrenceRepeatEvery} ${recurrenceRepeatEvery === 1 ? 'month' : unit} on day ${recurrenceSubmissionDayOfMonth}${timeStr}`
                      }
                      if (recurrenceRepeatUnit === 'year') {
                        return recurrenceSubmissionDateYear ? `${recurrenceRepeatEvery} ${recurrenceRepeatEvery === 1 ? 'year' : unit} on ${recurrenceSubmissionDateYear}${timeStr}` : `${recurrenceRepeatEvery} ${recurrenceRepeatEvery === 1 ? 'year' : unit}`
                      }
                      return `${recurrenceRepeatEvery} ${recurrenceRepeatEvery === 1 ? 'day' : unit}${timeStr}`
                    })()}
                  </p>
                </section>

                <section className="flex flex-col gap-2">
                  <p className="text-[14px] font-medium text-[#0a0a0a]">Notify users:</p>
                  <input
                    type="text"
                    placeholder="Enter user emails"
                    value={drawerForm.notify}
                    onChange={(ev) =>
                      setDrawerForm((f) => ({
                        ...f,
                        notify: ev.target.value,
                      }))
                    }
                    className="w-full h-14 px-4 rounded-[4px] border border-[#EAEAEA] bg-white text-[16px] text-[#0a0a0a] placeholder:text-[#9CA1AE]"
                  />
                </section>
              </div>
            )}
          </div>

          <div className="border border-[#EAEAEA] rounded-[4px] bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion('scope')}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#f8f8f8] transition-colors"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[20px] font-medium text-[#212B36] leading-[150%]">
                  Scope
                </span>
                <span className="text-[14px] font-normal text-[#4b535c]">
                  Define which products and locations are included in this schedule
                </span>
              </div>
              <IconChevronDown
                className={`size-5 text-[#4b535c] transition-transform shrink-0 ${
                  accordionOpen.scope ? 'rotate-180' : ''
                }`}
              />
            </button>
            {accordionOpen.scope && (
              <div className="px-5 pb-6 pt-2 flex flex-col gap-6 border-t border-[#EAEAEA]">
                <div className="flex flex-col gap-3">
                  <label className="flex items-start gap-3 p-4 rounded-[10px] border border-[#e5e7eb] bg-white cursor-pointer hover:border-[#0267ff]/40 has-[:checked]:border-[#0267ff]">
                    <input
                      type="radio"
                      name="scopeOption"
                      value="include-all"
                      checked={scopeOption === 'include-all'}
                      onChange={() => setScopeOption('include-all')}
                      className="mt-1 size-4 shrink-0 border-[#e5e7eb] text-[#0267ff] focus:ring-[#0267ff]"
                    />
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-[14px] font-medium text-[#0a0a0a]">Include all recommendations</span>
                      <span className="text-[12px] font-normal text-[#4b535c]">Applies the full optimised recommendation set for maximum impact.</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-4 rounded-[10px] border border-[#e5e7eb] bg-white cursor-pointer hover:border-[#0267ff]/40 has-[:checked]:border-[#0267ff]">
                    <input
                      type="radio"
                      name="scopeOption"
                      value="filter"
                      checked={scopeOption === 'filter'}
                      onChange={() => setScopeOption('filter')}
                      className="mt-1 size-4 shrink-0 border-[#e5e7eb] text-[#0267ff] focus:ring-[#0267ff]"
                    />
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-[14px] font-medium text-[#0a0a0a]">Filter recommendations</span>
                      <span className="text-[12px] font-normal text-[#4b535c]">Narrow recommendations to specific products, locations, or criteria.</span>
                    </div>
                  </label>
                </div>

                {scopeOption === 'filter' && (
                  <div className="mt-1 flex flex-col gap-6">
                    <section className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[13px] font-medium text-[#0a0a0a] uppercase tracking-[0.04em]">
                          Product
                        </h3>
                        <button
                          type="button"
                          onClick={() =>
                            setProductFilterOpen({
                              departments: false,
                              subDepartments: false,
                              seasons: false,
                              events: false,
                              productGroups: false,
                            })
                          }
                          className="text-[12px] font-medium text-[#4b535c] hover:text-[#0a0a0a]"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="mt-1 flex flex-col border-t border-[#e5e7eb]">
                        {[
                          { id: 'departments', label: 'Departments' },
                          { id: 'subDepartments', label: 'Sub-departments' },
                          { id: 'seasons', label: 'Seasons' },
                          { id: 'events', label: 'Events' },
                          { id: 'productGroups', label: 'Product groups' },
                        ].map((row) => {
                          const isOpen = productFilterOpen[row.id]
                          return (
                            <div key={row.id} className="border-b border-[#e5e7eb] last:border-b-0">
                              <button
                                type="button"
                                onClick={() => toggleProductFilterRow(row.id)}
                                className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-[#f8f8f8]"
                              >
                                <span className="text-[13px] font-medium text-[#0a0a0a]">
                                  {row.label}
                                </span>
                                <span
                                  className={`inline-flex items-center justify-center size-5 text-[#4b535c] transition-transform ${
                                    isOpen ? 'rotate-180' : ''
                                  }`}
                                >
                                  <IconChevronDown className="size-4" />
                                </span>
                              </button>
                              {isOpen && (
                                <div className="px-3 pb-3 pt-1 flex flex-col gap-2 bg-[#fafafa]">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="relative flex-1">
                                      <input
                                        type="text"
                                        placeholder="search..."
                                        className="w-full h-9 px-3 rounded-[4px] border border-[#e5e7eb] bg-white text-[13px] text-[#0a0a0a] placeholder:text-[#9ca3af]"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      className="text-[12px] font-medium text-[#0267ff] hover:underline shrink-0"
                                    >
                                      Select all
                                    </button>
                                  </div>
                                  <div className="flex flex-col gap-1.5 mt-1">
                                    {(EXCEPTION_FILTER_OPTIONS.find((f) => f.id === row.id)?.options ?? []).map(
                                      (name) => (
                                        <label
                                          key={name}
                                          className="flex items-center gap-2 text-[13px] text-[#0a0a0a]"
                                        >
                                          <input
                                            type="checkbox"
                                            className="size-4 rounded border-[#d1d5db] text-[#0267ff] focus:ring-[#0267ff]"
                                          />
                                          <span>{name}</span>
                                        </label>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </section>

                    <section className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[13px] font-medium text-[#0a0a0a] uppercase tracking-[0.04em]">
                          Geographic
                        </h3>
                        <button
                          type="button"
                          onClick={() =>
                            setGeoFilterOpen({
                              locationTypes: false,
                              regions: false,
                              countries: false,
                              locations: false,
                            })
                          }
                          className="text-[12px] font-medium text-[#4b535c] hover:text-[#0a0a0a]"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="mt-1 flex flex-col border-t border-[#e5e7eb]">
                        {[
                          { id: 'locationTypes', label: 'Location Types' },
                          { id: 'regions', label: 'Regions' },
                          { id: 'countries', label: 'Countries' },
                          { id: 'locations', label: 'Locations' },
                        ].map((row) => {
                          const isOpen = geoFilterOpen[row.id]
                          return (
                            <div key={row.id} className="border-b border-[#e5e7eb] last:border-b-0">
                              <button
                                type="button"
                                onClick={() => toggleGeoFilterRow(row.id)}
                                className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-[#f8f8f8]"
                              >
                                <span className="text-[13px] font-medium text-[#0a0a0a]">
                                  {row.label}
                                </span>
                                <span
                                  className={`inline-flex items-center justify-center size-5 text-[#4b535c] transition-transform ${
                                    isOpen ? 'rotate-180' : ''
                                  }`}
                                >
                                  <IconChevronDown className="size-4" />
                                </span>
                              </button>
                              {isOpen && (
                                <div className="px-3 pb-3 pt-1 flex flex-col gap-2 bg-[#fafafa]">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="relative flex-1">
                                      <input
                                        type="text"
                                        placeholder="search..."
                                        className="w-full h-9 px-3 rounded-[4px] border border-[#e5e7eb] bg-white text-[13px] text-[#0a0a0a] placeholder:text-[#9ca3af]"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      className="text-[12px] font-medium text-[#0267ff] hover:underline shrink-0"
                                    >
                                      Select all
                                    </button>
                                  </div>
                                  <div className="flex flex-col gap-1.5 mt-1">
                                    {['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo'].map((name) => (
                                      <label
                                        key={name}
                                        className="flex items-center gap-2 text-[13px] text-[#0a0a0a]"
                                      >
                                        <input
                                          type="checkbox"
                                          className="size-4 rounded border-[#d1d5db] text-[#0267ff] focus:ring-[#0267ff]"
                                        />
                                        <span>{name}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </section>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border border-[#EAEAEA] rounded-[4px] bg-white overflow-visible">
            <button
              type="button"
              onClick={() => toggleAccordion('exceptions')}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#f8f8f8] transition-colors"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[20px] font-medium text-[#212B36] leading-[150%]">
                  Manage exceptions
                </span>
                <span className="text-[14px] font-normal text-[#4b535c]">
                  Set which recommendations you want to review, the rest will be auto-approved
                </span>
              </div>
              <IconChevronDown
                className={`size-5 text-[#4b535c] transition-transform shrink-0 ${
                  accordionOpen.exceptions ? 'rotate-180' : ''
                }`}
              />
            </button>
            {accordionOpen.exceptions && (
              <div className="px-5 pb-6 pt-2 flex flex-col gap-4 border-t border-[#EAEAEA]">
                {exceptions.map((exc, excIdx) => (
                  <div key={exc.id} className="border border-[#e5e7eb] rounded-[4px] bg-white overflow-visible">
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => toggleExceptionAccordion(exc.id)}
                        className="flex-1 flex items-center justify-between px-4 py-3 text-left hover:bg-[#f8f8f8] transition-colors"
                      >
                        <span className="text-[14px] font-medium text-[#0a0a0a]">
                          {getExceptionDisplayName(exc) ?? `Exception ${excIdx + 1}`}
                        </span>
                        <IconChevronDown
                          className={`size-5 text-[#4b535c] transition-transform shrink-0 ${
                            exc.expanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeException(exc.id)}
                        className="h-10 w-10 flex items-center justify-center text-[#4b535c] hover:bg-[#e5e7eb] shrink-0"
                        aria-label="Delete exception"
                      >
                        <IconClose className="size-4" />
                      </button>
                    </div>
                    {exc.expanded && (
                      <div className="px-4 pb-4 pt-0 flex flex-col gap-4 border-t border-[#e5e7eb]">
                        <div className="flex flex-wrap items-center gap-2 mt-4">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setExceptionFiltersDropdownOpen(exc.id, !exc.filtersDropdownOpen)}
                              className="h-10 px-4 py-2 flex items-center gap-2 rounded-[4px] border border-[#E9EAEB] bg-white text-[14px] font-medium text-[#0a0a0a] hover:bg-[#f8f8f8]"
                            >
                              <IconFilterFunnel />
                              Filters
                            </button>
                            {exc.filtersDropdownOpen && (
                              <>
                                <div
                                  className="fixed inset-0 z-[9]"
                                  aria-hidden
                                  onClick={() => setExceptionFiltersDropdownOpen(exc.id, false)}
                                />
                                <div
                                  className="absolute left-0 top-full mt-1 z-10 w-[220px] rounded-[4px] border border-[#E9EAEB] bg-white shadow-lg overflow-hidden"
                                  style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                >
                                  <div className="p-2 border-b border-[#e5e7eb]">
                                    <div className="relative">
                                      <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#9ca3af]" />
                                      <input
                                        type="text"
                                        placeholder="Search"
                                        value={exc.filterSearchQuery || ''}
                                        onChange={(e) => setExceptionFilterSearchQuery(exc.id, e.target.value)}
                                        className="w-full h-9 pl-9 pr-3 rounded-[4px] border border-[#e5e7eb] bg-white text-[13px] text-[#0a0a0a] placeholder:text-[#9ca3af]"
                                      />
                                    </div>
                                  </div>
                                  <div className="max-h-[240px] overflow-y-auto py-1">
                                    {EXCEPTION_FILTER_OPTIONS.filter((o) =>
                                      !(exc.filterSearchQuery || '').trim() ||
                                      o.label.toLowerCase().includes((exc.filterSearchQuery || '').toLowerCase())
                                    ).map((opt) => (
                                      <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => addFilterToException(exc.id, opt.id)}
                                        className={`w-full px-3 py-2 text-left text-[13px] font-medium text-[#0a0a0a] hover:bg-[#f8f8f8] ${opt.highlight ? 'bg-[#E8F0FE]' : ''}`}
                                      >
                                        {opt.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                          {(exc.activeFilterTypes || []).map((filterId) => {
                            const opt = EXCEPTION_FILTER_OPTIONS.find((o) => o.id === filterId)
                            const label = opt?.label || filterId
                            const isProduct = ['departments', 'subDepartments', 'seasons', 'events', 'productGroups'].includes(filterId)
                            const sel = isProduct ? (exc.productFilterSelected || {}) : (exc.geoFilterSelected || {})
                            const selected = sel[filterId] || []
                            const summary = filterId === 'advanced'
                              ? (getAdvancedFilterSummary(exc) || '')
                              : selected.length > 0
                                ? selected.join(', ')
                                : ''
                            const chipLabel = summary ? `${label}: ${summary}` : `${label}:`
                            const isPopoverOpen = exc.openFilterPopover === filterId
                            return (
                              <div key={filterId} className="relative">
                                <button
                                  type="button"
                                  onClick={() => filterId === 'advanced' ? null : setExceptionOpenFilterPopover(exc.id, isPopoverOpen ? null : filterId)}
                                  className="h-10 px-3 py-2 flex items-center gap-1.5 rounded-[4px] border border-[#E9EAEB] bg-white text-[13px] font-medium text-[#0a0a0a] hover:bg-[#f8f8f8]"
                                >
                                  <span className="max-w-[180px] truncate">{chipLabel}</span>
                                  <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); removeFilterFromException(exc.id, filterId) }}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); removeFilterFromException(exc.id, filterId) } }}
                                    className="inline-flex shrink-0 text-[#4b535c] hover:text-[#0a0a0a]"
                                  >
                                    <IconClose className="size-4" />
                                  </span>
                                </button>
                                {filterId !== 'advanced' && isPopoverOpen && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-[9]"
                                      aria-hidden
                                      onClick={() => setExceptionOpenFilterPopover(exc.id, null)}
                                    />
                                    <div
                                      className="absolute left-0 top-full mt-1 z-10 w-[220px] rounded-[4px] border border-[#E9EAEB] bg-white shadow-lg overflow-hidden"
                                      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div className="p-2 border-b border-[#e5e7eb]">
                                        <div className="relative">
                                          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#9ca3af] pointer-events-none" />
                                          <input
                                            type="text"
                                            placeholder="Search"
                                            className="w-full h-9 pl-9 pr-3 rounded-[4px] border border-[#e5e7eb] bg-white text-[13px] text-[#0a0a0a] placeholder:text-[#9ca3af]"
                                          />
                                        </div>
                                      </div>
                                      <div className="p-2 flex items-center justify-between">
                                        <button
                                          type="button"
                                          onClick={() => selectAllFilterOptionsForException(exc.id, filterId, selected.length < (opt?.options?.length || 0))}
                                          className="text-[12px] font-medium text-[#0267ff] hover:underline"
                                        >
                                          Select all
                                        </button>
                                      </div>
                                      <div className="max-h-[180px] overflow-y-auto py-1 px-2 flex flex-col gap-1.5">
                                        {(opt?.options || []).map((name) => (
                                          <label key={name} className="flex items-center gap-2 text-[13px] text-[#0a0a0a] cursor-pointer">
                                            <input
                                              type="checkbox"
                                              checked={selected.includes(name)}
                                              onChange={() => toggleFilterOptionForException(exc.id, filterId, name)}
                                              className="size-4 rounded border-[#d1d5db] text-[#0267ff] focus:ring-[#0267ff]"
                                            />
                                            <span>{name}</span>
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            )
                          })}
                          {((exc.activeFilterTypes || []).length > 0) && (
                            <button
                              type="button"
                              onClick={() => clearAllFiltersForException(exc.id)}
                              className="text-[13px] font-medium text-[#4b535c] hover:text-[#0a0a0a] hover:underline"
                            >
                              Clear filters
                            </button>
                          )}
                        </div>
                        {(exc.activeFilterTypes || []).includes('advanced') && (
                          <div className="flex flex-col gap-3 p-4 rounded-[4px] border border-[#E9EAEB] bg-white shadow-sm">
                            {exc.advancedRows.map((box) => (
                              <div key={box.id} className="flex flex-col gap-2">
                                {box.conditions.map((cond, condIdx) => (
                                  <div key={cond.id} className="flex flex-col gap-1">
                                    {condIdx > 0 && (
                                      <span className="text-[12px] font-normal text-[#878D94]">and</span>
                                    )}
                                    <div className="flex items-end gap-2 w-full">
                                      <span className="text-[14px] font-medium text-[#0a0a0a] shrink-0 w-[48px]">
                                        {condIdx === 0 ? 'Where' : ''}
                                      </span>
                                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                        <label className="text-[12px] font-normal text-[#4b535c]">Main column</label>
                                        <div className="relative">
                                          <select
                                            value={cond.mainColumn}
                                            onChange={(e) => updateAdvancedApprovalCondition(exc.id, box.id, cond.id, 'mainColumn', e.target.value)}
                                            className="w-full h-10 py-2 pl-3 pr-9 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#0a0a0a] appearance-none"
                                          >
                                            <option value="">Select</option>
                                            {MAIN_COLUMN_OPTIONS.map((o) => (
                                              <option key={o} value={o}>{o}</option>
                                            ))}
                                          </select>
                                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b535c] pointer-events-none">
                                            <IconChevronDownSelect />
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                        <label className="text-[12px] font-normal text-[#4b535c]">Condition</label>
                                        <div className="relative">
                                          <select
                                            value={cond.condition}
                                            onChange={(e) => updateAdvancedApprovalCondition(exc.id, box.id, cond.id, 'condition', e.target.value)}
                                            className="w-full h-10 py-2 pl-3 pr-9 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#0a0a0a] appearance-none"
                                          >
                                            <option value="">Select</option>
                                            {CONDITION_OPTIONS.map((o) => (
                                              <option key={o} value={o}>{o}</option>
                                            ))}
                                          </select>
                                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b535c] pointer-events-none">
                                            <IconChevronDownSelect />
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                        <label className="text-[12px] font-normal text-[#4b535c]">Enter a value</label>
                                        <input
                                          type="text"
                                          placeholder="Enter a value"
                                          value={cond.value}
                                          onChange={(e) => updateAdvancedApprovalCondition(exc.id, box.id, cond.id, 'value', e.target.value)}
                                          className="w-full h-10 py-2 px-3 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#0a0a0a]"
                                        />
                                      </div>
                                      {box.conditions.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => removeConditionFromBox(exc.id, box.id, cond.id)}
                                          className="h-10 w-10 flex items-center justify-center rounded-[4px] text-[#4b535c] hover:bg-[#e5e7eb] shrink-0"
                                          aria-label="Remove condition"
                                        >
                                          <IconClose className="size-4" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => addConditionToBox(exc.id, box.id)}
                                  className="self-start text-[13px] font-medium text-[#0267FF] hover:underline"
                                >
                                  + Add row
                                </button>
                              </div>
                            ))}
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => clearAdvancedForException(exc.id)}
                                className="h-9 px-4 rounded-[4px] border border-[#E9EAEB] bg-white text-[13px] font-medium text-[#0a0a0a] hover:bg-[#f8f8f8]"
                              >
                                Clear
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addException}
                  className="self-start text-[13px] font-medium text-[#0267FF] hover:underline"
                >
                  + Add exception
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6">
          <button
            type="button"
            onClick={() => setIsCreateSchedulePage(false)}
            className="h-12 px-6 rounded-[6px] text-[16px] font-medium text-[#0a0a0a] hover:bg-[#f3f4f6]">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setIsCreateSchedulePage(false)}
            className="h-12 px-6 rounded-[6px] bg-[#0267FF] text-white text-[16px] font-medium hover:bg-[#0252cc]">
            Create schedule
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {pinnedHoverEntryId && activeStatusTab === 'upcoming' && (
        <div role="presentation" className="fixed inset-0 z-40" onClick={() => { setPinnedHoverEntryId(null); setPinnedHoverCellKey(null) }} aria-hidden />
      )}
      <div className="border-b border-[#e5e7eb]">
        <nav className="flex items-center gap-6 h-11">
          {statusTabs.map((tab) => {
            const isActive = activeStatusTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveStatusTab(tab.id)}
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
      {activeStatusTab === 'upcoming' ? (
        <>
          <div className="flex flex-col gap-6" data-name="Optimiser" data-node-id="174:2696">
            <div>
              <p className="text-[16px] font-medium text-[#0a0a0a] leading-tight">Optimiser Schedule & jobs</p>
              <p className="text-[14px] font-normal text-[#4b535c]">Perform all job and schedule actions for all your upcoming inventory</p>
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
                                      className={`size-10 flex items-center justify-center rounded-[2px] text-[14px] ${selected ? 'bg-[#0267ff] text-white font-medium' : inMonth ? 'text-[#0a0a0a] hover:bg-[#f3f4f6]' : 'text-[#4b535c] opacity-50 hover:bg-[#f3f4f6]'}`}
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
              <h2 className="text-[20px] font-medium text-[#0a0a0a] tracking-tight">{viewTitle}</h2>
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
                                        <p className="text-[14px] font-medium text-[#0a0a0a]">{entry.title}</p>
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
        </>
      ) : activeStatusTab === 'next' ? (
        <div className="mt-3 space-y-4">
          {sortedNextSchedules.map((schedule) => {
            const deadlineDate = parseDate(schedule.deadline)
            const isDeadlinePast = deadlineDate < today
            const deadlineBadgeClass = isDeadlinePast
              ? 'bg-[#fee2e2] text-[#b91c1c]'
              : 'bg-[#fef3c7] text-[#92400e]'
            return (
            <div
              key={schedule.id}
              className="bg-white border border-[#EAEAEA] rounded-[3.42px] p-5 flex flex-col gap-4 w-full"
            >
              <div
                className="group flex flex-wrap items-center justify-between gap-2 cursor-pointer"
                onClick={() => onOpenScheduleDetail && onOpenScheduleDetail(schedule)}
              >
                <span className="inline-flex items-center gap-1.5">
                  <h2 className="text-xl md:text-2xl font-medium text-[#0a0a0a] group-hover:text-[#0267ff]">{schedule.name}</h2>
                  <ChevronRight className="size-4 shrink-0 text-current group-hover:text-[#0267ff]" aria-hidden />
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    // submit handler can be wired here later
                  }}
                  className="h-9 px-4 rounded-[4px] border border-[#0267ff] text-sm font-medium text-[#0267ff] bg-white hover:bg-[#ebf3ff]"
                >
                  Submit
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#4b535c]">
                <span className="flex items-center gap-2">
                  <span>Submission deadline:</span>
                  <span className={`px-2 py-[3px] rounded-[2px] text-[14px] font-medium ${deadlineBadgeClass}`}>
                    {schedule.deadline}
                  </span>
                </span>
                <span>Created: {schedule.created}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <span className="inline-flex items-center px-2 py-[3px] rounded-[2px] bg-[#00A195] text-white text-[14px] font-medium">
                  {schedule.status}
                </span>
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#4b535c]">
                  <span>
                    <span className="font-medium text-[#0a0a0a]">Total transfer exceptions:</span> {schedule.exceptions}
                  </span>
                  <span>
                    <span className="font-medium text-[#0a0a0a]">Total approved:</span> {schedule.approved}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {schedule.metrics.map((metric) => {
                  const bgClass =
                    metric.label === 'Unique trips'
                      ? 'bg-[#dbeafe]'
                      : metric.label === 'Recommended transfers'
                        ? 'bg-[#ede9fe]'
                        : metric.label === 'Revenue increase'
                          ? 'bg-[#d1fae5]'
                          : 'bg-[#fef9c3]'
                  return (
                    <div
                      key={metric.label}
                      className={`rounded-[4px] border border-[#EAEAEA] px-4 py-3 flex flex-col ${bgClass}`}
                    >
                      <span className="text-xl md:text-2xl font-medium tracking-tight text-[#0a0a0a]">
                      {metric.value}
                    </span>
                      <span className="mt-1 text-[11px] text-[#4b535c]">
                      {metric.label}
                    </span>
                    </div>
                  )
                })}
              </div>
              {schedule.exceptionsList && (
                <div className="mt-2 space-y-2">
                  {(() => {
                    const totalExceptions = schedule.exceptionsTotal ?? schedule.exceptionsList.length
                    return (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setExpandedExceptionsScheduleId((prev) =>
                        prev === schedule.id ? null : schedule.id
                      )
                    }}
                    className="text-xs font-medium text-[#0267ff] hover:underline"
                  >
                      {expandedExceptionsScheduleId === schedule.id
                        ? `Hide exceptions (${totalExceptions})`
                        : `Show exceptions (${totalExceptions})`}
                  </button>
                    )
                  })()}
                  {expandedExceptionsScheduleId === schedule.id && (
                    <div className="space-y-2">
                      {schedule.exceptionsList.map((ex, idx) => (
                        <div
                          key={`${schedule.id}-ex-${idx}`}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-[#e5e7eb] rounded-[8px] px-3 py-2 bg-[#f9fafb] text-xs text-[#0a0a0a]"
                        >
                          <span className="text-[#4b535c]">{ex.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            )
          })}
        </div>
      ) : (
        <div />
      )}
      {scheduleDrawerOpen && (
        <>
          <div role="presentation" className="fixed inset-0 bg-black/50 z-40" onClick={closeDrawer} aria-hidden />
          <div className="fixed right-0 top-0 bottom-0 w-[800px] bg-white shadow-xl z-50 flex flex-col" role="dialog" aria-modal aria-labelledby="add-schedule-title" data-name={editingScheduleEntry ? 'Edit schedule' : 'Add Schedule'} data-node-id="214:2622">
            <header className="flex items-center justify-between shrink-0 h-14 px-6 border-b border-[#e9eaeb]">
              <h2 id="add-schedule-title" className="text-[18px] font-medium text-[#0a0a0a]">{editingScheduleEntry ? 'Edit schedule' : 'Add Schedule'}</h2>
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
