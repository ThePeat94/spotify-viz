package api

import (
	"backend/config"
	"backend/db"
	"backend/spotifyapi"
	"fmt"
	"github.com/gin-contrib/cors"
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
	apiServer.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:5173"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Length", "Content-Type", "Accept"},
	}))

	return &Server{
		Logger:        *logger,
		Port:          config.Port,
		restApi:       apiServer,
		spotifyClient: client,
		db:            db,
	}
}

func (s *Server) Run() error {
	s.restApi.GET("/health", getHealthStatus)
	s.restApi.POST("/discover", s.handlePostDiscoverArtists)
	s.restApi.GET("/discover/status", s.handleGetDiscoverStatus)
	s.restApi.OPTIONS("/*path", func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Status(http.StatusOK)
	})

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

	s.Logger.Info(fmt.Sprintf("found %d artists", len(*request.Artists)))

	var dbDiscovery []db.ArtistDiscovery
	for _, disc := range *request.Artists {
		dbDiscovery = append(dbDiscovery, db.ArtistDiscovery{
			ArtistName: disc.ArtistName,
			TrackUri:   disc.TrackUri,
		})
	}

	res := s.db.Clauses(clause.OnConflict{DoNothing: true}).Create(&dbDiscovery)

	s.db.Exec("NOTIFY discovery")

	if res.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": res.Error.Error()})
		return
	}

	c.Status(http.StatusOK)
}

func (s *Server) handleGetDiscoverStatus(c *gin.Context) {
	var alreadyDiscoveredCount int64
	s.db.Model(&db.Artist{}).Count(&alreadyDiscoveredCount)

	var stillToBeDiscoveredCount int64
	s.db.Model(&db.ArtistDiscovery{}).Count(&stillToBeDiscoveredCount)

	response := StatusReport{
		RemainingArtistsCount:  stillToBeDiscoveredCount,
		AlreadyDiscoveredCount: alreadyDiscoveredCount,
	}

	c.JSON(http.StatusOK, response)
}
