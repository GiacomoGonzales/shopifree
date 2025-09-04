
interface NewsletterSectionProps {
  texts: {
    title: string
    description: string
    emailPlaceholder: string
    subscribeButton: string
    subscribedMessage: string
    privacyNotice: string
  }
}

export function NewsletterSection({ texts }: NewsletterSectionProps) {

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    
    if (email) {
      // Mantener la lógica DOM original para compatibilidad con estilos
      const button = form.querySelector('.nbd-newsletter-submit') as HTMLButtonElement
      const originalText = button.innerHTML
      button.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>${texts.subscribedMessage}</span>
      `
      button.disabled = true
      button.style.background = 'var(--nbd-success)'
      
      setTimeout(() => {
        button.innerHTML = originalText
        button.disabled = false
        button.style.background = ''
        form.reset()
      }, 3000)
    }
  }

  return (
    <section className="nbd-newsletter">
      <div className="nbd-container">
        <div className="nbd-newsletter-content">
          <div className="nbd-newsletter-text">
            <div className="nbd-newsletter-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="nbd-newsletter-title">
              {texts.title}
            </h2>
            <p className="nbd-newsletter-description">
              {texts.description}
            </p>
          </div>
          
          <div className="nbd-newsletter-form-wrapper">
            <form className="nbd-newsletter-form" onSubmit={handleSubmit}>
              <div className="nbd-newsletter-input-group">
                <input
                  type="email"
                  name="email"
                  placeholder={texts.emailPlaceholder}
                  className="nbd-newsletter-input"
                  autoComplete="email"
                  required
                />
                <button type="submit" className="nbd-newsletter-submit">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{texts.subscribeButton}</span>
                </button>
              </div>
              <p className="nbd-newsletter-privacy">
                {texts.privacyNotice}
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}