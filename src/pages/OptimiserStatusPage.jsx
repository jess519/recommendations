import { useState, useCallback, useRef, useMemo } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { IconChevronDown, IconChevronRight, IconStar, IconGears, IconBulb, IconShare, IconEllipsisVertical } from '../components/icons'

const OPTIMISER_TABS = [
  'Replenishment',
  'Reorder',
  'Rebalancing',
  'All runs',
  'Schedule status',
]

const FILTER_ROW_1 = [
  { label: 'Select view', active: false },
  { label: 'Customer (Select)', active: false },
  { label: 'Run name (Select)', active: false },
  { label: 'Location aix en provence, bordeaux, bruxelles', active: true },
  { label: 'Labels (Select)', active: false },
  { label: 'Department (Select)', active: false },
  { label: 'Sub department (Select)', active: false },
]

const FILTER_ROW_2 = [
  { label: 'Product ID (Select)', active: false },
  { label: 'Sku ID (Select)', active: false },
  { label: 'Replenishment run date', active: true },
  { label: 'Run status Completed', active: true },
  { label: 'Warehouse availability (Select)', active: false },
  { label: 'From location region (Select)', active: false },
  { label: 'To location region (Select)', active: false },
]

function IconCheckGreen() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 text-emerald-500">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
      <path d="M6 10l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FilterPill({ label, active }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors shrink-0 ${
        active ? 'bg-[#4a5565] text-white' : 'bg-[#f3f3f5] text-[#0a0a0a] border border-[#e5e7eb] hover:bg-[#eeeeee]'
      }`}
    >
      {label}
      {label.includes('(Select)') && <IconChevronDown className="size-4 opacity-70" />}
    </button>
  )
}

function DonutChart() {
  const size = 160
  const stroke = 24
  const r = (size - stroke) / 2 - 4
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * 0.25
  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} className="shrink-0">
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#eab308"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={0}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        <circle cx={cx} cy={cy} r={r - stroke} fill="white" />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="text-xs font-medium fill-[#4a5565]">100%</text>
      </svg>
      <p className="text-sm text-[#6a7282] text-center">
        Replenishment – 142 runs (100%)
      </p>
    </div>
  )
}

const TRIPS_TABLE_DATA = {
  id: 'rebalancing',
  label: 'Rebalancing',
  children: [
    {
      id: 'lille',
      label: 'Lille',
      children: [
        {
          id: 'la-defense',
          label: 'La Défense',
          children: [
            { id: '1', label: 'G.L Haussmann Maro', toLocation: 'Bordeaux', units: '7.6K', value: '6.87K', revenue: '458.94K', costs: '250', stockouts: '484', consolidated: '0', spread: '2', products: '189', skus: '223' },
            { id: '2', label: 'Printemps Lille', toLocation: 'Bruxelles', units: '2.1K', value: '1.92K', revenue: '125.50K', costs: '250', stockouts: '0', consolidated: '0', spread: '1', products: '45', skus: '52' },
            { id: '3', label: 'G.L Luxembourg', toLocation: 'Strasbourg', units: '1.5K', value: '1.2K', revenue: '82.30K', costs: '250', stockouts: '0', consolidated: '0', spread: '1', products: '38', skus: '42' },
          ],
          total: { units: '1.27K', value: '584.65K', revenue: '458.94K', costs: '2.25K', stockouts: '484', consolidated: '2', spread: '189', products: '223', skus: '224' },
        },
      ],
    },
    {
      id: 'aix',
      label: 'Aix en Provence',
      children: [
        { id: '4', label: 'B.H.V Rivoli', toLocation: 'Strasbourg', units: '3.2K', value: '2.85K', revenue: '198.20K', costs: '250', stockouts: '261', consolidated: '0', spread: '3', products: '98', skus: '112' },
        { id: '5', label: 'G.L Toulouse', toLocation: 'Cannes', units: '1.8K', value: '1.65K', revenue: '112.40K', costs: '250', stockouts: '0', consolidated: '0', spread: '1', products: '67', skus: '78' },
        { id: '6', label: 'Lyon Heriot', toLocation: 'Opéra', units: '2.4K', value: '2.1K', revenue: '146.48K', costs: '250', stockouts: '0', consolidated: '0', spread: '2', products: '89', skus: '102' },
      ],
      total: { units: '1.48K', value: '585.53K', revenue: '457.08K', costs: '2.75K', stockouts: '943', consolidated: '5', spread: '261', products: '302', skus: '304' },
    },
  ],
}

function renderTripsRows(data, expandedIds, onToggle, level = 0) {
  const rows = []
  const pl = 16 + level * 20

  if (!data.children) return rows

  rows.push(
    <tr key={data.id} className="border-b border-[#e5e7eb] hover:bg-[#f9fafb]">
      <td className="py-2 px-4 text-[#0a0a0a] align-middle" style={{ paddingLeft: pl }}>
        <button type="button" onClick={() => onToggle(data.id)} className="inline-flex items-center gap-1 hover:opacity-70">
          {expandedIds.includes(data.id) ? <IconChevronDown className="size-4 shrink-0" /> : <IconChevronRight className="size-4 shrink-0" />}
          <span>{data.label}</span>
        </button>
      </td>
      <td className="py-2 px-4">—</td>
      <td className="py-2 px-4 text-right">—</td>
      <td className="py-2 px-4 text-right">—</td>
      <td className="py-2 px-4 text-right">—</td>
      <td className="py-2 px-4 text-right">—</td>
      <td className="py-2 px-4 text-right">—</td>
      <td className="py-2 px-4 text-right">—</td>
      <td className="py-2 px-4 text-right">—</td>
      <td className="py-2 px-4 text-right">—</td>
      <td className="py-2 px-4 text-right">—</td>
    </tr>
  )

  if (expandedIds.includes(data.id)) {
    data.children.forEach((child) => {
      if (child.total) {
        rows.push(
          <tr key={child.id} className="border-b border-[#e5e7eb] hover:bg-[#f9fafb]">
            <td className="py-2 px-4 text-[#0a0a0a]" style={{ paddingLeft: pl + 20 }}>
              <button type="button" onClick={() => onToggle(child.id)} className="inline-flex items-center gap-1 hover:opacity-70">
                {expandedIds.includes(child.id) ? <IconChevronDown className="size-4 shrink-0" /> : <IconChevronRight className="size-4 shrink-0" />}
                <span>{child.label}</span>
              </button>
            </td>
            <td className="py-2 px-4">—</td>
            <td className="py-2 px-4 text-right">—</td>
            <td className="py-2 px-4 text-right">—</td>
            <td className="py-2 px-4 text-right">—</td>
            <td className="py-2 px-4 text-right">—</td>
            <td className="py-2 px-4 text-right">—</td>
            <td className="py-2 px-4 text-right">—</td>
            <td className="py-2 px-4 text-right">—</td>
            <td className="py-2 px-4 text-right">—</td>
            <td className="py-2 px-4 text-right">—</td>
          </tr>
        )
        if (expandedIds.includes(child.id) && child.children) {
          child.children.forEach((detail) => {
            rows.push(
              <tr key={detail.id} className="border-b border-[#e5e7eb] hover:bg-[#f9fafb]">
                <td className="py-2 px-4 text-[#0a0a0a]" style={{ paddingLeft: pl + 40 }}>{detail.label}</td>
                <td className="py-2 px-4 text-[#0a0a0a]">{detail.toLocation}</td>
                <td className="py-2 px-4 text-right text-[#0a0a0a]">{detail.units}</td>
                <td className="py-2 px-4 text-right text-[#0a0a0a]">{detail.value}</td>
                <td className="py-2 px-4 text-right text-[#0a0a0a]">{detail.revenue}</td>
                <td className="py-2 px-4 text-right text-[#0a0a0a]">{detail.costs}</td>
                <td className="py-2 px-4 text-right text-[#0a0a0a]">{detail.stockouts}</td>
                <td className="py-2 px-4 text-right text-[#0a0a0a]">{detail.consolidated}</td>
                <td className="py-2 px-4 text-right text-[#0a0a0a]">{detail.spread}</td>
                <td className="py-2 px-4 text-right text-[#0a0a0a]">{detail.products}</td>
                <td className="py-2 px-4 text-right text-[#0a0a0a]">{detail.skus}</td>
              </tr>
            )
          })
          rows.push(
            <tr key={`${child.id}-total`} className="border-b border-[#e5e7eb] bg-[#f5f5f5]">
              <td className="py-2 px-4 font-medium text-[#0a0a0a]" style={{ paddingLeft: pl + 40 }}>{child.label} total</td>
              <td className="py-2 px-4">—</td>
              <td className="py-2 px-4 text-right font-medium text-[#0a0a0a]">{child.total.units}</td>
              <td className="py-2 px-4 text-right font-medium text-[#0a0a0a]">{child.total.value}</td>
              <td className="py-2 px-4 text-right font-medium text-[#0a0a0a]">{child.total.revenue}</td>
              <td className="py-2 px-4 text-right font-medium text-[#0a0a0a]">{child.total.costs}</td>
              <td className="py-2 px-4 text-right font-medium text-[#0a0a0a]">{child.total.stockouts}</td>
              <td className="py-2 px-4 text-right font-medium text-[#0a0a0a]">{child.total.consolidated}</td>
              <td className="py-2 px-4 text-right font-medium text-[#0a0a0a]">{child.total.spread}</td>
              <td className="py-2 px-4 text-right font-medium text-[#0a0a0a]">{child.total.products}</td>
              <td className="py-2 px-4 text-right font-medium text-[#0a0a0a]">{child.total.skus}</td>
            </tr>
          )
        }
      } else {
        rows.push(...renderTripsRows(child, expandedIds, onToggle, level + 1))
      }
    })
  }

  return rows
}

const TRIPS_DETAILS_STOCK_ROWS = [
  { from: 'Bordeaux', to: 'Bruxelles', productId: 'A092221H', skuId: 'A092221HTU', units: '6', value: '3.9K', revenue: '2.5K', rrp: '650', stockBefore: '3', stockAfter: '2', wocBefore: '209.36', wocAfter: '139.1', salesRate: '0.01', coverage: '5' },
  { from: 'Bordeaux', to: 'Bruxelles', productId: 'A0997410', skuId: 'A0997410TU', units: '7', value: '1.85K', revenue: '1.64K', rrp: '235', stockBefore: '4', stockAfter: '1', wocBefore: '217.78', wocAfter: '72.59', salesRate: '0.02', coverage: '5' },
  { from: 'Bordeaux', to: 'Bruxelles', productId: 'A1011020', skuId: 'A1011020TU', units: '2', value: '1.5K', revenue: '822.1', rrp: '750', stockBefore: '2', stockAfter: '3', wocBefore: '27.23', wocAfter: '18.15', salesRate: '0.11', coverage: '5' },
  { from: 'Bordeaux', to: 'Bruxelles', productId: 'A1023045', skuId: 'A1023045TU', units: '12', value: '2.82K', revenue: '2.82K', rrp: '315', stockBefore: '5', stockAfter: '2', wocBefore: '172.39', wocAfter: '114.93', salesRate: '0.02', coverage: '5' },
  { from: 'Bordeaux', to: 'Bruxelles', productId: 'A0987612', skuId: 'A0987612TU', units: '4', value: '470', revenue: '385', rrp: '428', stockBefore: '3', stockAfter: '1', wocBefore: '95.22', wocAfter: '31.74', salesRate: '0.01', coverage: '5' },
  { from: 'Bordeaux', to: 'Bruxelles', productId: 'A1054321', skuId: 'A1054321TU', units: '9', value: '380', revenue: '298', rrp: '198', stockBefore: '6', stockAfter: '4', wocBefore: '142.55', wocAfter: '94.73', salesRate: '0.02', coverage: '5' },
  { from: 'Bordeaux', to: 'Bruxelles', productId: 'A1112220', skuId: 'A1112220TU', units: '3', value: '2.1K', revenue: '1.2K', rrp: '680', stockBefore: '2', stockAfter: '0', wocBefore: '88.12', wocAfter: '45.20', salesRate: '0', coverage: '5' },
  { from: 'Bordeaux', to: 'Bruxelles', productId: 'A0934567', skuId: 'A0934567TU', units: '15', value: '4.2K', revenue: '3.15K', rrp: '520', stockBefore: '4', stockAfter: '3', wocBefore: '156.88', wocAfter: '104.59', salesRate: '0.01', coverage: '5' },
]

const TRIPS_DETAILS_ROWS = [
  { from: 'DLO WAREHOUSE EUROPE LOUVRES', to: '462 ZV INTERNET', dept: 'ACCESSORIES WOMEN', subDept: 'LEATHER GOOD', season: 'FW25', productId: 'LWBA04024_BLACK', skuId: 'LWBA04024011UNI', units: '12.17K', value: '5.17M', revenue: '458.94K', rrp: '425', coverage: '21.5' },
  { from: 'DLO WAREHOUSE EUROPE LOUVRES', to: '462 ZV INTERNET', dept: 'ACCESSORIES WOMEN', subDept: 'LEATHER GOOD', season: 'SS25', productId: 'LWBA04025_NAVY', skuId: 'LWBA04025022UNI', units: '8.42K', value: '3.21M', revenue: '312.50K', rrp: '385', coverage: '18.2' },
  { from: 'DLO WAREHOUSE EUROPE LOUVRES', to: '462 ZV INTERNET', dept: 'ACCESSORIES WOMEN', subDept: 'LEATHER GOOD', season: 'FW24', productId: 'LWBA03024_BROWN', skuId: 'LWBA03024033UNI', units: '5.88K', value: '2.45M', revenue: '198.20K', rrp: '418', coverage: '15.0' },
  { from: 'DLO WAREHOUSE EUROPE LOUVRES', to: '462 ZV INTERNET', dept: 'ACCESSORIES WOMEN', subDept: 'LEATHER GOOD', season: 'SS14', productId: 'LWBA01014_RED', skuId: 'LWBA01014044UNI', units: '2.31K', value: '0.98M', revenue: '85.40K', rrp: '428', coverage: '12.8' },
  { from: 'DLO WAREHOUSE EUROPE LOUVRES', to: '462 ZV INTERNET', dept: 'ACCESSORIES WOMEN', subDept: 'LEATHER GOOD', season: 'FW25', productId: 'LWBA04026_WHITE', skuId: 'LWBA04026055UNI', units: '15.62K', value: '6.82M', revenue: '542.10K', rrp: '438', coverage: '24.1' },
  { from: 'DLO WAREHOUSE EUROPE LOUVRES', to: '462 ZV INTERNET', dept: 'ACCESSORIES WOMEN', subDept: 'LEATHER GOOD', season: 'SS25', productId: 'LWBA04027_GREY', skuId: 'LWBA04027066UNI', units: '9.75K', value: '4.12M', revenue: '365.80K', rrp: '422', coverage: '19.3' },
]

const TRIPS_NODE_NAMES = [
  'Bruxelles', 'Lille', 'Bordeaux', 'Printemps Lille', 'Printemps Lyon', 'Printemps Toulon', 'Printemps Brest',
  'Deauville', 'Printemps Nation', 'Printemps Caen', 'Printemps Nancy', 'Printemps Rouen', 'Aix en Provence',
  'G.L. Lyon Part Dieu', 'G.L. Annecy', 'G.L. Lyon Bron', 'G.L. Haussmann Maro', 'G.L. Nantes', 'G.L. Tours',
  'G.L. Perpignan', 'G.L. Beauvienne', 'Printemps Haussmann Maro', 'Printemps Velizy 2', 'Parly 2',
]

function buildTripsGraph() {
  const nodes = TRIPS_NODE_NAMES.map((name) => ({
    id: name,
    name,
    isBruxelles: name === 'Bruxelles',
  }))
  const bruxellesId = 'Bruxelles'
  const linksToBruxelles = [
    'Bordeaux', 'Printemps Toulon', 'Printemps Brest', 'Deauville', 'G.L. Lyon Bron', 'G.L. Nantes',
    'G.L. Perpignan', 'G.L. Tours', 'Printemps Caen', 'Printemps Nation', 'Lille', 'Printemps Lille',
    'Aix en Provence', 'Printemps Lyon', 'G.L. Lyon Part Dieu', 'G.L. Annecy',
  ]
  const links = [
    ...linksToBruxelles.map((target) => ({ source: bruxellesId, target, toBruxelles: true })),
    { source: 'Lille', target: 'Printemps Lille' },
    { source: 'Lille', target: 'Bordeaux' },
    { source: 'Aix en Provence', target: 'Printemps Lyon' },
    { source: 'G.L. Lyon Part Dieu', target: 'G.L. Lyon Bron' },
    { source: 'G.L. Haussmann Maro', target: 'Printemps Haussmann Maro' },
    { source: 'Printemps Nation', target: 'Parly 2' },
    { source: 'Printemps Nation', target: 'Printemps Velizy 2' },
    { source: 'G.L. Nantes', target: 'Printemps Brest' },
    { source: 'G.L. Tours', target: 'Printemps Rouen' },
    { source: 'G.L. Perpignan', target: 'Printemps Toulon' },
  ]
  return { nodes, links }
}

function TripsNodeMap() {
  const [countryFilter, setCountryFilter] = useState('BELGIQUE')
  const fgRef = useRef()
  const highlightBelgique = countryFilter === 'BELGIQUE'
  const graphData = useMemo(() => buildTripsGraph(), [])

  const handleZoomIn = useCallback(() => {
    if (fgRef.current) {
      const c = fgRef.current.camera()
      fgRef.current.camera({ ...c, zoom: (c.zoom || 1) * 1.3 })
    }
  }, [])
  const handleZoomOut = useCallback(() => {
    if (fgRef.current) {
      const c = fgRef.current.camera()
      fgRef.current.camera({ ...c, zoom: (c.zoom || 1) / 1.3 })
    }
  }, [])
  const handleReset = useCallback(() => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(400)
    }
  }, [])

  return (
    <section className="bg-white rounded-[14px] border border-[#e5e7eb] overflow-hidden">
      <div className="p-6 border-b border-[#e5e7eb]">
        <h2 className="text-lg font-medium text-[#0a0a0a]">Trips</h2>
      </div>
      <div className="relative bg-[#1a1f26] min-h-[400px]" style={{ height: 480 }}>
        <div className="absolute top-4 left-4 z-10 bg-[#252b33] rounded-lg px-3 py-2 border border-[#3a4149]">
          <div className="text-xs font-medium text-[#9ca3af] mb-2">Countries</div>
          <label className="flex items-center gap-2 cursor-pointer mb-1">
            <span className={`size-3 rounded-full border-2 ${highlightBelgique ? 'bg-red-500 border-red-500' : 'border-[#3b82f6] bg-transparent'}`} />
            <span className="text-sm text-white">BELGIQUE</span>
            <input
              type="radio"
              name="country"
              checked={highlightBelgique}
              onChange={() => setCountryFilter('BELGIQUE')}
              className="sr-only"
            />
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className={`size-3 rounded-full border-2 ${!highlightBelgique ? 'bg-[#3b82f6] border-[#3b82f6]' : 'border-[#3b82f6] bg-transparent'}`} />
            <span className="text-sm text-white">FRANCE</span>
            <input
              type="radio"
              name="country"
              checked={!highlightBelgique}
              onChange={() => setCountryFilter('FRANCE')}
              className="sr-only"
            />
          </label>
        </div>

        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          width={typeof window !== 'undefined' ? Math.min(window.innerWidth - 280, 1200) : 800}
          height={480}
          backgroundColor="transparent"
          nodeLabel="name"
          linkColor={(link) => (link.toBruxelles && highlightBelgique ? '#e879f9' : '#4b5563')}
          linkWidth={1}
          nodeRelSize={10}
          nodeColor={(node) => (node.isBruxelles && highlightBelgique ? '#f87171' : '#60a5fa')}
          nodeVal={(node) => (node.isBruxelles ? 1.5 : 1)}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name
            const size = (node.isBruxelles ? 12 : 8) / Math.sqrt(globalScale)
            ctx.beginPath()
            ctx.arc(node.x, node.y, size, 0, 2 * Math.PI)
            ctx.fillStyle = node.isBruxelles && highlightBelgique ? '#f87171' : '#60a5fa'
            ctx.fill()
            ctx.font = `${10 / Math.sqrt(globalScale)}px Sans-Serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = 'white'
            ctx.fillText(label, node.x, node.y)
          }}
          onNodeClick={(node) => { if (node.x != null && node.y != null) fgRef.current?.centerAt(node.x, node.y, 400) }}
          cooldownTicks={100}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
        />

        <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
          <button type="button" onClick={handleReset} className="size-10 rounded-full bg-emerald-500/90 hover:bg-emerald-500 flex items-center justify-center text-white shadow-lg" aria-label="Reset view">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4h4v4H4V4zm8 0h4v4h-4V4zM4 12h4v4H4v-4zm8 0h4v4h-4v-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button type="button" onClick={handleZoomOut} className="size-10 rounded-full bg-emerald-500/90 hover:bg-emerald-500 flex items-center justify-center text-white shadow-lg" aria-label="Zoom out">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
          <button type="button" onClick={handleZoomIn} className="size-10 rounded-full bg-emerald-500/90 hover:bg-emerald-500 flex items-center justify-center text-white shadow-lg" aria-label="Zoom in">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>
      </div>
    </section>
  )
}

export default function OptimiserStatusPage() {
  const [activeTab, setActiveTab] = useState('Replenishment')
  const [tripsExpanded, setTripsExpanded] = useState(['rebalancing', 'lille', 'la-defense', 'aix'])

  const toggleTripsRow = (id) => {
    setTripsExpanded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <div className="bg-[#f5f5f5] min-h-full">
      {/* Header - white bar */}
      <header className="w-[calc(100%+4rem)] min-w-0 -ml-8 bg-white border-b border-[#e5e7eb]">
        <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-4">
          <div className="flex items-center gap-2">
            <IconCheckGreen />
            <h1 className="text-xl font-medium text-[#0a0a0a]">Optimiser status</h1>
            <div className="flex items-center gap-1">
              <button type="button" className="p-1.5 rounded text-[#6a7282] hover:bg-[#f5f5f5]" aria-label="Settings">
                <IconGears className="size-4" />
              </button>
              <button type="button" className="p-1.5 rounded text-[#6a7282] hover:bg-[#f5f5f5]" aria-label="Add to favourites">
                <IconStar className="size-4" />
              </button>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-6">
            {OPTIMISER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-medium pb-1 border-b-2 transition-colors shrink-0 ${
                  activeTab === tab ? 'text-[#0a0a0a] border-[#155dfc]' : 'text-[#6a7282] border-transparent hover:text-[#0a0a0a]'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button type="button" className="h-10 px-4 rounded-lg border border-[#e5e7eb] bg-[#f3f3f5] text-[#4a5565] text-sm font-medium flex items-center gap-2 hover:bg-[#eeeeee] shrink-0">
              <IconBulb className="size-4" />
              AI Highlights
            </button>
            <button type="button" className="size-10 rounded-lg flex items-center justify-center text-[#4a5565] hover:bg-[#f5f5f5] shrink-0" aria-label="Export">
              <IconShare className="size-5" />
            </button>
            <button type="button" className="size-10 rounded-lg flex items-center justify-center text-[#4a5565] hover:bg-[#f5f5f5] shrink-0" aria-label="More options">
              <IconEllipsisVertical className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Filter pills */}
      <div className="w-[calc(100%+4rem)] min-w-0 -ml-8 bg-white px-8 py-4 border-b border-[#e5e7eb]">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {FILTER_ROW_1.map((pill) => (
              <FilterPill key={pill.label} label={pill.label} active={pill.active} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTER_ROW_2.map((pill) => (
              <FilterPill key={pill.label} label={pill.label} active={pill.active} />
            ))}
          </div>
        </div>
      </div>

      {/* Content cards */}
      <div className="pt-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-6">
          {/* Runs overview - left, wide */}
          <section className="bg-white rounded-[14px] border border-[#e5e7eb] p-6">
            <h2 className="text-lg font-medium text-[#0a0a0a] mb-6">Runs overview</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-[#6a7282] mb-1">Runs completed</div>
                <div className="text-[28px] font-semibold tracking-tight text-[#0a0a0a]">142</div>
              </div>
              <div>
                <div className="text-sm text-[#6a7282] mb-1">Runs in progress</div>
                <div className="text-[28px] font-semibold tracking-tight text-[#0a0a0a]">3</div>
              </div>
              <div>
                <div className="text-sm text-[#6a7282] mb-1">Jobs scheduled</div>
                <div className="text-[28px] font-semibold tracking-tight text-[#0a0a0a]">48</div>
              </div>
              <div>
                <div className="text-sm text-[#6a7282] mb-1">Products optimised</div>
                <div className="text-[28px] font-semibold tracking-tight text-[#0a0a0a]">1.26K</div>
              </div>
              <div>
                <div className="text-sm text-[#6a7282] mb-1">SKUs optimised</div>
                <div className="text-[28px] font-semibold tracking-tight text-[#0a0a0a]">1.26K</div>
              </div>
              <div>
                <div className="text-sm text-[#6a7282] mb-1">Avg run duration</div>
                <div className="text-[28px] font-semibold tracking-tight text-[#0a0a0a]">12m 34s</div>
              </div>
            </div>
          </section>

          {/* Run status by type - right, narrow - donut */}
          <section className="bg-white rounded-[14px] border border-[#e5e7eb] p-6 flex flex-col items-center justify-center">
            <h2 className="text-lg font-medium text-[#0a0a0a] mb-4 w-full">Run status by type</h2>
            <DonutChart />
          </section>
        </div>

        {/* Estimated impact / Performance metrics - full width */}
        <section className="bg-white rounded-[14px] border border-[#e5e7eb] p-6">
          <h2 className="text-lg font-medium text-[#0a0a0a] mb-6">Estimated impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-[#6a7282] mb-1">Revenue increase</div>
              <div className="text-[28px] font-semibold tracking-tight text-[#0a0a0a]">15.15M</div>
            </div>
            <div>
              <div className="text-sm text-[#6a7282] mb-1">Stockouts addressed</div>
              <div className="text-[28px] font-semibold tracking-tight text-[#0a0a0a]">29.92K</div>
            </div>
            <div>
              <div className="text-sm text-[#6a7282] mb-1">% Stockouts addressed</div>
              <div className="text-[28px] font-semibold tracking-tight text-[#0a0a0a]">0.07%</div>
            </div>
            <div>
              <div className="text-sm text-[#6a7282] mb-1">Consolidated products</div>
              <div className="text-[28px] font-semibold tracking-tight text-[#0a0a0a]">119</div>
            </div>
            <div>
              <div className="text-sm text-[#6a7282] mb-1">Spread products</div>
              <div className="text-[28px] font-semibold tracking-tight text-[#0a0a0a]">876</div>
            </div>
            <div>
              <div className="text-sm text-[#6a7282] mb-1">Additional SKU location reach</div>
              <div className="text-[28px] font-semibold tracking-tight text-[#0a0a0a]">84</div>
            </div>
          </div>
        </section>

        {/* Trips performance table */}
        <section className="bg-white rounded-[14px] border border-[#e5e7eb] overflow-hidden">
          <div className="p-6 border-b border-[#e5e7eb]">
            <h2 className="text-lg font-medium text-[#0a0a0a]">Trips performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f5f5f5] border-b border-[#e5e7eb]">
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Trip type</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">From location</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">To location</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Units transferred</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Value transferred</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Revenue increase</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Costs</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Stockouts addressed</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Consolidated products</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Spread products</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Products</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">SKUs</th>
                </tr>
              </thead>
              <tbody>
                {renderTripsRows(TRIPS_TABLE_DATA, tripsExpanded, toggleTripsRow)}
              </tbody>
            </table>
          </div>
        </section>

        {/* Trips node map */}
        <TripsNodeMap />

        {/* Trips details table */}
        <section className="bg-white rounded-[14px] border border-[#e5e7eb] overflow-hidden">
          <div className="p-6 border-b border-[#e5e7eb]">
            <h2 className="text-lg font-medium text-[#0a0a0a]">Trips details</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f5f5f5] border-b border-[#e5e7eb]">
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">From location</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">To location</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Department</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Sub department</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Season</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Product ID</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Sku ID</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Units transferred</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Value transferred</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">
                    Revenue increase <IconChevronDown className="inline-block size-4 ml-0.5" />
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">RRP</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Coverage horizon from</th>
                </tr>
              </thead>
              <tbody>
                {TRIPS_DETAILS_ROWS.map((row, i) => (
                  <tr key={i} className="border-b border-[#e5e7eb] hover:bg-[#f9fafb]">
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.from}</td>
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.to}</td>
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.dept}</td>
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.subDept}</td>
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.season}</td>
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.productId}</td>
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.skuId}</td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.units}</td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.value}</td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.revenue}</td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.rrp}</td>
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.coverage}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#f5f5f5] font-medium border-t-2 border-[#e5e7eb]">
                  <td className="py-3 px-4">
                    <span className="text-xs text-[#6a7282] block">UNIQUE COUNT</span>
                    <span className="text-base font-medium text-[#0a0a0a]">456</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-[#6a7282] block">UNIQUE COUNT</span>
                    <span className="text-base font-medium text-[#0a0a0a]">480</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-[#6a7282] block">UNIQUE COUNT</span>
                    <span className="text-base font-medium text-[#0a0a0a]">73</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-[#6a7282] block">UNIQUE COUNT</span>
                    <span className="text-base font-medium text-[#0a0a0a]">169</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-[#6a7282] block">UNIQUE COUNT</span>
                    <span className="text-base font-medium text-[#0a0a0a]">66</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-[#6a7282] block">UNIQUE COUNT</span>
                    <span className="text-base font-medium text-[#0a0a0a]">9,723</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-[#6a7282] block">UNIQUE COUNT</span>
                    <span className="text-base font-medium text-[#0a0a0a]">19,943</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-xs text-[#6a7282] block">TOTAL</span>
                    <span className="text-base font-medium text-[#0a0a0a]">4.78M</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-xs text-[#6a7282] block">TOTAL</span>
                    <span className="text-base font-medium text-[#0a0a0a]">1.15B</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-xs text-[#6a7282] block">TOTAL</span>
                    <span className="text-base font-medium text-[#0a0a0a]">675.31M</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-xs text-[#6a7282] block">TOTAL</span>
                    <span className="text-base font-medium text-[#0a0a0a]">90.77M</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-[#6a7282] block">MAXIM</span>
                    <span className="text-base font-medium text-[#0a0a0a]">21.5</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-[#e5e7eb] text-xs text-[#6a7282]">
            Showing 1,000 of many rows
          </div>
        </section>

        {/* Trips details - stock & coverage */}
        <section className="bg-white rounded-[14px] border border-[#e5e7eb] overflow-hidden">
          <div className="p-6 border-b border-[#e5e7eb]">
            <h2 className="text-lg font-medium text-[#0a0a0a]">Trips details</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f5f5f5] border-b border-[#e5e7eb]">
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">From location</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">To location</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Product ID</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Sku ID</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Units transferred</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Value transferred</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">
                    Revenue increase <IconChevronDown className="inline-block size-4 ml-0.5" />
                  </th>
                  <th colSpan={7} className="text-center py-2 px-4 font-medium text-[#6a7282] text-xs">Values</th>
                </tr>
                <tr className="bg-[#f5f5f5] border-b border-[#e5e7eb]">
                  <th className="py-0" colSpan={6} />
                  <th className="py-0" />
                  <th className="text-right py-2 px-4 font-medium text-[#4a5565] text-xs">RRP</th>
                  <th className="text-right py-2 px-4 font-medium text-[#4a5565] text-xs">Stock before from</th>
                  <th className="text-right py-2 px-4 font-medium text-[#4a5565] text-xs">Stock after from</th>
                  <th className="text-right py-2 px-4 font-medium text-[#4a5565] text-xs">WOC before from</th>
                  <th className="text-right py-2 px-4 font-medium text-[#4a5565] text-xs">WOC after from</th>
                  <th className="text-right py-2 px-4 font-medium text-[#4a5565] text-xs">Sales rate from</th>
                  <th className="text-left py-2 px-4 font-medium text-[#4a5565] text-xs">Coverage horizon from</th>
                </tr>
              </thead>
              <tbody>
                {TRIPS_DETAILS_STOCK_ROWS.map((row, i) => (
                  <tr key={i} className="border-b border-[#e5e7eb] hover:bg-[#f9fafb]">
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.from}</td>
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.to}</td>
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.productId}</td>
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.skuId}</td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.units}</td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.value}</td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.revenue}</td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.rrp}</td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.stockBefore}</td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.stockAfter}</td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.wocBefore}</td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.wocAfter}</td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.salesRate}</td>
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.coverage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-[#e5e7eb] text-xs text-[#6a7282]">
            Showing 18 of many rows
          </div>
        </section>
      </div>
    </div>
  )
}
