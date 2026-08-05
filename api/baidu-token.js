// Vercel Serverless Function: 百度语音 API Token 代理
// 前端调用 /api/baidu-token，后端读取环境变量，避免 key 暴露

let tokenCache = null
let tokenExpiry = 0

export default async function handler(req, res) {
  // 只允许 POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 检查环境变量
  const apiKey = process.env.BAIDU_API_KEY
  const secretKey = process.env.BAIDU_SECRET_KEY

  if (!apiKey || !secretKey) {
    return res.status(500).json({
      error: 'BAIDU_API_KEY 或 BAIDU_SECRET_KEY 未配置',
      message: '请在 Vercel 控制台设置环境变量 BAIDU_API_KEY 和 BAIDU_SECRET_KEY'
    })
  }

  // 内存缓存（Vercel Serverless 实例生命周期内有效）
  if (tokenCache && tokenExpiry > Date.now()) {
    return res.status(200).json({
      access_token: tokenCache,
      expires_in: Math.floor((tokenExpiry - Date.now()) / 1000)
    })
  }

  try {
    // 获取百度 token
    const tokenUrl = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`

    const response = await fetch(tokenUrl, { method: 'POST' })
    const data = await response.json()

    if (data.error) {
      return res.status(400).json({
        error: '百度 API 返回错误',
        message: data.error_description || data.error
      })
    }

    if (!data.access_token) {
      return res.status(500).json({
        error: '获取 token 失败',
        message: '百度 API 未返回 access_token'
      })
    }

    // 缓存 token（提前 1 小时过期）
    tokenCache = data.access_token
    tokenExpiry = Date.now() + ((data.expires_in || 86400) - 3600) * 1000

    return res.status(200).json({
      access_token: data.access_token,
      expires_in: data.expires_in
    })

  } catch (err) {
    return res.status(500).json({
      error: '请求百度 API 失败',
      message: err.message || '网络错误'
    })
  }
}