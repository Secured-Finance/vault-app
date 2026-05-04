// Get Google Analytics tracking ID from environment
export const getGoogleAnalyticsTag = (): string => {
  return import.meta.env.VITE_GA_TRACKING_ID || ''
}

// Track page views
export const pageView = (url: string, trackingId: string): void => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', trackingId, {
      page_path: url
    })
  }
}

// Track custom events
export const event = ({
  action,
  category,
  label,
  value
}: {
  action: string
  category: string
  label?: string
  value?: number
}): void => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    })
  }
}
