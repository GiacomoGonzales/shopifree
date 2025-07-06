import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getStoreBySubdomain, extractSubdomain } from '@/lib/store'
import { getPageBySlug } from '@/lib/content'

interface PageProps {
  params: {
    storeSubdomain: string
    pageSlug: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { pageSlug } = params
  
  // Extraer subdominio del header de la request
  const subdomain = extractSubdomain(params.storeSubdomain)
  if (!subdomain) {
    notFound()
  }

  // Obtener la tienda
  const store = await getStoreBySubdomain(subdomain)
  if (!store) {
    notFound()
  }

  // Obtener la página
  const page = await getPageBySlug(pageSlug, store.id)
  if (!page) {
    notFound()
  }

  return {
    title: page.seoTitle,
    description: page.seoDescription,
  }
}

export default async function Page({ params }: PageProps) {
  const { pageSlug } = params
  
  // Extraer subdominio del header de la request
  const subdomain = extractSubdomain(params.storeSubdomain)
  if (!subdomain) {
    notFound()
  }

  // Obtener la tienda
  const store = await getStoreBySubdomain(subdomain)
  if (!store) {
    notFound()
  }

  // Obtener la página
  const page = await getPageBySlug(pageSlug, store.id)
  if (!page) {
    notFound()
  }

  // Validar que la página esté publicada y sea visible
  if (page.status !== 'published' || !page.visibility) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">{page.title}</h1>
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  )
} 