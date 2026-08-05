import { useState, useEffect } from 'react'
import { Check, Shirt, Droplets, Smartphone, Briefcase, Heart, CheckCircle, Plus, X, Baby, Users, Coffee, Camera, Pencil } from 'lucide-react'

const baseCategories = [
  {
    key: 'clothes',
    label: '衣物',
    icon: Shirt,
    color: 'mint',
    items: [
      '短袖上衣 x3',
      '长裤/短裤 x2',
      '内衣袜子 x5',
      '外套/风衣',
      '舒适运动鞋',
      '拖鞋/凉鞋',
      '睡衣',
    ],
  },
  {
    key: 'toiletries',
    label: '洗漱护肤',
    icon: Droplets,
    color: 'coral',
    items: [
      '牙刷牙膏',
      '洗面奶',
      '护肤品套装',
      '防晒霜',
      '化妆品',
      '毛巾',
      '剃须刀',
    ],
  },
  {
    key: 'electronics',
    label: '电子设备',
    icon: Smartphone,
    color: 'purple',
    items: [
      '手机 + 充电器',
      '充电宝',
      '耳机',
      '相机 + 电池',
      '转换插头',
      '数据线',
    ],
  },
  {
    key: 'documents',
    label: '证件钱包',
    icon: Briefcase,
    color: 'amber',
    items: [
      '身份证',
      '现金/银行卡',
      '酒店预订信息',
      '机票/车票',
    ],
  },
  {
    key: 'health',
    label: '药品健康',
    icon: Heart,
    color: 'rose',
    items: [
      '感冒药',
      '肠胃药',
      '创可贴',
      '晕车药',
      '免洗消毒液',
    ],
  },
]

const peopleExtras = {
  '情侣': {
    clothes: ['情侣装/搭配衣服', '墨镜'],
    toiletries: ['香水', '小礼物'],
    electronics: ['自拍杆/三脚架'],
    documents: [],
    health: [],
    extra: [
      { key: 'romantic', label: '浪漫加分', icon: Heart, color: 'rose', items: ['小惊喜礼物', '餐厅预订', '拍立得相机'] }
    ],
  },
  '闺蜜': {
    clothes: ['闺蜜装', '好看的裙子 x2', '拍照配饰'],
    toiletries: ['面膜', '美甲套装', '香水'],
    electronics: ['自拍杆', '补光灯', '三脚架'],
    documents: [],
    health: [],
    extra: [
      { key: 'beauty', label: '拍照装备', icon: Camera, color: 'coral', items: ['墨镜', '帽子', '拍照道具'] }
    ],
  },
  '亲子': {
    clothes: ['宝宝换洗衣物 x3', '宝宝外套', '儿童雨具', '儿童拖鞋'],
    toiletries: ['宝宝护肤品', '湿巾纸巾', '尿不湿', '儿童水杯'],
    electronics: ['儿童平板', '儿童手表'],
    documents: ['户口本/出生证明', '学生证'],
    health: ['儿童退烧药', '驱蚊液', '退热贴', '益生菌'],
    extra: [
      { key: 'baby', label: '宝宝专用', icon: Baby, color: 'mint', items: ['安抚玩具', '小毯子', '儿童餐具', '零食'] }
    ],
  },
  '独自': {
    clothes: [],
    toiletries: [],
    electronics: ['自拍杆', '便携三脚架'],
    documents: ['紧急联系人信息'],
    health: [],
    extra: [],
  },
  '家庭': {
    clothes: ['老人保暖衣物', '儿童换洗衣物'],
    toiletries: ['老人常用药', '儿童护肤品'],
    electronics: ['平板（给孩子用）'],
    documents: ['老人身份证', '户口本', '学生证/老年证'],
    health: ['降压药', '血糖仪', '儿童退烧药', '晕车药 x多份'],
    extra: [
      { key: 'family', label: '家庭必备', icon: Users, color: 'amber', items: ['便携保温杯', '雨伞 x多', '垃圾袋', '备用钥匙'] }
    ],
  },
  '朋友': {
    clothes: ['搭配拍照的衣服', '墨镜'],
    toiletries: [],
    electronics: ['蓝牙音箱', '桌游/卡牌', '三脚架'],
    documents: [],
    health: [],
    extra: [
      { key: 'fun', label: '聚会好物', icon: Coffee, color: 'purple', items: ['小零食分享', '拍照道具', '充电宝 x2'] }
    ],
  },
}

const colorMap = {
  mint: { bg: 'bg-trip-mint/15', text: 'text-trip-mint', border: 'border-trip-mint/30' },
  coral: { bg: 'bg-trip-amber/15', text: 'text-trip-amber', border: 'border-trip-amber/30' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  rose: { bg: 'bg-rose-100', text: 'text-rose-600', border: 'border-rose-200' },
}

const peopleOptions = ['情侣', '闺蜜', '亲子', '独自', '家庭', '朋友']

function buildCategories(peopleType) {
  const extras = peopleExtras[peopleType] || {}
  const result = []

  for (const baseCat of baseCategories) {
    const extraItems = extras[baseCat.key] || []
    result.push({
      ...baseCat,
      items: [...baseCat.items, ...extraItems],
    })
  }

  if (extras.extra && extras.extra.length > 0) {
    for (const extraCat of extras.extra) {
      result.push(extraCat)
    }
  }

  return result
}

const PACKING_STORAGE_KEY = 'tripzzle_packing_state'

function loadPackingState() {
  try {
    const raw = localStorage.getItem(PACKING_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to load packing state:', e)
  }
  return null
}

function savePackingState(state) {
  try {
    localStorage.setItem(PACKING_STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save packing state:', e)
  }
}

export default function PackingChecklist({ peopleType = '情侣' }) {
  const savedState = loadPackingState()
  const [activePeople, setActivePeople] = useState(savedState?.activePeople || peopleType)
  const [checked, setChecked] = useState(new Set(savedState?.checked || []))
  const [deletedItems, setDeletedItems] = useState(new Set(savedState?.deletedItems || []))
  const [customItems, setCustomItems] = useState(savedState?.customItems || {})
  const [showAdd, setShowAdd] = useState(null)
  const [newItemText, setNewItemText] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [editText, setEditText] = useState('')

  // 持久化状态到 localStorage
  useEffect(() => {
    savePackingState({
      activePeople,
      checked: Array.from(checked),
      deletedItems: Array.from(deletedItems),
      customItems,
    })
  }, [activePeople, checked, deletedItems, customItems])

  const categories = buildCategories(activePeople)

  const toggleItem = (itemKey) => {
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(itemKey) ? next.delete(itemKey) : next.add(itemKey)
      return next
    })
  }

  const deleteItem = (itemKey) => {
    // 删除预设项
    setDeletedItems((prev) => new Set([...prev, itemKey]))
    // 同时从已勾选中移除
    setChecked((prev) => {
      const next = new Set(prev)
      next.delete(itemKey)
      return next
    })
  }

  const restoreItem = (itemKey) => {
    // 恢复删除的项
    setDeletedItems((prev) => {
      const next = new Set(prev)
      next.delete(itemKey)
      return next
    })
  }

  const startEdit = (catKey, itemKey, currentText) => {
    setEditingItem({ catKey, itemKey, text: currentText })
    setEditText(currentText)
  }

  const saveEdit = () => {
    if (!editingItem || !editText.trim()) return
    
    const { catKey, itemKey } = editingItem
    
    // 如果是自定义项，直接修改
    if (itemKey.startsWith('custom-')) {
      setCustomItems((prev) => ({
        ...prev,
        [catKey]: (prev[catKey] || []).map(i => 
          i.key === itemKey ? { ...i, text: editText.trim() } : i
        ),
      }))
    } else {
      // 如果是预设项，删除原项并添加为自定义项
      setDeletedItems((prev) => new Set([...prev, itemKey]))
      const newKey = `custom-${catKey}-${Date.now()}`
      setCustomItems((prev) => ({
        ...prev,
        [catKey]: [...(prev[catKey] || []), { key: newKey, text: editText.trim() }],
      }))
      // 如果原来勾选了，保持勾选状态
      if (checked.has(itemKey)) {
        setChecked((prev) => {
          const next = new Set(prev)
          next.delete(itemKey)
          next.add(newKey)
          return next
        })
      }
    }
    
    setEditingItem(null)
    setEditText('')
  }

  const cancelEdit = () => {
    setEditingItem(null)
    setEditText('')
  }

  const addCustomItem = (catKey) => {
    if (!newItemText.trim()) return
    const key = `custom-${catKey}-${Date.now()}`
    setCustomItems((prev) => ({
      ...prev,
      [catKey]: [...(prev[catKey] || []), { key, text: newItemText.trim() }],
    }))
    setNewItemText('')
    setShowAdd(null)
  }

  const removeCustomItem = (catKey, itemKey) => {
    setCustomItems((prev) => ({
      ...prev,
      [catKey]: (prev[catKey] || []).filter(i => i.key !== itemKey),
    }))
    setChecked((prev) => {
      const next = new Set(prev)
      next.delete(itemKey)
      return next
    })
  }

  const totalItems = categories.reduce((sum, c) => {
    const deletedCount = c.items.filter(item => deletedItems.has(`${c.key}-${item}`)).length
    const customCount = customItems[c.key]?.length || 0
    return sum + c.items.length - deletedCount + customCount
  }, 0)
  const checkedCount = checked.size
  const progress = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="card-flat p-6 max-w-5xl mx-auto">
        {/* 同行人切换 */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span className="text-sm font-semibold text-trip-slate shrink-0">出行类型：</span>
          <div className="flex flex-wrap gap-2">
            {peopleOptions.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setActivePeople(p)
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                  activePeople === p
                    ? 'tag-active'
                    : 'bg-trip-cloud text-trip-slate hover:bg-trip-mint/10 hover:text-trip-mint'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <div className="text-2xl font-bold text-trip-ink">
              已准备 <span className="text-trip-mint">{checkedCount}</span> / {totalItems} 项
            </div>
            <div className="text-sm text-trip-muted mt-1">
              {progress === 100 ? '🎉 全部搞定，可以出发啦！' : `还有 ${totalItems - checkedCount} 项待准备`}
            </div>
          </div>
          <div className="w-20 h-20 relative">
            <svg className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6" className="text-trip-border" />
              <circle
                cx="40" cy="40" r="34" fill="none" stroke="url(#progressGradient)" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${progress * 2.136} 213.6`}
                className="transition-all duration-500"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2DD4BF" />
                  <stop offset="100%" stopColor="#FB923C" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-lg font-black text-trip-mint">{progress}%</div>
          </div>
        </div>

        <div className="w-full h-2 bg-trip-cloud rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-trip-mint to-trip-amber rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => {
            const Icon = cat.icon
            const colors = colorMap[cat.color] || colorMap.mint
            const customList = customItems[cat.key] || []
            const allItems = [...cat.items.filter(item => !deletedItems.has(`${cat.key}-${item}`)), ...customList.map(i => i.text)]
            const catChecked = allItems.filter((_, idx) => {
              const filteredItems = cat.items.filter(item => !deletedItems.has(`${cat.key}-${item}`))
              const itemKey = idx < filteredItems.length
                ? `${cat.key}-${filteredItems[idx]}`
                : customList[idx - filteredItems.length]?.key
              return checked.has(itemKey)
            }).length

            const deletedInCat = cat.items.filter(item => deletedItems.has(`${cat.key}-${item}`))

            return (
              <div key={cat.key} className="card-flat p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${colors.bg} flex items-center justify-center`}>
                      <Icon className={`w-4.5 h-4.5 ${colors.text}`} />
                    </div>
                    <div>
                      <div className="font-bold text-trip-ink text-sm">{cat.label}</div>
                      <div className="text-xs text-trip-muted">{catChecked}/{allItems.length}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowAdd(showAdd === cat.key ? null : cat.key)
                      setNewItemText('')
                    }}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                      showAdd === cat.key ? 'bg-trip-mint text-white' : 'bg-trip-cloud text-trip-slate hover:bg-trip-mint/20 hover:text-trip-mint'
                    }`}
                    title="添加自定义项"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {showAdd === cat.key && (
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCustomItem(cat.key)}
                      placeholder="添加自定义物品..."
                      className="flex-1 text-xs px-3 py-2 rounded-lg border border-trip-border focus:outline-none focus:border-trip-mint bg-white"
                      autoFocus
                    />
                    <button
                      onClick={() => addCustomItem(cat.key)}
                      className="px-3 py-2 text-xs font-semibold rounded-lg bg-trip-mint text-white hover:bg-trip-mint transition-colors"
                    >
                      添加
                    </button>
                  </div>
                )}

                <div className="space-y-1.5">
                  {cat.items.filter(item => !deletedItems.has(`${cat.key}-${item}`)).map((item) => {
                    const id = `${cat.key}-${item}`
                    const isChecked = checked.has(id)
                    const isEditing = editingItem?.itemKey === id
                    
                    if (isEditing) {
                      return (
                        <div key={id} className="flex items-center gap-2 p-2 rounded-xl bg-trip-mint/10">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit()
                              if (e.key === 'Escape') cancelEdit()
                            }}
                            className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-trip-mint focus:outline-none bg-white"
                            autoFocus
                          />
                          <button
                            onClick={saveEdit}
                            className="w-6 h-6 rounded-lg flex items-center justify-center bg-trip-mint text-white shrink-0"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="w-6 h-6 rounded-lg flex items-center justify-center bg-trip-cloud text-trip-slate hover:bg-red-50 hover:text-red-500 shrink-0"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )
                    }
                    
                    return (
                      <div
                        key={id}
                        className={`flex items-center gap-2.5 p-2 rounded-xl text-sm transition-all group ${
                          isChecked ? 'bg-trip-mint-pale text-trip-muted' : 'hover:bg-trip-cloud text-trip-slate'
                        }`}
                      >
                        <button onClick={() => toggleItem(id)} className="flex items-center gap-2.5 flex-1 text-left">
                          <span className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                            isChecked ? 'border-trip-success bg-trip-success' : 'border-trip-border'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 text-white" />}
                          </span>
                          <span className={isChecked ? 'line-through' : ''}>{item}</span>
                        </button>
                        <button
                          onClick={() => startEdit(cat.key, id, item)}
                          className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-md flex items-center justify-center text-trip-muted hover:text-trip-mint hover:bg-trip-mint/10 transition-all shrink-0"
                          title="修改此项"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteItem(id)}
                          className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-md flex items-center justify-center text-trip-muted hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                          title="删除此项"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )
                  })}

                  {deletedInCat.length > 0 && (
                    <div className="pt-2 border-t border-trip-border/30">
                      <div className="text-xs text-trip-muted mb-2">已删除 ({deletedInCat.length})</div>
                      {deletedInCat.map((item) => {
                        const id = `${cat.key}-${item}`
                        return (
                          <div
                            key={id}
                            className="flex items-center gap-2.5 p-2 rounded-xl text-sm bg-gray-50 text-trip-muted group"
                          >
                            <span className="flex-1 line-through">{item}</span>
                            <button
                              onClick={() => restoreItem(id)}
                              className="opacity-0 group-hover:opacity-100 text-xs text-trip-mint hover:underline shrink-0"
                            >
                              恢复
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {customList.map((item) => {
                    const isChecked = checked.has(item.key)
                    const isEditing = editingItem?.itemKey === item.key
                    
                    if (isEditing) {
                      return (
                        <div key={item.key} className="flex items-center gap-2 p-2 rounded-xl bg-trip-mint/10">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit()
                              if (e.key === 'Escape') cancelEdit()
                            }}
                            className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-trip-mint focus:outline-none bg-white"
                            autoFocus
                          />
                          <button
                            onClick={saveEdit}
                            className="w-6 h-6 rounded-lg flex items-center justify-center bg-trip-mint text-white shrink-0"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="w-6 h-6 rounded-lg flex items-center justify-center bg-trip-cloud text-trip-slate hover:bg-red-50 hover:text-red-500 shrink-0"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )
                    }
                    
                    return (
                      <div
                        key={item.key}
                        className={`flex items-center gap-2.5 p-2 rounded-xl text-sm transition-all group ${
                          isChecked ? 'bg-trip-mint-pale text-trip-muted' : 'hover:bg-trip-cloud text-trip-slate'
                        }`}
                      >
                        <button onClick={() => toggleItem(item.key)} className="flex items-center gap-2.5 flex-1 text-left">
                          <span className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                            isChecked ? 'border-trip-success bg-trip-success' : 'border-trip-border'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 text-white" />}
                          </span>
                          <span className={isChecked ? 'line-through' : ''}>{item.text}</span>
                        </button>
                        <button
                          onClick={() => startEdit(cat.key, item.key, item.text)}
                          className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-md flex items-center justify-center text-trip-muted hover:text-trip-mint hover:bg-trip-mint/10 transition-all shrink-0"
                          title="修改此项"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeCustomItem(cat.key, item.key)}
                          className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-md flex items-center justify-center text-trip-muted hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {progress === 100 && (
          <div className="mt-6 p-4 rounded-xl bg-trip-success-pale text-center">
            <CheckCircle className="w-8 h-8 text-trip-success mx-auto mb-2" />
            <div className="font-bold text-trip-ink">行李全部准备就绪！</div>
            <div className="text-sm text-trip-slate mt-1">祝你旅途愉快 ✈️</div>
          </div>
        )}
      </div>
    </div>
  )
}
