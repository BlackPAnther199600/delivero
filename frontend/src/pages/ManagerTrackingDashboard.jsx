import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';
import socketService from '../services/socket';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const styles = {
    container: {
        padding: '20px',
        maxWidth: '1400px',
        margin: '0 auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '20px',
        borderBottom: '2px solid #ddd',
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#1a1a2e',
    },
    refreshIcon: {
        fontSize: '24px',
        cursor: 'pointer',
    },
    statsBar: {
        display: 'flex',
        gap: '20px',
        marginBottom: '20px',
        backgroundColor: '#fff',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    statItem: {
        flex: 1,
        textAlign: 'center',
    },
    statIcon: {
        fontSize: '24px',
        marginBottom: '8px',
    },
    statValue: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#1a1a2e',
        lineHeight: '1.2',
    },
    statLabel: {
        fontSize: '12px',
        color: '#999',
        marginTop: '4px',
    },
    listContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '15px',
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '15px',
        borderLeft: '4px solid #ef4444',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '12px',
        paddingBottom: '12px',
        borderBottom: '1px solid #f0f0f0',
    },
    statusBadge: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        marginRight: '12px',
    },
    orderId: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#1a1a2e',
    },
    riderInfo: {
        fontSize: '12px',
        color: '#666',
        marginTop: '4px',
    },
    metricsRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        marginBottom: '12px',
        fontSize: '12px',
    },
    metricLabel: {
        color: '#999',
        fontWeight: 'bold',
        marginBottom: '2px',
    },
    metricValue: {
        fontSize: '13px',
        fontWeight: 'bold',
        color: '#1a1a2e',
    },
    infoSection: {
        padding: '10px',
        fontSize: '12px',
    },
    infoPair: {
        display: 'flex',
        alignItems: 'flex-start',
        marginBottom: '6px',
    },
    infoLabel: {
        fontWeight: 'bold',
        color: '#666',
        width: '90px',
        flexShrink: 0,
    },
    infoValue: {
        color: '#1a1a2e',
        flex: 1,
    },
    emptyState: {
        textAlign: 'center',
        padding: '60px 20px',
    },
    emptyIcon: {
        fontSize: '64px',
        marginBottom: '20px',
    },
    emptyTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#1a1a2e',
        marginBottom: '10px',
    },
    emptyText: {
        fontSize: '14px',
        color: '#999',
    },
};

export default function ManagerTrackingDashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTrack, setSelectedTrack] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const socket = socketService.initSocket(token ? token.replace('Bearer ', '') : null);
        socket.emit('joinManagerRoom');
        socket.on('activeOrderUpdate', (data) => {
            // update or insert order into state
            setOrders(prev => {
                const idx = prev.findIndex(o => String(o.id) === String(data.orderId));
                if (idx === -1) {
                    // can't fetch full details here; just prepend a small card
                    return [{ id: data.orderId, rider_latitude: data.latitude, rider_longitude: data.longitude, eta_minutes: data.eta_minutes, status: data.status, total_amount: 0, delivery_address: '' }, ...prev];
                }
                const copy = [...prev];
                copy[idx] = { ...copy[idx], rider_latitude: data.latitude, rider_longitude: data.longitude, eta_minutes: data.eta_minutes, status: data.status };
                return copy;
            });
        });

        loadActiveOrders();
        const interval = setInterval(loadActiveOrders, 15000);
        return () => {
            clearInterval(interval);
            if (socket) socket.off('activeOrderUpdate');
        };
    }, []);

    const loadActiveOrders = async () => {
        try {
            setLoading(false);
            const activeOrders = await ordersAPI.getActiveOrdersTracking();
            setOrders(Array.isArray(activeOrders) ? activeOrders : []);
        } catch (error) {
            console.error('Error loading active orders:', error);
        }
    };

    const openTrack = async (orderId) => {
        try {
            const pts = await ordersAPI.getTrackHistory(orderId);
            // normalize points to [lat,lng]
            const poly = pts.map(p => [parseFloat(p.latitude), parseFloat(p.longitude)]);
            setSelectedTrack({ orderId, poly });
        } catch (e) {
            console.error('Could not fetch track history', e);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'in_transit': return '#ef4444';
            case 'pickup': return '#f59e0b';
            case 'accepted': return '#3b82f6';
            case 'pending': return '#9ca3af';
            default: return '#6b7280';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'in_transit': return '🏍️';
            case 'pickup': return '📦';
            case 'accepted': return '✅';
            case 'pending': return '⏳';
            default: return '📍';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'in_transit': return 'In consegna';
            case 'pickup': return 'In ritiro';
            case 'accepted': return 'Accettato';
            case 'pending': return 'In sospeso';
            default: return status;
        }
    };

    const activeOrdersCount = orders.filter(o => ['pickup', 'in_transit'].includes(o.status)).length;
    const activeRidersCount = new Set(orders.map(o => o.rider_id).filter(Boolean)).size;
    const totalAmount = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

    if (loading && orders.length === 0) {
        return (
            <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>⏳</div>
                <div style={styles.emptyTitle}>Caricamento...</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.title}>🚀 Dashboard Tracciamento</div>
                <div style={styles.refreshIcon} onClick={loadActiveOrders}>🔄</div>
            </div>

            {/* Stats Bar */}
            <div style={styles.statsBar}>
                <div style={styles.statItem}>
                    <div style={styles.statIcon}>🏍️</div>
                    <div style={styles.statValue}>{activeRidersCount}</div>
                    <div style={styles.statLabel}>Rider Attivi</div>
                </div>
                <div style={styles.statItem}>
                    <div style={styles.statIcon}>📦</div>
                    <div style={styles.statValue}>{activeOrdersCount}</div>
                    <div style={styles.statLabel}>In Consegna</div>
                </div>
                <div style={styles.statItem}>
                    <div style={styles.statIcon}>💰</div>
                    <div style={styles.statValue}>€{totalAmount.toFixed(0)}</div>
                    <div style={styles.statLabel}>Totale</div>
                </div>
            </div>

            {/* Orders List */}
            {orders.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📭</div>
                    <div style={styles.emptyTitle}>Nessun ordine attivo</div>
                    <div style={styles.emptyText}>Non ci sono ordini in consegna al momento</div>
                </div>
            ) : (
                <div style={styles.listContainer}>
                    {orders.map((item) => (
                        <div
                            key={item.id}
                            style={{
                                ...styles.orderCard,
                                borderLeftColor: getStatusColor(item.status),
                            }}
                        >
                            {/* Card Header */}
                            <div style={styles.cardHeader}>
                                <div style={styles.statusBadge}>
                                    {getStatusIcon(item.status)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={styles.orderId}>Ordine #{item.id}</div>
                                    <div style={styles.riderInfo}>👤 Rider: {item.rider_name || `#${item.rider_id || '--'}`}</div>
                                </div>
                                <div style={{
                                    paddingLeft: '8px',
                                    paddingRight: '8px',
                                    paddingTop: '4px',
                                    paddingBottom: '4px',
                                    borderRadius: '6px',
                                    backgroundColor: getStatusColor(item.status) + '20',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    color: getStatusColor(item.status),
                                }}>
                                    {getStatusText(item.status)}
                                </div>
                            </div>

                            {/* Metrics Row */}
                            <div style={styles.metricsRow}>
                                <div>
                                    <div style={styles.metricLabel}>ETA</div>
                                    <div style={styles.metricValue}>{item.eta_minutes || '--'} min</div>
                                </div>
                                <div>
                                    <div style={styles.metricLabel}>Importo</div>
                                    <div style={styles.metricValue}>€{parseFloat(item.total_amount || 0).toFixed(2)}</div>
                                </div>
                                <div>
                                    <div style={styles.metricLabel}>Posizione</div>
                                    <div style={styles.metricValue}>
                                        {item.rider_latitude ? (
                                            `${parseFloat(item.rider_latitude).toFixed(4)}, ${parseFloat(item.rider_longitude).toFixed(4)}`
                                        ) : (
                                            '---'
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div style={styles.infoSection}>
                                <div style={styles.infoPair}>
                                    <div style={styles.infoLabel}>👤 Cliente:</div>
                                    <div style={styles.infoValue}>
                                        {item.customer_name || `ID#${item.user_id}`}
                                    </div>
                                </div>
                                <div style={styles.infoPair}>
                                    <div style={styles.infoLabel}>📍 Consegna:</div>
                                    <div style={styles.infoValue}>
                                        {item.delivery_address?.substring(0, 60) || 'Indirizzo non disponibile'}
                                    </div>
                                </div>
                            </div>

                            {/* Timeline */}
                            {item.received_at && (
                                <div style={{
                                    padding: '10px',
                                    backgroundColor: '#fef3c7',
                                    borderTop: '1px solid #fde68a',
                                    marginTop: '10px',
                                    borderRadius: '4px',
                                }}>
                                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#92400e' }}>
                                        Accettato: {new Date(item.received_at).toLocaleTimeString('it-IT', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            )}
                            <div style={{ marginTop: '10px' }}>
                                <button onClick={() => openTrack(item.id)}>Mostra storico tracciamento</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedTrack && (
                <div style={{ marginTop: 20 }}>
                    <h3>Storico tracciamento ordine #{selectedTrack.orderId}</h3>
                    <div style={{ height: 400 }}>
                        <MapContainer center={selectedTrack.poly[0] || [45.0, 9.0]} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Polyline positions={selectedTrack.poly} color="#ef4444" />
                            {selectedTrack.poly.map((p, idx) => (
                                <Marker key={idx} position={p}></Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>
            )}
        </div>
    );
}
