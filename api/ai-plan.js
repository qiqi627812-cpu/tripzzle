const MAX_ITEMS = 60
const MAX_NOTES_LENGTH = 1200
const REQUEST_TIMEOUT_MS = 25_000

const planSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['days', 'planningNotes'],
  properties: {
    days: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['day', 'theme', 'reason', 'orderedPlaceIds', 'lunchItemId', 'dinnerItemId'],
        properties: {
          day: { type: 'integer', minimum: 1, maximum: 14 },
          theme: { type: 'string', maxLength: 40 },
          reason: { type: 'string', maxLength: 160 },
          orderedPlaceIds: {
            type: 'array',
            items: { type: 'string' },
          },
          lunchItemId: { type: ['string', 'null'] },
          dinnerItemId: { type: ['string', 'null'] },
        },
      },
    },
    planningNotes: {
      type: 'array',
      items: { type: 'string', maxLength: 120 },
      maxItems: 6,
    },
  },
}

function getOutputText(data) {
  if (typeof data?.output_text === 'string') return data.output_text
  if (typeof data?.choices?.[0]?.message?.content === 'string') {
    return data.choices[0].message.content
  }

  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === 'output_text' && typeof content.text === 'string') {
        return content.text
      }
    }
  }
  return ''
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

function buildPlanningPrompt(request) {
  return [
    'You are Tripzzle, a careful travel-planning assistant.',
    'You are the primary planner: decide which day each place belongs to and the visit order.',
    'Prioritize the user requirements, geographic coherence, realistic daily load, meals and rest.',
    'Use only the supplied place IDs. Never invent places, opening hours, prices or travel times.',
    'Use every supplied attraction and shopping place ID exactly once across orderedPlaceIds.',
    'Use supplied food IDs only as lunchItemId or dinnerItemId, at most once each.',
    'A remote or full-day place should normally occupy its own day.',
    'Respect the requested number of days and return exactly that many day objects.',
    'Do not overload a day. Prefer a feasible plan over checking off too many places.',
    'Write themes, reasons and notes in Simplified Chinese.',
    'Return JSON only. It must follow this JSON Schema:',
    JSON.stringify(planSchema),
    'Travel input:',
    JSON.stringify(request),
  ].join('\n')
}

function createProviderRequest(config, request) {
  const prompt = buildPlanningPrompt(request)

  if (config.provider === 'doubao') {
    return {
      model: config.model,
      store: false,
      thinking: { type: 'disabled' },
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: '你是 Tripzzle 的旅行主规划器。只返回符合 JSON Schema 的 JSON 对象，不输出 Markdown。',
            },
          ],
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
    input: [
      {
        role: 'system',
        content: [{ type: 'input_text', text: prompt }],
      },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'trip_plan_advice',
        strict: true,
        schema: planSchema,
      },
    },
  }
}

function parsePlanJson(outputText) {
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
  const items = Array.isArray(body.items) ? body.items.slice(0, MAX_ITEMS) : []
  const allowedTypes = new Set(['attraction', 'food', 'shopping', 'accommodation'])

  return {
    destination: String(body.destination || '').slice(0, 80),
    days: Math.min(14, Math.max(1, Number(body.days) || 3)),
    pace: String(body.pace || 'moderate').slice(0, 30),
    transport: String(body.transport || 'subway').slice(0, 30),
    startTime: String(body.startTime || '').slice(0, 30),
    userNotes: String(body.userNotes || '').slice(0, MAX_NOTES_LENGTH),
    items: items.map((item) => ({
      id: String(item?.id || '').slice(0, 100),
      name: String(item?.name || '').slice(0, 100),
      type: allowedTypes.has(item?.type) ? item.type : 'attraction',
      area: String(item?.area || item?.district || '').slice(0, 80),
      duration: String(item?.duration || '').slice(0, 50),
      tags: Array.isArray(item?.tags)
        ? item.tags.slice(0, 8).map((tag) => String(tag).slice(0, 30))
        : [],
      isRemote: Boolean(item?.isRemote || item?.isFullDay),
    })).filter((item) => item.id && item.name),
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
      provider: providerConfig.provider,
    })
  }

  const request = sanitizeRequest(req.body)
  if (!request.destination || request.items.length === 0) {
    return res.status(400).json({ error: '目的地和候选地点不能为空' })
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
      console.error('AI provider request failed:', providerConfig.provider, response.status, data?.error?.code)
      if (providerConfig.provider === 'doubao' && data?.error?.code === 'ModelNotOpen') {
        return res.status(503).json({
          error: '豆包模型尚未在火山方舟开通，请先在“开通管理”中启用该模型',
          code: 'DOUBAO_MODEL_NOT_OPEN',
        })
      }
      return res.status(502).json({
        error: 'AI 暂时无法完成规划',
        code: 'AI_PROVIDER_ERROR',
      })
    }

    const outputText = getOutputText(data)
    if (!outputText) {
      return res.status(502).json({
        error: 'AI 没有返回可用规划',
        code: 'AI_EMPTY_RESPONSE',
      })
    }

    const plan = parsePlanJson(outputText)
    const validIds = new Set(request.items.map((item) => item.id))
    const seenPlaceIds = new Set()
    const seenFoodIds = new Set()
    const itemTypeById = new Map(request.items.map((item) => [item.id, item.type]))
    const days = Array.from({ length: request.days }, (_, index) => {
      const source = plan.days?.find((day) => day.day === index + 1) || {}
      const orderedPlaceIds = (source.orderedPlaceIds || []).filter((id) => {
        if (!validIds.has(id) || itemTypeById.get(id) === 'food' || seenPlaceIds.has(id)) return false
        seenPlaceIds.add(id)
        return true
      })
      const takeMealId = (id) => {
        if (!id || !validIds.has(id) || itemTypeById.get(id) !== 'food' || seenFoodIds.has(id)) return null
        seenFoodIds.add(id)
        return id
      }

      return {
        day: index + 1,
        theme: String(source.theme || `第${index + 1}天`).slice(0, 40),
        reason: String(source.reason || '').slice(0, 160),
        orderedPlaceIds,
        lunchItemId: takeMealId(source.lunchItemId),
        dinnerItemId: takeMealId(source.dinnerItemId),
      }
    })

    return res.status(200).json({
      days,
      planningNotes: Array.isArray(plan.planningNotes) ? plan.planningNotes.slice(0, 6) : [],
      provider: providerConfig.provider,
      model: providerConfig.model,
    })
  } catch (error) {
    const timedOut = error?.name === 'AbortError'
    console.error('AI planning failed:', timedOut ? 'timeout' : error?.message)
    return res.status(timedOut ? 504 : 500).json({
      error: timedOut ? 'AI 规划超时，请稍后再试' : 'AI 规划失败',
      code: timedOut ? 'AI_TIMEOUT' : 'AI_INTERNAL_ERROR',
    })
  } finally {
    clearTimeout(timeout)
  }
}
