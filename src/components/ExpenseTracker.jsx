import { useState, useMemo, useEffect } from 'react'
import { Plus, Minus, User, Wallet, SplitSquareVertical, Trash2, Edit3, Check, X, RefreshCw, ArrowUpDown, Settings, Globe } from 'lucide-react'
import {
  CURRENCIES,
  getExchangeRates,
  saveExchangeRates,
  resetExchangeRates,
  convertToCNY,
  formatCurrency,
  getCurrencyInfo,
} from '../services/currencyService'
import AnimalPageHero from './AnimalPageHero'

const categories = [
  { id: 'food', label: '餐饮', icon: '🍜' },
  { id: 'transport', label: '交通', icon: '🚗' },
  { id: 'accommodation', label: '住宿', icon: '🏨' },
  { id: 'ticket', label: '门票', icon: '🎫' },
  { id: 'shopping', label: '购物', icon: '🛍️' },
  { id: 'other', label: '其他', icon: '📦' },
]

const EXPENSE_STORAGE_KEY = 'tripzzle_expense_state'

function loadExpenseState() {
  try {
    const raw = localStorage.getItem(EXPENSE_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to load expense state:', e)
  }
  return null
}

function saveExpenseState(state) {
  try {
    localStorage.setItem(EXPENSE_STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save expense state:', e)
  }
}

export default function ExpenseTracker() {
  const savedState = loadExpenseState()
  const [participants, setParticipants] = useState(savedState?.participants || [
    { id: 'p1', name: '我' },
    { id: 'p2', name: '朋友A' },
  ])
  const [expenses, setExpenses] = useState(savedState?.expenses || [
    { id: 'e1', description: '午餐', amount: 180, payerId: 'p1', participantIds: ['p1', 'p2'], category: 'food', date: '2026-06-06' },
    { id: 'e2', description: '打车', amount: 45, payerId: 'p2', participantIds: ['p1', 'p2'], category: 'transport', date: '2026-06-06' },
  ])
  const [showAddParticipant, setShowAddParticipant] = useState(false)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showRatesSettings, setShowRatesSettings] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [newParticipantName, setNewParticipantName] = useState('')
  const [editingParticipantId, setEditingParticipantId] = useState(null)
  const [editingParticipantName, setEditingParticipantName] = useState('')
  const [exchangeRates, setExchangeRates] = useState(getExchangeRates)
  const [editingRates, setEditingRates] = useState({})

  useEffect(() => {
    saveExpenseState({ participants, expenses })
  }, [participants, expenses])

  const addParticipant = () => {
    if (!newParticipantName.trim()) return
    setParticipants(prev => [...prev, { id: `p${Date.now()}`, name: newParticipantName.trim() }])
    setNewParticipantName('')
    setShowAddParticipant(false)
  }

  const removeParticipant = (id) => {
    if (participants.length <= 1) return
    setParticipants(prev => prev.filter(p => p.id !== id))
  }

  const editParticipant = (p) => {
    setEditingParticipantId(p.id)
    setEditingParticipantName(p.name)
  }

  const saveParticipant = (id) => {
    if (editingParticipantName.trim()) {
      setParticipants(prev => prev.map(p => p.id === id ? { ...p, name: editingParticipantName.trim() } : p))
    }
    setEditingParticipantId(null)
    setEditingParticipantName('')
  }

  const getParticipantName = (id) => participants.find(p => p.id === id)?.name || id

  const aaCalculation = useMemo(() => {
    if (participants.length === 0) return { balances: [], transactions: [] }

    // 将所有开支转换成人民币后计算
    const totalExpenseCNY = expenses.reduce((sum, e) => {
      const amountCNY = convertToCNY(e.amount, e.currency || 'CNY', exchangeRates)
      return sum + amountCNY
    }, 0)
    const perPersonCNY = participants.length > 0 ? totalExpenseCNY / participants.length : 0

    const balances = participants.map(p => {
      const paidCNY = expenses
        .filter(e => e.payerId === p.id)
        .reduce((sum, e) => sum + convertToCNY(e.amount, e.currency || 'CNY', exchangeRates), 0)
      const owedCNY = expenses
        .filter(e => e.participantIds.includes(p.id))
        .reduce((sum, e) => {
          const amountCNY = convertToCNY(e.amount, e.currency || 'CNY', exchangeRates)
          return sum + (amountCNY / e.participantIds.length)
        }, 0)
      return {
        ...p,
        paid: paidCNY,
        owed: owedCNY,
        balance: paidCNY - owedCNY,
      }
    })

    const debtors = balances.filter(b => b.balance < -0.01).sort((a, b) => a.balance - b.balance)
    const creditors = balances.filter(b => b.balance > 0.01).sort((a, b) => b.balance - a.balance)

    const transactions = []
    let i = 0, j = 0
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i]
      const creditor = creditors[j]
      const amount = Math.min(Math.abs(debtor.balance), creditor.balance)

      transactions.push({
        from: debtor.name,
        to: creditor.name,
        amount: Math.round(amount * 100) / 100,
      })

      debtor.balance += amount
      creditor.balance -= amount

      if (Math.abs(debtor.balance) <= 0.01) i++
      if (creditor.balance <= 0.01) j++
    }

    return { balances, transactions, totalExpense: totalExpenseCNY, perPerson: perPersonCNY }
  }, [participants, expenses, exchangeRates])

  const addExpense = (expense) => {
    setExpenses(prev => [...prev, { ...expense, id: `e${Date.now()}` }])
    setShowAddExpense(false)
  }

  const updateExpense = (id, updated) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e))
    setEditingExpense(null)
  }

  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div className="min-h-screen bg-trip-bg pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="pt-8">
          <AnimalPageHero
            role="fox"
            eyebrow="账本狐狸 · 精打细算"
            title="每一笔旅行花费，都记得明明白白"
            subtitle="记录开支、换算货币，再帮同行伙伴自动算好分摊。"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-2 space-y-4">
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-trip-border/30 flex items-center justify-between">
                <h2 className="font-semibold text-trip-ink flex items-center gap-2">
                  <User className="w-4 h-4 text-trip-mint" />
                  参与人员
                </h2>
                <span className="text-xs text-trip-muted">{participants.length} 人</span>
              </div>
              <div className="p-4 space-y-2">
                {participants.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-trip-cloud">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-trip-mint to-trip-mint flex items-center justify-center text-white text-sm font-medium">
                      {p.name.charAt(0)}
                    </div>
                    {editingParticipantId === p.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editingParticipantName}
                          onChange={(e) => setEditingParticipantName(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-trip-mint text-trip-ink font-medium outline-none"
                          autoFocus
                          onKeyPress={(e) => e.key === 'Enter' && saveParticipant(p.id)}
                        />
                        <button onClick={() => saveParticipant(p.id)} className="p-1.5 rounded-lg bg-trip-mint text-white">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setEditingParticipantId(null); setEditingParticipantName('') }} className="p-1.5 rounded-lg bg-trip-cloud text-trip-muted">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="flex-1 font-medium text-trip-ink">{p.name}</span>
                        <button
                          onClick={() => editParticipant(p)}
                          className="p-1.5 rounded-lg text-trip-muted hover:text-trip-mint hover:bg-trip-mint/20 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeParticipant(p.id)}
                          disabled={participants.length <= 1}
                          className="p-1.5 rounded-lg text-trip-muted hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
                {!showAddParticipant ? (
                  <button
                    onClick={() => setShowAddParticipant(true)}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-trip-border text-trip-muted hover:border-trip-mint hover:text-trip-mint transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    添加人员
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newParticipantName}
                      onChange={(e) => setNewParticipantName(e.target.value)}
                      placeholder="输入姓名"
                      className="input-base flex-1"
                      autoFocus
                      onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
                    />
                    <button onClick={addParticipant} className="px-4 py-3 rounded-xl bg-trip-mint text-white">
                      <Check className="w-5 h-5" />
                    </button>
                    <button onClick={() => setShowAddParticipant(false)} className="px-4 py-3 rounded-xl bg-trip-cloud text-trip-muted">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="p-4 border-b border-trip-border/30 flex items-center justify-between">
                <h2 className="font-semibold text-trip-ink flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-trip-amber" />
                  开支明细
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingRates(exchangeRates.reduce((acc, r) => { acc[r.code] = r.rate; return acc }, {}))
                      setShowRatesSettings(true)
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-trip-mint/10 text-trip-mint text-sm font-medium hover:bg-trip-mint/20 transition-colors"
                    title="汇率设置"
                  >
                    <Globe className="w-4 h-4" />
                    汇率
                  </button>
                  <button
                    onClick={() => setShowAddExpense(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-trip-amber/10 text-trip-amber text-sm font-medium hover:bg-trip-amber/20 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    记一笔
                  </button>
                </div>
              </div>
              <div className="divide-y divide-trip-border/30">
                {expenses.length === 0 ? (
                  <div className="p-8 text-center text-trip-muted">
                    <Wallet className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>暂无开支记录</p>
                  </div>
                ) : (
                  expenses.map((expense) => (
                    <div key={expense.id} className="p-4 hover:bg-trip-cloud/50 transition-colors">
                      {editingExpense === expense.id ? (
                        <ExpenseForm
                          expense={expense}
                          participants={participants}
                          exchangeRates={exchangeRates}
                          onSubmit={(updated) => updateExpense(expense.id, updated)}
                          onCancel={() => setEditingExpense(null)}
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-trip-amber/10 flex items-center justify-center text-lg">
                            {categories.find(c => c.id === expense.category)?.icon || '📦'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-trip-ink truncate">{expense.description}</div>
                            <div className="text-xs text-trip-muted flex items-center gap-2">
                              <span className="tag">{categories.find(c => c.id === expense.category)?.label}</span>
                              <span>·</span>
                              <span>付款人：{getParticipantName(expense.payerId)}</span>
                              <span>·</span>
                              <span>{expense.participantIds.length}人分摊</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-trip-ink font-mono tabular-nums">
                              {formatCurrency(expense.amount, expense.currency || 'CNY')}
                            </div>
                            {expense.currency && expense.currency !== 'CNY' && (
                              <div className="text-xs text-trip-mint">
                                ≈ ¥{convertToCNY(expense.amount, expense.currency, exchangeRates).toFixed(2)}
                              </div>
                            )}
                            <div className="text-xs text-trip-muted">{expense.date}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingExpense(expense.id)}
                              className="p-2 rounded-lg hover:bg-trip-cloud text-trip-muted hover:text-trip-mint transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteExpense(expense.id)}
                              className="p-2 rounded-lg hover:bg-red-50 text-trip-muted hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-trip-border/30">
                <h2 className="font-semibold text-trip-ink flex items-center gap-2">
                  <SplitSquareVertical className="w-4 h-4 text-trip-mint" />
                  结算明细
                </h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-trip-amber/10 rounded-xl p-3 text-center">
                    <div className="text-xs text-trip-amber mb-1">总支出</div>
                    <div className="text-xl font-bold text-trip-amber font-mono tabular-nums">¥{aaCalculation.totalExpense.toFixed(2)}</div>
                  </div>
                  <div className="bg-trip-mint/10 rounded-xl p-3 text-center">
                    <div className="text-xs text-trip-mint mb-1">人均</div>
                    <div className="text-xl font-bold text-trip-mint font-mono tabular-nums">¥{aaCalculation.perPerson.toFixed(2)}</div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  {aaCalculation.balances.map((b) => (
                    <div key={b.id} className="flex items-center justify-between p-2 rounded-lg bg-trip-cloud">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-trip-mint to-trip-mint flex items-center justify-center text-white text-xs font-medium">
                          {b.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-trip-ink">{b.name}</span>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold font-mono tabular-nums ${b.balance > 0 ? 'text-trip-mint' : b.balance < 0 ? 'text-trip-rose' : 'text-trip-muted'}`}>
                          {b.balance > 0 ? '+' : ''}{b.balance.toFixed(2)}
                        </div>
                        <div className="text-xs text-trip-muted">付¥{b.paid}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="p-4 border-b border-trip-border/30">
                <h2 className="font-semibold text-trip-ink flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-trip-amber" />
                  AA 转账建议
                </h2>
              </div>
              <div className="p-4">
                {aaCalculation.transactions.length === 0 ? (
                  <div className="text-center text-trip-muted py-4">
                    <Check className="w-8 h-8 mx-auto mb-2 text-trip-mint" />
                    <p className="text-sm">无需转账</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {aaCalculation.transactions.map((t, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-trip-amber/10">
                        <div className="w-8 h-8 rounded-full bg-trip-amber/20 flex items-center justify-center text-sm">
                          {t.from.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-trip-ink">{t.from}</div>
                          <div className="text-xs text-trip-muted">转给 {t.to}</div>
                        </div>
                        <div className="text-sm font-bold text-trip-amber font-mono tabular-nums">¥{t.amount.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setParticipants([{ id: 'p1', name: '我' }])
                setExpenses([])
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-trip-border text-trip-muted hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              清空数据
            </button>
          </div>
        </div>

        {showAddExpense && (
          <ExpenseForm
            participants={participants}
            exchangeRates={exchangeRates}
            onSubmit={addExpense}
            onCancel={() => setShowAddExpense(false)}
          />
        )}

        {/* 汇率设置弹窗 */}
        {showRatesSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-trip-border/30 flex items-center justify-between sticky top-0 bg-white">
                <h3 className="font-semibold text-trip-ink flex items-center gap-2">
                  <Globe className="w-5 h-5 text-trip-mint" />
                  汇率设置
                </h3>
                <button onClick={() => setShowRatesSettings(false)} className="p-2 rounded-lg hover:bg-trip-cloud text-trip-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-sm text-trip-muted">
                  设置外币对人民币的汇率，用于换算和统计。默认汇率为央行中间价参考值。
                </p>
                <div className="space-y-2">
                  {CURRENCIES.filter(c => c.code !== 'CNY').map(currency => (
                    <div key={currency.code} className="flex items-center gap-3 p-3 rounded-xl bg-trip-cloud/50">
                      <div className="w-16 text-sm font-medium text-trip-ink">{currency.code}</div>
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-sm text-trip-muted">1 {currency.code} =</span>
                        <input
                          type="number"
                          step="0.0001"
                          value={editingRates[currency.code] || currency.rate}
                          onChange={(e) => setEditingRates(prev => ({ ...prev, [currency.code]: parseFloat(e.target.value) || 0 }))}
                          className="w-24 px-3 py-2 rounded-lg border border-trip-border focus:border-trip-mint focus:ring-2 focus:ring-trip-mint/20 outline-none text-sm font-medium"
                        />
                        <span className="text-sm text-trip-muted">¥</span>
                      </div>
                      {editingRates[currency.code] !== currency.rate && (
                        <span className="text-xs text-trip-mint">已修改</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-trip-muted text-center pt-2">
                  汇率会自动保存到本地，刷新页面后仍然保留
                </div>
              </div>
              <div className="p-4 border-t border-trip-border/30 flex gap-2 sticky bottom-0 bg-white">
                <button
                  onClick={() => {
                    resetExchangeRates()
                    setExchangeRates(getExchangeRates())
                    setShowRatesSettings(false)
                  }}
                  className="flex-1 py-3 rounded-xl border border-trip-border text-trip-slate font-medium hover:bg-trip-cloud transition-colors"
                >
                  重置为默认
                </button>
                <button
                  onClick={() => {
                    const updatedRates = CURRENCIES.map(c => ({
                      ...c,
                      rate: c.code === 'CNY' ? 1 : (editingRates[c.code] || c.rate),
                    }))
                    saveExchangeRates(updatedRates)
                    setExchangeRates(updatedRates)
                    setShowRatesSettings(false)
                  }}
                  className="flex-1 py-3 rounded-xl bg-trip-mint text-white font-medium"
                >
                  保存汇率
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ExpenseForm({ expense, participants, exchangeRates, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(expense || {
    description: '',
    amount: '',
    currency: 'CNY',
    payerId: participants[0]?.id || '',
    participantIds: participants.map(p => p.id),
    category: 'food',
    date: '2026-06-06',
  })

  const handleSubmit = () => {
    if (!formData.description || !formData.amount || !formData.payerId || formData.participantIds.length === 0) return
    onSubmit({ ...formData, amount: parseFloat(formData.amount) })
  }

  const toggleParticipant = (id) => {
    setFormData(prev => ({
      ...prev,
      participantIds: prev.participantIds.includes(id)
        ? prev.participantIds.filter(p => p !== id)
        : [...prev.participantIds, id],
    }))
  }

  // 计算人民币等值金额
  const amountCNY = formData.amount ? convertToCNY(parseFloat(formData.amount) || 0, formData.currency, exchangeRates) : 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-trip-border/30 flex items-center justify-between sticky top-0 bg-white">
          <h3 className="font-semibold text-trip-ink">{expense ? '编辑开支' : '记一笔'}</h3>
          <button onClick={onCancel} className="p-2 rounded-lg hover:bg-trip-cloud text-trip-muted">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-trip-slate mb-1.5">项目名称</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="如：午餐、打车、门票..."
              className="input-base w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-trip-slate mb-1.5">金额</label>
            <div className="flex gap-2">
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                className="w-24 px-3 py-3 rounded-xl border border-trip-border focus:border-trip-mint focus:ring-2 focus:ring-trip-mint/20 outline-none transition-all text-sm font-medium"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </select>
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-trip-amber font-bold text-lg">
                  {getCurrencyInfo(formData.currency).symbol}
                </span>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  className="input-base w-full pl-10 pr-4 text-lg font-bold font-mono tabular-nums"
                />
              </div>
            </div>
            {formData.currency !== 'CNY' && formData.amount && (
              <div className="mt-1.5 text-xs text-trip-mint flex items-center gap-1">
                <span>≈ ¥{amountCNY.toFixed(2)} 人民币</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-trip-slate mb-1.5">分类</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                  className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                    formData.category === cat.id
                      ? 'tag-coral'
                      : 'border-trip-border/50 text-trip-slate hover:border-trip-amber/50'
                  }`}
                >
                  <span className="mr-1">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-trip-slate mb-1.5">付款人</label>
            <div className="flex flex-wrap gap-2">
              {participants.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setFormData(prev => ({ ...prev, payerId: p.id }))}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    formData.payerId === p.id
                      ? 'tag-active'
                      : 'border-trip-border/50 text-trip-slate hover:border-trip-mint/50'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-trip-slate mb-1.5">参与分摊人员</label>
            <div className="flex flex-wrap gap-2">
              {participants.map((p) => (
                <button
                  key={p.id}
                  onClick={() => toggleParticipant(p.id)}
                  disabled={formData.participantIds.length === 1 && formData.participantIds.includes(p.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    formData.participantIds.includes(p.id)
                      ? 'tag-active'
                      : 'border-trip-border/50 text-trip-muted hover:border-trip-mint/30'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-trip-slate mb-1.5">日期</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="input-base w-full"
            />
          </div>
        </div>
        <div className="p-4 border-t border-trip-border/30 flex gap-2">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl btn-secondary">
            取消
          </button>
          <button onClick={handleSubmit} className="flex-1 py-3 rounded-xl btn-primary">
            {expense ? '保存' : '记录'}
          </button>
        </div>
      </div>
    </div>
  )
}
