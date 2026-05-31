import { useWallet } from '@lib/contexts/useWallet'
import { useAsyncTrigger } from '@lib/hooks/useAsyncTrigger'
import type { TNormalizedBN } from '@lib/types'
import { decodeAsBigInt, toAddress, toBigInt, toNormalizedBN, zeroNormalizedBN } from '@lib/utils'
import type { TYDaemonVault } from '@lib/utils/schemas/yDaemonVaultsSchemas'
import { retrieveConfig } from '@lib/utils/wagmi'
import { VAULT_V3_ABI } from '@vaults-v2/utils/abi/vaultV3.abi'
import { useEffect, useMemo, useState } from 'react'
import { useBlockNumber } from 'wagmi'
import { readContracts } from 'wagmi/actions'

export type TVaultUnderlyingBalanceResult = {
  underlyingBalance: TNormalizedBN
  hasBalance: boolean
  isLoading: boolean
}

/**
 * Custom hook to fetch and calculate the underlying token balance for a vault position.
 *
 * This hook:
 * - Fetches pricePerShare from the vault contract
 * - Combines vault token balance + staking balance (if available)
 * - Converts vault tokens to underlying tokens using the formula:
 *   underlyingAmount = (vaultTokenBalance × pricePerShare) / 10^decimals
 * - Auto-refreshes on block changes (throttled for Base chain)
 *
 * @param currentVault - The vault object containing address, chainID, and staking info
 * @returns Object with underlyingBalance (TNormalizedBN), hasBalance (boolean), and isLoading (boolean)
 */
export function useVaultUnderlyingBalance(currentVault: TYDaemonVault): TVaultUnderlyingBalanceResult {
  const { getToken } = useWallet()
  const { data: blockNumber } = useBlockNumber({ watch: true })
  const [underlyingBalance, setUnderlyingBalance] = useState<TNormalizedBN>(zeroNormalizedBN)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const hasBalance = useMemo(() => underlyingBalance.raw > 0n, [underlyingBalance.raw])

  /**********************************************************************************************
   ** Fetch pricePerShare and calculate underlying token balance
   **********************************************************************************************/
  const refetch = useAsyncTrigger(async (): Promise<void> => {
    setIsLoading(true)
    try {
      const vaultToken = getToken({ chainID: currentVault.chainID, address: currentVault.address })

      // Get total vault token balance (wallet + staking)
      let totalRawBalance = vaultToken.balance.raw
      if (currentVault.staking.available) {
        const stakingToken = getToken({ chainID: currentVault.chainID, address: currentVault.staking.address })
        totalRawBalance += stakingToken.balance.raw
      }

      // Fetch pricePerShare from vault contract
      const result = await readContracts(retrieveConfig(), {
        contracts: [
          {
            address: toAddress(currentVault.address),
            abi: VAULT_V3_ABI,
            chainId: currentVault.chainID,
            functionName: 'pricePerShare'
          }
        ]
      })

      const pps = decodeAsBigInt(result[0])

      // Convert vault token balance to underlying token balance
      // Formula: underlyingAmount = (vaultTokenBalance × pricePerShare) / 10^decimals
      const underlyingAmount = (totalRawBalance * pps) / toBigInt(10 ** vaultToken.decimals)
      const underlyingNormalized: TNormalizedBN = toNormalizedBN(underlyingAmount, currentVault.token.decimals)

      setUnderlyingBalance(underlyingNormalized)
    } catch (error) {
      console.error('Error fetching underlying balance:', error)
      setUnderlyingBalance(zeroNormalizedBN)
    } finally {
      setIsLoading(false)
    }
  }, [
    currentVault.address,
    currentVault.chainID,
    currentVault.staking.address,
    currentVault.staking.available,
    getToken
  ])

  /**********************************************************************************************
   ** Update balance on block changes (throttled for Base chain to reduce RPC calls)
   **********************************************************************************************/
  useEffect(() => {
    if (currentVault.chainID === 8453) {
      // For Base chain (8453), limit updates to reduce RPC calls and prevent rate limiting
      if (blockNumber && Number(blockNumber) % 10 === 0) {
        refetch()
      }
    } else {
      refetch()
    }
  }, [blockNumber, refetch, currentVault.chainID])

  return {
    underlyingBalance,
    hasBalance,
    isLoading
  }
}
