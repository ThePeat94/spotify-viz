package api

import (
	"backend/config"
	"backend/db"
	"backend/spotifyapi"
	"fmt"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"net/http"
)

type Server struct {
	Logger zap.Logger
	Port   int

	restApi       *gin.Engine
	spotifyClient spotifyapi.SpotifyClient
	db            *gorm.DB
}

func NewServer(logger *zap.Logger, client spotifyapi.SpotifyClient, config config.ApiServerConfig, db *gorm.DB) *Server {
	apiServer := gin.Default()
	apiServer.Use(ZapLogger(logger))

	return &Server{
		Logger:        *logger,
		Port:          config.Port,
		restApi:       gin.Default(),
		spotifyClient: client,
		db:            db,
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

	if request.Artists == nil || len(*request.Artists) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "artists field is required"})
		return
	}

	s.Logger.Info(fmt.Sprintf("found artists: %v", *request.Artists))

	var dbDiscovery []db.ArtistDiscovery
	for _, disc := range *request.Artists {
		dbDiscovery = append(dbDiscovery, db.ArtistDiscovery{
			ArtistName: disc.ArtistName,
			TrackUri:   disc.TrackUri,
		})
	}

	res := s.db.Clauses(clause.OnConflict{DoNothing: true}).Create(&dbDiscovery)

	if res.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": res.Error.Error()})
		return
	}

	c.Status(http.StatusOK)
}
