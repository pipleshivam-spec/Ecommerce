import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import OfferBanner from "@/components/OfferBanner";
import OfferNotification from "@/components/OfferNotification";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <OfferBanner />
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
    <OfferNotification />
  </div>
);

export default Layout;
