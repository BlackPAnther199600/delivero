import React, { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { userAPI } from './services/api';

let Device = null;
if (Platform.OS !== 'web') {
  try {
    Device = require('expo-device');
  } catch (e) {
    // dynamic require failed (e.g. running in web bundler) — leave Device null
    Device = null;
  }
}
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import CustomerHomeScreen from './screens/customer/CustomerHomeScreen';
import RestaurantsScreen from './screens/customer/RestaurantsScreen';
import GroceriesScreen from './screens/customer/GroceriesScreen';
import ShoppingScreen from './screens/customer/ShoppingScreen';
import BrandProductsScreen from './screens/customer/BrandProductsScreen';
import CustomerOrdersScreen from './screens/customer/CustomerOrdersScreen';
import CustomerOrderTrackingScreen from './screens/customer/CustomerOrderTrackingScreen';
import OrderTrackingLiveScreen from './screens/customer/OrderTrackingLiveScreen';
import RiderHomeScreen from './screens/rider/RiderHomeScreen';
import RiderActiveScreen from './screens/rider/RiderActiveScreen';
import AdminDashboardScreen from './screens/admin/AdminDashboardScreen';
import AdminTicketsScreen from './screens/admin/AdminTicketsScreen';
import { ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack per non autenticati
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Customer Stack
function CustomerTabs({ onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#FF6B00',
        tabBarInactiveTintColor: '#999',
        headerStyle: {
          backgroundColor: '#FF6B00',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={CustomerHomeScreen}
        options={{
          title: '🍔 Home',
          tabBarLabel: '🍔 Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text>,
          headerRight: () => (
            <TouchableOpacity onPress={onLogout} style={{ marginRight: 12 }}>
              <Text style={{ fontSize: 20 }}>🚪</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen
        name="Restaurants"
        component={RestaurantsScreen}
        options={{
          title: '🍽️ Ristoranti',
          tabBarLabel: '🍽️ Ristoranti',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🍽️</Text>,
        }}
      />
      <Tab.Screen
        name="Groceries"
        component={GroceriesScreen}
        options={{
          title: '🛒 Spesa',
          tabBarLabel: '🛒 Spesa',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🛒</Text>,
        }}
      />
      <Tab.Screen
        name="Shopping"
        component={ShoppingScreen}
        options={{
          title: '🛍️ Shopping',
          tabBarLabel: '🛍️ Shopping',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🛍️</Text>,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={CustomerOrdersScreen}
        options={{
          title: '📦 Ordini',
          tabBarLabel: '📦 Ordini',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📦</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

function CustomerStack({ onLogout }) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CustomerTabs"
        // pass onLogout down to tabs so header button can call it
        children={() => <CustomerTabs onLogout={onLogout} />}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BrandProducts"
        component={BrandProductsScreen}
        options={{ title: 'Prodotti' }}
      />
      <Stack.Screen
        name="OrderTracking"
        component={CustomerOrderTrackingScreen}
        options={{
          title: '📍 Tracciamento Ordine',
          headerStyle: {
            backgroundColor: '#FF6B00',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen
        name="OrderTrackingLive"
        component={OrderTrackingLiveScreen}
        options={{
          title: '🗺️ Tracking Live',
          headerStyle: {
            backgroundColor: '#FF6B00',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>
  );
}

// Rider Stack
function RiderStack({ onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#0066FF',
        tabBarInactiveTintColor: '#999',
        headerStyle: {
          backgroundColor: '#0066FF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Available"
        component={RiderHomeScreen}
        options={{
          title: '📦 Ordini Disponibili',
          tabBarLabel: '📦 Disponibili',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📦</Text>,
          headerRight: () => (
            <TouchableOpacity onPress={onLogout} style={{ marginRight: 12 }}>
              <Text style={{ fontSize: 20 }}>🚪</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen
        name="Active"
        component={RiderActiveScreen}
        options={{
          title: '🚚 Mie Consegne',
          tabBarLabel: '🚚 Consegne',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🚚</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

// Manager Stack - Admin Dashboard
function ManagerStack({ token, user, onLogout }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FF6B00',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          title: '⚙️ Admin Dashboard',
          headerRight: () => (
            <TouchableOpacity onPress={onLogout} style={{ marginRight: 12 }}>
              <Text style={{ fontSize: 20 }}>🚪</Text>
            </TouchableOpacity>
          ),
        }}
        initialParams={{ token, user }}
      />
      <Stack.Screen
        name="AdminTickets"
        component={AdminTicketsScreen}
        options={{
          title: '🎫 Tickets',
        }}
        initialParams={{ token }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.token,
            user: action.user,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
            user: action.user,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
            user: null,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
      user: null,
    }
  );

  useEffect(() => {
    const bootstrapAsync = async () => {
      let token;
      let user;
      try {
        token = await AsyncStorage.getItem('token');
        user = await AsyncStorage.getItem('user');
        if (user) user = JSON.parse(user);

        if (token && user) {
          console.log('✅ Token trovato in AsyncStorage:', token.substring(0, 20) + '...');
          console.log('✅ User trovato:', user);
        }
      } catch (e) {
        // Restoring token failed
        console.error('Error restoring token:', e);
      }

      dispatch({ type: 'RESTORE_TOKEN', token, user });
    };

    bootstrapAsync();

    // Try to register push token for logged in user
    const registerPush = async () => {
      try {
        if (Device && !Device.isDevice) {
          console.log('Push notifications require a physical device');
          return;
        }

        if (!Device) {
          console.log('Push notifications on web - skipping native device check');
        }
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          console.log('Failed to get push token permission');
          return;
        }
        const tokenData = await Notifications.getExpoPushTokenAsync();
        const token = tokenData.data;
        console.log('Got push token:', token);
        await AsyncStorage.setItem('push_token', token);
        // send to backend
        try {
          await userAPI.setPushToken(token);
        } catch (e) {
          console.warn('Could not send push token to backend', e.message);
        }
      } catch (e) {
        console.warn('registerPush error', e.message);
      }
    };

    registerPush();

    // Polling interval per controllare se il token è stato salvato (importante per web)
    const pollInterval = setInterval(() => {
      bootstrapAsync();
    }, 1000);

    return () => clearInterval(pollInterval);
  }, []);

  if (state.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {state.userToken == null ? (
        <AuthStack />
      ) : state.user?.role === 'customer' ? (
        <>
          {console.log('🎯 Navigando a CustomerStack per role:', state.user?.role)}
          <CustomerStack onLogout={async () => {
            // Clear storage and update state
            try {
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('user');
            } catch (e) {
              console.warn('Errore durante logout:', e);
            }
            dispatch({ type: 'SIGN_OUT' });
          }} />
        </>
      ) : state.user?.role === 'rider' ? (
        <>
          {console.log('🎯 Navigando a RiderStack per role:', state.user?.role)}
          <RiderStack onLogout={async () => {
            try {
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('user');
            } catch (e) {
              console.warn('Errore durante logout:', e);
            }
            dispatch({ type: 'SIGN_OUT' });
          }} />
        </>
      ) : state.user?.role === 'manager' || state.user?.role === 'admin' ? (
        <>
          {console.log('🎯 Navigando a ManagerStack per role:', state.user?.role)}
          <ManagerStack token={state.userToken} user={state.user} onLogout={async () => {
            try {
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('user');
            } catch (e) {
              console.warn('Errore durante logout:', e);
            }
            dispatch({ type: 'SIGN_OUT' });
          }} />
        </>
      ) : (
        <>
          {console.log('❌ Ruolo sconosciuto:', state.user?.role)}
          <AuthStack />
        </>
      )}
    </NavigationContainer>
  );
}
