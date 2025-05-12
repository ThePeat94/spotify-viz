package config

import (
	"gopkg.in/yaml.v3"
	"log"
	"os"
)

type Config struct {
	Server struct {
		Port int `yaml:"port"`
	} `yaml:"server"`
}

func LoadConfig(path string) *Config {
	f, err := os.Open(path)
	if err != nil {
		log.Fatalf("error opening config file: %v", err)
	}
	defer func(f *os.File) {
		closeErr := f.Close()
		if closeErr != nil {
			log.Fatalf("error closing config file: %v", closeErr)
		}
	}(f)

	var cfg Config
	decoder := yaml.NewDecoder(f)
	if err = decoder.Decode(&cfg); err != nil {
		log.Fatalf("error decoding config: %v", err)
	}

	return &cfg
}
