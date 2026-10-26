export function farmerPaddyTotals(quintals: number, pricePerQuintal: number, amountPaid: number) {
  const total = Math.round(quintals * pricePerQuintal * 100) / 100
  const paid = Math.max(0, amountPaid)
  const due = Math.max(0, Math.round((total - paid) * 100) / 100)
  return { total_price: total, due_amount: due }
}

export function ikpTotalQuintals(gradeA: number, common: number): number {
  return Number(gradeA) + Number(common)
}

export function ikpHasQuantity(row: {
  grade_a_bags: number
  grade_a_quintals: number
  common_bags: number
  common_quintals: number
}): boolean {
  return (
    row.grade_a_bags > 0 ||
    row.grade_a_quintals > 0 ||
    row.common_bags > 0 ||
    row.common_quintals > 0
  )
}
