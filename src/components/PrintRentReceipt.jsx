import { jsPDF } from 'jspdf'
import dayjs from 'dayjs'

function numberToWords(num) {
  const n = Math.floor(Number(num) || 0)
  if (n <= 0) return 'Zero Rupees Only'
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  function inWords(val) {
    if (val < 20) return a[val]
    if (val < 100) return b[Math.floor(val / 10)] + (val % 10 !== 0 ? ' ' + a[val % 10] : '')
    if (val < 1000) return a[Math.floor(val / 100)] + ' Hundred' + (val % 100 !== 0 ? ' ' + inWords(val % 100) : '')
    if (val < 100000) return inWords(Math.floor(val / 1000)) + ' Thousand' + (val % 1000 !== 0 ? ' ' + inWords(val % 1000) : '')
    if (val < 10000000) return inWords(Math.floor(val / 100000)) + ' Lakh' + (val % 100000 !== 0 ? ' ' + inWords(val % 100000) : '')
    return inWords(Math.floor(val / 10000000)) + ' Crore' + (val % 10000000 !== 0 ? ' ' + inWords(val % 10000000) : '')
  }

  return `${inWords(n)} Rupees Only`
}

function formatAddress(addr) {
  if (!addr) return ''
  if (typeof addr === 'string') return addr
  if (typeof addr === 'object') {
    const parts = [addr.address, addr.city, addr.state, addr.pincode].filter(Boolean)
    return parts.join(', ')
  }
  return ''
}

function getValidString(...vals) {
  for (const v of vals) {
    if (v !== undefined && v !== null) {
      if (typeof v === 'string') {
        const trimmed = v.trim()
        if (
          trimmed !== '' &&
          trimmed !== '—' &&
          trimmed !== '-' &&
          trimmed !== 'N/A' &&
          trimmed !== 'null' &&
          trimmed !== 'undefined'
        ) {
          return trimmed
        }
      } else if (typeof v === 'object') {
        const formatted = formatAddress(v)
        if (formatted) return formatted
      }
    }
  }
  return null
}

/**
 * downloadRentReceiptPDF
 * Generates and downloads an executive PDF Rent Receipt
 * Filename format: Rent_Receipt_<TenantName>_<Month>_<Year>.pdf
 */
export function downloadRentReceiptPDF(receiptData = {}) {
  const { receipt, pg, owner, tenant, bed, billing } = receiptData

  const tenantName = getValidString(tenant?.name, 'Resident')
  const pgName = getValidString(
    pg?.pgName,
    pg?.name,
    tenant?.pgName,
    bed?.pgName,
    typeof window !== 'undefined' ? localStorage.getItem('selectedPgName') : null,
    typeof window !== 'undefined' ? localStorage.getItem('businessName') : null,
    'Manage My PG'
  )

  const pgAddress = getValidString(
    pg?.address,
    pg?.fullAddress,
    pg?.pgAddress,
    tenant?.pgAddress,
    bed?.pgAddress,
    typeof window !== 'undefined' ? localStorage.getItem('pgAddress') : null,
    ''
  )

  const pgPhone = getValidString(
    pg?.phone,
    pg?.mobile,
    pg?.pgPhone,
    tenant?.pgPhone,
    bed?.pgPhone,
    ''
  )

  const ownerName = getValidString(
    owner?.name,
    owner?.ownerName,
    pg?.ownerName,
    tenant?.ownerName,
    bed?.ownerName,
    typeof window !== 'undefined' ? localStorage.getItem('fullName') : null,
    typeof window !== 'undefined' ? localStorage.getItem('username') : null,
    'Property Owner'
  )

  const issuedDate = receipt?.issuedAt ? dayjs(receipt.issuedAt).format('DD MMM YYYY') : dayjs().format('DD MMM YYYY')
  const periodFrom = billing?.period?.from ? dayjs(billing.period.from).format('DD MMM YYYY') : '-'
  const periodTo = billing?.period?.to ? dayjs(billing.period.to).format('DD MMM YYYY') : '-'
  const amountPaid = Number(billing?.amount?.paid) || 0
  const paymentMode = billing?.payment?.mode || 'CASH'
  const roomBed = `${bed?.roomName || '-'} / ${bed?.bedName || '-'}`
  const amountInWords = billing?.amount?.inWords || numberToWords(amountPaid)

  // Extract Month & Year for File Name
  const dateForName = billing?.period?.from ? dayjs(billing.period.from) : (receipt?.issuedAt ? dayjs(receipt.issuedAt) : dayjs())
  const monthName = dateForName.format('MMM') // e.g. Sep
  const yearStr = dateForName.format('YYYY')  // e.g. 2026

  const sanitizedTenant = tenantName.replace(/[^a-zA-Z0-9]/g, '_')
  const filename = `Rent_Receipt_${sanitizedTenant}_${monthName}_${yearStr}.pdf`

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5'
  })

  // Colors
  const darkSlate = [15, 23, 42]
  const indigoPrimary = [79, 70, 229]
  const emeraldGreen = [16, 185, 129]
  const mutedSlate = [100, 116, 139]

  let y = 14

  // 1. RENT RECEIPT TITLE (Font size reduced 40% from 13pt to 8pt)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...indigoPrimary)
  doc.text('RENT RECEIPT', 74, y, { align: 'center' })

  y += 6.5

  // 2. PG NAME
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11.5)
  doc.setTextColor(...darkSlate)
  doc.text(pgName.toUpperCase(), 74, y, { align: 'center' })

  y += 4.5

  // 3. ADDRESS (Reduced size: font size 6.5pt, muted slate color)
  if (pgAddress) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...mutedSlate)
    const splitAddr = doc.splitTextToSize(pgAddress, 124)
    doc.text(splitAddr[0], 74, y, { align: 'center' })
    y += 3.5
    if (splitAddr.length > 1) {
      doc.text(splitAddr[1], 74, y, { align: 'center' })
      y += 3.5
    }
  }

  if (pgPhone) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...mutedSlate)
    doc.text(`Contact: ${pgPhone}`, 74, y, { align: 'center' })
    y += 3.5
  }

  y += 2

  // Separator Line
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.4)
  doc.line(12, y, 136, y)

  y += 6

  // 4. DATE OF ISSUE (Right aligned)
  doc.setTextColor(...darkSlate)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text(`Date of Issue: ${issuedDate}`, 136, y, { align: 'right' })

  y += 3
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.4)
  doc.line(12, y, 136, y)

  // 5. DETAILS TABLE BOX
  y += 6
  const details = [
    ['Received From', tenantName],
    ['Room / Bed Space', roomBed],
    ['Billing Period', `${periodFrom} to ${periodTo}`],
    ['Payment Mode', paymentMode],
    ['Payment Status', 'PAID / CLEARED']
  ]

  details.forEach(([label, value], idx) => {
    doc.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255)
    doc.rect(12, y - 4, 124, 7, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(100, 116, 139)
    doc.text(label, 15, y)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...darkSlate)
    if (label === 'Payment Status') {
      doc.setTextColor(...emeraldGreen)
    }
    doc.text(String(value), 55, y)

    y += 7.5
  })

  // 6. COMPACT AMOUNT HIGHLIGHT BOX
  y += 2
  doc.setFillColor(236, 253, 245)
  doc.setDrawColor(16, 185, 129)
  doc.setLineWidth(0.4)
  doc.roundedRect(12, y, 124, 9.5, 2, 2, 'FD')

  doc.setTextColor(5, 150, 105)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`INR ${amountPaid.toLocaleString('en-IN')}`, 74, y + 4.2, { align: 'center' })

  doc.setTextColor(71, 85, 105)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text(`(${amountInWords})`, 74, y + 7.8, { align: 'center' })

  // Remarks if present
  y += 14.5
  if (billing?.remarks) {
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text(`Remarks: ${billing.remarks}`, 12, y)
    y += 5
  }

  // 7. SIGNATURES AREA
  y += 12
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.3)
  doc.line(18, y, 55, y)
  doc.line(93, y, 130, y)

  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkSlate)
  doc.text('Tenant Signature', 36.5, y + 4, { align: 'center' })
  doc.text(tenantName, 36.5, y + 8, { align: 'center' })

  doc.text('Authorized Signature', 111.5, y + 4, { align: 'center' })
  doc.text(ownerName, 111.5, y + 8, { align: 'center' })

  // System Footer Note
  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(148, 163, 184)
  doc.text('* Official computer-generated receipt issued by ManageMyPg System.', 74, 200, { align: 'center' })

  doc.save(filename)
}

// Backwards-compatibility helper export
export function printRentReceipt(receiptData) {
  downloadRentReceiptPDF(receiptData)
}

