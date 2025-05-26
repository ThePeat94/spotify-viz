import axios from 'axios';

export const discoverClient = axios.create({
    baseURL: 'http://localhost:3040/',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds timeout
});
