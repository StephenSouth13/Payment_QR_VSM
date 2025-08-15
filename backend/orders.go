package main

import (
	"sync"
)

type OrderStatus string

const (
	StatusPending OrderStatus = "pending"
	StatusPaid    OrderStatus = "paid"
)

type Order struct {
	OrderID   string       `json:"order_id"`
	Amount    float64      `json:"amount"`
	Note      string       `json:"note"`
	Status    OrderStatus  `json:"status"`
	QRDataURL string       `json:"qr_data_url"`
}

var (
	orders   = make(map[string]*Order)
	orderMux sync.RWMutex
)

func SaveOrder(o *Order) {
	orderMux.Lock()
	defer orderMux.Unlock()
	orders[o.OrderID] = o
}

func GetOrder(id string) (*Order, bool) {
	orderMux.RLock()
	defer orderMux.RUnlock()
	o, ok := orders[id]
	return o, ok
}

func UpdateOrderStatus(id string, status OrderStatus) {
	orderMux.Lock()
	defer orderMux.Unlock()
	if o, ok := orders[id]; ok {
		o.Status = status
	}
}
