import { Sun, Cloud, CloudRain, CloudSnow, Wind, Droplets, ThermometerSun, RefreshCw } from 'lucide-react'
import { useState } from 'react'

const iconMap = {
  sun: Sun,
  cloud: Cloud,
  rain: CloudRain,
  snow: CloudSnow,
}

function getDayLabel(dateStr, idx) {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  if (idx === 0) return '今天'
  if (idx === 1) return '明天'
  const date = new Date(dateStr)
  return days[date.getDay()]
}

export default function WeatherCard({ weather, onRefresh, isLoading }) {
  if (!weather) return null

  const Icon = iconMap[weather.icon] || Sun

  return (
    <div className="card p-6 bg-gradient-to-br from-trip-mint/10 via-white to-trip-amber/10 border-trip-mint/20">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm text-trip-muted mb-1">当前天气</div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-trip-ink font-mono tabular-nums">{weather.temp}</span>
            <span className="text-trip-slate font-medium">{weather.condition}</span>
          </div>
        </div>
        <div className="relative">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-trip-fog-pale`}>
            <Icon className="w-7 h-7 text-trip-slate" />
          </div>
          {weather.isReal && (
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" title="实时数据" />
          )}
        </div>
      </div>

      {(weather.humidity || weather.windSpeed) && (
        <div className="flex gap-4 mb-4 pt-4 border-t border-trip-border/50">
          {weather.humidity && (
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-trip-slate">湿度 {weather.humidity}</span>
            </div>
          )}
          {weather.windSpeed && (
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-trip-mint" />
              <span className="text-xs text-trip-slate">风速 {weather.windSpeed}</span>
            </div>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="ml-auto flex items-center gap-1 text-xs text-trip-muted hover:text-trip-mint transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              刷新
            </button>
          )}
        </div>
      )}

      {weather.forecast && weather.forecast.length > 0 && (
        <div className="pt-4 border-t border-trip-border/50">
          <div className="text-xs font-semibold text-trip-muted mb-3 flex items-center gap-1.5">
            <ThermometerSun className="w-3.5 h-3.5" />
            未来 7 天预报
          </div>
          <div className="grid grid-cols-7 gap-1">
            {weather.forecast.map((day, idx) => {
              const DayIcon = iconMap[day.icon] || Cloud
              return (
                <div key={day.date} className="text-center">
                  <div className="text-xs font-medium text-trip-slate mb-1">{getDayLabel(day.date, idx)}</div>
                  <div className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-1 ${
                    day.icon === 'sun'
                      ? 'bg-amber-100'
                      : day.icon === 'rain'
                      ? 'bg-blue-100'
                      : day.icon === 'snow'
                      ? 'bg-sky-100'
                      : 'bg-slate-100'
                  }`}>
                    <DayIcon className={`w-4 h-4 ${
                      day.icon === 'sun'
                        ? 'text-amber-500'
                        : day.icon === 'rain'
                        ? 'text-blue-500'
                        : day.icon === 'snow'
                        ? 'text-sky-500'
                        : 'text-slate-500'
                    }`} />
                  </div>
                  <div className="text-xs font-bold text-trip-ink font-mono tabular-nums">{day.maxTemp}°</div>
                  <div className="text-xs text-trip-muted font-mono tabular-nums">{day.minTemp}°</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-4 p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-trip-border/50">
        <div className="text-xs text-trip-slate">
          <span className="font-semibold text-trip-mint">出行建议：</span>
          {weather.tips}
        </div>
      </div>
    </div>
  )
}
