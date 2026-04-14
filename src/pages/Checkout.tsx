import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { ArrowLeft, CreditCard, MapPin, Package, CheckCircle, ShieldCheck, Truck, Tag, Gift } from 'lucide-react';
import { createOrder, Order } from '@/hooks/useOrders';
import { sendOrderConfirmationEmail } from '@/services/emailService';
import { hasWelcomeOffer, consumeWelcomeOffer, WELCOME_DISCOUNT } from '@/lib/offersStore';

type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [showCelebration, setShowCelebration] = useState(false);

  // Welcome offer
  const userRaw = localStorage.getItem('user');
  const userId = userRaw ? String(JSON.parse(userRaw).id) : '';

  // ── Redirect to login if not logged in ──
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      toast.error('Please login to continue checkout');
      navigate('/login');
    }
  }, [navigate]);

  const welcomeActive = userId ? hasWelcomeOffer(userId) : false;
  const welcomeDiscount = welcomeActive ? (totalPrice * WELCOME_DISCOUNT) / 100 : 0;

  const [address, setAddress] = useState({
    name: '', phone: '', address_line1: '', address_line2: '',
    city: '', state: '', postal_code: '', country: 'India'
  });

  const shippingFee = totalPrice > 500 ? 0 : 50;
  const taxAmount = totalPrice * 0.18;
  const finalTotal = totalPrice - welcomeDiscount + shippingFee + taxAmount;

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.name || !address.phone || !address.address_line1 ||
      !address.city || !address.state || !address.postal_code) {
      toast.error('Please fill all required fields');
      return;
    }
    setStep(2);
  };

  const handlePayment = async () => {
    setLoading(true);
    // Simulate payment processing delay
    await new Promise(r => setTimeout(r, 2000));

    try {
      const order = createOrder(items, address, paymentMethod);
      await sendOrderConfirmationEmail(order);
      // Consume welcome offer after first purchase
      if (welcomeActive && userId) consumeWelcomeOffer(userId);
      sessionStorage.removeItem('welcome_offer_active');
      clearCart();
      setPlacedOrder(order);
      setShowCelebration(true);
      setStep(3);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Success Screen ──────────────────────────────────────────────────
  if (step === 3 && placedOrder) {
    return (
      <Layout>
        <section className="pt-28 pb-16 min-h-screen">
          <div className="container-main max-w-2xl">
            <div className="glass-card overflow-hidden">
              {/* Top gradient bar */}
              <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #22c55e, #16a34a, #15803d)' }} />

              <div className="p-10 text-center relative overflow-hidden">
                {/* Subtle confetti — only 30 pieces, small, tasteful */}
                {showCelebration && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {Array.from({ length: 30 }, (_, i) => (
                      <div key={i} className="absolute top-0 opacity-0"
                        style={{
                          left: `${10 + Math.random() * 80}%`,
                          width: 4 + Math.random() * 5,
                          height: 4 + Math.random() * 5,
                          backgroundColor: ['#22c55e','#8b5cf6','#f59e0b','#3b82f6','#ec4899'][i % 5],
                          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                          animation: `confettiFall ${1.5 + Math.random() * 1.5}s ${Math.random() * 1.5}s ease-in forwards`,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Success icon */}
                <div className="w-20 h-20 bg-green-50 border-2 border-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle size={40} className="text-green-500" />
                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-600 mb-2">Order Placed Successfully</p>
                <h1 className="font-display text-3xl font-bold mb-2 text-foreground">Thank you! 🎉</h1>
                <p className="text-muted-foreground text-sm mb-5">
                  Your order has been confirmed and will be delivered soon.
                </p>

                {/* Welcome discount badge */}
                {showCelebration && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 border"
                    style={{ background: 'linear-gradient(135deg, #7c3aed10, #4f46e510)', borderColor: '#7c3aed30', color: '#7c3aed' }}>
                    <Gift size={14} />
                    Welcome {WELCOME_DISCOUNT}% discount was applied — you saved ₹{welcomeDiscount.toFixed(0)}!
                  </div>
                )}

                {/* Order details */}
                <div className="bg-muted/30 rounded-xl p-5 text-left mb-6 space-y-3 border border-border/50">
                  {[
                    { label: 'Order Number', value: placedOrder.order_number, highlight: true },
                    { label: 'Total Paid', value: `₹${placedOrder.total_amount.toFixed(2)}` },
                    { label: 'Payment', value: placedOrder.payment_method.replace('_', ' ').toUpperCase() },
                    { label: 'Delivering to', value: `${placedOrder.shipping_name}, ${placedOrder.shipping_city}` },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{row.label}</span>
                      <span className={`text-sm font-semibold ${row.highlight ? 'text-primary' : 'text-foreground'}`}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Delivery estimate */}
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
                  <Truck size={15} />
                  <span>Estimated delivery: 3–5 business days</span>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={() => navigate('/orders')}
                    className="px-6 py-3 rounded-full gold-gradient text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
                    View My Orders
                  </button>
                  <button onClick={() => navigate('/products')}
                    className="px-6 py-3 rounded-full border border-border text-foreground font-semibold text-sm hover:bg-muted/30 transition-colors">
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (items.length === 0 && step !== 3) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Package size={64} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <button onClick={() => navigate('/products')} className="px-6 py-3 rounded-full bg-primary text-white font-semibold hover:opacity-90">
              Browse Products
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="pt-28 pb-16 min-h-screen">
        <div className="container-main max-w-6xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => step === 1 ? navigate('/cart') : setStep(1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-display text-4xl font-bold">Checkout</h1>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center gap-4">
              {[{ icon: MapPin, label: 'Address', s: 1 }, { icon: CreditCard, label: 'Payment', s: 2 }].map(({ icon: Icon, label, s }) => (
                <div key={s} className="flex items-center gap-2">
                  {s > 1 && <div className="w-16 h-0.5 bg-gray-300" />}
                  <div className={`flex items-center gap-2 ${step >= s ? 'text-primary' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= s ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                      <Icon size={16} />
                    </div>
                    <span className="font-medium">{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* ── Step 1: Address ── */}
              {step === 1 && (
                <div className="glass-card p-8">
                  <h2 className="text-2xl font-bold mb-6">Shipping Address</h2>
                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="text" placeholder="Full Name *" value={address.name}
                        onChange={e => setAddress({ ...address, name: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary" required />
                      <input type="tel" placeholder="Phone Number *" value={address.phone}
                        onChange={e => setAddress({ ...address, phone: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary" required />
                    </div>
                    <input type="text" placeholder="Address Line 1 *" value={address.address_line1}
                      onChange={e => setAddress({ ...address, address_line1: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary" required />
                    <input type="text" placeholder="Address Line 2 (Optional)" value={address.address_line2}
                      onChange={e => setAddress({ ...address, address_line2: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input type="text" placeholder="City *" value={address.city}
                        onChange={e => setAddress({ ...address, city: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary" required />
                      <input type="text" placeholder="State *" value={address.state}
                        onChange={e => setAddress({ ...address, state: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary" required />
                      <input type="text" placeholder="Postal Code *" value={address.postal_code}
                        onChange={e => setAddress({ ...address, postal_code: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary" required />
                    </div>
                    <button type="submit" className="w-full py-4 rounded-full bg-primary text-white font-semibold hover:opacity-90 transition-opacity">
                      Continue to Payment
                    </button>
                  </form>
                </div>
              )}

              {/* ── Step 2: Payment ── */}
              {step === 2 && (
                <div className="space-y-4">
                  {/* Address Summary */}
                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Delivering to</h3>
                      <button onClick={() => setStep(1)} className="text-sm text-primary hover:underline">Change</button>
                    </div>
                    <p className="text-sm font-medium">{address.name} · {address.phone}</p>
                    <p className="text-sm text-muted-foreground">{address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ''}</p>
                    <p className="text-sm text-muted-foreground">{address.city}, {address.state} – {address.postal_code}</p>
                  </div>

                  {/* Payment Methods */}
                  <div className="glass-card p-8">
                    <h2 className="text-2xl font-bold mb-6">Select Payment Method</h2>

                    <div className="space-y-3 mb-6">
                      {[
                        { id: 'upi', label: 'UPI / Google Pay / PhonePe', desc: 'Pay instantly using UPI', icon: '📱' },
                        { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay', icon: '💳' },
                        { id: 'netbanking', label: 'Net Banking', desc: 'All major banks supported', icon: '🏦' },
                        { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive', icon: '💵' },
                      ].map(m => (
                        <label key={m.id} className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === m.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                          <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id}
                            onChange={() => setPaymentMethod(m.id as PaymentMethod)} className="accent-primary" />
                          <span className="text-2xl">{m.icon}</span>
                          <div>
                            <p className="font-semibold">{m.label}</p>
                            <p className="text-xs text-muted-foreground">{m.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* UPI input */}
                    {paymentMethod === 'upi' && (
                      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                        <input type="text" placeholder="Enter UPI ID (e.g. name@upi)" className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:border-primary bg-white" />
                        <p className="text-xs text-blue-600 mt-2">Demo mode: any UPI ID will work</p>
                      </div>
                    )}

                    {/* Card inputs */}
                    {paymentMethod === 'card' && (
                      <div className="mb-4 space-y-3 p-4 bg-gray-50 rounded-lg">
                        <input type="text" placeholder="Card Number (e.g. 4111 1111 1111 1111)" maxLength={19}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-white" />
                        <div className="grid grid-cols-2 gap-3">
                          <input type="text" placeholder="MM/YY" className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-white" />
                          <input type="text" placeholder="CVV" maxLength={3} className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-white" />
                        </div>
                        <input type="text" placeholder="Name on Card" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-white" />
                        <p className="text-xs text-gray-500">Demo mode: any card details will work</p>
                      </div>
                    )}

                    {/* Net Banking */}
                    {paymentMethod === 'netbanking' && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-white">
                          <option>Select Your Bank</option>
                          <option>State Bank of India</option>
                          <option>HDFC Bank</option>
                          <option>ICICI Bank</option>
                          <option>Axis Bank</option>
                          <option>Kotak Mahindra Bank</option>
                          <option>Punjab National Bank</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-2">Demo mode: any bank selection will work</p>
                      </div>
                    )}

                    {/* Security badge */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                      <ShieldCheck size={16} className="text-green-600" />
                      <span>100% Secure & Encrypted Payment</span>
                    </div>

                    <button
                      onClick={handlePayment}
                      disabled={loading}
                      className={`w-full py-4 rounded-full font-semibold text-white text-lg transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'}`}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                          Processing Payment...
                        </span>
                      ) : (
                        `Pay ₹${finalTotal.toFixed(2)} & Place Order`
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6 sticky top-28">
                <h3 className="text-xl font-bold mb-4">Order Summary</h3>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.product.id} className="flex gap-3">
                      <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span><span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  {welcomeActive && (
                    <div className="flex justify-between text-sm text-violet-600 font-semibold">
                      <span className="flex items-center gap-1"><Gift size={12} /> Welcome 10% OFF</span>
                      <span>−₹{welcomeDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className={shippingFee === 0 ? 'text-green-600 font-medium' : ''}>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (18% GST)</span><span>₹{taxAmount.toFixed(2)}</span>
                  </div>
                  {shippingFee === 0 && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <Tag size={12} /><span>Free shipping on orders above ₹500!</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Checkout;
