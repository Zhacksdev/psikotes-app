import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Psikotes App",
<<<<<<< HEAD
=======
  description: "Created with v0",
  generator: "v0.dev",
>>>>>>> 7b6796f4b351d96d10c2407f970f47bb7975196d
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
