export const blogPosts = [
  {
    id: 1,
    slug: 'velocity-komanda-razrabotki',
    title: 'Как правильно измерять Velocity команды разработки',
    category: 'Agile',
    excerpt: 'Velocity - ключевая метрика в Agile разработке...',
    content: `
# Как правильно измерять Velocity команды разработки

Velocity - это ключевая метрика в Agile разработке, которая показывает...

## Что такое Velocity?

Velocity измеряет количество работы, которую команда может выполнить...

## Как рассчитывать Velocity

1. Определите единицы измерения (story points)
2. Подсчитайте завершенные задачи за спринт
3. Ведите историю за несколько спринтов

## Практические советы

- Не сравнивайте velocity разных команд
- Используйте как инструмент планирования
- Учитывайте изменения в составе команды
    `,
    date: '01.10.2025',
    readTime: '5 мин',
    author: 'Magomed Nalgiev'
  },
  {
    id: 2,
    slug: 'mttr-vosstanovlenie',
    title: 'MTTR: Почему время восстановления критично для бизнеса',
    category: 'DevOps',
    excerpt: 'Mean Time to Recovery влияет на доверие пользователей...',
    content: `
# MTTR: Почему время восстановления критично для бизнеса

Mean Time to Recovery (MTTR) - это критически важная метрика...

## Составляющие MTTR

MTTR включает в себя:
- Время обнаружения проблемы
- Время диагностики
- Время устранения
- Время восстановления сервиса

## Как улучшить MTTR

1. Автоматизация мониторинга
2. Готовые runbook'и
3. Автоматическое восстановление
4. Регулярные disaster recovery drill'ы
    `,
    date: '28.09.2025',
    readTime: '7 мин',
    author: 'Magomed Nalgiev'
  },
  // ... другие статьи
]

export const getBlogPost = (slug) => {
  return blogPosts.find(post => post.slug === slug)
}
