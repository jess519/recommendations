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

/** Row-level granularities only (commit 2). Order: lowest → highest. */
const GRANULARITIES = [
  { id: 'sku-sending-location', label: 'SKU-sending location' },
  { id: 'sku-receiving-location', label: 'SKU-receiving location' },
  { id: 'sku', label: 'SKU' },
  { id: 'product-sending-location', label: 'Product-sending location' },
  { id: 'product-receiving-location', label: 'Product-receiving location' },
  { id: 'product', label: 'Product' },
]

/**
 * Filter field groups available for each granularity.
 * SKU-based includes Size; product-based does not.
 */
function getFilterFieldGroups(granularityId) {
  if (!granularityId) return []
  const isSku = granularityId.startsWith('sku')
  const productFields = isSku
    ? [...PRODUCT_ATTRIBUTE_FIELDS, SIZE_FIELD]
    : PRODUCT_ATTRIBUTE_FIELDS

  const groups = [{ id: 'product', label: 'Product', fields: productFields }]

  if (granularityId.includes('sending-location')) {
    groups.push({ id: 'sending', label: 'Sending location', fields: SENDING_LOCATION_FIELDS })
  }
  if (granularityId.includes('receiving-location')) {
    groups.push({ id: 'receiving', label: 'Receiving location', fields: RECEIVING_LOCATION_FIELDS })
  }
  return groups
}

function getAllFilterFields(granularityId) {
  return getFilterFieldGroups(granularityId).flatMap((g) => g.fields)
}

function getFilterFieldDef(granularityId, fieldId) {
  if (!fieldId) return null
  return getAllFilterFields(granularityId).find((f) => f.id === fieldId) ?? null
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
  const field = getFilterFieldDef(granularityId, filter.fieldId)
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

function createEmptyFilter(id) {
  return { id, fieldId: '', operator: '', values: [] }
}

function createEmptyCriteria(id) {
  return { id, criteriaId: '', operator: '', value: '', unit: 'weeks' }
}

function createEmptyException(id, criteriaId) {
  return {
    id,
    expanded: true,
    granularity: '',
    filters: [],
    criteria: [createEmptyCriteria(criteriaId)],
  }
}

export function createDefaultScheduleExceptions() {
  return [createEmptyException('exc-1', 'crit-1')]
}

function nextId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function isGranularityShape(exc) {
  return exc != null && typeof exc === 'object' && 'granularity' in exc && Array.isArray(exc.filters)
}

function AndConnector() {
  return (
    <div className="flex justify-center py-1">
      <div className="relative">
        <select
          value="and"
          onChange={() => {}}
          aria-label="Row connector"
          className="h-7 appearance-none rounded-[4px] border border-[#e9eaeb] bg-white py-0 pl-2 pr-7 text-[11px] font-medium uppercase tracking-wider text-[#9ca3af]"
        >
          <option value="and">And</option>
        </select>
        <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[#9ca3af]">
          <IconChevronDownSelect />
        </span>
      </div>
    </div>
  )
}

export function ScheduleBlockApprovalExceptions({ block, onUpdate }) {
  const [openPopover, setOpenPopover] = useState(null)
  const [scopePopoverSearch, setScopePopoverSearch] = useState('')

  useEffect(() => {
    setScopePopoverSearch('')
  }, [openPopover])

  // Migrate empty / pre-granularity shapes → one empty exception card.
  useEffect(() => {
    const raw = block.exceptions ?? []
    if (raw.length === 0 || !isGranularityShape(raw[0])) {
      onUpdate({ exceptions: createDefaultScheduleExceptions() })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const rawExceptions = Array.isArray(block.exceptions) ? block.exceptions : []
  const exceptions =
    rawExceptions.length > 0 && isGranularityShape(rawExceptions[0])
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
    const critId = nextId('crit')
    setExceptions((prev) => {
      const withExpandedFalse = prev.map((e) => ({ ...e, expanded: false }))
      return [...withExpandedFalse, createEmptyException(excId, critId)]
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
      criteria: [createEmptyCriteria(nextId('crit'))],
    })
  }

  const addFilter = (exceptionId) => {
    patchException(exceptionId, {
      filters: [
        ...(exceptionsRef.current.find((e) => e.id === exceptionId)?.filters ?? []),
        createEmptyFilter(nextId('filter')),
      ],
    })
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

  const clearAllFilters = (exceptionId) => {
    setOpenPopover(null)
    patchException(exceptionId, { filters: [] })
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

  const addCriteria = (exceptionId) => {
    setExceptions((prev) =>
      prev.map((e) =>
        e.id === exceptionId
          ? { ...e, criteria: [...e.criteria, createEmptyCriteria(nextId('crit'))] }
          : e
      )
    )
  }

  const removeCriteria = (exceptionId, criteriaRowId) => {
    setExceptions((prev) =>
      prev.map((e) => {
        if (e.id !== exceptionId) return e
        const filtered = e.criteria.filter((c) => c.id !== criteriaRowId)
        if (filtered.length === 0) {
          return { ...e, criteria: [createEmptyCriteria(nextId('crit'))] }
        }
        return { ...e, criteria: filtered }
      })
    )
  }

  const patchCriteria = (exceptionId, criteriaRowId, partial) => {
    setExceptions((prev) =>
      prev.map((e) =>
        e.id === exceptionId
          ? {
              ...e,
              criteria: e.criteria.map((c) => (c.id === criteriaRowId ? { ...c, ...partial } : c)),
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
    const criteriaParts = (exc.criteria || []).map(buildCriteriaSummaryPart).filter(Boolean)
    const parts = [...filterParts, ...criteriaParts]
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
        const filterGroups = getFilterFieldGroups(exc.granularity)

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
              <div className="flex flex-col border-t border-[#e5e7eb] px-4 pb-4 pt-0">
                {/* Granularity */}
                <div className="mt-4 flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-[#4b535c]">Granularity</label>
                  <div className="relative w-full max-w-[320px]">
                    <select
                      value={exc.granularity || ''}
                      onChange={(e) => onGranularityChange(exc.id, e.target.value)}
                      className="h-9 w-full appearance-none rounded-[4px] border border-[#e9eaeb] bg-white py-0 pl-3 pr-9 text-[13px] text-[#0a0a0a]"
                    >
                      <option value="">Select granularity…</option>
                      {GRANULARITIES.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#4b535c]">
                      <IconChevronDownSelect />
                    </span>
                  </div>
                </div>

                {/* Filters — hidden until granularity picked */}
                {granularityPicked && (
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="text-[12px] font-medium uppercase tracking-[0.04em] text-[#0a0a0a]">
                        Filters
                      </h4>
                      <span className="text-[11px] text-[#9ca3af]">Optional · joined with AND</span>
                    </div>

                    <div className="flex flex-col">
                      {(exc.filters || []).map((filter, filterIdx) => {
                        const fieldDef = getFilterFieldDef(exc.granularity, filter.fieldId)
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
                          <div key={filter.id} className="w-full">
                            {filterIdx > 0 && <AndConnector />}
                            <div className="rounded-[4px] border border-[#e5e7eb] bg-[#fafafa] px-3 py-2">
                              <div className="flex min-w-0 flex-wrap items-center gap-2">
                                <div className="relative shrink-0">
                                  <select
                                    value={filter.fieldId || ''}
                                    onChange={(e) =>
                                      patchFilter(exc.id, filter.id, {
                                        fieldId: e.target.value,
                                        operator: '',
                                        values: [],
                                      })
                                    }
                                    className="h-9 w-[200px] appearance-none rounded-[4px] border border-[#e9eaeb] bg-white py-0 pl-3 pr-9 text-[13px] text-[#0a0a0a]"
                                  >
                                    <option value="">Select filter…</option>
                                    {filterGroups.map((group) => (
                                      <optgroup key={group.id} label={group.label}>
                                        {group.fields.map((f) => (
                                          <option key={f.id} value={f.id}>
                                            {f.label}
                                          </option>
                                        ))}
                                      </optgroup>
                                    ))}
                                  </select>
                                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#4b535c]">
                                    <IconChevronDownSelect />
                                  </span>
                                </div>

                                <div className="relative shrink-0">
                                  <select
                                    value={filter.operator || ''}
                                    disabled={!fieldPicked}
                                    onChange={(e) =>
                                      patchFilter(exc.id, filter.id, {
                                        operator: e.target.value,
                                        values: [],
                                      })
                                    }
                                    className="h-9 w-[150px] appearance-none rounded-[4px] border border-[#e9eaeb] bg-white py-0 pl-3 pr-9 text-[13px] text-[#0a0a0a] disabled:cursor-not-allowed disabled:bg-[#f3f4f6] disabled:text-[#9ca3af]"
                                  >
                                    <option value="">Select condition</option>
                                    {ENUM_OPERATORS.map((op) => (
                                      <option key={op.value} value={op.value}>
                                        {op.label}
                                      </option>
                                    ))}
                                  </select>
                                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#4b535c]">
                                    <IconChevronDownSelect />
                                  </span>
                                </div>

                                {!fieldPicked || !operatorPicked ? (
                                  <div
                                    className="flex h-9 max-w-[280px] min-w-[120px] flex-1 cursor-not-allowed items-center rounded-[4px] border border-[#e9eaeb] bg-[#f3f4f6] px-3 text-[13px] italic text-[#9ca3af]"
                                    aria-disabled
                                  >
                                    Select value…
                                  </div>
                                ) : multi ? (
                                  <div className="relative max-w-[280px] min-w-[120px] flex-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setOpenPopover((prev) =>
                                          prev === popoverId ? null : popoverId
                                        )
                                      }
                                      className={`min-h-9 w-full truncate rounded-[4px] border border-[#e9eaeb] bg-white px-2 text-left text-[13px] hover:bg-[#f9fafb] ${
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
                                  </div>
                                ) : (
                                  <div className="relative max-w-[280px] min-w-[120px] flex-1">
                                    <select
                                      value={singleValue}
                                      onChange={(e) =>
                                        patchFilter(exc.id, filter.id, {
                                          values: e.target.value ? [e.target.value] : [],
                                        })
                                      }
                                      className="h-9 w-full appearance-none rounded-[4px] border border-[#e9eaeb] bg-white py-0 pl-3 pr-9 text-[13px] text-[#0a0a0a]"
                                    >
                                      <option value="">Select value…</option>
                                      {options.map((name) => (
                                        <option key={name} value={name}>
                                          {name}
                                        </option>
                                      ))}
                                    </select>
                                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#4b535c]">
                                      <IconChevronDownSelect />
                                    </span>
                                  </div>
                                )}

                                <button
                                  type="button"
                                  className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] text-[#4b535c] hover:bg-[#e5e7eb] hover:text-[#0a0a0a]"
                                  aria-label="Remove filter"
                                  onClick={() => removeFilter(exc.id, filter.id)}
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
                      onClick={() => addFilter(exc.id)}
                      className="mt-1 self-start text-[13px] font-medium text-[#0267FF] hover:underline"
                    >
                      + Add filter
                    </button>
                    {(exc.filters || []).length > 0 && (
                      <button
                        type="button"
                        onClick={() => clearAllFilters(exc.id)}
                        className="self-start text-[13px] font-medium text-[#4b535c] hover:text-[#0a0a0a] hover:underline"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                )}

                {/* Criteria — always shown; disabled until granularity picked */}
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="text-[12px] font-medium uppercase tracking-[0.04em] text-[#0a0a0a]">
                      Criteria
                    </h4>
                    <span className="text-[11px] text-[#9ca3af]">Required · joined with AND</span>
                  </div>

                  <div className="flex flex-col">
                    {(exc.criteria || []).map((crit, critIdx) => {
                      const criteriaDef = getCriteriaDef(crit.criteriaId)
                      const criteriaPicked = Boolean(crit.criteriaId)
                      const operatorPicked = Boolean(crit.operator)
                      const hasUnit = Boolean(criteriaDef?.hasUnit)

                      return (
                        <div key={crit.id} className="w-full">
                          {critIdx > 0 && <AndConnector />}
                          <div className="rounded-[4px] border border-[#e5e7eb] bg-[#fafafa] px-3 py-2">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <div className="relative shrink-0">
                                <select
                                  value={crit.criteriaId || ''}
                                  disabled={!granularityPicked}
                                  onChange={(e) => {
                                    const selectedCriteriaId = e.target.value
                                    const nextDef = getCriteriaDef(selectedCriteriaId)
                                    patchCriteria(exc.id, crit.id, {
                                      criteriaId: selectedCriteriaId,
                                      operator: '',
                                      value: '',
                                      unit: nextDef?.hasUnit ? 'weeks' : 'weeks',
                                    })
                                  }}
                                  className="h-9 w-[240px] appearance-none rounded-[4px] border border-[#e9eaeb] bg-white py-0 pl-3 pr-9 text-[13px] text-[#0a0a0a] disabled:cursor-not-allowed disabled:bg-[#f3f4f6] disabled:text-[#9ca3af]"
                                >
                                  <option value="">Select criteria…</option>
                                  {CRITERIA_DEFS.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.label}
                                    </option>
                                  ))}
                                </select>
                                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#4b535c]">
                                  <IconChevronDownSelect />
                                </span>
                              </div>

                              <div className="relative shrink-0">
                                <select
                                  value={crit.operator || ''}
                                  disabled={!criteriaPicked}
                                  onChange={(e) =>
                                    patchCriteria(exc.id, crit.id, { operator: e.target.value })
                                  }
                                  className="h-9 w-[180px] appearance-none rounded-[4px] border border-[#e9eaeb] bg-white py-0 pl-3 pr-9 text-[13px] text-[#0a0a0a] disabled:cursor-not-allowed disabled:bg-[#f3f4f6] disabled:text-[#9ca3af]"
                                >
                                  <option value="">Select condition</option>
                                  {NUMERIC_OPERATORS.map((op) => (
                                    <option key={op} value={op}>
                                      {op}
                                    </option>
                                  ))}
                                </select>
                                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#4b535c]">
                                  <IconChevronDownSelect />
                                </span>
                              </div>

                              {!criteriaPicked || !operatorPicked ? (
                                <div
                                  className="flex h-9 max-w-[160px] min-w-[100px] flex-1 cursor-not-allowed items-center rounded-[4px] border border-[#e9eaeb] bg-[#f3f4f6] px-3 text-[13px] italic text-[#9ca3af]"
                                  aria-disabled
                                >
                                  Value
                                </div>
                              ) : (
                                <input
                                  type="number"
                                  value={crit.value ?? ''}
                                  onChange={(e) =>
                                    patchCriteria(exc.id, crit.id, { value: e.target.value })
                                  }
                                  placeholder="Value"
                                  className="h-9 w-[100px] shrink-0 rounded-[4px] border border-[#e9eaeb] bg-white px-3 text-[13px] text-[#0a0a0a] placeholder:text-[#9ca3af] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                              )}

                              {criteriaPicked && operatorPicked && hasUnit && (
                                <div className="relative shrink-0">
                                  <select
                                    value={crit.unit || 'weeks'}
                                    onChange={(e) =>
                                      patchCriteria(exc.id, crit.id, { unit: e.target.value })
                                    }
                                    className="h-9 w-[100px] appearance-none rounded-[4px] border border-[#e9eaeb] bg-white py-0 pl-3 pr-9 text-[13px] text-[#0a0a0a]"
                                  >
                                    {COVERAGE_UNITS.map((u) => (
                                      <option key={u.value} value={u.value}>
                                        {u.label}
                                      </option>
                                    ))}
                                  </select>
                                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#4b535c]">
                                    <IconChevronDownSelect />
                                  </span>
                                </div>
                              )}

                              <button
                                type="button"
                                className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] text-[#4b535c] hover:bg-[#e5e7eb] hover:text-[#0a0a0a]"
                                aria-label="Remove criteria"
                                onClick={() => removeCriteria(exc.id, crit.id)}
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
                    onClick={() => addCriteria(exc.id)}
                    disabled={!granularityPicked}
                    className="mt-1 self-start text-[13px] font-medium text-[#0267FF] hover:underline disabled:cursor-not-allowed disabled:text-[#9ca3af] disabled:no-underline"
                  >
                    + Add criteria
                  </button>
                </div>
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
