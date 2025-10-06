// Конфигурация для работы с Supabase через REST API
export const SUPABASE_CONFIG = {
  url: 'https://dthvqbcccujkjazonmos.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aHZxYmNjdWpramF6Y29ubW9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NzQxNzcsImV4cCI6MjA3NTM1MDE3N30.Xj9P_FOlIn_b0P2IOWnaSPOZqplHWjAA5xwnzJXi3i4',

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
      'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`
    }

    if (includeContentType) {
      headers['Content-Type'] = 'application/json'
    }

    return headers
  },

  // GET запрос к таблице
  async select(table, options = {}) {
    let url = `${SUPABASE_CONFIG.url}${SUPABASE_CONFIG.endpoints.rest}/${table}`

    if (options.select) {
      url += `?select=${options.select}`
    }

    if (options.eq) {
      const [field, value] = options.eq
      url += url.includes('?') ? '&' : '?'
      url += `${field}=eq.${encodeURIComponent(value)}`
    }

    if (options.single) {
      url += url.includes('?') ? '&' : '?'
      url += 'limit=1'
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(false)
    })

    if (!response.ok) {
      throw new Error(`Supabase select error: ${response.status}`)
    }

    const data = await response.json()
    return options.single ? data[0] : data
  },

  // INSERT запрос
  async insert(table, data) {
    const url = `${SUPABASE_CONFIG.url}${SUPABASE_CONFIG.endpoints.rest}/${table}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || `Supabase insert error: ${response.status}`)
    }

    const result = await response.json()
    return Array.isArray(result) ? result[0] : result
  },

  // UPDATE запрос
  async update(table, id, data) {
    const url = `${SUPABASE_CONFIG.url}${SUPABASE_CONFIG.endpoints.rest}/${table}?id=eq.${id}`

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        ...this.getHeaders(),
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`Supabase update error: ${response.status}`)
    }

    const result = await response.json()
    return Array.isArray(result) ? result[0] : result
  }
}
