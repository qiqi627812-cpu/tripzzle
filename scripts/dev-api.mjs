import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import aiPlanHandler from '../api/ai-plan.js'
import aiIntakeHandler from '../api/ai-intake.js'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const envFile = path.join(projectRoot, '.env.local')
const port = Number(process.env.TRIPZZLE_API_PORT || 8787)

function loadLocalEnv() {
  if (!fs.existsSync(envFile)) return

  const lines = fs.readFileSync(envFile, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const separator = trimmed.indexOf('=')
    if (separator < 1) continue

    const key = trimmed.slice(0, separator).trim()
    let value = trimmed.slice(separator + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = value
  }
}

function createResponse(nodeResponse) {
  return {
    setHeader(name, value) {
      nodeResponse.setHeader(name, value)
      return this
    },
    status(statusCode) {
      nodeResponse.statusCode = statusCode
      return this
    },
    json(value) {
      if (!nodeResponse.headersSent) {
        nodeResponse.setHeader('Content-Type', 'application/json; charset=utf-8')
      }
      nodeResponse.end(JSON.stringify(value))
      return this
    },
  }
}

async function readJsonBody(request) {
  const chunks = []
  let size = 0

  for await (const chunk of request) {
    size += chunk.length
    if (size > 1024 * 1024) throw new Error('REQUEST_TOO_LARGE')
    chunks.push(chunk)
  }

  if (chunks.length === 0) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

loadLocalEnv()

const server = http.createServer(async (request, response) => {
  response.setHeader('Cache-Control', 'no-store')

  if (request.url === '/health') {
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    response.end(JSON.stringify({
      ok: true,
      provider: process.env.AI_PROVIDER || (process.env.ARK_API_KEY ? 'doubao' : 'openai'),
      aiConfigured: Boolean(process.env.ARK_API_KEY || process.env.OPENAI_API_KEY),
      model: process.env.AI_PROVIDER === 'doubao'
        ? (process.env.ARK_MODEL || 'doubao-seed-2-0-lite-260428')
        : (process.env.OPENAI_MODEL || 'gpt-5.6-luna'),
    }))
    return
  }

  const handlers = {
    '/api/ai-plan': aiPlanHandler,
    '/api/ai-intake': aiIntakeHandler,
  }
  const handler = handlers[request.url]

  if (!handler) {
    response.statusCode = 404
    response.end(JSON.stringify({ error: 'Not found' }))
    return
  }

  try {
    request.body = await readJsonBody(request)
    await handler(request, createResponse(response))
  } catch (error) {
    response.statusCode = error?.message === 'REQUEST_TOO_LARGE' ? 413 : 400
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    response.end(JSON.stringify({
      error: error?.message === 'REQUEST_TOO_LARGE' ? '请求内容过大' : '请求格式错误',
    }))
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Tripzzle local API: http://127.0.0.1:${port}`)
  const provider = process.env.AI_PROVIDER || (process.env.ARK_API_KEY ? 'doubao' : 'openai')
  const configured = Boolean(process.env.ARK_API_KEY || process.env.OPENAI_API_KEY)
  const model = provider === 'doubao'
    ? (process.env.ARK_MODEL || 'doubao-seed-2-0-lite-260428')
    : (process.env.OPENAI_MODEL || 'gpt-5.6-luna')
  console.log(`AI provider: ${provider}`)
  console.log(`AI configured: ${configured}`)
  console.log(`Model: ${model}`)
})
