require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Simulate a real order
const order = {
  user_name: 'Shivam',
  user_email: process.env.GMAIL_USER,
  order_number: 'ORD17234561234',
  created_at: new Date().toISOString(),
  payment_method: 'upi',
  items: [
    { product_name: 'Premium Wireless Headphones', quantity: 1, total: 2999 },
    { product_name: 'Leather Wallet', quantity: 2, total: 1198 },
  ],
  subtotal: 4197,
  shipping_amount: 0,
  tax_amount: 755.46,
  total_amount: 4952.46,
  shipping_name: 'Shivam',
  shipping_phone: '9876543210',
  shipping_address_line1: '123 MG Road',
  shipping_address_line2: 'Near City Mall',
  shipping_city: 'Mumbai',
  shipping_state: 'Maharashtra',
  shipping_postal_code: '400001',
};

// Reuse same HTML generation from index.js
const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' });
const itemsHtml = order.items
  .map((i, idx) => `<tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}">
    <td style="padding:12px;font-size:14px;color:#0f172a;border-bottom:1px solid #f1f5f9">${i.product_name}</td>
    <td style="padding:12px;font-size:14px;color:#64748b;text-align:center;border-bottom:1px solid #f1f5f9">${i.quantity}</td>
    <td style="padding:12px;font-size:14px;font-weight:600;color:#0f172a;text-align:right;border-bottom:1px solid #f1f5f9">₹${i.total.toFixed(2)}</td>
  </tr>`)
  .join('');

const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <!-- HEADER -->
        <tr><td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0f172a 100%);border-radius:16px 16px 0 0;padding:48px 40px;text-align:center">
          <div style="width:64px;height:64px;background:#22c55e;border-radius:50%;margin:0 auto 16px;line-height:64px;font-size:28px;color:white">✓</div>
          <h1 style="color:#ffffff;margin:0 0 8px;font-size:28px;font-weight:700;letter-spacing:-0.5px">Order Confirmed!</h1>
          <p style="color:#94a3b8;margin:0;font-size:15px">We've received your order and it's being processed</p>
        </td></tr>

        <!-- ORDER NUMBER BANNER -->
        <tr><td style="background:#22c55e;padding:16px 40px;text-align:center">
          <p style="margin:0;color:#fff;font-size:13px;letter-spacing:2px;text-transform:uppercase;opacity:0.85">Order Number</p>
          <p style="margin:4px 0 0;color:#fff;font-size:22px;font-weight:700;letter-spacing:1px">${order.order_number}</p>
        </td></tr>

        <!-- BODY -->
        <tr><td style="background:#ffffff;padding:40px">

          <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#0f172a">Hi ${order.user_name},</p>
          <p style="margin:0 0 32px;font-size:15px;color:#64748b;line-height:1.6">Thank you for your purchase! Your order has been confirmed and will be delivered within <strong style="color:#0f172a">3–5 business days</strong>.</p>

          <!-- Order Meta -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;margin-bottom:32px">
            <tr>
              <td style="padding:20px;border-right:1px solid #e2e8f0;text-align:center;width:50%">
                <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px">Order Date</p>
                <p style="margin:0;font-size:14px;font-weight:600;color:#0f172a">${orderDate}</p>
              </td>
              <td style="padding:20px;text-align:center;width:50%">
                <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px">Payment</p>
                <p style="margin:0;font-size:14px;font-weight:600;color:#0f172a">${order.payment_method.replace('_',' ').toUpperCase()}</p>
              </td>
            </tr>
          </table>

          <!-- Items -->
          <h3 style="margin:0 0 16px;font-size:16px;font-weight:700;color:#0f172a;padding-bottom:12px;border-bottom:2px solid #f1f5f9">🛍️ Items Ordered</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px">
            <tr style="background:#f8fafc">
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:1px">Product</th>
              <th style="padding:10px 12px;text-align:center;font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:1px">Qty</th>
              <th style="padding:10px 12px;text-align:right;font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:1px">Amount</th>
            </tr>
            ${itemsHtml}
          </table>

          <!-- Price Summary -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border-top:2px solid #f1f5f9;padding-top:16px">
            <tr><td style="padding:6px 0"><span style="color:#64748b;font-size:14px">Subtotal</span></td><td style="text-align:right;padding:6px 0"><span style="font-size:14px;color:#0f172a">₹${order.subtotal.toFixed(2)}</span></td></tr>
            <tr><td style="padding:6px 0"><span style="color:#64748b;font-size:14px">Shipping</span></td><td style="text-align:right;padding:6px 0"><span style="font-size:14px;color:#22c55e;font-weight:600">${order.shipping_amount === 0 ? 'FREE' : '₹' + order.shipping_amount.toFixed(2)}</span></td></tr>
            <tr><td style="padding:6px 0"><span style="color:#64748b;font-size:14px">Tax (18% GST)</span></td><td style="text-align:right;padding:6px 0"><span style="font-size:14px;color:#0f172a">₹${order.tax_amount.toFixed(2)}</span></td></tr>
            <tr><td style="padding:14px 0 0;border-top:2px solid #e2e8f0"><span style="font-size:17px;font-weight:700;color:#0f172a">Total Paid</span></td><td style="text-align:right;padding:14px 0 0;border-top:2px solid #e2e8f0"><span style="font-size:20px;font-weight:700;color:#22c55e">₹${order.total_amount.toFixed(2)}</span></td></tr>
          </table>

          <!-- Delivery Address -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;background:#f8fafc;border-radius:12px;border-left:4px solid #22c55e">
            <tr><td style="padding:20px 24px">
              <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#0f172a">📦 Delivery Address</p>
              <p style="margin:0;font-size:14px;color:#64748b;line-height:1.8">
                <strong style="color:#0f172a">${order.shipping_name}</strong> &nbsp;·&nbsp; ${order.shipping_phone}<br/>
                ${order.shipping_address_line1}${order.shipping_address_line2 ? ', ' + order.shipping_address_line2 : ''}<br/>
                ${order.shipping_city}, ${order.shipping_state} – ${order.shipping_postal_code}
              </p>
            </td></tr>
          </table>

          <!-- Timeline -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px">
            <tr>
              <td style="text-align:center;padding:0 4px">
                <div style="width:36px;height:36px;background:#22c55e;border-radius:50%;margin:0 auto 8px;line-height:36px;color:white;font-size:16px">✓</div>
                <p style="margin:0;font-size:11px;font-weight:600;color:#22c55e">Confirmed</p>
              </td>
              <td style="padding-bottom:20px"><div style="height:2px;background:linear-gradient(90deg,#22c55e,#e2e8f0)"></div></td>
              <td style="text-align:center;padding:0 4px">
                <div style="width:36px;height:36px;background:#e2e8f0;border-radius:50%;margin:0 auto 8px"></div>
                <p style="margin:0;font-size:11px;font-weight:600;color:#94a3b8">Processing</p>
              </td>
              <td style="padding-bottom:20px"><div style="height:2px;background:#e2e8f0"></div></td>
              <td style="text-align:center;padding:0 4px">
                <div style="width:36px;height:36px;background:#e2e8f0;border-radius:50%;margin:0 auto 8px"></div>
                <p style="margin:0;font-size:11px;font-weight:600;color:#94a3b8">Shipped</p>
              </td>
              <td style="padding-bottom:20px"><div style="height:2px;background:#e2e8f0"></div></td>
              <td style="text-align:center;padding:0 4px">
                <div style="width:36px;height:36px;background:#e2e8f0;border-radius:50%;margin:0 auto 8px"></div>
                <p style="margin:0;font-size:11px;font-weight:600;color:#94a3b8">Delivered</p>
              </td>
            </tr>
          </table>

        </td></tr>

        <!-- FOOTER -->
        <tr><td style="background:#0f172a;border-radius:0 0 16px 16px;padding:32px 40px;text-align:center">
          <p style="margin:0 0 8px;color:#ffffff;font-size:16px;font-weight:700">Thank you for shopping with us! 🛒</p>
          <p style="margin:0 0 20px;color:#64748b;font-size:13px">If you have any questions, reply to this email or contact our support.</p>
          <p style="margin:0;color:#334155;font-size:12px">© ${new Date().getFullYear()} Ecommerce Store · All rights reserved</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

transporter.sendMail({
  from: `"Ecommerce Store" <${process.env.GMAIL_USER}>`,
  to: process.env.GMAIL_USER,
  subject: `Order Confirmed – ${order.order_number}`,
  html,
}).then(() => {
  console.log('SUCCESS: Professional test email sent to', process.env.GMAIL_USER);
}).catch(err => {
  console.error('FAILED:', err.message);
});
