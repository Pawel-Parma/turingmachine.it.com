package main

import (
	. "turingmachine/src"
)

func main() {
	config := NewConfig()
	InitLogger(config)

	server := NewServer(config)

	server.Start()
}
