package mockserver

import (
	"backend/spotifyapi"
	"fmt"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type Server struct {
	Logger *zap.Logger
	Port   int
}

func (s *Server) RunSpotifyMockServer() error {
	r := gin.Default()

	formattedPort := fmt.Sprintf(":%d", s.Port)

	r.POST("/api/token", func(context *gin.Context) {
		response := &spotifyapi.ClientCredentials{
			AccessToken: "MOCK_ACCESS_TOKEN",
			TokenType:   "Bearer",
			ExpiresIn:   3600,
		}

		context.JSON(200, response)
	})

	return r.Run(formattedPort)
}
