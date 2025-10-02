import { HeroSection } from '../../../components/shared'

interface NewBaseDefaultHeroProps {
  storeInfo: any
  storeSubdomain: string
  t: (key: string) => string
  toCloudinarySquare: (url: string, size: number) => string
  categoriesCount?: number
  collectionsCount?: number
  brandsCount?: number
}

export function NewBaseDefaultHero({
  storeInfo,
  storeSubdomain,
  t,
  toCloudinarySquare,
  categoriesCount = 0,
  collectionsCount = 0,
  brandsCount = 0
}: NewBaseDefaultHeroProps) {
  // Priorizar nuevo formato de media, fallback a imagen legacy
  const heroMediaUrl = storeInfo?.heroMediaUrl || storeInfo?.heroImageUrl
  const heroMediaType = storeInfo?.heroMediaType || (storeInfo?.heroImageUrl ? 'image' : null)

  const texts = {
    exploreProducts: t('exploreProducts'),
    viewCategories: t('viewCategories'),
    viewCollections: t('viewCollections'),
    viewBrands: t('viewBrands')
  }

  return (
    <HeroSection
      storeName={storeInfo?.storeName || storeSubdomain}
      slogan={storeInfo?.slogan}
      description={storeInfo?.description}
      heroMediaUrl={heroMediaUrl}
      heroMediaType={heroMediaType}
      texts={texts}
      toCloudinarySquare={toCloudinarySquare}
      categoriesCount={categoriesCount}
      collectionsCount={collectionsCount}
      brandsCount={brandsCount}
    />
  )
}