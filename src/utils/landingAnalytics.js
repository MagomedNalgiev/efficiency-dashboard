import { trackEvent } from './analytics'

// Специальные события для лендинга
export const trackLandingEvents = {
  // Просмотры секций
  heroViewed: () => trackEvent('landing_hero_viewed'),
  problemsSectionViewed: () => trackEvent('landing_problems_viewed'),
  calculatorsSectionViewed: () => trackEvent('landing_calculators_viewed'),
  reviewsSectionViewed: () => trackEvent('landing_reviews_viewed'),
  ctaSectionViewed: () => trackEvent('landing_cta_viewed'),

  // Взаимодействия
  getStartedClicked: (userType) => trackEvent('landing_get_started', { user_type: userType }),
  viewPricingClicked: () => trackEvent('landing_view_pricing'),
  calculatorHovered: (calculatorName) => trackEvent('landing_calculator_hover', { calculator: calculatorName }),

  // Конверсионные события
  signupStarted: () => trackEvent('landing_signup_started'),
  signupCompleted: () => trackEvent('landing_signup_completed'),

  // Scroll tracking
  scrollPercentage: (percentage) => trackEvent('landing_scroll', { percentage }),

  // Time on page
  timeOnPage: (seconds) => trackEvent('landing_time_on_page', { seconds })
}

// Отслеживание скролла
export const setupScrollTracking = () => {
  let maxScroll = 0
  let timeOnPage = Date.now()

  const handleScroll = () => {
    const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100)

    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent

      // Отправляем события на ключевых точках
      if (scrollPercent >= 25 && maxScroll < 25) {
        trackLandingEvents.scrollPercentage(25)
      }
      if (scrollPercent >= 50 && maxScroll < 50) {
        trackLandingEvents.scrollPercentage(50)
      }
      if (scrollPercent >= 75 && maxScroll < 75) {
        trackLandingEvents.scrollPercentage(75)
      }
      if (scrollPercent >= 90 && maxScroll < 90) {
        trackLandingEvents.scrollPercentage(90)
      }
    }
  }

  const handleBeforeUnload = () => {
    const timeSpent = Math.round((Date.now() - timeOnPage) / 1000)
    trackLandingEvents.timeOnPage(timeSpent)
  }

  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('beforeunload', handleBeforeUnload)

  return () => {
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
}
