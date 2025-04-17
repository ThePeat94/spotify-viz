import { PlaybackData } from 'src/streams/type';

export const calculateUniqueArtistCount = (playbackData: PlaybackData[]): number => {
    const foundArtists : string[] = [];
    return playbackData
        .flatMap((pb) => {
            if (pb.master_metadata_album_artist_name === null) {
                return [];
            }

            if (foundArtists.includes(pb.master_metadata_album_artist_name)) {
                return [];
            }

            foundArtists.push(pb.master_metadata_album_artist_name);

            return pb.master_metadata_album_artist_name;
        })
        .length;
};

export const calculateUniqueSongCount = (playbackData: PlaybackData[]): number  => {

    const uniqueSongs : string[] = [];
    return playbackData
        .flatMap(pb => {
            if (uniqueSongs.includes(pb.spotify_track_uri)) {
                return [];
            }

            uniqueSongs.push(pb.spotify_track_uri);
            return pb.spotify_track_uri;
        })
        .length;
};
