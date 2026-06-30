import { useId, type ReactNode } from 'react'

type PanelProps = {
  children: ReactNode
  title: string
}

export function Panel({ children, title }: PanelProps) {
  const titleId = useId()

  return (
    <section className="panel" aria-labelledby={titleId}>
      <h1 className="panel__title" id={titleId}>
        {title}
      </h1>
      {children}
    </section>
  )
}
