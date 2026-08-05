import { getAllDestinations } from '../data/destinations.js'

const cityKeywords = {
  'beijing': ['北京', '帝都', '京城', '故宫', '长城', '颐和园', '鸟巢', '天安门'],
  'shanghai': ['上海', '魔都', '外滩', '陆家嘴', '东方明珠', '迪士尼'],
  'chengdu': ['成都', '天府', '熊猫', '宽窄巷子', '锦里', '春熙路'],
  'chongqing': ['重庆', '山城', '洪崖洞', '解放碑', '火锅'],
}

const attractionKeywords = {
  'beijing': [
    { id: 'bj-1', keywords: ['故宫', '紫禁城', '故宫博物院'] },
    { id: 'bj-2', keywords: ['长城', '八达岭', '居庸关', '慕田峪'] },
    { id: 'bj-3', keywords: ['颐和园', '昆明湖', '万寿山'] },
    { id: 'bj-4', keywords: ['天坛', '祈年殿', '圜丘'] },
    { id: 'bj-5', keywords: ['南锣鼓巷', '胡同'] },
    { id: 'bj-6', keywords: ['798', '艺术区'] },
    { id: 'bj-7', keywords: ['什刹海', '后海', '前海'] },
    { id: 'bj-8', keywords: ['鸟巢', '国家体育场', '水立方', '游泳馆', '国家游泳中心'] },
    { id: 'bj-9', keywords: ['国博', '国家博物馆', '中国国家博物馆'] },
    { id: 'bj-10', keywords: ['天安门', '广场', '人民大会堂'] },
    { id: 'bj-11', keywords: ['圆明园', '大水法'] },
    { id: 'bj-12', keywords: ['北京大学', '北大', '清华大学', '清华', '未名湖'] },
    { id: 'bj-13', keywords: ['奥林匹克公园', '奥森'] },
    { id: 'bj-14', keywords: ['雍和宫', '国子监'] },
    { id: 'bj-15', keywords: ['王府井', '步行街'] },
    { id: 'bj-16', keywords: ['北海公园', '白塔'] },
    { id: 'bj-17', keywords: ['朝阳公园'] },
    { id: 'bj-18', keywords: ['三里屯', '太古里'] },
    { id: 'bj-19', keywords: ['国贸', 'CBD'] },
    { id: 'bj-20', keywords: ['簋街'] },
    { id: 'bj-21', keywords: ['潘家园', '旧货市场'] },
  ],
  'shanghai': [
    { id: 'sh-1', keywords: ['外滩', '黄浦江'] },
    { id: 'sh-2', keywords: ['东方明珠'] },
    { id: 'sh-3', keywords: ['豫园', '城隍庙'] },
    { id: 'sh-4', keywords: ['南京路', '步行街'] },
    { id: 'sh-5', keywords: ['陆家嘴', '金融中心'] },
    { id: 'sh-6', keywords: ['上海博物馆'] },
    { id: 'sh-7', keywords: ['武康路', '法租界'] },
    { id: 'sh-8', keywords: ['迪士尼', '乐园'] },
    { id: 'sh-9', keywords: ['田子坊'] },
    { id: 'sh-10', keywords: ['徐家汇', '天主教堂'] },
    { id: 'sh-11', keywords: ['静安寺'] },
  ],
  'chengdu': [
    { id: 'cd-1', keywords: ['宽窄巷子'] },
    { id: 'cd-2', keywords: ['锦里', '武侯祠'] },
    { id: 'cd-3', keywords: ['大熊猫', '熊猫基地'] },
    { id: 'cd-4', keywords: ['杜甫草堂'] },
    { id: 'cd-5', keywords: ['青羊宫'] },
    { id: 'cd-6', keywords: ['春熙路', '太古里'] },
    { id: 'cd-7', keywords: ['九眼桥'] },
    { id: 'cd-8', keywords: ['东郊记忆'] },
    { id: 'cd-9', keywords: ['人民公园', '鹤鸣茶社'] },
    { id: 'cd-10', keywords: ['环球中心'] },
    { id: 'cd-11', keywords: ['IFS', '爬墙熊猫'] },
  ],
  'chongqing': [
    { id: 'cq-1', keywords: ['洪崖洞', '夜景'] },
    { id: 'cq-2', keywords: ['解放碑', '步行街'] },
    { id: 'cq-3', keywords: ['长江索道'] },
    { id: 'cq-4', keywords: ['磁器口', '古镇'] },
    { id: 'cq-5', keywords: ['李子坝', '轻轨穿楼'] },
    { id: 'cq-6', keywords: ['渣滓洞', '白公馆'] },
    { id: 'cq-7', keywords: ['南山', '一棵树'] },
    { id: 'cq-8', keywords: ['两江夜游'] },
    { id: 'cq-9', keywords: ['鹅岭二厂'] },
    { id: 'cq-10', keywords: ['十八梯'] },
    { id: 'cq-11', keywords: ['弹子石'] },
  ],
}

const foodKeywords = {
  'beijing': [
    { id: 'bj-f1', keywords: ['烤鸭', '全聚德'] },
    { id: 'bj-f2', keywords: ['炸酱面'] },
    { id: 'bj-f3', keywords: ['涮肉', '铜锅', '东来顺'] },
    { id: 'bj-f4', keywords: ['豆汁', '焦圈', '护国寺'] },
    { id: 'bj-f5', keywords: ['驴打滚', '稻香村'] },
    { id: 'bj-f6', keywords: ['卤煮', '火烧'] },
    { id: 'bj-f7', keywords: ['爆肚'] },
    { id: 'bj-f8', keywords: ['炒肝'] },
  ],
  'shanghai': [
    { id: 'sh-f1', keywords: ['小笼包', '南翔'] },
    { id: 'sh-f2', keywords: ['生煎', '锅贴', '小杨生煎'] },
    { id: 'sh-f3', keywords: ['红烧肉', '本帮菜'] },
    { id: 'sh-f4', keywords: ['葱油拌面'] },
    { id: 'sh-f5', keywords: ['蟹粉', '大闸蟹'] },
    { id: 'sh-f6', keywords: ['白斩鸡'] },
    { id: 'sh-f7', keywords: ['汤圆', '宁波汤圆'] },
    { id: 'sh-f8', keywords: ['菜饭'] },
  ],
  'chengdu': [
    { id: 'cd-f1', keywords: ['火锅', '麻辣'] },
    { id: 'cd-f2', keywords: ['串串', '钵钵鸡'] },
    { id: 'cd-f3', keywords: ['川菜', '麻婆豆腐', '回锅肉'] },
    { id: 'cd-f4', keywords: ['担担面', '甜水面'] },
    { id: 'cd-f5', keywords: ['兔头', '冷吃兔'] },
    { id: 'cd-f6', keywords: ['钟水饺', '龙抄手'] },
    { id: 'cd-f7', keywords: ['夫妻肺片'] },
    { id: 'cd-f8', keywords: ['老妈蹄花'] },
  ],
  'chongqing': [
    { id: 'cq-f1', keywords: ['火锅', '九宫格'] },
    { id: 'cq-f2', keywords: ['小面', '酸辣粉'] },
    { id: 'cq-f3', keywords: ['烤鱼', '万州'] },
    { id: 'cq-f4', keywords: ['毛血旺'] },
    { id: 'cq-f5', keywords: ['干锅', '江湖菜'] },
    { id: 'cq-f6', keywords: ['抄手'] },
    { id: 'cq-f7', keywords: ['辣子鸡'] },
    { id: 'cq-f8', keywords: ['泉水鸡'] },
  ],
}

function extractCity(text) {
  for (const [cityId, keywords] of Object.entries(cityKeywords)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return cityId
      }
    }
  }
  return 'beijing'
}

function extractItemsFromText(text, cityId) {
  const foundItems = new Set()

  const attractions = attractionKeywords[cityId] || []
  for (const item of attractions) {
    for (const keyword of item.keywords) {
      if (text.includes(keyword)) {
        foundItems.add({ id: item.id, type: 'attraction', typeLabel: '景点' })
        break
      }
    }
  }

  const foods = foodKeywords[cityId] || []
  for (const item of foods) {
    for (const keyword of item.keywords) {
      if (text.includes(keyword)) {
        foundItems.add({ id: item.id, type: 'food', typeLabel: '美食' })
        break
      }
    }
  }

  return Array.from(foundItems)
}

// ---- 链接抓取功能 ----

const CORS_PROXIES = [
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
]

async function fetchWithProxy(url) {
  for (const makeProxyUrl of CORS_PROXIES) {
    try {
      const proxyUrl = makeProxyUrl(url)
      const response = await fetch(proxyUrl, {
        headers: { 'Accept': 'text/html,application/json' },
        signal: AbortSignal.timeout(10000),
      })
      if (response.ok) {
        const text = await response.text()
        if (text && text.length > 100) return text
      }
    } catch (e) {
      continue
    }
  }
  return null
}

async function resolveShortUrl(url) {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    })
    return response.url || url
  } catch (e) {
    return url
  }
}

function extractTextFromHTML(html) {
  let text = ''

  // 提取 meta description
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
  if (descMatch) {
    text += descMatch[1] + ' '
  }

  // 提取 og:description
  const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i)
  if (ogDescMatch) {
    text += ogDescMatch[1] + ' '
  }

  // 提取 JSON-LD 数据
  const jsonLdMatches = html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  for (const match of jsonLdMatches) {
    try {
      const data = JSON.parse(match[1])
      if (data.description) text += data.description + ' '
      if (data.articleBody) text += data.articleBody + ' '
      if (data.text) text += data.text + ' '
    } catch (e) { /* ignore */ }
  }

  // 小红书特殊：提取 __INITIAL_STATE__ 中的笔记内容
  const initStateMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?})\s*<\/script>/)
  if (initStateMatch) {
    try {
      const jsonStr = initStateMatch[1].replace(/undefined/g, 'null')
      const data = JSON.parse(jsonStr)
      const note = data?.note?.noteDetailMap
      if (note) {
        for (const key of Object.keys(note)) {
          const noteData = note[key]?.note
          if (noteData) {
            if (noteData.title) text += noteData.title + ' '
            if (noteData.desc) text += noteData.desc + ' '
            // 提取评论内容
            if (noteData.interactInfo?.commentList) {
              for (const c of noteData.interactInfo.commentList) {
                if (c.content) text += c.content + ' '
              }
            }
          }
        }
      }
    } catch (e) { /* ignore */ }
  }

  // 提取 <title> 标签
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch) {
    text += titleMatch[1] + ' '
  }

  // 提取正文文本（去除标签）
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (bodyMatch) {
    let bodyText = bodyMatch[1]
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
      .replace(/\s+/g, ' ')
      .trim()
    // 只取前5000字符，避免太多噪音
    text += bodyText.substring(0, 5000)
  }

  return text
}

function detectPlatform(url) {
  if (url.includes('xiaohongshu.com') || url.includes('xhslink.com')) return 'xiaohongshu'
  if (url.includes('mafengwo.cn') || url.includes('mafengwo.com')) return 'mafengwo'
  if (url.includes('dianping.com')) return 'dianping'
  if (url.includes('ctrip.com') || url.includes('trip.com')) return 'ctrip'
  if (url.includes('qyer.com')) return 'qyer'
  return 'unknown'
}

export async function fetchGuideFromUrl(url) {
  const platform = detectPlatform(url)

  // 短链接需要先解析重定向
  let resolvedUrl = url
  if (url.includes('xhslink.com') || url.includes('t.cn/') || url.includes('dwz.cn/')) {
    resolvedUrl = await resolveShortUrl(url)
  }

  // 抓取页面内容
  const html = await fetchWithProxy(resolvedUrl)

  if (!html) {
    return {
      success: false,
      error: 'FETCH_FAILED',
      message: '无法获取页面内容，可能被网站阻止。请直接复制攻略文本粘贴到输入框中。',
      platform,
      url: resolvedUrl,
    }
  }

  const text = extractTextFromHTML(html)

  if (!text || text.trim().length < 10) {
    return {
      success: false,
      error: 'NO_CONTENT',
      message: '页面内容为空或无法解析。请直接复制攻略文本粘贴到输入框中。',
      platform,
      url: resolvedUrl,
    }
  }

  return {
    success: true,
    platform,
    url: resolvedUrl,
    rawText: text,
    htmlLength: html.length,
  }
}

// 常见过滤词：不太可能是景点的普通词汇
const commonFilterWords = new Set([
  '我们', '你们', '他们', '咱们', '大家', '这里', '那里', '哪里', '地方', '时间',
  '今天', '明天', '后天', '昨天', '上午', '中午', '下午', '晚上', '早上', '夜晚',
  '第一', '第二', '第三', '第四', '第五', '一天', '两天', '三天', '四天', '五天',
  '行程', '攻略', '旅游', '旅行', '出发', '到达', '前往', '回来', '离开', '到达',
  '建议', '推荐', '注意', '提醒', '记得', '可以', '不错', '好玩', '漂亮', '美丽',
  '早餐', '午餐', '晚餐', '中午', '吃饭', '餐厅', '酒店', '住宿', '飞机', '高铁',
  '地铁', '公交', '打车', '步行', '开车', '停车', '门票', '预约', '排队', '拍照',
  '打卡', '逛逛', '走走', '看看', '游玩', '参观', '体验', '感受', '欣赏', '品尝',
  '北京', '上海', '成都', '重庆', '广州', '澳门', '天津', '杭州', '南京', '西安',
  '上午去', '下午去', '晚上去', '中午去', '早上到',
])

// 常见动词后缀，这些词结尾的通常是动作，不是地点
const verbSuffixes = ['去', '到', '逛', '吃', '看', '玩', '游', '走', '参观', '游玩', '前往', '抵达', '出发']

function extractCandidates(text, foundItemIds) {
  // 先按标点分割成短句，避免跨句子匹配无意义片段
  const sentences = text.split(/[,，.。!！?？、；;]/).filter(s => s.trim().length > 0)
  const candidates = []
  const seen = new Set()

  for (const sentence of sentences) {
    const trimmed = sentence.trim()
    // 提取每个短句中 3-6 个中文字符的候选
    const matches = trimmed.match(/[\u4e00-\u9fa5]{3,6}/g) || []
    for (const word of matches) {
      if (seen.has(word)) continue
      seen.add(word)

      // 跳过常见过滤词
      if (commonFilterWords.has(word)) continue
      if (commonFilterWords.has(word + '去')) continue
      if (commonFilterWords.has(word + '到')) continue

      // 跳过纯数字词
      if (/^\d+$/.test(word)) continue

      // 跳过以数字开头的（如"3天游"、"1天"）
      if (/^\d/.test(word)) continue

      // 跳过以"第"开头的（如"第一天"、"第二天"）
      if (word.startsWith('第')) continue

      // 跳过以常见动词结尾的（如"去故宫"、"吃烤鸭"中的"去"、"吃"）
      let skip = false
      for (const suffix of verbSuffixes) {
        if (word.endsWith(suffix)) { skip = true; break }
      }
      if (skip) continue

      // 跳过太笼统的词
      if (['地方', '景点', '行程', '旅行', '攻略', '时间', '天游', '结束'].includes(word)) continue

      // 检查是否已经被识别
      const alreadyFound = foundItemIds.some(id => {
        const dest = getAllDestinations().find(d => {
          const pool = d.pool || {}
          const allItems = [...(pool.attractions || []), ...(pool.food || [])]
          return allItems.some(item => item.id === id && item.name.includes(word))
        })
        return !!dest
      })
      if (alreadyFound) continue

      candidates.push(word)
    }
  }

  // 按长度排序（优先保留长词，因为短词可能是长词的片段），再按出现频率
  const freqMap = new Map()
  for (const c of candidates) {
    freqMap.set(c, (freqMap.get(c) || 0) + 1)
  }
  
  // 去重 + 过滤：短词如果是长词的子串则去掉短词
  const unique = Array.from(new Set(candidates))
  const filtered = unique.filter(w => {
    return !unique.some(other => other !== w && other.length > w.length && other.includes(w))
  })

  return filtered
    .sort((a, b) => b.length - a.length)
    .slice(0, 10)
}

export async function parseGuide(input) {
  const trimmedInput = input.trim()

  let platform = null
  let pageText = trimmedInput

  // 如果输入是链接，先抓取内容
  if (trimmedInput.startsWith('http')) {
    platform = detectPlatform(trimmedInput)

    const fetchResult = await fetchGuideFromUrl(trimmedInput)

    if (fetchResult.success) {
      pageText = fetchResult.rawText
    } else {
      return {
        success: false,
        error: fetchResult.error,
        message: fetchResult.message,
        platform: fetchResult.platform,
      }
    }
  }

  const cityId = extractCity(pageText)
  const items = extractItemsFromText(pageText, cityId)

  // 提取候选未识别景点
  const foundItemIds = items.map(i => i.id)
  const candidates = extractCandidates(pageText, foundItemIds)

  const destination = getAllDestinations().find(d => d.id === cityId)
  const cityName = destination?.name || '北京'

  return {
    success: true,
    platform,
    cityId,
    cityName,
    items,
    itemCount: items.length,
    candidates,
    candidateCount: candidates.length,
    rawText: pageText,
  }
}

export function getParsedItemsDetails(items, cityId) {
  const destination = getAllDestinations().find(d => d.id === cityId)
  if (!destination) return []

  const result = []
  const pool = destination.pool || {}

  for (const item of items) {
    // 自定义项目直接保留
    if (item.isCustom || (item.id && item.id.startsWith('custom-'))) {
      result.push({ ...item })
      continue
    }

    if (item.type === 'attraction') {
      const found = (pool.attractions || []).find(a => a.id === item.id)
      if (found) {
        result.push({ ...found, type: 'attraction', typeLabel: '景点' })
      }
    } else if (item.type === 'food') {
      const found = (pool.food || []).find(f => f.id === item.id)
      if (found) {
        result.push({ ...found, type: 'food', typeLabel: '美食' })
      }
    }
  }

  return result
}
