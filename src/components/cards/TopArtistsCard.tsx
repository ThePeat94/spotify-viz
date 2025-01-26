import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, List, ListItem, ListItemText, Slider, Stack, Typography } from '@mui/material';
import { ArtistStatsType } from 'src/stats/type';

type TopArtistsCardProps = {
    artistStats: ArtistStatsType[];
};

/**
 * A Card to display the top artists.
 */
const TopArtistsCard: React.FC<TopArtistsCardProps> = (props) => {
    const {
        artistStats,
    } = props;

    const [topArtistCount, setTopArtistCount] = useState<number>(50);

    const sortedPerArtist = useMemo(() => {
        return artistStats.sort((p1, p2) => p2.count - p1.count).slice(0, topArtistCount);
    }, [artistStats, topArtistCount]);

    return (
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
    );
};

export default TopArtistsCard;
