/**
 * API Configuration
 *
 * This file contains all API endpoints and request functions
 * for communicating with the backend server.
 */

import { authManager, type AuthResponse, type LoginCredentials, type RegisterCredentials } from "./auth"

// Base API URL - change this to your actual backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.membuddy.com"

// API Endpoints
const ENDPOINTS = {
  // Authentication
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  REFRESH_TOKEN: "/api/auth/refresh",
  LOGOUT: "/api/auth/logout",
  VERIFY_EMAIL: "/api/auth/verify-email",
  FORGOT_PASSWORD: "/api/auth/forgot-password",
  RESET_PASSWORD: "/api/auth/reset-password",

  // User management
  GET_USER_PROFILE: "/api/users/profile",
  UPDATE_USER_PROFILE: "/api/users/profile",
  CHANGE_PASSWORD: "/api/users/change-password",

  // Memory content generation
  GENERATE_MEMORY_AIDS: "/api/memory/generate",

  // Memory library
  GET_MEMORY_ITEMS: "/api/memory/items",
  GET_MEMORY_ITEM: "/api/memory/items/:id",
  CREATE_MEMORY_ITEM: "/api/memory/items",
  UPDATE_MEMORY_ITEM: "/api/memory/items/:id",
  DELETE_MEMORY_ITEM: "/api/memory/items/:id",

  // Review scheduling
  SCHEDULE_REVIEW: "/api/review/schedule",
  COMPLETE_REVIEW: "/api/review/complete",
  GET_REVIEW_SCHEDULE: "/api/review/schedule",
}

// Request helpers
const headers = {
  "Content-Type": "application/json",
}

// Add auth token to headers if available
const getAuthHeaders = () => {
  const token = authManager.getToken()
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers
}

// Handle API errors
const handleApiError = async (response: Response) => {
  if (response.status === 401) {
    // Token expired or invalid, try to refresh
    // const refreshToken = authManager.getRefreshToken()
    // if (refreshToken) {
    //   try {
    //     const refreshResponse = await fetch(`${API_BASE_URL}${ENDPOINTS.REFRESH_TOKEN}`, {
    //       method: "POST",
    //       headers,
    //       body: JSON.stringify({ refreshToken }),
    //     })

    //     if (refreshResponse.ok) {
    //       const authData = await refreshResponse.json()
    //       authManager.setAuth(authData)
    //       return true // Indicate that token was refreshed
    //     }
    //   } catch (error) {
    //     console.error("Token refresh failed:", error)
    //   }
    // }

    // If refresh fails, clear auth and redirect to login
    authManager.clearAuth()
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login"
    }
  }

  const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
  throw new Error(errorData.message || `API error: ${response.status}`)
}

// Make authenticated request with retry logic
const makeAuthenticatedRequest = async (url: string, options: RequestInit): Promise<Response> => {
  let response = await fetch(url, {
    ...options,
    headers: { ...getAuthHeaders(), ...options.headers },
  })

  // If unauthorized and token refresh succeeds, retry the request
  if (response.status === 401) {
    const refreshed = await handleApiError(response)
    if (refreshed) {
      response = await fetch(url, {
        ...options,
        headers: { ...getAuthHeaders(), ...options.headers },
      })
    }
  }

  if (!response.ok) {
    await handleApiError(response)
  }

  return response
}

// API request functions
export const api = {
  // Authentication endpoints
  auth: {
    /**
     * Login user with email and password
     */
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      try {
        const form = new URLSearchParams();
        form.append("username", credentials.email); 
        form.append("password", credentials.password);

        const response = await fetch(`${API_BASE_URL}${ENDPOINTS.LOGIN}`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: form,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Login failed" }))
          throw new Error(errorData.message || "Login failed")
        }

        const authData = await response.json()
        authManager.setAuth(authData)
        return authData
      } catch (error) {
        console.error("Login error:", error)
        throw error
      }
    },

    /**
     * Register new user
     */
    register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
      try {
        const response = await fetch(`${API_BASE_URL}${ENDPOINTS.REGISTER}`, {
          method: "POST",
          headers,
          body: JSON.stringify(credentials),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Registration failed" }))
          throw new Error(errorData.message || "Registration failed")
        }

        const authData = await response.json()
        authManager.setAuth(authData)
        return authData
      } catch (error) {
        console.error("Registration error:", error)
        throw error
      }
    },

    /**
     * Logout user
     */
    logout: async (): Promise<void> => {
      try {
        const token = authManager.getToken()
        if (token) {
          await fetch(`${API_BASE_URL}${ENDPOINTS.LOGOUT}`, {
            method: "POST",
            headers: getAuthHeaders(),
          })
        }
      } catch (error) {
        console.error("Logout error:", error)
      } finally {
        authManager.clearAuth()
      }
    },

    /**
     * Refresh authentication token
     */
    refreshToken: async (): Promise<AuthResponse> => {
      const refreshToken = authManager.getRefreshToken()
      if (!refreshToken) {
        throw new Error("No refresh token available")
      }

      try {
        const response = await fetch(`${API_BASE_URL}${ENDPOINTS.REFRESH_TOKEN}`, {
          method: "POST",
          headers,
          body: JSON.stringify({ refreshToken }),
        })

        if (!response.ok) {
          throw new Error("Token refresh failed")
        }

        const authData = await response.json()
        authManager.setAuth(authData)
        return authData
      } catch (error) {
        console.error("Token refresh error:", error)
        authManager.clearAuth()
        throw error
      }
    },

    /**
     * Send password reset email
     */
    forgotPassword: async (email: string): Promise<void> => {
      try {
        const response = await fetch(`${API_BASE_URL}${ENDPOINTS.FORGOT_PASSWORD}`, {
          method: "POST",
          headers,
          body: JSON.stringify({ email }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Failed to send reset email" }))
          throw new Error(errorData.message || "Failed to send reset email")
        }
      } catch (error) {
        console.error("Forgot password error:", error)
        throw error
      }
    },

    /**
     * Reset password with token
     */
    resetPassword: async (token: string, newPassword: string): Promise<void> => {
      try {
        const response = await fetch(`${API_BASE_URL}${ENDPOINTS.RESET_PASSWORD}`, {
          method: "POST",
          headers,
          body: JSON.stringify({ token, password: newPassword }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Password reset failed" }))
          throw new Error(errorData.message || "Password reset failed")
        }
      } catch (error) {
        console.error("Reset password error:", error)
        throw error
      }
    },
  },

  // User management endpoints
  user: {
    /**
     * Get current user profile
     */
    getProfile: async () => {
      try {
        const response = await makeAuthenticatedRequest(`${API_BASE_URL}${ENDPOINTS.GET_USER_PROFILE}`, {
          method: "GET",
        })

        return await response.json()
      } catch (error) {
        console.error("Failed to get user profile:", error)
        throw error
      }
    },

    /**
     * Update user profile
     */
    updateProfile: async (profileData: any) => {
      try {
        const response = await makeAuthenticatedRequest(`${API_BASE_URL}${ENDPOINTS.UPDATE_USER_PROFILE}`, {
          method: "PUT",
          body: JSON.stringify(profileData),
        })

        return await response.json()
      } catch (error) {
        console.error("Failed to update user profile:", error)
        throw error
      }
    },

    /**
     * Change user password
     */
    changePassword: async (currentPassword: string, newPassword: string) => {
      try {
        const response = await makeAuthenticatedRequest(`${API_BASE_URL}${ENDPOINTS.CHANGE_PASSWORD}`, {
          method: "POST",
          body: JSON.stringify({ currentPassword, newPassword }),
        })

        return await response.json()
      } catch (error) {
        console.error("Failed to change password:", error)
        throw error
      }
    },
  },

  /**
   * Generate memory aids from content
   * @param content The content to generate memory aids for
   */
  generateMemoryAids: async (content: string) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}${ENDPOINTS.GENERATE_MEMORY_AIDS}`, {
        method: "POST",
        body: JSON.stringify({ content }),
      })

      return await response.json()
    } catch (error) {
      console.error("Failed to generate memory aids:", error)
      throw error
    }
  },

  /**
   * Save memory item to library
   * @param memoryItem The memory item to save
   */
  saveMemoryItem: async (memoryItem: any) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}${ENDPOINTS.CREATE_MEMORY_ITEM}`, {
        method: "POST",
        body: JSON.stringify(memoryItem),
      })

      return await response.json()
    } catch (error) {
      console.error("Failed to save memory item:", error)
      throw error
    }
  },

  /**
   * Get all memory items for the current user
   */
  getMemoryItems: async () => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}${ENDPOINTS.GET_MEMORY_ITEMS}`, {
        method: "GET",
      })

      return await response.json()
    } catch (error) {
      console.error("Failed to get memory items:", error)
      throw error
    }
  },

  /**
   * Get a specific memory item by ID
   * @param id The ID of the memory item to get
   */
  getMemoryItem: async (id: string) => {
    try {
      const url = `${API_BASE_URL}${ENDPOINTS.GET_MEMORY_ITEM.replace(":id", id)}`
      const response = await makeAuthenticatedRequest(url, {
        method: "GET",
      })

      return await response.json()
    } catch (error) {
      console.error(`Failed to get memory item ${id}:`, error)
      throw error
    }
  },

  /**
   * Schedule a review for a memory item
   * @param itemId The ID of the memory item to schedule a review for
   * @param reviewDate The date to schedule the review for
   */
  scheduleReview: async (itemId: string, reviewDate: string) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}${ENDPOINTS.SCHEDULE_REVIEW}`, {
        method: "POST",
        body: JSON.stringify({ itemId, reviewDate }),
      })

      return await response.json()
    } catch (error) {
      console.error("Failed to schedule review:", error)
      throw error
    }
  },
}

export default api
