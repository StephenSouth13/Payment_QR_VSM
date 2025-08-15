package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"time"

	"github.com/skip2/go-qrcode"
)

func main() {
	http.HandleFunc("/api/create-order", handleCreateOrder)
	http.HandleFunc("/api/payment-status", handlePaymentStatus)
	http.HandleFunc("/api/mock-confirm", handleMockConfirm)

	fmt.Println("🚀 Backend running at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// Bật CORS cho mọi request
func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

func handleCreateOrder(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	var body struct {
		Amount float64 `json:"amount"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	orderID := fmt.Sprintf("ORD%d", rand.Intn(1000000))
	note := fmt.Sprintf("PAY-%s", orderID)
	paymentContent := fmt.Sprintf("STK:0001244698984|MB Bank|Quách Thành Long|%d VND|%s", int(body.Amount), note)

	qrBytes, _ := qrcode.Encode(paymentContent, qrcode.Medium, 256)
	qrDataURL := "data:image/png;base64," + toBase64(qrBytes)

	order := &Order{
		OrderID:   orderID,
		Amount:    body.Amount,
		Note:      note,
		Status:    StatusPending,
		QRDataURL: qrDataURL,
	}

	SaveOrder(order)
	json.NewEncoder(w).Encode(order)
}

func handlePaymentStatus(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		return
	}

	orderID := r.URL.Query().Get("orderId")
	order, ok := GetOrder(orderID)
	if !ok {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(order)
}

// API giả lập xác nhận thanh toán
func handleMockConfirm(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		return
	}

	orderID := r.URL.Query().Get("orderId")
	UpdateOrderStatus(orderID, StatusPaid)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func toBase64(b []byte) string {
	return string(json.RawMessage(`"` + encodeBase64(b) + `"`))[1 : len(`"`+encodeBase64(b)+`"`)-1]
}


func encodeBase64(b []byte) string {
	const base64Table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
	encoding := make([]byte, ((len(b)+2)/3)*4)
	for i, j := 0, 0; i < len(b); i += 3 {
		var v uint
		v |= uint(b[i]) << 16
		if i+1 < len(b) {
			v |= uint(b[i+1]) << 8
		}
		if i+2 < len(b) {
			v |= uint(b[i+2])
		}
		encoding[j+0] = base64Table[(v>>18)&0x3F]
		encoding[j+1] = base64Table[(v>>12)&0x3F]
		if i+1 < len(b) {
			encoding[j+2] = base64Table[(v>>6)&0x3F]
		} else {
			encoding[j+2] = '='
		}
		if i+2 < len(b) {
			encoding[j+3] = base64Table[v&0x3F]
		} else {
			encoding[j+3] = '='
		}
		j += 4
	}
	return string(encoding)
}

func init() {
	rand.Seed(time.Now().UnixNano())
}
