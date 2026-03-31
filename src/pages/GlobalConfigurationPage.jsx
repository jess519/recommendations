import { useEffect, useState } from 'react'
import { IconCircleCheck, IconClose, IconInfo } from '../components/icons'
import InfoHelpModal from '../components/InfoHelpModal'

function OptionButton({ selected, disabled, children, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      data-node-id={selected ? '14910:41526' : '14914:41539'}
      className={[
        'h-10 px-4 text-base border border-solid transition-colors inline-flex items-center justify-center text-center leading-normal',
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : selected
            ? 'hover:bg-[#fafafa]'
            : 'hover:bg-[#ececec]',
        selected
          ? 'rounded-[4px] bg-white border-[#0a0a0a] text-[#0a0a0a] font-medium'
          : 'rounded-[4px] bg-[#f8f8f8] border-[#f8f8f8] text-[#0a0a0a] font-medium',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

/**
 * Card with title row + info affordance (top-right), then description.
 * @param {object} [help] Optional modal copy; defaults use `title` + `description`.
 */
function SectionCardWithInfo({ title, description, children, help }) {
  const [infoOpen, setInfoOpen] = useState(false)
  const modalHeading = help?.modalHeading ?? title
  const modalHeadingText = help?.heading
  const modalBody = help?.sections?.length ? (help?.body ?? '') : (help?.body ?? description)

  return (
    <>
      <section className="bg-white border border-[#e5e7eb] rounded-[14px] p-6">
        <div className="mb-3 flex items-start justify-between gap-4">
          <h2 className="text-lg font-medium text-[#0a0a0a]">{title}</h2>
          <button
            type="button"
            onClick={() => setInfoOpen(true)}
            className="shrink-0 rounded p-1 text-[#9ca3af] transition-colors hover:bg-[#f3f4f6] hover:text-[#6a7282]"
            aria-label={`About ${title}`}
          >
            <IconInfo />
          </button>
        </div>
        <p className="mb-6 text-sm text-[#6a7282]">{description}</p>
        {children}
      </section>
      <InfoHelpModal
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        modalHeading={modalHeading}
        heading={modalHeadingText}
        body={modalBody}
        sections={help?.sections}
      />
    </>
  )
}

function GoalOptionButton({ selected, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'min-h-10 rounded-[6px] border border-solid px-4 py-2 text-center text-base transition-colors',
        selected
          ? 'border-[#0a0a0a] bg-white font-medium text-[#0a0a0a]'
          : 'border-[#e9eaeb] bg-white font-normal text-[#0a0a0a] hover:bg-[#fafafa]',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

const BUSINESS_GOALS = [
  { id: 'revenue', label: 'Maximise Revenue' },
  { id: 'sell-through', label: 'Improve Sell-through' },
  { id: 'stockouts', label: 'Reduce Stockouts' },
  { id: 'markdowns', label: 'Minimise Markdowns' },
]

function FieldLabel({ children }) {
  return <p className="text-sm font-medium text-[#0a0a0a]">{children}</p>
}

const OVERRIDE_OPTIONS = [
  { key: 'location-clusters', label: 'Location clusters' },
  { key: 'business-goal', label: 'Business goal' },
  { key: 'risk-appetite', label: 'Risk appetite' },
  { key: 'product-groups', label: 'Product groups' },
  { key: 'product-event-season', label: 'Product event / season' },
  { key: 'product', label: 'Product', disabled: true },
  { key: 'location', label: 'Location', disabled: true },
]

export default function GlobalConfigurationPage() {
  const [showApplySuccess, setShowApplySuccess] = useState(false)
  const [showTopInfo, setShowTopInfo] = useState(true)
  const [businessGoal, setBusinessGoal] = useState('revenue')
  const [weightRecentSales, setWeightRecentSales] = useState(70)
  const [recommendationBehaviour, setRecommendationBehaviour] = useState('manual')
  const [applyScope, setApplyScope] = useState('location')
  const [stockoutTolerance, setStockoutTolerance] = useState('very-high')
  const [uncertaintyMode, setUncertaintyMode] = useState('aggressive')
  const [marginMin, setMarginMin] = useState('')
  const [marginMax, setMarginMax] = useState('')
  const [overrideDimensions, setOverrideDimensions] = useState(() => new Set())

  useEffect(() => {
    if (!showApplySuccess) return
    const id = window.setTimeout(() => setShowApplySuccess(false), 5000)
    return () => window.clearTimeout(id)
  }, [showApplySuccess])

  return (
    <div className="relative w-full max-w-none space-y-6 pt-6">
      {showApplySuccess ? (
        <div
          className="absolute left-0 right-0 top-0 z-50 flex items-start gap-3 rounded-[6px] border border-[#08a16a] bg-[#e4f4ef] p-4 shadow-[0px_8px_25px_0px_rgba(0,0,0,0.1)]"
          data-name="Alerts & notifications"
          data-node-id="13693:314"
          role="status"
          aria-live="polite"
        >
          <div className="shrink-0 text-[#08a16a]" aria-hidden>
            <IconCircleCheck />
          </div>
          <div className="min-w-0 flex-1 flex flex-col gap-2">
            <h3 className="text-lg font-medium leading-normal text-[#00050a]">Configuration applied</h3>
            <p className="text-sm leading-normal text-[#4b535c]">
              Your global configuration has been saved. New recommendations will use these settings.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowApplySuccess(false)}
            className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-[4px] text-[#00050a] transition-colors hover:bg-black/[0.04]"
            aria-label="Dismiss"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {showTopInfo ? (
        <div
          className="bg-[#ebf3ff] border border-[#0267ff] flex items-start gap-3 p-4 rounded-[6px]"
          data-name="Alerts & notifications"
          data-node-id="13693:311"
        >
          <div className="shrink-0 w-6 h-6 text-[#0267ff]" aria-hidden>
            <IconInfo />
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="min-w-0 flex-1 flex flex-col gap-2">
              <h3 className="text-lg font-medium leading-normal text-[#00050a]">Set up how Single Solver works for your business</h3>
              <div className="space-y-2 text-sm leading-normal text-[#4b535c]">
                <p>
                  In this section, we'll define your goals, constraints, and inventory strategy, shaping how recommendations
                  are generated across replenishment, reordering, and rebuying.
                </p>
                <p>
                  These settings act as your north star, guiding how your data is interpreted and how decisions are made across
                  the platform.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowTopInfo(false)}
            className="shrink-0 h-10 w-10 inline-flex items-center justify-center rounded-[4px] text-[#00050a] hover:bg-black/[0.04] transition-colors"
            aria-label="Dismiss"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>
      ) : null}

      <SectionCardWithInfo
        title="Business Goals"
        description="Define what success looks like for your business. These priorities directly shape how inventory decisions are made."
        help={{
          modalHeading: 'Business goals',
          heading: 'Priorities that drive recommendations',
          sections: [
            {
              title: 'Improve Sell-through',
              paragraphs: [
                'Focus on selling a higher proportion of your inventory at full price.',
                'The system will favour leaner stock levels and faster turnover, helping reduce leftover inventory.',
              ],
            },
            {
              title: 'Reduce Stockouts',
              paragraphs: [
                'Focus on keeping products available for as long as possible.',
                'The system will recommend higher stock levels to minimise missed sales, even if this increases overall inventory.',
              ],
            },
            {
              title: 'Minimise Markdowns',
              paragraphs: [
                'Focus on reducing the need to discount products.',
                'The system will take a more conservative approach to buying and replenishment to avoid overstock.',
              ],
            },
          ],
        }}
      >
        <div className="flex flex-wrap gap-3">
          {BUSINESS_GOALS.map((g) => (
            <GoalOptionButton key={g.id} selected={businessGoal === g.id} onClick={() => setBusinessGoal(g.id)}>
              {g.label}
            </GoalOptionButton>
          ))}
        </div>
      </SectionCardWithInfo>

      <SectionCardWithInfo
        title="Inventory Strategy"
        description="Control how aggressively inventory is managed - balancing product availability against the risk of excess stock."
        help={{
          modalHeading: 'How this strategy influences inventory decisions',
          body:
            'Your choices here affect how the system balances stock availability, safety buffers, and the need for manual overrides.',
          sections: [
            {
              title: 'Overview',
              paragraphs: [
                'Control how aggressively inventory is managed, balancing product availability against the risk of excess stock.',
                'These settings influence replenishment, reordering, and safety stock recommendations across your locations and products.',
              ],
            },
            {
              title: 'Apply At',
              subsections: [
                {
                  title: 'Location',
                  paragraphs: [
                    'Apply this strategy at the store/warehouse level. Each location may have unique demand patterns.',
                  ],
                },
                {
                  title: 'Location + Department',
                  paragraphs: [
                    'Apply at the department level within each location, giving finer control over category-specific inventory behaviour.',
                  ],
                },
                {
                  title: 'Location + Product',
                  paragraphs: [
                    'Apply at the individual product level within each location. Ideal for high-value or fast-moving items.',
                  ],
                },
              ],
            },
            {
              title: 'Stockout Tolerance',
              paragraphs: [
                'Define how willing you are to accept stockouts:',
                'Very High – Prioritise availability above all. Risk of excess stock increases.',
                'High – Favour availability; moderate risk of overstock.',
                'Medium – Balanced approach between stockouts and excess stock.',
                'Low – Minimise overstock. Accept higher chance of stockouts.',
              ],
            },
            {
              title: 'Uncertainty / Aggressiveness',
              paragraphs: [
                'Controls how conservative or aggressive the system is when managing inventory. Higher aggressiveness increases safety stock automatically, reducing the need for manual overrides. Adjust based on demand variability, lead times, and your confidence in the data:',
                'Aggressive – Very proactive; automatically increases stock for risk mitigation.',
                'Somewhat Aggressive – Increases safety stock selectively; reduces stockout risk while limiting excess.',
                'Somewhat Conservative – Moderate approach; balances availability with inventory cost.',
                'Conservative – Minimal safety stock; prioritises lean inventory and low holding costs, higher stockout risk.',
              ],
            },
          ],
        }}
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <FieldLabel>Apply at</FieldLabel>
            <div className="flex flex-wrap gap-3">
              <OptionButton selected={applyScope === 'location'} onClick={() => setApplyScope('location')}>
                Location
              </OptionButton>
              <OptionButton selected={applyScope === 'loc-dept'} onClick={() => setApplyScope('loc-dept')}>
                Loc-dept
              </OptionButton>
              <OptionButton selected={applyScope === 'loc-prod'} onClick={() => setApplyScope('loc-prod')}>
                Loc-prod
              </OptionButton>
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel>What’s your stockout tolerance?</FieldLabel>
            <div className="flex flex-wrap gap-3">
              <OptionButton selected={stockoutTolerance === 'very-high'} onClick={() => setStockoutTolerance('very-high')}>
                Very high
              </OptionButton>
              <OptionButton selected={stockoutTolerance === 'high'} onClick={() => setStockoutTolerance('high')}>
                High
              </OptionButton>
              <OptionButton selected={stockoutTolerance === 'medium'} onClick={() => setStockoutTolerance('medium')}>
                Medium
              </OptionButton>
              <OptionButton selected={stockoutTolerance === 'low'} onClick={() => setStockoutTolerance('low')}>
                Low
              </OptionButton>
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel>How much uncertainty are you willing to accept?</FieldLabel>
            <p className="text-xs text-[#6a7282]">
              High means fewer overrides, aggressive increases safety stock. Tune based on demand variability, lead times, and confidence.
            </p>
            <div className="flex flex-wrap gap-3">
              <OptionButton selected={uncertaintyMode === 'aggressive'} onClick={() => setUncertaintyMode('aggressive')}>
                Aggressive
              </OptionButton>
              <OptionButton
                selected={uncertaintyMode === 'somewhat-aggressive'}
                onClick={() => setUncertaintyMode('somewhat-aggressive')}
              >
                Somewhat aggressive
              </OptionButton>
              <OptionButton
                selected={uncertaintyMode === 'somewhat-conservative'}
                onClick={() => setUncertaintyMode('somewhat-conservative')}
              >
                Somewhat conservative
              </OptionButton>
              <OptionButton
                selected={uncertaintyMode === 'conservative'}
                onClick={() => setUncertaintyMode('conservative')}
              >
                Conservative
              </OptionButton>
            </div>
          </div>
        </div>
      </SectionCardWithInfo>

      <SectionCardWithInfo
        title="Constraints"
        description="Define margin boundaries and choose dimensions where this configuration may be overridden."
        help={{
          modalHeading: 'Constraints',
          sections: [
            {
              title: 'Overview',
              paragraphs: [
                'Constraints keep recommendations aligned with your financial guardrails.',
                'Optional overrides let specific locations, products, or groups use different rules instead of these global defaults.',
              ],
            },
            {
              title: 'Margin min/max',
              paragraphs: [
                'Set minimum and maximum margin values to steer what the system treats as acceptable.',
                'Empty fields may fall back to organisation defaults elsewhere, depending on your setup.',
              ],
            },
            {
              title: 'Optional overrides',
              paragraphs: [
                'Choose where this global configuration should be replaced—e.g. location clusters, business goal, risk appetite, product groups, or product event / season.',
                'Options you cannot select yet are shown as disabled.',
              ],
            },
          ],
        }}
      >
        <div className="space-y-4">
          <div className="inline-flex flex-col gap-2 rounded-[6px] border border-[#e5e7eb] bg-white p-4 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center rounded-[6px] border border-[#E30D3C] bg-[#ffeaea] px-3 py-1 text-xs font-medium text-[#E30D3C]">
                Margin
              </div>
              <span className="text-xs text-[#6a7282]">min/max</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-[#6a7282]">Min</span>
                <input
                  inputMode="decimal"
                  value={marginMin}
                  onChange={(e) => setMarginMin(e.target.value)}
                  placeholder="e.g. 20%"
                  className="h-10 rounded-[4px] border border-[#e9eaeb] bg-white px-3 text-sm text-[#0a0a0a] outline-none"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-[#6a7282]">Max</span>
                <input
                  inputMode="decimal"
                  value={marginMax}
                  onChange={(e) => setMarginMax(e.target.value)}
                  placeholder="e.g. 60%"
                  className="h-10 rounded-[4px] border border-[#e9eaeb] bg-white px-3 text-sm text-[#0a0a0a] outline-none"
                />
              </label>
            </div>
          </div>

          <div className="pt-2">
            <h3 className="text-sm font-medium text-[#0a0a0a]">Optional overrides</h3>
            <p className="mt-1 text-xs text-[#6a7282]">Should this configuration be overridden in any specific area?</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {OVERRIDE_OPTIONS.map((opt) => {
                const selected = overrideDimensions.has(opt.key)
                return (
                  <OptionButton
                    key={opt.key}
                    disabled={opt.disabled}
                    selected={selected}
                    onClick={() => {
                      setOverrideDimensions((prev) => {
                        const next = new Set(prev)
                        if (next.has(opt.key)) next.delete(opt.key)
                        else next.add(opt.key)
                        return next
                      })
                    }}
                  >
                    {opt.label}
                    {opt.disabled ? <span className="ml-1 text-[#E30D3C]">?</span> : null}
                  </OptionButton>
                )
              })}
            </div>
          </div>
        </div>
      </SectionCardWithInfo>

      <SectionCardWithInfo
        title="Data & Forecasting"
        description="Control how historical data is used to generate forecasts and recommendations."
        help={{
          modalHeading: 'Data & forecasting',
          sections: [
            {
              title: 'Overview',
              paragraphs: [
                'Control how historical sales and inventory data is used to generate forecasts and recommendations.',
                'These settings influence the accuracy of replenishment, reordering, and rebalancing suggestions across your business.',
              ],
            },
            {
              title: 'Weight Recent Sales',
              paragraphs: [
                'Determines how much emphasis the system places on recent performance versus older historical data:',
                'Higher values – Prioritise recent trends; recommendations react quickly to changes in demand, seasonality, or market shifts.',
                'Lower values – Prioritise long-term historical patterns; recommendations are more stable but slower to respond to recent changes.',
              ],
            },
          ],
        }}
      >
        <div>
          <p className="mb-3 text-sm font-medium text-[#0a0a0a]">Weight Recent Sales</p>
          <input
            type="range"
            min={0}
            max={100}
            value={weightRecentSales}
            onChange={(e) => setWeightRecentSales(Number(e.target.value))}
            className="h-2 w-full cursor-pointer rounded-full bg-[#e9eaeb] accent-[#0267ff]"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={weightRecentSales}
            aria-label="Weight recent sales versus historical performance"
          />
          <p className="mt-2 text-xs text-[#6a7282]">
            Higher values prioritise recent trends over historical performance.
          </p>
        </div>
      </SectionCardWithInfo>

      <SectionCardWithInfo
        title="Recommendation Behaviour"
        description="Decide how and when recommendations are applied across your business."
        help={{
          modalHeading: 'Recommendation behaviour',
          sections: [
            {
              title: 'Overview',
              paragraphs: [
                "Decide how and when the system's recommendations are applied across your business.",
                'This affects how much control you retain versus how much the platform acts automatically.',
              ],
            },
            {
              title: 'Manual Approval',
              paragraphs: [
                'Recommendations are generated but require review and approval before they are applied.',
                'Best for teams who want full control, validate suggestions, or have complex constraints that need oversight.',
              ],
            },
            {
              title: 'Auto Apply High Confidence',
              paragraphs: [
                'Recommendations that meet a high confidence threshold are automatically applied.',
                'Best for teams who want to save time and trust the system to act on low-risk suggestions, while still allowing manual review for uncertain cases.',
              ],
            },
          ],
        }}
      >
        <div className="flex flex-wrap gap-3">
          <GoalOptionButton
            selected={recommendationBehaviour === 'manual'}
            onClick={() => setRecommendationBehaviour('manual')}
          >
            Manual Approval
          </GoalOptionButton>
          <GoalOptionButton
            selected={recommendationBehaviour === 'auto-high-confidence'}
            onClick={() => setRecommendationBehaviour('auto-high-confidence')}
          >
            Auto Apply High Confidence
          </GoalOptionButton>
        </div>
      </SectionCardWithInfo>

      {/* Primary CTA — DS button small / contained primary (Figma 14918:41566) */}
      <div
        className="mt-8 flex justify-end border-t border-[#e5e7eb] pt-6 pb-4"
        data-name="Global configuration actions"
      >
        <button
          type="button"
          onClick={() => {
            setShowApplySuccess(true)
            requestAnimationFrame(() => {
              document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' })
            })
          }}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-[4px] bg-[#0267ff] px-4 text-base font-medium text-white transition-colors hover:bg-[#0252cc]"
          data-node-id="14918:41566"
          aria-label="Save and launch — apply configuration"
        >
          Apply Configuration
        </button>
      </div>
    </div>
  )
}
