import { Timestamp } from 'firebase/firestore'

export interface ImageJob {
  id: string
  userId: string
  storeId: string
  productId: string
  imageUrl: string
  mediaFileId: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  createdAt: Timestamp
  updatedAt: Timestamp
  enhancedImageUrl?: string
  enhancedPublicId?: string
  error?: string
}

export type ImageJobStatus = ImageJob['status']
