import {
    Autocomplete,
    Card,
    CardContent,
    CardHeader,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack, TextField, Typography
} from '@mui/material';
import { BarChart, LineChart } from '@mui/x-charts';
import { generateYearSelections } from 'src/data/analysis';
import { PlaybackData } from 'src/streams/type';
import { formatNumber } from 'src/utils/numbers';
import React, { useMemo, useState } from 'react';
import moment from 'moment/moment';
import { ArtistStatsType } from 'src/stats/type';
import { ChartData } from 'src/utils/chart/type';
import { getLinearSeriesData, getLinearXAxisData, getLinearYAxisData } from 'src/utils/chart/linechart';
import { getBarSeriesData, getBarXAxisData, getBarYAxisData } from 'src/utils/chart/barchart';
import { getDataBuilder } from 'src/utils/chart/databuilder';
import { groupPlaybackDataByArtist } from 'src/utils/analysis';

type ArtistAnalysisCardPropsType = {
    data: PlaybackData[],
    artists: ArtistStatsType[],
    earliestYear?: number,
    latestYear?: number,
}

type DisplayModeType = 'line' | 'bar';

type GranularityLevelType = 'year' | 'month' | 'day';

export const ArtistAnalysisCard: React.FC<ArtistAnalysisCardPropsType> = (props) => {
    const { data, artists, earliestYear, latestYear } = props;

    const [granularityLevel, setGranularityLevel] = useState<GranularityLevelType>('year');
    const [selectedYear, setSelectedYear] = useState<number>();
    const [selectedMonth, setSelectedMonth] = useState<number>();
    const [displayMode, setDisplayMode] = useState<DisplayModeType>('line');
    const [selectedArtists, setSelectedArtists] = useState<string[]>();

    const artistOptions = useMemo(() => {
        return artists.map(artist => ({
            label: artist.name,
        })).toSorted((a, b) => a.label.localeCompare(b.label));
    }, [artists]);

    const calculatedDataset : ChartData[] | undefined = useMemo(() => {
        if (!selectedArtists) {
            return undefined;
        }

        const buildData = getDataBuilder({
            granularityLevel,
            earliestYear,
            latestYear,
            selectedMonth,
            selectedYear,
        });

        if (!buildData) {
            return [];
        }

        const selectedArtistSet = new Set(selectedArtists);
        const dataByArtist = groupPlaybackDataByArtist(data, selectedArtistSet);
        return selectedArtists.map(artist => ({
            label: artist,
            data: buildData(dataByArtist.get(artist) ?? []),
        }));
    }, [selectedArtists, data, granularityLevel, selectedYear, selectedMonth, earliestYear, latestYear]);

    const handleGranularityLevelChange = (granularityLevel: GranularityLevelType): void => {
        setGranularityLevel(granularityLevel);

        if (granularityLevel === 'year') {
            setSelectedYear(undefined);
            setSelectedMonth(undefined);
        } else if (granularityLevel === 'month') {
            setSelectedYear(selectedYear ?? latestYear);
        } else if (granularityLevel === 'day') {
            setSelectedYear(selectedYear ?? latestYear);
            setSelectedMonth(moment().month() + 1);
        }
    };

    const handleSelectedYearChange = (selectedYear: unknown): void => {
        if (typeof selectedYear !== 'number') {
            return;
        }

        setSelectedYear(selectedYear);
    };

    const handleSelectedMonthChange = (selectedMonth: unknown): void => {
        if (typeof selectedMonth !== 'number') {
            return;
        }

        setSelectedMonth(selectedMonth);
    };

    const handleDisplayModeChange = (displayMode: DisplayModeType): void => {
        setDisplayMode(displayMode);
    };

    const handleSelectedArtistChange = (selectedArtists?: string[]): void => {
        setSelectedArtists(selectedArtists);
    };

    return (
        <Card>
            <CardHeader
                title={<Typography variant={'h4'}>Artist History Analysis</Typography>}
                action={
                    data.length > 0 && (
                        <Stack direction={'row'} spacing={2} width={200 * (granularityLevel === 'month' ? 2 : granularityLevel === 'day' ? 3 : 1) + 900} alignItems={'center'}>
                            <Autocomplete
                                disablePortal={true}
                                options={artistOptions}
                                fullWidth={true}
                                sx={{
                                    minWidth: 500,
                                }}
                                multiple={true}
                                renderInput={(params) => <TextField {...params} label={'Artist'} />}
                                onChange={(_, newValue) => handleSelectedArtistChange(newValue.map(o => o.label))}
                            />
                            {calculatedDataset && (
                                <>
                                    {granularityLevel === 'day' && (
                                        <FormControl variant={'outlined'} fullWidth={true}>
                                            <InputLabel id={'granularity-month-select-label'}>Month</InputLabel>
                                            <Select
                                                variant={'outlined'}
                                                labelId={'granularity-month-select-label'}
                                                label={'Granularity'}
                                                value={selectedMonth}
                                                onChange={e => handleSelectedMonthChange(e.target.value)}
                                            >
                                                <MenuItem value={1}>January</MenuItem>
                                                <MenuItem value={2}>February</MenuItem>
                                                <MenuItem value={3}>March</MenuItem>
                                                <MenuItem value={4}>April</MenuItem>
                                                <MenuItem value={5}>May</MenuItem>
                                                <MenuItem value={6}>June</MenuItem>
                                                <MenuItem value={7}>July</MenuItem>
                                                <MenuItem value={8}>August</MenuItem>
                                                <MenuItem value={9}>September</MenuItem>
                                                <MenuItem value={10}>October</MenuItem>
                                                <MenuItem value={11}>November</MenuItem>
                                                <MenuItem value={12}>December</MenuItem>
                                            </Select>
                                        </FormControl>
                                    )}
                                    {(granularityLevel === 'month' || granularityLevel === 'day') && (
                                        <FormControl variant={'outlined'} fullWidth={true}>
                                            <InputLabel id={'granularity-year-select-label'}>Year</InputLabel>
                                            <Select
                                                variant={'outlined'}
                                                labelId={'granularity-year-select-label'}
                                                label={'Year'}
                                                value={selectedYear}
                                                onChange={e => handleSelectedYearChange(e.target.value)}
                                            >
                                                {earliestYear && latestYear && generateYearSelections(earliestYear, latestYear)}
                                            </Select>
                                        </FormControl>
                                    )}
                                    <FormControl variant={'outlined'} fullWidth={true}>
                                        <InputLabel id={'granularity-select-label'}>Granularity</InputLabel>
                                        <Select
                                            variant={'outlined'}
                                            labelId={'granularity-select-label'}
                                            label={'Granularity'}
                                            value={granularityLevel}
                                            onChange={e => handleGranularityLevelChange(e.target.value as GranularityLevelType)}
                                        >
                                            <MenuItem value={'year'}>Year</MenuItem>
                                            <MenuItem value={'month'}>Month</MenuItem>
                                            <MenuItem value={'day'}>Day</MenuItem>
                                        </Select>
                                    </FormControl>
                                </>
                            )}
                            <FormControl variant={'outlined'} fullWidth={true}>
                                <InputLabel id={'display-mode-select-label'}>Display Mode</InputLabel>
                                <Select
                                    variant={'outlined'}
                                    labelId={'display-mode-select-label'}
                                    label={'Display Mode'}
                                    value={displayMode}
                                    onChange={e => handleDisplayModeChange(e.target.value as DisplayModeType)}
                                >
                                    <MenuItem value={'bar'}>Bars</MenuItem>
                                    <MenuItem value={'line'}>Lines</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                    )
                }
            />
            <CardContent>
                {data.length > 0 && calculatedDataset && displayMode === 'line' && (
                    <LineChart
                        height={500}
                        series={getLinearSeriesData(calculatedDataset)}
                        xAxis={getLinearXAxisData(calculatedDataset, granularityLevel)}
                        yAxis={getLinearYAxisData(calculatedDataset)}
                        grid={{ horizontal: true }}
                    />
                )}
                {data.length > 0 && calculatedDataset && displayMode === 'bar' && (
                    <BarChart
                        height={500}
                        series={getBarSeriesData(calculatedDataset)}
                        xAxis={getBarXAxisData(calculatedDataset, granularityLevel)}
                        yAxis={getBarYAxisData(calculatedDataset)}
                        grid={{ horizontal: true }}
                        barLabel={(v) => {
                            if ((granularityLevel === 'month' || granularityLevel === 'year') && v.value) {
                                return `${formatNumber(v.value, 2)} minutes`;
                            }
                            if (granularityLevel === 'day' && v.value) {
                                return `${formatNumber(v.value, 2)}`;
                            }

                            return undefined;
                        }}
                    />
                )}
            </CardContent>
        </Card>
    );
};
