"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { GraduationCap } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-red-600" />
              <span className="text-xl font-bold text-gray-900">SconnieGrades</span>
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-red-600",
                pathname === "/" ? "text-red-600" : "text-gray-700",
              )}
            >
              Search Courses
            </Link>
            <Link
              href="/about"
              className={cn(
                "text-sm font-medium transition-colors hover:text-red-600",
                pathname === "/about" ? "text-red-600" : "text-gray-700",
              )}
            >
              About
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
