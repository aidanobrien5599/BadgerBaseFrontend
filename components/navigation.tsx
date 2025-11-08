"use client"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { AuthButton } from "@/components/auth-button"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  
  // Helper function to determine if link is active
  const isActive = (path: string) => {
    return pathname === path
  }
  
  // Helper function to get link classes
  const getLinkClasses = (path: string, isMobile = false) => {
    const baseClasses = isMobile 
      ? "block px-3 py-2 font-medium"
      : "font-medium"
    
    const activeClasses = "text-red-700"
    const inactiveClasses = "text-gray-700 hover:text-red-700"
    
    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`
  }
  
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/BadgerBaseTransparent.png"
              alt="BadgerBase"
              width={40}
              height={40}
              className="h-10 w-auto"
              priority
            />
            <span className="text-xl font-bold text-gray-900">BadgerBase</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className={getLinkClasses("/")}>
              Search
            </Link>
            <Link href="/about" className={getLinkClasses("/about")}>
              About
            </Link>
            <AuthButton />
          </div>
          
          {/* Mobile menu button and auth */}
          <div className="md:hidden flex items-center space-x-2">
            <AuthButton />
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <Link
                href="/"
                className={getLinkClasses("/", true)}
                onClick={() => setIsMenuOpen(false)}
              >
                Search
              </Link>
              <Link
                href="/about"
                className={getLinkClasses("/about", true)}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
