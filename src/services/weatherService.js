const weatherCodeMap = {
  0: { condition: '晴', icon: 'sun', tips: '阳光充足，注意防晒' },
  1: { condition: '晴转多云', icon: 'sun', tips: '多云为主，偶尔有阳光' },
  2: { condition: '多云', icon: 'cloud', tips: '天气多云，适合出行' },
  3: { condition: '阴', icon: 'cloud', tips: '阴天，建议带件外套' },
  45: { condition: '有雾', icon: 'cloud', tips: '有雾，注意出行安全' },
  48: { condition: '有雾凇', icon: 'cloud', tips: '有雾凇，注意保暖' },
  51: { condition: '毛毛雨', icon: 'rain', tips: '毛毛雨，建议带伞' },
  53: { condition: '小雨', icon: 'rain', tips: '小雨，记得带伞' },
  55: { condition: '中雨', icon: 'rain', tips: '中雨，注意防雨' },
  61: { condition: '小雨', icon: 'rain', tips: '小雨，记得带伞' },
  63: { condition: '中雨', icon: 'rain', tips: '中雨，注意防雨' },
  65: { condition: '大雨', icon: 'rain', tips: '大雨，尽量减少外出' },
  71: { condition: '小雪', icon: 'snow', tips: '小雪，注意保暖防滑' },
  73: { condition: '中雪', icon: 'snow', tips: '中雪，注意保暖防滑' },
  75: { condition: '大雪', icon: 'snow', tips: '大雪，尽量减少外出' },
  80: { condition: '阵雨', icon: 'rain', tips: '阵雨，建议带伞' },
  81: { condition: '强阵雨', icon: 'rain', tips: '强阵雨，注意避雨' },
  82: { condition: '暴雨', icon: 'rain', tips: '暴雨，尽量不要外出' },
  95: { condition: '雷阵雨', icon: 'rain', tips: '雷阵雨，注意避雷' },
  96: { condition: '雷阵雨伴冰雹', icon: 'rain', tips: '雷阵雨伴冰雹，注意安全' },
  99: { condition: '强雷阵雨伴冰雹', icon: 'rain', tips: '强雷阵雨伴冰雹，尽量不要外出' },
}

function getWeatherInfo(code) {
  return weatherCodeMap[code] || { condition: '未知', icon: 'cloud', tips: '请注意天气变化' }
}

const iconToWeatherType = {
  'sun': 'sunny',
  'cloud': 'cloudy',
  'rain': 'rainy',
  'snow': 'snowy',
}

export async function fetchWeather(lat, lon) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=7`

    const response = await fetch(url)
    if (!response.ok) throw new Error('天气请求失败')

    const data = await response.json()
    const current = data.current
    const daily = data.daily

    const weatherInfo = getWeatherInfo(current.weather_code)
    const currentWeatherType = iconToWeatherType[weatherInfo.icon] || 'sunny'

    return {
      current: {
        temperature: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature || current.temperature_2m),
        weather: currentWeatherType,
        weatherText: weatherInfo.condition,
        windSpeed: Math.round(current.wind_speed_10m),
        humidity: current.relative_humidity_2m,
        uvIndex: 5,
      },
      daily: daily.time.map((date, idx) => {
        const dailyWeather = getWeatherInfo(daily.weather_code[idx])
        return {
          date: date.slice(5),
          weather: iconToWeatherType[dailyWeather.icon] || 'cloudy',
          weatherText: dailyWeather.condition,
          max: Math.round(daily.temperature_2m_max[idx]),
          min: Math.round(daily.temperature_2m_min[idx]),
          precipitation: daily.precipitation_probability_max[idx],
        }
      }),
      isReal: true,
    }
  } catch (error) {
    console.warn('获取实时天气失败，使用默认天气:', error)
    return getDefaultWeather()
  }
}

export async function getWeather(lat, lon) {
  const result = await fetchWeather(lat, lon)
  return result || getDefaultWeather()
}

export function getOutfitTips(weather) {
  if (!weather || !weather.current) return []

  const temp = weather.current.temperature
  const condition = weather.current.weather
  const tips = []

  if (temp >= 30) {
    tips.push({ title: '轻薄透气', desc: '短袖+短裤/裙，记得带防晒霜' })
  } else if (temp >= 24) {
    tips.push({ title: '短袖为主', desc: '短袖+长裤/裙，备一件薄外套' })
  } else if (temp >= 18) {
    tips.push({ title: '春秋装', desc: '长袖+长裤，可加件薄外套' })
  } else if (temp >= 10) {
    tips.push({ title: '毛衣+外套', desc: '薄毛衣+风衣/夹克' })
  } else if (temp >= 0) {
    tips.push({ title: '厚外套', desc: '毛衣+厚外套/羽绒服' })
  } else {
    tips.push({ title: '羽绒服+围巾', desc: '厚羽绒服+围巾手套，注意保暖' })
  }

  if (condition === 'rainy') {
    tips.push({ title: '带伞', desc: '记得带雨具，穿防滑鞋' })
  } else if (condition === 'sunny' && temp >= 25) {
    tips.push({ title: '防晒', desc: '紫外线强，建议带遮阳帽、防晒霜' })
  } else if (condition === 'snowy') {
    tips.push({ title: '防滑', desc: '穿防滑鞋，避免摔倒' })
  }

  return tips
}

function getDefaultWeather() {
  return {
    current: {
      temperature: 22,
      feelsLike: 22,
      weather: 'cloudy',
      weatherText: '多云',
      windSpeed: 8,
      humidity: 60,
      uvIndex: 5,
    },
    daily: Array.from({ length: 7 }, (_, i) => ({
      date: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i],
      weather: 'cloudy',
      weatherText: '多云',
      max: 25,
      min: 15,
      precipitation: 20,
    })),
    isReal: false,
  }
}
