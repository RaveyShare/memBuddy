/**
 * Authentication utilities and JWT token management
 */

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  refresh_token: string
  user?: User
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
}

// Token storage keys
const TOKEN_KEY = "access_token"
const REFRESH_TOKEN_KEY = "refresh_token"
const USER_KEY = "user_data"

export class AuthManager {
  private static instance: AuthManager
  private user: User | null = null
  private token: string | null = null
  private refreshToken: string | null = null

  private constructor() {
    // Initialize from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem(TOKEN_KEY)
      this.refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      const userData = localStorage.getItem(USER_KEY)
      if (userData) {
        try {
          this.user = JSON.parse(userData)
        } catch (error) {
          console.error("Error parsing user data:", error)
          localStorage.removeItem(USER_KEY)
          this.clearAuth()
        }
      }
    }
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager()
    }
    return AuthManager.instance
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.user
  }

  // Get auth token
  getToken(): string | null {
    return this.token
  }

  // Set authentication data
  setAuth(authData: { access_token: string; token_type: string; refresh_token?: string }): void {
    if (!authData || typeof authData !== "object" || !authData.access_token || !authData.token_type) {
      this.clearAuth()
      return
    }
    this.token = authData.access_token
    this.refreshToken = authData.refresh_token ?? null

    if (typeof window !== "undefined") {
      console.log("setAuth called", authData)
      localStorage.setItem(TOKEN_KEY, authData.access_token)
      localStorage.setItem(REFRESH_TOKEN_KEY, authData.refresh_token || "")
      localStorage.setItem(USER_KEY, JSON.stringify(authData))
      console.log("token after set", localStorage.getItem(TOKEN_KEY))
      // 触发自定义事件
      window.dispatchEvent(new Event("authChange"))
    }
  }

  // Clear authentication data
  clearAuth(): void {
    this.user = null
    this.token = null
    this.refreshToken = null

    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      // 触发自定义事件
      window.dispatchEvent(new Event("authChange"))
    }
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    if (!this.token) return true

    try {
      const payload = JSON.parse(atob(this.token.split(".")[1]))
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch (error) {
      console.error("Error checking token expiration:", error)
      return true
    }
  }

  // Get refresh token
  getRefreshToken(): string | null {
    return this.refreshToken
  }
}

export const authManager = AuthManager.getInstance()
