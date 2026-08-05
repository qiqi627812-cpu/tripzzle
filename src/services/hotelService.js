import { getSvgPlaceholder } from '../utils/imageFallback'

const AMAP_KEY = '942f298093937afa211f61802dbb9e87'

const cityNameMap = {
  'beijing': '北京',
  'shanghai': '上海',
  'chengdu': '成都',
  'chongqing': '重庆',
}

let hotelCache = {}

export async function fetchRealHotels(destinationId, keyword = '酒店') {
  const cityName = cityNameMap[destinationId] || destinationId
  const cacheKey = `${cityName}-${keyword}`

  if (hotelCache[cacheKey]) {
    return hotelCache[cacheKey]
  }

  try {
    const url = `https://restapi.amap.com/v3/place/text?keywords=${encodeURIComponent(keyword)}&city=${encodeURIComponent(cityName)}&output=json&key=${AMAP_KEY}&offset=20&page=1&extensions=all`

    const response = await fetch(url)
    const data = await response.json()

    if (data.status === '1' && data.pois && data.pois.length > 0) {
      const hotelList = data.pois.map((poi) => {
        const photos = poi.photos || []
        const firstPhoto = photos.length > 0 ? photos[0].url : null
        
        const rating = poi.biz_ext?.rating ? parseFloat(poi.biz_ext.rating) : null
        const cost = poi.biz_ext?.cost || null

        return {
          id: `amap-hotel-${poi.id}`,
          name: poi.name,
          description: poi.type || '酒店',
          image: firstPhoto || getSvgPlaceholder(poi.name),
          price: cost ? `¥${cost}` : null,
          rating: rating,
          location: poi.address || poi.pname + poi.cityname + poi.adname,
          address: poi.address,
          tel: poi.tel,
          lat: parseFloat(poi.location.split(',')[1]),
          lng: parseFloat(poi.location.split(',')[0]),
          businessArea: poi.business_area,
          source: 'amap',
        }
      })

      hotelCache[cacheKey] = hotelList
      return hotelList
    }

    return []
  } catch (error) {
    console.warn('获取酒店数据失败:', error)
    return []
  }
}

export function clearHotelCache() {
  hotelCache = {}
}
