export const colors = {
  primary: '#0f9d58',
  primaryDark: '#0b7a44',
  primaryTint: '#e7f6ee',
  bg: '#f5f6f8',
  card: '#ffffff',
  text: '#111827',
  muted: '#6b7280',
  faint: '#9ca3af',
  border: '#eceef1',
  danger: '#e23744',
  dangerTint: '#fde8ea',
  success: '#16a34a',
  warning: '#f59e0b',
  star: '#f5a623',
  dark: '#0f172a',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 10, md: 14, lg: 20, pill: 999 };

// Cross-platform elevation presets (iOS shadow + Android elevation).
export const shadow = {
  card: {
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  float: {
    shadowColor: '#0f172a',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
};

export const font = { h1: 26, h2: 20, h3: 17, body: 14, small: 12 };
