# Android APK Build Guide - Delivero Mobile

This guide explains how to build the Delivero mobile app as an Android APK file.

## Prerequisites

1. **Node.js** (v14+) and npm installed
2. **Expo CLI** installed globally:
   ```bash
   npm install -g eas-cli
   npm install -g expo-cli
   ```
3. **Expo Account** (free at https://expo.dev)
4. **Git** installed (optional, for version control)

## Step 1: Authenticate with Expo

```bash
eas login
```

Enter your Expo credentials when prompted.

## Step 2: Navigate to Mobile Directory

```bash
cd mobile
```

## Step 3: Build APK Locally

The fastest way to build locally (requires more setup but no cloud uploads):

```bash
npm run build:android
```

This runs: `eas build --platform android --local`

**Note:** Local builds require Android SDK tools. If you don't have them:
- Install Android Studio
- Configure ANDROID_HOME environment variable
- Install required SDK versions

## Step 4: Build APK in Cloud (Recommended)

If local build fails, use Expo's cloud build service (no setup required):

```bash
npm run build:android:prod
```

This automatically:
- Uploads your code to Expo's servers
- Builds the APK in their infrastructure
- Downloads the APK when complete

**Processing time:** 10-20 minutes

## Step 5: Download & Install APK

After build completes:

1. The APK will be in your project or downloaded automatically
2. Transfer to your Android device (via USB or email)
3. On Android, go to **Settings → Security → Unknown Sources** (enable)
4. Install the APK:
   ```bash
   adb install delivero-1.0.0.apk
   ```

## Build Options

### Preview Build (Fastest, Development)
```bash
eas build --platform android --profile preview
```

### Production Build (Optimized, AAB format for Google Play)
```bash
npm run build:all
```

## Troubleshooting

### "eas-cli not found"
```bash
npm install -g eas-cli
```

### Build fails locally
- Try cloud build instead: `npm run build:android:prod`
- Check ANDROID_HOME is properly set

### APK too large
- Ensure you're building production version
- Check that development dependencies aren't included
- Use `expo prebuild --clean` to reset native files

### Device won't install APK
- Enable "Unknown Sources" in security settings
- Ensure Android version is 5.0+
- Try installing via Android Studio's Device Manager

## Environment Variables

Before building, ensure `.env` is properly configured:

```env
REACT_APP_API_URL=http://your-server-ip:5000
REACT_APP_ENV=production
```

## Continuous Integration (Optional)

For automated builds on git push:

1. Create `.github/workflows/build.yml` in your repo:

```yaml
name: Build APK
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g eas-cli
      - run: eas login --non-interactive
        env:
          EAS_TOKEN: ${{ secrets.EAS_TOKEN }}
      - run: cd mobile && npm run build:android:prod
```

2. Set `EAS_TOKEN` in GitHub Secrets

## Testing the APK

Before distributing:

1. **Install on test device:**
   ```bash
   adb install app-release.apk
   ```

2. **Test key features:**
   - Login/Registration with role selection
   - Customer dashboard
   - Rider orders
   - Admin panel
   - Ticket creation

3. **Check logs:**
   ```bash
   adb logcat | grep delivero
   ```

## Publishing to Google Play

1. Generate signing key:
   ```bash
   keytool -genkey -v -keystore delivero-release.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias delivero
   ```

2. Configure `eas.json` for production

3. Build AAB (Android App Bundle) for Play Store:
   ```bash
   eas build --platform android --profile production
   ```

4. Upload to Google Play Console

## Quick Reference

```bash
# Install dependencies
cd mobile && npm install

# Local build (requires Android SDK)
npm run build:android

# Cloud build (recommended)
npm run build:android:prod

# Check build status
eas build:list

# Cancel build
eas build:cancel <BUILD_ID>

# View build details
eas build:view <BUILD_ID>
```

## Support

- Expo Documentation: https://docs.expo.dev/
- EAS Build: https://docs.expo.dev/build/setup/
- Build Status: https://expo.dev/builds

---

**Last Updated:** 2024
**Delivero Mobile v1.0.0**
