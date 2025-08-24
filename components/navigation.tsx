"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogOut } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut, loading } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    setIsMenuOpen(false)
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
            <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium">
              Search
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-gray-900 font-medium">
              About
            </Link>
            {!loading && (
              user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm text-gray-700">
                      {user.user_metadata?.full_name || user.email}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSignOut}
                    className="flex items-center space-x-1"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              ) : (
                <Link href="/auth">
                  <Button className="bg-red-600 hover:bg-red-700 text-white font-medium">
                    Log In
                  </Button>
                </Link>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
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
                className="block px-3 py-2 text-gray-700 hover:text-gray-900 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Search
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-gray-700 hover:text-gray-900 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              {!loading && (
                user ? (
                  <div className="px-3 py-2 space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-700">
                      <User className="h-4 w-4" />
                      <span>{user.user_metadata?.full_name || user.email}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-center space-x-1"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </Button>
                  </div>
                ) : (
                  <Link
                    href="/auth"
                    className="block px-3 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium">
                      Log In
                    </Button>
                  </Link>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
