import { PlaybackData } from 'src/streams/type';
import { performAndMeasure } from 'src/utils/performance';

self.onmessage = (e) => {

    console.log('start...');
    const parsed : PlaybackData[] = performAndMeasure('parse', () => JSON.parse(e.data));

    parsed.forEach(a => {
        a.ts = new Date(a.ts);
    });

    postMessage(parsed);
};
