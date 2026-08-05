import { getDestinationById } from './src/data/destinations.js'

const dest = getDestinationById('beijing')
console.log('北京景点数量:', dest.pool.attractions.length)
console.log('北京美食数量:', dest.pool.food.length)
console.log('北京购物数量:', dest.pool.shopping.length)

console.log('\n购物项目:')
dest.pool.shopping.forEach(item => {
  console.log(`  ${item.id}: ${item.name} - preferredTime: ${item.preferredTime}, area: ${item.area}`)
})

console.log('\n长城信息:')
const greatWall = dest.pool.attractions.find(a => a.id === 'bj-2')
console.log('  id:', greatWall.id)
console.log('  name:', greatWall.name)
console.log('  isRemote:', greatWall.isRemote)
console.log('  isFullDay:', greatWall.isFullDay)
console.log('  durationMinutes:', greatWall.durationMinutes)
console.log('  preferredTime:', greatWall.preferredTime)
console.log('  area:', greatWall.area)
