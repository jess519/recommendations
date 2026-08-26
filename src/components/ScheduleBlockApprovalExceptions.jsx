import { useState, useEffect, useRef } from 'react'
import { IconClose, IconChevronDown, IconChevronDownSelect, IconSearch } from './icons'

const ENUM_OPERATORS = [
  { value: 'is', label: 'is', multi: false },
  { value: 'is not', label: 'is not', multi: false },
  { value: 'is one of', label: 'is one of', multi: true },
  { value: 'is not one of', label: 'is not one of', multi: true },
]

const GENERIC_MOCK_OPTIONS = ['Option A', 'Option B', 'Option C', 'Option D']

/** Product group fields — active in commit 1. Labels are customer-facing and must match exactly. */
const PRODUCT_FIELDS = [
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
  { id: 'size', label: 'Size', options: ['XS', 'S', 'M', 'L', 'XL'] },
  { id: 'articles', label: 'Articles', options: ['ART-001', 'ART-002', 'ART-003', 'ART-004', 'ART-005'] },
  { id: 'brand', label: 'Brand', options: ['Brand A', 'Brand B', 'Brand C'] },
  { id: 'manufacturer', label: 'Manufacturer', options: GENERIC_MOCK_OPTIONS },
  { id: 'collectionTypes', label: 'Collection types', options: ['Permanent', 'Seasonal', 'Limited edition', 'Capsule'] },
]

/** Shared location enum options — used by both Sending and Receiving (independent field ids). */
const LOCATION_FIELD_DEFS = [
  {
    key: 'location',
    label: 'Location',
    options: ['Paris Nord', 'Milan Duomo', 'Berlin Mitte', 'London Oxford St', 'Madrid Sol'],
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

/** Prefix field ids so Sending vs Receiving rows never collide in the picker or lookups. */
function makeLocationFields(prefix) {
  return LOCATION_FIELD_DEFS.map((f) => ({
    id: `${prefix}__${f.key}`,
    label: f.label,
    options: f.options,
  }))
}

const SENDING_LOCATION_FIELDS = makeLocationFields('sending')
const RECEIVING_LOCATION_FIELDS = makeLocationFields('receiving')

/**
 * Field picker groups. Product + Sending/Receiving location active;
 * Product data and Recommendation remain disabled placeholders.
 */
const FIELD_GROUPS = [
  { id: 'product', label: 'PRODUCT', enabled: true, fields: PRODUCT_FIELDS },
  { id: 'sending_location', label: 'SENDING LOCATION', enabled: true, fields: SENDING_LOCATION_FIELDS },
  { id: 'receiving_location', label: 'RECEIVING LOCATION', enabled: true, fields: RECEIVING_LOCATION_FIELDS },
  { id: 'product_data', label: 'PRODUCT DATA', enabled: false, fields: [] },
  { id: 'recommendation', label: 'RECOMMENDATION', enabled: false, fields: [] },
]

function getFieldDef(fieldId) {
  if (!fieldId) return null
  for (const group of FIELD_GROUPS) {
    const found = group.fields.find((f) => f.id === fieldId)
    if (found) return found
  }
  return null
}

function getOperatorDef(operator) {
  return ENUM_OPERATORS.find((o) => o.value === operator) ?? null
}

function isMultiOperator(operator) {
  return Boolean(getOperatorDef(operator)?.multi)
}

/** Closed-row summary for multi-select value trigger. */
function getValuesTriggerDisplay(values) {
  const v = Array.isArray(values) ? values : []
  if (v.length === 0) return { text: 'Click to select...', isPlaceholder: true }
  if (v.length === 1) return { text: v[0], isPlaceholder: false }
  if (v.length === 2) return { text: `${v[0]}, ${v[1]}`, isPlaceholder: false }
  return { text: `${v.length} values selected`, isPlaceholder: false }
}

/** Collapsed header readback for a single row (same pattern as before: field + operator + values). */
function buildExceptionRowSummaryPart(row) {
  const field = getFieldDef(row.fieldId)
  if (!field || !row.operator) return null
  const vals = Array.isArray(row.values) ? row.values.filter(Boolean) : []
  if (vals.length === 0) return null
  if (isMultiOperator(row.operator)) {
    if (vals.length === 1) return `${field.label} ${row.operator} ${vals[0]}`
    if (vals.length <= 3) return `${field.label} ${row.operator} ${vals.join(', ')}`
    return `${field.label} ${row.operator} ${vals.length} values`
  }
  return `${field.label} ${row.operator} ${vals[0]}`
}

function truncateExceptionTitleDisplay(str, maxLen = 100) {
  if (str.length <= maxLen) return str
  const ellipsis = '...'
  return str.slice(0, Math.max(0, maxLen - ellipsis.length)) + ellipsis
}

function createEmptyExceptionRow(id) {
  return {
    id,
    fieldId: '',
    operator: '',
    values: [],
  }
}

function createEmptyException(id, rowId) {
  return {
    id,
    expanded: true,
    rows: [createEmptyExceptionRow(rowId)],
  }
}

/** Schedule / ad-hoc creation loads with zero exceptions. */
export function createDefaultScheduleExceptions() {
  return []
}

function nextId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function isNewShapeException(exc) {
  return Array.isArray(exc?.rows)
}

export function ScheduleBlockApprovalExceptions({ block, onUpdate }) {
  const [openPopover, setOpenPopover] = useState(null)
  const [scopePopoverSearch, setScopePopoverSearch] = useState('')

  useEffect(() => {
    setScopePopoverSearch('')
  }, [openPopover])

  // Migrate legacy applyAt/conditions shape → empty list (wipe mock data).
  useEffect(() => {
    const raw = block.exceptions ?? []
    if (raw.length > 0 && !isNewShapeException(raw[0])) {
      onUpdate({ exceptions: [] })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const rawExceptions = Array.isArray(block.exceptions) ? block.exceptions : []
  const exceptions =
    rawExceptions.length > 0 && !isNewShapeException(rawExceptions[0]) ? [] : rawExceptions

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
    const rowId = nextId('row')
    setExceptions((prev) => {
      const withExpandedFalse = prev.map((e) => ({ ...e, expanded: false }))
      return [...withExpandedFalse, createEmptyException(excId, rowId)]
    })
  }

  const addRowToException = (exceptionId) => {
    const newId = nextId('row')
    setExceptions((prev) =>
      prev.map((e) =>
        e.id === exceptionId ? { ...e, rows: [...e.rows, createEmptyExceptionRow(newId)] } : e
      )
    )
  }

  const removeRowFromException = (exceptionId, rowId) => {
    const freshId = nextId('row')
    setExceptions((prev) =>
      prev.map((e) => {
        if (e.id !== exceptionId) return e
        const filtered = e.rows.filter((r) => r.id !== rowId)
        if (filtered.length === 0) {
          return { ...e, rows: [createEmptyExceptionRow(freshId)] }
        }
        return { ...e, rows: filtered }
      })
    )
  }

  const patchRow = (exceptionId, rowId, partial) => {
    setExceptions((prev) =>
      prev.map((e) =>
        e.id === exceptionId
          ? {
              ...e,
              rows: e.rows.map((r) => (r.id === rowId ? { ...r, ...partial } : r)),
            }
          : e
      )
    )
  }

  const onFieldSelectChange = (exceptionId, rowId, fieldId) => {
    patchRow(exceptionId, rowId, {
      fieldId,
      operator: '',
      values: [],
    })
    setOpenPopover(null)
  }

  const onOperatorSelectChange = (exceptionId, rowId, operator) => {
    patchRow(exceptionId, rowId, {
      operator,
      values: [],
    })
    setOpenPopover(null)
  }

  const clearAllRowsForException = (exceptionId) => {
    const freshId = nextId('row')
    setOpenPopover(null)
    setExceptions((prev) =>
      prev.map((e) => (e.id === exceptionId ? { ...e, rows: [createEmptyExceptionRow(freshId)] } : e))
    )
  }

  const getExceptionDisplayName = (exc, excIdx) => {
    const n = excIdx + 1
    const prefix = `Exception ${n}`
    const parts = (exc.rows || []).map(buildExceptionRowSummaryPart).filter(Boolean)
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
                  {(exc.rows || []).map((row, rowIdx) => {
                    const fieldDef = getFieldDef(row.fieldId)
                    const fieldPicked = Boolean(row.fieldId)
                    const operatorPicked = Boolean(row.operator)
                    const multi = isMultiOperator(row.operator)
                    const options = fieldDef?.options ?? []
                    const selectedVals = Array.isArray(row.values) ? row.values : []
                    const singleValue = selectedVals[0] ?? ''
                    const popoverId = `${exc.id}__${row.id}`
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
                      <div key={row.id} className="w-full">
                        {rowIdx > 0 && (
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
                        )}
                        <div className="rounded-[4px] border border-[#e5e7eb] bg-[#fafafa] px-3 py-2">
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <div className="relative shrink-0">
                              <select
                                value={row.fieldId || ''}
                                onChange={(e) => onFieldSelectChange(exc.id, row.id, e.target.value)}
                                className="h-9 w-[200px] appearance-none rounded-[4px] border border-[#e9eaeb] bg-white py-0 pl-3 pr-9 text-[13px] text-[#0a0a0a]"
                              >
                                <option value="">Select filter…</option>
                                {FIELD_GROUPS.map((group) =>
                                  group.enabled ? (
                                    <optgroup key={group.id} label={group.label}>
                                      {group.fields.map((f) => (
                                        <option key={f.id} value={f.id}>
                                          {f.label}
                                        </option>
                                      ))}
                                    </optgroup>
                                  ) : (
                                    <optgroup key={group.id} label={group.label} disabled>
                                      <option disabled value="">
                                        Coming in next commit
                                      </option>
                                    </optgroup>
                                  )
                                )}
                              </select>
                              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#4b535c]">
                                <IconChevronDownSelect />
                              </span>
                            </div>

                            <div className="relative shrink-0">
                              <select
                                value={row.operator || ''}
                                disabled={!fieldPicked}
                                onChange={(e) => onOperatorSelectChange(exc.id, row.id, e.target.value)}
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
                                className="h-9 min-w-[120px] flex-1 max-w-[280px] rounded-[4px] border border-[#e9eaeb] bg-[#f3f4f6] px-3 text-[13px] italic text-[#9ca3af] flex items-center cursor-not-allowed"
                                aria-disabled
                              >
                                Select value…
                              </div>
                            ) : multi ? (
                              <div className="relative flex-1 min-w-[120px] max-w-[280px]">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenPopover((prev) => (prev === popoverId ? null : popoverId))
                                  }
                                  className={`w-full min-h-9 px-2 rounded-[4px] border border-[#e9eaeb] bg-white text-left text-[13px] hover:bg-[#f9fafb] truncate ${
                                    valuesTrigger.isPlaceholder
                                      ? 'text-[#9ca3af] italic'
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
                                            patchRow(exc.id, row.id, {
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
                                                patchRow(exc.id, row.id, { values: next })
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
                              <div className="relative flex-1 min-w-[120px] max-w-[280px]">
                                <select
                                  value={singleValue}
                                  onChange={(e) =>
                                    patchRow(exc.id, row.id, {
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
                              aria-label="Remove row"
                              onClick={() => {
                                removeRowFromException(exc.id, row.id)
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
                  onClick={() => addRowToException(exc.id)}
                  className="mt-2 self-start text-[13px] font-medium text-[#0267FF] hover:underline"
                >
                  + Add row
                </button>
                <button
                  type="button"
                  onClick={() => clearAllRowsForException(exc.id)}
                  className="mt-1 self-start text-[13px] font-medium text-[#4b535c] hover:text-[#0a0a0a] hover:underline"
                >
                  Clear all
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
