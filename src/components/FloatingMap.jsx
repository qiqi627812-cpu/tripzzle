import { useState, useEffect, useRef, useCallback } from 'react'
import { X, MapPin, Plus, Trash2, ZoomIn, ZoomOut, Locate, Navigation, ExternalLink, XCircle, Search, Map, AlertCircle, Loader2, Check, Target, Replace } from 'lucide-react'
import { buildMapLinks, openMapLink } from '../utils/mapLinks'
import { projectPinsToMockMap, buildDayRoutes } from '../utils/mapPins'

const AMAP_KEY = '942f298093937afa211f61802dbb9e87'

// force recompile

function MockFloatingMap({ pins, destination, onUpdatePin, onAddPin, onRemovePin, mode, setNavPlace, mapRef }) {
  const [selectedPin, setSelectedPin] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [toast, setToast] = useState(null)
  const [showHelp, setShowHelp] = useState(true)

  const projectedPins = projectPinsToMockMap(pins)
  const routes = buildDayRoutes(projectedPins)
  
  if (projectedPins.length >= 2 && routes.length === 0) {
    console.warn('MockMap: No routes generated but projectedPins has', projectedPins.length, 'points.')
    console.log('MockMap: projectedPins:', JSON.stringify(projectedPins.slice(0, 5), null, 2))
  }

  const showToast = (message, duration = 2500) => {
    setToast(message)
    setTimeout(() => setToast(null), duration)
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    setTimeout(() => {
      const filtered = pins.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSearchResults(filtered.map(pin => ({
        ...pin,
        kind: 'existing-pin',
      })))
      setIsSearching(false)
    }, 300)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleAddCustomPin = () => {
    if (!searchQuery.trim()) return
    const defaultLat = destination?.lat || 39.9042
    const defaultLng = destination?.lon || 116.4074
    onAddPin({
      name: searchQuery.trim(),
      address: '',
      lat: defaultLat,
      lng: defaultLng,
    })
    showToast(`已添加"${searchQuery.trim()}"，可在真实地图模式拖动调整位置`)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleLocatePin = (pin) => {
    setSelectedPin(pin.id)
    showToast(`已选中：${pin.name}`)
  }

  const handleAddPinToCurrentDay = (result) => {
    if (result.kind === 'existing-pin') {
      showToast(`${result.name} 已在行程中`)
      return
    }
    onAddPin({
      name: result.name,
      address: result.address || '',
      lat: result.lat,
      lng: result.lng,
    })
    showToast(`已添加"${result.name}"到当前天`)
    setSearchResults([])
  }

  const handleReplacePin = (result) => {
    if (!selectedPin) return
    onUpdatePin(selectedPin, {
      name: result.name,
      address: result.address || '',
      lat: result.lat,
      lng: result.lng,
    })
    showToast(`已替换为"${result.name}"`)
    setSelectedPin(null)
    setSearchResults([])
  }

  const handleZoomIn = () => {
    showToast('示意图模式不支持缩放')
  }

  const handleZoomOut = () => {
    showToast('示意图模式不支持缩放')
  }

  const handleLocate = () => {
    if (!navigator.geolocation) {
      showToast('浏览器不支持定位')
      return
    }
    showToast('示意图模式不支持定位')
  }

  const sortedPins = [...projectedPins].sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day
    return (a.time || '00:00').localeCompare(b.time || '00:00')
  })

  return (
    <div className="relative w-full h-full bg-trip-bg overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(45,106,79,0.06)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="absolute inset-0">
        <svg className="w-full h-full" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice">
          {routes.map((route, routeIdx) => {
            if (route.path.length < 2) return null
            return (
              <path
                key={routeIdx}
                d={route.path.map((pos, idx) => {
                  const x = (parseFloat(pos[0]) / 100) * 400
                  const y = (parseFloat(pos[1]) / 100) * 250
                  return idx === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
                }).join(' ')}
                fill="none"
                stroke="#0D9488"
                strokeWidth={mode === 'all' ? 2 : 3}
                strokeDasharray={mode === 'all' ? '6 4' : '8 4'}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.5}
              />
            )
          })}
        </svg>
      </div>

      {sortedPins.map((pin, idx) => {
        const isCustom = pin.isCustom
        return (
          <div
            key={pin.id}
            className={`absolute -translate-x-1/2 -translate-y-full cursor-pointer z-10 transition-transform hover:scale-105 ${
              selectedPin === pin.id ? 'scale-105' : ''
            }`}
            style={{ top: pin.top, left: pin.left }}
            onClick={(e) => {
              e.stopPropagation()
              setSelectedPin(selectedPin === pin.id ? null : pin.id)
              setShowHelp(false)
            }}
          >
            <div className="relative">
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-lg border-2 border-white ${
                isCustom ? 'bg-trip-coral' : 'bg-trip-mint'
              }`}>
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/30 text-white text-[10px] font-bold shrink-0">
                  {idx + 1}
                </span>
                <span className="text-white text-xs font-medium whitespace-nowrap max-w-[140px] overflow-hidden text-ellipsis">
                  {pin.name}
                </span>
              </div>
              <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 rounded-lg bg-trip-ink text-white text-xs font-semibold whitespace-nowrap z-20 shadow-lg ${
                selectedPin === pin.id ? 'opacity-100' : 'opacity-0 pointer-events-none'
              } transition-opacity`}>
                <div>{pin.name}</div>
                {pin.day && <div className="text-trip-mint-pale text-[10px]">第{pin.day}天</div>}
                {pin.time && <div className="text-trip-mint-pale text-[10px]">{pin.time}</div>}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-trip-ink rotate-45" />
              </div>
            </div>
          </div>
        )
      })}

      <div className="absolute bottom-4 left-4 px-4 py-2.5 rounded-xl bg-trip-surface/90 border border-trip-border">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-trip-mint" />
          <span className="font-bold text-trip-ink">{destination?.name}</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button 
          onClick={handleZoomIn}
          className="w-10 h-10 rounded-xl glass flex items-center justify-center text-trip-slate opacity-50 cursor-not-allowed"
          title="示意图不支持缩放"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button 
          onClick={handleZoomOut}
          className="w-10 h-10 rounded-xl glass flex items-center justify-center text-trip-slate opacity-50 cursor-not-allowed"
          title="示意图不支持缩放"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button 
          onClick={handleLocate}
          className="w-10 h-10 rounded-xl glass flex items-center justify-center text-trip-slate opacity-50 cursor-not-allowed"
          title="示意图不支持定位"
        >
          <Locate className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute top-4 left-4 bg-trip-blue/10 text-trip-blue flex items-center gap-1.5">
        <Map className="w-3.5 h-3.5" />
        示意图 · {pins.length}个点位
      </div>

      <div className="absolute bottom-4 right-4">
        <button
          onClick={() => setShowHelp(prev => !prev)}
          className="w-12 h-12 rounded-full btn-primary flex items-center justify-center transition-all hover:scale-105"
          title="添加点位"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {selectedPin && (() => {
        const pin = pins.find(p => p.id === selectedPin)
        if (!pin) return null
        const hasCoords = pin.lat && pin.lng && !isNaN(pin.lat) && !isNaN(pin.lng)
        return (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 glass rounded-xl p-4 max-w-xs">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                pin.isCustom ? 'bg-trip-coral' : 'bg-trip-mint'
              }`}>
                {sortedPins.findIndex(p => p.id === pin.id) + 1}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-trip-ink">{pin.name}</div>
                {pin.day && <div className="text-xs text-trip-muted">第{pin.day}天</div>}
                {pin.time && <div className="text-xs text-trip-muted">{pin.time}</div>}
              </div>
              <div className="flex items-center gap-1">
                {hasCoords && (
                  <button
                    onClick={() => setNavPlace(pin)}
                    className="p-2 rounded-lg text-trip-muted hover:text-trip-mint hover:bg-trip-mint-pale transition-colors"
                    title="导航"
                  >
                    <Navigation className="w-4 h-4" />
                  </button>
                )}
                {pin.isCustom && (
                  <button
                    onClick={() => { onRemovePin(pin.id); setSelectedPin(null) }}
                    className="p-2 rounded-lg text-trip-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {toast && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-trip-ink/85 text-white text-sm rounded-lg shadow-lg z-50 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {toast}
        </div>
      )}
    </div>
  )
}

function AMapFloatingMap({ pins, destination, onUpdatePin, onAddPin, onRemovePin, mode, setNavPlace, mapRef }) {
  const mapContainerRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [selectedPin, setSelectedPin] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [toast, setToast] = useState(null)
  const [showHelp, setShowHelp] = useState(true)
  const [currentLocation, setCurrentLocation] = useState(null)
  const markersRef = useRef([])
  const polylinesRef = useRef([])
  const lastPinsLengthRef = useRef(0)
  const searchTimerRef = useRef(null)
  const hasAutoLocatedRef = useRef(false)
  const searchAbortRef = useRef(null)

  const showToast = (message, duration = 2500) => {
    setToast(message)
    setTimeout(() => setToast(null), duration)
  }

  const searchAmapPoi = useCallback(async (keyword) => {
    if (searchAbortRef.current) {
      searchAbortRef.current.abort()
    }
    const controller = new AbortController()
    searchAbortRef.current = controller

    try {
      const city = destination?.name || '全国'
      const url = `https://restapi.amap.com/v3/place/text?keywords=${encodeURIComponent(keyword)}&city=${encodeURIComponent(city)}&key=${AMAP_KEY}&output=json&offset=5&page=1&extensions=base`
      const res = await fetch(url, { signal: controller.signal })
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
      if (e.name === 'AbortError') return []
      console.error('AMap search error:', e)
      return []
    }
  }, [destination?.name])

  const getPoiDetail = useCallback(async (poiId) => {
    try {
      const url = `https://restapi.amap.com/v3/place/detail?id=${poiId}&key=${AMAP_KEY}&output=json&extensions=base`
      const res = await fetch(url)
      const data = await res.json()
      if (data.status === '1' && data.pois && data.pois[0]) {
        const poi = data.pois[0]
        return {
          name: poi.name,
          address: poi.address,
          lat: parseFloat(poi.location.split(',')[1]),
          lng: parseFloat(poi.location.split(',')[0]),
        }
      }
      return null
    } catch (e) {
      console.error('AMap detail error:', e)
      return null
    }
  }, [])

  useEffect(() => {
    if (!AMAP_KEY) {
      setMapError(true)
      return
    }

    if (window.AMap) {
      setMapLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}`
    script.async = true
    script.onload = () => {
      setMapLoaded(true)
    }
    script.onerror = () => setMapError(true)
    document.head.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  useEffect(() => {
    if (!mapLoaded || !window.AMap) return
  }, [mapLoaded, destination?.name])

  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || !window.AMap) return

    if (!mapRef.current) {
      mapRef.current = new window.AMap.Map(mapContainerRef.current, {
        zoom: 12,
        center: [destination?.lon || 116.4074, destination?.lat || 39.9042],
        mapStyle: 'amap://styles/whitesmoke',
      })
    }

    const map = mapRef.current
    const pinsWithCoords = pins.filter(item => item.lat && item.lng && !isNaN(item.lat) && !isNaN(item.lng))
    const routes = buildDayRoutes(pinsWithCoords)
    
    if (pinsWithCoords.length >= 2 && routes.length === 0) {
      console.warn('AMap: No routes generated but pinsWithCoords has', pinsWithCoords.length, 'points.')
      console.log('AMap: pinsWithCoords:', JSON.stringify(pinsWithCoords.slice(0, 5), null, 2))
    }
    
    const shouldFitView = pinsWithCoords.length !== lastPinsLengthRef.current

    markersRef.current.forEach(m => m.setMap(null))
    polylinesRef.current.forEach(p => p.setMap(null))
    markersRef.current = []
    polylinesRef.current = []

    markersRef.current = pinsWithCoords.map((item, idx) => {
      const isCustom = item.isCustom
      const bgColor = isCustom ? '#EA6A33' : '#0D9488'
      const directions = ['top', 'bottom', 'left', 'right']
      const labelDir = directions[idx % directions.length]
      const labelOffsets = { top: [0, -8], bottom: [0, 36], left: [-8, 14], right: [8, 14] }
      const [offX, offY] = labelOffsets[labelDir]

      const marker = new window.AMap.Marker({
        position: [item.lng, item.lat],
        title: item.name,
        draggable: true,
        cursor: 'move',
        zIndex: 100 + idx,
        content: `<div style="position:relative;display:flex;flex-direction:column;align-items:center;">
          <div style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:${bgColor};color:white;border-radius:999px;font-size:12px;font-weight:500;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.15);white-space:nowrap;max-width:160px;overflow:hidden;text-overflow:ellipsis;transform:translate(${offX}px,${offY}px);">
            <span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;background:rgba(255,255,255,0.3);border-radius:50%;font-size:10px;font-weight:bold;flex-shrink:0">${idx + 1}</span>
            <span>${item.name}</span>
          </div>
          <div style="width:14px;height:14px;background:${bgColor};border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.2);margin-top:4px;"></div>
        </div>`,
        offset: new window.AMap.Pixel(-7, -7),
        anchor: 'center',
      })
      marker.on('click', () => {
        setSelectedPin(item.id)
        setShowHelp(false)
      })
      marker.on('dragend', (e) => {
        onUpdatePin(item.id, {
          lat: e.lnglat.getLat(),
          lng: e.lnglat.getLng(),
        })
        marker.setPosition([e.lnglat.getLng(), e.lnglat.getLat()])
      })
      marker.setMap(map)
      return marker
    })

    polylinesRef.current = routes.map((route) => {
      const polyline = new window.AMap.Polyline({
        path: route.path,
        strokeColor: '#0D9488',
        strokeWeight: mode === 'all' ? 3 : 4,
        strokeOpacity: 0.5,
        strokeStyle: 'dashed',
        strokeDasharray: mode === 'all' ? [6, 4] : [8, 6],
        lineJoin: 'round',
      })
      polyline.setMap(map)
      return polyline
    })

    if (shouldFitView && markersRef.current.length > 0) {
      const allOverlays = [...markersRef.current, ...polylinesRef.current]
      map.setFitView(allOverlays, false, [60, 60, 60, 60])
    }

    lastPinsLengthRef.current = pinsWithCoords.length

    return () => {
      markersRef.current.forEach(m => m.setMap(null))
      polylinesRef.current.forEach(p => p.setMap(null))
    }
  }, [mapLoaded, pins, destination?.id, mode])

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    setIsSearching(true)

    const existingPins = pins.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3).map(pin => ({
      ...pin,
      kind: 'existing-pin',
    }))

    const amapResults = await searchAmapPoi(searchQuery)
    setSearchResults([...existingPins, ...amapResults])
    setIsSearching(false)
  }, [pins, searchQuery, searchAmapPoi])

  const handleInputChange = useCallback((e) => {
    const value = e.target.value
    setSearchQuery(value)
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }
    if (value.trim()) {
      searchTimerRef.current = setTimeout(() => {
        handleSearch()
      }, 300)
    } else {
      setSearchResults([])
    }
  }, [handleSearch])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
      }
      handleSearch()
    }
  }, [handleSearch])

  const handleLocatePin = useCallback(async (result) => {
    if (result.kind === 'existing-pin') {
      setSelectedPin(result.id)
      if (mapRef.current && result.lat && result.lng) {
        mapRef.current.setCenter([result.lng, result.lat])
        mapRef.current.setZoom(14)
      }
      showToast(`已定位：${result.name}`)
    } else if (result.kind === 'amap-poi') {
      const detail = await getPoiDetail(result.id)
      if (detail && mapRef.current) {
        mapRef.current.setCenter([detail.lng, detail.lat])
        mapRef.current.setZoom(15)
      }
      showToast(`已定位：${result.name}`)
    }
  }, [getPoiDetail, mapRef])

  const handleAddPinToCurrentDay = useCallback(async (result) => {
    if (result.kind === 'existing-pin') {
      showToast(`${result.name} 已在行程中`)
      return
    }
    const detail = await getPoiDetail(result.id)
    if (detail) {
      onAddPin({
        name: detail.name,
        address: detail.address,
        lat: detail.lat,
        lng: detail.lng,
      })
      showToast(`已添加"${detail.name}"到当前天`)
      setSearchResults([])
    }
  }, [getPoiDetail, onAddPin])

  const handleReplacePin = useCallback(async (result) => {
    if (!selectedPin) return
    if (result.kind === 'amap-poi') {
      const detail = await getPoiDetail(result.id)
      if (detail) {
        onUpdatePin(selectedPin, {
          name: detail.name,
          address: detail.address,
          lat: detail.lat,
          lng: detail.lng,
        })
        showToast(`已替换为"${detail.name}"`)
        setSelectedPin(null)
        setSearchResults([])
      }
    }
  }, [selectedPin, getPoiDetail, onUpdatePin])

  const handleAddCustomPin = useCallback(() => {
    if (!searchQuery.trim()) return
    const defaultLat = destination?.lat || 39.9042
    const defaultLng = destination?.lon || 116.4074
    onAddPin({
      name: searchQuery.trim(),
      address: '',
      lat: defaultLat,
      lng: defaultLng,
    })
    showToast(`已添加"${searchQuery.trim()}"，可拖动调整位置`)
    setSearchQuery('')
    setSearchResults([])
  }, [searchQuery, destination, onAddPin])

  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomIn()
    }
  }, [])

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomOut()
    }
  }, [])

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      showToast('浏览器不支持定位')
      return
    }
    showToast('正在获取位置...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        if (mapRef.current) {
          mapRef.current.setCenter([lng, lat])
          mapRef.current.setZoom(14)
        }
        setCurrentLocation({ lat, lng })
        showToast('已定位到当前位置')
      },
      (error) => {
        showToast('定位失败：' + error.message)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  useEffect(() => {
    if (mapLoaded && mapRef.current && !hasAutoLocatedRef.current && navigator.geolocation) {
      hasAutoLocatedRef.current = true
      handleLocate()
    }
  }, [mapLoaded, handleLocate])

  if (mapError) {
    return <MockFloatingMap pins={pins} destination={destination} onUpdatePin={onUpdatePin} onAddPin={onAddPin} onRemovePin={onRemovePin} mode={mode} setNavPlace={setNavPlace} mapRef={mapRef} />
  }

  const sortedPins = [...pins].sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day
    return (a.time || '00:00').localeCompare(b.time || '00:00')
  })

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-trip-cloud">
          <div className="text-trip-muted flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-trip-mint border-t-transparent rounded-full animate-spin" />
            地图加载中...
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button 
          onClick={handleZoomIn}
          className="w-10 h-10 rounded-xl glass flex items-center justify-center text-trip-slate"
          title="放大"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button 
          onClick={handleZoomOut}
          className="w-10 h-10 rounded-xl glass flex items-center justify-center text-trip-slate"
          title="缩小"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button 
          onClick={handleLocate}
          className="w-10 h-10 rounded-xl glass flex items-center justify-center text-trip-slate"
          title="定位当前位置"
        >
          <Locate className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute bottom-4 right-4">
        <button
          onClick={() => setShowHelp(prev => !prev)}
          className="w-12 h-12 rounded-full btn-primary flex items-center justify-center transition-all hover:scale-105"
          title="添加点位"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {selectedPin && (() => {
        const pin = pins.find(p => p.id === selectedPin)
        if (!pin) return null
        const hasCoords = pin.lat && pin.lng && !isNaN(pin.lat) && !isNaN(pin.lng)
        return (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 glass rounded-xl p-4 max-w-xs">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                pin.isCustom ? 'bg-trip-coral' : 'bg-trip-mint'
              }`}>
                {sortedPins.findIndex(p => p.id === pin.id) + 1}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-trip-ink">{pin.name}</div>
                {pin.day && <div className="text-xs text-trip-muted">第{pin.day}天</div>}
                {pin.time && <div className="text-xs text-trip-muted">{pin.time}</div>}
              </div>
              <div className="flex items-center gap-1">
                {hasCoords && (
                  <button
                    onClick={() => setNavPlace(pin)}
                    className="p-2 rounded-lg text-trip-muted hover:text-trip-mint hover:bg-trip-mint-pale transition-colors"
                    title="导航"
                  >
                    <Navigation className="w-4 h-4" />
                  </button>
                )}
                {pin.isCustom && (
                  <button
                    onClick={() => { onRemovePin(pin.id); setSelectedPin(null) }}
                    className="p-2 rounded-lg text-trip-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {toast && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-trip-ink/85 text-white text-sm rounded-lg shadow-lg z-50 flex items-center gap-2">
          <Check className="w-4 h-4" />
          {toast}
        </div>
      )}
    </div>
  )
}

function NavActionSheet({ place, onClose }) {
  const links = buildMapLinks(place)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass rounded-t-2xl p-4 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-trip-ink">选择导航方式</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-trip-cloud transition-colors">
            <XCircle className="w-5 h-5 text-trip-muted" />
          </button>
        </div>
        <div className="space-y-2">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                openMapLink(link)
                onClose()
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-trip-mint-pale/50 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                link.id === 'amap' ? 'bg-trip-mint-pale text-trip-mint' :
                link.id === 'baidu' ? 'bg-trip-fog-pale text-trip-slate' :
                link.id === 'tencent' ? 'bg-trip-fog-pale text-trip-slate' :
                link.id === 'apple' ? 'bg-trip-cloud text-trip-slate' :
                link.id === 'google' ? 'bg-trip-rose-pale text-trip-rose' :
                'bg-trip-cloud text-trip-muted'
              }`}>
                <Navigation className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-trip-ink">{link.label}</div>
              </div>
              <ExternalLink className="w-4 h-4 text-trip-muted" />
            </button>
          ))}
        </div>
        <div className="mt-4 h-2 bg-trip-cloud rounded-full" />
      </div>
    </div>
  )
}

export default function FloatingMap({ pins, destination, preferences, onClose, onUpdatePin, onAddPin, onRemovePin, mode, onModeChange, totalDays, embedded = false }) {
  const [navPlace, setNavPlace] = useState(null)
  const mapRef = useRef(null)

  const days = totalDays > 0 ? Array.from({ length: totalDays }, (_, i) => i + 1) : Array.from(new Set(pins.map(p => p.day))).sort((a, b) => a - b)
  const selectedDay = mode.startsWith('day-') ? Number(mode.split('-')[1]) : null
  const visiblePins = selectedDay ? pins.filter(pin => Number(pin.day) === selectedDay) : pins

  return (
    <div className={embedded ? 'relative h-full min-h-[540px]' : 'fixed inset-0 z-50'}>
      {!embedded && <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />}
      <div className={embedded ? 'absolute inset-0 bg-white rounded-2xl border border-trip-border shadow-card overflow-hidden' : 'absolute inset-x-4 bottom-4 top-20 bg-white rounded-xl shadow-xl overflow-hidden'}>
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-trip-mint-pale flex items-center justify-center">
              <MapPin className="w-5 h-5 text-trip-mint" />
            </div>
            <div>
              <h3 className="font-semibold text-trip-ink">行程地图</h3>
              <p className="text-xs text-trip-muted">{visiblePins.length}个点位 · {destination?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 overflow-x-auto max-w-[200px]">
              <button
                onClick={() => onModeChange('all')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors shrink-0 ${
                  mode === 'all' ? 'bg-trip-mint text-white' : 'glass text-trip-slate'
                }`}
              >
                全部
              </button>
              {days.map(dayNum => (
                <button
                  key={dayNum}
                  onClick={() => onModeChange(`day-${dayNum}`)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors shrink-0 ${
                    mode === `day-${dayNum}` ? 'bg-trip-mint text-white' : 'glass text-trip-slate'
                  }`}
                >
                  第{dayNum}天
                </button>
              ))}
            </div>
            {!embedded && (
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl glass flex items-center justify-center text-trip-slate shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        <div className="pt-16 h-full">
          {visiblePins.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-trip-muted">
              <MapPin className="w-16 h-16 text-trip-border mb-4" />
              <p className="text-sm font-medium text-trip-slate">当前行程没有可定位点</p>
              <p className="text-xs text-trip-muted mt-1">请重新生成行程或为地点补充坐标</p>
            </div>
          ) : AMAP_KEY ? (
            <AMapFloatingMap pins={visiblePins} destination={destination} onUpdatePin={onUpdatePin} onAddPin={onAddPin} onRemovePin={onRemovePin} mode={mode} setNavPlace={setNavPlace} mapRef={mapRef} />
          ) : (
            <MockFloatingMap pins={visiblePins} destination={destination} onUpdatePin={onUpdatePin} onAddPin={onAddPin} onRemovePin={onRemovePin} mode={mode} setNavPlace={setNavPlace} mapRef={mapRef} />
          )}
        </div>
      </div>
      {navPlace && (
        <NavActionSheet place={navPlace} onClose={() => setNavPlace(null)} />
      )}
    </div>
  )
}
