import { useState, useRef, useEffect } from 'react'
import {
  Menu, X, ChevronDown,
} from 'lucide-react'
import {
  BookmarkSimple, BellRinging, Wallet, SuitcaseSimple, CloudSun,
} from 'phosphor-react'
import LogoIcon from './LogoIcon'
import AnimalMascot from './AnimalMascot'

// 一级导航：核心任务（文字为主，不带图标）
const primaryNav = [
  { id: 'home', label: '首页' },
  { id: 'ai-plan', label: '行程规划', role: 'catPlanning' },
  { id: 'guide', label: '攻略解析', role: 'catGuide' },
  { id: 'map', label: '行程地图', role: 'catMap' },
  { id: 'itinerary', label: '行程详情', role: 'catItinerary' },
]

// 辅助工具：放入"旅行工具"下拉菜单 — Phosphor 图标
const toolItems = [
  { id: 'favorites', label: '收藏', icon: BookmarkSimple, role: 'magpie' },
  { id: 'reminder', label: '预约提醒', icon: BellRinging, role: 'rabbit' },
  { id: 'expense', label: '开支记录', icon: Wallet, role: 'fox' },
  { id: 'packing', label: '打包清单', icon: SuitcaseSimple, role: 'squirrel' },
  { id: 'weather', label: '天气', icon: CloudSun, role: 'frog' },
]

// 移动端完整列表
const allNavItems = [
  ...primaryNav.map(item => ({ ...item, icon: null })),
  ...toolItems,
]

export default function Navigation({ currentPage, onPageChange }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const toolsRef = useRef(null)

  // 当前页面是否属于工具菜单
  const isToolActive = toolItems.some(t => t.id === currentPage)
  const activeTool = toolItems.find(t => t.id === currentPage)

  // 点击外部关闭工具菜单
  useEffect(() => {
    function handleClickOutside(e) {
      if (toolsRef.current && !toolsRef.current.contains(e.target)) {
        setToolsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ESC 关闭菜单
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') {
        setToolsOpen(false)
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  const handleNavigate = (id) => {
    onPageChange(id)
    setToolsOpen(false)
    setMobileMenuOpen(false)
  }

  return (
    <>
      {/* 为固定导航预留顶部空间 */}
      <div className={currentPage === 'home' ? 'h-0' : 'h-16'} />

      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        currentPage === 'home'
          ? 'home-navigation border-b border-white/35 bg-white/10 shadow-none backdrop-blur-[3px]'
          : 'border-b-2 border-[#f2dfe7] bg-[#fffdf9]/95 shadow-[0_5px_18px_rgba(126,91,104,0.08)] backdrop-blur-xl'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo + 品牌名 */}
            <button
              className="flex items-center gap-2 cursor-pointer min-h-[44px] min-w-[44px] focus-visible:rounded-md"
              onClick={() => handleNavigate('home')}
              aria-label="Tripzzle 首页"
            >
              <LogoIcon className="w-7 h-7 text-trip-mint" />
              <span className="text-lg font-bold text-trip-ink tracking-tight font-display">Tripzzle</span>
            </button>

            {/* 桌面端：一级文字导航 + 工具菜单 */}
            <div className="hidden md:flex items-center gap-1">
              {primaryNav.map((item) => {
                const isActive = currentPage === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`relative px-3.5 py-2 rounded-md text-sm transition-colors min-h-[44px] flex items-center ${
                      isActive
                        ? 'text-trip-ink font-semibold'
                        : 'text-trip-slate hover:text-trip-ink hover:bg-trip-cloud/60'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.beta && (
                      <span className="ml-1.5 rounded-full bg-trip-mint-pale px-1.5 py-0.5 text-[10px] font-semibold text-trip-mint-dark">
                        Beta
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 rounded-full bg-trip-mint" />
                    )}
                  </button>
                )
              })}

              {/* 分隔线 */}
              <div className="w-px h-6 bg-trip-border mx-2" aria-hidden="true" />

              {/* 旅行工具下拉菜单 */}
              <div className="relative" ref={toolsRef}>
                <button
                  onClick={() => setToolsOpen(!toolsOpen)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm transition-colors min-h-[44px] ${
                    isToolActive
                      ? 'text-trip-ink font-semibold'
                      : 'text-trip-slate hover:text-trip-ink hover:bg-trip-cloud/60'
                  }`}
                  aria-expanded={toolsOpen}
                  aria-haspopup="menu"
                >
                  {activeTool && <AnimalMascot role={activeTool.role} size="xxs" decorative />}
                  <span>{isToolActive ? activeTool.label : '旅行工具'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`} />
                  {isToolActive && (
                    <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 rounded-full bg-trip-mint" />
                  )}
                </button>

                {toolsOpen && (
                  <div
                    className="absolute right-0 top-full z-[200] mt-2 w-64 overflow-hidden rounded-3xl border-2 border-[#f1dce4] bg-[#fffdf9] p-1.5 shadow-[0_12px_30px_rgba(126,91,104,0.14)] animate-scale-in origin-top-right"
                    role="menu"
                  >
                    <div className="p-2">
                      {toolItems.map((tool) => {
                        const isActive = currentPage === tool.id
                        return (
                          <button
                            key={tool.id}
                            onClick={() => handleNavigate(tool.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors min-h-[44px] ${
                              isActive
                                ? 'bg-trip-mint-pale text-trip-mint font-medium'
                                : 'text-trip-slate hover:text-trip-ink hover:bg-trip-cloud/60'
                            }`}
                            role="menuitem"
                          >
                            <AnimalMascot role={tool.role} size="xxs" decorative />
                            <span>{tool.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 移动端菜单按钮 */}
            <button
              className="md:hidden p-2 rounded-lg text-trip-slate hover:text-trip-ink hover:bg-trip-cloud/60 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center relative z-50"
              onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(!mobileMenuOpen) }}
              aria-label="菜单"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* 移动端遮罩 — 放在 nav 外部，避免被 nav 的层叠上下文限制 */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-16 bg-trip-ink/30 animate-fade-in md:hidden z-[150]"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 移动端侧滑面板 — 放在 nav 外部，使用更高的 z-index */}
      <div
        className={`fixed top-16 right-0 bottom-0 w-72 max-w-[80vw] border-l border-white/80 bg-[#fffaf1]/80 shadow-2xl backdrop-blur-2xl transition-transform duration-300 ease-out md:hidden z-[150] ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="py-3 px-3 overflow-y-auto h-full">
          {/* 一级导航 */}
          <div className="mb-2 px-3 py-2 text-xs font-semibold text-trip-faint uppercase tracking-wider">主导航</div>
          {primaryNav.map((item) => {
            const isActive = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-base transition-colors min-h-[44px] ${
                  isActive
                    ? 'text-trip-mint font-semibold bg-trip-mint-pale'
                    : 'text-trip-slate hover:text-trip-ink hover:bg-trip-cloud/60'
                }`}
              >
                {item.role
                  ? <AnimalMascot role={item.role} size="xxs" decorative />
                  : <span className="w-7" />}
                <span>{item.label}</span>
                {item.beta && (
                  <span className="ml-auto rounded-full bg-trip-mint-pale px-2 py-0.5 text-[10px] font-semibold text-trip-mint-dark">
                    Beta
                  </span>
                )}
              </button>
            )
          })}

          {/* 工具 */}
          <div className="mt-4 mb-2 px-3 py-2 text-xs font-semibold text-trip-faint uppercase tracking-wider">旅行工具</div>
          {toolItems.map((tool) => {
            const isActive = currentPage === tool.id
            return (
              <button
                key={tool.id}
                onClick={() => handleNavigate(tool.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-base transition-colors min-h-[44px] ${
                  isActive
                    ? 'text-trip-mint font-semibold bg-trip-mint-pale'
                    : 'text-trip-slate hover:text-trip-ink hover:bg-trip-cloud/60'
                }`}
              >
                <AnimalMascot role={tool.role} size="xxs" decorative />
                <span>{tool.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
