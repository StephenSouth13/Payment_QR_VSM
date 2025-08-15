"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

type CartItem = { id: number; name: string; price: number; qty: number };

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const router = useRouter();

  const total = useMemo(() => cart.reduce((s, it) => s + it.price * it.qty, 0), [cart]);

  const removeItem = (id: number) => setCart((prev) => prev.filter((x) => x.id !== id));

  const checkout = () => {
    // redirect tạm thời về home
    router.push("/");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">🛒 Giỏ hàng</h1>
      {!cart.length ? <p>Không có sản phẩm nào.</p> : (
        <>
          <ul className="divide-y">
            {cart.map(c => (
              <li key={c.id} className="py-3 flex justify-between items-center">
                <span>{c.name} x {c.qty}</span>
                <div className="flex gap-2">
                  <span>{c.price.toLocaleString()} VND</span>
                  <button onClick={() => removeItem(c.id)} className="text-red-600 hover:underline">Xóa</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex justify-between mt-4 font-bold">
            <span>Tổng:</span>
            <span>{total.toLocaleString()} VND</span>
          </div>
          <button onClick={checkout} className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
            Thanh toán
          </button>
        </>
      )}
    </div>
  );
}
