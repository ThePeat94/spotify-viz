package db

import (
	"gorm.io/gorm"
	"time"
)

type Track struct {
	gorm.Model
	SpotifyId string
	Duration  time.Duration
}
