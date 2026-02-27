import { useState } from 'react'
import { IconSearch, IconChevronDown, IconGears } from '../components/icons'

const SCOPE_PRODUCTS = [
  { name: 'Ori-sac pte croise m', sku: 'A12528YY', color: 'Kaki fonce', transfers: [32, 8], sales: [33, 155], forecast: 15.54, revenue: '€15.1K', stockouts: [0, 2], locations: [7, 5], overstocks: [46, 16], understocks: [41, 9], dept: 20.0 },
  { name: 'Ori-sac pte croise m', sku: 'A1252810', color: 'Noir', transfers: [29, 7], sales: [61, 219], forecast: 28.22, revenue: '€12.1K', stockouts: [0, 1], locations: [6, 5], overstocks: [46, 25], understocks: [93, 64], dept: 27.2 },
  { name: 'Ori-sac hobo m', sku: 'A13314YY', color: 'Kaki fonce', transfers: [20, 6], sales: [19, 74], forecast: 10.71, revenue: '€9.94K', stockouts: [0, 0], locations: [5, 5], overstocks: [27, 7], understocks: [22, 2], dept: 14.4 },
  { name: 'Ninon-sac seau s', sku: 'A1092220', color: 'Camel', transfers: [28, 23], sales: [5, 35], forecast: 5.64, revenue: '€7.81K', stockouts: [15, 8], locations: [25, 32], overstocks: [31, 9], understocks: [29, 1], dept: 2.1 },
  { name: 'Hui-sac seau s', sku: 'A9307045', color: 'Bleu nuit', transfers: [16, 6], sales: [15, 82], forecast: 9.96, revenue: '€7.18K', stockouts: [0, 0], locations: [5, 5], overstocks: [32, 17], understocks: [21, 5], dept: 17.4 },
  { name: 'Ninon-sac rabat l', sku: 'A0922310', color: 'Noir', transfers: [22, 17], sales: [4, 21], forecast: 4.64, revenue: '€7.13K', stockouts: [15, 9], locations: [16, 22], overstocks: [18, 4], understocks: [25, 3], dept: 2.1 },
  { name: 'Ninon-sac seau s', sku: 'A1092210', color: 'Noir', transfers: [23, 19], sales: [3, 25], forecast: 5.12, revenue: '€6.54K', stockouts: [17, 16], locations: [19, 20], overstocks: [9, 1], understocks: [28, 5], dept: 1.4 },
]

export default function ScopePage() {
  const [activeTab, setActiveTab] = useState('products')
  const [tripType, setTripType] = useState('rebalancing')
  const [includeZeroTransfers, setIncludeZeroTransfers] = useState(true)
  return (
    <div className="pt-6 flex flex-col gap-6">
      <div className="rounded-[10px] overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 p-4">
          <div className="flex gap-6">
            <button type="button" onClick={() => setActiveTab('products')} className={`text-[14px] font-medium pb-2 border-b-2 ${activeTab === 'products' ? 'text-[#0267ff] border-[#0267ff]' : 'text-[#4b535c] border-transparent'}`}>Products</button>
            <button type="button" onClick={() => setActiveTab('locations')} className={`text-[14px] font-medium pb-2 border-b-2 ${activeTab === 'locations' ? 'text-[#0267ff] border-[#0267ff]' : 'text-[#4b535c] border-transparent'}`}>Locations</button>
          </div>
          <div className="flex flex-col gap-4 ml-auto">
            <div className="flex items-center gap-4">
              <span className="text-[14px] text-[#4b535c]">Trip type:</span>
              <div className="flex rounded-[4px] border border-[#e5e7eb] bg-white overflow-hidden">
                <button type="button" onClick={() => setTripType('rebalancing')} className={`px-3 py-2 text-[14px] font-medium border-r border-[#e5e7eb] ${tripType === 'rebalancing' ? 'bg-[#f7f7f7] text-[#0a0a0a]' : 'text-[#4b535c] hover:bg-[#f9fafb] bg-white'}`}>Rebalancing</button>
                <button type="button" onClick={() => setTripType('replenishment')} className={`px-3 py-2 text-[14px] font-medium border-r border-[#e5e7eb] ${tripType === 'replenishment' ? 'bg-[#f7f7f7] text-[#0a0a0a]' : 'text-[#4b535c] hover:bg-[#f9fafb] bg-white'}`}>Replenishment</button>
                <button type="button" onClick={() => setTripType('reorder')} className={`px-3 py-2 text-[14px] font-medium ${tripType === 'reorder' ? 'bg-[#f7f7f7] text-[#0a0a0a]' : 'text-[#4b535c] hover:bg-[#f9fafb] bg-white'}`}>Reorder</button>
              </div>
              <div className="w-px h-6 bg-[#e5e7eb]" aria-hidden />
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-[#4b535c]">Include zero transfers</span>
                <button type="button" onClick={() => setIncludeZeroTransfers((v) => !v)} className={`relative w-11 h-6 rounded-full transition-colors flex items-center shrink-0 ${includeZeroTransfers ? 'bg-[#0267ff]' : 'bg-[#e5e7eb]'}`} aria-pressed={includeZeroTransfers}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${includeZeroTransfers ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <div className="flex items-center h-10 w-[240px] rounded-[4px] border border-[#e9eaeb] bg-white pl-3 pr-3">
                <IconSearch className="text-[#4b535c] shrink-0" />
                <input type="text" placeholder="Search..." className="flex-1 min-w-0 pl-2 border-0 bg-transparent text-[14px] text-[#0a0a0a] outline-none placeholder:text-[#4b535c]" />
              </div>
              <button type="button" className="flex items-center justify-center gap-2 h-10 px-4 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#22272f] shrink-0">
                Revenue increase
                <IconChevronDown className="shrink-0 text-[#22272f] size-4" aria-hidden />
              </button>
              <button type="button" className="h-10 w-10 flex items-center justify-center rounded-[4px] border border-[#e9eaeb] bg-white text-[#22272f] hover:bg-[#f3f4f6] shrink-0" aria-label="Settings">
                <IconGears className="size-5 shrink-0" />
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-[14px]">
            <thead className="bg-[#f8f8f8]">
              <tr className="border-b border-[#e5e7eb] bg-[#f8f8f8]">
                <th className="text-left py-3 px-4 font-medium text-[#0a0a0a] bg-[#f8f8f8]">Product details</th>
                <th className="text-left py-3 px-4 font-medium text-[#0a0a0a] bg-[#f8f8f8]">Transfers</th>
                <th className="text-left py-3 px-4 font-medium text-[#0a0a0a] bg-[#f8f8f8]">Sales</th>
                <th className="text-left py-3 px-4 font-medium text-[#0a0a0a] bg-[#f8f8f8]">Forecast</th>
                <th className="text-left py-3 px-4 font-medium text-[#0a0a0a] bg-[#f8f8f8]">Revenue increase</th>
                <th className="text-left py-3 px-4 font-medium text-[#0a0a0a] bg-[#f8f8f8]">Stockouts</th>
                <th className="text-left py-3 px-4 font-medium text-[#0a0a0a] bg-[#f8f8f8]">Locations</th>
                <th className="text-left py-3 px-4 font-medium text-[#0a0a0a] bg-[#f8f8f8]">Overstocks</th>
                <th className="text-left py-3 px-4 font-medium text-[#0a0a0a] bg-[#f8f8f8]">Understocks</th>
                <th className="text-left py-3 px-4 font-medium text-[#0a0a0a] bg-[#f8f8f8]">Dept</th>
              </tr>
              <tr className="border-b border-[#e5e7eb] bg-[#f8f8f8]">
                <th className="text-left py-2 px-4 bg-[#f8f8f8]" />
                <th className="text-left py-2 px-4 text-[12px] font-normal text-[#4b535c] bg-[#f8f8f8]">3,220 units · 113 trips</th>
                <th className="text-left py-2 px-4 text-[12px] font-normal text-[#4b535c] bg-[#f8f8f8]">991 L7D · 5,468 L30D</th>
                <th className="text-left py-2 px-4 text-[12px] font-normal text-[#4b535c] bg-[#f8f8f8]">1077.84</th>
                <th className="text-left py-2 px-4 text-[12px] font-normal text-[#4b535c] bg-[#f8f8f8]">€661.8K</th>
                <th className="text-left py-2 px-4 text-[12px] font-normal text-[#4b535c] bg-[#f8f8f8]">38,598 → 37,855</th>
                <th className="text-left py-2 px-4 text-[12px] font-normal text-[#4b535c] bg-[#f8f8f8]">61 → 61</th>
                <th className="text-left py-2 px-4 text-[12px] font-normal text-[#4b535c] bg-[#f8f8f8]">5,566 → 2,930</th>
                <th className="text-left py-2 px-4 text-[12px] font-normal text-[#4b535c] bg-[#f8f8f8]">4,846 → 1,672</th>
                <th className="text-left py-2 px-4 text-[12px] font-normal text-[#4b535c] bg-[#f8f8f8]">0.6</th>
              </tr>
            </thead>
            <tbody>
              {SCOPE_PRODUCTS.map((row, i) => (
                <tr key={i} className="border-b border-[#e5e7eb] bg-[#ffffff] hover:bg-[#f9fafb]">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[4px] bg-[#f3f4f6] shrink-0" aria-hidden />
                      <div>
                        <p className="font-medium text-[#0a0a0a]">{row.name}</p>
                        <p className="text-[12px] text-[#4b535c]">{row.sku} · {row.color}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#0a0a0a]">{row.transfers[0]} · {row.transfers[1]}</td>
                  <td className="py-3 px-4 text-[#0a0a0a]">{row.sales[0]} · {row.sales[1]}</td>
                  <td className="py-3 px-4 text-[#0a0a0a]">{row.forecast}</td>
                  <td className="py-3 px-4 text-[#0a0a0a]">{row.revenue}</td>
                  <td className="py-3 px-4 text-[#0a0a0a]">{row.stockouts[0]} → {row.stockouts[1]}</td>
                  <td className="py-3 px-4 text-[#0a0a0a]">{row.locations[0]} → {row.locations[1]}</td>
                  <td className="py-3 px-4 text-[#0a0a0a]">{row.overstocks[0]} → {row.overstocks[1]}</td>
                  <td className="py-3 px-4 text-[#0a0a0a]">{row.understocks[0]} → {row.understocks[1]}</td>
                  <td className="py-3 px-4 text-[#0a0a0a]">{row.dept}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
