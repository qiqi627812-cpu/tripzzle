/**
 * Tripzzle Logo
 *
 * 设计概念：两段路线构成抽象字母 T，路径转折形成不完整的拼合结构。
 * - 顶部横线：从左侧圆点（起点）向右延伸，在中间下沉形成榫卯拼接
 * - 竖线：从拼接点向下延伸到底部圆点（终点）
 * - 负形表达"拼合"，而非传统拼图块
 *
 * 规格：
 * - 24/32/48px 下均可清晰识别
 * - 支持单色（currentColor）
 * - 不依赖渐变
 * - 内部无过细线条（最小线宽 8px @ viewBox 100）
 */
export default function LogoIcon({ className = "w-6 h-6" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Tripzzle"
    >
      {/* 上半段路线：起点圆点 → 横向 → 下沉拼接 → 横向 → 终点圆点 */}
      <path
        d="M16 28
           L84 28
           L84 40
           Q84 46 78 46
           L58 46
           Q52 46 52 52
           L52 100"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* 起点圆点 */}
      <circle cx="16" cy="28" r="9" fill="currentColor" />
      {/* 终点圆点（中空，表达"未完成，等待拼合"） */}
      <circle cx="52" cy="100" r="7" fill="currentColor" />
      {/* 拼接节点：小方块表示拼合点 */}
      <rect x="46" y="42" width="12" height="12" rx="2" fill="currentColor" />
    </svg>
  )
}
