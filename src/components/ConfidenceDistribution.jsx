/**
 * Shared Products / Explorer confidence distribution bar + hover breakdown.
 * Unknown grey reuses muted/inactive #9ca3af (stale text / filter-greyed metrics).
 */

export const CONFIDENCE_BUCKET_ORDER = [
  { key: 'high', label: 'High', color: '#22c55e' },
  { key: 'medium', label: 'Medium', color: '#f59e0b' },
  { key: 'low', label: 'Low', color: '#f87171' },
  { key: 'unknown', label: 'Unknown', color: '#9ca3af' },
]

export function emptyConfidenceBuckets() {
  return { high: 0, medium: 0, low: 0, unknown: 0 }
}

/** Proportional segments; zero-count buckets omitted. */
export function ConfidenceBucketBar({ buckets, muted = false }) {
  const segments = CONFIDENCE_BUCKET_ORDER.filter((b) => (Number(buckets?.[b.key]) || 0) > 0)
  // Explicit width required: TuHoverPopover wraps in inline-block, so w-full + flex-grow-only
  // children collapse to ~0px (no intrinsic width to resolve against).
  const barStyle = {
    width: 108,
    height: 14,
    minHeight: 14,
    ...(muted ? { opacity: 0.45, filter: 'grayscale(1)' } : null),
  }
  if (segments.length === 0) {
    return (
      <div
        className="rounded-full border border-[#e5e7eb] bg-[#f3f4f6]"
        style={barStyle}
        aria-hidden
      />
    )
  }
  return (
    <div
      className="flex overflow-hidden rounded-full border border-[#e5e7eb]"
      style={barStyle}
      role="img"
      aria-label="Confidence distribution"
    >
      {segments.map((b) => (
        <div
          key={b.key}
          className="h-full min-w-0"
          style={{
            flexGrow: Number(buckets[b.key]) || 0,
            flexBasis: 0,
            backgroundColor: b.color,
          }}
        />
      ))}
    </div>
  )
}

/** high/med/low always (incl. zeros); Unknown row + explanation only when count > 0. */
export function ConfidenceBreakdownHoverCard({ buckets }) {
  const unknownCount = Number(buckets?.unknown) || 0
  const showUnknown = unknownCount > 0
  return (
    <div className="pointer-events-none w-[min(280px,calc(100vw-1.5rem))] rounded-[8px] border border-[#E9EAEB] bg-white p-3 shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
      <div className="mb-2.5 text-[13px] font-semibold text-[#0a0a0a]">Confidence breakdown</div>
      <div className="flex flex-col gap-2">
        {CONFIDENCE_BUCKET_ORDER.map((b) => {
          const count = Number(buckets?.[b.key]) || 0
          if (b.key === 'unknown' && count <= 0) return null
          const unitWord = count === 1 ? 'unit' : 'units'
          return (
            <div key={b.key} className="flex items-center gap-2 text-[12px]">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: b.color }}
                aria-hidden
              />
              <span className="min-w-0 tabular-nums text-[#0a0a0a]">
                {count} {unitWord} {b.label.toLowerCase()} confidence
              </span>
            </div>
          )
        })}
      </div>
      {showUnknown && (
        <p className="mt-2.5 text-[11px] leading-snug text-[#9ca3af]">
          Unknown: units added above the recommendation — beyond the solver&apos;s modelled range.
        </p>
      )}
    </div>
  )
}
