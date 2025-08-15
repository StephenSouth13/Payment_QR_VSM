import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VSM Shop",
  description: "Landing • Cart • QR Payment",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800 flex flex-col">
        <header className="bg-white/80 backdrop-blur shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="font-bold text-xl">🛍️ VSM Shop</div>
            <nav className="text-sm text-gray-600">Quality tees • Fast checkout</nav>
          </div>
        </header>
        <main className="flex-1 max-w-6xl mx-auto px-4 py-8">{children}</main>
        <footer className="bg-gray-900 text-white text-center py-6">
          © {new Date().getFullYear()} VSM. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
