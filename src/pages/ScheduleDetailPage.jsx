import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { IconSearch, IconChevronDown, IconChevronRight, IconShare, IconDocument, IconClose, IconAlertTriangle, IconInfo as DsIconInfo, IconArrowLeft, IconGears, IconTruckTu, IconPackageTu, IconRebalancing, IconReplenishment, IconCalendarNote, IconTrendUp, IconFilterFunnel, IconColumnSettings, IconSortOrder } from '../components/icons'
function IconInfo() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-[#9ca3af]" aria-hidden>
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 6v4M7 4.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
function IconSortDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 text-[#9ca3af]" aria-hidden>
      <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** 2×3 dot grip — Figma scratchpad 822:24914 */
function IconColumnDragHandle({ className, ...rest }) {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="none" className={`shrink-0 text-[#4b535c] ${className || ''}`} aria-hidden {...rest}>
      <circle cx="2.5" cy="2.5" r="1.5" fill="currentColor" />
      <circle cx="7.5" cy="2.5" r="1.5" fill="currentColor" />
      <circle cx="2.5" cy="8" r="1.5" fill="currentColor" />
      <circle cx="7.5" cy="8" r="1.5" fill="currentColor" />
      <circle cx="2.5" cy="13.5" r="1.5" fill="currentColor" />
      <circle cx="7.5" cy="13.5" r="1.5" fill="currentColor" />
    </svg>
  )
}

/** Draggable wrapper — HTML5 drag on <svg> is unreliable; use a span as drag source. */
function TripColumnDragGrip({ visualIndex, onDragStart }) {
  return (
    <span
      role="button"
      tabIndex={0}
      draggable
      aria-label="Drag to reorder column"
      title="Drag to reorder column"
      className="inline-flex shrink-0 cursor-grab select-none rounded-[2px] p-0.5 -m-0.5 align-middle active:cursor-grabbing focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
      onMouseDown={(e) => e.stopPropagation()}
      onDragStart={(e) => onDragStart(visualIndex, e)}
    >
      <IconColumnDragHandle className="pointer-events-none" />
    </span>
  )
}

/** Trips table data cols; 3 = Revenue increase, 5 = Recommendations updated (long headers) */
const TRIPS_TABLE_DEFAULT_COL_WIDTHS = [200, 200, 120, 220, 160, 230, 100, 200]
const TRIPS_TABLE_NUM_DATA_COLS = TRIPS_TABLE_DEFAULT_COL_WIDTHS.length
const TRIPS_COL_DND_MIME = 'application/x-autone-trip-col'
/** Logical product table columns are 0–14 (Status = 14). */
const PRODUCTS_TABLE_NUM_DATA_COLS = 15
const PRODUCTS_COL_DND_MIME = 'application/x-autone-products-col'
const LOCATIONS_TABLE_NUM_DATA_COLS = 13
const LOCATIONS_COL_DND_MIME = 'application/x-autone-locations-col'

function moveTripTableColumnOrder(order, fromVisualIndex, toVisualIndex) {
  if (
    fromVisualIndex === toVisualIndex ||
    fromVisualIndex < 0 ||
    toVisualIndex < 0 ||
    fromVisualIndex >= order.length ||
    toVisualIndex >= order.length
  ) {
    return order
  }
  const next = [...order]
  const [removed] = next.splice(fromVisualIndex, 1)
  next.splice(toVisualIndex, 0, removed)
  return next
}

const TRIP_COL_RESIZE_LABELS = [
  'Resize Sending location column',
  'Resize Receiving location column',
  'Resize Transfers column',
  'Resize Revenue increase column',
  'Resize Recommended transfers column',
  'Resize Recommendations updated column',
  'Resize Products column',
  'Resize Status column',
]
const SCHEDULE_CREATION_DATE = '24/02/2026'
const SCHEDULE_SUBMISSION_DEADLINE = '28/02/2026, 1:00 PM'
const SCHEDULE_DEADLINE_BANNER_LABEL = 'Deadline: 28 Feb, 1PM'
const SCHEDULE_EXCEPTIONS_PENDING = 12
const SCHEDULE_IMPORTANT_UPDATES_COUNT = 2

const TRIPS_OPERA = [
  {
    id: 1,
    from: 'Cannes',
    fromCode: 'A1R',
    to: 'Opéra',
    toCode: 'A1A',
    transfers: '119',
    revenue: '€23.5K',
    recommended: '119',
    products: 68,
    movementType: 'Rebalancing',
    badges: ['VIS', 'REV'],
    recommendationsUpdated: '26/02/2026',
    recommendationsUpdatedTime: '14:32',
    recommendationsUpdatedBy: 'System',
    status: 'approved_by_system',
  },
  {
    id: 2,
    from: 'G.I cap 3000',
    fromCode: 'A3E',
    to: 'Opéra',
    toCode: 'A1A',
    transfers: '35',
    revenue: '€5.73K',
    recommended: '35',
    products: 23,
    movementType: 'Rebalancing',
    badges: ['VIS', 'REV'],
    recommendationsUpdated: '24/02/2026',
    recommendationsUpdatedTime: '09:15',
    recommendationsUpdatedBy: 'User',
    status: 'needs_review_from_user',
  },
  {
    id: 3,
    from: 'Printemps toulon',
    fromCode: 'A5O',
    to: 'Opéra',
    toCode: 'A1A',
    transfers: '24',
    revenue: '€5.09K',
    recommended: '24',
    products: 16,
    movementType: 'Replenishment',
    badges: ['VIS', 'REV'],
    status: 'last_edited_by_user',
    editedByUser: 'Csabi Toth',
    recommendationsUpdated: '26/02/2026',
    recommendationsUpdatedTime: '16:48',
    recommendationsUpdatedBy: 'User',
  },
  {
    id: 4,
    from: 'Pr.com',
    fromCode: 'A9E',
    to: 'Opéra',
    toCode: 'A1A',
    transfers: '6',
    revenue: '€2.76K',
    recommended: '6',
    products: 2,
    movementType: 'Rebalancing',
    badges: ['REV'],
    status: 'approved_by_system',
    recommendationsUpdated: '24/02/2026',
    recommendationsUpdatedTime: '11:03',
    recommendationsUpdatedBy: 'System',
  },
  {
    id: 5,
    from: 'Bruxelles',
    fromCode: 'A2F',
    to: 'Opéra',
    toCode: 'A1A',
    transfers: '15',
    revenue: '€2.28K',
    recommended: '15',
    products: 12,
    movementType: 'Reorder',
    badges: ['VIS', 'REV'],
    status: 'partially_approved',
    recommendationsUpdated: '26/02/2026',
    recommendationsUpdatedTime: '08:22',
    recommendationsUpdatedBy: 'System',
  },
  {
    id: 6,
    from: 'G.I annecy',
    fromCode: 'A3C',
    to: 'Opéra',
    toCode: 'A1A',
    transfers: '4',
    revenue: '€1.98K',
    recommended: '4',
    products: 4,
    movementType: 'Replenishment',
    badges: ['REV'],
    status: 'approved_by_user',
    approvedByUser: 'Jess Briggs',
    recommendationsUpdated: '24/02/2026',
    recommendationsUpdatedTime: '15:07',
    recommendationsUpdatedBy: 'User',
  },
  {
    id: 101,
    from: 'Lyon Herriot',
    fromCode: 'A4C',
    to: 'Opéra',
    toCode: 'A1A',
    transfers: '18',
    revenue: '€3.2K',
    recommended: '18',
    products: 10,
    movementType: 'Rebalancing',
    badges: ['VIS', 'REV'],
    status: 'approved_by_user',
    approvedByUser: 'Jess Briggs',
    recommendationsUpdated: '26/02/2026',
    recommendationsUpdatedTime: '10:41',
    recommendationsUpdatedBy: 'User',
  },
  {
    id: 102,
    from: 'Cap 3000',
    fromCode: 'A3E',
    to: 'Opéra',
    toCode: 'A1A',
    transfers: '8',
    revenue: '€1.5K',
    recommended: '8',
    products: 5,
    movementType: 'Replenishment',
    badges: ['REV'],
    status: 'last_edited_by_user',
    editedByUser: 'Csabi Toth',
    recommendationsUpdated: '24/02/2026',
    recommendationsUpdatedTime: '13:55',
    recommendationsUpdatedBy: 'System',
  },
  {
    id: 103,
    from: 'Nice',
    fromCode: 'NCE06',
    to: 'Opéra',
    toCode: 'A1A',
    transfers: '12',
    revenue: '€2.1K',
    recommended: '12',
    products: 7,
    movementType: 'Rebalancing',
    badges: ['VIS', 'REV'],
    status: 'unapproved',
    editedByUser: 'Csabi Toth',
    recommendationsUpdated: '26/02/2026',
    recommendationsUpdatedTime: '17:19',
    recommendationsUpdatedBy: 'User',
  },
]

// Helper to get status from row (supports both status and legacy approvalStatus)
function getRowStatus(row) {
  if (row.status) return row.status
  if (row.approvalStatus === 'approved_by_system') return 'approved_by_system'
  if (row.approvalStatus === 'approved_by_user') return 'approved_by_user'
  if (row.approvalStatus === 'edited_by_user') return 'last_edited_by_user'
  return 'unapproved'
}

const TRIPS_OTHER = [
  {
    id: 7,
    from: 'Miramas',
    fromCode: 'MRS01',
    to: 'Romans',
    toCode: 'ROM02',
    transfers: '180',
    revenue: '€52.4K',
    recommended: '192',
    products: 18,
    movementType: 'Replenishment',
    badges: ['MDQ', 'VIS', 'REV'],
    recommendationsUpdated: '26/02/2026',
    recommendationsUpdatedTime: '12:08',
    recommendationsUpdatedBy: 'System',
    status: 'approved_by_system',
  },
  {
    id: 8,
    from: 'Troyes',
    fromCode: 'TRY03',
    to: 'Grenoble',
    toCode: 'GRE04',
    transfers: '164',
    revenue: '€41.7K',
    recommended: '176',
    products: 14,
    movementType: 'Rebalancing',
    badges: ['MDQ', 'VIS', 'REV'],
    recommendationsUpdated: '24/02/2026',
    recommendationsUpdatedTime: '09:33',
    recommendationsUpdatedBy: 'User',
    status: 'unapproved',
  },
  {
    id: 9,
    from: 'Cannes',
    fromCode: 'CAN05',
    to: 'Nice',
    toCode: 'NCE06',
    transfers: '192',
    revenue: '€38.2K',
    recommended: '200',
    products: 12,
    movementType: 'Reorder',
    badges: ['MDQ', 'VIS', 'REV'],
    recommendationsUpdated: '26/02/2026',
    recommendationsUpdatedTime: '14:18',
    recommendationsUpdatedBy: 'System',
  },
  {
    id: 10,
    from: 'Miramas',
    fromCode: 'MRS01',
    to: 'Toulon',
    toCode: 'TLN07',
    transfers: '175',
    revenue: '€36.9K',
    recommended: '188',
    products: 9,
    movementType: 'Replenishment',
    badges: ['MDQ', 'VIS', 'REV'],
    recommendationsUpdated: '24/02/2026',
    recommendationsUpdatedTime: '11:27',
    recommendationsUpdatedBy: 'User',
  },
  {
    id: 11,
    from: 'Grenoble',
    fromCode: 'GRE04',
    to: 'Cannes',
    toCode: 'CAN05',
    transfers: '162',
    revenue: '€34.1K',
    recommended: '170',
    products: 11,
    movementType: 'Rebalancing',
    badges: ['MDQ', 'VIS', 'REV'],
    recommendationsUpdated: '26/02/2026',
    recommendationsUpdatedTime: '16:52',
    recommendationsUpdatedBy: 'System',
  },
  {
    id: 12,
    from: 'Romans',
    fromCode: 'ROM02',
    to: 'Troyes',
    toCode: 'TRY03',
    transfers: '148',
    revenue: '€29.8K',
    recommended: '159',
    products: 10,
    movementType: 'Replenishment',
    badges: ['MDQ', 'VIS', 'REV'],
    recommendationsUpdated: '24/02/2026',
    recommendationsUpdatedTime: '10:05',
    recommendationsUpdatedBy: 'User',
  },
  {
    id: 13,
    from: 'Troyes',
    fromCode: 'TRY03',
    to: 'Cannes',
    toCode: 'CAN05',
    transfers: '136',
    revenue: '€27.5K',
    recommended: '144',
    products: 8,
    movementType: 'Rebalancing',
    badges: ['MDQ', 'VIS', 'REV'],
    recommendationsUpdated: '26/02/2026',
    recommendationsUpdatedTime: '13:41',
    recommendationsUpdatedBy: 'System',
  },
  {
    id: 14,
    from: 'Nice',
    fromCode: 'NCE06',
    to: 'Grenoble',
    toCode: 'GRE04',
    transfers: '142',
    revenue: '€26.3K',
    recommended: '151',
    products: 7,
    movementType: 'Replenishment',
    badges: ['MDQ', 'VIS', 'REV'],
    recommendationsUpdated: '24/02/2026',
    recommendationsUpdatedTime: '08:59',
    recommendationsUpdatedBy: 'User',
  },
  {
    id: 15,
    from: 'Cannes',
    fromCode: 'CAN05',
    to: 'Romans',
    toCode: 'ROM02',
    transfers: '128',
    revenue: '€24.7K',
    recommended: '136',
    products: 6,
    movementType: 'Rebalancing',
    badges: ['MDQ', 'VIS', 'REV'],
    recommendationsUpdated: '26/02/2026',
    recommendationsUpdatedTime: '15:23',
  },
  {
    id: 16,
    from: 'Toulon',
    fromCode: 'TLN07',
    to: 'Miramas',
    toCode: 'MRS01',
    transfers: '120',
    revenue: '€22.4K',
    recommended: '129',
    products: 5,
    movementType: 'Replenishment',
    badges: ['MDQ', 'VIS', 'REV'],
    recommendationsUpdated: '24/02/2026',
    recommendationsUpdatedTime: '11:46',
  },
  {
    id: 17,
    from: 'Grenoble',
    fromCode: 'GRE04',
    to: 'Romans',
    toCode: 'ROM02',
    transfers: '138',
    revenue: '€21.3K',
    recommended: '145',
    products: 6,
    movementType: 'Rebalancing',
    badges: ['MDQ', 'VIS', 'REV'],
    recommendationsUpdated: '26/02/2026',
    recommendationsUpdatedTime: '17:02',
  },
  {
    id: 18,
    from: 'Nice',
    fromCode: 'NCE06',
    to: 'Toulon',
    toCode: 'TLN07',
    transfers: '112',
    revenue: '€18.7K',
    recommended: '120',
    products: 4,
    movementType: 'Replenishment',
    badges: ['MDQ', 'VIS', 'REV'],
    recommendationsUpdated: '24/02/2026',
    recommendationsUpdatedTime: '09:18',
  },
]

const TRIPS_ALL = [...TRIPS_OPERA, ...TRIPS_OTHER]

const VIEW_OPTIONS = [
  'Show all recommendations',
  'Exception 1 — Transfer units lower than 10 · Location: Opéra',
  'Exception 2 — Product: A1252810, A12528YY, A13314YY',
]

const EDITED_EXCEPTION_IDS = [3, 5]

// Mock locations for Locations tab table
const LOCATIONS_TABLE_DATA = [
  { id: 1, name: 'Suk003 londres maryleb...', code: 'SUK003', transfersIn: 40, transfersInSub: '2 (max 2)', transfersOut: 0, transfersOutSub: '0', revenueIncrease: '€5.21K', recommendedIn: 40, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 0, recommendationsUpdated: '26/02/2026', recommendationsUpdatedTime: '14:32', recommendationsUpdatedBy: 'System', stockInCirculation: 145, stockInTransit: 12, salesL7: 11, salesL30: 40, forecast: 13.46, stockouts: '9 → 0', overstocks: '0 → 0', understocks: '95 → 67' },
  { id: 2, name: 'Sfr004 fd calvaire', code: 'SFR004', transfersIn: 38, transfersInSub: '2 (max 2)', transfersOut: 0, transfersOutSub: '0', revenueIncrease: '€4.4K', recommendedIn: 38, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 0, recommendationsUpdated: '24/02/2026', recommendationsUpdatedTime: '09:15', recommendationsUpdatedBy: 'User', stockInCirculation: 89, stockInTransit: 0, salesL7: 8, salesL30: 32, forecast: 10.82, stockouts: '2 → 0', overstocks: '7 → 0', understocks: '154 → 139' },
  { id: 13, name: 'Out001 la vallée village', code: 'OUT001', locationType: 'outlet', transfersIn: 28, transfersInSub: '1 (max 2)', transfersOut: 0, transfersOutSub: '0', revenueIncrease: '€2.98K', recommendedIn: 28, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 0, recommendationsUpdated: '26/02/2026', recommendationsUpdatedTime: '16:48', recommendationsUpdatedBy: 'User', stockInCirculation: 56, stockInTransit: 8, salesL7: 4, salesL30: 16, forecast: 5.12, stockouts: '6 → 3', overstocks: '8 → 2', understocks: '62 → 44' },
  { id: 3, name: 'Sfr012 legendre', code: 'SFR012', transfersIn: 35, transfersInSub: '1 (max 2)', transfersOut: 15, transfersOutSub: '1 (max 3)', revenueIncrease: '€4.12K', recommendedIn: 35, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 15, recommendationsUpdated: '24/02/2026', recommendationsUpdatedTime: '11:03', recommendationsUpdatedBy: 'System', stockInCirculation: 210, stockInTransit: 18, salesL7: 6, salesL30: 28, forecast: 9.14, stockouts: '5 → 2', overstocks: '12 → 4', understocks: '124 → 82' },
  { id: 4, name: 'Sfr008 saints-peres', code: 'SFR008', transfersIn: 42, transfersInSub: '2 (max 2)', transfersOut: 0, transfersOutSub: '0', revenueIncrease: '€5.89K', recommendedIn: 42, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 0, recommendationsUpdated: '26/02/2026', recommendationsUpdatedTime: '08:22', recommendationsUpdatedBy: 'System', stockInCirculation: 320, stockInTransit: 25, salesL7: 14, salesL30: 55, forecast: 15.22, stockouts: '3 → 0', overstocks: '2 → 0', understocks: '73 → 55' },
  { id: 5, name: 'Sfr013 sevigne', code: 'SFR013', transfersIn: 33, transfersInSub: '2 (max 2)', transfersOut: 0, transfersOutSub: '0', revenueIncrease: '€3.67K', recommendedIn: 33, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 0, recommendationsUpdated: '24/02/2026', recommendationsUpdatedTime: '15:07', recommendationsUpdatedBy: 'User', stockInCirculation: 78, stockInTransit: 5, salesL7: 5, salesL30: 22, forecast: 8.14, stockouts: '12 → 5', overstocks: '18 → 6', understocks: '88 → 61' },
  { id: 14, name: 'Wh001 paris entrepôt', code: 'WH001', locationType: 'warehouse', transfersIn: 95, transfersInSub: '4 (max 4)', transfersOut: 92, transfersOutSub: '4 (max 4)', revenueIncrease: '€12.4K', recommendedIn: 95, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 92, recommendationsUpdated: '26/02/2026', recommendationsUpdatedTime: '10:41', recommendationsUpdatedBy: 'User', stockInCirculation: 580, stockInTransit: 45, salesL7: 0, salesL30: 0, forecast: 0, stockouts: '0 → 0', overstocks: '45 → 12', understocks: '0 → 0' },
  { id: 6, name: 'Sbe002 anvers', code: 'SBE002', transfersIn: 29, transfersInSub: '1 (max 2)', transfersOut: 29, transfersOutSub: '2 (max 3)', revenueIncrease: '€3.21K', recommendedIn: 29, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 29, recommendationsUpdated: '24/02/2026', recommendationsUpdatedTime: '13:55', recommendationsUpdatedBy: 'System', stockInCirculation: 112, stockInTransit: 0, salesL7: 3, salesL30: 18, forecast: 6.92, stockouts: '18 → 12', overstocks: '5 → 2', understocks: '112 → 78' },
  { id: 7, name: 'Sfr003 courcelles', code: 'SFR003', transfersIn: 45, transfersInSub: '2 (max 2)', transfersOut: 0, transfersOutSub: '0', revenueIncrease: '€6.12K', recommendedIn: 45, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 0, recommendationsUpdated: '26/02/2026', recommendationsUpdatedTime: '17:19', recommendationsUpdatedBy: 'User', stockInCirculation: 198, stockInTransit: 22, salesL7: 16, salesL30: 62, forecast: 17.08, stockouts: '1 → 0', overstocks: '0 → 0', understocks: '42 → 28' },
  { id: 8, name: 'Sfr001 bonaparte', code: 'SFR001', transfersIn: 52, transfersInSub: '2 (max 2)', transfersOut: 0, transfersOutSub: '0', revenueIncrease: '€7.34K', recommendedIn: 52, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 0, recommendationsUpdated: '24/02/2026', recommendationsUpdatedTime: '09:33', recommendationsUpdatedBy: 'System', stockInCirculation: 265, stockInTransit: 15, salesL7: 19, salesL30: 78, forecast: 21.45, stockouts: '0 → 0', overstocks: '0 → 0', understocks: '28 → 15' },
  { id: 15, name: 'Web001 france online', code: 'WEB001', locationType: 'ecomm', transfersIn: 0, transfersInSub: '0', transfersOut: 0, transfersOutSub: '0', revenueIncrease: '€8.56K', recommendedIn: 0, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 0, recommendationsUpdated: '26/02/2026', recommendationsUpdatedTime: '12:08', recommendationsUpdatedBy: 'User', stockInCirculation: 0, stockInTransit: 0, salesL7: 22, salesL30: 95, forecast: 28.34, stockouts: '0 → 0', overstocks: '0 → 0', understocks: '0 → 0' },
  { id: 9, name: 'Sfr005 charonne', code: 'SFR005', transfersIn: 31, transfersInSub: '1 (max 2)', transfersOut: 0, transfersOutSub: '0', revenueIncrease: '€3.45K', recommendedIn: 31, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 0, recommendationsUpdated: '24/02/2026', recommendationsUpdatedTime: '11:27', recommendationsUpdatedBy: 'System', stockInCirculation: 67, stockInTransit: 0, salesL7: 4, salesL30: 19, forecast: 7.28, stockouts: '22 → 18', overstocks: '9 → 3', understocks: '136 → 94' },
  { id: 10, name: 'Sfr018 lyon', code: 'SFR018', transfersIn: 48, transfersInSub: '2 (max 2)', transfersOut: 0, transfersOutSub: '0', revenueIncrease: '€6.78K', recommendedIn: 48, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 0, recommendationsUpdated: '26/02/2026', recommendationsUpdatedTime: '16:52', recommendationsUpdatedBy: 'User', stockInCirculation: 175, stockInTransit: 12, salesL7: 17, salesL30: 68, forecast: 18.92, stockouts: '2 → 1', overstocks: '3 → 1', understocks: '56 → 38' },
  { id: 11, name: 'Ssp001 madrid coello', code: 'SSP001', transfersIn: 36, transfersInSub: '2 (max 2)', transfersOut: 0, transfersOutSub: '0', revenueIncrease: '€4.02K', recommendedIn: 36, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 0, recommendationsUpdated: '24/02/2026', recommendationsUpdatedTime: '10:05', recommendationsUpdatedBy: 'System', stockInCirculation: 134, stockInTransit: 9, salesL7: 7, salesL30: 30, forecast: 9.56, stockouts: '8 → 4', overstocks: '14 → 5', understocks: '98 → 72' },
  { id: 12, name: 'Sfr014 guichard', code: 'SFR014', transfersIn: 34, transfersInSub: '1 (max 2)', transfersOut: 0, transfersOutSub: '0', revenueIncrease: '€3.89K', recommendedIn: 34, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 0, recommendationsUpdated: '26/02/2026', recommendationsUpdatedTime: '13:41', recommendationsUpdatedBy: 'User', stockInCirculation: 91, stockInTransit: 7, salesL7: 6, salesL30: 26, forecast: 8.42, stockouts: '11 → 7', overstocks: '6 → 2', understocks: '82 → 58' },
]

// Mock products for trip drilldown (keyed by trip id)
const PRODUCTS_BY_TRIP = {
  1: [
    { id: 1, name: 'Croi-sac zip l', sku: 'A1398810', colour: 'Noir', transfers: 3, transfersSub: 1, revenue: '€1.48K', recommended: 1, recommendedBadges: ['REV'], recommendedSub: 2, salesL7: 1, salesL30: 2, forecast: 1.87, stockouts: '0 -> 0', locations: '2 -> 2', overstocks: '4 -> 1', understocks: '8 -> 5', depth: '5.0 -> 5.0',     status: 'approved_by_system', recommendationsUpdated: '26/02/2026', recommendationsUpdatedTime: '14:32', recommendationsUpdatedBy: 'System', currentUnits: 12, currentUnitsInTransit: 3, leftInWarehouseAllocate: 45, leftInWarehouseSell: 32 },
    { id: 2, name: 'Pre-sac seau m', sku: 'A101080', colour: 'Bleu petrole', transfers: 2, transfersSub: 1, revenue: '€1.12K', recommended: 2, recommendedBadges: ['VIS'], recommendedSub: 1, salesL7: 2, salesL30: 3, forecast: 0.54, stockouts: '0 -> 1', locations: '2 -> 1', overstocks: '3 -> 0', understocks: '2 -> 0', depth: '3.0 -> 6.0', recommendationsUpdated: '24/02/2026', recommendationsUpdatedTime: '09:15', recommendationsUpdatedBy: 'User', currentUnits: 8, currentUnitsInTransit: 0, leftInWarehouseAllocate: 120, leftInWarehouseSell: 95 },
    { id: 3, name: 'Ang-sac pte main m', sku: 'A1252810', colour: 'Figue', transfers: 3, transfersSub: 2, revenue: '€1.89K', recommended: 3, recommendedBadges: ['REV', 'VIS'], recommendedSub: 1, salesL7: 1, salesL30: 4, forecast: 2.1, stockouts: '1 -> 0', locations: '2 -> 2', overstocks: '5 -> 2', understocks: '6 -> 3', depth: '4.2 -> 4.8',     status: 'last_edited_by_user', editedByUser: 'Csabi Toth', recommendationsUpdated: '26/02/2026', recommendationsUpdatedTime: '16:48', recommendationsUpdatedBy: 'User', currentUnits: 25, currentUnitsInTransit: 5, leftInWarehouseAllocate: 18, leftInWarehouseSell: 12 },
    { id: 4, name: 'Croi-sac zip s', sku: 'A1398811', colour: 'Noir', transfers: 1, transfersSub: 2, revenue: '€0.98K', recommended: 1, recommendedBadges: ['REV'], recommendedSub: 2, salesL7: 0, salesL30: 1, forecast: 0.32, stockouts: '0 -> 0', locations: '1 -> 2', overstocks: '2 -> 1', understocks: '4 -> 2', depth: '5.0 -> 5.0', status: 'approved_by_user', approvedByUser: 'Jess Briggs', recommendationsUpdated: '24/02/2026', recommendationsUpdatedTime: '11:03', recommendationsUpdatedBy: 'User', currentUnits: 3, currentUnitsInTransit: 1, leftInWarehouseAllocate: 65, leftInWarehouseSell: 50 },
    { id: 5, name: 'Pre-sac seau s', sku: 'A101081', colour: 'Bleu petrole', transfers: 2, transfersSub: 1, revenue: '€0.76K', recommended: 2, recommendedBadges: ['VIS'], recommendedSub: 1, salesL7: 1, salesL30: 2, forecast: 0.54, stockouts: '0 -> 1', locations: '2 -> 1', overstocks: '3 -> 0', understocks: '2 -> 0', depth: '3.0 -> 6.0', status: 'needs_review_from_user', recommendationsUpdated: '26/02/2026', recommendationsUpdatedTime: '08:22', recommendationsUpdatedBy: 'System', currentUnits: 15, currentUnitsInTransit: 2, leftInWarehouseAllocate: 30, leftInWarehouseSell: 22 },
    { id: 6, name: 'Ang-sac pte main s', sku: 'A1252811', colour: 'Figue', transfers: 1, transfersSub: 1, revenue: '€0.65K', recommended: 1, recommendedBadges: ['REV'], recommendedSub: 1, salesL7: 0, salesL30: 1, forecast: 0.21, stockouts: '0 -> 0', locations: '2 -> 2', overstocks: '4 -> 1', understocks: '3 -> 1', depth: '4.0 -> 4.5', status: 'approved_by_system', recommendationsUpdated: '24/02/2026', recommendationsUpdatedTime: '15:07', recommendationsUpdatedBy: 'System', currentUnits: 7, currentUnitsInTransit: 0, leftInWarehouseAllocate: 42, leftInWarehouseSell: 28 },
  ],
  2: [
    { id: 7, name: 'Sac zip l', sku: 'B200001', colour: 'Noir', transfers: 2, transfersSub: 1, revenue: '€0.89K', recommended: 2, recommendedBadges: ['REV'], recommendedSub: 1, salesL7: 1, salesL30: 2, forecast: 0.45, stockouts: '0 -> 0', locations: '2 -> 2', overstocks: '2 -> 1', understocks: '5 -> 3', depth: '4.5 -> 5.0', status: 'approved_by_user', approvedByUser: 'Jess Briggs', recommendationsUpdated: '26/02/2026', recommendationsUpdatedTime: '13:55', recommendationsUpdatedBy: 'User', currentUnits: 18, currentUnitsInTransit: 4, leftInWarehouseAllocate: 88, leftInWarehouseSell: 70 },
    { id: 8, name: 'Sac seau m', sku: 'B200002', colour: 'Noir', transfers: 1, transfersSub: 2, revenue: '€0.52K', recommended: 1, recommendedBadges: ['VIS'], recommendedSub: 2, salesL7: 0, salesL30: 1, forecast: 0.28, stockouts: '0 -> 1', locations: '1 -> 2', overstocks: '1 -> 0', understocks: '3 -> 1', depth: '3.6 -> 4.3', status: 'last_edited_by_user', editedByUser: 'Csabi Toth', recommendationsUpdated: '24/02/2026', recommendationsUpdatedTime: '17:19', recommendationsUpdatedBy: 'User', currentUnits: 11, currentUnitsInTransit: 2, leftInWarehouseAllocate: 55, leftInWarehouseSell: 40 },
  ],
}

// Default products when trip not in PRODUCTS_BY_TRIP
const DEFAULT_PRODUCTS = PRODUCTS_BY_TRIP[1]

// Product IDs that show 'Edited' badge in Products drilldown
const PRODUCTS_EDITED_IDS = [1, 3]

// Mock locations for stock analysis drilldown (keyed by product id)
const LOCATIONS_BY_PRODUCT = {
  1: [
    { id: 1, name: 'Opéra', code: 'A1A', stock: '6 → 12', tu: '6 → 12', tuWarehouse: 6, tuTruck: [3, 3], salesL7: 1, salesL30: 2, forecast: 1.87, stockouts: '0 → 0', coverage: '0% → 100%', targetWeeks: 6, receivingWeeksCoverage: '3.2 → 6.4 (6 target)', recommendationReason: 'Increase revenue', revenueIncrease: '€679', availableToSend: 4, sendingStock: '10 → 7', sendingCoverage: '2.1 → 1.8 (4 target)', approvalStatus: 'approved_by_system' },
    { id: 2, name: 'G.L. Haussmann Maro', code: 'AIA', stock: '6 → 6', tu: '4 → 5', tuWarehouse: 3, tuTruck: [1], salesL7: 0, salesL30: 0, forecast: 0, stockouts: '0 → 0', coverage: '0% → 0%', targetWeeks: 4, receivingWeeksCoverage: 'N/A (0 forecast)', recommendationReason: 'Reduce overstock', revenueIncrease: '€120', availableToSend: 3, sendingStock: '8 → 5', sendingCoverage: 'N/A (0 forecast)' },
    { id: 3, name: 'La Défense', code: 'A2B', stock: '5 → 5', tu: '4 → 5', tuWarehouse: 3, tuTruck: [1], salesL7: 1, salesL30: 1, forecast: 0.76, stockouts: '0 → 0', coverage: '100% → 100%', targetWeeks: 4, receivingWeeksCoverage: '5.2 → 5.8 (4 target)', recommendationReason: 'Increase revenue', revenueIncrease: '€245', availableToSend: 4, sendingStock: '9 → 6', sendingCoverage: '1.8 → 1.2 (4 target)', approvalStatus: 'edited_by_user', editedByUser: 'Csabi Toth' },
    { id: 4, name: 'Cap 3000', code: 'A3E', stock: '4 → 4', tu: '0 → 1', tuWarehouse: null, tuTruck: [1], salesL7: 0, salesL30: 2, forecast: 0.32, stockouts: '0 → 0', coverage: '0% → 0%', targetWeeks: 4, receivingWeeksCoverage: 'N/A (0 forecast)', recommendationReason: 'Improve coverage', revenueIncrease: '€89', availableToSend: 2, sendingStock: '6 → 5', sendingCoverage: 'N/A (0 forecast)', approvalStatus: 'approved_by_user', approvedByUser: 'Jess Briggs' },
    { id: 5, name: 'Lyon Herriot', code: 'A4C', stock: '5 → 5', tu: '0 → 1', tuWarehouse: null, tuTruck: [1], salesL7: 1, salesL30: 1, forecast: 0.54, stockouts: '0 → 0', coverage: '0% → 0%', targetWeeks: 4, receivingWeeksCoverage: '4.1 → 4.5 (4 target)', recommendationReason: 'Increase revenue', revenueIncrease: '€156', availableToSend: 3, sendingStock: '7 → 6', sendingCoverage: '2.4 → 2.0 (4 target)' },
    { id: 6, name: 'Printemps Lille', code: 'ASF', stock: '8 → 8', tu: '0 → 20', tuWarehouse: 4, tuTruck: [20], salesL7: 2, salesL30: 4, forecast: 2.1, stockouts: '0 → 0', coverage: '100% → 100%', targetWeeks: 6, receivingWeeksCoverage: '3.8 → 6.2 (6 target)', recommendationReason: 'Increase revenue', revenueIncrease: '€1.2K', availableToSend: 5, sendingStock: '12 → 8', sendingCoverage: '3.2 → 2.1 (6 target)', approvalStatus: 'approved_by_system' },
  ],
  2: [
    { id: 1, name: 'Opéra', code: 'A1A', stock: '4 → 4', tu: '4 → 4', tuWarehouse: 4, tuTruck: [], salesL7: 2, salesL30: 3, forecast: 0.54, stockouts: '0 → 0', coverage: '100% → 100%', targetWeeks: 4, receivingWeeksCoverage: '5.2 → 5.2 (4 target)', recommendationReason: 'Increase revenue', revenueIncrease: '€312', availableToSend: 4, sendingStock: '8 → 4', sendingCoverage: '2.0 → 1.0 (4 target)', approvalStatus: 'approved_by_user', approvedByUser: 'Jess Briggs' },
    { id: 2, name: 'La Défense', code: 'A2B', stock: '3 → 3', tu: '3 → 3', tuWarehouse: 3, tuTruck: [], salesL7: 1, salesL30: 2, forecast: 0.45, stockouts: '0 → 0', coverage: '100% → 100%', targetWeeks: 4, receivingWeeksCoverage: '4.1 → 4.1 (4 target)', recommendationReason: 'Reduce understock', revenueIncrease: '€98', availableToSend: 3, sendingStock: '6 → 3', sendingCoverage: '1.5 → 0.8 (4 target)', approvalStatus: 'edited_by_user', editedByUser: 'Csabi Toth' },
  ],
  3: [
    { id: 1, name: 'Opéra', code: 'A1A', stock: '6 → 6', tu: '6 → 6', tuWarehouse: 6, tuTruck: [], salesL7: 1, salesL30: 4, forecast: 2.1, stockouts: '0 → 0', coverage: '100% → 100%', targetWeeks: 6, receivingWeeksCoverage: '2.9 → 2.9 (6 target)', recommendationReason: 'Increase revenue', revenueIncrease: '€445', availableToSend: 6, sendingStock: '12 → 6', sendingCoverage: '2.8 → 1.4 (6 target)' },
    { id: 2, name: 'G.L. Haussmann Maro', code: 'AIA', stock: '5 → 5', tu: '5 → 5', tuWarehouse: 5, tuTruck: [], salesL7: 0, salesL30: 0, forecast: 0, stockouts: '0 → 0', coverage: '0% → 0%', targetWeeks: 5, receivingWeeksCoverage: 'N/A (0 forecast)', recommendationReason: 'Improve coverage', revenueIncrease: '€0', availableToSend: 5, sendingStock: '10 → 5', sendingCoverage: 'N/A (0 forecast)', approvalStatus: 'approved_by_system' },
  ],
}

const DEFAULT_LOCATIONS = LOCATIONS_BY_PRODUCT[1]

// Mock chart data for Transfer detail view (22 days, values 0–8)
const CHART_DATA = Array.from({ length: 22 }, (_, i) => {
  const day = String(i + 1).padStart(2, '0')
  const base = 4 + Math.sin(i * 0.4) * 1.5
  const demand = Math.min(8, 2 + Math.sin(i * 0.3) * 1.2)
  const salesRatio = 0.65 + (i % 5) * 0.05
  const sales = Math.min(demand, demand * salesRatio)
  const lostSales = Math.max(0, demand - sales)
  const invProj = i >= 12 ? base * 0.9 + (i - 12) * 0.1 : 0
  return {
    day,
    actualInventory: Math.min(8, base + 1.5),
    inventoryProjection: Math.min(8, invProj),
    actualDemand: Math.round(demand * 10) / 10,
    actualSales: Math.round(sales * 10) / 10,
    demandForecast: Math.min(8, 2.5 + Math.sin(i * 0.25) * 1.5),
    salesForecast: Math.min(8, 2 + Math.sin(i * 0.25) * 1.2),
    estimatedLostSales: Math.round(lostSales * 10) / 10,
  }
})

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden>
      <path d="M13 4L6 11 3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const STATUS_OPTIONS = [
  { id: 'approved_by_system', displayLabel: 'Approved by system', dotClass: 'bg-[#08a16a]' },
  { id: 'approved_by_user', displayLabel: 'Approved by user', dotClass: 'bg-[#08a16a]' },
  { id: 'last_edited_by_user', displayLabel: 'Last edited by user', dotClass: 'bg-[#0267ff]' },
  { id: 'unapproved', displayLabel: 'Unapproved', dotClass: 'bg-[#878d94]' },
  { id: 'needs_review_from_user', displayLabel: 'Needs review from user', dotClass: 'bg-[#bd5800]' },
  { id: 'partially_approved', displayLabel: 'Partially approved', dotClass: 'bg-[#f29a35]' },
  { id: 'remove_edits', displayLabel: 'Remove edits', dotClass: 'bg-[#A855F7]' },
]

// Selectable options only (short action labels in dropdown; badge shows full displayLabel)
const STATUS_DROPDOWN_OPTIONS = [
  { id: 'approved_by_user', dropdownLabel: 'Approve', dotClass: 'bg-[#08a16a]' },
  { id: 'unapproved', dropdownLabel: 'Unapprove', dotClass: 'bg-[#878d94]' },
  { id: 'needs_review_from_user', dropdownLabel: 'Needs review', dotClass: 'bg-[#bd5800]' },
  { id: 'remove_edits', dropdownLabel: 'Remove edits', dotClass: 'bg-[#A855F7]' },
]

const STATUS_BADGE_CLASSES = {
  approved_by_system: 'bg-[#e4f4ef] text-[#0a0a0a] border-[#08a16a]',
  approved_by_user: 'bg-[#e4f4ef] text-[#0a0a0a] border-[#08a16a]',
  last_edited_by_user: 'bg-[#ebf3ff] text-[#0a0a0a] border-[#0267ff]',
  unapproved: 'bg-[#f4f4f5] text-[#0a0a0a] border-[#878d94]',
  needs_review_from_user: 'bg-[#ffe4cc] text-[#0a0a0a] border-[#bd5800]',
  remove_edits: 'bg-[#f3e8ff] text-[#7c3aed]',
  partially_approved: 'bg-[#fff6e5] text-[#0a0a0a] border-[#f29a35]',
}

function StatusDropdown({ value, userName, onChange, rowId, useShortEditedLabel }) {
  const [open, setOpen] = useState(false)
  const [dropdownId] = useState(() => `status-dd-${rowId}-${Math.random().toString(36).slice(2)}`)
  const buttonRef = useRef(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const opt = STATUS_OPTIONS.find((o) => o.id === value) || STATUS_OPTIONS.find((o) => o.id === 'unapproved')
  const badgeClass = STATUS_BADGE_CLASSES[value] || STATUS_BADGE_CLASSES.unapproved
  const displayLabel =
    value === 'approved_by_user' && userName && !useShortEditedLabel
      ? `Approved by user: ${userName}`
      : value === 'last_edited_by_user'
        ? (useShortEditedLabel ? 'Edited' : (userName ? `Last edited by user: ${userName}` : 'Edited'))
        : opt?.displayLabel ?? 'Unapproved'

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(`[data-status-dropdown="${dropdownId}"]`)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => document.removeEventListener('click', handleClickOutside)
  }, [open, dropdownId])

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({ top: rect.bottom + 4, left: rect.left })
    }
  }, [open])

  const dropdownContent = open && (
    <>
      <div
        role="presentation"
        className="fixed inset-0 z-[60]"
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <div
        className="fixed z-[70] min-w-[200px] rounded-[6px] border border-[#e5e7eb] bg-white py-1 shadow-lg"
        style={{ top: position.top, left: position.left, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        data-status-dropdown={dropdownId}
      >
        {STATUS_DROPDOWN_OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onChange(o.id)
              setOpen(false)
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-left text-[13px] font-medium text-[#0a0a0a] hover:bg-[#f3f4f6]"
          >
            <span className={`size-2 rounded-full shrink-0 ${o.dotClass}`} aria-hidden />
            <span>{o.dropdownLabel}</span>
          </button>
        ))}
      </div>
    </>
  )

  return (
    <div className="relative" data-status-dropdown={dropdownId}>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          setOpen((o) => !o)
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-[6px] border text-[12px] font-medium hover:opacity-90 min-w-0 max-w-full border-transparent ${badgeClass}`}
      >
        <span className={`size-2 rounded-full shrink-0 ${opt.dotClass}`} aria-hidden />
        <span className="truncate">{displayLabel}</span>
        <IconChevronDown className={`size-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {typeof document !== 'undefined' && dropdownContent && createPortal(dropdownContent, document.body)}
    </div>
  )
}

function TransferDetailView({ transfer, product, trip, onBack }) {
  const [chartTimeUnit, setChartTimeUnit] = useState('days')
  const breadcrumbFrom = `${trip.from} [${trip.fromCode}]`
  const breadcrumbTo = trip.to
  const productLabel = product.name
  const productSku = product.sku
  const tripType = trip.movementType || 'Rebalancing'
  const receivingCoverage = transfer.receivingWeeksCoverage ?? (transfer.coverage ? `${transfer.coverage} (${transfer.targetWeeks} target)` : '—')

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Breadcrumb with back arrow */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="h-10 w-10 flex items-center justify-center rounded-[4px] border border-[#e5e7eb] bg-white text-[#4b535c] hover:bg-[#f3f4f6] shrink-0"
          aria-label="Back to Transfers"
        >
          <IconArrowLeft className="size-5" />
        </button>
        <nav className="flex items-center gap-2 text-[14px] text-[#4b535c]">
          <span>{breadcrumbFrom}</span>
          <span>→</span>
          <span>{breadcrumbTo}</span>
          <span>→</span>
          <span className="text-[#0a0a0a]">{productLabel} [{productSku}]</span>
          <span>→</span>
          <span className="font-medium text-[#0a0a0a]">Transfer detail</span>
        </nav>
      </div>

      {/* 2. Summary cards in single row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-[4px] border border-[#E9EAEB] bg-white p-4">
          <h4 className="text-[12px] font-medium text-[#4b535c] mb-2">Product details</h4>
          <div className="text-[14px] text-[#0a0a0a]">
            <div className="font-medium">{product.name}</div>
            <div className="text-[#4b535c]">#{product.sku}</div>
          </div>
        </div>
        <div className="rounded-[4px] border border-[#E9EAEB] bg-white p-4">
          <h4 className="text-[12px] font-medium text-[#4b535c] mb-2">Units and stock</h4>
          <div className="text-[14px] text-[#0a0a0a]">
            <div>Currently in stock: 90 units</div>
            <div className="text-[#4b535c]">Left in warehouse: 1,543 units</div>
          </div>
        </div>
        <div className="rounded-[4px] border border-[#E9EAEB] bg-white p-4">
          <h4 className="text-[12px] font-medium text-[#4b535c] mb-2">Current coverage</h4>
          <div className="text-[14px] text-[#0a0a0a]">
            <div>77% below target</div>
            <div className="text-[#4b535c]">1,543 units</div>
          </div>
        </div>
        <div className="rounded-[4px] border border-[#E9EAEB] bg-white p-4">
          <h4 className="text-[12px] font-medium text-[#4b535c] mb-2">Coverage after replenishment</h4>
          <div className="text-[14px] text-[#0a0a0a]">
            <div>77% below target</div>
            <div className="text-[#4b535c]">1,543 units</div>
          </div>
        </div>
      </div>

      {/* 3. General / Key factors tabs and chart area */}
      <div className="rounded-[4px] border border-[#E9EAEB] bg-white p-4">
        <div className="flex items-center justify-between gap-4 border-b border-[#E9EAEB] mb-4">
          <div className="flex gap-4">
            <button type="button" className="pb-2 border-b-2 border-[#2EB8C2] text-[14px] font-medium text-[#0a0a0a]">General</button>
            <button type="button" className="pb-2 text-[14px] text-[#4b535c] hover:text-[#0a0a0a]">Key factors</button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-[4px] border border-[#E9EAEB] overflow-hidden">
              <button
                type="button"
                onClick={() => setChartTimeUnit('days')}
                className={`px-3 py-1.5 text-[12px] font-medium ${chartTimeUnit === 'days' ? 'bg-[#0267ff] text-white' : 'bg-white text-[#4b535c] hover:bg-[#f8f8f8]'}`}
              >
                Days
              </button>
              <button
                type="button"
                onClick={() => setChartTimeUnit('weeks')}
                className={`px-3 py-1.5 text-[12px] font-medium ${chartTimeUnit === 'weeks' ? 'bg-[#0267ff] text-white' : 'bg-white text-[#4b535c] hover:bg-[#f8f8f8]'}`}
              >
                Weeks
              </button>
            </div>
            <button type="button" className="p-2 rounded-[4px] border border-[#E9EAEB] bg-white text-[#4b535c] hover:bg-[#f8f8f8]" aria-label="Chart settings">
              <IconGears className="size-4" />
            </button>
          </div>
        </div>
        <div className="rounded-[4px] border border-[#E9EAEB] bg-white p-4">
          <div className="flex flex-wrap items-center gap-4 gap-y-2 mb-3 text-[12px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#d1d5db]" />
              <span className="text-[#4b535c]">Actual inventory</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: 'repeating-linear-gradient(45deg, #9ca3af, #9ca3af 1px, #c4c8cc 1px, #c4c8cc 2px)' }} />
              <span className="text-[#4b535c]">Inventory projection</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#60a5fa]" />
              <span className="text-[#4b535c]">Actual demand</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#1e40af]" />
              <span className="text-[#4b535c]">Actual sales</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 rounded-full bg-[#22c55e] shrink-0" />
              <span className="text-[#4b535c]">Demand forecast</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 rounded-full bg-[#15803d] shrink-0" />
              <span className="text-[#4b535c]">Sales forecast</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 rounded-full bg-[#f59e0b] shrink-0" />
              <span className="text-[#4b535c]">Estimated lost sales</span>
            </div>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={CHART_DATA} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <defs>
                  <pattern id="stripedGrey" patternUnits="userSpaceOnUse" width="4" height="4">
                    <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#9ca3af" strokeWidth="1" />
                  </pattern>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9EAEB" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#4b535c' }} axisLine={{ stroke: '#E9EAEB' }} tickLine={{ stroke: '#E9EAEB' }} />
                <YAxis domain={[0, 8]} tick={{ fontSize: 11, fill: '#4b535c' }} axisLine={{ stroke: '#E9EAEB' }} tickLine={{ stroke: '#E9EAEB' }} width={24} />
                <Tooltip />
                <ReferenceLine x="13" stroke="#9ca3af" strokeDasharray="4 4" strokeWidth={1} label={{ value: 'Submit replenishment', position: 'top', fontSize: 10, fill: '#4b535c' }} />
                <ReferenceLine x="14" stroke="#9ca3af" strokeDasharray="4 4" strokeWidth={1} label={{ value: 'Stock arrives', position: 'top', fontSize: 10, fill: '#4b535c' }} />
                <Bar dataKey="actualInventory" fill="#d1d5db" barSize={12} radius={[2, 2, 0, 0]} name="Actual inventory" />
                <Bar dataKey="inventoryProjection" fill="url(#stripedGrey)" barSize={12} radius={[2, 2, 0, 0]} name="Inventory projection" />
                <Bar dataKey="actualDemand" fill="#60a5fa" barSize={12} radius={[2, 2, 0, 0]} name="Actual demand" />
                <Bar dataKey="actualSales" fill="#1e40af" barSize={12} radius={[2, 2, 0, 0]} name="Actual sales" />
                <Line type="monotone" dataKey="demandForecast" stroke="#22c55e" strokeWidth={2} dot={false} name="Demand forecast" />
                <Line type="monotone" dataKey="salesForecast" stroke="#15803d" strokeWidth={2} dot={false} name="Sales forecast" />
                <Line type="monotone" dataKey="estimatedLostSales" stroke="#f59e0b" strokeWidth={2} dot={false} name="Estimated lost sales" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Transfer info, Recommendation, etc. in single card with dividers */}
      <div className="rounded-[4px] border border-[#E9EAEB] bg-white p-6 text-[14px]">
        <div className="pb-4">
          <h3 className="font-medium text-[#0a0a0a] mb-3">Transfer info</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[#4b535c]">Transfer units</span>
              <span className="text-[#0a0a0a] font-medium">{transfer.tu}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#4b535c]">Available to send</span>
              <span className="text-[#0a0a0a] font-medium">{transfer.availableToSend ?? '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#4b535c]">Trip type</span>
              <span className="inline-flex px-2 py-0.5 rounded-[2px] bg-[#f3f4f6] text-[12px] font-medium text-[#4b535c]">{tripType}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 pb-4 border-t border-[#E9EAEB]">
          <h3 className="font-medium text-[#0a0a0a] mb-3">Recommendation</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[#4b535c]">Transfer units</span>
              <span className="text-[#0a0a0a] font-medium">{transfer.tu}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#4b535c]">Revenue increase</span>
              <span className="text-[#0a0a0a] font-medium">{transfer.revenueIncrease ?? '—'}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 pb-4 border-t border-[#E9EAEB]">
          <h3 className="font-medium text-[#0a0a0a] mb-3">Recommendation reasons</h3>
          <p className="text-[#0a0a0a]">{transfer.recommendationReason ?? '—'}</p>
        </div>

        <div className="pt-4 pb-4 border-t border-[#E9EAEB]">
          <h3 className="font-medium text-[#0a0a0a] mb-3">Total stock</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[#4b535c]">{trip.from}</span>
              <span className="text-[#0a0a0a] font-medium">{transfer.sendingStock ?? '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#4b535c]">{transfer.name}</span>
              <span className="text-[#0a0a0a] font-medium">{transfer.stock}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E9EAEB]">
          <h3 className="font-medium text-[#0a0a0a] mb-3">Total weeks coverage</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[#4b535c]">{trip.from}</span>
              <span className="text-[#0a0a0a] font-medium">{transfer.sendingCoverage ?? '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#4b535c]">{transfer.name}</span>
              <span className="text-[#0a0a0a] font-medium">{receivingCoverage}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Portals hover content to document.body with fixed positioning so it is not clipped
 * by scroll containers (e.g. stock analysis table wrapper).
 */
function TuHoverPopover({ children, panel }) {
  const wrapRef = useRef(null)
  const popRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ left: 0, top: 0 })

  const updatePosition = useCallback(() => {
    const el = wrapRef.current
    const pop = popRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const gap = 8
    const pad = 12
    const vw = window.innerWidth
    const vh = window.innerHeight
    let left = rect.right + gap
    let top = rect.top + rect.height / 2

    if (pop) {
      const pr = pop.getBoundingClientRect()
      if (pr.width > 0) {
        if (left + pr.width > vw - pad) {
          left = rect.left - gap - pr.width
        }
        left = Math.max(pad, Math.min(left, vw - pad - pr.width))
        const half = pr.height / 2
        top = Math.max(pad + half, Math.min(vh - pad - half, top))
      }
    } else {
      top = Math.max(pad, Math.min(vh - pad, top))
    }
    setCoords({ left, top })
  }, [])

  useLayoutEffect(() => {
    if (!open) return
    updatePosition()
    const id = requestAnimationFrame(() => updatePosition())

    const pop = popRef.current
    const ro = pop ? new ResizeObserver(() => updatePosition()) : null
    if (pop && ro) ro.observe(pop)

    const onScrollOrResize = () => updatePosition()
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)

    const scrollParents = []
    let node = wrapRef.current?.parentElement
    while (node) {
      const st = getComputedStyle(node)
      if (/(auto|scroll|overlay)/.test(st.overflowY) || /(auto|scroll|overlay)/.test(st.overflowX)) {
        node.addEventListener('scroll', onScrollOrResize, { passive: true })
        scrollParents.push(node)
      }
      node = node.parentElement
    }

    return () => {
      cancelAnimationFrame(id)
      ro?.disconnect()
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
      scrollParents.forEach((n) => n.removeEventListener('scroll', onScrollOrResize))
    }
  }, [open, updatePosition])

  const handleEnter = () => {
    const el = wrapRef.current
    if (el) {
      const rect = el.getBoundingClientRect()
      setCoords({ left: rect.right + 8, top: rect.top + rect.height / 2 })
    }
    setOpen(true)
  }

  return (
    <>
      <div ref={wrapRef} className="relative inline-block" onMouseEnter={handleEnter} onMouseLeave={() => setOpen(false)}>
        {children}
      </div>
      {open &&
        createPortal(
          <div
            ref={popRef}
            className="pointer-events-none fixed z-[10000]"
            style={{ left: coords.left, top: coords.top, transform: 'translateY(-50%)' }}
          >
            {panel}
          </div>,
          document.body
        )}
    </>
  )
}

/** Hover popover for TU warehouse / truck chips (stock analysis table) */
function TuBadgeHoverCard({ loc, borderClassName, stockLabel, stockValue, icon }) {
  const status = loc.assortmentStatus ?? 'Unassorted'
  return (
    <div
      className={`pointer-events-none w-[min(280px,calc(100vw-1.5rem))] rounded-[8px] border bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.1)] ${borderClassName}`}
    >
      <div className="border-b border-[#E9EAEB] pb-3 text-[15px] font-semibold leading-snug text-[#0a0a0a]">{loc.name}</div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-[14px] text-[#0a0a0a]">
          <span className="flex shrink-0 items-center">{icon}</span>
          <span>{stockLabel}</span>
        </div>
        <span className="shrink-0 rounded-[4px] bg-[#f3f4f6] px-2 py-1 text-center text-[12px] font-semibold tabular-nums text-[#0a0a0a]">
          {stockValue}
        </span>
      </div>
      <div className="mt-3">
        <span className="inline-block rounded-[4px] bg-[#f3f4f6] px-2 py-1 text-[12px] font-semibold text-[#0a0a0a]">{status}</span>
      </div>
    </div>
  )
}

function TuHoverIconWrap({ children }) {
  return (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center text-[#9ca3af] [&_svg]:max-h-[14px] [&_svg]:max-w-[14px] [&_svg]:shrink-0">
      {children}
    </span>
  )
}

function TuHoverRow({ icon, label, value }) {
  const display = value === null || value === undefined || value === '' ? '—' : value
  return (
    <div className="flex items-start justify-between gap-2 text-[13px]">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <TuHoverIconWrap>{icon}</TuHoverIconWrap>
        <span className="font-medium leading-snug text-[#0a0a0a]">{label}</span>
      </div>
      <span className="max-w-[52%] shrink-0 rounded-[4px] bg-[#f3f4f6] px-2 py-0.5 text-right text-[11px] font-semibold leading-snug text-[#0a0a0a] tabular-nums">
        {String(display)}
      </span>
    </div>
  )
}

function TuHoverSection({ title, children }) {
  return (
    <div className="border-b border-[#E9EAEB] py-2.5 last:border-b-0 last:pb-0">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.04em] text-[#9ca3af]">{title}</div>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  )
}

/** Multi-section transfer popover for truck TU badges (matches transfer detail summary) */
function TuTruckTransferHoverCard({ trip, loc, truckUnits, borderClassName }) {
  const tripType = trip.movementType || 'Rebalancing'
  const assortment = loc.assortmentStatus ?? 'Unassorted'
  return (
    <div
      className={`pointer-events-none w-[min(320px,calc(100vw-1.5rem))] max-h-[min(520px,72vh)] overflow-y-auto rounded-[6px] border bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.12)] ${borderClassName}`}
    >
      <div className="border-b border-[#E9EAEB] pb-3 text-[14px] font-semibold leading-snug text-[#0a0a0a]">
        {trip.from} → {trip.to}
      </div>

      <TuHoverSection title="Transfer info">
        <TuHoverRow
          icon={<IconTruckTu className="!size-3.5" />}
          label="Truck units"
          value={truckUnits}
        />
        <TuHoverRow icon={<IconRebalancing />} label="Transfer units" value={loc.tu} />
        <TuHoverRow icon={<IconPackageTu className="!size-3.5" />} label="Available to send" value={loc.availableToSend} />
        <TuHoverRow icon={<IconReplenishment />} label="Trip type" value={tripType} />
        <TuHoverRow icon={<IconPackageTu className="!size-3.5" />} label="Assortment" value={assortment} />
      </TuHoverSection>

      <TuHoverSection title="Recommendation">
        <TuHoverRow icon={<IconRebalancing />} label="Transfer units" value={loc.tu} />
        <TuHoverRow icon={<IconTrendUp />} label="Revenue increase" value={loc.revenueIncrease} />
      </TuHoverSection>

      <div className="border-b border-[#E9EAEB] py-2.5">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.04em] text-[#9ca3af]">Recommendation reasons</div>
        <div className="rounded-[4px] bg-[#f3f4f6] px-2.5 py-2 text-[12px] font-semibold leading-snug text-[#0a0a0a]">
          {loc.recommendationReason ?? '—'}
        </div>
      </div>

      <TuHoverSection title="Total stock">
        <TuHoverRow icon={<IconPackageTu className="!size-3.5" />} label={trip.from} value={loc.sendingStock} />
        <TuHoverRow icon={<IconPackageTu className="!size-3.5" />} label={loc.name} value={loc.stock} />
      </TuHoverSection>

      <TuHoverSection title="Total weeks coverage">
        <TuHoverRow icon={<IconCalendarNote />} label={trip.from} value={loc.sendingCoverage} />
        <TuHoverRow icon={<IconCalendarNote />} label={loc.name} value={loc.receivingWeeksCoverage} />
      </TuHoverSection>
    </div>
  )
}

function StockAnalysisDrilldown({ product, trip, onBack }) {
  const [selectedTransferDetail, setSelectedTransferDetail] = useState(null)
  const [approvedLocations, setApprovedLocations] = useState({})
  const [selectedLocationIds, setSelectedLocationIds] = useState(new Set())
  const locations = LOCATIONS_BY_PRODUCT[product.id] || DEFAULT_LOCATIONS
  const breadcrumbFrom = `${trip.from} [${trip.fromCode}]`

  const toggleLocationSelection = (id) => {
    setSelectedLocationIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAllLocationsSelection = () => {
    const allIds = locations.map((loc) => loc.id)
    const allSelected = allIds.every((id) => selectedLocationIds.has(id))
    setSelectedLocationIds(allSelected ? new Set() : new Set(allIds))
  }

  const clearLocationSelection = () => setSelectedLocationIds(new Set())

  const handleApproveSelectedLocations = () => {
    if (!selectedLocationIds.size) return
    setApprovedLocations((prev) => {
      const next = { ...prev }
      selectedLocationIds.forEach((id) => {
        next[id] = true
      })
      return next
    })
    setSelectedLocationIds(new Set())
  }

  const handleExcludeSelectedLocations = () => {
    setSelectedLocationIds(new Set())
  }
  const breadcrumbTo = trip.to.length > 12 ? `${trip.to.slice(0, 10)}...` : trip.to
  const productLabel = product.name.length > 16 ? `${product.name.slice(0, 14)}...` : product.name
  const productSku = product.sku

  const summaryStock = locations.reduce(
    (acc, loc) => {
      const [before, after] = loc.stock.split(' → ').map(Number)
      return { before: acc.before + (before || 0), after: acc.after + (after || 0) }
    },
    { before: 0, after: 0 }
  )
  const summaryTU = locations.reduce(
    (acc, loc) => {
      const [before, after] = loc.tu.split(' → ').map(Number)
      return { before: acc.before + (before || 0), after: acc.after + (after || 0) }
    },
    { before: 0, after: 0 }
  )

  if (selectedTransferDetail) {
    return (
      <TransferDetailView
        transfer={selectedTransferDetail}
        product={product}
        trip={trip}
        onBack={() => setSelectedTransferDetail(null)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4 bg-white">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="h-10 w-10 flex items-center justify-center rounded-[4px] border border-[#e5e7eb] bg-white text-[#4b535c] hover:bg-white shrink-0"
          aria-label="Back to products"
        >
          <IconArrowLeft className="size-5" />
        </button>
        <nav className="flex items-center gap-2 text-[14px] text-[#4b535c]">
          <button type="button" onClick={onBack} className="hover:text-[#0a0a0a] hover:underline">
            {breadcrumbFrom}→{breadcrumbTo}
          </button>
          <span>→</span>
          <span className="text-[#0a0a0a]">{productLabel} [{productSku}]</span>
          <span>→</span>
          <span className="font-medium text-[#0a0a0a]">Transfers</span>
        </nav>
      </div>

      <p className="text-[13px] text-[#878D94] mb-2">
        Select locations to approve or exclude transfers for this product
      </p>

      <div className="flex flex-row flex-nowrap items-center gap-[8px]">
        <div className="flex items-center h-12 rounded-[4px] border border-[#E9EAEB] bg-white w-[200px] shrink-0">
          <input
            type="text"
            placeholder="Stock after"
            className="flex-1 min-w-0 h-full pl-4 pr-2 border-0 bg-transparent rounded-[4px] text-[14px] text-[#0a0a0a] placeholder:text-[#9ca3af] focus:outline-none focus:ring-0"
          />
          <span className="pr-3 shrink-0 text-[#9ca3af]">
            <IconSearch className="size-4" />
          </span>
        </div>
        <div className="relative">
          <select className="h-12 pl-4 pr-10 rounded-[4px] border border-[#E9EAEB] bg-white text-[14px] text-[#0a0a0a] appearance-none min-w-[160px]">
            <option>Sort by</option>
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#4b535c]">
            <IconChevronDown className="size-4" />
          </span>
        </div>
        <button type="button" className="h-12 w-12 flex items-center justify-center rounded-[4px] border border-[#E9EAEB] bg-white hover:bg-white shrink-0" aria-label="Filter">
          <IconFilterFunnel />
        </button>
        <button type="button" className="h-12 w-12 flex items-center justify-center rounded-[4px] border border-[#E9EAEB] bg-white hover:bg-white shrink-0" aria-label="Column settings">
          <IconColumnSettings />
        </button>
      </div>

      <div className="border border-[#e5e7eb] rounded-[4px] overflow-hidden bg-white">
        <div className="max-h-[min(65vh,800px)] overflow-x-auto overflow-y-auto">
        <table className="w-full text-[14px]">
          <thead className="bg-white">
            <tr className="border-b border-[#E9EAEB]">
              <th className="sticky top-0 z-20 w-10 max-w-[40px] bg-white py-3 px-2 text-left" />
              <th className="sticky top-0 z-20 w-12 bg-white py-3 px-4 text-left">
                <input
                  type="checkbox"
                  className="size-4 rounded border-[#E9EAEB] text-[#0267ff]"
                  aria-label="Select all"
                  checked={locations.length > 0 && locations.every((loc) => selectedLocationIds.has(loc.id))}
                  onChange={toggleAllLocationsSelection}
                />
              </th>
              <th className="sticky top-0 z-20 bg-white text-left py-3 px-4 font-medium text-[#00050A]">Locations</th>
              <th className="sticky top-0 z-20 bg-white text-right py-3 px-4 font-medium text-[#00050A]">
                <span className="inline-flex items-center gap-1">Stock <IconSortDown /></span>
              </th>
              <th className="sticky top-0 z-20 bg-white text-right py-3 px-4 font-medium text-[#00050A]">
                <span className="inline-flex items-center gap-1">TU <IconInfo /></span>
              </th>
              <th className="sticky top-0 z-20 bg-white text-right py-3 px-4 font-medium text-[#00050A]">
                <span className="flex flex-col items-end">
                  Sales
                  <span className="text-[11px] font-normal text-[#4b535c]">L7D / L30D</span>
                </span>
              </th>
              <th className="sticky top-0 z-20 bg-white text-right py-3 px-4 font-medium text-[#00050A]">
                <span className="flex flex-col items-end">
                  <span className="inline-flex items-center gap-1">Forecast <IconInfo /></span>
                  <span className="text-[11px] font-normal text-[#4b535c]">per wk</span>
                </span>
              </th>
              <th className="sticky top-0 z-20 bg-white text-right py-3 px-4 font-medium text-[#00050A]">Stockouts</th>
              <th className="sticky top-0 z-20 bg-white text-right py-3 px-4 font-medium text-[#00050A]">Coverage</th>
            </tr>
            <tr className="border-b border-[#E9EAEB] bg-white">
              <th className="w-10 max-w-[40px] bg-white py-2 px-2" />
              <th className="bg-white py-2 px-4" />
              <th className="bg-white py-2 px-4" />
              <th className="bg-white py-2 px-4 text-right text-[12px] font-medium text-[#0a0a0a]">
                {summaryStock.before} → {summaryStock.after}
              </th>
              <th className="bg-white py-2 px-4 text-right text-[12px] font-medium text-[#0a0a0a]">
                {summaryTU.before} → {summaryTU.after}
              </th>
              <th className="bg-white py-2 px-4 text-right text-[12px] font-normal text-[#4b535c]">—</th>
              <th className="bg-white py-2 px-4 text-right text-[12px] font-normal text-[#4b535c]">7.01 per wk</th>
              <th className="bg-white py-2 px-4 text-right text-[12px] font-normal text-[#4b535c]">—</th>
              <th className="bg-white py-2 px-4 text-right text-[12px] font-normal text-[#4b535c]">—</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((loc) => (
              <tr key={loc.id} className="border-b border-[#E9EAEB] bg-white hover:bg-white">
                <td className="w-10 max-w-[40px] py-3 px-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTransferDetail(loc)}
                    className="p-1 rounded-[4px] text-[#4B535C] hover:text-[#00050A] cursor-pointer transition-colors"
                    aria-label={`View transfer detail for ${loc.name}`}
                  >
                    <IconChevronRight className="size-4" />
                  </button>
                </td>
                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="size-4 rounded border-[#E9EAEB] text-[#0267ff]"
                    aria-label={`Select ${loc.name}`}
                    checked={selectedLocationIds.has(loc.id)}
                    onChange={() => toggleLocationSelection(loc.id)}
                  />
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-[#0a0a0a]">{loc.name}</span>
                    <span className="text-[12px] text-[#4b535c]">{loc.code}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right text-[#0a0a0a]">{loc.stock}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[#0a0a0a]">{loc.tu}</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {loc.tuWarehouse != null && (
                        <TuHoverPopover
                          panel={
                            <TuBadgeHoverCard
                              loc={loc}
                              borderClassName="border-[#A234DA]"
                              stockLabel="Stock on-hand"
                              stockValue={loc.tuWarehouse}
                              icon={<IconPackageTu className="!size-4 text-[#6b7280]" />}
                            />
                          }
                        >
                          <span className="inline-flex h-[26px] min-w-[50px] w-fit shrink-0 items-center justify-center gap-1.5 rounded-[2px] bg-[#A234DA] px-[6px] py-[2px] text-[12px] font-medium text-white cursor-pointer transition-[filter,box-shadow] hover:brightness-90 hover:shadow-[0px_2px_4px_rgba(0,0,0,0.1)]">
                            <IconPackageTu />
                            {loc.tuWarehouse}
                          </span>
                        </TuHoverPopover>
                      )}
                      {loc.tuTruck?.map((n, i) => (
                        <TuHoverPopover
                          key={i}
                          panel={
                            <TuTruckTransferHoverCard
                              trip={trip}
                              loc={loc}
                              truckUnits={n}
                              borderClassName="border-[#0267FF]"
                            />
                          }
                        >
                          <span className="inline-flex h-[26px] min-w-[50px] w-fit shrink-0 items-center justify-center gap-1.5 rounded-[2px] bg-[#0267FF] px-[6px] py-[2px] text-[12px] font-medium text-white cursor-pointer transition-[filter,box-shadow] hover:brightness-90 hover:shadow-[0px_2px_4px_rgba(0,0,0,0.1)]">
                            <IconTruckTu />
                            {n}
                          </span>
                        </TuHoverPopover>
                      ))}
                      {loc.tuWarehouse == null && !loc.tuTruck?.length && (
                        <TuHoverPopover
                          panel={
                            <TuTruckTransferHoverCard
                              trip={trip}
                              loc={loc}
                              truckUnits={loc.tu.split(' → ')[1] || '—'}
                              borderClassName="border-[#4B535C]"
                            />
                          }
                        >
                          <span className="inline-flex h-[26px] min-w-[50px] w-fit shrink-0 items-center justify-center gap-1.5 rounded-[2px] border border-[#4B535C] px-[6px] py-[2px] text-[12px] font-medium text-[#4b535c] opacity-80 cursor-pointer transition-[filter,box-shadow] hover:brightness-90 hover:shadow-[0px_2px_4px_rgba(0,0,0,0.1)]">
                            <IconTruckTu />
                            {loc.tu.split(' → ')[1] || '—'}
                          </span>
                        </TuHoverPopover>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-[#0a0a0a]">{loc.salesL7}</span>
                    <span className="text-[12px] text-[#4b535c]">{loc.salesL30}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right text-[#0a0a0a]">{loc.forecast}</td>
                <td className="py-3 px-4 text-right text-[#0a0a0a]">{loc.stockouts}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-[#0a0a0a]">{loc.coverage}</span>
                    <span className="text-[12px] text-[#4b535c]">{loc.targetWeeks}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {selectedLocationIds.size > 0 && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-[8px] px-6 py-3"
          style={{ background: '#1A1A2E', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}
        >
          <button
            type="button"
            onClick={clearLocationSelection}
            className="flex items-center justify-center size-8 rounded-[4px] text-white hover:bg-white/10"
            aria-label="Close"
          >
            <IconClose className="size-4" />
          </button>
          <span className="text-[14px] font-medium text-white">
            {selectedLocationIds.size} selected
          </span>
          <button
            type="button"
            onClick={handleApproveSelectedLocations}
            className="px-4 py-2 rounded-[4px] text-[14px] font-medium text-white hover:bg-white/10"
          >
            Approve all
          </button>
          <button
            type="button"
            onClick={handleExcludeSelectedLocations}
            className="px-4 py-2 rounded-[4px] text-[14px] font-medium text-white hover:bg-white/10"
          >
            Exclude
          </button>
        </div>
      )}
    </div>
  )
}

function ProductsDrilldown({ trip, onBack, showBackButton = true }) {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productStatusOverrides, setProductStatusOverrides] = useState({})
  const [productTransfersOverrides, setProductTransfersOverrides] = useState({})
  const [editingTransfersProductId, setEditingTransfersProductId] = useState(null)
  const [editingTransfersValue, setEditingTransfersValue] = useState('')
  const [selectedProductIds, setSelectedProductIds] = useState(new Set())
  const [statusFilters, setStatusFilters] = useState([])
  const [filtersDropdownOpen, setFiltersDropdownOpen] = useState(false)
  const [bulkChangeStatusOpen, setBulkChangeStatusOpen] = useState(false)
  const [productColumnOrder, setProductColumnOrder] = useState(() =>
    Array.from({ length: PRODUCTS_TABLE_NUM_DATA_COLS }, (_, i) => i)
  )
  const baseProducts = PRODUCTS_BY_TRIP[trip.id] || DEFAULT_PRODUCTS
  const products = (() => {
    let list = baseProducts
    if (statusFilters.length > 0) {
      list = list.filter((p) => {
        const rowStatus = productStatusOverrides[p.id] ?? getRowStatus(p)
        return statusFilters.some((f) => {
          if (f === 'approved') return rowStatus === 'approved_by_system' || rowStatus === 'approved_by_user'
          if (f === 'unapproved') return rowStatus === 'unapproved'
          if (f === 'needs_review') return rowStatus === 'needs_review_from_user'
          if (f === 'edited') return rowStatus === 'last_edited_by_user'
          return false
        })
      })
    }
    return list
  })()

  const toggleProductSelection = (id) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAllProductsSelection = () => {
    const allIds = products.map((p) => p.id)
    const allSelected = allIds.every((id) => selectedProductIds.has(id))
    setSelectedProductIds(allSelected ? new Set() : new Set(allIds))
  }

  const clearProductSelection = () => setSelectedProductIds(new Set())

  const handleBulkStatusChangeProducts = (statusId) => {
    if (!selectedProductIds.size) return
    setProductStatusOverrides((prev) => {
      const next = { ...prev }
      selectedProductIds.forEach((id) => {
        next[id] = statusId
      })
      return next
    })
    setBulkChangeStatusOpen(false)
    setSelectedProductIds(new Set())
  }

  const onProductColDragStart = useCallback((visualIndex, e) => {
    e.stopPropagation()
    const v = String(visualIndex)
    e.dataTransfer.setData('text/plain', v)
    try {
      e.dataTransfer.setData(PRODUCTS_COL_DND_MIME, v)
    } catch {
      /* noop */
    }
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const onProductColDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const onProductColDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onProductColDrop = useCallback((targetVisualIndex, e) => {
    e.preventDefault()
    e.stopPropagation()
    const raw = e.dataTransfer.getData(PRODUCTS_COL_DND_MIME) || e.dataTransfer.getData('text/plain')
    const from = parseInt(raw, 10)
    if (Number.isNaN(from)) return
    setProductColumnOrder((order) => moveTripTableColumnOrder(order, from, targetVisualIndex))
  }, [])

  useEffect(() => {
    const expected = PRODUCTS_TABLE_NUM_DATA_COLS
    const valid =
      productColumnOrder.length === expected &&
      new Set(productColumnOrder).size === expected &&
      productColumnOrder.every((l) => typeof l === 'number' && l >= 0 && l < expected)
    if (!valid) {
      setProductColumnOrder(Array.from({ length: expected }, (_, i) => i))
    }
  }, [productColumnOrder])

  if (selectedProduct) {
    return (
      <StockAnalysisDrilldown
        product={selectedProduct}
        trip={trip}
        onBack={() => setSelectedProduct(null)}
      />
    )
  }
  const breadcrumbFrom = `${trip.from} [${trip.fromCode}]`
  const breadcrumbTo = trip.to.length > 12 ? `${trip.to.slice(0, 10)}...` : trip.to
  const summaryTransfers = products.reduce((s, p) => s + (productTransfersOverrides[p.id] ?? p.transfers), 0)
  const summaryRevenue = products.reduce((s, p) => {
    const m = p.revenue.replace(/[€K]/g, '')
    return s + parseFloat(m || 0)
  }, 0)
  const summaryRecommended = products.reduce((s, p) => s + p.recommended + (p.recommendedSub || 0), 0)
  const summaryCurrentUnits = products.reduce((s, p) => s + (p.currentUnits || 0), 0)
  const summaryCurrentUnitsInTransit = products.reduce((s, p) => s + (p.currentUnitsInTransit || 0), 0)
  const summaryLeftInWarehouseAllocate = products.reduce((s, p) => s + (p.leftInWarehouseAllocate || 0), 0)
  const summaryLeftInWarehouseSell = products.reduce((s, p) => s + (p.leftInWarehouseSell || 0), 0)

  const productColLast = productColumnOrder.length - 1
  const productThPin = (isFirst, isLast) => {
    const L = isFirst
      ? 'sticky left-14 z-20 border-r border-[#e5e7eb] shadow-[4px_0_8px_rgba(0,0,0,0.04)] bg-white '
      : ''
    const R = isLast
      ? 'sticky right-0 z-30 border-l border-[#e5e7eb] shadow-[-4px_0_12px_-6px_rgba(15,23,42,0.12)] bg-white '
      : ''
    // Do not append `relative` when sticky is used — Tailwind's `relative` can override `sticky` in the cascade.
    if (L || R) return `${L}${R}`
    return 'relative '
  }
  const productTdPin = (isFirst, isLast) => {
    const L = isFirst
      ? 'sticky left-14 z-10 border-r border-[#e5e7eb] shadow-[4px_0_8px_rgba(0,0,0,0.04)] bg-white group-hover:bg-[#f9fafb] '
      : ''
    const R = isLast
      ? 'sticky right-0 z-20 border-l border-[#e5e7eb] shadow-[-4px_0_12px_-6px_rgba(15,23,42,0.12)] bg-white group-hover:bg-[#f9fafb] '
      : ''
    return `${L}${R}`
  }

  const productDropProps = (visualIdx) => ({
    onDragEnter: onProductColDragEnter,
    onDragOver: onProductColDragOver,
    onDrop: (e) => onProductColDrop(visualIdx, e),
  })

  function renderProductsHeaderCell(logicalIdx, visualIdx) {
    const isFirst = visualIdx === 0
    const isLast = visualIdx === productColLast
    const grip = <TripColumnDragGrip visualIndex={visualIdx} onDragStart={onProductColDragStart} />
    const d = productDropProps(visualIdx)
    switch (logicalIdx) {
      case 0:
        return (
          <th
            key={logicalIdx}
            className={`${productThPin(isFirst, isLast)}h-[62px] min-h-[62px] text-left px-4 align-middle font-medium text-[#00050A] min-w-[200px] box-border`}
            {...d}
          >
            <span className="inline-flex min-w-0 items-center gap-2">
              {grip}
              Product details
            </span>
          </th>
        )
      case 1:
        return (
          <th
            key={logicalIdx}
            className={`${productThPin(isFirst, isLast)}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[70px] box-border`}
            {...d}
          >
            <span className="inline-flex w-full min-w-0 items-center justify-end gap-2">
              {grip}
              Transfers
            </span>
          </th>
        )
      case 2:
        return (
          <th
            key={logicalIdx}
            className={`${productThPin(isFirst, isLast)}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[90px] box-border`}
            {...d}
          >
            <span className="inline-flex w-full min-w-0 items-center justify-end gap-2">
              {grip}
              <span className="inline-flex items-center gap-1">
                Revenue increase <IconInfo />
              </span>
            </span>
          </th>
        )
      case 3:
        return (
          <th
            key={logicalIdx}
            className={`${productThPin(isFirst, isLast)}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[100px] box-border`}
            {...d}
          >
            <span className="inline-flex w-full min-w-0 items-center justify-end gap-2">
              {grip}
              <span className="inline-flex items-center gap-1">
                Recommended transfers <IconInfo />
              </span>
            </span>
          </th>
        )
      case 4:
        return (
          <th
            key={logicalIdx}
            className={`${productThPin(isFirst, isLast)}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[90px] box-border`}
            {...d}
          >
            <span className="inline-flex w-full min-w-0 items-center justify-end gap-2">
              {grip}
              Recommendations updated
            </span>
          </th>
        )
      case 5:
        return (
          <th
            key={logicalIdx}
            className={`${productThPin(isFirst, isLast)}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[100px] box-border`}
            {...d}
          >
            <span className="inline-flex w-full min-w-0 items-center justify-end gap-2">
              {grip}
              <span
                className="inline-flex items-center gap-1 cursor-help"
                title="This includes stock in transit, stock on hand and stock pending from production. This will be for both parent & child locations (if applicable)."
              >
                Stock in circulation <IconInfo />
              </span>
            </span>
          </th>
        )
      case 6:
        return (
          <th
            key={logicalIdx}
            className={`${productThPin(isFirst, isLast)}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] box-border`}
            {...d}
          >
            <span className="inline-flex w-full min-w-0 items-center justify-end gap-2">
              {grip}
              <span
                className="inline-flex items-center gap-1 cursor-help"
                title="Units reserved to sell at this location and units available to allocate to stores"
              >
                Warehouse units <IconInfo />
              </span>
            </span>
          </th>
        )
      case 7:
        return (
          <th
            key={logicalIdx}
            className={`${productThPin(isFirst, isLast)}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[70px] box-border`}
            {...d}
          >
            <span className="inline-flex w-full min-w-0 items-center justify-end gap-2">
              {grip}
              <span className="flex flex-col items-end justify-center gap-0.5 leading-tight">
                Sales
                <span className="text-[11px] font-normal text-[#4b535c]">L7D / L30D</span>
              </span>
            </span>
          </th>
        )
      case 8:
        return (
          <th
            key={logicalIdx}
            className={`${productThPin(isFirst, isLast)}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[80px] box-border`}
            {...d}
          >
            <span className="inline-flex w-full min-w-0 items-center justify-end gap-2">
              {grip}
              <span className="flex flex-col items-end justify-center gap-0.5 leading-tight">
                <span className="inline-flex items-center gap-1">
                  Forecast <IconInfo />
                </span>
                <span className="text-[11px] font-normal text-[#4b535c]">per wk</span>
              </span>
            </span>
          </th>
        )
      case 9:
        return (
          <th
            key={logicalIdx}
            className={`${productThPin(isFirst, isLast)}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[80px] box-border`}
            {...d}
          >
            <span className="inline-flex w-full min-w-0 items-center justify-end gap-2">
              {grip}
              Stockouts
            </span>
          </th>
        )
      case 10:
        return (
          <th
            key={logicalIdx}
            className={`${productThPin(isFirst, isLast)}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[80px] box-border`}
            {...d}
          >
            <span className="inline-flex w-full min-w-0 items-center justify-end gap-2">
              {grip}
              Locations
            </span>
          </th>
        )
      case 11:
        return (
          <th
            key={logicalIdx}
            className={`${productThPin(isFirst, isLast)}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[80px] box-border`}
            {...d}
          >
            <span className="inline-flex w-full min-w-0 items-center justify-end gap-2">
              {grip}
              <span className="inline-flex items-center gap-1">
                Overstocks <IconInfo />
              </span>
            </span>
          </th>
        )
      case 12:
        return (
          <th
            key={logicalIdx}
            className={`${productThPin(isFirst, isLast)}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[80px] box-border`}
            {...d}
          >
            <span className="inline-flex w-full min-w-0 items-center justify-end gap-2">
              {grip}
              <span className="inline-flex items-center gap-1">
                Understocks <IconInfo />
              </span>
            </span>
          </th>
        )
      case 13:
        return (
          <th
            key={logicalIdx}
            className={`${productThPin(isFirst, isLast)}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[70px] box-border`}
            {...d}
          >
            <span className="inline-flex w-full min-w-0 items-center justify-end gap-2">
              {grip}
              <span className="inline-flex items-center gap-1">
                Depth <IconInfo />
              </span>
            </span>
          </th>
        )
      case 14:
        return (
          <th
            key={logicalIdx}
            className={`${productThPin(isFirst, isLast)}h-[62px] min-h-[62px] px-4 font-medium text-[#00050A] text-right align-middle box-border`}
            {...d}
          >
            <span className="inline-flex w-full min-w-0 items-center justify-end gap-2">
              {grip}
              Status
            </span>
          </th>
        )
      default:
        return null
    }
  }

  function renderProductsSummaryCell(logicalIdx, visualIdx) {
    const isFirst = visualIdx === 0
    const isLast = visualIdx === productColLast
    const pin = `${productThPin(isFirst, isLast)}`
    switch (logicalIdx) {
      case 0:
        return <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-normal text-[#4b535c]`} />
      case 1:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            {summaryTransfers} units
          </th>
        )
      case 2:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            €{summaryRevenue.toFixed(1)}K
          </th>
        )
      case 3:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            {summaryRecommended} units
          </th>
        )
      case 4:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-normal text-[#4b535c] text-right`}>
            —
          </th>
        )
      case 5:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            <div className="flex flex-col items-end">
              <span>{summaryCurrentUnits} units</span>
              {summaryCurrentUnitsInTransit > 0 && (
                <span className="text-[12px] text-[#4b535c]">{summaryCurrentUnitsInTransit} in transit</span>
              )}
            </div>
          </th>
        )
      case 6:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            <div className="flex flex-col items-end">
              <span>{summaryLeftInWarehouseAllocate.toLocaleString()} to allocate</span>
              <span className="text-[12px] text-[#4b535c]">{summaryLeftInWarehouseSell.toLocaleString()} to sell</span>
            </div>
          </th>
        )
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
      case 13:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-normal text-[#4b535c] text-right`}>
            —
          </th>
        )
      case 14:
        return <th key={logicalIdx} className={`${pin}py-2 px-4 text-right`} />
      default:
        return null
    }
  }

  function renderProductsBodyCell(logicalIdx, visualIdx, p) {
    const isFirst = visualIdx === 0
    const isLast = visualIdx === productColLast
    const pin = productTdPin(isFirst, isLast)
    switch (logicalIdx) {
      case 0:
        return (
          <td
            key={logicalIdx}
            className={`${pin}py-3 px-4 max-w-[200px] min-w-[200px] align-top`}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-[4px] bg-[#f3f4f6] shrink-0" />
              <div className="flex flex-col gap-0.5 min-w-0 line-clamp-2">
                <span className="font-medium text-[#0a0a0a]">{p.name}</span>
                <span className="text-[12px] text-[#4b535c]">{p.sku}</span>
                <span className="text-[12px] text-[#4b535c]">{p.colour}</span>
              </div>
            </div>
          </td>
        )
      case 1:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right align-top`} onClick={(e) => e.stopPropagation()}>
            <div className="flex w-full min-w-0 justify-end">
              {editingTransfersProductId === p.id ? (
                <input
                  type="text"
                  inputMode="numeric"
                  value={editingTransfersValue}
                  onChange={(e) => setEditingTransfersValue(e.target.value)}
                  onBlur={() => {
                    const num = parseInt(editingTransfersValue, 10)
                    if (!isNaN(num) && num >= 0) {
                      setProductTransfersOverrides((prev) => ({ ...prev, [p.id]: num }))
                    }
                    setEditingTransfersProductId(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const num = parseInt(editingTransfersValue, 10)
                      if (!isNaN(num) && num >= 0) {
                        setProductTransfersOverrides((prev) => ({ ...prev, [p.id]: num }))
                      }
                      setEditingTransfersProductId(null)
                    } else if (e.key === 'Escape') {
                      setEditingTransfersProductId(null)
                      setEditingTransfersValue(String(productTransfersOverrides[p.id] ?? p.transfers))
                    }
                  }}
                  autoFocus
                  className="w-14 text-right text-[14px] text-[#0a0a0a] bg-white border-b-2 border-[#0267ff] rounded-[2px] py-1 px-2 focus:outline-none focus:ring-0"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditingTransfersProductId(p.id)
                    setEditingTransfersValue(String(productTransfersOverrides[p.id] ?? p.transfers))
                  }}
                  className="text-right text-[14px] text-[#0a0a0a] hover:underline focus:outline-none focus:ring-2 focus:ring-[#0267ff] focus:ring-offset-1 rounded-[2px] py-1 px-2 -mx-2 min-w-[2ch] max-w-full line-clamp-2"
                >
                  {productTransfersOverrides[p.id] ?? p.transfers}
                </button>
              )}
            </div>
          </td>
        )
      case 2:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0 w-full text-right">{p.revenue}</div>
          </td>
        )
      case 3:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right align-top`}>
            <div className="flex flex-col items-end gap-1 line-clamp-2 min-w-0">
              <span className="text-[#0a0a0a]">
                {p.recommended}
                {p.recommendedBadges?.map((b) => (
                  <span
                    key={b}
                    className="ml-1 inline-flex items-center px-2 py-0.5 rounded-[4px] bg-[#f8f8f8] text-[11px] font-medium text-[#0267ff]"
                  >
                    {b === 'VIS' ? 'VS' : b}
                  </span>
                ))}
              </span>
              <span className="text-[12px] text-[#4b535c]">{p.recommendedSub}</span>
            </div>
          </td>
        )
      case 4:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right align-top`}>
            <div className="flex flex-col items-end gap-0.5 line-clamp-2 min-w-0">
              <span className="text-[14px] text-[#4B535C]">{p.recommendationsUpdated || '26/02/2026'}</span>
              {p.recommendationsUpdatedTime && (
                <span className="text-[12px] text-[#4b535c]">{p.recommendationsUpdatedTime}</span>
              )}
              {p.recommendationsUpdatedBy && (
                <span className="text-[11px] text-[#9ca3af]">{p.recommendationsUpdatedBy}</span>
              )}
            </div>
          </td>
        )
      case 5:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right align-top`}>
            <div className="flex flex-col items-end line-clamp-2 min-w-0">
              <span className="text-[#0a0a0a]">{p.currentUnits ?? '—'}</span>
              <span className="text-[12px] text-[#4b535c]">{p.currentUnitsInTransit ?? 0}</span>
            </div>
          </td>
        )
      case 6:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right align-top`}>
            <div className="flex flex-col items-end line-clamp-2 min-w-0">
              <span className="text-[#0a0a0a]">{p.leftInWarehouseAllocate ?? '—'}</span>
              <span className="text-[12px] text-[#4b535c]">{p.leftInWarehouseSell ?? '—'}</span>
            </div>
          </td>
        )
      case 7:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right align-top`}>
            <div className="flex flex-col items-end line-clamp-2 min-w-0">
              <span className="text-[#0a0a0a]">{p.salesL7}</span>
              <span className="text-[12px] text-[#4b535c]">{p.salesL30}</span>
            </div>
          </td>
        )
      case 8:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0 w-full text-right">{p.forecast}</div>
          </td>
        )
      case 9:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0 w-full text-right">{p.stockouts}</div>
          </td>
        )
      case 10:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0 w-full text-right">{p.locations}</div>
          </td>
        )
      case 11:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0 w-full text-right">{p.overstocks}</div>
          </td>
        )
      case 12:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0 w-full text-right">{p.understocks}</div>
          </td>
        )
      case 13:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0 w-full text-right">{p.depth}</div>
          </td>
        )
      case 14:
        return (
          <td
            key={logicalIdx}
            className={`${pin}py-3 px-4 min-w-0 align-top text-right`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <StatusDropdown
                rowId={`product-${p.id}`}
                value={productStatusOverrides[p.id] ?? getRowStatus(p)}
                userName={p.approvedByUser || p.editedByUser}
                onChange={(statusId) => setProductStatusOverrides((prev) => ({ ...prev, [p.id]: statusId }))}
              />
            </div>
          </td>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col gap-[15px]">
      {showBackButton && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="h-10 w-10 flex items-center justify-center rounded-[4px] border border-[#e5e7eb] bg-white text-[#4b535c] hover:bg-[#f3f4f6] shrink-0"
            aria-label="Back to trips"
          >
            <IconArrowLeft className="size-5" />
          </button>
          <nav className="flex items-center gap-2 text-[14px] text-[#4b535c]">
            <button type="button" onClick={onBack} className="hover:text-[#0a0a0a] hover:underline">
              {breadcrumbFrom}
            </button>
            <span>→</span>
            <span className="text-[#0a0a0a]">{breadcrumbTo}</span>
            <span>→</span>
            <span className="font-medium text-[#0a0a0a]">Products</span>
          </nav>
        </div>
      )}

      <div className="flex flex-col gap-[15px]">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center h-10 rounded-[4px] border border-[#e9eaeb] bg-white flex-1 min-w-[200px] max-w-[280px]">
            <input
              type="text"
              placeholder="Revenue increase"
              className="flex-1 min-w-0 h-full pl-4 pr-2 border-0 bg-transparent rounded-[4px] text-[14px] text-[#0a0a0a] placeholder:text-[#9ca3af] focus:outline-none focus:ring-0"
            />
            <span className="pr-3 shrink-0 text-[#9ca3af]">
              <IconSearch className="size-4" />
            </span>
          </div>
          <button
            type="button"
            className="h-10 w-10 flex items-center justify-center rounded-[4px] border border-[#e9eaeb] bg-white text-[#22272f] hover:bg-[#f3f4f6] shrink-0"
            aria-label="Column settings"
          >
            <IconColumnSettings />
          </button>
          <button
            type="button"
            className="h-10 w-10 flex items-center justify-center rounded-[4px] border border-[#e9eaeb] bg-white text-[#22272f] hover:bg-[#f3f4f6] shrink-0"
            aria-label="Sort order"
          >
            <IconSortOrder />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setFiltersDropdownOpen((o) => !o)}
              className="h-10 px-4 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#22272f] hover:bg-[#f3f4f6] shrink-0 flex items-center gap-2"
            >
              <IconFilterFunnel />
              Filters
            </button>
            {filtersDropdownOpen && (
              <>
                <div className="fixed inset-0 z-[60]" aria-hidden onClick={() => setFiltersDropdownOpen(false)} />
                <div className="absolute left-0 top-full mt-1 z-[70] min-w-[200px] rounded-[6px] border border-[#e5e7eb] bg-white py-2 shadow-lg">
                  <div className="px-3 py-1.5 text-[12px] font-medium text-[#4b535c] uppercase tracking-wide">Status</div>
                  {[
                    { id: 'approved', label: 'Approved' },
                    { id: 'unapproved', label: 'Unapproved' },
                    { id: 'needs_review', label: 'Needs review' },
                    { id: 'edited', label: 'Edited' },
                  ].map((opt) => (
                    <label key={opt.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#f3f4f6] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={statusFilters.includes(opt.id)}
                        onChange={(e) => {
                          setStatusFilters((prev) =>
                            e.target.checked ? [...prev, opt.id] : prev.filter((x) => x !== opt.id)
                          )
                        }}
                        className="size-4 rounded border-[#d1d5db] text-[#0267ff]"
                      />
                      <span className="text-[13px] text-[#0a0a0a]">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {statusFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {statusFilters.map((f) => {
              const labels = { approved: 'Approved', unapproved: 'Unapproved', needs_review: 'Needs review',  edited: 'Edited' }
              return (
                <span
                  key={f}
                  className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-[4px] bg-[#f3f4f6] text-[#4b535c] border border-[#e5e7eb]"
                >
                  <span>Status: {labels[f]}</span>
                  <button
                    type="button"
                    onClick={() => setStatusFilters((prev) => prev.filter((x) => x !== f))}
                    className="p-0.5 rounded-[4px] text-[#6b7280] hover:bg-[#e5e7eb] hover:text-[#374151]"
                    aria-label={`Remove filter: Status ${labels[f]}`}
                  >
                    <IconClose className="size-3.5" />
                  </button>
                </span>
              )
            })}
          </div>
        )}
      </div>

      <div className="products-table-scroll border border-[#e5e7eb] rounded-[8px] bg-white overflow-x-auto overflow-y-visible">
        <table className="w-max min-w-full text-[14px] bg-white">
          <thead className="bg-white">
            <tr className="border-b border-[#E9EAEB]">
              <th className="sticky left-0 z-30 h-[62px] min-h-[62px] w-14 min-w-14 max-w-14 box-border bg-white px-4 py-[10px] text-left align-middle shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]">
                <label className="flex min-h-[52px] cursor-pointer items-center py-[2px]">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-2 border-[#e9eaeb] bg-white text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-0"
                    aria-label="Select all"
                    checked={products.length > 0 && products.every((p) => selectedProductIds.has(p.id))}
                    onChange={toggleAllProductsSelection}
                  />
                </label>
              </th>
              {productColumnOrder.map((logicalIdx, visualIdx) =>
                renderProductsHeaderCell(logicalIdx, visualIdx)
              )}
            </tr>
            <tr className="border-b border-[#E9EAEB] bg-white">
              <th className="sticky left-0 z-30 w-14 min-w-14 max-w-14 box-border py-2 px-4 bg-white shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]" />
              {productColumnOrder.map((logicalIdx, visualIdx) =>
                renderProductsSummaryCell(logicalIdx, visualIdx)
              )}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className="group border-b border-[#E9EAEB] bg-white hover:bg-[#f9fafb] cursor-pointer"
                onClick={(e) => {
                  if (e.target.closest('[data-status-dropdown]')) return
                  setSelectedProduct(p)
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    if (e.target.closest('[data-status-dropdown]')) return
                    setSelectedProduct(p)
                  }
                }}
              >
                <td
                  className="sticky left-0 z-30 min-h-[86px] w-14 min-w-14 max-w-14 box-border bg-white px-4 py-3 align-middle shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)] group-hover:bg-[#f9fafb]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-2 border-[#e9eaeb] bg-white text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-0"
                    aria-label={`Select ${p.name}`}
                    checked={selectedProductIds.has(p.id)}
                    onChange={() => toggleProductSelection(p.id)}
                  />
                </td>
                {productColumnOrder.map((logicalIdx, visualIdx) =>
                  renderProductsBodyCell(logicalIdx, visualIdx, p)
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E9EAEB] bg-white">
          <span className="text-[14px] text-[#4b535c]">1,123 rows</span>
          <span className="text-[14px] text-[#4b535c]">1 of 23</span>
          <div className="flex items-center gap-2">
            <button type="button" className="h-10 w-10 flex items-center justify-center rounded-[4px] opacity-50" aria-label="Previous page" disabled>
              <IconArrowLeft className="size-5" />
            </button>
            <button type="button" className="h-10 w-10 flex items-center justify-center rounded-[4px] hover:bg-[#f3f4f6]" aria-label="Next page">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="rotate-180">
                <path d="M13 8H3M7 4l-4 4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {selectedProductIds.size > 0 && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-[8px] px-6 py-3"
          style={{ background: '#1A1A2E', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}
        >
          <button
            type="button"
            onClick={clearProductSelection}
            className="flex items-center justify-center size-8 rounded-[4px] text-white hover:bg-white/10"
            aria-label="Close"
          >
            <IconClose className="size-4" />
          </button>
          <span className="text-[14px] font-medium text-white">
            {selectedProductIds.size} selected
          </span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setBulkChangeStatusOpen((o) => !o)}
              className="px-4 py-2 rounded-[4px] text-[14px] font-medium text-white hover:bg-white/10"
            >
              Change status
            </button>
            {bulkChangeStatusOpen && (
              <>
                <div className="fixed inset-0 z-[60]" aria-hidden onClick={() => setBulkChangeStatusOpen(false)} />
                <div
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-[70] min-w-[180px] rounded-[6px] border border-[#e5e7eb] bg-white py-1 shadow-lg"
                  style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                >
                  {STATUS_DROPDOWN_OPTIONS.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => handleBulkStatusChangeProducts(o.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-[13px] font-medium text-[#0a0a0a] hover:bg-[#f3f4f6]"
                    >
                      <span className={`size-2 rounded-full shrink-0 ${o.dotClass}`} aria-hidden />
                      <span>{o.dropdownLabel}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function LocationsTab() {
  const [selectedLocationIds, setSelectedLocationIds] = useState(new Set())
  const [statusFilters, setStatusFilters] = useState([])
  const [filtersDropdownOpen, setFiltersDropdownOpen] = useState(false)
  const locations = LOCATIONS_TABLE_DATA

  const toggleLocationSelection = (id) => {
    setSelectedLocationIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAllLocationsSelection = () => {
    const allIds = locations.map((l) => l.id)
    const allSelected = allIds.every((id) => selectedLocationIds.has(id))
    setSelectedLocationIds(allSelected ? new Set() : new Set(allIds))
  }

  const [locationColumnOrder, setLocationColumnOrder] = useState(() =>
    Array.from({ length: LOCATIONS_TABLE_NUM_DATA_COLS }, (_, i) => i)
  )

  const onLocationColDragStart = useCallback((visualIndex, e) => {
    e.stopPropagation()
    const v = String(visualIndex)
    e.dataTransfer.setData('text/plain', v)
    try {
      e.dataTransfer.setData(LOCATIONS_COL_DND_MIME, v)
    } catch {
      /* noop */
    }
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const onLocationColDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const onLocationColDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onLocationColDrop = useCallback((targetVisualIndex, e) => {
    e.preventDefault()
    e.stopPropagation()
    const raw = e.dataTransfer.getData(LOCATIONS_COL_DND_MIME) || e.dataTransfer.getData('text/plain')
    const from = parseInt(raw, 10)
    if (Number.isNaN(from)) return
    setLocationColumnOrder((order) => moveTripTableColumnOrder(order, from, targetVisualIndex))
  }, [])

  const locThPin = (isFirst) =>
    isFirst
      ? 'sticky left-14 z-20 border-r border-[#e5e7eb] shadow-[4px_0_8px_rgba(0,0,0,0.04)] bg-white '
      : 'relative '
  const locTdPin = (isFirst) =>
    isFirst
      ? 'sticky left-14 z-10 border-r border-[#e5e7eb] shadow-[4px_0_8px_rgba(0,0,0,0.04)] bg-white group-hover:bg-[#f9fafb] '
      : ''

  const locationDropProps = (visualIdx) => ({
    onDragEnter: onLocationColDragEnter,
    onDragOver: onLocationColDragOver,
    onDrop: (e) => onLocationColDrop(visualIdx, e),
  })

  function renderLocationsHeaderCell(logicalIdx, visualIdx) {
    const isFirst = visualIdx === 0
    const grip = <TripColumnDragGrip visualIndex={visualIdx} onDragStart={onLocationColDragStart} />
    const d = locationDropProps(visualIdx)
    const rowEnd = (inner) => (
      <span className="inline-flex w-full min-w-0 items-center justify-end gap-2">
        {grip}
        {inner}
      </span>
    )
    switch (logicalIdx) {
      case 0:
        return (
          <th
            key={logicalIdx}
            className={`${locThPin(isFirst)}h-[62px] min-h-[62px] text-left px-4 align-middle font-medium text-[#00050A] min-w-[180px] box-border`}
            {...d}
          >
            <span className="inline-flex min-w-0 items-center gap-2">
              {grip}
              Location
            </span>
          </th>
        )
      case 1:
        return (
          <th
            key={logicalIdx}
            className={`${locThPin(isFirst)}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[90px] box-border`}
            {...d}
          >
            {rowEnd('Transfers in')}
          </th>
        )
      case 2:
        return (
          <th
            key={logicalIdx}
            className={`${locThPin(isFirst)}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[90px] box-border`}
            {...d}
          >
            {rowEnd('Transfers out')}
          </th>
        )
      case 3:
        return (
          <th
            key={logicalIdx}
            className={`${locThPin(isFirst)}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[100px] box-border`}
            {...d}
          >
            {rowEnd(
              <span className="inline-flex items-center gap-1">
                Revenue increase <IconInfo /> <IconSortDown />
              </span>
            )}
          </th>
        )
      case 4:
        return (
          <th
            key={logicalIdx}
            className={`${locThPin(isFirst)}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[100px] box-border`}
            {...d}
          >
            {rowEnd(
              <span className="inline-flex items-center gap-1">Recommended transfers in <IconInfo /></span>
            )}
          </th>
        )
      case 5:
        return (
          <th
            key={logicalIdx}
            className={`${locThPin(isFirst)}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[100px] box-border`}
            {...d}
          >
            {rowEnd(
              <span className="inline-flex items-center gap-1">Recommended transfers out <IconInfo /></span>
            )}
          </th>
        )
      case 6:
        return (
          <th
            key={logicalIdx}
            className={`${locThPin(isFirst)}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[90px] box-border`}
            {...d}
          >
            {rowEnd('Recommendations updated')}
          </th>
        )
      case 7:
        return (
          <th
            key={logicalIdx}
            className={`${locThPin(isFirst)}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[100px] box-border`}
            {...d}
          >
            {rowEnd(
              <span
                className="inline-flex items-center gap-1 cursor-help"
                title="This includes stock in transit, stock on hand and stock pending from production. This will be for both parent & child locations (if applicable)."
              >
                Stock in circulation <IconInfo />
              </span>
            )}
          </th>
        )
      case 8:
        return (
          <th
            key={logicalIdx}
            className={`${locThPin(isFirst)}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[70px] box-border`}
            {...d}
          >
            {rowEnd('Sales')}
          </th>
        )
      case 9:
        return (
          <th
            key={logicalIdx}
            className={`${locThPin(isFirst)}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[90px] box-border`}
            {...d}
          >
            {rowEnd(
              <span className="inline-flex items-center gap-1">Forecast <IconInfo /></span>
            )}
          </th>
        )
      case 10:
        return (
          <th
            key={logicalIdx}
            className={`${locThPin(isFirst)}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[80px] box-border`}
            {...d}
          >
            {rowEnd('Stockouts')}
          </th>
        )
      case 11:
        return (
          <th
            key={logicalIdx}
            className={`${locThPin(isFirst)}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[80px] box-border`}
            {...d}
          >
            {rowEnd(
              <span className="inline-flex items-center gap-1">Overstocks <IconInfo /></span>
            )}
          </th>
        )
      case 12:
        return (
          <th
            key={logicalIdx}
            className={`${locThPin(isFirst)}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[80px] box-border`}
            {...d}
          >
            {rowEnd(
              <span className="inline-flex items-center gap-1">Understocks <IconInfo /></span>
            )}
          </th>
        )
      default:
        return null
    }
  }

  function renderLocationsSummaryCell(logicalIdx, visualIdx) {
    const isFirst = visualIdx === 0
    const pin = `${locThPin(isFirst)}`
    switch (logicalIdx) {
      case 0:
        return <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-normal text-[#4b535c]`} />
      case 1:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            <div className="flex flex-col items-end">
              <span>477 units</span>
              <span className="text-[12px] text-[#4b535c]">32 trips</span>
            </div>
          </th>
        )
      case 2:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            <div className="flex flex-col items-end">
              <span>477 units</span>
              <span className="text-[12px] text-[#4b535c]">35 trips</span>
            </div>
          </th>
        )
      case 3:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            €50.4K
          </th>
        )
      case 4:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            477 units
          </th>
        )
      case 5:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            477 units
          </th>
        )
      case 6:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-normal text-[#4b535c] text-right`}>
            —
          </th>
        )
      case 7:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            <div className="flex flex-col items-end">
              <span>2,450 units</span>
              <span className="text-[12px] text-[#4b535c]">180 in transit</span>
            </div>
          </th>
        )
      case 8:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            <div className="flex flex-col items-end">
              <span>70 L7D</span>
              <span className="text-[12px] text-[#4b535c]">326 L30D</span>
            </div>
          </th>
        )
      case 9:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            154.61 per wk
          </th>
        )
      case 10:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            189 → 383
          </th>
        )
      case 11:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            301 → 28
          </th>
        )
      case 12:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            1,270 → …
          </th>
        )
      default:
        return null
    }
  }

  function renderLocationsBodyCell(logicalIdx, visualIdx, loc) {
    const isFirst = visualIdx === 0
    const pin = locTdPin(isFirst)
    switch (logicalIdx) {
      case 0:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 min-w-[180px] align-top`}>
            <div className="flex flex-col gap-0.5 min-w-0 line-clamp-2">
              <span className="font-medium text-[#0a0a0a]">{loc.name}</span>
              <span className="text-[12px] text-[#4b535c]">{loc.code}</span>
            </div>
          </td>
        )
      case 1:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right align-top`}>
            <div className="flex flex-col items-end line-clamp-2 min-w-0">
              <span className="text-[#0a0a0a]">{loc.transfersIn}</span>
              <span className="text-[12px] text-[#4b535c]">{loc.transfersInSub}</span>
            </div>
          </td>
        )
      case 2:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right align-top`}>
            <div className="flex flex-col items-end line-clamp-2 min-w-0">
              <span className="text-[#0a0a0a]">{loc.transfersOut}</span>
              <span className="text-[12px] text-[#4b535c]">{loc.transfersOutSub}</span>
            </div>
          </td>
        )
      case 3:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0">{loc.revenueIncrease}</div>
          </td>
        )
      case 4:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right align-top`}>
            <div className="flex flex-col items-end gap-1 line-clamp-2 min-w-0">
              <span className="text-[#0a0a0a] inline-flex items-center gap-1">
                {loc.recommendedIn}
                {loc.recommendedInBadges?.map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-[#f8f8f8] text-[11px] font-medium text-[#0267ff]"
                  >
                    {b}
                  </span>
                ))}
              </span>
            </div>
          </td>
        )
      case 5:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0">{loc.recommendedOut}</div>
          </td>
        )
      case 6:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right align-top`}>
            <div className="flex flex-col items-end gap-0.5 line-clamp-2 min-w-0">
              <span className="text-[14px] text-[#4B535C]">{loc.recommendationsUpdated || '26/02/2026'}</span>
              {loc.recommendationsUpdatedTime && (
                <span className="text-[12px] text-[#4b535c]">{loc.recommendationsUpdatedTime}</span>
              )}
              {loc.recommendationsUpdatedBy && (
                <span className="text-[11px] text-[#9ca3af]">{loc.recommendationsUpdatedBy}</span>
              )}
            </div>
          </td>
        )
      case 7:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right align-top`}>
            <div className="flex flex-col items-end line-clamp-2 min-w-0">
              <span className="text-[#0a0a0a]">{loc.stockInCirculation ?? '—'}</span>
              <span className="text-[12px] text-[#4b535c]">{loc.stockInTransit ?? 0}</span>
            </div>
          </td>
        )
      case 8:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right align-top`}>
            <div className="flex flex-col items-end line-clamp-2 min-w-0">
              <span className="text-[#0a0a0a]">{loc.salesL7}</span>
              <span className="text-[12px] text-[#4b535c]">{loc.salesL30}</span>
            </div>
          </td>
        )
      case 9:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0">{loc.forecast}</div>
          </td>
        )
      case 10:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0">{loc.stockouts}</div>
          </td>
        )
      case 11:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0">{loc.overstocks}</div>
          </td>
        )
      case 12:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0">{loc.understocks}</div>
          </td>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col gap-[15px]">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center h-10 rounded-[4px] border border-[#e9eaeb] bg-white flex-1 min-w-[200px] max-w-[280px]">
          <input
            type="text"
            placeholder="Revenue increase"
            className="flex-1 min-w-0 h-full pl-4 pr-2 border-0 bg-transparent rounded-[4px] text-[14px] text-[#0a0a0a] placeholder:text-[#9ca3af] focus:outline-none focus:ring-0"
          />
          <span className="pr-3 shrink-0 text-[#9ca3af]">
            <IconSearch className="size-4" />
          </span>
        </div>
        <button
          type="button"
          className="h-10 w-10 flex items-center justify-center rounded-[4px] border border-[#e9eaeb] bg-white text-[#22272f] hover:bg-[#f3f4f6] shrink-0"
          aria-label="Column settings"
        >
          <IconColumnSettings />
        </button>
        <button
          type="button"
          className="h-10 w-10 flex items-center justify-center rounded-[4px] border border-[#e9eaeb] bg-white text-[#22272f] hover:bg-[#f3f4f6] shrink-0"
          aria-label="Sort order"
        >
          <IconSortOrder />
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setFiltersDropdownOpen((o) => !o)}
            className="h-10 px-4 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#22272f] hover:bg-[#f3f4f6] shrink-0 flex items-center gap-2"
          >
            <IconFilterFunnel />
            Filters
          </button>
          {filtersDropdownOpen && (
            <>
              <div className="fixed inset-0 z-[60]" aria-hidden onClick={() => setFiltersDropdownOpen(false)} />
              <div className="absolute left-0 top-full mt-1 z-[70] min-w-[200px] rounded-[6px] border border-[#e5e7eb] bg-white py-2 shadow-lg">
                <div className="px-3 py-1.5 text-[12px] font-medium text-[#4b535c] uppercase tracking-wide">Status</div>
                {[
                  { id: 'approved', label: 'Approved' },
                  { id: 'unapproved', label: 'Unapproved' },
                  { id: 'needs_review', label: 'Needs review' },
                  { id: 'edited', label: 'Edited' },
                ].map((opt) => (
                  <label key={opt.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#f3f4f6] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={statusFilters.includes(opt.id)}
                      onChange={(e) => {
                        setStatusFilters((prev) =>
                          e.target.checked ? [...prev, opt.id] : prev.filter((x) => x !== opt.id)
                        )
                      }}
                      className="size-4 rounded border-[#d1d5db] text-[#0267ff]"
                    />
                    <span className="text-[13px] text-[#0a0a0a]">{opt.label}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="products-table-scroll border border-[#e5e7eb] rounded-[8px] bg-white overflow-hidden">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-max min-w-full text-[14px] bg-white">
            <thead className="bg-white">
              <tr className="border-b border-[#E9EAEB]">
                <th className="sticky left-0 z-30 h-[62px] min-h-[62px] w-14 min-w-14 max-w-14 box-border bg-white px-4 py-[10px] text-left align-middle shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]">
                  <label className="flex min-h-[52px] cursor-pointer items-center py-[2px]">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-2 border-[#e9eaeb] bg-white text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-0"
                      aria-label="Select all"
                      checked={locations.length > 0 && locations.every((l) => selectedLocationIds.has(l.id))}
                      onChange={toggleAllLocationsSelection}
                    />
                  </label>
                </th>
                {locationColumnOrder.map((logicalIdx, visualIdx) =>
                  renderLocationsHeaderCell(logicalIdx, visualIdx)
                )}
              </tr>
              <tr className="border-b border-[#E9EAEB] bg-white">
                <th className="sticky left-0 z-30 w-14 min-w-14 max-w-14 box-border py-2 px-4 bg-white shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]" />
                {locationColumnOrder.map((logicalIdx, visualIdx) =>
                  renderLocationsSummaryCell(logicalIdx, visualIdx)
                )}
              </tr>
            </thead>
            <tbody>
              {locations.map((loc) => (
                <tr key={loc.id} className="group border-b border-[#E9EAEB] bg-white hover:bg-[#f9fafb]">
                  <td className="sticky left-0 z-30 min-h-[86px] w-14 min-w-14 max-w-14 box-border bg-white px-4 py-3 align-middle shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)] group-hover:bg-[#f9fafb]">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-2 border-[#e9eaeb] bg-white text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-0"
                      aria-label={`Select ${loc.name}`}
                      checked={selectedLocationIds.has(loc.id)}
                      onChange={() => toggleLocationSelection(loc.id)}
                    />
                  </td>
                  {locationColumnOrder.map((logicalIdx, visualIdx) =>
                    renderLocationsBodyCell(logicalIdx, visualIdx, loc)
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#E9EAEB] bg-white">
            <span className="text-[14px] text-[#4b535c]">{locations.length} rows</span>
            <span className="text-[14px] text-[#4b535c]">1 of 1</span>
            <div className="flex items-center gap-2">
              <button type="button" className="h-10 w-10 flex items-center justify-center rounded-[4px] opacity-50" aria-label="Previous page" disabled>
                <IconArrowLeft className="size-5" />
              </button>
              <button type="button" className="h-10 w-10 flex items-center justify-center rounded-[4px] hover:bg-[#f3f4f6]" aria-label="Next page">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="rotate-180">
                  <path d="M13 8H3M7 4l-4 4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ScheduleDetailPage() {
  const [activeTab, setActiveTab] = useState('trips')
  const [viewShowsFullDataset, setViewShowsFullDataset] = useState(true)
  const [selectedView, setSelectedView] = useState('Show all recommendations')
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false)
  const [tripStatusOverrides, setTripStatusOverrides] = useState({})
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [selectedTripIds, setSelectedTripIds] = useState(new Set())
  const [statusFilters, setStatusFilters] = useState([])
  const [filtersDropdownOpen, setFiltersDropdownOpen] = useState(false)
  const [importantUpdatesOpen, setImportantUpdatesOpen] = useState(false)
  const [importantUpdatesDismissed, setImportantUpdatesDismissed] = useState(false)
  const [deadlineBannerDismissed, setDeadlineBannerDismissed] = useState(false)

  const baseTripsRows = viewShowsFullDataset ? TRIPS_ALL : TRIPS_OPERA
  const tripsRows = (() => {
    let rows = baseTripsRows
    if (statusFilters.length > 0) {
      rows = rows.filter((row) => {
        const rowStatus = tripStatusOverrides[row.id] ?? getRowStatus(row)
        return statusFilters.some((f) => {
          if (f === 'approved') return rowStatus === 'approved_by_system' || rowStatus === 'approved_by_user'
          if (f === 'unapproved') return rowStatus === 'unapproved'
          if (f === 'needs_review') return rowStatus === 'needs_review_from_user'
          if (f === 'edited') return rowStatus === 'last_edited_by_user'
          return false
        })
      })
    }
    return rows
  })()
  const summaryTransfers = viewShowsFullDataset ? '2,000 units' : '203 units'
  const summaryRevenue = viewShowsFullDataset ? '€435.3K' : '€41.3K'
  const summaryRecommended = viewShowsFullDataset ? '2,105 units' : '203 units'

  const [tripTableColWidths, setTripTableColWidths] = useState(() => [...TRIPS_TABLE_DEFAULT_COL_WIDTHS])
  const [tripColumnOrder, setTripColumnOrder] = useState(() =>
    Array.from({ length: TRIPS_TABLE_NUM_DATA_COLS }, (_, i) => i)
  )
  /** Status (logical col 7) only pins to the right when it is the trailing column after reorder. */
  const tripStatusColumnIsTrailing = tripColumnOrder[tripColumnOrder.length - 1] === 7

  const onTripColDragStart = useCallback((visualIndex, e) => {
    e.stopPropagation()
    const v = String(visualIndex)
    // text/plain is required for getData on drop in several browsers (incl. Safari).
    e.dataTransfer.setData('text/plain', v)
    try {
      e.dataTransfer.setData(TRIPS_COL_DND_MIME, v)
    } catch {
      /* ignore */
    }
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const onTripColDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const onTripColDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onTripColDrop = useCallback((targetVisualIndex, e) => {
    e.preventDefault()
    e.stopPropagation()
    const raw = e.dataTransfer.getData(TRIPS_COL_DND_MIME) || e.dataTransfer.getData('text/plain')
    const from = parseInt(raw, 10)
    if (Number.isNaN(from)) return
    setTripColumnOrder((order) => moveTripTableColumnOrder(order, from, targetVisualIndex))
  }, [])

  const startTripTableColResize = useCallback((colIndex, e) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startW = tripTableColWidths[colIndex]
    const minColW = colIndex === 3 ? 160 : colIndex === 5 ? 190 : 72
    const onMove = (ev) => {
      const d = ev.clientX - startX
      setTripTableColWidths((prev) => {
        const next = [...prev]
        next[colIndex] = Math.max(minColW, Math.min(560, startW + d))
        return next
      })
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.removeProperty('cursor')
      document.body.style.removeProperty('user-select')
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [tripTableColWidths])

  function handleSelectView(option) {
    setSelectedView(option)
    setViewDropdownOpen(false)
    if (option === 'Show all recommendations') {
      setViewShowsFullDataset(true)
    } else if (option.startsWith('Exception ')) {
      setViewShowsFullDataset(false)
    }
  }

  const toggleTripSelection = (id) => {
    setSelectedTripIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAllTripsSelection = () => {
    const allIds = tripsRows.map((r) => r.id)
    const allSelected = allIds.every((id) => selectedTripIds.has(id))
    setSelectedTripIds(allSelected ? new Set() : new Set(allIds))
  }

  const clearSelection = () => setSelectedTripIds(new Set())

  const [bulkChangeStatusOpen, setBulkChangeStatusOpen] = useState(false)

  const handleBulkStatusChange = (statusId) => {
    if (!selectedTripIds.size) return
    setTripStatusOverrides((prev) => {
      const next = { ...prev }
      selectedTripIds.forEach((id) => {
        next[id] = statusId
      })
      return next
    })
    setBulkChangeStatusOpen(false)
    setSelectedTripIds(new Set())
  }

  return (
    <div className="pt-0 flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2 min-w-0">
            <h1 className="text-[24px] font-medium text-[#0a0a0a]">
              Europe monthly rebal
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#4b535c]">
              <span>Created: {SCHEDULE_CREATION_DATE}</span>
              <button
                type="button"
                className="text-[13px] font-medium text-[#0267ff] hover:underline"
              >
                View scope
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              className="h-9 w-9 flex items-center justify-center rounded-[4px] border border-[#e5e7eb] bg-white text-[#4b535c] hover:bg-[#f3f4f6]"
              aria-label="Share"
            >
              <IconShare />
            </button>
            <button
              type="button"
              className="h-9 w-9 flex items-center justify-center rounded-[4px] border border-[#e5e7eb] bg-white text-[#4b535c] hover:bg-[#f3f4f6]"
              aria-label="Download"
            >
              <IconDocument />
            </button>
            <button
              type="button"
              className="h-10 px-4 rounded-[4px] bg-[#0267ff] text-white text-[14px] font-medium flex items-center gap-2 hover:bg-[#0252cc]"
            >
              Submit recommendations
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full min-w-0">
        {!deadlineBannerDismissed && (
        <div
          className="w-full rounded-[6px] border border-solid border-[#f29a35] bg-[#fff6e5] p-4 flex items-center gap-3 min-w-0"
          role="alert"
          data-name="Alerts & notifications"
          data-node-id="13693:315"
        >
          <IconAlertTriangle className="size-6 shrink-0 text-[#f29a35]" aria-hidden />
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[16px] font-medium leading-normal text-[#00050a]">
              {SCHEDULE_DEADLINE_BANNER_LABEL}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDeadlineBannerDismissed(true)}
            className="shrink-0 inline-flex items-center justify-center rounded-[4px] p-1.5 text-[#4b535c] hover:bg-black/[0.04]"
            aria-label="Dismiss deadline reminder"
          >
            <IconClose className="size-4" />
          </button>
        </div>
        )}

        {!importantUpdatesDismissed && (
        <div
          id="schedule-important-updates"
          className="w-full rounded-[6px] border border-solid border-[#0267ff] bg-[#ebf3ff] p-4 flex flex-col gap-0 min-w-0"
          data-name="Alerts & notifications"
          data-node-id="13693:311"
        >
          <div className="flex items-center gap-3 min-w-0">
            <DsIconInfo className="size-6 shrink-0 text-[#0267ff]" aria-hidden />
            <button
              type="button"
              onClick={() => setImportantUpdatesOpen((o) => !o)}
              className="flex flex-1 min-w-0 items-center justify-between gap-3 text-left min-h-0 rounded-[4px] py-0.5 px-1 -outline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0267ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#ebf3ff]"
              aria-expanded={importantUpdatesOpen}
              aria-controls="important-updates-panel"
              id="important-updates-trigger"
            >
              <span className="text-[16px] font-medium leading-normal text-[#00050a]">
                Important updates ({SCHEDULE_IMPORTANT_UPDATES_COUNT})
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden sm:flex items-center gap-1.5 whitespace-nowrap text-[#00050a] pr-1">
                  <span className="text-[16px] font-medium leading-normal tabular-nums">
                    {SCHEDULE_EXCEPTIONS_PENDING.toLocaleString()}
                  </span>
                  <span className="text-[14px] font-normal leading-normal text-[#00050a]">
                    exceptions pending
                  </span>
                </div>
                <span
                  className={`inline-flex text-[#4b535c] transition-transform duration-200 ${importantUpdatesOpen ? 'rotate-180' : ''}`}
                  aria-hidden
                >
                  <IconChevronDown />
                </span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setImportantUpdatesDismissed(true)}
              className="shrink-0 inline-flex items-center justify-center rounded-[4px] p-1.5 text-[#4b535c] hover:bg-black/[0.04]"
              aria-label="Dismiss important updates"
            >
              <IconClose className="size-4" />
            </button>
          </div>
          {importantUpdatesOpen && (
            <div
              id="important-updates-panel"
              role="region"
              aria-labelledby="important-updates-trigger"
              className="mt-3 pt-3 border-t border-[#0267ff]/25 flex flex-col gap-[8px] text-[14px] pl-9"
            >
              <p className="font-medium text-[#00050a]">
                {SCHEDULE_EXCEPTIONS_PENDING} exceptions still to approve
              </p>
              <p className="text-[#4b535c] leading-normal">
                The next scheduled recommendations are the UK weekly replenishment running on 10/03/2026.
              </p>
              <p className="text-[#4b535c] leading-normal">
                Any approved or locked recommendations will be auto-submitted at this time ({SCHEDULE_SUBMISSION_DEADLINE}).
              </p>
            </div>
          )}
        </div>
        )}
        </div>
      </header>

      <div className="flex flex-col gap-[15px]">
        <div className="flex items-center justify-between gap-4">
          <nav className="flex items-center gap-6 h-11">
            {[
              { id: 'trips', label: 'Trips' },
              { id: 'products', label: 'Products' },
              { id: 'locations', label: 'Locations' },
            ].map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
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
          <div className="flex items-center gap-2 shrink-0 pb-2">
            <div className={`relative ${viewDropdownOpen ? 'z-[120]' : ''}`}>
              <button
                type="button"
                onClick={() => setViewDropdownOpen((o) => !o)}
                className="flex items-center gap-2 h-10 px-4 rounded-[4px] border border-[#EAEAEA] bg-white text-[14px] font-medium text-[#212B36] hover:bg-[#f8f8f8] min-w-[200px] justify-between"
                aria-haspopup="listbox"
                aria-expanded={viewDropdownOpen}
                aria-label="Select view"
              >
                <span className="truncate max-w-[280px]" title={selectedView}>{selectedView}</span>
                <IconChevronDown className="size-4 text-[#4b535c] shrink-0" />
              </button>
              {viewDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[100]"
                    aria-hidden
                    onClick={() => setViewDropdownOpen(false)}
                  />
                  <ul
                    role="listbox"
                    className="absolute top-full right-0 z-[110] mt-1 min-w-[200px] max-w-[350px] rounded-[4px] border border-[#EAEAEA] bg-white py-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                  >
                    {VIEW_OPTIONS.map((option) => {
                      const isSelected = selectedView === option
                      return (
                        <li key={option} role="option" aria-selected={isSelected}>
                          <button
                            type="button"
                            onClick={() => handleSelectView(option)}
                            title={option}
                            className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-[14px] text-[#0a0a0a] hover:bg-[#f3f4f6] whitespace-nowrap overflow-hidden text-ellipsis"
                          >
                            <span className="min-w-0 flex-1 truncate" title={option}>{option}</span>
                            {isSelected && (
                              <span className="text-[#0267ff] shrink-0">
                                <IconCheck />
                              </span>
                            )}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>

        {activeTab === 'trips' ? (
          selectedTrip ? (
            <ProductsDrilldown trip={selectedTrip} onBack={() => setSelectedTrip(null)} />
          ) : (
          <div className="flex flex-col gap-[15px]">
            <div className="flex flex-col gap-[15px]">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center h-10 rounded-[4px] border border-[#e9eaeb] bg-white flex-1 min-w-[200px] max-w-[280px]">
                <input
                  type="text"
                  placeholder="Revenue increase"
                  className="flex-1 min-w-0 h-full pl-4 pr-2 border-0 bg-transparent rounded-[4px] text-[14px] text-[#0a0a0a] placeholder:text-[#9ca3af] focus:outline-none focus:ring-0"
                />
                <span className="pr-3 shrink-0 text-[#9ca3af]">
                  <IconSearch className="size-4" />
                </span>
              </div>
              <button
                type="button"
                className="h-10 w-10 flex items-center justify-center rounded-[4px] border border-[#e9eaeb] bg-white text-[#22272f] hover:bg-[#f3f4f6] shrink-0"
                aria-label="Column settings"
              >
                <IconColumnSettings />
              </button>
              <button
                type="button"
                className="h-10 w-10 flex items-center justify-center rounded-[4px] border border-[#e9eaeb] bg-white text-[#22272f] hover:bg-[#f3f4f6] shrink-0"
                aria-label="Sort order"
              >
                <IconSortOrder />
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setFiltersDropdownOpen((o) => !o)}
                  className="h-10 px-4 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#22272f] hover:bg-[#f3f4f6] shrink-0 flex items-center gap-2"
                >
                  <IconFilterFunnel />
                  Filters
                </button>
                {filtersDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-[60]" aria-hidden onClick={() => setFiltersDropdownOpen(false)} />
                    <div className="absolute left-0 top-full mt-1 z-[70] min-w-[200px] rounded-[6px] border border-[#e5e7eb] bg-white py-2 shadow-lg">
                      <div className="px-3 py-1.5 text-[12px] font-medium text-[#4b535c] uppercase tracking-wide">Status</div>
                      {[
                        { id: 'approved', label: 'Approved' },
                        { id: 'unapproved', label: 'Unapproved' },
                        { id: 'needs_review', label: 'Needs review' },
                        { id: 'edited', label: 'Edited' },
                      ].map((opt) => (
                        <label key={opt.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#f3f4f6] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={statusFilters.includes(opt.id)}
                            onChange={(e) => {
                              setStatusFilters((prev) =>
                                e.target.checked ? [...prev, opt.id] : prev.filter((x) => x !== opt.id)
                              )
                            }}
                            className="size-4 rounded border-[#d1d5db] text-[#0267ff]"
                          />
                          <span className="text-[13px] text-[#0a0a0a]">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {(() => {
              const viewChips =
                selectedView === 'Exception 1 — Transfer units lower than 10 · Location: Opéra'
                  ? ['Advanced: Transfer units lower than 10', 'Receiving location: Opéra']
                  : selectedView === 'Exception 2 — Product: A1252810, A12528YY, A13314YY'
                    ? ['Products: A1252810 +2']
                    : []
              const statusFilterLabels = { approved: 'Approved', unapproved: 'Unapproved', needs_review: 'Needs review',  edited: 'Edited' }
              const statusChips = statusFilters.map((f) => `Status: ${statusFilterLabels[f]}`)
              const filterChips = [...viewChips, ...statusChips]
              const showChipsRow =
                filterChips.length > 0 || statusFilters.length > 0 || !viewShowsFullDataset
              if (!showChipsRow) return null
              return (
                <div className="flex flex-wrap items-center gap-2 text-[12px]">
                  {filterChips.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {filterChips.map((label) => {
                        const isStatusChip = label.startsWith('Status: ')
                        return (
                          <span
                            key={label}
                            className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-[4px] bg-[#f3f4f6] text-[#4b535c] border border-[#e5e7eb]"
                          >
                            <span>{label}</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (isStatusChip) {
                                  const statusId = Object.entries(statusFilterLabels).find(([, l]) => label === `Status: ${l}`)?.[0]
                                  if (statusId) setStatusFilters((prev) => prev.filter((x) => x !== statusId))
                                } else {
                                  setViewShowsFullDataset(true)
                                  setSelectedView('Show all recommendations')
                                }
                              }}
                              className="p-0.5 rounded-[4px] text-[#6b7280] hover:bg-[#e5e7eb] hover:text-[#374151]"
                              aria-label={`Remove filter: ${label}`}
                            >
                              <IconClose className="size-3.5" />
                            </button>
                          </span>
                        )
                      })}
                    </div>
                  ) : null}
                  <div className="ml-auto flex items-center gap-3">
                    {(statusFilters.length > 0 || !viewShowsFullDataset) && (
                      <button
                        type="button"
                        onClick={() => {
                          setStatusFilters([])
                          setViewShowsFullDataset(true)
                          setSelectedView('Show all recommendations')
                        }}
                        className="text-[12px] font-medium text-[#4b535c] hover:text-[#0a0a0a]"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </div>
              )
            })()}
            </div>

            <div className="border border-[#e5e7eb] rounded-[8px] overflow-hidden bg-white">
              <div className="max-h-[min(65vh,800px)] overflow-x-auto overflow-y-auto">
              <table className="w-full table-fixed text-[14px] bg-white">
                <colgroup>
                  <col style={{ width: 56 }} />
                  {tripColumnOrder.map((logicalIdx) => (
                    <col key={logicalIdx} style={{ width: tripTableColWidths[logicalIdx] }} />
                  ))}
                </colgroup>
                <thead className="bg-white">
                  <tr className="border-b border-[#e5e7eb]">
                    <th className="sticky left-0 top-0 z-40 h-[62px] min-h-[62px] w-14 min-w-14 max-w-14 box-border bg-white px-4 py-[10px] text-left align-middle shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]">
                      <label className="flex min-h-[52px] cursor-pointer items-center py-[2px]">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-2 border-[#e9eaeb] bg-white text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-0"
                          aria-label="Select all trips"
                          checked={tripsRows.length > 0 && tripsRows.every((r) => selectedTripIds.has(r.id))}
                          onChange={toggleAllTripsSelection}
                        />
                      </label>
                    </th>
                    {tripColumnOrder.map((logicalIdx, visualIdx) => {
                      const grip = (
                        <TripColumnDragGrip visualIndex={visualIdx} onDragStart={onTripColDragStart} />
                      )
                      const resizer = (
                        <div
                          role="separator"
                          aria-orientation="vertical"
                          aria-label={TRIP_COL_RESIZE_LABELS[logicalIdx]}
                          className="absolute right-0 top-0 bottom-0 z-20 w-2.5 translate-x-1/2 cursor-col-resize select-none hover:bg-[#e2e8f0]"
                          onMouseDown={(e) => startTripTableColResize(logicalIdx, e)}
                        />
                      )
                      const dropProps = {
                        onDragEnter: onTripColDragEnter,
                        onDragOver: onTripColDragOver,
                        onDrop: (e) => onTripColDrop(visualIdx, e),
                      }
                      switch (logicalIdx) {
                        case 0:
                          return (
                            <th
                              key={logicalIdx}
                              className="sticky top-0 z-20 bg-white relative h-[62px] min-h-[62px] px-3 text-left align-middle font-medium text-[#0a0a0a] box-border"
                              {...dropProps}
                            >
                              <span className="inline-flex min-w-0 items-center gap-2">
                                {grip}
                                Sending location
                              </span>
                              {resizer}
                            </th>
                          )
                        case 1:
                          return (
                            <th
                              key={logicalIdx}
                              className="sticky top-0 z-20 bg-white relative h-[62px] min-h-[62px] px-3 text-left align-middle font-medium text-[#0a0a0a] box-border"
                              {...dropProps}
                            >
                              <span className="inline-flex min-w-0 items-center gap-2">
                                {grip}
                                Receiving location
                              </span>
                              {resizer}
                            </th>
                          )
                        case 2:
                          return (
                            <th
                              key={logicalIdx}
                              className="sticky top-0 z-20 bg-white relative h-[62px] min-h-[62px] px-3 text-left align-middle font-medium text-[#0a0a0a] box-border"
                              {...dropProps}
                            >
                              <span className="inline-flex min-w-0 items-center gap-2">
                                {grip}
                                Transfers
                              </span>
                              {resizer}
                            </th>
                          )
                        case 3:
                          return (
                            <th
                              key={logicalIdx}
                              className="sticky top-0 z-20 bg-white relative h-[62px] min-h-[62px] whitespace-nowrap pl-3 pr-8 text-left align-middle font-medium text-[#0a0a0a] box-border"
                              {...dropProps}
                            >
                              <span className="inline-flex min-w-0 max-w-full items-center gap-2 whitespace-nowrap">
                                {grip}
                                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                                  Revenue increase
                                  <IconInfo />
                                  <IconSortDown />
                                </span>
                              </span>
                              {resizer}
                            </th>
                          )
                        case 4:
                          return (
                            <th
                              key={logicalIdx}
                              className="sticky top-0 z-20 bg-white relative h-[62px] min-h-[62px] whitespace-nowrap px-3 text-right align-middle font-medium text-[#0a0a0a] box-border"
                              {...dropProps}
                            >
                              <span className="inline-flex w-full min-w-0 items-center justify-end gap-2 whitespace-nowrap">
                                {grip}
                                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                                  Recommended transfers
                                  <IconInfo />
                                </span>
                              </span>
                              {resizer}
                            </th>
                          )
                        case 5:
                          return (
                            <th
                              key={logicalIdx}
                              className="sticky top-0 z-20 bg-white relative h-[62px] min-h-[62px] whitespace-nowrap px-3 text-right align-middle font-medium text-[#0a0a0a] box-border"
                              {...dropProps}
                            >
                              <span className="inline-flex w-full items-center justify-end gap-2 whitespace-nowrap">
                                {grip}
                                Recommendations updated
                              </span>
                              {resizer}
                            </th>
                          )
                        case 6:
                          return (
                            <th
                              key={logicalIdx}
                              className="sticky top-0 z-20 bg-white relative h-[62px] min-h-[62px] px-3 text-right align-middle font-medium text-[#0a0a0a] box-border"
                              {...dropProps}
                            >
                              <span className="inline-flex w-full min-w-0 items-center justify-end gap-2">
                                {grip}
                                Products
                              </span>
                              {resizer}
                            </th>
                          )
                        case 7:
                          return (
                            <th
                              key={logicalIdx}
                              className={`sticky top-0 bg-white relative h-[62px] min-h-[62px] px-3 text-right align-middle font-medium text-[#0a0a0a] box-border ${
                                tripStatusColumnIsTrailing
                                  ? 'right-0 z-30 shadow-[-4px_0_12px_-6px_rgba(15,23,42,0.12)]'
                                  : 'z-20'
                              }`}
                              {...dropProps}
                            >
                              <span className="inline-flex w-full min-w-0 items-center justify-end gap-2">
                                {grip}
                                Status
                              </span>
                              {resizer}
                            </th>
                          )
                        default:
                          return null
                      }
                    })}
                  </tr>
                  <tr className="border-b border-[#e5e7eb]">
                    <th className="sticky left-0 top-[62px] z-40 w-14 min-w-14 max-w-14 box-border bg-white py-2 px-4 shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]" />
                    {tripColumnOrder.map((logicalIdx) => {
                      switch (logicalIdx) {
                        case 0:
                        case 1:
                          return (
                            <th
                              key={logicalIdx}
                              className="sticky top-[62px] z-20 bg-white py-2 px-3 text-[12px] font-normal text-[#4b535c]"
                            />
                          )
                        case 2:
                          return (
                            <th
                              key={logicalIdx}
                              className="sticky top-[62px] z-20 bg-white py-2 px-3 text-[12px] font-medium text-[#0a0a0a]"
                            >
                              {summaryTransfers}
                            </th>
                          )
                        case 3:
                          return (
                            <th
                              key={logicalIdx}
                              className="sticky top-[62px] z-20 bg-white py-2 pl-3 pr-8 text-[12px] font-medium text-[#0a0a0a]"
                            >
                              {summaryRevenue}
                            </th>
                          )
                        case 4:
                          return (
                            <th
                              key={logicalIdx}
                              className="sticky top-[62px] z-20 bg-white whitespace-nowrap py-2 px-3 text-right text-[12px] font-medium text-[#0a0a0a]"
                            >
                              {summaryRecommended}
                            </th>
                          )
                        case 5:
                          return (
                            <th
                              key={logicalIdx}
                              className="sticky top-[62px] z-20 bg-white py-2 px-3 text-right text-[12px] font-normal text-[#4b535c]"
                            >
                              —
                            </th>
                          )
                        case 6:
                          return (
                            <th
                              key={logicalIdx}
                              className="sticky top-[62px] z-20 bg-white py-2 px-3 text-right text-[12px] font-normal text-[#4b535c]"
                            >
                              N/A
                            </th>
                          )
                        case 7:
                          return (
                            <th
                              key={logicalIdx}
                              className={`sticky top-[62px] bg-white py-2 px-3 text-right ${
                                tripStatusColumnIsTrailing
                                  ? 'right-0 z-30 shadow-[-4px_0_12px_-6px_rgba(15,23,42,0.12)]'
                                  : 'z-20'
                              }`}
                            />
                          )
                        default:
                          return null
                      }
                    })}
                  </tr>
                </thead>
                <tbody>
                  {tripsRows.map((row) => {
                    const rowStatus = tripStatusOverrides[row.id] ?? getRowStatus(row)
                    const userName = row.approvedByUser || row.editedByUser

                    return (
                      <tr
                        key={row.id}
                        className="group border-b border-[#e5e7eb] bg-white hover:bg-[#f9fafb] cursor-pointer"
                        onClick={() => setSelectedTrip(row)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setSelectedTrip(row)
                          }
                        }}
                      >
                        <td
                          className="sticky left-0 z-30 min-h-[86px] w-14 min-w-14 max-w-14 box-border bg-white px-4 py-3 align-middle shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)] group-hover:bg-[#f9fafb]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-2 border-[#e9eaeb] bg-white text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-0"
                            aria-label={`Select trip ${row.from} to ${row.to}`}
                            checked={selectedTripIds.has(row.id)}
                            onChange={() => toggleTripSelection(row.id)}
                          />
                        </td>
                        {tripColumnOrder.map((logicalIdx) => {
                          switch (logicalIdx) {
                            case 0:
                              return (
                                <td key={logicalIdx} className="py-3 px-3 align-top">
                                  <div className="flex flex-col">
                                    <span className="text-[#0a0a0a] font-medium">{row.from}</span>
                                    <span className="text-[12px] text-[#4b535c]">{row.fromCode}</span>
                                  </div>
                                </td>
                              )
                            case 1:
                              return (
                                <td key={logicalIdx} className="py-3 px-3 align-top">
                                  <div className="flex flex-col">
                                    <span className="text-[#0a0a0a] font-medium">{row.to}</span>
                                    <span className="text-[12px] text-[#4b535c]">{row.toCode}</span>
                                  </div>
                                </td>
                              )
                            case 2:
                              return (
                                <td key={logicalIdx} className="py-3 px-3 align-top">
                                  <span className="text-[#0a0a0a]">{row.transfers}</span>
                                  <span className="text-[12px] text-[#4b535c] ml-1">(max 200)</span>
                                </td>
                              )
                            case 3:
                              return (
                                <td key={logicalIdx} className="py-3 pl-3 pr-8 align-top">
                                  <span className="text-[#0a0a0a]">{row.revenue}</span>
                                  <span className="text-[12px] text-[#4b535c] ml-1">(min 6903)</span>
                                </td>
                              )
                            case 4:
                              return (
                                <td key={logicalIdx} className="py-3 px-3 align-top text-right">
                                  <div className="flex flex-col gap-1 items-end">
                                    <span className="whitespace-nowrap text-[#0a0a0a]">{row.recommended}</span>
                                    <div className="flex flex-wrap gap-1 mt-1 justify-end">
                                      {row.badges?.includes('MDQ') && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-[#f8f8f8] text-[11px] font-medium text-[#0267ff]">
                                          MDQ
                                        </span>
                                      )}
                                      {row.badges?.includes('VIS') && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-[#f8f8f8] text-[11px] font-medium text-[#0267ff]">
                                          VS
                                        </span>
                                      )}
                                      {row.badges?.includes('REV') && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-[#f8f8f8] text-[11px] font-medium text-[#0267ff]">
                                          REV
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              )
                            case 5:
                              return (
                                <td key={logicalIdx} className="py-3 px-3 align-top text-right">
                                  <div className="flex flex-col gap-0.5 items-end">
                                    <span className="text-[14px] text-[#4B535C]">
                                      {row.recommendationsUpdated || '26/02/2026'}
                                    </span>
                                    {row.recommendationsUpdatedTime && (
                                      <span className="text-[12px] text-[#4b535c]">{row.recommendationsUpdatedTime}</span>
                                    )}
                                    {row.recommendationsUpdatedBy && (
                                      <span className="text-[11px] text-[#9ca3af]">{row.recommendationsUpdatedBy}</span>
                                    )}
                                  </div>
                                </td>
                              )
                            case 6:
                              return (
                                <td key={logicalIdx} className="py-3 px-3 align-top text-right">
                                  <span className="text-[#0a0a0a]">{row.products}</span>
                                </td>
                              )
                            case 7:
                              return (
                                <td
                                  key={logicalIdx}
                                  className={`py-3 px-3 align-top text-right${
                                    tripStatusColumnIsTrailing
                                      ? ' sticky right-0 z-30 bg-white shadow-[-4px_0_12px_-6px_rgba(15,23,42,0.12)] group-hover:bg-[#f9fafb]'
                                      : ''
                                  }`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex justify-end">
                                    <StatusDropdown
                                      rowId={`trip-${row.id}`}
                                      value={rowStatus}
                                      userName={userName}
                                      useShortEditedLabel
                                      onChange={(statusId) =>
                                        setTripStatusOverrides((prev) => ({ ...prev, [row.id]: statusId }))
                                      }
                                    />
                                  </div>
                                </td>
                              )
                            default:
                              return null
                          }
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              </div>
            </div>
          </div>
          )
        ) : activeTab === 'products' ? (
          <ProductsDrilldown trip={TRIPS_OPERA[0]} onBack={() => {}} showBackButton={false} />
        ) : activeTab === 'locations' ? (
          <LocationsTab />
        ) : null}

      {selectedTripIds.size > 0 && activeTab === 'trips' && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-[8px] px-6 py-3"
          style={{ background: '#1A1A2E', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}
        >
          <button
            type="button"
            onClick={clearSelection}
            className="flex items-center justify-center size-8 rounded-[4px] text-white hover:bg-white/10"
            aria-label="Close"
          >
            <IconClose className="size-4" />
          </button>
          <span className="text-[14px] font-medium text-white">
            {selectedTripIds.size} selected
          </span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setBulkChangeStatusOpen((o) => !o)}
              className="px-4 py-2 rounded-[4px] text-[14px] font-medium text-white hover:bg-white/10"
            >
              Change status
            </button>
            {bulkChangeStatusOpen && (
              <>
                <div className="fixed inset-0 z-[60]" aria-hidden onClick={() => setBulkChangeStatusOpen(false)} />
                <div
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-[70] min-w-[180px] rounded-[6px] border border-[#e5e7eb] bg-white py-1 shadow-lg"
                  style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                >
                  {STATUS_DROPDOWN_OPTIONS.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => handleBulkStatusChange(o.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-[13px] font-medium text-[#0a0a0a] hover:bg-[#f3f4f6]"
                    >
                      <span className={`size-2 rounded-full shrink-0 ${o.dotClass}`} aria-hidden />
                      <span>{o.dropdownLabel}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

