import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from "@/components/providers"
import './globals.css'

export const metadata: Metadata = {
  title: 'Vex - AI-Powered Career Acceleration',
  description: 'Identify skill gaps, generate personalized courses, improve your CV, and automatically apply to jobs. Land your dream job faster with AI.',
  generator: 'Vex',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Stack+Sans+Notch:wght@200..700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Providers>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </Providers>
      </body>
    </html>
  )
}
