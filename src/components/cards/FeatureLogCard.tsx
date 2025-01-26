import React from 'react';
import { Card, CardContent, CardHeader, List, ListItem, Typography } from '@mui/material';

type FeatureLogCardProps = {};

const plannedFeatures : string[] = [
    'Seconds per artist',
    'Seconds per song',
    'Streams vs. seconds',
    'Grouping per Artist',
    'Filter per Artist',
    'Filter for min. date',
    'Filter for max. date',
    'Device stats',
    'Stop reasons'
];

/**
 * Plain card with some planned features.
 */
const FeatureLogCard: React.FC<FeatureLogCardProps> = () => {
    return (
        <Card>
            <CardHeader title={'Feature Log'}/>
            <CardContent>
                <List>
                    {plannedFeatures.map((feature, index) => (
                        <ListItem key={index}>
                            <Typography>{feature}</Typography>
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
};

export default FeatureLogCard;
