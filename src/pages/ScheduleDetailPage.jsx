import { useState } from 'react'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { IconSearch, IconChevronDown, IconChevronRight, IconShare, IconDocument, IconClose, IconArrowLeft, IconGears } from '../components/icons'

function IconColumnSettings() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden>
      <path d="M4 4h3v12H4V4zm9 0h3v12h-3V4zM8 4h4v12H8V4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconSortOrder() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden>
      <path d="M6 5h8M6 10h8M6 15h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 13l2 2 2-2M18 7v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconFilterFunnel() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden>
      <path d="M2 4h16l-5 7v5l-4 2v-7L2 4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
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
function IconClock() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0" aria-hidden>
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 4v3l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const SCHEDULE_CREATION_DATE = '24/02/2026'

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
    approvalStatus: 'edited_by_user',
    editedByUser: 'Csabi Toth',
    recommendationsUpdated: '26/02/2026',
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
    approvalStatus: 'approved_by_system',
    recommendationsUpdated: '24/02/2026',
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
    approvalStatus: 'approved_by_system',
    recommendationsUpdated: '26/02/2026',
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
    approvalStatus: 'approved_by_user',
    approvedByUser: 'Jess Briggs',
    recommendationsUpdated: '24/02/2026',
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
    approvalStatus: 'approved_by_user',
    approvedByUser: 'Jess Briggs',
    recommendationsUpdated: '26/02/2026',
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
    approvalStatus: 'edited_by_user',
    editedByUser: 'Csabi Toth',
    recommendationsUpdated: '24/02/2026',
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
    approvalStatus: 'edited_by_user',
    editedByUser: 'Csabi Toth',
    recommendationsUpdated: '26/02/2026',
  },
]

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
  },
]

const TRIPS_ALL = [...TRIPS_OPERA, ...TRIPS_OTHER]

const VIEW_OPTIONS = [
  'Show all recommendations',
  'Exception 1 — Transfer units lower than 10 · Location: Opéra',
  'Exception 2 — Product: A1252810, A12528YY, A13314YY',
]

const EDITED_EXCEPTION_IDS = [3, 5]

// Mock products for trip drilldown (keyed by trip id)
const PRODUCTS_BY_TRIP = {
  1: [
    { id: 1, name: 'Croi-sac zip l', sku: 'A1398810', colour: 'Noir', transfers: 3, transfersSub: 1, revenue: '€1.48K', recommended: 1, recommendedBadges: ['REV'], recommendedSub: 2, salesL7: 1, salesL30: 2, forecast: 1.87, stockouts: '0 -> 0', locations: '2 -> 2', overstocks: '4 -> 1', understocks: '8 -> 5', depth: '5.0 -> 5.0',     approvalStatus: 'approved_by_system', recommendationsUpdated: '26/02/2026' },
    { id: 2, name: 'Pre-sac seau m', sku: 'A101080', colour: 'Bleu petrole', transfers: 2, transfersSub: 1, revenue: '€1.12K', recommended: 2, recommendedBadges: ['VIS'], recommendedSub: 1, salesL7: 2, salesL30: 3, forecast: 0.54, stockouts: '0 -> 1', locations: '2 -> 1', overstocks: '3 -> 0', understocks: '2 -> 0', depth: '3.0 -> 6.0', recommendationsUpdated: '24/02/2026' },
    { id: 3, name: 'Ang-sac pte main m', sku: 'A1252810', colour: 'Figue', transfers: 3, transfersSub: 2, revenue: '€1.89K', recommended: 3, recommendedBadges: ['REV', 'VIS'], recommendedSub: 1, salesL7: 1, salesL30: 4, forecast: 2.1, stockouts: '1 -> 0', locations: '2 -> 2', overstocks: '5 -> 2', understocks: '6 -> 3', depth: '4.2 -> 4.8',     approvalStatus: 'edited_by_user', editedByUser: 'Csabi Toth', recommendationsUpdated: '26/02/2026' },
    { id: 4, name: 'Croi-sac zip s', sku: 'A1398811', colour: 'Noir', transfers: 1, transfersSub: 2, revenue: '€0.98K', recommended: 1, recommendedBadges: ['REV'], recommendedSub: 2, salesL7: 0, salesL30: 1, forecast: 0.32, stockouts: '0 -> 0', locations: '1 -> 2', overstocks: '2 -> 1', understocks: '4 -> 2', depth: '5.0 -> 5.0', approvalStatus: 'approved_by_user', approvedByUser: 'Jess Briggs', recommendationsUpdated: '24/02/2026' },
    { id: 5, name: 'Pre-sac seau s', sku: 'A101081', colour: 'Bleu petrole', transfers: 2, transfersSub: 1, revenue: '€0.76K', recommended: 2, recommendedBadges: ['VIS'], recommendedSub: 1, salesL7: 1, salesL30: 2, forecast: 0.54, stockouts: '0 -> 1', locations: '2 -> 1', overstocks: '3 -> 0', understocks: '2 -> 0', depth: '3.0 -> 6.0', recommendationsUpdated: '26/02/2026' },
    { id: 6, name: 'Ang-sac pte main s', sku: 'A1252811', colour: 'Figue', transfers: 1, transfersSub: 1, revenue: '€0.65K', recommended: 1, recommendedBadges: ['REV'], recommendedSub: 1, salesL7: 0, salesL30: 1, forecast: 0.21, stockouts: '0 -> 0', locations: '2 -> 2', overstocks: '4 -> 1', understocks: '3 -> 1', depth: '4.0 -> 4.5', approvalStatus: 'approved_by_system', recommendationsUpdated: '24/02/2026' },
  ],
  2: [
    { id: 7, name: 'Sac zip l', sku: 'B200001', colour: 'Noir', transfers: 2, transfersSub: 1, revenue: '€0.89K', recommended: 2, recommendedBadges: ['REV'], recommendedSub: 1, salesL7: 1, salesL30: 2, forecast: 0.45, stockouts: '0 -> 0', locations: '2 -> 2', overstocks: '2 -> 1', understocks: '5 -> 3', depth: '4.5 -> 5.0', approvalStatus: 'approved_by_user', approvedByUser: 'Jess Briggs', recommendationsUpdated: '26/02/2026' },
    { id: 8, name: 'Sac seau m', sku: 'B200002', colour: 'Noir', transfers: 1, transfersSub: 2, revenue: '€0.52K', recommended: 1, recommendedBadges: ['VIS'], recommendedSub: 2, salesL7: 0, salesL30: 1, forecast: 0.28, stockouts: '0 -> 1', locations: '1 -> 2', overstocks: '1 -> 0', understocks: '3 -> 1', depth: '3.6 -> 4.3', approvalStatus: 'edited_by_user', editedByUser: 'Csabi Toth', recommendationsUpdated: '24/02/2026' },
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

function IconWarehouse() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0" aria-hidden>
      <rect x="1" y="5" width="12" height="8" stroke="currentColor" strokeWidth="1.5" rx="1" />
      <path d="M1 5l6-4 6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconTruck() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0" aria-hidden>
      <rect x="1" y="4" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 7h2l2 2v2h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="4" cy="11" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="11" cy="11" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
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
            <button type="button" className="pb-2 border-b-2 border-[#0267ff] text-[14px] font-medium text-[#0a0a0a]">General</button>
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="h-10 w-10 flex items-center justify-center rounded-[4px] border border-[#e5e7eb] bg-white text-[#4b535c] hover:bg-[#f3f4f6] shrink-0"
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
        <button type="button" className="h-12 w-12 flex items-center justify-center rounded-[4px] border border-[#E9EAEB] bg-white hover:bg-[#f3f4f6] shrink-0" aria-label="Filter">
          <IconFilterFunnel />
        </button>
        <button type="button" className="h-12 w-12 flex items-center justify-center rounded-[4px] border border-[#E9EAEB] bg-white hover:bg-[#f3f4f6] shrink-0" aria-label="Column settings">
          <IconColumnSettings />
        </button>
      </div>

      <div className="border border-[#e5e7eb] rounded-[4px] overflow-x-auto bg-white">
        <table className="w-full text-[14px]">
          <thead className="bg-[#F8F8F8]">
            <tr className="border-b border-[#E9EAEB]">
              <th className="w-10 max-w-[40px] py-3 px-2 text-left" />
              <th className="w-12 py-3 px-4 text-left">
                <input
                  type="checkbox"
                  className="size-4 rounded border-[#E9EAEB] text-[#0267ff]"
                  aria-label="Select all"
                  checked={locations.length > 0 && locations.every((loc) => selectedLocationIds.has(loc.id))}
                  onChange={toggleAllLocationsSelection}
                />
              </th>
              <th className="text-left py-3 px-4 font-medium text-[#00050A]">Locations</th>
              <th className="text-right py-3 px-4 font-medium text-[#00050A]">
                <span className="inline-flex items-center gap-1">Stock <IconSortDown /></span>
              </th>
              <th className="text-right py-3 px-4 font-medium text-[#00050A]">
                <span className="inline-flex items-center gap-1">TU <IconInfo /></span>
              </th>
              <th className="text-right py-3 px-4 font-medium text-[#00050A]">
                <span className="flex flex-col items-end">
                  Sales
                  <span className="text-[11px] font-normal text-[#4b535c]">L7D / L30D</span>
                </span>
              </th>
              <th className="text-right py-3 px-4 font-medium text-[#00050A]">
                <span className="flex flex-col items-end">
                  <span className="inline-flex items-center gap-1">Forecast <IconInfo /></span>
                  <span className="text-[11px] font-normal text-[#4b535c]">per wk</span>
                </span>
              </th>
              <th className="text-right py-3 px-4 font-medium text-[#00050A]">Stockouts</th>
              <th className="text-right py-3 px-4 font-medium text-[#00050A]">Coverage</th>
            </tr>
            <tr className="border-b border-[#E9EAEB] bg-[#F8F8F8]">
              <th className="w-10 max-w-[40px] py-2 px-2" />
              <th className="py-2 px-4" />
              <th className="py-2 px-4" />
              <th className="py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right">
                {summaryStock.before} → {summaryStock.after}
              </th>
              <th className="py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right">
                {summaryTU.before} → {summaryTU.after}
              </th>
              <th className="py-2 px-4 text-[12px] font-normal text-[#4b535c] text-right">—</th>
              <th className="py-2 px-4 text-[12px] font-normal text-[#4b535c] text-right">7.01 per wk</th>
              <th className="py-2 px-4 text-[12px] font-normal text-[#4b535c] text-right">—</th>
              <th className="py-2 px-4 text-[12px] font-normal text-[#4b535c] text-right">—</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((loc, idx) => (
              <tr key={loc.id} className={`border-b border-[#E9EAEB] hover:bg-[#f9fafb] ${idx === 0 ? 'bg-[#F8F8F8]' : 'bg-white'}`}>
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
                        <div className="relative group">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#A234DA] text-[12px] font-medium text-white cursor-pointer transition-[filter,box-shadow] hover:brightness-90 hover:shadow-[0px_2px_4px_rgba(0,0,0,0.1)]">
                            <IconWarehouse />
                            {loc.tuWarehouse}
                          </span>
                          {(loc.recommendationReason != null || loc.revenueIncrease != null) && (
                            <div className="absolute left-0 bottom-full mb-1 w-[max-content] max-w-[250px] p-3 bg-white border border-[#E9EAEB] rounded-[4px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                              <div className="space-y-2">
                                {loc.recommendationReason != null && (
                                  <>
                                    <div className="text-[12px] text-[#6b7280]">Recommendation reason</div>
                                    <div className="text-[14px] text-[#0a0a0a]">{loc.recommendationReason}</div>
                                  </>
                                )}
                                {loc.revenueIncrease != null && (
                                  <div className="flex justify-between items-center gap-4 text-[14px]">
                                    <span className="text-[#0a0a0a]">Revenue increase</span>
                                    <span className="text-[#0a0a0a] font-medium">{loc.revenueIncrease}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {loc.tuTruck?.map((n, i) => (
                        <div key={i} className="relative group">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#0267FF] text-[12px] font-medium text-white cursor-pointer transition-[filter,box-shadow] hover:brightness-90 hover:shadow-[0px_2px_4px_rgba(0,0,0,0.1)]">
                            <IconTruck />
                            {n}
                          </span>
                          {(loc.recommendationReason != null || loc.revenueIncrease != null) && (
                            <div className="absolute left-0 bottom-full mb-1 w-[max-content] max-w-[250px] p-3 bg-white border border-[#E9EAEB] rounded-[4px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                              <div className="space-y-2">
                                {loc.recommendationReason != null && (
                                  <>
                                    <div className="text-[12px] text-[#6b7280]">Recommendation reason</div>
                                    <div className="text-[14px] text-[#0a0a0a]">{loc.recommendationReason}</div>
                                  </>
                                )}
                                {loc.revenueIncrease != null && (
                                  <div className="flex justify-between items-center gap-4 text-[14px]">
                                    <span className="text-[#0a0a0a]">Revenue increase</span>
                                    <span className="text-[#0a0a0a] font-medium">{loc.revenueIncrease}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {loc.tuWarehouse == null && !loc.tuTruck?.length && (
                        <div className="relative group">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] border border-[#4B535C] text-[12px] font-medium text-[#4b535c] opacity-80 cursor-pointer transition-[filter,box-shadow] hover:brightness-90 hover:shadow-[0px_2px_4px_rgba(0,0,0,0.1)]">
                            <IconTruck />
                            {loc.tu.split(' → ')[1] || '—'}
                          </span>
                          {(loc.recommendationReason != null || loc.revenueIncrease != null) && (
                            <div className="absolute left-0 bottom-full mb-1 w-[max-content] max-w-[250px] p-3 bg-white border border-[#E9EAEB] rounded-[4px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                              <div className="space-y-2">
                                {loc.recommendationReason != null && (
                                  <>
                                    <div className="text-[12px] text-[#6b7280]">Recommendation reason</div>
                                    <div className="text-[14px] text-[#0a0a0a]">{loc.recommendationReason}</div>
                                  </>
                                )}
                                {loc.revenueIncrease != null && (
                                  <div className="flex justify-between items-center gap-4 text-[14px]">
                                    <span className="text-[#0a0a0a]">Revenue increase</span>
                                    <span className="text-[#0a0a0a] font-medium">{loc.revenueIncrease}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
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

function ProductsDrilldown({ trip, onBack, showBackButton = true, showChangedSinceCreation = false }) {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [approvedProducts, setApprovedProducts] = useState({})
  const [selectedProductIds, setSelectedProductIds] = useState(new Set())
  const baseProducts = PRODUCTS_BY_TRIP[trip.id] || DEFAULT_PRODUCTS
  const products = showChangedSinceCreation
    ? baseProducts.filter((p) => (p.recommendationsUpdated || '24/02/2026') > SCHEDULE_CREATION_DATE)
    : baseProducts

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

  const handleApproveProduct = (id) => {
    setApprovedProducts((prev) => ({ ...prev, [id]: true }))
  }

  const handleApproveSelectedProducts = () => {
    if (!selectedProductIds.size) return
    setApprovedProducts((prev) => {
      const next = { ...prev }
      selectedProductIds.forEach((id) => {
        next[id] = true
      })
      return next
    })
    setSelectedProductIds(new Set())
  }

  const handleExcludeSelectedProducts = () => {
    setSelectedProductIds(new Set())
  }

  const showProductEditButton = (p) => {
    const isApproved = !!approvedProducts[p.id]
    return isApproved || p.approvalStatus === 'approved_by_system' || p.approvalStatus === 'approved_by_user'
  }

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
  const summaryTransfers = products.reduce((s, p) => s + p.transfers + (p.transfersSub || 0), 0)
  const summaryRevenue = products.reduce((s, p) => {
    const m = p.revenue.replace(/[€K]/g, '')
    return s + parseFloat(m || 0)
  }, 0)
  const summaryRecommended = products.reduce((s, p) => s + p.recommended + (p.recommendedSub || 0), 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {showBackButton && (
          <button
            type="button"
            onClick={onBack}
            className="h-10 w-10 flex items-center justify-center rounded-[4px] border border-[#e5e7eb] bg-white text-[#4b535c] hover:bg-[#f3f4f6] shrink-0"
            aria-label="Back to trips"
          >
            <IconArrowLeft className="size-5" />
          </button>
        )}
        <nav className="flex items-center gap-2 text-[14px] text-[#4b535c]">
          {showBackButton ? (
            <>
              <button type="button" onClick={onBack} className="hover:text-[#0a0a0a] hover:underline">
                {breadcrumbFrom}
              </button>
              <span>→</span>
            </>
          ) : null}
          <span className="text-[#0a0a0a]">{showBackButton ? breadcrumbTo : `${breadcrumbFrom} → ${breadcrumbTo}`}</span>
          <span>→</span>
          <span className="font-medium text-[#0a0a0a]">Products</span>
        </nav>
      </div>

      <div className="flex flex-row flex-nowrap items-center gap-[8px]">
        <div className="flex items-center h-12 rounded-[4px] border border-[#E9EAEB] bg-white w-[200px] shrink-0">
          <input
            type="text"
            placeholder="Revenue increase"
            className="flex-1 min-w-0 h-full pl-4 pr-2 border-0 bg-transparent rounded-[4px] text-[14px] text-[#0a0a0a] placeholder:text-[#9ca3af] focus:outline-none focus:ring-0"
          />
          <span className="pr-3 shrink-0 text-[#9ca3af]">
            <IconSearch className="size-4" />
          </span>
        </div>
        <div className="relative">
          <select className="h-12 pl-4 pr-10 rounded-[4px] border border-[#E9EAEB] bg-white text-[14px] text-[#0a0a0a] appearance-none min-w-[160px]">
            <option>First sales date</option>
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#4b535c]">
            <IconChevronDown className="size-4" />
          </span>
        </div>
        <button type="button" className="h-12 w-12 flex items-center justify-center rounded-[4px] border border-[#E9EAEB] bg-white hover:bg-[#f3f4f6] shrink-0" aria-label="Filter">
          <IconFilterFunnel />
        </button>
        <button type="button" className="h-12 w-12 flex items-center justify-center rounded-[4px] border border-[#E9EAEB] bg-white hover:bg-[#f3f4f6] shrink-0" aria-label="Column settings">
          <IconColumnSettings />
        </button>
      </div>

      <div className="border border-[#e5e7eb] rounded-[4px] overflow-x-auto bg-white">
        <table className="w-full text-[14px]">
          <thead className="bg-[#F8F8F8]">
            <tr className="border-b border-[#E9EAEB]">
              <th className="w-12 py-3 px-4 text-left">
                <input
                  type="checkbox"
                  className="size-4 rounded border-[#E9EAEB] text-[#0267ff]"
                  aria-label="Select all"
                  checked={products.length > 0 && products.every((p) => selectedProductIds.has(p.id))}
                  onChange={toggleAllProductsSelection}
                />
              </th>
              <th className="text-left py-3 px-4 font-medium text-[#00050A]">Product details</th>
              <th className="text-right py-3 px-4 font-medium text-[#00050A]">Transfers</th>
              <th className="text-right py-3 px-4 font-medium text-[#00050A]">
                <span className="inline-flex items-center gap-1">Revenue increase <IconInfo /></span>
              </th>
              <th className="text-right py-3 px-4 font-medium text-[#00050A]">
                <span className="inline-flex items-center gap-1">Recommended transfers <IconInfo /></span>
              </th>
              <th className="text-right py-3 px-4 font-medium text-[#00050A]">Recommendations updated</th>
              <th className="text-right py-3 px-4 font-medium text-[#00050A]">
                <span className="flex flex-col items-end">
                  Sales
                  <span className="text-[11px] font-normal text-[#4b535c]">L7D / L30D</span>
                </span>
              </th>
              <th className="text-right py-3 px-4 font-medium text-[#00050A]">
                <span className="flex flex-col items-end">
                  <span className="inline-flex items-center gap-1">Forecast <IconInfo /></span>
                  <span className="text-[11px] font-normal text-[#4b535c]">per wk</span>
                </span>
              </th>
              <th className="text-right py-3 px-4 font-medium text-[#00050A]">Stockouts</th>
              <th className="text-right py-3 px-4 font-medium text-[#00050A]">Locations</th>
              <th className="text-right py-3 px-4 font-medium text-[#00050A]">
                <span className="inline-flex items-center gap-1">Overstocks <IconInfo /></span>
              </th>
              <th className="text-right py-3 px-4 font-medium text-[#00050A]">
                <span className="inline-flex items-center gap-1">Understocks <IconInfo /></span>
              </th>
              <th className="text-right py-3 px-4 font-medium text-[#00050A]">
                <span className="inline-flex items-center gap-1">Depth <IconInfo /></span>
              </th>
              <th className="text-left py-3 px-4 font-medium text-[#00050A]">Approval status</th>
              <th className="w-[100px] py-3 px-4 bg-[#F8F8F8] sticky right-0 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.05)]" />
            </tr>
            <tr className="border-b border-[#E9EAEB] bg-[#F8F8F8]">
              <th className="py-2 px-4" />
              <th className="py-2 px-4 text-[12px] font-normal text-[#4b535c]" />
              <th className="py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right">{summaryTransfers} units</th>
              <th className="py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right">€{summaryRevenue.toFixed(1)}K</th>
              <th className="py-2 px-4 text-[12px] font-medium text-[#0a0a0a] text-right">{summaryRecommended} units</th>
              <th className="py-2 px-4 text-[12px] font-normal text-[#4b535c] text-right">—</th>
              <th className="py-2 px-4 text-[12px] font-normal text-[#4b535c] text-right">—</th>
              <th className="py-2 px-4 text-[12px] font-normal text-[#4b535c] text-right">—</th>
              <th className="py-2 px-4 text-[12px] font-normal text-[#4b535c] text-right">—</th>
              <th className="py-2 px-4 text-[12px] font-normal text-[#4b535c] text-right">—</th>
              <th className="py-2 px-4 text-[12px] font-normal text-[#4b535c] text-right">—</th>
              <th className="py-2 px-4 text-[12px] font-normal text-[#4b535c] text-right">—</th>
              <th className="py-2 px-4 text-[12px] font-normal text-[#4b535c] text-right">—</th>
              <th className="py-2 px-4" />
              <th className="py-2 px-4 bg-[#F8F8F8] sticky right-0 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.05)]" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className="border-b border-[#E9EAEB] hover:bg-[#f9fafb] cursor-pointer"
                onClick={() => setSelectedProduct(p)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelectedProduct(p)
                  }
                }}
              >
                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="size-4 rounded border-[#E9EAEB] text-[#0267ff]"
                    aria-label={`Select ${p.name}`}
                    checked={selectedProductIds.has(p.id)}
                    onChange={() => toggleProductSelection(p.id)}
                  />
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[4px] bg-[#f3f4f6] shrink-0" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-[#0a0a0a]">{p.name}</span>
                      <span className="text-[12px] text-[#4b535c]">{p.sku}</span>
                      <span className="text-[12px] text-[#4b535c]">{p.colour}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-[#0a0a0a]">{p.transfers}</span>
                    <span className="text-[12px] text-[#4b535c]">{p.transfersSub}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right text-[#0a0a0a]">{p.revenue}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[#0a0a0a]">
                      {p.recommended}
                      {p.recommendedBadges?.map((b) => (
                        <span key={b} className="ml-1 inline-flex items-center px-2 py-0.5 rounded-[4px] bg-[#1d4ed8] text-[11px] font-medium text-white">
                          {b === 'VIS' ? 'VS' : b}
                        </span>
                      ))}
                    </span>
                    <span className="text-[12px] text-[#4b535c]">{p.recommendedSub}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right text-[14px] text-[#4B535C]">{p.recommendationsUpdated || '26/02/2026'}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-[#0a0a0a]">{p.salesL7}</span>
                    <span className="text-[12px] text-[#4b535c]">{p.salesL30}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right text-[#0a0a0a]">{p.forecast}</td>
                <td className="py-3 px-4 text-right text-[#0a0a0a]">{p.stockouts}</td>
                <td className="py-3 px-4 text-right text-[#0a0a0a]">{p.locations}</td>
                <td className="py-3 px-4 text-right text-[#0a0a0a]">{p.overstocks}</td>
                <td className="py-3 px-4 text-right text-[#0a0a0a]">{p.understocks}</td>
                <td className="py-3 px-4 text-right text-[#0a0a0a]">{p.depth}</td>
                <td className="py-3 px-4">
                  {(() => {
                    const isApproved = !!approvedProducts[p.id]
                    if (isApproved) {
                      return (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E4F4EF] text-[12px] font-medium text-[#08A16A]">
                          <IconCheck className="size-4 shrink-0" />
                          Approved by user: Jess Briggs
                        </span>
                      )
                    }
                    if (p.approvalStatus === 'approved_by_system') {
                      return (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E4F4EF] text-[12px] font-medium text-[#08A16A]">
                          <IconCheck className="size-4 shrink-0" />
                          Approved by system
                        </span>
                      )
                    }
                    if (p.approvalStatus === 'approved_by_user') {
                      return (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E4F4EF] text-[12px] font-medium text-[#08A16A]">
                          <IconCheck className="size-4 shrink-0" />
                          Approved by user: {p.approvedByUser || 'Jess Briggs'}
                        </span>
                      )
                    }
                    if (p.approvalStatus === 'edited_by_user') {
                      return (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FFF8E1] text-[12px] font-medium text-[#B8860B]">
                          Last edited by: {p.editedByUser || 'Csabi Toth'}
                        </span>
                      )
                    }
                    return <span className="inline-block h-5" aria-hidden />
                  })()}
                </td>
                <td className="py-3 px-4 text-right bg-white sticky right-0 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.05)]" onClick={(e) => e.stopPropagation()}>
                  {showProductEditButton(p) ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedProduct(p)
                      }}
                      className="inline-flex items-center justify-center h-8 px-4 rounded-[4px] border border-[#E9EAEB] bg-white text-[13px] font-medium text-[#212B36] hover:bg-[#f9fafb] hover:border-[#9ca3af]"
                    >
                      Edit
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleApproveProduct(p.id)
                      }}
                      className="inline-flex items-center justify-center h-8 px-4 rounded-[4px] border border-[#d1d5db] bg-white text-[13px] font-medium text-[#212B36] hover:bg-[#f9fafb] hover:border-[#9ca3af]"
                    >
                      Approve
                    </button>
                  )}
                </td>
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
          <button
            type="button"
            onClick={handleApproveSelectedProducts}
            className="px-4 py-2 rounded-[4px] text-[14px] font-medium text-white hover:bg-white/10"
          >
            Approve all
          </button>
          <button
            type="button"
            onClick={handleExcludeSelectedProducts}
            className="px-4 py-2 rounded-[4px] text-[14px] font-medium text-white hover:bg-white/10"
          >
            Exclude
          </button>
        </div>
      )}
    </div>
  )
}

export default function ScheduleDetailPage() {
  const [activeTab, setActiveTab] = useState('trips')
  const [viewShowsFullDataset, setViewShowsFullDataset] = useState(true)
  const [selectedView, setSelectedView] = useState('Show all recommendations')
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false)
  const [approvedTrips, setApprovedTrips] = useState({})
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [selectedTripIds, setSelectedTripIds] = useState(new Set())
  const [showChangedSinceCreation, setShowChangedSinceCreation] = useState(false)

  const baseTripsRows = viewShowsFullDataset ? TRIPS_ALL : TRIPS_OPERA
  const tripsRows = showChangedSinceCreation
    ? baseTripsRows.filter((row) => (row.recommendationsUpdated || '24/02/2026') > SCHEDULE_CREATION_DATE)
    : baseTripsRows
  const summaryTransfers = viewShowsFullDataset ? '2,000 units' : '203 units'
  const summaryRevenue = viewShowsFullDataset ? '€435.3K' : '€41.3K'
  const summaryRecommended = viewShowsFullDataset ? '2,105 units' : '203 units'

  function handleSelectView(option) {
    setSelectedView(option)
    setViewDropdownOpen(false)
    if (option === 'Show all recommendations') {
      setViewShowsFullDataset(true)
    } else if (option.startsWith('Exception ')) {
      setViewShowsFullDataset(false)
    }
  }

  const handleApproveRow = (id) => {
    setApprovedTrips((prev) => ({ ...prev, [id]: true }))
  }

  const handleApproveAllVisible = () => {
    const idsToApprove = tripsRows.filter((row) => row.to === 'Opéra').map((row) => row.id)
    if (!idsToApprove.length) return
    setApprovedTrips((prev) => {
      const next = { ...prev }
      idsToApprove.forEach((id) => {
        next[id] = true
      })
      return next
    })
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

  const handleApproveSelected = () => {
    if (!selectedTripIds.size) return
    setApprovedTrips((prev) => {
      const next = { ...prev }
      selectedTripIds.forEach((id) => {
        next[id] = true
      })
      return next
    })
    setSelectedTripIds(new Set())
  }

  const handleExcludeSelected = () => {
    // Placeholder: exclude selected trips from schedule
    setSelectedTripIds(new Set())
  }

  const showEditButton = (row) => {
    const isExceptionRow = row.to === 'Opéra'
    const isApproved = !!approvedTrips[row.id]
    if (isExceptionRow && (isApproved || row.approvalStatus === 'approved_by_system' || row.approvalStatus === 'approved_by_user')) return true
    if (!isExceptionRow && viewShowsFullDataset) return true
    return false
  }

  return (
    <div className="pt-6 flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2 min-w-0">
          <h1 className="text-[20px] md:text-[24px] font-medium text-[#0a0a0a]">
            Europe monthly rebal
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#4b535c]">
            <span>Created: 24/02/2026</span>
            <span className="flex items-center gap-2">
              <span>Submission deadline:</span>
              <span className="px-2 py-1 rounded-full text-[12px] font-medium bg-[#fef3c7] text-[#92400e]">
                28/02/2026
              </span>
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
      </header>

      <div className="rounded-[4px] border border-[#fde047] bg-[#fef9c3] px-4 py-3 text-[14px] text-[#713f12] flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="font-medium text-[#713f12]">12 exceptions still to approve</span>
          <span className="text-[#92400e]">The next scheduled recommendations are the UK weekly replenishment running on 10/03/2026.</span>
        </div>
        <button
          type="button"
          className="mt-0.5 p-1 rounded-[4px] text-[#92400e] hover:bg-[#fde047]/30 hover:text-[#713f12]"
          aria-label="Dismiss exceptions info"
        >
          <IconClose className="size-4" />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="border-b border-[#e5e7eb] flex items-center justify-between gap-4">
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
                      ? 'text-[#0a0a0a] border-[#0267ff]'
                      : 'text-[#4b535c] border-transparent hover:text-[#0a0a0a]'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </nav>
          <div className="flex items-center gap-2 shrink-0 pb-2">
            <div className="relative">
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
                    className="fixed inset-0 z-10"
                    aria-hidden
                    onClick={() => setViewDropdownOpen(false)}
                  />
                  <ul
                    role="listbox"
                    className="absolute top-full right-0 z-10 mt-1 min-w-[200px] max-w-[350px] rounded-[4px] border border-[#EAEAEA] bg-white py-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
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
            <button
              type="button"
              onClick={() => setShowChangedSinceCreation((v) => !v)}
              className={`inline-flex items-center gap-1.5 h-10 px-3 rounded-[4px] text-[14px] font-medium ${
                showChangedSinceCreation
                  ? 'bg-[#0267FF] text-white border border-[#0267FF]'
                  : 'bg-white text-[#4B535C] border border-[#E9EAEB] hover:bg-[#f9fafb]'
              }`}
              aria-pressed={showChangedSinceCreation}
            >
              <IconClock className="size-4" />
              Changed since creation
            </button>
          </div>
        </div>

        {activeTab === 'trips' ? (
          selectedTrip ? (
            <ProductsDrilldown trip={selectedTrip} onBack={() => setSelectedTrip(null)} showChangedSinceCreation={showChangedSinceCreation} />
          ) : (
          <div className="flex flex-col gap-4">
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
              <button
                type="button"
                className="h-10 px-4 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#22272f] hover:bg-[#f3f4f6] shrink-0 flex items-center gap-2"
              >
                <IconFilterFunnel />
                Filters
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[12px] mt-1">
              {(() => {
                const filterChips =
                  selectedView === 'Exception 1 — Transfer units lower than 10 · Location: Opéra'
                    ? ['Advanced: Transfer units lower than 10', 'Receiving location: Opéra']
                    : selectedView === 'Exception 2 — Product: A1252810, A12528YY, A13314YY'
                      ? ['Products: A1252810 +2']
                      : []
                return filterChips.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {filterChips.map((label) => (
                      <span
                        key={label}
                        className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-[4px] bg-[#f3f4f6] text-[#4b535c] border border-[#e5e7eb]"
                      >
                        <span>{label}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setViewShowsFullDataset(true)
                            setSelectedView('Show all recommendations')
                          }}
                          className="p-0.5 rounded-[4px] text-[#6b7280] hover:bg-[#e5e7eb] hover:text-[#374151]"
                          aria-label={`Remove filter: ${label}`}
                        >
                          <IconClose className="size-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null
              })()}
              <div className="ml-auto flex items-center gap-3">
                {!viewShowsFullDataset && (
                  <button
                    type="button"
                    onClick={() => {
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

            <div className="border border-[#e5e7eb] rounded-[10px] overflow-hidden mt-2">
              <table className="w-full text-[14px]">
                <thead className="bg-[#f8f8f8]">
                  <tr className="border-b border-[#e5e7eb]">
                    <th className="w-10 py-3 px-3">
                      <input
                        type="checkbox"
                        className="size-4 rounded border-[#d1d5db] text-[#0267ff] focus:ring-[#0267ff]"
                        aria-label="Select all trips"
                        checked={tripsRows.length > 0 && tripsRows.every((r) => selectedTripIds.has(r.id))}
                        onChange={toggleAllTripsSelection}
                      />
                    </th>
                    <th className="text-left py-3 px-3 font-medium text-[#0a0a0a]">Sending location</th>
                    <th className="text-left py-3 px-3 font-medium text-[#0a0a0a]">Receiving location</th>
                    <th className="text-left py-3 px-3 font-medium text-[#0a0a0a]">Movement type</th>
                    <th className="text-left py-3 px-3 font-medium text-[#0a0a0a]">Transfers</th>
                    <th className="text-left py-3 px-3 font-medium text-[#0a0a0a]">
                      <span className="inline-flex items-center gap-1">
                        Revenue increase
                        <IconInfo />
                        <IconSortDown />
                      </span>
                    </th>
                    <th className="text-left py-3 px-3 font-medium text-[#0a0a0a]">
                      <span className="inline-flex items-center gap-1">
                        Recommended transfers
                        <IconInfo />
                      </span>
                    </th>
                    <th className="text-left py-3 px-3 font-medium text-[#0a0a0a]">Recommendations updated</th>
                    <th className="text-left py-3 px-3 font-medium text-[#0a0a0a]">Products</th>
                    <th className="text-left py-3 px-3 font-medium text-[#0a0a0a]">Approval status</th>
                    <th className="py-3 px-3" />
                  </tr>
                  <tr className="border-b border-[#e5e7eb]">
                    <th className="py-2 px-3" />
                    <th className="py-2 px-3 text-[12px] font-normal text-[#4b535c]" />
                    <th className="py-2 px-3 text-[12px] font-normal text-[#4b535c]" />
                    <th className="py-2 px-3 text-[12px] font-normal text-[#4b535c]" />
                    <th className="py-2 px-3 text-[12px] font-medium text-[#0a0a0a]">{summaryTransfers}</th>
                    <th className="py-2 px-3 text-[12px] font-medium text-[#0a0a0a]">{summaryRevenue}</th>
                    <th className="py-2 px-3 text-[12px] font-medium text-[#0a0a0a]">{summaryRecommended}</th>
                    <th className="py-2 px-3 text-[12px] font-normal text-[#4b535c]">—</th>
                    <th className="py-2 px-3 text-[12px] font-normal text-[#4b535c]">N/A</th>
                    <th className="py-2 px-3" />
                    <th className="py-2 px-3" />
                  </tr>
                </thead>
                <tbody>
                  {tripsRows.map((row) => {
                    const isExceptionRow = row.to === 'Opéra'
                    const isApproved = !!approvedTrips[row.id]
                    const movementType = row.movementType || 'Rebalancing'
                    const movementBadgeClass =
                      movementType === 'Rebalancing'
                        ? 'bg-[#e0edff] text-[#1d4ed8]'
                        : movementType === 'Replenishment'
                          ? 'bg-[#ecfdf3] text-[#166534]'
                          : 'bg-[#f3e8ff] text-[#6b21a8]'

                    return (
                      <tr
                        key={row.id}
                        className="border-b border-[#e5e7eb] hover:bg-[#f9fafb] cursor-pointer"
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
                        <td className="py-3 px-3 align-top" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="size-4 rounded border-[#d1d5db] text-[#0267ff] focus:ring-[#0267ff]"
                            aria-label={`Select trip ${row.from} to ${row.to}`}
                            checked={selectedTripIds.has(row.id)}
                            onChange={() => toggleTripSelection(row.id)}
                          />
                        </td>
                        <td className="py-3 px-3 align-top">
                          <div className="flex flex-col">
                            <span className="text-[#0a0a0a] font-medium">{row.from}</span>
                            <span className="text-[12px] text-[#4b535c]">{row.fromCode}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 align-top">
                          <div className="flex flex-col">
                            <span className="text-[#0a0a0a] font-medium">{row.to}</span>
                            <span className="text-[12px] text-[#4b535c]">{row.toCode}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 align-top">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${movementBadgeClass}`}
                          >
                            {movementType}
                          </span>
                        </td>
                        <td className="py-3 px-3 align-top">
                          <span className="text-[#0a0a0a]">{row.transfers}</span>
                          <span className="text-[12px] text-[#4b535c] ml-1">(max 200)</span>
                        </td>
                        <td className="py-3 px-3 align-top">
                          <span className="text-[#0a0a0a]">{row.revenue}</span>
                          <span className="text-[12px] text-[#4b535c] ml-1">(min 6903)</span>
                        </td>
                        <td className="py-3 px-3 align-top">
                          <div className="flex flex-col gap-1">
                            <span className="text-[#0a0a0a]">{row.recommended}</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {row.badges?.includes('MDQ') && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-[#1d4ed8] text-[11px] font-medium text-white">
                                  MDQ
                                </span>
                              )}
                              {row.badges?.includes('VIS') && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-[#1d4ed8] text-[11px] font-medium text-white">
                                  VS
                                </span>
                              )}
                              {row.badges?.includes('REV') && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-[#1d4ed8] text-[11px] font-medium text-white">
                                  REV
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 align-top text-[14px] text-[#4B535C]">{row.recommendationsUpdated || '26/02/2026'}</td>
                        <td className="py-3 px-3 align-top">
                          <span className="text-[#0a0a0a]">{row.products}</span>
                        </td>
                        <td className="py-3 px-3 align-top">
                          {isExceptionRow ? (
                            isApproved ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E4F4EF] text-[12px] font-medium text-[#08A16A]">
                                <IconCheck className="size-4 shrink-0" />
                                Approved by user: Jess Briggs
                              </span>
                            ) : row.approvalStatus === 'approved_by_system' ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E4F4EF] text-[12px] font-medium text-[#08A16A]">
                                <IconCheck className="size-4 shrink-0" />
                                Approved by system
                              </span>
                            ) : row.approvalStatus === 'approved_by_user' ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E4F4EF] text-[12px] font-medium text-[#08A16A]">
                                <IconCheck className="size-4 shrink-0" />
                                Approved by user: {row.approvedByUser || 'Jess Briggs'}
                              </span>
                            ) : row.approvalStatus === 'edited_by_user' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FFF8E1] text-[12px] font-medium text-[#B8860B]">
                                Last edited by: {row.editedByUser || 'Csabi Toth'}
                              </span>
                            ) : (
                              <span className="inline-block h-5" aria-hidden />
                            )
                          ) : viewShowsFullDataset ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E4F4EF] text-[12px] font-medium text-[#08A16A]">
                              <IconCheck className="size-4 shrink-0" />
                              Approved by system
                            </span>
                          ) : (
                            <span className="inline-block h-5" aria-hidden />
                          )}
                        </td>
                        <td className="py-3 px-3 align-top text-right" onClick={(e) => e.stopPropagation()}>
                          {showEditButton(row) ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedTrip(row)
                              }}
                              className="inline-flex items-center justify-center h-8 px-4 rounded-[4px] border border-[#E9EAEB] bg-white text-[13px] font-medium text-[#212B36] hover:bg-[#f9fafb] hover:border-[#9ca3af]"
                            >
                              Edit
                            </button>
                          ) : isExceptionRow && (row.approvalStatus === 'edited_by_user' || (!row.approvalStatus && !isApproved)) ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleApproveRow(row.id)
                              }}
                              className="inline-flex items-center justify-center h-8 px-4 rounded-[4px] border border-[#d1d5db] bg-white text-[13px] font-medium text-[#212B36] hover:bg-[#f9fafb] hover:border-[#9ca3af]"
                            >
                              Approve
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          )
        ) : activeTab === 'products' ? (
          <ProductsDrilldown trip={TRIPS_OPERA[0]} onBack={() => {}} showBackButton={false} showChangedSinceCreation={showChangedSinceCreation} />
        ) : (
          <div className="border border-dashed border-[#e5e7eb] rounded-[8px] p-6 text-[14px] text-[#4b535c]">
            Locations view coming soon.
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
          <button
            type="button"
            onClick={handleApproveSelected}
            className="px-4 py-2 rounded-[4px] text-[14px] font-medium text-white hover:bg-white/10"
          >
            Approve all
          </button>
          <button
            type="button"
            onClick={handleExcludeSelected}
            className="px-4 py-2 rounded-[4px] text-[14px] font-medium text-white hover:bg-white/10"
          >
            Exclude
          </button>
        </div>
      )}
      </div>
    </div>
  )
}

