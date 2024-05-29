import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'Chivo-Thin, Arial, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Chivo-Thin';
          src: url('/path-to-your-font/Chivo-Thin.woff2') format('woff2'),
               url('/path-to-your-font/Chivo-Thin.woff') format('woff');
          font-weight: normal;
          font-style: normal;
        }
        body {
          font-family: 'Chivo-Thin', Arial, sans-serif;
        }
      `,
    },
  },
});

export default theme;