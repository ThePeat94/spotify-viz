package api

import (
	"backend/config"
	"backend/spotifyapi"
	"fmt"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"net/http"
)

type Server struct {
	Logger zap.Logger
	Port   int

	restApi       *gin.Engine
	spotifyClient spotifyapi.SpotifyClient
}

func NewServer(logger *zap.Logger, client spotifyapi.SpotifyClient, config config.ApiServerConfig) *Server {
	apiServer := gin.Default()
	apiServer.Use(ZapLogger(logger))

	return &Server{
		Logger:        *logger,
		Port:          config.Port,
		restApi:       gin.Default(),
		spotifyClient: client,
	}
}

func (s *Server) Run() error {
	s.restApi.GET("/health", getHealthStatus)
	s.restApi.POST("/discover", s.handlePostDiscoverArtists)

	formattedPort := fmt.Sprintf(":%d", s.Port)
	return s.restApi.Run(formattedPort)
}

func getHealthStatus(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func (s *Server) handlePostDiscoverArtists(c *gin.Context) {
	var request DiscoveredArtistsRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if request.Artists == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "artists field is required"})
		return
	}

	s.Logger.Info(fmt.Sprintf("found artists: %v", *request.Artists))

	c.Status(http.StatusOK)
}
