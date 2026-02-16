import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { io } from 'socket.io-client';
import { makeRequest } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const SOCKET_URL = 'https://delivero-gyjx.onrender.com';

export default function ManagerRealTimeMapScreen() {
    const [riders, setRiders] = useState({});
    const [loading, setLoading] = useState(true);
    const [region, setRegion] = useState({
        latitude: 41.880025,
        longitude: 12.67594,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
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

    // Generate HTML for OpenStreetMap with markers
    const generateMapHtml = () => {
        const markers = Object.values(riders).map(r => `
            L.marker([${r.lat}, ${r.lng}])
                .addTo(map)
                .bindPopup('<b>Ordine #${r.orderId}</b><br/>Stato: ${r.status || '—'}<br/>ETA: ${r.eta_minutes != null ? r.eta_minutes + ' min' : '—'}');
        `).join('\n');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                <style>
                    body { margin:0; padding:0; }
                    #map { position:absolute; top:0; bottom:0; width:100%; height:100%; }
                </style>
            </head>
            <body>
                <div id="map"></div>
                <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                <script>
                    var map = L.map('map').setView([41.880025, 12.67594], 13);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap contributors'
                    }).addTo(map);
                    ${markers}
                </script>
            </body>
            </html>
        `;
    };

    return (
        <View style={styles.container}>
            <WebView
                style={styles.map}
                source={{ html: generateMapHtml() }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => <ActivityIndicator style={styles.loader} size="large" />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { width: '100%', height: '100%' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loader: { position: 'absolute', top: 20, right: 20 }
});