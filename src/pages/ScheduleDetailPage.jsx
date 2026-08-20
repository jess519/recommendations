import { useState, useEffect, useRef, useCallback, useLayoutEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Copy, Pencil, X, ChevronUp, ChevronDown } from 'lucide-react'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { IconSearch, IconChevronDown, IconChevronRight, IconShare, IconDocument, IconClose, IconArrowLeft, IconGears, IconTruckTu, IconPackageTu, IconRebalancing, IconReplenishment, IconCalendarNote, IconTrendUp, IconFilterFunnel, IconColumnSettings, IconSortOrder, IconWarning, IconLightbulb } from '../components/icons'
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

/** Trips table data cols; 2 = Transfers, 3 = Revenue increase, 4 = Recommended transfers (long headers). Movement removed. */
const TRIPS_TABLE_DEFAULT_COL_WIDTHS = [200, 200, 120, 220, 160, 100, 200]
const TRIPS_TABLE_NUM_DATA_COLS = TRIPS_TABLE_DEFAULT_COL_WIDTHS.length
const TRIPS_COL_DND_MIME = 'application/x-autone-trip-col'
/** Logical product table columns are 0–18 (Status = 18). 10–12 = Sales L7D / L30D / L90D; 13 = Forecast. */
const PRODUCTS_TABLE_NUM_DATA_COLS = 19
/** Default visual order: CX preferred visible set first (Status last), then hidden columns. */
const PRODUCTS_TABLE_DEFAULT_COLUMN_ORDER = [
  0, 1, 8, 10, 11, 12, 13, 2, 4, 5, 3, 6, 14, 18, 7, 9, 15, 16, 17,
]
/** Default visible logical columns — order matches PRODUCTS_TABLE_DEFAULT_COLUMN_ORDER prefix. */
const PRODUCTS_DEFAULT_VISIBLE_LOGICAL_IDS = [
  0, 1, 8, 10, 11, 12, 13, 2, 4, 5, 3, 6, 14, 18,
]
/** Product + Status are always visible in the column picker. */
const PRODUCTS_LOCKED_LOGICAL_IDS = [0, 18]
/** Picker labels by logical index (match header wording; list order is 0…18). */
const PRODUCTS_COLUMN_PICKER_LABELS = [
  'Product',
  'Movement',
  'Transfers',
  'Revenue increase',
  'Recommended transfers',
  'Confidence',
  'Coverage',
  'Next event',
  'Units (to)',
  'Warehouse',
  'Sales L7D',
  'Sales L30D',
  'Sales L90D',
  'Forecast per wk',
  'Stockouts',
  'Locations',
  'Overstocks',
  'Understocks',
  'Status',
]
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
  transfersUnits: '12',
  transfersTrips: '5 trips',
  revenue: '€6.9K',
  recommendedUnits: '18',
  stockUnits: '70',
  stockInTransit: '11 in transit & PFP',
  warehouseAllocate: '320 → 280',
  warehouseSell: '400 → 360 to sell',
  salesL7: '138',
  salesL30: '693',
  salesL90: '1840',
  stockouts: '1 → 2',
  locations: '11 → 10',
  overstocks: '21 → 5',
  understocks: '25 → 11' }

/** Hardcoded totals for Trips tab summary row (TRIPS_ALL, default full dataset view). */
const TRIPS_TAB_SUMMARY_TOTALS_FULL = {
  sendingTrips: '25 trips',
  transfers: '2,147',
  revenue: '€428.9K',
  recommended: '2,260',
  products: '288 products' }

/** Hardcoded totals for Trips tab summary row (TRIPS_OPERA subset view). */
const TRIPS_TAB_SUMMARY_TOTALS_OPERA = {
  sendingTrips: '9 trips',
  transfers: '241',
  revenue: '€48.1K',
  recommended: '241',
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
  // Warehouse-involved trips (Log01 roles + revenue rules)
  {
    id: 201,
    from: 'Log01 entrepot logtex',
    fromCode: 'LOG01',
    fromLocationType: 'warehouse',
    fromWarehouseRole: 'non-selling',
    to: 'Opéra',
    toCode: 'A1A',
    toLocationType: 'store',
    transfers: '45',
    revenue: '€4.2K',
    recommended: '45',
    products: 12,
    packCount: 4,
    movementType: ['replenishment'],
    badges: ['VIS', 'REV'],
    status: 'needs_review_from_user',
    approvedTransfers: 3,
    unapprovedTransfers: 3 },
  {
    id: 202,
    from: 'Log01 entrepot logtex',
    fromCode: 'LOG01',
    fromLocationType: 'warehouse',
    fromWarehouseRole: 'non-selling',
    to: 'Log01 entrepot logtex',
    toCode: 'LOG01',
    toLocationType: 'warehouse',
    toWarehouseRole: 'selling',
    transfers: '22',
    revenue: '€1.8K',
    recommended: '22',
    products: 6,
    movementType: ['replenishment'],
    badges: ['REV'],
    status: 'unapproved',
    approvedTransfers: 0,
    unapprovedTransfers: 5 },
  {
    id: 203,
    from: 'Cannes',
    fromCode: 'A1R',
    fromLocationType: 'store',
    to: 'Log01 entrepot logtex',
    toCode: 'LOG01',
    toLocationType: 'warehouse',
    toWarehouseRole: 'non-selling',
    transfers: '28',
    revenue: '€0',
    recommended: '28',
    products: 8,
    movementType: ['rebalancing'],
    badges: ['VIS', 'REV'],
    status: 'partially_approved',
    approvedTransfers: 2,
    unapprovedTransfers: 3 },
  {
    id: 204,
    from: 'Log01 entrepot logtex',
    fromCode: 'LOG01',
    fromLocationType: 'warehouse',
    fromWarehouseRole: 'selling',
    to: 'Nice',
    toCode: 'NCE06',
    toLocationType: 'store',
    transfers: '14',
    revenue: '€0.8K',
    recommended: '14',
    products: 5,
    movementType: ['rebalancing'],
    badges: ['REV'],
    status: 'last_edited_by_user',
    editedByUser: 'Csabi Toth',
    approvedTransfers: 2,
    unapprovedTransfers: 2 },
]

const TRIPS_ALL = [...TRIPS_OPERA, ...TRIPS_OTHER]

// G.3f: minimal trip capacity seed for live-rebal hover subtitle (all Opera + Other trips).
for (const t of TRIPS_ALL) {
  if (t.capacityUnits == null) {
    t.capacityUnits = Number(String(t.transfers ?? '').replace(/[^\d]/g, '')) || 0
  }
  if (t.maxCapacity == null) t.maxCapacity = 10000
  // SKU-location approval counts for Trips Status sub-text (vary 3–8 by trip id)
  if (t.approvedTransfers == null || t.unapprovedTransfers == null) {
    const status = t.status || 'unapproved'
    const total = 3 + (Number(t.id) % 6) // 3..8
    if (status === 'approved_by_system' || status === 'approved_by_user') {
      t.approvedTransfers = total
      t.unapprovedTransfers = 0
    } else if (status === 'unapproved') {
      t.approvedTransfers = 0
      t.unapprovedTransfers = total
    } else {
      // needs_review / edited / partially_approved / missing
      const approved = Math.max(1, Math.floor(total / 2))
      t.approvedTransfers = approved
      t.unapprovedTransfers = total - approved
    }
  }
}

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
    { id: 1, name: 'Croi-sac zip l', sku: 'A1398810', colour: 'Noir', movementType: ["rebalancing"], transfers: 3, transfersSub: 1, approvedTransfers: 3, unapprovedTransfers: 0, revenue: '€1.48K', recommended: 1, recommendedBadges: ['REV'], recommendedSub: 2, confidence: 'high', coverage: 'All SKUs in target', coverageWeeks: 5.2, coverageTarget: 6, nextEvent: { name: 'Europe monthly', date: '09/06/2026' }, salesL7: 1, salesL30: 2, salesL90: 5, forecast: 1.87, stockouts: '0 → 0', locations: '2 → 2', overstocks: '4 → 1', understocks: '8 → 5',     status: 'approved_by_system', currentUnits: 12, currentUnitsInTransit: 3, warehouseAllocateLine: '52 → 48', warehouseSellLine: '68 → 62', packMultiple: null, skuCount: 1, rrp: 420, ws: 0, season: 'SS26', event: 'Drop 3', firstSalesDate: '12th Mar 25', lifeToDateSales: 41, department: 'Crossbody', subDepartment: 'Bandoulière', material: 'Nylon ripstop with leather trim', gender: 'Unisexe' },
    { id: 2, name: 'Pre-sac seau m', sku: 'A101080', colour: 'Bleu petrole', movementType: ["rebalancing"], transfers: 2, transfersSub: 1, approvedTransfers: 0, unapprovedTransfers: 2, revenue: '€1.12K', recommended: 2, recommendedBadges: ['VIS'], recommendedSub: 1, confidence: 'high', coverage: '2% below target', coverageWeeks: 3.8, coverageTarget: 6, nextEvent: { name: 'Europe monthly', date: '09/06/2026' }, salesL7: 2, salesL30: 3, salesL90: 8, forecast: 0.54, stockouts: '0 → 1', locations: '2 → 1', overstocks: '3 → 0', understocks: '2 → 0', currentUnits: 8, currentUnitsInTransit: 0, warehouseAllocateLine: '58 → 51', warehouseSellLine: '72 → 65', packMultiple: null, skuCount: 1, rrp: 85, ws: 0, season: 'Winter 26', event: 'Vague 2', firstSalesDate: '3rd Nov 25', lifeToDateSales: 18, department: 'Bucket bags', subDepartment: 'Seau', material: 'Laine', gender: 'Femme' },
    { id: 3, name: 'Ang-sac pte main m', sku: 'A1252810', colour: 'Figue', movementType: ["rebalancing"], transfers: 3, transfersSub: 2, approvedTransfers: 2, unapprovedTransfers: 1, revenue: '€1.89K', recommended: 3, recommendedBadges: ['REV', 'VIS'], recommendedSub: 1, confidence: 'high', coverage: '5% below target', coverageWeeks: 3.1, coverageTarget: 6, nextEvent: { name: 'Europe monthly', date: '09/06/2026' }, salesL7: 1, salesL30: 4, salesL90: 11, forecast: 2.1, stockouts: '1 → 0', locations: '2 → 2', overstocks: '5 → 2', understocks: '6 → 3',     status: 'last_edited_by_user', editedByUser: 'Csabi Toth', currentUnits: 25, currentUnitsInTransit: 5, warehouseAllocateLine: '48 → 42', warehouseSellLine: '65 → 58', packMultiple: null, skuCount: 2, rrp: 890, ws: 0, season: 'Winter 26', event: 'Vague 1', firstSalesDate: '22nd Jan 26', lifeToDateSales: 23, department: 'Handbags', subDepartment: 'Sac à main', material: 'Cuir grainé pleine fleur', gender: 'Femme' },
    { id: 4, name: 'Croi-sac zip s', sku: 'A1398811', colour: 'Noir', movementType: ["rebalancing"], transfers: 1, transfersSub: 2, approvedTransfers: 1, unapprovedTransfers: 0, revenue: '€0.98K', recommended: 1, recommendedBadges: ['REV'], recommendedSub: 2, confidence: 'high', coverage: 'All SKUs in target', coverageWeeks: 6.1, coverageTarget: 6, nextEvent: { name: 'Europe monthly', date: '09/06/2026' }, salesL7: 0, salesL30: 1, salesL90: 3, forecast: 0.32, stockouts: '0 → 0', locations: '1 → 2', overstocks: '2 → 1', understocks: '4 → 2', status: 'approved_by_user', approvedByUser: 'Jess Briggs', currentUnits: 3, currentUnitsInTransit: 1, warehouseAllocateLine: '55 → 50', warehouseSellLine: '70 → 63', packMultiple: null, skuCount: 1, rrp: 380, ws: 25, season: 'SS26', event: 'Drop 1', firstSalesDate: '8th Feb 26', lifeToDateSales: 9, department: 'Crossbody', subDepartment: 'Bandoulière', material: 'Cuir', gender: 'Homme' },
    // COIN: single-SKU pack-constrained replen — inline-editable
    { id: 5, name: 'Pre-sac seau s', sku: 'A101081', colour: 'Bleu petrole', movementType: ["replenishment"], transfers: 20, transfersSub: 1, approvedTransfers: 10, unapprovedTransfers: 10, revenue: '€0.76K', recommended: 20, recommendedBadges: ['VIS'], recommendedSub: 1, confidence: 'low', coverage: '8% below target', coverageWeeks: 2.9, coverageTarget: 6, nextEvent: { name: 'UK weekly replenishment', date: '16/06/2026' }, salesL7: 1, salesL30: 2, salesL90: 5, forecast: 0.54, stockouts: '0 → 1', locations: '2 → 1', overstocks: '3 → 0', understocks: '2 → 0', status: 'needs_review_from_user', currentUnits: 15, currentUnitsInTransit: 2, warehouseAllocateLine: '50 → 45', warehouseSellLine: '68 → 61', packMultiple: 10, skuCount: 1, isVirtualPack: true, rrp: 120, ws: 8, season: 'AW25', event: 'Continuity', firstSalesDate: '19th Sep 25', lifeToDateSales: 67, department: 'Bucket bags', subDepartment: 'Foulard', material: 'Cachemire', gender: 'Femme' },
    // Mixed pack + loose replen + rebal — pen opens edit modal (loose only)
    { id: 6, name: 'Ang-sac pte main s', sku: 'A1252811', colour: 'Figue', movementType: ["replenishment","rebalancing"], transfers: 24, transfersSub: 1, packTransfers: 20, looseTransfers: 2, replenTransfers: 22, rebalTransfers: 2, approvedTransfers: 12, unapprovedTransfers: 10, revenue: '€0.65K', recommended: 1, recommendedBadges: ['REV'], recommendedSub: 1, confidence: 'low', coverage: '67% below target', coverageWeeks: 1.4, coverageTarget: 6, nextEvent: { name: 'Europe monthly', date: '09/06/2026' }, salesL7: 0, salesL30: 1, salesL90: 3, forecast: 0.21, stockouts: '0 → 0', locations: '2 → 2', overstocks: '4 → 1', understocks: '3 → 1', status: 'partially_approved', currentUnits: 7, currentUnitsInTransit: 0, warehouseAllocateLine: '57 → 44', warehouseSellLine: '57 → 51', packMultiple: 10, skuCount: 1, isVirtualPack: false, rrp: 750, ws: 12, season: 'Winter 26', event: 'Vague 2', firstSalesDate: '5th Dec 25', lifeToDateSales: 14, department: 'Handbags', subDepartment: 'Sac à main', material: 'Cuir verni', gender: 'Femme' },
    // Multi-SKU pack-constrained replen — read-only on Products row
    { id: 9, name: 'Coin-pack tote m', sku: 'C900010', colour: 'Noir', movementType: ["replenishment"], transfers: 55, transfersSub: 2, approvedTransfers: 28, unapprovedTransfers: 27, revenue: '€1.10K', recommended: 55, recommendedBadges: ['VIS'], recommendedSub: 2, confidence: 'high', coverage: '4% below target', coverageWeeks: 4.2, coverageTarget: 6, nextEvent: { name: 'Europe monthly', date: '09/06/2026' }, salesL7: 2, salesL30: 8, salesL90: 22, forecast: 1.2, stockouts: '0 → 0', locations: '2 → 2', overstocks: '2 → 1', understocks: '6 → 4', status: 'unapproved', currentUnits: 22, currentUnitsInTransit: 4, warehouseAllocateLine: '60 → 52', warehouseSellLine: '70 → 62', packMultiple: 10, skuCount: 5, isVirtualPack: true, rrp: 320, ws: 0, season: 'Winter 26', event: 'Vague 1', firstSalesDate: '28th Oct 25', lifeToDateSales: 112, department: 'Handbags', subDepartment: 'Sac à main', material: 'Cuir', gender: 'Femme' },
    // Unconstrained replen — baseline non-pack path
    { id: 10, name: 'Mini sac band', sku: 'C900020', colour: 'Rouge', movementType: ["replenishment"], transfers: 3, transfersSub: 1, approvedTransfers: 2, unapprovedTransfers: 1, revenue: '€0.42K', recommended: 3, recommendedBadges: ['REV'], recommendedSub: 1, confidence: 'low', coverage: 'All SKUs in target', coverageWeeks: 6.0, coverageTarget: 6, nextEvent: { name: 'UK weekly replenishment', date: '16/06/2026' }, salesL7: 1, salesL30: 3, salesL90: 8, forecast: 0.6, stockouts: '0 → 0', locations: '1 → 1', overstocks: '1 → 0', understocks: '2 → 1', status: 'approved_by_system', currentUnits: 9, currentUnitsInTransit: 0, warehouseAllocateLine: '30 → 27', warehouseSellLine: '40 → 36', packMultiple: null, skuCount: 1, rrp: 195, ws: 48, season: 'P/e 2026', event: 'Pre', firstSalesDate: '14th Jan 26', lifeToDateSales: 6, department: 'R.t.w. donna', subDepartment: 'Accessori piccoli', material: 'Cady crepe in triacetato di poliestere', gender: 'Donna' },
    // Mixed fulfilment (pack + loose) — packTransfers drives pack subtext; total = pack + loose
    { id: 11, name: 'Gémo LOT tote', sku: 'G900100', colour: 'Camel', movementType: ["replenishment"], transfers: 58, packTransfers: 50, looseTransfers: 8, transfersSub: 2, approvedTransfers: 30, unapprovedTransfers: 28, revenue: '€0.94K', recommended: 58, recommendedBadges: ['VIS'], recommendedSub: 1, confidence: 'high', coverage: '3% below target', coverageWeeks: 3.6, coverageTarget: 6, nextEvent: { name: 'Europe monthly', date: '09/06/2026' }, salesL7: 2, salesL30: 7, salesL90: 19, forecast: 1.1, stockouts: '0 → 0', locations: '2 → 2', overstocks: '2 → 1', understocks: '5 → 3', status: 'unapproved', currentUnits: 14, currentUnitsInTransit: 2, warehouseAllocateLine: '62 → 54', warehouseSellLine: '74 → 66', packMultiple: 10, skuCount: 1, isVirtualPack: false, rrp: 280, ws: 0, season: 'Winter 26', event: 'Vague 1', firstSalesDate: '2nd Aug 25', lifeToDateSales: 88, department: 'Handbags', subDepartment: 'Sac à main', material: 'Cuir végétal tanné à la main avec finition naturelle', gender: 'Femme' },
  ],
  2: [
    { id: 7, name: 'Sac zip l', sku: 'B200001', colour: 'Noir', movementType: ["rebalancing"], transfers: 2, transfersSub: 1, approvedTransfers: 2, unapprovedTransfers: 0, revenue: '€0.89K', recommended: 2, recommendedBadges: ['REV'], recommendedSub: 1, confidence: 'high', coverage: '3% below target', coverageWeeks: 4.8, coverageTarget: 6, nextEvent: { name: 'Europe monthly', date: '09/06/2026' }, salesL7: 1, salesL30: 2, salesL90: 5, forecast: 0.45, stockouts: '0 → 0', locations: '2 → 2', overstocks: '2 → 1', understocks: '5 → 3', status: 'approved_by_user', approvedByUser: 'Jess Briggs', currentUnits: 18, currentUnitsInTransit: 4, warehouseAllocateLine: '40 → 36', warehouseSellLine: '50 → 45', packMultiple: null, skuCount: 1, rrp: 460, ws: 163, season: 'P/e 2026', event: 'Main', firstSalesDate: '30th Apr 25', lifeToDateSales: 54, department: 'Maroquinerie', subDepartment: 'Porte-documents', material: 'Tissu technique enduit', gender: 'Homme' },
    { id: 8, name: 'Sac seau m', sku: 'B200002', colour: 'Noir', movementType: ["rebalancing"], transfers: 1, transfersSub: 2, approvedTransfers: 0, unapprovedTransfers: 1, revenue: '€0.52K', recommended: 1, recommendedBadges: ['VIS'], recommendedSub: 2, confidence: 'high', coverage: 'All SKUs in target', coverageWeeks: 6.3, coverageTarget: 6, nextEvent: { name: 'Europe monthly', date: '09/06/2026' }, salesL7: 0, salesL30: 1, salesL90: 3, forecast: 0.28, stockouts: '0 → 1', locations: '1 → 2', overstocks: '1 → 0', understocks: '3 → 1', status: 'last_edited_by_user', editedByUser: 'Csabi Toth', currentUnits: 11, currentUnitsInTransit: 2, warehouseAllocateLine: '35 → 30', warehouseSellLine: '42 → 38', packMultiple: null, skuCount: 1, rrp: 210, ws: 72, season: 'AW25', event: 'Flash', firstSalesDate: '11th Jul 25', lifeToDateSales: 31, department: 'R.t.w. donna', subDepartment: 'Pant.lunghi donna', material: 'Jersey di cotone', gender: 'Donna' },
  ],
  // Trip 3 — Printemps toulon → Opéra (replen-heavy)
  3: [
    { id: 20, name: 'Croi-sac zip l', sku: 'T3-1398810', colour: 'Noir', movementType: ["replenishment"], transfers: 8, transfersSub: 1, approvedTransfers: 8, unapprovedTransfers: 0, revenue: '€0.92K', recommended: 8, recommendedBadges: ['REV'], recommendedSub: 1, confidence: 'high', coverage: 'All SKUs in target', coverageWeeks: 6.0, coverageTarget: 6, nextEvent: { name: 'Europe monthly', date: '09/06/2026' }, salesL7: 1, salesL30: 3, salesL90: 7, forecast: 0.9, stockouts: '0 → 0', locations: '1 → 1', overstocks: '1 → 0', understocks: '2 → 1', status: 'approved_by_system', currentUnits: 10, currentUnitsInTransit: 0, warehouseAllocateLine: '40 → 36', warehouseSellLine: '50 → 45', packMultiple: null, skuCount: 1, rrp: 420, ws: 0, season: 'SS26', event: 'Drop 3', firstSalesDate: '12th Mar 25', lifeToDateSales: 22, department: 'Crossbody', subDepartment: 'Bandoulière', material: 'Nylon', gender: 'Unisexe', skuConfidenceBuckets: { veryHigh: 1, high: 0, medium: 0, low: 0, veryLow: 0 }, skuCoverageSummary: { inTarget: 1, total: 1 } },
    { id: 21, name: 'Pre-sac seau m', sku: 'T3-101080', colour: 'Bleu', movementType: ["replenishment"], transfers: 10, transfersSub: 1, approvedTransfers: 4, unapprovedTransfers: 6, revenue: '€0.55K', recommended: 10, recommendedBadges: ['VIS'], recommendedSub: 1, confidence: 'low', coverage: '12% below target', coverageWeeks: 2.8, coverageTarget: 6, nextEvent: { name: 'UK weekly replenishment', date: '16/06/2026' }, salesL7: 2, salesL30: 4, salesL90: 9, forecast: 0.7, stockouts: '0 → 1', locations: '2 → 1', overstocks: '2 → 0', understocks: '3 → 1', status: 'needs_review_from_user', currentUnits: 6, currentUnitsInTransit: 1, warehouseAllocateLine: '30 → 25', warehouseSellLine: '40 → 34', packMultiple: 10, skuCount: 1, isVirtualPack: true, rrp: 85, ws: 0, season: 'Winter 26', event: 'Vague 2', firstSalesDate: '3rd Nov 25', lifeToDateSales: 14, department: 'Bucket bags', subDepartment: 'Seau', material: 'Laine', gender: 'Femme', skuConfidenceBuckets: { veryHigh: 0, high: 0, medium: 0, low: 1, veryLow: 0 }, skuCoverageSummary: { inTarget: 0, total: 1 } },
    { id: 22, name: 'Mini sac band', sku: 'T3-900020', colour: 'Rouge', movementType: ["rebalancing"], transfers: 2, transfersSub: 1, approvedTransfers: 0, unapprovedTransfers: 2, revenue: '€0.28K', recommended: 2, recommendedBadges: ['REV'], recommendedSub: 1, confidence: 'high', coverage: 'All SKUs in target', coverageWeeks: 5.5, coverageTarget: 6, nextEvent: { name: 'Europe monthly', date: '09/06/2026' }, salesL7: 0, salesL30: 2, salesL90: 5, forecast: 0.4, stockouts: '0 → 0', locations: '1 → 1', overstocks: '0 → 0', understocks: '1 → 0', status: 'unapproved', currentUnits: 4, currentUnitsInTransit: 0, warehouseAllocateLine: '20 → 18', warehouseSellLine: '28 → 26', packMultiple: null, skuCount: 1, rrp: 195, ws: 48, season: 'P/e 2026', event: 'Pre', firstSalesDate: '14th Jan 26', lifeToDateSales: 8, department: 'R.t.w. donna', subDepartment: 'Accessori piccoli', material: 'Cady', gender: 'Donna', skuConfidenceBuckets: { veryHigh: 0, high: 1, medium: 0, low: 0, veryLow: 0 }, skuCoverageSummary: { inTarget: 1, total: 1 } },
    { id: 23, name: 'Ang-sac pte main m', sku: 'T3-1252810', colour: 'Figue', movementType: ["replenishment", "rebalancing"], transfers: 6, transfersSub: 1, approvedTransfers: 3, unapprovedTransfers: 3, revenue: '€0.71K', recommended: 6, recommendedBadges: ['REV', 'VIS'], recommendedSub: 1, confidence: 'low', coverage: '8% below target', coverageWeeks: 3.2, coverageTarget: 6, nextEvent: { name: 'Europe monthly', date: '09/06/2026' }, salesL7: 1, salesL30: 3, salesL90: 8, forecast: 1.1, stockouts: '1 → 0', locations: '2 → 2', overstocks: '2 → 1', understocks: '4 → 2', status: 'partially_approved', currentUnits: 9, currentUnitsInTransit: 2, warehouseAllocateLine: '35 → 30', warehouseSellLine: '45 → 40', packMultiple: null, skuCount: 2, rrp: 890, ws: 0, season: 'Winter 26', event: 'Vague 1', firstSalesDate: '22nd Jan 26', lifeToDateSales: 19, department: 'Handbags', subDepartment: 'Sac à main', material: 'Cuir', gender: 'Femme', skuConfidenceBuckets: { veryHigh: 0, high: 0, medium: 1, low: 1, veryLow: 0 }, skuCoverageSummary: { inTarget: 1, total: 2 } },
  ],
  // Trip 5 — Bruxelles → Opéra (mixed)
  5: [
    { id: 24, name: 'Coin-pack tote m', sku: 'T5-900010', colour: 'Noir', movementType: ["replenishment"], transfers: 30, transfersSub: 2, approvedTransfers: 15, unapprovedTransfers: 15, revenue: '€0.88K', recommended: 30, recommendedBadges: ['VIS'], recommendedSub: 1, confidence: 'high', coverage: '5% below target', coverageWeeks: 4.0, coverageTarget: 6, nextEvent: { name: 'Europe monthly', date: '09/06/2026' }, salesL7: 2, salesL30: 6, salesL90: 15, forecast: 1.0, stockouts: '0 → 0', locations: '2 → 2', overstocks: '1 → 0', understocks: '3 → 2', status: 'partially_approved', currentUnits: 14, currentUnitsInTransit: 3, warehouseAllocateLine: '45 → 40', warehouseSellLine: '55 → 50', packMultiple: 10, skuCount: 5, isVirtualPack: true, rrp: 320, ws: 0, season: 'Winter 26', event: 'Vague 1', firstSalesDate: '28th Oct 25', lifeToDateSales: 60, department: 'Handbags', subDepartment: 'Sac à main', material: 'Cuir', gender: 'Femme', skuConfidenceBuckets: { veryHigh: 1, high: 1, medium: 1, low: 1, veryLow: 1 }, skuCoverageSummary: { inTarget: 2, total: 5 } },
    { id: 25, name: 'Gémo LOT tote', sku: 'T5-900100', colour: 'Camel', movementType: ["replenishment"], transfers: 20, transfersSub: 1, approvedTransfers: 8, unapprovedTransfers: 12, revenue: '€0.64K', recommended: 20, recommendedBadges: ['VIS'], recommendedSub: 1, confidence: 'low', coverage: '10% below target', coverageWeeks: 3.1, coverageTarget: 6, nextEvent: { name: 'Europe monthly', date: '09/06/2026' }, salesL7: 1, salesL30: 4, salesL90: 11, forecast: 0.8, stockouts: '0 → 0', locations: '1 → 2', overstocks: '2 → 1', understocks: '4 → 2', status: 'unapproved', currentUnits: 8, currentUnitsInTransit: 1, warehouseAllocateLine: '38 → 32', warehouseSellLine: '48 → 42', packMultiple: 10, skuCount: 1, isVirtualPack: false, rrp: 280, ws: 0, season: 'Winter 26', event: 'Vague 1', firstSalesDate: '2nd Aug 25', lifeToDateSales: 40, department: 'Handbags', subDepartment: 'Sac à main', material: 'Cuir', gender: 'Femme', skuConfidenceBuckets: { veryHigh: 0, high: 0, medium: 0, low: 2, veryLow: 1 }, skuCoverageSummary: { inTarget: 0, total: 3 } },
    { id: 26, name: 'Croi-sac zip s', sku: 'T5-1398811', colour: 'Noir', movementType: ["rebalancing"], transfers: 3, transfersSub: 1, approvedTransfers: 3, unapprovedTransfers: 0, revenue: '€0.41K', recommended: 3, recommendedBadges: ['REV'], recommendedSub: 1, confidence: 'high', coverage: 'All SKUs in target', coverageWeeks: 6.2, coverageTarget: 6, nextEvent: { name: 'Europe monthly', date: '09/06/2026' }, salesL7: 0, salesL30: 1, salesL90: 4, forecast: 0.35, stockouts: '0 → 0', locations: '1 → 1', overstocks: '1 → 0', understocks: '1 → 0', status: 'approved_by_user', approvedByUser: 'Jess Briggs', currentUnits: 5, currentUnitsInTransit: 0, warehouseAllocateLine: '22 → 20', warehouseSellLine: '30 → 28', packMultiple: null, skuCount: 1, rrp: 380, ws: 25, season: 'SS26', event: 'Drop 1', firstSalesDate: '8th Feb 26', lifeToDateSales: 12, department: 'Crossbody', subDepartment: 'Bandoulière', material: 'Cuir', gender: 'Homme', skuConfidenceBuckets: { veryHigh: 1, high: 0, medium: 0, low: 0, veryLow: 0 }, skuCoverageSummary: { inTarget: 1, total: 1 } },
  ],
  // Trip 7 — Miramas → Romans (full-dataset trip)
  7: [
    { id: 27, name: 'Pre-sac seau s', sku: 'T7-101081', colour: 'Bleu petrole', movementType: ["replenishment"], transfers: 40, transfersSub: 1, approvedTransfers: 40, unapprovedTransfers: 0, revenue: '€1.2K', recommended: 40, recommendedBadges: ['VIS'], recommendedSub: 1, confidence: 'high', coverage: '3% below target', coverageWeeks: 4.5, coverageTarget: 6, nextEvent: { name: 'UK weekly replenishment', date: '16/06/2026' }, salesL7: 3, salesL30: 9, salesL90: 22, forecast: 1.4, stockouts: '0 → 0', locations: '2 → 2', overstocks: '2 → 1', understocks: '5 → 3', status: 'approved_by_system', currentUnits: 20, currentUnitsInTransit: 4, warehouseAllocateLine: '70 → 60', warehouseSellLine: '85 → 75', packMultiple: 10, skuCount: 1, isVirtualPack: true, rrp: 120, ws: 8, season: 'AW25', event: 'Continuity', firstSalesDate: '19th Sep 25', lifeToDateSales: 80, department: 'Bucket bags', subDepartment: 'Foulard', material: 'Cachemire', gender: 'Femme', skuConfidenceBuckets: { veryHigh: 0, high: 2, medium: 0, low: 0, veryLow: 0 }, skuCoverageSummary: { inTarget: 1, total: 2 } },
    { id: 28, name: 'Ang-sac pte main s', sku: 'T7-1252811', colour: 'Figue', movementType: ["replenishment", "rebalancing"], transfers: 14, transfersSub: 1, packTransfers: 10, looseTransfers: 2, replenTransfers: 12, rebalTransfers: 2, approvedTransfers: 7, unapprovedTransfers: 7, revenue: '€0.58K', recommended: 14, recommendedBadges: ['REV'], recommendedSub: 1, confidence: 'low', coverage: '20% below target', coverageWeeks: 2.0, coverageTarget: 6, nextEvent: { name: 'Europe monthly', date: '09/06/2026' }, salesL7: 0, salesL30: 2, salesL90: 6, forecast: 0.5, stockouts: '0 → 1', locations: '2 → 2', overstocks: '3 → 1', understocks: '4 → 2', status: 'last_edited_by_user', editedByUser: 'Csabi Toth', currentUnits: 7, currentUnitsInTransit: 0, warehouseAllocateLine: '40 → 34', warehouseSellLine: '50 → 44', packMultiple: 10, skuCount: 1, isVirtualPack: false, rrp: 750, ws: 12, season: 'Winter 26', event: 'Vague 2', firstSalesDate: '5th Dec 25', lifeToDateSales: 18, department: 'Handbags', subDepartment: 'Sac à main', material: 'Cuir', gender: 'Femme', skuConfidenceBuckets: { veryHigh: 0, high: 0, medium: 0, low: 1, veryLow: 1 }, skuCoverageSummary: { inTarget: 0, total: 2 } },
    { id: 29, name: 'Mini sac band', sku: 'T7-900021', colour: 'Noir', movementType: ["rebalancing"], transfers: 5, transfersSub: 1, approvedTransfers: 5, unapprovedTransfers: 0, revenue: '€0.33K', recommended: 5, recommendedBadges: ['REV'], recommendedSub: 1, confidence: 'high', coverage: 'All SKUs in target', coverageWeeks: 6.1, coverageTarget: 6, nextEvent: { name: 'Europe monthly', date: '09/06/2026' }, salesL7: 1, salesL30: 2, salesL90: 6, forecast: 0.45, stockouts: '0 → 0', locations: '1 → 1', overstocks: '0 → 0', understocks: '1 → 0', status: 'approved_by_user', approvedByUser: 'Jess Briggs', currentUnits: 8, currentUnitsInTransit: 1, warehouseAllocateLine: '25 → 22', warehouseSellLine: '32 → 29', packMultiple: null, skuCount: 1, rrp: 195, ws: 40, season: 'P/e 2026', event: 'Pre', firstSalesDate: '14th Jan 26', lifeToDateSales: 11, department: 'R.t.w. donna', subDepartment: 'Accessori piccoli', material: 'Cady', gender: 'Donna', skuConfidenceBuckets: { veryHigh: 1, high: 0, medium: 0, low: 0, veryLow: 0 }, skuCoverageSummary: { inTarget: 1, total: 1 } },
    { id: 30, name: 'Croi-sac zip l', sku: 'T7-1398812', colour: 'Camel', movementType: ["rebalancing"], transfers: 4, transfersSub: 1, approvedTransfers: 2, unapprovedTransfers: 2, revenue: '€0.49K', recommended: 4, recommendedBadges: ['VIS'], recommendedSub: 1, confidence: 'medium', coverage: '4% below target', coverageWeeks: 4.8, coverageTarget: 6, nextEvent: { name: 'Europe monthly', date: '09/06/2026' }, salesL7: 1, salesL30: 3, salesL90: 7, forecast: 0.6, stockouts: '0 → 0', locations: '2 → 1', overstocks: '1 → 0', understocks: '2 → 1', status: 'needs_review_from_user', currentUnits: 6, currentUnitsInTransit: 0, warehouseAllocateLine: '28 → 24', warehouseSellLine: '36 → 32', packMultiple: null, skuCount: 1, rrp: 420, ws: 0, season: 'SS26', event: 'Drop 2', firstSalesDate: '1st Apr 25', lifeToDateSales: 25, department: 'Crossbody', subDepartment: 'Bandoulière', material: 'Nylon', gender: 'Unisexe', skuConfidenceBuckets: { veryHigh: 0, high: 0, medium: 1, low: 0, veryLow: 0 }, skuCoverageSummary: { inTarget: 0, total: 1 } },
    { id: 31, name: 'Gémo LOT tote', sku: 'T7-900101', colour: 'Noir', movementType: ["replenishment"], transfers: 25, transfersSub: 1, approvedTransfers: 10, unapprovedTransfers: 15, revenue: '€0.77K', recommended: 25, recommendedBadges: ['VIS'], recommendedSub: 1, confidence: 'low', coverage: '7% below target', coverageWeeks: 3.4, coverageTarget: 6, nextEvent: { name: 'Europe monthly', date: '09/06/2026' }, salesL7: 2, salesL30: 5, salesL90: 14, forecast: 0.95, stockouts: '0 → 0', locations: '2 → 2', overstocks: '2 → 1', understocks: '3 → 2', status: 'unapproved', currentUnits: 11, currentUnitsInTransit: 2, warehouseAllocateLine: '50 → 44', warehouseSellLine: '60 → 54', packMultiple: 10, skuCount: 1, isVirtualPack: false, rrp: 280, ws: 0, season: 'Winter 26', event: 'Vague 1', firstSalesDate: '2nd Aug 25', lifeToDateSales: 55, department: 'Handbags', subDepartment: 'Sac à main', material: 'Cuir', gender: 'Femme', skuConfidenceBuckets: { veryHigh: 0, high: 1, medium: 1, low: 2, veryLow: 1 }, skuCoverageSummary: { inTarget: 1, total: 5 } },
  ],
  // Trip 8 — Troyes → Grenoble (unapproved-heavy)
  8: [
    { id: 32, name: 'Ang-sac pte main m', sku: 'T8-1252810', colour: 'Figue', movementType: ["rebalancing"], transfers: 7, transfersSub: 1, approvedTransfers: 0, unapprovedTransfers: 7, revenue: '€1.05K', recommended: 7, recommendedBadges: ['REV', 'VIS'], recommendedSub: 1, confidence: 'high', coverage: '6% below target', coverageWeeks: 3.5, coverageTarget: 6, nextEvent: { name: 'Europe monthly', date: '09/06/2026' }, salesL7: 2, salesL30: 5, salesL90: 12, forecast: 1.3, stockouts: '1 → 0', locations: '2 → 2', overstocks: '3 → 1', understocks: '5 → 3', status: 'unapproved', currentUnits: 12, currentUnitsInTransit: 2, warehouseAllocateLine: '42 → 36', warehouseSellLine: '55 → 48', packMultiple: null, skuCount: 2, rrp: 890, ws: 0, season: 'Winter 26', event: 'Vague 1', firstSalesDate: '22nd Jan 26', lifeToDateSales: 30, department: 'Handbags', subDepartment: 'Sac à main', material: 'Cuir', gender: 'Femme', skuConfidenceBuckets: { veryHigh: 0, high: 2, medium: 0, low: 0, veryLow: 0 }, skuCoverageSummary: { inTarget: 0, total: 2 } },
    { id: 33, name: 'Pre-sac seau m', sku: 'T8-101080', colour: 'Vert', movementType: ["replenishment"], transfers: 15, transfersSub: 1, approvedTransfers: 0, unapprovedTransfers: 15, revenue: '€0.62K', recommended: 15, recommendedBadges: ['VIS'], recommendedSub: 1, confidence: 'low', coverage: '15% below target', coverageWeeks: 2.5, coverageTarget: 6, nextEvent: { name: 'UK weekly replenishment', date: '16/06/2026' }, salesL7: 1, salesL30: 3, salesL90: 8, forecast: 0.65, stockouts: '0 → 1', locations: '1 → 1', overstocks: '1 → 0', understocks: '3 → 1', status: 'unapproved', currentUnits: 5, currentUnitsInTransit: 1, warehouseAllocateLine: '28 → 22', warehouseSellLine: '36 → 30', packMultiple: 10, skuCount: 1, isVirtualPack: true, rrp: 85, ws: 0, season: 'Winter 26', event: 'Vague 2', firstSalesDate: '3rd Nov 25', lifeToDateSales: 16, department: 'Bucket bags', subDepartment: 'Seau', material: 'Laine', gender: 'Femme', skuConfidenceBuckets: { veryHigh: 0, high: 0, medium: 0, low: 0, veryLow: 1 }, skuCoverageSummary: { inTarget: 0, total: 1 } },
    { id: 34, name: 'Coin-pack tote m', sku: 'T8-900010', colour: 'Camel', movementType: ["replenishment"], transfers: 22, transfersSub: 1, approvedTransfers: 5, unapprovedTransfers: 17, revenue: '€0.71K', recommended: 22, recommendedBadges: ['VIS'], recommendedSub: 1, confidence: 'medium', coverage: 'All SKUs in target', coverageWeeks: 5.8, coverageTarget: 6, nextEvent: { name: 'Europe monthly', date: '09/06/2026' }, salesL7: 1, salesL30: 4, salesL90: 10, forecast: 0.85, stockouts: '0 → 0', locations: '2 → 1', overstocks: '1 → 0', understocks: '2 → 1', status: 'needs_review_from_user', currentUnits: 9, currentUnitsInTransit: 0, warehouseAllocateLine: '33 → 28', warehouseSellLine: '42 → 37', packMultiple: 10, skuCount: 3, isVirtualPack: true, rrp: 320, ws: 0, season: 'Winter 26', event: 'Vague 1', firstSalesDate: '28th Oct 25', lifeToDateSales: 44, department: 'Handbags', subDepartment: 'Sac à main', material: 'Cuir', gender: 'Femme', skuConfidenceBuckets: { veryHigh: 0, high: 1, medium: 2, low: 0, veryLow: 0 }, skuCoverageSummary: { inTarget: 3, total: 3 } },
    { id: 35, name: 'Croi-sac zip s', sku: 'T8-1398811', colour: 'Rouge', movementType: ["rebalancing"], transfers: 2, transfersSub: 1, approvedTransfers: 0, unapprovedTransfers: 2, revenue: '€0.25K', recommended: 2, recommendedBadges: ['REV'], recommendedSub: 1, confidence: 'high', coverage: '9% below target', coverageWeeks: 3.0, coverageTarget: 6, nextEvent: { name: 'Europe monthly', date: '09/06/2026' }, salesL7: 0, salesL30: 1, salesL90: 3, forecast: 0.3, stockouts: '0 → 0', locations: '1 → 1', overstocks: '0 → 0', understocks: '2 → 1', status: 'unapproved', currentUnits: 3, currentUnitsInTransit: 0, warehouseAllocateLine: '15 → 13', warehouseSellLine: '20 → 18', packMultiple: null, skuCount: 1, rrp: 380, ws: 25, season: 'SS26', event: 'Drop 1', firstSalesDate: '8th Feb 26', lifeToDateSales: 7, department: 'Crossbody', subDepartment: 'Bandoulière', material: 'Cuir', gender: 'Homme', skuConfidenceBuckets: { veryHigh: 0, high: 1, medium: 0, low: 0, veryLow: 0 }, skuCoverageSummary: { inTarget: 0, total: 1 } },
  ]
}



/** Per-product SKU-location confidence buckets + coverage summary (Products tab). */
const PRODUCT_SKU_LOCATION_METRICS = {
  1: {
    skuConfidenceBuckets: { veryHigh: 1, high: 0, medium: 0, low: 0, veryLow: 0 },
    skuCoverageSummary: { inTarget: 1, total: 1 },
  },
  2: {
    skuConfidenceBuckets: { veryHigh: 0, high: 1, medium: 0, low: 0, veryLow: 0 },
    skuCoverageSummary: { inTarget: 0, total: 1 },
  },
  3: {
    skuConfidenceBuckets: { veryHigh: 1, high: 1, medium: 0, low: 0, veryLow: 0 },
    skuCoverageSummary: { inTarget: 1, total: 2 },
  },
  4: {
    skuConfidenceBuckets: { veryHigh: 1, high: 0, medium: 0, low: 0, veryLow: 0 },
    skuCoverageSummary: { inTarget: 1, total: 1 },
  },
  5: {
    skuConfidenceBuckets: { veryHigh: 0, high: 0, medium: 0, low: 1, veryLow: 0 },
    skuCoverageSummary: { inTarget: 0, total: 1 },
  },
  6: {
    skuConfidenceBuckets: { veryHigh: 0, high: 0, medium: 0, low: 1, veryLow: 1 },
    skuCoverageSummary: { inTarget: 0, total: 2 },
  },
  7: {
    skuConfidenceBuckets: { veryHigh: 0, high: 1, medium: 0, low: 0, veryLow: 0 },
    skuCoverageSummary: { inTarget: 0, total: 1 },
  },
  8: {
    skuConfidenceBuckets: { veryHigh: 1, high: 0, medium: 0, low: 0, veryLow: 0 },
    skuCoverageSummary: { inTarget: 1, total: 1 },
  },
  9: {
    skuConfidenceBuckets: { veryHigh: 1, high: 1, medium: 1, low: 1, veryLow: 1 },
    skuCoverageSummary: { inTarget: 3, total: 5 },
  },
  10: {
    skuConfidenceBuckets: { veryHigh: 0, high: 0, medium: 1, low: 0, veryLow: 0 },
    skuCoverageSummary: { inTarget: 1, total: 1 },
  },
  11: {
    skuConfidenceBuckets: { veryHigh: 0, high: 1, medium: 2, low: 3, veryLow: 2 },
    skuCoverageSummary: { inTarget: 2, total: 8 },
  },
}

Object.values(PRODUCTS_BY_TRIP).forEach((list) => {
  list.forEach((p) => {
    const metrics = PRODUCT_SKU_LOCATION_METRICS[p.id]
    if (metrics) Object.assign(p, metrics)
  })
})

// Default products when trip not in PRODUCTS_BY_TRIP
const DEFAULT_PRODUCTS = PRODUCTS_BY_TRIP[1]

function findProductByName(productName) {
  for (const products of Object.values(PRODUCTS_BY_TRIP)) {
    const match = products.find((p) => p.name === productName)
    if (match) return match
  }
  return DEFAULT_PRODUCTS.find((p) => p.name === productName) ?? null
}

// Product IDs that show 'Edited' badge in Products drilldown
const PRODUCTS_EDITED_IDS = [1, 3]

// Mock locations for stock analysis drilldown (keyed by product id)
const LOCATIONS_BY_PRODUCT = {
  1: [
    { id: 1, name: 'Opéra', code: 'A1A', movementType: ["rebalancing"], stock: '6 → 12', tu: '6 → 12', tuWarehouse: 6, tuTruck: [3, 3], tuReplen: [2], salesL7: 1, salesL30: 2, forecast: 1.87, stockouts: '0 → 0', coverage: '0% → 100%', targetWeeks: 6, receivingWeeksCoverage: '3.2 → 6.4 (6 target)', recommendationReason: 'Increase revenue', revenueIncrease: '€679', availableToSend: 4, sendingStock: '10 → 7', sendingCoverage: '2.1 → 1.8 (4 target)', approvalStatus: 'approved_by_system', storageCapacity: 'available' },
    { id: 2, name: 'G.L. Haussmann Maro', code: 'AIA', movementType: ["rebalancing"], stock: '6 → 6', tu: '4 → 5', tuWarehouse: 3, tuTruck: [1], tuReplen: [2], salesL7: 0, salesL30: 0, forecast: 0, stockouts: '0 → 0', coverage: '0% → 0%', targetWeeks: 4, receivingWeeksCoverage: 'N/A (0 forecast)', recommendationReason: 'Reduce overstock', revenueIncrease: '€120', availableToSend: 3, sendingStock: '8 → 5', sendingCoverage: 'N/A (0 forecast)', storageCapacity: 'full' },
    { id: 3, name: 'La Défense', code: 'A2B', movementType: ["rebalancing"], stock: '5 → 5', tu: '4 → 5', tuWarehouse: 3, tuTruck: [1], tuReplen: [1], salesL7: 1, salesL30: 1, forecast: 0.76, stockouts: '0 → 0', coverage: '100% → 100%', targetWeeks: 4, receivingWeeksCoverage: '5.2 → 5.8 (4 target)', recommendationReason: 'Increase revenue', revenueIncrease: '€245', availableToSend: 4, sendingStock: '9 → 6', sendingCoverage: '1.8 → 1.2 (4 target)', approvalStatus: 'edited_by_user', editedByUser: 'Csabi Toth', storageCapacity: 'available' },
    { id: 4, name: 'Cap 3000', code: 'A3E', movementType: ["replenishment","rebalancing"], stock: '4 → 4', tu: '0 → 1', tuWarehouse: null, tuTruck: [1], salesL7: 0, salesL30: 2, forecast: 0.32, stockouts: '0 → 0', coverage: '0% → 0%', targetWeeks: 4, receivingWeeksCoverage: 'N/A (0 forecast)', recommendationReason: 'Improve coverage', revenueIncrease: '€89', availableToSend: 2, sendingStock: '6 → 5', sendingCoverage: 'N/A (0 forecast)', approvalStatus: 'approved_by_user', approvedByUser: 'Jess Briggs', storageCapacity: 'full' },
    { id: 5, name: 'Lyon Herriot', code: 'A4C', movementType: ["rebalancing"], stock: '5 → 5', tu: '0 → 1', tuWarehouse: null, tuTruck: [1], tuReplen: [], salesL7: 1, salesL30: 1, forecast: 0.54, stockouts: '0 → 0', coverage: '0% → 0%', targetWeeks: 4, receivingWeeksCoverage: '4.1 → 4.5 (4 target)', recommendationReason: 'Increase revenue', revenueIncrease: '€156', availableToSend: 3, sendingStock: '7 → 6', sendingCoverage: '2.4 → 2.0 (4 target)', storageCapacity: 'available' },
    { id: 6, name: 'Printemps Lille', code: 'ASF', movementType: ["rebalancing"], stock: '8 → 8', tu: '0 → 20', tuWarehouse: 4, tuTruck: [20], tuReplen: [1], salesL7: 2, salesL30: 4, forecast: 2.1, stockouts: '0 → 0', coverage: '100% → 100%', targetWeeks: 6, receivingWeeksCoverage: '3.8 → 6.2 (6 target)', recommendationReason: 'Increase revenue', revenueIncrease: '€1.2K', availableToSend: 5, sendingStock: '12 → 8', sendingCoverage: '3.2 → 2.1 (6 target)', approvalStatus: 'approved_by_system', storageCapacity: 'available' },
  ],
  2: [
    { id: 1, name: 'Opéra', code: 'A1A', movementType: ["rebalancing"], stock: '4 → 4', tu: '4 → 4', tuWarehouse: 4, tuTruck: [], salesL7: 2, salesL30: 3, forecast: 0.54, stockouts: '0 → 0', coverage: '100% → 100%', targetWeeks: 4, receivingWeeksCoverage: '5.2 → 5.2 (4 target)', recommendationReason: 'Increase revenue', revenueIncrease: '€312', availableToSend: 4, sendingStock: '8 → 4', sendingCoverage: '2.0 → 1.0 (4 target)', approvalStatus: 'approved_by_user', approvedByUser: 'Jess Briggs', storageCapacity: 'full' },
    { id: 2, name: 'La Défense', code: 'A2B', movementType: ["rebalancing"], stock: '3 → 3', tu: '3 → 3', tuWarehouse: 3, tuTruck: [], salesL7: 1, salesL30: 2, forecast: 0.45, stockouts: '0 → 0', coverage: '100% → 100%', targetWeeks: 4, receivingWeeksCoverage: '4.1 → 4.1 (4 target)', recommendationReason: 'Reduce understock', revenueIncrease: '€98', availableToSend: 3, sendingStock: '6 → 3', sendingCoverage: '1.5 → 0.8 (4 target)', approvalStatus: 'edited_by_user', editedByUser: 'Csabi Toth', storageCapacity: 'available' },
  ],
  3: [
    { id: 1, name: 'Opéra', code: 'A1A', movementType: ["rebalancing"], stock: '6 → 6', tu: '6 → 6', tuWarehouse: 6, tuTruck: [], salesL7: 1, salesL30: 4, forecast: 2.1, stockouts: '0 → 0', coverage: '100% → 100%', targetWeeks: 6, receivingWeeksCoverage: '2.9 → 2.9 (6 target)', recommendationReason: 'Increase revenue', revenueIncrease: '€445', availableToSend: 6, sendingStock: '12 → 6', sendingCoverage: '2.8 → 1.4 (6 target)', storageCapacity: 'available' },
    { id: 2, name: 'G.L. Haussmann Maro', code: 'AIA', movementType: ["rebalancing"], stock: '5 → 5', tu: '5 → 5', tuWarehouse: 5, tuTruck: [], salesL7: 0, salesL30: 0, forecast: 0, stockouts: '0 → 0', coverage: '0% → 0%', targetWeeks: 5, receivingWeeksCoverage: 'N/A (0 forecast)', recommendationReason: 'Improve coverage', revenueIncrease: '€0', availableToSend: 5, sendingStock: '10 → 5', sendingCoverage: 'N/A (0 forecast)', approvalStatus: 'approved_by_system', storageCapacity: 'full' },
  ],
  // G.1 stubs — structural pack shapes; G.2 reconciles exact Products/Explorer totals
  5: [
    {
      id: 1,
      name: 'Opéra',
      code: 'A1A',
      movementType: ['replenishment'],
      stock: '8 → 28',
      tu: '0 → 20',
      tuWarehouse: 12,
      tuTruck: [],
      tuReplen: [10, 10],
      sohBySize: { S: 8 },
      salesL7: 1,
      salesL30: 2,
      forecast: 0.54,
      stockouts: '0 → 0',
      coverage: '40% → 100%',
      targetWeeks: 6,
      receivingWeeksCoverage: '2.1 → 6.2 (6 target)',
      recommendationReason: 'Improve coverage',
      revenueIncrease: '€210',
      availableToSend: 8,
      sendingStock: '40 → 20',
      sendingCoverage: '3.0 → 1.5 (4 target)',
      approvalStatus: 'needs_review_from_user',
      storageCapacity: 'available',
    },
    {
      id: 2,
      name: 'Cap 3000',
      code: 'A3E',
      movementType: ['replenishment'],
      stock: '4 → 14',
      tu: '0 → 10',
      tuWarehouse: 6,
      tuTruck: [],
      tuReplen: [10],
      sohBySize: { S: 4 },
      salesL7: 0,
      salesL30: 1,
      forecast: 0.32,
      stockouts: '0 → 0',
      coverage: '20% → 80%',
      targetWeeks: 4,
      receivingWeeksCoverage: '1.0 → 4.5 (4 target)',
      recommendationReason: 'Improve coverage',
      revenueIncrease: '€95',
      availableToSend: 5,
      sendingStock: '30 → 20',
      sendingCoverage: '2.0 → 1.2 (4 target)',
      approvalStatus: 'unapproved',
      storageCapacity: 'available',
    },
  ],
  9: [
    {
      id: 1,
      name: 'Opéra',
      code: 'A1A',
      movementType: ['replenishment'],
      stock: '10 → 38',
      tu: '0 → 28',
      tuWarehouse: 18,
      tuTruck: [],
      // PACK-COIN-P1: 4 packs × 7 units (S/M/L ratio 2/3/2)
      packMultiple: 7,
      tuReplen: [7, 7, 7, 7],
      // Aggregate before stock = 10; after = 10 + 28 pack units
      sohBySize: { XS: 1, S: 2, M: 3, L: 2, XL: 2 },
      salesL7: 2,
      salesL30: 8,
      forecast: 1.2,
      stockouts: '0 → 0',
      coverage: '0% → 67%',
      targetWeeks: 6,
      receivingWeeksCoverage: '1.6 → 6.5 (6 target)',
      // Per-SKU weeks after pack delivery (P1). 2 of 3 sizes at/above target → ~67%.
      skuCoverageWeeks: {
        S: { before: 1.5, after: 6.8 },
        M: { before: 2.0, after: 7.2 },
        L: { before: 1.2, after: 5.4 },
      },
      recommendationReason: 'Increase revenue',
      revenueIncrease: '€420',
      availableToSend: 12,
      sendingStock: '60 → 32',
      sendingCoverage: '4.0 → 2.0 (6 target)',
      approvalStatus: 'unapproved',
      storageCapacity: 'available',
    },
    {
      id: 2,
      name: 'Cap 3000',
      code: 'A3E',
      movementType: ['replenishment'],
      stock: '8 → 35',
      tu: '0 → 27',
      tuWarehouse: 14,
      tuTruck: [],
      // PACK-COIN-P2: 3 packs × 9 units (XS/S/M/L/XL ratio 1/2/3/2/1)
      packMultiple: 9,
      tuReplen: [9, 9, 9],
      // Aggregate before stock = 8; after = 8 + 27 pack units
      sohBySize: { XS: 1, S: 1, M: 2, L: 2, XL: 2 },
      salesL7: 1,
      salesL30: 5,
      forecast: 0.9,
      stockouts: '0 → 0',
      coverage: '0% → 60%',
      targetWeeks: 6,
      receivingWeeksCoverage: '1.4 → 6.3 (6 target)',
      // Per-SKU weeks after P2 delivery. 3 of 5 sizes at/above target → 60%.
      skuCoverageWeeks: {
        XS: { before: 1.0, after: 6.5 },
        S: { before: 1.5, after: 7.0 },
        M: { before: 2.0, after: 7.5 },
        L: { before: 1.8, after: 5.2 },
        XL: { before: 0.8, after: 5.0 },
      },
      recommendationReason: 'Improve coverage',
      revenueIncrease: '€310',
      availableToSend: 10,
      sendingStock: '55 → 28',
      sendingCoverage: '3.5 → 1.8 (6 target)',
      approvalStatus: 'unapproved',
      storageCapacity: 'available',
    },
  ],
  11: [
    {
      id: 1,
      name: 'Opéra',
      code: 'A1A',
      movementType: ['replenishment'],
      stock: '6 → 29',
      tu: '0 → 23',
      tuWarehouse: 10,
      tuTruck: [],
      tuReplen: [10, 10],
      tuReplenLoose: [3],
      sohBySize: { S: 6 },
      salesL7: 2,
      salesL30: 7,
      forecast: 1.1,
      stockouts: '0 → 0',
      coverage: '0% → 100%',
      targetWeeks: 6,
      receivingWeeksCoverage: '1.8 → 6.5 (6 target)',
      recommendationReason: 'Improve coverage',
      revenueIncrease: '€310',
      availableToSend: 9,
      sendingStock: '55 → 32',
      sendingCoverage: '3.5 → 2.0 (6 target)',
      approvalStatus: 'unapproved',
      storageCapacity: 'available',
    },
    {
      id: 2,
      name: 'Cap 3000',
      code: 'A3E',
      movementType: ['replenishment'],
      stock: '5 → 40',
      tu: '0 → 35',
      tuWarehouse: 8,
      tuTruck: [],
      tuReplen: [10, 10, 10],
      tuReplenLoose: [5],
      sohBySize: { S: 5 },
      salesL7: 1,
      salesL30: 4,
      forecast: 0.9,
      stockouts: '0 → 0',
      coverage: '0% → 100%',
      targetWeeks: 6,
      receivingWeeksCoverage: '1.5 → 6.2 (6 target)',
      recommendationReason: 'Improve coverage',
      revenueIncrease: '€280',
      availableToSend: 7,
      sendingStock: '50 → 15',
      sendingCoverage: '3.0 → 1.0 (6 target)',
      approvalStatus: 'unapproved',
      storageCapacity: 'available',
    },
  ],
}

const DEFAULT_LOCATIONS = LOCATIONS_BY_PRODUCT[1]

/**
 * G.3a pack-product drilldown layout meta (ids 5 / 9 / 11 only).
 * Non-pack products and Ang-sac (id 6) keep the classic TU-column layout.
 */
const PACK_DRILLDOWN_META = {
  5: {
    sizes: ['S'],
    warehouse: {
      id: 'log01',
      name: 'Log01 entrepot logtex',
      code: 'LOG01',
      stock: '—',
      sohBySize: { S: 48 },
      storageCapacity: 'available',
      forecast: 0,
      weeksCoverage: 8.0,
      targetWeeks: 6,
    },
  },
  9: {
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    warehouse: {
      id: 'log01',
      name: 'Log01 entrepot logtex',
      code: 'LOG01',
      stock: '—',
      // Enough SOH to cover P1 (28) + P2 (27) outgoing by size
      sohBySize: { XS: 12, S: 40, M: 50, L: 40, XL: 12 },
      storageCapacity: 'available',
      forecast: 0,
      weeksCoverage: 12.0,
      targetWeeks: 6,
    },
  },
  11: {
    sizes: ['S'],
    warehouse: {
      id: 'log01',
      name: 'Log01 entrepot logtex',
      code: 'LOG01',
      stock: '—',
      sohBySize: { S: 80 },
      storageCapacity: 'available',
      forecast: 0,
      weeksCoverage: 10.0,
      targetWeeks: 6,
    },
  },
}

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

/** Hardcoded sending-location capacity for Explorer overcommit detection (prototype) */
const SENDING_LOCATION_CAPACITY = {
  // Raised so seeded pack replen (single-SKU + multi-SKU) leaves headroom for "available to send"
  'Log01 entrepot logtex': 2000,
  Opéra: 50,
  'G.L. Haussmann Maro': 50,
  'La Défense': 50,
  'Cap 3000': 50,
  'Lyon Herriot': 50,
  'Printemps Lille': 50,
}

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
    // Replen rows are single-SKU packs (packMultiple: 10); rebal stays unconstrained
    movementTypes: ['replenishment', 'rebalancing'],
    packMultiple: 10,
    isVirtualPack: true },
  {
    id: 'exp-p-coin',
    name: 'Coin-pack tote m',
    baseSku: 'C900010',
    colour: 'Noir',
    department: 'Handbags',
    subDepartment: 'Sac à main',
    material: 'Cuir',
    gender: 'Femme',
    rrp: '€320',
    ws: '€0',
    ic: '€28',
    seasonAndEvent: 'Winter 26 · Vague 1',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    movementTypes: ['replenishment'] },
  {
    id: 'exp-p-gemo',
    name: 'Gémo LOT tote',
    baseSku: 'G900100',
    colour: 'Camel',
    department: 'Handbags',
    subDepartment: 'Sac à main',
    material: 'Cuir',
    gender: 'Femme',
    rrp: '€280',
    ws: '€0',
    ic: '€24',
    seasonAndEvent: 'Winter 26 · Vague 1',
    sizes: ['S'],
    movementTypes: ['replenishment'],
    packMultiple: 10,
    isVirtualPack: false,
    // Mixed fulfilment demo: same SKU×from×to×movement splits into pack + loose rows
    mixedFulfilmentByStore: {
      Opéra: { pack: 20, loose: 3 },
      'Cap 3000': { pack: 30, loose: 5 },
    },
  },
]

/**
 * Multi-SKU pack groups for Coin-pack (C900010).
 * packMultiple is pack-group-specific (P1=7, P2=9); product-level packMultiple stays 10 for single-SKU fallback.
 */
const EXPLORER_MULTI_SKU_PACKS = [
  {
    packGroupId: 'pack-coin-p1',
    packName: 'Coin-pack P1',
    packId: 'PACK-COIN-P1',
    packCount: 4,
    packMultiple: 7,
    toLocation: 'Opéra',
    isVirtualPack: true,
    packRatio: {
      'C900010-S': 2,
      'C900010-M': 3,
      'C900010-L': 2,
    },
    packRevenue: '+€1,420',
    packRecommended: 4,
    packRecommendedBadges: ['REV'],
    packConfidence: 'high',
    packCoverageWeeksBefore: 1.2,
    packCoverageWeeksAfter: 3.4,
    packCoverageTarget: 4,
    packCoverageLabel: 'weeks of cover',
    packStorageCapacity: 'available',
    packStatus: 'unapproved',
  },
  {
    packGroupId: 'pack-coin-p2',
    packName: 'Coin-pack P2',
    packId: 'PACK-COIN-P2',
    packCount: 3,
    packMultiple: 9,
    toLocation: 'Cap 3000',
    isVirtualPack: true,
    packRatio: {
      'C900010-XS': 1,
      'C900010-S': 2,
      'C900010-M': 3,
      'C900010-L': 2,
      'C900010-XL': 1,
    },
    packRevenue: '+€980',
    packRecommended: 3,
    packRecommendedBadges: ['VIS'],
    packConfidence: 'high',
    packCoverageWeeksBefore: 1.0,
    packCoverageWeeksAfter: 3.1,
    packCoverageTarget: 4,
    packCoverageLabel: 'weeks of cover',
    packStorageCapacity: 'available',
    packStatus: 'unapproved',
  },
]

/** @deprecated Prefer EXPLORER_MULTI_SKU_PACKS — kept as P1 alias for any residual single-pack reads */
const EXPLORER_MULTI_SKU_PACK = EXPLORER_MULTI_SKU_PACKS[0]

function getMultiSkuPacksForProduct(product) {
  if (!product) return []
  const sku = product.sku || product.baseSku
  if (product.id === 9 || product.id === 'exp-p-coin' || sku === 'C900010') {
    return EXPLORER_MULTI_SKU_PACKS
  }
  return []
}

function findMultiSkuPackByLocation(locationName) {
  return EXPLORER_MULTI_SKU_PACKS.find((p) => p.toLocation === locationName) ?? null
}

function findMultiSkuPackByGroupId(packGroupId) {
  return EXPLORER_MULTI_SKU_PACKS.find((p) => p.packGroupId === packGroupId) ?? null
}

const DEPARTMENT_FILTER_OPTIONS = ['Handbags', 'Crossbody', 'Bucket bags']

const MOVEMENT_TYPE_FILTER_OPTIONS = [
  { id: 'replenishment', label: 'Replenishment' },
  { id: 'rebalancing', label: 'Rebalancing' },
]

const CONFIDENCE_FILTER_OPTIONS = [
  { id: 'high', label: 'High' },
  { id: 'low', label: 'Low' },
]

const STATUS_CYCLE = [
  'approved_by_system', 'approved_by_system', 'approved_by_system',
  'unapproved', 'unapproved', 'unapproved',
  'needs_review_from_user', 'needs_review_from_user',
  'last_edited_by_user', 'last_edited_by_user',
  'approved_by_user',
]

const CONFIDENCE_CYCLE = ['high', 'high', 'high', 'low']
const BADGE_CYCLE = [['REV'], ['VIS'], ['REV', 'VIS'], ['REV'], ['VIS']]

function buildExplorerRow(rowIndex, product, size, fromLoc, toLoc, movementType, options = {}) {
  const coverageWeeksBefore = Number((1 + (rowIndex * 1.3) % 5).toFixed(1))
  const coverageWeeksAfter = Number((coverageWeeksBefore + 0.5 + (rowIndex % 4) * 0.8).toFixed(1))
  const salesL7 = ((rowIndex * 2) % 15) + 1
  const salesL30 = salesL7 * 5
  const salesL90 = salesL7 * 12
  const transfers = options.transfers != null ? options.transfers : 1 + (rowIndex * 3) % 15
  // Usually headroom (green); every 7th row is constrained (orange by default).
  const availableToSend =
    rowIndex % 7 === 0 ? Math.max(0, transfers - 2 - (rowIndex % 3)) : transfers + 2 + (rowIndex % 5)
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
  const otherMovements =
    movementType === 'rebalancing'
      ? null
      : rowIndex % 10 < 3
        ? (() => {
            const variant = rowIndex % 3
            if (variant === 0) return { rebalCount: 1 + (rowIndex % 3), replenCount: 0 }
            if (variant === 1) return { rebalCount: 0, replenCount: 1 + (rowIndex % 2) }
            return { rebalCount: 1 + (rowIndex % 2), replenCount: 1 + (rowIndex % 3) }
          })()
        : null
  // Aligned with otherMovements: only replen rows that already show "Other movements" in the hover card
  const stockFromOtherStores =
    otherMovements != null ? 4 + (rowIndex % 5) * 2 : null // 4–12 units from other stores
  // Small (~8–15) or larger (~45–54) bases; "why so big" rows start lower (~5–8)
  const stockBefore =
    stockFromOtherStores != null
      ? 5 + (rowIndex % 4)
      : rowIndex % 5 === 0
        ? 45 + (rowIndex % 10)
        : 8 + (rowIndex % 8)
  // Single-SKU pack: only Log01 → store replen; pack fulfilment only (explicit or inferred)
  const canBePackFulfilment =
    movementType === 'replenishment' &&
    fromLoc === EXPLORER_WAREHOUSE &&
    product.packMultiple != null &&
    product.packMultiple > 0
  // Default: pack when product can pack (preserves Pre-sac / Coin-pack); explicit 'loose' for mixed companions
  const fulfilmentType = options.fulfilmentType ?? (canBePackFulfilment ? 'pack' : 'loose')
  const isPackFulfilment = canBePackFulfilment && fulfilmentType === 'pack'
  const packMultiple = isPackFulfilment ? product.packMultiple : null
  const isVirtualPack = isPackFulfilment ? Boolean(product.isVirtualPack) : false
  const alignedTransfers = packMultiple
    ? options.transfers != null
      ? options.transfers
      : Math.max(packMultiple, Math.round(transfers / packMultiple) * packMultiple)
    : transfers
  const stockAfter = stockBefore + alignedTransfers + (stockFromOtherStores ?? 0)
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
    fromLocation: fromLoc,
    toLocation: toLoc,
    movementType,
    fulfilmentType,
    transfers: alignedTransfers,
    packMultiple,
    isVirtualPack,
    availableToSend,
    visibilityBefore: rowIndex % 11 === 0 ? 2 : rowIndex % 5 === 0 ? 1 : 0,
    visibilityAfter: rowIndex % 11 === 0 ? 3 : rowIndex % 5 === 0 ? 2 : 1,
    otherMovements,
    stockBefore,
    stockAfter,
    stockFromOtherStores,
    revenue: `€${(0.5 + (rowIndex * 0.37) % 4.5).toFixed(2)}K`,
    recommended: '1',
    recommendedBadges: BADGE_CYCLE[rowIndex % BADGE_CYCLE.length],
    recommendedSub: rowIndex % 3 === 0 ? '2' : undefined,
    confidence: CONFIDENCE_CYCLE[rowIndex % CONFIDENCE_CYCLE.length],
    coverageWeeksBefore,
    coverageWeeksAfter,
    nextEvent: {
      name: rowIndex % 2 === 0 ? 'No event' : 'Rebal cycle',
      date: SCHEDULE_CREATION_DATE,
    },
    salesL7,
    salesL30,
    salesL90,
    currentUnits: 10 + (rowIndex * 5) % 50,
    currentUnitsInTransit: rowIndex % 6,
    stockInTransitAndPfp: rowIndex % 11,
    storageCapacity: rowIndex % 4 === 0 ? 'full' : 'available',
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

/** Pair key for mixed pack+loose fulfilment lanes (SKU × from × to × movement). */
function explorerMixedFulfilmentPairKey(row) {
  return `${row.productId}|${row.sku}|${row.fromLocation}|${row.toLocation}|${row.movementType}`
}

function buildExplorerData() {
  const rows = []
  let rowIndex = 0

  EXPLORER_PRODUCTS.forEach((product) => {
    product.sizes.forEach((size) => {
      product.movementTypes.forEach((movementType) => {
        if (movementType === 'replenishment' && product.mixedFulfilmentByStore) {
          // Mixed-fulfilment products: only seeded stores; pack + loose as separate rows
          const mixedByStore = product.mixedFulfilmentByStore
          const packOnlyStores = product.packOnlyStores ?? {}
          const looseOnlyStores = product.looseOnlyStores ?? {}
          EXPLORER_STORES.forEach((store) => {
            const mixed = mixedByStore[store]
            if (mixed) {
              rows.push(
                buildExplorerRow(rowIndex++, product, size, EXPLORER_WAREHOUSE, store, 'replenishment', {
                  fulfilmentType: 'pack',
                  transfers: mixed.pack,
                })
              )
              rows.push(
                buildExplorerRow(rowIndex++, product, size, EXPLORER_WAREHOUSE, store, 'replenishment', {
                  fulfilmentType: 'loose',
                  transfers: mixed.loose,
                })
              )
              return
            }
            if (packOnlyStores[store] != null) {
              rows.push(
                buildExplorerRow(rowIndex++, product, size, EXPLORER_WAREHOUSE, store, 'replenishment', {
                  fulfilmentType: 'pack',
                  transfers: packOnlyStores[store],
                })
              )
              return
            }
            if (looseOnlyStores[store] != null) {
              rows.push(
                buildExplorerRow(rowIndex++, product, size, EXPLORER_WAREHOUSE, store, 'replenishment', {
                  fulfilmentType: 'loose',
                  transfers: looseOnlyStores[store],
                })
              )
            }
          })
        } else if (movementType === 'replenishment') {
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

  // Annotate multi-SKU pack members (Log01 → pack destination). Pack rows are display-only.
  for (const row of rows) {
    if (row.movementType !== 'replenishment' || row.fromLocation !== EXPLORER_WAREHOUSE) continue
    const packDef = EXPLORER_MULTI_SKU_PACKS.find(
      (p) => p.toLocation === row.toLocation && p.packRatio[row.sku] != null
    )
    if (!packDef) continue
    const unitsPerPack = packDef.packRatio[row.sku]
    row.packGroupId = packDef.packGroupId
    row.packName = packDef.packName
    row.packId = packDef.packId
    row.packRatio = packDef.packRatio
    row.packCount = packDef.packCount
    row.packGroupMultiple = packDef.packMultiple
    row.isVirtualPack = Boolean(packDef.isVirtualPack)
    row.isPackMember = true
    row.packMultiple = null
    row.transfers = unitsPerPack * packDef.packCount
    row.stockAfter = row.stockBefore + row.transfers + (row.stockFromOtherStores ?? 0)
    // Coin pack children: end-state coverage reflects pack arrival (stock / forecast weeks)
    if (row.productId === 'exp-p-coin') {
      const weeklyDemand = Number(row.forecast) > 0 ? Number(row.forecast) : 0.5
      row.coverageWeeksBefore = Number((row.stockBefore / weeklyDemand).toFixed(1))
      row.coverageWeeksAfter = Number((row.stockAfter / weeklyDemand).toFixed(1))
    }
  }

  // Coin-pack: only show annotated pack-member replen rows (drop stray size×store noise)
  return rows.filter((row) => {
    if (row.productId === 'exp-p-coin' && row.movementType === 'replenishment') {
      return Boolean(row.isPackMember)
    }
    return true
  })
}

function isExplorerPackRowId(rowId) {
  return typeof rowId === 'string' && rowId.startsWith('pack-row-')
}

/** Resolve member SKU-row ids for a pack-row-* selection id from source EXPLORER_DATA. */
function getPackMemberIds(packRowId, skuRows = []) {
  if (!isExplorerPackRowId(packRowId)) return []
  const packGroupId = packRowId.slice('pack-row-'.length)
  if (packGroupId.startsWith('single-')) {
    return [packGroupId.slice('single-'.length)]
  }
  return skuRows.filter((r) => r.packGroupId === packGroupId).map((r) => r.id)
}

/** True if any pack member has an active transfer override ≠ original. */
function packRowHasOverride(packRow, explorerTransferOverrides = {}, skuRows = []) {
  const ids = packRow?.allMemberIds?.length ? packRow.allMemberIds : packRow?.memberIds ?? []
  if (!ids.length) return false
  const byId = new Map(skuRows.map((r) => [r.id, r]))
  return ids.some((id) => {
    const member = byId.get(id)
    if (!member) return false
    return explorerRowHasPackUnitOverride(member, explorerTransferOverrides)
  })
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
  { id: 'approved_by_system', displayLabel: 'System approved', dotClass: 'bg-[#08a16a]' },
  { id: 'approved_by_user', displayLabel: 'User approved', dotClass: 'bg-[#08a16a]' },
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
  high: {
    label: 'High',
    badgeClass: 'bg-[#e4f4ef] text-[#0a0a0a] border-[#08a16a]',
    dotClass: 'bg-[#08a16a]' },
  low: {
    label: 'Low',
    badgeClass: 'bg-[#ffe4cc] text-[#0a0a0a] border-[#bd5800]',
    dotClass: 'bg-[#bd5800]' } }

function ConfidencePill({ value }) {
  const cfg = CONFIDENCE_PILL_CONFIG[value] || CONFIDENCE_PILL_CONFIG.high
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-[6px] border text-[12px] font-medium border-transparent ${cfg.badgeClass}`}
    >
      <span className={`size-2 rounded-full shrink-0 ${cfg.dotClass}`} aria-hidden />
      <span className="truncate">{cfg.label}</span>
    </span>
  )
}

const CONFIDENCE_BUCKET_ORDER = [
  { key: 'veryHigh', label: 'Very high', color: '#166534', textColor: '#ffffff' },
  { key: 'high', label: 'High', color: '#08a16a', textColor: '#ffffff' },
  { key: 'medium', label: 'Medium', color: '#9ca3af', textColor: '#ffffff' },
  { key: 'low', label: 'Low', color: '#eab308', textColor: '#0a0a0a' },
  { key: 'veryLow', label: 'Very low', color: '#f87171', textColor: '#0a0a0a' },
]

function emptyConfidenceBuckets() {
  return { veryHigh: 0, high: 0, medium: 0, low: 0, veryLow: 0 }
}

/** Most-frequent bucket; ties → worst among tied (later in CONFIDENCE_BUCKET_ORDER). */
function pickDominantConfidenceBucket(buckets) {
  let max = -1
  const winners = []
  for (const b of CONFIDENCE_BUCKET_ORDER) {
    const n = Number(buckets?.[b.key]) || 0
    if (n > max) {
      max = n
      winners.length = 0
      winners.push(b)
    } else if (n === max) {
      winners.push(b)
    }
  }
  if (max <= 0 || winners.length === 0) return null
  return winners[winners.length - 1]
}

function ConfidenceDominantPill({ buckets, muted = false }) {
  const dominant = pickDominantConfidenceBucket(buckets)
  if (!dominant) {
    return <span className="text-[12px] text-[#9ca3af]">—</span>
  }
  return (
    <span
      className="inline-flex items-center px-2 py-1 rounded-[6px] text-[12px] font-medium"
      style={
        muted
          ? { backgroundColor: '#f3f4f6', color: '#9ca3af' }
          : { backgroundColor: dominant.color, color: dominant.textColor }
      }
    >
      {dominant.label}
    </span>
  )
}

/** Products-tab confidence hover — all five buckets including zeros. */
function ConfidenceBreakdownHoverCard({ buckets }) {
  return (
    <div className="pointer-events-none w-[min(260px,calc(100vw-1.5rem))] rounded-[8px] border border-[#E9EAEB] bg-white p-3 shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
      <div className="mb-2.5 text-[13px] font-semibold text-[#0a0a0a]">Confidence breakdown</div>
      <div className="flex flex-col gap-2">
        {CONFIDENCE_BUCKET_ORDER.map((b) => {
          const count = Number(buckets?.[b.key]) || 0
          return (
            <div key={b.key} className="flex items-center justify-between gap-3 text-[12px]">
              <span className="inline-flex min-w-0 items-center gap-2 text-[#4b535c]">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: b.color }}
                  aria-hidden
                />
                <span>{b.label}</span>
              </span>
              <span className="shrink-0 tabular-nums text-[#0a0a0a]">
                {count} SKU-location{count === 1 ? '' : 's'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ConfidenceLabelWithHover({ buckets, muted = false }) {
  return (
    <TuHoverPopover panel={<ConfidenceBreakdownHoverCard buckets={buckets} />}>
      <ConfidenceDominantPill buckets={buckets} muted={muted} />
    </TuHoverPopover>
  )
}

function StorageCapacityPill({ value, stale = false }) {
  if (stale) {
    return (
      <span className="inline-flex max-w-full items-center justify-center rounded-full bg-[#F2F4F7] px-2.5 py-1 text-[12px] font-medium text-[#9ca3af]">
        {value === 'full' ? 'Full' : value === 'saturated' ? 'Saturated' : 'Available'}
      </span>
    )
  }
  if (value === 'full') {
    return (
      <span className="inline-flex max-w-full items-center justify-center rounded-full bg-[#FEE4E2] px-2.5 py-1 text-[12px] font-medium text-[#B42318]">
        Full
      </span>
    )
  }
  if (value === 'saturated') {
    return (
      <span className="inline-flex max-w-full items-center justify-center rounded-full bg-[#FEF0C7] px-2.5 py-1 text-[12px] font-medium text-[#B54708]">
        Saturated
      </span>
    )
  }
  return (
    <span className="inline-flex max-w-full items-center justify-center rounded-full bg-[#F2F4F7] px-2.5 py-1 text-[12px] font-medium text-[#101828]">
      Available
    </span>
  )
}

/** True when a "before → after" string represents an active move (values differ). */
function isActiveMoveValue(value) {
  if (value == null) return false
  const parts = String(value).split(/\s*→\s*/)
  if (parts.length !== 2) return false
  return parts[0].trim() !== parts[1].trim()
}

/** Renders before→after in bold when active-move; regular weight when static. */
function BeforeAfterText({ value, className = '' }) {
  if (value == null || value === '') {
    return <span className={`text-[#4b535c] ${className}`}>—</span>
  }
  const active = isActiveMoveValue(value)
  return (
    <span
      className={`${active ? 'font-bold' : 'font-normal'} text-[#0a0a0a] ${className}`.trim()}
    >
      {value}
    </span>
  )
}

/** Coverage primary (% SKUs at/above target before→after) + muted numeric weeks subcopy. */
function DrilldownCoverageCell({ coverage, targetWeeks }) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <BeforeAfterText value={coverage} className="text-[14px]" />
      {targetWeeks != null && targetWeeks !== '' ? (
        <span className="text-[12px] font-normal text-[#4b535c]">{targetWeeks}</span>
      ) : null}
    </div>
  )
}

function ProductCoverageText({ coverageWeeks, coverageTarget, coverage, stale = false }) {
  if (coverageWeeks == null || coverageTarget == null) {
    return <span className={`text-[14px] ${stale ? 'text-[#9ca3af]' : 'text-[#4b535c]'}`}>N/A</span>
  }
  const isBelowTarget = coverage?.includes('below target')
  const badgeText = isBelowTarget ? coverage.replace(' below target', ' of SKUs below target') : coverage
  if (!coverage) return null
  return (
    <div className="flex flex-col items-end gap-1">
      <span
        className={`px-1.5 py-0.5 rounded-[4px] text-[11px] font-medium ${
          stale
            ? 'bg-[#f3f4f6] text-[#9ca3af]'
            : isBelowTarget
              ? 'bg-[#fee2e2] text-[#E30D3C]'
              : 'bg-[#dcfce7] text-[#166534]'
        }`}
      >
        {badgeText}
      </span>
    </div>
  )
}

/** Products tab only — event name + batch creation date stand-in (SCHEDULE_CREATION_DATE). */
function ProductNextEventProductsCell({ nextEvent }) {
  if (!nextEvent?.name) return null
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-[13px] font-medium text-[#0a0a0a]">{nextEvent.name}</span>
      <span className="text-[12px] text-[#4b535c]">{SCHEDULE_CREATION_DATE}</span>
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

/** Warehouse role tag for Trips From/To cells; stores render no tag. */
function getTripLocationRoleTag(locationType, warehouseRole) {
  if (locationType !== 'warehouse') return null
  if (warehouseRole === 'selling') return 'Selling'
  if (warehouseRole === 'non-selling') return 'Warehouse'
  return null
}

function TripLocationRoleTag({ label }) {
  if (!label) return null
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-[#f8f8f8] text-[11px] font-medium text-[#0267ff]">
      {label}
    </span>
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
        <SkuDetailsAttrRow label="Department" value={row.department} />
        <SkuDetailsAttrRow label="Sub-department" value={row.subDepartment} />
        <SkuDetailsAttrRow label="Material" value={row.material} />
        <SkuDetailsAttrRow label="Gender" value={row.gender} />
      </div>
    </div>
  )
}

function ProductDetailsField({ label, value }) {
  const display = value === null || value === undefined || value === '' ? '—' : value
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-[11px] leading-snug text-[#6b7280]">{label}</span>
      <span className="break-words text-[13px] leading-snug text-[#0a0a0a]">{String(display)}</span>
    </div>
  )
}

/** Products-tab product details hover — forked from SkuDetailsHoverCard; do not use on Explorer */
function ProductDetailsHoverCard({ product }) {
  const formatEuro = (n) =>
    n === null || n === undefined || n === '' ? '—' : `€${n}`

  return (
    <div className="pointer-events-none w-[min(320px,calc(100vw-1.5rem))] rounded-[8px] border border-[#E9EAEB] bg-white p-3 shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
      <div className="mb-3 grid grid-cols-2 gap-2 rounded-[8px] bg-[#f3f4f6] px-3 py-2.5">
        <div className="flex flex-col items-center gap-0.5 text-center">
          <span className="text-[11px] leading-snug text-[#6b7280]">RRP</span>
          <span className="text-[13px] font-medium tabular-nums text-[#0a0a0a]">
            {formatEuro(product.rrp)}
          </span>
        </div>
        <div className="flex flex-col items-center gap-0.5 text-center">
          <span className="text-[11px] leading-snug text-[#6b7280]">WS</span>
          <span className="text-[13px] font-medium tabular-nums text-[#0a0a0a]">
            {formatEuro(product.ws)}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <ProductDetailsField label="Season" value={product.season} />
        <ProductDetailsField label="Event" value={product.event} />
        <ProductDetailsField label="First sale" value={product.firstSalesDate} />
        <ProductDetailsField label="Life to date sales" value={product.lifeToDateSales} />
        <ProductDetailsField label="Department" value={product.department} />
        <ProductDetailsField label="Sub-department" value={product.subDepartment} />
        <ProductDetailsField label="Material" value={product.material} />
        <ProductDetailsField label="Gender" value={product.gender} />
      </div>
    </div>
  )
}

/** Format forecast cell for live-rebal hover (receiving / sending). */
function formatHoverForecastValue(value, { zeroForecastTag = false } = {}) {
  if (value == null || value === '') return '—'
  if (zeroForecastTag && Number(value) === 0) return '0 (0 forecast)'
  return value
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

/** Explorer replen Transfers cell hover — route, this transfer, recommendation, other movements */
function ExplorerTransfersHoverCard({
  row,
  transferUnits,
  availableToSend,
  isOvercommitted,
  onOpenProductTransfers }) {
  const other = row.otherMovements
  const showOtherMovements =
    other != null && (other.rebalCount > 0 || other.replenCount > 0)

  return (
    <div className="pointer-events-auto w-[min(320px,calc(100vw-1.5rem))] max-h-[min(520px,72vh)] overflow-y-auto rounded-[6px] border border-[#E9EAEB] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
      <div className="border-b border-[#E9EAEB] pb-3 text-[14px] font-semibold leading-snug text-[#0a0a0a]">
        {row.fromLocation} → {row.toLocation}
      </div>

      <TuHoverSection title="This transfer">
        <div className="flex items-start justify-between gap-2 text-[13px]">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <TuHoverIconWrap>
              {row.movementType === 'replenishment' ? <IconReplenishment /> : <IconRebalancing />}
            </TuHoverIconWrap>
            <span className="font-medium leading-snug text-[#0a0a0a]">Movement type</span>
          </div>
          <MovementTypePills movementType={[row.movementType]} />
        </div>
        <TuHoverRow
          icon={<IconPackageTu className="!size-3.5" />}
          label="Transfer units"
          value={transferUnits}
        />
        <div className="flex items-start justify-between gap-2 text-[13px]">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <TuHoverIconWrap>
              <IconPackageTu className="!size-3.5" />
            </TuHoverIconWrap>
            <span className="font-medium leading-snug text-[#0a0a0a]">Available to send</span>
          </div>
          <span
            className={`max-w-[52%] shrink-0 rounded-[4px] px-2 py-0.5 text-right text-[11px] font-semibold leading-snug tabular-nums ${
              isOvercommitted
                ? 'bg-[#FEE4E2] text-[#B45309]'
                : 'bg-[#f3f4f6] text-[#0a0a0a]'
            }`}
          >
            {isOvercommitted ? 'Availability exceeded' : availableToSend}
          </span>
        </div>
      </TuHoverSection>

      <TuHoverSection title="Recommendation">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2 text-[13px]">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <TuHoverIconWrap>
                <IconTrendUp />
              </TuHoverIconWrap>
              <span className="font-medium leading-snug text-[#0a0a0a]">Recommended units</span>
            </div>
            <span className="shrink-0 rounded-[4px] bg-[#f3f4f6] px-2 py-0.5 text-right text-[11px] font-semibold leading-snug text-[#0a0a0a] tabular-nums">
              {row.recommended}
            </span>
          </div>
          {(row.recommendedBadges ?? []).map((badge) => {
            const reasonText =
              badge === 'REV'
                ? `Increase revenue by ${row.revenue}`
                : badge === 'VIS'
                  ? `Increase visibility at ${row.toLocation} from ${row.visibilityBefore} to ${row.visibilityAfter}`
                  : null
            if (!reasonText) return null
            return (
              <div key={badge} className="flex items-start gap-2 text-[13px]">
                <TuHoverIconWrap>
                  <IconLightbulb />
                </TuHoverIconWrap>
                <span className="min-w-0 flex-1 font-medium leading-snug text-[#0a0a0a]">{reasonText}</span>
              </div>
            )
          })}
          {row.recommendedSub != null && (
            <span className="pl-6 text-[12px] text-[#4b535c]">{row.recommendedSub}</span>
          )}
        </div>
      </TuHoverSection>

      {showOtherMovements && (
        <TuHoverSection title="Other movements">
          {other.rebalCount > 0 && (
            <div className="flex items-center gap-2 text-[13px]">
              <TuHoverIconWrap>
                <IconRebalancing />
              </TuHoverIconWrap>
              <span className="font-medium leading-snug text-[#0a0a0a]">
                +{other.rebalCount} rebalancing
              </span>
            </div>
          )}
          {other.replenCount > 0 && (
            <div className="flex items-center gap-2 text-[13px]">
              <TuHoverIconWrap>
                <IconReplenishment />
              </TuHoverIconWrap>
              <span className="font-medium leading-snug text-[#0a0a0a]">
                +{other.replenCount} replenishment
              </span>
            </div>
          )}
        </TuHoverSection>
      )}

      <div className="pt-2.5">
        <button
          type="button"
          onClick={() => onOpenProductTransfers?.(row.productName)}
          className="pointer-events-auto text-[13px] font-medium text-[#0267ff] hover:underline"
        >
          See all Transfers
        </button>
      </div>
    </div>
  )
}

function TuHoverReasonBullet({ children }) {
  return (
    <div className="flex items-start gap-2 text-[13px]">
      <TuHoverIconWrap>
        <IconLightbulb />
      </TuHoverIconWrap>
      <span className="min-w-0 flex-1 font-medium leading-snug text-[#0a0a0a]">{children}</span>
    </div>
  )
}

/** Weeks coverage for SOH hover: "6.4 (6 target)". */
function formatSohWeeksCoverageDisplay(loc, override) {
  if (override != null && override !== '' && override !== '—') {
    if (/\(\d+\s*target\)/.test(String(override))) return String(override)
  }
  const raw = String(loc?.receivingWeeksCoverage ?? '')
  const full = raw.match(/→\s*([\d.]+)\s*\((\d+)\s*target\)/)
  if (full) return `${full[1]} (${full[2]} target)`
  const after = raw.match(/→\s*([\d.]+)/)
  const target = loc?.targetWeeks
  if (after && target != null && target !== '') return `${after[1]} (${target} target)`
  if (target != null && target !== '') return `— (${target} target)`
  return override ?? '—'
}

function buildTransferHoverReasonBullets(loc) {
  const bullets = []
  if (loc?.recommendationReason) bullets.push(String(loc.recommendationReason))
  if (loc?.revenueIncrease) bullets.push(`Increase revenue by ${loc.revenueIncrease}`)
  return bullets
}

/**
 * Live-rebal hover fidelity (G.3f).
 * variant: 'transfer' (rebal/loose) | 'pack' | 'soh'
 */
function TuTruckTransferHoverCard({
  trip,
  loc,
  truckUnits,
  borderClassName,
  variant = 'transfer',
  packCompositionLine,
  packCount,
  sendingLabel,
  receivingLabel,
  onMoreDetails,
  sohLabel = 'Stock on-hand',
  sohValue,
  sohWeeksCoverage,
  sohForecast,
  sohInTransit = false,
}) {
  const from = sendingLabel ?? trip?.from ?? '—'
  const to = receivingLabel ?? loc?.name ?? trip?.to ?? '—'
  const capacityUnits = trip?.capacityUnits
  const maxCapacity = trip?.maxCapacity
  const tripCapacity =
    capacityUnits != null && maxCapacity != null
      ? `Trip capacity: ${capacityUnits} units (max ${Number(maxCapacity).toLocaleString()})`
      : null

  const moreDetails =
    typeof onMoreDetails === 'function' ? (
      <div className="pt-2.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onMoreDetails()
          }}
          className="pointer-events-auto text-[13px] font-medium text-[#0267ff] hover:underline"
        >
          More details
        </button>
      </div>
    ) : null

  if (variant === 'soh') {
    const weeksLine = formatSohWeeksCoverageDisplay(loc, sohWeeksCoverage)
    const forecastLine = formatHoverForecastValue(
      sohForecast ?? loc?.forecast,
      { zeroForecastTag: true }
    )
    const contextMessage = sohInTransit
      ? 'No transfers out recommended because stock is in transit'
      : 'No transfer proposed'
    return (
      <div
        className={`pointer-events-auto w-[min(320px,calc(100vw-1.5rem))] max-h-[min(520px,72vh)] overflow-y-auto rounded-[6px] border bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.12)] ${borderClassName}`}
      >
        <div className="border-b border-[#E9EAEB] pb-3 text-[14px] font-semibold leading-snug text-[#0a0a0a]">
          {loc?.name ?? from}
        </div>
        <div className="flex flex-col gap-1.5 border-b border-[#E9EAEB] py-2.5">
          <TuHoverRow
            icon={<IconPackageTu className="!size-3.5" />}
            label="Stock on-hand"
            value={sohValue}
          />
          <TuHoverRow icon={<IconCalendarNote />} label="Weeks coverage" value={weeksLine} />
          <TuHoverRow
            icon={<IconCalendarNote />}
            label="Forecast per week"
            value={forecastLine}
          />
        </div>
        <div className="border-b border-[#E9EAEB] py-2.5 text-[13px] font-medium leading-snug text-[#0a0a0a]">
          {contextMessage}
        </div>
        {moreDetails}
      </div>
    )
  }

  const isPack = variant === 'pack'
  const recPrimaryLabel = isPack ? 'Transfer packs' : 'Transfer units'
  const recPrimaryValue = isPack ? packCount : truckUnits
  const reasonBullets = buildTransferHoverReasonBullets(loc)
  const packBreakdown =
    packCompositionLine?.replace(/^Pack contents:\s*/i, '') ?? null
  const packTransferInfoLine =
    isPack && packCount != null && packBreakdown
      ? `Transfer packs: ${packCount} · ${packBreakdown}`
      : isPack && packCount != null
        ? `Transfer packs: ${packCount}`
        : null

  return (
    <div
      className={`pointer-events-auto w-[min(320px,calc(100vw-1.5rem))] max-h-[min(520px,72vh)] overflow-y-auto rounded-[6px] border bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.12)] ${borderClassName}`}
    >
      <div className="border-b border-[#E9EAEB] pb-3">
        <div className="text-[14px] font-semibold leading-snug text-[#0a0a0a]">
          {from} → {to}
        </div>
        {tripCapacity ? (
          <div className="mt-1 text-[12px] font-medium text-[#4b535c]">{tripCapacity}</div>
        ) : null}
      </div>

      <TuHoverSection title="Transfer info">
        {packTransferInfoLine ? (
          <div className="flex items-start gap-2 text-[13px]">
            <TuHoverIconWrap>
              <IconPackageTu className="!size-3.5" />
            </TuHoverIconWrap>
            <span className="min-w-0 flex-1 font-medium leading-snug text-[#0a0a0a]">
              {packTransferInfoLine}
            </span>
          </div>
        ) : (
          <TuHoverRow
            icon={<IconPackageTu className="!size-3.5" />}
            label="Transfer units"
            value={truckUnits}
          />
        )}
      </TuHoverSection>

      <TuHoverSection title="Recommendation">
        <TuHoverRow
          icon={isPack ? <IconReplenishment /> : <IconRebalancing />}
          label={recPrimaryLabel}
          value={recPrimaryValue}
        />
        {reasonBullets.map((text) => (
          <TuHoverReasonBullet key={text}>{text}</TuHoverReasonBullet>
        ))}
      </TuHoverSection>

      <TuHoverSection title="Forecast (per week)">
        <TuHoverRow
          icon={<IconCalendarNote />}
          label={from}
          value={formatHoverForecastValue(loc?.sendingForecast)}
        />
        <TuHoverRow
          icon={<IconCalendarNote />}
          label={to}
          value={formatHoverForecastValue(loc?.forecast, { zeroForecastTag: true })}
        />
      </TuHoverSection>

      {moreDetails}
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
  hoverPanel,
  inputError = false,
  errorMessage = null,
  inputStep,
}) {
  if (isEditing) {
    return (
      <div className="flex flex-col items-end gap-0.5">
        <input
          type="number"
          min={0}
          step={inputStep}
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
          className={`h-[26px] min-w-[50px] w-[50px] rounded-[2px] border px-[6px] py-[2px] text-[12px] font-medium text-[#0a0a0a] text-center focus:outline-none ${
            inputError ? 'border-[#E30D3C]' : 'border-[#e9eaeb]'
          }`}
        />
        {inputError && errorMessage ? (
          <span className="text-[11px] text-[#E30D3C]">{errorMessage}</span>
        ) : null}
      </div>
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
  // Empty filters = no trip-type filter applied (show all locations)
  if (!tripTypeFilters?.length) return true
  if (loc.tuWarehouse != null) return true
  const showRebal = tripTypeFilters.includes('rebalancing')
  const showReplen = tripTypeFilters.includes('replenishment')
  const truckCount = loc.tuTruck?.length ?? 0
  const replenCount = (loc.tuReplen?.length ?? 0) + (loc.tuReplenLoose?.length ?? 0)
  if (showReplen && replenCount > 0) return true
  if (showRebal && truckCount > 0) return true
  if (showRebal && truckCount === 0 && replenCount === 0) return true
  return false
}

/**
 * "% of SKUs at/above coverage target" for a drilldown location.
 * Prefer per-SKU weeks (skuCoverageWeeks) when seeded; else approximate from
 * receivingWeeksCoverage vs targetWeeks (single binary for the location).
 */
function getDrilldownSkuCoverageAtTarget(loc) {
  const target = Number(loc?.targetWeeks)
  const skuWeeks = loc?.skuCoverageWeeks
  if (skuWeeks && typeof skuWeeks === 'object' && Number.isFinite(target) && target > 0) {
    const entries = Object.values(skuWeeks)
    if (entries.length > 0) {
      let beforeAt = 0
      let afterAt = 0
      for (const entry of entries) {
        if (Number(entry?.before) >= target) beforeAt += 1
        if (Number(entry?.after) >= target) afterAt += 1
      }
      const n = entries.length
      return {
        pctLine: `${Math.round((beforeAt / n) * 100)}% → ${Math.round((afterAt / n) * 100)}%`,
        targetWeeks: target,
      }
    }
  }
  const raw = String(loc?.receivingWeeksCoverage ?? '')
  // e.g. "3.2 → 6.4 (6 target)" or "N/A (0 forecast)"
  const match = raw.match(/^([\d.]+)\s*→\s*([\d.]+)/)
  if (match && Number.isFinite(target) && target > 0) {
    const beforeW = Number(match[1])
    const afterW = Number(match[2])
    const beforePct = beforeW >= target ? 100 : 0
    const afterPct = afterW >= target ? 100 : 0
    return {
      pctLine: `${beforePct}% → ${afterPct}%`,
      targetWeeks: target,
    }
  }
  if (loc?.coverage && String(loc.coverage).includes('%') && String(loc.coverage).includes('→')) {
    return {
      pctLine: loc.coverage,
      targetWeeks: Number.isFinite(target) ? target : loc.targetWeeks,
    }
  }
  return {
    pctLine: '—',
    targetWeeks: Number.isFinite(target) ? target : loc?.targetWeeks,
  }
}

/** Pack ratio breakdown e.g. "S=2, M=3, L=2 (7 units/pack)" (no Pack contents prefix). */
function getPackCompositionLine(product, loc) {
  // Multi-SKU composition only for Coin (etc.); never bleed Opéra/Cap ratios onto Pre-sac/Gémo.
  if (getMultiSkuPacksForProduct(product).length > 0) {
    const packDef = findMultiSkuPackByLocation(loc?.name)
    if (packDef?.packRatio) {
      const parts = Object.entries(packDef.packRatio).map(([sku, n]) => {
        const size = String(sku).includes('-') ? String(sku).split('-').pop() : sku
        return `${size}=${n}`
      })
      const units =
        packDef.packMultiple ??
        Object.values(packDef.packRatio).reduce((sum, n) => sum + (Number(n) || 0), 0)
      return `${parts.join(', ')} (${units} units/pack)`
    }
  }
  const units =
    (loc?.packMultiple != null && loc.packMultiple > 0
      ? loc.packMultiple
      : product?.packMultiple) || 10
  const size = PACK_DRILLDOWN_META[product?.id]?.sizes?.[0] ?? 'S'
  return `${size}=${units} (${units} units/pack)`
}

/** Log01 packs available from SOH units ÷ pack multiple (Coin uses min multi-SKU multiple). */
function getLog01PacksAvailable(product, wh) {
  if (wh?.packsAvailable != null) return wh.packsAvailable
  const units = Object.values(wh?.sohBySize ?? {}).reduce(
    (sum, n) => sum + (Number(n) || 0),
    0
  )
  const multi = getMultiSkuPacksForProduct(product)
  const pm =
    multi.length > 0
      ? Math.min(...multi.map((p) => p.packMultiple).filter((n) => n > 0))
      : product?.packMultiple || 10
  if (!pm || pm <= 0) return 0
  return Math.floor(units / pm)
}

/** Units of `size` contributed by each pack in a multi-SKU pack ratio (e.g. C900010-S → 2). */
function getPackRatioForSize(packDef, size) {
  if (!packDef?.packRatio || !size) return 0
  for (const [sku, ratio] of Object.entries(packDef.packRatio)) {
    if (sku === size || sku.endsWith(`-${size}`)) return Number(ratio) || 0
  }
  return 0
}

/**
 * SKU units contributed by incoming packs at a receiving location for a given size.
 * `packBoxes` should be the effective pack-box array (honours locationReplenOverrides).
 */
function getPackUnitsForSize(product, location, size, packBoxes) {
  const boxes = packBoxes ?? []
  const packCount = boxes.length
  if (packCount <= 0) return 0
  const packDef = findMultiSkuPackByLocation(location?.name)
  if (packDef?.packRatio) {
    return packCount * getPackRatioForSize(packDef, size)
  }
  // Single-SKU pack products: all pack units land on the sole size column
  const sizes = PACK_DRILLDOWN_META[product?.id]?.sizes ?? []
  if (sizes.length === 1 && sizes[0] === size) {
    return sumBoxUnits(boxes)
  }
  return 0
}

/**
 * Per-size before → after for pack drilldown size cells.
 * Receiving: before = sohBySize; after = before + pack + loose + rebal.
 * Log01 (options.mode === 'log01'): after = before − outgoing pack units for that size.
 */
function getSizeBeforeAfter(location, size, product, options = {}) {
  const before = Number(location?.sohBySize?.[size]) || 0
  if (options.mode === 'log01') {
    const outgoing = Number(options.outgoingPackUnits) || 0
    const after = Math.max(0, before - outgoing)
    return { before, after, label: `${before} → ${after}` }
  }
  const packUnits =
    options.packUnits != null
      ? Number(options.packUnits) || 0
      : getPackUnitsForSize(product, location, size, options.packBoxes)
  const looseUnits = Number(options.looseUnits) || 0
  const rebalUnits = Number(options.rebalUnits) || 0
  const after = before + packUnits + looseUnits + rebalUnits
  return { before, after, label: `${before} → ${after}` }
}

/** Log01 Pack column: pack COUNT before → after (not underlying SKU units). */
function getLog01PackBeforeAfter(product, wh, packsSent) {
  const before = getLog01PacksAvailable(product, wh)
  const sent = Number(packsSent) || 0
  const after = Math.max(0, before - sent)
  return { before, after, label: `${before} → ${after}` }
}

/** Expand total units into one box per pack (each box displays packMultiple). */
function expandUnitsToPackBoxes(totalUnits, packMultiple) {
  if (!packMultiple || packMultiple <= 0) return []
  const n = Math.max(0, Math.floor((Number(totalUnits) || 0) / packMultiple))
  return Array.from({ length: n }, () => packMultiple)
}

function sumBoxUnits(boxes) {
  return (boxes ?? []).reduce((sum, n) => sum + (Number(n) || 0), 0)
}

function productHasMixedFulfilment(p) {
  return p?.packTransfers != null && p?.looseTransfers != null
}

/**
 * Parse drilldown pack-count input: integer pack count, or units that are a pack multiple.
 * Returns { packCount } or { error: true }.
 */
function parseDrilldownPackCountInput(raw, packMultiple) {
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0) return { error: true }
  if (packMultiple > 0 && isPackMultipleValue(raw, packMultiple)) {
    return { packCount: Math.round(n / packMultiple) }
  }
  if (Number.isInteger(n)) return { packCount: n }
  return { error: true }
}

/** Write Explorer transfer overrides for a product×location pack or loose edit. */
function syncExplorerFromDrilldownLocationEdit({
  product,
  locationName,
  fulfilmentType,
  units,
  packCount,
  packMultiple,
  setExplorerTransferOverrides,
}) {
  if (!setExplorerTransferOverrides) return
  const updates = {}
  const statusSkip = {}

  if (fulfilmentType === 'pack' && product.id === 9) {
    // Multi-SKU Coin-pack: resolve pack group by destination location (P1 Opéra / P2 Cap 3000)
    const packDef = findMultiSkuPackByLocation(locationName)
    if (!packDef) return
    const members = EXPLORER_DATA.filter(
      (r) =>
        r.isPackMember &&
        r.packGroupId === packDef.packGroupId &&
        r.toLocation === locationName &&
        r.movementType === 'replenishment'
    )
    const ratio = packDef.packRatio
    const unitsPerPack = packDef.packMultiple
    const count = packCount ?? Math.floor((units || 0) / (unitsPerPack || packMultiple || 1))
    for (const member of members) {
      const perPack = ratio[member.sku]
      if (perPack == null) continue
      updates[member.id] = count * perPack
    }
  } else {
    const rows = EXPLORER_DATA.filter(
      (r) =>
        r.productName === product.name &&
        r.toLocation === locationName &&
        r.movementType === 'replenishment' &&
        !r.isPackMember &&
        (fulfilmentType === 'pack'
          ? r.packMultiple != null && r.packMultiple > 0
          : (r.fulfilmentType ?? 'loose') === 'loose' && !(r.packMultiple > 0))
    )
    for (const row of rows) {
      if (fulfilmentType === 'pack') {
        const pm = row.packMultiple || packMultiple
        updates[row.id] = (packCount ?? Math.floor((units || 0) / pm)) * pm
      } else {
        updates[row.id] = units
      }
    }
  }

  if (Object.keys(updates).length === 0) return
  setExplorerTransferOverrides((prev) => ({ ...prev, ...updates }))
  void statusSkip
}

function StockAnalysisDrilldown({
  product,
  trip,
  onBack,
  setExplorerProductNameFilters,
  setActiveTab,
  productStatusOverrides,
  setProductStatusOverrides,
  setProductTransfersOverrides,
  setProductPackTransfersOverrides,
  setProductLooseTransfersOverrides,
  setProductPackCountOverrides,
  setExplorerTransferOverrides,
}) {
  const [selectedTransferDetail, setSelectedTransferDetail] = useState(null)
  const [approvedLocations, setApprovedLocations] = useState({})
  const [selectedLocationIds, setSelectedLocationIds] = useState(new Set())
  // Pack/loose box arrays per location: { [locId]: { pack?: number[], loose?: number[] } }
  const [locationReplenOverrides, setLocationReplenOverrides] = useState({})
  const [tuBoxOverrides, setTuBoxOverrides] = useState({})
  const [editingTuBoxKey, setEditingTuBoxKey] = useState(null)
  const [editingTuBoxValue, setEditingTuBoxValue] = useState('')
  const [packInputError, setPackInputError] = useState(false)
  const [drilldownTripTypeFilters, setDrilldownTripTypeFilters] = useState([])
  const [drilldownFiltersOpen, setDrilldownFiltersOpen] = useState(false)
  // G.3a.1: single active click-to-reveal cell (`${locId}-pack` | `${locId}-size-${size}` | null)
  const [activeTransferCell, setActiveTransferCell] = useState(null)
  const locations = LOCATIONS_BY_PRODUCT[product.id] || DEFAULT_LOCATIONS
  const breadcrumbFrom = `${trip.from} [${trip.fromCode}]`
  const packMultiple =
    product.packMultiple != null && product.packMultiple > 0 ? product.packMultiple : null
  const isPackProduct = packMultiple != null
  const isMixedPackProduct = isPackProduct && productHasMixedFulfilment(product)
  const packDrilldownMeta = PACK_DRILLDOWN_META[product.id] ?? null
  const usePackDrilldownLayout = Boolean(packDrilldownMeta)
  const packDrilldownSizes = packDrilldownMeta?.sizes ?? []

  /** Additive: location / pack-group multiple takes precedence; else product-level packMultiple. */
  const getLocPackMultiple = (loc) => {
    if (loc?.packMultiple != null && loc.packMultiple > 0) return loc.packMultiple
    // Only resolve pack-group multiples for multi-SKU products (Coin); never bleed onto Pre-sac/Gémo
    if (getMultiSkuPacksForProduct(product).length > 0) {
      const packDef = findMultiSkuPackByLocation(loc?.name)
      if (packDef?.packMultiple > 0) return packDef.packMultiple
    }
    return packMultiple
  }

  useEffect(() => {
    setDrilldownTripTypeFilters([])
    setLocationReplenOverrides({})
    setTuBoxOverrides({})
    setEditingTuBoxKey(null)
    setPackInputError(false)
    setActiveTransferCell(null)
  }, [product.id])

  const toggleTransferCellReveal = (cellKey) => {
    setActiveTransferCell((prev) => (prev === cellKey ? null : cellKey))
  }

  // Empty trip-type filters = show all movement boxes (Explorer-style default)
  const showRebalancing =
    drilldownTripTypeFilters.length === 0 ||
    drilldownTripTypeFilters.includes('rebalancing')
  const showReplenishment =
    drilldownTripTypeFilters.length === 0 ||
    drilldownTripTypeFilters.includes('replenishment')

  const filteredLocations = useMemo(
    () => locations.filter((loc) => locationVisibleForTripTypeFilters(loc, drilldownTripTypeFilters)),
    [locations, drilldownTripTypeFilters]
  )

  const tuBoxKey = (locId, type, index) => `${product.id}-${locId}-${type}-${index}`
  const packCountEditKey = (locId) => `${product.id}-${locId}-pack-count`

  const getEffectiveTuBoxValue = (key, baseValue) =>
    tuBoxOverrides[key] !== undefined ? tuBoxOverrides[key] : baseValue

  const getLocationPackBoxes = (loc) => {
    const override = locationReplenOverrides[loc.id]
    if (override?.pack) return override.pack
    if (isPackProduct) {
      const locPm = getLocPackMultiple(loc)
      const base = loc.tuReplen ?? []
      // Already one-box-per-pack stubs, or expand a single total
      if (base.length > 0 && locPm > 0 && base.every((n) => n === locPm)) return [...base]
      return expandUnitsToPackBoxes(sumBoxUnits(base), locPm)
    }
    return loc.tuReplen ?? []
  }

  const getLocationLooseBoxes = (loc) => {
    // Pure pack products never render loose replen boxes
    if (!isMixedPackProduct) return []
    const override = locationReplenOverrides[loc.id]
    if (override?.loose) return override.loose
    return loc.tuReplenLoose ?? []
  }

  /** Loose units for a size column (Option C: excludes pack contributions). */
  const getLocationLooseBoxesForSize = (loc, size) => {
    if (!usePackDrilldownLayout) return []
    // Single-size pack products: all loose maps to that size
    if (packDrilldownSizes.length === 1 && packDrilldownSizes[0] === size) {
      return getLocationLooseBoxes(loc)
    }
    const override = locationReplenOverrides[loc.id]
    if (override?.looseBySize?.[size]) return override.looseBySize[size]
    return loc.looseBySize?.[size] ?? []
  }

  /** Per-row TU label: for pack products, after = sum of rendered pack + loose boxes. */
  const getLocationTuDisplay = (loc) => {
    if (!isPackProduct) return loc.tu
    const before = String(loc.tu ?? '0 → 0').split(' → ')[0] ?? '0'
    const after =
      sumBoxUnits(getLocationPackBoxes(loc)) + sumBoxUnits(getLocationLooseBoxes(loc))
    return `${before} → ${after}`
  }

  const packLayoutPackCountTotal = useMemo(() => {
    if (!usePackDrilldownLayout) return { before: 0, after: 0, label: '0 → 0' }
    const after = filteredLocations.reduce(
      (sum, loc) => sum + getLocationPackBoxes(loc).length,
      0
    )
    return { before: 0, after, label: `0 → ${after}` }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredLocations, usePackDrilldownLayout, locationReplenOverrides, packMultiple])

  const packLayoutLooseTotalsBySize = useMemo(() => {
    const totals = {}
    for (const size of packDrilldownSizes) {
      // Destination rows only — Log01 never contributes to size totals.
      // Includes pack contribution + loose (+ rebal on the first size when present).
      totals[size] = filteredLocations.reduce((sum, loc) => {
        const packBoxes = getLocationPackBoxes(loc)
        const packUnits = getPackUnitsForSize(product, loc, size, packBoxes)
        const looseUnits = sumBoxUnits(getLocationLooseBoxesForSize(loc, size))
        const rebalUnits =
          showRebalancing &&
          (loc.tuTruck?.length ?? 0) > 0 &&
          packDrilldownSizes[0] === size
            ? sumBoxUnits(loc.tuTruck)
            : 0
        return sum + packUnits + looseUnits + rebalUnits
      }, 0)
    }
    return totals
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filteredLocations,
    packDrilldownSizes,
    locationReplenOverrides,
    usePackDrilldownLayout,
    showRebalancing,
    product,
  ])

  const packsSentFromLog01 = useMemo(() => {
    if (!usePackDrilldownLayout) return 0
    return filteredLocations.reduce(
      (sum, loc) => sum + getLocationPackBoxes(loc).length,
      0
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredLocations, usePackDrilldownLayout, locationReplenOverrides, packMultiple])

  const log01PackBeforeAfter = useMemo(() => {
    if (!usePackDrilldownLayout || !packDrilldownMeta?.warehouse) {
      return { before: 0, after: 0, label: '0 → 0' }
    }
    return getLog01PackBeforeAfter(
      product,
      packDrilldownMeta.warehouse,
      packsSentFromLog01
    )
  }, [usePackDrilldownLayout, packDrilldownMeta, product, packsSentFromLog01])

  const getOutgoingPackUnitsForSize = (size) =>
    filteredLocations.reduce((sum, loc) => {
      const packBoxes = getLocationPackBoxes(loc)
      return sum + getPackUnitsForSize(product, loc, size, packBoxes)
    }, 0)

  const log01SelectionId = packDrilldownMeta?.warehouse?.id ?? 'log01'

  const syncProductTotalsFromLocations = (nextLocationOverrides) => {
    if (!setProductTransfersOverrides) return
    let packUnits = 0
    let looseUnits = 0
    let packCountTotal = 0
    for (const loc of locations) {
      const ov = nextLocationOverrides[loc.id]
      const locPm = getLocPackMultiple(loc)
      const packBoxes =
        ov?.pack ??
        (isPackProduct
          ? loc.tuReplen?.every((n) => n === locPm)
            ? loc.tuReplen
            : expandUnitsToPackBoxes(sumBoxUnits(loc.tuReplen), locPm)
          : [])
      const looseBoxes = ov?.loose ?? loc.tuReplenLoose ?? []
      if (isPackProduct) {
        packUnits += sumBoxUnits(packBoxes)
        looseUnits += sumBoxUnits(looseBoxes)
        packCountTotal += (packBoxes ?? []).length
      } else {
        packUnits += sumBoxUnits(loc.tuReplen)
      }
    }
    // Non-pack products: don't rewrite product totals from location stubs
    if (!isPackProduct) return

    const total = packUnits + looseUnits
    setProductTransfersOverrides((prev) => ({ ...prev, [product.id]: total }))
    setProductPackCountOverrides?.((prev) => ({ ...prev, [product.id]: packCountTotal }))
    if (isMixedPackProduct) {
      setProductPackTransfersOverrides?.((prev) => ({ ...prev, [product.id]: packUnits }))
      setProductLooseTransfersOverrides?.((prev) => ({ ...prev, [product.id]: looseUnits }))
    }
  }

  const startEditTuBox = (key, currentValue) => {
    setEditingTuBoxKey(key)
    setEditingTuBoxValue(String(currentValue))
    setPackInputError(false)
  }

  const commitTuBoxEdit = () => {
    if (!editingTuBoxKey) return

    // Pack-count edit for a location: key = `${product.id}-${locId}-pack-count`
    if (isPackProduct && editingTuBoxKey.endsWith('-pack-count')) {
      const locationId = Number(
        editingTuBoxKey.slice(String(product.id).length + 1).replace(/-pack-count$/, '')
      )
      const loc = locations.find((l) => l.id === locationId)
      const locPm = getLocPackMultiple(loc)
      const parsed = parseDrilldownPackCountInput(editingTuBoxValue, locPm)
      if (parsed.error) {
        setPackInputError(true)
        return
      }
      const newBoxes = expandUnitsToPackBoxes(parsed.packCount * locPm, locPm)
      setLocationReplenOverrides((prev) => {
        const next = {
          ...prev,
          [locationId]: {
            pack: newBoxes,
            loose: prev[locationId]?.loose ?? (loc?.tuReplenLoose ? [...loc.tuReplenLoose] : []),
          },
        }
        queueMicrotask(() => syncProductTotalsFromLocations(next))
        return next
      })
      syncExplorerFromDrilldownLocationEdit({
        product,
        locationName: loc?.name,
        fulfilmentType: 'pack',
        packCount: parsed.packCount,
        packMultiple: locPm,
        setExplorerTransferOverrides,
      })
      setEditingTuBoxKey(null)
      setEditingTuBoxValue('')
      setPackInputError(false)
      return
    }

    // Loose replen box: `${product.id}-${locId}-replen-loose-${index}`
    if (isPackProduct && editingTuBoxKey.includes('-replen-loose-')) {
      const withoutPrefix = editingTuBoxKey.slice(String(product.id).length + 1)
      const match = withoutPrefix.match(/^(\d+)-replen-loose-(\d+)$/)
      if (!match) {
        setEditingTuBoxKey(null)
        setEditingTuBoxValue('')
        return
      }
      const locationId = Number(match[1])
      const index = Number(match[2])
      const loc = locations.find((l) => l.id === locationId)
      const parsed = parseInt(editingTuBoxValue, 10)
      const value = Number.isFinite(parsed) ? Math.max(0, parsed) : 0
      setLocationReplenOverrides((prev) => {
        const pack =
          prev[locationId]?.pack ??
          (loc ? getLocationPackBoxes(loc) : [])
        const loose = [...(prev[locationId]?.loose ?? loc?.tuReplenLoose ?? [])]
        while (loose.length <= index) loose.push(0)
        loose[index] = value
        const next = { ...prev, [locationId]: { pack, loose } }
        queueMicrotask(() => {
          syncProductTotalsFromLocations(next)
          syncExplorerFromDrilldownLocationEdit({
            product,
            locationName: loc?.name,
            fulfilmentType: 'loose',
            units: sumBoxUnits(loose),
            packMultiple,
            setExplorerTransferOverrides,
          })
        })
        return next
      })
      setTuBoxOverrides((prev) => ({ ...prev, [editingTuBoxKey]: value }))
      setEditingTuBoxKey(null)
      setEditingTuBoxValue('')
      setPackInputError(false)
      return
    }

    const parsed = parseInt(editingTuBoxValue, 10)
    const value = Number.isFinite(parsed) ? Math.max(0, parsed) : 0
    setTuBoxOverrides((prev) => ({ ...prev, [editingTuBoxKey]: value }))
    setEditingTuBoxKey(null)
    setEditingTuBoxValue('')
    setPackInputError(false)
  }

  const cancelTuBoxEdit = () => {
    setEditingTuBoxKey(null)
    setEditingTuBoxValue('')
    setPackInputError(false)
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
    const allIds = [
      ...(usePackDrilldownLayout ? [log01SelectionId] : []),
      ...filteredLocations.map((loc) => loc.id),
    ]
    const allSelected = allIds.length > 0 && allIds.every((id) => selectedLocationIds.has(id))
    setSelectedLocationIds(allSelected ? new Set() : new Set(allIds))
  }

  const clearLocationSelection = () => setSelectedLocationIds(new Set())

  const handleApproveSelectedLocations = () => {
    if (!selectedLocationIds.size) return
    setApprovedLocations((prev) => {
      const next = { ...prev }
      selectedLocationIds.forEach((id) => {
        // Log01 selection is visual-only in the prototype
        if (id === log01SelectionId) return
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
          const label = getLocationTuDisplay(loc)
          const [before, after] = String(label).split(' → ').map(Number)
          return { before: acc.before + (before || 0), after: acc.after + (after || 0) }
        },
        { before: 0, after: 0 }
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getLocationTuDisplay closes over pack helpers / overrides
    [filteredLocations, isPackProduct, isMixedPackProduct, packMultiple, locationReplenOverrides]
  )
  const summarySales = useMemo(
    () =>
      filteredLocations.reduce(
        (acc, loc) => ({
          l7: acc.l7 + (Number(loc.salesL7) || 0),
          l30: acc.l30 + (Number(loc.salesL30) || 0),
        }),
        { l7: 0, l30: 0 }
      ),
    [filteredLocations]
  )
  const summaryStockouts = useMemo(() => {
    let before = 0
    let after = 0
    let hasArrow = false
    for (const loc of filteredLocations) {
      const raw = String(loc.stockouts ?? '')
      const match = raw.match(/^([\d.]+)\s*→\s*([\d.]+)/)
      if (match) {
        before += Number(match[1]) || 0
        after += Number(match[2]) || 0
        hasArrow = true
        continue
      }
      const n = Number(raw)
      if (Number.isFinite(n)) {
        before += n
        after += n
      }
    }
    return { before, after, hasArrow }
  }, [filteredLocations])
  const summaryLocations = useMemo(() => {
    let receiving = 0
    for (const loc of filteredLocations) {
      const packUnits = sumBoxUnits(getLocationPackBoxes(loc))
      const looseUnits = sumBoxUnits(getLocationLooseBoxes(loc))
      const truckUnits = sumBoxUnits(loc.tuTruck)
      const replenUnits = !isPackProduct ? sumBoxUnits(loc.tuReplen) : 0
      if (packUnits + looseUnits + truckUnits + replenUnits > 0) receiving += 1
    }
    // Pack layout: Log01 is the sending warehouse. Non-pack: trip origin is the sender.
    const sending =
      receiving > 0 ? (usePackDrilldownLayout || trip?.from ? 1 : 0) : 0
    return { sending, receiving }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pack/loose helpers close over overrides
  }, [
    filteredLocations,
    usePackDrilldownLayout,
    trip?.from,
    isPackProduct,
    locationReplenOverrides,
  ])
  const summaryStockoutsLabel = summaryStockouts.hasArrow
    ? `${summaryStockouts.before} → ${summaryStockouts.after}`
    : String(summaryStockouts.after)
  const summaryLocationsLabel = `${summaryLocations.sending} sending → ${summaryLocations.receiving} receiving`
  const packSendingLabel =
    packDrilldownMeta?.warehouse?.name ?? 'Log01 entrepot logtex'

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
        {usePackDrilldownLayout ? (
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
                    [
                      ...(usePackDrilldownLayout ? [log01SelectionId] : []),
                      ...filteredLocations.map((loc) => loc.id),
                    ].every((id) => selectedLocationIds.has(id))
                  }
                  onChange={toggleAllLocationsSelection}
                />
              </th>
              <th className="sticky top-0 z-20 bg-white text-left py-3 px-4 font-medium text-[#00050A]">Locations</th>
              <th className="sticky top-0 z-20 bg-white text-right py-3 px-4 font-medium text-[#00050A]">
                <span className="inline-flex items-center gap-1">Stock <IconSortDown /></span>
              </th>
              <th className="sticky top-0 z-20 bg-white text-right py-3 px-4 font-medium text-[#00050A]">Pack</th>
              {packDrilldownSizes.map((size) => (
                <th
                  key={`size-h-${size}`}
                  className="sticky top-0 z-20 bg-white text-right py-3 px-4 font-medium text-[#00050A]"
                >
                  {size}
                </th>
              ))}
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
              <th className="sticky top-0 z-20 bg-white text-right py-3 px-4 font-medium text-[#00050A]">
                <span className="flex flex-col items-end">
                  Coverage
                  <span className="text-[11px] font-normal text-[#4b535c]">target weeks</span>
                </span>
              </th>
              <th className="sticky top-0 z-20 bg-white text-right py-3 px-4 font-medium text-[#00050A]">
                <span className="inline-flex items-center gap-1 justify-end">
                  Storage capacity{' '}
                  <span
                    className="inline-flex cursor-help"
                    title="The storage capacity status of the location after the recommended transfers"
                  >
                    <IconInfo />
                  </span>
                </span>
              </th>
            </tr>
            <tr className="border-b border-[#E9EAEB] bg-white">
              <th className="w-10 max-w-[40px] bg-white py-2 px-2" />
              <th className="bg-white py-2 px-4" />
              <th className="bg-white py-2 px-4 text-left text-[12px] font-bold text-[#0a0a0a]">
                {summaryLocationsLabel}
              </th>
              <th className="bg-white py-2 px-4 text-right text-[12px] font-bold text-[#0a0a0a]">
                {summaryStock.before} → {summaryStock.after}
              </th>
              <th className="bg-white py-2 px-4 text-right text-[12px] font-bold text-[#0a0a0a]">
                {packLayoutPackCountTotal.label}
              </th>
              {packDrilldownSizes.map((size) => (
                <th
                  key={`size-t-${size}`}
                  className="bg-white py-2 px-4 text-right text-[12px] font-bold text-[#0a0a0a]"
                >
                  {packLayoutLooseTotalsBySize[size] ?? 0}
                </th>
              ))}
              <th className="bg-white py-2 px-4 text-right text-[12px] font-bold text-[#0a0a0a]">
                <div className="flex flex-col items-end">
                  <span>{summarySales.l7}</span>
                  <span className="text-[11px] font-normal text-[#4b535c]">{summarySales.l30}</span>
                </div>
              </th>
              <th className="bg-white py-2 px-4 text-right text-[12px] font-bold text-[#4b535c]">7.01 per wk</th>
              <th className="bg-white py-2 px-4 text-right text-[12px] font-bold text-[#0a0a0a]">
                {summaryStockoutsLabel}
              </th>
              <th className="bg-white py-2 px-4 text-right text-[12px] font-bold text-[#4b535c]">—</th>
              <th className="bg-white py-2 px-4 text-right text-[12px] font-bold text-[#4b535c]">—</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const wh = packDrilldownMeta.warehouse
              const packsAvailable = log01PackBeforeAfter.before
              const log01PackCellKey = `${wh.id}-pack`
              const log01PackRevealed = activeTransferCell === log01PackCellKey
              return (
                <tr key={wh.id} className="border-b border-[#E9EAEB] bg-white hover:bg-white">
                  <td className="w-10 max-w-[40px] py-3 px-2" />
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="size-4 rounded border-[#E9EAEB] text-[#0267ff]"
                      aria-label={`Select ${wh.name}`}
                      checked={selectedLocationIds.has(log01SelectionId)}
                      onChange={() => toggleLocationSelection(log01SelectionId)}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-[#0a0a0a]">{wh.name}</span>
                      <span className="text-[12px] text-[#4b535c]">{wh.code}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-[#0a0a0a] font-normal">{wh.stock}</td>
                  <td
                    className="py-3 px-4 text-right cursor-pointer"
                    onClick={() => toggleTransferCellReveal(log01PackCellKey)}
                  >
                    {log01PackRevealed ? (
                      <div
                        className="flex flex-col items-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <BeforeAfterText value={log01PackBeforeAfter.label} />
                        <div className="flex flex-wrap gap-1 justify-end">
                          <TuHoverPopover
                            panel={
                              <TuTruckTransferHoverCard
                                loc={{
                                  name: wh.name,
                                  forecast: wh.forecast,
                                  targetWeeks: wh.targetWeeks,
                                  receivingWeeksCoverage:
                                    wh.weeksCoverage != null && wh.targetWeeks != null
                                      ? `${wh.weeksCoverage} → ${wh.weeksCoverage} (${wh.targetWeeks} target)`
                                      : undefined,
                                }}
                                borderClassName="border-[#A234DA]"
                                variant="soh"
                                sohValue={packsAvailable}
                                sohWeeksCoverage={
                                  wh.weeksCoverage != null && wh.targetWeeks != null
                                    ? `${wh.weeksCoverage} (${wh.targetWeeks} target)`
                                    : '—'
                                }
                                sohForecast={wh.forecast}
                                sohInTransit={false}
                                onMoreDetails={() => {}}
                              />
                            }
                          >
                            <span className="inline-flex h-[26px] min-w-[50px] w-fit shrink-0 items-center justify-center gap-1.5 rounded-[2px] bg-[#A234DA] px-[6px] py-[2px] text-[12px] font-medium text-white cursor-pointer transition-[filter,box-shadow] hover:brightness-90 hover:shadow-[0px_2px_4px_rgba(0,0,0,0.1)]">
                              <IconPackageTu />
                              {packsAvailable}
                            </span>
                          </TuHoverPopover>
                        </div>
                      </div>
                    ) : (
                      <BeforeAfterText value={log01PackBeforeAfter.label} />
                    )}
                  </td>
                  {packDrilldownSizes.map((size) => {
                    const outgoing = getOutgoingPackUnitsForSize(size)
                    const sizeBA = getSizeBeforeAfter(wh, size, product, {
                      mode: 'log01',
                      outgoingPackUnits: outgoing,
                    })
                    const cellKey = `${wh.id}-size-${size}`
                    const revealed = activeTransferCell === cellKey
                    const hasContent = sizeBA.before > 0 || outgoing > 0
                    return (
                      <td
                        key={cellKey}
                        className="py-3 px-4 text-right cursor-pointer"
                        onClick={() => {
                          if (!hasContent) return
                          toggleTransferCellReveal(cellKey)
                        }}
                      >
                        <div className="flex flex-col items-end gap-1">
                          <BeforeAfterText value={sizeBA.label} />
                          {revealed && hasContent ? (
                            <div
                              className="flex flex-wrap gap-1 justify-end"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {outgoing > 0 ? (
                                <span className="inline-flex h-[26px] min-w-[50px] w-fit shrink-0 items-center justify-center gap-1.5 rounded-[2px] bg-[#9CA3AF] px-[6px] py-[2px] text-[12px] font-medium text-white">
                                  <IconReplenishment />
                                  {outgoing}
                                </span>
                              ) : null}
                              {sizeBA.before > 0 ? (
                                <span className="inline-flex h-[26px] min-w-[50px] w-fit shrink-0 items-center justify-center gap-1.5 rounded-[2px] bg-[#A234DA] px-[6px] py-[2px] text-[12px] font-medium text-white">
                                  <IconPackageTu />
                                  {sizeBA.before}
                                </span>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </td>
                    )
                  })}
                  <td className="py-3 px-4 text-right text-[#4b535c]">—</td>
                  <td className="py-3 px-4 text-right text-[#4b535c]">—</td>
                  <td className="py-3 px-4 text-right text-[#4b535c]">—</td>
                  <td className="py-3 px-4 text-right text-[#4b535c]">—</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end">
                      <StorageCapacityPill value={wh.storageCapacity ?? 'available'} />
                    </div>
                  </td>
                </tr>
              )
            })()}
            {filteredLocations.map((loc) => {
              const packBoxes = getLocationPackBoxes(loc)
              const packCount = packBoxes.length
              const packCellKey = `${loc.id}-pack`
              const packRevealed = activeTransferCell === packCellKey
              const locPm = getLocPackMultiple(loc)
              const packEditKey = packCountEditKey(loc.id)
              const isEditingPack = editingTuBoxKey === packEditKey
              return (
                <tr key={loc.id} className="border-b border-[#E9EAEB] bg-white hover:bg-white">
                  <td className="w-10 max-w-[40px] py-3 px-2" />
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
                  <td className="py-3 px-4 text-right">
                    <BeforeAfterText value={loc.stock} />
                  </td>
                  <td
                    className="py-3 px-4 text-right cursor-pointer"
                    onClick={() => {
                      if (packCount === 0 || isEditingPack) return
                      toggleTransferCellReveal(packCellKey)
                    }}
                  >
                    {packCount === 0 ? (
                      <span className="text-[#4b535c]">—</span>
                    ) : packRevealed || isEditingPack ? (
                      <div
                        className="flex flex-wrap gap-1 justify-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isEditingPack ? (
                          <EditableTuTransferBadge
                            key={packEditKey}
                            value={locPm}
                            isEditing
                            editingValue={editingTuBoxValue}
                            onStartEdit={() => {}}
                            onEditingValueChange={(v) => {
                              setPackInputError(false)
                              setEditingTuBoxValue(v)
                            }}
                            onCommit={commitTuBoxEdit}
                            onCancel={cancelTuBoxEdit}
                            bgClassName="bg-[#BE185D]"
                            icon={<IconReplenishment />}
                            hoverPanel={null}
                            inputError={packInputError}
                            errorMessage={
                              packInputError ? `Multiple of ${locPm}` : null
                            }
                            inputStep={1}
                          />
                        ) : (
                          packBoxes.map((n, i) => (
                            <EditableTuTransferBadge
                              key={tuBoxKey(loc.id, 'replen-pack', i)}
                              value={1}
                              isEditing={false}
                              editingValue=""
                              onStartEdit={() => startEditTuBox(packEditKey, packCount)}
                              onEditingValueChange={setEditingTuBoxValue}
                              onCommit={commitTuBoxEdit}
                              onCancel={cancelTuBoxEdit}
                              bgClassName="bg-[#BE185D]"
                              icon={<IconReplenishment />}
                              hoverPanel={
                                <TuTruckTransferHoverCard
                                  trip={trip}
                                  loc={loc}
                                  truckUnits={n}
                                  borderClassName="border-[#BE185D]"
                                  variant="pack"
                                  packCompositionLine={getPackCompositionLine(product, loc)}
                                  packCount={packCount}
                                  sendingLabel={packSendingLabel}
                                  receivingLabel={loc.name}
                                  onMoreDetails={() => setSelectedTransferDetail(loc)}
                                />
                              }
                            />
                          ))
                        )}
                      </div>
                    ) : (
                      <span className="text-[#0a0a0a]">{formatPackLabel(packCount)}</span>
                    )}
                  </td>
                  {packDrilldownSizes.map((size) => {
                    const looseBoxes = getLocationLooseBoxesForSize(loc, size)
                    const packUnits = getPackUnitsForSize(product, loc, size, packBoxes)
                    const looseUnits = sumBoxUnits(looseBoxes)
                    const hasRebal =
                      showRebalancing &&
                      (loc.tuTruck?.length ?? 0) > 0 &&
                      packDrilldownSizes[0] === size
                    const rebalUnits = hasRebal ? sumBoxUnits(loc.tuTruck) : 0
                    const sizeBA = getSizeBeforeAfter(loc, size, product, {
                      packUnits,
                      looseUnits,
                      rebalUnits,
                    })
                    const sohUnits = sizeBA.before
                    const cellKey = `${loc.id}-size-${size}`
                    const revealed = activeTransferCell === cellKey
                    const hasLoose = looseBoxes.length > 0
                    const hasPack = packUnits > 0
                    const hasSoh = sohUnits > 0
                    const hasContent = hasLoose || hasRebal || hasPack || hasSoh
                    return (
                      <td
                        key={cellKey}
                        className="py-3 px-4 text-right cursor-pointer"
                        onClick={() => {
                          if (!hasContent) return
                          toggleTransferCellReveal(cellKey)
                        }}
                      >
                        <div className="flex flex-col items-end gap-1">
                          <BeforeAfterText value={sizeBA.label} />
                          {revealed && hasContent ? (
                            <div
                              className="flex flex-wrap gap-1 justify-end"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {hasPack ? (
                                <EditableTuTransferBadge
                                  value={packUnits}
                                  isEditing={false}
                                  editingValue=""
                                  onStartEdit={() => {}}
                                  onEditingValueChange={() => {}}
                                  onCommit={() => {}}
                                  onCancel={() => {}}
                                  bgClassName="bg-[#9CA3AF] pointer-events-none"
                                  icon={<IconReplenishment />}
                                  hoverPanel={null}
                                />
                              ) : null}
                              {showReplenishment &&
                                looseBoxes.map((n, i) => {
                                  const key = tuBoxKey(loc.id, 'replen-loose', i)
                                  const effectiveValue = getEffectiveTuBoxValue(key, n)
                                  return (
                                    <EditableTuTransferBadge
                                      key={key}
                                      value={effectiveValue}
                                      isEditing={editingTuBoxKey === key}
                                      editingValue={editingTuBoxValue}
                                      onStartEdit={() => startEditTuBox(key, effectiveValue)}
                                      onEditingValueChange={(v) => {
                                        setPackInputError(false)
                                        setEditingTuBoxValue(v)
                                      }}
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
                                          receivingLabel={loc.name}
                                          onMoreDetails={() => setSelectedTransferDetail(loc)}
                                        />
                                      }
                                    />
                                  )
                                })}
                              {hasRebal &&
                                loc.tuTruck.map((n, i) => {
                                  const key = tuBoxKey(loc.id, 'truck', i)
                                  const effectiveValue = getEffectiveTuBoxValue(key, n)
                                  return (
                                    <EditableTuTransferBadge
                                      key={key}
                                      value={effectiveValue}
                                      isEditing={editingTuBoxKey === key}
                                      editingValue={editingTuBoxValue}
                                      onStartEdit={() => startEditTuBox(key, effectiveValue)}
                                      onEditingValueChange={(v) => {
                                        setPackInputError(false)
                                        setEditingTuBoxValue(v)
                                      }}
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
                                          receivingLabel={loc.name}
                                          onMoreDetails={() => setSelectedTransferDetail(loc)}
                                        />
                                      }
                                    />
                                  )
                                })}
                              {hasSoh ? (
                                <span className="inline-flex h-[26px] min-w-[50px] w-fit shrink-0 items-center justify-center gap-1.5 rounded-[2px] bg-[#A234DA] px-[6px] py-[2px] text-[12px] font-medium text-white">
                                  <IconPackageTu />
                                  {sohUnits}
                                </span>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </td>
                    )
                  })}
                  <td className="py-3 px-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-[#0a0a0a]">{loc.salesL7}</span>
                      <span className="text-[12px] text-[#4b535c]">{loc.salesL30}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-[#0a0a0a]">{loc.forecast}</td>
                  <td className="py-3 px-4 text-right">
                    <BeforeAfterText value={loc.stockouts} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <DrilldownCoverageCell
                      coverage={getDrilldownSkuCoverageAtTarget(loc).pctLine}
                      targetWeeks={getDrilldownSkuCoverageAtTarget(loc).targetWeeks}
                    />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end">
                      <StorageCapacityPill value={loc.storageCapacity ?? 'available'} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        ) : (
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
              <th className="sticky top-0 z-20 bg-white text-right py-3 px-4 font-medium text-[#00050A]">
                <span className="flex flex-col items-end">
                  Coverage
                  <span className="text-[11px] font-normal text-[#4b535c]">target weeks</span>
                </span>
              </th>
              <th className="sticky top-0 z-20 bg-white text-right py-3 px-4 font-medium text-[#00050A]">
                <span className="inline-flex items-center gap-1 justify-end">
                  Storage capacity{' '}
                  <span
                    className="inline-flex cursor-help"
                    title="The storage capacity status of the location after the recommended transfers"
                  >
                    <IconInfo />
                  </span>
                </span>
              </th>
            </tr>
            <tr className="border-b border-[#E9EAEB] bg-white">
              <th className="w-10 max-w-[40px] bg-white py-2 px-2" />
              <th className="bg-white py-2 px-4" />
              <th className="bg-white py-2 px-4 text-left text-[12px] font-bold text-[#0a0a0a]">
                {summaryLocationsLabel}
              </th>
              <th className="bg-white py-2 px-4 text-right text-[12px] font-bold text-[#0a0a0a]">
                {summaryStock.before} → {summaryStock.after}
              </th>
              <th className="bg-white py-2 px-4 text-right text-[12px] font-bold text-[#0a0a0a]">
                {summaryTU.before} → {summaryTU.after}
              </th>
              <th className="bg-white py-2 px-4 text-right text-[12px] font-bold text-[#0a0a0a]">
                <div className="flex flex-col items-end">
                  <span>{summarySales.l7}</span>
                  <span className="text-[11px] font-normal text-[#4b535c]">{summarySales.l30}</span>
                </div>
              </th>
              <th className="bg-white py-2 px-4 text-right text-[12px] font-bold text-[#4b535c]">7.01 per wk</th>
              <th className="bg-white py-2 px-4 text-right text-[12px] font-bold text-[#0a0a0a]">
                {summaryStockoutsLabel}
              </th>
              <th className="bg-white py-2 px-4 text-right text-[12px] font-bold text-[#4b535c]">—</th>
              <th className="bg-white py-2 px-4 text-right text-[12px] font-bold text-[#4b535c]">—</th>
            </tr>
          </thead>
          <tbody>
            {filteredLocations.map((loc) => (
              <tr key={loc.id} className="border-b border-[#E9EAEB] bg-white hover:bg-white">
                <td className="w-10 max-w-[40px] py-3 px-2" />
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
                <td className="py-3 px-4 text-right">
                  <BeforeAfterText value={loc.stock} />
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex flex-col items-end gap-1">
                    <BeforeAfterText value={getLocationTuDisplay(loc)} />
                    <div className="flex flex-wrap gap-1 justify-end">
                      {loc.tuWarehouse != null && (
                        <TuHoverPopover
                          panel={
                            <TuTruckTransferHoverCard
                              loc={loc}
                              borderClassName="border-[#A234DA]"
                              variant="soh"
                              sohValue={loc.tuWarehouse}
                              sohInTransit
                              onMoreDetails={() => setSelectedTransferDetail(loc)}
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
                            onEditingValueChange={(v) => {
                              setPackInputError(false)
                              setEditingTuBoxValue(v)
                            }}
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
                                receivingLabel={loc.name}
                                onMoreDetails={() => setSelectedTransferDetail(loc)}
                              />
                            }
                          />
                        )
                      })}
                      {showReplenishment &&
                        isPackProduct &&
                        (() => {
                          const packBoxes = getLocationPackBoxes(loc)
                          const looseBoxes = getLocationLooseBoxes(loc)
                          const locPm = getLocPackMultiple(loc)
                          const packCount = packBoxes.length
                          const packEditKey = packCountEditKey(loc.id)
                          const isEditingPack = editingTuBoxKey === packEditKey
                          return (
                            <>
                              {isEditingPack ? (
                                <EditableTuTransferBadge
                                  key={packEditKey}
                                  value={locPm}
                                  isEditing
                                  editingValue={editingTuBoxValue}
                                  onStartEdit={() => {}}
                                  onEditingValueChange={(v) => {
                                    setPackInputError(false)
                                    setEditingTuBoxValue(v)
                                  }}
                                  onCommit={commitTuBoxEdit}
                                  onCancel={cancelTuBoxEdit}
                                  bgClassName="bg-[#BE185D]"
                                  icon={<IconReplenishment />}
                                  hoverPanel={null}
                                  inputError={packInputError}
                                  errorMessage={
                                    packInputError
                                      ? `Multiple of ${locPm}`
                                      : null
                                  }
                                  inputStep={1}
                                />
                              ) : (
                                packBoxes.map((n, i) => {
                                  const key = tuBoxKey(loc.id, 'replen-pack', i)
                                  return (
                                    <EditableTuTransferBadge
                                      key={key}
                                      value={1}
                                      isEditing={false}
                                      editingValue=""
                                      onStartEdit={() =>
                                        startEditTuBox(packEditKey, packCount)
                                      }
                                      onEditingValueChange={setEditingTuBoxValue}
                                      onCommit={commitTuBoxEdit}
                                      onCancel={cancelTuBoxEdit}
                                      bgClassName="bg-[#BE185D]"
                                      icon={<IconReplenishment />}
                                      hoverPanel={
                                        <TuTruckTransferHoverCard
                                          trip={trip}
                                          loc={loc}
                                          truckUnits={n}
                                          borderClassName="border-[#BE185D]"
                                          variant="pack"
                                          packCompositionLine={getPackCompositionLine(product, loc)}
                                          packCount={packCount}
                                          sendingLabel={packSendingLabel}
                                          receivingLabel={loc.name}
                                          onMoreDetails={() => setSelectedTransferDetail(loc)}
                                        />
                                      }
                                    />
                                  )
                                })
                              )}
                              {isMixedPackProduct &&
                                looseBoxes.map((n, i) => {
                                const key = tuBoxKey(loc.id, 'replen-loose', i)
                                const effectiveValue = getEffectiveTuBoxValue(key, n)
                                return (
                                  <EditableTuTransferBadge
                                    key={key}
                                    value={effectiveValue}
                                    isEditing={editingTuBoxKey === key}
                                    editingValue={editingTuBoxValue}
                                    onStartEdit={() =>
                                      startEditTuBox(key, effectiveValue)
                                    }
                                    onEditingValueChange={(v) => {
                                      setPackInputError(false)
                                      setEditingTuBoxValue(v)
                                    }}
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
                                        receivingLabel={loc.name}
                                        onMoreDetails={() => setSelectedTransferDetail(loc)}
                                      />
                                    }
                                  />
                                )
                              })}
                            </>
                          )
                        })()}
                      {showReplenishment &&
                        !isPackProduct &&
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
                                receivingLabel={loc.name}
                                onMoreDetails={() => setSelectedTransferDetail(loc)}
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
                              receivingLabel={loc.name}
                              onMoreDetails={() => setSelectedTransferDetail(loc)}
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
                <td className="py-3 px-4 text-right">
                  <BeforeAfterText value={loc.stockouts} />
                </td>
                <td className="py-3 px-4 text-right">
                  <DrilldownCoverageCell
                    coverage={getDrilldownSkuCoverageAtTarget(loc).pctLine}
                    targetWeeks={getDrilldownSkuCoverageAtTarget(loc).targetWeeks}
                  />
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end">
                    <StorageCapacityPill value={loc.storageCapacity ?? 'available'} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
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

function productHasPackConstraint(p) {
  return p?.packMultiple != null && p.packMultiple > 0
}

/** Pack row with a unit override that differs from the original mock value. */
function productHasPackUnitOverride(p, productTransfersOverrides = {}, replenTransferOverrides = {}) {
  if (!productHasPackConstraint(p)) return false
  if (productHasTransferSplit(p)) {
    if (!Object.prototype.hasOwnProperty.call(replenTransferOverrides, p.id)) return false
    return (Number(replenTransferOverrides[p.id]) || 0) !== (Number(p.replenTransfers) || 0)
  }
  if (!Object.prototype.hasOwnProperty.call(productTransfersOverrides, p.id)) return false
  return (Number(productTransfersOverrides[p.id]) || 0) !== (Number(p.transfers) || 0)
}

/** Explorer pack / pack-member row with a transfer override that differs from original. */
function explorerRowHasPackUnitOverride(row, explorerTransferOverrides = {}) {
  const isPackRow =
    (row?.packMultiple != null && row.packMultiple > 0) || Boolean(row?.isPackMember)
  if (!isPackRow) return false
  if (explorerTransferOverrides?.[row.id] === undefined) return false
  return explorerTransferOverrides[row.id] !== row.transfers
}

function productIsReplenOnly(p) {
  return Array.isArray(p?.movementType) && p.movementType.length === 1 && p.movementType[0] === 'replenishment'
}

function productHasTransferSplit(p) {
  return p?.replenTransfers != null && p?.rebalTransfers != null
}

/** Aggregated rows where pen+modal disambiguates which portion is editable. */
function productHasTransfersModalEdit(p) {
  return productHasMixedFulfilment(p) || productHasTransferSplit(p)
}

function productIsNonPackReplenEditable(p) {
  return productIsReplenOnly(p) && !productHasPackConstraint(p)
}

function formatPackNoun(packCount) {
  return Number(packCount) === 1 ? 'pack' : 'packs'
}

function formatPackLabel(packCount) {
  return `${packCount} ${formatPackNoun(packCount)}`
}

/** Smaller unit label for "pack" / "packs" — colour inherits from adjacent/parent text. */
function PackUnitLabel({ count }) {
  return (
    <span className="text-[11px] font-normal">{formatPackNoun(count)}</span>
  )
}

/** Pack count with smaller unit label on the same line (colour from numberClassName). */
function PackCountDisplay({ count, numberClassName = 'text-[14px] text-[#0a0a0a]' }) {
  return (
    <span className={`inline-flex items-center gap-1 ${numberClassName}`}>
      <span>{count}</span>
      <PackUnitLabel count={count} />
    </span>
  )
}

/** Recommended-transfers pack count for a Products-tab row (mock / no overrides). */
function getProductRecommendedPackCount(p) {
  if (!productHasPackConstraint(p) || !(p.packMultiple > 0)) return 0
  const recommendedUnits = Number(p.recommended) || 0
  const multiPacks = getMultiSkuPacksForProduct(p)
  if (multiPacks.length > 0) {
    return multiPacks.reduce((sum, pack) => sum + (Number(pack.packCount) || 0), 0)
  }
  const packUnitsForRecommended =
    p.packTransfers != null
      ? Number(p.packTransfers) || 0
      : productHasTransferSplit(p)
        ? Number(p.replenTransfers) || 0
        : recommendedUnits
  return packUnitsForRecommended / p.packMultiple
}

/** Derive trip-level pack count from PRODUCTS_BY_TRIP when available. */
function deriveTripPackCount(tripId) {
  const list = PRODUCTS_BY_TRIP[tripId]
  if (!list?.length) return 0
  return list.reduce((sum, p) => sum + getProductRecommendedPackCount(p), 0)
}

// Seed packCount on trips that move pack products (leave 0/undefined for non-pack trips)
for (const t of TRIPS_ALL) {
  if (t.packCount != null) continue
  const derived = deriveTripPackCount(t.id)
  if (derived > 0) t.packCount = derived
}
// Explicit pack seeds for Opera trips without distinct PRODUCTS_BY_TRIP (QA coverage)
const TRIP_PACK_COUNT_OVERRIDES = { 101: 3, 102: 2 }
for (const [id, count] of Object.entries(TRIP_PACK_COUNT_OVERRIDES)) {
  const trip = TRIPS_ALL.find((t) => String(t.id) === id)
  if (trip && !(trip.packCount > 0)) trip.packCount = count
}

/** Units in one pack for Explorer pack rows (single-SKU multiple or multi-SKU ratio sum). */
function getExplorerPackUnitsPerPack(packRow) {
  if (packRow?.isSingleSkuPack && packRow.packMultiple > 0) return packRow.packMultiple
  if (packRow?.packRatio && typeof packRow.packRatio === 'object') {
    return Object.values(packRow.packRatio).reduce((sum, n) => sum + (Number(n) || 0), 0)
  }
  return 0
}

function isPackMultipleValue(value, packMultiple) {
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) return false
  if (!packMultiple) return true
  return n % packMultiple === 0
}

const VIRTUAL_PACK_TOOLTIP = 'Auto-generated pack — not from customer ERP'

function VirtualPackIndicator({ className = '', showTooltip = true }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center px-1.5 py-0.5 rounded-[6px] border border-transparent bg-[#eef2ff] text-[11px] font-medium leading-none text-[#4338ca] ${className}`}
      title={showTooltip ? VIRTUAL_PACK_TOOLTIP : undefined}
      aria-label={showTooltip ? VIRTUAL_PACK_TOOLTIP : undefined}
    >
      Pack
    </span>
  )
}

function rowIsPackConstrained(row) {
  return (
    (row?.packMultiple != null && row.packMultiple > 0) ||
    Boolean(row?.packGroupId) ||
    Boolean(row?.isPackMember)
  )
}

function productIsPackConstrained(p) {
  return p?.packMultiple != null && p.packMultiple > 0
}

function ProductsDrilldown({
  trip,
  onBack,
  showBackButton = true,
  onDrawerFiltersActiveChange,
  setExplorerProductNameFilters,
  setExplorerStatusFilters,
  setActiveTab,
  selectedProduct: controlledSelectedProduct,
  onSelectedProductChange,
  setExplorerTransferOverrides,
  onOpenExplorerUnapprovedForProduct,
}) {
  const [localSelectedProduct, setLocalSelectedProduct] = useState(null)
  const isSelectedProductControlled = typeof onSelectedProductChange === 'function'
  const selectedProduct = isSelectedProductControlled
    ? controlledSelectedProduct
    : localSelectedProduct
  const setSelectedProduct = isSelectedProductControlled
    ? onSelectedProductChange
    : setLocalSelectedProduct
  const [productStatusOverrides, setProductStatusOverrides] = useState({})
  const [productTransfersOverrides, setProductTransfersOverrides] = useState({})
  const [productPackTransfersOverrides, setProductPackTransfersOverrides] = useState({})
  const [productLooseTransfersOverrides, setProductLooseTransfersOverrides] = useState({})
  const [productPackCountOverrides, setProductPackCountOverrides] = useState({})
  const [editingTransfersProductId, setEditingTransfersProductId] = useState(null)
  const [editingTransfersValue, setEditingTransfersValue] = useState('')
  const [transfersModalProductId, setTransfersModalProductId] = useState(null)
  const [editingTransfersLooseValue, setEditingTransfersLooseValue] = useState('')
  const [transfersPopoverCoords, setTransfersPopoverCoords] = useState({ left: 0, top: 0 })
  const transfersEditPenRefs = useRef({})
  const transfersPopoverRef = useRef(null)
  const [selectedProductIds, setSelectedProductIds] = useState(new Set())
  const [statusFilters, setStatusFilters] = useState([])
  const [filtersDropdownOpen, setFiltersDropdownOpen] = useState(false)
  const [productsActiveQuickFilter, setProductsActiveQuickFilter] = useState(null)
  const [bulkChangeStatusOpen, setBulkChangeStatusOpen] = useState(false)
  const [bulkChangeUnitsOpen, setBulkChangeUnitsOpen] = useState(false)
  const [productColumnOrder, setProductColumnOrder] = useState(
    () => [...PRODUCTS_TABLE_DEFAULT_COLUMN_ORDER]
  )
  const [productVisibleColumns, setProductVisibleColumns] = useState(
    () => new Set(PRODUCTS_DEFAULT_VISIBLE_LOGICAL_IDS)
  )
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false)
  const [columnSettingsSearch, setColumnSettingsSearch] = useState('')
  const [replenTransferOverrides, setReplenTransferOverrides] = useState({})
  const productsColumnSettingsRef = useRef(null)

  useEffect(() => {
    onDrawerFiltersActiveChange?.(statusFilters.length > 0)
  }, [statusFilters, onDrawerFiltersActiveChange])

  // Future: extend to include productsActiveQuickFilter when chips become real filters
  const filtersActive = statusFilters.length > 0

  const baseProducts = PRODUCTS_BY_TRIP[trip.id] || DEFAULT_PRODUCTS

  const getEffectiveReplenTransfers = (p) => {
    if (!productHasTransferSplit(p)) return null
    if (Object.prototype.hasOwnProperty.call(replenTransferOverrides, p.id)) {
      return Number(replenTransferOverrides[p.id]) || 0
    }
    return Number(p.replenTransfers) || 0
  }

  const getEffectivePackTransfers = (p) => {
    if (Object.prototype.hasOwnProperty.call(productPackTransfersOverrides, p.id)) {
      return Number(productPackTransfersOverrides[p.id]) || 0
    }
    return Number(p.packTransfers) || 0
  }

  const getEffectiveLooseTransfers = (p) => {
    if (Object.prototype.hasOwnProperty.call(productLooseTransfersOverrides, p.id)) {
      return Number(productLooseTransfersOverrides[p.id]) || 0
    }
    if (p.looseTransfers != null) return Number(p.looseTransfers) || 0
    // Non-pack mixed replen+rebal: replen portion is the editable "loose" value
    if (productHasTransferSplit(p) && !productHasMixedFulfilment(p)) {
      return getEffectiveReplenTransfers(p) ?? 0
    }
    return 0
  }

  const getEffectiveTransfers = (p) => {
    // Pack + loose (+ optional rebal) — prefer mixed fulfilment so loose overrides apply
    if (productHasMixedFulfilment(p)) {
      const packU = getEffectivePackTransfers(p)
      const looseU = getEffectiveLooseTransfers(p)
      const rebalU = Number(p.rebalTransfers) || 0
      return packU + looseU + rebalU
    }
    if (productHasTransferSplit(p)) {
      return getEffectiveReplenTransfers(p) + (Number(p.rebalTransfers) || 0)
    }
    if (Object.prototype.hasOwnProperty.call(productTransfersOverrides, p.id)) {
      return Number(productTransfersOverrides[p.id]) || 0
    }
    return Number(p.transfers) || 0
  }

  const getReplenPackCount = (p) => {
    if (!productHasPackConstraint(p)) return 0
    if (Object.prototype.hasOwnProperty.call(productPackCountOverrides, p.id)) {
      return Number(productPackCountOverrides[p.id]) || 0
    }
    // Multi-SKU Coin-pack: sum pack-group counts (P1 + P2), not transfers / product packMultiple
    const multiPacks = getMultiSkuPacksForProduct(p)
    if (multiPacks.length > 0) {
      return multiPacks.reduce((sum, pack) => sum + (Number(pack.packCount) || 0), 0)
    }
    // Mixed fulfilment: pack subtext from pack-fulfilled units only (not pack+loose total)
    if (p.packTransfers != null && p.packMultiple > 0) {
      const packUnits = Object.prototype.hasOwnProperty.call(productPackTransfersOverrides, p.id)
        ? Number(productPackTransfersOverrides[p.id]) || 0
        : Number(p.packTransfers) || 0
      return packUnits / p.packMultiple
    }
    if (productHasTransferSplit(p)) {
      return getEffectiveReplenTransfers(p) / p.packMultiple
    }
    if (productIsReplenOnly(p)) {
      return getEffectiveTransfers(p) / p.packMultiple
    }
    return 0
  }

  const beginTransfersEdit = (p, currentValue) => {
    setEditingTransfersProductId(p.id)
    setEditingTransfersValue(String(currentValue ?? 0))
  }

  const commitTransfersEdit = (p) => {
    const raw = editingTransfersValue
    const n = Number(raw)
    if (raw === '' || !Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
      cancelTransfersEdit()
      return false
    }
    setProductTransfersOverrides((prev) => ({ ...prev, [p.id]: n }))
    setEditingTransfersProductId(null)
    setEditingTransfersValue('')
    return true
  }

  const cancelTransfersEdit = () => {
    setEditingTransfersProductId(null)
    setEditingTransfersValue('')
  }

  const handleOpenTransfersModal = (p) => {
    setTransfersModalProductId(p.id)
    setEditingTransfersLooseValue(String(getEffectiveLooseTransfers(p)))
  }

  const handleCloseTransfersModal = () => {
    setTransfersModalProductId(null)
    setEditingTransfersLooseValue('')
  }

  const handleConfirmTransfersEdit = () => {
    const p = baseProducts.find((row) => row.id === transfersModalProductId)
    if (!p) {
      handleCloseTransfersModal()
      return
    }
    const raw = editingTransfersLooseValue
    const n = Number(raw)
    if (raw === '' || !Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
      handleCloseTransfersModal()
      return
    }
    setProductLooseTransfersOverrides((prev) => ({ ...prev, [p.id]: n }))
    // Non-pack mixed replen+rebal still uses replen overrides for the editable portion
    if (productHasTransferSplit(p) && !productHasMixedFulfilment(p)) {
      setReplenTransferOverrides((prev) => ({ ...prev, [p.id]: n }))
    }
    handleCloseTransfersModal()
  }

  const updateTransfersPopoverPosition = useCallback(() => {
    const el = transfersEditPenRefs.current[transfersModalProductId]
    const pop = transfersPopoverRef.current
    if (!el || transfersModalProductId == null) return
    const rect = el.getBoundingClientRect()
    const gap = 8
    const pad = 12
    const vw = window.innerWidth
    const vh = window.innerHeight
    const pw = pop?.offsetWidth || 300
    const ph = pop?.offsetHeight || 240

    // Prefer right of pen so Transfers cell stays visible. Never open left over the cell.
    let left = rect.right + gap
    let top = rect.top + rect.height / 2 - ph / 2

    if (left + pw > vw - pad) {
      // Flip below the trigger (or above if bottom would clip)
      left = Math.max(pad, Math.min(rect.right - pw, vw - pad - pw))
      top = rect.bottom + gap
      if (top + ph > vh - pad) {
        top = rect.top - gap - ph
      }
    } else {
      top = Math.max(pad, Math.min(top, vh - pad - ph))
    }

    left = Math.max(pad, Math.min(left, vw - pad - pw))
    top = Math.max(pad, Math.min(top, vh - pad - ph))
    setTransfersPopoverCoords({ left, top })
  }, [transfersModalProductId])

  useLayoutEffect(() => {
    if (transfersModalProductId == null) return
    updateTransfersPopoverPosition()
    const id = requestAnimationFrame(() => updateTransfersPopoverPosition())

    const pop = transfersPopoverRef.current
    const ro = pop ? new ResizeObserver(() => updateTransfersPopoverPosition()) : null
    if (pop && ro) ro.observe(pop)

    const onScrollOrResize = () => updateTransfersPopoverPosition()
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)

    const scrollParents = []
    let node = transfersEditPenRefs.current[transfersModalProductId]?.parentElement
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
  }, [transfersModalProductId, updateTransfersPopoverPosition, editingTransfersLooseValue])

  useEffect(() => {
    if (transfersModalProductId == null) return
    const onKey = (e) => {
      if (e.key === 'Escape') handleCloseTransfersModal()
    }
    const onPointerDown = (e) => {
      if (e.target.closest('[data-transfers-edit-popover]')) return
      if (e.target.closest('[data-transfers-edit]')) return
      handleCloseTransfersModal()
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [transfersModalProductId])

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

  const transferApprovalTotals = useMemo(() => {
    // Transfers units stay scope-wide (movement totals recompute is a separate BE brief item)
    const transfers = baseProducts.reduce(
      (sum, p) => sum + getEffectiveTransfers(p),
      0
    )
    // Status approved/unapproved reflect the filtered table view
    const { approved, unapproved } = products.reduce(
      (acc, p) => ({
        approved: acc.approved + (p.approvedTransfers ?? 0),
        unapproved: acc.unapproved + (p.unapprovedTransfers ?? 0),
      }),
      { approved: 0, unapproved: 0 }
    )
    return { transfers, approved, unapproved }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- helpers close over override maps
  }, [
    baseProducts,
    products,
    productTransfersOverrides,
    replenTransferOverrides,
    productPackTransfersOverrides,
    productLooseTransfersOverrides,
  ])

  // Confidence + Coverage totals stay scope-wide (state metrics; greyed when filters active)
  const productSkuLocationTotals = useMemo(() => {
    const aggregatedBuckets = emptyConfidenceBuckets()
    let coverageInTarget = 0
    let coverageTotal = 0
    baseProducts.forEach((p) => {
      for (const b of CONFIDENCE_BUCKET_ORDER) {
        aggregatedBuckets[b.key] += Number(p.skuConfidenceBuckets?.[b.key]) || 0
      }
      coverageInTarget += Number(p.skuCoverageSummary?.inTarget) || 0
      coverageTotal += Number(p.skuCoverageSummary?.total) || 0
    })
    const coveragePct =
      coverageTotal > 0 ? Math.round((100 * coverageInTarget) / coverageTotal) : 0
    return { aggregatedBuckets, coveragePct }
  }, [baseProducts])

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
      const hasReplenSplit = productHasTransferSplit(p)
      const hasMixed = productHasMixedFulfilment(p)
      const hasReplenOverride = Object.prototype.hasOwnProperty.call(replenTransferOverrides, id)
      const hasTransfersOverride = Object.prototype.hasOwnProperty.call(productTransfersOverrides, id)
      const hasLooseOverride = Object.prototype.hasOwnProperty.call(productLooseTransfersOverrides, id)
      if (hasReplenSplit || hasMixed || hasReplenOverride || hasTransfersOverride || hasLooseOverride) {
        eligibleIds.push(id)
      }
    })

    if (eligibleIds.length > 0) {
      setReplenTransferOverrides((prev) => {
        const next = { ...prev }
        eligibleIds.forEach((id) => {
          delete next[id]
        })
        return next
      })
      setProductTransfersOverrides((prev) => {
        const next = { ...prev }
        eligibleIds.forEach((id) => {
          delete next[id]
        })
        return next
      })
      setProductLooseTransfersOverrides((prev) => {
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

    cancelTransfersEdit()
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
    setProductColumnOrder((order) => {
      const visible = order.filter((id) => productVisibleColumns.has(id))
      const nextVisible = moveTripTableColumnOrder(visible, from, targetVisualIndex)
      let i = 0
      return order.map((id) => (productVisibleColumns.has(id) ? nextVisible[i++] : id))
    })
  }, [productVisibleColumns])

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

  useEffect(() => {
    if (!columnSettingsOpen) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setColumnSettingsOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [columnSettingsOpen])

  const visibleProductColumnOrder = useMemo(
    () => productColumnOrder.filter((id) => productVisibleColumns.has(id)),
    [productColumnOrder, productVisibleColumns]
  )

  const toggleProductColumnVisibility = (logicalIdx) => {
    if (PRODUCTS_LOCKED_LOGICAL_IDS.includes(logicalIdx)) return
    const willShow = !productVisibleColumns.has(logicalIdx)
    setProductVisibleColumns((prev) => {
      const next = new Set(prev)
      if (willShow) next.add(logicalIdx)
      else next.delete(logicalIdx)
      return next
    })
    // Newly shown columns append before Status (end of visible set).
    if (willShow) {
      setProductColumnOrder((order) => {
        const without = order.filter((id) => id !== logicalIdx)
        const statusPos = without.indexOf(18)
        if (statusPos >= 0) {
          without.splice(statusPos, 0, logicalIdx)
          return without
        }
        return [...without, logicalIdx]
      })
    }
  }

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
        setProductTransfersOverrides={setProductTransfersOverrides}
        setProductPackTransfersOverrides={setProductPackTransfersOverrides}
        setProductLooseTransfersOverrides={setProductLooseTransfersOverrides}
        setProductPackCountOverrides={setProductPackCountOverrides}
        setExplorerTransferOverrides={setExplorerTransferOverrides}
      />
    )
  }
  const breadcrumbFrom = `${trip.from} [${trip.fromCode}]`
  const breadcrumbTo = trip.to.length > 12 ? `${trip.to.slice(0, 10)}...` : trip.to
  const productSummary = PRODUCTS_TAB_SUMMARY_TOTALS

  const productColLast = visibleProductColumnOrder.length - 1
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
              Product
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
              Movement
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
            className={`${productThPin(isFirst, isLast)}h-[62px] min-h-[62px] w-[140px] min-w-[140px] text-right px-4 align-middle font-medium text-[#00050A] box-border`}
            {...d}
          >
            <span className="inline-flex w-full min-w-0 items-center justify-end gap-2">
              {grip}
              <span
                className="inline-flex items-center gap-1 cursor-help"
                title="How confident Autone is in the recommendation for each SKU-location. Higher confidence means less review needed."
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
                <span className="text-[11px] font-normal text-[#4b535c]">Creation date</span>
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
                title="Stock on-hand at the receiving location. In transit & PFP shown as secondary context."
              >
                Units (to) <IconInfo />
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
                title="The total number of units across your warehouses in scope, before & after transfers."
              >
                Warehouse <IconInfo />
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
                <span className="text-[11px] font-normal text-[#4b535c]">L7D</span>
              </span>
            </span>
          </th>
        )
      case 11:
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
                <span className="text-[11px] font-normal text-[#4b535c]">L30D</span>
              </span>
            </span>
          </th>
        )
      case 12:
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
                <span className="text-[11px] font-normal text-[#4b535c]">L90D</span>
              </span>
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
              <span className="flex flex-col items-end justify-center gap-0.5 leading-tight">
                <span className="inline-flex items-center gap-1">
                  Forecast <IconInfo />
                </span>
                <span className="text-[11px] font-normal text-[#4b535c]">per wk</span>
              </span>
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
              Stockouts
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
              Locations
            </span>
          </th>
        )
      case 16:
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
      case 17:
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
      case 18:
        return (
          <th
            key={logicalIdx}
            className={`${productThPin(isFirst, isLast)}h-[62px] min-h-[62px] px-4 font-medium text-[#00050A] text-right align-middle box-border min-w-[140px]`}
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
    const stateMuted = filtersActive
    const stateMutedTitle = stateMuted
      ? 'This value reflects your full scope, not the filtered view.'
      : undefined
    const statePrimary = stateMuted ? 'text-[#9ca3af]' : 'text-[#0a0a0a]'
    const stateSecondary = stateMuted ? 'text-[#9ca3af]' : 'text-[#4b535c]'
    const stateThClass = stateMuted
      ? `${pin}py-2 px-4 text-[12px] font-medium text-[#9ca3af] text-right cursor-help`
      : `${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`

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
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-right`}>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[12px] font-medium text-[#0a0a0a]">
                {transferApprovalTotals.transfers} units
              </span>
              <span className="text-[11px] text-[#4b535c]">packs</span>
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
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-right`}>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[12px] font-medium text-[#0a0a0a]">
                {productSummary.recommendedUnits} units
              </span>
              <span className="text-[11px] text-[#4b535c]">packs</span>
            </div>
          </th>
        )
      case 5:
        return (
          <th
            key={logicalIdx}
            className={`${pin}py-2 px-4 text-right ${stateMuted ? 'cursor-help' : ''}`}
            title={stateMutedTitle}
          >
            <div className="flex justify-end">
              <ConfidenceLabelWithHover
                buckets={productSkuLocationTotals.aggregatedBuckets}
                muted={stateMuted}
              />
            </div>
          </th>
        )

      case 6: {
        const coveragePct = productSkuLocationTotals.coveragePct
        return (
          <th
            key={logicalIdx}
            className={`${pin}py-2 px-4 text-right ${stateMuted ? 'cursor-help' : ''}`}
            title={stateMutedTitle}
          >
            <div className="flex justify-end">
              <span
                className={`px-1.5 py-0.5 rounded-[4px] text-[11px] font-medium ${
                  stateMuted
                    ? 'bg-[#f3f4f6] text-[#9ca3af]'
                    : 'bg-[#dcfce7] text-[#166534]'
                }`}
              >
                {coveragePct}% of SKUs in target
              </span>
            </div>
          </th>
        )
      }
      case 7:
        return <th key={logicalIdx} className={`${pin}py-2 px-4 text-right`} />
      case 8:
        return (
          <th key={logicalIdx} className={stateThClass} title={stateMutedTitle}>
            <div className="flex flex-col items-end">
              <span className="inline-flex items-baseline gap-1">
                <span className={`text-[14px] ${statePrimary}`}>{productSummary.stockUnits}</span>
                <span className={`text-[14px] ${statePrimary}`}>SOH</span>
              </span>
              <span className={`text-[12px] ${stateSecondary}`}>{productSummary.stockInTransit}</span>
            </div>
          </th>
        )
      case 9:
        return (
          <th key={logicalIdx} className={stateThClass} title={stateMutedTitle}>
            {productSummary.warehouseAllocate}
          </th>
        )
      case 10:
        return (
          <th key={logicalIdx} className={stateThClass} title={stateMutedTitle}>
            {productSummary.salesL7}
          </th>
        )
      case 11:
        return (
          <th key={logicalIdx} className={stateThClass} title={stateMutedTitle}>
            {productSummary.salesL30}
          </th>
        )
      case 12:
        return (
          <th key={logicalIdx} className={stateThClass} title={stateMutedTitle}>
            {productSummary.salesL90}
          </th>
        )
      case 13:
        return (
          <th
            key={logicalIdx}
            className={`${pin}py-2 px-4 text-[12px] text-right ${stateMuted ? 'text-[#9ca3af] cursor-help' : 'text-[#4b535c]'}`}
            title={stateMutedTitle}
          >
            —
          </th>
        )
      case 14:
        return (
          <th key={logicalIdx} className={stateThClass} title={stateMutedTitle}>
            {productSummary.stockouts}
          </th>
        )
      case 15:
        return (
          <th key={logicalIdx} className={stateThClass} title={stateMutedTitle}>
            {productSummary.locations}
          </th>
        )
      case 16:
        return (
          <th key={logicalIdx} className={stateThClass} title={stateMutedTitle}>
            {productSummary.overstocks}
          </th>
        )
      case 17:
        return (
          <th key={logicalIdx} className={stateThClass} title={stateMutedTitle}>
            {productSummary.understocks}
          </th>
        )
      case 18:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-right min-w-[140px]`}>
            <div className="flex flex-col items-end gap-0.5 text-[12px] font-medium">
              <span className="text-[#166534]">{transferApprovalTotals.approved} approved</span>
              {transferApprovalTotals.unapproved > 0 && (
                <span className="text-[#4b535c]">{transferApprovalTotals.unapproved} unapproved</span>
              )}
            </div>
          </th>
        )
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
            className={`${pin}py-3 px-4 max-w-[220px] min-w-[220px] align-top`}
          >
            <TuHoverPopover panel={<ProductDetailsHoverCard product={p} />}>
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-[4px] bg-[#f3f4f6] shrink-0" />
                <div className="flex min-w-0 flex-col gap-0.5 line-clamp-2">
                  <span className="truncate font-medium text-[#0a0a0a]">{p.name}</span>
                  <span className="truncate text-[12px] text-[#4b535c]">{p.sku}</span>
                  <span className="text-[12px] text-[#4b535c]">{p.colour}</span>
                </div>
              </div>
            </TuHoverPopover>
          </td>
        )
      case 1:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 align-top`}>
            <MovementTypePills movementType={p.movementType} />
          </td>
        )
      case 2: {
        const effectiveTransfers = getEffectiveTransfers(p)
        const isInlineEditable = productIsNonPackReplenEditable(p)
        const hasModalEdit = productHasTransfersModalEdit(p)
        const isEditingThis = editingTransfersProductId === p.id
        const packCount = getReplenPackCount(p)
        const showPackCount = packCount > 0

        const transfersCellContent = isInlineEditable ? (
          <div className="flex flex-col items-end gap-0.5">
            <input
              type="number"
              min="0"
              step={1}
              value={isEditingThis ? editingTransfersValue : String(effectiveTransfers)}
              onFocus={() => beginTransfersEdit(p, effectiveTransfers)}
              onChange={(e) => {
                setEditingTransfersValue(e.target.value)
              }}
              onBlur={() => {
                commitTransfersEdit(p)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur()
                }
                if (e.key === 'Escape') {
                  cancelTransfersEdit()
                  e.currentTarget.blur()
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-16 h-7 px-2 rounded-[4px] border border-[#e9eaeb] text-[12px] text-[#0a0a0a] text-right"
            />
          </div>
        ) : (
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[14px] text-[#0a0a0a]">{effectiveTransfers}</span>
            {showPackCount && (
              <span className="text-[12px] text-[#4b535c]">{packCount}</span>
            )}
          </div>
        )

        return (
          <td
            key={logicalIdx}
            className={`${pin}group/transfers py-3 px-4 text-right align-top`}
          >
            <div className="inline-flex w-full items-center justify-end gap-1.5">
              {transfersCellContent}
              {hasModalEdit && (
                <button
                  type="button"
                  ref={(el) => {
                    if (el) transfersEditPenRefs.current[p.id] = el
                    else delete transfersEditPenRefs.current[p.id]
                  }}
                  data-transfers-edit
                  aria-label={`Edit replenishment units for ${p.name}`}
                  aria-expanded={transfersModalProductId === p.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (transfersModalProductId === p.id) handleCloseTransfersModal()
                    else handleOpenTransfersModal(p)
                  }}
                  className={`shrink-0 rounded p-0.5 text-[#6A7282] transition-opacity duration-150 hover:text-[#101828] focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0267FF] ${
                    transfersModalProductId === p.id
                      ? 'opacity-100'
                      : 'opacity-0 group-hover/transfers:opacity-100'
                  }`}
                >
                  <Pencil size={14} strokeWidth={2} aria-hidden />
                </button>
              )}
            </div>
          </td>
        )
      }
      case 3: {
        const revenueStale = productHasPackUnitOverride(
          p,
          productTransfersOverrides,
          replenTransferOverrides
        )
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right align-top`}>
            <div
              className={`line-clamp-2 min-w-0 w-full text-right ${
                revenueStale ? 'text-[#9ca3af]' : 'text-[#0a0a0a]'
              }`}
            >
              {p.revenue}
            </div>
          </td>
        )
      }
      case 4: {
        const recommendedUnits = Number(p.recommended) || 0
        const recommendedPackCount = getProductRecommendedPackCount(p)
        const showPackCount = recommendedPackCount > 0
        const reasonBadges = p.recommendedBadges?.map((b) => (
          <span
            key={b}
            className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-[#f8f8f8] text-[11px] font-medium text-[#0267ff]"
          >
            {b === 'VIS' ? 'VS' : b}
          </span>
        ))

        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right align-top`}>
            <div className="flex flex-col items-end gap-0.5 line-clamp-2 min-w-0">
              <span className="inline-flex flex-wrap items-center justify-end gap-1 text-[#0a0a0a]">
                <span className="text-[14px]">{recommendedUnits}</span>
                {reasonBadges}
              </span>
              {showPackCount && (
                <span className="text-[12px] text-[#4b535c]">{recommendedPackCount}</span>
              )}
            </div>
          </td>
        )
      }
      case 5:
        return (
          <td
            key={logicalIdx}
            className={`${pin}py-3 px-4 w-[140px] min-w-[140px] text-right align-top`}
          >
            <div className="flex justify-end">
              <ConfidenceLabelWithHover buckets={p.skuConfidenceBuckets} />
            </div>
          </td>
        )

      case 6: {
        const coverageStale = productHasPackUnitOverride(
          p,
          productTransfersOverrides,
          replenTransferOverrides
        )
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right align-top`}>
            <div className="flex justify-end line-clamp-2 min-w-0">
              <ProductCoverageText
                coverageWeeks={p.coverageWeeks}
                coverageTarget={p.coverageTarget}
                coverage={p.coverage}
                stale={coverageStale}
              />
            </div>
          </td>
        )
      }
      case 7:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right align-top`}>
            <div className="flex justify-end line-clamp-2 min-w-0">
              <ProductNextEventProductsCell nextEvent={p.nextEvent} />
            </div>
          </td>
        )
      case 8:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right align-top`}>
            <div className="flex flex-col items-end line-clamp-2 min-w-0">
              <span className="inline-flex items-baseline gap-1">
                <span className="text-[14px] text-[#0a0a0a]">{p.currentUnits ?? '—'}</span>
                <span className="text-[14px] text-[#0a0a0a]">SOH</span>
              </span>
              {(p.currentUnitsInTransit ?? 0) > 0 && (
                <span className="text-[12px] text-[#4b535c]">
                  {p.currentUnitsInTransit} in transit & PFP
                </span>
              )}
            </div>
          </td>
        )
      case 9:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right align-top`}>
            <div className="line-clamp-2 min-w-0 w-full text-right text-[#0a0a0a]">
              {p.warehouseAllocateLine ?? '—'}
            </div>
          </td>
        )
      case 10:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0 w-full text-right">{p.salesL7 ?? '—'}</div>
          </td>
        )
      case 11:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0 w-full text-right">{p.salesL30 ?? '—'}</div>
          </td>
        )
      case 12:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0 w-full text-right">{p.salesL90 ?? '—'}</div>
          </td>
        )
      case 13:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0 w-full text-right">{p.forecast}</div>
          </td>
        )
      case 14:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0 w-full text-right">{p.stockouts}</div>
          </td>
        )
      case 15:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0 w-full text-right">{p.locations}</div>
          </td>
        )
      case 16:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0 w-full text-right">{p.overstocks}</div>
          </td>
        )
      case 17:
        return (
          <td key={logicalIdx} className={`${pin}py-3 px-4 text-right text-[#0a0a0a] align-top`}>
            <div className="line-clamp-2 min-w-0 w-full text-right">{p.understocks}</div>
          </td>
        )
      case 18:
        return (
          <td
            key={logicalIdx}
            className={`${pin}py-3 px-4 min-w-[140px] align-top text-right`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-end gap-1">
              <StatusDropdown
                rowId={`product-${p.id}`}
                value={productStatusOverrides[p.id] ?? getRowStatus(p)}
                userName={p.approvedByUser || p.editedByUser}
                onChange={(statusId) => setProductStatusOverrides((prev) => ({ ...prev, [p.id]: statusId }))}
              />
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[12px] font-medium text-[#166534]">
                  {p.approvedTransfers} approved
                </span>
                {p.unapprovedTransfers > 0 && (
                  <button
                    type="button"
                    className="text-[12px] font-medium text-[#4b535c] hover:underline"
                    onClick={(e) => {
                      e.stopPropagation()
                      onOpenExplorerUnapprovedForProduct?.(p.name)
                    }}
                  >
                    {p.unapprovedTransfers} unapproved
                  </button>
                )}
              </div>
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
          <div className="relative shrink-0" ref={productsColumnSettingsRef}>
            <button
              type="button"
              onClick={() => setColumnSettingsOpen((o) => !o)}
              className="h-10 w-10 flex items-center justify-center rounded-[4px] border border-[#e9eaeb] bg-white text-[#22272f] hover:bg-[#f3f4f6] shrink-0"
              aria-label="Column settings"
              aria-expanded={columnSettingsOpen}
              aria-haspopup="dialog"
            >
              <IconColumnSettings />
            </button>
            {columnSettingsOpen && (
              <>
                <div
                  className="fixed inset-0 z-[60]"
                  aria-hidden
                  onClick={() => setColumnSettingsOpen(false)}
                />
                <div
                  role="dialog"
                  aria-label="Customise columns"
                  className="absolute left-0 top-full mt-1 z-[70] w-[280px] max-h-[min(70vh,420px)] overflow-hidden rounded-[6px] border border-[#e5e7eb] bg-white shadow-lg flex flex-col"
                >
                  <div className="shrink-0 border-b border-[#e5e7eb] p-2">
                    <div className="flex items-center h-9 rounded-[4px] border border-[#e9eaeb] bg-white">
                      <input
                        type="text"
                        placeholder="search..."
                        value={columnSettingsSearch}
                        onChange={(e) => setColumnSettingsSearch(e.target.value)}
                        className="flex-1 min-w-0 h-full pl-3 pr-2 border-0 bg-transparent rounded-[4px] text-[13px] text-[#0a0a0a] placeholder:text-[#9ca3af] focus:outline-none focus:ring-0"
                        aria-label="Search columns"
                      />
                      <span className="pr-2.5 shrink-0 text-[#9ca3af]">
                        <IconSearch className="size-3.5" />
                      </span>
                    </div>
                  </div>
                  <div className="overflow-y-auto py-1">
                    {PRODUCTS_COLUMN_PICKER_LABELS.map((label, logicalIdx) => {
                      const locked = PRODUCTS_LOCKED_LOGICAL_IDS.includes(logicalIdx)
                      const checked = productVisibleColumns.has(logicalIdx)
                      return (
                        <label
                          key={logicalIdx}
                          className={`flex items-center gap-2 px-3 py-1.5 ${
                            locked
                              ? 'cursor-default text-[#9ca3af]'
                              : 'cursor-pointer hover:bg-[#f3f4f6] text-[#0a0a0a]'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={locked}
                            onChange={() => toggleProductColumnVisibility(logicalIdx)}
                            className="size-4 rounded border-[#d1d5db] text-[#0267ff] disabled:cursor-not-allowed disabled:opacity-50"
                          />
                          <span className={`text-[13px] ${locked ? 'text-[#9ca3af]' : 'text-[#0a0a0a]'}`}>
                            {label}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
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
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <button
              type="button"
              className="h-10 px-4 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] font-medium text-[#22272f] hover:bg-[#f3f4f6] shrink-0"
              aria-label="Save view"
            >
              Save
            </button>
            <button
              type="button"
              className="h-10 px-3 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#22272f] hover:bg-[#f3f4f6] shrink-0 inline-flex items-center gap-1.5"
              aria-label="Default view"
              aria-haspopup="listbox"
            >
              Default view
              <IconChevronDown />
            </button>
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
              {visibleProductColumnOrder.map((logicalIdx, visualIdx) =>
                renderProductsHeaderCell(logicalIdx, visualIdx)
              )}
            </tr>
            <tr className="border-b border-[#E9EAEB] bg-white">
              <th className="sticky left-0 z-30 w-14 min-w-14 max-w-14 box-border py-2 px-4 bg-white shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]" />
              {visibleProductColumnOrder.map((logicalIdx, visualIdx) =>
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
                  if (e.target.closest('[data-transfers-edit]')) return
                  setSelectedProduct(p)
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    if (e.target.closest('[data-status-dropdown]')) return
                    if (e.target.closest('[data-transfers-edit]')) return
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
                {visibleProductColumnOrder.map((logicalIdx, visualIdx) =>
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

      {selectedProductIds.size > 0 && (() => {
        let packSelected = 0
        let nonPackSelected = 0
        selectedProductIds.forEach((id) => {
          const p = baseProducts.find((row) => row.id === id)
          if (productIsPackConstrained(p)) packSelected += 1
          else nonPackSelected += 1
        })
        const hasPackInSelection = packSelected > 0
        const onlyPackRowsSelected = hasPackInSelection && nonPackSelected === 0
        return (
        <div
          className="fixed bottom-6 left-1/2 z-50 flex w-max max-w-[min(920px,calc(100vw-2rem))] -translate-x-1/2 flex-col gap-2 rounded-[8px] px-6 py-3"
          style={{ background: '#1A1A2E', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}
        >
          <div className="flex items-center gap-4">
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
                disabled={onlyPackRowsSelected}
                onClick={() => {
                  if (onlyPackRowsSelected) return
                  setBulkChangeStatusOpen(false)
                  setBulkChangeUnitsOpen((o) => !o)
                }}
                className={`px-4 py-2 rounded-[4px] text-[14px] font-medium ${
                  onlyPackRowsSelected
                    ? 'cursor-not-allowed text-white/40'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Change units
              </button>
              {bulkChangeUnitsOpen && !onlyPackRowsSelected && (
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
            {onlyPackRowsSelected && (
              <button
                type="button"
                onClick={handleBulkUndoEditsProducts}
                className="px-4 py-2 rounded-[4px] text-[14px] font-medium text-white hover:bg-white/10"
              >
                Undo edits
              </button>
            )}
          </div>
          {hasPackInSelection && (
            <p className="text-[12px] leading-snug text-white/70">
              Change units doesn&apos;t apply to pack rows — status and undo will apply
            </p>
          )}
        </div>
        )
      })()}
      {transfersModalProductId != null &&
        (() => {
          const modalProduct = baseProducts.find((row) => row.id === transfersModalProductId)
          if (!modalProduct) return null
          const packMultiple = Number(modalProduct.packMultiple) || 0
          const packUnits = getEffectivePackTransfers(modalProduct)
          const packCount = packMultiple > 0 ? packUnits / packMultiple : 0
          const rebalUnits = Number(modalProduct.rebalTransfers) || 0
          const showPacks = productHasMixedFulfilment(modalProduct) && packUnits > 0
          const showRebal = rebalUnits > 0
          const looseNum = Number(editingTransfersLooseValue)
          const canStepDown = Number.isFinite(looseNum) && looseNum > 0
          const bodyCopy =
            'This updates the replenishment quantity. Rebalancing and pack units can be changed on the Transfer drilldown.'

          return createPortal(
            <div
              ref={transfersPopoverRef}
              data-transfers-edit-popover
              role="dialog"
              aria-modal="false"
              aria-labelledby="edit-replenishment-units-title"
              className="fixed z-[10000] flex w-[300px] flex-col overflow-hidden rounded-[8px] border border-[#e5e7eb] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
              style={{ left: transfersPopoverCoords.left, top: transfersPopoverCoords.top }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex shrink-0 items-start justify-between gap-2 border-b border-[#eaeaea] px-3 py-2">
                <h2
                  id="edit-replenishment-units-title"
                  className="text-[14px] font-semibold leading-snug text-[#0a0a0a]"
                >
                  Edit replenishment units
                </h2>
                <button
                  type="button"
                  onClick={handleCloseTransfersModal}
                  className="flex size-6 shrink-0 items-center justify-center rounded-[4px] text-[#6b7280] hover:bg-[#f3f4f6]"
                  aria-label="Close"
                >
                  <X className="size-4" strokeWidth={2} />
                </button>
              </div>
              <div className="flex flex-col gap-2 px-3 py-2.5">
                <p className="text-[12px] leading-snug text-[#4b535c]">{bodyCopy}</p>
                <div className="flex flex-col gap-1.5">
                  {showPacks && (
                    <div className="flex items-center justify-between gap-3 text-[12px] text-[#6b7280]">
                      <span>Packs</span>
                      <span className="text-right tabular-nums">
                        {packCount} × {packMultiple} units ({packUnits} units total)
                      </span>
                    </div>
                  )}
                  {showRebal && (
                    <div className="flex items-center justify-between gap-3 text-[12px] text-[#6b7280]">
                      <span>Rebalancing</span>
                      <span className="tabular-nums">{rebalUnits} units</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3 text-[12px] text-[#0a0a0a]">
                    <span className="font-medium">Loose</span>
                    <div className="flex items-center gap-2">
                      <div className="flex overflow-hidden rounded-[4px] border border-[#e9eaeb]">
                        <input
                          type="number"
                          min="0"
                          step={1}
                          value={editingTransfersLooseValue}
                          onChange={(e) => setEditingTransfersLooseValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleConfirmTransfersEdit()
                          }}
                          className="h-8 w-14 border-0 px-2 text-right text-[12px] text-[#0a0a0a] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          aria-label="Loose replenishment units"
                          autoFocus
                        />
                        <div className="flex flex-col border-l border-[#e9eaeb]">
                          <button
                            type="button"
                            aria-label="Increase loose units"
                            className="flex h-4 w-6 items-center justify-center text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#0a0a0a]"
                            onClick={() => {
                              const n = Number(editingTransfersLooseValue)
                              const next = Number.isFinite(n) ? n + 1 : 1
                              setEditingTransfersLooseValue(String(Math.max(0, next)))
                            }}
                          >
                            <ChevronUp size={11} strokeWidth={2.5} aria-hidden />
                          </button>
                          <button
                            type="button"
                            aria-label="Decrease loose units"
                            disabled={!canStepDown}
                            className="flex h-4 w-6 items-center justify-center border-t border-[#e9eaeb] text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#0a0a0a] disabled:cursor-not-allowed disabled:opacity-40"
                            onClick={() => {
                              const n = Number(editingTransfersLooseValue)
                              if (!Number.isFinite(n) || n <= 0) return
                              setEditingTransfersLooseValue(String(n - 1))
                            }}
                          >
                            <ChevronDown size={11} strokeWidth={2.5} aria-hidden />
                          </button>
                        </div>
                      </div>
                      <span className="text-[#4b535c]">units</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 justify-end border-t border-[#eaeaea] px-3 py-2">
                <button
                  type="button"
                  onClick={handleConfirmTransfersEdit}
                  className="h-8 rounded-[6px] bg-[#0267ff] px-3 text-[13px] font-medium text-white hover:bg-[#0256d6]"
                >
                  Confirm
                </button>
              </div>
            </div>,
            document.body
          )
        })()}
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
              Movement
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
                title="Stock on-hand at the receiving location. In transit & PFP shown as secondary context."
              >
                Units (to) <IconInfo />
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
              <span>477</span>
              <span className="text-[12px] text-[#4b535c]">32 trips</span>
            </div>
          </th>
        )
      case 3:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            <div className="flex flex-col items-end">
              <span>477</span>
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
            477
          </th>
        )
      case 6:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            477
          </th>
        )

      case 7:
        return (
          <th key={logicalIdx} className={`${pin}py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right`}>
            <div className="flex flex-col items-end">
              <span className="inline-flex items-baseline gap-1">
                <span className="text-[14px] text-[#0a0a0a]">2,450</span>
                <span className="text-[14px] text-[#0a0a0a]">SOH</span>
              </span>
              <span className="text-[12px] text-[#4b535c]">180 in transit & PFP</span>
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
              <span className="inline-flex items-baseline gap-1">
                <span className="text-[14px] text-[#0a0a0a]">{loc.stockInCirculation ?? '—'}</span>
                <span className="text-[14px] text-[#0a0a0a]">SOH</span>
              </span>
              {(loc.stockInTransit ?? 0) > 0 && (
                <span className="text-[12px] text-[#4b535c]">
                  {loc.stockInTransit} in transit & PFP
                </span>
              )}
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
  { id: 'productDetails', label: 'SKU', alignment: 'left', minWidth: 'min-w-[260px]' },
  { id: 'fromLocation', label: 'From location', alignment: 'left', minWidth: 'min-w-[150px]' },
  { id: 'toLocation', label: 'To location', alignment: 'left', minWidth: 'min-w-[150px]' },
  { id: 'movementType', label: 'Movement', alignment: 'left', minWidth: 'min-w-[100px]' },
  { id: 'transfers', label: 'Transfers', alignment: 'right', minWidth: 'min-w-[110px]' },
  {
    id: 'confidence',
    label: 'Confidence',
    alignment: 'right',
    minWidth: 'min-w-[110px]',
    tooltip:
      'Based on historical forecast accuracy at the product level. Low confidence means recommendations carry more uncertainty.',
  },
  { id: 'revenue', label: 'Revenue increase', alignment: 'right', minWidth: 'min-w-[110px]', tooltip: null },
  {
    id: 'recommended',
    label: 'Recommended transfers',
    alignment: 'right',
    minWidth: 'min-w-[140px]',
    tooltip: null,
  },
  {
    id: 'stockInCirculation',
    label: 'Units (to)',
    alignment: 'right',
    minWidth: 'min-w-[160px]',
    tooltip: 'Stock on-hand at the receiving location. In transit & PFP shown as secondary context.',
  },
  { id: 'salesL7', label: 'Sales', alignment: 'right', minWidth: 'min-w-[70px]', subtitle: 'L7D' },
  { id: 'salesL30', label: 'Sales', alignment: 'right', minWidth: 'min-w-[70px]', subtitle: 'L30D' },
  { id: 'salesL90', label: 'Sales', alignment: 'right', minWidth: 'min-w-[70px]', subtitle: 'L90D' },
  { id: 'forecast', label: 'Forecast', alignment: 'right', minWidth: 'min-w-[100px]', subtitle: 'per wk', tooltip: null },
  {
    id: 'warehouseUnits',
    label: 'Warehouse',
    alignment: 'right',
    minWidth: 'min-w-[140px]',
    tooltip: 'Units reserved to sell at this location and units available to allocate to stores',
  },
  {
    id: 'coverage',
    label: 'Coverage (to)',
    alignment: 'right',
    minWidth: 'min-w-[120px]',
    tooltip: 'How well current stock at the receiving location is meeting forecasted demand, before and after this proposal.',
  },
  {
    id: 'nextEvent',
    label: 'Next event',
    alignment: 'right',
    minWidth: 'min-w-[130px]',
    subtitle: 'Creation date',
    tooltip: 'The next scheduled inventory event for this product across all locations in scope',
  },
  {
    id: 'storageCapacity',
    label: 'Storage capacity (to)',
    alignment: 'right',
    minWidth: 'min-w-[140px]',
    tooltip: 'The storage capacity status of the location after the recommended transfers',
  },
  {
    id: 'initialAllocation',
    label: 'Initial allocation',
    alignment: 'right',
    minWidth: 'min-w-[100px]',
  },
  {
    id: 'firstStockDate',
    label: 'First stock',
    alignment: 'right',
    minWidth: 'min-w-[120px]',
    tooltip: 'Date stock was first received at the receiving location',
  },
  {
    id: 'firstSalesDate',
    label: 'First sales',
    alignment: 'right',
    minWidth: 'min-w-[120px]',
    tooltip: 'Date stock was first sold at the receiving location',
  },
  { id: 'status', label: 'Status', alignment: 'right', minWidth: 'min-w-[150px]' },
]

/** CX prototype — reduced default aligned with Products preferred set (+ From/To). No Stockouts column on Explorer. */
const EXPLORER_REDUCED_COLUMN_IDS = [
  'productDetails',
  'fromLocation',
  'toLocation',
  'movementType',
  'stockInCirculation',
  'salesL7',
  'salesL30',
  'salesL90',
  'forecast',
  'transfers',
  'recommended',
  'confidence',
  'revenue',
  'coverage',
  'status',
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
    confidenceFilters,
    statusFilters,
    fromLocationFilters = [],
    toLocationFilters = [],
    statusOverrides = {} }
) {
  return rows.filter((row) => {
    if (departmentFilters.length > 0 && !departmentFilters.includes(row.department)) {
      return false
    }
    if (productNameFilters.length > 0 && !productNameFilters.includes(row.productName)) {
      return false
    }
    if (confidenceFilters.length > 0 && !confidenceFilters.includes(row.confidence)) {
      return false
    }
    if (fromLocationFilters.length > 0 && !fromLocationFilters.includes(row.fromLocation)) {
      return false
    }
    if (toLocationFilters.length > 0 && !toLocationFilters.includes(row.toLocation)) {
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

/**
 * Build Explorer display rows: collapsed packRow (+ optional packChild when expanded),
 * then non-pack sku rows. Pack rows are display-only — never in EXPLORER_DATA.
 * Pack content sorts to the top for the prototype.
 */
function buildExplorerDisplayRows(filteredSkuRows, allSkuRows, expandedPackGroupIds = new Set()) {
  const packTotalCounts = new Map()
  const packMetaByGroup = new Map()

  for (const row of allSkuRows) {
    if (!row.isPackMember || !row.packGroupId) continue
    packTotalCounts.set(row.packGroupId, (packTotalCounts.get(row.packGroupId) ?? 0) + 1)
    if (!packMetaByGroup.has(row.packGroupId)) {
      const packDef = findMultiSkuPackByGroupId(row.packGroupId) ?? EXPLORER_MULTI_SKU_PACK
      packMetaByGroup.set(row.packGroupId, {
        packGroupId: row.packGroupId,
        packName: row.packName ?? packDef.packName,
        packId: row.packId ?? packDef.packId,
        packRatio: row.packRatio,
        packCount: row.packCount,
        packMultiple: row.packGroupMultiple ?? packDef.packMultiple,
        isVirtualPack: row.isVirtualPack,
        fromLocation: row.fromLocation,
        toLocation: row.toLocation,
        movementType: row.movementType,
        packRevenue: packDef.packRevenue,
        packRecommended: packDef.packRecommended,
        packRecommendedBadges: packDef.packRecommendedBadges,
        packConfidence: packDef.packConfidence,
        packCoverageWeeksBefore: packDef.packCoverageWeeksBefore,
        packCoverageWeeksAfter: packDef.packCoverageWeeksAfter,
        packCoverageTarget: packDef.packCoverageTarget,
        packCoverageLabel: packDef.packCoverageLabel,
        packStorageCapacity: packDef.packStorageCapacity,
        packStatus: packDef.packStatus,
      })
    }
  }

  const filteredMembersByGroup = new Map()
  for (const row of filteredSkuRows) {
    if (!row.isPackMember || !row.packGroupId) continue
    if (!filteredMembersByGroup.has(row.packGroupId)) {
      filteredMembersByGroup.set(row.packGroupId, [])
    }
    filteredMembersByGroup.get(row.packGroupId).push(row)
  }

  const emittedGroups = new Set()
  const packSection = []
  const nonPackRows = []
  // Loose companions for mixed fulfilment: keyed by SKU×from×to×movement
  const looseCompanionByPairKey = new Map()
  for (const row of filteredSkuRows) {
    if (row.isPackMember) continue
    if ((row.fulfilmentType ?? 'loose') !== 'loose') continue
    if (row.packMultiple != null && row.packMultiple > 0) continue
    looseCompanionByPairKey.set(explorerMixedFulfilmentPairKey(row), row)
  }
  const emittedLooseCompanionIds = new Set()

  for (const row of filteredSkuRows) {
    if (emittedLooseCompanionIds.has(row.id)) continue

    if (row.isPackMember && row.packGroupId) {
      if (emittedGroups.has(row.packGroupId)) continue
      emittedGroups.add(row.packGroupId)

      const members = filteredMembersByGroup.get(row.packGroupId) ?? []
      const meta = packMetaByGroup.get(row.packGroupId)
      const allMemberIds = allSkuRows
        .filter((r) => r.packGroupId === row.packGroupId)
        .map((r) => r.id)
      const packGroupId = row.packGroupId
      const packRow = {
        rowKind: 'packRow',
        id: `pack-row-${packGroupId}`,
        packGroupId,
        packName: meta?.packName ?? row.packName ?? row.packId,
        packId: meta?.packId ?? row.packId,
        packCount: meta?.packCount ?? row.packCount,
        packRatio: meta?.packRatio ?? row.packRatio,
        isVirtualPack: meta?.isVirtualPack ?? row.isVirtualPack,
        isSingleSkuPack: false,
        fromLocation: meta?.fromLocation ?? row.fromLocation,
        toLocation: meta?.toLocation ?? row.toLocation,
        movementType: meta?.movementType ?? row.movementType,
        packRevenue: meta?.packRevenue,
        packRecommended: meta?.packRecommended,
        packRecommendedBadges: meta?.packRecommendedBadges,
        packConfidence: meta?.packConfidence,
        packCoverageWeeksBefore: meta?.packCoverageWeeksBefore,
        packCoverageWeeksAfter: meta?.packCoverageWeeksAfter,
        packCoverageTarget: meta?.packCoverageTarget,
        packCoverageLabel: meta?.packCoverageLabel,
        packStorageCapacity: meta?.packStorageCapacity,
        packStatus: meta?.packStatus,
        status: meta?.packStatus,
        shownSkuCount: members.length,
        totalSkuCount: packTotalCounts.get(packGroupId) ?? members.length,
        memberIds: members.map((m) => m.id),
        allMemberIds,
      }
      packSection.push(packRow)

      if (expandedPackGroupIds.has(packGroupId)) {
        for (const member of members) {
          packSection.push({ rowKind: 'packChild', ...member })
        }
      }
      continue
    }

    const isSingleSkuPack =
      row.packMultiple != null && row.packMultiple > 0 && !row.isPackMember
    if (isSingleSkuPack) {
      const packGroupId = `single-${row.id}`
      const looseTwin = looseCompanionByPairKey.get(explorerMixedFulfilmentPairKey(row))
      const packRow = {
        rowKind: 'packRow',
        id: `pack-row-${packGroupId}`,
        packGroupId,
        packName: row.productName,
        packId: row.sku,
        packCount: Math.round(row.transfers / row.packMultiple),
        packRatio: { [row.sku]: row.packMultiple },
        packMultiple: row.packMultiple,
        isVirtualPack: Boolean(row.isVirtualPack),
        isSingleSkuPack: true,
        fromLocation: row.fromLocation,
        toLocation: row.toLocation,
        movementType: row.movementType,
        packRevenue: row.revenue,
        packRecommended: row.recommended,
        packRecommendedBadges: row.recommendedBadges,
        packConfidence: row.confidence,
        packCoverageWeeksBefore: row.coverageWeeksBefore,
        packCoverageWeeksAfter: row.coverageWeeksAfter,
        packCoverageTarget: row.coverageTarget,
        packCoverageLabel: row.coverageLabel,
        packStorageCapacity: row.storageCapacity,
        packStatus: row.status,
        status: row.status,
        shownSkuCount: 1,
        totalSkuCount: 1,
        memberIds: [row.id],
        allMemberIds: [row.id],
        // Mixed fulfilment: pair key for SKU-locations dedupe
        pairedLooseRowId: looseTwin?.id ?? null,
      }
      packSection.push(packRow)
      if (expandedPackGroupIds.has(packGroupId)) {
        packSection.push({ rowKind: 'packChild', ...row, isPackMember: true })
      }
      if (looseTwin) {
        packSection.push({
          rowKind: 'sku',
          ...looseTwin,
          pairedPackMemberId: row.id,
        })
        emittedLooseCompanionIds.add(looseTwin.id)
      }
      continue
    }

    nonPackRows.push({ rowKind: 'sku', ...row })
  }

  return [...packSection, ...nonPackRows]
}

const EXPLORER_TABLE_COLUMN_COUNT = EXPLORER_TABLE_COLUMNS.length
const EXPLORER_TABLE_TOTAL_COLUMN_COUNT = EXPLORER_TABLE_COLUMN_COUNT + 1

function ExplorerTransfersInput({
  value,
  onChange,
  className = '',
  widthClass = 'w-16',
  step,
  onFocus,
  onBlur,
  onKeyDown,
}) {
  return (
    <input
      type="number"
      min={0}
      step={step}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onClick={(e) => e.stopPropagation()}
      className={`${widthClass} h-7 px-2 rounded-[4px] border text-[14px] text-[#0a0a0a] text-right focus:outline-none ${
        className || 'border-[#e9eaeb]'
      }`}
    />
  )
}

function ExplorerOvercommitBanner({ overcommittedLocations }) {
  if (!overcommittedLocations.length) return null
  const visible = overcommittedLocations.slice(0, 3)
  const remaining = overcommittedLocations.length - visible.length

  return (
    <div className="mb-3 flex flex-col gap-1.5 rounded-[6px] border border-[#FCD34D] bg-[#FEF3C7] px-3 py-2.5">
      {visible.map(({ name, overBy, editedCount }) => (
        <div key={name} className="flex items-start gap-1.5 text-[13px] leading-snug text-[#B45309]">
          <span className="mt-0.5 shrink-0 text-[#B45309]">
            <IconWarning />
          </span>
          <span>
            {name} is overcommitted by {overBy} units across {editedCount} edited row
            {editedCount === 1 ? '' : 's'}
          </span>
        </div>
      ))}
      {remaining > 0 && (
        <div className="flex items-start gap-1.5 text-[13px] leading-snug text-[#B45309]">
          <span className="mt-0.5 shrink-0 text-[#B45309]">
            <IconWarning />
          </span>
          <span>
            and {remaining} more location{remaining === 1 ? '' : 's'} overcommitted
          </span>
        </div>
      )}
    </div>
  )
}

function renderExplorerBodyCell(row, col, {
  explorerTdClass,
  explorerStatusTdClass,
  getEffectiveStatus,
  handleExplorerStatusChange,
  getEffectiveTransfers,
  handleTransfersEdit,
  onOpenProductTransfers,
  getAvailableToSend,
  isLocationOvercommitted,
  explorerTransferOverrides,
  editingTransfersRowId,
  editingTransfersValue,
  packInputError,
  beginTransfersEdit,
  setEditingTransfersValue,
  setPackInputError,
  commitTransfersEdit,
  cancelTransfersEdit }) {
  const alignClass = col.alignment === 'right' ? 'text-right' : ''

  switch (col.id) {
    case 'productDetails':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth}`}>
          <ExplorerSkuProductDetailsContent row={row} />
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

      // Multi-SKU pack children: display-only units + pack membership label
      if (row.isPackMember) {
        return (
          <td key={col.id} className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[14px] text-[#0a0a0a]">{effectiveTransfers}</span>
              <span className="text-[11px] text-[#878d94]">Part of {row.packId}</span>
            </div>
          </td>
        )
      }

      const availableToSend = getAvailableToSend?.(row) ?? 0
      const isOvercommitted = isLocationOvercommitted?.(row.fromLocation) ?? false
      const isEditedRow =
        explorerTransferOverrides?.[row.id] !== undefined &&
        explorerTransferOverrides[row.id] !== row.transfers
      const availableConstrained = !isOvercommitted && availableToSend <= 0
      const isSingleSkuPack =
        row.packMultiple != null && row.packMultiple > 0 && !row.isPackMember
      const isEditingThis = editingTransfersRowId === row.id
      const packCount = isSingleSkuPack
        ? Math.ceil(effectiveTransfers / row.packMultiple)
        : 0

      if (isSingleSkuPack) {
        return (
          <td
            key={col.id}
            className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}
            onClick={(e) => e.stopPropagation()}
          >
            <TuHoverPopover
              panel={
                <ExplorerTransfersHoverCard
                  row={row}
                  transferUnits={effectiveTransfers}
                  availableToSend={Math.max(0, availableToSend)}
                  isOvercommitted={isOvercommitted}
                  onOpenProductTransfers={onOpenProductTransfers}
                />
              }
            >
              <div className="flex flex-col items-end gap-0.5">
                <ExplorerTransfersInput
                  value={isEditingThis ? editingTransfersValue : String(effectiveTransfers)}
                  step={row.packMultiple}
                  onFocus={() => beginTransfersEdit?.(row, effectiveTransfers)}
                  onChange={(newValue) => {
                    setEditingTransfersValue?.(newValue)
                    setPackInputError?.(false)
                  }}
                  onBlur={() => {
                    commitTransfersEdit?.(row)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur()
                    if (e.key === 'Escape') {
                      cancelTransfersEdit?.()
                      e.currentTarget.blur()
                    }
                  }}
                  className={
                    isEditingThis && packInputError
                      ? 'border-[#E30D3C]'
                      : isOvercommitted && isEditedRow
                        ? 'border-[#DC2626]'
                        : undefined
                  }
                />
                {isEditingThis && packInputError && (
                  <span className="text-[11px] text-[#E30D3C]">Multiple of {row.packMultiple}</span>
                )}
                {packCount > 0 && (
                  <span className="text-[12px] text-[#4b535c]">{formatPackLabel(packCount)}</span>
                )}
                {isOvercommitted ? (
                  <span className="text-[12px] text-[#B45309]">availability exceeded</span>
                ) : (
                  <span
                    className={`text-[12px] ${
                      availableConstrained ? 'text-[#B45309]' : 'text-[#166534]'
                    }`}
                  >
                    {availableToSend} available to send
                  </span>
                )}
              </div>
            </TuHoverPopover>
          </td>
        )
      }

      return (
        <td
          key={col.id}
          className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}
          onClick={(e) => e.stopPropagation()}
        >
          <TuHoverPopover
            panel={
              <ExplorerTransfersHoverCard
                row={row}
                transferUnits={effectiveTransfers}
                availableToSend={Math.max(0, availableToSend)}
                isOvercommitted={isOvercommitted}
                onOpenProductTransfers={onOpenProductTransfers}
              />
            }
          >
            <div className="flex flex-col items-end gap-0.5">
              <ExplorerTransfersInput
                value={effectiveTransfers}
                onChange={(newValue) => handleTransfersEdit(row.id, newValue)}
                className={
                  isOvercommitted && isEditedRow ? 'border-[#DC2626]' : undefined
                }
              />
              {isOvercommitted ? (
                <span className="text-[12px] text-[#B45309]">availability exceeded</span>
              ) : (
                <span
                  className={`text-[12px] ${
                    availableConstrained ? 'text-[#B45309]' : 'text-[#166534]'
                  }`}
                >
                  {availableToSend} available to send
                </span>
              )}
            </div>
          </TuHoverPopover>
        </td>
      )
    }
    case 'revenue': {
      const revenueStale = explorerRowHasPackUnitOverride(row, explorerTransferOverrides)
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}>
          <span className={`text-[14px] ${revenueStale ? 'text-[#9ca3af]' : 'text-[#0a0a0a]'}`}>
            {row.revenue}
          </span>
        </td>
      )
    }
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
    case 'coverage': {
      const coverageStale = explorerRowHasPackUnitOverride(row, explorerTransferOverrides)
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}>
          <span className={`text-[14px] ${coverageStale ? 'text-[#9ca3af]' : 'text-[#0a0a0a]'}`}>
            {row.coverageWeeksBefore} → {row.coverageWeeksAfter} wks
          </span>
        </td>
      )
    }
    case 'nextEvent':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}>
          <ProductNextEventCell nextEvent={row.nextEvent} />
        </td>
      )
    case 'salesL7':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}>
          <span className="text-[14px] text-[#0a0a0a]">{row.salesL7 ?? '—'}</span>
        </td>
      )
    case 'salesL30':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}>
          <span className="text-[14px] text-[#0a0a0a]">{row.salesL30 ?? '—'}</span>
        </td>
      )
    case 'salesL90':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}>
          <span className="text-[14px] text-[#0a0a0a]">{row.salesL90 ?? '—'}</span>
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
            <span className="inline-flex items-baseline gap-1 text-[14px] text-[#0a0a0a]">
              <span>
                {row.stockBefore} → {row.stockAfter}
              </span>
              <span>SOH</span>
            </span>
            {row.stockInTransitAndPfp > 0 && (
              <span className="text-[12px] text-[#4b535c]">
                {row.stockInTransitAndPfp} in transit & PFP
              </span>
            )}
            {row.stockFromOtherStores != null && (
              <span className="text-[12px] text-[#4b535c]">
                +{row.stockFromOtherStores} from other stores
              </span>
            )}
          </div>
        </td>
      )
    case 'storageCapacity': {
      const storageStale = explorerRowHasPackUnitOverride(row, explorerTransferOverrides)
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}>
          <div className="flex justify-end">
            <StorageCapacityPill value={row.storageCapacity} stale={storageStale} />
          </div>
        </td>
      )
    }
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
          <span className="text-[14px] text-[#0a0a0a]">{row.initialAllocation}</span>
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
          {totals.transfers} units
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
    case 'salesL7':
      return (
        <th key={col.id} className={`${baseClass} ${col.minWidth} text-right`}>
          {totals.salesL7}
        </th>
      )
    case 'salesL30':
      return (
        <th key={col.id} className={`${baseClass} ${col.minWidth} text-right`}>
          {totals.salesL30}
        </th>
      )
    case 'salesL90':
      return (
        <th key={col.id} className={`${baseClass} ${col.minWidth} text-right`}>
          {totals.salesL90}
        </th>
      )
    case 'stockInCirculation':
      return (
        <th key={col.id} className={`${baseClass} ${col.minWidth} text-right`}>
          <div className="flex flex-col items-end">
            <span className="inline-flex items-baseline gap-1 text-[14px] text-[#0a0a0a]">
              <span>{totals.stockBeforeAfter}</span>
              <span>SOH</span>
            </span>
            {totals.inTransit != null && (
              <span className="text-[12px] text-[#4b535c]">{totals.inTransit}</span>
            )}
          </div>
        </th>
      )
    case 'status':
      return <th key={col.id} className={`${explorerStatusTotalsThClass} ${col.minWidth}`} />
    default:
      return <th key={col.id} className={`${emptyClass} ${col.minWidth}`} />
  }
}

const EXPLORER_PACK_MUTED_DASH = (
  <span className="text-[14px] text-[#9ca3af]">—</span>
)

/** Shared Explorer SKU / product-details cell content (picture, name, ID, colour). */
function ExplorerSkuProductDetailsContent({
  row,
  wrapperClassName = '',
}) {
  return (
    <TuHoverPopover panel={<SkuDetailsHoverCard row={row} />}>
      <div className={`flex min-w-0 items-start gap-4 ${wrapperClassName}`}>
        <div className="h-12 w-12 shrink-0 rounded-[4px] bg-[#f3f4f6]" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[14px] font-medium text-[#0a0a0a]">{row.productName}</span>
          <span className="truncate text-[12px] text-[#4b535c]">{row.sku}</span>
          <span className="text-[12px] text-[#4b535c]">{row.colour}</span>
        </div>
      </div>
    </TuHoverPopover>
  )
}

function renderExplorerPackRowCell(packRow, col, {
  explorerTdClass,
  explorerStatusTdClass,
  getEffectiveStatus,
  handlePackRowStatusChange,
  effectivePackCount,
  totalUnits,
  packStale,
  handlePackRowCountEdit,
  getAvailableToSend,
  isLocationOvercommitted,
}) {
  const alignClass = col.alignment === 'right' ? 'text-right' : ''

  switch (col.id) {
    case 'productDetails': {
      const showPartialNote = packRow.shownSkuCount < packRow.totalSkuCount
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth}`}>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-[14px] font-medium text-[#0a0a0a]">
              {packRow.packName ?? packRow.packId}
            </span>
            <span className="truncate text-[12px] text-[#4b535c]">{packRow.packId}</span>
            {showPartialNote && (
              <span className="text-[11px] text-[#878d94]">
                {packRow.shownSkuCount} of {packRow.totalSkuCount} SKUs shown
              </span>
            )}
          </div>
        </td>
      )
    }
    case 'fromLocation':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} text-[#0a0a0a]`}>
          {packRow.fromLocation}
        </td>
      )
    case 'toLocation':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} text-[#0a0a0a]`}>
          {packRow.toLocation}
        </td>
      )
    case 'movementType':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth}`}>
          <MovementTypePills movementType={[packRow.movementType]} />
        </td>
      )
    case 'transfers': {
      // Transfers is the edited value — never apply Batch B stale muting here
      // Packs primary (input + muted unit), units secondary, packs available tertiary
      // Multi-SKU: units-per-pack = sum of packRatio (same as getExplorerPackUnitsPerPack)
      const availableUnits = getAvailableToSend?.(packRow) ?? 0
      const unitsPerPack = getExplorerPackUnitsPerPack(packRow)
      const packsAvailable =
        unitsPerPack > 0 ? Math.max(0, Math.floor(availableUnits / unitsPerPack)) : 0
      const isOvercommitted = isLocationOvercommitted?.(packRow.fromLocation) ?? false
      const availableConstrained = !isOvercommitted && packsAvailable <= 0
      return (
        <td
          key={col.id}
          className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-end gap-0.5">
            <div className="inline-flex items-center gap-1 text-[#0a0a0a]">
              <ExplorerTransfersInput
                value={effectivePackCount}
                step={1}
                widthClass="w-12"
                onChange={(newValue) => handlePackRowCountEdit(packRow, newValue)}
              />
              <PackUnitLabel count={effectivePackCount} />
            </div>
            <span className="text-[12px] tabular-nums text-[#4b535c]">
              {totalUnits} units
            </span>
            {isOvercommitted ? (
              <span className="text-[12px] text-[#B45309]">availability exceeded</span>
            ) : (
              <span
                className={`whitespace-normal text-right text-[12px] leading-snug ${
                  availableConstrained ? 'text-[#B45309]' : 'text-[#166534]'
                }`}
              >
                {formatPackLabel(packsAvailable)} available to send
              </span>
            )}
          </div>
        </td>
      )
    }
    case 'revenue':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}>
          <span className={`text-[14px] ${packStale ? 'text-[#9ca3af]' : 'text-[#0a0a0a]'}`}>
            {packRow.packRevenue}
          </span>
        </td>
      )
    case 'recommended': {
      const recommendedPackCount = Number(packRow.packRecommended) || 0
      const unitsPerPack = getExplorerPackUnitsPerPack(packRow)
      const recommendedUnits = recommendedPackCount * unitsPerPack
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}>
          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex flex-wrap items-center justify-end gap-1">
              <PackCountDisplay count={recommendedPackCount} />
              {packRow.packRecommendedBadges?.map((badge) => (
                <span
                  key={badge}
                  className="bg-[#f8f8f8] text-[11px] font-medium text-[#0267ff] px-1.5 py-0.5 rounded"
                >
                  {badge}
                </span>
              ))}
            </span>
            {recommendedUnits > 0 && (
              <span className="text-[12px] text-[#4b535c]">{recommendedUnits} units</span>
            )}
          </div>
        </td>
      )
    }
    case 'confidence':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}>
          <div className="flex justify-end">
            <ConfidencePill value={packRow.packConfidence} />
          </div>
        </td>
      )
    case 'coverage':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}>
          <span className={`text-[14px] ${packStale ? 'text-[#9ca3af]' : 'text-[#0a0a0a]'}`}>
            {packRow.packCoverageWeeksBefore} → {packRow.packCoverageWeeksAfter} wks
          </span>
        </td>
      )
    case 'storageCapacity':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}>
          <div className="flex justify-end">
            <StorageCapacityPill value={packRow.packStorageCapacity} stale={packStale} />
          </div>
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
              rowId={`explorer-${packRow.id}`}
              value={getEffectiveStatus(packRow)}
              onChange={(statusId) => handlePackRowStatusChange(packRow, statusId)}
            />
          </div>
        </td>
      )
    default:
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth} ${alignClass}`}>
          {EXPLORER_PACK_MUTED_DASH}
        </td>
      )
  }
}

function renderExplorerPackChildCell(child, col, {
  explorerTdClass,
  explorerStatusTdClass,
  getEffectiveTransfers,
  explorerTransferOverrides,
}) {
  const alignClass = col.alignment === 'right' ? 'text-right' : ''
  const childTdClass = `${explorerTdClass} text-[13px] leading-snug`

  switch (col.id) {
    case 'productDetails':
      return (
        <td key={col.id} className={`${explorerTdClass} ${col.minWidth}`}>
          <ExplorerSkuProductDetailsContent
            row={child}
            wrapperClassName="pl-6"
          />
        </td>
      )
    case 'stockInCirculation':
      return (
        <td key={col.id} className={`${childTdClass} ${col.minWidth} ${alignClass}`}>
          <div className="flex flex-col items-end gap-0.5">
            <span className="inline-flex items-baseline gap-1 text-[13px] text-[#9ca3af]">
              <span>
                {child.stockBefore} → {child.stockAfter}
              </span>
              <span>SOH</span>
            </span>
          </div>
        </td>
      )
    case 'transfers': {
      const effectiveTransfers = getEffectiveTransfers(child)
      return (
        <td key={col.id} className={`${childTdClass} ${col.minWidth} ${alignClass}`}>
          <span className="text-[13px] text-[#0a0a0a] tabular-nums">{effectiveTransfers}</span>
        </td>
      )
    }
    case 'revenue':
      return (
        <td key={col.id} className={`${childTdClass} ${col.minWidth} ${alignClass}`}>
          {EXPLORER_PACK_MUTED_DASH}
        </td>
      )
    case 'coverage':
      return (
        <td key={col.id} className={`${childTdClass} ${col.minWidth} ${alignClass}`}>
          <span className="text-[13px] text-[#9ca3af]">
            {child.coverageWeeksBefore} → {child.coverageWeeksAfter} wks
          </span>
        </td>
      )
    case 'status':
      return (
        <td key={col.id} className={`${explorerStatusTdClass} ${col.minWidth}`}>
          {EXPLORER_PACK_MUTED_DASH}
        </td>
      )
    default:
      return (
        <td key={col.id} className={`${childTdClass} ${col.minWidth} ${alignClass}`}>
          {EXPLORER_PACK_MUTED_DASH}
        </td>
      )
  }
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
  explorerConfidenceFilters,
  setExplorerConfidenceFilters,
  explorerStatusFilters,
  setExplorerStatusFilters,
  explorerFromLocationFilters,
  setExplorerFromLocationFilters,
  explorerToLocationFilters,
  setExplorerToLocationFilters,
  onOpenProductTransfers }) {
  const [explorerSearch, setExplorerSearch] = useState('')
  const [explorerActiveQuickFilter, setExplorerActiveQuickFilter] = useState(null)
  const [explorerFiltersDropdownOpen, setExplorerFiltersDropdownOpen] = useState(false)
  const [explorerBulkChangeStatusOpen, setExplorerBulkChangeStatusOpen] = useState(false)
  const [explorerBulkChangeUnitsOpen, setExplorerBulkChangeUnitsOpen] = useState(false)
  const [explorerReducedColumns, setExplorerReducedColumns] = useState(true)
  const [explorerBulkActionError, setExplorerBulkActionError] = useState(null)
  const [editingTransfersRowId, setEditingTransfersRowId] = useState(null)
  const [editingTransfersValue, setEditingTransfersValue] = useState('')
  const [packInputError, setPackInputError] = useState(false)
  const [expandedPackGroupIds, setExpandedPackGroupIds] = useState(() => new Set())
  const explorerSelectAllRef = useRef(null)
  const explorerBulkErrorTimeoutRef = useRef(null)

  const togglePackExpanded = (packGroupId) => {
    setExpandedPackGroupIds((prev) => {
      const next = new Set(prev)
      if (next.has(packGroupId)) next.delete(packGroupId)
      else next.add(packGroupId)
      return next
    })
  }

  const dismissExplorerBulkActionError = () => {
    if (explorerBulkErrorTimeoutRef.current) {
      clearTimeout(explorerBulkErrorTimeoutRef.current)
      explorerBulkErrorTimeoutRef.current = null
    }
    setExplorerBulkActionError(null)
  }

  const showExplorerBulkActionError = (message) => {
    if (explorerBulkErrorTimeoutRef.current) {
      clearTimeout(explorerBulkErrorTimeoutRef.current)
    }
    setExplorerBulkActionError(message)
    explorerBulkErrorTimeoutRef.current = setTimeout(() => {
      setExplorerBulkActionError(null)
      explorerBulkErrorTimeoutRef.current = null
    }, 4000)
  }

  useEffect(() => {
    return () => {
      if (explorerBulkErrorTimeoutRef.current) {
        clearTimeout(explorerBulkErrorTimeoutRef.current)
      }
    }
  }, [])

  const visibleColumns = useMemo(() => {
    if (!explorerReducedColumns) return EXPLORER_TABLE_COLUMNS
    const byId = new Map(EXPLORER_TABLE_COLUMNS.map((col) => [col.id, col]))
    return EXPLORER_REDUCED_COLUMN_IDS.map((id) => byId.get(id)).filter(Boolean)
  }, [explorerReducedColumns])

  const handleExplorerStatusChange = (rowId, newStatus) => {
    setExplorerStatusOverrides((prev) => ({ ...prev, [rowId]: newStatus }))
  }

  const handleTransfersEdit = (rowId, newValue) => {
    const numValue = Number.isFinite(parseInt(newValue, 10)) ? parseInt(newValue, 10) : 0
    setExplorerTransferOverrides((prev) => ({ ...prev, [rowId]: numValue }))
    setExplorerStatusOverrides((prev) => ({ ...prev, [rowId]: 'last_edited_by_user' }))
  }

  const beginTransfersEdit = (row, currentValue) => {
    setEditingTransfersRowId(row.id)
    setEditingTransfersValue(String(currentValue ?? 0))
    setPackInputError(false)
  }

  const cancelTransfersEdit = () => {
    setEditingTransfersRowId(null)
    setEditingTransfersValue('')
    setPackInputError(false)
  }

  const commitTransfersEdit = (row) => {
    const raw = editingTransfersValue
    if (row.packMultiple != null && row.packMultiple > 0 && !row.isPackMember) {
      if (raw === '' || !isPackMultipleValue(raw, row.packMultiple)) {
        setPackInputError(true)
        return false
      }
    }
    const next = Number(raw)
    if (!Number.isFinite(next) || next < 0) {
      cancelTransfersEdit()
      return false
    }
    handleTransfersEdit(row.id, next)
    cancelTransfersEdit()
    return true
  }

  const handlePackRowCountEdit = (packRow, newValue) => {
    const newPackCount = Number.isFinite(parseInt(newValue, 10))
      ? Math.max(0, parseInt(newValue, 10))
      : 0
    const memberIds = packRow.allMemberIds?.length ? packRow.allMemberIds : packRow.memberIds
    const transferUpdates = {}
    const statusUpdates = {}
    for (const memberId of memberIds) {
      const member = data.find((r) => r.id === memberId)
      if (!member) continue
      const ratio =
        packRow.packRatio?.[member.sku] ??
        member.packRatio?.[member.sku] ??
        (packRow.isSingleSkuPack ? packRow.packMultiple : null)
      if (ratio == null) continue
      transferUpdates[memberId] = newPackCount * ratio
      statusUpdates[memberId] = 'last_edited_by_user'
    }
    if (Object.keys(transferUpdates).length === 0) return
    setExplorerTransferOverrides((prev) => ({ ...prev, ...transferUpdates }))
    setExplorerStatusOverrides((prev) => ({ ...prev, ...statusUpdates }))
  }

  const handlePackRowStatusChange = (packRow, statusId) => {
    const memberIds = packRow.allMemberIds?.length ? packRow.allMemberIds : packRow.memberIds ?? []
    setExplorerStatusOverrides((prev) => {
      const next = { ...prev, [packRow.id]: statusId }
      for (const memberId of memberIds) {
        next[memberId] = statusId
      }
      return next
    })
  }

  const getEffectiveTransfers = (row) =>
    explorerTransferOverrides[row.id] !== undefined ? explorerTransferOverrides[row.id] : row.transfers

  const getEffectivePackCountForPackRow = (packRow) => {
    const memberId = packRow.allMemberIds?.[0] ?? packRow.memberIds?.[0]
    const member = data.find((r) => r.id === memberId)
    if (!member) return packRow.packCount ?? 0
    const ratio =
      packRow.packRatio?.[member.sku] ??
      member.packRatio?.[member.sku] ??
      (packRow.isSingleSkuPack ? packRow.packMultiple : null)
    if (!ratio) return packRow.packCount ?? 0
    return Math.round(getEffectiveTransfers(member) / ratio)
  }

  const getPackRowTotalUnits = (packRow) => {
    const memberIds = packRow.allMemberIds?.length ? packRow.allMemberIds : packRow.memberIds
    return memberIds.reduce((sum, id) => {
      const member = data.find((r) => r.id === id)
      if (!member) return sum
      return sum + getEffectiveTransfers(member)
    }, 0)
  }

  const locationCapacityStats = useMemo(() => {
    const stats = new Map()
    for (const row of data) {
      // Capacity is SKU-row only; pack display rows are never in source data
      const from = row.fromLocation
      const capacity = SENDING_LOCATION_CAPACITY[from]
      if (capacity === undefined) continue

      let entry = stats.get(from)
      if (!entry) {
        entry = { sum: 0, capacity, overBy: 0, editedCount: 0 }
        stats.set(from, entry)
      }

      const effective =
        explorerTransferOverrides[row.id] !== undefined
          ? explorerTransferOverrides[row.id]
          : row.transfers
      entry.sum += effective

      if (
        explorerTransferOverrides[row.id] !== undefined &&
        explorerTransferOverrides[row.id] !== row.transfers
      ) {
        entry.editedCount += 1
      }
    }

    for (const entry of stats.values()) {
      entry.overBy = Math.max(0, entry.sum - entry.capacity)
    }
    return stats
  }, [data, explorerTransferOverrides])

  const getAvailableToSend = (row) => {
    const entry = locationCapacityStats.get(row.fromLocation)
    if (!entry) return 0
    return entry.capacity - entry.sum
  }

  const isLocationOvercommitted = (fromLocation) => {
    const entry = locationCapacityStats.get(fromLocation)
    if (!entry) return false
    return entry.sum > entry.capacity
  }

  const overcommittedLocations = useMemo(() => {
    const list = []
    for (const [name, entry] of locationCapacityStats) {
      if (entry.overBy > 0) {
        list.push({ name, overBy: entry.overBy, editedCount: entry.editedCount })
      }
    }
    return list
  }, [locationCapacityStats])

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
        if (isExplorerPackRowId(rowId)) {
          for (const memberId of getPackMemberIds(rowId, data)) {
            next[memberId] = newStatus
          }
        }
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
      if (isExplorerPackRowId(rowId)) return
      const row = data.find((r) => r.id === rowId)
      // Pack members are not atomic selection targets; pack row is the edit point
      if (!row || row.isPackMember) return
      const effectiveCurrent = getEffectiveTransfers(row)
      const newValue =
        action === 'set_zero' ? 0 : Math.max(0, effectiveCurrent + action)
      if (newValue !== effectiveCurrent) {
        transferUpdates[rowId] = newValue
        statusUpdates[rowId] = 'last_edited_by_user'
      }
    })

    if (Object.keys(transferUpdates).length === 0) {
      setExplorerBulkChangeUnitsOpen(false)
      return
    }

    // Project per-sending-location sums with proposed updates (atomic capacity check)
    const projectedSums = new Map()
    for (const [fromLocation, entry] of locationCapacityStats) {
      projectedSums.set(fromLocation, entry.sum)
    }
    for (const rowId of Object.keys(transferUpdates)) {
      const row = data.find((r) => r.id === rowId)
      if (!row) continue
      const capacity = SENDING_LOCATION_CAPACITY[row.fromLocation]
      if (capacity === undefined) continue
      const currentEffective = getEffectiveTransfers(row)
      const next =
        (projectedSums.get(row.fromLocation) ?? 0) - currentEffective + transferUpdates[rowId]
      projectedSums.set(row.fromLocation, next)
    }
    for (const [fromLocation, projectedSum] of projectedSums) {
      const capacity = SENDING_LOCATION_CAPACITY[fromLocation]
      if (capacity !== undefined && projectedSum > capacity) {
        showExplorerBulkActionError(
          "Can't apply — one or more edits would overcommit a sending location."
        )
        setExplorerBulkChangeUnitsOpen(false)
        return
      }
    }

    setExplorerTransferOverrides((prev) => ({ ...prev, ...transferUpdates }))
    setExplorerStatusOverrides((prev) => ({ ...prev, ...statusUpdates }))
    setExplorerBulkChangeUnitsOpen(false)
  }

  const handleBulkUndoEdits = () => {
    if (!explorerSelectedRowIds.size) return

    setExplorerTransferOverrides((prev) => {
      const next = { ...prev }
      explorerSelectedRowIds.forEach((rowId) => {
        if (isExplorerPackRowId(rowId)) {
          for (const memberId of getPackMemberIds(rowId, data)) {
            delete next[memberId]
          }
        } else {
          delete next[rowId]
        }
      })
      return next
    })

    setExplorerStatusOverrides((prev) => {
      const next = { ...prev }
      explorerSelectedRowIds.forEach((rowId) => {
        delete next[rowId]
        if (isExplorerPackRowId(rowId)) {
          for (const memberId of getPackMemberIds(rowId, data)) {
            delete next[memberId]
          }
        }
      })
      return next
    })

    setExplorerBulkChangeUnitsOpen(false)
  }

  const getEffectiveStatus = (row) =>
    explorerStatusOverrides[row.id] ??
    (row.rowKind === 'packRow' ? row.packStatus ?? row.status : getRowStatus(row))

  const explorerFromLocationOptions = useMemo(() => {
    const names = new Set()
    for (const row of data) {
      if (row.fromLocation) names.add(row.fromLocation)
    }
    return [...names].sort((a, b) => a.localeCompare(b))
  }, [data])

  const explorerToLocationOptions = useMemo(() => {
    const names = new Set()
    for (const row of data) {
      if (row.toLocation) names.add(row.toLocation)
    }
    return [...names].sort((a, b) => a.localeCompare(b))
  }, [data])

  const explorerFilterCount =
    explorerDepartmentFilters.length +
    explorerProductNameFilters.length +
    explorerConfidenceFilters.length +
    explorerStatusFilters.length +
    explorerFromLocationFilters.length +
    explorerToLocationFilters.length

  const hasClearableExplorerFilters =
    explorerDepartmentFilters.length > 0 ||
    explorerProductNameFilters.length > 0 ||
    explorerConfidenceFilters.length > 0 ||
    explorerStatusFilters.length > 0 ||
    explorerFromLocationFilters.length > 0 ||
    explorerToLocationFilters.length > 0

  const hasAnyFilter =
    explorerDepartmentFilters.length > 0 ||
    explorerProductNameFilters.length > 0 ||
    explorerConfidenceFilters.length > 0 ||
    explorerStatusFilters.length > 0 ||
    explorerFromLocationFilters.length > 0 ||
    explorerToLocationFilters.length > 0

  useEffect(() => {
    onDrawerFiltersActiveChange?.(hasAnyFilter)
  }, [hasAnyFilter, onDrawerFiltersActiveChange])

  const clearAllExplorerFilters = () => {
    setExplorerDepartmentFilters([])
    setExplorerProductNameFilters([])
    setExplorerConfidenceFilters([])
    setExplorerStatusFilters([])
    setExplorerFromLocationFilters([])
    setExplorerToLocationFilters([])
  }

  const filteredData = useMemo(
    () =>
      filterExplorerRows(data, {
        departmentFilters: explorerDepartmentFilters,
        productNameFilters: explorerProductNameFilters,
        confidenceFilters: explorerConfidenceFilters,
        statusFilters: explorerStatusFilters,
        fromLocationFilters: explorerFromLocationFilters,
        toLocationFilters: explorerToLocationFilters,
        statusOverrides: explorerStatusOverrides }),
    [
      data,
      explorerDepartmentFilters,
      explorerProductNameFilters,
      explorerConfidenceFilters,
      explorerStatusFilters,
      explorerFromLocationFilters,
      explorerToLocationFilters,
      explorerStatusOverrides,
    ]
  )

  // Reset pack expand state when filter chips change (not on override/edit updates)
  useEffect(() => {
    setExpandedPackGroupIds(new Set())
  }, [
    explorerDepartmentFilters,
    explorerProductNameFilters,
    explorerConfidenceFilters,
    explorerStatusFilters,
    explorerFromLocationFilters,
    explorerToLocationFilters,
  ])

  const displayRows = useMemo(
    () => buildExplorerDisplayRows(filteredData, data, expandedPackGroupIds),
    [filteredData, data, expandedPackGroupIds]
  )

  const atomicSelectableIds = useMemo(
    () =>
      displayRows
        .filter((r) => r.rowKind === 'packRow' || r.rowKind === 'sku')
        .map((r) => r.id),
    [displayRows]
  )

  const toggleAllExplorerRows = () => {
    // Select-all: pack rows + non-pack SKUs — never packChild ids
    const allIds = atomicSelectableIds
    const allSelected = allIds.length > 0 && allIds.every((id) => explorerSelectedRowIds.has(id))
    setExplorerSelectedRowIds(allSelected ? new Set() : new Set(allIds))
  }

  const allExplorerRowsSelected =
    atomicSelectableIds.length > 0 &&
    atomicSelectableIds.every((id) => explorerSelectedRowIds.has(id))
  const someExplorerRowsSelected =
    atomicSelectableIds.some((id) => explorerSelectedRowIds.has(id)) &&
    !allExplorerRowsSelected

  useEffect(() => {
    if (explorerSelectAllRef.current) {
      explorerSelectAllRef.current.indeterminate = someExplorerRowsSelected
    }
  }, [someExplorerRowsSelected])

  const totals = useMemo(() => {
    // Metric sums: underlying filtered SKU rows (children). Display count: packs as 1 + non-pack SKUs.
    // Mixed fulfilment: pack+loose pair counts as 1 SKU-location (skip paired loose companions).
    const skuRows = filteredData
    const pairedLooseIds = new Set(
      displayRows
        .filter((r) => r.rowKind === 'packRow' && r.pairedLooseRowId)
        .map((r) => r.pairedLooseRowId)
    )
    const atomicCount = displayRows.filter((r) => {
      if (r.rowKind === 'packRow') return true
      if (r.rowKind === 'sku') return !pairedLooseIds.has(r.id)
      return false
    }).length
    const sumTransfers = skuRows.reduce((sum, row) => {
      const transfers =
        explorerTransferOverrides[row.id] !== undefined
          ? explorerTransferOverrides[row.id]
          : row.transfers
      return sum + transfers
    }, 0)
    const sumRevenueK = skuRows.reduce((sum, row) => sum + parseExplorerRevenueK(row.revenue), 0)
    const sumRecommended = skuRows.reduce((sum, row) => sum + parseInt(row.recommended, 10), 0)
    const sumSalesL7 = skuRows.reduce((sum, row) => sum + row.salesL7, 0)
    const sumSalesL30 = skuRows.reduce((sum, row) => sum + row.salesL30, 0)
    const sumSalesL90 = skuRows.reduce((sum, row) => sum + (row.salesL90 ?? 0), 0)
    const sumStockBefore = skuRows.reduce((sum, row) => sum + row.stockBefore, 0)
    const sumStockAfter = skuRows.reduce((sum, row) => sum + row.stockAfter, 0)
    const sumInTransitAndPfp = skuRows.reduce((sum, row) => sum + row.stockInTransitAndPfp, 0)
    return {
      skuLocations: `${atomicCount} SKU-locations`,
      transfers: `${sumTransfers}`,
      revenue: `€${sumRevenueK.toFixed(1)}K`,
      recommended: `${sumRecommended}`,
      salesL7: sumSalesL7,
      salesL30: sumSalesL30,
      salesL90: sumSalesL90,
      stockBeforeAfter: `${sumStockBefore} → ${sumStockAfter}`,
      inTransit:
        sumInTransitAndPfp > 0 ? `${sumInTransitAndPfp} in transit & PFP` : null }
  }, [filteredData, displayRows, explorerTransferOverrides])

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
    'sticky left-0 z-30 min-h-[86px] w-14 min-w-14 max-w-14 box-border bg-white px-4 py-3 align-top shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)] group-hover:bg-[#f9fafb]'
  const explorerCheckboxInputClass =
    'h-4 w-4 rounded border-2 border-[#e9eaeb] bg-white text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-0'

  const headerGrip = (
    <span className="inline-flex shrink-0 select-none" aria-hidden>
      <IconColumnDragHandle />
    </span>
  )

  return (
    <div className="flex flex-col gap-[15px]">
      {explorerBulkActionError && (
        <div
          role="alert"
          className="fixed bottom-24 left-1/2 z-[80] flex max-w-md -translate-x-1/2 items-start gap-2 rounded-[6px] border border-[#FCD34D] bg-[#FEF3C7] px-3 py-2.5 shadow-lg"
        >
          <span className="mt-0.5 shrink-0 text-[#B45309]">
            <IconWarning />
          </span>
          <span className="min-w-0 flex-1 text-[13px] leading-snug text-[#B45309]">
            {explorerBulkActionError}
          </span>
          <button
            type="button"
            onClick={dismissExplorerBulkActionError}
            className="shrink-0 rounded-[4px] p-0.5 text-[#B45309] hover:bg-[#FDE68A]"
            aria-label="Dismiss"
          >
            <IconClose className="size-3.5" />
          </button>
        </div>
      )}
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

                  <div className="border-t border-[#e5e7eb] pt-3 mt-3">
                    <div className="text-[12px] font-medium uppercase tracking-[0.04em] text-[#4b535c] mb-2">
                      From location
                    </div>
                    {explorerFromLocationOptions.map((loc) => (
                      <label
                        key={`from-${loc}`}
                        className="flex items-center gap-2 px-0 py-1.5 hover:bg-[#f3f4f6] cursor-pointer rounded-[4px]"
                      >
                        <input
                          type="checkbox"
                          checked={explorerFromLocationFilters.includes(loc)}
                          onChange={(e) => {
                            setExplorerFromLocationFilters((prev) =>
                              e.target.checked ? [...prev, loc] : prev.filter((x) => x !== loc)
                            )
                          }}
                          className="size-4 rounded border-[#d1d5db] text-[#0267ff]"
                        />
                        <span className="text-[14px] text-[#0a0a0a]">{loc}</span>
                      </label>
                    ))}
                  </div>

                  <div className="border-t border-[#e5e7eb] pt-3 mt-3">
                    <div className="text-[12px] font-medium uppercase tracking-[0.04em] text-[#4b535c] mb-2">
                      To location
                    </div>
                    {explorerToLocationOptions.map((loc) => (
                      <label
                        key={`to-${loc}`}
                        className="flex items-center gap-2 px-0 py-1.5 hover:bg-[#f3f4f6] cursor-pointer rounded-[4px]"
                      >
                        <input
                          type="checkbox"
                          checked={explorerToLocationFilters.includes(loc)}
                          onChange={(e) => {
                            setExplorerToLocationFilters((prev) =>
                              e.target.checked ? [...prev, loc] : prev.filter((x) => x !== loc)
                            )
                          }}
                          className="size-4 rounded border-[#d1d5db] text-[#0267ff]"
                        />
                        <span className="text-[14px] text-[#0a0a0a]">{loc}</span>
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
        <button
          type="button"
          title="CX prototype only — not a product feature"
          onClick={() => setExplorerReducedColumns((on) => !on)}
          className="ml-auto inline-flex max-w-[280px] items-start gap-1.5 rounded-[6px] border border-dashed border-[#9CA3AF] bg-[#F9FAFB] px-2.5 py-2 text-left text-[12px] leading-snug text-[#6B7280] shadow-sm hover:bg-[#F3F4F6]"
        >
          <span className="mt-0.5 shrink-0 text-[#9CA3AF]">
            <IconWarning />
          </span>
          <span>
            {explorerReducedColumns
              ? 'Reduced columns (prototype) — click for full'
              : 'Full columns (prototype) — click for reduced'}
          </span>
        </button>
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
          {explorerFromLocationFilters.map((loc) => (
            <span
              key={`from-${loc}`}
              className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-[4px] bg-[#f3f4f6] text-[#4b535c] border border-[#e5e7eb]"
            >
              <span>From location: {loc}</span>
              <button
                type="button"
                onClick={() => setExplorerFromLocationFilters((prev) => prev.filter((x) => x !== loc))}
                className="p-0.5 rounded-[4px] text-[#6b7280] hover:bg-[#e5e7eb] hover:text-[#374151]"
                aria-label={`Remove filter: From location ${loc}`}
              >
                <IconClose className="size-3.5" />
              </button>
            </span>
          ))}
          {explorerToLocationFilters.map((loc) => (
            <span
              key={`to-${loc}`}
              className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-[4px] bg-[#f3f4f6] text-[#4b535c] border border-[#e5e7eb]"
            >
              <span>To location: {loc}</span>
              <button
                type="button"
                onClick={() => setExplorerToLocationFilters((prev) => prev.filter((x) => x !== loc))}
                className="p-0.5 rounded-[4px] text-[#6b7280] hover:bg-[#e5e7eb] hover:text-[#374151]"
                aria-label={`Remove filter: To location ${loc}`}
              >
                <IconClose className="size-3.5" />
              </button>
            </span>
          ))}
          {hasClearableExplorerFilters && (
            <button
              type="button"
              onClick={clearAllExplorerFilters}
              className="text-[12px] font-medium text-[#4b535c] hover:text-[#0a0a0a]"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      <ExplorerOvercommitBanner overcommittedLocations={overcommittedLocations} />

    <div className="border border-[#e5e7eb] rounded-[8px] overflow-hidden bg-white">
      {/* Fill remaining viewport below filters/chips; sticky header + internal scroll */}
      <div className="max-h-[calc(100vh-220px)] overflow-x-auto overflow-y-auto">
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
                    disabled={filteredData.length === 0}
                    checked={allExplorerRowsSelected}
                    onChange={toggleAllExplorerRows}
                  />
                </label>
              </th>
              {visibleColumns.map((col) => {
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
            <tr className="border-b border-[#E9EAEB]">
              <th className={explorerCheckboxTotalsThClass} />
              {visibleColumns.map((col) =>
                renderExplorerTotalsCell(col, totals, {
                  explorerTotalsThClass,
                  explorerTotalsEmptyThClass,
                  explorerStatusTotalsThClass })
              )}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row) => {
              if (row.rowKind === 'packRow') {
                const isExpanded = expandedPackGroupIds.has(row.packGroupId)
                const effectivePackCount = getEffectivePackCountForPackRow(row)
                const totalUnits = getPackRowTotalUnits(row)
                const packStale = packRowHasOverride(row, explorerTransferOverrides, data)
                return (
                  <tr
                    key={row.id}
                    className="group border-b border-[#E9EAEB] bg-[#f9fafb] hover:bg-[#f3f4f6]"
                  >
                    <td
                      className={explorerCheckboxTdClass}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-start gap-1">
                        {!row.isSingleSkuPack ? (
                          <button
                            type="button"
                            className="flex size-6 items-center justify-center rounded-[4px] text-[#4b535c] hover:bg-[#e5e7eb]"
                            aria-label={isExpanded ? 'Collapse pack' : 'Expand pack'}
                            aria-expanded={isExpanded}
                            onClick={() => togglePackExpanded(row.packGroupId)}
                          >
                            {/* IconChevronRight ignores className — wrap for rotate */}
                            <span className={`inline-flex ${isExpanded ? 'rotate-90' : ''}`}>
                              <IconChevronRight />
                            </span>
                          </button>
                        ) : (
                          <span className="inline-block size-6 shrink-0" aria-hidden />
                        )}
                        <input
                          type="checkbox"
                          className={explorerCheckboxInputClass}
                          aria-label={`Select pack ${row.packName ?? row.packId}`}
                          checked={explorerSelectedRowIds.has(row.id)}
                          onChange={() => toggleExplorerRowSelection(row.id)}
                        />
                      </div>
                    </td>
                    {visibleColumns.map((col) =>
                      renderExplorerPackRowCell(row, col, {
                        explorerTdClass,
                        explorerStatusTdClass,
                        getEffectiveStatus,
                        handlePackRowStatusChange,
                        effectivePackCount,
                        totalUnits,
                        packStale,
                        handlePackRowCountEdit,
                        getAvailableToSend,
                        isLocationOvercommitted,
                      })
                    )}
                  </tr>
                )
              }

              if (row.rowKind === 'packChild') {
                return (
                  <tr
                    key={`pack-child-${row.id}`}
                    className="border-b border-[#E9EAEB] bg-[#fafafa]"
                  >
                    <td className={explorerCheckboxTdClass} aria-hidden />
                    {visibleColumns.map((col) =>
                      renderExplorerPackChildCell(row, col, {
                        explorerTdClass,
                        explorerStatusTdClass,
                        getEffectiveTransfers,
                        explorerTransferOverrides,
                      })
                    )}
                  </tr>
                )
              }

              return (
                <tr
                  key={row.id}
                  className="group border-b border-[#E9EAEB] bg-white hover:bg-[#f9fafb]"
                >
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
                  {visibleColumns.map((col) =>
                    renderExplorerBodyCell(row, col, {
                      explorerTdClass,
                      explorerStatusTdClass,
                      getEffectiveStatus,
                      handleExplorerStatusChange,
                      getEffectiveTransfers,
                      handleTransfersEdit,
                      onOpenProductTransfers,
                      getAvailableToSend,
                      isLocationOvercommitted,
                      explorerTransferOverrides,
                      editingTransfersRowId,
                      editingTransfersValue,
                      packInputError,
                      beginTransfersEdit,
                      setEditingTransfersValue,
                      setPackInputError,
                      commitTransfersEdit,
                      cancelTransfersEdit })
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>

      {explorerSelectedRowIds.size > 0 && (() => {
        let packSelected = 0
        let nonPackSelected = 0
        explorerSelectedRowIds.forEach((id) => {
          if (isExplorerPackRowId(id)) packSelected += 1
          else nonPackSelected += 1
        })
        const onlyPackRowsSelected = packSelected > 0 && nonPackSelected === 0
        const hasMixedPackSelection = packSelected > 0 && nonPackSelected > 0
        const changeUnitsDisabled = onlyPackRowsSelected
        return (
        <div
          className="fixed bottom-6 left-1/2 z-50 flex w-max max-w-[min(920px,calc(100vw-2rem))] -translate-x-1/2 flex-col gap-2 rounded-[8px] px-6 py-3"
          style={{ background: '#1A1A2E', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}
        >
          <div className="flex items-center gap-4">
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
                disabled={changeUnitsDisabled}
                onClick={() => {
                  if (changeUnitsDisabled) return
                  setExplorerBulkChangeStatusOpen(false)
                  setExplorerBulkChangeUnitsOpen((o) => !o)
                }}
                className={`px-4 py-2 rounded-[4px] text-[14px] font-medium ${
                  changeUnitsDisabled
                    ? 'cursor-not-allowed text-white/40'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Change units
              </button>
              {explorerBulkChangeUnitsOpen && !changeUnitsDisabled && (
                <>
                  <div
                    className="fixed inset-0 z-[60]"
                    aria-hidden
                    onClick={() => setExplorerBulkChangeUnitsOpen(false)}
                  />
                  <div
                    className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-[70] min-w-[280px] rounded-[6px] border border-[#e5e7eb] bg-white py-1 shadow-lg"
                    style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                  >
                    {hasMixedPackSelection && (
                      <div className="border-b border-[#e5e7eb] px-3 py-2 text-[11px] leading-snug text-[#6b7280]">
                        Doesn&apos;t apply to pack rows
                      </div>
                    )}
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
            {changeUnitsDisabled && (
              <button
                type="button"
                onClick={handleBulkUndoEdits}
                className="px-4 py-2 rounded-[4px] text-[14px] font-medium text-white hover:bg-white/10"
              >
                Undo edits
              </button>
            )}
          </div>
        </div>
        )
      })()}
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
                Warehouse
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
  const [explorerStatusOverrides, setExplorerStatusOverrides] = useState({})
  const [explorerTransferOverrides, setExplorerTransferOverrides] = useState({})
  const [explorerSelectedRowIds, setExplorerSelectedRowIds] = useState(new Set())
  const [explorerDepartmentFilters, setExplorerDepartmentFilters] = useState([])
  const [explorerProductNameFilters, setExplorerProductNameFilters] = useState([])
  const [explorerConfidenceFilters, setExplorerConfidenceFilters] = useState([])
  const [explorerStatusFilters, setExplorerStatusFilters] = useState([])
  const [explorerFromLocationFilters, setExplorerFromLocationFilters] = useState([])
  const [explorerToLocationFilters, setExplorerToLocationFilters] = useState([])
  const [productsTabSelectedProduct, setProductsTabSelectedProduct] = useState(null)
  const [tripStatusOverrides, setTripStatusOverrides] = useState({})
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [selectedTripIds, setSelectedTripIds] = useState(new Set())
  const [statusFilters, setStatusFilters] = useState([])
  const [filtersDropdownOpen, setFiltersDropdownOpen] = useState(false)
  const [productsDrawerFiltersActive, setProductsDrawerFiltersActive] = useState(false)
  const [locationsDrawerFiltersActive, setLocationsDrawerFiltersActive] = useState(false)
  const [explorerDrawerFiltersActive, setExplorerDrawerFiltersActive] = useState(false)

  const handleOpenProductTransfersFromExplorer = (productName) => {
    const product = findProductByName(productName)
    if (!product) return
    setProductsTabSelectedProduct(product)
    setActiveTab('products')
  }

  const handleOpenExplorerUnapprovedForProduct = (productName) => {
    setExplorerDepartmentFilters([])
    setExplorerConfidenceFilters([])
    setExplorerFromLocationFilters([])
    setExplorerToLocationFilters([])
    setExplorerProductNameFilters([productName])
    setExplorerStatusFilters(['unapproved', 'needs_review', 'edited'])
    setActiveTab('explorer')
  }

  const handleOpenExplorerUnapprovedForTrip = (trip) => {
    setExplorerDepartmentFilters([])
    setExplorerProductNameFilters([])
    setExplorerConfidenceFilters([])
    setExplorerFromLocationFilters(trip?.from ? [trip.from] : [])
    setExplorerToLocationFilters(trip?.to ? [trip.to] : [])
    setExplorerStatusFilters(['unapproved', 'needs_review', 'edited'])
    setActiveTab('explorer')
  }

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
  const tripApprovalTotals = tripsRows.reduce(
    (acc, row) => ({
      approved: acc.approved + (Number(row.approvedTransfers) || 0),
      unapproved: acc.unapproved + (Number(row.unapprovedTransfers) || 0),
    }),
    { approved: 0, unapproved: 0 }
  )
  const tripPacksTotal = tripsRows.reduce(
    (sum, row) => sum + (Number(row.packCount) || 0),
    0
  )
  const tripSummary = viewShowsFullDataset ? TRIPS_TAB_SUMMARY_TOTALS_FULL : TRIPS_TAB_SUMMARY_TOTALS_OPERA

  const [tripTableColWidths, setTripTableColWidths] = useState(() => [...TRIPS_TABLE_DEFAULT_COL_WIDTHS])
  const [tripColumnOrder, setTripColumnOrder] = useState(() =>
    Array.from({ length: TRIPS_TABLE_NUM_DATA_COLS }, (_, i) => i)
  )
  /** Status (logical col 7) only pins to the right when it is the trailing column after reorder. */
  const tripStatusColumnIsTrailing = tripColumnOrder[tripColumnOrder.length - 1] === 6

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
          </div>
        </div>

        {activeTab === 'products' ? (
          <ProductsDrilldown
            trip={TRIPS_OPERA[0]}
            onBack={() => {}}
            showBackButton={false}
            onDrawerFiltersActiveChange={setProductsDrawerFiltersActive}
            setExplorerProductNameFilters={setExplorerProductNameFilters}
            setExplorerStatusFilters={setExplorerStatusFilters}
            setActiveTab={setActiveTab}
            selectedProduct={productsTabSelectedProduct}
            onSelectedProductChange={setProductsTabSelectedProduct}
            setExplorerTransferOverrides={setExplorerTransferOverrides}
            onOpenExplorerUnapprovedForProduct={handleOpenExplorerUnapprovedForProduct}
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
            explorerConfidenceFilters={explorerConfidenceFilters}
            setExplorerConfidenceFilters={setExplorerConfidenceFilters}
            explorerStatusFilters={explorerStatusFilters}
            setExplorerStatusFilters={setExplorerStatusFilters}
            explorerFromLocationFilters={explorerFromLocationFilters}
            setExplorerFromLocationFilters={setExplorerFromLocationFilters}
            explorerToLocationFilters={explorerToLocationFilters}
            setExplorerToLocationFilters={setExplorerToLocationFilters}
            onOpenProductTransfers={handleOpenProductTransfersFromExplorer}
          />
        ) : selectedTrip ? (
            <ProductsDrilldown
              trip={selectedTrip}
              onBack={() => setSelectedTrip(null)}
              onDrawerFiltersActiveChange={setProductsDrawerFiltersActive}
              setExplorerProductNameFilters={setExplorerProductNameFilters}
              setExplorerStatusFilters={setExplorerStatusFilters}
              setActiveTab={setActiveTab}
              setExplorerTransferOverrides={setExplorerTransferOverrides}
              onOpenExplorerUnapprovedForProduct={handleOpenExplorerUnapprovedForProduct}
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
              <div className="flex items-center gap-2 shrink-0 ml-auto">
                <button
                  type="button"
                  className="h-10 px-4 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] font-medium text-[#22272f] hover:bg-[#f3f4f6] shrink-0"
                  aria-label="Save view"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="h-10 px-3 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#22272f] hover:bg-[#f3f4f6] shrink-0 inline-flex items-center gap-1.5"
                  aria-label="Default view"
                  aria-haspopup="listbox"
                >
                  Default view
                  <IconChevronDown />
                </button>
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
                                From location
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
                                To location
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
                              className="sticky top-0 z-20 bg-white relative h-[62px] min-h-[62px] whitespace-nowrap px-3 text-left align-middle font-medium text-[#0a0a0a] box-border"
                              {...dropProps}
                            >
                              <span className="inline-flex min-w-0 max-w-full items-center gap-2 whitespace-nowrap">
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
                        case 6:
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
                              className="sticky top-[62px] z-20 bg-white py-2 px-3 text-right"
                            >
                              <div className="flex flex-col items-end gap-0.5">
                                <span className="text-[12px] font-medium text-[#0a0a0a]">
                                  {tripSummary.transfers} units
                                </span>
                                {tripPacksTotal > 0 && (
                                  <span className="text-[11px] text-[#4b535c]">packs</span>
                                )}
                              </div>
                            </th>
                          )
                        case 3:
                          return (
                            <th
                              key={logicalIdx}
                              className="sticky top-[62px] z-20 bg-white py-2 pl-3 pr-8 text-[12px] font-medium text-[#0a0a0a]"
                            >
                              {tripSummary.revenue}
                            </th>
                          )
                        case 4:
                          return (
                            <th
                              key={logicalIdx}
                              className="sticky top-[62px] z-20 bg-white whitespace-nowrap py-2 px-3 text-left"
                            >
                              <div className="flex flex-col items-start gap-0.5">
                                <span className="text-[12px] font-medium text-[#0a0a0a]">
                                  {tripSummary.recommended} units
                                </span>
                                {tripPacksTotal > 0 && (
                                  <span className="text-[11px] text-[#4b535c]">packs</span>
                                )}
                              </div>
                            </th>
                          )
                        case 5:
                          return (
                            <th
                              key={logicalIdx}
                              className="sticky top-[62px] z-20 bg-white py-2 px-3 text-right text-[12px] font-medium text-[#0a0a0a]"
                            >
                              {tripSummary.products}
                            </th>
                          )
                        case 6:
                          return (
                            <th
                              key={logicalIdx}
                              className={`sticky top-[62px] bg-white py-2 px-3 text-right ${
                                tripStatusColumnIsTrailing
                                  ? 'right-0 z-30 shadow-[-4px_0_12px_-6px_rgba(15,23,42,0.12)]'
                                  : 'z-20'
                              }`}
                            >
                              <div className="flex flex-col items-end gap-0.5 text-[12px] font-medium">
                                {tripApprovalTotals.approved > 0 && (
                                  <span className="text-[#166534]">
                                    {tripApprovalTotals.approved} approved
                                  </span>
                                )}
                                {tripApprovalTotals.unapproved > 0 && (
                                  <span className="text-[#4b535c]">
                                    {tripApprovalTotals.unapproved} unapproved
                                  </span>
                                )}
                              </div>
                            </th>
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
                                  <div className="flex flex-col gap-0.5">
                                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                                      <span className="text-[#0a0a0a] font-medium">{row.from}</span>
                                      <TripLocationRoleTag
                                        label={getTripLocationRoleTag(
                                          row.fromLocationType,
                                          row.fromWarehouseRole
                                        )}
                                      />
                                    </span>
                                    <span className="text-[12px] text-[#4b535c]">{row.fromCode}</span>
                                  </div>
                                </td>
                              )
                            case 1:
                              return (
                                <td key={logicalIdx} className="py-3 px-3 align-top">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                                      <span className="text-[#0a0a0a] font-medium">{row.to}</span>
                                      <TripLocationRoleTag
                                        label={getTripLocationRoleTag(
                                          row.toLocationType,
                                          row.toWarehouseRole
                                        )}
                                      />
                                    </span>
                                    <span className="text-[12px] text-[#4b535c]">{row.toCode}</span>
                                  </div>
                                </td>
                              )
                            case 2:
                              return (
                                <td key={logicalIdx} className="py-3 px-3 align-top">
                                  <div className="flex flex-col items-start gap-0.5">
                                    <span>
                                      <span className="text-[14px] text-[#0a0a0a]">{row.transfers}</span>
                                      <span className="text-[12px] text-[#4b535c] ml-1">(max 200)</span>
                                    </span>
                                    {(Number(row.packCount) || 0) > 0 && (
                                      <span className="text-[12px] text-[#4b535c]">{row.packCount}</span>
                                    )}
                                  </div>
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
                                <td key={logicalIdx} className="py-3 px-3 align-top">
                                  <div className="flex flex-col gap-0.5 items-start">
                                    <span className="inline-flex flex-wrap items-center gap-1">
                                      <span className="whitespace-nowrap text-[14px] text-[#0a0a0a]">
                                        {row.recommended}
                                      </span>
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
                                    </span>
                                    {(Number(row.packCount) || 0) > 0 && (
                                      <span className="text-[12px] text-[#4b535c]">{row.packCount}</span>
                                    )}
                                  </div>
                                </td>
                              )
                            case 5:
                              return (
                                <td key={logicalIdx} className="py-3 px-3 align-top text-right">
                                  <span className="text-[#0a0a0a]">{row.products}</span>
                                </td>
                              )
                            case 6:
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
                                  <div className="flex flex-col items-end gap-1">
                                    <StatusDropdown
                                      rowId={`trip-${row.id}`}
                                      value={rowStatus}
                                      userName={userName}
                                      useShortEditedLabel
                                      onChange={(statusId) =>
                                        setTripStatusOverrides((prev) => ({ ...prev, [row.id]: statusId }))
                                      }
                                    />
                                    <div className="flex flex-col items-end gap-0.5">
                                      {(row.approvedTransfers ?? 0) > 0 && (
                                        <span className="text-[12px] font-medium text-[#166534]">
                                          {row.approvedTransfers} approved
                                        </span>
                                      )}
                                      {(row.unapprovedTransfers ?? 0) > 0 && (
                                        <button
                                          type="button"
                                          className="text-[12px] font-medium text-[#4b535c] hover:underline"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleOpenExplorerUnapprovedForTrip(row)
                                          }}
                                        >
                                          {row.unapprovedTransfers} unapproved
                                        </button>
                                      )}
                                    </div>
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
