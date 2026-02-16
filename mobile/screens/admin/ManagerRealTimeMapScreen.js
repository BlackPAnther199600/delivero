import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { io } from 'socket.io-client';
import { makeRequest } from '../../services/api';

const SOCKET_URL = 'https://delivero-gyjx.onrender.com';

export default function ManagerRealTimeMapScreen() {
    const [riders, setRiders] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const socket = io(SOCKET_URL);

        // Ascolta gli aggiornamenti di tutti i rider (evento admin)
        socket.on('all_riders_location', (data) => {
            setRiders(prev => ({
                ...prev,
                [data.riderId]: data
            }));
            setLoading(false);
        });

        return () => socket.disconnect();
    }, []);

    if (Platform.OS === 'web') {
        return <View style={styles.center}><Text>Usa la Dashboard Web per la mappa interattiva</Text></View>;
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 41.8902,
                    longitude: 12.4922,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                }}
            >
                {Object.values(riders).map((rider) => (
                    <Marker
                        key={rider.riderId}
                        coordinate={{ latitude: rider.lat, longitude: rider.lng }}
                        title={`Rider: ${rider.name}`}
                        description={`Stato: ${rider.status}`}
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