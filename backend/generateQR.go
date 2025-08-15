package main

import (
    "encoding/base64"
    "fmt"

    "github.com/skip2/go-qrcode"
)

func generateVietQR(amount int, description string) (string, error) {
    account := "0001244698984"
    bank := "MB"
    name := "Quách Thành Long"

    content := fmt.Sprintf("bank:%s|acc:%s|name:%s|amount:%d|desc:%s", bank, account, name, amount, description)

    png, err := qrcode.Encode(content, qrcode.Medium, 256)
    if err != nil {
        return "", err
    }

    return "data:image/png;base64," + base64.StdEncoding.EncodeToString(png), nil
}
