import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

(() => {
  try {
    // ── 1. Seed admin + demo users into maison_auth_users ──────────────────
    const SEED_KEY = "maison_seeded_v3";
    const authUsers: any[] = JSON.parse(localStorage.getItem("maison_auth_users") || "[]");
    const byEmail = new Map(authUsers.map((u: any) => [u.email, u]));

    const demoUsers = [
      {
        id: "admin_1",
        name: "Admin",
        email: "admin@maison.com",
        password: "admin123",
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

    // Always ensure demo users exist (never overwrite existing real users)
    demoUsers.forEach(u => {
      if (!byEmail.has(u.email)) byEmail.set(u.email, u);
    });

    // Also merge any users from old maison_users key
    const oldUsers: any[] = JSON.parse(localStorage.getItem("maison_users") || "[]");
    oldUsers.forEach((u: any) => {
      if (!byEmail.has(u.email)) {
        byEmail.set(u.email, {
          id: u.id, name: u.name, email: u.email,
          password: u.password || "",
          phone: u.phone || "",
          role: u.role || "customer",
          is_active: u.is_active !== false,
          created_at: u.created_at || new Date().toISOString(),
        });
      }
    });

    // Only write back if something new was added
    if (byEmail.size > authUsers.length) {
      localStorage.setItem("maison_auth_users", JSON.stringify(Array.from(byEmail.values())));
    }

    // ── 2. Seed demo orders if none exist ──────────────────────────────────
    if (!localStorage.getItem(SEED_KEY)) {
      const existingOrders: any[] = JSON.parse(localStorage.getItem("ecom_orders") || "[]");
      if (existingOrders.length === 0) {
        const demoOrders = [
          {
            id: "ord_demo_1",
            order_number: "ORD" + Date.now() + "001",
            user_id: "user_demo_1",
            user_name: "Rahul Sharma",
            user_email: "rahul@example.com",
            items: [{ product_id: 1, product_name: "Signature T-Shirt", product_image: "/MEN/lucid-origin_Professional_ecommerce_product_image_of_a_black_men_s_t-shirt._Minimal_backgroun-0.jpg", quantity: 2, price: 499, total: 998 }],
            subtotal: 998, shipping_amount: 0, tax_amount: 179.64, total_amount: 1177.64,
            status: "delivered", payment_status: "paid", payment_method: "upi",
            shipping_name: "Rahul Sharma", shipping_phone: "+91 91234 56789",
            shipping_address_line1: "123 MG Road", shipping_city: "Mumbai",
            shipping_state: "Maharashtra", shipping_postal_code: "400001", shipping_country: "India",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "ord_demo_2",
            order_number: "ORD" + Date.now() + "002",
            user_id: "user_demo_2",
            user_name: "Priya Patel",
            user_email: "priya@example.com",
            items: [{ product_id: 6, product_name: "Formal Dress Shirt", product_image: "/Formal Shirt/a-professional-ecommerce-product-photogr_Mj4YVMjLS5GED-q1vP8qDA_clUoQur1RzGJjZXZB-42Zg_cover.jpeg", quantity: 1, price: 999, total: 999 }],
            subtotal: 999, shipping_amount: 0, tax_amount: 179.82, total_amount: 1178.82,
            status: "shipped", payment_status: "paid", payment_method: "card",
            shipping_name: "Priya Patel", shipping_phone: "+91 98765 11111",
            shipping_address_line1: "45 Park Street", shipping_city: "Delhi",
            shipping_state: "Delhi", shipping_postal_code: "110001", shipping_country: "India",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "ord_demo_3",
            order_number: "ORD" + Date.now() + "003",
            user_id: "user_demo_3",
            user_name: "Amit Kumar",
            user_email: "amit@example.com",
            items: [{ product_id: 18, product_name: "Luxury Watch", product_image: "/Wrist Watch/a-professional-ecommerce-product-photogr_-lIscgQXQWWaehwFODZ1dQ_DmDhHFjgTvabIVglKA2zaA_cover.jpeg", quantity: 1, price: 4999, total: 4999 }],
            subtotal: 4999, shipping_amount: 0, tax_amount: 899.82, total_amount: 5898.82,
            status: "confirmed", payment_status: "paid", payment_method: "netbanking",
            shipping_name: "Amit Kumar", shipping_phone: "+91 87654 32109",
            shipping_address_line1: "78 Brigade Road", shipping_city: "Bangalore",
            shipping_state: "Karnataka", shipping_postal_code: "560001", shipping_country: "India",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
        localStorage.setItem("ecom_orders", JSON.stringify(demoOrders));
      }
      localStorage.setItem(SEED_KEY, "1");
    }
  } catch {}
})();

createRoot(document.getElementById("root")!).render(<App />);
