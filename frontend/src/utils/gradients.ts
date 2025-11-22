export type GradientType = 'linear' | 'radial' | 'conic';

export type GradientConfig = {
    colors: string[];
    direction?: string;
    type?: GradientType;
    position?: string;
};

const SPOTIFY_WRAPPED_GRADIENTS: GradientConfig[] = [
    { colors: ['#ff0844', '#ffb199', '#ff6b9d', '#c44569'], direction: '135deg', type: 'linear' },
    { colors: ['#ee5a24', '#feca57', '#ff9ff3', '#54a0ff'], direction: '45deg', type: 'linear' },
    { colors: ['#5f27cd', '#00d2d3', '#ff9ff3', '#54a0ff'], position: 'circle at center', type: 'radial' },
    { colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'], direction: '135deg', type: 'linear' },
    { colors: ['#fd79a8', '#fdcb6e', '#6c5ce7', '#a29bfe'], position: 'from 0deg at center', type: 'conic' },
    { colors: ['#00b894', '#00cec9', '#fd79a8', '#e84393'], direction: '135deg', type: 'linear' },
    { colors: ['#e17055', '#fdcb6e', '#fd79a8', '#6c5ce7'], position: 'ellipse at top', type: 'radial' },
    { colors: ['#a29bfe', '#fd79a8', '#fdcb6e', '#00b894'], direction: '45deg', type: 'linear' },
    { colors: ['#ff7675', '#fd79a8', '#fdcb6e', '#00cec9'], position: 'from 45deg at center', type: 'conic' },
    { colors: ['#74b9ff', '#0984e3', '#fd79a8', '#e84393'], position: 'circle at bottom right', type: 'radial' },
    { colors: ['#fd79a8', '#fdcb6e', '#55a3ff', '#26de81'], direction: '45deg', type: 'linear' },
    { colors: ['#6c5ce7', '#fd79a8', '#fdcb6e', '#fd7272'], position: 'from 90deg at center', type: 'conic' },
    { colors: ['#00b894', '#55a3ff', '#fd79a8', '#ff7675'], direction: '225deg', type: 'linear' },
    { colors: ['#fdcb6e', '#fd79a8', '#6c5ce7', '#74b9ff'], position: 'ellipse at bottom', type: 'radial' },
    { colors: ['#ff6b9d', '#c44569', '#f8b500', '#feca57'], direction: '135deg', type: 'linear' },
    { colors: ['#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3'], position: 'from 180deg at center', type: 'conic' },
    { colors: ['#ff6348', '#ff9f43', '#feca57', '#ff6b9d'], position: 'circle at top left', type: 'radial' },
    { colors: ['#1dd1a1', '#feca57', '#ff6348', '#ff9ff3'], direction: '135deg', type: 'linear' },
    { colors: ['#10ac84', '#ee5a24', '#ff6b9d', '#5f27cd'], position: 'from 270deg at center', type: 'conic' },
    { colors: ['#ff9f43', '#ff6b9d', '#54a0ff', '#1dd1a1'], position: 'ellipse at center', type: 'radial' },
    { colors: ['#ff006e', '#ff4081', '#ff6b35', '#f7931e'], direction: '135deg', type: 'linear' },
    { colors: ['#8e44ad', '#3498db', '#e74c3c', '#f39c12'], position: 'from 315deg at center', type: 'conic' },
    { colors: ['#e91e63', '#9c27b0', '#673ab7', '#3f51b5'], position: 'circle at top', type: 'radial' },
    { colors: ['#ff5722', '#ff9800', '#ffc107', '#4caf50'], direction: '135deg', type: 'linear' },
    { colors: ['#2196f3', '#00bcd4', '#009688', '#4caf50'], position: 'from 120deg at center', type: 'conic' },
];

const createGradientString = (gradient: GradientConfig): string => {
    const type = gradient.type ?? 'linear';

    switch (type) {
    case 'linear': {
        const linearColorStops = gradient.colors.join(', ');
        return `linear-gradient(${gradient.direction ?? '135deg'}, ${linearColorStops})`;
    }
    case 'radial': {
        const radialColorStops = gradient.colors.join(', ');
        return `radial-gradient(${gradient.position ?? 'circle at center'}, ${radialColorStops})`;
    }
    case 'conic': {
        const conicColors = [...gradient.colors, gradient.colors[0]];
        const conicColorStops = conicColors.join(', ');
        return `conic-gradient(${gradient.position ?? 'from 0deg at center'}, ${conicColorStops})`;
    }
    default: {
        const defaultColorStops = gradient.colors.join(', ');
        return `linear-gradient(${gradient.direction ?? '135deg'}, ${defaultColorStops})`;
    }
    }
};

export const getGradientByIndex = (index: number): string => {
    const gradient = SPOTIFY_WRAPPED_GRADIENTS[index % SPOTIFY_WRAPPED_GRADIENTS.length];
    return createGradientString(gradient);
};

export const getGradientByHash = (input: string): string => {
    const hash = Array.from(input).reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const index = Math.abs(hash) % SPOTIFY_WRAPPED_GRADIENTS.length;
    return getGradientByIndex(index);
};
