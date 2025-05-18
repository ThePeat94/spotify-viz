package db

import (
	"github.com/lib/pq"
	"gorm.io/gorm"
	"time"
)

type Track struct {
	gorm.Model
	SpotifyId string `gorm:"index;unique"`
	Name      string
	Uri       string
	Duration  time.Duration
}

type Artist struct {
	gorm.Model
	SpotifyId string `gorm:"index;unique"`
	Name      string
	Uri       string
	Genres    pq.StringArray `gorm:"type:text[]"`
}

type ArtistDiscovery struct {
	gorm.Model
	ArtistName string
	TrackUri   string `gorm:"index;unique"`
}
