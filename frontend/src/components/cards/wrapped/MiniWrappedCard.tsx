import React from 'react';
import { WrappedData } from 'src/components/cards/wrapped/type';
import { Card, CardContent, CardHeader, Grid2, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import moment from 'moment';
import { HoverableDuration } from 'src/components/HoverableDuration';

type Props = {
    year: number;
    month: number;
    wrappedData: WrappedData,
};

/**
 * A component which displays the top data in a mini wrapped card format
 */
const MiniWrappedCard: React.FC<Props> = ({ year, month, wrappedData }) => {
    return (
        <Card>
            <CardHeader style={{ textAlign: 'center' }} title={<Typography variant={'h4'}>{moment.months()[month - 1]} {year} Wrapped</Typography>}/>
            <CardContent>
                <Grid2 container={true} spacing={2}>
                    <Grid2 size={6}>
                        <Stack>
                            <Typography variant={'h6'}>Top Artists</Typography>
                            <List>
                                {wrappedData.topArtists.map((artist, index) => (
                                    <ListItem key={artist.name}>
                                        <ListItemText
                                            primary={<>#{index + 1} - {artist.name}</>}
                                            secondary={<>{artist.count} streams - <HoverableDuration durationInMs={artist.msPlayed} decimalNumbers={0}/></>}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Stack>
                    </Grid2>
                    <Grid2 size={6}>
                        <Stack>
                            <Typography variant={'h6'}>Top Songs</Typography>
                            <List>
                                {wrappedData.topSongs.map((song, index) => (
                                    <ListItem key={song.name + song.artist}>
                                        <ListItemText
                                            primary={<>#{index + 1} - {song.name} - {song.artist}</>}
                                            secondary={<>{song.count} streams - <HoverableDuration durationInMs={song.msPlayed} decimalNumbers={0}/></>}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Stack>
                    </Grid2>
                </Grid2>
            </CardContent>
        </Card>
    );
};

export default MiniWrappedCard;
