// Конфигурация для работы с Supabase через REST API
export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://dthvqbcccujkjazonmos.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aHZxYmNjdWpramF6Y29ubW9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NzQxNzcsImV4cCI6MjA3NTM1MDE3N30.Xj9P_FOlIn_b0P2IOWnaSPOZqplHWjAA5xwnzJXi3i4',

  // API endpoints
  endpoints: {
    rest: '/rest/v1',
    auth: '/auth/v1',
    storage: '/storage/v1'
  }
}

// Вспомогательные функции для работы с API
export const supabaseApi = {
  // Базовые заголовки для всех запросов
  getHeaders(includeContentType = true) {
    const headers = {
      'apikey': SUPABASE_CONFIG.anonKey,
      'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
      'Accept': 'application/json'
    }

    if (includeContentType) {
      headers['Content-Type'] = 'application/json'
    }

    return headers
  },

  // GET запрос к таблице
  async select(table, options = {}) {
    let url = `${SUPABASE_CONFIG.url}${SUPABASE_CONFIG.endpoints.rest}/${table}`

    // Добавляем параметры
    const params = []

    if (options.select) {
      params.push(`select=${options.select}`)
    }

    if (options.eq) {
      const [field, value] = options.eq
      params.push(`${field}=eq.${encodeURIComponent(value)}`)
    }

    if (options.single) {
      params.push('limit=1')
    }

    if (params.length > 0) {
      url += '?' + params.join('&')
    }

    console.log('Supabase SELECT URL:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(false)
    })

    console.log('Supabase SELECT Response:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Supabase select error:', errorText)
      throw new Error(`Supabase select error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Supabase SELECT Data:', data)

    return options.single ? data[0] : data
  },

  // INSERT запрос
  async insert(table, data) {
    const url = `${SUPABASE_CONFIG.url}${SUPABASE_CONFIG.endpoints.rest}/${table}`

    console.log('Supabase INSERT URL:', url)
    console.log('Supabase INSERT Data:', data)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    })

    console.log('Supabase INSERT Response:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Supabase insert error:', errorText)

      let errorMessage = `Supabase insert error: ${response.status}`
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.message || errorJson.hint || errorMessage
      } catch (e) {
        errorMessage += ` - ${errorText}`
      }

      throw new Error(errorMessage)
    }

    const result = await response.json()
    console.log('Supabase INSERT Result:', result)

    return Array.isArray(result) ? result[0] : result
  },

  // UPDATE запрос
  async update(table, id, data) {
    const url = `${SUPABASE_CONFIG.url}${SUPABASE_CONFIG.endpoints.rest}/${table}?id=eq.${id}`

    console.log('Supabase UPDATE URL:', url)
    console.log('Supabase UPDATE Data:', data)

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        ...this.getHeaders(),
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    })

    console.log('Supabase UPDATE Response:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Supabase update error:', errorText)
      throw new Error(`Supabase update error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log('Supabase UPDATE Result:', result)

    return Array.isArray(result) ? result[0] : result
  }
}
