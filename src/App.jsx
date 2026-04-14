import { useState, useEffect } from 'react'
import TopBar from './components/TopBar'
import AutoneLogo from './components/Logo'
import {
  IconCollapse,
  IconExpand,
  IconGrid,
  IconBars,
  IconInsightsChevron,
  IconOptimiser,
  IconBuy,
  IconGridDots,
  IconCalendarSidebar,
  IconGears,
  IconGlobe,
  IconTeam,
  IconClockSidebar,
  IconChevronRight,
  IconChat,
  IconDollar,
  IconFlagUK,
  IconInventoryGoals,
} from './components/icons'
import OverviewPage from './pages/OverviewPage'
import InsightsPage from './pages/InsightsPage'
import BuyingPage from './pages/BuyingPage'
import DataHealthPage from './pages/DataHealthPage'
import OptimiserStatusPage from './pages/OptimiserStatusPage'
import ForecastInspectorPage from './pages/ForecastInspectorPage'
import OptimiserPage from './pages/OptimiserPage'
import ScopePage from './pages/ScopePage'
import ScheduleDetailPage from './pages/ScheduleDetailPage'
import InventoryGoalsPage from './pages/InventoryGoalsPage'
import GlobalConfigurationPage from './pages/GlobalConfigurationPage'
import SetInventoryGoalModal from './components/SetInventoryGoalModal'

export default function App() {
  const [assignee, setAssignee] = useState({})
  const [optimiserOpen, setOptimiserOpen] = useState(false)
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [activeView, setActiveView] = useState('control-panel')
  const [optimiserSubView, setOptimiserSubView] = useState(null)
  const [insightSubView, setInsightSubView] = useState(null)
  const [openScheduleDrawerSignal, setOpenScheduleDrawerSignal] = useState(0)
  const [openAddJobSignal, setOpenAddJobSignal] = useState(0)
  const [resetToUpcomingSignal, setResetToUpcomingSignal] = useState(0)
  const [openCreateSchedulePageSignal, setOpenCreateSchedulePageSignal] = useState(0)
  const [resetToRecommendationsLandingSignal, setResetToRecommendationsLandingSignal] = useState(0)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [inventoryGoalModalOpen, setInventoryGoalModalOpen] = useState(false)

  const handleInventoryCreateGoal = () => setInventoryGoalModalOpen(true)

  useEffect(() => {
    if (activeView !== 'inventory-goals') setInventoryGoalModalOpen(false)
  }, [activeView])

  useEffect(() => {
    if (sidebarCollapsed) {
      setOptimiserOpen(false)
      setInsightsOpen(false)
    }
  }, [sidebarCollapsed])

  const navItemBase =
    'h-10 w-full flex items-center rounded-[var(--border-radius-s,4px)] text-[14px] shrink-0 transition-colors'
  const navItemExpanded =
    'gap-[var(--spacing-m,12px)] px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] text-left'
  const navItemCollapsed = 'justify-center px-0 py-[var(--spacing-s,8px)]'

  return (
    <div className="h-screen bg-[#f5f5f5] flex text-[#0a0a0a] overflow-hidden">
      <aside
        className={`h-full shrink-0 bg-[#12171e] flex flex-col py-[var(--spacing-2xl,32px)] overflow-y-auto overflow-x-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          sidebarCollapsed
            ? 'w-[72px] min-w-[72px] max-w-[72px] items-center px-2'
            : 'min-w-[220px] w-max px-[var(--spacing-l,16px)]'
        }`}
        data-name={sidebarCollapsed ? 'OptimiserSidebar/Collapsed' : 'OptimiserSidebar/Expanded/Default'}
        data-node-id={sidebarCollapsed ? '12212:42694' : '14404:7242'}
      >
        <div
          className={`flex flex-col gap-[var(--spacing-2xl,32px)] min-w-0 flex-1 min-h-0 ${sidebarCollapsed ? 'w-full items-center' : ''}`}
          data-name="Container"
          data-node-id="14404:7243"
        >
        <div
          className={`flex shrink-0 w-full ${
            sidebarCollapsed
              ? 'flex-row items-center justify-between gap-0 py-2'
              : 'flex flex-row items-center justify-between gap-2 px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)]'
          }`}
          data-name="Logo container"
          data-node-id="14404:7244"
        >
          <AutoneLogo collapsed={sidebarCollapsed} />
          {sidebarCollapsed && (
            <button
              type="button"
              onClick={() => setSidebarCollapsed((c) => !c)}
              className="flex size-8 shrink-0 items-center justify-center rounded-[var(--border-radius-s,4px)] text-white hover:bg-white/10"
              aria-label="Expand sidebar"
              data-name="Icon=Expand"
              data-node-id="12206:42111"
            >
              <IconExpand />
            </button>
          )}
          {!sidebarCollapsed && (
            <button
              type="button"
              onClick={() => setSidebarCollapsed((c) => !c)}
              className="flex size-8 shrink-0 items-center justify-center rounded-[var(--border-radius-s,4px)] text-white hover:bg-white/10"
              aria-label="Collapse sidebar"
              data-name="Icon=Collapse"
              data-node-id="12206:42115"
            >
              <IconCollapse />
            </button>
          )}
        </div>

        <nav className={`flex-1 flex flex-col gap-[var(--spacing-xs,6px)] min-h-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${sidebarCollapsed ? 'w-full items-center' : 'w-full items-start'} ${optimiserOpen || insightsOpen ? 'overflow-visible' : 'overflow-y-auto'}`} data-name="Container" data-node-id="14404:7246">
          <button type="button" onClick={() => setActiveView('control-panel')} className={`${navItemBase} ${sidebarCollapsed ? navItemCollapsed : `${navItemExpanded} text-left font-medium`} ${activeView === 'control-panel' ? 'bg-[#0D7580] text-white' : 'text-white hover:bg-white/5'}`} data-name="Sidebar element" data-node-id="14404:7247">
            <IconGrid className="size-6 shrink-0 text-white" aria-hidden />
            {!sidebarCollapsed && <span>Overview</span>}
          </button>
          <div className={`flex flex-col gap-[var(--spacing-xs,6px)] shrink-0 ${sidebarCollapsed ? 'w-full items-center' : 'w-full'}`}>
            <button
              type="button"
              onClick={() => {
                setActiveView('insights')
                setInsightSubView(null)
                if (!sidebarCollapsed) setInsightsOpen((o) => !o)
              }}
              className={`${navItemBase} ${sidebarCollapsed ? navItemCollapsed : `${navItemExpanded} text-left`} ${activeView === 'insights' ? 'bg-[#0D7580] text-white font-medium' : 'font-normal text-white hover:bg-white/5'}`}
              aria-expanded={sidebarCollapsed ? false : insightsOpen}
              data-name="Sidebar element"
              data-node-id="14404:7252"
            >
              <IconBars className="size-6 shrink-0 text-white" aria-hidden />
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 min-w-0 text-left">Insights</span>
                  <span className={`ml-auto inline-flex size-5 shrink-0 transition-transform duration-200 text-white ${insightsOpen ? 'rotate-180' : ''}`} aria-hidden data-name="icon" data-node-id="I14404:7252;12203:35389">
                    <IconInsightsChevron />
                  </span>
                </>
              )}
            </button>
            {insightsOpen && !sidebarCollapsed && (
              <div className="flex flex-col gap-[4px] pl-4 pb-2 w-full shrink-0">
                <button type="button" onClick={() => { setActiveView('insights'); setInsightSubView('buying'); }} className={`min-h-[36px] w-full flex items-center gap-[var(--spacing-s,8px)] px-[var(--spacing-s,8px)] py-[var(--spacing-xxs,4px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-normal shrink-0 ${insightSubView === 'buying' ? 'bg-[#0D7580]/50 text-white' : 'text-white hover:bg-white/5'}`} data-name="Sidebar element">
                  Buying
                </button>
                <button type="button" onClick={() => { setActiveView('insights'); setInsightSubView('data-health'); }} className={`min-h-[36px] w-full flex items-center gap-[var(--spacing-s,8px)] px-[var(--spacing-s,8px)] py-[var(--spacing-xxs,4px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-normal shrink-0 ${insightSubView === 'data-health' ? 'bg-[#0D7580]/50 text-white' : 'text-white hover:bg-white/5'}`} data-name="Sidebar element">
                  Data health
                </button>
                <button type="button" onClick={() => { setActiveView('insights'); setInsightSubView('optimiser-status'); }} className={`min-h-[36px] w-full flex items-center gap-[var(--spacing-s,8px)] px-[var(--spacing-s,8px)] py-[var(--spacing-xxs,4px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-normal shrink-0 ${insightSubView === 'optimiser-status' ? 'bg-[#0D7580]/50 text-white' : 'text-white hover:bg-white/5'}`} data-name="Sidebar element">
                  Optimiser status
                </button>
                <button type="button" onClick={() => { setActiveView('insights'); setInsightSubView('forecast-inspector'); }} className={`min-h-[36px] w-full flex items-center gap-[var(--spacing-s,8px)] px-[var(--spacing-s,8px)] py-[var(--spacing-xxs,4px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-normal shrink-0 ${insightSubView === 'forecast-inspector' ? 'bg-[#0D7580]/50 text-white' : 'text-white hover:bg-white/5'}`} data-name="Sidebar element">
                  <span className="flex-1 min-w-0 text-left">Forecast inspector</span>
                  <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded shrink-0">Premium</span>
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveView('global-configuration')
              setOptimiserOpen(false)
            }}
            className={`${navItemBase} ${sidebarCollapsed ? navItemCollapsed : `${navItemExpanded} text-left font-normal`} ${activeView === 'global-configuration' ? 'bg-[#0D7580] text-white font-medium' : 'text-white hover:bg-white/5'}`}
            data-name="Sidebar element"
            data-node-id="14404:global-configuration"
          >
            <IconGlobe
              className={`size-6 shrink-0 text-white transition-[filter] duration-200 ${
                activeView === 'global-configuration'
                  ? '[filter:brightness(1.06)_drop-shadow(0_1px_2px_rgba(0,0,0,0.22))]'
                  : '[filter:drop-shadow(0_1px_1px_rgba(0,0,0,0.45))]'
              }`}
              aria-hidden
            />
            {!sidebarCollapsed && <span>Global Configuration</span>}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveView('inventory-goals')
              setOptimiserOpen(false)
            }}
            className={`${navItemBase} ${sidebarCollapsed ? navItemCollapsed : `${navItemExpanded} text-left font-normal`} ${activeView === 'inventory-goals' ? 'bg-[#0D7580] text-white font-medium' : 'text-white hover:bg-white/5'}`}
            data-name="Sidebar element"
            data-node-id="14404:inventory-goals"
          >
            <IconInventoryGoals className="size-6 text-white" aria-hidden />
            {!sidebarCollapsed && <span>Inventory goals</span>}
          </button>
          <div className={`flex flex-col gap-[var(--spacing-xs,6px)] shrink-0 ${sidebarCollapsed ? 'w-full items-center' : 'w-full'}`}>
            <button
              type="button"
              onClick={() => {
                if (sidebarCollapsed) {
                  setActiveView('optimiser')
                  setOptimiserSubView(null)
                  setResetToRecommendationsLandingSignal((n) => n + 1)
                  return
                }
                setActiveView('optimiser')
                setOptimiserSubView(null)
                setResetToRecommendationsLandingSignal((n) => n + 1)
                setOptimiserOpen((o) => !o)
              }}
              className={`${navItemBase} ${sidebarCollapsed ? navItemCollapsed : `${navItemExpanded} text-left`} ${activeView === 'optimiser' ? 'bg-[#0D7580] text-white font-medium' : 'font-normal text-white hover:bg-white/5'}`}
              aria-expanded={sidebarCollapsed ? false : optimiserOpen}
              data-name="Sidebar element"
              data-node-id="14404:7825"
            >
              <span className="relative shrink-0 size-6" data-name="Icon=new reorder" data-node-id="I14404:7825;12203:35386">
                <IconOptimiser className="size-full text-white" aria-hidden />
              </span>
              {!sidebarCollapsed && (
                <>
                  <span className="flex flex-1 min-w-0 flex-col justify-center text-left text-[14px] leading-[100%]" data-node-id="I14404:7825;12203:35387">Recommendations</span>
                  <span className={`relative shrink-0 size-5 inline-flex transition-transform duration-200 text-white ${optimiserOpen ? 'rotate-180' : ''}`} aria-hidden data-name="icon" data-node-id="I14404:7825;12203:35389">
                    <IconInsightsChevron />
                  </span>
                </>
              )}
            </button>
            {optimiserOpen && !sidebarCollapsed && (
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
          <button type="button" className={`${navItemBase} ${sidebarCollapsed ? navItemCollapsed : `${navItemExpanded} text-left font-normal`} text-white hover:bg-white/5`} data-name="Sidebar element" data-node-id="14404:7251">
            <IconBuy className="text-white size-6 shrink-0" aria-hidden />
            {!sidebarCollapsed && <span>Buying</span>}
          </button>
          <div className={`h-px shrink-0 my-0 bg-white/10 ${sidebarCollapsed ? 'w-8' : 'w-full'}`} role="separator" data-name="divider" />
          {!optimiserOpen && !insightsOpen && (
            <>
              <button type="button" className={`${navItemBase} ${sidebarCollapsed ? navItemCollapsed : `${navItemExpanded} text-left font-normal`} text-white hover:bg-white/5`} data-name="Sidebar element" data-node-id="14404:7254">
                <IconGridDots className="text-white size-6 shrink-0" aria-hidden />
                {!sidebarCollapsed && <span>Assortment</span>}
              </button>
              <button type="button" className={`${navItemBase} ${sidebarCollapsed ? navItemCollapsed : `${navItemExpanded} text-left font-normal`} text-white hover:bg-white/5`} data-name="Sidebar element" data-node-id="14404:7255">
                <IconCalendarSidebar className="text-white size-6 shrink-0" aria-hidden />
                {!sidebarCollapsed && <span>Events</span>}
              </button>
              <button type="button" className={`${navItemBase} ${sidebarCollapsed ? navItemCollapsed : `${navItemExpanded} text-left font-normal`} text-white hover:bg-white/5`} data-name="Sidebar element">
                <IconGears className="text-white size-6 shrink-0" aria-hidden />
                {!sidebarCollapsed && <span>Parameters</span>}
              </button>
              <button type="button" className={`${navItemBase} ${sidebarCollapsed ? navItemCollapsed : `${navItemExpanded} text-left font-normal`} text-white hover:bg-white/5`} data-name="Sidebar element">
                <IconTeam className="text-white size-6 shrink-0" aria-hidden />
                {!sidebarCollapsed && <span>Team</span>}
              </button>
            </>
          )}
        </nav>

        <div className={`flex flex-col gap-[var(--spacing-xs,6px)] shrink-0 mt-auto w-full ${sidebarCollapsed ? 'items-center' : 'items-start'}`} data-name="Container" data-node-id="145:935">
          <button
            type="button"
            className={`flex h-10 w-full shrink-0 items-center rounded-[var(--border-radius-s,4px)] text-[14px] font-normal text-white hover:bg-white/5 ${sidebarCollapsed ? 'justify-center px-0' : 'justify-center gap-[var(--spacing-m,12px)] px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] text-left'}`}
            data-name="Sidebar element"
            data-node-id="145:936"
          >
            <IconClockSidebar className="text-emerald-400 size-6 shrink-0" aria-hidden />
            {!sidebarCollapsed && (
              <>
                <span className="min-w-0 flex-1 text-white">Data age</span>
                <span className="shrink-0 text-[14px] font-medium text-emerald-400">12h</span>
                <IconChevronRight className="text-white size-5 shrink-0" aria-hidden />
              </>
            )}
          </button>
          <div className={`h-px shrink-0 bg-white/10 ${sidebarCollapsed ? 'w-8' : 'w-full'}`} role="separator" data-name="divider" />
          <button
            type="button"
            className={`flex h-10 w-full shrink-0 items-center rounded-[var(--border-radius-s,4px)] text-[14px] font-normal text-white hover:bg-white/5 ${sidebarCollapsed ? 'justify-center px-0' : 'justify-center gap-[var(--spacing-m,12px)] px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] text-left'}`}
            data-name="Sidebar element"
            data-node-id="145:938"
          >
            <IconChat className="text-white size-6 shrink-0" aria-hidden />
            {!sidebarCollapsed && <span className="min-w-0 flex-1">Chat with us</span>}
          </button>
          <button
            type="button"
            className={`flex h-10 w-full shrink-0 items-center rounded-[var(--border-radius-s,4px)] text-[14px] font-normal text-white hover:bg-white/5 ${sidebarCollapsed ? 'justify-center px-0' : 'justify-center gap-[var(--spacing-m,12px)] px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] text-left'}`}
            data-name="Sidebar element"
            data-node-id="145:939"
          >
            <IconDollar className="text-white size-6 shrink-0" aria-hidden />
            {!sidebarCollapsed && <span className="min-w-0 flex-1">Currency</span>}
          </button>
          <button
            type="button"
            className={`flex h-10 w-full shrink-0 items-center rounded-[var(--border-radius-s,4px)] text-[14px] font-normal text-white hover:bg-white/5 ${sidebarCollapsed ? 'justify-center px-0' : 'justify-center gap-[var(--spacing-m,12px)] px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] text-left'}`}
            data-name="Sidebar element"
            data-node-id="145:940"
          >
            <IconFlagUK className="size-6 shrink-0" aria-hidden />
            {!sidebarCollapsed && <span className="min-w-0 flex-1">English</span>}
          </button>
          <button
            type="button"
            className={`flex w-full shrink-0 items-center rounded-[var(--border-radius-l,8px)] hover:bg-white/5 ${sidebarCollapsed ? 'h-10 justify-center p-0 shadow-none' : 'h-[40px] py-0 pl-0 pr-[var(--spacing-l,16px)] text-left shadow-[0px_8px_25px_0px_rgba(0,0,0,0.03)]'}`}
            data-name="user-avatar"
            data-node-id="12718:9271"
          >
            {sidebarCollapsed ? (
              <div
                className="relative size-10 shrink-0 overflow-hidden rounded-full shadow-[0px_20px_40px_0px_rgba(145,158,171,0.12)]"
                data-name="Avatar"
                data-node-id="12206:42172"
              >
                <img
                  src="/sidebar-avatar.jpg"
                  alt=""
                  className="pointer-events-none size-full rounded-full object-cover"
                  data-name="Image"
                  data-node-id="I12206:42172;12134:33222"
                />
              </div>
            ) : (
              <div className="flex h-full w-full min-w-0 items-center justify-between rounded-[12px]">
                <div className="flex min-w-0 flex-1 items-center gap-[var(--spacing-s,8px)]" data-node-id="I12718:9271;12206:42129">
                  <div
                    className="relative shrink-0 size-[40px] overflow-hidden rounded-full"
                    data-name="Avatar"
                    data-node-id="I12718:9271;12206:42130"
                  >
                    <img
                      src="/sidebar-avatar.jpg"
                      alt=""
                      className="pointer-events-none absolute inset-0 size-full rounded-full object-cover"
                      data-name="Image"
                      data-node-id="I12718:9271;12206:42130;12134:33222"
                    />
                  </div>
                  <div
                    className="flex min-w-0 flex-1 flex-col gap-[2px] items-start text-left leading-[normal]"
                    data-node-id="I12718:9271;12206:42131"
                  >
                    <p className="w-full truncate text-[16px] font-medium text-white" data-node-id="I12718:9271;12206:42132">
                      Charles Morenno
                    </p>
                    <p className="w-full truncate text-[10px] font-normal text-[#878d94]" data-node-id="I12718:9271;12206:42133">
                      charlesmorenno@gmail.com
                    </p>
                  </div>
                </div>
                <span className="inline-flex size-5 shrink-0 items-center justify-center text-white/80" data-name="icon" data-node-id="I12718:9271;12206:42134" aria-hidden>
                  <IconChevronRight className="size-5" />
                </span>
              </div>
            )}
          </button>
        </div>
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0 min-h-0 w-full overflow-hidden">
        <div className="shrink-0">
          <TopBar
            title={
              activeView === 'optimiser' && optimiserSubView === 'scope'
                ? 'Scope'
                : activeView === 'optimiser' && optimiserSubView === 'schedule-detail'
                  ? 'Schedule detail'
                  : activeView === 'optimiser'
                    ? 'Recommendations'
                    : activeView === 'global-configuration'
                      ? 'Global Configuration'
                      : activeView === 'inventory-goals'
                        ? 'Inventory goals'
                        : activeView === 'insights'
                          ? 'Insights'
                          : 'Overview'
            }
            subtitle={
              activeView === 'optimiser' && optimiserSubView === 'scope'
                ? null
                : activeView === 'optimiser' && optimiserSubView === 'schedule-detail'
                  ? null
                  : activeView === 'optimiser'
                    ? 'Automate replenishment, reordering, and rebalancing with scheduled inventory optimisation.'
                    : activeView === 'global-configuration'
                      ? 'Configure the rules and priorities that guide how your data is interpreted and how decisions are made across the platform.'
                      : activeView === 'inventory-goals'
                        ? 'Set targets and track progress for inventory across your network.'
                        : activeView === 'insights'
                          ? 'Analytics and statistics for your sales performance.'
                          : "Overview area, your 'morning check-in' to prioritise and manage inventory, scheduling and more"
            }
            primaryButtonLabel={undefined}
            showMenuButton={activeView === 'insights'}
            onBack={
              activeView === 'optimiser' && (optimiserSubView === 'scope' || optimiserSubView === 'schedule-detail')
                ? () => {
                    setOptimiserSubView(null)
                    if (optimiserSubView === 'scope') {
                      setResetToUpcomingSignal((n) => n + 1)
                    }
                    setOpenAddJobSignal(0)
                  }
                : undefined
            }
            headerActions={undefined}
            recommendationsButtonLabel="Use latest recommendations"
            onCreateGoal={activeView === 'inventory-goals' ? handleInventoryCreateGoal : undefined}
            onUseLatestRecommendations={
              activeView === 'optimiser' ? () => setOpenAddJobSignal((n) => n + 1) : undefined
            }
            onCreateSchedule={
              activeView === 'optimiser' ? () => setOpenCreateSchedulePageSignal((n) => n + 1) : undefined
            }
          />
        </div>

        <main className="flex-1 min-h-0 min-w-0 w-full bg-white pl-8 pr-8 pb-12 overflow-y-auto overflow-x-hidden">
          {activeView === 'optimiser' && optimiserSubView === 'scope' ? (
            <div className="pt-5">
              <ScopePage />
            </div>
          ) : activeView === 'optimiser' && optimiserSubView === 'schedule-detail' ? (
            <div className="pt-5">
              <ScheduleDetailPage />
            </div>
          ) : activeView === 'optimiser' ? (
            <div className="pt-5">
              <OptimiserPage
                onAddJob={() => setOptimiserSubView('scope')}
                openScheduleDrawer={openScheduleDrawerSignal}
                openAddJob={openAddJobSignal}
                resetToUpcoming={resetToUpcomingSignal}
                openCreateSchedulePage={openCreateSchedulePageSignal}
                resetToRecommendationsLanding={resetToRecommendationsLandingSignal}
                onOpenScheduleDetail={() => setOptimiserSubView('schedule-detail')}
              />
            </div>
          ) : activeView === 'global-configuration' ? (
            <div className="pt-5">
              <GlobalConfigurationPage />
            </div>
          ) : activeView === 'inventory-goals' ? (
            <div className="pt-5">
              <InventoryGoalsPage onCreateGoal={handleInventoryCreateGoal} />
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
            <OverviewPage assignee={assignee} setAssignee={setAssignee} />
          )}
        </main>
      </div>

      <SetInventoryGoalModal
        open={inventoryGoalModalOpen}
        onClose={() => setInventoryGoalModalOpen(false)}
        onCreate={() => {}}
      />
    </div>
  )
}
