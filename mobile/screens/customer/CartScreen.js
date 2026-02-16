import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ScrollView,
} from 'react-native';
import { useCart } from '../../context/CartContext';

export default function CartScreen({ navigation }) {
    const { cart, removeFromCart, updateQuantity, clearCart } = useCart();

    const handleCheckout = () => {
        if (cart.items.length === 0) {
            Alert.alert('Carrello vuoto', 'Aggiungi alcuni prodotti prima di procedere');
            return;
        }

        // TODO: Implement checkout flow
        Alert.alert('Checkout', `Totale: €${cart.totalPrice.toFixed(2)}\n\nCheckout non implementato ancora`);
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
});
