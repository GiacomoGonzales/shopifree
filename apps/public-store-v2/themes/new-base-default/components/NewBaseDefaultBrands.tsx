import { BrandsCarousel } from '../../../components/shared'

interface NewBaseDefaultBrandsProps {
  brands: any[]
  isMobile: boolean
  additionalText: (key: string) => string
  buildUrl: (path: string) => string
  toCloudinarySquare: (url: string, size: number) => string
  onBrandHover?: (brandSlug: string) => void
}

export function NewBaseDefaultBrands({
  brands,
  isMobile,
  additionalText,
  buildUrl,
  toCloudinarySquare,
  onBrandHover
}: NewBaseDefaultBrandsProps) {
  const texts = {
    brandsTitle: additionalText('ourBrands'),
    brandSubtitle: additionalText('brandSubtitle')
  }

  return (
    <BrandsCarousel
      brands={brands}
      isMobile={isMobile}
      texts={texts}
      buildUrl={buildUrl}
      toCloudinarySquare={toCloudinarySquare}
      onBrandHover={onBrandHover}
    />
  )
}