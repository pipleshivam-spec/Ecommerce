import { useState, useEffect } from 'react';
import { hasWelcomeOffer, WELCOME_DISCOUNT } from '@/lib/offersStore';
import { Sparkles } from 'lucide-react';

const COLORS = [
  '#f59e0b','#8b5cf6','#ec4899','#10b981',
  '#3b82f6','#f97316','#06b6d4','#a855f7',
];

const WelcomeCelebration = () => {
  const [show, setShow] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const check = () => {
      try {
        const userRaw = localStorage.getItem('user');
        if (!userRaw) return;
        const user = JSON.parse(userRaw);
        const uid = String(user.id);
        if (hasWelcomeOffer(uid)) {
          setUserName(user.name?.split(' ')[0] || 'there');
          setShow(true);
          setTimeout(() => setShow(false), 5000);
        }
      } catch {}
    };
    check();
    window.addEventListener('storage', check);
    return () => window.removeEventListener('storage', check);
  }, []);

  if (!show) return null;

  const pieces = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: COLORS[i % COLORS.length],
    delay: Math.random() * 2,
    duration: 2.5 + Math.random() * 2,
    size: 4 + Math.random() * 7,
    shape: Math.random() > 0.5 ? '50%' : '3px',
    rotate: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 z-[99] pointer-events-none overflow-hidden">

      {/* Confetti */}
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute top-0 opacity-0"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.shape,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}

      {/* Elegant centered card */}
      <div
        className="absolute top-28 left-1/2"
        style={{ animation: 'celebIn 5s cubic-bezier(0.16,1,0.3,1) forwards' }}
      >
        <div className="relative bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden"
          style={{ minWidth: 340 }}>

          {/* Top gradient line */}
          <div className="h-0.5 w-full"
            style={{ background: 'linear-gradient(90deg,#7c3aed,#4f46e5,#0ea5e9,#10b981)' }} />

          <div className="px-8 py-6 text-center">
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
              <Sparkles size={26} className="text-white" />
            </div>

            {/* Text */}
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground mb-1">
              Welcome Gift
            </p>
            <h2 className="font-display text-2xl font-bold text-foreground mb-1">
              Hey {userName}! 🎉
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Your account is ready. Here's an exclusive gift for you.
            </p>

            {/* Discount pill */}
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-primary/8 border border-primary/20">
              <span className="font-display text-4xl font-black text-primary leading-none">
                {WELCOME_DISCOUNT}%
              </span>
              <div className="text-left">
                <p className="text-xs font-bold text-foreground leading-tight">OFF</p>
                <p className="text-[10px] text-muted-foreground leading-tight">First order · All products</p>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground mt-3">
              ✓ Auto-applied in cart &amp; checkout — no code needed
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes celebIn {
          0%   { opacity:0; transform:translateX(-50%) translateY(-24px) scale(0.94); }
          12%  { opacity:1; transform:translateX(-50%) translateY(0)      scale(1);    }
          80%  { opacity:1; transform:translateX(-50%) translateY(0)      scale(1);    }
          100% { opacity:0; transform:translateX(-50%) translateY(-12px)  scale(0.97); }
        }
      `}</style>
    </div>
  );
};

export default WelcomeCelebration;