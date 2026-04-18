const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOrderConfirmationEmail = async (userEmail, userName, order) => {
  const invoiceDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const estimatedDelivery = new Date(new Date(order.created_at).getTime() + 5 * 86400000)
    .toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  const itemRows = order.items.map((item, idx) => `
    <tr>
      <td style="padding:16px 20px;border-bottom:1px solid #2a2a2a;">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td>
              <div style="font-size:14px;font-weight:600;color:#f5f5f0;letter-spacing:0.3px;">${item.product_name}</div>
              <div style="font-size:11px;color:#888;margin-top:3px;letter-spacing:0.5px;text-transform:uppercase;">SKU: ${item.product_sku || 'N/A'}</div>
            </td>
          </tr>
        </table>
      </td>
      <td style="padding:16px 20px;border-bottom:1px solid #2a2a2a;text-align:center;">
        <span style="display:inline-block;background:#1a1a1a;border:1px solid #c9a84c;color:#c9a84c;font-size:13px;font-weight:700;padding:4px 12px;border-radius:20px;">${item.quantity}</span>
      </td>
      <td style="padding:16px 20px;border-bottom:1px solid #2a2a2a;text-align:right;font-size:13px;color:#aaa;">&#8377;${parseFloat(item.price).toFixed(2)}</td>
      <td style="padding:16px 20px;border-bottom:1px solid #2a2a2a;text-align:right;font-size:14px;font-weight:700;color:#c9a84c;">&#8377;${parseFloat(item.total).toFixed(2)}</td>
    </tr>`).join('');

  const shippingFree = parseFloat(order.shipping_amount) === 0;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>Order Confirmed &#8212; #${order.order_number} | MAISON</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <!-- Preheader (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Your MAISON order #${order.order_number} has been confirmed. Thank you, ${userName}!
  </div>

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;">

          <!-- ═══ TOP GOLD LINE ═══ -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,#8b6914,#c9a84c,#e8c96d,#c9a84c,#8b6914);border-radius:3px 3px 0 0;"></td>
          </tr>

          <!-- ═══ HEADER ═══ -->
          <tr>
            <td style="background:#111111;padding:48px 48px 36px;text-align:center;border-left:1px solid #1e1e1e;border-right:1px solid #1e1e1e;">
              <!-- Logo mark -->
              <div style="display:inline-block;width:48px;height:1px;background:linear-gradient(90deg,transparent,#c9a84c);vertical-align:middle;margin-right:12px;"></div>
              <span style="font-size:32px;font-weight:900;letter-spacing:10px;text-transform:uppercase;color:#f5f5f0;vertical-align:middle;font-family:Georgia,serif;">MAISON</span>
              <div style="display:inline-block;width:48px;height:1px;background:linear-gradient(90deg,#c9a84c,transparent);vertical-align:middle;margin-left:12px;"></div>
              <div style="margin-top:8px;font-size:10px;letter-spacing:5px;text-transform:uppercase;color:#c9a84c;font-weight:400;">Premium Fashion &amp; Lifestyle</div>
              <!-- Divider -->
              <div style="width:60px;height:1px;background:#c9a84c;margin:20px auto 0;opacity:0.6;"></div>
            </td>
          </tr>

          <!-- ═══ SUCCESS BANNER ═══ -->
          <tr>
            <td style="background:#0d1f0d;border-left:1px solid #1e1e1e;border-right:1px solid #1e1e1e;padding:20px 48px;text-align:center;border-top:1px solid #1a2e1a;">
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;width:28px;height:28px;background:#22c55e;border-radius:50%;text-align:center;line-height:28px;font-size:15px;color:#fff;font-weight:900;vertical-align:middle;margin-right:10px;">&#10003;</div>
                    <span style="font-size:12px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#4ade80;vertical-align:middle;">Order Confirmed Successfully</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══ GREETING ═══ -->
          <tr>
            <td style="background:#111111;padding:40px 48px 28px;border-left:1px solid #1e1e1e;border-right:1px solid #1e1e1e;">
              <div style="font-size:22px;font-weight:700;color:#f5f5f0;margin-bottom:10px;font-family:Georgia,serif;">Dear ${userName},</div>
              <div style="font-size:14px;color:#888;line-height:1.8;">
                Thank you for your purchase. Your order has been received and is now being carefully prepared. 
                We will notify you once your items are on their way.
              </div>
            </td>
          </tr>

          <!-- ═══ ORDER META CARDS ═══ -->
          <tr>
            <td style="background:#111111;padding:0 48px 32px;border-left:1px solid #1e1e1e;border-right:1px solid #1e1e1e;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Order Number -->
                  <td width="31%" style="background:#161616;border:1px solid #2a2a2a;border-radius:10px;padding:18px 16px;vertical-align:top;">
                    <div style="font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:#c9a84c;font-weight:700;margin-bottom:8px;">Order Number</div>
                    <div style="font-size:15px;font-weight:800;color:#f5f5f0;letter-spacing:0.5px;">#${order.order_number}</div>
                  </td>
                  <td width="3%"></td>
                  <!-- Order Date -->
                  <td width="31%" style="background:#161616;border:1px solid #2a2a2a;border-radius:10px;padding:18px 16px;vertical-align:top;">
                    <div style="font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:#c9a84c;font-weight:700;margin-bottom:8px;">Order Date</div>
                    <div style="font-size:13px;font-weight:600;color:#f5f5f0;">${invoiceDate}</div>
                  </td>
                  <td width="3%"></td>
                  <!-- Est. Delivery -->
                  <td width="31%" style="background:#161616;border:1px solid #2a2a2a;border-radius:10px;padding:18px 16px;vertical-align:top;">
                    <div style="font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:#c9a84c;font-weight:700;margin-bottom:8px;">Est. Delivery</div>
                    <div style="font-size:13px;font-weight:600;color:#f5f5f0;">${estimatedDelivery}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══ SHIPPING & PAYMENT ═══ -->
          <tr>
            <td style="background:#111111;padding:0 48px 32px;border-left:1px solid #1e1e1e;border-right:1px solid #1e1e1e;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Shipping -->
                  <td width="48%" style="background:#161616;border:1px solid #2a2a2a;border-radius:10px;padding:20px;vertical-align:top;">
                    <div style="font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:#c9a84c;font-weight:700;margin-bottom:12px;">&#128230; Shipping To</div>
                    <div style="font-size:14px;font-weight:700;color:#f5f5f0;margin-bottom:6px;">${order.shipping_name}</div>
                    <div style="font-size:12px;color:#888;line-height:1.9;">
                      ${order.shipping_phone}<br>
                      ${order.shipping_address_line1}${order.shipping_address_line2 ? '<br>' + order.shipping_address_line2 : ''}<br>
                      ${order.shipping_city}, ${order.shipping_state}<br>
                      PIN: ${order.shipping_postal_code}
                    </div>
                  </td>
                  <td width="4%"></td>
                  <!-- Payment -->
                  <td width="48%" style="background:#161616;border:1px solid #2a2a2a;border-radius:10px;padding:20px;vertical-align:top;">
                    <div style="font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:#c9a84c;font-weight:700;margin-bottom:12px;">&#128179; Payment Details</div>
                    <div style="font-size:14px;font-weight:700;color:#4ade80;margin-bottom:10px;">&#10003; Paid in Full</div>
                    <div style="font-size:12px;color:#888;line-height:1.9;">
                      <span style="color:#aaa;">Method:</span> ${order.payment_method.replace(/_/g, ' ').toUpperCase()}<br>
                      <span style="color:#aaa;">Items:</span> ${order.items.length} ${order.items.length === 1 ? 'item' : 'items'}<br>
                      <span style="color:#aaa;">Status:</span> <span style="color:#4ade80;font-weight:600;">Confirmed</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══ ITEMS TABLE HEADER ═══ -->
          <tr>
            <td style="background:#111111;padding:0 48px 0;border-left:1px solid #1e1e1e;border-right:1px solid #1e1e1e;">
              <div style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;font-weight:700;margin-bottom:12px;">&#128717; Items Ordered</div>
            </td>
          </tr>

          <!-- ═══ ITEMS TABLE ═══ -->
          <tr>
            <td style="background:#111111;padding:0 48px 32px;border-left:1px solid #1e1e1e;border-right:1px solid #1e1e1e;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #2a2a2a;border-radius:10px;overflow:hidden;">
                <!-- Table Head -->
                <tr style="background:#1a1a1a;">
                  <th style="padding:12px 20px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#c9a84c;text-align:left;border-bottom:1px solid #2a2a2a;">Product</th>
                  <th style="padding:12px 20px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#c9a84c;text-align:center;border-bottom:1px solid #2a2a2a;">Qty</th>
                  <th style="padding:12px 20px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#c9a84c;text-align:right;border-bottom:1px solid #2a2a2a;">Price</th>
                  <th style="padding:12px 20px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#c9a84c;text-align:right;border-bottom:1px solid #2a2a2a;">Total</th>
                </tr>
                ${itemRows}
              </table>
            </td>
          </tr>

          <!-- ═══ PRICE SUMMARY ═══ -->
          <tr>
            <td style="background:#111111;padding:0 48px 36px;border-left:1px solid #1e1e1e;border-right:1px solid #1e1e1e;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="45%"></td>
                  <td width="55%">
                    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #2a2a2a;border-radius:10px;overflow:hidden;">
                      <tr>
                        <td style="padding:12px 20px;border-bottom:1px solid #2a2a2a;">
                          <table width="100%"><tr>
                            <td style="font-size:13px;color:#888;">Subtotal</td>
                            <td style="font-size:13px;color:#f5f5f0;text-align:right;">&#8377;${parseFloat(order.subtotal).toFixed(2)}</td>
                          </tr></table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 20px;border-bottom:1px solid #2a2a2a;">
                          <table width="100%"><tr>
                            <td style="font-size:13px;color:#888;">Shipping</td>
                            <td style="font-size:13px;text-align:right;color:${shippingFree ? '#4ade80' : '#f5f5f0'};font-weight:${shippingFree ? '700' : '400'};">
                              ${shippingFree ? '&#10003; FREE' : '&#8377;' + parseFloat(order.shipping_amount).toFixed(2)}
                            </td>
                          </tr></table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 20px;border-bottom:1px solid #2a2a2a;">
                          <table width="100%"><tr>
                            <td style="font-size:13px;color:#888;">GST (18%)</td>
                            <td style="font-size:13px;color:#f5f5f0;text-align:right;">&#8377;${parseFloat(order.tax_amount).toFixed(2)}</td>
                          </tr></table>
                        </td>
                      </tr>
                      <!-- Grand Total -->
                      <tr>
                        <td style="padding:16px 20px;background:linear-gradient(90deg,#1a1500,#2a2000);">
                          <table width="100%"><tr>
                            <td style="font-size:13px;font-weight:700;color:#c9a84c;letter-spacing:1px;text-transform:uppercase;">Grand Total</td>
                            <td style="font-size:20px;font-weight:900;color:#c9a84c;text-align:right;letter-spacing:0.5px;">&#8377;${parseFloat(order.total_amount).toFixed(2)}</td>
                          </tr></table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══ DELIVERY TIMELINE ═══ -->
          <tr>
            <td style="background:#111111;padding:0 48px 36px;border-left:1px solid #1e1e1e;border-right:1px solid #1e1e1e;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#161616;border:1px solid #2a2a2a;border-radius:10px;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px;">
                    <div style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;font-weight:700;margin-bottom:16px;">&#128666; Delivery Timeline</div>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="25%" style="text-align:center;vertical-align:top;">
                          <div style="width:32px;height:32px;background:#c9a84c;border-radius:50%;margin:0 auto 8px;line-height:32px;font-size:14px;color:#0a0a0a;font-weight:900;">&#10003;</div>
                          <div style="font-size:10px;font-weight:700;color:#c9a84c;letter-spacing:0.5px;">Confirmed</div>
                          <div style="font-size:9px;color:#666;margin-top:2px;">Today</div>
                        </td>
                        <td width="8%" style="vertical-align:middle;padding-bottom:20px;">
                          <div style="height:2px;background:linear-gradient(90deg,#c9a84c,#444);border-radius:2px;"></div>
                        </td>
                        <td width="25%" style="text-align:center;vertical-align:top;">
                          <div style="width:32px;height:32px;background:#1e1e1e;border:2px solid #444;border-radius:50%;margin:0 auto 8px;line-height:28px;font-size:14px;color:#666;">&#128230;</div>
                          <div style="font-size:10px;font-weight:700;color:#888;letter-spacing:0.5px;">Processing</div>
                          <div style="font-size:9px;color:#555;margin-top:2px;">1-2 Days</div>
                        </td>
                        <td width="8%" style="vertical-align:middle;padding-bottom:20px;">
                          <div style="height:2px;background:#2a2a2a;border-radius:2px;"></div>
                        </td>
                        <td width="25%" style="text-align:center;vertical-align:top;">
                          <div style="width:32px;height:32px;background:#1e1e1e;border:2px solid #444;border-radius:50%;margin:0 auto 8px;line-height:28px;font-size:14px;color:#666;">&#128666;</div>
                          <div style="font-size:10px;font-weight:700;color:#888;letter-spacing:0.5px;">Shipped</div>
                          <div style="font-size:9px;color:#555;margin-top:2px;">2-3 Days</div>
                        </td>
                        <td width="8%" style="vertical-align:middle;padding-bottom:20px;">
                          <div style="height:2px;background:#2a2a2a;border-radius:2px;"></div>
                        </td>
                        <td width="25%" style="text-align:center;vertical-align:top;">
                          <div style="width:32px;height:32px;background:#1e1e1e;border:2px solid #444;border-radius:50%;margin:0 auto 8px;line-height:28px;font-size:14px;color:#666;">&#127968;</div>
                          <div style="font-size:10px;font-weight:700;color:#888;letter-spacing:0.5px;">Delivered</div>
                          <div style="font-size:9px;color:#555;margin-top:2px;">By ${estimatedDelivery}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══ NEED HELP ═══ -->
          <tr>
            <td style="background:#111111;padding:0 48px 40px;border-left:1px solid #1e1e1e;border-right:1px solid #1e1e1e;text-align:center;">
              <div style="background:#161616;border:1px solid #2a2a2a;border-radius:10px;padding:24px;">
                <div style="font-size:13px;color:#888;line-height:1.9;">
                  Questions about your order? We're here to help.<br>
                  <a href="mailto:${process.env.EMAIL_USER}" style="color:#c9a84c;text-decoration:none;font-weight:600;">${process.env.EMAIL_USER}</a>
                  &nbsp;&nbsp;&#183;&nbsp;&nbsp;
                  <span style="color:#aaa;">+91 98765 43210</span>
                </div>
              </div>
            </td>
          </tr>

          <!-- ═══ BOTTOM GOLD LINE ═══ -->
          <tr>
            <td style="height:1px;background:linear-gradient(90deg,transparent,#c9a84c,transparent);"></td>
          </tr>

          <!-- ═══ FOOTER ═══ -->
          <tr>
            <td style="background:#0d0d0d;padding:32px 48px;text-align:center;border:1px solid #1e1e1e;border-top:none;border-radius:0 0 4px 4px;">
              <div style="font-size:18px;font-weight:900;letter-spacing:8px;color:#c9a84c;font-family:Georgia,serif;margin-bottom:6px;">MAISON</div>
              <div style="font-size:9px;letter-spacing:4px;text-transform:uppercase;color:#444;margin-bottom:20px;">Premium Fashion &amp; Lifestyle</div>
              <div style="width:40px;height:1px;background:#2a2a2a;margin:0 auto 20px;"></div>
              <div style="font-size:11px;color:#444;line-height:2;">
                &copy; ${new Date().getFullYear()} MAISON. All rights reserved.<br>
                You received this email because you placed an order on MAISON.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

  await transporter.sendMail({
    from: `"MAISON Store" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `✅ Order Confirmed — #${order.order_number} | MAISON`,
    html,
  });
  console.log('✅ Order confirmation email sent to:', userEmail);
};

module.exports = { sendOrderConfirmationEmail };
