import { useState } from 'react'
import { Clock, MapPin, Lightbulb, UtensilsCrossed, Landmark, ShoppingBag, Hotel, ChevronLeft, ChevronRight, Calendar, Train, Bus, Car, Footprints, Navigation, Star, Coffee, Camera, Map as MapIcon } from 'lucide-react'
import SafeImage from './SafeImage'

const typeIcons = {
  attraction: Landmark,
  food: UtensilsCrossed,
  shopping: ShoppingBag,
  accommodation: Hotel,
  transport: Navigation,
}

const typeColors = {
  attraction: {
    dot: 'bg-gradient-to-br from-trip-mint to-trip-mint',
    badge: 'bg-trip-mint/15 text-trip-mint border-trip-mint/30',
    card: 'border-trip-mint/20',
  },
  food: {
    dot: 'bg-gradient-to-br from-trip-amber to-trip-amber',
    badge: 'bg-trip-amber/15 text-trip-amber border-trip-amber/30',
    card: 'border-trip-amber/20',
  },
  shopping: {
    dot: 'bg-gradient-to-br from-purple-400 to-purple-600',
    badge: 'bg-purple-100 text-purple-600 border-purple-200',
    card: 'border-purple-200',
  },
  accommodation: {
    dot: 'bg-gradient-to-br from-amber-400 to-amber-600',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    card: 'border-amber-200',
  },
  transport: {
    dot: 'bg-trip-muted',
    badge: 'bg-trip-cloud text-trip-slate border-trip-border',
    card: 'border-trip-border/60',
  },
}

const transportIcons = {
  Train,
  Bus,
  Car,
  Footprints,
}

const typeLabels = {
  attraction: '景点',
  food: '美食',
  shopping: '购物',
  accommodation: '住宿',
  transport: '交通',
}

export default function ItineraryTimeline({ itinerary, activeDay, setActiveDay, destination }) {
  if (!itinerary || itinerary.length === 0) return null

  const currentDay = itinerary[activeDay]
  const dayItems = currentDay?.items || []

  const attractions = dayItems.filter(i => i.type === 'attraction' && !i.isTransport)
  const foods = dayItems.filter(i => i.type === 'food' && !i.isTransport)
  const totalDuration = dayItems.length > 0 ? `${dayItems[0]?.time || ''} - ${dayItems[dayItems.length - 1]?.time || ''}` : ''

  const stats = [
    { icon: Landmark, label: '景点', value: attractions.length, color: 'text-trip-mint' },
    { icon: UtensilsCrossed, label: '美食', value: foods.length, color: 'text-trip-amber' },
    { icon: Clock, label: '时长', value: totalDuration, color: 'text-trip-slate' },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8" id="result">
      <div className="text-center mb-8">
        <div className="">
          <Calendar className="w-3 h-3" />
          行程时间线
        </div>
        <h2 className="font-semibold text-lg">你的专属行程已生成</h2>
        <p className="text-sm text-trip-muted">共 {itinerary.length} 天，点击日期切换查看</p>
      </div>

      <div className="flex justify-center gap-3 mb-8 flex-wrap">
        {itinerary.map((day, idx) => (
          <button
            key={day.day}
            onClick={() => setActiveDay(idx)}
            className={`group relative px-5 py-3 rounded-xl font-semibold transition-all duration-300 border min-w-[100px] ${
              idx === activeDay
                ? 'bg-gradient-to-r from-trip-mint to-trip-mint text-white shadow-md border-transparent scale-105'
                : 'bg-white text-trip-slate border-trip-border/50 hover:border-trip-mint/30 hover:bg-trip-mint/5'
            }`}
          >
            <div className="text-sm">第 {day.day} 天</div>
            <div className={`text-xs mt-0.5 font-medium ${idx === activeDay ? 'text-white/80' : 'text-trip-muted'}`}>
              {day.date}
            </div>
            <div className={`text-xs mt-0.5 font-medium truncate ${idx === activeDay ? 'text-white/70' : 'text-trip-muted/70'}`}>
              {day.theme}
            </div>
          </button>
        ))}
      </div>

      <div className="card p-5 mb-8">
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="text-center">
                <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center bg-trip-cloud`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="text-lg font-bold text-trip-ink">{stat.value}</div>
                <div className="text-xs text-trip-muted">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-[22px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-trip-mint via-trip-mint/30 to-trip-border rounded-full" />

        <div className="space-y-0">
          {dayItems.map((item, idx) => {
            const Icon = typeIcons[item.type] || Landmark
            const isTransport = item.isTransport
            const isMeal = item.isMeal
            const TransportIcon = item.transportIcon ? transportIcons[item.transportIcon] : null
            const colors = typeColors[item.type] || typeColors.attraction

            if (isTransport) {
              return (
                <div key={item.id} className="relative pl-16 pb-4 pt-1">
                  <div className="absolute left-[14px] top-3 z-10">
                    <div className="w-4 h-4 rounded-full bg-white border-2 border-trip-muted flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-trip-muted" />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-trip-slate">
                    {TransportIcon && <TransportIcon className="w-4 h-4 text-trip-muted shrink-0" />}
                    <span className="font-semibold text-trip-mint shrink-0 font-mono tabular-nums">{item.time}</span>
                    <span className="text-trip-muted shrink-0">·</span>
                    <span className="font-medium text-trip-ink shrink-0">{item.name}</span>
                    <span className="text-trip-muted shrink-0">·</span>
                    <span className="text-trip-slate">{item.description}</span>
                    {item.route && (
                      <span className="px-2 py-0.5 rounded-full bg-trip-mint/10 text-trip-mint text-xs font-semibold shrink-0">
                        {item.route}
                      </span>
                    )}
                    {item.duration && (
                      <span className="text-trip-muted text-xs ml-auto shrink-0">约 {item.duration}</span>
                    )}
                  </div>
                </div>
              )
            }

            return (
              <div key={item.id} className="relative pl-16 pb-6">
                <div className="absolute left-[6px] top-1 z-10">
                  <div className={`w-9 h-9 rounded-full ${colors.dot} shadow-md flex items-center justify-center border-4 border-white`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className={`card p-4 ${colors.card}`}>
                  <div className="flex items-start gap-3">
                    {item.image && (
                      <SafeImage
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-xl object-cover shrink-0 shadow-sm"
                        fallbackText={item.name}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${colors.badge}`}>
                          {typeLabels[item.type] || item.typeLabel}
                        </span>
                        {isMeal && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-trip-amber/10 text-trip-amber font-semibold">
                            {item.mealType || '用餐'}
                          </span>
                        )}
                        <span className="text-xs font-bold text-trip-mint ml-auto flex items-center gap-1 font-mono tabular-nums">
                          <Clock className="w-3 h-3" />
                          {item.time}
                        </span>
                      </div>
                      <h4 className="font-bold text-trip-ink text-base mb-1 flex items-center gap-2">
                        {item.name}
                        {item.rating && (
                          <span className="flex items-center gap-0.5 text-xs text-amber-500 font-semibold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {item.rating}
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-trip-slate line-clamp-2 mb-2">{item.description}</p>

                      <div className="flex flex-wrap gap-2 text-xs">
                        {item.location && (
                          <div className="flex items-center gap-1 text-trip-muted">
                            <MapPin className="w-3 h-3" />
                            {item.location}
                          </div>
                        )}
                        {item.duration && !isMeal && (
                          <div className="flex items-center gap-1 text-trip-muted">
                            <Clock className="w-3 h-3" />
                            约 {item.duration}
                          </div>
                        )}
                        {item.price && (
                          <div className="flex items-center gap-1 text-trip-amber font-semibold">
                            ¥{item.price}
                          </div>
                        )}
                      </div>

                      {item.tips && item.tips !== '建议吃饱一点，为接下来的行程储备能量～' && (
                        <div className="flex items-start gap-1.5 mt-3 p-2.5 rounded-xl bg-trip-mint/10 text-xs text-trip-mint">
                          <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{item.tips}</span>
                        </div>
                      )}

                      {item.mustTry && item.mustTry.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs font-semibold text-trip-amber mb-1.5 flex items-center gap-1">
                            <UtensilsCrossed className="w-3 h-3" />
                            必点推荐
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {item.mustTry.map((dish, i) => (
                              <span key={i} className="text-xs px-2 py-1 rounded-lg bg-trip-amber/10 text-trip-amber font-medium">
                                {dish}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        <button
          onClick={() => setActiveDay(Math.max(0, activeDay - 1))}
          disabled={activeDay === 0}
          className={`btn-secondary text-sm ${activeDay === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ChevronLeft className="w-4 h-4" />
          上一天
        </button>
        <span className="text-sm text-trip-muted">
          第 {activeDay + 1} / {itinerary.length} 天
        </span>
        <button
          onClick={() => setActiveDay(Math.min(itinerary.length - 1, activeDay + 1))}
          disabled={activeDay === itinerary.length - 1}
          className={`btn-secondary text-sm ${activeDay === itinerary.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          下一天
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
