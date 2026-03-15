const API_BASE = import.meta.env.VITE_API_BASE ?? ''

async function fetchJson(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
  })

  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    const error = new Error(payload.message || 'Network error')
    error.status = res.status
    error.payload = payload
    throw error
  }

  return payload
}

export const signup = (formData) => fetchJson('/api/signup', { method: 'POST', body: formData })
export const login = (email, password) =>
  fetchJson("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      email,
      password
    })
  })
export const logout = () => fetchJson('/api/logout', { method: 'POST' })
export const getCurrentUser = () => fetchJson('/api/user', { method: 'GET' })

export const updateProfile = (formData) =>
  fetchJson('/api/update_profile', { method: 'POST', body: formData })

export const getPredictionHistory = () =>
  fetchJson('/api/history', { method: 'GET' })

export const predictDisease = (formData) =>
  fetchJson('/api/predict', { method: 'POST', body: formData })



export const generateReport = (payload) =>

  fetchJson("/api/generate-report/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
    credentials: "include"
  })

