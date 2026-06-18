import { Fragment, useState, useEffect, useRef } from 'react'
import { IconClose, IconChevronDown, IconChevronDownSelect, IconSearch } from './icons'

const ADVANCED_CONDITION_OPTIONS = [
  'Equal to',
  'Greater than',
  'Lower than',
  'Greater than or equal to',
  'Lower than or equal to',
]

const APPLY_AT_DISPLAY_LABELS = {
  trip: 'Trip',
  product: 'Product',
  sending_location: 'Sending location',
  receiving_location: 'Receiving location',
}

/** Maps applyAt select values to FILTERS_BY_LEVEL keys */
const APPLY_AT_TO_FILTERS_LEVEL = {
  trip: 'Trip',
  product: 'Product',
  sending_location: 'Sending location',
  receiving_location: 'Receiving location',
}

const FILTERS_BY_LEVEL = {
  Trip: {
    product: [
      { id: 'class', label: 'Class', options: ['Accessories', 'Bags', 'Shoes', 'Ready-to-wear', 'Leather goods'] },
      { id: 'department', label: 'Department', options: ['Accessories Men', 'Accessories Women'] },
      { id: 'gender', label: 'Gender', options: ['Men', 'Women', 'Unisex'] },
      { id: 'product', label: 'Product', options: ['A1252810', 'A12528YY', 'A13314YY', 'B2045100', 'C3091522'] },
      { id: 'season', label: 'Season', options: ['Fw16', 'Fw18', 'Fw19', 'Ss20', 'Fw24', 'Ss25'] },
      {
        id: 'style',
        label: 'Style',
        options: [
          'Angel Pouch Denim Monogram',
          'Angel Pouch Grained Leather',
          'Angel Pouch Wings Cow Burnish',
          'Angel Pouch Wrinkled Patent',
          'Angel Tote Denim Monogram',
          'Angel Tote Monogram',
          'Angel Tote Voltaire',
          'Angel Tote Wings Cow Burnish',
          'Angel Tote Wrinkled Patent',
        ],
      },
      { id: 'subDepartment', label: 'Sub-department', options: ['Leather Good', 'Other Acc', 'Perfume Cosmet', 'Shoes'] },
      {
        id: 'events',
        label: 'Events',
        options: ['25w Carry Over', 'Fw24 Access Out', 'Fw24 Carry Out', 'Fw24 Stc Out', 'Fw25 Drop 1a', 'Fw25 Drop 2a', 'Fw25 Drop 3a', 'Fw25 Drop 4a'],
      },
      { id: 'articles', label: 'Articles', options: ['ART-001', 'ART-002', 'ART-003', 'ART-004', 'ART-005'] },
      { id: 'brand', label: 'Brand', options: ['Brand A', 'Brand B', 'Brand C'] },
    ],
    geographic: [
      { id: 'location', label: 'Location', options: ['Opéra', 'Cannes', 'G.I cap 3000', 'Printemps toulon', 'Marais'] },
      { id: 'region', label: 'Region', options: ['Europe', 'North America', 'Asia Pacific'] },
      { id: 'locationType', label: 'Location type', options: ['Boutique', 'Outlet', 'Department store', 'E-commerce'] },
      { id: 'countries', label: 'Countries', options: ['France', 'Italy', 'UK', 'Germany', 'Spain'] },
    ],
    advanced: [{ id: 'transferUnits', label: 'Transfer units' }],
  },
  Product: {
    product: [
      { id: 'class', label: 'Class', options: ['Accessories', 'Bags', 'Shoes', 'Ready-to-wear', 'Leather goods'] },
      { id: 'department', label: 'Department', options: ['Accessories Men', 'Accessories Women'] },
      { id: 'gender', label: 'Gender', options: ['Men', 'Women', 'Unisex'] },
      { id: 'product', label: 'Product', options: ['A1252810', 'A12528YY', 'A13314YY', 'B2045100', 'C3091522'] },
      { id: 'season', label: 'Season', options: ['Fw16', 'Fw18', 'Fw19', 'Ss20', 'Fw24', 'Ss25'] },
      {
        id: 'style',
        label: 'Style',
        options: [
          'Angel Pouch Denim Monogram',
          'Angel Pouch Grained Leather',
          'Angel Pouch Wings Cow Burnish',
          'Angel Pouch Wrinkled Patent',
          'Angel Tote Denim Monogram',
          'Angel Tote Monogram',
          'Angel Tote Voltaire',
          'Angel Tote Wings Cow Burnish',
          'Angel Tote Wrinkled Patent',
        ],
      },
      { id: 'subDepartment', label: 'Sub-department', options: ['Leather Good', 'Other Acc', 'Perfume Cosmet', 'Shoes'] },
      {
        id: 'events',
        label: 'Events',
        options: ['25w Carry Over', 'Fw24 Access Out', 'Fw24 Carry Out', 'Fw24 Stc Out', 'Fw25 Drop 1a', 'Fw25 Drop 2a', 'Fw25 Drop 3a', 'Fw25 Drop 4a'],
      },
      { id: 'size', label: 'Size', options: ['XS', 'S', 'M', 'L', 'XL'] },
      { id: 'articles', label: 'Articles', options: ['ART-001', 'ART-002', 'ART-003', 'ART-004', 'ART-005'] },
      { id: 'brand', label: 'Brand', options: ['Brand A', 'Brand B', 'Brand C'] },
      { id: 'manufacturer', label: 'Manufacturer', options: ['Manufacturer A', 'Manufacturer B', 'Manufacturer C'] },
      { id: 'collectionTypes', label: 'Collection types', options: ['Permanent', 'Seasonal', 'Limited edition', 'Capsule'] },
    ],
    geographic: [
      { id: 'location', label: 'Location', options: ['Opéra', 'Cannes', 'G.I cap 3000', 'Printemps toulon', 'Marais'] },
      { id: 'region', label: 'Region', options: ['Europe', 'North America', 'Asia Pacific'] },
      { id: 'locationType', label: 'Location type', options: ['Boutique', 'Outlet', 'Department store', 'E-commerce'] },
      { id: 'countries', label: 'Countries', options: ['France', 'Italy', 'UK', 'Germany', 'Spain'] },
    ],
    advanced: [
      { id: 'currentUnits', label: 'Current units' },
      { id: 'forecast', label: 'Forecast' },
      { id: 'transferUnits', label: 'Transfer units' },
      { id: 'currentWarehouse', label: 'Current warehouse' },
      { id: 'last7DaysSales', label: 'Last 7 days sales' },
      { id: 'last30DaysSales', label: 'Last 30 days sales' },
      { id: 'understocksBefore', label: 'Understocks before' },
      { id: 'understocksAfter', label: 'Understocks after' },
      { id: 'overstocksBefore', label: 'Overstocks before' },
      { id: 'overstocksAfter', label: 'Overstocks after' },
      { id: 'salesUplift', label: 'Sales uplift' },
    ],
  },
  'Sending location': {
    product: [
      { id: 'class', label: 'Class', options: ['Accessories', 'Bags', 'Shoes', 'Ready-to-wear', 'Leather goods'] },
      { id: 'department', label: 'Department', options: ['Accessories Men', 'Accessories Women'] },
      { id: 'gender', label: 'Gender', options: ['Men', 'Women', 'Unisex'] },
      { id: 'product', label: 'Product', options: ['A1252810', 'A12528YY', 'A13314YY', 'B2045100', 'C3091522'] },
      { id: 'season', label: 'Season', options: ['Fw16', 'Fw18', 'Fw19', 'Ss20', 'Fw24', 'Ss25'] },
      {
        id: 'style',
        label: 'Style',
        options: [
          'Angel Pouch Denim Monogram',
          'Angel Pouch Grained Leather',
          'Angel Pouch Wings Cow Burnish',
          'Angel Pouch Wrinkled Patent',
          'Angel Tote Denim Monogram',
          'Angel Tote Monogram',
          'Angel Tote Voltaire',
          'Angel Tote Wings Cow Burnish',
          'Angel Tote Wrinkled Patent',
        ],
      },
      { id: 'subDepartment', label: 'Sub-department', options: ['Leather Good', 'Other Acc', 'Perfume Cosmet', 'Shoes'] },
      {
        id: 'events',
        label: 'Events',
        options: ['25w Carry Over', 'Fw24 Access Out', 'Fw24 Carry Out', 'Fw24 Stc Out', 'Fw25 Drop 1a', 'Fw25 Drop 2a', 'Fw25 Drop 3a', 'Fw25 Drop 4a'],
      },
      { id: 'articles', label: 'Articles', options: ['ART-001', 'ART-002', 'ART-003', 'ART-004', 'ART-005'] },
      { id: 'brand', label: 'Brand', options: ['Brand A', 'Brand B', 'Brand C'] },
      { id: 'collectionTypes', label: 'Collection types', options: ['Permanent', 'Seasonal', 'Limited edition', 'Capsule'] },
    ],
    geographic: [
      { id: 'location', label: 'Location', options: ['Opéra', 'Cannes', 'G.I cap 3000', 'Printemps toulon', 'Marais'] },
      { id: 'region', label: 'Region', options: ['Europe', 'North America', 'Asia Pacific'] },
      { id: 'locationType', label: 'Location type', options: ['Boutique', 'Outlet', 'Department store', 'E-commerce'] },
      { id: 'countries', label: 'Countries', options: ['France', 'Italy', 'UK', 'Germany', 'Spain'] },
    ],
    advanced: [
      { id: 'currentUnits', label: 'Current units' },
      { id: 'forecast', label: 'Forecast' },
      { id: 'transferUnits', label: 'Transfer units' },
      { id: 'last7DaysSales', label: 'Last 7 days sales' },
      { id: 'last30DaysSales', label: 'Last 30 days sales' },
      { id: 'understocksBefore', label: 'Understocks before' },
      { id: 'understocksAfter', label: 'Understocks after' },
      { id: 'overstocksBefore', label: 'Overstocks before' },
      { id: 'overstocksAfter', label: 'Overstocks after' },
      { id: 'salesUplift', label: 'Sales uplift' },
    ],
  },
  'Receiving location': {
    product: [
      { id: 'class', label: 'Class', options: ['Accessories', 'Bags', 'Shoes', 'Ready-to-wear', 'Leather goods'] },
      { id: 'department', label: 'Department', options: ['Accessories Men', 'Accessories Women'] },
      { id: 'gender', label: 'Gender', options: ['Men', 'Women', 'Unisex'] },
      { id: 'product', label: 'Product', options: ['A1252810', 'A12528YY', 'A13314YY', 'B2045100', 'C3091522'] },
      { id: 'season', label: 'Season', options: ['Fw16', 'Fw18', 'Fw19', 'Ss20', 'Fw24', 'Ss25'] },
      {
        id: 'style',
        label: 'Style',
        options: [
          'Angel Pouch Denim Monogram',
          'Angel Pouch Grained Leather',
          'Angel Pouch Wings Cow Burnish',
          'Angel Pouch Wrinkled Patent',
          'Angel Tote Denim Monogram',
          'Angel Tote Monogram',
          'Angel Tote Voltaire',
          'Angel Tote Wings Cow Burnish',
          'Angel Tote Wrinkled Patent',
        ],
      },
      { id: 'subDepartment', label: 'Sub-department', options: ['Leather Good', 'Other Acc', 'Perfume Cosmet', 'Shoes'] },
      {
        id: 'events',
        label: 'Events',
        options: ['25w Carry Over', 'Fw24 Access Out', 'Fw24 Carry Out', 'Fw24 Stc Out', 'Fw25 Drop 1a', 'Fw25 Drop 2a', 'Fw25 Drop 3a', 'Fw25 Drop 4a'],
      },
      { id: 'articles', label: 'Articles', options: ['ART-001', 'ART-002', 'ART-003', 'ART-004', 'ART-005'] },
      { id: 'brand', label: 'Brand', options: ['Brand A', 'Brand B', 'Brand C'] },
      { id: 'collectionTypes', label: 'Collection types', options: ['Permanent', 'Seasonal', 'Limited edition', 'Capsule'] },
    ],
    geographic: [
      { id: 'location', label: 'Location', options: ['Opéra', 'Cannes', 'G.I cap 3000', 'Printemps toulon', 'Marais'] },
      { id: 'region', label: 'Region', options: ['Europe', 'North America', 'Asia Pacific'] },
      { id: 'locationType', label: 'Location type', options: ['Boutique', 'Outlet', 'Department store', 'E-commerce'] },
      { id: 'countries', label: 'Countries', options: ['France', 'Italy', 'UK', 'Germany', 'Spain'] },
    ],
    advanced: [
      { id: 'currentUnits', label: 'Current units' },
      { id: 'forecast', label: 'Forecast' },
      { id: 'transferUnits', label: 'Transfer units' },
      { id: 'currentWarehouse', label: 'Current warehouse' },
      { id: 'last7DaysSales', label: 'Last 7 days sales' },
      { id: 'last30DaysSales', label: 'Last 30 days sales' },
      { id: 'understocksBefore', label: 'Understocks before' },
      { id: 'understocksAfter', label: 'Understocks after' },
      { id: 'overstocksBefore', label: 'Overstocks before' },
      { id: 'overstocksAfter', label: 'Overstocks after' },
      { id: 'salesUplift', label: 'Sales uplift' },
    ],
  },
}


function getExceptionLevelFilterDef(applyAt, filterId) {
  const cfg = getFiltersConfigForApplyAt(applyAt)
  if (!cfg || !filterId) return null
  return [...cfg.product, ...cfg.geographic, ...cfg.advanced].find((f) => f.id === filterId) ?? null
}

function getFiltersConfigForApplyAt(applyAt) {
  const levelKey = APPLY_AT_TO_FILTERS_LEVEL[applyAt]
  return levelKey ? FILTERS_BY_LEVEL[levelKey] : null
}

function classifyFilterSelection(cfg, filterId) {
  if (!cfg || !filterId) return null
  const p = cfg.product.find((f) => f.id === filterId)
  if (p) return { kind: 'scope', def: p }
  const g = cfg.geographic.find((f) => f.id === filterId)
  if (g) return { kind: 'scope', def: g }
  const a = cfg.advanced.find((f) => f.id === filterId)
  if (a) return { kind: 'advanced', def: a }
  return null
}

/** Closed-row summary for scope value trigger; selected text uses text-[#0a0a0a], placeholder uses muted italic. */
function getScopeValuesTriggerDisplay(values) {
  const v = Array.isArray(values) ? values : []
  if (v.length === 0) return { text: 'Click to select...', isPlaceholder: true }
  if (v.length === 1) return { text: v[0], isPlaceholder: false }
  if (v.length === 2) return { text: `${v[0]}, ${v[1]}`, isPlaceholder: false }
  return { text: `${v.length} values selected`, isPlaceholder: false }
}

function getConditionFilterSelectValue(cond, cfg) {
  if (!cfg) return ''
  if (cond.filterType === 'scope' && cond.scopeCategory) return cond.scopeCategory
  if (cond.filterType === 'advanced' && cond.advancedColumn) {
    const m = cfg.advanced.find((a) => a.label === cond.advancedColumn)
    return m?.id ?? ''
  }
  return ''
}

function scopeCategoryLabelForTitle(applyAt, scopeCategoryId) {
  if (!scopeCategoryId) return ''
  const def = getExceptionLevelFilterDef(applyAt, scopeCategoryId)
  return def?.label ?? scopeCategoryId
}

function applyAtLabelForExceptionTitle(applyAtKey) {
  if (!applyAtKey) return ''
  return APPLY_AT_DISPLAY_LABELS[applyAtKey] ?? applyAtKey
}

/** Single condition summary for exception header (per-condition Apply at level). */
function buildExceptionConditionSummaryPart(cond) {
  const level = applyAtLabelForExceptionTitle(cond.applyAt)
  if (!level) return null

  if (cond.filterType === 'advanced') {
    if (!cond.advancedColumn || !cond.advancedCondition || cond.advancedValue === undefined || cond.advancedValue === '') {
      return null
    }
    return `${level} ${cond.advancedColumn} ${cond.advancedCondition.toLowerCase()} ${cond.advancedValue}`
  }

  if (cond.filterType === 'scope' && cond.scopeCategory) {
    const vals = Array.isArray(cond.scopeValues) ? cond.scopeValues : []
    if (vals.length === 0) return null
    const cat = scopeCategoryLabelForTitle(cond.applyAt, cond.scopeCategory)
    if (!cat) return null
    if (vals.length === 1) return `${level} ${cat} is ${vals[0]}`
    if (vals.length <= 3) return `${level} ${cat} in ${vals.join(', ')}`
    return `${level} ${cat}: ${vals.length} values`
  }

  return null
}

function truncateExceptionTitleDisplay(str, maxLen = 100) {
  if (str.length <= maxLen) return str
  const ellipsis = '...'
  return str.slice(0, Math.max(0, maxLen - ellipsis.length)) + ellipsis
}

function createEmptyExceptionCondition(id) {
  return {
    id,
    applyAt: '',
    filterType: '',
    scopeCategory: '',
    scopeValues: [],
    advancedColumn: '',
    advancedCondition: '',
    advancedValue: '',
  }
}

export function createDefaultScheduleExceptions() {
  return [
    {
      id: 'exc-1',
      expanded: true,
      conditions: [createEmptyExceptionCondition('cond-1')],
    },
  ]
}

function nextId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function ScheduleBlockApprovalExceptions({ block, onUpdate }) {
  const [openPopover, setOpenPopover] = useState(null)
  const [scopePopoverSearch, setScopePopoverSearch] = useState('')

  useEffect(() => {
    setScopePopoverSearch('')
  }, [openPopover])

  useEffect(() => {
    const raw = block.exceptions ?? []
    if (raw.length > 0 && !raw[0]?.conditions) {
      onUpdate({ exceptions: createDefaultScheduleExceptions() })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const exceptions =
    Array.isArray(block.exceptions) && block.exceptions[0]?.conditions
      ? block.exceptions
      : createDefaultScheduleExceptions()

  const exceptionsRef = useRef(exceptions)
  exceptionsRef.current = exceptions

  const setExceptions = (updater) => {
    const current = exceptionsRef.current
    const next = typeof updater === 'function' ? updater(current) : updater
    exceptionsRef.current = next
    onUpdate({ exceptions: next })
  }

  const toggleExceptionAccordion = (exceptionId) => {
    setExceptions((prev) =>
      prev.map((e) => (e.id === exceptionId ? { ...e, expanded: !e.expanded } : e))
    )
  }

  const removeException = (exceptionId) => {
    setExceptions((prev) => prev.filter((e) => e.id !== exceptionId))
    setOpenPopover(null)
  }

  const addException = () => {
    const excId = nextId('exc')
    const condId = nextId('cond')
    setExceptions((prev) => {
      const withExpandedFalse = prev.map((e) => ({ ...e, expanded: false }))
      return [
        ...withExpandedFalse,
        {
          id: excId,
          expanded: true,
          conditions: [createEmptyExceptionCondition(condId)],
        },
      ]
    })
  }

  const addConditionToException = (exceptionId) => {
    const newId = nextId('cond')
    setExceptions((prev) =>
      prev.map((e) =>
        e.id === exceptionId ? { ...e, conditions: [...e.conditions, createEmptyExceptionCondition(newId)] } : e
      )
    )
  }

  const removeConditionFromException = (exceptionId, conditionId) => {
    const freshId = nextId('cond')
    setExceptions((prev) =>
      prev.map((e) => {
        if (e.id !== exceptionId) return e
        const filtered = e.conditions.filter((c) => c.id !== conditionId)
        if (filtered.length === 0) {
          return { ...e, conditions: [createEmptyExceptionCondition(freshId)] }
        }
        return { ...e, conditions: filtered }
      })
    )
  }

  const updateConditionField = (exceptionId, conditionId, field, value) => {
    setExceptions((prev) =>
      prev.map((e) =>
        e.id === exceptionId
          ? {
              ...e,
              conditions: e.conditions.map((c) => (c.id === conditionId ? { ...c, [field]: value } : c)),
            }
          : e
      )
    )
  }

  const patchCondition = (exceptionId, conditionId, partial) => {
    setExceptions((prev) =>
      prev.map((e) =>
        e.id === exceptionId
          ? {
              ...e,
              conditions: e.conditions.map((c) => (c.id === conditionId ? { ...c, ...partial } : c)),
            }
          : e
      )
    )
  }

  const onConditionFilterSelectChange = (exceptionId, condition, filtersCfg, filterId) => {
    if (!filtersCfg) return
    if (!filterId) {
      patchCondition(exceptionId, condition.id, {
        filterType: '',
        scopeCategory: '',
        scopeValues: [],
        advancedColumn: '',
        advancedCondition: '',
        advancedValue: '',
      })
      setOpenPopover(null)
      return
    }
    const cls = classifyFilterSelection(filtersCfg, filterId)
    if (!cls) return
    if (cls.kind === 'scope') {
      patchCondition(exceptionId, condition.id, {
        filterType: 'scope',
        scopeCategory: filterId,
        scopeValues: [],
        advancedColumn: '',
        advancedCondition: '',
        advancedValue: '',
      })
    } else {
      patchCondition(exceptionId, condition.id, {
        filterType: 'advanced',
        scopeCategory: '',
        scopeValues: [],
        advancedColumn: cls.def.label,
        advancedCondition: '',
        advancedValue: '',
      })
    }
    setOpenPopover(null)
  }

  const resetConditionFilters = (exceptionId, conditionId) => {
    setExceptions((prev) =>
      prev.map((e) =>
        e.id === exceptionId
          ? {
              ...e,
              conditions: e.conditions.map((c) =>
                c.id === conditionId
                  ? {
                      ...c,
                      filterType: '',
                      scopeCategory: '',
                      scopeValues: [],
                      advancedColumn: '',
                      advancedCondition: '',
                      advancedValue: '',
                    }
                  : c
              ),
            }
          : e
      )
    )
  }

  const clearAllConditionsForException = (exceptionId) => {
    const freshId = nextId('cond')
    setOpenPopover(null)
    setExceptions((prev) =>
      prev.map((e) => (e.id === exceptionId ? { ...e, conditions: [createEmptyExceptionCondition(freshId)] } : e))
    )
  }

  const getExceptionDisplayName = (exc, excIdx) => {
    const n = excIdx + 1
    const prefix = `Exception ${n}`
    const parts = (exc.conditions || []).map(buildExceptionConditionSummaryPart).filter(Boolean)
    if (parts.length === 0) return prefix
    return `${prefix}: ${parts.join(' and ')}`
  }

  if (block.approvalMode !== 'auto-approve') return null

  return (
    <div className="flex flex-col gap-4">
{exceptions.map((exc, excIdx) => {
  const exceptionTitleFull = getExceptionDisplayName(exc, excIdx)
  const exceptionTitleDisplay = truncateExceptionTitleDisplay(exceptionTitleFull)
  return (
  <div key={exc.id} className="border border-[#e5e7eb] rounded-[4px] bg-white overflow-visible">
    <div className="flex items-center min-w-0">
      <button
        type="button"
        onClick={() => toggleExceptionAccordion(exc.id)}
        className="flex-1 flex items-center justify-between gap-2 min-w-0 px-4 py-3 text-left hover:bg-[#f8f8f8] transition-colors"
      >
        <span
          className="text-[14px] font-medium text-[#0a0a0a] truncate min-w-0 text-left"
          title={exceptionTitleFull}
        >
          {exceptionTitleDisplay}
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
      <div className="px-4 pb-4 pt-0 flex flex-col border-t border-[#e5e7eb]">
        <div className="flex flex-col w-full mt-4">
          {(exc.conditions || []).map((cond, condIdx) => {
            const filtersCfg = cond.applyAt ? getFiltersConfigForApplyAt(cond.applyAt) : null
            const filterSelectValue = filtersCfg ? getConditionFilterSelectValue(cond, filtersCfg) : ''
            const scopeDef =
              filtersCfg && cond.filterType === 'scope' && cond.scopeCategory
                ? [...filtersCfg.product, ...filtersCfg.geographic].find((f) => f.id === cond.scopeCategory)
                : null
            const scopeOptions = scopeDef?.options ?? []
            const popoverId = `${exc.id}__${cond.id}`
            const popoverOpen = openPopover === popoverId
            const searchQ = (scopePopoverSearch || '').trim().toLowerCase()
            const filteredScopeOptions = scopeOptions.filter(
              (name) => !searchQ || name.toLowerCase().includes(searchQ)
            )
            const selectedScopeVals = Array.isArray(cond.scopeValues) ? cond.scopeValues : []
            const allScopeSelected =
              scopeOptions.length > 0 &&
              selectedScopeVals.length === scopeOptions.length &&
              scopeOptions.every((o) => selectedScopeVals.includes(o))
            const scopeTrigger = getScopeValuesTriggerDisplay(cond.scopeValues)

            return (
              <div key={cond.id} className="w-full">
                {condIdx > 0 && (
                  <div className="flex justify-center py-1">
                    <span className="text-[11px] font-medium text-[#9ca3af] uppercase tracking-wider">
                      AND
                    </span>
                  </div>
                )}
                <div className="rounded-[4px] border border-[#e5e7eb] bg-[#fafafa] px-3 py-2">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="text-[12px] text-[#4b535c] shrink-0">Apply at</span>
                    <div className="relative shrink-0">
                      <select
                        value={cond.applyAt ?? ''}
                        onChange={(e) => {
                          const value = e.target.value
                          updateConditionField(exc.id, cond.id, 'applyAt', value)
                          resetConditionFilters(exc.id, cond.id)
                          setOpenPopover(null)
                        }}
                        className="h-9 w-[170px] py-0 pl-3 pr-9 rounded-[4px] border border-[#e9eaeb] bg-white text-[13px] text-[#0a0a0a] appearance-none"
                      >
                        <option value="" disabled>
                          Select level...
                        </option>
                        <option value="trip">Trip</option>
                        <option value="product">Product</option>
                        <option value="sending_location">Sending location</option>
                        <option value="receiving_location">Receiving location</option>
                      </select>
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#4b535c] pointer-events-none">
                        <IconChevronDownSelect />
                      </span>
                    </div>
                    {!cond.applyAt && (
                      <span className="text-[13px] text-[#9ca3af] italic flex-1 min-w-[140px]">
                        Select a level first
                      </span>
                    )}
                    {cond.applyAt && filtersCfg && (
                      <>
                        <span className="text-[12px] text-[#4b535c] shrink-0">Filter</span>
                        <div className="relative shrink-0">
                          <select
                            value={filterSelectValue}
                            onChange={(e) =>
                              onConditionFilterSelectChange(exc.id, cond, filtersCfg, e.target.value)
                            }
                            className="h-9 w-[180px] py-0 pl-3 pr-9 rounded-[4px] border border-[#e9eaeb] bg-white text-[13px] text-[#0a0a0a] appearance-none"
                          >
                            <option value="">Select filter...</option>
                            <optgroup label="Product">
                              {filtersCfg.product.map((f) => (
                                <option key={f.id} value={f.id}>
                                  {f.label}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Geographic">
                              {filtersCfg.geographic.map((f) => (
                                <option key={f.id} value={f.id}>
                                  {f.label}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Advanced">
                              {filtersCfg.advanced.map((f) => (
                                <option key={f.id} value={f.id}>
                                  {f.label}
                                </option>
                              ))}
                            </optgroup>
                          </select>
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#4b535c] pointer-events-none">
                            <IconChevronDownSelect />
                          </span>
                        </div>
                        {cond.filterType === 'scope' && cond.scopeCategory && scopeDef && (
                          <div className="relative flex-1 min-w-[120px] max-w-[280px]">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenPopover((prev) => (prev === popoverId ? null : popoverId))
                              }
                              className={`w-full min-h-9 px-2 rounded-[4px] border border-[#e9eaeb] bg-white text-left text-[13px] hover:bg-[#f9fafb] truncate ${
                                scopeTrigger.isPlaceholder
                                  ? 'text-[#9ca3af] italic'
                                  : 'text-[#0a0a0a]'
                              }`}
                            >
                              {scopeTrigger.text}
                            </button>
                            {popoverOpen && (
                              <>
                                <div
                                  className="fixed inset-0 z-[19]"
                                  aria-hidden
                                  onClick={() => setOpenPopover(null)}
                                />
                                <div
                                  className="absolute left-0 top-full z-20 mt-1 w-[280px] rounded-[4px] border border-[#e5e7eb] bg-white p-3 shadow-lg"
                                  onClick={(e) => e.stopPropagation()}
                                  role="presentation"
                                >
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <span className="text-[13px] font-semibold text-[#0a0a0a] leading-tight">
                                      {scopeDef.label}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        allScopeSelected
                                          ? updateConditionField(exc.id, cond.id, 'scopeValues', [])
                                          : updateConditionField(
                                              exc.id,
                                              cond.id,
                                              'scopeValues',
                                              [...scopeOptions]
                                            )
                                      }
                                      className="text-[12px] text-[#0267ff] hover:underline shrink-0"
                                    >
                                      {allScopeSelected ? 'Deselect all' : 'Select all'}
                                    </button>
                                  </div>
                                  <div className="relative mb-2">
                                    <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-[#9ca3af] pointer-events-none" />
                                    <input
                                      type="text"
                                      placeholder="Search"
                                      value={scopePopoverSearch}
                                      onChange={(e) => setScopePopoverSearch(e.target.value)}
                                      className="w-full h-8 pl-9 pr-2 rounded-[4px] border border-[#e5e7eb] bg-white text-[13px] text-[#0a0a0a] placeholder:text-[#9ca3af]"
                                    />
                                  </div>
                                  <div className="flex flex-col max-h-[200px] overflow-y-auto min-h-0 -mx-1">
                                    {filteredScopeOptions.map((name) => (
                                      <label
                                        key={name}
                                        className="flex items-center gap-2 py-1.5 px-2 rounded text-[13px] text-[#0a0a0a] cursor-pointer hover:bg-[#f3f4f6]"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={selectedScopeVals.includes(name)}
                                          onChange={() => {
                                            const arr = [...selectedScopeVals]
                                            const next = arr.includes(name)
                                              ? arr.filter((v) => v !== name)
                                              : [...arr, name]
                                            updateConditionField(exc.id, cond.id, 'scopeValues', next)
                                          }}
                                          className="size-4 shrink-0 rounded border-[#d1d5db] text-[#0267ff] focus:ring-[#0267ff]"
                                        />
                                        <span className="min-w-0 break-words">{name}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                        {cond.filterType === 'advanced' && (
                          <>
                            <div className="relative shrink-0">
                              <select
                                value={cond.advancedCondition ?? ''}
                                onChange={(e) =>
                                  updateConditionField(
                                    exc.id,
                                    cond.id,
                                    'advancedCondition',
                                    e.target.value
                                  )
                                }
                                className="h-9 w-[160px] py-0 pl-3 pr-9 rounded-[4px] border border-[#e9eaeb] bg-white text-[13px] text-[#0a0a0a] appearance-none"
                              >
                                <option value="">Select condition</option>
                                {ADVANCED_CONDITION_OPTIONS.map((o) => (
                                  <option key={o} value={o}>
                                    {o}
                                  </option>
                                ))}
                              </select>
                              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#4b535c] pointer-events-none">
                                <IconChevronDownSelect />
                              </span>
                            </div>
                            <input
                              type="text"
                              value={cond.advancedValue ?? ''}
                              onChange={(e) =>
                                updateConditionField(exc.id, cond.id, 'advancedValue', e.target.value)
                              }
                              placeholder="Value"
                              className="h-9 w-[120px] px-3 rounded-[4px] border border-[#e9eaeb] bg-white text-[13px] text-[#0a0a0a] placeholder:text-[#9ca3af]"
                            />
                          </>
                        )}
                      </>
                    )}
                    <button
                      type="button"
                      className="shrink-0 h-8 w-8 flex items-center justify-center rounded-[4px] text-[#4b535c] hover:bg-[#e5e7eb] hover:text-[#0a0a0a] ml-auto"
                      aria-label="Remove condition"
                      onClick={() => {
                        removeConditionFromException(exc.id, cond.id)
                        setOpenPopover((prev) => (prev === popoverId ? null : prev))
                      }}
                    >
                      <IconClose className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <button
          type="button"
          onClick={() => addConditionToException(exc.id)}
          className="self-start text-[13px] font-medium text-[#0267FF] hover:underline mt-2"
        >
          + Add condition
        </button>
        <button
          type="button"
          onClick={() => clearAllConditionsForException(exc.id)}
          className="self-start text-[13px] font-medium text-[#4b535c] hover:text-[#0a0a0a] hover:underline mt-1"
        >
          Clear filters
        </button>
      </div>
    )}
  </div>
  )
})}
      <button
        type="button"
        onClick={addException}
        className="self-start text-[13px] font-medium text-[#0267FF] hover:underline"
      >
        + Add exception
      </button>
    </div>
  )
}
