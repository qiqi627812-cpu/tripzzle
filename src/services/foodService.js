import { getSvgPlaceholder } from '../utils/imageFallback'

const AMAP_KEY = '942f298093937afa211f61802dbb9e87'

const foodKeywords = [
  '必吃美食',
  '老字号餐厅',
  '网红餐厅',
  '当地特色',
  '人气餐厅',
]

const cityNameMap = {
  'beijing': '北京',
  'shanghai': '上海',
  'chengdu': '成都',
  'chongqing': '重庆',
}

let foodCache = {}

export async function fetchRealFood(destinationId, keyword = '美食') {
  const cityName = cityNameMap[destinationId] || destinationId
  const cacheKey = `${cityName}-${keyword}`

  if (foodCache[cacheKey]) {
    return foodCache[cacheKey]
  }

  try {
    const url = `https://restapi.amap.com/v3/place/text?keywords=${encodeURIComponent(keyword)}&city=${encodeURIComponent(cityName)}&output=json&key=${AMAP_KEY}&offset=20&page=1&extensions=all`

    const response = await fetch(url)
    const data = await response.json()

    if (data.status === '1' && data.pois && data.pois.length > 0) {
      const foodList = data.pois.map((poi, index) => {
        const photos = poi.photos || []
        const firstPhoto = photos.length > 0 ? photos[0].url : null
        
        const rating = poi.biz_ext?.rating ? parseFloat(poi.biz_ext.rating) : null
        const cost = poi.biz_ext?.cost || null

        return {
          id: `amap-${poi.id}`,
          name: poi.name,
          description: poi.type || '特色美食',
          image: firstPhoto || getSvgPlaceholder(poi.name),
          price: cost ? `¥${cost}` : null,
          cuisine: poi.type ? poi.type.split(';').pop() : '美食',
          location: poi.address || poi.pname + poi.cityname + poi.adname,
          address: poi.address,
          tags: extractTags(poi),
          rating: rating,
          tel: poi.tel,
          lat: parseFloat(poi.location.split(',')[1]),
          lng: parseFloat(poi.location.split(',')[0]),
          businessArea: poi.business_area,
          mustTry: generateMustTry(poi.name, cityName),
          source: 'amap',
        }
      })

      foodCache[cacheKey] = foodList
      return foodList
    }

    return []
  } catch (error) {
    console.warn('获取美食数据失败:', error)
    return []
  }
}

export async function fetchFoodByCity(destinationId) {
  const cityName = cityNameMap[destinationId]
  if (!cityName) return []

  const cacheKey = `all-${destinationId}`
  if (foodCache[cacheKey]) {
    return foodCache[cacheKey]
  }

  try {
    const allFoods = []
    const keywords = ['必吃餐厅', '老字号', '网红美食', '当地特色菜', '人气餐厅']

    for (const keyword of keywords.slice(0, 2)) {
      const foods = await fetchRealFood(destinationId, keyword)
      for (const food of foods) {
        if (!allFoods.find(f => f.name === food.name)) {
          allFoods.push(food)
        }
      }
    }

    foodCache[cacheKey] = allFoods.slice(0, 15)
    return foodCache[cacheKey]
  } catch (error) {
    console.warn('获取美食列表失败:', error)
    return []
  }
}

function extractTags(poi) {
  const tags = []

  if (poi.rating && parseFloat(poi.rating) >= 4.5) {
    tags.push('高分推荐')
  }
  if (poi.type) {
    const typeParts = poi.type.split(';')
    if (typeParts.length > 0) {
      tags.push(typeParts[typeParts.length - 1])
    }
  }
  if (poi.business_area) {
    tags.push(poi.business_area)
  }

  return tags.slice(0, 3)
}

function generateMustTry(restaurantName, cityName) {
  const mustTryMap = {
    '北京': ['北京烤鸭', '炸酱面', '卤煮火烧'],
    '上海': ['小笼包', '生煎包', '红烧肉'],
    '成都': ['火锅', '串串香', '担担面'],
    '重庆': ['重庆火锅', '小面', '酸辣粉'],
  }

  const cityFoods = mustTryMap[cityName] || ['招牌菜', '特色小吃', '当地美食']
  return cityFoods
}

export function clearFoodCache() {
  foodCache = {}
}
