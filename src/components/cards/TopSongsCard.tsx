import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, List, ListItem, ListItemText, Slider, Stack, Typography } from '@mui/material';
import { SongStatsType } from 'src/stats/type';

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

    const sortedPerSong = useMemo(() => {
        return songStats.sort((p1, p2) => p2.count - p1.count).slice(0, topSongCount);
    }, [songStats, topSongCount]);

    return (
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
    );
};

export default TopSongsCard;
