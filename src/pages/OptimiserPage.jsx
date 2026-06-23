import { useState, useRef, useEffect, Fragment } from 'react'
import { Truck, Network, TrendingUp, ShieldCheck, Pencil, Check, Plus } from 'lucide-react'
import { IconCalendarSidebar, IconPlus, IconReplenishment, IconReorder, IconRebalancing, IconChevronDown, IconList, IconCalendarNote, IconTruck, IconTrendUp, IconLightbulb, IconEdit, IconClose, IconChevronDownSelect, IconArrowLeft } from '../components/icons'
import {
  ScheduleBlockApprovalExceptions,
  createDefaultScheduleExceptions,
} from '../components/ScheduleBlockApprovalExceptions'

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

/** Create schedule — scope filter dummy options (prototype display only) */
const SCOPE_DEPARTMENT_OPTIONS = ['Apparel', 'Footwear', 'Accessories']
const SCOPE_LOCATION_TYPE_OPTIONS = ['Store', 'Warehouse', 'Outlet']
const SCOPE_WAREHOUSE_OPTIONS = ['Europe warehouse', 'US main warehouse', 'Global central warehouse', 'Supplier']
const SCOPE_SEASONS_OPTIONS = ['SS24', 'AW24', 'SS25', 'AW25', 'Cruise 25', 'Pre-Fall 25']
const SCOPE_LOCATIONS_OPTIONS = ['Paris flagship', 'London Regent St', 'NY Soho', 'Milan Duomo', 'Berlin Mitte', 'Tokyo Ginza']
const SCOPE_PRODUCTS_OPTIONS = ['SKU-001 Wool Coat', 'SKU-002 Silk Scarf', 'SKU-003 Leather Bag', 'SKU-004 Cotton Tee', 'SKU-005 Denim Jacket']

const SCOPE_EXPANDED_FIELD_KEYS = [
  'brands',
  'classes',
  'collectionTypes',
  'colors',
  'events',
  'genders',
  'manufacturers',
  'materials',
  'productGroups',
  'sizeRuns',
  'sizes',
  'skus',
  'styles',
  'subClasses',
  'subDepartments',
  'countries',
  'locationClusters',
  'locationGroups',
  'regions',
]

const SCOPE_EXPANDED_PRODUCT_FIELDS = [
  { key: 'brands', label: 'Brands' },
  { key: 'classes', label: 'Classes' },
  { key: 'collectionTypes', label: 'Collection types' },
  { key: 'colors', label: 'Colors' },
  { key: 'events', label: 'Events' },
  { key: 'genders', label: 'Genders' },
  { key: 'manufacturers', label: 'Manufacturers' },
  { key: 'materials', label: 'Materials' },
  { key: 'productGroups', label: 'Product groups' },
  { key: 'sizeRuns', label: 'Size runs' },
  { key: 'sizes', label: 'Sizes' },
  { key: 'skus', label: 'SKUs' },
  { key: 'styles', label: 'Styles' },
  { key: 'subClasses', label: 'Sub-classes' },
  { key: 'subDepartments', label: 'Sub-departments' },
]

const SCOPE_EXPANDED_LOCATION_FIELDS = [
  { key: 'countries', label: 'Countries' },
  { key: 'locationClusters', label: 'Location clusters' },
  { key: 'locationGroups', label: 'Location groups' },
  { key: 'regions', label: 'Regions' },
]

function createInitialExpandedFieldState() {
  return Object.fromEntries(
    SCOPE_EXPANDED_FIELD_KEYS.map((key) => [key, { include: [], exclude: [], mode: 'include' }])
  )
}

function getScopeExcludeChipText(excludeValues) {
  if (excludeValues.length === 0) return ''
  if (excludeValues.length === 1) return `All except: ${excludeValues[0]}`
  if (excludeValues.length === 2) return `All except: ${excludeValues[0]}, ${excludeValues[1]}`
  return `All except: ${excludeValues[0]}, ${excludeValues[1]}, +${excludeValues.length - 2} more`
}

function ActiveFilterChips({ entries }) {
  const hasAny = entries.some((e) => e.includeValues.length > 0 || e.excludeValues.length > 0)
  if (!hasAny) return null

  return (
    <div className="flex w-full flex-wrap gap-2 py-3">
      {entries.map((entry) => (
        <Fragment key={entry.fieldKey}>
          {entry.includeValues.length >= 1 && (
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[13px] font-medium text-[#1d4ed8]">
              <span>{`${entry.label}: ${entry.includeValues.length} selected`}</span>
              <button
                type="button"
                onClick={entry.onClearInclude}
                aria-label={`Clear ${entry.label} includes`}
                className="shrink-0 flex items-center justify-center text-[#1d4ed8] hover:text-[#1e40af]"
              >
                <IconClose className="size-3.5" />
              </button>
            </span>
          )}
          {entry.excludeValues.length >= 1 && (
            <span className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-[13px] font-medium text-[#b91c1c]">
              <span>{`${entry.label}: ${getScopeExcludeChipText(entry.excludeValues)}`}</span>
              <button
                type="button"
                onClick={entry.onClearExclude}
                aria-label={`Clear ${entry.label} excludes`}
                className="shrink-0 flex items-center justify-center text-[#b91c1c] hover:text-[#991b1b]"
              >
                <IconClose className="size-3.5" />
              </button>
            </span>
          )}
        </Fragment>
      ))}
    </div>
  )
}

const scopeModeToggleButtonClass = (active) =>
  active
    ? 'h-7 rounded-[4px] px-3 text-[13px] font-medium bg-[#1d4ed8] text-white'
    : 'h-7 rounded-[4px] px-3 text-[13px] font-medium bg-white text-[#0a0a0a] border border-[#E9EAEB]'

function ScopeBulkAddButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-7 shrink-0 rounded-[4px] px-2 text-[13px] font-medium text-[#1d4ed8] hover:underline"
    >
      + bulk
    </button>
  )
}

function ScopeBulkPasteModal({ open, fieldLabel, onClose }) {
  const titleId = 'scope-bulk-paste-modal-title'

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        className="relative z-[1] flex w-full max-w-[560px] flex-col overflow-hidden rounded-[6px] bg-white shadow-[0px_8px_25px_0px_rgba(0,0,0,0.1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center gap-4 border-b border-[#e9eaeb] p-4">
          <h2 id={titleId} className="min-h-8 flex-1 text-lg font-medium leading-normal text-[#0a0a0a]">
            {fieldLabel} — Add values in bulk
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-[4px] text-[#0a0a0a] hover:bg-[#f3f4f6]"
            aria-label="Close"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-col gap-4 px-4 py-6">
          <textarea
            rows={8}
            placeholder="Type or paste values here"
            className="w-full min-h-[160px] resize-y rounded-[4px] border border-[#e9eaeb] bg-white px-3 py-2.5 text-[14px] text-[#0a0a0a] placeholder:text-[#9ca3af] focus:border-[#1d4ed8] focus:outline-none"
          />
          <p className="text-[13px] leading-normal text-[#4b535c]">
            Separate multiple values with a comma (,) or a semicolon (;) or by putting them on separate
            lines. Use (\) to escape any of the separators.
          </p>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[#e9eaeb] p-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-[4px] border border-[#E9EAEB] bg-white px-4 text-[14px] font-medium text-[#0a0a0a] hover:bg-[#f8f8f8]"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-[4px] bg-[#1d4ed8] px-4 text-[14px] font-medium text-white hover:bg-[#1e40af]"
          >
            Add values
          </button>
        </div>
      </div>
    </div>
  )
}

function CreateScheduleScopeMultiSelect({
  label,
  helperText,
  placeholder = 'Select',
  options = [],
  includeValues,
  onIncludeChange,
  excludeValues,
  onExcludeChange,
  mode,
  onModeChange,
  hideHeader = false,
  hideModeToggle = false,
  showSelectAll = false,
  showSelectedLabels = false,
  showBulkAdd = false,
  onBulkAddClick,
}) {
  const [open, setOpen] = useState(false)

  const activeValues = hideModeToggle
    ? includeValues
    : mode === 'include'
      ? includeValues
      : excludeValues
  const oppositeValues = hideModeToggle ? [] : mode === 'include' ? excludeValues : includeValues
  const allSelected = options.length > 0 && includeValues.length === options.length

  const toggleOption = (opt) => {
    if (!hideModeToggle && oppositeValues.includes(opt)) return

    if (hideModeToggle || mode === 'include') {
      onIncludeChange(
        includeValues.includes(opt) ? includeValues.filter((v) => v !== opt) : [...includeValues, opt]
      )
      return
    }
    onExcludeChange(
      excludeValues.includes(opt) ? excludeValues.filter((v) => v !== opt) : [...excludeValues, opt]
    )
  }

  const toggleSelectAll = () => {
    if (allSelected) {
      onIncludeChange([])
      return
    }
    onIncludeChange(options)
  }

  const hasSelections = hideModeToggle
    ? includeValues.length > 0
    : includeValues.length > 0 || excludeValues.length > 0

  return (
    <div className="flex flex-col gap-1.5">
      {!hideHeader && (
        <div className={`flex min-h-7 items-center gap-2 ${hideModeToggle ? '' : 'justify-between'}`}>
          <label className="text-[14px] font-normal text-[#000000] opacity-[0.67]">{label}</label>
          {!hideModeToggle && (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => onModeChange('include')}
                className={scopeModeToggleButtonClass(mode === 'include')}
              >
                Include
              </button>
              <button
                type="button"
                onClick={() => onModeChange('exclude')}
                className={scopeModeToggleButtonClass(mode === 'exclude')}
              >
                Exclude
              </button>
              {showBulkAdd && onBulkAddClick && (
                <ScopeBulkAddButton onClick={onBulkAddClick} />
              )}
            </div>
          )}
        </div>
      )}
      <div>
        <div className="relative">
          <div
            role="combobox"
            aria-expanded={open}
            tabIndex={0}
            onClick={() => setOpen((o) => !o)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setOpen((o) => !o)
              }
            }}
            className={`flex h-14 min-h-14 max-h-14 w-full shrink-0 cursor-pointer items-center gap-2 overflow-hidden rounded-[4px] border border-[#EAEAEA] bg-white pl-4 text-left text-[16px] text-[#0a0a0a] min-w-0 ${
              showSelectedLabels && includeValues.length >= 1 ? 'pr-16' : 'pr-10'
            }`}
          >
          {!hasSelections ? (
            <span className="min-w-0 flex-1 truncate text-left text-[#4b535c]">{placeholder}</span>
          ) : showSelectedLabels && includeValues.length >= 1 ? (
            <>
              <span className="min-w-0 flex-1 truncate text-left text-[14px] text-[#0a0a0a]">
                {includeValues.join(', ')}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onIncludeChange([])
                }}
                aria-label="Clear included selections"
                className="shrink-0 flex items-center justify-center text-[#1d4ed8] hover:text-[#1e40af] p-0.5"
              >
                <IconClose className="size-3.5" />
              </button>
            </>
          ) : (
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
              {includeValues.length >= 1 && (
                <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[13px] font-medium text-[#1d4ed8] shrink-0">
                  <span className="truncate">{`${includeValues.length} selected`}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onIncludeChange([])
                    }}
                    aria-label="Clear included selections"
                    className="shrink-0 flex items-center justify-center text-[#1d4ed8] hover:text-[#1e40af] p-0.5"
                  >
                    <IconClose className="size-3.5" />
                  </button>
                </span>
              )}
              {!hideModeToggle && excludeValues.length >= 1 && (
                <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[13px] font-medium text-[#b91c1c] shrink-0">
                  <span className="truncate">{getScopeExcludeChipText(excludeValues)}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onExcludeChange([])
                    }}
                    aria-label="Clear excluded selections"
                    className="shrink-0 flex items-center justify-center text-[#b91c1c] hover:text-[#991b1b] p-0.5"
                  >
                    <IconClose className="size-3.5" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4b535c] pointer-events-none">
          <IconChevronDownSelect />
        </span>
        {open && (
          <>
            <div
              role="presentation"
              className="fixed inset-0 z-[29]"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <div
              className="absolute left-0 right-0 top-full z-[30] mt-1 rounded-[4px] border border-[#EAEAEA] bg-white shadow-[0px_8px_25px_0px_rgba(0,0,0,0.12)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              role="presentation"
            >
              {showSelectAll && (
                <label className="px-4 py-3 flex items-center gap-3 text-[14px] text-[#0a0a0a] hover:bg-[#f8f8f8] cursor-pointer border-b border-[#e5e7eb]">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="size-4 rounded border-[#d1d5db] text-[#0267ff] focus:ring-[#0267ff] shrink-0"
                  />
                  <span>Select all</span>
                </label>
              )}
              {options.map((opt) => {
                const isLockedInOpposite = !hideModeToggle && oppositeValues.includes(opt)
                const lockAnnotation = mode === 'include' ? 'In Exclude' : 'In Include'

                return (
                <label
                  key={opt}
                  className={`px-4 py-3 flex items-center gap-3 text-[14px] text-[#0a0a0a] ${
                    isLockedInOpposite ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#f8f8f8] cursor-pointer'
                  }`}
                >
                  <input
                    type="checkbox"
                    disabled={isLockedInOpposite}
                    checked={activeValues.includes(opt)}
                    onChange={() => toggleOption(opt)}
                    className="size-4 rounded border-[#d1d5db] text-[#0267ff] focus:ring-[#0267ff] shrink-0 disabled:cursor-not-allowed"
                  />
                  <span>{opt}</span>
                  {isLockedInOpposite && (
                    <span className="text-[11px] text-[#4b535c] italic ml-2">{lockAnnotation}</span>
                  )}
                </label>
                )
              })}
            </div>
          </>
        )}
        </div>
        {helperText ? (
          <p className="mt-1.5 text-[12px] leading-[16px] text-[#4b535c]">{helperText}</p>
        ) : null}
      </div>
    </div>
  )
}

function CreateScheduleScopeSingleSelect({
  label,
  helperText,
  placeholder = 'Select',
  options = [],
  value,
  onChange,
}) {
  const [open, setOpen] = useState(false)
  const hasValue = value !== ''

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[14px] font-normal text-[#000000] opacity-[0.67]">{label}</label>
      <div>
        <div className="relative">
          <div
            role="combobox"
            aria-expanded={open}
            tabIndex={0}
            onClick={() => setOpen((o) => !o)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setOpen((o) => !o)
              }
            }}
            className="flex h-14 min-h-14 max-h-14 w-full shrink-0 cursor-pointer items-center gap-2 overflow-hidden rounded-[4px] border border-[#EAEAEA] bg-white pl-4 pr-10 text-left text-[16px] text-[#0a0a0a] min-w-0"
          >
            {!hasValue ? (
              <span className="min-w-0 flex-1 truncate text-left text-[#4b535c]">{placeholder}</span>
            ) : (
              <span className="min-w-0 flex-1 truncate text-left text-[#0a0a0a]">{value}</span>
            )}
          </div>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4b535c] pointer-events-none">
            <IconChevronDownSelect />
          </span>
          {open && (
            <>
              <div
                role="presentation"
                className="fixed inset-0 z-[29]"
                onClick={() => setOpen(false)}
                aria-hidden
              />
              <div
                className="absolute left-0 right-0 top-full z-[30] mt-1 rounded-[4px] border border-[#EAEAEA] bg-white shadow-[0px_8px_25px_0px_rgba(0,0,0,0.12)] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                role="listbox"
              >
                {options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    role="option"
                    aria-selected={value === opt}
                    onClick={() => {
                      onChange(opt)
                      setOpen(false)
                    }}
                    className={`w-full px-4 py-3 text-left text-[14px] text-[#0a0a0a] hover:bg-[#f8f8f8] cursor-pointer ${
                      value === opt ? 'bg-[#f0f6ff]' : ''
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        {helperText ? (
          <p className="mt-1.5 text-[12px] leading-[16px] text-[#4b535c]">{helperText}</p>
        ) : null}
      </div>
    </div>
  )
}

/** Product + geographic scope filters for create schedule scope selection. */
function CreateScheduleScopeFilterPanel({
  warehouseInclude,
  setWarehouseInclude,
  warehouseExclude,
  setWarehouseExclude,
  warehouseMode,
  setWarehouseMode,
  departmentInclude,
  setDepartmentInclude,
  departmentExclude,
  setDepartmentExclude,
  departmentMode,
  setDepartmentMode,
  seasonsInclude,
  setSeasonsInclude,
  seasonsExclude,
  setSeasonsExclude,
  seasonsMode,
  setSeasonsMode,
  productsInclude,
  setProductsInclude,
  productsExclude,
  setProductsExclude,
  productsMode,
  setProductsMode,
  locationTypesInclude,
  setLocationTypesInclude,
  locationTypesExclude,
  setLocationTypesExclude,
  locationTypesMode,
  setLocationTypesMode,
  locationsInclude,
  setLocationsInclude,
  locationsExclude,
  setLocationsExclude,
  locationsMode,
  setLocationsMode,
  extraVisibleFilters,
  expandedFieldState,
  updateExpandedField,
}) {
  const [bulkPasteFieldLabel, setBulkPasteFieldLabel] = useState(null)
  const openBulkPaste = (label) => setBulkPasteFieldLabel(label)
  const closeBulkPaste = () => setBulkPasteFieldLabel(null)

  const renderExtraField = ({ key, label }) => (
    <CreateScheduleScopeMultiSelect
      key={key}
      label={label}
      placeholder={`Select ${label.toLowerCase()}`}
      options={[]}
      includeValues={expandedFieldState[key].include}
      onIncludeChange={(next) => updateExpandedField(key, { include: next })}
      excludeValues={expandedFieldState[key].exclude}
      onExcludeChange={(next) => updateExpandedField(key, { exclude: next })}
      mode={expandedFieldState[key].mode}
      onModeChange={(next) => updateExpandedField(key, { mode: next })}
    />
  )

  const visibleProductExtras = SCOPE_EXPANDED_PRODUCT_FIELDS.filter(({ key }) =>
    extraVisibleFilters.includes(key)
  )
  const visibleLocationExtras = SCOPE_EXPANDED_LOCATION_FIELDS.filter(({ key }) =>
    extraVisibleFilters.includes(key)
  )

  return (
    <>
    <div className="rounded-[4px] border border-[#e5e7eb] bg-[#fafafa] p-4">
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        <h4 className="text-[13px] font-medium text-[#0a0a0a] uppercase tracking-[0.04em]">Product scope</h4>
        <h4 className="text-[13px] font-medium text-[#0a0a0a] uppercase tracking-[0.04em]">Geographic scope</h4>

        <div className="w-full self-start">
          <CreateScheduleScopeMultiSelect
            label="Departments"
            placeholder="Select departments"
            options={SCOPE_DEPARTMENT_OPTIONS}
            includeValues={departmentInclude}
            onIncludeChange={setDepartmentInclude}
            excludeValues={departmentExclude}
            onExcludeChange={setDepartmentExclude}
            mode={departmentMode}
            onModeChange={setDepartmentMode}
            showBulkAdd
            onBulkAddClick={() => openBulkPaste('Departments')}
          />
        </div>
        <div className="w-full self-start">
          <CreateScheduleScopeMultiSelect
            label="Warehouse"
            helperText="Where products are distributed from. If none selected, we'll use your full network."
            placeholder="Select warehouses"
            options={SCOPE_WAREHOUSE_OPTIONS}
            includeValues={warehouseInclude}
            onIncludeChange={setWarehouseInclude}
            excludeValues={warehouseExclude}
            onExcludeChange={setWarehouseExclude}
            mode={warehouseMode}
            onModeChange={setWarehouseMode}
            showBulkAdd
            onBulkAddClick={() => openBulkPaste('Warehouse')}
          />
        </div>

        <div className="w-full self-start">
          <CreateScheduleScopeMultiSelect
            label="Seasons"
            placeholder="Select seasons"
            options={SCOPE_SEASONS_OPTIONS}
            includeValues={seasonsInclude}
            onIncludeChange={setSeasonsInclude}
            excludeValues={seasonsExclude}
            onExcludeChange={setSeasonsExclude}
            mode={seasonsMode}
            onModeChange={setSeasonsMode}
            showBulkAdd
            onBulkAddClick={() => openBulkPaste('Seasons')}
          />
        </div>
        <div className="w-full self-start">
          <CreateScheduleScopeMultiSelect
            label="Location Types"
            placeholder="Select location types"
            options={SCOPE_LOCATION_TYPE_OPTIONS}
            includeValues={locationTypesInclude}
            onIncludeChange={setLocationTypesInclude}
            excludeValues={locationTypesExclude}
            onExcludeChange={setLocationTypesExclude}
            mode={locationTypesMode}
            onModeChange={setLocationTypesMode}
            showBulkAdd
            onBulkAddClick={() => openBulkPaste('Location Types')}
          />
        </div>

        <div className="flex w-full flex-col gap-1.5 self-start">
          <div className="flex min-h-7 items-center justify-between gap-2">
            <label className="text-[14px] font-normal text-[#000000] opacity-[0.67]">Products</label>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setProductsMode('include')}
                className={scopeModeToggleButtonClass(productsMode === 'include')}
              >
                Include
              </button>
              <button
                type="button"
                onClick={() => setProductsMode('exclude')}
                className={scopeModeToggleButtonClass(productsMode === 'exclude')}
              >
                Exclude
              </button>
              <ScopeBulkAddButton onClick={() => openBulkPaste('Products')} />
            </div>
          </div>
          <CreateScheduleScopeMultiSelect
            hideHeader
            label="Products"
            placeholder="Select products"
            options={SCOPE_PRODUCTS_OPTIONS}
            includeValues={productsInclude}
            onIncludeChange={setProductsInclude}
            excludeValues={productsExclude}
            onExcludeChange={setProductsExclude}
            mode={productsMode}
            onModeChange={setProductsMode}
          />
        </div>
        <div className="flex w-full flex-col gap-1.5 self-start">
          <div className="flex min-h-7 items-center justify-between gap-2">
            <label className="text-[14px] font-normal text-[#000000] opacity-[0.67]">Locations</label>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setLocationsMode('include')}
                className={scopeModeToggleButtonClass(locationsMode === 'include')}
              >
                Include
              </button>
              <button
                type="button"
                onClick={() => setLocationsMode('exclude')}
                className={scopeModeToggleButtonClass(locationsMode === 'exclude')}
              >
                Exclude
              </button>
              <ScopeBulkAddButton onClick={() => openBulkPaste('Locations')} />
            </div>
          </div>
          <CreateScheduleScopeMultiSelect
            hideHeader
            label="Locations"
            placeholder="Select locations"
            options={SCOPE_LOCATIONS_OPTIONS}
            includeValues={locationsInclude}
            onIncludeChange={setLocationsInclude}
            excludeValues={locationsExclude}
            onExcludeChange={setLocationsExclude}
            mode={locationsMode}
            onModeChange={setLocationsMode}
          />
        </div>
        {visibleProductExtras.map((field) => (
          <div key={field.key} className="col-start-1 w-full self-start">
            {renderExtraField(field)}
          </div>
        ))}
        {visibleLocationExtras.map((field) => (
          <div key={field.key} className="col-start-2 w-full self-start">
            {renderExtraField(field)}
          </div>
        ))}
      </div>
    </div>
    <ScopeBulkPasteModal
      open={bulkPasteFieldLabel != null}
      fieldLabel={bulkPasteFieldLabel ?? ''}
      onClose={closeBulkPaste}
    />
    </>
  )
}

function CreateScheduleMoreFiltersMenu({
  isOpen,
  onToggle,
  onClose,
  extraVisibleFilters,
  onToggleExtraFilter,
}) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  const renderSection = (title, fields) => (
    <div>
      <p className="px-4 py-2 text-[12px] font-medium uppercase tracking-[0.04em] text-[#4b535c]">{title}</p>
      {fields.map(({ key, label }) => {
        const isSelected = extraVisibleFilters.includes(key)
        return (
          <button
            key={key}
            type="button"
            onClick={() => onToggleExtraFilter(key)}
            className="flex w-full items-center justify-between px-4 py-2 text-left text-[14px] text-[#0a0a0a] hover:bg-[#f5f5f5]"
          >
            <span>{label}</span>
            {isSelected && <Check className="h-4 w-4 text-[#1d4ed8]" aria-hidden />}
          </button>
        )
      })}
    </div>
  )

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="mt-3 flex items-center gap-1 py-2 text-[14px] font-medium text-[#1d4ed8] hover:underline"
      >
        <Plus className="size-4 shrink-0" aria-hidden />
        More filters
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full z-30 mt-1 w-[280px] rounded-[4px] border border-[#e5e7eb] bg-white py-2 shadow-md">
          {renderSection('PRODUCTS', SCOPE_EXPANDED_PRODUCT_FIELDS)}
          {renderSection('LOCATIONS', SCOPE_EXPANDED_LOCATION_FIELDS)}
        </div>
      )}
    </div>
  )
}

const SUBMISSION_TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2)
  const m = (i % 2) * 30
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
})

const SUBMISSION_DAYS = [
  { key: 'sunday', letter: 'S' },
  { key: 'monday', letter: 'M' },
  { key: 'tuesday', letter: 'T' },
  { key: 'wednesday', letter: 'W' },
  { key: 'thursday', letter: 'T' },
  { key: 'friday', letter: 'F' },
  { key: 'saturday', letter: 'S' },
]

function formatRepeatUnitLabel(unit, count) {
  if (count === 1) return unit
  if (unit === 'day') return 'days'
  if (unit === 'week') return 'weeks'
  if (unit === 'month') return 'months'
  return unit
}

function capitalizeDay(day) {
  if (!day) return ''
  return day.charAt(0).toUpperCase() + day.slice(1)
}

function createDefaultScheduleBlock(id) {
  return {
    id,
    name: '',
    movementTypes: [],
    networkTag: '',
    tripCapacityTag: '',
    confidenceLevels: ['Very High', 'High', 'Medium', 'Low', 'Very Low'],
    aggressiveness: '',
    targetCoverageValue: '',
    targetCoverageUnit: 'Weeks',
    repeatEvery: 1,
    repeatEveryUnit: 'week',
    submissionDay: 'wednesday',
    submissionDate: '',
    submissionTime: '09:00',
    generationDay: 'wednesday',
    generationDate: '',
    generationTime: '09:00',
    skipEvery: '',
    skipEveryUnit: 'weeks',
    notifyUsers: '',
    approvalMode: 'auto-approve',
    exceptions: createDefaultScheduleExceptions(),
  }
}

function ScheduleDayOfWeekSelector({ value, onChange }) {
  return (
    <div className="flex gap-4">
      {SUBMISSION_DAYS.map(({ key, letter }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`flex size-10 shrink-0 items-center justify-center rounded-full text-[14px] font-medium transition-colors ${
            value === key ? 'bg-[#1d4ed8] text-white' : 'bg-[#F8F8F8] text-[#4b535c] hover:bg-[#eee]'
          }`}
        >
          {letter}
        </button>
      ))}
    </div>
  )
}

function ScheduleTimeSelect({ value, onChange }) {
  return (
    <div className="relative w-[110px] shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full appearance-none rounded-[4px] border border-[#E9EAEB] bg-white px-4 py-3 pr-10 text-[14px] text-[#0a0a0a]"
      >
        {SUBMISSION_TIME_OPTIONS.map((label) => (
          <option key={label} value={label}>
            {label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#4b535c]">
        <IconChevronDownSelect />
      </span>
    </div>
  )
}

function buildBlockSummary(block) {
  const segments = []
  const movementTypes = block.movementTypes ?? []
  const exceptions = block.exceptions ?? []

  if (movementTypes.length === 0) {
    segments.push('No movement type')
  } else if (movementTypes.length === 1) {
    segments.push(movementTypes[0])
  } else if (movementTypes.length === 2) {
    segments.push('Replenishment & Rebalancing')
  } else {
    segments.push(movementTypes.join(' & '))
  }

  const unit = formatRepeatUnitLabel(block.repeatEveryUnit, block.repeatEvery)
  segments.push(`every ${block.repeatEvery} ${unit}`)
  segments.push(`${capitalizeDay(block.submissionDay)} at ${block.submissionTime}`)

  if (block.approvalMode === 'manual-review') {
    segments.push('Manual review')
  } else if (exceptions.length === 0) {
    segments.push('Auto-approve')
  } else if (exceptions.length === 1) {
    segments.push('Auto-approve · 1 exception')
  } else {
    segments.push(`Auto-approve · ${exceptions.length} exceptions`)
  }

  return segments.join(' · ')
}

function ScheduleDetailsBlock({ block, index, isExpanded, onToggleExpand, onRemove, canRemove, onUpdate }) {
  const headerTitle = block.name.trim() ? block.name : `Untitled schedule ${index + 1}`

  return (
    <div className="rounded-[4px] border border-[#e5e7eb] bg-[#fafafa]">
      <div
        className={`flex justify-between px-4 ${
          isExpanded ? 'h-12 items-center border-b border-[#e5e7eb]' : 'h-auto items-center py-2'
        }`}
      >
        {isExpanded ? (
          <span className="truncate text-[15px] font-medium text-[#0a0a0a]">{headerTitle}</span>
        ) : (
          <div className="min-w-0 flex-1 pr-3">
            <div className="text-[15px] font-medium text-[#0a0a0a]">{headerTitle}</div>
            <p className="mt-0.5 text-[12px] text-[#4b535c]">{buildBlockSummary(block)}</p>
          </div>
        )}
        <div className="flex shrink-0 items-center gap-2">
          {canRemove && (
            <button
              type="button"
              onClick={() => onRemove(block.id)}
              aria-label="Remove schedule block"
              className="flex h-7 w-7 items-center justify-center text-[#4b535c] hover:text-[#0a0a0a]"
            >
              <IconClose className="size-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label={isExpanded ? 'Collapse schedule block' : 'Expand schedule block'}
            aria-expanded={isExpanded}
            className="flex h-7 w-7 items-center justify-center text-[#4b535c] hover:text-[#0a0a0a]"
          >
            <IconChevronDown
              className={`size-4 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] font-normal text-[#000000] opacity-[0.67]">Schedule name</label>
          <input
            type="text"
            value={block.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="e.g. Spring/Summer 25 Replenishment"
            className="h-12 rounded-[4px] border border-[#EAEAEA] px-4 text-[14px] text-[#0a0a0a]"
          />
        </div>
        <CreateScheduleScopeMultiSelect
          label="Movement type"
          placeholder="Select movement type"
          options={['Replenishment', 'Rebalancing']}
          includeValues={block.movementTypes}
          onIncludeChange={(next) => onUpdate({ movementTypes: next })}
          excludeValues={[]}
          onExcludeChange={() => {}}
          hideModeToggle={true}
          showSelectedLabels={true}
        />

        <CreateScheduleScopeSingleSelect
          label="Network tag"
          helperText="This schedule will apply the tagged constraints set in your Network parameters."
          placeholder="Select network tag"
          options={['Paris courier', 'Weekly replen', 'Saturday replan', 'Weekend rebal']}
          value={block.networkTag}
          onChange={(next) => onUpdate({ networkTag: next })}
        />

        <CreateScheduleScopeSingleSelect
          label="Trip capacity tag"
          helperText="This schedule will apply the tagged constraints set in your Trip capacity parameters."
          placeholder="Select trip capacity tag"
          options={['Paris courier', 'Weekly replen', 'Saturday replan', 'Weekend rebal']}
          value={block.tripCapacityTag}
          onChange={(next) => onUpdate({ tripCapacityTag: next })}
        />

        <CreateScheduleScopeMultiSelect
          label="Confidence level"
          helperText="Select which Autone confidence recommendations you see in the scheduled proposal."
          placeholder="Select confidence levels"
          options={['Very High', 'High', 'Medium', 'Low', 'Very Low']}
          includeValues={block.confidenceLevels}
          onIncludeChange={(next) => onUpdate({ confidenceLevels: next })}
          excludeValues={[]}
          onExcludeChange={() => {}}
          hideModeToggle={true}
          showSelectAll={true}
          showSelectedLabels={true}
        />

        <CreateScheduleScopeSingleSelect
          label="Aggressiveness"
          helperText="Higher aggressiveness adds more safety stock to this schedule's recommendations."
          placeholder="Select aggressiveness"
          options={['Conservative', 'Balanced', 'Aggressive']}
          value={block.aggressiveness}
          onChange={(next) => onUpdate({ aggressiveness: next })}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] font-normal text-[#000000] opacity-[0.67]">Target coverage</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="0"
              value={block.targetCoverageValue}
              onChange={(e) => onUpdate({ targetCoverageValue: e.target.value })}
              className="h-12 w-[100px] shrink-0 rounded-[4px] border border-[#EAEAEA] bg-white px-4 text-[14px] text-[#0a0a0a] placeholder:text-[#9ca3af] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <div className="relative shrink-0">
              <select
                value={block.targetCoverageUnit}
                onChange={(e) => onUpdate({ targetCoverageUnit: e.target.value })}
                className="h-12 w-[120px] appearance-none rounded-[4px] border border-[#EAEAEA] bg-white py-0 pl-4 pr-10 text-[14px] text-[#0a0a0a]"
              >
                <option value="Weeks">Weeks</option>
                <option value="Days">Days</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#4b535c]">
                <IconChevronDownSelect />
              </span>
            </div>
          </div>
          <p className="text-[12px] text-[#4b535c]">
            Instead of covering you until the next scheduled proposal, input how many weeks of stock you want your
            locations to hold.
          </p>
        </div>

        <section className="mt-4 flex flex-col gap-4">
          <p className="mb-3 text-[14px] font-medium text-[#0a0a0a]">Scheduling dates</p>

          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-normal text-[#000000] opacity-[0.67]">Repeat every</label>
            <div className="flex items-center gap-2">
              <div className="flex h-12 items-center overflow-hidden rounded-[4px] border border-[#EAEAEA] bg-white">
                <input
                  type="number"
                  min={1}
                  value={block.repeatEvery}
                  onChange={(e) => onUpdate({ repeatEvery: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                  className="h-12 w-[80px] border-none px-4 py-3 text-center text-[14px] text-[#0a0a0a] [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <div className="flex shrink-0 flex-col border-l border-[#EAEAEA]">
                  <button
                    type="button"
                    onClick={() => onUpdate({ repeatEvery: Math.max(1, block.repeatEvery + 1) })}
                    className="flex h-6 w-7 items-center justify-center border-b border-[#EAEAEA] text-[#4b535c] hover:bg-[#f8f8f8]"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdate({ repeatEvery: Math.max(1, block.repeatEvery - 1) })}
                    className="flex h-6 w-7 items-center justify-center text-[#4b535c] hover:bg-[#f8f8f8]"
                  >
                    −
                  </button>
                </div>
              </div>
              <div className="relative">
                <select
                  value={block.repeatEveryUnit}
                  onChange={(e) => onUpdate({ repeatEveryUnit: e.target.value })}
                  className="h-12 w-[120px] appearance-none rounded-[4px] border border-[#EAEAEA] bg-white px-4 py-3 pr-10 text-[14px] text-[#0a0a0a]"
                >
                  <option value="day">day</option>
                  <option value="week">week</option>
                  <option value="month">month</option>
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#4b535c]">
                  <IconChevronDownSelect />
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="mt-3 text-[13px] font-medium text-[#0a0a0a]">When recommendations become available</p>
            <p className="mb-2 text-[12px] text-[#4b535c]">
              When the next batch of recommendations is created and ready to review.
            </p>
            <div className="flex items-center gap-3">
              {block.repeatEveryUnit === 'week' && (
                <ScheduleDayOfWeekSelector
                  value={block.generationDay}
                  onChange={(next) => onUpdate({ generationDay: next })}
                />
              )}
              {block.repeatEveryUnit === 'month' && (
                <input
                  type="date"
                  value={block.generationDate}
                  onChange={(e) => onUpdate({ generationDate: e.target.value })}
                  className="h-12 w-[160px] shrink-0 rounded-[4px] border border-[#EAEAEA] bg-white px-4 text-[14px] text-[#0a0a0a]"
                />
              )}
              <ScheduleTimeSelect
                value={block.generationTime}
                onChange={(next) => onUpdate({ generationTime: next })}
              />
            </div>
          </div>

          <div>
            <p className="mt-4 text-[13px] font-medium text-[#0a0a0a]">Submission deadline (Optional)</p>
            <p className="mb-2 text-[12px] text-[#4b535c]">
              The deadline by which all approved recommendations will be auto-submitted. Leave blank if you don&apos;t
              want auto-submission.
            </p>
            <div className="flex items-center gap-3">
              {block.repeatEveryUnit === 'week' && (
                <ScheduleDayOfWeekSelector
                  value={block.submissionDay}
                  onChange={(next) => onUpdate({ submissionDay: next })}
                />
              )}
              {block.repeatEveryUnit === 'month' && (
                <input
                  type="date"
                  value={block.submissionDate}
                  onChange={(e) => onUpdate({ submissionDate: e.target.value })}
                  className="h-12 w-[160px] shrink-0 rounded-[4px] border border-[#EAEAEA] bg-white px-4 text-[14px] text-[#0a0a0a]"
                />
              )}
              <ScheduleTimeSelect
                value={block.submissionTime}
                onChange={(next) => onUpdate({ submissionTime: next })}
              />
            </div>
          </div>
        </section>

        <section className="mt-6 border-t border-[#e5e7eb] pt-6">
          <p className="mb-3 text-[14px] font-medium text-[#0a0a0a]">Skip occurrences</p>
          <p className="mb-3 text-[12px] text-[#4b535c]">
            Use this if you want to temporarily run a different schedule — for example, to combine movement types or
            separate replenishment and rebalancing into one batch.
          </p>
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-normal text-[#000000] opacity-[0.67]">Skip every</label>
            <div className="flex items-center gap-2">
              <div className="flex h-12 items-center overflow-hidden rounded-[4px] border border-[#EAEAEA] bg-white">
                <input
                  type="number"
                  min={2}
                  value={block.skipEvery}
                  onChange={(e) => {
                    const v = e.target.value
                    if (v === '') {
                      onUpdate({ skipEvery: '' })
                      return
                    }
                    onUpdate({ skipEvery: String(Math.max(2, parseInt(v, 10) || 2)) })
                  }}
                  placeholder=""
                  className="h-12 w-[80px] border-none px-4 py-3 text-center text-[14px] text-[#0a0a0a] placeholder:text-[#9ca3af] [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <div className="flex shrink-0 flex-col border-l border-[#EAEAEA]">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdate({
                        skipEvery: String(Math.max(2, (block.skipEvery === '' ? 1 : parseInt(block.skipEvery, 10) || 1) + 1)),
                      })
                    }
                    className="flex h-6 w-7 items-center justify-center border-b border-[#EAEAEA] text-[#4b535c] hover:bg-[#f8f8f8]"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (block.skipEvery === '') return
                      onUpdate({
                        skipEvery: String(Math.max(2, (parseInt(block.skipEvery, 10) || 2) - 1)),
                      })
                    }}
                    className="flex h-6 w-7 items-center justify-center text-[#4b535c] hover:bg-[#f8f8f8]"
                  >
                    −
                  </button>
                </div>
              </div>
              <div className="relative">
                <select
                  value={block.skipEveryUnit}
                  onChange={(e) => onUpdate({ skipEveryUnit: e.target.value })}
                  className="h-12 w-[120px] appearance-none rounded-[4px] border border-[#EAEAEA] bg-white px-4 py-3 pr-10 text-[14px] text-[#0a0a0a]"
                >
                  <option value="weeks">weeks</option>
                  <option value="days">days</option>
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#4b535c]">
                  <IconChevronDownSelect />
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 border-t border-[#e5e7eb] pt-6">
          <p className="mb-3 text-[14px] font-medium text-[#0a0a0a]">Notify users</p>
          <p className="mb-3 text-[12px] text-[#4b535c]">
            Notified when a new proposal is created, as the submission deadline approaches and when a batch is submitted.
          </p>
          <input
            type="text"
            value={block.notifyUsers}
            onChange={(e) => onUpdate({ notifyUsers: e.target.value })}
            placeholder="Enter user emails (comma-separated)"
            className="h-12 w-full rounded-[4px] border border-[#EAEAEA] bg-white px-4 text-[14px] text-[#0a0a0a] placeholder:text-[#9ca3af]"
          />
        </section>

        <section className="mt-6 border-t border-[#e5e7eb] pt-6">
          <p className="mb-3 text-[14px] font-medium text-[#0a0a0a]">Approval & submission</p>

          <div className="flex flex-col gap-3">
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-[10px] border bg-white p-4 hover:border-[#1d4ed8]/40 has-[:checked]:border-[#1d4ed8] ${
                block.approvalMode === 'auto-approve' ? 'border-[#1d4ed8]' : 'border-[#e5e7eb]'
              }`}
            >
              <input
                type="radio"
                name={`approvalMode-${block.id}`}
                value="auto-approve"
                checked={block.approvalMode === 'auto-approve'}
                onChange={() => onUpdate({ approvalMode: 'auto-approve' })}
                className="mt-1 size-4 shrink-0 border-[#e5e7eb] text-[#1d4ed8] focus:ring-[#1d4ed8]"
              />
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-[14px] font-medium text-[#0a0a0a]">Auto-approve recommendations</span>
                <span className="text-[12px] font-normal text-[#4b535c]">
                  Recommendations are auto-approved by default. Define exceptions below to flag specific recommendations
                  for manual review.
                </span>
              </div>
            </label>

            <label
              className={`flex cursor-pointer items-start gap-3 rounded-[10px] border bg-white p-4 hover:border-[#1d4ed8]/40 has-[:checked]:border-[#1d4ed8] ${
                block.approvalMode === 'manual-review' ? 'border-[#1d4ed8]' : 'border-[#e5e7eb]'
              }`}
            >
              <input
                type="radio"
                name={`approvalMode-${block.id}`}
                value="manual-review"
                checked={block.approvalMode === 'manual-review'}
                onChange={() => onUpdate({ approvalMode: 'manual-review' })}
                className="mt-1 size-4 shrink-0 border-[#e5e7eb] text-[#1d4ed8] focus:ring-[#1d4ed8]"
              />
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-[14px] font-medium text-[#0a0a0a]">Manual review required</span>
                <span className="text-[12px] font-normal text-[#4b535c]">
                  No recommendations auto-submit. Every recommendation requires user review before the submission
                  deadline.
                </span>
              </div>
            </label>
          </div>

          {block.approvalMode === 'auto-approve' && (
            <div className="mt-4">
              <h4 className="mb-2 text-[13px] font-medium uppercase tracking-[0.04em] text-[#0a0a0a]">Exceptions</h4>
              <p className="mb-3 text-[12px] text-[#4b535c]">
                Recommendations matching these conditions will be flagged for manual review instead of auto-approved.
              </p>
              <ScheduleBlockApprovalExceptions block={block} onUpdate={onUpdate} />
            </div>
          )}
        </section>
          </div>
        </div>
      )}
    </div>
  )
}

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
  { id: 'rebalancing', label: 'Rebalancing' },
]

export default function OptimiserPage({ onAddJob, openScheduleDrawer, openAddJob, resetToUpcoming, openCreateSchedulePage, resetToRecommendationsLanding, onOpenScheduleDetail }) {
  const [scheduleDrawerOpen, setScheduleDrawerOpen] = useState(false)
  const [editingScheduleEntry, setEditingScheduleEntry] = useState(null)
  const [drawerForm, setDrawerForm] = useState(DEFAULT_DRAWER_FORM)
  const [scheduleDrawerDays, setScheduleDrawerDays] = useState(() => ({ Wed: true, Sat: true }))
  const [skipDates, setSkipDates] = useState([])
  const [skipDatePickerOpen, setSkipDatePickerOpen] = useState(false)
  const [skipDateDraft, setSkipDateDraft] = useState('')
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
  const formatSkipDateDisplay = (isoDate) => {
    const [y, m, d] = isoDate.split('-')
    return `${d}/${m}/${y}`
  }
  const confirmSkipDate = () => {
    if (!skipDateDraft) return
    const formatted = formatSkipDateDisplay(skipDateDraft)
    setSkipDates((prev) => (prev.includes(formatted) ? prev : [...prev, formatted]))
    setSkipDateDraft('')
    setSkipDatePickerOpen(false)
  }
  const removeSkipDate = (date) => setSkipDates((prev) => prev.filter((d) => d !== date))
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
  const [locationScopeOption, setLocationScopeOption] = useState('all')
  const [warehouseInclude, setWarehouseInclude] = useState([])
  const [warehouseExclude, setWarehouseExclude] = useState([])
  const [departmentInclude, setDepartmentInclude] = useState([])
  const [departmentExclude, setDepartmentExclude] = useState([])
  const [seasonsInclude, setSeasonsInclude] = useState([])
  const [seasonsExclude, setSeasonsExclude] = useState([])
  const [productsInclude, setProductsInclude] = useState([])
  const [productsExclude, setProductsExclude] = useState([])
  const [locationTypesInclude, setLocationTypesInclude] = useState([])
  const [locationTypesExclude, setLocationTypesExclude] = useState([])
  const [locationsInclude, setLocationsInclude] = useState([])
  const [locationsExclude, setLocationsExclude] = useState([])
  const [warehouseMode, setWarehouseMode] = useState('include')
  const [departmentMode, setDepartmentMode] = useState('include')
  const [seasonsMode, setSeasonsMode] = useState('include')
  const [productsMode, setProductsMode] = useState('include')
  const [locationTypesMode, setLocationTypesMode] = useState('include')
  const [locationsMode, setLocationsMode] = useState('include')
  const [extraVisibleFilters, setExtraVisibleFilters] = useState([])
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false)
  const [expandedFieldState, setExpandedFieldState] = useState(createInitialExpandedFieldState)
  const [currentStep, setCurrentStep] = useState(1)
  const [proposalName, setProposalName] = useState('')
  const [scheduleBlocks, setScheduleBlocks] = useState([createDefaultScheduleBlock('block-1')])
  const [expandedBlockId, setExpandedBlockId] = useState('block-1')
  const updateScheduleBlock = (blockId, updates) => {
    setScheduleBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, ...updates } : b)))
  }
  const addScheduleBlock = () => {
    if (scheduleBlocks.length >= 2) return
    const newBlock = createDefaultScheduleBlock(`block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`)
    setScheduleBlocks((prev) => [...prev, newBlock])
    setExpandedBlockId(newBlock.id)
  }
  const removeScheduleBlock = (blockId) => {
    setScheduleBlocks((prev) => {
      if (prev.length <= 1) return prev
      const next = prev.filter((b) => b.id !== blockId)
      setExpandedBlockId((prevExpanded) => {
        if (prevExpanded !== blockId) return prevExpanded
        return next[0]?.id ?? null
      })
      return next
    })
  }
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
      name: 'Europe monthly',
      created: '24/02/2026',
      deadline: '28/02/2026',
      status: 'Ready to review',
      exceptions: '12',
      approved: '96',
      pending: '25',
      reviewProgress: { percent: 79, reviewed: 96, total: 121 },
      metricTiles: [
        { kind: 'trips', value: '113', title: 'Unique trips', subtitle: 'Across 8 routes' },
        { kind: 'transfers', value: '2,308', title: 'Recommended transfers', subtitle: '94% auto-approved' },
        { kind: 'revenue', value: '€501.1K', title: 'Revenue increase', subtitle: '+4.2% vs last run', subtitleAccent: true },
        { kind: 'stockouts', value: '1,013 → 559', title: 'Stockouts resolved', subtitle: '-44.8% reduction', subtitleAccent: true },
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
      deadline: '01/06/2026',
      status: 'Ready to review',
      exceptions: '5',
      approved: '42',
      pending: '18',
      reviewProgress: { percent: 45, reviewed: 38, total: 84 },
      metricTiles: [
        { kind: 'trips', value: '48', title: 'Unique trips', subtitle: 'Across 5 routes' },
        { kind: 'transfers', value: '1,120', title: 'Recommended transfers', subtitle: '88% auto-approved' },
        { kind: 'revenue', value: '€210.4K', title: 'Revenue increase', subtitle: '+2.1% vs last run', subtitleAccent: true },
        { kind: 'stockouts', value: '512 → 304', title: 'Stockouts resolved', subtitle: '-40.6% reduction', subtitleAccent: true },
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

  const updateExpandedField = (fieldKey, updates) => {
    setExpandedFieldState((prev) => ({
      ...prev,
      [fieldKey]: { ...prev[fieldKey], ...updates },
    }))
  }

  const toggleExtraFilter = (fieldKey) => {
    if (extraVisibleFilters.includes(fieldKey)) {
      updateExpandedField(fieldKey, { include: [], exclude: [] })
      setExtraVisibleFilters((prev) => prev.filter((k) => k !== fieldKey))
    } else {
      setExtraVisibleFilters((prev) => [...prev, fieldKey])
    }
  }

  const scopeActiveFilterEntries = [
    {
      fieldKey: 'department',
      label: 'Department',
      includeValues: departmentInclude,
      excludeValues: departmentExclude,
      onClearInclude: () => setDepartmentInclude([]),
      onClearExclude: () => setDepartmentExclude([]),
    },
    {
      fieldKey: 'seasons',
      label: 'Seasons',
      includeValues: seasonsInclude,
      excludeValues: seasonsExclude,
      onClearInclude: () => setSeasonsInclude([]),
      onClearExclude: () => setSeasonsExclude([]),
    },
    {
      fieldKey: 'products',
      label: 'Products',
      includeValues: productsInclude,
      excludeValues: productsExclude,
      onClearInclude: () => setProductsInclude([]),
      onClearExclude: () => setProductsExclude([]),
    },
    {
      fieldKey: 'warehouse',
      label: 'Warehouse',
      includeValues: warehouseInclude,
      excludeValues: warehouseExclude,
      onClearInclude: () => setWarehouseInclude([]),
      onClearExclude: () => setWarehouseExclude([]),
    },
    {
      fieldKey: 'locationTypes',
      label: 'Location Types',
      includeValues: locationTypesInclude,
      excludeValues: locationTypesExclude,
      onClearInclude: () => setLocationTypesInclude([]),
      onClearExclude: () => setLocationTypesExclude([]),
    },
    {
      fieldKey: 'locations',
      label: 'Locations',
      includeValues: locationsInclude,
      excludeValues: locationsExclude,
      onClearInclude: () => setLocationsInclude([]),
      onClearExclude: () => setLocationsExclude([]),
    },
    ...SCOPE_EXPANDED_PRODUCT_FIELDS.filter(({ key }) => extraVisibleFilters.includes(key)).map(
      ({ key, label }) => ({
      fieldKey: key,
      label,
      includeValues: expandedFieldState[key].include,
      excludeValues: expandedFieldState[key].exclude,
      onClearInclude: () => updateExpandedField(key, { include: [] }),
      onClearExclude: () => updateExpandedField(key, { exclude: [] }),
    })
    ),
    ...SCOPE_EXPANDED_LOCATION_FIELDS.filter(({ key }) => extraVisibleFilters.includes(key)).map(
      ({ key, label }) => ({
      fieldKey: key,
      label,
      includeValues: expandedFieldState[key].include,
      excludeValues: expandedFieldState[key].exclude,
      onClearInclude: () => updateExpandedField(key, { include: [] }),
      onClearExclude: () => updateExpandedField(key, { exclude: [] }),
    })
    ),
  ]

  const CREATE_SCHEDULE_WIZARD_STEPS = [
    {
      title: 'Scope',
      subtitle: 'Define the products, locations, and network for this schedule.',
      continueLabel: 'Continue to Schedule details',
    },
    {
      title: 'Schedule details',
      subtitle: 'Define when this proposal runs and how recommendations are approved.',
      continueLabel: 'Continue to Review',
    },
    {
      title: 'Review',
      subtitle: 'Review your proposal before creating it.',
      continueLabel: 'Create proposal',
    },
  ]

  if (isCreateSchedulePage) {
    return (
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6">
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

        <div className="py-3">
          <input
            type="text"
            placeholder="Untitled proposal"
            value={proposalName}
            onChange={(e) => setProposalName(e.target.value)}
            className="w-full max-w-[480px] border-0 border-b border-transparent bg-transparent text-[20px] font-semibold text-[#0a0a0a] placeholder:text-[#9ca3af] focus:border-[#1d4ed8] focus:outline-none"
          />
        </div>

        <div className="mt-2 mb-4 flex w-full gap-1">
          {[0, 1, 2].map((segmentIndex) => (
            <div
              key={segmentIndex}
              className={`h-1 flex-1 rounded-full ${
                segmentIndex < currentStep ? 'bg-[#1d4ed8]' : 'bg-[#e5e7eb]'
              }`}
            />
          ))}
        </div>

        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {currentStep === 1 ? (
              <p className="text-[14px] font-medium text-[#0a0a0a]">Step 1 of 3</p>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentStep((step) => step - 1)}
                className="flex cursor-pointer items-center gap-1.5 text-[14px] font-medium text-[#1d4ed8] hover:underline"
              >
                ← Step {currentStep} of 3
              </button>
            )}
            <h2 className="mt-1 text-[22px] font-semibold text-[#0a0a0a]">
              {CREATE_SCHEDULE_WIZARD_STEPS[currentStep - 1].title}
            </h2>
            <p className="mt-1 text-[14px] text-[#4b535c]">
              {CREATE_SCHEDULE_WIZARD_STEPS[currentStep - 1].subtitle}
            </p>
          </div>
          {currentStep < 3 && (
            <button
              type="button"
              onClick={() => setCurrentStep((step) => step + 1)}
              className="shrink-0 rounded-[4px] bg-[#1d4ed8] px-5 py-2.5 text-[14px] font-medium text-white hover:bg-[#1e40af]"
            >
              {CREATE_SCHEDULE_WIZARD_STEPS[currentStep - 1].continueLabel}
            </button>
          )}
        </div>

        {currentStep === 1 && (
          <div className="border border-[#EAEAEA] rounded-[4px] bg-white overflow-visible">
            <div className="px-5 pb-6 pt-2 flex flex-col gap-6">
                <section className="flex flex-col gap-3">
                  <h3 className="text-[14px] font-medium text-[#0a0a0a]">
                    Which products and locations does this schedule cover?
                  </h3>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-start gap-3 p-4 rounded-[10px] border border-[#e5e7eb] bg-white cursor-pointer hover:border-[#0267ff]/40 has-[:checked]:border-[#0267ff]">
                      <input
                        type="radio"
                        name="locationScopeOption"
                        value="all"
                        checked={locationScopeOption === 'all'}
                        onChange={() => setLocationScopeOption('all')}
                        className="mt-1 size-4 shrink-0 border-[#e5e7eb] text-[#0267ff] focus:ring-[#0267ff]"
                      />
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-[14px] font-medium text-[#0a0a0a]">All products and locations</span>
                        <span className="text-[12px] font-normal text-[#4b535c]">
                          Sol will evaluate your entire product catalogue and network.
                        </span>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 p-4 rounded-[10px] border border-[#e5e7eb] bg-white cursor-pointer hover:border-[#0267ff]/40 has-[:checked]:border-[#0267ff]">
                      <input
                        type="radio"
                        name="locationScopeOption"
                        value="select"
                        checked={locationScopeOption === 'select'}
                        onChange={() => setLocationScopeOption('select')}
                        className="mt-1 size-4 shrink-0 border-[#e5e7eb] text-[#0267ff] focus:ring-[#0267ff]"
                      />
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-[14px] font-medium text-[#0a0a0a]">Select products and locations</span>
                        <span className="text-[12px] font-normal text-[#4b535c]">
                          Choose specific products, locations, regions, or countries to{' '}
                          <strong className="font-semibold">include</strong> in this schedule.
                        </span>
                      </div>
                    </label>
                  </div>

                  {locationScopeOption === 'select' && (
                    <>
                      <ActiveFilterChips entries={scopeActiveFilterEntries} />
                      <CreateScheduleScopeFilterPanel
                      warehouseInclude={warehouseInclude}
                      setWarehouseInclude={setWarehouseInclude}
                      warehouseExclude={warehouseExclude}
                      setWarehouseExclude={setWarehouseExclude}
                      warehouseMode={warehouseMode}
                      setWarehouseMode={setWarehouseMode}
                      departmentInclude={departmentInclude}
                      setDepartmentInclude={setDepartmentInclude}
                      departmentExclude={departmentExclude}
                      setDepartmentExclude={setDepartmentExclude}
                      departmentMode={departmentMode}
                      setDepartmentMode={setDepartmentMode}
                      seasonsInclude={seasonsInclude}
                      setSeasonsInclude={setSeasonsInclude}
                      seasonsExclude={seasonsExclude}
                      setSeasonsExclude={setSeasonsExclude}
                      seasonsMode={seasonsMode}
                      setSeasonsMode={setSeasonsMode}
                      productsInclude={productsInclude}
                      setProductsInclude={setProductsInclude}
                      productsExclude={productsExclude}
                      setProductsExclude={setProductsExclude}
                      productsMode={productsMode}
                      setProductsMode={setProductsMode}
                      locationTypesInclude={locationTypesInclude}
                      setLocationTypesInclude={setLocationTypesInclude}
                      locationTypesExclude={locationTypesExclude}
                      setLocationTypesExclude={setLocationTypesExclude}
                      locationTypesMode={locationTypesMode}
                      setLocationTypesMode={setLocationTypesMode}
                      locationsInclude={locationsInclude}
                      setLocationsInclude={setLocationsInclude}
                      locationsExclude={locationsExclude}
                      setLocationsExclude={setLocationsExclude}
                      locationsMode={locationsMode}
                      setLocationsMode={setLocationsMode}
                      extraVisibleFilters={extraVisibleFilters}
                      expandedFieldState={expandedFieldState}
                      updateExpandedField={updateExpandedField}
                    />
                      <CreateScheduleMoreFiltersMenu
                        isOpen={isMoreFiltersOpen}
                        onToggle={() => setIsMoreFiltersOpen((v) => !v)}
                        onClose={() => setIsMoreFiltersOpen(false)}
                        extraVisibleFilters={extraVisibleFilters}
                        onToggleExtraFilter={toggleExtraFilter}
                      />
                    </>
                  )}
                </section>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="max-w-[800px]">
            <div className="flex flex-col gap-3">
              {scheduleBlocks.map((block, index) => (
                <ScheduleDetailsBlock
                  key={block.id}
                  block={block}
                  index={index}
                  isExpanded={block.id === expandedBlockId}
                  onToggleExpand={() =>
                    setExpandedBlockId((prev) => (prev === block.id ? null : block.id))
                  }
                  onRemove={removeScheduleBlock}
                  canRemove={scheduleBlocks.length > 1}
                  onUpdate={(updates) => updateScheduleBlock(block.id, updates)}
                />
              ))}
            </div>
            {scheduleBlocks.length < 2 && (
              <button
                type="button"
                onClick={addScheduleBlock}
                className="mt-4 flex h-12 w-full items-center justify-center rounded-[4px] border border-dashed border-[#1d4ed8] text-[14px] font-medium text-[#1d4ed8] hover:bg-[#1d4ed8]/5"
              >
                + schedule details & rules
              </button>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="flex flex-col gap-4">
            {[
              { title: 'Scope', step: 1 },
              { title: 'Schedule details', step: 2 },
            ].map(({ title, step }) => (
              <div key={title} className="rounded-[4px] border border-[#e5e7eb] bg-[#fafafa] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-[13px] font-medium text-[#0a0a0a] uppercase tracking-[0.04em]">{title}</h4>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(step)}
                    className="flex items-center gap-1 text-[14px] font-medium text-[#1d4ed8] hover:underline"
                  >
                    <Pencil className="size-4" aria-hidden />
                    Edit
                  </button>
                </div>
                <p className="text-[14px] italic text-[#4b535c]">Summary will be generated here.</p>
              </div>
            ))}
          </div>
        )}

        {currentStep === 3 && (
          <div className="flex items-center justify-end gap-3 pt-6">
            <button
              type="button"
              className="h-12 px-6 rounded-[6px] text-[16px] font-medium text-[#0a0a0a] hover:bg-[#f3f4f6]">
              Cancel
            </button>
            <button
              type="button"
              className="h-12 px-6 rounded-[6px] bg-[#0267FF] text-white text-[16px] font-medium hover:bg-[#0252cc]">
              Create schedule
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0">
      {pinnedHoverEntryId && activeStatusTab === 'upcoming' && (
        <div role="presentation" className="fixed inset-0 z-40" onClick={() => { setPinnedHoverEntryId(null); setPinnedHoverCellKey(null) }} aria-hidden />
      )}
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
                  ? 'text-[#0a0a0a] border-[#2EB8C2]'
                  : 'text-[#4b535c] border-transparent hover:text-[#0a0a0a]'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </nav>
      {activeStatusTab === 'upcoming' ? (
        <>
          <div className="mt-6 flex flex-col gap-6" data-name="Optimiser" data-node-id="174:2696">
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
                                      <span className="font-medium text-[#08A16A]">${entry.revenueIncrease}</span>
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
        <div className="mt-[10px] space-y-4">
          {sortedNextSchedules.map((schedule) => {
            const deadlineDate = parseDate(schedule.deadline)
            const isDeadlinePast = deadlineDate < today
            const deadlineBadgeClass = isDeadlinePast
              ? 'bg-[#fee2e2] text-[#E30D3C]'
              : schedule.id === 'uk-weekly-replen'
                ? 'bg-[#fef3c7] text-[#92400e]'
                : 'bg-[#fce7f3] text-[#9d174d]'
            const rp = schedule.reviewProgress ?? { percent: 0, reviewed: 0, total: 0 }
            const tiles = schedule.metricTiles ?? []
            const renderTileIcon = (kind) => {
              const iconClass = 'size-[18px] shrink-0'
              const iconBox = (bgClass, icon) => (
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-[8px] ${bgClass}`}
                  aria-hidden
                >
                  {icon}
                </div>
              )
              switch (kind) {
                case 'trips':
                  return iconBox(
                    'bg-[#eff6ff]',
                    <Truck className={`${iconClass} text-[#3b82f6]`} strokeWidth={1.75} aria-hidden />
                  )
                case 'transfers':
                  return iconBox(
                    'bg-[#EFEFFD]',
                    <Network className={`${iconClass} text-[#6864E6]`} strokeWidth={1.75} aria-hidden />
                  )
                case 'revenue':
                  return iconBox(
                    'bg-[#ecfdf5]',
                    <TrendingUp className={`${iconClass} text-[#08A16A]`} strokeWidth={1.75} aria-hidden />
                  )
                case 'stockouts':
                  return iconBox(
                    'bg-[#ecfdf5]',
                    <ShieldCheck className={`${iconClass} text-[#08A16A]`} strokeWidth={1.75} aria-hidden />
                  )
                default:
                  return null
              }
            }
            return (
            <div
              key={schedule.id}
              className={`bg-white border border-[#EAEAEA] rounded-[3.42px] p-5 flex flex-col gap-4 w-full${onOpenScheduleDetail ? ' group cursor-pointer' : ''}`}
              onClick={() => onOpenScheduleDetail && onOpenScheduleDetail(schedule)}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <h2 className="text-lg md:text-xl font-medium text-[#0a0a0a] group-hover:text-[#3b82f6]">
                    {schedule.name}
                  </h2>
                  <span className="inline-flex items-center rounded-full bg-[#ecfdf5] text-[#047857] text-[12px] font-medium px-2.5 py-0.5">
                    {schedule.status}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  className="inline-flex h-10 shrink-0 items-center justify-center rounded-[4px] border border-solid border-[#e9eaeb] bg-white px-4 py-0 text-[16px] font-medium text-[#00050a] transition-colors hover:bg-[#f9fafb]"
                  data-name="Button"
                  data-node-id="12027:34155"
                >
                  Submit
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#4b535c]">
                <span className="inline-flex items-center gap-2 flex-wrap">
                  <span className="text-[#4b535c]">Submission deadline:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[13px] font-medium ${deadlineBadgeClass}`}>
                    {schedule.deadline}
                  </span>
                </span>
                <span>
                  Created <span className="text-[#0a0a0a]">{schedule.created}</span>
                </span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {tiles.map((tile) => (
                  <div
                    key={tile.kind}
                    className="flex min-w-0 flex-row items-start gap-3 rounded-[4px] border border-[#EAEAEA] bg-white px-3 py-3"
                  >
                    {renderTileIcon(tile.kind)}
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-xl font-medium leading-tight tracking-tight text-[#0a0a0a]">
                        {tile.value}
                      </span>
                      <span className="text-[12px] font-medium leading-snug text-[#0a0a0a]">{tile.title}</span>
                      <span
                        className={`flex items-center gap-1.5 text-[11px] leading-snug ${
                          tile.subtitleAccent ? 'font-medium text-[#08A16A]' : 'text-[#6b7280]'
                        }`}
                      >
                        {tile.subtitleAccent && (
                          <span className="size-1.5 shrink-0 rounded-full bg-[#08A16A]" aria-hidden />
                        )}
                        {tile.subtitle}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-[13px]">
                  <span className="font-medium text-[#0a0a0a]">Review progress</span>
                  <span className="text-[#0a0a0a] tabular-nums">
                    {rp.percent}%{' '}
                    <span className="text-[#6b7280] font-normal">
                      ({rp.reviewed} of {rp.total} transfers reviewed)
                    </span>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#e5e7eb] overflow-hidden" role="progressbar" aria-valuenow={rp.percent} aria-valuemin={0} aria-valuemax={100}>
                  <div
                    className="h-full rounded-full bg-[#2EB8C2] transition-[width] duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, rp.percent))}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5 border-t border-[#f3f4f6]">
                <div className="min-h-[1.25rem]">
                  {schedule.exceptionsList ? (
                    (() => {
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
                          className="text-[13px] font-medium text-[#3b82f6] hover:underline"
                        >
                          {expandedExceptionsScheduleId === schedule.id
                            ? `Hide exceptions (${totalExceptions})`
                            : `Show exceptions (${totalExceptions})`}
                        </button>
                      )
                    })()
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#6b7280]">
                  <span>
                    Transfer exceptions: <span className="font-medium text-[#0a0a0a]">{schedule.exceptions}</span>
                  </span>
                  <span>
                    Total approved: <span className="font-medium text-[#0a0a0a]">{schedule.approved}</span>
                  </span>
                  {schedule.pending != null && (
                    <span>
                      Pending: <span className="font-medium text-[#0a0a0a]">{schedule.pending}</span>
                    </span>
                  )}
                </div>
              </div>
              {schedule.exceptionsList && expandedExceptionsScheduleId === schedule.id && (
                <div className="space-y-2 -mt-1">
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
                <label className="text-[14px] font-normal text-[#4b535c]">Skip dates</label>
                <p className="text-[12px] font-normal text-[#4b535c]">Pause this schedule for specific upcoming dates</p>
                {skipDates.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skipDates.map((date) => (
                      <span
                        key={date}
                        className="inline-flex items-center gap-1.5 rounded-[4px] border border-[#e9eaeb] bg-white px-2.5 py-1 text-[14px] text-[#0a0a0a]"
                      >
                        {date}
                        <button
                          type="button"
                          onClick={() => removeSkipDate(date)}
                          className="text-[#4b535c] hover:text-[#0a0a0a] leading-none"
                          aria-label={`Remove skip date ${date}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {skipDatePickerOpen ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="date"
                      value={skipDateDraft}
                      onChange={(ev) => setSkipDateDraft(ev.target.value)}
                      className="h-10 px-3 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#0a0a0a]"
                    />
                    <button
                      type="button"
                      onClick={confirmSkipDate}
                      disabled={!skipDateDraft}
                      className="h-10 px-4 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] font-medium text-[#0a0a0a] hover:bg-[#f3f4f6] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSkipDatePickerOpen(true)}
                    className="self-start h-10 px-4 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] font-medium text-[#0a0a0a] hover:bg-[#f3f4f6]"
                  >
                    Add date
                  </button>
                )}
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
