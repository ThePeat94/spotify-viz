import React, { useMemo, useState } from 'react';
import { WrappedData } from 'src/components/cards/wrapped/type';
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    Grid2,
    List,
    ListItem,
    ListItemText,
    Stack,
    Typography
} from '@mui/material';
import moment from 'moment';
import { HoverableDuration } from 'src/components/HoverableDuration';
import { getGradientByHash } from 'src/utils/gradients';
import { Download } from '@mui/icons-material';

type Props = {
    year?: number;
    month?: number;
    wrappedData: WrappedData,
    isExportTemplate?: boolean;
    onExportClick?: () => void;
};

/**
 * A component which displays the top data in a mini wrapped card format
 */
const MiniWrappedCard: React.FC<Props> = ({ year, month, wrappedData, isExportTemplate = false, onExportClick }) => {
    const gradient = useMemo(() => {
        return getGradientByHash(`${year}-${month}-${wrappedData.totalStreams}-${wrappedData.totalPlayedMs}`);
    }, [year, month, wrappedData.totalStreams, wrappedData.totalPlayedMs]);

    const title = useMemo(() => {
        if (!month) {
            return `${year} Wrapped`;
        }
        return `${month && moment.months()[month - 1]} ${year} Wrapped`;
    }, [month, year]);

    const [actionsVisible, setActionsVisible] = useState<boolean>(false);


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
                title={<Typography variant={'h4'}>{title}</Typography>}
                action={actionsVisible && onExportClick && <Button onClick={onExportClick} variant={'contained'} startIcon={<Download/>}>Export as PNG</Button>}
                onMouseEnter={() => setActionsVisible(true)} onMouseLeave={() => setActionsVisible(false)}
            />
            <CardContent>
                <Grid2 container={true} spacing={2}>
                    <Grid2 size={6}>
                        <Stack>
                            <Typography variant={'h6'}>Top Artists</Typography>
                            <List>
                                {wrappedData.topArtists.map((artist, index) => (
                                    <ListItem key={artist.name} style={{ background: 'rgba(0, 0, 0, 0.2)', marginTop: 2, marginBottom: 2 }}>
                                        <ListItemText
                                            primary={<>#{index + 1} - {artist.name}</>}
                                            secondary={<>{artist.count} streams - <HoverableDuration durationInMs={artist.msPlayed} decimalNumbers={0} isExportTemplate={isExportTemplate}/></>}
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
                                    <ListItem key={song.name + song.artist} style={{ background: 'rgba(0, 0, 0, 0.2)', marginTop: 2, marginBottom: 2 }}>
                                        <ListItemText
                                            primary={<>#{index + 1} - {song.name}</>}
                                            secondary={<>{song.count} streams - <HoverableDuration durationInMs={song.msPlayed} decimalNumbers={0} isExportTemplate={isExportTemplate}/></>}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Stack>
                    </Grid2>
                    <Grid2 size={12} style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
                        <List>
                            <ListItem>
                                <ListItemText primary={<Typography variant={'body1'}>Total Streams: {wrappedData.totalStreams}</Typography>}/>
                            </ListItem>
                            <ListItem>
                                <ListItemText primary={<Typography variant={'body1'}>Total Listening Time: <HoverableDuration durationInMs={wrappedData.totalPlayedMs} decimalNumbers={0} isExportTemplate={isExportTemplate}/></Typography>}/>
                            </ListItem>
                        </List>
                    </Grid2>
                </Grid2>
            </CardContent>
        </Card>
    );
};

export default MiniWrappedCard;
