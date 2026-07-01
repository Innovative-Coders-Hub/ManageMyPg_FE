import { renderToStaticMarkup } from 'react-dom/server'
import RentReceipt from './RentReceipt'

/**
 * printRentReceipt
 * -----------------
 * Opens a new window, renders the RentReceipt component
 * with provided data, triggers print, then closes window.
 *
 * IMPORTANT:
 * - This helper does NOT compute any values
 * - It assumes receipt data is already prepared
 * - Safe for multi-PG, multi-owner usage
 */
export function printRentReceipt(receiptData) {
  const win = window.open('', '_blank')
  if (!win) return

  const html = renderToStaticMarkup(
    <RentReceipt {...receiptData} />
  )

  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Rent Receipt</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          /* Ensure background colors print correctly */
          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        </style>
      </head>
      <body>
        ${html}
        <script>
          window.onload = function () {
            window.print();
            window.onafterprint = function () {
              window.close();
            };
          };
        </script>
      </body>
    </html>
  `)

  win.document.close()
}
