import type { ReactElement, ReactNode } from 'react'
import { useEffect } from 'react'
import { useLocation } from 'react-router'
import * as gtag from '../utils/gtag'

interface GoogleAnalyticsProviderProps {
  trackingId: string
  children: ReactNode
}

export function GoogleAnalyticsProvider({ trackingId, children }: GoogleAnalyticsProviderProps): ReactElement {
  const location = useLocation()

  // Initialize Google Analytics (optimized to prevent double tracking and race conditions)
  useEffect(() => {
    if (!trackingId) return

    // Check if gtag is already loaded
    if (typeof window.gtag !== 'undefined') return

    // Initialize dataLayer and gtag function synchronously (prevents race conditions)
    window.dataLayer = window.dataLayer || []
    window.gtag = (...args: any[]) => {
      window.dataLayer.push(args)
    }
    window.gtag('js', new Date())
    // Disable automatic page views - we'll track manually for full control
    window.gtag('config', trackingId, { send_page_view: false })

    // Load gtag.js library asynchronously
    const gtagScript = document.createElement('script')
    gtagScript.async = true
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`
    document.head.appendChild(gtagScript)
  }, [trackingId])

  // Track page views on route changes (including initial mount)
  useEffect(() => {
    if (trackingId) {
      const url = location.pathname + location.search + location.hash
      gtag.pageView(url, trackingId)
    }
  }, [location, trackingId])

  return <>{children}</>
}

export default GoogleAnalyticsProvider
