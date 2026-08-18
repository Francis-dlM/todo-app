import { createTheme } from '@mui/material/styles';

/**
 * MUI 主题定制。
 * 主色 #0078D4，圆角 8px，适配任务管理应用风格。
 */
const theme = createTheme({
  palette: {
    primary: {
      main: '#0078D4',
      light: '#4DA6E8',
      dark: '#005A9E',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#7B68EE',
      light: '#A899FF',
      dark: '#503EB0',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#E74856',
    },
    warning: {
      main: '#FFB900',
    },
    success: {
      main: '#00CC6A',
    },
    info: {
      main: '#0078D4',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.54)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"PingFang SC"',
      '"Microsoft YaHei"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
  },
});

export default theme;
