import React from 'react'

/**
 * RentReceipt
 * Printable A5 receipt. Pure presentational component.
 * No business logic. No side effects.
 */
export default function RentReceipt({
  receipt,
  pg,
  owner,
  tenant,
  bed,
  billing,
}) {
  return (
    <div className="receipt-root">
      {/* HEADER */}
      <header className="header">
        <div className="pg-name">{pg?.name}</div>
        <div className="pg-address">{pg?.address}</div>
        {pg?.phone && <div className="pg-meta">Phone: {pg.phone}</div>}
      </header>

      <div className="title">RENT RECEIPT</div>

      {/* META */}
      <section className="meta">
        <div><strong>Receipt No:</strong> {receipt?.receiptNumber || '—'}</div>
        <div><strong>Date:</strong> {formatDate(receipt?.issuedAt)}</div>
      </section>

      {/* DETAILS */}
      <section className="details">
        <Row label="Received From" value={tenant?.name} />
        <Row label="Room / Bed" value={`${bed?.roomName || '-'} / ${bed?.bedName || '-'}`} />
        <Row label="Billing Period" value={`${formatDate(billing?.period?.from)} to ${formatDate(billing?.period?.to)}`} />
        <Row label="Payment Mode" value={billing?.payment?.mode} />
      </section>

      {/* AMOUNT */}
      <section className="amount">
        <div className="amount-box">₹ {billing?.amount?.paid}</div>
        <div className="amount-words">({billing?.amount?.inWords})</div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="signatures">
          <div className="sig">
            <div className="line" />
            <div className="label">Tenant Signature</div>
            <div className="name">{tenant?.name}</div>
          </div>
          <div className="sig">
            <div className="line" />
            <div className="label">Authorized By</div>
            <div className="name">{owner?.name}</div>
          </div>
        </div>

        {billing?.remarks && (
          <div className="remarks">Remarks: {billing.remarks}</div>
        )}

        <div className="note">* This is a system generated receipt</div>
      </footer>

      {/* PRINT STYLES */}
      <style>{printStyles}</style>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="row">
      <div className="row-label">{label}</div>
      <div className="row-value">{value || '—'}</div>
    </div>
  )
}

function formatDate(d) {
  if (!d) return '—'
  const date = new Date(d)
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const printStyles = `
@page {
  size: A5;
  margin: 12mm;
}

.receipt-root {
  font-family: "Segoe UI", Roboto, Arial, sans-serif;
  font-size: 12px;
  color: #000;
}

.header {
  text-align: center;
  margin-bottom: 8px;
}

.pg-name {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.pg-address {
  font-size: 11px;
  margin-top: 2px;
}

.pg-meta {
  font-size: 11px;
}

.title {
  text-align: center;
  margin: 10px 0 8px;
  font-weight: 700;
  text-decoration: underline;
}

.meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.details {
  margin-top: 8px;
}

.row {
  display: flex;
  margin: 6px 0;
}

.row-label {
  width: 35%;
}

.row-value {
  width: 65%;
  border-bottom: 1px dotted #000;
  padding-left: 4px;
}

.amount {
  margin-top: 12px;
  text-align: center;
}

.amount-box {
  display: inline-block;
  border: 2px solid #000;
  padding: 6px 16px;
  font-size: 16px;
  font-weight: 700;
}

.amount-words {
  margin-top: 4px;
  font-size: 11px;
}

.footer {
  margin-top: 24px;
}

.signatures {
  display: flex;
  justify-content: space-between;
}

.sig {
  width: 45%;
  text-align: center;
}

.line {
  border-top: 1px solid #000;
  margin-bottom: 4px;
}

.label {
  font-size: 11px;
}

.name {
  font-size: 11px;
}

.remarks {
  margin-top: 10px;
  font-size: 11px;
}

.note {
  margin-top: 6px;
  font-size: 10px;
}
`
