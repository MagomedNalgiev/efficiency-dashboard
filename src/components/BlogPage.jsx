import { Link } from 'react-router-dom'
import Header from './Header'
import { blogPosts } from '../data/blogPosts'

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Добавляем существующий Header */}
      <Header />

      {/* Заголовок */}
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold text-white mb-4">
          Блог о метриках эффективности
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Экспертные статьи о методах измерения и оптимизации показателей для IT-команд, маркетинга и бизнеса
        </p>
      </div>

      {/* Список статей */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map(post => (
            <article key={post.id} className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors">
              <div className="p-6">
                <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded-full mb-4">
                  {post.category}
                </span>
                <h2 className="text-xl font-bold text-white mb-3">
                  <Link to={`/blog/${post.slug}`} className="hover:text-blue-400">
                    {post.title}
                  </Link>
                </h2>
                <p className="text-gray-300 mb-4 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>
                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-flex items-center mt-4 text-blue-400 hover:text-blue-300"
                >
                  Читать далее →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
