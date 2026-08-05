import { generateItinerary } from './src/services/itineraryService.js'

async function testChongqing() {
  console.log('=== 案例3：重庆3天 ===')
  
  const selectedItems = [
    { id: 'cq-1', name: '洪崖洞', type: 'attraction' },
    { id: 'cq-2', name: '解放碑', type: 'attraction' },
    { id: 'cq-6', name: '武隆天坑', type: 'attraction' },
    { id: 'cq-f1', name: '火锅', type: 'food' },
    { id: 'cq-f2', name: '小面', type: 'food' },
  ]
  
  const result = await generateItinerary(
    'chongqing',
    selectedItems,
    { pace: 'moderate', startTime: '09:00', transport: 'subway' },
    '3天',
    null,
    []
  )
  
  const itinerary = result.itinerary || result
  console.log(`生成了 ${itinerary.length} 天行程`)
  
  itinerary.forEach((day, idx) => {
    console.log(`\n第${idx + 1}天 - ${day.theme}`)
    console.log(`  isRemoteDay: ${day.isRemoteDay}`)
    day.items?.forEach(item => {
      console.log(`  - ${item.time || '??:??'} ${item.name} (${item.type})${item.isMeal ? ' [MEAL]' : ''}${item.isTransport ? ' [TRANS]' : ''}${item.mealSubtype ? ' ' + item.mealSubtype : ''}`)
    })
  })
  
  if (result.warnings) console.log('\nWarnings:', result.warnings)
}

testChongqing().catch(console.error)
