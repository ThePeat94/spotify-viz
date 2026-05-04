import { PlaybackData } from 'src/streams/type';
import { GranularityLevelType } from 'src/utils/chart/type';
import { getDayData, getMonthData, getYearData } from 'src/utils/chart/charts';

export type DataBuilder = (items: PlaybackData[]) => Record<number, number>;

export type GetDataBuilderParams = {
    granularityLevel: GranularityLevelType;
    selectedYear: number | undefined;
    selectedMonth: number | undefined;
    earliestYear: number | undefined;
    latestYear: number | undefined;
};

export const getDataBuilder = ({
    granularityLevel,
    selectedYear,
    selectedMonth,
    earliestYear,
    latestYear,
}: GetDataBuilderParams): DataBuilder | undefined =>  {
    switch (granularityLevel) {
    case 'year':
        return items => getYearData(items, earliestYear, latestYear);

    case 'month':
        if (selectedYear == null) {
            return undefined;
        }

        return items => getMonthData(items, selectedYear);

    case 'day':
        if (selectedYear == null || selectedMonth == null) {
            return undefined;
        }

        return items => getDayData(items, selectedYear, selectedMonth);

    default:
        return undefined;
    }
};
