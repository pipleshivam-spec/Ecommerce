import Layout from "@/components/layout/Layout";
import { Award, Target, Eye, CheckCircle } from "lucide-react";

const About = () => {
  const reasons = [
    "Premium materials sourced globally",
    "Expert craftsmanship in every stitch",
    "Modern designs with timeless appeal",
    "Personalized styling consultations",
    "Sustainable and ethical practices",
    "Complimentary alterations",
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/about-hero.jpg)" }}
        />
        <div className="absolute inset-0 bg-background/80" />
        <div className="relative container-main pt-20 text-center">
          <p className="text-primary text-sm font-medium tracking-[0.3em] uppercase mb-3">About Us</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold">Our Story</h1>
        </div>
      </section>

      {/* Introduction */}
      <section className="section-padding">
        <div className="container-main max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold mb-6">Crafting Excellence Since 2010</h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            MAISON was born from a simple belief: every man deserves access to exceptional clothing that makes him feel confident, powerful, and authentic. We combine heritage tailoring techniques with modern design to create menswear that transcends trends.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding bg-card/50">
        <div className="container-main grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-10">
            <Target className="text-primary mb-4" size={32} />
            <h3 className="font-display text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-muted-foreground leading-relaxed">
              To empower men worldwide with impeccably crafted clothing that blends timeless style with modern sensibility, making luxury accessible without compromise.
            </p>
          </div>
          <div className="glass-card p-10">
            <Eye className="text-primary mb-4" size={32} />
            <h3 className="font-display text-2xl font-bold mb-4">Our Vision</h3>
            <p className="text-muted-foreground leading-relaxed">
              To become the world's most trusted men's fashion house — known for exceptional quality, sustainable practices, and designs that inspire confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding">
        <div className="container-main grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-primary text-sm font-medium tracking-[0.3em] uppercase mb-2">Why MAISON</p>
            <h2 className="font-display text-3xl font-bold mb-8">Why Choose Us</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reasons.map((r) => (
                <div key={r} className="flex items-start gap-3">
                  <CheckCircle className="text-primary mt-0.5 shrink-0" size={18} />
                  <span className="text-sm text-muted-foreground">{r}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg overflow-hidden">
            <img
              src="/images/category-suits.jpg"
              alt="Premium tailoring"
              className="w-full h-[400px] object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
