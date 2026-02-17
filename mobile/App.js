import React, { useEffect, useState, useMemo, useReducer, createContext } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform, ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Servizi e Context
import { userAPI } from './services/api';
import { CartProvider, useCart } from './context/CartContext';

// Schermate (Auth)
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
// Schermate (Customer)
import CustomerHomeScreen from './screens/customer/CustomerHomeScreen';
import RestaurantsScreen from './screens/customer/RestaurantsScreen';
import RestaurantDetailScreen from './screens/customer/RestaurantDetailScreen';
import CartScreen from './screens/customer/CartScreen';
import GroceriesScreen from './screens/customer/GroceriesScreen';
import ShoppingScreen from './screens/customer/ShoppingScreen';
import BrandProductsScreen from './screens/customer/BrandProductsScreen';
import CustomerOrdersScreen from './screens/customer/CustomerOrdersScreen';
import CustomerOrderTrackingScreen from './screens/customer/CustomerOrderTrackingScreen';
import OrderTrackingLiveScreen from './screens/customer/OrderTrackingLiveScreen';
// Schermate (Rider)
import RiderHomeScreen from './screens/rider/RiderHomeScreen';
import RiderActiveScreen from './screens/rider/RiderActiveScreen';
// Schermate (Admin)
import AdminDashboardScreen from './screens/admin/AdminDashboardScreen';
import AdminTicketsScreen from './screens/admin/AdminTicketsScreen';

// 1. CREAZIONE DEL CONTEXT PER L'AUTENTICAZIONE
export const AuthContext = createContext();

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// --- NAVIGATORI (AuthStack, CustomerStack, RiderStack, ManagerStack rimangono uguali) ---
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function CustomerTabs({ onLogout }) {
  const cart = useCart();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#FF6B00',
        headerBackground: () => (
          <LinearGradient colors={['#FF6B00', '#FF8C00']} style={{ flex: 1 }} />
        ),
        headerTintColor: '#fff',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={CustomerHomeScreen} 
        options={{ 
            tabBarIcon: () => <Text>🏠</Text>,
            headerRight: () => (
                <TouchableOpacity onPress={onLogout} style={{ marginRight: 12 }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Logout</Text>
                </TouchableOpacity>
              ),
        }} 
      />
      <Tab.Screen name="Restaurants" component={RestaurantsScreen} options={{ tabBarIcon: () => <Text>🍽️</Text> }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ tabBarIcon: () => <Text>🛒</Text>, tabBarBadge: cart?.itemCount > 0 ? cart.itemCount : null }} />
      <Tab.Screen name="Orders" component={CustomerOrdersScreen} options={{ tabBarIcon: () => <Text>📦</Text> }} />
    </Tab.Navigator>
  );
}
// Rider Stack
function RiderStack({ onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#0066FF',
        headerStyle: { backgroundColor: '#0066FF' },
        headerTintColor: '#fff',
      }}
    >
      <Tab.Screen 
        name="Available" 
        component={RiderHomeScreen} 
        options={{ 
          title: '📦 Disponibili',
          headerRight: () => (
            <TouchableOpacity onPress={onLogout} style={{ marginRight: 12 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Logout</Text>
            </TouchableOpacity>
          ),
        }} 
      />
      <Tab.Screen name="Active" component={RiderActiveScreen} options={{ title: '🚚 Consegne' }} />
    </Tab.Navigator>
  );
}

// Manager/Admin Stack
function ManagerStack({ token, user, onLogout }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackground: () => (
          <LinearGradient colors={['#FF6B00', '#FF8C00']} style={{ flex: 1 }} />
        ),
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen 
        name="AdminDashboard" 
        component={AdminDashboardScreen} 
        initialParams={{ token, user }}
        options={{
          title: '⚙️ Admin',
          headerRight: () => (
            <TouchableOpacity onPress={onLogout} style={{ marginRight: 12 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Logout</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="AdminTickets" component={AdminTicketsScreen} initialParams={{ token }} />
    </Stack.Navigator>
  );
}
function CustomerStack({ onLogout }) {
    return (
      <Stack.Navigator>
        <Stack.Screen name="CustomerTabs" options={{ headerShown: false }}>
            {() => <CustomerTabs onLogout={onLogout} />}
        </Stack.Screen>
        <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
        <Stack.Screen name="OrderTracking" component={CustomerOrderTrackingScreen} />
      </Stack.Navigator>
    );
}

// --- COMPONENTE PRINCIPALE ---
export default function App() {
  const [state, dispatch] = useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return { ...prevState, userToken: action.token, user: action.user, isLoading: false };
        case 'SIGN_IN':
          return { ...prevState, isSignout: false, userToken: action.token, user: action.user };
        case 'SIGN_OUT':
          return { ...prevState, isSignout: true, userToken: null, user: null };
      }
    },
    { isLoading: true, isSignout: false, userToken: null, user: null }
  );

  // 2. LOGICA DELL'AUTHCONTEXT PER IL LOGIN/LOGOUT
  const authContext = useMemo(() => ({
    signIn: async (data) => {
      // Questa funzione verrà chiamata dal LoginScreen
      dispatch({ type: 'SIGN_IN', token: data.token, user: data.user });
    },
    signOut: async () => {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      dispatch({ type: 'SIGN_OUT' });
    },
  }), []);

  useEffect(() => {
  const bootstrapAsync = async () => {
    let token, user;
    try {
      token = await AsyncStorage.getItem('token');
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) user = JSON.parse(userJson);
    } catch (e) {
      console.error('Errore durante il recupero dei dati:', e);
    }
    // IMPORTANTE: Questo deve essere FUORI dal try/catch o comunque eseguito sempre
    dispatch({ type: 'RESTORE_TOKEN', token, user });
  };

  bootstrapAsync();
}, []);

  if (state.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={authContext}>
      <CartProvider>
        <NavigationContainer>
          {state.userToken == null ? (
            <AuthStack />
          ) : state.user?.role === 'customer' ? (
            <CustomerStack onLogout={authContext.signOut} />
          ) : state.user?.role === 'rider' ? (
            <RiderStack onLogout={authContext.signOut} />
          ) : (
            <ManagerStack onLogout={authContext.signOut} token={state.userToken} user={state.user} />
          )}
        </NavigationContainer>
      </CartProvider>
    </AuthContext.Provider>
  );
}