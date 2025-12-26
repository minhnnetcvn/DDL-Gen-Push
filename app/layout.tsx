import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { Navbar } from "@/components/Navbar"
import "./globals.css"
import { UsernameProvider } from "@/context/usernameContext"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Next.js Forms Examples",
  description: "A collection of form components with different patterns and use cases",
  generator: "v0.app",
  icons: {
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <UsernameProvider>
          <Navbar />
          {children}
          <Toaster />
          <Analytics />
        </UsernameProvider>
      </body>
    </html>
  )
}
