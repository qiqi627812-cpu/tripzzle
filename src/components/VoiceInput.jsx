import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Send, Loader2 } from 'lucide-react'

export default function VoiceInput({ onParse, destinationId }) {
  const [isListening, setIsListening] = useState(false)
  const [text, setText] = useState('')
  const [isParsing, setIsParsing] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'zh-CN'

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('')
        setText(transcript)
      }

      recognitionRef.current.onerror = (event) => {
        console.error('语音识别错误:', event.error)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('您的浏览器不支持语音识别，请使用Chrome浏览器')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
    } else {
      setText('')
      recognitionRef.current.start()
    }
    setIsListening(!isListening)
  }

  const handleSubmit = async () => {
    if (!text.trim()) return
    setIsParsing(true)
    await onParse(text, destinationId)
    setIsParsing(false)
    setText('')
  }

  return (
    <div className="card p-6">
      <h3 className="text-xl font-bold text-trip-ink mb-4 flex items-center gap-2">
        <Mic className="w-5 h-5 text-trip-coral" />
        口述行程安排
      </h3>
      <p className="text-sm text-trip-slate mb-4">
        告诉我们您的行程，比如："第一天去故宫和天安门，中午吃北京烤鸭，晚上住王府井附近的酒店"
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入或说出您的行程安排..."
        className="input-base w-full h-32 p-4 resize-none"
      />

      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={toggleListening}
          disabled={isParsing}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all ${
            isListening
              ? 'bg-trip-coral text-white'
              : 'bg-trip-mint text-white'
          } ${isParsing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5" />
              <span>正在听...</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span>语音输入</span>
            </>
          )}
        </button>

        <button
          onClick={handleSubmit}
          disabled={!text.trim() || isParsing}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all ${
            text.trim() && !isParsing
              ? 'btn-primary'
              : 'bg-trip-border text-trip-muted cursor-not-allowed'
          }`}
        >
          {isParsing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>解析中...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>生成攻略</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-4 p-3 bg-trip-cloud rounded-xl">
        <p className="text-xs text-trip-muted">
          💡 示例："三天两夜北京游，第一天去故宫和天安门，中午吃北京烤鸭，晚上逛南锣鼓巷；第二天去长城和颐和园；第三天去鸟巢和三里屯"
        </p>
      </div>
    </div>
  )
}
