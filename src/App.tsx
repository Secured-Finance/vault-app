import AppHeader from '@lib/components/Header'
import { Meta } from '@lib/components/Meta'
import { WithFonts } from '@lib/components/WithFonts'
import { IndexedDB } from '@lib/contexts/useIndexedDB'
import { MetaOverrideProvider, useMetaOverride } from '@lib/contexts/useMetaOverride'
import { WithNotifications } from '@lib/contexts/useNotifications'
import { WithNotificationsActions } from '@lib/contexts/useNotificationsActions'
import { WalletContextApp } from '@lib/contexts/useWallet'
import { YearnContextApp } from '@lib/contexts/useYearn'
import { WithMom } from '@lib/contexts/WithMom'
import { useCurrentApp } from '@lib/hooks/useCurrentApp'
import { IconAlertCritical } from '@lib/icons/IconAlertCritical'
import { IconAlertError } from '@lib/icons/IconAlertError'
import { IconCheckmark } from '@lib/icons/IconCheckmark'
import { cl } from '@lib/utils'
import { SUPPORTED_NETWORKS } from '@lib/utils/constants'
import { AppSettingsContextApp } from '@vaults-v2/contexts/useAppSettings'
import type { ReactElement } from 'react'
import { Toaster } from 'react-hot-toast'
import { useLocation } from 'react-router'
import GoogleAnalyticsProvider from './components/GoogleAnalyticsProvider'
import PlausibleProvider from './components/PlausibleProvider'
import { AppRoutes } from './routes'

function WithLayout(): ReactElement {
  const location = useLocation()
  const isAppsPage = location.pathname?.startsWith('/apps')

  if (isAppsPage) {
    return (
      <>
        <div className={cl('mx-auto mb-0 flex z-60 max-w-[1232px] absolute top-0 inset-x-0 px-4 bg-neutral-0')}>
          <AppHeader supportedNetworks={SUPPORTED_NETWORKS} />
        </div>
        <div id={'app'} className={'bg-neutral-0 mb-0 flex min-h-screen justify-center'}>
          <div className={'flex w-full max-w-[1230px] justify-start'}>
            <AppRoutes />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className={cl('mx-auto mb-0 flex z-60 max-w-[1232px] absolute top-0 inset-x-0 px-4')}>
        <AppHeader supportedNetworks={SUPPORTED_NETWORKS} />
      </div>
      <div id={'app'} className={cl('mx-auto mb-0 flex')}>
        <div className={'block size-full min-h-max'}>
          <AppRoutes />
        </div>
      </div>
    </>
  )
}

function AppMeta(): ReactElement {
  const location = useLocation()
  const { manifest } = useCurrentApp()
  const { title: overrideTitle, description: overrideDescription } = useMetaOverride()

  const asPath = location.pathname
  const ogBaseUrl = 'https://og.yearn.fi'

  let ogUrl = manifest.og || 'https://vaults.secured.finance/og.png'
  let pageUri = manifest.uri || 'https://vaults.secured.finance'

  if (asPath.split('/').length === 3) {
    const [, , chainID, address] = asPath.split('/')
    ogUrl = `${ogBaseUrl}/api/og/yearn/vault/${chainID}/${address}`
    pageUri = `https://vaults.secured.finance${asPath}`
  }
  if (asPath.startsWith('/vaults/') && asPath.split('/').length === 4) {
    const [, , chainID, address] = asPath.split('/')
    ogUrl = `${ogBaseUrl}/api/og/yearn/vault/${chainID}/${address}`
    pageUri = `https://vaults.secured.finance${asPath}`
  }

  return (
    <Meta
      title={overrideTitle || manifest.name || 'SF Yield Vault: On-Chain Yield Strategy | Secured Finance'}
      description={
        overrideDescription ||
        manifest.description ||
        "SF Yield Vault is Secured Finance's on-chain yield strategy product, designed to help users access yield opportunities through vaults with a simple deposit experience."
      }
      titleColor={'#ffffff'}
      themeColor={'#000000'}
      og={ogUrl}
      uri={pageUri}
    />
  )
}

function App(): ReactElement {
  return (
    <MetaOverrideProvider>
      <AppMeta />
      <WithFonts>
        <main className={'font-aeonik size-full min-h-screen'}>
          <GoogleAnalyticsProvider>
            <PlausibleProvider domain={'yearn.fi'} enabled={true}>
              <WithMom supportedChains={SUPPORTED_NETWORKS} tokenLists={[]}>
                <AppSettingsContextApp>
                  <YearnContextApp>
                    <WalletContextApp>
                      <IndexedDB>
                        <WithNotifications>
                          <WithNotificationsActions>
                            <WithLayout />
                          </WithNotificationsActions>
                        </WithNotifications>
                      </IndexedDB>
                    </WalletContextApp>
                  </YearnContextApp>
                </AppSettingsContextApp>
              </WithMom>
            </PlausibleProvider>
          </GoogleAnalyticsProvider>
          <Toaster
            toastOptions={{
              duration: 5000,
              className: 'toast',
              error: {
                icon: <IconAlertCritical className={'ml-3'} />,
                style: {
                  backgroundColor: '#C73203',
                  color: 'white'
                }
              },
              success: {
                icon: <IconCheckmark className={'ml-3'} />,
                style: {
                  backgroundColor: '#00796D',
                  color: 'white'
                }
              },
              icon: <IconAlertError className={'ml-3'} />,
              style: {
                backgroundColor: '#0657F9',
                color: 'white'
              }
            }}
            position={'bottom-right'}
          />
        </main>
      </WithFonts>
    </MetaOverrideProvider>
  )
}

export default App
