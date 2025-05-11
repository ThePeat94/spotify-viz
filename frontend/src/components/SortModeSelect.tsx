import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React from 'react';

export type SortModeType = 'count' | 'msPlayed';

type SortModeSelectProps = {
    sortMode: SortModeType;
    onChange: (mode: SortModeType) => void;
}


export const SortModeSelect: React.FC<SortModeSelectProps> = (props) => {
    const { sortMode, onChange } = props;

    const handleSortModeChange = (sortMode: SortModeType): void => {
        onChange(sortMode);
    };

    return (
        <FormControl fullWidth={true}>
            <InputLabel id={'sort-mode-select-label'}>Sort Mode</InputLabel>
            <Select
                labelId={'sort-mode-select-label'}
                label={'Sort Mode'}
                value={sortMode}
                onChange={e => handleSortModeChange(e.target.value as SortModeType)}
                fullWidth={true}
                autoWidth={false}
            >
                <MenuItem value={'count'}>Stream Count</MenuItem>
                <MenuItem value={'msPlayed'}>Minutes Played</MenuItem>
            </Select>
        </FormControl>
    );
};
