import React, { useMemo, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    ListItem,
    ListItemText
} from '@mui/material';
import { ArtistStatsType } from 'src/stats/type';
import { SortModeSelect, SortModeType } from 'src/components/SortModeSelect';
import { ListChildComponentProps, VariableSizeList } from 'react-window';
import { HoverableDuration } from 'src/components/HoverableDuration';

type TopArtistsStreamCardProps = {
    artistStats: ArtistStatsType[];
};

const DEFAULT_LIST_ITEM_SIZE = 75;

const TopArtistListItem : React.FC<ListChildComponentProps<ArtistStatsType[]>> = (props: ListChildComponentProps<ArtistStatsType[]>) => {
    const { index, style, data } = props;

    const  artist  = data[index];

    return (
        <ListItem style={style} key={index} disablePadding={true}>
            <ListItemText
                primary={<>#{index + 1} - {artist.name}</>}
                secondary={<>{artist.count} streams - <HoverableDuration durationInMs={artist.msPlayed} decimalNumbers={0}/>  - First Stream: {artist.firstStream.format('DD.MM.YYYY HH:mm')} - Last Stream: {artist.lastStream.format('DD.MM.YYYY HH:mm')}</>}
            />
        </ListItem>
    );
};

/**
 * A Card to display the top artists.
 */
const TopArtistsStreamCard: React.FC<TopArtistsStreamCardProps> = (props) => {
    const {
        artistStats,
    } = props;

    const [sortMode, setSortMode] = useState<SortModeType>('count');


    const sortedPerArtist = useMemo(() => {
        return artistStats.sort((p1, p2) => p2[sortMode] - p1[sortMode]);
    }, [artistStats, sortMode]);

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
                <VariableSizeList
                    itemSize={() => DEFAULT_LIST_ITEM_SIZE}
                    height={Math.min(sortedPerArtist.length * DEFAULT_LIST_ITEM_SIZE, 500)}
                    itemData={sortedPerArtist}
                    itemCount={sortedPerArtist.length}
                    width={'100%'}
                    overscanCount={10}
                >
                    {TopArtistListItem}
                </VariableSizeList>
            </CardContent>
        </Card>
    );
};

export default TopArtistsStreamCard;
