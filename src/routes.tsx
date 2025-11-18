import type { ReactElement } from 'react'
import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'

// Lazy load all page components
const V3Page = lazy(() => import('../pages/v3/index'))
const V3DetailPage = lazy(() => import('../pages/v3/[chainID]/[address]'))

// Loading component
const PageLoader = (): ReactElement => (
  <div className={'relative flex min-h-dvh flex-col px-4 text-center'}>
    <div className={'mt-[20%] flex h-10 items-center justify-center'}>
      <span className={'loader'} />
    </div>
  </div>
)

// External redirect component
const ExternalRedirect = ({ to }: { to: string }): ReactElement => {
  window.location.href = to
  return <PageLoader />
}

// Route configuration for reference
export const routeConfig = {
  index: '/',
  detail: '/:chainID/:address',
  chainOnly: '/:chainID',
  external: {
    twitter: '/twitter',
    medium: '/medium',
    github: '/github'
  }
}

// Main routes component
export function AppRoutes(): ReactElement {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* V3 routes */}
        <Route path="" element={<V3Page />} />
        {/* <Route path="/about" element={<V3AboutPage />} /> */}
        <Route path="/:chainID/:address" element={<V3DetailPage />} />
        {/* Redirect /:chainId without address to  */}
        <Route path="/:chainID" element={<Navigate to="/" replace />} />

        {/* External redirects */}
        <Route path="/twitter" element={<ExternalRedirect to="https://x.com/Secured_Fi" />} />
        <Route path="/medium" element={<ExternalRedirect to="https://medium.com/secured-finance" />} />
        <Route path="/github" element={<ExternalRedirect to="https://github.com/Secured-Finance/vault-app" />} />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
