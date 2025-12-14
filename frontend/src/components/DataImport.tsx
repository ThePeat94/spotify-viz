import React, { useState } from 'react';
import {
    Button,
    ButtonGroup,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Stack,
    styled,
    Typography
} from '@mui/material';
import { PlaybackData } from 'src/streams/type';
import { performAndMeasure } from 'src/utils/performance';
import moment from 'moment/moment';
import { StatsType } from 'src/stats/type';
import { maximumOf, minimumOf } from 'src/utils/numbers';
import {
    calculateUniqueArtistAndSongCount
} from 'src/data/analysis';
import { createRandomData } from 'src/streams/generator';

type DataImportProps = {
    onChange?: (data: PlaybackData[], unfilteredStats: StatsType) => void;
}

const VisuallyHiddenInput = styled('input')({
    clipPath: 'inset(0%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

type ImportState = 'NONE' | 'PARSING_FILES' | 'ANALYZING_DATA' | 'DONE';

type ImportInfo = {
    fileCount: number;
    currentFileCount: number;
    state: ImportState;
}

const DataImport: React.FC<DataImportProps> = (props) => {
    const { onChange } = props;

    const [importInfo, setImportInfo] = useState<ImportInfo>({
        state: 'NONE',
        fileCount: 0,
        currentFileCount: 0,
    });

    const parseFile = (file: File): Promise<PlaybackData[]> => {
        const reader = new FileReader();
        return new Promise<PlaybackData[]>((resolve) => {
            reader.onload = (data) => {
                if (!data.target?.result) {
                    return;
                }
                const parsed : PlaybackData[] = JSON.parse(data.target?.result.toString());
                parsed.forEach(a => {
                    a.ts = new Date(a.ts);
                });

                resolve(parsed);
            };
            reader.readAsText(file);
        });
    };

    const handleParseFiles = async (files?: FileList | null): Promise<void> => {
        if (!files) {
            return;
        }

        setImportInfo({
            fileCount: files.length,
            currentFileCount: 0,
            state: 'PARSING_FILES',
        });

        const playbackData : PlaybackData[] = [];
        for (let i = 0; i < files.length; i++) {
            setImportInfo({
                fileCount: files.length,
                currentFileCount: i + 1,
                state: 'PARSING_FILES',
            });
            const file = files[i];
            playbackData.push(...(await parseFile(file)));
        }

        setImportInfo({
            fileCount: files.length,
            currentFileCount: files.length,
            state: 'ANALYZING_DATA',
        });

        const allStats = performAndMeasure('parseFile', () => {
            const allTs = playbackData.map(pb => pb.ts.getTime());

            const analysisResult = calculateUniqueArtistAndSongCount(playbackData);
            const uniqueArtistCount = analysisResult.uniqueArtistCount;
            const uniqueSongCount = analysisResult.uniqueSongCount;

            return {
                playBackDataCount: playbackData.length,
                earliestEntry: moment(minimumOf(allTs)),
                latestEntry: moment(maximumOf(allTs)),
                uniqueArtists: uniqueArtistCount,
                uniqueSongs: uniqueSongCount,
                totalSecondsPlayed: playbackData.reduce((a, b) => a + b.ms_played / 1_000, 0)
            };
        });

        setImportInfo({
            fileCount: files.length,
            currentFileCount: files.length,
            state: 'DONE',
        });

        console.log(allStats);
        onChange?.(playbackData, allStats);
    };

    const handleGenerateRandomDataClick = (): void => {
        const playbackData = createRandomData(100_000);
        console.log(playbackData);

        const allStats = performAndMeasure('parseRandomData', () => {
            const allTs = playbackData.map(pb => pb.ts.getTime());

            const analysisResult = calculateUniqueArtistAndSongCount(playbackData);
            const uniqueArtistCount = analysisResult.uniqueArtistCount;
            const uniqueSongCount = analysisResult.uniqueSongCount;

            return {
                playBackDataCount: playbackData.length,
                earliestEntry: moment(minimumOf(allTs)),
                latestEntry: moment(maximumOf(allTs)),
                uniqueArtists: uniqueArtistCount,
                uniqueSongs: uniqueSongCount,
                totalSecondsPlayed: playbackData.reduce((a, b) => a + b.ms_played / 1_000, 0)
            };
        });

        setImportInfo({
            fileCount: 1,
            currentFileCount: 1,
            state: 'DONE',
        });

        console.log(allStats);
        onChange?.(playbackData, allStats);
    };

    return (
        <Card>
            <CardHeader
                title={<Typography variant={'h4'}>Data Import</Typography>}
            />
            <CardContent>
                <Stack direction={'row'} alignItems={'center'} spacing={1}>
                    <ButtonGroup variant={'contained'}>
                        <Button component={'label'}>
                            Select Files
                            <VisuallyHiddenInput
                                type={'file'}
                                onChange={(event) => handleParseFiles(event.target.files)}
                                multiple={true}
                            />
                        </Button>
                        <Button onClick={handleGenerateRandomDataClick}>
                            Generate Random Data
                        </Button>
                    </ButtonGroup>
                    {importInfo.state !== 'NONE' && importInfo.state !== 'DONE' && (
                        <CircularProgress />
                    )}
                    {importInfo.state === 'NONE' && (
                        <Typography>Nothing imported yet</Typography>
                    )}
                    {importInfo.state === 'PARSING_FILES' && (
                        <Typography>Importing {importInfo.currentFileCount} of {importInfo.fileCount}</Typography>
                    )}
                    {importInfo.state === 'ANALYZING_DATA' && (
                        <Typography>Analyzing Data</Typography>
                    )}
                    {importInfo.state === 'DONE' && (
                        <Typography>Done</Typography>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};

export default DataImport;
