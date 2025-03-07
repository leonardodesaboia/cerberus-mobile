import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'cerberus-mobile',
  webDir: './dist',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'http://localhost:3000',
      'http://10.0.2.2:3000',
      'http://172.18.9.78:3000'    
    ]
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;