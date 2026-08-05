import { Share2, FileText, Image, Link2, Copy, Download, MessageCircle, QrCode } from 'lucide-react'

const exportOptions = [
  { icon: Image, label: '导出长图', desc: '一键保存为高清长图', color: 'mint', tag: '即将上线' },
  { icon: FileText, label: '导出 PDF', desc: '适合打印和存档', color: 'coral', tag: '即将上线' },
  { icon: Link2, label: '生成分享链接', desc: '发给好友一起规划', color: 'purple', tag: '即将上线' },
]

const shareChannels = [
  { icon: MessageCircle, label: '微信', color: 'bg-green-500' },
  { icon: 'pyq', label: '朋友圈', color: 'bg-green-600' },
  { icon: QrCode, label: '二维码', color: 'bg-trip-ink' },
  { icon: Link2, label: '复制链接', color: 'bg-trip-mint' },
]

export default function ExportSharePanel() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <div className="">
          <Share2 className="w-3 h-3" />
          导出分享
        </div>
        <h2 className="font-semibold text-lg">把行程分享给小伙伴</h2>
        <p className="text-sm text-trip-muted">多种格式导出，方便保存和分享</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {exportOptions.map((opt) => {
          const Icon = opt.icon
          const colorMap = {
            mint: { bg: 'from-trip-mint to-trip-mint', light: 'bg-trip-mint/10', text: 'text-trip-mint' },
            coral: { bg: 'from-trip-amber to-trip-amber', light: 'bg-trip-amber/10', text: 'text-trip-amber' },
            purple: { bg: 'from-purple-400 to-purple-600', light: 'bg-purple-100', text: 'text-purple-600' },
          }
          const colors = colorMap[opt.color]
          return (
            <div key={opt.label} className="card p-6 group cursor-pointer hover:border-trip-mint/30">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center mb-4`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-trip-ink text-lg">{opt.label}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.light} ${colors.text}`}>
                  {opt.tag}
                </span>
              </div>
              <p className="text-sm text-trip-slate">{opt.desc}</p>
              <button className="mt-4 w-full btn-secondary">
                了解更多
              </button>
            </div>
          )
        })}
      </div>

      <div className="mt-10 card p-6 bg-gradient-to-r from-trip-mint/5 via-white to-trip-amber/5 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-trip-ink text-lg">分享给同行的小伙伴</h3>
            <p className="text-sm text-trip-slate mt-1">一键分享到社交平台，一起规划旅行</p>
          </div>
          <div className="flex items-center gap-3">
            {shareChannels.map((channel) => (
              <button
                key={channel.label}
                className={`w-12 h-12 rounded-xl ${channel.color} text-white flex items-center justify-center`}
              >
                {typeof channel.icon === 'string' ? (
                  <span className="text-xs font-bold">{channel.label.charAt(0)}</span>
                ) : (
                  <channel.icon className="w-5 h-5" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
