export default function TextField({ id, label, type = 'text', placeholder, autoComplete, minLength, maxLength, pattern }) {
  return (
    <div className="field-group">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={minLength}
        maxLength={maxLength}
        pattern={pattern}
        required
      />
    </div>
  )
}
