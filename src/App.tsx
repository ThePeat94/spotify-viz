import { useMemo, useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Grid2, Stack, Typography,
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
import { calculateUniqueArtistCount, calculateUniqueSongCount } from 'src/data/analysis';
import { Moment } from 'moment';

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
        return performAndMeasure('playedPerArtist', () => {
            const reduced = baseData.reduce((previousValue, currentValue) => {
                if (currentValue.master_metadata_album_artist_name === null) {
                    return previousValue;
                }

                if (!previousValue[currentValue.master_metadata_album_artist_name]) {
                    previousValue[currentValue.master_metadata_album_artist_name] = {
                        count: 0,
                        msPlayed: 0,
                    };
                }
                previousValue[currentValue.master_metadata_album_artist_name] = {
                    count: previousValue[currentValue.master_metadata_album_artist_name].count + 1,
                    msPlayed: previousValue[currentValue.master_metadata_album_artist_name].msPlayed + currentValue.ms_played,
                };
                return previousValue;
            }, {} as Record<string, { count: number, msPlayed: number }>);

            return Object.entries(reduced).map(([k, v]) => ({
                name: k, count: v.count, msPlayed: v.msPlayed,
            }));
        });
    }, [baseData]);

    const playedPerSong: SongStatsType[] = useMemo(() => {
        return performAndMeasure('playedPerSong', () => {
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
                    };
                }

                prev[current.spotify_track_uri] = {
                    count: prev[current.spotify_track_uri].count + 1,
                    msPlayed: prev[current.spotify_track_uri].msPlayed + current.ms_played,
                };
                return prev;
            }, {} as Record<string, { count: number, msPlayed: number }>);

            return Object.entries(trackCount).map(([k, v]) => {
                return { name: trackUriTracks[k], count: v.count, artist: trackUriArtist[k], msPlayed: v.msPlayed };
            });
        });
    }, [baseData]);

    const filteredStats: StatsType | undefined = useMemo(() => {
        return performAndMeasure('filteredStats', () => {
            if (!baseData.length) {
                return undefined;
            }

            const allTs = performAndMeasure('transform timestamps', () => baseData.map(pb => pb.ts.getTime()));
            const uniqueArtistCount = performAndMeasure('unique artist count', () => calculateUniqueArtistCount(baseData));
            const uniqueSongCount = performAndMeasure('unique song count', () => calculateUniqueSongCount(baseData));

            return {
                playBackDataCount: baseData.length,
                earliestEntry: moment(minimumOf(allTs)),
                latestEntry: moment(maximumOf(allTs)),
                uniqueArtists: uniqueArtistCount,
                uniqueSongs: uniqueSongCount,
                totalSecondsPlayed: baseData.reduce((a, b) => a + b.ms_played/1_000, 0)
            };
        });
    }, [baseData]);

    const handleDataChange = (data: PlaybackData[], stats: StatsType): void  => {
        setAllPlaybackData(data);
        setUnfilteredStats(stats);
    };

    return (
        <>
            <Grid2 container={true} alignItems={'center'} spacing={2} p={2}>
                <Grid2 size={12}>
                    <Typography variant={'h4'}>Spotify Viz</Typography>
                </Grid2>
                <Grid2 size={12}>
                    <DataImport onChange={handleDataChange}/>
                </Grid2>
            </Grid2>
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
                <Grid2 size={4}>
                    <TopArtistsStreamCard artistStats={playedPerArtist}/>
                </Grid2>
                <Grid2 size={4}>
                    <TopSongsCard songStats={playedPerSong}/>
                </Grid2>
                <Grid2 size={4}>
                    <Card>
                        <CardHeader title={'Chains'}/>
                        <CardContent>
                            <Stack>
                                <Typography>Songs, with the longest streak</Typography>
                            </Stack>
                        </CardContent>
                    </Card>
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
                <Grid2 size={4}>
                    <FeatureLogCard />
                </Grid2>
            </Grid2>
        </>
    );
};

export default App;
