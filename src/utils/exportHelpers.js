import { trackEvent } from '@utils/analytics'

// Экспорт данных в CSV
export const exportToCSV = (data, filename, headers = []) => {
  try {
    let csvContent = ""

    // Добавляем заголовки если они есть
    if (headers.length > 0) {
      csvContent += headers.join(',') + '\n'
    }

    // Добавляем данные
    if (Array.isArray(data)) {
      data.forEach(row => {
        if (typeof row === 'object') {
          csvContent += Object.values(row).join(',') + '\n'
        } else {
          csvContent += row + '\n'
        }
      })
    } else {
      csvContent += JSON.stringify(data)
    }

    // Создаем и скачиваем файл
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0,10)}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    trackEvent('data_exported', {
      format: 'csv',
      filename: filename,
      rows_count: Array.isArray(data) ? data.length : 1
    })

    return true
  } catch (error) {
    console.error('Ошибка экспорта CSV:', error)
    return false
  }
}

// Экспорт всех данных проекта
export const exportAllData = () => {
  try {
    const allData = {}

    // Собираем все данные из localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('metricspace_')) {
        try {
          allData[key] = JSON.parse(localStorage.getItem(key))
        } catch {
          allData[key] = localStorage.getItem(key)
        }
      }
    }

    const jsonString = JSON.stringify(allData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const link = document.createElement('a')

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `metricspace_backup_${new Date().toISOString().slice(0,10)}.json`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    trackEvent('full_backup_exported', {
      calculators_count: Object.keys(allData).length
    })

    return true
  } catch (error) {
    console.error('Ошибка экспорта всех данных:', error)
    return false
  }
}
