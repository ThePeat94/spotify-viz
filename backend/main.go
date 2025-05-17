package main

import (
	"backend/api"
	"backend/config"
	"backend/db"
	"backend/mockserver"
	"backend/spotifyapi"
	"fmt"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"io"
	"log"
	"os"
)

func main() {
	log.Println("starting application")
	cfg := config.LoadConfig("config.yaml")

	var logger *zap.Logger
	zapEnvironment := *cfg.Logging.Zap
	if zapEnvironment == "production" {
		logger, _ = zap.NewProduction()
	} else {
		gin.ForceConsoleColor()
		logger, _ = zap.NewDevelopment()
	}
	zap.ReplaceGlobals(logger)
	logger.Info("config loaded")

	if cfg.Server == nil {
		logger.Fatal("no server configuration present")
	}

	if cfg.DatabaseConfig == nil {
		logger.Fatal("no database configuration present")
	}

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%d sslmode=disable",
		cfg.DatabaseConfig.Host,
		cfg.DatabaseConfig.Username,
		cfg.DatabaseConfig.Password,
		cfg.DatabaseConfig.Database,
		cfg.DatabaseConfig.Port,
	)

	dbConn, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		logger.Fatal("failed to connect to database", zap.Error(err))
	} else {
		dbConn.AutoMigrate(&db.Track{})
	}

	if cfg.Logging.File != nil {
		ginLogFile, err := os.OpenFile(*cfg.Logging.File, os.O_APPEND|os.O_CREATE, 0644)
		defer ginLogFile.Close()
		if err != nil {
			logger.Warn("error creating file", zap.String("file", *cfg.Logging.File), zap.Error(err))
		} else {
			gin.DefaultWriter = io.MultiWriter(os.Stdout, ginLogFile)
		}
	}

	var spotifyClient spotifyapi.SpotifyClient
	if cfg.SpotifyConfig == nil {
		logger.Warn("no spotify configuration present, operating in data collection mode")
		spotifyClient = &spotifyapi.NoopClient{Logger: logger}
	} else {
		spotifyClient = spotifyapi.NewSpotifyClient(
			*cfg.SpotifyConfig.BaseApiUrl,
			*cfg.SpotifyConfig.AccountUrl,
			*cfg.SpotifyConfig.ClientID,
			*cfg.SpotifyConfig.ClientSecret,
			logger,
		)
	}

	go func() {
		apiServer := api.NewServer(logger, spotifyClient, *cfg.Server)
		err := apiServer.Run()
		if err != nil {
			logger.Fatal("failed to start server: %v", zap.Error(err))
		}
	}()

	if cfg.MockServerConfig != nil {
		go func() {
			logger.Info("Starting Mock Server")
			mckSrv := &mockserver.Server{
				Logger: logger,
				Port:   cfg.MockServerConfig.Port,
			}

			err := mckSrv.RunSpotifyMockServer()
			if err != nil {
				logger.Fatal("failed to start mock server: %v", zap.Error(err))
			}
		}()
	}

	select {}
}
