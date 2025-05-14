package spotifyapi

import (
	"fmt"
	"github.com/go-resty/resty/v2"
	"go.uber.org/zap"
)

type SpotifyClient struct {
	ApiToken     string
	BaseApiUrl   string
	AccountUrl   string
	ClientId     string
	ClientSecret string
	Logger       *zap.Logger

	client *resty.Client
}

type SpotifyClientInterface interface {
	Login()
	GetArtist(id string) (*Artist, error)
	GetArtists(ids []string) ([]*Artist, error)
}

var (
	artistEndpoint  = "/api/v1/artists/%s"
	artistsEndpoint = "/api/v1/artists?ids=%s"
	tokenEndpoint   = "/api/token"
)

func NewSpotifyClient(baseApiUrl, apiToken string, logger *zap.Logger) *SpotifyClient {
	client := resty.New()

	return &SpotifyClient{
		ApiToken:     apiToken,
		BaseApiUrl:   baseApiUrl,
		AccountUrl:   "http://localhost:3041",
		ClientId:     "bar_foo",
		ClientSecret: "1234",
		Logger:       logger,
		client:       client,
	}
}

func (c *SpotifyClient) Login() error {
	c.Logger.Info("Generation Spotify token for requests")
	formData := map[string]string{
		"grant_type": "client_credentials",
	}

	resp, err := c.client.R().
		SetLogger(c.Logger.Sugar()).
		SetHeader("Content-Type", "application/json").
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
