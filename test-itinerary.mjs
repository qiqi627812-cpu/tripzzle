import { generateItinerary } from './src/services/itineraryService.js'
import { getDestinationById } from './src/data/destinations.js'

const dest = getDestinationById('beijing')
const selected = [
  dest.attractions[0],
  dest.attractions[1],
  dest.attractions[2],
  dest.shopping[0],
]

console.log('Testing generateItinerary...')
console.log('Selected items:', selected.map(s => s.name))

try {
  const result = generateItinerary({
    destination: dest,
    selectedItems: selected,
    preferences: {
      days: 3,
      pace: 'moderate',
      startTime: '09:00',
      transport: 'subway'
    }
  })
  console.log('Result days:', result.length)
  result.forEach((day, i) => {
    console.log(`\nDay ${i+1} - ${day.theme || 'no theme'}:`)
    const items = day.items || day
    items.forEach(item => {
      console.log(`  ${item.time || '??'} - ${item.name} (${item.type}, ${item.durationMinutes || item.duration || '?'})`)
    })
  })
} catch(e) {
  console.error('ERROR:', e.message)
  console.error(e.stack)
}
