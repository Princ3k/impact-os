import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.impactos.app',
  appName: 'Impact OS',
  webDir: 'out',
  server: {
    // Use local dev server for development and testing
    url: 'http://localhost:3000',
    cleartext: true,
    // For production builds, comment out the url above
  },
  ios: {
    // Enable swipe-to-go-back gesture
    contentInset: 'always',
    scrollEnabled: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
