package main

import (
    "sync"
    "time"
    "github.com/google/uuid"
)

type OrderStatus string

const (
    StatusPending OrderStatus = "pending"
    StatusPaid    OrderStatus = "paid"
)

type Item struct {
    ID    int    `json:"id"`
    Name  string `json:"name"`
    Price int    `json:"price"`
    Qty   int    `json:"qty"`
}

type Customer struct {
    FullName string `json:"fullName"`
    Phone    string `json:"phone"`
    Address  string `json:"address"`
    Note     string `json:"note,omitempty"`
}

type Order struct {
    OrderID   string      `json:"order_id"`
    Items     []Item      `json:"items"`
    Customer  Customer    `json:"customer"`
    Amount    int         `json:"amount"`
    Note      string      `json:"note"`
    Status    OrderStatus `json:"status"`
    QRDataURL string      `json:"qr_data_url"`
    CreatedAt time.Time   `json:"created_at"`
}

type OrdersStore struct {
    mu     sync.RWMutex
    orders map[string]Order
}

var store = OrdersStore{
    orders: make(map[string]Order),
}

func (s *OrdersStore) CreateOrder(items []Item, customer Customer, qrDataURL string, note string, amount int) Order {
    id := uuid.New().String()
    order := Order{
        OrderID:   id,
        Items:     items,
        Customer:  customer,
        Amount:    amount,
        Note:      note,
        Status:    StatusPending,
        QRDataURL: qrDataURL,
        CreatedAt: time.Now(),
    }
    s.mu.Lock()
    defer s.mu.Unlock()
    s.orders[id] = order
    return order
}

func (s *OrdersStore) GetOrder(id string) (Order, bool) {
    s.mu.RLock()
    defer s.mu.RUnlock()
    order, ok := s.orders[id]
    return order, ok
}

func (s *OrdersStore) UpdateOrderStatus(id string, status OrderStatus) bool {
    s.mu.Lock()
    defer s.mu.Unlock()
    order, ok := s.orders[id]
    if !ok {
        return false
    }
    order.Status = status
    s.orders[id] = order
    return true
}
