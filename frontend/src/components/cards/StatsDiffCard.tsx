import React from 'react';
import { StatsType } from 'src/stats/type';
import { Card, CardContent, CardHeader, Skeleton, Stack, Typography } from '@mui/material';

type StatsDiffCardProps = {
    loading: boolean;
    unfilteredStats?: StatsType;
    filteredStats?: StatsType;
};

/**
 * A Card to display the differences between filtered and unfiltered stats
 */
const StatsDiffCard: React.FC<StatsDiffCardProps> = (props) => {
    const {
        loading,
        unfilteredStats,
        filteredStats,
    } = props;
    return (
        <Card>
            <CardHeader title={'Stats diff'}/>
            <CardContent>
                {loading && (
                    <Stack>
                        <Skeleton variant={'text'}/>
                        <Skeleton variant={'text'}/>
                        <Skeleton variant={'text'}/>
                    </Stack>
                )}
                {unfilteredStats && filteredStats && !loading && (
                    <Stack spacing={2}>
                        <Typography>Playback count diff: {unfilteredStats.playBackDataCount - filteredStats.playBackDataCount}</Typography>
                        <Typography>Unique Artists diff: {unfilteredStats.uniqueArtists - filteredStats.uniqueArtists}</Typography>
                        <Typography>Unique Songs diff: {unfilteredStats.uniqueSongs - filteredStats.uniqueSongs}</Typography>
                    </Stack>
                )}
                {!unfilteredStats && !filteredStats && !loading && (
                    <Typography>No Data yet</Typography>
                )}
            </CardContent>
        </Card>
    );
};

export default StatsDiffCard;
