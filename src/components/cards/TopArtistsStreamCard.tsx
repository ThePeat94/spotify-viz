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
import { ArtistStatsType } from 'src/stats/type';
import { SortModeSelect, SortModeType } from 'src/components/SortModeSelect';

type TopArtistsStreamCardProps = {
    artistStats: ArtistStatsType[];
};

/**
 * A Card to display the top artists.
 */
const TopArtistsStreamCard: React.FC<TopArtistsStreamCardProps> = (props) => {
    const {
        artistStats,
    } = props;

    const [topArtistCount, setTopArtistCount] = useState<number>(50);
    const [sortMode, setSortMode] = useState<SortModeType>('count');


    const sortedPerArtist = useMemo(() => {
        return artistStats.sort((p1, p2) => p2[sortMode] - p1[sortMode]).slice(0, topArtistCount);
    }, [artistStats, topArtistCount, sortMode]);

    return (
        <Card>
            <CardHeader
                title={'Top Artists'}
                action={
                    <Box width={'200px'}>
                        <SortModeSelect
                            sortMode={sortMode}
                            onChange={setSortMode}
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
                    {sortedPerArtist.map((p, i) => (
                        <ListItem>
                            <ListItemText
                                primary={<>#{i + 1} - {p.name}</>}
                                secondary={<>{p.count} streams - {(p.msPlayed/1000/60).toLocaleString(undefined, { maximumFractionDigits: 0 })} minutes</>}
                            />
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
};

export default TopArtistsStreamCard;
