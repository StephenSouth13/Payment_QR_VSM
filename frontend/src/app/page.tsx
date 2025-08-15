"use client";
import { useMemo, useState } from "react";

type Product = { id: number; name: string; price: number; image: string };
type CartItem = Product & { qty: number };
type Address = { fullName: string; phone: string; address: string; note?: string };

const PRODUCTS: Product[] = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  name: `VSM Tee ${i + 1}`,
  price: 99000 + (i % 4) * 10000,
  image: `https://picsum.photos/seed/vsm${i}/500/500`,
}));

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

export default function HomePage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addr, setAddr] = useState<Address>({ fullName: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);

  const total = useMemo(() => cart.reduce((s, it) => s + it.price * it.qty, 0), [cart]);

  const addToCart = (p: Product) =>
    setCart((prev) => {
      const idx = prev.findIndex((x) => x.id === p.id);
      if (idx >= 0) {
        const clone = [...prev];
        clone[idx].qty += 1;
        return clone;
      }
      return [...prev, { ...p, qty: 1 }];
    });

  const inc = (id: number) =>
    setCart((prev) => prev.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)));
  const dec = (id: number) =>
    setCart((prev) =>
      prev
        .map((x) => (x.id === id ? { ...x, qty: Math.max(1, x.qty - 1) } : x))
        .filter((x) => x.qty > 0)
    );
  const removeItem = (id: number) => setCart((prev) => prev.filter((x) => x.id !== id));

  const validate = () => !!(addr.fullName && addr.phone && addr.address && cart.length);

  const checkout = async () => {
    if (!validate()) {
      alert("Vui lòng điền địa chỉ và thêm sản phẩm vào giỏ.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((c) => ({ id: c.id, name: c.name, price: c.price, qty: c.qty })),
          customer: addr,
        }),
      });
      if (!res.ok) throw new Error("Create order failed");
      const data = await res.json();
      window.location.href = `/pay/${data.order_id}`;
    } catch (e) {
      alert("Checkout lỗi, thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-r from-indigo-50 to-white p-8 shadow text-center">
        <h1 className="text-4xl font-bold mb-2">VSM Tees</h1>
        <p className="text-gray-600">Chọn áo ưa thích, nhập địa chỉ và thanh toán qua VietQR.</p>
      </section>

      {/* Products */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Sản phẩm</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {PRODUCTS.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col">
              <img src={p.image} alt={p.name} className="rounded-lg mb-4" />
              <h3 className="font-semibold">{p.name}</h3>
              <p className="text-gray-600 mb-3">{p.price.toLocaleString()} VND</p>
              <button
                onClick={() => addToCart(p)}
                className="mt-auto bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Thêm vào giỏ
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Cart + Address */}
      <section className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-3 bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-bold mb-4">🛒 Giỏ hàng</h2>
          {!cart.length ? (
            <p className="text-gray-500">Chưa có sản phẩm.</p>
          ) : (
            <>
              <ul className="divide-y">
                {cart.map((c) => (
                  <li key={c.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-sm text-gray-500">
                        {c.price.toLocaleString()} VND x {c.qty}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => dec(c.id)} className="px-3 py-1 rounded border">-</button>
                      <span>{c.qty}</span>
                      <button onClick={() => inc(c.id)} className="px-3 py-1 rounded border">+</button>
                      <button onClick={() => removeItem(c.id)} className="text-red-600 hover:underline">Xóa</button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between mt-4">
                <span className="text-lg font-semibold">Tổng</span>
                <span className="text-xl font-bold">{total.toLocaleString()} VND</span>
              </div>
            </>
          )}
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-bold mb-4">📦 Địa chỉ giao hàng</h2>
          <div className="space-y-3">
            <input className="w-full border rounded px-3 py-2" placeholder="Họ tên"
              value={addr.fullName} onChange={(e) => setAddr({ ...addr, fullName: e.target.value })} />
            <input className="w-full border rounded px-3 py-2" placeholder="Số điện thoại"
              value={addr.phone} onChange={(e) => setAddr({ ...addr, phone: e.target.value })} />
            <textarea className="w-full border rounded px-3 py-2" placeholder="Địa chỉ"
              value={addr.address} onChange={(e) => setAddr({ ...addr, address: e.target.value })} />
            <input className="w-full border rounded px-3 py-2" placeholder="Ghi chú (tuỳ chọn)"
              value={addr.note || ""} onChange={(e) => setAddr({ ...addr, note: e.target.value })} />
          </div>
          <button
            onClick={checkout}
            disabled={loading || cart.length === 0}
            className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Xác nhận & Thanh toán →"}
          </button>
        </div>
      </section>
    </div>
  );
}
