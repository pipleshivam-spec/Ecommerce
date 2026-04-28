import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

(() => {
  try {
    const SEED_KEY = "maison_seeded_v5";
    if (localStorage.getItem(SEED_KEY)) return;

    // ── 1. Seed users into maison_users (the correct key) ──────────────────
    const existingUsers: any[] = JSON.parse(localStorage.getItem("maison_users") || "[]");
    const byEmail = new Map(existingUsers.map((u: any) => [u.email, u]));

    const defaultUsers = [
      {
        id: "admin_1",
        name: "Admin",
        email: "admin@maison.com",
        password: "Admin@123",
        phone: "+91 98765 43210",
        role: "admin",
        is_active: true,
        created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
      },
      {
        id: "user_demo_1",
        name: "Rahul Sharma",
        email: "rahul@example.com",
        password: "demo123",
        phone: "+91 91234 56789",
        role: "customer",
        is_active: true,
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        id: "user_demo_2",
        name: "Priya Patel",
        email: "priya@example.com",
        password: "demo123",
        phone: "+91 98765 11111",
        role: "customer",
        is_active: true,
        created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      },
      {
        id: "user_demo_3",
        name: "Amit Kumar",
        email: "amit@example.com",
        password: "demo123",
        phone: "+91 87654 32109",
        role: "customer",
        is_active: true,
        created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
    ];

    defaultUsers.forEach(u => { if (!byEmail.has(u.email)) byEmail.set(u.email, u); });
    localStorage.setItem("maison_users", JSON.stringify(Array.from(byEmail.values())));

    // ── 2. Seed demo orders ────────────────────────────────────────────────
    if (!localStorage.getItem("ecom_orders") || JSON.parse(localStorage.getItem("ecom_orders") || "[]").length === 0) {
      localStorage.setItem("ecom_orders", JSON.stringify([
        {
          id: "ord_demo_1",
          order_number: "ORD1001",
          user_id: "user_demo_1",
          user_name: "Rahul Sharma",
          user_email: "rahul@example.com",
          items: [{ product_id: 12, product_name: "Signature T-Shirt", product_image: "/MEN/lucid-origin_Professional_ecommerce_product_image_of_a_black_men_s_t-shirt._Minimal_backgroun-0.jpg", quantity: 2, price: 499, total: 998 }],
          subtotal: 998, shipping_amount: 0, tax_amount: 179.64, total_amount: 1177.64,
          status: "delivered", payment_status: "paid", payment_method: "upi",
          shipping_name: "Rahul Sharma", shipping_phone: "+91 91234 56789",
          shipping_address_line1: "123 MG Road", shipping_city: "Mumbai",
          shipping_state: "Maharashtra", shipping_postal_code: "400001", shipping_country: "India",
          created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
          updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
        },
        {
          id: "ord_demo_2",
          order_number: "ORD1002",
          user_id: "user_demo_2",
          user_name: "Priya Patel",
          user_email: "priya@example.com",
          items: [{ product_id: 6, product_name: "Formal Dress Shirt", product_image: "/Formal Shirt/a-professional-ecommerce-product-photogr_Mj4YVMjLS5GED-q1vP8qDA_clUoQur1RzGJjZXZB-42Zg_cover.jpeg", quantity: 1, price: 999, total: 999 }],
          subtotal: 999, shipping_amount: 0, tax_amount: 179.82, total_amount: 1178.82,
          status: "shipped", payment_status: "paid", payment_method: "card",
          shipping_name: "Priya Patel", shipping_phone: "+91 98765 11111",
          shipping_address_line1: "45 Park Street", shipping_city: "Delhi",
          shipping_state: "Delhi", shipping_postal_code: "110001", shipping_country: "India",
          created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
          updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        },
        {
          id: "ord_demo_3",
          order_number: "ORD1003",
          user_id: "user_demo_3",
          user_name: "Amit Kumar",
          user_email: "amit@example.com",
          items: [{ product_id: 18, product_name: "Luxury Watch", product_image: "/Wrist Watch/a-professional-ecommerce-product-photogr_-lIscgQXQWWaehwFODZ1dQ_DmDhHFjgTvabIVglKA2zaA_cover.jpeg", quantity: 1, price: 4999, total: 4999 }],
          subtotal: 4999, shipping_amount: 0, tax_amount: 899.82, total_amount: 5898.82,
          status: "confirmed", payment_status: "paid", payment_method: "netbanking",
          shipping_name: "Amit Kumar", shipping_phone: "+91 87654 32109",
          shipping_address_line1: "78 Brigade Road", shipping_city: "Bangalore",
          shipping_state: "Karnataka", shipping_postal_code: "560001", shipping_country: "India",
          created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
      ]));
    }

    // ── 3. Seed default offers ─────────────────────────────────────────────
    if (!localStorage.getItem("store_offers") || JSON.parse(localStorage.getItem("store_offers") || "[]").length === 0) {
      localStorage.setItem("store_offers", JSON.stringify([
        {
          id: "offer_1",
          title: "Welcome10",
          description: "10% off on your first order",
          code: "WELCOME10",
          discount: 10,
          type: "percentage",
          active: true,
          isDraft: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: "offer_2",
          title: "FLAT200",
          description: "Flat ₹200 off on orders above ₹1500",
          code: "FLAT200",
          discount: 200,
          type: "flat",
          active: true,
          isDraft: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: "offer_3",
          title: "MAISON15",
          description: "15% off sitewide",
          code: "MAISON15",
          discount: 15,
          type: "percentage",
          active: false,
          isDraft: true,
          createdAt: new Date().toISOString(),
        },
      ]));
    }

    // ── 4. Seed BxGy offer ─────────────────────────────────────────────────
    if (!localStorage.getItem("bxgy_offers") || JSON.parse(localStorage.getItem("bxgy_offers") || "[]").length === 0) {
      localStorage.setItem("bxgy_offers", JSON.stringify([
        {
          id: "bxgy_1",
          title: "Buy 2 Get 1 Free",
          buyQty: 2,
          getFreeQty: 1,
          active: true,
          isDraft: false,
        },
      ]));
    }

    // ── 5. Seed flash sale ─────────────────────────────────────────────────
    if (!localStorage.getItem("flash_sales") || JSON.parse(localStorage.getItem("flash_sales") || "[]").length === 0) {
      localStorage.setItem("flash_sales", JSON.stringify([
        {
          id: "flash_1",
          label: "Weekend Flash Sale",
          discount: 20,
          endsAt: new Date(Date.now() + 48 * 3600000).toISOString(),
          active: true,
          isDraft: false,
        },
      ]));
    }

    localStorage.setItem(SEED_KEY, "1");
  } catch {}
})();

createRoot(document.getElementById("root")!).render(<App />);
