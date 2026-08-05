import { useState } from 'react'
import {
  BookOpen, Link2, FileText, ArrowRight, Sparkles,
  CheckCircle2, Globe, Landmark, UtensilsCrossed, XCircle, Heart,
  AlertCircle, Loader2, Eraser,
} from 'lucide-react'
import { parseGuide, getParsedItemsDetails } from '../services/guideParserService'
import { addGuideFavorite } from '../services/favoriteService'
import AnimalPageHero from './AnimalPageHero'
import AnimalProgress from './AnimalProgress'

const SAMPLE_TEXT = '北京3天游，第一天去故宫、天安门，中午吃北京烤鸭，下午逛南锣鼓巷。第二天去八达岭长城、颐和园，晚上吃涮羊肉。第三天去天坛、国博，结束行程。'
const SAMPLE_URL = 'http://xhslink.com/o/7npe6WEUEB9'

export default function GuidePage({ onPageChange, onImportGuide }) {
  const [activeMode, setActiveMode] = useState('text') // 'text' | 'url'
  const [input, setInput] = useState('')
  const [parseStatus, setParseStatus] = useState('idle') // 'idle' | 'loading' | 'success' | 'empty' | 'error'
  const [errorMessage, setErrorMessage] = useState('')
  const [parseResult, setParseResult] = useState(null)
  const [customItems, setCustomItems] = useState([])
  const [isFavorited, setIsFavorited] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const switchMode = (mode) => {
    if (parseStatus === 'loading') return
    setActiveMode(mode)
    setInput('')
    resetParse()
  }

  const resetParse = () => {
    setParseStatus('idle')
    setParseResult(null)
    setErrorMessage('')
    setCustomItems([])
    setIsFavorited(false)
  }

  const detectInputKind = (text) => {
    const t = text.trim()
    if (!t) return 'empty'
    if (/^https?:\/\//i.test(t)) return 'url'
    return 'text'
  }

  const handleParse = async () => {
    const trimmed = input.trim()
    if (!trimmed) return

    // 智能识别：用户即使停在 text tab 也能输入链接
    const kind = detectInputKind(trimmed)

    setParseStatus('loading')
    setErrorMessage('')
    setParseResult(null)
    setCustomItems([])
    setIsFavorited(false)

    try {
      const result = await parseGuide(trimmed)
      if (result.success) {
        if (result.items && result.items.length > 0) {
          const details = getParsedItemsDetails(result.items, result.cityId)
          setParseResult({ ...result, details, inputKind: kind })
          setParseStatus('success')
        } else {
          setParseResult({ ...result, details: [], inputKind: kind })
          setParseStatus('success') // success 但 0 命中，由 UI 展示"未识别"
        }
      } else {
        setParseStatus('error')
        setErrorMessage(result.message || '解析失败')
      }
    } catch (err) {
      console.error('parseGuide error:', err)
      setParseStatus('error')
      setErrorMessage(err.message || '解析过程出错')
    }
  }

  const handleUseSample = (sample) => {
    setInput(sample)
    resetParse()
  }

  const handleClear = () => {
    setInput('')
    resetParse()
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
    if (!parseResult || isImporting) return
    const allItems = [...(parseResult.details || []), ...customItems]
    if (allItems.length === 0) {
      setParseStatus('empty')
      return
    }
    setIsImporting(true)
    try {
      await onImportGuide({
        cityId: parseResult.cityId,
        cityName: parseResult.cityName,
        items: allItems,
        sourceText: parseResult.rawText || input.trim(),
        sourceUrl: parseResult.url || '',
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleFavorite = () => {
    if (!parseResult) return
    const sourceUrl = parseResult.url || (detectInputKind(input) === 'url' ? input.trim() : '')
    if (!sourceUrl) return
    const title = parseResult.cityName ? `${parseResult.cityName}攻略` : '旅行攻略'
    addGuideFavorite(sourceUrl, title, (parseResult.rawText || '').substring(0, 200))
    setIsFavorited(true)
  }

  const platformLabel = (p) => {
    if (p === 'xiaohongshu') return '小红书'
    if (p === 'mafengwo') return '马蜂窝'
    if (p === 'ctrip' || p === 'trip.com') return '携程'
    if (p === 'dianping') return '大众点评'
    if (p === 'qyer') return '穷游'
    return '攻略'
  }

  const placeholder = activeMode === 'text'
    ? '输入行程描述，例如：北京3天游，去故宫、长城、南锣鼓巷，吃烤鸭...'
    : '粘贴小红书/马蜂窝链接，例如：http://xhslink.com/o/7npe6WEUEB9'

  const canParse = input.trim().length > 0 && parseStatus !== 'loading'

  return (
    <div className="min-h-screen bg-trip-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* 标题区 */}
        <AnimalPageHero
          role="catGuide"
          eyebrow="攻略小猫 · 攻略整理"
          title="把收藏的攻略，变成可以出发的地点"
          subtitle="粘贴文字或链接，攻略小猫会先识别地点，再送进同一套 AI 行程规划。"
        />

        {/* 解析主面板 */}
        <div className="card overflow-hidden mb-8 mt-6">
          <div className="p-6">
            {/* Tab 切换 */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => switchMode('text')}
                className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  activeMode === 'text'
                    ? 'bg-trip-olive text-white shadow-md shadow-trip-olive/25'
                    : 'bg-trip-cloud text-trip-slate hover:bg-trip-cloud/70'
                }`}
              >
                <FileText className="w-4 h-4" />
                文字输入
              </button>
              <button
                onClick={() => switchMode('url')}
                className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  activeMode === 'url'
                    ? 'bg-trip-olive text-white shadow-md shadow-trip-olive/25'
                    : 'bg-trip-cloud text-trip-slate hover:bg-trip-cloud/70'
                }`}
              >
                <Link2 className="w-4 h-4" />
                链接导入
              </button>
            </div>

            {/* 输入区 */}
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  if (parseStatus !== 'idle' && parseStatus !== 'loading') resetParse()
                }}
                placeholder={placeholder}
                className="input-base w-full h-32 resize-none"
              />
              {input && (
                <button
                  onClick={handleClear}
                  className="absolute top-3 right-3 p-1.5 rounded-lg text-trip-muted hover:text-trip-slate hover:bg-trip-cloud transition-colors"
                  title="清空"
                >
                  <Eraser className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 示例快捷填充 */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-xs text-trip-muted">快速试用：</span>
              {activeMode === 'text' ? (
                <button
                  onClick={() => handleUseSample(SAMPLE_TEXT)}
                  className="text-xs px-2.5 py-1 rounded-full bg-trip-mint/10 text-trip-mint hover:bg-trip-mint/20 transition-colors"
                >
                  北京3天攻略示例
                </button>
              ) : (
                <button
                  onClick={() => handleUseSample(SAMPLE_URL)}
                  className="text-xs px-2.5 py-1 rounded-full bg-trip-mint/10 text-trip-mint hover:bg-trip-mint/20 transition-colors"
                >
                  小红书短链示例
                </button>
              )}
            </div>

            {/* 解析按钮 */}
            <button
              onClick={handleParse}
              disabled={!canParse}
              className={`w-full mt-4 py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                !canParse
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              {parseStatus === 'loading' ? (
                detectInputKind(input) === 'url' ? '正在抓取页面…' : '正在解析…'
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  开始解析
                </>
              )}
            </button>
            {parseStatus === 'loading' && (
              <AnimalProgress
                role="catGuide"
                label={detectInputKind(input) === 'url' ? '攻略小猫正在追踪攻略链接…' : '攻略小猫正在阅读攻略…'}
                detail="正在识别城市、景点和餐食地点"
                className="mt-4"
              />
            )}

            {/* 链接抓取失败时的特殊提示 */}
            {parseStatus === 'error' && detectInputKind(input) === 'url' && (
              <div className="mt-4 p-4 rounded-xl bg-trip-warning-pale border border-trip-warning/30 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-trip-warning shrink-0 mt-0.5" />
                <div className="flex-1 text-sm text-trip-slate">
                  <div className="font-semibold mb-1">链接抓取失败</div>
                  <div className="text-trip-slate leading-relaxed">
                    小红书/马蜂窝通常会拦截第三方抓取。建议直接复制笔记正文粘贴到"文字输入"。
                    <button
                      onClick={() => { setActiveMode('text'); setInput('') }}
                      className="ml-2 underline font-medium hover:text-amber-900"
                    >
                      切换到文字输入
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 解析成功结果区 */}
          {parseStatus === 'success' && parseResult && (
            <div className="p-6 border-t border-trip-border/30 space-y-4">
              {/* 顶部摘要 */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-trip-success-pale border border-trip-success/30">
                <CheckCircle2 className="w-4 h-4 text-trip-success shrink-0" />
                <span className="text-sm font-semibold text-trip-mint">
                  从{platformLabel(parseResult.platform)}中成功识别 {parseResult.itemCount} 个地点
                  {parseResult.cityName && ` · 目的地：${parseResult.cityName}`}
                </span>
                <Globe className="w-3.5 h-3.5 text-trip-mint/60 ml-auto" />
              </div>

              {/* 已识别地点列表 */}
              {parseResult.details && parseResult.details.length > 0 ? (
                <div className="card-flat p-4 max-h-60 overflow-y-auto">
                  <div className="text-xs font-semibold text-trip-muted mb-2">已识别地点</div>
                  {parseResult.details.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-2 border-b border-trip-border/50 last:border-0">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0">
                        {item.type === 'food' ? (
                          <UtensilsCrossed className="w-3.5 h-3.5 text-trip-amber" />
                        ) : (
                          <Landmark className="w-3.5 h-3.5 text-trip-mint" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-trip-ink truncate">{item.name}</div>
                        <div className="text-xs text-trip-muted">{item.type === 'food' ? '美食' : '景点'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-trip-warning-pale rounded-xl p-4 text-center text-sm text-trip-slate">
                  未能识别到具体景点。可以从下方候选词手动添加，再交给 AI 规划。
                </div>
              )}

              {/* 候选词（可手动加入） */}
              {parseResult.candidates && parseResult.candidates.length > 0 && (
                <div className="bg-trip-warning-pale/50 rounded-xl p-4 border border-trip-warning/20">
                  <div className="text-xs font-semibold text-trip-slate mb-2">还提到了这些地点（可手动添加）</div>
                  <div className="flex flex-wrap gap-2">
                    {parseResult.candidates.map((word) => {
                      const isAdded = customItems.some(item => item.name === word)
                      return (
                        <div key={word} className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          isAdded
                            ? 'bg-trip-mint/20 border-trip-mint/40 text-trip-mint'
                            : 'bg-white border-trip-border/50 text-trip-slate'
                        }`}>
                          <span>{word}</span>
                          {!isAdded ? (
                            <>
                              <button
                                onClick={() => addCustomItem(word, 'attraction')}
                                className="ml-1 p-0.5 rounded hover:bg-trip-mint/20 text-trip-mint"
                                title="添加为景点"
                              >
                                <Landmark className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => addCustomItem(word, 'food')}
                                className="p-0.5 rounded hover:bg-trip-amber/20 text-trip-amber"
                                title="添加为美食"
                              >
                                <UtensilsCrossed className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px]">已添加</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 自定义添加列表 */}
              {customItems.length > 0 && (
                <div className="card-flat p-4">
                  <div className="text-xs font-semibold text-trip-muted mb-2">自定义添加</div>
                  {customItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-2 border-b border-trip-border/50 last:border-0">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0">
                        {item.type === 'food' ? (
                          <UtensilsCrossed className="w-3.5 h-3.5 text-trip-amber" />
                        ) : (
                          <Landmark className="w-3.5 h-3.5 text-trip-mint" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-trip-ink truncate">{item.name}</div>
                        <div className="text-xs text-trip-muted">{item.type === 'food' ? '美食' : '景点'} · 自定义</div>
                      </div>
                      <button
                        onClick={() => removeCustomItem(item.id)}
                        className="p-1 rounded hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
                        title="移除"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 底部操作 */}
              <div className="flex gap-2">
                <button
                  onClick={resetParse}
                  className="flex-1 py-3 rounded-xl text-sm font-medium btn-secondary"
                >
                  重新解析
                </button>
                {parseResult.platform && detectInputKind(input) === 'url' && (
                  <button
                    onClick={handleFavorite}
                    disabled={isFavorited}
                    className={`flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isFavorited
                        ? 'bg-trip-amber/10 text-trip-amber'
                        : 'bg-trip-cloud text-trip-slate hover:bg-trip-amber/10 hover:text-trip-amber'
                    }`}
                    title="收藏到我的收藏"
                  >
                    <Heart className="w-4 h-4" fill={isFavorited ? 'currentColor' : 'none'} />
                    {isFavorited ? '已收藏' : '收藏'}
                  </button>
                )}
                <button
                  onClick={handleConfirmImport}
                  disabled={isImporting}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold btn-primary flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isImporting ? (
                    '正在送入 AI...'
                  ) : (
                    <>
                      交给 AI 规划
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
              {isImporting && (
                <AnimalProgress
                  role="catGuide"
                  label="攻略小猫正在搬运行程碎片…"
                  detail="马上进入地点确认与 AI 排程"
                />
              )}
            </div>
          )}

          {/* 错误状态 */}
          {parseStatus === 'error' && (
            <div className="p-6 border-t border-trip-border/30">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-trip-error-pale border border-trip-error/30">
                <XCircle className="w-5 h-5 text-trip-error shrink-0 mt-0.5" />
                <div className="flex-1 text-sm">
                  <div className="font-semibold text-trip-error mb-1">解析失败</div>
                  <div className="text-trip-rose">{errorMessage}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 使用示例 */}
        <div className="card p-6">
          <h3 className="font-semibold text-trip-ink mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-trip-amber" />
            使用示例
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => { switchMode('text'); setInput(SAMPLE_TEXT) }}
              className="text-left p-4 rounded-xl bg-trip-cloud hover:bg-trip-mint/10 transition-colors group"
            >
              <div className="text-sm font-medium text-trip-ink mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-trip-mint" />
                文字输入示例
              </div>
              <div className="text-xs text-trip-muted leading-relaxed">"{SAMPLE_TEXT}"</div>
              <div className="text-[10px] text-trip-amber mt-2 opacity-0 group-hover:opacity-100 transition-opacity">点击填入 ↑</div>
            </button>
            <button
              onClick={() => { switchMode('url'); setInput(SAMPLE_URL) }}
              className="text-left p-4 rounded-xl bg-trip-cloud hover:bg-trip-mint/10 transition-colors group"
            >
              <div className="text-sm font-medium text-trip-ink mb-2 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-trip-mint" />
                链接导入示例
              </div>
              <div className="text-xs text-trip-muted leading-relaxed break-all">{SAMPLE_URL}</div>
              <div className="text-[10px] text-trip-amber mt-2 opacity-0 group-hover:opacity-100 transition-opacity">点击填入 ↑</div>
            </button>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-trip-warning-pale border border-trip-warning/20 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-trip-warning shrink-0 mt-0.5" />
            <div className="text-xs text-trip-slate leading-relaxed">
              小红书/马蜂窝对第三方抓取有反爬限制。若链接解析失败，请直接复制笔记正文粘贴到"文字输入"中。
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
