package db

import (
	"github.com/lib/pq"
	"gorm.io/gorm"
	"time"
)

type BaseSpotifyModel struct {
	ID        string `gorm:"primarykey"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

type Track struct {
	BaseSpotifyModel
	Name     string
	Uri      string
	Duration time.Duration
}

type Artist struct {
	BaseSpotifyModel
	Name   string
	Uri    string
	Genres pq.StringArray `gorm:"type:text[]"`
}

type ArtistDiscovery struct {
	gorm.Model
	ArtistName string
	TrackUri   string `gorm:"index;unique"`
}
