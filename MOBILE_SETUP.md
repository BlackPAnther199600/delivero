# 📱 Mobile App Setup - React Native

Guida completa per settare e deployare l'app mobile con Expo.

## 🛠️ Prerequisiti

- Node.js 18+
- npm o yarn
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode 14+ (Mac)
- Android: Android Studio

## 📦 Setup Locale

```bash
cd mobile

# Installa dipendenze
npm install

# Avvia con Expo
expo start
```

### Scansiona con il telefono

1. Installa app **Expo Go** dal App Store o Play Store
2. Scansiona il QR code che appare nel terminal
3. Aspetta che l'app si carichi (~30 secondi)

## 🏃 Comandi Disponibili

```bash
# Development server (Expo)
npm start

# Test su Android
npm run android

# Test su iOS (macOS solo)
npm run ios

# Crea build per production
npm run build

# EAS Build (Expo's build service)
npm run build:ios
npm run build:android
```

## 🔧 Struttura App

```
mobile/
├── App.js                 # Entry point
├── components/
│   ├── LoginForm.js
│   ├── OrderTracking.js
│   ├── BillsList.js
│   └── PaymentComponent.js
├── screens/
│   ├── HomeScreen.js
│   ├── OrdersScreen.js
│   └── BillsScreen.js
├── services/
│   └── api.js
├── app.json               # Expo config
└── package.json
```

## 📱 implementazione componenti

### App.js - Structure Base

```javascript
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import io from 'socket.io-client';

import HomeScreen from './screens/HomeScreen';
import OrdersScreen from './screens/OrdersScreen';
import BillsScreen from './screens/BillsScreen';
import LoginScreen from './screens/LoginScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Orders" component={OrdersScreen} />
        <Tab.Screen name="Bills" component={BillsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

## 🌐 API Integration

Usa `react-native-axios` o fetch per chiamare l'API:

```javascript
// services/api.js
import axios from 'axios';

const API_URL = 'http://your-api.com/api';
const getToken = () => AsyncStorage.getItem('token');

export const ordersAPI = {
  getAll: async () => {
    const token = await getToken();
    return axios.get(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};
```

## 📍 Tracking in Tempo Reale

```javascript
// screens/OrdersScreen.js
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const socket = io(API_URL);
    
    socket.on('orderStatusUpdate', (data) => {
      updateOrderUI(data);
    });

    return () => socket.disconnect();
  }, []);

  return (
    // Render orders con status in tempo reale
  );
}
```

## 🏢 Build per Production

### EAS Build (Consigliato)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build
eas build --platform all --auto-submit

# Verifica stato
eas build

# Submit to stores
eas submit
```

### Configurazione app.json

```json
{
  "expo": {
    "name": "Delivero",
    "slug": "delivero",
    "version": "1.0.0",
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTabletMode": true,
      "buildNumber": "1"
    },
    "android": {
      "package": "com.delivero.app",
      "versionCode": 1,
      "buildNumber": "1"
    }
  }
}
```

## 📦 Dipendenze Consigliate

```bash
npm install React Native Navigation
npm install react-native-gesture-handler
npm install @react-navigation/native
npm install @react-navigation/bottom-tabs
npm install react-native-screens
npm install react-native-safe-area-context
npm install axios
npm install socket.io-client
npm install @react-native-async-storage/async-storage
npm install react-native-stripe-sdk
```

## 🔐 Security

- Store tokens in AsyncStorage (non in localStorage)
- Usa HTTPS per tutte le API calls
- Implementa biometric authentication (Face ID, fingerprint)
- Valida le richieste lato server

## 🚀 Push Notifications

```bash
# Setup Expo Notifications
npm install expo-notifications
```

```javascript
import * as Notifications from 'expo-notifications';

async function registerForPushNotificationsAsync() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}
```

## 📊 Performance

- Lazy load screens
- Memoize expensive components
- Use FlatList per liste lunghe
- Compress immagini

## 🐛 Debugging

```bash
# Expo Dev Tools
npx expo-dev-client

# Remote debugging
npm install react-native-debugger

# Logs
expo logs --local
```

## 🆘 Troubleshooting

### App crash al download
- Verifica versione Node.js
- Cancella node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm start -c`

### API non raggiunge
- Verifica CORS nel backend
- Controlla il firewall
- Usa IP locale invece di localhost

### Performance lenta
- Profile con React Devtools
- Riduci rerenders
- Implementa code splitting

## 📱 App Store Release

### iOS
1. Genera Certificate Signing Request (CSR)
2. Crea App ID in Apple Developer
3. Genera provisioning profile
4. Bundle e submit con Transport: `eas submit`

### Android
1. Genera keystore: `keytool -genkey`
2. Configura app.json con keystore
3. Build e submit: `eas submit`

## 📚 Link Utili

- [Expo Docs](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [EAS Docs](https://eas.expo.dev)
- [App Store Submission](https://developer.apple.com)
- [Google Play Store](https://play.google.com/console)
