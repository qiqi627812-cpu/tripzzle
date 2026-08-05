export function buildMapLinks(place, fromPlace = null) {
  const { name, lat, lng, address } = place
  const hasCoords = lat && lng && !isNaN(lat) && !isNaN(lng)
  
  const searchQuery = address 
    ? encodeURIComponent(`${name} ${address}`)
    : encodeURIComponent(name)

  const links = []

  if (hasCoords) {
    links.push({
      id: 'amap',
      label: '高德地图',
      url: `https://uri.amap.com/marker?position=${lng},${lat}&name=${encodeURIComponent(name)}`,
      schemeUrl: `amap://viewMap?sourceApplication=tripzzle&poiname=${encodeURIComponent(name)}&lat=${lat}&lon=${lng}`,
    })

    links.push({
      id: 'baidu',
      label: '百度地图',
      url: `https://map.baidu.com/search/${searchQuery}`,
      schemeUrl: `baidumap://map/search?query=${searchQuery}`,
    })

    links.push({
      id: 'tencent',
      label: '腾讯地图',
      url: `https://apis.map.qq.com/uri/v1/marker?marker=coord:${lat},${lng};title:${encodeURIComponent(name)};addr:${encodeURIComponent(address || '')}`,
      schemeUrl: `qqmap://map/marker?marker=coord:${lat},${lng};title:${encodeURIComponent(name)}`,
    })

    links.push({
      id: 'apple',
      label: 'Apple 地图',
      url: `https://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(name)}`,
    })

    links.push({
      id: 'google',
      label: 'Google Maps',
      url: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    })
  } else {
    links.push({
      id: 'amap',
      label: '高德地图',
      url: `https://uri.amap.com/search?keyword=${searchQuery}`,
      schemeUrl: `amap://search?keyword=${searchQuery}`,
    })

    links.push({
      id: 'baidu',
      label: '百度地图',
      url: `https://map.baidu.com/search/${searchQuery}`,
      schemeUrl: `baidumap://map/search?query=${searchQuery}`,
    })

    links.push({
      id: 'tencent',
      label: '腾讯地图',
      url: `https://map.qq.com/search.html?keyword=${searchQuery}`,
      schemeUrl: `qqmap://map/search?query=${searchQuery}`,
    })

    links.push({
      id: 'apple',
      label: 'Apple 地图',
      url: `https://maps.apple.com/?q=${searchQuery}`,
    })

    links.push({
      id: 'google',
      label: 'Google Maps',
      url: `https://www.google.com/maps/search/?api=1&query=${searchQuery}`,
    })
  }

  if (fromPlace && fromPlace.lat && fromPlace.lng) {
    links.forEach(link => {
      if (link.id === 'amap') {
        link.navUrl = `https://uri.amap.com/navigation?from=${fromPlace.lng},${fromPlace.lat}&to=${lng},${lat}&mode=car&policy=1&src=tripzzle`
      } else if (link.id === 'baidu') {
        link.navUrl = `https://map.baidu.com/direction?origin=${fromPlace.lat},${fromPlace.lng}&destination=${lat},${lng}&mode=driving`
      } else if (link.id === 'tencent') {
        link.navUrl = `https://apis.map.qq.com/uri/v1/routeplan?type=drive&from=${fromPlace.lat},${fromPlace.lng}&to=${lat},${lng}&policy=1&referer=tripzzle`
      } else if (link.id === 'apple') {
        link.navUrl = `https://maps.apple.com/?saddr=${fromPlace.lat},${fromPlace.lng}&daddr=${lat},${lng}&dirflg=d`
      } else if (link.id === 'google') {
        link.navUrl = `https://www.google.com/maps/dir/?api=1&origin=${fromPlace.lat},${fromPlace.lng}&destination=${lat},${lng}&travelmode=driving`
      }
    })
  }

  return links
}

export function openMapLink(link) {
  if (link.schemeUrl && isMobile()) {
    window.location.href = link.schemeUrl
    setTimeout(() => {
      if (link.url) {
        window.location.href = link.url
      }
    }, 1000)
  } else {
    window.open(link.url, '_blank')
  }
}

function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

function showToast(message) {
  const toast = document.createElement('div')
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.7);
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 14px;
    z-index: 9999;
    animation: fadeIn 0.3s ease;
  `
  toast.textContent = message
  document.body.appendChild(toast)
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease'
    setTimeout(() => toast.remove(), 300)
  }, 2000)
}

export default buildMapLinks
