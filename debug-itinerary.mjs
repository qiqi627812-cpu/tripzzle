import { generateItinerary } from './src/services/itineraryService.js'

const beijingItems = [
  { id: 'bj-2', name: '长城（八达岭）', type: 'attraction' },
  { id: 'bj-s2', name: '三里屯太古里', type: 'shopping' },
  { id: 'bj-s3', name: '潘家园旧货市场', type: 'shopping' },
  { id: 'bj-19', name: '国贸CBD', type: 'attraction' },
  { id: 'bj-f1', name: '北京烤鸭', type: 'food' },
  { id: 'bj-f3', name: '铜锅涮肉', type: 'food' },
]

const result = await generateItinerary('beijing', beijingItems, { pace: 'moderate', startTime: '09:00', transport: 'subway' }, '3天', null, [])

console.log('Days:', result.days.length)
result.days.forEach(day => {
  console.log(`\n=== Day ${day.day} ${day.theme} (remote=${day.isRemoteDay}, fullDay=${day.isFullDay}, mainArea=${day.mainArea}) ===`)
  day.items.forEach(item => {
    console.log(`  ${item.time || '---'} | ${item.type} | ${item.name} | preferredTime=${item.preferredTime} | mealType=${item.mealType} | isMeal=${item.isMeal} | isTransport=${item.isTransport}`)
  })
})
console.log('\nRemoved:', result.removed)
console.log('Warnings:', result.warnings)
console.log('Validation passed:', result.validation.passed)
console.log('Validation errors:', result.validation.errors)
