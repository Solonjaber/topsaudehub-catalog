export interface ApiResponse<T> {
  cod_retorno: number
  mensagem: string | null
  data: T | null
}

export interface Product {
  id: number
  name: string
  sku: string
  price: number
  stock_qty: number
  is_active: boolean
  created_at: string
}

export interface ProductListResponse {
  items: Product[]
  total: number
  skip: number
  limit: number
}

export interface Customer {
  id: number
  name: string
  email: string
  document: string
  created_at: string
}

export interface CustomerListResponse {
  items: Customer[]
  total: number
  skip: number
  limit: number
}

export interface OrderItem {
  id: number
  product_id: number
  unit_price: number
  quantity: number
  line_total: number
}

export interface Order {
  id: number
  customer_id: number
  total_amount: number
  status: 'CREATED' | 'PAID' | 'CANCELLED'
  created_at: string
  items: OrderItem[]
}

export interface OrderListResponse {
  items: Order[]
  total: number
  skip: number
  limit: number
}

export interface CreateOrderItem {
  product_id: number
  quantity: number
}

export interface CreateOrder {
  customer_id: number
  items: CreateOrderItem[]
}
