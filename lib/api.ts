const API_URL = process.env.NEXT_PUBLIC_API_URL

// Helper function to get auth token from cookies
const getAuthToken = () => {
  if (typeof document === "undefined") return null

  const cookies = document.cookie.split(";")
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim()
    if (cookie.startsWith("token=")) {
      return cookie.substring("token=".length, cookie.length)
    }
  }
  return null
}

export const fetchOptions = {
  credentials: "include" as RequestCredentials,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
}

export const api = {
  get: async (endpoint: string) => {
    const token = getAuthToken()
    const headers = token ? { ...fetchOptions.headers, Authorization: `Bearer ${token}` } : fetchOptions.headers

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    })
    return await response.json()
  },

  post: async (endpoint: string, data: any) => {
    const token = getAuthToken()
    const headers = token ? { ...fetchOptions.headers, Authorization: `Bearer ${token}` } : fetchOptions.headers

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
      credentials: fetchOptions.credentials,
    })
    return await response.json()
  },

  put: async (endpoint: string, data: any) => {
    const token = getAuthToken()
    const headers = token ? { ...fetchOptions.headers, Authorization: `Bearer ${token}` } : fetchOptions.headers

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
      credentials: fetchOptions.credentials,
    })
    return await response.json()
  },

  delete: async (endpoint: string) => {
    const token = getAuthToken()
    const headers = token ? { ...fetchOptions.headers, Authorization: `Bearer ${token}` } : fetchOptions.headers

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers,
      credentials: fetchOptions.credentials,
    })
    return await response.json()
  },
}

