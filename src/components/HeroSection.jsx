import { useState, useEffect, useRef } from 'react'
import { Search, Calendar, Users, Palette, MapPin, ChevronRight, Link2, BookOpen, Loader2, CheckCircle2, XCircle, Landmark, UtensilsCrossed, ArrowRight, Globe, AlertTriangle, Mic, MicOff, Send, Edit3, Settings } from 'lucide-react'
import { getAllDestinations } from '../data/destinations'
import { parseGuide, getParsedItemsDetails } from '../services/guideParserService'
import { parseItinerary, validateItinerary } from '../services/itineraryParserService'
import { startRecording, stopRecording, recognizeSpeechBaidu, getBaiduConfig, setBaiduConfig } from '../services/speechService'

const dayOptions = ['2 天 1 晚', '3 天 2 晚', '4 天 3 晚', '5 天 4 晚', '7 天 6 晚']
const peopleOptions = ['情侣', '闺蜜', '亲子', '独自', '家庭', '朋友']
const styleOptions = ['经典必去', '拍照出片', '美食优先', '小众探店', '亲子友好', '文艺清新', '户外徒步', '历史文化']

const modes = [
  { id: 'select', label: '网站选择', icon: Search, desc: '在本站挑选景点美食' },
  { id: 'text', label: '输入规划', icon: Edit3, desc: '语音或文字描述行程' },
  { id: 'import', label: '攻略导入', icon: Link2, desc: '粘贴小红书/马蜂窝链接' },
]

export default function HeroSection({ heroState, setHeroState, onStart, onCityChange, onImportGuide }) {
  const destinations = getAllDestinations()
  const [activeMode, setActiveMode] = useState('select')
  const [guideInput, setGuideInput] = useState('')
  const [parseStatus, setParseStatus] = useState('idle')
  const [parseResult, setParseResult] = useState(null)
  const [customItems, setCustomItems] = useState([])
  const [voiceText, setVoiceText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  const [showApiSettings, setShowApiSettings] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const recordingTimerRef = useRef(null)
  const [recordTime, setRecordTime] = useState(0)

  useEffect(() => {
    const config = getBaiduConfig()
    setApiKey(config.apiKey)
    setSecretKey(config.secretKey)
  }, [])

  const handleCitySelect = (cityName) => {
    setHeroState({ ...heroState, query: cityName })
    const map = { '北京': 'beijing', '上海': 'shanghai', '成都': 'chengdu', '重庆': 'chongqing' }
    if (map[cityName] && onCityChange) onCityChange(map[cityName])
  }

  const toggleStyle = (style) => {
    const current = heroState.styles || []
    const next = current.includes(style)
      ? current.filter((s) => s !== style)
      : current.length < 4 ? [...current, style] : current
    setHeroState({ ...heroState, styles: next })
  }

  const handleGuideParse = async () => {
    if (!guideInput.trim()) return
    setParseStatus('loading')
    setParseResult(null)
    setCustomItems([])
    try {
      const result = await parseGuide(guideInput)
      if (result.success && result.items && result.items.length > 0) {
        const details = getParsedItemsDetails(result.items, result.cityId)
        setParseResult({ ...result, details })
        setParseStatus('success')
      } else if (result.success && result.items && result.items.length === 0 && result.candidates && result.candidates.length === 0) {
        setParseStatus('empty')
        setParseResult(result)
      } else if (result.success) {
        const details = getParsedItemsDetails(result.items, result.cityId)
        setParseResult({ ...result, details })
        setParseStatus('success')
      } else if (result.error === 'FETCH_FAILED' || result.error === 'NO_CONTENT') {
        setParseStatus('fetch_failed')
        setParseResult(result)
      } else {
        setParseStatus('empty')
      }
    } catch (error) {
      setParseStatus('error')
    }
  }

  const addCustomItem = (name, type) => {
    const newItem = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      description: '自定义添加',
      type,
      typeLabel: type === 'attraction' ? '景点' : '美食',
      duration: type === 'attraction' ? '1.5小时' : '1小时',
      location: parseResult?.cityName || '市区',
      tags: ['自定义'],
      isCustom: true,
    }
    setCustomItems(prev => [...prev, newItem])
  }

  const removeCustomItem = (id) => {
    setCustomItems(prev => prev.filter(item => item.id !== id))
  }

  const handleConfirmImport = async () => {
    if (!parseResult || !onImportGuide || isImporting) return
    const allItems = [...(parseResult.details || []), ...customItems]
    setIsImporting(true)
    try {
      await onImportGuide({
        cityId: parseResult.cityId,
        cityName: parseResult.cityName,
        items: allItems,
      })
      setGuideInput('')
      setParseStatus('idle')
      setParseResult(null)
      setCustomItems([])
    } finally {
      setIsImporting(false)
    }
  }

  const toggleRecording = async () => {
    setVoiceError('')
    if (isRecording) {
      setIsRecording(false)
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
        recordingTimerRef.current = null
      }
      setIsVoiceProcessing(true)
      try {
        const audioBlob = await stopRecording()
        const text = await recognizeSpeechBaidu(audioBlob, apiKey, secretKey)
        setVoiceText((prev) => prev + text)
      } catch (error) {
        setVoiceError(error.message || '语音识别失败')
      } finally {
        setIsVoiceProcessing(false)
        setRecordTime(0)
      }
    } else {
      try {
        await startRecording()
        setIsRecording(true)
        setRecordTime(0)
        recordingTimerRef.current = setInterval(() => {
          setRecordTime((t) => t + 1)
        }, 1000)
      } catch (error) {
        setVoiceError(error.message || '录音失败')
      }
    }
  }

  const handleVoiceSubmit = async () => {
    if (!voiceText.trim()) return
    setIsVoiceProcessing(true)
    const found = ['北京','上海','重庆','成都','广州','澳门'].find((name) => voiceText.includes(name))
    const cityMap = { 北京: 'beijing', 上海: 'shanghai', 重庆: 'chongqing', 成都: 'chengdu', 广州: 'guangzhou', 澳门: 'macau' }
    let destId = heroState.query
    if (found && cityMap[found]) {
      destId = cityMap[found]
      if (onCityChange) onCityChange(destId)
    } else {
      const dest = destinations.find(d => d.name === heroState.query)
      destId = dest?.id || 'beijing'
    }
    const parsed = parseItinerary(voiceText, destId)
    const validation = validateItinerary(parsed)
    if (!validation.isValid) {
      alert(validation.errors.join('\n'))
      setIsVoiceProcessing(false)
      return
    }
    const allItems = []
    parsed.days.forEach((day) => {
      day.items.forEach((item) => {
        if (!allItems.find((i) => i.id === item.id)) {
          allItems.push(item)
        }
      })
    })
    if (allItems.length > 0) {
      const fullItems = getParsedItemsDetails(allItems, destId)
      if (onImportGuide) {
        onImportGuide({
          cityId: destId,
          cityName: found || heroState.query,
          items: fullItems,
        })
      }
    }
    setHeroState((prev) => ({
      ...prev,
      days: `${parsed.days.length} 天 ${parsed.days.length - 1} 晚`,
      query: found || prev.query,
    }))
    setIsVoiceProcessing(false)
  }

  const handleSaveApiConfig = () => {
    setBaiduConfig(apiKey, secretKey)
    setShowApiSettings(false)
    setVoiceError('')
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <section className="bg-trip-bg relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -right-32 w-[36rem] h-[36rem] rounded-full bg-trip-mint-pale opacity-30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-20 lg:py-24">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-trip-mint-pale px-3.5 py-1.5 text-xs font-semibold text-trip-mint mb-5">
            <Globe className="w-3.5 h-3.5" />
            AI 智能行程规划
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold font-display text-trip-ink leading-[1.1] tracking-tight">
            让每一次旅行
            <br />
            <span className="text-gradient">都恰到好处</span>
          </h1>
          <p className="mt-5 text-base text-trip-slate max-w-xl mx-auto">
            选择目的地，挑喜欢的景点，自动生成合理行程
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {modes.map((mode) => {
            const Icon = mode.icon
            const isActive = activeMode === mode.id
            return (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                  isActive
                    ? 'bg-trip-mint-pale text-trip-mint border-trip-mint/20'
                    : 'bg-trip-surface text-trip-slate border-trip-border hover:border-trip-border-dark'
                }`}
              >
                <Icon className="w-4 h-4" />
                {mode.label}
              </button>
            )
          })}
        </div>

        {/* Form card */}
        <div className="rounded-2xl bg-trip-surface shadow-card border border-trip-border px-6 py-6 sm:px-8 sm:py-8">
          {activeMode === 'select' && (
            <div className="space-y-6">
              {/* 目的地 */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-trip-ink">
                  <MapPin className="w-4 h-4 text-trip-mint" />
                  目的地
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {destinations.map((dest) => {
                    const isActive = heroState.query === dest.name
                    return (
                      <button
                        key={dest.id}
                        onClick={() => handleCitySelect(dest.name)}
                        className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all duration-150 ${
                          isActive
                            ? 'bg-trip-mint-pale text-trip-mint border-trip-mint/20'
                            : 'bg-trip-surface text-trip-slate border-trip-border hover:border-trip-border-dark'
                        }`}
                      >
                        {dest.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 天数 */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-trip-ink">
                  <Calendar className="w-4 h-4 text-trip-mint" />
                  天数
                </label>
                <div className="flex flex-wrap gap-2">
                  {dayOptions.map((d) => {
                    const isActive = heroState.days === d
                    return (
                      <button
                        key={d}
                        onClick={() => setHeroState({ ...heroState, days: d })}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                          isActive
                            ? 'bg-trip-mint-pale text-trip-mint border-trip-mint/20'
                            : 'bg-trip-surface text-trip-slate border-trip-border hover:border-trip-border-dark'
                        }`}
                      >
                        {d}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 同行人 */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-trip-ink">
                  <Users className="w-4 h-4 text-trip-mint" />
                  同行人
                </label>
                <div className="flex flex-wrap gap-2">
                  {peopleOptions.map((p) => {
                    const isActive = heroState.people === p
                    return (
                      <button
                        key={p}
                        onClick={() => setHeroState({ ...heroState, people: p })}
                        className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                          isActive
                            ? 'bg-trip-mint-pale text-trip-mint border-trip-mint/20'
                            : 'bg-trip-surface text-trip-slate border-trip-border hover:border-trip-border-dark'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 旅行风格 */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-trip-ink">
                  <Palette className="w-4 h-4 text-trip-mint" />
                  旅行风格 <span className="text-xs font-normal text-trip-faint">（最多4个）</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {styleOptions.map((s) => {
                    const isActive = heroState.styles?.includes(s)
                    return (
                      <button
                        key={s}
                        onClick={() => toggleStyle(s)}
                        className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                          isActive
                            ? 'bg-trip-mint-pale text-trip-mint border-trip-mint/20'
                            : 'bg-trip-surface text-trip-slate border-trip-border hover:border-trip-border-dark'
                        }`}
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>

              <button
                onClick={onStart}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-trip-mint px-5 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:bg-trip-mint-dark active:scale-[0.98]"
              >
                <Search className="w-5 h-5" />
                开始规划
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {activeMode === 'text' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-semibold text-trip-ink">
                  <Edit3 className="w-4 h-4 text-trip-mint" />
                  描述你的行程
                </label>
                <button
                  onClick={() => setShowApiSettings(!showApiSettings)}
                  className="inline-flex items-center gap-1 text-xs text-trip-muted hover:text-trip-mint transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  语音设置
                </button>
              </div>

              {showApiSettings && (
                <div className="p-3.5 bg-trip-cloud rounded-xl space-y-2.5 border border-trip-border">
                  <p className="text-xs text-trip-muted leading-relaxed">线上环境已由后端安全代理，无需填写。此面板仅供本地开发调试。</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="API Key" className="input-base text-xs" />
                    <input type="text" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} placeholder="Secret Key" className="input-base text-xs" />
                  </div>
                  <button onClick={handleSaveApiConfig} className="btn-secondary text-xs py-1.5">保存配置</button>
                </div>
              )}

              <textarea
                value={voiceText}
                onChange={(e) => setVoiceText(e.target.value)}
                placeholder="北京3天游，第一天去故宫和天安门，中午吃北京烤鸭，晚上逛南锣鼓巷..."
                rows={4}
                className="input-base resize-none text-sm"
              />

              <div className="flex gap-2">
                <button
                  onClick={toggleRecording}
                  disabled={isVoiceProcessing}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                    isRecording
                      ? 'bg-trip-coral text-white'
                      : 'bg-trip-mint text-white hover:bg-trip-mint-light'
                  }`}
                >
                  {isRecording ? (
                    <><MicOff className="w-4 h-4" /> 停止 {formatTime(recordTime)}</>
                  ) : isVoiceProcessing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> 识别中</>
                  ) : (
                    <><Mic className="w-4 h-4" /> 语音输入</>
                  )}
                </button>
                <button
                  onClick={handleVoiceSubmit}
                  disabled={!voiceText.trim() || isVoiceProcessing}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-trip-amber px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-trip-amber-dark active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  生成攻略
                </button>
              </div>

              {voiceError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-trip-warning-pale border border-trip-amber/30 text-trip-amber text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">{voiceError}</div>
                    <div className="text-trip-muted mt-0.5">也可直接在输入框打字描述行程</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeMode === 'import' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-trip-ink">
                  <Link2 className="w-4 h-4 text-trip-mint" />
                  粘贴攻略链接或文本
                </label>
                <textarea
                  value={guideInput}
                  onChange={(e) => setGuideInput(e.target.value)}
                  placeholder="粘贴小红书/马蜂窝链接，或直接输入攻略文本..."
                  rows={4}
                  className="input-base resize-none text-sm"
                />
              </div>

              {parseStatus === 'loading' && (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 className="w-4 h-4 text-trip-mint animate-spin" />
                  <span className="text-sm text-trip-muted">
                    {guideInput.trim().startsWith('http') ? '抓取网页并解析中...' : '解析中...'}
                  </span>
                </div>
              )}

              {parseStatus === 'error' && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-trip-error-pale border border-trip-error/30 text-trip-error text-xs">
                  <XCircle className="w-4 h-4 shrink-0" />
                  解析失败，请检查输入后重试
                </div>
              )}

              {parseStatus === 'fetch_failed' && (
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-trip-warning-pale border border-trip-amber/30 text-trip-amber text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">无法自动抓取该网页</div>
                      <div className="text-trip-muted mt-0.5">请手动复制攻略文本粘贴到输入框</div>
                    </div>
                  </div>
                  <button onClick={() => { setParseStatus('idle'); setParseResult(null) }} className="btn-secondary text-xs w-full">重试</button>
                </div>
              )}

              {parseStatus === 'empty' && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-trip-warning-pale border border-trip-amber/30 text-trip-amber text-xs">
                  <XCircle className="w-4 h-4 shrink-0" />
                  未识别到景点，请输入包含景点名称的攻略
                </div>
              )}

              {parseStatus === 'success' && parseResult && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-trip-mint-pale border border-trip-mint/30">
                    <CheckCircle2 className="w-4 h-4 text-trip-mint shrink-0" />
                    <span className="text-sm font-semibold text-trip-mint">
                      识别到 {parseResult.itemCount} 个地点
                    </span>
                  </div>

                  {parseResult.details && parseResult.details.length > 0 && (
                    <div className="bg-trip-cloud rounded-xl p-3.5 max-h-40 overflow-y-auto">
                      {parseResult.details.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 py-1.5 border-b border-trip-border last:border-0">
                          {item.type === 'attraction' ? (
                            <Landmark className="w-3.5 h-3.5 text-trip-mint shrink-0" />
                          ) : (
                            <UtensilsCrossed className="w-3.5 h-3.5 text-trip-amber shrink-0" />
                          )}
                          <span className="text-sm font-medium text-trip-ink truncate">{item.name}</span>
                          <span className="text-xs text-trip-muted ml-auto">{item.type === 'attraction' ? '景点' : '美食'}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {parseResult.candidates && parseResult.candidates.length > 0 && (
                    <div className="bg-trip-cloud rounded-xl p-3.5">
                      <div className="text-xs text-trip-muted mb-2">还提到了这些地点</div>
                      <div className="flex flex-wrap gap-1.5">
                        {parseResult.candidates.map((word) => {
                          const isAdded = customItems.some(item => item.name === word)
                          return (
                            <div key={word} className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs border ${isAdded ? 'bg-trip-mint-pale border-trip-mint/30 text-trip-mint' : 'bg-trip-surface border-trip-border text-trip-slate'}`}>
                              <span>{word}</span>
                              {!isAdded && (
                                <>
                                  <button onClick={() => addCustomItem(word, 'attraction')} className="text-trip-mint hover:bg-trip-mint-pale rounded p-0.5" title="加为景点">
                                    <Landmark className="w-3 h-3" />
                                  </button>
                                  <button onClick={() => addCustomItem(word, 'food')} className="text-trip-amber hover:bg-trip-amber-pale rounded p-0.5" title="加为美食">
                                    <UtensilsCrossed className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                              {isAdded && <span className="text-[10px]">已加</span>}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {customItems.length > 0 && (
                    <div className="bg-trip-cloud rounded-xl p-3.5">
                      <div className="text-xs text-trip-muted mb-2">自定义添加</div>
                      {customItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 py-1.5 border-b border-trip-border last:border-0">
                          {item.type === 'attraction' ? <Landmark className="w-3.5 h-3.5 text-trip-mint" /> : <UtensilsCrossed className="w-3.5 h-3.5 text-trip-amber" />}
                          <span className="text-sm font-medium text-trip-ink flex-1 truncate">{item.name}</span>
                          <button onClick={() => removeCustomItem(item.id)} className="text-trip-muted hover:text-trip-error transition-colors">
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => { setParseStatus('idle'); setParseResult(null); setCustomItems([]) }} className="btn-secondary text-sm flex-1">重新解析</button>
                    <button onClick={handleConfirmImport} disabled={isImporting} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-trip-mint px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-trip-mint-dark active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                      {isImporting ? <><Loader2 className="w-4 h-4 animate-spin" /> 导入中</> : <>确认导入 <ArrowRight className="w-4 h-4" /></>}
                    </button>
                  </div>
                </div>
              )}

              {(parseStatus === 'idle' || parseStatus === 'loading') && (
                <button
                  onClick={handleGuideParse}
                  disabled={!guideInput.trim() || parseStatus === 'loading'}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-trip-mint px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-trip-mint-dark active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {parseStatus === 'loading' ? <><Loader2 className="w-4 h-4 animate-spin" /> 解析中</> : <><BookOpen className="w-4 h-4" /> 解析攻略</>}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
