package src

import (
	"encoding/json"
	"log"
	"os"
	"strings"
)

type Config struct {
	Port int `json:"port"`
	Log  struct {
		File      string `json:"file"`
		Level     string `json:"level"`
		Format    string `json:"format"`
		AddSource bool   `json:"add_source"`
	} `json:"log"`
}

func NewConfig() *Config {
	data, err := os.ReadFile("config.json")
	if err != nil {
		log.Fatal(err)
	}

	var config Config
	err = json.Unmarshal(data, &config)
	if err != nil {
		log.Fatal(err)
	}

	config.Log.Level = strings.ToLower(config.Log.Level)
	config.Log.Format = strings.ToLower(config.Log.Format)

	return &config
}
