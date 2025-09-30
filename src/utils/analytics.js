// Инициализация Google Analytics
export const initGA = () => {
  const GA_ID = 'G-BLRPDT85K6' // Замените на ваш ID

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

// Трекинг событий
export const trackEvent = (eventName, parameters = {}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, parameters)
  }
}

// Трекинг калькуляторов
export const trackCalculatorUsage = (calculatorType) => {
  trackEvent('calculator_used', {
    calculator_type: calculatorType
  })
}
