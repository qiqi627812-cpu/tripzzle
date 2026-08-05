import { useState } from 'react'
import {
  Plane, Train, TrainFront, Bus, Car, Footprints, X, Check,
  MapPin, Clock, Armchair, DoorOpen, Route, Coins, Banknote,
  ChevronRight, Navigation
} from 'lucide-react'
import { identifyTransportCode } from '../services/transportService'

const TRANSPORT_MODE_OPTIONS = [
  { value: 'flight', label: '飞机', icon: Plane, color: 'sky' },
  { value: 'train', label: '火车', icon: Train, color: 'indigo' },
  { value: 'bus', label: '公交', icon: Bus, color: 'slate' },
  { value: 'subway', label: '地铁', icon: TrainFront, color: 'emerald' },
  { value: 'car', label: '自驾', icon: Car, color: 'amber' },
  { value: 'taxi', label: '打车', icon: Car, color: 'yellow' },
  { value: 'walk', label: '步行', icon: Footprints, color: 'green' },
]

function Field({ label, icon: Icon, children, hint }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium text-trip-slate mb-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-trip-muted" />}
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-trip-muted mt-1">{hint}</p>}
    </div>
  )
}

function Input({ value, onChange, placeholder, type: inputType = 'text', ...props }) {
  return (
    <input
      type={inputType}
      value={value || ''}
      onChange={(event) => onChange(inputType === 'number' ? (parseFloat(event.target.value) || 0) : event.target.value)}
      placeholder={placeholder}
      className="input-base w-full px-3 py-2"
      {...props}
    />
  )
}

export default function TransportEditor({
  transport,
  onSave,
  onCancel,
  onDelete,
  prevItemName = '',
  nextItemName = '',
}) {
  const [code, setCode] = useState(transport?.code || '')
  const [formData, setFormData] = useState(transport || {
    isTransport: true,
    type: 'subway',
    name: '',
    from: '',
    to: '',
    time: '',
    arriveTime: '',
    durationMinutes: 0,
    description: '',
  })

  const handleCodeChange = (val) => {
    setCode(val.toUpperCase())
    const result = identifyTransportCode(val)
    if (result) {
      setFormData(prev => ({
        ...prev,
        type: result.subtype,
        transportType: result.subtype,
        isTransport: true,
      }))
    }
  }

  const update = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    const finalData = {
      ...formData,
      isTransport: true,
      code: code || formData.code,
    }
    onSave(finalData)
  }

  const currentMode = TRANSPORT_MODE_OPTIONS.find(m => m.value === formData.type) || TRANSPORT_MODE_OPTIONS[0]
  const ModeIcon = currentMode.icon
  const type = formData.type

  return (
    <div className="card p-5 space-y-4 border-2 border-trip-amber">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-trip-amber/10 flex items-center justify-center">
            <ModeIcon className="w-4 h-4 text-trip-amber" />
          </div>
          <div>
            <h3 className="font-semibold text-trip-ink">编辑交通</h3>
            <p className="text-xs text-trip-muted">
              {prevItemName && nextItemName
                ? `${prevItemName} → ${nextItemName}`
                : '添加交通方式'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onDelete && transport && (
            <button onClick={onDelete} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 mr-1">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onCancel} className="p-1.5 rounded-lg text-trip-muted hover:bg-trip-cloud">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 交通方式选择 */}
      <Field label="交通方式">
        <div className="grid grid-cols-4 gap-2">
          {TRANSPORT_MODE_OPTIONS.map(mode => {
            const Icon = mode.icon
            const isActive = formData.type === mode.value
            return (
              <button
                key={mode.value}
                onClick={() => setFormData(prev => ({ ...prev, type: mode.value, transportType: mode.value }))}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors ${
                  isActive
                    ? 'border-trip-amber bg-trip-amber/10 text-trip-amber'
                    : 'border-trip-border/30 text-trip-muted hover:border-trip-amber/30 hover:text-trip-amber'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{mode.label}</span>
              </button>
            )
          })}
        </div>
      </Field>

      {/* === 飞机专属字段 === */}
      {type === 'flight' && (
        <>
          <Field label="航班号" icon={Plane}>
            <Input value={code} onChange={handleCodeChange} placeholder="如：CA1234、VY1516" />
          </Field>
          <Field label="航空公司/航班名称" icon={Plane}>
            <Input value={formData.name} onChange={v => update('name', v)} placeholder="如：中国国际航空 CA1234" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="出发地" icon={MapPin}><Input value={formData.from} onChange={v => update('from', v)} placeholder="如：北京首都机场" /></Field>
            <Field label="到达地" icon={MapPin}><Input value={formData.to} onChange={v => update('to', v)} placeholder="如：上海浦东机场" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="起飞时间" icon={Clock}><Input value={formData.time} onChange={v => update('time', v)} type="time" /></Field>
            <Field label="到达时间" icon={Clock}><Input value={formData.arriveTime} onChange={v => update('arriveTime', v)} type="time" /></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="飞行时长(分)" icon={Clock}><Input value={formData.durationMinutes} onChange={v => update('durationMinutes', v)} type="number" placeholder="120" min="0" /></Field>
            <Field label="座位号" icon={Armchair}><Input value={formData.seat} onChange={v => update('seat', v)} placeholder="26F" /></Field>
            <Field label="登机口/航站楼" icon={DoorOpen}><Input value={formData.gate} onChange={v => update('gate', v)} placeholder="T3-A15" /></Field>
          </div>
          <Field label="备注" icon={ChevronRight}>
            <Input value={formData.description} onChange={v => update('description', v)} placeholder="如：需提前2小时到达机场" />
          </Field>
        </>
      )}

      {/* === 火车专属字段 === */}
      {type === 'train' && (
        <>
          <Field label="列车班次" icon={Train}>
            <Input value={code} onChange={handleCodeChange} placeholder="如：G1234、D5678" />
          </Field>
          <Field label="车次名称" icon={Train}>
            <Input value={formData.name} onChange={v => update('name', v)} placeholder="如：G1234 复兴号" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="出发站" icon={MapPin}><Input value={formData.from} onChange={v => update('from', v)} placeholder="如：北京南站" /></Field>
            <Field label="到达站" icon={MapPin}><Input value={formData.to} onChange={v => update('to', v)} placeholder="如：上海虹桥站" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="发车时间" icon={Clock}><Input value={formData.time} onChange={v => update('time', v)} type="time" /></Field>
            <Field label="到达时间" icon={Clock}><Input value={formData.arriveTime} onChange={v => update('arriveTime', v)} type="time" /></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="时长(分)" icon={Clock}><Input value={formData.durationMinutes} onChange={v => update('durationMinutes', v)} type="number" placeholder="300" min="0" /></Field>
            <Field label="车厢/座位" icon={Armchair}><Input value={formData.seat} onChange={v => update('seat', v)} placeholder="05车12F" /></Field>
            <Field label="检票口/站台" icon={DoorOpen}><Input value={formData.gate} onChange={v => update('gate', v)} placeholder="12A/3站台" /></Field>
          </div>
          <Field label="备注" icon={ChevronRight}>
            <Input value={formData.description} onChange={v => update('description', v)} placeholder="如：需提前30分钟到达车站" />
          </Field>
        </>
      )}

      {/* === 公交专属字段 === */}
      {type === 'bus' && (
        <>
          <Field label="公交线路" icon={Bus}>
            <Input value={formData.name} onChange={v => update('name', v)} placeholder="如：特8路、Yuntong 104" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="上车站" icon={MapPin}><Input value={formData.from} onChange={v => update('from', v)} placeholder="如：天安门东" /></Field>
            <Field label="下车站" icon={MapPin}><Input value={formData.to} onChange={v => update('to', v)} placeholder="如：故宫" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="预计耗时(分)" icon={Clock}><Input value={formData.durationMinutes} onChange={v => update('durationMinutes', v)} type="number" placeholder="25" min="0" /></Field>
            <Field label="票价(元)" icon={Banknote}><Input value={formData.price} onChange={v => update('price', v)} type="number" placeholder="2" min="0" step="0.1" /></Field>
          </div>
          <Field label="备注" icon={ChevronRight}>
            <Input value={formData.description} onChange={v => update('description', v)} placeholder="如：可使用公交卡/支付宝乘车码" />
          </Field>
        </>
      )}

      {/* === 地铁专属字段 === */}
      {type === 'subway' && (
        <>
          <Field label="地铁线路" icon={TrainFront}>
            <Input value={formData.name} onChange={v => update('name', v)} placeholder="如：地铁1号线、2号线" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="起点站" icon={MapPin}><Input value={formData.from} onChange={v => update('from', v)} placeholder="如：建国门" /></Field>
            <Field label="终点站" icon={MapPin}><Input value={formData.to} onChange={v => update('to', v)} placeholder="如：天安门东" /></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="预计耗时(分)" icon={Clock}><Input value={formData.durationMinutes} onChange={v => update('durationMinutes', v)} type="number" placeholder="15" min="0" /></Field>
            <Field label="换乘次数" icon={Route}><Input value={formData.transfers} onChange={v => update('transfers', v)} type="number" placeholder="0" min="0" /></Field>
            <Field label="票价(元)" icon={Banknote}><Input value={formData.price} onChange={v => update('price', v)} type="number" placeholder="3" min="0" step="0.5" /></Field>
          </div>
          <Field label="备注" icon={ChevronRight}>
            <Input value={formData.description} onChange={v => update('description', v)} placeholder="如：2号线内环建国门方向" />
          </Field>
        </>
      )}

      {/* === 自驾专属字段 === */}
      {type === 'car' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="出发地点" icon={MapPin}><Input value={formData.from} onChange={v => update('from', v)} placeholder="如：酒店停车场" /></Field>
            <Field label="目的地点" icon={MapPin}><Input value={formData.to} onChange={v => update('to', v)} placeholder="如：景区停车场" /></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="出发时间" icon={Clock}><Input value={formData.time} onChange={v => update('time', v)} type="time" /></Field>
            <Field label="预计耗时(分)" icon={Clock}><Input value={formData.durationMinutes} onChange={v => update('durationMinutes', v)} type="number" placeholder="45" min="0" /></Field>
            <Field label="距离(公里)" icon={Route}><Input value={formData.distanceKm} onChange={v => update('distanceKm', v)} type="number" placeholder="15" min="0" step="0.1" /></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="过路费(元)" icon={Banknote}><Input value={formData.tollFee} onChange={v => update('tollFee', v)} type="number" placeholder="10" min="0" step="0.1" /></Field>
            <Field label="停车费(元)" icon={Banknote}><Input value={formData.parkingFee} onChange={v => update('parkingFee', v)} type="number" placeholder="20" min="0" step="0.1" /></Field>
            <Field label="车牌号" icon={Car}><Input value={formData.plateNumber} onChange={v => update('plateNumber', v)} placeholder="京A·12345" /></Field>
          </div>
          <Field label="停车信息" icon={Navigation}>
            <Input value={formData.description} onChange={v => update('description', v)} placeholder="如：景区北门停车场，约20元/天" />
          </Field>
        </>
      )}

      {/* === 打车专属字段 === */}
      {type === 'taxi' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="上车地点" icon={MapPin}><Input value={formData.from} onChange={v => update('from', v)} placeholder="如：酒店门口" /></Field>
            <Field label="下车地点" icon={MapPin}><Input value={formData.to} onChange={v => update('to', v)} placeholder="如：景区入口" /></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="出发时间" icon={Clock}><Input value={formData.time} onChange={v => update('time', v)} type="time" /></Field>
            <Field label="预计耗时(分)" icon={Clock}><Input value={formData.durationMinutes} onChange={v => update('durationMinutes', v)} type="number" placeholder="20" min="0" /></Field>
            <Field label="预计费用(元)" icon={Coins}><Input value={formData.price} onChange={v => update('price', v)} type="number" placeholder="35" min="0" step="0.1" /></Field>
          </div>
          <Field label="备注" icon={ChevronRight}>
            <Input value={formData.description} onChange={v => update('description', v)} placeholder="如：走高速约45元" />
          </Field>
        </>
      )}

      {/* === 步行专属字段 === */}
      {type === 'walk' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="起点" icon={MapPin}><Input value={formData.from} onChange={v => update('from', v)} placeholder="如：地铁站出口" /></Field>
            <Field label="终点" icon={MapPin}><Input value={formData.to} onChange={v => update('to', v)} placeholder="如：景点入口" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="出发时间" icon={Clock}><Input value={formData.time} onChange={v => update('time', v)} type="time" /></Field>
            <Field label="预计耗时(分)" icon={Clock}><Input value={formData.durationMinutes} onChange={v => update('durationMinutes', v)} type="number" placeholder="10" min="0" /></Field>
          </div>
          <Field label="距离(公里)" icon={Route}>
            <Input value={formData.distanceKm} onChange={v => update('distanceKm', v)} type="number" placeholder="0.8" min="0" step="0.1" />
          </Field>
          <Field label="路线备注" icon={ChevronRight}>
            <Input value={formData.description} onChange={v => update('description', v)} placeholder="如：沿步行街直走约800米" />
          </Field>
        </>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 btn-secondary"
        >
          取消
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-2.5 btn-primary flex items-center justify-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          保存
        </button>
      </div>
    </div>
  )
}
