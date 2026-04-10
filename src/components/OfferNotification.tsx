import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Copy, Check, ShoppingBag, Sparkles, Gift } from 'lucide-react';
import { getActiveCoupon, getSeenOffers, markOfferSeen, CouponOffer } from '@/lib/offersStore';
import { toast } from 'sonner';

// ── Confetti ──────────────────────────────────────────────────────────────────
const COLORS = ['#f59e0b', '#8b5cf6', '#ec4899', '#10b981', '#3b82f6', '#ef4444', '#f97316', '#06b6d4'];

interface Piece { id: number; x: number; color: string; delay: number; duration: number; size: number; shape: 'rect' | 'circle' }

const Confetti = () => {
  const pieces: Piece[] = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: COLORS[i % COLORS.length],
    delay: Math.random() * 2.5,
    duration: 2.2 + Math.random() * 1.8,
    size: 4 + Math.random() * 7,
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl z-0">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute top-0 opacity-0"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const OfferNotification = () => {
  const navigate = useNavigate();
  const [offer, setOffer] = useState<CouponOffer | null>(null);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const check = () => {
    const active = getActiveCoupon();
    if (!active) return;
    if (getSeenOffers().includes(active.id)) return;
    setOffer(active);
    timerRef.current = setTimeout(() => setVisible(true), 3000);
  };

  useEffect(() => {
    check();
    const handler = (e: StorageEvent) => {
      if (e.key === 'store_offers' || e.key === 'seen_offers') {
        if (timerRef.current) clearTimeout(timerRef.current);
        setVisible(false);
        setOffer(null);
        // Re-check after short delay
        setTimeout(check, 100);
      }
    };
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('storage', handler);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    if (offer) markOfferSeen(offer.id);
  };

  const copyCode = async () => {
    if (!offer) return;
    await navigator.clipboard.writeText(offer.code);
    setCopied(true);
    toast.success('Coupon code copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const applyAndShop = () => {
    if (!offer) return;
    markOfferSeen(offer.id);
    sessionStorage.setItem('pending_coupon', offer.code);
    setVisible(false);
    navigate('/products');
  };

  if (!visible || !offer) return null;

  const discountLabel = offer.type === 'percentage' ? `${offer.discount}%` : `₹${offer.discount}`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
        style={{ animation: 'fadeIn 0.2s ease forwards' }}
        onClick={dismiss}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[91] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto border border-border/50"
          style={{ animation: 'scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
        >
          <Confetti />

          {/* Close */}
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 z-20 p-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-colors text-white"
          >
            <X size={15} />
          </button>

          {/* Header gradient */}
          <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-6 pt-8 pb-10 text-white text-center z-10">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                <Gift size={30} className="text-yellow-300" />
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Sparkles size={14} className="text-yellow-300" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Exclusive Offer</span>
              <Sparkles size={14} className="text-yellow-300" />
            </div>
            <h2 className="text-2xl font-bold mb-1.5">{offer.title}</h2>
            <p className="text-sm text-white/70 leading-relaxed">{offer.description}</p>
          </div>

          {/* Discount card — shimmer */}
          <div className="px-6 -mt-5 relative z-20">
            <div className="relative overflow-hidden rounded-2xl shadow-xl"
              style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%)' }}
            >
              {/* Shimmer */}
              <div
                className="absolute inset-0 -translate-x-full"
                style={{
                  animation: 'shimmer 2.5s 0.5s infinite',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
                }}
              />
              <div className="relative px-6 py-4 text-center">
                <p className="text-[10px] font-bold text-yellow-900/70 uppercase tracking-[0.25em] mb-0.5">Your Discount</p>
                <p className="text-5xl font-black text-white drop-shadow-sm">
                  {discountLabel}
                  <span className="text-xl ml-1.5 font-bold">OFF</span>
                </p>
              </div>
            </div>
          </div>

          {/* Coupon code */}
          <div className="px-6 mt-4">
            <p className="text-[11px] text-muted-foreground text-center mb-2 font-medium">Apply at checkout</p>
            <div className="flex items-center gap-2 bg-secondary/50 border-2 border-dashed border-primary/30 rounded-xl px-4 py-3 group hover:border-primary/60 transition-colors">
              <span className="flex-1 font-mono tracking-[0.25em] text-lg font-bold text-primary text-center">
                {offer.code}
              </span>
              <button
                onClick={copyCode}
                className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-all text-primary active:scale-95"
                title="Copy code"
              >
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-5 space-y-2.5">
            <button
              onClick={applyAndShop}
              className="w-full py-3.5 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg hover:shadow-xl hover:opacity-95"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
            >
              <ShoppingBag size={17} className="text-white" />
              <span className="text-white">Apply &amp; Shop Now</span>
            </button>
            <button
              onClick={dismiss}
              className="w-full py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </>
  );
};

export default OfferNotification;
