"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TrendingUp, MessageCircle, Heart, Share2, Eye, Clock, FlameIcon as Fire } from "lucide-react"
import { useState, useEffect } from "react"

interface TrendingPost {
  id: string
  user: string
  avatar: string
  content: string
  course: string
  likes: number
  comments: number
  views: number
  timeAgo: string
  trending: boolean
}

export function TrendingFeed() {
  const [posts, setPosts] = useState<TrendingPost[]>([
    {
      id: "1",
      user: "sarah_uwmad",
      avatar: "S",
      content: "Just got an A in CS 540! Prof Johnson is actually amazing if you go to office hours 🔥",
      course: "CS 540",
      likes: 234,
      comments: 45,
      views: 1200,
      timeAgo: "2m",
      trending: true,
    },
    {
      id: "2",
      user: "mike_badger",
      avatar: "M",
      content: "PSA: MATH 221 with Prof Chen = easy A if you do the homework. Trust me on this one 📚",
      course: "MATH 221",
      likes: 189,
      comments: 32,
      views: 890,
      timeAgo: "5m",
      trending: true,
    },
    {
      id: "3",
      user: "jenny_studies",
      avatar: "J",
      content: "AVOID CHEM 343 at 8am. I repeat, AVOID. Unless you're a morning person (which I'm not) 😴",
      course: "CHEM 343",
      likes: 156,
      comments: 28,
      views: 670,
      timeAgo: "12m",
      trending: false,
    },
    {
      id: "4",
      user: "alex_premed",
      avatar: "A",
      content: "Bio 152 curve saved my GPA 🙏 Shoutout to everyone who made the class average a 67%",
      course: "BIO 152",
      likes: 298,
      comments: 67,
      views: 1450,
      timeAgo: "18m",
      trending: true,
    },
  ])

  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())

  useEffect(() => {
    const interval = setInterval(() => {
      setPosts((prev) =>
        prev.map((post) => ({
          ...post,
          likes: post.likes + Math.floor(Math.random() * 3),
          views: post.views + Math.floor(Math.random() * 10),
        })),
      )
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  return (
    <Card className="h-[600px] overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <CardTitle className="flex items-center gap-2">
          <Fire className="h-5 w-5 animate-pulse" />
          Live Campus Feed
          <Badge className="bg-white/20 animate-bounce">
            <Eye className="h-3 w-3 mr-1" />
            {posts.reduce((sum, post) => sum + post.views, 0).toLocaleString()} views
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 h-full overflow-y-auto">
        <div className="space-y-1">
          {posts.map((post) => (
            <div key={post.id} className="p-4 border-b hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white text-xs">
                    {post.avatar}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{post.user}</span>
                    <Badge variant="outline" className="text-xs">
                      {post.course}
                    </Badge>
                    {post.trending && (
                      <Badge className="bg-gradient-to-r from-orange-400 to-red-400 text-white text-xs">
                        <TrendingUp className="h-2 w-2 mr-1" />
                        HOT
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.timeAgo}
                    </span>
                  </div>

                  <p className="text-sm text-gray-800 mb-2">{post.content}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-6 px-2 ${likedPosts.has(post.id) ? "text-red-500" : ""}`}
                      onClick={() => handleLike(post.id)}
                    >
                      <Heart className={`h-3 w-3 mr-1 ${likedPosts.has(post.id) ? "fill-current" : ""}`} />
                      {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                    </Button>

                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      {post.comments}
                    </Button>

                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      <Share2 className="h-3 w-3 mr-1" />
                      Share
                    </Button>

                    <div className="flex items-center gap-1 ml-auto">
                      <Eye className="h-3 w-3" />
                      {post.views.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}