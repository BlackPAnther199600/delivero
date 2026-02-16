import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { io } from 'socket.io-client';
import { makeRequest } from '../../services/api';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = 'https://delivero-gyjx.onrender.com';

export default function ManagerRealTimeMapScreen() {
    const [riders, setRiders] = useState({});
    const [loading, setLoading] = useState(true);
    const [mapRegion, setMapRegion] = useState({
        latitude: 41.8902,
        longitude: 12.4922,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    });

    const loadActiveOrdersFallback = async () => {
        try {
            console.log('[ManagerRealTimeMap] fallback fetch /orders/active/all');
            const data = await makeRequest('/orders/active/all', { method: 'GET' });
            const list = Array.isArray(data) ? data : (data?.data || []);

            const next = {};
            for (const o of list) {
                if (o?.rider_latitude == null || o?.rider_longitude == null) continue;
                const lat = parseFloat(o.rider_latitude);
                const lng = parseFloat(o.rider_longitude);
                if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
                next[String(o.id)] = {
                    orderId: o.id,
                    lat,
                    lng,
                    eta_minutes: o.eta_minutes,
                    status: o.status,
                };
            }

            const nextCount = Object.keys(next).length;
            console.log('[ManagerRealTimeMap] fallback active orders with coords', nextCount);
            if (nextCount > 0) {
                setRiders(prev => ({ ...prev, ...next }));
            }

            setLoading(false);
        } catch (e) {
            console.log('[ManagerRealTimeMap] fallback fetch error', e?.message || e);
            setLoading(false);
        }
    };

    useEffect(() => {
        let socket;

        const initSocket = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                console.log('[ManagerRealTimeMap] init socket', SOCKET_URL, 'token?', !!token);

                if (!token) {
                    console.log('[ManagerRealTimeMap] missing token: cannot connect socket');
                    setLoading(false);
                    return;
                }

                socket = io(SOCKET_URL, {
                    auth: { token },
                    transports: ['websocket'],
                    reconnection: true,
                    reconnectionDelay: 1000,
                    reconnectionDelayMax: 5000,
                    reconnectionAttempts: 5,
                });

                socket.on('connect', () => {
                    console.log('[ManagerRealTimeMap] socket connected', socket.id);
                    try {
                        socket.emit('joinManagerRoom');
                        console.log('[ManagerRealTimeMap] emitted joinManagerRoom');
                    } catch (e) {
                        console.log('[ManagerRealTimeMap] failed to emit joinManagerRoom', e?.message || e);
                    }
                });

                socket.on('disconnect', (reason) => {
                    console.log('[ManagerRealTimeMap] socket disconnected', reason);
                });

                socket.on('connect_error', (err) => {
                    console.log('[ManagerRealTimeMap] socket connect_error', err?.message || err);
                });

                socket.on('error', (err) => {
                    console.log('[ManagerRealTimeMap] socket error', err?.message || err);
                });

                // Backend emits updates to managers room on rider location/order status
                socket.on('activeOrderUpdate', (data) => {
                    console.log('[ManagerRealTimeMap] activeOrderUpdate', data);
                    const orderId = data?.orderId;
                    const lat = data?.latitude;
                    const lng = data?.longitude;
                    if (!orderId || lat == null || lng == null) {
                        setLoading(false);
                        return;
                    }
                    setRiders(prev => ({
                        ...prev,
                        [String(orderId)]: {
                            orderId,
                            lat,
                            lng,
                            eta_minutes: data?.eta_minutes,
                            status: data?.status,
                        }
                    }));
                    setLoading(false);
                });
            } catch (e) {
                console.log('[ManagerRealTimeMap] init socket error', e?.message || e);
                setLoading(false);
            }
        };

        initSocket();

        // Fallback: populate markers even if socket updates are not arriving yet
        loadActiveOrdersFallback();
        const interval = setInterval(loadActiveOrdersFallback, 15000);

        return () => {
            try {
                socket?.disconnect();
            } catch (e) {
                // ignore
            }

            try {
                clearInterval(interval);
            } catch (e) {
                // ignore
            }
        };
    }, []);

    useEffect(() => {
        const loadMyLocation = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                console.log('[ManagerRealTimeMap] location permission', status);
                if (status !== 'granted') return;
                const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                console.log('[ManagerRealTimeMap] my location', loc?.coords);
                setMapRegion(prev => ({
                    ...prev,
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                }));
            } catch (e) {
                console.log('[ManagerRealTimeMap] location error', e?.message || e);
                // keep fallback
            }
        };
        if (Platform.OS !== 'web') {
            loadMyLocation();
        }
    }, []);

    if (Platform.OS === 'web') {
        return <View style={styles.center}><Text>Usa la Dashboard Web per la mappa interattiva</Text></View>;
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                region={mapRegion}
                onRegionChangeComplete={setMapRegion}
                showsUserLocation
            >
                {Object.values(riders).map((rider) => (
                    <Marker
                        key={String(rider.orderId)}
                        coordinate={{
                            latitude: parseFloat(rider.lat),
                            longitude: parseFloat(rider.lng)
                        }}
                        title={`Ordine: ${rider.orderId}`}
                        description={`Stato: ${rider.status || '—'}  ETA: ${rider.eta_minutes != null ? rider.eta_minutes + ' min' : '—'}`}
                        pinColor={rider.status === 'in_transit' ? 'green' : 'orange'}
                    />
                ))}
            </MapView>
            {loading && <ActivityIndicator style={styles.loader} size="large" />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { width: '100%', height: '100%' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loader: { position: 'absolute', top: 20, right: 20 }
});