import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import Image from 'next/image'
import Link from 'next/link'

// Custom components for MDX
const components = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-4xl font-bold mt-8 mb-4 text-gray-900" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-3xl font-bold mt-8 mb-4 text-gray-900" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-2xl font-semibold mt-6 mb-3 text-gray-900" {...props} />
  ),
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className="text-xl font-semibold mt-4 mb-2 text-gray-900" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-gray-700 leading-relaxed mb-4" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <Link
      href={props.href || '#'}
      className="text-primary-600 hover:text-primary-700 underline"
      {...props}
    />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700" {...props} />
  ),
  li: (props: React.LiHTMLAttributes<HTMLLIElement>) => (
    <li className="ml-4" {...props} />
  ),
  blockquote: (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-primary-500 pl-4 py-2 mb-4 italic text-gray-700 bg-gray-50"
      {...props}
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => {
    const isInline = !props.className
    if (isInline) {
      return (
        <code
          className="bg-gray-100 text-primary-600 px-1.5 py-0.5 rounded text-sm font-mono"
          {...props}
        />
      )
    }
    return (
      <code
        className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 text-sm font-mono"
        {...props}
      />
    )
  },
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4" {...props} />
  ),
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <Image
      src={props.src || ''}
      alt={props.alt || ''}
      width={800}
      height={400}
      className="rounded-lg my-6 w-full h-auto"
    />
  ),
  hr: () => <hr className="my-8 border-gray-300" />,
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto mb-4">
      <table className="min-w-full divide-y divide-gray-200" {...props} />
    </div>
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th className="px-4 py-2 bg-gray-50 text-left text-sm font-semibold text-gray-900" {...props} />
  ),
  td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td className="px-4 py-2 text-sm text-gray-700 border-t" {...props} />
  ),
}

interface MDXContentProps {
  content: string
}

export default async function MDXContent({ content }: MDXContentProps) {
  return (
    <div className="prose prose-lg max-w-none">
      <MDXRemote
        source={content}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeSlug,
              [rehypeAutolinkHeadings, { behavior: 'wrap' }]
            ],
          },
        }}
      />
    </div>
  )
}
