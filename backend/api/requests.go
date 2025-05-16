package api

type DiscoveredArtist struct {
	ArtistName string `json:"artistName"`
	TrackUri   string `json:"trackUri"`
}

type DiscoveredArtistsRequest struct {
	Artists *[]DiscoveredArtist `json:"artists,omitempty"`
}
