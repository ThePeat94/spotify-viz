package spotifyapi

import (
	"fmt"
	"github.com/go-resty/resty/v2"
	"go.uber.org/zap"
	"strings"
)

type Client struct {
	ApiToken     string
	BaseApiUrl   string
	AccountUrl   string
	ClientId     string
	ClientSecret string
	Logger       *zap.Logger

	client *resty.Client
}

type SpotifyClient interface {
	Login() error
	GetArtist(id string) (*Artist, error)
	GetArtists(ids []string) ([]Artist, error)
}

var (
	artistEndpoint  = "/api/v1/artists/%s"
	artistsEndpoint = "/api/v1/artists?ids=%s"
	tokenEndpoint   = "/api/token"
)

func NewSpotifyClient(baseApiUrl, apiToken, accountUrl, clientId, clientSecret string, logger *zap.Logger) *Client {
	client := resty.New()
	client = client.SetLogger(logger.Sugar())
	client = client.SetHeader("Content-Type", "application/json")

	return &Client{
		ApiToken:     apiToken,
		BaseApiUrl:   baseApiUrl,
		AccountUrl:   accountUrl,
		ClientId:     clientId,
		ClientSecret: clientSecret,
		Logger:       logger,
		client:       client,
	}
}

func (c *Client) Login() error {
	c.Logger.Info("Generation Spotify token for requests")
	formData := map[string]string{
		"grant_type": "client_credentials",
	}

	resp, err := c.client.R().
		SetFormData(formData).
		SetBasicAuth(c.ClientId, c.ClientSecret).
		SetResult(&ClientCredentials{}).
		Post(fmt.Sprintf("%s%s", c.AccountUrl, tokenEndpoint))

	if err != nil {
		c.Logger.Error(
			"Error during Spotify Token generation",
			zap.Error(err),
			zap.Int("status_code", resp.StatusCode()),
			zap.String("response", resp.String()),
		)
		return err
	}

	c.Logger.Info("Successfully generated token, setting auth info.")

	parsedResponse := resp.Result().(*ClientCredentials)
	c.client.SetAuthScheme("Bearer").SetAuthToken(parsedResponse.AccessToken)

	return nil
}

func (c *Client) GetArtist(id string) (*Artist, error) {
	c.Logger.Info("Getting artist", zap.String("id", id))

	formattedEndpoint := fmt.Sprintf(artistEndpoint, id)
	resp, err := c.client.R().
		SetResult(&Artist{}).
		Get(fmt.Sprintf("%s%s", c.BaseApiUrl, formattedEndpoint))

	if err != nil {
		c.Logger.Error(
			"Error while getting artist",
			zap.String("id", id),
			zap.Error(err),
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

	resp, err := c.client.R().
		SetResult(&ArtistsResponse{}).
		Get(fmt.Sprintf("%s%s", c.BaseApiUrl, formattedEndpoint))

	if err != nil {
		c.Logger.Error("Error while getting artists",
			zap.Error(err),
			zap.Strings("ids", ids),
		)

		return nil, err
	}

	artists := resp.Result().(*ArtistsResponse).Artists
	c.Logger.Info("Successfully received artists",
		zap.Strings("ids", ids),
		zap.Int("artists_count", len(artists)),
	)

	return artists, nil
}
