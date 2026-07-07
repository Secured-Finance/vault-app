import { buildVaultDescription, buildVaultTitle, SITE_DESCRIPTION, SITE_TITLE } from './seo'

const DEFAULT_YDAEMON_BASE_URI = 'https://vault-api.secured.finance'

async function fetchVaultSymbol(ydaemonBaseUri: string, chainId: string, address: string): Promise<string | null> {
  try {
    const response = await fetch(`${ydaemonBaseUri}/${chainId}/vaults/${address}`, {
      headers: { Accept: 'application/json' }
    })
    if (!response.ok) {
      console.error(`Failed to fetch vault data: ${response.status}`)
      return null
    }
    const data = (await response.json()) as { token?: { symbol?: string } }
    return data?.token?.symbol || null
  } catch (error) {
    console.error('Error fetching vault data:', error)
    return null
  }
}

type TInjectVaultMetaArgs = {
  chainId: string
  address: string
  /** Absolute origin used to build canonical/OG URLs, e.g. https://vaults.secured.finance */
  baseUrl: string
  ydaemonBaseUri?: string
}

/**
 * Replace the base index.html head tags with per-vault SEO/OG/Twitter meta.
 * Shared by the Vercel crawler function (api/vault/meta.ts) and the Vite dev
 * middleware (vite.config.ts) so server responses never drift between the two.
 */
export async function injectVaultMeta(html: string, args: TInjectVaultMetaArgs): Promise<string> {
  const { chainId, address, baseUrl } = args
  const ydaemonBaseUri = args.ydaemonBaseUri || DEFAULT_YDAEMON_BASE_URI

  const ogImageUrl = `${baseUrl}/api/og?chainId=${chainId}&address=${address}`
  const canonicalUrl = `${baseUrl}/${chainId}/${address}`

  const symbol = await fetchVaultSymbol(ydaemonBaseUri, chainId, address)
  const title = symbol ? buildVaultTitle(symbol) : SITE_TITLE
  const description = symbol ? buildVaultDescription(symbol) : SITE_DESCRIPTION

  const metaTags = `
    <title>${title}</title>
    <meta name="description" content="${description}" />

    <!-- Open Graph -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:type" content="website" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${ogImageUrl}" />

    <!-- Additional SEO -->
    <link rel="canonical" href="${canonicalUrl}" />
  `

  return html
    .replace(/<title>.*?<\/title>/gi, '')
    .replace(/<meta property="og:.*?".*?>/gi, '')
    .replace(/<meta name="twitter:.*?".*?>/gi, '')
    .replace(/<meta name="description".*?>/gi, '')
    .replace('</head>', `${metaTags}\n  </head>`)
}
