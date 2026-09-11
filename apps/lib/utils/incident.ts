import type { TYDaemonVault } from '@lib/utils/schemas/yDaemonVaultsSchemas'

/**********************************************************************************************
 ** Incident banner configuration, mirroring the Lending app's env-driven incident alert
 ** (NEXT_PUBLIC_INCIDENT_ALERT_MESSAGE/_LINK). Purely a config toggle: setting/clearing the
 ** message env var raises/lowers the banner and the related interface restrictions without a
 ** code change.
 *********************************************************************************************/
export const getIncidentAlertMessage = (): string => import.meta.env.VITE_INCIDENT_ALERT_MESSAGE || ''

export const getIncidentAlertLink = (): string => import.meta.env.VITE_INCIDENT_ALERT_LINK || ''

export const getIncidentAlertLinkLabel = (): string =>
  import.meta.env.VITE_INCIDENT_ALERT_LINK_LABEL || 'our official X account'

export const isIncidentActive = (): boolean => Boolean(getIncidentAlertMessage())

/**********************************************************************************************
 ** yDaemon does not expose a "paused" flag on a vault's strategies, so the affected strategy is
 ** matched by name. This is intentionally per-vault (not a single global switch) so the
 ** restriction self-resolves for a given vault the moment its strategy no longer matches,
 ** without needing a code change.
 *********************************************************************************************/
const getAffectedStrategyName = (): string => import.meta.env.VITE_INCIDENT_AFFECTED_STRATEGY_NAME || 'SF Lending'

export const isVaultAffectedByIncident = (vault: TYDaemonVault | undefined | null): boolean => {
  console.log('isVaultAffectedByIncident', vault, isIncidentActive(), getAffectedStrategyName())
  if (!vault || !isIncidentActive()) {
    return false
  }
  const affectedStrategyName = getAffectedStrategyName().toLowerCase()
  return (vault.strategies ?? []).some((strategy) => strategy.name.toLowerCase().includes(affectedStrategyName))
}
