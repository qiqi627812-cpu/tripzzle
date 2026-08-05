const BAIDU_ASR_URL = 'https://vop.baidu.com/server_api'
const BAIDU_TOKEN_URL = 'https://aip.baidubce.com/oauth/2.0/token'
const CORS_PROXY = 'https://corsproxy.io/?'

// 生产环境：百度 API Key 由 Vercel Serverless Function (/api/baidu-token) 持有，前端不保存
// 开发环境：若用户在设置面板填入自己的 key，则回退到 corsproxy 直连百度

let audioContext = null
let mediaRecorder = null
let audioChunks = []
let stream = null
let scriptProcessor = null
let pcmData = []

let audioContextSampleRate = 48000

export async function startRecording() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('您的浏览器不支持录音功能')
  }

  try {
    // Use default sample rate - browser may ignore our requested rate
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    audioContextSampleRate = audioContext.sampleRate
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
      }
    })

    const source = audioContext.createMediaStreamSource(stream)

    const bufferSize = 4096
    scriptProcessor = audioContext.createScriptProcessor(bufferSize, 1, 1)
    pcmData = []

    scriptProcessor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0)
      const chunk = new Float32Array(inputData.length)
      chunk.set(inputData)
      pcmData.push(chunk)
    }

    source.connect(scriptProcessor)
    scriptProcessor.connect(audioContext.destination)

    return true
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      throw new Error('请允许麦克风权限')
    }
    throw error
  }
}

export async function stopRecording() {
  return new Promise((resolve, reject) => {
    try {
      const originalSampleRate = audioContextSampleRate

      if (scriptProcessor) {
        scriptProcessor.disconnect()
        scriptProcessor = null
      }

      if (stream) {
        stream.getTracks().forEach(track => track.stop())
        stream = null
      }

      if (audioContext) {
        audioContext.close()
        audioContext = null
      }

      if (pcmData.length === 0) {
        reject(new Error('没有录到音频数据'))
        return
      }

      // Merge all PCM chunks
      const totalLength = pcmData.reduce((acc, chunk) => acc + chunk.length, 0)
      const merged = new Float32Array(totalLength)
      let offset = 0
      for (const chunk of pcmData) {
        merged.set(chunk, offset)
        offset += chunk.length
      }

      // Resample to 16000 Hz if needed
      const targetSampleRate = 16000
      let resampled = merged
      if (originalSampleRate !== targetSampleRate) {
        resampled = resample(merged, originalSampleRate, targetSampleRate)
      }

      // Convert float32 PCM to 16kHz 16bit mono WAV
      const wavBuffer = float32ToWav(resampled, targetSampleRate)
      const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' })

      pcmData = []
      resolve(wavBlob)
    } catch (error) {
      reject(error)
    }
  })
}

// Linear interpolation resampling
function resample(inputBuffer, fromRate, toRate) {
  if (fromRate === toRate) return inputBuffer

  const ratio = fromRate / toRate
  const outputLength = Math.round(inputBuffer.length / ratio)
  const output = new Float32Array(outputLength)

  for (let i = 0; i < outputLength; i++) {
    const srcIndex = i * ratio
    const srcIndexFloor = Math.floor(srcIndex)
    const srcIndexCeil = Math.min(srcIndexFloor + 1, inputBuffer.length - 1)
    const fraction = srcIndex - srcIndexFloor

    output[i] = inputBuffer[srcIndexFloor] * (1 - fraction) + inputBuffer[srcIndexCeil] * fraction
  }

  return output
}

function float32ToWav(float32Array, sampleRate) {
  const numChannels = 1
  const bitDepth = 16
  const bytesPerSample = bitDepth / 8
  const blockAlign = numChannels * bytesPerSample
  const dataLength = float32Array.length * bytesPerSample
  const bufferLength = 44 + dataLength

  const arrayBuffer = new ArrayBuffer(bufferLength)
  const view = new DataView(arrayBuffer)

  // RIFF header
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataLength, true)
  writeString(view, 8, 'WAVE')

  // fmt chunk
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)           // chunk size
  view.setUint16(20, 1, true)            // PCM format
  view.setUint16(22, numChannels, true)   // mono
  view.setUint32(24, sampleRate, true)    // 16000 Hz
  view.setUint32(28, sampleRate * blockAlign, true) // byte rate
  view.setUint16(32, blockAlign, true)    // block align
  view.setUint16(34, bitDepth, true)      // bits per sample

  // data chunk
  writeString(view, 36, 'data')
  view.setUint32(40, dataLength, true)

  // Write PCM samples
  let offset = 44
  for (let i = 0; i < float32Array.length; i++) {
    const sample = Math.max(-1, Math.min(1, float32Array[i]))
    const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF
    view.setInt16(offset, intSample, true)
    offset += 2
  }

  return arrayBuffer
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

export async function recognizeSpeechBaidu(audioBlob, apiKey, secretKey) {
  // apiKey/secretKey 可选：
  //   - 未传 → 走后端 /api/baidu-token（生产环境，key 不暴露）
  //   - 传了 → 走 corsproxy 直连百度（开发环境，用户自填 key）
  try {
    const token = await getBaiduToken(apiKey, secretKey)

    // Convert blob to base64
    const base64Audio = await blobToBase64(audioBlob)

    // Calculate actual byte length of the base64 data
    const byteLength = Math.floor(base64Audio.length * 3 / 4)

    // Check size limit (Baidu max 60s / ~10MB)
    if (byteLength > 10 * 1024 * 1024) {
      throw new Error('录音文件过大，请控制在60秒以内')
    }

    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(`${BAIDU_ASR_URL}?cuid=tripzzle_demo&token=${token}`)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        format: 'wav',
        rate: 16000,
        channel: 1,
        cuid: 'tripzzle_demo',
        token: token,
        speech: base64Audio,
        len: byteLength,
        dev_pid: 1537,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`API请求失败 (${response.status}): ${text.substring(0, 200)}`)
    }

    const text = await response.text()
    if (!text) {
      throw new Error('API返回空响应，请检查API配置是否正确')
    }

    let result
    try {
      result = JSON.parse(text)
    } catch {
      throw new Error(`API返回格式错误: ${text.substring(0, 200)}`)
    }

    if (result.err_no === 0 && result.result && result.result.length > 0) {
      return result.result[0]
    } else if (result.err_no === 3301) {
      throw new Error('语音质量过差，请靠近麦克风重新录音')
    } else if (result.err_no === 3302) {
      throw new Error('语音过长，请控制在60秒以内')
    } else if (result.err_no === 3307) {
      throw new Error('语音过短，请说更长的句子')
    } else if (result.err_no !== 0) {
      throw new Error(result.err_msg || `识别失败 (错误码: ${result.err_no})`)
    } else {
      throw new Error('未识别到语音内容，请重新录音')
    }
  } catch (error) {
    if (error.message.includes('Failed to fetch')) {
      throw new Error('网络请求失败，请检查网络连接')
    }
    throw error
  }
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const dataUrl = reader.result
      const base64 = dataUrl.split(',')[1]
      if (!base64) {
        reject(new Error('音频数据转换失败'))
        return
      }
      resolve(base64)
    }
    reader.onerror = () => reject(new Error('音频读取失败'))
    reader.readAsDataURL(blob)
  })
}

async function getBaiduToken(apiKey, secretKey) {
  // 缓存 key 区分来源：后端 vs 用户 key
  const cacheKey = (apiKey && secretKey) ? `user:${apiKey}` : 'backend'
  const cachedToken = localStorage.getItem('baidu_asr_token')
  const cachedExpiry = localStorage.getItem('baidu_asr_token_expiry')
  const cachedKeyTag = localStorage.getItem('baidu_asr_cache_tag')

  // 缓存失效（来源变化）
  if (cachedKeyTag !== cacheKey) {
    localStorage.removeItem('baidu_asr_token')
    localStorage.removeItem('baidu_asr_token_expiry')
  }

  if (cachedToken && cachedExpiry && Date.now() < parseInt(cachedExpiry) && cachedKeyTag === cacheKey) {
    return cachedToken
  }

  // 路径 A：用户提供 key（开发环境）→ corsproxy 直连百度
  if (apiKey && secretKey) {
    return await fetchTokenViaCorsProxy(apiKey, secretKey, cacheKey)
  }

  // 路径 B：后端 Serverless Function（生产环境）→ /api/baidu-token
  return await fetchTokenFromBackend(cacheKey)
}

// 路径 A：通过 corsproxy 直连百度 token 接口（仅开发环境使用用户自填 key）
async function fetchTokenViaCorsProxy(apiKey, secretKey, cacheKey) {
  try {
    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(`${BAIDU_TOKEN_URL}?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`)}`, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error(`获取Token失败 (HTTP ${response.status})`)
    }

    const data = await response.json()

    if (data.access_token) {
      localStorage.setItem('baidu_asr_token', data.access_token)
      localStorage.setItem('baidu_asr_token_expiry', String(Date.now() + (data.expires_in - 3600) * 1000))
      localStorage.setItem('baidu_asr_cache_tag', cacheKey)
      return data.access_token
    } else if (data.error) {
      localStorage.removeItem('baidu_asr_token')
      localStorage.removeItem('baidu_asr_token_expiry')
      throw new Error(data.error_description || 'API Key或Secret Key不正确')
    } else {
      throw new Error('获取Token失败，请检查API配置')
    }
  } catch (error) {
    if (error.message.includes('Failed to fetch')) {
      throw new Error('无法连接百度服务器，请检查网络')
    }
    throw error
  }
}

// 路径 B：调用 Vercel Serverless Function 获取 token（生产环境，key 不暴露）
async function fetchTokenFromBackend(cacheKey) {
  try {
    const response = await fetch('/api/baidu-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    if (response.status === 404) {
      throw new Error('后端 token 接口未部署。生产环境请部署到 Vercel；本地开发请在设置面板填入百度 API Key，或使用 vercel dev 运行。')
    }

    if (!response.ok) {
      let msg = `后端 token 接口返回 HTTP ${response.status}`
      try {
        const errData = await response.json()
        if (errData && errData.message) msg = errData.message
      } catch {}
      throw new Error(msg)
    }

    const data = await response.json()

    if (data.access_token) {
      localStorage.setItem('baidu_asr_token', data.access_token)
      localStorage.setItem('baidu_asr_token_expiry', String(Date.now() + (data.expires_in - 3600) * 1000))
      localStorage.setItem('baidu_asr_cache_tag', cacheKey)
      return data.access_token
    }

    throw new Error(data.message || '后端返回的 token 为空')
  } catch (error) {
    if (error.message.includes('Failed to fetch')) {
      throw new Error('无法连接后端 token 服务，请检查网络或部署状态')
    }
    throw error
  }
}

export function getBaiduConfig() {
  return {
    apiKey: localStorage.getItem('baidu_asr_api_key') || '',
    secretKey: localStorage.getItem('baidu_asr_secret_key') || '',
  }
}

export function setBaiduConfig(apiKey, secretKey) {
  localStorage.setItem('baidu_asr_api_key', apiKey)
  localStorage.setItem('baidu_asr_secret_key', secretKey)
}