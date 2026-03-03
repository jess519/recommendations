import { useState } from 'react'
import TopBar from './components/TopBar'
import AddScheduleDrawer from './components/AddScheduleDrawer'
import AutoneLogo from './components/Logo'
import {
  IconCollapse,
  IconGrid,
  IconBars,
  IconInsightsChevron,
  IconOptimiser,
  IconBuy,
  IconGridDots,
  IconCalendarSidebar,
  IconGears,
  IconTeam,
  IconClockSidebar,
  IconChevronRight,
  IconChat,
  IconDollar,
  IconFlagUK,
} from './components/icons'
import OverviewPage from './pages/OverviewPage'
import InsightsPage from './pages/InsightsPage'
import BuyingPage from './pages/BuyingPage'
import DataHealthPage from './pages/DataHealthPage'
import OptimiserStatusPage from './pages/OptimiserStatusPage'
import ForecastInspectorPage from './pages/ForecastInspectorPage'
import OptimiserPage from './pages/OptimiserPage'
import ScopePage from './pages/ScopePage'

export default function App() {
  const [assignee, setAssignee] = useState({})
  const [optimiserOpen, setOptimiserOpen] = useState(false)
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [activeView, setActiveView] = useState('control-panel')
  const [optimiserSubView, setOptimiserSubView] = useState('schedule')
  const [scopeTripType, setScopeTripType] = useState('rebalancing')
  const [insightSubView, setInsightSubView] = useState(null)
  const [createScheduleDrawerOpen, setCreateScheduleDrawerOpen] = useState(false)

  return (
    <div className="h-screen bg-[#f5f5f5] flex text-[#0a0a0a] overflow-hidden">
      <aside className={`min-w-[220px] w-max h-full shrink-0 bg-[#12171e] flex flex-col px-[var(--spacing-l,16px)] py-[var(--spacing-2xl,32px)] overflow-y-auto overflow-x-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`} data-name="OptimiserSidebar/Expanded/Default" data-node-id="14404:7242">
        <div className="flex flex-col gap-[var(--spacing-2xl,32px)] min-w-0 flex-1 min-h-0" data-name="Container" data-node-id="14404:7243">
        <div className="flex flex-row items-center justify-between gap-2 w-full px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] shrink-0" data-name="Logo container" data-node-id="14404:7244">
          <AutoneLogo />
          <button type="button" className="flex items-center justify-center size-8 rounded-[var(--border-radius-s,4px)] text-white hover:bg-white/10 shrink-0" aria-label="Collapse sidebar" data-name="Icon=Collapse" data-node-id="12206:42115">
            <IconCollapse />
          </button>
        </div>

        <nav className={`flex-1 flex flex-col gap-[var(--spacing-xs,6px)] items-start w-full min-h-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${optimiserOpen || insightsOpen ? 'overflow-visible' : 'overflow-y-auto'}`} data-name="Container" data-node-id="14404:7246">
          <button type="button" onClick={() => setActiveView('control-panel')} className={`h-10 w-full flex items-center gap-[var(--spacing-m,12px)] px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-medium shrink-0 ${activeView === 'control-panel' ? 'bg-[#0267ff] text-white' : 'text-white hover:bg-white/5'}`} data-name="Sidebar element" data-node-id="14404:7247">
            <IconGrid className={`size-6 shrink-0 ${activeView === 'control-panel' ? 'text-white' : 'text-[#22272f]'}`} aria-hidden />
            <span>Overview</span>
          </button>
          <div className="flex flex-col gap-[var(--spacing-xs,6px)] w-full shrink-0">
            <button
              type="button"
              onClick={() => { setActiveView('insights'); setInsightSubView(null); setInsightsOpen((o) => !o); }}
              className={`h-10 w-full flex items-center gap-[var(--spacing-m,12px)] px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] shrink-0 ${activeView === 'insights' ? 'bg-[#0267ff] text-white font-medium' : 'font-normal text-white hover:bg-white/5'}`}
              aria-expanded={insightsOpen}
              data-name="Sidebar element"
              data-node-id="14404:7252"
            >
              <IconBars className={`size-6 shrink-0 ${activeView === 'insights' ? 'text-white' : 'text-[#22272f]'}`} aria-hidden />
              <span className="flex-1 min-w-0 text-left">Insights</span>
              <span className={`ml-auto inline-flex size-5 shrink-0 transition-transform duration-200 ${activeView === 'insights' ? 'text-white' : 'text-white'} ${insightsOpen ? 'rotate-180' : ''}`} aria-hidden data-name="icon" data-node-id="I14404:7252;12203:35389">
                <IconInsightsChevron />
              </span>
            </button>
            {insightsOpen && (
              <div className="flex flex-col gap-[4px] pl-4 pb-2 w-full shrink-0">
                <button type="button" onClick={() => { setActiveView('insights'); setInsightSubView('buying'); }} className={`min-h-[36px] w-full flex items-center gap-[var(--spacing-s,8px)] px-[var(--spacing-s,8px)] py-[var(--spacing-xxs,4px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-normal shrink-0 ${insightSubView === 'buying' ? 'bg-[#0267ff]/50 text-white' : 'text-white hover:bg-white/5'}`} data-name="Sidebar element">
                  Buying
                </button>
                <button type="button" onClick={() => { setActiveView('insights'); setInsightSubView('data-health'); }} className={`min-h-[36px] w-full flex items-center gap-[var(--spacing-s,8px)] px-[var(--spacing-s,8px)] py-[var(--spacing-xxs,4px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-normal shrink-0 ${insightSubView === 'data-health' ? 'bg-[#0267ff]/50 text-white' : 'text-white hover:bg-white/5'}`} data-name="Sidebar element">
                  Data health
                </button>
                <button type="button" onClick={() => { setActiveView('insights'); setInsightSubView('optimiser-status'); }} className={`min-h-[36px] w-full flex items-center gap-[var(--spacing-s,8px)] px-[var(--spacing-s,8px)] py-[var(--spacing-xxs,4px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-normal shrink-0 ${insightSubView === 'optimiser-status' ? 'bg-[#0267ff]/50 text-white' : 'text-white hover:bg-white/5'}`} data-name="Sidebar element">
                  Optimiser status
                </button>
                <button type="button" onClick={() => { setActiveView('insights'); setInsightSubView('forecast-inspector'); }} className={`min-h-[36px] w-full flex items-center gap-[var(--spacing-s,8px)] px-[var(--spacing-s,8px)] py-[var(--spacing-xxs,4px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-normal shrink-0 ${insightSubView === 'forecast-inspector' ? 'bg-[#0267ff]/50 text-white' : 'text-white hover:bg-white/5'}`} data-name="Sidebar element">
                  <span className="flex-1 min-w-0 text-left">Forecast inspector</span>
                  <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded shrink-0">Premium</span>
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-[var(--spacing-xs,6px)] w-full shrink-0">
            <button
              type="button"
              onClick={() => { setActiveView('optimiser'); setOptimiserSubView('schedule'); setOptimiserOpen((o) => !o); }}
              className={`h-10 w-full flex items-center gap-[var(--spacing-m,12px)] px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] shrink-0 ${activeView === 'optimiser' ? 'bg-[#0267ff] text-white font-medium' : 'font-normal text-white hover:bg-white/5'}`}
              aria-expanded={optimiserOpen}
              data-name="Sidebar element"
              data-node-id="14404:7825"
            >
              <span className="relative shrink-0 size-6" data-name="Icon=new reorder" data-node-id="I14404:7825;12203:35386">
                <IconOptimiser className={`size-full ${activeView === 'optimiser' ? 'text-white' : 'text-[#22272f]'}`} aria-hidden />
              </span>
              <span className="flex flex-1 min-w-0 flex-col justify-center text-left text-[14px] leading-[100%]" data-node-id="I14404:7825;12203:35387">Optimiser</span>
              <span className={`relative shrink-0 size-5 inline-flex transition-transform duration-200 ${activeView === 'optimiser' ? 'text-white' : 'text-white'} ${optimiserOpen ? 'rotate-180' : ''}`} aria-hidden data-name="icon" data-node-id="I14404:7825;12203:35389">
                <IconInsightsChevron />
              </span>
            </button>
            {optimiserOpen && (
              <div className="flex flex-col gap-[4px] pl-4 pb-2 w-full shrink-0">
                <button type="button" className="min-h-[36px] w-full flex items-center gap-[var(--spacing-s,8px)] px-[var(--spacing-s,8px)] py-[var(--spacing-xxs,4px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-normal text-white hover:bg-white/5 shrink-0" data-name="Sidebar element" data-node-id="14404:7250">
                  Replenishment
                </button>
                <button type="button" className="min-h-[36px] w-full flex items-center gap-[var(--spacing-s,8px)] px-[var(--spacing-s,8px)] py-[var(--spacing-xxs,4px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-normal text-white hover:bg-white/5 shrink-0" data-name="Sidebar element" data-node-id="14404:7790">
                  Reorder
                </button>
                <button type="button" className="min-h-[36px] w-full flex items-center gap-[var(--spacing-s,8px)] px-[var(--spacing-s,8px)] py-[var(--spacing-xxs,4px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-normal text-white hover:bg-white/5 shrink-0" data-name="Sidebar element" data-node-id="14404:7793">
                  Rebalancing
                </button>
              </div>
            )}
          </div>
          <button type="button" className="h-10 w-full flex items-center gap-[var(--spacing-m,12px)] px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-normal text-white hover:bg-white/5 shrink-0" data-name="Sidebar element" data-node-id="14404:7251">
            <IconBuy className="text-[#22272f] size-6 shrink-0" aria-hidden />
            <span>Buying</span>
          </button>
          <div className="h-px w-full bg-white/10 shrink-0 my-0" role="separator" data-name="divider" />
          {!optimiserOpen && !insightsOpen && (
            <>
              <button type="button" className="h-10 w-full flex items-center gap-[var(--spacing-m,12px)] px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-normal text-white hover:bg-white/5 shrink-0" data-name="Sidebar element" data-node-id="14404:7254">
                <IconGridDots className="text-[#22272f] size-6 shrink-0" aria-hidden />
                <span>Assortment</span>
              </button>
              <button type="button" className="h-10 w-full flex items-center gap-[var(--spacing-m,12px)] px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-normal text-white hover:bg-white/5 shrink-0" data-name="Sidebar element" data-node-id="14404:7255">
                <IconCalendarSidebar className="text-[#22272f] size-6 shrink-0" aria-hidden />
                <span>Events</span>
              </button>
              <button type="button" className="h-10 w-full flex items-center gap-[var(--spacing-m,12px)] px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-normal text-white hover:bg-white/5 shrink-0" data-name="Sidebar element">
                <IconGears className="text-white size-6 shrink-0" aria-hidden />
                <span>Parameters</span>
              </button>
              <button type="button" className="h-10 w-full flex items-center gap-[var(--spacing-m,12px)] px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-normal text-white hover:bg-white/5 shrink-0" data-name="Sidebar element">
                <IconTeam className="text-[#22272f] size-6 shrink-0" aria-hidden />
                <span>Team</span>
              </button>
            </>
          )}
        </nav>

        <div className="flex flex-col gap-[var(--spacing-xs,6px)] items-start w-full shrink-0 mt-auto" data-name="Container" data-node-id="145:935">
          <button type="button" className="flex h-[40px] w-full shrink-0 items-center justify-center gap-[var(--spacing-m,12px)] rounded-[var(--border-radius-s,4px)] px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] text-left text-[14px] font-normal text-white hover:bg-white/5" data-name="Sidebar element" data-node-id="145:936">
            <IconClockSidebar className="text-emerald-400 size-6 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1 text-white">Data age</span>
            <span className="shrink-0 text-[14px] font-medium text-emerald-400">12h</span>
            <IconChevronRight className="text-[#22272f] size-5 shrink-0" aria-hidden />
          </button>
          <div className="h-px w-full shrink-0 bg-white/10" role="separator" data-name="divider" />
          <button type="button" className="flex h-[40px] w-full shrink-0 items-center justify-center gap-[var(--spacing-m,12px)] rounded-[var(--border-radius-s,4px)] px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] text-left text-[14px] font-normal text-white hover:bg-white/5" data-name="Sidebar element" data-node-id="145:938">
            <IconChat className="text-[#22272f] size-6 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1">Chat with us</span>
          </button>
          <button type="button" className="flex h-[40px] w-full shrink-0 items-center justify-center gap-[var(--spacing-m,12px)] rounded-[var(--border-radius-s,4px)] px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] text-left text-[14px] font-normal text-white hover:bg-white/5" data-name="Sidebar element" data-node-id="145:939">
            <IconDollar className="text-[#22272f] size-6 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1">Currency</span>
          </button>
          <button type="button" className="flex h-[40px] w-full shrink-0 items-center justify-center gap-[var(--spacing-m,12px)] rounded-[var(--border-radius-s,4px)] px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] text-left text-[14px] font-normal text-white hover:bg-white/5" data-name="Sidebar element" data-node-id="145:940">
            <IconFlagUK className="size-6 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1">English</span>
          </button>
          <button type="button" className="flex w-full shrink-0 items-center gap-[var(--spacing-s,8px)] rounded-[var(--border-radius-l,8px)] py-0 pl-0 pr-[var(--spacing-l,16px)] text-left shadow-[0px_8px_25px_0px_rgba(0,0,0,0.03)] hover:bg-white/5" data-name="user-avatar" data-node-id="145:941">
            <div className="relative size-[40px] shrink-0 overflow-hidden rounded-[var(--border-radius-l,8px)]" data-name="Avatar">
              <img src="/avatar-user.jpg" alt="" className="absolute inset-0 size-full object-cover pointer-events-none" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-[2px] items-start text-left" data-node-id="I145:941;12206:42131">
              <p className="truncate w-full font-sans text-[16px] font-medium font-normal leading-normal tracking-[0] text-white" data-node-id="I145:941;12206:42132">Charles Morenno</p>
              <p className="truncate w-full font-sans text-[10px] font-normal leading-normal tracking-[0] text-[#878D94]" data-node-id="I145:941;12206:42133">charlesmorenno@gmail.com</p>
            </div>
            <IconChevronRight className="text-[#22272f] size-5 shrink-0" aria-hidden />
          </button>
        </div>
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0 min-h-0 w-full overflow-hidden">
        <div className="shrink-0">
          <TopBar
            title={activeView === 'optimiser' && optimiserSubView === 'scope' ? (scopeTripType === 'rebalancing' ? 'Rebalancing' : scopeTripType === 'replenishment' ? 'Replenishment' : 'Reorder') : activeView === 'optimiser' ? 'Optimiser' : activeView === 'insights' ? 'Insights' : 'Overview'}
            subtitle={activeView === 'optimiser' && optimiserSubView === 'scope' ? (scopeTripType === 'rebalancing' ? 'Optimize your inventory between points of sales' : scopeTripType === 'replenishment' ? 'Move stock from your warehouse to your points of sale' : 'Order more of your bestsellers') : activeView === 'optimiser' ? 'Automate replenishment, reordering, and rebalancing with scheduled inventory optimisation.' : activeView === 'insights' ? 'Analytics and statistics for your sales performance.' : "Overview area, your 'morning check-in' to prioritise and manage inventory, scheduling and more"}
            primaryButtonLabel={activeView === 'optimiser' && optimiserSubView === 'scope' ? (scopeTripType === 'rebalancing' ? 'Create new rebalancing' : scopeTripType === 'replenishment' ? 'Create new replenishment' : 'Create new reorder') : undefined}
            onPrimaryClick={activeView === 'optimiser' && optimiserSubView === 'scope' ? () => setCreateScheduleDrawerOpen(true) : undefined}
            secondaryButtonLabel={activeView === 'optimiser' && optimiserSubView === 'scope' ? 'Switch back' : undefined}
            onSecondaryClick={activeView === 'optimiser' && optimiserSubView === 'scope' ? () => setOptimiserSubView('schedule') : undefined}
            showMenuButton={activeView === 'insights'}
            onBack={activeView === 'optimiser' && optimiserSubView === 'scope' ? () => setOptimiserSubView('schedule') : undefined}
          />
        </div>

        <main className="flex-1 min-h-0 min-w-0 w-full pl-8 pr-8 pb-12 overflow-y-auto overflow-x-hidden">
          {activeView === 'optimiser' && optimiserSubView === 'scope' ? (
            <ScopePage tripType={scopeTripType} onTripTypeChange={setScopeTripType} />
          ) : activeView === 'optimiser' ? (
            <div className="pt-6">
              <OptimiserPage onAddJob={() => setOptimiserSubView('scope')} />
            </div>
          ) : activeView === 'insights' ? (
            <div>
              {insightSubView === 'buying' && <BuyingPage />}
              {insightSubView === 'data-health' && <DataHealthPage />}
              {insightSubView === 'optimiser-status' && <OptimiserStatusPage />}
              {insightSubView === 'forecast-inspector' && <ForecastInspectorPage />}
              {!insightSubView && <InsightsPage />}
            </div>
          ) : (
            <OverviewPage assignee={assignee} setAssignee={setAssignee} onAddJob={() => { setActiveView('optimiser'); setOptimiserSubView('scope'); }} />
          )}
        </main>
      </div>

      <AddScheduleDrawer open={createScheduleDrawerOpen} onClose={() => setCreateScheduleDrawerOpen(false)} />
    </div>
  )
}
