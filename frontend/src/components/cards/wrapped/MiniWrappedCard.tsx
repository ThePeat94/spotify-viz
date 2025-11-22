import React from 'react';
import { WrappedData } from 'src/components/cards/wrapped/type';
import { Card, CardContent, CardHeader, Grid2, Stack, Typography } from '@mui/material';
import moment from 'moment';

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
            <CardHeader title={<Typography variant={'h4'}>{moment.months()[month - 1]} {year} Wrapped</Typography>}/>
            <CardContent>
                <Grid2 container={true} spacing={2}>
                    <Grid2 size={6}>
                        <Stack>
                            <Typography variant={'h6'}>Top Artists</Typography>
                            {wrappedData.topArtists.map((artist, index) => (
                                <Typography key={index}>{index + 1}. {artist.name} - {Math.round(artist.msPlayed / 60000)} minutes</Typography>
                            ))}
                        </Stack>
                    </Grid2>
                    <Grid2 size={6}>
                        <Stack>
                            <Typography variant={'h6'}>Top Songs</Typography>
                            {wrappedData.topSongs.map((song, index) => (
                                <Typography key={index}>{index + 1}. {song.name} - {Math.round(song.msPlayed / 60000)} minutes</Typography>
                            ))}
                        </Stack>
                    </Grid2>
                </Grid2>
            </CardContent>
        </Card>
    );
};

export default MiniWrappedCard;
