import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

// Simple Leaflet-based web map wrapper for RiderHomeScreen
export default function WebMapView({ orders = [], riderLocation = { latitude: 40.7128, longitude: -74.0060 } }) {
    const mapContainerId = 'web-map-' + Math.random().toString(36).slice(2);

    useEffect(() => {
        if (typeof document === 'undefined') return;

        // Load Leaflet CSS if not present
        if (!document.querySelector('link[href*="leaflet"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
            document.head.appendChild(link);
        }

        // Load Leaflet JS
        const existing = document.querySelector('script[src*="leaflet.min.js"]');
        if (existing) {
            initMap();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
        script.onload = initMap;
        document.head.appendChild(script);

        function initMap() {
            const L = window.L;
            if (!L || !document.getElementById(mapContainerId)) return;

            const lat = riderLocation.latitude || 40.7128;
            const lng = riderLocation.longitude || -74.0060;
            const map = L.map(mapContainerId).setView([lat, lng], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(map);

            // Rider marker
            L.marker([lat, lng]).addTo(map).bindPopup('La tua posizione').openPopup();

            // Order markers
            orders.forEach((order, idx) => {
                const offsetLat = lat + ((idx + 1) * 0.002);
                const offsetLng = lng + ((idx + 1) * 0.002);
                L.marker([offsetLat, offsetLng]).addTo(map).bindPopup(order.delivery_address || 'Ordine');
            });
        }

        return () => {
            const el = document.getElementById(mapContainerId);
            if (el && el._leaflet_map) el._leaflet_map.remove();
        };
    }, [orders, riderLocation]);

    return (
        <View style={styles.container}>
            <div id={mapContainerId} style={{ width: '100%', height: '350px', borderRadius: 12, overflow: 'hidden' }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
});
