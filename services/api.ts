const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://drop-pick-production.up.railway.app"

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("company")
      window.location.href = "/login"
      throw new ApiError(401, "Unauthorized")
    }

    const error = await response.json().catch(() => ({ message: "An error occurred" }))
    throw new ApiError(response.status, error.message || "An error occurred")
  }

  const text = await response.text()
  if (!text) return {} as T
  return JSON.parse(text)
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  return headers
}

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: getHeaders(),
    })
    return handleResponse<T>(response)
  },

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<T>(response)
  },

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<T>(response)
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: getHeaders(),
    })
    return handleResponse<T>(response)
  },
}

export { ApiError }
