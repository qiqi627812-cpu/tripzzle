import { generateItinerary } from './src/services/itineraryService.js'

async function testShanghai() {
  console.log('=== 案例2：上海3天 ===')
  
  const selectedItems = [
    { id: 'sh-1', name: '外滩', type: 'attraction' },
    { id: 'sh-2', name: '东方明珠', type: 'attraction' },
    { id: 'sh-5', name: '上海迪士尼', type: 'attraction' },
    { id: 'sh-s1', name: '南京路步行街', type: 'shopping' },
    { id: 'sh-f1', name: '上海本帮菜', type: 'food' },
    { id: 'sh-f2', name: '小笼包', type: 'food' },
  ]
  
  const result = await generateItinerary(
    'shanghai',
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

testShanghai().catch(console.error)
