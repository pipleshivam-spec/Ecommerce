// ── Types ────────────────────────────────────────────────────────────────────

export interface CouponOffer {
  id: string;
  title: string;
  description: string;
  code: string;
  discount: number;
  type: 'percentage' | 'flat';
  active: boolean;
  isDraft: boolean;
  createdAt: string;
}

export interface FlashSale {
  id: string;
  label: string;
  discount: number;
  endsAt: string;
  active: boolean;
  isDraft: boolean;
}

export interface BxGyOffer {
  id: string;
  title: string;
  buyQty: number;
  getFreeQty: number;
  active: boolean;
  isDraft: boolean;
}

// ── Keys ─────────────────────────────────────────────────────────────────────

const KEYS = {
  coupons: 'store_offers',
  flash: 'flash_sales',
  bxgy: 'bxgy_offers',
  seen: 'seen_offers',
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function read<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}

function write<T>(key: string, data: T[]): void {
  const json = JSON.stringify(data);
  localStorage.setItem(key, json);
  sessionStorage.setItem(key, json);
  // Notify all components listening to storage changes
  window.dispatchEvent(new StorageEvent('storage', { key, newValue: json }));
}

function uid(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ── Coupon Offers ─────────────────────────────────────────────────────────────

export const getCoupons = (): CouponOffer[] => read<CouponOffer>(KEYS.coupons);

export const saveCoupon = (data: Omit<CouponOffer, 'id' | 'createdAt'>): CouponOffer => {
  const coupons = getCoupons();
  const offer: CouponOffer = { ...data, id: uid(), createdAt: new Date().toISOString() };
  write(KEYS.coupons, [...coupons, offer]);
  return offer;
};

export const updateCoupon = (id: string, patch: Partial<CouponOffer>): void => {
  write(KEYS.coupons, getCoupons().map(c => c.id === id ? { ...c, ...patch } : c));
};

export const deleteCoupon = (id: string): void => {
  write(KEYS.coupons, getCoupons().filter(c => c.id !== id));
};

export const publishCoupon = (id: string): void => {
  updateCoupon(id, { isDraft: false, active: true });
  // Clear seen so users see the notification again
  clearSeenOffers();
};

export const stopCoupon = (id: string): void => {
  updateCoupon(id, { active: false });
};

export const renotifyCoupon = (): void => {
  clearSeenOffers();
};

export const getActiveCoupon = (): CouponOffer | null => {
  return getCoupons().find(c => c.active && !c.isDraft) ?? null;
};

// ── Flash Sales ───────────────────────────────────────────────────────────────

export const getFlashSales = (): FlashSale[] => read<FlashSale>(KEYS.flash);

export const saveFlashSale = (data: { label: string; discount: number; hours: number; isDraft?: boolean }): FlashSale => {
  const sales = getFlashSales();
  const sale: FlashSale = {
    id: uid(),
    label: data.label,
    discount: data.discount,
    endsAt: new Date(Date.now() + data.hours * 3_600_000).toISOString(),
    active: !data.isDraft,
    isDraft: data.isDraft ?? false,
  };
  write(KEYS.flash, [...sales, sale]);
  return sale;
};

export const updateFlashSale = (id: string, patch: Partial<FlashSale>): void => {
  write(KEYS.flash, getFlashSales().map(s => s.id === id ? { ...s, ...patch } : s));
};

export const publishFlashSale = (id: string): void => {
  updateFlashSale(id, { isDraft: false, active: true });
};

export const renotifyFlashSale = (): void => {
  // dispatch storage event so components re-render
  window.dispatchEvent(new StorageEvent('storage', { key: KEYS.flash }));
};

export const deleteFlashSale = (id: string): void => {
  write(KEYS.flash, getFlashSales().filter(s => s.id !== id));
};

export const stopFlashSale = (id: string): void => {
  write(KEYS.flash, getFlashSales().map(s => s.id === id ? { ...s, active: false } : s));
};

export const getActiveFlashSale = (): FlashSale | null => {
  const now = Date.now();
  return getFlashSales().find(s => s.active && new Date(s.endsAt).getTime() > now) ?? null;
};

// ── BxGy Offers ───────────────────────────────────────────────────────────────

export const getBxGyOffers = (): BxGyOffer[] => read<BxGyOffer>(KEYS.bxgy);

export const saveBxGyOffer = (data: Omit<BxGyOffer, 'id'>): BxGyOffer => {
  const offer: BxGyOffer = { ...data, id: uid() };
  write(KEYS.bxgy, [...getBxGyOffers(), offer]);
  return offer;
};

export const publishBxGy = (id: string): void => {
  write(KEYS.bxgy, getBxGyOffers().map(o => o.id === id ? { ...o, isDraft: false, active: true } : o));
};

export const renotifyBxGy = (): void => {
  window.dispatchEvent(new StorageEvent('storage', { key: KEYS.bxgy }));
};

export const getActiveBxGy = (): BxGyOffer | null =>
  getBxGyOffers().find(o => o.active && !o.isDraft) ?? null;

export const calcBxGyFreeItems = (totalQty: number, offer: BxGyOffer): number => {
  const sets = Math.floor(totalQty / offer.buyQty);
  return sets * offer.getFreeQty;
};

export const toggleBxGy = (id: string): void => {
  write(KEYS.bxgy, getBxGyOffers().map(o => o.id === id ? { ...o, active: !o.active } : o));
};

export const deleteBxGy = (id: string): void => {
  write(KEYS.bxgy, getBxGyOffers().filter(o => o.id !== id));
};

// ── Seen Offers ───────────────────────────────────────────────────────────────

export const getSeenOffers = (): string[] => {
  try { return JSON.parse(localStorage.getItem(KEYS.seen) || '[]'); } catch { return []; }
};

export const markOfferSeen = (id: string): void => {
  const seen = getSeenOffers();
  if (!seen.includes(id)) {
    localStorage.setItem(KEYS.seen, JSON.stringify([...seen, id]));
  }
};

export const clearSeenOffers = (): void => {
  localStorage.removeItem(KEYS.seen);
};

// ── Coupon Validation ─────────────────────────────────────────────────────────

export const validateCoupon = (code: string): CouponOffer | null => {
  const upper = code.trim().toUpperCase();
  return getCoupons().find(c => c.code === upper && c.active && !c.isDraft) ?? null;
};

export const calcDiscount = (coupon: CouponOffer, subtotal: number): number => {
  if (coupon.type === 'percentage') return (subtotal * coupon.discount) / 100;
  return Math.min(coupon.discount, subtotal);
};

// ── Welcome Offer (First Purchase 10% Discount) ───────────────────────────────

const WELCOME_KEY = 'maison_welcome_offer';
const WELCOME_USED_KEY = 'maison_welcome_used';

export const setWelcomeOffer = (userId: string): void => {
  localStorage.setItem(WELCOME_KEY, userId);
};

export const hasWelcomeOffer = (userId: string): boolean => {
  return localStorage.getItem(WELCOME_KEY) === userId &&
    localStorage.getItem(WELCOME_USED_KEY) !== userId;
};

export const consumeWelcomeOffer = (userId: string): void => {
  localStorage.setItem(WELCOME_USED_KEY, userId);
  localStorage.removeItem(WELCOME_KEY);
};

export const WELCOME_DISCOUNT = 10; // 10%
