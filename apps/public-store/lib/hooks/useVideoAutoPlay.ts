import { useEffect, useRef, useState } from 'react'

export const useVideoAutoPlay = (threshold = 0.5) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
        
        if (entry.isIntersecting) {
          // Video is in view, try to play
          video.play().then(() => {
            setIsPlaying(true)
          }).catch((error) => {
            console.log('Auto-play failed:', error)
            setIsPlaying(false)
          })
        } else {
          // Video is out of view, pause
          video.pause()
          setIsPlaying(false)
        }
      },
      {
        threshold,
        rootMargin: '50px'
      }
    )

    observer.observe(video)

    return () => {
      observer.disconnect()
    }
  }, [threshold])

  return { videoRef, isInView, isPlaying }
} 