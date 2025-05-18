package discovery

import (
	"backend/db"
	"backend/spotifyapi"
	"fmt"
	"go.uber.org/zap"
	"gorm.io/gorm"
	"slices"
)

type DiscoverWorker struct {
	batchSize     int
	spotifyClient spotifyapi.SpotifyClient
	db            *gorm.DB
	logger        *zap.Logger
}

func NewDiscoverWorker(batchSize int, spotifyClient spotifyapi.SpotifyClient, db *gorm.DB, logger *zap.Logger) *DiscoverWorker {
	return &DiscoverWorker{
		batchSize:     batchSize,
		spotifyClient: spotifyClient,
		db:            db,
		logger:        logger,
	}
}

func (worker *DiscoverWorker) Run() {

	worker.logger.Info("Starting DiscoverWorker...")
	loginErr := worker.spotifyClient.Login()
	if loginErr != nil {
		return
	}

	err := worker.db.Transaction(func(tx *gorm.DB) error {
		var artists []db.ArtistDiscovery
		worker.db.Limit(worker.batchSize).Find(&artists)

		if len(artists) == 0 {
			worker.logger.Info("No artists discovered. Nothing to do.")
			return nil
		}

		worker.logger.Info(fmt.Sprintf("Queried %d tracks to discover artists for", len(artists)))

		var trackIds []string
		for _, track := range artists {
			trackIds = append(trackIds, track.TrackUri)
		}

		worker.logger.Info("Requesting tracks...")
		foundTracks, err := worker.spotifyClient.GetTracks(trackIds)

		if err != nil {
			worker.logger.Error("Error while fetching tracks", zap.Error(err))
			return err
		}

		var artistIds []string
		var dbTracks []db.Track
		worker.logger.Info("Transforming tracks...")
		for _, track := range foundTracks {
			dbTrack := &db.Track{
				BaseSpotifyModel: db.BaseSpotifyModel{
					ID: track.Id,
				},
				Name:     track.Name,
				Uri:      track.Uri,
				Duration: track.Duration.Duration(),
			}

			for _, artist := range *track.Artists {
				artistIds = append(artistIds, artist.Id)
			}

			dbTracks = append(dbTracks, *dbTrack)
		}

		var dbArtists []db.Artist

		worker.logger.Info("Filtering already existing artists...")
		var alreadyExistingArtists []db.Artist
		res := worker.db.Where("id IN (?)", artistIds).Find(&alreadyExistingArtists)
		if res.Error != nil {
			worker.logger.Error("Error while querying existing artists", zap.Error(res.Error))
			return res.Error
		}

		var alreadyExistingArtistIds []string
		for _, artist := range alreadyExistingArtists {
			alreadyExistingArtistIds = append(alreadyExistingArtistIds, artist.ID)
		}

		var filteredIds []string
		for _, existing := range artistIds {
			if slices.Contains(alreadyExistingArtistIds, existing) {
				continue
			}
			filteredIds = append(filteredIds, existing)
		}

		var idsToRequest []string
		for _, artistId := range filteredIds {
			idsToRequest = append(idsToRequest, artistId)
			if len(idsToRequest) == worker.batchSize {
				// TODO: log progression
				worker.logger.Info("Batch Size reached, sending request for artists")
				foundArtists, artistsErr := worker.spotifyClient.GetArtists(idsToRequest)
				if artistsErr != nil {
					worker.logger.Error("Error while fetching artists", zap.Error(artistsErr))
					return artistsErr
				}

				for _, artist := range foundArtists {
					dbArtists = append(dbArtists, db.Artist{
						BaseSpotifyModel: db.BaseSpotifyModel{
							ID: artist.Id,
						},
						Name:   artist.Name,
						Uri:    artist.Uri,
						Genres: artist.Genres,
					})
				}
				idsToRequest = idsToRequest[:0]
			}
		}

		worker.logger.Info("Requesting remaining artists...")
		if len(idsToRequest) > 0 {
			foundArtists, artistErr := worker.spotifyClient.GetArtists(idsToRequest)
			if artistErr != nil {
				worker.logger.Error("Error while fetching artists", zap.Error(artistErr))
				return artistErr
			}

			for _, artist := range foundArtists {
				dbArtists = append(dbArtists, db.Artist{
					BaseSpotifyModel: db.BaseSpotifyModel{
						ID: artist.Id,
					},
					Name:   artist.Name,
					Uri:    artist.Uri,
					Genres: artist.Genres,
				})
			}
		}

		worker.logger.Info("Transformed data, saving data.")
		res = worker.db.Create(&dbTracks)
		if res.Error != nil {
			return res.Error
		}
		res = worker.db.Create(&dbArtists)
		if res.Error != nil {
			worker.logger.Error("Error during db action", zap.Error(res.Error))
			return res.Error
		}
		res = worker.db.Delete(&artists)
		if res.Error != nil {
			worker.logger.Error("Error during db action", zap.Error(res.Error))
			return res.Error
		}
		return nil
	})

	if err != nil {
		worker.logger.Error("Error while discovering artists", zap.Error(err))
	}
}
