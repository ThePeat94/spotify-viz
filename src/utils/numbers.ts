export const minimumOf = (numbers: number[]): number | null => {
    if (numbers.length === 0) {
        return null;
    }

    let currentMin = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
        if (numbers[i] < currentMin) {
            currentMin = numbers[i];
        }
    }

    return currentMin;
};


export const maximumOf = (numbers: number[]): number | null => {
    if (numbers.length === 0) {
        return null;
    }

    let currentMax = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
        if (numbers[i] > currentMax) {
            currentMax = numbers[i];
        }
    }

    return currentMax;
};
