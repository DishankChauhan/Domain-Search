# Mobile Wallet Adapter Testing Guide

## Quick Testing Workflow (No Rebuild Required)

### 1. Test JavaScript Changes with EAS Update

```bash
# After making changes to JavaScript files (like SolanaContext.js):

# Publish an update to your development channel
eas update --channel development --message "Fix wallet connection identity"

# Wait 10-30 seconds, then test on your device:
# 1. Force close the app completely
# 2. Reopen the app
# 3. The update will be downloaded and applied automatically
```

### 2. Real-Time Development

```bash
# For immediate testing during development:
npx expo start --dev-client

# Your development build will connect to the Metro bundler
# Changes are reflected immediately (hot reload)
```

## Mobile Wallet Adapter Debugging Checklist

### Current Configuration
- ✅ Identity Name: `com.domainswipe.app`
- ✅ Identity URI: `com.domainswipe.app://domainswipe`
- ✅ Cluster: `devnet`
- ✅ Intent Filters: Added in app.json

### Common Issues & Solutions

#### 1. **Wallet App Not Opening**
**Symptoms:** Tap "Connect Wallet" but nothing happens
**Debug Steps:**
```javascript
// Check console logs for:
console.log('🔄 Attempting to authorize Mobile Wallet Adapter...');
console.log('📱 Using identity:', { ... });
```

**Solutions:**
- Ensure Phantom/Solflare wallet is installed on device
- Check intent filters in app.json
- Verify development build (not Expo Go)

#### 2. **Authorization Rejected**
**Symptoms:** Wallet opens but rejects connection
**Debug Steps:**
```javascript
// Look for error logs:
console.error('❌ Mobile Wallet Adapter authorization failed:', error);
```

**Solutions:**
- Use correct bundle identifier: `com.domainswipe.app`
- Ensure URI scheme matches: `com.domainswipe.app://domainswipe`
- Test with different wallet apps

#### 3. **App Crashes After Wallet Connection**
**Symptoms:** App closes after approving in wallet
**Debug Steps:**
- Check React Native logs: `npx react-native log-android`
- Look for native crashes in Android Studio

**Solutions:**
- Ensure proper deep linking setup
- Check Android intent filters
- Verify development build includes MWA libraries

## Testing Commands

### Development Build Testing
```bash
# 1. Install development build on device (one-time)
eas build --platform android --profile development

# 2. Test changes with updates (fast)
eas update --channel development --message "Test wallet fix"

# 3. Test with live reload (fastest)
npx expo start --dev-client
```

### Wallet App Requirements
Install these on your test device:
- **Phantom Wallet**: Most popular, good for testing
- **Solflare**: Alternative wallet for testing
- **Ultimate**: Another option

### Debug Logs to Monitor
```javascript
// In SolanaContext.js - these logs help diagnose issues:
'🔄 Attempting to authorize Mobile Wallet Adapter...'
'📱 Using identity:'
'📞 Starting wallet authorization...'
'✅ Authorization successful:'
'❌ Mobile Wallet Adapter authorization failed:'
```

## Native Changes That Require Rebuild

**You ONLY need to rebuild if you change:**
- app.json (intent filters, bundle ID)
- Native Android/iOS code
- Dependencies that require native compilation
- Expo config plugins

**JavaScript-only changes (no rebuild needed):**
- SolanaContext.js updates
- React component changes
- Business logic modifications
- UI updates

## Quick Fix Commands

```bash
# If wallet connection fails, try these in order:

# 1. Push identity fix with EAS Update
eas update --channel development --message "Fix wallet identity config"

# 2. Test with debug logs
npx expo start --dev-client

# 3. If still broken, rebuild with new config
eas build --platform android --profile development --local
```

## Success Indicators

**✅ Working Connection:**
```
🔄 Attempting to authorize Mobile Wallet Adapter...
📱 Using identity: { name: 'com.domainswipe.app', uri: 'com.domainswipe.app://domainswipe' }
📞 Starting wallet authorization...
✅ Authorization successful: { publicKey: '...', ... }
💾 Wallet stored in state
💰 Balance loaded
```

**❌ Failed Connection:**
```
❌ Mobile Wallet Adapter authorization failed: Error: ...
📋 Error details: { message: '...', code: '...', ... }
```

## Testing Protocol

1. **Install wallet app** (Phantom/Solflare) on test device
2. **Install development build** on same device
3. **Make JavaScript changes** to wallet connection
4. **Publish EAS update** (`eas update --channel development`)
5. **Force close and reopen app** to download update
6. **Test wallet connection** with debug logs
7. **Iterate quickly** without rebuilding

This workflow should allow you to test and debug wallet connection issues in minutes, not hours! 