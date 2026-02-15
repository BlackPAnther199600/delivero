import React, { createContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CartContext = createContext();

const initialState = {
    items: [], // [{id, restaurantId, name, price, quantity, customizations: []}]
    restaurantId: null,
    totalPrice: 0,
    itemCount: 0,
};

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_TO_CART': {
            const { item, restaurantId, customizations } = action.payload;

            // Se cambio ristorante, svuoto il carrello
            if (state.restaurantId && state.restaurantId !== restaurantId) {
                return {
                    items: [{ ...item, customizations, quantity: 1, id: Math.random() }],
                    restaurantId,
                    totalPrice: item.price,
                    itemCount: 1,
                };
            }

            // Aggiungi o incrementa
            const existingIndex = state.items.findIndex(
                i => i.menuItemId === item.id &&
                    JSON.stringify(i.customizations) === JSON.stringify(customizations)
            );

            let newItems;
            if (existingIndex > -1) {
                newItems = [...state.items];
                newItems[existingIndex].quantity += 1;
            } else {
                newItems = [...state.items, {
                    ...item,
                    menuItemId: item.id,
                    customizations,
                    quantity: 1,
                    id: Math.random()
                }];
            }

            const totalPrice = newItems.reduce((sum, item) =>
                sum + (item.price * item.quantity), 0
            );

            return {
                items: newItems,
                restaurantId,
                totalPrice: parseFloat(totalPrice.toFixed(2)),
                itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
            };
        }

        case 'REMOVE_FROM_CART': {
            const newItems = state.items.filter(i => i.id !== action.payload);
            const totalPrice = newItems.reduce((sum, item) =>
                sum + (item.price * item.quantity), 0
            );

            return {
                items: newItems,
                restaurantId: newItems.length === 0 ? null : state.restaurantId,
                totalPrice: parseFloat(totalPrice.toFixed(2)),
                itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
            };
        }

        case 'UPDATE_QUANTITY': {
            const { id, quantity } = action.payload;
            if (quantity <= 0) {
                return cartReducer(state, { type: 'REMOVE_FROM_CART', payload: id });
            }

            const newItems = state.items.map(item =>
                item.id === id ? { ...item, quantity } : item
            );
            const totalPrice = newItems.reduce((sum, item) =>
                sum + (item.price * item.quantity), 0
            );

            return {
                ...state,
                items: newItems,
                totalPrice: parseFloat(totalPrice.toFixed(2)),
                itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
            };
        }

        case 'CLEAR_CART':
            return initialState;

        case 'LOAD_CART':
            return action.payload;

        default:
            return state;
    }
};

export const CartProvider = ({ children }) => {
    const [cart, dispatch] = useReducer(cartReducer, initialState);

    // Load cart from AsyncStorage on mount
    useEffect(() => {
        loadCart();
    }, []);

    // Save cart to AsyncStorage whenever it changes
    useEffect(() => {
        saveCart();
    }, [cart]);

    const loadCart = async () => {
        try {
            const saved = await AsyncStorage.getItem('cart');
            if (saved) {
                dispatch({ type: 'LOAD_CART', payload: JSON.parse(saved) });
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    };

    const saveCart = async () => {
        try {
            await AsyncStorage.setItem('cart', JSON.stringify(cart));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    };

    const addToCart = (item, restaurantId, customizations = []) => {
        dispatch({
            type: 'ADD_TO_CART',
            payload: { item, restaurantId, customizations }
        });
    };

    const removeFromCart = (id) => {
        dispatch({ type: 'REMOVE_FROM_CART', payload: id });
    };

    const updateQuantity = (id, quantity) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = React.useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};
