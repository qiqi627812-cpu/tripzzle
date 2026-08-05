import { useState } from 'react'
import { Plane, TrainFront, Plus, X, Edit3, Trash2, Clock, MapPin } from 'lucide-react'

const STORAGE_KEY = 'tripzzle_transport_segments'

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
  } catch (e) {}
}

export function getTransportSegments(cityId) {
  return loadAll().filter(s => s.cityId === cityId)
}

export default function TransportModule({ cityId, cityName, segments, onChange }) {
  const [editing, setEditing] = useState(false)
  const [editingIndex, setEditingIndex] = useState(-1)
  const [formData, setFormData] = useState(getEmptyForm())

  function getEmptyForm() {
    return {
      type: 'flight',
      number: '',
      from: '',
      to: '',
      date: new Date().toISOString().split('T')[0],
      departTime: '',
      arriveTime: '',
      seat: '',
      cabin: '',
      notes: '',
    }
  }

  const startAdd = () => {
    setFormData({ ...getEmptyForm(), cityId })
    setEditingIndex(-1)
    setEditing(true)
  }

  const startEdit = (idx) => {
    setFormData({ ...segments[idx] })
    setEditingIndex(idx)
    setEditing(true)
  }

  const handleSave = () => {
    if (!formData.number || !formData.from || !formData.to || !formData.departTime || !formData.arriveTime) return
    const newList = [...segments]
    if (editingIndex >= 0) {
      newList[editingIndex] = formData
    } else {
      newList.push({ ...formData, id: `seg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` })
    }
    onChange(newList)
    saveAll([...loadAll().filter(s => s.cityId !== cityId), ...newList])
    setEditing(false)
    setEditingIndex(-1)
  }

  const handleDelete = (idx) => {
    const newList = segments.filter((_, i) => i !== idx)
    onChange(newList)
    saveAll([...loadAll().filter(s => s.cityId !== cityId), ...newList])
  }

  return (
    <div className="card-flat overflow-hidden">
      <div className="p-4 border-b border-trip-border/30 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-trip-ink flex items-center gap-2">
            <Plane className="w-4 h-4 text-trip-amber" />
            航班 / 火车
          </h3>
          <p className="text-xs text-trip-muted mt-0.5">添加交通段，行程生成时会自动衔接</p>
        </div>
        <button
          onClick={startAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-trip-amber/10 text-trip-amber text-sm font-medium hover:bg-trip-amber/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          添加
        </button>
      </div>

      <div className="p-4">
        {segments.length === 0 ? (
          <div className="text-center py-6 text-trip-muted text-sm">
            还没有添加航班或火车
          </div>
        ) : (
          <div className="space-y-2">
            {segments.map((seg, idx) => (
              <div key={seg.id || idx} className="flex items-center gap-3 p-3 rounded-xl bg-trip-cloud/50 border border-trip-border/30 group">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  seg.type === 'flight' ? 'bg-trip-fog-pale text-trip-slate' : 'bg-trip-fog-pale text-trip-slate'
                }`}>
                  {seg.type === 'flight' ? <Plane className="w-4 h-4" /> : <TrainFront className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-trip-ink">{seg.number}</span>
                    <span className="text-xs text-trip-muted">·</span>
                    <span className="text-xs text-trip-slate">{seg.date}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="font-mono font-semibold text-trip-ink">{seg.departTime}</span>
                    <span className="text-trip-muted">{seg.from}</span>
                    <span className="text-trip-muted">→</span>
                    <span className="font-mono font-semibold text-trip-ink">{seg.arriveTime}</span>
                    <span className="text-trip-muted">{seg.to}</span>
                  </div>
                  {seg.seat && (
                    <div className="text-xs text-trip-muted mt-0.5">
                      座位：{seg.seat}{seg.cabin && ` · ${seg.cabin}`}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(idx)}
                    className="p-1.5 rounded-lg hover:bg-trip-cloud text-trip-muted hover:text-trip-mint"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(idx)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-trip-muted hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-trip-border/30 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-semibold text-trip-ink">{editingIndex >= 0 ? '编辑' : '添加'}{formData.type === 'flight' ? '航班' : '火车'}</h3>
              <button onClick={() => setEditing(false)} className="p-2 rounded-lg hover:bg-trip-cloud text-trip-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFormData(prev => ({ ...prev, type: 'flight' }))}
                  className={`py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 ${
                    formData.type === 'flight' ? 'bg-sky-500 text-white' : 'bg-trip-cloud text-trip-slate'
                  }`}
                >
                  <Plane className="w-4 h-4" />
                  航班
                </button>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, type: 'train' }))}
                  className={`py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 ${
                    formData.type === 'train' ? 'bg-indigo-500 text-white' : 'bg-trip-cloud text-trip-slate'
                  }`}
                >
                  <TrainFront className="w-4 h-4" />
                  火车
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-trip-slate mb-1.5">
                  {formData.type === 'flight' ? '航班号' : '车次'}
                </label>
                <input
                  type="text"
                  value={formData.number}
                  onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                  placeholder={formData.type === 'flight' ? '如：CA1234' : '如：G1234'}
                  className="input-base w-full px-4 py-2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-trip-slate mb-1.5">出发城市/车站</label>
                <input
                  type="text"
                  value={formData.from}
                  onChange={(e) => setFormData(prev => ({ ...prev, from: e.target.value }))}
                  placeholder="如：上海"
                  className="input-base w-full px-4 py-2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-trip-slate mb-1.5">到达城市/车站</label>
                <input
                  type="text"
                  value={formData.to}
                  onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
                  placeholder="如：北京"
                  className="input-base w-full px-4 py-2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-trip-slate mb-1.5">日期</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="input-base w-full px-4 py-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-trip-slate mb-1.5">出发时间</label>
                  <input
                    type="time"
                    value={formData.departTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, departTime: e.target.value }))}
                    className="input-base w-full px-4 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-trip-slate mb-1.5">到达时间</label>
                  <input
                    type="time"
                    value={formData.arriveTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, arriveTime: e.target.value }))}
                    className="input-base w-full px-4 py-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-trip-slate mb-1.5">座位号（可选）</label>
                <input
                  type="text"
                  value={formData.seat}
                  onChange={(e) => setFormData(prev => ({ ...prev, seat: e.target.value }))}
                  placeholder="如：26F 26E"
                  className="input-base w-full px-4 py-2.5"
                />
              </div>

              {formData.type === 'train' && (
                <div>
                  <label className="block text-sm font-medium text-trip-slate mb-1.5">车厢（可选）</label>
                  <input
                    type="text"
                    value={formData.cabin}
                    onChange={(e) => setFormData(prev => ({ ...prev, cabin: e.target.value }))}
                    placeholder="如：Class 2, 3号车厢"
                    className="input-base w-full px-4 py-2.5"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-trip-slate mb-1.5">备注（可选）</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="如：网上买的票无需check in"
                  className="input-base w-full px-4 py-2.5"
                />
              </div>
            </div>
            <div className="p-4 border-t border-trip-border/30 flex gap-2">
              <button onClick={() => setEditing(false)} className="flex-1 btn-secondary py-3">
                取消
              </button>
              <button onClick={handleSave} className="flex-1 btn-primary py-3">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
