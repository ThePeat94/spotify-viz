import { PlaybackData } from 'src/streams/type';
import moment from 'moment';
import { Moment } from 'moment/moment';
import { ArtistStatsType, SongStatsType } from 'src/stats/type';

export const analyzeArtists = (baseData: PlaybackData[]) : ArtistStatsType[] => {
    const reduced = baseData.reduce((previousValue, currentValue) => {
        if (currentValue.master_metadata_album_artist_name === null) {
            return previousValue;
        }

        if (!previousValue[currentValue.master_metadata_album_artist_name]) {
            previousValue[currentValue.master_metadata_album_artist_name] = {
                count: 0,
                msPlayed: 0,
                firstStream: moment(currentValue.ts),
                lastStream: moment(currentValue.ts),
            };
        }
        previousValue[currentValue.master_metadata_album_artist_name] = {
            count: previousValue[currentValue.master_metadata_album_artist_name].count + 1,
            msPlayed: previousValue[currentValue.master_metadata_album_artist_name].msPlayed + currentValue.ms_played,
            firstStream: moment.min(previousValue[currentValue.master_metadata_album_artist_name].firstStream, moment(currentValue.ts)),
            lastStream: moment.max(previousValue[currentValue.master_metadata_album_artist_name].lastStream, moment(currentValue.ts)),
        };
        return previousValue;
    }, {} as Record<string, { count: number, msPlayed: number, firstStream: Moment, lastStream: Moment }>);

    return Object.entries(reduced).map(([k, v]) => ({
        name: k, count: v.count, msPlayed: v.msPlayed, firstStream: v.firstStream, lastStream: v.lastStream
    }));
};

export const analyzeSongs = (baseData: PlaybackData[]): SongStatsType[] => {
    const trackUriTracks = baseData.reduce((prev, current) => {
        if (current.master_metadata_album_artist_name === null) {
            return prev;
        }
        prev[current.spotify_track_uri] = current.master_metadata_track_name;
        return prev;
    }, {} as Record<string, string>);

    const trackUriArtist = baseData.reduce((prev, current) => {
        if (current.master_metadata_album_artist_name === null) {
            return prev;
        }
        prev[current.spotify_track_uri] = current.master_metadata_album_artist_name;
        return prev;
    }, {} as Record<string, string>);

    const trackCount = baseData.reduce((prev, current) => {
        if (current.master_metadata_album_artist_name === null) {
            return prev;
        }

        if (!prev[current.spotify_track_uri]) {
            prev[current.spotify_track_uri] = {
                count: 0,
                msPlayed: 0,
                firstStream: moment(current.ts),
                lastStream: moment(current.ts),
            };
        }

        prev[current.spotify_track_uri] = {
            count: prev[current.spotify_track_uri].count + 1,
            msPlayed: prev[current.spotify_track_uri].msPlayed + current.ms_played,
            firstStream: moment.min(prev[current.spotify_track_uri].firstStream, moment(current.ts)),
            lastStream: moment.max(prev[current.spotify_track_uri].lastStream, moment(current.ts)),
        };
        return prev;
    }, {} as Record<string, { count: number, msPlayed: number, firstStream: Moment, lastStream: Moment }>);

    return Object.entries(trackCount).map(([k, v]) => {
        return {
            name: trackUriTracks[k],
            count: v.count,
            artist: trackUriArtist[k],
            msPlayed: v.msPlayed,
            firstStream: v.firstStream,
            lastStream: v.lastStream
        };
    });
};
