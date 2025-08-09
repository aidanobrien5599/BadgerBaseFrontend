"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share, TrendingUp, Zap, FlameIcon as Fire } from "lucide-react"
import { useState, useEffect } from "react"

interface TikTokVideo {
  id: string
  embedUrl: string
  title: string
  likes: number
  comments: number
  trending: boolean
}

export function TikTokFeed() {
  const [currentVideo, setCurrentVideo] = useState(0)
  const [likes, setLikes] = useState<{ [key: string]: number }>({})

  const videos: TikTokVideo[] = [
    {
      id: "1",
      embedUrl: "https://www.tiktok.com/embed/v2/7234567890123456789",
      title: "How to Pick Easy A Classes 📚✨",
      likes: 12400,
      comments: 234,
      trending: true,
    },
    {
      id: "2",
      embedUrl: "https://www.tiktok.com/embed/v2/7234567890123456790",
      title: "Rate My Professor Hacks 🎓",
      likes: 8900,
      comments: 156,
      trending: false,
    },
    {
      id: "3",
      embedUrl: "https://www.tiktok.com/embed/v2/7234567890123456791",
      title: "Course Registration Tips 🚀",
      likes: 15600,
      comments: 289,
      trending: true,
    },
    {
      id: "4",
      embedUrl: "https://www.tiktok.com/embed/v2/7234567890123456792",
      title: "GPA Boosting Strategies 📈",
      likes: 22100,
      comments: 445,
      trending: true,
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % videos.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [videos.length])

  const handleLike = (videoId: string) => {
    setLikes((prev) => ({
      ...prev,
      [videoId]: (prev[videoId] || 0) + 1,
    }))
  }

  const currentVid = videos[currentVideo]

  return (
    <Card className="h-[600px] overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="relative">
            <Zap className="h-5 w-5 text-yellow-500 animate-pulse" />
            <Fire className="h-3 w-3 text-red-500 absolute -top-1 -right-1 animate-bounce" />
          </div>
          Study Tips Feed
          {currentVid.trending && (
            <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white animate-pulse">
              <TrendingUp className="h-3 w-3 mr-1" />
              TRENDING
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 h-full">
        <div className="relative h-full">
          {/* Mock TikTok Video Player */}
          <div className="bg-black rounded-lg mx-4 mb-4 h-[400px] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />

            {/* Mock Video Content */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <div className="text-center text-white z-20">
                <div className="text-6xl mb-4 animate-bounce">🎓</div>
                <h3 className="text-xl font-bold mb-2">{currentVid.title}</h3>
                <div className="text-sm opacity-80">@sconniegrades</div>
              </div>
            </div>

            {/* Video Controls */}
            <div className="absolute right-4 bottom-20 z-20 space-y-4">
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full bg-black/20 text-white hover:bg-black/40 flex flex-col h-12 w-12 p-0"
                onClick={() => handleLike(currentVid.id)}
              >
                <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                <span className="text-xs">{(currentVid.likes + (likes[currentVid.id] || 0)).toLocaleString()}</span>
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="rounded-full bg-black/20 text-white hover:bg-black/40 flex flex-col h-12 w-12 p-0"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-xs">{currentVid.comments}</span>
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="rounded-full bg-black/20 text-white hover:bg-black/40 flex flex-col h-12 w-12 p-0"
              >
                <Share className="h-5 w-5" />
                <span className="text-xs">Share</span>
              </Button>
            </div>

            {/* Progress Indicator */}
            <div className="absolute bottom-4 left-4 right-16 z-20">
              <div className="flex space-x-1">
                {videos.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      index === currentVideo ? "bg-white" : "bg-white/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Video Navigation */}
          <div className="px-4 space-y-2">
            <div className="flex justify-between items-center">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentVideo((prev) => (prev - 1 + videos.length) % videos.length)}
                className="flex-1 mr-2"
              >
                ← Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentVideo((prev) => (prev + 1) % videos.length)}
                className="flex-1 ml-2"
              >
                Next →
              </Button>
            </div>

            <div className="text-center">
              <Badge variant="secondary" className="animate-pulse">
                {currentVideo + 1} of {videos.length}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
