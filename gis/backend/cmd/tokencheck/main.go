package main

import (
	"fmt"
	"os"

	"github.com/golang-jwt/jwt/v5"
)

func main() {
	tokenStr := os.Args[1]
	secret := []byte(os.Args[2])
	tok, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		return secret, nil
	})
	if err != nil {
		fmt.Println("PARSE ERROR:", err)
		return
	}
	claims, _ := tok.Claims.(jwt.MapClaims)
	fmt.Println("VALID:", tok.Valid)
	fmt.Println("claims:", claims)
}
