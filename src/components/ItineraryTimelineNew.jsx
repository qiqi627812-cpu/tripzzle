import { useState, useMemo, useEffect } from 'react'
import { Clock, MapPin, Lightbulb, UtensilsCrossed, Landmark, ShoppingBag, Hotel, Calendar, Train, Bus, Car, Footprints, Navigation, Plane, TrainFront, ChevronDown, ChevronUp, Edit3, Check, X, Heart, Map as MapIcon, Coffee, Camera, Sandwich, Backpack, ExternalLink, Copy, XCircle } from 'lucide-react'
import SafeImage from './SafeImage'
import { isFavorited, toggleFavorite } from '../services/favoriteService'
import { buildMapLinks, openMapLink } from '../utils/mapLinks'

const typeIcons = {
  attraction: Landmark,
  food: UtensilsCrossed,
  shopping: ShoppingBag,
  accommodation: Hotel,
  transport: Navigation,
  flight: Plane,
  train: TrainFront,
}

const typeColors = {
  attraction: {
    badge: 'bg-trip-mint/15 text-trip-mint border-trip-mint/30',
    dot: 'bg-trip-mint',
  },
  food: {
    badge: 'bg-trip-amber/15 text-trip-amber border-trip-amber/30',
    dot: 'bg-trip-amber',
  },
  shopping: {
    badge: 'bg-purple-100 text-purple-600 border-purple-200',
    dot: 'bg-purple-500',
  },
  accommodation: {
    badge: 'bg-blue-100 text-blue-600 border-blue-200',
    dot: 'bg-blue-500',
  },
  transport: {
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  },
  flight: {
    badge: 'bg-sky-100 text-sky-700 border-sky-200',
    dot: 'bg-sky-500',
  },
  train: {
    badge: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
  },
}

const transportIcons = {
  walk: Footprints,
  subway: Train,
  bus: Bus,
  car: Car,
  flight: Plane,
  train: TrainFront,
  taxi: Car,
}

const mapIcons = {
  amap: Navigation,
  baidu: MapIcon,
  tencent: MapIcon,
  apple: MapIcon,
  google: MapIcon,
  copy: Copy,
}

function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return ''
  if (minutes < 60) return `${minutes}分钟`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}小时${m}分` : `${h}小时`
}

function getDayItems(itinerary, dayIndex) {
  if (!itinerary || !itinerary[dayIndex]) return []
  return Array.isArray(itinerary[dayIndex]) ? itinerary[dayIndex] : (itinerary[dayIndex].items || [])
}

function getDayDate(itinerary, dayIndex) {
  const day = itinerary[dayIndex]
  if (!day) return ''
  if (day.date) return day.date
  const today = new Date()
  const d = new Date(today.getTime() + dayIndex * 24 * 60 * 60 * 1000)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function getDayTheme(itinerary, dayIndex) {
  const day = itinerary[dayIndex]
  if (!day) return ''
  return day.theme || ''
}

function getDayHighlights(itinerary, dayIndex) {
  const day = itinerary[dayIndex]
  if (!day) return []
  return day.highlights || []
}

function groupByDay(itinerary) {
  if (!itinerary) return []
  return itinerary.map((day, idx) => {
    const items = getDayItems(itinerary, idx)
    return {
      dayIndex: idx,
      date: getDayDate(itinerary, idx),
      theme: getDayTheme(itinerary, idx),
      highlights: getDayHighlights(itinerary, idx),
      items,
    }
  })
}

function NavActionSheet({ item, onClose }) {
  const links = buildMapLinks(item)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-t-2xl shadow-2xl p-4 animate-slide-up">
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
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-trip-cloud/50 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                link.id === 'amap' ? 'bg-trip-mint/10 text-trip-mint' :
                link.id === 'baidu' ? 'bg-blue-50 text-blue-600' :
                link.id === 'tencent' ? 'bg-green-50 text-green-600' :
                link.id === 'apple' ? 'bg-gray-50 text-gray-600' :
                link.id === 'google' ? 'bg-red-50 text-red-600' :
                'bg-trip-cloud text-trip-muted'
              }`}>
                {link.id === 'copy' ? <Copy className="w-5 h-5" /> : <Navigation className="w-5 h-5" />}
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

export default function ItineraryTimelineNew({ itinerary, onUpdateItem, onRemoveItem }) {
  const days = useMemo(() => groupByDay(itinerary), [itinerary])
  const [expandedDays, setExpandedDays] = useState(new Set())
  const [navSheetItem, setNavSheetItem] = useState(null)

  useEffect(() => {
    const initial = new Set()
    days.forEach((_, idx) => initial.add(idx))
    setExpandedDays(initial)
  }, [days])

  if (!itinerary || days.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-trip-border/30 p-12 text-center">
        <MapIcon className="w-12 h-12 mx-auto mb-3 text-trip-muted opacity-30" />
        <p className="text-trip-muted">暂无行程数据</p>
      </div>
    )
  }

  const toggleDay = (idx) => {
    setExpandedDays(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  return (
    <div className="space-y-4">
      {days.map((day) => {
        const isExpanded = expandedDays.has(day.dayIndex)
        const attractionCount = day.items.filter(i => i.type === 'attraction' && !i.isTransport).length
        const mealCount = day.items.filter(i => i.type === 'food' && !i.isTransport).length
        const transportCount = day.items.filter(i => i.isTransport || i.type === 'transport').length
        const shoppingCount = day.items.filter(i => i.type === 'shopping').length

        return (
          <div
            key={day.dayIndex}
            className="bg-white rounded-xl shadow-sm border border-trip-border/30 overflow-hidden"
          >
            <button
              onClick={() => toggleDay(day.dayIndex)}
              className="w-full flex items-center gap-3 p-4 hover:bg-trip-cloud/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-trip-amber to-trip-amber text-white flex items-center justify-center font-bold text-sm shrink-0">
                第{day.dayIndex + 1}天
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-trip-ink">{day.date}</div>
                {day.theme && (
                  <div className="text-sm text-trip-mint mt-0.5">{day.theme}</div>
                )}
                <div className="flex items-center gap-3 text-xs text-trip-muted mt-1">
                  {attractionCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Landmark className="w-3 h-3" />
                      {attractionCount}景点
                    </span>
                  )}
                  {shoppingCount > 0 && (
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3" />
                      {shoppingCount}购物
                    </span>
                  )}
                  {mealCount > 0 && (
                    <span className="flex items-center gap-1">
                      <UtensilsCrossed className="w-3 h-3" />
                      {mealCount}餐
                    </span>
                  )}
                  {transportCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      {transportCount}次交通
                    </span>
                  )}
                </div>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-trip-muted shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-trip-muted shrink-0" />
              )}
            </button>

            {isExpanded && (
              <div className="border-t border-trip-border/30">
                {day.highlights && day.highlights.length > 0 && (
                  <div className="px-4 py-3 bg-trip-cloud/30 border-b border-trip-border/30">
                    <div className="flex flex-wrap gap-2">
                      {day.highlights.map((highlight, idx) => (
                        <span key={idx} className="text-xs px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="p-4 space-y-3">
                  {day.items.length === 0 ? (
                    <p className="text-center text-trip-muted text-sm py-6">这一天还没有安排</p>
                  ) : (
                    day.items.map((item, idx) => (
                      <DayItem
                        key={item.id || idx}
                        item={item}
                        dayIndex={day.dayIndex}
                        itemIndex={idx}
                        onUpdate={onUpdateItem}
                        onRemove={onRemoveItem}
                        onShowNav={(item) => setNavSheetItem(item)}
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
      {navSheetItem && (
        <NavActionSheet item={navSheetItem} onClose={() => setNavSheetItem(null)} />
      )}
    </div>
  )
}

function DayItem({ item, dayIndex, itemIndex, onUpdate, onRemove, onShowNav }) {
  const [editingDuration, setEditingDuration] = useState(false)
  const [tempDuration, setTempDuration] = useState(item.durationMinutes || 60)
  const isTransport = item.isTransport || item.type === 'transport' || item.type === 'flight' || item.type === 'train'
  const isQuickMeal = item.mealSubtype === 'quickMeal'
  const Icon = isQuickMeal ? Backpack : (typeIcons[item.type] || Landmark)
  const colors = isQuickMeal
    ? { badge: 'bg-trip-mint/15 text-trip-mint border-trip-mint/30', dot: 'bg-trip-mint' }
    : (typeColors[item.type] || typeColors.attraction)
  const [favorited, setFavorited] = useState(isFavorited(item.id))

  const handleFavorite = (e) => {
    e.stopPropagation()
    const newState = toggleFavorite({
      id: item.id,
      name: item.name,
      description: item.description || '',
      type: item.type,
      typeLabel: item.typeLabel || '景点',
      image: item.image || '',
      location: item.location || '',
      tags: item.tags || [],
    })
    setFavorited(newState)
  }

  const saveDuration = () => {
    if (onUpdate && tempDuration > 0) {
      onUpdate(dayIndex, itemIndex, { ...item, duration: tempDuration, durationMinutes: tempDuration })
    }
    setEditingDuration(false)
  }

  const hasCoords = item.lat && item.lng && !isNaN(item.lat) && !isNaN(item.lng)

  if (isTransport) {
    const iconKey = item.transportType || item.type
    const TransportIcon = transportIcons[iconKey] || Navigation
    return (
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-trip-cloud/50 border border-trip-border/30">
        <div className={`w-8 h-8 rounded-lg ${colors.dot} flex items-center justify-center shrink-0`}>
          <TransportIcon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <span className="font-semibold text-trip-mint shrink-0">{item.time}</span>
            <span className="text-trip-muted">·</span>
            <span className="font-medium text-trip-ink">{item.name}</span>
          </div>
          {item.description && (
            <div className="text-xs text-trip-slate mt-0.5">{item.description}</div>
          )}
          {item.route && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-trip-mint/15 text-trip-mint border border-trip-mint/30 font-medium">
                {item.route}
              </span>
            </div>
          )}
        </div>
        {item.duration && (
          <span className="text-xs text-trip-muted shrink-0">约 {formatDuration(item.durationMinutes || item.duration)}</span>
        )}
      </div>
    )
  }

  return (
    <div className={`p-3 rounded-lg border ${colors.badge} bg-white hover:shadow-sm transition-shadow`}>
      <div className="flex items-start gap-3">
        {item.image && (
          <SafeImage
            src={item.image}
            alt={item.name}
            className="w-16 h-16 rounded-lg object-cover shrink-0"
            fallbackText={item.name}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-trip-mint text-sm">{item.time}</span>
                <Icon className={`w-3.5 h-3.5 ${colors.dot.replace('bg-', 'text-')}`} />
                <h4 className="font-semibold text-trip-ink truncate">{item.name}</h4>
              </div>
              {item.location && (
                <div className="flex items-center gap-1 text-xs text-trip-muted mt-0.5">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{item.location}</span>
                </div>
              )}
              {item.description && (
                <p className="text-xs text-trip-slate mt-1 line-clamp-2">{item.description}</p>
              )}
              {item.mealSubtype === 'quickMeal' && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <Backpack className="w-3 h-3 text-trip-mint" />
                  <span className="text-xs text-trip-mint font-medium">景区附近简餐或自带干粮</span>
                </div>
              )}
              {item.price && (
                <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-trip-cloud text-trip-muted">
                  {item.price}
                </span>
              )}
              {item.cuisine && (
                <span className="inline-block mt-1 ml-1 text-xs px-2 py-0.5 rounded-full bg-trip-cloud text-trip-muted">
                  {item.cuisine}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {hasCoords && (
                <button
                  onClick={() => onShowNav(item)}
                  className="p-1.5 rounded-lg text-trip-muted hover:text-trip-mint hover:bg-trip-mint/10 transition-colors"
                  title="导航"
                >
                  <Navigation className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={handleFavorite}
                className={`p-1.5 rounded-lg transition-colors ${
                  favorited
                    ? 'text-trip-amber bg-trip-amber/10'
                    : 'text-trip-muted hover:text-trip-amber hover:bg-trip-amber/10'
                }`}
              >
                <Heart className="w-3.5 h-3.5" fill={favorited ? 'currentColor' : 'none'} />
              </button>
              {onRemove && (
                <button
                  onClick={() => onRemove(dayIndex, itemIndex)}
                  className="p-1.5 rounded-lg text-trip-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {(() => {
            const rawTips = item.tips
            let tipsArray = []
            if (typeof rawTips === 'string') {
              tipsArray = [rawTips]
            } else if (Array.isArray(rawTips)) {
              tipsArray = rawTips.filter(t => typeof t === 'string')
            }
            return tipsArray.length > 0 && (
              <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-100">
                <div className="flex items-start gap-1.5">
                  <Lightbulb className="w-3 h-3 text-amber-600 mt-0.5 shrink-0" />
                  <div className="text-xs text-amber-800">
                    {tipsArray.slice(0, 2).map((tip, i) => (
                      <div key={i}>{tip}</div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })()}

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-trip-border/30">
            {editingDuration ? (
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-trip-muted" />
                <input
                  type="number"
                  value={tempDuration}
                  onChange={(e) => setTempDuration(parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-xs rounded-lg border border-trip-border focus:border-trip-mint outline-none"
                  min="10"
                  step="15"
                />
                <span className="text-xs text-trip-muted">分钟</span>
                <button
                  onClick={saveDuration}
                  className="p-1 rounded bg-trip-mint text-white"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() => {
                    setTempDuration(item.durationMinutes || 60)
                    setEditingDuration(false)
                  }}
                  className="p-1 rounded bg-trip-cloud text-trip-muted"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingDuration(true)}
                className="flex items-center gap-1.5 text-xs text-trip-muted hover:text-trip-mint transition-colors"
              >
                <Clock className="w-3 h-3" />
                <span>停留 {formatDuration(item.durationMinutes || item.duration || 60)}</span>
                <Edit3 className="w-2.5 h-2.5" />
              </button>
            )}
            {item.needsReservation && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">
                需预约
              </span>
            )}
            {item.weatherSensitive && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                天气敏感
              </span>
            )}
            {item.crowdRisk === 'high' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100">
                热门
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
