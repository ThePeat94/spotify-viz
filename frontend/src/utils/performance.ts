export const performAndMeasure = <T>(name: string, action: () => T): T  => {
    if (import.meta.env.DEV) {
        const start = performance.now();
        const result = action();
        const end = performance.now();
        console.log(`Execution time for ${name}: ${end - start} ms`);
        return result;
    }
    return action();
};
