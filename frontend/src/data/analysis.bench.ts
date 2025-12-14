import { bench, describe } from 'vitest';
import { createRandomData } from 'src/streams/generator';
import {
    calculateUniqueArtistAndSongCount,
} from 'src/data/analysis';
import { PlaybackData } from 'src/streams/type';

const sampleSizes = [100, 1_000, 10_000, 100_000];

// -- Legacy Implementations for Benchmarking --
export const calculateUniqueArtistCountLegacy = (playbackData: PlaybackData[]): number => {
    const foundArtists : string[] = [];
    return playbackData
        .flatMap((pb) => {
            if (pb.master_metadata_album_artist_name === null) {
                return [];
            }

            if (foundArtists.includes(pb.master_metadata_album_artist_name)) {
                return [];
            }

            foundArtists.push(pb.master_metadata_album_artist_name);

            return pb.master_metadata_album_artist_name;
        })
        .length;
};

export const calculateUniqueSongCountLegacy = (playbackData: PlaybackData[]): number  => {

    const uniqueSongs : string[] = [];
    return playbackData
        .flatMap(pb => {
            if (uniqueSongs.includes(pb.spotify_track_uri)) {
                return [];
            }

            uniqueSongs.push(pb.spotify_track_uri);
            return pb.spotify_track_uri;
        })
        .length;
};

// --

describe('Performance Tests', () => {

    sampleSizes.forEach(size => {
        describe(`Data Size: ${size}`, () => {
            const rndData = createRandomData(size);

            bench(`non optimized raw - data size: ${size}`, () => {
                calculateUniqueArtistCountLegacy(rndData);
                calculateUniqueSongCountLegacy(rndData);
            });

            bench(`optimized raw v1 - data size: ${size}`, () => {
                calculateUniqueArtistAndSongCount(rndData);
            });
        });
    });
});
