import type { VercelRequest, VercelResponse } from '@vercel/node'
import { readFileSync } from 'fs'
import { join } from 'path'
import { injectVaultMeta } from '../../apps/lib/utils/vaultMetaResponse'

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { chainId, address } = req.query

  if (!chainId || !address || typeof chainId !== 'string' || typeof address !== 'string') {
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
    const html = await injectVaultMeta(baseHtml, { chainId, address, baseUrl })
    return res.status(200).send(html)
  } catch (error) {
    console.error('Error generating meta tags:', error)
    // Fall back to the un-injected shell so the SPA still boots.
    return res.status(200).send(baseHtml)
  }
}
