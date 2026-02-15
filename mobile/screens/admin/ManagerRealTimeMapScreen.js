import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Platform,
    ActivityIndicator,
    Alert,
    FlatList,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRequest } from '../../services/api';

const { width, height } = Dimensions.get('window');

const SOCKET_URL = __DEV__ && typeof window !== 'undefined'
    ? 'http://localhost:5000'
    : 'https://delivero-gyjx.onrender.com';

const ManagerRealTimeMapScreen = ({ route }) => {
    const { token, user } = route.params;
    const [orders, setOrders] = useState([]);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'in_transit', 'delivered'

    // Load initial orders
    useEffect(() => {
        const loadOrders = async () => {
            try {
                setLoading(true);
                const response = await makeRequest('/orders/active/all', { method: 'GET' });
                setOrders(response || []);
            } catch (error) {
                console.error('Failed to load orders:', error);
                Alert.alert('Errore', 'Impossibile caricare gli ordini');
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, []);

    // Initialize WebSocket for real-time updates
    useEffect(() => {
        const initSocket = async () => {
            try {
                const authToken = token || (await AsyncStorage.getItem('token'));
                if (!authToken) {
                    Alert.alert('Errore', 'Token di autenticazione non trovato');
                    return;
                }

                const newSocket = io(SOCKET_URL, {
                    auth: { token: authToken },
                    transports: ['websocket'],
                    reconnection: true
                });

                newSocket.on('connect', () => {
                    console.log('✓ Manager connected to real-time tracking');
                    newSocket.emit('joinManagerRoom');
                });

                newSocket.on('activeOrderUpdate', (data) => {
                    console.log('Order update received:', data.orderId);
                    setOrders(prev => {
                        const index = prev.findIndex(o => o.id === data.orderId);
                        if (index === -1) {
                            // New order
                            return [{ id: data.orderId, ...data }, ...prev];
                        } else {
                            // Update existing
                            const updated = [...prev];
                            updated[index] = {
                                ...updated[index],
                                ...data,
                                rider_latitude: data.latitude || updated[index].rider_latitude,
                                rider_longitude: data.longitude || updated[index].rider_longitude,
                                eta_minutes: data.eta_minutes !== undefined ? data.eta_minutes : updated[index].eta_minutes,
                                status: data.status || updated[index].status
                            };
                            return updated;
                        }
                    });
                });

                newSocket.on('error', (err) => {
                    console.error('Socket error:', err);
                });

                setSocket(newSocket);

                return () => {
                    if (newSocket.connected) {
                        newSocket.disconnect();
                    }
                };
            } catch (e) {
                console.error('Failed to init socket:', e);
                Alert.alert('Errore', 'Connessione WebSocket fallita');
            }
        };

        initSocket();
    }, [token]);

    // Filter orders
    const filteredOrders = orders.filter(order => {
        if (filterStatus === 'all') return true;
        return order.status === filterStatus;
    });

    // Get orders with rider location for map
    const ordersWithLocation = filteredOrders.filter(o => o.rider_latitude && o.rider_longitude);

    // Calculate center of all markers
    const getMapCenter = () => {
        if (ordersWithLocation.length === 0) {
            return {
                latitude: 45.4642,
                longitude: 9.19,
                latitudeDelta: 0.5,
                longitudeDelta: 0.5
            };
        }

        const lats = ordersWithLocation.map(o => parseFloat(o.rider_latitude));
        const lons = ordersWithLocation.map(o => parseFloat(o.rider_longitude));

        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLon = Math.min(...lons);
        const maxLon = Math.max(...lons);

        return {
            latitude: (minLat + maxLat) / 2,
            longitude: (minLon + maxLon) / 2,
            latitudeDelta: Math.max(maxLat - minLat, 0.1) * 1.3,
            longitudeDelta: Math.max(maxLon - minLon, 0.1) * 1.3
        };
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#FFC107';
            case 'accepted': return '#FF9800';
            case 'pickup': return '#2196F3';
            case 'in_transit': return '#00BCD4';
            case 'delivered': return '#4CAF50';
            default: return '#9E9E9E';
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: 'In attesa',
            accepted: 'Accettato',
            pickup: 'Ritirato',
            in_transit: 'In viaggio',
            delivered: 'Consegnato'
        };
        return labels[status] || status;
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FF6B00" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Map */}
            {Platform.OS !== 'web' && (
                <MapView
                    style={styles.map}
                    initialRegion={getMapCenter()}
                    region={getMapCenter()}
                >
                    {ordersWithLocation.map(order => (
                        <Marker
                            key={order.id}
                            coordinate={{
                                latitude: parseFloat(order.rider_latitude),
                                longitude: parseFloat(order.rider_longitude)
                            }}
                            pinColor={getStatusColor(order.status)}
                            title={`Ordine #${order.id}`}
                            description={`${getStatusLabel(order.status)} • €${order.total_amount}`}
                            onPress={() => setSelectedOrder(order)}
                        />
                    ))}
                </MapView>
            )}

            {/* Filters */}
            <View style={styles.filterBar}>
                {['all', 'pending', 'in_transit', 'delivered'].map(status => (
                    <TouchableOpacity
                        key={status}
                        style={[
                            styles.filterButton,
                            filterStatus === status && styles.filterButtonActive
                        ]}
                        onPress={() => setFilterStatus(status)}
                    >
                        <Text
                            style={[
                                styles.filterButtonText,
                                filterStatus === status && styles.filterButtonTextActive
                            ]}
                        >
                            {status === 'all' ? 'Tutti' : getStatusLabel(status)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Orders List */}
            <View style={styles.listContainer}>
                <Text style={styles.listTitle}>
                    📦 Ordini Attivi ({filteredOrders.length})
                </Text>
                <FlatList
                    data={filteredOrders}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.orderCard,
                                selectedOrder?.id === item.id && styles.orderCardSelected
                            ]}
                            onPress={() => setSelectedOrder(item)}
                        >
                            <View style={styles.orderCardHeader}>
                                <Text style={styles.orderID}>Ordine #{item.id}</Text>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        { backgroundColor: getStatusColor(item.status) }
                                    ]}
                                >
                                    <Text style={styles.statusBadgeText}>{getStatusLabel(item.status)}</Text>
                                </View>
                            </View>

                            <View style={styles.orderCardBody}>
                                <Text style={styles.orderInfo}>
                                    👤 {item.customer_name || 'Cliente'} → 🚚 {item.rider_name || '---'}
                                </Text>
                                <Text style={styles.orderInfo}>
                                    💰 €{item.total_amount} {item.eta_minutes ? `| ⏱️ ${item.eta_minutes}min` : ''}
                                </Text>
                                {item.rider_latitude && item.rider_longitude && (
                                    <Text style={styles.orderInfo}>
                                        📍 {parseFloat(item.rider_latitude).toFixed(4)}, {parseFloat(item.rider_longitude).toFixed(4)}
                                    </Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    )}
                    scrollEnabled={true}
                    nestedScrollEnabled={true}
                    style={styles.ordersList}
                />
            </View>

            {/* Selected Order Details */}
            {selectedOrder && (
                <View style={styles.detailsPanel}>
                    <Text style={styles.detailsTitle}>Dettagli Ordine #{selectedOrder.id}</Text>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Cliente:</Text>
                        <Text style={styles.detailValue}>{selectedOrder.customer_name || '---'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Rider:</Text>
                        <Text style={styles.detailValue}>{selectedOrder.rider_name || '---'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Stato:</Text>
                        <Text style={styles.detailValue}>{getStatusLabel(selectedOrder.status)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>ETA:</Text>
                        <Text style={styles.detailValue}>{selectedOrder.eta_minutes ?? 'N/D'} min</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Indirizzo:</Text>
                        <Text style={styles.detailValue}>{selectedOrder.delivery_address}</Text>
                    </View>
                </View>
            )}
        </View>
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
    map: {
        width: '100%',
        height: height * 0.4
    },
    filterBar: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        gap: 6
    },
    filterButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff'
    },
    filterButtonActive: {
        backgroundColor: '#FF6B00',
        borderColor: '#FF6B00'
    },
    filterButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666'
    },
    filterButtonTextActive: {
        color: '#fff'
    },
    listContainer: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingTop: 10
    },
    listTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8
    },
    ordersList: {
        flex: 1
    },
    orderCard: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8
    },
    orderCardSelected: {
        borderColor: '#FF6B00',
        borderWidth: 2,
        backgroundColor: '#fff9f0'
    },
    orderCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    orderID: {
        fontSize: 13,
        fontWeight: '700',
        color: '#333'
    },
    statusBadge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#fff'
    },
    orderCardBody: {
        gap: 4
    },
    orderInfo: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500'
    },
    detailsPanel: {
        backgroundColor: '#FFF9E6',
        borderTopWidth: 1,
        borderTopColor: '#FFB74D',
        padding: 12,
        maxHeight: 200
    },
    detailsTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4
    },
    detailLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600'
    },
    detailValue: {
        fontSize: 12,
        color: '#FF6B00',
        fontWeight: '700'
    }
});

export default ManagerRealTimeMapScreen;
