import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Platform,
    ActivityIndicator,
    Alert,
    ScrollView,
    Dimensions
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import useOrderTracking from '../../hooks/useOrderTracking';
import { ordersAPI } from '../../services/api';

const { width, height } = Dimensions.get('window');

const ORDER_STATUS_STEPS = [
    { key: 'pending', label: 'Creato', icon: '📝' },
    { key: 'accepted', label: 'Accettato', icon: '👨‍🍳' },
    { key: 'pickup', label: 'Ritirato', icon: '🔖' },
    { key: 'in_transit', label: 'In viaggio', icon: '🚚' },
    { key: 'delivered', label: 'Consegnato', icon: '✅' }
];

const OrderTrackingLiveScreen = ({ route, navigation }) => {
    const { orderId } = route.params;
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deliveryLocation, setDeliveryLocation] = useState(null);

    const tracking = useOrderTracking(orderId, true);

    // Load initial order details
    useEffect(() => {
        const loadOrder = async () => {
            try {
                setLoading(true);
                const orderData = await ordersAPI.trackOrder(orderId);
                setOrder(orderData);
                if (orderData.delivery_latitude && orderData.delivery_longitude) {
                    setDeliveryLocation({
                        latitude: parseFloat(orderData.delivery_latitude),
                        longitude: parseFloat(orderData.delivery_longitude)
                    });
                }
            } catch (error) {
                console.error('Failed to load order:', error);
                Alert.alert('Errore', 'Impossibile caricare l\'ordine');
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [orderId]);

    // Determine current step in stepper
    const getCurrentStepIndex = () => {
        const status = tracking.status || order?.status;
        return ORDER_STATUS_STEPS.findIndex(step => step.key === status) || 0;
    };

    // Get expected delivery time
    const getDeliveryTime = () => {
        if (!tracking.eta && !order?.eta_minutes) return 'Calcolando...';
        const eta = tracking.eta || order?.eta_minutes;
        if (!eta) return 'N/D';
        if (eta < 1) return 'Immediatamente';
        return `~${eta} min`;
    };

    // Calculate distance to delivery point
    const getDistanceInfo = () => {
        if (!tracking.interpolatedLocation || !deliveryLocation) {
            return null;
        }

        const { latitude: deliveryLat, longitude: deliveryLon } = deliveryLocation;
        const { latitude: riderLat, longitude: riderLon } = tracking.interpolatedLocation;

        // Haversine distance calculation
        const toRad = (v) => (v * Math.PI) / 180;
        const R = 6371000; // meters
        const dLat = toRad(deliveryLat - riderLat);
        const dLon = toRad(deliveryLon - riderLon);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(riderLat)) * Math.cos(toRad(deliveryLat)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return {
            distanceMeters: Math.round(distance),
            distanceKm: (distance / 1000).toFixed(2)
        };
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FF6B00" />
                <Text style={{ marginTop: 12, color: '#666' }}>Caricamento ordine...</Text>
            </View>
        );
    }

    const currentStep = getCurrentStepIndex();
    const distanceInfo = getDistanceInfo();
    const riderLocation = tracking.interpolatedLocation || tracking.riderLocation;

    return (
        <ScrollView style={styles.container} nestedScrollEnabled>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>📍 Tracciamento Ordine #{orderId}</Text>
                <Text style={styles.headerSubtitle}>
                    {tracking.trackingStopped ? '✅ Consegnato' : getDeliveryTime()}
                </Text>
            </View>

            {/* Stepper */}
            <View style={styles.stepperContainer}>
                <View style={styles.stepperLine}>
                    {ORDER_STATUS_STEPS.map((step, idx) => (
                        <View key={step.key} style={styles.stepperItemWrapper}>
                            <View
                                style={[
                                    styles.stepperDot,
                                    idx <= currentStep && styles.stepperDotActive,
                                    idx === currentStep && styles.stepperDotCurrent
                                ]}
                            >
                                <Text style={styles.stepperIcon}>{step.icon}</Text>
                            </View>
                            <Text
                                style={[
                                    styles.stepperLabel,
                                    idx <= currentStep && styles.stepperLabelActive
                                ]}
                            >
                                {step.label}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Map Section - Only show if rider has location and tracking not stopped */}
            {!tracking.trackingStopped && riderLocation && Platform.OS !== 'web' && (
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: riderLocation.latitude,
                            longitude: riderLocation.longitude,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05
                        }}
                        region={{
                            latitude: riderLocation.latitude,
                            longitude: riderLocation.longitude,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05
                        }}
                    >
                        {/* Rider marker */}
                        <Marker
                            coordinate={riderLocation}
                            title="Rider Position"
                            description="Posizione attuale del rider"
                            pinColor="#FF6B00"
                        />
                        {/* Delivery location marker */}
                        {deliveryLocation && (
                            <Marker
                                coordinate={deliveryLocation}
                                title="Punto di Consegna"
                                description={order?.delivery_address}
                                pinColor="#4CAF50"
                            />
                        )}
                    </MapView>
                </View>
            )}

            {/* Distance & ETA Info */}
            {!tracking.trackingStopped && riderLocation && (
                <View style={styles.infoPanel}>
                    {distanceInfo && (
                        <>
                            <View style={styles.infoPair}>
                                <Text style={styles.infoLabel}>Distanza:</Text>
                                <Text style={styles.infoValue}>
                                    {distanceInfo.distanceMeters < 1000
                                        ? `${distanceInfo.distanceMeters}m`
                                        : `${distanceInfo.distanceKm}km`}
                                </Text>
                            </View>
                            {tracking.status === 'in_transit' && distanceInfo.distanceMeters < 500 && (
                                <View style={[styles.infoPair, { backgroundColor: '#fff9e6' }]}>
                                    <Text style={styles.infoLabel}>ℹ️ Avviso:</Text>
                                    <Text style={styles.infoValue}>Il rider è vicinissimo!</Text>
                                </View>
                            )}
                        </>
                    )}
                    <View style={styles.infoPair}>
                        <Text style={styles.infoLabel}>Tempo stimato:</Text>
                        <Text style={styles.infoValue}>{getDeliveryTime()}</Text>
                    </View>
                </View>
            )}

            {/* Tracking Stopped Message */}
            {tracking.trackingStopped && (
                <View style={styles.successPanel}>
                    <Text style={styles.successIcon}>✅</Text>
                    <Text style={styles.successText}>Ordine consegnato!</Text>
                    <Text style={styles.successSubtext}>Grazie per aver ordinato su Delivero</Text>
                </View>
            )}

            {/* Error Message */}
            {tracking.error && (
                <View style={styles.errorPanel}>
                    <Text style={styles.errorText}>⚠️ {tracking.error}</Text>
                </View>
            )}

            {/* Order Details */}
            {order && (
                <View style={styles.detailsPanel}>
                    <Text style={styles.detailsTitle}>Dettagli Ordine</Text>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Indirizzo:</Text>
                        <Text style={styles.detailValue}>{order.delivery_address}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Importo:</Text>
                        <Text style={styles.detailValue}>€{parseFloat(order.total_amount).toFixed(2)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Stato:</Text>
                        <Text style={styles.detailValue}>{order.status.toUpperCase()}</Text>
                    </View>
                </View>
            )}

            <View style={{ height: 20 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    header: {
        backgroundColor: '#FF6B00',
        padding: 20,
        paddingTop: 30
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9
    },
    stepperContainer: {
        backgroundColor: '#fff',
        padding: 20,
        marginTop: 10
    },
    stepperLine: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-start'
    },
    stepperItemWrapper: {
        alignItems: 'center',
        flex: 1
    },
    stepperDot: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8
    },
    stepperDotActive: {
        backgroundColor: '#FF6B00'
    },
    stepperDotCurrent: {
        backgroundColor: '#FF6B00',
        borderWidth: 2,
        borderColor: '#fff'
    },
    stepperIcon: {
        fontSize: 18
    },
    stepperLabel: {
        fontSize: 11,
        color: '#999',
        textAlign: 'center',
        fontWeight: '600'
    },
    stepperLabelActive: {
        color: '#FF6B00',
        fontWeight: '700'
    },
    mapContainer: {
        marginHorizontal: 10,
        marginTop: 15,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#fff'
    },
    map: {
        width: '100%',
        height: 300
    },
    infoPanel: {
        backgroundColor: '#fff',
        marginHorizontal: 10,
        marginTop: 12,
        borderRadius: 8,
        padding: 15
    },
    infoPair: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600'
    },
    infoValue: {
        fontSize: 14,
        color: '#FF6B00',
        fontWeight: '700'
    },
    successPanel: {
        backgroundColor: '#e8f5e9',
        marginHorizontal: 10,
        marginTop: 15,
        borderRadius: 8,
        padding: 20,
        alignItems: 'center'
    },
    successIcon: {
        fontSize: 40,
        marginBottom: 8
    },
    successText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2e7d32',
        marginBottom: 5
    },
    successSubtext: {
        fontSize: 13,
        color: '#558b2f'
    },
    errorPanel: {
        backgroundColor: '#ffebee',
        marginHorizontal: 10,
        marginTop: 12,
        borderRadius: 8,
        padding: 12
    },
    errorText: {
        fontSize: 14,
        color: '#c62828',
        fontWeight: '600'
    },
    detailsPanel: {
        backgroundColor: '#fff',
        marginHorizontal: 10,
        marginTop: 15,
        borderRadius: 8,
        padding: 15
    },
    detailsTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
        marginBottom: 12
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    detailLabel: {
        fontSize: 13,
        color: '#666',
        fontWeight: '600'
    },
    detailValue: {
        fontSize: 13,
        color: '#333',
        fontWeight: '700'
    }
});

export default OrderTrackingLiveScreen;
