import type { ReactNode } from 'react'

type AppHeaderProps = {
  action: ReactNode
}

export function AppHeader({ action }: AppHeaderProps) {
  return (
    <header className="app-header">
      <span className="app-header__brand">DataShare</span>
      {action}
    </header>
  )
}
