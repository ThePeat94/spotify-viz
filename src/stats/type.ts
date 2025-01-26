import { Moment } from 'moment';

export type StatsType = {
    playBackDataCount: number;
    earliestEntry: Moment;
    latestEntry: Moment;
    uniqueArtists: number;
    uniqueSongs: number;
    totalSecondsPlayed: number;
}
