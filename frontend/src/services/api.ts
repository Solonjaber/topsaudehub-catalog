import axios, { AxiosError } from 'axios'
import type { ApiResponse } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor to handle API envelope
api.interceptors.response.use(
  (response) => {
    const data = response.data as ApiResponse<unknown>

    // Check if response follows the envelope pattern
    if (typeof data.cod_retorno !== 'undefined') {
      if (data.cod_retorno === 1) {
        // Error response
        throw new Error(data.mensagem || 'An error occurred')
      }
      // Success response - return the data field
      return { ...response, data: data.data }
    }

    return response
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.data) {
      const data = error.response.data
      if (typeof data.cod_retorno !== 'undefined' && data.cod_retorno === 1) {
        throw new Error(data.mensagem || 'An error occurred')
      }
    }
    throw error
  }
)

export default api
