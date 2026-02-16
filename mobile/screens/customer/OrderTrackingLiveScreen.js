import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { makeRequest } from '../../services/api';

export default function OrderTrackingLiveScreen({ route }) {
    const { orderId } = route.params;
    const [order, setOrder] = useState(null);
    const [riderLocation, setRiderLocation] = useState(null);
    const [mapRegion, setMapRegion] = useState({
        latitude: 41.88,
        longitude: 12.67,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
    });

    useEffect(() => {
        const interval = setInterval(() => {
            fetchTrackingData();
        }, 5000); // Aggiorna ogni 5 secondi
        return () => clearInterval(interval);
    }, []);

    const fetchTrackingData = async () => {
        try {
            const data = await makeRequest(`/orders/${orderId}/track`);
            setOrder(data);
            if (data?.rider_latitude && data?.rider_longitude) {
                const next = {
                    latitude: parseFloat(data.rider_latitude),
                    longitude: parseFloat(data.rider_longitude)
                };
                setRiderLocation(next);
                setMapRegion(prev => ({
                    ...prev,
                    latitude: next.latitude,
                    longitude: next.longitude,
                }));
            }
        } catch (e) { console.log("Tracking error", e); }
    };

    return (
        <View style={{ flex: 1 }}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={{ flex: 1 }}
                region={mapRegion}
                onRegionChangeComplete={setMapRegion}
            >
                {riderLocation && (
                    <Marker coordinate={riderLocation} title="Il tuo Rider" pinColor="orange" />
                )}
            </MapView>
            <View style={styles.infoBox}>
                <Text style={styles.statusText}>Stato: {order?.status || 'In caricamento...'}</Text>
                <Text>Consegna stimata: {order?.eta_minutes || '--'} min</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    infoBox: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 5 },
    statusText: { fontSize: 18, fontWeight: 'bold', color: '#FF6B00' }
});