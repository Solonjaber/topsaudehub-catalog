import api from './api'
import type { Customer, CustomerListResponse } from '../types'

export const customersService = {
  async getAll(params?: {
    skip?: number
    limit?: number
    search?: string
    order_by?: string
    order_dir?: string
  }): Promise<CustomerListResponse> {
    const response = await api.get<CustomerListResponse>('/customers', { params })
    return response.data
  },

  async getById(id: number): Promise<Customer> {
    const response = await api.get<Customer>(`/customers/${id}`)
    return response.data
  },

  async create(data: Omit<Customer, 'id' | 'created_at'>): Promise<Customer> {
    const response = await api.post<Customer>('/customers', data)
    return response.data
  },

  async update(id: number, data: Partial<Omit<Customer, 'id' | 'created_at'>>): Promise<Customer> {
    const response = await api.put<Customer>(`/customers/${id}`, data)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/customers/${id}`)
  },
}
