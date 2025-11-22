export type GradientConfig = {
    colors: string[];
    direction?: string;
};

const SPOTIFY_WRAPPED_GRADIENTS: GradientConfig[] = [
    { colors: ['#ff0844', '#ffb199', '#ff6b9d', '#c44569'], direction: '135deg' },
    { colors: ['#ee5a24', '#feca57', '#ff9ff3', '#54a0ff'], direction: '45deg' },
    { colors: ['#5f27cd', '#00d2d3', '#ff9ff3', '#54a0ff'], direction: '225deg' },
    { colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'], direction: '135deg' },
    { colors: ['#fd79a8', '#fdcb6e', '#6c5ce7', '#a29bfe'], direction: '45deg' },
    { colors: ['#00b894', '#00cec9', '#fd79a8', '#e84393'], direction: '135deg' },
    { colors: ['#e17055', '#fdcb6e', '#fd79a8', '#6c5ce7'], direction: '225deg' },
    { colors: ['#a29bfe', '#fd79a8', '#fdcb6e', '#00b894'], direction: '45deg' },
    { colors: ['#ff7675', '#fd79a8', '#fdcb6e', '#00cec9'], direction: '135deg' },
    { colors: ['#74b9ff', '#0984e3', '#fd79a8', '#e84393'], direction: '225deg' },
    { colors: ['#fd79a8', '#fdcb6e', '#55a3ff', '#26de81'], direction: '45deg' },
    { colors: ['#6c5ce7', '#fd79a8', '#fdcb6e', '#fd7272'], direction: '135deg' },
    { colors: ['#00b894', '#55a3ff', '#fd79a8', '#ff7675'], direction: '225deg' },
    { colors: ['#fdcb6e', '#fd79a8', '#6c5ce7', '#74b9ff'], direction: '45deg' },
    { colors: ['#ff6b9d', '#c44569', '#f8b500', '#feca57'], direction: '135deg' },
    { colors: ['#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3'], direction: '225deg' },
    { colors: ['#ff6348', '#ff9f43', '#feca57', '#ff6b9d'], direction: '45deg' },
    { colors: ['#1dd1a1', '#feca57', '#ff6348', '#ff9ff3'], direction: '135deg' },
    { colors: ['#10ac84', '#ee5a24', '#ff6b9d', '#5f27cd'], direction: '225deg' },
    { colors: ['#ff9f43', '#ff6b9d', '#54a0ff', '#1dd1a1'], direction: '45deg' },
    { colors: ['#ff006e', '#ff4081', '#ff6b35', '#f7931e'], direction: '135deg' },
    { colors: ['#8e44ad', '#3498db', '#e74c3c', '#f39c12'], direction: '225deg' },
    { colors: ['#e91e63', '#9c27b0', '#673ab7', '#3f51b5'], direction: '45deg' },
    { colors: ['#ff5722', '#ff9800', '#ffc107', '#4caf50'], direction: '135deg' },
    { colors: ['#2196f3', '#00bcd4', '#009688', '#4caf50'], direction: '225deg' },
];

export const getGradientByIndex = (index: number): string => {
    const gradient = SPOTIFY_WRAPPED_GRADIENTS[index % SPOTIFY_WRAPPED_GRADIENTS.length];
    const colorStops = gradient.colors.join(', ');
    return `linear-gradient(${gradient.direction ?? '135deg'}, ${colorStops})`;
};

export const getGradientByHash = (input: string): string => {
    const hash = Array.from(input).reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const index = Math.abs(hash) % SPOTIFY_WRAPPED_GRADIENTS.length;
    return getGradientByIndex(index);
};
