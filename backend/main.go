package main

import (
	"backend/config"
	"fmt"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"io"
	"log"
	"net/http"
	"os"
	"time"
)

type DiscoveredArtist struct {
	ArtistName string `json:"artist_name"`
	TrackUri   string `json:"track_uri"`
}

type DiscoveredArtistsRequest struct {
	Artists *[]DiscoveredArtist `json:"artists,omitempty"`
}

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

	logger.Info("config loaded")

	if cfg.Logging.File != nil {
		ginLogFile, err := os.OpenFile(*cfg.Logging.File, os.O_APPEND|os.O_CREATE, 0644)
		if err != nil {
			logger.Warn("error creating file", zap.String("file", *cfg.Logging.File), zap.Error(err))
		} else {
			defer ginLogFile.Close()
		}

		gin.DefaultWriter = io.MultiWriter(os.Stdout, ginLogFile)
	}

	r := gin.Default()
	r.Use(ZapLogger(logger))

	r.GET("/health", getHealthStatus)

	formattedPort := fmt.Sprintf(":%d", cfg.Server.Port)
	err := r.Run(formattedPort)

	if err != nil {
		logger.Fatal("failed to start server: %v", zap.Error(err))
	}
}

func getHealthStatus(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func ZapLogger(logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		duration := time.Since(start)

		logger.Info("Request",
			zap.String("method", c.Request.Method),
			zap.String("path", c.Request.URL.Path),
			zap.Int("status", c.Writer.Status()),
			zap.Duration("duration", duration),
		)
	}
}
