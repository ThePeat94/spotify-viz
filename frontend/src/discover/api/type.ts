type DiscoverArtistType = {
    artistName: string;
    trackUri: string;
}

export type DiscoverArtistRequestType = {
    artists: DiscoverArtistType[];
}

export type DiscoverStatusResponseType = {
    remainingArtistsCount: number;
    alreadyDiscoveredCount: number;
}
