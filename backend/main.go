package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
)

func main() {
	http.HandleFunc("/api/create-order", createOrderHandler)
	http.HandleFunc("/api/payment-status", paymentStatusHandler)

	fmt.Println("Server running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// API tạo đơn hàng và QR code
func createOrderHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Amount int    `json:"amount"`
		Note   string `json:"note"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	orderID := uuid.NewString()

	qrBase64, err := generateVietQR("123456789", "VCB", fmt.Sprintf("%d", req.Amount), req.Note)
	if err != nil {
		http.Error(w, "Failed to generate QR", http.StatusInternalServerError)
		return
	}

	orders[orderID] = &Order{
		OrderID: orderID,
		Amount:  req.Amount,
		Note:    req.Note,
		Status:  StatusPending,
		QRData:  qrBase64,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(orders[orderID])
}

// API kiểm tra trạng thái thanh toán
func paymentStatusHandler(w http.ResponseWriter, r *http.Request) {
	orderID := r.URL.Query().Get("orderId")
	if orderID == "" {
		http.Error(w, "Missing orderId", http.StatusBadRequest)
		return
	}

	order, ok := orders[orderID]
	if !ok {
		http.Error(w, "Order not found", http.StatusNotFound)
		return
	}

	// Giả lập thanh toán sau 15 giây
	if time.Since(time.Now().Add(-15*time.Second)) > 0 {
		order.Status = StatusPaid
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(order)
}
