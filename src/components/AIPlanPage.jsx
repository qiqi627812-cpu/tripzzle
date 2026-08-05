import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Ban,
  CalendarDays,
  Clock3,
  Heart,
  LockKeyhole,
  MapPin,
  Route,
  Sparkles,
  WandSparkles,
} from 'lucide-react'
import SafeImage from './SafeImage'
import { flattenPool, getAllDestinations } from '../data/destinations'
import { getAiTripIntake } from '../services/aiTripIntakeService'
import { getAiPlanningAdvice } from '../services/aiPlanningService'
import { generateItinerary } from '../services/itineraryService'
import { discoverAmapDestination } from '../services/amapPlaceService'
import AnimalPageHero from './AnimalPageHero'
import AnimalProgress from './AnimalProgress'

const stateOptions = [
  { id: 'must', label: '必去', icon: LockKeyhole },
  { id: 'interested', label: '想去', icon: Heart },
  { id: 'avoid', label: '不去', icon: Ban },
]

const kindStyles = {
  fact: 'bg-trip-fog-pale text-trip-fog-dark border-trip-fog/20',
  hard: 'bg-trip-coral-pale text-trip-coral-dark border-trip-coral/20',
  soft: 'bg-trip-mint-pale text-trip-mint-dark border-trip-mint/20',
}

const paceLabels = {
  relaxed: '悠闲',
  moderate: '适中',
  busy: '紧凑',
}

function inferDestinationName(brief, destinations, fallbackName) {
  const knownDestination = destinations.find((destination) => brief.includes(destination.name))
  if (knownDestination) return knownDestination.name

  const patterns = [
    /(?:想去|准备去|计划去|要去|去|到|在)([\u4e00-\u9fa5]{2,10}?)(?=(?:玩|旅行|旅游|待|住|自由行|[一二三四五六七八九十两\d]+天|，|,|。|；|;|$))/,
    /([\u4e00-\u9fa5]{2,8})(?=[一二三四五六七八九十两\d]+日游)/,
  ]
  for (const pattern of patterns) {
    const match = brief.match(pattern)
    if (match?.[1]) return match[1]
  }
  return String(fallbackName || '').trim()
}

function getImpactText(item) {
  if (item.isFullDay) return '约占 1 天 · 建议单独安排'
  if (item.isRemote) return `${item.duration || '半天'} · 远郊往返`
  if (item.type === 'food') return `${item.areaLabel || item.area || '市区'} · 餐食候选`
  return `${item.duration || '约 2 小时'} · ${item.areaLabel || item.area || '市区'}`
}

function inferImportedDays(text) {
  const match = String(text || '').match(/(\d{1,2})\s*[天日]/)
  const days = Number(match?.[1])
  return Number.isFinite(days) && days > 0 && days <= 30 ? days : 3
}

export default function AIPlanPage({
  selectedCityId = 'beijing',
  importedGuideData = null,
  clearImportedGuideData,
  onPageChange,
  onGenerateItinerary,
}) {
  const destinations = useMemo(() => getAllDestinations(), [])
  const [destinationId, setDestinationId] = useState(selectedCityId)
  const initialDestination = destinations.find((item) => item.id === selectedCityId) || destinations[0]
  const [destinationQuery, setDestinationQuery] = useState(initialDestination.name)
  const [dynamicDestination, setDynamicDestination] = useState(null)
  const [dynamicCandidates, setDynamicCandidates] = useState([])
  const [activeCandidates, setActiveCandidates] = useState(null)
  const [importedSourceText, setImportedSourceText] = useState('')
  const [brief, setBrief] = useState('')
  const [intake, setIntake] = useState(null)
  const [placeStates, setPlaceStates] = useState({})
  const [analyzing, setAnalyzing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [generationStatus, setGenerationStatus] = useState('')
  const [discoveryStatus, setDiscoveryStatus] = useState('')

  const destination = useMemo(
    () => dynamicDestination
      || destinations.find((item) => item.id === destinationId)
      || destinations[0],
    [destinationId, destinations, dynamicDestination],
  )

  const candidates = useMemo(
    () => activeCandidates
      || (dynamicDestination
        ? dynamicCandidates
        : flattenPool(destination).filter((item) => item.type !== 'accommodation')),
    [activeCandidates, destination, dynamicDestination, dynamicCandidates],
  )

  useEffect(() => {
    if (!importedGuideData) return

    const importedItems = (importedGuideData.items || [])
      .filter((item) => item?.name && item.type !== 'accommodation')
      .map((item, index) => ({
        ...item,
        id: item.id || `guide-place-${index}`,
      }))
    if (importedItems.length === 0) {
      clearImportedGuideData?.()
      return
    }

    const localDestination = destinations.find((item) => (
      item.id === importedGuideData.cityId
      || item.name === importedGuideData.cityName
    ))
    const averageCoordinate = (key) => {
      const values = importedItems.map((item) => Number(item[key])).filter(Number.isFinite)
      return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
    }
    const importedDestination = localDestination || {
      id: importedGuideData.cityId || `guide-${Date.now()}`,
      name: importedGuideData.cityName || '导入目的地',
      lat: averageCoordinate('lat'),
      lng: averageCoordinate('lng'),
      source: 'guide-import',
      pool: {},
    }
    const sourceText = String(importedGuideData.sourceText || '').trim()
    const days = inferImportedDays(sourceText)

    setDestinationId(importedDestination.id)
    setDestinationQuery(importedDestination.name)
    setDynamicDestination(localDestination ? null : importedDestination)
    setDynamicCandidates(localDestination ? [] : importedItems)
    setActiveCandidates(importedItems)
    setImportedSourceText(sourceText)
    setBrief(`已导入一篇${importedDestination.name}旅行攻略，请优先保留攻略中的地点，并根据实际路程合理安排。`)
    setIntake({
      summary: `已从攻略中识别 ${importedItems.length} 个地点，接下来可确认取舍并交给 AI 排程。`,
      days,
      pace: 'moderate',
      transport: 'subway',
      startTime: '09:00',
      constraints: [
        { label: `攻略已导入 ${importedItems.length} 个地点`, kind: 'fact' },
      ],
      missingQuestions: [],
      recommendations: importedItems.map((item) => ({
        placeId: item.id,
        reason: '来自导入攻略',
        suggestedState: (item.tags || []).some((tag) => String(tag).includes('必去'))
          ? 'must'
          : 'interested',
      })),
      provider: 'guide-import',
      model: 'guide-import',
    })
    setPlaceStates(Object.fromEntries(importedItems.map((item) => [
      item.id,
      (item.tags || []).some((tag) => String(tag).includes('必去')) ? 'must' : 'interested',
    ])))
    setError('')
    setGenerationStatus('')
    clearImportedGuideData?.()
  }, [importedGuideData, destinations])

  const recommendations = useMemo(() => {
    if (!intake) return []
    const candidateById = new Map(candidates.map((item) => [item.id, item]))
    return intake.recommendations
      .map((recommendation) => {
        const item = candidateById.get(recommendation.placeId)
        return item ? { ...item, recommendationReason: recommendation.reason } : null
      })
      .filter(Boolean)
  }, [intake, candidates])

  const groupedRecommendations = useMemo(() => {
    return recommendations.reduce((groups, item) => {
      const group = item.areaLabel || item.area || '市区'
      if (!groups[group]) groups[group] = []
      groups[group].push(item)
      return groups
    }, {})
  }, [recommendations])

  const activeCount = recommendations.filter((item) => placeStates[item.id] !== 'avoid').length
  const mustCount = recommendations.filter((item) => placeStates[item.id] === 'must').length

  const resetResult = () => {
    setIntake(null)
    setPlaceStates({})
    setError('')
    setGenerationStatus('')
  }

  const analyzeBrief = async () => {
    if (!brief.trim() || analyzing) return
    setAnalyzing(true)
    setError('')
    setGenerationStatus('')
    setDiscoveryStatus('')

    try {
      const inferredName = inferDestinationName(brief, destinations, destinationQuery)
      if (!inferredName) {
        throw new Error('DESTINATION_REQUIRED')
      }

      const localDestination = destinations.find((item) => (
        item.name === inferredName
        || `${item.name}市` === inferredName
        || inferredName.includes(item.name)
      ))
      let inferredDestination
      let inferredCandidates

      if (localDestination) {
        inferredDestination = localDestination
        const localCandidates = flattenPool(localDestination)
          .filter((item) => item.type !== 'accommodation')
        inferredCandidates = Array.from(new Map(
          [...(activeCandidates || []), ...localCandidates].map((item) => [item.id, item]),
        ).values())
        setDynamicDestination(null)
        setDynamicCandidates([])
      } else {
        setDiscoveryStatus(`正在从高德搜索${inferredName}的真实地点…`)
        const discovered = await discoverAmapDestination(inferredName)
        inferredDestination = discovered.destination
        inferredCandidates = Array.from(new Map(
          [...(activeCandidates || []), ...discovered.candidates].map((item) => [item.id, item]),
        ).values())
        setDynamicDestination(discovered.destination)
        setDynamicCandidates(inferredCandidates)
      }

      setDestinationId(inferredDestination.id)
      setDestinationQuery(inferredDestination.name)
      setActiveCandidates(inferredCandidates)
      setDiscoveryStatus(`已从高德找到 ${inferredCandidates.length} 个候选地点，豆包正在筛选…`)

      const result = await getAiTripIntake({
        destination: inferredDestination,
        brief: brief.trim(),
        candidates: inferredCandidates,
      })
      setIntake(result)
      setPlaceStates(Object.fromEntries(
        result.recommendations.map((item) => [item.placeId, item.suggestedState]),
      ))
    } catch (aiError) {
      console.error('AI trip intake failed:', aiError)
      if (aiError?.message === 'DESTINATION_REQUIRED' || aiError?.message === 'DESTINATION_NOT_FOUND') {
        setError('没有找到这个目的地，请检查城市名称后重试。')
      } else if (String(aiError?.message || '').startsWith('AMAP_')) {
        setError('高德暂时没有返回足够的地点，请稍后重试。')
      } else if (/AI_HTTP_5\d\d|AI_NOT_CONFIGURED|AI_PROVIDER_ERROR/.test(String(aiError?.message || ''))) {
        setError('AI 服务暂时不可用，请确认本地服务已启动后重试。')
      } else {
        setError('AI 暂时没有理解成功，请稍后再试，或换一种更简短的说法。')
      }
    } finally {
      setAnalyzing(false)
      setDiscoveryStatus('')
    }
  }

  const generate = async () => {
    if (!intake || generating) return
    const selectedItems = recommendations
      .filter((item) => placeStates[item.id] !== 'avoid')
      .map((item) => ({
        ...item,
        tags: [
          ...(item.tags || []),
          placeStates[item.id] === 'must' ? '用户必去' : '用户感兴趣',
        ],
      }))

    if (selectedItems.length === 0) {
      setError('请至少保留一个想去的地点。')
      return
    }

    const preferences = {
      days: intake.days,
      pace: intake.pace,
      transport: intake.transport,
      startTime: intake.startTime,
    }
    const mustNames = selectedItems
      .filter((item) => placeStates[item.id] === 'must')
      .map((item) => item.name)
    const userNotes = [
      brief.trim(),
      importedSourceText ? `导入攻略原文：\n${importedSourceText}` : '',
      mustNames.length ? `用户明确必去：${mustNames.join('、')}` : '',
      `AI 已提取约束：${intake.constraints.map((item) => item.label).join('；')}`,
    ].filter(Boolean).join('\n')

    setGenerating(true)
    setError('')
    setGenerationStatus('豆包正在安排每天的地点组合与顺序…')

    try {
      let aiPlan = null
      try {
        aiPlan = await getAiPlanningAdvice({
          destination,
          items: selectedItems,
          preferences,
          userNotes,
        })
        setGenerationStatus('AI 已完成规划，正在校验远郊、餐食和路线…')
      } catch (aiError) {
        console.warn('AI planning unavailable, using fallback planner:', aiError)
        setGenerationStatus('AI 排程暂时不可用，正在使用安全兜底方案…')
      }

      const result = await generateItinerary(
        destination.id,
        selectedItems,
        preferences,
        preferences.days,
        null,
        [],
        { aiPlan, destination },
      )
      onGenerateItinerary?.(result, destination.id, preferences, destination)
    } catch (generateError) {
      console.error('AI itinerary generation failed:', generateError)
      setError('行程生成失败，请重试。')
      setGenerationStatus('')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <main className="min-h-screen bg-trip-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <AnimalPageHero
          role="catPlanning"
          eyebrow="规划小猫 · AI 行程规划"
          title="说说旅行愿望，小猫来把路线排好"
          subtitle="告诉它同行者、天数和最在意的事；小猫会理解约束、推荐地点，再交给 AI 安排每天的路线。"
        >
          <div className="grid max-w-lg grid-cols-3 gap-2 text-center">
            {[
              ['01', '描述旅行'],
              ['02', '确认地点'],
              ['03', '生成行程'],
            ].map(([number, label], index) => (
              <div
                key={number}
                className={`rounded-xl border px-3 py-2 ${
                  (index === 0 && !intake) || (index === 1 && intake)
                    ? 'border-[#8ea080]/40 bg-white/80'
                    : 'border-[#d9cfbd]/70 bg-[#fffaf0]/55'
                }`}
              >
                <div className="text-[10px] font-semibold text-[#6f8062]">{number}</div>
                <div className="mt-0.5 text-xs font-medium text-trip-ink">{label}</div>
              </div>
            ))}
          </div>
        </AnimalPageHero>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <section className="card overflow-hidden">
          <div className="grid lg:grid-cols-[1.6fr_0.8fr]">
            <div className="p-5 sm:p-7">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-trip-mint-pale text-trip-mint flex items-center justify-center shrink-0">
                  <WandSparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-trip-ink">这次想怎么旅行？</h2>
                  <p className="text-sm text-trip-muted mt-0.5">描述同行者、天数和偏好，AI 会据此理解你的旅行需求。</p>
                </div>
              </div>

              <label htmlFor="ai-trip-brief" className="sr-only">描述这次旅行</label>
              <textarea
                id="ai-trip-brief"
                value={brief}
                onChange={(event) => setBrief(event.target.value.slice(0, 5000))}
                rows={5}
                placeholder="例如：国庆带妈妈从上海去北京玩 4 天，住王府井，故宫必须去，少走路，不想早起。"
                className="input-base min-h-[142px] resize-y"
              />

              <div className="mt-3 flex items-center gap-1.5 text-xs text-trip-muted">
                <span>已经有小红书、马蜂窝攻略？</span>
                <button
                  type="button"
                  onClick={() => onPageChange?.('guide')}
                  className="font-medium text-trip-mint-dark hover:text-trip-mint underline underline-offset-2"
                >
                  去攻略解析
                </button>
              </div>
            </div>

            <div className="border-t border-white/70 bg-white/20 p-5 backdrop-blur-lg sm:p-7 lg:border-l lg:border-t-0 flex flex-col">
              <div>
                <label htmlFor="ai-destination" className="text-xs font-semibold text-trip-muted">
                  目的地
                </label>
                <div className="relative mt-2">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-trip-mint" />
                  <input
                    id="ai-destination"
                    value={destinationQuery}
                    onChange={(event) => {
                      setDestinationQuery(event.target.value.slice(0, 40))
                      setDynamicDestination(null)
                      setDynamicCandidates([])
                      setActiveCandidates(null)
                      setImportedSourceText('')
                      resetResult()
                    }}
                    placeholder="输入任意国内城市，如西安、大理"
                    className="input-base pl-9"
                  />
                </div>
                <p className="text-xs text-trip-muted mt-3">
                  支持高德覆盖的国内城市；描述里出现城市时会自动识别。
                </p>
              </div>

              <div className="mt-auto pt-6">
                <button
                  type="button"
                  onClick={analyzeBrief}
                  disabled={!brief.trim() || analyzing}
                  className="btn-primary w-full min-h-[48px]"
                >
                  {analyzing ? (
                    discoveryStatus || '正在理解并挑选地点…'
                  ) : (
                    <>
                      让 AI 搭第一版
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
        {analyzing && (
          <AnimalProgress
            role="catPlanning"
            label={discoveryStatus || '规划小猫正在理解你的旅行愿望…'}
            detail="正在搜索目的地、筛选地点并整理约束"
            className="mt-5"
          />
        )}

        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-trip-rose/20 bg-trip-rose-pale px-4 py-3 text-sm text-trip-rose-dark" role="alert">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {intake && (
          <div className="mt-8 animate-fade-up">
            <section>
              <div className="card p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-trip-mint uppercase tracking-wider">AI 已理解</div>
                    <h2 className="text-xl font-semibold text-trip-ink mt-1">{intake.summary}</h2>
                  </div>
                  <Sparkles className="w-5 h-5 text-trip-mint shrink-0" />
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-trip-border bg-trip-cloud px-3 py-1.5 text-sm text-trip-slate">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {intake.days} 天
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-trip-border bg-trip-cloud px-3 py-1.5 text-sm text-trip-slate">
                    <Clock3 className="w-3.5 h-3.5" />
                    {intake.startTime} · {paceLabels[intake.pace]}
                  </span>
                  {intake.constraints.map((constraint, index) => (
                    <span
                      key={`${constraint.label}-${index}`}
                      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm ${kindStyles[constraint.kind] || kindStyles.soft}`}
                    >
                      {constraint.label}
                    </span>
                  ))}
                </div>
              </div>

            </section>

            <section className="mt-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-trip-mint uppercase tracking-wider">AI 推荐池</div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-trip-ink mt-1">
                    先从 {recommendations.length} 个地点开始
                  </h2>
                  <p className="text-sm text-trip-muted mt-2">
                    按区域分组。把真正不能错过的标成“必去”，不合适的直接设为“不去”。
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-trip-muted">
                  <span className="tag tag-coral">{mustCount} 个必去</span>
                  <span className="tag tag-active">{activeCount} 个保留</span>
                </div>
              </div>

              <div className="mt-6 space-y-7">
                {Object.entries(groupedRecommendations).map(([group, items]) => (
                  <div key={group}>
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-trip-mint" />
                      <h3 className="text-sm font-semibold text-trip-ink">{group}</h3>
                      <span className="text-xs text-trip-muted">{items.length} 个候选</span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {items.map((item) => {
                        const currentState = placeStates[item.id] || 'interested'
                        return (
                          <article
                            key={item.id}
                            className={`card overflow-hidden transition-all ${
                              currentState === 'avoid'
                                ? 'opacity-60 grayscale-[0.35]'
                                : currentState === 'must'
                                  ? 'border-trip-coral/35 shadow-glow-coral'
                                  : 'hover:shadow-elevated'
                            }`}
                          >
                            <div className="flex">
                              <SafeImage
                                src={item.image}
                                alt={item.name}
                                fallbackText={item.name}
                                className="w-28 sm:w-36 min-h-44 object-cover shrink-0 bg-trip-cloud"
                              />
                              <div className="p-4 min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <h4 className="font-semibold text-trip-ink leading-snug">{item.name}</h4>
                                      {item.needsReservation && (
                                        <span className="tag tag-coral shrink-0">需预约</span>
                                      )}
                                    </div>
                                    <p className="text-xs text-trip-muted mt-1 flex items-center gap-1">
                                      <Route className="w-3.5 h-3.5" />
                                      {getImpactText(item)}
                                    </p>
                                  </div>
                                </div>

                                <p className="text-sm text-trip-slate mt-3 line-clamp-2">
                                  {item.recommendationReason}
                                </p>

                                <div className="mt-4 grid grid-cols-3 gap-1 p-1 bg-trip-cloud rounded-lg border border-trip-border/60">
                                  {stateOptions.map((option) => {
                                    const Icon = option.icon
                                    const isSelected = currentState === option.id
                                    return (
                                      <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => setPlaceStates((previous) => ({
                                          ...previous,
                                          [item.id]: option.id,
                                        }))}
                                        className={`min-h-[36px] rounded-md flex items-center justify-center gap-1 text-xs font-medium transition-colors ${
                                          isSelected
                                            ? option.id === 'must'
                                              ? 'bg-trip-coral text-white'
                                              : option.id === 'avoid'
                                                ? 'bg-trip-slate text-white'
                                                : 'bg-trip-surface text-trip-mint-dark shadow-card'
                                            : 'text-trip-muted hover:text-trip-ink'
                                        }`}
                                        aria-pressed={isSelected}
                                      >
                                        <Icon className="w-3.5 h-3.5" />
                                        {option.label}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          </article>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-8 sticky bottom-4 z-20">
              <div className="glass rounded-2xl shadow-overlay px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-trip-ink">
                    {activeCount} 个地点 · {intake.days} 天 · {paceLabels[intake.pace]}节奏
                  </div>
                  <p className="text-xs text-trip-muted mt-1">
                    AI 会优先满足 {mustCount} 个“必去”，并校验远郊和餐食安排。
                  </p>
                  {generationStatus && (
                    <p className="text-xs text-trip-mint-dark mt-1" role="status" aria-live="polite">
                      {generationStatus}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={generate}
                  disabled={generating || activeCount === 0}
                  className="btn-primary min-h-[48px] sm:min-w-48"
                >
                  {generating ? (
                    '正在生成…'
                  ) : (
                    <>
                      生成第一版行程
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
              {generating && (
                <AnimalProgress
                  role="catPlanning"
                  label={generationStatus || '规划小猫正在安排每天的路线…'}
                  detail="AI 正在组合地点、交通和餐食，并进行可执行性校验"
                  className="mt-4"
                />
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  )
}
