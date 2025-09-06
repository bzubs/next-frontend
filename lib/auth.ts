export interface User {
  user_id: string
  username: string
  email: string
}

export interface AuthResponse {
  success: boolean
  token?: string
  message?: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000"

export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (data.success && data.token) {
      localStorage.setItem("token", data.token)
    }

    return data
  } catch (error) {
    return { success: false, message: "Network error" }
  }
}

export async function register(username: string, email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    })

    return await response.json()
  } catch (error) {
    return { success: false, message: "Network error" }
  }
}

export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token")
  }
}

export async function getProfile(): Promise<User | null> {
  const token = getToken()
  if (!token) return null

  try {
    const response = await fetch(`${API_BASE}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()
    return data.success ? data.user : null
  } catch (error) {
    return null
  }
}
