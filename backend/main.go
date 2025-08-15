package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

// CORS
func enableCORS(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

// Tạo đơn hàng + QR
func createOrderHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	if r.Method == http.MethodOptions {
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Items    []Item   `json:"items"`
		Customer Customer `json:"customer"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	total := 0
	for _, item := range req.Items {
		total += item.Price * item.Qty
	}
	note := fmt.Sprintf("VSM-%d-%s", time.Now().Unix(), req.Customer.Phone)

	qrData, err := generateVietQR(total, note)
	if err != nil {
		http.Error(w, "Failed to generate QR", http.StatusInternalServerError)
		return
	}

	order := store.CreateOrder(req.Items, req.Customer, qrData, note, total)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(order)
}

// Kiểm tra trạng thái thanh toán
func paymentStatusHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	if r.Method == http.MethodOptions {
		return
	}

	orderID := r.URL.Query().Get("orderId")
	if orderID == "" {
		http.Error(w, "Missing orderId", http.StatusBadRequest)
		return
	}

	order, ok := store.GetOrder(orderID)
	if !ok {
		http.Error(w, "Order not found", http.StatusNotFound)
		return
	}

	if order.Status == StatusPending && time.Since(order.CreatedAt) > 15*time.Second {
		store.UpdateOrderStatus(orderID, StatusPaid)
		order.Status = StatusPaid
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(order)
}

func main() {
	http.HandleFunc("/api/create-order", createOrderHandler)
	http.HandleFunc("/api/payment-status", paymentStatusHandler)

	fmt.Println("Server running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
