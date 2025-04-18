import React, { useMemo, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    List,
    ListItem,
    ListItemText,
    Slider,
    Stack,
    Typography
} from '@mui/material';
import { SongStatsType } from 'src/stats/type';
import { SortModeSelect, SortModeType } from 'src/components/SortModeSelect';

type TopSongsCardProps = {
    songStats: SongStatsType[];
};

/**
 * A Card which displays the top songs.
 */
const TopSongsCard: React.FC<TopSongsCardProps> = (props) => {
    const {
        songStats,
    } = props;

    const [topSongCount, setTopSongCount] = useState<number>(50);
    const [sortMode, setSortMode] = useState<SortModeType>('count');

    const sortedPerSong = useMemo(() => {
        return songStats.sort((p1, p2) => p2[sortMode] - p1[sortMode]).slice(0, topSongCount);
    }, [songStats, topSongCount, sortMode]);

    const handleSortModeChange = (mode: SortModeType): void => {
        setSortMode(mode);
    };

    return (
        <Card>
            <CardHeader
                title={'Top Songs'}
                action={
                    <Box width={'200px'}>
                        <SortModeSelect
                            sortMode={sortMode}
                            onChange={handleSortModeChange}
                        />
                    </Box>
                }
            />
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
                    {sortedPerSong.map((p, i) => (
                        <ListItem>
                            <ListItemText
                                primary={<>#{i + 1} - {p.name} - {p.artist}</>}
                                secondary={<>{p.count} streams - {(p.msPlayed/1000/60).toLocaleString(undefined, { maximumFractionDigits: 0 })} minutes</>}
                            />
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
};

export default TopSongsCard;
