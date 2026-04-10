import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Copy, Check, ArrowRight, Tag } from 'lucide-react';
import { hasWelcomeOffer, WELCOME_DISCOUNT } from '@/lib/offersStore';
import { toast } from 'sonner';

const WelcomeOfferPopup = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [userId, setUserId] = useState('');
  const [copied, setCopied] = useState(false);
  const CODE = 'WELCOME10';

  useEffect(() => {
    const check = () => {
      const userRaw = localStorage.getItem('user');
      if (!userRaw) return;
      try {
        const user = JSON.parse(userRaw);
        const uid = String(user.id);
        setUserId(uid);
        if (hasWelcomeOffer(uid)) {
          const t = setTimeout(() => setVisible(true), 1200);
          return () => clearTimeout(t);
        }
      } catch {}
    };
    check();
    window.addEventListener('storage', check);
    return () => window.removeEventListener('storage', check);
  }, []);

  const dismiss = () => setVisible(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(CODE);
    setCopied(true);
    toast.success('Code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shopNow = () => {
    sessionStorage.setItem('welcome_offer_active', userId);
    setVisible(false);
    navigate('/products');
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[95] w-80 pointer-events-auto"
      style={{ animation: 'slideUpFade 0.4s cubic-bezier(0.16,1,0.3,1) forwards' }}
    >
      <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">

        {/* Top accent bar */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #7c3aed, #4f46e5, #0ea5e9)' }} />

        {/* Content */}
        <div className="p-5">

          {/* Header row */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                <Tag size={16} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Welcome Gift</p>
                <p className="font-display text-sm font-bold text-foreground leading-tight">First Order Offer</p>
              </div>
            </div>
            <button
              onClick={dismiss}
              className="p-1 rounded-lg hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground -mt-0.5 -mr-0.5"
            >
              <X size={15} />
            </button>
          </div>

          {/* Discount display */}
          <div className="rounded-xl p-4 mb-4 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #7c3aed15, #4f46e510)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Exclusive discount</p>
                <p className="font-display text-3xl font-black text-foreground">
                  {WELCOME_DISCOUNT}
                  <span className="text-lg font-bold text-primary ml-0.5">% OFF</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">on your first purchase · all products</p>
              </div>
              <div className="text-5xl opacity-10 font-black text-primary select-none">%</div>
            </div>
          </div>

          {/* Coupon code */}
          <div className="flex items-center gap-2 bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 mb-4">
            <span className="flex-1 font-mono tracking-[0.2em] text-sm font-bold text-foreground">{CODE}</span>
            <button
              onClick={copyCode}
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {copied ? <><Check size={13} className="text-green-500" /><span className="text-green-500">Copied</span></> : <><Copy size={13} /><span>Copy</span></>}
            </button>
          </div>

          {/* Auto-applied note */}
          <p className="text-[11px] text-muted-foreground text-center mb-3">
            ✓ Auto-applied at checkout — no need to enter manually
          </p>

          {/* CTA */}
          <button
            onClick={shopNow}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            Shop Now & Save {WELCOME_DISCOUNT}%
            <ArrowRight size={15} />
          </button>

          <button
            onClick={dismiss}
            className="w-full mt-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Remind me later
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
};

export default WelcomeOfferPopup;
