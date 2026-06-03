export interface VaultData {
  name: string
  symbol: string
  token: {
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

export async function fetchVaultData(chainId: string, address: string): Promise<VaultData | null> {
  const baseUri =
    process.env.YDAEMON_BASE_URI || process.env.VITE_YDAEMON_BASE_URI || 'https://vault-api.secured.finance'
  const url = `${baseUri}/${chainId}/vaults/${address}`

  try {
    const response = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!response.ok) {
      console.error(`Failed to fetch vault data: ${response.status}`)
      return null
    }
    return (await response.json()) as VaultData
  } catch (error) {
    console.error('Error fetching vault data:', error)
    return null
  }
}
