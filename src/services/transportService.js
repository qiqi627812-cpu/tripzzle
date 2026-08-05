// 交通方式服务 - 班次识别与管理

// 班次识别规则（基于正则）
const FLIGHT_PATTERNS = [
  // 航班号格式: 2字母航司代码 + 3-4位数字
  { regex: /^[A-Z0-9]{2}\s?\d{3,4}$/, airline: null, isFlight: true },
  // 伏林航空、东方航空等中文航司
  { regex: /(?:伏林|国航|东航|南航|海航|国泰|汉莎|法航|荷航|美联航|达美|美航|英航|维珍|阿联酋|卡塔尔|新航|全日空|日航|大韩|韩亚|泰航|亚航|春秋|吉祥|东航|南航|海航)/, isFlight: true },
]

const TRAIN_PATTERNS = [
  // 高铁 G/D/C 开头
  { regex: /^[GDCZTKL]\d{1,4}$/, type: 'train' },
  // K/T/Z 普通列车
  { regex: /^[KTZ]\d{1,4}$/, type: 'train' },
  // 纯数字
  { regex: /^\d{4,5}$/, type: 'train' },
]

// 主要航司代码对照表
const AIRLINE_CODES = {
  VY: '伏林航空',
  CA: '中国国际航空',
  MU: '中国东方航空',
  CZ: '中国南方航空',
  HU: '海南航空',
  MF: '厦门航空',
  ZH: '深圳航空',
  '3U': '四川航空',
  NH: '全日空',
  JL: '日本航空',
  KE: '大韩航空',
  OZ: '韩亚航空',
  TG: '泰国航空',
  SQ: '新加坡航空',
  MH: '马来西亚航空',
  EK: '阿联酋航空',
  QR: '卡塔尔航空',
  EY: '阿提哈德航空',
  LH: '汉莎航空',
  AF: '法国航空',
  KL: '荷兰皇家航空',
  BA: '英国航空',
  VS: '维珍航空',
  QF: '澳洲航空',
  AA: '美国航空',
  UA: '美国联合航空',
  DL: '达美航空',
  AC: '加拿大航空',
}

// 高铁/动车类型映射
const TRAIN_TYPE_MAP = {
  G: '高速动车',
  D: '动车组',
  C: '城际动车',
  Z: '直达特快',
  T: '特快列车',
  K: '快速列车',
  L: '临时列车',
  Y: '旅游列车',
}

/**
 * 识别交通班次类型
 * @param {string} code 班次号
 * @returns {object} { type, subtype, displayName, icon, isFlight, isTrain }
 */
export function identifyTransportCode(code) {
  if (!code || typeof code !== 'string') return null
  const trimmed = code.trim().toUpperCase()

  if (!trimmed) return null

  // 检测航班
  for (const pattern of FLIGHT_PATTERNS) {
    if (pattern.regex.test(trimmed)) {
      const airlineCode = trimmed.match(/^([A-Z]{2})/)?.[1]
      const airlineName = AIRLINE_CODES[airlineCode] || '航空公司'
      return {
        type: 'flight',
        subtype: 'flight',
        displayName: `${trimmed} ${airlineName}`,
        code: trimmed,
        isFlight: true,
        isTrain: false,
        icon: 'plane',
      }
    }
  }

  // 检测火车
  for (const pattern of TRAIN_PATTERNS) {
    if (pattern.regex.test(trimmed)) {
      const trainType = trimmed[0]
      const trainName = TRAIN_TYPE_MAP[trainType] || '列车'
      return {
        type: 'train',
        subtype: trainType,
        displayName: `${trimmed} ${trainName}`,
        code: trimmed,
        isFlight: false,
        isTrain: true,
        icon: 'train',
      }
    }
  }

  return null
}

/**
 * 创建交通段对象
 */
export function createTransportSegment(code, options = {}) {
  const identified = identifyTransportCode(code)
  if (!identified) return null

  return {
    id: `transport-${Date.now()}`,
    isTransport: true,
    type: identified.subtype,
    transportType: identified.subtype,
    name: options.name || identified.displayName,
    description: options.description || '',
    from: options.from || '',
    to: options.to || '',
    time: options.time || '',
    arriveTime: options.arriveTime || '',
    durationMinutes: options.durationMinutes || 0,
    seat: options.seat || '',
    gate: options.gate || '',
    airport: options.airport || '',
    station: options.station || '',
    code: identified.code,
    isFlight: identified.isFlight,
    isTrain: identified.isTrain,
    layoverMinutes: options.layoverMinutes || 0,
    isCustom: true,
  }
}

/**
 * 交通方式服务 - 仅做本地班次识别，不调用外部 API
 * - 用户手动填写所有字段
 * - 班次号用于自动切换交通方式（航班/火车）
 */

/**
 * 交通类型图标映射
 */
export const TRANSPORT_ICONS = {
  plane: 'plane',
  train: 'train',
  bus: 'bus',
  subway: 'subway',
  car: 'car',
  taxi: 'taxi',
  walk: 'walk',
  flight: 'plane',
  ferry: 'ferry',
}

/**
 * 交通类型颜色配置
 */
export const TRANSPORT_COLORS = {
  flight: {
    badge: 'bg-sky-100 text-sky-700 border-sky-200',
    dot: 'bg-sky-500',
    bg: 'bg-sky-50',
  },
  train: {
    badge: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
    bg: 'bg-indigo-50',
  },
  bus: {
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
    bg: 'bg-slate-50',
  },
  subway: {
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50',
  },
  car: {
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    bg: 'bg-amber-50',
  },
  taxi: {
    badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    dot: 'bg-yellow-500',
    bg: 'bg-yellow-50',
  },
  walk: {
    badge: 'bg-green-100 text-green-700 border-green-200',
    dot: 'bg-green-500',
    bg: 'bg-green-50',
  },
}
