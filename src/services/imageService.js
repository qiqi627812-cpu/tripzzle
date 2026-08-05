const AMAP_KEY = '942f298093937afa211f61802dbb9e87'

let imageCache = {}

export async function fetchRealImages(keyword, cityName, limit = 1) {
  const cacheKey = `${cityName}-${keyword}-${limit}`
  if (imageCache[cacheKey]) {
    return imageCache[cacheKey]
  }

  try {
    const url = `https://restapi.amap.com/v3/place/text?keywords=${encodeURIComponent(keyword)}&city=${encodeURIComponent(cityName)}&output=json&key=${AMAP_KEY}&offset=${limit}&page=1&extensions=all`
    
    const response = await fetch(url)
    const data = await response.json()

    if (data.status === '1' && data.pois && data.pois.length > 0) {
      const photos = []
      for (const poi of data.pois) {
        if (poi.photos && poi.photos.length > 0) {
          photos.push({
            name: poi.name,
            url: poi.photos[0].url,
            poiId: poi.id,
          })
        }
      }
      imageCache[cacheKey] = photos
      return photos
    }
  } catch (error) {
    console.warn('获取图片失败:', error)
  }
  return []
}

export async function fetchRealImage(keyword, cityName) {
  const images = await fetchRealImages(keyword, cityName, 1)
  return images.length > 0 ? images[0].url : null
}

export function clearImageCache() {
  imageCache = {}
}

export const cityRealImages = {
  'beijing': {
    '故宫博物院': 'https://store.is.autonavi.com/showpic/2f968490d105bb2741e17f90b85c6b79',
    '长城': 'https://store.is.autonavi.com/showpic/5c140853d105bb2741e17f9269971c66',
    '颐和园': 'https://store.is.autonavi.com/showpic/96d67f93d105bb2741e17f90b86d96f5',
    '天坛': 'https://store.is.autonavi.com/showpic/b2b7cf26d105bb2741e17f90b86d9787',
    '南锣鼓巷': 'https://store.is.autonavi.com/showpic/8b748c73d105bb2741e17f90b86d970a',
    '798艺术区': 'https://store.is.autonavi.com/showpic/19a9d45ed105bb2741e17f90b86d9761',
    '什刹海': 'https://store.is.autonavi.com/showpic/4dc71a98d105bb2741e17f90b86d96da',
    '鸟巢': 'https://store.is.autonavi.com/showpic/8c90c16ad105bb2741e17f90b86d9772',
    '国家博物馆': 'https://store.is.autonavi.com/showpic/2c185437d105bb2741e17f90b86d970f',
    '天安门': 'https://store.is.autonavi.com/showpic/0183e45bd105bb2741e17f90b86d9737',
    '圆明园': 'https://store.is.autonavi.com/showpic/4dc71a98d105bb2741e17f90b86d96da',
    '雍和宫': 'https://store.is.autonavi.com/showpic/537d2a78d105bb2741e17f90b86d96b5',
    '王府井': 'https://store.is.autonavi.com/showpic/8b748c73d105bb2741e17f90b86d970a',
    '北海公园': 'https://store.is.autonavi.com/showpic/4dc71a98d105bb2741e17f90b86d96da',
    '三里屯': 'https://store.is.autonavi.com/showpic/8b748c73d105bb2741e17f90b86d970a',
    '国贸CBD': 'https://store.is.autonavi.com/showpic/8c90c16ad105bb2741e17f90b86d9772',
    '簋街': 'https://store.is.autonavi.com/showpic/8b748c73d105bb2741e17f90b86d970a',
    '北京烤鸭': 'https://store.is.autonavi.com/showpic/cbdfd6441fa1e91708768fc96cc41456',
    '炸酱面': 'https://store.is.autonavi.com/showpic/5591c012a15aa1cc0000002832488410?type=pic',
    '铜锅涮肉': 'https://store.is.autonavi.com/showpic/cbdfd6441fa1e91708768fc96cc41456',
    '豆汁焦圈': 'https://store.is.autonavi.com/showpic/5591c012a15aa1cc0000002832488410?type=pic',
    '驴打滚': 'https://store.is.autonavi.com/showpic/5591c012a15aa1cc0000002832488410?type=pic',
    '卤煮火烧': 'https://store.is.autonavi.com/showpic/5591c012a15aa1cc0000002832488410?type=pic',
  },
  'shanghai': {
    '外滩': 'https://store.is.autonavi.com/showpic/2f968490d105bb2741e17f90b85c6b79',
    '东方明珠': 'https://store.is.autonavi.com/showpic/8c90c16ad105bb2741e17f90b86d9772',
    '豫园': 'https://store.is.autonavi.com/showpic/4dc71a98d105bb2741e17f90b86d96da',
    '田子坊': 'https://store.is.autonavi.com/showpic/8b748c73d105bb2741e17f90b86d970a',
    '上海迪士尼': 'https://store.is.autonavi.com/showpic/8c90c16ad105bb2741e17f90b86d9772',
    '武康路': 'https://store.is.autonavi.com/showpic/8b748c73d105bb2741e17f90b86d970a',
    '南京路': 'https://store.is.autonavi.com/showpic/8b748c73d105bb2741e17f90b86d970a',
    '陆家嘴': 'https://store.is.autonavi.com/showpic/8c90c16ad105bb2741e17f90b86d9772',
    '小笼包': 'https://store.is.autonavi.com/showpic/cbdfd6441fa1e91708768fc96cc41456',
    '生煎包': 'https://store.is.autonavi.com/showpic/cbdfd6441fa1e91708768fc96cc41456',
    '红烧肉': 'https://store.is.autonavi.com/showpic/cbdfd6441fa1e91708768fc96cc41456',
    '葱油拌面': 'https://store.is.autonavi.com/showpic/cbdfd6441fa1e91708768fc96cc41456',
  },
  'chengdu': {
    '宽窄巷子': 'https://store.is.autonavi.com/showpic/8b748c73d105bb2741e17f90b86d970a',
    '锦里': 'https://store.is.autonavi.com/showpic/8b748c73d105bb2741e17f90b86d970a',
    '熊猫基地': 'https://store.is.autonavi.com/showpic/8c90c16ad105bb2741e17f90b86d9772',
    '春熙路': 'https://store.is.autonavi.com/showpic/8b748c73d105bb2741e17f90b86d970a',
    '太古里': 'https://store.is.autonavi.com/showpic/8b748c73d105bb2741e17f90b86d970a',
    '杜甫草堂': 'https://store.is.autonavi.com/showpic/4dc71a98d105bb2741e17f90b86d96da',
    '武侯祠': 'https://store.is.autonavi.com/showpic/4dc71a98d105bb2741e17f90b86d96da',
    '火锅': 'https://store.is.autonavi.com/showpic/cbdfd6441fa1e91708768fc96cc41456',
    '串串香': 'https://store.is.autonavi.com/showpic/cbdfd6441fa1e91708768fc96cc41456',
    '担担面': 'https://store.is.autonavi.com/showpic/cbdfd6441fa1e91708768fc96cc41456',
  },
  'chongqing': {
    '洪崖洞': 'https://store.is.autonavi.com/showpic/8c90c16ad105bb2741e17f90b86d9772',
    '解放碑': 'https://store.is.autonavi.com/showpic/8b748c73d105bb2741e17f90b86d970a',
    '长江索道': 'https://store.is.autonavi.com/showpic/8c90c16ad105bb2741e17f90b86d9772',
    '磁器口': 'https://store.is.autonavi.com/showpic/8b748c73d105bb2741e17f90b86d970a',
    '李子坝': 'https://store.is.autonavi.com/showpic/8c90c16ad105bb2741e17f90b86d9772',
    '火锅': 'https://store.is.autonavi.com/showpic/cbdfd6441fa1e91708768fc96cc41456',
    '小面': 'https://store.is.autonavi.com/showpic/cbdfd6441fa1e91708768fc96cc41456',
    '酸辣粉': 'https://store.is.autonavi.com/showpic/cbdfd6441fa1e91708768fc96cc41456',
  },
}

export function getRealImage(name, cityId) {
  const cityImages = cityRealImages[cityId]
  if (!cityImages) return null
  
  for (const [keyword, url] of Object.entries(cityImages)) {
    if (name.includes(keyword)) {
      return url
    }
  }
  return null
}
