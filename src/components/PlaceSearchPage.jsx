import { useState, useCallback, useEffect, useRef } from 'react'
import { ArrowLeft, Search, MapPin, Plus, Navigation, X, Trash2 } from 'lucide-react'

// force recompile 2025-01
const AMAP_KEY = '942f298093937afa211f61802dbb9e87'

export default function PlaceSearchPage({ onBack, onAddPin, onUpdatePin, onRemovePin, destination, currentPins, selectedPin }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [map, setMap] = useState(null)
  const [selectedResult, setSelectedResult] = useState(null)
  const [toast, setToast] = useState(null)
  const mapContainerRef = useRef(null)
  const searchTimerRef = useRef(null)
  const pinMarkersRef = useRef([])
  const searchMarkerRef = useRef(null)

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  const searchAmapPoi = useCallback(async (keyword, city) => {
    try {
      const url = `https://restapi.amap.com/v3/place/text?keywords=${encodeURIComponent(keyword)}&city=${encodeURIComponent(city)}&key=${AMAP_KEY}&output=json&offset=10&page=1&extensions=base`
      const res = await fetch(url)
      const data = await res.json()
      if (data.status === '1' && data.pois) {
        return data.pois.map(poi => ({
          id: poi.id,
          name: poi.name,
          address: poi.address || poi.pname + poi.cityname + poi.adname,
          lat: parseFloat(poi.location.split(',')[1]),
          lng: parseFloat(poi.location.split(',')[0]),
          kind: 'amap-poi',
        }))
      }
      return []
    } catch (e) {
      console.error('AMap search error:', e)
      return []
    }
  }, [])

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    setIsSearching(true)

    const existingPins = currentPins.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3).map(pin => ({
      ...pin,
      kind: 'existing-pin',
    }))

    const amapResults = await searchAmapPoi(searchQuery, destination?.name || '全国')
    setSearchResults([...existingPins, ...amapResults])
    setIsSearching(false)
  }, [searchQuery, currentPins, destination?.name, searchAmapPoi])

  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }
    if (searchQuery.trim()) {
      searchTimerRef.current = setTimeout(() => {
        handleSearch()
      }, 300)
    } else {
      setSearchResults([])
    }
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
      }
    }
  }, [searchQuery, handleSearch])

  useEffect(() => {
    if (!AMAP_KEY || !mapContainerRef.current) return

    if (window.AMap) {
      initMap()
      return
    }

    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}`
    script.async = true
    script.onload = () => initMap()
    script.onerror = () => console.error('AMap load failed')
    document.head.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  const initMap = () => {
    const amap = new window.AMap.Map(mapContainerRef.current, {
      zoom: 12,
      center: destination?.coords || [116.4074, 39.9042],
    })
    setMap(amap)
    setMapLoaded(true)
  }

  // 渲染当前行程中的点位
  useEffect(() => {
    if (!mapLoaded || !map || !window.AMap) return

    pinMarkersRef.current.forEach(m => m.setMap(null))
    pinMarkersRef.current = []

    const validPins = currentPins.filter(p => p.lat && p.lng && !isNaN(p.lat) && !isNaN(p.lng))
    if (validPins.length === 0) return

    const newMarkers = validPins.map((pin, idx) => {
      const marker = new window.AMap.Marker({
        position: [pin.lng, pin.lat],
        title: pin.name,
        label: {
          content: `<div style="padding:4px 8px;background:#2DD4BF;color:white;border-radius:12px;font-size:12px;font-weight:bold;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.15)">${idx + 1}</div>`,
          direction: 'top',
        },
      })
      marker.setMap(map)
      return marker
    })

    pinMarkersRef.current = newMarkers
    map.setFitView(newMarkers, false, [60, 60, 60, 60])
  }, [mapLoaded, map, currentPins])

  const focusOnMap = useCallback((result) => {
    if (!map || !result.lat || !result.lng) return
    map.setCenter([result.lng, result.lat])
    map.setZoom(15)

    if (searchMarkerRef.current) {
      searchMarkerRef.current.setMap(null)
    }
    const newMarker = new window.AMap.Marker({
      position: [result.lng, result.lat],
      title: result.name,
      label: {
        content: `<div style="padding:4px 8px;background:#F56565;color:white;border-radius:12px;font-size:12px;font-weight:bold;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.15)">${result.name}</div>`,
        direction: 'top',
      },
    })
    newMarker.setMap(map)
    searchMarkerRef.current = newMarker
    setSelectedResult(result)
  }, [map])

  const handleAddPin = useCallback((result) => {
    if (result.kind === 'existing-pin') {
      showToast(`${result.name} 已在行程中`)
      return
    }
    onAddPin({
      name: result.name,
      address: result.address,
      lat: result.lat,
      lng: result.lng,
    })
    showToast(`已添加"${result.name}"到当前天`)
    setSearchResults([])
    setSearchQuery('')
  }, [onAddPin])

  const handleReplacePin = useCallback((result) => {
    if (!selectedPin || result.kind !== 'amap-poi') return
    onUpdatePin(selectedPin, {
      name: result.name,
      address: result.address,
      lat: result.lat,
      lng: result.lng,
    })
    showToast(`已替换为"${result.name}"`)
    onBack()
  }, [selectedPin, onUpdatePin, onBack])

  const handleRemovePin = useCallback(() => {
    if (!selectedPin) return
    const pin = currentPins.find(p => p.id === selectedPin)
    if (pin) {
      onRemovePin(selectedPin)
      showToast(`已删除"${pin.name}"`)
      onBack()
    }
  }, [selectedPin, currentPins, onRemovePin, onBack])

  return (
    <div className="min-h-screen bg-trip-bg pt-16">
      <div className="sticky top-16 z-40 glass border-b border-trip-border/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-trip-cloud text-trip-slate transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-trip-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索地点，如：故宫、天安门..."
              className="input-base pl-10"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-trip-amber border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)]">
        <div className="md:w-80 flex-shrink-0 overflow-y-auto bg-white border-b md:border-b-0 md:border-r border-trip-border/30">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-trip-slate">搜索结果</h3>
              {selectedPin && (
                <span className="tag tag-coral">
                  已选中：{currentPins.find(p => p.id === selectedPin)?.name}
                </span>
              )}
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-8 text-trip-muted text-sm">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>输入关键词搜索地点</p>
                <p className="text-xs mt-1">支持搜索高德地图POI</p>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className={`p-3 rounded-xl card-interactive cursor-pointer ${
                      selectedResult?.id === result.id
                        ? 'bg-trip-mint-pale'
                        : ''
                    }`}
                    onClick={() => focusOnMap(result)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-trip-amber flex-shrink-0" />
                          <span className="font-medium text-sm text-trip-ink truncate">
                            {result.name}
                          </span>
                          {result.kind === 'existing-pin' && (
                            <span className="tag">已添加</span>
                          )}
                        </div>
                        <p className="text-xs text-trip-muted mt-0.5 truncate">
                          {result.address}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddPin(result)
                        }}
                        className="p-1.5 rounded-lg bg-trip-amber/10 text-trip-amber hover:bg-trip-amber hover:text-white transition-colors flex-shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {selectedPin && result.kind === 'amap-poi' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleReplacePin(result)
                        }}
                        className="w-full mt-2 py-1.5 rounded-lg border border-trip-amber/30 text-trip-amber text-xs font-medium hover:bg-trip-amber/5 transition-colors"
                      >
                        替换当前选中点
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 relative">
          <div ref={mapContainerRef} className="w-full h-full" />

          {selectedResult && (
            <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-xl border border-trip-border/30 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-trip-amber" />
                    <h4 className="font-semibold text-trip-ink">{selectedResult.name}</h4>
                  </div>
                  <p className="text-sm text-trip-muted mt-1">{selectedResult.address}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleAddPin(selectedResult)}
                      className="flex-1 py-2 rounded-xl bg-trip-amber text-white text-sm font-medium hover:bg-trip-amber transition-colors"
                    >
                      + 添加到当前天
                    </button>
                    {selectedPin && (
                      <button
                        onClick={() => handleReplacePin(selectedResult)}
                        className="px-4 py-2 rounded-xl border border-trip-amber text-trip-amber text-sm font-medium hover:bg-trip-amber/5 transition-colors"
                      >
                        替换
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="p-1 rounded-lg hover:bg-trip-cloud text-trip-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {selectedPin && (
            <div className="absolute top-4 right-4 bg-white rounded-xl shadow-lg border border-trip-border/30 p-3">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-trip-amber" />
                <span className="text-sm font-medium text-trip-ink truncate max-w-24">
                  {currentPins.find(p => p.id === selectedPin)?.name}
                </span>
              </div>
              <button
                onClick={handleRemovePin}
                className="mt-2 w-full py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-3 h-3 inline mr-1" />
                删除此点
              </button>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-trip-ink text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50">
          {toast}
        </div>
      )}
    </div>
  )
}