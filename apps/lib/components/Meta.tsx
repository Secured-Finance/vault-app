import type { ReactElement } from 'react'
import { useEffect } from 'react'

type TMeta = {
  title: string
  titleColor: string
  themeColor: string
  description: string
  og: string
  uri: string
}

function upsertMeta(attrKey: 'name' | 'property', attrVal: string, content: string): void {
  const selector = `meta[${attrKey}="${attrVal}"]`
  let el = document.head.querySelector(selector) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attrKey, attrVal)
    document.head.appendChild(el)
  }
  el.content = content
}

export function Meta(meta: TMeta): ReactElement {
  useEffect(() => {
    document.title = meta.title

    upsertMeta('name', 'description', meta.description)
    upsertMeta('name', 'theme-color', meta.themeColor)
    upsertMeta('name', 'msapplication-TileColor', meta.titleColor)
    upsertMeta('name', 'application-name', meta.title)
    upsertMeta('name', 'apple-mobile-web-app-title', meta.title)
    upsertMeta('name', 'robots', 'index,follow')

    upsertMeta('property', 'og:title', meta.title)
    upsertMeta('property', 'og:description', meta.description)
    upsertMeta('property', 'og:image', meta.og)
    upsertMeta('property', 'og:url', meta.uri)

    upsertMeta('property', 'twitter:title', meta.title)
    upsertMeta('property', 'twitter:description', meta.description)
    upsertMeta('property', 'twitter:image', meta.og)
    upsertMeta('property', 'twitter:card', 'summary_large_image')
  }, [meta.title, meta.description, meta.og, meta.uri, meta.titleColor, meta.themeColor])

  return (
    <>
      {/* Icons and Manifests */}
      <link rel="manifest" href="/manifest.json" />
      <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color={meta.themeColor} />
      <link rel="shortcut icon" type="image/x-icon" href="/favicons/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png" />
      <link rel="icon" type="image/png" sizes="512x512" href="/favicons/favicon-512x512.png" />
      <link rel="icon" type="image/png" sizes="192x192" href="/favicons/android-icon-192x192.png" />
      <link rel="icon" type="image/png" sizes="144x144" href="/favicons/android-icon-144x144.png" />
      <link rel="apple-touch-icon" href="/favicons/apple-icon.png" />
      <link rel="apple-touch-icon" sizes="152x152" href="/favicons/apple-icon-152x152.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-icon-180x180.png" />
      <link rel="apple-touch-icon" sizes="167x167" href="/favicons/apple-icon-167x167.png" />
    </>
  )
}
