import { Sparkles, Map, Calendar, Route, Coffee, Loader2 } from 'lucide-react'

const steps = [
  { icon: Map, text: '分析目的地信息', color: 'mint' },
  { icon: Calendar, text: '智能分配每日行程', color: 'coral' },
  { icon: Route, text: '规划最优路线顺序', color: 'fog' },
  { icon: Coffee, text: '安排餐饮休息时间', color: 'amber' },
]

export default function ItineraryGenerator({ loading }) {
  if (!loading) return null

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="card p-8 sm:p-10 text-center animate-fade-in">
        <div className="relative inline-block mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-trip-mint to-trip-mint flex items-center justify-center shadow-card">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
        </div>

        <h3 className="text-2xl sm:text-3xl font-bold text-trip-ink mb-2">
          正在为你规划行程
        </h3>
        <p className="text-trip-slate mb-8">
          拼贴旅行碎片，计算最优路线中...
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {steps.map((step, idx) => {
            const Icon = step.icon
            const colorClasses = {
              mint: 'bg-trip-mint-pale text-trip-mint border-trip-mint/20',
              coral: 'bg-trip-coral-pale text-trip-coral border-trip-coral/20',
              fog: 'bg-trip-fog-pale text-trip-fog border-trip-fog/20',
              amber: 'bg-trip-amber-pale text-trip-amber border-trip-amber/20',
            }
            return (
              <div
                key={step.text}
                className={`p-4 rounded-xl border transition-all duration-150 ${colorClasses[step.color]} animate-fade-up`}
                style={{ animationDelay: `${idx * 0.15}s` }}
              >
                <Icon className="w-6 h-6 mx-auto mb-2" />
                <div className="text-xs font-semibold">{step.text}</div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 w-full h-2 bg-trip-cloud rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-trip-mint to-trip-amber rounded-full"
            style={{
              width: '60%',
              animation: 'progress 1.5s ease-in-out infinite',
            }}
          />
        </div>
        <style>{`
          @keyframes progress {
            0% { width: 10%; margin-left: 0; }
            50% { width: 70%; margin-left: 15%; }
            100% { width: 10%; margin-left: 90%; }
          }
        `}</style>
      </div>
    </div>
  )
}
