package db

import (
	"github.com/lib/pq"
	"gorm.io/gorm"
	"time"
)

type Track struct {
	gorm.Model
	SpotifyId string `gorm:"index,unique"`
	Name      string
	Uri       string
	Duration  time.Duration
}

type Artist struct {
	SpotifyId string `gorm:"index,unique"`
	Name      string
	Uri       string
	Genres    pq.StringArray `gorm:"type:text[]"`
}
