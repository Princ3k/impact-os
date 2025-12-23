import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.impactos.app',
  appName: 'Impact OS',
  webDir: 'out',
  server: {
    // For development, you can use:
    // url: 'http://localhost:3000',
    // cleartext: true
  }
};

export default config;
