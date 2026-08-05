const AMAP_KEY = '942f298093937afa211f61802dbb9e87'

let routeCache = {}

function generateCacheKey(fromLat, fromLng, toLat, toLng, type) {
  return `${fromLat}-${fromLng}-${toLat}-${toLng}-${type}`
}

function getAmapUrl(path) {
  return `https://restapi.amap.com${path}&key=${AMAP_KEY}&output=json`
}

export async function getWalkingRoute(fromLat, fromLng, toLat, toLng) {
  const cacheKey = generateCacheKey(fromLat, fromLng, toLat, toLng, 'walking')
  
  if (routeCache[cacheKey]) {
    return routeCache[cacheKey]
  }

  try {
    const url = getAmapUrl(`/v3/direction/walking?origin=${fromLng},${fromLat}&destination=${toLng},${toLat}`)
    
    const response = await fetch(url)
    const data = await response.json()

    if (data.status === '1' && data.route && data.route.paths && data.route.paths.length > 0) {
      const path = data.route.paths[0]
      const result = {
        type: 'walk',
        label: '步行',
        duration: parseInt(path.duration),
        distance: parseInt(path.distance),
        description: `步行前往，约${Math.round(parseInt(path.duration) / 60)}分钟，距离约${(parseInt(path.distance) / 1000).toFixed(1)}公里`,
        route: null,
      }
      routeCache[cacheKey] = result
      return result
    }
  } catch (error) {
    console.warn('获取步行路线失败:', error)
  }

  return null
}

export async function getTransitRoute(fromLat, fromLng, toLat, toLng, city) {
  const cacheKey = generateCacheKey(fromLat, fromLng, toLat, toLng, 'transit')
  
  if (routeCache[cacheKey]) {
    return routeCache[cacheKey]
  }

  try {
    const url = getAmapUrl(`/v3/direction/transit/integrated?origin=${fromLng},${fromLat}&destination=${toLng},${toLat}&city=${encodeURIComponent(city)}`)
    
    const response = await fetch(url)
    const data = await response.json()

    if (data.status === '1' && data.route && data.route.transits && data.route.transits.length > 0) {
      const transit = data.route.transits[0]
      
      let routeInfo = ''
      let routeLines = []
      
      if (transit.segments && transit.segments.length > 0) {
        transit.segments.forEach(segment => {
          if (segment.bus && segment.bus.buslines && segment.bus.buslines.length > 0) {
            segment.bus.buslines.forEach(busline => {
              let name = busline.name || ''
              name = name.replace(/\(.*\)/g, '').trim()
              name = name.replace(/^地铁/, '').trim()
              if (name) {
                routeLines.push(name)
              }
            })
          }
        })
      }

      if (routeLines.length > 0) {
        routeInfo = routeLines.join(' → ')
      }

      const subwayLines = routeLines.filter(line => /\d+号线/.test(line) || line.includes('线'))
      const busLines = routeLines.filter(line => line.includes('路'))

      let transportType = 'bus'
      let label = '公交'
      if (subwayLines.length > 0 && busLines.length === 0) {
        transportType = 'subway'
        label = '地铁'
      } else if (subwayLines.length > 0 && busLines.length > 0) {
        transportType = 'subway'
        label = '地铁+公交'
      }

      const result = {
        type: transportType,
        label: label,
        duration: parseInt(transit.duration),
        distance: parseInt(transit.distance),
        description: routeLines.length > 0 
          ? `${routeInfo}，约${Math.round(parseInt(transit.duration) / 60)}分钟`
          : `公共交通前往，约${Math.round(parseInt(transit.duration) / 60)}分钟`,
        route: routeInfo || null,
        subwayLines: subwayLines,
        busLines: busLines,
        walkDistance: parseInt(transit.walking_distance) || 0,
      }
      routeCache[cacheKey] = result
      return result
    }
  } catch (error) {
    console.warn('获取公交/地铁路线失败:', error)
  }

  return null
}

export async function getDrivingRoute(fromLat, fromLng, toLat, toLng) {
  const cacheKey = generateCacheKey(fromLat, fromLng, toLat, toLng, 'driving')
  
  if (routeCache[cacheKey]) {
    return routeCache[cacheKey]
  }

  try {
    const url = getAmapUrl(`/v3/direction/driving?origin=${fromLng},${fromLat}&destination=${toLng},${toLat}`)
    
    const response = await fetch(url)
    const data = await response.json()

    if (data.status === '1' && data.route && data.route.paths && data.route.paths.length > 0) {
      const path = data.route.paths[0]
      const result = {
        type: 'taxi',
        label: '打车',
        duration: parseInt(path.duration),
        distance: parseInt(path.distance),
        description: `打车前往，约${Math.round(parseInt(path.duration) / 60)}分钟，费用约${Math.round(parseInt(path.distance) / 1000 * 2.5 + 13)}元`,
        route: null,
      }
      routeCache[cacheKey] = result
      return result
    }
  } catch (error) {
    console.warn('获取驾车路线失败:', error)
  }

  return null
}

function getDefaultTransport(distance = 0, preference = 'subway') {
  const isLong = distance > 15000
  const isShort = distance < 1500

  // 根据偏好和距离确定交通方式
  let type = preference
  if (isLong && preference === 'walk') type = 'subway'
  if (isShort && (preference === 'car' || preference === 'taxi')) type = 'walk'
  if (isLong && preference === 'bus') type = 'subway'

  const configs = {
    subway: { label: '地铁', duration: isLong ? 50 : (isShort ? 10 : 30) },
    bus: { label: '公交', duration: isLong ? 70 : (isShort ? 15 : 40) },
    walk: { label: '步行', duration: Math.max(5, Math.round(distance / 80)) },
    taxi: { label: '打车', duration: Math.max(8, Math.round(distance / 500)) },
    car: { label: '打车', duration: Math.max(8, Math.round(distance / 500)) },
  }

  const c = configs[type] || configs.subway
  return {
    type,
    label: c.label,
    duration: c.duration,
    description: `${c.label}前往，约${c.duration}分钟`,
    route: null,
  }
}

export async function getRoute(fromLat, fromLng, toLat, toLng, transportType, city) {
  if (!fromLat || !fromLng || !toLat || !toLng) {
    return null
  }

  const distance = calculateDistance(fromLat, fromLng, toLat, toLng)
  let result = null

  if (transportType === 'walk' || distance < 1000) {
    result = await getWalkingRoute(fromLat, fromLng, toLat, toLng)
  } else if (transportType === 'taxi' || distance > 40000) {
    result = await getDrivingRoute(fromLat, fromLng, toLat, toLng)
  } else {
    result = await getTransitRoute(fromLat, fromLng, toLat, toLng, city)
  }

  if (result) {
    return result
  }

  return getDefaultTransport(distance, transportType)
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export function clearRouteCache() {
  routeCache = {}
}

export { AMAP_KEY }

export default {
  getRoute,
  getWalkingRoute,
  getTransitRoute,
  getDrivingRoute,
  clearRouteCache,
}
