package config

import (
	"gopkg.in/yaml.v3"
	"log"
	"os"
)

type Config struct {
	Server  *ApiServerConfig `yaml:"server"`
	Logging struct {
		Zap  *string `yaml:"zap"`
		File *string `yaml:"file"`
	}
	MockServerConfig *MockServerConfig `yaml:"mock_server,omitempty"`
	SpotifyConfig    *SpotifyConfig    `yaml:"spotify,omitempty"`
}

type ApiServerConfig struct {
	Port int `yaml:"port"`
}

type MockServerConfig struct {
	Port int `yaml:"port"`
}

type SpotifyConfig struct {
	AccountUrl   *string `yaml:"account_url,omitempty"`
	ApiToken     *string `yaml:"api_token,omitempty"`
	BaseApiUrl   *string `yaml:"base_api_url,omitempty"`
	ClientID     *string `yaml:"client_id,omitempty"`
	ClientSecret *string `yaml:"client_secret,omitempty"`
}

func LoadConfig(path string) *Config {
	f, err := os.Open(path)
	if err != nil {
		log.Fatalf("error opening config file: %v", err)
	}
	defer f.Close()

	var cfg Config
	decoder := yaml.NewDecoder(f)
	if err = decoder.Decode(&cfg); err != nil {
		log.Fatalf("error decoding config: %v", err)
	}

	return &cfg
}
