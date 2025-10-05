import { Link } from 'react-router-dom'
import Header from './Header'

export default function BlogPage() {
  const articles = [
    {
      id: 1,
      title: "Как правильно измерять Velocity команды разработки",
      excerpt: "Velocity - ключевая метрика в Agile разработке. Разбираем, как правильно рассчитывать и интерпретировать показатели скорости команды.",
      date: "2025-10-01",
      readTime: "5 мин",
      category: "Agile",
      slug: "velocity-measurement"
    },
    {
      id: 2,
      title: "MTTR: Почему время восстановления критично для бизнеса",
      excerpt: "Mean Time to Recovery влияет на доверие пользователей и доходы компании. Изучаем методы снижения MTTR и лучшие практики.",
      date: "2025-09-28",
      readTime: "7 мин",
      category: "DevOps",
      slug: "mttr-business-impact"
    },
    {
      id: 3,
      title: "CAC vs LTV: Баланс затрат на привлечение и ценности клиента",
      excerpt: "Как соотношение стоимости привлечения клиента к его жизненной ценности влияет на рентабельность бизнеса.",
      date: "2025-09-25",
      readTime: "6 мин",
      category: "Маркетинг",
      slug: "cac-ltv-balance"
    },
    {
      id: 4,
      title: "Внедрение метрик DORA: Руководство для команд",
      excerpt: "Deployment Frequency, Lead Time, MTTR и Change Failure Rate - четыре ключевые метрики для оценки эффективности DevOps.",
      date: "2025-09-22",
      readTime: "10 мин",
      category: "DevOps",
      slug: "dora-metrics-implementation"
    },
    {
      id: 5,
      title: "Финансовые метрики для IT-стартапов: EBITDA, ROS, BEP",
      excerpt: "Какие финансовые показатели важно отслеживать на раннем этапе развития технологического бизнеса.",
      date: "2025-09-20",
      readTime: "8 мин",
      category: "Финансы",
      slug: "financial-metrics-startups"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Заголовок */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6">
              Блог о метриках эффективности
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Экспертные статьи о методах измерения и оптимизации показателей
              для IT-команд, маркетинга и бизнеса
            </p>
          </div>

          {/* Статьи */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/15 transition-all duration-200 group"
              >
                <div className="mb-4">
                  <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                    {article.category}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
                  {article.title}
                </h2>

                <p className="text-white/70 mb-4 line-clamp-3">
                  {article.excerpt}
                </p>

                <div className="flex justify-between items-center text-sm text-white/60">
                  <span>{new Date(article.date).toLocaleDateString('ru-RU')}</span>
                  <span>{article.readTime}</span>
                </div>

                <div className="mt-4">
                  <span className="text-blue-400 text-sm font-medium group-hover:text-blue-300">
                    Читать далее →
                  </span>
                </div>
              </article>
            ))}
          </div>

          {/* CTA секция */}
          <div className="mt-16 text-center bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Применяйте знания на практике
            </h2>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Используйте профессиональные калькуляторы для расчета метрик,
              о которых вы читаете в наших статьях
            </p>
            <Link
              to="/app"
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200"
            >
              Попробовать калькуляторы
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
