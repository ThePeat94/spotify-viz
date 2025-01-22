import {PlaybackData} from "../streams/type.ts";
import {performAndMeasure} from "../utils/performance.ts";

self.onmessage = (e) => {

    console.log("start...")
    const parsed : PlaybackData[] = performAndMeasure("parse", () => JSON.parse(e.data));

    parsed.forEach(a => {
        a.ts = new Date(a.ts);
    });

    postMessage(parsed);
}
