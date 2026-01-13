package main

import (
	"turingmachine/src"
)

func main() {
	config := src.NewConfig()
	src.InitLogger(config)
	defer src.DeinitLogger()

	server := src.NewServer(config)

	server.Start()
}
