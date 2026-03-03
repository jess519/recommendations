import { useState } from 'react'
import { IconClose, IconChevronDownSelect, IconArrowLeft, IconInfo, IconChevronRight, IconWarning } from './icons'

const DEFAULT_FORM = {
  replenishmentName: '',
  runWhen: 'now',
  repeatsOption: 'does-not-repeat',
  sourceLocation: 'ls-chez-nx',
  countries: [],
  autoSubmit1: { on: false, value: '' },
  autoSubmit2: { on: false, value1: '', value2: '' },
  autoSubmit3: { on: false },
  review1: { on: false, value: '' },
  review2: { on: false, value: '' },
}
const COUNTRY_OPTIONS = [
  { value: 'belgique', label: 'Belgique', showInfo: true },
  { value: 'france', label: 'France', showInfo: false },
  { value: 'luxembourg', label: 'Luxembourg', showInfo: false },
]
const REPEATS_OPTIONS = [
  { value: 'does-not-repeat', label: 'Does not repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
]

function RuleRow({ label, unitLabel, suffix = '', checked, onToggle, value = '', onValueChange, secondValue = '', onSecondValueChange, secondSuffix = '', noInput = false }) {
  const numInputClass = 'w-16 h-9 px-2 rounded-[4px] border border-[#dde4ee] bg-white text-[14px] text-[#0a0a0a] text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onToggle(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-[#0267ff]' : 'bg-[#e5e7eb]'}`}
      >
        <span className={`inline-block size-5 rounded-full bg-white shadow transition-transform translate-y-0.5 ${checked ? 'translate-x-6' : 'translate-x-0.5'}`} />
      </button>
      <span className="font-sans text-[14px] text-[#0a0a0a]">
        {label}
        {!noInput && (
          <>
            {' '}
            <input
              type="number"
              min={0}
              placeholder="X"
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              className={numInputClass}
            />
            {unitLabel && ` ${unitLabel}`}
          </>
        )}
        {suffix && suffix}
        {onSecondValueChange != null && (
          <>
            {' '}
            <input
              type="number"
              min={0}
              placeholder="X"
              value={secondValue}
              onChange={(e) => onSecondValueChange(e.target.value)}
              className={numInputClass}
            />
            {secondSuffix}
          </>
        )}
      </span>
    </div>
  )
}

function SearchableSelect({ label, placeholder = 'search...', showInfo = false, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-1">
        <label className="font-sans text-[14px] font-medium text-[#0a0a0a]">{label}</label>
        {showInfo && (
          <button type="button" className="p-0.5 text-[#4b535c] hover:text-[#0a0a0a]" aria-label="More information">
            <IconInfo className="size-4" />
          </button>
        )}
      </div>
      <button
        type="button"
        className="w-full h-10 flex items-center justify-between gap-2 px-3 rounded-[4px] border border-[#dde4ee] bg-white text-[14px] text-left text-[#4b535c]"
      >
        <span>{placeholder}</span>
        <IconChevronDownSelect />
      </button>
    </div>
  )
}

function MultiSelect({ label, showInfo = false, options, value = [], onChange, placeholder = 'search...', className = '' }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const filtered = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
  const unselectedCount = filtered.filter((o) => !value.includes(o.value)).length
  const toggle = (v) => {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
  }
  const selectAll = () => {
    const toAdd = filtered.filter((o) => !value.includes(o.value)).map((o) => o.value)
    onChange([...value, ...toAdd])
  }
  const remove = (v, e) => {
    e.stopPropagation()
    onChange(value.filter((x) => x !== v))
  }
  const clearAll = (e) => {
    e.stopPropagation()
    onChange([])
  }
  return (
    <div className={`relative flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-1">
        <label className="font-sans text-[14px] font-medium text-[#0a0a0a]">{label}</label>
        {showInfo && (
          <button type="button" className="p-0.5 text-[#4b535c] hover:text-[#0a0a0a]" aria-label="More information">
            <IconInfo className="size-4" />
          </button>
        )}
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`w-full min-h-10 flex items-center flex-wrap gap-2 px-3 py-2 rounded-[4px] border bg-white text-[14px] text-left ${open ? 'border-[#0267ff] ring-1 ring-[#0267ff]' : 'border-[#dde4ee]'}`}
        >
          <span className="flex flex-wrap gap-1.5 items-center min-w-0 flex-1">
            {value.length === 0 ? (
              <span className="text-[#4b535c]">{placeholder}</span>
            ) : (
              value.map((v) => {
                const opt = options.find((o) => o.value === v)
                return opt ? (
                  <span
                    key={v}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ebf3ff] text-[#0267ff] text-[13px] shrink-0"
                  >
                    {opt.label}
                    <button type="button" onClick={(e) => remove(v, e)} className="p-0.5 -mr-0.5 rounded hover:bg-[#0267ff]/10 text-[#0267ff]" aria-label={`Remove ${opt.label}`}>
                      <IconClose className="size-3" />
                    </button>
                  </span>
                ) : null
              })
            )}
          </span>
          <span className="flex items-center gap-1 shrink-0">
            {value.length > 0 && (
              <button type="button" onClick={clearAll} className="p-1 text-[#4b535c] hover:text-[#0a0a0a] rounded" aria-label="Clear selection">
                <IconClose className="size-4" />
              </button>
            )}
            <span className={open ? 'rotate-180' : ''}>
              <IconChevronDownSelect />
            </span>
          </span>
        </button>
        {open && (
          <>
            <div role="presentation" className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} aria-hidden />
            <div className="absolute left-0 top-full mt-1 z-[70] w-full min-w-[200px] bg-white border border-[#e9eaeb] rounded-[4px] shadow-lg overflow-hidden">
              <div className="p-2 border-b border-[#e9eaeb]" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 px-2 rounded-[4px] border border-[#e9eaeb] bg-[#f8f8f8] text-[14px] text-[#0a0a0a] placeholder:text-[#4b535c] outline-none focus:border-[#0267ff]"
                />
              </div>
              {unselectedCount > 0 && (
                <button
                  type="button"
                  onClick={selectAll}
                  className="w-full text-left px-3 py-2 text-[14px] text-[#0267ff] hover:bg-[#ebf3ff]"
                >
                  Select all {unselectedCount} options
                </button>
              )}
              <div className="max-h-[200px] overflow-y-auto py-1">
                {filtered.map((opt) => {
                  const selected = value.includes(opt.value)
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggle(opt.value)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left text-[14px] ${selected ? 'bg-[#ebf3ff] text-[#0a0a0a]' : 'text-[#0a0a0a] hover:bg-[#f8f8f8]'}`}
                    >
                      <span className={`flex items-center justify-center shrink-0 size-5 rounded border-2 ${selected ? 'border-[#0267ff] bg-[#0267ff]' : 'border-[#e5e7eb] bg-white'}`}>
                        {selected && (
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="text-white">
                            <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span className="flex-1 min-w-0">{opt.label}</span>
                      {opt.showInfo && <IconInfo className="size-4 text-[#4b535c] shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function AddScheduleDrawer({ open, onClose }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [repeatsDropdownOpen, setRepeatsDropdownOpen] = useState(false)
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(false)

  const handleClose = () => {
    setForm(DEFAULT_FORM)
    setStep(1)
    setRepeatsDropdownOpen(false)
    setAdvancedOptionsOpen(false)
    onClose()
  }
  const canContinueToScope = Boolean(form.replenishmentName?.trim())
  const canContinueToAutoSubmit = form.countries?.length > 0

  if (!open) return null

  return (
    <>
      {/* Overlay – Figma 214:3097 */}
      <div
        role="presentation"
        className="fixed inset-0 z-40 bg-[rgba(0,0,0,0.2)] transition-opacity duration-200"
        onClick={handleClose}
        aria-hidden
      />
      {/* Slide-out panel – Figma 214:3369 */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[800px] bg-white flex flex-col rounded-tl-[8px] rounded-bl-[8px] shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.12)] animate-slide-in-right"
        role="dialog"
        aria-modal
        aria-label="Add Schedule"
        data-name="Add Schedule"
        data-node-id="214:3369"
      >
        <header className="flex items-center justify-end shrink-0 h-14 px-4 border-b border-[#e9eaeb]">
          <button
            type="button"
            onClick={handleClose}
            className="p-2 -mr-2 text-[#4b535c] hover:bg-[#f3f4f6] rounded-[4px]"
            aria-label="Close"
          >
            <IconClose />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          {step === 1 && (
          <>
          {/* Step 1 of 3 – New replenishment */}
          <section className="flex flex-col gap-6">
            <div className="h-1 w-full rounded-full bg-[#e5e7eb] overflow-hidden">
              <div className="h-full w-1/3 rounded-full bg-[#0267ff]" aria-hidden />
            </div>
            <p className="font-sans text-[14px] text-[#4b535c]">Step 1 of 3</p>
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1 min-w-0">
                <h2 className="font-sans text-[32px] font-bold text-[#0a0a0a] leading-tight">New replenishment</h2>
                <p className="font-sans text-[16px] text-[#4b535c]">Select the name and type of replenishment to be created.</p>
              </div>
              <button
                type="button"
                disabled={!canContinueToScope}
                onClick={() => setStep(2)}
                className="shrink-0 h-12 px-4 rounded-[4px] text-[16px] font-medium disabled:bg-[#f0f0f0] disabled:text-[#4b535c] bg-[#0267ff] text-white hover:bg-[#0252cc] disabled:hover:bg-[#f0f0f0] disabled:hover:text-[#4b535c]"
              >
                Continue to scope selection
              </button>
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-sans text-[14px] font-medium text-[#0a0a0a]">Replenishment name</label>
                <input
                  type="text"
                  placeholder="e.g. Europe Leather Goods"
                  value={form.replenishmentName}
                  onChange={(e) => setForm((f) => ({ ...f, replenishmentName: e.target.value }))}
                  className="w-full h-10 px-3 rounded-[4px] border border-[#dde4ee] bg-white text-[14px] text-[#0a0a0a] placeholder:text-[#2f3a4c]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-sans text-[14px] font-medium text-[#0a0a0a]">Run replenishment</label>
                <div className="flex gap-3">
                  <label className="flex-1 flex items-center gap-2 h-10 px-3 rounded-[4px] border border-[#dde4ee] bg-white cursor-pointer has-[:checked]:border-[#0267ff] has-[:checked]:ring-1 has-[:checked]:ring-[#0267ff]">
                    <input
                      type="radio"
                      name="runWhen"
                      value="now"
                      checked={form.runWhen === 'now'}
                      onChange={() => setForm((f) => ({ ...f, runWhen: 'now' }))}
                      className="size-4 border-2 border-[#e5e7eb] text-[#0267ff] focus:ring-[#0267ff]"
                    />
                    <span className="font-sans text-[14px] text-[#0a0a0a]">Now</span>
                  </label>
                  <label className="flex-1 flex items-center gap-2 h-10 px-3 rounded-[4px] border border-[#dde4ee] bg-white cursor-pointer has-[:checked]:border-[#0267ff] has-[:checked]:ring-1 has-[:checked]:ring-[#0267ff]">
                    <input
                      type="radio"
                      name="runWhen"
                      value="future"
                      checked={form.runWhen === 'future'}
                      onChange={() => setForm((f) => ({ ...f, runWhen: 'future' }))}
                      className="size-4 border-2 border-[#e5e7eb] text-[#0267ff] focus:ring-[#0267ff]"
                    />
                    <span className="font-sans text-[14px] text-[#0a0a0a]">Future</span>
                  </label>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-sans text-[14px] font-medium text-[#0a0a0a]">Repeats</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRepeatsDropdownOpen((o) => !o)}
                    className="w-full h-10 flex items-center justify-between gap-2 px-3 rounded-[4px] border border-[#dde4ee] bg-white text-[14px] text-left text-[#0a0a0a]"
                  >
                    <span>{REPEATS_OPTIONS.find((o) => o.value === form.repeatsOption)?.label ?? 'Does not repeat'}</span>
                    <IconChevronDownSelect />
                  </button>
                  {repeatsDropdownOpen && (
                    <>
                      <div role="presentation" className="fixed inset-0 z-[60]" onClick={() => setRepeatsDropdownOpen(false)} aria-hidden />
                      <div className="absolute left-0 top-full mt-1 z-[70] w-full min-w-[200px] bg-white border border-[#e9eaeb] rounded-[4px] py-1 shadow-lg">
                        {REPEATS_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setForm((f) => ({ ...f, repeatsOption: opt.value }))
                              setRepeatsDropdownOpen(false)
                            }}
                            className="w-full flex items-center px-3 py-2 text-left text-[14px] text-[#0a0a0a] hover:bg-[#f8f8f8]"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>
          </>
          )}

          {step === 2 && (
          <section className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center justify-center size-10 rounded-[4px] text-[#0a0a0a] hover:bg-[#f3f4f6]"
                aria-label="Back"
              >
                <IconArrowLeft />
              </button>
              <span className="font-sans text-[14px] text-[#4b535c]">Step 2 of 3</span>
            </div>
            <div className="h-1 w-full rounded-full bg-[#e5e7eb] overflow-hidden">
              <div className="h-full w-2/3 rounded-full bg-[#0267ff]" aria-hidden />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1 min-w-0">
                <h2 className="font-sans text-[32px] font-bold text-[#0a0a0a] leading-tight">Scope selection</h2>
                <p className="font-sans text-[16px] text-[#4b535c]">Choose which locations and products you want to impact.</p>
              </div>
              <button
                type="button"
                disabled={!canContinueToAutoSubmit}
                onClick={() => setStep(3)}
                className="shrink-0 h-12 px-4 rounded-[4px] text-[16px] font-medium disabled:bg-[#f0f0f0] disabled:text-[#4b535c] bg-[#0267ff] text-white hover:bg-[#0252cc] disabled:hover:bg-[#f0f0f0] disabled:hover:text-[#4b535c]"
              >
                Continue to auto-submit rules
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="font-sans text-[16px] font-medium text-[#0a0a0a]">Select your source location</h3>
              <p className="font-sans text-[14px] text-[#4b535c]">This is the location your products will be distributed from.</p>
              <div className="flex gap-3">
                <label className="flex-1 flex items-center gap-2 h-10 px-3 rounded-[4px] border border-[#dde4ee] bg-white cursor-pointer has-[:checked]:border-[#0267ff] has-[:checked]:ring-1 has-[:checked]:ring-[#0267ff]">
                  <input
                    type="radio"
                    name="sourceLocation"
                    value="ls-chez-nx"
                    checked={form.sourceLocation === 'ls-chez-nx'}
                    onChange={() => setForm((f) => ({ ...f, sourceLocation: 'ls-chez-nx' }))}
                    className="size-4 border-2 border-[#e5e7eb] text-[#0267ff] focus:ring-[#0267ff]"
                  />
                  <span className="font-sans text-[14px] text-[#0a0a0a]">Ls chez nx logistics</span>
                </label>
                <label className="flex-1 flex items-center gap-2 h-10 px-3 rounded-[4px] border border-[#dde4ee] bg-white cursor-pointer has-[:checked]:border-[#0267ff] has-[:checked]:ring-1 has-[:checked]:ring-[#0267ff]">
                  <input
                    type="radio"
                    name="sourceLocation"
                    value="supplier"
                    checked={form.sourceLocation === 'supplier'}
                    onChange={() => setForm((f) => ({ ...f, sourceLocation: 'supplier' }))}
                    className="size-4 border-2 border-[#e5e7eb] text-[#0267ff] focus:ring-[#0267ff]"
                  />
                  <span className="font-sans text-[14px] text-[#0a0a0a]">Supplier</span>
                  <IconInfo className="size-4 text-[#4b535c] shrink-0" />
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="font-sans text-[16px] font-medium text-[#0a0a0a]">Select your geographic scope</h3>
              <p className="font-sans text-[14px] text-[#f97316]">Make a selection first</p>
              <div className="grid grid-cols-2 gap-4">
                <SearchableSelect label="Location types" showInfo />
                <MultiSelect
                  label="Countries"
                  showInfo
                  options={COUNTRY_OPTIONS}
                  value={form.countries}
                  onChange={(countries) => setForm((f) => ({ ...f, countries }))}
                />
                <SearchableSelect label="Regions" showInfo />
                <SearchableSelect label="Locations" showInfo />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="font-sans text-[16px] font-medium text-[#0a0a0a]">Select your product scope</h3>
              <p className="font-sans text-[14px] text-[#f97316]">Make a selection first</p>
              <div className="grid grid-cols-2 gap-4">
                <SearchableSelect label="Departments" />
                <SearchableSelect label="Sub-departments" />
                <SearchableSelect label="Collection types" />
                <SearchableSelect label="Seasons" />
                <SearchableSelect label="Events" />
                <SearchableSelect label="Classes" />
                <SearchableSelect label="Products :" className="col-span-2" />
              </div>
            </div>

            <div className="flex flex-col gap-0">
              <button
                type="button"
                onClick={() => setAdvancedOptionsOpen((o) => !o)}
                className="flex items-center justify-between w-full py-2 text-left font-sans text-[16px] font-medium text-[#0a0a0a] hover:bg-[#f8f8f8] rounded-[4px] px-1 -mx-1"
              >
                Advanced options
                <span className={`shrink-0 transition-transform ${advancedOptionsOpen ? 'rotate-180' : ''}`}>
                  <IconChevronRight className="size-5 rotate-[-90deg]" />
                </span>
              </button>
              {advancedOptionsOpen && (
                <div className="pt-2 text-[14px] text-[#4b535c]">
                  Additional settings can be configured here.
                </div>
              )}
            </div>
          </section>
          )}

          {step === 3 && (
          <section className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center justify-center size-10 rounded-[4px] text-[#0a0a0a] hover:bg-[#f3f4f6]"
                aria-label="Back"
              >
                <IconArrowLeft />
              </button>
              <span className="font-sans text-[14px] text-[#4b535c]">&lt; Step 3 of 3</span>
            </div>
            <div className="h-1 w-full rounded-full bg-[#e5e7eb] overflow-hidden">
              <div className="h-full w-full rounded-full bg-[#0267ff]" aria-hidden />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1 min-w-0">
                <h2 className="font-sans text-[32px] font-bold text-[#0a0a0a] leading-tight">Auto-submit rules</h2>
                <p className="font-sans text-[16px] text-[#4b535c]">Submit units that don&apos;t need to be reviewed, helping you review faster.</p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="shrink-0 h-12 px-4 rounded-[4px] text-[16px] font-medium bg-[#0267ff] text-white hover:bg-[#0252cc]"
              >
                Create my replenishment
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-2">
                <span className="flex items-center justify-center size-6 rounded-full bg-emerald-500 shrink-0 mt-0.5" aria-hidden>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white"><path d="M2 6l2.5 2.5L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <div className="flex flex-col gap-1 min-w-0">
                  <h3 className="font-sans text-[16px] font-medium text-[#0a0a0a]">Choose the scenarios you want to auto-submit</h3>
                  <p className="font-sans text-[14px] text-[#4b535c]">These will be submitted as soon as your replenishment is created, and cannot be edited.</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 pl-8">
                <RuleRow
                  label="SKU level: when recommended replenishment units ≤"
                  unitLabel="units"
                  suffix=", auto-submit the recommended replenishment units"
                  checked={form.autoSubmit1.on}
                  onToggle={(on) => setForm((f) => ({ ...f, autoSubmit1: { ...f.autoSubmit1, on } }))}
                  value={form.autoSubmit1.value}
                  onValueChange={(value) => setForm((f) => ({ ...f, autoSubmit1: { ...f.autoSubmit1, value } }))}
                />
                <RuleRow
                  label="SKU level: when recommended replenishment units ≥"
                  unitLabel="units"
                  suffix=", auto-submit"
                  checked={form.autoSubmit2.on}
                  onToggle={(on) => setForm((f) => ({ ...f, autoSubmit2: { ...f.autoSubmit2, on } }))}
                  value={form.autoSubmit2.value1}
                  onValueChange={(value1) => setForm((f) => ({ ...f, autoSubmit2: { ...f.autoSubmit2, value1 } }))}
                  secondValue={form.autoSubmit2.value2}
                  onSecondValueChange={(value2) => setForm((f) => ({ ...f, autoSubmit2: { ...f.autoSubmit2, value2 } }))}
                  secondSuffix=" units"
                />
                <RuleRow
                  label="SKU level: products in the discovery phase where 1-to-1 replenishment method applies"
                  checked={form.autoSubmit3.on}
                  onToggle={(on) => setForm((f) => ({ ...f, autoSubmit3: { ...f.autoSubmit3, on } }))}
                  noInput
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-2">
                <span className="flex items-center justify-center size-6 rounded-full bg-amber-400 shrink-0 mt-0.5" aria-hidden>
                  <IconWarning className="size-4 text-white" />
                </span>
                <div className="flex flex-col gap-1 min-w-0">
                  <h3 className="font-sans text-[16px] font-medium text-[#0a0a0a]">Choose the scenarios you want to review</h3>
                  <p className="font-sans text-[14px] text-[#4b535c]">We will always show these in your replenishment, and supersede auto-submit scenarios.</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 pl-8">
                <RuleRow
                  label="SKU level: when warehouse inventory after replenishment ≤"
                  unitLabel="weeks of warehouse coverage"
                  checked={form.review1.on}
                  onToggle={(on) => setForm((f) => ({ ...f, review1: { ...f.review1, on } }))}
                  value={form.review1.value}
                  onValueChange={(value) => setForm((f) => ({ ...f, review1: { ...f.review1, value } }))}
                />
                <RuleRow
                  label="SKU level: when warehouse inventory after all replenishments for at least one central size is ≤"
                  unitLabel="weeks of warehouse coverage"
                  suffix=", then don't auto-submit any size of the same product"
                  checked={form.review2.on}
                  onToggle={(on) => setForm((f) => ({ ...f, review2: { ...f.review2, on } }))}
                  value={form.review2.value}
                  onValueChange={(value) => setForm((f) => ({ ...f, review2: { ...f.review2, value } }))}
                />
              </div>
            </div>
          </section>
          )}
        </div>
        <footer className="flex items-center justify-between shrink-0 p-4 border-t border-[#e9eaeb]">
          <button
            type="button"
            onClick={handleClose}
            className="h-12 px-4 rounded-[4px] text-[16px] font-medium text-[#0a0a0a] hover:bg-[#f3f4f6]"
          >
            Cancel
          </button>
        </footer>
      </div>
    </>
  )
}
