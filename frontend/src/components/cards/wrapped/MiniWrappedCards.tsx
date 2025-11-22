import React, { useMemo } from 'react';
import { Grid2, Stack, Typography } from '@mui/material';
import { PlaybackData } from 'src/streams/type';
import { analyzeArtists, analyzeSongs } from 'src/utils/analysis';
import { ToProcessType, WrappedCardData, WrappedData } from 'src/components/cards/wrapped/type';
import MiniWrappedCard from 'src/components/cards/wrapped/MiniWrappedCard';

type Props = {
    rawData: PlaybackData[];
};

const processRawData = (rawData: PlaybackData[]): WrappedCardData => {
    const emptyToProcessCluster : ToProcessType = {};
    const clustered = rawData.reduce((acc, curr) => {
        const ts = new Date(curr.ts);
        const year = ts.getFullYear();
        const month = ts.getMonth() + 1;

        if (!acc[year]) {
            acc[year] = {};
        }

        if (!acc[year][month]) {
            acc[year][month] = [];
        }

        acc[year][month].push(curr);

        return acc;
    }, emptyToProcessCluster);

    const emptyAnalyzedClusters: WrappedCardData = {};

    const analyzedClusters: WrappedCardData = Object.entries(clustered).reduce((accY, [year, data]) => {
        accY[Number(year)] = Object.entries(data).reduce((accM, [month, pbData]) => {
            const topArtists = analyzeArtists(pbData).sort((a, b) => b.msPlayed - a.msPlayed).slice(0, 5);
            const topSongs = analyzeSongs(pbData).sort((a, b) => b.msPlayed - a.msPlayed).slice(0, 5);

            accM[Number(month)] = {
                topArtists,
                topSongs,
                totalStreams: pbData.length,
                totalPlayedMs: pbData.reduce((a, b) => a + b.ms_played, 0),
            };

            return accM;
        }, {} as { [month: number]: WrappedData });

        return accY;
    }, emptyAnalyzedClusters);
    console.log(analyzedClusters);
    return analyzedClusters;
};

/**
 * A component which displays all mini wrap cards
 */
const MiniWrappedCards: React.FC<Props> = ({ rawData }) => {
    const processedData = useMemo(() => processRawData(rawData), [rawData]);
    return (
        <Stack>
            <Typography variant={'h4'}>Your Mini Wrappeds</Typography>
            <Grid2 container={true} spacing={2}>
                {Object.entries(processedData).map(([year, months]) => (
                    Object.entries(months).map(([month, monthsData]) => (
                        <Grid2 size={6}
                            key={`${year}-${month}`}
                        >
                            <MiniWrappedCard
                                year={Number(year)}
                                month={Number(month)}
                                wrappedData={monthsData}
                            />
                        </Grid2>
                    ))
                ))}
            </Grid2>
        </Stack>
    );
};

export default MiniWrappedCards;
