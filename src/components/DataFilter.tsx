import React, { useMemo, useState } from 'react';
import { DataFilterType } from 'src/filter/type';
import { Grid2, Slider, Stack, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import moment, { Moment } from 'moment/moment';

type DataFilterProps = {
    value: DataFilterType;
    onChange: (value: DataFilterType) => void;
}

/**
 * A component  to display general data filter options, which apply to the general set of data
 */
const DataFilter: React.FC<DataFilterProps> = (props) => {
    const {
        value,
        onChange,
    } = props;


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
                />
            </Grid2>
            <Grid2 size={2}>
                <DatePicker
                    minDate={fromDate ?? undefined}
                    label={'To'}
                    value={toDate}
                    onChange={v => handleToDateChange(v)}
                    format={'DD.MM.YYYY'}
                />
            </Grid2>
        </Grid2>
    );
};

export default DataFilter;
