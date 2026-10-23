export default function TextField({ id, label, type = 'text', placeholder, autoComplete, ...inputProps }) {
  return (
    <div className="field-group">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        {...inputProps}
        required
      />
    </div>
  )
}
