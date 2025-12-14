import { PlaybackData } from 'src/streams/type';
import moment from 'moment';
import { Moment } from 'moment/moment';
import { ArtistStatsType, SongStatsType } from 'src/stats/type';

export const analyzeArtists = (baseData: PlaybackData[]) : ArtistStatsType[] => {
    const reduced = baseData.reduce((previousValue, currentValue) => {
        if (currentValue.master_metadata_album_artist_name === null) {
            return previousValue;
        }

        const currentTs = moment(currentValue.ts);

        if (!previousValue[currentValue.master_metadata_album_artist_name]) {
            previousValue[currentValue.master_metadata_album_artist_name] = {
                count: 0,
                msPlayed: 0,
                firstStream: currentTs,
                lastStream: currentTs,
            };
        }
        previousValue[currentValue.master_metadata_album_artist_name] = {
            count: previousValue[currentValue.master_metadata_album_artist_name].count + 1,
            msPlayed: previousValue[currentValue.master_metadata_album_artist_name].msPlayed + currentValue.ms_played,
            firstStream: moment.min(previousValue[currentValue.master_metadata_album_artist_name].firstStream, currentTs),
            lastStream: moment.max(previousValue[currentValue.master_metadata_album_artist_name].lastStream, currentTs),
        };
        return previousValue;
    }, {} as Record<string, { count: number, msPlayed: number, firstStream: Moment, lastStream: Moment }>);

    return Object.entries(reduced).map(([k, v]) => ({
        name: k, count: v.count, msPlayed: v.msPlayed, firstStream: v.firstStream, lastStream: v.lastStream
    }));
};

export const analyzeSongs = (baseData: PlaybackData[]): SongStatsType[] => {
    const trackCount = baseData.reduce((prev, current) => {
        if (current.master_metadata_album_artist_name === null) {
            return prev;
        }

        const currentTs = moment(current.ts);

        if (!prev[current.spotify_track_uri]) {
            prev[current.spotify_track_uri] = {
                name: current.master_metadata_track_name,
                artist: current.master_metadata_album_artist_name,
                count: 0,
                msPlayed: 0,
                firstStream: currentTs,
                lastStream: currentTs,
            };
        }

        prev[current.spotify_track_uri] = {
            name: current.master_metadata_track_name,
            artist: current.master_metadata_album_artist_name,
            count: prev[current.spotify_track_uri].count + 1,
            msPlayed: prev[current.spotify_track_uri].msPlayed + current.ms_played,
            firstStream: moment.min(prev[current.spotify_track_uri].firstStream, currentTs),
            lastStream: moment.max(prev[current.spotify_track_uri].lastStream, currentTs),
        };
        return prev;
    }, {} as Record<string, SongStatsType>);

    return Object.entries(trackCount).map(([_, v]) => {
        return {
            ...v
        };
    });
};
