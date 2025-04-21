# Spotify VIZ

This repository contains a collections of visualizations for Spotify's extended streaming history. It should help you
to explore your Spotify data in a more visual way and retain information about past Spotify Wrapped campaigns. It can help you
to understand your musical history and how it has changed over time.

It is a work in progress and is not yet complete. The goal is to create a set of visualizations that can be used to explore the data in interesting ways. 

## How to retrieve your Spotify Extended Streaming History
1. Go to your Spotify account settings and scroll down to the "Privacy" section. ([Link](https://www.spotify.com/us/account/privacy/))
2. Scroll to "Download your data".
3. Select the "Extended streaming history" option and click "Request data".
4. Wait for Spotify to process your request. This may take some time.

After you receive the email with the download link, download the data and extract it. You should see a folder named `my_spotify_data.zip`, which contains a folder `Spotify Extended Streaming History`. There you will find a PDF explaining the data structure, but we will need the `Streaming_History_Audio*.json` files.

5. Go to the application and click "SELECT FILES", select all you `Streaming_History_Audio*.json` files. 
6. Wait for the app to process the data intially. This may take some time depending on the amount of data you have.

## Features
Currently, the following visualizations are available:

- Top Artists
- Top Songs
- First Stream and latest Stream per Artist respectively per Song
- Filter Options
  - Min Duration per Stream
  - From/To Range
- Filter Presets
  - Wrapped
  - Yearly

## Planned
- [ ] actual song duration
- [ ] avg song stream
- [ ] instructions on how to use
- [ ] timeline per artist
- [ ] search for artist in artist card
- [ ] search for song in song card
- [ ] search for artist in song card
