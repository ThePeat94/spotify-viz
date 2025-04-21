import React from 'react';
import { Card, CardContent, CardHeader, List, ListItem, Typography } from '@mui/material';

type FeatureLogCardProps = {};

const plannedFeatures : string[] = [
    'Grouping per Artist',
    'Filter per Artist',
    'Artist chain',
    'Device stats',
    'Stop reasons',
    'Timeline graph per artist',
    'Timeline graph per song',
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
