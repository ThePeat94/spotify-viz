package config

import (
	"gopkg.in/yaml.v3"
	"log"
	"os"
	"time"
)

type Config struct {
	Server  *ApiServerConfig `yaml:"server"`
	Logging struct {
		Zap     *string `yaml:"zap"`
		File    *string `yaml:"file"`
		ApiFile *string `yaml:"api_file"`
	}
	MockServerConfig *MockServerConfig `yaml:"mock_server,omitempty"`
	SpotifyConfig    *SpotifyConfig    `yaml:"spotify,omitempty"`
	DatabaseConfig   *DatabaseConfig   `yaml:"database,omitempty"`
	DiscoverConfig   *DiscoverConfig   `yaml:"discover,omitempty"`
}

type ApiServerConfig struct {
	Port int `yaml:"port"`
}

type MockServerConfig struct {
	Port int `yaml:"port"`
}

type SpotifyConfig struct {
	AccountUrl    string         `yaml:"account_url,omitempty"`
	BaseApiUrl    string         `yaml:"base_api_url,omitempty"`
	ClientID      string         `yaml:"client_id,omitempty"`
	ClientSecret  string         `yaml:"client_secret,omitempty"`
	RetryCount    *int           `yaml:"retry_count,omitempty"`
	RetryWaitTime *time.Duration `yaml:"retry_wait_time,omitempty"`
	TimeOut       *time.Duration `yaml:"time_out,omitempty"`
}

type DatabaseConfig struct {
	Username string `yaml:"username"`
	Password string `yaml:"password"`
	Database string `yaml:"db"`
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
}

type DiscoverConfig struct {
	BatchSize int `yaml:"batch_size"`
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
