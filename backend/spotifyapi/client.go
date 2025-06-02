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

	client          *resty.Client
	loginExpiration time.Time
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
	sClient := &Client{
		BaseApiUrl:   config.BaseApiUrl,
		AccountUrl:   config.AccountUrl,
		ClientId:     config.ClientID,
		ClientSecret: config.ClientSecret,
		Logger:       logger,
	}

	client := sClient.buildRestyClient(config, logger)
	sClient.client = client

	return sClient
}

func (c *Client) Login() error {
	if time.Now().Before(c.loginExpiration) {
		c.Logger.Info("Login still valid, no need to login")
		return nil
	}

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
	c.loginExpiration = time.Now().Add(time.Duration(parsedResponse.ExpiresIn) * time.Second)
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

func (c *Client) buildRestyClient(config config.SpotifyConfig, logger *zap.Logger) *resty.Client {
	client := resty.New().
		SetLogger(logger.Sugar()).
		SetHeader("Content-Type", "application/json").
		SetHeader("Accept", "application/json").
		OnAfterResponse(c.handleAnyResponse)

	buildLogger := logger.With()
	if config.RetryCount != nil {
		buildLogger = buildLogger.With(
			zap.Int("retry_count", *config.RetryCount),
		)
		client = client.SetRetryCount(*config.RetryCount)
	}

	if config.RetryWaitTime != nil {
		buildLogger = buildLogger.With(
			zap.Duration("retry_wait_time", *config.RetryWaitTime),
		)
		client = client.SetRetryWaitTime(*config.RetryWaitTime)
	}

	if config.TimeOut != nil {
		buildLogger = buildLogger.With(
			zap.Duration("timeout", *config.TimeOut),
		)
		client = client.SetTimeout(*config.TimeOut)
	} else {
		buildLogger = buildLogger.With(
			zap.Duration("timeout", 30*time.Second),
		)
		client = client.SetTimeout(30 * time.Second)
	}

	if config.RetryCount != nil || config.RetryWaitTime != nil {
		client = client.AddRetryCondition(func(response *resty.Response, err error) bool {
			if response.IsSuccess() {
				return false
			}

			if response.StatusCode() == http.StatusTooManyRequests {
				logger.Warn("Spotify API rate limit exceeded, do not retry for now")
				return false
			}

			if response.StatusCode() == http.StatusUnauthorized {
				logger.Warn("Spotify API - Unauthorized, attempt relogin and retry operation")
				loginErr := c.Login()
				if loginErr != nil {
					logger.Warn("Spotify API - Login failed, do not retry", zap.Error(loginErr))
					return false
				}
				logger.Info("Spotify API - Authorized, retry operation")
				return true
			}

			if response.StatusCode() >= http.StatusInternalServerError {
				logger.Warn("Spotify API - Retryable error", zap.Error(err))
				return true
			}
			return false
		})
	}
	buildLogger.Info("Spotify API - Client initialized")

	return client
}

func (c *Client) handleAnyResponse(client *resty.Client, response *resty.Response) error {
	var err error
	logLevel := zap.InfoLevel
	if response.StatusCode() == http.StatusUnauthorized {
		err = fmt.Errorf("spotify API - Unauthorized")
		logLevel = zap.WarnLevel
	}

	if response.StatusCode() == http.StatusTooManyRequests {
		err = fmt.Errorf("spotify Api - Rate Limit reached")
		logLevel = zap.WarnLevel
	}

	if response.IsError() {
		err = fmt.Errorf("spotify Api - Other Response Error")
		logLevel = zap.ErrorLevel
	}

	c.Logger.With(
		zap.Int("response_status_code", response.StatusCode()),
		zap.String("request_method", response.Request.Method),
		zap.String("request_url", response.Request.URL),
		zap.Duration("duration", response.Time()),
	).Log(logLevel, "Spotify API response")

	return err
}
