import { RenderAmount } from '@lib/components/RenderAmount'
import { useYearnTokenPrice } from '@lib/hooks/useYearnTokenPrice'
import { cl } from '@lib/utils'
import type { TYDaemonVault } from '@lib/utils/schemas/yDaemonVaultsSchemas'
import { useVaultUnderlyingBalance } from '@vaults-v3/hooks/useVaultUnderlyingBalance'
import type { ReactElement } from 'react'

export function VaultStakedAmount({ currentVault }: { currentVault: TYDaemonVault }): ReactElement {
  // Fetch underlying token balance using the reusable hook
  const { underlyingBalance, hasBalance } = useVaultUnderlyingBalance(currentVault)

  // Use underlying token price instead of vault token price
  const tokenPrice =
    useYearnTokenPrice({
      address: currentVault.token.address,
      chainID: currentVault.chainID
    }) || 0

  return (
    <div className={'flex flex-col pt-0 text-right'}>
      <p className={`yearn--table-data-section-item-value ${hasBalance ? 'text-neutral-900' : 'text-neutral-400'}`}>
        <RenderAmount
          value={underlyingBalance.normalized * tokenPrice}
          symbol={'USD'}
          decimals={2}
          options={{ shouldCompactValue: true, maximumFractionDigits: 2, minimumFractionDigits: 2 }}
        />
      </p>
      <small className={cl('text-xs text-neutral-900/40 flex flex-row', hasBalance ? 'visible' : 'invisible')}>
        <RenderAmount
          shouldFormatDust
          value={underlyingBalance.normalized}
          symbol={currentVault.token.symbol}
          decimals={currentVault.token.decimals}
          options={{ shouldDisplaySymbol: false, maximumFractionDigits: 2, minimumFractionDigits: 2 }}
        />
        <p className="pl-1">{currentVault.token.symbol}</p>
      </small>
    </div>
  )
}
