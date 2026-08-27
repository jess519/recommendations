import { useState, useEffect, useRef } from 'react'
import { IconClose, IconChevronDown, IconChevronDownSelect, IconSearch } from './icons'

const NUMERIC_OPERATORS = [
  'Equal to',
  'Greater than',
  'Lower than',
  'Greater than or equal to',
  'Lower than or equal to',
]

const COVERAGE_UNITS = [
  { value: 'weeks', label: 'weeks' },
  { value: 'days', label: 'days' },
]

const GENERIC_MOCK_OPTIONS = ['Option A', 'Option B', 'Option C', 'Option D']

const INLINE_SELECT =
  'h-8 max-w-full appearance-none rounded-[4px] border border-[#e9eaeb] bg-white py-0 pl-2.5 pr-7 text-[13px] text-[#0a0a0a] disabled:cursor-not-allowed disabled:bg-[#f3f4f6] disabled:text-[#9ca3af]'

const modeToggleButtonClass = (active) =>
  active
    ? 'h-7 rounded-[4px] px-3 text-[13px] font-medium bg-[#1d4ed8] text-white'
    : 'h-7 rounded-[4px] px-3 text-[13px] font-medium bg-white text-[#0a0a0a] border border-[#E9EAEB]'

/** Product attribute fields (no Size). Size is added only for SKU-based granularities. */
const PRODUCT_ATTRIBUTE_FIELDS = [
  { id: 'class', label: 'Class', options: ['Accessories', 'Bags', 'Shoes', 'Ready-to-wear', 'Leather goods'] },
  {
    id: 'department',
    label: 'Department',
    options: ['Menswear', 'Womenswear', 'Kids', 'Home', 'Beauty'],
  },
  { id: 'gender', label: 'Gender', options: ['Men', 'Women', 'Unisex'] },
  { id: 'product', label: 'Product', options: ['A1252810', 'A12528YY', 'A13314YY', 'B2045100', 'C3091522'] },
  { id: 'season', label: 'Season', options: ['SS26', 'AW25', 'Carryover', 'SS25', 'AW24'] },
  {
    id: 'style',
    label: 'Style',
    options: [
      'Angel Pouch Denim Monogram',
      'Angel Pouch Grained Leather',
      'Angel Tote Monogram',
      'Angel Tote Voltaire',
    ],
  },
  { id: 'subDepartment', label: 'Sub-department', options: ['Leather Good', 'Other Acc', 'Perfume Cosmet', 'Shoes'] },
  {
    id: 'events',
    label: 'Events',
    options: ['25w Carry Over', 'Fw24 Access Out', 'Fw25 Drop 1a', 'Fw25 Drop 2a'],
  },
  { id: 'articles', label: 'Articles', options: ['ART-001', 'ART-002', 'ART-003', 'ART-004', 'ART-005'] },
  { id: 'brand', label: 'Brand', options: ['Brand A', 'Brand B', 'Brand C', 'Brand D'] },
  { id: 'manufacturer', label: 'Manufacturer', options: GENERIC_MOCK_OPTIONS },
  { id: 'collectionTypes', label: 'Collection types', options: ['Permanent', 'Seasonal', 'Limited edition', 'Capsule'] },
]

const SIZE_FIELD = { id: 'size', label: 'Size', options: ['XS', 'S', 'M', 'L', 'XL'] }

const LOCATION_FIELD_DEFS = [
  {
    key: 'location',
    label: 'Location',
    options: [
      'Paris Nord',
      'Milan Duomo',
      'Berlin Mitte',
      'London Oxford St',
      'Madrid Sol',
      'Marseille',
      'Marseille store',
    ],
  },
  {
    key: 'locationBudgetLevels',
    label: 'Location budget levels',
    options: ['Tier 1', 'Tier 2', 'Tier 3'],
  },
  {
    key: 'territories',
    label: 'Territories',
    options: ['Iberia', 'DACH', 'Benelux', 'Nordics', 'UK & Ireland'],
  },
  {
    key: 'locationType',
    label: 'Location type',
    options: ['Warehouse', 'Store', 'Outlet'],
  },
  {
    key: 'regions',
    label: 'Regions',
    options: ['North EU', 'South EU', 'Central EU', 'UK'],
  },
  {
    key: 'countries',
    label: 'Countries',
    options: ['France', 'Italy', 'Germany', 'Spain', 'UK', 'Netherlands'],
  },
  {
    key: 'cities',
    label: 'Cities',
    options: ['Paris', 'Milan', 'Berlin', 'Madrid', 'London', 'Amsterdam'],
  },
]

function makeLocationFields(prefix) {
  return LOCATION_FIELD_DEFS.map((f) => ({
    id: `${prefix}__${f.key}`,
    label: f.label,
    options: f.options,
  }))
}

const SENDING_LOCATION_FIELDS = makeLocationFields('sending')
const RECEIVING_LOCATION_FIELDS = makeLocationFields('receiving')

/** Row-level granularities. Order: lowest → highest. */
const ROW_LEVEL_GRANULARITIES = [
  { id: 'sku-sending-location', label: 'SKU-sending location' },
  { id: 'sku-receiving-location', label: 'SKU-receiving location' },
  { id: 'sku', label: 'SKU' },
  { id: 'product-sending-location', label: 'Product-sending location' },
  { id: 'product-receiving-location', label: 'Product-receiving location' },
  { id: 'product', label: 'Product' },
]

/** Aggregated granularities — sum Recommended transfer units across matching SKU-trips. */
const AGGREGATED_GRANULARITIES = [
  { id: 'sending-location', label: 'Sending location' },
  { id: 'receiving-location', label: 'Receiving location' },
]

const GRANULARITY_GROUPS = [
  { id: 'per-sku-trip', label: 'Per SKU-trip', granularities: ROW_LEVEL_GRANULARITIES },
  {
    id: 'total-across-locations',
    label: 'Total across locations',
    granularities: AGGREGATED_GRANULARITIES,
  },
]

const ALL_GRANULARITIES = [...ROW_LEVEL_GRANULARITIES, ...AGGREGATED_GRANULARITIES]

function isAggregatedGranularity(granularityId) {
  return granularityId === 'sending-location' || granularityId === 'receiving-location'
}

function getGranularityLabel(granularityId) {
  return ALL_GRANULARITIES.find((g) => g.id === granularityId)?.label
}

const FILTER_CATEGORY_META = {
  product: { id: 'product', buttonLabel: '+ Add product filter' },
  sending: { id: 'sending', buttonLabel: '+ Add sending location filter' },
  receiving: { id: 'receiving', buttonLabel: '+ Add receiving location filter' },
}

function getAvailableFilterCategories(granularityId) {
  if (!granularityId) return []
  if (granularityId === 'sending-location') return [FILTER_CATEGORY_META.sending]
  if (granularityId === 'receiving-location') return [FILTER_CATEGORY_META.receiving]
  const cats = [FILTER_CATEGORY_META.product]
  if (granularityId.includes('sending-location')) cats.push(FILTER_CATEGORY_META.sending)
  if (granularityId.includes('receiving-location')) cats.push(FILTER_CATEGORY_META.receiving)
  return cats
}

function getFieldsForCategory(granularityId, category) {
  if (category === 'product') {
    return granularityId?.startsWith('sku')
      ? [...PRODUCT_ATTRIBUTE_FIELDS, SIZE_FIELD]
      : PRODUCT_ATTRIBUTE_FIELDS
  }
  if (category === 'sending') return SENDING_LOCATION_FIELDS
  if (category === 'receiving') return RECEIVING_LOCATION_FIELDS
  return []
}

function getFilterFieldDef(granularityId, category, fieldId) {
  if (!fieldId) return null
  return getFieldsForCategory(granularityId, category).find((f) => f.id === fieldId) ?? null
}

const CRITERIA_DEFS = [
  { id: 'recommended-transfer-units', label: 'Recommended transfer units', hasUnit: false },
  { id: 'soh-units-after', label: 'SOH units after', hasUnit: false },
  { id: 'left-in-warehouse-units-after', label: 'Left in warehouse units after', hasUnit: false },
  {
    id: 'left-in-warehouse-coverage-after',
    label: 'Left in warehouse coverage after',
    hasUnit: true,
  },
  {
    id: 'time-from-first-stock-to-sales-date',
    label: 'Time from first stock to sales date',
    hasUnit: true,
  },
]

function getCriteriaOptionsForGranularity(granularityId) {
  if (isAggregatedGranularity(granularityId)) {
    return CRITERIA_DEFS.filter((c) => c.id === 'recommended-transfer-units')
  }
  return CRITERIA_DEFS
}

function getCriteriaDef(criteriaId) {
  return CRITERIA_DEFS.find((c) => c.id === criteriaId) ?? null
}

function formatFilterValuesList(values) {
  const v = Array.isArray(values) ? values.filter(Boolean) : []
  if (v.length === 0) return ''
  if (v.length <= 2) return v.join(', ')
  return `${v[0]}, ${v[1]} +${v.length - 2} more`
}

/** Closed-row / sentence readback for a filter (Include/Exclude multi-select). */
function buildFilterSummaryPart(granularityId, filter) {
  const field = getFilterFieldDef(granularityId, filter.category, filter.fieldId)
  if (!field) return null
  const vals = Array.isArray(filter.values) ? filter.values.filter(Boolean) : []
  if (vals.length === 0) return null
  const modeLabel = filter.mode === 'exclude' ? 'Exclude' : 'Include'
  return `${field.label}: ${modeLabel} ${formatFilterValuesList(vals)}`
}

function buildCriteriaSummaryPart(crit) {
  if (!crit) return null
  const def = getCriteriaDef(crit.criteriaId)
  if (!def || !crit.operator || crit.value === undefined || crit.value === '') return null
  const unit = def.hasUnit && crit.unit ? ` ${crit.unit}` : ''
  return `${def.label} ${crit.operator.toLowerCase()} ${crit.value}${unit}`
}

function truncateExceptionTitleDisplay(str, maxLen = 100) {
  if (str.length <= maxLen) return str
  const ellipsis = '...'
  return str.slice(0, Math.max(0, maxLen - ellipsis.length)) + ellipsis
}

function createEmptyFilter(id, category) {
  return { id, category, fieldId: '', mode: 'include', values: [] }
}

function createEmptyCriteria() {
  return { criteriaId: '', operator: '', value: '', unit: 'weeks' }
}

function createEmptyException(id) {
  return {
    id,
    expanded: true,
    granularity: '',
    filters: [],
    criteria: createEmptyCriteria(),
  }
}

export function createDefaultScheduleExceptions() {
  return [createEmptyException('exc-1')]
}

function nextId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

/** Sentence-model shape: criteria is a single object (not an array). */
function isSentenceShape(exc) {
  return (
    exc != null &&
    typeof exc === 'object' &&
    'granularity' in exc &&
    Array.isArray(exc.filters) &&
    exc.criteria != null &&
    !Array.isArray(exc.criteria)
  )
}

function InlineSelectChevron() {
  return (
    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#4b535c]">
      <IconChevronDownSelect />
    </span>
  )
}

function GranularityPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const selectedLabel = getGranularityLabel(value)

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${INLINE_SELECT} inline-flex min-w-[180px] items-center pr-7 text-left ${
          selectedLabel ? 'text-[#0a0a0a]' : 'text-[#9ca3af]'
        }`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="min-w-0 truncate">{selectedLabel || 'Select granularity…'}</span>
      </button>
      <InlineSelectChevron />
      {open && (
        <>
          <div
            className="fixed inset-0 z-[19]"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute left-0 top-full z-20 mt-1 min-w-[260px] overflow-hidden rounded-[4px] border border-[#EAEAEA] bg-white py-2 shadow-[0px_8px_25px_0px_rgba(0,0,0,0.12)]"
            role="listbox"
            onClick={(e) => e.stopPropagation()}
          >
            {GRANULARITY_GROUPS.map((group, groupIdx) => (
              <div
                key={group.id}
                className={groupIdx > 0 ? 'mt-2 border-t border-[#e5e7eb] pt-2' : ''}
              >
                <div className="mb-1 px-3 text-[12px] font-medium tracking-[0.04em] text-[#4b535c]">
                  {group.label}
                </div>
                {group.granularities.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    role="option"
                    aria-selected={value === g.id}
                    onClick={() => {
                      onChange(g.id)
                      setOpen(false)
                    }}
                    className={`flex w-full px-3 py-1.5 pl-5 text-left text-[13px] hover:bg-[#f3f4f6] ${
                      value === g.id
                        ? 'bg-[#eff6ff] font-medium text-[#1d4ed8]'
                        : 'text-[#0a0a0a]'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </span>
  )
}

export function ScheduleBlockApprovalExceptions({ block, onUpdate }) {
  const [openPopover, setOpenPopover] = useState(null)
  const [scopePopoverSearch, setScopePopoverSearch] = useState('')

  useEffect(() => {
    setScopePopoverSearch('')
  }, [openPopover])

  useEffect(() => {
    const raw = block.exceptions ?? []
    if (raw.length === 0 || !isSentenceShape(raw[0])) {
      onUpdate({ exceptions: createDefaultScheduleExceptions() })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const rawExceptions = Array.isArray(block.exceptions) ? block.exceptions : []
  const exceptions =
    rawExceptions.length > 0 && isSentenceShape(rawExceptions[0])
      ? rawExceptions
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
    setExceptions((prev) => {
      const withExpandedFalse = prev.map((e) => ({ ...e, expanded: false }))
      return [...withExpandedFalse, createEmptyException(excId)]
    })
  }

  const patchException = (exceptionId, partial) => {
    setExceptions((prev) => prev.map((e) => (e.id === exceptionId ? { ...e, ...partial } : e)))
  }

  const onGranularityChange = (exceptionId, granularity) => {
    setOpenPopover(null)
    patchException(exceptionId, {
      granularity,
      filters: [],
      criteria: createEmptyCriteria(),
    })
  }

  const patchCriteria = (exceptionId, partial) => {
    setExceptions((prev) =>
      prev.map((e) =>
        e.id === exceptionId ? { ...e, criteria: { ...e.criteria, ...partial } } : e
      )
    )
  }

  const addFilterCategory = (exceptionId, category) => {
    setExceptions((prev) =>
      prev.map((e) => {
        if (e.id !== exceptionId) return e
        if (e.filters.some((f) => f.category === category)) return e
        return {
          ...e,
          filters: [...e.filters, createEmptyFilter(nextId('filter'), category)],
        }
      })
    )
  }

  const removeFilter = (exceptionId, filterId) => {
    setExceptions((prev) =>
      prev.map((e) => {
        if (e.id !== exceptionId) return e
        return { ...e, filters: e.filters.filter((f) => f.id !== filterId) }
      })
    )
    setOpenPopover((prev) => (prev?.startsWith(`${exceptionId}__${filterId}`) ? null : prev))
  }

  const patchFilter = (exceptionId, filterId, partial) => {
    setExceptions((prev) =>
      prev.map((e) =>
        e.id === exceptionId
          ? {
              ...e,
              filters: e.filters.map((f) => (f.id === filterId ? { ...f, ...partial } : f)),
            }
          : e
      )
    )
  }

  const getExceptionDisplayName = (exc, excIdx) => {
    const n = excIdx + 1
    const prefix = `Exception ${n}`
    const granLabel = getGranularityLabel(exc.granularity)
    const filterParts = (exc.filters || [])
      .map((f) => buildFilterSummaryPart(exc.granularity, f))
      .filter(Boolean)
    const criteriaPart = buildCriteriaSummaryPart(exc.criteria)
    const parts = [...filterParts, ...(criteriaPart ? [criteriaPart] : [])]
    if (!granLabel && parts.length === 0) return prefix
    if (granLabel && parts.length === 0) return `${prefix}: ${granLabel}`
    if (granLabel) return `${prefix}: ${granLabel} · ${parts.join(' and ')}`
    return `${prefix}: ${parts.join(' and ')}`
  }

  if (block.approvalMode !== 'auto-approve') return null

  return (
    <div className="flex flex-col gap-4">
      {exceptions.map((exc, excIdx) => {
        const exceptionTitleFull = getExceptionDisplayName(exc, excIdx)
        const exceptionTitleDisplay = truncateExceptionTitleDisplay(exceptionTitleFull)
        const granularityPicked = Boolean(exc.granularity)
        const criteria = exc.criteria ?? createEmptyCriteria()
        const criteriaDef = getCriteriaDef(criteria.criteriaId)
        const criteriaPicked = Boolean(criteria.criteriaId)
        const criteriaOperatorPicked = Boolean(criteria.operator)
        const hasUnit = Boolean(criteriaDef?.hasUnit)
        const availableCats = getAvailableFilterCategories(exc.granularity)
        const usedCategories = new Set((exc.filters || []).map((f) => f.category))
        const remainingCats = availableCats.filter((c) => !usedCategories.has(c.id))
        // Stable order for sentence: product, then location (sending/receiving)
        const orderedFilters = [...(exc.filters || [])].sort((a, b) => {
          const order = { product: 0, sending: 1, receiving: 1 }
          return (order[a.category] ?? 9) - (order[b.category] ?? 9)
        })

        return (
          <div key={exc.id} className="overflow-visible rounded-[4px] border border-[#e5e7eb] bg-white">
            <div className="flex min-w-0 items-center">
              <button
                type="button"
                onClick={() => toggleExceptionAccordion(exc.id)}
                className="flex min-w-0 flex-1 items-center justify-between gap-2 px-4 py-3 text-left transition-colors hover:bg-[#f8f8f8]"
              >
                <span
                  className="min-w-0 truncate text-left text-[14px] font-medium text-[#0a0a0a]"
                  title={exceptionTitleFull}
                >
                  {exceptionTitleDisplay}
                </span>
                <IconChevronDown
                  className={`size-5 shrink-0 text-[#4b535c] transition-transform ${
                    exc.expanded ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={() => removeException(exc.id)}
                className="flex h-10 w-10 shrink-0 items-center justify-center text-[#4b535c] hover:bg-[#e5e7eb]"
                aria-label="Delete exception"
              >
                <IconClose className="size-4" />
              </button>
            </div>

            {exc.expanded && (
              <div className="border-t border-[#e5e7eb] px-4 pb-4 pt-4">
                {/* Base sentence */}
                <p className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-[14px] leading-8 text-[#0a0a0a]">
                  <span>For each</span>
                  <GranularityPicker
                    value={exc.granularity || ''}
                    onChange={(next) => onGranularityChange(exc.id, next)}
                  />
                  <span>, flag as unapproved when</span>
                  {isAggregatedGranularity(exc.granularity) && <span>total</span>}
                  <span className="relative inline-flex">
                    <select
                      value={criteria.criteriaId || ''}
                      disabled={!granularityPicked}
                      onChange={(e) => {
                        const selectedCriteriaId = e.target.value
                        const nextDef = getCriteriaDef(selectedCriteriaId)
                        patchCriteria(exc.id, {
                          criteriaId: selectedCriteriaId,
                          operator: '',
                          value: '',
                          unit: nextDef?.hasUnit ? 'weeks' : 'weeks',
                        })
                      }}
                      className={`${INLINE_SELECT} min-w-[200px]`}
                    >
                      <option value="">Select criteria…</option>
                      {getCriteriaOptionsForGranularity(exc.granularity).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <InlineSelectChevron />
                  </span>
                  <span>is</span>
                  <span className="relative inline-flex">
                    <select
                      value={criteria.operator || ''}
                      disabled={!criteriaPicked}
                      onChange={(e) => patchCriteria(exc.id, { operator: e.target.value })}
                      className={`${INLINE_SELECT} min-w-[160px]`}
                    >
                      <option value="">Select condition…</option>
                      {NUMERIC_OPERATORS.map((op) => (
                        <option key={op} value={op}>
                          {op}
                        </option>
                      ))}
                    </select>
                    <InlineSelectChevron />
                  </span>
                  {!criteriaPicked || !criteriaOperatorPicked ? (
                    <span
                      className="inline-flex h-8 min-w-[72px] cursor-not-allowed items-center rounded-[4px] border border-[#e9eaeb] bg-[#f3f4f6] px-2.5 text-[13px] italic text-[#9ca3af]"
                      aria-disabled
                    >
                      Value
                    </span>
                  ) : (
                    <input
                      type="number"
                      value={criteria.value ?? ''}
                      onChange={(e) => patchCriteria(exc.id, { value: e.target.value })}
                      placeholder="Value"
                      className="h-8 w-[88px] rounded-[4px] border border-[#e9eaeb] bg-white px-2.5 text-[13px] text-[#0a0a0a] placeholder:text-[#9ca3af] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  )}
                  {criteriaPicked && criteriaOperatorPicked && hasUnit && (
                    <span className="relative inline-flex">
                      <select
                        value={criteria.unit || 'weeks'}
                        onChange={(e) => patchCriteria(exc.id, { unit: e.target.value })}
                        className={`${INLINE_SELECT} min-w-[88px]`}
                      >
                        {COVERAGE_UNITS.map((u) => (
                          <option key={u.value} value={u.value}>
                            {u.label}
                          </option>
                        ))}
                      </select>
                      <InlineSelectChevron />
                    </span>
                  )}
                  <span>.</span>
                </p>

                {/* Filters: empty affordance OR applied sentence */}
                {granularityPicked && orderedFilters.length === 0 && (
                  <div className="mt-3 flex flex-col gap-2">
                    <p className="text-[13px] text-[#4b535c]">
                      {isAggregatedGranularity(exc.granularity)
                        ? 'Apply only to specific locations?'
                        : 'Apply only to specific products or locations?'}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      {remainingCats.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => addFilterCategory(exc.id, cat.id)}
                          className="text-[13px] font-medium text-[#0267FF] hover:underline"
                        >
                          {cat.buttonLabel}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {granularityPicked && orderedFilters.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-[14px] leading-8 text-[#0a0a0a]">
                      <span>Apply only to</span>
                      {orderedFilters.map((filter, filterIdx) => {
                        const fields = getFieldsForCategory(exc.granularity, filter.category)
                        const fieldDef = getFilterFieldDef(
                          exc.granularity,
                          filter.category,
                          filter.fieldId
                        )
                        const fieldPicked = Boolean(filter.fieldId)
                        const options = fieldDef?.options ?? []
                        const selectedVals = Array.isArray(filter.values) ? filter.values : []
                        const mode = filter.mode === 'exclude' ? 'exclude' : 'include'
                        const modeLabel = mode === 'exclude' ? 'Exclude' : 'Include'
                        const popoverId = `${exc.id}__${filter.id}`
                        const popoverOpen = openPopover === popoverId
                        const searchQ = (scopePopoverSearch || '').trim().toLowerCase()
                        const filteredOptions = options.filter(
                          (name) => !searchQ || name.toLowerCase().includes(searchQ)
                        )
                        const allVisibleSelected =
                          filteredOptions.length > 0 &&
                          filteredOptions.every((o) => selectedVals.includes(o))
                        const valuesSummary = formatFilterValuesList(selectedVals)
                        const affordanceIsPlaceholder = selectedVals.length === 0
                        const affordanceText = affordanceIsPlaceholder
                          ? `${modeLabel}: Select values…`
                          : `${modeLabel} ${valuesSummary}`

                        return (
                          <span
                            key={filter.id}
                            className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-2"
                          >
                            {filterIdx > 0 && <span>and</span>}
                            <span className="relative inline-flex">
                              <select
                                value={filter.fieldId || ''}
                                onChange={(e) => {
                                  setOpenPopover(null)
                                  patchFilter(exc.id, filter.id, {
                                    fieldId: e.target.value,
                                    mode: 'include',
                                    values: [],
                                  })
                                }}
                                className={`${INLINE_SELECT} min-w-[140px]`}
                              >
                                <option value="">Select field…</option>
                                {fields.map((f) => (
                                  <option key={f.id} value={f.id}>
                                    {f.label}
                                  </option>
                                ))}
                              </select>
                              <InlineSelectChevron />
                            </span>
                            {fieldPicked && (
                              <span className="relative inline-flex max-w-[320px]">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenPopover((prev) =>
                                      prev === popoverId ? null : popoverId
                                    )
                                  }
                                  className={`flex h-8 max-w-full items-center gap-1 truncate rounded-[4px] border border-[#e9eaeb] bg-white py-0 pl-2.5 pr-7 text-left text-[13px] hover:bg-[#f9fafb] ${
                                    affordanceIsPlaceholder
                                      ? 'italic text-[#9ca3af]'
                                      : 'text-[#0a0a0a]'
                                  }`}
                                >
                                  <span className="min-w-0 truncate">{affordanceText}</span>
                                </button>
                                <InlineSelectChevron />
                                {popoverOpen && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-[19]"
                                      aria-hidden
                                      onClick={() => setOpenPopover(null)}
                                    />
                                    <div
                                      className="absolute left-0 top-full z-20 mt-1 w-[300px] overflow-hidden rounded-[4px] border border-[#EAEAEA] bg-white shadow-[0px_8px_25px_0px_rgba(0,0,0,0.12)]"
                                      onClick={(e) => e.stopPropagation()}
                                      role="presentation"
                                    >
                                      <div className="flex items-center gap-2 border-b border-[#e5e7eb] px-3 py-2.5">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            patchFilter(exc.id, filter.id, { mode: 'include' })
                                          }
                                          className={modeToggleButtonClass(mode === 'include')}
                                        >
                                          Include
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            patchFilter(exc.id, filter.id, { mode: 'exclude' })
                                          }
                                          className={modeToggleButtonClass(mode === 'exclude')}
                                        >
                                          Exclude
                                        </button>
                                      </div>
                                      <div className="relative border-b border-[#e5e7eb] px-3 py-2">
                                        <IconSearch className="pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-[#9ca3af]" />
                                        <input
                                          type="text"
                                          placeholder="Search"
                                          value={scopePopoverSearch}
                                          onChange={(e) => setScopePopoverSearch(e.target.value)}
                                          className="h-8 w-full rounded-[4px] border border-[#e5e7eb] bg-white pl-9 pr-2 text-[13px] text-[#0a0a0a] placeholder:text-[#9ca3af]"
                                        />
                                      </div>
                                      <div className="flex max-h-[220px] min-h-0 flex-col overflow-y-auto">
                                        {filteredOptions.map((name) => (
                                          <label
                                            key={name}
                                            className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-[13px] text-[#0a0a0a] hover:bg-[#f8f8f8]"
                                          >
                                            <input
                                              type="checkbox"
                                              checked={selectedVals.includes(name)}
                                              onChange={() => {
                                                const next = selectedVals.includes(name)
                                                  ? selectedVals.filter((v) => v !== name)
                                                  : [...selectedVals, name]
                                                patchFilter(exc.id, filter.id, { values: next })
                                              }}
                                              className="size-4 shrink-0 rounded border-[#d1d5db] text-[#0267ff] focus:ring-[#0267ff]"
                                            />
                                            <span className="min-w-0 break-words">{name}</span>
                                          </label>
                                        ))}
                                        {filteredOptions.length === 0 && (
                                          <p className="px-4 py-3 text-[13px] text-[#9ca3af]">
                                            No matches
                                          </p>
                                        )}
                                      </div>
                                      <div className="border-t border-[#e5e7eb] px-3 py-2">
                                        <button
                                          type="button"
                                          disabled={filteredOptions.length === 0}
                                          onClick={() => {
                                            if (allVisibleSelected) {
                                              const visible = new Set(filteredOptions)
                                              patchFilter(exc.id, filter.id, {
                                                values: selectedVals.filter((v) => !visible.has(v)),
                                              })
                                            } else {
                                              const merged = [...selectedVals]
                                              filteredOptions.forEach((opt) => {
                                                if (!merged.includes(opt)) merged.push(opt)
                                              })
                                              patchFilter(exc.id, filter.id, { values: merged })
                                            }
                                          }}
                                          className="text-[13px] font-medium text-[#0267ff] hover:underline disabled:cursor-not-allowed disabled:text-[#9ca3af] disabled:no-underline"
                                        >
                                          {allVisibleSelected
                                            ? `Deselect all ${filteredOptions.length} options`
                                            : `Select all ${filteredOptions.length} options`}
                                        </button>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </span>
                            )}
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] text-[#4b535c] hover:bg-[#e5e7eb] hover:text-[#0a0a0a]"
                              aria-label="Remove filter"
                              onClick={() => removeFilter(exc.id, filter.id)}
                            >
                              <IconClose className="size-3.5" />
                            </button>
                          </span>
                        )
                      })}
                      <span>.</span>
                    </div>
                    {remainingCats.length > 0 && (
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        {remainingCats.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => addFilterCategory(exc.id, cat.id)}
                            className="text-[13px] font-medium text-[#0267FF] hover:underline"
                          >
                            {cat.buttonLabel}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
