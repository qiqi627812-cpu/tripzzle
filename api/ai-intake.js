const MAX_BRIEF_LENGTH = 5000
const MAX_CANDIDATES = 80
const REQUEST_TIMEOUT_MS = 30_000

const intakeSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'summary',
    'days',
    'pace',
    'transport',
    'startTime',
    'constraints',
    'missingQuestions',
    'recommendations',
  ],
  properties: {
    summary: { type: 'string', maxLength: 120 },
    days: { type: 'integer', minimum: 1, maximum: 7 },
    pace: { type: 'string', enum: ['relaxed', 'moderate', 'busy'] },
    transport: { type: 'string', enum: ['subway', 'bus', 'walk', 'car'] },
    startTime: { type: 'string', maxLength: 30 },
    constraints: {
      type: 'array',
      maxItems: 14,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['label', 'kind'],
        properties: {
          label: { type: 'string', maxLength: 50 },
          kind: { type: 'string', enum: ['fact', 'hard', 'soft'] },
        },
      },
    },
    missingQuestions: {
      type: 'array',
      maxItems: 3,
      items: { type: 'string', maxLength: 80 },
    },
    recommendations: {
      type: 'array',
      minItems: 6,
      maxItems: 10,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['placeId', 'reason', 'suggestedState'],
        properties: {
          placeId: { type: 'string' },
          reason: { type: 'string', maxLength: 90 },
          suggestedState: { type: 'string', enum: ['must', 'interested'] },
        },
      },
    },
  },
}

function getProviderConfig() {
  const requestedProvider = String(process.env.AI_PROVIDER || '').toLowerCase()
  const provider = requestedProvider || (process.env.ARK_API_KEY ? 'doubao' : 'openai')

  if (provider === 'doubao') {
    return {
      provider,
      apiKey: process.env.ARK_API_KEY,
      model: process.env.ARK_MODEL || 'doubao-seed-2-0-lite-260428',
      url: 'https://ark.cn-beijing.volces.com/api/v3/responses',
    }
  }

  return {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-5.6-luna',
    url: 'https://api.openai.com/v1/responses',
  }
}

function getOutputText(data) {
  if (typeof data?.output_text === 'string') return data.output_text
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === 'output_text' && typeof content.text === 'string') return content.text
    }
  }
  return ''
}

function parseJsonObject(outputText) {
  const trimmed = String(outputText || '').trim()
  try {
    return JSON.parse(trimmed)
  } catch {
    const firstBrace = trimmed.indexOf('{')
    const lastBrace = trimmed.lastIndexOf('}')
    if (firstBrace < 0 || lastBrace <= firstBrace) throw new SyntaxError('AI output is not JSON')
    return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1))
  }
}

function sanitizeRequest(body = {}) {
  const allowedTypes = new Set(['attraction', 'food', 'shopping'])
  const candidates = Array.isArray(body.candidates) ? body.candidates.slice(0, MAX_CANDIDATES) : []

  return {
    destinationId: String(body.destinationId || '').slice(0, 40),
    destinationName: String(body.destinationName || '').slice(0, 60),
    brief: String(body.brief || '').slice(0, MAX_BRIEF_LENGTH),
    candidates: candidates.map((item) => ({
      id: String(item?.id || '').slice(0, 100),
      name: String(item?.name || '').slice(0, 100),
      type: allowedTypes.has(item?.type) ? item.type : 'attraction',
      area: String(item?.areaLabel || item?.area || '').slice(0, 80),
      duration: String(item?.duration || '').slice(0, 50),
      tags: Array.isArray(item?.tags)
        ? item.tags.slice(0, 8).map((tag) => String(tag).slice(0, 30))
        : [],
      priority: Math.max(0, Math.min(100, Number(item?.priority) || 0)),
      isRemote: Boolean(item?.isRemote || item?.isFullDay),
      needsReservation: Boolean(item?.needsReservation),
    })).filter((item) => item.id && item.name),
  }
}

function buildPrompt(request) {
  return [
    '你是 Tripzzle 的旅行需求分析师和地点策展人。',
    '先理解用户的一段自然语言，再从给定候选地点中推荐 6–10 个。',
    '不要发明用户没有说过的日期、预算、酒店、抵离时间或同行者信息。',
    '把明确要求记为 hard，把偏好记为 soft，把日期、天数、出发地、同行者等事实记为 fact。',
    '不向用户追问补充问题，缺失信息一律使用稳妥默认值，missingQuestions 始终返回空数组。',
    'recommendations 只能使用候选地点 ID。优先地理集中、负担合理、符合用户兴趣的组合。',
    '除非用户明确说“必须去”，suggestedState 不要标记为 must。',
    '远郊或全天地点要考虑旅行天数和体力。可以推荐 1–2 个餐饮候选，但不要让餐饮占多数。',
    'summary、constraints、missingQuestions 和 reason 使用简体中文。',
    '只返回 JSON，不输出 Markdown，并严格遵循以下 JSON Schema：',
    JSON.stringify(intakeSchema),
    '用户输入与候选地点：',
    JSON.stringify(request),
  ].join('\n')
}

function createProviderRequest(config, request) {
  const prompt = buildPrompt(request)

  if (config.provider === 'doubao') {
    return {
      model: config.model,
      store: false,
      thinking: { type: 'disabled' },
      max_output_tokens: 3500,
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: '只输出一个符合要求的 JSON 对象。' }],
        },
        {
          role: 'user',
          content: [{ type: 'input_text', text: prompt }],
        },
      ],
    }
  }

  return {
    model: config.model,
    store: false,
    reasoning: { effort: 'low' },
    max_output_tokens: 3500,
    input: prompt,
    text: {
      format: {
        type: 'json_schema',
        name: 'trip_intake',
        strict: true,
        schema: intakeSchema,
      },
    },
  }
}

function normalizeResult(result, request) {
  const validById = new Map(request.candidates.map((candidate) => [candidate.id, candidate]))
  const seenIds = new Set()
  const recommendations = []

  for (const recommendation of result?.recommendations || []) {
    const placeId = String(recommendation?.placeId || '')
    if (!validById.has(placeId) || seenIds.has(placeId)) continue
    seenIds.add(placeId)
    recommendations.push({
      placeId,
      reason: String(recommendation?.reason || '适合加入这次行程').slice(0, 90),
      suggestedState: recommendation?.suggestedState === 'must' ? 'must' : 'interested',
    })
    if (recommendations.length === 10) break
  }

  if (recommendations.length < 6) {
    const fallbacks = [...request.candidates]
      .filter((candidate) => !seenIds.has(candidate.id))
      .sort((a, b) => b.priority - a.priority)

    for (const candidate of fallbacks) {
      seenIds.add(candidate.id)
      recommendations.push({
        placeId: candidate.id,
        reason: candidate.isRemote ? '代表性远郊体验，建议预留充足时间' : '经典且与本次行程较匹配',
        suggestedState: 'interested',
      })
      if (recommendations.length === 6) break
    }
  }

  const allowedKinds = new Set(['fact', 'hard', 'soft'])
  const allowedPaces = new Set(['relaxed', 'moderate', 'busy'])
  const allowedTransport = new Set(['subway', 'bus', 'walk', 'car'])

  return {
    summary: String(result?.summary || `${request.destinationName}旅行初步方案`).slice(0, 120),
    days: Math.min(7, Math.max(1, Number(result?.days) || 3)),
    pace: allowedPaces.has(result?.pace) ? result.pace : 'moderate',
    transport: allowedTransport.has(result?.transport) ? result.transport : 'subway',
    startTime: String(result?.startTime || '早上 9 点').slice(0, 30),
    constraints: Array.isArray(result?.constraints)
      ? result.constraints.slice(0, 14).map((constraint) => ({
        label: String(constraint?.label || '').slice(0, 50),
        kind: allowedKinds.has(constraint?.kind) ? constraint.kind : 'soft',
      })).filter((constraint) => constraint.label)
      : [],
    missingQuestions: [],
    recommendations,
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: '仅支持 POST 请求' })
  }

  const providerConfig = getProviderConfig()
  if (!providerConfig.apiKey) {
    return res.status(503).json({
      error: 'AI 服务尚未配置',
      code: 'AI_NOT_CONFIGURED',
    })
  }

  const request = sanitizeRequest(req.body)
  if (!request.brief || !request.destinationName || request.candidates.length < 6) {
    return res.status(400).json({
      error: '请提供旅行描述、目的地和至少 6 个候选地点',
      code: 'INVALID_INTAKE',
    })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(providerConfig.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${providerConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify(createProviderRequest(providerConfig, request)),
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('AI intake request failed:', providerConfig.provider, response.status, data?.error?.code)
      return res.status(data?.error?.code === 'ModelNotOpen' ? 503 : 502).json({
        error: data?.error?.code === 'ModelNotOpen'
          ? '豆包模型尚未在火山方舟开通'
          : 'AI 暂时无法理解旅行需求',
        code: data?.error?.code === 'ModelNotOpen'
          ? 'DOUBAO_MODEL_NOT_OPEN'
          : 'AI_PROVIDER_ERROR',
      })
    }

    const outputText = getOutputText(data)
    if (!outputText) {
      return res.status(502).json({
        error: 'AI 没有返回可用结果',
        code: 'AI_EMPTY_RESPONSE',
      })
    }

    const normalized = normalizeResult(parseJsonObject(outputText), request)
    return res.status(200).json({
      ...normalized,
      provider: providerConfig.provider,
      model: providerConfig.model,
    })
  } catch (error) {
    const timedOut = error?.name === 'AbortError'
    console.error('AI intake failed:', timedOut ? 'timeout' : error?.message)
    return res.status(timedOut ? 504 : 500).json({
      error: timedOut ? 'AI 理解超时，请重试' : 'AI 需求分析失败',
      code: timedOut ? 'AI_TIMEOUT' : 'AI_INTERNAL_ERROR',
    })
  } finally {
    clearTimeout(timeout)
  }
}
