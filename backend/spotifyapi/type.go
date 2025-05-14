package spotifyapi

type Artist struct {
	Id     string   `json:"id"`
	Name   string   `json:"name"`
	Genres []string `json:"genres"`
	Uri    string   `json:"uri"`
}

type ClientCredentials struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
}
