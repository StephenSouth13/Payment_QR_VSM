package main

import (
	"encoding/base64"
	"fmt"

	qrcode "github.com/skip2/go-qrcode"
)

// generateVietQR tạo QR code dạng base64 cho thanh toán
func generateVietQR(accountNumber, bankCode, amount, note string) (string, error) {
	// Dữ liệu VietQR cơ bản (có thể thay bằng chuẩn VietQR chính thức)
	qrData := fmt.Sprintf("vietqr://%s/%s?amount=%s&note=%s", bankCode, accountNumber, amount, note)

	// Tạo QR code PNG (256px)
	qrBytes, err := qrcode.Encode(qrData, qrcode.Medium, 256)
	if err != nil {
		return "", err
	}

	// Convert sang base64 để frontend hiển thị
	base64QR := base64.StdEncoding.EncodeToString(qrBytes)
	return "data:image/png;base64," + base64QR, nil
}
