import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  author: string
  category: string
  image: string
  tags: string[]
  content: string
  readingTime: string
  published?: boolean
}

const postsDirectory = path.join(process.cwd(), 'content/blog')

export async function getBlogPosts(locale: string): Promise<BlogPost[]> {
  const localeDirectory = path.join(postsDirectory, locale)

  // Check if directory exists
  if (!fs.existsSync(localeDirectory)) {
    return []
  }

  const filenames = fs.readdirSync(localeDirectory)

  const posts = filenames
    .filter(filename => filename.endsWith('.mdx'))
    .map(filename => {
      const filePath = path.join(localeDirectory, filename)
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(fileContents)

      // Only include published posts or all if published field doesn't exist
      if (data.published === false) {
        return null
      }

      return {
        slug: filename.replace('.mdx', ''),
        title: data.title || 'Untitled',
        description: data.description || '',
        date: data.date || new Date().toISOString(),
        author: data.author || 'Shopifree Team',
        category: data.category || 'General',
        image: data.image || '/blog/default.jpg',
        tags: data.tags || [],
        content,
        readingTime: readingTime(content).text,
        published: data.published !== false,
      }
    })
    .filter((post): post is BlogPost => post !== null)

  // Sort by date (newest first)
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getBlogPost(slug: string, locale: string): Promise<BlogPost | null> {
  try {
    const filePath = path.join(postsDirectory, locale, `${slug}.mdx`)

    if (!fs.existsSync(filePath)) {
      return null
    }

    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
      slug,
      title: data.title || 'Untitled',
      description: data.description || '',
      date: data.date || new Date().toISOString(),
      author: data.author || 'Shopifree Team',
      category: data.category || 'General',
      image: data.image || '/blog/default.jpg',
      tags: data.tags || [],
      content,
      readingTime: readingTime(content).text,
      published: data.published !== false,
    }
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error)
    return null
  }
}

