import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { Product, products } from "@/data/dynamicProducts";
import { validateCoupon, calcDiscount, CouponOffer, hasWelcomeOffer, WELCOME_DISCOUNT, getActiveCoupon, getActiveBxGy, calcBxGyFreeItems, BxGyOffer } from "@/lib/offersStore";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  appliedCoupon: CouponOffer | null;
  couponDiscount: number;
  finalTotal: number;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  welcomeDiscount: number;
  welcomeDiscountAmount: number;
  activeCouponDiscount: number;
  activeCouponAmount: number;
  bxgyOffer: BxGyOffer | null;
  bxgyFreeItems: number;
  bxgySavingAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "maison_cart";

const loadCartFromStorage = (): CartItem[] => {
  try {
    const stored: CartItem[] = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    // Re-hydrate products from live data to ensure all fields are present
    return stored
      .map(item => {
        const liveProduct = products.find(p => p.id === item.product.id);
        if (!liveProduct) return null;
        return { product: liveProduct, quantity: item.quantity };
      })
      .filter(Boolean) as CartItem[];
  } catch { return []; }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(loadCartFromStorage);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponOffer | null>(null);
  const [welcomeDiscount, setWelcomeDiscount] = useState(0);
  const [activeCouponOffer, setActiveCouponOffer] = useState<CouponOffer | null>(null);
  const [bxgyOffer, setBxgyOffer] = useState<BxGyOffer | null>(null);

  const refreshWelcome = () => {
    try {
      const userRaw = localStorage.getItem("user");
      if (!userRaw) { setWelcomeDiscount(0); return; }
      const uid = String(JSON.parse(userRaw).id);
      setWelcomeDiscount(hasWelcomeOffer(uid) ? WELCOME_DISCOUNT : 0);
    } catch { setWelcomeDiscount(0); }
  };

  const refreshCoupon = () => setActiveCouponOffer(getActiveCoupon());
  const refreshBxGy  = () => setBxgyOffer(getActiveBxGy());

  useEffect(() => {
    refreshWelcome();
    refreshCoupon();
    refreshBxGy();

    // Auto-apply pending coupon from OfferNotification
    const pending = sessionStorage.getItem("pending_coupon");
    if (pending) {
      const coupon = validateCoupon(pending);
      if (coupon) setAppliedCoupon(coupon);
      sessionStorage.removeItem("pending_coupon");
    }

    const handler = (e: StorageEvent) => {
      if (e.key === "user" || e.key === "maison_welcome_offer" || e.key === "maison_welcome_used") refreshWelcome();
      if (e.key === "store_offers") refreshCoupon();
      if (e.key === "bxgy_offers") refreshBxGy();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // Persist cart to localStorage on every change
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: number) =>
    setItems(prev => prev.filter(i => i.product.id !== productId));

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) return removeFromCart(productId);
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    localStorage.removeItem(CART_KEY);
  };

  const applyCoupon = (code: string) => {
    const coupon = validateCoupon(code);
    if (!coupon) { toast.error("Invalid or expired coupon code"); return; }
    setAppliedCoupon(coupon);
    toast.success(`Coupon "${coupon.code}" applied! ${coupon.type === "percentage" ? `${coupon.discount}% off` : `₹${coupon.discount} off`}`);
  };

  const removeCoupon = () => { setAppliedCoupon(null); toast.info("Coupon removed"); };

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const totalQty   = totalItems;

  const couponDiscount       = appliedCoupon ? calcDiscount(appliedCoupon, totalPrice) : 0;
  const welcomeDiscountAmount = welcomeDiscount > 0 ? (totalPrice * welcomeDiscount) / 100 : 0;

  const activeCouponDiscount = !appliedCoupon && !welcomeDiscount && activeCouponOffer
    ? activeCouponOffer.type === "percentage" ? activeCouponOffer.discount : 0
    : 0;
  const activeCouponAmount = !appliedCoupon && !welcomeDiscount && activeCouponOffer
    ? activeCouponOffer.type === "percentage"
      ? (totalPrice * activeCouponOffer.discount) / 100
      : Math.min(activeCouponOffer.discount, totalPrice)
    : 0;

  const bxgyFreeItems    = bxgyOffer ? calcBxGyFreeItems(totalQty, bxgyOffer) : 0;
  const avgItemPrice     = totalQty > 0 ? totalPrice / totalQty : 0;
  const bxgySavingAmount = bxgyFreeItems > 0 ? Math.round(avgItemPrice * bxgyFreeItems) : 0;

  const finalTotal = Math.max(0, totalPrice - couponDiscount - welcomeDiscountAmount - activeCouponAmount - bxgySavingAmount);

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQuantity, clearCart,
      totalItems, totalPrice,
      appliedCoupon, couponDiscount, finalTotal, applyCoupon, removeCoupon,
      welcomeDiscount, welcomeDiscountAmount,
      activeCouponDiscount, activeCouponAmount,
      bxgyOffer, bxgyFreeItems, bxgySavingAmount,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
