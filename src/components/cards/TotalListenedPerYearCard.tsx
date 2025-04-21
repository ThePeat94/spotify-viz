import { PlaybackData } from 'src/streams/type';
import { Card, CardContent, CardHeader } from '@mui/material';
import { LineChart } from '@mui/x-charts';
import React from 'react';

type TotalListenedPerYearCardPropsType = {
    data: PlaybackData[];
};

export const TotalListenedPerYearCard: React.FC<TotalListenedPerYearCardPropsType> = (props) => {
    const { data } = props;

    const minutesPerYear : Record<number, number> = data.reduce((a, b) => {
        const year = b.ts.getFullYear();
        if (!a[year]) {
            a[year] = 0;
        }
        a[year] += b.ms_played / 1_000 / 60;
        return a;
    }, {} as Record<number, number>);

    return (
        <Card>
            <CardHeader
                title={'Total Listened Per Year'}
            />
            <CardContent>
                {data.length > 0 && (
                    <LineChart
                        height={500}
                        series={[
                            {
                                data: Object.values(minutesPerYear),
                                baseline: 0,
                                curve: 'linear',
                                showMark: true,
                                label: 'Minutes',
                            }
                        ]}
                        xAxis={[
                            {
                                data: Object.keys(minutesPerYear).map(k => k.toString()),
                                scaleType: 'point',
                                label: 'Year',
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
            </CardContent>
        </Card>
    );
};
