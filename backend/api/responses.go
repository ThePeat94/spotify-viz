package api

type StatusReport struct {
	RemainingArtistsCount  int64 `json:"remainingArtistsCount"`
	AlreadyDiscoveredCount int64 `json:"alreadyDiscoveredCount"`
}
