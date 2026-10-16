/**********************************************************************************************
 ** Reopening banner configuration, mirroring the incident banner's env-driven toggle (see
 ** incident.ts). Purely a config toggle: setting/clearing the message env var raises/lowers
 ** the banner without a code change.
 *********************************************************************************************/
export const getReopeningAlertMessage = (): string => import.meta.env.VITE_REOPENING_ALERT_MESSAGE || ''

export const getReopeningAlertLink = (): string => import.meta.env.VITE_REOPENING_ALERT_LINK || ''

export const getReopeningAlertLinkLabel = (): string =>
  import.meta.env.VITE_REOPENING_ALERT_LINK_LABEL || 'our official X account'

export const isReopeningActive = (): boolean => Boolean(getReopeningAlertMessage())
