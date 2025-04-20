import React from 'react';
import { StatsType } from 'src/stats/type';
import { Card, CardContent, CardHeader, Skeleton, Stack, Typography } from '@mui/material';

type UnfilteredMetaStatsCardProps = {
    title: string;
    loading: boolean;
    stats?: StatsType;
};

/**
 * A Card to display available stats
 */
const StatsCard: React.FC<UnfilteredMetaStatsCardProps> = (props) => {
    const {
        title,
        loading,
        stats,
    } = props;
    return (
        <Card>
            <CardHeader title={title}/>
            <CardContent>
                {loading && (
                    <Stack>
                        <Skeleton variant={'text'}/>
                        <Skeleton variant={'text'}/>
                        <Skeleton variant={'text'}/>
                        <Skeleton variant={'text'}/>
                        <Skeleton variant={'text'}/>
                        <Skeleton variant={'text'}/>
                    </Stack>
                )}
                {stats && !loading && (
                    <Stack spacing={2}>
                        <Typography>Playback count: {stats.playBackDataCount}</Typography>
                        <Typography>Earliest Entry: {stats.earliestEntry.format('DD.MM.YYYY HH:mm:ss')}</Typography>
                        <Typography>Latest Entry: {stats.latestEntry.format('DD.MM.YYYY HH:mm:ss')}</Typography>
                        <Typography>Unique Artists: {stats.uniqueArtists}</Typography>
                        <Typography>Unique Songs: {stats.uniqueSongs}</Typography>
                        <Typography>Total Seconds: {stats.totalSecondsPlayed}</Typography>
                    </Stack>
                )}
                {!stats && !loading && (
                    <Typography>No Data yet</Typography>
                )}
            </CardContent>
        </Card>
    );
};

export default StatsCard;
