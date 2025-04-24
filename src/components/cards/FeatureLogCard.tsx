import React from 'react';
import { Card, CardContent, CardHeader, List, ListItem, Typography } from '@mui/material';

type FeatureLogCardProps = {};

const plannedFeatures : string[] = [
    'Artist chain',
    'Song chain',
    'Device stats',
    'Stop reasons',
    'Most skipped songs',
    'Stacked bar chart for songs',
    'Stacked bar chart for artists',
    'Comparison graphs for artists',
    'Comparison graphs for songs',
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
