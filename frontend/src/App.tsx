import React, { useMemo, useState } from 'react';
import {
    Alert,
    Card, CardContent, CardHeader,
    Grid2, Link, Stack, Typography,
} from '@mui/material';
import moment from 'moment/moment';
import { PlaybackData } from 'src/streams/type';
import { DataFilterType } from 'src/filter/type';
import DataFilter from 'src/components/DataFilter';
import FeatureLogCard from 'src/components/cards/FeatureLogCard';
import { ArtistStatsType, SongStatsType, StatsType } from 'src/stats/type';
import StatsCard from 'src/components/cards/StatsCard';
import StatsDiffCard from 'src/components/cards/StatsDiffCard';
import TopArtistsStreamCard from 'src/components/cards/TopArtistsStreamCard';
import TopSongsCard from 'src/components/cards/TopSongsCard';
import DataImport from 'src/components/DataImport';
import { performAndMeasure } from 'src/utils/performance';
import { maximumOf, minimumOf } from 'src/utils/numbers';
import {
    calculateUniqueCounts
} from 'src/data/analysis';
import { Moment } from 'moment';
import { TotalListenedPerYearCard } from 'src/components/cards/TotalListenedPerYearCard';
import { ArtistAnalysisCard } from 'src/components/cards/ArtistAnalysisCard';
import MiniWrappedCards from 'src/components/cards/wrapped/MiniWrappedCards';
import { analyzeArtists, analyzeSongs } from 'src/utils/analysis';
import ArtistWrapped from 'src/components/cards/wrapped/ArtistWrapped';

const getFilterFromDates = (fromDate: Moment | null, toDate: Moment | null): (pb: PlaybackData) => boolean  => {
    if (fromDate && toDate) {
        return (pb: PlaybackData) => moment(pb.ts).isBetween(fromDate, toDate);
    }

    if (fromDate) {
        return (pb: PlaybackData) => moment(pb.ts).isAfter(fromDate);
    }

    if (toDate) {
        return (pb: PlaybackData) => moment(pb.ts).isBefore(toDate);
    }

    return () => true;
};

const App = () => {

    const [loading] = useState<boolean>(false);

    const [allPlaybackData, setAllPlaybackData] = useState<PlaybackData[]>([]);
    const [unfilteredStats, setUnfilteredStats] = useState<StatsType>();

    const [filter, setFilter] = useState<DataFilterType>({
        minDuration: 30_000,
    });

    const { minDuration, from, to } = filter;

    const fromDate = useMemo(() => {
        return from ? moment(from) : null;
    }, [from]);

    const toDate = useMemo(() => {
        return to ? moment(to) : null;
    }, [to]);

    const baseData = useMemo(() => {
        return performAndMeasure('filter base data', () => {
            const appliesToDates = getFilterFromDates(fromDate, toDate);
            return allPlaybackData.filter(d => d.ms_played >= minDuration && appliesToDates(d));
        });
    }, [allPlaybackData, fromDate, minDuration, toDate]);

    const playedPerArtist : ArtistStatsType[] = useMemo(() => {
        return performAndMeasure('playedPerArtist', () => analyzeArtists(baseData));
    }, [baseData]);

    const playedPerSong: SongStatsType[] = useMemo(() => {
        return performAndMeasure('playedPerSong', () => analyzeSongs(baseData));
    }, [baseData]);

    const filteredStats: StatsType | undefined = useMemo(() => {
        return performAndMeasure('filteredStats', () => {
            if (!baseData.length) {
                return undefined;
            }

            const allTs = performAndMeasure('transform timestamps', () => baseData.map(pb => pb.ts.getTime()));
            const filteredAnalysisCounts = performAndMeasure('calculate unique counts', () => {
                return calculateUniqueCounts(baseData);
            });

            return {
                playBackDataCount: baseData.length,
                earliestEntry: moment(minimumOf(allTs)),
                latestEntry: moment(maximumOf(allTs)),
                uniqueArtists: filteredAnalysisCounts.uniqueArtistCount,
                uniqueSongs: filteredAnalysisCounts.uniqueSongCount,
                totalSecondsPlayed: baseData.reduce((a, b) => a + b.ms_played/1_000, 0)
            };
        });
    }, [baseData]);

    const handleDataChange = (data: PlaybackData[], stats: StatsType): void  => {
        setAllPlaybackData(data);
        setUnfilteredStats(stats);
    };

    const handeDiscoverArtistsClick = (): void => {
        if (!allPlaybackData) {
            return;
        }

        const artistsAndTrack : Record<string, string> = {};
        allPlaybackData.forEach(pb => {
            if (pb.master_metadata_album_artist_name && pb.spotify_track_uri && artistsAndTrack[pb.master_metadata_album_artist_name] === undefined) {
                artistsAndTrack[pb.master_metadata_album_artist_name] = pb.spotify_track_uri.replace('spotify:track:', '');
            }
        });

        const artistsToDiscover = Object.entries(artistsAndTrack).map(([artistName, trackUri]) => ({
            artistName,
            trackUri
        }));
    };

    return (
        <>
            <Grid2 container={true} alignItems={'center'} spacing={2} p={2}>
                <Grid2 size={12}>
                    <Typography variant={'h3'} justifySelf={'center'}>StreamLens 🧙‍♂️</Typography>
                </Grid2>
                <Grid2 size={12}>
                    <Card sx={{ height: '100%' }}>
                        <CardHeader title={<Typography variant={'h4'}>Welcome</Typography>}/>
                        <CardContent>
                            <Typography>Welcome to StreamLens! This tool enables you to explore your extended streaming history from spotify.</Typography>
                        </CardContent>
                    </Card>
                </Grid2>
                <Grid2 size={12}>
                    <Card>
                        <CardHeader title={<Typography variant={'h4'}>How to use</Typography>}/>
                        <CardContent>
                            <Stack spacing={1}>
                                <Typography>1. Request your extended Spotify streaming history from <Link href={'https://www.spotify.com/us/account/privacy/'} target={'_blank'}>here</Link> (log into your account if needed)</Typography>
                                <Typography>2. Wait until Spotify sends you the confirmation, that your data is ready to be downloaded</Typography>
                                <Typography>3. Download the data from the link in the email</Typography>
                                <Typography>4. Unzip the downloaded file</Typography>
                                <Typography>5. Upload the <b>Streaming_History_Audio_*.json</b> files from the unzipped folder to this tool.</Typography>
                                <Typography>6. Explore your data!</Typography>
                                <Alert severity={'info'}>Depending on the amount and size of your data, the import might take some time. You can also import a subset of the data and explore that, totally up to you :)</Alert>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid2>
                <Grid2 size={12}>
                    <DataImport onChange={handleDataChange}/>
                </Grid2>
            </Grid2>
            {allPlaybackData.length > 0 && (
                <>
                    <Grid2 p={2}>
                        <DataFilter
                            earliestYear={unfilteredStats?.earliestEntry.year()}
                            latestYear={unfilteredStats?.latestEntry.year()}
                            value={filter}
                            onChange={setFilter}
                        />
                    </Grid2>
                    <Grid2 container={true} alignItems={'center'} spacing={2} p={2}>
                        <Grid2 size={12}>
                            <Typography variant={'h4'} pt={2}>Data Analysis</Typography>
                        </Grid2>
                        <Grid2 size={6}>
                            <TopArtistsStreamCard artistStats={playedPerArtist}/>
                        </Grid2>
                        <Grid2 size={6}>
                            <TopSongsCard songStats={playedPerSong}/>
                        </Grid2>
                        <Grid2 size={4}>
                            <StatsCard title={'Unfiltered Stats'} loading={loading} stats={unfilteredStats}/>
                        </Grid2>
                        <Grid2 size={4}>
                            <StatsCard title={'Filtered Stats'} loading={loading} stats={filteredStats}/>
                        </Grid2>
                        <Grid2 size={4}>
                            <StatsDiffCard loading={loading} unfilteredStats={unfilteredStats} filteredStats={filteredStats}/>
                        </Grid2>
                        <Grid2 size={12}>
                            <TotalListenedPerYearCard
                                data={allPlaybackData}
                                earliestYear={unfilteredStats?.earliestEntry.year()}
                                latestYear={unfilteredStats?.latestEntry.year()}
                            />
                        </Grid2>
                        <Grid2 size={12}>
                            <ArtistAnalysisCard
                                data={allPlaybackData}
                                artists={playedPerArtist}
                                earliestYear={unfilteredStats?.earliestEntry.year()}
                                latestYear={unfilteredStats?.latestEntry.year()}
                            />
                        </Grid2>
                        <Grid2 size={12}>
                            <MiniWrappedCards rawData={allPlaybackData} />
                        </Grid2>
                        <Grid2 size={12}>
                            <ArtistWrapped artistStats={playedPerArtist} songStats={playedPerSong}/>
                        </Grid2>
                        <Grid2 size={4}>
                            <FeatureLogCard />
                        </Grid2>
                    </Grid2>
                </>
            )}
        </>
    );
};

export default App;
