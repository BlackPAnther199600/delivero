import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

export default function WebMapView({ orders = [], riderLocation }) {
    if (Platform.OS !== 'web') return null;

    const mapId = "rider-map-container";

    useEffect(() => {
        // Caricamento dinamico di Leaflet solo se siamo su Web
        const L = window.L;
        if (!L) return;

        const map = L.map(mapId).setView([riderLocation?.latitude || 41.89, riderLocation?.longitude || 12.49], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        // Marker Rider
        if (riderLocation) {
            L.marker([riderLocation.latitude, riderLocation.longitude], {
                icon: L.divIcon({ html: '🚴', className: 'rider-icon', iconSize: [30, 30] })
            }).addTo(map).bindPopup("Tu");
        }

        // Marker Ordini
        orders.forEach(order => {
            if (order.lat && order.lng) {
                L.marker([order.lat, order.lng]).addTo(map).bindPopup(`Ordine #${order.id}`);
            }
        });

        return () => map.remove();
    }, [orders, riderLocation]);

    return <View id={mapId} style={{ height: 300, width: '100%', borderRadius: 10 }} />;
}