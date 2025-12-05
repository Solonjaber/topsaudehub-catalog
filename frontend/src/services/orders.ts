import api from './api'
import type { Order, OrderListResponse, CreateOrder } from '../types'

export const ordersService = {
  async getAll(params?: {
    skip?: number
    limit?: number
    customer_id?: number
    status?: string
    order_by?: string
    order_dir?: string
  }): Promise<OrderListResponse> {
    const response = await api.get<OrderListResponse>('/orders', { params })
    return response.data
  },

  async getById(id: number): Promise<Order> {
    const response = await api.get<Order>(`/orders/${id}`)
    return response.data
  },

  async create(data: CreateOrder, idempotencyKey?: string): Promise<Order> {
    const headers = idempotencyKey
      ? { 'Idempotency-Key': idempotencyKey }
      : {}

    const response = await api.post<Order>('/orders', data, { headers })
    return response.data
  },

  async updateStatus(id: number, status: 'CREATED' | 'PAID' | 'CANCELLED'): Promise<Order> {
    const response = await api.patch<Order>(`/orders/${id}/status`, { status })
    return response.data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/orders/${id}`)
  },
}
