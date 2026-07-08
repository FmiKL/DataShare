import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type AppHeaderProps = {
  action: ReactNode
}

export function AppHeader({ action }: AppHeaderProps) {
  return (
    <header className="app-header">
      <Link className="app-header__brand" to="/">
        DataShare
      </Link>
      {action}
    </header>
  )
}
