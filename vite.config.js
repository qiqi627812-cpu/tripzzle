import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import aiPlanHandler from './api/ai-plan.js'
import aiIntakeHandler from './api/ai-intake.js'

function createApiResponse(nodeResponse) {
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
  for await (const chunk of request) chunks.push(chunk)
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}
}

function localAiApiPlugin() {
  const handlers = {
    '/api/ai-plan': aiPlanHandler,
    '/api/ai-intake': aiIntakeHandler,
  }

  const attachMiddleware = (server) => {
    server.middlewares.use(async (request, response, next) => {
      const pathname = String(request.url || '').split('?')[0]
      const handler = handlers[pathname]
      if (!handler) return next()

      try {
        request.body = await readJsonBody(request)
        await handler(request, createApiResponse(response))
      } catch (error) {
        console.error('Local AI API failed:', error)
        if (!response.headersSent) {
          response.statusCode = 400
          response.setHeader('Content-Type', 'application/json; charset=utf-8')
        }
        if (!response.writableEnded) {
          response.end(JSON.stringify({ error: '请求格式错误', code: 'INVALID_REQUEST' }))
        }
      }
    })
  }

  return {
    name: 'tripzzle-local-ai-api',
    configureServer: attachMiddleware,
    configurePreviewServer: attachMiddleware,
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.entries(env).forEach(([key, value]) => {
    if (!(key in process.env)) process.env[key] = value
  })

  return {
  base: './',
  plugins: [react(), localAiApiPlugin()],
  server: {
    proxy: {
      '/baidu-asr': {
        target: 'https://vop.baidu.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/baidu-asr/, ''),
      },
      '/baidu-token': {
        target: 'https://aip.baidubce.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/baidu-token/, ''),
      },
      '/amap-api': {
        target: 'https://restapi.amap.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/amap-api/, ''),
      },
    },
  },
  }
})
