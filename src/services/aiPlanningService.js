const AI_TIMEOUT_MS = 28_000

export async function getAiPlanningAdvice({
  destination,
  items,
  preferences,
  userNotes,
}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)

  try {
    const response = await fetch('/api/ai-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        destination: destination?.name,
        days: preferences?.days,
        pace: preferences?.pace,
        transport: preferences?.transport,
        startTime: preferences?.startTime,
        userNotes,
        items,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error?.code || `AI_HTTP_${response.status}`)
    }

    return await response.json()
  } finally {
    clearTimeout(timeout)
  }
}

export default getAiPlanningAdvice
