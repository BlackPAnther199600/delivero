import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix marker icons for Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const styles = {
    container: {
        width: '100%',
        minHeight: '400px',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        fontSize: '14px',
        color: '#666',
    },
    errorContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        backgroundColor: '#fee2e2',
        padding: '20px',
    },
    errorIcon: {
        fontSize: '48px',
        marginBottom: '10px',
    },
    errorTitle: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#991b1b',
        marginBottom: '5px',
    },
    errorMessage: {
        fontSize: '14px',
        color: '#7f1d1d',
        textAlign: 'center',
    },
    emptyContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        backgroundColor: '#f0fdf4',
        padding: '20px',
    },
    emptyIcon: {
        fontSize: '48px',
        marginBottom: '10px',
    },
    emptyTitle: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#166534',
        marginBottom: '5px',
    },
    emptyMessage: {
        fontSize: '14px',
        color: '#15803d',
        textAlign: 'center',
    },
};

export default function TrackingMap({ orderId, title = `Tracciamento Ordine #${orderId}` }) {
    const [trackPoints, setTrackPoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mapCenter, setMapCenter] = useState([45.4642, 9.1900]); // Milano default

    useEffect(() => {
        loadTrackingData();
    }, [orderId]);

    const loadTrackingData = async () => {
        try {
            setLoading(true);
            setError(null);
            const pts = await ordersAPI.getTrackHistory(orderId);
            const points = Array.isArray(pts) ? pts : [];

            setTrackPoints(points);

            // Set map center to first point if available
            if (points.length > 0) {
                const firstPoint = [parseFloat(points[0].latitude), parseFloat(points[0].longitude)];
                setMapCenter(firstPoint);
            }
        } catch (err) {
            console.error('Error loading tracking data:', err);
            setError(err.response?.data?.message || err.message || 'Errore nel caricamento dei dati di tracciamento');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingContainer}>
                    <div style={styles.loadingText}>⏳ Caricamento cronologia di tracciamento...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.errorContainer}>
                    <div style={styles.errorIcon}>⚠️</div>
                    <div style={styles.errorTitle}>Errore</div>
                    <div style={styles.errorMessage}>{error}</div>
                    <button
                        onClick={loadTrackingData}
                        style={{
                            marginTop: '15px',
                            padding: '8px 16px',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                        }}
                    >
                        Riprova
                    </button>
                </div>
            </div>
        );
    }

    if (trackPoints.length === 0) {
        return (
            <div style={styles.container}>
                <div style={styles.emptyContainer}>
                    <div style={styles.emptyIcon}>📍</div>
                    <div style={styles.emptyTitle}>Nessuna cronologia di tracciamento</div>
                    <div style={styles.emptyMessage}>
                        I dati di tracciamento verranno visualizzati quando il rider avrà avviato la consegna
                    </div>
                    <button
                        onClick={loadTrackingData}
                        style={{
                            marginTop: '15px',
                            padding: '8px 16px',
                            backgroundColor: '#16a34a',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                        }}
                    >
                        Aggiorna
                    </button>
                </div>
            </div>
        );
    }

    // Create polyline from track points
    const polylinePoints = trackPoints.map(p => [parseFloat(p.latitude), parseFloat(p.longitude)]);
    const startPoint = polylinePoints[0];
    const endPoint = polylinePoints[polylinePoints.length - 1];

    return (
        <div style={styles.container}>
            <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', minHeight: '400px' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />

                {/* Start marker */}
                <Marker position={startPoint}>
                    <Popup>🟢 Inizio tracciamento</Popup>
                </Marker>

                {/* End marker */}
                <Marker position={endPoint}>
                    <Popup>🔴 Ultima posizione</Popup>
                </Marker>

                {/* Polyline showing the route */}
                <Polyline
                    positions={polylinePoints}
                    color="#ef4444"
                    weight={3}
                    opacity={0.8}
                    dashArray="5, 5"
                    lineCap="round"
                    lineJoin="round"
                />
            </MapContainer>
        </div>
    );
}
