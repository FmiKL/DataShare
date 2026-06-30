import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AppFooter } from '../components/AppFooter'
import { AppHeader } from '../components/AppHeader'

type AuthLayoutProps = {
  actionLabel: string
  actionTo: string
  children: ReactNode
}

export function AuthLayout({
  actionLabel,
  actionTo,
  children,
}: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      <AppHeader
        action={
          <Link className="app-header__action" to={actionTo}>
            {actionLabel}
          </Link>
        }
      />
      <main className="auth-layout__main">{children}</main>
      <AppFooter />
    </div>
  )
}
