import { useState, useEffect, useRef } from 'react'
import { IconClose, IconChevronDown, IconChevronDownSelect, IconSearch } from './icons'

const ENUM_OPERATORS = [
  { value: 'is', label: 'is', multi: false },
  { value: 'is not', label: 'is not', multi: false },
  { value: 'is one of', label: 'is one of', multi: true },
  { value: 'is not one of', label: 'is not one of', multi: true },
]

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

/** Product attribute fields (no Size). Size is added only for SKU-based granularities. */
const PRODUCT_ATTRIBUTE_FIELDS = [
  { id: 'class', label: 'Class', options: ['Accessories', 'Bags', 'Shoes', 'Ready-to-wear', 'Leather goods'] },
  { id: 'department', label: 'Department', options: ['Menswear', 'Womenswear', 'Kids'] },
  { id: 'gender', label: 'Gender', options: ['Men', 'Women', 'Unisex'] },
  { id: 'product', label: 'Product', options: ['A1252810', 'A12528YY', 'A13314YY', 'B2045100', 'C3091522'] },
  { id: 'season', label: 'Season', options: ['SS26', 'AW25', 'Carryover'] },
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
  { id: 'brand', label: 'Brand', options: ['Brand A', 'Brand B', 'Brand C'] },
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

/** Row-level granularities only. Order: lowest → highest. */
const GRANULARITIES = [
  { id: 'sku-sending-location', label: 'SKU-sending location' },
  { id: 'sku-receiving-location', label: 'SKU-receiving location' },
  { id: 'sku', label: 'SKU' },
  { id: 'product-sending-location', label: 'Product-sending location' },
  { id: 'product-receiving-location', label: 'Product-receiving location' },
  { id: 'product', label: 'Product' },
]

const FILTER_CATEGORY_META = {
  product: { id: 'product', buttonLabel: '+ Add product filter' },
  sending: { id: 'sending', buttonLabel: '+ Add sending location filter' },
  receiving: { id: 'receiving', buttonLabel: '+ Add receiving location filter' },
}

function getAvailableFilterCategories(granularityId) {
  if (!granularityId) return []
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

function getCriteriaDef(criteriaId) {
  return CRITERIA_DEFS.find((c) => c.id === criteriaId) ?? null
}

function getOperatorDef(operator) {
  return ENUM_OPERATORS.find((o) => o.value === operator) ?? null
}

function isMultiOperator(operator) {
  return Boolean(getOperatorDef(operator)?.multi)
}

function getValuesTriggerDisplay(values) {
  const v = Array.isArray(values) ? values : []
  if (v.length === 0) return { text: 'Click to select...', isPlaceholder: true }
  if (v.length === 1) return { text: v[0], isPlaceholder: false }
  if (v.length === 2) return { text: `${v[0]}, ${v[1]}`, isPlaceholder: false }
  return { text: `${v.length} values selected`, isPlaceholder: false }
}

function buildFilterSummaryPart(granularityId, filter) {
  const field = getFilterFieldDef(granularityId, filter.category, filter.fieldId)
  if (!field || !filter.operator) return null
  const vals = Array.isArray(filter.values) ? filter.values.filter(Boolean) : []
  if (vals.length === 0) return null
  if (isMultiOperator(filter.operator)) {
    if (vals.length === 1) return `${field.label} ${filter.operator} ${vals[0]}`
    if (vals.length <= 3) return `${field.label} ${filter.operator} ${vals.join(', ')}`
    return `${field.label} ${filter.operator} ${vals.length} values`
  }
  return `${field.label} ${filter.operator} ${vals[0]}`
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
  return { id, category, fieldId: '', operator: '', values: [] }
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
    const granLabel = GRANULARITIES.find((g) => g.id === exc.granularity)?.label
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
                  <span className="relative inline-flex">
                    <select
                      value={exc.granularity || ''}
                      onChange={(e) => onGranularityChange(exc.id, e.target.value)}
                      className={`${INLINE_SELECT} min-w-[160px]`}
                    >
                      <option value="">Select granularity…</option>
                      {GRANULARITIES.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                    <InlineSelectChevron />
                  </span>
                  <span>, flag as unapproved when</span>
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
                      {CRITERIA_DEFS.map((c) => (
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
                      Apply only to specific products or locations?
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
                        const operatorPicked = Boolean(filter.operator)
                        const multi = isMultiOperator(filter.operator)
                        const options = fieldDef?.options ?? []
                        const selectedVals = Array.isArray(filter.values) ? filter.values : []
                        const singleValue = selectedVals[0] ?? ''
                        const popoverId = `${exc.id}__${filter.id}`
                        const popoverOpen = openPopover === popoverId
                        const searchQ = (scopePopoverSearch || '').trim().toLowerCase()
                        const filteredOptions = options.filter(
                          (name) => !searchQ || name.toLowerCase().includes(searchQ)
                        )
                        const allSelected =
                          options.length > 0 &&
                          selectedVals.length === options.length &&
                          options.every((o) => selectedVals.includes(o))
                        const valuesTrigger = getValuesTriggerDisplay(selectedVals)

                        return (
                          <span key={filter.id} className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-2">
                            {filterIdx > 0 && <span>and</span>}
                            <span className="relative inline-flex">
                              <select
                                value={filter.fieldId || ''}
                                onChange={(e) =>
                                  patchFilter(exc.id, filter.id, {
                                    fieldId: e.target.value,
                                    operator: '',
                                    values: [],
                                  })
                                }
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
                            <span className="relative inline-flex">
                              <select
                                value={filter.operator || ''}
                                disabled={!fieldPicked}
                                onChange={(e) =>
                                  patchFilter(exc.id, filter.id, {
                                    operator: e.target.value,
                                    values: [],
                                  })
                                }
                                className={`${INLINE_SELECT} min-w-[120px]`}
                              >
                                <option value="">Select condition…</option>
                                {ENUM_OPERATORS.map((op) => (
                                  <option key={op.value} value={op.value}>
                                    {op.label}
                                  </option>
                                ))}
                              </select>
                              <InlineSelectChevron />
                            </span>
                            {!fieldPicked || !operatorPicked ? (
                              <span
                                className="inline-flex h-8 min-w-[100px] cursor-not-allowed items-center rounded-[4px] border border-[#e9eaeb] bg-[#f3f4f6] px-2.5 text-[13px] italic text-[#9ca3af]"
                                aria-disabled
                              >
                                Select value…
                              </span>
                            ) : multi ? (
                              <span className="relative inline-flex min-w-[120px] max-w-[240px]">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenPopover((prev) =>
                                      prev === popoverId ? null : popoverId
                                    )
                                  }
                                  className={`h-8 w-full truncate rounded-[4px] border border-[#e9eaeb] bg-white px-2.5 text-left text-[13px] hover:bg-[#f9fafb] ${
                                    valuesTrigger.isPlaceholder
                                      ? 'italic text-[#9ca3af]'
                                      : 'text-[#0a0a0a]'
                                  }`}
                                >
                                  {valuesTrigger.text}
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
                                      <div className="mb-2 flex items-start justify-between gap-2">
                                        <span className="text-[13px] font-semibold leading-tight text-[#0a0a0a]">
                                          {fieldDef?.label}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            patchFilter(exc.id, filter.id, {
                                              values: allSelected ? [] : [...options],
                                            })
                                          }
                                          className="shrink-0 text-[12px] text-[#0267ff] hover:underline"
                                        >
                                          {allSelected ? 'Deselect all' : 'Select all'}
                                        </button>
                                      </div>
                                      <div className="relative mb-2">
                                        <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-[#9ca3af]" />
                                        <input
                                          type="text"
                                          placeholder="Search"
                                          value={scopePopoverSearch}
                                          onChange={(e) => setScopePopoverSearch(e.target.value)}
                                          className="h-8 w-full rounded-[4px] border border-[#e5e7eb] bg-white pl-9 pr-2 text-[13px] text-[#0a0a0a] placeholder:text-[#9ca3af]"
                                        />
                                      </div>
                                      <div className="-mx-1 flex max-h-[200px] min-h-0 flex-col overflow-y-auto">
                                        {filteredOptions.map((name) => (
                                          <label
                                            key={name}
                                            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-[13px] text-[#0a0a0a] hover:bg-[#f3f4f6]"
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
                                      </div>
                                    </div>
                                  </>
                                )}
                              </span>
                            ) : (
                              <span className="relative inline-flex">
                                <select
                                  value={singleValue}
                                  onChange={(e) =>
                                    patchFilter(exc.id, filter.id, {
                                      values: e.target.value ? [e.target.value] : [],
                                    })
                                  }
                                  className={`${INLINE_SELECT} min-w-[120px]`}
                                >
                                  <option value="">Select value…</option>
                                  {options.map((name) => (
                                    <option key={name} value={name}>
                                      {name}
                                    </option>
                                  ))}
                                </select>
                                <InlineSelectChevron />
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
