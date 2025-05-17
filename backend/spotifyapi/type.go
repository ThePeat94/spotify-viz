package spotifyapi

import (
	"encoding/json"
	"fmt"
	"time"
)

type MillisecondDuration time.Duration

type SecondDuration time.Duration

type BaseSpotifyIdentifier struct {
	Id   string `json:"id"`
	Name string `json:"name"`
	Uri  string `json:"uri"`
}

type Image struct {
	Url    string `json:"url"`
	Height int    `json:"height"`
	Width  int    `json:"width"`
}

type Artist struct {
	LightweightArtist
	Genres       []string      `json:"genres"`
	ExternalUrls *ExternalUrls `json:"external_urls"`
	Images       *[]Image      `json:"images,omitzero"`
}

type LightweightArtist struct {
	BaseSpotifyIdentifier
}

type ExternalUrls struct {
	SpotifyUrl *string `json:"spotify,omitzero"`
}

type Track struct {
	BaseSpotifyIdentifier
	Duration *MillisecondDuration `json:"duration_ms,omitempty"`
	Artists  *[]LightweightArtist `json:"artists,omitempty"`
}

type ClientCredentials struct {
	AccessToken string         `json:"access_token"`
	TokenType   string         `json:"token_type"`
	ExpiresIn   SecondDuration `json:"expires_in"`
}

type ArtistsResponse struct {
	Artists []Artist `json:"artists"`
}

func (d *MillisecondDuration) UnmarshalJSON(b []byte) error {
	var ms int64
	if err := json.Unmarshal(b, &ms); err != nil {
		return fmt.Errorf("MillisecondDuration.UnmarshalJSON: %w", err)
	}
	*d = MillisecondDuration(time.Duration(ms) * time.Millisecond)
	return nil
}

func (d *MillisecondDuration) Duration() time.Duration {
	return time.Duration(*d)
}

func (d *MillisecondDuration) MarshalJSON() ([]byte, error) {
	milliseconds := d.Duration().Milliseconds()
	return json.Marshal(milliseconds)
}

func (d *SecondDuration) UnmarshalJSON(b []byte) error {
	var ms int64
	if err := json.Unmarshal(b, &ms); err != nil {
		return fmt.Errorf("SecondDuration.UnmarshalJSON: %w", err)
	}
	*d = SecondDuration(time.Duration(ms) * time.Second)
	return nil
}

func (d *SecondDuration) Duration() time.Duration {
	return time.Duration(*d)
}

func (d *SecondDuration) MarshalJSON() ([]byte, error) {
	milliseconds := d.Duration().Seconds()
	return json.Marshal(milliseconds)
}
