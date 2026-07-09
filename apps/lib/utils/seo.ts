/**
 * Centralized SEO strings for the SF Yield Vault app.
 * Used by both the client (SPA meta tags) and the server-side crawler
 * response (api/vault/meta.ts) so titles/descriptions never diverge.
 */

export const SITE_TITLE = 'SF Yield Vault: On-Chain Yield Strategy | Secured Finance'

export const SITE_DESCRIPTION =
  "SF Yield Vault is Secured Finance's on-chain yield strategy product, designed to help users access yield opportunities through vaults with a simple deposit experience."

/** Title for an individual vault page, e.g. "JPYC Vault | SF Yield Vault | Secured Finance". */
export function buildVaultTitle(symbol: string): string {
  return `${symbol} Vault | SF Yield Vault | Secured Finance`
}

/** Meta description for an individual vault page. */
export function buildVaultDescription(symbol: string): string {
  return `${symbol} Vault is designed to provide access to yield opportunities on ${symbol} through on-chain strategies with a simple deposit experience.`
}
