import { useParams, useNavigate, Link } from 'react-router-dom'
import { getBlogPost } from '../data/blogPosts'
import { useEffect } from 'react'
import Header from './Header'

export default function BlogPost() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const post = getBlogPost(slug)

  useEffect(() => {
    if (!post) {
      navigate('/blog', { replace: true })
    }
  }, [post, navigate])

  if (!post) return null

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <Header />

      {/* Breadcrumbs */}
      <div className="bg-gray-800 py-4">
        <div className="max-w-4xl mx-auto px-6">
          <nav className="text-sm text-gray-400">
            <Link to="/" className="hover:text-white transition-colors">Главная</Link>
            <span className="mx-2">›</span>
            <Link to="/blog" className="hover:text-white transition-colors">Блог</Link>
            <span className="mx-2">›</span>
            <span className="text-white">{post.title}</span>
          </nav>
        </div>
      </div>

      {/* Article header */}
      <div className="max-w-4xl mx-auto px-6 pt-12">
        <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded-full mb-4">
          {post.category}
        </span>
        <h1 className="text-4xl font-bold text-white mb-4 leading-tight">{post.title}</h1>
        <div className="flex items-center text-gray-400 text-sm mb-8">
          <span>{post.author}</span>
          <span className="mx-2">•</span>
          <span>{post.date}</span>
          <span className="mx-2">•</span>
          <span>{post.readTime}</span>
        </div>
      </div>

      {/* Article content */}
      <article className="prose prose-lg prose-invert max-w-4xl mx-auto px-6 pb-16">
        <div
          className="text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: post.content
              .replace(/^###\s(.+)/gm, '<h3 class="text-xl font-semibold text-white mt-8 mb-4">$1</h3>')
              .replace(/^##\s(.+)/gm, '<h2 class="text-2xl font-bold text-white mt-10 mb-6">$1</h2>')
              .replace(/^#\s(.+)/gm, '')
              .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.+?)\*/g, '<em>$1</em>')
              .replace(/`(.+?)`/g, '<code>$1</code>')
              .replace(/\n\n/g, '</p><p>')
              .replace(/^\s*-\s(.+)/gm, '<li>$1</li>')
          }}
        />
      </article>

      {/* Back link */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <Link
          to="/blog"
          className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
        >
          ← Вернуться к блогу
        </Link>
      </div>
    </div>
  )
}
