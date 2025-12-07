import React, { useMemo, useRef, useState } from 'react';
import { ArtistStatsType, SongStatsType } from 'src/stats/type';
import { Autocomplete, Button, Card, CardContent, CardHeader, Stack, TextField, Typography } from '@mui/material';
import ArtistWrappedCard from 'src/components/cards/wrapped/ArtistWrappedCard';
import { toPng } from 'html-to-image';

type Props = {
    artistStats: ArtistStatsType[];
    songStats: SongStatsType[];
};

/**
 * A component which displays artist wrapped data with an artist selector
 */
const ArtistWrapped: React.FC<Props> = ({ artistStats, songStats }) => {
    const [selectedArtist, setSelectedArtist] = useState<string>();

    const cardRef = useRef(null);

    const artistOptions = useMemo(() => {
        return artistStats.map(artist => ({
            label: artist.name,
        })).sort((a, b) => a.label.localeCompare(b.label));
    }, [artistStats]);

    const selectedArtistStats = useMemo(() => {
        return artistStats.find(artist => artist.name === selectedArtist);
    }, [artistStats, selectedArtist]);

    const songsForArtist : SongStatsType[] = useMemo(() => {
        return songStats.filter(song => song.artist === selectedArtist);
    }, [selectedArtist, songStats]);

    const handleExportClick = async (): Promise<void> => {
        if (!cardRef.current){
            return;
        }

        try {
            const dataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                quality: 1,
                width: 660,
                height: 660,
                style: {
                    width: '660px',
                    height: '660px',
                }
            });

            const link = document.createElement('a');
            link.download = `${selectedArtist}-wrapped.png`;
            link.href = dataUrl;
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to export image:', error);
        }
    };

    return (
        <Card>
            <CardHeader
                title={<Typography variant={'h4'}>Artist Wrapped</Typography>}
                action={<Autocomplete
                    disablePortal={true}
                    options={artistOptions}
                    fullWidth={true}
                    renderInput={(params) => <TextField {...params} label={'Artist'} />}
                    onChange={(_, newValue) => setSelectedArtist(newValue?.label)}
                    sx={{ minWidth: 500 }}
                />}
            />
            <CardContent>
                {selectedArtistStats && (
                    <>
                        <Stack>
                            <ArtistWrappedCard artist={selectedArtistStats} songs={songsForArtist} />
                            <Button onClick={handleExportClick}>Export as PNG</Button>
                        </Stack>
                        <div ref={cardRef} style={{ width: '660px', height: '0px', overflow: 'hidden' }}>
                            <ArtistWrappedCard artist={selectedArtistStats} songs={songsForArtist} isExportTemplate={true}/>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default ArtistWrapped;
