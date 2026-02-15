import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
} from 'react-native';
import { makeRequest } from '../../services/api';
import { useCart } from '../../context/CartContext';

export default function RestaurantDetailScreen({ route, navigation }) {
    const { restaurant } = route.params;
    const { addToCart } = useCart();

    const [restaurantDetail, setRestaurantDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [productModal, setProductModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [customizationSelections, setCustomizationSelections] = useState({});
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (restaurant?.id) {
            loadRestaurantDetail();
        }
    }, [restaurant?.id]);

    const loadRestaurantDetail = async () => {
        try {
            setLoading(true);
            const data = await makeRequest(`/restaurants/${restaurant.id}`, { method: 'GET' });
            setRestaurantDetail(data);

            // Set first category as selected
            if (data.menu && data.menu.length > 0) {
                setSelectedCategory(data.menu[0].category_id);
            }
        } catch (error) {
            console.error('Error loading restaurant:', error);
            Alert.alert('Errore', 'Non è stato possibile caricare il ristorante');
        } finally {
            setLoading(false);
        }
    };

    const openProductModal = (product) => {
        setSelectedProduct(product);
        setCustomizationSelections({});
        setQuantity(1);
        setNotes('');
        setProductModal(true);
    };

    const closeProductModal = () => {
        setProductModal(false);
        setSelectedProduct(null);
    };

    const handleCustomizationChange = (customizationId, selectedOption) => {
        setCustomizationSelections(prev => ({
            ...prev,
            [customizationId]: selectedOption,
        }));
    };

    const handleAddToCart = () => {
        if (!selectedProduct) return;

        // Build customizations array
        const customizations = Object.entries(customizationSelections).map(
            ([custId, value]) => ({ id: custId, selected: value })
        );

        // Add to cart
        addToCart(selectedProduct, restaurant.id, customizations);

        Alert.alert('✅ Aggiunto!', `${selectedProduct.name} x${quantity} aggiunto al carrello`);
        closeProductModal();
    };

    const renderCategoryTab = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.categoryTab,
                selectedCategory === item.category_id && styles.categoryTabActive,
            ]}
            onPress={() => setSelectedCategory(item.category_id)}
        >
            <Text
                style={[
                    styles.categoryTabText,
                    selectedCategory === item.category_id && styles.categoryTabTextActive,
                ]}
            >
                {item.category}
            </Text>
        </TouchableOpacity>
    );

    const renderProductItem = ({ item }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => openProductModal(item)}
        >
            <View style={styles.productHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productDescription}>{item.description}</Text>
                </View>
                <Text style={styles.productPrice}>€{item.price?.toFixed(2)}</Text>
            </View>

            {item.allergens && item.allergens.length > 0 && (
                <Text style={styles.allergens}>⚠️ Contiene: {item.allergens.join(', ')}</Text>
            )}

            {item.customizations && item.customizations.length > 0 && (
                <Text style={styles.customizationHint}>
                    ⚙️ {item.customizations.length} personalizzazione disponibili
                </Text>
            )}
        </TouchableOpacity>
    );

    const renderCustomization = ({ item }) => (
        <View style={styles.customizationBlock}>
            <Text style={styles.customizationLabel}>{item.name}</Text>

            {item.type === 'radio' && (
                <View style={styles.customizationOptions}>
                    {item.options?.map((option, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={[
                                styles.optionButton,
                                customizationSelections[item.id] === option.name && styles.optionButtonSelected,
                            ]}
                            onPress={() => handleCustomizationChange(item.id, option.name)}
                        >
                            <Text
                                style={[
                                    styles.optionText,
                                    customizationSelections[item.id] === option.name && styles.optionTextSelected,
                                ]}
                            >
                                {option.name} {option.price > 0 && `+€${option.price.toFixed(2)}`}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {item.type === 'checkbox' && (
                <View style={styles.customizationOptions}>
                    {item.options?.map((option, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={[
                                styles.checkboxButton,
                                customizationSelections[item.id]?.includes(option.name) && styles.checkboxButtonSelected,
                            ]}
                            onPress={() => {
                                const selected = customizationSelections[item.id] || [];
                                const updated = selected.includes(option.name)
                                    ? selected.filter(s => s !== option.name)
                                    : [...selected, option.name];
                                handleCustomizationChange(item.id, updated);
                            }}
                        >
                            <Text style={styles.checkboxText}>
                                {customizationSelections[item.id]?.includes(option.name) ? '☑️' : '☐'} {option.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {item.type === 'text' && (
                <TextInput
                    style={styles.textInput}
                    placeholder={`Aggiungi ${item.name.toLowerCase()}`}
                    value={customizationSelections[item.id] || ''}
                    onChangeText={(text) => handleCustomizationChange(item.id, text)}
                />
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B00" />
                <Text style={styles.loadingText}>Caricamento menu...</Text>
            </View>
        );
    }

    const currentCategoryProducts = restaurantDetail?.menu?.find(
        m => m.category_id === selectedCategory
    )?.items || [];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>← Indietro</Text>
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.restaurantName}>{restaurantDetail?.name}</Text>
                    <Text style={styles.restaurantInfo}>
                        ⭐ {restaurantDetail?.rating?.toFixed(1)} • ⏱️ {restaurantDetail?.delivery_time}min • 💰 €{restaurantDetail?.delivery_cost?.toFixed(2)}
                    </Text>
                </View>
            </View>

            {/* Categories */}
            <FlatList
                data={restaurantDetail?.menu || []}
                renderItem={renderCategoryTab}
                keyExtractor={(item) => item.category_id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesList}
                contentContainerStyle={styles.categoriesContent}
            />

            {/* Products */}
            <FlatList
                data={currentCategoryProducts}
                renderItem={renderProductItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={true}
                style={styles.productsList}
                contentContainerStyle={styles.productsContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>😅 Nessun prodotto in questa categoria</Text>
                    </View>
                }
            />

            {/* Product Details Modal */}
            <Modal
                visible={productModal}
                transparent
                animationType="slide"
                onRequestClose={closeProductModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={closeProductModal}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>{selectedProduct?.name}</Text>
                            <View style={{ width: 30 }} />
                        </View>

                        <ScrollView style={styles.modalBody}>
                            {/* Product Info */}
                            <Text style={styles.modalDescription}>{selectedProduct?.description}</Text>
                            <Text style={styles.modalPrice}>
                                Prezzo: <Text style={styles.priceValue}>€{selectedProduct?.price?.toFixed(2)}</Text>
                            </Text>

                            {selectedProduct?.allergens && selectedProduct.allergens.length > 0 && (
                                <View style={styles.allergenBlock}>
                                    <Text style={styles.allergenLabel}>⚠️ Contiene allergeni:</Text>
                                    <Text style={styles.allergenText}>{selectedProduct.allergens.join(', ')}</Text>
                                </View>
                            )}

                            {/* Customizations */}
                            {selectedProduct?.customizations && selectedProduct.customizations.length > 0 && (
                                <View style={styles.customizationsSection}>
                                    <Text style={styles.customizationsTitle}>⚙️ Personalizzazioni</Text>
                                    <FlatList
                                        data={selectedProduct.customizations}
                                        renderItem={renderCustomization}
                                        keyExtractor={(item) => item.id.toString()}
                                        scrollEnabled={false}
                                    />
                                </View>
                            )}

                            {/* Notes */}
                            <View style={styles.notesSection}>
                                <Text style={styles.notesLabel}>📝 Note (opzionale)</Text>
                                <TextInput
                                    style={styles.notesInput}
                                    placeholder="Aggiungi note al tuo ordine..."
                                    multiline
                                    numberOfLines={3}
                                    value={notes}
                                    onChangeText={setNotes}
                                    placeholderTextColor="#999"
                                />
                            </View>

                            {/* Quantity Selector */}
                            <View style={styles.quantitySection}>
                                <Text style={styles.quantityLabel}>Quantità</Text>
                                <View style={styles.quantityControls}>
                                    <TouchableOpacity
                                        style={styles.quantityButton}
                                        onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                    >
                                        <Text style={styles.quantityButtonText}>−</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.quantityValue}>{quantity}</Text>
                                    <TouchableOpacity
                                        style={styles.quantityButton}
                                        onPress={() => setQuantity(quantity + 1)}
                                    >
                                        <Text style={styles.quantityButtonText}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>

                        {/* Add to Cart Button */}
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.addToCartButton}
                                onPress={handleAddToCart}
                            >
                                <Text style={styles.addToCartText}>
                                    🛒 Aggiungi al carrello • €{(selectedProduct?.price * quantity).toFixed(2)}
                                </Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
    },
    header: {
        backgroundColor: '#FF6B00',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    restaurantName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    restaurantInfo: {
        fontSize: 12,
        color: '#fff',
        opacity: 0.9,
        marginTop: 4,
    },
    categoriesList: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    categoriesContent: {
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    categoryTab: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginHorizontal: 4,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    categoryTabActive: {
        backgroundColor: '#FF6B00',
        borderColor: '#FF6B00',
    },
    categoryTabText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
    },
    categoryTabTextActive: {
        color: '#fff',
    },
    productsList: {
        flex: 1,
    },
    productsContent: {
        padding: 12,
        paddingBottom: 20,
    },
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    productName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    productDescription: {
        fontSize: 12,
        color: '#666',
        marginTop: 3,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FF6B00',
    },
    allergens: {
        fontSize: 10,
        color: '#d32f2f',
        marginTop: 6,
    },
    customizationHint: {
        fontSize: 11,
        color: '#2196f3',
        marginTop: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: 100,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    closeButton: {
        fontSize: 24,
        color: '#999',
        fontWeight: 'bold',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        textAlign: 'center',
    },
    modalBody: {
        flex: 1,
        padding: 16,
    },
    modalDescription: {
        fontSize: 13,
        color: '#666',
        marginBottom: 12,
    },
    modalPrice: {
        fontSize: 13,
        color: '#666',
        marginBottom: 12,
    },
    priceValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF6B00',
    },
    allergenBlock: {
        backgroundColor: '#ffebee',
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },
    allergenLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#d32f2f',
    },
    allergenText: {
        fontSize: 11,
        color: '#d32f2f',
        marginTop: 4,
    },
    customizationsSection: {
        marginBottom: 16,
    },
    customizationsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    customizationBlock: {
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    customizationLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    customizationOptions: {
        flexDirection: 'column',
        gap: 6,
    },
    optionButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f8f8f8',
    },
    optionButtonSelected: {
        borderColor: '#FF6B00',
        backgroundColor: '#fff3e0',
    },
    optionText: {
        fontSize: 12,
        color: '#666',
    },
    optionTextSelected: {
        color: '#FF6B00',
        fontWeight: '600',
    },
    checkboxButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f8f8f8',
    },
    checkboxButtonSelected: {
        borderColor: '#FF6B00',
        backgroundColor: '#fff3e0',
    },
    checkboxText: {
        fontSize: 12,
        color: '#333',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 12,
        backgroundColor: '#f8f8f8',
    },
    notesSection: {
        marginBottom: 16,
    },
    notesLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    notesInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 12,
        backgroundColor: '#f8f8f8',
        textAlignVertical: 'top',
    },
    quantitySection: {
        marginBottom: 16,
    },
    quantityLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        width: 120,
    },
    quantityButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    quantityButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF6B00',
    },
    quantityValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        minWidth: 40,
        textAlign: 'center',
    },
    modalFooter: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    addToCartButton: {
        backgroundColor: '#FF6B00',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    addToCartText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
    },
});
