import { useEffect, useRef, useState } from 'react'
import Navigation from './components/Navigation'
import HomePage from './components/HomePage'
import AIPlanPage from './components/AIPlanPage'
import GuidePage from './components/GuidePage'
import ExpenseTracker from './components/ExpenseTracker'
import PackingPage from './components/PackingPage'
import WeatherPage from './components/WeatherPage'
import FavoritesPage from './components/FavoritesPage'
import ReminderPage from './components/ReminderPage'
import ItineraryDetailPage from './components/ItineraryDetailPage'
import PlaceSearchPage from './components/PlaceSearchPage'
import MapPage from './components/MapPage'
import PaperPlaneCursor from './components/PaperPlaneCursor'

export default function App() {
  const appRef = useRef(null)
  const [currentPage, setCurrentPage] = useState(() => {
    const requestedPage = new URLSearchParams(window.location.search).get('page')
    return ['itinerary', 'map'].includes(requestedPage) ? requestedPage : 'home'
  })
  const [importedGuideData, setImportedGuideData] = useState(null)
  const [itineraryData, setItineraryData] = useState(null)
  const [itineraryDestinationId, setItineraryDestinationId] = useState(null)
  const [itineraryDestinationData, setItineraryDestinationData] = useState(null)
  const [itineraryPreferences, setItineraryPreferences] = useState(null)
  const [placeSearchPins, setPlaceSearchPins] = useState(null)
  const [placeSearchSelectedPin, setPlaceSearchSelectedPin] = useState(null)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [currentPage])

  const handleGuideImport = (data) => {
    setImportedGuideData(data)
    setCurrentPage('ai-plan')
  }

  const normalizeItineraryPayload = (payload) => {
    if (!payload) return { days: [], warnings: [], removed: [], alternatives: [], validation: null, stats: null }
    if (Array.isArray(payload)) {
      return {
        days: payload,
        warnings: [],
        removed: [],
        alternatives: [],
        validation: null,
        stats: null,
      }
    }
    return {
      days: payload.days || [],
      warnings: payload.warnings || [],
      removed: payload.removed || [],
      alternatives: payload.alternatives || [],
      validation: payload.validation || null,
      stats: payload.stats || null,
    }
  }

  const handlePlaceSearchAdd = (place) => {
    const normalized = normalizeItineraryPayload(itineraryData)
    const newItem = {
      id: `custom-${Date.now()}`,
      name: place.name,
      type: 'custom',
      typeLabel: '自定义',
      lat: place.lat,
      lng: place.lng,
      address: place.address,
      time: '09:00',
      durationMinutes: 30,
      isCustom: true,
    }
    if (normalized.days.length > 0) {
      normalized.days[0].items.push(newItem)
    } else {
      normalized.days.push({ date: new Date().toISOString().split('T')[0], items: [newItem] })
    }
    setItineraryData(normalized)
    localStorage.setItem('tripzzle_saved_itinerary', JSON.stringify(normalized))
  }

  const handlePlaceSearchUpdate = (pinId, patch) => {
    const normalized = normalizeItineraryPayload(itineraryData)
    normalized.days.forEach(day => {
      day.items.forEach(item => {
        if (item.id === pinId) {
          Object.assign(item, patch)
        }
      })
    })
    setItineraryData(normalized)
    localStorage.setItem('tripzzle_saved_itinerary', JSON.stringify(normalized))
  }

  const handlePlaceSearchRemove = (pinId) => {
    const normalized = normalizeItineraryPayload(itineraryData)
    normalized.days.forEach(day => {
      day.items = day.items.filter(item => item.id !== pinId)
    })
    setItineraryData(normalized)
    localStorage.setItem('tripzzle_saved_itinerary', JSON.stringify(normalized))
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onPageChange={setCurrentPage} />
      case 'ai-plan':
        return <AIPlanPage importedGuideData={importedGuideData} clearImportedGuideData={() => setImportedGuideData(null)} onPageChange={setCurrentPage} onGenerateItinerary={(data, destId, prefs, destinationData) => { setItineraryData(data); setItineraryDestinationId(destId); setItineraryDestinationData(destinationData || null); setItineraryPreferences(prefs); setCurrentPage('itinerary') }} />
      case 'guide':
        return <GuidePage onPageChange={setCurrentPage} onImportGuide={handleGuideImport} />
      case 'itinerary':
        return <ItineraryDetailPage itinerary={itineraryData} destinationId={itineraryDestinationId} destinationData={itineraryDestinationData} preferences={itineraryPreferences} onBack={() => setCurrentPage('home')} onOpenMap={() => setCurrentPage('map')} onPlaceSearch={(pins, selectedPin) => { setCurrentPage('placeSearch'); setPlaceSearchPins(pins); setPlaceSearchSelectedPin(selectedPin) }} />
      case 'map':
        return <MapPage itinerary={itineraryData} destinationId={itineraryDestinationId} destinationData={itineraryDestinationData} preferences={itineraryPreferences} onPageChange={setCurrentPage} />
      case 'placeSearch':
        return <PlaceSearchPage onBack={() => setCurrentPage('itinerary')} destination={itineraryDestinationData || { name: itineraryDestinationId === 'beijing' ? '北京' : itineraryDestinationId === 'shanghai' ? '上海' : '全国' }} currentPins={placeSearchPins || []} selectedPin={placeSearchSelectedPin} onAddPin={(place) => handlePlaceSearchAdd(place)} onUpdatePin={(id, patch) => handlePlaceSearchUpdate(id, patch)} onRemovePin={(id) => handlePlaceSearchRemove(id)} />
      case 'favorites':
        return <FavoritesPage />
      case 'expense':
        return <ExpenseTracker />
      case 'packing':
        return <PackingPage />
      case 'weather':
        return <WeatherPage />
      case 'reminder':
        return <ReminderPage />
      default:
        return <HomePage onPageChange={setCurrentPage} />
    }
  }

  return (
    <div
      ref={appRef}
      className={`app-page app-page-${currentPage} min-h-screen bg-trip-bg`}
    >
      <PaperPlaneCursor />
      <div className="app-page-scenery" aria-hidden="true">
        <span className="app-page-orb app-page-orb-a" />
        <span className="app-page-orb app-page-orb-b" />
      </div>
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      {renderPage()}
    </div>
  )
}
