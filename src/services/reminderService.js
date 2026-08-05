const STORAGE_KEY = 'tripzzle_reminders'
const TYPES_KEY = 'tripzzle_reminder_types'

const DEFAULT_TYPES = [
  { value: 'custom', label: '自定义' },
  { value: 'attraction', label: '景点' },
  { value: 'accommodation', label: '住宿' },
  { value: 'food', label: '餐饮' },
  { value: 'shopping', label: '购物' },
  { value: 'transport', label: '交通' },
]

export function getReminderTypes() {
  try {
    const raw = localStorage.getItem(TYPES_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_TYPES
  } catch (e) {
    return DEFAULT_TYPES
  }
}

export function saveReminderTypes(types) {
  try {
    localStorage.setItem(TYPES_KEY, JSON.stringify(types))
    return true
  } catch (e) {
    console.warn('类型保存失败:', e)
    return false
  }
}

export function addReminderType(label) {
  const types = getReminderTypes()
  const value = `type-${Date.now()}`
  types.push({ value, label })
  saveReminderTypes(types)
  return { value, label }
}

export function updateReminderType(value, newLabel) {
  const types = getReminderTypes()
  const idx = types.findIndex(t => t.value === value)
  if (idx !== -1) {
    types[idx].label = newLabel
    saveReminderTypes(types)
    return true
  }
  return false
}

export function deleteReminderType(value) {
  if (['custom', 'attraction', 'accommodation', 'food', 'shopping', 'transport'].includes(value)) {
    return false
  }
  const types = getReminderTypes().filter(t => t.value !== value)
  saveReminderTypes(types)
  return true
}

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

function saveAll(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.warn('预约提醒保存失败:', e)
  }
}

export function getReminders() {
  const list = loadAll()
  return list.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    const dateA = new Date(a.date + ' ' + (a.time || '00:00'))
    const dateB = new Date(b.date + ' ' + (b.time || '00:00'))
    return dateA - dateB
  })
}

export function addReminder(reminder) {
  const list = loadAll()
  const newReminder = {
    id: `rem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: reminder.title,
    date: reminder.date,
    time: reminder.time || '',
    description: reminder.description || '',
    type: reminder.type || 'custom',
    typeLabel: reminder.typeLabel || '自定义',
    location: reminder.location || '',
    completed: false,
    createdAt: Date.now(),
  }
  list.push(newReminder)
  saveAll(list)
  return newReminder
}

export function updateReminder(id, updates) {
  const list = loadAll()
  const idx = list.findIndex(r => r.id === id)
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates }
    saveAll(list)
    return true
  }
  return false
}

export function removeReminder(id) {
  const list = loadAll().filter(r => r.id !== id)
  saveAll(list)
  return true
}

export function toggleReminder(id) {
  const list = loadAll()
  const idx = list.findIndex(r => r.id === id)
  if (idx !== -1) {
    list[idx].completed = !list[idx].completed
    saveAll(list)
    return list[idx]
  }
  return null
}

export function addRemindersFromItinerary(itinerary, destinationId) {
  const list = loadAll()
  let count = 0

  itinerary.forEach((day, dayIdx) => {
    day.items?.forEach((item) => {
      if (item.type === 'attraction' || item.type === 'accommodation') {
        const reminder = {
          id: `rem-it-${Date.now()}-${dayIdx}-${item.id}`,
          title: item.name,
          date: day.date || '',
          time: item.startTime || '',
          description: item.description || '',
          type: item.type,
          typeLabel: item.typeLabel || (item.type === 'attraction' ? '景点' : '住宿'),
          location: item.area || item.location || '',
          completed: false,
          source: 'itinerary',
          createdAt: Date.now(),
        }

        if (!list.some(r => r.title === reminder.title && r.date === reminder.date)) {
          list.push(reminder)
          count++
        }
      }
    })
  })

  saveAll(list)
  return count
}
