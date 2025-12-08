import React, { useMemo, useState } from 'react';
import {
    Autocomplete,
    Card,
    CardContent,
    CardHeader,
    ListItem, ListItemText, Stack, TextField
} from '@mui/material';
import { SongStatsType } from 'src/stats/type';
import { SortModeSelect, SortModeType } from 'src/components/SortModeSelect';
import { ListChildComponentProps, VariableSizeList } from 'react-window';
import { HoverableDuration } from 'src/components/HoverableDuration';

type TopSongsCardProps = {
    songStats: SongStatsType[];
};

type RankedSongStatsType = SongStatsType & {
    rank: number;
};

const DEFAULT_LIST_ITEM_SIZE = 75;

const TopSongListItem : React.FC<ListChildComponentProps<RankedSongStatsType[]>> = (props: ListChildComponentProps<RankedSongStatsType[]>) => {
    const { index, style, data } = props;

    const song = data[index];

    return (
        <ListItem style={style} key={index} disablePadding={true}>
            <ListItemText
                primary={<>#{song.rank} - {song.name} - {song.artist}</>}
                secondary={<>{song.count} streams - <HoverableDuration durationInMs={song.msPlayed} decimalNumbers={0}/> - First Stream: {song.firstStream.format('DD.MM.YYYY HH:mm')} - Last Stream: {song.lastStream.format('DD.MM.YYYY HH:mm')}</>}
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
    const [selectedSong, setSelectedSong] = useState<string>();
    const [selectedArtist, setSelectedArtist] = useState<string>();

    const sortedPerSong: RankedSongStatsType[] = useMemo(() => {
        const transformed = songStats.toSorted((p1, p2) => p2[sortMode] - p1[sortMode]).map((song, index) => ({
            ...song,
            rank: index + 1,
        }));

        if (selectedSong) {
            return transformed.filter(song => song.name === selectedSong);
        }

        if (selectedArtist) {
            return songStats.filter(song => song.artist === selectedArtist).toSorted((p1, p2) => p2[sortMode] - p1[sortMode]).map((song, index) => ({
                ...song,
                rank: index + 1,
            }));
        }

        return transformed;
    }, [selectedArtist, selectedSong, songStats, sortMode]);

    const songOptions = useMemo(() => {
        const found : { label: string }[] = [];

        for (let i = 0; i < songStats.length; i++) {
            const song = songStats[i];
            if (found.some(item => item.label === song.name)) {
                continue;
            }

            const label = song.name;
            found.push({ label });
        }

        return found.toSorted((a, b) => a.label.localeCompare(b.label));
    }, [songStats]);

    const artistOptions = useMemo(() => {
        const found : { label: string }[] = [];

        for (let i = 0; i < songStats.length; i++) {
            const song = songStats[i];
            if (found.some(item => item.label === song.artist)) {
                continue;
            }

            const label = song.artist;
            found.push({ label });
        }

        return found.toSorted((a, b) => a.label.localeCompare(b.label));
    }, [songStats]);

    const handleSortModeChange = (mode: SortModeType): void => {
        setSortMode(mode);
    };

    const handleSelectedSongChange = (song?: string): void => {
        setSelectedSong(song);
    };

    const handleSelectedArtistChange = (artist?: string): void => {
        setSelectedArtist(artist);
    };

    return (
        <Card>
            <CardHeader
                title={'Top Songs'}
                action={
                    <Stack direction={'row'} spacing={2} width={800}>
                        <Autocomplete
                            disablePortal={true}
                            options={artistOptions}
                            fullWidth={true}
                            renderInput={(params) => <TextField {...params} label={'Artist'} />}
                            onChange={(_, newValue) => handleSelectedArtistChange(newValue?.label)}
                            sx={{ minWidth: 200 }}
                        />
                        <Autocomplete
                            disablePortal={true}
                            options={songOptions}
                            fullWidth={true}
                            renderInput={(params) => <TextField {...params} label={'Song'} />}
                            onChange={(_, newValue) => handleSelectedSongChange(newValue?.label)}
                            sx={{ minWidth: 350 }}
                        />
                        <SortModeSelect
                            sortMode={sortMode}
                            onChange={handleSortModeChange}
                        />
                    </Stack>
                }
            />
            <CardContent>
                <VariableSizeList
                    itemSize={() => DEFAULT_LIST_ITEM_SIZE}
                    height={500}
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
