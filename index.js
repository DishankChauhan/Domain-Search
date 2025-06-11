import { registerRootComponent } from 'expo';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { Buffer } from 'buffer';
import { Platform } from 'react-native';

// Make Buffer available globally
global.Buffer = Buffer;

// Add CSS for web scrolling
if (Platform.OS === 'web') {
  // Inject CSS to allow proper scrolling on web
  const style = document.createElement('style');
  style.textContent = `
    html, body {
      height: 100%;
      overflow: auto;
      -webkit-overflow-scrolling: touch;
    }
    #root, #root > div {
      height: 100%;
      overflow: visible;
    }
  `;
  document.head.appendChild(style);
}

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
