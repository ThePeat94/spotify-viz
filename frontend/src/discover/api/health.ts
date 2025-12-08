import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { discoverClient } from 'src/discover/client';

const getHealthStatus = async (): Promise<boolean> => {
    const resp = await discoverClient.get('/health', { timeout: 1000 });

    return resp.status >= 200 && resp.status < 300;
};

export const useDiscoverApiHealthStatus = (enabled: boolean): UseQueryResult<boolean> => {
    return useQuery({
        queryFn: getHealthStatus,
        queryKey: ['discoverApiHealth'],
        refetchInterval: 1_000,
        enabled
    });
};
