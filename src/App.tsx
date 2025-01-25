import React, {useMemo, useState} from "react";
import {
    Button,
    ButtonGroup,
    Card,
    CardContent,
    CardHeader,
    CircularProgress, createTheme, CssBaseline,
    Grid2, List, ListItem, ListItemText, Skeleton, Slider, Stack,
    styled, ThemeProvider,
    Typography
} from "@mui/material";
import {PlaybackData} from "./streams/type.ts";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterMoment} from "@mui/x-date-pickers/AdapterMoment";
import {Moment} from "moment/moment";
import moment from "moment/moment";
import {performAndMeasure} from "./utils/performance.ts";

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

interface ArtistStatsType {
    name: string;
    count: number;
}

interface SongStatsType {
    name: string;
    count: number;
    artist: string;
}

interface StatsType {
    playBackDataCount: number;
    earliestEntry: Moment;
    latestEntry: Moment;
    uniqueArtists: number;
    uniqueSongs: number;
    totalSecondsPlayed: number;
}

const dateTimeFormatOptions : Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'};


const App = () => {

    const [loading, setLoading] = useState<boolean>(false);

    const [allPlaybackData, setAllPlaybackData] = useState<PlaybackData[]>([]);
    const [minDuration, setMinDuration] = useState<number>(0);
    const [topArtistCount, setTopArtistCount] = useState<number>(50);
    const [topSongCount, setTopSongCount] = useState<number>(50);
    const [unfilteredStats, setUnfilteredStats] = useState<StatsType>();

    const [fromDate, setFromDate] = useState<Moment | null>(null);
    const [toDate, setToDate] = useState<Moment | null>(null);

    const baseData = useMemo(() => {
        let result = allPlaybackData.filter(d => d.ms_played >= minDuration);

        if (fromDate) {
            result = result.filter(d => moment(d.ts).toDate() >= fromDate.toDate());
        }

        if (toDate) {
            result = result.filter(d => moment(d.ts).toDate() <= toDate.endOf('day').toDate());
        }

        return result;
    }, [allPlaybackData, fromDate, minDuration, toDate]);

    const playedPerArtist : ArtistStatsType[] = useMemo(() => {
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
        }))
    }, [baseData]);

    const playedPerSong: SongStatsType[] = useMemo(() => {
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
        }, {} as Record<string, number>)

        return Object.entries(trackCount).map(([k, v]) => {
            return {name: trackUriTracks[k], count: v, artist: trackUriArtist[k] };
        })
    }, [baseData]);

    const sortedPerArtist = useMemo(() => {
        return playedPerArtist.sort((p1, p2) => p2.count - p1.count).slice(0, topArtistCount);
    }, [playedPerArtist, topArtistCount]);

    const sortedPerSong = useMemo(() => {
        return playedPerSong.sort((p1, p2) => p2.count - p1.count).slice(0, topSongCount);
    }, [playedPerSong, topSongCount]);


    const parseFile = (file: File): Promise<void> => {
        const reader = new FileReader();
        const parsingLoader = new Promise<void>((resolve) => {
            reader.onload = (data) => {
                if (!data.target?.result) {
                    return;
                }
                console.log("HMMM????")
                const parsed : PlaybackData[] = JSON.parse(data.target?.result.toString());
                parsed.forEach(a => {
                    a.ts = new Date(a.ts);
                });
                setAllPlaybackData((prevState) => {
                    console.log("lol what");
                    return performAndMeasure("parseFile", () => {
                        const all = [...prevState, ...parsed];
                        const allTs = all.map(a => a.ts.getTime());

                        const uniqueArtistCount = all
                            .flatMap(pb => pb.master_metadata_album_artist_name ?? [])
                            .filter((s, index, array) => array.indexOf(s) === index)
                            .length;

                        const uniqueSongCount = all
                            .flatMap(pb => pb.spotify_track_uri)
                            .filter((s, index, array) => array.indexOf(s) === index)
                            .length;

                        setUnfilteredStats({
                            playBackDataCount: all.length,
                            earliestEntry: moment(Math.min(...allTs)),
                            latestEntry: moment(Math.max(...allTs)),
                            uniqueArtists: uniqueArtistCount,
                            uniqueSongs: uniqueSongCount,
                            totalSecondsPlayed: all.reduce((a, b) => a + b.ms_played / 1_000, 0)
                        })

                        return all;
                    });
                });
                resolve();
            }
            console.log("wtf happens here")
            reader.readAsText(file);
        });
        return parsingLoader;
    };

    const parseFiles = async (files?: FileList): Promise<void> => {
        if (!files || files.length === 0) {
            return;
        }
        setLoading(true);

        for (let i = 0; i < files.length; i++) {
            await parseFile(files[i]);
        }
        setLoading(false);
    };

    const filteredStats: StatsType = useMemo(() => {
        const allTs = baseData.map(pb => pb.ts.getTime());
        const uniqueArtistCount = baseData
            .flatMap(pb => pb.master_metadata_album_artist_name ?? [])
            .filter((s, index, array) => array.indexOf(s) === index)
            .length;

        const uniqueSongCount = baseData
            .flatMap(pb => pb.spotify_track_uri)
            .filter((s, index, array) => array.indexOf(s) === index)
            .length;

        return {
            playBackDataCount: baseData.length,
            earliestEntry: new Date(Math.min(...allTs)),
            latestEntry: new Date(Math.max(...allTs)),
            uniqueArtists: uniqueArtistCount,
            uniqueSongs: uniqueSongCount,
            totalSecondsPlayed: baseData.reduce((a, b) => a + b.ms_played/1_000, 0)
        }
    }, [baseData]);


    return (
        <LocalizationProvider dateAdapter={AdapterMoment}>
            <ThemeProvider theme={darkTheme}>
                <CssBaseline>
                    <Grid2 container={true} alignItems={'center'} spacing={2}>
                        <Grid2 size={12}>
                            <Typography variant={'h4'}>Spotify Viz</Typography>
                        </Grid2>
                        <Grid2 size={12}>
                            <ButtonGroup variant={'contained'}>
                                <Button component={'label'} >
                                    Select Files
                                    <VisuallyHiddenInput
                                        type={'file'}
                                        onChange={(event) => parseFiles(event.target.files)}
                                        multiple={true}
                                    />
                                </Button>
                            </ButtonGroup>
                        </Grid2>
                        {loading && (
                            <Grid2 size={12}>
                                <CircularProgress />
                            </Grid2>
                        )}
                    </Grid2>
                    <Typography variant={'h4'} pt={2}>Filter</Typography>
                    <Grid2 container={true} alignItems={'center'} spacing={2}>
                        <Grid2 size={4} p={2}>
                            <Stack>
                                <Typography variant={'body2'}>Min. Duration</Typography>
                                <Slider
                                    getAriaLabel={() => 'Foo'}
                                    min={0}
                                    max={10_000}
                                    step={100}
                                    marks={true}
                                    valueLabelDisplay={'on'}
                                    onChange={(_, v) => setMinDuration(v as number)}
                                    value={minDuration}
                                />
                                <Typography variant={'caption'}>{minDuration/1000}s</Typography>
                            </Stack>
                        </Grid2>
                        <Grid2 size={2}>
                            <DatePicker
                                maxDate={toDate ?? undefined}
                                label={'From'}
                                value={fromDate}
                                onChange={v => setFromDate(v)}
                            />
                        </Grid2>
                        <Grid2 size={2}>
                            <DatePicker
                                minDate={fromDate ?? undefined}
                                label={'To'}
                                value={toDate}
                                onChange={v => setToDate(v)}
                            />
                        </Grid2>
                    </Grid2>
                    <Grid2 container={true} alignItems={'center'} spacing={2}>
                        <Grid2 size={12}>
                            <Typography variant={'h4'} pt={2}>Data Analysis</Typography>
                        </Grid2>
                        <Grid2 size={4}>
                            <Card>
                                <CardHeader title={'Top Artists'}/>
                                <CardContent>
                                    <Stack>
                                        <Slider
                                            getAriaLabel={() => 'Foo'}
                                            min={10}
                                            max={500}
                                            step={10}
                                            marks={true}
                                            onChange={(_, v) => setTopArtistCount(v as number)}
                                            value={topArtistCount}
                                        />
                                        <Typography>Display {topArtistCount} Top Artists</Typography>
                                    </Stack>
                                    <List
                                        sx={{
                                            maxHeight: 300,
                                            overflow: 'auto',
                                        }}
                                    >
                                        {sortedPerArtist.map(p => (
                                            <ListItem>
                                                <ListItemText
                                                    primary={p.name}
                                                    secondary={p.count}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid2>
                        <Grid2 size={4}>
                            <Card>
                                <CardHeader title={'Top Songs'}/>
                                <CardContent>
                                    <Stack>
                                        <Slider
                                            getAriaLabel={() => 'Foo'}
                                            min={10}
                                            max={500}
                                            step={10}
                                            marks={true}
                                            onChange={(_, v) => setTopSongCount(v as number)}
                                            value={topSongCount}
                                        />
                                        <Typography>Display {topSongCount} Top Songs</Typography>
                                    </Stack>
                                    <List
                                        sx={{
                                            maxHeight: 300,
                                            overflow: 'auto',
                                        }}
                                    >
                                        {sortedPerSong.map(p => (
                                            <ListItem>
                                                <ListItemText
                                                    primary={<>{p.name} - {p.artist}</>}
                                                    secondary={p.count}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
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
                            <Card>
                                <CardHeader title={'Meta Stats (unfiltered)'}/>
                                <CardContent>
                                    {loading && (
                                        <Stack>
                                            <Skeleton variant={'text'}/>
                                            <Skeleton variant={'text'}/>
                                            <Skeleton variant={'text'}/>
                                            <Skeleton variant={'text'}/>
                                            <Skeleton variant={'text'}/>
                                        </Stack>
                                    )}
                                    {unfilteredStats && !loading && (
                                        <Stack spacing={2}>
                                            <Typography>Playback count: {unfilteredStats.playBackDataCount}</Typography>
                                            <Typography>Earliest Entry: {unfilteredStats.earliestEntry.format("dd.MM.YYYY hh:mm:ss")}</Typography>
                                            <Typography>Latest Entry: {unfilteredStats.latestEntry.format("dd.MM.YYYY hh:mm:ss")}</Typography>
                                            <Typography>Unique Artists: {unfilteredStats.uniqueArtists}</Typography>
                                            <Typography>Unique Songs: {unfilteredStats.uniqueSongs}</Typography>
                                            <Typography>Unique Songs: {unfilteredStats.totalSecondsPlayed}</Typography>
                                        </Stack>
                                    )}
                                    {!unfilteredStats && !loading && (
                                        <Typography>No Data yet</Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid2>
                        <Grid2 size={4}>
                            <Card>
                                <CardHeader title={'Meta Stats (filtered)'}/>
                                <CardContent>
                                    {loading && (
                                        <Stack>
                                            <Skeleton variant={'text'}/>
                                            <Skeleton variant={'text'}/>
                                            <Skeleton variant={'text'}/>
                                            <Skeleton variant={'text'}/>
                                            <Skeleton variant={'text'}/>
                                        </Stack>
                                    )}
                                    {unfilteredStats && !loading && (
                                        <Stack spacing={2}>
                                            <Typography>Playback count: {filteredStats.playBackDataCount}</Typography>
                                            <Typography>Earliest Entry: {filteredStats.earliestEntry.toLocaleDateString("de-DE", dateTimeFormatOptions)}</Typography>
                                            <Typography>Latest Entry: {filteredStats.latestEntry.toLocaleDateString("de-DE", dateTimeFormatOptions)}</Typography>
                                            <Typography>Unique Artists: {filteredStats.uniqueArtists}</Typography>
                                            <Typography>Unique Songs: {filteredStats.uniqueSongs}</Typography>
                                            <Typography>Unique Songs: {filteredStats.totalSecondsPlayed}</Typography>
                                        </Stack>
                                    )}
                                    {!unfilteredStats && !loading && (
                                        <Typography>No Data yet</Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid2>
                        <Grid2 size={4}>
                            <Card>
                                <CardHeader title={'Meta Stats diff'}/>
                                <CardContent>
                                    {loading && (
                                        <Stack>
                                            <Skeleton variant={'text'}/>
                                            <Skeleton variant={'text'}/>
                                            <Skeleton variant={'text'}/>
                                        </Stack>
                                    )}
                                    {unfilteredStats && !loading && (
                                        <Stack spacing={2}>
                                            <Typography>Playback count diff: {unfilteredStats.playBackDataCount - filteredStats.playBackDataCount}</Typography>
                                            <Typography>Unique Artists diff: {unfilteredStats.uniqueArtists - filteredStats.uniqueArtists}</Typography>
                                            <Typography>Unique Songs diff: {unfilteredStats.uniqueSongs - filteredStats.uniqueSongs}</Typography>
                                        </Stack>
                                    )}
                                    {!unfilteredStats && !loading && (
                                        <Typography>No Data yet</Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid2>
                        <Grid2 size={4}>
                            <Card>
                                <CardHeader title={'Feature Log'}/>
                                <CardContent>
                                    <List>
                                        <ListItem>
                                            <Typography>
                                            Seconds per artist
                                            </Typography>
                                        </ListItem>
                                        <ListItem>
                                            <Typography>
                                            Seconds per song
                                            </Typography>
                                        </ListItem>
                                        <ListItem>
                                            <Typography>
                                            Streams vs. seconds
                                            </Typography>
                                        </ListItem>
                                        <ListItem>
                                            <Typography>
                                            Grouping per Artist
                                            </Typography>
                                        </ListItem>
                                        <ListItem>
                                            <Typography>
                                            Filter per Artist
                                            </Typography>
                                        </ListItem>
                                        <ListItem>
                                            <Typography>
                                            Filter for min. date
                                            </Typography>
                                        </ListItem>
                                        <ListItem>
                                            <Typography>
                                            Filter for max. date
                                            </Typography>
                                        </ListItem>
                                        <ListItem>
                                            <Typography>
                                            Device stats
                                            </Typography>
                                        </ListItem>
                                        <ListItem>
                                            <Typography>
                                            Stop reasons
                                            </Typography>
                                        </ListItem>
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid2>
                    </Grid2>
                </CssBaseline>
            </ThemeProvider>
        </LocalizationProvider>
    );
}

export default App
