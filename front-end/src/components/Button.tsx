import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  children,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const btnClassName = ['button', 'button--primary', className]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={btnClassName} type={type} {...props}>
      {children}
    </button>
  )
}
