import type React from "react"
import type { Metadata } from "next"
import { IBM_Plex_Mono, IBM_Plex_Sans, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Analytics } from "@vercel/analytics/react"
import { PostHogProvider } from "@/components/PostHogProvider"

import { Suspense } from "react"
import { Toaster } from "sonner"

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
})

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  title: "BadgerBase",
  description:
    "Data-aggregated search and filter of live UW-Madison courses with instructor ratings and GPA information",
  icons: {
    icon: "/BadgerBaseTransparent.png",
  },
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable} ${spaceGrotesk.variable}`}>
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          <PostHogProvider>
            <Navigation />
            <main className="min-h-screen bg-background">{children}</main>
            <Footer />
            <Analytics />
            <Toaster />
          </PostHogProvider>
        </Suspense>
      </body>
    </html>
  )
}
