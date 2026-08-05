import { Settings, Clock, Bus, Wallet, Users, Sparkles, Check } from 'lucide-react'

const paceOptions = ['悠闲', '适中', '紧凑']
const timeOptions = ['早上 7 点', '早上 8 点', '早上 9 点', '早上 10 点']
const transportOptions = [
  { value: '优先公共交通', icon: Bus, desc: '地铁公交为主' },
  { value: '打车为主', icon: 'car', desc: '方便快捷' },
  { value: '步行+地铁', icon: 'walk', desc: '边走边逛' },
  { value: '混合搭配', icon: 'shuffle', desc: '智能推荐' },
]
const budgetOptions = ['穷游', '适中', '舒适', '奢华']
const peopleOptions = ['情侣', '闺蜜', '亲子', '独自', '家庭', '朋友']
const needOptions = [
  '拍照提示',
  '预约提醒',
  '天气穿搭提醒',
  '避坑提醒',
  '行前自检清单',
  '美食推荐',
  '购物攻略',
  '亲子友好',
]

export default function TripPreferenceForm({ preferences, setPreferences, onGenerate }) {
  const toggleNeed = (need) => {
    const current = preferences.needs || []
    const next = current.includes(need)
      ? current.filter((n) => n !== need)
      : [...current, need]
    setPreferences({ ...preferences, needs: next })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="preferences">
      <div className="text-center mb-10">
        <div className="">
          <Settings className="w-3 h-3" />
          行程偏好
        </div>
        <h2 className="font-semibold text-lg text-trip-ink">告诉我们你的旅行习惯</h2>
        <p className="text-sm text-trip-muted">设置偏好，生成最适合你的专属行程</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-trip-mint-pale flex items-center justify-center">
              <Clock className="w-5 h-5 text-trip-mint" />
            </div>
            <div>
              <h3 className="font-semibold text-trip-ink">行程节奏</h3>
              <p className="text-sm text-trip-muted">每天安排多满？</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {paceOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setPreferences({ ...preferences, pace: opt })}
                className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-150 border ${
                  preferences.pace === opt
                    ? 'bg-trip-mint-pale text-trip-mint border-trip-mint/20'
                    : 'bg-trip-cloud/50 border-trip-border/50 text-trip-slate hover:border-trip-mint/30'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-trip-amber-pale flex items-center justify-center">
              <Clock className="w-5 h-5 text-trip-amber" />
            </div>
            <div>
              <h3 className="font-semibold text-trip-ink">出发时间</h3>
              <p className="text-sm text-trip-muted">早上几点开始？</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {timeOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setPreferences({ ...preferences, startTime: opt })}
                className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-150 border ${
                  preferences.startTime === opt
                    ? 'bg-trip-amber-pale text-trip-amber border-trip-amber/20'
                    : 'bg-trip-cloud/50 border-trip-border/50 text-trip-slate hover:border-trip-amber/30'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-trip-mint-pale flex items-center justify-center">
              <Bus className="w-5 h-5 text-trip-mint" />
            </div>
            <div>
              <h3 className="font-semibold text-trip-ink">交通方式</h3>
              <p className="text-sm text-trip-muted">市内出行偏好</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {transportOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPreferences({ ...preferences, transport: opt.value })}
                className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-150 border text-left ${
                  preferences.transport === opt.value
                    ? 'bg-trip-mint-pale text-trip-mint border-trip-mint/20'
                    : 'bg-trip-cloud/50 border-trip-border/50 text-trip-slate hover:border-trip-mint/30'
                }`}
              >
                <div>{opt.value}</div>
                <div className="text-xs mt-0.5 font-normal opacity-70">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-trip-coral-pale flex items-center justify-center">
              <Wallet className="w-5 h-5 text-trip-coral" />
            </div>
            <div>
              <h3 className="font-semibold text-trip-ink">预算档位</h3>
              <p className="text-sm text-trip-muted">人均预算水平</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {budgetOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setPreferences({ ...preferences, budget: opt })}
                className={`py-3 px-2 rounded-xl font-semibold text-sm transition-all duration-150 border ${
                  preferences.budget === opt
                    ? 'bg-trip-coral-pale text-trip-coral border-trip-coral/20'
                    : 'bg-trip-cloud/50 border-trip-border/50 text-trip-slate hover:border-trip-coral/30'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-trip-mint-pale flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-trip-mint" />
            </div>
            <div>
              <h3 className="font-semibold text-trip-ink">贴心服务</h3>
              <p className="text-sm text-trip-muted">你希望行程中包含哪些提醒？</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {needOptions.map((opt) => {
              const active = preferences.needs?.includes(opt)
              return (
                <button
                  key={opt}
                  onClick={() => toggleNeed(opt)}
                  className={`group px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 border flex items-center gap-2 ${
                    active
                      ? 'bg-trip-mint-pale text-trip-mint border-trip-mint/20'
                      : 'bg-trip-cloud/50 border-trip-border/50 text-trip-slate hover:border-trip-mint/30'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    active ? 'border-trip-mint bg-trip-mint' : 'border-trip-muted/50'
                  }`}>
                    {active && <Check className="w-2.5 h-2.5 text-white" />}
                  </span>
                  {opt}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="text-center mt-10">
        <button
          onClick={onGenerate}
          className="btn-primary text-base px-10 py-4 group"
        >
          <Sparkles className="w-5 h-5" />
          生成我的专属行程
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </button>
        <p className="mt-3 text-sm text-trip-muted">
          基于 AI 智能规划 · 约 1500ms 生成
        </p>
      </div>
    </div>
  )
}
