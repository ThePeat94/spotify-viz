import React, { useMemo, useState } from 'react';
import { ArtistStatsType, SongStatsType } from 'src/stats/type';
import { Autocomplete, Grid2, Stack, TextField } from '@mui/material';
import ArtistWrappedCard from 'src/components/cards/wrapped/ArtistWrappedCard';

type Props = {
    artistStats: ArtistStatsType[];
    songStats: SongStatsType[];
};

/**
 * A component which displays artist wrapped data with an artist selector
 */
const ArtistWrapped: React.FC<Props> = ({ artistStats, songStats }) => {
    const [selectedArtist, setSelectedArtist] = useState<string>();

    const artistOptions = useMemo(() => {
        return artistStats.map(artist => ({
            label: artist.name,
        })).sort((a, b) => a.label.localeCompare(b.label));
    }, [artistStats]);

    const selectedArtistStats = useMemo(() => {
        return artistStats.find(artist => artist.name === selectedArtist);
    }, [artistStats, selectedArtist]);

    const songsForArtist : SongStatsType[] = useMemo(() => {
        return songStats.filter(song => song.artist === selectedArtist) ?? [];
    }, [selectedArtist, songStats]);

    return (
        <Grid2 container={true} spacing={2}>
            <Grid2 size={4}>
                <Stack spacing={2}>
                    <Autocomplete
                        disablePortal={true}
                        options={artistOptions}
                        fullWidth={true}
                        renderInput={(params) => <TextField {...params} label={'Artist'} />}
                        onChange={(_, newValue) => setSelectedArtist(newValue?.label)}
                        sx={{ minWidth: 350 }}
                    />
                    {selectedArtistStats && (
                        <ArtistWrappedCard artist={selectedArtistStats} songs={songsForArtist} />
                    )}
                </Stack>
            </Grid2>
        </Grid2>
    );
};

export default ArtistWrapped;
