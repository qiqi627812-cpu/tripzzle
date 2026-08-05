import { useState, useEffect } from 'react'
import { Heart, ExternalLink, Trash2, Search, Landmark, UtensilsCrossed, Link2, BookOpen, Hotel, ShoppingBag, MapPin, Plus, Edit3, Check, X, Folder, ChevronRight, Copy, CheckCheck } from 'lucide-react'
import { getFavorites, removeFavorite, getGroups, addGroup, deleteGroup, updateFavorite, addGuideFavorite, updateGroup } from '../services/favoriteService'
import AnimalPageHero from './AnimalPageHero'

const typeIcons = {
  attraction: Landmark,
  food: UtensilsCrossed,
  link: Link2,
  guide: BookOpen,
  accommodation: Hotel,
  shopping: ShoppingBag,
  place: MapPin,
}

const typeColors = {
  attraction: 'text-trip-mint bg-trip-mint/20',
  food: 'text-trip-amber bg-trip-amber/10',
  link: 'text-trip-blue bg-trip-blue/10',
  guide: 'text-trip-blue bg-trip-blue/10',
  accommodation: 'text-trip-amber bg-trip-amber/10',
  shopping: 'text-trip-rose bg-trip-rose/10',
  place: 'text-trip-slate bg-trip-cloud',
}

const typeLabels = {
  attraction: '景点',
  food: '美食',
  link: '链接',
  guide: '攻略',
  accommodation: '住宿',
  shopping: '购物',
  place: '地点',
}

const groupColors = {
  coral: 'bg-trip-amber text-white',
  teal: 'bg-trip-mint text-white',
  amber: 'bg-trip-amber text-white',
  purple: 'bg-trip-blue text-white',
  blue: 'bg-trip-blue text-white',
  mint: 'bg-trip-mint text-white',
}

function getSafeUrl(url) {
  if (!url) return '#'
  const trimmed = url.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  return 'https://' + trimmed
}

function getDomain(url) {
  try {
    const safeUrl = getSafeUrl(url)
    return new URL(safeUrl).hostname
  } catch (e) {
    return url
  }
}

function getFavicon(url) {
  const domain = getDomain(url)
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([])
  const [groups, setGroups] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeGroupId, setActiveGroupId] = useState('g1')
  const [activeType, setActiveType] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [showAddGroup, setShowAddGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [showAddGuide, setShowAddGuide] = useState(false)
  const [newGuideUrl, setNewGuideUrl] = useState('')
  const [newGuideTitle, setNewGuideTitle] = useState('')
  const [newGuideDesc, setNewGuideDesc] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  const [editingGroupId, setEditingGroupId] = useState(null)
  const [editingGroupName, setEditingGroupName] = useState('')
  const [editingFavId, setEditingFavId] = useState(null)
  const [editFavName, setEditFavName] = useState('')
  const [editFavUrl, setEditFavUrl] = useState('')
  const [editFavDesc, setEditFavDesc] = useState('')
  const [editFavGroupId, setEditFavGroupId] = useState('')

  useEffect(() => {
    setFavorites(getFavorites())
    setGroups(getGroups())
  }, [])

  const handleRemove = (id) => {
    removeFavorite(id)
    setFavorites(getFavorites())
  }

  const handleEditGroup = (group) => {
    setEditingGroupId(group.id)
    setEditingGroupName(group.name)
  }

  const handleSaveGroupEdit = (groupId) => {
    if (editingGroupName.trim()) {
      updateGroup(groupId, { name: editingGroupName.trim() })
      setGroups(getGroups())
    }
    setEditingGroupId(null)
    setEditingGroupName('')
  }

  const handleEdit = (fav) => {
    setEditingId(fav.id)
    setEditName(fav.name)
  }

  const handleSaveEdit = (id) => {
    if (editName.trim()) {
      updateFavorite(id, { name: editName.trim() })
      setFavorites(getFavorites())
    }
    setEditingId(null)
    setEditName('')
  }

  const handleEditFav = (fav) => {
    setEditingFavId(fav.id)
    setEditFavName(fav.name)
    setEditFavUrl(fav.url || '')
    setEditFavDesc(fav.description || '')
    setEditFavGroupId(fav.groupId || 'g1')
  }

  const handleSaveFavEdit = () => {
    if (!editFavName.trim()) return
    updateFavorite(editingFavId, {
      name: editFavName.trim(),
      url: editFavUrl.trim(),
      description: editFavDesc.trim(),
      groupId: editFavGroupId,
    })
    setFavorites(getFavorites())
    setEditingFavId(null)
    setEditFavName('')
    setEditFavUrl('')
    setEditFavDesc('')
    setEditFavGroupId('')
  }

  const handleAddGroup = () => {
    if (!newGroupName.trim()) return
    addGroup(newGroupName.trim())
    setGroups(getGroups())
    setNewGroupName('')
    setShowAddGroup(false)
  }

  const handleDeleteGroup = (id) => {
    deleteGroup(id)
    setGroups(getGroups())
    setFavorites(getFavorites())
    if (activeGroupId === id) {
      setActiveGroupId(getGroups()[0]?.id || 'g1')
    }
  }

  const handleAddGuide = () => {
    if (!newGuideUrl.trim()) return
    addGuideFavorite(newGuideUrl.trim(), newGuideTitle.trim() || undefined, newGuideDesc.trim())
    setFavorites(getFavorites())
    setNewGuideUrl('')
    setNewGuideTitle('')
    setNewGuideDesc('')
    setShowAddGuide(false)
  }

  const handleCopyUrl = async (fav) => {
    try {
      await navigator.clipboard.writeText(fav.url)
      setCopiedId(fav.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (e) {
      console.error('复制失败:', e)
    }
  }

  const filtered = favorites.filter(f => {
    const matchSearch = !searchTerm || f.name.includes(searchTerm) || (f.description && f.description.includes(searchTerm))
    const matchType = activeType === 'all' || f.type === activeType
    const matchGroup = activeGroupId === 'all' || f.groupId === activeGroupId
    return matchSearch && matchType && matchGroup
  })

  const groupedByType = filtered.reduce((acc, f) => {
    acc[f.type] = (acc[f.type] || []).concat(f)
    return acc
  }, {})

  const typeStats = favorites.reduce((acc, f) => {
    acc[f.type] = (acc[f.type] || 0) + 1
    return acc
  }, {})

  const currentGroup = groups.find(g => g.id === activeGroupId)
  const groupItemCount = favorites.filter(f => f.groupId === activeGroupId).length

  return (
    <div className="min-h-screen bg-trip-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <AnimalPageHero
          role="magpie"
          eyebrow="收藏喜鹊 · 灵感保管"
          title="喜欢的地点和攻略，都先收在这里"
          subtitle="喜鹊会替你整理旅行灵感，需要时随时回来翻看。"
        />
        <div className="card overflow-hidden mt-6">
          <div className="p-4 border-b border-trip-border/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-trip-amber" fill="currentColor" />
                <span className="font-bold text-lg text-trip-ink">收藏夹</span>
              </div>
              <button
                onClick={() => setShowAddGuide(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-trip-mint text-white text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                添加攻略
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-trip-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索收藏内容..."
                className="input-base w-full pl-10 pr-4 py-2 text-sm"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setActiveGroupId('all')}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeGroupId === 'all'
                    ? 'tag-coral'
                    : 'tag'
                }`}
              >
                全部 ({favorites.length})
              </button>
              {groups.map((group) => (
                <div key={group.id} className="shrink-0 flex items-center gap-1.5">
                  {editingGroupId === group.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editingGroupName}
                        onChange={(e) => setEditingGroupName(e.target.value)}
                        className="px-3 py-2 rounded-full text-sm border border-trip-mint focus:outline-none w-24"
                        autoFocus
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveGroupEdit(group.id)}
                      />
                      <button onClick={() => handleSaveGroupEdit(group.id)} className="p-2 rounded-full bg-trip-mint text-white">
                        <Check className="w-3 h-3" />
                      </button>
                      <button onClick={() => { setEditingGroupId(null); setEditingGroupName('') }} className="p-2 rounded-full bg-trip-cloud text-trip-muted">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveGroupId(group.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                        activeGroupId === group.id
                          ? `${groupColors[group.color]}`
                          : 'bg-trip-cloud text-trip-slate hover:bg-trip-mint/20'
                      }`}
                    >
                      <Folder className="w-3.5 h-3.5" />
                      {group.name}
                      {favorites.filter(f => f.groupId === group.id).length > 0 && (
                        <span className="text-xs opacity-80">({favorites.filter(f => f.groupId === group.id).length})</span>
                      )}
                      <span
                        onClick={(e) => { e.stopPropagation(); handleEditGroup(group) }}
                        className="ml-1 p-0.5 rounded hover:bg-white/20 opacity-60 hover:opacity-100 transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                      </span>
                    </button>
                  )}
                </div>
              ))}
              {!showAddGroup ? (
                <button
                  onClick={() => setShowAddGroup(true)}
                  className="shrink-0 px-4 py-2 rounded-full text-sm font-medium border border-dashed border-trip-border text-trip-muted hover:border-trip-mint hover:text-trip-mint flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  新建分组
                </button>
              ) : (
                <div className="shrink-0 flex items-center gap-1">
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="分组名称"
                    className="px-3 py-2 rounded-full text-sm border border-trip-mint focus:outline-none w-28"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && handleAddGroup()}
                  />
                  <button onClick={handleAddGroup} className="p-2 rounded-full bg-trip-mint text-white">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setShowAddGroup(false)} className="p-2 rounded-full bg-trip-cloud text-trip-muted">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {groups.length > 1 && activeGroupId !== 'all' && currentGroup && (
            <div className="px-4 py-2 bg-trip-cloud/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${groupColors[currentGroup.color].split(' ')[0]}`} />
                <span className="text-sm font-medium text-trip-ink">{currentGroup.name}</span>
              </div>
              <button
                onClick={() => handleDeleteGroup(currentGroup.id)}
                className="text-xs text-red-400 hover:text-red-500 px-2 py-1 rounded"
              >
                删除分组
              </button>
            </div>
          )}

          <div className="p-4">
            {favorites.length === 0 ? (
              <div className="empty-state">
                <Heart className="empty-state-icon" />
                <h3 className="empty-state-title">还没有收藏内容</h3>
                <p className="empty-state-desc">
                  点击右上角"添加收藏"，粘贴小红书等链接即可保存
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <Search className="empty-state-icon" />
                <p className="empty-state-desc">没有找到匹配的内容</p>
              </div>
            ) : (
              <div className="space-y-5">
                {Object.entries(groupedByType).map(([type, items]) => (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${typeColors[type] || 'text-trip-slate bg-trip-cloud'}`}>
                        {(() => {
                          const Icon = typeIcons[type] || Link2
                          return <Icon className="w-3 h-3" />
                        })()}
                      </div>
                      <span className="tag font-semibold">{typeLabels[type] || type}</span>
                      <span className="text-xs text-trip-muted">({items.length})</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {items.map((fav) => {
                        const Icon = typeIcons[fav.type] || Link2
                        const colorClass = typeColors[fav.type] || 'text-trip-slate bg-trip-cloud'
                        return (
                          <div
                            key={fav.id}
                            className="card-interactive p-3 group"
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3
                                    className="font-semibold text-trip-ink text-sm truncate cursor-pointer hover:text-trip-mint transition-colors"
                                    onClick={() => handleEditFav(fav)}
                                  >
                                    {fav.name}
                                  </h3>
                                  <button
                                    onClick={() => handleEditFav(fav)}
                                    className="p-0.5 text-trip-muted hover:text-trip-mint opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="编辑"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                </div>

                                {fav.source && (
                                  <div className="flex items-center gap-1 mb-1">
                                    <img
                                      src={getFavicon(fav.url)}
                                      alt={fav.source}
                                      className="w-3 h-3 rounded"
                                      onError={(e) => { e.target.style.display = 'none' }}
                                    />
                                    <span className="text-[10px] text-trip-muted">{fav.source}</span>
                                  </div>
                                )}

                                {fav.description && (
                                  <p className="text-xs text-trip-muted line-clamp-2 mb-2">{fav.description}</p>
                                )}

                                {fav.url && (
                                  <button
                                    onClick={() => handleCopyUrl(fav)}
                                    className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg bg-trip-mint/10 text-trip-mint text-xs font-medium hover:bg-trip-mint/20 transition-colors"
                                  >
                                    {copiedId === fav.id ? (
                                      <>
                                        <CheckCheck className="w-3 h-3" />
                                        已复制
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" />
                                        复制链接
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                              <button
                                onClick={() => handleRemove(fav.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-trip-muted hover:text-red-500 transition-colors shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {showAddGuide && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md">
              <div className="p-4 border-b border-trip-border/30 flex items-center justify-between">
                <h3 className="font-semibold text-trip-ink">添加攻略链接</h3>
                <button onClick={() => setShowAddGuide(false)} className="p-2 rounded-lg hover:bg-trip-cloud text-trip-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-trip-slate mb-1.5">攻略链接</label>
                  <input
                    type="url"
                    value={newGuideUrl}
                    onChange={(e) => setNewGuideUrl(e.target.value)}
                    placeholder="粘贴小红书/马蜂窝等攻略链接"
                    className="input-base w-full"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-trip-slate mb-1.5">自定义标题</label>
                  <input
                    type="text"
                    value={newGuideTitle}
                    onChange={(e) => setNewGuideTitle(e.target.value)}
                    placeholder="默认使用链接标题"
                    className="input-base w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-trip-slate mb-1.5">简介</label>
                  <textarea
                    value={newGuideDesc}
                    onChange={(e) => setNewGuideDesc(e.target.value)}
                    placeholder="简单描述这个攻略的内容"
                    rows={3}
                    className="input-base w-full resize-none"
                  />
                </div>
              </div>
              <div className="p-4 border-t border-trip-border/30 flex gap-2">
                <button onClick={() => setShowAddGuide(false)} className="flex-1 py-3 rounded-xl btn-secondary">
                  取消
                </button>
                <button onClick={handleAddGuide} disabled={!newGuideUrl.trim()} className="flex-1 py-3 rounded-xl btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                  添加收藏
                </button>
              </div>
            </div>
          </div>
        )}

        {editingFavId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md">
              <div className="p-4 border-b border-trip-border/30 flex items-center justify-between">
                <h3 className="font-semibold text-trip-ink">编辑收藏</h3>
                <button onClick={() => setEditingFavId(null)} className="p-2 rounded-lg hover:bg-trip-cloud text-trip-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-trip-slate mb-1.5">标题</label>
                  <input
                    type="text"
                    value={editFavName}
                    onChange={(e) => setEditFavName(e.target.value)}
                    placeholder="收藏标题"
                    className="input-base w-full"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-trip-slate mb-1.5">链接</label>
                  <input
                    type="url"
                    value={editFavUrl}
                    onChange={(e) => setEditFavUrl(e.target.value)}
                    placeholder="链接地址"
                    className="input-base w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-trip-slate mb-1.5">简介</label>
                  <textarea
                    value={editFavDesc}
                    onChange={(e) => setEditFavDesc(e.target.value)}
                    placeholder="简单描述"
                    rows={3}
                    className="input-base w-full resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-trip-slate mb-1.5">分组</label>
                  <select
                    value={editFavGroupId}
                    onChange={(e) => setEditFavGroupId(e.target.value)}
                    className="input-base w-full"
                  >
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-4 border-t border-trip-border/30 flex gap-2">
                <button onClick={() => setEditingFavId(null)} className="flex-1 py-3 rounded-xl btn-secondary">
                  取消
                </button>
                <button onClick={handleSaveFavEdit} disabled={!editFavName.trim()} className="flex-1 py-3 rounded-xl btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
