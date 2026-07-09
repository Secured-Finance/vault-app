import type { VercelRequest, VercelResponse } from '@vercel/node'
import { readFileSync } from 'fs'
import { join } from 'path'

// NOTE: This function is bundled by Vercel in isolation from the Vite app, so it
// cannot import from apps/lib (doing so crashes the lambda at load with
// ERR_MODULE_NOT_FOUND). The SEO strings below intentionally mirror
// apps/lib/utils/seo.ts (the client source of truth) and must be kept in sync.
const SITE_TITLE = 'SF Yield Vault: On-Chain Yield Strategy | Secured Finance'
const SITE_DESCRIPTION =
  "SF Yield Vault is Secured Finance's on-chain yield strategy product, designed to help users access yield opportunities through vaults with a simple deposit experience."

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildVaultTitle(symbol: string): string {
  return `${symbol} Vault | SF Yield Vault | Secured Finance`
}

function buildVaultDescription(symbol: string): string {
  return `${symbol} Vault is designed to provide access to yield opportunities on ${symbol} through on-chain strategies with a simple deposit experience.`
}

// Minimal shell used only if the built index.html can't be located at runtime,
// so the function still returns valid HTML with the correct meta tags instead
// of crashing with FUNCTION_INVOCATION_FAILED.
const FALLBACK_HTML = '<!DOCTYPE html><html lang="en"><head></head><body><div id="root"></div></body></html>'

let cachedHtml: string | null = null

// Lazily read (and cache) the built index.html. Done inside the handler rather
// than at module load so a missing file degrades gracefully instead of taking
// down the whole function at cold start.
function getBaseHtml(): string {
  if (cachedHtml !== null) {
    return cachedHtml
  }
  for (const candidate of [join(process.cwd(), 'dist', 'index.html'), join(process.cwd(), 'index.html')]) {
    try {
      cachedHtml = readFileSync(candidate, 'utf-8')
      return cachedHtml
    } catch {
      // Try the next candidate path.
    }
  }
  console.error('Could not locate index.html; falling back to minimal shell')
  cachedHtml = FALLBACK_HTML
  return cachedHtml
}

const CHAIN_ID_PATTERN = /^[0-9]{1,10}$/
const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/

async function fetchVaultSymbol(chainId: string, address: string): Promise<string | null> {
  if (!CHAIN_ID_PATTERN.test(chainId) || !ADDRESS_PATTERN.test(address)) {
    return null
  }

  const baseUri =
    process.env.YDAEMON_BASE_URI || process.env.VITE_YDAEMON_BASE_URI || 'https://vault-api.secured.finance'

  try {
    const response = await fetch(`${baseUri}/${chainId}/vaults/${address}`, {
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

function injectMeta(
  html: string,
  title: string,
  description: string,
  ogImageUrl: string,
  canonicalUrl: string
): string {
  const safeTitle = escapeHtml(title)
  const safeDescription = escapeHtml(description)
  const safeOgImageUrl = escapeHtml(ogImageUrl)
  const safeCanonicalUrl = escapeHtml(canonicalUrl)

  const metaTags = `
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}" />

    <!-- Open Graph -->
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:image" content="${safeOgImageUrl}" />
    <meta property="og:url" content="${safeCanonicalUrl}" />
    <meta property="og:type" content="website" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${safeOgImageUrl}" />

    <!-- Additional SEO -->
    <link rel="canonical" href="${safeCanonicalUrl}" />
  `

  return html
    .replace(/<title>.*?<\/title>/gi, '')
    .replace(/<meta property="og:.*?".*?>/gi, '')
    .replace(/<meta name="twitter:.*?".*?>/gi, '')
    .replace(/<meta name="description".*?>/gi, '')
    .replace('</head>', `${metaTags}\n  </head>`)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { chainId, address } = req.query

  if (
    !chainId ||
    !address ||
    typeof chainId !== 'string' ||
    typeof address !== 'string' ||
    !CHAIN_ID_PATTERN.test(chainId) ||
    !ADDRESS_PATTERN.test(address)
  ) {
    return res.status(400).json({ error: 'Missing or invalid chainId or address' })
  }

  const protocol = req.headers['x-forwarded-proto'] || 'https'
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'vaults.secured.finance'
  const baseUrl = `${protocol}://${host}`

  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Vercel-CDN-Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800')
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate')

  const baseHtml = getBaseHtml()
  try {
    const ogImageUrl = `${baseUrl}/api/og?chainId=${chainId}&address=${address}`
    const canonicalUrl = `${baseUrl}/${chainId}/${address}`

    const symbol = await fetchVaultSymbol(chainId, address)
    const title = symbol ? buildVaultTitle(symbol) : SITE_TITLE
    const description = symbol ? buildVaultDescription(symbol) : SITE_DESCRIPTION

    const html = injectMeta(baseHtml, title, description, ogImageUrl, canonicalUrl)
    return res.status(200).send(html)
  } catch (error) {
    console.error('Error generating meta tags:', error)
    // Fall back to the un-injected shell so the SPA still boots.
    return res.status(200).send(baseHtml)
  }
}
