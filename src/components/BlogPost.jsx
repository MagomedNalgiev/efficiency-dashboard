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

      {/* Хлебные крошки */}
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

      {/* Контент статьи */}
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Мета-информация */}
        <div className="mb-8">
          <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded-full mb-4">
            {post.category}
          </span>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">{post.title}</h1>
          <div className="flex items-center text-gray-400 text-sm">
            <span>{post.author}</span>
            <span className="mx-2">•</span>
            <span>{post.date}</span>
            <span className="mx-2">•</span>
            <span>{post.readTime}</span>
          </div>
        </div>

        {/* Содержимое статьи */}
        <div className="prose prose-lg prose-invert max-w-none">
          <div
            className="text-gray-300 leading-relaxed space-y-6"
            dangerouslySetInnerHTML={{
              __html: post.content
                .replace(/\n\n/g, '</p><p class="mb-4">')
                .replace(/^/g, '<p class="mb-4">')
                .replace(/$/g, '</p>')
                .replace(/#{3}\s(.+)/g, '<h3 class="text-xl font-semibold text-white mt-6 mb-3">$1</h3>')
                .replace(/#{2}\s(.+)/g, '<h2 class="text-2xl font-bold text-white mt-8 mb-4">$1</h2>')
                .replace(/#{1}\s(.+)/g, '<h1 class="text-3xl font-bold text-white mt-10 mb-6">$1</h1>')
                .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
                .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
                .replace(/`(.+?)`/g, '<code class="bg-gray-800 text-blue-300 px-2 py-1 rounded text-sm">$1</code>')
                .replace(/^\s*[-\*\+]\s(.+)/gm, '<li class="ml-4 mb-2">$1</li>')
                .replace(/^\s*\d+\.\s(.+)/gm, '<li class="ml-4 mb-2">$1</li>')
            }}
          />
        </div>

        {/* Кнопка "Назад к блогу" и поделиться */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Link
              to="/blog"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              ← Вернуться к блогу
            </Link>

            {/* Дополнительные действия */}
            <div className="flex items-center space-x-4 text-gray-400">
              <span className="text-sm">Поделиться:</span>
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="text-sm hover:text-white transition-colors"
              >
                Скопировать ссылку
              </button>
            </div>
          </div>
        </div>

        {/* Рекомендуемые статьи (опционально) */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-white mb-6">Читайте также</h3>
          <div className="text-center text-gray-400">
            <Link
              to="/blog"
              className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
            >
              Посмотреть все статьи →
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}
