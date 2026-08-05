import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, MapPin, X, Loader2 } from 'lucide-react'

const AMAP_KEY = '942f298093937afa211f61802dbb9e87'

export default function PlacePicker({ city = '北京', onSelect, onClose, initialKeyword = '' }) {
  const [keyword, setKeyword] = useState(initialKeyword)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const searchTimerRef = useRef(null)
  const abortControllerRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const searchPoi = useCallback(async (kw) => {
    if (!kw || kw.trim().length === 0) {
      setResults([])
      return
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    setLoading(true)
    setError(null)

    try {
      const url = `https://restapi.amap.com/v3/place/text?keywords=${encodeURIComponent(kw)}&city=${encodeURIComponent(city)}&key=${AMAP_KEY}&output=json&offset=15&page=1&extensions=base`
      const res = await fetch(url, { signal: abortControllerRef.current.signal })
      const data = await res.json()
      
      if (data.status === '1' && data.pois) {
        const places = data.pois.map(poi => {
          const [lng, lat] = poi.location ? poi.location.split(',').map(parseFloat) : [null, null]
          return {
            name: poi.name,
            address: poi.address || poi.pname + poi.cityname + poi.adname,
            district: poi.adname || '',
            lat: lat,
            lng: lng,
            amapPoiId: poi.id,
            coordSource: 'amap',
            coordType: 'gcj02',
          }
        }).filter(p => p.lat && p.lng)
        setResults(places)
      } else {
        setResults([])
        setError(data.info || '搜索失败')
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('AMap search error:', e)
        setError('网络错误，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }, [city])

  const handleInputChange = (e) => {
    const val = e.target.value
    setKeyword(val)
    
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }
    
    if (val.trim().length > 0) {
      searchTimerRef.current = setTimeout(() => {
        searchPoi(val)
      }, 300)
    } else {
      setResults([])
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      searchPoi(keyword)
    }
    if (e.key === 'Escape') {
      onClose?.()
    }
  }

  const handleSelect = (place) => {
    onSelect?.(place)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-md glass rounded-t-2xl md:rounded-2xl overflow-hidden max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-4 border-b border-trip-border/40">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-trip-muted" />
            <input
              ref={inputRef}
              type="text"
              value={keyword}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="搜索地点名称..."
              className="input-base pl-9"
            />
            {loading && (
              <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-trip-muted animate-spin" />
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-trip-cloud/50 flex items-center justify-center text-trip-muted hover:bg-trip-cloud transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="p-4 text-center text-sm text-trip-amber">
              {error}
            </div>
          )}
          
          {!loading && !error && results.length === 0 && keyword.trim().length > 0 && (
            <div className="p-8 text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-trip-muted/50" />
              <p className="text-sm text-trip-muted">未找到相关地点</p>
              <p className="text-xs text-trip-muted/70 mt-1">试试其他关键词</p>
            </div>
          )}
          
          {!loading && results.length === 0 && keyword.trim().length === 0 && (
            <div className="p-8 text-center">
              <Search className="w-8 h-8 mx-auto mb-2 text-trip-muted/50" />
              <p className="text-sm text-trip-muted">输入关键词搜索地点</p>
              <p className="text-xs text-trip-muted/70 mt-1">支持景点、餐厅、商场等</p>
            </div>
          )}
          
          {results.map((place, idx) => (
            <button
              key={place.amapPoiId || idx}
              onClick={() => handleSelect(place)}
              className="w-full p-3 flex items-start gap-3 card-interactive text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-trip-mint-pale flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-trip-mint" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-trip-ink truncate">{place.name}</div>
                <div className="text-xs text-trip-muted mt-0.5 flex items-center gap-1.5">
                  {place.district && <span>{place.district}</span>}
                  {place.address && <span className="truncate">· {place.address}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-trip-border/40 bg-trip-cloud/20">
          <p className="text-[11px] text-trip-muted/70 text-center">
            数据来源：高德地图
          </p>
        </div>
      </div>
    </div>
  )
}
