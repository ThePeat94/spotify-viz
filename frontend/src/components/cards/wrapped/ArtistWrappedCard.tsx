import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, Grid2, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import { HoverableDuration } from 'src/components/HoverableDuration';
import { getGradientByHash } from 'src/utils/gradients';
import { ArtistStatsType, SongStatsType } from 'src/stats/type';

type Props = {
    artist: ArtistStatsType;
    songs: SongStatsType[],
};

/**
 * A component which displays the top data in a mini wrapped card format
 */
const ArtistWrappedCard: React.FC<Props> = ({ artist, songs }) => {
    const gradient = useMemo(() => {
        return getGradientByHash(`${artist.name}-${artist.msPlayed}-${artist.count}`);
    }, [artist.count, artist.msPlayed, artist.name]);

    const topSongs = useMemo(() => songs.sort((a, b) => b.msPlayed - a.msPlayed).slice(0, 5), [songs]);

    return (
        <Card sx={{
            background: gradient,
            color: 'white',
            '& .MuiTypography-root': { color: 'white' },
            '& .MuiListItemText-primary': { color: 'white' },
            '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.8)' }
        }}>
            <CardHeader
                style={{ textAlign: 'center' }}
                title={<Typography variant={'h4'}>{artist.name}</Typography>}
            />
            <CardContent>
                <Grid2 container={true} spacing={2}>
                    <Grid2 size={12}>
                        <Stack>
                            <Typography variant={'h6'}>Top Songs</Typography>
                            <List>
                                {topSongs.map((song, index) => (
                                    <ListItem key={song.name + song.artist} style={{ background: 'rgba(0, 0, 0, 0.2)', marginTop: 2, marginBottom: 2 }}>
                                        <ListItemText
                                            primary={<>#{index + 1} - {song.name}</>}
                                            secondary={<>{song.count} streams - <HoverableDuration durationInMs={song.msPlayed} decimalNumbers={0}/></>}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Stack>
                    </Grid2>
                    <Grid2 size={12} style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
                        <List>
                            <ListItem>
                                <ListItemText primary={<Typography variant={'body1'}>Total Streams: {artist.count}</Typography>}/>
                            </ListItem>
                            <ListItem>
                                <ListItemText primary={<Typography variant={'body1'}>Total Listening Time: <HoverableDuration durationInMs={artist.msPlayed} decimalNumbers={0}/></Typography>}/>
                            </ListItem>
                        </List>
                    </Grid2>
                </Grid2>
            </CardContent>
        </Card>
    );
};

export default ArtistWrappedCard;
