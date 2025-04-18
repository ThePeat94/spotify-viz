import { Moment } from 'moment';

export type StatsType = {
    playBackDataCount: number;
    earliestEntry: Moment;
    latestEntry: Moment;
    uniqueArtists: number;
    uniqueSongs: number;
    totalSecondsPlayed: number;
}

export type ArtistStatsType = {
    name: string;
    count: number
}

export type SongStatsType = {
    name: string;
    artist: string;
    count: number;
    msPlayed: number;
}
