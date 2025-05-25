package spotifyapi

import (
	"backend/config"
	"fmt"
	"github.com/go-resty/resty/v2"
	"go.uber.org/zap"
	"net/http"
	"strings"
	"time"
)

type Client struct {
	BaseApiUrl   string
	AccountUrl   string
	ClientId     string
	ClientSecret string
	Logger       *zap.Logger

	client   *resty.Client
	loggedIn bool
}

type SpotifyClient interface {
	Login() error
	GetArtist(id string) (*Artist, error)
	GetArtists(ids []string) ([]Artist, error)
	GetTrack(id string) (*Track, error)
	GetTracks(ids []string) ([]Track, error)
}

var (
	artistEndpoint  = "/v1/artists/%s"
	artistsEndpoint = "/v1/artists?ids=%s"
	trackEndpoint   = "/v1/tracks/%s"
	tracksEndpoint  = "/v1/tracks?ids=%s"
	tokenEndpoint   = "/api/token"
)

func NewSpotifyClient(config config.SpotifyConfig, logger *zap.Logger) *Client {
	client := resty.New().
		SetLogger(logger.Sugar()).
		SetHeader("Content-Type", "application/json").
		SetHeader("Accept", "application/json").
		OnAfterResponse(func(client *resty.Client, response *resty.Response) error {
			logger.With(
				zap.Int("response_status_code", response.StatusCode()),
				zap.String("response_body", string(response.Body())),
			).Info("Spotify API response")

			if response.StatusCode() == http.StatusUnauthorized {
				return fmt.Errorf("spotify API - Unauthorized")
			}

			if response.StatusCode() == http.StatusTooManyRequests {
				return fmt.Errorf("spotify Api - Rate Limit reached")
			}

			if response.IsError() {
				return fmt.Errorf("spotify Api - Other Response Error")
			}

			return nil
		})

	if config.RetryCount != nil {
		client = client.SetRetryCount(*config.RetryCount)
	}

	if config.RetryWaitTime != nil {
		client = client.SetRetryWaitTime(*config.RetryWaitTime)
	}

	if config.TimeOut != nil {
		client = client.SetTimeout(*config.TimeOut)
	} else {
		client = client.SetTimeout(30 * time.Second)
	}

	sClient := &Client{
		BaseApiUrl:   config.BaseApiUrl,
		AccountUrl:   config.AccountUrl,
		ClientId:     config.ClientID,
		ClientSecret: config.ClientSecret,
		Logger:       logger,
	}

	if config.RetryCount != nil || config.RetryWaitTime != nil {
		client = client.AddRetryCondition(func(response *resty.Response, err error) bool {
			if response.StatusCode() == http.StatusUnauthorized {
				logger.Warn("Spotify API - Unauthorized, attempt relogin and retry operation")
				loginErr := sClient.Login()
				if loginErr != nil {
					return false
				}
				return true
			}

			logger.Warn("Spotify API - Retryable error", zap.Error(err))
			return response.StatusCode() >= http.StatusInternalServerError
		})
	}

	sClient.client = client

	return sClient
}

func (c *Client) Login() error {
	c.Logger.Info("Generation Spotify token for requests")
	formData := map[string]string{
		"grant_type": "client_credentials",
	}

	loginUrl := fmt.Sprintf("%s%s", c.AccountUrl, tokenEndpoint)

	resp, err := c.client.R().
		SetFormData(formData).
		SetBasicAuth(c.ClientId, c.ClientSecret).
		SetResult(&ClientCredentials{}).
		Post(loginUrl)

	if err != nil {
		responseErrorLogger(resp, err, c.Logger).Error(
			"Error during Spotify Token generation",
		)
		return err
	}

	parsedResponse := resp.Result().(*ClientCredentials)
	c.Logger.Info(
		"Successfully generated token, setting auth info.",
		zap.Duration("expires_in", parsedResponse.ExpiresIn.Duration()),
	)
	c.client.SetAuthScheme("Bearer").SetAuthToken(parsedResponse.AccessToken)

	return nil
}

func (c *Client) GetArtist(id string) (*Artist, error) {
	c.Logger.Info("Getting artist", zap.String("id", id))

	formattedEndpoint := fmt.Sprintf(artistEndpoint, id)
	artistUrl := fmt.Sprintf("%s%s", c.BaseApiUrl, formattedEndpoint)

	resp, err := c.client.R().
		SetResult(&Artist{}).
		Get(artistUrl)

	if err != nil {
		responseErrorLogger(resp, err, c.Logger).Error(
			"Error while getting artist",
			zap.String("id", id),
		)
		return nil, err
	}

	artist := resp.Result().(*Artist)
	c.Logger.Info(
		"Successfully received artist",
		zap.String("id", id),
		zap.String("artist_name", artist.Name),
	)

	return artist, nil
}

func (c *Client) GetArtists(ids []string) ([]Artist, error) {
	c.Logger.Info("Getting artists", zap.Strings("ids", ids))

	formattedEndpoint := fmt.Sprintf(artistsEndpoint, strings.Join(ids, ","))
	artistsUrl := fmt.Sprintf("%s%s", c.BaseApiUrl, formattedEndpoint)

	resp, err := c.client.R().
		SetResult(&ArtistsResponse{}).
		Get(artistsUrl)

	if err != nil {
		responseErrorLogger(resp, err, c.Logger).Error(
			"Error while getting artists",
			zap.Strings("ids", ids),
		)

		return nil, err
	}

	artists := resp.Result().(*ArtistsResponse).Artists
	c.Logger.Info(
		"Successfully received artists",
		zap.Strings("ids", ids),
		zap.Int("artists_count", len(artists)),
	)

	return artists, nil
}

func (c *Client) GetTrack(id string) (*Track, error) {
	c.Logger.Info("Getting track", zap.String("id", id))

	formattedEndpoint := fmt.Sprintf(trackEndpoint, id)
	trackUrl := fmt.Sprintf("%s%s", c.BaseApiUrl, formattedEndpoint)

	resp, err := c.client.R().
		SetResult(&Track{}).
		Get(trackUrl)

	if err != nil {
		responseErrorLogger(resp, err, c.Logger).Error(
			"Error while getting track",
			zap.String("id", id),
		)
		return nil, err
	}

	track := resp.Result().(*Track)
	c.Logger.Info(
		"Successfully received track",
		zap.String("id", id),
		zap.String("track_name", track.Name),
	)

	return track, nil
}

func (c *Client) GetTracks(ids []string) ([]Track, error) {
	c.Logger.Info("Getting tracks", zap.Strings("ids", ids))

	formattedEndpoint := fmt.Sprintf(tracksEndpoint, strings.Join(ids, ","))
	tracksUrl := fmt.Sprintf("%s%s", c.BaseApiUrl, formattedEndpoint)

	resp, err := c.client.R().
		SetResult(&TracksResponse{}).
		Get(tracksUrl)

	if err != nil {
		responseErrorLogger(resp, err, c.Logger).Error(
			"Error while getting tracks",
			zap.Strings("ids", ids),
		)

		return nil, err
	}

	tracks := resp.Result().(*TracksResponse).Tracks
	c.Logger.Info("Successfully received tracks",
		zap.Strings("ids", ids),
		zap.Int("tracks_count", len(tracks)),
	)

	return tracks, nil
}

func responseErrorLogger(resp *resty.Response, err error, baseLogger *zap.Logger) *zap.Logger {
	modifiedLogger := baseLogger.With(
		zap.Error(err),
	)

	if resp != nil {
		modifiedLogger = modifiedLogger.With(
			zap.Int("status_code", resp.StatusCode()),
			zap.String("response", resp.String()),
		)
	} else {
		baseLogger.Warn("nil response, maybe timeout")
	}

	return modifiedLogger
}
