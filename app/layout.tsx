import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Analytics } from "@vercel/analytics/react"
import { PostHogProvider } from "@/components/PostHogProvider"
import { MaintenanceBanner } from "@/components/maintenance-banner" // Import the new component
import { Suspense } from "react"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

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
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={<div>Loading...</div>}>
          <PostHogProvider>
            <Navigation />
            <main className="min-h-screen bg-gray-50">{children}</main>
            <Footer />
            <Analytics />
            <Toaster />
          </PostHogProvider>
        </Suspense>
      </body>
    </html>
  )
}
