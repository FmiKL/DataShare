import type { InputHTMLAttributes } from 'react'

type TextFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className'
> & {
  label: string
  name: string
}

export function TextField({
  label,
  name,
  type = 'text',
  ...props
}: TextFieldProps) {
  return (
    <label className="form-field">
      <span className="form-field__label">{label}</span>
      <input
        className="form-field__control"
        name={name}
        type={type}
        {...props}
      />
    </label>
  )
}
