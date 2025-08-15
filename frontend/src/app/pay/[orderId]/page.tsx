"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

type StatusRes = { order_id: string; status: "pending" | "paid"; amount: number; note: string; qr_data_url: string };

export default function PayPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [st, setSt] = useState<StatusRes | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch(`${API_BASE}/api/payment-status?orderId=${orderId}`);
      if (r.ok) setSt(await r.json());
    })();
  }, [orderId]);

  useEffect(() => {
    const t = setInterval(async () => {
      const r = await fetch(`${API_BASE}/api/payment-status?orderId=${orderId}`);
      if (r.ok) setSt(await r.json());
    }, 3000);
    return () => clearInterval(t);
  }, [orderId]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold mb-1">Thanh toán đơn hàng</h1>
        <p className="text-gray-600">Mã đơn: <span className="font-mono">{orderId}</span></p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm text-gray-500 mb-2">Số tiền</p>
            <p className="text-3xl font-bold">{st ? Math.round(st.amount).toLocaleString() : "--"} VND</p>
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-1">Nội dung CK</p>
              <div className="font-mono bg-white border rounded px-3 py-2">{st?.note ?? "..."}</div>
            </div>
            <div className="mt-4 text-sm">
              Trạng thái:{" "}
              <span className={st?.status === "paid" ? "text-green-600 font-semibold" : "text-orange-600 font-semibold"}>
                {st?.status ?? "..."}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            {st?.status === "paid" ? (
              <div className="text-center">
                <div className="text-5xl">✅</div>
                <p className="mt-2 text-green-600 font-semibold">Thanh toán thành công!</p>
              </div>
            ) : (
              <>
                <img src={st?.qr_data_url} alt="VietQR" className="w-72 h-72 rounded-xl shadow" />
                <p className="text-sm text-gray-500 mt-2 text-center">Mở app ngân hàng và quét QR để thanh toán</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
