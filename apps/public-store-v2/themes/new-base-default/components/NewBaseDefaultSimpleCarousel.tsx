import { SimpleCarousel } from '../../../components/shared'

interface CarouselImage {
  publicId: string
  url: string
  order: number
  link: string | null
}

interface NewBaseDefaultSimpleCarouselProps {
  images: CarouselImage[]
}

export function NewBaseDefaultSimpleCarousel({ images }: NewBaseDefaultSimpleCarouselProps) {
  return <SimpleCarousel images={images} />
}