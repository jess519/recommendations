import { IconChevronDown, IconStar, IconBell, IconBulb, IconShare, IconEllipsisVertical } from '../components/icons'

const BUYING_FILTER_ROW_1 = [
  { label: 'Customer new demo', active: true },
  { label: 'Min date Last 4 Months (01/10/2025 < 01/02/2026)', active: true },
  { label: 'Department (Select)', active: false },
  { label: 'Sub department (Select)', active: false },
  { label: 'Gender (Select)', active: false },
  { label: 'Brand (Select)', active: false },
  { label: 'Style (Select)', active: false },
  { label: 'Event (Select)', active: false },
  { label: 'Season (Select)', active: false },
  { label: 'Product ID (Select)', active: false },
]

const BUYING_FILTER_ROW_2 = [
  { label: 'Region (Select)', active: false },
  { label: 'Country (Select)', active: false },
  { label: 'Location (Select)', active: false },
  { label: 'Location type (Select)', active: false },
  { label: 'Location attributes Region', active: true },
  { label: 'Product attributes Department', active: true },
]

const BUYING_TABLE_ROWS = [
  { locAttr: 'COM', prodAttr: 'Apparel', products: '412', locations: '42', salesUnits: '34.79K', salesValue: '12.45M', availQty: '8.2K', availValue: '28.5M', sellThrough: '100%', assorted: '380', mixSales: '21%', mixAssort: '4.2', avgPrice: '358' },
  { locAttr: 'North America', prodAttr: 'Fragrance & Home', products: '285', locations: '38', salesUnits: '28.12K', salesValue: '8.92M', availQty: '6.1K', availValue: '22.1M', sellThrough: '71%', assorted: '245', mixSales: '18%', mixAssort: '3.8', avgPrice: '312' },
  { locAttr: 'Asia', prodAttr: 'Handbags', products: '198', locations: '28', salesUnits: '22.45K', salesValue: '15.2M', availQty: '4.8K', availValue: '18.2M', sellThrough: '54%', assorted: '165', mixSales: '14%', mixAssort: '2.9', avgPrice: '678' },
  { locAttr: 'Europe', prodAttr: 'Footwear', products: '320', locations: '45', salesUnits: '28.9K', salesValue: '9.45M', availQty: '7.2K', availValue: '25.3M', sellThrough: '62%', assorted: '295', mixSales: '19%', mixAssort: '4.1', avgPrice: '328' },
  { locAttr: 'UK', prodAttr: 'Jewelry', products: '156', locations: '22', salesUnits: '12.8K', salesValue: '6.2M', availQty: '3.5K', availValue: '14.1M', sellThrough: '88%', assorted: '142', mixSales: '8%', mixAssort: '2.4', avgPrice: '485' },
  { locAttr: 'MEA', prodAttr: 'Watches', products: '89', locations: '15', salesUnits: '6.2K', salesValue: '4.8M', availQty: '2.1K', availValue: '9.2M', sellThrough: '45%', assorted: '78', mixSales: '5%', mixAssort: '1.8', avgPrice: '775' },
]

function FilterPill({ label, active }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors shrink-0 ${
        active ? 'bg-[#4a5565] text-white' : 'bg-[#f3f3f5] text-[#0a0a0a] border border-[#e5e7eb] hover:bg-[#eeeeee]'
      }`}
    >
      {label}
    </button>
  )
}

function IconRefresh() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
      <path d="M16 10a6 6 0 01-11 4.5M4 10a6 6 0 0111-4.5M4 4v3h3M16 16v-3h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function BuyingPage() {
  return (
    <div className="bg-[#f5f5f5] min-h-full">
      {/* Header - white bar */}
      <header className="w-[calc(100%+4rem)] min-w-0 -ml-8 bg-white border-b border-[#e5e7eb]">
        <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-medium text-[#0a0a0a]">Buying</h1>
            <div className="flex items-center gap-1">
              <button type="button" className="p-1.5 rounded text-[#6a7282] hover:bg-[#f5f5f5]" aria-label="Refresh">
                <IconRefresh />
              </button>
              <button type="button" className="p-1.5 rounded text-[#6a7282] hover:bg-[#f5f5f5]" aria-label="Add to favourites">
                <IconStar className="size-4" />
              </button>
              <button type="button" className="p-1.5 rounded text-[#6a7282] hover:bg-[#f5f5f5]" aria-label="Alerts">
                <IconBell className="size-4" />
              </button>
            </div>
          </div>

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
            {BUYING_FILTER_ROW_1.map((pill) => (
              <FilterPill key={pill.label} label={pill.label} active={pill.active} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {BUYING_FILTER_ROW_2.map((pill) => (
              <FilterPill key={pill.label} label={pill.label} active={pill.active} />
            ))}
          </div>
        </div>
      </div>

      {/* Buying report table */}
      <div className="pt-6">
        <section className="bg-white border border-[#e5e7eb] rounded-[14px] overflow-hidden">
          <div className="p-6 border-b border-[#e5e7eb]">
            <h2 className="text-lg font-medium text-[#0a0a0a]">Buying report</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f5f5f5] border-b border-[#e5e7eb]">
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Location attribute</th>
                  <th className="text-left py-3 px-4 font-medium text-[#4a5565]">Product attribute</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Products</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Locations</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">
                    Sales units <IconChevronDown className="inline-block size-4 ml-0.5" />
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Sales value</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Available qty EOP</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Available value EOP</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Sell Through</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Assorted products</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Mix sales</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Mix assortment</th>
                  <th className="text-right py-3 px-4 font-medium text-[#4a5565]">Avg Price (Sell out)</th>
                </tr>
              </thead>
              <tbody>
                {BUYING_TABLE_ROWS.map((row, i) => (
                  <tr
                    key={`${row.locAttr}-${row.prodAttr}`}
                    className="border-b border-[#e5e7eb] hover:bg-[#f9fafb]"
                  >
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.locAttr}</td>
                    <td className="py-2.5 px-4 text-[#0a0a0a]">{row.prodAttr}</td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.products}</td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.locations}</td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.salesUnits}</td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.salesValue}</td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.availQty}</td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.availValue}</td>
                    <td className={`py-2.5 px-4 text-right ${parseFloat(row.sellThrough) >= 100 ? 'bg-amber-100 text-amber-800' : 'text-[#0a0a0a]'}`}>{row.sellThrough}</td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.assorted}</td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.mixSales}</td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.mixAssort}</td>
                    <td className="py-2.5 px-4 text-right text-[#0a0a0a]">{row.avgPrice}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#f5f5f5] font-medium border-b border-[#e5e7eb]">
                  <td className="py-3 px-4 text-[#0a0a0a]">6</td>
                  <td className="py-3 px-4 text-[#0a0a0a]">6</td>
                  <td className="py-3 px-4 text-right text-[#0a0a0a]">2.42K</td>
                  <td className="py-3 px-4 text-right text-[#0a0a0a]">232</td>
                  <td className="py-3 px-4 text-right text-[#0a0a0a]">164.17K</td>
                  <td className="py-3 px-4 text-right text-[#0a0a0a]">0</td>
                  <td className="py-3 px-4 text-right text-[#0a0a0a]">58.17K</td>
                  <td className="py-3 px-4 text-right text-[#0a0a0a]">180.58M</td>
                  <td className="py-3 px-4 text-right text-[#0a0a0a]">AVERAGE 0.53</td>
                  <td className="py-3 px-4 text-right text-[#0a0a0a]">1.83K</td>
                  <td className="py-3 px-4 text-right text-[#0a0a0a]">100%</td>
                  <td className="py-3 px-4 text-right text-[#0a0a0a]">4.79</td>
                  <td className="py-3 px-4 text-right text-[#0a0a0a]">0</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-[#e5e7eb] text-xs text-[#6a7282]">
            Showing 36 of 36 rows
          </div>
        </section>
      </div>
    </div>
  )
}
