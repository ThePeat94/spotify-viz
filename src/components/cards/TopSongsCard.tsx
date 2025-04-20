import React, { useMemo, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    ListItem, ListItemText
} from '@mui/material';
import { SongStatsType } from 'src/stats/type';
import { SortModeSelect, SortModeType } from 'src/components/SortModeSelect';
import { ListChildComponentProps, VariableSizeList } from 'react-window';

type TopSongsCardProps = {
    songStats: SongStatsType[];
};

const DEFAULT_LIST_ITEM_SIZE = 75;

const TopSongListItem : React.FC<ListChildComponentProps<SongStatsType[]>> = (props: ListChildComponentProps<SongStatsType[]>) => {
    const { index, style, data } = props;

    const song = data[index];

    return (
        <ListItem style={style} key={index} disablePadding={true}>
            <ListItemText
                primary={<>#{index + 1} - {song.name} - {song.artist}</>}
                secondary={<>{song.count} streams - {(song.msPlayed/1000/60).toLocaleString(undefined, { maximumFractionDigits: 0 })} minutes</>}
            />
        </ListItem>
    );
};


/**
 * A Card which displays the top songs.
 */
const TopSongsCard: React.FC<TopSongsCardProps> = (props) => {
    const {
        songStats,
    } = props;

    const [sortMode, setSortMode] = useState<SortModeType>('count');

    const sortedPerSong = useMemo(() => {
        return songStats.sort((p1, p2) => p2[sortMode] - p1[sortMode]);
    }, [songStats, sortMode]);

    const handleSortModeChange = (mode: SortModeType): void => {
        setSortMode(mode);
    };

    return (
        <Card>
            <CardHeader
                title={'Top Songs'}
                action={
                    <Box width={'200px'}>
                        <SortModeSelect
                            sortMode={sortMode}
                            onChange={handleSortModeChange}
                        />
                    </Box>
                }
            />
            <CardContent>
                <VariableSizeList
                    itemSize={() => DEFAULT_LIST_ITEM_SIZE}
                    height={Math.min(sortedPerSong.length * DEFAULT_LIST_ITEM_SIZE, 500)}
                    itemData={sortedPerSong}
                    itemCount={sortedPerSong.length}
                    width={'100%'}
                    overscanCount={10}
                >
                    {TopSongListItem}
                </VariableSizeList>
            </CardContent>
        </Card>
    );
};

export default TopSongsCard;
