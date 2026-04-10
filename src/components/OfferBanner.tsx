import { useState, useEffect } from 'react';
import { X, Tag, Sparkles } from 'lucide-react';
import { getActiveCoupon, CouponOffer } from '@/lib/offersStore';

const DISMISSED_KEY = 'offer_banner_dismissed';

const OfferBanner = () => {
  const [offer, setOffer] = useState<CouponOffer | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  const load = () => {
    const isDismissed = sessionStorage.getItem(DISMISSED_KEY) === 'true';
    setDismissed(isDismissed);
    const active = getActiveCoupon();
    setOffer(active);
    if (active && !isDismissed) {
      setTimeout(() => setVisible(true), 100);
    } else {
      // No active offer — hide banner immediately
      setVisible(false);
    }
  };

  useEffect(() => {
    load();
    const handler = (e: StorageEvent) => { if (e.key === 'store_offers') load(); };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const dismiss = () => {
    setVisible(false);
    setTimeout(() => {
      sessionStorage.setItem(DISMISSED_KEY, 'true');
      setDismissed(true);
    }, 300);
  };

  if (!offer || dismissed) return null;

  return (
    <div
      className={`w-full relative overflow-hidden transition-all duration-300 ${
        visible ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0'
      }`}
      style={{
        background: 'linear-gradient(90deg, #7c3aed 0%, #6d28d9 25%, #4f46e5 50%, #6d28d9 75%, #7c3aed 100%)',
        backgroundSize: '200% 100%',
        animation: visible ? 'bannerShift 6s linear infinite' : 'none',
      }}
    >
      {/* Shimmer overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
          animation: 'shimmer 3s infinite',
        }}
      />

      <div className="relative flex items-center justify-center gap-2 sm:gap-3 px-10 py-2.5 text-white text-xs sm:text-sm">
        <Sparkles size={13} className="shrink-0 text-yellow-300 animate-pulse" />
        <span className="font-semibold tracking-wide">{offer.title}</span>
        <span className="hidden sm:inline opacity-60">·</span>
        <span className="hidden sm:inline opacity-75 text-xs">{offer.description}</span>

        {/* Code pill */}
        <span className="font-mono tracking-[0.2em] bg-white/15 border border-white/25 px-2.5 py-0.5 rounded text-[11px] font-bold backdrop-blur-sm">
          {offer.code}
        </span>

        {/* Discount badge */}
        <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
          {offer.type === 'percentage' ? `${offer.discount}% OFF` : `₹${offer.discount} OFF`}
        </span>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Dismiss offer"
        >
          <X size={13} />
        </button>
      </div>

      <style>{`
        @keyframes bannerShift {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </div>
  );
};

export default OfferBanner;
