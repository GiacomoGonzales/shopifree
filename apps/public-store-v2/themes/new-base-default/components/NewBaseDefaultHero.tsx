import { HeroSection } from '../../../components/shared'

interface NewBaseDefaultHeroProps {
  storeInfo: any
  storeSubdomain: string
  t: (key: string) => string
  toCloudinarySquare: (url: string, size: number) => string
}

export function NewBaseDefaultHero({ 
  storeInfo, 
  storeSubdomain, 
  t, 
  toCloudinarySquare 
}: NewBaseDefaultHeroProps) {
  // Priorizar nuevo formato de media, fallback a imagen legacy
  const heroMediaUrl = storeInfo?.heroMediaUrl || storeInfo?.heroImageUrl
  const heroMediaType = storeInfo?.heroMediaType || (storeInfo?.heroImageUrl ? 'image' : null)

  const texts = {
    exploreProducts: t('exploreProducts'),
    viewCategories: t('viewCategories')
  }

  return (
    <HeroSection
      storeName={storeInfo?.storeName || storeSubdomain}
      description={storeInfo?.description}
      heroMediaUrl={heroMediaUrl}
      heroMediaType={heroMediaType}
      texts={texts}
      toCloudinarySquare={toCloudinarySquare}
    />
  )
}