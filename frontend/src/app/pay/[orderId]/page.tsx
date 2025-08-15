"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

type StatusRes = {
  order_id: string;
  status: "pending" | "paid";
  amount: number;
  note: string;
  qr_data_url: string;
};

export default function PayPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const [st, setSt] = useState<StatusRes | null>(null);

  // Fetch status once
  useEffect(() => {
    (async () => {
      const r = await fetch(`${API_BASE}/api/payment-status?orderId=${orderId}`);
      if (r.ok) setSt(await r.json());
    })();
  }, [orderId]);

  // Poll every 3 seconds
  useEffect(() => {
    const t = setInterval(async () => {
      const r = await fetch(`${API_BASE}/api/payment-status?orderId=${orderId}`);
      if (r.ok) {
        const data = await r.json();
        setSt(data);
        if (data.status === "paid") {
          setTimeout(() => {
            router.push("/order-success");
          }, 2000); // wait 2s before redirect
        }
      }
    }, 3000);
    return () => clearInterval(t);
  }, [orderId]);

  // Timeout after 10 minutes
  useEffect(() => {
    const timeout = setTimeout(() => {
      const cart = localStorage.getItem("cart");
      if (cart) {
        localStorage.setItem("cart_backup", cart);
      }
      router.push("/");
    }, 10 * 60 * 1000); // 10 minutes
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      <h1 className="text-3xl font-bold">Thanh toán đơn hàng</h1>
      <p>Mã đơn: <span className="font-mono">{orderId}</span></p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div className="bg-white p-6 rounded-2xl shadow">
          <p>Số tiền:</p>
          <p className="text-2xl font-bold">{st ? st.amount.toLocaleString() : "--"} VND</p>
          <p className="mt-2">Nội dung CK:</p>
          <div className="font-mono bg-gray-100 p-2 rounded">{st?.note ?? "..."}</div>
          <p className="mt-2">
            Trạng thái: <span className={st?.status === "paid" ? "text-green-600" : "text-orange-600"}>
              {st?.status ?? "..."}
            </span>
          </p>
        </div>

        <div className="flex flex-col items-center justify-center">
          {st?.status === "paid" ? (
            <div className="text-center">
              <div className="text-5xl">✅</div>
              <p className="mt-2 text-green-600 font-semibold">Thanh toán thành công!</p>
            </div>
          ) : (
            <>
              <img src={st?.qr_data_url} alt="QR" className="w-72 h-72 rounded-xl shadow" />
              <p className="text-sm text-gray-500 mt-2 text-center">Mở app ngân hàng và quét QR để thanh toán</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
