import { PlaybackData } from 'src/streams/type';
import moment from 'moment';



export const getYearData = (baseData: PlaybackData[], earliestYear: number | undefined, latestYear: number | undefined): Record<number, number> => {
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
};

export const getMonthData = (baseData: PlaybackData[], selectedYear: number): Record<number, number> => {
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
};

export const getDayData = (baseData: PlaybackData[], selectedYear: number, selectedMonth: number): Record<number, number> => {
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
};
