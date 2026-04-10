const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendOrderConfirmationEmail = async (userEmail, userName, order) => {
  const itemRows = order.items.map((item, idx) => `
    <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f9f7ff'}">
      <td style="padding:14px 16px;border-bottom:1px solid #ede9fe;font-weight:600;color:#1e1b4b">${item.product_name}</td>
      <td style="padding:14px 16px;border-bottom:1px solid #ede9fe;text-align:center;color:#6d28d9;font-weight:600">${item.quantity}</td>
      <td style="padding:14px 16px;border-bottom:1px solid #ede9fe;text-align:right;color:#374151">₹${parseFloat(item.price).toFixed(2)}</td>
      <td style="padding:14px 16px;border-bottom:1px solid #ede9fe;text-align:right;font-weight:700;color:#1e1b4b">₹${parseFloat(item.total).toFixed(2)}</td>
    </tr>`).join('');

  const invoiceDate = new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Order Confirmation — ${order.order_number}</title>
</head>
<body style="margin:0;padding:0;background:#f3f0ff;font-family:'Segoe UI',Arial,sans-serif">
  <div style="max-width:680px;margin:32px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(109,40,217,0.15)">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#4c1d95 0%,#6d28d9 50%,#7c3aed 100%);padding:40px 48px">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <div style="color:#fff;font-size:26px;font-weight:800;letter-spacing:2px">◆ MAISON</div>
            <div style="color:rgba(255,255,255,0.65);font-size:12px;margin-top:4px;letter-spacing:1px">Premium Fashion &amp; Lifestyle</div>
          </td>
          <td style="text-align:right">
            <div style="color:#c4b5fd;font-size:12px;font-weight:700;letter-spacing:1px">ORDER CONFIRMED</div>
            <div style="color:#fff;font-size:22px;font-weight:800;margin-top:4px"># ${order.order_number}</div>
            <div style="color:rgba(255,255,255,0.7);font-size:12px;margin-top:4px">${invoiceDate}</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Greeting -->
    <div style="padding:32px 48px 0">
      <p style="font-size:18px;font-weight:700;color:#1e1b4b;margin:0">Hi ${userName}! 👋</p>
      <p style="font-size:14px;color:#6b7280;margin:8px 0 0">Thank you for your order. We've received it and it's being processed. Here's your order summary:</p>
    </div>

    <!-- Status Pills -->
    <div style="padding:20px 48px">
      <span style="display:inline-block;background:#dcfce7;color:#166534;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;margin-right:8px">✓ Payment Confirmed</span>
      <span style="display:inline-block;background:#ede9fe;color:#5b21b6;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700">⏳ Processing</span>
    </div>

    <!-- Info Grid -->
    <div style="padding:0 48px 24px;display:block">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="48%" style="vertical-align:top;padding-right:8px">
            <div style="background:#faf9ff;border:1px solid #ede9fe;border-radius:12px;padding:18px">
              <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#7c3aed;margin-bottom:10px">📦 Shipping To</div>
              <div style="font-size:14px;font-weight:700;color:#1e1b4b">${order.shipping_name}</div>
              <div style="font-size:13px;color:#6b7280;margin-top:4px;line-height:1.7">
                ${order.shipping_phone}<br>
                ${order.shipping_address_line1}${order.shipping_address_line2 ? ', ' + order.shipping_address_line2 : ''}<br>
                ${order.shipping_city}, ${order.shipping_state} — ${order.shipping_postal_code}
              </div>
            </div>
          </td>
          <td width="4%"></td>
          <td width="48%" style="vertical-align:top;padding-left:8px">
            <div style="background:#faf9ff;border:1px solid #ede9fe;border-radius:12px;padding:18px">
              <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#7c3aed;margin-bottom:10px">💳 Payment Info</div>
              <div style="font-size:14px;font-weight:700;color:#166534">✓ Paid in Full</div>
              <div style="font-size:13px;color:#6b7280;margin-top:4px;line-height:1.7">
                Method: ${order.payment_method.replace(/_/g,' ').toUpperCase()}<br>
                Items: ${order.items.length} ${order.items.length === 1 ? 'item' : 'items'}<br>
                Date: ${invoiceDate}
              </div>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Items Table -->
    <div style="padding:0 48px 24px">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
        <thead>
          <tr style="background:linear-gradient(90deg,#4c1d95,#6d28d9)">
            <th style="padding:14px 16px;color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;text-align:left;border-radius:10px 0 0 0">Product</th>
            <th style="padding:14px 16px;color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;text-align:center">Qty</th>
            <th style="padding:14px 16px;color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;text-align:right">Unit Price</th>
            <th style="padding:14px 16px;color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;text-align:right;border-radius:0 10px 0 0">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
    </div>

    <!-- Totals -->
    <div style="padding:0 48px 32px">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td></td>
          <td width="300">
            <div style="background:#faf9ff;border:1px solid #ede9fe;border-radius:14px;overflow:hidden">
              <div style="display:flex;justify-content:space-between;padding:11px 20px;font-size:13px;color:#374151;border-bottom:1px solid #ede9fe">
                <table width="100%"><tr><td>Subtotal</td><td style="text-align:right">₹${parseFloat(order.subtotal).toFixed(2)}</td></tr></table>
              </div>
              <div style="padding:11px 20px;font-size:13px;border-bottom:1px solid #ede9fe">
                <table width="100%"><tr>
                  <td style="color:#374151">Shipping</td>
                  <td style="text-align:right;color:${parseFloat(order.shipping_amount) === 0 ? '#16a34a' : '#374151'};font-weight:${parseFloat(order.shipping_amount) === 0 ? '600' : '400'}">
                    ${parseFloat(order.shipping_amount) === 0 ? '✓ Free' : '₹' + parseFloat(order.shipping_amount).toFixed(2)}
                  </td>
                </tr></table>
              </div>
              <div style="padding:11px 20px;font-size:13px;color:#374151;border-bottom:1px solid #ede9fe">
                <table width="100%"><tr><td>GST (18%)</td><td style="text-align:right">₹${parseFloat(order.tax_amount).toFixed(2)}</td></tr></table>
              </div>
              <div style="padding:16px 20px;background:linear-gradient(90deg,#4c1d95,#6d28d9);border-radius:0 0 14px 14px">
                <table width="100%"><tr>
                  <td style="color:#fff;font-size:16px;font-weight:800">Grand Total</td>
                  <td style="text-align:right;color:#fff;font-size:16px;font-weight:800">₹${parseFloat(order.total_amount).toFixed(2)}</td>
                </tr></table>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Divider -->
    <div style="height:1px;background:linear-gradient(90deg,transparent,#c4b5fd,transparent);margin:0 48px 28px"></div>

    <!-- Note -->
    <div style="padding:0 48px 32px;text-align:center">
      <p style="font-size:13px;color:#6b7280;line-height:1.8;margin:0">
        You'll receive another email when your order is shipped.<br>
        For any queries, contact us at <a href="mailto:support@maison.in" style="color:#6d28d9;font-weight:600">support@maison.in</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background:linear-gradient(135deg,#4c1d95,#6d28d9);padding:28px 48px">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <div style="color:#fff;font-size:14px;font-weight:800">Maison — Premium Fashion &amp; Lifestyle</div>
            <div style="color:rgba(255,255,255,0.7);font-size:12px;margin-top:6px;line-height:1.8">
              support@maison.in &nbsp;|&nbsp; +91 98765 43210<br>
              www.maison.in &nbsp;|&nbsp; GSTIN: 27AABCS1429B1Z6
            </div>
          </td>
          <td style="text-align:right">
            <div style="color:#fff;font-size:18px;font-weight:800">Thank You! ❤️</div>
            <div style="color:rgba(255,255,255,0.65);font-size:11px;margin-top:4px">We appreciate your business</div>
          </td>
        </tr>
      </table>
    </div>

  </div>
</body>
</html>`;

  await resend.emails.send({
    from: 'Maison Store <onboarding@resend.dev>',
    to: userEmail,
    subject: `✅ Order Confirmed — #${order.order_number} | Maison`,
    html,
  });
  console.log('✅ Order confirmation email sent to:', userEmail);
};

module.exports = { sendOrderConfirmationEmail };
