import { useEffect } from 'react'
import { useLocation } from 'react-router'

function getVaultName(name: string): string {
  if (name.includes(' yVault')) {
    return name.replace(' yVault', '')
  }
  return name
}

/**
 * Hook to set vault-specific document title based on fetched vault data
 * This runs client-side to ensure users see the correct vault title
 */
export function useVaultMeta() {
  const location = useLocation()
  const asPath = location.pathname

  useEffect(() => {
    // Only for vault detail pages: /:chainId/:address
    if (asPath.split('/').length !== 3) {
      return
    }

    const [, chainId, address] = asPath.split('/')
    if (!chainId || !address) {
      return
    }

    // Fetch vault data to get the real vault name
    const baseUri = 'https://vault-api.secured.finance'
    const url = `${baseUri}/${chainId}/vaults/${address}`

    fetch(url, {
      headers: { Accept: 'application/json' }
    })
      .then((response) => {
        if (!response.ok) {
          return null
        }
        return response.json()
      })
      .then((vaultData) => {
        if (!vaultData) {
          return
        }

        const vaultName = getVaultName(vaultData.name)
        const newTitle = `${vaultName} | SF Yield Vault | Secured Finance`

        document.title = newTitle
      })
      .catch(() => {
        // Silently fail - keep default title
      })
  }, [asPath])
}
