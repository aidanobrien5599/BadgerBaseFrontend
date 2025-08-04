"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, Zap, Target, TrendingUp, Users, Star, FlameIcon as Fire, Award, Sparkles, Rocket } from "lucide-react"
import { useState, useEffect } from "react"

export function DopamineDashboard() {
  const [searchCount, setSearchCount] = useState(0)
  const [streak, setStreak] = useState(7)
  const [level, setLevel] = useState(12)
  const [xp, setXp] = useState(2340)
  const [notifications, setNotifications] = useState(3)

  useEffect(() => {
    const interval = setInterval(() => {
      setSearchCount((prev) => prev + Math.floor(Math.random() * 3))
      setNotifications((prev) => Math.max(0, prev + (Math.random() > 0.7 ? 1 : -1)))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const achievements = [
    { name: "Course Hunter", icon: Target, unlocked: true, color: "text-green-500" },
    { name: "GPA Master", icon: Trophy, unlocked: true, color: "text-yellow-500" },
    { name: "Speed Searcher", icon: Zap, unlocked: false, color: "text-gray-400" },
    { name: "Social Butterfly", icon: Users, unlocked: true, color: "text-blue-500" },
  ]

  return (
    <div className="space-y-4">
      {/* Live Stats */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 animate-spin" />
            Your Stats
            {notifications > 0 && <Badge className="bg-red-500 animate-bounce">{notifications} new!</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold animate-pulse">{searchCount + 47}</div>
              <div className="text-sm opacity-80">Searches Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold flex items-center justify-center gap-1">
                <Fire className="h-5 w-5 text-orange-300" />
                {streak}
              </div>
              <div className="text-sm opacity-80">Day Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level Progress */}
      <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Rocket className="h-5 w-5 text-orange-500 animate-bounce" />
            Level {level}
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black">Course Master</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{xp} XP</span>
              <span>{2500 - xp} to next level</span>
            </div>
            <Progress value={(xp / 2500) * 100} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-500" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 p-2 rounded-lg border ${
                  achievement.unlocked ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                }`}
              >
                <achievement.icon className={`h-4 w-4 ${achievement.color}`} />
                <span className={`text-xs ${achievement.unlocked ? "text-green-700" : "text-gray-500"}`}>
                  {achievement.name}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Button className="w-full bg-white/20 hover:bg-white/30 border-0">
              <Star className="h-4 w-4 mr-2" />
              Rate Last Course
            </Button>
            <Button className="w-full bg-white/20 hover:bg-white/30 border-0">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Trending
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}