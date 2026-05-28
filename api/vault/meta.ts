import type { VercelRequest, VercelResponse } from '@vercel/node'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load HTML at module level (happens once per container cold start)
const indexPath = join(process.cwd(), 'dist', 'index.html')
const baseHtml = readFileSync(indexPath, 'utf-8')

interface VaultData {
  name: string
  symbol: string
  token: {
    name: string
    symbol: string
  }
  apr: {
    netAPR: number
    forwardAPR: {
      netAPR: number
    }
  }
  tvl: {
    tvl: number
  }
  chainID: number
}

function getVaultName(vaultData: VaultData): string {
  const baseName = vaultData.name
  if (baseName.includes(' yVault')) {
    return baseName.replace(' yVault', '')
  }
  return baseName
}

async function fetchVaultData(chainId: string, address: string): Promise<VaultData | null> {
  const baseUri =
    process.env.YDAEMON_BASE_URI || process.env.VITE_YDAEMON_BASE_URI || 'https://vault-api.secured.finance'
  const url = `${baseUri}/${chainId}/vaults/${address}`

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json'
      }
    })

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as VaultData
    return data
  } catch (error) {
    return null
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { chainId, address } = req.query

  if (!chainId || !address || typeof chainId !== 'string' || typeof address !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid chainId or address' })
  }

  try {
    let html = baseHtml

    // Get base URL from request headers
    const protocol = req.headers['x-forwarded-proto'] || 'https'
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'vaults.secured.finance'
    const baseUrl = `${protocol}://${host}`

    // Fetch vault data
    const vaultData = await fetchVaultData(chainId, address)

    // Generate dynamic meta tags
    const ogImageUrl = `${baseUrl}/api/og?chainId=${chainId}&address=${address}`
    const canonicalUrl = `${baseUrl}/${chainId}/${address}`

    let title: string
    let description: string

    if (vaultData) {
      // Dynamic title and description based on vault data
      const vaultName = getVaultName(vaultData)
      const assetName = vaultData.token.name || vaultData.token.symbol

      title = `${vaultName} | SF Yield Vault | Secured Finance`
      description = `${vaultName} is designed to provide access to yield opportunities on ${assetName} through on-chain strategies with a simple deposit experience.`
    } else {
      // Fallback for when vault data can't be fetched
      title = 'SF Yield Vault | Secured Finance'
      description =
        "SF Yield Vault is Secured Finance's on-chain yield strategy product, designed to help users access yield opportunities through vaults with a simple deposit experience."
    }

    // Inject meta tags
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

    // Remove existing meta tags that we're replacing
    html = html.replace(/<title>.*?<\/title>/gi, '')
    html = html.replace(/<meta property="og:.*?".*?>/gi, '')
    html = html.replace(/<meta name="twitter:.*?".*?>/gi, '')
    html = html.replace(/<meta name="description".*?>/gi, '')

    // Inject new meta tags
    html = html.replace('</head>', `${metaTags}\n  </head>`)

    res.setHeader('Content-Type', 'text/html')
    res.setHeader('Vercel-CDN-Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800')
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate')

    return res.status(200).send(html)
  } catch (error) {
    console.error('Error generating meta tags:', error)
    // Fallback to regular SPA with cached HTML
    res.setHeader('Content-Type', 'text/html')
    res.setHeader('Vercel-CDN-Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800')
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate')
    return res.status(200).send(baseHtml)
  }
}
