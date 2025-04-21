import React from 'react';
import { Box, Stack, styled, Tooltip, tooltipClasses, TooltipProps, Typography } from '@mui/material';
import { formatNumber } from 'src/utils/numbers';

type HoverableDurationProps = {
    durationInMs: number;
    decimalNumbers?: number;
}

type AbsurdDurationType = {
    label: string;
    durationInMs: number;
    decimalNumbers?: number;
    symbol?: React.ReactNode;
}

const ABSURD_DURATIONS : AbsurdDurationType[] = [{
    symbol: <>⚽</>,
    label: 'Regular Bundesliga Games',
    durationInMs: 90 * 60 * 1000,
}, {
    symbol: <>🧑‍💻</>,
    label: 'Regular Working Days',
    durationInMs: 8 * 60 * 60 * 1000,
}, {
    symbol: <>📺</>,
    label: 'Simpsons Episodes',
    durationInMs: 22 * 60 * 1000,
}, {
    symbol: <>🧙‍♂️</>,
    label: 'LOTR EE Marathons',
    durationInMs: 726 * 60 * 1000,
}, {
    symbol: <>🚀</>,
    label: 'Days on Mars',
    durationInMs: (24 * 60 * 60 * 1000) + (39 * 60 * 1000) + (35 * 1000),
}, {
    symbol: <>🧌</>,
    label: 'Shrek 1 Movies',
    durationInMs: 89 * 60 * 1000,
}, {
    symbol: <>🚂</>,
    label: 'Tekkno Trains',
    durationInMs: ((2 * 60) + 57) * 1000,
}];

const NoMaxWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))({
    [`& .${tooltipClasses.tooltip}`]: {
        maxWidth: 'none',
    },
});

export const HoverableDuration: React.FC<HoverableDurationProps> = (props ) => {
    const { durationInMs, decimalNumbers = 2 } = props;

    const durationInSeconds = durationInMs / 1000;
    const durationInMinutes = durationInSeconds / 60;
    const durationInHours = durationInMinutes / 60;
    const durationInDays = durationInHours / 24;
    const durationInWeeks = durationInDays / 7;
    const durationInYears = durationInDays / 365;

    return (
        <NoMaxWidthTooltip
            title={
                <Stack maxWidth={'500px'} spacing={1}>
                    <Typography sx={{ fontWeight: 'bold' }}>Or in other units:</Typography>
                    <Typography>{formatNumber(durationInMs, 0)} ms</Typography>
                    <Typography>{formatNumber(durationInSeconds, 0)} seconds</Typography>
                    <Typography>{formatNumber(durationInMinutes, 2)} minutes</Typography>
                    <Typography>{formatNumber(durationInHours, 2)} hours</Typography>
                    <Typography>{formatNumber(durationInDays, 2)} days</Typography>
                    <Typography>{formatNumber(durationInWeeks, 2)} weeks</Typography>
                    <Typography>{formatNumber(durationInYears, 2)} years</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>or ca. 🤓</Typography>
                    {ABSURD_DURATIONS.sort((a, b) => a.durationInMs - b.durationInMs).map((absurdDuration) => {
                        const durationInAbsurd = durationInMs / absurdDuration.durationInMs;
                        return (
                            <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} spacing={1}>
                                <Typography key={absurdDuration.label}>
                                    {absurdDuration.symbol} {formatNumber(durationInAbsurd, absurdDuration.decimalNumbers ?? 2)} {absurdDuration.label}
                                </Typography>
                                <Typography>
                                    ({formatNumber(absurdDuration.durationInMs/1000/60, 2)} min)
                                </Typography>
                            </Stack>
                        );
                    })}
                </Stack>
            }
            arrow={true}

        >
            <Box
                sx={{
                    cursor: 'pointer',
                    display: 'inline',
                    borderBottom: '1px dashed',
                    borderColor: 'success.main',
                    color: 'success.main',
                }}
            >
                {formatNumber(durationInMinutes, decimalNumbers)} minutes
            </Box>
        </NoMaxWidthTooltip>
    );
};
