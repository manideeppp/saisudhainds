export type PaymentMode = 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque'

export type ReceivableStatus = 'Paid' | 'Pending' | 'Overdue'

export interface Category {
  id: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  season_id: string
  expense_date: string
  category_id: string
  description: string
  paid_to: string
  payment_mode: PaymentMode
  amount: number
  created_at: string
  updated_at: string
}

export interface ExpenseWithCategory extends Expense {
  categories?: { name: string } | null
}

export interface Receivable {
  id: string
  season_id: string
  carried_from_id?: string | null
  date_given: string
  party_name: string
  details: string
  amount_due: number
  due_date: string
  notes: string
  created_at: string
  updated_at: string
}

export interface ReceivablePayment {
  id: string
  receivable_id: string
  payment_date: string
  amount: number
  notes: string
  created_at: string
}

export interface ReceivableWithPayments extends Receivable {
  receivable_payments: ReceivablePayment[]
}

export interface FarmerPaddyIntake {
  id: string
  season_id: string
  intake_date: string
  farmer_name: string
  village: string
  vehicle_number: string
  way_bill_number: string
  paddy_name: string
  bags: number
  quintals: number
  price_per_quintal: number
  total_price: number
  amount_paid: number
  due_amount: number
  notes: string
  created_at: string
  updated_at: string
}

export interface IkpPaddyIntake {
  id: string
  season_id: string
  intake_date: string
  vehicle_number: string
  truck_sheet_number: string
  center_name: string
  grade_a_bags: number
  grade_a_quintals: number
  common_bags: number
  common_quintals: number
  gunny_old: number
  gunny_new: number
  price_per_quintal: number
  total_price: number
  amount_paid: number
  due_amount: number
  notes: string
  created_at: string
  updated_at: string
}

export interface GunnyDispatch {
  id: string
  season_id: string
  dispatch_date: string
  ppc_center_name: string
  mandal: string
  gunny_count: number
  notes: string
  created_at: string
  updated_at: string
}

export type RiceCommunityCode = 'B' | 'R'

export interface RiceDelivery {
  id: string
  season_id: string
  serial_no: string
  delivery_date: string
  vehicle_number: string
  way_bill_number: string
  godown_name: string
  variety: string
  community: RiceCommunityCode
  bags: number
  quintals: number
  consignment_number: string
  ck_serial: string
  price_per_quintal: number
  total_price: number
  amount_paid: number
  due_amount: number
  notes: string
  created_at: string
  updated_at: string
}

export interface ByproductSale {
  id: string
  season_id: string
  product_type: string
  sale_date: string
  party_name: string
  quintals: number
  price_per_quintal: number
  total_price: number
  amount_given: number
  due_amount: number
  notes: string
  created_at: string
  updated_at: string
}
