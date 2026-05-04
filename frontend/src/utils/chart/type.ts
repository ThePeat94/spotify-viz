export type GranularityLevelType = 'year' | 'month' | 'day';

export type ChartData = {
    label: string;
    data: Record<number, number>;
};
