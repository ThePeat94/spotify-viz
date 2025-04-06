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
import TopArtistsCard from 'src/components/cards/TopArtistsCard';
import TopSongsCard from 'src/components/cards/TopSongsCard';
import DataImport from 'src/components/DataImport';
import { performAndMeasure } from 'src/utils/performance.ts';


const App = () => {

    const [loading] = useState<boolean>(false);

    const [allPlaybackData, setAllPlaybackData] = useState<PlaybackData[]>([]);
    const [unfilteredStats, setUnfilteredStats] = useState<StatsType>();

    const [filter, setFilter] = useState<DataFilterType>({
        minDuration: 0,
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
            let result = allPlaybackData.filter(d => d.ms_played >= minDuration);

            if (fromDate) {
                result = result.filter(d => moment(d.ts).toDate() >= fromDate.toDate());
            }

            if (toDate) {
                result = result.filter(d => moment(d.ts).toDate() <= toDate.endOf('day').toDate());
            }

            return result;
        });
    }, [allPlaybackData, fromDate, minDuration, toDate]);

    const playedPerArtist : ArtistStatsType[] = useMemo(() => {
        return performAndMeasure('playedPerArtist', () => {
            const reduced = baseData.reduce((previousValue, currentValue) => {
                if (currentValue.master_metadata_album_artist_name === null) {
                    return previousValue;
                }

                if (!previousValue[currentValue.master_metadata_album_artist_name]) {
                    previousValue[currentValue.master_metadata_album_artist_name] = 0;
                }
                previousValue[currentValue.master_metadata_album_artist_name]++;
                return previousValue;
            }, {} as Record<string, number>);

            return Object.entries(reduced).map(([k, v]) => ({
                name: k, count: v
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
                    prev[current.spotify_track_uri] = 0;
                }

                prev[current.spotify_track_uri]++;
                return prev;
            }, {} as Record<string, number>);

            return Object.entries(trackCount).map(([k, v]) => {
                return { name: trackUriTracks[k], count: v, artist: trackUriArtist[k] };
            });
        });
    }, [baseData]);

    const filteredStats: StatsType | undefined = useMemo(() => {
        return performAndMeasure('filteredStats', () => {
            if (!baseData.length) {
                return undefined;
            }

            const allTs = performAndMeasure('transform timestamps', () => baseData.map(pb => pb.ts.getTime()));
            const uniqueArtistCount = performAndMeasure('unique artist count', () => baseData
                .flatMap(pb => pb.master_metadata_album_artist_name ?? [])
                .filter((s, index, array) => array.indexOf(s) === index)
                .length
            );

            const uniqueSongCount = performAndMeasure('unique song count', () => baseData
                .reduce((prev, current) => {
                    if (prev.includes(current.spotify_track_uri)) {
                        return prev;
                    }
                    prev.push(current.spotify_track_uri);
                    return prev;
                }, [] as string[])
                .length
            );

            return {
                playBackDataCount: baseData.length,
                earliestEntry: moment(allTs),
                latestEntry: moment(allTs),
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
                <DataFilter value={filter} onChange={setFilter}/>
            </Grid2>
            <Grid2 container={true} alignItems={'center'} spacing={2} p={2}>
                <Grid2 size={12}>
                    <Typography variant={'h4'} pt={2}>Data Analysis</Typography>
                </Grid2>
                <Grid2 size={4}>
                    <TopArtistsCard artistStats={playedPerArtist}/>
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
