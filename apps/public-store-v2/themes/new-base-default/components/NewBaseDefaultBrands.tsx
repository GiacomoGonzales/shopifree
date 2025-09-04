import { BrandsCarousel } from '../../../components/shared'

interface NewBaseDefaultBrandsProps {
  brands: any[]
  isMobile: boolean
  additionalText: (key: string) => string
  buildUrl: (path: string) => string
  toCloudinarySquare: (url: string, size: number) => string
}

export function NewBaseDefaultBrands({
  brands,
  isMobile,
  additionalText,
  buildUrl,
  toCloudinarySquare
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
    />
  )
}