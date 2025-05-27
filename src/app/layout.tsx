import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SintrixAI',
  description: 'A simple AI demo using brain.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-white/10 p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <a href="/" className="flex items-center space-x-4">
              <img 
                src="/api/logo" 
                alt="SintrixAI Logo" 
                className="w-24 h-24"
              />
              <span className="text-2xl font-bold">SintrixAI</span>
            </a>
            <div className="space-x-4">
              <a href="/api-docs" className="hover:text-blue-400">API Docs</a>
              <a href="/download" className="hover:text-blue-400">Download</a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
