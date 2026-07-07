import type { VercelRequest, VercelResponse } from '@vercel/node'
import { readFileSync } from 'fs'
import { join } from 'path'
import { injectVaultMeta } from '../../apps/lib/utils/vaultMetaResponse'

// Load HTML at module level (happens once per container cold start)
const indexPath = join(process.cwd(), 'dist', 'index.html')
const baseHtml = readFileSync(indexPath, 'utf-8')

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { chainId, address } = req.query

  if (!chainId || !address || typeof chainId !== 'string' || typeof address !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid chainId or address' })
  }

  try {
    // Get base URL from request headers
    const protocol = req.headers['x-forwarded-proto'] || 'https'
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'vaults.secured.finance'
    const baseUrl = `${protocol}://${host}`

    const html = await injectVaultMeta(baseHtml, { chainId, address, baseUrl })

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
