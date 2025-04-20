import React, { useMemo, useState } from 'react';
import { DataFilterType } from 'src/filter/type';
import { Button, FormControl, Grid2, InputLabel, MenuItem, Select, Slider, Stack, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import moment, { Moment } from 'moment/moment';

type DataFilterProps = {
    earliestYear?: number;
    latestYear?: number;
    value: DataFilterType;
    onChange: (value: DataFilterType) => void;
}

type FilterModeType = 'wrapped' | 'allYear';

type FilterPresetType = { year?: number, mode: FilterModeType };
const generateYearSelections = (earliestYear: number, latestYear: number) => {
    const years = [];
    for (let i = earliestYear; i <= latestYear; i++) {
        years.push(i);
    }

    return years.map(year => (
        <MenuItem value={year}>{year}</MenuItem>
    ));
};

/**
 * A component  to display general data filter options, which apply to the general set of data
 */
const DataFilter: React.FC<DataFilterProps> = (props) => {
    const {
        value,
        earliestYear,
        latestYear,
        onChange,
    } = props;

    const [presetFilter, setPresetFilter] = useState<FilterPresetType>({
        mode: 'wrapped'
    });


    const {
        minDuration,
        from,
        to,
    } = value;
    const [tmpDuration, setTmpDuration] = useState(minDuration);

    const fromDate = useMemo(() => {
        return from ? moment(from) : null;
    }, [from]);

    const toDate = useMemo(() => {
        return to ? moment(to) : null;
    }, [to]);

    const handleMinDurationChange = (minDuration: number): void  => {
        onChange({
            ...value,
            minDuration,
        });
    };

    const handleFromDateChange = (fromDate: Moment | null): void  => {
        onChange({
            ...value,
            from: fromDate?.toDate().getTime() ?? 0,
        });
    };

    const handleToDateChange = (toDate: Moment | null): void  => {
        onChange({
            ...value,
            to: toDate?.toDate().getTime() ?? 0,
        });
    };

    const handleFilterPresetChange = (newPreset: FilterPresetType): void => {
        setPresetFilter(newPreset);

        if (!newPreset.year) {
            onChange({
                ...value,
                from: undefined,
                to: undefined,
            });
            return;
        }

        let startOfYear  = 0;
        let endOfYear  = 0;

        if (newPreset.mode === 'allYear') {
            startOfYear = moment(`${newPreset.year}-01-01`).startOf('day').toDate().getTime();
            endOfYear = moment(`${newPreset.year}-12-31`).endOf('day').toDate().getTime();
        } else if (newPreset.mode === 'wrapped') {
            startOfYear = moment(`${newPreset.year}-01-01`).startOf('day').toDate().getTime();
            endOfYear = moment(`${newPreset.year}-11-15`).endOf('day').toDate().getTime();
        }


        onChange({
            ...value,
            from: startOfYear,
            to: endOfYear,
        });
    };

    const handlePresetYearChange = (year?: number): void => {
        handleFilterPresetChange({
            ...presetFilter,
            year
        });
    };

    const handlePresetModeChange = (mode: FilterModeType): void => {
        handleFilterPresetChange({
            ...presetFilter,
            mode
        });
    };


    return (
        <Grid2 container={true} alignItems={'center'} spacing={2}>
            <Grid2 size={12}>
                <Typography variant={'h4'} pt={2}>Filter</Typography>
            </Grid2>
            <Grid2 size={4} p={2}>
                <Stack>
                    <Typography variant={'body2'}>Min. Duration</Typography>
                    <Slider
                        min={0}
                        max={60_000}
                        step={1000}
                        marks={true}
                        onDragStart={() => console.log('dragging started')}
                        onDrag={() => console.log('dragging')}
                        onDragEnd={() => console.log('dragging ended')}
                        onDragStartCapture={() => console.log('on drag start capture')}
                        onChange={(_, v) => setTmpDuration(v as number)}
                        onChangeCommitted={(_, v) => handleMinDurationChange(v as number)}
                        value={tmpDuration}
                        valueLabelDisplay={'auto'}
                        valueLabelFormat={(v => `${v/1000}s`)}
                    />
                    <Typography variant={'caption'}>{minDuration/1000}s</Typography>
                </Stack>
            </Grid2>
            <Grid2 size={2}>
                <DatePicker
                    maxDate={toDate ?? undefined}
                    label={'From'}
                    value={fromDate}
                    onChange={v => handleFromDateChange(v)}
                    format={'DD.MM.YYYY'}
                    sx={{ width: '100%' }}

                />
            </Grid2>
            <Grid2 size={2}>
                <DatePicker
                    minDate={fromDate ?? undefined}
                    label={'To'}
                    value={toDate}
                    onChange={v => handleToDateChange(v)}
                    format={'DD.MM.YYYY'}
                    sx={{ width: '100%' }}
                />
            </Grid2>
            <Grid2 size={1}>
                <Button
                    variant={'outlined'}
                    onClick={() => {
                        onChange({
                            ...value,
                            from: undefined,
                            to: undefined,
                        });
                    }}
                >
                    Reset
                </Button>
            </Grid2>
            <Grid2 size={3}/>
            <Grid2 size={12}>
                <Typography variant={'h6'}>
                    Filter Presets
                </Typography>
            </Grid2>
            <Grid2 size={2}>
                <FormControl fullWidth={true}>
                    <InputLabel id={'preset-year-select-label'}>Year</InputLabel>
                    <Select
                        labelId={'preset-year-select-label'}
                        label={'Year'}
                        value={presetFilter.year}
                        onChange={e => handlePresetYearChange(e.target.value as number)}
                        fullWidth={true}
                        autoWidth={false}
                        disabled={!latestYear && !earliestYear}
                    >
                        <MenuItem value={undefined}>None</MenuItem>
                        {earliestYear && latestYear && generateYearSelections(earliestYear, latestYear)}
                    </Select>
                </FormControl>
            </Grid2>
            <Grid2 size={2}>
                <FormControl fullWidth={true}>
                    <InputLabel id={'filter-mode-select-label'}>Mode</InputLabel>
                    <Select
                        labelId={'filter-mode-select-label'}
                        label={'Mode'}
                        value={presetFilter.mode}
                        onChange={e => handlePresetModeChange(e.target.value as FilterModeType)}
                        fullWidth={true}
                        autoWidth={false}
                        disabled={!latestYear && !earliestYear}
                    >
                        <MenuItem value={'allYear'}>All Year</MenuItem>
                        <MenuItem value={'wrapped'}>Wrapped</MenuItem>
                    </Select>
                </FormControl>
            </Grid2>
        </Grid2>
    );
};

export default DataFilter;
