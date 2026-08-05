// 货币配置 - 汇率为 2025 年央行中间价参考值
export const CURRENCIES = [
  { code: 'CNY', symbol: '¥', name: '人民币', rate: 1 },
  { code: 'USD', symbol: '$', name: '美元', rate: 7.15 },
  { code: 'EUR', symbol: '€', name: '欧元', rate: 8.24 },
  { code: 'JPY', symbol: '¥', name: '日元', rate: 0.048 },
  { code: 'GBP', symbol: '£', name: '英镑', rate: 9.45 },
  { code: 'HKD', symbol: 'HK$', name: '港元', rate: 0.91 },
  { code: 'AUD', symbol: 'A$', name: '澳元', rate: 4.51 },
  { code: 'KRW', symbol: '₩', name: '韩元', rate: 0.0052 },
  { code: 'THB', symbol: '฿', name: '泰铢', rate: 0.21 },
  { code: 'SGD', symbol: 'S$', name: '新加坡元', rate: 5.35 },
  { code: 'TWD', symbol: 'NT$', name: '新台币', rate: 0.22 },
]

const RATES_STORAGE_KEY = 'tripzzle_exchange_rates'

// 获取汇率（用户自定义优先，否则用默认值）
export function getExchangeRates() {
  try {
    const saved = localStorage.getItem(RATES_STORAGE_KEY)
    if (saved) {
      const customRates = JSON.parse(saved)
      // 合并自定义汇率
      return CURRENCIES.map(c => ({
        ...c,
        rate: customRates[c.code] ?? c.rate,
        isCustom: customRates[c.code] !== undefined,
      }))
    }
  } catch (e) {
    console.warn('读取汇率失败:', e)
  }
  return CURRENCIES.map(c => ({ ...c, isCustom: false }))
}

// 保存自定义汇率
export function saveExchangeRates(rates) {
  try {
    const rateMap = {}
    rates.forEach(r => {
      if (r.code !== 'CNY') {
        rateMap[r.code] = r.rate
      }
    })
    localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(rateMap))
    return true
  } catch (e) {
    console.warn('保存汇率失败:', e)
    return false
  }
}

// 重置为默认汇率
export function resetExchangeRates() {
  try {
    localStorage.removeItem(RATES_STORAGE_KEY)
    return true
  } catch (e) {
    return false
  }
}

// 将金额换算成人民币
export function convertToCNY(amount, currencyCode, rates) {
  if (currencyCode === 'CNY') return amount
  const currency = rates.find(r => r.code === currencyCode)
  if (!currency) return amount
  return amount * currency.rate
}

// 格式化金额显示
export function formatCurrency(amount, currencyCode, showSymbol = true) {
  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0]
  const formatted = amount.toFixed(2)
  return showSymbol ? `${currency.symbol}${formatted}` : formatted
}

// 获取货币信息
export function getCurrencyInfo(code) {
  return CURRENCIES.find(c => c.code === code) || CURRENCIES[0]
}