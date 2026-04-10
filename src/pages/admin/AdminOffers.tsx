import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Trash2, Bell, BellOff, Send, Zap, Tag, Gift, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  getCoupons, saveCoupon, deleteCoupon, publishCoupon, stopCoupon, renotifyCoupon,
  getFlashSales, saveFlashSale, deleteFlashSale, stopFlashSale, publishFlashSale, renotifyFlashSale, updateFlashSale,
  getBxGyOffers, saveBxGyOffer, toggleBxGy, deleteBxGy, publishBxGy, renotifyBxGy,
  CouponOffer, FlashSale, BxGyOffer,
} from '@/lib/offersStore';

// ── Shared Modal ──────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h3 className="font-bold text-lg text-foreground">{title}</h3>
        <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
          <X size={18} />
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary bg-background text-foreground placeholder:text-muted-foreground transition-colors";

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ label, color }: { label: string; color: 'green' | 'yellow' | 'gray' | 'red' }) => {
  const cls = {
    green:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    gray:   'bg-secondary text-muted-foreground',
    red:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }[color];
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{label}</span>;
};

// ── Tab: Coupon Offers ────────────────────────────────────────────────────────
const CouponTab = () => {
  const [coupons, setCoupons] = useState<CouponOffer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', code: '', discount: '', type: 'percentage' as 'percentage' | 'flat' });

  const reload = () => setCoupons(getCoupons());
  useEffect(() => {
    reload();
    const h = (e: StorageEvent) => { if (e.key === 'store_offers') reload(); };
    window.addEventListener('storage', h);
    return () => window.removeEventListener('storage', h);
  }, []);

  const handleSave = (isDraft: boolean) => {
    if (!form.title || !form.code || !form.discount) { toast.error('Fill all required fields'); return; }
    saveCoupon({
      title: form.title,
      description: form.description,
      code: form.code.toUpperCase(),
      discount: Number(form.discount),
      type: form.type,
      active: !isDraft,
      isDraft,
    });
    if (!isDraft) {
      // Clear dismissed flag so users see the banner again
      sessionStorage.removeItem('offer_banner_dismissed');
    }
    toast.success(isDraft ? 'Saved as draft' : 'Offer published & users notified!');
    setShowModal(false);
    setForm({ title: '', description: '', code: '', discount: '', type: 'percentage' });
    reload();
  };

  const couponStatus = (c: CouponOffer): { label: string; color: 'green' | 'yellow' | 'gray' } => {
    if (c.isDraft) return { label: 'Draft', color: 'yellow' };
    if (c.active)  return { label: 'Live',  color: 'green' };
    return { label: 'Stopped', color: 'gray' };
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Create coupon codes that customers can apply at checkout.</p>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors">
          <Plus size={16} /> New Coupon
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-secondary/30">
              {['Offer', 'Code', 'Discount', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                <Tag size={32} className="mx-auto mb-2 opacity-30" />
                <p>No coupons yet. Create your first one!</p>
              </td></tr>
            ) : coupons.map(c => {
              const st = couponStatus(c);
              return (
                <tr key={c.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-foreground">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.description}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono tracking-widest text-xs bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-2.5 py-1 rounded-md font-bold">
                      {c.code}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-foreground">
                    {c.type === 'percentage' ? `${c.discount}%` : `₹${c.discount}`}
                  </td>
                  <td className="px-5 py-4"><StatusBadge label={st.label} color={st.color} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 flex-wrap">

                      {/* DRAFT → Publish & Notify */}
                      {c.isDraft && (
                        <button onClick={() => { publishCoupon(c.id); sessionStorage.removeItem('offer_banner_dismissed'); reload(); toast.success('Published & users notified!'); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-semibold hover:bg-green-200 transition-colors">
                          <Send size={12} /> Publish &amp; Notify
                        </button>
                      )}

                      {/* LIVE → Stop + Re-notify */}
                      {c.active && !c.isDraft && (
                        <>
                          <button onClick={() => { stopCoupon(c.id); reload(); toast.success('Offer stopped — removed from user view'); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg text-xs font-semibold hover:bg-orange-200 transition-colors">
                            <BellOff size={12} /> Stop
                          </button>
                          <button onClick={() => { renotifyCoupon(); sessionStorage.removeItem('offer_banner_dismissed'); toast.success('Re-notified! Users will see it again'); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors">
                            <Bell size={12} /> Re-notify
                          </button>
                        </>
                      )}

                      {/* STOPPED → Re-publish + Notify */}
                      {!c.active && !c.isDraft && (
                        <>
                          <button onClick={() => { publishCoupon(c.id); sessionStorage.removeItem('offer_banner_dismissed'); reload(); toast.success('Re-published & users notified!'); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-semibold hover:bg-green-200 transition-colors">
                            <Send size={12} /> Re-publish
                          </button>
                          <button onClick={() => { renotifyCoupon(); sessionStorage.removeItem('offer_banner_dismissed'); toast.success('Users notified!'); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors">
                            <Bell size={12} /> Notify
                          </button>
                        </>
                      )}

                      {/* Always → Delete */}
                      <button onClick={() => { deleteCoupon(c.id); reload(); toast.success('Deleted'); }}
                        className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title="New Coupon Offer" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <Field label="Title *">
              <input className={inputCls} placeholder="e.g. Summer Sale" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Description">
              <input className={inputCls} placeholder="Short description for users" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </Field>
            <Field label="Coupon Code *">
              <input className={`${inputCls} font-mono tracking-widest uppercase`} placeholder="SAVE20" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Discount *">
                <input type="number" className={inputCls} placeholder="20" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} />
              </Field>
              <Field label="Type">
                <select className={inputCls} value={form.type} onChange={e => setForm({ ...form, type: e.target.value as 'percentage' | 'flat' })}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat (₹)</option>
                </select>
              </Field>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => handleSave(true)} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors text-foreground">
                Save as Draft
              </button>
              <button onClick={() => handleSave(false)} className="flex-1 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors">
                Save &amp; Notify Users
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── Tab: Flash Sales ──────────────────────────────────────────────────────────
const FlashTab = () => {
  const [sales, setSales] = useState<FlashSale[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ label: '', discount: '', hours: '' });

  const reload = () => setSales(getFlashSales());
  useEffect(() => {
    reload();
    const h = (e: StorageEvent) => { if (e.key === 'flash_sales') reload(); };
    window.addEventListener('storage', h);
    return () => window.removeEventListener('storage', h);
  }, []);

  const handleSave = (isDraft: boolean) => {
    if (!form.label || !form.discount || !form.hours) { toast.error('Fill all fields'); return; }
    saveFlashSale({ label: form.label, discount: Number(form.discount), hours: Number(form.hours), isDraft });
    toast.success(isDraft ? 'Saved as draft' : 'Flash sale started & users notified!');
    setShowModal(false);
    setForm({ label: '', discount: '', hours: '' });
    reload();
  };

  const saleStatus = (s: FlashSale): { label: string; color: 'red' | 'yellow' | 'gray' } => {
    if (s.isDraft) return { label: 'Draft', color: 'yellow' };
    if (!s.active) return { label: 'Stopped', color: 'gray' };
    if (new Date(s.endsAt).getTime() < Date.now()) return { label: 'Expired', color: 'gray' };
    return { label: 'Live', color: 'red' };
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Flash sales show a live countdown timer on product cards and detail pages.</p>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
          <Plus size={16} /> New Flash Sale
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-secondary/30">
              {['Label', 'Discount', 'Ends At', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                <Zap size={32} className="mx-auto mb-2 opacity-30" />
                <p>No flash sales yet.</p>
              </td></tr>
            ) : sales.map(s => {
              const st = saleStatus(s);
              const isLive = s.active && !s.isDraft && new Date(s.endsAt).getTime() > Date.now();
              const isStopped = !s.active && !s.isDraft;
              return (
                <tr key={s.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-4 font-medium text-foreground">{s.label}</td>
                  <td className="px-5 py-4"><span className="font-bold text-red-500">{s.discount}% OFF</span></td>
                  <td className="px-5 py-4 text-muted-foreground text-xs">{s.isDraft ? '—' : new Date(s.endsAt).toLocaleString('en-IN')}</td>
                  <td className="px-5 py-4"><StatusBadge label={st.label} color={st.color} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 flex-wrap">

                      {/* DRAFT → Publish & Notify */}
                      {s.isDraft && (
                        <button onClick={() => { publishFlashSale(s.id); reload(); toast.success('Flash sale started & users notified!'); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-semibold hover:bg-green-200 transition-colors">
                          <Send size={12} /> Publish &amp; Notify
                        </button>
                      )}

                      {/* LIVE → Stop + Re-notify */}
                      {isLive && (
                        <>
                          <button onClick={() => { stopFlashSale(s.id); reload(); toast.success('Flash sale stopped'); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg text-xs font-semibold hover:bg-orange-200 transition-colors">
                            <BellOff size={12} /> Stop
                          </button>
                          <button onClick={() => { renotifyFlashSale(); toast.success('Re-notified!'); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors">
                            <Bell size={12} /> Re-notify
                          </button>
                        </>
                      )}

                      {/* STOPPED → Re-publish + Notify */}
                      {isStopped && (
                        <>
                          <button onClick={() => { publishFlashSale(s.id); reload(); toast.success('Flash sale re-started & users notified!'); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-semibold hover:bg-green-200 transition-colors">
                            <Send size={12} /> Re-publish
                          </button>
                          <button onClick={() => { renotifyFlashSale(); toast.success('Users notified!'); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors">
                            <Bell size={12} /> Notify
                          </button>
                        </>
                      )}

                      {/* Always → Delete */}
                      <button onClick={() => { deleteFlashSale(s.id); reload(); toast.success('Deleted'); }}
                        className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title="New Flash Sale" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <Field label="Label *">
              <input className={inputCls} placeholder="e.g. Weekend Mega Sale" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Discount % *">
                <input type="number" className={inputCls} placeholder="30" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} />
              </Field>
              <Field label="Duration (hours) *">
                <input type="number" className={inputCls} placeholder="24" value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} />
              </Field>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => handleSave(true)} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors text-foreground">
                Save as Draft
              </button>
              <button onClick={() => handleSave(false)} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                Start &amp; Notify Users
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── Tab: Buy X Get Y ──────────────────────────────────────────────────────────
const BxGyTab = () => {
  const [offers, setOffers] = useState<BxGyOffer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', buyQty: '', getFreeQty: '' });

  const reload = () => setOffers(getBxGyOffers());
  useEffect(() => {
    reload();
    const h = (e: StorageEvent) => { if (e.key === 'bxgy_offers') reload(); };
    window.addEventListener('storage', h);
    return () => window.removeEventListener('storage', h);
  }, []);

  const handleSave = (isDraft: boolean) => {
    if (!form.title || !form.buyQty || !form.getFreeQty) { toast.error('Fill all fields'); return; }
    saveBxGyOffer({ title: form.title, buyQty: Number(form.buyQty), getFreeQty: Number(form.getFreeQty), active: !isDraft, isDraft });
    toast.success(isDraft ? 'Saved as draft' : 'Deal created & users notified!');
    setShowModal(false);
    setForm({ title: '', buyQty: '', getFreeQty: '' });
    reload();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Buy X Get Y deals are applied automatically at checkout when conditions are met.</p>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
          <Plus size={16} /> New Deal
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-secondary/30">
              {['Deal Title', 'Rule', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {offers.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-muted-foreground">
                <Gift size={32} className="mx-auto mb-2 opacity-30" />
                <p>No deals yet.</p>
              </td></tr>
            ) : offers.map(o => (
              <tr key={o.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                <td className="px-5 py-4 font-medium text-foreground">{o.title}</td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-xs font-semibold">
                    <Gift size={12} /> Buy {o.buyQty} Get {o.getFreeQty} Free
                  </span>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge
                    label={o.isDraft ? 'Draft' : o.active ? 'Active' : 'Stopped'}
                    color={o.isDraft ? 'yellow' : o.active ? 'green' : 'gray'}
                  />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 flex-wrap">

                    {/* DRAFT → Publish & Notify */}
                    {o.isDraft && (
                      <button onClick={() => { publishBxGy(o.id); reload(); toast.success('Deal published & users notified!'); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-semibold hover:bg-green-200 transition-colors">
                        <Send size={12} /> Publish &amp; Notify
                      </button>
                    )}

                    {/* ACTIVE → Stop + Re-notify */}
                    {o.active && !o.isDraft && (
                      <>
                        <button onClick={() => { toggleBxGy(o.id); reload(); toast.success('Deal stopped'); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg text-xs font-semibold hover:bg-orange-200 transition-colors">
                          <BellOff size={12} /> Stop
                        </button>
                        <button onClick={() => { renotifyBxGy(); toast.success('Re-notified!'); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors">
                          <Bell size={12} /> Re-notify
                        </button>
                      </>
                    )}

                    {/* STOPPED → Re-publish + Notify */}
                    {!o.active && !o.isDraft && (
                      <>
                        <button onClick={() => { publishBxGy(o.id); reload(); toast.success('Deal re-published & users notified!'); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-semibold hover:bg-green-200 transition-colors">
                          <Send size={12} /> Re-publish
                        </button>
                        <button onClick={() => { renotifyBxGy(); toast.success('Users notified!'); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors">
                          <Bell size={12} /> Notify
                        </button>
                      </>
                    )}

                    {/* Always → Delete */}
                    <button onClick={() => { deleteBxGy(o.id); reload(); toast.success('Deleted'); }}
                      className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title="New Buy X Get Y Deal" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <Field label="Deal Title *">
              <input className={inputCls} placeholder="e.g. Buy 2 Get 1 Free on T-Shirts" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Buy Quantity *">
                <input type="number" className={inputCls} placeholder="2" value={form.buyQty} onChange={e => setForm({ ...form, buyQty: e.target.value })} />
              </Field>
              <Field label="Get Free Quantity *">
                <input type="number" className={inputCls} placeholder="1" value={form.getFreeQty} onChange={e => setForm({ ...form, getFreeQty: e.target.value })} />
              </Field>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => handleSave(true)} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors text-foreground">
                Save as Draft
              </button>
              <button onClick={() => handleSave(false)} className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                Create &amp; Notify Users
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
type Tab = 'coupons' | 'flash' | 'bxgy';

const AdminOffers = () => {
  const [tab, setTab] = useState<Tab>('coupons');

  const tabs: { id: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'coupons', label: 'Coupon Offers', icon: <Tag size={16} />,  color: 'text-violet-500' },
    { id: 'flash',   label: 'Flash Sales',   icon: <Zap size={16} />,  color: 'text-red-500'    },
    { id: 'bxgy',    label: 'Buy X Get Y',   icon: <Gift size={16} />, color: 'text-green-500'  },
  ];

  return (
    <AdminLayout title="Offers & Promotions">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-secondary p-1 rounded-xl w-fit">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-card shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className={tab === t.id ? t.color : ''}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'coupons' && <CouponTab />}
        {tab === 'flash'   && <FlashTab />}
        {tab === 'bxgy'    && <BxGyTab />}
      </div>
    </AdminLayout>
  );
};

export default AdminOffers;
