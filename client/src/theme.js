import { createTheme } from '@mui/material/styles';

// Vodacom brand colors
const vodacomRed = '#E60000';
const vodacomDarkRed = '#990000';
const mpesaGreen = '#4CAF50';
const mpesaDarkGreen = '#00695C';
const vodacomGrey = '#333333';

const theme = createTheme({
  palette: {
    primary: { main: vodacomRed, dark: vodacomDarkRed },
    secondary: { main: mpesaGreen, dark: mpesaDarkGreen },
    background: { default: '#f5f5f5', paper: '#ffffff' },
    text: { primary: vodacomGrey },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 8, fontWeight: 500 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundColor: '#ffffff' },
      },
    },
  },
});

export default theme;

// Export brand colors for direct use
export const brandColors = {
  vodacomRed,
  vodacomDarkRed,
  mpesaGreen,
  mpesaDarkGreen,
  vodacomGrey,
};
