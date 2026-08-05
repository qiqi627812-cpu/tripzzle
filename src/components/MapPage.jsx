import { useMemo, useState } from 'react'
import { FileDown, ListChecks, MapPin, Route, Sparkles } from 'lucide-react'
import AnimalPageHero from './AnimalPageHero'
import FloatingMap from './FloatingMap'
import { getAllDestinations } from '../data/destinations'
import { buildPinsFromItinerary } from '../utils/mapPins'

function normalizePlan(payload) {
  if (Array.isArray(payload)) return { days: payload }
  if (payload?.days && Array.isArray(payload.days)) return payload
  return { days: [] }
}

function loadSavedPlan() {
  try {
    return normalizePlan(JSON.parse(localStorage.getItem('tripzzle_saved_itinerary') || 'null'))
  } catch {
    return { days: [] }
  }
}

function getItems(day) {
  return Array.isArray(day) ? day : (day?.items || [])
}

export default function MapPage({ itinerary, destinationId, destinationData, preferences, onPageChange }) {
  const [plan, setPlan] = useState(() => {
    const incoming = normalizePlan(itinerary)
    return incoming.days.length ? incoming : loadSavedPlan()
  })
  const [mode, setMode] = useState('all')
  const destination = destinationData || getAllDestinations().find(item => item.id === destinationId) || { name: '我的旅行' }
  const pins = useMemo(() => buildPinsFromItinerary(plan.days), [plan])
  const transportCount = useMemo(
    () => plan.days.flatMap(getItems).filter(item => item.isTransport || item.type === 'transport').length,
    [plan],
  )

  const updatePlan = (pinId, change) => {
    setPlan(previous => {
      const days = previous.days.map(day => {
        const items = getItems(day).map(item => item.id === pinId ? { ...item, ...change } : item)
        return Array.isArray(day) ? items : { ...day, items }
      })
      const next = { ...previous, days }
      localStorage.setItem('tripzzle_saved_itinerary', JSON.stringify(next))
      return next
    })
  }

  const removePin = (pinId) => {
    setPlan(previous => {
      const days = previous.days.map(day => {
        const items = getItems(day).filter(item => item.id !== pinId)
        return Array.isArray(day) ? items : { ...day, items }
      })
      const next = { ...previous, days }
      localStorage.setItem('tripzzle_saved_itinerary', JSON.stringify(next))
      return next
    })
  }

  const addPin = (place) => {
    setPlan(previous => {
      const newItem = {
        id: `map-${Date.now()}`,
        name: place.name,
        type: 'custom',
        typeLabel: '地图新增',
        time: '09:00',
        durationMinutes: 30,
        address: place.address || '',
        location: place.address || '',
        lat: place.lat,
        lng: place.lng,
        isCustom: true,
      }
      const days = previous.days.length ? [...previous.days] : [{ date: '', items: [] }]
      const firstDay = days[0]
      days[0] = Array.isArray(firstDay) ? [...firstDay, newItem] : { ...firstDay, items: [...getItems(firstDay), newItem] }
      const next = { ...previous, days }
      localStorage.setItem('tripzzle_saved_itinerary', JSON.stringify(next))
      return next
    })
  }

  const handleExport = () => {
    const previousTitle = document.title
    document.title = `Tripzzle-${destination.name}-行程地图`
    const restore = () => {
      document.title = previousTitle
      window.removeEventListener('afterprint', restore)
    }
    window.addEventListener('afterprint', restore)
    window.print()
    window.setTimeout(restore, 1500)
  }

  return (
    <main className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-5 sm:px-6 sm:pt-7">
      <AnimalPageHero
        role="catMap"
        eyebrow="地图小猫 · 行程地图"
        title="把每天的脚步，放到一张地图上"
        subtitle="查看路线顺序、切换每天的点位，也可以补充地点或直接导航。"
      >
        <div className="flex flex-wrap gap-2">
          <button onClick={handleExport} className="btn-primary flex min-h-[44px] items-center gap-2 px-4 py-2.5 text-sm">
            <FileDown className="h-[18px] w-[18px]" />
            导出地图 PDF
          </button>
          <button onClick={() => onPageChange?.('itinerary')} className="flex min-h-[44px] items-center gap-2 rounded-xl border border-trip-border bg-white/70 px-4 py-2.5 text-sm font-medium text-trip-slate transition-colors hover:text-trip-mint">
            <ListChecks className="h-[18px] w-[18px]" />
            查看行程详情
          </button>
        </div>
      </AnimalPageHero>

      <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          [MapPin, '地图点位', `${pins.length} 个`],
          [Route, '行程天数', `${plan.days.length} 天`],
          [Sparkles, '交通衔接', `${transportCount} 段`],
          [ListChecks, '当前视图', mode === 'all' ? '全部行程' : `第 ${mode.split('-')[1]} 天`],
        ].map(([Icon, label, value]) => (
          <div key={label} className="rounded-2xl border border-trip-border bg-white/75 p-4 shadow-soft backdrop-blur-sm">
            <Icon className="mb-3 h-5 w-5 text-trip-mint" />
            <div className="text-xs text-trip-muted">{label}</div>
            <div className="mt-1 text-lg font-semibold text-trip-ink">{value}</div>
          </div>
        ))}
      </section>

      <section className="mt-5 h-[620px] overflow-hidden rounded-2xl">
        <FloatingMap
          embedded
          pins={pins}
          destination={destination}
          preferences={preferences}
          mode={mode}
          onModeChange={setMode}
          totalDays={plan.days.length}
          onUpdatePin={updatePlan}
          onAddPin={addPin}
          onRemovePin={removePin}
        />
      </section>

      <MapPrintView plan={plan} destination={destination} pins={pins} />
    </main>
  )
}

function MapPrintView({ plan, destination, pins }) {
  return (
    <article className="itinerary-print-view" aria-hidden="true">
      <header className="itinerary-print-header">
        <div>
          <div className="itinerary-print-brand">TRIPZZLE · 行程地图</div>
          <h1>{destination.name}路线总览</h1>
          <p>{plan.days.length} 天 · {pins.length} 个地图点位</p>
        </div>
        <div className="itinerary-print-date">地图小猫为你整理</div>
      </header>
      <div className="itinerary-print-summary">
        <span>目的地<strong>{destination.name}</strong></span>
        <span>行程天数<strong>{plan.days.length} 天</strong></span>
        <span>可定位地点<strong>{pins.length} 个</strong></span>
      </div>
      {plan.days.map((day, dayIndex) => {
        const locations = getItems(day).filter(item => !item.isTransport && item.type !== 'transport')
        return (
          <section className="itinerary-print-day" key={day.id || dayIndex}>
            <div className="itinerary-print-day-heading">
              <div className="itinerary-print-day-number">DAY {dayIndex + 1}</div>
              <div><h2>第 {dayIndex + 1} 天路线</h2><p>{day.date || '日期待定'} · {locations.length} 个地点</p></div>
            </div>
            <MapRouteGraphic locations={locations} dayIndex={dayIndex} />
            <div className="map-print-legend">
              {locations.slice(0, 10).map((item, index) => (
                <span key={item.id || index}><b>{index + 1}</b>{item.time || '待定'} · {item.name || '未命名地点'}</span>
              ))}
            </div>
          </section>
        )
      })}
      <footer className="itinerary-print-footer">Tripzzle · 地图小猫陪你把路线走清楚</footer>
    </article>
  )
}

function MapRouteGraphic({ locations, dayIndex }) {
  const points = locations
    .filter(item => item.lat && item.lng && !Number.isNaN(Number(item.lat)) && !Number.isNaN(Number(item.lng)))
    .slice(0, 10)
  if (!points.length) return <div className="map-print-no-map">当天没有可定位的地图点位</div>

  const latitudes = points.map(item => Number(item.lat))
  const longitudes = points.map(item => Number(item.lng))
  const minLat = Math.min(...latitudes)
  const maxLat = Math.max(...latitudes)
  const minLng = Math.min(...longitudes)
  const maxLng = Math.max(...longitudes)
  const latRange = maxLat - minLat || 0.02
  const lngRange = maxLng - minLng || 0.02
  const plotted = points.map((item, index) => ({
    ...item,
    index,
    x: 90 + ((Number(item.lng) - minLng) / lngRange) * 720,
    y: 500 - ((Number(item.lat) - minLat) / latRange) * 400,
  }))
  const polyline = plotted.map(point => `${point.x},${point.y}`).join(' ')

  return (
    <div className="map-print-map-frame">
      <svg viewBox="0 0 900 600" role="img" aria-label={`第 ${dayIndex + 1} 天地图路线`}>
        <defs>
          <pattern id={`map-grid-${dayIndex}`} width="72" height="72" patternUnits="userSpaceOnUse">
            <path d="M 72 0 L 0 0 0 72" fill="none" stroke="#dce9e2" strokeWidth="1" />
          </pattern>
          <filter id={`route-shadow-${dayIndex}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#315e49" floodOpacity="0.2" />
          </filter>
        </defs>
        <rect width="900" height="600" fill="#f4f8f5" />
        <rect width="900" height="600" fill={`url(#map-grid-${dayIndex})`} />
        <path d="M80 170 C210 90 325 230 450 150 S700 100 840 190" fill="none" stroke="#d8e8ef" strokeWidth="34" opacity="0.9" />
        <path d="M130 550 C240 430 380 510 510 410 S720 360 850 250" fill="none" stroke="#e8dfca" strokeWidth="16" opacity="0.75" />
        {plotted.length > 1 && (
          <polyline points={polyline} fill="none" stroke="#4f8a70" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="16 10" filter={`url(#route-shadow-${dayIndex})`} />
        )}
        {plotted.map(point => (
          <g key={point.id || point.index} transform={`translate(${point.x} ${point.y})`}>
            <circle r="24" fill="#d97945" stroke="#ffffff" strokeWidth="6" filter={`url(#route-shadow-${dayIndex})`} />
            <text y="7" textAnchor="middle" fill="#ffffff" fontSize="20" fontWeight="700">{point.index + 1}</text>
            <rect x="-72" y="32" width="144" height="34" rx="17" fill="#ffffff" stroke="#dce7e1" />
            <text y="54" textAnchor="middle" fill="#334b40" fontSize="15" fontWeight="600">{String(point.name || '未命名地点').slice(0, 9)}</text>
          </g>
        ))}
        <g transform="translate(838 54)">
          <path d="M0 24 L12 0 L24 24 L12 19 Z" fill="#5f8f79" />
          <text x="12" y="43" textAnchor="middle" fill="#5c7167" fontSize="13" fontWeight="700">北</text>
        </g>
      </svg>
    </div>
  )
}
