import {
  Path,
  Notebook,
  CloudSun,
  Wallet,
  SuitcaseSimple,
  BellRinging,
  BookmarkSimple,
  CaretRight,
  MapPin,
  Sparkle,
  CaretDown,
} from 'phosphor-react'
import AnimalMascot from './AnimalMascot'

const primaryEntries = [
  {
    icon: Path,
    label: 'AI 行程规划',
    description: '规划小猫看地图，把愿望排成能走的路线',
    page: 'ai-plan',
    role: 'catPlanning',
    tone: 'glass-card-olive',
  },
  {
    icon: Notebook,
    label: '攻略解析',
    description: '攻略小猫读笔记，帮你找出真实地点',
    page: 'guide',
    role: 'catGuide',
    tone: 'glass-card-peach',
  },
]

const toolEntries = [
  { icon: CloudSun, label: '天气', description: '青蛙看看晴雨与穿搭', page: 'weather', colorClass: 'tool-fog', role: 'frog' },
  { icon: Wallet, label: '开支记录', description: '狐狸帮你记账和分摊', page: 'expense', colorClass: 'tool-sand', role: 'fox' },
  { icon: SuitcaseSimple, label: '打包清单', description: '松鼠把行李收拾妥当', page: 'packing', colorClass: 'tool-mint', role: 'squirrel' },
  { icon: BellRinging, label: '预约提醒', description: '兔子守住每个重要时间', page: 'reminder', colorClass: 'tool-coral', role: 'rabbit' },
  { icon: BookmarkSimple, label: '收藏', description: '喜鹊收好喜欢的灵感', page: 'favorites', colorClass: 'tool-rose', role: 'magpie' },
]

export default function HomePage({ onPageChange }) {
  return (
    <div className="min-h-screen overflow-hidden bg-trip-bg">
      <section
        className="glass-hero relative overflow-hidden border-b border-white/70"
      >
        <video
          className="hero-background-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedMetadata={(event) => {
            event.currentTarget.playbackRate = 1.25
          }}
          aria-hidden="true"
        >
          <source src="/video/hero-background.mp4" type="video/mp4" />
        </video>
        <div aria-hidden="true" className="hero-background-overlay" />
        <div aria-hidden="true" className="hero-scenery-layer" />
        <div aria-hidden="true" className="hero-paper-wash" />
        <div aria-hidden="true" className="hero-glow hero-glow-olive" />
        <div aria-hidden="true" className="hero-glow hero-glow-peach" />
        <div aria-hidden="true" className="hero-glow hero-glow-cream" />
        <div aria-hidden="true" className="hero-leaf hero-leaf-one" />
        <div aria-hidden="true" className="hero-leaf hero-leaf-two" />
        <div aria-hidden="true" className="hero-leaf hero-leaf-three" />
        <div aria-hidden="true" className="hero-leaf hero-leaf-four" />
        <div aria-hidden="true" className="hero-leaf hero-leaf-five" />
        <div aria-hidden="true" className="hero-leaf hero-leaf-six" />
        <div aria-hidden="true" className="hero-leaf hero-leaf-seven" />
        <div aria-hidden="true" className="hero-leaf hero-leaf-eight" />
        <div aria-hidden="true" className="hero-leaf hero-leaf-nine" />

        <div className="hero-layout relative z-10 mx-auto grid min-h-screen max-w-[1420px] items-center gap-8 px-5 pb-20 pt-24 sm:px-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.88fr)_minmax(0,1.05fr)] lg:px-12 lg:py-10 xl:gap-10 xl:px-14">
          <div className="hero-copy-reveal relative z-20 order-1 min-w-0 text-center lg:text-left">
            <h1
              aria-label="快来！看世界"
              className="hero-bouncy-title font-display text-[2.75rem] leading-[0.95] text-trip-ink sm:text-[4rem] sm:leading-[0.92] lg:text-[5.5rem]"
            >
              <span aria-hidden="true" className="block">
                {['快', '来', '！'].map((character, index) => (
                  <span key={character} style={{ '--letter-index': index }}>{character}</span>
                ))}
              </span>
              <span aria-hidden="true" className="mt-2 block">
                {['看', '世', '界'].map((character, index) => (
                  <span key={character} style={{ '--letter-index': index + 3 }}>{character}</span>
                ))}
              </span>
            </h1>
            <p className="mx-auto mt-7 max-w-md text-lg leading-8 text-trip-slate lg:mx-0 lg:text-xl">
              说说想去哪，剩下的交给规划小猫。
            </p>
          </div>

          <div className="hero-cat-reveal order-2 flex min-w-0 items-end justify-center self-end lg:self-center">
            <div className="hero-cat-stage relative w-[220px] sm:w-[290px] lg:w-[410px]">
              <div aria-hidden="true" className="absolute inset-[10%] rounded-full bg-[#fff6df]/65 blur-3xl" />
              <video
                src="/video/tripzzle-cat-wave.mp4"
                autoPlay
                muted
                loop
                playsInline
                aria-label="背着旅行背包、正在挥手邀请出发的 Tripzzle 小猫"
                className="hero-cat-video relative z-10"
              />
            </div>
          </div>

          <aside className="glass-panel hero-planner-reveal order-3 mx-auto w-full max-w-[29rem] p-6 sm:p-7 lg:ml-2 lg:mr-0">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold tracking-[0.14em] text-trip-olive-dark">从一句话开始</div>
                <h2 className="mt-2 font-display text-3xl font-bold text-trip-ink">想去哪儿玩？</h2>
                <p className="mt-2 text-base leading-7 text-trip-muted">小猫会理解需求，再去高德寻找真实地点。</p>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/60 text-trip-coral shadow-soft">
                <Sparkle size={19} weight="fill" />
              </span>
            </div>

            <button
              onClick={() => onPageChange('ai-plan')}
              className="glass-input group w-full text-left"
            >
              <span className="glass-input-icon bg-trip-olive-pale text-trip-olive-dark">
                <MapPin size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-trip-ink">一句话描述旅行</span>
                <span className="mt-1 block truncate text-sm text-trip-muted">例如：带妈妈去北京，少走路</span>
              </span>
              <CaretRight size={18} className="text-trip-faint transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => onPageChange('guide')}
              className="glass-input group mt-3 w-full text-left"
            >
              <span className="glass-input-icon bg-trip-coral-pale text-trip-coral-dark">
                <Notebook size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-trip-ink">解析已有攻略</span>
                <span className="mt-1 block truncate text-sm text-trip-muted">粘贴文字或小红书链接</span>
              </span>
              <CaretRight size={18} className="text-trip-faint transition-transform group-hover:translate-x-1" />
            </button>

            <button onClick={() => onPageChange('ai-plan')} className="btn-primary mt-6 min-h-[60px] w-full text-base">
              交给规划小猫
              <Sparkle size={17} weight="fill" />
            </button>

          </aside>
        </div>

        <a
          href="#start-here"
          aria-label="继续向下浏览"
          className="hero-scroll-cue absolute bottom-4 left-1/2 z-20 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border border-white/80 bg-white/60 text-trip-olive-dark shadow-glass backdrop-blur-xl"
        >
          <CaretDown size={22} weight="bold" />
        </a>
      </section>

      <main className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <section id="start-here" className="storybook-section scroll-mt-20 pb-10 pt-12 sm:pb-12 sm:pt-14">
          <div className="mb-7">
            <div className="text-xs font-semibold tracking-[0.18em] text-trip-coral-dark">START HERE</div>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-trip-ink sm:text-4xl">从这里开始</h2>
            <p className="mt-2 text-sm text-trip-muted">两种方式，都能生成真正可以执行的行程。</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {primaryEntries.map((entry) => {
              const Icon = entry.icon
              return (
                <button
                  key={entry.page}
                  onClick={() => onPageChange(entry.page)}
                  className={`glass-feature-card scroll-reveal group ${entry.tone}`}
                  style={{ '--reveal-index': primaryEntries.indexOf(entry) }}
                >
                  <span className="tool-icon-wrap relative z-10">
                    <Icon size={20} />
                  </span>
                  <span className="relative z-10 mt-5 max-w-[58%]">
                    <span className="block text-2xl font-bold text-trip-ink">{entry.label}</span>
                    <span className="mt-2 block text-base leading-7 text-trip-muted">{entry.description}</span>
                  </span>
                  <span className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/75 bg-white/50 text-trip-muted shadow-soft backdrop-blur-xl transition-all group-hover:translate-x-1 group-hover:bg-white/70 group-hover:text-trip-olive-dark">
                    <CaretRight size={18} />
                  </span>
                  <AnimalMascot
                    role={entry.role}
                    size="lg"
                    decorative
                    className="absolute -bottom-2 right-1 transition-transform duration-500 group-hover:-translate-y-2 group-hover:-rotate-2"
                  />
                </button>
              )
            })}
          </div>
        </section>

        <section className="border-t border-white/70 pb-12 pt-10 sm:pb-14 sm:pt-12">
          <div className="mb-7">
            <div className="text-xs font-semibold tracking-[0.18em] text-trip-olive-dark">TRAVEL STUDIO</div>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-trip-ink sm:text-3xl">认识旅行事务所</h2>
            <p className="mt-2 text-sm text-trip-muted">每位动物伙伴，都负责把一件旅行小事照顾好。</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {toolEntries.map((entry) => {
              const Icon = entry.icon
              return (
                <button
                  key={entry.page}
                  onClick={() => onPageChange(entry.page)}
                  className={`glass-tool-card scroll-reveal group ${entry.colorClass}`}
                  style={{ '--reveal-index': toolEntries.indexOf(entry) }}
                >
                  <span className="tool-icon-wrap relative z-10">
                    <Icon size={18} />
                  </span>
                  <span className="relative z-10 max-w-[8rem]">
                    <span className="block text-sm font-semibold text-trip-ink">{entry.label}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-trip-muted">{entry.description}</span>
                  </span>
                  <AnimalMascot
                    role={entry.role}
                    size="md"
                    decorative
                    className="absolute -bottom-1 -right-1 transition-transform duration-500 group-hover:-translate-y-2 group-hover:-rotate-2"
                  />
                </button>
              )
            })}
          </div>
        </section>
      </main>

      <footer className="mt-8 border-t border-white/70 bg-white/20 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <p className="text-center text-sm text-trip-muted">Tripzzle · 把旅行碎片，拼成一条能走的路线</p>
        </div>
      </footer>
    </div>
  )
}
