"use client";

export default function OrderSuccess() {
  return (
    <div className="max-w-3xl mx-auto text-center p-6 space-y-4">
      <div className="text-6xl">🎉</div>
      <h1 className="text-3xl font-bold">Cảm ơn bạn đã thanh toán!</h1>
      <p>Đơn hàng của bạn đã được ghi nhận và sẽ được xử lý.</p>
      <a href="/" className="inline-block mt-4 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700">
        Quay về trang chủ
      </a>
    </div>
  );
}
