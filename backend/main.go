package main

import (
	"backend/config"
	"backend/mockserver"
	"backend/spotifyapi"
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
	ArtistName string `json:"artistName"`
	TrackUri   string `json:"trackUri"`
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
	zap.ReplaceGlobals(logger)
	logger.Info("config loaded")

	if cfg.Logging.File != nil {
		ginLogFile, err := os.OpenFile(*cfg.Logging.File, os.O_APPEND|os.O_CREATE, 0644)
		defer ginLogFile.Close()
		if err != nil {
			logger.Warn("error creating file", zap.String("file", *cfg.Logging.File), zap.Error(err))
		} else {
			gin.DefaultWriter = io.MultiWriter(os.Stdout, ginLogFile)
		}
	}

	r := gin.Default()
	r.Use(ZapLogger(logger))

	r.GET("/health", getHealthStatus)
	r.POST("/discover", handlePostDiscoverArtists)

	go func() {
		formattedPort := fmt.Sprintf(":%d", cfg.Server.Port)
		err := r.Run(formattedPort)
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

	spotifyClient := spotifyapi.NewSpotifyClient("foo_bar", "abc", logger)
	err := spotifyClient.Login()
	if err != nil {
		logger.Fatal("failed to login: %v", zap.Error(err))
	} else {
		logger.Info("successfully logged in into spotify :-)")
	}

	select {}
}

func getHealthStatus(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func handlePostDiscoverArtists(c *gin.Context) {
	var request DiscoveredArtistsRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if request.Artists == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "artists field is required"})
		return
	}

	zap.L().Info(fmt.Sprintf("found artists: %v", *request.Artists))

	c.Status(http.StatusOK)
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
