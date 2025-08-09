"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Instagram, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InstagramReelsProps {
  className?: string
}

export function InstagramReels({ className }: InstagramReelsProps) {
  const reels = [
    {
      id: "DGvozDWxn3D",
      url: "https://www.instagram.com/reels/DGvozDWxn3D/",
      embedUrl: "https://www.instagram.com/p/DGvozDWxn3D/embed",
      caption: "Course Selection Tips 📚",
    },
    // Add more reels here as needed
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Instagram className="h-5 w-5 text-pink-500" />
          Study Tips & Campus Life
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reels.map((reel) => (
          <div key={reel.id} className="space-y-2">
            {/* Instagram Embed */}
            <div className="relative w-full" style={{ paddingBottom: "125%" }}>
              <iframe
                src={reel.embedUrl}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                frameBorder="0"
                scrolling="no"
                allowTransparency={true}
                allow="encrypted-media"
                loading="lazy"
              />
            </div>

            {/* Fallback Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(reel.url, "_blank")}
              className="w-full flex items-center gap-2"
            >
              <Instagram className="h-4 w-4" />
              View on Instagram
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {/* Add more reels prompt */}
        <div className="text-center p-4 border-2 border-dashed border-gray-200 rounded-lg">
          <Instagram className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-2">Want to see more study tips?</p>
          <Button variant="outline" size="sm" onClick={() => window.open("https://www.instagram.com/", "_blank")}>
            Follow us on Instagram
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
