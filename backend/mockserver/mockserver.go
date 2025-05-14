package mockserver

import "github.com/gin-gonic/gin"

func RunSpotifyMockServer() {
	r := gin.Default()

	r.Run()
}
