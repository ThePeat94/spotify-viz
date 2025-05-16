package mockserver

import (
	"backend/spotifyapi"
	"fmt"
	"github.com/brianvoe/gofakeit/v7"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"math/rand/v2"
)

type Server struct {
	Logger *zap.Logger
	Port   int
}

func (s *Server) RunSpotifyMockServer() error {
	r := gin.Default()

	formattedPort := fmt.Sprintf(":%d", s.Port)

	r.POST("/api/token", handlePostToken)
	r.GET("/api/v1/artists/:id", handleGetArtist)
	r.GET("/api/v1/artists", handleGetArtists)

	return r.Run(formattedPort)
}

func handleGetArtist(context *gin.Context) {
	id := context.Param("id")
	response := generateRndArtist(id)
	context.JSON(200, response)
}

func handlePostToken(context *gin.Context) {
	response := &spotifyapi.ClientCredentials{
		AccessToken: gofakeit.Password(true, true, true, false, false, 64),
		TokenType:   "Bearer",
		ExpiresIn:   3600,
	}

	context.JSON(200, response)
}

func handleGetArtists(context *gin.Context) {
	ids := context.QueryArray("ids")
	artists := make([]spotifyapi.Artist, 0)
	for _, id := range ids {
		artists = append(artists, generateRndArtist(id))
	}
	context.JSON(200, gin.H{"artists": artists})
}

func generateRndArtist(id string) spotifyapi.Artist {
	rndGenreCount := rand.IntN(4) + 1
	rndGenres := make([]string, 0)
	for i := 0; i < rndGenreCount; i++ {
		rndGenres = append(rndGenres, gofakeit.SongGenre())
	}
	return spotifyapi.Artist{
		Id:     id,
		Name:   gofakeit.SongArtist(),
		Uri:    gofakeit.UUID(),
		Genres: rndGenres,
	}
}
