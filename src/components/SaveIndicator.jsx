import { useState, useEffect } from 'react'

export default function SaveIndicator({ lastSaved, isModified }) {
  const [showSaved, setShowSaved] = useState(false)

  useEffect(() => {
    if (lastSaved && !isModified) {
      setShowSaved(true)
      const timer = setTimeout(() => setShowSaved(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [lastSaved, isModified])

  if (!lastSaved) return null

  return (
    <div className="flex items-center justify-between mt-4 p-3 rounded-lg bg-white/5">
      <div className="flex items-center space-x-2 text-sm text-white/70">
        {isModified ? (
          <>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span>Несохраненные изменения...</span>
          </>
        ) : showSaved ? (
          <>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-400">Сохранено!</span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Последнее сохранение: {new Date(lastSaved).toLocaleTimeString()}</span>
          </>
        )}
      </div>

      {isModified && (
        <button
          onClick={() => window.location.reload()}
          className="text-xs text-white/50 hover:text-white/70 underline"
        >
          Сбросить изменения
        </button>
      )}
    </div>
  )
}
