import { Calendar, Clock, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'

export default function ReservationReminder({ destinationId, selectedItems }) {
  const itemsNeedReservation = selectedItems.filter((item) => item.needsReservation)

  const defaultReminders = [
    { name: '故宫博物院', status: '需预约', date: '建议提前 7 天', way: '故宫博物院官网/小程序', tip: '周一闭馆，注意避开' },
    { name: '八达岭长城', status: '需预约', date: '建议提前 3 天', way: '八达岭长城官方渠道', tip: '旺季人多，早上去人少' },
    { name: '颐和园', status: '需预约', date: '建议提前 1-3 天', way: '颐和园官方公众号', tip: '推荐北宫门入，游览路线顺' },
  ]

  const reminders = itemsNeedReservation.length > 0
    ? itemsNeedReservation.map((item) => ({
        name: item.name,
        status: '需预约',
        date: '建议提前 3-7 天',
        way: '官方公众号/小程序',
        tip: item.tags?.includes('必去') ? '热门景点，尽早预约' : '请提前规划预约时间',
      }))
    : defaultReminders

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
      <div className="text-center mb-8">
        <div className="">
          <Calendar className="w-3 h-3" />
          预约提醒
        </div>
        <h2 className="font-semibold text-lg">这些景点需要提前预约</h2>
        <p className="text-sm text-trip-muted">别到了门口才发现约满啦！</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {reminders.map((item, idx) => (
          <div key={idx} className="card p-5 group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-trip-amber/15 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-trip-amber" />
              </div>
              <span className="tag tag-coral">
                {item.status}
              </span>
            </div>

            <h3 className="font-bold text-trip-ink text-lg mb-3 group-hover:text-trip-amber transition-colors">
              {item.name}
            </h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2 text-trip-slate">
                <Clock className="w-4 h-4 text-trip-muted shrink-0" />
                <span className="font-mono">{item.date}</span>
              </div>
              <div className="flex items-center gap-2 text-trip-slate">
                <ExternalLink className="w-4 h-4 text-trip-muted shrink-0" />
                <span>{item.way}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-trip-border/50">
              <div className="flex items-start gap-2 text-xs text-trip-amber bg-trip-amber/10 p-2.5 rounded-xl">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{item.tip}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
