import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import OfferBanner from "@/components/OfferBanner";
import OfferNotification from "@/components/OfferNotification";
import StyleQuizPopup from "@/components/StyleQuizPopup";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

const Layout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      <OfferBanner />
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          className="flex-1"
          initial={{ opacity: 0, y: -60, clipPath: "inset(0 0 100% 0)" }}
          animate={{ opacity: 1, y: 0,  clipPath: "inset(0 0 0% 0)" }}
          exit={{    opacity: 0, y: 20, clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
      <OfferNotification />
      <StyleQuizPopup />
    </div>
  );
};

export default Layout;
