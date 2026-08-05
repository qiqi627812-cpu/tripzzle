import { MapPin, Navigation, Locate, Map as MapIcon, ZoomIn, ZoomOut, Settings, ExternalLink, Info, UtensilsCrossed, ShoppingBag, Hotel, Landmark, Navigation as NavIcon, Copy, XCircle, Star } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { buildMapLinks, openMapLink } from '../utils/mapLinks'

const AMAP_KEY = '942f298093937afa211f61802dbb9e87'

const typeColors = {
  attraction: { bg: '#0D9488', border: '#0D9488', label: '景点' },
  food: { bg: '#EA6A33', border: '#EA6A33', label: '餐食' },
  shopping: { bg: '#A855F7', border: '#7C3AED', label: '购物' },
  accommodation: { bg: '#3B82F6', border: '#2563EB', label: '酒店' },
  custom: { bg: '#EA6A33', border: '#EA6A33', label: '自定义' },
}

const typeIcons = {
  attraction: Landmark,
  food: UtensilsCrossed,
  shopping: ShoppingBag,
  accommodation: Hotel,
  custom: Star,
}

function MockMap({ places, destination }) {
  const positions = [
    { top: '65%', left: '15%' },
    { top: '50%', left: '38%' },
    { top: '35%', left: '62%' },
    { top: '25%', left: '85%' },
    { top: '60%', left: '70%' },
    { top: '80%', left: '50%' },
    { top: '45%', left: '20%' },
    { top: '70%', left: '85%' },
  ]

  return (
    <div className="relative aspect-[16/10] bg-gradient-to-br from-trip-bg via-trip-cloud to-trip-mint-pale/10 overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" viewBox="0 0 400 250">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(13,148,136,0.15)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <path d="M 50 200 Q 100 150 150 170 T 250 100 T 350 80"
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="3"
                strokeDasharray="8 4"
                strokeLinecap="round">
            <animate attributeName="stroke-dashoffset" from="24" to="0" dur="1.5s" repeatCount="indefinite" />
          </path>
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2DD4BF" />
              <stop offset="100%" stopColor="#FB923C" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {places.map((place, idx) => {
        const pos = positions[idx % positions.length]
        const color = typeColors[place.type] || typeColors.attraction
        const Icon = typeIcons[place.type] || MapPin
        return (
          <div
            key={place.id}
            className="absolute -translate-x-1/2 -translate-y-full group cursor-pointer z-10"
            style={{ top: pos.top, left: pos.left }}
          >
            <div className="relative">
              <div className={`w-8 h-8 rounded-full ${color.bg} border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold animate-pulse`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 rounded-xl bg-trip-ink text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-lg">
                {place.name}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-trip-ink rotate-45" />
              </div>
            </div>
          </div>
        )
      })}

      <div className="absolute bottom-4 left-4 px-4 py-2.5 rounded-xl bg-white/90 backdrop-blur-md shadow-sm border border-white/50">
        <div className="flex items-center gap-2 text-sm">
          <Navigation className="w-4 h-4 text-trip-mint" />
          <span className="font-bold text-trip-ink">{destination?.name}</span>
        </div>
      </div>

      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5" />
        示意图 · 配置高德地图 Key 后显示真实地图
      </div>

      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button className="w-10 h-10 rounded-xl glass flex items-center justify-center text-trip-slate">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button className="w-10 h-10 rounded-xl glass flex items-center justify-center text-trip-slate">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button className="w-10 h-10 rounded-xl glass flex items-center justify-center text-trip-slate">
          <Locate className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function AMapComponent({ places, destination, activeDay }) {
  const mapRef = useRef(null)
  const mapContainerRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    if (!AMAP_KEY) {
      setMapError(true)
      return
    }

    if (window.AMap) {
      setMapLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}`
    script.async = true
    script.onload = () => setMapLoaded(true)
    script.onerror = () => setMapError(true)
    document.head.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || !window.AMap) return

    if (!mapRef.current) {
      mapRef.current = new window.AMap.Map(mapContainerRef.current, {
        zoom: 12,
        center: [destination?.lon || 116.4074, destination?.lat || 39.9042],
        mapStyle: 'amap://styles/whitesmoke',
      })
    } else {
      mapRef.current.setCenter([destination?.lon || 116.4074, destination?.lat || 39.9042])
    }

    const map = mapRef.current

    const path = places
      .filter(item => item.lat && item.lng)
      .map(item => [item.lng, item.lat])

    const markers = places
      .filter(item => item.lat && item.lng)
      .map((item, idx) => {
        const color = typeColors[item.type] || typeColors.attraction
        const marker = new window.AMap.Marker({
          position: [item.lng, item.lat],
          title: item.name,
          label: {
            content: `<div style="padding:4px 8px;background:${color.bg};color:white;border-radius:12px;font-size:12px;font-weight:bold;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.15)">${idx + 1}</div>`,
            direction: 'top',
          },
        })
        marker.setMap(map)
        return marker
      })

    let polyline = null
    if (path.length >= 2) {
      polyline = new window.AMap.Polyline({
        path,
        strokeColor: '#0D9488',
        strokeWeight: 4,
        strokeOpacity: 0.8,
        strokeStyle: 'dashed',
        strokeDasharray: [8, 6],
        lineJoin: 'round',
      })
      polyline.setMap(map)
    }

    const allOverlays = polyline ? [...markers, polyline] : markers
    if (allOverlays.length > 0) {
      map.setFitView(allOverlays, false, [60, 60, 60, 60])
    }

    return () => {
      markers.forEach(m => m.setMap(null))
      if (polyline) polyline.setMap(null)
    }
  }, [mapLoaded, places, destination?.id, activeDay])

  if (mapError) {
    return <MockMap places={places} destination={destination} />
  }

  return (
    <div className="relative">
      <div ref={mapContainerRef} className="aspect-[16/10] w-full rounded-xl" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-trip-cloud rounded-xl">
          <div className="text-trip-muted flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-trip-mint border-t-transparent rounded-full animate-spin" />
            地图加载中...
          </div>
        </div>
      )}
    </div>
  )
}

function NavActionSheet({ place, onClose }) {
  const links = buildMapLinks(place)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass rounded-t-2xl p-4 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-trip-ink">选择导航方式</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-trip-cloud transition-colors">
            <XCircle className="w-5 h-5 text-trip-muted" />
          </button>
        </div>
        <div className="space-y-2">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                openMapLink(link)
                onClose()
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-trip-mint-pale/50 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                link.id === 'amap' ? 'bg-trip-mint-pale text-trip-mint' :
                link.id === 'baidu' ? 'bg-trip-fog-pale text-trip-slate' :
                link.id === 'tencent' ? 'bg-trip-fog-pale text-trip-slate' :
                link.id === 'apple' ? 'bg-gray-50 text-gray-600' :
                link.id === 'google' ? 'bg-red-50 text-red-600' :
                'bg-trip-cloud text-trip-muted'
              }`}>
                {link.id === 'copy' ? <Copy className="w-5 h-5" /> : <NavIcon className="w-5 h-5" />}
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-trip-ink">{link.label}</div>
                {link.action === 'copy' && (
                  <div className="text-xs text-trip-muted">{link.address}</div>
                )}
              </div>
              <ExternalLink className="w-4 h-4 text-trip-muted" />
            </button>
          ))}
        </div>
        <div className="mt-4 h-2 bg-trip-cloud rounded-full" />
      </div>
    </div>
  )
}

export default function RealMapPanel({ destination, itinerary, activeDay, setActiveDay, preferences }) {
  if (!itinerary || itinerary.length === 0) return null

  const [navPlace, setNavPlace] = useState(null)

  const currentDay = itinerary[activeDay]
  const places = currentDay?.items?.filter((i) => !i.isTransport && (i.type === 'attraction' || i.type === 'food' || i.type === 'shopping' || i.type === 'accommodation' || i.type === 'custom')) || []
  const transports = currentDay?.items?.filter((i) => i.isTransport) || []

  const totalWalk = transports.filter(t => t.transportIcon === 'Footprints').length
  const totalTransit = transports.filter(t => t.transportIcon === 'Train' || t.transportIcon === 'Bus').length

  const formatDuration = (minutes) => {
    if (!minutes || minutes <= 0) return ''
    if (minutes < 60) return `${minutes}分钟`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}小时${m}分` : `${h}小时`
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <div className="">
          <MapIcon className="w-3 h-3" />
          地图路线
        </div>
        <h2 className="font-semibold text-lg">今日路线一目了然</h2>
        <p className="text-sm text-trip-muted">智能规划最优路线，不走回头路</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card overflow-hidden p-0 rounded-xl">
            {AMAP_KEY ? (
              <AMapComponent places={places} destination={destination} activeDay={activeDay} />
            ) : (
              <MockMap places={places} destination={destination} />
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="card p-5 rounded-xl">
            <h3 className="font-bold text-trip-ink mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-trip-mint" />
              今日路线
            </h3>
            <div className="space-y-3">
              {places.map((place, idx) => {
                const color = typeColors[place.type] || typeColors.attraction
                const Icon = typeIcons[place.type] || MapPin
                const hasCoords = place.lat && place.lng && !isNaN(place.lat) && !isNaN(place.lng)
                return (
                  <div key={place.id} className="flex items-center gap-3 group relative">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`} style={{ background: color.bg }}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-trip-ink truncate group-hover:text-trip-mint transition-colors">
                          {place.name}
                        </span>
                        <span className="tag" style={{ background: color.bg }}>
                          {color.label}
                        </span>
                      </div>
                      <div className="text-xs text-trip-muted">
                        {place.time} · {formatDuration(place.durationMinutes || place.duration)}
                      </div>
                    </div>
                    {hasCoords && (
                      <button
                        onClick={() => setNavPlace(place)}
                        className="p-1.5 rounded-lg text-trip-muted hover:text-trip-mint hover:bg-trip-mint/10 transition-colors"
                        title="导航"
                      >
                        <NavIcon className="w-4 h-4" />
                      </button>
                    )}
                    {idx < places.length - 1 && (
                      <div className="absolute -bottom-3 left-3.5 w-px h-3 bg-trip-border" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card p-5 bg-gradient-to-br from-trip-mint/5 to-trip-amber/5 rounded-xl">
            <div className="text-sm font-semibold text-trip-ink mb-2 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-trip-mint" />
              交通方式
            </div>
            <div className="text-sm text-trip-slate mb-3">
              推荐{preferences?.transport || '公共交通'}出行
            </div>
            <div className="flex gap-2 flex-wrap">
              {totalTransit > 0 && (
                <span className="tag-fog">
                  🚇 公交地铁 {totalTransit} 次
                </span>
              )}
              {totalWalk > 0 && (
                <span className="tag-fog">
                  🚶 步行 {totalWalk} 段
                </span>
              )}
              {transports.some(t => t.transportIcon === 'Car') && (
                <span className="tag-fog">
                  🚕 打车
                </span>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-trip-border/50 text-xs text-trip-muted">
              共 {places.length} 个地点 · 含 {transports.length} 段交通
            </div>
          </div>

          <div className="card p-4 rounded-xl">
            <div className="text-xs font-semibold text-trip-ink mb-2">图例</div>
            <div className="flex flex-wrap gap-3">
              {Object.entries(typeColors).map(([type, color]) => (
                <div key={type} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: color.bg }} />
                  <span className="text-xs text-trip-muted">{color.label}</span>
                </div>
              ))}
            </div>
          </div>

          {!AMAP_KEY && (
            <div className="card p-4 border-dashed border-trip-mint/30 bg-trip-mint/5 rounded-xl">
              <div className="flex items-start gap-3">
                <Settings className="w-4 h-4 text-trip-mint shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-trip-ink mb-1">接入真实高德地图</div>
                  <div className="text-xs text-trip-muted mb-2">
                    在 <code className="bg-white px-1 py-0.5 rounded">RealMapPanel.jsx</code> 顶部配置你的高德地图 Key
                  </div>
                  <a
                    href="https://lbs.amap.com/api/javascript-api-v2/guide/abc/prepare"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-trip-mint font-semibold flex items-center gap-1 hover:underline"
                  >
                    申请 Key 教程
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {navPlace && (
        <NavActionSheet place={navPlace} onClose={() => setNavPlace(null)} />
      )}
    </div>
  )
}
