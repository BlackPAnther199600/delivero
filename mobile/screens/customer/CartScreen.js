import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ScrollView,
    Modal,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { ordersAPI, paymentsAPI } from '../../services/api';
import * as Location from 'expo-location';

export default function CartScreen({ navigation }) {
    const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
    const [checkoutVisible, setCheckoutVisible] = useState(false);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [placingOrder, setPlacingOrder] = useState(false);

    const handleCheckout = () => {
        if (cart.items.length === 0) {
            Alert.alert('Carrello vuoto', 'Aggiungi alcuni prodotti prima di procedere');
            return;
        }

        setCheckoutVisible(true);
    };

    const tryGetDeliveryCoords = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return { delivery_latitude: null, delivery_longitude: null };
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            return {
                delivery_latitude: loc.coords.latitude,
                delivery_longitude: loc.coords.longitude,
            };
        } catch (e) {
            return { delivery_latitude: null, delivery_longitude: null };
        }
    };

    const confirmCheckout = async () => {
        if (!deliveryAddress || !deliveryAddress.trim()) {
            Alert.alert('Indirizzo mancante', 'Inserisci un indirizzo di consegna');
            return;
        }
        if (!cart.items?.length) {
            Alert.alert('Carrello vuoto', 'Aggiungi alcuni prodotti prima di procedere');
            return;
        }

        setPlacingOrder(true);
        try {
            const coords = await tryGetDeliveryCoords();

            const orderPayload = {
                restaurantId: cart.restaurantId || null,
                items: cart.items.map(i => ({
                    id: i.id,
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity,
                    customizations: i.customizations || [],
                })),
                totalAmount: cart.totalPrice,
                deliveryAddress: deliveryAddress.trim(),
                ...coords,
            };

            const created = await ordersAPI.create(orderPayload);
            const orderId = created?.order?.id;
            if (!orderId) {
                throw new Error('Order id missing from server response');
            }

            if (paymentMethod === 'cash') {
                await paymentsAPI.createCashPayment(orderId);
                Alert.alert('Ordine creato', 'Pagamento in contanti alla consegna');
            } else {
                try {
                    const stripeRes = await paymentsAPI.createStripePayment(orderId);
                    Alert.alert('Stripe', 'Pagamento Stripe creato (integrazione UI in arrivo)');
                } catch (e) {
                    const msg = e?.message || e?.error || 'Errore Stripe';
                    Alert.alert('Stripe non disponibile', msg);
                }
            }

            clearCart();
            setCheckoutVisible(false);
            setDeliveryAddress('');
            setPaymentMethod('cash');
            navigation.navigate('OrderTracking', { orderId });
        } catch (e) {
            Alert.alert('Errore checkout', e?.message || 'Errore');
        } finally {
            setPlacingOrder(false);
        }
    };

    const renderCartItem = ({ item }) => (
        <View style={styles.cartItem}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.customizations && item.customizations.length > 0 && (
                    <Text style={styles.customizationList}>
                        • {item.customizations.map(c => c.selected).join(', ')}
                    </Text>
                )}
                <Text style={styles.itemPrice}>€{(item.price * item.quantity).toFixed(2)}</Text>
            </View>

            <View style={styles.quantityControls}>
                <TouchableOpacity
                    style={styles.quantBtn}
                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                >
                    <Text style={styles.quantBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity
                    style={styles.quantBtn}
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                >
                    <Text style={styles.quantBtnText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => {
                        removeFromCart(item.id);
                        Alert.alert('Rimosso', `${item.name} rimosso dal carrello`);
                    }}
                >
                    <Text style={styles.removeBtnText}>🗑️</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (cart.items.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>🛒</Text>
                    <Text style={styles.emptyTitle}>Carrello Vuoto</Text>
                    <Text style={styles.emptySubtitle}>Aggiungi prodotti dai ristoranti</Text>
                    <TouchableOpacity
                        style={styles.continueShoppingBtn}
                        onPress={() => navigation.navigate('Restaurants', { screen: 'Restaurants' })}
                    >
                        <Text style={styles.continueShoppingText}>🍽️ Continua lo Shopping</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>🛒 Carrello ({cart.itemCount})</Text>
                {cart.restaurantId && (
                    <TouchableOpacity
                        style={styles.clearCartBtn}
                        onPress={() =>
                            Alert.alert('Svuota carrello?', '', [
                                { text: 'Annulla' },
                                {
                                    text: 'Svuota',
                                    onPress: () => {
                                        clearCart();
                                        Alert.alert('Fatto', 'Carrello svuotato');
                                    },
                                    style: 'destructive',
                                },
                            ])
                        }
                    >
                        <Text style={styles.clearCartText}>🗑️ Svuota</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Items List */}
            <FlatList
                data={cart.items}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.id.toString()}
                style={styles.itemsList}
                contentContainerStyle={styles.itemsContent}
            />

            {/* Summary */}
            <View style={styles.summary}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotale:</Text>
                    <Text style={styles.summaryValue}>€{cart.totalPrice.toFixed(2)}</Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryRowTotal]}>
                    <Text style={styles.summaryLabelTotal}>Totale:</Text>
                    <Text style={styles.summaryValueTotal}>€{cart.totalPrice.toFixed(2)}</Text>
                </View>
            </View>

            {/* Checkout Button */}
            <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={handleCheckout}
            >
                <Text style={styles.checkoutText}>💳 Procedi al Checkout</Text>
            </TouchableOpacity>

            <Modal
                visible={checkoutVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setCheckoutVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Checkout</Text>

                        <Text style={styles.modalLabel}>Indirizzo di consegna</Text>
                        <TextInput
                            value={deliveryAddress}
                            onChangeText={setDeliveryAddress}
                            placeholder="Es: Via Roma 10, Roma"
                            style={styles.modalInput}
                        />

                        <Text style={styles.modalLabel}>Metodo di pagamento</Text>
                        <View style={styles.payRow}>
                            <TouchableOpacity
                                style={[styles.payBtn, paymentMethod === 'cash' && styles.payBtnActive]}
                                onPress={() => setPaymentMethod('cash')}
                                disabled={placingOrder}
                            >
                                <Text style={[styles.payBtnText, paymentMethod === 'cash' && styles.payBtnTextActive]}>Contanti</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.payBtn, paymentMethod === 'stripe' && styles.payBtnActive]}
                                onPress={() => setPaymentMethod('stripe')}
                                disabled={placingOrder}
                            >
                                <Text style={[styles.payBtnText, paymentMethod === 'stripe' && styles.payBtnTextActive]}>Carta (Stripe)</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalSummary}>
                            <Text style={styles.modalSummaryText}>Totale: €{cart.totalPrice.toFixed(2)}</Text>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalActionBtn, styles.modalCancelBtn]}
                                onPress={() => setCheckoutVisible(false)}
                                disabled={placingOrder}
                            >
                                <Text style={styles.modalCancelText}>Annulla</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalActionBtn, styles.modalConfirmBtn]}
                                onPress={confirmCheckout}
                                disabled={placingOrder}
                            >
                                {placingOrder ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.modalConfirmText}>Conferma</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    header: {
        backgroundColor: '#FF6B00',
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    clearCartBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    clearCartText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    emptyIcon: {
        fontSize: 60,
        marginBottom: 12,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#999',
        marginBottom: 24,
    },
    continueShoppingBtn: {
        backgroundColor: '#FF6B00',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    continueShoppingText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    itemsList: {
        flex: 1,
    },
    itemsContent: {
        padding: 12,
        paddingBottom: 20,
    },
    cartItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderLeftWidth: 4,
        borderLeftColor: '#FF6B00',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    customizationList: {
        fontSize: 11,
        color: '#666',
        marginTop: 4,
        fontStyle: 'italic',
    },
    itemPrice: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#FF6B00',
        marginTop: 6,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    quantBtn: {
        width: 28,
        height: 28,
        borderRadius: 6,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF6B00',
    },
    quantity: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        minWidth: 30,
        textAlign: 'center',
    },
    removeBtn: {
        width: 28,
        height: 28,
        borderRadius: 6,
        backgroundColor: '#ffebee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeBtnText: {
        fontSize: 14,
    },
    summary: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryRowTotal: {
        paddingTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 8,
        marginBottom: 0,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#666',
    },
    summaryValue: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
    },
    summaryLabelTotal: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    summaryValueTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF6B00',
    },
    checkoutBtn: {
        backgroundColor: '#FF6B00',
        marginHorizontal: 16,
        marginVertical: 12,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    checkoutText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        padding: 16,
    },
    modalCard: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    modalLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        marginTop: 10,
        marginBottom: 6,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#fafafa',
    },
    payRow: {
        flexDirection: 'row',
        gap: 10,
    },
    payBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    payBtnActive: {
        borderColor: '#FF6B00',
        backgroundColor: '#FFF0E6',
    },
    payBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#666',
    },
    payBtnTextActive: {
        color: '#FF6B00',
    },
    modalSummary: {
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    modalSummaryText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        marginTop: 14,
    },
    modalActionBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalCancelBtn: {
        backgroundColor: '#f1f5f9',
    },
    modalConfirmBtn: {
        backgroundColor: '#FF6B00',
    },
    modalCancelText: {
        fontWeight: '800',
        color: '#334155',
    },
    modalConfirmText: {
        fontWeight: '800',
        color: '#fff',
    },
});
