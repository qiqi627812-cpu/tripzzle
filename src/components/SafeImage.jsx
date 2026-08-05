import { useState, useEffect } from 'react'
import { getPlaceholderUrl, getSvgPlaceholder } from '../utils/imageFallback'

export default function SafeImage({ src, alt, className, fallbackText }) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [hasError, setHasError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const isSvgDataUrl = src && src.startsWith('data:image/svg+xml')
  const isVisible = isSvgDataUrl || isLoaded || hasError

  useEffect(() => {
    setCurrentSrc(src)
    setHasError(false)
    setIsLoaded(false)
  }, [src])

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      const text = fallbackText || alt || 'Tripzzle'
      setCurrentSrc(getSvgPlaceholder(text))
    }
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={`${className} transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy"
    />
  )
}