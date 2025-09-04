import { SimpleCarousel } from '../../../components/shared'

interface CarouselImage {
  publicId: string
  url: string
  order: number
}

interface NewBaseDefaultSimpleCarouselProps {
  images: CarouselImage[]
}

export function NewBaseDefaultSimpleCarousel({ images }: NewBaseDefaultSimpleCarouselProps) {
  return <SimpleCarousel images={images} />
}