'use client'

import { useState, useEffect } from 'react'

export default function PhoneDemo() {
  const [videoExists, setVideoExists] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if video exists
    const checkVideo = async () => {
      try {
        const response = await fetch('/videos/demo-tienda.mp4', { method: 'HEAD' })
        setVideoExists(response.ok)
      } catch {
        setVideoExists(false)
      }
    }

    checkVideo()
    
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`flex justify-center items-center transition-all duration-1000 ease-out transform ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}>
      <div className="relative max-w-[300px] w-full mx-auto">
        {/* Phone Frame SVG */}
        <svg
          viewBox="0 0 300 600"
          className="w-full h-auto drop-shadow-2xl"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Phone Body */}
          <rect
            x="10"
            y="10"
            width="280"
            height="580"
            rx="40"
            ry="40"
            fill="#1f2937"
            stroke="#374151"
            strokeWidth="2"
          />
          
          {/* Screen Area */}
          <rect
            x="25"
            y="50"
            width="250"
            height="500"
            rx="25"
            ry="25"
            fill="#4b5563"
            className="screen-area"
          />
          
          {/* Notch */}
          <rect
            x="120"
            y="15"
            width="60"
            height="25"
            rx="12"
            ry="12"
            fill="#111827"
          />
          
          {/* Speaker */}
          <rect
            x="130"
            y="20"
            width="40"
            height="4"
            rx="2"
            ry="2"
            fill="#6b7280"
          />
          
          {/* Camera */}
          <circle
            cx="170"
            cy="27"
            r="3"
            fill="#374151"
          />
          
          {/* Home Indicator */}
          <rect
            x="130"
            y="570"
            width="40"
            height="4"
            rx="2"
            ry="2"
            fill="#6b7280"
          />
        </svg>

        {/* Video/Placeholder Content */}
        <div className="absolute top-[8.33%] left-[8.33%] w-[83.33%] h-[83.33%] rounded-[20px] overflow-hidden">
          {videoExists ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              onError={() => setVideoExists(false)}
            >
              <source src="/videos/demo-tienda.mp4" type="video/mp4" />
            </video>
          ) : (
            <div className="w-full h-full bg-gray-400 flex items-center justify-center">
              <div className="text-center text-gray-600">
                <svg
                  className="w-16 h-16 mx-auto mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm font-medium">Demo Video</p>
                <p className="text-xs opacity-75">Coming Soon</p>
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  )
}