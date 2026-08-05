import { generateItinerary } from './src/services/itineraryService.js'
import { getDestinationById } from './src/data/destinations.js'

async function test() {
  console.log('=== Test 1: 北京 3天 故宫+长城+颐和园+王府井 ===\n')
  
  const dest = getDestinationById('beijing')
  const items = [
    dest.pool.attractions.find(a => a.name.includes('故宫')),
    dest.pool.attractions.find(a => a.name.includes('长城')),
    dest.pool.attractions.find(a => a.name.includes('颐和园')),
    dest.pool.shopping.find(a => a.name.includes('王府井')),
  ].map(item => ({ ...item, type: item.type || (item.duration ? 'attraction' : 'shopping'), typeLabel: item.typeLabel || (item.duration ? '景点' : '购物') }))
  
  console.log('选中项目:', items.map(i => i.name).join(', '))
  
  const itinerary = await generateItinerary('beijing', items, {
    days: 3,
    pace: 'moderate',
    startTime: '早上 9 点',
    transport: 'subway'
  }, 3, null, [])
  
  console.log(`\n生成 ${itinerary.length} 天行程`)
  if (itinerary.warning) console.log('警告:', itinerary.warning)
  
  itinerary.forEach((day, di) => {
    console.log(`\n--- 第${di+1}天: ${day.theme} ---`)
    day.items.forEach(item => {
      console.log(`  ${item.time} [${item.typeLabel || item.type}] ${item.name} (${item.duration || (item.durationMinutes + '分钟')})`)
    })
  })
}

test().catch(e => console.error('Test failed:', e))
