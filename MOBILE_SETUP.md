# Impact OS - Mobile App Setup Guide

✅ **Setup Complete!** Your Impact OS app is now configured for mobile deployment with both iOS and Android platforms added.

## Prerequisites

### For iOS Development:
- macOS computer
- Xcode 14+ installed (from Mac App Store)
- CocoaPods installed: `sudo gem install cocoapods`

### For Android Development:
- Android Studio installed
- Android SDK configured
- Java Development Kit (JDK) 17+

## Quick Start

### iOS Development

1. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Keep this running in a terminal window.

3. **Open in Xcode**:
   ```bash
   npm run ios:open
   ```

4. **Build and Run**:
   - In Xcode, select a simulator or connected device
   - Click the "Play" button to build and run
   - The app will connect to `http://localhost:3000`

### Android Development

1. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Keep this running in a terminal window.

3. **Open in Android Studio**:
   ```bash
   npm run android:open
   ```

4. **Build and Run**:
   - In Android Studio, select an emulator or connected device
   - Click the "Run" button
   - The app will connect to `http://localhost:3000`

## Configuration

### App Metadata
Current configuration ([capacitor.config.ts](capacitor.config.ts)):
- **App ID**: `com.impactos.app`
- **App Name**: `Impact OS`

To change these:
1. Edit [capacitor.config.ts](capacitor.config.ts)
2. Run `npx cap sync` to update native projects

### Environment Variables
Make sure your [.env.local](.env.local) file is configured:
```env
NEXT_PUBLIC_SUPABASE_URL=https://cphqtmibnrkcftwgrwbq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
GEMINI_API_KEY=your_gemini_key_here
```

## Development Workflow

### Live Reload (Recommended)
The app is configured to use live reload by default:

1. Start Next.js dev server:
   ```bash
   npm run dev
   ```

2. Open the app in Xcode or Android Studio

3. Make changes to your code - they'll automatically reload in the app!

### Production Build

For production builds, you'll need to:

1. **Update [capacitor.config.ts](capacitor.config.ts)**:
   ```typescript
   // Comment out the development server
   server: {
     // url: 'http://localhost:3000',
     // cleartext: true,
   }
   ```

2. **Build static version**: You'll need to convert API routes to work with static export or deploy the Next.js app separately and point mobile apps to it.

## Adding Native Features

Install Capacitor plugins for native features:

### Examples:
```bash
# Camera access
npm install @capacitor/camera

# Push notifications
npm install @capacitor/push-notifications

# Local notifications
npm install @capacitor/local-notifications

# Status bar customization
npm install @capacitor/status-bar
```

After installing plugins, run:
```bash
npm run ios:sync    # for iOS
npm run android:sync # for Android
```

## Publishing

### iOS (App Store)

1. **Prepare for Production**:
   - Update version in [package.json](package.json)
   - Configure icons and splash screens
   - Set up proper bundle ID in Apple Developer Portal

2. **Archive and Submit**:
   - In Xcode: Product → Archive
   - Follow the App Store submission process

### Android (Google Play)

1. **Generate Keystore** (first time only):
   ```bash
   cd android
   keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Build Release APK**:
   - In Android Studio: Build → Generate Signed Bundle/APK
   - Follow the Google Play submission process

## Troubleshooting

### iOS Build Fails
- Update CocoaPods: `cd ios/App && pod update`
- Clean build: In Xcode, Product → Clean Build Folder

### Android Build Fails
- Invalidate caches: Android Studio → File → Invalidate Caches / Restart
- Clean project: Build → Clean Project

### Can't Connect to localhost
- Make sure dev server is running (`npm run dev`)
- Check that the URL in [capacitor.config.ts](capacitor.config.ts) matches your dev server
- For Android emulator, you might need to use `http://10.0.2.2:3000` instead
- For physical devices, use your computer's IP address

## App Icons and Splash Screens

Generate all required sizes:
```bash
# Install the asset generator
npm install -g @capacitor/assets

# Generate from source files
# Place icon.png (1024x1024) and splash.png (2732x2732) in resources/
npx capacitor-assets generate
```

## Useful Commands

```bash
# Sync changes to native projects
npx cap sync

# Update native platforms
npx cap update

# Open native IDE
npm run ios:open      # Opens Xcode
npm run android:open  # Opens Android Studio

# Copy web assets to native projects
npx cap copy

# List installed Capacitor plugins
npx cap ls plugins
```

## Next Steps

1. Test authentication flow on mobile
2. Test report generation on mobile
3. Add app icon and splash screen
4. Configure push notifications (optional)
5. Set up offline data sync (see implementation notes in conversation)
6. Submit to App Store and Google Play

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [iOS Development Guide](https://capacitorjs.com/docs/ios)
- [Android Development Guide](https://capacitorjs.com/docs/android)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)
