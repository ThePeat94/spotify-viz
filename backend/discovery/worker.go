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
	var count int64
	countRes := worker.db.Model(&db.ArtistDiscovery{}).Count(&count)

	if countRes.Error != nil {
		worker.logger.Error(countRes.Error.Error())
		return
	}

	if count == 0 {
		worker.logger.Info("No discoveries todo.")
		return
	}

	amountOfProccesses := count / int64(worker.batchSize)
	if count%int64(worker.batchSize) != 0 {
		amountOfProccesses++
	}

	loginErr := worker.spotifyClient.Login()
	if loginErr != nil {
		return
	}

	for i := 0; i < int(amountOfProccesses); i++ {
		err := worker.db.Transaction(func(tx *gorm.DB) error {
			var discoveries []db.ArtistDiscovery
			tx.Limit(worker.batchSize).Find(&discoveries)

			if len(discoveries) == 0 {
				worker.logger.Info("No discoveries found. Nothing to do.")
				return nil
			}

			foundTracks, err := worker.discoverTracks(discoveries)
			if err != nil {
				return err
			}

			dbTracks, artistIds := worker.transformTracksAndExtractArtistIds(foundTracks)
			filteredIds, err := worker.filterForExistingArtists(artistIds, tx)

			if err != nil {
				return err
			}

			artistProcessEr := worker.processArtistIds(filteredIds, tx)
			if artistProcessEr != nil {
				return artistProcessEr
			}

			res := tx.Create(&dbTracks)
			if res.Error != nil {
				return res.Error
			}

			res = tx.Delete(&discoveries)
			if res.Error != nil {
				worker.logger.Error("Error during db action", zap.Error(res.Error))
				return res.Error
			}
			return nil
		})

		if err != nil {
			worker.logger.Error("Error while discovering artists", zap.Error(err))
			return
		}
	}
}

func (worker *DiscoverWorker) processArtistIds(ids []string, tx *gorm.DB) error {
	var dbArtists []db.Artist
	var idsToRequest []string
	for _, artistId := range ids {
		idsToRequest = append(idsToRequest, artistId)
		if len(idsToRequest) == worker.batchSize {
			worker.logger.Info("Batch Size reached, sending request for artists")
			found, artistErr := worker.persistArtistsForIds(idsToRequest)
			if artistErr != nil {
				worker.logger.Error("Error while persisting artists", zap.Error(artistErr))
				return artistErr
			}
			dbArtists = append(dbArtists, found...)
			idsToRequest = idsToRequest[:0]
		}
	}

	worker.logger.Info("Requesting remaining artists...")
	if len(idsToRequest) > 0 {
		found, artistErr := worker.persistArtistsForIds(idsToRequest)
		if artistErr != nil {
			return artistErr
		}
		dbArtists = append(dbArtists, found...)
	}

	res := tx.Create(&dbArtists)
	if res.Error != nil {
		worker.logger.Error("Error during db action", zap.Error(res.Error))
		return res.Error
	}

	return nil
}

func (worker *DiscoverWorker) persistArtistsForIds(ids []string) ([]db.Artist, error) {
	foundArtists, artistsErr := worker.spotifyClient.GetArtists(ids)
	if artistsErr != nil {
		worker.logger.Error("Error while fetching artists", zap.Error(artistsErr))
		return nil, artistsErr
	}

	var dbArtists []db.Artist
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

	return dbArtists, nil
}

func (worker *DiscoverWorker) discoverTracks(discoveries []db.ArtistDiscovery) ([]spotifyapi.Track, error) {
	worker.logger.Info(fmt.Sprintf("Queried %d tracks to discover artists for", len(discoveries)))

	var trackIds []string
	for _, track := range discoveries {
		trackIds = append(trackIds, track.TrackUri)
	}

	worker.logger.Info("Requesting tracks...")

	foundTracks, err := worker.spotifyClient.GetTracks(trackIds)
	if err != nil {
		worker.logger.Error("Error while fetching tracks", zap.Error(err))
		return nil, err
	}

	return foundTracks, nil
}

func (worker *DiscoverWorker) transformTracksAndExtractArtistIds(foundTracks []spotifyapi.Track) ([]db.Track, []string) {
	worker.logger.Info("Transforming tracks and extracting artists...")
	var artistIds []string
	var dbTracks []db.Track
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

	return dbTracks, artistIds
}

func (worker *DiscoverWorker) filterForExistingArtists(artistIds []string, tx *gorm.DB) ([]string, error) {
	worker.logger.Info("Filtering already existing artists...")
	var alreadyExistingArtists []db.Artist
	res := tx.Where("id IN (?)", artistIds).Find(&alreadyExistingArtists)
	if res.Error != nil {
		worker.logger.Error("Error while querying existing artists", zap.Error(res.Error))
		return nil, res.Error
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

	return filteredIds, nil
}
