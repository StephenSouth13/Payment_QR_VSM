package main

type OrderStatus string

const (
	StatusPending OrderStatus = "pending"
	StatusPaid    OrderStatus = "paid"
)

type Order struct {
	OrderID string      `json:"order_id"`
	Amount  int         `json:"amount"`
	Note    string      `json:"note"`
	Status  OrderStatus `json:"status"`
	QRData  string      `json:"qr_data_url"`
}

var orders = make(map[string]*Order)
