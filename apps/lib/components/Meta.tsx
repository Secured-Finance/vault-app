import { useMetaOverride } from '@lib/contexts/useMeta'
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

/**
 * Update the head tag that already exists in index.html (or the server-injected
 * per-vault response) instead of letting React hoist a second one. `attribute`
 * must match how the tag is authored in index.html (og:* uses `property`,
 * everything else uses `name`).
 */
function upsertMeta(attribute: 'name' | 'property', key: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

export function Meta(props: TMeta): ReactElement {
  const { override } = useMetaOverride()
  // Page-specific overrides (e.g. per-vault) win over the site-wide defaults.
  const title = override.title || props.title
  const description = override.description || props.description
  const { og, uri } = props

  // Sync the title/description/OG/Twitter tags imperatively so client-side
  // navigation mutates the single set already present in the document instead
  // of appending duplicates (React would otherwise hoist a second copy).
  useEffect(() => {
    document.title = title
    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:image', og)
    upsertMeta('property', 'og:url', uri)
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', og)
  }, [title, description, og, uri])

  return (
    <>
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="msapplication-TileColor" content={props.titleColor} />
      <meta name="application-name" content={title} />
      <meta name="apple-mobile-web-app-title" content={title} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="msapplication-config" content="/favicons/browserconfig.xml" />
      <meta name="msapplication-tap-highlight" content="no" />
      <meta name="googlebot" content="index,nofollow" />

      {/* Icons and Manifests */}
      <link rel="manifest" href="/manifest.json" />
      <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color={props.themeColor} />
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
