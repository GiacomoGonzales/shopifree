import { BlogPost } from './blog'

export function getCategories(posts: BlogPost[]): string[] {
  const categories = new Set(posts.map(post => post.category))
  return Array.from(categories).sort()
}

export function filterPostsByCategory(posts: BlogPost[], category: string): BlogPost[] {
  if (!category) return posts
  return posts.filter(post => post.category.toLowerCase() === category.toLowerCase())
}

export function searchPosts(posts: BlogPost[], query: string): BlogPost[] {
  if (!query) return posts
  const lowerQuery = query.toLowerCase()
  return posts.filter(post =>
    post.title.toLowerCase().includes(lowerQuery) ||
    post.description.toLowerCase().includes(lowerQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}
