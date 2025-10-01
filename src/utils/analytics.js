// Инициализация Google Analytics
export const initGA = () => {
  const GA_ID = import.meta.env.VITE_GA_TRACKING_ID
  const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === 'true'

  if (!ENABLE_ANALYTICS || !GA_ID) return

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  function gtag() {
    dataLayer.push(arguments)
  }
  gtag('js', new Date())
  gtag('config', GA_ID)

  window.gtag = gtag
}

// Инициализация Yandex Metrika
export const initYM = () => {
  const YM_ID = import.meta.env.VITE_YANDEX_METRIKA_ID
  const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === 'true'

  if (!ENABLE_ANALYTICS || !YM_ID) return

  (function(m,e,t,r,i,k,a){
    m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
  })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

  window.ym(YM_ID, "init", {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true
  })
}

// Универсальное трекинг событий
export const trackEvent = (eventName, parameters = {}) => {
  const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === 'true'
  if (!ENABLE_ANALYTICS) return

  // Google Analytics
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, parameters)
  }

  // Yandex Metrika
  const YM_ID = import.meta.env.VITE_YANDEX_METRIKA_ID
  if (typeof window.ym === 'function' && YM_ID) {
    window.ym(YM_ID, 'reachGoal', eventName, parameters)
  }
}

// Специальные события
export const trackCalculatorUsage = (calculatorType) => {
  trackEvent('calculator_used', {
    calculator_type: calculatorType,
    timestamp: new Date().toISOString()
  })
}

export const trackPageView = (pageName) => {
  trackEvent('page_view', {
    page_name: pageName
  })
}
