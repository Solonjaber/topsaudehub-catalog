import api from './api'
import type { Product, ProductListResponse } from '../types'

export const productsService = {
  async getAll(params?: {
    skip?: number
    limit?: number
    search?: string
    is_active?: boolean
    order_by?: string
    order_dir?: string
  }): Promise<ProductListResponse> {
    const response = await api.get<ProductListResponse>('/products', { params })
    return response.data
  },

  async getById(id: number): Promise<Product> {
    const response = await api.get<Product>(`/products/${id}`)
    return response.data
  },

  async create(data: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    const response = await api.post<Product>('/products', data)
    return response.data
  },

  async update(id: number, data: Partial<Omit<Product, 'id' | 'created_at'>>): Promise<Product> {
    const response = await api.put<Product>(`/products/${id}`, data)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/products/${id}`)
  },

  async search(query: string, limit = 10): Promise<Product[]> {
    const response = await api.get<Product[]>('/products/search/autocomplete', {
      params: { q: query, limit },
    })
    return response.data
  },
}
