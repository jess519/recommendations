import { useState, useEffect, useRef, useCallback, useLayoutEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Filter, Plus, Copy } from 'lucide-react'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { IconSearch, IconChevronDown, IconChevronRight, IconShare, IconDocument, IconClose, IconArrowLeft, IconGears, IconTruckTu, IconPackageTu, IconRebalancing, IconReplenishment, IconCalendarNote, IconTrendUp, IconFilterFunnel, IconColumnSettings, IconSortOrder } from '../components/icons'
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

/** Trips table data cols; 3 = Transfers, 4 = Revenue increase, 5 = Recommended transfers (long headers) */
const TRIPS_TABLE_DEFAULT_COL_WIDTHS = [200, 200, 140, 120, 220, 160, 100, 200]
const TRIPS_TABLE_NUM_DATA_COLS = TRIPS_TABLE_DEFAULT_COL_WIDTHS.length
const TRIPS_COL_DND_MIME = 'application/x-autone-trip-col'
/** Logical product table columns are 0–17 (Status = 17). */
const PRODUCTS_TABLE_NUM_DATA_COLS = 18
/** Default visual order: cols 9–13 = Stockouts, Sales, Forecast, Stock in circulation, Warehouse units. */
const PRODUCTS_TABLE_DEFAULT_COLUMN_ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 12, 10, 11, 8, 9, 13, 14, 15, 16, 17]
const PRODUCTS_COL_DND_MIME = 'application/x-autone-products-col'
const LOCATIONS_TABLE_NUM_DATA_COLS = 14
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
  'Resize Movement type column',
  'Resize Transfers column',
  'Resize Revenue increase column',
  'Resize Recommended transfers column',
  'Resize Products column',
  'Resize Status column',
]
const SCHEDULE_CREATION_DATE = '24/02/2026'
const SCHEDULE_SUBMISSION_DEADLINE = '28/02/2026'

/** Hardcoded totals for Products tab summary row (6 visible products, trip id 1). */
const PRODUCTS_TAB_SUMMARY_TOTALS = {
  productDetails: '6 products',
  transfersUnits: '12 units',
  transfersTrips: '5 trips',
  revenue: '€6.9K',
  recommendedUnits: '18 units',
  recommendedTrips: '5 trips',
  stockUnits: '70 units',
  stockInTransit: '11 in transit',
  warehouseAllocate: '320 → 280 to allocate',
  warehouseSell: '400 → 360 to sell',
  salesL7: '138 L7D',
  salesL30: '693 L30D',
  forecast: '5.58',
  stockouts: '1 → 2',
  locations: '11 → 10',
  overstocks: '21 → 5',
  understocks: '25 → 11',
  depth: '4.0 → 5.2' }

/** Hardcoded totals for Trips tab summary row (TRIPS_ALL, default full dataset view). */
const TRIPS_TAB_SUMMARY_TOTALS_FULL = {
  sendingTrips: '22 trips',
  transfers: '2,038 units',
  revenue: '€435.3K',
  recommended: '2,151 units',
  products: '257 products' }

/** Hardcoded totals for Trips tab summary row (TRIPS_OPERA subset view). */
const TRIPS_TAB_SUMMARY_TOTALS_OPERA = {
  sendingTrips: '9 trips',
  transfers: '241 units',
  revenue: '€48.1K',
  recommended: '241 units',
  products: '147 products' }

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
    movementType: ['rebalancing'],
    badges: ['VIS', 'REV'],
    status: 'approved_by_system' },
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
    movementType: ['rebalancing'],
    badges: ['VIS', 'REV'],
    status: 'needs_review_from_user' },
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
    movementType: ['replenishment'],
    badges: ['VIS', 'REV'],
    status: 'last_edited_by_user',
    editedByUser: 'Csabi Toth' },
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
    movementType: ['rebalancing'],
    badges: ['REV'],
    status: 'approved_by_system' },
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
    movementType: ['replenishment', 'rebalancing'],
    badges: ['VIS', 'REV'],
    status: 'partially_approved' },
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
    movementType: ['replenishment'],
    badges: ['REV'],
    status: 'approved_by_user',
    approvedByUser: 'Jess Briggs' },
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
    movementType: ['rebalancing'],
    badges: ['VIS', 'REV'],
    status: 'approved_by_user',
    approvedByUser: 'Jess Briggs' },
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
    movementType: ['rebalancing'],
    badges: ['REV'],
    status: 'last_edited_by_user',
    editedByUser: 'Csabi Toth' },
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
    movementType: ['rebalancing'],
    badges: ['VIS', 'REV'],
    status: 'unapproved',
    editedByUser: 'Csabi Toth' },
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
    movementType: ['replenishment', 'rebalancing'],
    badges: ['MDQ', 'VIS', 'REV'],
    status: 'approved_by_system' },
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
    movementType: ['rebalancing'],
    badges: ['MDQ', 'VIS', 'REV'],
    status: 'unapproved' },
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
    movementType: ['rebalancing'],
    badges: ['MDQ', 'VIS', 'REV'] },
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
    movementType: ['replenishment'],
    badges: ['MDQ', 'VIS', 'REV'] },
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
    movementType: ['rebalancing'],
    badges: ['MDQ', 'VIS', 'REV'] },
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
    movementType: ['replenishment'],
    badges: ['MDQ', 'VIS', 'REV'] },
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
    movementType: ['rebalancing'],
    badges: ['MDQ', 'VIS', 'REV'] },
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
    movementType: ['replenishment'],
    badges: ['MDQ', 'VIS', 'REV'] },
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
    movementType: ['rebalancing'],
    badges: ['MDQ', 'VIS', 'REV'] },
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
    movementType: ['replenishment'],
    badges: ['MDQ', 'VIS', 'REV'] },
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
    movementType: ['replenishment', 'rebalancing'],
    badges: ['MDQ', 'VIS', 'REV'] },
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
    movementType: ['replenishment'],
    badges: ['MDQ', 'VIS', 'REV'] },
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
  { id: 1, name: 'Suk003 londres maryleb...', code: 'SUK003', movementType: ["rebalancing"], status: 'unapproved', transfersIn: 40, transfersInSub: '2 (max 2)', transfersOut: 0, transfersOutSub: '0', revenueIncrease: '€5.21K', recommendedIn: 40, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 0, stockInCirculation: 145, stockInTransit: 12, salesL7: 11, salesL30: 40, forecast: 13.46, stockouts: '9 → 0', overstocks: '0 → 0', understocks: '95 → 67' },
  { id: 2, name: 'Sfr004 fd calvaire', code: 'SFR004', movementType: ["rebalancing"], status: 'partially_approved', transfersIn: 38, transfersInSub: '2 (max 2)', transfersOut: 0, transfersOutSub: '0', revenueIncrease: '€4.4K', recommendedIn: 38, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 0, stockInCirculation: 89, stockInTransit: 0, salesL7: 8, salesL30: 32, forecast: 10.82, stockouts: '2 → 0', overstocks: '7 → 0', understocks: '154 → 139' },
  { id: 13, name: 'Out001 la vallée village', code: 'OUT001', movementType: ["rebalancing"], locationType: 'outlet', status: 'approved_by_system', transfersIn: 28, transfersInSub: '1 (max 2)', transfersOut: 0, transfersOutSub: '0', revenueIncrease: '€2.98K', recommendedIn: 28, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 0, stockInCirculation: 56, stockInTransit: 8, salesL7: 4, salesL30: 16, forecast: 5.12, stockouts: '6 → 3', overstocks: '8 → 2', understocks: '62 → 44' },
  { id: 3, name: 'Sfr012 legendre', code: 'SFR012', movementType: ["rebalancing"], status: 'approved_by_user', approvedByUser: 'Jess Briggs', transfersIn: 35, transfersInSub: '1 (max 2)', transfersOut: 15, transfersOutSub: '1 (max 3)', revenueIncrease: '€4.12K', recommendedIn: 35, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 15, stockInCirculation: 210, stockInTransit: 18, salesL7: 6, salesL30: 28, forecast: 9.14, stockouts: '5 → 2', overstocks: '12 → 4', understocks: '124 → 82' },
  { id: 4, name: 'Sfr008 saints-peres', code: 'SFR008', movementType: ["replenishment","rebalancing"], status: 'last_edited_by_user', editedByUser: 'Csabi Toth', transfersIn: 42, transfersInSub: '2 (max 2)', transfersOut: 0, transfersOutSub: '0', revenueIncrease: '€5.89K', recommendedIn: 42, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 0, stockInCirculation: 320, stockInTransit: 25, salesL7: 14, salesL30: 55, forecast: 15.22, stockouts: '3 → 0', overstocks: '2 → 0', understocks: '73 → 55' },
  { id: 5, name: 'Sfr013 sevigne', code: 'SFR013', movementType: ["rebalancing"], status: 'needs_review_from_user', transfersIn: 33, transfersInSub: '2 (max 2)', transfersOut: 0, transfersOutSub: '0', revenueIncrease: '€3.67K', recommendedIn: 33, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 0, stockInCirculation: 78, stockInTransit: 5, salesL7: 5, salesL30: 22, forecast: 8.14, stockouts: '12 → 5', overstocks: '18 → 6', understocks: '88 → 61' },
  { id: 14, name: 'Wh001 paris entrepôt', code: 'WH001', movementType: ["replenishment","rebalancing"], locationType: 'warehouse', status: 'unapproved', transfersIn: 95, transfersInSub: '4 (max 4)', transfersOut: 92, transfersOutSub: '4 (max 4)', revenueIncrease: '€12.4K', recommendedIn: 95, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 92, stockInCirculation: 580, stockInTransit: 45, salesL7: 0, salesL30: 0, forecast: 0, stockouts: '0 → 0', overstocks: '45 → 12', understocks: '0 → 0' },
  { id: 6, name: 'Sbe002 anvers', code: 'SBE002', movementType: ["rebalancing"], status: 'partially_approved', transfersIn: 29, transfersInSub: '1 (max 2)', transfersOut: 29, transfersOutSub: '2 (max 3)', revenueIncrease: '€3.21K', recommendedIn: 29, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 29, stockInCirculation: 112, stockInTransit: 0, salesL7: 3, salesL30: 18, forecast: 6.92, stockouts: '18 → 12', overstocks: '5 → 2', understocks: '112 → 78' },
  { id: 7, name: 'Sfr003 courcelles', code: 'SFR003', movementType: ["rebalancing"], status: 'approved_by_system', transfersIn: 45, transfersInSub: '2 (max 2)', transfersOut: 0, transfersOutSub: '0', revenueIncrease: '€6.12K', recommendedIn: 45, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 0, stockInCirculation: 198, stockInTransit: 22, salesL7: 16, salesL30: 62, forecast: 17.08, stockouts: '1 → 0', overstocks: '0 → 0', understocks: '42 → 28' },
  { id: 8, name: 'Sfr001 bonaparte', code: 'SFR001', movementType: ["replenishment"], status: 'approved_by_user', approvedByUser: 'Jess Briggs', transfersIn: 52, transfersInSub: '2 (max 2)', transfersOut: 0, transfersOutSub: '0', revenueIncrease: '€7.34K', recommendedIn: 52, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 0, stockInCirculation: 265, stockInTransit: 15, salesL7: 19, salesL30: 78, forecast: 21.45, stockouts: '0 → 0', overstocks: '0 → 0', understocks: '28 → 15' },
  { id: 15, name: 'Web001 france online', code: 'WEB001', movementType: ["replenishment"], locationType: 'ecomm', status: 'last_edited_by_user', editedByUser: 'Csabi Toth', transfersIn: 0, transfersInSub: '0', transfersOut: 0, transfersOutSub: '0', revenueIncrease: '€8.56K', recommendedIn: 0, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 0, stockInCirculation: 0, stockInTransit: 0, salesL7: 22, salesL30: 95, forecast: 28.34, stockouts: '0 → 0', overstocks: '0 → 0', understocks: '0 → 0' },
  { id: 9, name: 'Sfr005 charonne', code: 'SFR005', movementType: ["rebalancing"], status: 'needs_review_from_user', transfersIn: 31, transfersInSub: '1 (max 2)', transfersOut: 0, transfersOutSub: '0', revenueIncrease: '€3.45K', recommendedIn: 31, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 0, stockInCirculation: 67, stockInTransit: 0, salesL7: 4, salesL30: 19, forecast: 7.28, stockouts: '22 → 18', overstocks: '9 → 3', understocks: '136 → 94' },
  { id: 10, name: 'Sfr018 lyon', code: 'SFR018', movementType: ["rebalancing"], status: 'unapproved', transfersIn: 48, transfersInSub: '2 (max 2)', transfersOut: 0, transfersOutSub: '0', revenueIncrease: '€6.78K', recommendedIn: 48, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 0, stockInCirculation: 175, stockInTransit: 12, salesL7: 17, salesL30: 68, forecast: 18.92, stockouts: '2 → 1', overstocks: '3 → 1', understocks: '56 → 38' },
  { id: 11, name: 'Ssp001 madrid coello', code: 'SSP001', movementType: ["replenishment","rebalancing"], status: 'approved_by_system', transfersIn: 36, transfersInSub: '2 (max 2)', transfersOut: 0, transfersOutSub: '0', revenueIncrease: '€4.02K', recommendedIn: 36, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 0, stockInCirculation: 134, stockInTransit: 9, salesL7: 7, salesL30: 30, forecast: 9.56, stockouts: '8 → 4', overstocks: '14 → 5', understocks: '98 → 72' },
  { id: 12, name: 'Sfr014 guichard', code: 'SFR014', movementType: ["rebalancing"], status: 'partially_approved', transfersIn: 34, transfersInSub: '1 (max 2)', transfersOut: 0, transfersOutSub: '0', revenueIncrease: '€3.89K', recommendedIn: 34, recommendedInBadges: ['VIS', 'REV'], recommendedOut: 0, stockInCirculation: 91, stockInTransit: 7, salesL7: 6, salesL30: 26, forecast: 8.42, stockouts: '11 → 7', overstocks: '6 → 2', understocks: '82 → 58' },
]

// Mock products for trip drilldown (keyed by trip id)
const PRODUCTS_BY_TRIP = {
  1: [
    { id: 1, name: 'Croi-sac zip l', sku: 'A1398810', colour: 'Noir', movementType: ["rebalancing"], transfers: 3, transfersSub: 1, approvedTransfers: 3, unapprovedTransfers: 0, revenue: '€1.48K', recommended: 1, recommendedBadges: ['REV'], recommendedSub: 2, confidence: 'very_high', coverage: 'All SKUs in target', coverageWeeks: 5.2, coverageTarget: 6, nextEvent: { name: 'Europe monthly', date: '09/06/2026' }, salesL7: 1, salesL30: 2, forecast: 1.87, stockouts: '0 → 0', locations: '2 → 2', overstocks: '4 → 1', understocks: '8 → 5', depth: '5.0 → 5.0',     status: 'approved_by_system', currentUnits: 12, currentUnitsInTransit: 3, warehouseAllocateLine: '52 → 48', warehouseSellLine: '68 → 62' },
    { id: 2, name: 'Pre-sac seau m', sku: 'A101080', colour: 'Bleu petrole', movementType: ["rebalancing"], transfers: 2, transfersSub: 1, approvedTransfers: 0, unapprovedTransfers: 2, revenue: '€1.12K', recommended: 2, recommendedBadges: ['VIS'], recommendedSub: 1, confidence: 'high', coverage: '2% below target', coverageWeeks: 3.8, coverageTarget: 6, nextEvent: { name: 'Europe monthly', date: '09/06/2026' }, salesL7: 2, salesL30: 3, forecast: 0.54, stockouts: '0 → 1', locations: '2 → 1', overstocks: '3 → 0', understocks: '2 → 0', depth: '3.0 → 6.0', currentUnits: 8, currentUnitsInTransit: 0, warehouseAllocateLine: '58 → 51', warehouseSellLine: '72 → 65' },
    { id: 3, name: 'Ang-sac pte main m', sku: 'A1252810', colour: 'Figue', movementType: ["rebalancing"], transfers: 3, transfersSub: 2, approvedTransfers: 2, unapprovedTransfers: 1, revenue: '€1.89K', recommended: 3, recommendedBadges: ['REV', 'VIS'], recommendedSub: 1, confidence: 'high', coverage: '5% below target', coverageWeeks: 3.1, coverageTarget: 6, nextEvent: { name: 'Europe monthly', date: '09/06/2026' }, salesL7: 1, salesL30: 4, forecast: 2.1, stockouts: '1 → 0', locations: '2 → 2', overstocks: '5 → 2', understocks: '6 → 3', depth: '4.2 → 4.8',     status: 'last_edited_by_user', editedByUser: 'Csabi Toth', currentUnits: 25, currentUnitsInTransit: 5, warehouseAllocateLine: '48 → 42', warehouseSellLine: '65 → 58' },
    { id: 4, name: 'Croi-sac zip s', sku: 'A1398811', colour: 'Noir', movementType: ["rebalancing"], transfers: 1, transfersSub: 2, approvedTransfers: 1, unapprovedTransfers: 0, revenue: '€0.98K', recommended: 1, recommendedBadges: ['REV'], recommendedSub: 2, confidence: 'medium', coverage: 'All SKUs in target', coverageWeeks: 6.1, coverageTarget: 6, nextEvent: { name: 'Europe monthly', date: '09/06/2026' }, salesL7: 0, salesL30: 1, forecast: 0.32, stockouts: '0 → 0', locations: '1 → 2', overstocks: '2 → 1', understocks: '4 → 2', depth: '5.0 → 5.0', status: 'approved_by_user', approvedByUser: 'Jess Briggs', currentUnits: 3, currentUnitsInTransit: 1, warehouseAllocateLine: '55 → 50', warehouseSellLine: '70 → 63' },
    { id: 5, name: 'Pre-sac seau s', sku: 'A101081', colour: 'Bleu petrole', movementType: ["replenishment"], transfers: 2, transfersSub: 1, approvedTransfers: 1, unapprovedTransfers: 1, revenue: '€0.76K', recommended: 2, recommendedBadges: ['VIS'], recommendedSub: 1, confidence: 'low', coverage: '8% below target', coverageWeeks: 2.9, coverageTarget: 6, nextEvent: { name: 'UK weekly replenishment', date: '16/06/2026' }, salesL7: 1, salesL30: 2, forecast: 0.54, stockouts: '0 → 1', locations: '2 → 1', overstocks: '3 → 0', understocks: '2 → 0', depth: '3.0 → 6.0', status: 'needs_review_from_user', currentUnits: 15, currentUnitsInTransit: 2, warehouseAllocateLine: '50 → 45', warehouseSellLine: '68 → 61' },
    { id: 6, name: 'Ang-sac pte main s', sku: 'A1252811', colour: 'Figue', movementType: ["replenishment","rebalancing"], transfers: 4, transfersSub: 1, replenTransfers: 2, rebalTransfers: 2, approvedTransfers: 2, unapprovedTransfers: 2, revenue: '€0.65K', recommended: 1, recommendedBadges: ['REV'], recommendedSub: 1, confidence: 'very_low', coverage: '67% below target', coverageWeeks: 1.4, coverageTarget: 6, nextEvent: { name: 'Europe monthly', date: '09/06/2026' }, salesL7: 0, salesL30: 1, forecast: 0.21, stockouts: '0 → 0', locations: '2 → 2', overstocks: '4 → 1', understocks: '3 → 1', depth: '4.0 → 4.5', status: 'partially_approved', currentUnits: 7, currentUnitsInTransit: 0, warehouseAllocateLine: '57 → 44', warehouseSellLine: '57 → 51' },
  ],
  2: [
    { id: 7, name: 'Sac zip l', sku: 'B200001', colour: 'Noir', movementType: ["rebalancing"], transfers: 2, transfersSub: 1, approvedTransfers: 2, unapprovedTransfers: 0, revenue: '€0.89K', recommended: 2, recommendedBadges: ['REV'], recommendedSub: 1, confidence: 'medium', coverage: '3% below target', coverageWeeks: 4.8, coverageTarget: 6, nextEvent: { name: 'Europe monthly', date: '09/06/2026' }, salesL7: 1, salesL30: 2, forecast: 0.45, stockouts: '0 → 0', locations: '2 → 2', overstocks: '2 → 1', understocks: '5 → 3', depth: '4.5 → 5.0', status: 'approved_by_user', approvedByUser: 'Jess Briggs', currentUnits: 18, currentUnitsInTransit: 4, warehouseAllocateLine: '40 → 36', warehouseSellLine: '50 → 45' },
    { id: 8, name: 'Sac seau m', sku: 'B200002', colour: 'Noir', movementType: ["rebalancing"], transfers: 1, transfersSub: 2, approvedTransfers: 0, unapprovedTransfers: 1, revenue: '€0.52K', recommended: 1, recommendedBadges: ['VIS'], recommendedSub: 2, confidence: 'high', coverage: 'All SKUs in target', coverageWeeks: 6.3, coverageTarget: 6, nextEvent: { name: 'Europe monthly', date: '09/06/2026' }, salesL7: 0, salesL30: 1, forecast: 0.28, stockouts: '0 → 1', locations: '1 → 2', overstocks: '1 → 0', understocks: '3 → 1', depth: '3.6 → 4.3', status: 'last_edited_by_user', editedByUser: 'Csabi Toth', currentUnits: 11, currentUnitsInTransit: 2, warehouseAllocateLine: '35 → 30', warehouseSellLine: '42 → 38' },
  ] }

// Default products when trip not in PRODUCTS_BY_TRIP
const DEFAULT_PRODUCTS = PRODUCTS_BY_TRIP[1]

// Product IDs that show 'Edited' badge in Products drilldown
const PRODUCTS_EDITED_IDS = [1, 3]

// Mock locations for stock analysis drilldown (keyed by product id)
const LOCATIONS_BY_PRODUCT = {
  1: [
    { id: 1, name: 'Opéra', code: 'A1A', movementType: ["rebalancing"], stock: '6 → 12', tu: '6 → 12', tuWarehouse: 6, tuTruck: [3, 3], tuReplen: [2], salesL7: 1, salesL30: 2, forecast: 1.87, stockouts: '0 → 0', coverage: '0% → 100%', targetWeeks: 6, receivingWeeksCoverage: '3.2 → 6.4 (6 target)', recommendationReason: 'Increase revenue', revenueIncrease: '€679', availableToSend: 4, sendingStock: '10 → 7', sendingCoverage: '2.1 → 1.8 (4 target)', approvalStatus: 'approved_by_system' },
    { id: 2, name: 'G.L. Haussmann Maro', code: 'AIA', movementType: ["rebalancing"], stock: '6 → 6', tu: '4 → 5', tuWarehouse: 3, tuTruck: [1], tuReplen: [2], salesL7: 0, salesL30: 0, forecast: 0, stockouts: '0 → 0', coverage: '0% → 0%', targetWeeks: 4, receivingWeeksCoverage: 'N/A (0 forecast)', recommendationReason: 'Reduce overstock', revenueIncrease: '€120', availableToSend: 3, sendingStock: '8 → 5', sendingCoverage: 'N/A (0 forecast)' },
    { id: 3, name: 'La Défense', code: 'A2B', movementType: ["rebalancing"], stock: '5 → 5', tu: '4 → 5', tuWarehouse: 3, tuTruck: [1], tuReplen: [1], salesL7: 1, salesL30: 1, forecast: 0.76, stockouts: '0 → 0', coverage: '100% → 100%', targetWeeks: 4, receivingWeeksCoverage: '5.2 → 5.8 (4 target)', recommendationReason: 'Increase revenue', revenueIncrease: '€245', availableToSend: 4, sendingStock: '9 → 6', sendingCoverage: '1.8 → 1.2 (4 target)', approvalStatus: 'edited_by_user', editedByUser: 'Csabi Toth' },
    { id: 4, name: 'Cap 3000', code: 'A3E', movementType: ["replenishment","rebalancing"], stock: '4 → 4', tu: '0 → 1', tuWarehouse: null, tuTruck: [1], salesL7: 0, salesL30: 2, forecast: 0.32, stockouts: '0 → 0', coverage: '0% → 0%', targetWeeks: 4, receivingWeeksCoverage: 'N/A (0 forecast)', recommendationReason: 'Improve coverage', revenueIncrease: '€89', availableToSend: 2, sendingStock: '6 → 5', sendingCoverage: 'N/A (0 forecast)', approvalStatus: 'approved_by_user', approvedByUser: 'Jess Briggs' },
    { id: 5, name: 'Lyon Herriot', code: 'A4C', movementType: ["rebalancing"], stock: '5 → 5', tu: '0 → 1', tuWarehouse: null, tuTruck: [1], tuReplen: [], salesL7: 1, salesL30: 1, forecast: 0.54, stockouts: '0 → 0', coverage: '0% → 0%', targetWeeks: 4, receivingWeeksCoverage: '4.1 → 4.5 (4 target)', recommendationReason: 'Increase revenue', revenueIncrease: '€156', availableToSend: 3, sendingStock: '7 → 6', sendingCoverage: '2.4 → 2.0 (4 target)' },
    { id: 6, name: 'Printemps Lille', code: 'ASF', movementType: ["rebalancing"], stock: '8 → 8', tu: '0 → 20', tuWarehouse: 4, tuTruck: [20], tuReplen: [1], salesL7: 2, salesL30: 4, forecast: 2.1, stockouts: '0 → 0', coverage: '100% → 100%', targetWeeks: 6, receivingWeeksCoverage: '3.8 → 6.2 (6 target)', recommendationReason: 'Increase revenue', revenueIncrease: '€1.2K', availableToSend: 5, sendingStock: '12 → 8', sendingCoverage: '3.2 → 2.1 (6 target)', approvalStatus: 'approved_by_system' },
  ],
  2: [
    { id: 1, name: 'Opéra', code: 'A1A', movementType: ["rebalancing"], stock: '4 → 4', tu: '4 → 4', tuWarehouse: 4, tuTruck: [], salesL7: 2, salesL30: 3, forecast: 0.54, stockouts: '0 → 0', coverage: '100% → 100%', targetWeeks: 4, receivingWeeksCoverage: '5.2 → 5.2 (4 target)', recommendationReason: 'Increase revenue', revenueIncrease: '€312', availableToSend: 4, sendingStock: '8 → 4', sendingCoverage: '2.0 → 1.0 (4 target)', approvalStatus: 'approved_by_user', approvedByUser: 'Jess Briggs' },
    { id: 2, name: 'La Défense', code: 'A2B', movementType: ["rebalancing"], stock: '3 → 3', tu: '3 → 3', tuWarehouse: 3, tuTruck: [], salesL7: 1, salesL30: 2, forecast: 0.45, stockouts: '0 → 0', coverage: '100% → 100%', targetWeeks: 4, receivingWeeksCoverage: '4.1 → 4.1 (4 target)', recommendationReason: 'Reduce understock', revenueIncrease: '€98', availableToSend: 3, sendingStock: '6 → 3', sendingCoverage: '1.5 → 0.8 (4 target)', approvalStatus: 'edited_by_user', editedByUser: 'Csabi Toth' },
  ],
  3: [
    { id: 1, name: 'Opéra', code: 'A1A', movementType: ["rebalancing"], stock: '6 → 6', tu: '6 → 6', tuWarehouse: 6, tuTruck: [], salesL7: 1, salesL30: 4, forecast: 2.1, stockouts: '0 → 0', coverage: '100% → 100%', targetWeeks: 6, receivingWeeksCoverage: '2.9 → 2.9 (6 target)', recommendationReason: 'Increase revenue', revenueIncrease: '€445', availableToSend: 6, sendingStock: '12 → 6', sendingCoverage: '2.8 → 1.4 (6 target)' },
    { id: 2, name: 'G.L. Haussmann Maro', code: 'AIA', movementType: ["rebalancing"], stock: '5 → 5', tu: '5 → 5', tuWarehouse: 5, tuTruck: [], salesL7: 0, salesL30: 0, forecast: 0, stockouts: '0 → 0', coverage: '0% → 0%', targetWeeks: 5, receivingWeeksCoverage: 'N/A (0 forecast)', recommendationReason: 'Improve coverage', revenueIncrease: '€0', availableToSend: 5, sendingStock: '10 → 5', sendingCoverage: 'N/A (0 forecast)', approvalStatus: 'approved_by_system' },
  ] }

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
    estimatedLostSales: Math.round(lostSales * 10) / 10 }
})

// ============================================================
// EXPLORER TAB MOCK DATA
// ============================================================

const EXPLORER_WAREHOUSE = 'Log01 entrepot logtex'

const EXPLORER_STORES = [
  'Opéra',
  'G.L. Haussmann Maro',
  'La Défense',
  'Cap 3000',
  'Lyon Herriot',
  'Printemps Lille',
]

const EXPLORER_PRODUCTS = [
  {
    id: 'exp-p1',
    name: 'Ang-sac pte main m',
    baseSku: 'A1252810',
    colour: 'Noir',
    department: 'Handbags',
    subDepartment: 'Sac à main',
    material: 'Cuir',
    gender: 'Femme',
    rrp: '€890',
    ws: '€0',
    ic: '€45',
    seasonAndEvent: 'Winter 26 · Vague 1',
    // Two sizes → sibling SKUs share product attrs, differ on life-to-date sales
    sizes: ['S', 'M'],
    movementTypes: ['replenishment', 'rebalancing'] },
  {
    id: 'exp-p6',
    name: 'Ang-sac pte main s',
    baseSku: 'A1252811',
    colour: 'Noir',
    department: 'Handbags',
    subDepartment: 'Sac à main',
    material: 'Cuir verni',
    gender: 'Femme',
    rrp: '€750',
    ws: '€12',
    ic: '€38',
    seasonAndEvent: 'Winter 26 · Vague 2',
    sizes: ['S'],
    movementTypes: ['replenishment', 'rebalancing'] },
  {
    id: 'exp-p2',
    name: 'Croi-sac zip l',
    baseSku: 'A1398810',
    colour: 'Noir',
    department: 'Crossbody',
    subDepartment: 'Bandoulière',
    material: 'Nylon',
    gender: 'Unisexe',
    rrp: '€420',
    ws: '€0',
    ic: '€22',
    seasonAndEvent: 'SS26 · Drop 3',
    sizes: ['L'],
    movementTypes: ['replenishment'] },
  {
    id: 'exp-p3',
    name: 'Pre-sac seau m',
    baseSku: 'A101080',
    colour: 'Bleu petrole',
    department: 'Bucket bags',
    subDepartment: 'Seau',
    material: 'Laine',
    gender: 'Femme',
    rrp: '€85',
    ws: '€0',
    ic: '€10',
    seasonAndEvent: 'Winter 26 · Vague 2',
    sizes: ['M'],
    movementTypes: ['replenishment'] },
  {
    id: 'exp-p4',
    name: 'Croi-sac zip s',
    baseSku: 'A1398811',
    colour: 'Noir',
    department: 'Crossbody',
    subDepartment: 'Bandoulière',
    material: 'Cuir',
    gender: 'Homme',
    rrp: '€380',
    ws: '€25',
    ic: '€18',
    seasonAndEvent: 'SS26 · Drop 1',
    sizes: ['S'],
    movementTypes: ['rebalancing'] },
  {
    id: 'exp-p5',
    name: 'Pre-sac seau s',
    baseSku: 'A101081',
    colour: 'Bleu petrole',
    department: 'Bucket bags',
    subDepartment: 'Foulard',
    material: 'Cachemire',
    gender: 'Femme',
    rrp: '€120',
    ws: '€8',
    ic: '€15',
    seasonAndEvent: 'AW25 · Continuity',
    sizes: ['S'],
    movementTypes: ['rebalancing'] },
]

const DEPARTMENT_FILTER_OPTIONS = ['Handbags', 'Crossbody', 'Bucket bags']

const MOVEMENT_TYPE_FILTER_OPTIONS = [
  { id: 'replenishment', label: 'Replenishment' },
  { id: 'rebalancing', label: 'Rebalancing' },
]

const CONFIDENCE_FILTER_OPTIONS = [
  { id: 'very_high', label: 'Very high' },
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
  { id: 'very_low', label: 'Very low' },
]

const STATUS_CYCLE = [
  'approved_by_system', 'approved_by_system', 'approved_by_system',
  'unapproved', 'unapproved', 'unapproved',
  'needs_review_from_user', 'needs_review_from_user',
  'last_edited_by_user', 'last_edited_by_user',
  'approved_by_user',
]

const CONFIDENCE_CYCLE = ['very_high', 'high', 'high', 'medium', 'medium', 'low', 'very_low']
const BADGE_CYCLE = [['REV'], ['VIS'], ['REV', 'VIS'], ['REV'], ['VIS']]

function buildExplorerRow(rowIndex, product, size, fromLoc, toLoc, movementType) {
  const coverageWeeksBefore = Number((1 + (rowIndex * 1.3) % 5).toFixed(1))
  const coverageWeeksAfter = Number((coverageWeeksBefore + 0.5 + (rowIndex % 4) * 0.8).toFixed(1))
  const salesL7 = ((rowIndex * 2) % 15) + 1
  const transfers = 1 + (rowIndex * 3) % 15
  // Usually headroom (green); every 7th row is constrained (orange by default).
  const availableToSend =
    rowIndex % 7 === 0 ? Math.max(0, transfers - 2 - (rowIndex % 3)) : transfers + 2 + (rowIndex % 5)
  // Service level: ~1/3 probability / service level / £ last-unit. sizeIdx shifts
  // sibling SKUs by ≥10pp (or €8). Injected lows: prob <30%, service level >70%, £ <€5.
  const framing = rowIndex % 3
  const sizeIdx = Math.max(0, product.sizes.indexOf(size))
  const initialAllocation = 1 + ((rowIndex * 7 + sizeIdx * 3) % 20)
  const [createDd, createMm, createYyyy] = SCHEDULE_CREATION_DATE.split('/').map(Number)
  const creationBase = new Date(createYyyy, createMm - 1, createDd)
  const stockDaysAgo = 30 + ((rowIndex * 11 + sizeIdx * 5) % 91) // 30–120 days before creation
  const salesDaysAgo = Math.max(1, stockDaysAgo - (5 + (rowIndex % 25))) // later than first stock
  const formatExplorerDate = (date) => {
    const dd = String(date.getDate()).padStart(2, '0')
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    return `${dd}/${mm}/${date.getFullYear()}`
  }
  const firstStockDateValue = (() => {
    const d = new Date(creationBase)
    d.setDate(d.getDate() - stockDaysAgo)
    return formatExplorerDate(d)
  })()
  const firstSalesDateValue =
    rowIndex % 5 === 0
      ? null
      : (() => {
          const d = new Date(creationBase)
          d.setDate(d.getDate() - salesDaysAgo)
          return formatExplorerDate(d)
        })()
  let serviceLevel
  if (framing === 0) {
    let pct = 40 + ((rowIndex * 5) % 40) + sizeIdx * 12
    if (rowIndex % 18 === 0) pct = 15 + sizeIdx * 12
    serviceLevel = `${Math.min(95, pct)}% p(sell) last unit`
  } else if (framing === 1) {
    let pct = 20 + ((rowIndex * 5) % 40) + sizeIdx * 12
    if (rowIndex % 18 === 1) pct = 75 + sizeIdx * 12
    serviceLevel = `${Math.min(95, pct)}% service level`
  } else {
    let euros = 8 + ((rowIndex * 3) % 30) + sizeIdx * 8
    if (rowIndex % 18 === 2) euros = 2 + sizeIdx * 8
    serviceLevel = `€${euros} last unit`
  }
  return {
    id: `exp-row-${rowIndex}`,
    productId: product.id,
    productName: product.name,
    sku: `${product.baseSku}-${size}`,
    size,
    colour: product.colour,
    department: product.department,
    subDepartment: product.subDepartment,
    material: product.material,
    gender: product.gender,
    rrp: product.rrp,
    ws: product.ws,
    ic: product.ic,
    seasonAndEvent: product.seasonAndEvent,
    lifeToDateSales: (rowIndex * 7) % 51, // ~0–50 units, varies per SKU-location row
    fromLocation: fromLoc,
    toLocation: toLoc,
    movementType,
    transfers,
    availableToSend,
    revenue: `€${(0.5 + (rowIndex * 0.37) % 4.5).toFixed(2)}K`,
    recommended: '1',
    recommendedBadges: BADGE_CYCLE[rowIndex % BADGE_CYCLE.length],
    recommendedSub: rowIndex % 3 === 0 ? '2' : undefined,
    confidence: CONFIDENCE_CYCLE[rowIndex % CONFIDENCE_CYCLE.length],
    serviceLevel,
    coverageWeeksBefore,
    coverageWeeksAfter,
    nextEvent: {
      name: rowIndex % 2 === 0 ? 'No event' : 'Rebal cycle',
      date: SCHEDULE_CREATION_DATE,
    },
    salesL7,
    salesL30: salesL7 * 5,
    currentUnits: 10 + (rowIndex * 5) % 50,
    currentUnitsInTransit: rowIndex % 6,
    warehouseAllocateLine: `${50 + (rowIndex * 3) % 20} → ${45 + (rowIndex * 3) % 20}`,
    warehouseSellLine: `${65 + (rowIndex * 5) % 25} → ${58 + (rowIndex * 5) % 25}`,
    forecast: Number(((rowIndex * 0.31) % 3 + 0.5).toFixed(2)),
    initialAllocation,
    firstStockDate: firstStockDateValue,
    firstSalesDate: firstSalesDateValue,
    status: STATUS_CYCLE[rowIndex % STATUS_CYCLE.length],
    approvedByUser: false,
    editedByUser: false,
  }
}

function buildExplorerData() {
  const rows = []
  let rowIndex = 0

  EXPLORER_PRODUCTS.forEach((product) => {
    product.sizes.forEach((size) => {
      product.movementTypes.forEach((movementType) => {
        if (movementType === 'replenishment') {
          EXPLORER_STORES.forEach((store) => {
            rows.push(buildExplorerRow(rowIndex++, product, size, EXPLORER_WAREHOUSE, store, 'replenishment'))
          })
        } else {
          for (let i = 0; i < 6; i++) {
            const fromIdx = i
            const toIdx = (i + 2) % EXPLORER_STORES.length
            if (fromIdx !== toIdx) {
              rows.push(buildExplorerRow(rowIndex++, product, size, EXPLORER_STORES[fromIdx], EXPLORER_STORES[toIdx], 'rebalancing'))
            }
          }
        }
      })
    })
  })

  return rows
}

const EXPLORER_DATA = buildExplorerData()

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
  { id: 'last_edited_by_user', displayLabel: 'Edited', dotClass: 'bg-[#0267ff]' },
  { id: 'unapproved', displayLabel: 'Unapproved', dotClass: 'bg-[#878d94]' },
  { id: 'needs_review_from_user', displayLabel: 'Needs review', dotClass: 'bg-[#bd5800]' },
  { id: 'partially_approved', displayLabel: 'Partially approved', dotClass: 'bg-[#f29a35]' },
]

// Selectable options only (short action labels in dropdown; badge shows full displayLabel)
const STATUS_DROPDOWN_OPTIONS = [
  { id: 'approved_by_user', dropdownLabel: 'Approve', dotClass: 'bg-[#08a16a]' },
  { id: 'unapproved', dropdownLabel: 'Unapprove', dotClass: 'bg-[#878d94]' },
  { id: 'needs_review_from_user', dropdownLabel: 'Needs review', dotClass: 'bg-[#bd5800]' },
]

const STATUS_BADGE_CLASSES = {
  approved_by_system: 'bg-[#e4f4ef] text-[#0a0a0a] border-[#08a16a]',
  approved_by_user: 'bg-[#e4f4ef] text-[#0a0a0a] border-[#08a16a]',
  last_edited_by_user: 'bg-[#ebf3ff] text-[#0a0a0a] border-[#0267ff]',
  unapproved: 'bg-[#f4f4f5] text-[#0a0a0a] border-[#878d94]',
  needs_review_from_user: 'bg-[#ffe4cc] text-[#0a0a0a] border-[#bd5800]',
  partially_approved: 'bg-[#fef3c7] text-[#92400e]' }

const CONFIDENCE_PILL_CONFIG = {
  very_high: {
    label: 'Very high',
    badgeClass: 'bg-[#cce8dc] text-[#0a0a0a] border-[#067a4e]',
    dotClass: 'bg-[#067a4e]' },
  high: {
    label: 'High',
    badgeClass: 'bg-[#e4f4ef] text-[#0a0a0a] border-[#08a16a]',
    dotClass: 'bg-[#08a16a]' },
  medium: {
    label: 'Medium',
    badgeClass: 'bg-[#fef9c3] text-[#0a0a0a] border-[#ca8a04]',
    dotClass: 'bg-[#eab308]' },
  low: {
    label: 'Low',
    badgeClass: 'bg-[#ffe4cc] text-[#0a0a0a] border-[#bd5800]',
    dotClass: 'bg-[#bd5800]' },
  very_low: {
    label: 'Very low',
    badgeClass: 'bg-[#fee2e2] text-[#0a0a0a] border-[#dc2626]',
    dotClass: 'bg-[#dc2626]' } }

function ConfidencePill({ value }) {
  const cfg = CONFIDENCE_PILL_CONFIG[value] || CONFIDENCE_PILL_CONFIG.medium
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-[6px] border text-[12px] font-medium border-transparent ${cfg.badgeClass}`}
    >
      <span className={`size-2 rounded-full shrink-0 ${cfg.dotClass}`} aria-hidden />
      <span className="truncate">{cfg.label}</span>
    </span>
  )
}

function ProductCoverageText({ coverageWeeks, coverageTarget, coverage }) {
  if (coverageWeeks == null || coverageTarget == null) {
    return <span className="text-[14px] text-[#4b535c]">N/A</span>
  }
  const isBelowTarget = coverage?.includes('below target')
  const badgeText = isBelowTarget ? coverage.replace(' below target', ' of SKUs below target') : coverage
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-[14px] text-[#0a0a0a] font-medium">{coverageWeeks} wks</span>
      {coverage && (
        <span
          className={`px-1.5 py-0.5 rounded-[4px] text-[11px] font-medium ${
            isBelowTarget ? 'bg-[#fee2e2] text-[#E30D3C]' : 'bg-[#dcfce7] text-[#166534]'
          }`}
        >
          {badgeText}
        </span>
      )}
    </div>
  )
}

function ProductNextEventCell({ nextEvent }) {
  if (!nextEvent) return null
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-[13px] font-medium text-[#0a0a0a]">{nextEvent.name}</span>
      <span className="text-[12px] text-[#4b535c]">{nextEvent.date}</span>
    </div>
  )
}

const MOVEMENT_TYPE_PILL_CLASS =
  'inline-flex w-fit items-center px-2 py-0.5 rounded-[6px] border text-[12px] font-medium bg-[#f4f4f5] text-[#0a0a0a] border-[#878d94]'

const MOVEMENT_TYPE_LABELS = {
  replenishment: 'Replen',
  rebalancing: 'Rebal' }

function MovementTypePills({ movementType }) {
  const types = Array.isArray(movementType) ? movementType : []
  return (
    <div className="flex flex-col items-start gap-1">
      {types.map((t) => (
        <span key={t} className={MOVEMENT_TYPE_PILL_CLASS}>
          {MOVEMENT_TYPE_LABELS[t] ?? t}
        </span>
      ))}
    </div>
  )
}

const PRODUCTS_QUICK_FILTER_CHIPS = [
  { id: 'low_confidence', label: 'Low confidence' },
  { id: 'unapproved', label: 'Unapproved' },
  { id: 'needs_review', label: 'Needs review' },
  { id: 'bestsellers', label: 'Bestsellers' },
  { id: 'selling_fast', label: 'Selling fast' },
  { id: 'new_in', label: 'New in' },
  { id: 'slowing_down', label: 'Slowing down' },
]

const EXPLORER_QUICK_FILTER_CHIPS = [
  { id: 'low_confidence', label: 'Low confidence' },
  { id: 'unapproved', label: 'Unapproved' },
  { id: 'needs_review', label: 'Needs review' },
]

function ScheduleQuickFilterChips({ chips, activeId, onChange }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      {chips.map((chip) => {
        const active = activeId === chip.id
        return (
          <button
            key={chip.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? null : chip.id)}
            className={`shrink-0 h-8 px-3 rounded-full text-[13px] font-medium border transition-colors ${
              active
                ? 'bg-[#0267ff] text-white border-[#0267ff] hover:bg-[#0252cc]'
                : 'bg-[#f3f4f6] text-[#0a0a0a] border-[#e5e7eb] hover:bg-[#e9eaeb]'
            }`}
          >
            {chip.label}
          </button>
        )
      })}
    </div>
  )
}

function StatusDropdown({ value, userName, onChange, rowId, useShortEditedLabel }) {
  const [open, setOpen] = useState(false)
  const [dropdownId] = useState(() => `status-dd-${rowId}-${Math.random().toString(36).slice(2)}`)
  const buttonRef = useRef(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const opt = STATUS_OPTIONS.find((o) => o.id === value) || STATUS_OPTIONS.find((o) => o.id === 'unapproved')
  const badgeClass = STATUS_BADGE_CLASSES[value] || STATUS_BADGE_CLASSES.unapproved
  const displayLabel = opt?.displayLabel ?? 'Unapproved'

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
 *
 * Leave is delayed briefly so panels that opt into pointer-events-auto (e.g. Explorer
 * SKU copy controls) remain reachable. Default panel content stays pointer-events-none.
 */
function TuHoverPopover({ children, panel }) {
  const wrapRef = useRef(null)
  const popRef = useRef(null)
  const closeTimerRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ left: 0, top: 0 })

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current != null) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const scheduleClose = useCallback(() => {
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => setOpen(false), 200)
  }, [clearCloseTimer])

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

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer])

  const handleEnter = () => {
    clearCloseTimer()
    const el = wrapRef.current
    if (el) {
      const rect = el.getBoundingClientRect()
      setCoords({ left: rect.right + 8, top: rect.top + rect.height / 2 })
    }
    setOpen(true)
  }

  return (
    <>
      <div ref={wrapRef} className="relative inline-block" onMouseEnter={handleEnter} onMouseLeave={scheduleClose}>
        {children}
      </div>
      {open &&
        createPortal(
          <div
            ref={popRef}
            className="pointer-events-none fixed z-[10000]"
            style={{ left: coords.left, top: coords.top, transform: 'translateY(-50%)' }}
            onMouseEnter={clearCloseTimer}
            onMouseLeave={scheduleClose}
          >
            {panel}
          </div>,
          document.body
        )}
    </>
  )
}

function SkuDetailsCopyId({ label, value }) {
  const [copied, setCopied] = useState(false)
  const copiedTimerRef = useRef(null)

  useEffect(() => () => {
    if (copiedTimerRef.current != null) clearTimeout(copiedTimerRef.current)
  }, [])

  const handleCopy = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // Prototype: ignore clipboard failures (insecure context, permissions, etc.)
    }
    setCopied(true)
    if (copiedTimerRef.current != null) clearTimeout(copiedTimerRef.current)
    copiedTimerRef.current = setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="pointer-events-auto flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="text-[10px] font-bold uppercase tracking-[0.04em] text-[#9ca3af]">{label}</span>
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="min-w-0 truncate text-[13px] font-medium tabular-nums text-[#0a0a0a]">{value}</span>
        <button
          type="button"
          onClick={handleCopy}
          onMouseDown={(e) => e.stopPropagation()}
          className="pointer-events-auto inline-flex shrink-0 items-center justify-center rounded-[4px] p-0.5 text-[#4b535c] hover:bg-[#f3f4f6] hover:text-[#0a0a0a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-500"
          aria-label={copied ? 'Copied' : `Copy ${label}`}
          title={copied ? 'Copied!' : `Copy ${label}`}
        >
          {copied ? (
            <span className="px-0.5 text-[11px] font-semibold text-[#15803d]">Copied!</span>
          ) : (
            <Copy className="h-3.5 w-3.5 shrink-0" aria-hidden />
          )}
        </button>
      </div>
    </div>
  )
}

function SkuDetailsAttrRow({ label, value }) {
  const display = value === null || value === undefined || value === '' ? '—' : value
  return (
    <div className="flex items-start justify-between gap-3 text-[13px]">
      <span className="min-w-0 text-[#4b535c]">{label}</span>
      <span className="max-w-[58%] shrink-0 text-right font-medium tabular-nums text-[#0a0a0a]">{String(display)}</span>
    </div>
  )
}

/** Product / SKU attribute panel for Explorer SKU details hover */
function SkuDetailsHoverCard({ row }) {
  const lifeToDate =
    row.lifeToDateSales == null ? '—' : `${row.lifeToDateSales} unit${row.lifeToDateSales === 1 ? '' : 's'}`
  return (
    <div className="pointer-events-auto w-[min(300px,calc(100vw-1.5rem))] rounded-[8px] border border-[#E9EAEB] bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
      <div className="pointer-events-auto flex gap-3 border-b border-[#E9EAEB] pb-3">
        <SkuDetailsCopyId label="Product ID" value={row.productId} />
        <SkuDetailsCopyId label="SKU ID" value={row.sku} />
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <SkuDetailsAttrRow label="RRP" value={row.rrp} />
        <SkuDetailsAttrRow label="WS" value={row.ws} />
        <SkuDetailsAttrRow label="IC" value={row.ic} />
        <SkuDetailsAttrRow label="Season and event" value={row.seasonAndEvent} />
        <SkuDetailsAttrRow label="Life to date sales" value={lifeToDate} />
        <SkuDetailsAttrRow label="Department" value={row.department} />
        <SkuDetailsAttrRow label="Sub-department" value={row.subDepartment} />
        <SkuDetailsAttrRow label="Material" value={row.material} />
        <SkuDetailsAttrRow label="Gender" value={row.gender} />
      </div>
    </div>
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

const TU_TRANSFER_BADGE_SHELL =
  'inline-flex h-[26px] min-w-[50px] w-fit shrink-0 items-center justify-center gap-1.5 rounded-[2px] px-[6px] py-[2px] text-[12px] font-medium text-white cursor-pointer transition-[filter,box-shadow] hover:brightness-90 hover:shadow-[0px_2px_4px_rgba(0,0,0,0.1)]'

function EditableTuTransferBadge({
  value,
  isEditing,
  editingValue,
  onStartEdit,
  onEditingValueChange,
  onCommit,
  onCancel,
  bgClassName,
  icon,
  hoverPanel }) {
  if (isEditing) {
    return (
      <input
        type="number"
        min={0}
        autoFocus
        value={editingValue}
        onChange={(e) => onEditingValueChange(e.target.value)}
        onBlur={onCommit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            onCommit()
          }
          if (e.key === 'Escape') {
            e.preventDefault()
            onCancel()
          }
        }}
        onClick={(e) => e.stopPropagation()}
        className="h-[26px] min-w-[50px] w-[50px] rounded-[2px] border border-[#e9eaeb] px-[6px] py-[2px] text-[12px] font-medium text-[#0a0a0a] text-center focus:outline-none"
      />
    )
  }

  return (
    <TuHoverPopover panel={hoverPanel}>
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation()
          onStartEdit()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            e.stopPropagation()
            onStartEdit()
          }
        }}
        className={`${TU_TRANSFER_BADGE_SHELL} ${bgClassName}`}
      >
        {icon}
        {value}
      </span>
    </TuHoverPopover>
  )
}

function locationVisibleForTripTypeFilters(loc, tripTypeFilters) {
  if (loc.tuWarehouse != null) return true
  const showRebal = tripTypeFilters.includes('rebalancing')
  const showReplen = tripTypeFilters.includes('replenishment')
  const truckCount = loc.tuTruck?.length ?? 0
  const replenCount = loc.tuReplen?.length ?? 0
  if (showReplen && replenCount > 0) return true
  if (showRebal && truckCount > 0) return true
  if (showRebal && truckCount === 0 && replenCount === 0) return true
  return false
}

function StockAnalysisDrilldown({
  product,
  trip,
  onBack,
  setExplorerProductNameFilters,
  setActiveTab,
  productStatusOverrides,
  setProductStatusOverrides }) {
  const [selectedTransferDetail, setSelectedTransferDetail] = useState(null)
  const [approvedLocations, setApprovedLocations] = useState({})
  const [selectedLocationIds, setSelectedLocationIds] = useState(new Set())
  const [tuBoxOverrides, setTuBoxOverrides] = useState({})
  const [editingTuBoxKey, setEditingTuBoxKey] = useState(null)
  const [editingTuBoxValue, setEditingTuBoxValue] = useState('')
  const [drilldownTripTypeFilters, setDrilldownTripTypeFilters] = useState([
    'rebalancing',
    'replenishment',
  ])
  const [drilldownFiltersOpen, setDrilldownFiltersOpen] = useState(false)
  const locations = LOCATIONS_BY_PRODUCT[product.id] || DEFAULT_LOCATIONS
  const breadcrumbFrom = `${trip.from} [${trip.fromCode}]`

  useEffect(() => {
    setDrilldownTripTypeFilters(['rebalancing', 'replenishment'])
  }, [product.id])

  const showRebalancing = drilldownTripTypeFilters.includes('rebalancing')
  const showReplenishment = drilldownTripTypeFilters.includes('replenishment')

  const filteredLocations = useMemo(
    () => locations.filter((loc) => locationVisibleForTripTypeFilters(loc, drilldownTripTypeFilters)),
    [locations, drilldownTripTypeFilters]
  )

  const tuBoxKey = (locId, type, index) => `${product.id}-${locId}-${type}-${index}`

  const getEffectiveTuBoxValue = (key, baseValue) =>
    tuBoxOverrides[key] !== undefined ? tuBoxOverrides[key] : baseValue

  const startEditTuBox = (key, currentValue) => {
    setEditingTuBoxKey(key)
    setEditingTuBoxValue(String(currentValue))
  }

  const commitTuBoxEdit = () => {
    if (!editingTuBoxKey) return
    const parsed = parseInt(editingTuBoxValue, 10)
    const value = Number.isFinite(parsed) ? Math.max(0, parsed) : 0
    setTuBoxOverrides((prev) => ({ ...prev, [editingTuBoxKey]: value }))
    setEditingTuBoxKey(null)
    setEditingTuBoxValue('')
  }

  const cancelTuBoxEdit = () => {
    setEditingTuBoxKey(null)
    setEditingTuBoxValue('')
  }

  const toggleLocationSelection = (id) => {
    setSelectedLocationIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAllLocationsSelection = () => {
    const allIds = filteredLocations.map((loc) => loc.id)
    const allSelected = allIds.length > 0 && allIds.every((id) => selectedLocationIds.has(id))
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
  const showExplorerProductLink = EXPLORER_PRODUCTS.some((p) => p.name === product.name)

  const handleEditProductOnExplorer = () => {
    setExplorerProductNameFilters([product.name])
    setActiveTab('explorer')
  }

  const summaryStock = useMemo(
    () =>
      filteredLocations.reduce(
        (acc, loc) => {
          const [before, after] = loc.stock.split(' → ').map(Number)
          return { before: acc.before + (before || 0), after: acc.after + (after || 0) }
        },
        { before: 0, after: 0 }
      ),
    [filteredLocations]
  )
  const summaryTU = useMemo(
    () =>
      filteredLocations.reduce(
        (acc, loc) => {
          const [before, after] = loc.tu.split(' → ').map(Number)
          return { before: acc.before + (before || 0), after: acc.after + (after || 0) }
        },
        { before: 0, after: 0 }
      ),
    [filteredLocations]
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 min-w-0">
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
        <div className="flex items-center gap-3 shrink-0">
          <StatusDropdown
            rowId={`drilldown-product-${product.id}`}
            value={productStatusOverrides[product.id] ?? getRowStatus(product)}
            userName={product.approvedByUser || product.editedByUser}
            onChange={(statusId) =>
              setProductStatusOverrides((prev) => ({ ...prev, [product.id]: statusId }))
            }
          />
          {showExplorerProductLink && (
            <button
              type="button"
              onClick={handleEditProductOnExplorer}
              className="text-[13px] font-medium text-[#0267ff] hover:underline shrink-0"
            >
              Edit product on the Explorer tab
            </button>
          )}
        </div>
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
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setDrilldownFiltersOpen((o) => !o)}
            className="h-12 w-12 flex items-center justify-center rounded-[4px] border border-[#E9EAEB] bg-white hover:bg-white shrink-0 relative"
            aria-label="Filter"
          >
            <IconFilterFunnel />
            {drilldownTripTypeFilters.length > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#0267ff] text-white text-[11px] font-medium leading-none">
                {drilldownTripTypeFilters.length}
              </span>
            )}
          </button>
          {drilldownFiltersOpen && (
            <>
              <div
                className="fixed inset-0 z-[60]"
                aria-hidden
                onClick={() => setDrilldownFiltersOpen(false)}
              />
              <div className="absolute left-0 top-full mt-1 z-[70] min-w-[220px] rounded-[6px] border border-[#e5e7eb] bg-white py-2 px-3 shadow-lg">
                <div>
                  <div className="text-[12px] font-medium uppercase tracking-[0.04em] text-[#4b535c] mb-2">
                    Trip type
                  </div>
                  {MOVEMENT_TYPE_FILTER_OPTIONS.map((opt) => (
                    <label
                      key={opt.id}
                      className="flex items-center gap-2 px-0 py-1.5 hover:bg-[#f3f4f6] cursor-pointer rounded-[4px]"
                    >
                      <input
                        type="checkbox"
                        checked={drilldownTripTypeFilters.includes(opt.id)}
                        onChange={(e) => {
                          setDrilldownTripTypeFilters((prev) =>
                            e.target.checked
                              ? [...prev, opt.id]
                              : prev.filter((x) => x !== opt.id)
                          )
                        }}
                        className="size-4 rounded border-[#d1d5db] text-[#0267ff]"
                      />
                      <span className="text-[14px] text-[#0a0a0a]">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        <button type="button" className="h-12 w-12 flex items-center justify-center rounded-[4px] border border-[#E9EAEB] bg-white hover:bg-white shrink-0" aria-label="Column settings">
          <IconColumnSettings />
        </button>
      </div>

      {drilldownTripTypeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {drilldownTripTypeFilters.map((id) => {
            const label = MOVEMENT_TYPE_FILTER_OPTIONS.find((o) => o.id === id)?.label ?? id
            return (
              <span
                key={`trip-type-${id}`}
                className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-[4px] bg-[#f3f4f6] text-[#4b535c] border border-[#e5e7eb]"
              >
                <span>Trip type: {label}</span>
                <button
                  type="button"
                  onClick={() =>
                    setDrilldownTripTypeFilters((prev) => prev.filter((x) => x !== id))
                  }
                  className="p-0.5 rounded-[4px] text-[#6b7280] hover:bg-[#e5e7eb] hover:text-[#374151]"
                  aria-label={`Remove filter: Trip type ${label}`}
                >
                  <IconClose className="size-3.5" />
                </button>
              </span>
            )
          })}
        </div>
      )}

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
                  checked={
                    filteredLocations.length > 0 &&
                    filteredLocations.every((loc) => selectedLocationIds.has(loc.id))
                  }
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
            {filteredLocations.map((loc) => (
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
                      {showRebalancing &&
                        loc.tuTruck?.map((n, i) => {
                        const key = tuBoxKey(loc.id, 'truck', i)
                        const effectiveValue = getEffectiveTuBoxValue(key, n)
                        return (
                          <EditableTuTransferBadge
                            key={key}
                            value={effectiveValue}
                            isEditing={editingTuBoxKey === key}
                            editingValue={editingTuBoxValue}
                            onStartEdit={() => startEditTuBox(key, effectiveValue)}
                            onEditingValueChange={setEditingTuBoxValue}
                            onCommit={commitTuBoxEdit}
                            onCancel={cancelTuBoxEdit}
                            bgClassName="bg-[#0267FF]"
                            icon={<IconTruckTu />}
                            hoverPanel={
                              <TuTruckTransferHoverCard
                                trip={trip}
                                loc={loc}
                                truckUnits={effectiveValue}
                                borderClassName="border-[#0267FF]"
                              />
                            }
                          />
                        )
                      })}
                      {showReplenishment &&
                        loc.tuReplen?.map((n, i) => {
                        const key = tuBoxKey(loc.id, 'replen', i)
                        const effectiveValue = getEffectiveTuBoxValue(key, n)
                        return (
                          <EditableTuTransferBadge
                            key={key}
                            value={effectiveValue}
                            isEditing={editingTuBoxKey === key}
                            editingValue={editingTuBoxValue}
                            onStartEdit={() => startEditTuBox(key, effectiveValue)}
                            onEditingValueChange={setEditingTuBoxValue}
                            onCommit={commitTuBoxEdit}
                            onCancel={cancelTuBoxEdit}
                            bgClassName="bg-[#EC4899]"
                            icon={<IconReplenishment />}
                            hoverPanel={
                              <TuTruckTransferHoverCard
                                trip={trip}
                                loc={loc}
                                truckUnits={effectiveValue}
                                borderClassName="border-[#EC4899]"
                              />
                            }
                          />
                        )
                      })}
                      {showRebalancing &&
                        loc.tuWarehouse == null &&
                        !loc.tuTruck?.length && (
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

function ProductsDrilldown({
  trip,
  onBack,
  showBackButton = true,
  onDrawerFiltersActiveChange,
  setExplorerProductNameFilters,
  setActiveTab }) {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productStatusOverrides, setProductStatusOverrides] = useState({})
  const [productTransfersOverrides, setProductTransfersOverrides] = useState({})
  const [editingTransfersProductId, setEditingTransfersProductId] = useState(null)
  const [editingTransfersValue, setEditingTransfersValue] = useState('')
  const [selectedProductIds, setSelectedProductIds] = useState(new Set())
  const [statusFilters, setStatusFilters] = useState([])
  const [filtersDropdownOpen, setFiltersDropdownOpen] = useState(false)
  const [productsActiveQuickFilter, setProductsActiveQuickFilter] = useState(null)
  const [bulkChangeStatusOpen, setBulkChangeStatusOpen] = useState(false)
  const [bulkChangeUnitsOpen, setBulkChangeUnitsOpen] = useState(false)
  const [productColumnOrder, setProductColumnOrder] = useState(
    () => [...PRODUCTS_TABLE_DEFAULT_COLUMN_ORDER]
  )
  const [hoveredTransferProductId, setHoveredTransferProductId] = useState(null)
  const [replenTransferOverrides, setReplenTransferOverrides] = useState({})

  useEffect(() => {
    onDrawerFiltersActiveChange?.(statusFilters.length > 0)
  }, [statusFilters, onDrawerFiltersActiveChange])

  const baseProducts = PRODUCTS_BY_TRIP[trip.id] || DEFAULT_PRODUCTS
  const transferApprovalTotals = baseProducts.reduce(
    (acc, p) => ({
      transfers: acc.transfers + (p.transfers ?? 0),
      approved: acc.approved + (p.approvedTransfers ?? 0),
      unapproved: acc.unapproved + (p.unapprovedTransfers ?? 0) }),
    { transfers: 0, approved: 0, unapproved: 0 }
  )
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

  const handleBulkUndoEditsProducts = () => {
    if (!selectedProductIds.size) return

    const eligibleIds = []
    selectedProductIds.forEach((id) => {
      const p = baseProducts.find((row) => row.id === id)
      const hasReplenSplit = p != null && p.replenTransfers != null && p.rebalTransfers != null
      const hasOverride = Object.prototype.hasOwnProperty.call(replenTransferOverrides, id)
      if (hasReplenSplit || hasOverride) eligibleIds.push(id)
    })

    if (eligibleIds.length > 0) {
      setReplenTransferOverrides((prev) => {
        const next = { ...prev }
        eligibleIds.forEach((id) => {
          delete next[id]
        })
        return next
      })
      setProductStatusOverrides((prev) => {
        const next = { ...prev }
        eligibleIds.forEach((id) => {
          delete next[id]
        })
        return next
      })
    }

    setBulkChangeUnitsOpen(false)
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
      setProductColumnOrder([...PRODUCTS_TABLE_DEFAULT_COLUMN_ORDER])
    }
  }, [productColumnOrder])

  if (selectedProduct) {
    return (
      <StockAnalysisDrilldown
        product={selectedProduct}
        trip={trip}
        onBack={() => setSelectedProduct(null)}
        setExplorerProductNameFilters={setExplorerProductNameFilters}
        setActiveTab={setActiveTab}
        productStatusOverrides={productStatusOverrides}
        setProductStatusOverrides={setProductStatusOverrides}
      />
    )
  }
  const breadcrumbFrom = `${trip.from} [${trip.fromCode}]`
  const breadcrumbTo = trip.to.length > 12 ? `${trip.to.slice(0, 10)}...` : trip.to
  const productSummary = PRODUCTS_TAB_SUMMARY_TOTALS

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
    onDrop: (e) => onProductColDrop(visualIdx, e) })

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
            className={`${productThPin(isFirst, isLast)}h-[62px] min-h-[62px] text-left px-4 align-middle font-medium text-[#00050A] min-w-[140px] box-border`}
            {...d}
          >
            <span className="inline-flex min-w-0 items-center gap-2">
              {grip}
              Movement type
            </span>
          </th>
        )
      case 2:
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
      case 3:
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
      case 4:
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
                title="Based on historical forecast accuracy at the product level. Lower confidence means recommendations carry more uncertainty."
              >
                Confidence <IconInfo />
              </span>
            </span>
          </th>
        )

      case 6:
        return (
          <th
            key={logicalIdx}
            className={`${productThPin(isFirst, isLast)}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[120px] box-border`}
            {...d}
          >
            <span className="inline-flex w-full min-w-0 items-center justify-end gap-2">
              {grip}
              <span
                className="inline-flex items-center gap-1 cursor-help"
                title="How well current stock is meeting forecasted demand. 'X% below target' means stock is short of target; 'All SKUs in target' means coverage is on track."
              >
                Coverage <IconInfo />
              </span>
            </span>
          </th>
        )

      case 7:
        return (
          <th
            key={logicalIdx}
            className={`${productThPin(isFirst, isLast)}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[120px] box-border`}
            {...d}
          >
            <span className="inline-flex w-full min-w-0 items-center justify-end gap-2">
              {grip}
              <span className="flex flex-col items-end justify-center gap-0.5 leading-tight">
                <span
                  className="inline-flex items-center gap-1 cursor-help"
                  title="The next scheduled inventory event for this product across all locations in scope"
                >
                  Next event <IconInfo />
                </span>
                <span className="text-[11px] font-normal text-[#4b535c]">Submission deadline</span>
              </span>
            </span>
          </th>
        )
      case 8:
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
      case 9:
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
      case 10:
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
      case 11:
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
      case 12:
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
      case 13:
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
      case 14:
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
      case 15:
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
      case 16:
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
      case 17:
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
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a]`}>
            {productSummary.productDetails}
          </th>
        )
      case 1:
        return <th key={logicalIdx} className={`${pin}py-2 px-4`} />
      case 2:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            <div className="flex flex-col items-end">
              <span>{transferApprovalTotals.transfers}</span>
              <span className="text-[12px] font-medium text-[#166534]">
                {transferApprovalTotals.approved} approved
              </span>
              {transferApprovalTotals.unapproved > 0 && (
                <span className="text-[12px] font-medium text-[#4b535c]">
                  {transferApprovalTotals.unapproved} unapproved
                </span>
              )}
            </div>
          </th>
        )
      case 3:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            {productSummary.revenue}
          </th>
        )
      case 4:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            <div className="flex flex-col items-end">
              <span>{productSummary.recommendedUnits}</span>
              <span className="text-[12px] text-[#4b535c]">{productSummary.recommendedTrips}</span>
            </div>
          </th>
        )
      case 5:
        return <th key={logicalIdx} className={`${pin}py-2 px-4 text-right`} />

      case 6:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] text-[#4b535c] text-right`}>
            —
          </th>
        )
      case 7:
        return <th key={logicalIdx} className={`${pin}py-2 px-4 text-right`} />
      case 8:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            <div className="flex flex-col items-end">
              <span>{productSummary.stockUnits}</span>
              <span className="text-[12px] text-[#4b535c]">{productSummary.stockInTransit}</span>
            </div>
          </th>
        )
      case 9:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            <div className="flex flex-col items-end">
              <span>{productSummary.warehouseAllocate}</span>
              <span className="text-[12px] text-[#4b535c]">{productSummary.warehouseSell}</span>
            </div>
          </th>
        )
      case 10:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            <div className="flex flex-col items-end">
              <span>{productSummary.salesL7}</span>
              <span className="text-[12px] text-[#4b535c]">{productSummary.salesL30}</span>
            </div>
          </th>
        )
      case 11:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            {productSummary.forecast}
          </th>
        )
      case 12:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            {productSummary.stockouts}
          </th>
        )
      case 13:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            {productSummary.locations}
          </th>
        )
      case 14:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            {productSummary.overstocks}
          </th>
        )
      case 15:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            {productSummary.understocks}
          </th>
        )
      case 16:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            {productSummary.depth}
          </th>
        )
      case 17:
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
          <td key={logicalIdx} className={`${pin}py-3 px-4 align-top`}>
            <MovementTypePills movementType={p.movementType} />
          </td>
        )
      case 2: {
        const transferSubLines = (
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[14px] text-[#0a0a0a]">{p.transfers}</span>
            <span className="text-[12px] font-medium text-[#166534]">{p.approvedTransfers} approved</span>
            {p.unapprovedTransfers > 0 && (
              <span className="text-[12px] font-medium text-[#4b535c]">{p.unapprovedTransfers} unapproved</span>
            )}
          </div>
        )
        const hasTransferSplit = p.replenTransfers != null && p.rebalTransfers != null
        if (!hasTransferSplit) {
          return (
            <td key={logicalIdx} className={`${pin}py-3 px-4 text-right align-top`} onClick={(e) => e.stopPropagation()}>
              {transferSubLines}
            </td>
          )
        }
        return (
          <td
            key={logicalIdx}
            className={`${pin}py-3 px-4 text-right align-top relative`}
            onMouseEnter={() => setHoveredTransferProductId(p.id)}
            onMouseLeave={() => setHoveredTransferProductId(null)}
            onClick={(e) => e.stopPropagation()}
          >
            {transferSubLines}
            {hoveredTransferProductId === p.id && (
              <div className="absolute bottom-full mb-1 left-0 z-50 bg-white border border-[#e5e7eb] rounded-[6px] shadow-md p-3 min-w-[200px]">
                <div className="text-[12px] font-medium text-[#0a0a0a] mb-2">Transfer split</div>
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className="text-[12px] text-[#4b535c]">Rebalancing</span>
                  <span className="text-[12px] text-[#0a0a0a] font-medium">{p.rebalTransfers}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[12px] text-[#4b535c]">Replenishment</span>
                  <input
                    type="number"
                    min="0"
                    value={replenTransferOverrides[p.id] ?? p.replenTransfers}
                    onChange={(e) => {
                      const next = e.target.value === '' ? '' : Number(e.target.value)
                      setReplenTransferOverrides((prev) => ({ ...prev, [p.id]: next }))
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-16 h-7 px-2 rounded-[4px] border border-[#e9eaeb] text-[12px] text-[#0a0a0a] text-right"
                  />
                </div>
                <p className="text-[11px] text-[#4b535c] italic mt-2">
                  Rebalancing quantity is set by the solver and cannot be edited at this level.
                </p>
              </div>
            )}
          </td>
        )
      }
      case 3:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0 w-full text-right">{p.revenue}</div>
          </td>
        )
      case 4:
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
      case 5:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right align-top`}>
            <div className="flex justify-end">
              <ConfidencePill value={p.confidence} />
            </div>
          </td>
        )

      case 6:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right align-top`}>
            <div className="flex justify-end line-clamp-2 min-w-0">
              <ProductCoverageText
                coverageWeeks={p.coverageWeeks}
                coverageTarget={p.coverageTarget}
                coverage={p.coverage}
              />
            </div>
          </td>
        )
      case 7:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right align-top`}>
            <div className="flex justify-end line-clamp-2 min-w-0">
              <ProductNextEventCell nextEvent={p.nextEvent} />
            </div>
          </td>
        )
      case 8:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right align-top`}>
            <div className="flex flex-col items-end line-clamp-2 min-w-0">
              <span className="text-[#0a0a0a]">{p.currentUnits ?? '—'}</span>
              <span className="text-[12px] text-[#4b535c]">{p.currentUnitsInTransit ?? 0}</span>
            </div>
          </td>
        )
      case 9:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right align-top`}>
            <div className="flex flex-col items-end line-clamp-2 min-w-0">
              <span className="text-[#0a0a0a]">{p.warehouseAllocateLine ?? '—'}</span>
              <span className="text-[12px] text-[#4b535c]">{p.warehouseSellLine ?? '—'}</span>
            </div>
          </td>
        )
      case 10:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right align-top`}>
            <div className="flex flex-col items-end line-clamp-2 min-w-0">
              <span className="text-[#0a0a0a]">{p.salesL7}</span>
              <span className="text-[12px] text-[#4b535c]">{p.salesL30}</span>
            </div>
          </td>
        )
      case 11:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0 w-full text-right">{p.forecast}</div>
          </td>
        )
      case 12:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0 w-full text-right">{p.stockouts}</div>
          </td>
        )
      case 13:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0 w-full text-right">{p.locations}</div>
          </td>
        )
      case 14:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0 w-full text-right">{p.overstocks}</div>
          </td>
        )
      case 15:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0 w-full text-right">{p.understocks}</div>
          </td>
        )
      case 16:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0 w-full text-right">{p.depth}</div>
          </td>
        )
      case 17:
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
        <div className="flex flex-wrap items-center gap-2 min-w-0">
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
          <div className="relative shrink-0">
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
          <div className="flex min-w-0 flex-1 items-center overflow-x-auto">
            <ScheduleQuickFilterChips
              chips={PRODUCTS_QUICK_FILTER_CHIPS}
              activeId={productsActiveQuickFilter}
              onChange={setProductsActiveQuickFilter}
            />
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
              onClick={() => {
                setBulkChangeUnitsOpen(false)
                setBulkChangeStatusOpen((o) => !o)
              }}
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
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setBulkChangeStatusOpen(false)
                setBulkChangeUnitsOpen((o) => !o)
              }}
              className="px-4 py-2 rounded-[4px] text-[14px] font-medium text-white hover:bg-white/10"
            >
              Change units
            </button>
            {bulkChangeUnitsOpen && (
              <>
                <div className="fixed inset-0 z-[60]" aria-hidden onClick={() => setBulkChangeUnitsOpen(false)} />
                <div
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-[70] min-w-[180px] rounded-[6px] border border-[#e5e7eb] bg-white py-1 shadow-lg"
                  style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                >
                  <button
                    type="button"
                    onClick={handleBulkUndoEditsProducts}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-[13px] font-medium text-[#0a0a0a] hover:bg-[#f3f4f6]"
                  >
                    Undo edits
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function LocationsTab({ onDrawerFiltersActiveChange }) {
  const [selectedLocationIds, setSelectedLocationIds] = useState(new Set())
  const [locationStatusOverrides, setLocationStatusOverrides] = useState({})
  const [statusFilters, setStatusFilters] = useState([])
  const [filtersDropdownOpen, setFiltersDropdownOpen] = useState(false)

  useEffect(() => {
    onDrawerFiltersActiveChange?.(statusFilters.length > 0)
  }, [statusFilters, onDrawerFiltersActiveChange])

  const baseLocations = LOCATIONS_TABLE_DATA
  const locations = (() => {
    let list = baseLocations
    if (statusFilters.length > 0) {
      list = list.filter((loc) => {
        const rowStatus = locationStatusOverrides[loc.id] ?? getRowStatus(loc)
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
  /** Status (logical col 13) only pins to the right when it is the trailing column after reorder. */
  const locationStatusColumnIsTrailing = locationColumnOrder[locationColumnOrder.length - 1] === 13

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
  const locStatusThPin = (logicalIdx) =>
    logicalIdx === 13 && locationStatusColumnIsTrailing
      ? 'sticky right-0 z-30 border-l border-[#e5e7eb] shadow-[-4px_0_12px_-6px_rgba(15,23,42,0.12)] bg-white '
      : ''
  const locTdPin = (isFirst) =>
    isFirst
      ? 'sticky left-14 z-10 border-r border-[#e5e7eb] shadow-[4px_0_8px_rgba(0,0,0,0.04)] bg-white group-hover:bg-[#f9fafb] '
      : ''
  const locStatusTdPin = (logicalIdx) =>
    logicalIdx === 13 && locationStatusColumnIsTrailing
      ? 'sticky right-0 z-20 border-l border-[#e5e7eb] shadow-[-4px_0_12px_-6px_rgba(15,23,42,0.12)] bg-white group-hover:bg-[#f9fafb] '
      : ''

  const locationDropProps = (visualIdx) => ({
    onDragEnter: onLocationColDragEnter,
    onDragOver: onLocationColDragOver,
    onDrop: (e) => onLocationColDrop(visualIdx, e) })

  function renderLocationsHeaderCell(logicalIdx, visualIdx) {
    const isFirst = visualIdx === 0
    const thPin = `${locThPin(isFirst)}${locStatusThPin(logicalIdx)}`
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
            className={`${thPin}h-[62px] min-h-[62px] text-left px-4 align-middle font-medium text-[#00050A] min-w-[180px] box-border`}
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
            className={`${thPin}h-[62px] min-h-[62px] text-left px-4 align-middle font-medium text-[#00050A] min-w-[140px] box-border`}
            {...d}
          >
            <span className="inline-flex min-w-0 items-center gap-2">
              {grip}
              Movement type
            </span>
          </th>
        )
      case 2:
        return (
          <th
            key={logicalIdx}
            className={`${thPin}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[90px] box-border`}
            {...d}
          >
            {rowEnd('Transfers in')}
          </th>
        )
      case 3:
        return (
          <th
            key={logicalIdx}
            className={`${thPin}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[90px] box-border`}
            {...d}
          >
            {rowEnd('Transfers out')}
          </th>
        )
      case 4:
        return (
          <th
            key={logicalIdx}
            className={`${thPin}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[100px] box-border`}
            {...d}
          >
            {rowEnd(
              <span className="inline-flex items-center gap-1">
                Revenue increase <IconInfo /> <IconSortDown />
              </span>
            )}
          </th>
        )
      case 5:
        return (
          <th
            key={logicalIdx}
            className={`${thPin}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[100px] box-border`}
            {...d}
          >
            {rowEnd(
              <span className="inline-flex items-center gap-1">Recommended transfers in <IconInfo /></span>
            )}
          </th>
        )
      case 6:
        return (
          <th
            key={logicalIdx}
            className={`${thPin}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[100px] box-border`}
            {...d}
          >
            {rowEnd(
              <span className="inline-flex items-center gap-1">Recommended transfers out <IconInfo /></span>
            )}
          </th>
        )

      case 7:
        return (
          <th
            key={logicalIdx}
            className={`${thPin}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[100px] box-border`}
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
            className={`${thPin}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[70px] box-border`}
            {...d}
          >
            {rowEnd('Sales')}
          </th>
        )
      case 9:
        return (
          <th
            key={logicalIdx}
            className={`${thPin}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[90px] box-border`}
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
            className={`${thPin}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[80px] box-border`}
            {...d}
          >
            {rowEnd('Stockouts')}
          </th>
        )
      case 11:
        return (
          <th
            key={logicalIdx}
            className={`${thPin}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[80px] box-border`}
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
            className={`${thPin}h-[62px] min-h-[62px] text-right px-4 align-middle font-medium text-[#00050A] min-w-[80px] box-border`}
            {...d}
          >
            {rowEnd(
              <span className="inline-flex items-center gap-1">Understocks <IconInfo /></span>
            )}
          </th>
        )
      case 13:
        return (
          <th
            key={logicalIdx}
            className={`${thPin}h-[62px] min-h-[62px] px-4 font-medium text-[#00050A] text-right align-middle box-border`}
            {...d}
          >
            {rowEnd('Status')}
          </th>
        )
      default:
        return null
    }
  }

  function renderLocationsSummaryCell(logicalIdx, visualIdx) {
    const isFirst = visualIdx === 0
    const pin = `${locThPin(isFirst)}${locStatusThPin(logicalIdx)}`
    switch (logicalIdx) {
      case 0:
        return <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-normal text-[#4b535c]`} />
      case 1:
        return <th key={logicalIdx} className={`${pin}py-2 px-4`} />
      case 2:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            <div className="flex flex-col items-end">
              <span>477 units</span>
              <span className="text-[12px] text-[#4b535c]">32 trips</span>
            </div>
          </th>
        )
      case 3:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            <div className="flex flex-col items-end">
              <span>477 units</span>
              <span className="text-[12px] text-[#4b535c]">35 trips</span>
            </div>
          </th>
        )
      case 4:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            €50.4K
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
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            477 units
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
      case 13:
        return <th key={logicalIdx} className={`${pin}py-2 px-4 text-right`} />
      default:
        return null
    }
  }

  function renderLocationsBodyCell(logicalIdx, visualIdx, loc) {
    const isFirst = visualIdx === 0
    const pin = `${locTdPin(isFirst)}${locStatusTdPin(logicalIdx)}`
    const rowStatus = locationStatusOverrides[loc.id] ?? getRowStatus(loc)
    const userName = loc.approvedByUser || loc.editedByUser
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
          <td key={logicalIdx} className={`${pin}py-3 px-4 align-top`}>
            <MovementTypePills movementType={loc.movementType} />
          </td>
        )
      case 2:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right align-top`}>
            <div className="flex flex-col items-end line-clamp-2 min-w-0">
              <span className="text-[#0a0a0a]">{loc.transfersIn}</span>
              <span className="text-[12px] text-[#4b535c]">{loc.transfersInSub}</span>
            </div>
          </td>
        )
      case 3:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right align-top`}>
            <div className="flex flex-col items-end line-clamp-2 min-w-0">
              <span className="text-[#0a0a0a]">{loc.transfersOut}</span>
              <span className="text-[12px] text-[#4b535c]">{loc.transfersOutSub}</span>
            </div>
          </td>
        )
      case 4:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0">{loc.revenueIncrease}</div>
          </td>
        )
      case 5:
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
      case 6:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0">{loc.recommendedOut}</div>
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
      case 13:
        return (
          <td
            key={logicalIdx}
            className={`${pin}py-3 px-4 min-w-0 align-top text-right`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <StatusDropdown
                rowId={`location-${loc.id}`}
                value={rowStatus}
                userName={userName}
                useShortEditedLabel
                onChange={(statusId) =>
                  setLocationStatusOverrides((prev) => ({ ...prev, [loc.id]: statusId }))
                }
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
      <div className="flex flex-wrap items-center gap-2 min-w-0">
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
        <div className="relative shrink-0">
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

function parseExplorerRevenueK(revenueStr) {
  const match = revenueStr.match(/€([\d.]+)K/)
  return match ? parseFloat(match[1], 10) : 0
}

function renderExplorerColumnHeaderLabel(col) {
  const showIcon = 'tooltip' in col
  const labelContent = showIcon ? (
    col.tooltip === null ? (
      <span className="inline-flex items-center gap-1">
        {col.label} <IconInfo />
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 cursor-help" title={col.tooltip}>
        {col.label} <IconInfo />
      </span>
    )
  ) : (
    col.label
  )

  if (col.subtitle) {
    return (
      <span
        className={`flex flex-col justify-center gap-0.5 leading-tight ${
          col.alignment === 'right' ? 'items-end' : 'items-start'
        }`}
      >
        {labelContent}
        <span className="text-[11px] font-normal text-[#4b535c]">{col.subtitle}</span>
      </span>
    )
  }

  return labelContent
}

const EXPLORER_TABLE_COLUMNS = [
  { id: 'productDetails', label: 'SKU details', alignment: 'left', minWidth: 'min-w-[260px]' },
  { id: 'fromLocation', label: 'From location', alignment: 'left', minWidth: 'min-w-[150px]' },
  { id: 'toLocation', label: 'To location', alignment: 'left', minWidth: 'min-w-[150px]' },
  { id: 'movementType', label: 'Movement type', alignment: 'left', minWidth: 'min-w-[100px]' },
  {
    id: 'confidence',
    label: 'Confidence',
    alignment: 'right',
    minWidth: 'min-w-[110px]',
    tooltip:
      'Based on historical forecast accuracy at the product level. Lower confidence means recommendations carry more uncertainty.',
  },
  { id: 'transfers', label: 'Transfers', alignment: 'right', minWidth: 'min-w-[110px]' },
  { id: 'revenue', label: 'Revenue increase', alignment: 'right', minWidth: 'min-w-[110px]', tooltip: null },
  {
    id: 'recommended',
    label: 'Recommended transfers',
    alignment: 'right',
    minWidth: 'min-w-[140px]',
    tooltip: null,
  },
  {
    id: 'serviceLevel',
    label: 'Service level',
    alignment: 'right',
    minWidth: 'min-w-[160px]',
    tooltip:
      'The probability of selling / value of the last unit of stock at the receiving location, after this proposal is applied.',
  },
  {
    id: 'coverage',
    label: 'Coverage (receiving)',
    alignment: 'right',
    minWidth: 'min-w-[120px]',
    tooltip: 'How well current stock at the receiving location is meeting forecasted demand, before and after this proposal.',
  },
  {
    id: 'nextEvent',
    label: 'Next inventory event',
    alignment: 'right',
    minWidth: 'min-w-[130px]',
    subtitle: 'Creation date',
    tooltip: 'The next scheduled inventory event for this product across all locations in scope',
  },
  { id: 'sales', label: 'Sales', alignment: 'right', minWidth: 'min-w-[120px]', subtitle: 'L7D / L30D' },
  { id: 'forecast', label: 'Forecast', alignment: 'right', minWidth: 'min-w-[100px]', subtitle: 'per wk', tooltip: null },
  {
    id: 'stockInCirculation',
    label: 'Stock in circulation (receiving)',
    alignment: 'right',
    minWidth: 'min-w-[160px]',
    tooltip: 'on-hand + pending from production + in transit',
  },
  {
    id: 'warehouseUnits',
    label: 'Warehouse units',
    alignment: 'right',
    minWidth: 'min-w-[140px]',
    tooltip: 'Units reserved to sell at this location and units available to allocate to stores',
  },
  {
    id: 'initialAllocation',
    label: 'Initial allocation',
    alignment: 'right',
    minWidth: 'min-w-[100px]',
  },
  {
    id: 'firstStockDate',
    label: 'First stock date',
    alignment: 'right',
    minWidth: 'min-w-[120px]',
    tooltip: 'Date stock was first received at the receiving location',
  },
  {
    id: 'firstSalesDate',
    label: 'First sales date',
    alignment: 'right',
    minWidth: 'min-w-[120px]',
    tooltip: 'Date stock was first sold at the receiving location',
  },
  { id: 'status', label: 'Status', alignment: 'right', minWidth: 'min-w-[150px]' },
]

const EXPLORER_STATUS_FILTER_OPTIONS = [
  { id: 'approved', label: 'Approved' },
  { id: 'unapproved', label: 'Unapproved' },
  { id: 'needs_review', label: 'Needs review' },
  { id: 'edited', label: 'Edited' },
]

const EXPLORER_STATUS_FILTER_LABELS = {
  approved: 'Approved',
  unapproved: 'Unapproved',
  needs_review: 'Needs review',
  edited: 'Edited' }

function filterExplorerRows(
  rows,
  {
    departmentFilters,
    productNameFilters,
    movementTypeFilters,
    confidenceFilters,
    statusFilters,
    statusOverrides = {} }
) {
  return rows.filter((row) => {
    if (departmentFilters.length > 0 && !departmentFilters.includes(row.department)) {
      return false
    }
    if (productNameFilters.length > 0 && !productNameFilters.includes(row.productName)) {
      return false
    }
    if (movementTypeFilters.length > 0 && !movementTypeFilters.includes(row.movementType)) {
      return false
    }
    if (confidenceFilters.length > 0 && !confidenceFilters.includes(row.confidence)) {
      return false
    }
    if (statusFilters.length > 0) {
      const rowStatus = statusOverrides[row.id] ?? getRowStatus(row)
      const statusMatch = statusFilters.some((f) => {
        if (f === 'approved') return rowStatus === 'approved_by_system' || rowStatus === 'approved_by_user'
        if (f === 'unapproved') return rowStatus === 'unapproved'
        if (f === 'needs_review') return rowStatus === 'needs_review_from_user'
        if (f === 'edited') return rowStatus === 'last_edited_by_user'
        return false
      })
      if (!statusMatch) return false
    }
    return true
  })
}

const EXPLORER_TABLE_COLUMN_COUNT = EXPLORER_TABLE_COLUMNS.length
const EXPLORER_TABLE_TOTAL_COLUMN_COUNT = EXPLORER_TABLE_COLUMN_COUNT + 1

function ExplorerTransfersInput({ value, onChange }) {
  return (
    <input
      type="number"
      min={0}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      className="w-16 h-7 px-2 rounded-[4px] border border-[#e9eaeb] text-[14px] text-[#0a0a0a] text-right focus:outline-none"
    />
  )
}

function renderExplorerBodyCell(row, col, {
  explorerTdClass,
  explorerStatusTdClass,
  getEffectiveStatus,
  handleExplorerStatusChange,
  getEffectiveTransfers,
  handleTransfersEdit }) {
  const alignClass = col.alignment === 'right' ? 'text-right' : ''

  switch (col.id) {
    case 'productDetails':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth}`}>
          <TuHoverPopover panel={<SkuDetailsHoverCard row={row} />}>
            <div className="flex min-w-0 items-start gap-4">
              <div className="h-12 w-12 shrink-0 rounded-[4px] bg-[#f3f4f6]" />
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[14px] font-medium text-[#0a0a0a]">{row.productName}</span>
                <span className="text-[12px] text-[#4b535c]">{row.sku}</span>
                <span className="text-[12px] text-[#4b535c]">{row.colour}</span>
              </div>
            </div>
          </TuHoverPopover>
        </td>
      )
    case 'fromLocation':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} text-[#0a0a0a]`}>
          {row.fromLocation}
        </td>
      )
    case 'toLocation':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} text-[#0a0a0a]`}>
          {row.toLocation}
        </td>
      )
    case 'movementType':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth}`}>
          <MovementTypePills movementType={[row.movementType]} />
        </td>
      )
    case 'transfers': {
      const effectiveTransfers = getEffectiveTransfers(row)
      const availableToSend = row.availableToSend ?? 0
      const availableConstrained = availableToSend < effectiveTransfers
      return (
        <td
          key={col.id}
          className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-end gap-0.5">
            <ExplorerTransfersInput
              value={effectiveTransfers}
              onChange={(newValue) => handleTransfersEdit(row.id, newValue)}
            />
            <span
              className={`text-[12px] ${
                availableConstrained ? 'text-[#B45309]' : 'text-[#166534]'
              }`}
            >
              {availableToSend} available to send
            </span>
          </div>
        </td>
      )
    }
    case 'revenue':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}>
          <span className="text-[14px] text-[#0a0a0a]">{row.revenue}</span>
        </td>
      )
    case 'recommended':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}>
          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex flex-wrap items-center justify-end gap-1 text-[14px] text-[#0a0a0a]">
              {row.recommended}
              {row.recommendedBadges?.map((badge) => (
                <span
                  key={badge}
                  className="bg-[#f8f8f8] text-[11px] font-medium text-[#0267ff] px-1.5 py-0.5 rounded"
                >
                  {badge}
                </span>
              ))}
            </span>
            {row.recommendedSub != null && (
              <span className="text-[12px] text-[#4b535c]">{row.recommendedSub}</span>
            )}
          </div>
        </td>
      )
    case 'confidence':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}>
          <div className="flex justify-end">
            <ConfidencePill value={row.confidence} />
          </div>
        </td>
      )
    case 'serviceLevel':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}>
          <span className="text-[14px] text-[#0a0a0a]">{row.serviceLevel}</span>
        </td>
      )
    case 'coverage':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}>
          <span className="text-[14px] text-[#0a0a0a]">
            {row.coverageWeeksBefore} → {row.coverageWeeksAfter} wks
          </span>
        </td>
      )
    case 'nextEvent':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}>
          <ProductNextEventCell nextEvent={row.nextEvent} />
        </td>
      )
    case 'sales':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[14px] text-[#0a0a0a]">{row.salesL7}</span>
            <span className="text-[12px] text-[#4b535c]">{row.salesL30}</span>
          </div>
        </td>
      )
    case 'forecast':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}>
          <span className="text-[14px] text-[#0a0a0a]">{row.forecast}</span>
        </td>
      )
    case 'stockInCirculation':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[14px] text-[#0a0a0a]">{row.currentUnits} units</span>
            <span className="text-[12px] text-[#4b535c]">{row.currentUnitsInTransit} in transit</span>
          </div>
        </td>
      )
    case 'warehouseUnits':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[14px] text-[#0a0a0a]">{row.warehouseAllocateLine}</span>
            <span className="text-[12px] text-[#4b535c]">{row.warehouseSellLine}</span>
          </div>
        </td>
      )
    case 'initialAllocation':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}>
          <span className="text-[14px] text-[#0a0a0a]">{row.initialAllocation} units</span>
        </td>
      )
    case 'firstStockDate':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}>
          <span className="text-[14px] text-[#0a0a0a]">{row.firstStockDate}</span>
        </td>
      )
    case 'firstSalesDate':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}>
          <span className="text-[14px] text-[#0a0a0a]">{row.firstSalesDate ?? '—'}</span>
        </td>
      )
    case 'status':
      return (
        <td
          key={col.id}
          className={`${explorerStatusTdClass} ${col.minWidth}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-end">
            <StatusDropdown
              rowId={`explorer-${row.id}`}
              value={getEffectiveStatus(row)}
              userName={row.approvedByUser || row.editedByUser}
              onChange={(statusId) => handleExplorerStatusChange(row.id, statusId)}
            />
          </div>
        </td>
      )
    default:
      return null
  }
}

function renderExplorerTotalsCell(col, totals, { explorerTotalsThClass, explorerTotalsEmptyThClass, explorerStatusTotalsThClass }) {
  const isStatus = col.id === 'status'
  const baseClass = isStatus ? explorerStatusTotalsThClass : explorerTotalsThClass
  const emptyClass = explorerTotalsEmptyThClass

  switch (col.id) {
    case 'productDetails':
      return (
        <th key={col.id} className={`${baseClass} ${col.minWidth}`}>
          {totals.skuLocations}
        </th>
      )
    case 'transfers':
      return (
        <th key={col.id} className={`${baseClass} ${col.minWidth} text-right`}>
          {totals.transfers}
        </th>
      )
    case 'revenue':
      return (
        <th key={col.id} className={`${baseClass} ${col.minWidth} text-right`}>
          {totals.revenue}
        </th>
      )
    case 'recommended':
      return (
        <th key={col.id} className={`${baseClass} ${col.minWidth} text-right`}>
          {totals.recommended}
        </th>
      )
    case 'sales':
      return (
        <th key={col.id} className={`${baseClass} ${col.minWidth} text-right`}>
          <div className="flex flex-col items-end">
            <span>{totals.salesL7}</span>
            <span className="text-[12px] text-[#4b535c]">{totals.salesL30}</span>
          </div>
        </th>
      )
    case 'stockInCirculation':
      return (
        <th key={col.id} className={`${baseClass} ${col.minWidth} text-right`}>
          <div className="flex flex-col items-end">
            <span>{totals.currentUnits}</span>
            <span className="text-[12px] text-[#4b535c]">{totals.inTransit}</span>
          </div>
        </th>
      )
    case 'status':
      return <th key={col.id} className={`${explorerStatusTotalsThClass} ${col.minWidth}`} />
    default:
      return <th key={col.id} className={`${emptyClass} ${col.minWidth}`} />
  }
}

function ExplorerEmptyState() {
  return (
    <tr>
      <td colSpan={EXPLORER_TABLE_TOTAL_COLUMN_COUNT} className="py-20 px-6">
        <div className="flex flex-col items-center text-center">
          <Filter className="w-16 h-16 text-[#9ca3af] mb-4" aria-hidden />
          <p className="text-[18px] font-medium text-[#0a0a0a]">Dataset is too large</p>
          <p className="mt-2 text-[14px] text-[#4b535c] max-w-[420px]">
            You&apos;re trying to load 318,239 SKU-locations but the maximum is 300,000. Apply filters to
            reduce the dataset size.
          </p>
        </div>
      </td>
    </tr>
  )
}

function ExplorerTable({
  data,
  onDrawerFiltersActiveChange,
  explorerStatusOverrides,
  setExplorerStatusOverrides,
  explorerTransferOverrides,
  setExplorerTransferOverrides,
  explorerSelectedRowIds,
  setExplorerSelectedRowIds,
  explorerDepartmentFilters,
  setExplorerDepartmentFilters,
  explorerProductNameFilters,
  setExplorerProductNameFilters,
  explorerMovementTypeFilters,
  setExplorerMovementTypeFilters,
  explorerConfidenceFilters,
  setExplorerConfidenceFilters,
  explorerStatusFilters,
  setExplorerStatusFilters }) {
  const [explorerSearch, setExplorerSearch] = useState('')
  const [explorerActiveQuickFilter, setExplorerActiveQuickFilter] = useState(null)
  const [explorerFiltersDropdownOpen, setExplorerFiltersDropdownOpen] = useState(false)
  const [explorerBulkChangeStatusOpen, setExplorerBulkChangeStatusOpen] = useState(false)
  const [explorerBulkChangeUnitsOpen, setExplorerBulkChangeUnitsOpen] = useState(false)
  const explorerSelectAllRef = useRef(null)

  const handleExplorerStatusChange = (rowId, newStatus) => {
    setExplorerStatusOverrides((prev) => ({ ...prev, [rowId]: newStatus }))
  }

  const handleTransfersEdit = (rowId, newValue) => {
    const numValue = Number.isFinite(parseInt(newValue, 10)) ? parseInt(newValue, 10) : 0
    setExplorerTransferOverrides((prev) => ({ ...prev, [rowId]: numValue }))
    setExplorerStatusOverrides((prev) => ({ ...prev, [rowId]: 'last_edited_by_user' }))
  }

  const getEffectiveTransfers = (row) =>
    explorerTransferOverrides[row.id] !== undefined ? explorerTransferOverrides[row.id] : row.transfers

  const toggleExplorerRowSelection = (rowId) => {
    setExplorerSelectedRowIds((prev) => {
      const next = new Set(prev)
      if (next.has(rowId)) next.delete(rowId)
      else next.add(rowId)
      return next
    })
  }

  const clearExplorerSelection = () => setExplorerSelectedRowIds(new Set())

  const handleBulkStatusChange = (newStatus) => {
    if (!explorerSelectedRowIds.size) return
    setExplorerStatusOverrides((prev) => {
      const next = { ...prev }
      explorerSelectedRowIds.forEach((rowId) => {
        next[rowId] = newStatus
      })
      return next
    })
    setExplorerBulkChangeStatusOpen(false)
    clearExplorerSelection()
  }

  const handleBulkUnitsChange = (action) => {
    if (!explorerSelectedRowIds.size) return

    const transferUpdates = {}
    const statusUpdates = {}

    explorerSelectedRowIds.forEach((rowId) => {
      const row = data.find((r) => r.id === rowId)
      if (!row) return
      const effectiveCurrent = getEffectiveTransfers(row)
      const newValue =
        action === 'set_zero' ? 0 : Math.max(0, effectiveCurrent + action)
      if (newValue !== effectiveCurrent) {
        transferUpdates[rowId] = newValue
        statusUpdates[rowId] = 'last_edited_by_user'
      }
    })

    if (Object.keys(transferUpdates).length > 0) {
      setExplorerTransferOverrides((prev) => ({ ...prev, ...transferUpdates }))
      setExplorerStatusOverrides((prev) => ({ ...prev, ...statusUpdates }))
    }

    setExplorerBulkChangeUnitsOpen(false)
  }

  const handleBulkUndoEdits = () => {
    if (!explorerSelectedRowIds.size) return

    setExplorerTransferOverrides((prev) => {
      const next = { ...prev }
      explorerSelectedRowIds.forEach((rowId) => {
        delete next[rowId]
      })
      return next
    })

    setExplorerStatusOverrides((prev) => {
      const next = { ...prev }
      explorerSelectedRowIds.forEach((rowId) => {
        delete next[rowId]
      })
      return next
    })

    setExplorerBulkChangeUnitsOpen(false)
  }

  const getEffectiveStatus = (row) => explorerStatusOverrides[row.id] ?? getRowStatus(row)

  const explorerFilterCount =
    explorerDepartmentFilters.length +
    explorerProductNameFilters.length +
    explorerMovementTypeFilters.length +
    explorerConfidenceFilters.length +
    explorerStatusFilters.length

  const hasAnyFilter =
    explorerDepartmentFilters.length > 0 ||
    explorerProductNameFilters.length > 0 ||
    explorerMovementTypeFilters.length > 0 ||
    explorerConfidenceFilters.length > 0 ||
    explorerStatusFilters.length > 0

  useEffect(() => {
    onDrawerFiltersActiveChange?.(hasAnyFilter)
  }, [hasAnyFilter, onDrawerFiltersActiveChange])

  const clearAllExplorerFilters = () => {
    setExplorerDepartmentFilters([])
    setExplorerProductNameFilters([])
    setExplorerMovementTypeFilters([])
    setExplorerConfidenceFilters([])
    setExplorerStatusFilters([])
  }

  const filteredData = useMemo(
    () =>
      filterExplorerRows(data, {
        departmentFilters: explorerDepartmentFilters,
        productNameFilters: explorerProductNameFilters,
        movementTypeFilters: explorerMovementTypeFilters,
        confidenceFilters: explorerConfidenceFilters,
        statusFilters: explorerStatusFilters,
        statusOverrides: explorerStatusOverrides }),
    [
      data,
      explorerDepartmentFilters,
      explorerProductNameFilters,
      explorerMovementTypeFilters,
      explorerConfidenceFilters,
      explorerStatusFilters,
      explorerStatusOverrides,
    ]
  )

  const toggleAllExplorerRows = () => {
    const allIds = filteredData.map((r) => r.id)
    const allSelected = allIds.length > 0 && allIds.every((id) => explorerSelectedRowIds.has(id))
    setExplorerSelectedRowIds(allSelected ? new Set() : new Set(allIds))
  }

  const allExplorerRowsSelected =
    hasAnyFilter &&
    filteredData.length > 0 &&
    filteredData.every((row) => explorerSelectedRowIds.has(row.id))
  const someExplorerRowsSelected =
    hasAnyFilter &&
    filteredData.some((row) => explorerSelectedRowIds.has(row.id)) &&
    !allExplorerRowsSelected

  useEffect(() => {
    if (explorerSelectAllRef.current) {
      explorerSelectAllRef.current.indeterminate = someExplorerRowsSelected
    }
  }, [someExplorerRowsSelected])

  const totals = useMemo(() => {
    const sumTransfers = filteredData.reduce((sum, row) => {
      const transfers =
        explorerTransferOverrides[row.id] !== undefined
          ? explorerTransferOverrides[row.id]
          : row.transfers
      return sum + transfers
    }, 0)
    const sumRevenueK = filteredData.reduce((sum, row) => sum + parseExplorerRevenueK(row.revenue), 0)
    const sumRecommended = filteredData.reduce((sum, row) => sum + parseInt(row.recommended, 10), 0)
    const sumSalesL7 = filteredData.reduce((sum, row) => sum + row.salesL7, 0)
    const sumSalesL30 = filteredData.reduce((sum, row) => sum + row.salesL30, 0)
    const sumCurrentUnits = filteredData.reduce((sum, row) => sum + row.currentUnits, 0)
    const sumInTransit = filteredData.reduce((sum, row) => sum + row.currentUnitsInTransit, 0)
    return {
      skuLocations: `${filteredData.length} SKU-locations`,
      transfers: `${sumTransfers} units`,
      revenue: `€${sumRevenueK.toFixed(1)}K`,
      recommended: `${sumRecommended} units`,
      salesL7: sumSalesL7,
      salesL30: sumSalesL30,
      currentUnits: `${sumCurrentUnits} units`,
      inTransit: `${sumInTransit} in transit` }
  }, [filteredData, explorerTransferOverrides])

  const explorerThClass =
    'sticky top-0 z-20 bg-white h-[62px] min-h-[62px] px-4 text-left align-middle font-medium text-[#00050A] box-border'
  const explorerStatusThClass =
    'sticky top-0 right-0 z-30 bg-white h-[62px] min-h-[62px] px-4 text-right align-middle font-medium text-[#00050A] box-border border-l border-[#e5e7eb] shadow-[-4px_0_12px_-6px_rgba(15,23,42,0.12)]'
  const explorerTotalsThClass = 'sticky top-[62px] z-20 bg-white py-2 px-4 text-[12px] font-medium text-[#0a0a0a]'
  const explorerTotalsEmptyThClass = 'sticky top-[62px] z-20 bg-white py-2 px-4'
  const explorerStatusTotalsThClass =
    'sticky top-[62px] right-0 z-30 bg-white py-2 px-4 border-l border-[#e5e7eb] shadow-[-4px_0_12px_-6px_rgba(15,23,42,0.12)]'
  const explorerTdClass = 'py-3 px-4 align-top'
  const explorerStatusTdClass =
    'sticky right-0 z-30 bg-white py-3 px-4 align-top text-right border-l border-[#e5e7eb] shadow-[-4px_0_12px_-6px_rgba(15,23,42,0.12)] group-hover:bg-[#f9fafb]'
  const explorerCheckboxThClass =
    'sticky left-0 z-30 h-[62px] min-h-[62px] w-14 min-w-14 max-w-14 box-border bg-white px-4 py-[10px] text-left align-middle shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]'
  const explorerCheckboxTotalsThClass =
    'sticky left-0 z-30 w-14 min-w-14 max-w-14 box-border py-2 px-4 bg-white shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]'
  const explorerCheckboxTdClass =
    'sticky left-0 z-30 min-h-[86px] w-14 min-w-14 max-w-14 box-border bg-white px-4 py-3 align-middle shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)] group-hover:bg-[#f9fafb]'
  const explorerCheckboxInputClass =
    'h-4 w-4 rounded border-2 border-[#e9eaeb] bg-white text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-0'

  const headerGrip = (
    <span className="inline-flex shrink-0 select-none" aria-hidden>
      <IconColumnDragHandle />
    </span>
  )

  return (
    <div className="flex flex-col gap-[15px]">
      <div className="flex flex-wrap items-center gap-3 mb-4 min-w-0">
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center h-10 rounded-[4px] border border-[#e9eaeb] bg-white w-[200px] max-w-[280px]">
            <input
              type="text"
              placeholder="Search…"
              value={explorerSearch}
              onChange={(e) => setExplorerSearch(e.target.value)}
              className="flex-1 min-w-0 h-full pl-4 pr-2 border-0 bg-transparent rounded-[4px] text-[14px] text-[#0a0a0a] placeholder:text-[#9ca3af] focus:outline-none focus:ring-0"
            />
            <span className="pr-3 shrink-0 text-[#9ca3af]">
              <IconSearch className="size-4" />
            </span>
          </div>
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setExplorerFiltersDropdownOpen((o) => !o)}
              className="h-10 px-4 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#22272f] hover:bg-[#f3f4f6] shrink-0 flex items-center gap-2"
            >
              <IconFilterFunnel />
              Filters
              {explorerFilterCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#0267ff] text-white text-[11px] font-medium leading-none">
                  {explorerFilterCount}
                </span>
              )}
            </button>
            {explorerFiltersDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-[60]"
                  aria-hidden
                  onClick={() => setExplorerFiltersDropdownOpen(false)}
                />
                <div className="absolute left-0 top-full mt-1 z-[70] min-w-[220px] rounded-[6px] border border-[#e5e7eb] bg-white py-2 px-3 shadow-lg">
                  <div>
                    <div className="text-[12px] font-medium uppercase tracking-[0.04em] text-[#4b535c] mb-2">
                      Department
                    </div>
                    {DEPARTMENT_FILTER_OPTIONS.map((dept) => (
                      <label
                        key={dept}
                        className="flex items-center gap-2 px-0 py-1.5 hover:bg-[#f3f4f6] cursor-pointer rounded-[4px]"
                      >
                        <input
                          type="checkbox"
                          checked={explorerDepartmentFilters.includes(dept)}
                          onChange={(e) => {
                            setExplorerDepartmentFilters((prev) =>
                              e.target.checked ? [...prev, dept] : prev.filter((x) => x !== dept)
                            )
                          }}
                          className="size-4 rounded border-[#d1d5db] text-[#0267ff]"
                        />
                        <span className="text-[14px] text-[#0a0a0a]">{dept}</span>
                      </label>
                    ))}
                  </div>

                  <div className="border-t border-[#e5e7eb] pt-3 mt-3">
                    <div className="text-[12px] font-medium uppercase tracking-[0.04em] text-[#4b535c] mb-2">
                      Product
                    </div>
                    {EXPLORER_PRODUCTS.map((product) => (
                      <label
                        key={product.id}
                        className="flex items-center gap-2 px-0 py-1.5 hover:bg-[#f3f4f6] cursor-pointer rounded-[4px]"
                      >
                        <input
                          type="checkbox"
                          checked={explorerProductNameFilters.includes(product.name)}
                          onChange={(e) => {
                            setExplorerProductNameFilters((prev) =>
                              e.target.checked
                                ? [...prev, product.name]
                                : prev.filter((x) => x !== product.name)
                            )
                          }}
                          className="size-4 rounded border-[#d1d5db] text-[#0267ff]"
                        />
                        <span className="text-[14px] text-[#0a0a0a]">{product.name}</span>
                      </label>
                    ))}
                  </div>

                  <div className="border-t border-[#e5e7eb] pt-3 mt-3">
                    <div className="text-[12px] font-medium uppercase tracking-[0.04em] text-[#4b535c] mb-2">
                      Movement type
                    </div>
                    {MOVEMENT_TYPE_FILTER_OPTIONS.map((opt) => (
                      <label
                        key={opt.id}
                        className="flex items-center gap-2 px-0 py-1.5 hover:bg-[#f3f4f6] cursor-pointer rounded-[4px]"
                      >
                        <input
                          type="checkbox"
                          checked={explorerMovementTypeFilters.includes(opt.id)}
                          onChange={(e) => {
                            setExplorerMovementTypeFilters((prev) =>
                              e.target.checked ? [...prev, opt.id] : prev.filter((x) => x !== opt.id)
                            )
                          }}
                          className="size-4 rounded border-[#d1d5db] text-[#0267ff]"
                        />
                        <span className="text-[14px] text-[#0a0a0a]">{opt.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="border-t border-[#e5e7eb] pt-3 mt-3">
                    <div className="text-[12px] font-medium uppercase tracking-[0.04em] text-[#4b535c] mb-2">
                      Confidence
                    </div>
                    {CONFIDENCE_FILTER_OPTIONS.map((opt) => (
                      <label
                        key={opt.id}
                        className="flex items-center gap-2 px-0 py-1.5 hover:bg-[#f3f4f6] cursor-pointer rounded-[4px]"
                      >
                        <input
                          type="checkbox"
                          checked={explorerConfidenceFilters.includes(opt.id)}
                          onChange={(e) => {
                            setExplorerConfidenceFilters((prev) =>
                              e.target.checked ? [...prev, opt.id] : prev.filter((x) => x !== opt.id)
                            )
                          }}
                          className="size-4 rounded border-[#d1d5db] text-[#0267ff]"
                        />
                        <span className="text-[14px] text-[#0a0a0a]">{opt.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="border-t border-[#e5e7eb] pt-3 mt-3">
                    <div className="text-[12px] font-medium uppercase tracking-[0.04em] text-[#4b535c] mb-2">
                      Status
                    </div>
                    {EXPLORER_STATUS_FILTER_OPTIONS.map((opt) => (
                      <label
                        key={opt.id}
                        className="flex items-center gap-2 px-0 py-1.5 hover:bg-[#f3f4f6] cursor-pointer rounded-[4px]"
                      >
                        <input
                          type="checkbox"
                          checked={explorerStatusFilters.includes(opt.id)}
                          onChange={(e) => {
                            setExplorerStatusFilters((prev) =>
                              e.target.checked ? [...prev, opt.id] : prev.filter((x) => x !== opt.id)
                            )
                          }}
                          className="size-4 rounded border-[#d1d5db] text-[#0267ff]"
                        />
                        <span className="text-[14px] text-[#0a0a0a]">{opt.label}</span>
                      </label>
                    ))}
                  </div>

                  {explorerFilterCount > 0 && (
                    <div className="border-t border-[#e5e7eb] mt-3 pt-3">
                      <button
                        type="button"
                        onClick={clearAllExplorerFilters}
                        className="text-[13px] font-medium text-[#0267ff] hover:underline"
                      >
                        Clear all
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        <ScheduleQuickFilterChips
          chips={EXPLORER_QUICK_FILTER_CHIPS}
          activeId={explorerActiveQuickFilter}
          onChange={setExplorerActiveQuickFilter}
        />
      </div>

      {explorerFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {explorerDepartmentFilters.map((dept) => (
            <span
              key={`dept-${dept}`}
              className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-[4px] bg-[#f3f4f6] text-[#4b535c] border border-[#e5e7eb]"
            >
              <span>Department: {dept}</span>
              <button
                type="button"
                onClick={() => setExplorerDepartmentFilters((prev) => prev.filter((x) => x !== dept))}
                className="p-0.5 rounded-[4px] text-[#6b7280] hover:bg-[#e5e7eb] hover:text-[#374151]"
                aria-label={`Remove filter: Department ${dept}`}
              >
                <IconClose className="size-3.5" />
              </button>
            </span>
          ))}
          {explorerProductNameFilters.map((name) => (
            <span
              key={`product-${name}`}
              className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-[4px] bg-[#f3f4f6] text-[#4b535c] border border-[#e5e7eb]"
            >
              <span>Product: {name}</span>
              <button
                type="button"
                onClick={() => setExplorerProductNameFilters((prev) => prev.filter((x) => x !== name))}
                className="p-0.5 rounded-[4px] text-[#6b7280] hover:bg-[#e5e7eb] hover:text-[#374151]"
                aria-label={`Remove filter: Product ${name}`}
              >
                <IconClose className="size-3.5" />
              </button>
            </span>
          ))}
          {explorerMovementTypeFilters.map((id) => {
            const label = MOVEMENT_TYPE_FILTER_OPTIONS.find((o) => o.id === id)?.label ?? id
            return (
              <span
                key={`movement-${id}`}
                className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-[4px] bg-[#f3f4f6] text-[#4b535c] border border-[#e5e7eb]"
              >
                <span>Movement type: {label}</span>
                <button
                  type="button"
                  onClick={() => setExplorerMovementTypeFilters((prev) => prev.filter((x) => x !== id))}
                  className="p-0.5 rounded-[4px] text-[#6b7280] hover:bg-[#e5e7eb] hover:text-[#374151]"
                  aria-label={`Remove filter: Movement type ${label}`}
                >
                  <IconClose className="size-3.5" />
                </button>
              </span>
            )
          })}
          {explorerConfidenceFilters.map((id) => {
            const label = CONFIDENCE_FILTER_OPTIONS.find((o) => o.id === id)?.label ?? id
            return (
              <span
                key={`confidence-${id}`}
                className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-[4px] bg-[#f3f4f6] text-[#4b535c] border border-[#e5e7eb]"
              >
                <span>Confidence: {label}</span>
                <button
                  type="button"
                  onClick={() => setExplorerConfidenceFilters((prev) => prev.filter((x) => x !== id))}
                  className="p-0.5 rounded-[4px] text-[#6b7280] hover:bg-[#e5e7eb] hover:text-[#374151]"
                  aria-label={`Remove filter: Confidence ${label}`}
                >
                  <IconClose className="size-3.5" />
                </button>
              </span>
            )
          })}
          {explorerStatusFilters.map((f) => (
            <span
              key={`status-${f}`}
              className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-[4px] bg-[#f3f4f6] text-[#4b535c] border border-[#e5e7eb]"
            >
              <span>Status: {EXPLORER_STATUS_FILTER_LABELS[f]}</span>
              <button
                type="button"
                onClick={() => setExplorerStatusFilters((prev) => prev.filter((x) => x !== f))}
                className="p-0.5 rounded-[4px] text-[#6b7280] hover:bg-[#e5e7eb] hover:text-[#374151]"
                aria-label={`Remove filter: Status ${EXPLORER_STATUS_FILTER_LABELS[f]}`}
              >
                <IconClose className="size-3.5" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={clearAllExplorerFilters}
            className="text-[12px] font-medium text-[#4b535c] hover:text-[#0a0a0a]"
          >
            Clear all
          </button>
        </div>
      )}

    <div className="border border-[#e5e7eb] rounded-[8px] overflow-hidden bg-white">
      <div className="max-h-[min(65vh,800px)] overflow-x-auto overflow-y-auto">
        <table className="w-full text-[14px] bg-white">
          <thead className="bg-white">
            <tr className="border-b border-[#E9EAEB]">
              <th className={explorerCheckboxThClass}>
                <label className="flex min-h-[52px] cursor-pointer items-center py-[2px]">
                  <input
                    ref={explorerSelectAllRef}
                    type="checkbox"
                    className={explorerCheckboxInputClass}
                    aria-label="Select all"
                    disabled={!hasAnyFilter || filteredData.length === 0}
                    checked={allExplorerRowsSelected}
                    onChange={toggleAllExplorerRows}
                  />
                </label>
              </th>
              {EXPLORER_TABLE_COLUMNS.map((col) => {
                const isStatus = col.id === 'status'
                const isRight = col.alignment === 'right'
                return (
                  <th
                    key={col.id}
                    className={`${col.minWidth} ${isStatus ? explorerStatusThClass : explorerThClass} ${
                      isRight && !isStatus ? 'text-right' : ''
                    }`}
                  >
                    <span
                      className={`inline-flex min-w-0 items-center gap-2 ${
                        isRight ? 'w-full justify-end' : ''
                      }`}
                    >
                      {headerGrip}
                      {renderExplorerColumnHeaderLabel(col)}
                    </span>
                  </th>
                )
              })}
            </tr>
            {hasAnyFilter && (
            <tr className="border-b border-[#E9EAEB]">
              <th className={explorerCheckboxTotalsThClass} />
              {EXPLORER_TABLE_COLUMNS.map((col) =>
                renderExplorerTotalsCell(col, totals, {
                  explorerTotalsThClass,
                  explorerTotalsEmptyThClass,
                  explorerStatusTotalsThClass })
              )}
            </tr>
            )}
          </thead>
          <tbody>
            {!hasAnyFilter ? (
              <ExplorerEmptyState />
            ) : (
              filteredData.map((row) => (
              <tr key={row.id} className="group border-b border-[#E9EAEB] bg-white hover:bg-[#f9fafb]">
                <td
                  className={explorerCheckboxTdClass}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    className={explorerCheckboxInputClass}
                    aria-label={`Select ${row.productName}`}
                    checked={explorerSelectedRowIds.has(row.id)}
                    onChange={() => toggleExplorerRowSelection(row.id)}
                  />
                </td>
                {EXPLORER_TABLE_COLUMNS.map((col) =>
                  renderExplorerBodyCell(row, col, {
                    explorerTdClass,
                    explorerStatusTdClass,
                    getEffectiveStatus,
                    handleExplorerStatusChange,
                    getEffectiveTransfers,
                    handleTransfersEdit })
                )}
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>

      {explorerSelectedRowIds.size > 0 && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-[8px] px-6 py-3"
          style={{ background: '#1A1A2E', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}
        >
          <button
            type="button"
            onClick={clearExplorerSelection}
            className="flex items-center justify-center size-8 rounded-[4px] text-white hover:bg-white/10"
            aria-label="Close"
          >
            <IconClose className="size-4" />
          </button>
          <span className="text-[14px] font-medium text-white">
            {explorerSelectedRowIds.size} selected
          </span>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setExplorerBulkChangeUnitsOpen(false)
                setExplorerBulkChangeStatusOpen((o) => !o)
              }}
              className="px-4 py-2 rounded-[4px] text-[14px] font-medium text-white hover:bg-white/10"
            >
              Change status
            </button>
            {explorerBulkChangeStatusOpen && (
              <>
                <div
                  className="fixed inset-0 z-[60]"
                  aria-hidden
                  onClick={() => setExplorerBulkChangeStatusOpen(false)}
                />
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
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setExplorerBulkChangeStatusOpen(false)
                setExplorerBulkChangeUnitsOpen((o) => !o)
              }}
              className="px-4 py-2 rounded-[4px] text-[14px] font-medium text-white hover:bg-white/10"
            >
              Change units
            </button>
            {explorerBulkChangeUnitsOpen && (
              <>
                <div
                  className="fixed inset-0 z-[60]"
                  aria-hidden
                  onClick={() => setExplorerBulkChangeUnitsOpen(false)}
                />
                <div
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-[70] min-w-[180px] rounded-[6px] border border-[#e5e7eb] bg-white py-1 shadow-lg"
                  style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                >
                  <div className="px-3 py-2 text-[12px] font-medium text-[#4b535c]">Adjust by</div>
                  {[
                    { action: 1, label: '+1' },
                    { action: 2, label: '+2' },
                    { action: -1, label: '−1' },
                    { action: -2, label: '−2' },
                  ].map(({ action, label }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleBulkUnitsChange(action)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-[13px] font-medium text-[#0a0a0a] hover:bg-[#f3f4f6]"
                    >
                      {label}
                    </button>
                  ))}
                  <div className="border-t border-[#e5e7eb] my-1" role="separator" />
                  <button
                    type="button"
                    onClick={() => handleBulkUnitsChange('set_zero')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-[13px] font-medium text-[#0a0a0a] hover:bg-[#f3f4f6]"
                  >
                    Set all to 0
                  </button>
                  <div className="border-t border-[#e5e7eb] my-1" role="separator" />
                  <button
                    type="button"
                    onClick={handleBulkUndoEdits}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-[13px] font-medium text-[#0a0a0a] hover:bg-[#f3f4f6]"
                  >
                    Undo edits
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const SUMMARY_PRODUCT_BY_DEPARTMENT = [
  { name: 'Handbags', revenue: '€4.82K', units: 28, unitsApproved: 22, unitsUnapproved: 6, stockouts: '3 → 1', warehouseUnits: '142 → 128' },
  { name: 'Crossbody', revenue: '€3.15K', units: 19, unitsApproved: 15, unitsUnapproved: 4, stockouts: '2 → 0', warehouseUnits: '98 → 86' },
  { name: 'Bucket bags', revenue: '€2.41K', units: 14, unitsApproved: 11, unitsUnapproved: 3, stockouts: '1 → 1', warehouseUnits: '76 → 68' },
  { name: 'Totes', revenue: '€1.89K', units: 11, unitsApproved: 9, unitsUnapproved: 0, stockouts: '0 → 0', warehouseUnits: '54 → 49' },
  { name: 'Clutches', revenue: '€1.26K', units: 8, unitsApproved: 6, unitsUnapproved: 2, stockouts: '1 → 0', warehouseUnits: '42 → 38' },
]

const SUMMARY_PRODUCT_BY_PRODUCT = [
  { name: 'Croi-sac zip l', revenue: '€1.48K', units: 3, unitsApproved: 3, unitsUnapproved: 0, stockouts: '0 → 0', warehouseUnits: '52 → 48' },
  { name: 'Ang-sac pte main m', revenue: '€1.89K', units: 3, unitsApproved: 2, unitsUnapproved: 1, stockouts: '1 → 0', warehouseUnits: '48 → 42' },
  { name: 'Pre-sac seau m', revenue: '€1.12K', units: 2, unitsApproved: 0, unitsUnapproved: 2, stockouts: '0 → 1', warehouseUnits: '58 → 51' },
  { name: 'Croi-sac zip s', revenue: '€0.98K', units: 1, unitsApproved: 1, unitsUnapproved: 0, stockouts: '0 → 0', warehouseUnits: '55 → 50' },
  { name: 'Pre-sac seau s', revenue: '€0.76K', units: 2, unitsApproved: 1, unitsUnapproved: 1, stockouts: '0 → 1', warehouseUnits: '50 → 45' },
  { name: 'Ang-sac pte main s', revenue: '€0.65K', units: 4, unitsApproved: 2, unitsUnapproved: 2, stockouts: '0 → 0', warehouseUnits: '57 → 44' },
]

const SUMMARY_PRODUCT_BY_SEASON = [
  { name: 'SS26', revenue: '€5.94K', units: 32, unitsApproved: 26, unitsUnapproved: 6, stockouts: '4 → 2', warehouseUnits: '186 → 168' },
  { name: 'FW25', revenue: '€4.21K', units: 24, unitsApproved: 19, unitsUnapproved: 5, stockouts: '2 → 1', warehouseUnits: '142 → 128' },
  { name: 'SS25', revenue: '€2.87K', units: 16, unitsApproved: 14, unitsUnapproved: 2, stockouts: '1 → 0', warehouseUnits: '98 → 88' },
  { name: 'FW24', revenue: '€1.52K', units: 8, unitsApproved: 7, unitsUnapproved: 1, stockouts: '0 → 0', warehouseUnits: '62 → 55' },
]

const SUMMARY_PRODUCT_BY_PRODUCT_GROUP = [
  { name: 'Sac zip', revenue: '€2.46K', units: 4, unitsApproved: 4, unitsUnapproved: 0, stockouts: '0 → 0', warehouseUnits: '107 → 98' },
  { name: 'Sac seau', revenue: '€1.88K', units: 4, unitsApproved: 1, unitsUnapproved: 3, stockouts: '0 → 2', warehouseUnits: '108 → 96' },
  { name: 'Ang-sac pte main', revenue: '€2.54K', units: 7, unitsApproved: 4, unitsUnapproved: 3, stockouts: '1 → 0', warehouseUnits: '105 → 86' },
  { name: 'Sac bandoulière', revenue: '€1.12K', units: 5, unitsApproved: 4, unitsUnapproved: 1, stockouts: '1 → 1', warehouseUnits: '72 → 64' },
  { name: 'Mini sac', revenue: '€0.94K', units: 3, unitsApproved: 3, unitsUnapproved: 0, stockouts: '0 → 0', warehouseUnits: '48 → 42' },
]

const SUMMARY_LOCATION_BY_LOCATION = [
  { name: 'Opéra', revenue: '€2.18K', units: 12, unitsApproved: 10, unitsUnapproved: 2, stockouts: '1 → 0', warehouseUnits: '52 → 48' },
  { name: 'G.L. Haussmann Maro', revenue: '€1.64K', units: 9, unitsApproved: 8, unitsUnapproved: 1, stockouts: '0 → 0', warehouseUnits: '58 → 51' },
  { name: 'La Défense', revenue: '€1.42K', units: 8, unitsApproved: 7, unitsUnapproved: 1, stockouts: '0 → 0', warehouseUnits: '48 → 42' },
  { name: 'Cap 3000', revenue: '€0.89K', units: 4, unitsApproved: 3, unitsUnapproved: 1, stockouts: '0 → 0', warehouseUnits: '40 → 36' },
  { name: 'Lyon Herriot', revenue: '€0.76K', units: 3, unitsApproved: 2, unitsUnapproved: 1, stockouts: '0 → 0', warehouseUnits: '35 → 30' },
  { name: 'Printemps Lille', revenue: '€1.21K', units: 6, unitsApproved: 5, unitsUnapproved: 1, stockouts: '0 → 0', warehouseUnits: '57 → 44' },
]

const SUMMARY_LOCATION_BY_LOCATION_TYPE = [
  { name: 'Store', revenue: '€5.82K', units: 34, unitsApproved: 28, unitsUnapproved: 6, stockouts: '2 → 1', warehouseUnits: '198 → 178' },
  { name: 'Outlet', revenue: '€1.24K', units: 8, unitsApproved: 6, unitsUnapproved: 2, stockouts: '1 → 0', warehouseUnits: '62 → 54' },
  { name: 'Warehouse', revenue: '€0.94K', units: 5, unitsApproved: 4, unitsUnapproved: 1, stockouts: '0 → 0', warehouseUnits: '120 → 108' },
  { name: 'E-commerce', revenue: '€1.10K', units: 6, unitsApproved: 5, unitsUnapproved: 1, stockouts: '0 → 0', warehouseUnits: '48 → 42' },
]

const SUMMARY_LOCATION_BY_COUNTRY = [
  { name: 'France', revenue: '€6.48K', units: 38, unitsApproved: 31, unitsUnapproved: 7, stockouts: '3 → 1', warehouseUnits: '224 → 202' },
  { name: 'Belgium', revenue: '€1.12K', units: 7, unitsApproved: 5, unitsUnapproved: 2, stockouts: '1 → 0', warehouseUnits: '58 → 52' },
  { name: 'Spain', revenue: '€0.98K', units: 5, unitsApproved: 4, unitsUnapproved: 1, stockouts: '0 → 0', warehouseUnits: '48 → 42' },
  { name: 'United Kingdom', revenue: '€0.52K', units: 3, unitsApproved: 3, unitsUnapproved: 0, stockouts: '0 → 0', warehouseUnits: '32 → 28' },
]

const SUMMARY_STATUS_ROWS = [
  { name: 'Approved', revenue: '€5.12K', units: 31, stockouts: '2 → 0', warehouseUnits: '186 → 168' },
  { name: 'Needs review', revenue: '€1.84K', units: 12, stockouts: '1 → 1', warehouseUnits: '98 → 88' },
  { name: 'Unapproved', revenue: '€1.14K', units: 10, stockouts: '1 → 2', warehouseUnits: '78 → 68' },
]

const SUMMARY_PRODUCT_DIMENSIONS = [
  { id: 'department', label: 'Department', rows: SUMMARY_PRODUCT_BY_DEPARTMENT },
  { id: 'product', label: 'Product', rows: SUMMARY_PRODUCT_BY_PRODUCT },
  { id: 'season', label: 'Season', rows: SUMMARY_PRODUCT_BY_SEASON },
  { id: 'product_group', label: 'Product group', rows: SUMMARY_PRODUCT_BY_PRODUCT_GROUP },
]

const SUMMARY_LOCATION_DIMENSIONS = [
  { id: 'location', label: 'Location', rows: SUMMARY_LOCATION_BY_LOCATION },
  { id: 'location_type', label: 'Location type', rows: SUMMARY_LOCATION_BY_LOCATION_TYPE },
  { id: 'country', label: 'Country', rows: SUMMARY_LOCATION_BY_COUNTRY },
]

function SummaryDimensionSelect({ value, onChange, options }) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 pl-4 pr-10 rounded-[4px] border border-[#E9EAEB] bg-white text-[14px] text-[#0a0a0a] appearance-none min-w-[180px]"
        aria-label="Group by dimension"
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#4b535c]">
        <IconChevronDown className="size-4" />
      </span>
    </div>
  )
}

function SummaryRevenueCell({ value }) {
  return <span className="text-[14px] text-[#0a0a0a]">{value}</span>
}

function SummaryStockoutsCell({ value }) {
  return <span className="text-[14px] text-[#0a0a0a]">{value}</span>
}

function SummaryWarehouseUnitsCell({ value }) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="text-[14px] text-[#0a0a0a]">{value}</span>
    </div>
  )
}

function SummaryUnitsWithApprovalCell({ units, unitsApproved, unitsUnapproved }) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="text-[14px] text-[#0a0a0a]">{units}</span>
      <span className="text-[12px] font-medium text-[#166534]">{unitsApproved} approved</span>
      {unitsUnapproved > 0 && (
        <span className="text-[12px] font-medium text-[#4b535c]">{unitsUnapproved} unapproved</span>
      )}
    </div>
  )
}

function SummaryUnitsPlainCell({ units }) {
  return <span className="text-[14px] text-[#0a0a0a]">{units}</span>
}

function SummaryGroupedTable({ firstColumnLabel, rows, showApprovalBreakdown }) {
  return (
    <div className="border border-[#e5e7eb] rounded-[8px] overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-[14px] bg-white">
          <thead className="bg-white">
            <tr className="border-b border-[#E9EAEB]">
              <th className="h-[62px] min-h-[62px] px-4 text-left align-middle font-medium text-[#00050A]">
                {firstColumnLabel}
              </th>
              <th className="h-[62px] min-h-[62px] px-4 text-right align-middle font-medium text-[#00050A] min-w-[110px]">
                Revenue increase
              </th>
              <th className="h-[62px] min-h-[62px] px-4 text-right align-middle font-medium text-[#00050A] min-w-[90px]">
                Units
              </th>
              <th className="h-[62px] min-h-[62px] px-4 text-right align-middle font-medium text-[#00050A] min-w-[90px]">
                Stockouts
              </th>
              <th className="h-[62px] min-h-[62px] px-4 text-right align-middle font-medium text-[#00050A] min-w-[140px]">
                Warehouse units
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-b border-[#E9EAEB] bg-white hover:bg-[#f9fafb]">
                <td className="py-3 px-4 align-top text-[#0a0a0a] font-medium">{row.name}</td>
                <td className="py-3 px-4 align-top text-right">
                  <SummaryRevenueCell value={row.revenue} />
                </td>
                <td className="py-3 px-4 align-top text-right">
                  {showApprovalBreakdown ? (
                    <SummaryUnitsWithApprovalCell
                      units={row.units}
                      unitsApproved={row.unitsApproved}
                      unitsUnapproved={row.unitsUnapproved}
                    />
                  ) : (
                    <SummaryUnitsPlainCell units={row.units} />
                  )}
                </td>
                <td className="py-3 px-4 align-top text-right">
                  <SummaryStockoutsCell value={row.stockouts} />
                </td>
                <td className="py-3 px-4 align-top text-right">
                  <SummaryWarehouseUnitsCell value={row.warehouseUnits} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SummaryProductTab() {
  const [dimensionId, setDimensionId] = useState('department')
  const dimension =
    SUMMARY_PRODUCT_DIMENSIONS.find((d) => d.id === dimensionId) ?? SUMMARY_PRODUCT_DIMENSIONS[0]

  return (
    <div className="flex flex-col gap-4">
      <SummaryDimensionSelect
        value={dimensionId}
        onChange={setDimensionId}
        options={SUMMARY_PRODUCT_DIMENSIONS}
      />
      <SummaryGroupedTable
        firstColumnLabel={dimension.label}
        rows={dimension.rows}
        showApprovalBreakdown
      />
    </div>
  )
}

function SummaryLocationTab() {
  const [dimensionId, setDimensionId] = useState('location')
  const dimension =
    SUMMARY_LOCATION_DIMENSIONS.find((d) => d.id === dimensionId) ?? SUMMARY_LOCATION_DIMENSIONS[0]

  return (
    <div className="flex flex-col gap-4">
      <SummaryDimensionSelect
        value={dimensionId}
        onChange={setDimensionId}
        options={SUMMARY_LOCATION_DIMENSIONS}
      />
      <SummaryGroupedTable
        firstColumnLabel={dimension.label}
        rows={dimension.rows}
        showApprovalBreakdown
      />
    </div>
  )
}

function SummaryStatusTab() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] text-[#4b535c]">
        Only approved recommendations will be submitted, and can&apos;t be edited afterwards. Needs
        review and unapproved lines stay active and editable, and can be submitted later.
      </p>
      <SummaryGroupedTable
        firstColumnLabel="Status"
        rows={SUMMARY_STATUS_ROWS}
        showApprovalBreakdown={false}
      />
    </div>
  )
}

function SummaryPage() {
  const [activeTab, setActiveTab] = useState('product')

  return (
    <div className="flex flex-col gap-[15px]">
      <h1 className="text-[24px] font-medium text-[#0a0a0a]">Summary</h1>
      <nav className="flex items-center gap-6 h-11">
        {[
          { id: 'product', label: 'Product' },
          { id: 'location', label: 'Location' },
          { id: 'status', label: 'Status' },
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
      {activeTab === 'product' && <SummaryProductTab />}
      {activeTab === 'location' && <SummaryLocationTab />}
      {activeTab === 'status' && <SummaryStatusTab />}
    </div>
  )
}

export default function ScheduleDetailPage() {
  const [showSummary, setShowSummary] = useState(false)
  const [activeTab, setActiveTab] = useState('products')
  const [viewShowsFullDataset, setViewShowsFullDataset] = useState(true)
  const [selectedView, setSelectedView] = useState('Show all recommendations')
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false)
  const [includeZeroTransfers, setIncludeZeroTransfers] = useState(false)
  const [explorerStatusOverrides, setExplorerStatusOverrides] = useState({})
  const [explorerTransferOverrides, setExplorerTransferOverrides] = useState({})
  const [explorerSelectedRowIds, setExplorerSelectedRowIds] = useState(new Set())
  const [explorerDepartmentFilters, setExplorerDepartmentFilters] = useState([])
  const [explorerProductNameFilters, setExplorerProductNameFilters] = useState([])
  const [explorerMovementTypeFilters, setExplorerMovementTypeFilters] = useState([])
  const [explorerConfidenceFilters, setExplorerConfidenceFilters] = useState([])
  const [explorerStatusFilters, setExplorerStatusFilters] = useState([])
  const [tripStatusOverrides, setTripStatusOverrides] = useState({})
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [selectedTripIds, setSelectedTripIds] = useState(new Set())
  const [statusFilters, setStatusFilters] = useState([])
  const [filtersDropdownOpen, setFiltersDropdownOpen] = useState(false)
  const [productsDrawerFiltersActive, setProductsDrawerFiltersActive] = useState(false)
  const [locationsDrawerFiltersActive, setLocationsDrawerFiltersActive] = useState(false)
  const [explorerDrawerFiltersActive, setExplorerDrawerFiltersActive] = useState(false)
  const hasActiveFilters =
    activeTab === 'products'
      ? productsDrawerFiltersActive
      : activeTab === 'locations'
        ? locationsDrawerFiltersActive
        : activeTab === 'explorer'
          ? explorerDrawerFiltersActive
          : activeTab === 'trips'
            ? selectedTrip
              ? productsDrawerFiltersActive
              : statusFilters.length > 0
            : false

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
  const tripSummary = viewShowsFullDataset ? TRIPS_TAB_SUMMARY_TOTALS_FULL : TRIPS_TAB_SUMMARY_TOTALS_OPERA

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
    const minColW = colIndex === 4 ? 160 : colIndex === 6 ? 190 : 72
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
              Europe monthly
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#4b535c]">
              <span className="inline-flex items-center gap-2 flex-wrap">
                <span className="text-[#4b535c]">Submission deadline:</span>
                <span className="px-2.5 py-0.5 rounded-full text-[13px] font-medium bg-[#fce7f3] text-[#9d174d]">
                  {SCHEDULE_SUBMISSION_DEADLINE}
                </span>
              </span>
              <span>
                Created <span className="text-[#0a0a0a]">{SCHEDULE_CREATION_DATE}</span>
              </span>
              <button
                type="button"
                className="text-[13px] font-medium text-[#0267ff] hover:underline"
              >
                View scope
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!showSummary && (
              <>
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
              </>
            )}
            {showSummary ? (
              <button
                type="button"
                className="h-10 px-4 rounded-[4px] bg-[#0267ff] text-white text-[14px] font-medium flex items-center gap-2 hover:bg-[#0252cc]"
              >
                Submit recommendations
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowSummary(true)}
                className="h-10 px-4 rounded-[4px] bg-[#0267ff] text-white text-[14px] font-medium flex items-center gap-2 hover:bg-[#0252cc]"
              >
                Continue to summary
              </button>
            )}
          </div>
        </div>
      </header>

      {showSummary ? (
        <SummaryPage />
      ) : (
      <div className="flex flex-col gap-[15px]">
        <div className="flex items-center justify-between gap-4">
          <nav className="flex items-center gap-6 h-11">
            {[
              { id: 'products', label: 'Products' },
              { id: 'locations', label: 'Locations' },
              { id: 'trips', label: 'Trips' },
              { id: 'explorer', label: 'Explorer' },
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
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {}}
                className="flex items-center gap-1.5 h-10 px-3 rounded-[6px] border border-[#EAEAEA] bg-white text-[14px] font-medium text-[#0a0a0a] hover:bg-[#f5f5f5] shrink-0"
                aria-label="Save"
              >
                <Plus className="w-4 h-4 shrink-0" aria-hidden />
                Save
              </button>
            )}
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
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[14px] text-[#4b535c] whitespace-nowrap">Include zero transfers</span>
              <button
                type="button"
                role="switch"
                aria-checked={includeZeroTransfers}
                aria-label="Include zero transfers"
                onClick={() => setIncludeZeroTransfers((on) => !on)}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                  includeZeroTransfers ? 'bg-[#1d4ed8]' : 'bg-[#d1d5db]'
                }`}
              >
                <span
                  className={`inline-block size-4 rounded-full bg-white shadow transition-transform ${
                    includeZeroTransfers ? 'translate-x-[18px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'products' ? (
          <ProductsDrilldown
            trip={TRIPS_OPERA[0]}
            onBack={() => {}}
            showBackButton={false}
            onDrawerFiltersActiveChange={setProductsDrawerFiltersActive}
            setExplorerProductNameFilters={setExplorerProductNameFilters}
            setActiveTab={setActiveTab}
          />
        ) : activeTab === 'locations' ? (
          <LocationsTab
            onDrawerFiltersActiveChange={setLocationsDrawerFiltersActive}
          />
        ) : activeTab === 'explorer' ? (
          <ExplorerTable
            data={EXPLORER_DATA}
            onDrawerFiltersActiveChange={setExplorerDrawerFiltersActive}
            explorerStatusOverrides={explorerStatusOverrides}
            setExplorerStatusOverrides={setExplorerStatusOverrides}
            explorerTransferOverrides={explorerTransferOverrides}
            setExplorerTransferOverrides={setExplorerTransferOverrides}
            explorerSelectedRowIds={explorerSelectedRowIds}
            setExplorerSelectedRowIds={setExplorerSelectedRowIds}
            explorerDepartmentFilters={explorerDepartmentFilters}
            setExplorerDepartmentFilters={setExplorerDepartmentFilters}
            explorerProductNameFilters={explorerProductNameFilters}
            setExplorerProductNameFilters={setExplorerProductNameFilters}
            explorerMovementTypeFilters={explorerMovementTypeFilters}
            setExplorerMovementTypeFilters={setExplorerMovementTypeFilters}
            explorerConfidenceFilters={explorerConfidenceFilters}
            setExplorerConfidenceFilters={setExplorerConfidenceFilters}
            explorerStatusFilters={explorerStatusFilters}
            setExplorerStatusFilters={setExplorerStatusFilters}
          />
        ) : selectedTrip ? (
            <ProductsDrilldown
              trip={selectedTrip}
              onBack={() => setSelectedTrip(null)}
              onDrawerFiltersActiveChange={setProductsDrawerFiltersActive}
              setExplorerProductNameFilters={setExplorerProductNameFilters}
              setActiveTab={setActiveTab}
            />
          ) : (
          <div className="flex flex-col gap-[15px]">
            <div className="flex flex-col gap-[15px]">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
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
              <div className="relative shrink-0">
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
                        onDrop: (e) => onTripColDrop(visualIdx, e) }
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
                                Movement type
                              </span>
                              {resizer}
                            </th>
                          )
                        case 3:
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
                        case 4:
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
                        case 5:
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
                          return (
                            <th
                              key={logicalIdx}
                              className="sticky top-[62px] z-20 bg-white py-2 px-3 text-[12px] font-medium text-[#0a0a0a]"
                            >
                              {tripSummary.sendingTrips}
                            </th>
                          )
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
                              className="sticky top-[62px] z-20 bg-white py-2 px-3"
                            />
                          )
                        case 3:
                          return (
                            <th
                              key={logicalIdx}
                              className="sticky top-[62px] z-20 bg-white py-2 px-3 text-[12px] font-medium text-[#0a0a0a]"
                            >
                              {tripSummary.transfers}
                            </th>
                          )
                        case 4:
                          return (
                            <th
                              key={logicalIdx}
                              className="sticky top-[62px] z-20 bg-white py-2 pl-3 pr-8 text-[12px] font-medium text-[#0a0a0a]"
                            >
                              {tripSummary.revenue}
                            </th>
                          )
                        case 5:
                          return (
                            <th
                              key={logicalIdx}
                              className="sticky top-[62px] z-20 bg-white whitespace-nowrap py-2 px-3 text-right text-[12px] font-medium text-[#0a0a0a]"
                            >
                              {tripSummary.recommended}
                            </th>
                          )

                        case 6:
                          return (
                            <th
                              key={logicalIdx}
                              className="sticky top-[62px] z-20 bg-white py-2 px-3 text-right text-[12px] font-medium text-[#0a0a0a]"
                            >
                              {tripSummary.products}
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
                                  <MovementTypePills movementType={row.movementType} />
                                </td>
                              )
                            case 3:
                              return (
                                <td key={logicalIdx} className="py-3 px-3 align-top">
                                  <span className="text-[#0a0a0a]">{row.transfers}</span>
                                  <span className="text-[12px] text-[#4b535c] ml-1">(max 200)</span>
                                </td>
                              )
                            case 4:
                              return (
                                <td key={logicalIdx} className="py-3 pl-3 pr-8 align-top">
                                  <span className="text-[#0a0a0a]">{row.revenue}</span>
                                  <span className="text-[12px] text-[#4b535c] ml-1">(min 6903)</span>
                                </td>
                              )
                            case 5:
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
        )}

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
      )}
    </div>
  )
}
