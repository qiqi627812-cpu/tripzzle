// 图片兜底函数
export function getSafeImageUrl(item) {
  // 优先使用本地图片
  if (item.localImage) {
    return `/images/${item.localImage}`
  }
  
  // 使用远程图片
  if (item.image && item.image.startsWith('data:image/svg+xml')) {
    return item.image // SVG 内嵌图片不需要兜底
  }
  
  if (item.image) {
    return item.image
  }
  
  // 兜底占位图
  const text = encodeURIComponent(item.name || 'Tripzzle')
  return `https://placehold.co/900x600/EAF7F4/1F2937?text=${text}`
}

// 占位图生成
export function getPlaceholderUrl(width = 900, height = 600, text = 'Tripzzle') {
  const encodedText = encodeURIComponent(text)
  return `https://placehold.co/${width}x${height}/EAF7F4/1F2937?text=${encodedText}`
}

// SVG 渐变占位图（不依赖网络）
export function getSvgPlaceholder(text, color1 = 'EAF7F4', color2 = '81C784') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#${color1}"/>
        <stop offset="100%" style="stop-color:#${color2}"/>
      </linearGradient>
    </defs>
    <rect width="900" height="600" fill="url(#bg)"/>
    <text x="450" y="300" text-anchor="middle" font-family="sans-serif" font-size="36" fill="#1F2937">${text}</text>
  </svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}