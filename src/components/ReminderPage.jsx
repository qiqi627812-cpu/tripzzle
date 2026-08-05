import { useState, useEffect, useMemo } from 'react'
import {
  Calendar,
  Clock,
  MapPin,
  Edit3,
  Trash2,
  Plus,
  X,
  Check,
  Bell,
  Building2,
  Landmark,
  Coffee,
  ShoppingBag,
  Sparkles,
  CircleCheck,
  ChevronDown,
  Settings,
} from 'lucide-react'
import {
  getReminders,
  addReminder,
  updateReminder,
  removeReminder,
  toggleReminder,
  getReminderTypes,
  addReminderType,
  updateReminderType,
  deleteReminderType,
} from '../services/reminderService'
import AnimalPageHero from './AnimalPageHero'

const typeIcons = {
  attraction: Landmark,
  accommodation: Building2,
  food: Coffee,
  shopping: ShoppingBag,
  transport: MapPin,
  custom: Sparkles,
}

const typeColors = {
  attraction: 'bg-trip-amber/10 text-trip-amber',
  accommodation: 'bg-trip-blue/10 text-trip-blue',
  food: 'bg-trip-amber/10 text-trip-amber',
  shopping: 'bg-trip-mint/10 text-trip-mint',
  transport: 'bg-trip-blue/10 text-trip-blue',
  custom: 'bg-trip-slate/10 text-trip-slate',
}

export default function ReminderPage() {
  const [reminders, setReminders] = useState([])
  const [typeOptions, setTypeOptions] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [showTypeManager, setShowTypeManager] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [editingTypeValue, setEditingTypeValue] = useState(null)
  const [newTypeLabel, setNewTypeLabel] = useState('')
  const [editTypeLabel, setEditTypeLabel] = useState('')

  const [formTitle, setFormTitle] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formTime, setFormTime] = useState('')
  const [formType, setFormType] = useState('custom')
  const [formLocation, setFormLocation] = useState('')
  const [formDescription, setFormDescription] = useState('')

  useEffect(() => {
    setReminders(getReminders())
    setTypeOptions(getReminderTypes())
  }, [])

  const loadData = () => {
    setReminders(getReminders())
    setTypeOptions(getReminderTypes())
  }

  const handleAddType = () => {
    if (!newTypeLabel.trim()) return
    addReminderType(newTypeLabel.trim())
    setNewTypeLabel('')
    loadData()
  }

  const handleEditType = (value, label) => {
    setEditingTypeValue(value)
    setEditTypeLabel(label)
  }

  const handleSaveEditType = () => {
    if (!editTypeLabel.trim() || !editingTypeValue) return
    updateReminderType(editingTypeValue, editTypeLabel.trim())
    setEditingTypeValue(null)
    setEditTypeLabel('')
    loadData()
  }

  const handleDeleteType = (value) => {
    if (confirm('确定删除这个类型吗？')) {
      const success = deleteReminderType(value)
      if (!success) {
        alert('默认类型不能删除')
        return
      }
      loadData()
    }
  }

  const openAdd = () => {
    setFormTitle('')
    setFormDate('')
    setFormTime('')
    setFormType('custom')
    setFormLocation('')
    setFormDescription('')
    setEditingId(null)
    setShowAdd(true)
  }

  const openEdit = (rem) => {
    setFormTitle(rem.title)
    setFormDate(rem.date)
    setFormTime(rem.time)
    setFormType(rem.type || 'custom')
    setFormLocation(rem.location || '')
    setFormDescription(rem.description || '')
    setEditingId(rem.id)
    setShowAdd(true)
  }

  const handleSave = () => {
    if (!formTitle.trim()) return

    if (editingId) {
      updateReminder(editingId, {
        title: formTitle.trim(),
        date: formDate,
        time: formTime,
        type: formType,
        typeLabel: typeOptions.find(t => t.value === formType)?.label || '自定义',
        location: formLocation.trim(),
        description: formDescription.trim(),
      })
    } else {
      addReminder({
        title: formTitle.trim(),
        date: formDate,
        time: formTime,
        type: formType,
        typeLabel: typeOptions.find(t => t.value === formType)?.label || '自定义',
        location: formLocation.trim(),
        description: formDescription.trim(),
      })
    }

    loadData()
    setShowAdd(false)
  }

  const handleToggle = (id) => {
    toggleReminder(id)
    loadData()
  }

  const handleDelete = (id) => {
    if (confirm('确定删除这个预约提醒吗？')) {
      removeReminder(id)
      loadData()
    }
  }

  const filtered = useMemo(() => {
    if (filter === 'all') return reminders
    if (filter === 'pending') return reminders.filter(r => !r.completed)
    if (filter === 'completed') return reminders.filter(r => r.completed)
    return reminders.filter(r => r.type === filter)
  }, [reminders, filter])

  const grouped = useMemo(() => {
    const groups = {}
    filtered.forEach(r => {
      const key = r.date || '未设置日期'
      if (!groups[key]) groups[key] = []
      groups[key].push(r)
    })
    return groups
  }, [filtered])

  const pendingCount = reminders.filter(r => !r.completed).length
  const completedCount = reminders.filter(r => r.completed).length

  return (
    <div className="min-h-screen bg-trip-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <AnimalPageHero
          role="rabbit"
          eyebrow="提醒兔子 · 守时值班"
          title="门票、预约和出发时间，一个都不错过"
          subtitle="把重要时间交给兔子，到点前记得提醒你。"
        />
      </div>
      <div className="bg-[#fffdf8]/95 sticky top-16 z-10 border-b border-trip-border/30 mt-6 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-trip-ink">预约提醒</h1>
              <p className="text-sm text-trip-muted mt-1">{pendingCount} 项待办</p>
            </div>
            <button
              onClick={openAdd}
              className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              添加
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
            {[
              { value: 'all', label: '全部' },
              { value: 'pending', label: '待办' },
              { value: 'completed', label: '已完成' },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  filter === tab.value
                    ? 'tag-coral'
                    : 'tag'
                }`}
              >
                {tab.label}
                <span className="ml-1 opacity-70">
                  {tab.value === 'all' ? reminders.length : tab.value === 'pending' ? pendingCount : completedCount}
                </span>
              </button>
            ))}
            <div className="w-px h-6 bg-trip-border/50 self-center" />
            {typeOptions.map(type => (
              <button
                key={type.value}
                onClick={() => setFilter(type.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  filter === type.value
                    ? 'tag-coral'
                    : 'tag'
                }`}
              >
                {type.label}
              </button>
            ))}
            <button
              onClick={() => setShowTypeManager(true)}
              className="p-1.5 rounded-full bg-trip-cloud text-trip-muted hover:text-trip-slate transition-colors"
              title="管理类型"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 pb-24">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon-wrap">
              <Bell className="w-8 h-8 text-trip-muted" />
            </div>
            <h3 className="empty-state-title">还没有预约提醒</h3>
            <p className="empty-state-desc">添加景点、住宿、交通等预约，集中管理</p>
            <button
              onClick={openAdd}
              className="btn-primary inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              添加第一个预约
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-trip-amber" />
                  <h2 className="text-sm font-semibold text-trip-ink">{date}</h2>
                  <span className="text-xs text-trip-muted">{items.length} 项</span>
                </div>

                <div className="space-y-2">
                  {items.map(rem => {
                    const IconComp = typeIcons[rem.type] || Sparkles
                    const colorCls = typeColors[rem.type] || typeColors.custom

                    return (
                      <div
                        key={rem.id}
                        className={`card p-4 group ${
                          rem.completed ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleToggle(rem.id)}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                              rem.completed
                                ? 'bg-trip-mint border-trip-mint text-white'
                                : 'border-trip-border hover:border-trip-mint'
                            }`}
                          >
                            {rem.completed && <CircleCheck className="w-3.5 h-3.5" />}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3
                                    className={`font-medium text-trip-ink ${
                                      rem.completed ? 'line-through text-trip-muted' : ''
                                    }`}
                                  >
                                    {rem.title}
                                  </h3>
                                  <span className="tag text-[10px]">
                                    {rem.typeLabel || '自定义'}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3 mt-1.5 text-xs text-trip-muted">
                                  {rem.time && (
                                    <div className="flex items-center gap-1 font-mono tabular-nums">
                                      <Clock className="w-3 h-3" />
                                      {rem.time}
                                    </div>
                                  )}
                                  {rem.location && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {rem.location}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => openEdit(rem)}
                                  className="p-1.5 rounded-lg hover:bg-trip-cloud text-trip-muted hover:text-trip-slate transition-colors"
                                  title="编辑"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(rem.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-trip-muted hover:text-red-500 transition-colors"
                                  title="删除"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {rem.description && (
                              <div className="mt-2 p-2.5 card-flat">
                                <p className="text-xs text-trip-slate whitespace-pre-wrap">{rem.description}</p>
                              </div>
                            )}
                          </div>
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

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-trip-border/30 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-semibold text-trip-ink">
                {editingId ? '编辑预约提醒' : '添加预约提醒'}
              </h3>
              <button onClick={() => setShowAdd(false)} className="p-2 rounded-lg hover:bg-trip-cloud text-trip-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-trip-slate mb-1.5">标题 *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="例如：故宫博物院预约"
                  className="input-base w-full"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-trip-slate mb-1.5">类型</label>
                <div className="flex flex-wrap gap-2">
                  {typeOptions.map(type => {
                    const IconComp = typeIcons[type.value] || Sparkles
                    return (
                      <button
                        key={type.value}
                        onClick={() => setFormType(type.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                          formType === type.value
                            ? 'tag-coral'
                            : 'tag'
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                        {type.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-trip-slate mb-1.5">日期</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="input-base w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-trip-slate mb-1.5">时间</label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="input-base w-full font-mono tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-trip-slate mb-1.5">地点</label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="例如：东城区景山前街4号"
                  className="input-base w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-trip-slate mb-1.5">
                  备注（预约链接、公众号、预订信息等）
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="可以粘贴预约链接，或记下预订确认号、公众号名称等"
                  rows={4}
                  className="input-base w-full resize-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-trip-border/30 flex gap-2 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 py-3 rounded-xl btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={!formTitle.trim()}
                className="flex-1 py-3 rounded-xl btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingId ? '保存修改' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 类型管理弹窗 */}
      {showTypeManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-trip-border/30 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-semibold text-trip-ink">管理预约类型</h3>
              <button onClick={() => setShowTypeManager(false)} className="p-2 rounded-lg hover:bg-trip-cloud text-trip-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* 添加新类型 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTypeLabel}
                  onChange={(e) => setNewTypeLabel(e.target.value)}
                  placeholder="输入新类型名称"
                  className="input-base flex-1 text-sm"
                />
                <button
                  onClick={handleAddType}
                  disabled={!newTypeLabel.trim()}
                  className="btn-primary px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
                >
                  添加
                </button>
              </div>

              {/* 类型列表 */}
              <div className="space-y-2">
                {typeOptions.map(type => {
                  const IconComp = typeIcons[type.value] || Sparkles
                  const isDefault = ['custom', 'attraction', 'accommodation', 'food', 'shopping', 'transport'].includes(type.value)
                  const isEditing = editingTypeValue === type.value

                  return (
                    <div key={type.value} className="flex items-center gap-2 p-2.5 bg-trip-cloud/50 rounded-xl">
                      <IconComp className="w-4 h-4 text-trip-slate" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={editTypeLabel}
                          onChange={(e) => setEditTypeLabel(e.target.value)}
                          className="flex-1 px-2 py-1 rounded-lg border border-trip-amber focus:ring-2 focus:ring-trip-amber/20 outline-none text-sm"
                          autoFocus
                        />
                      ) : (
                        <span className="flex-1 text-sm text-trip-ink">{type.label}</span>
                      )}

                      {isDefault && (
                        <span className="text-xs text-trip-muted bg-trip-slate/10 px-1.5 py-0.5 rounded">默认</span>
                      )}

                      <div className="flex items-center gap-1">
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleSaveEditType}
                              className="p-1 rounded hover:bg-trip-mint/20 text-trip-mint"
                              title="保存"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingTypeValue(null)
                                setEditTypeLabel('')
                              }}
                              className="p-1 rounded hover:bg-trip-cloud text-trip-muted"
                              title="取消"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditType(type.value, type.label)}
                              className="p-1 rounded hover:bg-trip-amber/20 text-trip-muted hover:text-trip-amber"
                              title="编辑"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {!isDefault && (
                              <button
                                onClick={() => handleDeleteType(type.value)}
                                className="p-1 rounded hover:bg-red-50 text-trip-muted hover:text-red-500"
                                title="删除"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <p className="text-xs text-trip-muted text-center mt-4">
                默认类型不可删除，但可修改名称
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
