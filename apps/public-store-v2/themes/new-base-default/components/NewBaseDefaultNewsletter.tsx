import { NewsletterSection } from '../../../components/shared'

interface NewBaseDefaultNewsletterProps {
  additionalText: (key: string) => string
  t: (key: string) => string
}

export function NewBaseDefaultNewsletter({ additionalText, t }: NewBaseDefaultNewsletterProps) {
  const texts = {
    title: additionalText('newsletterTitle'),
    description: additionalText('newsletterDescription'),
    emailPlaceholder: additionalText('emailPlaceholder'),
    subscribeButton: t('subscribe'),
    subscribedMessage: additionalText('subscribed'),
    privacyNotice: additionalText('privacyNotice')
  }

  return <NewsletterSection texts={texts} />
}