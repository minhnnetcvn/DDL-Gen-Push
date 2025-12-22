import Link from "next/link"
import { Database, Home } from "lucide-react"

export function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
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
      </div>
    </nav>
  )
}
