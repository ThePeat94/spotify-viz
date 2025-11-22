import { ArtistStatsType, SongStatsType } from 'src/stats/type';
import { PlaybackData } from 'src/streams/type';

export type WrappedData = {
    topArtists: ArtistStatsType[],
    topSongs: SongStatsType[],
};

export type WrappedCardData = {
    [year: number] : {
        [month: number] : WrappedData,
    }
}

export type ToProcessType = {
    [year: number] : {
        [month: number] : PlaybackData[]
    }
}
