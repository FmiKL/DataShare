type TextFieldProps = {
  autoComplete: string
  label: string
  name: string
  placeholder: string
  type?: 'email' | 'password' | 'text'
}

export function TextField({
  autoComplete,
  label,
  name,
  placeholder,
  type = 'text',
}: TextFieldProps) {
  return (
    <label className="form-field">
      <span className="form-field__label">{label}</span>
      <input
        autoComplete={autoComplete}
        className="form-field__control"
        name={name}
        placeholder={placeholder}
        type={type}
      />
    </label>
  )
}
