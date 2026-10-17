import '../login.css'

export default function AuthLayout({ title, description, children, footer }) {
  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="auth-title">
        <div className="brand" aria-label="더존">
          <span className="brand-mark" aria-hidden="true">▶</span>
          <span className="brand-name">더존</span>
        </div>

        <header className="login-heading">
          <h1 id="auth-title">{title}</h1>
          <p className="login-description">{description}</p>
        </header>

        {children}

        {footer && <div className="signup-prompt">{footer}</div>}
        <p className="login-note">짧게 보고, 깊게 배우다.</p>
      </section>
    </main>
  )
}
