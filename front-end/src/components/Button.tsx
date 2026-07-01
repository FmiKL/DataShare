import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'header' | 'primary'
}

export function Button({
  children,
  className = '',
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  const btnClassName = ['button', `button--${variant}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={btnClassName} type={type} {...props}>
      {children}
    </button>
  )
}
