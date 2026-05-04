import { MakeOptional } from '@mui/x-date-pickers/internals';
import { LineSeriesType, XAxis, YAxis } from '@mui/x-charts';
import { formatNumber } from 'src/utils/numbers';
import { ChartData, GranularityLevelType } from 'src/utils/chart/type';


export const getLinearSeriesData = (data: ChartData[]) : readonly MakeOptional<LineSeriesType, 'type'>[] => {
    return data.map(r => ({
        data: Object.values(r.data),
        baseline: 0,
        curve: 'linear',
        showMark: true,
        label: r.label,
        valueFormatter: (v : number | null) => formatNumber(v ?? 0, 2),
    }));
};

export const getLinearXAxisData = (data: ChartData[], granularityLevel: GranularityLevelType): readonly XAxis<'point'>[]  => {
    return data.map(r => ({
        data: Object.keys(r.data).map(k => k.toString()),
        scaleType: 'point',
        label: granularityLevel,
    }));
};

export const getLinearYAxisData = (data: ChartData[]) : readonly YAxis<'linear'>[] => {
    return data.map(r => ({
        width: 100,
        disableLine: false,
        scaleType: 'linear',
        label: 'Minutes',
        min: 0
    }));
};
