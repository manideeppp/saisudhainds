import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { APP_NAME } from '../constants'
import { formatINR } from '../format'
import type { DatePeriod } from '../period'
import type { MillRawData } from '../mill/millData'
import type { MillSummaryFigures } from '../mill/millSummary'
import { downloadBlob, downloadCsv } from './download'

function safeName(period: DatePeriod): string {
  return period.label.replace(/\s+/g, '-')
}

export function exportFarmerCsv(data: MillRawData, period: DatePeriod): void {
  downloadCsv(`farmer-paddy-${safeName(period)}`, [
    'Date',
    'Farmer',
    'Village',
    'Vehicle',
    'Way bill',
    'Paddy',
    'Bags',
    'Quintals',
    'Total',
    'Paid',
    'Due',
  ], data.farmer.map((r) => [
    r.intake_date,
    r.farmer_name,
    r.village,
    r.vehicle_number,
    r.way_bill_number,
    r.paddy_name,
    r.bags,
    r.quintals,
    r.total_price,
    r.amount_paid,
    r.due_amount,
  ]))
}

export function exportIkpCsv(data: MillRawData, period: DatePeriod): void {
  downloadCsv(`ikp-paddy-${safeName(period)}`, [
    'Date',
    'Center',
    'Vehicle',
    'Truck sheet',
    'Grade A bags',
    'Grade A qtl',
    'Common bags',
    'Common qtl',
    'Total',
    'Paid',
    'Due',
  ], data.ikp.map((r) => [
    r.intake_date,
    r.center_name,
    r.vehicle_number,
    r.truck_sheet_number,
    r.grade_a_bags,
    r.grade_a_quintals,
    r.common_bags,
    r.common_quintals,
    r.total_price ?? 0,
    r.amount_paid ?? 0,
    r.due_amount ?? 0,
  ]))
}

export function exportRiceCsv(data: MillRawData, period: DatePeriod): void {
  downloadCsv(`rice-delivery-${safeName(period)}`, [
    'Sno',
    'Date',
    'Vehicle',
    'Way bill',
    'Godown',
    'Variety',
    'B/R',
    'Bags',
    'Quintals',
    'Consignment',
    'CK serial',
    'Total',
    'Paid',
    'Due',
  ], data.rice.map((r) => [
    r.serial_no,
    r.delivery_date,
    r.vehicle_number,
    r.way_bill_number,
    r.godown_name,
    r.variety,
    r.community,
    r.bags,
    r.quintals,
    r.consignment_number,
    r.ck_serial,
    r.total_price ?? 0,
    r.amount_paid ?? 0,
    r.due_amount ?? 0,
  ]))
}

export function exportByproductsCsv(data: MillRawData, period: DatePeriod): void {
  downloadCsv(`byproducts-${safeName(period)}`, [
    'Product',
    'Date',
    'To whom',
    'Quintals',
    'Price/qtl',
    'Total',
    'Given',
    'Due',
  ], data.byproducts.map((r) => [
    r.product_type,
    r.sale_date,
    r.party_name,
    r.quintals,
    r.price_per_quintal,
    r.total_price,
    r.amount_given,
    r.due_amount,
  ]))
}

export function exportFullExcel(
  data: MillRawData,
  summary: MillSummaryFigures,
  period: DatePeriod,
): void {
  const wb = XLSX.utils.book_new()

  const summaryRows = [
    ['Period', period.label],
    ['Rice sales', summary.riceSales],
    ['By-product sales', summary.byproductSales],
    ['Total sales', summary.totalSales],
    ['Farmer paddy cost', summary.farmerPaddyCost],
    ['IKP paddy cost', summary.ikpPaddyCost],
    ['Total paddy cost', summary.totalPaddyCost],
    ['Expenses', summary.expenses],
    ['Estimated profit', summary.estimatedProfit],
    ['Cash in', summary.cashIn],
    ['Cash out', summary.cashOut],
    ['Due to collect', summary.dueToCollect],
    ['Due to pay', summary.dueToPay],
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryRows), 'Summary')

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      data.farmer.map((r) => ({
        Date: r.intake_date,
        Farmer: r.farmer_name,
        Village: r.village,
        Quintals: r.quintals,
        Total: r.total_price,
        Paid: r.amount_paid,
        Due: r.due_amount,
      })),
    ),
    'Farmer paddy',
  )

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      data.ikp.map((r) => ({
        Date: r.intake_date,
        Center: r.center_name,
        'Grade A qtl': r.grade_a_quintals,
        'Common qtl': r.common_quintals,
        Total: r.total_price,
        Paid: r.amount_paid,
        Due: r.due_amount,
      })),
    ),
    'IKP paddy',
  )

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      data.rice.map((r) => ({
        Date: r.delivery_date,
        Godown: r.godown_name,
        Variety: r.variety,
        Quintals: r.quintals,
        Total: r.total_price,
        Paid: r.amount_paid,
        Due: r.due_amount,
      })),
    ),
    'Rice',
  )

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      data.byproducts.map((r) => ({
        Product: r.product_type,
        Date: r.sale_date,
        Party: r.party_name,
        Quintals: r.quintals,
        Total: r.total_price,
        Given: r.amount_given,
        Due: r.due_amount,
      })),
    ),
    'By-products',
  )

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      data.expenses.map((r) => ({
        Date: r.expense_date,
        Category: r.categories?.name,
        PaidTo: r.paid_to,
        Mode: r.payment_mode,
        Amount: r.amount,
      })),
    ),
    'Expenses',
  )

  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  downloadBlob(
    new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `mill-report-${safeName(period)}.xlsx`,
  )
}

export function exportProfitPdf(
  summary: MillSummaryFigures,
  period: DatePeriod,
): void {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text(APP_NAME, 14, 18)
  doc.setFontSize(11)
  doc.setTextColor(80)
  doc.text(`Mill profit summary — ${period.label}`, 14, 26)
  doc.setTextColor(0)

  const rows = [
    ['Rice sales', formatINR(summary.riceSales)],
    ['By-product sales', formatINR(summary.byproductSales)],
    ['Total sales', formatINR(summary.totalSales)],
    ['Farmer paddy cost', formatINR(summary.farmerPaddyCost)],
    ['IKP / PACS paddy cost', formatINR(summary.ikpPaddyCost)],
    ['Total paddy cost', formatINR(summary.totalPaddyCost)],
    ['Operating expenses', formatINR(summary.expenses)],
    ['Estimated profit', formatINR(summary.estimatedProfit)],
    ['Cash received (period)', formatINR(summary.cashIn)],
    ['Cash paid (period)', formatINR(summary.cashOut)],
    ['Due to collect (period)', formatINR(summary.dueToCollect)],
    ['Due to pay (period)', formatINR(summary.dueToPay)],
  ]

  autoTable(doc, {
    startY: 32,
    head: [['Item', 'Amount (INR)']],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [45, 111, 82] },
  })

  const byRows = Object.entries(summary.byproductBreakdown).map(([k, v]) => [k, formatINR(v)])
  if (byRows.length > 0) {
    const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 120
    autoTable(doc, {
      startY: finalY + 10,
      head: [['By-product', 'Sales']],
      body: byRows,
      theme: 'striped',
    })
  }

  doc.save(`mill-profit-${safeName(period)}.pdf`)
}
