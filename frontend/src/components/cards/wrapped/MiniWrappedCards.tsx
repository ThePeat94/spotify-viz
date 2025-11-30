import React, { useState } from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Card, CardContent,
    CardHeader,
    Grid2,
    Typography
} from '@mui/material';
import { PlaybackData } from 'src/streams/type';
import { analyzeArtists, analyzeSongs } from 'src/utils/analysis';
import { ToProcessType, WrappedCardData, WrappedData, WrappedYearCardData } from 'src/components/cards/wrapped/type';
import MiniWrappedCard from 'src/components/cards/wrapped/MiniWrappedCard';
import { ArrowDownward } from '@mui/icons-material';

type Props = {
    rawData: PlaybackData[];
};

const processRawData = (rawData: PlaybackData[]): [WrappedCardData, WrappedYearCardData] => {
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
            const topArtists = analyzeArtists(pbData).sort((a, b) => b.count - a.count).slice(0, 5);
            const topSongs = analyzeSongs(pbData).sort((a, b) => b.count - a.count).slice(0, 5);

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

    const analyzedYearClusters: WrappedYearCardData = Object.entries(clustered).reduce((accY, [year, data]) => {
        const allPbData = Object.values(data).flat();

        const topArtists = analyzeArtists(allPbData).sort((a, b) => b.count - a.count).slice(0, 5);
        const topSongs = analyzeSongs(allPbData).sort((a, b) => b.count - a.count).slice(0, 5);

        accY[Number(year)] = {
            topArtists,
            topSongs,
            totalStreams: allPbData.length,
            totalPlayedMs: allPbData.reduce((a, b) => a + b.ms_played, 0),
        };

        return accY;
    }, {} as WrappedYearCardData);

    return [analyzedClusters, analyzedYearClusters];
};

/**
 * A component which displays all mini wrap cards
 */
const MiniWrappedCards: React.FC<Props> = ({ rawData }) => {

    const [processedData, setProcessedData] = useState<[WrappedCardData, WrappedYearCardData]>();

    const [processedMonthData, processedYearData] = processedData ?? [{}, {}];

    const handleGenerateMiniWrapsClick = (): void => {
        setProcessedData(processRawData(rawData));
    };

    return (
        <Card>
            <CardHeader
                title={<Typography variant={'h4'}>Your monthly mini Wrappeds</Typography>}
                action={!processedData ? <Button onClick={handleGenerateMiniWrapsClick} variant={'outlined'}>Generate</Button> : undefined}
            />
            <CardContent>
                {processedData && Object.keys(processedYearData).map((year) => (
                    <Accordion key={year}>
                        <AccordionSummary
                            expandIcon={<ArrowDownward />}
                        >
                            <Typography variant={'h6'}>{year}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid2 container={true} spacing={2}>
                                {Object.entries(processedMonthData[Number(year)]).map(([month, monthsData]) => (
                                    <Grid2 size={4}
                                        key={`${year}-${month}`}
                                    >
                                        <MiniWrappedCard
                                            year={Number(year)}
                                            month={Number(month)}
                                            wrappedData={monthsData}
                                        />
                                    </Grid2>
                                ))}
                                <Grid2 size={4}>
                                    <MiniWrappedCard
                                        year={Number(year)}
                                        wrappedData={processedYearData[Number(year)]}
                                    />
                                </Grid2>
                            </Grid2>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </CardContent>
        </Card>
    );
};

export default MiniWrappedCards;
