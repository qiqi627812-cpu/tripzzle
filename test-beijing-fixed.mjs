import { generateItinerary } from './src/services/itineraryService.js'
import { getDestinationById } from './src/data/destinations.js'

async function testBeijing() {
  console.log('=== 案例1：北京3天 ===')
  
  const selectedItems = [
    { id: 'bj-2', name: '长城（八达岭）', type: 'attraction' },
    { id: 'bj-s2', name: '三里屯太古里', type: 'shopping' },
    { id: 'bj-s3', name: '潘家园旧货市场', type: 'shopping' },
    { id: 'bj-s1', name: '王府井步行街', type: 'shopping' },
    { id: 'bj-f1', name: '北京烤鸭', type: 'food' },
    { id: 'bj-f3', name: '铜锅涮肉', type: 'food' },
  ]
  
  const result = await generateItinerary(
    'beijing',
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
    console.log(`  mainArea: ${day.mainArea}`)
    console.log(`  项目数: ${day.items?.length || 0}`)
    day.items?.forEach(item => {
      console.log(`  - ${item.time || '??:??'} ${item.name} (${item.type})${item.isMeal ? ' [MEAL]' : ''}${item.isTransport ? ' [TRANS]' : ''}${item.mealSubtype ? ' ' + item.mealSubtype : ''}`)
    })
  })
  
  if (result.warnings) {
    console.log('\nWarnings:', result.warnings)
  }
  if (result.suggestions) {
    console.log('Suggestions:', result.suggestions)
  }
}

testBeijing().catch(console.error)
