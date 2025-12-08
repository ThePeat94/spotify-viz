import React, { useMemo, useState } from 'react';
import {
    Autocomplete,
    Card,
    CardContent,
    CardHeader,
    ListItem,
    ListItemText, Stack, TextField
} from '@mui/material';
import { ArtistStatsType } from 'src/stats/type';
import { SortModeSelect, SortModeType } from 'src/components/SortModeSelect';
import { ListChildComponentProps, VariableSizeList } from 'react-window';
import { HoverableDuration } from 'src/components/HoverableDuration';

type TopArtistsStreamCardProps = {
    artistStats: ArtistStatsType[];
};

type RankedArtistStatsType = ArtistStatsType & {
    rank: number;
}

const DEFAULT_LIST_ITEM_SIZE = 75;

const TopArtistListItem : React.FC<ListChildComponentProps<RankedArtistStatsType[]>> = (props: ListChildComponentProps<RankedArtistStatsType[]>) => {
    const { index, style, data } = props;

    const  artist  = data[index];

    return (
        <ListItem style={style} key={index} disablePadding={true}>
            <ListItemText
                primary={<>#{artist.rank} - {artist.name}</>}
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

    const [selectedArtist, setSelectedArtist] = useState<string>();

    const artistOptions = useMemo(() => {
        return artistStats.map(artist => ({
            label: artist.name,
        })).toSorted((a, b) => a.label.localeCompare(b.label));
    }, [artistStats]);


    const sortedPerArtist: RankedArtistStatsType[]  = useMemo(() => {
        const transformed = artistStats.toSorted((p1, p2) => p2[sortMode] - p1[sortMode]).map((artist, index) => ({
            ...artist,
            rank: index + 1,
        }));

        if (selectedArtist) {
            console.log('Selected artist: ', selectedArtist);
            return transformed.filter(artist => artist.name === selectedArtist);
        }

        return transformed;
    }, [artistStats, sortMode, selectedArtist]);

    const handleSelectedArtistChange = (artist?: string): void => {
        setSelectedArtist(artist);
    };

    return (
        <Card>
            <CardHeader
                title={'Top Artists'}
                action={
                    <Stack direction={'row'} spacing={2} width={600}>
                        <Autocomplete
                            disablePortal={true}
                            options={artistOptions}
                            fullWidth={true}
                            renderInput={(params) => <TextField {...params} label={'Artist'} />}
                            onChange={(_, newValue) => handleSelectedArtistChange(newValue?.label)}
                            sx={{ minWidth: 350 }}
                        />
                        <SortModeSelect
                            sortMode={sortMode}
                            onChange={setSortMode}
                        />
                    </Stack>
                }
            />
            <CardContent>
                <Stack spacing={2}>
                    <VariableSizeList
                        itemSize={() => DEFAULT_LIST_ITEM_SIZE}
                        height={500}
                        itemData={sortedPerArtist}
                        itemCount={sortedPerArtist.length}
                        width={'100%'}
                        overscanCount={10}
                    >
                        {TopArtistListItem}
                    </VariableSizeList>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default TopArtistsStreamCard;
