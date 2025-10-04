export default function LoadingSpinner({ size = 'medium', text = 'Загрузка...' }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-white/30 border-t-white`}></div>
      {text && <span className="text-white/70 text-sm">{text}</span>}
    </div>
  )
}

export function CalculationLoader() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <div className="w-16 h-16 animate-spin rounded-full border-4 border-green-500/30 border-t-green-500 mx-auto mb-4"></div>
        <p className="text-white/80">Выполняем расчеты...</p>
      </div>
    </div>
  )
}
