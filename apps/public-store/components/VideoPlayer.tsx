'use client'

import { useVideoAutoPlay } from '../lib/hooks/useVideoAutoPlay'

interface VideoPlayerProps {
  src: string
  alt: string
  className?: string
  showControls?: boolean
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  playsInline?: boolean
  preload?: 'none' | 'metadata' | 'auto'
  poster?: string
  onPlay?: () => void
  onPause?: () => void
}

export default function VideoPlayer({
  src,
  alt,
  className = '',
  showControls = false,
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  preload = 'metadata',
  poster,
  onPlay,
  onPause
}: VideoPlayerProps) {
  const { videoRef, isInView, isPlaying } = useVideoAutoPlay(0.3)

  const handlePlay = () => {
    onPlay?.()
  }

  const handlePause = () => {
    onPause?.()
  }

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      controls={showControls}
      autoPlay={false} // We handle autoplay via intersection observer
      loop={loop}
      muted={muted}
      playsInline={playsInline}
      preload={preload}
      poster={poster}
      onPlay={handlePlay}
      onPause={handlePause}
      style={{ 
        display: 'block',
        maxWidth: '100%',
        height: '100%',
        objectFit: 'cover'
      }}
    >
      Tu navegador no soporta videos.
    </video>
  )
} 