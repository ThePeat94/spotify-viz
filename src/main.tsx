import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from 'src/App';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});


createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <LocalizationProvider dateAdapter={AdapterMoment}>
            <ThemeProvider theme={darkTheme}>
                <CssBaseline>
                    <App />
                </CssBaseline>
            </ThemeProvider>
        </LocalizationProvider>
    </StrictMode>,
);
