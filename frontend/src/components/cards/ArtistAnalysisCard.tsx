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
    const [selectedArtist, setSelectedArtist] = useState<string>();

    const artistOptions = useMemo(() => {
        return artists.map(artist => ({
            label: artist.name,
        })).toSorted((a, b) => a.label.localeCompare(b.label));
    }, [artists]);

    const calculatedDataset = useMemo(() => {
        if (!selectedArtist) {
            return undefined;
        }

        const baseData = data.filter(pb => pb.master_metadata_album_artist_name === selectedArtist);

        if (granularityLevel === 'year') {
            const baseEmptyRecord : Record<number, number> = {};

            if (earliestYear && latestYear) {
                for (let i = earliestYear; i <= latestYear; i++) {
                    baseEmptyRecord[i] = 0;
                }
            }

            return baseData.reduce((a, b) => {
                const year = b.ts.getFullYear();
                if (!a[year]) {
                    a[year] = 0;
                }
                a[year] += b.ms_played / 1_000 / 60;
                return a;
            }, baseEmptyRecord);
        }

        if (granularityLevel === 'month' && selectedYear) {

            const baseEmptyRecord : Record<number, number> = {};
            for (let i = 0; i < 12; i++) {
                baseEmptyRecord[i + 1] = 0;
            }

            return baseData.reduce((a, b) => {
                const year = b.ts.getFullYear();
                const month = b.ts.getMonth() + 1;
                if (year !== selectedYear) {
                    return a;
                }
                if (!a[month]) {
                    a[month] = 0;
                }
                a[month] += b.ms_played / 1_000 / 60;
                return a;
            }, baseEmptyRecord);
        }

        if (granularityLevel === 'day' && selectedYear && selectedMonth) {

            const daysInSelectedMonth = moment(`${selectedYear}-${selectedMonth}`, 'YYYY-MM').daysInMonth();

            const baseEmptyRecord : Record<number, number> = {};

            for (let i = 0; i < daysInSelectedMonth; i++) {
                baseEmptyRecord[i + 1] = 0;
            }

            return baseData.reduce((a, b) => {
                const year = b.ts.getFullYear();
                const month = b.ts.getMonth() + 1;
                const day = b.ts.getDate();
                if (year !== selectedYear || month !== selectedMonth) {
                    return a;
                }
                if (!a[day]) {
                    a[day] = 0;
                }
                a[day] += b.ms_played / 1_000 / 60;
                return a;
            }, baseEmptyRecord);
        }

        return undefined;
    }, [selectedArtist, data, granularityLevel, selectedYear, selectedMonth, earliestYear, latestYear]);

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

    const handleSelectedArtistChange = (selectedArtist?: string): void => {
        setSelectedArtist(selectedArtist);
    };

    return (
        <Card>
            <CardHeader
                title={<Typography variant={'h4'}>Artist History Analysis</Typography>}
                action={
                    data.length > 0 && (
                        <Stack direction={'row'} spacing={2} width={200 * (granularityLevel === 'month' ? 2 : granularityLevel === 'day' ? 3 : 1) + 500} alignItems={'center'}>
                            <Autocomplete
                                disablePortal={true}
                                options={artistOptions}
                                sx={{ minWidth: 300 }}
                                fullWidth={true}
                                renderInput={(params) => <TextField {...params} label={'Artist'} />}
                                onChange={(_, newValue) => handleSelectedArtistChange(newValue?.label)}
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
                        series={[
                            {
                                data: Object.values(calculatedDataset),
                                baseline: 0,
                                curve: 'linear',
                                showMark: true,
                                label: 'Minutes',
                                valueFormatter: (v) => formatNumber(v ?? 0, 2),
                            }
                        ]}
                        xAxis={[
                            {
                                data: Object.keys(calculatedDataset).map(k => k.toString()),
                                scaleType: 'point',
                                label: granularityLevel,
                            }
                        ]}
                        yAxis={[
                            {
                                width: 100,
                                disableLine: false,
                                scaleType: 'linear',
                                label: 'Minutes',
                                min: 0
                            }
                        ]}
                        grid={{ horizontal: true }}
                    />
                )}
                {data.length > 0 && calculatedDataset && displayMode === 'bar' && (
                    <BarChart
                        height={500}
                        series={[
                            {
                                data: Object.values(calculatedDataset),
                                label: 'Minutes',
                            }
                        ]}
                        xAxis={[
                            {
                                data: Object.keys(calculatedDataset).map(k => k.toString()),
                                label: granularityLevel,
                                scaleType: 'band'
                            }
                        ]}
                        yAxis={[
                            {
                                width: 100,
                                disableLine: false,
                                label: 'Minutes',
                            }
                        ]}
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
