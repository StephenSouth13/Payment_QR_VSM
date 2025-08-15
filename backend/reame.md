ORS (Cross-Origin Resource Sharing) là cơ chế bảo mật của trình duyệt ngăn không cho một website (domain A) gọi API từ một domain khác (domain B) nếu server B không cho phép.

Trong trường hợp của bạn:

Frontend Next.js đang chạy ở: http://localhost:3000

Backend Go đang chạy ở: http://localhost:8080

=> Đây là cross-origin (khác port = khác origin) → Trình duyệt sẽ chặn nếu backend không bật CORS.