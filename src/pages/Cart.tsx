import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, X, Gift } from "lucide-react";
import { motion } from "framer-motion";

const Cart = () => {
  const {
    items, updateQuantity, removeFromCart, clearCart,
    totalPrice, appliedCoupon, couponDiscount, finalTotal,
    applyCoupon, removeCoupon,
    welcomeDiscount, welcomeDiscountAmount,
    activeCouponDiscount, activeCouponAmount,
    bxgyOffer, bxgyFreeItems, bxgySavingAmount,
  } = useCart();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');

  const handleApply = () => {
    if (!couponInput.trim()) return;
    applyCoupon(couponInput.trim());
    setCouponInput('');
  };

  const shipping = finalTotal > 200 ? 0 : 15;
  const totalSavings = welcomeDiscountAmount + couponDiscount + activeCouponAmount + bxgySavingAmount;

  return (
    <Layout>
      <section className="pt-28 pb-16 min-h-screen">
        <div className="container-main">
          <h1 className="font-display text-4xl font-bold mb-8">Shopping Cart</h1>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-lg mb-6">Your cart is empty</p>
              <Link to="/products" className="inline-flex items-center gap-2 px-8 py-3 rounded-full gold-gradient text-primary-foreground font-semibold text-sm">
                Continue Shopping <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map(item => {
                  const effectiveDiscount = welcomeDiscount || activeCouponDiscount;
                  const discountedPrice = effectiveDiscount > 0
                    ? Math.round(item.product.price * (1 - effectiveDiscount / 100))
                    : null;
                  return (
                    <motion.div key={item.product.id} layout className="glass-card p-4 flex gap-4">
                      <img src={item.product.image} alt={item.product.name} className="w-24 h-24 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-foreground truncate">{item.product.name}</h3>
                        <p className="text-xs text-muted-foreground">{item.product.category}</p>
                        {discountedPrice ? (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-primary font-bold">₹{discountedPrice}</span>
                            <span className="text-xs text-muted-foreground line-through">₹{item.product.price}</span>
                          </div>
                        ) : (
                          <p className="text-primary font-bold mt-1">₹{item.product.price}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <button onClick={() => removeFromCart(item.product.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 size={16} />
                        </button>
                        <div className="flex items-center border border-border rounded-full">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-2"><Minus size={12} /></button>
                          <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-2"><Plus size={12} /></button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* BxGy progress indicator */}
                {bxgyOffer && (
                  <div className="glass-card p-4 border border-green-200 dark:border-green-700/40 bg-green-50/50 dark:bg-green-900/10">
                    <div className="flex items-center gap-3">
                      <Gift size={18} className="text-green-600 dark:text-green-400 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-green-700 dark:text-green-300">
                          {bxgyOffer.title}
                        </p>
                        {bxgyFreeItems > 0 ? (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                            🎉 You get {bxgyFreeItems} free item{bxgyFreeItems > 1 ? 's' : ''}! Saving ₹{bxgySavingAmount}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Add {bxgyOffer.buyQty - (items.reduce((s, i) => s + i.quantity, 0) % bxgyOffer.buyQty || bxgyOffer.buyQty)} more item{bxgyOffer.buyQty > 1 ? 's' : ''} to get {bxgyOffer.getFreeQty} free
                          </p>
                        )}
                      </div>
                      <span className="text-xs font-black px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700 shrink-0">
                        Buy {bxgyOffer.buyQty} Get {bxgyOffer.getFreeQty}
                      </span>
                    </div>
                  </div>
                )}

                <button onClick={clearCart} className="text-sm text-muted-foreground hover:text-destructive transition-colors">
                  Clear Cart
                </button>
              </div>

              {/* Order Summary */}
              <div className="glass-card p-8 h-fit sticky top-28 space-y-5">
                <h3 className="font-display text-xl font-bold">Order Summary</h3>

                {/* BxGy banner */}
                {bxgyOffer && bxgyFreeItems > 0 && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/40">
                    <Gift size={15} className="text-green-600 dark:text-green-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-green-700 dark:text-green-300">
                        Buy {bxgyOffer.buyQty} Get {bxgyOffer.getFreeQty} Free Applied!
                      </p>
                      <p className="text-[11px] text-muted-foreground">{bxgyFreeItems} free item{bxgyFreeItems > 1 ? 's' : ''} — auto applied</p>
                    </div>
                  </div>
                )}

                {/* Coupon offer banner */}
                {activeCouponAmount > 0 && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700/40">
                    <Tag size={15} className="text-violet-600 dark:text-violet-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-violet-700 dark:text-violet-300">Offer Auto-Applied!</p>
                      <p className="text-[11px] text-muted-foreground">{activeCouponDiscount}% off — no code needed</p>
                    </div>
                  </div>
                )}

                {/* Welcome banner */}
                {welcomeDiscount > 0 && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20">
                    <Gift size={15} className="text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-primary">Welcome Offer Applied!</p>
                      <p className="text-[11px] text-muted-foreground">{welcomeDiscount}% off on your first order</p>
                    </div>
                  </div>
                )}

                {/* Manual coupon — only if no auto discounts */}
                {welcomeDiscount === 0 && activeCouponAmount === 0 && (
                  <div>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Tag size={14} className="text-primary" />
                          <span className="font-mono text-sm font-bold text-primary tracking-widest">{appliedCoupon.code}</span>
                          <span className="text-xs text-muted-foreground">applied</span>
                        </div>
                        <button onClick={removeCoupon} className="p-1 hover:bg-primary/10 rounded-full transition-colors">
                          <X size={14} className="text-primary" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text" placeholder="Coupon code"
                          value={couponInput}
                          onChange={e => setCouponInput(e.target.value.toUpperCase())}
                          onKeyDown={e => e.key === 'Enter' && handleApply()}
                          className="flex-1 px-3 py-2 border border-border rounded-lg text-sm font-mono tracking-widest focus:outline-none focus:border-primary bg-background text-foreground"
                        />
                        <button onClick={handleApply} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                          Apply
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Pricing breakdown */}
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{totalPrice.toFixed(2)}</span>
                  </div>

                  {bxgySavingAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400 font-semibold">
                      <span className="flex items-center gap-1"><Gift size={12} /> Buy {bxgyOffer?.buyQty} Get {bxgyOffer?.getFreeQty} Free</span>
                      <span>−₹{bxgySavingAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {activeCouponAmount > 0 && (
                    <div className="flex justify-between text-sm text-violet-600 dark:text-violet-400 font-semibold">
                      <span className="flex items-center gap-1"><Tag size={12} /> Offer {activeCouponDiscount}% OFF</span>
                      <span>−₹{activeCouponAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {welcomeDiscountAmount > 0 && (
                    <div className="flex justify-between text-sm text-primary font-semibold">
                      <span className="flex items-center gap-1"><Gift size={12} /> Welcome {welcomeDiscount}% OFF</span>
                      <span>−₹{welcomeDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-primary font-semibold">
                      <span>Coupon ({appliedCoupon?.code})</span>
                      <span>−₹{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
                  </div>

                  <div className="border-t border-border pt-2.5 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-primary text-lg">₹{(finalTotal + shipping).toFixed(2)}</span>
                  </div>

                  {totalSavings > 0 && (
                    <p className="text-xs text-primary/70 font-semibold text-center pt-1 bg-primary/5 rounded-lg py-2">
                      🎉 You save ₹{totalSavings.toFixed(2)} on this order!
                    </p>
                  )}
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-4 rounded-full gold-gradient text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  Proceed to Checkout
                </button>
                <Link to="/products" className="block text-center text-sm text-muted-foreground hover:text-primary transition-colors">
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Cart;
