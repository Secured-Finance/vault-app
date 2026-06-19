import type { ReactElement, ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

type TMetaOverride = {
  title?: string
  description?: string
}

type TMetaOverrideContext = {
  override: TMetaOverride
  setOverride: (v: TMetaOverride) => void
}

const MetaOverrideContext = createContext<TMetaOverrideContext>({
  override: {},
  setOverride: () => undefined
})

export function MetaOverrideProvider({ children }: { children: ReactNode }): ReactElement {
  const [override, setOverride] = useState<TMetaOverride>({})
  return <MetaOverrideContext.Provider value={{ override, setOverride }}>{children}</MetaOverrideContext.Provider>
}

export function useMetaOverride(): TMetaOverride {
  return useContext(MetaOverrideContext).override
}

export function useSetMetaOverride(title?: string, description?: string): void {
  const { setOverride } = useContext(MetaOverrideContext)
  useEffect(() => {
    if (title || description) {
      setOverride({ title, description })
    }
    return () => setOverride({})
  }, [title, description, setOverride])
}
