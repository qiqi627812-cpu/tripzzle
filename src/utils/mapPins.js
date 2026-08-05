export function buildPinsFromItinerary(days, options = {}) {
  const { onlyCurrentDay, currentDayIndex } = options
  const pins = []

  days.forEach((day, dayIdx) => {
    if (onlyCurrentDay && dayIdx !== currentDayIndex) return

    const items = Array.isArray(day) ? day : (day.items || [])
    items.forEach((item, itemIdx) => {
      if (item.isTransport || item.type === 'transport') return

      if (item.lat && item.lng && !isNaN(item.lat) && !isNaN(item.lng)) {
        pins.push({
          id: item.id || `${dayIdx}-${itemIdx}`,
          name: item.name,
          type: item.type,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lng),
          address: item.address || item.location || '',
          day: dayIdx + 1,
          time: item.time || '',
          isCustom: item.isCustom || false,
        })
      }
    })
  })

  return pins
}

export function projectPinsToMockMap(pins) {
  const validPins = pins.filter(p => p.lat && p.lng && !isNaN(p.lat) && !isNaN(p.lng))
  if (validPins.length === 0) return []

  let minLat = Infinity, maxLat = -Infinity
  let minLng = Infinity, maxLng = -Infinity

  validPins.forEach(p => {
    if (p.lat < minLat) minLat = p.lat
    if (p.lat > maxLat) maxLat = p.lat
    if (p.lng < minLng) minLng = p.lng
    if (p.lng > maxLng) maxLng = p.lng
  })

  const padding = 0.1
  const latRange = maxLat - minLat || 1
  const lngRange = maxLng - minLng || 1
  const paddedMinLat = minLat - latRange * padding
  const paddedMaxLat = maxLat + latRange * padding
  const paddedMinLng = minLng - lngRange * padding
  const paddedMaxLng = maxLng + lngRange * padding

  return validPins.map(p => {
    const x = ((p.lng - paddedMinLng) / (paddedMaxLng - paddedMinLng)) * 100
    const y = 100 - ((p.lat - paddedMinLat) / (paddedMaxLat - paddedMinLat)) * 100
    return {
      ...p,
      left: `${Math.max(5, Math.min(95, x))}%`,
      top: `${Math.max(5, Math.min(95, y))}%`,
    }
  })
}

export function buildDayRoutes(pins) {
  const routes = []
  const pinsByDay = {}

  pins.forEach(p => {
    if (!pinsByDay[p.day]) pinsByDay[p.day] = []
    pinsByDay[p.day].push(p)
  })

  Object.keys(pinsByDay).forEach(day => {
    const dayPins = pinsByDay[day].sort((a, b) => 
      (a.time || '00:00').localeCompare(b.time || '00:00')
    )
    const validPins = dayPins.filter(p => 
      (p.lat && p.lng && !isNaN(p.lat) && !isNaN(p.lng)) || 
      (p.left && p.top)
    )
    if (validPins.length >= 2) {
      routes.push({
        day: parseInt(day),
        path: validPins.map(p => {
          if (p.left && p.top) {
            return [parseFloat(p.left), parseFloat(p.top)]
          }
          return [p.lng, p.lat]
        }),
      })
    }
  })

  return routes
}
