import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { products } from "@/data/dynamicProducts";
import { toast } from "sonner";
import { Sparkles, ArrowRight, ArrowLeft, ShoppingBag, RotateCcw, CheckCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Quiz Data ─────────────────────────────────────────────────────────────────

interface Option { label: string; emoji: string; tags: string[]; }
interface Question { id: number; question: string; subtitle: string; options: Option[]; }

const questions: Question[] = [
  {
    id: 1,
    question: "What best describes your daily lifestyle?",
    subtitle: "Pick the one that fits you most",
    options: [
      { label: "Office & Meetings", emoji: "💼", tags: ["Formal Shirt", "Denim Jeans", "Leather Wallet", "Wrist Watch"] },
      { label: "Casual & Relaxed",  emoji: "😎", tags: ["Hoodie", "MEN", "Polo T-Shirt", "Cap"] },
      { label: "Active & Sporty",   emoji: "🏃", tags: ["Running Shoes", "Sports Jacket", "Backpack"] },
      { label: "Fashion Forward",   emoji: "✨", tags: ["Jacket", "Sneakers Shoes", "Sunglasses", "Hand Bag"] },
    ],
  },
  {
    id: 2,
    question: "What's your go-to weekend outfit?",
    subtitle: "Be honest — what do you actually wear?",
    options: [
      { label: "Jeans & a clean shirt", emoji: "👕", tags: ["Denim Jeans", "Formal Shirt", "Polo T-Shirt", "Leather Wallet"] },
      { label: "Hoodie & sneakers",     emoji: "👟", tags: ["Hoodie", "Sneakers Shoes", "Casual Shoes", "Cap"] },
      { label: "Jacket & boots",        emoji: "🧥", tags: ["Jacket", "Sports Jacket", "Wrist Watch", "Sunglasses"] },
      { label: "Whatever's comfy",      emoji: "🛋️", tags: ["MEN", "Hoodie", "Running Shoes", "Backpack"] },
    ],
  },
  {
    id: 3,
    question: "How would you describe your style?",
    subtitle: "Trust your gut",
    options: [
      { label: "Classic",     emoji: "🎩", tags: ["Wrist Watch", "Leather Wallet", "Formal Shirt", "Brown Belt"] },
      { label: "Streetwear",  emoji: "🔥", tags: ["Sneakers Shoes", "Cap", "Hoodie", "Backpack"] },
      { label: "Minimalist",  emoji: "⬜", tags: ["MEN", "Denim Jeans", "Polo T-Shirt", "Leather Wallet"] },
      { label: "Luxury",      emoji: "💎", tags: ["Wrist Watch", "Sunglasses", "Hand Bag", "Jacket"] },
    ],
  },
  {
    id: 4,
    question: "What's your budget per item?",
    subtitle: "We'll match products accordingly",
    options: [
      { label: "Under ₹500",       emoji: "💰", tags: ["MEN", "Cap", "Brown Belt"] },
      { label: "₹500 – ₹1,500",    emoji: "💳", tags: ["Polo T-Shirt", "Hoodie", "Denim Jeans", "Leather Wallet", "Formal Shirt", "Backpack"] },
      { label: "₹1,500 – ₹3,000",  emoji: "🏷️", tags: ["Jacket", "Running Shoes", "Sneakers Shoes", "Casual Shoes", "Sports Jacket", "Headphones"] },
      { label: "₹3,000+",          emoji: "👑", tags: ["Wrist Watch", "Hand Bag", "Headphones", "Sunglasses"] },
    ],
  },
  {
    id: 5,
    question: "What are you shopping for?",
    subtitle: "Pick your primary need",
    options: [
      { label: "Work & Professional", emoji: "🏢", tags: ["Formal Shirt", "Wrist Watch", "Leather Wallet", "Brown Belt", "Denim Jeans"] },
      { label: "Gym & Outdoors",      emoji: "💪", tags: ["Running Shoes", "Sports Jacket", "Backpack", "Headphones"] },
      { label: "Everyday Casual",     emoji: "☀️", tags: ["MEN", "Polo T-Shirt", "Casual Shoes", "Cap", "Hoodie"] },
      { label: "Special Events",      emoji: "🎉", tags: ["Jacket", "Wrist Watch", "Sunglasses", "Hand Bag"] },
    ],
  },
];

// ── Scoring ───────────────────────────────────────────────────────────────────

const getRecommendations = (answers: number[]) => {
  const scoreMap: Record<string, number> = {};
  answers.forEach((ansIdx, qIdx) => {
    questions[qIdx].options[ansIdx].tags.forEach((tag, i, arr) => {
      scoreMap[tag] = (scoreMap[tag] || 0) + (arr.length - i);
    });
  });
  return products
    .map(p => ({ product: p, score: scoreMap[p.category] || 0 }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(s => s.product);
};

const getStyleProfile = (answers: number[]) => {
  const profiles = [
    { title: "The Urban Professional", desc: "Sharp, polished, always put-together.", emoji: "💼" },
    { title: "The Street Casual",      desc: "Effortlessly cool with a laid-back vibe.", emoji: "😎" },
    { title: "The Active Achiever",    desc: "Performance-driven and always on the move.", emoji: "🏃" },
    { title: "The Luxury Minimalist",  desc: "Less is more. Quality over quantity.", emoji: "💎" },
  ];
  const counts = [0, 0, 0, 0];
  answers.forEach(a => counts[a]++);
  return profiles[counts.indexOf(Math.max(...counts))];
};

// ── Component ─────────────────────────────────────────────────────────────────

const QUIZ_SEEN_KEY = "maison_quiz_seen";

const StyleQuizPopup = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState<"intro" | "quiz" | "result">("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState(products.slice(0, 4));
  const [profile, setProfile] = useState(getStyleProfile([]));

  // Auto-show once after 5s if not seen before
  useEffect(() => {
    if (sessionStorage.getItem(QUIZ_SEEN_KEY)) return;
    const t = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(QUIZ_SEEN_KEY, "1");
    }, 5000);
    return () => clearTimeout(t);
  }, []);

  const close = () => setOpen(false);

  const reset = () => {
    setScreen("intro");
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
  };

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    if (current < questions.length - 1) {
      setAnswers(newAnswers);
      setCurrent(current + 1);
      setSelected(null);
    } else {
      const recs = getRecommendations(newAnswers);
      setRecommendations(recs.length >= 2 ? recs : products.slice(0, 4));
      setProfile(getStyleProfile(newAnswers));
      setScreen("result");
    }
  };

  const handleBack = () => {
    if (current === 0) { setScreen("intro"); return; }
    setAnswers(answers.slice(0, -1));
    setCurrent(current - 1);
    setSelected(answers[current - 1] ?? null);
  };

  const progress = ((current + (selected !== null ? 1 : 0)) / questions.length) * 100;

  return (
    <>
      {/* ── Floating Trigger Button ── */}
      <button
        onClick={() => { reset(); setOpen(true); }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl gold-gradient text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all hover:scale-105"
      >
        <Sparkles size={16} />
        Find My Style
      </button>

      {/* ── Modal ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto relative">

                {/* Close */}
                <button
                  onClick={close}
                  className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted/50 transition-colors z-10"
                >
                  <X size={18} className="text-muted-foreground" />
                </button>

                {/* ── Intro ── */}
                {screen === "intro" && (
                  <div className="p-8 text-center">
                    <div className="text-5xl mb-4">✨</div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-4">
                      <Sparkles size={10} /> AI Style Finder
                    </div>
                    <h2 className="font-display text-2xl font-bold mb-3">Find Your Perfect Style</h2>
                    <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                      Answer 5 quick questions and we'll curate a personalised MAISON collection just for you.
                    </p>
                    <div className="grid grid-cols-3 gap-3 mb-8">
                      {[{ icon: "🎯", label: "5 Questions" }, { icon: "🤖", label: "AI Matching" }, { icon: "🛍️", label: "Your Picks" }].map(s => (
                        <div key={s.label} className="bg-muted/30 rounded-xl p-3 text-center">
                          <div className="text-xl mb-1">{s.icon}</div>
                          <div className="text-xs font-semibold text-muted-foreground">{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setScreen("quiz")}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-full gold-gradient text-primary-foreground font-bold hover:opacity-90 transition-opacity"
                    >
                      Start the Quiz <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {/* ── Quiz ── */}
                {screen === "quiz" && (
                  <div className="p-6">
                    {/* Progress */}
                    <div className="mb-6">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                        <span>Question {current + 1} of {questions.length}</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress}%`, background: "linear-gradient(90deg, var(--primary), #e8c96d)" }}
                        />
                      </div>
                    </div>

                    <h3 className="font-display text-lg font-bold mb-1">{questions[current].question}</h3>
                    <p className="text-muted-foreground text-xs mb-5">{questions[current].subtitle}</p>

                    <div className="grid grid-cols-2 gap-2.5 mb-6">
                      {questions[current].options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelected(idx)}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200 ${
                            selected === idx
                              ? "border-primary bg-primary/8 scale-[1.02]"
                              : "border-border hover:border-primary/40 hover:bg-muted/20"
                          }`}
                        >
                          <span className="text-2xl shrink-0">{opt.emoji}</span>
                          <span className="text-sm font-medium leading-tight">{opt.label}</span>
                          {selected === idx && <CheckCircle size={14} className="text-primary ml-auto shrink-0" />}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleBack}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-border text-sm font-medium hover:bg-muted/30 transition-colors"
                      >
                        <ArrowLeft size={14} /> Back
                      </button>
                      <button
                        onClick={handleNext}
                        disabled={selected === null}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full gold-gradient text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {current === questions.length - 1 ? "See My Results" : "Next"}
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Result ── */}
                {screen === "result" && (
                  <div className="p-6">
                    {/* Profile */}
                    <div className="text-center mb-6 pb-6 border-b border-border">
                      <div className="text-4xl mb-3">{profile.emoji}</div>
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
                        <Sparkles size={10} /> Your Style Profile
                      </div>
                      <h3 className="font-display text-xl font-bold mb-1">{profile.title}</h3>
                      <p className="text-muted-foreground text-sm">{profile.desc}</p>
                    </div>

                    {/* Products */}
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Curated For You</p>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {recommendations.map((product, i) => (
                        <div key={product.id} className="border border-border rounded-xl overflow-hidden group hover:border-primary/40 transition-colors">
                          <div className="relative">
                            <img src={product.image} alt={product.name} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500" />
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold gold-gradient text-primary-foreground">
                              #{i + 1} Match
                            </span>
                          </div>
                          <div className="p-3">
                            <p className="text-xs font-semibold line-clamp-1 mb-1">{product.name}</p>
                            <p className="text-primary font-bold text-sm mb-2">₹{product.price.toLocaleString()}</p>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => { addToCart(product); toast.success(`${product.name} added!`); }}
                                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg gold-gradient text-primary-foreground text-xs font-semibold hover:opacity-90"
                              >
                                <ShoppingBag size={11} /> Add
                              </button>
                              <button
                                onClick={() => { close(); navigate(`/product/${product.id}`); }}
                                className="px-2.5 py-1.5 rounded-lg border border-border text-xs hover:bg-muted/30 transition-colors"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={reset}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-border text-sm font-medium hover:bg-muted/30 transition-colors"
                      >
                        <RotateCcw size={13} /> Retake
                      </button>
                      <button
                        onClick={() => { close(); navigate("/products"); }}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full gold-gradient text-primary-foreground font-semibold text-sm hover:opacity-90"
                      >
                        <ShoppingBag size={14} /> Browse All
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default StyleQuizPopup;
