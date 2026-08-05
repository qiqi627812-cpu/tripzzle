import { AMAP_KEY } from './routeService.js'
import { getSvgPlaceholder } from '../utils/imageFallback.js'

const AMAP_BASE_URL = 'https://restapi.amap.com'
const CACHE_TTL_MS = 30 * 60 * 1000
const discoveryCache = new Map()

function getDistanceMeters(a, b) {
  if (!a || !b) return 0
  const radius = 6371000
  const dLat = (b.lat - a.lat) * Math.PI / 180
  const dLng = (b.lng - a.lng) * Math.PI / 180
  const lat1 = a.lat * Math.PI / 180
  const lat2 = b.lat * Math.PI / 180
  const value = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return radius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
}

function parseLocation(location) {
  if (!location || typeof location !== 'string') return null
  const [lng, lat] = location.split(',').map(Number)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return { lat, lng }
}

async function requestAmap(path, params) {
  if (!AMAP_KEY) throw new Error('AMAP_NOT_CONFIGURED')
  const query = new URLSearchParams({
    ...params,
    key: AMAP_KEY,
    output: 'json',
  })
  const response = await fetch(`${AMAP_BASE_URL}${path}?${query}`)
  if (!response.ok) throw new Error(`AMAP_HTTP_${response.status}`)
  const data = await response.json()
  if (data.status !== '1') throw new Error(data.info || data.infocode || 'AMAP_REQUEST_FAILED')
  return data
}

export async function resolveAmapDestination(destinationName) {
  const normalizedName = String(destinationName || '').trim()
  if (!normalizedName) throw new Error('DESTINATION_REQUIRED')

  const hasAdministrativeSuffix = /(?:市|省|区|县|州|盟|旗|特别行政区)$/.test(normalizedName)
  const lookupNames = hasAdministrativeSuffix
    ? [normalizedName]
    : [`${normalizedName}市`, normalizedName]
  let district = null

  for (const lookupName of lookupNames) {
    try {
      const data = await requestAmap('/v3/config/district', {
        keywords: lookupName,
        subdistrict: '0',
        extensions: 'base',
      })
      const districts = data.districts || []
      district = districts.find((item) => item.name === lookupName)
        || districts.find((item) => item.level === 'city' && item.name.includes(normalizedName))
        || districts[0]
      if (district) break
    } catch {
      // 尝试不带行政区后缀的原始名称。
    }
  }

  const center = parseLocation(district?.center)
  if (!district || !center) throw new Error('DESTINATION_NOT_FOUND')

  const name = district.name || normalizedName
  return {
    id: `amap-${district.adcode || encodeURIComponent(name)}`,
    name,
    lat: center.lat,
    lon: center.lng,
    adcode: district.adcode || '',
    citycode: district.citycode || '',
    source: 'amap',
    pool: {
      attractions: [],
      food: [],
      shopping: [],
      accommodation: [],
    },
  }
}

function getDuration(type, name) {
  if (type === 'food') return { duration: '1小时', durationMinutes: 60 }
  if (type === 'shopping') return { duration: '1-2小时', durationMinutes: 90 }
  if (/迪士尼|环球影城|欢乐谷|方特|长隆/.test(name)) {
    return { duration: '一整天', durationMinutes: 480 }
  }
  if (/博物馆|纪念馆|美术馆|故宫|园林/.test(name)) {
    return { duration: '2-3小时', durationMinutes: 150 }
  }
  return { duration: '2小时', durationMinutes: 120 }
}

function normalizePoi(poi, type, destination) {
  const location = parseLocation(poi.location)
  if (!location) return null

  const category = String(poi.type || '').split(';').filter(Boolean).pop() || (
    type === 'food' ? '当地美食' : type === 'shopping' ? '商圈购物' : '景点'
  )
  const areaLabel = poi.business_area || poi.adname || destination.name
  const rating = Number.parseFloat(poi.biz_ext?.rating || poi.rating || '')
  const distance = getDistanceMeters(
    { lat: destination.lat, lng: destination.lon },
    location,
  )
  const duration = getDuration(type, poi.name || '')
  const isFullDay = duration.durationMinutes >= 420
  const isRemote = !isFullDay && distance > 30000
  const photos = Array.isArray(poi.photos) ? poi.photos : []
  const photoUrl = photos.find((photo) => photo?.url)?.url

  return {
    id: `amap-${poi.id}`,
    amapPoiId: poi.id,
    name: poi.name,
    description: category,
    image: photoUrl || getSvgPlaceholder(poi.name),
    type,
    typeLabel: type === 'food' ? '美食' : type === 'shopping' ? '购物' : '景点',
    address: typeof poi.address === 'string' ? poi.address : '',
    location: typeof poi.address === 'string'
      ? poi.address
      : [poi.pname, poi.cityname, poi.adname].filter(Boolean).join(''),
    area: areaLabel,
    areaLabel,
    businessArea: poi.business_area || '',
    tags: [
      category,
      Number.isFinite(rating) && rating >= 4.5 ? '高分推荐' : '',
      poi.adname || '',
    ].filter(Boolean).slice(0, 3),
    rating: Number.isFinite(rating) ? rating : null,
    lat: location.lat,
    lng: location.lng,
    ...duration,
    isRemote,
    isFullDay,
    needsReservation: type === 'attraction' && /博物馆|纪念馆|故宫|迪士尼|环球影城/.test(poi.name || ''),
    weatherSensitive: type === 'attraction' && !/博物馆|纪念馆|美术馆|科技馆/.test(poi.name || ''),
    preferredTime: type === 'food' ? 'meal' : type === 'shopping' ? 'evening' : 'morning',
    mealSubtype: type === 'food' ? 'restaurantMeal' : undefined,
    crowdRisk: Number.isFinite(rating) && rating >= 4.7 ? 'high' : 'medium',
    priority: Math.round((Number.isFinite(rating) ? rating * 18 : 70) - Math.min(20, distance / 5000)),
    source: 'amap',
    coordSource: 'amap',
  }
}

async function searchCategory(destination, {
  type,
  types,
  offset,
}) {
  const data = await requestAmap('/v3/place/text', {
    city: destination.adcode || destination.name,
    citylimit: 'true',
    types,
    offset: String(offset),
    page: '1',
    extensions: 'all',
  })

  return (data.pois || [])
    .map((poi) => normalizePoi(poi, type, destination))
    .filter(Boolean)
}

export async function discoverAmapDestination(destinationName) {
  const cacheKey = String(destinationName || '').trim()
  const cached = discoveryCache.get(cacheKey)
  if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) return cached.value

  const destination = await resolveAmapDestination(cacheKey)
  const resultSets = await Promise.all([
    searchCategory(destination, { type: 'attraction', types: '110000', offset: 20 }),
    searchCategory(destination, { type: 'attraction', types: '140000', offset: 12 }),
    searchCategory(destination, { type: 'food', types: '050000', offset: 12 }),
    searchCategory(destination, { type: 'shopping', types: '060000', offset: 8 }),
  ])

  const seenIds = new Set()
  const seenNames = new Set()
  const candidates = resultSets
    .flat()
    .filter((item) => {
      const normalizedName = item.name.replace(/\s+/g, '')
      if (seenIds.has(item.id) || seenNames.has(normalizedName)) return false
      seenIds.add(item.id)
      seenNames.add(normalizedName)
      return true
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 50)

  if (candidates.length < 6) throw new Error('AMAP_NOT_ENOUGH_PLACES')

  const value = { destination, candidates }
  discoveryCache.set(cacheKey, { createdAt: Date.now(), value })
  return value
}

export function clearAmapDiscoveryCache() {
  discoveryCache.clear()
}

export default discoverAmapDestination
