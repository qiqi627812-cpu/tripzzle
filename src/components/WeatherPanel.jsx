import { Sun, Cloud, CloudRain, CloudSnow, Thermometer, Wind, Droplets, Shirt, Umbrella, RefreshCw, ThermometerSun } from 'lucide-react'
import { useState, useEffect } from 'react'
import { fetchWeather } from '../services/weatherService'

const weatherIcons = {
  sun: Sun,
  cloud: Cloud,
  rain: CloudRain,
  snow: CloudSnow,
}

function getDayLabel(dateStr, idx) {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  let label = ''
  if (idx === 0) label = '今天'
  else if (idx === 1) label = '明天'
  else label = days[new Date(dateStr).getDay()]
  
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return { label, date: `${month}/${day}` }
}

function getOutfitTips(weather) {
  const tips = []
  const temp = parseInt(weather.temp)

  if (temp >= 30) {
    tips.push({ icon: Shirt, text: '高温天气，穿短袖短裤，注意防晒补水', bg: 'bg-trip-amber/15', color: 'text-trip-amber' })
  } else if (temp >= 25) {
    tips.push({ icon: Shirt, text: '天气较热，建议穿轻薄透气的衣物', bg: 'bg-trip-amber/10', color: 'text-trip-amber' })
  } else if (temp >= 20) {
    tips.push({ icon: Shirt, text: '温度舒适，薄外套或衬衫即可', bg: 'bg-trip-mint/15', color: 'text-trip-mint' })
  } else if (temp >= 15) {
    tips.push({ icon: Shirt, text: '早晚稍凉，建议带件薄外套', bg: 'bg-trip-mint/10', color: 'text-trip-mint' })
  } else if (temp >= 10) {
    tips.push({ icon: Shirt, text: '天气偏凉，穿外套+长袖比较合适', bg: 'bg-blue-50', color: 'text-blue-600' })
  } else if (temp >= 5) {
    tips.push({ icon: Shirt, text: '天气寒冷，穿厚外套注意保暖', bg: 'bg-purple-50', color: 'text-purple-600' })
  } else {
    tips.push({ icon: Shirt, text: '严寒天气，羽绒服+围巾帽子必备', bg: 'bg-purple-100', color: 'text-purple-700' })
  }

  if (weather.icon === 'rain') {
    tips.push({ icon: Umbrella, text: '有雨，记得带伞和防水鞋', bg: 'bg-blue-50', color: 'text-blue-600' })
  }

  if (weather.icon === 'snow') {
    tips.push({ icon: Umbrella, text: '有雪，注意防滑和保暖', bg: 'bg-blue-50', color: 'text-blue-600' })
  }

  if (weather.forecast && weather.forecast.length > 0) {
    const hasRainLater = weather.forecast.slice(1, 4).some(d => d.icon === 'rain')
    if (hasRainLater && weather.icon !== 'rain') {
      tips.push({ icon: Umbrella, text: '未来几天有雨，建议带伞', bg: 'bg-amber-50', color: 'text-amber-600' })
    }
  }

  if (weather.forecast && weather.forecast.length > 0) {
    const maxTemp = Math.max(...weather.forecast.slice(0, 3).map(d => d.maxTemp))
    const minTemp = Math.min(...weather.forecast.slice(0, 3).map(d => d.minTemp))
    if (maxTemp - minTemp > 12) {
      tips.push({ icon: Thermometer, text: '温差大，方便穿脱的叠穿最实用', bg: 'bg-trip-amber/15', color: 'text-trip-amber' })
    }
  }

  return tips
}

export default function WeatherPanel({ destination }) {
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const defaultWeather = destination?.weather || { temp: '20°C', condition: '晴', icon: 'sun', tips: '天气晴好，适合出行' }
  const weather = weatherData || defaultWeather
  const WeatherIcon = weatherIcons[weather.icon] || Sun

  const outfitTips = getOutfitTips(weather)

  const loadWeather = async () => {
    if (!destination?.lat || !destination?.lon) return

    setLoading(true)
    setError(null)
    try {
      const data = await fetchWeather(destination.lat, destination.lon)
      if (data) {
        setWeatherData(data)
      }
    } catch (err) {
      setError('获取天气失败')
      console.warn(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setWeatherData(null)
    if (destination?.lat && destination?.lon) {
      loadWeather()
    }
  }, [destination?.id])

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <div className="">
          <Sun className="w-3 h-3" />
          天气穿搭
        </div>
        <h2 className="font-semibold text-lg">{destination?.name} 天气 & 穿搭建议</h2>
        <p className="text-sm text-trip-muted">实时天气数据，出发前看看更省心</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 bg-gradient-to-br from-trip-mint/10 via-white to-trip-amber/10 lg:col-span-2">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-sm font-semibold text-trip-slate mb-1 flex items-center gap-2">
                {destination?.name} · 今日天气
                {weatherData?.isReal && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600 font-bold">
                    实时
                  </span>
                )}
              </div>
              <div className="flex items-end gap-4">
                <div className=" text-6xl font-black text-trip-ink font-mono tabular-nums">
                  {weather.temp}
                </div>
                <div className="pb-2">
                  <WeatherIcon className={`w-12 h-12 ${
                    weather.icon === 'sun' ? 'text-trip-amber' :
                    weather.icon === 'rain' ? 'text-blue-500' :
                    weather.icon === 'snow' ? 'text-sky-400' :
                    'text-trip-slate'
                  }`} />
                </div>
              </div>
              <div className="mt-2 text-trip-slate">{weather.condition}</div>
            </div>
            <div className="flex gap-6 text-sm">
              <div className="text-center">
                <Wind className="w-5 h-5 text-trip-muted mx-auto mb-1" />
                <div className="text-trip-slate font-medium">{weather.windSpeed || '3-4级'}</div>
                <div className="text-trip-muted text-xs">风力</div>
              </div>
              <div className="text-center">
                <Droplets className="w-5 h-5 text-trip-muted mx-auto mb-1" />
                <div className="text-trip-slate font-medium">{weather.humidity || '45%'}</div>
                <div className="text-trip-muted text-xs">湿度</div>
              </div>
              <div className="text-center">
                <button
                  onClick={loadWeather}
                  disabled={loading}
                  className="w-10 h-10 rounded-xl bg-white border border-trip-border flex items-center justify-center hover:bg-trip-mint/5 transition-colors"
                  title="刷新天气"
                >
                  <RefreshCw className={`w-4 h-4 text-trip-slate ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-trip-border/50">
            <div className="text-sm font-semibold text-trip-slate mb-4 flex items-center gap-2">
              <ThermometerSun className="w-4 h-4" />
              未来 {weather.forecast?.length || 5} 天预报
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
              {(weather.forecast || [
                { day: '今天', date: new Date().toISOString().split('T')[0], icon: 'sun', maxTemp: 24, minTemp: 16, condition: '晴转多云' },
                { day: '明天', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], icon: 'cloud', maxTemp: 22, minTemp: 15, condition: '多云' },
                { day: '后天', date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], icon: 'cloud', maxTemp: 20, minTemp: 14, condition: '多云' },
                { day: '周四', date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], icon: 'sun', maxTemp: 25, minTemp: 17, condition: '晴' },
                { day: '周五', date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0], icon: 'cloud', maxTemp: 23, minTemp: 16, condition: '多云转晴' },
              ]).map((day, idx) => {
                const DayIcon = weatherIcons[day.icon] || Cloud
                const dayInfo = day.date ? getDayLabel(day.date, idx) : { label: day.day, date: '' }
                return (
                  <div key={dayInfo.label + idx} className="text-center p-3 rounded-xl bg-white/60 hover:bg-white transition-colors">
                    <div className="text-xs font-semibold text-trip-muted mb-1">{dayInfo.label}</div>
                    {dayInfo.date && (
                      <div className="text-[10px] text-trip-muted/70 mb-2">{dayInfo.date}</div>
                    )}
                    <DayIcon className={`w-7 h-7 mx-auto mb-2 ${
                      day.icon === 'sun' ? 'text-trip-amber' :
                      day.icon === 'rain' ? 'text-blue-500' :
                      day.icon === 'snow' ? 'text-sky-400' :
                      'text-trip-slate'
                    }`} />
                    <div className="text-sm font-bold text-trip-ink font-mono tabular-nums">
                      {day.maxTemp}°<span className="text-trip-muted font-normal text-xs">/{day.minTemp}°</span>
                    </div>
                    <div className="text-xs text-trip-muted mt-1 truncate">{day.condition || day.desc}</div>
                    {day.precipitationProb !== undefined && day.precipitationProb !== null && (
                      <div className="text-xs text-blue-500 mt-1 font-medium">
                        💧 {day.precipitationProb}%
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-bold text-trip-ink mb-4">💡 穿搭小贴士</h3>
            <div className="space-y-3">
              {outfitTips.map((tip, idx) => {
                const Icon = tip.icon
                return (
                  <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl tag-olive`}>
                    <Icon className={`w-5 h-5 ${tip.color} shrink-0`} />
                    <span className={`text-sm font-medium ${tip.color}`}>{tip.text}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card p-5 bg-gradient-to-br from-trip-amber/10 to-transparent">
            <div className="text-sm font-bold text-trip-amber mb-2">旅行小贴士</div>
            <p className="text-sm text-trip-slate">
              {weather.tips}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
