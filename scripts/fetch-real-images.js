const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const AMAP_KEY = '942f298093937afa211f61802dbb9e87'

const destinations = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/destinations.js'), 'utf-8'))

function getRealImage(keyword, cityName) {
  try {
    const url = `https://restapi.amap.com/v3/place/text?keywords=${encodeURIComponent(keyword)}&city=${encodeURIComponent(cityName)}&output=json&key=${AMAP_KEY}&offset=1&page=1&extensions=all`
    const result = execSync(`curl -s "${url}"`, { timeout: 10000 }).toString()
    const data = JSON.parse(result)
    if (data.status === '1' && data.pois && data.pois.length > 0 && data.pois[0].photos && data.pois[0].photos.length > 0) {
      return data.pois[0].photos[0].url
    }
  } catch (e) {
    console.log(`获取 ${cityName} ${keyword} 图片失败:`, e.message)
  }
  return null
}

const cityNameMap = {
  'beijing': '北京',
  'shanghai': '上海',
  'chengdu': '成都',
  'chongqing': '重庆',
}

const imageReplacements = {}

destinations.forEach((dest) => {
  const cityName = cityNameMap[dest.id] || dest.name
  imageReplacements[dest.id] = {}

  if (dest.image) {
    const realUrl = getRealImage(dest.name, cityName)
    if (realUrl) {
      imageReplacements[dest.id]['destination'] = realUrl
      console.log(`${cityName} - 城市图: ${realUrl}`)
    }
  }
  if (dest.heroImage) {
    const realUrl = getRealImage(dest.name + ' 风景', cityName)
    if (realUrl) {
      imageReplacements[dest.id]['hero'] = realUrl
      console.log(`${cityName} - Hero图: ${realUrl}`)
    }
  }

  const pool = dest.pool || {}
  Object.keys(pool).forEach((key) => {
    pool[key].forEach((item) => {
      if (item.image && item.image.includes('trae-api-cn.mchost.guru')) {
        const realUrl = getRealImage(item.name, cityName)
        if (realUrl) {
          imageReplacements[dest.id][item.id] = realUrl
          console.log(`${cityName} - ${item.name}: ${realUrl}`)
        }
      }
    })
  })
})

console.log('\n替换完成!')
console.log(JSON.stringify(imageReplacements, null, 2))
