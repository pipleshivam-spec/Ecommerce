import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Package, Clock, CheckCircle, XCircle, Truck, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { getUserOrders, getAllOrders, Order } from '@/hooks/useOrders';

const downloadInvoice = (order: Order) => {
  const win = window.open('', '_blank');
  if (!win) return;

  const itemRows = order.items.map((item, idx) => `
    <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f9f7ff'}">
      <td style="padding:14px 16px;border-bottom:1px solid #ede9fe">
        <span style="font-weight:600;color:#1e1b4b">${item.product_name}</span>
      </td>
      <td style="padding:14px 16px;border-bottom:1px solid #ede9fe;text-align:center;color:#6d28d9;font-weight:600">${item.quantity}</td>
      <td style="padding:14px 16px;border-bottom:1px solid #ede9fe;text-align:right;color:#374151">₹${item.price.toFixed(2)}</td>
      <td style="padding:14px 16px;border-bottom:1px solid #ede9fe;text-align:right;font-weight:700;color:#1e1b4b">₹${item.total.toFixed(2)}</td>
    </tr>`).join('');

  const statusColor = order.status === 'delivered' ? '#166534' : order.status === 'shipped' ? '#5b21b6' : '#1d4ed8';
  const statusBg = order.status === 'delivered' ? '#dcfce7' : order.status === 'shipped' ? '#ede9fe' : '#dbeafe';
  const invoiceDate = new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const dueDate = new Date(new Date(order.created_at).getTime() + 30 * 86400000).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice — ${order.order_number} | Maison</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#f3f0ff;color:#1e1b4b;min-height:100vh;padding:40px 20px}
    .page{max-width:820px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(109,40,217,0.15)}
    .header{background:linear-gradient(135deg,#4c1d95 0%,#6d28d9 50%,#7c3aed 100%);padding:40px 48px;position:relative;overflow:hidden}
    .header::before{content:'';position:absolute;top:-60px;right:-60px;width:220px;height:220px;background:rgba(255,255,255,0.07);border-radius:50%}
    .header::after{content:'';position:absolute;bottom:-80px;left:30%;width:300px;height:300px;background:rgba(255,255,255,0.04);border-radius:50%}
    .header-inner{display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:1}
    .brand{color:#fff}
    .brand-name{font-size:28px;font-weight:800;letter-spacing:2px;text-transform:uppercase}
    .brand-tagline{font-size:12px;color:rgba(255,255,255,0.65);margin-top:4px;letter-spacing:1px}
    .invoice-label{text-align:right;color:#fff}
    .invoice-label h2{font-size:36px;font-weight:800;letter-spacing:3px;opacity:0.95}
    .invoice-label p{font-size:13px;color:rgba(255,255,255,0.7);margin-top:6px}
    .invoice-label .inv-num{font-size:15px;font-weight:700;color:#c4b5fd;margin-top:4px}
    .status-bar{background:linear-gradient(90deg,#ede9fe,#f5f3ff);padding:14px 48px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #ede9fe}
    .status-pill{display:inline-flex;align-items:center;gap:6px;padding:5px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:0.5px;background:${statusBg};color:${statusColor}}
    .paid-pill{display:inline-flex;align-items:center;gap:6px;padding:5px 14px;border-radius:20px;font-size:12px;font-weight:700;background:#dcfce7;color:#166534}
    .body{padding:40px 48px}
    .info-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;margin-bottom:36px}
    .info-box{background:#faf9ff;border:1px solid #ede9fe;border-radius:12px;padding:20px}
    .info-box h5{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#7c3aed;margin-bottom:10px}
    .info-box p{font-size:13px;color:#374151;line-height:1.7}
    .info-box .name{font-size:15px;font-weight:700;color:#1e1b4b;margin-bottom:4px}
    table{width:100%;border-collapse:collapse;margin-bottom:28px}
    thead tr{background:linear-gradient(90deg,#4c1d95,#6d28d9)}
    thead th{padding:14px 16px;color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px}
    thead th:first-child{border-radius:10px 0 0 0;text-align:left}
    thead th:last-child{border-radius:0 10px 0 0}
    .totals-section{display:flex;justify-content:flex-end;margin-bottom:36px}
    .totals-box{width:320px;background:#faf9ff;border:1px solid #ede9fe;border-radius:14px;overflow:hidden}
    .totals-row{display:flex;justify-content:space-between;padding:11px 20px;font-size:13px;color:#374151;border-bottom:1px solid #ede9fe}
    .totals-row:last-child{border-bottom:none;background:linear-gradient(90deg,#4c1d95,#6d28d9);color:#fff;font-size:16px;font-weight:800;padding:16px 20px;border-radius:0 0 14px 14px}
    .totals-row.free{color:#16a34a;font-weight:600}
    .divider{height:1px;background:linear-gradient(90deg,transparent,#c4b5fd,transparent);margin:0 0 32px}
    .footer{background:linear-gradient(135deg,#4c1d95,#6d28d9);padding:28px 48px;display:flex;justify-content:space-between;align-items:center}
    .footer-left p{color:rgba(255,255,255,0.8);font-size:12px;line-height:1.8}
    .footer-left strong{color:#fff;font-size:14px}
    .footer-right{text-align:right}
    .footer-right p{color:rgba(255,255,255,0.65);font-size:11px;margin-top:4px}
    .thank-you{font-size:18px;font-weight:800;color:#fff;letter-spacing:1px}
    .watermark{position:fixed;bottom:60px;right:60px;font-size:80px;font-weight:900;color:rgba(109,40,217,0.04);transform:rotate(-30deg);pointer-events:none;z-index:0;letter-spacing:4px}
    @media print{
      body{background:#fff;padding:0}
      .page{box-shadow:none;border-radius:0}
      .watermark{display:none}
    }
  </style>
</head>
<body>
  <div class="watermark">PAID</div>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="header-inner">
        <div class="brand">
          <div class="brand-name">&#9670; Maison</div>
          <div class="brand-tagline">Premium Fashion &amp; Lifestyle</div>
        </div>
        <div class="invoice-label">
          <h2>INVOICE</h2>
          <p>Tax Invoice / GST Receipt</p>
          <div class="inv-num"># ${order.order_number}</div>
        </div>
      </div>
    </div>

    <!-- Status Bar -->
    <div class="status-bar">
      <div style="display:flex;gap:10px;align-items:center">
        <span class="status-pill">&#9679; ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
        <span class="paid-pill">&#10003; Payment Confirmed</span>
      </div>
      <div style="font-size:12px;color:#6b7280">
        <span style="margin-right:20px"><strong style="color:#4c1d95">Issue Date:</strong> ${invoiceDate}</span>
        <span><strong style="color:#4c1d95">Valid Until:</strong> ${dueDate}</span>
      </div>
    </div>

    <!-- Body -->
    <div class="body">
      <!-- Info Grid -->
      <div class="info-grid">
        <div class="info-box">
          <h5>&#128100; Bill To</h5>
          <p class="name">${order.shipping_name}</p>
          <p>${order.shipping_phone}</p>
          <p>${order.shipping_address_line1}${order.shipping_address_line2 ? '<br>' + order.shipping_address_line2 : ''}</p>
          <p>${order.shipping_city}, ${order.shipping_state}</p>
          <p>PIN: ${order.shipping_postal_code}</p>
        </div>
        <div class="info-box">
          <h5>&#128230; Ship To</h5>
          <p class="name">${order.shipping_name}</p>
          <p>${order.shipping_address_line1}${order.shipping_address_line2 ? '<br>' + order.shipping_address_line2 : ''}</p>
          <p>${order.shipping_city}, ${order.shipping_state} — ${order.shipping_postal_code}</p>
          <p style="margin-top:8px;color:#7c3aed;font-weight:600;font-size:12px">&#128666; ${order.status === 'delivered' ? 'Delivered' : 'In Transit'}</p>
        </div>
        <div class="info-box">
          <h5>&#128179; Payment Info</h5>
          <p class="name" style="color:#166534">&#10003; Paid in Full</p>
          <p style="margin-top:6px"><strong>Method:</strong><br>${order.payment_method.replace(/_/g,' ').toUpperCase()}</p>
          <p style="margin-top:6px"><strong>Items:</strong> ${order.items.length} ${order.items.length === 1 ? 'item' : 'items'}</p>
          <p style="margin-top:4px"><strong>Order Date:</strong><br>${invoiceDate}</p>
        </div>
      </div>

      <!-- Items Table -->
      <table>
        <thead>
          <tr>
            <th style="text-align:left">Product Description</th>
            <th style="text-align:center">Qty</th>
            <th style="text-align:right">Unit Price</th>
            <th style="text-align:right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <!-- Totals -->
      <div class="totals-section">
        <div class="totals-box">
          <div class="totals-row"><span>Subtotal</span><span>₹${order.subtotal.toFixed(2)}</span></div>
          <div class="totals-row ${order.shipping_amount === 0 ? 'free' : ''}"><span>Shipping</span><span>${order.shipping_amount === 0 ? '&#10003; Free' : '₹' + order.shipping_amount.toFixed(2)}</span></div>
          <div class="totals-row"><span>GST (18%)</span><span>₹${order.tax_amount.toFixed(2)}</span></div>
          <div class="totals-row"><span>Grand Total</span><span>₹${order.total_amount.toFixed(2)}</span></div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Terms -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:8px">
        <div>
          <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#7c3aed;margin-bottom:8px">Terms &amp; Conditions</p>
          <p style="font-size:12px;color:#6b7280;line-height:1.8">&#8226; All sales are final after delivery confirmation.<br>&#8226; Returns accepted within 7 days of delivery.<br>&#8226; This is a computer-generated invoice.</p>
        </div>
        <div style="text-align:right">
          <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#7c3aed;margin-bottom:8px">Authorised Signature</p>
          <div style="margin-top:30px;border-top:2px solid #c4b5fd;padding-top:8px;display:inline-block;min-width:160px">
            <p style="font-size:12px;color:#4c1d95;font-weight:700">Maison Pvt. Ltd.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-left">
        <strong>Maison — Premium Fashion &amp; Lifestyle</strong>
        <p>support@maison.in &nbsp;|&nbsp; +91 98765 43210</p>
        <p>www.maison.in &nbsp;|&nbsp; GSTIN: 27AABCS1429B1Z6</p>
      </div>
      <div class="footer-right">
        <div class="thank-you">Thank You! &#128149;</div>
        <p>We appreciate your business</p>
        <p>Generated on ${new Date().toLocaleDateString('en-IN')}</p>
      </div>
    </div>
  </div>
  <script>window.onload = () => window.print();<\/script>
</body>
</html>`);
  win.document.close();
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmOrder, setConfirmOrder] = useState<Order | null>(null);

  useEffect(() => {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) { navigate('/login'); return; }
    const user = JSON.parse(userRaw);
    const allOrders = getAllOrders();
    // Match by user_id OR email to catch all past orders
    const userOrders = allOrders.filter(o =>
      String(o.user_id) === String(user.id) || o.user_email === user.email
    );
    setOrders(userOrders);
  }, [navigate]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="text-blue-500" size={20} />;
      case 'processing': return <Package className="text-blue-500" size={20} />;
      case 'shipped': return <Truck className="text-purple-500" size={20} />;
      case 'delivered': return <CheckCircle className="text-green-500" size={20} />;
      case 'cancelled': return <XCircle className="text-red-500" size={20} />;
      default: return <Clock className="text-yellow-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Layout>
      <section className="pt-28 pb-16 min-h-screen">
        <div className="container-main max-w-4xl">
          <h1 className="font-display text-4xl font-bold mb-8">My Orders</h1>

          {orders.length === 0 ? (
            <div className="text-center py-20">
              <Package size={64} className="mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
              <button onClick={() => navigate('/products')} className="px-6 py-3 rounded-full bg-primary text-white font-semibold hover:opacity-90">
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="glass-card overflow-hidden">
                  {/* Order Header */}
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(order.status)}
                        <div>
                          <h3 className="font-semibold text-lg">Order #{order.order_number}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Payment: Paid ✓
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">₹{order.total_amount.toFixed(2)}</p>
                        </div>
                        {expandedId === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === order.id && (
                    <div className="border-t px-6 pb-6 pt-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Items */}
                        <div>
                          <h4 className="font-semibold mb-3">Items Ordered</h4>
                          <div className="space-y-3">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex gap-3 bg-white p-3 rounded-lg">
                                <img src={item.product_image} alt={item.product_name} className="w-14 h-14 object-cover rounded" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{item.product_name}</p>
                                  <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                                  <p className="text-sm font-semibold text-primary">₹{item.total.toFixed(2)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shipping & Summary */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Shipping Address</h4>
                            <div className="bg-white p-3 rounded-lg text-sm space-y-1">
                              <p className="font-medium">{order.shipping_name}</p>
                              <p className="text-muted-foreground">{order.shipping_phone}</p>
                              <p className="text-muted-foreground">{order.shipping_address_line1}</p>
                              {order.shipping_address_line2 && <p className="text-muted-foreground">{order.shipping_address_line2}</p>}
                              <p className="text-muted-foreground">{order.shipping_city}, {order.shipping_state} – {order.shipping_postal_code}</p>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Price Breakdown</h4>
                            <div className="bg-white p-3 rounded-lg text-sm space-y-1">
                              <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotal.toFixed(2)}</span></div>
                              <div className="flex justify-between"><span>Shipping</span><span>{order.shipping_amount === 0 ? 'Free' : `₹${order.shipping_amount}`}</span></div>
                              <div className="flex justify-between"><span>Tax (GST 18%)</span><span>₹{order.tax_amount.toFixed(2)}</span></div>
                              <div className="flex justify-between font-bold border-t pt-1 mt-1">
                                <span>Total</span><span className="text-primary">₹{order.total_amount.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white p-3 rounded-lg text-sm">
                            <span className="text-muted-foreground">Payment via: </span>
                            <span className="font-medium capitalize">{order.payment_method.replace('_', ' ').toUpperCase()}</span>
                          </div>

                          <button
                            onClick={() => setConfirmOrder(order)}
                            className="flex items-center gap-2 w-full justify-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition"
                          >
                            <Download size={16} /> Download Invoice
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Invoice Confirmation Dialog */}
      {confirmOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download size={28} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Download Invoice?</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Order <strong>#{confirmOrder.order_number}</strong> — ₹{confirmOrder.total_amount.toFixed(2)}<br />
              This will open a print dialog to save as PDF.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOrder(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => { downloadInvoice(confirmOrder); setConfirmOrder(null); }}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition"
              >
                Yes, Download
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Orders;
