package main

import (
	"backend/config"
	"fmt"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
)

type DiscoveredArtist struct {
	ArtistName string `json:"artist_name"`
	TrackUri   string `json:"track_uri"`
}

type DiscoveredArtistsRequest struct {
	Artists *[]DiscoveredArtist `json:"artists,omitempty"`
}

func main() {
	log.Println("loading config")

	cfg := config.LoadConfig("config.yaml")

	log.Println("starting server")
	r := gin.Default()

	r.GET("/health", getHealthStatus)

	formattedPort := fmt.Sprintf(":%d", cfg.Server.Port)
	err := r.Run(formattedPort)

	if err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}

func getHealthStatus(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
