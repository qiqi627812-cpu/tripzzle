import { getDestinationById } from '../data/destinations.js'

export function parseItinerary(text, destinationId) {
  const destination = getDestinationById(destinationId)
  if (!destination) {
    return { success: false, error: '未知目的地' }
  }

  const result = {
    success: true,
    days: [],
    parsedItems: [],
  }

  const lines = text.split(/[；;。\n]/).filter((line) => line.trim())
  
  let currentDay = 1
  const dayPlans = {}

  lines.forEach((line) => {
    const dayMatch = line.match(/(第[一二三四五六七八九十\d]+天)/)
    if (dayMatch) {
      const dayNum = parseDayNumber(dayMatch[1])
      if (dayNum) {
        currentDay = dayNum
      }
    }

    if (!dayPlans[currentDay]) {
      dayPlans[currentDay] = {
        attractions: [],
        food: [],
        accommodation: [],
        transport: [],
      }
    }

    const dayPlan = dayPlans[currentDay]

    dayPlan.attractions.push(...matchAttractions(line, destination))
    dayPlan.food.push(...matchFood(line, destination))
    dayPlan.accommodation.push(...matchAccommodation(line, destination))
  })

  Object.keys(dayPlans)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach((dayNum) => {
      const plan = dayPlans[dayNum]
      const dayItems = []

      if (plan.attractions.length > 0) {
        dayItems.push(...plan.attractions.map((item) => ({ ...item, type: 'attraction', typeLabel: '景点' })))
      }
      if (plan.food.length > 0) {
        dayItems.push(...plan.food.map((item) => ({ ...item, type: 'food', typeLabel: '美食' })))
      }
      if (plan.accommodation.length > 0) {
        dayItems.push(...plan.accommodation.map((item) => ({ ...item, type: 'accommodation', typeLabel: '住宿' })))
      }

      result.days.push({
        day: parseInt(dayNum),
        items: dayItems,
      })
    })

  return result
}

function parseDayNumber(dayStr) {
  const numMap = {
    '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
    '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
  }
  
  const match = dayStr.match(/第([一二三四五六七八九十\d]+)天/)
  if (match) {
    const numStr = match[1]
    if (!isNaN(numStr)) {
      return parseInt(numStr)
    }
    return numMap[numStr] || null
  }
  return null
}

function matchAttractions(text, destination) {
  const attractions = destination.pool?.attractions || []
  const matched = []
  
  attractions.forEach((attraction) => {
    if (text.includes(attraction.name) || 
        attraction.name.includes(text.substring(0, 4)) ||
        text.includes(attraction.name.replace(/[（）]/g, ''))) {
      if (!matched.find((m) => m.id === attraction.id)) {
        matched.push(attraction)
      }
    }
  })

  return matched
}

function matchFood(text, destination) {
  const foodItems = destination.pool?.food || []
  const matched = []
  
  foodItems.forEach((food) => {
    if (text.includes(food.name) || 
        text.includes(food.name.replace(/[（）]/g, ''))) {
      if (!matched.find((m) => m.id === food.id)) {
        matched.push(food)
      }
    }
  })

  return matched
}

function matchAccommodation(text, destination) {
  const accommodation = destination.pool?.accommodation || []
  const matched = []
  
  accommodation.forEach((acc) => {
    if (text.includes(acc.name) || 
        text.includes(acc.area) ||
        acc.name.includes(text.substring(0, 4))) {
      if (!matched.find((m) => m.id === acc.id)) {
        matched.push(acc)
      }
    }
  })

  return matched
}

export function validateItinerary(parsedResult) {
  const errors = []
  
  parsedResult.days.forEach((day) => {
    if (day.items.length === 0) {
      errors.push(`第${day.day}天没有解析到任何活动`)
    }
  })

  if (parsedResult.days.length === 0) {
    errors.push('未解析到任何行程安排')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
