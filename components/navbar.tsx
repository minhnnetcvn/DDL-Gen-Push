"use client"
import Link from "next/link"
import { Database, Home, User } from "lucide-react"
import { useUsername } from "@/context/usernameContext"

export function Navbar() {
  const username = useUsername();
  
  const handleResetUsername = () => {
    confirm("Are you sure you want to reset your username?")
      && sessionStorage.removeItem("username");
    window.location.reload();
  }
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex justify-between">
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="flex items-center gap-2 transition-colors hover:text-primary">
            <Home className="h-4 w-4" />
            <span>Create</span>
          </Link>
          <Link href="/db-explorer" className="flex items-center gap-2 transition-colors hover:text-primary">
            <Database className="h-4 w-4" />
            <span>Explorer</span>
          </Link>
        </div>
        <Link href="/" className="flex items-center gap-2 transition-colors hover:text-primary" onClick={handleResetUsername}>
            {username && <User className="h-4 w-4" />}
            <span>{username}</span>
        </Link>
      </div>
    </nav>
  )
}
