import { useState, useEffect } from 'react'
import { CloudSun, Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, Thermometer, Shirt } from 'lucide-react'
import { getAllDestinations } from '../data/destinations'
import { getWeather, getOutfitTips } from '../services/weatherService'
import AnimalPageHero from './AnimalPageHero'
import AnimalProgress from './AnimalProgress'

const weatherIcons = {
  'sunny': <Sun className="w-6 h-6 text-trip-amber" />,
  'partly-cloudy': <CloudSun className="w-6 h-6 text-trip-amber" />,
  'cloudy': <Cloud className="w-6 h-6 text-trip-slate" />,
  'rainy': <CloudRain className="w-6 h-6 text-trip-blue" />,
  'stormy': <CloudLightning className="w-6 h-6 text-trip-slate" />,
  'snowy': <CloudSnow className="w-6 h-6 text-trip-blue" />,
}

export default function WeatherPage() {
  const [cityId, setCityId] = useState(() => {
    try {
      return localStorage.getItem('tripzzle_weather_city') || 'beijing'
    } catch (e) {
      return 'beijing'
    }
  })
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)

  const destinations = getAllDestinations()
  const currentCity = destinations.find(d => d.id === cityId)

  useEffect(() => {
    try {
      localStorage.setItem('tripzzle_weather_city', cityId)
    } catch (e) {
      // ignore
    }
  }, [cityId])

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true)
      try {
        const data = await getWeather(currentCity?.latitude || 39.9042, currentCity?.longitude || 116.4074)
        setWeather(data)
      } catch (error) {
        console.error('获取天气失败:', error)
      }
      setLoading(false)
    }
    fetchWeather()
  }, [cityId, currentCity])

  const outfitTips = weather ? getOutfitTips(weather) : []

  return (
    <div className="min-h-screen bg-trip-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <AnimalPageHero
          role="frog"
          eyebrow="天气青蛙 · 今日值班"
          title="先看看天气，再决定穿什么"
          subtitle="青蛙会整理目的地天气、体感温度和未来七天的穿搭提醒。"
        />

        <div className="card overflow-hidden mb-6 mt-6">
          <div className="p-4">
            <select
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-trip-border focus:border-trip-mint focus:ring-2 focus:ring-trip-mint/20 outline-none transition-all appearance-none bg-white"
            >
              {destinations.map((dest) => (
                <option key={dest.id} value={dest.id}>
                  {dest.name}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="p-5 sm:p-7">
              <AnimalProgress
                role="frog"
                label="天气青蛙正在观察云层…"
                detail={`正在获取${currentCity?.name || '目的地'}的实时天气`}
              />
            </div>
          ) : weather ? (
            <>
              <div className="p-6 bg-gradient-to-br from-trip-blue/5 to-trip-mint/5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-6xl font-bold text-trip-ink mb-2 font-mono tabular-nums">
                      {weather.current.temperature}°C
                    </div>
                    <div className="flex items-center gap-2 text-trip-slate">
                      <span className={`text-trip-blue ${weatherIcons[weather.current.weather] ? '' : 'hidden'}`}>
                        {weatherIcons[weather.current.weather]}
                      </span>
                      <span>{weather.current.weatherText}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-trip-muted">体感温度</div>
                    <div className="text-xl font-semibold text-trip-ink font-mono tabular-nums">{weather.current.feelsLike}°C</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-white/80 rounded-xl p-3 text-center">
                    <Wind className="w-5 h-5 mx-auto mb-2 text-trip-slate" />
                    <div className="text-sm font-semibold text-trip-ink font-mono tabular-nums">{weather.current.windSpeed} km/h</div>
                    <div className="text-xs text-trip-muted">风速</div>
                  </div>
                  <div className="bg-white/80 rounded-xl p-3 text-center">
                    <Droplets className="w-5 h-5 mx-auto mb-2 text-trip-blue" />
                    <div className="text-sm font-semibold text-trip-ink font-mono tabular-nums">{weather.current.humidity}%</div>
                    <div className="text-xs text-trip-muted">湿度</div>
                  </div>
                  <div className="bg-white/80 rounded-xl p-3 text-center">
                    <Thermometer className="w-5 h-5 mx-auto mb-2 text-trip-amber" />
                    <div className="text-sm font-semibold text-trip-ink">{weather.current.uvIndex}</div>
                    <div className="text-xs text-trip-muted">紫外线</div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-trip-border/30">
                <h3 className="font-semibold text-trip-ink mb-4">未来7天预报</h3>
                <div className="grid grid-cols-7 gap-2">
                  {weather.daily.map((day, idx) => (
                    <div key={idx} className="text-center p-3 rounded-xl bg-trip-cloud">
                      <div className="text-xs text-trip-muted mb-2 font-mono tabular-nums">{day.date}</div>
                      <div className="text-trip-blue mb-2">{weatherIcons[day.weather]}</div>
                      <div className="text-sm font-bold text-trip-ink font-mono tabular-nums">{day.max}°</div>
                      <div className="text-xs text-trip-muted font-mono tabular-nums">{day.min}°</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <CloudSun className="w-12 h-12 mx-auto mb-3 text-trip-muted opacity-30" />
              <p className="text-trip-muted">获取天气失败，请稍后重试</p>
            </div>
          )}
        </div>

        {outfitTips.length > 0 && (
          <div className="card p-6">
            <h3 className="font-semibold text-trip-ink mb-4 flex items-center gap-2">
              <Shirt className="w-5 h-5 text-trip-amber" />
              穿搭建议
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {outfitTips.map((tip, idx) => (
                <div key={idx} className="card-flat p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-trip-amber/10 flex items-center justify-center shrink-0">
                    <Shirt className="w-4 h-4 text-trip-amber" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-trip-ink">{tip.title}</div>
                    <div className="text-xs text-trip-muted mt-1">{tip.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
