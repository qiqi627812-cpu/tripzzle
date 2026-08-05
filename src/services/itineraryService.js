import { getDestinationById } from '../data/destinations.js'
import { getRoute } from './routeService.js'

const paceConfig = {
  悠闲: { morningStart: '09:00', afternoonEnd: '18:00', itemsPerDay: 3, gap: 90, maxHours: 7 },
  适中: { morningStart: '08:30', afternoonEnd: '19:30', itemsPerDay: 4, gap: 60, maxHours: 9 },
  紧凑: { morningStart: '08:00', afternoonEnd: '20:00', itemsPerDay: 5, gap: 45, maxHours: 10 },
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
  'default': '市区',
}

const remoteLunchConfig = {
  'bj-2': { description: '景区附近简餐或自带干粮', mealSubtype: 'quickMeal' },
  'cd-7': { description: '山上简餐或自带干粮', mealSubtype: 'quickMeal' },
  'cd-8': { description: '景区附近用餐', mealSubtype: 'quickMeal' },
  'cq-6': { description: '景区附近简餐', mealSubtype: 'quickMeal' },
  'sh-5': { description: '园内用餐（较贵但方便）', mealSubtype: 'quickMeal' },
}

function parseDays(daysInput) {
  if (typeof daysInput === 'number') return Math.max(1, daysInput)
  if (typeof daysInput === 'string') {
    const match = daysInput.match(/(\d+)\s*天/)
    return match ? parseInt(match[1]) : 3
  }
  return 3
}

function getDistanceMeters(a, b) {
  if (!a || !b || a.lat == null || b.lat == null || a.lng == null || b.lng == null) return 0
  const R = 6371000
  const dLat = (b.lat - a.lat) * Math.PI / 180
  const dLng = (b.lng - a.lng) * Math.PI / 180
  const lat1 = a.lat * Math.PI / 180
  const lat2 = b.lat * Math.PI / 180
  const x = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
  return R * c
}

function getDefaultTransport(cityName, distance = 0, preference = 'subway') {
  const isLong = distance > 15000
  const isShort = distance < 1500
  let type = preference
  if (isLong && preference === 'walk') type = 'subway'
  if (isShort && preference === 'car') type = 'walk'
  const configs = {
    subway: { label: '地铁', icon: 'Train', duration: isLong ? 45 : 25 },
    bus: { label: '公交', icon: 'Bus', duration: isLong ? 60 : 35 },
    walk: { label: '步行', icon: 'Footprints', duration: Math.max(5, Math.round(distance / 80)) },
    car: { label: '打车', icon: 'Car', duration: isLong ? 30 : 12 },
  }
  const c = configs[type] || configs.subway
  return { type, label: c.label, icon: c.icon, duration: c.duration, description: `${c.label}前往，约${c.duration}分钟`, route: null }
}

function parseTimeToMinutes(time) {
  if (!time) return 8 * 60 + 30
  if (time.includes(':')) {
    const [h, m] = time.split(':').map(Number)
    if (!isNaN(h) && !isNaN(m)) return h * 60 + m
  }
  const hourMatch = time.match(/(\d+)\s*点/)
  if (hourMatch) {
    let hour = parseInt(hourMatch[1])
    if (time.includes('下午') || time.includes('晚上')) {
      if (hour < 12) hour += 12
    }
    const minuteMatch = time.match(/点\s*(\d+)/)
    const minute = minuteMatch ? parseInt(minuteMatch[1]) : 0
    return hour * 60 + minute
  }
  return 8 * 60 + 30
}

function minutesToTime(minutes) {
  if (isNaN(minutes) || minutes < 0) minutes = 0
  const h = Math.floor(minutes / 60) % 24
  const m = Math.floor(minutes % 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

function getDurationMinutes(durationStr) {
  if (!durationStr) return 90
  const str = String(durationStr)
  if (str.includes('大半天')) return 360
  if (str.includes('半天')) return 240
  if (str.includes('一整天')) return 480
  const hourRange = str.match(/(\d+)-(\d+)\s*小时/)
  if (hourRange) return Math.round((parseInt(hourRange[1]) + parseInt(hourRange[2])) / 2 * 60)
  const hourMatch = str.match(/(\d+(\.\d+)?)\s*小时/)
  if (hourMatch) return Math.round(parseFloat(hourMatch[1]) * 60)
  const minuteMatch = str.match(/(\d+)\s*分钟/)
  if (minuteMatch) return parseInt(minuteMatch[1])
  return 90
}

async function getTransportBetween(from, to, transportPref, cityName) {
  let fromLat, fromLng, toLat, toLng, fromName, toName

  if (from && typeof from === 'object') {
    fromLat = from.lat
    fromLng = from.lng
    fromName = from.name
  }
  if (to && typeof to === 'object') {
    toLat = to.lat
    toLng = to.lng
    toName = to.name
  }

  let transportType = 'transit'
  if (transportPref === 'car' || transportPref === 'taxi') {
    transportType = 'taxi'
  } else if (transportPref === 'walk') {
    transportType = 'walk'
  }

  let realRoute = null
  if (fromLat && fromLng && toLat && toLng) {
    try {
      realRoute = await getRoute(fromLat, fromLng, toLat, toLng, transportType, cityName)
    } catch (error) {
      console.warn('获取真实路线失败，使用默认值:', error)
    }
  }

  if (realRoute) {
    const iconMap = { 'subway': 'Train', 'bus': 'Bus', 'walk': 'Footprints', 'taxi': 'Car', 'car': 'Car' }
    return { type: realRoute.type, label: realRoute.label, icon: iconMap[realRoute.type] || 'MapPin', duration: Math.round(realRoute.duration / 60), description: realRoute.description, route: realRoute.route, from: fromName, to: toName }
  }

  const distance = getDistanceMeters(from, to)
  const result = getDefaultTransport(cityName, distance, transportPref)
  result.from = fromName
  result.to = toName
  return result
}

function isRemoteAttraction(item) {
  const remoteIds = ['bj-2', 'cq-6', 'cd-7', 'cd-8', 'sh-5']
  return remoteIds.includes(item.id) || item.isRemote || item.isFullDay
}

function normalizeItems(selectedItems, destination) {
  const pool = destination.pool
  const poolItemMap = {}
  const typeMap = {
    attractions: { type: 'attraction', typeLabel: '景点' },
    food: { type: 'food', typeLabel: '美食' },
    shopping: { type: 'shopping', typeLabel: '购物' },
    accommodation: { type: 'accommodation', typeLabel: '住宿' },
  }
  Object.keys(typeMap).forEach(cat => {
    (pool[cat] || []).forEach(item => {
      poolItemMap[item.id] = { ...item, ...typeMap[cat] }
    })
  })

  return selectedItems.map(item => {
    const pooled = poolItemMap[item.id]
    if (pooled) {
      const normalized = {
        ...pooled,
        ...item,
        durationMinutes: item.durationMinutes || pooled.durationMinutes || getDurationMinutes(item.duration || pooled.duration),
        areaLabel: pooled.areaLabel || areaLabels[pooled.area] || '市区',
        type: item.type || pooled.type,
        typeLabel: item.typeLabel || pooled.typeLabel,
        preferredTime: pooled.preferredTime || 'anytime',
        isRemote: !!pooled.isRemote || isRemoteAttraction(pooled),
        isFullDay: !!pooled.isFullDay,
        mealSubtype: pooled.mealSubtype || (pooled.type === 'food' ? 'restaurantMeal' : undefined),
      }
      if (normalized.type === 'food') {
        normalized.preferredTime = 'meal'
      }
      return normalized
    }
    const type = item.type || 'attraction'
    return {
      ...item,
      type,
      typeLabel: typeMap[type]?.typeLabel || '景点',
      durationMinutes: item.durationMinutes || getDurationMinutes(item.duration),
      areaLabel: item.areaLabel || areaLabels[item.area] || '市区',
      preferredTime: item.preferredTime || (type === 'food' ? 'meal' : 'anytime'),
      isRemote: !!item.isRemote || isRemoteAttraction(item),
      isFullDay: !!item.isFullDay,
      mealSubtype: item.mealSubtype || (type === 'food' ? 'restaurantMeal' : undefined),
    }
  })
}

function classifyItems(items) {
  const categories = { remote: [], fullDay: [], attractions: [], shopping: [], food: [], accommodation: [] }

  items.forEach(item => {
    if (isRemoteAttraction(item)) {
      if (item.isFullDay) {
        categories.fullDay.push(item)
      } else {
        categories.remote.push(item)
      }
    } else if (item.type === 'attraction') {
      categories.attractions.push(item)
    } else if (item.type === 'shopping') {
      categories.shopping.push(item)
    } else if (item.type === 'food') {
      categories.food.push(item)
    } else if (item.type === 'accommodation') {
      categories.accommodation.push(item)
    }
  })

  return categories
}

function buildDaySkeletons(classified, requestedDays, destination) {
  const days = Array(requestedDays).fill(null).map((_, idx) => ({
    id: `day-${idx + 1}`,
    day: idx + 1,
    date: `第${idx + 1}天`,
    title: null,
    theme: null,
    mainArea: null,
    intensity: 'moderate',
    isRemoteDay: false,
    isFullDay: false,
    remoteItem: null,
    items: [],
    meals: { breakfast: null, lunch: null, dinner: null, snacks: [] },
    warnings: [],
    alternatives: [],
  }))

  return { days, destination }
}

function mealFromItem(item, mealType) {
  if (!item) return null
  return {
    ...item,
    durationMinutes: item.durationMinutes || getDurationMinutes(item.duration) || 75,
    type: 'food',
    typeLabel: '美食',
    isMeal: true,
    mealType,
    mealSubtype: item.mealSubtype || 'restaurantMeal',
  }
}

function buildDaysFromAiPlan(aiPlan, items, requestedDays, destination) {
  const classified = classifyItems(items)
  const { days } = buildDaySkeletons(classified, requestedDays, destination)
  const itemById = new Map(items.map((item) => [item.id, item]))
  const usedPlaceIds = new Set()
  const usedFoodIds = new Set()

  days.forEach((dayPlan) => {
    const aiDay = aiPlan.days?.find((day) => day.day === dayPlan.day)
    if (!aiDay) return

    dayPlan.theme = aiDay.theme || null
    dayPlan.aiReason = aiDay.reason || ''
    dayPlan.items = (aiDay.orderedPlaceIds || [])
      .map((id) => itemById.get(id))
      .filter((item) => {
        if (!item || item.type === 'food' || item.type === 'accommodation' || usedPlaceIds.has(item.id)) return false
        usedPlaceIds.add(item.id)
        return true
      })

    const lunch = itemById.get(aiDay.lunchItemId)
    const dinner = itemById.get(aiDay.dinnerItemId)
    if (lunch?.type === 'food' && !usedFoodIds.has(lunch.id)) {
      dayPlan.meals.lunch = mealFromItem(lunch, 'lunch')
      usedFoodIds.add(lunch.id)
    }
    if (dinner?.type === 'food' && !usedFoodIds.has(dinner.id)) {
      dayPlan.meals.dinner = mealFromItem(dinner, 'dinner')
      usedFoodIds.add(dinner.id)
    }
  })

  const activities = [
    ...classified.remote,
    ...classified.fullDay,
    ...classified.attractions,
    ...classified.shopping,
  ]
  const missingActivities = activities.filter((item) => !usedPlaceIds.has(item.id))

  missingActivities.forEach((item) => {
    const target = days
      .filter((day) => !day.items.some((candidate) => candidate.isRemote || candidate.isFullDay))
      .sort((a, b) => a.items.length - b.items.length)[0] || days[0]
    target.items.push(item)
    usedPlaceIds.add(item.id)
  })

  // 远郊/全天地点属于硬约束：即使模型混排，也把它调整为独立日。
  const overflow = []
  days.forEach((dayPlan) => {
    const remoteItem = dayPlan.items.find((item) => item.isRemote || item.isFullDay || isRemoteAttraction(item))
    if (!remoteItem) return
    overflow.push(...dayPlan.items.filter((item) => item.id !== remoteItem.id))
    dayPlan.items = [remoteItem]
    dayPlan.mainArea = remoteItem.area
    dayPlan.isRemoteDay = true
    dayPlan.isFullDay = Boolean(remoteItem.isFullDay)
    dayPlan.remoteItem = remoteItem
  })

  overflow.forEach((item) => {
    const target = days
      .filter((day) => !day.isRemoteDay)
      .sort((a, b) => a.items.length - b.items.length)[0]
    if (target) target.items.push(item)
  })

  days.forEach((dayPlan) => {
    if (!dayPlan.mainArea && dayPlan.items.length > 0) {
      dayPlan.mainArea = dayPlan.items[0].area || 'default'
    }
  })

  return { days, usedFoodIds }
}

function assignRemoteFullDayItems(days, classified) {
  const remoteItems = [...classified.remote, ...classified.fullDay]
  let dayIdx = 0

  for (const remoteItem of remoteItems) {
    if (dayIdx >= days.length) break
    days[dayIdx].items = [remoteItem]
    days[dayIdx].mainArea = remoteItem.area
    days[dayIdx].isRemoteDay = true
    days[dayIdx].isFullDay = remoteItem.isFullDay || false
    days[dayIdx].remoteItem = remoteItem
    dayIdx++
  }

  return days
}

function groupByArea(items) {
  const groups = {}
  items.forEach(item => {
    const area = item.area || 'default'
    if (!groups[area]) groups[area] = []
    groups[area].push(item)
  })
  return groups
}

function calculateDayIntensity(items, config) {
  const totalMinutes = items.reduce((sum, item) => sum + (item.durationMinutes || 90), 0)
  const transportMinutes = items.length * 20
  const gapMinutes = (items.length - 1) * config.gap
  return totalMinutes + transportMinutes + gapMinutes
}

function assignAreaClusterItems(days, classified, config) {
  const allRegularItems = [...classified.attractions, ...classified.shopping]

  // 按区域分组
  const areaGroups = groupByArea(allRegularItems)

  // 区域排序：有 evening 项目且总项目数多的区域优先
  const sortedAreas = Object.keys(areaGroups).sort((a, b) => {
    const aItems = areaGroups[a]
    const bItems = areaGroups[b]
    const aEveningCount = aItems.filter(i => i.preferredTime === 'evening').length
    const bEveningCount = bItems.filter(i => i.preferredTime === 'evening').length
    // 有 evening 的区域优先
    if (aEveningCount !== bEveningCount) return bEveningCount - aEveningCount
    if (a === 'center') return -1
    if (b === 'center') return 1
    return bItems.length - aItems.length
  })

  sortedAreas.forEach(area => {
    const areaItems = [...areaGroups[area]]
    let nonEveningItems = areaItems.filter(i => i.preferredTime !== 'evening')
    let eveningItems = areaItems.filter(i => i.preferredTime === 'evening')

    // 关键：同区域 evening 项目最多保留 1 个（evening 时间窗口有限）
    // 其余推到 afternoon，避免在 insertTransport 被静默丢弃
    const maxEveningPerArea = 1
    if (eveningItems.length > maxEveningPerArea) {
      // 按优先级排序，只保留前 maxEveningPerArea 个
      eveningItems.sort((a, b) => (b.priority || 0) - (a.priority || 0))
      const overflowEvening = eveningItems.slice(maxEveningPerArea)
      eveningItems = eveningItems.slice(0, maxEveningPerArea)
      // 溢出的改成 afternoon
      overflowEvening.forEach(item => {
        nonEveningItems.push({ ...item, preferredTime: 'afternoon' })
      })
    }

    // 找一个能容纳整个区域项目（包括 evening）的天
    // 如果强度超载，仍然尝试分配（放宽限制）
    let bestDay = -1
    let bestScore = -Infinity

    for (let d = 0; d < days.length; d++) {
      if (days[d].isRemoteDay) continue

      const existingArea = days[d].mainArea
      const currentCount = days[d].items.length
      const projectedItems = [...days[d].items, ...nonEveningItems, ...eveningItems]
      const intensity = calculateDayIntensity(projectedItems, config)
      const maxAllowed = config.maxHours * 60

      // 如果强度严重超载（>1.5 倍），跳过
      // 否则仍然尝试分配（即使超载）
      if (intensity > maxAllowed * 1.5 && currentCount > 0) continue

      let score = 0
      if (existingArea === area) score += 50
      if (currentCount === 0) score += 30
      if (!existingArea) score += 15
      if (existingArea && existingArea !== area) score -= 25

      if (score > bestScore) {
        bestScore = score
        bestDay = d
      }
    }

    // 如果仍然没有合适的天，找第一个空天
    if (bestDay === -1) {
      for (let d = 0; d < days.length; d++) {
        if (days[d].isRemoteDay) continue
        if (days[d].items.length === 0) {
          bestDay = d
          break
        }
      }
    }

    // 如果仍然没有，强制分配到第一个非 remote 天
    if (bestDay === -1) {
      for (let d = 0; d < days.length; d++) {
        if (days[d].isRemoteDay) continue
        bestDay = d
        break
      }
    }

    if (bestDay !== -1) {
      nonEveningItems.sort((a, b) => {
        const timeOrder = { morning: 1, afternoon: 2, anytime: 3, meal: 5 }
        const aTime = timeOrder[a.preferredTime] || 3
        const bTime = timeOrder[b.preferredTime] || 3
        if (aTime !== bTime) return aTime - bTime
        return (b.priority || 0) - (a.priority || 0)
      }).forEach(item => {
        days[bestDay].items.push(item)
      })

      eveningItems.sort((a, b) => (b.priority || 0) - (a.priority || 0)).forEach(item => {
        days[bestDay].items.push(item)
      })

      if (!days[bestDay].mainArea) {
        days[bestDay].mainArea = area
      }
    }
  })

  for (let d = 0; d < days.length; d++) {
    days[d].items.sort((a, b) => {
      const timeOrder = { morning: 1, anytime: 2, afternoon: 3, evening: 4 }
      const aTime = timeOrder[a.preferredTime] || 4
      const bTime = timeOrder[b.preferredTime] || 4
      if (aTime !== bTime) return aTime - bTime
      return (a.priority || 0) - (b.priority || 0)
    })
  }

  return days
}

function assignFoodToMealSlots(days, availableFood, hotelName, destination) {
  const remainingFood = [...availableFood]

  days.forEach(dayPlan => {
    const dayArea = dayPlan.mainArea
    const nearbyFood = remainingFood.filter(f => !dayArea || f.area === dayArea)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))

    if (!dayPlan.meals.lunch) {
      const lunchFood = nearbyFood[0]
      if (lunchFood) {
        dayPlan.meals.lunch = {
          id: lunchFood.id,
          name: lunchFood.name,
          description: lunchFood.description || '品尝当地特色美食',
          durationMinutes: lunchFood.durationMinutes || 75,
          type: 'food',
          typeLabel: '美食',
          isMeal: true,
          mealType: 'lunch',
          mealSubtype: lunchFood.mealSubtype || 'restaurantMeal',
          lat: lunchFood.lat,
          lng: lunchFood.lng,
          location: lunchFood.location,
        }
        remainingFood.splice(remainingFood.indexOf(lunchFood), 1)
      }
    }

    if (!dayPlan.meals.dinner) {
      const dinnerFood = nearbyFood[1] || remainingFood[0]
      if (dinnerFood) {
        dayPlan.meals.dinner = {
          id: dinnerFood.id,
          name: dinnerFood.name,
          description: dinnerFood.description || '享用晚餐',
          durationMinutes: dinnerFood.durationMinutes || 90,
          type: 'food',
          typeLabel: '美食',
          isMeal: true,
          mealType: 'dinner',
          mealSubtype: dinnerFood.mealSubtype || 'restaurantMeal',
          lat: dinnerFood.lat,
          lng: dinnerFood.lng,
          location: dinnerFood.location,
        }
        const idx = remainingFood.indexOf(dinnerFood)
        if (idx !== -1) remainingFood.splice(idx, 1)
      }
    }
  })

  return { days, remainingFood }
}

function fillMissingMeals(days, hotelName, destination) {
  days.forEach(dayPlan => {
    if (!dayPlan.meals.breakfast) {
      dayPlan.meals.breakfast = {
        id: `meal-breakfast-${dayPlan.day}`,
        name: '早餐',
        description: `${hotelName}早餐或附近特色早点`,
        durationMinutes: 30,
        type: 'food',
        typeLabel: '美食',
        isMeal: true,
        mealType: 'breakfast',
        mealSubtype: 'restaurantMeal',
        lat: destination.lat,
        lng: destination.lon,
        location: hotelName,
      }
    }

    if (dayPlan.isRemoteDay && dayPlan.remoteItem && !dayPlan.meals.lunch) {
      const config = remoteLunchConfig[dayPlan.remoteItem.id] || { description: '景区附近简餐或自带干粮', mealSubtype: 'quickMeal' }
      dayPlan.meals.lunch = {
        id: `meal-lunch-${dayPlan.day}`,
        name: '午餐',
        description: config.description,
        durationMinutes: 30,
        type: 'food',
        typeLabel: '美食',
        isMeal: true,
        mealType: 'lunch',
        mealSubtype: config.mealSubtype,
        lat: dayPlan.remoteItem.lat,
        lng: dayPlan.remoteItem.lng,
        location: dayPlan.remoteItem.location || dayPlan.remoteItem.name,
      }
    } else if (!dayPlan.meals.lunch) {
      const firstItem = dayPlan.items[0]
      dayPlan.meals.lunch = {
        id: `meal-lunch-${dayPlan.day}`,
        name: '午餐',
        description: '附近简餐或特色小吃',
        durationMinutes: 75,
        type: 'food',
        typeLabel: '美食',
        isMeal: true,
        mealType: 'lunch',
        mealSubtype: 'restaurantMeal',
        lat: firstItem?.lat || destination.lat,
        lng: firstItem?.lng || destination.lon,
        location: firstItem?.location || '景点附近',
      }
    }

    if (!dayPlan.meals.dinner) {
      dayPlan.meals.dinner = {
        id: `meal-dinner-${dayPlan.day}`,
        name: '晚餐',
        description: '享用晚餐',
        durationMinutes: 90,
        type: 'food',
        typeLabel: '美食',
        isMeal: true,
        mealType: 'dinner',
        mealSubtype: 'restaurantMeal',
        lat: destination.lat,
        lng: destination.lon,
        location: hotelName,
      }
    }
  })

  return days
}

async function insertTransport(days, preferences, cityName, hotelLocation, routeProvider = null) {
  const LUNCH_START = 11 * 60 + 30
  const LUNCH_END = 13 * 60 + 30
  const DINNER_START = 17 * 60 + 30
  const DINNER_END = 19 * 60 + 30
  // 放宽截止时间，给 evening 景点更多容错
  const DAY_END_LIMIT = parseTimeToMinutes('22:00')
  const RETURN_LIMIT = parseTimeToMinutes('22:30')

  const preferredTimeStart = {
    morning: parseTimeToMinutes('09:00'),
    anytime: parseTimeToMinutes('09:00'),
    afternoon: parseTimeToMinutes('13:30'),
    evening: parseTimeToMinutes('17:00'),
  }

  async function getTransportBetweenWithProvider(from, to, transportPref, cityName) {
    if (routeProvider) {
      return routeProvider(from, to, transportPref, cityName)
    }
    return getTransportBetween(from, to, transportPref, cityName)
  }

  for (const dayPlan of days) {
    const schedule = []
    let currentTime = parseTimeToMinutes(preferences.startTime || '08:30')
    let lastLocation = hotelLocation

    const breakfast = dayPlan.meals.breakfast
    if (breakfast && currentTime < 10 * 60) {
      schedule.push({ ...breakfast, time: minutesToTime(currentTime) })
      currentTime += 45
      lastLocation = hotelLocation
    }

    const orderedItems = [...dayPlan.items].sort((a, b) => {
      const timeOrder = { morning: 1, anytime: 2, afternoon: 3, evening: 4 }
      const aTime = timeOrder[a.preferredTime] || 4
      const bTime = timeOrder[b.preferredTime] || 4
      if (aTime !== bTime) return aTime - bTime
      return (b.priority || 0) - (a.priority || 0)
    })

    const remoteItem = orderedItems.find(i => i.isRemote || i.isFullDay)

    async function addTransportTo(targetLocation) {
      if (!lastLocation || !targetLocation) return 0
      const sameLat = Math.abs(lastLocation.lat - targetLocation.lat) < 0.001
      const sameLng = Math.abs(lastLocation.lng - targetLocation.lng) < 0.001
      if (sameLat && sameLng) return 0
      const transport = await getTransportBetweenWithProvider(lastLocation, targetLocation, preferences.transport, cityName)
      if (transport && transport.duration > 0) {
        schedule.push({
          id: `transport-${dayPlan.day}-${schedule.length}`,
          time: minutesToTime(currentTime),
          type: 'transport',
          typeLabel: '交通',
          name: targetLocation.name ? `前往 ${targetLocation.name}` : '前往下一地点',
          description: transport.description,
          duration: transport.duration + '分钟',
          durationMinutes: transport.duration,
          transportType: transport.type,
          transportLabel: transport.label,
          transportIcon: transport.icon,
          isTransport: true,
          route: transport.route,
          from: transport.from || lastLocation?.name,
          to: transport.to || targetLocation?.name,
        })
        return transport.duration
      }
      return 0
    }

    async function addMeal(meal) {
      if (!meal) return
      const mealLocation = meal.lat && meal.lng
        ? { lat: meal.lat, lng: meal.lng, name: meal.location || meal.name }
        : lastLocation

      const transportDuration = await addTransportTo(mealLocation)
      const mealWindowStart = meal.mealType === 'lunch' ? LUNCH_START : DINNER_START
      let arrivalTime = currentTime + transportDuration
      if (arrivalTime < mealWindowStart) arrivalTime = mealWindowStart

      const isQuickMeal = meal.mealSubtype === 'quickMeal'
      const mealDuration = isQuickMeal ? 30 : (meal.mealType === 'lunch' ? 75 : 90)
      schedule.push({
        ...meal,
        time: minutesToTime(arrivalTime),
        duration: isQuickMeal ? '30分钟' : (meal.mealType === 'lunch' ? '1小时15分钟' : '1.5小时'),
        durationMinutes: mealDuration,
      })
      currentTime = arrivalTime + mealDuration
      lastLocation = mealLocation
    }

    async function addActivity(item, options = {}) {
      const itemLocation = item.lat && item.lng
        ? { lat: item.lat, lng: item.lng, name: item.name, id: item.id }
        : null

      const scheduleLengthBefore = schedule.length
      const transportDuration = await addTransportTo(itemLocation)
      const duration = item.durationMinutes || getDurationMinutes(item.duration)

      if (currentTime + transportDuration + duration > DAY_END_LIMIT) {
        if (schedule.length > scheduleLengthBefore) {
          schedule.pop()
        }
        return false
      }

      currentTime += transportDuration

      if (options.splitAt) {
        const splitBefore = options.splitAt - currentTime
        if (splitBefore > 0) {
          schedule.push({
            ...item,
            time: minutesToTime(currentTime),
            duration: `${Math.round(splitBefore / 60 * 10) / 10}小时`,
            durationMinutes: splitBefore,
          })
          currentTime += splitBefore
        }
      } else {
        schedule.push({
          ...item,
          time: minutesToTime(currentTime),
          duration: item.duration || '1.5小时',
          durationMinutes: duration,
        })
        currentTime += duration
      }

      lastLocation = itemLocation || lastLocation
      currentTime += 30
      return true
    }

    if (dayPlan.isRemoteDay && remoteItem) {
      const itemLocation = remoteItem.lat && remoteItem.lng
        ? { lat: remoteItem.lat, lng: remoteItem.lng, name: remoteItem.name, id: remoteItem.id }
        : null

      const transportDuration = await addTransportTo(itemLocation)
      currentTime += transportDuration
      lastLocation = itemLocation || lastLocation

      const totalDuration = remoteItem.durationMinutes || getDurationMinutes(remoteItem.duration)
      const lunch = dayPlan.meals.lunch
      
      const MIN_PLAY_TIME_BEFORE_LUNCH = 120
      const arrivalTime = currentTime
      const idealLunchTime = arrivalTime + MIN_PLAY_TIME_BEFORE_LUNCH
      const lunchStartTime = lunch ? Math.max(idealLunchTime, LUNCH_START) : currentTime + totalDuration
      const timeBeforeLunch = Math.max(0, lunchStartTime - currentTime)

      if (timeBeforeLunch > 30 && totalDuration > timeBeforeLunch) {
        schedule.push({
          ...remoteItem,
          time: minutesToTime(currentTime),
          duration: `${Math.round(timeBeforeLunch / 60 * 10) / 10}小时`,
          durationMinutes: timeBeforeLunch,
        })
        currentTime += timeBeforeLunch
      }

      if (lunch) {
        if (currentTime < LUNCH_START) currentTime = LUNCH_START
        await addMeal(lunch)
      }

      const remainingDuration = totalDuration - timeBeforeLunch
      if (remainingDuration > 0) {
        schedule.push({
          ...remoteItem,
          time: minutesToTime(currentTime),
          duration: `${Math.round(remainingDuration / 60 * 10) / 10}小时`,
          durationMinutes: remainingDuration,
        })
        currentTime += remainingDuration
      }

      lastLocation = itemLocation || lastLocation
      currentTime += 30

      // 返回市区
      const remoteReturn = await getTransportBetweenWithProvider(lastLocation, hotelLocation, preferences.transport, cityName)
      if (remoteReturn && remoteReturn.duration > 0) {
        schedule.push({
          id: `transport-return-${dayPlan.day}`,
          time: minutesToTime(currentTime),
          type: 'transport',
          typeLabel: '交通',
          name: `返回 ${hotelLocation.name}`,
          description: remoteReturn.description,
          duration: remoteReturn.duration + '分钟',
          durationMinutes: remoteReturn.duration,
          transportType: remoteReturn.type,
          transportLabel: remoteReturn.label,
          transportIcon: remoteReturn.icon,
          isTransport: true,
          route: remoteReturn.route,
          from: remoteReturn.from || lastLocation?.name,
          to: remoteReturn.to || hotelLocation?.name,
        })
        currentTime += remoteReturn.duration
        lastLocation = hotelLocation
      }

      // 晚餐在市区
      if (dayPlan.meals.dinner && !schedule.some(i => i.mealType === 'dinner')) {
        if (currentTime < DINNER_START) currentTime = DINNER_START
        await addMeal(dayPlan.meals.dinner)
      }

      // 远郊日晚上：允许安排 evening 项目（如洪崖洞/南山一棵树），但控制在 22:00 前结束
      const eveningItemsForRemoteDay = orderedItems.filter(i => i.preferredTime === 'evening')
      for (const item of eveningItemsForRemoteDay) {
        if (currentTime >= preferredTimeStart.evening) {
          await addActivity(item)
        }
      }
    } else {
      // 普通市区日：按 morning -> lunch -> afternoon -> dinner -> evening 阶段安排
      const groups = { morning: [], anytime: [], afternoon: [], evening: [] }
      orderedItems.forEach(item => {
        const key = groups[item.preferredTime] ? item.preferredTime : 'anytime'
        groups[key].push(item)
      })

      // 晚间时间窗口有限，若 evening 项目过多，把优先级低的溢出
      // 保留最多 2 个 evening 项目，其余推到下午
      const maxEveningSlots = 2
      while (groups.evening.length > maxEveningSlots) {
        const moved = groups.evening.pop()
        groups.afternoon.push(moved)
      }

      const lunchAdded = () => schedule.some(i => i.mealType === 'lunch')
      const dinnerAdded = () => schedule.some(i => i.mealType === 'dinner')

      // morning + anytime
      for (const item of [...groups.morning, ...groups.anytime]) {
        const minStart = preferredTimeStart[item.preferredTime] || preferredTimeStart.morning
        if (currentTime < minStart) currentTime = minStart
        if (currentTime >= LUNCH_START - 30 && dayPlan.meals.lunch && !lunchAdded()) {
          if (currentTime < LUNCH_START) currentTime = LUNCH_START
          await addMeal(dayPlan.meals.lunch)
        }
        await addActivity(item)
      }

      // lunch
      if (dayPlan.meals.lunch && !lunchAdded()) {
        if (currentTime < LUNCH_START) currentTime = LUNCH_START
        await addMeal(dayPlan.meals.lunch)
      }

      // afternoon
      for (const item of groups.afternoon) {
        if (currentTime < preferredTimeStart.afternoon) currentTime = preferredTimeStart.afternoon
        if (currentTime >= DINNER_START - 30 && dayPlan.meals.dinner && !dinnerAdded()) {
          if (currentTime < DINNER_START) currentTime = DINNER_START
          await addMeal(dayPlan.meals.dinner)
        }
        await addActivity(item)
      }

      // dinner
      if (dayPlan.meals.dinner && !dinnerAdded()) {
        if (currentTime < DINNER_START) currentTime = DINNER_START
        await addMeal(dayPlan.meals.dinner)
      }

      // evening
      for (const item of groups.evening) {
        if (currentTime < preferredTimeStart.evening) currentTime = preferredTimeStart.evening
        await addActivity(item)
      }
    }

    if (!dayPlan.isRemoteDay) {
      const returnTransport = await getTransportBetweenWithProvider(lastLocation, hotelLocation, preferences.transport, cityName)
      if (currentTime + returnTransport.duration <= RETURN_LIMIT) {
        schedule.push({
          id: `transport-return-${dayPlan.day}`,
          time: minutesToTime(currentTime),
          type: 'transport',
          typeLabel: '交通',
          name: `返回 ${hotelLocation.name}`,
          description: returnTransport.description,
          duration: returnTransport.duration + '分钟',
          durationMinutes: returnTransport.duration,
          transportType: returnTransport.type,
          transportLabel: returnTransport.label,
          transportIcon: returnTransport.icon,
          isTransport: true,
          route: returnTransport.route,
          from: returnTransport.from || lastLocation?.name,
          to: returnTransport.to || hotelLocation?.name,
        })
      }
    }

    dayPlan.items = schedule
  }

  return days
}

function validateItinerary(result) {
  const { days, classified, requestedDays } = result
  const errors = []
  const warnings = []
  const suggestions = []

  days.forEach((day, idx) => {
    if (!day.title && !day.theme) {
      errors.push(`第 ${idx + 1} 天缺少标题或主题`)
    }

    const nonTransportItems = day.items.filter(i => !i.isTransport)
    if (nonTransportItems.length === 0) {
      errors.push(`第 ${idx + 1} 天只有交通没有目的地`)
    }

    const transportItems = day.items.filter(i => i.isTransport)
    transportItems.forEach(item => {
      if (!item.name || !item.name.match(/前往|返回/)) {
        errors.push(`第 ${idx + 1} 天有交通段没有明确的出发/到达地点`)
      }
    })

    const mealTypes = day.items.filter(i => i.isMeal).map(i => i.mealType)
    if (!mealTypes.includes('lunch')) {
      errors.push(`第 ${idx + 1} 天缺少午餐安排`)
    }
    if (!mealTypes.includes('dinner')) {
      errors.push(`第 ${idx + 1} 天缺少晚餐安排`)
    }

    if (day.isRemoteDay) {
      const lunchItems = day.items.filter(i => i.mealType === 'lunch')
      if (lunchItems.length === 0) {
        errors.push(`第 ${idx + 1} 天（远郊日）缺少午餐安排`)
      } else {
        const validSubtypes = ['restaurantMeal', 'quickMeal', 'packedMeal', 'snackBreak']
        if (!validSubtypes.includes(lunchItems[0].mealSubtype)) {
          errors.push(`第 ${idx + 1} 天（远郊日）午餐类型不合法: ${lunchItems[0].mealSubtype}`)
        }
      }
    }

    const foodInRegularSlots = day.items.filter(i => i.type === 'food' && !i.isMeal)
    if (foodInRegularSlots.length > 0) {
      errors.push(`第 ${idx + 1} 天有食物出现在普通时间槽中: ${foodInRegularSlots.map(i => i.name).join(', ')}`)
    }

    for (let i = 0; i < day.items.length - 1; i++) {
      const current = day.items[i]
      const next = day.items[i + 1]
      if (current.isMeal && next.isMeal && !current.isTransport && !next.isTransport) {
        const gap = Math.abs(parseTimeToMinutes(next.time) - parseTimeToMinutes(current.time))
        if (gap <= 60) {
          errors.push(`第 ${idx + 1} 天有连续餐食安排，间隔不足: ${current.name} 和 ${next.name}`)
        }
      }
    }

    const lateItems = day.items.filter(i => parseTimeToMinutes(i.time) > parseTimeToMinutes('21:30') && !i.isTransport)
    if (lateItems.length > 0) {
      suggestions.push(`第 ${idx + 1} 天 ${lateItems.map(i => i.name).join('、')} 安排较晚，建议提前`)
    }
  })

  const remoteRequested = classified.remote.length + classified.fullDay.length
  const remoteInItinerary = days.filter(d => d.isRemoteDay).length
  if (remoteRequested > remoteInItinerary) {
    errors.push(`有 ${remoteRequested - remoteInItinerary} 个远郊景点未安排到行程`)
  }

  const allSelectedIds = [...classified.remote, ...classified.fullDay, ...classified.attractions, ...classified.shopping, ...classified.food].map(i => i.id)
  const allPlannedIds = days.flatMap(d => d.items.map(i => i.id))
  const removed = allSelectedIds.filter(id => !allPlannedIds.includes(id))
  if (removed.length > 0) {
    warnings.push(`以下地点未安排到行程: ${removed.join(', ')}`)
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings: [...warnings, ...result.warnings],
    suggestions: [...suggestions, ...result.suggestions],
    removed,
  }
}

function generateDayTheme(dayNum, destination, dayPlan) {
  const { items, isRemoteDay, remoteItem, mainArea } = dayPlan

  if (isRemoteDay && remoteItem) {
    return `${remoteItem.name}一日游`
  }

  const areaLabel = areaLabels[mainArea] || '市区'
  const hasNightView = items.some(i => i.preferredTime === 'evening' || (i.tags || []).includes('夜景'))
  const hasShopping = items.some(i => i.type === 'shopping')

  if (dayNum === 1) {
    return `${destination.name}初印象 · ${areaLabel}探索`
  } else if (dayNum === 2) {
    if (hasNightView) {
      return `${areaLabel}深度游 · 夜景打卡`
    }
    return `${areaLabel}深度探索`
  } else if (dayNum === 3) {
    if (hasShopping) {
      return `${areaLabel}休闲购物 · 自由活动`
    }
    return `${areaLabel}轻松收尾 · 自由活动`
  }

  const themes = [
    `${destination.name}${areaLabel}探索`,
    `${areaLabel}深度游`,
    `${destination.name}经典必去`,
    '美食与市井生活',
    '城市漫步与打卡',
  ]
  return themes[(dayNum - 1) % themes.length]
}

function generateDayHighlights(dayPlan) {
  const { items, isRemoteDay, remoteItem } = dayPlan
  const highlights = []

  if (isRemoteDay && remoteItem) {
    highlights.push('早出发，午间景区附近简餐或自带补给')
    highlights.push('晚餐返回市区享用')
    return highlights
  }

  const needsReservation = items.filter(i => i.needsReservation)
  if (needsReservation.length > 0) {
    highlights.push(`${needsReservation.map(i => i.name).join('、')}需提前预约`)
  }

  const weatherSensitive = items.filter(i => i.weatherSensitive)
  if (weatherSensitive.length > 0) {
    highlights.push(`${weatherSensitive.map(i => i.name).join('、')}受天气影响较大`)
  }

  const hasShopping = items.some(i => i.type === 'shopping')
  if (hasShopping) {
    highlights.push('安排了购物环节，建议控制时间')
  }

  if (highlights.length === 0) {
    highlights.push('当天行程较为轻松，可自由安排')
  }

  return highlights
}

export async function generateItinerary(destinationId, selectedItems, preferences, daysStr, hotel, transportSegments = [], options = {}) {
  const destination = options.destination || getDestinationById(destinationId)
  if (!destination) {
    return { days: [], warnings: ['目的地不存在'], suggestions: [], removed: [], alternatives: [], validation: { passed: false, errors: ['目的地不存在'] } }
  }

  const paceMap = { relaxed: '悠闲', moderate: '适中', busy: '紧凑' }
  const pace = paceMap[preferences.pace] || preferences.pace || '适中'
  const config = paceConfig[pace] || paceConfig.适中
  const cityName = destination.name
  const hotelName = hotel?.name || '酒店'
  const routeProvider = options.routeProvider || null

  let items = [...selectedItems]

  if (items.length === 0) {
    const pool = destination.pool
    items = [
      ...(pool.attractions || []).slice(0, 5),
      ...(pool.food || []).slice(0, 3),
      ...(pool.shopping || []).slice(0, 2),
    ].map((item, idx) => {
      let type, typeLabel
      if (idx < 5) { type = 'attraction'; typeLabel = '景点' }
      else if (idx < 8) { type = 'food'; typeLabel = '美食' }
      else { type = 'shopping'; typeLabel = '购物' }
      return { ...item, type, typeLabel }
    })
  }

  items = normalizeItems(items, destination)
  const classified = classifyItems(items)
  const requestedDays = Math.max(1, parseDays(daysStr))

  let days
  let aiUsedFoodIds = new Set()
  if (options.aiPlan?.days?.length) {
    const aiResult = buildDaysFromAiPlan(options.aiPlan, items, requestedDays, destination)
    days = aiResult.days
    aiUsedFoodIds = aiResult.usedFoodIds
  } else {
    days = buildDaySkeletons(classified, requestedDays, destination).days
    days = assignRemoteFullDayItems(days, classified)
    days = assignAreaClusterItems(days, classified, config)
  }

  const hotelLocation = hotel && hotel.lat && hotel.lng
    ? { lat: hotel.lat, lng: hotel.lng, name: hotelName }
    : { lat: destination.lat, lng: destination.lon, name: hotelName }

  const unassignedFood = classified.food.filter((item) => !aiUsedFoodIds.has(item.id))
  const { days: daysWithFood, remainingFood } = assignFoodToMealSlots(days, unassignedFood, hotelName, destination)
  days = fillMissingMeals(daysWithFood, hotelName, destination)
  days = await insertTransport(days, preferences, cityName, hotelLocation, routeProvider)

  days.forEach(day => {
    day.theme = day.theme || generateDayTheme(day.day, destination, day)
    day.highlights = generateDayHighlights(day)
  })

  const alternatives = remainingFood.map(f => ({
    id: f.id,
    name: f.name,
    reason: '当日已有足够餐食安排',
    type: 'food',
  }))

  const validation = validateItinerary({ days, classified, requestedDays, warnings: [], suggestions: [] })

  return {
    days,
    warnings: validation.warnings,
    suggestions: validation.suggestions,
    removed: validation.removed,
    alternatives,
    validation,
    stats: {
      totalDays: days.length,
      totalItems: days.flatMap(d => d.items.filter(i => !i.isTransport)).length,
      remoteDays: days.filter(d => d.isRemoteDay).length,
      needsReservation: days.flatMap(d => d.items.filter(i => i.needsReservation)).length,
    },
    ai: options.aiPlan ? {
      applied: true,
      planningNotes: options.aiPlan.planningNotes || [],
      model: options.aiPlan.model,
    } : {
      applied: false,
      planningNotes: [],
    },
  }
}

export default generateItinerary
