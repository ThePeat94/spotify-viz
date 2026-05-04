import { ChartData, GranularityLevelType } from 'src/utils/chart/type';
import { BarSeriesType, XAxis, YAxis } from '@mui/x-charts';
import { MakeOptional } from '@mui/x-date-pickers/internals';

export const getBarSeriesData = (data: ChartData[]): readonly MakeOptional<BarSeriesType, 'type'>[] => {
    return data.map((d: ChartData) => ({
        data: Object.values(d.data),
        label: d.label,
    }));
};

export const getBarXAxisData = (data: ChartData[], granularityLevel: GranularityLevelType): readonly XAxis<'band'>[] => {
    return data.map((d: ChartData) => ({
        data: Object.keys(d.data).map(k => k.toString()),
        label: granularityLevel,
        scaleType: 'band'
    }));
};

export const getBarYAxisData = (data: ChartData[]): readonly YAxis<'band'>[] => {
    return data.map((d: ChartData) => ({
        width: 100,
        disableLine: false,
        label: 'Minutes',
    }));
};
