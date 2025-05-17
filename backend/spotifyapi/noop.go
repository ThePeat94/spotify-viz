package spotifyapi

import "go.uber.org/zap"

type NoopClient struct {
	Logger *zap.Logger
}

func (n *NoopClient) Login() error {
	n.Logger.Info("Noop: Logging in")
	return nil
}

func (n *NoopClient) GetArtist(id string) (*Artist, error) {
	n.Logger.Info("Noop: Getting artist", zap.String("id", id))
	return nil, nil
}

func (n *NoopClient) GetArtists(ids []string) ([]Artist, error) {
	n.Logger.Info("Noop: Getting artists")
	return nil, nil
}

func (n *NoopClient) GetTrack(id string) (*Track, error) {
	n.Logger.Info("Noop: Getting track", zap.String("id", id))
	return nil, nil
}

func (n *NoopClient) GetTracks(ids []string) ([]Track, error) {
	n.Logger.Info("Noop: Getting tracks")
	return nil, nil
}
