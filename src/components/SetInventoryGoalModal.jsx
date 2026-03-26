import { useEffect, useRef, useState } from 'react'
import {
  X,
  ClipboardList,
  Flag,
  LayoutGrid,
  BarChart3,
  TrendingUp,
  Cloud,
  Target,
  ShieldCheck,
  ChevronRight,
  Info,
  Crosshair,
} from 'lucide-react'

const GOAL_TYPES = [
  { id: 'availability', label: 'Improve availability', Icon: BarChart3 },
  { id: 'revenue', label: 'Increase revenue', Icon: TrendingUp },
  { id: 'overstock', label: 'Minimize overstock', Icon: Cloud },
  { id: 'custom', label: 'Custom goal', Icon: Target },
]

export default function SetInventoryGoalModal({ open, onClose, onCreate }) {
  const panelRef = useRef(null)
  const [goalName, setGoalName] = useState('Reduce stockouts in EU stores')
  const [goalTypeId, setGoalTypeId] = useState('availability')
  const [goalTypeOpen, setGoalTypeOpen] = useState(false)
  const [coverageEnabled, setCoverageEnabled] = useState(true)
  const [coverMin, setCoverMin] = useState(5)
  const [coverMax, setCoverMax] = useState(10)
  const [safetyStock, setSafetyStock] = useState(true)
  const [limitSuppliers, setLimitSuppliers] = useState(true)

  const selectedType = GOAL_TYPES.find((g) => g.id === goalTypeId) ?? GOAL_TYPES[0]
  const SelectedIcon = selectedType.Icon

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  const handleSubmit = () => {
    onCreate?.({
      goalName,
      goalTypeId,
      coverageEnabled,
      coverMin,
      coverMax,
      safetyStock,
      limitSuppliers,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="set-inventory-goal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="relative flex max-h-[min(90vh,880px)] w-full max-w-[560px] flex-col overflow-hidden rounded-[12px] bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#eaeaea] px-6 py-4">
          <h2 id="set-inventory-goal-title" className="text-[18px] font-semibold text-[#0a0a0a]">
            Set Inventory Goal
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-[4px] text-[#6b7280] hover:bg-[#f3f4f6]"
            aria-label="Close"
          >
            <X className="size-5" strokeWidth={2} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[15px] font-medium text-[#0a0a0a]">
              <ClipboardList className="size-5 shrink-0 text-[#6b7280]" strokeWidth={1.75} aria-hidden />
              1. Name your goal
            </div>
            <input
              type="text"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              className="w-full rounded-[4px] border border-[#e5e7eb] bg-white px-3 py-2.5 text-[14px] text-[#0a0a0a] outline-none ring-[#0267ff] placeholder:text-[#9ca3af] focus:border-[#0267ff] focus:ring-1"
              placeholder="e.g. Reduce stockouts in EU stores"
            />
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[13px] font-medium text-[#374151]">
                <LayoutGrid className="size-4 text-[#6b7280]" strokeWidth={1.75} aria-hidden />
                Goal type
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setGoalTypeOpen((o) => !o)}
                  className="flex w-full items-center justify-between gap-2 rounded-[4px] border border-[#e5e7eb] bg-white px-3 py-2.5 text-left text-[14px] text-[#0a0a0a] hover:border-[#d1d5db]"
                  aria-expanded={goalTypeOpen}
                  aria-haspopup="listbox"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <SelectedIcon className="size-4 shrink-0 text-[#6b7280]" strokeWidth={1.75} />
                    <span className="truncate">{selectedType.label}</span>
                  </span>
                  <ChevronRight
                    className={`size-4 shrink-0 text-[#9ca3af] transition-transform ${goalTypeOpen ? 'rotate-90' : ''}`}
                    aria-hidden
                  />
                </button>
                {goalTypeOpen && (
                  <ul
                    className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-auto rounded-[4px] border border-[#e5e7eb] bg-white py-1 shadow-lg"
                    role="listbox"
                  >
                    {GOAL_TYPES.map((g) => {
                      const RowIcon = g.Icon
                      return (
                      <li key={g.id} role="option" aria-selected={g.id === goalTypeId}>
                        <button
                          type="button"
                          onClick={() => {
                            setGoalTypeId(g.id)
                            setGoalTypeOpen(false)
                          }}
                          className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-[14px] hover:bg-[#f9fafb] ${
                            g.id === goalTypeId ? 'bg-[#eff6ff] text-[#0267ff]' : 'text-[#0a0a0a]'
                          }`}
                        >
                          <RowIcon className="size-4 shrink-0" strokeWidth={1.75} />
                          {g.label}
                        </button>
                      </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </div>
          </section>

          <section className="mt-8 flex flex-col gap-4 border-t border-[#f3f4f6] pt-8">
            <div className="flex items-center gap-2 text-[15px] font-medium text-[#0a0a0a]">
              <Flag className="size-5 shrink-0 text-red-500" strokeWidth={1.75} aria-hidden />
              2. Set targets &amp; preferences
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#374151]">
                What specific outcome do you want?
                <button type="button" className="text-[#9ca3af] hover:text-[#6b7280]" aria-label="More info">
                  <Info className="size-3.5" strokeWidth={2} />
                </button>
              </div>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 rounded-[6px] border border-[#bfdbfe] bg-[#eff6ff] px-3 py-3 text-left transition-colors hover:bg-[#dbeafe]"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <ShieldCheck className="size-4" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="text-[13px] font-medium text-[#0a0a0a]">
                    Avoid stockouts across EU stores (Recommended)
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-[#0267ff]" aria-hidden />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#374151]">
                What key preferences should we consider?
                <button type="button" className="text-[#9ca3af] hover:text-[#6b7280]" aria-label="More info">
                  <Info className="size-3.5" strokeWidth={2} />
                </button>
              </div>

              <div className="rounded-[6px] border border-[#e5e7eb] bg-[#fafafa] p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-[14px] font-medium text-[#0a0a0a]">
                    <Crosshair className="size-4 text-[#6b7280]" strokeWidth={1.75} aria-hidden />
                    Coverage
                  </span>
                  <Toggle checked={coverageEnabled} onChange={setCoverageEnabled} />
                </div>

                {coverageEnabled && (
                  <div className="mt-4 space-y-4 border-t border-[#e5e7eb] pt-4 pl-1">
                    <p className="text-[13px] text-[#6b7280]">
                      Maintain stock level between days of cover
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[13px]">
                      <input
                        type="number"
                        min={1}
                        max={90}
                        value={coverMin}
                        onChange={(e) => setCoverMin(Number(e.target.value) || 0)}
                        className="w-14 rounded border border-[#e5e7eb] bg-white px-2 py-1 text-center font-medium tabular-nums text-[#0a0a0a]"
                      />
                      <span className="text-[#9ca3af]">—</span>
                      <div className="relative mx-1 h-1.5 min-w-[120px] flex-1 rounded-full bg-[#e5e7eb]">
                        <span
                          className="absolute left-1/2 top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#0267ff] shadow"
                          aria-hidden
                        />
                      </div>
                      <span className="text-[#9ca3af]">—</span>
                      <input
                        type="number"
                        min={1}
                        max={90}
                        value={coverMax}
                        onChange={(e) => setCoverMax(Number(e.target.value) || 0)}
                        className="w-14 rounded border border-[#e5e7eb] bg-white px-2 py-1 text-center font-medium tabular-nums text-[#0a0a0a]"
                      />
                      <span className="text-[#6b7280]">days</span>
                    </div>

                    <PrefRow
                      label="Include safety stock"
                      checked={safetyStock}
                      onChange={setSafetyStock}
                    />
                    <PrefRow
                      label="Limit reordering to existing suppliers"
                      checked={limitSuppliers}
                      onChange={setLimitSuppliers}
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[#eaeaea] bg-[#fafafa] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-[4px] border border-[#e5e7eb] bg-white px-4 text-[14px] font-medium text-[#374151] transition-colors hover:bg-[#f9fafb]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex h-10 items-center justify-center gap-1 rounded-[4px] bg-[#0267ff] px-4 text-[14px] font-medium text-white transition-colors hover:bg-[#0252cc]"
          >
            Create goal
            <ChevronRight className="size-4" strokeWidth={2} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-emerald-500' : 'bg-[#d1d5db]'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

function PrefRow({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5 text-[13px] text-[#0a0a0a]">
        {label}
        <button type="button" className="text-[#9ca3af] hover:text-[#6b7280]" aria-label="More info">
          <Info className="size-3.5" strokeWidth={2} />
        </button>
      </span>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}
