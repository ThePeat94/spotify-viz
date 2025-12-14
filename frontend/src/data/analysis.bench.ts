import { bench, describe } from 'vitest';
import { createRandomData } from 'src/streams/generator';
import {
    calculateUniqueArtistAndSongCount,
    calculateUniqueArtistCount,
    calculateUniqueSongCount
} from 'src/data/analysis';

const sampleSizes = [100, 1_000, 10_000, 100_000];

describe('Performance Tests', () => {

    sampleSizes.forEach(size => {
        describe(`Data Size: ${size}`, () => {
            const rndData = createRandomData(size);

            bench(`non optimized raw - data size: ${size}`, () => {
                calculateUniqueArtistCount(rndData);
                calculateUniqueSongCount(rndData);
            });

            bench(`optimized raw v1 - data size: ${size}`, () => {
                calculateUniqueArtistAndSongCount(rndData);
            });
        });
    });
});
