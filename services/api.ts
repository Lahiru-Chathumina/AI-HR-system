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
  // 1. කලින්ම response body එක text එකක් විදියට ගන්නවා (Parse කරන්න කලින්)
  const text = await response.text();

  if (!response.ok) {
    // 401 Unauthorized නම් login එකට යවනවා
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("company")
        window.location.href = "/login"
      }
      throw new ApiError(401, "Unauthorized")
    }

    // Error එක JSON ද නැත්නම් ප්ලේන් Text එකක්ද කියලා බලනවා
    let errorMessage = "An error occurred";
    try {
      const errorJson = JSON.parse(text);
      errorMessage = errorJson.message || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }
    throw new ApiError(response.status, errorMessage)
  }

  // Response එකේ body එකක් නැත්නම් හිස් object එකක් දෙනවා
  if (!text) return {} as T

  // 2. මෙතනදී Backend එකෙන් එවන "Customer added successfully." වගේ ඒවා
  // JSON parse කරන්න ගියොත් හැලෙන නිසා try-catch එකක් දානවා
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    // JSON නෙවෙයි නම් කෙලින්ම text එකම යවනවා
    return text as unknown as T;
  }
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