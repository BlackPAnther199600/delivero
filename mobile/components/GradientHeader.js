import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Componente GradientHeader con expo-linear-gradient
 * Sostituisce il backgroundColor solido con un gradiente elegante
 */
const GradientHeader = ({ title, rightButton, onRightPress }) => {
    return (
        <LinearGradient
            colors={['#FF6B00', '#FF8C00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
                paddingTop: 16,
                paddingBottom: 16,
                paddingHorizontal: 16,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}
        >
            <Text
                style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: '#fff',
                }}
            >
                {title}
            </Text>
            {rightButton && (
                <TouchableOpacity onPress={onRightPress}>
                    <Text style={{ fontSize: 20 }}>{rightButton}</Text>
                </TouchableOpacity>
            )}
        </LinearGradient>
    );
};

export default GradientHeader;
