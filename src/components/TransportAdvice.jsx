import { Bus, Car, Train, Bike, Footprints, Clock, DollarSign, Star } from 'lucide-react'

const transportData = {
  beijing: [
    { icon: Train, name: '地铁', desc: '覆盖广，准点率高', price: '¥2-10', time: '5:00-23:00', recommended: true, tip: '推荐办交通卡或用支付宝扫码' },
    { icon: Bus, name: '公交', desc: '线路多，性价比高', price: '¥2起', time: '各线路不同', recommended: false, tip: '避开早晚高峰' },
    { icon: Car, name: '打车', desc: '方便快捷，适合多人', price: '¥13起步', time: '24小时', recommended: false, tip: '高峰期建议地铁' },
    { icon: Footprints, name: '共享单车', desc: '短距离方便', price: '¥1.5/30分钟', time: '24小时', recommended: false, tip: '胡同游首选' },
  ],
  shanghai: [
    { icon: Train, name: '地铁', desc: '四通八达，出行首选', price: '¥3起', time: '5:30-23:00', recommended: true, tip: ' Metro大都会App扫码乘车' },
    { icon: Bus, name: '公交', desc: '覆盖密，价格便宜', price: '¥2起', time: '各线路不同', recommended: false, tip: '延安路有专用道，不堵车' },
    { icon: Car, name: '打车', desc: '便捷舒适', price: '¥14起步', time: '24小时', recommended: false, tip: '高峰期建议地铁' },
    { icon: Bike, name: '共享单车', desc: '梧桐树下骑行', price: '¥1.5/30分钟', time: '24小时', recommended: true, tip: '武康路一带骑行超舒服' },
  ],
  default: [
    { icon: Train, name: '地铁/轻轨', desc: '城市主要出行方式', price: '¥2起', time: '6:00-23:00', recommended: true, tip: '推荐使用官方App扫码' },
    { icon: Bus, name: '公交', desc: '覆盖广泛', price: '¥2起', time: '各线路不同', recommended: false, tip: '可刷公交卡或扫码' },
    { icon: Car, name: '打车/网约车', desc: '门到门服务', price: '¥10+起步', time: '24小时', recommended: false, tip: '高峰期可能等待较久' },
    { icon: Footprints, name: '步行', desc: '感受城市脉搏', price: '免费', time: '不限', recommended: true, tip: '老城区适合步行探索' },
  ],
}

export default function TransportAdvice({ itinerary, activeDay, preferences, destinationId }) {
  const transports = transportData[destinationId] || transportData.default

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <div className="">
          <Bus className="w-3 h-3" />
          交通建议
        </div>
        <h2 className="font-semibold text-lg">市内交通怎么选？</h2>
        <p className="text-sm text-trip-muted">根据你的行程偏好，推荐最合适的出行方式</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {transports.map((t, idx) => {
          const Icon = t.icon
          return (
            <div
              key={t.name}
              className={`card-flat p-5 relative ${
                t.recommended ? 'border-trip-mint/50 bg-gradient-to-br from-white to-trip-mint/5' : ''
              }`}
            >
              {t.recommended && (
                <div className="absolute -top-2.5 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-trip-mint to-trip-mint text-white text-xs font-bold shadow-md flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  推荐
                </div>
              )}

              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                t.recommended
                  ? 'bg-gradient-to-br from-trip-mint to-trip-mint text-white shadow-md'
                  : 'bg-trip-cloud text-trip-slate'
              }`}>
                <Icon className="w-6 h-6" />
              </div>

              <h3 className="font-bold text-trip-ink text-lg mb-1">{t.name}</h3>
              <p className="text-sm text-trip-slate mb-4">{t.desc}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-trip-muted">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span className="tag-fog">{t.price}</span>
                </div>
                <div className="flex items-center gap-2 text-trip-muted">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="tag-fog">{t.time}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-trip-border/50">
                <p className="text-xs text-trip-mint bg-trip-mint/10 p-2.5 rounded-xl">
                  💡 {t.tip}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
