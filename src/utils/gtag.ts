import ReactGA from 'react-ga4'

const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID || ''

// Initialize Google Analytics
export const initGA = (): void => {
  if (!GA_TRACKING_ID) return

  ReactGA.initialize(GA_TRACKING_ID)
}

// Track page views
export const trackPageView = (path: string, title?: string): void => {
  if (!GA_TRACKING_ID) return

  ReactGA.send({
    hitType: 'pageview',
    page: path,
    title: title || document.title
  })
}

// Track custom events
export const trackEvent = (category: string, action: string, label?: string, value?: number): void => {
  if (!GA_TRACKING_ID) return

  ReactGA.event({
    category,
    action,
    label,
    value
  })
}
