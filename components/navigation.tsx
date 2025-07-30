
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Logo from "@/public/SconnieGradesLogo.png"
import { GraduationCap } from "lucide-react"
import Image from "next/image"

export function Navigation() {
  const pathname = usePathname()
  
  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center min-w-0 flex-shrink">
            <Link href="/" className="flex items-center space-x-2">
              <Image src={Logo} alt="SconnieGrades Logo" width={32} height={32} />
              <span className="text-xl font-bold text-gray-900 truncate">SconnieGrades</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4 sm:space-x-8 ml-4">
            <Link
              href="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-red-600 whitespace-nowrap",
                pathname === "/" ? "text-red-600" : "text-gray-700",
              )}
            >
              <span className="hidden sm:inline">Search Courses</span>
              <span className="sm:hidden">Search</span>
            </Link>
            <Link
              href="/about"
              className={cn(
                "text-sm font-medium transition-colors hover:text-red-600 whitespace-nowrap",
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