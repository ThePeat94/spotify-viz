import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';

// Import the generated route tree
// eslint-disable-next-line import/extensions
import { routeTree } from 'src/routeTree.gen';

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    // @ts-expect-error we need that so that the router instance is registered for type safety
    type Register = {
        router: typeof router
    }
}

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

// Create a client
const queryClient = new QueryClient();



createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <LocalizationProvider dateAdapter={AdapterMoment}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider theme={darkTheme}>
                    <CssBaseline>
                        <RouterProvider router={router}/>
                        <footer>
                            <p>
                                <a href="/imprint">Imprint</a> | <a href="/privacy">Privacy Policy</a>
                            </p>
                        </footer>
                    </CssBaseline>
                </ThemeProvider>
            </QueryClientProvider>
        </LocalizationProvider>
    </StrictMode>,
);
