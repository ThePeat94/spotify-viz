import { PlaybackData } from 'src/streams/type';
import { faker } from '@faker-js/faker';

export const createRandomData = (count: number): PlaybackData[] => {
    const generatedData: PlaybackData[] = [];
    const ipAddr = faker.internet.ip();
    for (let i = 0; i < count; i++) {
        const artistName = faker.music.artist();
        const songName = faker.music.songName();

        const playbackData: PlaybackData = {
            conn_country: 'DE_DE',
            episode_name: null,
            episode_show_name: null,
            incognito_mode: false,
            ip_addr_decrypted: ipAddr,
            master_metadata_album_album_name: faker.music.album(),
            master_metadata_album_artist_name: faker.music.artist(),
            master_metadata_track_name: songName,
            ms_played: faker.number.int({ min: 200, max: 300_000 }),
            offline: false,
            offline_timestamp: 0,
            platform: 'GENERATOR',
            reason_end: 'SOME_REASON',
            reason_start: 'SOME_REASON',
            shuffle: false,
            skipped: false,
            spotify_episode_uri: null,
            spotify_track_uri: `${songName}_${artistName}`,
            user_agent_decrypted: null,
            username: 'HR_WAS_HERE_ARRRR',
            ts: faker.date.past({ years: 10 }),
        };
        generatedData.push(playbackData);
    }

    return generatedData;
};
