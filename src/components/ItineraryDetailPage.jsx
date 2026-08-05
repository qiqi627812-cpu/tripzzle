import { useState, useMemo, useEffect } from 'react'
import {
  Clock, MapPin, UtensilsCrossed, Landmark, ShoppingBag, Hotel,
  Calendar, Train, Bus, Car, Footprints, Navigation, Plane, TrainFront,
  ChevronDown, Edit3, Check, X, Plus, Trash2,
  Map as MapIcon, Save, GripVertical, ArrowRight,
  Copy, XCircle, ExternalLink, AlertCircle, CloudSun, MapPinned, Heart, FileDown
} from 'lucide-react'
import SafeImage from './SafeImage'
import TransportEditor from './TransportEditor'
import { getAllDestinations } from '../data/destinations'
import { buildMapLinks, openMapLink } from '../utils/mapLinks'
import { buildPinsFromItinerary } from '../utils/mapPins'
import FloatingMap from './FloatingMap'
import PlacePicker from './PlacePicker'
import AnimalMascot from './AnimalMascot'

// force recompile: place picker integration

const typeIcons = {
  attraction: Landmark,
  food: UtensilsCrossed,
  shopping: ShoppingBag,
  accommodation: Hotel,
  transport: Navigation,
  flight: Plane,
  train: TrainFront,
}

const typeLabels = {
  attraction: '景点',
  food: '美食',
  shopping: '购物',
  accommodation: '住宿',
  transport: '交通',
  flight: '飞机',
  train: '火车',
}

const typeColors = {
  attraction: { badge: 'bg-trip-mint-pale text-trip-mint', dot: 'bg-trip-mint', bg: 'bg-trip-mint-pale/30' },
  food: { badge: 'bg-trip-coral-pale text-trip-coral', dot: 'bg-trip-coral', bg: 'bg-trip-coral-pale/30' },
  shopping: { badge: 'bg-trip-olive-pale text-trip-olive', dot: 'bg-trip-olive', bg: 'bg-trip-olive-pale/30' },
  accommodation: { badge: 'bg-trip-blue-pale text-trip-blue-dark', dot: 'bg-trip-blue', bg: 'bg-trip-blue-pale/30' },
  transport: { badge: 'bg-trip-fog-pale text-trip-fog-dark', dot: 'bg-trip-fog', bg: 'bg-trip-cloud' },
  flight: { badge: 'bg-trip-fog-pale text-trip-fog-dark', dot: 'bg-trip-fog', bg: 'bg-trip-fog-pale/30' },
  train: { badge: 'bg-trip-fog-pale text-trip-fog-dark', dot: 'bg-trip-fog', bg: 'bg-trip-fog-pale/30' },
}

const areaLabels = {
  'center': '市中心',
  'north': '北部',
  'south': '南部',
  'east': '东部',
  'west': '西部',
  'northeast': '东北部',
  'northwest': '西北部',
  'southeast': '东南部',
  'southwest': '西南部',
  'suburb': '远郊区',
  'puxi': '浦西',
  'pudong': '浦东',
  'yuzhong': '渝中',
  'shapingba': '沙坪坝',
  'nanan': '南岸',
  'jiangbei': '江北',
}

const transportIcons = {
  walk: Footprints, subway: Train, bus: Bus, car: Car,
  flight: Plane, train: TrainFront, taxi: Car,
}

function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return ''
  if (minutes < 60) return `${minutes}分钟`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}小时${m}分` : `${h}小时`
}

function normalizeItineraryPayload(payload) {
  if (!payload) {
    return { days: [], warnings: [], removed: [], alternatives: [], validation: null, stats: null }
  }

  if (Array.isArray(payload)) {
    return {
      days: payload,
      warnings: [],
      removed: [],
      alternatives: [],
      validation: null,
      stats: null,
    }
  }

  if (payload.days && Array.isArray(payload.days)) {
    return {
      days: payload.days,
      warnings: payload.warnings || [],
      removed: payload.removed || [],
      alternatives: payload.alternatives || [],
      validation: payload.validation || null,
      stats: payload.stats || null,
    }
  }

  return { days: [], warnings: [], removed: [], alternatives: [], validation: null, stats: null }
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

function groupByDay(itinerary) {
  if (!itinerary) return []
  return itinerary.map((day, idx) => ({
    dayIndex: idx,
    date: getDayDate(itinerary, idx),
    items: getDayItems(itinerary, idx),
  }))
}

const defaultTemplate = [
  {
    date: '2026-07-15',
    items: [
      { id: 't1-a1', name: '早餐', type: 'food', time: '08:30', durationMinutes: 45, location: '酒店附近', typeLabel: '早餐' },
      { id: 't1-a2', name: '知名景点', type: 'attraction', time: '09:30', durationMinutes: 180, location: '市中心', description: '这里是城市最著名的景点，风景优美，历史悠久。', tips: '建议提前网上购票，避免排队。', typeLabel: '景点' },
      { id: 't1-a3', name: '午餐', type: 'food', time: '12:30', durationMinutes: 60, location: '景点附近', typeLabel: '午餐' },
      { id: 't1-a4', name: '文化体验', type: 'attraction', time: '14:00', durationMinutes: 120, location: '老城区', description: '体验当地传统文化，感受城市魅力。', tips: '周一闭馆，注意开放时间。', typeLabel: '文化' },
      { id: 't1-a5', name: '晚餐', type: 'food', time: '18:00', durationMinutes: 90, location: '美食街', typeLabel: '晚餐' },
    ],
  },
  {
    date: '2026-07-16',
    items: [
      { id: 't2-a1', name: '早餐', type: 'food', time: '08:30', durationMinutes: 45, location: '酒店', typeLabel: '早餐' },
      { id: 't2-a2', name: '公园漫步', type: 'attraction', time: '09:30', durationMinutes: 150, location: '城市公园', description: '城市绿肺，空气清新，适合散步休闲。', typeLabel: '公园' },
      { id: 't2-a3', name: '午餐', type: 'food', time: '12:00', durationMinutes: 60, location: '公园附近', typeLabel: '午餐' },
      { id: 't2-a4', name: '购物', type: 'shopping', time: '13:30', durationMinutes: 180, location: '商业街', description: '购买当地特产和纪念品。', typeLabel: '购物' },
      { id: 't2-a5', name: '晚餐', type: 'food', time: '17:30', durationMinutes: 90, location: '特色餐厅', typeLabel: '晚餐' },
    ],
  },
  {
    date: '2026-07-17',
    items: [
      { id: 't3-a1', name: '早餐', type: 'food', time: '08:30', durationMinutes: 45, location: '酒店', typeLabel: '早餐' },
      { id: 't3-a2', name: '自由活动', type: 'attraction', time: '09:30', durationMinutes: 120, location: '酒店附近', description: '最后的自由活动时间，可以再逛逛周边。', typeLabel: '自由活动' },
      { id: 't3-a3', name: '午餐', type: 'food', time: '11:30', durationMinutes: 60, location: '机场附近', typeLabel: '午餐' },
      { id: 't3-a4', name: '返程', type: 'flight', time: '13:30', durationMinutes: 180, location: '机场', description: '前往机场，结束愉快的旅程。', typeLabel: '返程' },
    ],
  },
]

export default function ItineraryDetailPage({ itinerary, destinationId, destinationData, preferences, onBack, onPlaceSearch, onOpenMap }) {
  const [localPlan, setLocalPlan] = useState(() => {
    const normalizedProps = normalizeItineraryPayload(itinerary)
    if (normalizedProps.days.length > 0) {
      return normalizedProps
    }

    const saved = localStorage.getItem('tripzzle_saved_itinerary')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return normalizeItineraryPayload(parsed)
      } catch (e) {}
    }

    return { days: defaultTemplate, warnings: [], removed: [], alternatives: [], validation: null, stats: null }
  })
  const [activeDay, setActiveDay] = useState(0)
  const [editingItem, setEditingItem] = useState(null)
  const [editingTransport, setEditingTransport] = useState(null) // { dayIndex, itemIndex, isNew }
  const [editingDayMeta, setEditingDayMeta] = useState(false)
  const [navSheetItem, setNavSheetItem] = useState(null)
  const [dragIndex, setDragIndex] = useState(null)
  const [mapMode, setMapMode] = useState('all')
  const [showMap, setShowMap] = useState(false)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const [saved, setSaved] = useState(false)
  const [showSaveToast, setShowSaveToast] = useState(false)

  const localItinerary = localPlan.days

  useEffect(() => {
    const normalized = normalizeItineraryPayload(itinerary)
    if (normalized.days.length > 0) {
      console.log('ItineraryDetailPage: Received new itinerary from props, updating localPlan:', normalized.days.length, 'days')
      setLocalPlan(normalized)
      setActiveDay(0)
    } else {
      console.log('ItineraryDetailPage: Props itinerary is empty:', JSON.stringify(itinerary))
    }
  }, [itinerary])

  const destination = useMemo(
    () => destinationData || getAllDestinations().find(d => d.id === destinationId),
    [destinationId, destinationData],
  )
  const days = useMemo(() => groupByDay(localItinerary), [localItinerary])

  const mapPins = useMemo(() => {
    const isToday = mapMode === 'today'
    const isSpecificDay = mapMode.startsWith('day-')
    const targetDayIndex = isToday ? activeDay : (isSpecificDay ? parseInt(mapMode.split('-')[1]) - 1 : -1)

    const pins = buildPinsFromItinerary(localItinerary, {
      onlyCurrentDay: isToday || isSpecificDay,
      currentDayIndex: targetDayIndex,
    })

    if (pins.length === 0) {
      console.warn('Map: No pins found. Checking itinerary data...')
      console.log('Map: localItinerary structure:', JSON.stringify(localItinerary.slice(0, 2).map(day => ({
        dayIndex: localItinerary.indexOf(day),
        itemCount: Array.isArray(day) ? day.length : (day.items?.length || 0),
        sampleItems: Array.isArray(day) ? day.slice(0, 2) : (day.items?.slice(0, 2) || []),
      })), null, 2))
    }

    return pins
  }, [localItinerary, mapMode, activeDay])

  // 切换行程后重置 activeDay
  useEffect(() => {
    if (activeDay >= days.length) setActiveDay(Math.max(0, days.length - 1))
  }, [days.length])

  // 切换天数后关闭当天摘要编辑
  useEffect(() => {
    setEditingDayMeta(false)
  }, [activeDay])

  const currentDay = days[activeDay]

  const updateItem = (dayIndex, itemIndex, updatedItem) => {
    setLocalPlan(prev => {
      const nextDays = [...prev.days]
      const day = [...(Array.isArray(nextDays[dayIndex]) ? nextDays[dayIndex] : (nextDays[dayIndex].items || []))]
      day[itemIndex] = { ...day[itemIndex], ...updatedItem }

      let currentMinutes = getStartMinutesFromItem(day[itemIndex]) + (day[itemIndex].durationMinutes || 60)
      for (let i = itemIndex + 1; i < day.length; i++) {
        const it = day[i]
        if (it.isTransport) continue
        const h = Math.floor(currentMinutes / 60)
        const m = currentMinutes % 60
        it.time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
        currentMinutes += (it.transportTime || 0) + (it.durationMinutes || 60)
      }

      if (Array.isArray(nextDays[dayIndex])) { nextDays[dayIndex] = day }
      else { nextDays[dayIndex] = { ...nextDays[dayIndex], items: day } }
      return { ...prev, days: nextDays }
    })
    setEditingItem(null)
  }

  const removeItem = (dayIndex, itemIndex) => {
    setLocalPlan(prev => {
      const nextDays = [...prev.days]
      const day = (Array.isArray(nextDays[dayIndex]) ? nextDays[dayIndex] : (nextDays[dayIndex].items || [])).filter((_, i) => i !== itemIndex)
      if (Array.isArray(nextDays[dayIndex])) { nextDays[dayIndex] = day }
      else { nextDays[dayIndex] = { ...nextDays[dayIndex], items: day } }
      return { ...prev, days: nextDays }
    })
  }

  // 更新交通段
  const updateTransport = (dayIndex, itemIndex, transportData) => {
    setLocalPlan(prev => {
      const nextDays = [...prev.days]
      const day = [...(Array.isArray(nextDays[dayIndex]) ? nextDays[dayIndex] : (nextDays[dayIndex].items || []))]
      day[itemIndex] = { ...day[itemIndex], ...transportData }
      if (Array.isArray(nextDays[dayIndex])) { nextDays[dayIndex] = day }
      else { nextDays[dayIndex] = { ...nextDays[dayIndex], items: day } }
      return { ...prev, days: nextDays }
    })
    setEditingTransport(null)
  }

  // 在指定位置后插入交通段
  const insertTransport = (dayIndex, afterIndex, transportData) => {
    setLocalPlan(prev => {
      const nextDays = [...prev.days]
      const day = [...(Array.isArray(nextDays[dayIndex]) ? nextDays[dayIndex] : (nextDays[dayIndex].items || []))]
      const insertAt = afterIndex + 1
      const newTransport = {
        id: `transport-${Date.now()}`,
        ...transportData,
        isTransport: true,
        isCustom: true,
      }
      day.splice(insertAt, 0, newTransport)
      if (Array.isArray(nextDays[dayIndex])) { nextDays[dayIndex] = day }
      else { nextDays[dayIndex] = { ...nextDays[dayIndex], items: day } }
      return { ...prev, days: nextDays }
    })
    setEditingTransport(null)
  }

  // 删除交通段
  const deleteTransport = (dayIndex, itemIndex) => {
    removeItem(dayIndex, itemIndex)
    setEditingTransport(null)
  }

  // 处理交通编辑/新建保存
  const handleTransportSave = (data) => {
    if (!editingTransport) return
    if (editingTransport.isNew) {
      insertTransport(editingTransport.dayIndex, editingTransport.afterIndex, data)
    } else {
      updateTransport(editingTransport.dayIndex, editingTransport.itemIndex, data)
    }
  }

  // 获取新建交通时的上下文名称
  const getNewTransportContext = () => {
    if (!editingTransport?.isNew) return { prev: '', next: '' }
    const day = days[editingTransport.dayIndex]
    if (!day) return { prev: '', next: '' }
    return {
      prev: day.items[editingTransport.afterIndex]?.name || '',
      next: day.items[editingTransport.afterIndex + 1]?.name || '',
    }
  }

  const moveItem = (dayIndex, fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= (currentDay?.items.length || 0)) return
    setLocalPlan(prev => {
      const nextDays = [...prev.days]
      const day = [...(Array.isArray(nextDays[dayIndex]) ? nextDays[dayIndex] : (nextDays[dayIndex].items || []))]
      ;[day[fromIndex], day[toIndex]] = [day[toIndex], day[fromIndex]]
      if (Array.isArray(nextDays[dayIndex])) { nextDays[dayIndex] = day }
      else { nextDays[dayIndex] = { ...nextDays[dayIndex], items: day } }
      return { ...prev, days: nextDays }
    })
  }

  const handleDragStart = (idx) => { setDragIndex(idx) }
  const handleDragOver = (e, idx) => { e.preventDefault(); setDragOverIndex(idx) }
  const handleDragEnd = () => {
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      moveItem(activeDay, dragIndex, dragOverIndex)
    }
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const addItem = (dayIndex) => {
    const newItem = {
      id: `custom-${Date.now()}`,
      name: '新安排', type: 'attraction', time: '09:00',
      durationMinutes: 60, location: '', description: '', isCustom: true,
    }
    setLocalPlan(prev => {
      const nextDays = [...prev.days]
      const day = [...(Array.isArray(nextDays[dayIndex]) ? nextDays[dayIndex] : (nextDays[dayIndex].items || []))]
      day.push(newItem)
      if (Array.isArray(nextDays[dayIndex])) { nextDays[dayIndex] = day }
      else { nextDays[dayIndex] = { ...nextDays[dayIndex], items: day } }
      return { ...prev, days: nextDays }
    })
    setTimeout(() => {
      const day = days.find(d => d.dayIndex === dayIndex)
      if (day) setEditingItem({ dayIndex, itemIndex: day.items.length })
    }, 100)
  }

  const addDay = () => {
    const lastDay = localItinerary[localItinerary.length - 1]
    let nextDate = ''
    if (lastDay?.date) {
      const d = new Date(lastDay.date)
      d.setDate(d.getDate() + 1)
      nextDate = d.toISOString().split('T')[0]
    }
    setLocalPlan(prev => ({ ...prev, days: [...prev.days, { date: nextDate, items: [] }] }))
    setActiveDay(localItinerary.length)
  }

  const removeDay = (dayIndex) => {
    if (localItinerary.length <= 1) return
    setLocalPlan(prev => ({ ...prev, days: prev.days.filter((_, i) => i !== dayIndex) }))
    if (activeDay >= localItinerary.length - 1) setActiveDay(Math.max(0, localItinerary.length - 2))
  }

  const getStartMinutesFromItem = (item) => {
    if (!item.time) return 540
    const [h, m] = item.time.split(':').map(Number)
    return (h || 0) * 60 + (m || 0)
  }

  const handleUpdatePin = (pinId, patch) => {
    setLocalPlan(prev => {
      const nextDays = prev.days.map(day => {
        const items = Array.isArray(day) ? day : (day.items || [])
        const newItems = items.map(item => {
          if (item.id === pinId) {
            return { ...item, ...patch }
          }
          return item
        })
        if (Array.isArray(day)) return newItems
        return { ...day, items: newItems }
      })
      return { ...prev, days: nextDays }
    })
  }

  const handleAddPin = (place) => {
    const newItem = {
      id: `custom-${Date.now()}`,
      name: place.name,
      type: 'custom',
      typeLabel: '自定义',
      lat: place.lat,
      lng: place.lng,
      address: place.address || '',
      time: '09:00',
      durationMinutes: 30,
      isCustom: true,
    }
    setLocalPlan(prev => {
      const nextDays = [...prev.days]
      const day = nextDays[activeDay]
      const items = Array.isArray(day) ? [...day] : [...(day.items || [])]
      items.push(newItem)
      if (Array.isArray(day)) nextDays[activeDay] = items
      else nextDays[activeDay] = { ...day, items }
      return { ...prev, days: nextDays }
    })
  }

  const handleRemovePin = (pinId) => {
    setLocalPlan(prev => {
      const nextDays = prev.days.map(day => {
        const items = Array.isArray(day) ? day : (day.items || [])
        const newItems = items.filter(item => item.id !== pinId)
        if (Array.isArray(day)) return newItems
        return { ...day, items: newItems }
      })
      return { ...prev, days: nextDays }
    })
  }

  const handleSave = () => {
    localStorage.setItem('tripzzle_saved_itinerary', JSON.stringify(localPlan))
    setSaved(true)
    setShowSaveToast(true)
    setTimeout(() => setSaved(false), 2000)
    setTimeout(() => setShowSaveToast(false), 2000)
  }

  const handleExportPdf = () => {
    const previousTitle = document.title
    const destinationName = destination?.name || '旅行'
    document.title = `Tripzzle-${destinationName}-${days.length}天行程`

    const restoreTitle = () => {
      document.title = previousTitle
      window.removeEventListener('afterprint', restoreTitle)
    }

    window.addEventListener('afterprint', restoreTitle)
    window.print()
    window.setTimeout(restoreTitle, 1500)
  }

  const itinerarySummary = useMemo(() => {
    const allItems = localItinerary.flatMap(day => {
      const items = getDayItems(localItinerary, day.dayIndex || localItinerary.indexOf(day))
      return items.filter(i => !i.isTransport)
    })

    const needsReservation = allItems.filter(i => i.needsReservation).length
    const weatherSensitive = allItems.filter(i => i.weatherSensitive).length
    const remoteDays = localItinerary.filter(d => d.isRemoteDay).length

    const areas = new Set()
    localItinerary.forEach(day => {
      if (day.mainArea) areas.add(day.mainArea)
    })

    const intensity = allItems.length / localItinerary.length

    let intensityLabel = '适中'
    let intensityBadge = 'tag bg-trip-fog-pale text-trip-fog-dark'
  if (intensity < 2) { intensityLabel = '轻松'; intensityBadge = 'tag bg-trip-mint-pale text-trip-mint' }
  else if (intensity > 5) { intensityLabel = '紧凑'; intensityBadge = 'tag bg-trip-coral-pale text-trip-coral' }

    return {
      totalDays: localItinerary.length,
      totalItems: allItems.length,
      needsReservation,
      weatherSensitive,
      remoteDays,
      areas: Array.from(areas).length,
      intensityLabel,
      intensityBadge,
      transportPref: preferences?.transport || '公共交通',
    }
  }, [localItinerary, preferences])

  return (
    <div className="min-h-screen bg-trip-bg pt-20 pb-16 md:pb-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4 min-w-0">
            {onBack && (
              <button onClick={onBack} className="flex items-center gap-2 text-trip-muted hover:text-trip-ink transition-colors min-h-[44px] min-w-[44px] -ml-2 justify-center" aria-label="返回">
                <ChevronDown className="w-5 h-5 rotate-90" strokeWidth={1.75} />
              </button>
            )}
            <div className="hidden sm:flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[28px] bg-[#faeee2]/80 shadow-soft">
              <AnimalMascot role="catItinerary" size="md" decorative />
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-trip-ink font-display tracking-tight truncate">
              {destination?.name ? `${destination.name} · ` : ''}{days.length}天行程
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm min-h-[44px] rounded-xl border border-trip-border bg-trip-surface text-trip-slate hover:border-trip-mint/40 hover:text-trip-mint hover:shadow-card transition-all"
              aria-label="导出完整行程 PDF"
            >
              <FileDown className="w-[18px] h-[18px]" strokeWidth={1.75} />
              <span className="hidden sm:inline">导出 PDF</span>
            </button>
            <button
              onClick={handleSave}
              className="btn-primary flex items-center gap-2 px-3 sm:px-4 py-2 text-sm min-h-[44px]"
            >
              {saved ? <Check className="w-[18px] h-[18px]" strokeWidth={1.75} /> : <Save className="w-[18px] h-[18px]" strokeWidth={1.75} />}
              <span className="hidden sm:inline">{saved ? '已保存' : '保存'}</span>
            </button>
          </div>
        </div>

        {/* 保存成功提示 */}
        {showSaveToast && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-trip-ink text-white text-sm font-medium shadow-lg animate-slide-up">
            已保存到本地
          </div>
        )}

        {/* 行程摘要 */}
        <div className="card-flat p-3 mb-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-trip-ink font-mono tabular-nums">{days.length}天行程</span>
            <span className="text-xs text-trip-muted">·</span>
            <span className="text-xs text-trip-muted font-mono tabular-nums">{itinerarySummary.totalItems}个安排</span>

            {itinerarySummary.needsReservation > 0 && (
              <span className="tag bg-trip-rose-pale text-trip-rose">
                <AlertCircle className="w-3 h-3" strokeWidth={1.75} />
                {itinerarySummary.needsReservation}项必预约
              </span>
            )}
            {itinerarySummary.weatherSensitive > 0 && (
              <span className="tag bg-trip-fog-pale text-trip-fog-dark">
                <CloudSun className="w-3 h-3" strokeWidth={1.75} />
                {itinerarySummary.weatherSensitive}项天气敏感
              </span>
            )}
            {itinerarySummary.remoteDays > 0 && (
              <span className="tag tag-olive">
                <MapPinned className="w-3 h-3" strokeWidth={1.75} />
                {itinerarySummary.remoteDays}个远郊日
              </span>
            )}
            <span className={`${itinerarySummary.intensityBadge}`}>
              {itinerarySummary.intensityLabel}
            </span>
          </div>
        </div>

        {/* 天数选择器 */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {days.map((day, idx) => {
            const dayData = localItinerary[idx] || {}
            const isRemote = dayData.isRemoteDay
            const isActive = activeDay === idx
            return (
              <button
                key={idx}
                onClick={() => setActiveDay(idx)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-lg font-medium text-sm transition-all min-h-[44px] ${
                  isActive
                    ? 'bg-trip-mint text-white shadow-card'
                    : 'bg-trip-surface border border-trip-border text-trip-slate hover:border-trip-mint/30 hover:text-trip-ink'
                }`}
                aria-current={isActive ? 'day' : undefined}
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold font-mono tabular-nums">第{idx + 1}天</span>
                  {isRemote && <MapPinned className="w-[14px] h-[14px] opacity-70" strokeWidth={1.75} />}
                </div>
              </button>
            )
          })}
          <button
            onClick={addDay}
            className="flex-shrink-0 px-3 py-2.5 rounded-lg border border-dashed border-trip-border text-trip-muted hover:border-trip-mint hover:text-trip-mint transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="添加一天"
          >
            <Plus className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* 当天摘要 */}
        {currentDay && (() => {
          const dayData = localItinerary[activeDay] || {}
          const dayTheme = dayData.theme || dayData.title
          const dayItems = currentDay.items || []
          const needsReservation = dayItems.filter(i => i.needsReservation).length
          const weatherSensitive = dayItems.filter(i => i.weatherSensitive).length
          const isRemote = dayData.isRemoteDay

          return (dayTheme || needsReservation > 0 || weatherSensitive > 0 || isRemote || editingDayMeta) && (
            <div className="card-flat p-3 mb-3 border-l-2 border-trip-mint">
              {editingDayMeta ? (
                <DayMetaEditor
                  dayData={dayData}
                  onSave={(patch) => {
                    setLocalPlan(prev => {
                      const nextDays = [...prev.days]
                      const target = nextDays[activeDay]
                      if (Array.isArray(target)) {
                        nextDays[activeDay] = { date: '', items: target, ...patch }
                      } else {
                        nextDays[activeDay] = { ...target, ...patch }
                      }
                      return { ...prev, days: nextDays }
                    })
                    setEditingDayMeta(false)
                  }}
                  onCancel={() => setEditingDayMeta(false)}
                />
              ) : (
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    {dayTheme && (
                      <div className="text-sm font-semibold text-trip-ink mb-1">{dayTheme}</div>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {isRemote && (
                        <span className="tag tag-olive">远郊日</span>
                      )}
                      {needsReservation > 0 && (
                        <span className="tag bg-trip-rose-pale text-trip-rose">{needsReservation}项需预约</span>
                      )}
                      {weatherSensitive > 0 && (
                        <span className="tag bg-trip-fog-pale text-trip-fog-dark">{weatherSensitive}项天气敏感</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingDayMeta(true)}
                    className="p-1.5 rounded-md text-trip-muted hover:text-trip-mint hover:bg-trip-mint-pale/50 transition-colors shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center"
                    aria-label="编辑当天信息"
                  >
                    <Edit3 className="w-[14px] h-[14px]" strokeWidth={1.75} />
                  </button>
                </div>
              )}
            </div>
          )
        })()}

        {/* 当天行程内容 */}
        {currentDay && (
          <div className="space-y-2">
            {currentDay.items.length === 0 ? (
              <div className="card rounded-2xl p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-trip-muted opacity-30" strokeWidth={1.75} />
                <p className="text-trip-muted mb-4">这一天还没有安排</p>
                <button
                  onClick={() => addItem(activeDay)}
                  className="btn-primary px-6 py-2.5 min-h-[44px]"
                >
                  添加第一个安排
                </button>
              </div>
            ) : (
              currentDay.items.map((item, idx) => {
                const isTransport = item.isTransport || item.type === 'transport' || item.type === 'flight' || item.type === 'train'
                const isEditingTransport = editingTransport?.dayIndex === activeDay && editingTransport?.itemIndex === idx

                return (
                  <div key={`${activeDay}-${idx}-${item.id || 'item'}`}>
                    {isTransport ? (
                      isEditingTransport ? (
                        <TransportEditor
                          transport={item}
                          prevItemName={idx > 0 ? currentDay.items[idx - 1]?.name : ''}
                          nextItemName={idx < currentDay.items.length - 1 ? currentDay.items[idx + 1]?.name : ''}
                          onSave={handleTransportSave}
                          onCancel={() => setEditingTransport(null)}
                          onDelete={() => deleteTransport(activeDay, idx)}
                        />
                      ) : (
                        <TransportCard
                          item={item}
                          onEdit={() => setEditingTransport({ dayIndex: activeDay, itemIndex: idx })}
                          onDelete={() => removeItem(activeDay, idx)}
                        />
                      )
                    ) : (
                      <DayItemEditor
                        item={item}
                        dayIndex={activeDay}
                        itemIndex={idx}
                        isLast={idx === currentDay.items.length - 1}
                        isFirst={idx === 0}
                        onUpdate={updateItem}
                        onRemove={removeItem}
                        onMove={(from, to) => moveItem(activeDay, from, to)}
                        isEditing={editingItem?.dayIndex === activeDay && editingItem?.itemIndex === idx}
                        onStartEdit={() => setEditingItem({ dayIndex: activeDay, itemIndex: idx })}
                        onStopEdit={() => setEditingItem(null)}
                        isDragging={dragIndex === idx}
                        isDragOver={dragOverIndex === idx}
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragEnd={handleDragEnd}
                        onShowNav={(item) => setNavSheetItem(item)}
                        destinationName={destination?.name}
                      />
                    )}

                    {/* 行程间插入交通按钮（只在前一项是普通项时显示） */}
                    {idx < currentDay.items.length - 1 && !isTransport && (
                      <InsertTransportButton
                        onClick={() => {
                          const prevName = item.name
                          const nextName = currentDay.items[idx + 1]?.name
                          setEditingTransport({ dayIndex: activeDay, itemIndex: idx, isNew: true, afterIndex: idx, prevName, nextName })
                        }}
                      />
                    )}
                  </div>
                )
              })
            )}

            {currentDay.items.length > 0 && (
              <button
                onClick={() => addItem(activeDay)}
                className="w-full py-3 mt-2 rounded-xl border-2 border-dashed border-trip-border text-trip-muted hover:border-trip-mint hover:text-trip-mint transition-colors flex items-center justify-center gap-2 min-h-[44px] text-sm"
              >
                <Plus className="w-4 h-4" strokeWidth={1.75} />
                添加新安排
              </button>
            )}

            {days.length > 1 && (
              <button
                onClick={() => removeDay(activeDay)}
                className="w-full py-2.5 mt-2 rounded-xl text-sm text-trip-muted hover:text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Trash2 className="w-[14px] h-[14px]" strokeWidth={1.75} />
                删除第{activeDay + 1}天
              </button>
            )}
          </div>
        )}
      </div>

      {/* 移动端底部固定操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 glass px-4 py-2 flex items-center justify-around gap-2 z-50 md:hidden">
        <button
          onClick={() => onOpenMap ? onOpenMap() : setShowMap(true)}
          className="flex flex-col items-center gap-0.5 py-1 min-h-[44px] min-w-[44px] justify-center text-trip-mint transition-colors"
          aria-label="打开地图"
        >
          <MapIcon className="w-5 h-5" strokeWidth={1.75} />
          <span className="text-xs">地图</span>
        </button>
        {currentDay?.items?.length > 0 && (
          <button
            onClick={() => {
              const firstItemWithCoords = currentDay.items.find(i => i.lat && i.lng && !i.isTransport)
              if (firstItemWithCoords) setNavSheetItem(firstItemWithCoords)
            }}
            className="flex flex-col items-center gap-0.5 py-1 min-h-[44px] min-w-[44px] justify-center text-trip-mint transition-colors"
            aria-label="导航"
          >
            <Navigation className="w-5 h-5" strokeWidth={1.75} />
            <span className="text-xs">导航</span>
          </button>
        )}
        <button
          onClick={() => {
            if (currentDay?.items?.length > 0) {
              setEditingItem({ dayIndex: activeDay, itemIndex: 0 })
            }
          }}
          className="flex flex-col items-center gap-0.5 py-1 min-h-[44px] min-w-[44px] justify-center text-trip-mint transition-colors"
          aria-label="编辑"
        >
          <Edit3 className="w-5 h-5" strokeWidth={1.75} />
          <span className="text-xs">编辑</span>
        </button>
        <button
          onClick={handleSave}
          className="flex flex-col items-center gap-0.5 py-1 min-h-[44px] min-w-[44px] justify-center text-trip-mint transition-colors"
          aria-label="保存行程"
        >
          {saved ? <Check className="w-5 h-5" strokeWidth={1.75} /> : <Heart className="w-5 h-5" strokeWidth={1.75} />}
          <span className="text-xs">{saved ? '已保存' : '保存'}</span>
        </button>
      </div>

      {/* 桌面端地图悬浮按钮 */}
      <button
        onClick={() => onOpenMap ? onOpenMap() : setShowMap(true)}
        className="fixed bottom-6 left-4 w-12 h-12 rounded-xl bg-trip-surface border border-trip-border text-trip-mint shadow-card flex items-center justify-center hover:bg-trip-cloud hover:shadow-elevated transition-all z-40 hidden md:flex min-h-[44px] min-w-[44px]"
        aria-label="打开地图"
      >
        <MapIcon className="w-5 h-5" strokeWidth={1.75} />
      </button>

      {showMap && (
        <FloatingMap
          pins={mapPins}
          destination={destination}
          preferences={preferences}
          onClose={() => setShowMap(false)}
          onUpdatePin={(pinId, patch) => {
            setLocalPlan(prev => {
              const nextDays = prev.days.map(day => {
                const items = Array.isArray(day) ? day : (day.items || [])
                const newItems = items.map(item =>
                  item.id === pinId ? { ...item, ...patch } : item
                )
                if (Array.isArray(day)) return newItems
                return { ...day, items: newItems }
              })
              return { ...prev, days: nextDays }
            })
          }}
          onAddPin={(place) => {
            const newItem = {
              id: `custom-${Date.now()}`,
              name: place.name,
              type: 'custom',
              typeLabel: '自定义',
              lat: place.lat,
              lng: place.lng,
              address: place.address,
              time: '09:00',
              durationMinutes: 30,
              isCustom: true,
            }
            setLocalPlan(prev => {
              const nextDays = prev.days.map((day, idx) => {
                if (idx !== activeDay) return day
                const items = Array.isArray(day) ? day : (day.items || [])
                const newItems = [...items, newItem]
                if (Array.isArray(day)) return newItems
                return { ...day, items: newItems }
              })
              if (activeDay >= prev.days.length) {
                nextDays.push({ date: '', items: [newItem] })
              }
              return { ...prev, days: nextDays }
            })
          }}
          onRemovePin={(pinId) => {
            setLocalPlan(prev => {
              const nextDays = prev.days.map(day => {
                const items = Array.isArray(day) ? day : (day.items || [])
                const newItems = items.filter(item => item.id !== pinId)
                if (Array.isArray(day)) return newItems
                return { ...day, items: newItems }
              })
              return { ...prev, days: nextDays }
            })
          }}
          mode={mapMode}
          onModeChange={setMapMode}
          totalDays={days.length}
        />
      )}

      {editingTransport?.isNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <TransportEditor
              transport={null}
              prevItemName={getNewTransportContext().prev}
              nextItemName={getNewTransportContext().next}
              onSave={handleTransportSave}
              onCancel={() => setEditingTransport(null)}
            />
          </div>
        </div>
      )}

      {navSheetItem && (
        <NavActionSheet item={navSheetItem} onClose={() => setNavSheetItem(null)} />
      )}

      <ItineraryPrintView
        itinerary={localItinerary}
        destination={destination}
        preferences={preferences}
      />
    </div>
  )
}

function ItineraryPrintView({ itinerary, destination, preferences }) {
  const destinationName = destination?.name || '我的旅行'
  const itemCount = itinerary.reduce((total, day) => total + getDayItems(itinerary, itinerary.indexOf(day)).length, 0)
  const generatedDate = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date())

  const getTransportLabel = (item) => {
    const labels = {
      flight: '飞机', train: '火车', subway: '地铁', bus: '公交',
      taxi: '出租车', car: '驾车', walk: '步行', transport: '交通',
    }
    return labels[item.transportType || item.type] || item.transportLabel || '交通'
  }

  return (
    <article className="itinerary-print-view" aria-hidden="true">
      <header className="itinerary-print-header">
        <div>
          <div className="itinerary-print-brand">TRIPZZLE · 旅行计划</div>
          <h1>{destinationName}行程安排</h1>
          <p>{itinerary.length} 天 · {itemCount} 项安排{preferences?.transport ? ` · ${preferences.transport}出行` : ''}</p>
        </div>
        <div className="itinerary-print-date">导出于 {generatedDate}</div>
      </header>

      <div className="itinerary-print-summary">
        <span>目的地<strong>{destinationName}</strong></span>
        <span>行程天数<strong>{itinerary.length} 天</strong></span>
        <span>安排数量<strong>{itemCount} 项</strong></span>
      </div>

      {itinerary.map((day, dayIndex) => {
        const items = getDayItems(itinerary, dayIndex)
        const theme = Array.isArray(day) ? '' : (day.theme || day.title || '')
        return (
          <section className="itinerary-print-day" key={day.id || dayIndex}>
            <div className="itinerary-print-day-heading">
              <div className="itinerary-print-day-number">DAY {dayIndex + 1}</div>
              <div>
                <h2>第 {dayIndex + 1} 天</h2>
                <p>{getDayDate(itinerary, dayIndex)}{theme ? ` · ${theme}` : ''}</p>
              </div>
            </div>

            <div className="itinerary-print-items">
              {items.length === 0 && <p className="itinerary-print-empty">当天暂无安排</p>}
              {items.map((item, itemIndex) => {
                const isTransport = item.isTransport || ['transport', 'flight', 'train'].includes(item.type)
                const location = item.location || item.address
                const notes = [item.description, item.tips, item.note, item.notes].filter(Boolean)
                return (
                  <div className={`itinerary-print-item ${isTransport ? 'is-transport' : ''}`} key={item.id || itemIndex}>
                    <div className="itinerary-print-time">{item.time || '待定'}</div>
                    <div className="itinerary-print-item-body">
                      <div className="itinerary-print-item-title">
                        <h3>{item.name || (isTransport ? getTransportLabel(item) : '未命名安排')}</h3>
                        <span>{isTransport ? getTransportLabel(item) : (item.typeLabel || typeLabels[item.type] || '安排')}</span>
                      </div>
                      {isTransport && (item.from || item.to) && (
                        <p className="itinerary-print-route">{item.from || '出发地待定'} → {item.to || '目的地待定'}</p>
                      )}
                      <div className="itinerary-print-meta">
                        {item.arriveTime && <span>到达 {item.arriveTime}</span>}
                        {(item.durationMinutes || item.duration) && <span>约 {formatDuration(item.durationMinutes || item.duration)}</span>}
                        {item.code && <span>班次 {item.code}</span>}
                        {location && <span>地点 {location}</span>}
                        {item.needsReservation && <span>需提前预约</span>}
                      </div>
                      {notes.length > 0 && (
                        <div className="itinerary-print-notes">
                          {notes.map((note, noteIndex) => (
                            <p key={noteIndex}><strong>{noteIndex === 0 ? '具体安排' : '备注'}</strong>{note}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}

      <footer className="itinerary-print-footer">Tripzzle · 带着计划，也带着好奇心出发</footer>
    </article>
  )
}

function InsertTransportButton({ onClick }) {
  return (
    <div className="flex items-center gap-2 my-1 pl-1 pr-2">
      <div className="w-[3px] h-6 bg-trip-border/60 rounded-full ml-[22px]" aria-hidden="true" />
      <button
        onClick={onClick}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-trip-surface border border-trip-border text-trip-muted hover:border-trip-mint/40 hover:text-trip-mint text-xs font-medium transition-colors min-h-[32px]"
      >
        <Plus className="w-3 h-3" strokeWidth={1.75} />
        交通方式
      </button>
      <div className="flex-1 h-px bg-trip-border/40" aria-hidden="true" />
    </div>
  )
}

function TransportCard({ item, onEdit, onDelete }) {
  const transportType = item.transportType || item.type || 'flight'
  const isFlight = transportType === 'flight'
  const isTrain = transportType === 'train'
  const Icon = isFlight ? Plane : (isTrain ? Train : Navigation)

  const formatTimeRange = () => {
    if (item.time && item.arriveTime) return `${item.time} → ${item.arriveTime}`
    if (item.time) return item.time
    return ''
  }

  const formatDurationText = () => {
    if (!item.durationMinutes) return ''
    if (item.durationMinutes < 60) return `${item.durationMinutes}分钟`
    const h = Math.floor(item.durationMinutes / 60)
    const m = item.durationMinutes % 60
    return m > 0 ? `${h}小时${m}分` : `${h}小时`
  }

  return (
    <div className="flex items-center gap-3 px-2 py-2 my-0.5">
      <div className="w-7 h-7 rounded-md bg-trip-cloud flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-trip-muted" strokeWidth={1.75} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-medium text-trip-slate text-xs truncate">
            {item.name || (isFlight ? '航班' : isTrain ? '列车' : '交通')}
          </span>
          <span className="text-[10px] text-trip-muted">
            {isFlight ? '飞机' : isTrain ? '火车' : '交通'}
          </span>
        </div>

        {(item.from || item.to) && (
          <div className="flex items-center gap-1 mt-0.5 text-[11px] text-trip-muted">
            {item.from && <span>{item.from}</span>}
            <ArrowRight className="w-2.5 h-2.5 text-trip-border" strokeWidth={1.75} />
            {item.to && <span>{item.to}</span>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-[11px] text-trip-muted font-mono tabular-nums shrink-0">
        {formatTimeRange() && (
          <span>{formatTimeRange()}</span>
        )}
        {formatDurationText() && (
          <span>{formatDurationText()}</span>
        )}
      </div>

      <div className="flex items-center gap-0 shrink-0 ml-1">
        <button
          onClick={onEdit}
          className="p-1 rounded text-trip-muted/60 hover:text-trip-mint hover:bg-trip-mint-pale/50 transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center"
          aria-label="编辑交通"
        >
          <Edit3 className="w-3 h-3" strokeWidth={1.75} />
        </button>
        <button
          onClick={onDelete}
          className="p-1 rounded text-trip-muted/60 hover:text-red-500 hover:bg-red-50 transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center"
          aria-label="删除交通"
        >
          <Trash2 className="w-3 h-3" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}

function NavActionSheet({ item, onClose }) {
  const links = buildMapLinks(item)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass rounded-t-2xl p-4 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-trip-ink">选择导航方式</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-trip-cloud transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="关闭">
            <XCircle className="w-5 h-5 text-trip-muted" strokeWidth={1.75} />
          </button>
        </div>
        <div className="space-y-1">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                openMapLink(link)
                onClose()
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-trip-cloud transition-colors min-h-[44px]"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                link.id === 'amap' ? 'bg-trip-mint-pale text-trip-mint' :
                link.id === 'baidu' ? 'bg-trip-fog-pale text-trip-blue' :
                link.id === 'tencent' ? 'bg-trip-fog-pale text-trip-blue' :
                link.id === 'apple' ? 'bg-trip-cloud text-trip-slate' :
                link.id === 'google' ? 'bg-trip-rose-pale text-trip-rose' :
                'bg-trip-cloud text-trip-muted'
              }`}>
                {link.id === 'copy' ? <Copy className="w-5 h-5" strokeWidth={1.75} /> : <Navigation className="w-5 h-5" strokeWidth={1.75} />}
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-trip-ink">{link.label}</div>
                {link.action === 'copy' && (
                  <div className="text-xs text-trip-muted">{link.address}</div>
                )}
              </div>
              <ExternalLink className="w-4 h-4 text-trip-muted" strokeWidth={1.75} />
            </button>
          ))}
        </div>
        <div className="mt-4 h-1.5 bg-trip-cloud rounded-full" />
      </div>
    </div>
  )
}

function DayItemEditor({
  item, dayIndex, itemIndex, isLast, isFirst,
  onUpdate, onRemove, onMove,
  isEditing, onStartEdit, onStopEdit,
  isDragging, isDragOver,
  onDragStart, onDragOver, onDragEnd,
  onShowNav,
  destinationName,
}) {
  const [editData, setEditData] = useState({ ...item })
  const [noteText, setNoteText] = useState(item.note || '')
  const [showNote, setShowNote] = useState(!!item.note)
  const [showPlacePicker, setShowPlacePicker] = useState(false)
  const isTransport = item.isTransport || item.type === 'transport' || item.type === 'flight' || item.type === 'train'
  const isQuickMeal = item.mealSubtype === 'quickMeal'
  const Icon = isQuickMeal ? ShoppingBag : (typeIcons[item.type] || Landmark)
  const colors = isQuickMeal
    ? { badge: 'bg-trip-mint-pale text-trip-mint', dot: 'bg-trip-mint', bg: 'bg-trip-mint-pale/30' }
    : (typeColors[item.type] || typeColors.attraction)
  const hasCoords = !isTransport && editData.lat && editData.lng && !isNaN(editData.lat) && !isNaN(editData.lng)

  useEffect(() => {
    if (isEditing) setEditData({ ...item })
  }, [isEditing, item])

  const handleSave = () => {
    onUpdate(dayIndex, itemIndex, { ...editData, note: noteText })
    onStopEdit()
  }

  const handlePlaceSelect = (place) => {
    setEditData(prev => ({
      ...prev,
      name: place.name || prev.name,
      address: place.address || '',
      location: place.address || '',
      lat: place.lat,
      lng: place.lng,
      amapPoiId: place.amapPoiId || '',
      coordSource: place.coordSource || 'amap',
      coordType: place.coordType || 'gcj02',
    }))
    setShowPlacePicker(false)
  }

  const saveNote = () => {
    onUpdate(dayIndex, itemIndex, { note: noteText })
  }

  // 拖拽手柄 + 卡片

  return (
    <div
      className={`rounded-xl bg-trip-surface border border-trip-border/70 shadow-card overflow-hidden border-l-[4px] ${colors.dot.replace('bg-', 'border-l-')} transition-all ${
        isDragging ? 'opacity-50 scale-[0.98]' : ''
      } ${
        isDragOver ? 'ring-2 ring-trip-mint' : isEditing ? 'ring-2 ring-trip-mint/20' : ''
      }`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDragEnd}
    >
      <div className={`flex items-stretch ${isEditing ? 'bg-trip-mint-pale/20' : ''} rounded-xl`}>
        {/* 拖拽手柄 */}
        <div className="flex items-center px-1.5 cursor-grab active:cursor-grabbing text-trip-muted/30 hover:text-trip-muted/60 transition-colors" aria-hidden="true">
          <GripVertical className="w-3.5 h-3.5" strokeWidth={1.75} />
        </div>

        {/* 主内容 */}
        <div className="flex-1 min-w-0 py-2.5 pr-2.5">
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="time"
                  value={editData.time}
                  onChange={(e) => setEditData(prev => ({ ...prev, time: e.target.value }))}
                  className="px-2.5 py-1.5 text-sm rounded-lg border border-trip-border focus:border-trip-mint outline-none min-h-[36px] font-mono tabular-nums"
                />
                <select
                  value={editData.type}
                  onChange={(e) => setEditData(prev => ({ ...prev, type: e.target.value }))}
                  className="px-2.5 py-1.5 text-sm rounded-lg border border-trip-border focus:border-trip-mint outline-none min-h-[36px]"
                >
                  {Object.entries(typeLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  className="flex-1 px-2.5 py-1.5 text-sm rounded-lg border border-trip-border focus:border-trip-mint outline-none min-h-[36px]"
                  placeholder="名称"
                />
              </div>
              <input
                type="text"
                value={editData.location || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-trip-border focus:border-trip-mint outline-none min-h-[36px]"
                placeholder="位置（选填）"
              />
              {!isTransport && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPlacePicker(true)}
                    className={`px-2.5 py-1.5 rounded-md text-xs flex items-center gap-1.5 min-h-[36px] ${hasCoords ? 'bg-trip-mint-pale text-trip-mint' : 'bg-trip-cloud text-trip-muted'}`}
                  >
                    <MapPin className="w-[14px] h-[14px]" strokeWidth={1.75} />
                    {hasCoords ? '已定位' : '待定位'}
                  </button>
                  {hasCoords && (
                    <button
                      type="button"
                      onClick={() => setEditData(prev => ({ ...prev, lat: null, lng: null, amapPoiId: '', coordSource: '', coordType: '' }))}
                      className="text-xs text-trip-muted hover:text-trip-amber transition-colors min-h-[36px]"
                    >
                      清除
                    </button>
                  )}
                  {editData.isCustom && !hasCoords && (
                    <span className="text-xs text-trip-amber flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" strokeWidth={1.75} />
                      未定位，不会显示在地图中
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-trip-muted" strokeWidth={1.75} />
                <input
                  type="number"
                  value={editData.durationMinutes || 60}
                  onChange={(e) => setEditData(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) || 60 }))}
                  className="w-16 px-2.5 py-1.5 text-sm rounded-lg border border-trip-border focus:border-trip-mint outline-none min-h-[36px] font-mono tabular-nums"
                  min="10"
                  step="15"
                />
                <span className="text-xs text-trip-muted">分钟</span>
                <div className="flex-1" />
                <button onClick={handleSave} className="px-3 py-1.5 text-xs rounded-lg bg-trip-mint text-white font-medium min-h-[36px]">保存</button>
                <button onClick={onStopEdit} className="px-3 py-1.5 text-xs rounded-lg bg-trip-cloud text-trip-muted min-h-[36px]">取消</button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="text-base font-bold text-trip-ink shrink-0 w-14 font-mono tabular-nums pt-0.5">
                {item.time}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Icon className={`w-[16px] h-[16px] ${colors.dot.replace('bg-', 'text-')}`} strokeWidth={1.75} />
                  <h4 className="font-semibold text-trip-ink text-base truncate">{item.name}</h4>
                  {item.typeLabel && (
                    <span className={`tag ${colors.badge}`}>
                      {item.typeLabel}
                    </span>
                  )}
                  {item.mealSubtype === 'quickMeal' && (
                    <span className="tag bg-trip-mint-pale text-trip-mint">简餐</span>
                  )}
                  {item.needsReservation && (
                    <span className="tag bg-trip-rose-pale text-trip-rose">需预约</span>
                  )}
                  {item.weatherSensitive && (
                    <span className="tag bg-trip-fog-pale text-trip-fog-dark">天气敏感</span>
                  )}
                </div>
                {item.location && (
                  <div className="flex items-center gap-1 text-sm text-trip-slate mt-1">
                    <MapPin className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span className="truncate">{item.location}</span>
                  </div>
                )}
                {item.description && (
                  <div className="text-xs text-trip-muted mt-1 line-clamp-2">{item.description}</div>
                )}
              </div>

              <div className="flex items-center gap-0.5 shrink-0 pt-0.5">
                <span className="text-sm text-trip-muted mr-1 font-mono tabular-nums">{formatDuration(item.durationMinutes || item.duration || 60)}</span>
                {hasCoords && onShowNav && (
                  <button
                    onClick={() => onShowNav(item)}
                    className="p-2 rounded-md text-trip-muted hover:text-trip-mint hover:bg-trip-mint-pale/50 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                    aria-label="导航到此地点"
                  >
                    <Navigation className="w-[16px] h-[16px]" strokeWidth={1.75} />
                  </button>
                )}
                <button
                  onClick={onStartEdit}
                  className="p-2 rounded-md text-trip-muted hover:text-trip-mint hover:bg-trip-mint-pale/50 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                  aria-label="编辑此项"
                >
                  <Edit3 className="w-[16px] h-[16px]" strokeWidth={1.75} />
                </button>
                <button
                  onClick={() => onRemove(dayIndex, itemIndex)}
                  className="p-2 rounded-md text-trip-muted hover:text-red-500 hover:bg-red-50 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                  aria-label="删除此项"
                >
                  <X className="w-[16px] h-[16px]" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {showPlacePicker && (
        <PlacePicker
          city={destinationName || '北京'}
          initialKeyword={editData.name || ''}
          onSelect={handlePlaceSelect}
          onClose={() => setShowPlacePicker(false)}
        />
      )}
    </div>
  )
}

function DayMetaEditor({ dayData, onSave, onCancel }) {
  const [theme, setTheme] = useState(dayData.theme || dayData.title || '')
  const [isRemoteDay, setIsRemoteDay] = useState(!!dayData.isRemoteDay)

  const handleSave = () => {
    const patch = {}
    if (theme.trim()) patch.theme = theme.trim()
    patch.isRemoteDay = isRemoteDay
    onSave(patch)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="当天主题，如：长城（八达岭）一日游"
          className="flex-1 px-2.5 py-1.5 text-sm rounded-lg border border-trip-border focus:border-trip-mint outline-none"
        />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isRemoteDay}
          onChange={(e) => setIsRemoteDay(e.target.checked)}
          className="w-4 h-4 rounded border-trip-border text-trip-mint focus:ring-trip-mint"
        />
        <span className="text-sm text-trip-slate">标记为远郊日</span>
      </label>
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleSave}
          className="px-3 py-1.5 text-xs rounded-lg bg-trip-mint text-white font-medium"
        >
          保存
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-xs rounded-lg bg-trip-cloud text-trip-muted"
        >
          取消
        </button>
      </div>
    </div>
  )
}
