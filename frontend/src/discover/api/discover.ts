import { DiscoverArtistRequestType, DiscoverStatusResponseType } from 'src/discover/api/type';
import { discoverClient } from 'src/discover/client';
import { useMutation, UseMutationResult, useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

const postArtistsToDiscover = (request: DiscoverArtistRequestType) => {
    return discoverClient.post('/discover', request);
};

export const usePostArtistsToDiscover = (): UseMutationResult<AxiosResponse, unknown, DiscoverArtistRequestType>  => {
    return useMutation({
        mutationFn: postArtistsToDiscover,
        onError: (error) => {
            console.error('Error posting artists to discover:', error);
        },
        onSuccess: (data) => {
            console.log('Successfully posted artists to discover:', data);
        }
    });
};

const getDiscoverStatus = async (): Promise<DiscoverStatusResponseType> => {
    const response = await discoverClient.get<DiscoverStatusResponseType>('/discover/status');

    return response.data;
};

export const useDiscoverStatus = (enabled: boolean): UseQueryResult<DiscoverStatusResponseType> => {
    return useQuery({
        queryKey: ['discoverStatus'],
        queryFn: getDiscoverStatus,
        refetchInterval: 5_000, // Refetch every 5 seconds
        enabled,
    });
};
