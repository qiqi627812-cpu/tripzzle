const AI_TIMEOUT_MS = 35_000

export async function getAiTripIntake({
  destination,
  brief,
  candidates,
}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)

  try {
    const response = await fetch('/api/ai-intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        destinationId: destination?.id,
        destinationName: destination?.name,
        brief,
        candidates,
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

export default getAiTripIntake
