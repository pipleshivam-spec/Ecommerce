import { useState, useEffect } from 'react';
import { Zap, Clock } from 'lucide-react';

interface Props {
  endsAt: string;
  compact?: boolean;
  discount?: number;
  label?: string;
}

function getTimeLeft(endsAt: string) {
  const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
  return {
    h: Math.floor(diff / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1_000),
    expired: diff === 0,
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

const FlashSaleTimer = ({ endsAt, compact = false, discount, label }: Props) => {
  const [time, setTime] = useState(() => getTimeLeft(endsAt));

  useEffect(() => {
    const t = getTimeLeft(endsAt);
    setTime(t);
    if (t.expired) return;
    const id = setInterval(() => {
      const next = getTimeLeft(endsAt);
      setTime(next);
      if (next.expired) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (time.expired) return null;

  // ── Compact badge (for product cards) ──────────────────────────────────────
  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm"
        style={{ background: 'linear-gradient(135deg, #dc2626, #ea580c)' }}
      >
        <Zap size={8} className="fill-white shrink-0" />
        {discount !== undefined && <span>{discount}% OFF</span>}
        <span className="opacity-80">·</span>
        <span className="font-mono">{pad(time.h)}:{pad(time.m)}:{pad(time.s)}</span>
      </span>
    );
  }

  // ── Full banner ─────────────────────────────────────────────────────────────
  return (
    <div
      className="relative overflow-hidden flex items-center gap-4 px-5 py-3.5 rounded-xl shadow-lg text-white"
      style={{ background: 'linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #f97316 100%)' }}
    >
      {/* Shimmer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
          animation: 'shimmer 3s infinite',
        }}
      />

      <div className="relative flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <Zap size={16} className="fill-white" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Flash Sale</p>
          {label && <p className="text-xs font-semibold leading-tight">{label}</p>}
        </div>
      </div>

      {discount !== undefined && (
        <div className="relative shrink-0 bg-white/20 rounded-lg px-3 py-1.5 text-center">
          <p className="text-xl font-black leading-none">{discount}%</p>
          <p className="text-[9px] font-bold uppercase tracking-widest opacity-80">OFF</p>
        </div>
      )}

      <div className="relative flex items-center gap-1 ml-auto">
        <Clock size={12} className="opacity-70 mr-1" />
        <span className="text-[10px] opacity-70 mr-1.5">Ends in</span>
        {[
          { val: time.h, label: 'HRS' },
          { val: time.m, label: 'MIN' },
          { val: time.s, label: 'SEC' },
        ].map(({ val, label: lbl }, i) => (
          <div key={lbl} className="flex items-center gap-1">
            {i > 0 && <span className="font-bold text-base opacity-60 -mt-1">:</span>}
            <div className="flex flex-col items-center bg-white/20 rounded-md px-2 py-1 min-w-[36px]">
              <span className="font-mono font-black text-lg leading-none">{pad(val)}</span>
              <span className="text-[8px] font-bold uppercase tracking-widest opacity-70">{lbl}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashSaleTimer;
