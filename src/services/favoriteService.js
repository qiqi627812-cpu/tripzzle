const STORAGE_KEY = 'tripzzle_favorites'
const GROUP_STORAGE_KEY = 'tripzzle_favorite_groups'

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
    console.warn('收藏保存失败:', e)
  }
}

function loadGroups() {
  try {
    const raw = localStorage.getItem(GROUP_STORAGE_KEY)
    return raw ? JSON.parse(raw) : [
      { id: 'g1', name: '默认分组', color: 'coral' },
    ]
  } catch (e) {
    return [{ id: 'g1', name: '默认分组', color: 'coral' }]
  }
}

function saveGroups(groups) {
  try {
    localStorage.setItem(GROUP_STORAGE_KEY, JSON.stringify(groups))
  } catch (e) {
    console.warn('分组保存失败:', e)
  }
}

export function getFavorites() {
  return loadAll()
}

export function getGroups() {
  return loadGroups()
}

export function addGroup(name, color = 'coral') {
  const groups = loadGroups()
  const newGroup = {
    id: `g${Date.now()}`,
    name,
    color,
  }
  groups.push(newGroup)
  saveGroups(groups)
  return newGroup
}

export function updateGroup(id, updates) {
  const groups = loadGroups()
  const idx = groups.findIndex(g => g.id === id)
  if (idx !== -1) {
    groups[idx] = { ...groups[idx], ...updates }
    saveGroups(groups)
  }
}

export function deleteGroup(id) {
  const groups = loadGroups()
  if (groups.length <= 1) return false
  const filtered = groups.filter(g => g.id !== id)
  saveGroups(filtered)
  
  const favorites = loadAll()
  const updated = favorites.map(f => f.groupId === id ? { ...f, groupId: filtered[0]?.id } : f)
  saveAll(updated)
  return true
}

export function addFavorite(item) {
  const list = loadAll()
  if (list.some(f => f.id === item.id)) return false
  const favorite = {
    id: item.id || `fav-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: item.name,
    description: item.description || '',
    type: item.type || 'link',
    typeLabel: item.typeLabel || '收藏',
    url: item.url || '',
    source: item.source || '',
    image: item.image || '',
    cityId: item.cityId || '',
    tags: item.tags || [],
    location: item.location || '',
    groupId: item.groupId || 'g1',
    createdAt: Date.now(),
  }
  list.unshift(favorite)
  saveAll(list)
  return true
}

export function removeFavorite(id) {
  const list = loadAll().filter(f => f.id !== id)
  saveAll(list)
  return true
}

export function isFavorited(id) {
  return loadAll().some(f => f.id === id)
}

export function toggleFavorite(item) {
  if (isFavorited(item.id)) {
    removeFavorite(item.id)
    return false
  }
  addFavorite(item)
  return true
}

export function updateFavorite(id, updates) {
  const list = loadAll()
  const idx = list.findIndex(f => f.id === id)
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates }
    saveAll(list)
    return true
  }
  return false
}

export function addGuideFavorite(url, title, description = '') {
  let cleanUrl = url.trim()
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl
  }
  
  return addFavorite({
    id: `guide-${Date.now()}`,
    name: title || url,
    description,
    type: 'guide',
    typeLabel: '攻略',
    url: cleanUrl,
    source: cleanUrl.includes('xiaohongshu') ? '小红书' : cleanUrl.includes('mafengwo') ? '马蜂窝' : cleanUrl.includes('xhslink') ? '小红书' : '网页',
  })
}
