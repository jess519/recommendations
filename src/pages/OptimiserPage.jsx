import { useState, useRef, useEffect, Fragment } from 'react'
import { Pencil, Check, Plus } from 'lucide-react'
import { IconPlus, IconChevronDown, IconClose, IconChevronDownSelect, IconArrowLeft } from '../components/icons'
import {
  ScheduleBlockApprovalExceptions,
  createDefaultScheduleExceptions,
} from '../components/ScheduleBlockApprovalExceptions'

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

function pad2(n) {
  return String(n).padStart(2, '0')
}

function resolveSubmissionDeadlineLabel(block) {
  const { submissionDeadlineDays, submissionDeadlineHours } = block
  const daysBlank = submissionDeadlineDays === '' || submissionDeadlineDays == null
  const hoursBlank = submissionDeadlineHours === '' || submissionDeadlineHours == null
  if (daysBlank && hoursBlank) {
    return null
  }

  const d = parseInt(submissionDeadlineDays || '0', 10)
  const h = parseInt(submissionDeadlineHours || '0', 10)

  if (block.repeatEveryUnit === 'week' && block.generationDay) {
    const startIdx = SUBMISSION_DAYS.findIndex((day) => day.key === block.generationDay)
    if (startIdx >= 0) {
      const [genH, genM] = (block.generationTime || '00:00').split(':').map((v) => parseInt(v, 10) || 0)
      const startMinOfWeek = startIdx * 1440 + genH * 60 + genM
      const totalOffsetMin = (d * 24 + h) * 60
      const resultMin = ((startMinOfWeek + totalOffsetMin) % 10080 + 10080) % 10080
      const resultDayIdx = Math.floor(resultMin / 1440)
      const resultH = Math.floor((resultMin % 1440) / 60)
      const resultM = resultMin % 60
      const dayLabel = capitalizeDay(SUBMISSION_DAYS[resultDayIdx].key)
      const timeLabel = `${pad2(resultH)}:${pad2(resultM)}`
      return `Submit on ${dayLabel} at ${timeLabel}`
    }
  }

  if (d === 0 && h === 0) {
    return 'Submit as soon as recommendations become available'
  }

  const parts = []
  if (d > 0) parts.push(`${d} ${d === 1 ? 'day' : 'days'}`)
  if (h > 0) parts.push(`${h} ${h === 1 ? 'hour' : 'hours'}`)
  if (parts.length === 1) {
    return `Submit ${parts[0]} after recommendations become available`
  }
  return `Submit ${parts[0]} and ${parts[1]} after recommendations become available`
}

function ScheduleDeadlineOffsetStepper({ value, onChange }) {
  return (
    <div className="flex h-12 items-center overflow-hidden rounded-[4px] border border-[#EAEAEA] bg-white">
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => {
          const v = e.target.value
          if (v === '') {
            onChange('')
            return
          }
          onChange(String(Math.max(0, parseInt(v, 10) || 0)))
        }}
        placeholder=""
        className="h-12 w-[80px] border-none px-4 py-3 text-center text-[14px] text-[#0a0a0a] placeholder:text-[#9ca3af] [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <div className="flex shrink-0 flex-col border-l border-[#EAEAEA]">
        <button
          type="button"
          onClick={() => {
            if (value === '') {
              onChange('1')
              return
            }
            onChange(String((parseInt(value, 10) || 0) + 1))
          }}
          className="flex h-6 w-7 items-center justify-center border-b border-[#EAEAEA] text-[#4b535c] hover:bg-[#f8f8f8]"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => {
            if (value === '') return
            const current = parseInt(value, 10) || 0
            onChange(String(Math.max(0, current - 1)))
          }}
          className="flex h-6 w-7 items-center justify-center text-[#4b535c] hover:bg-[#f8f8f8]"
        >
          −
        </button>
      </div>
    </div>
  )
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
    basicMode: false,
    targetCoverageValue: '',
    targetCoverageUnit: 'Weeks',
    repeatEvery: 1,
    repeatEveryUnit: 'week',
    submissionDeadlineDays: '',
    submissionDeadlineHours: '',
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
  const deadlineLabel = resolveSubmissionDeadlineLabel(block)
  if (deadlineLabel) {
    segments.push(deadlineLabel)
  }

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

function ScheduleBasicModeSwitch({ checked, onChange, ariaLabel = 'Basic mode' }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-[#1d4ed8]' : 'bg-[#d1d5db]'
      }`}
    >
      <span
        className={`inline-block size-4 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-[18px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
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

        <section className="mt-4 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[14px] font-medium text-[#0a0a0a]">Schedule reasoning</p>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-[14px] text-[#4b535c] whitespace-nowrap">Basic</span>
              <ScheduleBasicModeSwitch
                checked={block.basicMode}
                onChange={() => onUpdate({ basicMode: !block.basicMode })}
              />
            </div>
          </div>
          <div className="flex w-full flex-col items-end gap-1">
            <p className="w-full whitespace-nowrap text-right text-[11px] leading-[14px] text-[#4b535c]">
              Use target coverage instead of next schedule date, confidence and aggressiveness.
            </p>
            <p className="text-right text-[12px] leading-[16px] text-[#9ca3af]">For simpler setups.</p>
          </div>

        {!block.basicMode && (
          <>
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
          </>
        )}

        {block.basicMode && (
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
        )}
        </section>

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
            <div className="flex flex-wrap items-center gap-3">
              <ScheduleDeadlineOffsetStepper
                value={block.submissionDeadlineDays}
                onChange={(next) => onUpdate({ submissionDeadlineDays: next })}
              />
              <span className="text-[14px] text-[#4b535c]">days</span>
              <ScheduleDeadlineOffsetStepper
                value={block.submissionDeadlineHours}
                onChange={(next) => onUpdate({ submissionDeadlineHours: next })}
              />
              <span className="text-[14px] text-[#4b535c]">hours</span>
            </div>
            <p className="mt-2 text-[12px] text-[#4b535c]">
              {resolveSubmissionDeadlineLabel(block) ??
                "No auto-submission — approved recommendations won't be submitted automatically."}
            </p>
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

const ONGOING_TABLE_GRID =
  'grid-cols-[minmax(200px,2fr)_minmax(140px,1.2fr)_minmax(160px,1.4fr)_minmax(180px,1.6fr)_minmax(140px,1fr)_minmax(120px,1fr)_minmax(140px,1fr)_60px]'

const ongoingSchedules = [
  {
    id: 'eu-monthly-rebal',
    name: 'Europe monthly',
    createdDate: '24/02/2026',
    createdTime: '09:14',
    createdBy: 'Adil',
    movementType: 'Rebalancing',
    warehouse: 'Log01 entrepot logtex',
    revenueIncrease: '€501.1K',
    uniqueTrips: 113,
    transferUnits: 2308,
  },
  {
    id: 'uk-weekly-replen',
    name: 'UK weekly replenishment',
    createdDate: '04/05/2026',
    createdTime: '07:30',
    createdBy: 'Bethsabée',
    movementType: 'Replenishment',
    warehouse: 'UK central DC',
    revenueIncrease: '€210.4K',
    uniqueTrips: 48,
    transferUnits: 1120,
  },
  {
    id: 'fr-weekly-rebal',
    name: 'France weekly rebal',
    createdDate: '02/05/2026',
    createdTime: '11:00',
    createdBy: 'Adil',
    movementType: 'Rebalancing',
    warehouse: 'Log01 entrepot logtex',
    revenueIncrease: '€87.2K',
    uniqueTrips: 24,
    transferUnits: 612,
  },
  {
    id: 'it-biweekly-both',
    name: 'Italy bi-weekly',
    createdDate: '01/05/2026',
    createdTime: '14:22',
    createdBy: 'Shana',
    movementType: 'Replenishment & Rebalancing',
    warehouse: 'Milan DC',
    revenueIncrease: '€134.8K',
    uniqueTrips: 39,
    transferUnits: 940,
  },
  {
    id: 'de-monthly-replen',
    name: 'Germany monthly replenishment',
    createdDate: '28/04/2026',
    createdTime: '08:45',
    createdBy: 'Bethsabée',
    movementType: 'Replenishment',
    warehouse: 'Berlin DC',
    revenueIncrease: '€76.5K',
    uniqueTrips: 18,
    transferUnits: 445,
  },
  {
    id: 'iberia-weekly-rebal',
    name: 'Iberia weekly rebal',
    createdDate: '25/04/2026',
    createdTime: '10:12',
    createdBy: 'Adil',
    movementType: 'Rebalancing',
    warehouse: 'Madrid DC',
    revenueIncrease: '€52.1K',
    uniqueTrips: 15,
    transferUnits: 388,
  },
]

const upcomingSchedules = [
  {
    id: 'upcoming-eu-rebal',
    name: 'Europe monthly',
    createdDate: '10/07/2026',
    createdTime: '09:00',
    createdBy: 'Adil',
    movementType: 'Rebalancing',
    warehouse: 'Log01 entrepot logtex',
    revenueIncrease: '—',
    uniqueTrips: '—',
    transferUnits: '—',
  },
  {
    id: 'upcoming-uk-replen',
    name: 'UK weekly replenishment',
    createdDate: '11/07/2026',
    createdTime: '07:30',
    createdBy: 'Bethsabée',
    movementType: 'Replenishment',
    warehouse: 'UK central DC',
    revenueIncrease: '—',
    uniqueTrips: '—',
    transferUnits: '—',
  },
  {
    id: 'upcoming-fr-rebal',
    name: 'France weekly rebal',
    createdDate: '11/07/2026',
    createdTime: '11:00',
    createdBy: 'Adil',
    movementType: 'Rebalancing',
    warehouse: 'Log01 entrepot logtex',
    revenueIncrease: '—',
    uniqueTrips: '—',
    transferUnits: '—',
  },
  {
    id: 'upcoming-it-both',
    name: 'Italy bi-weekly',
    createdDate: '15/07/2026',
    createdTime: '14:22',
    createdBy: 'Shana',
    movementType: 'Replenishment & Rebalancing',
    warehouse: 'Milan DC',
    revenueIncrease: '—',
    uniqueTrips: '—',
    transferUnits: '—',
  },
]

const failedSchedules = [
  {
    id: 'failed-de-replen',
    name: 'Germany monthly replenishment',
    createdDate: '05/07/2026',
    createdTime: '08:45',
    createdBy: 'Bethsabée',
    movementType: 'Replenishment',
    warehouse: 'Berlin DC',
    revenueIncrease: '—',
    uniqueTrips: '—',
    transferUnits: '—',
  },
  {
    id: 'failed-iberia-rebal',
    name: 'Iberia weekly rebal',
    createdDate: '04/07/2026',
    createdTime: '10:12',
    createdBy: 'Adil',
    movementType: 'Rebalancing',
    warehouse: 'Madrid DC',
    revenueIncrease: '—',
    uniqueTrips: '—',
    transferUnits: '—',
  },
]

const submittedSchedules = [
  {
    id: 'submitted-eu-rebal-jun',
    name: 'Europe monthly',
    createdDate: '24/06/2026',
    createdTime: '09:14',
    createdBy: 'Adil',
    movementType: 'Rebalancing',
    warehouse: 'Log01 entrepot logtex',
    revenueIncrease: '€478.9K',
    uniqueTrips: 108,
    transferUnits: 2214,
  },
  {
    id: 'submitted-uk-replen-jun',
    name: 'UK weekly replenishment',
    createdDate: '20/06/2026',
    createdTime: '07:30',
    createdBy: 'Bethsabée',
    movementType: 'Replenishment',
    warehouse: 'UK central DC',
    revenueIncrease: '€198.2K',
    uniqueTrips: 44,
    transferUnits: 1052,
  },
  {
    id: 'submitted-fr-rebal-jun',
    name: 'France weekly rebal',
    createdDate: '18/06/2026',
    createdTime: '11:00',
    createdBy: 'Adil',
    movementType: 'Rebalancing',
    warehouse: 'Log01 entrepot logtex',
    revenueIncrease: '€79.4K',
    uniqueTrips: 22,
    transferUnits: 578,
  },
  {
    id: 'submitted-de-replen-jun',
    name: 'Germany monthly replenishment',
    createdDate: '15/06/2026',
    createdTime: '08:45',
    createdBy: 'Bethsabée',
    movementType: 'Replenishment',
    warehouse: 'Berlin DC',
    revenueIncrease: '€68.7K',
    uniqueTrips: 16,
    transferUnits: 412,
  },
  {
    id: 'submitted-iberia-rebal-jun',
    name: 'Iberia weekly rebal',
    createdDate: '12/06/2026',
    createdTime: '10:12',
    createdBy: 'Adil',
    movementType: 'Rebalancing',
    warehouse: 'Madrid DC',
    revenueIncrease: '€49.3K',
    uniqueTrips: 14,
    transferUnits: 361,
  },
]

const ALL_SCHEDULE_LISTS = [
  ...ongoingSchedules,
  ...upcomingSchedules,
  ...failedSchedules,
  ...submittedSchedules,
]

function formatScheduleMetric(value) {
  return typeof value === 'number' ? value.toLocaleString() : value
}

function ScheduleTable({
  schedules,
  onRowClick,
  scheduleNames,
  setScheduleNames,
  openKebabId,
  setOpenKebabId,
  renamingId,
  setRenamingId,
  renameDraft,
  setRenameDraft,
  actions = ['rename', 'rerun', 'archive'],
}) {
  const isClickable = Boolean(onRowClick)

  const renderKebabAction = (action, schedule) => {
    const buttonClass = 'w-full px-3 py-2 text-left text-[14px] text-[#0a0a0a] hover:bg-[#F8F8F8]'
    if (action === 'rename') {
      return (
        <button
          key="rename"
          type="button"
          className={buttonClass}
          onClick={() => {
            setRenamingId(schedule.id)
            setRenameDraft(scheduleNames[schedule.id] ?? schedule.name)
            setOpenKebabId(null)
          }}
        >
          Rename
        </button>
      )
    }
    if (action === 'rerun') {
      return (
        <button
          key="rerun"
          type="button"
          className={buttonClass}
          onClick={() => setOpenKebabId(null)}
        >
          Rerun
        </button>
      )
    }
    if (action === 'archive') {
      return (
        <button
          key="archive"
          type="button"
          className={buttonClass}
          onClick={() => setOpenKebabId(null)}
        >
          Archive
        </button>
      )
    }
    return null
  }

  return (
    <>
      {openKebabId && (
        <div
          role="presentation"
          className="fixed inset-0 z-20"
          onClick={() => setOpenKebabId(null)}
          aria-hidden
        />
      )}
      <div className="mt-6 rounded-[4px] border border-[#EAEAEA] bg-white">
        <div
          className={`grid ${ONGOING_TABLE_GRID} gap-4 border-b border-[#EAEAEA] bg-[#F8F8F8] px-5 py-3 text-[12px] font-medium uppercase tracking-[0.04em] text-[#4b535c]`}
        >
          <span>Batch name</span>
          <span>Created</span>
          <span>Movement type</span>
          <span>Warehouse</span>
          <span>Revenue increase</span>
          <span>Unique trips</span>
          <span>Transfer units</span>
          <span />
        </div>
        {schedules.map((schedule) => {
          const displayName = scheduleNames[schedule.id] ?? schedule.name
          return (
            <div
              key={schedule.id}
              className={`grid ${ONGOING_TABLE_GRID} gap-4 border-b border-[#EAEAEA] px-5 py-4 text-[14px] text-[#0a0a0a] transition-colors last:border-b-0${isClickable ? ' cursor-pointer hover:bg-[#FAFAFA]' : ''}`}
              onClick={isClickable ? () => onRowClick(schedule) : undefined}
            >
              <div className="min-w-0 font-medium">
                {renamingId === schedule.id ? (
                  <input
                    type="text"
                    value={renameDraft}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setRenameDraft(e.target.value)}
                    onBlur={() => {
                      setScheduleNames((prev) => ({ ...prev, [schedule.id]: renameDraft }))
                      setRenamingId(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setScheduleNames((prev) => ({ ...prev, [schedule.id]: renameDraft }))
                        setRenamingId(null)
                      } else if (e.key === 'Escape') {
                        setRenamingId(null)
                      }
                    }}
                    className="h-8 w-full rounded-[4px] border border-[#EAEAEA] px-2 text-[14px] text-[#0a0a0a] focus:border-[#1d4ed8] focus:outline-none"
                  />
                ) : (
                  <span className="block truncate">{displayName}</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[14px] text-[#0a0a0a]">
                  {schedule.createdDate}, {schedule.createdTime}
                </div>
                <div className="text-[12px] text-[#4b535c]">{schedule.createdBy}</div>
              </div>
              <div className="min-w-0 truncate">{schedule.movementType}</div>
              <div className="min-w-0 truncate">{schedule.warehouse}</div>
              <div className="min-w-0 truncate">{schedule.revenueIncrease}</div>
              <div className="min-w-0">{formatScheduleMetric(schedule.uniqueTrips)}</div>
              <div className="min-w-0">{formatScheduleMetric(schedule.transferUnits)}</div>
              <div
                className="relative flex items-center justify-end"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  aria-label="Row actions"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenKebabId(openKebabId === schedule.id ? null : schedule.id)
                  }}
                  className="flex size-8 items-center justify-center rounded-[4px] text-[#4b535c] hover:bg-[#F3F4F6] hover:text-[#0a0a0a]"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <circle cx="8" cy="3" r="1.5" fill="currentColor" />
                    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                    <circle cx="8" cy="13" r="1.5" fill="currentColor" />
                  </svg>
                </button>
                {openKebabId === schedule.id && (
                  <div className="absolute right-0 top-full z-30 mt-1 w-[160px] rounded-[4px] border border-[#EAEAEA] bg-white py-1 shadow-[0px_8px_25px_0px_rgba(0,0,0,0.12)]">
                    {actions.map((action) => renderKebabAction(action, schedule))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export default function OptimiserPage({ onAddJob, openAddJob, resetToUpcoming, openCreateSchedulePage, resetToRecommendationsLanding, onOpenScheduleDetail }) {
  const [activeStatusTab, setActiveStatusTab] = useState('ongoing')
  const [openKebabId, setOpenKebabId] = useState(null)
  const [renamingId, setRenamingId] = useState(null)
  const [renameDraft, setRenameDraft] = useState('')
  const [scheduleNames, setScheduleNames] = useState(() =>
    Object.fromEntries(ALL_SCHEDULE_LISTS.map((s) => [s.id, s.name]))
  )
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
  const statusTabs = [
    { id: 'ongoing', label: 'Ongoing' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'failed', label: 'Failed' },
    { id: 'submitted', label: 'Submitted' },
  ]

  useEffect(() => {
    if (!openAddJob) return
    if (onAddJob) onAddJob()
  }, [openAddJob, onAddJob])

  useEffect(() => {
    if (!resetToUpcoming) return
    setActiveStatusTab('ongoing')
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

  const sharedKebabProps = {
    scheduleNames,
    setScheduleNames,
    openKebabId,
    setOpenKebabId,
    renamingId,
    setRenamingId,
    renameDraft,
    setRenameDraft,
  }

  return (
    <div className="flex flex-col gap-0">
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
        <ScheduleTable schedules={upcomingSchedules} actions={['rename', 'archive']} {...sharedKebabProps} />
      ) : activeStatusTab === 'ongoing' ? (
        <ScheduleTable
          schedules={ongoingSchedules}
          onRowClick={onOpenScheduleDetail}
          {...sharedKebabProps}
        />
      ) : activeStatusTab === 'failed' ? (
        <ScheduleTable schedules={failedSchedules} actions={['rename', 'rerun', 'archive']} {...sharedKebabProps} />
      ) : activeStatusTab === 'submitted' ? (
        <ScheduleTable schedules={submittedSchedules} actions={['rerun']} {...sharedKebabProps} />
      ) : null}
    </div>
  )
}
