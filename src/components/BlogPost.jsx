import { useParams, useNavigate, Link } from 'react-router-dom'
import { getBlogPost } from '../data/blogPosts'
import { useEffect } from 'react'

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
      {/* Хлебные крошки */}
      <div className="bg-gray-800 py-4">
        <div className="max-w-4xl mx-auto px-6">
          <nav className="text-sm text-gray-400">
            <Link to="/app" className="hover:text-white">Главная</Link>
            <span className="mx-2">›</span>
            <Link to="/blog" className="hover:text-white">Блог</Link>
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
          <h1 className="text-4xl font-bold text-white mb-4">{post.title}</h1>
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
            className="text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: post.content.replace(/\n/g, '<br>').replace(/#{1,3}\s(.+)/g, '<h2 class="text-2xl font-bold text-white mt-8 mb-4">$1</h2>')
            }}
          />
        </div>

        {/* Кнопка "Назад к блогу" */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <Link
            to="/blog"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            ← Вернуться к блогу
          </Link>
        </div>
      </article>
    </div>
  )
}
