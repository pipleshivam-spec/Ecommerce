import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/contexts/CartContext";
import { products } from "@/data/dynamicProducts";
import { toast } from "sonner";
import { Sparkles, ArrowRight, ArrowLeft, ShoppingBag, RotateCcw, CheckCircle } from "lucide-react";

// ── Quiz Questions ────────────────────────────────────────────────────────────

interface Option {
  label: string;
  emoji: string;
  tags: string[];
}

interface Question {
  id: number;
  question: string;
  subtitle: string;
  options: Option[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "What best describes your daily lifestyle?",
    subtitle: "Pick the one that fits you most",
    options: [
      { label: "Office & Meetings", emoji: "💼", tags: ["Formal Shirt", "Denim Jeans", "Leather Wallet", "Wrist Watch"] },
      { label: "Casual & Relaxed", emoji: "😎", tags: ["Hoodie", "MEN", "Polo T-Shirt", "Cap"] },
      { label: "Active & Sporty", emoji: "🏃", tags: ["Running Shoes", "Sports Jacket", "Backpack"] },
      { label: "Fashion Forward", emoji: "✨", tags: ["Jacket", "Sneakers Shoes", "Sunglasses", "Hand Bag"] },
    ],
  },
  {
    id: 2,
    question: "What's your go-to weekend outfit?",
    subtitle: "Be honest — what do you actually wear?",
    options: [
      { label: "Jeans & a clean shirt", emoji: "👕", tags: ["Denim Jeans", "Formal Shirt", "Polo T-Shirt", "Leather Wallet"] },
      { label: "Hoodie & sneakers", emoji: "👟", tags: ["Hoodie", "Sneakers Shoes", "Casual Shoes", "Cap"] },
      { label: "Jacket & boots", emoji: "🧥", tags: ["Jacket", "Sports Jacket", "Wrist Watch", "Sunglasses"] },
      { label: "Whatever's comfortable", emoji: "🛋️", tags: ["MEN", "Hoodie", "Running Shoes", "Backpack"] },
    ],
  },
  {
    id: 3,
    question: "How would you describe your style in one word?",
    subtitle: "Trust your gut",
    options: [
      { label: "Classic", emoji: "🎩", tags: ["Wrist Watch", "Leather Wallet", "Formal Shirt", "Brown Belt"] },
      { label: "Streetwear", emoji: "🔥", tags: ["Sneakers Shoes", "Cap", "Hoodie", "Backpack"] },
      { label: "Minimalist", emoji: "⬜", tags: ["MEN", "Denim Jeans", "Polo T-Shirt", "Leather Wallet"] },
      { label: "Luxury", emoji: "💎", tags: ["Wrist Watch", "Sunglasses", "Hand Bag", "Jacket"] },
    ],
  },
  {
    id: 4,
    question: "What's your budget range per item?",
    subtitle: "We'll match products accordingly",
    options: [
      { label: "Under ₹500", emoji: "💰", tags: ["MEN", "Cap", "Brown Belt"] },
      { label: "₹500 – ₹1,500", emoji: "💳", tags: ["Polo T-Shirt", "Hoodie", "Denim Jeans", "Leather Wallet", "Formal Shirt", "Backpack"] },
      { label: "₹1,500 – ₹3,000", emoji: "🏷️", tags: ["Jacket", "Running Shoes", "Sneakers Shoes", "Casual Shoes", "Sports Jacket", "Headphones"] },
      { label: "₹3,000+", emoji: "👑", tags: ["Wrist Watch", "Hand Bag", "Headphones", "Sunglasses"] },
    ],
  },
  {
    id: 5,
    question: "What occasion are you shopping for?",
    subtitle: "Pick your primary need",
    options: [
      { label: "Work & Professional", emoji: "🏢", tags: ["Formal Shirt", "Wrist Watch", "Leather Wallet", "Brown Belt", "Denim Jeans"] },
      { label: "Gym & Outdoors", emoji: "💪", tags: ["Running Shoes", "Sports Jacket", "Backpack", "Headphones"] },
      { label: "Everyday Casual", emoji: "☀️", tags: ["MEN", "Polo T-Shirt", "Casual Shoes", "Cap", "Hoodie"] },
      { label: "Special Events", emoji: "🎉", tags: ["Jacket", "Wrist Watch", "Sunglasses", "Hand Bag"] },
    ],
  },
];

// ── Scoring Logic ─────────────────────────────────────────────────────────────

const getRecommendations = (answers: number[]) => {
  const scoreMap: Record<string, number> = {};

  answers.forEach((answerIdx, qIdx) => {
    const tags = questions[qIdx].options[answerIdx].tags;
    tags.forEach((tag, i) => {
      // Higher weight for first tags in the list
      scoreMap[tag] = (scoreMap[tag] || 0) + (tags.length - i);
    });
  });

  // Map scores to actual products
  const scored = products.map(p => ({
    product: p,
    score: scoreMap[p.category] || 0,
  }));

  // Sort by score desc, take top 4
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(s => s.product);
};

// ── Style Profile Labels ──────────────────────────────────────────────────────

const getStyleProfile = (answers: number[]): { title: string; desc: string; emoji: string } => {
  const profiles = [
    { title: "The Urban Professional", desc: "Sharp, polished, and always put-together. You dress to impress and mean business.", emoji: "💼" },
    { title: "The Street Casual", desc: "Effortlessly cool with a laid-back vibe. Comfort meets style in everything you wear.", emoji: "😎" },
    { title: "The Active Achiever", desc: "Performance-driven and always on the move. Your wardrobe keeps up with your energy.", emoji: "🏃" },
    { title: "The Luxury Minimalist", desc: "Less is more. You invest in quality pieces that speak volumes without saying a word.", emoji: "💎" },
  ];
  // Pick profile based on most common answer index
  const counts = [0, 0, 0, 0];
  answers.forEach(a => counts[a]++);
  const dominant = counts.indexOf(Math.max(...counts));
  return profiles[dominant];
};

// ── Component ─────────────────────────────────────────────────────────────────

const StyleQuiz = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [step, setStep] = useState<"intro" | "quiz" | "result">("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState(products.slice(0, 4));
  const [profile, setProfile] = useState(getStyleProfile([]));

  const handleAnswer = (idx: number) => setSelected(idx);

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected];

    if (current < questions.length - 1) {
      setAnswers(newAnswers);
      setCurrent(current + 1);
      setSelected(null);
    } else {
      // Done — compute results
      const recs = getRecommendations(newAnswers);
      const prof = getStyleProfile(newAnswers);
      setRecommendations(recs.length >= 2 ? recs : products.slice(0, 4));
      setProfile(prof);
      setStep("result");
    }
  };

  const handleBack = () => {
    if (current === 0) { setStep("intro"); return; }
    setAnswers(answers.slice(0, -1));
    setCurrent(current - 1);
    setSelected(answers[current - 1] ?? null);
  };

  const handleRestart = () => {
    setStep("intro");
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
  };

  const handleAddToCart = (product: typeof products[0]) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const progress = ((current + (selected !== null ? 1 : 0)) / questions.length) * 100;

  // ── Intro Screen ──────────────────────────────────────────────────────────
  if (step === "intro") {
    return (
      <Layout>
        <section className="min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
          <div className="max-w-2xl w-full text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-semibold tracking-widest uppercase mb-8">
              <Sparkles size={12} />
              AI Style Finder
            </div>

            {/* Heading */}
            <h1 className="font-display text-5xl sm:text-6xl font-bold mb-6 leading-tight">
              Find Your
              <span className="text-primary block">Perfect Style</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-10 max-w-lg mx-auto leading-relaxed">
              Answer 5 quick questions and we'll curate a personalised collection from MAISON just for you.
            </p>

            {/* Steps preview */}
            <div className="grid grid-cols-3 gap-4 mb-10 max-w-md mx-auto">
              {[
                { icon: "🎯", label: "5 Questions" },
                { icon: "🤖", label: "AI Matching" },
                { icon: "🛍️", label: "Your Picks" },
              ].map(s => (
                <div key={s.label} className="glass-card p-4 text-center">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="text-xs font-semibold text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep("quiz")}
              className="inline-flex items-center gap-3 px-10 py-4 rounded-full gold-gradient text-primary-foreground font-bold text-base hover:opacity-90 transition-opacity shadow-lg"
            >
              Start the Quiz <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </Layout>
    );
  }

  // ── Quiz Screen ───────────────────────────────────────────────────────────
  if (step === "quiz") {
    const q = questions[current];
    return (
      <Layout>
        <section className="min-h-screen pt-24 pb-16 px-4">
          <div className="max-w-2xl mx-auto">

            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span className="font-medium">Question {current + 1} of {questions.length}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, background: "linear-gradient(90deg, var(--primary), #e8c96d)" }}
                />
              </div>
            </div>

            {/* Question card */}
            <div className="glass-card p-8 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
                <Sparkles size={10} /> Style Quiz
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">{q.question}</h2>
              <p className="text-muted-foreground text-sm mb-8">{q.subtitle}</p>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {q.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      selected === idx
                        ? "border-primary bg-primary/8 shadow-md scale-[1.02]"
                        : "border-border hover:border-primary/40 hover:bg-muted/30"
                    }`}
                  >
                    <span className="text-3xl shrink-0">{opt.emoji}</span>
                    <div className="flex-1">
                      <span className="font-semibold text-sm">{opt.label}</span>
                    </div>
                    {selected === idx && (
                      <CheckCircle size={18} className="text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-sm font-medium hover:bg-muted/30 transition-colors"
              >
                <ArrowLeft size={15} /> Back
              </button>
              <button
                onClick={handleNext}
                disabled={selected === null}
                className="flex items-center gap-2 px-8 py-2.5 rounded-full gold-gradient text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {current === questions.length - 1 ? "See My Results" : "Next"}
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  // ── Result Screen ─────────────────────────────────────────────────────────
  return (
    <Layout>
      <section className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Profile card */}
          <div className="glass-card p-8 mb-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5" style={{ background: "radial-gradient(circle at 50% 0%, var(--primary), transparent 70%)" }} />
            <div className="relative">
              <div className="text-5xl mb-4">{profile.emoji}</div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-3">
                <Sparkles size={10} /> Your Style Profile
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">{profile.title}</h2>
              <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">{profile.desc}</p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mb-8">
            <h3 className="font-display text-2xl font-bold mb-1">Curated For You</h3>
            <p className="text-muted-foreground text-sm mb-6">Based on your answers, we picked these just for you</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recommendations.map((product, i) => (
                <div key={product.id} className="glass-card overflow-hidden group hover:shadow-xl transition-all duration-300">
                  {/* Match badge */}
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold gold-gradient text-primary-foreground shadow">
                        #{i + 1} Match
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{product.category}</p>
                    <h4 className="font-semibold text-sm mb-1 line-clamp-1">{product.name}</h4>
                    <div className="flex items-center gap-1 mb-3">
                      <span className="text-yellow-500 text-xs">{"★".repeat(Math.round(product.rating))}</span>
                      <span className="text-xs text-muted-foreground">({product.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary text-base">₹{product.price.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg gold-gradient text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                      >
                        <ShoppingBag size={13} /> Add to Cart
                      </button>
                      <button
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="px-3 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted/30 transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRestart}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-border font-semibold text-sm hover:bg-muted/30 transition-colors"
            >
              <RotateCcw size={15} /> Retake Quiz
            </button>
            <button
              onClick={() => navigate("/products")}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full gold-gradient text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <ShoppingBag size={15} /> Browse All Products
            </button>
          </div>

        </div>
      </section>
    </Layout>
  );
};

export default StyleQuiz;
