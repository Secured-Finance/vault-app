import type { ReactElement, ReactNode } from 'react'
import { createContext, useContext, useMemo, useState } from 'react'

type TMetaOverride = {
  title?: string
  description?: string
}

type TMetaContext = {
  override: TMetaOverride
  setOverride: (override: TMetaOverride) => void
}

const MetaContext = createContext<TMetaContext>({
  override: {},
  setOverride: (): void => undefined
})

/**
 * Holds page-specific meta overrides (e.g. per-vault title/description) so the
 * single <Meta> renderer stays the source of truth for the document head.
 */
export function MetaProvider({ children }: { children: ReactNode }): ReactElement {
  const [override, setOverride] = useState<TMetaOverride>({})
  const value = useMemo((): TMetaContext => ({ override, setOverride }), [override])
  return <MetaContext.Provider value={value}>{children}</MetaContext.Provider>
}

export function useMetaOverride(): TMetaContext {
  return useContext(MetaContext)
}
