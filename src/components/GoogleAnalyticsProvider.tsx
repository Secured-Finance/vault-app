import type { ReactElement, ReactNode } from 'react'
import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { initGA, trackPageView } from '../utils/gtag'

interface GoogleAnalyticsProviderProps {
  children: ReactNode
}

export function GoogleAnalyticsProvider({ children }: GoogleAnalyticsProviderProps): ReactElement {
  const location = useLocation()

  // Initialize Google Analytics once
  useEffect(() => {
    initGA()
  }, [])

  // Track page views on route changes
  useEffect(() => {
    const path = location.pathname + location.search + location.hash
    trackPageView(path)
  }, [location])

  return <>{children}</>
}

export default GoogleAnalyticsProvider
